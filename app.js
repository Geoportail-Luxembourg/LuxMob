//<debug>
Ext.Loader.setPath({
    'Ext': 'touch/src',
    'App': 'app',
    'Ext.i18n': 'lib/Ext.i18n.Bundle-touch/i18n'
});
//</debug>


Ext.application({
    name: 'App',

    requires: [
        'Ext.MessageBox',
        'Ext.i18n.Bundle',
        'App.util.Config'
    ],

    views: ['Main', 'layers.MapSettings', 'layers.ChooserList'],
    controllers: ['Main', 'Layers', 'Settings'],
    stores: ['BaseLayers', 'Overlays'],

    viewport: {
        autoMaximize: true
    },

    icon: {
        '57': 'resources/icons/Icon.png',
        '72': 'resources/icons/Icon~ipad.png',
        '114': 'resources/icons/Icon@2x.png',
        '144': 'resources/icons/Icon~ipad@2x.png'
    },

    isIconPrecomposed: true,

    startupImage: {
        '320x460': 'resources/startup/320x460.jpg',
        '640x920': 'resources/startup/640x920.png',
        '768x1004': 'resources/startup/768x1004.png',
        '748x1024': 'resources/startup/748x1024.png',
        '1536x2008': 'resources/startup/1536x2008.png',
        '1496x2048': 'resources/startup/1496x2048.png'
    },

    launch: function() {

         this.prepareI18n();

        // create the main view and set the map into it
        var mainView = Ext.create('App.view.Main');

        Ext.create('App.view.layers.MapSettings');

        // App.map should be set in config.js
        mainView.setMap(App.map);

        // destroy the #appLoadingIndicator element
        Ext.fly('appLoadingIndicator').destroy();

        // now add the main view to the viewport
        Ext.Viewport.add(mainView);

        var isPhone = Ext.os.deviceType == 'Phone';
        Ext.Viewport.add(Ext.create('App.view.layers.ChooserList'));
    },

    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function(buttonId) {
                if (buttonId === 'yes') {
                    window.location.reload();
                }
            }
        );
    },

    prepareI18n: function() {
        Ext.i18n.Bundle.configure({
            bundle: 'App',
            path: 'resources/i18n',
            language: App.util.Config.getLanguage(),
            noCache: true
        });
    }
});
