Ext.define('App.view.Search', {
    extend: 'Ext.dataview.List',
    xtype: 'searchview',
    requires: [
        'Ext.field.Search',
        'App.store.Search'
    ],
    id: "searchView",

    config: {
        itemTpl: "<div>{listlabel}</div>",
        store: 'Search',
        emptyText: Ext.i18n.Bundle.message('search.empty'),
        pinHeaders: true,
        grouped: true,
        items: [
            {
                xtype: 'toolbar',
                docked: 'top',
                items: [{
                    xtype: 'searchfield',
                    id: 'searchField',
                    autoComplete: false,
                    autoCapitalize: false,
                    autoCorrect: false,
                    flex: 4
                }, {
                    xtype: 'button',
                    text: Ext.i18n.Bundle.message('button.cancel'),
                    action: 'main'
                }]
            }
        ]
    }
});
