Ext.define('App.view.Main', {
    extend: 'Ext.Container',
    xtype: 'mainview',
    requires: [
        'Ext.field.Search'
    ],
    config: {
        tabBarPosition: 'bottom',

        items: [
            {
                xtype: "toolbar",
                docked: "top",
                items: [{
                    xtype: "searchfield",
                    flex: 4,
                    action: "search"
                }, {
                    xtype: "spacer"
                }, {
                    xtype: "button",
                    iconCls: "layers",
                    action: "layers",
                    iconMask: true
                }, {
                    xtype: "button",
                    iconCls: "settings",
                    action: "settings",
                    iconMask: true
                }]
            }, {
                html: "something<br />something<br />something<br />something<br />something<br />"
            }
        ]
    }
});
