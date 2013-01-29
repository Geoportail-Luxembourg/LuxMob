window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.QueryResults', {
    extend: "Ext.List",

    xtype: "queryresultsview",

    id: "queryResultsView",

    config: {
        store: 'Query',
        fullscreen: true,
        itemTpl: '<div>{properties.TEXT}</div>',
        items: [{
            docked: 'top',
            xtype: 'toolbar',
            items: [{
                xtype: "button",
                text: i18n.message('button.map'),
                ui: 'back',
                action: "main"
            }]
        }]
    }
});
