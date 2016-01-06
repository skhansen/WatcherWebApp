// Styles
require('app/app.module.styl');

// Templates
require('app/home.jade');

// Application
angular
	.module('app', [
		'ngTouch',
		'ngAnimate',
		'ngSanitize',
		'ngResource',
		'ui.router',
	])
	.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
		$urlRouterProvider.otherwise('/');
		$locationProvider.html5Mode({
			requireBase: false,
			enabled: true
		});
		$stateProvider.state('home', {
			url: '/',
			views: {
				'body@': {
					templateUrl: 'tpl/src/app/home.jade'
				}
			}
		});
	})
	.run(function () {
		console.log('[env]:', ENV);
	})
	.controller('app.ctrl', function () {
		console.log('[app]', 'ready');
	});

