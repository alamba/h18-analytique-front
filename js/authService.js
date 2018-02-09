/**
 * @file Gère la connexion de l'utilisateur au système à l'aide du LocalStorage
 */
/*
 Source : https://github.com/attilah/AngularJSAuthentication/blob/master/AngularJSAuthentication.Web/app/services/authService.js
 Consulte : 2016-10-03
 Auteur : attilah@GitHub
 */
app.factory('authService', ['$http', '$q', '$window', 'localStorageService', 'SERVER_URL', 'AUTH_KEY', function ($http, $q, $window, localStorageService, SERVER_URL, AUTH_KEY) {

    let _auth = {
        authenticated: false,
        adminPub: false,
        adminWeb: false,
        accountId: 0,
        displayName: '',
        token: ''
    };

    let _login = function (loginData) {

        let deferred = $q.defer();

        $http.post(SERVER_URL + '/account/login', loginData)
            .then(function (res) {

                // Set session info in auth service object
                _auth.authenticated = res.data.authenticated;
                _auth.adminPub = res.data.adminPub;
                _auth.adminWeb = res.data.adminWeb;
                _auth.displayName = res.data.displayName;
                _auth.accountId = res.data.accountId;
                _auth.token = res.data.token;

                // Set session info in browser local storage
                localStorageService.set(AUTH_KEY, _auth);

                deferred.resolve(res);
            }, function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    };

    let _logout = function () {

        // Clear auth service object
        _auth.authenticated = false;
        _auth.adminPub = false;
        _auth.adminWeb = false;
        _auth.accountId = 0;
        _auth.displayName = '';
        _auth.token = '';

        // Clear local storage
        localStorageService.remove(AUTH_KEY);
        localStorageService.clearAll(/^api\-/);

        // Redirect
        _redirectAccordingly();
    };

    let _fillAuthData = function () {

        // Fill auth service object on site load from local storage
        let authData = localStorageService.get(AUTH_KEY);
        if (authData) {
            _auth = authData;
        }
    };

    let _redirectAccordingly = function () {

        let currentLocation = $window.location.href.split("/").pop();
        if (currentLocation.indexOf("#") !== -1) {
            currentLocation = currentLocation.split("#").shift();
        }

        if (!_auth || !_auth.authenticated) {
            if (currentLocation !== 'connexion.html' && currentLocation !== 'compte_creation.html') {
                $window.location.href = 'connexion.html';
            }
        } else if (_auth.adminPub && currentLocation !== 'publicite.html') {
            $window.location.href = 'publicite.html';
        } else if (_auth.adminWeb && currentLocation !== 'webadmin.html') {
            $window.location.href = 'webadmin.html';
        }
    };

    return {
        login: _login,
        logout: _logout,
        fillAuthData: _fillAuthData,
        redirectAccordingly: _redirectAccordingly
    };

}]);