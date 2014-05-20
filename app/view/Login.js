Ext.define('App.view.Login', {
    extend: 'Ext.form.Panel',
    id: 'loginView',
    xtype: 'loginview',
    requires: [
        'App.util.Config',
        'Ext.form.FieldSet',
        'Ext.field.Text',
        'Ext.field.Password',
        'Ext.Container',
        'Ext.Button'
    ],
    config: {
        url: App.util.Config.getWsgiUrl() + 'checkLogin',
        method: 'POST',
        scrollable: null,
        layout: {
            type: 'vbox',
            pack: 'center',
            align: 'center'
        },
        //standardSubmit: true,
        items: [{
            xtype: 'fieldset',
            defaults: {
                // labelWidth default is 35% and is too
                // small on small devices (e.g.g iPhone)
                labelWidth: '50%'
            },
            items: [{
                xtype: 'textfield',
                name: 'login',
                label: foobar('login.login'),
                autoCorrect: false,
                autoCapitalize: false
            }, {
                xtype: 'passwordfield',
                name: 'password',
                label: foobar('login.password')
            }]
        }, {
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'start',
                pack: 'center'
            },
            items: [{
                xtype: 'button',
                text: foobar('button.cancel'),
                action: 'main',
                margin: 2
            }, {
                xtype: 'button',
                text: foobar('login.submit'),
                ui: 'confirm',
                action: 'login',
                margin: 2
            }]
        }, {
            xtype: 'component',
            padding: 20,
            html: foobar('login.info')
        }, {
            xtype: 'button',
            text: foobar('login.lostpassword'),
            cls: 'link',
            handler: function() {
                var link = "http://myaccount.geoportail.lu/lostpassword?lang=";
                window.open(link + App.app.bundle.getLanguage(), '_system');
            }
        }, {
            xtype: 'button',
            text: foobar('login.newaccount'),
            cls: 'link',
            handler: function() {
                var link = "http://myaccount.geoportail.lu/newaccount?lang=";
                window.open(link + App.app.bundle.getLanguage(), '_system');
            }
        }]
    }
});
