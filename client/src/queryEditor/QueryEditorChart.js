import React, { forwardRef } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import SqlpadTauChart from '../common/SqlpadTauChart';

function mapStateToProps(state) {
  return {
    isRunning: state.isRunning,
    queryError: state.queryError,
    isVisible: state.activeTabKey === 'vis',
    queryResult: state.queryResult,
    chartConfiguration: state.query && state.query.chartConfiguration,
    queryName: state.query && state.query.name
  };
}

const ConnectedChart = connect(
  mapStateToProps,
  actions
)(
  forwardRef((props, ref) => {
    return <SqlpadTauChart {...props} forwardedRef={ref} />;
  })
);

export default ConnectedChart;
