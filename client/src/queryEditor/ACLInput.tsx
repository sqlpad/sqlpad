import DeleteIcon from 'mdi-react/DeleteIcon';
import React, { ChangeEvent } from 'react';
import FormExplain from '../common/FormExplain';
import HSpacer from '../common/HSpacer';
import IconButton from '../common/IconButton';
import Select from '../common/Select';
import Text from '../common/Text';
import { useSessionQueryId } from '../stores/editor-store';
import { ACLRecord } from '../types';
import { api } from '../utilities/api';

interface Props {
  acl: Partial<ACLRecord>[];
  onChange: (value: Partial<ACLRecord>[]) => void;
}

function ACLInput({ acl, onChange }: Props) {
  const { data: users } = api.useUsers();
  const queryId = useSessionQueryId();
  const { data: query } = api.useQuery(queryId);

  if (!users || !query) {
    return null;
  }

  function handleNewSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const { value } = event.target;
    if (value === '__EVERYONE__') {
      onChange(acl.concat([{ groupId: '__EVERYONE__' }]));
    } else if (value) {
      onChange(acl.concat([{ userId: value }]));
    }
  }

  // __EVERYONE__ is a groupId, otherwise everything else are user ids
  // The author of the query can be excluded from list option
  const options = [{ value: '__EVERYONE__', label: 'Everyone' }].concat(
    users
      .filter((user) => user.id !== query?.createdBy)
      .map((user) => {
        return { value: user.id, label: user.name || user.email };
      })
  );

  // Index selected values for optimized selected checks
  const selectedByValue: Record<string, boolean> = {};
  acl.forEach((item) => {
    if (item.groupId) {
      selectedByValue[item.groupId] = true;
    } else if (item.userId) {
      selectedByValue[item.userId] = true;
    }
  });

  // Options to show must include
  // * selected value
  // * all unselected values
  function getSelectOptions(selectedValue: string) {
    return options
      .filter(
        (option) =>
          option.value === selectedValue || !selectedByValue[option.value]
      )
      .map((o) => {
        return (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        );
      });
  }

  return (
    <div>
      <label>Sharing</label>
      {acl.length === 0 ? (
        <div
          style={{
            padding: 16,
            textAlign: 'center',
            backgroundColor: '#fafafa',
            border: '1px dotted #ddd',
          }}
        >
          <Text>
            Only query author or an admin may view, execute, and save changes.
          </Text>
        </div>
      ) : null}
      {acl.map((aclItem, index) => {
        const { write, groupId, userId } = aclItem;
        const readWrite = write ? 'write' : 'readOnly';
        const value = groupId || userId;
        return (
          <div key={value} style={{ display: 'flex', marginBottom: 8 }}>
            <Select
              key={value}
              value={value}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                const aclCopy = [...acl];
                const { value } = event.target;
                if (value === '__EVERYONE__') {
                  aclCopy[index] = { groupId: value, write };
                } else if (value) {
                  aclCopy[index] = { userId: value, write };
                }
                onChange(aclCopy);
              }}
            >
              {getSelectOptions(value || '')}
            </Select>
            <HSpacer />
            <Select
              value={readWrite}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                const { value } = event.target;
                const aclCopy = [...acl];
                const newWrite = value === 'write';
                aclCopy[index] = { groupId, userId, write: newWrite };
                onChange(aclCopy);
              }}
            >
              <option value="readonly">View and execute</option>
              <option value="write">View, execute, and save</option>
            </Select>
            <HSpacer />
            <IconButton
              onClick={() => {
                const first = acl.slice(0, index);
                const second = acl.slice(index + 1);
                onChange([...first, ...second]);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        );
      })}

      <label>
        Add access
        <Select placeholder="test" value={''} onChange={handleNewSelectChange}>
          <option value=""></option>
          {getSelectOptions('')}
        </Select>
      </label>
      <FormExplain>
        <p>
          When a query is shared with view/execute access, the user may alter
          the query prior to execution, but will not be able to save those
          changes.
        </p>
        <p>
          In order to execute a shared query, the user must also have access to
          the underlying connection. This is managed separately, and may only be
          managed by an administrator.
        </p>
      </FormExplain>
    </div>
  );
}

export default ACLInput;
