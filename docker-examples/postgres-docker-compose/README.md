# Postgres + SQLPad docker compose example

Ensure you have docker and docker-compose installed.

Open command line in this directory containing the docker-compose file then type the following:

```sh
# pull/download docker images in compose file
docker-compose pull

# If using `build` instead of `image` build the SQLPad image
docker-compose build

# Then to start sqlpad and postgres do
docker-compose up
```

When the containers are up and running you'll have postgres and sqlpad running, with sqlpad mapped to local port 3000.

Open a browser tab and to go `http://localhost:3000`.
