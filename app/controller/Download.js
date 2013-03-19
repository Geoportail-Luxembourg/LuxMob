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
                itemswipe: 'removeMap'
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
    },

    initDownload: function(value) {
        // hide the mask
        this.cancel();
        this.setValue(value);
        this.setExtent(this.getMap().getExtent());

        this._setup(this.download);
    },

    initResumeDownload: function(record, btn, index) {
        this.setValue(record.get('name'));
        this.setCount(0);
        this._setup(this.resumeDownload, record);
    },

    _setup: function(callback, arg) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            Ext.bind(function(fs) {
                fs.root.getFile(
                    "dummy.html",
                    {create: true, exclusive: false},
                    Ext.bind(function (fileEntry) {
                        var basePath = fileEntry.fullPath.replace("dummy.html","");
                        var args = [fs, basePath, new FileTransfer()];
                        if (arg) { args.push(arg); }
                        callback.apply(this, args);
                    }, this),
                    function() {
                        console.log('fail root.getFile("dummy.html")');
                    }
                );
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
            total += cols * rows;
            z++;
            i++;
        }
        this.setTotal(total);

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

        Ext.Viewport.setActiveItem(this.getMapSettingsView());
        this.getMapSettingsView().setActiveItem(1);

        i = 0;
        z = zoom;
        var delay = 0, url, name;
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
                    Ext.Function.defer(
                        this.downloadFile,
                        delay,
                        this,
                        [ name, url, basePath, fileTransfer ]
                    );
                    delay += 5;
                }
            }
            z++;
            i++;
        }

        function getURL(layer, tileX, tileY, tileZ) {
            var top, right, bottom, left,
                resolution = layer.map.getResolutionForZoom(tileZ);

            left = ( tileX * resolution * OpenLayers.Map.TILE_WIDTH ) + layer.maxExtent.left;
            bottom = ( tileY * resolution * OpenLayers.Map.TILE_HEIGHT ) + layer.maxExtent.bottom;
            right = left + resolution * OpenLayers.Map.TILE_WIDTH;
            top = bottom + resolution * OpenLayers.Map.TILE_HEIGHT;

             return layer.getURL(
                 new OpenLayers.Bounds(left, bottom, right, top)
             ).replace(/LAYERS=/, 'LAYERS=' + layer.map.baseLayer.layername + ',');
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
        var fileName = name + '.png';
        fileTransfer.download(
            url,
            basePath + fileName,
            Ext.bind(function(file) {
                this.increaseAndCheck(url, file);
            }, this),
            Ext.bind(function(error) {
                console.log("download error source: " + error.source);
                console.log("download error target: " + error.target);
                console.log("upload error code: " + error.code);
            }, this)
        );
    },

    increaseAndCheck: function(url, fileEntry) {
        var ls = localStorage,
            value = this.getValue(),
            store = Ext.getStore('SavedMaps'),
            percent,
            file,
            record;
        this.setCount(this.getCount()+1);

        record = store.findRecord('name', value);
        percent =  Math.round(( this.getCount() * 100 ) / this.getTotal());
        record.get('tiles')[url] = { dwl: true };
        record.set('done', percent);
        if (percent === 100) {
            record.set('downloading', false);
        }

        fileEntry.file(function(file) {
            record.set(
                'size',
                record.get('size') + parseInt(file.size,10)
            );
            record.save();
        });

        if (this.getTotal()!=this.getCount()) {
            return;
        }
        this.setCount(0);
        this.setTotal(0);
    },

    resumeDownload: function(fs, basePath, fileTransfer, record) {
        var total = 0,
            toResume = [];
        Ext.iterate(record.get('tiles'), function(url, tile) {
            total++;
            if (tile.dwl) {
                this.setCount(this.getCount()+1);
                return;
            }
            toResume.push([tile.name, url, basePath, fileTransfer]);
        }, this);
        this.setTotal(total);
        Ext.each(toResume, function(args) {
            this.downloadFile.apply(this, args);
        }, this);
    },

    removeMap: function(dataview, ix, target, record, event, options) {
        var del = Ext.create("Ext.Button", {
            ui: "decline",
            text: i18n.message('button.map_remove'),
            style: "position:absolute;right:0;",
            handler: function(btn, event) {
                event.preventDefault();
                event.stopPropagation();
                this.deleteTiles(record, function(record) {
                    var store = record.stores[0];
                    store.remove(record);
                    store.sync();
                });
            },
            scope: this
        });
        var removeDeleteButton = function() {
            Ext.Anim.run(del, 'fade', {
                after: function() {
                    del.destroy();
                },
                out: true
            });
        };
        del.renderTo(Ext.DomQuery.selectNode(".deleteplaceholder", target.bodyElement.dom));
        dataview.on({
            single: true,
            buffer: 250,
            itemtouchstart: removeDeleteButton
        });
        dataview.element.on({
            single: true,
            buffer: 250,
            touchstart: removeDeleteButton
        });
    },

    deleteTiles: function(record, callback) {
        var id = record.get('id');
        this._setup(function(fs, basePath, fileTransfer) {
            fs.root.getDirectory(basePath, null,
                function(dirEntry) {
                    var directoryReader = dirEntry.createReader();
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
                                        callback.apply(this, [record]);
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
                function() {
                    console.log('fail to get directory');
                }
            );
        });
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
