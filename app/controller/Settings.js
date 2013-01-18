Ext.define('App.controller.Settings', {
    extend: 'Ext.app.Controller',
    requires: [
    ],
    config: {
        refs: {
            languageSelect: '#languageSelect'
        },
        control: {
            languageSelect: {
                change: function(select, newValue) {
                    Ext.i18n.Bundle.setLanguage(newValue);
                }
            }
        }
    }
});
