Ext.define('App.store.MyMaps', {
    extend: 'Ext.data.Store',
    requires: 'App.model.MyMaps',
    config: {
        model: 'App.model.MyMaps',
        proxy: {
            type: 'ajax',
            url: App.main_url + "mymaps",
            reader: {
                type: 'json'
            }
        }
    }
});
