'use strict';

angular
  .module('distill.controllers.signin', ['distill.services.login', 'distill.services.loader'])
  .controller('SigninCtrl', ['$scope', '$location', 'loginService', 'loaderService',
    function($scope, $location, loginService, loaderService){

      angular.extend($scope, {
        email: null,
        name: null,
        pass: null,
        login: function(callback){
          $scope.err = null;

          loaderService.show();

          loginService.login($scope.email, $scope.pass, $location.path, function(err, user){
            $scope.err = err || null;

            loaderService.hide();

            typeof(callback) === 'function' && callback(err, user);
          });
        }
      });
    }
  ]);

