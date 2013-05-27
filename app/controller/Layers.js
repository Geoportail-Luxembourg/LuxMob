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
            downloadButton: 'button[action=download]',
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
                itemtap: 'onSavedMapsSelected'
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
                    this.loadOverlays(newValue);
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

        this.loadStores(false);

        var overlaysOLLayer = new OpenLayers.Layer.WMS(
            "Overlays",
            App.util.Config.getOverlayUrl(),
            {layers: [], transparent: true},
            {visibility: false, buffer: 0}
        );
        this.setOverlaysOLLayer(overlaysOLLayer);

        // onOverlaysStoreLoaded is where we actually add the overlays
        // to the map.
        var overlaysStore = Ext.getStore('Overlays');
        if (overlaysStore.isLoaded()) {
            this.onOverlaysStoreLoaded();
        } else {
            overlaysStore.on({
                load: this.onOverlaysStoreLoaded,
                scope: this,
                single: true
            });
        }

        // support language change for some widgets
        this.getApplication().getController('Settings').on({
            languagechange: function(code) {
                var list = this.getOverlaysList();
                list && list.setItemTpl(['{', code, '}'].join(''));
                list && list.on({
                    painted: function() {
                        list.refresh();
                    },
                    scope: this,
                    single: true
                });

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

    loadStores: function(defered) {
        if (defered) {
            Ext.getStore('Overlays').load();
        }
        var store = Ext.getStore('BaseLayers');
        store.load({
            callback: function(records) {
                App.app.loaded = records.length > 0;
                this.getLayersView().maskContent(!App.app.loaded);
                var configObject = App.util.Config;

                // The map config object will be modified but that's ok.
                var mapConfig = configObject.getMapConfig();
                Ext.each(records, Ext.bind(function(record) {
                    var layer = new OpenLayers.Layer.TileCache(
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
                    );
                    if (defered) {
                        var map = this.getMainView().getMap();
                        map.addLayer(layer);
                    } else {
                        mapConfig.layers.push(layer);
                    }
                },this));

                if (defered) {
                    this.updateMap(this.getMainView().getMap());
                    this.getApplication().getController('Download').enableDownload();
                    return;
                }
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

                this.getApplication().getController('Download').enableDownload();
            },
            scope: this
        });

    },

    /**
     * Function called when the Overlays store is loaded.
     *
     * This function adds the overlays to the map. The displayed
     * overlays are selected based on the "layers" query string
     * parameter, and what we have in the local storage. The
     * query string has precedence over the local storage.
     */
    onOverlaysStoreLoaded: function(store) {

        var selectedOverlaysStore = Ext.getStore('SelectedOverlays');
        selectedOverlaysStore.load();

        var queryParamsLayers = OpenLayers.Util.getParameters().layers;

        if (queryParamsLayers) {

            // getParameters creates an array when it sees commas in
            // the parameter value, so we either get an array or a
            // string with no commas.
            if (!Ext.isArray(queryParamsLayers)) {
                queryParamsLayers = [queryParamsLayers];
            }

            var queryParamsLayerRecords = store.queryBy(function(record) {
                return Ext.Array.contains(queryParamsLayers, record.get('name'));
            });

            if (queryParamsLayerRecords.length > 0) {

                // The query string has a "layers" param with layer names
                // that we have in store. So we clear the SelectedOverlays
                // store, and populate it with new records corresponding
                // to what's specificed in the query string.

                selectedOverlaysStore.removeAll();

                queryParamsLayerRecords.each(function(record) {
                    record = selectedOverlaysStore.add(record.raw)[0];
                    record.set('visible', true);
                });

                selectedOverlaysStore.sync();
            }
        }

        // Now add the overlays to the map and to the selected overlays
        // list. We set silent to true when calling onOverlayAdd because
        // we don't want onOverlayAdd to add the record to the
        // SelectedOverlays store, as the record is already in the store.

        selectedOverlaysStore.each(function(record) {
            this.onOverlayAdd(record, /* silent */ true);
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

        map.addLayer(this.getOverlaysOLLayer());
    },

    loadOverlays: function(theme) {
        var store = Ext.getStore('Overlays');
        store.clearFilter();
        store.filterBy(function(record) {
            return Ext.Array.contains(record.get('themes'), theme);
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
        list.select(selected.items, false, true);
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

        var selectedOverlaysList = this.getSelectedOverlaysList();

        // Bail out if we have already a field for this record in the
        // selected overlays list.
        var found = false;
        selectedOverlaysList.items.each(function(field) {
            if (field.isXType('field') &&
                field.getName() == record.get('name')) {
                field.check();
                found = true;
            }
        });
        if (found) {
            return;
        }

        var selectedOverlaysStore = Ext.getStore('SelectedOverlays');

        var visible = true;
        if (record.get('visible') === false) {
            visible = record.get('visible');
        }

        if (!silent) {
            record = selectedOverlaysStore.add(record.raw)[0];
            record.set('visible', true);
            selectedOverlaysStore.sync();
            this.onOverlayChange();
        }

        var name = record.get('name');
        var label = record.get('label');

        this.checkForLayersExclusion(record);

        var field = selectedOverlaysList.insert(0, {
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
                        this.onOverlayRemove(field.getName());

                        var list = this.getOverlaysList();
                        if (list) {
                            var store = Ext.getStore('Overlays');

                            // temporary clear filters
                            var filters = store.getFilters();
                            store.clearFilter();
                            var recordIndex = store.findExact(
                                'name', field.getName());
                            var record = store.getAt(recordIndex);
                            list.deselect(record);

                            // reapply filters
                            store.filter(filters);
                        }
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
                this.showMessage(i18n.message("layers.exclusion_baselayer_msg", {
                    baseLayer: OpenLayers.i18n(curBaseLayer.get('name')),
                    overlay: OpenLayers.i18n(layer.get('name'))
                }));
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

    onSavedMapsSelected: function(list, index, target, record) {
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

        // deactivate the download button
        this.getDownloadButton().setDisabled(true);
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

        // reactivate the download button
        this.getDownloadButton().setDisabled(!App.app.loaded);
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
