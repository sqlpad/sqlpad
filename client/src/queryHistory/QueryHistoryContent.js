import React, { useEffect, useState } from 'react';
import QueryHistoryFilterItem from './QueryHistoryFilterItem';
import QueryHistoryResultHeader from './QueryHistoryResultHeader';
import QueryResultContainer from '../common/QueryResultContainer';
import fetchJson from '../utilities/fetch-json.js';
import Button from '../common/Button';

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
      setQueryHistory(json.queryHistory);
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
    newFilters.push({ field: 'userEmail', operator: 'regex', value: '' });
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
      type="primary"
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
        type="primary"
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
          type="primary"
          onClick={handleApplyFilter}
          disabled={isRunning}
        >
          {isRunning ? 'Searching...' : 'Search'}
        </Button>{' '}
      </form>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {buttons}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filterForm}
      </div>
      <br />
      <QueryHistoryResultHeader
        isRunning={isRunning}
        queryResult={queryHistory}
        runQueryStartTime={null}
      />
      <div style={{ display: 'flex', flexGrow: 1, height: '100%' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
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
