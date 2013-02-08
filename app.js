//<debug>
Ext.Loader.setPath({
    'Ext': 'touch/src',
    'App': 'app',
    'Ext.i18n': 'lib/Ext.i18n.Bundle-touch/i18n'
});
//</debug>

Ext.define('Ext.overrides.event.recognizer.LongPress', {
    override: 'Ext.event.recognizer.LongPress',
    config: {
        minDuration: 250
    }
});

Ext.application({
    name: 'App',

    requires: [
        'Ext.MessageBox',
        'Ext.i18n.Bundle',
        'App.util.Config'
    ],

    views: ['Main', 'layers.MapSettings'],
    controllers: ["Download",'Main', 'Layers', 'Settings', 'Search', 'Query'],
    stores: ['BaseLayers', 'Overlays', 'SelectedOverlays', 'Search', 'Query', 'SavedMaps'],

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

        this.configurePicker();
        this.configureMessageBox();

        Ext.getStore('Overlays').setSorters(App.util.Config.getLanguage());
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
        OpenLayers.Lang.setCode(App.util.Config.getLanguage());
    },

    configureMessageBox: function() {
        // Override MessageBox default messages
        Ext.define('App.MessageBox', {
            override: 'Ext.MessageBox',

            statics: {
                YES   : {text: Ext.i18n.Bundle.message('messagebox.yes'),    itemId: 'yes', ui: 'action'},
                NO    : {text: Ext.i18n.Bundle.message('messagebox.no'),     itemId: 'no'},
                CANCEL: {text: Ext.i18n.Bundle.message('messagebox.cancel'), itemId: 'cancel'},

                OKCANCEL: [
                    {text: Ext.i18n.Bundle.message('messagebox.ok'), itemId: 'ok', ui: 'action'},
                    {text: Ext.i18n.Bundle.message('messagebox.cancel'), itemId: 'cancel'}
                ],
                YESNOCANCEL: [
                    {text: Ext.i18n.Bundle.message('messagebox.yes'),    itemId: 'yes', ui: 'action'},
                    {text: Ext.i18n.Bundle.message('messagebox.no'),     itemId: 'no'},
                    {text: Ext.i18n.Bundle.message('messagebox.cancel'), itemId: 'cancel'}
                ],
                YESNO: [
                    {text: Ext.i18n.Bundle.message('messagebox.yes'), itemId: 'yes', ui: 'action'},
                    {text: Ext.i18n.Bundle.message('messagebox.no'),  itemId: 'no'}
                ]
            }
        });
    },

    configurePicker: function() {
        Ext.define('App.Picker', {
            override : 'Ext.picker.Picker',
            config: {
                doneButton:{
                    text : Ext.i18n.Bundle.message('button.done')
                },
                cancelButton:{
                    text : Ext.i18n.Bundle.message('button.cancel')
                }
            }
        });
    }
});
