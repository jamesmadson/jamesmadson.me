// ============================================================
// Dials (the playable system) — a floating button on every page opens
// a right rail of four live tokens. Overrides persist in jm_dials and
// apply before first paint; the button wears a dot while engaged.
// Canon is the absence of the stored key.
// ============================================================
(function () {
  var KEY = 'jm_dials';
  var DEFAULTS = { radius: 16, type: 1, fog: 1, spring: '' };
  // Lens copy is DRAFT, James-reviewable: client-side swaps of the hero
  // line's tail. 'og' is his canon and the only copy in the HTML source.
  var LENSES = {
    engineer: { post: '. Django to Next, fifteen years on GitHub, and comfortable in your PRs. I like engineers.' },
    director:  { post: '. Twenty years across brand, product, and systems, and I keep the decision logs to prove it.' },
    recruiter: { post: ', a product designer with twenty years of shipped work. The case studies below are the resume.' }
  };
  function setTheme(t) {
    var doc = document.documentElement;
    try { t ? localStorage.setItem('theme', t) : localStorage.removeItem('theme'); } catch (e) {}
    var effective = t || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    doc.className = doc.className.replace(/\btheme-\S+/g, '').trim();
    doc.classList.add('theme-' + effective);
  }
  function track(control, value) {
    // GA4 event per dial selection; label-level only, no values that
    // could identify anyone. Answers one question: what do visitors
    // actually touch in here.
    if (typeof gtag === 'function') gtag('event', 'dials', { control: control, value: String(value) });
  }
  var SERIF_ID = 'jm_serif';
  function ensureSerif() {
    if (document.getElementById(SERIF_ID)) return;
    var l = document.createElement('link');
    l.id = SERIF_ID; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap';
    document.head.appendChild(l);
  }
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(d) { try { Object.keys(d).length ? localStorage.setItem(KEY, JSON.stringify(d)) : localStorage.removeItem(KEY); } catch (e) {} }
  function engaged(d) { return Object.keys(d).length > 0; }
  function apply(d) {
    var r = document.documentElement.style;
    var radius = d.radius != null ? d.radius : DEFAULTS.radius;
    r.setProperty('--radius-card', radius + 'px');
    r.setProperty('--radius-fig', Math.max(4, Math.round(radius * 0.6)) + 'px');
    r.setProperty('--type-scale', d.type != null ? d.type : DEFAULTS.type);
    var fog = d.fog != null ? d.fog : DEFAULTS.fog;
    r.setProperty('--fog-blur-card', Math.round(34 * fog) + 'px');
    r.setProperty('--fog-blur-hero', Math.round(64 * fog) + 'px');
    if (d.spring) r.setProperty('--spring', d.spring); else r.removeProperty('--spring');
    if (d.skin) {
      document.documentElement.setAttribute('data-skin', d.skin);
      if (d.skin === 'editorial') ensureSerif();
    } else {
      document.documentElement.removeAttribute('data-skin');
    }
    if (d.tldr) document.documentElement.setAttribute('data-tldr', '');
    else document.documentElement.removeAttribute('data-tldr');
    window.JM = window.JM || {};
    JM.lens = d.lens ? LENSES[d.lens] : null;
    JM.lensKey = d.lens || '';
    if (d.lens) document.documentElement.setAttribute('data-lens', d.lens);
    else document.documentElement.removeAttribute('data-lens');
    swapLensText();
  }
  // Tier two: any element carrying data-lens-<key> swaps its text while
  // that lens is on; the original is cached and restored on canon.
  function swapLensText() {
    var key = window.JM && JM.lensKey;
    var els = document.querySelectorAll('[data-lens-engineer],[data-lens-director],[data-lens-recruiter]');
    Array.prototype.forEach.call(els, function (el) {
      if (!el.hasAttribute('data-lens-og')) el.setAttribute('data-lens-og', el.textContent);
      var v = key && el.getAttribute('data-lens-' + key);
      el.textContent = v || el.getAttribute('data-lens-og');
    });
  }

  var state = read();
  apply(state); // always: JM.lens must exist before hero.js builds

  // compact control factories for the rail
  function seg(group, opts) {
    // Up to four options sit in one row; more wrap into even rows of three.
    var cols = opts.length <= 4 ? opts.length : 3;
    return '<div class="dials_rail_seg" role="group" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">' + opts.map(function (o) {
      return '<button type="button" data-seg="' + group + '" data-val="' + o[0].replace(/"/g, '&quot;') + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  }
  function ctl(label, tip, body, outKey) {
    return '<div class="dials_ctl">' +
      '<div class="dials_ctl_head">' +
      '  <span class="dials_ctl_label">' + label + '</span>' +
      '  <button type="button" class="dials_info" aria-label="About ' + label + '" aria-expanded="false">?</button>' +
      (outKey ? '  <output data-out="' + outKey + '"></output>' : '') +
      '  <span class="dials_tip" role="tooltip" hidden>' + tip + '</span>' +
      '</div>' + body + '</div>';
  }

  function build() {
    var fab = document.createElement('button');
    fab.className = 'dials_fab';
    fab.type = 'button';
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-label', 'Design dials');
    fab.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">' +
      '<path d="M1 4.5h10M14 4.5h3M1 13.5h3M7 13.5h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<circle cx="12.5" cy="4.5" r="2.1" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle cx="5.5" cy="13.5" r="2.1" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '<span class="dials_fab_dot" aria-hidden="true"></span>';

    var rail = document.createElement('aside');
    rail.className = 'dials_rail';
    rail.setAttribute('role', 'dialog');
    rail.setAttribute('aria-label', 'Design dials');
    rail.innerHTML =
      '<div class="dials_rail_head">' +
      '  <span>Dials</span>' +
      '  <button type="button" class="dials_rail_close" aria-label="Close dials">\u2715</button>' +
      '</div>' +
      ctl('Theme', 'Follows your OS unless you pick one.',
        seg('theme', [['', 'System'], ['light', 'Light'], ['dark', 'Dark']])) +
      ctl('Length', 'The leadins were always the summary; Tl;dr hides the elaboration. No rewritten copy.',
        seg('tldr', [['', 'Full'], ['1', 'Tl;dr']])) +
      ctl('Lens', 'Re-aims the hero, card lines, and case facts for who\u2019s reading. The originals are canon; lenses are visible swaps.',
        seg('lens', [['', 'James'], ['engineer', 'Engineer'], ['director', 'Director'], ['recruiter', 'Recruiter']])) +
      ctl('Skin', 'The visual register. Canon is the absence of one.',
        seg('skin', [['', 'Canon'], ['editorial', 'Editorial'], ['grunge', 'Grunge'], ['markdown', 'Markdown'], ['studio', 'Studio']])) +
      ctl('Spring', 'The curve every lift, flood, and this rail ride.',
        seg('spring', [['', 'Canon'], ['cubic-bezier(0.25, 0.1, 0.25, 1)', 'Calm'], ['linear(0, 0.6 20%, 1.12 55%, 0.95 78%, 1.02 92%, 1)', 'Springy']])) +
      ctl('Radius', 'Corner softness on cards and figures. Zero is brutalist.',
        '<input type="range" data-dial="radius" min="0" max="28" step="1">', 'radius') +
      ctl('Type', 'Scales the whole rem system from the root.',
        '<input type="range" data-dial="type" min="0.92" max="1.12" step="0.01">', 'type') +
      ctl('Fog', 'How far the artwork blurs behind the veils. Zero shows it raw.',
        '<input type="range" data-dial="fog" min="0" max="2" step="0.05">', 'fog') +
      '<button type="button" class="dials_rail_reset">Reset to canon</button>' +
      '<a class="dials_rail_export" href="/assets/jamesmadson-system.skill.md" download>Export this system \u2193</a>';

    document.body.appendChild(rail);
    document.body.appendChild(fab);

    var inputs = {
      radius: rail.querySelector('[data-dial="radius"]'),
      type: rail.querySelector('[data-dial="type"]'),
      fog: rail.querySelector('[data-dial="fog"]')
    };
    var outs = {
      radius: rail.querySelector('[data-out="radius"]'),
      type: rail.querySelector('[data-out="type"]'),
      fog: rail.querySelector('[data-out="fog"]')
    };
    function segButtons(group) { return rail.querySelectorAll('[data-seg="' + group + '"]'); }
    function segValue(group) {
      if (group === 'theme') { try { return localStorage.getItem('theme') || ''; } catch (e) { return ''; } }
      if (group === 'tldr') return state.tldr ? '1' : '';
      return state[group] || '';
    }
    function sync() {
      inputs.radius.value = state.radius != null ? state.radius : DEFAULTS.radius;
      inputs.type.value = state.type != null ? state.type : DEFAULTS.type;
      inputs.fog.value = state.fog != null ? state.fog : DEFAULTS.fog;
      outs.radius.value = inputs.radius.value + 'px';
      outs.type.value = (+inputs.type.value).toFixed(2);
      outs.fog.value = (+inputs.fog.value).toFixed(2).replace(/0$/, '') + '\u00d7';
      ['theme', 'tldr', 'lens', 'skin', 'spring'].forEach(function (g) {
        var cur = segValue(g);
        Array.prototype.forEach.call(segButtons(g), function (b) {
          b.classList.toggle('is_on', b.getAttribute('data-val') === cur);
        });
      });
      fab.classList.toggle('is_engaged', engaged(state));
    }
    ['radius', 'type', 'fog'].forEach(function (k) {
      inputs[k].addEventListener('input', function () {
        state[k] = +inputs[k].value;
        if (state[k] === DEFAULTS[k]) delete state[k];
        apply(state); save(state); sync();
      });
      inputs[k].addEventListener('change', function () { track(k, inputs[k].value); });
    });
    rail.addEventListener('click', function (e) {
      var b = e.target.closest('[data-seg]');
      if (b) {
        var g = b.getAttribute('data-seg'), v = b.getAttribute('data-val');
        if (g === 'theme') { track('theme', v || 'system'); setTheme(v || null); }
        else if (g === 'tldr') { track('length', v ? 'tldr' : 'full'); if (v) state.tldr = true; else delete state.tldr; apply(state); save(state); }
        else {
          track(g, v || 'canon');
          if (v) state[g] = v; else delete state[g];
          apply(state); save(state);
          if (g === 'lens') window.dispatchEvent(new Event('jm:lens'));
        }
        sync();
        return;
      }
      var info = e.target.closest('.dials_info');
      if (info) {
        var tip = info.parentElement.querySelector('.dials_tip');
        var open = !tip.hidden;
        Array.prototype.forEach.call(rail.querySelectorAll('.dials_tip'), function (t) { t.hidden = true; });
        Array.prototype.forEach.call(rail.querySelectorAll('.dials_info'), function (i) { i.setAttribute('aria-expanded', 'false'); });
        if (!open) { tip.hidden = false; info.setAttribute('aria-expanded', 'true'); }
        return;
      }
      if (!e.target.closest('.dials_tip')) {
        Array.prototype.forEach.call(rail.querySelectorAll('.dials_tip'), function (t) { t.hidden = true; });
      }
    });
    rail.querySelector('.dials_rail_reset').addEventListener('click', function () {
      track('reset', 'canon');
      state = {};
      apply(state); save(state); sync();
      window.dispatchEvent(new Event('jm:lens'));
    });
    rail.querySelector('.dials_rail_export').addEventListener('click', function () { track('export', 'skill'); });

    function setOpen(open) {
      rail.classList.toggle('is_open', open);
      fab.setAttribute('aria-expanded', String(open));
      if (open) { var f = rail.querySelector('[data-seg]'); if (f) f.focus(); }
      else fab.focus();
    }
    fab.addEventListener('click', function () {
      var opening = !rail.classList.contains('is_open');
      if (opening) track('open', location.pathname);
      setOpen(opening);
    });
    rail.querySelector('.dials_rail_close').addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && rail.classList.contains('is_open')) setOpen(false);
    });
    sync();
  }
  function buildTabs() {
    if (document.querySelector('.md_tabs')) return;
    var pages = [
      ['/', 'index'], ['/work/', 'work'], ['/about/', 'about'],
      ['/practice/', 'practice'], ['/contact/', 'contact'], ['/colophon/', 'colophon']
    ];
    var bar = document.createElement('nav');
    bar.className = 'md_tabs';
    bar.setAttribute('aria-label', 'Pages');
    var here = location.pathname;
    bar.innerHTML = pages.map(function (p) {
      var active = here === p[0] || (p[0] !== '/' && here.indexOf(p[0]) === 0);
      return '<a href="' + p[0] + '"' + (active ? ' class="active"' : '') + '>' + p[1] + '.md</a>';
    }).join('');
    document.body.insertBefore(bar, document.body.firstChild);
  }
  window.addEventListener('jm:lens', swapLensText);
  function boot() { buildTabs(); build(); swapLensText(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}());

// ============================================================
// Shared helpers (cleanup plan P3) — one reduced-motion source and one
// IntersectionObserver wrapper, so features stop hand-rolling both.
// window.JM because each feature below is its own IIFE. Extends the
// namespace: the dials module above runs first and already put
// JM.lens on it; replacing the object here clobbered that once.
// ============================================================
window.JM = Object.assign(window.JM || {}, {
  reduced: window.matchMedia('(prefers-reduced-motion: reduce)'),
  // onInView(el, { enter, exit, threshold }) — fires enter/exit on
  // intersection changes; no-ops (calls enter once) where IO is missing.
  onInView: function (el, opts) {
    if (!('IntersectionObserver' in window)) { if (opts.enter) opts.enter(); return null; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (opts.enter) opts.enter(e); }
        else if (opts.exit) opts.exit(e);
      });
    }, { threshold: opts.threshold || 0 });
    io.observe(el);
    return io;
  },
  // Shared glide highlight: one pill that travels between a host's
  // items (see _16-overrides.scss). Rests on .active when present,
  // fades in at first hover otherwise, returns on mouseleave.
  glide: function (host, itemSelector) {
    var items = Array.prototype.slice.call(host.querySelectorAll(itemSelector));
    if (!items.length) return;
    var pill = document.createElement('span');
    pill.className = 'glide_pill';
    pill.setAttribute('aria-hidden', 'true');
    host.classList.add('glide_host');
    host.insertBefore(pill, host.firstChild);
    function to(el) {
      var h = host.getBoundingClientRect(), r = el.getBoundingClientRect();
      // Collapsed/hidden items (the nav's disclosure mode) measure 0:
      // never glide to nothing.
      if (r.width < 1 || r.height < 1) return false;
      pill.style.left = (r.left - h.left + host.scrollLeft) + 'px';
      pill.style.top = (r.top - h.top + host.scrollTop) + 'px';
      pill.style.width = r.width + 'px';
      pill.style.height = r.height + 'px';
      return true;
    }
    function activeEl() { return host.querySelector('.active'); }
    function rest() {
      var a = activeEl();
      if (a && to(a)) { host.classList.add('glide_on'); }
      else { host.classList.remove('glide_on'); }
    }
    items.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        if (el.getBoundingClientRect().width < 1) return;
        if (!host.classList.contains('glide_on')) {
          // First arrival appears in place; travel is only between stops.
          pill.style.transition = 'opacity 0.18s ease';
          to(el);
          void pill.offsetWidth;
          pill.style.transition = '';
        } else {
          if (!to(el)) return;
        }
        host.classList.add('glide_on');
      });
    });
    host.addEventListener('mouseleave', rest);
    window.addEventListener('resize', function () {
      if (host.classList.contains('glide_on')) { var a = activeEl(); if (a) to(a); }
    });
    rest();
  }
});

