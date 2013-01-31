Ext.define('App.model.SavedMaps', {
    extend: 'Ext.data.Model',
    config: {
        fields: ['name', 'key', 'extent'],
        proxy: {
            type: 'localstorage',
            id  : '#savedMapsProxy'
        }
    }
});
