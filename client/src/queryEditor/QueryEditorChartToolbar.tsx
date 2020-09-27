import DownloadIcon from 'mdi-react/DownloadIcon';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import React from 'react';
import IconButton from '../common/IconButton';
import { exportPng } from '../common/tauChartRef';
import { useEditorStore } from '../stores/editor-store';

function QueryEditorChartToolbar({ children }: any) {
  const queryId = useEditorStore((s) => s?.query?.id || 'new');
  const queryName = useEditorStore((s) => s?.query?.name || 'New query');
  const queryResult = useEditorStore((s) => s.queryResult);

  const downloadEnabled =
    queryResult && queryResult.rows && queryResult.rows.length;

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
