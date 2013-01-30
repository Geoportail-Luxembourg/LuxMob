window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.layers.SavedMaps', {
    extend: 'Ext.Panel',

    requires: [
        //'App.store.SavedMaps'
    ],

    id: "savedmaps",
    config: {
//        layout: 'fit',
        items: [{ xtype: "toolbar",
            docked: "top",
            title: i18n.message('savedmaps.title'),
            items: [{
                xtype: "button",
                text: i18n.message('button.close'),
                action: "main",
                iconMask: true
            }]
        }, {
            xtype: 'list',
            itemTpl: '<div>{name}</div>',
            store: null
            //store: 'SavedMaps'
        }]
    }
});
