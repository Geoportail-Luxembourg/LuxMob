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
        }]
    },

    setFeature: function(feature) {
        this.getDockedItems()[0].setTitle(feature.attributes.name);
        this.down('#featuredescription').setData(feature.attributes);
    }
});