// ============================================================
// Console greeting — for whoever (or whatever) is looking
// ============================================================
console.log(
  '%c👋 Hey there — human or AI, glad you popped the hood.',
  'font-size:14px;font-weight:bold;'
);
console.log(
  'I’m James, a product design engineer (branding, UI/UX, front-end code, research, business strategy). This site is hand-built + Claude Code — see /colophon/ for how.'
);


// ============================================================
// Haptic feedback on button/link presses
// Two paths, because the platforms differ:
//   Android — navigator.vibrate(), a real API.
//   iOS     — WebKit never shipped Vibration, but Safari 17.4+ plays
//             the system switch haptic when a checkbox with the
//             `switch` attribute is toggled by a user gesture. A
//             hidden switch inside a label gives us that tick. It
//             only fires inside the gesture's own task, so it runs
//             synchronously in the pointerdown handler.
// Either way this is enhancement: no support means no tick, and
// reduced-motion opts out entirely.
// ============================================================
(function () {
  var SELECTOR = [
    'a', 'button', 'input', 'select', 'summary',
    '[role="button"]'
  ].join(',');

  var canVibrate = 'vibrate' in navigator;
  var iosSwitch = null;

  // Feature-detect the iOS switch control rather than sniffing UA
  function supportsSwitchHaptic() {
    var probe = document.createElement('input');
    probe.type = 'checkbox';
    return 'switch' in probe;
  }

  function makeIosSwitch() {
    var label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.cssText =
      'position:absolute;width:1px;height:1px;overflow:hidden;' +
      'clip:rect(0 0 0 0);clip-path:inset(50%);pointer-events:none;';
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.tabIndex = -1;
    label.appendChild(input);
    document.body.appendChild(label);
    return input;
  }

  if (!canVibrate && supportsSwitchHaptic()) {
    iosSwitch = makeIosSwitch();
  }
  if (!canVibrate && !iosSwitch) return;

  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'touch') return;
    var target = e.target;
    if (!target || typeof target.closest !== 'function') return;
    if (!target.closest(SELECTOR)) return;
    // Respect reduced-motion as a proxy for "calm interactions"
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (canVibrate) {
      navigator.vibrate(8);
    } else if (iosSwitch) {
      // Toggling within the gesture task is what produces the tick
      iosSwitch.checked = !iosSwitch.checked;
    }
  }, { passive: true });
}());


