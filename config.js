App = {};
// define the map and layers
App.map = new OpenLayers.Map({
    theme: null,
    projection: 'EPSG:900913',
    controls: [
        new OpenLayers.Control.TouchNavigation({
            dragPanOptions: {
                interval: 1,
                enableKinetic: true
            }
        }),
        new OpenLayers.Control.ScaleLine({geodesic: true})
    ],
    layers: [
        new OpenLayers.Layer.OSM("OpenStreetMap", null, {
            transitionEffect: 'resize'
        }),
        new OpenLayers.Layer.OSM(
            "Cycle Map",
            [
                "http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
                "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
                "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"
            ],
            {
                transitionEffect: 'resize'
            }
        ),
        new OpenLayers.Layer.WMS(
            "Overlays",
            "http://www.camptocamp.org/cgi-bin/c2corg_wms",
            {
                layers: [],
                transparent: true
            },
            {
                allLayers: ['summits', "huts", "sites", "users"],
                singleTile: true,
                ratio: 1,
                visibility: false
            }
        )
    ]
});
