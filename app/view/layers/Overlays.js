window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.layers.Overlays', {
    extend: "Ext.Panel",

    xtype: "overlaysview",

    id: "overlaysView",

    config: {
        layout: 'fit',
        items: [{
            layout: 'vbox',
            cls: 'x-toolbar',
            items: [
                {
                    xtype: 'toolbar',
                    docked: 'top',
                    items: [
                        {
                            xtype: "button",
                            text: i18n.message("button.layers"),
                            iconCls: "layers",
                            iconMask: true,
                            ui: 'back',
                            action: "backtolayers"
                        }, {
                            xtype: "selectfield",
                            id: 'themeSelect',
                            options: [
                                {text: OpenLayers.i18n('theme.main'), value: 'main'},
                                {text: OpenLayers.i18n('theme.tourisme'), value: 'tourisme'}
                            ],
                            flex: 2
                        }
                    ]
                },
                {
                    xtype: 'searchfield',
                    width: '95%',
                    id: "overlaysSearch",
                    autoComplete: false,
                    autoCapitalize: false,
                    autoCorrect: false
                },
                {
                    xtype: "list",
                    id: 'overlaysList',
                    //itemTpl defines the template for each item in the list
                    itemTpl: null,
                    mode: 'SIMPLE',

                    //give it a link to the store instance
                    store: null,
                    emptyText: '<div style="margin-top: 20px; text-align: center">No Matching Items</div>',
                    flex: 2
                }
            ]
        }]
    },

    initialize: function() {
        var list = this.down('#overlaysList');
        list.setStore(Ext.getStore('Overlays'))
            .setItemTpl(['{', i18n.getLanguage(), '}'].join());
        this.fireEvent('ready');
    }
});
