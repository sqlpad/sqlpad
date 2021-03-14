import DownloadIcon from 'mdi-react/DownloadIcon';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import React from 'react';
import IconButton from '../common/IconButton';
import { exportPng } from '../common/tauChartRef';
import {
  useLastStatementId,
  useSessionQueryId,
  useSessionQueryName,
  useStatementStatus,
} from '../stores/editor-store';
import { api } from '../utilities/api';

function QueryEditorChartToolbar({ children }: any) {
  const queryId = useSessionQueryId() || 'new';
  const queryName = useSessionQueryName() || 'New query';

  const statementId = useLastStatementId();
  const status = useStatementStatus(statementId);
  const { data } = api.useStatementResults(statementId, status);

  const downloadEnabled = data && data.length;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column' }}
      className="h-100 w-100"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: 4,
        }}
      >
        <IconButton
          disabled={queryId === 'new'}
          to={`/query-chart/${queryId}`}
          target="_blank"
          rel="noopener noreferrer"
          tooltip="Open chart in new window"
        >
          <OpenInNewIcon />
        </IconButton>
        <IconButton
          disabled={!downloadEnabled}
          onClick={() => exportPng(queryId, queryName)}
          tooltip="Save chart image"
        >
          <DownloadIcon />
        </IconButton>
      </div>

      <div
        style={{ display: 'flex', padding: 8, position: 'relative' }}
        className="h-100 w-100"
      >
        {children}
      </div>
    </div>
  );
}

export default QueryEditorChartToolbar;
