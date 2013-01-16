Ext.define('App.controller.Layers', {
    extend: 'Ext.app.Controller',

    requires: [
        'App.view.layers.BaseLayers',
        'App.store.BaseLayers'
    ],
    config: {
        map: null,
        baseLayersStore: null,
        refs: {
            mainView: '#mainView',
            baseLayersView: {
                selector: "#baseLayersView",
                xtype: "baselayersview",
                autoCreate: true
            },
            baseLayerButton: '#baseLayerButton'
        },
        control: {
            baseLayerButton: {
                tap: function() {
                    this.redirectTo('baselayers');
                }
            },
            mainview: {
                mapready: function(map) {
                    this.setMap(map);
                }
            }
        },
        routes: {
            'baselayers': 'showBaseLayers'
        }
    },

    showBaseLayers: function() {
        Ext.Viewport.animateActiveItem(this.getBaseLayersView(), {
            type: 'slide', direction: "left"
        });
    },

    updateMap: function(map) {
        this.setBaseLayersStore(Ext.getStore('BaseLayers'));

        var store = this.getBaseLayersStore();
        Ext.each(map.layers, function(layer) {
            if (layer.isBaseLayer) {
                store.add(layer);
                this.getBaseLayersView().add({
                    name: "baselayer",
                    label: layer.name,
                    checked: layer == map.baseLayer,
                    listeners: {
                        check: Ext.bind(function(layer) {
                            this.onBaseLayerChange(layer);
                        }, this, [layer])
                    }
                });
            }
        }, this);

        this.getBaseLayerButton().setText(this.getMap().baseLayer.name);
    },

    onBaseLayerChange: function(layer) {
        this.getMap().setBaseLayer(layer);
        this.getBaseLayerButton().setText(layer.name);
        this.redirectTo('layers');
    }
});
