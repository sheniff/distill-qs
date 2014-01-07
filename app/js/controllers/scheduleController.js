'use strict';

angular
  .module('distill.controllers.schedule', ['distill.services.login'])
  .controller('ScheduleCtrl', ['$scope', '$location', 'loginService', 'loaderService', 'user',
    function($scope, $location, loginService, loader, user){

      angular.extend($scope, {
        user: user,
        logout: function() {

          loader.show();
          loginService.logout().then(
            // success
            function(user){
              loader.hide();
              $scope.goTo('sign_in');
            },
            // error
            function(data){
              loader.hide();
              console.log('Error', data.status, data.error);
            }
          );

        }
      });

    }
  ]);

