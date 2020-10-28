import React from 'react';
import { selectStatementId } from '../stores/editor-actions';
import { Statement } from '../types';
import styles from './StatementsTable.module.css';
import Button from '../common/Button';

function StatementsTable({ statements }: { statements: Statement[] }) {
  return (
    <div style={{ width: '100%' }}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.statementTextColHeader}>Statement</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Rows</th>
            <th style={{ textAlign: 'right' }}>Duration (sec)</th>
          </tr>
        </thead>
        <tbody>
          {statements.map((statement) => {
            return (
              <tr key={statement.id}>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StatementsTable;
