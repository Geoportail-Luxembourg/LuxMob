window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.layers.SavedMapsNotAvailable', {
    extend: 'Ext.Panel',

    id: "savedmaps",
    config: {
        layout: 'fit',
        items: [{
            xtype: "toolbar",
            title: i18n.message('savedmaps.title'),
            docked: "top",
            items: [{
                xtype: "button",
                text: i18n.message('button.close'),
                action: "main",
                iconMask: true
            }]
        }, {
            xtype: 'panel',
            cls: "card",
            html: "<p class='action'>" + i18n.message('savedmaps.html') + "</p>"
        }]
    }
});

