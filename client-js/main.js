//  This is the client side js entry file to be browserified
var page = require('page');
var React = require('react');
var ReactDOM = require('react-dom');
var fetchJson = require('./fetch-json.js');

// old jquery stuff
// The update notification is in the nav, which hasn't been moved to react yet.
// Eventually SqlPad can convert to a full single-page-app but until then...
$('[data-toggle="popover"]').popover()

// account for baseUrl in client-side routing
page.base(baseUrl);



/*  client-side middleware
==============================================================================*/
function getUsers (ctx, next) {
    fetchJson('GET', baseUrl + "/api/users")
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            ctx.users = json.users;
        })
        .catch(function (ex) {
            console.error(ex.toString());
        })
        .then(() => {
            next();   
        })
}

function getConfig (ctx, next) {
    fetchJson('GET', baseUrl + "/api/config")
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            ctx.config = json.config;
        })
        .catch(function (ex) {
            console.error(ex.toString());
        })
        .then(() => {
            next();
        })
}

function getCurrentUser (ctx, next) {
    fetchJson('GET', baseUrl + "/api/users/current")
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            ctx.currentUser = json.user;
        })
        .catch(function (ex) {
            console.error(ex.toString());
        })
        .then(() => {
            next();   
        })
}

function getTags (ctx, next) {
    fetchJson('GET', baseUrl + "/api/tags")
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            ctx.tags = json.tags;
        })
        .catch(function (ex) {
            console.error(ex.toString());
        })
        .then(() => {
            next();
        })
}



/*  client-side routes
==============================================================================*/

var UserAdmin = require('./UserAdmin.js');
page('/users', getConfig, getCurrentUser, function (ctx) {
    ReactDOM.render(
        <UserAdmin 
            config={ctx.config}
            currentUser={ctx.currentUser}
            />,
        document.getElementById('react-applet')
    );
})

var ConnectionAdmin = require('./ConnectionAdmin.js');
page('/connections', getConfig, function (ctx) {
    ReactDOM.render(
        <ConnectionAdmin 
            config={ctx.config}/
            >,
        document.getElementById('react-applet')
    );
})

var ConfigValues = require('./ConfigValues.js');
page('/config-values', getConfig, function (ctx) {
    ReactDOM.render(
        <ConfigValues config={ctx.config} />,
        document.getElementById('react-applet')
    );
});

var FilterableQueryList = require('./FilterableQueryList.js');
page('/queries', getConfig, getCurrentUser, function (ctx) {
    ReactDOM.render(
        <FilterableQueryList
            config={ctx.config}
            currentUser={ctx.currentUser}
            users={ctx.users}
            />,
        document.getElementById('react-applet')
    )
})

var QueryEditor = require('./QueryEditor.js');
page('/queries/:queryId', getConfig, getTags, function (ctx) {
    ReactDOM.render(
        <QueryEditor 
            queryId={ctx.params.queryId}
            availableTags={ctx.tags} 
            config={ctx.config}/>,
        document.getElementById('react-applet')
    )
})

var QueryTableOnly = require('./QueryTableOnly.js');
page('/query-table/:queryId', getConfig, function (ctx) {
    ReactDOM.render(
        <QueryTableOnly queryId={ctx.params.queryId} />,
        document.getElementById('react-applet')
    )
});

var QueryChartOnly = require('./QueryChartOnly.js');
page('/query-chart/:queryId', getConfig, function (ctx) {
    ReactDOM.render(
        <QueryChartOnly queryId={ctx.params.queryId} />,
        document.getElementById('react-applet')
    )
});



/*  init router
==============================================================================*/
page({click: false});
