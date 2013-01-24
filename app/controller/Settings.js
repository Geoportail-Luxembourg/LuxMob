window.i18n = Ext.i18n.Bundle;
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
                    i18n.setLanguage(newValue);
                    OpenLayers.Lang.setCode(newValue);
                    localStorage.setItem('language', newValue);
                    this.fireEvent('languagechange', newValue);
                }
            }
        }
    }
});
