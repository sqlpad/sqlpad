import { connect } from 'unistore/react';
import SqlpadTauChart from '../common/SqlpadTauChart';

function mapStateToProps(state) {
  return {
    queryId: (state.query && state.query._id) || 'new',
    isRunning: state.isRunning,
    queryError: state.queryError,
    queryResult: state.queryResult,
    chartConfiguration: state.query && state.query.chartConfiguration
  };
}

const ConnectedChart = connect(mapStateToProps)(SqlpadTauChart);

export default ConnectedChart;
