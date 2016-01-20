var tauCharts = require('tauCharts');

module.exports =  {
    chartLabel: "Line",
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
            label: "color / line for each",
            inputType: "field-dropdown"
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
            data[row][fields.y.val] = Number(data[row][fields.y.val]);
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
        var chart;
        var lineForEach = fields.split.val;
        
        var plugins = [];
        if (fields.trendline.val) {
            plugins.push(tauCharts.api.plugins.get('trendline')());
        }
        plugins.push(tauCharts.api.plugins.get('tooltip')({fields: [fields.x.val, fields.y.val, lineForEach]}));
        plugins.push(tauCharts.api.plugins.get('legend')());
        
        if (lineForEach) {
            chart = new tauCharts.Chart({
                data: data,
                type: 'line',
                x: x,
                y: y,
                color: lineForEach, // there will be two lines with different colors on the chart
                plugins: plugins
            });
        } else {
            chart = new tauCharts.Chart({
                data: data,
                type: 'line',
                x: x,
                y: y,
                plugins: plugins
            });
        }
        chart.renderTo('#chart');
        return chart;
    }
};