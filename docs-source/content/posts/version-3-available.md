---
title: "Version 3 Released"
date: 2019-09-02T17:54:50-05:00
draft: false
---

SQLPad version 3 has finally been released and tagged as stable.

It consists of a significant UI update, a change in configuration management, and a stronger focus on automated Docker builds. It has been in "beta" for quite some time, and if you are running the latest docker image or running a recent build of master you are already using it.

## Editor-First UI Refresh

UI components previously based on React Bootstrap UI components are now replaced by custom React components. The front end code in general follows a much better React-based approach, and should hopefully be easier to maintain and reason about. The v2 rewrite was my first React project and did some not-very-Reacty things, and performance sometimes suffered as a result.

Management and listing pages (queries, connections, users) have been moved into side drawers, allowing management and browsing of things without leaving the current query. The query editor is now the primary focus of the application. 

Query editor toolbars have been consolidated into a single bar to maximize use of space on the page.

Unsaved changes to a previously-saved query are now saved to browser local storage, prompting the user to restore on next open. This is not enabled for unsaved changes to "new" queries since it could become an annoyance, but can be added if there is interest.

Query result chart has been moved to a smaller resizable pane along side the SQL query instead of being placed in a tab. This impacts the size available for the chart, but brings it to the default view, allowing altering of the query without changing tabs.

The schema sidebar may now be hidden and is now searchable. It has also been rewritten to render large trees efficiently.

Query result grid no longer has data bars for numeric values since it didn't make sense for all number values. Date value display logic has been altered to only show timestamps if timestamps are detected. When timestamps are shown, the full timestamp from the JavaScript date object is displayed.

## Configuration

The configuration UI has been removed completely, favoring configuration done at the server level. This allowed simplification of the configuration code quite a bit. 

Configuration may be specified via environment variables or a JSON or INI configuration file. The path to the config file can be set via environment variable `SQLPAD_CONFIG=path/to/config.ini` or via CLI flag `sqlpad --config path/to/config.json`

Configuration may also be specified via command line flags (e.g. `sqlpad --flagName someValue`) though the parameter names may have changed.

A list of available settings may be found in the [GitHub repository](https://github.com/rickbergfalk/sqlpad#configuration)

## npm Install Deprecated

As of version 3, automated Docker hub builds have been made a priority. Going forward, using the Docker build or building from the git repo is the recommended approach to running SQLPad.

A few versions of SQLPad v3 will be published to npm, but will be flagged as deprecated. 

The Docker build of SQLPad appears to be more popular, is probably safer, and opens up more possibilities down the road (SQLPad could be more than Node.js). Removing the need to publish to npm also simplifies things a bit.

While this is a minor inconvenience if you're using npm as a means to install and run SQLPad (I was), I believe this is a better path forward for the future of SQLPad.