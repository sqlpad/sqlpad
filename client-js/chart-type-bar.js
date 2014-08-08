var nv = require('nv');
var _  = require('lodash');
var d3 = require('d3');

module.exports =  {
    fields: {
        barlabel: {
            optional: false,
            label: "Bar Label",
            inputType: "field-dropdown",
            $input: null,
            val: null,
            datatype: null,
            min: null,
            max: null
        },
        barvalue: { 
            optional: false,
            label: "Bar Value",
            inputType: "field-dropdown"
        }
    },
    transformData: function (meta, data, fields) {
        return [{
            key: fields.barvalue.val,
            values: data
        }];
    },
    renderChart: function (meta, data, fields) {
        
        var chart = nv.models.multiBarHorizontalChart()
                        
                        // x should be bar label
                        .x(function(d, i) { 
                            if (fields.barlabel.datatype == "date" || fields.barlabel.datatype == "number") {
                                return d[fields.barlabel.val];
                            } else {
                                //return i;
                                return d[fields.barlabel.val];
                            }
                        })
                        // y should be bar value
                        .y(function(d, i) { 
                            if (fields.barvalue.datatype == "date") {
                                return d[fields.barvalue.val];
                            } else if (fields.barvalue.datatype == "number") {
                                return parseInt(d[fields.barvalue.val]);
                            } else {
                                return null;
                            }
                        })
                        .transitionDuration(350)
                        .margin({left: 150, top: 50, right: 50})
                        .tooltips(true)
                        // since this is for 1 bar series, we don't want to show option to stack
                        .showControls(false);
        
        chart.yAxis.axisLabel(fields.barvalue.val);
        
        return chart;
    }
};