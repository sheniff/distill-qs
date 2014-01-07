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
            function(data){
              console.log(data);
              loaderService.hide();
              if(data.error){
                $scope.err = data.error;
              }else{
                $scope.err = null;
                $scope.goTo('schedule');
              }
            }
          );
        }
      });
    }
  ]);

