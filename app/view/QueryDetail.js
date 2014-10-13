Ext.define('App.view.QueryDetail', {
    extend: "Ext.Panel",

    xtype: "querydetailview",

    id: "queryDetailView",

    config: {
        fullscreen: true,
        padding: 10,
        tpl: '{html}',
        scrollable: { direction: 'vertical' },
        data: null,
        items: [{
            docked: 'top',
            xtype: 'toolbar',
            title: Ext.i18n.Bundle.message('query.detail.title'),
            items: [{
                xtype: "button",
                text: Ext.i18n.Bundle.message('button.back'),
                ui: 'back',
                action: "back"
            }]
        }]
    }
});