// ============================================================
// Footer year — auto-updates
// ============================================================
(function () {
  var el = document.getElementById('footer_year');
  if (el) el.textContent = new Date().getFullYear();
}());


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
    // aria-pressed: true = light mode (pressed = light, default = dark)
    var isLight = theme === 'light';
    ['light_switch', 'light_switch_mobile'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.setAttribute('aria-pressed', String(isLight));
    });
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
      var email = atob(link.dataset.e) + '@' + atob(link.dataset.d);
      navigator.clipboard.writeText(email).then(function () {
        var orig = link.textContent;
        link.textContent = 'Copied!';
        setTimeout(function () { link.textContent = orig; }, 2000);
      });
    } catch (ex) {}
  });
}());


// ============================================================
// Active nav link — mark current page
// ============================================================
(function () {
  var path = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  var allNavLinks = Array.prototype.slice.call(document.querySelectorAll('.nav_large a, .mobile_nav_menu a'));
  allNavLinks.forEach(function (link) {
    var href = (link.getAttribute('href') || '').replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (!href || href === '#') return;
    if (href === path || (href.length > 1 && path.startsWith(href))) {
      link.classList.add('active');
    }
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

  function getFocusable() {
    return Array.prototype.slice.call(
      nav.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return !el.closest('[aria-hidden="true"]'); });
  }

  function open() {
    nav.classList.add('is-open');
    nav.removeAttribute('aria-hidden');
    trigger.setAttribute('aria-expanded', 'true');
    if (label) label.textContent = 'Close';
    document.body.style.overflow = 'hidden';
    // Move focus into nav
    var first = getFocusable()[0];
    if (first) first.focus();
  }

  function close() {
    nav.classList.remove('is-open');
    nav.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = 'Menu';
    document.body.style.overflow = '';
    // Return focus to trigger
    trigger.focus();
  }

  trigger.addEventListener('click', function () {
    trigger.getAttribute('aria-expanded') === 'true' ? close() : open();
  });

  // Close on nav links
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();
  });

  // Focus trap — keep Tab cycling within the open nav
  nav.addEventListener('keydown', function (e) {
    if (!nav.classList.contains('is-open') || e.key !== 'Tab') return;
    var focusable = getFocusable();
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') &&
        !e.target.closest('#mobilenavmenu') &&
        !e.target.closest('#navlink')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) close();
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

  // Wrap link text in label span for consistent styling
  links.forEach(function (a) {
    var text = a.textContent.trim();
    a.innerHTML = '<span class="cs_nav_label">' + text + '</span>';
  });

  var sections = links.map(function (link) {
    var id = link.getAttribute('href').slice(1);
    return { el: document.getElementById(id), link: link };
  }).filter(function (s) { return s.el; });

  if (!sections.length) return;

  // Scroll spy — highlight active section
  var spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        links.forEach(function (l) { l.classList.remove('active'); });
        var match = sections.find(function (s) { return s.el === entry.target; });
        if (match) {
          match.link.classList.add('active');
          // Keep the mobile disclosure label showing where you are
          // (this IIFE scopes the element as `nav`, not `csNav`)
          var current = nav.querySelector('.cs_nav_current');
          if (current) current.textContent = match.link.textContent.trim();
        }
      }
    });
  }, { rootMargin: '-5% 0px -60% 0px', threshold: 0 });

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
// Spectrum — scroll-triggered reveal
// ============================================================
(function () {
  var section = document.querySelector('.spectrum');
  if (!section) return;

  var observer = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    section.classList.add('spectrum--visible');
    observer.disconnect();
  }, { threshold: 0.5 });

  observer.observe(section);
}());






