window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.Download', {
    extend: 'Ext.Container',
    xtype: 'downloadview',
    requires: [
    ],
    id: "downloadView",
    config: {
        layout: 'vbox',
        items: [{
            xtype: "component",
            id: "map-container2",
            flex: 1
        }, {
            height: 70,
            items: [{
                layout: {
                    type: 'hbox',
                    pack: 'center'
                },
                items: [{
                    html: i18n.message('download.size', {size: 12})
                }]
            }, {
                layout: {
                    type: 'hbox',
                    pack: 'end'
                },
                defaults: {
                    style: 'margin-right: 10px;'
                },
                items: [{
                    xtype: 'button',
                    action: 'canceldownload',
                    text: i18n.message('button.cancel')
                }, {
                    xtype: 'button',
                    action: 'dodownload',
                    ui: 'confirm',
                    text: i18n.message('button.OK')
                }]
            }]
        }]
    }
});
