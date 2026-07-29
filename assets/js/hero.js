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

  var SENTENCES = [
    'I <a href="/about/" class="highlight jm">design</a> interfaces that make hard things feel approachable. I\'ve helped researchers <a href="/case_studies/pecan/" class="highlight pecan">navigate</a> cancer data and people <a href="/case_studies/naturedose/" class="highlight nd">connect</a> with nature.',
    'I <a href="/about/" class="highlight jm">embed</a> with teams, <a href="/case_studies/visualization_community/" class="highlight viz">design</a> the interfaces, and <a href="/case_studies/naturedose/" class="highlight nd">build</a> the systems behind them. I\'ve done it for cancer research platforms and consumer wellness apps.',
    'I\'ve <a href="/case_studies/naturedose/" class="highlight nd">built</a> brand identity from the ground up — logo, iconography, product pages, App Store screens — and kept it consistent as the product grew.',
    'Some days it\'s a <a href="/case_studies/pecan/" class="highlight pecan">design system</a>. Some days it\'s a landing page, an icon set, or a motion study. I go where the product needs me.',
    'I <a href="/about/" class="highlight jm">prototype</a> with real data, <a href="/case_studies/pecan/" class="highlight pecan">build</a> design systems that scale, and <a href="/case_studies/naturescore/" class="highlight ns">brand</a> the companies behind the product.',
    'I <a href="/about/" class="highlight jm">work</a> at the intersection of strategy and craft. My job is making sure what gets <a href="/case_studies/pecan/" class="highlight pecan">designed</a> is worth what it took to <a href="/case_studies/naturedose/" class="highlight nd">build</a>.'
  ];

  // After a sentence renders, type each highlighted word character by character
  function animateHighlights(startDelay) {
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
          setTimeout(function () { s.style.opacity = '1'; }, d);
        })(span, delay);
        delay += CHAR_MS;
      });
      delay += WORD_GAP;
    });
  }

  // Measure tallest sentence at plain HTML to lock height — no layout shift
  var maxH = 0;
  SENTENCES.forEach(function (html) {
    textEl.innerHTML = html;
    maxH = Math.max(maxH, textEl.offsetHeight);
  });
  textEl.style.minHeight = maxH + 'px';

  textEl.style.transition = 'opacity ' + FADE_MS + 'ms ease, transform ' + FADE_MS + 'ms ease';

  var idx = Math.floor(Math.random() * SENTENCES.length);

  function render(i) {
    idx = i;
    textEl.innerHTML = SENTENCES[idx];
  }

  render(idx);
  setTimeout(function () { animateHighlights(0); }, 200);

  function pickNextIndex() {
    if (SENTENCES.length <= 1) return idx;
    var next;
    do {
      next = Math.floor(Math.random() * SENTENCES.length);
    } while (next === idx);
    return next;
  }

  function shuffle() {
    var next = pickNextIndex();
    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(6px)';
    setTimeout(function () {
      render(next);
      textEl.style.opacity = '1';
      textEl.style.transform = 'translateY(0)';
      setTimeout(function () { animateHighlights(0); }, FADE_MS - 60);
    }, FADE_MS + 20);
  }

  btn.addEventListener('click', shuffle);
}());
