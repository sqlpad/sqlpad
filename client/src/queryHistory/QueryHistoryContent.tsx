import React, { useMemo, useState } from 'react';
import Button from '../common/Button';
import ErrorBlock from '../common/ErrorBlock';
import QueryResultDataTable from '../common/QueryResultDataTable';
import QueryResultRunning from '../common/QueryResultRunning';
import { StatementColumn } from '../types';
import { api } from '../utilities/api';
import QueryHistoryFilterItem, { Filter } from './QueryHistoryFilterItem';

const COLUMNS: StatementColumn[] = [
  { name: 'userEmail', datatype: 'string', maxLineLength: 20 },
  { name: 'connectionName', datatype: 'string', maxLineLength: 20 },
  { name: 'status', datatype: 'string', maxLineLength: 20 },
  { name: 'startTime', datatype: 'datetime', maxLineLength: 23 },
  { name: 'stopTime', datatype: 'datetime', maxLineLength: 23 },
  { name: 'durationMs', datatype: 'number', maxLineLength: 10 },
  { name: 'queryId', datatype: 'string', maxLineLength: 36 },
  { name: 'queryName', datatype: 'string', maxLineLength: 30 },
  { name: 'queryText', datatype: 'string', maxLineLength: 50 },
  { name: 'incomplete', datatype: 'boolean', maxLineLength: 4 },
  { name: 'rowCount', datatype: 'number', maxLineLength: 8 },
  { name: 'createdAt', datatype: 'datetime', maxLineLength: 23 },
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

  // Result grid height is fixed for now. To use dynamic flex sizing Modal CSS
  // would need to be reworked and the complexity is not worth the changes.
  // If dynamic height is needed, a simpler solution might be to measure screen height and grid position.
  // Unknown if more height is necessary, so leaving this as is.
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
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 360,
          border: '1px solid #CCC',
        }}
      >
        {isRunning && <QueryResultRunning />}
        {queryError && <ErrorBlock>{queryError}</ErrorBlock>}
        {!isRunning && !queryError && historyData && (
          <QueryResultDataTable columns={COLUMNS} rows={arrayRows} />
        )}
      </div>
    </>
  );
}

export default QueryHistoryContent;
