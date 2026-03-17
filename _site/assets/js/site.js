// ============================================================
// Site name — initials expand on hover
// ============================================================
(function () {
  Array.prototype.slice.call(document.querySelectorAll('.site_name')).forEach(function (el) {
    el.innerHTML = '<span class="sn_char">J</span><span class="sn_ames">ames\u00a0</span><span class="sn_char">M</span><span class="sn_adson">adson</span>';
  });
}());


// ============================================================
// Theme Toggle
// ============================================================
(function () {
  var html = document.documentElement;

  function applyTheme(theme) {
    html.classList.remove('theme-light', 'theme-dark');
    html.classList.add('theme-' + theme);
    // Also on body so body.theme-* selectors work
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add('theme-' + theme);
  }

  // Re-apply on body now that it exists (html was already set by inline head script)
  var saved = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved);

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#light_switch') && !e.target.closest('#light_switch_mobile')) return;
    var current = html.classList.contains('theme-dark') ? 'dark' : 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });
}());


// ============================================================
// Contact — email obfuscation (base64 encoded)
// ============================================================
(function () {
  document.addEventListener('click', function (e) {
    var link = e.target.closest('.nav_contact, .work_with_me, .error_email_btn');
    if (!link) return;
    e.preventDefault();
    try {
      var u = atob(link.dataset.e);
      var d = atob(link.dataset.d);
      var s = link.dataset.s || '';
      window.location.href = 'mailto:' + u + '@' + d + (s ? '?subject=' + s : '');
    } catch (ex) {}
  });
}());


// ============================================================
// Mobile Nav
// ============================================================
(function () {
  var nav     = document.getElementById('mobilenavmenu');
  var trigger = document.getElementById('navlink');
  if (!nav || !trigger) return;

  var label = trigger.querySelector('.navlink_label');

  function open() {
    nav.classList.add('is-open');
    nav.removeAttribute('aria-hidden');
    trigger.setAttribute('aria-expanded', 'true');
    if (label) label.textContent = 'Close';
    document.body.style.overflow = 'hidden';
  }

  function close() {
    nav.classList.remove('is-open');
    nav.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = 'Menu';
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', function () {
    trigger.getAttribute('aria-expanded') === 'true' ? close() : open();
  });

  // Close on nav links — but not the accordion button
  nav.addEventListener('click', function (e) {
    if (e.target.closest('.mobile_nav_accordion_btn')) return;
    if (e.target.closest('a')) close();
  });

  // Accordion
  Array.prototype.slice.call(nav.querySelectorAll('.mobile_nav_accordion_btn')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panel = btn.nextElementSibling;
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      panel.setAttribute('aria-hidden', expanded ? 'true' : 'false');
      panel.classList.toggle('is-open', !expanded);
    });
  });

  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') &&
        !e.target.closest('#mobilenavmenu') &&
        !e.target.closest('#navlink')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
}());


// ============================================================
// Case Study — Scroll Spy + nav visibility
// ============================================================
(function () {
  var nav = document.querySelector('.case_study_nav');
  if (!nav) return;

  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;

  // Inject dot + label into each link
  links.forEach(function (a) {
    var text = a.textContent.trim();
    a.innerHTML = '<span class="cs_nav_dot"></span><span class="cs_nav_label">' + text + '</span>';
  });

  var sections = links.map(function (link) {
    var id = link.getAttribute('href').slice(1);
    return { el: document.getElementById(id), link: link };
  }).filter(function (s) { return s.el; });

  if (!sections.length) return;

  // Show nav only after the intro (first section) scrolls out of view
  var intro = document.querySelector('.about') || sections[0].el;
  var visObserver = new IntersectionObserver(function (entries) {
    nav.classList.toggle('is-visible', !entries[0].isIntersecting);
  }, { threshold: 0 });
  visObserver.observe(intro);

  // Scroll spy — highlight active section
  var spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        links.forEach(function (l) { l.classList.remove('active'); });
        var match = sections.find(function (s) { return s.el === entry.target; });
        if (match) match.link.classList.add('active');
      }
    });
  }, { rootMargin: '-15% 0px -75% 0px', threshold: 0 });

  sections.forEach(function (s) { spyObserver.observe(s.el); });
}());


// ============================================================
// Values — scroll-triggered animation
// ============================================================
(function () {
  var section = document.querySelector('.about_values');
  if (!section) return;

  var words = Array.prototype.slice.call(section.querySelectorAll('.value_word'));
  var connectors = Array.prototype.slice.call(section.querySelectorAll('.value_connector'));
  if (!words.length) return;

  var observer = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    words.forEach(function (word, i) {
      setTimeout(function () { word.classList.add('visible'); }, i * 180);
    });
    connectors.forEach(function (conn, i) {
      setTimeout(function () { conn.classList.add('visible'); }, i * 180 + 90);
    });
    observer.disconnect();
  }, { threshold: 0.35 });

  observer.observe(section);
}());


