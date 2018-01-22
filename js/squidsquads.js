$(document).ready(function () {

    $('select').material_select();

    // Activer le side nav
    $(".button-collapse").sideNav();

    // Activer les dropdowns
    $(".dropdown-button").dropdown({belowOrigin: true});

    $('.datepicker').pickadate({
        format: 'yyyy/mm/dd',
        monthsFull: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        today: 'Aujourd\'hui',
        clear: 'Effacer',
        formatSubmit: 'yyyy/mm/dd'
    });
});