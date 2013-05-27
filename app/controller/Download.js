window.i18n = Ext.i18n.Bundle;
Ext.define('App.controller.Download', {
    extend: 'Ext.app.Controller',

    requires: [
    ],

    config: {
        map: null,
        value: null,
        extent: null,
        nbZoomLevels: 4,
        maskControl: null,
        holding: false,
        fileSystem: null,
        fileTransfer: null,
        directory: null,
        // the amount of currently downloading images
        downloadCount: 0,
        // the tiles to download
        queue: [],
        refs: {
            mainView: '#mainView',
            mapSettingsView: '#mapSettingsView',
            savedMapsList: '#savedmapsList'
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
            },
            savedMapsList: {
                resume: 'initResumeDownload',
                itemswipe: 'removeMap',
                itemtaphold: 'removeMap',
                itemtap: 'selectMap'
            }
        },
        routes: {
            'download': 'showDownload'
        }
    },

    init: function() {
        if (window.device) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                Ext.bind(function(fs) {
                    this.setFileSystem(fs);
                    // Make sure that we use the applications prefered path on
                    // Android so that files are destroyed after application
                    // removal. Still doesn't work in certain cases.
                    var path = Ext.os.is.Android ?
                        "Android/data/com.c2c.LuxMob" : "";
                    fs.root.getDirectory(path,
                        {create: true, exclusive: false},
                        Ext.bind(function (dirEntry) {
                            this.setDirectory(dirEntry);
                            this.setFileTransfer(new FileTransfer());

                            // set any downloading map as resumable
                            var store = Ext.getStore('SavedMaps');
                            store.load();
                            store.each(function(r) {
                                if (r.get('downloading') === true) {
                                    r.set('downloading', false);
                                    r.set('resumable', true);
                                    r.save();
                                }
                            }, this);
                        }, this),
                        function() {
                            console.log('fail root.getDirectory(...)');
                        }
                    );
                }, this),
                function() {
                    console.log('fail requestFileSystem');
                }
            );
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
    },

    initDownload: function(value) {
        // hide the mask
        this.cancel();
        this.setValue(value);
        this.setExtent(this.getMap().getExtent());

        this.download();
    },

    initResumeDownload: function(record, btn, index) {
        this.resumeDownload(record);
    },

    download: function() {
        Ext.Viewport.setActiveItem(this.getMapSettingsView());
        this.getMapSettingsView().setActiveItem(1);

        var map = this.getMap(),
            zoom = map.getZoom(),
            value = this.getValue(),
            bounds = map.calculateBounds(),
            store = Ext.getStore('SavedMaps'),
            i = 0,
            z = zoom,
            range,
            cols,
            rows,
            loaded = 0,
            resolution,
            resolutions = [];
        while (i < this.getNbZoomLevels()) {
            resolution =  map.getResolutionForZoom(z);
            resolutions.push(resolution);
            range = getTileRangeForExtentAndResolution(
                map.layers[0], bounds, resolution);
            cols = range[2] - range[0] + 1;
            rows = range[3] - range[1] + 1;
            z++;
            i++;
        }

        var records = store.add({
            name: value,
            key: value,
            extent: this.getExtent(),
            resolutions: resolutions,
            done: 0,
            size: 0,
            date: new Date(Date.now()),
            tiles: {},
            downloading: true
        });
        store.sync();
        var record = records[0],
            uuid = record.getId();

        i = 0;
        z = zoom;
        var url, name;

        // defer the download so that the view and new map item are shown
        Ext.defer(function() {
            while (i < this.getNbZoomLevels()) {
                range = getTileRangeForExtentAndResolution(
                    map.layers[0], bounds, map.getResolutionForZoom(z));
                cols = range[2] - range[0] + 1;
                rows = range[3] - range[1] + 1;
                for (col = range[0]; col <= range[2]; col++) {
                    for (row = range[1]; row <= range[3]; row++) {
                        url = getURL(map.getLayersByName('Overlays')[0], col, row, z);
                        name = [ uuid, i, col, row ].join('_');
                        record.get('tiles')[url] = { dwl: false, name: name };
                        this.addToQueue(record, name, url);
                    }
                }
                z++;
                i++;
                record.save();
            }
        }, 800, this);

        function getURL(layer, tileX, tileY, tileZ) {
            var top, right, bottom, left,
                resolution = layer.map.getResolutionForZoom(tileZ);

            left = ( tileX * resolution * OpenLayers.Map.TILE_WIDTH ) + layer.maxExtent.left;
            bottom = ( tileY * resolution * OpenLayers.Map.TILE_HEIGHT ) + layer.maxExtent.bottom;
            right = left + resolution * OpenLayers.Map.TILE_WIDTH;
            top = bottom + resolution * OpenLayers.Map.TILE_HEIGHT;

            var url = layer.getURL(
                new OpenLayers.Bounds(left, bottom, right, top)
            );
            var params = OpenLayers.Util.getParameters(url);
            var layers = [];
            if (layer.map.baseLayer.layername) {
                layers.push(layer.map.baseLayer.layername);
            }
            if (params.LAYERS !== '') {
                layers.push(params.LAYERS);
            }
            params.LAYERS = layers.join(',');
            var base = url.split('?')[0];
            return [base, '?', OpenLayers.Util.getParameterString(params)].join('');
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

    addToQueue: function(record, name, url) {
        var queue = this.getQueue();
        queue.push([record, name, url]);

        // 8 tiles are downloaded at the same time
        if (this.getDownloadCount() <= 8) {
            var tile = queue.shift();
            this.downloadFile.apply(this, tile);
        }
    },


    downloadFile: function(record, name, url) {
        this.setDownloadCount(this.getDownloadCount() + 1);
        var fileName = name + '.png';
        this.getFileTransfer().download(
            url,
            this.getDirectory().fullPath + '/' + fileName,
            Ext.bind(function(file) {
                this.onDownloadSuccess(record, url, file);
            }, this),
            Ext.bind(function(error) {
                this.onDownloadError(record, error);
            }, this)
        );
    },

    onDownloadError: function(record, error) {
        record.set('errors', record.get('errors') + 1);
        this.checkCount(record);
    },

    onDownloadSuccess: function(record, url, fileEntry) {
        var percent,
            file,
            done = record.get('done')+1,
            tiles = record.get('tiles');

        record.set('done', done);
        percent =  Math.round(( done * 100 ) / Object.keys(tiles).length);

        tiles[url] = { dwl: true };
        fileEntry.file(Ext.bind(function(file) {
            record.set(
                'size',
                record.get('size') + parseInt(file.size,10)
            );
        }, this));

        // refresh view and save into local storage only every 5%
        if (percent%5 === 0) {
            record.save();
        }
        this.checkCount(record);
    },

    checkCount: function(r) {
        var queue = this.getQueue();
        if (queue.length) {
            var tile = queue.shift();
            this.downloadFile.apply(this, tile);
        }

        this.setDownloadCount(this.getDownloadCount() - 1);
        if (Object.keys(r.get('tiles')).length != r.get('done') + r.get('errors')) {
            return;
        }
        r.set('downloading', false);
        if (r.get('errors')) {
            r.set('resumable', true);
        }
        r.save();
    },

    resumeDownload: function(record) {
        record.set('downloading', true);
        record.set('resumable', false);
        record.set('errors', 0);
        Ext.iterate(record.get('tiles'), function(url, tile) {
            if (!tile.dwl) {
                this.addToQueue(record, tile.name, url);
                return;
            }
        }, this);
    },

    removeMap: function(dataview, ix, target, record, event, options) {
        this.setHolding(true);
        var actions = Ext.Viewport.add({
            xtype: 'actionsheet',
            items: [
                {
                    text: i18n.message("button.map_remove"),
                    ui: 'decline',
                    handler: function() {
                        this.deleteTiles(record);
                        actions.hide();
                    },
                    scope: this
                }, {
                    text: i18n.message("button.cancel"),
                    handler: function() {
                        actions.hide();
                    }
                }
            ]
        });
        actions.show();
        actions.on('hide', function() {
            this.setHolding(false);
        }, this);
    },

    selectMap: function(dataview, ix, target, record, event, options) {
        // prevent select to be fired if holding
        dataview.setDisableSelection(this.getHolding());
    },

    deleteTiles: function(record) {
        var id = record.get('id');
        var directoryReader = this.getDirectory().createReader();
        directoryReader.readEntries(
            function success(entries) {
                var toRemove = [], total = 0, count = 0;
                Ext.each(entries, function(entry) {
                    if (entry.name.indexOf(id) == 0) {
                        toRemove.push(entry);
                    }
                });
                total = toRemove.length;
                Ext.each(toRemove, function(entry) {
                    entry.remove(function(){
                        count++;
                        if (count == total) {
                            var store = record.stores[0];
                            store.remove(record);
                            store.sync();
                        }
                    }, function(){
                        console.log('fail to delete file');
                    });
                });
            },
            function() {
                console.log('fail to get directory reader');
            }
        );
    },

    /**
     * Function called when application is loaded and device has network, or
     * when application is offline and goes online again.
     *
     * Enables the download button.
     */
    enableDownload: function() {
        var baseLayer = this.getMainView().getMap().baseLayer;
        // enable the button only if user is not currently displaying a saved
        // map.
        if (baseLayer.name != 'savedmap') {
            Ext.ComponentQuery.query('button[action=download]')[0].setDisabled(false);
        }
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
