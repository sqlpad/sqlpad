var React = require('react')
var fetchJson = require('./fetch-json.js')
var Alert = require('react-s-alert').default

var SignIn = React.createClass({
  getInitialState: function () {
    return {
      email: '',
      password: ''
    }
  },
  onEmailChange: function (e) {
    this.setState({email: e.target.value})
  },
  onPasswordChange: function (e) {
    this.setState({password: e.target.value})
  },
  signIn: function (e) {
    e.preventDefault()
    fetchJson('POST', this.props.config.baseUrl + '/api/signin', this.state)
      .then((json) => {
        if (json.error) return Alert.error('Username or password incorrect')
        window.location.assign(this.props.config.baseUrl + '/')
      })
      .catch((ex) => {
        Alert.error('Username or Password incorrect')
        console.error(ex)
      })
  },
  render: function () {
    const localForm = (
      <div>
        <form className='form-signin' onSubmit={this.signIn}>
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
            className='form-control bottom-field'
            placeholder='Password'
            onChange={this.onPasswordChange}
            required />
          <br />
          <button onClick={this.signIn} className='btn btn-lg btn-primary btn-block' type='submit'>Sign in</button>
        </form>
        <div className='form-signin-footer'>
          <p>
            <a href={this.props.config.baseUrl + '/signup'}>Need to Sign Up?</a>
          </p>
        </div>
      </div>
    )
    const googleForm = (
      <div>
        <a href={this.props.config.baseUrl + '/auth/google'}>
          <button className='btn btn-lg btn-danger btn-block'>
            <i className='fa fa-google-plus' /> Log in with Google
          </button>
        </a>
      </div>
    )
    return (
      <div className='signin'>
        <h2>SqlPad</h2>
        {('local' in this.props.passport.strategies ? localForm : null)}
        {('google' in this.props.passport.strategies ? googleForm : null)}
        <Alert stack={{limit: 3}} position='bottom-right' />
      </div>
    )
  }
})

module.exports = SignIn
