Ext.define('App.view.layers.Layers', {
    extend: 'Ext.Panel',
    requires: [
        'Ext.form.FieldSet',
        'App.view.layers.SelectedOverlays'
    ],

    id: "layersView",
    config: {
        layout: 'card',
        activeItem: 0,
        items: [{
                xtype: "toolbar",
                title: foobar('mapsettings.title.layers'),
                docked: "top",
                items: [{
                    xtype: "button",
                    text: foobar('button.close'),
                    action: "main"
                }]
            },{
                id: 'layersViewContent',
                scrollable: true,
                items: [{
                    xtype: 'fieldset',
                    margin: 10,
                    title: foobar('layers.title.baselayer'),
                    items: [{
                        xtype: "button",
                        id: "baseLayerButton",
                        action: "baseLayers",
                        text: " ",
                        iconCls: "code3",
                        iconMask: true,
                        iconAlign: "right"
                    }]
                }, {
                    margin: 10,
                    xtype: 'fieldset',
                    title: foobar('layers.title.overlays'),
                    items: [{
                        xclass: "App.view.layers.SelectedOverlays"
                    }]
                }]
            }
        ]
    },

    maskContent: function(mask) {
        var el = this.down('#layersViewContent');
        if (mask) {
            el.setMasked({
                xtype     : 'loadmask',
                indicator : false,
                message   : foobar('layers.nonetwork')
            });
        } else {
            el.unmask();
        }
    }

});
