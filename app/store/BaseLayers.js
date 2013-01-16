Ext.define('App.store.BaseLayers', {
    extend: 'Ext.data.Store',
    requires: 'App.model.BaseLayers',
    config: {
        model: 'App.model.BaseLayers'
    }
});
