import { connect } from 'unistore/react';
import DownloadIcon from 'mdi-react/DownloadIcon';
import SettingsIcon from 'mdi-react/SettingsIcon';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import 'd3';
import React from 'react';
import { exportPng } from '../common/tauChartRef';
import IconButton from '../common/IconButton';

function mapStateToProps(state) {
  return {
    queryId: (state.query && state.query._id) || 'new',
    isRunning: state.isRunning,
    queryError: state.queryError,
    queryResult: state.queryResult,
    chartConfiguration: state.query && state.query.chartConfiguration,
    queryName: state.query && state.query.name
  };
}

const Connected = connect(mapStateToProps)(QueryEditorChartToolbar);

function QueryEditorChartToolbar({
  isRunning,
  queryError,
  queryResult,
  chartConfiguration,
  queryName,
  queryId
}) {
  const downloadEnabled =
    queryResult && queryResult.rows && queryResult.rows.length;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        padding: 4
      }}
    >
      <IconButton
        to={`/query-chart/${queryId}`}
        target="_blank"
        rel="noopener noreferrer"
        tooltip="Open chart in new window"
      >
        <OpenInNewIcon />
      </IconButton>
      <IconButton
        disabled={!downloadEnabled}
        onClick={() => exportPng(queryId)}
        tooltip="Save chart image"
      >
        <DownloadIcon />
      </IconButton>
      <IconButton onClick={() => console.log('TODO')} tooltip="Configure chart">
        <SettingsIcon />
      </IconButton>
    </div>
  );
}

export default Connected;
