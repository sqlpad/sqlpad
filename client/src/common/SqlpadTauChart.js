import 'd3';
import PropTypes from 'prop-types';
import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef
} from 'react';
import { Chart } from 'taucharts';
import SpinKitCube from './SpinKitCube.js';
import getTauChartConfig from './getTauChartConfig';

function SqlpadTauChart({
  isRunning,
  queryError,
  queryResult,
  query,
  forwardedRef,
  isVisible
}) {
  const chartConfiguration = query && query.chartConfiguration;
  const queryName = query ? query.name : '';

  const chartRef = useRef(null);

  // TODO rendering on every change like this might get too expensive
  // Revisit with latest version of taucharts and d3 once UI is updated
  useEffect(() => {
    let chart;

    if (
      isVisible &&
      !isRunning &&
      !queryError &&
      chartConfiguration &&
      queryResult
    ) {
      const chartConfig = getTauChartConfig(
        chartConfiguration,
        queryResult,
        queryName
      );
      if (chartConfig) {
        chart = new Chart(chartConfig);
        chart.renderTo('#chart');
      }
    }

    // set instance of chart to ref
    chartRef.current = chart;

    // cleanup chart
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [
    isRunning,
    queryError,
    queryResult,
    chartConfiguration,
    queryName,
    isVisible
  ]);

  useImperativeHandle(forwardedRef, () => ({
    exportPng: () => {
      if (chartRef.current && chartRef.current.fire) {
        chartRef.current.fire('exportTo', 'png');
      }
    },
    resize: () => {
      if (chartRef.current && chartRef.current.resize) {
        chartRef.current.resize();
      }
    }
  }));

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
  queryResult: PropTypes.object,
  forwardedRef: PropTypes.any,
  isVisible: PropTypes.bool
};

export default forwardRef((props, ref) => {
  return <SqlpadTauChart {...props} forwardedRef={ref} />;
});
