Ext.define("App.view.Settings", {
    extend: 'Ext.form.Panel',
    id: 'settingsView',
    xtype: 'settingsview',
    requires: [
        'Ext.field.Select'
    ],

    config: {
        items: [{
            docked: 'top',
            xtype: 'toolbar',
            title: foobar("settings.settings"),
            items: [{
                xtype: 'button',
                text: foobar('button.close'),
                action: 'main'
            }]
        }, {
            xtype: "fieldset",
            items: [{
                xtype: "selectfield",
                id: 'languageSelect',
                label: foobar('settings.language'),
                listeners: {
                    painted: function() {
                        this.setValue(App.app.bundle.getLanguage());
                    }
                },
                options: [
                    {text: 'English', value: 'en'},
                    {text: 'Français', value: 'fr'},
                    {text: 'Deutsch', value: 'de'},
                    {text: 'Lëtzebuergesch', value: 'lu'}
                ],
                usePicker: false
            }]
        }]
    }
});
