function handleConfig(config){

    var scripts = [];
    var stylesheets = [];

    config.forEach(function(item){
        if ( item.enabled ) {
            item.scripts.forEach(function(url){
                if ( /\.js$/i.test(url) ) {
                    scripts.push(url);
                }
                else if ( /\.css$/i.test(url) ) {
                    stylesheets.push(url);
                }
            });
        }
    });
    return {
        scripts: scripts,
        stylesheets: stylesheets
    };
}

function appendStylesheet(url){
    var stylesheet = document.createElement('link');
    stylesheet.className = 'CustomJSAndCSS CustomJSAndCSS_css';
    stylesheet.rel = 'stylesheet';
    stylesheet.href = url + '?' + Math.random();
    document.body.appendChild(stylesheet);
    return stylesheet;
};

function appendScript(url){
    var script = document.createElement('script');
    script.className = 'CustomJSAndCSS CustomJSAndCSS_js';
    script.src = url + '?' + Math.random();
    document.body.appendChild(script);
    return script;
};

function initialize(){
    loaderInitialized = true;
    handledConfig = handleConfig(config);
    handledConfig.scripts.forEach(appendScript);
    handledConfig.stylesheets.forEach(appendStylesheet);
};

var loaderInitialized;
var handledConfig;

if ( typeof loaderInitialized === 'undefined' ) {
    initialize();
}
