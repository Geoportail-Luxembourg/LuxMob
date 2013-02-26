Ext.define('App.store.MyMaps', {
    extend: 'Ext.data.Store',
    requires: 'App.model.MyMaps',
    config: {
        model: 'App.model.MyMaps',
        proxy: {
            type: 'ajax',
            url: "http://maps.geoportail.lu/mymaps",
            reader: {
                type: 'json'
            }
        }
    }
});
