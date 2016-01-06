/*global angular*/
var controllers = angular.module('watcherControllers');


controllers.controller('watcherController', function ($scope, $http, GroupService, $routeParams, $interval, $rootScope) {
    'use strict';

    var groupId = $routeParams['groupId'];
    var phoneNumber = '';
    $rootScope.phoneNumber = $routeParams['phoneNumber'];

    $scope.zoom = 15;
    $scope.statusType = 11;
    $scope.inProgress = true;
    $scope.isTimeRun = false;
    $scope.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    $scope.currentIconBasePanic = '';

    if (groupId && $rootScope.phoneNumber) {
        $interval(getGroup, 15000);
        getGroup();
    } else {
        $http({
            method: 'GET',
            url: 'https://www.googleapis.com/urlshortener/v1/url?shortUrl=http://goo.gl/' + $routeParams["shortLink"] + '&key=AIzaSyCjQjqoIWS0xQMHi_TpVDingce32fbtEJk',
            async: true
        }).then(
            function successCallback(response) {
                if (!response.data.hasOwnProperty('longUrl')) {
                    return;
                }
                var parse = response.data.longUrl.split('/');
                var index = parse.length - 1;
                if (index < 2) {
                    return;
                }
                if (parse[index] === '') {
                    index -= 1;
                }

                groupId = parse[index - 1];
                phoneNumber = parse[index];
                $rootScope.phoneNumber = phoneNumber;

                $interval(getGroup, 15000);
                getGroup();


            }, function errorCallback(response) {
                $interval(getGroup, 15000);
                getGroup();
            });
    }


    if (navigator.userAgent.match(/iPad/i) != null) {

        var iOSKeyboardFix = {
            targetElem: $('#ii'),
            init: (function () {
                $("input, textarea").on("focus", function () {
                    iOSKeyboardFix.bind();
                });
            })(),

            bind: function () {
                $(document).on('scroll', iOSKeyboardFix.react);
                iOSKeyboardFix.react();
            },

            react: function () {

                var offsetX = iOSKeyboardFix.targetElem.offset().top;
                var scrollX = $(window).scrollTop();
                var changeX = offsetX - scrollX;

                iOSKeyboardFix.targetElem.css({'position': 'fixed', 'top': '-' + changeX + 'px'});

                $('input, textarea').on('blur', iOSKeyboardFix.undo);

                $(document).on('touchstart', iOSKeyboardFix.undo);
            },

            undo: function () {

                iOSKeyboardFix.targetElem.removeAttr('style');
                document.activeElement.blur();
                $(document).off('scroll', iOSKeyboardFix.react);
                $(document).off('touchstart', iOSKeyboardFix.undo);
                $('input, textarea').off('blur', iOSKeyboardFix.undo);
            }
        };

    }



    $('.scrollable').bind("touchmove", function (e) {
        e.preventDefault();
    });

    var ts;
    $('.scrollable').bind('touchstart', function (e) {

        ts = e.originalEvent.touches[0].clientY;
        console.log(e.originalEvent.touches[0].clientY);
    });

    $('.scrollable').bind("touchmove", function (e) {

        var te = e.originalEvent.changedTouches[0].clientY;

        console.log("difference: " + (te - ts));


        if ($('.scrollable')[0].scrollTop === 0 && te - ts > 0 || ($('.scrollable')[0].scrollHeight - $('.scrollable')[0].clientHeight) === $('.scrollable')[0].scrollTop && te - ts < 0) {
            console.log("dont do stuff");
        }
        else {
            e.stopPropagation();
        }
    });

    $scope.closeEmergency = function () {
        $scope.isShowWarning = false;
        $scope.closeRedMod = true;
        $scope.map = null;
        $scope.redMap = null;
        init();
    };

    $rootScope.$watch('isShowWarning', function (newValue, oldValue) {
        if ($scope.map != null) {
            resizeMap();
        }
    });


    function resizeMap() {
        google.maps.event.trigger($scope.map, 'resize');
    }

    function prepareIcon(userImg, current, callback) {
        $http({
            method: 'GET',
            url: Config.WATCHER_API_AVATAR + userImg.replace("https://wantr.blob.core.windows.net/watcher-avatars/",''),
            async: true
        }).then(function (response) {
            var second = document.createElement("canvas");
            second.width = 50;
            second.height = 50;
            var tmpCtx = second.getContext('2d');

            var thumbImg = new Image();
            thumbImg.src = 'data:image/gif;base64,' + response.data;
            thumbImg.onload = function () {
                tmpCtx.save();
                tmpCtx.beginPath();
                tmpCtx.arc(25, 25, 25, 0, Math.PI * 2, true);
                tmpCtx.closePath();
                tmpCtx.clip();
                tmpCtx.drawImage(thumbImg, 0, 0, 50, 50);

                tmpCtx.beginPath();
                tmpCtx.arc(0, 0, 25, 0, Math.PI * 2, true);
                tmpCtx.clip();
                tmpCtx.closePath();
                tmpCtx.restore();

                var canvas = document.createElement("canvas");
                canvas.width = 48;
                canvas.height = 72;

                var context = canvas.getContext('2d');
                var imageObj1 = new Image(48, 72);
                imageObj1.onload = function () {
                    context.drawImage(imageObj1, 0, 0, 48, 72);
                    context.drawImage(second, 5, 5, 38, 38);
                    context.save();

                    var url = canvas.toDataURL();
                    console.log(url);
                    callback(url);

                };
                imageObj1.src = $scope.group.statusType == 12 ? 'img/WebApp/cp_w.png' : 'img/WebApp/cp.png';
            };
        }, function (error) {
            callback();
        });
    }
    function init() {

        if ($scope.map != null) {
            $scope.zoom = $scope.map.zoom;
            $scope.lat = $scope.map.center.lat();
            $scope.lng = $scope.map.center.lng();

            var latlng = new google.maps.LatLng($scope.group.currentPosition.latitude, $scope.group.currentPosition.longitude);
            $scope.marker.setPosition(latlng);

        }
        else {
            $scope.lat = $scope.group.currentPosition.latitude;
            $scope.lng = $scope.group.currentPosition.longitude;

            var map = null,
                mapOptions = {
                    zoom: $scope.zoom,
                    center: new google.maps.LatLng($scope.lat, $scope.lng),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true
                };


            $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
            var icon = 'img/WebApp/destinationMarkerPanic.png';


            $scope.finishMarker = new google.maps.Marker({
                map: $scope.map,
                draggable: false,
                position: {lat: $scope.group.destination.latitude, lng: $scope.group.destination.longitude},
                icon: "img/Pin(2).png"
                // icon: image
            });


            $scope.marker = new google.maps.Marker({
                map: $scope.map,
                draggable: false,
                position: {lat: $scope.group.currentPosition.latitude, lng: $scope.group.currentPosition.longitude},
                icon: $scope.currentIconBase != '' ? $scope.currentIconBase : $scope.currentIcon
            });

            var latlngbounds = new google.maps.LatLngBounds();

            latlngbounds.extend(new google.maps.LatLng($scope.group.currentPosition.latitude, $scope.group.currentPosition.longitude));
            latlngbounds.extend(new google.maps.LatLng($scope.group.destination.latitude, $scope.group.destination.longitude));
            /*   latlngbounds.extend(new google.maps.LatLng(
             $scope.group.destination.latitude + ($scope.group.currentPosition.latitude - $scope.group.destination.latitude) * 2,
             $scope.group.destination.longitude + ($scope.group.currentPosition.longitude - $scope.group.destination.longitude) * 2));*/

            $scope.map.setCenter(new google.maps.LatLng($scope.group.currentPosition.latitude, $scope.group.currentPosition.longitude)
                , $scope.map.fitBounds(latlngbounds));


        }
        if ($scope.group.statusType == 12) {
            $scope.finishMarker.setIcon('img/WebApp/destinationMarkerPanic.png');
            if ($scope.group.user.hasOwnProperty('avatar') && $scope.group.user.avatar != '' && $scope.currentIconBasePanic == '') {
                prepareIcon($scope.group.user.avatar, $scope.currentIcon, function (base64) {
                    debugger;
                    if(!base64){
                        init();
                        return;
                    }
                    $scope.currentIconBasePanic = base64;
                    $scope.marker.setIcon($scope.currentIconBasePanic == '' ? "img/WebApp/emergencyMarker@2x.png" : $scope.currentIconBasePanic); //123
                    $scope.$apply();

                    init();
                });
            }
            $scope.marker.setIcon($scope.currentIconBasePanic == '' ? "img/WebApp/emergencyMarker@2x.png" : $scope.currentIconBasePanic); //123
            $scope.color = '#ea4c50';
        }
        else if ($scope.group.statusType == 13) {

            $scope.finishMarker.setIcon('none');
            $scope.marker.setIcon($scope.currentIconBase != '' ? $scope.currentIconBase : $scope.currentIcon);
            //   $scope.color = 'none';
        }
        else {
            var image = {
                url: 'img/WebApp/currentPositionMarkerDefault.png'
            };

            $scope.finishMarker.setIcon('img/WebApp/destinationMarkerDefault.png');
            $scope.marker.setIcon($scope.currentIconBase != '' ? $scope.currentIconBase : $scope.currentIcon);
            $scope.color = '#3aca68';

        }

        if ($scope.group.path) {
            if ($scope.encodedPolyline != null) {
                $scope.encodedPolyline.setMap(null);
            }
            if ($scope.group.statusType != 13) {
                var decodedPoints =
                    new google.maps.geometry.encoding.decodePath($scope.group.path);

                var encodedPolyline = new google.maps.Polyline({
                    strokeColor: $scope.color,
                    map: $scope.map,
                    strokeOpacity: 1.0,
                    strokeWeight: 5,
                    path: decodedPoints,
                    clickable: false,
                    format: "png32"
                });

                $scope.encodedPolyline = encodedPolyline;
            }

        }

        if ($scope.group.statusType === 13) {
            var value = $scope.group.chatExpirationDate;
            var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(?:([\+-])(\d{2})\:(\d{2}))?Z?$/.exec(value);
            var utcMilliseconds = Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]);
            var d = new Date(utcMilliseconds);

            if (d < new Date()) {
                $scope.isShowEnd = true;
            }
            if ($scope.isTimeRun === false) {
                runTimer();
            }
        }

        if ($scope.group.statusType == 11) {
            $scope.isShowEnd = true;
        }

        if ($scope.group.statusType != 12 && $scope.statusType == 12) {
            $scope.isShowWarning = false;
        }
        debugger;
        if ($scope.group.statusType == 12 && $scope.statusType != $scope.group.statusType) {
            if ($scope.group.user.hasOwnProperty('avatar') && $scope.group.user.avatar != '' && $scope.currentIconBasePanic == '') {
                prepareIcon($scope.group.user.avatar, $scope.currentIcon, function (base64) {
                    debugger;
                    if(!base64){
                        init();
                        return;
                    }
                    $scope.currentIconBasePanic = base64;
                    $scope.$apply();

                    init();
                });
            }


            $scope.isShowWarning = true;

            if ($scope.closeRedMod != true) {
                var map = null,
                    mapOptions = {
                        zoom: $scope.zoom + 2,
                        center: new google.maps.LatLng($scope.lat, $scope.lng),
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        disableDefaultUI: true,
                        draggable: false
                    };


                $scope.redMap = new google.maps.Map(document.getElementById('redMap'), mapOptions);

                var marker = new google.maps.Marker({
                    map: $scope.redMap,
                    position: {lat: $scope.group.currentPosition.latitude, lng: $scope.group.currentPosition.longitude},
                    icon: $scope.currentIconBasePanic == '' ? "img/WebApp/emergencyMarker@2x.png" : $scope.currentIconBasePanic
                });
            }
            $rootScope.statusType = $scope.statusType = $scope.group.statusType;

        }
        else {
            $rootScope.statusType = $scope.statusType = $scope.group.statusType;
        }
    }

    function startEnd() {
        $scope.isShowEnd = true;
    }

    function runTimer() {
        $rootScope.isTimeRun = $scope.isTimeRun = true;
        var expirationDate = new Date($scope.group.chatExpirationDate);
        var timeOutValue = expirationDate - new Date();
        if (timeOutValue < 30000) {
            startEnd();
            return;
        }
        $rootScope.min = $scope.min = (timeOutValue / 60 / 1000).toFixed(0);
        $rootScope.hour = $scope.min = (timeOutValue / 60 / 60 / 1000).toFixed(0);
        $interval(function () {
            if ($scope.endTimer === true) {
                return;
            }

            if (timeOutValue < 1000) {
                $rootScope.min = 0;
                $rootScope.hour = 0;
                $rootScope.sec = 0;
                $scope.endTimer = true;
                startEnd();
            }
            timeOutValue = expirationDate - new Date();
            $rootScope.hour = $scope.hour = Math.floor(timeOutValue / 36e5);
            $rootScope.min = $scope.min = Math.floor((timeOutValue % 36e5) / 6e4);
            $rootScope.sec = $scope.sec = Math.floor((timeOutValue % 6e4) / 1000);
        }, 1000);
    }

    $scope.prBarClick = function () {
        var latlngbounds = new google.maps.LatLngBounds();

        latlngbounds.extend(new google.maps.LatLng($scope.group.currentPosition.latitude, $scope.group.currentPosition.longitude));
        latlngbounds.extend(new google.maps.LatLng($scope.group.destination.latitude, $scope.group.destination.longitude));

        $scope.map.setCenter(new google.maps.LatLng((($scope.group.currentPosition.latitude + $scope.group.destination.latitude) / 2), (($scope.group.currentPosition.longitude + $scope.group.destination.longitude) / 2)
            , $scope.map.fitBounds(latlngbounds)));
    };

    $scope.messageClick = function () {
        $('#footer').hide()
        $scope.closeEmergency();
        $rootScope.showChat(true);
    };
    var directionsService = new google.maps.DirectionsService(),
        directionDisplay = new google.maps.DirectionsRenderer();

    function getDistance(distance) {
        if (distance.routes.length === 0 || distance.routes[0].legs.length === 0
            || !distance.routes[0].legs[0].distance) {
            return 0;
        }
        return distance.routes[0].legs[0].distance.value;
    }

    function getWentDistance(callback) {
        var request = {
            origin: new google.maps.LatLng($scope.group.origin.latitude, $scope.group.origin.longitude),
            destination: new google.maps.LatLng($scope.group.currentPosition.latitude, $scope.group.currentPosition.longitude),
            travelMode: google.maps.DirectionsTravelMode.WALKING
        };
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                callback(getDistance(response));
                return;
            }
            callback(0);
        });
    }

    function getRemainDistance(callback) {
        var request = {
            origin: new google.maps.LatLng($scope.group.currentPosition.latitude, $scope.group.currentPosition.longitude),
            destination: new google.maps.LatLng($scope.group.destination.latitude, $scope.group.destination.longitude),
            travelMode: google.maps.DirectionsTravelMode.WALKING
        };
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                callback(getDistance(response));
                return;
            }
            callback(0);
        });
    }

    function getProgress() {
        if (!$scope.group) {
            return;
        }
        var wentDistance = 0,
            remainDistance = 0;

        getWentDistance(function (went) {
            wentDistance = went;
            getRemainDistance(function (remain) {
                remainDistance = remain;
                if (wentDistance + remainDistance === 0) {
                    $scope.circleProgress = 0;
                    return;
                }
                var progress = parseInt(((wentDistance / (wentDistance + remainDistance)) * 100).toFixed(0));
                if (progress > 99) {
                    $scope.circleProgress = '100';
                    return;
                }
                $scope.circleProgress = progress;
            });
        });
    }

    $interval(getProgress, 10000);
    getProgress();

    function showChat() {
        $scope.chatIsShow = true;
        $("header").hide();
        $("#mapContainer").hide('slow');
        $("#showChat").hide('slow');
        $("#hideChat").show('slow');
        $("#chatHeader").removeClass("navbar-bottom");
        $rootScope.isHidden = false;
        $('message-container').scrollTop = 999999999;

    }

    $scope.currentIcon = 'img/WebApp/currentPositionMarkerDefault.png';
    $scope.currentIconBase = '';
    function getGroup() {
        $http({
            method: 'GET',
            url: Config.WATCHER_API + groupId,
            async: true
        }).then(function successCallback(response) {

            GroupService.setGroup(response.data);

            $scope.group = response.data;
            if (!$scope.group) {
                console.log('Group is null!');
                return;
            }
            $scope.inProgress = false;


            if (!$scope.group.user.hasOwnProperty('avatar') || $scope.group.user.avatar == '' || $scope.currentIconBase != '') {
                init();
                return;
            }

            prepareIcon($scope.group.user.avatar, $scope.currentIcon, function (base64) {
                debugger;
                if(!base64){
                    init();
                    return;
                }
                $scope.currentIconBase = base64;
                $scope.$apply();

                init();
            });


        }, function errorCallback(response) {
        });
    }

    $scope.isEmpty = function (value) {
        if (typeof value === 'undefined' || value === null || value === '') {
            return true;
        }
        return false;
    }


});