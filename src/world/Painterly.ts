import * as THREE from 'three';

/**
 * Xuan Paper look for the 3D house: the scene is rendered once for color and once for normals/depth,
 * then composed as a watercolor on rice paper: soft value bands, pigment granulation, wet edges,
 * hand-wobbled ink outlines, paper fibre, and margins that dissolve into the page like the entrance painting.
 * Models, lights and interaction stay untouched; `enabled = false` falls back to the original renderer path.
 */
export class PainterlyRenderer {
  enabled = true;
  private color: THREE.WebGLRenderTarget;
  private normals: THREE.WebGLRenderTarget;
  private normalMaterial = new THREE.MeshNormalMaterial();
  private quad: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private quadScene = new THREE.Scene();
  private quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private hidden: THREE.Object3D[] = [];
  private paper = new THREE.Color();

  constructor(private renderer: THREE.WebGLRenderer, private lowQuality = false) {
    this.color = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: lowQuality ? 0 : 4 });
    this.normals = new THREE.WebGLRenderTarget(1, 1, { depthTexture: new THREE.DepthTexture(1, 1) });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: {
        tColor: { value: this.color.texture }, tNormal: { value: this.normals.texture }, tDepth: { value: this.normals.depthTexture },
        uTexel: { value: new THREE.Vector2() }, uLine: { value: 1 }, uAspect: { value: 1 },
        uPaper: { value: new THREE.Color() }, uBackground: { value: new THREE.Color() },
        uInk: { value: new THREE.Color('#3a2a1f') }, uShadowTint: { value: new THREE.Color('#b9967a') },
        uExposure: { value: 1.15 }, uNight: { value: 0 }, uDensity: { value: 1 },
      },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader: FRAGMENT, depthTest: false, depthWrite: false, toneMapped: false,
    }));
    this.quad.frustumCulled = false; this.quadScene.add(this.quad);
  }

  setSize(width: number, height: number) {
    const ratio = this.renderer.getPixelRatio(), w = Math.round(width * ratio), h = Math.round(height * ratio);
    this.color.setSize(w, h);
    // Lines come from the normal/depth pass; on dense phone screens a lighter pass keeps them soft and cheap.
    const scale = this.lowQuality && ratio > 1.3 ? .65 : 1;
    this.normals.setSize(Math.round(w * scale), Math.round(h * scale));
    const u = this.quad.material.uniforms;
    u.uTexel.value.set(1 / this.normals.width, 1 / this.normals.height);
    u.uLine.value = Math.max(1, ratio * scale * .8); u.uAspect.value = width / height;
    // A small diorama (phones) gets lighter ink and finer grain so details do not clot.
    u.uDensity.value = THREE.MathUtils.clamp(Math.min(width, height * 1.3) / 900, .45, 1);
  }

  render(scene: THREE.Scene, camera: THREE.Camera, night: number) {
    if (!this.enabled) { this.renderer.render(scene, camera); return; }
    const renderer = this.renderer, u = this.quad.material.uniforms;
    const background = scene.background instanceof THREE.Color ? scene.background : this.paper.set('#f6f2e9');
    u.uBackground.value.copy(background); u.uPaper.value.copy(background).convertLinearToSRGB(); u.uNight.value = night;

    renderer.setRenderTarget(this.color); renderer.render(scene, camera);

    // Normals and depth only for solid geometry: glass, particles, halos and the shadow catcher stay out of the lines.
    this.hidden.length = 0;
    scene.traverseVisible(object => {
      const material = (object as THREE.Mesh).material as THREE.Material | undefined;
      const soft = object instanceof THREE.Points || object instanceof THREE.Line || object instanceof THREE.Sprite
        || object.userData.noInk || (material && !Array.isArray(material) && (material instanceof THREE.ShadowMaterial || (material.transparent && material.opacity < .6)));
      if (soft) this.hidden.push(object);
    });
    this.hidden.forEach(object => { object.visible = false; });
    const savedBackground = scene.background, savedClear = renderer.getClearAlpha();
    scene.background = null; scene.overrideMaterial = this.normalMaterial;
    // Shadows were already rendered for the color pass; skip re-rendering the shadow map here.
    const shadows = renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate = false;
    renderer.setClearAlpha(0); renderer.setRenderTarget(this.normals); renderer.clear(); renderer.render(scene, camera);
    renderer.shadowMap.autoUpdate = shadows; scene.overrideMaterial = null; scene.background = savedBackground; renderer.setClearAlpha(savedClear);
    this.hidden.forEach(object => { object.visible = true; });

    renderer.setRenderTarget(null); renderer.render(this.quadScene, this.quadCamera);
  }

  dispose() {
    this.color.dispose(); this.normals.dispose(); this.normals.depthTexture?.dispose();
    this.normalMaterial.dispose(); this.quad.geometry.dispose(); this.quad.material.dispose();
  }
}