// ============================================================
// Set --header-h CSS variable to actual header height
// ============================================================
(function () {
  function setHeaderH() {
    var h = document.querySelector('.site_header');
    if (h) {
      document.documentElement.style.setProperty('--header-h', h.offsetHeight + 'px');
    }
  }
  setHeaderH();
  window.addEventListener('resize', setHeaderH);
}());


// ============================================================
// Smooth scroll with gentle bounce (easeOutBack)
// ============================================================
function smoothScrollTo(targetY, duration) {
  var startY = window.pageYOffset;
  var diff = targetY - startY;
  var startTime = null;

  function easeOutBack(t) {
    var c1 = 1.35;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var elapsed = timestamp - startTime;
    var progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeOutBack(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ============================================================
// Case Study — dot nav + Image Feed toggle + lightbox
// ============================================================
(function () {
  var csNav = document.querySelector('.case_study_nav');
  if (!csNav) return;

  // --- Inject dot + label spans into each nav link, add smooth scroll ---
  var navLinks = Array.prototype.slice.call(csNav.querySelectorAll('a[href^="#"]'));
  navLinks.forEach(function (a) {
    var label = a.textContent.trim();
    a.innerHTML = '';
    var dot = document.createElement('span');
    dot.className = 'cs_nav_dot';
    var labelEl = document.createElement('span');
    labelEl.className = 'cs_nav_label';
    labelEl.textContent = label;
    a.appendChild(dot);
    a.appendChild(labelEl);

    a.addEventListener('click', function (e) {
      var targetId = a.getAttribute('href').slice(1);
      var targetY = targetId === 'top' ? 0 : (function () {
        var el = document.getElementById(targetId);
        if (!el) return null;
        var siteHeader = document.querySelector('.site_header');
        var csNavBar   = document.querySelector('.case_study_nav');
        var offset = (siteHeader ? siteHeader.offsetHeight : 72)
                   + (csNavBar  ? csNavBar.offsetHeight   : 40)
                   + 16;
        return el.getBoundingClientRect().top + window.pageYOffset - offset;
      })();
      if (targetY === null) return;
      e.preventDefault();
      smoothScrollTo(targetY, 900);
    });
  });

  // --- Wire up view toggle from HTML + place nav ---
  var hasCsContent = document.querySelector('.cs_content');
  var csBtns = [];

  var mainEl = document.querySelector('main');
  var projectHeader = mainEl && mainEl.querySelector('section.about');

  // On phones the section list becomes a disclosure: the bar shows the
  // current section, tapping opens the full list. Horizontal scrolling
  // a row of pills hid most of the sections and felt broken.
  function buildSectionDisclosure() {
    var toggle = document.createElement('li');
    toggle.className = 'cs_nav_disclosure';
    toggle.innerHTML =
      '<button type="button" aria-expanded="false">' +
        '<span class="cs_nav_current">Sections</span>' +
        '<svg width="12" height="12" viewBox="0 0 18 18" fill="none" aria-hidden="true">' +
          '<path d="M4.5 6.75 9 11.25l4.5-4.5" stroke="currentColor" stroke-width="1.75" ' +
          'stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>';
    var btn = toggle.querySelector('button');
    btn.addEventListener('click', function () {
      var open = csNav.classList.toggle('sections-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    csNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        csNav.classList.remove('sections-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    return toggle;
  }

  // Case studies get a "← Work" link at the start of the section nav
  // (the hero stays clean; the way back rides the sticky nav instead)
  if (window.location.pathname.indexOf('/case_studies/') === 0) {
    var backLi = document.createElement('li');
    backLi.className = 'cs_nav_back';
    backLi.innerHTML =
      '<a href="/work/"><svg width="13" height="13" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M14 7.5H2M7 2 2 7.5 7 13" stroke="currentColor" stroke-width="1.8" stroke-linejoin="miter"/></svg>Work</a>';
    csNav.insertBefore(backLi, csNav.firstChild);
    csNav.insertBefore(buildSectionDisclosure(), backLi.nextSibling);
  }

  if (hasCsContent) {
    // Build the case-study/image-feed view toggle inside the section
    // nav (it used to live in the Overview meta row)
    var toggleLi = document.createElement('li');
    toggleLi.className = 'cs_nav_view';
    toggleLi.innerHTML =
      '<div class="cs_view_toggle" role="group" aria-label="Toggle case study view">' +
        '<button class="cs_view_btn" data-view="case-study" aria-pressed="true" aria-label="Case study view">' +
          '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><line x1="2" y1="4" x2="12" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="2" y1="10" x2="12" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
        '</button>' +
        '<button class="cs_view_btn" data-view="image-feed" aria-pressed="false" aria-label="Image grid view">' +
          '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="2" width="4" height="4" rx="0.5" fill="currentColor"/><rect x="8" y="2" width="4" height="4" rx="0.5" fill="currentColor"/><rect x="2" y="8" width="4" height="4" rx="0.5" fill="currentColor"/><rect x="8" y="8" width="4" height="4" rx="0.5" fill="currentColor"/></svg>' +
        '</button>' +
      '</div>';
    csNav.appendChild(toggleLi);
    csBtns = Array.prototype.slice.call(toggleLi.querySelectorAll('.cs_view_btn'));

    // Place nav inside main, after the cover image when the page has
    // one (hero → cover → nav → content), else directly after the hero
    var coverEl = mainEl && mainEl.querySelector('.cs_cover');
    if (coverEl || projectHeader) {
      (coverEl || projectHeader).insertAdjacentElement('afterend', csNav);
    } else if (mainEl) {
      mainEl.insertBefore(csNav, mainEl.firstChild);
    }

    // Apply saved preference
    var savedCsView = localStorage.getItem('csView') || 'case-study';
    if (savedCsView === 'image-feed') document.body.classList.add('image-feed');
    csBtns.forEach(function (b) {
      var isActive = b.dataset.view === savedCsView;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  } else {
    // No cs_content (e.g. resume) — move nav inside main after header area
    var anchor = mainEl && (projectHeader || mainEl.querySelector('.resume_header'));
    if (anchor) {
      anchor.insertAdjacentElement('afterend', csNav);
    } else if (mainEl) {
      mainEl.insertBefore(csNav, mainEl.firstChild);
    }
  }

  // --- Collect all design images for the masonry feed ---
  // Includes standard blocks, paired images, carousels, and icon grids —
  // so any new layout type automatically appears if it uses one of these containers.
  var allImgs = Array.prototype.slice.call(document.querySelectorAll(
    '.cs_images img, .cs_image_pair img, .nd_phone_carousel img, .cs_icon_grid img'
  ));
  var seenSrcs = {};
  var items = allImgs.map(function (img) {
    var captionEl = img.closest('.cs_images, .cs_image_pair > div') && img.parentElement.querySelector('.cs_description');
    return {
      src: img.src,
      caption: captionEl ? captionEl.textContent.trim() : (img.alt || '')
    };
  }).filter(function (item) {
    if (!item.src || seenSrcs[item.src]) return false;
    seenSrcs[item.src] = true;
    return true;
  });

  // --- Build masonry feed ---
  // `items` above is cheap: it just reads the `src` string off images that
  // already exist on the page, no extra request. Actually building the feed
  // means creating a fresh <img> per item and assigning its src, which the
  // browser fetches the instant it's assigned — a full second download of
  // every design image on the page, whether or not the feed is ever shown.
  // Deferred to first use: either the toggle click, or immediately below if
  // the visitor's saved preference already has grid view on.
  var feedSection = document.createElement('section');
  feedSection.className = 'cs_image_feed';

  var masonry = document.createElement('div');
  masonry.className = 'cs_masonry';
  feedSection.appendChild(masonry);

  var project = document.querySelector('.project');
  if (project) {
    overview.insertAdjacentElement('afterend', feedSection);
  }

  var masonryBuilt = false;
  function buildMasonryFeed() {
    if (masonryBuilt) return;
    masonryBuilt = true;
    items.forEach(function (item, idx) {
      var figure = document.createElement('figure');
      figure.className = 'cs_masonry_item';
      figure.dataset.idx = idx;
      figure.setAttribute('tabindex', '0');
      figure.setAttribute('role', 'button');
      figure.setAttribute('aria-label', 'View image' + (item.caption ? ': ' + item.caption : ''));
      var img = document.createElement('img');
      img.src = item.src;
      img.alt = item.caption || '';
      figure.appendChild(img);
      if (item.caption) {
        var cap = document.createElement('figcaption');
        cap.textContent = item.caption;
        figure.appendChild(cap);
      }
      masonry.appendChild(figure);
    });
  }

  // Returning visitor whose saved preference already has grid view on —
  // build now so there's no flash of an empty feed. `savedCsView` is set
  // above, before `items` exists yet, so it can't call this any earlier.
  if (savedCsView === 'image-feed') buildMasonryFeed();

  // --- Build lightbox ---
  var lb = document.createElement('div');
  lb.className = 'cs_lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Image viewer');
  lb.innerHTML =
    '<button class="cs_lb_close" aria-label="Close lightbox">&#x2715;</button>' +
    '<button class="cs_lb_prev" aria-label="Previous image">&#x2039;</button>' +
    '<img class="cs_lb_img" alt="">' +
    '<p class="cs_lb_caption" aria-live="polite"></p>' +
    '<button class="cs_lb_next" aria-label="Next image">&#x203A;</button>';
  document.body.appendChild(lb);

  var lbImg     = lb.querySelector('.cs_lb_img');
  var lbCaption = lb.querySelector('.cs_lb_caption');
  var lbClose   = lb.querySelector('.cs_lb_close');
  var lbPrev    = lb.querySelector('.cs_lb_prev');
  var lbNext    = lb.querySelector('.cs_lb_next');
  var lbCurrent = 0;
  var lbTrigger = null; // element that opened the lightbox — focus returns here on close

  function lbOpen(idx, trigger) {
    lbCurrent = Math.max(0, Math.min(idx, items.length - 1));
    lbImg.src = items[lbCurrent].src;
    lbImg.alt = items[lbCurrent].caption || '';
    lbCaption.textContent = items[lbCurrent].caption || '';
    lbPrev.disabled = lbCurrent === 0;
    lbNext.disabled = lbCurrent === items.length - 1;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (trigger) lbTrigger = trigger;
    // Move focus into dialog
    lbClose.focus();
  }

  function lbClose_fn() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    // Return focus to triggering element
    if (lbTrigger) { lbTrigger.focus(); lbTrigger = null; }
  }

  // Focus trap within lightbox
  lb.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusable = Array.prototype.slice.call(lb.querySelectorAll('button:not([disabled])'));
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  lbClose.addEventListener('click', lbClose_fn);
  lbPrev.addEventListener('click', function () { lbOpen(lbCurrent - 1); });
  lbNext.addEventListener('click', function () { lbOpen(lbCurrent + 1); });

  lb.addEventListener('click', function (e) {
    if (e.target === lb) lbClose_fn();
  });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape')      lbClose_fn();
    if (e.key === 'ArrowLeft')   lbOpen(lbCurrent - 1);
    if (e.key === 'ArrowRight')  lbOpen(lbCurrent + 1);
  });

  // Open lightbox on masonry item click or Enter/Space keydown
  masonry.addEventListener('click', function (e) {
    var item = e.target.closest('.cs_masonry_item');
    if (!item) return;
    lbOpen(parseInt(item.dataset.idx, 10), item);
  });

  masonry.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var item = e.target.closest('.cs_masonry_item');
    if (!item) return;
    e.preventDefault();
    lbOpen(parseInt(item.dataset.idx, 10), item);
  });

  // --- Toggle handler (saves preference, updates aria-pressed) ---
  function applyCsView(view) {
    var isImageFeed = view === 'image-feed';
    if (isImageFeed) buildMasonryFeed();
    document.body.classList.toggle('image-feed', isImageFeed);
    csBtns.forEach(function (b) {
      var isActive = b.dataset.view === view;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    try { localStorage.setItem('csView', view); } catch (e) {}
  }

  csBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { applyCsView(btn.dataset.view); });
  });

  // Section links exit feed mode first, so the anchor they point at
  // actually exists on screen when the browser scrolls to it
  csNav.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    if (document.body.classList.contains('image-feed')) {
      applyCsView('case-study');
    }
    // "Back to Top" points at #top, but no case study has an element
    // with that id, and the browser's native #top fallback never fires
    // here — clicking it did nothing. Scroll explicitly instead.
    if (link.getAttribute('href') === '#top') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', location.pathname);
    }
  });

  // --- Hide the primary header the moment the section nav reaches it ---
  // Measured live on every scroll rather than cached at load: the old
  // version stored the nav's document position once, which went stale
  // as soon as an image finished loading or the window resized, and it
  // only fired after the nav had already stuck — so the two bars
  // collided on the way up.
  var siteHdr = document.querySelector('.site_header');
  if (siteHdr) {
    var syncHeader = function () {
      var navTop = csNav.getBoundingClientRect().top;
      var hdrH = siteHdr.offsetHeight || 0;
      siteHdr.classList.toggle('cs-nav-stuck', navTop <= hdrH);
    };
    window.addEventListener('scroll', syncHeader, { passive: true });
    window.addEventListener('resize', syncHeader);
    syncHeader();
  }

  // --- Dot nav scroll spy ---
  var dotLinks = Array.prototype.slice.call(csNav.querySelectorAll('a[href^="#"]'));
  var spySections = dotLinks.map(function (a) {
    var id = a.getAttribute('href').slice(1);
    return { el: document.getElementById(id), link: a };
  }).filter(function (s) { return s.el; });

  if (spySections.length) {
    var spyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          dotLinks.forEach(function (l) { l.classList.remove('active'); });
          var match = spySections.find(function (s) { return s.el === entry.target; });
          if (match) match.link.classList.add('active');
        }
      });
    }, { rootMargin: '-5% 0px -60% 0px', threshold: 0 });
    spySections.forEach(function (s) { spyObs.observe(s.el); });
  }
}());


