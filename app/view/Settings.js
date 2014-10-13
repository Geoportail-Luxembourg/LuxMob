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
            title: Ext.i18n.Bundle.message("settings.settings"),
            items: [{
                xtype: 'button',
                text: Ext.i18n.Bundle.message('button.close'),
                action: 'main'
            }]
        }, {
            xtype: "fieldset",
            items: [{
                xtype: "selectfield",
                id: 'languageSelect',
                label: Ext.i18n.Bundle.message('settings.language'),
                listeners: {
                    painted: function() {
                        this.setValue(Ext.i18n.Bundle.getLanguage());
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