/** Soft additive glows around the paper lanterns, following each lamp's light intensity. */
export class LanternHalos {
  readonly group = new THREE.Group();
  private sprites: { sprite: THREE.Sprite; light: THREE.PointLight }[] = [];
  constructor(lamps: THREE.PointLight[]) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!, glow = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    glow.addColorStop(0, 'rgba(255,226,170,.9)'); glow.addColorStop(.35, 'rgba(255,205,140,.35)'); glow.addColorStop(1, 'rgba(255,190,120,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 128, 128);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    for (const light of lamps) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
      sprite.userData.ignoreRaycast = true; sprite.renderOrder = 5; this.group.add(sprite);
      this.sprites.push({ sprite, light });
    }
    this.group.userData.ignoreRaycast = true;
  }
  update() {
    for (const { sprite, light } of this.sprites) {
      light.getWorldPosition(sprite.position); sprite.position.y += .12;
      const strength = THREE.MathUtils.clamp(light.intensity / 3.4, 0, 1);
      sprite.material.opacity = strength * .75; sprite.scale.setScalar(.9 + strength * .7);
    }
  }
}

/** Light through the moon window: a projected lattice that lands on the floor, warm at dusk, cool by moonlight. */
export class WindowLight {
  readonly light = new THREE.SpotLight('#ffd7a0', 0, 0, .19, 0, 2);
  private target = { day: 0, golden: 0, night: 0 } as Record<'day' | 'golden' | 'night', number>;
  private color = new THREE.Color();
  constructor(scene: THREE.Scene) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 256, 256);
    ctx.filter = 'blur(4px)'; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(128, 128, 104, 0, Math.PI * 2); ctx.fill();
    // Bars match the real window: three uprights and one rail slightly below center.
    ctx.fillStyle = '#000';
    for (const x of [-.45, 0, .45]) ctx.fillRect(128 + x * 104 - 7, 0, 14, 256);
    ctx.fillRect(0, 128 + .12 * 104 - 7, 256, 14);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    this.light.map = map;
    // Aimed through the window center (.7, 2.42, -3.32) so the lattice lands on the rug.
    this.light.position.set(.52, 4.42, -6.58);
    this.light.target.position.set(.9, .2, .3);
    scene.add(this.light, this.light.target);
    this.target = { day: 380, golden: 1100, night: 260 };
  }
  setEnabled(enabled: boolean) { this.light.visible = enabled; }
  update(mode: 'day' | 'golden' | 'night', dt: number, rain: boolean) {
    const blend = 1 - Math.exp(-dt * 1.4);
    const goal = this.target[mode] * (rain ? .2 : 1);
    this.light.intensity = THREE.MathUtils.lerp(this.light.intensity, goal, blend);
    this.light.color.lerp(this.color.set(mode === 'golden' ? '#ffc58a' : mode === 'night' ? '#a9bfdc' : '#fff1d6'), blend);
  }
}

