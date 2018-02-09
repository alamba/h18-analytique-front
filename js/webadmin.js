/**
 * @file Contient les contrôleurs et gère les templates de la section web admin
 */

//////////////////////////////////////////////////////////////////////////
// DIRECTIVES / TEMPLATES
//////////////////////////////////////////////////////////////////////////
app.directive('webParametres', function () {
    return {
        templateUrl: './templates/web-parametres-template.html'
    };
}).directive('webRedevances', function () {
    return {
        templateUrl: './templates/web-redevances-template.html'
    };
}).directive('webInstructions', function () {
    return {
        templateUrl: './templates/web-instructions-template.html'
    };
});

//////////////////////////////////////////////////////////////////////////
// CONTROLLLERS
//////////////////////////////////////////////////////////////////////////
app.controller('WebAdminController', ['$scope', 'authService', function ($scope, authService) {

    // Gestion des pages //
    const pages = {
        accueil: 'accueil',
        redevances: 'redevances',
        instructions: 'instructions',
        parametres: 'parametres'
    };

    $scope.currentPage = pages.accueil;

    $scope.setCurrentPage = function (page) {
        $scope.currentPage = page;
        fixForAnimationsGettingStuck();
    };

    $scope.logout = () => authService.logout();

}]);