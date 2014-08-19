/*	
	Contains all the view/model logic for the query.ejs page
	
	I'm trying to simplify this page. Break it down into "components"
	Later, these can be made into React components, or something similar
	
	This is the sequence objects need to be instantiated.
	If anyone out there is reading this, and knows a better way to 
	do all this, please let me know :)
	
	first DbInfo
	    - it is standalone, does not depend on any other UI elements
	    
	then SqlEditor 
	    - depends on DbInfo for ConnectionId
	    - potential issue (ctrl-s needs to reference save function on navbar)
	
	then ChartBuilder
	    - requires data from SqlEditor result
	
	then menubar
	    - this "component" will contain the save/run query buttons
	      as well as the query name/tags inputs
	    - the save button will require data from 
	        - DbInfo (connection Id)
	        - SqlEditor (query text)
	        - ChartBuilder (chart type, inputs)
	        - itself (query name, tags)
        - the run button will hook into SqlEditor
 
*/

var $ = require('jquery');

module.exports = function () {
    
    if ($('#ace-editor').length) {
        
        var $queryId = $('#query-id');
        
        
        /*  DB / Schema Info
        ==============================================================================*/
        var DbInfo = require('./component-db-info.js');
        var dbInfo = new DbInfo();
        
        
        /*  Set up the Ace Editor
        ========================================================================= */
        var SqlEditor = require('./component-sql-editor.js');
        var sqlEditor = new SqlEditor();
        
        
        /*  Chart Editor Setup
        ==============================================================================*/
        var ChartEditor = require('./component-chart-editor.js');
        var chartEditor = new ChartEditor({sqlEditor: sqlEditor});
        chartEditor.registerChartType("line", require('./chart-type-line.js'));
        chartEditor.registerChartType("bar", require('./chart-type-bar.js'));
        chartEditor.registerChartType("bubble", require('./chart-type-bubble'));
        
        /*  Menubar Setup
        ==============================================================================*/
        var Menubar = require('./component-menubar.js');
        var menubar = new Menubar({sqlEditor: sqlEditor, dbInfo: dbInfo, chartEditor: chartEditor});
        
        sqlEditor.setMenubar(menubar);
        
        sqlEditor.aceEditor.commands.addCommand({
            name: 'saveQuery',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function () {
                menubar.saveQuery();
            }
        });
        
        /*  (re-)render the chart when the viz tab is pressed, 
            TODO: only do this if necessary
        ==============================================================================*/
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            // if shown tab was the chart tab, rerender the chart
            // e.target is the activated tab
            if (e.target.getAttribute("href") == "#tab-content-visualize") {
                chartEditor.rerenderChart();
            }
        });
        
        /*  get query again, because not all the data is in the HTML
            TODO: do most the workflow this way? That or boostrap the page with the query object
        ==============================================================================*/
        $.ajax({
            type: "GET",
            url: "/queries/" + $queryId.val() + "?format=json"
        }).done(function (data) {
            console.log(data);
            chartEditor.loadChartConfiguration(data.chartConfiguration);
        }).fail(function () {
            alert('Failed to get additional Query info');
        });
    }
};