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
            }, {
                xtype: 'spacer'
            }, {
                xtype: "button",
                iconCls: "action2",
                iconMask: true,
                action: "export"
            }]
        }, {
            docked: 'bottom',
            xtype: 'toolbar',
            items: [{
                xtype: 'spacer'
            }, {
                xtype: 'button',
                iconCls: 'locate1',
                iconMask: true,
                action: "addpoi",
                text: i18n.message('mymaps.detail.addpoi')
            },{
                xtype: 'spacer'
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

    initialize: function() {
        this.on({
            painted: function() {
                if (App.user == this.getMyMap().user_login) {
                    this.getDockedItems()[1].show();
                } else {
                    this.getDockedItems()[1].hide();
                }
            },
            scope: this
        });
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
