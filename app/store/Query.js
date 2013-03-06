Ext.define('App.store.Query', {
    extend: 'Ext.data.Store',
    requires: 'App.model.Query',
    config: {
        model: 'App.model.Query',
        proxy: {
            type: 'jsonp',
            url : "http://app.geoportail.lu/bodfeature/search",
            callbackKey: 'cb',
            reader: {
                type: 'json',
                rootProperty: 'features'
            }
        }
    }
});
