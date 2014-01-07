'use strict';

angular
  .module('distill.services.login', [])
  .factory('loginService', ['$rootScope', '$http', '$q',
    function($rootScope, $http, $q){
      var URL = 'http://0.0.0.0:3000';

      return {

        login: function(user){
          var result = $q.defer();

          $http.post(URL + '/api/v1/users/login', { user: user })
            .success(function(data){
              console.log('logged in!', data);
              result.resolve(data);
            })
            .error(function(data, status) {
              console.log('error logging in...', data);
              result.reject({status: status, error: data.error});
            });

          return result.promise;
        },

        logout: function(redirectPath){},

        signedIn: function(redirectPath){
          var result = $q.defer();

          $http.get(URL + '/api/v1/users/loggedin')
            .success(function(data){
              $rootScope.goTo('schedule');
              result.resolve(data);
            })
            .error(function(data, status){
              if(status === 401){
                console.log('You need to log in.');
                result.reject(data, status);
                $rootScope.goTo(redirectPath || 'sign_in');
              } else {
                console.log('Something happened... Error #' + status, data);
              }
            });

          return result.promise;
        }
      }
    }
  ]);
