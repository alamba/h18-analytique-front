/**
 * @file Gère les interactions aux APIs et la cache des réponses JSON
 */

app.factory('apiService', ['$http', '$q', 'localStorageService', 'SERVER_URL', function ($http, $q, localStorageService, SERVER_URL) {

    //////////////////////////////////////////////////////////////////////////
    // HTTP
    //////////////////////////////////////////////////////////////////////////
    function deferredGET(endpoint) {

        let deferred = $q.defer();

        $http.get(SERVER_URL + endpoint).then(function (response) {
            // Success
            deferred.resolve(response);
        }, function (err) {
            // Error
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function deferredPOST(endpoint, data) {

        let deferred = $q.defer();

        $http.post(SERVER_URL + endpoint, data).then(function (response) {
            // Success
            deferred.resolve(response);
        }, function (err) {
            // Error
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function getAPI(endpoint, method, usesCache) {
        if (usesCache) {
            return tryUsingEndpointCache(endpoint);
        } else {
            return deferredGET(endpoint);
        }
    }

    function postAPI(endpoint, data) {
        return deferredPOST(endpoint, data);
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

    // Comptes //
    let _createAccount = function (data) {
        return postAPI('/account/create', data);
    };

    // Campagnes //
    let _getCampagne = function () {
        return getAPI('/campagne', true);
    };

    return {
        // Cache //
        clearCache: _clearCache,
        // Comptes //
        createAccount: _createAccount,
        // Campagnes //
        getCampagne: _getCampagne
    };

}]);