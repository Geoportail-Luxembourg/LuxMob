window.i18n = Ext.i18n.Bundle;
Ext.define("App.view.Settings", {
    extend: 'Ext.form.Panel',
    xtype: 'settingsview',
    requires: [
        'Ext.field.Select'
    ],

    config: {
        items: [{
            docked: 'top',
            xtype: 'toolbar',
            title: i18n.message("settings.settings"),
            items: [{
                xtype: 'button',
                text: i18n.message('button.close'),
                action: 'main'
            }]
        }, {
            xtype: "fieldset",
            items: [{
                xtype: "selectfield",
                id: 'languageSelect',
                label: i18n.message('settings.language'),
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
                ]
            }]
        }, {
            xtype: "fieldset",
            instructions: i18n.message('settings.themes.instructions'),
            items: [{
                xtype: "selectfield",
                id: 'themeSelect',
                label: i18n.message('settings.themes'),
                options: [
                    {text: OpenLayers.i18n('theme.main'), value: 'main'},
                    {text: OpenLayers.i18n('theme.tourisme'), value: 'tourisme'}
                ]
            }]
        }]
    }
});
