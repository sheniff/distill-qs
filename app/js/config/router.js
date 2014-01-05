var $$router;

(function(){

  var routes = {},
      otherwiseLookup = null;

  $$router = {
    /**
     * Create a route alias
     * @param {String} route The route to create the alias from
     * @param {String} alias The routes alias
     */
    alias: function(route, alias){
      routes[route] = routes[alias];
    },
    /**
     * Return information about a specific route
     * @param  {String} route The route to lookup
     * @return {Object}       The route object
     */
    getRoute: function(route){
      return routes[route];
    },
    /**
     * Setups up a new route
     * @param {Object} $routeProvider The route provider
     */
    install: function($routeProvider){
      var key, route;

      for(key in routes){
        route = routes[key];
        $routeProvider.when(route.url, route.params);
      }

      if(otherwiseLookup)
        $routeProvider.otherwise(otherwiseLookup);

      return this;
    },
    /**
     * The fallback if a route has not been defined
     * @param  {Array} params
     */
    otherwise: function(params){
      otherwiseLookup = params;
      return this;
    },
    /**
     * Converts URL params
     * @param  {String} url    The URL query string
     * @param  {Object} params The params object
     * @return {String}        The cleaned URL
     */
    replaceUrlParams: function(url, params){
      for(var k in params){
        url = url.replace(':' + k, params[k]);
      }
      return url;
    },
    /**
     * Checks if the route has been defined
     * @param  {String} route The route to check
     * @return {Boolean}      The true or false value
     */
    routeDefined: function(route){
      return !!this.getRoute(route);
    },
    /**
     * Extends route hash with extra given attributes
     * @param  {String} view       Template's name to load
     * @param  {String} controller Name of the controller to apply to that view
     * @param  {Object} extra      Extra attributes to use when loading the view
     * @return {Object}            Includes extra attributes to the original route object
     */
    routeHash: function(view, controller, extra){
      return angular.extend({
        controller: controller,
        templateUrl: $$config.prepareViewTemplateUrl(view)
      }, extra);
    },
    /**
     * Returns the route path
     * @param  {String} route The route to find
     * @param  {Array}  args  The route params
     * @return {String}       The route path
     */
    routePath: function(route, args){
      var url = this.getRoute(route);

      url = url ? url.url : null;

      if(url && args) {
        url = this.replaceUrlParams(url, args);
      }

      return url;
    },
    /**
     *
     * @param {String} route The route name
     * @param {String} url   The route path
     * @param {Array} params The route params
     */
    when: function(route, url, params){
      routes[route] = {
        url: url,
        params: params
      };

      return this;
    }
  };

})();
