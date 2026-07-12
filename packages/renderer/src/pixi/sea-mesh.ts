/**
 * Sea-plane water Mesh + GLSL (M2, scene-upgrade). A world-space full-plane Mesh
 * that lives at the bottom of the world stack (SceneStage.seaLayer) so it pans and
 * zooms with the camera and its wave pattern stays world-stable.
 *
 * Shader logic (rewritten from the reference project's approach, not copied):
 *  - wave shimmer: layered fbm noise + a scrolling glint, animated by uTime.
 *  - shore foam: a coastline mask texture (land = alpha 1) is ring-sampled; a
 *    sea pixel adjacent to land gets an animated foam band (the §5 binding:
 *    foam = coastline geometry, a reduction over terrain, no new verb).
 *  - agitation: contention as a zero-mean surface chop weave for "disputed seas"
 *    (R7 Dim 2; uAgitation uniform, driven by claim contention). Reads off the
 *    lightness axis — it perturbs the surface, never the mean luminance.
 *
 * Engine-agnostic seam: geometry is in world-screen coords (same space as
 * iso.worldToScreen), so the layout/camera own placement; the shader owns paint.
 */
import { Mesh, MeshGeometry, Shader, type Texture } from 'pixi.js';

/** A sea Mesh carrying a custom (non-texture) Shader. */
export type SeaMeshObject = Mesh<MeshGeometry, Shader>;

/** A world-screen rectangle. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SeaMeshOptions {
  /** The quad's world-screen rect (island bounds + open-sea margin). */
  rect: Rect;
  /** World-screen rect the shore mask covers `[x, y, w, h]`. */
  maskRect: [number, number, number, number];
  /** Coastline mask (land = alpha 1, sea = 0). */
  mask: Texture;
  /** Shallow water colour (0..1 rgb). */
  seaColor: [number, number, number];
  /** Deep water colour (0..1 rgb). */
  deepColor: [number, number, number];
  /** Foam colour (0..1 rgb). */
  foamColor: [number, number, number];
  /** Sea-depth darkening alpha = domain abstractness (seaDepthAt().overlayAlpha, 0..0.42). */
  depthAlpha?: number;
  /** Tide N = A − D, normalised 0..1 → shore-ripple amplitude/density (0 = calm ebb). */
  tide?: number;
}

export interface SeaMesh {
  mesh: SeaMeshObject;
  shader: Shader;
}

const VERT = /* glsl */ `
in vec2 aPosition;
in vec2 aUV;
out vec2 vUV;
out vec2 vWorld;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;

void main() {
  mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
  gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
  vUV = aUV;
  vWorld = aPosition;
}
`;

