import React from 'react'
import fetchJson from '../utilities/fetch-json.js'
import uuid from 'uuid'
import Alert from 'react-s-alert'
import UserList from './UserList'
import InviteUserForm from './InviteUserForm'

class UsersView extends React.Component {
  state = {
    users: [],
    isSaving: false
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

  render() {
    const { config, currentUser } = this.props
    return (
      <div className="flex-100">
        <UserList
          users={this.state.users}
          handleDelete={this.handleDelete}
          updateUserRole={this.updateUserRole}
          generatePasswordResetLink={this.generatePasswordResetLink}
          removePasswordResetLink={this.removePasswordResetLink}
          currentUser={currentUser}
        />
        <InviteUserForm
          loadUsersFromServer={this.loadUsersFromServer}
          config={config}
        />
      </div>
    )
  }
}

export default UsersView
