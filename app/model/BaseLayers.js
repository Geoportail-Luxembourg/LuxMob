Ext.define('App.model.BaseLayers', {
    extend: 'Ext.data.Model',

    config: {
        fields: [{
            name: 'name'
        }, {
            name: 'layername'
        }, {
            name: 'format'
        }, {
            name: 'bbox'
        }, {
            name: 'exclusion'
        }, {
            name: 'fr'
        }, {
            name: 'en'
        }, {
            name: 'de'
        }, {
            name: 'lb'
        }]
    }
});
