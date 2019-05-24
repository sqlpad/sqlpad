import 'd3';
import DownloadIcon from 'mdi-react/DownloadIcon';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import React from 'react';
import { connect } from 'unistore/react';
import IconButton from '../common/IconButton';
import { exportPng } from '../common/tauChartRef';

function mapStateToProps(state) {
  return {
    queryId: (state.query && state.query._id) || 'new',
    queryResult: state.queryResult
  };
}

const Connected = connect(mapStateToProps)(QueryEditorChartToolbar);

function QueryEditorChartToolbar({ queryResult, queryId }) {
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
    </div>
  );
}

export default Connected;
