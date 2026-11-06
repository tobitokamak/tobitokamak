/* tobokamak portfolio — vanilla JS, no build step.
   Hash router: #/ · #/works · #/about · #/contact · #/work/<slug> */
(function () {
  'use strict';

  var W = window.WORKS, S = window.SITE, CATS = window.CATS;
  var app = document.getElementById('app');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* (reduce is also forced on by ?still, see below) */
  if (/[?&]still/.test(location.search)) { document.documentElement.classList.add('still'); reduce = true; document.documentElement.style.scrollBehavior = 'auto'; }

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var img = function (w, n) { return 'assets/works/' + w.slug + '/' + n + '.jpg'; };
  var thumb = function (w) { return 'assets/works/' + w.slug + '/thumb.jpg'; };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var byslug = function (s) { return W.filter(function (w) { return w.slug === s; })[0]; };

  /* the animated background lives in js/sky3d.js */


  /* ---------------- clock ---------------- */
  var clock = document.getElementById('clock');
  function tick() {
    try { clock.textContent = 'BCN ' + new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: S.tz }).format(new Date()); } catch (e) { clock.textContent = ''; }
  }
  tick(); setInterval(tick, 20000);

  /* ---------------- reveal on scroll ---------------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .05 }) : null;
  function armReveal(root) {
    (root || app).querySelectorAll('.rv').forEach(function (el, i) {
      if (!io) { el.classList.add('in'); return; }
      io.observe(el);
    });
  }

  /* ---------------- building blocks ---------------- */
  var arrowR = '<svg class="arrow" viewBox="0 0 28 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M0 7h26M20 1l6 6-6 6"/></svg>';

  function badgeSvg() {
    var t = "hi there! i'm tobias • vr developer • 3d artist • ";
    return '<svg viewBox="0 0 132 132" aria-hidden="true"><defs><path id="ring" d="M66 66 m-54 0 a54 54 0 1 1 108 0 a54 54 0 1 1 -108 0"/></defs><text><textPath href="#ring" textLength="334">' + esc(t) + '</textPath></text></svg>';
  }

  var CODES = { env: 'ENV', play: 'INT', vr: 'VR', img: 'ILL', ai: 'AI' };
  function rowHTML(w, i, b, solo) {
    /* caption stack + code pill, the way the LEV poster tags each act */
    var tags = '<span class="row__cap mono"><i>' + esc(w.engine || w.tools[0]) + '</i><i>' + esc(w.role) + '</i></span><span class="pill">' + CODES[w.cat] + '</span>';
    return '<li class="row rv' + (b ? ' row--b' : '') + (solo ? ' row--solo' : '') + '" data-cat="' + w.cat + '" data-year="' + w.year + '" data-slug="' + w.slug + '" style="--rc:' + w.accent + ';--d:' + Math.min((i % 4) * 70, 280) + 'ms">' +
      '<a href="#/work/' + w.slug + '" data-slug="' + w.slug + '">' +
      '<figure class="row__media"><img loading="lazy" decoding="async" alt="" src="' + thumb(w) + '">' +
        '<span class="row__n mono pill">' + pad2(i + 1) + '</span><span class="row__y mono pill">' + esc(w.year) + '</span></figure>' +
      '<div class="row__meta"><span class="row__t">' + esc(w.title) + '</span><span class="row__tags">' + tags + '</span></div>' +
      '</a></li>';
  }

  /* lineup = newest first, grouped by year; each year opens with an orange label block + arrow rule */
  function lineupHTML() {
    var out = '', last = null, i = 0, gi = 0, j = 0, counts = {};
    W.forEach(function (w) { counts[w.year] = (counts[w.year] || 0) + 1; });
    W.forEach(function (w) {
      if (w.year !== last) {
        out += '<li class="grp rv' + (gi % 2 ? ' grp--rev' : '') + '" data-year="' + w.year + '"><span class="grp__tag">' + w.year + '</span><span class="grp__line"></span><span class="grp__n mono">' + pad2(counts[w.year]) + (counts[w.year] === 1 ? ' work' : ' works') + '</span></li>';
        last = w.year; gi++; j = 0;
      }
      out += rowHTML(w, i++, ++j % 2 === 0, counts[w.year] === 1);
    });
    return out;
  }

  /* ---------------- pages ---------------- */
  function homeHTML() {
    var counts = {}; W.forEach(function (w) { counts[w.cat] = (counts[w.cat] || 0) + 1; });
    var chips = '<button class="chip" aria-pressed="true" data-f="all">All<small>' + W.length + '</small></button>' +
      Object.keys(CATS).map(function (k) { return '<button class="chip" aria-pressed="false" data-f="' + k + '">' + esc(CATS[k]) + '<small>' + (counts[k] || 0) + '</small></button>'; }).join('');
    var marq = ['Design', 'VR/AR Development', '3D Art', 'Archviz', 'Gaming', 'Metaverse'].map(function (t) { return '<span>' + t + '</span><i>▸</i>'; }).join('');
    marq = marq + marq + marq + marq;                /* each half of the band must be wider than any screen, or a gap shows before it loops */
    var tools = window.TOOLS.map(function (t, i) { return '<div class="tool rv" style="--d:' + i * 45 + 'ms"><b>' + pad2(i + 1) + '</b><img src="assets/logos/' + t.file + '" alt="' + esc(t.name) + '" loading="lazy"></div>'; }).join('');
    var links = S.links.map(function (l) { return '<a href="' + esc(l.href) + '" target="_blank" rel="noopener"><span>' + esc(l.label) + '</span><span aria-hidden="true">↗</span></a>'; }).join('');

    return '' +
    '<section class="hero" id="top">' +
      '<div class="hero__meta"><span class="hero__date">' + W[W.length - 1].year + ' → ' + new Date().getFullYear() + '</span><span class="mono dim">Portfolio<br>VR · 3D · Interactive</span></div>' +
      '<div class="hero__top"><div class="hero__left"><h1 class="hero__h1" aria-label="Crafting immersive experiences with love">' +
        '<span class="ln"><span style="--i:0">Crafting</span></span><span class="ln"><span style="--i:1">immersive</span></span>' +
        '<span class="ln"><span style="--i:2">experiences</span></span><span class="ln"><span style="--i:3">with <em>♥</em></span></span></h1>' +
        '<div class="hero__who rv"><div class="badge">' + badgeSvg() + '<img src="assets/img/avatar.jpg" alt="Portrait of tobi"></div>' +
          '<p class="hero__intro">I’m a <b>VR developer</b> and <b>3D artist</b> with 16+ years of experience, based in sunny Barcelona, Spain.</p></div></div>' +
        '<div class="hero__frame rv" style="--d:300ms" id="frame">' + ['arkand', 'pools', 'factory-reset', 'discovery-at-moonlight', 'koh-samui', 'planet-kosmos', 'particle-palace'].map(function (s) { var w = byslug(s); return '<img data-slug="' + s + '" data-t="' + esc(w.title) + '" data-m="' + CODES[w.cat] + ' · ' + w.year + '" src="' + img(w, w.cover) + '" alt="">'; }).join('') +
          '<span class="lock" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
          '<div class="hero__ticks" id="ticks">' + [0, 1, 2, 3, 4, 5, 6].map(function (i) { return '<button aria-label="Show work ' + (i + 1) + '"' + (i ? '' : ' class="on"') + '><i></i></button>'; }).join('') + '</div>' +
          '<div class="hero__cap mono"><b id="frameT">' + esc(byslug('arkand').title) + '</b><span id="frameM">' + CODES[byslug('arkand').cat] + ' · ' + byslug('arkand').year + '</span></div></div></div>' +
      '<div class="hero__mark" id="mark"><span>tobokamak</span></div>' +
      '<div class="hero__foot mono"><span class="scroll"><i></i>Scroll</span><span class="dim">Selected works ' + W[W.length - 1].year + '–' + new Date().getFullYear() + '</span><span class="dim">' + esc(S.city) + '</span></div>' +
    '</section>' +
    '<div class="marq" aria-hidden="true"><div class="marq__track"><div class="marq__item">' + marq + '</div><div class="marq__item">' + marq + '</div></div></div>' +
    '<section class="sec works" id="works"><div class="sec__head rv"><h2 class="sec__title">Selected works<sup>(' + pad2(W.length) + ')</sup></h2><div class="filters" role="group" aria-label="Filter works">' + chips + '</div></div>' +
      '<ul class="lineup" id="lineup">' + lineupHTML() + '</ul></section>' +
    '<section class="tools" id="tools"><div class="tools__head"><span class="mono">(04) Toolkit</span><h2 class="tools__title">some of my everyday tools</h2><span class="mono">' + pad2(window.TOOLS.length) + ' items</span></div><div class="tools__grid">' + tools + '</div></section>' +
    contactHTML(links);
  }

  function contactHTML(links) {
    links = links || S.links.map(function (l) { return '<a href="' + esc(l.href) + '" target="_blank" rel="noopener"><span>' + esc(l.label) + '</span><span aria-hidden="true">↗</span></a>'; }).join('');
    return '<section class="contact" id="contact"><h2 class="contact__h rv">Let’s build<br>worlds<br><em>together.</em></h2>' +
      '<div class="contact__row"><div class="contact__p rv"><p style="margin:0">I’m always looking for imaginative new projects! Let’s co-create :)</p>' +
      '<a class="contact__mail" href="mailto:' + esc(S.email) + '">' + esc(S.email) + '</a></div><div class="contact__links rv" style="--d:100ms">' + links + '</div></div>' +
      '<div class="foot mono"><span>© ' + new Date().getFullYear() + ' tobokamak</span><span>' + esc(S.city) + '</span><a href="#top" data-top>Back to top ↑</a></div></section>';
  }

  function aboutHTML() {
    var A = window.ABOUT;
    return '<section class="about page-enter"><div class="about__grid">' +
      '<h1 class="about__big">16+ years of <em>film &amp; visual arts</em>, now building worlds you can dive inside.</h1>' +
      '<div class="about__txt">' + A.bio.map(function (p) { return '<p style="margin:0">' + esc(p) + '</p>'; }).join('') + '</div>' +
      '<div class="about__img"><img src="assets/img/avatar.jpg" alt="Portrait of tobi"></div></div>' +
      '<div class="edu"><div class="mono dim" style="padding:14px 0">(02) Formal education</div><ul>' +
      A.edu.map(function (e) { return '<li><span class="mono dim">' + e[0] + '</span><span>' + esc(e[1]) + '</span><span class="dim">' + esc(e[2]) + '</span></li>'; }).join('') + '</ul></div></section>' +
      contactHTML();
  }

  function blocksFor(w) {
    if (w.blocks) return w.blocks;
    var b = [{ type: 'text', label: 'Notes', body: ['Placeholder: write the story of this project here. The idea, how it was made, what you would do differently.'] }];
    var rest = w.images.slice(); var i = 0;
    while (rest.length) {
      if (i % 3 === 1 && rest.length > 1) b.push({ type: 'pair', ns: [rest.shift(), rest.shift()] });
      else b.push({ type: 'img', n: rest.shift() });
      i++;
    }
    return b;
  }

  function projectHTML(w, idx) {
    var next = W[(idx + 1) % W.length], fig = 0;
    var f = function () { return '<b>FIG.' + pad2(++fig) + '</b>'; };
    var cap = function (c) { return '<figcaption class="mono">' + f() + (c ? '<span>' + esc(c) + '</span>' : '') + '</figcaption>'; };
    var blocks = blocksFor(w).map(function (b) {
      switch (b.type) {
        case 'text': return '<div class="blk blk--text rv"><span class="mono">' + esc(b.label || '') + '</span><div class="body">' + b.body.map(function (p) { return '<p style="margin:0">' + esc(p) + '</p>'; }).join('') + '</div></div>';
        /* credits: like a text block, but parts can be links: ['Thank you X for the ', { text: 'thing', href: 'https://…' }, '.'] */
        case 'credit': return '<div class="blk blk--text blk--credit rv"><span class="mono">' + esc(b.label || 'Credits') + '</span><div class="body"><p style="margin:0">' +
          b.parts.map(function (p) { return typeof p === 'string' ? esc(p) : (/^https:\/\//.test(p.href) ? '<a href="' + esc(p.href) + '" target="_blank" rel="noopener">' + esc(p.text) + '</a>' : esc(p.text)); }).join('') + '</p></div></div>';
        case 'steps': return '<div class="blk blk--text rv"><span class="mono">' + esc(b.label || 'Process') + '</span><ol class="steps">' + b.steps.map(function (s) { return '<li><h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p></li>'; }).join('') + '</ol></div>';
        case 'img': return '<figure class="blk fig rv"><img loading="lazy" src="' + img(w, b.n) + '" alt="' + esc(w.title) + '">' + cap(b.caption) + '</figure>';
        /* b.ratios (width/height of each image) makes a pair of different shapes sit side by side at the SAME height */
        case 'pair': return '<figure class="blk fig fig--pair' + (b.ratios ? ' fig--flex' : '') + (b.wideOnly ? ' fig--wideonly' : '') + ' rv">' + b.ns.map(function (n, i) { return '<img loading="lazy" src="' + img(w, n) + '" alt="' + esc(w.title) + '"' + (b.ratios ? ' style="--r:' + b.ratios[i] + '"' : '') + '>'; }).join('') + cap(b.caption) + '</figure>';
        /* group: several images stacked full width under one figure number and caption */
        case 'group': return '<figure class="blk fig fig--group rv">' + b.ns.map(function (n) { return '<img loading="lazy" src="' + img(w, n) + '" alt="' + esc(w.title) + '">'; }).join('') + cap(b.caption) + '</figure>';
        case 'vimeo': return '<figure class="blk fig rv"><div class="vid"><iframe loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="' + esc(w.title) + ' video" src="https://player.vimeo.com/video/' + b.id + '?' + (b.h ? 'h=' + b.h + '&' : '') + 'dnt=1&title=0&byline=0&portrait=0"></iframe></div>' + cap(b.caption) + '</figure>';
      }
      return '';
    }).join('');
    var spec = [['Year', w.year.replace('~', '')], ['Role', w.role], ['Medium', w.engine || CATS[w.cat]], ['Tools', w.tools]];
    return '<article class="pj page-enter" style="--accent:' + w.accent + '">' +
      '<header class="pj__hero"><img src="' + img(w, w.cover) + '" alt="' + esc(w.title) + '"><div class="pj__heroin">' +
        '<div class="pj__kicker mono"><span class="dot"></span><span>Work ' + pad2(idx + 1) + ' / ' + pad2(W.length) + '</span><span class="pill pill--line">' + esc(CATS[w.cat]) + '</span></div>' +
        '<h1 class="pj__title">' + esc(w.title) + (/[.!?]$/.test(w.title) ? '' : '<i>.</i>') + '</h1></div></header>' +   /* no extra dot after "!" or "?" */
      '<dl class="spec">' + spec.map(function (s) {
        var v = Array.isArray(s[1]) ? s[1].map(function (t) { return '<span class="pill pill--line">' + esc(t) + '</span>'; }).join('') : esc(s[1] || '—');
        return '<div><dt class="mono">' + s[0] + '</dt><dd>' + v + '</dd></div>';
      }).join('') + '</dl>' +
      '<div class="pj__lede"><span class="mono dim">(01) Overview</span><p class="rv">' + esc(w.blurb) + '</p></div>' +
      blocks +
      '<a class="next" href="#/work/' + next.slug + '" style="--nc:' + next.accent + '"><span class="mono">Next work ' + pad2((idx + 1) % W.length + 1) + '</span><div class="next__t"><span>' + esc(next.title) + '</span>' + arrowR.replace('class="arrow"', 'class="arrow" style="width:.9em;height:.5em;flex:none"') + '</div></a>' +
    '</article>';
  }

  /* ---------------- interactions ---------------- */
  var slideTimer, slideK = 0;
  function startSlides() {
    var frame = document.getElementById('frame');
    clearInterval(slideTimer);
    if (!frame) return;
    var imgs = frame.querySelectorAll('img'), ticks = frame.querySelectorAll('.hero__ticks button');
    var t = document.getElementById('frameT'), m = document.getElementById('frameM');
    function go(k) {
      var cur = imgs[slideK], nx = imgs[k];
      imgs.forEach(function (im) { if (im !== cur) im.classList.remove('prev'); });
      var reached = getComputedStyle(cur).transform;                                              /* read the zoom BEFORE turning transitions off */
      cur.style.transition = 'none'; cur.style.transform = reached;                               /* freeze the outgoing image where it got to */
      cur.classList.remove('on'); cur.classList.add('prev'); ticks[slideK].classList.remove('on');
      nx.classList.remove('prev'); nx.style.transition = 'none'; nx.style.transform = ''; void nx.offsetWidth;   /* reset the incoming one to scale 1, closed */
      nx.style.transition = ''; nx.classList.add('on'); slideK = k;
      void ticks[k].offsetWidth; ticks[k].classList.add('on');   /* restart the fill animation */
      t.textContent = imgs[k].dataset.t; m.textContent = imgs[k].dataset.m;
      if (window.SLIDEGL) window.SLIDEGL.show(k);    /* experiment: curved WebGL slideshow (js/slide-gl.js) */
    }
    if (window.SLIDEGL) window.SLIDEGL.attach(frame, Array.prototype.slice.call(imgs));
    function loop() { clearInterval(slideTimer); slideTimer = setInterval(function () { go((slideK + 1) % imgs.length); }, 4800); }
    if (!frame.querySelector('img.on')) requestAnimationFrame(function () { requestAnimationFrame(function () { imgs[slideK].classList.add('on'); }); });   /* first image starts its zoom after first paint */
    ticks.forEach(function (b, i) { b.onclick = function (e) { e.stopPropagation(); if (i !== slideK) go(i); loop(); }; });
    loop();
  }
  /* scale the "tobokamak" wordmark so it spans the full width of the hero */
  function fitMark() {
    var mark = document.getElementById('mark'); if (!mark) return;
    var s = mark.firstChild; s.style.fontSize = '100px';
    s.style.fontSize = (100 * mark.clientWidth / s.scrollWidth).toFixed(2) + 'px';
  }
  addEventListener('resize', fitMark);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitMark);

  function wireHome() {
    fitMark();
    var frame = document.getElementById('frame');
    if (frame) {
      slideK = 0;
      frame.addEventListener('click', function () { location.hash = '#/work/' + frame.querySelectorAll('img')[slideK].dataset.slug; });
      frame.style.cursor = 'pointer';
    }
    var chips = app.querySelectorAll('.chip'), rows = app.querySelectorAll('.row'), grps = app.querySelectorAll('.grp');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        var f = c.dataset.f, shown = 0;
        var years = {};
        rows.forEach(function (r) {
          var hide = f !== 'all' && r.dataset.cat !== f;
          r.classList.toggle('is-hidden', hide);
          if (!hide) {
            r.querySelector('.row__n').textContent = pad2(++shown); r.classList.add('in');
            years[r.dataset.year] = (years[r.dataset.year] || 0) + 1;
            r.classList.toggle('row--b', years[r.dataset.year] % 2 === 0);      /* keep the staggered offset in step after filtering */
          }
        });
        rows.forEach(function (r) {                                              /* a year with a single work gets a wide feature card */
          if (r.classList.contains('is-hidden')) return;
          var one = years[r.dataset.year] === 1; r.classList.toggle('row--solo', one); if (one) r.classList.remove('row--b');
        });
        grps.forEach(function (g) {
          var n = years[g.dataset.year] || 0;
          g.classList.toggle('is-hidden', n === 0);
          g.querySelector('.grp__n').textContent = pad2(n) + (n === 1 ? ' work' : ' works');
          if (n) g.classList.add('in');
        });
      });
    });
  }

  /* ---------------- router ---------------- */
  function setActive(name) {
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#/' + name); });
  }
  /* ---------------- intro: the dive into the twisting hall, landing through a window onto the slideshow ---------------- */
  var HTML = document.documentElement, introPending = HTML.classList.contains('intro');
  function runIntro() {
    introPending = false;
    scrollTo(0, 0);                                   /* the facade is measured from the hero at the top of the page */
    var frame = document.getElementById('frame');
    if (!window.SKY || !frame) { HTML.classList.remove('intro'); startSlides(); return; }
    var evs = ['wheel', 'touchstart', 'keydown', 'mousedown'], skip = function () { window.SKY.skip(); };
    evs.forEach(function (e) { addEventListener(e, skip, { passive: true }); });     /* any input jumps ahead to the arrival */
    window.SKY.playIntro({
      quick: reduce,                                                                     /* reduce-motion: no dive, just the arrival */
      /* what the facade is made of, in screen pixels, measured from the live layout every frame.
         solid = lines the page really shows, drawn exactly where they are; decor = shapes for parts with no visible outline */
      targets: function () {
        var B = function (el) { el = typeof el === 'string' ? app.querySelector(el) : el; return el ? el.getBoundingClientRect() : null; };
        var out = [], m = B('.hero__meta'), ft = B('.hero__foot'), fr = B(frame), bd = B('.badge img');
        if (m) out.push({ t: 'line', c: 'cream', a: [m.left, m.bottom - 0.5, m.right, m.bottom - 0.5] });      /* rule under the date line */
        if (ft) out.push({ t: 'line', c: 'cream', a: [ft.left, ft.top + 0.5, ft.right, ft.top + 0.5] });       /* rule above the footer row */
        if (fr) {
          out.push({ t: 'rect', c: 'cream', a: [fr.left + 0.5, fr.top + 0.5, fr.right - 0.5, fr.top + 0.5, fr.right - 0.5, fr.bottom - 0.5, fr.left + 0.5, fr.bottom - 0.5, fr.left + 0.5, fr.top + 0.5] });   /* slideshow edge */
          frame.querySelectorAll('.lock i').forEach(function (i, n) {                                          /* its corner brackets */
            var r = i.getBoundingClientRect(), x = n % 2 ? r.right - 0.75 : r.left + 0.75, y = n < 2 ? r.top + 0.75 : r.bottom - 0.75, dx = n % 2 ? -r.width : r.width, dy = n < 2 ? r.height : -r.height;
            out.push({ t: 'line', c: 'ember', a: [x, y + dy, x, y, x + dx, y] });
          });
          frame.querySelectorAll('.hero__ticks i').forEach(function (i) { var r = i.getBoundingClientRect(); out.push({ t: 'line', c: 'faint', a: [r.left, r.top + r.height / 2, r.right, r.top + r.height / 2] }); });   /* progress ticks */
          out.push({ t: 'decor', kind: 'window', r: fr });
        }
        if (bd) out.push({ t: 'circle', c: 'cream', a: [bd.left + bd.width / 2, bd.top + bd.height / 2, bd.width / 2] }, { t: 'decor', kind: 'hex', r: bd });   /* portrait */
        out.push({ t: 'decor', kind: 'arcade', r: B('.hero__h1') }, { t: 'decor', kind: 'colonnade', r: B('#mark') }, { t: 'decor', kind: 'beam', r: B('.nav__links') });
        return out;
      },
      onHandoff: function () { HTML.classList.add('intro-out'); HTML.classList.remove('intro'); startSlides(); countUp(); },
      onDone: function () {
        evs.forEach(function (e) { removeEventListener(e, skip); });
        try { sessionStorage.setItem('tk-intro', '1'); } catch (e) {}
        HTML.classList.remove('intro-out');           /* every assembling transition has finished by now; this also brings the scrollbar back */
      }
    });
  }
  /* the year range counts up as the date line draws in */
  function countUp() {
    var el = app.querySelector('.hero__date'), a = +W[W.length - 1].year, b = new Date().getFullYear(), t0 = performance.now();
    if (!el) return;
    (function step(now) { var p = Math.min(1, (now - t0) / 800); el.textContent = a + ' → ' + Math.round(a + (b - a) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
  }

  function route() {
    var h = location.hash.replace(/^#\/?/, ''), parts = h.split('/'), page = parts[0] || '';
    clearInterval(slideTimer);
    document.body.classList.toggle('is-home', page === '' || page === 'works' || page === 'contact');
    document.body.classList.toggle('is-pj', page === 'work');

    if (page === 'work') {
      var idx = W.map(function (w) { return w.slug; }).indexOf(parts[1]);
      if (idx < 0) { location.hash = '#/'; return; }
      document.title = W[idx].title + ' — tobokamak';
      app.innerHTML = projectHTML(W[idx], idx); setActive(''); scrollTo(0, 0);
    } else if (page === 'about') {
      document.title = 'About — tobokamak'; app.innerHTML = aboutHTML(); setActive('about'); scrollTo(0, 0);
    } else {
      document.title = 'tobokamak — VR developer & 3D artist';
      if (!app.querySelector('#top')) { app.innerHTML = homeHTML(); wireHome(); app.classList.add('page-enter'); setTimeout(function () { app.classList.remove('page-enter'); }, 700); }
      if (introPending) runIntro(); else startSlides();
      setActive(page);
      var target = page === 'works' ? 'works' : page === 'contact' ? 'contact' : null;
      if (target) requestAnimationFrame(function () { document.getElementById(target).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
      else scrollTo(0, 0);
    }
    armReveal(); app.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-top]'); if (t) { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }
  });
  addEventListener('hashchange', route);
  route();
})();
