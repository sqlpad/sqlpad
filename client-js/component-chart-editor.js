/*

"component" for chart editor

EXAMPLE: 

var ChartEditor = require('this-file.js');
var chartEditor = new ChartEditor();





*/

var $ = require('jquery');
var d3 = require('d3');
var nv = require('nv');

var ChartEditor = function (opts) {
    var me = this;
    var sqlEditor = opts.sqlEditor;
    var gchart;
    var gdata;
    var gmeta;
    var chartTypes = {}; // holds chart types once registered
    var $chartTypeDropDown = $('#chart-type-dropdown');
    var $btnVisualize = $('#btn-visualize');
    var $chartSetupUI = $("#chart-setup-ui");
    
    this.registerChartType = function (type, chartType) {
        chartTypes[type] = chartType;
        $chartTypeDropDown.append('<option value="' + type + '">' + type + '</option>');
    };
    
    this.buildChartUI = function () {
        gmeta = sqlEditor.getGmeta();
        var selectedChartType = $chartTypeDropDown.val();
        // loop through and create dropdowns
        if (chartTypes[selectedChartType]) {
            $chartSetupUI.empty();
            var ct = chartTypes[selectedChartType];
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
                    .appendTo($chartSetupUI);
                // add a reference to input for later  
                field.$input = $input;
            }
        }
    };
    
    this.getChartConfiguration = function () {
        
    }
    
    // TODO: factor out the chart piece from the chart editor
    this.renderChart = function () {
        gdata = sqlEditor.getGdata();
        gmeta = sqlEditor.getGmeta();
        
        var selectedChartType = $chartTypeDropDown.val();
        if (chartTypes[selectedChartType]) {
            var ct = chartTypes[selectedChartType];
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
        }
    };
    
    // Bind Events
    $btnVisualize.click(me.renderChart);
    $chartTypeDropDown.change(me.buildChartUI);
    $(window).resize(function () {
        if (gchart) gchart.update();
    });
};
module.exports = ChartEditor;
