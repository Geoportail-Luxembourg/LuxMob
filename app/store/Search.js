Ext.define('App.store.Search', {
    extend: 'Ext.data.Store',
    requires: 'App.model.Search',
    config: {
        model: 'App.model.Search',
        grouper: {
            groupFn: function(record) {
                return record.get('type');
            },
            sortProperty: 'type'
        },
        proxy: {
            type: 'ajax',
            url: "http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/locationsearch",
            reader: {
                type: 'json',
                rootProperty: 'results'
            }
        }
    }
});
