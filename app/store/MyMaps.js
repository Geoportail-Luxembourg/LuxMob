Ext.define('App.store.MyMaps', {
    extend: 'Ext.data.Store',
    requires: [
        'App.model.MyMaps',
        'App.util.Config'
    ],
    config: {
        model: 'App.model.MyMaps',
        proxy: {
            type: 'ajax',
            url: App.util.Config.getWsgiUrl() + "mymaps",
            reader: {
                type: 'json'
            }
        }
    }
});
