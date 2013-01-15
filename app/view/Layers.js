Ext.define('App.view.Layers', {
    extend: 'Ext.Container',
    xtype: 'layersview',
    requires: [],
    config: {
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
                },
            {
                html: "somethinghere"
            }
        ]
    }
});
