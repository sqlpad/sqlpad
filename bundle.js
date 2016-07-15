var fs = require("fs");
var browserify = require('browserify');
var watchify = require('watchify');
var rc = require('rc');

var config = rc('sqlpad-dev');
var exposeConfig = { 
    expose: { 
        jquery: '$', 
        ace: 'ace',
        Slick: 'Slick',
        d3: 'd3',
        Bloodhound: 'Bloodhound',
        tauCharts: 'tauCharts',
        _: '_',
        ZeroClipboard: 'ZeroClipboard'
    } 
};

var b;

if (config.dev) {
    b = browserify({ 
        entries: ['./client-js/main.js'],
        cache: {}, 
        packageCache: {}, 
        debug: true, 
        fullPaths: true
    });
    b.plugin(watchify);
    b.transform("babelify", {presets: ["es2015", "react"]});
    b.transform("exposify", exposeConfig);

    b.on('log', function (msg) {
        console.log(msg);
    });

    b.on('update', bundle);
    bundle();
} else {
    process.env.NODE_ENV = "production";
    b = browserify({
        entries: ['./client-js/main.js'],
        fullPaths: true
    });
    b.transform("babelify", {presets: ["es2015", "react"]});
    b.transform("exposify", exposeConfig);
    bundle();
}

function bundle() {
  b.bundle().pipe(fs.createWriteStream("./public/javascripts/browserified.js"));
}