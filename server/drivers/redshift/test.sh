#!/bin/bash
docker-compose down
docker-compose up -d
sleep 5
npx mocha ./test.js
docker-compose down