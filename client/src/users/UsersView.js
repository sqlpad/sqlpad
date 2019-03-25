import Button from 'antd/lib/button';
import Layout from 'antd/lib/layout';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Popconfirm from 'antd/lib/popconfirm';
import Select from 'antd/lib/select';
import Table from 'antd/lib/table';
import moment from 'moment';
import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import uuid from 'uuid';
import AppNav from '../AppNav';
import Header from '../common/Header';
import AppContext from '../containers/AppContext';
import fetchJson from '../utilities/fetch-json.js';
import InviteUserForm from './InviteUserForm';

const { Content } = Layout;
const { Column } = Table;
const { Option } = Select;

function UsersView(props) {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const appContext = useContext(AppContext);
  const { currentUser } = appContext;

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

  const updateUserRole = async user => {
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      role: user.role
    });
    loadUsersFromServer();
    if (json.error) {
      return message.error('Update failed: ' + json.error.toString());
    }
    message.success('User Updated');
  };

  const generatePasswordResetLink = async user => {
    const passwordResetId = uuid.v4();
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      passwordResetId
    });
    loadUsersFromServer();
    if (json.error) {
      return message.error('Update failed: ' + json.error.toString());
    }
    message.success('Password link generated');
  };

  const removePasswordResetLink = async user => {
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      passwordResetId: ''
    });
    loadUsersFromServer();
    if (json.error) {
      return message.error('Update failed: ' + json.error.toString());
    }
    message.success('Password reset link removed');
  };

  const handleOnInvited = () => {
    loadUsersFromServer();
    setShowAddUser(false);
  };

  const createdRender = (text, record) => {
    return !record.signupDate ? (
      <em>not signed up yet</em>
    ) : (
      moment(record.signupDate).calendar()
    );
  };

  const roleRender = (text, record) => {
    return (
      <Select
        className="w4"
        name="role"
        disabled={currentUser && currentUser._id === record._id}
        value={record.role || ''}
        onChange={value => {
          record.role = value;
          return updateUserRole(record);
        }}
      >
        <Option value="editor">Editor</Option>
        <Option value="admin">Admin</Option>
      </Select>
    );
  };

  const resetButtonRender = (text, record) => {
    if (record.passwordResetId) {
      return (
        <span>
          <Button
            className="w4 mr3"
            onClick={() => removePasswordResetLink(record)}
          >
            Remove
          </Button>
          <Link className="w4" to={'/password-reset/' + record.passwordResetId}>
            Reset Link
          </Link>
        </span>
      );
    }
    return (
      <Button className="w4" onClick={() => generatePasswordResetLink(record)}>
        Generate Link
      </Button>
    );
  };

  return (
    <AppNav>
      <Layout
        style={{ minHeight: '100vh' }}
        className="flex w-100 flex-column h-100"
      >
        <Header title="Users">
          <Button type="primary" onClick={() => setShowAddUser(true)}>
            New user
          </Button>
        </Header>
        <Content className="ma4">
          <div className="bg-white">
            <Table
              locale={{ emptyText: 'No users found' }}
              dataSource={users}
              pagination={false}
              className="w-100"
            >
              <Column title="Email" key="email" dataIndex="email" />
              <Column title="Role" key="role" render={roleRender} />
              <Column title="Created" key="created" render={createdRender} />
              <Column
                title="Password reset"
                key="resetButton"
                render={resetButtonRender}
              />
              <Column
                title="Delete"
                key="delete"
                render={(text, record) => {
                  return (
                    <Popconfirm
                      title="Delete user?"
                      onConfirm={e => handleDelete(record)}
                      onCancel={() => {}}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button icon="delete" type="danger" />
                    </Popconfirm>
                  );
                }}
              />
            </Table>
          </div>
          <Modal
            title="New user"
            visible={showAddUser}
            footer={null}
            width={'500px'}
            destroyOnClose={true}
            onCancel={() => setShowAddUser(false)}
          >
            <InviteUserForm onInvited={handleOnInvited} />
          </Modal>
        </Content>
      </Layout>
    </AppNav>
  );
}

export default UsersView;
