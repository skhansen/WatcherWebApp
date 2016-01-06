// Dependencies
var g = require('gulp');
var $ = require('gulp-load-plugins')();
var wp = require('webpack');
var cfg = require('./webpack');
var seq = require('run-sequence');
var sync = require('browser-sync');
var path = require('path');
var fs = require('fs');
var server = require('./server/index.js');
server.started = false;

// Webpack watch build
g.task('wp:watch', function (done) {
	console.log('!!!! server !!!!', server);
	wp(cfg).watch(300, function (err, stats) {
		if (err) throw new $.util.PluginError('webpack', err);
		$.util.log('[webpack]', stats.toString({colors: true}));
		var statsString = JSON.stringify( stats.toJson() );
		fs.writeFileSync( path.join(__dirname, 'tmp/webpack_stats.json') , statsString );
		if (!server.started) {
			server.start();
			server.started = true;
		}
	});
	done();
});

// Webpack simple build
g.task('wp:full', function (done) {
	wp(cfg).run(function (err, stats) {
		if (err) throw new $.util.PluginError('webpack', err);
		$.util.log('[webpack]', stats.toString({colors: true}));
		done();
	});
});

// Webpack developement build
g.task('wp:dev', function () {
	var Server = require('webpack-dev-server');
	var compiler = wp(cfg);
	var port = 9001;
	var server = new Server(compiler, {
		hot: false,
		stats: {colors: true},
		historyApiFallback: true
	});
	server.listen(port, function (err) {
		if (err) throw new $.util.PluginError('webpack', err);
	});
});

// Production minification
g.task('min', function (done) {
	var filterJS = $.filter(['**/*.js']);
	var optionsJS = {};
	var filterCSS = $.filter(['**/*.css']);
	var optionsCSS = {};
	return g.src('dist/**/*', {base: 'dist'})
		.pipe(filterJS)
		.pipe($.uglify())
		.pipe(filterJS.restore(optionsJS))
		.pipe(filterCSS)
		.pipe($.minifyCss(optionsCSS))
		.pipe(filterCSS.restore())
		.pipe(g.dest('dist'));
});

// Browsersync server
g.task('sync', function (done) {
	sync({
		port: 9001,
		files: './dist/**/*',
		proxy: 'localhost:9000',
		//server: {baseDir: 'dist/'},
		ghostMode: {
			forms: true,
			clicks: true,
			scroll: true,
			location: true
		},
		browser: [],
		notify: false
	}, done);
});

// Main tasks
g.task('build:dev', function (done) {
	seq('wp:watch', 'sync', done);
});

g.task('build:fast', function (done) {
	seq('wp:full', done);
});

g.task('build:full', function (done) {
	seq('wp:full', 'min', done);
});