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
            downloadView: "#downloadView"
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
            'button[action=search]': {
                tap: function() {
                    this.redirectTo('search');
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
        if (Ext.Viewport.getActiveItem() == this.getDownloadView()) {
            animation = {type: 'flip'};
        } else if (Ext.Viewport.getActiveItem() == this.getSearchView()) {
            animation = {type: 'fade', out: true, duration: 500};
        }
        Ext.Viewport.animateActiveItem(0, animation);
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
            {type: 'fade', duration: 500}
        );
    },

    onMore: function(button) {
        this.getMoreMenu().showBy(button);
    }
});
