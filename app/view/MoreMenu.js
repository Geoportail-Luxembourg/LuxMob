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
            text: Ext.i18n.Bundle.message('settings.settings')
        }, {
            xtype: 'button',
            action: 'download',
            cls: "download",
            iconCls: "cloud_download",
            text: Ext.i18n.Bundle.message("button.download"),
            disabled: true,
            iconMask: true
        }, {
            xtype: 'button',
            action: 'sendbymail',
            iconCls: "mail",
            text: Ext.i18n.Bundle.message("button.sendbymail"),
            iconMask: true
        }];

        if (window.device) {
            items.push({
                xtype: 'button',
                action: 'mymaps',
                iconCls: "locate1",
                text: Ext.i18n.Bundle.message("button.mymaps"),
                hidden: true,
                iconMask: true
            });

            items.push({
                xtype: 'button',
                action: 'loginform',
                iconCls: "power_on",
                text: Ext.i18n.Bundle.message("button.login"),
                iconMask: true
            });

            items.push({
                xtype: 'button',
                action: 'logout',
                iconCls: "power_on",
                text: Ext.i18n.Bundle.message("button.logout"),
                hidden: true,
                iconMask: true
            });
        }
        return this.callParent([items, collection]);
    }
});
