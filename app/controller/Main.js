window.i18n = Ext.i18n.Bundle;
Ext.define('App.controller.Main', {
    extend: 'Ext.app.Controller',

    requires: [
        'App.view.layers.MapSettings',
        'App.view.Settings',
        'App.view.MoreMenu',
        'App.view.Search',
        'App.view.Login',
        'App.view.MyMaps',
        'Ext.field.Email'
    ],
    config: {
        myMapPreview: null,
        refs: {
            mainView: '#mainView',
            moreMenu: '#moreMenu',
            mapSettingsView: '#mapSettingsView',
            settingsView: {
                selector: '#settingsView',
                xtype: 'settingsview',
                autoCreate: true
            },
            searchView: {
                selector: '#searchView',
                xtype: 'searchview',
                autoCreate: true
            },
            loginView: {
                selector: '#loginView',
                xtype: 'loginview',
                autoCreate: true
            },
            queryResultsView: '#queryResultsView',
            queryDetailView: '#queryDetailView',
            searchField: 'searchfield[action=search]',
            loginButton: 'button[action=loginform]',
            logoutButton: 'button[action=logout]',
            myMapsButton: 'button[action=mymaps]'
        },
        control: {
            'button[action=more]': {
                tap: 'onMore'
            },
            'button[action=main]': {
                tap: function() {
                    this.redirectTo('main');
                }
            },
            'button[action=back]': {
                tap: function() {
                    window.history.back();
                }
            },
            'button[action=mapsettings]': {
                tap: function() {
                    this.redirectTo('mapsettings');
                }
            },
            'button[action=settings]': {
                tap: function() {
                    this.redirectTo('settings');
                }
            },
            'button[action=sendbymail]': {
                tap: "sendByMail"
            },
            loginButton: {
                tap: function() {
                    this.redirectTo('login');
                }
            },
            logoutButton: {
                tap: "logout"
            },
            'button[action=login]': {
                tap: 'doLogin'
            },
            myMapsButton: {
                tap: function() {
                    this.redirectTo('mymaps');
                }
            },
            searchField: {
                focus: function() {
                    this.redirectTo('search');
                }
            },
            mainView: {
                query: function(view, bounds, map) {
                    this.onMapQuery(view, bounds, map);
                }
            }
        },
        routes: {
            '': 'showMain',
            'main': 'showMain',
            'mapsettings': 'showMapSettings',
            'settings': 'showSettings',
            'search': 'showSearch',
            'login': 'showLogin',
            'main/map/:id': 'showMyMap'
        }
    },

    showMain: function() {
        var animation = {type:'reveal', direction: 'down'};
        if (Ext.Viewport.getActiveItem() == this.getSearchView()) {
            animation = {type: 'fade', out: true, duration: 500};
            this.getSearchView().down('searchfield').blur();
        } else if (Ext.Viewport.getActiveItem() == this.getQueryResultsView() ||
                   Ext.Viewport.getActiveItem() == this.getQueryDetailView()) {
            animation = {type: 'slide', direction: 'right'};
        } else if (Ext.Viewport.getActiveItem() == this.getLoginView()) {
            animation = {type: 'flip'};
        }
        // hide the search field to prevent intempestive focus
        var field = this.getSearchField();
        field && field.hide() && field.setDisabled(true);

        Ext.Viewport.animateActiveItem(0, animation);

        // show the search field again
        if (field) {
            field.show({
                type: "fadeIn"
            });
            Ext.defer(field.enable, 1000, field);
        }

        this.checkUser();
    },

    showMapSettings: function() {
        var mapSettingsView = this.getMapSettingsView();

        var animation = {type: 'slide', direction: 'right'};
        if (Ext.Viewport.getActiveItem() == this.getMainView()) {
            animation = {type: 'cover', direction: "up"};
        }
        Ext.Viewport.animateActiveItem(
            mapSettingsView,
            animation
        );
    },

    showSettings: function() {
        Ext.Viewport.animateActiveItem(
            this.getSettingsView(),
            {type: 'cover', direction: "up"}
        );
    },

    showSearch: function() {
        Ext.Viewport.animateActiveItem(
            this.getSearchView(),
            {
                type: 'fade',
                duration: 500
            }
        );
        this.getSearchView().down('searchfield').focus();
    },

    onMore: function(button) {
        this.getMoreMenu().showBy(button);
    },

    onMapQuery: function(view, bounds, map) {
        var layers = map.getLayersByName('Overlays')[0].params.LAYERS;
        var scale = map.getScale();
        // launch query only if there are layers to query
        if (layers.length) {
            var p = [bounds, layers, parseInt(scale, 0)];
            var joinedParams = p.join('-');
            joinedParams = encodeURIComponent(joinedParams);
            this.redirectTo('query/' + joinedParams);
        }
    },

    sendByMail: function() {
        Ext.Msg.prompt(
            i18n.message('button.sendbymail'),
            'E-mail',
            function(buttonId, value) {
                if (buttonId != 'ok') {
                    return;
                }
                var map = App.map;
                // FIXME: goret des cimes, baselayer en dur
                var layers = 'topo,';
                layers += map.getLayersByName('Overlays')[0].params.LAYERS.join(',');
                Ext.Ajax.request({
                    url: 'http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/sendbymail',
                    params: {
                        layers: layers,
                        bbox: map.getExtent().toBBOX(),
                        width: map.getSize().w,
                        height: map.getSize().h,
                        x: map.getCenter().lon,
                        y: map.getCenter().lat,
                        zoom: map.getZoom(),
                        lang: i18n.getLanguage(),
                        mail: value
                    },
                    success: function(response) {
                        var resp = Ext.JSON.decode(response.responseText);
                        if (resp.success === true) {
                            Ext.Msg.alert('', i18n.message('sendbymail.done'));
                        } else {
                            Ext.Msg.alert('', i18n.message('sendbymail.wrong'));
                        }
                    }
                });
            },
            null,
            false,
            null,
            {
                xtype: 'emailfield'
            }
        );
    },

    showLogin: function() {
        Ext.Viewport.animateActiveItem(
            this.getLoginView(),
            {type: 'flip'}
        );
    },

    doLogin: function() {
        this.getLoginView().submit({
            success: function(form, result) {
                if (result && result.success) {
                    this.getLoginView().setUrl('http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/login_handler');
                    this.getLoginView().submit({});
                    this.redirectTo('');
                    // the login_handler service is supposed to answer with 302
                    // redirect. Thus, we cannot rely on it to use success
                    // callback for the submit
                    Ext.defer(this.checkUser, 500, this);
                }
            },
            failure: function() {
                Ext.Msg.alert('', i18n.message('login.error'));
            },
            scope: this
        });
    },

    logout: function() {
        Ext.Ajax.request({
            url: 'http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/logout_handler'
        });
        // the login_handler service is supposed to answer with 302
        // redirect. Thus, we cannot rely on it to use success
        // callback for the submit
        Ext.defer(this.checkUser, 500, this);
    },

    checkUser: function() {
        Ext.Ajax.request({
            url: 'http://geoportail-luxembourg.demo-camptocamp.com/~pierre_mobile/user',
            success: function(response) {
                this.getLoginButton().hide();
                this.getLogoutButton().show();
                this.getMyMapsButton().show();
            },
            failure: function(response) {
                this.getLoginButton().show();
                this.getLogoutButton().hide();
                this.getMyMapsButton().hide();
            },
            scope: this
        });
    },

    showMyMap: function(id) {
        this.showMain();

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
