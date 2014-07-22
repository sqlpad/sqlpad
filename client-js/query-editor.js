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
	
	then navbar
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
var d3 = require('d3');
var nv = require('nv');


module.exports = function () {
    
    
    /*  DB / Schema Info
    ==============================================================================*/
    var DbInfo = require('./component-db-info.js');
    var dbInfo = new DbInfo();
    
    
    /*  Set up the Ace Editor
    ========================================================================= */
    var SqlEditor = require('./component-sql-editor.js');
    var sqlEditor;
    
    if ($('#ace-editor').length) {
        sqlEditor = new SqlEditor();
        sqlEditor.aceEditor.commands.addCommand({
            name: 'saveQuery',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function () {
                saveQuery();
            }
        });
    }
    
    $('#btn-save').click(function (event) {
        event.preventDefault();
        event.stopPropagation();
        saveQuery();
    });
    
    $('#btn-run-query').click(function (event) {
        event.preventDefault();
        event.stopPropagation();
        sqlEditor.runQuery();
    });
    
    
    /*
        should POST to /queries/:id or /queries/new
        {
            name: 'a fun query',
            tags: [],
            connectionId: connectionId
        }
        
        it returns
        
        {
            success: true,
            query: queryobject
        }
    */
    function saveQuery () {
        var $queryId = $('#query-id');
        var query = {
            name: $('#header-query-name').html(),
            queryText: sqlEditor.getEditorText(),
            tags: $.map($('#tags').val().split(','), $.trim),
            connectionId: dbInfo.getConnectionId()
        };
        console.log(query);
        $('#btn-save-result').text('saving...').show();
        $.ajax({
            type: "POST",
            url: "/queries/" + $queryId.val(),
            data: query
        }).done(function (data) {
            if (data.success) {
                window.history.replaceState({}, "query " + data.query._id, "/queries/" + data.query._id);
                $queryId.val(data.query._id);
                $('#btn-save-result').removeClass('label-info').addClass('label-success').text('Success');
                setTimeout(function () {
                    $('#btn-save-result').fadeOut(400, function () {
                        $('#btn-save-result').removeClass('label-success').addClass('label-info').text('');
                    });
                }, 1000);
            } else {
                $('#btn-save-result').removeClass('label-info').addClass('label-danger').text('Failed');
            }
        }).fail(function () {
            alert('ajax fail');
        });
    }
    
    
    /*  Chart Setup
    ==============================================================================*/
    var gchart;
    
    $(window).resize(function () {
        if (gchart) gchart.update();
    });
    
    var chartTypes = {
        line: require('./chart-type-line.js'),
        bar: require('./chart-type-bar.js'),
        bubble: require('./chart-type-bubble.js')
    };
    
    var $chartSetup = $('#chart-setup');
    var $chartTypeFormGroup = $('<div class="form-group">').appendTo($chartSetup);
    var $chartTypeLabel = $('<label class="control-label">Chart Type</label>').appendTo($chartTypeFormGroup);
    var $chartTypeDropDown = $('<select>').appendTo($chartTypeFormGroup);
    $chartTypeDropDown.append('<option value=""></option>');
    for (var key in chartTypes) {
        $chartTypeDropDown.append('<option value="' + key + '">' + key + '</option>');
    }
    $chartTypeDropDown.change(function () {
        var gdata = sqlEditor.getGdata();
        var gmeta = sqlEditor.getGmeta();
        
        var selectedChartType = $chartTypeDropDown.val();
        // loop through and create dropdowns
        if (chartTypes[selectedChartType]) {
            var ct = chartTypes[selectedChartType];
            
            // render chart ui;
            var $ui = $('#chart-setup-ui').empty();
            for (var f in ct.fields) {
                var field = ct.fields[f];
                var $formGroup = $('<div class="form-group">');
                var $label = $('<label class="control-label">' + field.label + '</label>');
                var $input;
                if (field.inputType === "field-dropdown") {
                    $input = $('<select>');
                    $input.append('<option value=""></option>');
                    for (var m in gmeta) {
                        $input.append('<option value="' + m + '">' + m + '</option>');
                    }
                }
                $formGroup
                    .append($label)
                    .append($input)
                    .appendTo($ui);
                
                // so it'll be available?    
                field.$input = $input;
            }
            
            // render button too, then assign button click
            var $btn = $('<button>Visualize</button>').appendTo($ui);
            $btn.click(function () {
                
                // loop through chart type fields and do things like
                // add the value, datatype
                for (var f in ct.fields) {
                    var field = ct.fields[f];
                    field.val = field.$input.val();
                    if (field.val && gmeta[field.val]) {
                        field.datatype = gmeta[field.val].datatype;
                        field.min = gmeta[field.val].min;
                        field.max = gmeta[field.val].max;
                    }
                }
                
                var cData = ct.transformData(gmeta, gdata, ct.fields);
                var chart = ct.renderChart(gmeta, gdata, ct.fields);
                gchart = chart;
                $('#chart svg').empty();
                d3.select('#chart svg')
                    .datum(cData)
                    .call(chart);
                nv.utils.windowResize(chart.update);
                nv.addGraph(function () {
                    return chart;
                });
            });
        }
    });
};
