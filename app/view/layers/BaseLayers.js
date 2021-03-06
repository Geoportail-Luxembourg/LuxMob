Ext.define('App.view.layers.BaseLayers', {
    extend: 'Ext.form.Panel',

    requires: [
        "Ext.field.Radio"
    ],
    xtype: "baselayersview",

    id: "baseLayersView",
    config: {
        tabBar: {
            minHeight: null
        },
        defaults: {
            xtype: 'radiofield',
            labelWidth: '80%'
        },
        items: [
            {
                xtype: "toolbar",
                docked: "top",
                items: [{
                    xtype: "button",
                    text: Ext.i18n.Bundle.message("button.layers"),
                    iconCls: "layers",
                    iconMask: true,
                    ui: 'back',
                    action: "backtolayers"
                }]
            }
        ]
    }
});