// ============================================================
// Work page — staggered card reveal
// ============================================================
(function () {
  var grids = Array.prototype.slice.call(document.querySelectorAll('.home_work_grid'));
  if (!grids.length) return;

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var cards = Array.prototype.slice.call(entry.target.querySelectorAll('.hwc'));
      cards.forEach(function (card, i) {
        setTimeout(function () { card.classList.add('wp_visible'); }, i * 90);
      });
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.05 });

  grids.forEach(function (grid) { revealObserver.observe(grid); });
}());

// ============================================================
// Case study cover — the full square artwork pans through its
// letterboxed frame as you scroll, so the whole image gets seen.
// Lerp-eased per frame; reduced-motion users get a centered crop
// via CSS instead.
// ============================================================
(function () {
  var img = document.querySelector('.cs_cover_img:not(.cs_cover_img--flat)');
  if (!img) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var EASE = 0.1; // lerp factor per frame — lower is calmer

  var frame = img.parentElement;
  var currentY = 0, targetY = 0, raf = null;
  var currentO = 1, targetO = 1;

  function retarget() {
    var fr = frame.getBoundingClientRect();
    var vh = window.innerHeight || 1;

    var overflow = img.offsetHeight - frame.offsetHeight;
    if (overflow <= 0) { targetY = 0; }
    else {
      // 0 when the frame enters at the bottom, 1 as it exits the top
      var p = (vh - fr.top) / (vh + fr.height);
      p = Math.max(0, Math.min(1, p));
      targetY = -p * overflow;
    }

    // Exit fade: starts the moment the frame's top crosses the top of
    // the viewport, fully transparent by the time 3/4 of it has left.
    // Fades the frame (not the img) so the rounded mask goes with it.
    var exitP = fr.height > 0 ? Math.max(0, -fr.top / fr.height) : 0;
    targetO = Math.max(0, 1 - exitP / 0.75);

    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    raf = null;
    currentY += (targetY - currentY) * EASE;
    currentO += (targetO - currentO) * EASE;
    img.style.transform = 'translateY(' + currentY.toFixed(2) + 'px)';
    frame.style.opacity = currentO.toFixed(3);
    if (Math.abs(targetY - currentY) > 0.05 || Math.abs(targetO - currentO) > 0.002) {
      raf = requestAnimationFrame(tick);
    }
  }

  window.addEventListener('scroll', retarget, { passive: true });
  window.addEventListener('resize', retarget);
  retarget();
}());

