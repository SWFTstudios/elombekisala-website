(function () {
  var gridEl = document.getElementById('journal-grid');
  if (!gridEl) return;

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function render(list) {
    gridEl.innerHTML = '';
    (list || []).forEach(function (item) {
      var a = document.createElement('a');
      a.href = item.url || '/journal/' + item.slug + '/';
      a.className = 'ek-card ek-card-project';
      a.setAttribute('data-analytics', 'article_view');
      a.setAttribute('data-analytics-category', item.category || '');
      a.innerHTML =
        '<div style="padding: 1rem;">' +
        (item.category ? '<span class="ek-badge">' + escapeHtml(item.category) + '</span>' : '') +
        '<h3 style="margin:0.5rem 0;">' + escapeHtml(item.title) + '</h3>' +
        (item.date ? '<p class="ek-prose" style="margin:0 0 0.5rem;font-size:0.85em;opacity:0.75;">' + escapeHtml(item.date) + '</p>' : '') +
        '<p class="ek-prose" style="margin:0;font-size:0.9em;">' + escapeHtml(item.summary || '') + '</p>' +
        '</div>';
      gridEl.appendChild(a);
    });
  }

  function init() {
    if (window.ekTrack) window.ekTrack('journal_view', {});
    fetch('/content/posts.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        render(Array.isArray(data) ? data : []);
      })
      .catch(function (err) {
        console.warn('Journal: could not load posts.json', err);
        render([]);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
