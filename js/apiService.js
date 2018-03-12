/**
 * @file Gère les interactions aux APIs et la cache des réponses JSON
 */

app.factory('apiService', ['$http', '$q', 'localStorageService', 'SERVER_URL', function ($http, $q, localStorageService, SERVER_URL) {

    //////////////////////////////////////////////////////////////////////////
    // HTTP
    //////////////////////////////////////////////////////////////////////////
    function deferredMETHOD(httpPromise) {

        let deferred = $q.defer();

        httpPromise.then(function (response) {
            // Success
            deferred.resolve(response);
        }, function (err) {
            // Error
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function deferredGET(endpoint) {
        return deferredMETHOD($http.get(SERVER_URL + endpoint));
    }

    function deferredPOST(endpoint, data) {
        return deferredMETHOD($http.post(SERVER_URL + endpoint, data));
    }

    function deferredPUT(endpoint, data) {
        return deferredMETHOD($http.put(SERVER_URL + endpoint, data));
    }

    function deferredDELETE(endpoint) {
        return deferredMETHOD($http.delete(SERVER_URL + endpoint));
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

        result.cacheExpire = moment().add(5, 'minutes');

        let key = formatEndpoint(endpoint);
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
        return postAPI('/account', data);
    };

    let _getAccountBanners = function () {
        return getAPI('/account/banner', true);
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

    // Stats //
    let _statsForBrowsers = function () {
        return getAPI('/stats/browsertypes', true);
    };

    let _statsForVisits = function () {
        return getAPI('/stats/visits', true);
    };

    let _statsForRoyalties = function () {
        return getAPI('/stats/royalty', true);
    };

    //////////////////////////////////////////////////////////////////////////
    // IMGUR
    //////////////////////////////////////////////////////////////////////////

    let _uploadToImgur = function (input) {

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
        getAccountBanners: _getAccountBanners,
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
        // Stats //
        statsForBrowsers: _statsForBrowsers,
        statsForVisits: _statsForVisits,
        statsForRoyalties: _statsForRoyalties,
        // IMGUR //
        uploadToImgur: _uploadToImgur
    };

}]);