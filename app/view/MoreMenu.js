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
        items: []
    },

    applyItems: function(items, collection) {
        items = [{
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
            disabled: true,
            iconMask: true
        }, {
            xtype: 'button',
            action: 'sendbymail',
            iconCls: "mail2",
            text: i18n.message("button.sendbymail"),
            iconMask: true
        }];

        if (window.device) {
            items.push({
                xtype: 'button',
                action: 'mymaps',
                iconCls: "locate1",
                text: i18n.message("button.mymaps"),
                hidden: true,
                iconMask: true
            });

            items.push({
                xtype: 'button',
                action: 'loginform',
                iconCls: "power_on",
                text: i18n.message("button.login"),
                iconMask: true
            });

            items.push({
                xtype: 'button',
                action: 'logout',
                iconCls: "power_on",
                text: i18n.message("button.logout"),
                hidden: true,
                iconMask: true
            });
        }
        return this.callParent([items, collection]);
    }
});
