function CustomJSAndCSSOptions(options){
    /** @constructor */
    this.options = options;
}

CustomJSAndCSSOptions.prototype = {

    selectors: {
        installedItem: '.installed__item',
        installedCheckbox: '.installed__checkbox',
        installedEdit: '.installed__edit',
        installedRemove: '.installed__remove',
        setupId: '.setup__id',
        setupHosts: '.setup__hosts',
        setupScripts: '.setup__scripts-url-textarea',
        setupButton: '.setup__button'
    },

    initialize: function(){

        _.each(this.selectors, function(selector, key){
            this[key] = $(selector)
        }, this);

        this.config = this.getConfig();

        this.container = $(this.options.container);
        this.installedContainer = $(this.options.installedContainer);
        this.installedTemplate = this.options.installedTemplate;

        this.renderInstalledScripts(this.config, this.installedContainer);
        this.initializeInstalledScripts();
        this.initializeSetup();
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
    updateConfig: function(){
        localStorage.setItem('config', JSON.stringify(this.config));
    },
    getConfigItemById: function(id){
        return _.find(this.config, function(item){
            return item.id == id;
        }, this) || null;
    },
    setConfigItem: function(id, data){
        _.extend(this.getConfigItemById(id), data, { id: id });
        this.updateConfig();
    },
    addConfigItem: function(data){
        this.config.push(data);
        this.updateConfig();
    },
    removeConfigItem: function(id){
        var configItemIndex;
        for ( var i = 0, l = this.config.length; i < l; i++ ) {
            if ( this.config[i].id == id ) {
                configItemIndex = i;
                break;
            }
        }
        this.config.splice(configItemIndex, 1);
        this.updateConfig();
    },
    renderInstalledScripts: function(data, container){
        data.forEach(function(item){
            var html = _.template(this.installedTemplate)(item);
            container.append(html);
        }, this);
    },
    getInstalledItemHTML: function(data){
        return _.template(this.installedTemplate)(data);
    },
    initializeInstalledScripts: function(){

        this.installedContainer

            .undelegate()

            .delegate(this.selectors.installedCheckbox, 'click', $.proxy(function(e){

                var checkbox = $(e.currentTarget);
                var parentItem = this.getParentItemElement(checkbox);
                var id = +parentItem.data('id');
                var isEnabled = checkbox.get(0).checked;
                var configItem = this.getConfigItemById(id);

                this.setConfigItem(id, _.extend(configItem, {
                    enabled: isEnabled
                }));

            }, this))

            .delegate(this.selectors.installedEdit, 'click', $.proxy(function(e){

                var button = $(e.currentTarget);
                var parentItem = this.getParentItemElement(button);
                var id = +parentItem.data('id');
                var configItem = this.getConfigItemById(id);

                this.setupId.val(id);
                this.setupHosts.val(configItem.hosts.join(', ')).focus();
                this.setupScripts.val(configItem.scripts.join('\n'));

            }, this))

            .delegate(this.selectors.installedRemove, 'click', $.proxy(function(e){

                if ( confirm('Do you really want to delete this entry?') ) {
                    var button = $(e.currentTarget);
                    var parentItem = this.getParentItemElement(button);
                    var id = +parentItem.data('id');
                    this.removeConfigItem(id);
                    parentItem.remove();
                }

            }, this));

    },
    getParentItemElement: function(element){
        return element
            .parents(this.selectors.installedItem)
            .first();
    },
    initializeSetup: function(){

        this.setupButton.on('click', $.proxy(function(){

            var hosts = _.chain(this.setupHosts.val().split(/,\s*/))
                .invoke('trim')
                .map(this.trimDomain)
                .compact()
                .value();

            var scripts = _.chain(this.setupScripts.val().split(/\n/))
                .invoke('trim')
                .compact()
                .value();

            var configItem = {
                hosts: hosts,
                scripts: scripts,
                enabled: true
            };

            var id = +this.setupId.val();

            if ( id ) {
                configItem.id = id;
                this.setConfigItem(id, configItem);
                $(this.selectors.installedItem, this.installedContainer)
                    .filter('[data-id=' + id + ']')
                    .replaceWith(
                        this.getInstalledItemHTML(configItem)
                    );
            }
            else {
                id = +new Date();
                configItem.id = id;
                this.addConfigItem(configItem);
                this.installedContainer.append(
                    this.getInstalledItemHTML(configItem)
                )
            }

            this.setupId.val('');
            this.setupHosts.val('').focus();
            this.setupScripts.val('');

        }, this));

    },
    trimDomain: function(url){
        return url
            .replace(/^https?:\/\//i, '')
            .split(/\//)[0]
            .split(/\?/)[0];
    }
};

$(document).ready(function(){
    window.app = new CustomJSAndCSSOptions({
        container: '.options',
        installedContainer: '.installed',
        installedTemplate: $('#installed__item').html()
    });
    app.initialize();
});
