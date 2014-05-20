Ext.define('App.view.layers.MapSettings', {
    extend: 'Ext.tab.Panel',
    requires: [
        // FIXME both SavedMaps views are loaded, not good for performance
        "App.view.layers.SavedMaps",
        "App.view.layers.SavedMapsNotAvailable",
        "App.view.layers.Layers"
    ],

    id: 'mapSettingsView',
    config: {
        fullScreen: true,
        tabBarPosition: 'bottom',
        items: []
    },

    applyItems: function(items, collection) {
        items = [
            {
                iconCls: 'layers',
                iconMask: true,
                title: foobar('mapsettings.title.layers'),
                xclass: "App.view.layers.Layers"
            }, {
                iconCls: 'cloud_download',
                iconMask: true,
                title: foobar('mapsettings.title.savedmaps'),
                xclass: window.device ?
                     "App.view.layers.SavedMaps" : "App.view.layers.SavedMapsNotAvailable"
            }
        ];
        return this.callParent([items, collection]);
    }
});
