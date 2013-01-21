/**
 * Configuration
 */
Ext.define('App.util.Config', {
    singleton: true,

    config: {
        supportedLanguages: ['en', 'de', 'fr'],
        defaultLanguage: 'fr'
    },

    /**
     * @private
     * initializes the configuration
     */
    constructor: function(config) {
        this.initConfig(config);
        return this;
    },

    /**
     * Returns current language setting of browser
     */
    getLanguage: function() {

        var currentLang = (localStorage.getItem('language') || navigator.language || navigator.browserLanguage || navigator.userLanguage || this.defaultLanguage),
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
