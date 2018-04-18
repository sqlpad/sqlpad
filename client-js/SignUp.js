import React from 'react'
import { Redirect } from 'react-router-dom'
import fetchJson from './utilities/fetch-json.js'
import Alert from 'react-s-alert'

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
      if (json.error) return Alert.error(json.error)
      this.setState({ redirect: true })
    })
  }

  render() {
    const { redirect } = this.state
    if (redirect) {
      return <Redirect to="/" />
    }
    const adminRegistrationOpenIntro = () => {
      if (this.props.adminRegistrationOpen) {
        return (
          <div className="mb4">
            <h2 className="f3 tc">Admin Registration is Open</h2>
            <p>
              Welcome to SQLPad! Since there are no admins currently in the
              system, registration is open to anyone. By signing up, you will be
              granted admin rights, and the system will be locked down. Only
              people explicitly invited & whitelisted will be able to join.
            </p>
          </div>
        )
      }
    }
    return (
      <div className="pt5 measure center" style={{ width: '300px' }}>
        <form onSubmit={this.signUp}>
          <h1 className="f2 tc">SQLPad</h1>
          {adminRegistrationOpenIntro()}
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
            Sign up
          </button>
        </form>
      </div>
    )
  }
}

export default SignUp
