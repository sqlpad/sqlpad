import React, { ChangeEvent } from 'react';
import Select from '../common/Select';
import { ACLRecord } from '../types';
import { api } from '../utilities/api';
import useAppContext from '../utilities/use-app-context';

interface Props {
  acl: Partial<ACLRecord>[];
  onChange: (value: Partial<ACLRecord>[]) => void;
}

function ACLInput({ acl, onChange }: Props) {
  const { data: users } = api.useUsers();
  const { currentUser } = useAppContext();

  if (!users) {
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
  const options = [{ value: '__EVERYONE__', label: 'Everyone' }].concat(
    users.map((user) => {
      return { value: user.id, label: user.name || user.email };
    })
  );

  // Index selected values for optimized selected checks
  const selectedByValue: Record<string, boolean> = {};
  (acl || []).forEach((item) => {
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
      {(acl || []).map((aclItem, index) => {
        const value = aclItem.groupId || aclItem.userId;
        return (
          <Select
            key={value}
            value={value}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              const aclCopy = [...acl];
              const { value } = event.target;
              if (value === '__EVERYONE__') {
                aclCopy[index] = { groupId: value };
              } else if (value) {
                aclCopy[index] = { userId: value };
              }
              onChange(aclCopy);
            }}
          >
            {getSelectOptions(value || '')}
          </Select>
        );
      })}
      <Select value={''} onChange={handleNewSelectChange}>
        <option value=""></option>
        {getSelectOptions('')}
      </Select>
    </div>
  );
}

export default ACLInput;
