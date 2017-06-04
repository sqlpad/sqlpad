import React from 'react'
import fetchJson from './utilities/fetch-json.js'
import Alert from 'react-s-alert'
import page from 'page'

var PasswordReset = React.createClass({
  getInitialState: function () {
    return {
      email: '',
      password: '',
      passwordConfirmation: '',
      notFound: false
    }
  },
  onEmailChange: function (e) {
    this.setState({email: e.target.value})
  },
  onPasswordChange: function (e) {
    this.setState({password: e.target.value})
  },
  onPasswordConfirmationChange: function (e) {
    this.setState({passwordConfirmation: e.target.value})
  },
  resetPassword: function (e) {
    e.preventDefault()
    fetchJson('POST', this.props.config.baseUrl + '/api/password-reset/' + this.props.passwordResetId, this.state)
      .then((json) => {
        if (json.error) return Alert.error(json.error)
        page('/')
      })
      .catch((ex) => {
        Alert.error('Problem resetting password')
        console.error(ex)
      })
  },
  componentDidMount: function () {
    fetchJson('GET', this.props.config.baseUrl + '/api/password-reset/' + this.props.passwordResetId)
      .then((json) => {
        if (json.error) return Alert.error(json.error)
        if (!json.passwordResetId) this.setState({notFound: true})
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  },
  render: function () {
    if (this.state.notFound) {
      return (
        <div className='signin' >
          <form className='form-signin' onSubmit={this.resetPassword}>
            <h2>Password Reset<br />Not Found</h2>
          </form>
          <Alert stack={{limit: 3}} position='bottom-right' />
        </div>
      )
    }
    return (
      <div className='signin' >
        <form className='form-signin' onSubmit={this.resetPassword}>
          <h2>SQLPad</h2>
          <input
            name='email'
            type='email'
            className='form-control top-field'
            placeholder='Email address'
            onChange={this.onEmailChange}
            required />
          <input
            name='password'
            type='password'
            className='form-control middle-field'
            placeholder='Password'
            onChange={this.onPasswordChange}
            required />
          <input
            name='passwordConfirmation'
            type='password'
            className='form-control bottom-field'
            placeholder='Confirm Password'
            onChange={this.onPasswordConfirmationChange}
            required />
          <br />
          <button className='btn btn-lg btn-primary btn-block' type='submit'>Reset Password</button>
        </form>
        <Alert stack={{limit: 3}} position='bottom-right' />
      </div>
    )
  }
})

export default PasswordReset
