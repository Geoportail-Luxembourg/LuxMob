Ext.define('App.view.layers.Layers', {
    extend: 'Ext.Panel',
    requires: ['Ext.form.FieldSet'],

    id: "layers",
    config: {
        layout: 'card',
        activeItem: 0,
        margin: 10,
        items: [{
            items: [{
                xtype: 'fieldset',
                title: "Fond",
                items: [{
                    xtype: "button",
                    id: "baseLayerButton",
                    action: "baseLayers",
                    text: "Carte topographique",
                    iconCls: "code3",
                    iconMask: true,
                    ui: "plain",
                    iconAlign: "right"
                }]
            }, {
                xtype: 'fieldset',
                title: "Couches de données",
                items: [{
                    html: "the layers"
                }]
            }]
        }]
    }
});
