Ext.define('App.controller.Main', {
    extend: 'Ext.app.Controller',

    requires: ['App.view.layers.TabPanel'],
    config: {
        refs: {
            mainView: '#mainView',
            layersTabPanel: '#layersTabPanel'
        },
        control: {
            'button[action=home]': {
                tap: function() {
                    this.redirectTo('home');
                }
            },
            'button[action=layers]': {
                tap: function() {
                    this.redirectTo('layers');
                }
            },
            'button[action=back]': {
                tap: function() {
                    window.history.back();
                }
            }
        },
        routes: {
            '': 'showHome',
            'home': 'showHome',
            'layers': 'showLayers'
        }
    },

    showHome: function() {
        Ext.Viewport.animateActiveItem(0, {type:'reveal', direction: 'down'});
    },

    showLayers: function() {
        var layersTabPanel = this.getLayersTabPanel();
        var animation = {type: 'slide', direction: 'right'};
        if (Ext.Viewport.getActiveItem() == this.getMainView()) {
            animation = {type: 'cover', direction: "up"};
        }
        Ext.Viewport.animateActiveItem(layersTabPanel, animation);
    }
});
