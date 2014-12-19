var $ = require('jquery');
var dimple = require('dimple');

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
    }
};