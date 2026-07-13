/* ===== Il Forno di Lambrate — main.js ===== */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = root.classList.contains('reduce-motion');

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* intro */
  var intro = document.getElementById('intro');
  if (intro && !reduce) {
    document.body.style.overflow = 'hidden';
    var done = function () {
      intro.classList.add('is-done');
      document.body.style.overflow = '';
      setTimeout(function () { if (intro && intro.parentNode) intro.parentNode.removeChild(intro); }, 700);
      window.removeEventListener('click', done);
    };
    setTimeout(done, 2000);
    window.addEventListener('click', done);
  } else if (intro) { intro.parentNode && intro.parentNode.removeChild(intro); }

  /* header scroll */
  var header = document.getElementById('siteHeader');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 40); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var mq = window.matchMedia('(max-width:960px)');
  var lastFocus = null;
  function isMobile() { return mq.matches; }
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    if (isMobile()) {
      nav.inert = !open;
      if (open) { lastFocus = document.activeElement; var f = nav.querySelector('a'); f && f.focus(); }
      else if (lastFocus) { lastFocus.focus(); }
    } else { nav.inert = false; }
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A' && isMobile()) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setMenu(false); });
    var syncMq = function () { if (!isMobile()) { nav.classList.remove('open'); nav.inert = false; burger.setAttribute('aria-expanded', 'false'); } else { if (!nav.classList.contains('open')) nav.inert = true; } };
    mq.addEventListener ? mq.addEventListener('change', syncMq) : mq.addListener(syncMq);
    syncMq();
  }

  /* reveal + watchdog */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  function showAll() { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }
  if (reduce || !('IntersectionObserver' in window)) { showAll(); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    var fired = false;
    var wd = new IntersectionObserver(function () { fired = true; wd.disconnect(); });
    wd.observe(document.body);
    setTimeout(function () { if (!fired) showAll(); }, 1500);
  }

  /* dynamic hours (Europe/Rome) */
  var HOURS = { 1: [[450, 1170]], 2: [[450, 1170]], 3: [[450, 1170]], 4: [[450, 1170]], 5: [[450, 1170]], 6: [[450, 1050]], 0: [] };
  function romeNow() { return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' })); }
  function fmt(m) { var h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; }
  function updateHours(lang) {
    var statusEl = document.getElementById('hoursStatus');
    if (!statusEl) return;
    var now = romeNow(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    var wins = HOURS[day] || [], open = false, nextClose = null, nextOpen = null, nextDayOpen = null;
    wins.forEach(function (w) { if (mins >= w[0] && mins < w[1]) { open = true; nextClose = w[1]; } });
    if (!open) { for (var i = 0; i < wins.length; i++) { if (mins < wins[i][0]) { nextOpen = wins[i][0]; break; } } }
    if (!open && nextOpen === null) { for (var d = 1; d <= 7; d++) { var nd = (day + d) % 7; if ((HOURS[nd] || []).length) { nextDayOpen = { d: nd, o: HOURS[nd][0][0] }; break; } } }
    var t = {
      it: { open: 'Aperto ora', closes: 'chiude alle', closed: 'Chiuso ora', opens: 'apre oggi alle', opensDay: 'apre', days: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'] },
      en: { open: 'Open now', closes: 'closes at', closed: 'Closed now', opens: 'opens today at', opensDay: 'opens', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
    }[lang] || {};
    var html;
    if (open) html = '<span class="dot"></span>' + t.open + ' · ' + t.closes + ' ' + fmt(nextClose);
    else if (nextOpen !== null) html = '<span class="dot"></span>' + t.closed + ' · ' + t.opens + ' ' + fmt(nextOpen);
    else if (nextDayOpen) html = '<span class="dot"></span>' + t.closed + ' · ' + t.opensDay + ' ' + t.days[nextDayOpen.d] + ' ' + fmt(nextDayOpen.o);
    else html = '<span class="dot"></span>' + t.closed;
    statusEl.className = 'hours__status ' + (open ? 'is-open' : 'is-closed');
    statusEl.innerHTML = html;
    document.querySelectorAll('.hours__table tr').forEach(function (r) { r.classList.toggle('today', parseInt(r.getAttribute('data-day'), 10) === day); });
  }

  /* i18n */
  var EN = {
    'skip': 'Skip to content',
    'nav.about': 'The bakery', 'nav.products': 'What we bake', 'nav.gallery': 'Gallery', 'nav.where': 'Where & hours', 'nav.reviews': 'Reviews',
    'cta.order': 'Order',
    'hero.eyebrow': 'Gambero Rosso · Three Loaves 2027',
    'hero.concept': 'Give the dough its time.',
    'hero.lead': 'A neighbourhood bakery in Lambrate where bread is born from sourdough and patience. Naturally-leavened bread, pizza, focaccia and pastries — among the best bakeries in Italy.',
    'hero.cta1': 'What we bake', 'hero.cta2': 'Find us',
    'hero.stat1': 'on Google · 298 reviews', 'hero.stat2': 'Loaves · Gambero Rosso 2027', 'hero.stat3': 'the bakery on Via Teodosio',
    'hero.tag': 'Baked today',
    'story.label': 'The bakery',
    'story.title': 'Bread needs time. We give it time.',
    'story.p1': "Il Forno di Lambrate is a neighbourhood bakery on the corner of Via Teodosio: naturally-leavened sourdough bread, pizza and deli, with one fixed idea — research and innovation, no shortcuts. Every day baker Cesare and his counter bake products with time inside them.",
    'story.p2': "Work that shows: in 2027 the Gambero Rosso guide «Bread and Bakers of Italy» awarded us the <strong>Three Loaves</strong> — the highest honour, reserved for a handful of bakeries in the whole country. But the best prize is still the people who come back every morning.",
    'story.chip1': 'Sourdough', 'story.chip2': 'Culinary research', 'story.chip3': 'Neighbourhood bakery',
    'story.seal': 'Three<br>Loaves<br>2027',
    'prod.label': 'What we bake', 'prod.title': 'From bread to pastries, every day.',
    'prod.1t': 'Naturally-leavened bread', 'prod.1d': 'Sourdough loaves and special breads: olives, chocolate, raisins. Crisp crust, living crumb.',
    'prod.2t': 'Pizza by the slice & focaccia', 'prod.2d': 'Pizza bianca, rossa, courgette, porchetta and fragrant focaccia — perfect for a quick lunch.',
    'prod.3t': 'Croissants & pastries', 'prod.3d': 'Morning pastries and croissants, plain or filled: the neighbourhood breakfast.',
    'prod.4t': 'Cakes & patisserie', 'prod.4d': 'Cakes, biscuits, baked sweets and festive leavened cakes, with the same care as the bread.',
    'prod.5t': 'Deli', 'prod.5d': 'Savouries, rustic bakes and counter specialities to take home something good, right away.',
    'prod.ctaText': "Ask us what's fresh today.", 'prod.cta': 'Call or message us',
    'prod.note': 'The counter changes every day: prices per piece and per kilo in-store. Around €1–10 per person.',
    'gallery.label': 'Gallery', 'gallery.title': 'From the counter.',
    'where.label': 'Where & hours', 'where.title': 'On the corner of Via Teodosio.',
    'day.mon': 'Monday', 'day.tue': 'Tuesday', 'day.wed': 'Wednesday', 'day.thu': 'Thursday', 'day.fri': 'Friday', 'day.sat': 'Saturday', 'day.sun': 'Sunday', 'closed': 'Closed',
    'rev.label': 'Reviews', 'rev.title': 'The neighbourhood says so.',
    'contact.label': 'Come and see us', 'contact.title': 'Good bread goes to those who come early.',
    'contact.lead': 'Drop by Via Teodosio 2, call us to set aside what you need, or message us on Instagram. For pizza, focaccia and festive cakes, order in advance.',
    'contact.call': 'Call · 342 340 9218',
    'faq.title': 'Frequently asked questions',
    'faq.q1': 'What bread do you make?',
    'faq.a1': 'Naturally-leavened sourdough bread, baked daily: from classic loaves to special breads with olives, chocolate or raisins. Besides bread — pizza by the slice, focaccia, croissants, pastries, cakes and deli.',
    'faq.q2': 'Where are you and what are your hours?',
    'faq.a2': 'On the corner at Via Teodosio 2, in Lambrate (Milan). Open Monday to Friday 07:30–19:30, Saturday 07:30–17:30. Closed on Sunday.',
    'faq.q3': 'What is the Gambero Rosso Three Loaves award?',
    'faq.a3': "It's the highest honour of the Gambero Rosso guide «Bread and Bakers of Italy», awarded each year only to Italy's best bakeries. Il Forno di Lambrate received the Three Loaves in 2027.",
    'faq.q4': 'Can I order or reserve?',
    'faq.a4': 'You can drop in, order by phone on 342 340 9218 or message us on Instagram. For pizza, focaccia and festive cakes, it\'s best to order ahead.',
    'footer.visit': 'Come and see us', 'footer.hours': 'Mon–Fri 7:30–19:30 · Sat 7:30–17:30', 'footer.follow': 'Follow us', 'footer.credit': 'Demo website — Bespoke Studio',
    'ab.call': 'Call', 'ab.wa': 'WhatsApp'
  };
  var IT = {};
  [].slice.call(document.querySelectorAll('[data-i18n]')).forEach(function (el) { IT[el.getAttribute('data-i18n')] = el.innerHTML; });
  function applyLang(lang) {
    var dict = lang === 'en' ? EN : IT;
    [].slice.call(document.querySelectorAll('[data-i18n]')).forEach(function (el) {
      var k = el.getAttribute('data-i18n'); if (dict[k] != null) el.innerHTML = dict[k];
    });
    root.setAttribute('lang', lang);
    var it = document.querySelector('.lang__it'), en = document.querySelector('.lang__en');
    if (it && en) { it.classList.toggle('is-active', lang === 'it'); en.classList.toggle('is-active', lang === 'en'); }
    var lt = document.getElementById('langToggle');
    if (lt) lt.setAttribute('aria-label', lang === 'it' ? 'Switch language to English' : 'Passa all\'italiano');
    try { localStorage.setItem('forno-lang', lang); } catch (e) {}
    updateHours(lang);
  }
  var langToggle = document.getElementById('langToggle');
  var curLang = 'it';
  try { curLang = localStorage.getItem('forno-lang') || 'it'; } catch (e) {}
  if (langToggle) langToggle.addEventListener('click', function () { applyLang(root.getAttribute('lang') === 'it' ? 'en' : 'it'); });
  applyLang(curLang);
  setInterval(function () { updateHours(root.getAttribute('lang')); }, 60000);

  /* lightbox */
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lightboxImg'), lbClose = document.getElementById('lightboxClose'), lbLast = null;
  function openLb(src, alt) { lbImg.src = src; lbImg.alt = alt || ''; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); lbLast = document.activeElement; lbClose.focus(); document.body.style.overflow = 'hidden'; }
  function closeLb() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); lbImg.src = ''; document.body.style.overflow = ''; lbLast && lbLast.focus(); }
  [].slice.call(document.querySelectorAll('.shot')).forEach(function (btn) { btn.addEventListener('click', function () { var img = btn.querySelector('img'); openLb(btn.getAttribute('data-full'), img ? img.alt : ''); }); });
  lbClose && lbClose.addEventListener('click', closeLb);
  lb && lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });
})();
