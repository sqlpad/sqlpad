import 'd3';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Chart } from 'taucharts';
import SpinKitCube from './SpinKitCube.js';
import getTauChartConfig from './getTauChartConfig';

function SqlpadTauChart({ isRunning, queryError, queryResult, query }) {
  useEffect(() => {
    let chart;

    if (!isRunning && !queryError && query && queryResult) {
      const chartConfig = getTauChartConfig(query, queryResult);
      if (chartConfig) {
        chart = new Chart(chartConfig);
        chart.renderTo('#chart');
      }
    }

    // cleanup chart
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [isRunning, queryError, queryResult, query]);

  if (isRunning) {
    return (
      <div id="chart" className="flex h-100 w-100 items-center justify-center">
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

SqlpadTauChart.propTypes = {
  isRunning: PropTypes.bool,
  query: PropTypes.object,
  queryError: PropTypes.string,
  queryResult: PropTypes.object
};

export default SqlpadTauChart;
