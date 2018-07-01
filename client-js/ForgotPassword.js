import React from 'react'
import { Redirect } from 'react-router-dom'
import fetchJson from './utilities/fetch-json.js'
import message from 'antd/lib/message'

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
      if (json.error) return message.error(json.error)
      this.setState({ redirect: true })
    })
  }

  render() {
    const { redirect } = this.state
    if (redirect) {
      return <Redirect to="/password-reset" />
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
          <button className="btn btn-primary btn-block mt3" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    )
  }
}

export default ForgotPassword