const FRAGMENT = /* glsl */`
uniform sampler2D tColor, tNormal, tDepth;
uniform vec2 uTexel; uniform float uLine, uAspect, uExposure, uNight, uDensity;
uniform vec3 uPaper, uBackground, uInk, uShadowTint;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0., a = .5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= .5; } return v; }

// Three.js ACES filmic fit, so painterly output keeps the original exposure and tone curve.
vec3 RRTAndODTFit(vec3 v) { vec3 a = v * (v + .0245786) - .000090537; vec3 b = v * (.983729 * v + .4329510) + .238081; return a / b; }
vec3 aces(vec3 color) {
  const mat3 i = mat3(vec3(.59719, .07600, .02840), vec3(.35458, .90834, .13383), vec3(.04823, .01566, .83777));
  const mat3 o = mat3(vec3(1.60475, -.10208, -.00327), vec3(-.53108, 1.10813, -.07276), vec3(-.07367, -.00605, 1.07602));
  color *= uExposure / .6; color = i * color; color = RRTAndODTFit(color); color = o * color; return clamp(color, 0., 1.);
}
vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }

float depthAt(vec2 uv) { return texture2D(tDepth, uv).r; }
float edgeAt(vec2 uv, float width) {
  vec2 t = uTexel * width;
  vec4 c = texture2D(tNormal, uv);
  vec4 l = texture2D(tNormal, uv - vec2(t.x, 0.)), r = texture2D(tNormal, uv + vec2(t.x, 0.));
  vec4 d = texture2D(tNormal, uv - vec2(0., t.y)), u = texture2D(tNormal, uv + vec2(0., t.y));
  float normalEdge = length(l.rgb - c.rgb) + length(r.rgb - c.rgb) + length(d.rgb - c.rgb) + length(u.rgb - c.rgb);
  float silhouette = abs(l.a + r.a + d.a + u.a - 4. * c.a);
  float z = depthAt(uv);
  float depthEdge = abs(depthAt(uv - vec2(t.x, 0.)) + depthAt(uv + vec2(t.x, 0.)) + depthAt(uv - vec2(0., t.y)) + depthAt(uv + vec2(0., t.y)) - 4. * z) * 100.;
  return clamp(max(max(smoothstep(.45, 1.1, normalEdge), smoothstep(.05, .16, depthEdge)), silhouette), 0., 1.);
}

void main() {
  vec2 px = gl_FragCoord.xy;
  // A slow, hand-drawn wobble: lines drift a fraction of a pixel along the paper.
  vec2 wobble = (vec2(noise(px * .018), noise(px * .018 + 31.7)) - .5) * uTexel * 2.2;
  float ink = edgeAt(vUv + wobble, uLine);
  ink *= .55 + .45 * smoothstep(.25, .75, noise(px * .045 + 9.)); // broken, dry-brush strokes
  float wet = edgeAt(vUv, uLine * 3.5);

  vec3 linear = texture2D(tColor, vUv).rgb;
  float mask = texture2D(tNormal, vUv).a;
  vec3 color = toSRGB(aces(linear));

  // Watercolor values: soft bands instead of plastic gradients, and a gentle pull toward paper warmth.
  float luma = dot(color, vec3(.299, .587, .114));
  float steps = 4.5, level = luma * steps;
  float banded = (floor(level) + smoothstep(.3, .7, fract(level))) / steps;
  color *= mix(1., banded / max(luma, .001), .5);
  color = mix(color, color * (uPaper * .35 + .65), .35 * (1. - uNight));
  float granulation = fbm(px * .03) - .5;
  color *= 1. + granulation * .12 * uDensity - wet * .07 * uDensity;

  // Background and cast shadow: plain paper, darkened with a warm wash where the room's shadow falls.
  float shade = clamp(dot(linear, vec3(.2126, .7152, .0722)) / max(dot(uBackground, vec3(.2126, .7152, .0722)), .001), 0., 1.);
  vec3 page = uPaper * mix(vec3(1.), uShadowTint / max(uPaper, vec3(.001)) * .92, (1. - shade) * (1. - uNight * .6));
  page = mix(uPaper, page, smoothstep(.0, .25, 1. - shade));
  color = mix(page, color, mask);

  color = mix(color, uInk * (1. + uNight * 1.6), ink * mix(.8, .55, uNight) * mix(.55, 1., uDensity));

  // Paper fibre and tooth over everything, like the entrance painting.
  float fibre = fbm(px * vec2(.35, .12)) * .5 + fbm(px * .7) * .3 + fbm(px * .05) * .2;
  color *= 1. - (fibre - .5) * mix(.045, .08, uNight);

  // Margins dissolve into the page with a ragged, brushed edge.
  vec2 centered = (vUv - .5) * vec2(uAspect, 1.);
  float ragged = (fbm(vUv * 7.) - .5) * .22;
  float bleed = smoothstep(.55, .92, length(centered * vec2(.82, 1.)) + ragged);
  color = mix(color, uPaper, bleed * .9);

  gl_FragColor = vec4(color, 1.);
}
`;
