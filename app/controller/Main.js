Ext.define('App.controller.Main', {
    extend: 'Ext.app.Controller',

    requires: [
        'App.view.layers.MapSettings',
        'App.view.Settings',
        'App.view.MoreMenu',
        'App.view.Search'
    ],
    config: {
        refs: {
            mainView: '#mainView',
            moreMenu: '#moreMenu',
            mapSettingsView: '#mapSettingsView',
            settingsView: {
                selector: '#settingsView',
                xtype: 'settingsview',
                autoCreate: true
            },
            searchView: {
                selector: '#searchView',
                xtype: 'searchview',
                autoCreate: true
            },
            queryResultsView: '#queryResultsView',
            searchField: 'searchfield[action=search]'
        },
        control: {
            'button[action=more]': {
                tap: 'onMore'
            },
            'button[action=main]': {
                tap: function() {
                    this.redirectTo('main');
                }
            },
            'button[action=mapsettings]': {
                tap: function() {
                    this.redirectTo('mapsettings');
                }
            },
            'button[action=settings]': {
                tap: function() {
                    this.redirectTo('settings');
                }
            },
            searchField: {
                focus: function() {
                    this.redirectTo('search');
                }
            },
            mainView: {
                query: function(view, bounds, map) {
                    this.onMapQuery(view, bounds, map);
                }
            }
        },
        routes: {
            '': 'showMain',
            'main': 'showMain',
            'mapsettings': 'showMapSettings',
            'settings': 'showSettings',
            'search': 'showSearch'
        }
    },

    showMain: function() {
        var animation = {type:'reveal', direction: 'down'};
        if (Ext.Viewport.getActiveItem() == this.getSearchView()) {
            animation = {type: 'fade', out: true, duration: 500};
            this.getSearchView().down('searchfield').blur();
        } else if (Ext.Viewport.getActiveItem() == this.getQueryResultsView()) {
            animation = {type: 'slide', direction: 'right'};
        }
        // hide the search field to prevent intempestive focus
        var field = this.getSearchField();
        field && field.hide() && field.setDisabled(true);

        Ext.Viewport.animateActiveItem(0, animation);

        // show the search field again
        if (field) {
            field.show({
                type: "fadeIn"
            });
            Ext.defer(field.enable, 1000, field);
        }
    },

    showMapSettings: function() {
        var mapSettingsView = this.getMapSettingsView();

        var animation = {type: 'slide', direction: 'right'};
        if (Ext.Viewport.getActiveItem() == this.getMainView()) {
            animation = {type: 'cover', direction: "up"};
        }
        Ext.Viewport.animateActiveItem(
            mapSettingsView,
            animation
        );
    },

    showSettings: function() {
        Ext.Viewport.animateActiveItem(
            this.getSettingsView(),
            {type: 'cover', direction: "up"}
        );
    },

    showSearch: function() {
        Ext.Viewport.animateActiveItem(
            this.getSearchView(),
            {
                type: 'fade',
                duration: 500
            }
        );
        this.getSearchView().down('searchfield').focus();
    },

    onMore: function(button) {
        this.getMoreMenu().showBy(button);
    },

    onMapQuery: function(view, bounds, map) {
        var layers = map.getLayersByName('Overlays')[0].params.LAYERS;
        var scale = map.getScale();
        // launch query only if there are layers to query
        if (layers.length) {
            var p = [bounds, layers, parseInt(scale, 0)];
            var joinedParams = p.join('-');
            joinedParams = encodeURIComponent(joinedParams);
            this.redirectTo('query/' + joinedParams);
        }
    }
});
