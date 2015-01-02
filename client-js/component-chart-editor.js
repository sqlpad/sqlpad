/*

"component" for chart editor

EXAMPLE: 

var ChartEditor = require('this-file.js');
var chartEditor = new ChartEditor();

*/

var $ = require('jquery');

var ChartEditor = function (opts) {
    var me = this;
    var sqlEditor = opts.sqlEditor;
    var gchart;
    var gdata;
    var gmeta;
    var chartTypes = {}; // holds chart types once registered
    var chartLabels = []; // array of chart labels for sorting/serving as a record of labels
    var chartTypeKeyByChartLabel = {}; // index of chart types by chartlabel
    var $chartTypeDropDown = $('#chart-type-dropdown');
    var $btnVisualize = $('#btn-visualize');
    var $chartSetupUI = $("#chart-setup-ui");
    
    this.registerChartType = function (type, chartType) {
        chartTypes[type] = chartType;
        chartLabels.push(chartType.chartLabel);
        chartLabels.sort();
        chartTypeKeyByChartLabel[chartType.chartLabel] = type;
        // rerender chart type dropdown
        $chartTypeDropDown.empty();
        $chartTypeDropDown.append('<option value=""></option>');
        for (var i = 0; i < chartLabels.length; i++) {
            var chartLabel = chartLabels[i];
            $chartTypeDropDown.append('<option value="' + chartTypeKeyByChartLabel[chartLabel] + '">' + chartLabel + '</option>');
        }
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
                } else if (field.inputType === "custom-dropdown") {
                    $input = $('<select>');
                    $input.append('<option value=""></option>');
                    for (var i in field.options) {
                        $input.append('<option value="' + field.options[i].value + '">' + field.options[i].label + '</option>');
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
        /*
            {
                chartType: "line",
                fields: {
                    "x": "column-name",
                    "y": "column-name"
                }
            }
        */
        var chartConfig = {
            chartType: null,
            fields: {}
        };
        chartConfig.chartType = $chartTypeDropDown.val();
        if (chartTypes[chartConfig.chartType]) {
            var ct = chartTypes[chartConfig.chartType];
            for (var f in ct.fields) {
                chartConfig.fields[f] = ct.fields[f].$input.val();
            }
        }
        return chartConfig;
    };
    
    this.loadChartConfiguration = function (config) {
        // set chart type dropdown
        // fire .buildChartUI
        // loop through chart types and set their values
        $chartTypeDropDown.val(config.chartType);
        $chartTypeDropDown.trigger("change");
        if (chartTypes[config.chartType]) {
            var ct = chartTypes[config.chartType];
            for (var f in ct.fields) {
                if (config.fields[f]) {
                    // attempt to set the value of what is in the config
                    ct.fields[f].$input.val(config.fields[f]);
                    // check the value
                    var inputVal = ct.fields[f].$input.val();
                    // if the value is nothing, then we will force it
                    if (!inputVal) {
                        console.log('in the thing');
                        console.log(ct.fields[f]);
                        console.log(config.fields[f]);
                        ct.fields[f].$input.append('<option value="' + config.fields[f] + '">' + config.fields[f] + '</option>');
                        ct.fields[f].$input.val(config.fields[f]);
                    }
                }
            }
        }
    };
    
    this.rerenderChart = function () {
        var chartConfig = me.getChartConfiguration();
        me.buildChartUI();
        me.loadChartConfiguration(chartConfig);
        me.renderChart();
    };
    
    // TODO: factor out the chart piece from the chart editor
    this.renderChart = function () {
        gdata = sqlEditor.getGdata();
        gmeta = sqlEditor.getGmeta();
        var requirementsMet = true;
        var fieldsNeeded = [];
        
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
                if (field.val === "" && field.required) {
                    requirementsMet = false;
                    fieldsNeeded.push(field.label);
                }
            }
            var chart;
            if (requirementsMet) {
                $('#chart').empty();
                chart = ct.renderChart(gmeta, gdata, ct.fields);
                gchart = chart;
            } else {
                alert("Chart requires additional information: " + fieldsNeeded.join(', '));
            }
        }
    };
    
    // Bind Events
    $btnVisualize.click(me.renderChart);
    $chartTypeDropDown.change(me.buildChartUI);
    $(window).resize(function () {
        if (gchart) gchart.draw(0, true);
    });
};
module.exports = ChartEditor;
