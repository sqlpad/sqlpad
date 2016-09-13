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
  // var version = appData.version
  var currentUser = appData.currentUser
  var passport = appData.passport
  var adminRegistrationOpen = appData.adminRegistrationOpen
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
  var QueryTableOnly = require('./QueryTableOnly.js')
  var QueryChartOnly = require('./QueryChartOnly.js')

  page('/users', function (ctx) {
    ReactDOM.render(
      <App config={config} currentUser={currentUser}>
        <UserAdmin config={config} currentUser={currentUser} />
      </App>,
      document.getElementById('root')
    )
  })

  page('/connections', function (ctx) {
    ReactDOM.render(
      <App config={config} currentUser={currentUser}>
        <ConnectionAdmin config={config} />
      </App>,
      document.getElementById('root')
    )
  })

  page('/config-values', function (ctx) {
    ReactDOM.render(
      <App config={config} currentUser={currentUser}>
        <ConfigValues config={config} />
      </App>,
      document.getElementById('root')
    )
  })


  page('/queries', function (ctx) {
    ReactDOM.render(
      <App config={config} currentUser={currentUser}>
        <FilterableQueryList
          config={config}
          currentUser={currentUser} />
      </App>,
      document.getElementById('root')
    )
  })

  page('/queries/:queryId', function (ctx) {
    ReactDOM.render(
      <App config={config} currentUser={currentUser}>
        <QueryEditor
          queryId={ctx.params.queryId}
          config={config} />
      </App>,
      document.getElementById('root')
    )
  })

  page('/signin', function (ctx) {
    ReactDOM.render(
      <SignIn
        config={config}
        passport={passport} />,
      document.getElementById('root')
    )
  })

  page('/signup', function (ctx) {
    ReactDOM.render(
      <SignUp
        config={config}
        adminRegistrationOpen={adminRegistrationOpen} />,
      document.getElementById('root')
    )
  })

  page('/query-table/:queryId', function (ctx) {
    ReactDOM.render(
      <QueryTableOnly
        config={config}
        queryId={ctx.params.queryId} />,
      document.getElementById('root')
    )
  })


  page('/query-chart/:queryId', function (ctx) {
    ReactDOM.render(
      <QueryChartOnly
        config={config}
        queryId={ctx.params.queryId} />,
      document.getElementById('root')
    )
  })

  /*  init router
  ============================================================================== */
  page({click: false})
}
