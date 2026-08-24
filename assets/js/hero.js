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
    'I <span class="hl_wrap"><a href="/case_studies/naturedose/" class="highlight nd">built</a><span class="hl_tags" aria-hidden="true"><i class="is_name">NatureQuant</i><i>Brand</i><i>Mobile App</i><i>UX</i></span></span> NatureDose\'s brand from the ground up. Apple has featured it 3 times.',
    'I <span class="hl_wrap"><a href="/case_studies/pecan/" class="highlight pecan">designed</a><span class="hl_tags" aria-hidden="true"><i class="is_name">St. Jude</i><i>UX</i><i>Data Viz</i><i>Design System</i></span></span> PeCan so researchers can navigate 9,000+ pediatric cancer samples.',
    'I <span class="hl_wrap"><a href="/case_studies/visualization_community/" class="highlight viz">built</a><span class="hl_tags" aria-hidden="true"><i class="is_name">St. Jude</i><i>Platform</i><i>Data Viz</i><i>Front-End</i></span></span> visualization tools for St. Jude, now cited in academic papers.',
    'I <span class="hl_wrap"><a href="/case_studies/naturequant/" class="highlight nq">lead</a><span class="hl_tags" aria-hidden="true"><i class="is_name">NatureQuant</i><i>In Progress</i><i>Brand</i><i>Design System</i></span></span> design for NatureQuant end to end, covering brand, product, and system.',
    'I\'m <span class="hl_wrap"><a href="/case_studies/canon/" class="highlight canon">building</a><span class="hl_tags" aria-hidden="true"><i class="is_name">Self-initiated</i><i>In Progress</i><i>AI Tooling</i><i>Curation</i></span></span> Canon, a curated gallery of design skills for AI agents.'
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
    // Reserve the tallest-sentence height on the row rather than the text
    // element itself: the shuffle button then hugs the current sentence
    // (instead of sitting below empty reserved lines), while the row's
    // total height stays constant so nothing below shifts on shuffle.
    // Measure the whole row (text margins, flex gap, button included) so
    // the reservation is exact for every sentence.
    var row = btn.parentElement;
    row.style.minHeight = '';
    SENTENCES.forEach(function (html) {
      textEl.innerHTML = html;
      maxH = Math.max(maxH, row.offsetHeight);
    });
    textEl.innerHTML = currentHTML;
    row.style.minHeight = maxH + 'px';
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
    // Hand the sentence's project accent to the countdown ring
    var hl = textEl.querySelector('a.highlight');
    if (hl) {
      var mod = Array.prototype.filter.call(hl.classList, function (c) {
        return c !== 'highlight';
      })[0];
      if (mod) btn.setAttribute('data-accent', mod);
    }
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

  btn.addEventListener('click', function () {
    shuffle();
    scheduleAutoAdvance();
  });

  // Auto-advance every 5s. Fully disabled under prefers-reduced-motion (not
  // just the transition — the auto-updating itself), and pauses on
  // hover/focus of the row so it satisfies WCAG 2.2.2 (Pause, Stop, Hide)
  // for auto-updating content that runs longer than 5s.
  var AUTO_ADVANCE_MS = 5000;
  var autoAdvanceTimer = null;
  var autoAdvancePaused = false;

  // Countdown ring around the button — a thin stroke drains over the
  // auto-advance interval, restarting with each cycle
  var ring = null;
  if (!prefersReducedMotion) {
    ring = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ring.setAttribute('class', 'hero_shuffle_ring');
    ring.setAttribute('viewBox', '0 0 36 36');
    ring.setAttribute('aria-hidden', 'true');
    ring.innerHTML = '<circle cx="18" cy="18" r="16"/>';
    btn.appendChild(ring);
  }

  function ringStart() {
    if (!ring) return;
    ring.style.setProperty('--ring-ms', AUTO_ADVANCE_MS + 'ms');
    ring.classList.remove('is_counting');
    // Reflow so removing and re-adding the class restarts the animation
    void ring.getBoundingClientRect();
    ring.classList.add('is_counting');
  }

  function ringStop() {
    if (ring) ring.classList.remove('is_counting');
  }

  function scheduleAutoAdvance() {
    clearTimeout(autoAdvanceTimer);
    if (prefersReducedMotion || autoAdvancePaused) { ringStop(); return; }
    ringStart();
    autoAdvanceTimer = setTimeout(function () {
      shuffle();
      scheduleAutoAdvance();
    }, AUTO_ADVANCE_MS);
  }

  if (!prefersReducedMotion) {
    var shuffleRow = document.querySelector('.hero_shuffle_row');
    if (shuffleRow) {
      shuffleRow.addEventListener('mouseenter', function () {
        autoAdvancePaused = true;
        clearTimeout(autoAdvanceTimer);
        ringStop();
      });
      shuffleRow.addEventListener('mouseleave', function () {
        autoAdvancePaused = false;
        scheduleAutoAdvance();
      });
      shuffleRow.addEventListener('focusin', function () {
        autoAdvancePaused = true;
        clearTimeout(autoAdvanceTimer);
        ringStop();
      });
      shuffleRow.addEventListener('focusout', function () {
        autoAdvancePaused = false;
        scheduleAutoAdvance();
      });
    }
    scheduleAutoAdvance();
  }
}());
