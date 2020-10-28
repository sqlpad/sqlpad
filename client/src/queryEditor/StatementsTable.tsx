import React from 'react';
import { selectStatementId } from '../stores/editor-actions';
import { Statement } from '../types';
import styles from './StatementsTable.module.css';
import Button from '../common/Button';
import ExportButton from '../common/ExportButton';
import IconButton from '../common/IconButton';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import { useSessionTableLink } from '../stores/editor-store';

function StatementTableRow({ statement }: { statement: Statement }) {
  const tableLink = useSessionTableLink(statement.sequence);

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
      <td>{statement.status}</td>
      <td style={{ textAlign: 'right' }}>{statement.rowCount}</td>
      <td style={{ textAlign: 'right' }}>
        {typeof statement.durationMs === 'number'
          ? `${statement.durationMs / 1000}`
          : ''}
      </td>
      <td style={{ width: 120, textAlign: 'right', padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            disabled={!Boolean(tableLink)}
            to={tableLink}
            target="_blank"
            rel="noopener noreferrer"
            tooltip="Open table in new window"
          >
            <OpenInNewIcon />
          </IconButton>
          <ExportButton statementId={statement.id} />
        </div>
      </td>
    </tr>
  );
}

function StatementsTable({ statements }: { statements: Statement[] }) {
  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.statementTextColHeader}>Statement</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Rows</th>
            <th style={{ textAlign: 'right' }}>Seconds</th>
            {/* 
              TODO - Add table link
              TODO - Update table only page to take sequence parameter. Default to last if not set
            */}
            <th style={{ textAlign: 'right' }}></th>
          </tr>
        </thead>
        <tbody>
          {statements.map((statement) => {
            return (
              <StatementTableRow key={statement.id} statement={statement} />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StatementsTable;
