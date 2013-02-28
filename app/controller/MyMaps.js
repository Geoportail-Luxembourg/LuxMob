Ext.define('App.controller.MyMaps', {
    extend: 'Ext.app.Controller',
    requires: [
        'App.view.MyMaps'
    ],

    config: {
        refs: {
            myMapsView: {
                selector: '#myMapsView',
                xtype: 'mymapsview',
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
        Ext.Viewport.animateActiveItem(
            this.getMyMapsView(),
            animation
        );
    }
});
