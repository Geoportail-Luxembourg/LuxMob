Ext.define('App.controller.Search', {
    extend: 'Ext.app.Controller',

    requires: [
    ],
    config: {
        refs: {
            searchView: '#searchView',
            searchField: '#searchField',
            fakeSearch: '#fakeSearch'
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
                    this.getSearchField().setValue(record.get('label'));
                    this.getFakeSearch().setValue(record.get('label'));
                    App.map.zoomToExtent(OpenLayers.Bounds.fromArray(record.get('bbox')));
                    this.redirectTo('');
                    list.deselectAll();
                }
            }
        }
    }
});
