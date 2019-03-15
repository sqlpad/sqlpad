import PropTypes from 'prop-types';
import React from 'react';
import ExportButton from './common/ExportButton.js';
import IncompleteDataNotification from './common/IncompleteDataNotification';
import QueryResultDataTable from './common/QueryResultDataTable.js';
import fetchJson from './utilities/fetch-json.js';

class QueryTableOnly extends React.Component {
  state = {
    isRunning: false,
    runQueryStartTime: undefined,
    queryResult: undefined
  };

  runQuery = queryId => {
    this.setState({
      isRunning: true,
      runQueryStartTime: new Date()
    });
    fetchJson('GET', '/api/queries/' + queryId)
      .then(json => {
        if (json.error) console.error(json.error);
        this.setState({
          query: json.query
        });
      })
      .then(() => {
        return fetchJson('GET', '/api/query-result/' + queryId);
      })
      .then(json => {
        if (json.error) console.error(json.error);
        this.setState({
          isRunning: false,
          queryError: json.error,
          queryResult: json.queryResult
        });
      });
  };

  componentDidMount() {
    document.title = 'SQLPad';
    this.runQuery(this.props.queryId);
  }

  render() {
    const {
      isRunning,
      query,
      queryError,
      queryResult,
      querySuccess,
      runQueryStartTime
    } = this.state;

    const incomplete = queryResult ? queryResult.incomplete : false;
    const cacheKey = queryResult ? queryResult.cacheKey : null;

    return (
      <div
        className="flex w-100"
        style={{ flexDirection: 'column', padding: '16px' }}
      >
        <div style={{ height: '50px' }}>
          <span className="f2">{query ? query.name : ''}</span>
          <div style={{ float: 'right' }}>
            <IncompleteDataNotification incomplete={incomplete} />
            <ExportButton cacheKey={cacheKey} />
          </div>
        </div>
        <div className="flex h-100 ba b--moon-gray">
          <div className="relative w-100">
            <QueryResultDataTable
              isRunning={isRunning}
              runQueryStartTime={runQueryStartTime}
              queryResult={queryResult}
              queryError={queryError}
              querySuccess={querySuccess}
            />
          </div>
        </div>
      </div>
    );
  }
}

QueryTableOnly.propTypes = {
  queryId: PropTypes.string.isRequired
};

export default QueryTableOnly;
