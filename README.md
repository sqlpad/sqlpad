# SqlPad

A Node.js web app that allows you to write SQL and get the result against a database. Postgres, MySQL, and SQL Server supported.

SqlPad is meant to be run on an internal network, for a single team. All connections added to the app can be used by all individuals with access to the SqlPad server. All queries written can be run and edited by everyone on the server. 

If you want to be bold and daring, you can expose your SqlPad instance to the outside world. Please make sure you fully understand the risks associated with doing this and use SSL.



## HEY IS SOMEONE OUT THERE USING THIS?!  

If so, please let me know what you think! (either via github issue or email)

npm says people are downloading this. Maybe the downloads are just robots, but it'd be really cool and exciting if real humans are using this already :)



## Installation & Usage

First, install Node.js if you haven't already.

Once node is installed, open up a command line and run

```
npm install sqlpad -g
```

This will install the SqlPad command line utility to run a SqlPad server. 

To run a SqlPad Server, type the following from the command line:

```
sqlpad --admin your.email@company.com --passphrase secret-encryption-phrase
```

The **passphrase** argument is optional, but recommended. The passphrase provided is used to encrypt database connection usernames and passwords, and cookie encryption. If not provided, SqlPad will use the default to at least prevent usernames and passwords from being stored in plaintext. 

If a passphrase is ever changed or forgotten, you'll need to re-add the connection usernames and passwords to each database connection. 

The **admin** parameter specifies an email address to whitelist as a SqlPad administrator. SqlPad admins can add connections, whitelist other email addresses so other people can join, and give people admin access. The admin email address only needs to be provided once, but it won't hurt to keep providing it (it'll ensure that email is always an admin).

By default SqlPad will save its database to the current user's home directory, in a sqlpad folder. You can override the database save location by specifying different folder path using the **db** flag. 

```
sqlpad --db c:/sqlpad/ --passphrase secret-encryption-phrase
```

```
sqlpad --db ./relative/folder --passphrase secret-encryption-phrase
```

Lastly, SqlPad will run on **port** 80 by default. You can change this if you'd like:

```
sqlpad --port 3000 --db c:/sqlpad/ --passphrase secret-encryption-phrase
```

Once you have a SqlPad running, you can sign up (assuming you've whitelisted your email address with the --admin flag) at http://localhost/signup.



## Contributing & Future of this Project

I started this project as a personal-side project. I don't know how far I'll take it, how much I'll support it, if it's useful to anyone, or what features I'll eventually add to it.

Right now I feel like this needs a lot of refactoring and cleaning up before anyone dives into the code. 

But if you really want to dig in... 



## License 

MIT
