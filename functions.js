$(document).ready(function(){
  // SmoothScroll
  var scroll = new SmoothScroll('a[href*="#"]', {
    speed: 3000,
    popstate: true,
    updateURL: false
  });

  // Nav Menu
  var menu = new TimelineLite()
	.from("#navmenu", 1, {width:0, ease:Power2.easeInOut})
	.from("#navicon", 1, {ease:Power2.easeInOut},0)
  .reversed(true);

  var menuChilds = document.querySelectorAll('ul li, #navicon, .close-link');
  for( var i=menuChilds.length ; i--; ){
    menuChilds[i].addEventListener('click',function(){ menu.reversed(!menu.reversed()) })
  };

  // Slick Slider
  $('.project-1-carousel').slick({
    infinite: true,
    appendArrows: '.slick-nav',
    appendDots: '.slick-nav',
    dots: true,
    speed: 800,
    infinite: false,
    // RESPONSIVE
    responsive: [{

      breakpoint: 1024,
      settings: {
        slidesToShow: 1
      }
    }, {
      breakpoint: 600,
      settings: {
        slidesToShow: 1
      }

    }, {

      breakpoint: 300,
      //settings: "unslick" // destroys slick
    }]
  });

  $('.project-2-carousel').slick({
    infinite: true,
    appendArrows: '.slick-nav2',
    appendDots: '.slick-nav2',
    dots: true,
    speed: 800,
    infinite: false,
  });

  $('.project-3-carousel').slick({
    infinite: true,
    appendArrows: '.slick-nav3',
    appendDots: '.slick-nav3',
    dots: true,
    speed: 800,
    infinite: false,
  });

  $('.project-4-carousel').slick({
    infinite: true,
    appendArrows: '.slick-nav4',
    appendDots: '.slick-nav4',
    dots: true,
    speed: 800,
    infinite: false,
  });

  //ScrollMagic.js and GSAP Animation.js Plugin
  var controller = new ScrollMagic.Controller();
  // build tween
  var tween = TweenMax.to(".image_film_strip", 1, {className: "+=film-animated"});

  // build scene
  var scene = new ScrollMagic.Scene({triggerElement: "#about_photos", duration: 800, offset: 100})
  .setTween(tween)
  //.addIndicators({name: "tween css class"}) // add indicators
  .addTo(controller);

  // 2
  var controller2 = new ScrollMagic.Controller();
  // build tween
  var tween2 = TweenMax.to(".image_portrait", 1, {className: "+=profile_animated"});

  // build scene
  var scene = new ScrollMagic.Scene({triggerElement: "#about_photos", duration: 800, offset: 100})
  .setTween(tween2)
  //.addIndicators({name: "tween2 css class"}) // add indicators
  .addTo(controller2);

  // 3
  var controller3 = new ScrollMagic.Controller();
  // build tween
  var tween3 = TweenMax.to(".image_waves", 1, {className: "+=waves_animated"});

  // build scene
  var scene = new ScrollMagic.Scene({triggerElement: "#about_photos", duration: 600, offset: 100})
  .setTween(tween3)
  //.addIndicators({name: "tween3 css class"}) // add indicators
  .addTo(controller3);

  // Active link show which section you're in
  var controller = new ScrollMagic.Controller({
    globalSceneOptions: {
      duration: $('section').height(),
      triggerHook: .025,
      reverse: true
    }
  });

  var scenes = {
    'about': {
      'about_james_madson': 'about_link'
    },
    'bs': {
      'bundle_select': 'bs_link'
    },
    'fs': {
      'section-2': 'anchor2'
    },
    'mfn': {
      'metrics_for_news': 'mfn_link'
    },
    'api': {
      'american_press_institute': 'api_link'
    },
    'contact': {
      'contact': 'contact_link'
    }
  }

  for(var key in scenes) {
    // skip loop if the property is from prototype
    if (!scenes.hasOwnProperty(key)) continue;

    var obj = scenes[key];

    for (var prop in obj) {
      // skip loop if the property is from prototype
      if(!obj.hasOwnProperty(prop)) continue;

      new ScrollMagic.Scene({ triggerElement: '#' + prop })
          .setClassToggle('#' + obj[prop], 'active')
          .addTo(controller);
    }
  }

  // Animate Trigger CSS Class
  var scene = new ScrollMagic.Scene({triggerElement: ".name", duration: null})
  // trigger animation by adding a css class
  .setClassToggle(".case-study", "fadeIn")
  //.addIndicators({name: "Animation FadeIn"}) // add indicators (requires plugin)
  .addTo(controller);


});
