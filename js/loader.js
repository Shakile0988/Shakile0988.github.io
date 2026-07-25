/* ═══ MEDIA LOADER — transparently serves binaries pushed as .b64 text ═══ */
window.MEDIA = (function () {
  const cache = new Map();
  const MIME = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', mp4: 'video/mp4', svg: 'image/svg+xml' };
  const B64 = !!window.B64_MODE;

  function toBlobUrl(t, ext) {
    const clean = t.replace(/[\r\n]/g, '');
    const bin = atob(clean);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([u8], { type: MIME[ext] || 'application/octet-stream' }));
  }

  function url(path) {
    if (cache.has(path)) return cache.get(path);
    let p;
    if (!B64) {
      p = Promise.resolve(path);
    } else {
      const ext = path.split('.').pop().toLowerCase();
      p = fetch(path + '.b64')
        .then(r => { if (!r.ok) throw new Error('nob64'); return r.text(); })
        .then(t => toBlobUrl(t, ext))
        .catch(() => path);
    }
    cache.set(path, p);
    return p;
  }

  /* hydrate: resolve every [data-media] under root; imgs get src, videos get src, [data-poster] gets poster */
  function hydrate(root) {
    (root || document).querySelectorAll('[data-media]').forEach(el => {
      const path = el.getAttribute('data-media');
      el.removeAttribute('data-media');
      url(path).then(u => { el.src = u; });
    });
    (root || document).querySelectorAll('[data-poster]').forEach(el => {
      const path = el.getAttribute('data-poster');
      el.removeAttribute('data-poster');
      url(path).then(u => { el.poster = u; });
    });
  }
  return { url, hydrate };
})();
