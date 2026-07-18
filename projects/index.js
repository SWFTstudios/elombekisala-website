(function () {
  var filtersEl = document.getElementById('project-filters');
  var gridEl = document.getElementById('project-grid');
  var emptyEl = document.getElementById('project-empty');
  if (!gridEl) return;

  var allCategories = ['Business', 'Web', 'Content', 'Film', 'Product', 'Experiment', 'Client Work'];
  var activeFilter = null;
  var projects = [];

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function trackFilter(cat) {
    if (window.ekTrack) {
      window.ekTrack('project_filter', { project_category: cat || 'all' });
    }
  }

  function renderFilters() {
    if (!filtersEl) return;
    filtersEl.innerHTML = '';
    var allBtn = document.createElement('button');
    allBtn.className = 'ek-btn';
    allBtn.textContent = 'All';
    allBtn.setAttribute('type', 'button');
    allBtn.setAttribute('data-filter', '');
    allBtn.addEventListener('click', function () {
      activeFilter = null;
      setActiveFilterButton(null);
      renderProjects(projects);
      trackFilter(null);
    });
    filtersEl.appendChild(allBtn);
    allCategories.forEach(function (tag) {
      var btn = document.createElement('button');
      btn.className = 'ek-btn ek-btn-ghost';
      btn.textContent = tag;
      btn.setAttribute('type', 'button');
      btn.setAttribute('data-filter', tag);
      btn.addEventListener('click', function () {
        activeFilter = tag;
        setActiveFilterButton(tag);
        var filtered = projects.filter(function (p) {
          return p.categories && p.categories.indexOf(tag) !== -1;
        });
        renderProjects(filtered);
        trackFilter(tag);
      });
      filtersEl.appendChild(btn);
    });
  }

  function setActiveFilterButton(current) {
    var buttons = filtersEl ? filtersEl.querySelectorAll('button') : [];
    buttons.forEach(function (b) {
      var isActive = (current === null && b.getAttribute('data-filter') === '') || (b.getAttribute('data-filter') === current);
      b.classList.toggle('ek-btn', isActive);
      b.classList.toggle('ek-btn-ghost', !isActive);
    });
  }

  function renderProjects(list) {
    gridEl.innerHTML = '';
    var items = list || [];
    if (emptyEl) emptyEl.style.display = items.length ? 'none' : 'block';
    items.forEach(function (item) {
      var a = document.createElement('a');
      a.href = item.url || '/projects/' + item.slug + '/';
      a.className = 'ek-card ek-card-project';
      a.setAttribute('data-analytics', 'project_view');
      a.setAttribute('data-analytics-project', item.slug || '');
      var cats = (item.categories || []).map(function (t) {
        return '<span class="ek-badge">' + escapeHtml(t) + '</span>';
      }).join(' ');
      var status = item.status ? '<span class="ek-badge">' + escapeHtml(item.status) + '</span>' : '';
      a.innerHTML =
        (item.image ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" style="width:100%;height:200px;object-fit:cover;" loading="lazy">' : '') +
        '<div style="padding: 1rem;">' +
        '<div class="ek-stack-sm" style="display:flex;flex-wrap:wrap;gap:0.25rem;margin-bottom:0.5rem;">' + status + cats + '</div>' +
        '<h3 style="margin:0 0 0.5rem;">' + escapeHtml(item.title) + '</h3>' +
        '<p class="ek-prose" style="margin:0;font-size:0.9em;">' + escapeHtml(item.oneLiner || item.excerpt || '') + '</p>' +
        '</div>';
      gridEl.appendChild(a);
    });
  }

  function init() {
    renderFilters();
    fetch('/content/projects.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        projects = Array.isArray(data) ? data : [];
        renderProjects(projects);
        if (window.ekTrack) window.ekTrack('project_view', { project_name: 'index' });
      })
      .catch(function (err) {
        console.warn('Projects: could not load projects.json', err);
        renderProjects([]);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
