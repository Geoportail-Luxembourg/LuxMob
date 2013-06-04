window.i18n = Ext.i18n.Bundle;
Ext.define("App.view.MyMapFeatureDetail", {
    extend: 'Ext.Panel',
    xtype: 'mymapfeaturedetailview',
    id: "myMapFeatureDetailView",
    requires: [ ],

    config: {
        layout: 'vbox',
        feature: null,
        fullscreen: true,
        scrollable: true,
        padding: 10,
        mainMap: null,
        map: null,
        items: [{
            docked: 'top',
            xtype: 'toolbar',
            title: i18n.message('mymap.detail.title'),
            items: [{
                xtype: "button",
                text: i18n.message('button.back'),
                ui: 'back',
                action: "back"
            }]
        }, {
            xtype: 'component',
            pseudo: 'map',
            flex: 1
        }, {
            pseudo: 'featuredescription',
            tpl: [
                '<div class="title">{title}</div>',
                '<div class="description">{description}</div>'
            ],
            data: null,
            flex: 1
        }]
    },

    updateFeature: function(feature) {
        var title = '';
        if (feature.attributes.thumbnail) {
            title += '<img src="' +
                App.util.Config.getWsgiUrl() +
                feature.attributes.thumbnail +
                '" style="height:30px;padding-right:5px;"/>';
        }
        title += feature.attributes.name;

        this.down('[pseudo=featuredescription]').setData({
            title: title,
            description: feature.attributes.description
        });

        if (feature.geometry instanceof OpenLayers.Geometry.LineString) {
            console.log("FIXME! I'm the profile, don't forget me!");
        }

        var map = this.getMap(),
            mainMap = this.getMainMap();
        if (map) {
            map.destroy();
        }
        var vectorLayer = new OpenLayers.Layer.Vector("vector", {
            styleMap: new OpenLayers.StyleMap({
                "default": OpenLayers.Util.applyDefaults({
                    strokeWidth: 4
                }, OpenLayers.Feature.Vector.style['default'])
            })
        });
        vectorLayer.addFeatures([
            new OpenLayers.Feature.Vector(feature.geometry.clone())
        ]);
        var config = OpenLayers.Util.applyDefaults({
            div: this.down('[pseudo=map]').element.dom,
            controls: [],
            layers: [
                mainMap.baseLayer.clone(),
                vectorLayer
            ]
        }, App.util.Config.getMapConfig());
        this.setMap(new OpenLayers.Map(config));
        this.getMap().viewPortDiv.style.position = "absolute";
        this.getMap().zoomToExtent(feature.geometry.getBounds());
    }
});
