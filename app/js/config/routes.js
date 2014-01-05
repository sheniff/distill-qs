'use strict';

angular
  .module('distill.routes', [])
  .config(['$routeProvider',
    function($routeProvider){
      // define application routes
      $$router
        .when('forgot_password',  '/forgot',        $$router.routeHash('users/forgot',       'SigninCtrl'))
        .when('schedule',         '/schedule',      $$router.routeHash('schedule/index',     'ScheduleCtrl',  { authRequired: true }))
        .when('sign_in',          '/signin',        $$router.routeHash('users/signin',       'SigninCtrl'))

        // redirect undefined routes to
        .otherwise({
          redirectTo: '/signin'
        })

        // add routes to the route provider
        .install($routeProvider);
    }
  ]);



