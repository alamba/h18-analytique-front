/**
 * @file Contient les contrôleurs et gère les templates de la section publicité
 */

//////////////////////////////////////////////////////////////////////////
// DIRECTIVES / TEMPLATES
//////////////////////////////////////////////////////////////////////////
app.directive('pubAccueil', function () {
    return {
        templateUrl: './templates/pub-accueil-template.html'
    };
}).directive('pubParametres', function () {
    return {
        templateUrl: './templates/pub-parametres-template.html'
    };
}).directive('pubCampagnes', function () {
    return {
        templateUrl: './templates/pub-campagnes-template.html',
        link: function () {
            prepMaterializeCss();
        }
    };
}).directive('pubCampagneCreate', function () {
    return {
        templateUrl: './templates/pub-campagne-create-template.html',
        link: function () {
            prepMaterializeCss();
        }
    };
}).directive('pubCampagneModify', function () {
    return {
        templateUrl: './templates/pub-campagne-modify-template.html',
        link: function () {
            prepMaterializeCss();
        }
    };
}).directive('pubProfils', function () {
    return {
        templateUrl: './templates/pub-profils-template.html',
        link: function () {
            prepMaterializeCss();
        }
    };
});

//////////////////////////////////////////////////////////////////////////
// CONTROLLLERS
//////////////////////////////////////////////////////////////////////////
app.controller('PubliciteController', ['$scope', 'apiService', function ($scope, apiService) {

    apiService.clearCache();

    ///
    // Gestion des pages
    ///
    const pages = {
        accueil: 'accueil',
        campagnes: 'campagnes',
        campagnecreate: 'campagne-create',
        campagnemodify: 'campagne-modify',
        profils: 'profils',
        parametres: 'parametres'
    };

    $scope.currentPage = pages.accueil;
    $scope.selectedCampagneId = -1;

    $scope.setCurrentPage = function (page, selectedCampagneId) {
        $scope.currentPage = page;
        $scope.selectedCampagneId = selectedCampagneId;
        fixForNgAnimateGettingStuck();
    };

}]).controller('CampagnesController', ['$scope', 'apiService', function ($scope, apiService) {

    $scope.campagneListShort = [];

    apiService.campagneListShort().then((result) => {
        $scope.campagneListShort = result.data;
    });

    ///
    // Gestion des filtres de campagnes
    ///
    $scope.filters = {
        datedescend: {
            property: '-datecreation',
            display: 'Les plus récentes'
        },
        dateascend: {
            property: 'datecreation',
            display: 'Les plus anciennes'
        },
        atoz: {
            property: 'name',
            display: 'Nom de A à Z'
        },
        ztoa: {
            property: '-name',
            display: 'Nom de Z à A'
        }
    };

    $scope.filter = $scope.filters.datedescend;

    $scope.setFilter = function (newFilter) {
        $scope.filter = newFilter;
    };

}]).controller('CampagneCreateController', ['$scope', function ($scope) {

    $scope.banner = {};

    $("#horizontal-file").change(function () {
        readURL(this, $("#horizontal-img"));
    });

    $("#vertical-file").change(function () {
        readURL(this, $("#vertical-img"));
    });

    $("#mobile-file").change(function () {
        readURL(this, $("#mobile-img"));
    });

}]).controller('CampagneModifyController', ['$scope', function ($scope) {

    $scope.selectedCampagneId = null;
    $scope.selectedCampagne = null;
    $scope.campagnes = [
        {
            id: 10001,
            nom: "Tipico",
            url: "https://www.tipico.com",
            profileids: [1, 3],
            datedebut: "2018-01-01",
            datefin: "2018-01-31",
            budget: 5000,
            banner: {
                horizontal: "continental-horizontal.gif",
                vertical: "honda-vertical.gif",
                mobile: "mobile-tipico.gif"
            },
            bannerurl: {
                horizontal: "./test/continental-horizontal.gif",
                vertical: "./test/honda-vertical.gif",
                mobile: "./test/mobile-tipico.gif"
            }
        },
        {
            id: 10002,
            nom: "Cartoon Network",
            url: "https://www.cartoonnetwork.ca/",
            profileids: [2],
            datedebut: "2018-01-01",
            datefin: "2018-01-31",
            budget: 7000,
            banner: {
                horizontal: "",
                vertical: "",
                mobile: "mobile-cartoonnetworks.png"
            },
            bannerurl: {
                horizontal: "",
                vertical: "",
                mobile: "./test/mobile-cartoonnetworks.png"
            }
        }
    ];

    init();

    function init() {

        if (!$scope.$parent.selectedCampagneId)
            return;

        // copy object so original is unaffacted
        $scope.selectedCampagne = $.extend(true, {}, $scope.campagnes.find(function (o) {
            return o.id == this.selectedCampagneId;
        }, $scope.$parent));

        if (!$scope.selectedCampagne.id)
            return;

        // ng-selected not working with materialize dropdown
        // select by hand
        $("#profildrop option").prop("selected", false);
        for (let i = 0; i < $scope.selectedCampagne.profileids.length; i++) {
            $('#profildrop option[value=' + $scope.selectedCampagne.profileids[i] + ']').prop('selected', true);
        }
        // re-bind the generated select
        $("#profildrop").material_select();

        // select dates manually
        $("#datedebut").val($scope.selectedCampagne.datedebut).pickadate();
        $("#datefin").val($scope.selectedCampagne.datefin).pickadate();
    }

}]).controller('ProfilsController', ['$scope', function ($scope) {

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
