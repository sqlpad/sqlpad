var nv = require('nv');
var _  = require('lodash');
var d3 = require('d3');

module.exports =  {
    fields: {
        x: {
            required: true,
            label: "x",
            inputType: "field-dropdown",
            $input: null,
            val: null,
            datatype: null,
            min: null,
            max: null
        },
        y: { 
            required: true,
            label: "y",
            inputType: "field-dropdown"
        },
        split: {
            required: false,
            label: "line for each:",
            inputType: "field-dropdown"
        }
    },
    transformData: function (meta, data, fields) {
        var chartData = [];
        var splitField = fields.split.val;
        if (splitField) {
            var indexed = _.groupBy(data, splitField);
            console.log(indexed);
            _.forOwn(indexed, function (data, key) {
                chartData.push({
                    key: key,
                    values: data
                });
            });
        } else { 
            chartData = [{
                key: fields.y.val,
                values: data
            }];
        }
        return chartData;
    },
    renderChart: function (meta, data, fields) {
        
        var ymin = 0;
        if (fields.y.min < 0) ymin = fields.y.min;
        
        var chart = nv.models.lineChart()
                        .margin({left: 50, top: 50, right: 50})
                        .x(function(d, i) { 
                            if (fields.x.datatype == "date" || fields.x.datatype == "number") {
                                return d[fields.x.val];
                            } else {
                                return i;
                            }
                        })
                        .y(function(d, i) { 
                            if (fields.y.datatype == "date") {
                                return d[fields.y.val];
                            } else if (fields.y.datatype == "number") {
                                return parseInt(d[fields.y.val]);
                            } else {
                                return null;
                            }
                        })
                        .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                        .transitionDuration(350)        //how fast do you want the lines to transition?
                        .showLegend(true)               //Show the legend, allowing users to turn on/off line series.
                        .showYAxis(true)                //Show the y-axis
                        .showXAxis(true)                //Show the x-axis
                        .forceY([0, ymin]) 
                        .clipEdge(false);                // I don't know what this does
        
        if (fields.x.datatype == 'date') { 
            chart.xAxis.tickFormat(function(d) { 
                return d3.time.format('%x')(new Date(d)); 
            });
        } else {
            chart.xAxis.axisLabel(fields.x.val);
        }
        
        chart.yAxis.axisLabel(fields.y.val);
        
        return chart;
    }
};