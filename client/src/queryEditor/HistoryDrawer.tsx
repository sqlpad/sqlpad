import React, { useEffect, useRef } from 'react';
import Highlight, { defaultProps } from 'prism-react-renderer';
import humanizeDuration from 'humanize-duration';
import capitalize from 'lodash/capitalize';
import Drawer from '../common/Drawer';
import ErrorBlock from '../common/ErrorBlock';
import InfoBlock from '../common/InfoBlock';
import SpinKitCube from '../common/SpinKitCube';
import { api } from '../utilities/api';
import theme from 'prism-react-renderer/themes/vsLight';
import { useSessionQueryId, useSessionQueryName } from '../stores/editor-store';
import styles from './StatementsTable.module.css';

type Props = {
  visible?: boolean;
  onClose: (...args: any[]) => any;
};

function HistoryDrawer({ onClose, visible }: Props) {
  const bottomEl = useRef<HTMLDivElement>(null);
  const containerEl = useRef<HTMLDivElement>(null);

  const queryId = useSessionQueryId() || 'null';
  const queryName = useSessionQueryName() || 'unsaved queries';

  let {
    data: queryBatches,
    error: queryBatchHistoryError,
  } = api.useQueryBatchHistory(queryId);

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
          <div
            key={batch.id}
            style={{
              border: '1px solid #eee',
              padding: 8,
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: '1rem' }}>{batch.createdAtCalendar}</h2>
            <div style={{ marginBottom: 16 }}>
              {capitalize(batch.status)} in {humanizeDuration(batch.durationMs)}
            </div>
            <Highlight
              {...defaultProps}
              theme={theme}
              code={batch.selectedText || batch.batchText}
              language="sql"
            >
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={className} style={style}>
                  {tokens.map((line, i) => (
                    <div {...getLineProps({ line, key: i })}>
                      {line.map((token, key) => (
                        <span {...getTokenProps({ token, key })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
            {!batch.statements && batch.status === 'finished' ? (
              <div className="sp-info" style={{ fontSize: '1rem' }}>
                Query results purged from storage
              </div>
            ) : null}
            {(batch.statements || []).map((statement) => {
              if (statement.error) {
                return (
                  <div
                    key={statement.id}
                    className="sp-error"
                    style={{ fontSize: '1rem' }}
                  >
                    {statement.error.title}
                  </div>
                );
              }

              return (
                <table
                  key={statement.id}
                  className={styles.table}
                  style={{ border: 'var(--border)' }}
                >
                  <thead>
                    <tr>
                      {(statement?.columns || []).map((column) => (
                        <th>{column.name}</th>
                      ))}
                    </tr>
                    <tr>
                      <td
                        style={{ textAlign: 'center' }}
                        colSpan={(statement?.columns || []).length}
                      >
                        <em>
                          {statement.rowCount}{' '}
                          {statement.rowCount === 1 ? 'row' : 'rows'}
                          {statement.incomplete ? '(incomplete)' : ''}
                        </em>
                      </td>
                    </tr>
                  </thead>
                </table>
              );
            })}
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
      title={`Run history for ${queryName}`}
      visible={visible}
      width={'80vw'}
      onClose={handleClose}
      placement="right"
    >
      <div
        ref={containerEl}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {content}
      </div>
    </Drawer>
  );
}

export default React.memo(HistoryDrawer);
