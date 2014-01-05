'use strict';

angular
  .module('distill.services.login', [])
  .factory('loginService', ['$location', '$rootScope', '$http',
    function($location, $rootScope, $http){
      return {
        login: function(email, pass, route, callback){
          $location.path('/schedule');

          typeof(callback) === 'function' && callback();
        },
        logout: function(redirectPath){},
        signedIn: function(){}
      }
    }
  ]);
