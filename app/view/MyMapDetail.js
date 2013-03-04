window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.MyMapDetail', {
    extend: "Ext.Panel",

    xtype: "mymapdetailview",

    id: "myMapDetailView",

    config: {
        myMap: null,
        features: null,
        layout: 'vbox',
        fullscreen: true,
        scrollable: true,
        padding: 10,
        items: [{
            docked: 'top',
            xtype: 'toolbar',
            title: i18n.message('mymap.detail.title'),
            items: [{
                xtype: "button",
                text: i18n.message('button.back'),
                ui: 'back',
                action: "main"
            }]
        }, {
            id: 'description',
            tpl: [
                '<div class="title">{title}</div>',
                '<div class="created_by"><small>' + OpenLayers.i18n('mymaps.map_created_by') + '{user_login}</small></div>',
                '<div class="description">{description}</div>'
            ],
            data: null
        }, {
            id: 'myMapFeaturesList',
            xtype: 'list',
            itemTpl: '{attributes.name}',
            disableSelection: true,
            flex: 2
        }]
    },


    updateMyMap: function(mymap) {
        this.down('#description').setData(mymap);
    },

    updateFeatures: function(features) {
        var list = this.down('#myMapFeaturesList');
        list.getStore() && list.getStore().removeAll();
        list.setData(features);
    }
});
