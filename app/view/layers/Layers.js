Ext.define('App.view.layers.Layers', {
    extend: 'Ext.Panel',
    requires: [
        'Ext.form.FieldSet',
        'App.view.layers.SelectedOverlays'
    ],

    id: "layersView",
    config: {
        layout: 'card',
        activeItem: 0,
        margin: 10,
        items: [{
            scrollable: true,
            items: [{
                xtype: 'fieldset',
                title: "Fond",
                items: [{
                    xtype: "button",
                    id: "baseLayerButton",
                    action: "baseLayers",
                    text: " ",
                    iconCls: "code3",
                    iconMask: true,
                    iconAlign: "right"
                }]
            }, {
                xtype: 'fieldset',
                title: "Couches de données",
                items: [{
                    xclass: "App.view.layers.SelectedOverlays"
                }]
            }]
        }]
    }
});
