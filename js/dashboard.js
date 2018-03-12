/**
 * @file Contient le contrôleur du Dashboard (aussi appelé 'Accueil') et gère Chart.js
 */

//////////////////////////////////////////////////////////////////////////
// Contrôleur pour afficher les graphiques
//////////////////////////////////////////////////////////////////////////
app.controller('DashboardController', ['$scope', 'apiService', function ($scope, apiService) {

    const timeFilters = {
        heures: '1',
        jours: '2',
        mois: '3',
        annee: '4'
    };

    $scope.visiteFilter = timeFilters.heures;
    $scope.redevanceFilter = timeFilters.heures;
    $scope.redevanceTotal = '0,00$';

    $scope.data = {
        nbvisites: {
            heures: {
                labels: [],
                data: []
            },
            jours: {
                labels: [],
                data: []
            },
            mois: {
                labels: [],
                data: []
            },
            annee: {
                labels: [],
                data: []
            }
        },
        navigateurs: {
            labels: [],
            data: []
        },
        redevances: {
            labels: ['Vue non-ciblée', 'Cliquée non-ciblée', 'Vue ciblée', 'Cliquée ciblée'],
            heures: {
                data: []
            },
            jours: {
                data: []
            },
            mois: {
                data: []
            },
            annee: {
                data: []
            }
        }
    };

    // Récupérer les statistiques des navigateurs
    apiService.statsForBrowsers().then(
        function (res) {
            let browserStats = res.data.browserStats;

            if (browserStats && browserStats.length) {
                $scope.data.navigateurs.labels = browserStats.map(b => b.name);
                $scope.data.navigateurs.data = browserStats.map(b => {
                    return {x: b.name, y: (b.ratio * 100.0).toFixed(1)};
                });

                setNavigateurData();
            }
        },
        function (err) {
            // Do nothing
        }
    );

    // Récupérer les statistiques des visites
    apiService.statsForVisits().then(
        function (res) {
            let visitStats = res.data;

            if (visitStats) {
                // Dernières 24h
                $scope.data.nbvisites.heures.labels = visitStats.for24hList.map(v => v.timeOfDay);
                $scope.data.nbvisites.heures.data = visitStats.for24hList.map(v => v.amount);

                // Derniers 7 jours
                $scope.data.nbvisites.jours.labels = visitStats.forWeekList.map(v => v.dayOfweek);
                $scope.data.nbvisites.jours.data = visitStats.forWeekList.map(v => v.amount);

                // Dernier mois
                $scope.data.nbvisites.mois.labels = visitStats.forMonthList.map(v => v.day + ' ' + v.month);
                $scope.data.nbvisites.mois.data = visitStats.forMonthList.map(v => v.amount);

                // Dernière année
                $scope.data.nbvisites.annee.labels = visitStats.forYearList.map(v => v.month);
                $scope.data.nbvisites.annee.data = visitStats.forYearList.map(v => v.amount);

                setVisiteData();
            }
        },
        function (err) {
            // Do nothing
        }
    );

    // Récupérer les statistiques des revenus
    apiService.statsForRoyalties().then(
        function (res) {
            let royaltyStats = res.data.royaltyStats;

            if (royaltyStats && royaltyStats.length) {

                for (let i = 0; i < royaltyStats.length; i++) {

                    let rs = royaltyStats[i];
                    let data = [rs.sommeVue, rs.sommeClique, rs.sommeCible, rs.sommeCibleClique];

                    if (rs.period === 'daily') {
                        $scope.data.redevances.heures.data = data;
                    } else if (rs.period === 'weekly') {
                        $scope.data.redevances.jours.data = data;
                    } else if (rs.period === 'monthly') {
                        $scope.data.redevances.mois.data = data;
                    } else if (rs.period === 'annually') {
                        $scope.data.redevances.annee.data = data;
                    }
                }

                setRedevanceData();
            }
        },
        function (err) {
            // Do nothing
        }
    );

    $scope.visiteFilterChanged = function () {
        setVisiteData();
    };
    $scope.redevanceFilterChanged = function () {
        setRedevanceData();
    };

    function setVisiteData() {
        // A changer lorsqu'implementer backend
        let dataset = $scope.data.nbvisites.heures;
        if ($scope.visiteFilter === timeFilters.heures) {
            dataset = $scope.data.nbvisites.heures;
        } else if ($scope.visiteFilter === timeFilters.jours) {
            dataset = $scope.data.nbvisites.jours;
        } else if ($scope.visiteFilter === timeFilters.mois) {
            dataset = $scope.data.nbvisites.mois;
        } else if ($scope.visiteFilter === timeFilters.annee) {
            dataset = $scope.data.nbvisites.annee;
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
// ChartJS
//////////////////////////////////////////////////////////////////////////
Chart.defaults.scale.ticks.beginAtZero = true;
Chart.defaults.global.defaultFontColor = '#FFFFFF';


let visiteCtx = $('#visiteChart');
let navigateurCtx = $('#navigateurChart');
let redevanceCtx = $('#redevanceChart');

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
        },
        tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
                label: function (tooltipItem, data) {
                    let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].y;
                    return '  ' + value + ' %';
                }
            }
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
