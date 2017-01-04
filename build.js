var fs = require('fs')
var browserify = require('browserify')
var watchify = require('watchify')
var minimist = require('minimist')
var config = minimist(process.argv.slice(2))

var exposeConfig = {
  expose: {
    tauCharts: 'tauCharts',
    _: '_'
  }
}

var b

if (config.dev) {
  b = browserify({
    entries: ['./client-js/index.js'],
    cache: {},
    packageCache: {},
    debug: true,
    fullPaths: true
  })
  b.plugin(watchify)
  b.transform('babelify', {presets: ['es2015', 'react']})
  b.transform('exposify', exposeConfig)
  b.on('log', function (msg) {
    console.log(msg)
  })
  b.on('update', bundle)
  bundle()
} else {
  process.env.NODE_ENV = 'production'
  b = browserify({
    entries: ['./client-js/index.js']
  })
  b.transform('babelify', {presets: ['es2015', 'react']})
  b.transform('exposify', exposeConfig)
  b.transform('uglifyify', {global: true})
  bundle()
}

function bundle () {
  b.bundle().pipe(fs.createWriteStream('./public/javascripts/browserified.js'))
}
