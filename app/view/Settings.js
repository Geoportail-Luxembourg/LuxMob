Ext.define("App.view.Settings", {
    extend: 'Ext.Container',
    xtype: 'settingsview',
    requires: [
    ],

    config: {
        items: [{
            docked: 'top',
            xtype: 'toolbar',
            title: "Settings",
            items: [{
                xtype: 'spacer'
            }, {
                xtype: 'button',
                iconCls: 'maps',
                iconMask: true,
                action: 'home'
            }]
        }]
    }
});
