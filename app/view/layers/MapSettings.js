/**
 * The container for the layers config.
 */
Ext.define('App.view.layers.MapSettings', {
    extend: 'Ext.Panel',
    requires: [
        "App.view.layers.SavedMaps",
        "App.view.layers.Layers"
    ],

    id: 'mapSettingsView',
    config: {
        layout: 'card',
        items: [
            {
                xtype: "toolbar",
                docked: "top",
                title: 'Couches',
                items: [{
                    xtype: "button",
                    id: "chooserButton",
                    iconCls: "list",
                    iconMask: true
                }, {
                    xtype: "spacer"
                }, {
                    xtype: "button",
                    iconCls: "maps",
                    action: "home",
                    iconMask: true
                }]
            }, {
                title: "Couches",
                xclass: "App.view.layers.Layers"
            }, {
                title: "Cartes enreg.",
                xclass: "App.view.layers.SavedMaps"
            }
        ]
    }
});
