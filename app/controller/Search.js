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
                    this.setMap(map);
                    this.setVectorLayer(this.getMap().getLayersByName('Vector')[0]);
                }
            }
        }
    },

    searchSelect: function(list, record) {
        this.getSearchField().setValue(record.get('label'));
        this.getFakeSearch().setValue(record.get('label'));
        App.map.zoomToExtent(OpenLayers.Bounds.fromArray(record.get('bbox')));
        this.redirectTo('');
        list.deselectAll();
        this.getVectorLayer().removeAllFeatures();

        var type = record.get('type');
        if (type == 'Adresse' || type == 'Parcelle' || type == 'hydro'|| type == 'hydro_km' || type == 'FLIK') {
            this.showFeatures('locations', [record.get('id')]);
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
                var format = new OpenLayers.Format.GeoJSON();
                var features = format.read(records[0].get('features'));
                var layer = this.getVectorLayer();
                Ext.each(features, function(feature) {
                    layer.addFeatures([
                        feature
                    ]);
                }, this);
                var index = Math.max(this.getMap().Z_INDEX_BASE['Feature'] - 1,
                    layer.getZIndex()) + 1;
                layer.setZIndex(index);
            },
            scope: this
        });
    }
});
