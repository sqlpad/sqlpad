# Docker Examples

See individual directories for specific examples. Want to expand on these examples or add your own for a specific database? Pull requests welcome!

## Important note about data and docker

Unless data volumes are mapped outside the containers, you will lose data inside SQLPad and various database when the containers are shutdown and removed.

If you are using these examples as a starter for something you are working on, you may want to ensure your data is safe before getting into any serious work.

## Running from command line

```sh
# The most minimal example, mapping port 3000 to local docker host
docker run -p 3000:3000 sqlpad/sqlpad:latest

# volume and env vars being set and run in background
# directory `~/docker-volumes` must be shared with docker to work
docker run --name sqlpad --env SQLPAD_DEBUG=TRUE -p 127.0.0.1:3000:3000 --volume ~/docker-volumes/sqlpad-postgres:/var/lib/sqlpad --detach sqlpad/sqlpad:latest

# To list running docker images
docker ps

# To stop running docker image by name. (otherwise use container id from `docker ps`)
docker stop sqlpad
```
