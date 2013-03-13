Ext.define('App.controller.Search', {
    extend: 'Ext.app.Controller',

    requires: [
        'Ext.data.Store',
        'Ext.data.proxy.JsonP'
    ],
    config: {
        map: null,
        vectorLayer: null,
        refs: {
            mainView: '#mainView',
            searchView: '#searchView',
            searchField: '#searchField',
            fakeSearch: '#fakeSearch'
        },
        control: {
            searchField: {
                keyup: function(field) {
                    var store = this.getSearchView().getStore();
                    store.getProxy().abort();
                    store.load({
                        params: {
                            query: field.getValue()
                        }
                    });
                }
            },
            searchView: {
                select: 'searchSelect'
            },
            mainView: {
                mapready: function(map) {
                    var vector = new OpenLayers.Layer.Vector('Vector', {
                        rendererOptions: {
                            yOrdering: true,
                            zIndexing: true
                        },
                        styleMap: new OpenLayers.StyleMap({
                            'default': OpenLayers.Util.applyDefaults({
                                externalGraphic: 'resources/images/marker.png',
                                graphicWidth: 17.6,
                                graphicHeight: 24,
                                graphicYOffset: -24,
                                graphicOpacity: 1,
                                backgroundGraphic: 'resources/images/shadow-marker.png',
                                backgroundWidth: 38,
                                backgroundHeight: 30,
                                backgroundYOffset: -30,
                                backgroundXOffset: -10,
                                strokeWidth: 3,
                                strokeColor: 'red',
                                graphicZIndex: 1,
                                backgroundGraphicZIndex: 0
                            }, OpenLayers.Feature.Vector.style['default']),
                            'select': OpenLayers.Util.applyDefaults({
                                externalGraphic: 'resources/images/marker_selected.png',
                                graphicZIndex: 3,
                                graphicWidth: 22,
                                graphicHeight: 30,
                                graphicYOffset: -30,
                                graphicOpacity: 1,
                                backgroundGraphic: 'resources/images/shadow-marker.png',
                                backgroundGraphicZIndex: 2,
                                backgroundWidth: 38,
                                backgroundHeight: 30,
                                backgroundYOffset: -30,
                                backgroundXOffset: -10,
                                strokeWidth: 3,
                                strokeColor: 'red'
                            }, OpenLayers.Feature.Vector.style['default'])
                        })
                    });
                    this.setMap(map);
                    this.setVectorLayer(vector);
                }
            }
        }
    },

    searchSelect: function(list, record) {
        var map = this.getMap(),
            vector = this.getVectorLayer();
        this.getSearchField().setValue(record.get('label'));
        this.getFakeSearch().setValue(record.get('label'));
        map.zoomToExtent(OpenLayers.Bounds.fromArray(record.get('bbox')));
        this.redirectTo('');
        list.deselectAll();
        vector.removeAllFeatures();
        if (vector in map.layers) {
            map.removeLayer(vector);
        }

        var type = record.get('type');
        if (type == 'Adresse' || type == 'Parcelle' || type == 'hydro'|| type == 'hydro_km' || type == 'FLIK') {
            this.showFeatures('locations', [record.get('id')]);
        }

        if (type == 'Parcelle') {
            var store = Ext.getStore('Overlays');
            Ext.each(store.data.all, function(r) {
                if (r.get('name') == 'parcels') {
                    this.getApplication().getController('Layers').
                        onOverlayAdd(r);
                }
            }, this);
        }
    },

    showFeatures: function(layer, ids) {
        Ext.define('SearchHighlight', {
            extend: 'Ext.data.Model',
            config: {
                fields: ['features']
            }
        });
        var store = Ext.create('Ext.data.Store', {
            model: 'SearchHighlight',
            proxy: {
                type: 'jsonp',
                url: "http://app.geoportail.lu/bodfeature/geometry",
                callbackKey: 'cb',
                reader: {
                    rootProperty: 'rows'
                }
            }
        });

        store.load({
            params:{
                layers: layer,
                ids: [ids],
                ref: 'geoadmin'
            },
            callback: function(records) {
                var format = new OpenLayers.Format.GeoJSON(),
                    features = format.read(records[0].get('features')),
                    vector = this.getVectorLayer(),
                    map = this.getMap();

                map.addLayer(vector);
                vector.addFeatures(features);
                var index = Math.max(this.getMap().Z_INDEX_BASE['Feature'] - 1,
                    vector.getZIndex()) + 1;
                vector.setZIndex(index);
            },
            scope: this
        });
    }
});
