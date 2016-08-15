# TODOs

This is a place to document and delay decisions for the 2.0.0 release. 

- react-select
    allowCreate isn't implemented in react-select v1 beta, and v0.9 doesn't play well with react 15.

- QueryResultDataTable
    Old version used to convert date values as well as format for text.
    Hold off converting to dates unless needed for chart? 

- query sorting should happen client side

- .xlsx cache not getting deleted
    It should be deleted on sqlpad startup (migration or every time?)

- data schema migration
    User model has a distinction between createdDate and signupDate.
    On first startup of sqlpad 2.0, data should be migrated to handle this
    and other schema updates.

- API error handling  

    How should api errors be handled? fetch doesn't take status codes into consideration.
    Either we use status codes and then wrap fetch or we standardize the data payloads done by /api/

- React code organization in client-js  

    Currently it is being written kinda like the jQuery was being written
    Eventually this needs to be made more pretty and follow react conventions

- Config Conceptualization  

    There are currently 3 config entry points: env, cli, and ui.
    The env/cli configuration is handled differently than the config in the ui.
    
    Do we make a distinction between these two types of configuration?
    It would be nice to formalize for code, documentation, and ux.