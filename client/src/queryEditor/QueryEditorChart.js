import { connect } from 'unistore/react';
import SqlpadTauChart from '../common/SqlpadTauChart';

function mapStateToProps(state) {
  return {
    queryId: (state.query && state.query.id) || 'new',
    isRunning: state.isRunning,
    queryResult: state.queryResult,
    chartConfiguration: state.query && state.query.chart,
  };
}

const ConnectedChart = connect(mapStateToProps)(SqlpadTauChart);

export default ConnectedChart;
