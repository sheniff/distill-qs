'use strict';

angular
  .module('distill.controllers.signin', ['distill.services.login', 'distill.services.loader'])
  .controller('SigninCtrl', ['$scope', '$location', 'loginService', 'loaderService',
    function($scope, $location, loginService, loaderService){

      angular.extend($scope, {
        user: {},
        login: function(callback){
          $scope.err = null;

          loaderService.show();

          loginService.login($scope.user).then(
            // success
            function(user){
              loaderService.hide();
              $scope.err = null;

              // To be deleted
              loginService.signedIn().then(
                function(data) { console.log('logged in', data) },
                function(data) { console.log('Not logged in...', data) }
              );

              // To be uncommented
              //$scope.goTo('schedule');
            },
            // error
            function(data){
              loaderService.hide();
              console.log('Error', data.status, data.error);
              $scope.err = data.error;
            }
          );
        }
      });
    }
  ]);

