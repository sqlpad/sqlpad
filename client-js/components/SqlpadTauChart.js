import React from 'react'
import chartDefinitions from './ChartDefinitions.js'
import SpinKitCube from './SpinKitCube.js'
import Alert from 'react-s-alert'
var _ = window._
const tauCharts = window.tauCharts

var SqlpadTauChart = React.createClass({
  componentDidUpdate: function (prevProps) {
    if (this.props.isRunning || this.props.queryError) {
      this.destroyChart()
    } else if (this.props.renderChart && !this.chart) {
      this.renderChart()
    }
  },
  chart: undefined,
  chartStyle: {
    padding: '20px 10px 10px 20px',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  destroyChart () {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  },
  renderChart: function (rerender) {
    // This is invoked during following:
    //  - Vis tab enter
    //  - Visualize button press (forces rerender)
    //  - new data arrival
    var meta = (this.props.queryResult ? this.props.queryResult.meta : {})
    var dataRows = (this.props.queryResult ? this.props.queryResult.rows : [])
    var chartType = this.props.query.chartConfiguration.chartType
    var selectedFields = this.props.query.chartConfiguration.fields
    var chartDefinition = _.findWhere(chartDefinitions, {chartType: chartType})

    if (rerender || !dataRows.length || !chartDefinition) {
      this.destroyChart()
    }

    // If there's no data just exit the chart render
    if (!dataRows.length) return

    // if there's no chart definition exit the render
    if (!chartDefinition) return

    var chartConfig = {
      type: chartDefinition.tauChartsType,
      plugins: [
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('exportTo')({
          cssPaths: [this.props.config.baseUrl + '/javascripts/vendor/tauCharts/tauCharts.min.css'],
          fileName: this.props.query.name || 'unnamed query'
        })
      ]
    }

    var unmetRequiredFields = []
    var definitionFields = chartDefinition.fields.map(function (field) {
      if (field.required && !selectedFields[field.fieldId]) {
        unmetRequiredFields.push(field)
      }
      field.val = selectedFields[field.fieldId]
      return field
    })
    if (unmetRequiredFields.length) {
      // if rerender is true, a render was explicitly requested by user clicking the vis button
      // TODO - highlight fields that are required but not provided
      if (rerender) {
        Alert.error('Unmet required fields: ' + unmetRequiredFields.map(f => f.label).join(', '))
      }
      return
    }

    // loop through data rows and convert types as needed
    dataRows = dataRows.map((row) => {
      var newRow = {}
      Object.keys(row).forEach(col => {
        var datatype = this.props.queryResult.meta[col].datatype
        if (datatype === 'date') {
          newRow[col] = new Date(row[col])
        } else if (datatype === 'number') {
          newRow[col] = Number(row[col])
        } else {
          newRow[col] = row[col]
        }
      })

      // HACK -
      // Facets need to be a dimension, not a measure.
      // tauCharts auto detects numbers to be measures
      // Here we'll convert a number to a string,
      // to trick tauCharts into thinking its a dimension
      var forceDimensionFields = _.where(definitionFields, {forceDimension: true})
      forceDimensionFields.forEach(function (fieldDefinition) {
        var col = fieldDefinition.val
        var colDatatype = (meta[col] ? meta[col].datatype : null)
        if (col && colDatatype === 'number' && newRow[col]) {
          newRow[col] = newRow[col].toString()
        }
      })
      return newRow
    })

    var definitionFieldsById = _.indexBy(definitionFields, 'fieldId')
    switch (chartType) {
      case 'line':
        chartConfig.x = [definitionFieldsById.x.val]
        if (definitionFieldsById.xFacet.val) {
          chartConfig.x.unshift(definitionFieldsById.xFacet.val)
        }
        chartConfig.y = [definitionFieldsById.y.val]
        if (definitionFieldsById.yFacet.val) {
          chartConfig.y.unshift(definitionFieldsById.yFacet.val)
        }
        if (definitionFieldsById.filter.val) {
          chartConfig.plugins.push(tauCharts.api.plugins.get('quick-filter')())
        }
        if (definitionFieldsById.trendline.val) {
          chartConfig.plugins.push(tauCharts.api.plugins.get('trendline')())
        }
        if (definitionFieldsById.split.val) chartConfig.color = definitionFieldsById.split.val
        if (definitionFieldsById.size.val) chartConfig.size = definitionFieldsById.size.val
        if (definitionFieldsById.yMin.val || definitionFieldsById.yMax.val) {
          chartConfig.guide = {
            y: {autoScale: false}
          }
          if (definitionFieldsById.yMin.val) chartConfig.guide.y.min = Number(definitionFieldsById.yMin.val)
          if (definitionFieldsById.yMax.val) chartConfig.guide.y.max = Number(definitionFieldsById.yMax.val)
        }
        break

      case 'bar':
        chartConfig.x = [definitionFieldsById.barvalue.val]
        if (definitionFieldsById.valueFacet.val) {
          chartConfig.x.unshift(definitionFieldsById.valueFacet.val)
        }
        chartConfig.y = [definitionFieldsById.barlabel.val]
        if (definitionFieldsById.labelFacet.val) {
          chartConfig.y.unshift(definitionFieldsById.labelFacet.val)
        }
        break

      case 'verticalbar':
        chartConfig.y = [definitionFieldsById.barvalue.val]
        if (definitionFieldsById.valueFacet.val) {
          chartConfig.y.unshift(definitionFieldsById.valueFacet.val)
        }
        chartConfig.x = [definitionFieldsById.barlabel.val]
        if (definitionFieldsById.labelFacet.val) {
          chartConfig.x.unshift(definitionFieldsById.labelFacet.val)
        }
        break

      case 'stacked-bar-horizontal':
        chartConfig.x = [definitionFieldsById.barvalue.val]
        if (definitionFieldsById.valueFacet.val) {
          chartConfig.x.unshift(definitionFieldsById.valueFacet.val)
        }
        chartConfig.y = [definitionFieldsById.barlabel.val]
        if (definitionFieldsById.labelFacet.val) {
          chartConfig.y.unshift(definitionFieldsById.labelFacet.val)
        }
        if (definitionFieldsById.color.val) chartConfig.color = definitionFieldsById.color.val
        break

      case 'stacked-bar-vertical':
        chartConfig.y = [definitionFieldsById.barvalue.val]
        if (definitionFieldsById.valueFacet.val) {
          chartConfig.y.unshift(definitionFieldsById.valueFacet.val)
        }
        chartConfig.x = [definitionFieldsById.barlabel.val]
        if (definitionFieldsById.labelFacet.val) {
          chartConfig.x.unshift(definitionFieldsById.labelFacet.val)
        }
        if (definitionFieldsById.color.val) chartConfig.color = definitionFieldsById.color.val
        break

      case 'bubble':
        chartConfig.x = [definitionFieldsById.x.val]
        if (definitionFieldsById.xFacet.val) {
          chartConfig.x.unshift(definitionFieldsById.xFacet.val)
        }
        chartConfig.y = [definitionFieldsById.y.val]
        if (definitionFieldsById.yFacet.val) {
          chartConfig.y.unshift(definitionFieldsById.yFacet.val)
        }
        if (definitionFieldsById.filter.val) {
          chartConfig.plugins.push(tauCharts.api.plugins.get('quick-filter')())
        }
        if (definitionFieldsById.trendline.val) {
          chartConfig.plugins.push(tauCharts.api.plugins.get('trendline')())
        }
        if (definitionFieldsById.size.val) chartConfig.size = definitionFieldsById.size.val
        if (definitionFieldsById.color.val) chartConfig.color = definitionFieldsById.color.val
        break

      default:
        console.error('unknown chart type')
    }

    // Add data to chart config
    chartConfig.data = dataRows

    if (!this.chart) {
      this.chart = new tauCharts.Chart(chartConfig)
      this.chart.renderTo('#chart')
    } else {
      this.chart.setData(dataRows)
    }
  },
  setData: function (chartData) {
    this.chart.setData(chartData)
  },
  componentWillUnmount () {
    this.destroyChart()
  },
  render: function () {
    var runResultNotification = () => {
      if (this.props.isRunning) {
        return (
          <div className='run-result-notification' style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}}>
            <SpinKitCube />
          </div>
        )
      } else if (this.props.queryError) {
        return (
          <div className='run-result-notification label-danger'>
            {this.props.queryError}
          </div>
        )
      } else {
        return null
      }
    }
    return (
      <div id='chart' style={this.chartStyle}>
        {runResultNotification()}
      </div>
    )
  }
})

export default SqlpadTauChart
