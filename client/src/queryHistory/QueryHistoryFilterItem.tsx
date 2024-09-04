import React, { ChangeEvent } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

export type FieldKey =
  | 'userEmail'
  | 'connectionName'
  | 'startTime'
  | 'durationMs'
  | 'queryId'
  | 'queryName'
  | 'queryText'
  | 'rowCount';

export interface Filter {
  field?: FieldKey;
  operator?: string;
  value?: string;
}

interface Props {
  index: number;
  filter: Filter;
  onChange: (index: number, filter: Filter) => void;
  onAddFilter?: () => void;
  onRemoveFilter: (index: number) => void;
}

const QueryHistoryFilterItem = ({
  index,
  filter,
  onChange,
  onAddFilter,
  onRemoveFilter,
}: Props) => {
  const operators = {
    greaterThan: { key: 'gt', label: 'Greater than' },
    lowerThan: { key: 'lt', label: 'Lower than' },
    equals: { key: 'eq', label: 'Equals' },
    notEqual: { key: 'ne', label: 'Not equal' },
    before: { key: 'before', label: 'Before' },
    after: { key: 'after', label: 'After' },
    contains: { key: 'contains', label: 'Contains' },
  };
  const fields = {
    userEmail: { label: 'userEmail', operators: [operators.contains] },
    connectionName: {
      label: 'connectionName',
      operators: [operators.contains],
    },
    status: {
      label: 'status',
      operators: [operators.contains],
    },
    startTime: {
      label: 'startTime',
      operators: [operators.before, operators.after],
    },
    durationMs: {
      label: 'durationMs',
      operators: [operators.greaterThan, operators.lowerThan],
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
        operators.notEqual,
      ],
    },
  };
  const buttons = [];
  if (onRemoveFilter) {
    buttons.push(
      <Button
        key="removeFilter"
        htmlType="button"
        style={{ width: '20px' }}
        onClick={() => onRemoveFilter(index)}
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
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          const value = e.target.value as FieldKey;
          if (fields[value]) {
            onChange(index, {
              field: value,
              operator: fields[value].operators[0].key,
            });
          }
        }}
      >
        {Object.entries(fields).map(([f, value]) => (
          <option key={f} value={f}>
            {value.label}
          </option>
        ))}
      </Select>

      <Select
        style={{ width: '150px', marginRight: 8 }}
        name="operator"
        value={filter.operator}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          onChange(index, { operator: e.target.value })
        }
      >
        {fields[filter.field as FieldKey].operators.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </Select>
      <Input
        style={{ width: '300px', marginRight: 8 }}
        name="value"
        value={filter.value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange(index, { value: e.target.value })
        }
      />
      {buttons}
    </div>
  );
};

export default QueryHistoryFilterItem;
