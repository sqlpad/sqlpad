import Button from 'antd/lib/button'
import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import message from 'antd/lib/message'
import React from 'react'
import { Link, Redirect } from 'react-router-dom'
import AppContext from './containers/AppContext'
import fetchJson from './utilities/fetch-json.js'

class SignIn extends React.Component {
  static contextType = AppContext

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

  signIn = async e => {
    const appContext = this.context
    e.preventDefault()

    const json = await fetchJson('POST', '/api/signin', this.state)
    if (json.error) {
      return message.error('Username or password incorrect')
    }
    await appContext.refreshAppContext()
    this.setState({ redirect: true })
  }

  render() {
    const appContext = this.context
    const { redirect } = this.state
    if (redirect) {
      return <Redirect push to="/" />
    }

    const { config, smtpConfigured, passport } = appContext
    if (!config) {
      return
    }

    const localForm = (
      <div>
        <form onSubmit={this.signIn}>
          <Input
            name="email"
            type="email"
            className="mt2"
            placeholder="Email address"
            onChange={this.onEmailChange}
            required
          />
          <Input
            name="password"
            type="password"
            className="mt2"
            placeholder="Password"
            onChange={this.onPasswordChange}
            required
          />
          <Button
            onClick={this.signIn}
            className="w-100 mt4"
            htmlType="submit"
            type="primary"
          >
            Sign in
          </Button>
        </form>
        <div className="tc mt3">
          <Link to="/signup">Sign Up</Link>
          {smtpConfigured ? (
            <Link className="ml5" to="/forgot-password">
              Forgot Password
            </Link>
          ) : null}
        </div>
      </div>
    )

    const googleForm = (
      <div>
        <a href={config.baseUrl + '/auth/google'}>
          <Button className="w-100 mt3" type="primary">
            <Icon type="google" />
            Sign in with Google
          </Button>
        </a>
      </div>
    )

    return (
      <div className="pt5 measure center" style={{ width: '300px' }}>
        <h1 className="f2 tc">SQLPad</h1>
        {'local' in passport.strategies && localForm}
        {'google' in passport.strategies && googleForm}
      </div>
    )
  }
}

export default SignIn
