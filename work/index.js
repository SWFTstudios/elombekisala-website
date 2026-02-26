(function () {
  var filtersEl = document.getElementById('work-filters');
  var gridEl = document.getElementById('work-grid');
  if (!gridEl) return;

  var allTags = ['Webflow', 'Shopify', 'Automation'];
  var activeFilter = null;

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
    });
    filtersEl.appendChild(allBtn);
    allTags.forEach(function (tag) {
      var btn = document.createElement('button');
      btn.className = 'ek-btn ek-btn-ghost';
      btn.textContent = tag;
      btn.setAttribute('type', 'button');
      btn.setAttribute('data-filter', tag);
      btn.addEventListener('click', function () {
        activeFilter = tag;
        setActiveFilterButton(tag);
        var filtered = projects.filter(function (p) {
          return p.tags && p.tags.indexOf(tag) !== -1;
        });
        renderProjects(filtered);
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

  var projects = [];

  function renderProjects(list) {
    gridEl.innerHTML = '';
    (list || []).forEach(function (item) {
      var a = document.createElement('a');
      a.href = item.url || '/work/' + item.slug + '/';
      a.className = 'ek-card ek-card-project';
      var tagsHtml = (item.tags || []).map(function (t) {
        return '<span class="ek-badge">' + escapeHtml(t) + '</span>';
      }).join(' ');
      a.innerHTML =
        (item.image ? '<img src="' + escapeHtml(item.image) + '" alt="" style="width:100%;height:200px;object-fit:cover;">' : '') +
        '<div style="padding: 1rem;">' +
        (tagsHtml ? '<div class="ek-stack-sm" style="display:flex;flex-wrap:wrap;gap:0.25rem;margin-bottom:0.5rem;">' + tagsHtml + '</div>' : '') +
        '<h3 style="margin:0 0 0.5rem;">' + escapeHtml(item.title) + '</h3>' +
        '<p class="ek-prose" style="margin:0;font-size:0.9em;">' + escapeHtml(item.excerpt || '') + '</p>' +
        '</div>';
      gridEl.appendChild(a);
    });
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function init() {
    renderFilters();
    fetch('/content/case-studies.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        projects = Array.isArray(data) ? data : [];
        if (activeFilter) {
          var filtered = projects.filter(function (p) {
            return p.tags && p.tags.indexOf(activeFilter) !== -1;
          });
          renderProjects(filtered);
        } else {
          renderProjects(projects);
        }
      })
      .catch(function (err) {
        console.warn('Work: could not load case-studies.json', err);
        renderProjects([]);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
