// The last javascript file. 
// It'll contain all the old-school jQuery stuff.

var $ = require('jquery');
var ace = require('ace');
var Slick = require('Slick');
var nv = require('nv');
var moment = require('moment');

window.moment = moment;

/* 
    From connection.ejs, its the button to test the database connection!
    with the power of AJAX, we can find out that a connection doesn't work 
    BEFORE trying to use it. REVOLUTIONARY.
============================================================================= */
$('#btn-test-connection').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    var data = $('#connection-form').serialize();
    console.log(data);
    $('#test-connection-result')
        .removeClass('label-danger')
        .removeClass('label-success')
        .addClass('label-info')
        .text('Testing...');
    $.ajax({
        type: "POST",
        url: "/connections/test",
        data: data
    }).done(function (data) {
        if (data.success) {
            $('#test-connection-result')
                .removeClass('label-info')
                .addClass('label-success')
                .text('Success');
        } else {
            $('#test-connection-result')
                .removeClass('label-info')
                .addClass('label-danger')
                .text('Failed');
        }
    }).fail(function () {
        
    });
});


/*  Query Filter 
    used on queries.ejs for reading the query filter form and doing the ajax
    to get the stuff. ajax.
==============================================================================*/
var $queryFilterForm = $('#query-filter-form');
if ($queryFilterForm.length) {
    $('select').change(function () {
        console.log($queryFilterForm.serialize());
        $.get('/queries?' + $queryFilterForm.serialize(), function (data) {
            $('#queries-table').empty().html(data);
        });
        //window.location.href = '/queries?' + $queryFilterForm.serialize();
    });
    $('#query-filter-search').keyup(function() {
        $.get('/queries?' + $queryFilterForm.serialize(), function (data) {
            $('#queries-table').empty().html(data);
        });
    });
}


/* 
    From query.ejs, its the ace editor!
============================================================================= */
var $editor = $('#ace-editor');
var editor;
if ($editor.length) {
    editor = ace.edit("ace-editor");
    if (editor) { 
        //editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/sql");    
        editor.focus();
        editor.commands.addCommand({
            name: 'saveQuery',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function (editor) {
                saveQuery(null, editor);
            }
        });
        editor.commands.addCommand({
            name: 'executeQuery',
            bindKey: {win: 'Ctrl-E',  mac: 'Command-E'},
            exec: function (editor) {
                runQuery(null, editor);
            }
        });
        editor.commands.addCommand({
            name: 'runQuery',
            bindKey: {win: 'Ctrl-R',  mac: 'Command-R'},
            exec: function (editor) {
                runQuery(null, editor);
            }
        });
    }
}


function getEditorText (editor) {
    var relevantText;
    var selectedText = editor.session.getTextRange(editor.getSelectionRange());
    if (selectedText.length) {
        // get only selected content
        relevantText = selectedText;
    } else {
        // get whole editor content
        relevantText = editor.getValue();
    }
    return relevantText;
}


$('#btn-save').click(function (event) {
    saveQuery(event, editor);
});

$('#btn-run-query').click(function (event) {
    runQuery(event, editor);
});

