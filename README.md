# SqlPad

A Node.js web app that allows you to write SQL and get the result against a database. Postgres, MySQL, and SQL Server supported.

SqlPad is meant to be run on an internal network, for a single team. All connections added to the app can be used by all individuals with access to the SqlPad server. All queries written can be run and edited by everyone on the server. 

If you want to be bold and daring, you can expose your SqlPad instance to the outside world. Please make sure you fully understand the risks associated with doing this. 


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


## TODO

### Done
[x] add toggle for admins in /users  
[x] can't unadmin one's self (prevents last-admin-standing scenario)  
[x] only show/permit admin links for admins  
[x] CLI tooling (db folder, admin, encryption phrase, port)  
[x] temp csv cache file for downloads  
[x] upgrade to express 4.0 to get rid of annoying messages  
[x] save menu button works  

### Before considered "done"
[x] query clone link to work  
[ ] query clone link to only be available if query has been saved
[ ] add visualizations  
[ ] about/thank-you page  
[ ] github pages on what/how/why  
[x] SQL Editor: refresh schema on connection change  
[x] SQL Editor: prompt to choose a connection if one hasn't been chosen  
[ ] clean up various dates being displayed to appropriate values  
[ ] default db location should be user's HOME directory/sqlpad.  
[ ] --dev flag for console.logging

### Optional
[x] make routes separate js files (broken up by related chunks)  
[ ] clean up and organize front end js. (split into separate js files?)  
[ ] connection: window colors  
[ ] connection: application-enforced read only option  
[ ] connection: prefer SSL (for postgres --> heroku)  
[ ] SQL Editor: Excel file download  
[ ] SQL Editor: download filename uses query name  


## Contributing

Pull requests welcome! However, contributor beware: 

I wrote this without much planning, so some parts of this application feel like a big ball of mud. 

Indentation is with tabs/4 spaces. And I use windows. And the Zed editor. And semicolons. 

This said, feel free to contribute as you want

## TODO

store a config file in filesystem. it has multiple profiles.

'sqlpad'
- if no profile is found, start setup wizard.
- if 1 profile is found, run that one
- if >1 profile is found, prompt for which one to start

'sqlpad --setup'
list profiles. options are (edit profile, create new)

'sqlpad --profile accounting'
runs sqlpad using the accounting profile/instance


function getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

https://github.com/dominictarr/rc