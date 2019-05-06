import List from 'antd/lib/list';
import React, { useEffect, useState } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import fetchJson from '../utilities/fetch-json.js';
import InviteUserForm from './InviteUserForm';
import EditUserForm from './EditUserForm';
import Button from '../common/Button';
import message from '../common/message';
import Modal from '../common/Modal';
import DeleteConfirmButton from '../common/DeleteConfirmButton';

function UserList({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const loadUsersFromServer = async () => {
    const json = await fetchJson('GET', '/api/users');
    if (json.error) {
      message.error(json.error);
    }
    if (json.users) {
      const users = json.users.map(user => {
        user.key = user._id;
        return user;
      });
      setUsers(users);
    }
  };

  useEffect(() => {
    document.title = 'SQLPad - Users';
    loadUsersFromServer();
  }, []);

  const handleDelete = async user => {
    const json = await fetchJson('DELETE', '/api/users/' + user._id);
    if (json.error) {
      return message.error('Delete Failed: ' + json.error.toString());
    }
    loadUsersFromServer();
  };

  const handleOnInvited = () => {
    loadUsersFromServer();
    setShowAddUser(false);
  };

  const renderItem = user => {
    const actions = [];

    if (currentUser && currentUser._id !== user._id) {
      actions.push(
        <Button key="edit" onClick={() => setEditUser(user)}>
          edit
        </Button>
      );
      actions.push(
        <DeleteConfirmButton
          key="delete"
          confirmMessage={`Delete ${user.email}?`}
          onConfirm={e => handleDelete(user)}
        >
          Delete
        </DeleteConfirmButton>
      );
    }

    const userSignupInfo = !user.signupDate ? (
      <em> - not signed up yet</em>
    ) : (
      ''
    );

    return (
      <List.Item actions={actions}>
        <List.Item.Meta
          title={user.email}
          description={
            <div>
              {user.role} {userSignupInfo}
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          style={{ width: 135 }}
          type="primary"
          onClick={() => setShowAddUser(true)}
        >
          Add user
        </Button>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={users}
        renderItem={renderItem}
      />

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
          loadUsersFromServer();
          setEditUser(null);
        }}
      >
        <EditUserForm user={editUser} />
        <Button onClick={() => setEditUser(null)}>Close</Button>
      </Modal>
    </>
  );
}

export default connect(
  ['currentUser'],
  actions
)(React.memo(UserList));
