/*

"component" for ace editor, status bar, and slickgrid


EXAMPLE: 

var SqlEditor = require('whatever-this-module-is');
var editor = new SqlEditor()
editor.getEditorText(); 
editor.getData();
editor.runQuery();


*/

var $ = require('jquery');
var ace = require('ace');
var Slick = require('Slick');
var moment = require('moment');

// expose moment for some debugging purposes
window.moment = moment;


// TODO: Clean up SqlEditor. seriously.

var SqlEditor = function () {
    var me = this;
    
    var grid;
    var clientStart;
    var clientEnd;
    var running = false; 
    
    var gdata;   // NOTE: these were initially exposed for console debugging
    var gmeta;   // but now I'm kind of abusing these elsewhere.
    
    var menubar;
    this.setMenubar = function (m) {
        menubar = m;
    };
    
    var editor = ace.edit("ace-editor");
    this.aceEditor = editor;
    
    if (editor) { 
        //editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/sql");    
        editor.focus();
        editor.commands.addCommand({
            name: 'executeQuery',
            bindKey: {win: 'Ctrl-E',  mac: 'Command-E'},
            exec: function (editor) {
                me.runQuery(null, editor);
            }
        });
        editor.commands.addCommand({
            name: 'runQuery',
            bindKey: {win: 'Ctrl-R',  mac: 'Command-R'},
            exec: function (editor) {
                me.runQuery(null, editor);
            }
        });
    }
    
    this.renderQueryResult = function (data) {
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
                                //var d = moment.utc(value);
                                var d = moment(value);
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
                            row[key] = new Date(row[key]);
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
    };
    
    
    this.getEditorText = function () {
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
    };
    
    
    this.resize = function () {
        editor.resize();
        //https://github.com/mleibman/SlickGrid/wiki/Slick.Grid#resizeCanvas
        if (grid) grid.resizeCanvas();
    };
    
    $(window).resize(me.resize);    
    
    
    this.getGdata = function () {
        return gdata;
    };
    
    this.getGmeta = function () {
        return gmeta;
    };
    
    
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
    
    this.runQuery = function () {
        var me = this;
        $('#client-run-time').html('');
        $('#server-run-time').html('');
        $('#rowcount').html('');
        running = true;
        renderRunningTime();
        
        // TODO: destroy/empty a slickgrid. for now we'll just empty
        $('#result-slick-grid').empty();
        var queryName = (menubar ? menubar.getQueryName() : '');
        var data = {
            queryText: me.getEditorText(),
            connectionId: $('#connection').val(),
            cacheKey: $('#cache-key').val(),
            queryName: queryName
        };
        
        clientStart = new Date();
        clientEnd = null;
        notifyRunning();
        $.ajax({
            type: "POST",
            url: "/run-query",
            data: data
        }).done(me.renderQueryResult).fail(notifyFailure);
    };
    
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
    
};

module.exports = SqlEditor;