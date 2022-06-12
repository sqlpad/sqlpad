# Dependencies

SQLPad's an old project, and some dependencies are being left at specific versions for specific reasons.

## Server (as of 6/11/2022)

```
Package                Current Wanted Latest Why oudated
-------------------------------------------------------------------------------------------------------------------------------
mariadb                2.5.6   2.5.6  3.0.0  v3 changes how booleans are handled. Could break
node-fetch             2.6.7   2.6.7  3.2.6  3.x is ESM, can't be imported via sync `require`
openid-client          4.9.1   4.9.1  5.1.6  Difficult to test
passport               0.4.1   0.4.1  0.6.0  Unclear what breaking might be, difficult to test
passport-openidconnect 0.0.2   0.0.2  0.1.1  Dependency to be removed from SQLPad next major version
sql-formatter          2.3.4   2.3.4  6.1.5  v3+ has performance regressions, incompatible with SQLPad's use case
umzug                  2.3.0   2.3.0  3.1.1  Lots of breaking changes, adds many dependencies. Remain on v2
```

## Client (as of 2/28/2022)

```
Package                  Current    Wanted    Latest  Why Outdated
-------------------------------------------------------------------------------------------------------------------------------
@types/node             14.18.12  14.18.12   17.0.21  Using node 14 at the moment
d3                        5.16.0    5.16.0     7.3.0  taucharts requires d3@5
history                   4.10.1    4.10.1     5.3.0  react-router-dom@5 requires history@4
react-router-dom           5.3.0     5.3.0     6.2.2  react-router-dom@6 does not support Prompt component (yet)
```
