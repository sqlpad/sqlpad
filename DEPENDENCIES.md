# Dependencies

SQLPad's an old project, and some dependencies are being left at specific versions for specific reasons.

## Server (as of 6/18/2023)

- `node-ldapjs` - 3.x brings a lot of changes and risk of breakage. https://github.com/ldapjs/node-ldapjs/releases/tag/v3.0.0
- `node-fetch` - 3.x is ESM only
- `query-string` - 8.x is ESM only
- `sql-formatter` - 3.x onward has performance regressions, changes in functionality.
- `umzug` - 3.x has many (unnecessary) breaking changes and additional dependencies.

## Client (as of 2/28/2022)

```
Package                  Current    Wanted    Latest  Why Outdated
-------------------------------------------------------------------------------------------------------------------------------
@types/node             14.18.12  14.18.12   17.0.21  Using node 14 at the moment
d3                        5.16.0    5.16.0     7.3.0  taucharts requires d3@5
history                   4.10.1    4.10.1     5.3.0  react-router-dom@5 requires history@4
react-router-dom           5.3.0     5.3.0     6.2.2  react-router-dom@6 does not support Prompt component (yet)
```
