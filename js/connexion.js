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
                if (err.data) {
                    $scope.message = err.data.message;
                } else {
                    $scope.message = 'Le serveur ne répond pas';
                }
            }
        );
    };

    $scope.keyPressed = function ($event) {
        if ($event.keyCode === 13) {
            $scope.connexion();
        }
    };

}]);