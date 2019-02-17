docker build -t bsord/tiles-api .
docker run -d -p 4001:4001 --name 'Tiles-api' --restart unless-stopped bsord/tiles-api
