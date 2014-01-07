(function(angular){
  'use strict';

  angular.module('distill', [
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ivpusic.cookie',
    'jmdobry.angular-cache',
    'ui',
    'distill.helpers',
    'distill.routes',
    'distill.services',
    'distill.directives',
    'distill.filters',
    'distill.controllers'
  ]);

  angular.module('distill.filters', []);

  angular.module('distill.directives', [
    'distill.directives.qs'
  ]);

  angular.module('distill.services', [
    'distill.services.login',
    'distill.services.loader'
  ]);

  angular.module('distill.controllers', [
    'distill.controllers.header',
    'distill.controllers.schedule',
    'distill.controllers.signin',
    'distill.controllers.qs'
  ]);

})(angular);
