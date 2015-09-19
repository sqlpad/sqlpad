var express 	= require('express');
var fs 			= require('fs-extra');
var moment 		= require('moment'); 			// a date library
var ejs 		= require('ejs');
var watch 		= require('watch');
var templates 	= require('./lib/templates'); 	// gets templates easily. Might not be necessary
var _ 			= require('lodash');			// for debounce
var mm 			= require('marky-mark'); 		// easy handling of all those markdown files


var USER_POSTS_DIRECTORY 	= __dirname + '/_posts';
var PAGES_DIRECTORY = __dirname + '/_pages';
var USER_LAYOUTS_DIRECTORY 	= __dirname + '/layouts';
templates.directory = USER_LAYOUTS_DIRECTORY;

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
    
    // Posts
    var posts = mm.parseDirectorySync(USER_POSTS_DIRECTORY);
    var postsByFilename = _.indexBy(posts, "filename");
    // flatten posts
    for (var i= 0; i < posts.length; i++) {
        var post = posts[i];
        for (var key in post.meta) {
            post["meta_" + key] = post.meta[key];
        }
    }
    // Some helpful properties for each post:
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
            filename: USER_LAYOUTS_DIRECTORY + '/page.ejs'
        });
        fs.outputFileSync(__dirname + '/' + page.filename + '/index.html', rendered);
    });
    
    var renderedHome = ejs.render(templates.templateContent('home'), {
        posts: posts,
        postsByFilename: postsByFilename,
        moment: moment,
        filename: USER_LAYOUTS_DIRECTORY + '/home.ejs'
    });
    fs.outputFileSync(__dirname + '/index.html', renderedHome);
    
    // for each post render a view? 
    // Like if we were doing a blog
    posts.forEach(function(post) {
        var html = ejs.render(templates.templateContent('post'), {
            post: post,
            moment: moment,
            //categories: db().distinct("category"),
            title: post.meta.title + " | Rick Bergfalk",
            filename: USER_LAYOUTS_DIRECTORY + '/post.ejs'
        });
        fs.outputFileSync(__dirname + '/posts/' + post.filename + '.html', html);
    });
}
 
/* =========================================================================
    Very simple Express Setup for previewing site
============================================================================ */
var app = express();
app.use(express.static(__dirname));
app.listen(3000);
console.log('Web server now running. View at http://localhost:3000');
console.log('Press ctrl-c at any time to stop\n');


watch.watchTree(USER_POSTS_DIRECTORY, {ignoreDotFiles: true}, _.debounce(generate, 100, false));
watch.watchTree(USER_LAYOUTS_DIRECTORY, {ignoreDotFiles: true}, _.debounce(generate, 100, false));

generate();
