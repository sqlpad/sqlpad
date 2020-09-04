import { connect } from 'unistore/react';
import SqlpadTauChart from '../common/SqlpadTauChart';

function mapStateToProps(state: any) {
  return {
    queryId: (state.query && state.query.id) || 'new',
    isRunning: state.isRunning,
    queryResult: state.queryResult,
    chartConfiguration: state.query && state.query.chart,
  };
}

// @ts-expect-error TODO FIXME
const ConnectedChart = connect(mapStateToProps)(SqlpadTauChart);

export default ConnectedChart;
