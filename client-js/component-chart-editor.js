/*

"component" for chart editor

EXAMPLE: 

var ChartEditor = require('this-file.js');
var chartEditor = new ChartEditor();

*/
var saveSvgAsPng = require('saveSvgAsPng');
var $ = require('jquery');
var _ = require('_');

var ChartEditor = function () {
    var me = this;
    var chart; // the rendered tauchart
    var gdata;
    var gmeta;
    var fieldValueCache = {};
    var chartTypes = {}; // holds chart types once registered
    var chartLabels = []; // array of chart labels for sorting/serving as a record of labels
    var chartTypeKeyByChartLabel = {}; // index of chart types by chartlabel
    var $chartTypeDropDown = $('#chart-type-dropdown');
    var $btnVisualize = $('#btn-visualize');
    var $btnSaveImage = $('#btn-save-image');
    var $btnLinkToChart = $('#btn-link-to-chart');
    var $chartSetupUI = $("#chart-setup-ui");
    
    this.setData = function(data) {
        gdata = data.results;
        gmeta = data.meta;
    };
    
    function registerChartType (type, chartType) {
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
    }
    registerChartType("line", require('./chart-type-line.js'));
    registerChartType("bar", require('./chart-type-bar-horizontal.js'));
    registerChartType("verticalbar", require('./chart-type-bar-vertical'));
    // this needs to stay registered under bubble... for now
    registerChartType("bubble", require('./chart-type-scatterplot')); 
    
    this.buildChartUI = function () {
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
                    $formGroup
                        .append($label)
                        .append($input)
                        .appendTo($chartSetupUI);
                } else if (field.inputType === "custom-dropdown") {
                    $input = $('<select>');
                    $input.append('<option value=""></option>');
                    for (var i in field.options) {
                        $input.append('<option value="' + field.options[i].value + '">' + field.options[i].label + '</option>');
                    }
                    $formGroup
                        .append($label)
                        .append($input)
                        .appendTo($chartSetupUI);
                } else if (field.inputType === "checkbox") {
                    $input = $('<input type="checkbox">');
                    $formGroup
                        .append($label)
                        .appendTo($chartSetupUI);
                    $label.prepend($input);
                }
                // add a reference to input for later  
                field.$input = $input;
            }
        }
    };
    
    this.getChartConfiguration = function () {
        /*
            // Expected output:
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
                if (ct.fields[f].inputType === "checkbox") {
                    chartConfig.fields[f] = ct.fields[f].$input.prop("checked");
                } else {
                    // else its a dropdown of some kind
                    chartConfig.fields[f] = ct.fields[f].$input.val();
                }
                
            }
        }
        return chartConfig;
    };
    
    // Whenever the chart type dropdown is focused on
    // we should cache the chart config field values
    // we'll re-apply any values that make sense if the chart type changes
    this.cacheChartConfigFieldValues = function () {
        var chartConfig = me.getChartConfiguration();
        _.extend(fieldValueCache, chartConfig.fields);
    };
    
    this.loadChartConfiguration = function (config) {
        // set chart type dropdown
        // build the UI
        // set chart type field values
        var chartType = config.chartType;
        var fieldValues = config.fields;
        $chartTypeDropDown.val(config.chartType);
        me.buildChartUI();
        setChartTypeFieldValues(chartType, fieldValues);
    };
    
    function setChartTypeFieldValues (chartType, fieldValues) {
        if (chartTypes[chartType]) {
            var ct = chartTypes[chartType];
            for (var f in ct.fields) {
                if (fieldValues[f]) {
                    if (ct.fields[f].inputType === "checkbox") {
                        // unfortunately fieldValues[f] is going to be a boolean in string form
                        // so we'll make it a boolean here
                        // It might also be a boolean here too if already converted. so ick.
                        fieldValues[f] = (fieldValues[f] === "true" || fieldValues[f] === true);
                        ct.fields[f].$input.prop("checked", fieldValues[f]);
                    } else {
                        // is a dropdown of some kind
                        // attempt to set the value of what is in the config
                        ct.fields[f].$input.val(fieldValues[f]);
                        // check the value
                        var inputVal = ct.fields[f].$input.val();
                        // if the value is nothing, then we will force it
                        if (!inputVal) {
                            ct.fields[f].$input.append('<option value="' + fieldValues[f] + '">' + fieldValues[f] + '</option>');
                            ct.fields[f].$input.val(fieldValues[f]);
                        }
                    }
                    
                }
            }
        }
    }
    
    this.rerenderChart = function () {
        var chartConfig = me.getChartConfiguration();
        me.buildChartUI();
        me.loadChartConfiguration(chartConfig);
        me.renderChart();
    };
    
    // TODO: factor out the chart piece from the chart editor
    this.renderChart = function () {
        var requirementsMet = true;
        var fieldsNeeded = [];
        
        var selectedChartType = $chartTypeDropDown.val();
        if (chartTypes[selectedChartType]) {
            var ct = chartTypes[selectedChartType];
            // loop through chart type fields and do things like
            // add the value, datatype
            for (var f in ct.fields) {
                var field = ct.fields[f];
                if (field.inputType === "checkbox") {
                    field.val = field.$input.prop("checked");
                } else {
                    // its a dropdown of some kind
                    field.val = field.$input.val();
                }
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
            if (requirementsMet) {
                $('#chart').empty();
                if (chart && chart.destroy) chart.destroy(); // needed for tauChart
                chart = ct.renderChart(gmeta, gdata, ct.fields);
            } else {
                alert("Chart requires additional information: " + fieldsNeeded.join(', '));
            }
        }
    };
    
    this.saveImage = function () {
        // for the saveSvgAsPng to work,
        // height and width must be pixels in the style attribute
        // height and width attributes must be removed
        var $svg = $('#chart').find('svg').first();
        var width = $svg.width();
        var height = $svg.height();
        $svg.attr("style", "width: " + width + "; height:" + height + ";");
        $svg.attr("width", null);
        $svg.attr("height", null);
        // Cheating for now and just referencing element directly
        var imageName = $('#header-query-name').val();
        saveSvgAsPng($svg.get(0), imageName + ".png");
    };

    this.linkToChart = function () {
        window.open('?format=chart', '_queryPreview');
    };
    
    // Bind Events
    $btnVisualize.click(me.renderChart);
    $btnSaveImage.click(me.saveImage);
    $btnLinkToChart.click(me.linkToChart);
    $chartTypeDropDown.change(function () {
        me.buildChartUI();
        var selectedChartType = $chartTypeDropDown.val();
        setChartTypeFieldValues(selectedChartType, fieldValueCache);
    });
    $chartTypeDropDown.focus(me.cacheChartConfigFieldValues);
    $(window).resize(function () {
        // call resize if appropriate
        // tauCharts may handle this for us...
    });
};
module.exports = ChartEditor;
