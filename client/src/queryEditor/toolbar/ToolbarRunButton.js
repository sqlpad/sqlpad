import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'unistore/react';
import Button from '../../common/Button';
import { runQuery } from '../../stores/queries';

function mapStateToProps(state) {
  return {
    isRunning: state.isRunning
  };
}

const ConnectedToolbarRunButton = connect(mapStateToProps, store => ({
  runQuery: runQuery(store)
}))(React.memo(ToolbarRunButton));

function ToolbarRunButton({ isRunning, runQuery }) {
  return (
    <Button type="primary" onClick={() => runQuery()} disabled={isRunning}>
      Run
    </Button>
  );
}

ToolbarRunButton.propTypes = {
  isRunning: PropTypes.bool.isRequired,
  runQuery: PropTypes.func.isRequired
};

export default ConnectedToolbarRunButton;
