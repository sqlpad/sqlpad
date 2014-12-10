# SqlPad

A Node.js web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, and SQL Server.

SqlPad is meant to be run on an internal network for a single team. All connections added to the app can be used by all individuals with access to the SqlPad server. All queries written can be run and edited by everyone on the server. 

If you want to be bold and daring, you can expose your SqlPad instance to the outside world. Please make sure you fully understand the risks associated with doing this and use SSL.



## Installation & Usage

First, install Node.js if you haven't already.

Once node is installed, open up a command line and run

```sh
npm install sqlpad -g
```

This will install the SqlPad command line utility to run a SqlPad server. 

To run a SqlPad Server, type the following from the command line:

```sh
sqlpad
```

To get help:

```sh
sqlpad --help
```



## Once SqlPad is Running

Once SqlPad is running, you create an initial admin account by navigationg to http://localhost/signup. Once an initial admin account has been created, all future users must be whitelisted by an admin within the users page.

If for whatever reason you lose admin rights, and the last-admin-standing won't give you admin rights back, you can reinstate them to yourself by running

```sh
sqlpad --admin youraddress@email.com
```


## A real-world example:  

```sh
sqlpad --dir c:/sqlpad/ --port 3000 --passphrase secret-encryption-phrase
```

The **dir** argument specifies where to keep the sqlpad query/user/connection files. If not provided, SqlPad will put its files in the user's home directory under /sqlpad/db.

The **port** argument specifies the port on which SqlPad should run. The default is port 80, but that may not be available.

The **passphrase** argument is used to encrypt database connection usernames and passwords, and cookie encryption. If not provided, SqlPad will use the default to at least prevent usernames and passwords from being stored in plaintext. 

If a passphrase is ever changed or forgotten, you'll need to re-add the connection usernames and passwords to each database connection. 

If you ever want to save the arguments you are passing in so you don't have to keep typing them over and over, you can save them by passing in the ```--save``` argument.

```sh
sqlpad --dir ./sqlpad/ --port 3000 --passphrase secret-encryption-phrase --save
```

Then the next time you can simply run...

```sh
sqlpad
``` 

...and Sqlpad will use directory ./sqlpad, on port 3000, with the proper encryption passphrase.

These settings can be forgotten by running 

```sh
sqlpad --forget
```


## Contributing & Future of this Project

I started this project as a personal-side project so I could run queries from a chromebook and visualize the results with some simple visualizations. I have no intention on taking this application further than that, although I wouldn't be surprised if I change my mind about that.

I will merge any pull requests for feature additions so long as  

- an issue is opened in advance to get permission
- the pull request is backwards compatible with the current version of SqlPad

If the pull request if for a bug fix no advance permission is necessary.



## License 

MIT
