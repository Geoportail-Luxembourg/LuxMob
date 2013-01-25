Ext.define('App.controller.Search', {
    extend: 'Ext.app.Controller',

    requires: [
    ],
    config: {
        refs: {
            searchView: '#searchView',
            searchField: '#searchField'
        },
        control: {
            searchField: {
                keyup: function(field) {
                    var store = this.getSearchView().getStore();
                    store.load({
                        params: {
                            query: field.getValue()
                        }
                    });
                }
            },
            searchView: {
                select: function(list, record) {
                    App.map.zoomToExtent(OpenLayers.Bounds.fromArray(record.get('bbox')));
                    this.redirectTo('');
                }
            }
        }
    }
});
