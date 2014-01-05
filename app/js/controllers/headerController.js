'use strict';

angular
  .module('distill.controllers.header', ['distill.services.login'])
  .controller('HeaderCtrl', ['$scope', '$rootScope', '$location', 'loginService',
    function($scope, $rootScope, $location, loginService){

      angular.extend($scope, {

        /**
         * Terminate current session
         */
        logout: function(){
          loginService.logout('/signin');
        }
      });
    }
  ]);
