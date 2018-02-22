/**
 * @file Contient le contrôleur de la Connexion
 */

app.controller('ConnexionController', ['$scope', 'authService', function ($scope, authService) {

    $scope.credentials = {
        email: '',
        password: ''
    };

    $scope.message = '';

    $scope.connexion = function () {

        $scope.message = '';

        authService.login($scope.credentials).then(
            function (res) {
                authService.redirectAccordingly();
            },
            function (err) {
                $scope.message = err.data.message;
            }
        );
    };

    $scope.keyPressed = function ($event) {
        if ($event.keyCode === 13) {
            $scope.connexion();
        }
    };

}]);