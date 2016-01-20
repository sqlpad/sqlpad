var tauCharts = require('tauCharts');

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
        labelFacet: {
            required: false,
            label: "Bar Label Facet",
            inputType: "field-dropdown"
        },
        valueFacet: {
            required: false,
            label: "Bar Value Facet",
            inputType: "field-dropdown"
        }
    },
    renderChart: function (meta, data, fields) {
        for (var row in data) {
            // make barvalue field a Number
            data[row][fields.barvalue.val] = Number(data[row][fields.barvalue.val]);
            // Facets need to be a dimension, not a measure. 
            // tauCharts auto detects numbers to be measures
            // Here we'll convert a number to a string, 
            // to trick tauCharts into thinking its a dimension
            if (fields.labelFacet.val && fields.labelFacet.datatype == "number" && data[row][fields.labelFacet.val]) {
                data[row][fields.labelFacet.val] = data[row][fields.labelFacet.val].toString();
            }
            if (fields.valueFacet.val && fields.valueFacet.datatype == "number" && data[row][fields.valueFacet.val]) {
                data[row][fields.valueFacet.val] = data[row][fields.valueFacet.val].toString();
            }
        }
        var x = fields.barvalue.val;
        if (fields.valueFacet.val) {
            x = [fields.valueFacet.val, fields.barvalue.val];
        }
        var y = fields.barlabel.val;
        if (fields.labelFacet.val) {
            y = [fields.labelFacet.val, fields.barlabel.val];
        }
        var chart = new tauCharts.Chart({
            data: data,
            type: "horizontal-bar",
            y: y,
            x: x,
            plugins: [
                tauCharts.api.plugins.get('tooltip')({fields: [fields.barlabel.val, fields.barvalue.val, fields.labelFacet.val, fields.valueFacet.val]}),
                tauCharts.api.plugins.get('legend')()
            ]
        });
        chart.renderTo('#chart');
        return chart;
    }
};