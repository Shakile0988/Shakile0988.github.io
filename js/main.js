/* ═══════════ IMTIAZ SHAKIL — PORTFOLIO ENGINE v2 ═══════════ */
(function () {
'use strict';
const D = window.PORTFOLIO_DATA || { projects: [], sections: [], videoLab: [], testimonials: [], proof: [] };
const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
const isTouch = matchMedia('(hover:none)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = !!window.gsap;
window.MEDIA && MEDIA.hydrate(document);
if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* ─── Lenis ─── */
let lenis = null;
if (window.Lenis && !isTouch && !reduced) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.02 });
  lenis.on('scroll', () => window.ScrollTrigger && ScrollTrigger.update());
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
function scrollStop(on) { if (lenis) on ? lenis.stop() : lenis.start(); document.body.style.overflow = on ? 'hidden' : ''; }
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (id.length > 1 && $(id)) {
    e.preventDefault();
    $('#mobile-menu').classList.remove('open');
    lenis ? lenis.scrollTo(id, { offset: -10, duration: 1.3 }) : $(id).scrollIntoView({ behavior: 'smooth' });
  }
}));

/* ═══ SOCIAL — real brand icons ═══ */
const SOCIALS = [
  { b: 'whatsapp', n: 'WhatsApp', ic: 'fa-brands fa-whatsapp', u: 'https://wa.me/8801993264469?text=Hi%20Shakil%20—%20I%20want%20a%20system%20audit.' },
  { b: 'linkedin', n: 'LinkedIn', ic: 'fa-brands fa-linkedin-in', u: 'https://www.linkedin.com/in/md-shakile-4175aa378/' },
  { b: 'instagram', n: 'Instagram', ic: 'fa-brands fa-instagram', u: 'https://www.instagram.com/imtiazahmedshakile/' },
  { b: 'github', n: 'GitHub', ic: 'fa-brands fa-github', u: 'https://github.com/Shakile0988' },
  { b: 'upwork', n: 'Upwork', ic: 'fa-brands fa-upwork', u: 'https://www.upwork.com/freelancers/~0137a8d45bca24e941' },
  { b: 'facebook', n: 'Facebook', ic: 'fa-brands fa-facebook-f', u: 'https://www.facebook.com/imtiazahmedshakile' },
  { b: 'email', n: 'Email', ic: 'fa-solid fa-envelope', u: 'mailto:mdshakile066@gmail.com' }
];
function socialRow(el) {
  if (!el) return;
  el.innerHTML = SOCIALS.map(s =>
    `<a class="s-ic" data-b="${s.b}" data-magnet data-cursor="link" href="${s.u}" ${s.u.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} aria-label="${s.n}" title="${s.n}"><i class="${s.ic}"></i></a>`).join('');
}
socialRow($('#social-row')); socialRow($('#social-row-2'));

/* ═══ RENDER: SERVICE CHAPTERS ═══ */
const CATNAME = { ghl: 'GHL Systems', ai: 'AI Voice', n8n: 'n8n Automation', web: 'Web & Code' };
const chaptersEl = $('#chapters');
function cardHTML(p) {
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
  return `
    <div class="card-media">${media}${badge}</div>
    <div class="card-body">
      <span class="card-tag">${p.tag}</span>
      <h3>${p.title}</h3>
      <p>${p.blurb}</p>
      <span class="card-result">${p.result}</span>
    </div>
    <div class="card-arrow">→</div>`;
}
D.sections.forEach(sec => {
  const s = document.createElement('section');
  s.className = 'chapter'; s.id = 's-' + sec.id;
  s.innerHTML = `
    <div class="ch-head">
      <div class="ch-num">${sec.num}</div>
      <div class="ch-info">
        <div class="eyebrow"><span class="tick"></span>SERVICE ${sec.num} — ${sec.name.toUpperCase()}</div>
        <h2 class="ch-hook" data-split-words>${sec.hook}</h2>
        <p class="ch-line">${sec.line}</p>
      </div>
    </div>
    <div class="grid" data-sec="${sec.id}"></div>`;
  chaptersEl.appendChild(s);
  const grid = $(`.grid[data-sec="${sec.id}"]`, s);
  D.projects.filter(p => p.cat === sec.id).forEach(p => {
    const card = document.createElement('article');
    card.className = 'card'; card.dataset.cursor = 'view';
    card.innerHTML = cardHTML(p);
    card.addEventListener('click', () => openLightbox(p));
    grid.appendChild(card);
  });
  MEDIA.hydrate(grid);
});
/* hydrate first slides */
$$('.slide[data-k="0"] img[data-lazy]').forEach(img => {
  const p = img.getAttribute('data-lazy'); img.removeAttribute('data-lazy');
  MEDIA.url(p).then(u => { img.src = u; });
});

