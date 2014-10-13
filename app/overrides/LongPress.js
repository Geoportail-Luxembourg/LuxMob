// Doesn't seem to be taken into account unless in built mode
Ext.define('App.overrides.LongPress', {
    override: 'Ext.event.recognizer.LongPress',
    config: {
        minDuration: 250
    }
});
