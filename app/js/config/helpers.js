
angular.module('distill.helpers', [])

  // Routes config
  .config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider){
      if($$config.routing.html5Mode){
        $locationProvider.html5Mode(true);
      }else{
        var routingPrefix = $$config.routing.prefix;

        if(routingPrefix && routingPrefix.length > 0){
          $locationProvider.hashPrefix(routingPrefix);
        }
      }
    }
  ])

  // Routes helpers
  .run(['$rootScope', '$location', '$window',
    function($rootScope, $location, $window){
      var prefix = '';

      if(!$$config.routing.html5Mode){
        prefix = '#' + $$config.routing.prefix;
      }

      angular.extend($rootScope, {
        c: function(route, value){
          var url = $$router.routePath(route);

          if(url == $location.path()){
            return value;
          }
        },
        r: $rootScope.route,
        /**
         * Returns the route path
         * @param  {String} url  The path
         * @param  {Array}  args The params of the path
         * @return {String}      The formatted route path with params
         */
        route: function(url, args){
          return prefix + $$router.routePath(url, args);
        },

        goTo: function(path, args) {
          $location.path($$router.routePath(path, args));
        },

        goBack: function() {
          $window.history.back();
        }
      });
    }
  ])

  .config(['$httpProvider', '$templateCacheProvider', function(provider, templateProvider){
    provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
    provider.defaults.useXDomain = true;
    delete provider.defaults.headers.common['X-Requested-With'];
  }])

  // RootScope helpers
  .run(['$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout){

    angular.extend($rootScope, {
      /**
       * Returns an absolute URL string
       * @param  {String} path The path to append to the protocol and host
       * @return {String}      The URL string
       */
      formatURL: function(path){
        return $window.location.protocol + '//' + $window.location.host + path;
      },
      /**
       * Monkey patch for safe $apply()
       * @param {Function} fn The callback function
       */
      safeApply: function(fn){
        var phase = this.$root.$$phase;

        if(phase == '$apply' || phase == '$digest'){
          if(fn && (typeof(fn) === 'function'))
            fn();
        }else{
          this.$apply(fn);
        }
      },
      browser: function(){
        var agent = $window.navigator.userAgent;

        if(agent.toLowerCase().indexOf('firefox') !== -1)
          prefix = 'firefox';

        if(agent.toLowerCase().indexOf('opera') !== -1)
          prefix = 'opera';

        if(agent.toLowerCase().indexOf('webkit') !== -1)
          prefix = 'webkit';

        return prefix;
      }()
    });
  }]);
