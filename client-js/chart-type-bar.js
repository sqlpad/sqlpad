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
        var svg = dimple.newSvg("#chart", "100%", "100%");
        var myChart = new dimple.chart(svg, data);
        myChart.setMargins(80, 30, 30, 80); // left top right bottom
        
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