// ============================================================
// Services list — staggered rise on scroll (About page)
// CSS-driven: JS only marks readiness and entry, so content is never
// hidden without JS and reduced-motion skips the whole thing.
// ============================================================
(function () {
  var section = document.querySelector('.about_services');
  if (!section) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var items = section.querySelectorAll('.services_list li');
  items.forEach(function (li, i) { li.style.setProperty('--stagger-i', i); });
  section.classList.add('stagger_ready');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        section.classList.add('in_view');
        io.disconnect();
      }
    });
  }, { threshold: 0.05 });
  io.observe(section);
}());

// ============================================================
// Case-study films + course map (moved from saddles100.html inline, P3)
// Films: fade in when playable, play only on screen, never autoplay
// under reduced motion. Map: cycles until a click takes the wheel.
// Both bind by DOM presence, so any future case study gets them free.
// ============================================================
(function () {
  /* Every film on the page shares one contract: fade in when playable,
     play only while on screen, never autoplay under reduced motion.
     Figure videos use preload="none", so nothing downloads until the
     reader scrolls to it and the observer calls play(). */
  var reduced = JM.reduced.matches;
  var mobile = window.matchMedia('(max-width: 768px)').matches;

  document.querySelectorAll('.cs_cover_video').forEach(function (wrap) {
    var v = wrap.querySelector('video');
    var btn = wrap.querySelector('.cs_film_toggle');
    if (!v || !btn) return;
    /* Phones get the lighter rendition; swap before any bytes move. */
    var src = v.querySelector('source');
    if (mobile && src && src.dataset.mobile) { src.src = src.dataset.mobile; v.load(); }
    var userPaused = reduced;

    function syncBtn() {
      var paused = v.paused;
      btn.setAttribute('aria-pressed', String(paused));
      btn.setAttribute('aria-label', paused ? 'Play the film' : 'Pause the film');
    }

    function markReady() { wrap.classList.add('is_ready'); }
    v.addEventListener('canplay', markReady, { once: true });
    // Fast loads can fire canplay before this script attaches; check state too.
    if (v.readyState >= 3) markReady();
    v.addEventListener('play', syncBtn);
    v.addEventListener('pause', syncBtn);

    btn.addEventListener('click', function () {
      if (v.paused) { userPaused = false; v.play(); }
      else { userPaused = true; v.pause(); }
    });

    if (!reduced && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          if (!userPaused) v.play().catch(function () {});
        } else {
          v.pause();
        }
      }, { threshold: 0.25 });
      io.observe(v);
    }
    syncBtn();
  });
}());

