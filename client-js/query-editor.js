// contains all the view/model logic for the query.ejs page
// This could use some refactoring, 
// as there is a lot going on and not a lot of it is very structured

/*	
	Simplify this page. Break it down into "components"
	Later, these can be made into React components, or something similar
	
	
    // Editor consists of Ace editor, status bar, slickgrid
    // it is the holder of the data
    
    var editor = new editor()
    editor.getEditorText(); 
    editor.getData();
    editor.runQuery();
    
    
 
*/

var $ = require('jquery');
var moment = require('moment');

var d3 = require('d3');
var nv = require('nv');


// expose moment for some debugging purposes
window.moment = moment;

// declare variables and cache jQuery objects




module.exports = function () {
    
    /*  Set up the Ace Editor
    ========================================================================= */
    // TODO:
    var SqlEditor = require('./component-sql-editor.js');
    var sqlEditor;
    
    if ($('#ace-editor').length) {
        sqlEditor = new SqlEditor();
        sqlEditor.aceEditor.commands.addCommand({
            name: 'saveQuery',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function (editor) {
                saveQuery(null, editor);
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
            connectionId: $('#connection').val()
        };
        console.log(query);
        $('#btn-save-result').text('saving...').show();
        $.ajax({
            type: "POST",
            url: "/queries/" + $queryId.val(),
            data: query
        }).done(function (data) {
            if (data.success) {
                //alert('success');
                window.history.replaceState({}, "query " + data.query._id, "/queries/" + data.query._id);
                $queryId.val(data.query._id);
                $('#btn-save-result').removeClass('label-info').addClass('label-success').text('Success');
                setTimeout(function () {
                    $('#btn-save-result').fadeOut(400, function () {
                        $('#btn-save-result').removeClass('label-success').addClass('label-info').text('');
                    });
                }, 1000);
            } else {
                //alert('fail on the server side idk');
                $('#btn-save-result').removeClass('label-info').addClass('label-danger').text('Failed');
            }
        }).fail(function () {
            alert('ajax fail');
        });
    }
    
    
    /*  DB / Schema Info
    ==============================================================================*/
    function getDbInfo () {
        $('#panel-db-info').empty();
        var connectionId = $('#connection').val();
        if (connectionId) {
            $.getJSON("/schema-info/" + connectionId, function (data) {
                if (data.success) {
                    var tree = data.tree;
                    var $root = $('<ul class="schema-info">').appendTo('#panel-db-info');
                    for (var tableType in tree) {
                        var $tableType = $('<li><a href="#">' + tableType + '</a></li>').appendTo($root);
                        var $tableTypeUl = $('<ul>').appendTo($tableType);
                        for (var schema in tree[tableType]) {
                            var $schema = $('<li><a href="#">' + schema + '</a></li>').appendTo($tableTypeUl);
                            var $schemaUl = $('<ul>').appendTo($schema);
                            for (var tableName in tree[tableType][schema]) {
                                var $tableName = $('<li><a href="#">' + tableName + '</a></li>').appendTo($schemaUl);
                                var $tableNameUl = $('<ul>').appendTo($tableName);
                                var columns = tree[tableType][schema][tableName];
                                for (var i=0; i < columns.length; i++) {
                                    var $column = $('<li>' + columns[i].column_name + " <span class='data-type'>(" + columns[i].data_type + ')</span></li>').appendTo($tableNameUl);
                                }
                            }
                        }
                    }
                    $('.schema-info').find('ul').find('ul').hide();
                    $('.schema-info').find('li').click(function (e) {
                        $(this).children('ul').toggle();
                        e.stopPropagation();
                    });
                } else {
                    $('<ul class="schema-info"><li>Problem getting Schema Info</li></ul>').appendTo('#panel-db-info');
                }
            });
        }
        
    }
    getDbInfo();
    $('#connection').change(getDbInfo);
    
    
    
    
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

