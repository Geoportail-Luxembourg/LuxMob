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
                '<div class="deleteplaceholder"></div>',
                '<h4>{name} ',
                '<small class="map_weight">{[(values.size/1024/1024).toFixed(1)]}Mb</small>',
                '</h4>',
                '{[this.getProgress(values)]}',
                '</div>',
                {
                    getProgress: function(values) {
                        if (values.done == 100) {
                            return '';
                        }
                        return '<div class="progress"><div class="progress_value">' +
                            values.done +'%</div><div style="width:' +
                            values.done +'%" class="progress_bar">&nbsp;</div></div>';
                    }
                }
            ),
            emptyText: i18n.message('savedmaps.nomaps'),
            disclosureProperty: 'downloading',
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