/* slideshows */
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
  shows.push({ card, start() { if (!timer) timer = setInterval(step, 3300 + (idx % 5) * 240); }, stop() { clearInterval(timer); timer = null; } });
});
const showIO = new IntersectionObserver(en => en.forEach(e => {
  const s = shows.find(x => x.card === e.target);
  if (s) e.isIntersecting ? s.start() : s.stop();
}), { rootMargin: '90px' });
shows.forEach(s => showIO.observe(s.card));

/* ═══ VIDEO LAB ═══ */
const rail = $('#lab-rail');
const LAB = [{ id: 'intro', title: 'Meet Shakil — 2 minutes', note: 'Who builds your system, in his own words' }].concat(D.videoLab);
LAB.forEach(v => {
  const el = document.createElement('div');
  el.className = 'lab-card'; el.dataset.cursor = 'play';
  el.innerHTML = `
    <div class="lab-media">
      <img data-media="assets/poster/${v.id}.jpg" alt="${v.title}">
      <video data-hover-vid data-vsrc="assets/vid/${v.id}.mp4" muted loop playsinline preload="none"></video>
    </div>
    <div class="lab-body"><div><h4>${v.title}</h4><p>${v.note}</p></div><span class="lab-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></div>`;
  el.addEventListener('click', () => openCinema(`assets/vid/${v.id}.mp4`, v.title, 'video'));
  rail.appendChild(el);
});
MEDIA.hydrate(rail);

/* ═══ PROOF: quotes + chat rail ═══ */
$('#quotes').innerHTML = D.testimonials.map(t =>
  `<blockquote class="quote"><p>${t.quote}</p><footer><b>${t.who}</b> · ${t.where}</footer></blockquote>`).join('');
const chatRail = $('#chat-rail');
D.proof.forEach((im, i) => {
  const el = document.createElement('div');
  el.className = 'chat-card'; el.dataset.cursor = 'view';
  el.innerHTML = `<img data-media="assets/img/${im.f}" alt="Client conversation ${i + 1}"><span>LIVE PROJECT ${String(i + 1).padStart(2, '0')}</span>`;
  el.addEventListener('click', () => openCinema(`assets/img/${im.f}`, `Client thread — live project ${i + 1}`, 'img'));
  chatRail.appendChild(el);
});
MEDIA.hydrate(chatRail);

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

/* drag-to-scroll rails */
[rail, chatRail].forEach(r => {
  if (!r) return;
  let down = false, sx = 0, sl = 0, moved = 0;
  r.addEventListener('pointerdown', e => { down = true; moved = 0; sx = e.clientX; sl = r.scrollLeft; r.classList.add('dragging'); });
  addEventListener('pointermove', e => { if (down) { r.scrollLeft = sl - (e.clientX - sx); moved += Math.abs(e.movementX || 0); } });
  addEventListener('pointerup', () => { down = false; r.classList.remove('dragging'); });
  r.addEventListener('click', e => { if (moved > 8) { e.stopPropagation(); e.preventDefault(); } }, true);
});

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

/* ═══ CINEMA (video or image zoom) ═══ */
const CN = $('#cinema');
function openCinema(src, title, type) {
  const body = $('#cinema-body');
  body.innerHTML = type === 'img' ? `<img class="cn-img" alt="">` : `<video controls playsinline></video>`;
  const el = body.firstChild;
  $('#cinema-title').textContent = title;
  CN.classList.add('open'); CN.setAttribute('aria-hidden', 'false');
  scrollStop(true);
  MEDIA.url(src).then(u => { el.src = u; if (type !== 'img') el.play().catch(() => {}); });
  if (hasGSAP) gsap.fromTo('.cn-shell', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out' });
}
function closeCinema() {
  const v = $('#cinema-body video'); if (v) v.pause();
  $('#cinema-body').innerHTML = '';
  CN.classList.remove('open'); CN.setAttribute('aria-hidden', 'true');
  scrollStop(false);
}
$$('[data-cn-close]').forEach(b => b.addEventListener('click', closeCinema));
addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLightbox(); closeCinema(); }
  if (LB.classList.contains('open')) {
    if (e.key === 'ArrowRight') setLb(lbIdx + 1);
    if (e.key === 'ArrowLeft') setLb(lbIdx - 1);
  }
});