(function () {
  /* The course map cycles through the three races while on screen;
     a click takes the wheel and the cycle stays stopped. */
  var wrap = document.getElementById('cv2_routes');
  if (!wrap) return;
  var btns = Array.prototype.slice.call(wrap.querySelectorAll('.cv2_route_btns button'));
  var keys = ['100', '50', '666'];
  var reduced = JM.reduced;
  var idx = -1, timer = null, manual = false;

  function show(key) {
    wrap.classList.remove('sel100', 'sel50', 'sel666');
    btns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    if (key) {
      wrap.classList.add('sel' + key);
      btns.forEach(function (x) {
        if (x.getAttribute('data-route') === key) x.setAttribute('aria-pressed', 'true');
      });
    }
  }
  function tick() {
    idx = (idx + 1) % (keys.length + 1); /* the fourth beat shows all three */
    show(idx < keys.length ? keys[idx] : null);
  }
  function start() {
    if (timer || manual || reduced.matches) return;
    timer = setInterval(tick, 2800);
  }
  function stop() { clearInterval(timer); timer = null; }

  JM.onInView(wrap, { threshold: 0.35, enter: start, exit: stop });
  reduced.addEventListener('change', function (e) {
    if (e.matches) { manual = false; stop(); show(null); }
  });

  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      manual = true; stop();
      var on = b.getAttribute('aria-pressed') === 'true';
      show(on ? null : b.getAttribute('data-route'));
    });
  });
}());

