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
         * The URLs to the background tile service.
         */
        tileUrl: [
            'http://apptile1.geoportail.lu',
            'http://apptile2.geoportail.lu',
            'http://apptile3.geoportail.lu',
            'http://apptile4.geoportail.lu'
        ],

        /**
         * The URL to the WSGI app.
         */
        appUrl: 'http://demo.geoportail.lu/',

        /**
         * The OpenLayers.Map configuration.
         * Set in the constructor, otherwise an infinite recursion occurs
         * when Sencha Touch tried to shallow-copy the object.
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
    }
});
