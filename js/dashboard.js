/**
 * @file Contient le contrôleur du Dashboard (aussi appelé 'Accueil') et gère Chart.js
 */

//////////////////////////////////////////////////////////////////////////
// CONTROLLLERS
//////////////////////////////////////////////////////////////////////////
app.controller('DashboardController', ['$scope', function ($scope) {

    let timeFilters = {
        heures: "1",
        jours: "2",
        mois: "3",
        annee: "4"
    };

    // SCOPE VARIABLES
    $scope.visiteFilter = timeFilters.heures;
    $scope.redevanceFilter = timeFilters.heures;
    $scope.redevanceTotal = "0,00$";

    $scope.data = {
        nbvisites: {
            heures: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                data: [102, 26, 453, 718, 659, 204]
            },
            jours: {
                labels: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
                data: [4520, 8670, 7636, 7984, 9450, 8941, 6345]
            },
            mois: {
                labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
            },
            annee: {}
        },
        navigateurs: {
            labels: ['Chrome', 'IE/Edge', 'Firexfox', 'Safari', 'Opera'],
            data: [
                {x: 'Chrome', y: 77.0},
                {x: 'IE/Edge', y: 3.9},
                {x: 'Firexfox', y: 12.4},
                {x: 'Safari', y: 3.3},
                {x: 'Opera', y: 1.6}
            ]
        },
        redevances: {
            labels: ['Vue non-ciblée', 'Cliquée non-ciblée', 'Vue ciblée', 'Cliquée ciblée'],
            heures: {
                data: [22.00, 104.55, 428.45, 520.80]
            },
            jours: {
                data: [250.80, 300.25, 890.70, 900.50]
            },
            mois: {
                data: [450.80, 630.15, 1330.30, 1900.90]
            },
            annee: {
                data: [1850.80, 2300.25, 5654.30, 8860.85]
            }
        }
    };

    // SCOPE FUNCTIONS
    $scope.visiteFilterChanged = function () {
        setVisiteData();
    };
    $scope.redevanceFilterChanged = function () {
        setRedevanceData();
    };

    // INIT
    setVisiteData();
    setNavigateurData();
    setRedevanceData();

    function setVisiteData() {
        // A changer lorsqu'implementer backend
        let dataset = $scope.data.nbvisites.heures;
        if ($scope.visiteFilter === timeFilters.heures) {
            dataset = $scope.data.nbvisites.heures;
        } else if ($scope.visiteFilter === timeFilters.jours) {
            dataset = $scope.data.nbvisites.jours;
        }
        setData(visiteChart, dataset.labels, dataset.data);
    }

    function setNavigateurData() {
        setData(navigateurChart, $scope.data.navigateurs.labels, $scope.data.navigateurs.data);
    }

    function setRedevanceData() {
        let dataset = {};
        if ($scope.redevanceFilter === timeFilters.heures) {
            dataset = $scope.data.redevances.heures.data;
        } else if ($scope.redevanceFilter === timeFilters.jours) {
            dataset = $scope.data.redevances.jours.data;
        } else if ($scope.redevanceFilter === timeFilters.mois) {
            dataset = $scope.data.redevances.mois.data;
        } else if ($scope.redevanceFilter === timeFilters.annee) {
            dataset = $scope.data.redevances.annee.data;
        }

        $scope.redevanceTotal = dataset.reduce((a, b) => a + b, 0).toFixed(2) + ' $';

        setData(redevanceChart, $scope.data.redevances.labels, dataset);
    }

}]);

function setData(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets.forEach((dataset) => {
        dataset.data = data;
    });
    chart.update();
}

//////////////////////////////////////////////////////////////////////////
// CHART.JS
//////////////////////////////////////////////////////////////////////////
Chart.defaults.scale.ticks.beginAtZero = true;
Chart.defaults.global.defaultFontColor = "#FFFFFF";


let visiteCtx = $("#visiteChart");
let navigateurCtx = $("#navigateurChart");
let redevanceCtx = $("#redevanceChart");

let visiteChart = new Chart(visiteCtx, {
    type: 'line',
    data: {
        datasets: [{
            label: ' Visites',
            backgroundColor: 'rgba(255, 255, 225, 0.2)',
            borderColor: 'rgba(255, 255, 255, 1)',
            borderWidth: 2,
            cubicInterpolationMode: 'monotone',
            pointBackgroundColor: '#00bcd4',
            pointRadius: 4
        }]
    },
    options: {
        legend: {
            display: false
        },
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

let navigateurChart = new Chart(navigateurCtx, {
    type: 'bar',
    data: {
        datasets: [{
            label: '%',
            backgroundColor: 'rgba(255, 255, 225, 0.2)',
            borderColor: 'rgba(255, 255, 255, 1)',
            borderWidth: 2,
            hoverBackgroundColor: 'rgba(255, 255, 225, 0.4)'
        }]
    },
    options: {
        legend: {
            display: false
        },
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

let redevanceChart = new Chart(redevanceCtx, {
    type: 'doughnut',
    data: {
        datasets: [{
            backgroundColor: ['#009688', '#00bcd4', '#ff5722', '#f44336'],
            borderWidth: 2,
            hoverBackgroundColor: ['#4db6ac', '#4dd0e1', '#ff8a65', '#e57373']
        }]
    },
    options: {
        animation: {
            animateRotate: true
        },
        cutoutPercentage: 75,
        legend: {
            display: true,
            labels: {
                fontColor: '#000000'
            }
        },
        tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
                label: function (tooltipItem, data) {
                    let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return '  ' + value + ' $';
                }
            }
        }
    }
});
