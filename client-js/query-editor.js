/*	
	TODO: refactor this stuff in a way that makes sense.
	
	Originally these components were going to be stand-alone, but really they 
	need to keep referencing each other.attribute
	
	Maybe keep the individual components, but make them all part of the 
	larger "component" that is the page?
	
	For example: the save vis to image button needs to reference the query name
	which is stored on the menu bar. 
	
	Also worth considering: The chart/table should be easily rendered without all the 
	surrounding UI.
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
        chartEditor.registerChartType("verticalbar", require('./chart-type-vertical-bar'));
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