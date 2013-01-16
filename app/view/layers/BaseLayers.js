Ext.define('App.view.layers.BaseLayers', {
    extend: 'Ext.form.Panel',

    requires: [
        "Ext.field.Radio"
    ],

    id: "baseLayers",
    config: {
        tabBar: {
            minHeight: null
        },
        defaults: {
            xtype: 'radiofield'
        },
        items: [
            {
                xtype: "toolbar",
                docked: "top",
                items: [{
                    xtype: "button",
                    text: "layers",
                    iconCls: "layers",
                    iconMask: true,
                    ui: 'back',
                    action: "back"
                }]
            }, {
                name: "the_name",
                label: "something"
            }
        ]
    }
});
