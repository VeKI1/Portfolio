(function () {
  var d = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var LS_L = 'nd-portfolio-lang', LS_T = 'nd-portfolio-theme';
  var fine = window.matchMedia && matchMedia('(pointer:fine)').matches;
  var lang = d.getAttribute('data-lang') === 'en' ? 'en' : 'sr';
  var E = 'cubic-bezier(.76,0,.24,1)';

  function applyLang() {
    d.setAttribute('data-lang', lang);
    d.lang = lang === 'en' ? 'en' : 'sr-Latn';
    try { localStorage.setItem(LS_L, lang); } catch (e) {}
    $$('[data-act="setSr"],[data-act="setEn"]').forEach(function (b) {
      var on = (b.getAttribute('data-act') === 'setEn') === (lang === 'en');
      b.style.background = on ? 'var(--ink)' : 'transparent';
      b.style.color = on ? 'var(--bg)' : 'var(--mut)';
    });
    $$('[data-ph-en]').forEach(function (i) {
      if (!i.getAttribute('data-ph-sr')) i.setAttribute('data-ph-sr', i.placeholder);
      i.placeholder = lang === 'en' ? i.getAttribute('data-ph-en') : i.getAttribute('data-ph-sr');
    });
  }
  function toggleTheme() {
    var t = d.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    d.setAttribute('data-theme', t);
    try { localStorage.setItem(LS_T, t); } catch (e) {}
  }
  applyLang();

  // page transitions
  var ov = $('[data-ref="ov"]'), ovl = $('[data-ref="ovlabel"]');
  function go(href, label) {
    if (!ov || !ov.animate) { location.href = href; return; }
    if (ovl) ovl.textContent = label;
    try { sessionStorage.setItem('nd-ov', label); } catch (e) {}
    ov.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0%)' }], { duration: 560, easing: E, fill: 'forwards' }).onfinish = function () { location.href = href; };
  }
  var incoming = null;
  try { incoming = sessionStorage.getItem('nd-ov'); sessionStorage.removeItem('nd-ov'); } catch (e) {}
  if (incoming && ov && ov.animate) {
    if (ovl) ovl.textContent = incoming;
    ov.style.transform = 'translateY(0%)';
    setTimeout(function () {
      ov.animate([{ transform: 'translateY(0%)' }, { transform: 'translateY(-100%)' }], { duration: 640, easing: E, fill: 'forwards' });
    }, 140);
  }
  addEventListener('pageshow', function (e) {
    if (e.persisted && ov) { ov.getAnimations().forEach(function (a) { a.cancel(); }); ov.style.transform = 'translateY(100%)'; }
  });

  // chips
  function pick(b) {
    var group = b.getAttribute('data-chip');
    $$('[data-chip="' + group + '"]').forEach(function (x) {
      var on = x === b;
      x.style.background = on ? 'var(--ink)' : 'transparent';
      x.style.color = on ? 'var(--bg)' : 'var(--ink)';
      x.style.borderColor = on ? 'var(--ink)' : 'var(--ln)';
      if (on) x.setAttribute('data-on', '1'); else x.removeAttribute('data-on');
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]');
    if (a) {
      var act = a.getAttribute('data-act');
      if (act === 'setSr') { lang = 'sr'; applyLang(); }
      else if (act === 'setEn') { lang = 'en'; applyLang(); }
      else if (act === 'toggleTheme') toggleTheme();
      else if (act === 'top') { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }
      else if (act === 'resetForm') resetForm();
      return;
    }
    var c = e.target.closest('[data-chip]');
    if (c) { pick(c); return; }
    var l = e.target.closest('a[href]');
    if (!l) return;
    var href = l.getAttribute('href');
    if (href.charAt(0) === '#') {
      var el = document.getElementById(href.slice(1));
      if (el) { e.preventDefault(); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 64, behavior: 'smooth' }); history.replaceState(null, '', href); }
      return;
    }
    if (/\.html(#.*)?$/.test(href) && !l.target && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      go(href, l.getAttribute('data-label') || (lang === 'en' ? 'Home' : 'Početna'));
    }
  });

  // contact form → pre-filled email
  var form = $('[data-ref="form"]');
  function resetForm() {
    if (!form) return;
    form.reset();
    $('[data-ref="formbox"]').hidden = false;
    $('[data-ref="sentbox"]').hidden = true;
  }
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (n) { return form.querySelector('[name="' + n + '"]').value.trim(); };
    var name = v('name'), email = v('email'), msg = v('msg'), en = lang === 'en';
    var err = $('[data-ref="err"]');
    if (!name || !/\S+@\S+\.\S+/.test(email) || !msg) {
      err.textContent = en ? '↳ Please fill in name, a valid email and a message.' : '↳ Popunite ime, ispravan email i poruku.';
      return;
    }
    err.textContent = '';
    var chipTxt = function (k) {
      var b = $('[data-chip="' + k + '"][data-on="1"]');
      if (!b) return '';
      var s = b.querySelector('[data-l="' + lang + '"]');
      return (s || b).textContent.trim();
    };
    var sub = (en ? 'Project enquiry — ' : 'Upit za projekat — ') + name;
    var body = (en ? 'Name' : 'Ime') + ': ' + name + '\nEmail: ' + email + '\n' + (en ? 'Project type' : 'Tip projekta') + ': ' + chipTxt('types') + '\n' + (en ? 'Budget' : 'Budžet') + ': ' + chipTxt('budgets') + '\n\n' + msg;
    window.open('mailto:nikoladjordjevic2000@gmail.com?subject=' + encodeURIComponent(sub) + '&body=' + encodeURIComponent(body), '_blank');
    $$('[data-fill="name"]').forEach(function (s) { s.textContent = name; });
    $$('[data-fill="email"]').forEach(function (s) { s.textContent = email; });
    $('[data-ref="formbox"]').hidden = true;
    $('[data-ref="sentbox"]').hidden = false;
  });

  // scale live desktop previews to their frame
  $$('[data-fit]').forEach(function (w) {
    var f = w.querySelector('iframe'), base = +w.getAttribute('data-fit');
    var fit = function () { if (f) f.style.transform = 'scale(' + (w.clientWidth / base) + ')'; };
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(w); else addEventListener('resize', fit);
  });

  // clock, marquee, status blink
  var clk = $('[data-ref="clock"]');
  if (clk) {
    var tick = function () { clk.textContent = new Date().toLocaleTimeString('sr-RS', { timeZone: 'Europe/Belgrade', hour12: false }); };
    tick(); setInterval(tick, 1000);
  }
  var mq = $('[data-ref="marq"]');
  if (mq && mq.animate) mq.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 32000, iterations: Infinity });
  var bl = $('[data-ref="blink"]');
  if (bl && bl.animate) bl.animate([{ opacity: 1 }, { opacity: 0.25 }, { opacity: 1 }], { duration: 1600, iterations: Infinity });

  // scroll reveal — only below the fold; the top of the page is never hidden
  if ('IntersectionObserver' in window && document.body.animate) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        var an = el.animate([{ opacity: 0, transform: 'translateY(36px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: +el.getAttribute('data-reveal') || 0, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
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
      setTimeout(function () {
        $$('[data-reveal]').forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (el.style.opacity === '0' && r.top < innerHeight && r.bottom > 0) { el.style.opacity = ''; io.unobserve(el); }
        });
      }, 2000);
    };
    if (document.readyState === 'complete') requestAnimationFrame(arm); else addEventListener('load', function () { requestAnimationFrame(arm); });
    document.addEventListener('visibilitychange', arm);
  }

  // custom cursor + project preview
  var ring = $('[data-ref="ring"]'), rl = $('[data-ref="ringLabel"]'), dot = $('[data-ref="dot"]'), prevs = $$('[data-ref="prev"]');
  if (!fine) {
    [ring, dot].forEach(function (x) { if (x) x.remove(); });
    prevs.forEach(function (p) { p.remove(); });
    return;
  }
  var st = document.createElement('style'); st.textContent = '*{cursor:none!important}'; document.head.appendChild(st);
  var mx = -200, my = -200, rx = -200, ry = -200, px = -999, py = -999, sc = 0.4, mode = '', hov = -1;
  addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
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
  });
  (function loop() {
    rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
    var tg = mode === 'view' ? 1 : mode === 'link' ? 0.62 : 0.4;
    sc += (tg - sc) * 0.18;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) scale(' + sc + ')';
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    var tx = (innerWidth - 440) / 2 + (mx - innerWidth / 2) * 0.06, ty = (innerHeight - 290) / 2 + 32 + (my - innerHeight / 2) * 0.06;
    px += (tx - px) * 0.12; py += (ty - py) * 0.12;
    var rot = Math.max(-6, Math.min(6, (tx - px) * 0.03));
    for (var k = 0; k < prevs.length; k++) prevs[k].style.transform = 'translate(' + px + 'px,' + py + 'px) rotate(' + rot + 'deg)';
    requestAnimationFrame(loop);
  })();
})();
