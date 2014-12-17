var nv = require('nv');
var _  = require('lodash');
var d3 = require('d3');
var dimple = require('dimple');
var $ = require('jquery');

module.exports =  {
    fields: {
        barlabel: {
            required: true,
            label: "Bar Label",
            inputType: "field-dropdown",
            $input: null,
            val: null,
            datatype: null,
            min: null,
            max: null
        },
        barvalue: { 
            required: true,
            label: "Bar Value",
            inputType: "field-dropdown"
        }
    },
    transformData: function (meta, data, fields) {
        return [{
            key: fields.barvalue.val,
            values: data
        }];
    },
    renderChart: function (meta, data, fields) {
        var $chart = $('#chart');
        var width = $chart.width();
        var height = $chart.height();
        var svg = dimple.newSvg("#chart", width, height);
        var myChart = new dimple.chart(svg, data);
        myChart.setBounds(60, 30, width - 100, height - 90);
        
        //var x = myChart.addCategoryAxis("x", "Month");
        var x = myChart.addCategoryAxis("x", fields.barlabel.val);
        //x.addOrderRule("Month");
        
        //myChart.addMeasureAxis("y", "Unit Sales");
        myChart.addMeasureAxis("y", fields.barvalue.val);
        
        myChart.addSeries(null, dimple.plot.bar);
        myChart.draw();
        return myChart;
        
        /*
        var chart = nv.models.multiBarHorizontalChart()
                        
                        // x should be bar label
                        .x(function(d, i) { 
                            if (fields.barlabel.datatype == "date" || fields.barlabel.datatype == "number") {
                                return d[fields.barlabel.val];
                            } else {
                                //return i;
                                return d[fields.barlabel.val];
                            }
                        })
                        // y should be bar value
                        .y(function(d, i) { 
                            if (fields.barvalue.datatype == "date") {
                                return d[fields.barvalue.val];
                            } else if (fields.barvalue.datatype == "number") {
                                return parseInt(d[fields.barvalue.val]);
                            } else {
                                return null;
                            }
                        })
                        .transitionDuration(350)
                        .margin({left: 150, top: 50, right: 50})
                        .tooltips(true)
                        // since this is for 1 bar series, we don't want to show option to stack
                        .showControls(false);
        
        chart.yAxis.axisLabel(fields.barvalue.val);
        */
        
    }
};