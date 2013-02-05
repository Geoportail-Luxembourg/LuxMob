Ext.define('App.store.SelectedOverlays', {
    extend: 'Ext.data.Store',
    requires: 'App.model.Overlays',
    config: {
        model: 'App.model.Overlays'
    }
});
