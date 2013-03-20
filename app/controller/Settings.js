window.i18n = Ext.i18n.Bundle;
Ext.define('App.controller.Settings', {
    extend: 'Ext.app.Controller',
    requires: [
    ],
    config: {
        refs: {
            languageSelect: '#languageSelect',
            themeSelect: '#themeSelect'
        },
        control: {
            languageSelect: {
                change: function(select, newValue) {
                    i18n.setLanguage(newValue);
                    OpenLayers.Lang.setCode(newValue);
                    localStorage.setItem('language', newValue);
                    this.fireEvent('languagechange', newValue);

                    var themes = this.getThemeSelect();
                    if (themes) {
                        var options = themes.getOptions();
                        var value = themes.getValue();
                        Ext.each(options, function(option) {
                            option.text = OpenLayers.i18n('theme.' +
                                App.util.Config.getThemes()[option.value]);
                        });
                        themes.updateOptions(options);
                        themes.setValue(value);
                    }

                    Ext.getStore('Overlays').setSorters(newValue);
                }
            }
        }
    }
});
