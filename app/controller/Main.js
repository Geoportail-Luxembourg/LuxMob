Ext.define('App.controller.Main', {
    extend: 'Ext.app.Controller',
    
    config: {
        refs: {
            mainView: 'mainview',
            layersView: 'layersview'
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
        var view = this.getLayersView();
        if (!view) {
            view = Ext.create('App.view.Layers');
        }
        Ext.Viewport.animateActiveItem(view, {type: 'cover', direction: "up"});
    }
});
