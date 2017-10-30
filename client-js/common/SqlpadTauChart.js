import React from 'react'
import PropTypes from 'prop-types'
import chartDefinitions from '../utilities/chartDefinitions.js'
import SpinKitCube from './SpinKitCube.js'
import Alert from 'react-s-alert'
import 'd3'
import { Chart } from 'taucharts'
import exportTo from 'taucharts/build/development/plugins/tauCharts.export'
import trendline from 'taucharts/build/development/plugins/tauCharts.trendline'
import tooltip from 'taucharts/build/development/plugins/tauCharts.tooltip'
import legend from 'taucharts/build/development/plugins/tauCharts.legend'
import quickFilter from 'taucharts/build/development/plugins/tauCharts.quick-filter'

class SqlpadTauChart extends React.Component {
  displayName = 'SqlpadTauChart'

  componentDidUpdate(prevProps) {
    const { isRunning, queryError, renderChart } = this.props
    if (isRunning || queryError) {
      this.destroyChart()
    } else if (renderChart && !this.chart) {
      this.renderChart()
    }
  }

  chart = undefined

  destroyChart = () => {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }

  renderChart = rerender => {
    const { config, queryResult, query } = this.props
    // This is invoked during following:
    //  - Vis tab enter
    //  - Visualize button press (forces rerender)
    //  - new data arrival
    const meta = queryResult ? queryResult.meta : {}
    let dataRows = queryResult ? queryResult.rows : []
    const chartType = query.chartConfiguration.chartType
    const selectedFields = query.chartConfiguration.fields

    const chartDefinition = chartDefinitions.find(
      def => def.chartType === chartType
    )

    if (rerender || !dataRows.length || !chartDefinition) {
      this.destroyChart()
    }

    // If there's no data just exit the chart render
    if (!dataRows.length) return

    // if there's no chart definition exit the render
    if (!chartDefinition) return

    const chartConfig = {
      type: chartDefinition.tauChartsType,
      plugins: [
        tooltip(),
        legend(),
        exportTo({
          cssPaths: [
            // NOTE: We must ref the file in vendor dir for export images to work
            // (we don't know what the webpack bundle css path will be)
            config.baseUrl + '/javascripts/vendor/tauCharts/tauCharts.min.css'
          ],
          fileName: query.name || 'Unnamed query'
        })
      ],
      settings: {
        asyncRendering: true,
        renderingTimeout: 10000,
        syncRenderingInterval: 50,
        handleRenderingErrors: true
      }
    }

    const unmetRequiredFields = []
    const definitionFields = chartDefinition.fields.map(function(field) {
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
        Alert.error(
          'Unmet required fields: ' +
            unmetRequiredFields.map(f => f.label).join(', ')
        )
      }
      return
    }

    // loop through data rows and convert types as needed
    dataRows = dataRows.map(row => {
      const newRow = {}
      Object.keys(row).forEach(col => {
        const datatype = queryResult.meta[col].datatype
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
      const forceDimensionFields = definitionFields.filter(
        field => field.forceDimension === true
      )
      forceDimensionFields.forEach(function(fieldDefinition) {
        const col = fieldDefinition.val
        const colDatatype = meta[col] ? meta[col].datatype : null
        if (col && colDatatype === 'number' && newRow[col]) {
          newRow[col] = newRow[col].toString()
        }
      })
      return newRow
    })

    const definitionFieldsById = definitionFields.reduce((agg, field) => {
      agg[field.fieldId] = field
      return agg
    }, {})

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
          chartConfig.plugins.push(quickFilter())
        }
        if (definitionFieldsById.trendline.val) {
          chartConfig.plugins.push(trendline())
        }
        if (definitionFieldsById.split.val) {
          chartConfig.color = definitionFieldsById.split.val
        }
        if (definitionFieldsById.size.val) {
          chartConfig.size = definitionFieldsById.size.val
        }
        if (definitionFieldsById.yMin.val || definitionFieldsById.yMax.val) {
          chartConfig.guide = {
            y: { autoScale: false }
          }
          if (definitionFieldsById.yMin.val) {
            chartConfig.guide.y.min = Number(definitionFieldsById.yMin.val)
          }
          if (definitionFieldsById.yMax.val) {
            chartConfig.guide.y.max = Number(definitionFieldsById.yMax.val)
          }
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
        if (definitionFieldsById.color.val) {
          chartConfig.color = definitionFieldsById.color.val
        }
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
        if (definitionFieldsById.color.val) {
          chartConfig.color = definitionFieldsById.color.val
        }
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
          chartConfig.plugins.push(quickFilter())
        }
        if (definitionFieldsById.trendline.val) {
          chartConfig.plugins.push(trendline())
        }
        if (definitionFieldsById.size.val) {
          chartConfig.size = definitionFieldsById.size.val
        }
        if (definitionFieldsById.color.val) {
          chartConfig.color = definitionFieldsById.color.val
        }
        break

      default:
        console.error('unknown chart type')
    }

    // Add data to chart config
    chartConfig.data = dataRows

    if (!this.chart) {
      this.chart = new Chart(chartConfig)
      this.chart.renderTo('#chart')
    } else {
      this.chart.setData(dataRows)
    }
  }

  setData = chartData => {
    this.chart.setData(chartData)
  }

  componentWillUnmount() {
    this.destroyChart()
  }

  renderResultNotification() {
    const { isRunning, queryError } = this.props
    if (isRunning) {
      return (
        <div
          className="flex-100 run-result-notification"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
        >
          <SpinKitCube />
        </div>
      )
    } else if (queryError) {
      return (
        <div className="flex-100 run-result-notification label-danger">
          {queryError}
        </div>
      )
    }
  }

  render() {
    return (
      <div
        id="chart"
        className="flex-100"
        style={{
          padding: '20px 10px 10px 20px'
        }}
      >
        {this.renderResultNotification()}
      </div>
    )
  }
}

SqlpadTauChart.propTypes = {
  config: PropTypes.object.isRequired,
  isRunning: PropTypes.bool,
  query: PropTypes.object,
  queryError: PropTypes.string,
  queryResult: PropTypes.object,
  renderChart: PropTypes.bool
}

export default SqlpadTauChart
