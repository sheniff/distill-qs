'use strict';

angular
  .module('distill.routes', [])
  .config(['$routeProvider',
    function($routeProvider){
      var checkLoggedin = function(loginService){
        console.log('checking out if user is logged in');
        return loginService.signedIn();
      };

      // define application routes
      $$router
        .when('forgot_password',  '/forgot',        $$router.routeHash('users/forgot',       'SigninCtrl'))
        .when('schedule',         '/schedule',      $$router.routeHash('schedule/index',     'ScheduleCtrl',  { resolve: { loggedin: checkLoggedin } }))
        .when('sign_in',          '/signin',        $$router.routeHash('users/signin',       'SigninCtrl'))

        // redirect undefined routes to
        .otherwise({
          redirectTo: '/schedule'
        })

        // add routes to the route provider
        .install($routeProvider);
    }
  ]);



