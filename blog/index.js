(function () {
  var gridEl = document.getElementById('blog-grid');
  if (!gridEl) return;

  function formatDate(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return iso;
    }
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function renderPosts(posts) {
    gridEl.innerHTML = '';
    (posts || []).forEach(function (item) {
      var a = document.createElement('a');
      a.href = item.url || '/blog/' + item.slug + '/';
      a.className = 'ek-card ek-card-blog';
      a.innerHTML =
        '<div style="padding: 1rem;">' +
        (item.category ? '<span class="ek-badge">' + escapeHtml(item.category) + '</span>' : '') +
        '<h3 style="margin:0.5rem 0;">' + escapeHtml(item.title) + '</h3>' +
        (item.date ? '<p style="margin:0 0 0.5rem;font-size:0.85em;opacity:0.8;">' + formatDate(item.date) + '</p>' : '') +
        '<p class="ek-prose" style="margin:0;font-size:0.9em;">' + escapeHtml(item.summary || '') + '</p>' +
        '</div>';
      gridEl.appendChild(a);
    });
  }

  fetch('/content/posts.json')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (data) {
      var posts = Array.isArray(data) ? data : [];
      renderPosts(posts);
    })
    .catch(function (err) {
      console.warn('Blog: could not load posts.json', err);
      renderPosts([]);
    });
})();
