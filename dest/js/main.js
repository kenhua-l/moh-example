$(function() {
  // everything on document ready
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

  $('.social-media-slider').slick({
    mobileFirst: true,
    dots: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        }
      }
    ]
  });

  $('.social-media-slider').on('afterChange', function(e, s, c) {
    var $list = $(this).find('.slick-list');
    var height = $(s.$slides[c]).height();
    $(this).animate({
      height: height + 24
    });
    $list.animate({
      height: height + 24
    });
  });

  $('.partner-popper').magnificPopup({
    type:'inline',
    midClick: true,
    mainClass: 'partner-modal'
  });

  $('.graph-popper').magnificPopup({
    type:'inline',
    midClick: true,
    fixedBgPos: true,
    mainClass: 'graph-modal'
  });

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

  $('.scroll-top').on('click', function() {
    $(document).scrollTop(0);
  });

});

$(window).on('resize orientationchange load', function(e) {
  var windowWidth = $(window).outerWidth();
  if(windowWidth >= 992) {
    if($('.healthcare-cards').hasClass('slick-initialized')) {
      $('.healthcare-cards').slick('unslick');
    }
  } else if(windowWidth >= 576) {
    if($('.healthcare-cards').hasClass('slick-initialized')) {
      $('.healthcare-cards').slick('unslick');
    }
    $('.healthcare-cards').slick({
      dots: true,
      arrows: false,
      slidesToShow: 2,
    });
  } else {
    if($('.healthcare-cards').hasClass('slick-initialized')) {
      $('.healthcare-cards').slick('unslick');
    }
    $('.healthcare-cards').slick({
      dots: true,
      arrows: false
    });
  }

  $('.button-links').each(function() {
    $(this).find('.button-link').height('auto');
    var maxheight = 0;
    $(this).find('.button-link').each(function() {
      if($(this).height() > maxheight) maxheight = $(this).height();
    });
    $(this).find('.button-link').height(maxheight);
  });

  $('.graphs-section').each(function() {
    $(this).find('.graph-title').height('auto');
    var maxheight = 0;
    $(this).find('.graph-title').each(function() {
      if($(this).height() > maxheight) maxheight = $(this).height();
    });
    $(this).find('.graph-title').height(maxheight);
  });

  if(windowWidth >= 768) {
    setTimeout(function() {
      $('.social-media-slider').each(function() {
        var $list = $(this).find('.slick-list');
        $(this).height('auto');
        $list.height('auto');
      });
    }, 1500);
  }

}).resize();

$(window).on('scroll', function() {
  if($(document).scrollTop() > 20) {
    $('.scroll-top').show();
  } else {
    $('.scroll-top').hide();
  }
});