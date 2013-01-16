Ext.define('App.controller.Layers', {
    extend: 'Ext.app.Controller',
    
    requires: ['App.view.layers.BaseLayers'],
    config: {
        control: {
            'button[action=bglayer]': {
                tap: function() {
                    this.redirectTo('baselayers');
                }
            }
        },
        routes: {
            'baselayers': 'showBaseLayers'
        }
    },

    showBaseLayers: function() {
        var baseLayers = Ext.getCmp('baseLayers');
        if (!baseLayers) {
            baseLayers = Ext.create('App.view.layers.BaseLayers');
        }
        Ext.Viewport.animateActiveItem(baseLayers, {type: 'slide', direction: "left"});
    }
});
