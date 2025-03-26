#!/bin/bash

docker build -f Dockerfile-build -t cefriel/pko-rapid-triples .

CONTAINER_ID=$(docker run -d cefriel/pko-rapid-triples)
docker cp $CONTAINER_ID:/usr/share/nginx/html/pko-rapid-triples/. ./dist/

docker stop $CONTAINER_ID
