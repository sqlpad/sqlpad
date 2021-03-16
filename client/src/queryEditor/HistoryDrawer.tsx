import React, { useEffect, useRef } from 'react';
import Drawer from '../common/Drawer';
import ErrorBlock from '../common/ErrorBlock';
import InfoBlock from '../common/InfoBlock';
import SpinKitCube from '../common/SpinKitCube';
import { api } from '../utilities/api';

type Props = {
  visible?: boolean;
  onClose: (...args: any[]) => any;
};

function HistoryDrawer({ onClose, visible }: Props) {
  const bottomEl = useRef<HTMLDivElement>(null);
  const containerEl = useRef<HTMLDivElement>(null);

  let {
    data: queryBatches,
    error: queryBatchHistoryError,
  } = api.useQueryBatchHistory('null');

  const fetching = !queryBatches;

  function handleClose() {
    onClose();
  }

  let content = null;

  if (fetching) {
    content = (
      <div className="h-100 w-100 flex-center">
        <SpinKitCube />
      </div>
    );
  } else if (queryBatchHistoryError) {
    content = <ErrorBlock>Error getting execution history</ErrorBlock>;
  } else if (queryBatches) {
    if (queryBatches.length === 0) {
      content = (
        <div style={{ height: 150, width: '100%' }}>
          <InfoBlock>No queries found</InfoBlock>
        </div>
      );
    }
    content = queryBatches
      .map((batch) => {
        return (
          <div key={batch.id}>
            <div>{batch.createdAt}</div>
            <div>{batch.status}</div>
            <pre>{batch.batchText}</pre>
            {(batch.statements || []).map((statement) => {
              return <div key={statement.id}>{statement.durationMs}</div>;
            })}
            <hr />
          </div>
        );
      })
      .concat([<div key="bottom" ref={bottomEl} />]);
  }

  const batchLength = queryBatches ? queryBatches.length : 0;
  useEffect(() => {
    if (visible && batchLength > 0) {
      setTimeout(() => {
        bottomEl && bottomEl.current && bottomEl.current.scrollIntoView(false);
      });
    }
  }, [batchLength, visible]);

  return (
    <Drawer
      title={'Execution History for ...'}
      visible={visible}
      width={'80vw'}
      onClose={handleClose}
      placement="right"
    >
      <div
        ref={containerEl}
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {content}
      </div>
    </Drawer>
  );
}

export default React.memo(HistoryDrawer);
