/**
 * @file Contient le contrôleur de la Création de compte
 */

app.controller('CompteCreationController', ['$scope', 'ADMIN_TYPE', 'apiService', function ($scope, ADMIN_TYPE, apiService) {

    $scope.ADMIN_TYPE = ADMIN_TYPE;

    $scope.account = {
        adminType: ADMIN_TYPE.PUB,
        email: '',
        domain: '',
        bank: '',
        password: '',
        confirmPassword: ''
    };

    $scope.create = function () {

        $('#create-account-loading').css('display', 'flex');

        apiService.createAccount($scope.account).then(
            function (res) {
                $('#create-account-loading').css('display', 'none');
                swal({text: res.data.message, icon: "success"})
                    .then(() => window.location.href = 'connexion.html');
            },
            function (err) {
                $('#create-account-loading').css('display', 'none');
                if (err.data) {
                    swal({text: err.data.message, icon: "error"});
                }
            }
        );
    };

    $scope.readyTooltip = function () {
        $('.tooltipped').tooltip({delay: 50});
    };

}]);