/* testimonial player */
(function () {
  const v = $('#testi-video'), b = $('#testi-play');
  if (!v || !b) return;
  b.addEventListener('click', e => { e.stopPropagation(); v.controls = true; v.play(); b.classList.add('hidden'); });
  v.addEventListener('pause', () => { if (!v.seeking && v.currentTime < v.duration) b.classList.remove('hidden'); });
})();

/* ═══ CURSOR + MAGNETIC + TILT (no sparkles) ═══ */
if (!isTouch) {
  const dot = $('#cursor-dot'), ring = $('#cursor-ring'), ctext = $('#cursor-text');
  let cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy;
  addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; dot.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; }, { passive: true });
  (function loop() {
    rx += (cx - rx) * 0.15; ry += (cy - ry) * 0.15;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  const LBL = { view: 'view', play: 'play', drag: 'drag', link: '' };
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-cursor]');
    if (t) { ring.classList.add('grow'); ctext.textContent = LBL[t.dataset.cursor] || ''; }
    else ring.classList.remove('grow');
  });
  $$('[data-magnet]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .25, y = (e.clientY - r.top - r.height / 2) * .28;
      hasGSAP ? gsap.to(el, { x, y, duration: .4, ease: 'power2.out' }) : (el.style.transform = `translate(${x}px,${y}px)`);
    });
    el.addEventListener('mouseleave', () => {
      hasGSAP ? gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.5)' }) : (el.style.transform = '');
    });
  });
}

/* ═══ NAV ═══ */
const nav = $('#nav');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('solid', y > 40);
  nav.classList.toggle('hide', y > 340 && y > lastY);
  $('#wa-fab').classList.toggle('show', y > innerHeight * .6);
  $('#progress i').style.width = (y / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
  lastY = y;
}, { passive: true });
$('#burger').addEventListener('click', () => $('#mobile-menu').classList.toggle('open'));

/* copy email */
$('#copy-email').addEventListener('click', function () {
  navigator.clipboard && navigator.clipboard.writeText('mdshakile066@gmail.com');
  const t = $('#email-text'), old = t.textContent;
  t.textContent = 'Copied ✓';
  setTimeout(() => t.textContent = old, 1600);
});
$('#yr').textContent = new Date().getFullYear();

