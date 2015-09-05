var tauCharts = require('tauCharts');
var _ = require('lodash');
var $ = require('jquery');

module.exports =  {
    chartLabel: "Bar - Vertical",
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
        if (fields.sortField.val) {
            var sortOrder = "asc";
            if (fields.sortOrder.val) sortOrder = fields.sortOrder.val;
            data = _.sortByOrder(data, [fields.sortField.val], [sortOrder]);
        }
        var y = fields.barvalue.val;
        if (fields.valueFacet.val) {
            y = [fields.valueFacet.val, fields.barvalue.val];
        }
        var x = fields.barlabel.val;
        if (fields.labelFacet.val) {
            x = [fields.labelFacet.val, fields.barlabel.val];
        }
        var chart = new tauCharts.Chart({
            data: data,
            type: "bar",
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