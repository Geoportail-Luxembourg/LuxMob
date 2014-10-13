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
            title: Ext.i18n.Bundle.message('mymap.detail.title'),
            items: [{
                xtype: "button",
                text: Ext.i18n.Bundle.message('button.back'),
                ui: 'back',
                action: "back"
            }, {
                xtype: 'spacer'
            }, {
                xtype: "button",
                iconCls: "action2",
                iconMask: true,
                action: "export"
            }]
        }, {
            xtype: 'component',
            pseudo: 'map',
            flex: 1
        }, {
            flex: 1,
            items: [{
                pseudo: 'featuredescription',
                tpl: [
                    '<div class="title">{title}</div>',
                    '<div class="description">{description}</div>'
                ],
                data: null
            }, {
                cls: 'profile',
                layout: {
                    type: 'vbox',
                    align: 'left'
                }
            }]
        }]
    },

    updateFeature: function(feature) {
        var title = '';
        if (feature.attributes.thumbnail) {
            // we intentionaly use getAppWsgiUrl here so that we get absolute
            // urls (no urls like "//images/xxxx.png")
            title += '<img src="' +
                App.util.Config.getAppWsgiUrl() +
                feature.attributes.thumbnail +
                '" style="height:30px;padding-right:5px;"/>';
        }
        title += feature.attributes.name;

        this.down('[pseudo=featuredescription]').setData({
            title: title,
            description: feature.attributes.description
        });

        this.down('[cls=profile]').removeAll();
        if (feature.geometry instanceof OpenLayers.Geometry.LineString) {
            this.down('[cls=profile]').add({
                xtype: 'button',
                text: Ext.i18n.Bundle.message('mymaps.profile'),
                cls: 'link',
                iconCls: 'chart2',
                iconMask: true,
                handler: function() {
                    this.fireEvent(
                        'profile',
                        this.getFeature()
                    );
                },
                scope: this
            });
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
