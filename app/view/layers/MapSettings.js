window.i18n = Ext.i18n.Bundle;
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
        items: [
            {
                iconCls: 'layers',
                iconMask: true,
                title: i18n.message('mapsettings.title.layers'),
                xclass: "App.view.layers.Layers"
            }, {
                iconCls: 'cloud_download',
                iconMask: true,
                title: i18n.message('mapsettings.title.savedmaps'),
                xclass: device ?
                     "App.view.layers.SavedMaps" : "App.view.layers.SavedMapsNotAvailable"
            }
        ]
    }
});
