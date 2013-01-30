window.i18n = Ext.i18n.Bundle;
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
        items: [{
            scrollable: true,
            items: [{
                xtype: "toolbar",
                title: i18n.message('mapsettings.title.layers'),
                docked: "top",
                items: [{
                    xtype: "button",
                    text: i18n.message('button.close'),
                    action: "main"
                }]
            }, {
                xtype: 'fieldset',
                margin: 10,
                title: i18n.message('layers.title.baselayer'),
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
                margin: 10,
                xtype: 'fieldset',
                title: i18n.message('layers.title.overlays'),
                items: [{
                    xclass: "App.view.layers.SelectedOverlays"
                }]
            }]
        }]
    }
});
