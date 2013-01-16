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
        var baseLayers = Ext.getCmp('baseLayers');
        if (!baseLayers) {
            baseLayers = Ext.create('App.view.layers.BaseLayers');
        }
        Ext.Viewport.animateActiveItem(baseLayers, {type: 'slide', direction: "left"});
    },

    updateMap: function(map) {
        this.setBaseLayersStore(Ext.getStore('BaseLayers'));

        var store = this.getBaseLayersStore();
        Ext.each(map.layers, function(layer) {
            if (layer.isBaseLayer) {
                store.add(layer);
            }
        });
        this.getBaseLayerButton().setText(map.baseLayer.name);
    }
});
