/*global angular*/
var app = angular.module('watcher', ['ngRoute', 'watcherControllers', 'chatApp']);
app.config(function ($routeProvider) {
    'use strict';
    $routeProvider.
        when('/', {
            templateUrl: 'html/views/watcherView.html',
            controller: 'watcherController'
        }).
        when('/:shortLink/', {
            templateUrl: 'html/views/watcherView.html',
            controller: 'watcherController'
        }).
        when('/:groupId/:phoneNumber', {
            templateUrl: 'html/views/watcherView.html',
            controller: 'watcherController'
        }).
        when('/TestChat', {
            templateUrl: 'html/views/testChatView.html'
        }).
        when('/FirstCap', {
            templateUrl: 'html/views/firstCapView.html'
        }).
        when('/SecondCap', {
            templateUrl: 'html/views/secondCapView.html'
        }).
        when('/3Cap', {
            templateUrl: 'html/views/3CapView.html'
        })
        .otherwise({redirectTo: 'Index'});
});

app.directive('ngEnter', function () {
    'use strict';
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

var controllers = angular.module('watcherControllers', []);
var chatModule = angular.module('chatApp', []);

