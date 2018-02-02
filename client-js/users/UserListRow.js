import React from 'react'
import moment from 'moment'
import Form from 'react-bootstrap/lib/Form'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import PasswordResetButtonLink from './PasswordResetButtonLink'
import DeleteButton from '../common/DeleteButton'
import SimpleTd from '../common/SimpleTableTd'

class UserListRow extends React.Component {
  handleDeleteClick = e => {
    const { user, handleDelete } = this.props
    handleDelete(user)
  }

  handleRoleChange = e => {
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
      <tr>
        <SimpleTd>{user.email}</SimpleTd>
        <SimpleTd>
          <Form inline>
            <FormGroup controlId="role">
              <FormControl
                style={{
                  minWidth: 200,
                  marginLeft: 0
                }}
                componentClass="select"
                value={user.role}
                disabled={currentUser._id === user._id}
                onChange={this.handleRoleChange}
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </FormControl>
            </FormGroup>
          </Form>
        </SimpleTd>
        <SimpleTd>{signupDate}</SimpleTd>
        <SimpleTd>
          <PasswordResetButtonLink
            passwordResetId={user.passwordResetId}
            generatePasswordResetLink={this.generatePasswordResetLink}
            removePasswordResetLink={this.removePasswordResetLink}
          />
        </SimpleTd>
        <SimpleTd>
          {currentUser._id !== user._id && (
            <DeleteButton onClick={this.handleDeleteClick} />
          )}
        </SimpleTd>
      </tr>
    )
  }
}

export default UserListRow
