Ext.define('App.store.Overlays', {
    extend: 'Ext.data.Store',
    requires: 'App.model.Overlays',
    config: {
        model: 'App.model.Overlays',
        proxy: {
            type: 'jsonp',
            // "sc" (set cookie) is set in the query string if executing in
            // PhoneGap application. This is to be granted access to the web
            // services.
            url: App.util.Config.getWsgiUrl() + 'mobile/layers' +
                (window.device ? '?sc=' : ''),
            callbackKey: 'cb',
            reader: {
                type: 'json'
            }
        },
        autoLoad: true
    }
});
