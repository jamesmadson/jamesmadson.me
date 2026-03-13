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

  function open() {
    nav.classList.add('is-open');
    nav.removeAttribute('aria-hidden');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    nav.classList.remove('is-open');
    nav.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', function () {
    trigger.getAttribute('aria-expanded') === 'true' ? close() : open();
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
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
