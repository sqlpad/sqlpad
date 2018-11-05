import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import message from 'antd/lib/message'
import React from 'react'
import { Redirect } from 'react-router-dom'
import fetchJson from './utilities/fetch-json.js'

class PasswordReset extends React.Component {
  state = {
    email: '',
    password: '',
    passwordConfirmation: '',
    redirect: false
  }

  onEmailChange = e => {
    this.setState({ email: e.target.value })
  }

  onPasswordChange = e => {
    this.setState({ password: e.target.value })
  }

  onPasswordConfirmationChange = e => {
    this.setState({ passwordConfirmation: e.target.value })
  }

  resetPassword = e => {
    e.preventDefault()
    fetchJson(
      'POST',
      '/api/password-reset/' + this.props.passwordResetId,
      this.state
    ).then(json => {
      if (json.error) {
        return message.error(json.error)
      }
      this.setState({ redirect: true })
    })
  }

  componentDidMount() {
    document.title = 'SQLPad - Password Reset'
  }

  render() {
    const { redirect } = this.state
    if (redirect) {
      return <Redirect to="/" />
    }
    return (
      <div className="pt5 measure center" style={{ width: '300px' }}>
        <form onSubmit={this.resetPassword}>
          <h1 className="f2 tc">SQLPad</h1>
          <Input
            name="email"
            type="email"
            className="mt3"
            placeholder="Email address"
            onChange={this.onEmailChange}
            required
          />
          <Input
            name="password"
            type="password"
            className="mt3"
            placeholder="Password"
            onChange={this.onPasswordChange}
            required
          />
          <Input
            name="passwordConfirmation"
            type="password"
            className="mt3"
            placeholder="Confirm Password"
            onChange={this.onPasswordConfirmationChange}
            required
          />
          <Button className="w-100 mt3" htmlType="submit" type="primary">
            Reset Password
          </Button>
        </form>
      </div>
    )
  }
}

export default PasswordReset
