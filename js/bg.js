/* ═══ SILK FLOW — full-screen GLSL shader background (pure black + electric flow) ═══ */
(function () {
  if (!window.THREE) return;
  const canvas = document.getElementById('bg3d');
  const isMobile = matchMedia('(max-width:860px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1 : 1.35));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(innerWidth, innerHeight) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uScroll: { value: 0 },
    uIter: { value: isMobile ? 3.0 : 5.0 }
  };

  const frag = `
  precision highp float;
  uniform float uTime; uniform vec2 uRes; uniform vec2 uMouse; uniform float uScroll; uniform float uIter;
  // hash + noise
  vec2 hash22(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return -1.0 + 2.0*fract(sin(p)*43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix(dot(hash22(i+vec2(0.,0.)), f-vec2(0.,0.)), dot(hash22(i+vec2(1.,0.)), f-vec2(1.,0.)), u.x),
                mix(dot(hash22(i+vec2(0.,1.)), f-vec2(0.,1.)), dot(hash22(i+vec2(1.,1.)), f-vec2(1.,1.)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0; float a = 0.55;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (float i = 0.0; i < 6.0; i++){
      if (i >= uIter) break;
      v += a * noise(p);
      p = rot * p * 1.9; a *= 0.55;
    }
    return v;
  }
  void main(){
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    vec2 p = (gl_FragCoord.xy * 2.0 - uRes.xy) / min(uRes.x, uRes.y);
    float t = uTime * 0.055;

    // domain-warped silk
    vec2 q = vec2(fbm(p + t*0.9), fbm(p + vec2(2.7, 9.2) - t*0.7));
    vec2 r = vec2(fbm(p + 2.6*q + vec2(1.7, 9.2) + t*0.55), fbm(p + 2.4*q + vec2(8.3, 2.8) - t*0.4));
    float f = fbm(p + 2.8*r + uScroll*1.4);

    // thin luminous filaments
    float fil = smoothstep(0.42, 0.5, f) * smoothstep(0.58, 0.5, f);

    // palette: black canvas, lime→mint flow
    vec3 lime = vec3(0.71, 1.0, 0.30);
    vec3 mint = vec3(0.30, 1.0, 0.78);
    vec3 deep = vec3(0.04, 0.09, 0.07);

    vec3 col = vec3(0.0);
    float glow = clamp(f*0.5 + 0.5, 0.0, 1.0);
    col += deep * glow * 0.55;                                   // faint nebula body
    col += mix(lime, mint, clamp(q.x*0.5+0.5, 0.0, 1.0)) * fil * 0.55; // silk filaments
    col += mint * pow(clamp(r.y*0.5+0.5, 0.0, 1.0), 6.0) * 0.10;  // sparse hot spots

    // mouse light
    float md = distance(uv, uMouse);
    col += mix(lime, mint, uv.y) * exp(-md*5.5) * 0.05;

    // edge vignette to pure black
    float vig = smoothstep(1.35, 0.35, length(p));
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
  }`;

  const mat = new THREE.ShaderMaterial({
    uniforms, fragmentShader: frag,
    vertexShader: 'void main(){ gl_Position = vec4(position, 1.0); }'
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  let running = true, mx = 0.5, my = 0.5;
  addEventListener('mousemove', e => { mx = e.clientX / innerWidth; my = 1 - e.clientY / innerHeight; }, { passive: true });
  addEventListener('scroll', () => {
    const h = document.documentElement;
    uniforms.uScroll.value = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });
  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    uniforms.uRes.value.set(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  (function frame() {
    requestAnimationFrame(frame);
    if (!running) return;
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uMouse.value.x += (mx - uniforms.uMouse.value.x) * 0.05;
    uniforms.uMouse.value.y += (my - uniforms.uMouse.value.y) * 0.05;
    renderer.render(scene, camera);
  })();
  if (reduced) { running = false; uniforms.uTime.value = 7; renderer.render(scene, camera); }
})();
