import React from 'react'
import { Redirect } from 'react-router-dom'
import fetchJson from './utilities/fetch-json.js'
import Alert from 'react-s-alert'

class PasswordReset extends React.Component {
  state = {
    email: '',
    password: '',
    passwordConfirmation: '',
    notFound: false,
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
        return Alert.error(json.error)
      }
      this.setState({ redirect: true })
    })
  }

  componentDidMount() {
    document.title = 'SQLPad - Password Reset'
  }

  render() {
    const { notFound, redirect } = this.state
    if (redirect) {
      return <Redirect to="/" />
    }
    if (notFound) {
      return (
        <div className="pt5 measure center" style={{ width: '300px' }}>
          <form onSubmit={this.resetPassword}>
            <h1 className="f2">Password reset not found</h1>
          </form>
        </div>
      )
    }
    return (
      <div className="pt5 measure center" style={{ width: '300px' }}>
        <form onSubmit={this.resetPassword}>
          <h1 className="f2 tc">SQLPad</h1>
          <input
            name="email"
            type="email"
            className="form-control mt3"
            placeholder="Email address"
            onChange={this.onEmailChange}
            required
          />
          <input
            name="password"
            type="password"
            className="form-control mt3"
            placeholder="Password"
            onChange={this.onPasswordChange}
            required
          />
          <input
            name="passwordConfirmation"
            type="password"
            className="form-control mt3"
            placeholder="Confirm Password"
            onChange={this.onPasswordConfirmationChange}
            required
          />
          <button className="btn btn-primary btn-block mt3" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    )
  }
}

export default PasswordReset
