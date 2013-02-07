var SavedMapLayer = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    async: true,

    initialize: function(name, options) {
        var url = '${x}/${y}/${z}.png';
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this,
            [name, url, options]);
    },

    getURLasync: function(bounds, callback, scope) {
        var url = this.getURL(bounds);
        var fileName = this.name + '_' + url.replace(/\//g,'_');

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            Ext.bind(function(fs) {
                fs.root.getFile(
                    fileName,
                    null,
                    function(fileEntry) {
                        console.log('******', fileEntry);
                        callback.call(scope, fileEntry.toURL());
                    },
                    function(error) {
                        console.log("error getting file : " + fileName);
                    }
                );
            }, this),
            function() {
                console.log('fail requestFileSystem');
            }
        );
    }
});
