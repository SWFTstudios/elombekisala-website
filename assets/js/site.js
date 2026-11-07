/* elombekisala.com — interactions
   Motion: GSAP + ScrollTrigger + SplitText, Lenis smooth scroll.
   Everything degrades: without JS or with reduced motion, content is fully visible. */
(function () {
  'use strict';

  var html = document.documentElement;
  var motion = html.classList.contains('motion') && window.gsap && window.ScrollTrigger;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  if (!motion) html.classList.remove('motion');
  html.classList.add('ready');

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  if (motion) gsap.registerPlugin(ScrollTrigger);
  if (motion && window.SplitText) gsap.registerPlugin(SplitText);

  /* ---------- header: hide on scroll down, show on scroll up ---------- */
  var header = $('[data-header]');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 20);
      header.classList.toggle('is-hidden', y > 300 && y > lastY && !html.classList.contains('menu-open'));
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- clock ---------- */
  function tick() {
    $$('[data-clock]').forEach(function (el) {
      try { el.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) + (el.getAttribute('data-clock-suffix') || ''); }
      catch (e) { el.textContent = ''; }
    });
  }
  tick(); setInterval(tick, 20000);

  /* ---------- menu ---------- */
  var menuBtn = $('[data-menu-btn]'), menu = $('[data-menu]');
  function setMenu(open) {
    if (!menu) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    html.classList.toggle('menu-open', open);
    if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('is-open'); }); if (lenis) lenis.stop(); }
    else { menu.classList.remove('is-open'); setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 800); if (lenis) lenis.start(); }
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && html.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });

  /* ---------- copy email ---------- */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var hint = $('.copy-hint', btn);
      var text = btn.getAttribute('data-copy');
      var done = function () { if (hint) { hint.textContent = 'Copied ✓'; setTimeout(function () { hint.textContent = 'Copy'; }, 2200); } };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { location.href = 'mailto:' + text; });
      else location.href = 'mailto:' + text;
    });
  });

  /* ---------- misc buttons ---------- */
  $$('[data-top]').forEach(function (b) { b.addEventListener('click', function () { if (lenis) lenis.scrollTo(0, { duration: 1.6 }); else window.scrollTo({ top: 0, behavior: 'smooth' }); }); });
  $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* ---------- theme toggle (circular reveal where supported) ---------- */
  var themeBtns = $$('[data-theme-toggle]');
  function labelTheme() { var t = html.getAttribute('data-theme'); themeBtns.forEach(function (b) { b.setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' mode'); }); }
  labelTheme();
  themeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      var apply = function () { html.setAttribute('data-theme', next); try { localStorage.setItem('ek-theme', next); } catch (e) {} labelTheme(); };
      if (document.startViewTransition && html.classList.contains('motion')) {
        var r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        document.startViewTransition(apply).ready.then(function () {
          html.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] }, { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' });
        });
      } else apply();
    });
  });

  /* ---------- line art: draw when it scrolls into view ---------- */
  function redraw(el) { el.classList.remove('is-drawn'); void el.getBoundingClientRect(); requestAnimationFrame(function () { el.classList.add('is-drawn'); }); }
  if ('IntersectionObserver' in window) {
    var dio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-drawn'); dio.unobserve(en.target); } });
    }, { threshold: .25 });
    $$('[data-draw]').forEach(function (el) { dio.observe(el); });
  } else $$('[data-draw]').forEach(function (el) { el.classList.add('is-drawn'); });

  /* ---------- selected work: one file per project ---------- */
  var ed = $('[data-editor]');
  if (ed) {
    var tabs = $$('.editor-tab', ed), panes = $$('.editor-pane', ed), n = tabs.length, edCur = 0;
    var tabsEl = $('.editor-tabs', ed), fileEl = $('[data-editor-file]', ed), countEl = $('[data-editor-count]', ed), barEl = $('[data-editor-bar]', ed);
    var pad = function (k) { return String(k).padStart(2, '0'); };
    var show = function (i) {
      if (i === edCur) return;
      edCur = i;
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panes.forEach(function (p, k) { p.hidden = k !== i; p.classList.toggle('is-active', k === i); p.classList.remove('is-entering'); });
      var p = panes[i]; void p.offsetWidth; p.classList.add('is-entering');
      var d = $('[data-draw]', p); if (d) redraw(d);
      fileEl.textContent = tabs[i].getAttribute('data-file');
      countEl.textContent = pad(i + 1) + ' / ' + pad(n);
      barEl.style.transform = 'scaleX(' + ((i + 1) / n) + ')';
      var t = tabs[i], left = t.offsetLeft - tabsEl.offsetLeft;
      if (left < tabsEl.scrollLeft || left + t.offsetWidth > tabsEl.scrollLeft + tabsEl.clientWidth) tabsEl.scrollTo({ left: left - 20, behavior: 'smooth' });
    };
    barEl.style.transform = 'scaleX(' + (1 / n) + ')';
    var pinned = motion && window.matchMedia('(min-width: 981px)').matches, st = null;
    if (pinned) {
      st = ScrollTrigger.create({ trigger: ed, start: 'top top', end: 'bottom bottom',
        onUpdate: function (self) { show(Math.min(n - 1, Math.floor(self.progress * n))); } });
    }
    var goTo = function (k) {
      if (st) {
        var y = st.start + (st.end - st.start) * (k + 0.5) / n;
        if (lenis) lenis.scrollTo(y, { duration: 1.1 }); else window.scrollTo({ top: y, behavior: 'smooth' });
      } else show(k);
    };
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { goTo(k); }); });
    tabsEl.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var k = (edCur + (e.key === 'ArrowRight' ? 1 : -1) + n) % n; goTo(k); tabs[k].focus();
    });
    var skip = $('[data-editor-skip]', ed);
    if (skip) skip.addEventListener('click', function (e) {
      var target = $('#after-work'); if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.2 }); else target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ---------- filters (work grid + toolkit) ---------- */
  function wireFilter(barSel, itemsSel, match) {
    var bar = $(barSel); if (!bar) return;
    var items = $$(itemsSel);
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]'); if (!btn) return;
      var f = btn.getAttribute('data-filter');
      $$('[data-filter]', bar).forEach(function (b) { var on = b === btn; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
      var shown = [];
      items.forEach(function (el) { var ok = f === 'All' || match(el, f); el.hidden = !ok; if (ok) shown.push(el); });
      if (motion) { gsap.fromTo(shown, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .7, stagger: .04, ease: 'power3.out', overwrite: true }); ScrollTrigger.refresh(); }
    });
  }
  wireFilter('[data-work-filters]', '[data-work-grid] .card', function (el, f) { return el.getAttribute('data-tags').split('|').indexOf(f) > -1; });
  wireFilter('[data-tool-filters]', '[data-tools] .tool', function (el, f) { return el.getAttribute('data-cat') === f; });
  wireFilter('[data-svc-filters]', '[data-svc-grid] .svc-card', function (el, f) { return el.getAttribute('data-group') === f; });
  (function () {
    var bar = $('[data-svc-filters]'); if (!bar || !location.hash) return;
    var b = $('[data-filter="' + location.hash.slice(1) + '"]', bar); if (b) b.click();
  })();

  /* ---------- contact form (FormSubmit AJAX, falls back to normal POST) ---------- */
  var form = $('[data-contact-form]');
  if (form) {
    var status = $('[data-form-status]', form);
    form.addEventListener('submit', function (e) {
      if (!window.fetch) return;
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var data = new FormData(form);
      var interests = data.getAll('interest');
      data.delete('interest');
      data.append('interested_in', interests.join(', ') || 'Not specified');
      btn.disabled = true; status.className = 'form-status'; status.textContent = 'Sending…';
      fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) !== 'false') {
            status.className = 'form-status is-ok'; status.textContent = 'Thanks! Your message is on its way. I’ll reply within one business day.'; form.reset();
          } else throw new Error(res.j && res.j.message);
        })
        .catch(function () {
          status.className = 'form-status is-err';
          status.innerHTML = 'Something went wrong. Please email <a class="ulink" href="mailto:elombekisala@gmail.com">elombekisala@gmail.com</a>.';
        })
        .then(function () { btn.disabled = false; });
    });
  }

  /* ---------- videos: play only in view ---------- */
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: .2 });
    $$('video').forEach(function (v) { vio.observe(v); });
  }

  /* ---------- custom cursor + index preview + magnetic ---------- */
  if (fine) {
    var cur = $('[data-cursor-el]'), label = $('[data-cursor-label]');
    var mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    var preview = null, previewImg = null, px = mx, py = my;
    window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; if (cur) cur.classList.add('is-on'); }, { passive: true });
    document.addEventListener('mouseleave', function () { if (cur) cur.classList.remove('is-on'); });
    (function loop() {
      cx += (mx - cx) * .22; cy += (my - cy) * .22;
      if (cur) cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      if (preview && preview.classList.contains('is-on')) {
        px += (mx - px) * .12; py += (my - py) * .12;
        preview.style.left = px + 24 + 'px'; preview.style.top = py - preview.offsetHeight / 2 + 'px';
      }
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('[data-cursor]');
      if (cur) cur.classList.toggle('is-label', !!t);
      if (label) label.textContent = t ? t.getAttribute('data-cursor') : '';
    });

    $$('[data-index-list]').forEach(function (list) {
      var pv = list.parentNode.querySelector('[data-index-preview]'); if (!pv) return;
      var im = $('img', pv);
      list.addEventListener('mouseover', function (e) {
        var row = e.target.closest('[data-preview]');
        if (!row) return;
        preview = pv; previewImg = im;
        if (im.getAttribute('src') !== row.getAttribute('data-preview')) im.src = row.getAttribute('data-preview');
        if (!pv.classList.contains('is-on')) { px = mx; py = my; }
        pv.classList.add('is-on');
      });
      list.addEventListener('mouseleave', function () { pv.classList.remove('is-on'); });
    });

    if (motion) $$('[data-magnetic]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'power3.out' }), yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'power3.out' });
      el.addEventListener('mousemove', function (e) { var r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .25); yTo((e.clientY - r.top - r.height / 2) * .35); });
      el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- page transitions ---------- */
  var curtain = $('[data-curtain]');
  function hideCurtain() { html.classList.remove('is-arriving'); if (curtain) { curtain.style.visibility = 'hidden'; curtain.style.transform = ''; } }
  if (motion && curtain) {
    var arriving = false;
    try { arriving = !!sessionStorage.getItem('ek-transition'); sessionStorage.removeItem('ek-transition'); } catch (err) {}
    if (arriving) {
      // The curtain already covers the page (html.is-arriving), so lift it away.
      gsap.fromTo(curtain, { yPercent: 0, y: 0, visibility: 'visible' }, { yPercent: -100, duration: .9, ease: 'expo.inOut', delay: .05, onComplete: hideCurtain });
      setTimeout(hideCurtain, 2000); // safety net
    } else hideCurtain();
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var href = a.getAttribute('href');
      if (!href || a.target === '_blank' || a.hasAttribute('download') || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.charAt(0) === '#') return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      try { sessionStorage.setItem('ek-transition', '1'); } catch (err) {}
      gsap.fromTo(curtain, { yPercent: 100, y: 0, visibility: 'visible' }, { yPercent: 0, duration: .6, ease: 'expo.inOut', onComplete: function () { location.href = url.href; } });
    });
    // Back/forward cache: never restore a page with the curtain down.
    window.addEventListener('pageshow', function (e) { if (e.persisted) { gsap.killTweensOf(curtain); hideCurtain(); try { sessionStorage.removeItem('ek-transition'); } catch (err) {} } });
  } else hideCurtain();

  if (!motion) { $$('[data-count]').forEach(function () {}); return; }

  /* ================= motion only below ================= */

  function splitLines(el) {
    if (!window.SplitText) return [el];
    var s = new SplitText(el, { type: 'lines', linesClass: 'split-line', mask: 'lines' });
    return s.lines;
  }

  function heroIn() {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    var heroLines = $$('[data-split-hero]');
    heroLines.forEach(function (el, i) {
      var lines = splitLines(el);
      tl.from(lines, { yPercent: 115, rotate: 2, duration: 1.3, stagger: .08 }, i * .09);
    });
    tl.to($$('[data-hero-in]'), { opacity: 1, y: 0, duration: 1.1, stagger: .07 }, .25);
    return tl;
  }

  /* 3D logo intro (Spline scene, home, first visit per session).
     Timing follows the original site: the scene plays ~4.4s, then fades out over 0.6s. */
  var pre = $('[data-preloader]');
  if (pre && html.classList.contains('first-visit')) {
    try { sessionStorage.setItem('ek-visited', '1'); } catch (e) {}
    if (lenis) lenis.stop();
    var scene = $('.preloader-scene', pre), finished = false, holdTimer;
    var finish = function () {
      if (finished) return; finished = true;
      clearTimeout(holdTimer);
      gsap.to(pre, { opacity: 0, duration: .6, ease: 'power2.out', onComplete: function () {
        pre.remove(); html.classList.remove('first-visit'); if (lenis) lenis.start();
      } });
      gsap.delayedCall(.25, heroIn);
    };
    if (scene) {
      scene.addEventListener('load', function () {
        pre.classList.add('is-scene-ready');
        clearTimeout(holdTimer); holdTimer = setTimeout(finish, 4400);
      });
      scene.src = scene.getAttribute('data-src');
    }
    holdTimer = setTimeout(finish, 7000); // if the scene never loads, don't hold the page
    pre.addEventListener('click', finish); // tap to skip
  } else {
    if (pre) pre.remove();
    heroIn();
  }

  /* section headings: line reveals */
  $$('[data-split]').forEach(function (el) {
    var lines = splitLines(el);
    gsap.from(lines, { yPercent: 115, duration: 1.2, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* generic reveals, batched */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: 1, stagger: .07, ease: 'power3.out', overwrite: true }); }
  });

  /* counters */
  $$('[data-count]').forEach(function (el) {
    var end = parseInt(el.getAttribute('data-count'), 10), o = { v: end > 1000 ? end - 40 : 0 };
    if (end === 2019) o.v = 1990;
    el.textContent = o.v;
    ScrollTrigger.create({ trigger: el, start: 'top 95%', once: true, onEnter: function () {
      gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
    } });
  });

  /* featured stack: earlier cards recede as the next one arrives */
  var cards = $$('[data-stack]');
  if (cards.length && window.matchMedia('(min-width: 981px)').matches) {
    cards.forEach(function (card, i) {
      if (i === cards.length - 1) return;
      gsap.fromTo(card.querySelector('.stack-inner'), { scale: 1, filter: 'brightness(1)' }, {
        scale: .95, filter: 'brightness(.6)', ease: 'none',
        // Only recede once the next card is well on screen, finishing as it docks.
        scrollTrigger: { trigger: cards[i + 1], start: 'top 55%', end: 'top ' + (72 + 18) + 'px', scrub: .4 }
      });
    });
  }

  /* case study cover: clip reveal + parallax */
  var cover = $('[data-cover]');
  if (cover) {
    gsap.fromTo(cover.querySelector('.cs-cover-inner'), { clipPath: 'inset(12% 6% 0% 6% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: { trigger: cover, start: 'top 85%', end: 'top 20%', scrub: true } });
    var media = cover.querySelector('img, video');
    gsap.fromTo(media, { scale: 1.12, yPercent: -4 }, { scale: 1, yPercent: 4, ease: 'none', scrollTrigger: { trigger: cover, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* architecture flow: draw the line, then light up nodes */
  $$('[data-flow]').forEach(function (flow) {
    var nodes = $$('.flow-node', flow);
    if (window.matchMedia('(min-width: 681px)').matches) {
      var line = document.createElement('span'); line.className = 'flow-progress'; flow.appendChild(line);
      gsap.to(line, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: flow, start: 'top 80%', end: 'top 45%', scrub: true } });
    }
    gsap.from(nodes, { opacity: 0, y: 20, duration: .9, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: flow, start: 'top 82%' } });
  });

  /* image parallax inside cards on the work grid */
  $$('.card-media img, .stack-media img').forEach(function (im) {
    gsap.fromTo(im, { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* marquee: speed responds to scroll velocity */
  var track = $('.marquee-track');
  if (track) {
    var anim = track.getAnimations ? track.getAnimations()[0] : null;
    if (anim) ScrollTrigger.create({ onUpdate: function (self) {
      var v = Math.min(Math.abs(self.getVelocity()) / 400, 4);
      anim.playbackRate = 1 + v;
      gsap.to(anim, { playbackRate: 1, duration: 1, overwrite: true });
    } });
  }

  /* big footer word drifts up */
  var word = $('.footer-word');
  if (word) gsap.from(word, { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.site-footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
