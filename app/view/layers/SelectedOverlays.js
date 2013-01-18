Ext.define('App.view.layers.SelectedOverlays', {
    extend: 'Ext.form.Panel',
    requires: [
        'Ext.form.Checkbox'
    ],

    id: 'selectedOverlaysList',

    config: {
        scrollable: false,
        defaults: {
            xtype: 'checkboxfield',
            labelWidth: '80%'
        },
        items: [{
            xtype: "button",
            id: "addOverlaysButton",
            action: "addOverlays",
            text: i18n.message('selectedoverlays.selectlayers'),
            iconCls: "code3",
            iconMask: true,
            iconAlign: "right"
        }]
    }
});
