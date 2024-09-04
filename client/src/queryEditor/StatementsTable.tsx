import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import React from 'react';
import Button from '../common/Button';
import ExportButton from '../common/ExportButton';
import IconButton from '../common/IconButton';
import { selectStatementId } from '../stores/editor-actions';
import { useSessionTableLink } from '../stores/editor-store';
import { Statement } from '../types';
import useAppContext from '../utilities/use-app-context';
import styles from './StatementsTable.module.css';
import SpinKitRow from '../common/SpinKitRow';
import Text from '../common/Text';
import ErrorBlock from '../common/ErrorBlock';

function StatementTableRow({ statement }: { statement: Statement }) {
  const tableLink = useSessionTableLink(statement.sequence);
  const { config } = useAppContext();
  const hasRows = statement.rowCount !== undefined && statement.rowCount > 0;

  let statusContent = null;
  if (statement.status === 'started') {
    statusContent = <SpinKitRow />;
  } else if (statement.status === 'error') {
    statusContent = <Text type="danger">{statement.status}</Text>;
  } else {
    statusContent = statement.status;
  }

  return (
    <tr>
      <td className={styles.statementTextCol}>
        <Button
          className={styles.statementButton}
          variant="primary-ghost"
          onClick={() => {
            selectStatementId(statement.id);
          }}
        >
          {statement.sequence}. {statement.statementText.trim()}
        </Button>
      </td>
      <td>{statusContent}</td>
      <td style={{ textAlign: 'right' }}>{statement.rowCount}</td>
      <td style={{ textAlign: 'right' }}>
        {typeof statement.durationMs === 'number'
          ? `${statement.durationMs / 1000}`
          : ''}
      </td>
      <td style={{ width: 120, textAlign: 'right', padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {config?.allowCsvDownload && hasRows && Boolean(tableLink) && (
            <IconButton
              to={tableLink}
              target="_blank"
              rel="noopener noreferrer"
              tooltip="Open table in new window"
            >
              <OpenInNewIcon />
            </IconButton>
          )}
          {hasRows && <ExportButton statementId={statement.id} />}
        </div>
      </td>
    </tr>
  );
}

function StatementsTable({ statements }: { statements: Statement[] }) {
  // If there is a status === error statement, remove remaining statements
  // Then append a row of the error text

  let errorRow = null;
  let filteredStatements = statements;
  const errorIndex = statements.findIndex(
    (statement) => statement.status === 'error'
  );
  if (errorIndex > -1) {
    filteredStatements = statements.slice(0, errorIndex + 1);
    const erroredStatement = statements[errorIndex];
    errorRow = (
      <tr>
        <td colSpan={5}>
          <ErrorBlock>{erroredStatement.error?.title}</ErrorBlock>
        </td>
      </tr>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.statementTextColHeader}>Statement</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Rows</th>
            <th style={{ textAlign: 'right' }}>Seconds</th>
            <th style={{ textAlign: 'right' }}></th>
          </tr>
        </thead>
        <tbody>
          {filteredStatements.map((statement) => {
            return (
              <StatementTableRow key={statement.id} statement={statement} />
            );
          })}
          {errorRow}
        </tbody>
      </table>
    </div>
  );
}

export default StatementsTable;
