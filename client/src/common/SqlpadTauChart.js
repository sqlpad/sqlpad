import message from 'antd/lib/message';
import 'd3';
import PropTypes from 'prop-types';
import React from 'react';
import { Chart } from 'taucharts';
import exportTo from 'taucharts/build/development/plugins/tauCharts.export';
import legend from 'taucharts/build/development/plugins/tauCharts.legend';
import quickFilter from 'taucharts/build/development/plugins/tauCharts.quick-filter';
import tooltip from 'taucharts/build/development/plugins/tauCharts.tooltip';
import tcTrendline from 'taucharts/build/development/plugins/tauCharts.trendline';
import chartDefinitions from '../utilities/chartDefinitions.js';
import SpinKitCube from './SpinKitCube.js';

class SqlpadTauChart extends React.Component {
  displayName = 'SqlpadTauChart';

  componentDidUpdate(prevProps) {
    const { isRunning, queryError, renderChart } = this.props;
    if (isRunning || queryError) {
      this.destroyChart();
    } else if (renderChart && !this.chart) {
      this.renderChart();
    }
  }

  chart = undefined;

  destroyChart = () => {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  };

  getUnmetFields = (chartType, selectedFieldMap) => {
    const chartDefinition = chartDefinitions.find(
      def => def.chartType === chartType
    );
    if (!chartDefinition) {
      throw new Error(`Unknown chartType ${chartType}`);
    }
    const unmetRequiredFields = [];

    chartDefinition.fields.forEach(field => {
      if (field.required && !selectedFieldMap[field.fieldId]) {
        unmetRequiredFields.push(field);
      }
    });

    return unmetRequiredFields;
  };

