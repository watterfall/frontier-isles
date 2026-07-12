// AC3 metric normalization (R7 spec-correction). The raw aniso = eDiag/eAxis is
// geometrically biased: the diagonal difference spans 2√2, the axis 2, so ANY
// smooth field reads ~2.0 (the √2-span energy factor). We calibrate against an
// ISOTROPIC SMOOTH fbm anchor (NOT white noise — white noise reads ~1.0 raw and
// would let a mildly-directional field falsely clear the bar). Normalized aniso =
// raw / anchorRaw, so isotropic smooth fbm reads exactly 1.0 and a directional
// weave reads >1.0. Reports the production grid (verbatim FRAG) and the anchor.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire('/Users/jili/.npm-global/lib/node_modules/x.js');
const { chromium } = require('playwright');
const REPO = '/Users/jili/Documents/GitHub/frontier-isles';

const src = fs.readFileSync(REPO + '/packages/renderer/src/pixi/sea-mesh.ts', 'utf8');
const FRAG_BODY = src.match(/const FRAG =[^`]*`([\s\S]*?)`;/)[1];
const PROD = `#version 300 es\nprecision highp float;\n${FRAG_BODY}`;

// Isotropic SMOOTH fbm anchor: identical scaffold, but the agitation term is a
// zero-mean isotropic fbm (no diagonal structure). Built by swapping ONLY the
// chop expression so the base sea / shore / depth stay identical.
const ANCHOR_BODY = FRAG_BODY.replace(
  /float chopA = [\s\S]*?float chop = [^;]*;/,
  'float chop = (fbm(w * 0.02) - 0.5) * 2.0;', // isotropic, smooth (low-freq, 4-octave)
);
const ANCHOR = `#version 300 es\nprecision highp float;\n${ANCHOR_BODY}`;

const VERT = `#version 300 es\nprecision highp float;\nin vec2 aPosition;in vec2 aUV;uniform vec2 uOrigin;uniform vec2 uSize;out vec2 vUV;out vec2 vWorld;void main(){vec2 clip=(aPosition-uOrigin)/uSize*2.0-1.0;gl_Position=vec4(clip,0.0,1.0);vUV=aUV;vWorld=aPosition;}`;
const W = 300, PXW = 600, SEA = [0.737, 0.808, 0.863], DEEP = [0.651, 0.745, 0.816], FOAM = [0.941, 0.918, 0.847], T = 1.7;

const page = (FRAG) => `<!doctype html><canvas id=c width=${W} height=${W}></canvas><script>
const gl=document.getElementById('c').getContext('webgl2',{preserveDrawingBuffer:true,antialias:false});
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o;}
let prog,loc={};window.__init=function(vs,fs){prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(prog,0,'aPosition');gl.bindAttribLocation(prog,1,'aUV');gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return gl.getProgramInfoLog(prog);gl.useProgram(prog);const x0=-${PXW/2},x1=${PXW/2};const pos=new Float32Array([x0,x0,x1,x0,x1,x1,x0,x0,x1,x1,x0,x1]);const uv=new Float32Array([0,0,1,0,1,1,0,0,1,1,0,1]);let b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,pos,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);let b2=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b2);gl.bufferData(gl.ARRAY_BUFFER,uv,gl.STATIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,2,gl.FLOAT,false,0,0);const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2,2,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(16));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);for(const n of ['uTime','uMaskRect','uAgitation','uDepth','uTide','uSeaColor','uDeepColor','uFoamColor','uShoreMask','uOrigin','uSize'])loc[n]=gl.getUniformLocation(prog,n);gl.uniform1i(loc.uShoreMask,0);gl.uniform2f(loc.uOrigin,-${PXW/2},-${PXW/2});gl.uniform2f(loc.uSize,${PXW},${PXW});gl.uniform4f(loc.uMaskRect,100000,100000,10,10);gl.uniform1f(loc.uTide,0.25);gl.uniform3fv(loc.uSeaColor,${JSON.stringify(SEA)});gl.uniform3fv(loc.uDeepColor,${JSON.stringify(DEEP)});gl.uniform3fv(loc.uFoamColor,${JSON.stringify(FOAM)});gl.viewport(0,0,${W},${W});return 'OK';};
window.__r=function(u,t,d){gl.uniform1f(loc.uAgitation,u);gl.uniform1f(loc.uTime,t);gl.uniform1f(loc.uDepth,d);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);const px=new Uint8Array(${W}*${W}*4);gl.readPixels(0,0,${W},${W},gl.RGBA,gl.UNSIGNED_BYTE,px);let s='';for(let i=0;i<px.length;i++)s+=String.fromCharCode(px[i]);return btoa(s);};</script>`;

const luma = (p, i) => (0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2]) / 255;
function rawAniso(base, img) {
  const D = new Float32Array(W * W);
  for (let k = 0; k < W * W; k++) D[k] = luma(img, k * 4) - luma(base, k * 4);
  let eDiag = 0, eAxis = 0;
  for (let y = 2; y < W - 2; y++) for (let x = 2; x < W - 2; x++) {
    const k = y * W + x;
    const dPP = D[k + W + 1] - D[k - W - 1], dPM = D[k - W + 1] - D[k + W - 1];
    const dH = D[k + 1] - D[k - 1], dV = D[k + W] - D[k - W];
    eDiag += dPP * dPP + dPM * dPM; eAxis += dH * dH + dV * dV;
  }
  return { raw: eDiag / Math.max(1e-9, eAxis), eDiag, eAxis };
}
const b64 = (s) => Buffer.from(s, 'base64');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const measure = async (FRAG, label) => {
    const pg = await browser.newPage();
    await pg.setContent(page(FRAG), { waitUntil: 'load' });
    const ini = await pg.evaluate(([v, f]) => window.__init(v, f), [VERT, FRAG]);
    if (ini !== 'OK') { console.log(label, 'SHADER FAIL:', ini); await pg.close(); return null; }
    const R = async (u) => b64(await pg.evaluate(([u, t, d]) => window.__r(u, t, d), [u, T, 0.5]));
    const base = await R(0), img = await R(1.0);
    await pg.close();
    return rawAniso(base, img);
  };
  const grid = await measure(PROD, 'grid');
  const anchor = await measure(ANCHOR, 'anchor');
  console.log('=== AC3 metric normalization (isotropic SMOOTH fbm anchor) ===');
  console.log('isotropic-fbm anchor  raw aniso =', anchor.raw.toFixed(3), ' → normalized (÷self) = 1.000  [calibration: must read ≈1.0]');
  console.log('production grid weave raw aniso =', grid.raw.toFixed(3), ' → normalized (÷anchor) =', (grid.raw / anchor.raw).toFixed(3));
  console.log('geometric ÷2 check: anchor', (anchor.raw / 2).toFixed(3), '| grid', (grid.raw / 2).toFixed(3));
  console.log('consult line ≥1.20 →', (grid.raw / anchor.raw) >= 1.2 ? 'PASS' : `FAIL (${(grid.raw / anchor.raw).toFixed(3)} < 1.20) — AC9 human eye is the arbiter`);
  await browser.close();
})();
