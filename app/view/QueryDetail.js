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
            title: foobar('query.detail.title'),
            items: [{
                xtype: "button",
                text: foobar('button.back'),
                ui: 'back',
                action: "back"
            }]
        }]
    }
});
