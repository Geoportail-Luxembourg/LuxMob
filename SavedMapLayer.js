var SavedMapLayer = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    async: true,
    fs: null,
    uuid: null,

    initialize: function(name, options) {
        var url = '${z}/${x}/${y}.png';
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this,
            [name, url, options]);
    },

    getXYZ: function(bounds) {
        var res = this.getServerResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) /
            (res * this.tileSize.w));
        var y = Math.round((bounds.bottom - this.maxExtent.bottom) /
            (res * this.tileSize.h));
        var z = this.getServerZoom();

        if (this.wrapDateLine) {
            var limit = Math.pow(2, z);
            x = ((x % limit) + limit) % limit;
        }

        return {'x': x, 'y': y, 'z': z};
    },

    getURLasync: function(bounds, callback, scope) {
        var url = this.getURL(bounds);
        var fileName = this.uuid + '_' + url.replace(/\//g,'_');

        this.fs.root.getFile(
            fileName,
            null,
            function(fileEntry) {
                callback.call(scope, fileEntry.toURL());
            },
            function(error) {
                console.log("error getting file : " + fileName);
            }
        );
    }
});
