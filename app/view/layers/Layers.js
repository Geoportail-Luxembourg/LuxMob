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
        margin: 10,
        items: [{
            scrollable: true,
            items: [{
                xtype: 'fieldset',
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
                xtype: 'fieldset',
                title: i18n.message('layers.title.overlays'),
                items: [{
                    xclass: "App.view.layers.SelectedOverlays"
                }]
            }, {
                    xtype: 'button',
                    docked: 'bottom',
                    action: 'download',
                    cls: "download",
                    iconCls: "cloud_download",
                    text: "Télécharger cette carte",
                    iconMask: true
            }]
        }]
    }
});
