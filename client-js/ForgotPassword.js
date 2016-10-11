var React = require('react')
var fetchJson = require('./fetch-json.js')
var Alert = require('react-s-alert').default
var page = require('page')

var ForgotPassword = React.createClass({
  getInitialState: function () {
    return {
      email: ''
    }
  },
  onEmailChange: function (e) {
    this.setState({email: e.target.value})
  },
  resetPassword: function (e) {
    e.preventDefault()
    fetchJson('POST', this.props.config.baseUrl + '/api/forgot-password', this.state)
      .then((json) => {
        if (json.error) return Alert.error(json.error)
        page('/password-reset')
      })
      .catch((ex) => {
        Alert.error('Problem resetting password')
        console.error(ex)
      })
  },
  render: function () {
    return (
      <div className='signin' >
        <form className='form-signin' role='form' onSubmit={this.resetPassword}>
          <h2>SqlPad</h2>
          <input
            name='email'
            type='email'
            className='form-control top-field'
            placeholder='Email address'
            onChange={this.onEmailChange}
            required />
          <br />
          <button className='btn btn-lg btn-primary btn-block' type='submit'>Reset Password</button>
        </form>
        <Alert stack={{limit: 3}} position='bottom-right' />
      </div>
    )
  }
})

module.exports = ForgotPassword
