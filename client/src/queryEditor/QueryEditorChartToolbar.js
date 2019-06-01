import 'd3';
import DownloadIcon from 'mdi-react/DownloadIcon';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import SettingsIcon from 'mdi-react/SettingsIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import React, { useState } from 'react';
import { connect } from 'unistore/react';
import IconButton from '../common/IconButton';
import { exportPng } from '../common/tauChartRef';
import ChartInputsContainer from './ChartInputsContainer';

function mapStateToProps(state) {
  return {
    chartType:
      state.query &&
      state.query.chartConfiguration &&
      state.query.chartConfiguration.chartType,
    queryId: (state.query && state.query._id) || 'new',
    queryResult: state.queryResult
  };
}

const Connected = connect(mapStateToProps)(QueryEditorChartToolbar);

function QueryEditorChartToolbar({
  chartType,
  queryResult,
  queryId,
  children
}) {
  const [showConfig, setShowConfig] = useState(false);

  const downloadEnabled =
    !showConfig && queryResult && queryResult.rows && queryResult.rows.length;

  const settingsDisabled = !Boolean(chartType);

  const backgroundColor = showConfig ? '#f5f5f5' : 'transparent';

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
          backgroundColor
        }}
      >
        <IconButton
          disabled={showConfig || queryId === 'new'}
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
        <IconButton
          disabled={settingsDisabled}
          onClick={() => setShowConfig(!showConfig)}
          tooltip="Configure"
        >
          {showConfig ? <CloseIcon /> : <SettingsIcon />}
        </IconButton>
      </div>

      {showConfig ? (
        <div style={{ backgroundColor }} className="h-100 w-100">
          <ChartInputsContainer />
        </div>
      ) : (
        <div
          style={{ display: 'flex', padding: 8, position: 'relative' }}
          className="h-100 w-100"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default Connected;
