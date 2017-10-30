import React from 'react'
import { Redirect } from 'react-router-dom'
import Alert from 'react-s-alert'
import { Link } from 'react-router-dom'
import fetchJson from './utilities/fetch-json.js'
import GooglePlusIcon from 'react-icons/lib/fa/google-plus'

class SignIn extends React.Component {
  state = {
    email: '',
    password: '',
    redirect: false
  }

  componentDidMount() {
    document.title = 'SQLPad - Sign In'
  }

  onEmailChange = e => {
    this.setState({ email: e.target.value })
  }

  onPasswordChange = e => {
    this.setState({ password: e.target.value })
  }

  signIn = e => {
    e.preventDefault()
    fetchJson('POST', '/api/signin', this.state).then(json => {
      if (json.error) return Alert.error('Username or password incorrect')
      this.setState({ redirect: true })
    })
  }

  render() {
    const { passport, smtpConfigured, config } = this.props
    const { redirect } = this.state
    if (redirect) {
      return <Redirect push to="/" />
    }
    const localForm = (
      <div>
        <form className="form-signin" onSubmit={this.signIn}>
          <input
            name="email"
            type="email"
            className="form-control top-field"
            placeholder="Email address"
            onChange={this.onEmailChange}
            required
          />
          <input
            name="password"
            type="password"
            className="form-control bottom-field"
            placeholder="Password"
            onChange={this.onPasswordChange}
            required
          />
          <br />
          <button
            onClick={this.signIn}
            className="btn btn-lg btn-primary btn-block"
            type="submit"
          >
            Sign in
          </button>
        </form>
        <div className="form-signin-footer">
          <p>
            <Link to="/signup">Sign Up</Link>
            {smtpConfigured ? (
              <Link style={{ marginLeft: 50 }} to="/forgot-password">
                Forgot Password
              </Link>
            ) : null}
          </p>
        </div>
      </div>
    )
    const googleForm = (
      <div>
        <a href={config.baseUrl + '/auth/google'}>
          <button className="btn btn-lg btn-danger btn-block">
            <GooglePlusIcon
              style={{
                width: '22px',
                height: '22px',
                marginRight: '12px',
                marginBottom: '2px'
              }}
            />
            Log in with Google
          </button>
        </a>
      </div>
    )
    return (
      <div className="signin">
        <h2>SQLPad</h2>
        {'local' in passport.strategies ? localForm : null}
        {'google' in passport.strategies ? googleForm : null}
      </div>
    )
  }
}

export default SignIn
