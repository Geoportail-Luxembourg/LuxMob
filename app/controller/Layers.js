window.i18n = Ext.i18n.Bundle;
Ext.define('App.controller.Layers', {
    extend: 'Ext.app.Controller',

    requires: [
        'App.view.layers.BaseLayers',
        'App.store.BaseLayers',
        'App.view.layers.Overlays',
        'App.store.Overlays',
        'App.store.SavedMaps',
        'App.util.Config',
        'Ext.ActionSheet'
    ],
    config: {
        map: null,
        baseLayersStore: null,
        overlaysOLLayer: null,
        holding: false,
        refs: {
            mainView: '#mainView',
            layersView: '#layersView',
            mapSettingsView: '#mapSettingsView',
            savedMapsView: '#savedmaps',
            savedMapsList: '#savedmapsList',
            baseLayersView: {
                selector: "#baseLayersView",
                xtype: "baselayersview",
                autoCreate: true
            },
            baseLayerButton: '#baseLayerButton',
            selectedOverlaysList: '#selectedOverlaysList',
            addOverlaysButton: '#addOverlaysButton',
            overlaysView: {
                selector: "#overlaysView",
                xtype: "overlaysview",
                autoCreate: true
            },
            overlaysList: "#overlaysList",
            overlaysSearch: '#overlaysSearch',
            themeSelect: '#themeSelect'
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
            },
            addOverlaysButton: {
                tap: function() {
                    this.redirectTo('overlays');
                }
            },
            selectedOverlaysList: {
                ready: 'loadOverlaysFromCache'
            },
            overlaysView: {
                ready: function() {
                    var store = Ext.getStore('SelectedOverlays');
                    var cache = [];
                    store.each(function(record) {
                        cache.push(record.get('name'));
                    });
                    var selected = Ext.getStore('Overlays').queryBy(function(record) {
                        return Ext.Array.contains(
                            cache,
                            record.get('name')
                        );
                    });
                    this.getOverlaysList().select(selected.items, false, true);
                }
            },
            savedMapsView: {
                ready: function() {
                    Ext.getStore('SavedMaps').load();
                },
                deactivate: 'deactivateSavedMap'
            },
            savedMapsList: {
                select: 'onSavedMapsSelected'
            },
            overlaysList: {
                select: function(list, record) {
                    this.onOverlayAdd(record);
                },
                deselect: 'onOverlayDeselect'
            },
            overlaysSearch: {
                clearicontap: 'onSearchClearIconTap',
                keyup: 'onSearchKeyUp'
            },
            'button[action=backtolayers]': {
                tap: 'showLayers'
            },
            themeSelect: {
                change: function(select, newValue) {
                    this.loadOverlays(this.getMap(), newValue);
                }
            }
        },
        routes: {
            'baselayers': 'showBaseLayers',
            'overlays': 'showOverlays'
        }
    },

    init: function() {
        // load the map (with its baselayers)

        // "sc" (set cookie) is set in the query string if executing in
        // PhoneGap application. This is to be granted access to the web
        // services.
        var store = Ext.getStore('BaseLayers');
        if (window.device) {
            var proxy = store.getProxy();
            proxy.setUrl(
                proxy.getUrl() + '?sc='
            );
        }

        store.load({
            callback: function(records) {
                var configObject = App.util.Config;

                // The map config object will be modified but that's ok.
                var mapConfig = configObject.getMapConfig();
                Ext.each(records, function(record) {
                    mapConfig.layers.push(new OpenLayers.Layer.TileCache(
                        record.get('name'),
                        configObject.getTileUrl(),
                        record.get('layername'),
                        {
                            maxExtent: OpenLayers.Bounds.fromArray(record.get('bbox')),
                            format: record.get('format'),
                            buffer: 0,
                            transitionEffect: 'resize',
                            tileLoadingDelay: 125,
                            exclusion: record.get('exclusion'),
                            serverResolutions: [500.0, 250.0, 150.0, 100.0, 50.0,
                                                20.0, 10.0, 5.0, 2.0, 1.0, 0.5]
                        }
                    ));
                });

                var name = 'voidLayer';
                mapConfig.layers.push(new OpenLayers.Layer(name, {
                    isBaseLayer: true
                }));
                Ext.getStore('BaseLayers').add({
                    name: name,
                    exclusion: []
                });

                var map = new OpenLayers.Map(mapConfig);
                this.getMainView().setMap(map);

                // destroy the #appLoadingIndicator element
                Ext.fly('appLoadingIndicator').destroy();

                // now add the main view to the viewport
                Ext.Viewport.add(this.getMainView());
            },
            scope: this
        });

        // support language change for some widgets
        this.getApplication().getController('Settings').on({
            languagechange: function(code) {
                var list = this.getOverlaysList();
                list && list.setItemTpl(['{', code, '}'].join(''));

                this.getBaseLayersView().items.each(function(item) {
                    if (item.getXTypes().indexOf('radio') != -1) {
                        item.setLabel(OpenLayers.i18n(item.getValue()));
                        if (item.isChecked()) {
                            this.getBaseLayerButton()
                                .setText(OpenLayers.i18n(item.getValue()));
                        }
                    }
                }, this);
                this.getSelectedOverlaysList().items.each(function(item) {
                    if (item.getXTypes().indexOf('field') != -1) {
                        item.setLabel(OpenLayers.i18n(item.getValue()));
                    }
                });
            },
            scope: this
        });
    },

    loadOverlaysFromCache: function() {
        var store = Ext.getStore('SelectedOverlays');
        store.load();
        store.each(function(record) {
            this.onOverlayAdd(record, true);
        }, this);
    },

    showLayers: function() {
        Ext.Viewport.animateActiveItem(this.getMapSettingsView(), {
            type: 'slide', direction: 'right'
        });
    },

    showBaseLayers: function() {
        Ext.Viewport.animateActiveItem(this.getBaseLayersView(), {
            type: 'slide', direction: "left"
        });
    },

    showOverlays: function() {
        Ext.Viewport.animateActiveItem(this.getOverlaysView(), {
            type: 'slide', direction: "left"
        });
    },

    updateMap: function(map) {
        this.setBaseLayersStore(Ext.getStore('BaseLayers'));

        var store = this.getBaseLayersStore();
        Ext.each(map.layers, function(layer) {
            if (layer.isBaseLayer) {
                var radio = this.getBaseLayersView().add({
                    name: "baselayer",
                    label: OpenLayers.i18n(layer.name),
                    checked: layer == map.baseLayer,
                    value: layer.name,
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

        this.getBaseLayerButton().setText(OpenLayers.i18n(this.getMap().baseLayer.name));

        var queryParams = OpenLayers.Util.getParameters();
        store = Ext.getStore('SelectedOverlays');
        var cache = [];
        store.each(function(record) {
            if (record.get('visible')) {
                cache.push(record.get('name'));
            }
        });
        var overlays = queryParams.layers || cache;
        this.getMap().addLayer(
            new OpenLayers.Layer.WMS(
                "Overlays",
                App.util.Config.getOverlayUrl(),
                {
                    layers: overlays || [],
                    transparent: true
                },
                {
                    visibility: overlays.length,
                    buffer: 0
                }
            )
        );
        this.setOverlaysOLLayer(map.getLayersByName('Overlays')[0]);
        this.loadOverlays(map);
    },

    loadOverlays: function(map, theme) {
        var t = theme || 0;
        var store = Ext.getStore('Overlays');
        store.clearFilter();
        store.filterBy(function(record) {
            return Ext.Array.contains(record.get('themes'), t);
        });
        var layersParam = this.getOverlaysOLLayer().params.LAYERS;
        var selected = store.queryBy(function(record) {
            if (layersParam.split) {
                layersParam = layersParam.split(',');
            }
            return Ext.Array.contains(
                layersParam,
                record.get('name')
            );
        });
        var list = this.getOverlaysList();
        list && list.select(selected.items, false, true);
    },

    toArray: function(value) {
        return Ext.isArray(value) ? value : value.split(',');
    },

    onBaseLayerChange: function(layer) {
        var store = Ext.getStore('BaseLayers');
        record = store.getAt(store.findExact('name', layer.name));
        this.checkForLayersExclusion(record, true);
        this.getMap().setBaseLayer(layer);
        this.getBaseLayerButton().setText(OpenLayers.i18n(layer.name));
        this.clearHighlight();
        this.redirectTo('main');
    },

    showMessage: function(msg) {
        var actionSheet = Ext.create('Ext.ActionSheet', {
            modal: false,
            html: msg,
            style: 'color:white;'
        });

        Ext.Viewport.add(actionSheet);
        actionSheet.show();
        Ext.Function.defer(function() {
            actionSheet.hide();
        }, 5000);
    },

    onOverlayAdd: function(record, silent) {
        var store = Ext.getStore('SelectedOverlays'),
            name,
            label,
            visible = true;

        // if the record comes from the Overlays store check if there's not
        // a corresponding record in the selected overlays already
        if (record.get && record.get('name')) {
            var found = false;
            this.getSelectedOverlaysList().items.each(function(field) {
                if (field.isXType('field') &&
                    field.getName() == record.get('name')) {
                    field.check();
                    found = true;
                }
            });
            if (found) {
                return;
            }
        }

        if (record.get && record.get('visible') === false) {
            visible = record.get('visible');
        }
        if (!silent) {
            if (!record.data) {
                name = record.name;
                label = record.label;
                record = store.add({
                    fr: OpenLayers.Lang.fr[label] || label,
                    en: OpenLayers.Lang.en[label] || label,
                    de: OpenLayers.Lang.de[label] || label,
                    lu: OpenLayers.Lang.lu[label] || label,
                    label: label,
                    name: name,
                    exclusion: record.exclusion,
                    visible: true
                })[0];
            } else {
                record = store.add(record.raw)[0];
                record.set('visible', true);
            }
            store.sync();
            this.onOverlayChange();
        }
        name = record.get('name');
        label = record.get('label');
        this.checkForLayersExclusion(record);
        var field = this.getSelectedOverlaysList().insert(0, {
            label: OpenLayers.i18n(label),
            name: name,
            value: label,
            checked: visible,
            listeners: {
                check: this.onOverlayCheck,
                uncheck: this.onOverlayUncheck,
                scope: this
            }
        });
        field.on({
            element: 'label',
            longpress: Ext.bind(this.onOverlaySwipe, this, [field]),
            swipe: Ext.bind(this.onOverlaySwipe, this, [field]),
            tap: Ext.bind(function(field) {
                if (!this.getHolding()) {
                    field.setChecked(!field.isChecked());
                }
            }, this, [field])
        });
    },

    onOverlayDeselect: function(list, record) {
        var selList = this.getSelectedOverlaysList();
        selList.remove(selList.down('field[name=' + record.get('name') + ']'));
        this.showMessage(i18n.message("overlays.layerremoved"));
        this.onOverlayRemove(record.get('name'));
    },

    onOverlayRemove: function(name) {
        var store = Ext.getStore("SelectedOverlays");
        var index = store.findExact('name', name);
        store.removeAt(index);
        store.sync();
        this.onOverlayChange();
    },

    onOverlayCheck: function(field) {
        var store = Ext.getStore("SelectedOverlays");
        var record = store.getAt(store.findExact('label', field.getValue()));
        record.set('visible', true);
        this.checkForLayersExclusion(record);
    },

    onOverlayUncheck: function(field) {
        var store = Ext.getStore('SelectedOverlays');
        var record = store.getAt(store.findExact('label', field.getValue()));
        record.set('visible', false);
        store.sync();
        this.onOverlayChange();
    },

    onOverlayChange: function() {
        this.getApplication().getController('Query').hidePreview();

        var store = Ext.getStore('SelectedOverlays');
        var layer = this.getOverlaysOLLayer(),
            layersParam = [];
        store.each(function(record) {
            if (record.get('visible')) {
                layersParam.push(record.get('name'));
            }
        }, this);
        if (layer) {
            layer.setVisibility(layersParam.length);
            layer.mergeNewParams({'LAYERS': layersParam});
        }
        this.clearHighlight();
        this.redirectTo('main');
    },

    onOverlaySwipe: function(field) {
        this.setHolding(true);
        var actions = Ext.Viewport.add({
            xtype: 'actionsheet',
            items: [
                {
                    text: i18n.message("button.layer_remove"),
                    ui: 'decline',
                    handler: function() {
                        field.getParent().remove(field);
                        this.onOverlayRemove(field.getValue());
                        var list = this.getOverlaysList();
                        var store = Ext.getStore('Overlays');
                        list && list.deselect(store.getAt(store.findExact(
                            'name', field.getValue()
                        )));
                        actions.hide();
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
        actions.on('hide', function() {
            this.setHolding(false);
        }, this);
    },

    /**
     * Checks for exclusion.
     * Returns false if layer cannot be displayed.
     */
    checkForLayersExclusion: function(layer, isBaseLayer) {
        var exclusion = layer.get('exclusion') || [];
        var layersToExclude = [],
            store;

        if (layer.get('visible') === false) {
            return true;
        }

        // check exclusion with current baselayer
        var curBaseLayer;
        if (this.getMap() && !isBaseLayer) {
            curBaseLayer = this.getMap().baseLayer.name;
            store = Ext.getStore('BaseLayers');
            curBaseLayer = store.getAt(
                store.findExact('name', curBaseLayer)
            );
            if (Ext.Array.intersect(curBaseLayer.get('exclusion'), exclusion).length) {
                var voidLayer = this.getMap().getLayersByName('voidLayer')[0];
                this.getMap().setBaseLayer(voidLayer);
                this.getBaseLayerButton().setText(OpenLayers.i18n(voidLayer.name));
                this.getBaseLayersView().items.each(function(item) {
                    if (item.isXType('field') && item.getValue() == voidLayer.name) {
                        item.check();
                    }
                });
                layersToExclude.push(OpenLayers.i18n(curBaseLayer.get('name')));
            }
        }

        // check exclusion with the other overlays
        store = Ext.getStore('SelectedOverlays');
        store.each(function(record) {
            if (record == layer || !record.get('exclusion') || !record.get('visible')) {
                return;
            }
            if (Ext.Array.intersect(record.get('exclusion'), exclusion).length) {
                record.set('visible', false);
                layersToExclude.push(OpenLayers.i18n(record.get('name')));
                this.getSelectedOverlaysList().items.each(function(field) {
                    if (field.isXType('field') &&
                        field.getName() == record.get('name')) {
                        field.uncheck();
                    }
                });
            }
        }, this);
        store.sync();
        this.onOverlayChange();

        if (layersToExclude.length) {
            this.showMessage(i18n.message("layers.exclusion_msg", {
                layer: OpenLayers.i18n(layer.get('name')),
                layers: layersToExclude.join(', ')
            }));
        }
    },

    onSavedMapsSelected: function(list, record) {
        var map = this.getMap();
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            Ext.bind(function(fs) {
                var layer = new SavedMapLayer(
                    'savedmap',
                    {
                        isBaseLayer: true,
                        fs: fs,
                        resolutions: map.resolutions,
                        serverResolutions: record.get('resolutions'),
                        uuid: record.getId()
                    }
                );
                map.addLayer(layer);
                map.setBaseLayer(layer);
                var extent = OpenLayers.Bounds.fromArray(record.get('extent').split(','));
                if (!extent.containsLonLat(map.getCenter())) {
                    map.zoomToExtent(extent);
                }
                this.getOverlaysOLLayer().setVisibility(false);
                this.redirectTo('');
            }, this),
            function() {
                console.log('fail requestFileSystem');
            }
        );
    },

    deactivateSavedMap: function() {
        var map = this.getMap();

        // set the previously selected base layer
        var radio = this.getBaseLayersView().items.findBy(function(item) {
            return item.getChecked && item.getChecked();
        });
        map.setBaseLayer(map.getLayersByName(radio.getValue())[0]);

        var overlays = this.getOverlaysOLLayer();
        overlays.setVisibility(overlays.params.LAYERS.length);
        var savedmap = map.getLayersByName('savedmap')[0];
        if (savedmap) {
            map.removeLayer(savedmap);
        }
        this.getSavedMapsList().deselectAll();
    },

    /**
     * Called when the search field has a keyup event.
     *
     * This will filter the store based on the fields content.
     */
    onSearchKeyUp: function(field) {
        //get the store and the value of the field
        var value = field.getValue(),
            store = Ext.getStore("Overlays");

        //first clear any current filters on thes tore
        store.clearFilter();

        //check if a value is set first, as if it isnt we dont have to do anything
        if (value) {
            //the user could have entered spaces, so we must split them so we can loop through them all
            var searches = value.split(' '),
                regexps = [],
                i;

            //loop them all
            for (i = 0; i < searches.length; i++) {
                //if it is nothing, continue
                if (!searches[i]) continue;

                //if found, create a new regular expression which is case insenstive
                regexps.push(new RegExp(searches[i], 'i'));
            }

            //now filter the store by passing a method
            //the passed method will be called for each record in the store
            store.filterBy(function(record) {
                var matched = [];

                //loop through each of the regular expressions
                for (i = 0; i < regexps.length; i++) {
                    var search = regexps[i],
                        didMatch = record.get('name').match(search) ||
                                   record.get(i18n.getLanguage()).match(search);

                    //if it matched the first or last name, push it into the matches array
                    matched.push(didMatch);
                }

                //if nothing was found, return false (dont so in the store)
                if (regexps.length > 1 && matched.indexOf(false) != -1) {
                    return false;
                } else {
                    //else true true (show in the store)
                    return matched[0] &&
                        Ext.Array.contains(
                            record.get('themes'),
                            this.getThemeSelect().getValue());
                }
            }, this);
        }
    },

    /**
     * Called when the user taps on the clear icon in the search field.
     * It simply removes the filter form the store
     */
    onSearchClearIconTap: function() {
        //call the clearFilter method on the store instance
        Ext.getStore('Overlays').clearFilter();
    },

    /**
     * Removes any highlighted vector feature
     */
    clearHighlight: function() {
        var search = this.getApplication().getController('Search');
        search && search.getVectorLayer() &&
            search.getVectorLayer().removeAllFeatures();
    }
});

Ext.define('ListItemTplFix',  {
   override: 'Ext.dataview.List',

   updateItemTpl: function(newTpl, oldTpl) {
        var listItems = this.listItems,
            ln = listItems.length || 0,
            i, listItem;

        for (i = 0; i < ln; i++) {
            listItem = listItems[i];
            listItem.setTpl(newTpl);
        }
        if (this.getStore()) {
            this.doRefresh();
        }
    }
});
