Ext.define('App.model.SavedMaps', {
    extend: 'Ext.data.Model',
    requires: ['Ext.data.identifier.Uuid'],
    config: {
        fields: [
            {
                name: 'name',
                type: 'string'
            }, {
                name: 'key',
                type: 'string'
            }, {
                name: 'extent',
                type: 'string'
            }, {
                name: 'resolutions',
                type: 'string'
            }, 'done',
            {
                name: 'size',
                type: 'int',
                defaultValue: 0
            }, {
                name: 'date',
                type: 'date'
            }
        ],
        identifier: 'uuid',
        proxy: {
            type: 'localstorage',
            id  : 'savedMapsProxy'
        }
    }
});
