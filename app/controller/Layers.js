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
            mapSettingsView: '#mapSettingsView',
            chooserListOverlay: '#chooserListOverlay',
            chooserList: '#chooserList',
            baseLayersView: {
                selector: "#baseLayersView",
                xtype: "baselayersview",
                autoCreate: true
            },
            chooserButton: '#chooserButton',
            baseLayerButton: '#baseLayerButton'
        },
        control: {
            chooserButton: {
                tap: 'onChooserButton'
            },
            baseLayerButton: {
                tap: function() {
                    this.redirectTo('baselayers');
                }
            },
            mainview: {
                mapready: function(map) {
                    this.setMap(map);
                }
            },
            chooserList: {
                itemtap: 'onChooserChange'
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
                var radio = this.getBaseLayersView().add({
                    name: "baselayer",
                    label: layer.name,
                    checked: layer == map.baseLayer,
                    listeners: {
                        element: 'label',
                        tap: function() {
                            this.setChecked(true);
                        }
                    }
                });
                radio.on({
                    check: Ext.bind(function(layer) {
                        this.onBaseLayerChange(layer);
                    }, this, [layer])
                });
            }
        }, this);

        this.getBaseLayerButton().setText(this.getMap().baseLayer.name);
    },

    onBaseLayerChange: function(layer) {
        this.getMap().setBaseLayer(layer);
        this.getBaseLayerButton().setText(layer.name);
        this.redirectTo('mapsettings');
    },

    onChooserButton: function(button) {
        var isPhone = Ext.os.deviceType == 'Phone';
        this.getChooserListOverlay().showBy(button);
    },

    onChooserChange: function(list, index, target, record) {
        this.getMapSettingsView().animateActiveItem(index, {
            type: "flip"
        });
        this.getMapSettingsView().getDockedItems()[0].setTitle(record.get('title'));
        this.getChooserListOverlay().hide();
    }
});
