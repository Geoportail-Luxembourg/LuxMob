window.i18n = Ext.i18n.Bundle;
Ext.define('App.controller.Download', {
    extend: 'Ext.app.Controller',

    requires: [
    ],

    config: {
        map: null,
        count: 0,
        total: 0,
        value: null,
        extent: null,
        nbZoomLevels: 4,
        maskControl: null,
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

        if (!window.device) {
            Ext.Msg.alert("", i18n.message('savedmaps.html'));
            return;
        }

        // initial rendering
        var map = this.getMap();
        if (map) {
            this.showMask(map);
            this.getMainView().add({
                xtype: 'panel',
                id: 'downloadbar',
                height: 50,
                items: [{
                    layout: {
                        type: 'hbox',
                        pack: 'center'
                    },
                    padding: 10,
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
                        text: i18n.message('button.download_short')
                    }]
                }]
            });

            this.getMainView().items.get(0).items.each(function(item) {
                if (item.isXType('button') || item.isXType('searchfield')) {
                    item.hide();
                }
            });
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
        this.getMainView().items.get(0).items.each(function(item) {
            if (item.isXType('button') || item.isXType('searchfield')) {
                item.show();
            }
        });
        this.getMainView().down('#downloadbar').destroy();
    },

    promptForName: function() {
        Ext.Msg.prompt(
            i18n.message('download.mapname'),
            i18n.message('download.name'),
            Ext.bind(function(buttonId, value) {
                if (buttonId == 'ok') {
                    this.initDownload(value);
                }
            }, this),
            null,
            false,
            null,
            {
                autoCapitalize: true,
                autoCorrect: false,
                id: 'mapname'
            }
        );
        Ext.getCmp('mapname').focus();
    },

    initDownload: function(value) {
        // hide the mask
        this.cancel();
        this.setValue(value);
        this.setExtent(this.getMap().getExtent());

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            Ext.bind(function(fs) {
                fs.root.getFile(
                    "dummy.html",
                    {create: true, exclusive: false},
                    Ext.bind(function (fileEntry) {
                        var basePath = fileEntry.fullPath.replace("dummy.html","");
                        this.download(fs, basePath, new FileTransfer());
                    }, this),
                    function() {
                        console.log('fail root.getFile("dummy.html")');
                });
            }, this),
            function() {
                console.log('fail requestFileSystem');
            }
        );
    },

    download: function(fs, basePath, fileTransfer) {
        var map = this.getMap(),
            zoom = map.getZoom(),
            value = this.getValue(),
            bounds = map.calculateBounds(),
            store = Ext.getStore('SavedMaps'),
            i = 0,
            total = 0,
            z = zoom,
            range,
            cols,
            rows,
            loaded = 0;
        while (i < this.getNbZoomLevels()) {
            range = getTileRangeForExtentAndResolution(
                map.layers[0], bounds, map.getResolutionForZoom(z));
            cols = range[2] - range[0] + 1;
            rows = range[3] - range[1] + 1;
            total += cols * rows;
            z++;
            i++;
        }
        this.setTotal(total);

        store.add({
            name: value,
            key: value,
            extent: this.getExtent(),
            done: 0,
            size: 0,
            date: new Date(Date.now())
        });
        store.sync();

        i = 0;
        z = zoom;
        while (i < this.getNbZoomLevels()) {
            range = getTileRangeForExtentAndResolution(
                map.layers[0], bounds, map.getResolutionForZoom(z));
            cols = range[2] - range[0] + 1;
            rows = range[3] - range[1] + 1;
            for (col = range[0]; col <= range[2]; col++) {
                for (row = range[1]; row <= range[3]; row++) {
                    this.downloadFile(
                        [ this.getValue(), z, col, row ].join('_'),
                        getURL(map.getLayersByName('Overlays')[0], col, row, z),
                        basePath,
                        fileTransfer
                    );
                }
            }
            z++;
            i++;
        }

        Ext.Viewport.setActiveItem(this.getMapSettingsView());
        this.getMapSettingsView().setActiveItem(1);

        function getURL(layer, tileX, tileY, tileZ) {
            var top, right, bottom, left,
                resolution = layer.map.getResolutionForZoom(tileZ);

            left = ( tileX * resolution * OpenLayers.Map.TILE_WIDTH ) + layer.maxExtent.left;
            bottom = ( tileY * resolution * OpenLayers.Map.TILE_HEIGHT ) + layer.maxExtent.bottom;
            right = left + resolution * OpenLayers.Map.TILE_WIDTH;
            top = bottom + resolution * OpenLayers.Map.TILE_HEIGHT;

            // FIXME: goret des cimes, baselayer en dur
            // return layer.getURL(
            //     new OpenLayers.Bounds(left, bottom, right, top)
            // ).replace(/LAYERS=/, 'LAYERS=' + layer.map.baseLayer.name + ',');
            return layer.getURL(
                new OpenLayers.Bounds(left, bottom, right, top)
            ).replace(/LAYERS=/, 'LAYERS=topo,');
        }

        function getTileRangeForExtentAndResolution(layer, extent, resolution) {
            var min = getTileCoordForCoordAndResolution(
                layer,
                new OpenLayers.LonLat(extent.left, extent.bottom), resolution);
            var max = getTileCoordForCoordAndResolution(
                layer,
                new OpenLayers.LonLat(extent.right, extent.top), resolution);
            return min.concat(max);
        }

        function getTileCoordForCoordAndResolution(layer, lonlat, resolution) {
            var origin = layer.getTileOrigin();

            var offsetFromOrigin = new OpenLayers.LonLat(
                Math.floor((lonlat.lon - origin.lon) / resolution),
                Math.floor((lonlat.lat - origin.lat) / resolution)
            );

            var x, y;
            x = Math.floor(offsetFromOrigin.lon / layer.tileSize.w);
            y = Math.floor(offsetFromOrigin.lat / layer.tileSize.h);

            return [x, y];
        }
    },

    downloadFile: function(name, url, basePath, fileTransfer) {
        var fileName = url.split('://')[1].substr(2).replace(/\//g,'_');
        fileName = name + '.png';
        fileTransfer.download(
            url,
            basePath + fileName,
            Ext.bind(function(file) {
                this.increaseAndCheck(file);
            }, this),
            Ext.bind(function(error) {
                this.increaseAndCheck();
                console.log("download error source: " + error.source);
                console.log("download error target: " + error.target);
                console.log("upload error code: " + error.code);
            }, this)
        );
    },

    increaseAndCheck: function() {
        var ls = localStorage,
            value = this.getValue(),
            store = Ext.getStore('SavedMaps'),
            percent,
            file,
            record;
        this.setCount(this.getCount()+1);
        // update download indicator size
        percent =  Math.round(( this.getCount() * 100 ) / this.getTotal());
        record = store.findRecord('name', value);
        record.set('done', percent);
        if (arguments.length>0) {
            fileEntry = arguments[0];
            if (fileEntry) {
                fileEntry.file(function(file) {
                    record.set(
                        'size',
                        record.get('size') + parseInt(file.size,10)
                    );
                });
            }
        }
        record.save();
        if (this.getTotal()!=this.getCount()) {
            return;
        }
        this.setCount(0);
        this.setTotal(0);
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
