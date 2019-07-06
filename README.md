<h1 align="center">
  Tiles API
</h1>

![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/fairbanksio/tiles-api.svg)
![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/fairbanksio/tiles-api.svg)
![GitHub top language](https://img.shields.io/github/languages/top/Fairbanks-io/tiles-api.svg)
![Docker Pulls](https://img.shields.io/docker/pulls/fairbanksio/tiles-api.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/Fairbanks-io/tiles-api.svg)

Backend API for [Tiles](https://github.com/Fairbanks-io/tiles-client); helps with creating/saving boards, authenticating users and managing chatrooms.

## Getting Started

#### Prerequisites

The following will need to be installed before proceeding:

- Node v8+
- Mongo DB
- Nginx
- [Tiles Client](https://github.com/Fairbanks-io/tiles-client)

#### Clone the Project

```sh
# Clone it
git clone https://github.com/Fairbanks-io/tiles-api.git
cd tiles-api/
```

#### Install & Launch the Backend API

```sh
npm install
npm start
```

The Tiles API should now be serving requests at http://localhost:4001

#### Nginx

The following is an Nginx configuration block for both frontend and backend:

```sh
server {
    listen               443  ssl;
    ssl                  on;
    ssl_certificate fullchain.pem;
    ssl_certificate_key privkey.pem;
    server_name    tiles.mysite.io;
    large_client_header_buffers 4 8k;
    location / {
        proxy_pass      http://127.0.0.1:3000/;
        # Upgrade for Websockets
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    location /socket.io/ {
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_pass http://127.0.0.1:4001/socket.io/;
    }
    location /tiles {
        proxy_pass      http://127.0.0.1:4001/tiles;
        # Upgrade for Websockets
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### Docker

The Tiles API can also be launched via Docker using the following example:

```sh
docker run -d --name tiles-api -e MongoURI='mongodb://username:pass@host.io:27017/database' -p 4001:4001 -v "$PWD":/usr/src/app -w /usr/src/app node:8 "yarn" "start"```
