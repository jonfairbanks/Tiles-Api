docker build -t bsord/tiles-api .
docker run -d -p 4001:4001 --name 'Tiles-api' --restart unless-stopped bsord/tiles-api

1.  `git clone`
2.  `yarn install`
3.  `docker run -d --name tiles-api-dev -e MongoURI='mongodb://username:pass@host.io:27017/database' -p 4001:4001 -v "$PWD":/usr/src/app -w /usr/src/app node:8 "yarn" "start"`
