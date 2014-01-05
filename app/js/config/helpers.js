
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
          var url = ROUTER.routePath(route);

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
          return prefix + ROUTER.routePath(url, args);
        },

        goTo: function(path, args) {
          $location.path(ROUTER.routePath(path, args));
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

    // ReWriting $templateCache provider
    templateProvider.$get = ['$angularCacheFactory', '$window', function($angularCacheFactory, $window) {
      var options = {
        maxAge: 900000,               // Items added to this cache expire after 15 minutes.
        cacheFlushInterval: 0,  // This cache will clear itself every hour.
        deleteOnExpire: 'aggressive'  // Items will be deleted from this cache right when they expire.
      };

      if($window.ENVIRONMENT !== "development") // (just in case we're not developing, which will become some people crazy)
        options.storageMode = 'localStorage';   // If localStorage is available, it'll cache the request

      return $angularCacheFactory('templateCache', options);
    }];
  }])

  // Creating a cache for those $http request we want to explicitly cache
  // Note for the Future (Sergio): Once we want to cache ALL THE REQUEST, we have to
  // set it as $http.defaults.cache = $angularCacheFactory('httpCache', {...
  .run(['$angularCacheFactory', function($angularCacheFactory) {
    $angularCacheFactory('httpCache', {
      maxAge: 900000,               // Items added to this cache expire after 15 minutes.
      cacheFlushInterval: 6000000,  // This cache will clear itself every hour.
      deleteOnExpire: 'aggressive', // Items will be deleted from this cache right when they expire.
      storageMode: 'localStorage'   // If localStorage is available, it'll cache the request
    });
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
  }])

    // establish authentication
  .run(['$rootScope',
    function($rootScope){
    }
  ]);
