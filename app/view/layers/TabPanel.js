/**
 * The container for the layers config.
 */
Ext.define('App.view.layers.TabPanel', {
    extend: 'Ext.tab.Panel',
    requires: [
        "App.view.layers.SavedMaps",
        "App.view.layers.Layers"
    ],

    id: 'layersTabPanel',
    config: {
        tabBar: {
            minHeight: null,
            layout: {
                pack: "center"
            }
        },
        items: [
            {
                xtype: "toolbar",
                docked: "top",
                items: [{
                    xtype: "spacer"
                }, {
                    xtype: "button",
                    iconCls: "home",
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
