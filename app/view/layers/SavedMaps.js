window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.layers.SavedMaps', {
    extend: 'Ext.Panel',

    requires: [
        'App.store.SavedMaps'
    ],

    id: "savedmaps",
    config: {
        layout: 'fit',
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
            id: 'savedmapsList',
            itemTpl: new Ext.XTemplate(
                '<div class="savedmap">',
                '<h4>{name} ',
                '</h4>',
                '<tpl if="downloading">',
                    '<div class="progress">',
                        '<div class="progress_value">{[this.getPercent(values)]}%</div>',
                        '<div style="width:{[this.getPercent(values)]}%" class="progress_bar">&nbsp;</div>',
                    '</div>',
                '</tpl>',
                '<tpl if="!downloading">',
                    '<small class="map_properties">',
                        '{[(values.size/1024/1024).toFixed(1)]}Mb',
                        '<tpl if="resumable">',
                            OpenLayers.i18n('mobile.incomplete'),
                        '</tpl>',
                    '</small>',
                '</tpl>',
                '</div>',
                {
                    getPercent: function(v) {
                        if (Object.keys(v.tiles).length) {
                            return Math.round(
                                (v.done + v.errors) / Object.keys(v.tiles).length * 100
                            );
                        } else {
                            return 0;
                        }
                    }
                }
            ),
            emptyText: i18n.message('savedmaps.nomaps'),
            disclosureProperty: 'resumable',
            onItemDisclosure: function(record, btn, index) {
                this.fireEvent('resume', record, btn, index);
            },
            store: null
        }]
    },

    initialize: function() {
        this.down('#savedmapsList')
            .setStore(Ext.getStore('SavedMaps'));
        this.fireEvent('ready');
    }
});
