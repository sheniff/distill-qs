(function($){

  $('#copyURL').on('click', function(){
    $('#interviewURL').select();
    document.execCommand('copy');
  });

})(jQuery);

