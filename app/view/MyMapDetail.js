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
            docked: 'bottom',
            xtype: 'toolbar',
            items: [{
                xtype: 'spacer'
            }, {
                xtype: 'button',
                iconCls: 'add',
                iconMask: true,
                action: "addpoi"
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
            cls: 'export-links',
            html: [
                '<a href="javascript:void(0);">GPX</a>',
                '<a href="javascript:void(0);">KML</a>'
            ].join(' ')
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
            tap: {
                fn: function(e, node) {
                    this.fireEvent(
                        'export',
                        this.getMyMap().title,
                        this.getMyMap().description,
                        this.getFeatures(),
                        e.target.innerHTML
                    );
                },
                element: 'innerElement',
                delegate: '.export-links a'
            },
            scope: this
        });
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
