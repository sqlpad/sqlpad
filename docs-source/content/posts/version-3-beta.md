---
title: "Version 3 beta now available"
date: 2019-06-25T21:14:48-04:00
---

Version 3 beta has been published to npm & docker. If you've been using the `latest` docker image the last few weeks, you've also been using it.

When installing via npm referencing exact version or beta tag running the following command `npm install sqlpad@beta -g`.

SQLPad v3 is backwards-compatible with SQLPad v2 database files, and is mostly a UI redesign/refresh and a large file structure change. Give it a try and if you aren't ready for it roll back to v2 and everything should still work.

#### Editor-first UI refresh

UI components previously based on bootstrap UI components are now replaced by custom components. Magenta is embraced as a secondary color.

Management and listing pages (Queries, connections, users, and configuration) have been moved into side drawers, allowing management and browsing of things without leaving the current query. The query editor is the primary focus of the application.

Query editor toolbars have been consolidated into a single bar to maximize use of space on the page.

Unsaved changes to a previously-saved query are now saved, prompting the user to restore on next open. This is not enabled for unsaved changes to "new" queries since it could become an annoyance, but can be added if there is interest.

Query result chart has been moved to a smaller resizable pane along side the SQL query instead of being placed in a tab. This impacts the size available for the chart, but brings it to the default view, allowing altering of the query without changing tabs.

The schema sidebar may now be hidden and is now searchable. It has also been rewritten to render large trees efficiently.

Query result grid no longer has data bars for numeric values since it didn't make sense for all number values. Date value display logic has been altered to only show timestamps if timestamps are detected. When timestamps are shown, the full timestamp from the JavaScript date object is displayed.