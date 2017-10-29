import React from 'react'
import { Redirect } from 'react-router-dom'
import fetchJson from './utilities/fetch-json.js'
import Alert from 'react-s-alert'

class ForgotPassword extends React.Component {
  state = {
    email: '',
    redirect: false
  }

  componentDidMount() {
    document.title = 'SQLPad - Forgot Password'
  }

  onEmailChange = e => {
    this.setState({ email: e.target.value })
  }

  resetPassword = e => {
    e.preventDefault()
    fetchJson('POST', '/api/forgot-password', this.state).then(json => {
      if (json.error) return Alert.error(json.error)
      this.setState({ redirect: true })
    })
  }

  render() {
    const { redirect } = this.state
    if (redirect) {
      return <Redirect to="/password-reset" />
    }
    return (
      <div className="signin">
        <form className="form-signin" onSubmit={this.resetPassword}>
          <h2>SQLPad</h2>
          <input
            name="email"
            type="email"
            className="form-control top-field"
            placeholder="Email address"
            onChange={this.onEmailChange}
            required
          />
          <br />
          <button className="btn btn-lg btn-primary btn-block" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    )
  }
}

export default ForgotPassword
