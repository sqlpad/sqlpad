---
title: "SQLPad 2.0.0 BETA"
---


## SQLPad 2.0.0-beta.3 is now available on npm!

Over the last couple months I've taken some time to update SQLPad.
These updates include code cleanup, user interface/experience updates, and some new features.
While the work isn't finished, it is ready for preview.
I'm anticipating a few more updates throughout the month, with a stable release published October.

If you try it out I'd love to get your feedback on it! Feel free to tweet, email, or submit a GitHub issue.

\- Rick  
  
[@rickbergfalk](https://twitter.com/rickbergfalk)  
rick.bergfalk@gmail.com   


## Installation

The v2 beta is installed like any other SQLPad version. 

Because of some minor changes to the user data model, 
you may want to take a backup of your SQLPad instance before you begin. 

First stop your existing SQLPad instance.

Next, locate your SQLPad database directory. 
By default it is installed in $HOME/sqlpad/db, but you may have changed that with the --dir flag.
Copy the files in this directory and set them aside in case you ever want to revert back to an earlier version of SQLPad.

To update sqlpad, run `npm install sqlpad -g` from a command prompt. 
This will update your sqlpad installation to the latest SQLPad beta.

Once installed, run SQLPad just as you would under version 1.x.x. 

Need to revert back? You can install an older version of SQLPad by specifying a version.
For example, to go back to the latest 1.x version run `npm install sqlpad@1.17.3 -g`.


## Changelog

- UI design updates *everywhere*
- Query Listing:
    - preview query contents by hovering over query listing
    - occassional search/filter weirdness has been fixed
- Query Editor:
    - Schema sidebar no longer separates views and tables in hierarchy
    - New result grid 
        - inline bar plot rendered for numeric values
        - display issues fixed for certain browsers
    - New tags widget for cleaner input
    - Browser tab name now reflects query name 
    - Updated taucharts library with stacked bar charts 
    - Line and Scatterplot charts may have chart filters enabled
    - 'show advanced settings' in vis editor now has a few advanced settings depending on chart (y min/max, show trendline, show filter)
    - switching between sql/vis tabs won't reset chart series toggles
    - table/chart only links may be set to no longer require login (see configuration page)
- Configuration:
    - Specific config inputs and labels - no more open ended key/value inputs
    - Current environment config documented with assistive popovers
- Update notification moved in-app
- Under the hood
    - updated all the code dependencies
    - reworked some foundation code for easier future development
- Known issues / not yet implemented: 
    - Query tag input does not allow creation
    - Query auto-refresh not yet implemented 


## Screenshots

<div>
<img class="u-max-full-width" src="/sqlpad/images/screenshots/v2-queries.png"/>
<img class="u-max-full-width" src="/sqlpad/images/screenshots/v2-query-sql.png"/>
<img class="u-max-full-width" src="/sqlpad/images/screenshots/v2-query-vis.png"/>
<img class="u-max-full-width" src="/sqlpad/images/screenshots/v2-connections.png"/>
<img class="u-max-full-width" src="/sqlpad/images/screenshots/v2-users.png"/>
<img class="u-max-full-width" src="/sqlpad/images/screenshots/v2-configuration.png"/>
</div>

