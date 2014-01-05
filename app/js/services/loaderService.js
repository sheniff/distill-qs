'use strict';

angular
  .module('distill.services.loader', [])
  .factory('loaderService', function(){
    var loader = {};

    angular.extend(loader, {
      /**
       * Renders the loader
       * @param  {String} The CSS selector (optional)
       * @return {Object} The loader object
       */
      show: function(element){

        var container = element ? $(element) : $('body'),
            classes = element ? 'absolute' : '';

        if($('#loader').length === 0)
          container.append('<div class="mask ' + classes + '">'+
            '<div id="loader">'+
            '<div class="spinner-wrapper">'+
              '<div class="spinner">'+
                '<div class="bar1"></div>'+
                '<div class="bar2"></div>'+
                '<div class="bar3"></div>'+
                '<div class="bar4"></div>'+
                '<div class="bar5"></div>'+
                '<div class="bar6"></div>'+
                '<div class="bar7"></div>'+
                '<div class="bar8"></div>'+
                '<div class="bar9"></div>'+
                '<div class="bar10"></div>'+
                '<div class="bar11"></div>'+
                '<div class="bar12"></div>'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>');

        return this;
      },
      /**
       * Removes the loader from view and DOM
       * @return {Object} The loader object
       */
      hide: function(){
        var loader = $('#loader');

        if(loader.length !== 0)
          loader.parent().remove();

        return this;
      }
    });

    return loader;
  });
