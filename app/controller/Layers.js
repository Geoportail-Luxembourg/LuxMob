window.i18n = Ext.i18n.Bundle;
Ext.define('App.controller.Layers', {
    extend: 'Ext.app.Controller',

    requires: [
        'App.view.layers.BaseLayers',
        'App.store.BaseLayers',
        'App.view.layers.Overlays',
        'App.store.Overlays',
        'App.store.SavedMaps',
        'Ext.ActionSheet'
    ],
    config: {
        map: null,
        baseLayersStore: null,
        overlaysOLLayer: null,
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
            overlaysSearch: '#overlaysSearch'
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
                }
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
            }
        },
        routes: {
            'baselayers': 'showBaseLayers',
            'overlays': 'showOverlays'
        }
    },

    init: function() {
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
            themechange: function(theme) {
                this.loadOverlays(this.getMap(), theme);
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
                store.add(layer);
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

        this.getBaseLayerButton().setText(this.getMap().baseLayer.name);
        this.loadOverlays(map);

        var queryParams = OpenLayers.Util.getParameters();
        store = Ext.getStore('SelectedOverlays');
        var cache = [];
        store.each(function(record) {
            if (record.get('visible')) {
                cache.push(record.get('name'));
            }
        });
        var overlays = queryParams.layers || cache;
        App.map.addLayer(
            new OpenLayers.Layer.WMS(
                "Overlays",
    //            "http://demo.geoportail.lu/mapproxy/service",
                "http://geoportail-luxembourg.demo-camptocamp.com/~sbrga/mapproxy/service",
                {
                    layers: overlays || [],
                    transparent: true
                },
                {
                    visibility: !!overlays,
                    buffer: 0
                }
            )
        );
        this.setOverlaysOLLayer(map.getLayersByName('Overlays')[0]);

    },

    loadOverlays: function(map, theme) {
        theme = theme || 'main';
        Ext.Ajax.request({
            // FIXME load layers from service
            url: "http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/theme/" + theme + "/layers",
            success: function(response) {
                var text = response.responseText;
                var layers = Ext.JSON.decode(text);

                var store = Ext.getStore('Overlays');
                store.removeAll();
                for (l in layers) {
                    store.add({
                        fr: OpenLayers.Lang.fr[l] || l,
                        en: OpenLayers.Lang.en[l] || l,
                        de: OpenLayers.Lang.de[l] || l,
                        lu: OpenLayers.Lang.lu[l] || l,
                        name: l,
                        exclusion: layers[l].exclusion
                    });
                }

                var layersParam = this.getOverlaysOLLayer().params.LAYERS;
                var selected = Ext.getStore('Overlays').queryBy(function(record) {
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
            scope: this
        });
    },

    toArray: function(value) {
        return Ext.isArray(value) ? value : value.split(',');
    },

    onBaseLayerChange: function(layer) {
        this.getMap().setBaseLayer(layer);
        this.getBaseLayerButton().setText(OpenLayers.i18n(layer.name));
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
        }, 2000);
    },

    onOverlayAdd: function(record, silent) {
        var store = Ext.getStore('SelectedOverlays'),
            name,
            visible = true;
        if (record.get && record.get('visible') === false) {
            visible = record.get('visible');
        }
        if (!silent) {
            if (!record.data) {
                name = record.name;
                record = store.add({
                    fr: OpenLayers.Lang.fr[name] || name,
                    en: OpenLayers.Lang.en[name] || name,
                    de: OpenLayers.Lang.de[name] || name,
                    lu: OpenLayers.Lang.lu[name] || name,
                    name: name,
                    exclusion: record.exclusion,
                    visible: true
                })[0];
            } else {
                record = store.add(record.raw)[0];
                record.set('visible', true);
            }
            store.sync();
        }
        name = record.get('name');
        if (!this.checkForLayersExclusion(record)) {
            visible = false;
            record.set('visible', false);
            store.sync();
        }
        var field = this.getSelectedOverlaysList().insert(0, {
            label: OpenLayers.i18n(name),
            name: name,
            value: name,
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
            tap: function() {
                field.setChecked(!field.isChecked());
            }
        });
        this.redirectTo('main');
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
        console.log(field.getValue());
        var store = Ext.getStore("SelectedOverlays");
        var record = store.getAt(store.findExact('name', field.getValue()));
        record.set('visible', true);
        if (!this.checkForLayersExclusion(record)) {
            field.uncheck();
        } else {
            store.sync();
            this.onOverlayChange();
        }
    },

    onOverlayUncheck: function(field) {
        var store = Ext.getStore('SelectedOverlays');
        var record = store.getAt(store.findExact('name', field.getValue()));
        record.set('visible', false);
        store.sync();
        this.onOverlayChange();
    },

    onOverlayChange: function() {
        var selList = this.getSelectedOverlaysList();
        var layer = this.getOverlaysOLLayer(),
            layersParam = [];
        selList.items.each(function(item) {
            if (!item.getValue) {
                return;
            }
            if (item.isChecked && item.isChecked()) {
                layersParam.push(item.getValue());
            }
        }, this);
        layer.setVisibility(layersParam.length);
        layer.mergeNewParams({'LAYERS': layersParam.reverse()});
    },

    onOverlaySwipe: function(field) {
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
    },

    /**
     * Checks for exclusion.
     * Returns false if layer cannot be displayed.
     */
    checkForLayersExclusion: function(layer, isBaseLayer) {
        var exclusion = layer.get('exclusion') || [];
        var layersToExclude = [];

        if (layer.get('visible') === false) {
            return true;
        }
        var store = Ext.getStore('SelectedOverlays');
        store.each(function(record) {
            if (record == layer || !record.get('exclusion') || !record.get('visible')) {
                return;
            }
            if (Ext.Array.intersect(record.get('exclusion'), exclusion).length) {
                layersToExclude.push(OpenLayers.i18n(record.get('name')));
            }
        });
        if (layersToExclude.length) {
            Ext.Msg.alert('', i18n.message("layers.exclusion_msg", {
                layer: OpenLayers.i18n(layer.get('name')),
                layers: layersToExclude.join(', ')
            }));
            return false;
        }
        return true;
    },

    onSavedMapsSelected: function(list, record) {
        var layer = this.getMap().getLayersByName('SavedMap');
        layer = layer && layer[0];

        if (!layer) {
            layer = new SavedMapLayer(
                record.get('name'),
                {
                    isBaseLayer: true
                }
            );
        }
        this.getMap().addLayer(layer);
        this.getMap().setBaseLayer(layer);
        this.getOverlaysOLLayer().setVisibility(false);
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
            store.filter(function(record) {
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
                    return matched[0];
                }
            });
        }
    },

    /**
     * Called when the user taps on the clear icon in the search field.
     * It simply removes the filter form the store
     */
    onSearchClearIconTap: function() {
        //call the clearFilter method on the store instance
        Ext.getStore('Overlays').clearFilter();
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
