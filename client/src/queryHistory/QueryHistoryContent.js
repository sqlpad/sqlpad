import React, { useEffect, useState } from 'react';
import QueryHistoryFilterItem from './QueryHistoryFilterItem';
import QueryResultContainer from '../common/QueryResultContainer';
import fetchJson from '../utilities/fetch-json.js';
import Button from '../common/Button';

// Previous implementation used server get-meta to supply meta info and fields for /api/query-history
// This API has changed in v5 to return an array of objects to make it consistent with other list APIs
// To accomodate the loss of meta/fields, they are being hardcoded here so we can reuse the query result grid
// This should be fine... it'll just need updating if the API changes shape
const historyMeta = {
  userEmail: {
    datatype: 'string'
  },
  connectionName: {
    datatype: 'string'
  },
  startTime: {
    datatype: 'datetime'
  },
  stopTime: {
    datatype: 'datetime'
  },
  queryRunTime: {
    datatype: 'number'
  },
  queryId: {
    datatype: 'string'
  },
  queryName: {
    datatype: 'string'
  },
  queryText: {
    datatype: 'string'
  },
  incomplete: {
    datatype: 'boolean'
  },
  rowCount: {
    datatype: 'number'
  },
  createdAt: {
    datatype: 'datetime'
  }
};

const historyFields = Object.keys(historyMeta);

function getQueryResult(rows) {
  return {
    rows,
    fields: historyFields,
    meta: historyMeta
  };
}

function QueryHistoryContent({ onConnectionAccessSaved }) {
  const [isRunning, setIsRunning] = useState(true);
  const [filters, setFilters] = useState([]);
  const [queryError, setQueryError] = useState(null);
  const [queryHistory, setQueryHistory] = useState({});

  useEffect(() => {
    function buildFilterUrlParameter() {
      const urlFilters = filters.map(f => {
        if (['before', 'after'].includes(f.operator)) {
          try {
            f.value = new Date(f.value).toISOString();
          } catch (error) {
            f.value = error.message;
          }
        }
        return `${f.field}|${f.operator}|${f.value}`;
      });
      return urlFilters.join(',');
    }

    async function getQueryHistory() {
      const json = await fetchJson(
        'GET',
        `/api/query-history?filter=${buildFilterUrlParameter()}`
      );

      setIsRunning(false);
      setQueryError(json.error);
      const queryResult = getQueryResult(json.data);
      setQueryHistory(queryResult);
    }

    if (isRunning) {
      getQueryHistory();
    }
  }, [filters, isRunning]);

  const handleRefresh = () => {
    setIsRunning(true);
  };

  const setFilterValue = (index, filterItem) => {
    const newFilter = [...filters];
    if ('field' in filterItem) {
      newFilter[index].field = filterItem.field;
    }
    if ('operator' in filterItem) {
      newFilter[index].operator = filterItem.operator;
    }
    if ('value' in filterItem) {
      newFilter[index].value = filterItem.value;
    }

    setFilters(newFilter);
  };

  const handleAddFilter = () => {
    const newFilters = [...filters];
    newFilters.push({ field: 'userEmail', operator: 'contains', value: '' });
    setFilters(newFilters);
  };

  const handleRemoveFilter = index => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const handleApplyFilter = e => {
    setIsRunning(true);
  };

  let filterForm;
  const buttons = [
    <Button
      style={{ width: 135 }}
      key="refresh"
      variant="primary"
      onClick={handleRefresh}
      disabled={isRunning}
    >
      {isRunning ? 'Searching...' : 'Refresh'}
    </Button>
  ];
  if (filters.length === 0) {
    buttons.unshift(
      <Button
        style={{ width: 135, marginRight: 8 }}
        key="addFilter"
        variant="primary"
        onClick={handleAddFilter}
      >
        Add Filter
      </Button>
    );
  } else {
    filterForm = (
      <form
        onSubmit={handleApplyFilter}
        autoComplete="off"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <p>Display queries that meet all of the following criteria:</p>
        {filters.map((filterItem, index) => {
          return (
            <QueryHistoryFilterItem
              index={index}
              key={index}
              filter={filterItem}
              onChange={setFilterValue}
              onAddFilter={
                index === filters.length - 1 ? handleAddFilter : null
              }
              onRemoveFilter={handleRemoveFilter}
            />
          );
        })}
        <br />
        <Button
          htmlType="submit"
          style={{ width: 120 }}
          variant="primary"
          onClick={handleApplyFilter}
          disabled={isRunning}
        >
          {isRunning ? 'Searching...' : 'Search'}
        </Button>{' '}
      </form>
    );
  }

  let rowCount = null;
  if (queryHistory && queryHistory.rows) {
    rowCount = <div>{queryHistory.rows.length} rows</div>;
  }

  // TODO - setting a fixed height for now until display issue is sorted out for large number of results
  // The flex based layout wasn't working for some reason
  // (seems fine if grid is not rendered -- is it an issue with react-measure?)
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {buttons}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filterForm}
      </div>
      <br />
      {rowCount}
      <div style={{ display: 'flex', flexGrow: 1, height: '100%' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 300,
            border: '1px solid #CCC'
          }}
        >
          <QueryResultContainer
            isRunning={isRunning}
            queryResult={queryHistory}
            queryError={queryError}
          />
        </div>
      </div>
    </>
  );
}

export default QueryHistoryContent;
