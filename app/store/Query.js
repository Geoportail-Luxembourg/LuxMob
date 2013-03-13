Ext.define('App.store.Query', {
    extend: 'Ext.data.Store',
    requires: [
        'App.model.Query',
        'App.util.Config'
    ],
    config: {
        model: 'App.model.Query',
        proxy: {
            type: 'jsonp',
            url: App.util.Config.getWsgiUrl() + 'bodfeature/search',
            callbackKey: 'cb',
            reader: {
                type: 'json',
                rootProperty: 'features'
            }
        }
    }
});
