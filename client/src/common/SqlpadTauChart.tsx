import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Chart } from 'taucharts';
import SpinKitCube from './SpinKitCube';
import ErrorBlock from './ErrorBlock';
import getTauChartConfig from './getTauChartConfig';
import { setFakeChartRef, delFakeChartRef } from './tauChartRef';

interface ChartConfiguration {
  chartType: string;
  fields: {
    [key: string]: string;
  };
}

export interface Props {
  isRunning: boolean;
  queryError?: string;
  queryResult: any;
  chartConfiguration: ChartConfiguration;
  queryId: string;
}

function SqlpadTauChart({
  isRunning,
  queryError,
  queryResult,
  chartConfiguration,
  queryId,
}: Props) {
  useEffect(() => {
    let chart: any;

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
