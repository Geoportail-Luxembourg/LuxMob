window.i18n = Ext.i18n.Bundle;
Ext.define('App.controller.Layers', {
    extend: 'Ext.app.Controller',

    requires: [
        'App.view.layers.BaseLayers',
        'App.store.BaseLayers',
        'App.view.layers.Overlays',
        'App.store.Overlays',
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
            overlaysList: {
                select: 'onOverlayAdd',
                deselect: 'onOverlayRemove'
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
            scope: this
        });
    },

    showLayers: function() {
        this.getLayersView().animateActiveItem(0, {
            type: 'slide', direction: 'right'
        });
    },

    showBaseLayers: function() {
        this.getLayersView().animateActiveItem(this.getBaseLayersView(), {
            type: 'slide', direction: "left"
        });
    },

    showOverlays: function() {
        this.getLayersView().animateActiveItem(this.getOverlaysView(), {
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
    },

    loadOverlays: function(map) {
        Ext.Ajax.request({
            // FIXME load layers from service
            url: "http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/theme/main/layers",
            success: function(response) {
                var text = response.responseText;
                var l = Ext.JSON.decode(text);

                var store = Ext.getStore('Overlays');
                for (var i= 0; i < l.length; i++) {
                    store.add({
                        fr: OpenLayers.Lang.fr[l[i]] || l[i],
                        en: OpenLayers.Lang.en[l[i]] || l[i],
                        de: OpenLayers.Lang.de[l[i]] || l[i],
                        lu: OpenLayers.Lang.lu[l[i]] || l[i],
                        name: l[i]
                    });
                }

                var records = Ext.pluck(store.getRange(), 'data');
                App.map.addLayer(
                    new OpenLayers.Layer.WMS(
                        "Overlays",
                        "http://geoportail-luxembourg.demo-camptocamp.com/~sbrga/mapproxy/service",
                        {
                            layers: [],
                            transparent: true
                        },
                        {
                            visibility: false
                        }
                    )
                );
                this.setOverlaysOLLayer(map.getLayersByName('Overlays')[0]);
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

    onOverlayAdd: function(list, record) {
        var field = this.getSelectedOverlaysList().insert(0, {
            label: OpenLayers.i18n(record.get('name')),
            name: record.get('name'),
            value: record.get('name'),
            checked: true,
            listeners: {
                check: this.onOverlayChange,
                uncheck: this.onOverlayChange,
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
        this.onOverlayChange();
        this.redirectTo('main');
    },

    onOverlayRemove: function(list, record) {
        var selList = this.getSelectedOverlaysList();
        selList.remove(selList.down('field[name=' + record.get('name') + ']'));
        this.showMessage(i18n.message("overlays.layerremoved"));
        this.onOverlayChange();
    },

    onOverlayChange: function() {
        var selList = this.getSelectedOverlaysList();
        var layer = this.getOverlaysOLLayer(),
            layersParam = [];
        selList.items.each(function(item) {
            if (item.isChecked && item.isChecked()) {
                layersParam.push(item.getValue());
            }
        });
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
                        this.onOverlayChange();
                        var list = this.getOverlaysList();
                        list.deselect(Ext.getStore('Overlays')
                            .findRecord('name', field.getValue()));
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
                        didMatch = record.get('name').match(search);

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
