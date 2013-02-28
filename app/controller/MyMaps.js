Ext.define('App.controller.MyMaps', {
    extend: 'Ext.app.Controller',
    requires: [
        'App.view.MyMaps',
        'App.view.MyMap'
    ],

    config: {
        refs: {
            myMapsView: {
                selector: '#myMapsView',
                xtype: 'mymapsview',
                autoCreate: true
            },
            myMapView: {
                selector: '#myMapView',
                xtype: 'mymapview',
                autoCreate: true
            },
            myMapsList: '#myMapsList'
        },
        control: {
            myMapsList: {
                select: function(list, record) {
                    this.redirectTo('main/map/' + record.get('uuid'));
                }
            },
            'button[action=backtomymaps]': {
                tap: 'showMyMaps'
            }
        },
        routes: {
            'mymaps': 'showMyMaps'
        }
    },

    showMyMaps: function() {
        var animation = {type: 'cover', direction: "up"};
        if (Ext.Viewport.getActiveItem() == this.getMyMapView()) {
            animation = {type: 'slide', direction: 'right'};
        }
        Ext.Viewport.animateActiveItem(
            this.getMyMapsView(),
            animation
        );
    }
});
