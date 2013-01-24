window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.layers.SavedMaps', {
    extend: 'Ext.Panel',

    id: "savedmaps",
    config: {
        layout: 'fit',
        items: [{ xtype: "toolbar",
            docked: "top",
            items: [{
                xtype: "button",
                text: i18n.message('button.close'),
                action: "main",
                iconMask: true
            }]
        }, {
            xtype: 'panel',
            cls: 'card',
            html: "Saved maps are allowed"
        }]
    }
});
