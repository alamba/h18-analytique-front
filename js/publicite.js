/**
 * @file Contient les contrôleurs et gère les templates de la section publicité
 */

//////////////////////////////////////////////////////////////////////////
// Directives / Templates
//////////////////////////////////////////////////////////////////////////
app.directive('pubAccueil', function () {
    return {
        templateUrl: './templates/pub-accueil-template.html'
    };
}).directive('pubParametres', function () {
    return {
        templateUrl: './templates/pub-parametres-template.html',
        link: function () {
            prepMaterializeCss();
        }
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
}).directive('readyTooltips', function () {
    return function (scope, element, attrs) {
        if (scope.$last) {
            setTimeout(function () {
                $('.tooltipped').tooltip({delay: 50})
            }, 200);
        }
    };
});

//////////////////////////////////////////////////////////////////////////
// Contrôleur global pour la page Publicité
//////////////////////////////////////////////////////////////////////////
app.controller('PubliciteController', ['$scope', 'apiService', 'authService', function ($scope, apiService, authService) {

    // Vider la cache quand ce contrôleur charge
    apiService.clearCache();

    // Afficher le nom de l'utilisateur
    $scope.displayName = authService.getDisplayName();

    // Lien pour se déconnecter
    $scope.logout = () => authService.logout();

    // Gestion des pages
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

    // Par défaut, afficher la page d'accueil
    $scope.currentPage = pages.accueil;
    $scope.selectedId = -1;

    // Changer la template affichée
    $scope.setCurrentPage = function (page, selectedId) {
        $scope.currentPage = page;
        $scope.selectedId = selectedId;
        fixForAnimationsGettingStuck();
    };

}]);

//////////////////////////////////////////////////////////////////////////
// Contrôleur pour afficher les campagnes
//////////////////////////////////////////////////////////////////////////
app.controller('CampagnesController', ['$scope', 'apiService', function ($scope, apiService) {

    $scope.campagneList = [];

    // Récupérer les campagnes de l'utilisateur
    apiService.getCampagneList().then(
        function (res) {
            $scope.campagneList = res.data.campaigns;
        },
        function (err) {
            // Do nothing
        }
    );

    // Gestion des filtres de campagnes
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

    // Par défaut, trier par date descendante
    $scope.filter = $scope.filters.datedescend;

    // Changer le filtre sélectionné
    $scope.setFilter = function (newFilter) {
        $scope.filter = newFilter;
    };

}]);

//////////////////////////////////////////////////////////////////////////
// Contrôleur pour créer une nouvelle campagne
//////////////////////////////////////////////////////////////////////////
app.controller('CampagneCreateController', ['$scope', '$q', 'apiService', function ($scope, $q, apiService) {

    $scope.profilList = [];
    $scope.campagne = getObjetTemplateForCampagne();
    $scope.imgLocal = {hor: '', ver: '', mob: ''};

    // Récupérer les profils de l'utilisateur
    apiService.getProfilList().then(
        function (res) {
            $scope.profilList = res.data.profiles;
            // TODO Rajouter BL lorsque l'utilisateur n'a pas encore de profils
        },
        function (err) {
            // Do nothing
        }
    );

    $scope.create = function () {

        // Annuler s'il reste une image à sélectionner
        if (!$scope.imgLocal.hor || !$scope.imgLocal.ver || !$scope.imgLocal.mob) {
            swal({text: 'Veuillez sélectionner une image pour chaque bannière', icon: 'error'});
            return;
        }

        // Afficher le loading pendant la tentative de création
        $('#create-campagne-loading').css('display', 'flex');

        let imgurPromises = [];

        // Ne pas uploader une image si elle a déjà été uploadée
        if (!$scope.campagne.imgHorizontal) imgurPromises.push(apiService.uploadToImgur($('#horizontal-file')[0]));
        if (!$scope.campagne.imgVertical) imgurPromises.push(apiService.uploadToImgur($('#vertical-file')[0]));
        if (!$scope.campagne.imgMobile) imgurPromises.push(apiService.uploadToImgur($('#mobile-file')[0]));

        // Uploader les images sur imgur
        $q.all(imgurPromises).then((data) => {

            // Mettre à jour les liens des images pour la campagne
            let index = 0;
            if (!$scope.campagne.imgHorizontal) $scope.campagne.imgHorizontal = data[index++].data.link;
            if (!$scope.campagne.imgVertical) $scope.campagne.imgVertical = data[index++].data.link;
            if (!$scope.campagne.imgMobile) $scope.campagne.imgMobile = data[index].data.link;

            // Aller chercher les ID des profils manuellement
            $scope.campagne.profileIds = $('#profildrop').val().map(id => parseInt(id));

            // Créer la campagne et voir si tous les champs sont valides
            apiService.createCampagne($scope.campagne).then(
                function (res) {
                    $('#create-campagne-loading').css('display', 'none');
                    swal({text: res.data.message, icon: 'success'})
                        .then(() => {
                            $scope.$parent.setCurrentPage('campagnes');
                            $scope.$parent.$apply();
                        });
                },
                function (err) {
                    $('#create-campagne-loading').css('display', 'none');
                    swal({text: err.data.message, icon: 'error'});
                }
            );
        });

    };

    // Afficher dynamiquement les images selectionnées par les FileInput
    $('#horizontal-file').change(function () {
        // Invalider le lien vers l'image horizontale pour qu'elle soit uploadée
        $scope.campagne.imgHorizontal = '';
        readURL(this, $('#horizontal-img'));
    });

    $('#vertical-file').change(function () {
        // Invalider le lien vers l'image verticale pour qu'elle soit uploadée
        $scope.campagne.imgVertical = '';
        readURL(this, $('#vertical-img'));
    });

    $('#mobile-file').change(function () {
        // Invalider le lien vers l'image mobile pour qu'elle soit uploadée
        $scope.campagne.imgMobile = '';
        readURL(this, $('#mobile-img'));
    });

}]);

//////////////////////////////////////////////////////////////////////////
// Contrôleur pour modifier une campagne
//////////////////////////////////////////////////////////////////////////
app.controller('CampagneModifyController', ['$scope', '$q', 'apiService', function ($scope, $q, apiService) {

    $scope.profilList = [];
    $scope.campagne = getObjetTemplateForCampagne();
    $scope.imgLocal = {hor: '', ver: '', mob: ''};

    $scope.modify = function () {

        // Afficher le loading pendant la tentative de création
        $('#modify-campagne-loading').css('display', 'flex');

        let imgurPromises = [];

        // Ne pas uploader une image si elle a déjà été uploadée
        if ($scope.imgLocal.hor) imgurPromises.push(apiService.uploadToImgur($('#horizontal-file')[0]));
        if ($scope.imgLocal.ver) imgurPromises.push(apiService.uploadToImgur($('#vertical-file')[0]));
        if ($scope.imgLocal.mob) imgurPromises.push(apiService.uploadToImgur($('#mobile-file')[0]));

        // Uploader les images sur imgur
        $q.all(imgurPromises).then((data) => {

            // Mettre à jour les liens des images pour la campagne
            let index = 0;
            if ($scope.imgLocal.hor) {
                $scope.imgLocal.hor = '';
                $scope.campagne.imgHorizontal = data[index++].data.link;
            }
            if ($scope.imgLocal.ver) {
                $scope.imgLocal.ver = '';
                $scope.campagne.imgVertical = data[index++].data.link;
            }
            if ($scope.imgLocal.mob) {
                $scope.imgLocal.mob = '';
                $scope.campagne.imgMobile = data[index].data.link;
            }

            // Aller chercher les ID des profils manuellement
            $scope.campagne.profileIds = $('#profildrop').val().map(id => parseInt(id));

            apiService.modifyCampagne($scope.campagne.id, $scope.campagne).then(
                function (res) {
                    $('#modify-campagne-loading').css('display', 'none');
                    swal({text: res.data.message, icon: 'success'})
                        .then(() => {
                            $scope.$parent.setCurrentPage('campagnes');
                            $scope.$parent.$apply();
                        });
                },
                function (err) {
                    $('#modify-campagne-loading').css('display', 'none');
                    swal({text: err.data.message, icon: 'error'});
                }
            );
        });
    };

    $scope.delete = function () {

        swal({
            text: 'Êtes-vous certain de vouloir supprimer cette campagne?',
            icon: 'warning',
            buttons: ['Annuler', 'Supprimer définitivement']
        }).then(
            function (val) {
                if (!val)
                    return;
                apiService.deleteCampagne($scope.campagne.id).then(
                    function (res) {
                        swal({text: res.data.message, icon: 'success'})
                            .then(() => {
                                $scope.$parent.setCurrentPage('campagnes');
                                $scope.$parent.$apply();
                            });
                    },
                    function (err) {
                        swal({text: err.data.message, icon: 'error'});
                    }
                );
            }
        );
    };

    init();

    function init() {

        if (!$scope.$parent.selectedId)
            return;

        // Récupérer les profils de l'utilisateur
        apiService.getProfilList().then(
            function (res) {
                $scope.profilList = res.data.profiles;
                // TODO Rajouter BL lorsque l'utilisateur n'a pas encore de profils
            },
            function (err) {
                // Do nothing
            }
        );

        // Récupérer les données de la campagne
        apiService.getCampagne($scope.$parent.selectedId).then(
            function (res) {
                $scope.campagne = res.data;
                $scope.campagne.id = $scope.$parent.selectedId;

                // ng-selected not working with materialize dropdown
                // select by hand
                $('#profildrop option').prop('selected', false);
                for (let i = 0; i < $scope.campagne.profileIds.length; i++) {
                    $('#profildrop option[value=' + $scope.campagne.profileIds[i] + ']').prop('selected', true);
                }
                // re-bind the generated select
                $('#profildrop').material_select();

                // select dates manually
                $('#datedebut').val($scope.campagne.startDate).pickadate();
                $('#datefin').val($scope.campagne.endDate).pickadate();
            },
            function (err) {
                swal({text: err.data.message, icon: 'error'});
            }
        );
    }

    // Afficher dynamiquement les images selectionnées par les FileInput
    $('#horizontal-file').change(function () {
        readURL(this, $('#horizontal-img'));
    });

    $('#vertical-file').change(function () {
        readURL(this, $('#vertical-img'));
    });

    $('#mobile-file').change(function () {
        readURL(this, $('#mobile-img'));
    });

}]);

//////////////////////////////////////////////////////////////////////////
// Contrôleur pour afficher les profils
//////////////////////////////////////////////////////////////////////////
app.controller('ProfilsController', ['$scope', 'apiService', function ($scope, apiService) {

    $scope.profilList = [];

    // Récupérer les profils de l'utilisateur
    apiService.getProfilList().then(
        function (res) {
            $scope.profilList = res.data.profiles;
        },
        function (err) {
            // Do nothing for now
        }
    );

    // Gestion des filtres de profils
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

    // Par défaut, trier par date descendante
    $scope.filter = $scope.filters.datedescend;

    // Changer le filtre sélectionné
    $scope.setFilter = function (newFilter) {
        $scope.filter = newFilter;
    };

}]);

//////////////////////////////////////////////////////////////////////////
// Contrôleur pour créer un nouveau profil
//////////////////////////////////////////////////////////////////////////
app.controller('ProfilCreateController', ['$scope', 'apiService', function ($scope, apiService) {

    $scope.profil = getObjectTemplateForProfil();

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
                swal({text: res.data.message, icon: 'success'})
                    .then(() => {
                        $scope.$parent.setCurrentPage('profils');
                        $scope.$parent.$apply();
                    });
            },
            function (err) {
                swal({text: err.data.message, icon: 'error'});
            }
        );
    };

}]);

