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
            type: 'jsonp',
            url: "http://app.geoportail.lu/locationsearch",
            callbackKey: 'cb',
            reader: {
                type: 'json',
                rootProperty: 'results'
            }
        }
    }
});
