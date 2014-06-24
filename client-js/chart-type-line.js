var nv = require('nv');

module.exports =  {
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
    transformData: function (meta, data, fields) {
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
                        .transitionDuration(350)        //how fast do you want the lines to transition?
                        .showLegend(true)               //Show the legend, allowing users to turn on/off line series.
                        .showYAxis(true)                //Show the y-axis
                        .showXAxis(true)                //Show the x-axis
                        .clipEdge(false);                // I don't know what this does
        
        chart.xAxis.axisLabel($x.val());
            //.tickFormat(d3.format(',r'));
        chart.yAxis.axisLabel($y.val());
            //.tickFormat(d3.format('.02f'));
        
        return chart;
    }
}