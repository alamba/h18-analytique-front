//////////////////////////////////////////////////////////////////////////
// AngularJS CONFIG
//////////////////////////////////////////////////////////////////////////
var app = angular.module('squidApp', ['ngAnimate']);

//////////////////////////////////////////////////////////////////////////
// CONSTANTS
//////////////////////////////////////////////////////////////////////////
app.constant('SERVER_URL', 'TODEF');

//////////////////////////////////////////////////////////////////////////
// DIRECTIVES / TEMPLATES
//////////////////////////////////////////////////////////////////////////
app.directive('navNotConnected', function () {
    return {
        templateUrl: 'templates/nav-not-connected-template.html',
        scope: {
            activeLink: '@'
        },
        link: function () {
            prepMaterializeCss();
        }
    };
}).directive('navAdminPub', function () {
    return {
        templateUrl: '../templates/nav-admin-pub-template.html',
        link: function () {
            prepMaterializeCss();
        }
    };
}).directive('navAdminWeb', function () {
    return {
        templateUrl: '../templates/nav-admin-web-template.html',
        scope: {
            activeLink: '@'
        },
        link: function () {
            prepMaterializeCss();
        }
    };
}).directive('footerTemplate', function () {
    return {
        templateUrl: '../templates/footer-template.html'
    };
}).directive('footerNotConnectedTemplate', function () {
    return {
        templateUrl: 'templates/footer-template.html'
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
    $('.datepicker').pickadate();

    // Adjust active labels for form inputs
    window.Materialize.updateTextFields();

    // Fix for ng-animate getting stuck
    setTimeout(function () {
        $('.animated-page').each(function () {
            $(this).removeClass('ng-animate ng-enter ng-enter-active')
        });
    }, 400);
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
