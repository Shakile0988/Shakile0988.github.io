/* ═══════════ IMTIAZ SHAKIL — PORTFOLIO ENGINE ═══════════ */
(function () {
'use strict';
const D = window.PORTFOLIO_DATA || { projects: [], videoLab: [] };
const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
const isTouch = matchMedia('(hover:none)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = !!window.gsap;
window.MEDIA && MEDIA.hydrate(document);
if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* ─── Lenis smooth scroll ─── */
let lenis = null;
if (window.Lenis && !isTouch && !reduced) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.02 });
  lenis.on('scroll', () => window.ScrollTrigger && ScrollTrigger.update());
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
function scrollStop(on) { if (lenis) on ? lenis.stop() : lenis.start(); document.body.style.overflow = on ? 'hidden' : ''; }

/* anchor nav via lenis */
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (id.length > 1 && $(id)) {
    e.preventDefault();
    $('#mobile-menu').classList.remove('open');
    lenis ? lenis.scrollTo(id, { offset: -20, duration: 1.4 }) : $(id).scrollIntoView({ behavior: 'smooth' });
  }
}));

/* ═══ SOCIAL ICONS ═══ */
const SOCIALS = [
  { n: 'WhatsApp', u: 'https://wa.me/8801993264469?text=Hi%20Shakil%20—%20I%20want%20to%20automate%20my%20business.', p: '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/><path d="M8.6 8.4c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .5.4.2.4.6 1.4.6 1.5.1.1.1.3 0 .4-.2.4-.5.7-.4.9.6 1 1.3 1.6 2.3 2.1.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3 0 .1 0 .6-.2 1-.2.5-1 1-1.5 1-.4.1-.9.2-2.6-.5-2.2-1-3.6-3.2-3.7-3.3-.1-.2-.9-1.2-.9-2.3 0-1.1.6-1.6.8-1.8z"/>' },
  { n: 'LinkedIn', u: 'https://www.linkedin.com/in/md-shakile-4175aa378/', p: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10.5V17M8 7.2v.1M12 17v-3.6c0-1.3.9-2.4 2.2-2.4 1.3 0 2.3 1.1 2.3 2.4V17"/>' },
  { n: 'Instagram', u: 'https://www.instagram.com/imtiazahmedshakile/', p: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/>' },
  { n: 'GitHub', u: 'https://github.com/Shakile0988', p: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>' },
  { n: 'Upwork', u: 'https://www.upwork.com/freelancers/~0137a8d45bca24e941', p: '<path d="M3 7v4.5a3.5 3.5 0 0 0 7 0V7"/><path d="M10 11.5c1.2 2.6 2.7 5.5 5.5 5.5a3.5 3.5 0 0 0 0-7c-2.8 0-3.6 3.2-4.2 5.3L10 20"/>' },
  { n: 'Facebook', u: 'https://www.facebook.com/imtiazahmedshakile', p: '<path d="M14 8h2.5V5H14a4 4 0 0 0-4 4v2H7.5v3H10v7h3v-7h2.5l.5-3H13V9a1 1 0 0 1 1-1z"/>' },
  { n: 'Email', u: 'mailto:mdshakile066@gmail.com', p: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>' }
];
function socialRow(el) {
  if (!el) return;
  el.innerHTML = SOCIALS.map(s =>
    `<a class="s-ic" data-magnet data-cursor="link" href="${s.u}" ${s.u.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} aria-label="${s.n}" title="${s.n}"><svg viewBox="0 0 24 24">${s.p}</svg></a>`).join('');
}
socialRow($('#social-row')); socialRow($('#social-row-2'));

/* ═══ RENDER: PROJECT CARDS ═══ */
const CATNAME = { ghl: 'GHL Systems', ai: 'AI & Voice', n8n: 'n8n', web: 'Web & Code' };
const grid = $('#grid');
D.projects.forEach((p, i) => {
  const card = document.createElement('article');
  card.className = 'card tilt-card';
  card.dataset.cat = p.cat; card.dataset.slug = p.slug; card.dataset.cursor = 'view';
  let media = '';
  if (p.images && p.images.length) {
    media = p.images.slice(0, 6).map((im, k) =>
      `<div class="slide${k === 0 ? ' on' : ''}" data-k="${k}"><img data-lazy="assets/img/${im.f}" alt="${p.title} — screen ${k + 1}"></div>`).join('');
    media = `<img class="ph" src="${p.images[0].ph}" alt="" aria-hidden="true">` + media;
    media += `<div class="card-dots">${p.images.slice(0, 6).map((_, k) => `<i${k === 0 ? ' class="on"' : ''}></i>`).join('')}</div>`;
  } else if (p.video) {
    media = `<div class="slide on"><img data-media="assets/poster/${p.video}.jpg" alt="${p.title}"><video data-hover-vid data-vsrc="assets/vid/${p.video}.mp4" muted loop playsinline preload="none" style="position:absolute;inset:0;opacity:0;transition:opacity .4s"></video></div>`;
  }
  const badge = p.video ? `<span class="vid-badge">DEMO</span>` : '';
  card.innerHTML = `
    <div class="card-media">${media}${badge}</div>
    <div class="card-body">
      <span class="card-tag">${p.tag}</span>
      <h3>${p.title}</h3>
      <p>${p.blurb}</p>
      <div class="card-stack">${p.stack.slice(0, 4).map(s => `<span>${s}</span>`).join('')}</div>
    </div>
    <div class="card-arrow">→</div>`;
  card.addEventListener('click', () => openLightbox(p));
  grid.appendChild(card);
});
$('#count-all').textContent = D.projects.length;
MEDIA.hydrate(grid);
/* hydrate first slide of every card immediately */
$$('.slide[data-k="0"] img[data-lazy]', grid).forEach(img => {
  const p = img.getAttribute('data-lazy'); img.removeAttribute('data-lazy');
  MEDIA.url(p).then(u => { img.src = u; });
});

/* card slideshows — staggered, only while visible */
const shows = [];
$$('.card').forEach((card, idx) => {
  const slides = $$('.slide', card);
  if (slides.length < 2) return;
  const dots = $$('.card-dots i', card);
  let k = 0, timer = null;
  const step = () => {
    const prev = slides[k];
    k = (k + 1) % slides.length;
    const next = slides[k];
    const img = $('img[data-lazy]', next);
    if (img) { const pth = img.getAttribute('data-lazy'); img.removeAttribute('data-lazy'); MEDIA.url(pth).then(u => { img.src = u; }); }
    prev.classList.remove('on'); prev.classList.add('off');
    next.classList.remove('off'); next.classList.add('on');
    dots.forEach((d, j) => d.classList.toggle('on', j === k));
  };
  shows.push({
    card,
    start() { if (!timer) timer = setInterval(step, 3200 + (idx % 5) * 260); },
    stop() { clearInterval(timer); timer = null; }
  });
});
const showIO = new IntersectionObserver(en => en.forEach(e => {
  const s = shows.find(x => x.card === e.target);
  if (s) e.isIntersecting ? s.start() : s.stop();
}), { rootMargin: '80px' });
shows.forEach(s => showIO.observe(s.card));

/* ═══ FILTERS ═══ */
$$('.f-btn').forEach(btn => btn.addEventListener('click', () => {
  $$('.f-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const f = btn.dataset.f;
  const cards = $$('.card', grid);
  if (hasGSAP) {
    gsap.to(cards, {
      opacity: 0, y: 18, scale: .97, duration: .22, stagger: .012, ease: 'power2.in',
      onComplete() {
        cards.forEach(c => c.style.display = (f === 'all' || c.dataset.cat === f) ? '' : 'none');
        const vis = cards.filter(c => c.style.display !== 'none');
        gsap.fromTo(vis, { opacity: 0, y: 26, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .5, stagger: .05, ease: 'power3.out', clearProps: 'transform,opacity' });
        ScrollTrigger && ScrollTrigger.refresh();
      }
    });
  } else {
    cards.forEach(c => c.style.display = (f === 'all' || c.dataset.cat === f) ? '' : 'none');
  }
}));

/* ═══ VIDEO LAB ═══ */
const rail = $('#lab-rail');
D.videoLab.forEach(v => {
  const el = document.createElement('div');
  el.className = 'lab-card'; el.dataset.cursor = 'play';
  el.innerHTML = `
    <div class="lab-media">
      <img data-media="assets/poster/${v.id}.jpg" alt="${v.title}">
      <video data-hover-vid data-vsrc="assets/vid/${v.id}.mp4" muted loop playsinline preload="none"></video>
    </div>
    <div class="lab-body"><div><h4>${v.title}</h4><p>${v.note}</p></div><span class="lab-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></div>`;
  el.addEventListener('click', () => openCinema(`assets/vid/${v.id}.mp4`, v.title));
  rail.appendChild(el);
});
MEDIA.hydrate(rail);

/* hover-to-play previews */
$$('video[data-hover-vid]').forEach(v => {
  const wrap = v.closest('.lab-card, .card');
  if (!wrap || isTouch) return;
  wrap.addEventListener('mouseenter', () => {
    const go = () => v.play().then(() => { v.style.opacity = 1; v.closest('.lab-media') && v.closest('.lab-media').classList.add('playing'); }).catch(() => {});
    if (v.dataset.vsrc) { const pth = v.dataset.vsrc; delete v.dataset.vsrc; MEDIA.url(pth).then(u => { v.src = u; go(); }); }
    else go();
  });
  wrap.addEventListener('mouseleave', () => {
    v.pause(); v.style.opacity = 0;
    v.closest('.lab-media') && v.closest('.lab-media').classList.remove('playing');
  });
});

/* drag-to-scroll rail */
(function () {
  let down = false, sx = 0, sl = 0;
  rail.addEventListener('pointerdown', e => { down = true; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add('dragging'); });
  addEventListener('pointermove', e => { if (down) rail.scrollLeft = sl - (e.clientX - sx); });
  addEventListener('pointerup', () => { down = false; rail.classList.remove('dragging'); });
})();

/* ═══ LIGHTBOX ═══ */
const LB = $('#lightbox');
let lbMedia = [], lbIdx = 0;
function openLightbox(p) {
  $('#lb-tag').textContent = `${CATNAME[p.cat]} · ${p.tag}`;
  $('#lb-title').textContent = p.title;
  $('#lb-blurb').textContent = p.blurb;
  $('#lb-points').innerHTML = (p.points || []).map(x => `<li>${x}</li>`).join('');
  $('#lb-stack').innerHTML = p.stack.map(s => `<span>${s}</span>`).join('');
  lbMedia = [];
  if (p.video) lbMedia.push({ type: 'video', src: `assets/vid/${p.video}.mp4`, poster: `assets/poster/${p.video}.jpg` });
  (p.images || []).forEach(im => lbMedia.push({ type: 'img', src: `assets/img/${im.f}` }));
  $('#lb-thumbs').innerHTML = lbMedia.map((m, i) =>
    m.type === 'video' ? `<div class="vthumb" data-i="${i}">▶</div>` : `<img data-media="${m.src}" data-i="${i}" alt="">`).join('');
  MEDIA.hydrate($('#lb-thumbs'));
  $$('#lb-thumbs [data-i]').forEach(t => t.addEventListener('click', () => setLb(+t.dataset.i)));
  const stage = $('#lb-stage');
  stage.innerHTML = `<button class="lb-nav lb-prev">←</button><div id="lb-view" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center"></div><button class="lb-nav lb-next">→</button>`;
  $('.lb-prev', stage).addEventListener('click', () => setLb(lbIdx - 1));
  $('.lb-next', stage).addEventListener('click', () => setLb(lbIdx + 1));
  setLb(0);
  LB.classList.add('open'); LB.setAttribute('aria-hidden', 'false');
  scrollStop(true);
  if (hasGSAP) {
    gsap.fromTo('.lb-shell', { y: 46, opacity: 0, scale: .97 }, { y: 0, opacity: 1, scale: 1, duration: .55, ease: 'power3.out' });
    gsap.fromTo('.lb-backdrop', { opacity: 0 }, { opacity: 1, duration: .4 });
  }
}
function setLb(i) {
  lbIdx = (i + lbMedia.length) % lbMedia.length;
  const m = lbMedia[lbIdx], view = $('#lb-view');
  view.innerHTML = m.type === 'video'
    ? `<video data-media="${m.src}" data-poster="${m.poster}" controls autoplay playsinline style="border-radius:10px"></video>`
    : `<img data-media="${m.src}" alt="">`;
  MEDIA.hydrate(view);
  if (hasGSAP) gsap.fromTo(view.firstChild, { opacity: 0, scale: .985 }, { opacity: 1, scale: 1, duration: .45, ease: 'power2.out' });
  $$('#lb-thumbs [data-i]').forEach(t => t.classList.toggle('on', +t.dataset.i === lbIdx));
}
function closeLightbox() {
  const v = $('#lb-view video'); if (v) v.pause();
  LB.classList.remove('open'); LB.setAttribute('aria-hidden', 'true');
  scrollStop(false);
}
$$('[data-lb-close]').forEach(b => b.addEventListener('click', closeLightbox));

/* ═══ CINEMA ═══ */
const CN = $('#cinema'), cnV = $('#cinema-video');
function openCinema(src, title) {
  $('#cinema-title').textContent = title;
  CN.classList.add('open'); CN.setAttribute('aria-hidden', 'false');
  scrollStop(true);
  MEDIA.url(src).then(u => { cnV.src = u; cnV.play().catch(() => {}); });
  if (hasGSAP) gsap.fromTo('.cn-shell', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out' });
}
function closeCinema() { cnV.pause(); cnV.src = ''; CN.classList.remove('open'); CN.setAttribute('aria-hidden', 'true'); scrollStop(false); }
$$('[data-cn-close]').forEach(b => b.addEventListener('click', closeCinema));
addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLightbox(); closeCinema(); }
  if (LB.classList.contains('open')) {
    if (e.key === 'ArrowRight') setLb(lbIdx + 1);
    if (e.key === 'ArrowLeft') setLb(lbIdx - 1);
  }
});

/* ═══ INTRO / TESTIMONIAL PLAYERS ═══ */
[['#intro-video', '#intro-play'], ['#testi-video', '#testi-play']].forEach(([vs, bs]) => {
  const v = $(vs), b = $(bs);
  if (!v || !b) return;
  b.addEventListener('click', e => {
    e.stopPropagation();
    v.controls = true; v.play(); b.classList.add('hidden');
  });
  v.addEventListener('pause', () => { if (!v.seeking && v.currentTime < v.duration) b.classList.remove('hidden'); });
});

/* ═══ CURSOR + SPARKS + MAGNETIC ═══ */
if (!isTouch) {
  const dot = $('#cursor-dot'), ring = $('#cursor-ring'), ctext = $('#cursor-text');
  let cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy;
  addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; dot.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; spark(e); }, { passive: true });
  (function loop() {
    rx += (cx - rx) * 0.16; ry += (cy - ry) * 0.16;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  const LBL = { view: 'view', play: 'play', drag: 'drag', link: '' };
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-cursor]');
    if (t) { ring.classList.add('grow'); ctext.textContent = LBL[t.dataset.cursor] || ''; }
    else ring.classList.remove('grow');
  });

  /* sparkle trail */
  const sc = $('#spark'), sx = sc.getContext('2d');
  let parts = [];
  function fit() { sc.width = innerWidth; sc.height = innerHeight; }
  fit(); addEventListener('resize', fit);
  let last = 0;
  function spark(e) {
    const now = performance.now();
    if (now - last < 26) return; last = now;
    parts.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * 1.2, vy: (Math.random() - .5) * 1.2 - .3, l: 1, s: 1 + Math.random() * 2, h: 250 + Math.random() * 60 });
    if (parts.length > 90) parts.shift();
  }
  window.burst = (x, y, n) => { for (let i = 0; i < (n || 26); i++) parts.push({ x, y, vx: (Math.random() - .5) * 7, vy: (Math.random() - .5) * 7 - 1, l: 1, s: 1.5 + Math.random() * 2.5, h: 150 + Math.random() * 120 }); };
  (function draw() {
    sx.clearRect(0, 0, sc.width, sc.height);
    sx.globalCompositeOperation = 'lighter';
    parts = parts.filter(p => p.l > 0);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += .02; p.l -= .022;
      sx.beginPath(); sx.arc(p.x, p.y, p.s * p.l, 0, 7);
      sx.fillStyle = `hsla(${p.h},90%,70%,${p.l * .8})`; sx.fill();
    });
    requestAnimationFrame(draw);
  })();

  /* magnetic */
  $$('[data-magnet]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .28, y = (e.clientY - r.top - r.height / 2) * .3;
      hasGSAP ? gsap.to(el, { x, y, duration: .4, ease: 'power2.out' }) : (el.style.transform = `translate(${x}px,${y}px)`);
    });
    el.addEventListener('mouseleave', () => {
      hasGSAP ? gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.45)' }) : (el.style.transform = '');
    });
  });

  /* tilt cards + glow position */
  $$('.tilt-card, .tile').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
      if (el.classList.contains('tilt-card')) el.style.transform = `perspective(900px) rotateY(${(px - .5) * 7}deg) rotateX(${(.5 - py) * 7}deg) translateZ(0)`;
    });
    el.addEventListener('mouseleave', () => { if (el.classList.contains('tilt-card')) el.style.transform = ''; });
  });
}

