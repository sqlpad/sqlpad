# Dependencies

SQLPad's an old project, and some dependencies are being left at specific versions for specific reasons.

Lists of outdated dependencies can be retrieved by doing the following:

```sh
# from root
cd server # or client
yarn outdated
```

## Outdated server dependencies (as of 8/25/2024)

- `@clickhouse/client` - 1.x is major breaking and needs thorough update/testing. 
- `eslint` / `eslint-config-prettier` - airbnb preset doesn't have 9 listed as supported yet.
- `ldapjs` - 3.x brings a [lot of changes and risk of breakage](https://github.com/ldapjs/node-ldapjs/releases/tag/v3.0.0).
- `prettier` - 3.x brings some formatting changes. Avoiding unnecessary noise for the forks out there.
- `sql-formatter` - 3.x onward has performance regressions, changes in functionality.
- `umzug` - 3.x has many (unnecessary) breaking changes and additional dependencies.

## Outdated client dependencies (as of 8/25/2024)

There's a lot. React is on the verge of big changes, some of the dependencies used have been abandoned.

Since client-side deps are used for development and compiled into something... there's less harm in leaving these sit. 

The frontend client can be considered "frozen" as of this point. If this project is revived there's a lot that needs to be addressed here.

- `d3` - taucharts requires d3@5
- `history` - react-router-dom@5 requires history@4
- `react-router-dom` - react-router-dom@6 does not support Prompt component (yet)
