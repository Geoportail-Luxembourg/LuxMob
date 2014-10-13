Ext.define('App.view.QueryResults', {
    extend: "Ext.List",

    xtype: "queryresultsview",

    id: "queryResultsView",

    config: {
        store: 'Query',
        fullscreen: true,
        itemTpl: '<div>{properties.text}</div>',
        onItemDisclosure: true,
        items: [{
            docked: 'top',
            xtype: 'toolbar',
            title: Ext.i18n.Bundle.message('query.title'),
            items: [{
                xtype: "button",
                text: Ext.i18n.Bundle.message('button.back'),
                ui: 'back',
                action: "main"
            }]
        }]
    }
});
