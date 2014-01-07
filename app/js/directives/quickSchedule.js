angular
  .module('distill.directives.qs', [])
  .directive('quickSchedule', [function () {
    return {
      restrict: 'A',
      controller: 'QuickScheduleCtrl',
      templateUrl: '/app/views/quickSchedule.html',
      link: function(scope, iElement, iAttrs){

        scope.$watch('showInstructions', function(n){
          if(n)
            iElement.addClass('confirmation');
          else
            iElement.removeClass('confirmation');
        });

        scope.$watch('hideAdvanced', function(n){
          if(!n)
            iElement.addClass('advanced');
        });

      }
    };
  }])
