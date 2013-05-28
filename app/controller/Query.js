Ext.define('App.controller.Query', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.Anim',
        'Ext.data.proxy.JsonP',
        'App.view.QueryResults',
        'App.view.QueryDetail'
    ],

    config: {
        protocol: null,
        resultsPreview: null,
        map: null,
        vectorLayer: null,
        searching: false, // used to prevent error with longpress firing singletap
        loading: false, // tells whether a request if finished loading
        refs: {
            mainView: '#mainView',
            queryResultsView: {
                selector: '#queryResultsView',
                xtype: 'queryresultsview',
                autoCreate: true
            },
            queryDetailView: {
                selector: '#queryDetailView',
                xtype: 'querydetailview',
                autoCreate: true
            }
        },
        control: {
            mainview: {
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
                    Ext.get(this.getMap().viewPortDiv).on({
                        singletap: function() {
                            if (this.getSearching()) {
                                this.setSearching(false);
                            } else {
                                this.hidePreview();
                            }
                        },
                        scope: this
                    });
                }
            },
            queryResultsView: {
                select: function(list, record) {
                    this.highlightFeature(record);
                },
                disclose: function(list, record) {
                    this.redirectTo('detail/' + record.getId());
                }
            },
            queryDetailView: {
                initialize: function(view) {
                    view.element.on('click', function(e) {
                        if (e.target.tagName === 'A' &&
                            e.target.href.indexOf('map_id') != -1) {
                            e.preventDefault();
                            var params = e.target.href.split('?')[1];
                            params = Ext.Object.fromQueryString(params);
                            this.redirectTo('main/map/' + params.map_id);
                        }
                    }, this);
                    view.on('hide', function() {
                        this.setData({});
                    });
                }
            }
        },
        routes: {
            'query/:coords': {
                action: 'launchSearch',
                condition: '.+'
            },
            'query': 'showQueryResults',
            'detail/:id': {
                action: 'showDetail',
                condition: '.+'
            }
        }
    },

    launchSearch: function(params) {
        this.setSearching(true);
        this.setLoading(true);
        this.redirectTo('');

        this.getApplication().getController('MyMaps').closeMyMap();

        params = decodeURIComponent(params);
        params = params.split('-');

        this.hidePreview(Ext.bind(this.showPreview, this));

        var store = Ext.getStore('Query');
        store.removeAll();
        store.load({
            params: {
                bbox: params[0],
                layers: params[1],
                scale: params[2],
                lang: i18n.getLanguage()
            },
            callback: function(records, operation, success) {
                this.setLoading(false);
                var preview = this.getResultsPreview();
                preview.removeAll();
                preview.unmask();
                var count = store.getCount();
                var text, cb = Ext.emptyFn;

                if (success === false) {
                    text = i18n.message('query.impossible');
                } else if (count === 0) {
                    text = i18n.message('query.noresults');
                } else if (count > 1) {
                    text = i18n.message('query.results', {
                        count: count
                    });
                    cb = Ext.bind(
                        this.redirectTo, this, ['query']
                    );
                } else {
                    text = store.getAt(0).get('properties').text;
                    var id = store.getAt(0).get('id');
                    cb = Ext.bind(
                        this.redirectTo, this, ['detail/' + id]
                    );
                }
                var button = {
                    xtype: 'button',
                    ui: 'plain',
                    cls: 'x-textalign-left',
                    text: text
                };
                if (count > 0) {
                    Ext.apply(button, {
                        iconCls: "code3",
                        iconMask: true,
                        iconAlign: "right",
                        listeners: {
                            tap: cb,
                            scope: this
                        }
                    });
                }

                preview.add(button);
                this.showFeatures(store.getData().items);
            },
            scope: this
        });

        var layer = this.getVectorLayer();
        var index = Math.max(this.getMap().Z_INDEX_BASE['Feature'] - 1,
            layer.getZIndex()) + 1;
        layer.setZIndex(index);
    },

    showPreview: function() {
        var preview = this.getResultsPreview();
        if (!preview) {
            preview = this.getMainView().add({
                xtype: 'container',
                cls: 'results-preview',
                height: 40,
                padding: 5,
                style: {
                    backgroundColor: 'white'
                },
                masked: {
                    xtype: 'loadmask',
                    message: i18n.message('querying'),
                    indicator: false
                }
            });
            this.setResultsPreview(preview);
        } else {
            if (this.getLoading()) {
                preview.mask();
            }
            preview.show();
        }
        Ext.Animator.run({
            element: preview.element,
            easing: 'easeInOut',
            out: false,
            autoClear: false,
            preserveEndState: true,
            from: {
                height: 0
            },
            to: {
                height: preview.getHeight()
            }
        });
    },

    hidePreview: function(callback) {
        var layer = this.getVectorLayer(),
            map = this.getMap();
        if (!layer) {
            return;
        }
        layer.removeAllFeatures();
        if (layer in map.layers) {
            map.removeLayer(layer);
        }
        map.getLayersByName('Overlays')[0].setOpacity(1);
        var preview = this.getResultsPreview();
        if (preview && !preview.isHidden()) {
            Ext.Animator.run({
                element: preview.element,
                easing: 'easeInOut',
                out: false,
                autoClear: false,
                preserveEndState: true,
                from: {
                    height: preview.getHeight()
                },
                to: {
                    height: 0
                },
                listeners: {
                    animationend: function() {
                        if (this.getLoading()) {
                            preview.removeAll();
                        }
                        preview.hide();
                        if (callback) {
                            callback.call();
                        }
                    },
                    scope: this
                }
            });
        } else {
            if (callback) {
                callback.call();
            }
        }
    },

    showFeatures: function(records) {
        var format = new OpenLayers.Format.GeoJSON();
        Ext.each(records, function(record) {
            var geometry = format.read(record.get('geometry'), 'Geometry');
            var feature = new OpenLayers.Feature.Vector(geometry);
            feature.fid = record.get('id');
            this.getMap().addLayer(this.getVectorLayer());
            this.getVectorLayer().addFeatures([
                feature
            ]);
        }, this);
        this.getMap().getLayersByName('Overlays')[0].setOpacity(0.4);
    },

    showQueryResults: function() {
        var animation = {type: 'slide', direction: 'left'};
        if (Ext.Viewport.getActiveItem() == this.getQueryDetailView()) {
            animation = {type: 'slide', direction: 'right'};
        }
        Ext.Viewport.animateActiveItem(
            this.getQueryResultsView(),
            animation
        );
    },

    highlightFeature: function(record) {
        var layer = this.getVectorLayer();
        Ext.each(layer.features, function(feature) {
            feature.layer.drawFeature(feature, 'default');
        });
        var feature = layer.getFeatureByFid(record.get('id'));
        layer.drawFeature(feature, 'select');
        this.redirectTo('');
    },

    showDetail: function(id) {
        var view = this.getQueryDetailView();
        view.setData({});

        // we use defer here to prevent link click to be taken into account
        // while the view is loaded
        Ext.defer(function() {
            view.setData(Ext.getStore('Query').getById(id).get('properties'));

            if (window.device) {
                // detect any click on link to open them in the native browser
                Ext.select('a', view.element.dom).each(function(link) {
                    link = link.dom;
                    link.onclick = function(e) {
                        e.preventDefault();
                        window.open(link.href, '_system');
                    };
                });
            }
        }, 350);

        Ext.Viewport.animateActiveItem(
            this.getQueryDetailView(),
            {type: 'slide', direction: 'left'}
        );
    }
});
