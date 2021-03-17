import humanizeDuration from 'humanize-duration';
import capitalize from 'lodash/capitalize';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/vsLight';
import React, { useEffect, useRef } from 'react';
import Button from '../common/Button';
import Drawer from '../common/Drawer';
import ErrorBlock from '../common/ErrorBlock';
import InfoBlock from '../common/InfoBlock';
import SpinKitCube from '../common/SpinKitCube';
import { setEditorBatchHistoryItem } from '../stores/editor-actions';
import { useSessionQueryId, useSessionQueryName } from '../stores/editor-store';
import { api } from '../utilities/api';
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

  const {
    data: queryBatches,
    error: queryBatchHistoryError,
  } = api.useQueryBatchHistory(queryId);

  const fetching = !queryBatches;

  const batchLength = queryBatches ? queryBatches.length : 0;
  useEffect(() => {
    if (visible && batchLength > 0) {
      // Without setTimeout this fires too soon? This is sort of hacky and could be fragile
      setTimeout(() => {
        bottomEl && bottomEl.current && bottomEl.current.scrollIntoView(false);
      }, 50);
    }
  }, [batchLength, visible]);

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
          <InfoBlock>No run history found for this query.</InfoBlock>
        </div>
      );
    } else {
      content = queryBatches
        .map((batch) => {
          return (
            <div
              key={batch.id}
              style={{
                border: 'var(--border)',
                padding: 8,
                marginTop: 16,
                marginBottom: 16,
                position: 'relative',
              }}
            >
              <h2 style={{ fontSize: '1rem' }}>{batch.createdAtCalendar}</h2>
              <div style={{ marginBottom: 16 }}>
                {capitalize(batch.status)} in{' '}
                {humanizeDuration(batch.durationMs)}
              </div>
              <Button
                style={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => {
                  setEditorBatchHistoryItem(batch);
                  onClose();
                }}
              >
                Open in editor
              </Button>
              <Highlight
                {...defaultProps}
                theme={theme}
                code={batch.selectedText || batch.batchText}
                language="sql"
              >
                {({
                  className,
                  style,
                  tokens,
                  getLineProps,
                  getTokenProps,
                }) => (
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
              {!batch.statements &&
              (batch.status === 'finished' || batch.status === 'error') ? (
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

                if (statement.status !== 'finished') {
                  return null;
                }

                return (
                  <table
                    key={statement.id}
                    className={styles.table}
                    style={{ border: 'var(--border)', marginTop: 8 }}
                  >
                    <thead>
                      <tr>
                        {(statement?.columns || []).map((column) => (
                          <th key={column.name}>{column.name}</th>
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
  }

  return (
    <Drawer
      title={`Run history for ${queryName}`}
      visible={visible}
      width={'70vw'}
      onClose={onClose}
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
