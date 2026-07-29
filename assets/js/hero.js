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
    'I <a href="/case_studies/naturedose/" class="highlight nd">built</a> NatureDose\'s brand identity from the ground up — logo, iconography, App Store screens.',
    'I <a href="/case_studies/pecan/" class="highlight pecan">designed</a> PeCan so researchers can navigate complex cancer genomics data.',
    'I <a href="/case_studies/visualization_community/" class="highlight viz">built</a> visualization tools for St. Jude, now cited in academic papers.',
    'I <a href="/projects/naturequant/" class="highlight nq">lead</a> design for NatureQuant end to end — brand, product, and system.',
    'I <a href="/projects/naturescore/" class="highlight ns">designed</a> NatureScore, a system that quantifies time spent outdoors.',
    'I <a href="/about/" class="highlight jm">work</a> at the intersection of strategy and craft — brand, systems, and code.'
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
