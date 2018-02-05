import React from 'react'
import fetchJson from '../utilities/fetch-json.js'
import uuid from 'uuid'
import Alert from 'react-s-alert'
import InviteUserForm from './InviteUserForm'
import SimpleTable from '../common/SimpleTable'
import SimpleTh from '../common/SimpleTableTh'
import UserListRow from './UserListRow'
import Modal from '../common/Modal'
import Button from '../common/Button'

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
        return Alert.error('Delete Failed: ' + json.error.toString())
      }
      Alert.success('User Deleted')
      this.loadUsersFromServer()
    })
  }

  loadUsersFromServer = () => {
    fetchJson('GET', '/api/users').then(json => {
      if (json.error) Alert.error(json.error)
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
        return Alert.error('Update failed: ' + json.error.toString())
      }
      Alert.success('User Updated')
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
        return Alert.error('Update failed: ' + json.error.toString())
      }
      Alert.success('Password link generated')
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
        return Alert.error('Update failed: ' + json.error.toString())
      }
      Alert.success('Password reset link removed')
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
      <div className="flex w-100 flex-column">
        <div>
          <div className="ma4 f1 fl">Users</div>
          <Button
            className="ma4 fr"
            primary
            onClick={() => this.setState({ showAddUser: true })}
          >
            New user
          </Button>
        </div>
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
      </div>
    )
  }
}

export default UsersView
