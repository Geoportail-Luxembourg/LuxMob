Ext.define('App.view.layers.ChooserList', {
    extend: 'Ext.Panel',
    id: 'chooserListOverlay',
    requires: 'Ext.dataview.List',
    config: {
        modal: true,
        hideOnMaskTap: true,
        width: 260,
        height: 110,
        layout: 'fit',
        items: [{
            xtype: "list",
            id: 'chooserList',
            itemTpl: '{title}',
            data: [{
                title: i18n.message('mapsettings.title.layers')
            }, {
                title: i18n.message('mapsettings.title.savedmaps')
            }]
        }]
    },

    initialize: function() {
        this.down('#chooserList').select(0);
    }
});
