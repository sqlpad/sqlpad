var path = require('path')
var express = require('express')
var fs = require('fs-extra')
var moment = require('moment')
var ejs = require('ejs')
var watch = require('watch')
var _ = require('lodash')
var mm = require('marky-mark')

const PAGES_DIRECTORY = path.join(__dirname, '/_pages')
const LAYOUTS_DIRECTORY = path.join(__dirname, '/layouts')

var isGenerating = false
var nextRender = null
function generate () {
  if (isGenerating) {
    console.log('already generating - render queued')
    nextRender = true
  } else {
    console.log('generating...')
    render()
    console.log('generating done')
    if (nextRender) {
      console.log('queued render settings found...')
      nextRender = false
      generate()
    }
  }
}

function render () {
  isGenerating = true
  const pageLayout = fs.readFileSync('./layouts/page.ejs', 'utf8')
  const homeLayout = fs.readFileSync('./layouts/home.ejs', 'utf8')

  // Pages
  // Some helpful properties for each post/page:
  // post.content: the html of the markdown
  // post.filename: name of the file sans extension
  // post.meta.key: yaml content of that key
  // post.meta_key: yaml content of that key
  var pages = mm.parseDirectorySync(PAGES_DIRECTORY)
  pages.forEach(function (page) {
    page.moment = moment
    var rendered = ejs.render(pageLayout, {
      page: page,
      moment: moment,
      filename: './layouts/page.ejs'
    })
    fs.outputFileSync(
      path.join(__dirname, page.filename, '/index.html'),
      rendered
    )
  })

  // home
  var renderedHome = ejs.render(homeLayout, {
    filename: './layouts/home.ejs'
  })
  fs.outputFileSync(path.join(__dirname, '/index.html'), renderedHome)

  isGenerating = false
}

/* =========================================================================
  Very simple Express Setup for previewing site
============================================================================ */
var app = express()
app.use('/sqlpad', express.static(__dirname))
app.get('/', function (req, res) {
  res.redirect('/sqlpad/')
})
app.listen(4000)
console.log('Web server now running. View at http://localhost:4000')
console.log('Press ctrl-c at any time to stop\n')

watch.watchTree(
  LAYOUTS_DIRECTORY,
  { ignoreDotFiles: true },
  _.debounce(generate, 100, false)
)
watch.watchTree(
  PAGES_DIRECTORY,
  { ignoreDotFiles: true },
  _.debounce(generate, 100, false)
)

generate()
