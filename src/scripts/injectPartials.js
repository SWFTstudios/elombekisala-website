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
      })
      .catch(function (err) {
        console.warn('injectPartials: failed to load ' + url, err);
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
