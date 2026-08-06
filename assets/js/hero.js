// ============================================================
// Hero — fixed headline + click-to-shuffle secondary line
// ============================================================
(function () {
  var textEl = document.getElementById('hero_shuffle_text');
  var btn = document.getElementById('hero_shuffle_btn');
  if (!textEl || !btn) return;

  var FADE_MS  = 320;
  var CHAR_MS  = 42;   // ms between each character appearing
  var WORD_GAP = 80;   // extra pause before the next highlighted word starts

  var prefersReducedMotion = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var SENTENCES = [
    'I <a href="/case_studies/naturedose/" class="highlight nd">built</a> NatureDose\'s brand identity from the ground up, including logo, iconography, and App Store screens.',
    'I <a href="/case_studies/pecan/" class="highlight pecan">designed</a> PeCan so researchers can navigate complex cancer genomics data.',
    'I <a href="/case_studies/visualization_community/" class="highlight viz">built</a> visualization tools for St. Jude, now cited in academic papers.',
    'I <a href="/case_studies/naturequant/" class="highlight nq">lead</a> design for NatureQuant end to end, covering brand, product, and system.',
    'I <a href="/case_studies/naturescore/" class="highlight ns">designed</a> NatureScore, a system that quantifies time spent outdoors.',
    'I <a href="/case_studies/pecan/" class="highlight pecan">mentor</a> designers and set direction through systems: design systems for people, skills and digital personas for testing fast with AI.',
    'I <a href="/about/" class="highlight jm">work</a> at the intersection of strategy and craft, spanning brand, systems, and code.'
  ];

  var pendingCharTimeouts = [];

  // After a sentence renders, type each highlighted word character by character
  function animateHighlights(startDelay) {
    pendingCharTimeouts.forEach(clearTimeout);
    pendingCharTimeouts = [];

    var highlights = Array.prototype.slice.call(textEl.querySelectorAll('a.highlight'));
    if (!highlights.length) return;
    var delay = startDelay || 0;
    highlights.forEach(function (link) {
      var text = link.textContent;
      link.innerHTML = '';
      text.split('').forEach(function (ch) {
        var span = document.createElement('span');
        span.textContent = ch;
        span.style.cssText = 'opacity:0;display:inline;transition:opacity 55ms ease';
        link.appendChild(span);
        (function (s, d) {
          pendingCharTimeouts.push(setTimeout(function () { s.style.opacity = '1'; }, d));
        })(span, delay);
        delay += CHAR_MS;
      });
      delay += WORD_GAP;
    });
  }

  // Measure tallest sentence at plain HTML to lock height — no layout shift.
  // Re-run on resize (debounced) so the lock stays accurate after the
  // viewport changes (e.g. window resize, phone rotation).
  //
  // The measurement loop overwrites textEl.innerHTML for each sentence, then
  // restores the captured HTML — which reparses into brand-new DOM nodes. If
  // the per-character typing animation is still running at that moment, its
  // pending timeouts are closured over the OLD (now-discarded) <span>
  // elements, so they never touch the new ones and some characters can be
  // left stuck at opacity:0 forever. Track whether typing is in flight and,
  // if so, restart it against the freshly-restored DOM.
  function measureMaxHeight() {
    var wasTyping = pendingCharTimeouts.length > 0;
    var maxH = 0;
    var currentHTML = textEl.innerHTML;
    SENTENCES.forEach(function (html) {
      textEl.innerHTML = html;
      maxH = Math.max(maxH, textEl.offsetHeight);
    });
    textEl.innerHTML = currentHTML;
    textEl.style.minHeight = maxH + 'px';
    if (wasTyping) {
      animateHighlights(0);
    }
  }

  var measureTimeout = null;

  measureMaxHeight();

  window.addEventListener('resize', function () {
    clearTimeout(measureTimeout);
    measureTimeout = setTimeout(measureMaxHeight, 150);
  });

  if (!prefersReducedMotion) {
    textEl.style.transition = 'opacity ' + FADE_MS + 'ms ease, transform ' + FADE_MS + 'ms ease';
  }

  var idx = Math.floor(Math.random() * SENTENCES.length);

  function render(i) {
    idx = i;
    textEl.innerHTML = SENTENCES[idx];
    var announceEl = document.getElementById('hero_shuffle_announce');
    if (announceEl) announceEl.textContent = textEl.textContent;
  }

  render(idx);
  if (prefersReducedMotion) {
    // Highlights render normally — no per-character reveal.
  } else {
    setTimeout(function () { animateHighlights(0); }, 200);
  }

  function pickNextIndex() {
    if (SENTENCES.length <= 1) return idx;
    var next;
    do {
      next = Math.floor(Math.random() * SENTENCES.length);
    } while (next === idx);
    return next;
  }

  var fadeOutTimeout = null;
  var fadeInTimeout = null;

  function shuffle() {
    var next = pickNextIndex();

    if (prefersReducedMotion) {
      render(next);
      return;
    }

    clearTimeout(fadeOutTimeout);
    clearTimeout(fadeInTimeout);
    pendingCharTimeouts.forEach(clearTimeout);
    pendingCharTimeouts = [];

    idx = next;
    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(6px)';
    fadeOutTimeout = setTimeout(function () {
      render(next);
      textEl.style.opacity = '1';
      textEl.style.transform = 'translateY(0)';
      fadeInTimeout = setTimeout(function () { animateHighlights(0); }, FADE_MS - 60);
    }, FADE_MS + 20);
  }

  btn.addEventListener('click', shuffle);
}());
