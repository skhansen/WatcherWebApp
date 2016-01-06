/*global angular*/
var chatModule = angular.module('chatApp');
chatModule.directive('chat', function () {
    'use strict';
    return {
        restrict: 'AE',
        templateUrl: 'html/directives/chat/messageContainer.html',
        controller: 'chatController',
        scope: {},
        link: function (scope, $rootScope) {

        }
    };
});
chatModule.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});