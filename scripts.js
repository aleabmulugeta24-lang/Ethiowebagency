// --- SHADERS (Extracted from HTML) ---
const vertexShaderSource = `
  uniform float uTime; uniform float uDistortion; uniform float uSize; uniform vec2 uMouse; varying float vAlpha; varying vec3 vPos; varying float vNoise;
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); } vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; } float snoise(vec3 v) { const vec2 C = vec2(1.0/6.0, 1.0/3.0) ; const vec4 D = vec4(0.0, 0.5, 1.0, 2.0); vec3 i = floor(v + dot(v, C.yyy) ); vec3 x0 = v - i + dot(i, C.xxx) ; vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min( g.xyz, l.zxy ); vec3 i2 = max( g.xyz, l.zxy ); vec3 x1 = x0 - i1 + 1.0 * C.xxx; vec3 x2 = x0 - i2 + 2.0 * C.xxx; vec3 x3 = x0 - 1.0 + 3.0 * C.xxx; i = mod289(i); vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 )); float n_ = 1.0/7.0; vec3 ns = n_ * D.wyz - D.xzx; vec4 j = p - 49.0 * floor(p * ns.z *ns.z); vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_ ); vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4( x.xy, y.xy ); vec4 b1 = vec4( x.zw, y.zw ); vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0)); vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ; vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w); vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3))); p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w; vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m; return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) ); }
  void main() { vec3 pos = position; float noiseFreq = 0.5; float noiseAmp = uDistortion; float noise = snoise(vec3(pos.x * noiseFreq + uTime * 0.1, pos.y * noiseFreq, pos.z * noiseFreq)); vNoise = noise; vec3 newPos = pos + (normalize(pos) * noise * noiseAmp); float dist = distance(uMouse * 10.0, newPos.xy); float interaction = smoothstep(5.0, 0.0, dist); newPos += normalize(pos) * interaction * 0.5; vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0); gl_Position = projectionMatrix * mvPosition; gl_PointSize = uSize * (24.0 / -mvPosition.z) * (1.0 + noise * 0.5); vAlpha = 1.0; vPos = newPos; }
`;

const fragmentShaderSource = `
  uniform vec3 uColor; uniform float uOpacity; varying float vNoise; varying vec3 vPos;
  void main() { vec2 center = gl_PointCoord - vec2(0.5); float dist = length(center); if (dist > 0.5) discard; float alpha = smoothstep(0.5, 0.2, dist) * uOpacity; vec3 darkColor = uColor * 0.5; vec3 lightColor = uColor * 1.8; vec3 finalColor = mix(darkColor, lightColor, vNoise * 0.5 + 0.5); gl_FragColor = vec4(finalColor, alpha); }
`;

// --- THEME ---
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  // Update Particles
  if(typeof uniforms !== 'undefined') {
      if(isDark) {
          uniforms.uColor.value.set('#10b981');
          uniforms.uOpacity.value = 0.8; 
      } else {
          uniforms.uColor.value.set('#047857');
          uniforms.uOpacity.value = 0.8;
      }
  }
}

// --- SCROLL ANIMATIONS (Intersection Observer) ---
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    if (!el.classList.contains('is-visible')) {
        observer.observe(el);
    }
  });
}

// --- SCROLL TO TOP ---
const scrollBtn = document.getElementById('scrollToTopBtn');
if (scrollBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.remove('translate-y-20', 'opacity-0');
    } else {
      scrollBtn.classList.add('translate-y-20', 'opacity-0');
    }
  });
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --- THREE.JS BACKGROUND ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
if (container) {
  container.appendChild(renderer.domElement);
}

const systemsGroup = new THREE.Group();
systemsGroup.position.x = 4.5;
scene.add(systemsGroup);

const geometry = new THREE.IcosahedronGeometry(4.5, 40); 
const uniforms = {
  uTime: { value: 0 },
  uDistortion: { value: 0.6 }, 
  uSize: { value: 3.5 },
  uColor: { value: new THREE.Color('#10b981') }, 
  uOpacity: { value: 0.8 }, 
  uMouse: { value: new THREE.Vector2(0, 0) }
};

const material = new THREE.ShaderMaterial({
  vertexShader: vertexShaderSource,
  fragmentShader: fragmentShaderSource,
  uniforms: uniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending 
});
const particles = new THREE.Points(geometry, material);
systemsGroup.add(particles);

let time = 0;

// Mouse interaction
let targetMouseX = 0;
let targetMouseY = 0;

document.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
  targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateScenePosition();
});

function updateScenePosition() {
  if(window.innerWidth < 768) {
    systemsGroup.position.set(0, 2, -8);
    systemsGroup.scale.set(0.8, 0.8, 0.8);
  } else {
    systemsGroup.position.set(5.5, 0, 0);
    systemsGroup.scale.set(1.2, 1.2, 1.2); 
  }
}
updateScenePosition();

function animate() {
  requestAnimationFrame(animate);
  time += 0.005; 
  
  // Smoother interpolation for rotation
  systemsGroup.rotation.y += 0.001;
  systemsGroup.rotation.z += 0.0005;
  
  // Smooth mouse damping
  uniforms.uMouse.value.x += (targetMouseX - uniforms.uMouse.value.x) * 0.05;
  uniforms.uMouse.value.y += (targetMouseY - uniforms.uMouse.value.y) * 0.05;

  uniforms.uTime.value = time;
  renderer.render(scene, camera);
}
animate();

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  if (localStorage.theme === 'light') {
    document.documentElement.classList.remove('dark');
    uniforms.uColor.value.set('#047857');
  }
  initScrollAnimations();
});