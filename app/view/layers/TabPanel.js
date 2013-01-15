/**
 * The container for the layers config.
 */
Ext.define('App.view.layers.TabPanel', {
    extend: 'Ext.tab.Panel',
    requires: [],

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
                html: "somethinghere"
            }, {
                title: "Cartes enreg.",
                html: "somethinghere<br /> something else"
            }
        ]
    }
});
