Ext.define('App.model.SelectedOverlays', {
    extend: 'Ext.data.Model',

    config: {
        fields: [{
            name: 'name'
        }, {
            name: 'exclusion'
        }, {
            name: 'visible',
            type: 'boolean'
        }, {
            name: 'fr'
        }, {
            name: 'en'
        }, {
            name: 'de'
        }, {
            name: 'lu'
        }],
        identifier: 'uuid',
        proxy: {
            type: 'localstorage',
            id: 'selectedOverlays'
        }
    }
});
