Ext.define('App.controller.MyMaps', {
    extend: 'Ext.app.Controller',
    requires: [
        'App.view.MyMaps'
    ],

    config: {
        myMapPreview: null,
        map: null,
        vectorLayer: null,
        refs: {
            mainView: '#mainView',
            myMapsView: {
                selector: '#myMapsView',
                xtype: 'mymapsview',
                autoCreate: true
            },
            myMapsList: '#myMapsList'
        },
        control: {
            myMapsList: {
                select: function(list, record) {
                    this.redirectTo('main/map/' + record.get('uuid'));
                }
            },
            'button[action=backtomymaps]': {
                tap: 'showMyMaps'
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
                }
            }
        },
        routes: {
            'mymaps': 'showMyMaps',
            'main/map/:id': 'showMyMap'
        }
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

        var preview = this.getMyMapPreview();
        if (!preview) {
            preview = this.getMainView().add({
                xtype: 'container',
                cls: 'results-preview',
                height: 50,
                padding: 5,
                style: {
                    message: i18n.message('querying'),
                    backgroundColor: 'white'
                },
                masked: {
                    xtype: 'loadmask',
                    indicator: false
                },
                items: [{
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
                            }
                        },
                        scope: this
                    }
                }]
            });
            this.setMyMapPreview(preview);
        } else {
            preview.mask();
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

        var tpl = new Ext.Template(
            '{title}',
            '<br/><small>{nb_features} ',
            OpenLayers.i18n('mobile.features'),
            '</small>'
        );

        var mymaps = this;
        function loadFeatures(mymap) {
            Ext.Ajax.request({
                url: 'http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/mymaps/' + mymap.uuid + '/features',
                success: function(response) {
                    var vector = this.getVectorLayer(),
                        map = this.getMap(),
                        format = new OpenLayers.Format.GeoJSON(),
                        features = format.read(response.responseText);

                    map.addLayer(vector);
                    vector.addFeatures(features);
                    map.zoomToExtent(vector.getDataExtent());

                    preview.getAt(0).setText(tpl.apply({
                        title: mymap.title + ' ...',
                        nb_features: features.length
                    }));
                    preview.unmask();
                },
                scope: mymaps
            });
        }

        Ext.Ajax.request({
            url: 'http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/mymaps/' + id,
            success: function(response) {
                var mymap = Ext.JSON.decode(response.responseText);
                loadFeatures(mymap);
            }
        });
    },

    closeMyMap: function() {
        var preview = this.getMyMapPreview();
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
                        preview.hide();
                    },
                    scope: this
                }
            });
        }
    }
});
