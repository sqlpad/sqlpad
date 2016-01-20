var tauCharts = require('tauCharts');

module.exports =  {
    chartLabel: "Scatterplot",
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
        color: {
            label: "Color",
            inputType: "field-dropdown",
            required: false
        },
        xFacet: {
            requied: false,
            label: "x Facet",
            inputType: "field-dropdown"
        },
        yFacet: {
            required: false,
            label: "y Facet",
            inputType: "field-dropdown"
        },
        trendline: {
            required: false,
            label: "Show Trendline",
            inputType: "checkbox"
        }
    },
    renderChart: function (meta, data, fields) {
        // fields.x.datatype will be "date", "number", or "text"
        for (var row in data) {
            // make barvalue field a Number
            if (fields.x.datatype == "text" || fields.x.datatype == "number") {
                data[row][fields.x.val] = Number(data[row][fields.x.val]);
            }
            if (fields.y.datatype == "text" || fields.y.datatype == "number") {
                data[row][fields.y.val] = Number(data[row][fields.y.val]);
            }
            if (fields.size.val) {
                data[row][fields.size.val] = Number(data[row][fields.size.val]);    
            }
            // Facets need to be a dimension, not a measure. 
            // tauCharts auto detects numbers to be measures
            // Here we'll convert a number to a string, 
            // to trick tauCharts into thinking its a dimension
            if (fields.xFacet.val && fields.xFacet.datatype == "number" && data[row][fields.xFacet.val]) {
                data[row][fields.xFacet.val] = data[row][fields.xFacet.val].toString();
            }
            if (fields.yFacet.val && fields.yFacet.datatype == "number" && data[row][fields.yFacet.val]) {
                data[row][fields.yFacet.val] = data[row][fields.yFacet.val].toString();
            }
        }
        
        var x = fields.x.val;
        if (fields.xFacet.val) {
            x = [fields.xFacet.val, fields.x.val];
        }
        
        var y = fields.y.val;
        if (fields.yFacet.val) {
            y = [fields.yFacet.val, fields.y.val];
        }
        
        var plugins = [];
        if (fields.trendline.val) {
            plugins.push(tauCharts.api.plugins.get('trendline')());
        }
        plugins.push(tauCharts.api.plugins.get('tooltip')({fields: [fields.x.val, fields.y.val, fields.size.val, fields.color.val]}));
        plugins.push(tauCharts.api.plugins.get('legend')());
        
        var chart = new tauCharts.Chart({
            data: data,
            type: "scatterplot",
            y: y,
            x: x,
            color: fields.color.val,
            size: fields.size.val,
            plugins: plugins
        });
        chart.renderTo('#chart');
        return chart;
    }
};