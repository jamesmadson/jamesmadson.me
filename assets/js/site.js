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
// Haptic feedback on button/link presses — Vibration API
// Progressive enhancement: fires a short tick on touch devices that
// support navigator.vibrate (Android). iOS WebKit has no Vibration
// API, so iPhones silently no-op. Pointerdown, not click, so the
// tick lands at the moment of touch like a native control.
// ============================================================
(function () {
  if (!('vibrate' in navigator)) return;

  var SELECTOR = [
    'a', 'button', 'input', 'select', 'summary',
    '[role="button"]'
  ].join(',');

  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'touch') return;
    var target = e.target;
    if (!target || typeof target.closest !== 'function') return;
    if (!target.closest(SELECTOR)) return;
    // Respect reduced-motion as a proxy for "calm interactions"
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    navigator.vibrate(8);
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
        if (match) match.link.classList.add('active');
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

  if (hasCsContent) {
    // Find the toggle already in the overview HTML
    var viewToggle = document.querySelector('.cs_view_toggle');
    if (viewToggle) {
      csBtns = Array.prototype.slice.call(viewToggle.querySelectorAll('.cs_view_btn'));
    }

    // Place nav inside main, directly after the hero section
    if (projectHeader) {
      projectHeader.insertAdjacentElement('afterend', csNav);
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
  var feedSection = document.createElement('section');
  feedSection.className = 'cs_image_feed';

  var masonry = document.createElement('div');
  masonry.className = 'cs_masonry';

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

  feedSection.appendChild(masonry);

  var project = document.querySelector('.project');
  if (project) {
    overview.insertAdjacentElement('afterend', feedSection);
  }

  // --- Build lightbox ---
  var lb = document.createElement('div');
  lb.className = 'cs_lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Image viewer');
  lb.innerHTML =
    '<button class="cs_lb_close" aria-label="Close lightbox">&#x2715;</button>' +
    '<button class="cs_lb_prev" aria-label="Previous image">&#x2039;</button>' +
    '<img class="cs_lb_img" src="" alt="">' +
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
  csBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isImageFeed = btn.dataset.view === 'image-feed';
      document.body.classList.toggle('image-feed', isImageFeed);
      csBtns.forEach(function (b) {
        var isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      try { localStorage.setItem('csView', btn.dataset.view); } catch (e) {}
    });
  });

  // --- Hide primary nav when case study nav is stuck at top ---
  var siteHdr = document.querySelector('.site_header');
  if (siteHdr) {
    var navOriginalTop = csNav.getBoundingClientRect().top + window.pageYOffset;
    window.addEventListener('scroll', function () {
      if (window.pageYOffset >= navOriginalTop) {
        siteHdr.classList.add('cs-nav-stuck');
      } else {
        siteHdr.classList.remove('cs-nav-stuck');
      }
    }, { passive: true });
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
// Footer tagline — rainbow wave on hover
// ============================================================
(function () {
  var tagline = document.querySelector('.site_footer_tagline');
  if (!tagline) return;

  var text = tagline.textContent;
  tagline.setAttribute('aria-label', text);
  tagline.innerHTML = text.split('').map(function (ch, i) {
    if (ch === ' ') return '<span class="tl_ch" aria-hidden="true">&nbsp;</span>';
    return '<span class="tl_ch" style="--i:' + i + '" aria-hidden="true">' + ch + '</span>';
  }).join('');

  function spawnSparkle() {
    var s = document.createElement('span');
    s.className = 'tl_sparkle';
    s.textContent = ['✦','✧','★','⋆','·'][Math.floor(Math.random() * 5)];
    var rect = tagline.getBoundingClientRect();
    s.style.left = (rect.left + Math.random() * rect.width) + 'px';
    s.style.top  = (rect.top + window.scrollY + Math.random() * rect.height) + 'px';
    s.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
    s.style.setProperty('--dy', -(Math.random() * 50 + 15) + 'px');
    s.style.animationDuration = (Math.random() * 0.4 + 0.5) + 's';
    document.body.appendChild(s);
    s.addEventListener('animationend', function () { s.parentNode && s.parentNode.removeChild(s); });
  }

  var sparkleTimer = null;
  tagline.addEventListener('mouseenter', function () {
    tagline.classList.add('tl_rainbow');
    (function burst() {
      spawnSparkle();
      spawnSparkle();
      sparkleTimer = setTimeout(burst, 160);
    }());
  });
  tagline.addEventListener('mouseleave', function () {
    tagline.classList.remove('tl_rainbow');
    clearTimeout(sparkleTimer);
    sparkleTimer = null;
  });
}());


// ============================================================
// Work page — staggered card reveal
// ============================================================
(function () {
  var grids = Array.prototype.slice.call(document.querySelectorAll('.work_page_section .home_work_grid'));
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
  }, { threshold: 0.15 });

  grids.forEach(function (grid) { revealObserver.observe(grid); });
}());
