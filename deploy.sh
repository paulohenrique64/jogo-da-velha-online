#!/bin/bash
git stash
git pull origin prod

echo "# server 
PORT=3000

# production
BASE_URL=https://paulodev.me/jogodavelha/
BASE_URL_PATH=/jogodavelha/

# database
MONGODB_USER=root
MONGODB_PASSWORD=paulo123
MONGODB_DATABASE=tictactoe
MONGODB_LOCAL_PORT=27017
MONGODB_DOCKER_PORT=27017
DB_URL=mongodb://root:paulo123@mongodb_tictactoe:27017

# jwt
JWT_SECRET=sjbfjdsgjdghldrgblhrgh4353rtbihdyxyuvdgy848" > .env

docker-compose build
docker-compose up -d