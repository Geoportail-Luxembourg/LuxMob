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
                title: i18n.message('mapsettings.title.layers'),
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
                title: i18n.message('mapsettings.title.layers'),
                xclass: "App.view.layers.Layers"
            }, {
                title: i18n.message('mapsettings.title.savedmaps'),
                xclass: "App.view.layers.SavedMaps"
            }
        ]
    }
});
