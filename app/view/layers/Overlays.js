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
                            text: Ext.i18n.Bundle.message("button.layers"),
                            iconCls: "layers",
                            iconMask: true,
                            ui: 'back',
                            action: "backtolayers"
                        }, {
                            xtype: "selectfield",
                            id: 'themeSelect',
                            flex: 2,
                            usePicker: false
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
        var select = this.down('#themeSelect');
        Ext.data.JsonP.request({
            url: App.util.Config.getWsgiUrl() + 'mobile_layers' +
                (window.device ? '?sc=' : ''),
            callbackKey: 'cb',
            success: function(response) {
                var themes = response.themes;
                App.util.Config.setThemes(themes);
                var options = [];
                for (var i = 0; i < themes.length; i++) {
                    options.push({
                        text: OpenLayers.i18n('theme.' + themes[i]),
                        value: i
                    });
                }
                select.setOptions(options);
            }
        });

        var list = this.down('#overlaysList');
        list.setStore(Ext.getStore('Overlays'))
            .setItemTpl(['{', Ext.i18n.Bundle.getLanguage(), '}'].join());
        this.fireEvent('ready');
    }
});
