/**
 * @file Gère la connexion de l'utilisateur au système à l'aide du LocalStorage
 */
/*
 Source : https://github.com/attilah/AngularJSAuthentication/blob/master/AngularJSAuthentication.Web/app/services/authService.js
 Consulte : 2016-10-03
 Auteur : attilah@GitHub
 */
app.factory('authService', ['$http', '$q', 'localStorageService', 'SERVER_URL', 'AUTH_KEY', function ($http, $q, localStorageService, SERVER_URL, AUTH_KEY) {

    let authServiceFactory = {};

    let _authentication = {
        isAuth: false,
        isAdminPub: false,
        isAdminWeb: false,
        displayName: ''
    };

    let _login = function (loginData) {

        let deferred = $q.defer();

        $http({
            method: 'POST',
            url: SERVER_URL + '/account/login',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            data: JSON.stringify(loginData)
        }).then(function (response) {
            response.data = JSON.parse(response.data);

            // Set session info in browser local storage
            localStorageService.set(AUTH_KEY, {
                token: response.data.token,
                displayName: response.data.displayName,
                isAdminPub: response.data.isAdminPub,
                isAdminWeb: response.data.isAdminWeb
            });

            // Set session info in auth service object
            _authentication.isAuth = true;
            _authentication.isAdminPub = response.data.isAdminPub;
            _authentication.isAdminWeb = response.data.isAdminWeb;
            _authentication.displayName = response.data.displayName;

            deferred.resolve(response);
        }, function (err) {
            _logout();
            deferred.reject(err);
        });

        return deferred.promise;
    };

    let _logout = function () {

        // Clear auth service object
        _authentication.isAuth = false;
        _authentication.isAdminPub = false;
        _authentication.isAdminWeb = false;
        _authentication.displayName = '';
        // Clear local storage
        localStorageService.remove(AUTH_KEY);
    };

    let _register = function (registerData, isEtudiant) {

        _logout();
        let deferred = $q.defer();
        // Register type
        let registerType = isEtudiant ? 'Etudiant' : 'Gestionnaire';

        $http({
            method: 'POST',
            url: SERVER_URL + '/Api/Account/Register' + registerType,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            data: JSON.stringify(registerData)
        }).then(function (response) {
            deferred.resolve(response);
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    let _fillAuthData = function () {

        // Fill auth service object on site load from local storage
        // TODO - Check if session has expired
        var authData = localStorageService.get(AUTH_KEY);
        if (authData) {
            _authentication.isAuth = true;
            _authentication.isAdminPub = authData.isAdminPub;
            _authentication.isAdminWeb = authData.isAdminWeb;
            _authentication.displayName = authData.displayName;
        }
    };

    authServiceFactory.login = _login;
    authServiceFactory.logout = _logout;
    authServiceFactory.register = _register;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.authentication = _authentication;

    return authServiceFactory;
}]);