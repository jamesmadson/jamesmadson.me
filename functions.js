$(document).ready(function(){
  // SmoothScroll
  var scroll = new SmoothScroll('a[href*="#"]', {
    speed: 1000,
    popstate: true,
    updateURL: true
  });

  // Widon't – No orphans or widows
  $('h1,h2,h3,li,p').each(function() {
    $(this).html($(this).html().replace(/\s([^\s<]+)\s*$/,'&nbsp;$1'));
  });

  // Nav Menu
  var menu = new TimelineLite()
	.from("#navmenu", 1, {width:0, autoAlpha:0, ease:Power2.easeInOut})
	.from("#navicon", 1, {ease:Power2.easeInOut},0)
  .reversed(true);

  var menuChilds = document.querySelectorAll('ul li, #navicon, .close-link');
  for( var i=menuChilds.length ; i--; ){
    menuChilds[i].addEventListener('click',function(){ menu.reversed(!menu.reversed())
    })
  };

  // Slick Slider
  $('.project-1-carousel').slick({
    infinite: true,
    appendArrows: '.slick-nav',
    appendDots: '.slick-nav',
    dots: true,
    speed: 800,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1
  });

  $('.project-2-carousel').slick({
    infinite: true,
    appendArrows: '.slick-nav2',
    appendDots: '.slick-nav2',
    dots: true,
    speed: 800,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1
  });

  $('.project-3-carousel').slick({
    infinite: true,
    appendArrows: '.slick-nav3',
    appendDots: '.slick-nav3',
    dots: true,
    speed: 800,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
  });

  $('.project-4-carousel').slick({
    infinite: true,
    appendArrows: '.slick-nav4',
    appendDots: '.slick-nav4',
    dots: true,
    speed: 800,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
  });

  //ScrollMagic.js and GSAP Animation.js Plugin
  var controller = new ScrollMagic.Controller();
  // build tween
  var tween = TweenMax.to(".image_film_strip", 1, {className: "+=film-animated"});

  // About Photos
  var scene = new ScrollMagic.Scene({triggerElement: "#about_photos", duration: 800, offset: 100})
  .setTween(tween)
  .addTo(controller);

  // 2
  var controller2 = new ScrollMagic.Controller();
  // build tween
  var tween2 = TweenMax.to(".image_portrait", 1, {className: "+=profile_animated"});

  // About Photos
  var scene = new ScrollMagic.Scene({triggerElement: "#about_photos", duration: 800, offset: 100})
  .setTween(tween2)
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

  // 4
  // Header
  var controller4 = new ScrollMagic.Controller();

  var tween4 = TweenMax.to("header", 1, {className: "+=header-dark"});

  // build scene
  var scene = new ScrollMagic.Scene({triggerElement: ".case-studies-nav", duration: 0, offset: 0})
  .setTween(tween4)
  //.addIndicators({name: "tween4 css class"}) // add indicators
  .addTo(controller4);

  // 5
  // H1
  //var controller5 = new ScrollMagic.Controller();

  //var tween5 = TweenMax.to(".jm-title", 5, {className: "+=title-exploded"});

  // build scene
  //var scene = new ScrollMagic.Scene({triggerElement: ".case-studies-nav", duration: 300, offset: 0})
  //.setTween(tween5)
  //.addIndicators({name: "tween5 css class"}) // add indicators
  //.addTo(controller5);

  // 6
  // Case Studies
  var controller6 = new ScrollMagic.Controller();

  var tween6 = TweenMax.to(".case-studies-nav h4", 6, {className: "+=faded"});

  // build scene
  var scene = new ScrollMagic.Scene({triggerElement: ".case-studies-nav", duration: 300, offset: 00})
  .setTween(tween6)
  //.addIndicators({name: "tween6 css class"}) // add indicators
  .addTo(controller6);


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
      'furniture_society': 'fs_link'
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

});
