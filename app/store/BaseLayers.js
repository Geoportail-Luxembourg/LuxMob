Ext.define('App.store.BaseLayers', {
    extend: 'Ext.data.Store',
    requires: [
        'App.model.BaseLayers',
        'App.util.Config'
    ],
    config: {
        model: 'App.model.BaseLayers',
        proxy: {
            type: 'jsonp',
            // "sc" (set cookie) is set in the query string if executing in
            // PhoneGap application. This is to be granted access to the web
            // services.
            url: App.util.Config.getWsgiUrl() + 'bglayers' +
                (window.device ? '?sc=' : ''),
            callbackKey: 'cb',
            reader: {
                type: 'json'
            }
        }
    }
});
