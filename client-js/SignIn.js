import React from 'react'
import { Redirect } from 'react-router-dom'
import Alert from 'react-s-alert'
import { Link } from 'react-router-dom'
import fetchJson from './utilities/fetch-json.js'

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
    fetchJson('POST', this.props.config.baseUrl + '/api/signin', this.state)
      .then(json => {
        if (json.error) return Alert.error('Username or password incorrect')
        this.setState({ redirect: true })
      })
      .catch(ex => {
        Alert.error('Username or Password incorrect')
        console.error(ex)
      })
  }

  render() {
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
            {this.props.smtpConfigured ? (
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
        <a href={this.props.config.baseUrl + '/auth/google'}>
          <button className="btn btn-lg btn-danger btn-block">
            <i className="fa fa-google-plus" /> Log in with Google
          </button>
        </a>
      </div>
    )
    return (
      <div className="signin">
        <h2>SQLPad</h2>
        {'local' in this.props.passport.strategies ? localForm : null}
        {'google' in this.props.passport.strategies ? googleForm : null}
        <Alert stack={{ limit: 3 }} position="bottom-right" />
      </div>
    )
  }
}

export default SignIn
