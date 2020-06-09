import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Chart } from 'taucharts';
import SpinKitCube from './SpinKitCube.js';
import ErrorBlock from './ErrorBlock.js';
import getTauChartConfig from './getTauChartConfig';
import { setFakeChartRef, delFakeChartRef } from './tauChartRef';

function SqlpadTauChart({
  isRunning,
  queryError,
  queryResult,
  chartConfiguration,
  queryId,
}) {
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
    return <ErrorBlock>{queryError}</ErrorBlock>;
  }

  return <div id="chart" className="flex-center h-100 w-100" />;
}

SqlpadTauChart.propTypes = {
  isRunning: PropTypes.bool,
  chartConfiguration: PropTypes.object,
  queryError: PropTypes.string,
  queryResult: PropTypes.object,
};

export default SqlpadTauChart;
