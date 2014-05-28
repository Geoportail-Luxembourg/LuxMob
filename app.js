//<debug>
Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'App': 'app',
        'Ext': 'touch/src',
        'Ext.i18n': 'lib/Ext.i18n.Bundle-touch/i18n'
    }
});
//</debug>

Ext.application({
    name: 'App',

    requires: [
        'Ext.viewport.Viewport',
        'Ext.MessageBox',
        'Ext.i18n.Bundle',
        'App.util.Config',
        'App.overrides.LongPress'
    ],

    views: ['Main', 'layers.MapSettings', 'MoreMenu'],
    controllers: ["Download",'Main', 'Layers', 'Settings', 'Search', 'Query', 'MyMaps'],
    stores: ['BaseLayers', 'Overlays', 'SelectedOverlays', 'Search', 'Query', 'SavedMaps', 'MyMaps'],

    viewport: {
        autoMaximize: !Ext.os.is.android ||
            (Ext.os.is.android && Ext.os.version.isGreaterThan(4.1))
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
        App.app.loaded = false;
        this.prepareI18n();

        // create the main view and set the map into it
        var mainView = Ext.create('App.view.Main');

        Ext.create('App.view.layers.MapSettings');
        Ext.create('App.view.MoreMenu');
        Ext.create('App.view.Settings');

        this.configureMessageBox();

        Ext.getStore('Overlays').setSorters(App.util.Config.getLanguage());

        // Load store when online
        var onlineCallback = function(){

            if (App.app.loaded) {
                App.app.getController('Layers').getLayersView().maskContent(false);
                App.app.getController('Download').enableDownload();
                return;
            }
            // Load language files
            var head = document.getElementsByTagName('head')[0],
                uris = [],
                inject = function(urls) {
                    if (urls.length==0) {
                        var select = Ext.getCmp('languageSelect');
                        select.fireEvent('change',
                            select,
                            App.util.Config.getLanguage()
                        );
                        // Then populate layers stores
                        App.app.getController('Layers').loadStores(true);
                        return;
                    }
                    Ext.Loader.injectScriptElement(
                        urls[0]+'?nocache='+Ext.id(),
                        function() {
                            inject(urls.slice(1));
                        }, function() {
                            console.log('fail to load «' + urls[0] + '», retrying');
                            inject(urls);
                        }
                    );
                };
            Ext.each(document.getElementsByClassName('externalscript'), function(sc) {
                uris.push(sc.src);
            });
            inject(uris);
        };
        document.addEventListener("online", onlineCallback, false);

        // when offline ...
        var offlineCallback = function() {
            App.app.getController('Layers').getLayersView().maskContent(true);
            // ... disable the download button
            Ext.ComponentQuery.query('button[action=download]')[0].setDisabled(true);
        };
        document.addEventListener("offline", offlineCallback, false);

        // Android only
        if (window.plugins) {
            window.plugins.webintent.getUri(function(url) {
                if (!url) return;
                var params = Ext.Object.fromQueryString(url.split('?')[1]);
                if (!params.map_id) return;
                setTimeout(function(){
                    App.app.getController('MyMaps').showMyMap(params.map_id);
                }, 500);
            });
        }

        if (Ext.os.is.Tablet) {
            this.handleTablet();
        }

        // Make home screen webapp open in Safari, to prevent
        // Geolocation iOS bug
        var removeElementByName = function (elName) {
            var appleEls = document.getElementsByName (elName),
                l = appleEls.length,
                i;
            for (i = 0; i < l; i++) {
                var el = appleEls [0];
                Ext.removeNode (el);
            }
        };
        removeElementByName ('apple-mobile-web-app-capable');
        removeElementByName ('apple-touch-fullscreen');
    },

    onUpdated: function() {
        window.location.reload();
    },

    handleTablet: function() {
        // If native app we do not invite user to go to desktop app
        if (window.device) {
            return;
        }

        var queryString = window.location.search;
        if (queryString.length === 0) {
            queryString = '?';
        }
        var url = App.util.Config.getWsgiUrl() + queryString + '&no_redirect';

        var msg = OpenLayers.String.format(
            OpenLayers.i18n('mobile.redirect_msg'), {url: url});
        msg += "<a href='#' class='close' style='float:right'>" +
               OpenLayers.i18n('mobile.close') + "</a>";

        var actionSheet = Ext.create('Ext.ActionSheet', {
            ui: 'redirect',
            modal: false,
            html: msg
        });

        Ext.Viewport.add(actionSheet);

        actionSheet.show();
        Ext.Function.defer(function() {
            actionSheet.hide();
        }, 15000);

        actionSheet.element.on({
            'tap': function(e) {
                if (Ext.get(e.target).hasCls('close')) {
                    actionSheet.hide();
                }
            }
        });
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
        if (Ext.MessageBox) {
            Ext.MessageBox.OK.text = 'OK';
            Ext.MessageBox.CANCEL.text = 'Cancel';
            Ext.MessageBox.YES.text = 'Yes';
            Ext.MessageBox.NO.text = 'No';
            Ext.MessageBox.OKCANCEL[0].text = Ext.i18n.Bundle.message('messagebox.cancel');
            Ext.MessageBox.OKCANCEL[1].text = Ext.i18n.Bundle.message('messagebox.ok');
            Ext.MessageBox.YESNOCANCEL[0].text = Ext.i18n.Bundle.message('messagebox.cancel');
            Ext.MessageBox.YESNOCANCEL[1].text = Ext.i18n.Bundle.message('messagebox.no');
            Ext.MessageBox.YESNOCANCEL[2].text = Ext.i18n.Bundle.message('messagebox.yes');
            Ext.MessageBox.YESNO[0].text = Ext.i18n.Bundle.message('messagebox.no');
            Ext.MessageBox.YESNO[1].text = Ext.i18n.Bundle.message('messagebox.yes');
        }
    }
});
