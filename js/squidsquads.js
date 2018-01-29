//////////////////////////////////////////////////////////////////////////
// AngularJS CONFIG
//////////////////////////////////////////////////////////////////////////
var app = angular.module('squidApp', []);

//////////////////////////////////////////////////////////////////////////
// DIRECTIVES / TEMPLATES
//////////////////////////////////////////////////////////////////////////
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
}).directive('navAdminWeb', function () {
    return {
        templateUrl: './templates/nav-admin-web-template.html',
        scope: {
            activeLink: '@'
        },
        link: function () {
            prepMaterializeCss();
        }
    };
}).directive('footerTemplate', function () {
    return {
        templateUrl: './templates/footer-template.html'
    };
}).directive('campaignTemplate', function () {
    return {
        templateUrl: './templates/campaign-template.html',
        scope: {
            campagne: '=campagneInfo'
        },
        link: function () {
            prepMaterializeCss();
        }
    };
});

//////////////////////////////////////////////////////////////////////////
// jQuery / GLOBAL FUNCTIONS
//////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
    prepMaterializeCss();
});

function prepMaterializeCss() {

    // re-bind the generated select
    $('select').material_select();

    // sidebar on mobile
    $('.button-collapse').sideNav();

    // dropdown activation
    $('.dropdown-button').dropdown({belowOrigin: true});

    // collapsible
    $('.collapsible').collapsible();

    // pick a date formatting
    $.extend($.fn.pickadate.defaults, {
        format: 'yyyy-mm-dd',
        monthsFull: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        today: 'Aujourd\'hui',
        clear: 'Effacer',
        formatSubmit: 'yyyy-mm-dd'
    });
}
