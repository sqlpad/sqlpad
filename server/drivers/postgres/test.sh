#!/bin/bash
docker-compose down
docker-compose up -d postgres
sleep 5
npx mocha ./test.js
docker-compose down