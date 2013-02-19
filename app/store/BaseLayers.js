Ext.define('App.store.BaseLayers', {
    extend: 'Ext.data.Store',
    requires: 'App.model.BaseLayers',
    config: {
        model: 'App.model.BaseLayers',
        proxy: {
            type: 'ajax',
            url: "http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/bglayers",
            reader: {
                type: 'json'
            }
        }
    }
});
