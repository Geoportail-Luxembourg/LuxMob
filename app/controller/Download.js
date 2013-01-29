window.i18n = Ext.i18n.Bundle;
Ext.define('App.controller.Download', {
    extend: 'Ext.app.Controller',

    requires: [
    ],

    config: {
        map: null,
        maskControl: null,
        usageHelp: null,
        refs: {
            mainView: '#mainView',
            mapSettingsView: '#mapSettingsView'
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
            this.showMask(map);
            this.getMainView().add({
                xtype: 'panel',
                id: 'downloadbar',
                height: 70,
                items: [{
                    layout: {
                        type: 'hbox',
                        pack: 'center'
                    },
                    items: [{
                        html: i18n.message('download.size', {size: 12})
                    }]
                }, {
                    layout: {
                        type: 'hbox',
                        pack: 'end'
                    },
                    defaults: {
                        style: 'margin-right: 10px;'
                    },
                    items: [{
                        xtype: 'button',
                        action: 'canceldownload',
                        text: i18n.message('button.cancel')
                    }, {
                        xtype: 'button',
                        action: 'dodownload',
                        ui: 'confirm',
                        text: i18n.message('button.OK')
                    }]
                }]
            });

            this.getMainView().items.get(0).items.each(function(item) {
                if (item.isXType('button')) {
                    item.hide();
                }
            });
            this.showUsageHelp();
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
        }
        this.getUsageHelp() && this.getUsageHelp().hide();
        this.getMainView().items.get(0).items.each(function(item) {
            if (item.isXType('button')) {
                item.show();
            }
        });
        this.getMainView().down('#downloadbar').destroy();
    },

    showUsageHelp: function() {
        var overlay = Ext.Viewport.add({
            xtype: 'panel',
            cls: 'usagehelp',
            modal: false,
            padding: 10,
            hidden: true,
            showAnimation: {
                type: 'popIn'
            },
            hideAnimation: {
                type: 'popOut'
            },
            html: i18n.message('download.usagehelp')
        });
        Ext.defer(overlay.showBy, 200, overlay, [this.getMainView().down('#downloadbar')]);
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
