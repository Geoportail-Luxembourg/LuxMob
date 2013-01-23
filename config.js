App = {};
// define the map and layers
var tilecache_url =  [
    'http://tile2.geoportail.lu',
    'http://tile1.geoportail.lu',
    'http://tile3.geoportail.lu',
    'http://tile4.geoportail.lu'
];

function getBaseLayers() {
    var pixelmapsColor = new OpenLayers.Layer.TileCache(
        "pixelmaps-color",
        tilecache_url,
        'topo',
        {
            format: 'image/png',
            buffer: 1,
            transitionEffect: 'resize',
            tileLoadingDelay: 125
        }
    );
    var tourisme =  new OpenLayers.Layer.TileCache(
        "topo_tour_20k",
        tilecache_url,
        'topo_tour_20k',
        {
            format: 'image/png',
            buffer: 1,
            transitionEffect: 'resize',
            tileLoadingDelay: 125
        }
    );

    var topo_mobile = new OpenLayers.Layer.TileCache(
        "topo_mobile",
        tilecache_url,
        'topo_mobile',
        {
            format: 'image/jpeg',
            buffer: 1,
            transitionEffect: 'resize',
            tileLoadingDelay: 125
        }
    );
    var pixelmapsGray = new OpenLayers.Layer.TileCache(
        "pixelmaps-gray",
        tilecache_url,
        'topo_bw',
        {
            format: 'image/png',
            buffer: 1,
            transitionEffect: 'resize',
            tileLoadingDelay: 125
        }
    );
    var aerial = new OpenLayers.Layer.TileCache(
        "aerial",
        tilecache_url,
        'ortho',
        {
            format: 'image/jpeg',
            buffer: 0,
            transitionEffect: 'resize',
            tileLoadingDelay: 125
        }
    );
    var parcels = new OpenLayers.Layer.TileCache(
        "parcels",
        tilecache_url,
        'cadastre',
        {
            format: 'image/png',
            buffer: 0,
            transitionEffect: 'resize',
            tileLoadingDelay: 125
        }
    );

    var streets = new OpenLayers.Layer.TileCache(
        "streets",
        tilecache_url,
        'streets_jpeg',
        {
            format: 'image/jpeg',
            buffer: 0,
            transitionEffect: 'resize',
            tileLoadingDelay: 125
        }
    );

    return [topo_mobile, pixelmapsGray, tourisme, aerial, parcels, streets];
}

App.map = new OpenLayers.Map({
    theme: null,
    projection: new OpenLayers.Projection("EPSG:2169"),
    displayProjection: new OpenLayers.Projection("EPSG:2169"),
    units: "m",
    maxExtent: OpenLayers.Bounds.fromArray([48000,57000,107000,139000]),
    restrictedExtent: OpenLayers.Bounds.fromArray([40000,50000,120000,150000]),
    resolutions: [500.0, 250.0, 150.0, 100.0, 50.0, 20.0, 10.0, 5.0, 2.0, 1.0, 0.5],
    controls: [
        new OpenLayers.Control.TouchNavigation({
            dragPanOptions: {
                interval: 1,
                enableKinetic: true
            }
        }),
        new OpenLayers.Control.ScaleLine({geodesic: true})
    ],
    layers: getBaseLayers()
});

var format = new OpenLayers.Format.WMSCapabilities();
OpenLayers.Request.GET({
    // FIXME load capabilities from mapproxy service
    url: "capabilities.xml",
    params: {
        SERVICE: "WMS",
        VERSION: "1.1.1",
        REQUEST: "GetCapabilities"
    },
    success: function(request) {
        var doc = request.responseXML;
        if (!doc || !doc.documentElement) {
            doc = request.responseText;
        }
        var capabilities = format.read(doc);
        var layers = [],
            l = capabilities.capability.layers;
        for (var i = 0; i < l.length; i++) {
            layers.push(l[i].name);
        }
        App.map.addLayer(
            new OpenLayers.Layer.WMS(
                "Overlays",
                "http://geoportail-luxembourg.demo-camptocamp.com/~sbrga/mapproxy/service",
                {
                    layers: [],
                    transparent: true
                },
                {
                    allLayers: layers,
                    visibility: false
                }
            )
        );
    }
});