// ============================================================
// Hero — text cycling with typewriter effect
// ============================================================
(function () {
  var el = document.getElementById('hero_rotating');
  if (!el) return;

  var CLEAR_MS   = 700;
  var TYPE_MS    = 1400;
  var DISPLAY_MS = 9000;

  var slides = [
    'I\'m a <a href="about.html" class="highlight jm">designer</a> who helps teams turn ideas into <a href="case_studies/naturescore.html" class="highlight ns">clear</a>, <a href="case_studies/pecan.html" class="highlight pecan">useful</a>, and <a href="case_studies/naturequant.html" class="highlight nq">lasting</a> digital products. I\'m at my best making <a href="case_studies/visualization_community.html" class="highlight viz">complex</a> things feel <a href="case_studies/naturedose.html" class="highlight nd">simple</a> for the people using them.',
    'I <a href="about.html" class="highlight jm">build</a> design teams and systems. I\'ve <a href="case_studies/naturequant.html" class="highlight nq">defined</a> visual identities from scratch, <a href="case_studies/naturescore.html" class="highlight ns">mapped</a> complex data into something humans can read, and <a href="case_studies/pecan.html" class="highlight pecan">shipped</a> work I\'m still proud of.',
    'I <a href="case_studies/naturedose.html" class="highlight nd">prototype</a> quickly and iterate in the open. I like <a href="case_studies/visualization_community.html" class="highlight viz">tricky</a> problems and <a href="case_studies/naturescore.html" class="highlight ns">intuitive</a> solutions. The best interfaces feel <a href="case_studies/naturequant.html" class="highlight nq">obvious</a> after the fact.',
    'I <a href="about.html" class="highlight jm">work</a> closely with product and engineering. I help <a href="case_studies/naturedose.html" class="highlight nd">scope</a> what gets built, <a href="case_studies/pecan.html" class="highlight pecan">cut</a> the noise, and <a href="case_studies/visualization_community.html" class="highlight viz">design</a> things that feel right for the people using them.'
  ];

  // Parse HTML string into a flat segment list
  function parse(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var segs = [];
    tmp.childNodes.forEach(function (node) {
      if (node.nodeType === 3) {
        segs.push({ type: 'text', text: node.textContent });
      } else if (node.nodeName === 'A') {
        segs.push({ type: 'link', href: node.getAttribute('href'), cls: node.getAttribute('class'), text: node.textContent });
      }
    });
    return segs;
  }

  function countChars(segs) {
    return segs.reduce(function (n, s) { return n + s.text.length; }, 0);
  }

  // Render the first `n` visible characters; append cursor if typing
  function render(segs, n, cursor) {
    var html = '';
    var shown = 0;
    for (var i = 0; i < segs.length; i++) {
      if (shown >= n) break;
      var s = segs[i];
      var take = Math.min(s.text.length, n - shown);
      var text = s.text.slice(0, take);
      shown += take;
      html += s.type === 'text' ? text : '<a href="' + s.href + '" class="' + s.cls + '">' + text + '</a>';
    }
    if (cursor) html += '<span class="hero_cursor" aria-hidden="true"></span>';
    el.innerHTML = html;
  }

  var parsed = slides.map(parse);
  var counts = parsed.map(countChars);
  var idx = 0;

  // Measure the tallest slide and lock that height so the page doesn't shift
  var maxH = 0;
  parsed.forEach(function (segs, i) {
    render(segs, counts[i], false);
    maxH = Math.max(maxH, el.offsetHeight);
  });
  el.style.minHeight = maxH + 'px';

  render(parsed[0], counts[0], false);

  function runClear(segs, total, done) {
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / CLEAR_MS, 1);
      render(segs, Math.round((1 - p) * total), true);
      if (p < 1) requestAnimationFrame(step); else done();
    }
    requestAnimationFrame(step);
  }

  function runType(segs, total, done) {
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / TYPE_MS, 1);
      render(segs, Math.round(p * total), p < 1);
      if (p < 1) requestAnimationFrame(step); else done();
    }
    requestAnimationFrame(step);
  }

  function cycle() {
    runClear(parsed[idx], counts[idx], function () {
      idx = (idx + 1) % slides.length;
      runType(parsed[idx], counts[idx], function () {});
    });
  }

  setTimeout(function loop() { cycle(); setTimeout(loop, DISPLAY_MS); }, DISPLAY_MS);
}());


