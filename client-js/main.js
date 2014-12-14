//  This is where all the client side js stuff is required so it can be bundled 
//  via Browserify. 
//  All the heavy old-school javascript libraries are exposed as browserify globals
//  because its easy and they don't play well with browserify without some work.
//
//  So far, as a general pattern I've been puting jQuery javascript
//  in smaller files. Then I just require them  here and execute the function to 
//  bind any events and whatever else to the page. 


/*  From connection.ejs, its the button to test the database connection!
    with the power of AJAX, we can find out that a connection doesn't work 
    BEFORE trying to use it. REVOLUTIONARY.
============================================================================= */
require('./test-connection.js')();
 
 
/*  Query Filter 
    used on queries.ejs for reading the query filter form and doing the ajax
    to get the stuff. ajax.
==============================================================================*/
require('./query-filter-form.js')();

 
/*  Query Editor
    All the stuff that happens when viewing/working with a single query
    happens in this code here
==============================================================================*/
require('./query-editor.js')();


/*  User Admin
==============================================================================*/
require('./user-admin.js')();


/*  Connection Admin
==============================================================================*/
require('./connection-admin.js')();



/*
// eventually have this api:

var queryEditor = require('query-editor')

queryEditor.addChartTypeConfig("line",      require('./chart-type-line.js'));
queryEditor.addChartTypeConfig("bar",       require('./chart-type-bar.js'));
queryEditor.addChartTypeConfig("bubble",    require('./chart-type-bubble.js'));
queryEditor.addChartTypeConfig("histogram", require('./chart-type-histogram.js'));

queryEditor.render();
*/