---
title: "Installation & Administration"
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



## A Realistic Example:  

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



## Running as a Service

If you are running SQLPad for your team, chances are you'd like SQLPad to start up when your server boots up, and stay running if an unhandled exception occurs. How this is accomplished largely depends on the operating system you are running. 

Full disclosure - this isn't my area of expertise so if anyone knows of any better options or better practices, please let me know at rick.bergfalk@gmail.com.

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

These settings are configured by either adding a configuration key in the configuration page, or by setting an environment variable (depending on the behavior or feature being modified).


### Change query result record limit

To change the maximum records returned by a SQL query, add a new item with key ```queryResultMaxRows``` and set the value to the max number of rows you would like returned. If the key is missing or set to a non-number, SQLPad will return a maximum of 50,000 rows.


### Disable CSV (and now XLSX) downloads

To disable CSV downloads, visit the "Configuration" page and add a new item with key ```allowCsvDownload``` and value ```false```. If the key is missing or set to any other value, CSV downloads will be enabled.


### Show Schema Copy Buttons

Some databases (like Vertica) require the fully qualified table and column names within a SQL statement. This can be a hassle to remember or type when you have long and complicated names. For convenience, you can enable fully-qualified-name copy buttons that appear in the schema sidebar. When hovering over an item in the schema tree, a copy button will appear. Click it and the schema name, table name, and column name will be copied to your clipboard.

To enable the schema copy buttons, add a new configuration item with key ```showSchemaCopyButton``` with value true.


### Google OAuth Authentication

Google OAuth authentication can be enabled by setting environment variables ```GOOGLE_CLIENT_ID```, ```GOOGLE_CLIENT_SECRET```, AND ```PUBLIC_URL```. The plain old regular authentication can be disabled by setting environment variable ```DISABLE_USERPASS_AUTH```. 


### Post Query to Slack When Saved

A SQLPad query can be posted to a Slack webhook when saved. To enable, create a configuration item with key ```slackWebhook``` and set the value to a Slack incoming webhook URL.


### Whitelist Domains for User Administration

An entire domain can be whitelisted for username administration by setting enviornment variable ```WHITELISTED_DOMAINS```

### Systemd socket activation

To use systemd socket activation add ```--systemd-socket``` flag. For more information see [this pull request](https://github.com/rickbergfalk/sqlpad/pull/185).