/* ═══ NAV BEHAVIOR ═══ */
const nav = $('#nav');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('solid', y > 40);
  nav.classList.toggle('hide', y > 320 && y > lastY);
  $('#wa-fab').classList.toggle('show', y > innerHeight * .6);
  $('#progress i').style.width = (y / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
  lastY = y;
}, { passive: true });
$('#burger').addEventListener('click', () => $('#mobile-menu').classList.toggle('open'));

/* ═══ COPY EMAIL ═══ */
$('#copy-email').addEventListener('click', function (e) {
  navigator.clipboard && navigator.clipboard.writeText('mdshakile066@gmail.com');
  const t = $('#email-text'), old = t.textContent;
  t.textContent = 'Copied to clipboard ✓';
  window.burst && burst(e.clientX, e.clientY, 30);
  setTimeout(() => t.textContent = old, 1800);
});
$('#yr').textContent = new Date().getFullYear();

/* ═══ PRELOADER + INTRO TIMELINE ═══ */
function heroIntro() {
  if (!hasGSAP) return;
  const tl = gsap.timeline();
  if (window.SplitType) {
    $$('.h1-line').forEach(l => new SplitType(l, { types: 'chars' }));
    tl.from('.hero-h1 .char', { yPercent: 118, rotateX: -50, opacity: 0, transformPerspective: 600, duration: 1, stagger: .022, ease: 'power4.out' }, .1);
  } else {
    tl.from('.hero-h1', { y: 40, opacity: 0, duration: .9, ease: 'power3.out' }, .1);
  }
  tl.to('.hero .reveal', { opacity: 1, y: 0, duration: .8, stagger: .09, ease: 'power3.out' }, .45)
    .from('.portrait-stage', { y: 60, opacity: 0, scale: .92, duration: 1.1, ease: 'power3.out' }, .3)
    .from('.p-chip', { scale: 0, opacity: 0, duration: .7, stagger: .12, ease: 'back.out(2)' }, .9);
  document.body.classList.add('booted');
}
const pre = $('#preloader');
if (hasGSAP && !reduced) {
  const tl = gsap.timeline();
  const count = { v: 0 };
  tl.to('.pl-name span', { y: 0, opacity: 1, rotate: 0, duration: .7, stagger: .045, ease: 'power4.out' })
    .to(count, {
      v: 100, duration: 1.5, ease: 'power2.inOut',
      onUpdate() { $('.pl-count').textContent = String(Math.round(count.v)).padStart(2, '0'); $('.pl-bar i').style.width = count.v + '%'; }
    }, .2)
    .to('.pl-name span', { y: '-120%', opacity: 0, duration: .5, stagger: .03, ease: 'power3.in' }, '-=.25')
    .to('.pl-meta,.pl-bar', { opacity: 0, duration: .3 }, '<')
    .to('.pl-curtain', { scaleY: 0, duration: .8, stagger: .1, ease: 'power4.inOut' }, '-=.15')
    .set(pre, { display: 'none' })
    .add(heroIntro, '-=.55');
} else {
  pre.style.display = 'none';
  $$('.hero .reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  document.body.classList.add('booted');
  heroIntro();
}
/* absolute fallback: never leave the nav hidden */
setTimeout(() => document.body.classList.add('booted'), 4500);

/* ═══ SCROLL ANIMATIONS ═══ */
if (hasGSAP && window.ScrollTrigger && !reduced) {
  /* generic reveals (outside hero) */
  ScrollTrigger.batch('section:not(.hero) .reveal', {
    start: 'top 88%',
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .85, stagger: .1, ease: 'power3.out', overwrite: true })
  });

  /* section titles — word mask rise */
  if (window.SplitType) {
    $$('[data-split-words]').forEach(el => {
      const st = new SplitType(el, { types: 'words' });
      gsap.set(st.words, { yPercent: 120, opacity: 0 });
      gsap.to(st.words, {
        yPercent: 0, opacity: 1, duration: .9, stagger: .05, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });
    const ch = $('.contact-h');
    if (ch) {
      const st = new SplitType(ch, { types: 'chars' });
      gsap.set(st.chars, { yPercent: 110, opacity: 0 });
      gsap.to(st.chars, {
        yPercent: 0, opacity: 1, duration: .8, stagger: .025, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: ch, start: 'top 85%' }
      });
    }
  }

  /* stats counters */
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.fromTo(el, { innerText: 0 }, { innerText: target, duration: 1.6, snap: { innerText: 1 }, ease: 'power2.out' })
    });
  });

  /* stat cards pop */
  gsap.from('.stat', { y: 40, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.stats', start: 'top 85%' } });

  /* bento tiles */
  gsap.from('.tile', { y: 50, opacity: 0, scale: .96, duration: .75, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.bento', start: 'top 82%' } });

  /* cards rise 3D */
  ScrollTrigger.batch('.card', {
    start: 'top 90%',
    onEnter: b => gsap.fromTo(b, { y: 70, opacity: 0, rotateX: 8 }, { y: 0, opacity: 1, rotateX: 0, duration: .9, stagger: .08, ease: 'power3.out', overwrite: true, clearProps: 'transform' })
  });

  /* lab cards slide in */
  gsap.from('.lab-card', { x: 120, opacity: 0, duration: .9, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: '.lab-rail', start: 'top 85%' } });

  /* steps + line fill */
  gsap.from('.step', { y: 50, opacity: 0, duration: .7, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '#steps', start: 'top 82%' } });
  gsap.to('#step-line-fill', { width: '100%', ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 75%', end: 'bottom 45%', scrub: 1 } });

  /* ghost titles parallax */
  $$('.ghost').forEach(g => {
    gsap.fromTo(g, { xPercent: 6 }, { xPercent: -12, ease: 'none', scrollTrigger: { trigger: g.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
  });

  /* aurora drift */
  gsap.to('.a1', { x: '18vw', y: '24vh', ease: 'none', scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 2 } });
  gsap.to('.a2', { x: '-14vw', y: '-20vh', ease: 'none', scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 2 } });

  /* hero parallax out */
  gsap.to('.hero-grid', { y: -70, opacity: .25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });

  /* marquee scroll-speed boost */
  const track = $('.marquee-track');
  track.innerHTML += track.innerHTML;
  const mq = gsap.to(track, { xPercent: -50, ease: 'none', duration: 26, repeat: -1 });
  ScrollTrigger.create({
    onUpdate(self) { gsap.to(mq, { timeScale: 1 + Math.min(Math.abs(self.getVelocity()) / 900, 3), duration: .3, overwrite: true }); }
  });

  /* rotating words */
  const words = $$('.rot-words b');
  let wi = 0;
  setInterval(() => {
    const cur = words[wi]; wi = (wi + 1) % words.length; const nxt = words[wi];
    gsap.to(cur, { yPercent: -110, opacity: 0, duration: .5, ease: 'power3.in' });
    gsap.fromTo(nxt, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .55, ease: 'power3.out', delay: .18 });
  }, 2600);
  gsap.set(words[0], { yPercent: 0, opacity: 1 });
} else {
  $$('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  const words = $$('.rot-words b');
  if (words.length) { words[0].style.opacity = 1; words[0].style.transform = 'none'; }
}
})();
