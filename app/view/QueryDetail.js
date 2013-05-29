window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.QueryDetail', {
    extend: "Ext.Panel",

    xtype: "querydetailview",

    id: "queryDetailView",

    config: {
        fullscreen: true,
        scrollable: true,
        padding: 10,
        tpl: '{html}',
        scrollable: { direction: 'vertical' },
        data: null,
        items: [{
            docked: 'top',
            xtype: 'toolbar',
            title: i18n.message('query.detail.title'),
            items: [{
                xtype: "button",
                text: i18n.message('button.back'),
                ui: 'back',
                action: "back"
            }]
        }]
    }
});
