/**
 * @file Intercepteur des requêtes HTTP entrantes et sortantes
 */
/*
 Source : https://github.com/attilah/AngularJSAuthentication/blob/master/AngularJSAuthentication.Web/app/services/authInterceptorService.js
 Consulte : 2016-10-03
 Auteur : attilah@GitHub
 */
/*
 Cet intercepteur permet de modifier les requêtes et les réponses HTTP.
 Pour les requêtes sortantes, le service tente d'ajouter le token d'autorisation dans le header 'Authorization'.
 Pour les réponses, il n'intervient qu'avec le code HTTP 401, qui signifie que le token est expiré ou invalide.
 */
app.factory('authInterceptorService', ['$q', '$injector', '$location', 'localStorageService', 'AUTH_KEY', function ($q, $injector, $location, localStorageService, AUTH_KEY) {

    let authInterceptorServiceFactory = {};

    let _request = function (config) {

        config.headers = config.headers || {};

        // Insert "Token" header in every outgoing http request
        let authData = localStorageService.get(AUTH_KEY);
        if (authData) {
            config.headers.Token = authData.token;
        }

        return config;
    };

    let _responseError = function (rejection) {

        // Intercept error code 401 from incoming http response, logout automatically
        if (rejection.status === 401) {
            let authService = $injector.get('authService');
            authService.logout();
            $location.path('/index.html');
        }
        return $q.reject(rejection);
    };

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
}]);