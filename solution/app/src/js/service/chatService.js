/*global angular*/
var chatModule = angular.module('chatApp');
chatModule.factory('CS', [function () {
    'use strict';
    function getSession(identityToken, appConfig) {
        var d = new $.Deferred();
        $.ajax({
            url: appConfig.serverUrl + "/sessions",
            method: "POST",
            headers: {
                Accept: "application/vnd.layer+json; version=1.0",
                Authorization: "Bearer " + appConfig.bearerToken,
                "Content-type": "application/json"
            },
            data: JSON.stringify({
                "identity_token": 'sL07iA0nptfP0ilEIG0JYdpHNOpBjm70W25r8HmejpB3pCyL',
                "app_id": appConfig.appId
            })
        })
            .then(function (data, textStatus, xhr) {
                d.resolve(data.session_token);
            });
        return d;
    }

    function getIdentityToken(nonce, appConfig) {
        var d = new $.Deferred();
        $.ajax({
            url: appConfig.serverUrl + "/providers/6eafb650-2646-11e5-aeba-2d5d090202b9/identity_tokens",
            headers: {
                Accept: "application/vnd.layer+json; version=1.0",
                Authorization: "Bearer " + appConfig.bearerToken,
                "Content-type": "application/json"
            },
            method: "POST",
            data: JSON.stringify({
                app_id: appConfig.appId,
                user_id: '12345',
                nonce: nonce
            })
        })
            .then(function (data, textStatus, xhr) {
                d.resolve(data.identity_token);
            });
        return d;
    }

    function getNonce(appConfig) {
        var d = new $.Deferred();
        $.ajax({
            url: appConfig.serverUrl + "/nonces",
            method: "POST",
            headers: appConfig.headers
        })
            .done(function (data, textStatus, xhr) {
                debugger;
                d.resolve(data.nonce);
            });
        return d;
    }

    function getAuthenticate(nonce, appConfig) {
        var d = new $.Deferred();
        $.ajax({
            url: appConfig.serverUrl + "/authenticate",
            method: "POST",
            headers: {
                Accept: "application/vnd.layer+json; version=1.0",
                Authorization: "Bearer " + appConfig.bearerToken,
                "Content-type": "application/json"
            },
            data: JSON.stringify({
                "username": "vladimir.horoshko@gmail.com",
                "password": "watcherapp",
                "layer_nonce": nonce
            })
        })
            .done(function (data, textStatus, xhr) {
                debugger;
                d.resolve(data.nonce);
            });
        return d;
    }

    var inst = function (appConfig) {
        getNonce(appConfig).then(function (nonce) {
            debugger;
            return getAuthenticate(nonce, appConfig);
        });
        /*getNonce(appConfig).then(function (nonce) {
         return getIdentityToken(nonce, appConfig);
         }).then(function (identityToken) {
         return getSession(identityToken, appConfig);
         }).then(function (session_token) {
         debugger;
         });*/
    };

    return {
        Inst: inst
    };
}]);