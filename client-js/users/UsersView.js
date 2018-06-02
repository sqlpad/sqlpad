import React from 'react'
import fetchJson from '../utilities/fetch-json.js'
import uuid from 'uuid'
import message from 'antd/lib/message'
import InviteUserForm from './InviteUserForm'
import Modal from '../common/Modal'
import moment from 'moment'
import { Link } from 'react-router-dom'

import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'

import Popconfirm from 'antd/lib/popconfirm'
import 'antd/lib/popconfirm/style/css'

import Layout from 'antd/lib/layout'
import 'antd/lib/layout/style/css'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

import Select from 'antd/lib/select'
import 'antd/lib/select/style/css'

const { Header, Content } = Layout
const { Column } = Table
const { Option } = Select

class UsersView extends React.Component {
  state = {
    users: [],
    isSaving: false,
    showAddUser: false
  }

  componentDidMount() {
    document.title = 'SQLPad - Users'
    this.loadUsersFromServer()
  }

  handleDelete = user => {
    fetchJson('DELETE', '/api/users/' + user._id).then(json => {
      if (json.error) {
        return message.error('Delete Failed: ' + json.error.toString())
      }
      message.success('User Deleted')
      this.loadUsersFromServer()
    })
  }

  loadUsersFromServer = () => {
    fetchJson('GET', '/api/users').then(json => {
      if (json.error) message.error(json.error)
      this.setState({ users: json.users })
    })
  }

  updateUserRole = user => {
    this.setState({ isSaving: true })
    fetchJson('PUT', '/api/users/' + user._id, {
      role: user.role
    }).then(json => {
      this.loadUsersFromServer()
      this.setState({ isSaving: false })
      if (json.error) {
        return message.error('Update failed: ' + json.error.toString())
      }
      message.success('User Updated')
    })
  }

  generatePasswordResetLink = user => {
    this.setState({ isSaving: true })
    const passwordResetId = uuid.v4()
    fetchJson('PUT', '/api/users/' + user._id, {
      passwordResetId
    }).then(json => {
      this.loadUsersFromServer()
      this.setState({ isSaving: false })
      if (json.error) {
        return message.error('Update failed: ' + json.error.toString())
      }
      message.success('Password link generated')
    })
  }

  removePasswordResetLink = user => {
    this.setState({ isSaving: true })
    fetchJson('PUT', '/api/users/' + user._id, {
      passwordResetId: ''
    }).then(json => {
      this.loadUsersFromServer()
      this.setState({ isSaving: false })
      if (json.error) {
        return message.error('Update failed: ' + json.error.toString())
      }
      message.success('Password reset link removed')
    })
  }

  handleOnInvited = () => {
    this.loadUsersFromServer()
    this.setState({ showAddUser: false })
  }

  createdRender = (text, record) => {
    return !record.signupDate ? (
      <em>not signed up yet</em>
    ) : (
      moment(record.signupDate).calendar()
    )
  }

  roleRender = (text, record) => {
    const { currentUser } = this.props
    return (
      <Select
        className="w5"
        name="role"
        disabled={currentUser._id === record._id}
        value={record.role || ''}
        onChange={value => {
          record.role = value
          return this.updateUserRole(record)
        }}
      >
        <Option value="editor">Editor</Option>
        <Option value="admin">Admin</Option>
      </Select>
    )
  }

  resetButtonRender = (text, record) => {
    if (record.passwordResetId) {
      return (
        <span>
          <Button
            className="w5 mr3"
            onClick={() => this.removePasswordResetLink(record)}
          >
            Remove
          </Button>
          <Link className="w5" to={'/password-reset/' + record.passwordResetId}>
            Reset Link
          </Link>
        </span>
      )
    }
    return (
      <Button
        className="w5"
        onClick={() => this.generatePasswordResetLink(record)}
      >
        Generate Link
      </Button>
    )
  }

  renderTable() {
    const { users } = this.state
    return (
      <Table
        locale={{ emptyText: 'No users found' }}
        dataSource={users}
        pagination={false}
        className="w-100"
      >
        <Column title="Email" key="email" dataIndex="email" />
        <Column title="Role" key="role" render={this.roleRender} />
        <Column title="Created" key="created" render={this.createdRender} />
        <Column
          title="Password reset"
          key="resetButton"
          render={this.resetButtonRender}
        />
        <Column
          title="Delete"
          key="delete"
          render={(text, record) => {
            return (
              <Popconfirm
                title="Delete user?"
                onConfirm={e => this.handleDelete(record)}
                onCancel={() => {}}
                okText="Yes"
                cancelText="No"
              >
                <Button icon="delete" type="danger" />
              </Popconfirm>
            )
          }}
        />
      </Table>
    )
  }

  render() {
    const { config } = this.props
    const { showAddUser } = this.state

    return (
      <Layout
        style={{ minHeight: '100vh' }}
        className="flex w-100 flex-column h-100"
      >
        <Header className=" pr4 pl4">
          <div className="f1 fl white">Users</div>
          <div className="fr">
            <Button
              type="primary"
              onClick={() => this.setState({ showAddUser: true })}
            >
              New user
            </Button>
          </div>
        </Header>
        <Content className="ma4">
          <div className="bg-white">{this.renderTable()}</div>
          <Modal
            title="New user"
            show={showAddUser}
            onHide={() => this.setState({ showAddUser: false })}
            renderBody={() => {
              return (
                <InviteUserForm
                  onInvited={this.handleOnInvited}
                  config={config}
                />
              )
            }}
          />
        </Content>
      </Layout>
    )
  }
}

export default UsersView
