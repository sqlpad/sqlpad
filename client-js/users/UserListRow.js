import React from 'react'
import moment from 'moment'
import Form from 'react-bootstrap/lib/Form'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import PasswordResetButtonLink from './PasswordResetButtonLink'
import DeleteButton from '../common/DeleteButton'

class UserListRow extends React.Component {
  onDelete = e => {
    const { user, handleDelete } = this.props
    handleDelete(user)
  }

  onRoleChange = e => {
    const { user, updateUserRole } = this.props
    user.role = e.target.value
    updateUserRole(user)
  }

  generatePasswordResetLink = () => {
    const { generatePasswordResetLink, user } = this.props
    generatePasswordResetLink(user)
  }

  removePasswordResetLink = () => {
    const { removePasswordResetLink, user } = this.props
    removePasswordResetLink(user)
  }

  render() {
    const { user, currentUser } = this.props
    const signupDate = !user.signupDate ? (
      <em>not signed up yet</em>
    ) : (
      moment(user.signupDate).calendar()
    )

    return (
      <li className={'list-group-item ListRow'}>
        <h4>{user.email}</h4>
        <h5>{signupDate}</h5>
        <PasswordResetButtonLink
          passwordResetId={user.passwordResetId}
          generatePasswordResetLink={this.generatePasswordResetLink}
          removePasswordResetLink={this.removePasswordResetLink}
        />
        <Form inline>
          <FormGroup controlId="role">
            <ControlLabel>Role</ControlLabel>{' '}
            <FormControl
              style={{
                minWidth: 200,
                marginLeft: 20
              }}
              componentClass="select"
              value={user.role}
              disabled={currentUser._id === user._id}
              onChange={this.onRoleChange}
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </FormControl>
          </FormGroup>
        </Form>
        {currentUser._id !== user._id && (
          <DeleteButton onClick={this.onDelete} />
        )}
      </li>
    )
  }
}

export default UserListRow
