(function () {
  'use strict';
  var d = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var LS_L = 'nd-portfolio-lang', LS_T = 'nd-portfolio-theme', SS_OV = 'nd-ov';
  var mm = function (q) { return window.matchMedia ? matchMedia(q) : { matches: false }; };
  var fine = mm('(hover: hover) and (pointer: fine)').matches;
  var reduceMQ = mm('(prefers-reduced-motion: reduce)');
  var reduce = reduceMQ.matches;
  var lang = d.getAttribute('data-lang') === 'en' ? 'en' : 'sr';
  var E = 'cubic-bezier(.76,0,.24,1)';
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------------- Language ---------------- */
  var titleSr = d.getAttribute('data-title-sr') || document.title;
  function applyLang() {
    var en = lang === 'en';
    d.setAttribute('data-lang', lang);
    d.lang = en ? 'en' : 'sr-Latn';
    var t = d.getAttribute('data-title-en');
    if (t) document.title = en ? t : titleSr;
    $$('[data-act="setSr"],[data-act="setEn"]').forEach(function (b) {
      b.setAttribute('aria-pressed', String((b.getAttribute('data-act') === 'setEn') === en));
    });
    $$('[data-ph-en]').forEach(function (i) {
      if (!i.hasAttribute('data-ph-sr')) i.setAttribute('data-ph-sr', i.placeholder);
      i.placeholder = i.getAttribute(en ? 'data-ph-en' : 'data-ph-sr');
    });
    $$('[data-aria-en]').forEach(function (el) {
      el.setAttribute('aria-label', el.getAttribute(en ? 'data-aria-en' : 'data-aria-sr'));
    });
    syncMenuLabel();
  }
  function setLang(l) { lang = l; store.set(LS_L, l); applyLang(); }

  /* ---------------- Theme ---------------- */
  function applyTheme(t) {
    d.setAttribute('data-theme', t);
    var m = $('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'light' ? '#F1F1EB' : '#0C0D0B');
    $$('[data-act="toggleTheme"]').forEach(function (b) { b.setAttribute('aria-pressed', String(t === 'light')); });
  }
  function toggleTheme() {
    var t = d.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(t);
    store.set(LS_T, t);
  }

  /* ---------------- Mobile menu ---------------- */
  var navBtn = $('[data-act="menu"]');
  function syncMenuLabel() {
    if (!navBtn) return;
    var open = d.classList.contains('nav-open'), en = lang === 'en';
    navBtn.setAttribute('aria-expanded', String(open));
    navBtn.setAttribute('aria-label', open ? (en ? 'Close menu' : 'Zatvori meni') : (en ? 'Open menu' : 'Otvori meni'));
  }
  function setNav(open) {
    d.classList.toggle('nav-open', open);
    syncMenuLabel();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && d.classList.contains('nav-open')) { setNav(false); if (navBtn) navBtn.focus(); }
  });
  addEventListener('resize', function () { if (innerWidth >= 860 && d.classList.contains('nav-open')) setNav(false); });

  applyTheme(d.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  applyLang();

  // keep tabs in sync if the visitor changes language/theme in another tab
  addEventListener('storage', function (e) {
    if (e.key === LS_L && (e.newValue === 'en' || e.newValue === 'sr')) { lang = e.newValue; applyLang(); }
    if (e.key === LS_T && (e.newValue === 'light' || e.newValue === 'dark')) applyTheme(e.newValue);
  });

  /* ---------------- Page transitions ---------------- */
  var ov = $('[data-ref="ov"]'), ovl = $('[data-ref="ovlabel"]');
  var canAnimate = !!(ov && ov.animate);
  function go(href, label) {
    if (reduce || !canAnimate) { location.href = href; return; }
    if (ovl) ovl.textContent = label;
    try { sessionStorage.setItem(SS_OV, label); } catch (e) {}
    var a = ov.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0%)' }], { duration: 560, easing: E, fill: 'forwards' });
    a.onfinish = function () { location.href = href; };
  }
  var incoming = null;
  try { incoming = sessionStorage.getItem(SS_OV); sessionStorage.removeItem(SS_OV); } catch (e) {}
  function clearIncoming() { d.classList.remove('ov-in'); }
  if (incoming && canAnimate && !reduce) {
    if (ovl) ovl.textContent = incoming;
    ov.style.transform = 'translateY(0%)';
    clearIncoming();
    setTimeout(function () {
      var a = ov.animate([{ transform: 'translateY(0%)' }, { transform: 'translateY(-100%)' }], { duration: 640, easing: E, fill: 'forwards' });
      a.onfinish = function () { a.cancel(); ov.style.transform = 'translateY(100%)'; };
    }, 140);
  } else clearIncoming();
  addEventListener('pageshow', function (e) {
    // restored from the back/forward cache: never leave the page covered
    if (e.persisted && ov) {
      if (ov.getAnimations) ov.getAnimations().forEach(function (a) { a.cancel(); });
      ov.style.transform = 'translateY(100%)';
      clearIncoming();
    }
  });

  /* ---------------- Form chips ---------------- */
  function pick(b) {
    var group = b.getAttribute('data-chip');
    var optional = b.parentNode && b.parentNode.hasAttribute('data-optional');
    var wasOn = b.getAttribute('aria-pressed') === 'true';
    $$('[data-chip="' + group + '"]').forEach(function (x) {
      var on = x === b ? (optional ? !wasOn : true) : false;
      x.setAttribute('aria-pressed', String(on));
    });
  }

  /* ---------------- Clicks ---------------- */
  function scrollToEl(el) {
    var top = el.getBoundingClientRect().top + scrollY - 64;
    scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]');
    if (a) {
      var act = a.getAttribute('data-act');
      if (act === 'setSr') setLang('sr');
      else if (act === 'setEn') setLang('en');
      else if (act === 'toggleTheme') toggleTheme();
      else if (act === 'menu') setNav(!d.classList.contains('nav-open'));
      else if (act === 'top') {
        e.preventDefault();
        scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        var first = $('#top') || $('main');
        if (first) { if (!first.hasAttribute('tabindex')) first.setAttribute('tabindex', '-1'); try { first.focus({ preventScroll: true }); } catch (x) {} }
      }
      else if (act === 'backToForm') backToForm();
      else if (act === 'copyEmail') copyEmail(a);
      return;
    }
    var c = e.target.closest('[data-chip]');
    if (c) { pick(c); return; }
    var l = e.target.closest('a[href]');
    if (!l) return;
    var href = l.getAttribute('href');
    if (href.charAt(0) === '#') {
      setNav(false);
      var el = href.length > 1 && document.getElementById(href.slice(1));
      if (el) { e.preventDefault(); scrollToEl(el); history.replaceState(null, '', href); }
      return;
    }
    var sameSite = l.host === location.host;
    if (sameSite && /\.html(#.*)?$/.test(href) && !l.target && !l.hasAttribute('download') && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      setNav(false);
      go(href, l.getAttribute('data-label') || (lang === 'en' ? 'Home' : 'Početna'));
    }
  });

  // landing on index.html#section from a case study: move focus to the section too
  if (location.hash.length > 1) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) addEventListener('load', function () {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      try { target.focus({ preventScroll: true }); } catch (e) {}
    });
  }

  /* ---------------- Contact form → opens the visitor's email app (mailto) ---------------- */
  var form = $('[data-ref="form"]');
  var EMAIL = 'nikoladjordjevic2000@gmail.com';
  function backToForm() {
    $('[data-ref="formbox"]').hidden = false;
    $('[data-ref="sentbox"]').hidden = true;
    var f = form && form.querySelector('[name="name"]');
    if (f) f.focus();
  }
  function copyEmail(btn) {
    var done = function (ok) {
      var s = btn.querySelector('[data-ref="copyState"]');
      if (s) s.textContent = ok ? (lang === 'en' ? ' — copied' : ' — kopirano') : '';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(EMAIL).then(function () { done(true); }, function () { done(false); });
    else done(false);
  }
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = function (n) { return form.querySelector('[name="' + n + '"]'); };
    var name = f('name').value.trim(), email = f('email').value.trim(), msg = f('msg').value.trim(), en = lang === 'en';
    var err = $('[data-ref="err"]');
    var bad = [];
    if (!name) bad.push(f('name'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push(f('email'));
    if (!msg) bad.push(f('msg'));
    ['name', 'email', 'msg'].forEach(function (n) { f(n).setAttribute('aria-invalid', String(bad.indexOf(f(n)) > -1)); });
    if (bad.length) {
      err.textContent = en ? '↳ Please fill in your name, a valid email and a message.' : '↳ Popunite ime, ispravan email i poruku.';
      bad[0].focus();
      return;
    }
    err.textContent = '';
    var chipTxt = function (k) {
      var b = $('[data-chip="' + k + '"][aria-pressed="true"]');
      if (!b) return '';
      var s = b.querySelector('[data-l="' + lang + '"]');
      return (s || b).textContent.trim();
    };
    var type = chipTxt('types'), budget = chipTxt('budgets');
    var sub = (en ? 'Enquiry from portfolio — ' : 'Upit sa portfolija — ') + name;
    var body = (en ? 'Name' : 'Ime') + ': ' + name + '\nEmail: ' + email +
      (type ? '\n' + (en ? 'Topic' : 'Tema') + ': ' + type : '') +
      (budget ? '\n' + (en ? 'Budget' : 'Budžet') + ': ' + budget : '') + '\n\n' + msg;
    // Launch the mailto: link first; only then tell the visitor what happens next.
    location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(sub) + '&body=' + encodeURIComponent(body);
    $$('[data-fill="name"]').forEach(function (s) { s.textContent = name; });
    $('[data-ref="formbox"]').hidden = true;
    var sb = $('[data-ref="sentbox"]');
    sb.hidden = false;
    var h = sb.querySelector('[tabindex="-1"]');
    if (h) h.focus();
  });

  /* ---------------- Live desktop previews: scale iframe to its frame ---------------- */
  $$('[data-fit]').forEach(function (w) {
    var fr = w.querySelector('iframe'), base = +w.getAttribute('data-fit');
    var fit = function () { if (fr) fr.style.transform = 'scale(' + (w.clientWidth / base) + ')'; };
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(w); else addEventListener('resize', fit);
  });

  /* ---------------- Clock, marquee, status dot (paused when the tab is hidden) ---------------- */
  var loops = [];
  var clk = $('[data-ref="clock"]'), clkTimer = null;
  function tick() { clk.textContent = new Date().toLocaleTimeString('sr-RS', { timeZone: 'Europe/Belgrade', hour12: false }); }
  function startClock() { if (clk && !clkTimer) { tick(); clkTimer = setInterval(tick, 1000); } }
  function stopClock() { clearInterval(clkTimer); clkTimer = null; }
  startClock();
  var yr = $('[data-ref="year"]'); if (yr) yr.textContent = new Date().getFullYear();

  var mq = $('[data-ref="marq"]'), mqAnim = null, mqVisible = true, mqHover = false;
  function syncMarquee() {
    if (!mqAnim) return;
    if (document.visibilityState === 'visible' && mqVisible && !mqHover) mqAnim.play(); else mqAnim.pause();
  }
  if (mq && mq.animate && !reduce) {
    mqAnim = mq.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 40000, iterations: Infinity });
    mq.addEventListener('mouseenter', function () { mqHover = true; syncMarquee(); });
    mq.addEventListener('mouseleave', function () { mqHover = false; syncMarquee(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { mqVisible = es[0].isIntersecting; syncMarquee(); }).observe(mq);
  }
  var bl = $('[data-ref="blink"]');
  if (bl && bl.animate && !reduce) loops.push(bl.animate([{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }], { duration: 2400, iterations: Infinity }));

  document.addEventListener('visibilitychange', function () {
    var vis = document.visibilityState === 'visible';
    if (vis) startClock(); else stopClock();
    loops.forEach(function (a) { if (vis) a.play(); else a.pause(); });
    syncMarquee();
  });

  // honour a change of the OS "reduce motion" setting without a reload
  function onReduce(e) {
    reduce = e.matches;
    if (reduce) { if (mqAnim) { mqAnim.cancel(); mqAnim = null; } loops.forEach(function (a) { a.cancel(); }); loops = []; }
  }
  if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', onReduce); else if (reduceMQ.addListener) reduceMQ.addListener(onReduce);

  /* ---------------- Scroll reveal (below the fold only; skipped for reduced motion) ---------------- */
  if (!reduce && 'IntersectionObserver' in window && document.body.animate) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        var an = el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: +el.getAttribute('data-reveal') || 0, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
        an.onfinish = function () { el.style.opacity = ''; an.cancel(); };
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    var armed = false;
    var arm = function () {
      if (armed || !innerHeight || document.visibilityState !== 'visible') return;
      armed = true;
      $$('[data-reveal]').forEach(function (el) {
        if (el.closest('[data-noreveal]') || el.getBoundingClientRect().top < innerHeight) return;
        el.style.opacity = '0'; io.observe(el);
      });
      // safety net: never leave anything invisible
      setTimeout(function () {
        $$('[data-reveal]').forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (el.style.opacity === '0' && r.top < innerHeight && r.bottom > 0) { el.style.opacity = ''; io.unobserve(el); }
        });
      }, 2000);
    };
    // keyboard users tabbing into a hidden element: reveal it immediately
    document.addEventListener('focusin', function (e) {
      var el = e.target.closest && e.target.closest('[data-reveal]');
      if (el && el.style.opacity === '0') { el.style.opacity = ''; io.unobserve(el); }
    });
    if (document.readyState === 'complete') requestAnimationFrame(arm); else addEventListener('load', function () { requestAnimationFrame(arm); });
    document.addEventListener('visibilitychange', arm);
  }

  /* ---------------- Custom cursor + project hover preview (mouse only) ---------------- */
  var ring = $('[data-ref="ring"]'), rl = $('[data-ref="ringLabel"]'), dot = $('[data-ref="dot"]'), prevs = $$('[data-ref="prev"]');
  if (!fine || reduce || !ring || !dot) {
    [ring, dot].forEach(function (x) { if (x) x.remove(); });
    prevs.forEach(function (p) { p.remove(); });
    return;
  }
  d.classList.add('cc');
  var mx = -200, my = -200, rx = -200, ry = -200, px = -999, py = -999, sc = 0.4, mode = '', hov = -1, running = false;
  function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
  addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    ring.style.opacity = dot.style.opacity = '';
    var t = e.target && e.target.closest ? e.target : null;
    var m = t ? (t.closest('[data-cursor]') ? 'view' : (t.closest('a,button,input,textarea,label,[data-hover]') ? 'link' : '')) : '';
    if (m !== mode) {
      mode = m;
      ring.style.background = m === 'view' ? 'var(--acc)' : 'transparent';
      ring.style.borderColor = m === 'view' ? 'transparent' : 'var(--ink)';
      rl.style.opacity = m === 'view' ? 1 : 0;
    }
    var row = t && t.closest('[data-row]');
    var i = row ? +row.getAttribute('data-idx') : -1;
    if (i !== hov) { hov = i; prevs.forEach(function (p) { p.style.opacity = +p.getAttribute('data-idx') === i ? 1 : 0; }); }
    kick();
  }, { passive: true });
  // hide the custom cursor when the mouse leaves the window
  document.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget) { ring.style.opacity = dot.style.opacity = '0'; hov = -1; prevs.forEach(function (p) { p.style.opacity = 0; }); }
  });
  function loop() {
    rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
    var tg = mode === 'view' ? 1 : mode === 'link' ? 0.62 : 0.4;
    sc += (tg - sc) * 0.18;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) scale(' + sc + ')';
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    var tx = (innerWidth - 440) / 2 + (mx - innerWidth / 2) * 0.06, ty = (innerHeight - 290) / 2 + 32 + (my - innerHeight / 2) * 0.06;
    px += (tx - px) * 0.12; py += (ty - py) * 0.12;
    var rot = Math.max(-6, Math.min(6, (tx - px) * 0.03));
    for (var k = 0; k < prevs.length; k++) prevs[k].style.transform = 'translate(' + px + 'px,' + py + 'px) rotate(' + rot + 'deg)';
    // stop the frame loop once everything has settled; the next mousemove restarts it
    if (Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1 && Math.abs(tg - sc) < 0.002 && Math.abs(tx - px) < 0.1 && Math.abs(ty - py) < 0.1) { running = false; return; }
    requestAnimationFrame(loop);
  }
})();
