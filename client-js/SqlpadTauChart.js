var React = require('react');
var _ = require('_');
var chartDefinitions = require('./ChartDefinitions.js');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var tauCharts = require('tauCharts');
var deepEqual = require('deep-equal');

var SqlpadTauChart = React.createClass({
    componentDidUpdate: function (prevProps) {
        if (!deepEqual(prevProps.queryResult, this.props.queryResult)) {
            console.log("rendering because queryResults changed")
            this.renderChart();
        }
    },
    chart: undefined,
    renderChart: function (rerender) {
        // This is invoked during following: 
        //  - Vis tab enter
        //  - Visualize button press (forces rerender)
        //  - new data arrival
        var meta = (this.props.queryResult ? this.props.queryResult.meta : {});
        var dataRows = (this.props.queryResult ? this.props.queryResult.rows : []);
        var chartType = this.props.query.chartConfiguration.chartType;
        var selectedFields = this.props.query.chartConfiguration.fields;
        var chartDefinition = _.findWhere(chartDefinitions, {chartType: chartType})
        
        // If there's no data just exit the chart render
        if (!dataRows.length) return;

        var chartConfig = {
            type: chartDefinition.tauChartsType,
            plugins: [
                tauCharts.api.plugins.get('tooltip')(),
                tauCharts.api.plugins.get('legend')(),
                tauCharts.api.plugins.get('exportTo')({
                    cssPaths:[baseUrl + '/javascripts/vendor/tauCharts/tauCharts.min.css'],
                    fileName: this.props.query.name || 'unnamed query'
                })
            ]
        };

        var unmetRequiredFields = [];
        var definitionFields = chartDefinition.fields.map(function (field) {
            if (field.required && !selectedFields[field.fieldId]) {
                unmetRequiredFields.push(field);
            }
            field.val = selectedFields[field.fieldId]
            return field;
        });
        if (unmetRequiredFields.length) {
            alert('unmet required fields');
        }

        // loop through data rows and convert types as needed
        dataRows = dataRows.map((row) => {
            for (var col in row) {
                var datatype = this.props.queryResult.meta[col].datatype;
                if (datatype == 'date') {
                    row[col] = new Date(row[col]);
                } else if (datatype == 'number') {
                    row[col] = Number(row[col]);
                }
            }
            // HACK - 
            // Facets need to be a dimension, not a measure. 
            // tauCharts auto detects numbers to be measures
            // Here we'll convert a number to a string, 
            // to trick tauCharts into thinking its a dimension
            var forceDimensionFields = _.where(definitionFields, {forceDimension: true});
            forceDimensionFields.forEach(function (fieldDefinition) {
                var col = fieldDefinition.val;
                var colDatatype = (meta[col] ? meta[col].datatype : null);
                if (col && colDatatype == 'number' && row[col]) {
                    row[col] = row[col].toString();
                }
            });
            return row;
        });
        
        var definitionFieldsById = _.indexBy(definitionFields, 'fieldId');
        switch (chartType) {
            case 'line':
                chartConfig.x = [definitionFieldsById.x.val];
                if (definitionFieldsById.xFacet.val) {
                    chartConfig.x.unshift(definitionFieldsById.xFacet.val)
                }
                chartConfig.y = [definitionFieldsById.y.val]
                if (definitionFieldsById.yFacet.val) {
                    chartConfig.y.unshift(definitionFieldsById.yFacet.val)
                }
                if (definitionFieldsById.filter.val) {
                    chartConfig.plugins.push(tauCharts.api.plugins.get('quick-filter')());
                }
                if (definitionFieldsById.trendline.val) {
                    chartConfig.plugins.push(tauCharts.api.plugins.get('trendline')());
                }
                if (definitionFieldsById.split.val) chartConfig.color = definitionFieldsById.split.val;
                if (definitionFieldsById.size.val) chartConfig.size = definitionFieldsById.size.val; 
                if (definitionFieldsById.yMin.val || definitionFieldsById.yMax.val) {
                    chartConfig.guide = {
                        y: {autoScale: false}
                    };
                    if (definitionFieldsById.yMin.val) chartConfig.guide.y.min = Number(definitionFieldsById.yMin.val);
                    if (definitionFieldsById.yMax.val) chartConfig.guide.y.max = Number(definitionFieldsById.yMax.val);
                }
                break;

            case 'bar': 
                chartConfig.x = [definitionFieldsById.barvalue.val];
                if (definitionFieldsById.valueFacet.val) {
                    chartConfig.x.unshift(definitionFieldsById.valueFacet.val);
                }
                chartConfig.y = [definitionFieldsById.barlabel.val];
                if (definitionFieldsById.labelFacet.val) {
                    chartConfig.y.unshift(definitionFieldsById.labelFacet.val);
                }
                break;
            
            case 'verticalbar': 
                chartConfig.y = [definitionFieldsById.barvalue.val];
                if (definitionFieldsById.valueFacet.val) {
                    chartConfig.y.unshift(definitionFieldsById.valueFacet.val);
                }
                chartConfig.x = [definitionFieldsById.barlabel.val];
                if (definitionFieldsById.labelFacet.val) {
                    chartConfig.x.unshift(definitionFieldsById.labelFacet.val);
                }
                break;
            
            case 'bubble': 
                chartConfig.x = [definitionFieldsById.x.val];
                if (definitionFieldsById.xFacet.val) {
                    chartConfig.x.unshift(definitionFieldsById.xFacet.val)
                }
                chartConfig.y = [definitionFieldsById.y.val]
                if (definitionFieldsById.yFacet.val) {
                    chartConfig.y.unshift(definitionFieldsById.yFacet.val)
                }
                if (definitionFieldsById.filter.val) {
                    chartConfig.plugins.push(tauCharts.api.plugins.get('quick-filter')());
                }
                if (definitionFieldsById.trendline.val) {
                    chartConfig.plugins.push(tauCharts.api.plugins.get('trendline')());
                }
                if (definitionFieldsById.size.val) chartConfig.size = definitionFieldsById.size.val;
                if (definitionFieldsById.color.val) chartConfig.color = definitionFieldsById.color.val; 
                break;
            
            default:   
                console.error('unknown chart type');
        }

        // Add data to chart config
        chartConfig.data = dataRows;

        
        if (!this.chart) {
            this.chart = new tauCharts.Chart(chartConfig);
            this.chart.renderTo('#chart');
        } else if (this.chart && rerender) {
            this.chart.destroy();
            this.chart = new tauCharts.Chart(chartConfig);
            this.chart.renderTo('#chart');
        } else {
            this.chart.setData(dataRows);
        }
    },
    setData: function (chartData) {
        this.chart.setData(chartData);
    },
    componentWillUnmount() {
		this.chart.destroy();
	},
    render: function () {
        var runResultNotification = () => {
            if (!this.chart && this.props.isRunning) {
                return (
                    <div className="run-result-notification">
                        <Glyphicon glyph="refresh" className="spinning" /> Loading
                    </div>
                )
            }
            return null;
        }
        var runResultErrorNotification = () => {
            if (this.props.queryError) {
                return (
                    <div className="run-result-notification label-danger">
                        {this.props.queryError}
                    </div>
                )
            }
        }
        return (
            <div id="chart">
                {runResultNotification()}
                {runResultErrorNotification()}
            </div>
        )
    }
});

module.exports = SqlpadTauChart;