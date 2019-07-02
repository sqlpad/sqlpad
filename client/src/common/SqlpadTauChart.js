import 'd3';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Chart } from 'taucharts';
import SpinKitCube from './SpinKitCube.js';
import getTauChartConfig from './getTauChartConfig';
import { setFakeChartRef, delFakeChartRef } from './tauChartRef';

function SqlpadTauChart({
  isRunning,
  queryError,
  queryResult,
  chartConfiguration,
  queryId
}) {
  // TODO rendering on every change like this might get too expensive
  // Revisit with latest version of taucharts and d3 once UI is updated
  useEffect(() => {
    let chart;

    if (!isRunning && !queryError && chartConfiguration && queryResult) {
      const chartConfig = getTauChartConfig(chartConfiguration, queryResult);
      if (chartConfig) {
        chart = new Chart(chartConfig);
        chart.renderTo('#chart');
      }
    }

    setFakeChartRef(queryId, chart);

    // cleanup chart
    return () => {
      if (chart) {
        chart.destroy();
      }
      delFakeChartRef(queryId);
    };
  }, [isRunning, queryError, queryResult, chartConfiguration, queryId]);

  if (isRunning) {
    return (
      <div id="chart" className="flex-center h-100 w-100">
        <SpinKitCube />
      </div>
    );
  }

  if (queryError) {
    return (
      <div
        id="chart"
        style={{ fontSize: '1.5rem', padding: 24, textAlign: 'center' }}
        className="flex-center h-100 w-100 bg-error"
      >
        {queryError}
      </div>
    );
  }

  return <div id="chart" className="flex-center h-100 w-100" />;
}

SqlpadTauChart.propTypes = {
  isRunning: PropTypes.bool,
  chartConfiguration: PropTypes.object,
  queryError: PropTypes.string,
  queryResult: PropTypes.object
};

export default SqlpadTauChart;
