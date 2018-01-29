//////////////////////////////////////////////////////////////////////////
// CONTROLLLERS
//////////////////////////////////////////////////////////////////////////
app.controller('ProfilCreationController', ['$scope', function ($scope) {

    $scope.urlCount = 1;

    $scope.getUrlCount = function () {
        return new Array($scope.urlCount);
    };

    $scope.incrementUrlCount = function () {
        $scope.urlCount++;
    };

    $scope.decrementUrlCount = function () {
        if ($scope.urlCount > 1)
            $scope.urlCount--;
    };
}]);