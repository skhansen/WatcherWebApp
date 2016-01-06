/*global angular*/
var chatModule = angular.module('chatApp');

chatModule.controller('chatController', function ($scope, GroupService, $interval, CS, $rootScope) {
    'use strict';
    $scope.circleProgress = 0;
    $scope.messages = [];
    $scope.queue = [];
    var index = 0;

    $scope.prepareMessage = function (message) {
        var result = '';
        if (message.sender.user_id === 'CPH_WATCHER_BOT_IDENTIFIER') {
            if (message.parts.length === 0) {
                return;
            }

            return message.parts[0].body;
        }

        message.parts.forEach(function (item) {
            result += item.body + '\n';
        });
        return result;
    };

    $scope.getColorMessage = function (message) {
        if (message.sender.user_id !== 'CPH_WATCHER_BOT_IDENTIFIER') {
            return;
        }
        if (message.parts.length === 0) {
            return;
        }

        if(message.parts.length < 2) {
            return '';
        }
        return message.parts[1].body;
    };

    $scope.message = '';
    $scope.isShow = true;
    $scope.group = GroupService.getGroup();
    $scope.isShowWarning = false;
    $scope.ST = CS.AppConfig.session_token;

    $scope.messages = CS.Messages;
    $scope.chatInst = null;
    $scope.phoneNumber = null;

    $scope.getAvatar = function (sender) {
        var img = 'img/WebApp/noAvatarMale@2x.png';
        if(sender.user_id == 'CPH_WATCHER_BOT_IDENTIFIER')
        {
            img = 'img/WebApp/BotFace@3x.png';
            return img;
        }
        if (sender.user_id != null) {

            var id = sender.user_id;

            angular.forEach($scope.group.followers, function (value, key) {
                if (value.phoneNumber == id) {
                    img = value.avatar;
                }
            });
        }

        return img;
    };

    $scope.getSeenBy = function (recipient_status) {

        var count = 0;
        var countUser = 0;

        angular.forEach(recipient_status, function (value, key) {
           if(value == "read" || key == 'CPH_WATCHER_BOT_IDENTIFIER'){
               count++;
           }
            countUser++;
        });

        if(count == countUser)
        {
            return "Seen by everyone"
        }

        return "Seen by " + count + " participants";

       /* console.log(recipient_status.toString().split('sent').length);

        var aa = recipient_status.split('sent');

        if(recipient_status.split('sent').length == 0)
        {
            return "Seen by everyone"
        }

        if(recipient_status.toString().split('sent').length == 1)
        {
            if(recipient_status.toString().split('"CPH_WATCHER_BOT_IDENTIFIER":"sent"').length == 1){
            return "Seen by everyone"}
        }

        return "Seen by " + recipient_status.toString().split('read').length + " participants";*/
    }


    function checkGroup() {
        if (!$scope.group) {
            $scope.group = GroupService.getGroup();
        }
    }

    $interval(checkGroup, 1000);

    $scope.sendMessage = function () {
        if (!$rootScope.phoneNumber) {
            return;
        }
        if ($scope.message === '') {
            return;
        }

        $scope.userName = getUserName($rootScope.phoneNumber);

        CS.SendMessage($scope.message, $scope.userName);
        $scope.messages.push({
            parts: [{body: $scope.message}],
            sender: {user_id: $scope.phoneNumber}
        });
        $scope.message = '';
    };

    function messageHandler(message) {
        message.sender.initials = getUserInitials(message.sender.user_id);
        if ($scope.phoneNumber === message.sender.user_id) {
            var i = 0;
            for (i; i < $scope.messages.length; i++) {
                if (typeof $scope.messages[i].url === 'undefined') {
                    break;
                }
            }

            if ($scope.messages.length <= i) {
                $scope.messages.push(message);
                return;
            }
            $scope.messages[i] = message;
            return;
        }
        $scope.messages.push(message);
    }

    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        $scope.keepScroll();
    });

    $scope.keepScroll = function () {
        var objDiv = document.getElementById("message-container");
        objDiv.scrollTop = objDiv.scrollHeight + 100;
    };

    $scope.focusInputTextBox = function () {
        var width = $(window).width();
        if (width < 993) {
            if ($rootScope.isHidden) {
                $rootScope.showChat();
            }
        }
    };

    function preparedInitials() {
        $scope.messages.forEach(function (item) {
            if (!item.sender.hasOwnProperty('user_id')) {
                return;
            }
            item.sender.initials = getUserInitials(item.sender.user_id);
        });
    }

    function getMessages(data) {
        $scope.messages = data.reverse();
        preparedInitials();
        CS.Messages = data;
        var objDiv = document.getElementById("message-container");
        objDiv.scrollTop = objDiv.scrollHeight;
        objDiv.scrollTop = objDiv.scrollHeight + 100;
    }

    function initCallback() {
        // CS.GetAll(getMessages);
    }

    function getUserInitials(number) {
        var filter = $scope.group.followers.filter(function (item) {
            return item.phoneNumber === number;
        });
        if (filter.length === 0) {
            $scope.userName = '';
            return;
        }
        var initials = '';
        if (filter[0].hasOwnProperty('firstName') && filter[0].firstName.length != 0) {
            initials += filter[0].firstName[0];
        }
        if (filter[0].hasOwnProperty('secondName') && filter[0].secondName.length != 0) {
            initials += filter[0].secondName[0];
        }
        return initials;
    }

    function getUserName(number) {
        if(number === 'CPH_WATCHER_BOT_IDENTIFIER'){
            return 'Watcher';
        }
        var filter = $scope.group.followers.filter(function (item) {
            return item.phoneNumber === number;
        });
        if (filter.length === 0) {
            $scope.userName = '';
            return;
        }
        var userName = '';
        if (filter[0].hasOwnProperty('firstName')) {
            userName += filter[0].firstName + ' ';
        }
        if (filter[0].hasOwnProperty('secondName')) {
            userName += filter[0].secondName;
        }
        return userName;
    }
    $scope.getUserName = getUserName;
    function reconnect() {
        $scope.group = GroupService.getGroup();
        if($scope.group.statusType == 11){
            return;
        }
        CS.InitSocket(errorHandler);
    }

    function errorHandler(err) {
        window.setTimeout(reconnect, 15000);
    }

    function init() {
        if (!GroupService.getGroup() || !$rootScope.phoneNumber) {
            setTimeout(init, 1000);
            return;
        }
        $scope.phoneNumber = $rootScope.phoneNumber;
        $scope.group = GroupService.getGroup();
        if($scope.group.statusType == 11){
            return;
        }
        var session_token = localStorage.getItem('session_token');
        var user_id = localStorage.getItem('user_id');
        $scope.userName = getUserName($rootScope.phoneNumber);
        CS.AppConfig.callback = getMessages;
        if (session_token && user_id === $rootScope.phoneNumber) {
            CS.AppConfig.sessionToken = session_token;
            CS.AppConfig.user_id = user_id;
            CS.AppConfig.conversation = {
                id: $scope.group.chatId,
                messages_url: $scope.group.chatId.replace('layer:///', 'https://api.layer.com/') + '/messages'
            };

            CS.AppConfig.messageHandler = messageHandler;
            CS.InitSocket();
            initCallback();
            return;
        }
        CS.Init($rootScope.phoneNumber, $scope.group.chatId, initCallback, messageHandler); // parameter is temp
    }

    init();

});
