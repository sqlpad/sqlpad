import React from 'react';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';

const QueryHistoryFilterItem = ({
  index,
  filter,
  onChange,
  onAddFilter,
  onRemoveFilter
}) => {
  const operators = {
    greaterThan: { key: 'gt', label: 'Greater than' },
    lowerThan: { key: 'lt', label: 'Lower than' },
    equals: { key: 'eq', label: 'Equals' },
    notEqual: { key: 'ne', label: 'Not equal' },
    before: { key: 'before', label: 'Before' },
    after: { key: 'after', label: 'After' },
    contains: { key: 'contains', label: 'Contains' }
  };
  const fields = {
    userEmail: { label: 'userEmail', operators: [operators.contains] },
    connectionName: {
      label: 'connectionName',
      operators: [operators.contains]
    },
    startTime: {
      label: 'startTime',
      operators: [operators.before, operators.after]
    },
    queryRunTime: {
      label: 'queryRunTime',
      operators: [operators.greaterThan, operators.lowerThan]
    },
    queryId: { label: 'queryId', operators: [operators.contains] },
    queryName: { label: 'queryName', operators: [operators.contains] },
    queryText: { label: 'queryText', operators: [operators.contains] },
    rowCount: {
      label: 'rowCount',
      operators: [
        operators.lowerThan,
        operators.greaterThan,
        operators.equals,
        operators.notEqual
      ]
    }
  };
  const buttons = [];
  if (onRemoveFilter) {
    buttons.push(
      <Button
        key="removeFilter"
        htmlType="button"
        style={{ width: '20px' }}
        onClick={e => onRemoveFilter(index)}
      >
        -
      </Button>
    );
  }
  if (onAddFilter) {
    buttons.push(
      <Button
        key="addFilter"
        htmlType="button"
        style={{ width: '20px' }}
        onClick={onAddFilter}
      >
        +
      </Button>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <Select
        style={{ width: '200px', marginRight: 8 }}
        name="field"
        value={filter.field}
        onChange={e =>
          onChange(index, {
            field: e.target.value,
            operator: fields[e.target.value].operators[0].key
          })
        }
      >
        {Object.keys(fields).map(f => (
          <option key={f} value={f}>
            {fields[f].label}
          </option>
        ))}
      </Select>

      <Select
        style={{ width: '150px', marginRight: 8 }}
        name="operator"
        value={filter.operator}
        onChange={e => onChange(index, { operator: e.target.value })}
      >
        {fields[filter.field].operators.map(o => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </Select>
      <Input
        style={{ width: '300px', marginRight: 8 }}
        name="value"
        value={filter.value}
        onChange={e => onChange(index, { value: e.target.value })}
      />
      {buttons}
    </div>
  );
};

export default QueryHistoryFilterItem;