/* ═══ PRELOADER + INTRO ═══ */
function heroIntro() {
  if (!hasGSAP) return;
  const tl = gsap.timeline();
  if (window.SplitType) {
    $$('.h1-line').forEach(l => new SplitType(l, { types: 'words,chars' }));
    tl.from('.hero-h1 .char', { yPercent: 118, rotateX: -45, opacity: 0, transformPerspective: 600, duration: 1, stagger: .02, ease: 'power4.out' }, .1);
  } else {
    tl.from('.hero-h1', { y: 40, opacity: 0, duration: .9, ease: 'power3.out' }, .1);
  }
  tl.to('.hero .reveal', { opacity: 1, y: 0, duration: .8, stagger: .08, ease: 'power3.out' }, .4)
    .from('.portrait-stage', { y: 56, opacity: 0, scale: .93, duration: 1.05, ease: 'power3.out' }, .3)
    .from('.p-chip', { scale: 0, opacity: 0, duration: .7, stagger: .12, ease: 'back.out(2)' }, .9);
  document.body.classList.add('booted');
}
const pre = $('#preloader');
if (hasGSAP && !reduced) {
  const tl = gsap.timeline();
  const count = { v: 0 };
  tl.to('.pl-name span', { y: 0, opacity: 1, rotate: 0, duration: .7, stagger: .04, ease: 'power4.out' })
    .to(count, {
      v: 100, duration: 1.4, ease: 'power2.inOut',
      onUpdate() { $('.pl-count').textContent = String(Math.round(count.v)).padStart(2, '0'); $('.pl-bar i').style.width = count.v + '%'; }
    }, .2)
    .to('.pl-name span', { y: '-120%', opacity: 0, duration: .5, stagger: .025, ease: 'power3.in' }, '-=.2')
    .to('.pl-meta,.pl-bar', { opacity: 0, duration: .3 }, '<')
    .to('.pl-curtain', { scaleY: 0, duration: .8, stagger: .09, ease: 'power4.inOut' }, '-=.1')
    .set(pre, { display: 'none' })
    .add(heroIntro, '-=.55');
} else {
  pre.style.display = 'none';
  $$('.hero .reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  document.body.classList.add('booted');
  heroIntro();
}
setTimeout(() => document.body.classList.add('booted'), 4200);

/* ═══ SCROLL FX ═══ */
if (hasGSAP && window.ScrollTrigger && !reduced) {
  ScrollTrigger.batch('section:not(.hero) .reveal', {
    start: 'top 88%',
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .85, stagger: .1, ease: 'power3.out', overwrite: true })
  });
  if (window.SplitType) {
    $$('[data-split-words]').forEach(el => {
      const st = new SplitType(el, { types: 'words' });
      gsap.set(st.words, { yPercent: 120, opacity: 0 });
      gsap.to(st.words, { yPercent: 0, opacity: 1, duration: .85, stagger: .045, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
    });
    const ch = $('.contact-h');
    if (ch) {
      const st = new SplitType(ch, { types: 'words,chars' });
      gsap.set(st.chars, { yPercent: 110, opacity: 0 });
      gsap.to(st.chars, { yPercent: 0, opacity: 1, duration: .75, stagger: .022, ease: 'back.out(1.5)', scrollTrigger: { trigger: ch, start: 'top 85%', once: true } });
      setTimeout(() => gsap.to(st.chars, { opacity: 1, yPercent: 0, duration: .5, overwrite: false }), 6500);
    }
  }
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.fromTo(el, { innerText: 0 }, { innerText: target, duration: 1.5, snap: { innerText: 1 }, ease: 'power2.out' })
    });
  });
  /* chapter numbers slide + grids rise */
  $$('.ch-num').forEach(n => {
    gsap.from(n, { x: -60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: n, start: 'top 88%' } });
  });
  ScrollTrigger.batch('.card', {
    start: 'top 92%',
    onEnter: b => gsap.fromTo(b, { y: 64, opacity: 0 }, { y: 0, opacity: 1, duration: .85, stagger: .07, ease: 'power3.out', overwrite: true, clearProps: 'transform' })
  });
  gsap.from('.lab-card', { x: 110, opacity: 0, duration: .9, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.lab-rail', start: 'top 86%' } });
  gsap.from('.quote', { y: 40, opacity: 0, duration: .7, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.quotes', start: 'top 85%' } });
  gsap.from('.chat-card', { y: 50, opacity: 0, duration: .7, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.chat-rail', start: 'top 88%' } });
  gsap.from('.step', { y: 46, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '#steps', start: 'top 84%' } });
  gsap.to('#step-line-fill', { width: '100%', ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 75%', end: 'bottom 45%', scrub: 1 } });
  gsap.to('.hero-grid', { y: -60, opacity: .3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });

  const track = $('.marquee-track');
  track.innerHTML += track.innerHTML;
  const mq = gsap.to(track, { xPercent: -50, ease: 'none', duration: 28, repeat: -1 });
  ScrollTrigger.create({
    onUpdate(self) { gsap.to(mq, { timeScale: 1 + Math.min(Math.abs(self.getVelocity()) / 1000, 2.5), duration: .3, overwrite: true }); }
  });

  const words = $$('.rot-words b');
  let wi = 0;
  setInterval(() => {
    const cur = words[wi]; wi = (wi + 1) % words.length; const nxt = words[wi];
    gsap.to(cur, { yPercent: -110, opacity: 0, duration: .5, ease: 'power3.in' });
    gsap.fromTo(nxt, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .55, ease: 'power3.out', delay: .16 });
  }, 2600);
  gsap.set(words[0], { yPercent: 0, opacity: 1 });

  /* layout settles late (async b64 media) — recalc trigger positions */
  addEventListener('load', () => { setTimeout(() => ScrollTrigger.refresh(), 900); setTimeout(() => ScrollTrigger.refresh(), 2600); });
  /* failsafe: nothing stays hidden if a trigger was missed */
  setTimeout(() => {
    $$('.card,.lab-card,.quote,.chat-card,.step,.ch-num,.reveal').forEach(el => {
      if (parseFloat(getComputedStyle(el).opacity) < .5) gsap.to(el, { opacity: 1, y: 0, x: 0, duration: .6, ease: 'power2.out', clearProps: 'transform' });
    });
  }, 6000);
} else {
  $$('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  const words = $$('.rot-words b');
  if (words.length) { words[0].style.opacity = 1; words[0].style.transform = 'none'; }
}
})();
