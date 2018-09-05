//
//down vote
//accepted
//Add unique ids+ class to each slider & navigation

//$('.slider').slick({
//  dots: true,
//  nextArrow: $('#next')
//});
//$('.slider2').slick({
//  dots: true,
//  nextArrow: $('#next2')
//});

$(document).ready(function(){
  $('.project-1-carousel').slick({
    infinite: true,
    //arrows: true,
    appendArrows: '.slick-nav',
    appendDots: '.slick-nav',
    //centerMode: true, shows a little of prev/next slides
    dots: true,
    speed: 500,
    // RESPONSIVE
    responsive: [{

      breakpoint: 1024,
      settings: {
        slidesToShow: 1,
        infinite: true
      }

    }, {

      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        dots: true
      }

    }, {

      breakpoint: 300,
      settings: "unslick" // destroys slick

    }]
  });
});
