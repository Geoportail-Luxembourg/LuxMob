window.i18n = Ext.i18n.Bundle;
Ext.define("App.view.MyMapFeatureDetail", {
    extend: 'Ext.Panel',
    xtype: 'mymapfeaturedetailview',
    requires: [ ],

    config: {
        layout: 'vbox',
        feature: null,
        cls: 'my_map_feature_preview',
        items: [{
            xtype: 'toolbar',
            docked: 'top',
            ui: 'light',
            items: [{
                xtype: 'spacer'
            }, {
                xtype: 'button',
                action: 'hidefeaturedetail',
                iconCls: 'arrow_down',
                iconMask: true,
                ui: 'plain',
                align: 'right'
            }]
        }, {
            id: 'featuredescription',
            tpl: [
                '<div class="description">{description}</div>'
            ],
            data: null
        }, {
            cls: 'export-links',
            html: [
                '<a class="export" href="javascript:void(0);">GPX</a>',
                '<a class="export" href="javascript:void(0);">KML</a>'
            ].join(' ')
        }]
    },

    initialize: function() {
        this.on({
            tap: {
                fn: function(e, node) {
                    this.fireEvent(
                        'export',
                        this.getFeature().attributes.name,
                        this.getFeature().attributes.description,
                        [this.getFeature()],
                        e.target.innerHTML
                    );
                },
                element: 'innerElement',
                delegate: '.export-links a.export'
            },
            scope: this
        });
        this.on({
            tap: {
                fn: function(e, node) {
                    this.fireEvent(
                        'profile',
                        this.getFeature()
                    );
                },
                element: 'innerElement',
                delegate: '.export-links a.profile'
            },
            scope: this
        });
    },

    updateFeature: function(feature) {
        this.getDockedItems()[0].setTitle(feature.attributes.name);
        this.down('#featuredescription').setData(feature.attributes);

        if (feature.geometry instanceof OpenLayers.Geometry.LineString) {
            Ext.DomHelper.append(
                this.down('[cls=export-links]').innerHtmlElement,
                '<a class="profile" href="javascript:void(0);">Profile</a>'
            );
        }
    }
});
