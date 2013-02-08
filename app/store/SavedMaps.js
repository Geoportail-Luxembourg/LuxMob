Ext.define('App.store.SavedMaps', {
    extend: 'Ext.data.Store',
    requires: 'App.model.SavedMaps',
    id: 'savedMapsStore',
    config: {
        model: 'App.model.SavedMaps'
    },
    sorters: [
        {
            property: 'date',
            direction: 'DESC'
        }
    ]
});
