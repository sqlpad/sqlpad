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
import useAppContext from '../utilities/use-app-context';

interface Props {
  disabled?: boolean;
  acl: Partial<ACLRecord>[];
  onChange: (value: Partial<ACLRecord>[]) => void;
}

const EVERYONE_GROUP_ID = '__EVERYONE__';

function ACLInput({ acl, onChange, disabled }: Props) {
  const { data: users } = api.useUsers();
  const queryId = useSessionQueryId();
  const { data: query } = api.useQuery(queryId);
  const { currentUser } = useAppContext();

  if (!users) {
    return null;
  }

  // __EVERYONE__ is a groupId, otherwise everything else are user ids
  // The author of the query should be excluded from list option
  const queryAuthorId = query?.createdBy || currentUser?.id;
  const options = [{ value: EVERYONE_GROUP_ID, label: 'Everyone' }].concat(
    users
      .filter((user) => user.id !== queryAuthorId)
      .map((user) => {
        return {
          value: user.id,
          label: user.name || user.email || user.ldapId || '',
        };
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

  // Options to show must include selected value + all unselected value
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

  // An empty row always added for adding additional groups/users
  const aclPlusEmpty = acl.concat([{ groupId: '', userId: '', write: false }]);

  return (
    <div>
      <label>Access</label>
      {acl.length === 0 ? (
        <div
          style={{
            padding: 16,
            marginTop: 16,
            marginBottom: 16,
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
      {aclPlusEmpty.map((aclItem, index) => {
        const { write, groupId, userId } = aclItem;
        const readWrite = write ? 'write' : 'readOnly';
        const value = groupId || userId;

        const isLastItem = index + 1 === aclPlusEmpty.length;

        // If there are no  options left, don't render a row
        const options = getSelectOptions(value || '');
        if (options.length === 0) {
          return null;
        }

        // If disabled and this is last item don't show it
        // The last item is always used for new entries
        if (isLastItem && disabled) {
          return null;
        }

        return (
          <div key={index} style={{ display: 'flex', marginBottom: 8 }}>
            <Select
              value={value}
              disabled={disabled}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                const aclCopy = [...acl];
                const { value } = event.target;
                if (value === EVERYONE_GROUP_ID) {
                  aclCopy[index] = { groupId: value, write };
                } else if (value) {
                  aclCopy[index] = { userId: value, write };
                }
                onChange(aclCopy);
              }}
            >
              <option value="" disabled hidden>
                Add access...
              </option>
              {options}
            </Select>
            <HSpacer />
            <Select
              disabled={isLastItem || disabled}
              value={readWrite}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                const { value } = event.target;
                const aclCopy = [...acl];
                const newWrite = value === 'write';
                aclCopy[index] = { groupId, userId, write: newWrite };
                onChange(aclCopy);
              }}
            >
              <option value="readonly">
                {isLastItem ? '' : 'View and execute'}
              </option>
              <option value="write">View, execute, and save</option>
            </Select>
            <HSpacer />
            <IconButton
              disabled={isLastItem || disabled}
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

      {!disabled && (
        <FormExplain>
          <p>
            When a query is shared with view/execute access, the user may alter
            the query prior to execution, but will not be able to save those
            changes.
          </p>
          <p>
            To execute a shared query, the user must also have access to the
            underlying connection. This is managed separately and requires admin
            permissions.
          </p>
        </FormExplain>
      )}
    </div>
  );
}

export default ACLInput;
