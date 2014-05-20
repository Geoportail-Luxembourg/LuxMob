Ext.define('App.store.BaseLayers', {
    extend: 'Ext.data.Store',
    requires: [
        'App.model.BaseLayers',
        'App.util.Config',
        'Ext.data.proxy.JsonP'
    ],
    config: {
        model: 'App.model.BaseLayers',
        proxy: {
            type: 'jsonp',
            url: App.util.Config.getWsgiUrl() + 'bglayers',
            callbackKey: 'cb',
            reader: {
                type: 'json'
            }
        }
    }
});
