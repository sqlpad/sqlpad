import React from 'react'
import ReactDOM from 'react-dom'
import fetchJson from './utilities/fetch-json.js'
import page from 'page'
import App from './App.js'
import UserAdmin from './UserAdmin.js'
import ConnectionsView from './connections/ConnectionsView.js'
import ConfigValues from './ConfigValues.js'
import FilterableQueryList from './FilterableQueryList.js'
import QueryEditor from './QueryEditor.js'
import SignIn from './SignIn.js'
import SignUp from './SignUp.js'
import ForgotPassword from './ForgotPassword.js'
import PasswordReset from './PasswordReset.js'
import QueryTableOnly from './QueryTableOnly.js'
import QueryChartOnly from './QueryChartOnly.js'
import FullscreenMessage from './FullscreenMessage.js'

fetchJson('GET', 'api/app')
  .then((json) => {
    init(json)
  })
  .catch((ex) => {
    console.error(ex.toString())
  })

function init (appData) {
  const config = appData.config
  const BASE_URL = config.baseUrl

  // account for baseUrl in client-side routing
  page.base(BASE_URL)

  /*  client-side routes
  ============================================================================== */
  function getAppData (ctx, next) {
    fetchJson('GET', 'api/app')
      .then((json) => {
        ctx.config = json.config
        ctx.smtpConfigured = json.smtpConfigured
        ctx.googleAuthConfigured = json.googleAuthConfigured
        ctx.currentUser = json.currentUser
        ctx.passport = json.passport
        ctx.adminRegistrationOpen = json.adminRegistrationOpen
        ctx.version = json.version
        next()
      })
      .catch((ex) => {
        console.error(ex.toString())
      })
  }

  function mustBeAuthenticated (ctx, next) {
    if (ctx.currentUser) {
      next()
    } else {
      page.redirect('/signin')
    }
  }

  function mustBeAdmin (ctx, next) {
    if (ctx.currentUser && ctx.currentUser.role === 'admin') {
      next()
    } else {
      console.log('must be admin')
    }
  }

  page('*', getAppData)

  page.redirect('/', '/queries')

  page('/users', mustBeAuthenticated, mustBeAdmin, function (ctx) {
    document.title = 'SQLPad - Users'
    ReactDOM.render(
      <App config={ctx.config} currentUser={ctx.currentUser}>
        <UserAdmin config={ctx.config} currentUser={ctx.currentUser} />
      </App>,
      document.getElementById('root')
    )
  })

  page('/connections', mustBeAuthenticated, mustBeAdmin, function (ctx) {
    document.title = 'SQLPad - Connections'
    ReactDOM.render(
      <App config={ctx.config} currentUser={ctx.currentUser}>
        <ConnectionsView config={ctx.config} />
      </App>,
      document.getElementById('root')
    )
  })

  page('/config-values', mustBeAuthenticated, mustBeAdmin, function (ctx) {
    document.title = 'SQLPad - Configuration'
    ReactDOM.render(
      <App config={ctx.config} currentUser={ctx.currentUser}>
        <ConfigValues config={ctx.config} />
      </App>,
      document.getElementById('root')
    )
  })

  page('/queries', mustBeAuthenticated, function (ctx) {
    document.title = 'SQLPad - Queries'
    ReactDOM.render(
      <App config={ctx.config} currentUser={ctx.currentUser}>
        <FilterableQueryList
          config={ctx.config}
          currentUser={ctx.currentUser} />
      </App>,
      document.getElementById('root')
    )
  })

  page('/queries/:queryId', mustBeAuthenticated, function (ctx) {
    ReactDOM.render(
      <App config={ctx.config} currentUser={ctx.currentUser}>
        <QueryEditor
          queryId={ctx.params.queryId}
          config={ctx.config} />
      </App>,
      document.getElementById('root')
    )
  })

  page('/signin', function (ctx) {
    document.title = 'SQLPad - Sign In'
    ReactDOM.render(
      <SignIn
        config={ctx.config}
        smtpConfigured={ctx.smtpConfigured}
        passport={ctx.passport} />,
      document.getElementById('root')
    )
  })

  page('/signup', function (ctx) {
    document.title = 'SQLPad - Sign Up'
    ReactDOM.render(
      <SignUp
        config={ctx.config}
        adminRegistrationOpen={ctx.adminRegistrationOpen} />,
      document.getElementById('root')
    )
  })

  page('/forgot-password', function (ctx) {
    document.title = 'SQLPad - Forgot Password'
    ReactDOM.render(
      <ForgotPassword
        config={ctx.config} />,
      document.getElementById('root')
    )
  })

  page('/password-reset', function (ctx) {
    document.title = 'SQLPad - Password Reset'
    ReactDOM.render(
      <FullscreenMessage>
        <p>
          Password reset requested.
        </p>
        <p>
          An email has been sent with further instruction.
        </p>
      </FullscreenMessage>,
      document.getElementById('root')
    )
  })

  page('/password-reset/:passwordResetId', function (ctx) {
    document.title = 'SQLPad - Reset Password'
    ReactDOM.render(
      <PasswordReset
        passwordResetId={ctx.params.passwordResetId}
        config={ctx.config}
        adminRegistrationOpen={ctx.adminRegistrationOpen} />,
      document.getElementById('root')
    )
  })

  page('/query-table/:queryId', function (ctx) {
    document.title = 'SQLPad'
    ReactDOM.render(
      <QueryTableOnly
        config={ctx.config}
        queryId={ctx.params.queryId} />,
      document.getElementById('root')
    )
  })

  page('/query-chart/:queryId', function (ctx) {
    document.title = 'SQLPad'
    ReactDOM.render(
      <QueryChartOnly
        config={ctx.config}
        queryId={ctx.params.queryId} />,
      document.getElementById('root')
    )
  })

  page('*', function (ctx) {
    document.title = 'SQLPad - Not Found'
    var Component
    if (ctx.currentUser) {
      Component = (
        <App config={ctx.config} currentUser={ctx.currentUser}>
          <FullscreenMessage>
            Not Found
          </FullscreenMessage>
        </App>
      )
    } else {
      Component = (
        <FullscreenMessage>
          Not Found
        </FullscreenMessage>
      )
    }
    ReactDOM.render(
      Component,
      document.getElementById('root')
    )
  })

  /*  init router
  ============================================================================== */
  page({click: false})
}