  renderChart = rerender => {
    const { queryResult, query } = this.props;
    // This is invoked during following:
    //  - Vis tab enter
    //  - Visualize button press (forces rerender)
    //  - new data arrival
    const meta = queryResult ? queryResult.meta : {};
    let dataRows = queryResult ? queryResult.rows : [];
    const chartType = query.chartConfiguration.chartType;
    const selectedFields = query.chartConfiguration.fields;

    const chartDefinition = chartDefinitions.find(
      def => def.chartType === chartType
    );

    if (rerender || !dataRows.length || !chartDefinition) {
      this.destroyChart();
    }

    // If there's no data just exit the chart render
    if (!dataRows.length) {
      return;
    }

    // if there's no chart definition exit the render
    if (!chartDefinition) {
      return;
    }

    const chartConfig = {
      type: chartDefinition.tauChartsType,
      plugins: [
        tooltip(),
        legend(),
        exportTo({
          cssPaths: [
            // NOTE: We must ref the file in vendor dir for export images to work
            // (we don't know what the webpack bundle css path will be)
            window.BASE_URL + '/javascripts/vendor/tauCharts/tauCharts.min.css'
          ],
          fileName: query.name || 'Unnamed query'
        })
      ],
      settings: {
        asyncRendering: true,
        renderingTimeout: 10000,
        syncRenderingInterval: 50,
        handleRenderingErrors: true,
        utcTime: true
      }
    };

    // loop through data rows and convert types as needed
    dataRows = dataRows.map(row => {
      const newRow = {};
      Object.keys(row).forEach(col => {
        const datatype = queryResult.meta[col].datatype;
        if (datatype === 'date') {
          newRow[col] = new Date(row[col]);
        } else if (datatype === 'number') {
          newRow[col] = Number(row[col]);
        } else {
          newRow[col] = row[col];
        }
      });

      // HACK -
      // Facets need to be a dimension, not a measure.
      // tauCharts auto detects numbers to be measures
      // Here we'll convert a number to a string,
      // to trick tauCharts into thinking its a dimension
      const forceDimensionFields = chartDefinition.fields.filter(
        field => field.forceDimension === true
      );
      forceDimensionFields.forEach(fieldDefinition => {
        const col = selectedFields[fieldDefinition.fieldId];
        const colDatatype = meta[col] ? meta[col].datatype : null;
        if (col && colDatatype === 'number' && newRow[col]) {
          newRow[col] = newRow[col].toString();
        }
      });
      return newRow;
    });

    // Some chartConfiguration.fields may reference columns that no longer exist
    // Remove them from a copy of chartConfigurationFields
    // Unless they aren't column mapping fields (like trendline, quickfilter)
    const cleanedChartConfigurationFields = Object.keys(
      query.chartConfiguration.fields
    ).reduce((fieldsMap, field) => {
      const fieldDefinition = chartDefinition.fields.find(
        f => f.fieldId === field
      );
      const value = query.chartConfiguration.fields[field];

      if (fieldDefinition && fieldDefinition.inputType !== 'field-dropdown') {
        fieldsMap[field] = value;
      } else if (meta[value]) {
        fieldsMap[field] = value;
      }
      return fieldsMap;
    }, {});

    // Now that non-existing columns are removed from the configuration fields
    // Validate that the chart required fields are provided
    const unmetFields = this.getUnmetFields(
      chartType,
      cleanedChartConfigurationFields
    );

    if (unmetFields.length) {
      // if rerender is true, a render was explicitly requested by user clicking the vis button
      // TODO - highlight fields that are required but not provided or clear values no longer relevant
      if (rerender) {
        message.error(
          'Unmet required fields: ' + unmetFields.map(f => f.label).join(', ')
        );
      }
      return;
    }

    const {
      x,
      xFacet,
      y,
      yFacet,
      filter,
      trendline,
      split,
      size,
      yMin,
      yMax,
      barvalue,
      valueFacet,
      barlabel,
      labelFacet,
      color
    } = cleanedChartConfigurationFields;

    switch (chartType) {
      case 'line':
        chartConfig.x = [x];
        if (xFacet) {
          chartConfig.x.unshift(xFacet);
        }
        chartConfig.y = [y];
        if (yFacet) {
          chartConfig.y.unshift(yFacet);
        }
        if (filter) {
          chartConfig.plugins.push(quickFilter());
        }
        if (trendline) {
          chartConfig.plugins.push(tcTrendline());
        }
        if (split) {
          chartConfig.color = split;
        }
        if (size) {
          chartConfig.size = size;
        }
        if (yMin || yMax) {
          chartConfig.guide = {
            y: { autoScale: false }
          };
          if (yMin) {
            chartConfig.guide.y.min = Number(yMin);
          }
          if (yMax) {
            chartConfig.guide.y.max = Number(yMax);
          }
        }
        break;

      case 'bar':
        chartConfig.x = [barvalue];
        if (valueFacet) {
          chartConfig.x.unshift(valueFacet);
        }
        chartConfig.y = [barlabel];
        if (labelFacet) {
          chartConfig.y.unshift(labelFacet);
        }
        break;

      case 'verticalbar':
        chartConfig.y = [barvalue];
        if (valueFacet) {
          chartConfig.y.unshift(valueFacet);
        }
        chartConfig.x = [barlabel];
        if (labelFacet) {
          chartConfig.x.unshift(labelFacet);
        }
        break;

      case 'stacked-bar-horizontal':
        chartConfig.x = [barvalue];
        if (valueFacet) {
          chartConfig.x.unshift(valueFacet);
        }
        chartConfig.y = [barlabel];
        if (labelFacet) {
          chartConfig.y.unshift(labelFacet);
        }
        if (color) {
          chartConfig.color = color;
        }
        break;

      case 'stacked-bar-vertical':
        chartConfig.y = [barvalue];
        if (valueFacet) {
          chartConfig.y.unshift(valueFacet);
        }
        chartConfig.x = [barlabel];
        if (labelFacet) {
          chartConfig.x.unshift(labelFacet);
        }
        if (color) {
          chartConfig.color = color;
        }
        break;

      case 'bubble':
        chartConfig.x = [x];
        if (xFacet) {
          chartConfig.x.unshift(xFacet);
        }
        chartConfig.y = [y];
        if (yFacet) {
          chartConfig.y.unshift(yFacet);
        }
        if (filter) {
          chartConfig.plugins.push(quickFilter());
        }
        if (trendline) {
          chartConfig.plugins.push(tcTrendline());
        }
        if (size) {
          chartConfig.size = size;
        }
        if (color) {
          chartConfig.color = color;
        }
        break;

      default:
        console.error('unknown chart type');
    }

    // Add data to chart chartConfig
    chartConfig.data = dataRows;

    if (!this.chart) {
      this.chart = new Chart(chartConfig);
      this.chart.renderTo('#chart');
    } else {
      this.chart.setData(dataRows);
    }
  };

  setData = chartData => {
    this.chart.setData(chartData);
  };

  componentWillUnmount() {
    this.destroyChart();
  }

  render() {
    const { isRunning, queryError } = this.props;
    if (isRunning) {
      return (
        <div
          id="chart"
          className="flex h-100 w-100 items-center justify-center"
        >
          <SpinKitCube />
        </div>
      );
    }
    if (queryError) {
      return (
        <div
          id="chart"
          className="flex h-100 w-100 items-center justify-center f2 pa4 tc bg-light-red"
        >
          {queryError}
        </div>
      );
    }
    return <div id="chart" className="flex h-100 w-100 pa3" />;
  }
}

SqlpadTauChart.propTypes = {
  isRunning: PropTypes.bool,
  query: PropTypes.object,
  queryError: PropTypes.string,
  queryResult: PropTypes.object,
  renderChart: PropTypes.bool
};

export default SqlpadTauChart;
