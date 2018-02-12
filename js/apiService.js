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


    function deferredPUT(endpoint, data) {

        let deferred = $q.defer();

        $http.put(SERVER_URL + endpoint, data).then(function (response) {
            // Success
            deferred.resolve(response);
        }, function (err) {
            // Error
            deferred.reject(err);
        });

        return deferred.promise;
    }


    function deferredDELETE(endpoint, data) {

        let deferred = $q.defer();

        $http.delete(SERVER_URL + endpoint).then(function (response) {
            // Success
            deferred.resolve(response);
        }, function (err) {
            // Error
            deferred.reject(err);
        });

        return deferred.promise;
    }


    //////////////////////////////////////////////////////////////////////////
    // HTTP + API + CACHE
    //////////////////////////////////////////////////////////////////////////
    function getAPI(endpoint, usesCache) {
        if (usesCache) {
            return tryUsingEndpointCache(endpoint);
        } else {
            return deferredGET(endpoint);
        }
    }

    function postAPI(endpoint, data) {
        _clearCache();
        return deferredPOST(endpoint, data);
    }

    function putAPI(endpoint, data) {
        _clearCache();
        return deferredPUT(endpoint, data);
    }

    function deleteAPI(endpoint) {
        _clearCache();
        return deferredDELETE(endpoint);
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
    let _createCampagne = function (data) {
        return postAPI('/campagne', data);
    };

    let _getCampagneList = function () {
        return getAPI('/campagne', true);
    };

    let _getCampagne = function (campagneId) {
        return getAPI('/campagne/' + campagneId, true);
    };

    let _modifyCampagne = function (campagneId, data) {
        return putAPI('/campagne/' + campagneId, data);
    };

    let _deleteCampagne = function (campagneId) {
        return deleteAPI('/campagne/' + campagneId);
    };

    // Profil //
    let _createProfil = function (data) {
        return postAPI('/profil', data);
    };

    let _getProfilList = function () {
        return getAPI('/profil', true);
    };

    let _getProfil = function (profilId) {
        return getAPI('/profil/' + profilId, true);
    };

    let _modifyProfil = function (profilId, data) {
        return putAPI('/profil/' + profilId, data);
    };

    let _deleteProfil = function (profilId) {
        return deleteAPI('/profil/' + profilId);
    };

    //////////////////////////////////////////////////////////////////////////
    // IMGUR
    //////////////////////////////////////////////////////////////////////////

    let _uploadImgur = function (input) {

        let deferred = $q.defer();

        let fd = new FormData();
        fd.append('image', input.files[0]);
        fd.append('album', '4oBsU');

        $http({
            method: 'POST',
            url: 'https://api.imgur.com/3/image.json',
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'Authorization': 'Bearer 85ed6c4bb3e7c1140c0cfca84b6b830e323a5e6e'
            },
            data: fd
        }).then(function (response) {
            // Success
            deferred.resolve(response.data);
        }, function (err) {
            // Error
            deferred.reject(err);
        });

        return deferred.promise;
    };

    return {
        // Cache //
        clearCache: _clearCache,
        // Comptes //
        createAccount: _createAccount,
        // Campagnes //
        createCampagne: _createCampagne,
        deleteCampagne: _deleteCampagne,
        getCampagne: _getCampagne,
        getCampagneList: _getCampagneList,
        modifyCampagne: _modifyCampagne,
        // Profils //
        createProfil: _createProfil,
        deleteProfil: _deleteProfil,
        getProfil: _getProfil,
        getProfilList: _getProfilList,
        modifyProfil: _modifyProfil,
        uploadImgur: _uploadImgur
    };

}]);