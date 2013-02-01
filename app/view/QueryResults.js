window.i18n = Ext.i18n.Bundle;
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
            title: i18n.message('query.title'),
            items: [{
                xtype: "button",
                text: i18n.message('button.back'),
                ui: 'back',
                action: "main"
            }]
        }]
    }
});
