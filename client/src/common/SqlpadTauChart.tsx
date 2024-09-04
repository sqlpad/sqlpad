import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Chart } from 'taucharts';
import { StatementColumn, StatementResults } from '../types';
import ErrorBlock from './ErrorBlock';
import getTauChartConfig from './getTauChartConfig';
import SpinKitCube from './SpinKitCube';
import { delFakeChartRef, setFakeChartRef } from './tauChartRef';

interface ChartConfiguration {
  chartType: string;
  fields: {
    [key: string]: string;
  };
}

export interface Props {
  isRunning: boolean;
  queryError?: string;
  columns?: StatementColumn[];
  rows?: StatementResults;
  chartConfiguration: ChartConfiguration;
  queryId: string;
}

function getObjectRows(columns: any, rows: any) {
  return rows.map((row: any) => {
    const obj: { [key: string]: any } = {};
    columns.forEach((c: { name: string }, index: any) => {
      obj[c.name] = row[index];
    });
    return obj;
  });
}

function SqlpadTauChart({
  isRunning,
  queryError,
  columns,
  rows,
  chartConfiguration,
  queryId,
}: Props) {
  useEffect(() => {
    let chart: any;

    if (!isRunning && !queryError && chartConfiguration && columns && rows) {
      const dataRows = getObjectRows(columns, rows);
      const chartConfig = getTauChartConfig(
        chartConfiguration,
        columns,
        dataRows
      );
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
  }, [isRunning, queryError, columns, rows, chartConfiguration, queryId]);

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
};

export default SqlpadTauChart;
