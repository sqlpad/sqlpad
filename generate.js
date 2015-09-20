var express 	= require('express');
var fs 			= require('fs-extra');
var moment 		= require('moment'); 			// a date library
var ejs 		= require('ejs');
var watch 		= require('watch');
var templates 	= require('./lib/templates'); 	// gets templates easily. Might not be necessary
var _ 			= require('lodash');			// for debounce
var mm 			= require('marky-mark'); 		// easy handling of all those markdown files


//var POSTS_DIRECTORY 	= __dirname + '/_posts';
var PAGES_DIRECTORY = __dirname + '/_pages';
var LAYOUTS_DIRECTORY 	= __dirname + '/layouts';
templates.directory = LAYOUTS_DIRECTORY;

var isGenerating = false;
var nextRender = null;
function generate() {
    if (isGenerating) {
        console.log('already generating - render queued');
        nextRender = true;
    } else {
        console.log('generating...');
        isGenerating = true;
        render();
        console.log('generating done');
        isGenerating = false;
        if (nextRender) {
            console.log('queued render settings found...');
            nextRender = false;
            generate();
        }
    }
}

function render () {
    // Some helpful properties for each post/page:
    // post.content: the html of the markdown
    // post.filename: name of the file sans extension
    // post.meta.key: yaml content of that key
    // post.meta_key: yaml content of that key
    
    // Pages
    var pages = mm.parseDirectorySync(PAGES_DIRECTORY);
    pages.forEach(function(page) {
        page.moment = moment;
        var rendered = ejs.render(templates.templateContent('page'), {
            page: page,
            moment: moment,
            filename: LAYOUTS_DIRECTORY + '/page.ejs'
        });
        fs.outputFileSync(__dirname + '/' + page.filename + '/index.html', rendered);
    });
    
    // home
    var renderedHome = ejs.render(templates.templateContent('home'), {
        filename: LAYOUTS_DIRECTORY + '/home.ejs'
    });
    fs.outputFileSync(__dirname + '/index.html', renderedHome);
}
 
/* =========================================================================
    Very simple Express Setup for previewing site
============================================================================ */
var app = express();
app.use(express.static(__dirname));
app.listen(3000);
console.log('Web server now running. View at http://localhost:3000');
console.log('Press ctrl-c at any time to stop\n');


//watch.watchTree(POSTS_DIRECTORY, {ignoreDotFiles: true}, _.debounce(generate, 100, false));
watch.watchTree(LAYOUTS_DIRECTORY, {ignoreDotFiles: true}, _.debounce(generate, 100, false));
watch.watchTree(PAGES_DIRECTORY, {ignoreDotFiles: true}, _.debounce(generate, 100, false));

generate();
