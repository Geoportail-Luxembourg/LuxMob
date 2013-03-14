Ext.define('App.store.Overlays', {
    extend: 'Ext.data.Store',
    requires: 'App.model.Overlays',
    config: {
        model: 'App.model.Overlays',
        proxy: {
            type: 'ajax',
            url: 'http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/mobile/layers',
            reader: {
                type: 'json'
            }
        },
        autoLoad: true
    }
});
