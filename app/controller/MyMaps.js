window.i18n = Ext.i18n.Bundle;
Ext.define('App.controller.MyMaps', {
    extend: 'Ext.app.Controller',
    requires: [
        'App.util.Config',
        'App.view.MyMaps',
        'App.view.MyMapDetail',
        'App.view.MyMapFeatureDetail',
        'Ext.chart.CartesianChart',
        'Ext.chart.series.Line',
        'Ext.chart.axis.Numeric',
        'Ext.field.Hidden'
    ],

    config: {
        myMapPreview: null,
        myMapPreviewHeight: 50,
        map: null,
        vectorLayer: null,
        geolocateControl: null,
        selectControl: null,
        dummyForm: null,
        connection: null,
        addPoiView: null,
        marker: null,
        // tells whether a picture is currently being uploaded
        loadingPhoto: false,
        // tells whether a location has been found when adding a POI
        hasLocation: false,
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
            myMapFeatureDetailView: {
                selector: '#myMapFeatureDetailView',
                xtype: 'mymapfeaturedetailview',
                autoCreate: true
            },
            addPoiSubmitButton: 'button[action=addpoisubmit]',
            exportButton: 'button[action=export]'
        },
        control: {
            myMapsList: {
                itemtap: function(list, index, target, record) {
                    this.redirectTo('main/map/' + record.get('uuid'));
                }
            },
            myMapFeaturesList: {
                itemtap: function(list, index, target, record) {
                    this.getSelectControl().select(record.data);
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
                    // Workaround for
                    // https://github.com/openlayers/openlayers/pull/955
                    // To be removed when #955 is closed and OpenLayers
                    // is updated in the project.
                    select.handlers.feature.touchmove = function(evt) {
                        OpenLayers.Event.preventDefault(evt);
                    };
                    this.setSelectControl(select);
                    vector.events.on({
                        'featureselected': function(e) {
                            var view = this.getMyMapFeatureDetailView();
                            this.getApplication().redirectTo('mymapfeaturedetail');
                            view.setFeature(e.feature);
                            // we don't want the feature to stay selected
                            this.getSelectControl().unselect(e.feature);
                        },
                        scope: this
                    });

                    var map_id = OpenLayers.Util.getParameters().map_id;
                    if (map_id) {
                        this.getApplication().redirectTo('main/map/' + map_id);
                    }

                    var view = this.getMyMapFeatureDetailView();
                    view.setMainMap(this.getMap());
                }
            },
            'button[action=addpoi]': {
                tap: 'addPoi'
            },
            myMapFeatureDetailView: {
                profile: 'profile'
            },
            exportButton: {
                tap: 'export'
            }
        },
        routes: {
            'mymaps': 'showMyMaps',
            'main/map/:id': 'showMyMap',
            'mymapdetail': 'showMyMapDetail',
            'mymapfeaturedetail': 'showFeatureDetail'
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

        // redirect to main view, so that we don't keep the url
        // prevents map being reloaded when coming back to main from mymap view
        this.redirectTo('');
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
                    if (Ext.get(e.target).hasCls('x-button-label')) {
                        this.redirectTo('mymapdetail');
                    } else {
                        this.closeMyMap();
                        this.redirectTo('main');
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
                        features = format.read(response);

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
        if (Ext.Array.contains(map.layers, layer)) {
            map.removeLayer(layer);
            this.getSelectControl().deactivate();
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
        if (Ext.Viewport.getActiveItem() == this.getMyMapFeatureDetailView()) {
            animation = {type: 'slide', direction: 'right'};
        }
        var view = this.getMyMapDetailView();
        Ext.Viewport.animateActiveItem(
            view,
            animation
        );
    },

    showFeatureDetail: function() {
        var animation = {type: 'slide', direction: 'left'};
        var view = this.getMyMapFeatureDetailView();
        Ext.Viewport.animateActiveItem(
            view,
            animation
        );
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

    'export': function() {
        var overlay = Ext.Viewport.add({
            xtype: 'formpanel',
            modal: true,
            hideOnMaskTap: true,
            showAnimation: {
                type: 'popIn',
                duration: 250,
                easing: 'ease-out'
            },
            hideAnimation: {
                type: 'popOut',
                duration: 250,
                easing: 'ease-out'
            },
            centered: true,
            width: Ext.os.deviceType == 'Phone' ? '80%' : 400,
            height: Ext.os.deviceType == 'Phone' ? '80%' : 400,
            items: [{
                xtype: 'component',
                html: i18n.message('mymaps.export.title')
            }, {
                xtype: 'component',
                html: '<br />'
            }, {
                xtype: 'fieldset',
                title: 'E-mail',
                items: [{
                    xtype: 'emailfield',
                    name: 'email'
                }]
            }, {
                xtype: 'fieldset',
                title: 'Format',
                items: [{
                    xtype: 'radiofield',
                    name: 'format',
                    value: 'GPX',
                    label: 'GPX',
                    checked: true
                }, {
                    xtype: 'radiofield',
                    name: 'format',
                    value: 'KML',
                    label: 'KML'
                }]
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    pack: 'center'
                },
                padding: 10,
                defaults: {
                    style: 'margin-right: 10px;'
                },
                items: [{
                    xtype: 'button',
                    action: 'cancelexport',
                    text: i18n.message('button.cancel'),
                    handler: function() {
                        overlay.hide();
                    }
                }, {
                    xtype: 'button',
                    ui: 'confirm',
                    text: i18n.message('button.OK'),
                    handler: function() {
                        var values = overlay.getValues();
                        this.doExport(values.email, values.format, overlay);
                    },
                    scope: this
                }]
            }]
        });
        overlay.show();
    },

    doExport: function(email, format, overlay) {
        var title,
            description,
            features;
        var view = Ext.Viewport.getActiveItem();
        if (view == this.getMyMapDetailView()) {
            var mymap = view.getMyMap();
            title = mymap.title;
            description = mymap.description;
            features = view.getFeatures();
        } else if (view == this.getMyMapFeatureDetailView()) {
            var feature = view.getFeature();
            title = feature.attributes.name;
            description = feature.attributes.description;
            features = [feature];
        }

        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            indicator: false
        });

        var contentType,
            metadata,
            options = {
                externalProjection: new OpenLayers.Projection('EPSG:4326'),
                internalProjection: this.getMap().getProjectionObject()
            };

        if (format == 'KML') {
            contentType = 'application/vnd.google-earth.kml+xml';
            Ext.apply(options, {
                foldersName: title,
                foldersDesc: description
            });
        } else if (format == 'GPX') {
            contentType = 'application/gpx+xml';
            metadata = {
                name: title,
                desc: description
            };
        }

        var f = new OpenLayers.Format[format](options);
        var content = f.write(features, metadata);

        Ext.Ajax.request({
            url: App.util.Config.getWsgiUrl() + 'mobile_export',
            method: 'POST',
            xmlData: content,
            params: {
                mail: email,
                name: title,
                lang: i18n.getLanguage()
            },
            headers: {
                'Content-Type': contentType
            },
            callback: function(options, success, response) {
                Ext.Viewport.setMasked(false);
                if (success) {
                    var o = Ext.decode(response.responseText);
                    if (o.success === true) {
                        Ext.Msg.alert('', i18n.message('mymaps.export.done'));
                        overlay.hide();
                    } else if (o.message == "Invalid e-mail address." ){
                        Ext.Msg.alert('', i18n.message('sendbymail.invalidemail'));
                    } else {
                        Ext.Msg.alert('', i18n.message('sendbymail.wrong'));
                    }
                } else {
                    window.alert('Upload failed');
                }
            }
        });
    },

    profile: function(feature) {
        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            indicator: false
        });
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
                Ext.Viewport.setMasked(false);
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
                    handler: function() {
                        Ext.Viewport.animateActiveItem(
                            this.getMyMapFeatureDetailView(),
                            {
                                type: 'reveal',
                                direction: 'down',
                                listeners: {
                                    animationend: function() {
                                        Ext.Viewport.remove(profileView);
                                    }
                                }
                            }
                        );
                    },
                    scope: this
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

        var control = new OpenLayers.Control.Geolocate({
            bind: false,
            autoCenter: true,
            watch: true,
            geolocationOptions: {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 7000
            }
        });
        this.showForm();
        this.setGeolocateControl(control);
        this.getMap().addControls([control]);
        control.events.on({
            "locationupdated": Ext.bind(this.onLocationUpdated, this)
        });
        control.activate();
    },

    showForm: function() {
        this.getMyMapPreview().items.each(function(item) {
            item.hide();
        });
        this.setAddPoiView(this.getMyMapPreview().add({
            xtype: 'formpanel',
            height: 204,
            padding: 0,
            style: {
                backgroundColor: 'white'
            },
            items: [{
                xtype: 'toolbar',
                title: i18n.message('mymaps.detail.addpoi')
            },{
                layout: 'hbox',
                items: [{
                    xtype: 'textfield',
                    name: 'name',
                    placeHolder: 'Nom',
                    flex: 2,
                    margin: 2
                }, {
                    xtype: 'button',
                    action: 'upload',
                    iconCls: 'photo1',
                    iconMask: true,
                    margin: 2,
                    handler: this.onAddPhoto,
                    scope: this
                }]
            }, {
                xtype: 'textareafield',
                name: 'description',
                placeHolder: 'Description',
                height: 60,
                margin: 2
            }, {
                xtype: 'hiddenfield',
                name: 'thumbnail'
            }, {
                xtype: 'hiddenfield',
                name: 'image'
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
                    handler: this.closeAddPoi,
                    scope: this
                }, {
                    xtype: 'button',
                    text: i18n.message('button.OK'),
                    action: 'addpoisubmit',
                    ui: 'confirm',
                    disabled: true,
                    handler: this.saveMap,
                    scope: this
                }]
            }]
        }));
        this.previewResize(204);
    },

    onLocationUpdated: function(e) {
        this.getVectorLayer().removeFeatures(this.getMarker());
        var accuracy = new OpenLayers.Geometry.Polygon.createRegularPolygon(
            e.point,
            e.position.coords.accuracy/2,
            40,
            0
        );
        Ext.defer(function() {
            this.getMap().updateSize();
            this.getMap().zoomToExtent(accuracy.getBounds());
        }, 250, this);
        this.setMarker(
            new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                null,
                OpenLayers.Util.applyDefaults({
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
                }, OpenLayers.Feature.Vector.style['default'])
            )
        );
        this.getVectorLayer().addFeatures([
            this.getMarker()
        ]);
        this.setHasLocation(true);
        this.getAddPoiSubmitButton().setDisabled(this.getLoadingPhoto());
    },

    closeAddPoi: function() {
        this.getGeolocateControl().destroy();
        this.getAddPoiView().getParent().remove(this.getAddPoiView());
        this.getMyMapPreview().items.each(function(item, index) {
            if (index !== 0) { // all but mask
                item.show();
            }
        });
        this.previewResize(this.getMyMapPreviewHeight());
        this.setHasLocation(false);
    },

    saveMap: function() {
        var features = this.getVectorLayer().features;
        var form = this.getAddPoiView();
        form.mask({
            xtype: 'loadmask',
            indicator: false
        });
        Ext.apply(features[features.length - 1].attributes, form.getValues());

        var format = new OpenLayers.Format.GeoJSON();
        var id = this.getMyMapDetailView().getMyMap().uuid;
        var params = {
            features: format.write(features),
            map_id: id
        };
        Ext.Ajax.request({
            url: App.util.Config.getWsgiUrl() + 'mymaps/' + id,
            method: 'PUT',
            params: params,
            success: function(reponse) {
                this.closeAddPoi();
                this.redirectTo('main/map/' + id);
            },
            scope: this
        });
    },

    onAddPhoto: function(field) {
        var actions = Ext.Viewport.add({
            xtype: 'actionsheet',
            items: [
                {
                    text: i18n.message("button.capture_picture"),
                    handler: function() {
                        navigator.device.capture.captureImage(
                            Ext.bind(this.captureSuccess, this, [actions], true),
                            this.onPhotoFail
                        );
                    },
                    scope: this
                }, {
                    text: i18n.message("button.picture_from_library"),
                    handler: function() {
                        var destinationType = navigator.camera.DestinationType;
                        var source = navigator.camera.PictureSourceType;
                        navigator.camera.getPicture(
                            Ext.bind(this.onPhotoURISuccess, this, [actions], true),
                            this.onPhotoFail, {
                                quality: 50,
                                destinationType: destinationType.FILE_URI,
                                sourceType: source.PHOTOLIBRARY
                            }
                        );
                    },
                    scope: this
                }, {
                    text: i18n.message("button.cancel"),
                    handler: function() {
                        actions.hide();
                    }
                }
            ]
        });
        actions.show();
    },

    captureSuccess: function(mediaFiles, actions) {
        var i, len;
        for (i = 0, len = mediaFiles.length; i < len; i += 1) {
            this.onPhotoURISuccess(mediaFiles[i].fullPath, actions);
        }
    },

    onPhotoURISuccess: function(imageURI, actions) {
        this.setLoadingPhoto(true);
        actions.hide();
        var options = new FileUploadOptions();
        options.fileKey = 'file';
        options.fileName = imageURI.substring(imageURI.lastIndexOf('/') + 1);
        options.chunkedMode = false;

        var form = this.getAddPoiView();
        var button = form.down('button[action=upload]');
        button.setIconCls(false);
        button.setIconMask(false);
        button.setIcon("resources/images/loading.gif");
        this.getAddPoiSubmitButton().setDisabled(true);

        var ft = new FileTransfer();
        ft.upload(
            imageURI,
            App.util.Config.getWsgiUrl() + "mymaps/upload_image",
            Ext.bind(this.onPhotoUploadSuccess, this),
            function() {alert("failed");},
            options
        );
    },

    onPhotoUploadSuccess: function(response) {
        var r = Ext.JSON.decode(response.response);
        var form = this.getAddPoiView();
        form.down('field[name=image]').setValue(r.image);
        form.down('field[name=thumbnail]').setValue(r.thumbnail);
        var button = form.down('button[action=upload]');
        button.setIconCls(false);
        button.setIconMask(false);
        button.setIcon(App.util.Config.getWsgiUrl() + r.thumbnail);
        this.getAddPoiSubmitButton().setDisabled(!this.getHasLocation());
        this.setLoadingPhoto(false);
    },

    onPhotoFail: function() {}
});
