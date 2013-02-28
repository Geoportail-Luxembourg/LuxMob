Ext.define('App.controller.MyMaps', {
    extend: 'Ext.app.Controller',
    requires: [
        'App.view.MyMaps'
    ],

    config: {
        myMapPreview: null,
        refs: {
            mainView: '#mainView',
            myMapsView: {
                selector: '#myMapsView',
                xtype: 'mymapsview',
                autoCreate: true
            },
            myMapsList: '#myMapsList'
        },
        control: {
            myMapsList: {
                select: function(list, record) {
                    this.redirectTo('main/map/' + record.get('uuid'));
                }
            },
            'button[action=backtomymaps]': {
                tap: 'showMyMaps'
            }
        },
        routes: {
            'mymaps': 'showMyMaps',
            'main/map/:id': 'showMyMap'
        }
    },

    showMyMaps: function() {
        var animation = {type: 'cover', direction: "up"};
        Ext.Viewport.animateActiveItem(
            this.getMyMapsView(),
            animation
        );
    },

    showMyMap: function(id) {
        this.getApplication().getController('Main').showMain();

        var preview = this.getMyMapPreview();
        if (!preview) {
            preview = this.getMainView().add({
                xtype: 'container',
                cls: 'results-preview',
                height: 50,
                padding: 5,
                style: {
                    message: i18n.message('querying'),
                    backgroundColor: 'white'
                },
                masked: {
                    xtype: 'loadmask',
                    indicator: false
                },
                items: [{
                    xtype: 'button',
                    ui: 'plain',
                    text: ' ',
                    height: '2.2em',
                    cls: 'x-textalign-left',
                    iconCls: 'delete',
                    iconMask: true,
                    iconAlign: 'right',
                    listeners: {
                        element: 'element',
                        tap: function() {
                        }
                    }
                }]
            });
            this.setMyMapPreview(preview);
        } else {
            preview.mask();
            preview.show();
        }
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

        var tpl = new Ext.Template(
            '{title}',
            '<br/><small>{nb_features} ',
            OpenLayers.i18n('mobile.features'),
            '</small>'
        );

        function loadFeatures(mymap) {
            Ext.Ajax.request({
                url: 'http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/mymaps/' + mymap.uuid + '/features',
                success: function(response) {
                    var format = new OpenLayers.Format.GeoJSON();
                    var features = format.read(response.responseText);

                    preview.getAt(0).setText(tpl.apply({
                        title: mymap.title + ' ...',
                        nb_features: features.length
                    }));
                    preview.unmask();
                }
            });
        }

        Ext.Ajax.request({
            url: 'http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/mymaps/' + id,
            success: function(response) {
                var mymap = Ext.JSON.decode(response.responseText);
                loadFeatures(mymap);
            }
        });
    }
});