// ============================================================
// Carson title jumble (skin: grunge) — case-page titles split into
// letters and scatter deterministically: somewhat legible, per the
// KEW reference. Original text restored the moment the skin leaves.
// ============================================================
(function () {
  var targets = Array.prototype.slice.call(
    document.querySelectorAll('.project h1, .cs_hero h1, main h1.jm_title, .wc_headline')
  );
  if (!targets.length) return;
  var originals = new Map();
  var done = false;
  function jumbleEl(h, seed) {
    originals.set(h, h.innerHTML);
    var text = h.textContent.replace(/\s+/g, ' ');
    h.setAttribute('aria-label', text);
    h.innerHTML = text.split('').map(function (ch, i) {
      if (ch === ' ') return ' ';
      var r = Math.sin((i + seed) * 127.1) * 43758.5453; r = r - Math.floor(r);
      var r2 = Math.sin((i + seed) * 311.7) * 12543.21; r2 = r2 - Math.floor(r2);
      var rot = (r * 28 - 14).toFixed(1);
      var dy = (r2 * 0.8 - 0.4).toFixed(2);
      var big = (i % 3 === 0) ? 1.4 : (i % 5 === 0 ? 0.8 : 1);
      var w = r2 > 0.6 ? 800 : (r > 0.7 ? 300 : 'inherit');
      return '<span aria-hidden="true" style="display:inline-block;font-weight:' + w + ';transform:rotate(' + rot + 'deg) translateY(' + dy + 'em) scale(' + big + ');">' + ch + '</span>';
    }).join('');
  }
  function jumble() { targets.forEach(function (h, k) { jumbleEl(h, k * 31); }); done = true; }
  function restore() {
    targets.forEach(function (h) {
      if (originals.has(h)) { h.innerHTML = originals.get(h); h.removeAttribute('aria-label'); }
    });
    done = false;
  }
  function syncJumble() {
    var on = document.documentElement.getAttribute('data-skin') === 'grunge';
    if (on && !done) jumble();
    if (!on && done) restore();
  }
  new MutationObserver(syncJumble).observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin'] });
  syncJumble();
}());

// ============================================================
// Studio exhibition (skin: studio) — faithful to the reference's
// mechanics: the artwork takes the whole viewport edge to edge, the
// title lives in a breadcrumb strip (not on the art), an index
// counts the works, thumbs pin to the bottom edge, and the wheel
// cycles the feature while the cursor is over it. Crossfades ride a
// fixed curve; reduced motion swaps instantly.
// ============================================================
(function () {
  var grid = document.querySelector('.home_work_grid');
  if (!grid || !location.pathname.startsWith('/work')) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.hwc')).map(function (a) {
    var mod = (a.className.match(/hwc\s+(\w+)/) || [])[1];
    var name = a.querySelector('.wc_headline');
    var titleText = name ? name.innerHTML.replace(/<br[^>]*>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
    return { href: a.getAttribute('href'), mod: mod, title: titleText,
      sub: ((a.querySelector('.wc_subhead') || {}).textContent || '').trim(),
      img: '/img/covers/ambient/' + mod + '.jpg' };
  }).filter(function (c) { return c.mod && c.href; });
  if (!cards.length) return;

  var stage = document.createElement('section');
  stage.className = 'studio_stage';
  stage.setAttribute('aria-label', 'Featured work');
  stage.innerHTML =
    '<div class="studio_strip">' +
    '  <span class="studio_crumb"></span>' +
    '  <span class="studio_index"></span>' +
    '</div>' +
    '<a class="studio_feature" href="#" aria-label=""></a>' +
    '<div class="studio_rail" role="tablist" aria-label="Projects"></div>';
  grid.parentElement.insertBefore(stage, grid);

  var feature = stage.querySelector('.studio_feature');
  var crumb = stage.querySelector('.studio_crumb');
  var indexEl = stage.querySelector('.studio_index');
  var railEl = stage.querySelector('.studio_rail');
  var reduced = JM.reduced.matches;
  var idx = 0, busy = false;

  cards.forEach(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.style.backgroundImage = 'url(' + c.img + ')';
    b.setAttribute('aria-label', c.title);
    b.addEventListener('click', function () { show(i); });
    railEl.appendChild(b);
  });
  var thumbs = railEl.children;

  function pad(n) { return (n < 9 ? '0' : '') + (n + 1); }
  function render(i) {
    var c = cards[i];
    feature.href = c.href;
    feature.setAttribute('aria-label', c.title + ' \u2014 open case study');
    feature.style.backgroundImage = 'url(' + c.img + ')';
    crumb.textContent = 'Work: ' + c.title + ' \u2014 ' + c.sub;
    indexEl.textContent = pad(i) + ' / ' + pad(cards.length - 1);
    Array.prototype.forEach.call(thumbs, function (t, j) { t.classList.toggle('is_active', j === i); });
  }
  function show(i) {
    i = (i + cards.length) % cards.length;
    if (i === idx && feature.href !== '#') { }
    idx = i;
    if (reduced) { render(i); return; }
    if (busy) return;
    busy = true;
    feature.classList.add('is_fading');
    setTimeout(function () {
      render(i);
      feature.classList.remove('is_fading');
      setTimeout(function () { busy = false; }, 180);
    }, 180);
  }
  var wheelLock = 0;
  stage.addEventListener('wheel', function (e) {
    if (document.documentElement.getAttribute('data-skin') !== 'studio') return;
    e.preventDefault();
    var now = Date.now();
    if (now - wheelLock < 650 || Math.abs(e.deltaY) < 8) return;
    wheelLock = now;
    show(idx + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });
  function syncHidden() {
    var on = document.documentElement.getAttribute('data-skin') === 'studio';
    grid.classList.toggle('is_studio_hidden', on);
    grid.style.display = on ? 'none' : '';
    var pageTitle = document.querySelector('.home_work_title') || document.querySelector('main h1.jm_title, header h1.jm_title');
    if (pageTitle) {
      var box = pageTitle.closest('header') || pageTitle;
      box.style.display = on ? 'none' : '';
    }
  }
  new MutationObserver(syncHidden).observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin'] });
  render(0);
  syncHidden();
}());

// ============================================================
// Glide demo wiring (James picks which surfaces keep it)
// ============================================================
(function () {
  var nav = document.querySelector('.case_study_nav');
  if (nav) JM.glide(nav, 'a');
  var inline = document.querySelector('.nav_inline');
  if (inline) JM.glide(inline, 'a');
  var links = document.querySelector('.about_meta_links');
  if (links) JM.glide(links, 'a');
}());
