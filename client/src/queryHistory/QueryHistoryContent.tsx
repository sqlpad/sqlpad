import React, { useMemo, useState } from 'react';
import Button from '../common/Button';
import ErrorBlock from '../common/ErrorBlock';
import QueryResultDataTable from '../common/QueryResultDataTable';
import QueryResultRunning from '../common/QueryResultRunning';
import { api } from '../utilities/api';
import QueryHistoryFilterItem, { Filter } from './QueryHistoryFilterItem';

const COLUMNS = [
  { name: 'userEmail', datatype: 'string' },
  { name: 'connectionName', datatype: 'string' },
  { name: 'startTime', datatype: 'datetime' },
  { name: 'stopTime', datatype: 'datetime' },
  { name: 'durationMs', datatype: 'number' },
  { name: 'queryId', datatype: 'string' },
  { name: 'queryName', datatype: 'string' },
  { name: 'queryText', datatype: 'string' },
  { name: 'incomplete', datatype: 'boolean' },
  { name: 'rowCount', datatype: 'number' },
  { name: 'createdAt', datatype: 'datetime' },
];

function QueryHistoryContent() {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [filterUrl, setFilterUrl] = useState('');

  function buildFilterUrlParameter() {
    const urlFilters = filters.map((f) => {
      if (['before', 'after'].includes(f.operator || '')) {
        try {
          if (f.value) {
            f.value = new Date(f.value).toISOString();
          }
        } catch (error) {
          f.value = error.message;
        }
      }
      return `${f.field}|${f.operator}|${f.value}`;
    });
    return urlFilters.join(',');
  }

  const {
    data: historyData,
    isValidating: isRunning,
    error: queryError,
    mutate,
  } = api.useQueryHistory(filterUrl);

  const arrayRows = useMemo(() => {
    return (historyData || []).map((row) => {
      return COLUMNS.map((column) => row[column.name]);
    });
  }, [historyData]);

  const handleRefresh = () => {
    mutate();
  };

  const setFilterValue = (index: number, filterItem: any) => {
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

  const handleRemoveFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const handleApplyFilter = () => {
    setFilterUrl(buildFilterUrlParameter());
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
    </Button>,
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
          height: '100%',
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
                index === filters.length - 1 ? handleAddFilter : undefined
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
  if (historyData) {
    rowCount = <div>{historyData.length} rows</div>;
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
            border: '1px solid #CCC',
          }}
        >
          {isRunning && <QueryResultRunning />}
          {queryError && <ErrorBlock>{queryError}</ErrorBlock>}
          {!isRunning && !queryError && historyData && (
            <QueryResultDataTable columns={COLUMNS} rows={arrayRows} />
          )}
        </div>
      </div>
    </>
  );
}

export default QueryHistoryContent;
