import React from 'react'
import moment from 'moment'
import Form from 'react-bootstrap/lib/Form'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import Popover from 'react-bootstrap/lib/Popover'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import PasswordResetButtonLink from './PasswordResetButtonLink'

const formControlStyle = {
  minWidth: 200,
  marginLeft: 20
}

class UserListRow extends React.Component {
  constructor(props) {
    super(props)
    this.onDelete = this.onDelete.bind(this)
    this.onRoleChange = this.onRoleChange.bind(this)
    this.generatePasswordResetLink = this.generatePasswordResetLink.bind(this)
    this.removePasswordResetLink = this.removePasswordResetLink.bind(this)
  }

  onDelete(e) {
    this.props.handleDelete(this.props.user)
  }

  onRoleChange(e) {
    const user = this.props.user
    user.role = e.target.value
    this.props.updateUserRole(user)
  }

  generatePasswordResetLink() {
    this.props.generatePasswordResetLink(this.props.user)
  }

  removePasswordResetLink() {
    this.props.removePasswordResetLink(this.props.user)
  }

  render() {
    const { user, currentUser } = this.props
    const popoverClick = (
      <Popover id="popover-trigger-click" title="Are you sure?">
        <Button
          bsStyle="danger"
          onClick={this.onDelete}
          style={{ width: '100%' }}
        >
          delete
        </Button>
      </Popover>
    )
    var signupDate = () => {
      if (!user.signupDate) {
        return (
          <h5>
            Signup Date: <em>not signed up yet</em>
          </h5>
        )
      }
      return <h5>Signup Date: {moment(user.signupDate).calendar()}</h5>
    }
    return (
      <li className={'list-group-item ListRow'}>
        <h4>{user.email}</h4>
        {signupDate()}
        <PasswordResetButtonLink
          passwordResetId={user.passwordResetId}
          generatePasswordResetLink={this.generatePasswordResetLink}
          removePasswordResetLink={this.removePasswordResetLink}
        />
        <Form inline>
          <FormGroup controlId="role">
            <ControlLabel>Role</ControlLabel>{' '}
            <FormControl
              style={formControlStyle}
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
        {currentUser._id !== user._id ? (
          <OverlayTrigger
            trigger="click"
            placement="left"
            container={this}
            rootClose
            overlay={popoverClick}
          >
            <a className="ListRowDeleteButton" href="#delete">
              <Glyphicon glyph="trash" />
            </a>
          </OverlayTrigger>
        ) : null}
      </li>
    )
  }
}

export default UserListRow
