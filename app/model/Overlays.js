Ext.define('App.model.Overlays', {
    extend: 'Ext.data.Model',

    config: {
        fields: [{
            name: 'name'
        }, {
            name: 'label'
        }, {
            name: 'exclusion'
        }, {
            name: 'themes'
        }, {
            name: 'fr',
            convert: function(value, record) {
                var label = record.get('label');
                return OpenLayers.Lang.fr[label] || label;
            }
        }, {
            name: 'en',
            convert: function(value, record) {
                var label = record.get('label');
                return OpenLayers.Lang.en[label] || label;
            }
        }, {
            name: 'de',
            convert: function(value, record) {
                var label = record.get('label');
                return OpenLayers.Lang.de[label] || label;
            }
        }, {
            name: 'lb',
            convert: function(value, record) {
                var label = record.get('label');
                return OpenLayers.Lang.lu[label] || label;
            }
        }]
    }
});
