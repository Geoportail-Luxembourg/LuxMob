window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.MoreMenu', {
    extend: 'Ext.Panel',
    id: 'moreMenu',
    xtype: 'moremenu',
    config: {
        left: 0,
        top: 0,
        modal: true,
        hideOnMaskTap: true,
        defaults: {
            listeners: {
                tap: function(button) {
                    button.getParent().hide();
                }
            }
        },
        items: [{
            xtype: "button",
            iconCls: "settings",
            iconMask: true,
            action: "settings",
            text: i18n.message('settings.settings')
        }, {
            xtype: 'button',
            action: 'download',
            cls: "download",
            iconCls: "cloud_download",
            text: i18n.message("button.download"),
            iconMask: true
        }]
    }
});
