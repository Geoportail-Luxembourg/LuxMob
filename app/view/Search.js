window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.Search', {
    extend: 'Ext.Panel',
    xtype: 'searchview',
    requires: [
        'Ext.field.Search'
    ],
    id: "searchView",

    config: {
        items: [
            {
                xtype: 'toolbar',
                docked: 'top',
                items: [{
                    xtype: 'searchfield',
                    flex: 4
                }, {
                    xtype: 'button',
                    text: i18n.message('button.cancel'),
                    action: 'main'
                }]
            }
        ]
    }
});
