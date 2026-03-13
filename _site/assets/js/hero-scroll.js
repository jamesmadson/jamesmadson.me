(function () {
  'use strict';

  var hero = document.querySelector('main > section.about');
  if (!hero) return;

  var body = document.body;
  var heroBg = body.dataset.heroBg;
  if (!heroBg) return;

  // Determine neutral color from current theme
  function getNeutral() {
    var isDark = document.documentElement.classList.contains('theme-dark') ||
                 body.classList.contains('theme-dark');
    return isDark ? '#0b0b0b' : '#efe6d8';
  }

  // Set initial background to brand hero color (no transition yet)
  body.style.transition = 'none';
  body.style.backgroundColor = heroBg;

  // Force reflow so the initial color is painted before we re-enable transitions
  body.offsetHeight; // eslint-disable-line no-unused-expressions
  body.style.transition = '';

  function check() {
    var rect = hero.getBoundingClientRect();
    // When the bottom of the hero clears the sticky nav (~64px)
    if (rect.bottom <= 64) {
      body.style.backgroundColor = getNeutral();
    } else {
      body.style.backgroundColor = heroBg;
    }
  }

  window.addEventListener('scroll', check, { passive: true });

  // Re-run on theme change so dark/light neutral is correct
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#light_switch')) {
      // Small delay lets theme class settle before we read it
      setTimeout(check, 50);
    }
  });

  check();
}());
