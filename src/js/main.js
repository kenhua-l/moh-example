$(function() {
  // everything on document ready
  
  // tab
  $(".tab-container .tab-list .tab-list-item").on("click", function () {
    var dataTab = $(this).data('tab');
    var tabContainer = $(this).closest('.tab-container');

    tabContainer.find('.tab-content-item').attr('aria-hidden', true);
    tabContainer.find('.tab-content-item[data-tab='+dataTab+']').attr('aria-hidden', false);

    $(this).siblings('.tab-list-item').removeClass('active');
    $(this).addClass('active');
  });

  $(".tab-container .tab-list .tab-list-item:first-child").click();

  $('.video').on('click', function() {
    $('.video').removeClass('focus');
    $(this).addClass('focus');
  });
  $(document).on('click', function(e) {
    if(!$(e.target).closest('.video').length) {
      $('.video').removeClass('focus');
    }
  });
  
  $('.video-tab .tab-list-item').on('click', function() {
    $('.embed-responsive-item').each(function () {
      $(this)[0].contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
    })
  });

});

$(window).on('resize orientationchange load', function(e) {

}).resize();
