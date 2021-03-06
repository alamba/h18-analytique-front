/**
 * @file Contient le bootstrap du module Angular et des fonctions globales
 */

//////////////////////////////////////////////////////////////////////////
// AngularJS bootstrap
//////////////////////////////////////////////////////////////////////////
var app = angular.module('squidApp', ['ngAnimate', 'LocalStorageModule']);

//////////////////////////////////////////////////////////////////////////
// Constantes de l'application
//////////////////////////////////////////////////////////////////////////
app.constant('SERVER_URL', 'https://squidsquads-backend-dev.herokuapp.com')
    .constant('AUTH_KEY', 'authorizationSquidSquads')
    .constant('ADMIN_TYPE', {WEB: 'WEB', PUB: 'PUB'})
    .constant('BANNER_SIZES', {
        HOR: {width: 728, height: 90},
        VER: {width: 120, height: 600},
        MOB: {width: 320, height: 100}
    });

//////////////////////////////////////////////////////////////////////////
// Configuration
//////////////////////////////////////////////////////////////////////////
app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

app.run(['authService', function (authService) {
    authService.fillAuthData();
    authService.redirectAccordingly();
}]);

//////////////////////////////////////////////////////////////////////////
// Directives / Templates
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
        link: function () {
            prepMaterializeCss();
        }
    };
}).directive('navAdminWeb', function () {
    return {
        templateUrl: './templates/nav-admin-web-template.html',
        link: function () {
            prepMaterializeCss();
        }
    };
}).directive('footerTemplate', function () {
    return {
        templateUrl: './templates/footer-template.html'
    };
});

//////////////////////////////////////////////////////////////////////////
// jQuery / Fonctions globales
//////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
    prepMaterializeCss();
});

function prepMaterializeCss() {

    // sidebar on mobile
    $('.button-collapse').sideNav();

    // dropdown activation
    $('.dropdown-button').dropdown({belowOrigin: true});

    // re-bind the generated select
    $('select').material_select();

    // collapsible
    $('.collapsible').collapsible();

    // tooltips
    $('.tooltipped').tooltip({delay: 50});

    // pick a date formatting
    $.extend($.fn.pickadate.defaults, {
        format: 'yyyy-mm-dd',
        monthsFull: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        today: 'Aujourd\'hui',
        clear: 'Effacer',
        formatSubmit: 'yyyy-mm-dd'
    });
    $('.datepicker').pickadate();

    // Adjust active labels for form inputs
    if (window.Materialize && window.Materialize.updateTextFields) {
        window.Materialize.updateTextFields();
    }
}

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

function fixForAnimationsGettingStuck() {

    $('.button-collapse').sideNav('hide');

    setTimeout(function () {
        $('.animated-page').each(function () {
            $(this).removeClass('ng-animate ng-enter ng-enter-active')
        });
    }, 400);
}
