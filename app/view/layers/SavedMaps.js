window.i18n = Ext.i18n.Bundle;
Ext.define('App.view.layers.SavedMaps', {
    extend: 'Ext.Panel',

    id: "savedmaps",
    config: {
        cls: "card",
        html: "<p class='action'>" + i18n.message('savedmaps.html') + "</p>"
    }
});
