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
                        touchstart: function() {
                            this.hidePreview();
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
        this.redirectTo('');

        params = decodeURIComponent(params);
        params = params.split('-');

        this.showPreview();

        // FIXME defer is for debug, simulate a real query
        Ext.defer(
            function() {
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
                        var preview = this.getResultsPreview();
                        preview.removeAll();
                        preview.unmask();
                        var html;
                        var count = store.getCount();
                        if (count === 0) {
                            html = i18n.message('query.noresults');
                            preview.setHtml(html);
                        } else {
                            var text, cb;
                            if (count > 1) {
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
                        }
                    },
                    scope: this
                });
            },
            500,
            this
        );

        var layer = this.getVectorLayer();
        var index = Math.max(this.getMap().Z_INDEX_BASE['Feature'] - 1,
            layer.getZIndex()) + 1;
        layer.setZIndex(index);
    },

    showPreview: function() {
        this.hidePreview();
        var preview = this.getMainView().add({
            xtype: 'container',
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
        this.setResultsPreview(preview);
    },

    hidePreview: function() {
        var layer = this.getVectorLayer();
        layer.removeAllFeatures();
        var preview = this.getResultsPreview();
        if (preview) {
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
                        preview.getParent().remove(preview);
                        this.setResultsPreview(null);
                    },
                    scope: this
                }
            });
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
