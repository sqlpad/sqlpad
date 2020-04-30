import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'unistore/react';
import Button from '../../common/Button';
import { connectConnectionClient } from '../../stores/connections';
import { runQuery } from '../../stores/queries';

function mapStateToProps(state) {
  const { isRunning } = state;
  return {
    isRunning,
  };
}

const ConnectedToolbarRunButton = connect(mapStateToProps, (store) => ({
  connectConnectionClient: connectConnectionClient(store),
  runQuery: runQuery(store),
}))(React.memo(ToolbarRunButton));

function ToolbarRunButton({ isRunning, connectConnectionClient, runQuery }) {
  return (
    <Button
      variant="primary"
      onClick={async () => {
        await connectConnectionClient();
        runQuery();
      }}
      disabled={isRunning}
    >
      Run
    </Button>
  );
}

ToolbarRunButton.propTypes = {
  isRunning: PropTypes.bool.isRequired,
  runQuery: PropTypes.func.isRequired,
};

export default ConnectedToolbarRunButton;
