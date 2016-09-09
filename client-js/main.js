//  This is the client side js entry file to be browserified
var page = require('page')
var React = require('react')
var ReactDOM = require('react-dom')
var fetchJson = require('./fetch-json.js')
const BASE_URL = window.configItems.baseUrl

// account for baseUrl in client-side routing
page.base(BASE_URL)

/*  client-side middleware
============================================================================== */
function getConfig (ctx, next) {
  fetchJson('GET', BASE_URL + '/api/config')
    .then((json) => {
      ctx.config = json.config
    })
    .catch((ex) => {
      console.error(ex.toString())
    })
    .then(() => {
      next()
    })
}

function getCurrentUser (ctx, next) {
  fetchJson('GET', BASE_URL + '/api/users/current')
    .then((json) => {
      ctx.currentUser = json.user
    })
    .catch((ex) => {
      console.error(ex.toString())
    })
    .then(() => {
      next()
    })
}

function getTags (ctx, next) {
  fetchJson('GET', BASE_URL + '/api/tags')
    .then((json) => {
      ctx.tags = json.tags
    })
    .catch((ex) => {
      console.error(ex.toString())
    })
    .then(() => {
      next()
    })
}

/*  client-side routes
============================================================================== */
var App = require('./App.js')

var UserAdmin = require('./UserAdmin.js')
page('/users', getConfig, getCurrentUser, function (ctx) {
  ReactDOM.render(
    <App config={ctx.config} currentUser={ctx.currentUser}>
      <UserAdmin config={ctx.config} currentUser={ctx.currentUser} />
    </App>,
    document.getElementById('react-applet')
  )
})

var ConnectionAdmin = require('./ConnectionAdmin.js')
page('/connections', getConfig, getCurrentUser, function (ctx) {
  ReactDOM.render(
    <App config={ctx.config} currentUser={ctx.currentUser}>
      <ConnectionAdmin config={ctx.config} />
    </App>,
    document.getElementById('react-applet')
  )
})

var ConfigValues = require('./ConfigValues.js')
page('/config-values', getConfig, getCurrentUser, function (ctx) {
  ReactDOM.render(
    <App config={ctx.config} currentUser={ctx.currentUser}>
      <ConfigValues config={ctx.config} />
    </App>,
    document.getElementById('react-applet')
  )
})

var FilterableQueryList = require('./FilterableQueryList.js')
page('/queries', getConfig, getCurrentUser, function (ctx) {
  ReactDOM.render(
    <App config={ctx.config} currentUser={ctx.currentUser}>
      <FilterableQueryList
        config={ctx.config}
        currentUser={ctx.currentUser}
        users={ctx.users} />
    </App>,
    document.getElementById('react-applet')
  )
})

var QueryEditor = require('./QueryEditor.js')
page('/queries/:queryId', getConfig, getCurrentUser, getTags, function (ctx) {
  ReactDOM.render(
    <App config={ctx.config} currentUser={ctx.currentUser}>
      <QueryEditor
        queryId={ctx.params.queryId}
        availableTags={ctx.tags}
        config={ctx.config} />
    </App>,
    document.getElementById('react-applet')
  )
})

var QueryTableOnly = require('./QueryTableOnly.js')
page('/query-table/:queryId', getConfig, function (ctx) {
  ReactDOM.render(
    <QueryTableOnly
      config={ctx.config}
      queryId={ctx.params.queryId} />,
    document.getElementById('react-applet')
  )
})

var QueryChartOnly = require('./QueryChartOnly.js')
page('/query-chart/:queryId', getConfig, function (ctx) {
  ReactDOM.render(
    <QueryChartOnly
      config={ctx.config}
      queryId={ctx.params.queryId} />,
    document.getElementById('react-applet')
  )
})

/*  init router
============================================================================== */
page({click: false})
