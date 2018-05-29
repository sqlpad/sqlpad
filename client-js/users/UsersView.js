import React from 'react'
import fetchJson from '../utilities/fetch-json.js'
import uuid from 'uuid'
import message from 'antd/lib/message'
import InviteUserForm from './InviteUserForm'
import SimpleTable from '../common/SimpleTable'
import SimpleTh from '../common/SimpleTableTh'
import UserListRow from './UserListRow'
import Modal from '../common/Modal'

import Layout from 'antd/lib/layout'
import 'antd/lib/layout/style/css'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

const { Header, Content } = Layout

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

  render() {
    const { config, currentUser } = this.props
    const { users, showAddUser } = this.state

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
          <div className="bg-white">
            <SimpleTable
              className="w-100"
              renderHeader={() => {
                return (
                  <tr>
                    <SimpleTh>Email</SimpleTh>
                    <SimpleTh>Role</SimpleTh>
                    <SimpleTh>Created</SimpleTh>
                    <SimpleTh>Password reset</SimpleTh>
                    <SimpleTh>Delete</SimpleTh>
                  </tr>
                )
              }}
              renderBody={() =>
                users.map(user => {
                  return (
                    <UserListRow
                      key={user._id}
                      user={user}
                      currentUser={currentUser}
                      handleDelete={this.handleDelete}
                      updateUserRole={this.updateUserRole}
                      generatePasswordResetLink={this.generatePasswordResetLink}
                      removePasswordResetLink={this.removePasswordResetLink}
                    />
                  )
                })
              }
            />
          </div>
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
