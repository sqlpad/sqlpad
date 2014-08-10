var nv = require('nv');
var _  = require('lodash');
var d3 = require('d3');

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
    }
};