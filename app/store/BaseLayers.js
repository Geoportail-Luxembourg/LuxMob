Ext.define('App.store.BaseLayers', {
    extend: 'Ext.data.Store',
    requires: 'App.model.BaseLayers',
    config: {
        model: 'App.model.BaseLayers',
        proxy: {
            type: 'ajax',
            // "sc" (set cookie) is set in the query string if executing in
            // PhoneGap application. This is to be granted access to the web
            // services.
            url: "http://geoportail-luxembourg.demo-camptocamp.com/~elemoine-mobileevo/bglayers" +
                (window.device ? '?sc=' : ''),
            reader: {
                type: 'json'
            }
        }
    }
});
