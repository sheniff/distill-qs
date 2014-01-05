var $$config;

(function(){

  var appPrefix = 'app/',
      templateUrlPrefix = 'views/',
      appVersion = 1;

  $$config = {
    /**
     * Root of app directory
     * @type {String}
     */
    baseDirectory: appPrefix,
    /**
     * Root of images directory
     * @type {String}
     */
    imgDirectory: appPrefix + 'img/',
    /**
     * Path to templates folder
     * @param  {String} path The file path
     * @return {String}      The templates full path
     */
    prepareViewTemplateUrl: function(path){
      return appPrefix + this.templateUrlPrefix + path + this.templateFileSuffix + this.templateFileQuerystring;
    },
    /**
     * Routing configuration
     * @type {Object}
     */
    routing: {
      prefix: '',
      html5Mode: false
    },
    /**
     * Parent folder path containing template files
     * @type {String}
     */
    templateDirectory: templateUrlPrefix,
    /**
     * File verion query
     * @type {String}
     */
    templateFileQuerystring: '?v=' + appVersion,
    /**
     * Expected extension type of our templates
     * @type {String}
     */
    templateFileSuffix: '.html',
    /**
     * Parent folder path containing template files
     * @type {String}
     */
    templateUrlPrefix: templateUrlPrefix,
    /**
     * Current app version
     * @type {String}
     */
    version: appVersion
  };

})();
