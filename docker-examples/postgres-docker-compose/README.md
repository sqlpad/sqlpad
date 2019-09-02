# Postgres + SQLPad docker compose example

Ensure you have docker and docker-compose installed.

Open command line in this directory containing the docker-compose file then type the following:

```sh
# pull/download docker images in compose file
# This will be done automatically, but can be useful to
# ensure images are up-to-date if using ":latest" tag for SQLPad like this example does
docker-compose pull

# Then to start sqlpad and postgres do
docker-compose up
```

When the containers are up and running you'll have postgres and sqlpad running, with sqlpad mapped to local port 3000.

Open a browser tab and to go `http://localhost:3000`.

Click on "sign up" and enter in an email and password you desire for your SQLPad admin account. Then sign in.

Once logged into SQLPad, you can create a connection to the postgres instance inside the docker compose network. Click the three-dot icon on upper right, click `Connections` then `Add connections`.

Input the following:

- Name: anything you'd like to identify the connection
- Driver: Postgres
- Host: `db` (this is the service name inside docker-compose file)
- Database: `sqlpad` (automatically created because of POSTGRES_USER env variable)
- Database username: `sqlpad`
- Database password: `sqlpad`

At this point you can ensure the connection succeeds by clicking `Test`. A green check mark will appear on button if successful.

Click save.

You can now select the connection in the main query editor interface. And run some SQL:

```sql
create table test (id int, words text);

insert into test values (1, 'hello'), (2, 'sqlpad');

select * from test;
```

Add more connections to other databases.
