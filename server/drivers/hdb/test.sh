#!/bin/bash

echo "Follow special instructions commented in this file"
npx mocha ./test.js
exit 

# MANUAL INSTRUCTIONS

# If using Docker for Mac
# Before running script/docker-compose up -d, type the following in the terminal
# 
screen ~/Library/Containers/com.docker.docker/Data/com.docker.driver.amd64-linux/tty
sysctl -w net.ipv4.ip_local_port_range="40000 60999" 
sysctl -w fs.file-max=20000000
sysctl -w vm.max_map_count=135217728
sysctl -w net.ipv4.ip_forward=1
exit

# Then press
# ctrl+d 

# Bring up HANA in the background container with 
docker-compose up -d

# Follow the logs. Make sure HANA is entirely up and running
docker-compose logs --follow

# Once HANA is fully started, exit the logs
# ctrl+c

# Run tests, either with this script, or by running
npx mocha ./test.js

# Finally, shut down HANA
docker-compose down