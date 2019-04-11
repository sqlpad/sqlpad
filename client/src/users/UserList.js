import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Popconfirm from 'antd/lib/popconfirm';
import List from 'antd/lib/list';
import React, { useEffect, useState } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import fetchJson from '../utilities/fetch-json.js';
import InviteUserForm from './InviteUserForm';
import EditUserForm from './EditUserForm';

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
    message.success('User Deleted');
    loadUsersFromServer();
  };

  const handleOnInvited = () => {
    loadUsersFromServer();
    setShowAddUser(false);
  };

  const renderItem = user => {
    const actions = [];

    if (currentUser && currentUser._id !== user._id) {
      actions.push(<Button onClick={() => setEditUser(user)}>edit</Button>);
      actions.push(
        <Popconfirm
          title={`Delete ${user.email}?`}
          onConfirm={e => handleDelete(user)}
          onCancel={() => {}}
          okText="Delete"
          cancelText="cancel"
        >
          <Button icon="delete" type="danger" />
        </Popconfirm>
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
      <Row>
        <Col offset={19} span={5}>
          <Button
            className="w-100"
            type="primary"
            onClick={() => setShowAddUser(true)}
          >
            Add user
          </Button>
        </Col>
      </Row>

      <List
        itemLayout="horizontal"
        dataSource={users}
        renderItem={renderItem}
      />

      <Modal
        title="Add user"
        visible={showAddUser}
        footer={null}
        width={'500px'}
        destroyOnClose={true}
        onCancel={() => setShowAddUser(false)}
      >
        <InviteUserForm onInvited={handleOnInvited} />
      </Modal>

      <Modal
        title={editUser && editUser.email}
        visible={Boolean(editUser)}
        footer={null}
        width={'500px'}
        destroyOnClose={true}
        onCancel={() => {
          loadUsersFromServer();
          setEditUser(null);
        }}
      >
        <EditUserForm user={editUser} />
      </Modal>
    </>
  );
}

export default connect(
  ['currentUser'],
  actions
)(React.memo(UserList));
