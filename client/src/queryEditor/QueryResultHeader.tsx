import Tooltip from '../common/Tooltip';
import MenuLeftIcon from 'mdi-react/MenuLeftIcon';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import TableIcon from 'mdi-react/TableIcon';
import RowHorizontalIcon from 'mdi-react/LandRowsHorizontalIcon';
import React from 'react';
import ClipboardButton from '../common/ClipboardButton';
import Button from '../common/Button';
import ExportButton from '../common/ExportButton';
import HSpacer from '../common/HSpacer';
import IconButton from '../common/IconButton';
import IncompleteDataNotification from '../common/IncompleteDataNotification';
import SecondsTimer from '../common/SecondsTimer';
import { selectStatementId } from '../stores/editor-actions';
import {
  useSessionBatch,
  useSessionIsRunning,
  useSessionRunQueryStartTime,
  useSessionSelectedStatementId,
  useSessionTableLink,
  useStatementColumns,
  useStatementDurationMs,
  useStatementIncomplete,
  useStatementRowCount,
  useStatementSequence,
  useStatementStatus,
  useStatementText,
} from '../stores/editor-store';
import useAppContext from '../utilities/use-app-context';
import styles from './QueryResultHeader.module.css';
import { useQueryResultFormat } from '../stores/editor-store';
import { setQueryResultFormat } from '../stores/editor-actions';
import { QueryResultFormat, StatementResults } from '../types';

function QueryResultHeader({ rows }: { rows: StatementResults | undefined }) {
  const queryResultFormat = useQueryResultFormat();
  const isRunning = useSessionIsRunning();
  const runQueryStartTime = useSessionRunQueryStartTime();
  const statementId = useSessionSelectedStatementId();

  const rowCount = useStatementRowCount(statementId);
  const hasRows = rowCount !== undefined && rowCount > 0;
  const incomplete = useStatementIncomplete(statementId);
  const statementDurationMs = useStatementDurationMs(statementId);
  const status = useStatementStatus(statementId);
  const columns = useStatementColumns(statementId) || [];

  const batch = useSessionBatch();
  const numOfStatements = batch?.statements.length || 0;

  const statementText = useStatementText(statementId);
  const statementSequence = useStatementSequence(statementId);

  const { config } = useAppContext();

  const tableLink = useSessionTableLink(statementSequence);
  const showLink = Boolean(tableLink);

  const isStatementFinished = status === 'finished';
  const isStatementRunning = status === 'queued' || status === 'started';

  let timerContent = null;
  if ((statementId && isStatementRunning) || (!statementId && isRunning)) {
    timerContent = (
      <div style={{ whiteSpace: 'nowrap' }}>
        <SecondsTimer startTime={runQueryStartTime} /> seconds
      </div>
    );
  } else if (statementId && isStatementFinished) {
    const serverSec =
      statementDurationMs !== undefined ? statementDurationMs / 1000 : 0;
    timerContent = (
      <div style={{ whiteSpace: 'nowrap' }}>{serverSec} seconds</div>
    );
  } else if (!statementId && batch?.durationMs !== undefined) {
    const serverSec = batch?.durationMs / 1000;
    timerContent = <div>{serverSec} seconds</div>;
  }
  const formatOptions: {
    format: QueryResultFormat;
    title: string;
    icon: typeof RowHorizontalIcon;
  }[] = [
    { format: 'column', title: 'table', icon: TableIcon },
    { format: 'fullColumns', title: 'vertical', icon: RowHorizontalIcon },
  ];
  const formatSelector = (
    <>
      {formatOptions.map(({ format, title, icon: IconComponent }) => {
        const disabled = queryResultFormat === format;
        return (
          <Tooltip label={title} key={format}>
            <Button
              disabled={disabled}
              onClick={() => setQueryResultFormat(format)}
              style={{
                cursor: disabled ? 'default' : undefined,
                boxShadow: disabled ? 'inset 0 0 2px' : undefined,
              }}
            >
              <IconComponent />
            </Button>
          </Tooltip>
        );
      })}
    </>
  );

  return (
    <div className={styles.toolbar}>
      {statementId && numOfStatements > 1 ? (
        <Button
          className={styles.returnToStatementsBtn}
          variant="primary-ghost"
          onClick={() => {
            selectStatementId('');
          }}
        >
          <MenuLeftIcon /> Return to statements
        </Button>
      ) : null}
      <HSpacer size={1} />
      {formatSelector}
      <HSpacer size={1} grow />
      {statementId && statementSequence && numOfStatements > 1 && (
        <>
          <div className={styles.statementHeaderStatementText}>
            {`${statementSequence}. ${statementText}`}
          </div>
          <HSpacer size={1} grow />
        </>
      )}
      {statementId && isStatementFinished && (
        <>
          <div style={{ whiteSpace: 'nowrap' }}>{rowCount} rows</div>
          <HSpacer />
        </>
      )}
      {statementId && isStatementFinished && (
        <>
          <ClipboardButton
            onCopyStart={() => {
              if (!rows) {
                throw new Error('nothing to copy');
              }

              if (queryResultFormat === 'fullColumns') {
                return rows.reduce((result, row) => {
                  const formattedRow = columns
                    .map(({ name }, colIndex) => {
                      const maxCharLength = columns.reduce(
                        (charLength, { name }) =>
                          Math.max(name.length, charLength),
                        0
                      );
                      const value = row[colIndex];
                      return `${name.padStart(maxCharLength)}: ${value}`;
                    })
                    .join('\n');

                  return `${result}${formattedRow}\n${'*'.repeat(60)}\n`;
                }, '');
              }

              const colWidthsByIndex = rows.reduce((result, row) => {
                return row.map((value, colIndex) => {
                  return Math.max(
                    result[colIndex],
                    String(value).length,
                    columns[colIndex].name.length
                  );
                });
              }, Array(columns.length).fill(0));
              const cellSeperator = ' | ';
              const rowSeparator = '-'.repeat(
                colWidthsByIndex.reduce(
                  (rowLength, colWidth) =>
                    rowLength + colWidth + cellSeperator.length,
                  0
                )
              );
              const tableHeader = columns
                .map(({ name }, colIndex) => {
                  const colWidth = colWidthsByIndex[colIndex];
                  return `${name.padEnd(colWidth)}${cellSeperator}`;
                })
                .join('');
              const tableRows = rows.reduce((result, row) => {
                const formattedRow = row
                  .map((value, colIndex) => {
                    const colWidth = colWidthsByIndex[colIndex];
                    return `${String(value).padEnd(colWidth)}${cellSeperator}`;
                  })
                  .join('');

                return `${result}\n${formattedRow}\n${rowSeparator}`;
              }, '');
              return `${tableHeader}\n${rowSeparator}${tableRows}`;
            }}
          />
          <HSpacer />
        </>
      )}
      {statementId && isStatementFinished && showLink && (
        <>
          <IconButton
            disabled={!tableLink}
            to={tableLink}
            target="_blank"
            rel="noopener noreferrer"
            tooltip="Open table in new window"
          >
            <OpenInNewIcon size={16} />
          </IconButton>
          <HSpacer />
        </>
      )}
      {statementId &&
        isStatementFinished &&
        config?.allowCsvDownload &&
        hasRows && (
          <>
            <ExportButton statementId={statementId} />
            <HSpacer />
          </>
        )}
      {statementId && isStatementFinished && incomplete && (
        <>
          <IncompleteDataNotification />
          <HSpacer />
        </>
      )}
      {timerContent}
      <HSpacer size={1} />
    </div>
  );
}

export default React.memo(QueryResultHeader);
