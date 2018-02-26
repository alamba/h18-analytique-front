/**
 * Analytique et Publicite - GTI525 - H18
 *
 * Ce fichier a pour but de collecter des statistiques de base sur les visiteurs de ce site.
 */
document.addEventListener('DOMContentLoaded', function (event) {

    const SQUIDSQUADS_SERVER = "https://squidsquads-backend-dev.herokuapp.com";

    // Start sequence
    initAnalytics();

    //////////////////////////////////////////////////////////////////////////
    // Analytics
    //////////////////////////////////////////////////////////////////////////

    function initAnalytics() {

        // Get the user ID
        let userId = getMetaContentForTagName('squidsquads-user-id');

        // If no user ID, no tracking and no publicity
        if (!userId) return;

        // Check for existing cookie
        let cookie = getCookie();

        if (cookie) {
            // If cookie exists, track visit
            trackVisit(userId);
        } else {
            // If not, ask server to create one
            createCookie(userId);
        }
    }

    function trackVisit(userId) {

        let xhr = new XMLHttpRequest();
        xhr.open('GET', SQUIDSQUADS_SERVER + '/visit?userid=' + userId, true);
        xhr.withCredentials = true;

        xhr.onload = function () {
            // Continue sequence flow
            initPublicity();
        };

        xhr.send(null);
    }

    function createCookie(userId) {

        let xhr = new XMLHttpRequest();
        xhr.open('POST', SQUIDSQUADS_SERVER + '/visit', true);
        xhr.withCredentials = true;

        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                let fingerprint = response.fingerprint;
                // TODO Add logic if cookies are blocked by visitor, use different storage

                // Continue sequence flow
                initPublicity();
            }
        };

        let visitorFingerprint = getVisitorFingerprint();
        visitorFingerprint.userId = userId;

        xhr.send(JSON.stringify(visitorFingerprint));
    }

    function getVisitorFingerprint() {
        return {
            // Canvas fingerprint
            canvasFingerprint: getCanvasFingerprint(),
            // Cookie enabled
            cookieEnabled: window.navigator.cookieEnabled,
            // Do not track
            doNotTrack: isDoNotTrack(),
            // Screen size
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            // Timezone
            timezone: getTimezone()
        };
    }

    //////////////////////////////////////////////////////////////////////////
    // Publicity
    //////////////////////////////////////////////////////////////////////////

    function initPublicity() {

        // Get the user ID
        let userId = getMetaContentForTagName('squidsquads-user-id');

        // If no user ID, no publicity
        if (!userId) return;

        // Horizontal banner
        handleBanner('hor');

        // Vertical banner
        handleBanner('ver');

        // Mobile banner
        handleBanner('mob');
    }

    function handleBanner(orientation) {

        // Get the banner ID
        let bannerId = getMetaContentForTagName('squidsquads-banner-' + orientation);

        // If no banner ID, no publicity for this type of banner
        if (!bannerId) return;

        // Get the img for this banner
        let img = document.getElementById('squidsquads-img-' + orientation);

        // If no img, no publicity for this type of banner
        if (!img) return;

        // Get a publicity from the server and display
        getAndDisplayPublicity(bannerId, img);
    }

    function getAndDisplayPublicity(bannerId, img) {

        let xhr = new XMLHttpRequest();
        xhr.open('GET', SQUIDSQUADS_SERVER + '/banner/' + bannerId, true);
        xhr.withCredentials = true;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                img.style.cursor = 'pointer';
                img.src = response.src;
                img.alt = response.alt;
                img.onclick = function () {
                    window.location.href = response.redirectUrl;
                };
            }
        };

        xhr.send(null);
    }

    //////////////////////////////////////////////////////////////////////////
    // Utilities
    //////////////////////////////////////////////////////////////////////////

    /**
     * Try to find existing cookie for this visitor
     *
     * @returns {string|null}
     */
    function getCookie() {
        let value = '; ' + document.cookie;
        let parts = value.split('; _squidsquads=');
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
    }

    /**
     * Try to find meta tag for specified name
     *
     * @param name
     * @returns {string|null}
     */
    function getMetaContentForTagName(name) {
        let _meta = document.querySelector("meta[name='" + name + "']");
        return _meta ? _meta.getAttribute('content') : null;
    }

    /**
     * Check if the visitor has requested not be tracked by web sites, content, or advertising
     *
     * @returns {boolean}
     */
    function isDoNotTrack() {
        return window.navigator.doNotTrack === '1' || window.navigator.doNotTrack === 'yes';
    }

    /**
     * Get the visitor's timezone using the ECMAScript Internationalization API
     * (null if not supported)
     *
     * @returns {string|null}
     */
    function getTimezone() {
        let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return tz ? tz : null;
    }

    /**
     * Create a 99% unique canvas fingerprint for the visitor
     * Based on : https://www.browserleaks.com/canvas
     *
     * @returns {string}
     */
    function getCanvasFingerprint() {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let txt = 'SquidSquAds,site <canvas> 1.0';
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText(txt, 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText(txt, 4, 17);
        let b64 = canvas.toDataURL().replace('data:image/png;base64,', '');
        let bin = atob(b64).slice(-16, -12);
        let hex = '';
        for (let i = 0; i < bin.length; i++) {
            let _hex = bin.charCodeAt(i).toString(16);
            hex += (_hex.length === 2 ? _hex : '0' + _hex);
        }
        return hex.toUpperCase();
    }
});