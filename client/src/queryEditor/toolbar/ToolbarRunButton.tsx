import React from 'react';
import { connect } from 'unistore/react';
import Button from '../../common/Button';
import { connectConnectionClient } from '../../stores/connections';
import { runQuery } from '../../stores/queries';

function mapStateToProps(state: any) {
  const { isRunning } = state;
  return {
    isRunning,
  };
}

const ConnectedToolbarRunButton = connect(mapStateToProps, (store) => ({
  connectConnectionClient: connectConnectionClient(store),
  runQuery: runQuery(store),
  // @ts-expect-error ts-migrate(2345) FIXME: Property 'runQuery' is missing in type '{ isRunnin... Remove this comment to see the full error message
}))(React.memo(ToolbarRunButton));

type Props = {
  isRunning: boolean;
  runQuery: (...args: any[]) => any;
};

function ToolbarRunButton({
  isRunning,
  // @ts-expect-error
  connectConnectionClient,
  runQuery,
}: Props) {
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

export default ConnectedToolbarRunButton;
