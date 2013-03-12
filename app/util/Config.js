/**
 * Configuration
 */
Ext.define('App.util.Config', {
    singleton: true,

    config: {

        /**
         * The languages supported by the application.
         */
        supportedLanguages: ['en', 'de', 'fr'],

        /**
         * The default language to use if there's no language detected.
         */
        defaultLanguage: 'fr',

        /**
         * The URL to the WMS service (MapProxy) to use in the native app.
         * (FIXME: http://app.geoportail.lu/mapproxy/service is to be used in
         * production.)
         */
        appOverlayUrl: 'http://demo.geoportail.lu/mapproxy/service',

        /**
         * The URL to the WMS service (MapProxy) to use in the native app.
         * (FIXME: http://api.geoportail.lu/mapproxy/service is to be used in
         * production.)
         */
        webOverlayUrl: 'http://demo.geoportail.lu/mapproxy/service',

        /**
         * The URLs to the tile service to use in the native app.
         */
        appTileUrl: [
            'http://apptile1.geoportail.lu',
            'http://apptile2.geoportail.lu',
            'http://apptile3.geoportail.lu',
            'http://apptile4.geoportail.lu'
        ],

        /**
         * The URLs to the tile service to use in the native app.
         */
        webTileUrl: [
            'http://tile1.geoportail.lu',
            'http://tile2.geoportail.lu',
            'http://tile3.geoportail.lu',
            'http://tile4.geoportail.lu'
        ],

        /**
         * The URL to tbe WSGI app to use in the native app.
         * (FIXME: http://app.geoportail.lu/ is to be used in production.)
         */
        appWsgiUrl: 'http://demo.geoportail.lu/',

        /**
         * The URL to the WSGI app to use in the web app.
         * (FIXME: http://api.geoportail.lu/ is to be used in production.)
         */
        webWsgiUrl: 'http://demo.geoportail.lu/',

        /**
         * The OpenLayers.Map configuration.
         * Set in the constructor, otherwise an infinite recursion occurs
         * when Sencha Touch tries to shallow-copy the config object.
         */
        mapConfig: null

    },

    /**
     * @private
     * initializes the configuration
     */
    constructor: function(config) {
        this.initConfig(config);
        this.setMapConfig({
            theme: null,
            projection: new OpenLayers.Projection("EPSG:2169"),
            displayProjection: new OpenLayers.Projection("EPSG:2169"),
            units: "m",
            maxExtent: OpenLayers.Bounds.fromArray([48000,57000,107000,139000]),
            restrictedExtent: OpenLayers.Bounds.fromArray(
                    [40000,50000,120000,150000]),
            resolutions: [500.0, 250.0, 150.0, 100.0, 50.0,
                          20.0, 10.0, 5.0, 2.0, 1.0, 0.5],
            controls: [
                new OpenLayers.Control.TouchNavigation({
                    dragPanOptions: {
                        interval: 1,
                        enableKinetic: true
                    }
                }),
                new OpenLayers.Control.ScaleLine()
            ],
            layers: [],
            fallThrough: true
        });
        return this;
    },

    /**
     * Returns current language setting of browser
     */
    getLanguage: function() {
        var currentLang = (localStorage.getItem('language') || navigator.language ||
                           navigator.browserLanguage || navigator.userLanguage ||
                           this.defaultLanguage),
            supportedLanguages = this.getSupportedLanguages(),
            langLen = supportedLanguages.length,
            i;
       currentLang = currentLang.substring(0, 2).toLowerCase();
       for(i = 0; i < langLen; i++) {
           if (supportedLanguages[i] === currentLang) {
               return currentLang;
           }
       }
       return this.getDefaultLanguage();
    },

    /**
     * Get URL to the WMS service.
     */
    getOverlayUrl: function() {
        return this.isNativeApp() ?
            this.getAppOverlayUrl() : this.getWebOverlayUrl();
    },

    /**
     * Get URL to the tile service.
     */
    getTileUrl: function() {
        return this.isNativeApp() ? this.getAppTileUrl() : this.getWebTileUrl();
    },

    /**
     * Get URL to the WSGI app.
     */
    getWsgiUrl: function() {
        return this.isNativeApp() ? this.getAppWsgiUrl() : this.getWebWsgiUrl();
    },

    /**
     * Returns true if native PhoneGap app, false otherwise.
     */
    isNativeApp: function() {
        return !!window.device;
    }
});
