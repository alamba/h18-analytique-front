/**
 * @file Gère les interactions aux APIs et la cache des réponses JSON
 */

app.factory('apiService', ['$http', '$q', 'localStorageService', 'SERVER_URL', function ($http, $q, localStorageService, SERVER_URL) {

    const REQUEST_METHODS = {GET: 'GET', POST: 'POST', DELETE: 'DELETE', PUT: 'PUT'};

    //////////////////////////////////////////////////////////////////////////
    // HTTP
    //////////////////////////////////////////////////////////////////////////
    function deferredGET(pathUrl) {

        let deferred = $q.defer();

        $http.get(SERVER_URL + pathUrl).then(function (response) {
            // Success
            deferred.resolve(response);
        }, function (err) {
            // Error
            console.error(err);
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function deferredPOST(pathUrl) {

        let deferred = $q.defer();

        $http.post(SERVER_URL + pathUrl).then(function (response) {
            // Success
            deferred.resolve(response);
        }, function (err) {
            // Error
            console.error(err);
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function queryAPI(endpoint, method, usesCache) {
        if (method === REQUEST_METHODS.GET) {
            if (usesCache) {
                return tryUsingEndpointCache(endpoint);
            } else {
                return deferredGET(endpoint);
            }
        }
        if (method === REQUEST_METHODS.POST) {
            return deferredPOST(endpoint);
        }
    }

    //////////////////////////////////////////////////////////////////////////
    // CACHE
    //////////////////////////////////////////////////////////////////////////
    function tryUsingEndpointCache(endpoint) {

        let endpointCache = getEndpointCache(endpoint);

        if (isValidCache(endpointCache)) {

            return $q.resolve(endpointCache);

        } else {

            let deferred = $q.defer();

            deferredGET(endpoint).then((result) => {
                setEndpointCache(endpoint, result);
                deferred.resolve(result);
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        }
    }

    function getEndpointCache(endpoint) {

        let key = formatEndpoint(endpoint);

        let cache = localStorageService.get(key);

        if (cache != null) {
            cache = JSON.parse(cache);
            cache.cacheExpire = moment(cache.cacheExpire);
        }

        return cache;
    }

    function setEndpointCache(endpoint, result) {

        let key = formatEndpoint(endpoint);

        result.cacheExpire = moment().add(5, 'minutes');

        let cache = JSON.stringify(result);

        localStorageService.set(key, cache);
    }

    function isValidCache(cache) {
        if (cache == null)
            return false;

        return moment().isBefore(cache.cacheExpire);
    }

    function formatEndpoint(endpoint) {
        return 'api-' + endpoint.replace(/\//g, '');
    }

    function _clearCache() {
        localStorageService.clearAll(/^api\-/);
    }

    //////////////////////////////////////////////////////////////////////////
    // API
    //////////////////////////////////////////////////////////////////////////
    let _campagneListShort = function () {
        return queryAPI('/campagneListShort', REQUEST_METHODS.GET, true);
    };

    return {
        clearCache: _clearCache,
        campagneListShort: _campagneListShort
    };
}]);