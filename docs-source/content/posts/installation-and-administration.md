---
title: "Installation & Administration"
date: 2018-01-28T11:51:31-05:00
---

## Installation

SQLPad can be installed on Mac, Linux, and Windows.

In order to install SQLPad, you'll first need to install [Node.js](https://nodejs.org/). 

Once node is installed, open up a command line and run

`npm install sqlpad -g`

This will install the SQLPad command line utility used to run a SQLPad server. 

To spin up a SQLPad Server, type the following from the command line:

`sqlpad`

To get help and see parameters:

`sqlpad --help`


### A Realistic Example:  

`sqlpad --dir c:/sqlpad/ --port 3000 --passphrase secret-encryption-phrase`

The **dir** argument specifies where to keep the sqlpad query/user/connection files. If not provided, SQLPad will put its files in the user's home directory under /sqlpad/db.

The **port** argument specifies the port on which SQLPad should run. The default is port 80, but that may not be available.

The **passphrase** argument is used to encrypt database connection usernames and passwords, and cookie encryption. If not provided, SQLPad will use the default to at least prevent usernames and passwords from being stored in plaintext. 

If a passphrase is ever changed or forgotten, you'll need to re-add the connection usernames and passwords to each database connection. 

If you ever want to save the arguments you are passing in so you don't have to remember them, you can save them by passing in the ```--save``` argument.

`sqlpad --dir ./sqlpad/ --port 3000 --passphrase secret-encryption-phrase --save`

Then the next time you can simply run...

`sqlpad` 

...and Sqlpad will use directory ./sqlpad, on port 3000, with the proper encryption passphrase.

These settings can be forgotten by running 

`sqlpad --forget`



## Administration

Once SQLPad is running, create an initial admin account by navigating to [http://localhost/signup](http://localhost/signup). 

Once an initial admin account has been created, all future users must be whitelisted by an admin within the users page. Other users may also be given admin rights, allowing them to add/edit database connections and whitelist/modify/remove SQLPad users.

If for whatever reason you lose admin rights, and the last-admin-standing won't give you admin rights back, you can reinstate them to yourself by running

`sqlpad --admin yourEmailAddress@domain.com`


## Updating

If installed via npm, SQLPad may be updated by running ```npm install sqlpad -g```. 

To install a specific version of SQLPad, a version may be specified by running ```npm install sqlpad@2.1.3 -g```. This is useful to rollback to a previous version.

Prior to updating, you may want to take a backup of SQLPad's database. By default these files are located under the users home directory `~/sqlpad/db`, but you may have changed the location using the --dir flag when running SQLPad. 


## Running as a Service

If you are running SQLPad for your team, chances are you'd like SQLPad to start up when your server boots up, and stay running if an unhandled exception occurs. How this is accomplished largely depends on the operating system you are running. 

Full disclosure - this isn't my area of expertise so if anyone knows of any better options please send a github issue or pull request.

**Windows**: Use [nssm](http://nssm.cc/) to create a windows service

**Ubuntu**: Create a job conf file for use with [upstart](http://upstart.ubuntu.com/getting-started.html). 

Here's a script I've gotten to work - but again not sure if this is good practice or if there's a better way to go about it:

```
description "sqlpad"
author "yourname <your@email.com>"

start on runlevel [2345]
stop on shutdown

# I used -u to change the user it executes with, 
# which means by default SQLPad uses that user's home directory 
# for its database files
exec sudo -u UserAccountToUse /usr/bin/sqlpad --port 3000

respawn
```

**Mac**: ??? 

**Platform agnostic**: Clone or download the GitHub repository and use [forever](https://github.com/foreverjs/forever) to run server.js directly. (The downside to this though is that you miss out on updating SQLPad with the easy npm install command, and you still have to run the forever command on startup)



## Configuration

Beyond SQLPad's initial setup options (port, file location, passphrase), there are a few areas where you can opt-in, opt-out, or change the default limits.

These settings are now listed and documented within SQLPad itself on the configuration page (available to administrator accounts).


### Disable NPM Update Check

By default SQLPad will call npmjs.com every so often to check to see if an update is available. 
This may be disabled within the configuration page.


### Google OAuth Authentication

Google OAuth authentication can be enabled by setting the necessary environment variables and configuring your Google API config appropriately.

First you'll need to set up your Google API oauth client credentials config. 

For OAuth to work be sure to enable the Google+ API for your Google API project. If this isn't enabled it might be why the user profile isn't being fetched.

Next you'll need to set your JavaScript origins and redirect URIs. If you're testing locally, that might look like the below. Remember to consider the base url/mounting path if SQLPad is not running at the root of the domain.

- `Authorized JavaScript origins`: `http://localhost:8080`
- `Authorized redirect URIs`: `http://localhost:8080/auth/google/callback`

Once the Google API config is set, configure the required settings in SQLPad.
For OAuth to be useful this usually involves the following:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `PUBLIC_URL`=`http://localhost`
- `DISABLE_USERPASS_AUTH`=`true` (optional - disables plain local user logins)


### Whitelist Domains for User Administration

An entire domain can be whitelisted for username administration by setting enviornment variable ```WHITELISTED_DOMAINS```. This may be particularly useful in combination with OAuth. 


### Systemd socket activation

To use systemd socket activation add ```--systemd-socket``` flag. For more information see [this pull request](https://github.com/rickbergfalk/sqlpad/pull/185).
