Ext.define('App.controller.Main', {
    extend: 'Ext.app.Controller',

    requires: [
        'App.view.layers.MapSettings',
        'App.view.Settings'
    ],
    config: {
        refs: {
            mainView: '#mainView',
            mapSettingsView: '#mapSettingsView',
            settingsView: {
                selector: '#settingsView',
                xtype: 'settingsview',
                autoCreate: true
            },
            downloadView: "#downloadView",
            searchField: "#searchField"
        },
        control: {
            'button[action=home]': {
                tap: function() {
                    this.redirectTo('home');
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
            'button[action=back]': {
                tap: function() {
                    window.history.back();
                }
            },
            'button[action=search]': {
                tap: function(button) {
                    // hide all items but search field so that it gets bigger
                    var toolbar = button.parent;
                    toolbar.items.each(function(item) {item.hide();});
                    this.getSearchField().show().focus();
                },
                scope: this
            },
            searchField: {
                blur: function(field) {
                    var toolbar = field.parent;
                    toolbar.items.each(function(item) {item.show();});
                    field.hide();
                }
            }

        },
        routes: {
            '': 'showHome',
            'home': 'showHome',
            'mapsettings': 'showMapSettings',
            'settings': 'showSettings'
        }
    },

    showHome: function() {
        var animation = {type:'reveal', direction: 'down'};
        if (Ext.Viewport.getActiveItem() == this.getDownloadView()) {
            animation = {type: 'flip'};
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
    }
});