//////////////////////////////////////////////////////////////////////////
// Contrôleur pour modifier un profil
//////////////////////////////////////////////////////////////////////////
app.controller('ProfilModifyController', ['$scope', 'apiService', function ($scope, apiService) {

    $scope.profil = getObjectTemplateForProfil();

    $scope.modify = function () {

        let data = {
            name: $scope.profil.name,
            description: $scope.profil.description,
            urls: $scope.profil.urls.map(u => u.val)
        };

        apiService.modifyProfil($scope.profil.id, data).then(
            function (res) {
                swal({text: res.data.message, icon: 'success'})
                    .then(() => {
                        $scope.$parent.setCurrentPage('profils');
                        $scope.$parent.$apply();
                    });
            },
            function (err) {
                swal({text: err.data.message, icon: 'error'});
            }
        );

    };

    $scope.delete = function () {

        swal({
            text: 'Êtes-vous certain de vouloir supprimer ce profil?',
            icon: 'warning',
            buttons: ['Annuler', 'Supprimer définitivement']
        }).then(
            function (val) {
                if (!val)
                    return;
                apiService.deleteProfil($scope.profil.id).then(
                    function (res) {
                        swal({text: res.data.message, icon: 'success'})
                            .then(() => {
                                $scope.$parent.setCurrentPage('profils');
                                $scope.$parent.$apply();
                            });
                    },
                    function (err) {
                        swal({text: err.data.message, icon: 'error'});
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

        // Récupérer les données du profil
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

//////////////////////////////////////////////////////////////////////////
// UTILITIES
//////////////////////////////////////////////////////////////////////////
function getObjectTemplateForProfil() {
    return {
        name: '',
        description: '',
        urls: [
            {
                val: ''
            },
        ]
    };
}

function getObjetTemplateForCampagne() {
    return {
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
}
