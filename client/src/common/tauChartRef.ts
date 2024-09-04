import debounce from 'lodash/debounce';

const chartRefs: { [key: string]: any } = {};

export function setFakeChartRef(queryId: string, chart: any) {
  chartRefs[queryId] = chart;
}

export function delFakeChartRef(queryId: string) {
  delete chartRefs[queryId];
}

export function exportPng(queryId: string, fileName: string) {
  const chart = chartRefs[queryId];
  if (chart && chart.fire) {
    chart.fire('export-to', { type: 'png', fileName });
  }
}

export function resizeChart(queryId: string) {
  const chart = chartRefs[queryId];
  if (chart && chart.resize) {
    chart.resize();
  }
}

export const debouncedResizeChart = debounce(resizeChart, 700);
