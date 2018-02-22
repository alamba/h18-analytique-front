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
app.factory('authInterceptorService', ['$q', '$injector', 'localStorageService', 'AUTH_KEY', function ($q, $injector, localStorageService, AUTH_KEY) {

    let _request = function (request) {

        request.headers = request.headers || {};

        if (request.url === 'https://api.imgur.com/3/image.json')
            return request;

        // Insert "Token" header in every outgoing http request
        let authData = localStorageService.get(AUTH_KEY);
        if (authData) {
            request.headers.Token = authData.token;
        }

        return request;
    };

    let _responseError = function (rejection) {

        // Intercept error code 401 from incoming http response, logout automatically
        if (rejection.status === 401) {
            let authService = $injector.get('authService');
            authService.logout();
        }
        return $q.reject(rejection);
    };

    return {
        'request': _request,
        'responseError': _responseError
    };

}]);