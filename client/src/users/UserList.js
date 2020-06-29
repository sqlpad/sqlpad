import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import Button from '../common/Button';
import DeleteConfirmButton from '../common/DeleteConfirmButton';
import ListItem from '../common/ListItem';
import message from '../common/message';
import Modal from '../common/Modal';
import Text from '../common/Text';
import { api } from '../utilities/fetch-json.js';
import useAppContext from '../utilities/use-app-context';
import EditUserForm from './EditUserForm';
import InviteUserForm from './InviteUserForm';

function UserList() {
  const { currentUser } = useAppContext();
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [toggling, setToggling] = useState(false);

  const { data: usersData, error, mutate } = useSWR('/api/users');
  const users = (usersData || []).map((user) => ({ ...user, key: user.id }));

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleDisableToggle = async (user) => {
    setToggling(true);
    const json = await api.put(`/api/users/${user.id}`, {
      disabled: !user.disabled,
    });
    setToggling(false);
    if (json.error) {
      return message.error('Disable toggle failed: ' + json.error);
    }
    const mutatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return json.data;
      }
      return u;
    });
    mutate(mutatedUsers);
  };

  const handleDelete = async (user) => {
    const json = await api.delete(`/api/users/${user.id}`);
    if (json.error) {
      return message.error('Delete Failed: ' + json.error);
    }
    mutate(users.filter((u) => u.id !== user.id));
  };

  const handleOnInvited = () => {
    mutate();
    setShowAddUser(false);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          style={{ width: 135 }}
          variant="primary"
          onClick={() => setShowAddUser(true)}
        >
          Add user
        </Button>
      </div>

      {users.map((user) => {
        const actions = [];

        if (currentUser && currentUser.id !== user.id) {
          actions.push(
            <Button
              key="edit"
              style={{ marginLeft: 8 }}
              onClick={() => setEditUser(user)}
            >
              Edit
            </Button>
          );
          actions.push(
            <Button
              key="toggle-disable"
              style={{ marginLeft: 8 }}
              disabled={toggling}
              onClick={() => handleDisableToggle(user)}
            >
              {user.disabled ? 'Enable' : 'Disable'}
            </Button>
          );
          actions.push(
            <DeleteConfirmButton
              key="delete"
              confirmMessage={`Delete ${user.email}?`}
              onConfirm={(e) => handleDelete(user)}
              style={{ marginLeft: 8 }}
            >
              Delete
            </DeleteConfirmButton>
          );
        }

        let additionalUserInfo = '';
        if (user.disabled) {
          additionalUserInfo = <em> - disabled</em>;
        } else if (!user.signupAt) {
          additionalUserInfo = <em> - not signed up yet</em>;
        }

        return (
          <ListItem key={user.id}>
            <div style={{ flexGrow: 1, padding: 8 }}>
              {user.email}
              <br />
              <Text type="secondary">
                {user.role} {additionalUserInfo}
              </Text>
            </div>
            {actions}
          </ListItem>
        );
      })}

      <Modal
        title="Add user"
        visible={showAddUser}
        width={'500px'}
        onClose={() => setShowAddUser(false)}
      >
        <InviteUserForm onInvited={handleOnInvited} />
      </Modal>

      <Modal
        title={editUser && editUser.email}
        visible={Boolean(editUser)}
        width={'500px'}
        onClose={() => {
          mutate();
          setEditUser(null);
        }}
      >
        <EditUserForm userId={editUser && editUser.id} />
      </Modal>
    </>
  );
}

export default React.memo(UserList);
