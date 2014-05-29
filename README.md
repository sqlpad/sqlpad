# SqlPad

A Node.js web app that allows you to write SQL and get the result against a database. Postgres, MySQL, and SQL Server supported.


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
[ ] add visualizations
[ ] about/thank-you page
[ ] github pages on what/how/why
[ ] SQL Editor: refresh schema on connection change
[ ] SQL Editor: prompt to choose a connection if one hasn't been chosen
[ ] clean up various dates being displayed to appropriate values

### Optional
[x] make routes separate js files (broken up by related chunks)
[ ] clean up and organize front end js. (split into separate js files?)


## Future ideas

If this tool is useful, but not really as a "web app", would it make more sense to port it to node-webkit? Could lose a lot of the web-app fat...

Could this be turned into a chrome-app?


## Names

Squeegee     (open on npm, and kinda fun. This name doesn't make sense though)
SqlPad       (couple other projects are called that. This name makes sense)
SqlPad.js    (.js because its built in Node.js?)
QueryPad     
DataPad      (A *real* app that looks really cool. Look it up)
queryserver  (boring, but descriptive)