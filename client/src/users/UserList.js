import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { connect } from 'unistore/react';
import Button from '../common/Button';
import DeleteConfirmButton from '../common/DeleteConfirmButton';
import ListItem from '../common/ListItem';
import message from '../common/message';
import Modal from '../common/Modal';
import Text from '../common/Text';
import fetchJson from '../utilities/fetch-json.js';
import EditUserForm from './EditUserForm';
import InviteUserForm from './InviteUserForm';

function UserList({ currentUser }) {
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const { data: usersData, error, mutate } = useSWR('/api/users');
  const users = (usersData || []).map((user) => ({ ...user, key: user.id }));

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleDelete = async (user) => {
    const json = await fetchJson('DELETE', '/api/users/' + user.id);
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
              edit
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

        const userSignupInfo = !user.signupAt ? (
          <em> - not signed up yet</em>
        ) : (
          ''
        );

        return (
          <ListItem key={user.id}>
            <div style={{ flexGrow: 1, padding: 8 }}>
              {user.email}
              <br />
              <Text type="secondary">
                {user.role} {userSignupInfo}
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
        <EditUserForm user={editUser} />
      </Modal>
    </>
  );
}

export default connect(['currentUser'])(React.memo(UserList));
