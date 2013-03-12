Ext.define('App.controller.MyMaps', {
    extend: 'Ext.app.Controller',
    requires: [
        'App.util.Config',
        'App.view.MyMaps',
        'App.view.MyMapDetail',
        'App.view.MyMapFeatureDetail',
        'Ext.chart.CartesianChart',
        'Ext.chart.series.Line',
        'Ext.chart.axis.Numeric'
    ],

    config: {
        myMapPreview: null,
        myMapPreviewHeight: 50,
        featureDetailHeight: 120,
        map: null,
        vectorLayer: null,
        selectControl: null,
        dummyForm: null,
        connection: null,
        refs: {
            mainView: '#mainView',
            myMapsView: {
                selector: '#myMapsView',
                xtype: 'mymapsview',
                autoCreate: true
            },
            myMapDetailView: {
                selector: '#myMapDetailView',
                xtype: 'mymapdetailview',
                autoCreate: true
            },
            myMapsList: '#myMapsList',
            myMapFeaturesList: '#myMapFeaturesList',
            myMapFeatureDetailView: 'mymapfeaturedetailview'
        },
        control: {
            myMapsList: {
                itemtap: function(list, index, target, record) {
                    this.redirectTo('main/map/' + record.get('uuid'));
                }
            },
            myMapFeaturesList: {
                itemtap: function(list, index, target, record) {
                    this.showFeatureDetail(record.data);
                }
            },
            mainView: {
                mapready: function(map) {
                    this.setMap(map);
                    var defaultStyleOptions = OpenLayers.Util.applyDefaults({
                        pointRadius: "${getPointRadius}",
                        fillOpacity: 0.5,
                        strokeOpacity: 0.7,
                        fillColor: "${getColor}",
                        strokeColor: "${getColor}",
                        strokeWidth: "${getStroke}",
                        label: "${getLabel}",
                        fontSize: "${getStroke}",
                        fontColor: "${getColor}",
                        cursor: 'pointer',
                        labelOutlineWidth: 3,
                        labelOutlineColor: 'white'
                    });
                    var context = {
                        getColor: function(feature) {
                            return feature.attributes.color || '#FF0000';
                        },
                        getLabel: function(feature) {
                            return feature.attributes.isLabel ?
                            feature.attributes.name : '';
                        },
                        getPointRadius: function(feature) {
                            return feature.attributes.isLabel ?
                            0 : 5;
                        },
                        getStroke: function(feature) {
                            return feature.attributes.stroke || 3;
                        }
                    };
                    var styleMap = new OpenLayers.StyleMap({
                        'default': new OpenLayers.Style(
                            defaultStyleOptions,
                            { context: context }
                        ),
                        'vertices': new OpenLayers.Style({
                            pointRadius: 5,
                            graphicName: "square",
                            fillColor: "white",
                            fillOpacity: 0.6,
                            strokeWidth: 1,
                            strokeOpacity: 1,
                            strokeColor: "#333333"
                        })
                    });
                    var vector = new OpenLayers.Layer.Vector('mymaps', {
                        styleMap: styleMap
                    });

                    this.setVectorLayer(vector);
                    var select = new OpenLayers.Control.SelectFeature(
                        vector,
                        {
                            multiple: false,
                            hover: false,
                            autoActivate: true
                        }
                    );
                    this.setSelectControl(select);
                    vector.events.on({
                        'featureselected': function(e) {
                            this.showFeatureDetail(e.feature);
                        },
                        'featureunselected': function() {
                            this.hideFeatureDetail();
                        },
                        scope: this
                    });
                }
            },
            'button[action=hidefeaturedetail]': {
                tap: 'hideFeatureDetail'
            },
            myMapDetailView: {
                'export': 'export'
            },
            myMapFeatureDetailView: {
                'export': 'export',
                profile: 'profile'
            },
            'button[action=addpoi]': {
                tap: 'addPoi'
            }
        },
        routes: {
            'mymaps': 'showMyMaps',
            'main/map/:id': 'showMyMap',
            'mymapdetail': 'showMyMapDetail'
        }
    },

    init: function() {
        var form = Ext.DomHelper.append(document.body, {tag : 'form'}, true);
        this.setDummyForm(form);
        this.setConnection(new Ext.data.Connection());
    },

    showMyMaps: function() {
        var animation = {type: 'cover', direction: "up"};
        Ext.Viewport.animateActiveItem(
            this.getMyMapsView(),
            animation
        );
    },

    showMyMap: function(id) {
        this.getApplication().getController('Main').showMain();
        this.getApplication().getController('Query').hidePreview();
        this.closeMyMap(Ext.bind(this.showPreview, this, [id]));
    },

    showPreview: function(id) {
        var preview = this.getMyMapPreview();
        if (!preview) {
            preview = this.getMainView().add({
                xtype: 'container',
                cls: 'results-preview',
                padding: 5,
                height: 40,
                style: {
                    message: i18n.message('querying'),
                    backgroundColor: 'white'
                },
                masked: {
                    xtype: 'loadmask',
                    indicator: false
                }
            });
            this.setMyMapPreview(preview);
        } else {
            preview.removeAll();
            preview.mask();
            preview.show();
        }
        var button = preview.add({
            xtype: 'button',
            ui: 'plain',
            text: ' ',
            height: '2.2em',
            cls: 'x-textalign-left',
            iconCls: 'delete',
            iconMask: true,
            iconAlign: 'right',
            listeners: {
                tap: function(button, e) {
                    if (Ext.get(e.target).hasCls('delete')) {
                        this.closeMyMap();
                        this.redirectTo('main');
                    } else {
                        this.redirectTo('mymapdetail');
                    }
                },
                scope: this
            }
        });
        Ext.Animator.run({
            element: preview.element,
            easing: 'easeInOut',
            out: false,
            preserveEndState: true,
            from: {
                height: 0
            },
            to: {
                height: this.getMyMapPreviewHeight()
            }
        });

        var tpl = new Ext.Template(
            '{title}',
            '<br/><small>{nb_features} ',
            OpenLayers.i18n('mobile.features'),
            '</small>'
        );

        function loadFeatures(mymap) {
            var url = App.util.Config.getWsgiUrl() +
                'mymaps/' + mymap.uuid + '/features';
            Ext.data.JsonP.request({
                url: url,
                success: function(response) {
                    var vector = this.getVectorLayer(),
                        map = this.getMap(),
                        format = new OpenLayers.Format.GeoJSON(),
                        features = format.read(response.rows[0].features);

                    map.addLayer(vector);
                    map.addControl(this.getSelectControl());
                    vector.addFeatures(features);
                    map.zoomToExtent(vector.getDataExtent());

                    button.setText(tpl.apply({
                        title: mymap.title + ' ...',
                        nb_features: features.length
                    }));
                    preview.unmask();
                    var view = this.getMyMapDetailView();
                    view.setFeatures(features);
                },
                callbackKey: 'cb',
                scope: this
            });
        }

        Ext.data.JsonP.request({
            url: App.util.Config.getWsgiUrl() + 'mymaps/' + id,
            success: function(response) {
                loadFeatures.apply(this, [response]);
                var view = this.getMyMapDetailView();
                view.setMyMap(response);
            },
            failure: function(response) {
                this.closeMyMap();
                if (response.status == 404) {
                    Ext.Msg.alert('', i18n.message('mymaps.notfound'));
                }
            },
            callbackKey: 'cb',
            scope: this
        });
    },

    closeMyMap: function(callback) {
        var preview = this.getMyMapPreview(),
            layer = this.getVectorLayer(),
            map = this.getMap();
        layer.removeAllFeatures();
        if (layer in map.layers) {
            map.removeLayer(layer);
            map.removeControl(this.getSelectControl());
        }
        if (preview && !preview.isHidden()) {
            Ext.Animator.run({
                element: preview.element,
                easing: 'easeInOut',
                out: false,
                autoClear: false,
                preserveEndState: true,
                from: {
                    height: preview.element.getHeight()
                },
                to: {
                    height: 0
                },
                listeners: {
                    animationend: function() {
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

    showMyMapDetail: function() {
        var animation = {type: 'slide', direction: 'left'};
        var view = this.getMyMapDetailView();
        Ext.Viewport.animateActiveItem(
            view,
            animation
        );
    },

    showFeatureDetail: function(feature) {
        var preview = this.getMyMapPreview();

        // temporarily hide the map title
        preview.items.each(function(item) {
            item.hide();
        });
        var detail = preview.add(new App.view.MyMapFeatureDetail());
        detail.setFeature(feature);
        this.redirectTo('main');
        Ext.defer(this.previewResize, 10, this, [this.getFeatureDetailHeight()]);
    },

    hideFeatureDetail: function() {
        this.previewResize(this.getMyMapPreviewHeight());

        var preview = this.getMyMapPreview();
        if (preview) {
            // remove all the items for feature detail and show the map title again
            preview.items.each(function(item, index) {
                if (index === 0) {
                    // mask
                } else if (index === 1) {
                    item.show();
                } else {
                    preview.remove(item);
                }
            });
        }
    },

    previewResize: function(height) {
        var preview = this.getMyMapPreview();
        if (preview) {
            Ext.Animator.run({
                element: preview.element,
                easing: 'easeInOut',
                autoClear: false,
                preserveEndState: true,
                from: {
                    height: preview.element.getHeight()
                },
                to: {
                    height: height
                }
            });
        }
    },

    'export': function(title, description, features, format) {
        var metadata,
            options = {
                externalProjection: new OpenLayers.Projection('EPSG:4326'),
                internalProjection: this.getMap().getProjectionObject()
            };
        if (format == 'KML') {
            Ext.apply(options, {
                foldersName: title,
                foldersDesc: description
            });
        } else if (format == 'GPX') {
            metadata = {
                name: title,
                desc: description
            };
        }

        var f = new OpenLayers.Format[format](options);

        this.getConnection().upload(
            this.getDummyForm(),
            App.util.Config.getWsgiUrl() + 'mymaps/export',
            Ext.Object.toQueryString({
                content: f.write(features, metadata),
                format: format.toLowerCase(),
                name: title,
                dc: Math.random()
            })
        );
    },

    profile: function(feature) {
        var format = new OpenLayers.Format.GeoJSON();
        var geojson = format.write(feature.geometry);

        var paramsString = 'nbPoints=50&layers=MNT';

        Ext.Ajax.request({
            url: App.util.Config.getWsgiUrl() + 'profile?' + paramsString,
            method: 'POST',
            jsonData: geojson,
            success: function(response) {
                var data = Ext.decode(response.responseText);
                this.drawProfile(data.profile.points);
            },
            failure: function() {
            },
            scope: this
        });
    },

    drawProfile: function(points) {
        var chart = new Ext.chart.CartesianChart({
            store: {
                fields: ['dist', {name: 'z', mapping: 'alts.MNT'}],
                data: points
            },
            axes: [{
                type: 'numeric',
                position: 'left',
                fields: ['z']
            }, {
                type: 'numeric',
                position: 'bottom',
                fields: ['dist']
            }],
            series: [{
                type: 'line',
                style: {
                    stroke: 'rgb(143,203,203)'
                },
                xField: 'dist',
                yField: 'z'
            }]
        });
        var profileView = new Ext.Panel({
            layout: 'fit',
            items: [{
                docked: 'top',
                xtype: 'toolbar',
                items: [{
                    xtype: 'button',
                    text: i18n.message('button.close'),
                    action: 'main'
                }]
            }, chart]
        });
        Ext.Viewport.add(profileView);
        Ext.Viewport.animateActiveItem(
            profileView,
            {type: 'cover', direction: "up"}
        );
    },

    addPoi: function() {
        this.redirectTo('');
        this.getMyMapPreview().items.each(function(item) {
            item.hide();
        });
        var addPoiView = this.getMyMapPreview().add({
            xtype: 'formpanel',
            height: 144,
            style: {
                backgroundColor: 'white'
            },
            items: [{
                layout: 'hbox',
                items: [{
                    xtype: 'textfield',
                    placeHolder: 'Nom',
                    flex: 2,
                    margin: 2
                }, {
                    xtype: 'button',
                    iconCls: 'photo1',
                    iconMask: true,
                    margin: 2
                }]
            }, {
                xtype: 'textareafield',
                placeHolder: 'Description',
                height: 60,
                margin: 2
            }, {
                layout: {
                    type: 'hbox',
                    pack: 'end'
                },
                defaults: {
                    margin: 2
                },
                items: [{
                    xtype: 'button',
                    text: i18n.message('button.cancel'),
                    action: 'cancel',
                    handler: function() {
                        addPoiView.getParent().remove(addPoiView);
                        this.getMyMapPreview().items.each(function(item, index) {
                            if (index !== 0) { // all but mask
                                item.show();
                            }
                        });
                        this.previewResize(this.getMyMapPreviewHeight());
                    },
                    scope: this
                }, {
                    xtype: 'button',
                    text: i18n.message('button.OK'),
                    ui: 'confirm'
                }]
            }]
        });
        this.previewResize(144);
    }
});
