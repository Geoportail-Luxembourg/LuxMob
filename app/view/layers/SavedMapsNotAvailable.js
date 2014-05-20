Ext.define('App.view.layers.SavedMapsNotAvailable', {
    extend: 'Ext.Panel',

    config: {
        layout: 'fit',
        items: [{
            xtype: "toolbar",
            title: foobar('savedmaps.title'),
            docked: "top",
            items: [{
                xtype: "button",
                text: foobar('button.close'),
                action: "main",
                iconMask: true
            }]
        }, {
            xtype: 'panel',
            cls: "card",
            html: "<p class='action'>" + foobar('savedmaps.html') + "</p>"
        }]
    }
});

