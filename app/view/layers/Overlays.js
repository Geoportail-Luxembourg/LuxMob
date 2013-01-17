Ext.define('App.view.layers.Overlays', {
    extend: "Ext.Panel",

    xtype: "overlaysview",

    id: "overlaysView",

    config: {

        layout: 'fit',
        items: [{
            xtype: "list",
            //ui: 'round',
            id: 'overlaysList',

            //itemTpl defines the template for each item in the list
            itemTpl: '{name}',
            mode: 'SIMPLE',

            //give it a link to the store instance
            store: null,
            emptyText: '<div style="margin-top: 20px; text-align: center">No Matching Items</div>',
            items: [
                {
                    xtype: 'toolbar',
                    docked: 'top',
                    items: [
                        {
                            xtype: "button",
                            text: "layers",
                            iconCls: "layers",
                            iconMask: true,
                            ui: 'back',
                            action: "back"
                        },
                        {
                            xtype: 'searchfield',
                            placeHolder: 'Search...',
                            id: "overlaysSearch",
                            flex: 2
                        }
                    ]
                }
            ]
        }]
    },

    initialize: function() {
        this.down('#overlaysList').setStore(Ext.getStore('Overlays'));
    }
});
