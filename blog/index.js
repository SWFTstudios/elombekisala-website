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
        '<div class="ek-card-blog-inner">' +
        (item.category ? '<span class="ek-badge">' + escapeHtml(item.category) + '</span>' : '') +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        (item.date ? '<p class="ek-blog-card-meta">' + formatDate(item.date) + '</p>' : '') +
        '<p class="ek-prose">' + escapeHtml(item.summary || '') + '</p>' +
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
