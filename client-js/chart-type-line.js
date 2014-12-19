var $ = require('jquery');
var dimple = require('dimple');

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
    renderChart: function (meta, data, fields) {
        var $chart = $('#chart');
        var width = $chart.width();
        var height = $chart.height();
        var svg = dimple.newSvg("#chart", width, height);
        var myChart = new dimple.chart(svg, data);
        myChart.setBounds(60, 30, width - 100, height - 90);
        
        if (fields.x.datatype == "date" || fields.x.datatype == "number") {
            
        } else {
            alert("x should be date or number");
        }
        var x = myChart.addCategoryAxis("x", fields.x.val);
        if (fields.x.datatype == "date") x.addOrderRule("Date");
        myChart.addMeasureAxis("y", fields.y.val);
        
        var lineForEach = fields.split.val || null;
        var s = myChart.addSeries(lineForEach, dimple.plot.line);
        //myChart.addLegend(60, 10, width, 20, "right"); 
        myChart.draw();
        return myChart;
    }
};