// ============================================================
// Work cards — hover image cycling + carousel controls
// ============================================================
(function () {
  // --- Image cycling ---
  var cards = Array.prototype.slice.call(document.querySelectorAll('.work_card[data-images]'));
  cards.forEach(function (card) {
    var images;
    try { images = JSON.parse(card.dataset.images); } catch (e) { return; }
    if (!images || images.length < 2) return;

    var img = card.querySelector('.work_card_img img');
    if (!img) return;

    var cur = 0;
    var timer = null;

    function showNext() {
      var next = cur;
      while (next === cur) next = Math.floor(Math.random() * images.length);
      cur = next;
      img.style.opacity = '0';
      setTimeout(function () {
        img.src = images[cur];
        img.style.opacity = '1';
      }, 120);
    }

    card.addEventListener('mouseenter', function () {
      if (timer) return;
      timer = setInterval(showNext, 350);
    });

    card.addEventListener('mouseleave', function () {
      clearInterval(timer);
      timer = null;
    });
  });

  // --- Carousel controls ---
  var sections = Array.prototype.slice.call(document.querySelectorAll('.about.work'));
  sections.forEach(function (section) {
    var carousel = section.querySelector('.work_carousel');
    if (!carousel) return;
    var allCards = Array.prototype.slice.call(carousel.querySelectorAll('.work_card'));
    if (allCards.length < 2) return;

    // Set the edge-fade colour from the actual computed background of the page
    var pageBg = getComputedStyle(document.body).backgroundColor;
    section.style.setProperty('--carousel-fade', pageBg);

    // Inject "View Project" CTA into each clickable card
    Array.prototype.slice.call(section.querySelectorAll('a.work_card')).forEach(function (c) {
      var imgArea = c.querySelector('.work_card_img');
      if (!imgArea) return;
      var cta = document.createElement('span');
      cta.className = 'work_card_cta';
      cta.textContent = 'View Project';
      imgArea.appendChild(cta);
    });

    // Inject prev / next buttons
    var chevronL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,18 9,12 15,6"/></svg>';
    var chevronR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,18 15,12 9,6"/></svg>';

    var prevBtn = document.createElement('button');
    prevBtn.className = 'work_carousel_btn work_carousel_btn_prev';
    prevBtn.setAttribute('aria-label', 'Previous project');
    prevBtn.innerHTML = chevronL;

    var nextBtn = document.createElement('button');
    nextBtn.className = 'work_carousel_btn work_carousel_btn_next';
    nextBtn.setAttribute('aria-label', 'Next project');
    nextBtn.innerHTML = chevronR;

    section.appendChild(prevBtn);
    section.appendChild(nextBtn);

    // Position arrows vertically at the centre of the card image area
    function positionArrows() {
      var imgEl = allCards[0] && allCards[0].querySelector('.work_card_img');
      if (!imgEl) return;
      var sRect = section.getBoundingClientRect();
      var iRect = imgEl.getBoundingClientRect();
      var centerY = iRect.top - sRect.top + iRect.height / 2;
      prevBtn.style.top = centerY + 'px';
      nextBtn.style.top = centerY + 'px';
    }
    positionArrows();
    window.addEventListener('resize', positionArrows);

    var cur = 0;

    function updateEdgeClasses() {
      section.classList.toggle('at-start', cur === 0);
      section.classList.toggle('at-end',   cur === allCards.length - 1);
      prevBtn.disabled = cur === 0;
      nextBtn.disabled = cur === allCards.length - 1;
    }

    function goTo(idx) {
      cur = Math.max(0, Math.min(idx, allCards.length - 1));
      var pl = parseFloat(getComputedStyle(carousel).paddingLeft) || 0;
      carousel.scrollTo({ left: allCards[cur].offsetLeft - pl, behavior: 'smooth' });
      updateEdgeClasses();
    }

    prevBtn.addEventListener('click', function () { goTo(cur - 1); });
    nextBtn.addEventListener('click', function () { goTo(cur + 1); });

    // Keep state in sync when user swipes manually
    var scrollDebounce;
    carousel.addEventListener('scroll', function () {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(function () {
        var pl = parseFloat(getComputedStyle(carousel).paddingLeft) || 0;
        var sl = carousel.scrollLeft;
        var closest = 0;
        var minDist = Infinity;
        allCards.forEach(function (card, i) {
          var dist = Math.abs(card.offsetLeft - pl - sl);
          if (dist < minDist) { minDist = dist; closest = i; }
        });
        if (closest !== cur) { cur = closest; updateEdgeClasses(); }
      }, 50);
    }, { passive: true });

    // Update fade colour when theme toggles
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#light_switch') && !e.target.closest('#light_switch_mobile')) return;
      setTimeout(function () {
        section.style.setProperty('--carousel-fade', getComputedStyle(document.body).backgroundColor);
      }, 50);
    });

    updateEdgeClasses();
  });
}());


// ============================================================
// Page Transitions
// ============================================================
(function () {
  // Trigger fade-in now that page is ready
  document.body.classList.add('page-loaded');

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href) return;

    // Skip: anchors, external URLs, mailto/tel, new-tab, downloads
    if (href.charAt(0) === '#' ||
        href.indexOf('://') > -1 ||
        href.indexOf('mailto:') === 0 ||
        href.indexOf('tel:') === 0 ||
        link.target === '_blank' ||
        link.hasAttribute('download')) return;

    e.preventDefault();
    document.body.classList.add('page-leaving');

    var dest = href;
    setTimeout(function () {
      window.location.href = dest;
    }, 280);
  });
}());
