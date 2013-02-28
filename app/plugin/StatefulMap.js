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
                    view.setCenter(state.lonlat);
                    view.setZoom(state.zoom);
                }
                map.events.on({
                    moveend: this.moveend,
                    scope: this
                });
            }, this);
        }
    },

    moveend: function() {
        this.setState({
            lonlat: this.getMap().getCenter(),
            zoom: this.getMap().getZoom()
        });
    },

    getState: function() {
        return JSON.parse(localStorage.getItem(this.getMap().id+'-state'));
    },

    applyState: function(state) {
        localStorage.setItem(this.getMap().id+'-state', JSON.stringify(state));
    }
});
