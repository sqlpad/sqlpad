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
        
        sqlEditor.aceEditor.commands.addCommand({
            name: 'saveQuery',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function () {
                menubar.saveQuery();
            }
        });
        
    }
};