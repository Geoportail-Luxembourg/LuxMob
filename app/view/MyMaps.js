window.i18n = Ext.i18n.Bundle;
Ext.define("App.view.MyMaps", {
    extend: 'Ext.Panel',
    xtype: 'mymapsview',
    requires: [ ],

    config: {
        layout: 'vbox',
        items: [{
            docked: 'top',
            xtype: 'toolbar',
            title: i18n.message("mymaps.mymaps"),
            items: [{
                xtype: 'button',
                text: i18n.message('button.close'),
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