$('#name').change(function () {
    $('#header-query-name').text($('#name').val());
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
function saveQuery (event, editor) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    $('#query-details-modal').modal('hide');
    $queryId = $('#query-id');
    var queryId = $queryId.val();
    var query = {
        name: $('#name').val(),
        queryText: getEditorText(editor),
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

var grid;
var clientStart;
var clientEnd;
var running = false;

function renderRunningTime () {
    if (running) {
        var now = new Date();
        var ms = now - clientStart;
        
        $('#client-run-time').html(ms/1000 + " sec.");
        
        var leftovers = ms % 4000;
        if (leftovers < 1000) {
            $('#run-result-notification').text('running');
        } else if (leftovers >= 1000 && leftovers < 2000) {
            $('#run-result-notification').text('your');
        } else if (leftovers >= 2000) {
            $('#run-result-notification').text('query');
        }
        
        setTimeout(renderRunningTime, 53);
    }
}

var $csvLink = $('#csv-download-link');

function runQuery (event, editor) {
    $('#client-run-time').html('');
    $('#server-run-time').html('');
    $('#rowcount').html('');
    running = true;
    renderRunningTime();
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    // TODO: destroy/empty a slickgrid. for now we'll just empty
    $('#result-slick-grid').empty();
    var data = {
        queryText: getEditorText(editor),
        connectionId: $('#connection').val(),
        cacheKey: $('#cache-key').val()
    };
    
    clientStart = new Date();
    clientEnd = null;
    notifyRunning();
    $.ajax({
        type: "POST",
        url: "/run-query",
        data: data
    }).done(renderQueryResult).fail(notifyFailure);
}

function notifyRunning () {
    $('#run-result-notification')
        .removeClass('label-danger')
        .text('running...')
        .show();
    $('.hide-while-running').hide();
}

function notifyFailure () {
    running = false;
    $('#run-result-notification')
        .addClass('label-danger')
        .text("Something is broken :(");
}

var gdata;   // NOTE: exposed data for console debugging
var gmeta;   // and actually, I'm kind of abusing these elsewhere.
var gchart;  // so these aren't just for debugging anymore

function renderQueryResult (data) {
    
    clientEnd = new Date();
    running = false;
    $('#client-run-time').html((clientEnd - clientStart)/1000 + " sec.");
    $('#server-run-time').html(data.serverMs/1000 + " sec.");
    if (data.success) {
        $('.hide-while-running').show();
        var columns = [];
        if (data.results && data.results[0]) {
            gdata = data.results; // NOTE: exposed data for console debugging
            gmeta = data.meta;
            $('#rowcount').html(data.results.length);
            var firstRow = data.results[0];
            for (var col in firstRow) {
                var columnSpec = {id: col, name: col, field: col, width: col.length * 15};
                if (data.meta[col].datatype === 'date') {
                    columnSpec.formatter = function (row, cell, value, columnDef, dataContext) {
                        // https://github.com/mleibman/SlickGrid/wiki/Column-Options
                        if (value === null) {
                          return "";
                        } else {
                            var d = moment.utc(value);
                            return d.format('MM/DD/YYYY HH:mm:ss');
                            // default formatter:
                            // return (value + "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
                        }
                    };
                }
                columns.push(columnSpec);
            }
            
            // loop through and clean up dates!
            // TODO: this is lazy and could use optimization
            for (var r = 0; r < data.results.length; r++) {
                var row = data.results[r];
                for (var key in data.meta) {
                    if (data.meta[key].datatype === 'date' && row[key]) {
                        var d = moment.utc(row[key]);
                        row[key] = new Date(row[key]);
                        //row[key] = d.format('MM/DD/YYYY HH:mm:SS');
                        //console.log(d.format('MM/DD/YYYY HH:mm:SS'));
                    }
                }
            }
        }
        var options = {
          enableCellNavigation: true,
          enableColumnReorder: false
        };
        grid = new Slick.Grid("#result-slick-grid", data.results, columns, options);
        
        $('#run-result-notification')
            .text('')
            .hide();
    } else {
        $('#run-result-notification')
            .addClass('label-danger')
            .text(data.error);
    }
}

$('#connection').change(getDbInfo);

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
                                $column = $('<li>' + columns[i].column_name + " <span class='data-type'>(" + columns[i].data_type + ')</span></li>').appendTo($tableNameUl);
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

$('#panel-main').split({orientation: 'vertical', limit: 50, position: '200px', onDragEnd: resizeStuff});
$('#panel-editor-viz-results').split({orientation: 'horizontal', limit: 50, onDragEnd: resizeStuff});
$('#editor-viz-panels').split({orientation: 'vertical', limit: 50, onDragEnd: resizeStuff});

function resizeStuff () {
    editor.resize();
    //https://github.com/mleibman/SlickGrid/wiki/Slick.Grid#resizeCanvas
    if (grid) grid.resizeCanvas();
    if (gchart) gchart.update();
}
$(window).resize(resizeStuff);









/*  Chart Setup
==============================================================================*/
var $chartSetup = $('#chart-setup');
var $chartTypeDropDown = $('<select>').appendTo($chartSetup);
$chartTypeDropDown
    .append('<option value=""></option>')
    .append('<option value="line">line</option>')
    .append('<option value="bar">bar</option>')
    .append('<option value="bubble">bubble</option>')
    .change(function () {
        var selectedChartType = $chartTypeDropDown.val();
        // loop through and create dropdowns
        if (chartTypes[selectedChartType]) {
            var ct = chartTypes[selectedChartType];
            
            // render chart ui;
            var $ui = $('#chart-setup-ui').empty();
            for (var f in ct.fields) {
                var field = ct.fields[f];
                var $label = $('<label>' + field.label + '</label>');
                var $input;
                if (field.inputType === "field-dropdown") {
                    $input = $('<select>');
                    $input.append('<option value=""></option>');
                    for (var m in gmeta) {
                        $input.append('<option value="' + m + '">' + m + '</option>');
                    }
                }
                $ui.append('<br>')
                    .append($label)
                    .append('<br>')
                    .append($input)
                
                // so it'll be available?    
                field.$input = $input;
            }
            
            // render button too, then assign button click
            var $btn = $('<button>go</button>').appendTo($ui);
            $btn.click(function () {
                var cData = ct.massageData(gmeta, gdata, ct.fields);
                var chart = ct.renderChart(gmeta, gdata, ct.fields);
                gchart = chart;
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

var chartTypes = {
    line: {
        fields: {
            x: {
                optional: false,
                label: "x",
                inputType: "field-dropdown"
            },
            y: { 
                optional: false,
                label: "y",
                inputType: "field-dropdown"
            },
            split: {
                optional: true,
                label: "line for each:",
                inputType: "field-dropdown"
            }
        },
        massageData: function (meta, data, fields) {
            var chartData;
            if (fields.split.$input.val()) {
                
            } else {
                chartData = [{
                    key: fields.y.$input.val(),
                    values: data
                }];
            }
            
            return chartData;
        },
        renderChart: function (meta, data, fields) {
            var $x = fields.x.$input;
            var $y = fields.y.$input;
            var chart = nv.models.lineChart()
                            .margin({left: 50, top: 50, right: 50})
                            .x(function(d,i) { 
                                var selectedDataType = meta[$x.val()].datatype;
                                if (selectedDataType == "date" || selectedDataType == "number") {
                                    return d[$x.val()];
                                } else {
                                    return i;
                                }
                            })
                            .y(function(d,i) {
                                var selectedDataType = meta[$y.val()].datatype;
                                if (selectedDataType == "date") {
                                    return d[$y.val()];
                                } else if (selectedDataType == "number") {
                                    return parseInt(d[$y.val()]);
                                } else {
                                    return null;
                                }
                            })
                            //.y(function(d,i) {return parseFloat(d.y) })
                            .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                            .transitionDuration(350)  //how fast do you want the lines to transition?
                            .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                            .showYAxis(true)        //Show the y-axis
                            .showXAxis(true)        //Show the x-axis
                            .clipEdge(false)
            
            chart.xAxis.axisLabel($x.val())
                //.tickFormat(d3.format(',r'));
            chart.yAxis.axisLabel($y.val())
                //.tickFormat(d3.format('.02f'));
            
            return chart;
        }
    }
};