var app = angular.module('squidApp', []);

// Templates
app.directive('navNotConnected', function () {
    return {
        templateUrl: './templates/nav-not-connected-template.html',
        scope: {
            activeLink: '@'
        },
        link: function () {
            prepMaterializeCss();
        }
    };
}).directive('navAdminPub', function () {
    return {
        templateUrl: './templates/nav-admin-pub-template.html',
        scope: {
            activeLink: '@'
        },
        link: function () {
            prepMaterializeCss();
        }
    };
});


$(document).ready(function () {
    prepMaterializeCss();
});

function prepMaterializeCss() {

    // Dropdown material styling
    $('select').material_select();

    // Sidebar on mobile
    $(".button-collapse").sideNav();

    // Dropdown activation
    $(".dropdown-button").dropdown({belowOrigin: true});

    // Pick a date formatting
    $('.datepicker').pickadate({
        format: 'yyyy/mm/dd',
        monthsFull: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        today: 'Aujourd\'hui',
        clear: 'Effacer',
        formatSubmit: 'yyyy/mm/dd'
    });
}
