import React from 'react'
import fetchJson from './utilities/fetch-json.js'
import moment from 'moment'
import uuid from 'uuid'
import Alert from 'react-s-alert'
import Panel from 'react-bootstrap/lib/Panel'
import Form from 'react-bootstrap/lib/Form'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Button from 'react-bootstrap/lib/Button'
import ListGroup from 'react-bootstrap/lib/ListGroup'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import Popover from 'react-bootstrap/lib/Popover'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'

var UserAdmin = React.createClass({
  getInitialState: function () {
    return {
      users: [],
      isSaving: false
    }
  },
  componentDidMount: function () {
    this.loadUsersFromServer()
  },
  handleDelete: function (user) {
    fetchJson('DELETE', this.props.config.baseUrl + '/api/users/' + user._id)
      .then((json) => {
        if (json.error) return Alert.error('Delete Failed: ' + json.error.toString())
        Alert.success('User Deleted')
        this.loadUsersFromServer()
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  },
  loadUsersFromServer: function () {
    fetchJson('get', this.props.config.baseUrl + '/api/users')
      .then((json) => {
        if (json.error) Alert.error(json.error)
        this.setState({users: json.users})
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  },
  updateUserRole: function (user) {
    this.setState({isSaving: true})
    fetchJson('PUT', this.props.config.baseUrl + '/api/users/' + user._id, {role: user.role})
      .then((json) => {
        this.loadUsersFromServer()
        this.setState({isSaving: false})
        if (json.error) return Alert.error('Update failed: ' + json.error.toString())
        Alert.success('User Updated')
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  },
  generatePasswordResetLink: function (user) {
    this.setState({isSaving: true})
    fetchJson('PUT', this.props.config.baseUrl + '/api/users/' + user._id, {passwordResetId: user.passwordResetId})
      .then((json) => {
        this.loadUsersFromServer()
        this.setState({isSaving: false})
        if (json.error) return Alert.error('Update failed: ' + json.error.toString())
        Alert.success('Password link generated')
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  },
  removePasswordResetLink: function (user) {
    this.setState({isSaving: true})
    fetchJson('PUT', this.props.config.baseUrl + '/api/users/' + user._id, {passwordResetId: ''})
      .then((json) => {
        this.loadUsersFromServer()
        this.setState({isSaving: false})
        if (json.error) return Alert.error('Update failed: ' + json.error.toString())
        Alert.success('Password reset link removed')
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  },
  render: function () {
    return (
      <div>
        <UserList
          users={this.state.users}
          handleDelete={this.handleDelete}
          updateUserRole={this.updateUserRole}
          generatePasswordResetLink={this.generatePasswordResetLink}
          removePasswordResetLink={this.removePasswordResetLink}
          currentUser={this.props.currentUser} />
        <InviteUserForm
          loadUsersFromServer={this.loadUsersFromServer}
          config={this.props.config} />
      </div>
    )
  }
})

export default UserAdmin

var UserList = React.createClass({
  style: {
    position: 'absolute',
    left: 0,
    width: '60%',
    top: 0,
    bottom: 0,
    backgroundColor: '#FDFDFD',
    overflowY: 'auto',
    padding: 10
  },
  render: function () {
    var listRows = this.props.users.map((user) => {
      return (
        <UserListRow
          key={user._id}
          user={user}
          handleDelete={this.props.handleDelete}
          updateUserRole={this.props.updateUserRole}
          generatePasswordResetLink={this.props.generatePasswordResetLink}
          removePasswordResetLink={this.props.removePasswordResetLink}
          currentUser={this.props.currentUser} />
      )
    })
    return (
      <div style={this.style}>
        <ControlLabel>Users</ControlLabel>
        <ListGroup>
          {listRows}
        </ListGroup>
      </div>
    )
  }
})

var UserListRow = React.createClass({
  onDelete: function (e) {
    this.props.handleDelete(this.props.user)
  },
  onRoleChange: function (e) {
    var user = this.props.user
    user.role = e.target.value
    this.props.updateUserRole(user)
  },
  generatePasswordResetLink: function () {
    var user = this.props.user
    user.passwordResetId = uuid.v4()
    this.props.generatePasswordResetLink(user)
  },
  removePasswordResetLink: function () {
    this.props.removePasswordResetLink(this.props.user)
  },
  formControlStyle: {
    minWidth: 200,
    marginLeft: 20
  },
  render: function () {
    var getClassNames = () => {
      return 'list-group-item ListRow'
    }
    const popoverClick = (
      <Popover id='popover-trigger-click' title='Are you sure?'>
        <Button bsStyle='danger' onClick={this.onDelete} style={{width: '100%'}}>delete</Button>
      </Popover>
    )
    var signupDate = () => {
      if (!this.props.user.signupDate) return (<h5>Signup Date: <em>not signed up yet</em></h5>)
      return (<h5>Signup Date: {moment(this.props.user.signupDate).calendar()}</h5>)
    }
    return (
      <li className={getClassNames()}>
        <h4>{this.props.user.email}</h4>
        {signupDate()}
        <PasswordResetButtonLink
          passwordResetId={this.props.user.passwordResetId}
          generatePasswordResetLink={this.generatePasswordResetLink}
          removePasswordResetLink={this.removePasswordResetLink}
          />
        <Form inline>
          <FormGroup controlId='role'>
            <ControlLabel>Role</ControlLabel>{' '}
            <FormControl
              style={this.formControlStyle}
              componentClass='select'
              value={this.props.user.role}
              disabled={this.props.currentUser._id === this.props.user._id}
              onChange={this.onRoleChange} >
              <option value='editor'>Editor</option>
              <option value='admin'>Admin</option>
            </FormControl>
          </FormGroup>
        </Form>
        {(this.props.currentUser._id !== this.props.user._id ? (
          <OverlayTrigger trigger='click' placement='left' container={this} rootClose overlay={popoverClick}>
            <a className='ListRowDeleteButton' href='#delete'><Glyphicon glyph='trash' /></a>
          </OverlayTrigger>
        ) : null)}
      </li>
    )
  }
})

const PasswordResetButtonLink = (props) => {
  var style = {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
    display: 'block'
  }
  if (props.passwordResetId) {
    return (
      <span style={style}>
        <Button onClick={props.removePasswordResetLink}>remove</Button>{' '}
        <a href={'/password-reset/' + props.passwordResetId}>Password Reset Link</a>
      </span>
    )
  }
  return (
    <Button style={style} onClick={props.generatePasswordResetLink}>Generate Password Reset Link</Button>
  )
}

var InviteUserForm = React.createClass({
  style: {
    position: 'absolute',
    right: 0,
    width: '40%',
    top: 0,
    bottom: 0,
    backgroundColor: '#FDFDFD',
    overflowY: 'auto',
    padding: 10
  },
  getInitialState: function () {
    return {
      email: null,
      role: null,
      isInviting: false
    }
  },
  onEmailChange: function (e) {
    this.setState({email: e.target.value})
  },
  onRoleChange: function (e) {
    this.setState({
      role: e.target.value
    })
  },
  onInviteClick: function (e) {
    var user = {
      email: this.state.email,
      role: this.state.role
    }
    this.setState({
      isInviting: true
    })
    fetchJson('POST', this.props.config.baseUrl + '/api/users', user)
      .then((json) => {
        this.setState({
          isInviting: false
        })
        if (json.error) return Alert.error('Whitelist failed: ' + json.error.toString())
        Alert.success('User Whitelisted')
        this.setState({
          email: null,
          role: null
        })
        this.props.loadUsersFromServer()
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  },
  render: function () {
    return (
      <div style={this.style}>
        <ControlLabel>Invite User</ControlLabel>
        <Panel>
          <Form>
            <p>
              Users may only sign up if they have first been whitelisted.
              Once whitelisted, invite them to
              continue the sign-up process on the <a href={this.props.config.baseUrl + '/signup'}>signup page</a>.
            </p>
            <p>
              <strong>Admins</strong> can add and edit database connections,
              as well as whitelist/invite users to join.
            </p>
            <hr />
            <FormGroup controlId='email' validationState={(this.state.email ? null : 'warning')}>
              <ControlLabel>Email</ControlLabel>
              <FormControl type='text' value={this.state.email || ''} onChange={this.onEmailChange} />
            </FormGroup>
            <FormGroup controlId='role' validationState={(this.state.role ? null : 'warning')}>
              <ControlLabel>Role</ControlLabel>
              <FormControl componentClass='select' value={this.state.role || ''} onChange={this.onRoleChange}>
                <option value='' />
                <option value='editor'>Editor</option>
                <option value='admin'>Admin</option>
              </FormControl>
            </FormGroup>
            <Button onClick={this.onInviteClick} disabled={this.state.isInviting}>
              Whitelist User
            </Button>
          </Form>
        </Panel>
      </div>
    )
  }
})
