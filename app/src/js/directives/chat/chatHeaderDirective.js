/*global angular*/
var chatModule = angular.module('chatApp');
chatModule.controller('chatHeaderController', function ($scope, CS, GroupService, $rootScope) {
    $scope.CS = CS;
    $scope.isShow = $rootScope.isShow;
    $scope.settingIsShow = false;
    $rootScope.isHidden = true;
    init();

    function init() {

        if (!GroupService.getGroup()) {
            setTimeout(init, 1000);
            return;
        }
        $scope.group = GroupService.getGroup();        
        $rootScope.group = $scope.group;
    }

    /*$rootScope.showChat = $scope.showChat = function (isFocusTxt) {
        if ($scope.chatIsShow === true) {
            $scope.hideChat();
            return;
        }
        $scope.chatIsShow = true;
        $("#mapContainer").slideUp(300, function () {
            var objDiv = document.getElementById("message-container");
            objDiv.scrollTop = objDiv.scrollHeight;
            if(!isFocusTxt){
                return;
            }
            var txt = document.getElementById('chatTextBox');
            if (!txt) {
                return;
            }

            txt.focus();
        });
        $("#header").hide();
        $("#showChat").hide();
        $("#hideChat").show();
        $("#chatHeader").removeClass("navbar-bottom");
        $('#map').addClass('full-height');
        $rootScope.isHidden = false;

    };*/

    $scope.hideChat = function () {
        $scope.chatIsShow = false;
        $("#mapContainer").slideDown(300, function() {
            google.maps.event.trigger(document.getElementById('map'), 'resize');
        });
        $("#header").show();
        $("#showChat").show();
        $("#hideChat").hide();
        $("#chatHeader").addClass("navbar-bottom");
        $('#map').removeClass('full-height');
        $rootScope.isHidden = true;

    };
    $scope.GetTime = function() {
        var timeString = '';
        if ($scope.group != null && $scope.group.estimatedTimeArrival != null) {

        timeString = ( $scope.group.estimatedTimeArrival/60 % 60).toFixed(0) + ' min';
        if ($scope.group.estimatedTimeArrival/60 > 59) {
            timeString = (($scope.group.estimatedTimeArrival - ( $scope.group.estimatedTimeArrival/60 % 60)) / 60).toFixed(0) + ' hr ' + timeString;
        }
    }
        return timeString;
    };
    $rootScope = $scope.GetTime;

    $scope.showHideSetting = function () {
        if($scope.settingIsShow === true){
            $scope.settingIsShow = false;
            return;
        }

        $scope.settingIsShow = true;
    }
});

chatModule.directive('innerChatHeader', function (CS, GroupService, $rootScope) {
    'use strict';
    return {
        restrict: 'AE',
        templateUrl: 'html/directives/chat/innerChatHeader.html',
        scope: {},
        controller: 'chatHeaderController'
    };
});

chatModule.directive('outerChatHeader', function (CS, GroupService, $rootScope) {
    'use strict';
    return {
        restrict: 'AE',
        templateUrl: 'html/directives/chat/outerChatHeader.html',
        scope: {},
        controller: 'chatHeaderController'
    };
});
