Ext.define('App.store.MyMaps', {
    extend: 'Ext.data.Store',
    requires: 'App.model.MyMaps',
    config: {
        model: 'App.model.MyMaps',
        proxy: {
            type: 'ajax',
            url: "http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/mymaps",
            reader: {
                type: 'json'
            }
        }
    }
});
