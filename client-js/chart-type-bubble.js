var nv = require('nv');
var _  = require('lodash');
var d3 = require('d3');
var dimple = require('dimple');
var $ = require('jquery');

module.exports =  {
    fields: {
        x: {
            label: "x Axis",
            inputType: "field-dropdown",
            required: true,
            $input: null,
            val: null,
            datatype: null,
            min: null,
            max: null
        },
        y: { 
            label: "y Axis",
            inputType: "field-dropdown",
            required: true
        },
        size: {
            label: "Size",
            inputType: "field-dropdown",
            required: false
        },
        label: {
            label: "Bubble Label",
            inputType: "field-dropdown",
            required: false
        }
    },
    transformData: function (meta, data, fields) {
        
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            d.x = parseInt(d[fields.x.val]);
            d.y = parseInt(d[fields.y.val]);
            if (fields.size.val) {
                d.size = parseInt(d[fields.size.val]);
            } else {
                d.size = 1;
            }
        }
        console.log(data);
        var chartData = [{
            key: "bubble group",
            values: data
        }];
        return chartData;
    },
    renderChart: function (meta, data, fields) {
        
        var $chart = $('#chart');
        var width = $chart.width();
        var height = $chart.height();
        var svg = dimple.newSvg("#chart", width, height);
        var myChart = new dimple.chart(svg, data);
        myChart.setBounds(60, 30, width - 100, height - 90);
        
        
        myChart.addMeasureAxis("x", fields.x.val);
        myChart.addMeasureAxis("y", fields.y.val);
        if (fields.size.val) myChart.addMeasureAxis("z", fields.size.val); // bubble size
        // to get label we could do fields.label.val
        myChart.addSeries([fields.label.val, "bubble color"], dimple.plot.bubble); // TODO: null defines color groupings
        
        myChart.draw();
        return myChart;
        
        
        ///////////////////
        /*
        var chart = nv.models.scatterChart()
                    .showDistX(true)    //showDist, when true, will display those little distribution lines on the axis.
                    .showDistY(true)
                    .transitionDuration(350)
                    .color(d3.scale.category10().range());
        
        //Configure how the tooltip looks.
        chart.tooltipContent(function(key, x, y, e, graph) {
            // TODO: add a field for bubble-label. Can get at stuff like:
            // e.point.author_name
            // e.point[fields.label.val]
            if (fields.label.val) {
				return '<h4> ' + e.point[fields.label.val] + ' </h4>'; 
            } else {
                return '<pre>' + JSON.stringify(e.point, null, 2) + '</pre>';
            }
            
        });
        
        //We want to show shapes other than circles.
        chart.scatter.onlyCircles(true);
        
        //Axis settings
        chart.xAxis.tickFormat(d3.format('.02f'));
        chart.yAxis.tickFormat(d3.format('.02f'));
        
        return chart;
        */
    }
};