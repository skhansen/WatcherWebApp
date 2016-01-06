var controllers = angular.module('watcherControllers');


controllers.controller('testController', function ($scope) {
    $scope.isExpand = false;

    $scope.isFocus = false;

    $scope.$watch('isFocus', function (value) {
        if(value === true){
            $('body').addClass('small');
            return;
        }
        $('body').removeClass('small');
    })
});