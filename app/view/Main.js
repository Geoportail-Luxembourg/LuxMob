window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.Main', {
    extend: 'Ext.Container',
    xtype: 'mainview',
    requires: [
        'App.plugin.StatefulMap'
    ],
    id: "mainView",
    config: {
        map: null,
        plugins: 'statefulmap',
        center: null,
        zoom: null,
        vectorLayer: null,
        layout: 'vbox',
        items: [ ]
    },

    initialize: function() {
        this.callParent(arguments);
        this.on('painted', this.render, this, {
            single: true
        });
    },

    applyItems: function(items, collection) {
        items = [
            {
                xtype: 'container',
                cls: 'x-toolbar', // trick to get the search field displaying as in a toolbar
                layout: 'fit',
                flex: 1,
                items: [
                    {
                        xtype: 'component',
                        id: "map-container",
                        height: '100%',
                        style: {
                            position: 'relative',
                            zIndex: 0
                        }
                    }, {
                        xtype: "searchfield",
                        width: 150,
                        action: "search",
                        id: 'fakeSearch',
                        clearIcon: false,
                        top: 0,
                        left: 3
                    }, {
                        xtype: "button",
                        iconCls: "layers",
                        iconMask: true,
                        action: "mapsettings",
                        top: 6,
                        right: 4
                    }, {
                        xtype: "button",
                        iconCls: "more",
                        iconMask: true,
                        action: "more",
                        bottom: 6,
                        right: 4
                    }
                ]
            }
        ];
        return this.callParent([items, collection]);
    },

    setCenterZoomFromQueryParams: function() {
        var queryParams = OpenLayers.Util.getParameters();
        if (queryParams.X && queryParams.Y && queryParams.zoom) {
            // Note: Y -> lon, X -> lat
            this.setCenter(
                new OpenLayers.LonLat(queryParams.Y, queryParams.X));
            this.setZoom(queryParams.zoom);
        }
    },

    updateMap: function(map) {
        this.fireEvent('setmap', this, map);
    },

    // initial rendering
    render: function(component) {
        var map = this.getMap();
        var mapContainer = this.down('#map-container').element;
        map.render(mapContainer.dom);

        this.setCenterZoomFromQueryParams();

        // required so that the map gets effectively displayed
        // height = 0 if not set
        map.viewPortDiv.style.position = "absolute";

        var center = this.getCenter(),
            zoom = this.getZoom();
        if (center && zoom) {
            map.setCenter(center, zoom);
        } else {
            map.zoomToMaxExtent();
        }

        Ext.get(mapContainer).on('longpress', function(event, node) {
            var map = this.getMap();
            var el = Ext.get(map.div);
            var pixel = new OpenLayers.Pixel(
                event.pageX - el.getX(),
                event.pageY - el.getY()
            );
            var bounds = this.pixelToBounds(pixel);
            this.fireEvent('query', this, bounds, map, event);
        }, this);

        // highlight layer
        this.setVectorLayer(new OpenLayers.Layer.Vector('Vector', {
            rendererOptions: {zIndexing: true},
            styleMap: new OpenLayers.StyleMap({
                'default': OpenLayers.Util.applyDefaults({
                    strokeWidth: 3,
                    strokeColor: 'red',
                    graphicZIndex: 0
                }, OpenLayers.Feature.Vector.style['default'])
            })
        }));
        map.addLayer(this.getVectorLayer());

        map.addControls([
            new GeolocateControl()
        ]);
        if (!Ext.os.is.iOS) {
            map.addControls([new OpenLayers.Control.Zoom()]);
        }
        this.fireEvent('mapready', map);
    },



    /**
     * Method: pixelToBounds
     * Takes a pixel as argument and creates bounds after adding the
     * <clickTolerance>.
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>}
     */
    pixelToBounds: function(pixel) {
        var tolerance = 40;
        var llPx = pixel.add(-tolerance/2, tolerance/2);
        var urPx = pixel.add(tolerance/2, -tolerance/2);
        var ll = this.getMap().getLonLatFromPixel(llPx);
        var ur = this.getMap().getLonLatFromPixel(urPx);
        return new OpenLayers.Bounds(
            parseInt(ll.lon),
            parseInt(ll.lat),
            parseInt(ur.lon),
            parseInt(ur.lat)
        );
    }
});
