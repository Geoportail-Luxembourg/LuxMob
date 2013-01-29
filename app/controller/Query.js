Ext.define('App.controller.Query', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.Anim',
        'Ext.data.proxy.JsonP'
    ],

    config: {
        protocol: null,
        resultsPreview: null,
        map: null,
        refs: {
            mainView: '#mainView'
        },
        control: {
            mainview: {
                mapready: function(map) {
                    Ext.get(App.map.viewPortDiv).on({
                        touchstart: function() {
                            this.hidePreview();
                        },
                        scope: this
                    });
                    this.setMap(map);
                }
            }
        },
        routes: {
            'query/:coords': {
                action: 'launchSearch',
                condition: '.+'
            }
        }
    },

    launchSearch: function(params) {
        // initial rendering
        var map = this.getMap();
        if (!map) {
            // application is just launched
            this.redirectTo('');
            return;
        }

        params = decodeURIComponent(params);
        params = params.split('-');

        this.showPreview();

        // FIXME defer is for debug, simulate a real query
        Ext.defer(
            function() {
                Ext.define('Query', {
                    extend: 'Ext.data.Model',
                    config: {
                        fields: ['id', 'properties']
                    }
                });

                var store = Ext.create('Ext.data.Store', {
                    model: 'Query',
                    proxy: {
                        type: 'jsonp',
                        url : "http://tourisme.geoportail.lu/bodfeature/search",
                        callbackKey: 'cb',
                        reader: {
                            rootProperty: 'features'
                        }
                    }
                });

                store.load({
                    params: {
                        bbox: params[0],
                        layers: params[1],
                        scale: params[2],
                        nohtml: true
                    },
                    callback: function() {
                        var preview = this.getResultsPreview();
                        preview.unmask();
                        var html;
                        var count = store.getCount();
                        if (count === 0) {
                            html = i18n.message('query.noresults');
                        } else if (count > 1) {
                            html = i18n.message('query.results', {
                                count: count
                            });
                        } else {
                            html = store.getAt(0).get('properties').TEXT;
                        }
                        this.getResultsPreview().setHtml(html);
                    },
                    scope: this
                });
            },
            500,
            this
        );
    },

    showPreview: function() {
        this.hidePreview();
        var preview = this.getMainView().add({
            xtype: 'container',
            height: 50,
            padding: 5,
            style: {
                backgroundColor: 'white'
            },
            masked: {
                xtype: 'loadmask',
                message: i18n.message('querying'),
                indicator: false
            }
        });
        Ext.Animator.run({
            element: preview.element,
            easing: 'easeInOut',
            out: false,
            autoClear: false,
            preserveEndState: true,
            from: {
                height: 0
            },
            to: {
                height: preview.getHeight()
            }
        });
        this.setResultsPreview(preview);
    },

    hidePreview: function() {
        var preview = this.getResultsPreview();
        if (preview) {
            Ext.Animator.run({
                element: preview.element,
                easing: 'easeInOut',
                out: false,
                autoClear: false,
                preserveEndState: true,
                from: {
                    height: preview.getHeight()
                },
                to: {
                    height: 0
                },
                listeners: {
                    animationend: function() {
                        preview.getParent().remove(preview);
                        this.setResultsPreview(null);
                    },
                    scope: this
                }
            });
        }
    }
});
