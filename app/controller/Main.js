Ext.define('App.controller.Main', {
    extend: 'Ext.app.Controller',
    
    requires: ['App.view.layers.TabPanel'],
    config: {
        refs: {
            mainView: 'mainview'
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
        var layersTabPanel = Ext.getCmp('layersTabPanel');
        if (!layersTabPanel) {
            layersTabPanel = Ext.create('App.view.layers.TabPanel');
        }
        Ext.Viewport.animateActiveItem(layersTabPanel, {type: 'cover', direction: "up"});
    }
});
