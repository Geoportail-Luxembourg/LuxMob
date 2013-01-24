window.i18n = Ext.i18n.Bundle;
Ext.define('App.controller.Download', {
    extend: 'Ext.app.Controller',

    requires: [
        'App.view.Download'
    ],

    config: {
        map: null,
        maskControl: null,
        usageHelp: null,
        refs: {
            mainView: '#mainView',
            mapSettingsView: '#mapSettingsView',
            downloadView: {
                selector: '#downloadView',
                xtype: 'downloadview',
                autoCreate: true
            }
        },
        control: {
            'button[action=download]': {
                tap: function() {
                    this.redirectTo('download');
                }
            },
            'button[action=canceldownload]': {
                tap: 'cancel'
            },
            'button[action=dodownload]': {
                tap: 'promptForName'
            },
            mainview: {
                mapready: function(map) {
                    this.setMap(map);
                }
            }
        },
        routes: {
            'download': 'showDownload'
        }
    },

    showDownload: function() {

        // initial rendering
        var map = this.getMap();
        if (map) {
            var downloadView = this.getDownloadView();
            Ext.Viewport.animateActiveItem(downloadView, {
                type: 'flip',
                listeners: {
                    animationend: this.showUsageHelp,
                    scope: this
                }
            });

            var mapContainer = this.getDownloadView().down('#map-container2');
            map.render(mapContainer.element.dom);
            // required so that the map gets effectively displayed
            // height = 0 if not set
            map.viewPortDiv.style.position = "absolute";
            this.showMask(map);
        } else {
            // application is just launched, don't show the download view
            // directly even if '#download' is in the url
            Ext.Viewport.setActiveItem(this.getMainView());
        }
    },

    showMask: function(map) {
        var control = new App.MaskControl();
        this.setMaskControl(control);
        map.addControl(control);
    },

    cancel: function() {
        var map = this.getMap();

        if (map) {
            var control = this.getMaskControl();
            control.destroy();
            // we want the map to get back to the main view
            var mapContainer = this.getMainView().down('#map-container').element;
            map.render(mapContainer.dom);
        }
        Ext.Viewport.animateActiveItem(
            this.getMainView(),
            {type: 'flip'}
        );
        this.getUsageHelp() && this.getUsageHelp().hide();
    },

    showUsageHelp: function() {
        var overlay = Ext.Viewport.add({
            xtype: 'panel',
            cls: 'usagehelp',
            modal: false,
            padding: 10,
            showAnimation: {
                type: 'popIn'
            },
            hideAnimation: {
                type: 'popOut'
            },
            html: i18n.message('download.usagehelp')
        });
        overlay.showBy(this.getDownloadView().items.get(1));
        this.setUsageHelp(overlay);

        Ext.Function.defer(function() {
            overlay.hide();
        }, 4000);
    },

    promptForName: function() {
        Ext.Msg.prompt(
            i18n.message('download.mapname'),
            i18n.message('download.name'),
            function(buttonId, value) {
                if (buttonId == 'ok') {
                    alert(value);
                }
            }
        );
    }
});

App.MaskControl = OpenLayers.Class(OpenLayers.Control, {

    autoActivate: true,

    draw: function() {
        var div = OpenLayers.Control.prototype.draw.apply(this);
        div.className = "Mask";
        return div;
    }
});
