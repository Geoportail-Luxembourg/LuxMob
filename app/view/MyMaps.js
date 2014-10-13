Ext.define("App.view.MyMaps", {
    extend: 'Ext.Panel',
    xtype: 'mymapsview',
    requires: [ ],

    config: {
        layout: 'vbox',
        items: [{
            docked: 'top',
            xtype: 'toolbar',
            title: Ext.i18n.Bundle.message("mymaps.mymaps"),
            items: [{
                xtype: 'button',
                text: Ext.i18n.Bundle.message('button.close'),
                action: 'main'
            }]
        }, {
            store: 'MyMaps',
            xtype: 'list',
            id: 'myMapsList',
            cls: 'mymaps',
            ui: 'round',
            itemTpl: new Ext.XTemplate(
                '<div>{title}',
                '<tpl if="public != true">',
                    ' <small>Privée</small>',
                '</tpl>',
                '</div>'
            ),
            disableSelection: true,
            flex: 2
        }]
    }
});
