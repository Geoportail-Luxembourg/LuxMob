Ext.define('App.plugin.StatefulMap', {
    alias: 'plugin.statefulmap',

    config: {
        map: null,
        state: null
    },

    init: function(view) {
        if (view) {
            view.on('setmap', function(view, map) {
                this.setMap(map);
                // apply saved state
                var state = this.getState();
                if (state) {
                    view.setCenter([state.lonlat.lon, state.lonlat.lat]);
                    view.setZoom(state.zoom);
                    view.setBaseLayer(state.baselayer);
                }
                map.events.on({
                    moveend: this.moveend,
                    changebaselayer: this.changebaselayer,
                    scope: this
                });
                this.changebaselayer({
                    layer: {name: map.baseLayer.name}
                });
            }, this);
        }
    },

    moveend: function() {
        var state = Ext.apply(this.getState() || {}, {
            lonlat: this.getMap().getCenter(),
            zoom: this.getMap().getZoom()
        });
        this.setState(state);
    },

    changebaselayer: function(obj) {
        var state = Ext.apply(this.getState() || {}, {
            baselayer: obj.layer.name
        });
        this.setState(state);
    },

    getState: function() {
        return Ext.JSON.decode(localStorage.getItem(this.getMap().id+'-state'));
    },

    applyState: function(state) {
        localStorage.setItem(this.getMap().id+'-state', Ext.JSON.encode(state));
    }
});
