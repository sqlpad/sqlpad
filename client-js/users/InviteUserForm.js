import React from 'react'
import fetchJson from '../utilities/fetch-json.js'
import Alert from 'react-s-alert'
import Panel from 'react-bootstrap/lib/Panel'
import Form from 'react-bootstrap/lib/Form'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Button from 'react-bootstrap/lib/Button'

const inviteUserFormStyle = {
  flexBasis: '50%',
  backgroundColor: '#FDFDFD',
  overflowY: 'auto',
  padding: 10
}

class InviteUserForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: null,
      role: null,
      isInviting: null
    }
    this.onEmailChange = this.onEmailChange.bind(this)
    this.onRoleChange = this.onRoleChange.bind(this)
    this.onInviteClick = this.onInviteClick.bind(this)
  }

  onEmailChange(e) {
    this.setState({ email: e.target.value })
  }

  onRoleChange(e) {
    this.setState({
      role: e.target.value
    })
  }

  onInviteClick(e) {
    var user = {
      email: this.state.email,
      role: this.state.role
    }
    this.setState({
      isInviting: true
    })
    fetchJson('POST', '/api/users', user).then(json => {
      this.setState({
        isInviting: false
      })
      if (json.error) {
        return Alert.error('Whitelist failed: ' + json.error.toString())
      }
      Alert.success('User Whitelisted')
      this.setState({
        email: null,
        role: null
      })
      this.props.loadUsersFromServer()
    })
  }

  render() {
    return (
      <div style={inviteUserFormStyle}>
        <ControlLabel>Invite User</ControlLabel>
        <Panel>
          <Form>
            <p>
              Users may only sign up if they have first been whitelisted. Once
              whitelisted, invite them to continue the sign-up process on the{' '}
              <a href={this.props.config.baseUrl + '/signup'}>signup page</a>.
            </p>
            <p>
              <strong>Admins</strong> can add and edit database connections, as
              well as whitelist/invite users to join.
            </p>
            <hr />
            <FormGroup
              controlId="email"
              validationState={this.state.email ? null : 'warning'}
            >
              <ControlLabel>Email</ControlLabel>
              <FormControl
                type="text"
                value={this.state.email || ''}
                onChange={this.onEmailChange}
              />
            </FormGroup>
            <FormGroup
              controlId="role"
              validationState={this.state.role ? null : 'warning'}
            >
              <ControlLabel>Role</ControlLabel>
              <FormControl
                componentClass="select"
                value={this.state.role || ''}
                onChange={this.onRoleChange}
              >
                <option value="" />
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </FormControl>
            </FormGroup>
            <Button
              onClick={this.onInviteClick}
              disabled={this.state.isInviting}
            >
              Whitelist User
            </Button>
          </Form>
        </Panel>
      </div>
    )
  }
}

export default InviteUserForm