const FRAG = /* glsl */ `
in vec2 vUV;
in vec2 vWorld;
out vec4 finalColor;

uniform float uTime;
uniform vec4 uMaskRect;      // x, y, w, h (world-screen)
uniform float uAgitation;    // 0 = calm, >0 = disputed-sea contention as surface chop
uniform float uDepth;        // sea darkness = domain abstractness (depth-plan-v2 §4); 0..~0.42
uniform float uTide;         // tide N = A − D, normalised 0..1: shore-ripple amplitude/density
uniform vec3 uSeaColor;
uniform vec3 uDeepColor;
uniform vec3 uFoamColor;
uniform sampler2D uShoreMask;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

// Land coverage at a world point (0 = open sea, 1 = land), from the shore mask.
float landAt(vec2 world) {
  vec2 uv = (world - uMaskRect.xy) / uMaskRect.zw;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  return texture(uShoreMask, uv).a;
}

void main() {
  vec2 w = vWorld;
  float here = landAt(w);

  // Calm pale-water surface (design-system: a warm-paper field, NOT photographic
  // ocean). Gentle, low-contrast mottling + faint paper grain — no glint streaks.
  float body = fbm(w * 0.006 + vec2(uTime * 0.015, uTime * 0.01));
  vec3 col = mix(uSeaColor, uDeepColor, smoothstep(0.42, 0.66, body) * 0.5);
  float grain = noise(w * 0.9);
  col += (grain - 0.5) * 0.015;

  // Offshore depth gradient (invariant 16: sea depth = abstractness). Radial from
  // the island's centre: water hugging the coast stays on the bright shallow shelf,
  // water further out sinks toward uDeepColor. The gradient's REACH scales with
  // uDepth — an abstract/theoretical island (deep 水深) drops off fast into dark
  // open sea, an applied one keeps a wide bright shelf. No new hue, only the
  // shallow↔deep channel the palette already carries.
  vec2 center = uMaskRect.xy + uMaskRect.zw * 0.5;
  float islR = 0.5 * max(uMaskRect.z, uMaskRect.w);
  float radial = clamp(distance(w, center) / max(1.0, islR * 1.9), 0.0, 1.0);
  col = mix(col, uDeepColor, smoothstep(0.0, 1.0, radial) * (0.28 + 0.55 * uDepth) * (1.0 - here));

  // Soft shore halo: a gentle warm band where sea meets land (foam = coastline
  // geometry, §5 binding). Its amplitude/density bind to tide N (A − D, uTide):
  // a flood tide (high abduction) runs a livelier lapping ring, an ebb tide
  // (settled/validated) barely ripples. Quiet baseline, never a bright surf line.
  float near = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = float(i) / 8.0 * 6.2831;
    near = max(near, landAt(w + vec2(cos(a), sin(a)) * 14.0));
  }
  float coast = near * (1.0 - here);
  float band = smoothstep(0.15, 0.6, coast);
  float lap = 0.78 + (0.14 + 0.16 * uTide) * sin(uTime * 0.8 + (w.x + w.y) * 0.04);
  float foamStrength = 0.24 + 0.20 * uTide;
  col = mix(col, uFoamColor, band * lap * foamStrength);
  // A tighter second ripple ring whose density/visibility rise with the tide —
  // present only when the tide actually runs (uTide → 0 ⇒ this term vanishes).
  float ripple = smoothstep(0.25, 0.7, coast) * (0.5 + 0.5 * sin((w.x + w.y) * 0.09 - uTime * 1.4));
  col = mix(col, uFoamColor, ripple * band * 0.14 * uTide);

  // Sea depth = domain abstractness (depth-plan-v2 §4, invariant 14): a formal/
  // theoretical island floats over darker deep water, an applied one over a bright
  // shallow shelf. uDepth is seaDepthAt(substrate).overlayAlpha — a darkening only,
  // never a new hue, and independent of the domain-hue channel above.
  col *= (1.0 - uDepth);

  // Agitation: contention as SURFACE CHOP, not a darkening (R7 Dim 2). Disputed
  // seas get a cross-hatched chop weave that rides the water's own shallow-to-deep
  // colour swing, so it reads as "agitated water" off the lightness axis: it is
  // zero-mean in framebuffer (sRGB) values; the linear-luminance drift from sRGB
  // convexity is <= 0.6% (sub-JND). The retired darkening wrote lightness directly
  // (mix toward col*0.5). Two crossed sine trains (incommensurable frequencies,
  // opposed drifts) make an anisotropic +/-45deg weave; an anisotropic noise
  // (stretched ~9:1 ALONG the weave) modulates amplitude without scattering the
  // direction; an fbm zone mask concentrates it in patches whose lower edge opens
  // with uAgitation. shoreExcl (Gen-D) hard-excludes the coastal band so shore foam
  // stays clean; open keeps it off land. Zero-preservation (AC5): the
  // uAgitation > 0.001 guard AND the (3.5 * uAgitation) factor both make u=0
  // pixel-identical to no agitation.
  // NB: patch is a GLSL ES 3.0 reserved word — never name a variable that.
  if (uAgitation > 0.001) {
    float open = 1.0 - here;
    float shoreExcl = 1.0 - smoothstep(0.05, 0.30, coast); // coastal band → agitation 0
    float zone = smoothstep(0.46 - 0.08 * uAgitation, 0.74, fbm(w * 0.006 - vec2(uTime * 0.045, uTime * 0.03)));
    float chopA = sin((w.x + w.y) * 0.095 - uTime * 1.15);
    float chopB = sin((w.x - w.y) * 0.078 + uTime * 0.95);
    float chop = chopA * chopB * (0.68 + 0.32 * noise(vec2((w.x + w.y) * 0.05, (w.x - w.y) * 0.0055)));
    col += (uSeaColor - uDeepColor) * chop * (3.5 * uAgitation) * zone * shoreExcl * open;
  }

  finalColor = vec4(col, 1.0);
}
`;

/** Build the sea Mesh + its Shader for one island. */
export function createSeaMesh(opts: SeaMeshOptions): SeaMesh {
  const { rect, maskRect, mask, seaColor, deepColor, foamColor, depthAlpha = 0, tide = 0 } = opts;
  const x0 = rect.x;
  const y0 = rect.y;
  const x1 = rect.x + rect.w;
  const y1 = rect.y + rect.h;

  const geometry = new MeshGeometry({
    positions: new Float32Array([x0, y0, x1, y0, x1, y1, x0, y1]),
    uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
    indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
  });

  const shader = Shader.from({
    gl: { vertex: VERT, fragment: FRAG },
    resources: {
      waveUniforms: {
        uTime: { value: 0, type: 'f32' },
        uMaskRect: { value: new Float32Array(maskRect), type: 'vec4<f32>' },
        uAgitation: { value: 0, type: 'f32' },
        uDepth: { value: depthAlpha, type: 'f32' },
        uTide: { value: Math.max(0, Math.min(1, tide)), type: 'f32' },
        uSeaColor: { value: new Float32Array(seaColor), type: 'vec3<f32>' },
        uDeepColor: { value: new Float32Array(deepColor), type: 'vec3<f32>' },
        uFoamColor: { value: new Float32Array(foamColor), type: 'vec3<f32>' },
      },
      uShoreMask: mask.source,
    },
  });

  const mesh = new Mesh({ geometry, shader });
  mesh.label = 'sea';
  return { mesh, shader };
}
