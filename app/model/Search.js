Ext.define('App.model.Search', {
    extend: 'Ext.data.Model',

    config: {
        fields: [{
            name: 'label'
        }, {
            name: 'listlabel'
        }, {
            name: 'type'
        }, {
            name: 'bbox'
        }]
    }
});
