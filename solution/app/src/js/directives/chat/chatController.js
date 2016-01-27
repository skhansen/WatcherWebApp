/*global angular*/
var chatModule = angular.module('chatApp');
chatModule.controller('chatController', ['$scope', 'CS', function ($scope, CS) {
    'use strict';
    $scope.messagies = ['Hello!', 'Hi!', 'How are you?'];
    $scope.message = '';
    $scope.isShow = true;

    $scope.sendMessage = function () {
        if ($scope.message === '') {
            return;
        }
        $scope.messagies.push($scope.message);
        $scope.message = '';
    };

    $scope.showChat = function () {
        //$("#map").hide('slow');
        //$("#header").hide('slow');
        //$("#showChat").hide('slow');
        //$("#hideChat").show('slow');
        //$("#chatHeader").removeClass("navbar-bottom");
    };

    $scope.hideChat = function () {
        //$("#map").show('slow');
        //$("#header").show('slow');
        //$("#showChat").show('slow');
        //$("#hideChat").hide('slow');
        //$("#chatHeader").addClass("navbar-bottom");
    };

    function init() {
        debugger;
        var appConfig = {
            appId: /*"layer:///apps/staging/*/"6eb07496-2646-11e5-b157-2d5d090202b9",//"<App ID Goes Here>",
            bearerToken: "UfjFghBINw4DSgUpfvPBGqRD8rAPToCBqeTgNaz9YQUM4kIp",//"<Authorization Token Goes Here>",
            serverUrl: "https://api.layer.com",
            headers: {
                Accept: "application/vnd.layer+json; version=1.0",
                Authorization: "",
                "Content-type": "application/json"
            }
        };

        var inst = new CS.Inst(appConfig);

    }

    init();

}]);