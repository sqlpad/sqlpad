var dimple = require('dimple');

module.exports =  {
    chartLabel: "Bar - Horizontal",
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
        },
        sortField: {
            required: false,
            label: "Sort Field",
            inputType: "field-dropdown"
        },
        sortOrder: {
            required: false,
            label: "Sort Order",
            inputType: "custom-dropdown",
            options: [{value: "asc", label: "ascending"},{value: "desc", label: "descending"}]
        }
    },
    renderChart: function (meta, data, fields) {
        // preserve order in array
        // TODO: we may not need this
        var order = [];
        for (var i = 0; i < data.length; i += 1) {
            if (order.indexOf(data[i][fields.barlabel.val]) === -1) {
                order.push(data[i][fields.barlabel.val]);
            }
        }
        
        var svg = dimple.newSvg("#chart", "100%", "100%");
        // svg is a d3 selection
        svg.attr("id", "svgchart");
        
        var myChart = new dimple.chart(svg, data);
        myChart.setMargins(80, 30, 30, 80); // left top right bottom
        
        var y = myChart.addCategoryAxis("y", fields.barlabel.val);
        
        var x = myChart.addMeasureAxis("x", fields.barvalue.val);
        
        var s = myChart.addSeries(null, dimple.plot.bar);
        
        /*
        y.addOrderRule(function (r1, r2) {
            console.log("---");
            console.log(r1);
            console.log(r2);
            if (r1[fields.barvalue.val][0] < r2[fields.barvalue.val][0]) {
                return 1;
            } else if (r1[fields.barvalue.val][0] > r2[fields.barvalue.val][0]) {
                return -1;
            } else {
                return 0;
            }
        }, true);
        */
        //y.addOrderRule(order, true);
        
        // IMPORTANT: This seems backwards. Dimple might have it backwards. 
        // Or do I have it backwards? 
        // Doesn't matter - this gives me the results I'm expecting
        
        if (fields.sortOrder.val) {
            var sortDesc = (fields.sortOrder.val == "asc" ? true : false);
            y.addOrderRule(fields.sortField.val || fields.barvalue.val, sortDesc);
        }
        
        myChart.draw();
        return myChart;
    }
};