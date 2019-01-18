import Button from 'antd/lib/button'
import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import message from 'antd/lib/message'
import Select from 'antd/lib/select'
import React from 'react'
import AppContext from '../containers/AppContext'
import fetchJson from '../utilities/fetch-json.js'

const FormItem = Form.Item
const { Option } = Select

class InviteUserForm extends React.Component {
  state = {
    email: null,
    role: null,
    isInviting: null
  }

  onEmailChange = e => {
    this.setState({ email: e.target.value })
  }

  onRoleChange = role => {
    this.setState({ role })
  }

  onInviteClick = e => {
    const { onInvited } = this.props
    const user = {
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
        return message.error('Whitelist failed: ' + json.error.toString())
      }
      message.success('User Whitelisted')
      this.setState({
        email: null,
        role: null
      })
      onInvited()
    })
  }

  render() {
    const { email, role, isInviting } = this.state

    return (
      <AppContext.Consumer>
        {appContext => (
          <div>
            <p>
              Users may only sign up if they have first been whitelisted. Once
              whitelisted, invite them to continue the sign-up process on the{' '}
              <a
                href={
                  appContext.config && appContext.config.baseUrl + '/signup'
                }
              >
                signup page
              </a>
              .
            </p>
            <p>
              <strong>Admins</strong> can add and edit database connections, as
              well as whitelist/invite users to join.
            </p>
            <hr />
            <Form layout="vertical">
              <FormItem validateStatus={email ? null : 'error'}>
                <label className="near-black">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={email || ''}
                  onChange={this.onEmailChange}
                />
              </FormItem>
              <FormItem validateStatus={role ? null : 'error'}>
                <label className="near-black">Role</label>
                <Select
                  name="role"
                  value={role || ''}
                  onChange={this.onRoleChange}
                >
                  <Option value="editor">Editor</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </FormItem>
              <Button
                className="align-right"
                type="primary"
                onClick={this.onInviteClick}
                disabled={isInviting}
              >
                Whitelist User
              </Button>
            </Form>
          </div>
        )}
      </AppContext.Consumer>
    )
  }
}

export default InviteUserForm
