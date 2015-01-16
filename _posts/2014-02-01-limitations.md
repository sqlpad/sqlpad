---
title: "Limitations"
bg: purple  #defined in _config.yml, can use html color like '#0fbfcf'
color: white   #text color
fa-icon: ban
---

## Limitations

SqlPad is not technically as finished as you think.

Be sure to not forget your password to your user account. As of now there's no way to reset it.

Even though username is based on an email address, in no way does SqlPad have the capability to email that address.

Be sure not to query with 2 columns returned of the same name. Some SQL systems can handle this. SqlPad can't.

Every query run is done with a new session/connection, so keep that in mind if you use variables and temp tables and split up your SQL executions. If this doesn't make any sense to you just forget I said anything you probably won't be impacted by it.

There isn't a way to tell the postgres connection in SqlPad to prefer SSL. There's a way to do it in code, I just haven't exposed it in SqlPad.

All the query results get sent back to the browser. So really big queries might break things. Slickgrid will likely amaze you in how much data it can actually handle however.

Have you hit a weird limitation you'd like me and others to know about? Feel free to [add a GitHub issue about it](https://github.com/rickbergfalk/sqlpad/issues). 