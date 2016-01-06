/*global angular*/
var controllers = angular.module('watcherControllers');
controllers.controller('watcherController', function ($scope) {
    'use strict';

    var styles = [
        {
            stylers: [
                {hue: "#00ffe6"},
                {saturation: -100},
                {"lightness": +8},
                {"gamma": 1.80}
            ]
        }, {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                {lightness: 100},
                {visibility: "simplified"}
            ]
        }, {
            featureType: "road",
            elementType: "labels",
            stylers: [
                {visibility: "off"}
            ]
        }
    ];

    var map = null,
        mapOptions = {
            zoom: 15,
            center: new google.maps.LatLng(40.707932, -74.000175),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };


    function init() {
        map = new google.maps.Map(document.getElementById('map'), mapOptions);

        var flightPlanCoordinates = [
            {lat: 40.708849, lng: -74.005153},
            {lat: 40.707438, lng: -74.004115},
            {lat: 40.709433, lng: -74.001682},
            {lat: 40.708795, lng: -74.000893},
            {lat: 40.707932, lng: -74.000175}
        ];
        var flightPath = new google.maps.Polyline({
            path: flightPlanCoordinates,
            geodesic: true,
            strokeColor: '#3aca68',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        flightPath.setMap(map);


        var marker = new google.maps.Marker({
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: {lat: 40.707932, lng: -74.000175},
            icon: "img/Green Pin 3.png"
        });

        marker = new google.maps.Marker({
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: {lat: 40.708849, lng: -74.005153},
            icon: "none"
        });
        marker = new google.maps.Marker({
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: {lat: 40.708849, lng: -74.000},
            icon: "img/Pin(2).png"
        });


        google.maps.event.addDomListener(window, 'load', function () {
        });
    }

    init();
});