# Dependencies

SQLPad's an old project, and some dependencies are being left at specific versions for specific reasons.

## Server (as of 12/02/2022)

```
Package                Current Wanted  Latest Why oudated
-------------------------------------------------------------------------------------------------------------------------------
node-fetch             2.6.7   2.6.7   3.3.0  3.x is ESM, can't be imported via sync `require`
sql-formatter          2.3.4   2.3.4  12.0.3  v3+ has performance regressions, incompatible with SQLPad's use case
umzug                  2.3.0   2.3.0   3.2.1  Lots of breaking changes, adds many dependencies. Remain on v2
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
