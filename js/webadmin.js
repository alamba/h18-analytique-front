/**
 * @file Contient les contrôleurs et gère les templates de la section web admin
 */

//////////////////////////////////////////////////////////////////////////
// DIRECTIVES / TEMPLATES
//////////////////////////////////////////////////////////////////////////
app.directive('webParametres', function () {
    return {
        templateUrl: './templates/web-parametres-template.html',
        link: function () {
            prepMaterializeCss();
        }
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
// Contrôleur global pour la page WebAdmin
//////////////////////////////////////////////////////////////////////////
app.controller('WebAdminController', ['$scope', 'apiService', 'authService', function ($scope, apiService, authService) {

    // Vider la cache quand ce contrôleur charge
    apiService.clearCache();

    // Afficher le nom de l'utilisateur
    $scope.displayName = authService.getDisplayName();

    // Lien pour se déconnecter
    $scope.logout = () => authService.logout();

    // Gestion des pages
    const pages = {
        accueil: 'accueil',
        redevances: 'redevances',
        instructions: 'instructions',
        parametres: 'parametres'
    };

    // Par défaut, afficher la page d'accueil
    $scope.currentPage = pages.accueil;

    // Changer la template affichée
    $scope.setCurrentPage = function (page) {
        $scope.currentPage = page;
        fixForAnimationsGettingStuck();
    };

}]);

app.controller('InstructionsController', ['$scope', 'apiService', function ($scope, apiService) {

    $scope.userId = '';
    $scope.horId = '';
    $scope.verId = '';
    $scope.mobId = '';

    // Récupérer les identifiants de l'utilisateur
    apiService.getAccountBanners().then(
        function (res) {
            $scope.userId = res.data.webSiteAdminID;
            $scope.horId = res.data.horID;
            $scope.verId = res.data.verID;
            $scope.mobId = res.data.mobID;
        },
        function (err) {
            // Do nothing
        }
    );

}]);

//////////////////////////////////////////////////////////////////////////
// Contrôleur pour modifier les paramètres d'un compte
//////////////////////////////////////////////////////////////////////////
app.controller('WebParametresController', ['$scope', 'apiService', function ($scope, apiService) {

    $scope.account = {
        email: '',
        domain: '',
        bankAccount: ''
    };

    // Récupérer les données du compte
    apiService.getAccountInfo().then(
        function (res) {
            $scope.account.email = res.data.email;
            $scope.account.domain = res.data.domain;
            $scope.account.bankAccount = res.data.bankAccount;
        },
        function (err) {
            console.error(err);
        }
    );

}]);