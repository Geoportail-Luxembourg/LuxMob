Ext.define('App.view.layers.Layers', {
    extend: 'Ext.Panel',
    requires: ['Ext.form.FieldSet'],

    id: "layers",
    config: {
        items: [{
            xtype: 'fieldset',
            title: "Fond",
            items: [{
                html: "the layers"
            }]
        }, {
            xtype: 'fieldset',
            title: "Couches de données",
            items: [{
                html: "the layers"
            }]
        }]
    }
});
