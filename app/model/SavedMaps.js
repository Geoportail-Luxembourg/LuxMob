Ext.define('App.model.SavedMaps', {
    extend: 'Ext.data.Model',
    config: {
        fields: ['name', 'key', 'extent', 'done'],
        identifier: 'uuid',
        proxy: {
            type: 'localstorage',
            id  : 'savedMapsProxy'
        }
    }
});
