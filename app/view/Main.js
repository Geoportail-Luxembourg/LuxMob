window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.Main', {
    extend: 'Ext.Container',
    xtype: 'mainview',
    requires: [
        'Ext.field.Search',
        'App.plugin.StatefulMap'
    ],
    id: "mainView",
    config: {
        map: null,
        plugins: 'statefulmap',
        center: null,
        zoom: null,
        vectorLayer: null,
        layout: 'fit',
        items: [
            {
                xtype: "toolbar",
                docked: "top",
                items: [{
                    xtype: "searchfield",
                    flex: 4,
                    action: "search"
                }, {
                    xtype: "spacer"
                }, {
                    xtype: "button",
                    iconCls: "layers",
                    action: "mapsettings",
                    iconMask: true
                }, {
                    xtype: "button",
                    iconCls: "settings",
                    action: "settings",
                    iconMask: true
                }]
            }, {
                xtype: 'component',
                id: "map-container"
            }
        ]
    },

    initialize: function() {
        this.callParent(arguments);
        this.on('painted', this.render, this, {
            single: true
        });
    },

    setCenterZoomFromQueryParams: function() {
        var queryParams = OpenLayers.Util.getParameters();
        if (queryParams.x && queryParams.y && queryParams.zoom) {
            this.setCenter(
                new OpenLayers.LonLat(queryParams.x, queryParams.y));
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

        var center = this.getCenter(),
            zoom = this.getZoom();
        if (center && zoom) {
            map.setCenter(center, zoom);
        } else {
            map.zoomToMaxExtent();
        }

        mapContainer.on('longpress', function(event, node) {
            var map = this.getMap();
            var el = Ext.get(map.div);
            var pixel = new OpenLayers.Pixel(
                event.pageX - el.getX(),
                event.pageY - el.getY()
            );
            var bounds = this.pixelToBounds(pixel);
            this.fireEvent('longpress', this, bounds, map, event);
        }, this);

        // highlight layer
        this.setVectorLayer(new OpenLayers.Layer.Vector('Vector', {
            styleMap: new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults({
                strokeWidth: 3,
                strokeColor: 'red'
            }, OpenLayers.Feature.Vector.style['default']))
        }));
        map.addLayer(this.getVectorLayer());

        map.addControls([
            new OpenLayers.Control.Zoom(),
            new GeolocateControl()
        ]);
        this.fireEvent('mapready', map);
    }
});
