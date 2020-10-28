import React from 'react';
import { selectStatementId } from '../stores/editor-actions';
import { Statement } from '../types';
import './StatementsTable.css';
import Button from '../common/Button';

function StatementsTable({ statements }: { statements: Statement[] }) {
  return (
    <div style={{ width: '100%' }}>
      <table className="statements-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th className="statement-text-col-header">Statement</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Rows</th>
            <th style={{ textAlign: 'right' }}>Duration (sec)</th>
          </tr>
        </thead>
        <tbody>
          {statements.map((statement) => {
            return (
              <tr key={statement.id}>
                <td className="statement-text-col">
                  <Button
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
