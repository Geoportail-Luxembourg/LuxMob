Ext.define('App.view.layers.SavedMapsNotAvailable', {
    extend: 'Ext.Panel',

    config: {
        layout: 'fit',
        items: [{
            xtype: "toolbar",
            title: Ext.i18n.Bundle.message('savedmaps.title'),
            docked: "top",
            items: [{
                xtype: "button",
                text: Ext.i18n.Bundle.message('button.close'),
                action: "main",
                iconMask: true
            }]
        }, {
            xtype: 'panel',
            cls: "card",
            html: "<p class='action'>" + Ext.i18n.Bundle.message('savedmaps.html') + "</p>"
        }]
    }
});

