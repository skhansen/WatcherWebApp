/*global angular*/
var chatModule = angular.module('chatApp');
chatModule.factory('CS', ['$http', function ($http) {
    'use strict';

    var appConfig = {
        appId: Config.APP_ID,
        nonce: '',
        identityToken: '',
        sessionToken: '',
        user_id: '',
        conversation: JSON.parse('{"id":"layer:///conversations/c302a6cb-36ef-45e9-b872-7dea1500e6af","url":"https://api.layer.com/conversations/c302a6cb-36ef-45e9-b872-7dea1500e6af","messages_url":"https://api.layer.com/conversations/c302a6cb-36ef-45e9-b872-7dea1500e6af/messages","created_at":"2015-10-08T10:06:57.245Z","last_message":null,"participants":["2","1","3"],"distinct":false,"unread_message_count":0,"metadata":{"background_color":"#3c3c3c"}}'),
        callback: null
    };

    function getSession() {
        return $http({
            url: "https://api.layer.com/sessions",
            method: "POST",
            headers: {
                "Accept": "application/vnd.layer+json; version=1.0",
                "Content-type": "application/json"
            },
            data: {
                "identity_token": appConfig.identityToken,
                "app_id": appConfig.appId
            }
        })
    }

    function getIdentityToken() {
        return $http({
            url: Config.IDENTITY_TOKEN_URL,
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "Accept": "application/json"
            },
            data: {
                "nonce": appConfig.nonce,
                "userId": appConfig.user_id
            }
        })
    }

    function getNonce() {
        return $http({
            url: "https://api.layer.com/nonces",
            method: "POST",
            headers: {
                "Accept": "application/vnd.layer+json; version=1.0",
                "Content-type": "application/json"
            }
        });
    }

    function createConversation(participants) {
        return $http({
            url: "https://api.layer.com/conversations",
            method: "POST",
            headers: {
                "Authorization": 'Layer session-token="' + appConfig.sessionToken + '"',
                "Content-type": "application/json",
                "Accept": "application/vnd.layer+json; version=1.0"
            },
            data: {
                participants: ["1", "2", "3"],
                distinct: false,
                metadata: {
                    "background_color": "#3c3c3c"
                }
            }
        });
    }

    function sendMessage(body, name) {
        return $http({
            url: appConfig.conversation.messages_url,
            method: "POST",
            headers: {
                "Authorization": 'Layer session-token="' + appConfig.sessionToken + '"',
                "Content-type": "application/json",
                "Accept": "application/vnd.layer+json; version=1.0"
            },
            data: {
                parts: [{
                    body: body,
                    mime_type: 'text/plain'
                }],
                "notification": {
                    "text": name + ': ' + body,
                    "sound": "chime.aiff"
                }
            }
        });
    }

    function getMessages(callback) {
        $http({
            url: appConfig.conversation.messages_url,
            method: "GET",
            headers: {
                "Authorization": 'Layer session-token="' + appConfig.sessionToken + '"',
                "Content-type": "application/json",
                "Accept": "application/vnd.layer+json; version=1.0"
            }
        }).then(function (response) {
            callback(response.data);
        }, function (error) {
            if (error.status === 401 || error.status === 404) {
                localStorage.clear();
                inst(appConfig.user_id, appConfig.conversation.id, function () {
                    getMessages(callback);
                }, appConfig.messageHandler);
            }
        });
    }

    var send = function (text) {
        sendMessage(text).then(function (response) {
        }, function (error) {
            if (error.status === 401) {
                inst(appConfig.user_id, appConfig.conversation.id, function () {
                    send(text);
                }, appConfig.messageHandler);
            }
        });
    };

    var ws = null,
        isLoading = false,
        messages = [],
        intervalIsRun = false;



    var initSocket = function (callback) {
        ws = new WebSocket('wss://api.layer.com/websocket?session_token=' + appConfig.sessionToken,
            'layer-1.0');
        ws.addEventListener('message', function (event) {
            if (event.type !== 'message' || !event.data || event.data === '') {
                return;
            }
            var data = JSON.parse(event.data);
            if (data.body.operation !== 'create' || data.body.data.conversation.id !== appConfig.conversation.id) {
                return;
            }

            appConfig.messageHandler(data.body.data);
        });
        ws.onerror = function (error) {
            console.error('There was an un-identified Web Socket error' + ws.readyState);
        };
        ws.onopen = function (error) {
            getMessages(appConfig.callback);
        };
        if(intervalIsRun === false){
            intervalIsRun = true;
            window.setInterval(function () {
                if (ws.readyState != 1 && ws.readyState != 2) {
                    initSocket(callback);
                }
            }, 15000);
        }
    };


    var inst = function (user_id, chatId, callback, messageHandler) {
        isLoading = true;
        appConfig.user_id = user_id;
        appConfig.conversation = {
            id: chatId,
            messages_url: chatId.replace('layer:///', 'https://api.layer.com/') + '/messages'
        };
        appConfig.messageHandler = messageHandler;
        getNonce().then(function (response) {
            appConfig.nonce = response.data.nonce;
            getIdentityToken().then(function (response) {
                appConfig.identityToken = response.data.identity_token;
                getSession().then(function (response) {
                    localStorage.setItem('session_token', response.data.session_token);
                    localStorage.setItem('user_id', user_id);
                    appConfig.sessionToken = response.data.session_token;
                    initSocket();
                    isLoading = false;
                    callback();
                });
            });
        });

    };


    return {
        Init: inst,
        AppConfig: appConfig,
        Socket: ws,
        InitSocket: initSocket,
        SendMessage: sendMessage,
        GetAll: getMessages,
        IsLoading: isLoading,
        Messages: messages
    };
}])
;