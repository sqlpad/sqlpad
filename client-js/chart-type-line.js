var nv = require('nv');
var _  = require('lodash');
var d3 = require('d3');
var dimple = require('dimple');
var $ = require('jquery');

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
        
        
        var $chart = $('#chart');
        var width = $chart.width();
        var height = $chart.height();
        var svg = dimple.newSvg("#chart", width, height);
        var myChart = new dimple.chart(svg, data);
        myChart.setBounds(60, 30, width - 100, height - 90);
        
        if (fields.x.datatype == "date" || fields.x.datatype == "number") {
            
        } else {
            alert("x should be date or number")
        }
        var x = myChart.addCategoryAxis("x", fields.x.val);
        if (fields.x.datatype == "date") x.addOrderRule("Date");
        myChart.addMeasureAxis("y", fields.y.val);
        
        var lineForEach = fields.split.val || null;
        var s = myChart.addSeries(lineForEach, dimple.plot.line);
        s.interpolation = "cardinal";                   // add line smoothing
        //myChart.addLegend(60, 10, width, 20, "right"); 
        myChart.draw();
        return myChart;
    
        
        /////////////////////////
        /*
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
        */
    }
};