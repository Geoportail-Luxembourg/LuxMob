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
                name: 'resolutions'
            }, 'done',
            {
                name: 'size',
                type: 'int',
                defaultValue: 0
            }, {
                name: 'date',
                type: 'date'
            },{
                name: 'tiles'
            }
        ],
        identifier: 'uuid',
        proxy: {
            type: 'localstorage',
            id  : 'savedMapsProxy'
        }
    }
});
