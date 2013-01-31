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
                    Ext.get(App.map.viewPortDiv).on({
                        singletap: function() {
                            if (this.getSearching()) {
                                this.setSearching(false);
                            } else {
                                this.hidePreview();
                            }
                        },
                        scope: this
                    });
                    this.setMap(map);
                    this.setVectorLayer(this.getMap().getLayersByName('Vector')[0]);
                }
            },
            queryResultsView: {
                select: function(list, record) {
                    this.highlightFeature(record);
                },
                disclose: function(list, record) {
                    this.redirectTo('detail/' + record.getId());
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
            callback: function() {
                this.setLoading(false);
                var preview = this.getResultsPreview();
                preview.unmask();
                var count = store.getCount();
                var text, cb = Ext.emptyFn;

                if (count === 0) {
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
                preview.add({
                    xtype: 'button',
                    ui: 'plain',
                    cls: 'x-textalign-left',
                    iconCls: "code3",
                    iconMask: true,
                    iconAlign: "right",
                    text: text,
                    listeners: {
                        tap: cb,
                        scope: this
                    }
                });
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
        var layer = this.getVectorLayer();
        layer.removeAllFeatures();
        App.map.getLayersByName('Overlays')[0].setOpacity(1);
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
                        preview.removeAll();
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
            this.getVectorLayer().addFeatures([
                feature
            ]);
        }, this);
        App.map.getLayersByName('Overlays')[0].setOpacity(0.4);
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
        Ext.Viewport.animateActiveItem(
            this.getQueryDetailView(),
            {type: 'slide', direction: 'left'}
        );
        this.getQueryDetailView()
            .setData(Ext.getStore('Query').getById(id).get('properties'));
    }
});
