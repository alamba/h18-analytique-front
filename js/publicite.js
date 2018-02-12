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
}).directive('pubProfilCreate', function () {
    return {
        templateUrl: './templates/pub-profil-create-template.html',
        link: function () {
            prepMaterializeCss();
        }
    };
}).directive('pubProfilModify', function () {
    return {
        templateUrl: './templates/pub-profil-modify-template.html',
        link: function () {
            prepMaterializeCss();
        }
    };
}).directive('repeatMaterialize', function () {
    return function (scope, element, attrs) {
        if (scope.$last) {
            // Donner du temps au digest cycle d'Angular
            setTimeout(function () {
                prepMaterializeCss()
            }, 200);
        }
    };
});

//////////////////////////////////////////////////////////////////////////
// CONTROLLLERS
//////////////////////////////////////////////////////////////////////////
app.controller('PubliciteController', ['$scope', 'apiService', 'authService', function ($scope, apiService, authService) {

    // Vider la cache quand se contrôleur charge
    apiService.clearCache();

    // Gestion des pages //
    const pages = {
        accueil: 'accueil',
        campagnes: 'campagnes',
        campagnecreate: 'campagne-create',
        campagnemodify: 'campagne-modify',
        profils: 'profils',
        profilcreate: 'profil-create',
        profilmodify: 'profil-modify',
        parametres: 'parametres'
    };

    $scope.currentPage = pages.accueil;
    $scope.selectedId = -1;

    $scope.setCurrentPage = function (page, selectedId) {
        $scope.currentPage = page;
        $scope.selectedId = selectedId;
        fixForAnimationsGettingStuck();
    };

    // Se déconnecter
    $scope.logout = () => authService.logout();

}]).controller('CampagnesController', ['$scope', 'apiService', function ($scope, apiService) {

    $scope.campagneList = [];

    apiService.getCampagneList().then(
        function (res) {
            $scope.campagneList = res.data.campaigns;
        },
        function (err) {
            // Do nothing for now
        }
    );

    // Gestion des filtres de campagnes //
    $scope.filters = {
        datedescend: {
            property: '-dateCreated',
            display: 'Les plus récentes'
        },
        dateascend: {
            property: 'dateCreated',
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

}]).controller('CampagneCreateController', ['$scope', '$q', 'apiService', function ($scope, $q, apiService) {

    // Template de base d'une campagne
    $scope.campagne = {
        name: '',
        redirectUrl: '',
        profileIds: [],
        startDate: '',
        endDate: '',
        budget: 0,
        imgHorizontal: '',
        imgVertical: '',
        imgMobile: '',
    };

    $scope.profilList = [];

    $scope.imgLocal = {
        hor: '',
        ver: '',
        mob: ''
    };

    $scope.create = function () {

        if (!$scope.imgLocal.hor || !$scope.imgLocal.ver || !$scope.imgLocal.mob) {
            swal({text: 'Veuillez sélectionner une image pour chaque bannière', icon: "error"});
            return;
        }

        $("#create-button").addClass('disabled');

        $q.all([
            apiService.uploadImgur($("#horizontal-file")[0]),
            apiService.uploadImgur($("#vertical-file")[0]),
            apiService.uploadImgur($("#mobile-file")[0])
        ]).then(data => {
            $scope.campagne.imgHorizontal = data[0].data.link;
            $scope.campagne.imgVertical = data[1].data.link;
            $scope.campagne.imgMobile = data[2].data.link;

            // Aller chercher les ID des profils manuellement
            $scope.campagne.profileIds = $("#profildrop").val().map(id => parseInt(id));

            apiService.createCampagne($scope.campagne).then(
                function (res) {
                    swal({text: res.data.message, icon: "success"})
                        .then(() => {
                            $scope.$parent.setCurrentPage('campagnes');
                            $scope.$parent.$apply();
                        });
                },
                function (err) {
                    $("#create-button").removeClass('disabled');
                    swal({text: err.data.message, icon: "error"});
                }
            );
        });

    };

    // Afficher les images selectionnées par les file input
    $("#horizontal-file").change(function () {
        readURL(this, $("#horizontal-img"));
    });

    $("#vertical-file").change(function () {
        readURL(this, $("#vertical-img"));
    });

    $("#mobile-file").change(function () {
        readURL(this, $("#mobile-img"));
    });

    init();

    function init() {
        apiService.getProfilList().then(
            function (res) {
                $scope.profilList = res.data.profiles;
            },
            function (err) {
                // Do nothing for now
            }
        );
    }

}]).controller('CampagneModifyController', ['$scope', '$q', 'apiService', function ($scope, $q, apiService) {

    // Template de base d'une campagne
    $scope.campagne = {
        campaignId: -1,
        name: '',
        redirectUrl: '',
        profileIds: [],
        startDate: '',
        endDate: '',
        budget: 0,
        imgHorizontal: '',
        imgVertical: '',
        imgMobile: '',
    };

    $scope.profilList = [];

    $scope.imgLocal = {
        hor: '',
        ver: '',
        mob: ''
    };

    $scope.modify = function () {

        let imgur = [];
        if ($scope.imgLocal.hor) imgur.push(apiService.uploadImgur($("#horizontal-file")[0]));
        if ($scope.imgLocal.ver) imgur.push(apiService.uploadImgur($("#vertical-file")[0]));
        if ($scope.imgLocal.mob) imgur.push(apiService.uploadImgur($("#mobile-file")[0]));

        $("#modify-button").addClass('disabled');

        $q.all(imgur).then(data => {
            let index = 0;
            if ($scope.imgLocal.hor) $scope.campagne.imgHorizontal = data[index++].data.link;
            if ($scope.imgLocal.ver) $scope.campagne.imgVertical = data[index++].data.link;
            if ($scope.imgLocal.mob) $scope.campagne.imgMobile = data[index].data.link;

            // Aller chercher les ID des profils manuellement
            $scope.campagne.profileIds = $("#profildrop").val().map(id => parseInt(id));

            apiService.modifyCampagne($scope.campagne.id, $scope.campagne).then(
                function (res) {
                    swal({text: res.data.message, icon: "success"})
                        .then(() => {
                            $scope.$parent.setCurrentPage('campagnes');
                            $scope.$parent.$apply();
                        });
                },
                function (err) {
                    $("#modify-button").removeClass('disabled');
                    swal({text: err.data.message, icon: "error"});
                }
            );
        });
    };

    $scope.delete = function () {

        swal({
            text: "Êtes-vous certain de vouloir supprimer cette campagne?",
            icon: "warning",
            buttons: ["Annuler", "Supprimer définitivement"]
        }).then(
            function (val) {
                if (!val)
                    return;
                apiService.deleteCampagne($scope.campagne.id).then(
                    function (res) {
                        swal({text: res.data.message, icon: "success"})
                            .then(() => {
                                $scope.$parent.setCurrentPage('campagnes');
                                $scope.$parent.$apply();
                            });
                    },
                    function (err) {
                        swal({text: err.data.message, icon: "error"});
                    }
                );
            }
        );
    };

    init();

    function init() {

        if (!$scope.$parent.selectedId)
            return;

        apiService.getProfilList().then(
            function (res) {
                $scope.profilList = res.data.profiles;
            },
            function (err) {
                // Do nothing for now
            }
        );

        apiService.getCampagne($scope.$parent.selectedId).then(
            function (res) {
                $scope.campagne = res.data;
                $scope.campagne.id = $scope.$parent.selectedId;

                // ng-selected not working with materialize dropdown
                // select by hand
                $("#profildrop option").prop("selected", false);
                for (let i = 0; i < $scope.campagne.profileIds.length; i++) {
                    $('#profildrop option[value=' + $scope.campagne.profileIds[i] + ']').prop('selected', true);
                }
                // re-bind the generated select
                $("#profildrop").material_select();

                // select dates manually
                $("#datedebut").val($scope.campagne.startDate).pickadate();
                $("#datefin").val($scope.campagne.endDate).pickadate();
            },
            function (err) {
                console.error(err.data.message);
            }
        );
    }

    // Afficher les images selectionnées par les file input
    $("#horizontal-file").change(function () {
        readURL(this, $("#horizontal-img"));
    });

    $("#vertical-file").change(function () {
        readURL(this, $("#vertical-img"));
    });

    $("#mobile-file").change(function () {
        readURL(this, $("#mobile-img"));
    });

}]).controller('ProfilsController', ['$scope', 'apiService', function ($scope, apiService) {

    $scope.profilList = [];

    apiService.getProfilList().then(
        function (res) {
            $scope.profilList = res.data.profiles;
        },
        function (err) {
            // Do nothing for now
        }
    );

    // Gestion des filtres de profils //
    $scope.filters = {
        datedescend: {
            property: '-dateCreated',
            display: 'Les plus récents'
        },
        dateascend: {
            property: 'dateCreated',
            display: 'Les plus anciens'
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

}]).controller('ProfilCreateController', ['$scope', 'apiService', function ($scope, apiService) {

    // Template de base d'un profil
    $scope.profil = {
        name: '',
        description: '',
        urls: [
            {
                val: ''
            },
        ]
    };

    $scope.addUrl = function () {
        $scope.profil.urls.push({val: ''});
    };

    $scope.removeUrl = function (index) {
        if ($scope.profil.urls.length > 1)
            $scope.profil.urls.splice(index, 1);
    };

    $scope.create = function () {

        let data = {
            name: $scope.profil.name,
            description: $scope.profil.description,
            urls: $scope.profil.urls.map(u => u.val)
        };

        apiService.createProfil(data).then(
            function (res) {
                swal({text: res.data.message, icon: "success"})
                    .then(() => {
                        $scope.$parent.setCurrentPage('profils');
                        $scope.$parent.$apply();
                    });
            },
            function (err) {
                swal({text: err.data.message, icon: "error"});
            }
        );
    };

}]).controller('ProfilModifyController', ['$scope', 'apiService', function ($scope, apiService) {

    // Template de base d'un profil
    $scope.profil = {
        name: '',
        description: '',
        urls: [
            {
                val: ''
            },
        ]
    };

    $scope.modify = function () {

        let data = {
            name: $scope.profil.name,
            description: $scope.profil.description,
            urls: $scope.profil.urls.map(u => u.val)
        };

        apiService.modifyProfil($scope.profil.id, data).then(
            function (res) {
                swal({text: res.data.message, icon: "success"})
                    .then(() => {
                        $scope.$parent.setCurrentPage('profils');
                        $scope.$parent.$apply();
                    });
            },
            function (err) {
                swal({text: err.data.message, icon: "error"});
            }
        );

    };

    $scope.delete = function () {

        swal({
            text: "Êtes-vous certain de vouloir supprimer ce profil?",
            icon: "warning",
            buttons: ["Annuler", "Supprimer définitivement"]
        }).then(
            function (val) {
                if (!val)
                    return;
                apiService.deleteProfil($scope.profil.id).then(
                    function (res) {
                        swal({text: res.data.message, icon: "success"})
                            .then(() => {
                                $scope.$parent.setCurrentPage('profils');
                                $scope.$parent.$apply();
                            });
                    },
                    function (err) {
                        swal({text: err.data.message, icon: "error"});
                    }
                );
            }
        );
    };

    $scope.addUrl = function () {
        $scope.profil.urls.push({val: ''});
    };

    $scope.removeUrl = function (index) {
        if ($scope.profil.urls.length > 1)
            $scope.profil.urls.splice(index, 1);
    };

    init();

    function init() {

        if (!$scope.$parent.selectedId)
            return;

        apiService.getProfil($scope.$parent.selectedId).then(
            function (res) {
                $scope.profil = res.data;
                $scope.profil.id = $scope.$parent.selectedId;
                $scope.profil.urls = res.data.urls.map(u => {
                    return {val: u.url};
                });
            },
            function (err) {
                console.error(err);
            }
        );
    }
}]);


/*
$scope.campagnes = [
    {
        id: 10001,
        name: "Tipico",
        redirectUrl: "https://www.tipico.com",
        profileids: [1, 3],
        startDate: "2018-01-01",
        endDate: "2018-01-31",
        budget: 5000,
        banner: {
            horizontal: "continental-horizontal.gif",
            vertical: "honda-vertical.gif",
            mobile: "mobile-tipico.gif"
        },
        horizontalImg: "./test/continental-horizontal.gif",
        verticalImg: "./test/honda-vertical.gif",
        mobileImg: "./test/mobile-tipico.gif"
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
];*/
