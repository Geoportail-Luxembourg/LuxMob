Ext.define('App.view.Main', {
    extend: 'Ext.Container',
    xtype: 'mainview',
    requires: [
        'App.plugin.StatefulMap',
        'Ext.field.Search'
    ],
    id: "mainView",
    config: {
        map: null,
        plugins: 'statefulmap',
        center: null,
        zoom: null,
        baseLayer: null,
        layout: 'vbox',
        items: [ ]
    },

    initialize: function() {
        this.callParent(arguments);
        this.on('painted', this.render, this, {
            single: true
        });
        _paq = [];
    },


    openApp: function() {
        var map_id = OpenLayers.Util.getParameters().map_id;
        var qs = (map_id) ? 'map_id='+map_id : '';
        var app = "luxmob:///?" + qs;
        var storeUrl = App.util.Config.getAppStoreUrl();

        var w;
        // wait a bit
        // if application has started, this code shouldn't be executed
        // until the browser is open again
        // Note: this doesn't seem to work well with chrome on Android
        var loadDateTime = new Date();
        window.setTimeout(function() {
            var timeOutDateTime = new Date();
            if (timeOutDateTime - loadDateTime < 5000) {
                window.location = storeUrl;
            }
            if (Ext.os.is('Android')) {
                w.close();
            }
        }, 2000);
        if (Ext.os.is('Android')) {
            // open the url scheme in new tab
            w = window.open(app, '_blank');
        } else {
            window.location = app;
        }
    },

    applyItems: function(items, collection) {
        items = [];
        // FIXME Temporary disable app download message
        if (!App.util.Config.isNativeApp()
            && !localStorage.getItem('disable_app_prompt')) {
            var toolbar = {
                xtype: 'toolbar',
                docked: 'top',
                ui: 'plain',
                id: 'appwarning',
                items: [
                    {
                        text: Ext.i18n.Bundle.message('button.open_in_app'),
                        handler: this.openApp,
                        scope: this
                    },
                    {
                        xtype: 'spacer'
                    },
                    {
                        text: Ext.i18n.Bundle.message('button.close'),
                        handler: function() {
                            Ext.getCmp('appwarning').destroy();
                            localStorage.setItem('disable_app_prompt', true);
                        }
                    }
                ]
            };
            items.push(toolbar);
        }
        items.push({
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
                    width: 100,
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
                    right: 4
                }, {
                    xtype: "button",
                    iconCls: "more",
                    iconMask: true,
                    action: "more",
                    bottom: 4,
                    right: 4
                }
            ]
        });
        return this.callParent([items, collection]);
    },

    setCenterZoomBgFromQueryParams: function() {
        var queryParams = OpenLayers.Util.getParameters();
        if (queryParams.X && queryParams.Y && queryParams.zoom) {
            // Note: Y -> lon, X -> lat
            this.setCenter(
                new OpenLayers.LonLat(queryParams.Y, queryParams.X));
            this.setZoom(queryParams.zoom);
        }
        if (queryParams.bgLayer) {
            this.setBaseLayer(queryParams.bgLayer);
        }

        if (parseFloat(queryParams.bgOpacity) === 0) {
            this.setBaseLayer('Aerial Images');
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

        this.setCenterZoomBgFromQueryParams();

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

        var name = this.getBaseLayer();
        if (name) {
            map.setBaseLayer(map.getLayersByName(name)[0]);
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

        map.addControls([
            new GeolocateControl()
        ]);
        if (!Ext.os.is.iOS) {
            map.addControls([new OpenLayers.Control.Zoom()]);
        }
        this.fireEvent('mapready', map);
        
        

        _paq.push(["trackPageView"]);
        _paq.push(["enableLinkTracking"]);

        (function() {
        var u=(("https:" == document.location.protocol) ? "https" : "http") + "://statistics.geoportail.lu/";
        _paq.push(["setTrackerUrl", u+"piwik.php"]);
        if (!window.device){
	        _paq.push(["setSiteId", "12"]);}
	    else{
	        _paq.push(["setSiteId", "13"]);
	    }
        var d=document, g=d.createElement("script"), s=d.getElementsByTagName("script")[0]; g.type="text/javascript";
        g.defer=true; g.async=true; g.src=u+"piwik.js"; s.parentNode.insertBefore(g,s);
        })();
        
        
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
        var tolerance = 25;
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
