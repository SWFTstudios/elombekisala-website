/**
 * Lightweight analytics helper.
 * Fires named events to window.dataLayer / gtag when available.
 * Never send names, emails, phone numbers, or message bodies.
 *
 * Optional: set window.EK_GA_MEASUREMENT_ID = 'G-XXXXXXXX' before this script
 * (or inject gtag yourself) to enable GA4. No secrets belong in the repo.
 */
(function () {
  'use strict';

  function pagePath() {
    return (typeof location !== 'undefined' && location.pathname) ? location.pathname : '';
  }

  function track(eventName, params) {
    if (!eventName) return;
    var payload = Object.assign({ page_path: pagePath() }, params || {});
    // Strip accidental PII keys if present
    ['email', 'name', 'first_name', 'phone', 'message', 'user_email'].forEach(function (k) {
      if (k in payload) delete payload[k];
    });

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, payload));

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }

    if (window.EK_DEBUG_ANALYTICS) {
      console.info('[ek-analytics]', eventName, payload);
    }
  }

  window.ekTrack = track;

  function bindClicks() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-analytics]');
      if (!el) return;
      var name = el.getAttribute('data-analytics');
      var params = {};
      if (el.getAttribute('data-analytics-source')) params.source_page = el.getAttribute('data-analytics-source');
      if (el.getAttribute('data-analytics-destination')) params.destination = el.getAttribute('data-analytics-destination');
      if (el.getAttribute('data-analytics-project')) params.project_name = el.getAttribute('data-analytics-project');
      if (el.getAttribute('data-analytics-category')) params.project_category = el.getAttribute('data-analytics-category');
      track(name, params);
    });
  }

  function bindViews() {
    document.querySelectorAll('[data-analytics-view]').forEach(function (el) {
      var name = el.getAttribute('data-analytics-view');
      if (!name || !('IntersectionObserver' in window)) {
        track(name);
        return;
      }
      var seen = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !seen) {
            seen = true;
            track(name);
            io.disconnect();
          }
        });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  function init() {
    bindClicks();
    bindViews();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
