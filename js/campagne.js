//////////////////////////////////////////////////////////////////////////
// CONTROLLLERS
//////////////////////////////////////////////////////////////////////////
app.controller('CampagneCreationController', ['$scope', function ($scope) {

    // SCOPE VARIABLES
    $scope.banner = {};

}]).controller('CampagneGestionController', ['$scope', function ($scope) {

    // SCOPE VARIABLES
    $scope.selectedCampagneId = null;
    $scope.selectedCampagne = null;
    $scope.campagnes = [
        {
            id: 0,
            nom: "Souliers pour hommes - Vente Q1-2018",
            url: "https://store.nike.com/ca/en_gb/pw/mens-shoes/7puZoi3",
            profileids: [1, 3],
            datedebut: "2018-01-01",
            datefin: "2018-01-31",
            budget: 5000,
            banner: {
                horizontal: "continental-horizontal.gif",
                vertical: "honda-vertical.gif",
                mobile: "walmart-mobile.gif"
            },
            bannerurl: {
                horizontal: "test/continental-horizontal.gif",
                vertical: "test/honda-vertical.gif",
                mobile: "test/walmart-mobile.png"
            }
        },
        {
            id: 1,
            nom: "Souliers pour femmes - Vente Q1-2018",
            url: "https://store.nike.com/ca/en_gb/pw/womens-shoes/7ptZoi3",
            profileids: [2],
            datedebut: "2018-01-01",
            datefin: "2018-01-31",
            budget: 7000,
            banner: {
                horizontal: "",
                vertical: "",
                mobile: ""
            },
            bannerurl: {
                horizontal: "",
                vertical: "",
                mobile: ""
            }
        },
        {
            id: 2,
            nom: "Vêtements d'hiver pour hommes - Vente Q1-2018",
            url: "https://store.nike.com/ca/en_gb/pw/mens-winter/7puZqnr?ipp=120",
            profileids: [2, 3],
            datedebut: "2018-01-01",
            datefin: "2018-01-31",
            budget: 6000,
            banner: {
                horizontal: "",
                vertical: "",
                mobile: ""
            },
            bannerurl: {
                horizontal: "",
                vertical: "",
                mobile: ""
            }
        },
        {
            id: 3,
            nom: "Vêtements d'hiver pour femmes - Vente Q1-2018",
            url: "https://store.nike.com/ca/en_gb/pw/womens-winter/7ptZqnr",
            profileids: [1, 2],
            datedebut: "2018-01-01",
            datefin: "2018-01-31",
            budget: 12000,
            banner: {
                horizontal: "",
                vertical: "",
                mobile: ""
            },
            bannerurl: {
                horizontal: "",
                vertical: "",
                mobile: ""
            }
        }
    ];

    // SCOPE METHODS
    $scope.updateShownCampagne = function () {

        if (!$scope.selectedCampagneId)
            return;

        // copy object so original is unaffacted
        $scope.selectedCampagne = $.extend(true, {}, $scope.campagnes.find(function (o) {
            return o.id == this.selectedCampagneId;
        }, $scope));

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
    };

}]);

//////////////////////////////////////////////////////////////////////////
// jQuery / GLOBAL FUNCTIONS
//////////////////////////////////////////////////////////////////////////
function readURL(input, img) {

    if (input.files && input.files.length === 0) {
        img.attr('src', '');
    } else if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function (e) {
            img.attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

$("#horizontal-file").change(function () {
    readURL(this, $("#horizontal-img"));
});

$("#vertical-file").change(function () {
    readURL(this, $("#vertical-img"));
});

$("#mobile-file").change(function () {
    readURL(this, $("#mobile-img"));
});
