var dimple = require('dimple');

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
    renderChart: function (meta, data, fields) {
        var svg = dimple.newSvg("#chart", "100%", "100%");
        var myChart = new dimple.chart(svg, data);
        myChart.setMargins(80, 30, 30, 80); // left top right bottom
        myChart.addMeasureAxis("x", fields.x.val);
        myChart.addMeasureAxis("y", fields.y.val);
        if (fields.size.val) myChart.addMeasureAxis("z", fields.size.val); // bubble size
        // to get label we could do fields.label.val
        myChart.addSeries([fields.label.val, "bubble color"], dimple.plot.bubble); // TODO: null defines color groupings
        myChart.draw();
        return myChart;
    }
};