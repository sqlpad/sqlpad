const chartRefs = {};

export function setFakeChartRef(queryId, chart) {
  chartRefs[queryId] = chart;
}

export function delFakeChartRef(queryId) {
  delete chartRefs[queryId];
}

export function exportPng(queryId, fileName) {
  const chart = chartRefs[queryId];
  if (chart && chart.fire) {
    chart.fire('export-to', { type: 'png', fileName });
  }
}

export function resizeChart(queryId) {
  const chart = chartRefs[queryId];
  if (chart && chart.resize) {
    chart.resize();
  }
}
