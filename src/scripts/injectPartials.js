/**
 * Injects header, footer, and CTA partials into elements with data-include.
 * Uses absolute paths so it works from any nested route.
 * Fails gracefully: console.warn on errors, does not break page render.
 */
(function () {
  'use strict';

  var PARTIALS = {
    header: '/src/partials/header.html',
    footer: '/src/partials/footer.html',
    cta: '/src/partials/cta.html'
  };

  function inject(name) {
    var el = document.querySelector('[data-include="' + name + '"]');
    if (!el) return;

    var url = PARTIALS[name];
    if (!url) {
      console.warn('injectPartials: unknown partial "' + name + '"');
      return;
    }

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
        return res.text();
      })
      .then(function (html) {
        el.innerHTML = html;
        if (name === 'header') {
          initNavAfterHeaderInjected(el);
        }
      })
      .catch(function (err) {
        console.warn('injectPartials: failed to load ' + url, err);
      });
  }

  /**
   * Nav toggle and current-link for injected header. Matches homepage behavior:
   * hamburger toggles menu (data-nav-menu-open, w--open); current page link gets w--current.
   */
  function initNavAfterHeaderInjected(headerContainer) {
    var nav = headerContainer.querySelector('.w-nav');
    if (!nav) return;
    var menu = nav.querySelector('.w-nav-menu');
    var button = nav.querySelector('.w-nav-button');
    if (button && menu) {
      button.addEventListener('click', function () {
        var isOpen = menu.hasAttribute('data-nav-menu-open');
        if (isOpen) {
          menu.removeAttribute('data-nav-menu-open');
          button.classList.remove('w--open');
        } else {
          menu.setAttribute('data-nav-menu-open', '');
          button.classList.add('w--open');
        }
      });
      menu.querySelectorAll('.w-nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          menu.removeAttribute('data-nav-menu-open');
          button.classList.remove('w--open');
        });
      });
    }
    var path = (typeof location !== 'undefined' && location.pathname) ? location.pathname.replace(/\/$/, '') || '/' : '';
    nav.querySelectorAll('.w-nav-link[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var linkPath = href.replace(/\/$/, '') || '/';
      if (path === linkPath) {
        link.classList.add('w--current');
      }
    });
  }

  function run() {
    inject('header');
    inject('footer');
    inject('cta');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
