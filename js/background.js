function CustomJSAndCSS(){
    /** @constructor */
}

CustomJSAndCSS.prototype = {

    pathToLoader: 'js/loader.js',

    initialize: function(){

        this.subscribeToTabUpdate($.proxy(function(tabId, type, tab){

            this.config = this.getConfig();

            var tabDomain = this.trimDomain(tab.url);
            var configItems = this.getConfigItemsByHost(this.config, tabDomain);

            console.log(type, tabId, tab);
            this.passExtensionDataToTab(tabId, 'config', configItems);
            try {
                chrome.tabs.executeScript(tabId, {
                    file: this.pathToLoader
                });
            }
            catch (e){}
        }, this));

    },
    passExtensionDataToTab: function(tabId, propertyName, data){
        var code = 'window.' + propertyName + '=' + JSON.stringify(data);
        try {
            chrome.tabs.executeScript(tabId, {
                code: code
            });
        }
        catch (e){}
    },
    subscribeToTabUpdate: function(callback){

        chrome.tabs.onUpdated.addListener($.proxy(function(tabId, e, tab){
            if ( e.status === 'complete' ) {
                callback(tabId, 'updated', tab);
            }
        }, this));

        chrome.tabs.onReplaced.addListener($.proxy(function(tabId){
            chrome.tabs.get(tabId, function(tab){
                callback(tabId, 'replaced', tab);
            });
        }, this));

    },
    getConfig: function(){
        var config;
        try {
            config = JSON.parse(localStorage.getItem('config'));
            if ( !config ) {
                config = [];
            }
        }
        catch(e){
            config = [];
        }
        return config;
    },
    getConfigItemsByHost: function(config, host){
        return config.filter(function(item){
            for ( var i = 0, l = item.hosts.length; i < l; i++ ) {
                var currentHost = item.hosts[i];
                if ( host.indexOf(currentHost) === host.length - currentHost.length || currentHost === '*' ) {
                    return true;
                }
            }
        }, this);
    },
    trimDomain: function(url){
        return url
            .replace(/^https?:\/\//i, '')
            .split(/\//)[0]
            .split(/\?/)[0];
    }
};

window.extension = new CustomJSAndCSS();
extension.initialize();
