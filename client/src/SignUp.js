import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import message from 'antd/lib/message'
import React from 'react'
import { Redirect } from 'react-router-dom'
import fetchJson from './utilities/fetch-json.js'

class SignUp extends React.Component {
  state = {
    email: '',
    password: '',
    passwordConfirmation: '',
    redirect: false
  }

  componentDidMount() {
    document.title = 'SQLPad - Sign Up'
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

  signUp = e => {
    e.preventDefault()
    fetchJson('POST', '/api/signup', this.state).then(json => {
      if (json.error) return message.error(json.error)
      this.setState({ redirect: true })
    })
  }

  render() {
    const { redirect } = this.state
    const { adminRegistrationOpen } = this.props

    if (redirect) {
      return <Redirect to="/" />
    }

    return (
      <div className="pt5 measure center" style={{ width: '300px' }}>
        <form onSubmit={this.signUp}>
          <h1 className="f2 tc">SQLPad</h1>
          {adminRegistrationOpen && (
            <div className="mb4">
              <h2 className="f3 tc">Admin registration open</h2>
              <p>
                Welcome to SQLPad! Since there are no admins currently
                registered, signup is open to anyone. By signing up, you will be
                granted admin rights, and signup will be restricted to
                whitelisted email addresses/domains
              </p>
            </div>
          )}
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
            Sign up
          </Button>
        </form>
      </div>
    )
  }
}

export default SignUp
