var $ = require('jquery');
var Slick = require('Slick');
var moment = require('moment');

module.exports = function () {
    var me = this;
    var grid;
    var clientStart;
    var doTimer = false;

    function _renderTime () {
        if (doTimer) {
            var now = new Date();
            var ms = now - clientStart;
            var seconds = ms/1000;
            var timeText = "running query<br>" + seconds.toFixed(3) + " sec.";
            $('#run-result-notification').html(timeText);
            setTimeout(_renderTime, 27);
        }
    }

    this.startRunningTimer = function () {
        clientStart = new Date();
        doTimer = true;
        $('#run-result-notification')
            .removeClass('label-danger')
            .text('running...')
            .show();
        $('.hide-while-running').hide();
        _renderTime();
    };

    this.stopRunningTimer = function () {
        doTimer = false;
    };

    this.renderError = function (errorMsg) {
        // error message was data.error
        $('#run-result-notification')
            .addClass('label-danger')
            .text(errorMsg);
    };

    this.emptyDataGrid = function () {
        // TODO: destroy/empty a slickgrid. for now we'll just empty
        $('#result-slick-grid').empty();
    };

    this.renderGridData = function (data) {
        var columns = [];
        if (data.results && data.results[0]) {
            $('#rowcount').html(data.results.length);
            var firstRow = data.results[0];
            for (var col in firstRow) {
                var maxValueLength = data.meta[col].maxValueLength;
                var columnWidth = (maxValueLength > col.length ? maxValueLength * 15 : col.length * 15);
                if (columnWidth > 400) columnWidth = 400;
                var columnSpec = {id: col, name: col, field: col, width: columnWidth};
                if (data.meta[col].datatype === 'date') {
                    columnSpec.formatter = function (row, cell, value, columnDef, dataContext) {
                        // https://github.com/mleibman/SlickGrid/wiki/Column-Options
                        if (value === null) {
                          return "";
                        } else {
                            if (window.configItems.localize === 'false') {
                              var d = moment.utc(value);
                            } else {
                              var d = moment(value);
                            }
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
          enableColumnReorder: false,
          enableTextSelectionOnCells: true
        };
        grid = new Slick.Grid("#result-slick-grid", data.results, columns, options);

        $('#run-result-notification')
            .text('')
            .hide();
    };

    this.resize = function () {
        //https://github.com/mleibman/SlickGrid/wiki/Slick.Grid#resizeCanvas
        if (grid) grid.resizeCanvas();
    };

    $(window).resize(me.resize);
};
