//  This is the client side js entry file to be browserified
var page = require('page')
var React = require('react')
var ReactDOM = require('react-dom')
var fetchJson = require('./fetch-json.js')

fetchJson('GET', 'api/app')
  .then((json) => {
    init(json)
  })
  .catch((ex) => {
    console.error(ex.toString())
  })

function init (appData) {
  var config = appData.config
  const BASE_URL = config.baseUrl

  // account for baseUrl in client-side routing
  page.base(BASE_URL)

  /*  client-side routes
  ============================================================================== */
  var App = require('./App.js')
  var UserAdmin = require('./UserAdmin.js')
  var ConnectionAdmin = require('./ConnectionAdmin.js')
  var ConfigValues = require('./ConfigValues.js')
  var FilterableQueryList = require('./FilterableQueryList.js')
  var QueryEditor = require('./QueryEditor.js')
  var SignIn = require('./SignIn.js')
  var SignUp = require('./SignUp.js')
  var PasswordReset = require('./PasswordReset.js')
  var QueryTableOnly = require('./QueryTableOnly.js')
  var QueryChartOnly = require('./QueryChartOnly.js')
  var BigCenteredText = require('./BigCenteredText.js')

  function getAppData (ctx, next) {
    fetchJson('GET', 'api/app')
      .then((json) => {
        ctx.config = json.config
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
    document.title = 'SqlPad - Users'
    ReactDOM.render(
      <App config={ctx.config} currentUser={ctx.currentUser}>
        <UserAdmin config={ctx.config} currentUser={ctx.currentUser} />
      </App>,
      document.getElementById('root')
    )
  })

  page('/connections', mustBeAuthenticated, mustBeAdmin, function (ctx) {
    document.title = 'SqlPad - Connections'
    ReactDOM.render(
      <App config={ctx.config} currentUser={ctx.currentUser}>
        <ConnectionAdmin config={ctx.config} />
      </App>,
      document.getElementById('root')
    )
  })

  page('/config-values', mustBeAuthenticated, mustBeAdmin, function (ctx) {
    document.title = 'SqlPad - Configuration'
    ReactDOM.render(
      <App config={ctx.config} currentUser={ctx.currentUser}>
        <ConfigValues config={ctx.config} />
      </App>,
      document.getElementById('root')
    )
  })

  page('/queries', mustBeAuthenticated, function (ctx) {
    document.title = 'SqlPad - Queries'
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
    document.title = 'SqlPad - Sign In'
    ReactDOM.render(
      <SignIn
        config={ctx.config}
        passport={ctx.passport} />,
      document.getElementById('root')
    )
  })

  page('/signup', function (ctx) {
    document.title = 'SqlPad - Sign Up'
    ReactDOM.render(
      <SignUp
        config={ctx.config}
        adminRegistrationOpen={ctx.adminRegistrationOpen} />,
      document.getElementById('root')
    )
  })

  page('/password-reset/:passwordResetId', function (ctx) {
    document.title = 'SqlPad - Reset Password'
    ReactDOM.render(
      <PasswordReset
        passwordResetId={ctx.params.passwordResetId}
        config={ctx.config}
        adminRegistrationOpen={ctx.adminRegistrationOpen} />,
      document.getElementById('root')
    )
  })

  page('/query-table/:queryId', function (ctx) {
    document.title = 'SqlPad'
    ReactDOM.render(
      <QueryTableOnly
        config={ctx.config}
        queryId={ctx.params.queryId} />,
      document.getElementById('root')
    )
  })

  page('/query-chart/:queryId', function (ctx) {
    document.title = 'SqlPad'
    ReactDOM.render(
      <QueryChartOnly
        config={ctx.config}
        queryId={ctx.params.queryId} />,
      document.getElementById('root')
    )
  })

  page('*', function (ctx) {
    document.title = 'SqlPad - Not Found'
    var Component
    if (ctx.currentUser) {
      Component = (
        <App config={ctx.config} currentUser={ctx.currentUser}>
          <BigCenteredText>
            Not Found
          </BigCenteredText>
        </App>
      )
    } else {
      Component = (
        <BigCenteredText>
          Not Found
        </BigCenteredText>
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
