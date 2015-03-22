var $ = require('jquery');
var AceSqlEditor = require('./component-ace-sql-editor.js');

var QueryEditor = function () {
    var me = this;
    
    var ChartEditor = require('./component-chart-editor.js');
    var chartEditor = new ChartEditor();
    
    var DbInfo = require('./component-db-info.js');
    var dbInfo = new DbInfo();
    
    var aceSqlEditor = new AceSqlEditor("ace-editor");
    aceSqlEditor.addCommand({
        name: 'executeQuery',
        bindKey: {win: 'Ctrl-E',  mac: 'Command-E'},
        exec: function (editor) {
            me.runQuery(null, editor);
        }
    });
    aceSqlEditor.addCommand({
        name: 'runQuery',
        bindKey: {win: 'Ctrl-R',  mac: 'Command-R'},
        exec: function (editor) {
            me.runQuery(null, editor);
        }
    });                  
    aceSqlEditor.addCommand({
        name: 'saveQuery',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        exec: function () {
            me.saveQuery();
        }
    });
    
    var DataGrid = require('./component-data-grid.js');
    var dataGrid = new DataGrid();
    
    this.runQuery = function () {
        $('#client-run-time').html('');
        $('#server-run-time').html('');
        $('#rowcount').html('');
        dataGrid.emptyDataGrid();
        var queryName = me.getQueryName();
        var data = {
            queryText: aceSqlEditor.getSelectedOrAllText(),
            connectionId: $('#connection').val(),
            cacheKey: $('#cache-key').val(),
            queryName: queryName
        };
        var clientStart = new Date();
        var clientEnd = null;
        dataGrid.startRunningTimer();
        $.ajax({
            type: "POST",
            url: "/run-query",
            data: data
        }).done(function (data) {
            chartEditor.setData(data);
            clientEnd = new Date();
            dataGrid.stopRunningTimer();
            $('#client-run-time').html((clientEnd - clientStart)/1000 + " sec.");
            $('#server-run-time').html(data.serverMs/1000 + " sec.");
            if (data.success) {
                $('.hide-while-running').show();
                if (data.incomplete) {
                    $('.incomplete-notification').removeClass("hidden");
                } else {
                    $('.incomplete-notification').addClass("hidden");
                }
                dataGrid.renderGridData(data);
            } else {
                dataGrid.renderError(data.error);
            }
        }).fail(function () {
            dataGrid.stopRunningTimer();
            dataGrid.renderError("Something is broken :(");
        });
    };
    
    
    // From MenuBar
    var $queryName = $('#header-query-name');
    
    this.getQueryName = function () {
        return $queryName.val();
    };
    
    this.getQueryTags = function () {
        return $.map($('#tags').val().split(','), $.trim);
    };
    
    this.saveQuery = function () {
        var $queryId = $('#query-id');
        var query = {
            name: me.getQueryName(),
            queryText: aceSqlEditor.getEditorText(),
            tags: me.getQueryTags(),
            connectionId: dbInfo.getConnectionId(),
            chartConfiguration: chartEditor.getChartConfiguration()
        };
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
    };
    
    $('#btn-save').click(function (event) {
        event.preventDefault();
        event.stopPropagation();
        me.saveQuery();
    });
    
    $('#btn-run-query').click(function (event) {
        event.preventDefault();
        event.stopPropagation();
        me.runQuery();
    });
    
    /*  (re-)render the chart when the viz tab is pressed, 
        TODO: only do this if necessary
    ==============================================================================*/
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        // if shown tab was the chart tab, rerender the chart
        // e.target is the activated tab
        if (e.target.getAttribute("href") == "#tab-content-visualize") {
            chartEditor.rerenderChart();
        } else if (e.target.getAttribute("href") == "#tab-content-sql") {
            dataGrid.resize();
        }
    });
    
    /*  get query again, because not all the data is in the HTML
        TODO: do most the workflow this way? That or boostrap the page with the query object
    ==============================================================================*/
    var $queryId = $('#query-id');
    $.ajax({
        type: "GET",
        url: "/queries/" + $queryId.val() + "?format=json"
    }).done(function (data) {
        console.log(data);
        chartEditor.loadChartConfiguration(data.chartConfiguration);
    }).fail(function () {
        alert('Failed to get additional Query info');
    });
};


module.exports = function () {
    if ($('#ace-editor').length) {
        var queryEditor = new QueryEditor();
    }
};


