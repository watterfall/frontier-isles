// INDEPENDENT AC cross-check. Extracts the VERBATIM production FRAG from
// sea-mesh.ts (not the harness's transcription), renders it in real WebGL2 with
// PRODUCTION uniform names (uAgitation/uSeaColor/uDeepColor/uShoreMask), open sea
// (all-zero shore mask), and computes the AC metrics with MY OWN code — to rule
// out both transcription drift and harness metric bugs (esp. AC7's Infinity).
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire('/Users/jili/.npm-global/lib/node_modules/x.js');
const { chromium } = require('playwright');

const REPO = '/Users/jili/Documents/GitHub/frontier-isles';
const src = fs.readFileSync(REPO + '/packages/renderer/src/pixi/sea-mesh.ts', 'utf8');
const fm = src.match(/const FRAG =[^`]*`([\s\S]*?)`;/);
if (!fm) { console.error('FRAG_EXTRACT_FAIL'); process.exit(2); }
const FRAG_BODY = fm[1];
// verbatim agitation lines present?
const agiOK = /col \+= \(uSeaColor - uDeepColor\) \* chop \* \(3\.0 \* uAgitation\)/.test(FRAG_BODY);
console.log('verbatim production FRAG extracted:', FRAG_BODY.length, 'chars; agitation line present:', agiOK);

const FRAG_FULL = `#version 300 es
precision highp float;
${FRAG_BODY}`;
// Harness world convention: w = (fragcoord - 0.5*uRes)*2  → 2 world units/px, 300px → world[-300,300].
const VERT_FULL = `#version 300 es
precision highp float;
in vec2 aPosition; in vec2 aUV;
uniform vec2 uOrigin; uniform vec2 uSize;
out vec2 vUV; out vec2 vWorld;
void main(){
  vec2 clip=(aPosition-uOrigin)/uSize*2.0-1.0;
  gl_Position=vec4(clip,0.0,1.0); vUV=aUV; vWorld=aPosition;
}`;
const W=300, PXW=600; // 300px, 600 world units => 2 u/px (match harness)
const SEA=[0.737,0.808,0.863], DEEP=[0.651,0.745,0.816], FOAM=[0.941,0.918,0.847];
const T=1.7, TIDE=0.25;

const PAGE = `<!doctype html><canvas id=c width=${W} height=${W}></canvas><script>
const gl=document.getElementById('c').getContext('webgl2',{preserveDrawingBuffer:true,antialias:false});
window.__glok=!!gl;
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);
 if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){window.__err='sh:'+gl.getShaderInfoLog(o);throw 0;}return o;}
let prog,loc={};
window.__init=function(vs,fs){try{
 prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));
 gl.bindAttribLocation(prog,0,'aPosition');gl.bindAttribLocation(prog,1,'aUV');gl.linkProgram(prog);
 if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){window.__err='link:'+gl.getProgramInfoLog(prog);return 'ERR';}
 gl.useProgram(prog);
 const x0=-${PXW/2},y0=-${PXW/2},x1=${PXW/2},y1=${PXW/2};
 const pos=new Float32Array([x0,y0,x1,y0,x1,y1,x0,y0,x1,y1,x0,y1]);
 const uv=new Float32Array([0,0,1,0,1,1,0,0,1,1,0,1]);
 let b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,pos,gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 let b2=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b2);gl.bufferData(gl.ARRAY_BUFFER,uv,gl.STATIC_DRAW);
 gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,2,gl.FLOAT,false,0,0);
 // zero shore mask => open sea everywhere (here=0, coast=0, band=0)
 const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2,2,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(16));
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 for(const n of ['uTime','uMaskRect','uAgitation','uDepth','uTide','uSeaColor','uDeepColor','uFoamColor','uShoreMask','uOrigin','uSize'])loc[n]=gl.getUniformLocation(prog,n);
 gl.uniform1i(loc.uShoreMask,0);
 gl.uniform2f(loc.uOrigin,-${PXW/2},-${PXW/2});gl.uniform2f(loc.uSize,${PXW},${PXW});
 gl.uniform4f(loc.uMaskRect,100000,100000,10,10); // island far away => uniform open sea, radial~1
 gl.uniform1f(loc.uTide,${TIDE});
 gl.uniform3fv(loc.uSeaColor,${JSON.stringify(SEA)});gl.uniform3fv(loc.uDeepColor,${JSON.stringify(DEEP)});gl.uniform3fv(loc.uFoamColor,${JSON.stringify(FOAM)});
 gl.viewport(0,0,${W},${W});return 'OK';
}catch(e){return String(window.__err||e);}};
window.__render=function(u,t,depth){
 gl.uniform1f(loc.uAgitation,u);gl.uniform1f(loc.uTime,t);gl.uniform1f(loc.uDepth,depth);
 gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);
 const px=new Uint8Array(${W}*${W}*4);gl.readPixels(0,0,${W},${W},gl.RGBA,gl.UNSIGNED_BYTE,px);
 let bin='';for(let i=0;i<px.length;i++)bin+=String.fromCharCode(px[i]);return btoa(bin);
};</script>`;

const luma=(p,i)=>(0.2126*p[i]+0.7152*p[i+1]+0.0722*p[i+2])/255;
function metrics(base,img){
  const N=W*W; let sumL=0,sumL0=0,sumL2=0,sumL0_2=0,cover=0,maxAbsD=0;
  const D=new Float32Array(N);
  for(let k=0;k<N;k++){const i=k*4;const L=luma(img,i),L0=luma(base,i),d=L-L0;
    D[k]=d; sumL+=L;sumL0+=L0;sumL2+=L*L;sumL0_2+=L0*L0;
    if(Math.abs(d)>maxAbsD)maxAbsD=Math.abs(d); if(Math.abs(d)>0.02)cover++;}
  const meanL=sumL/N,meanL0=sumL0/N;
  const rms=Math.sqrt(Math.max(0,sumL2/N-meanL*meanL)), rms0=Math.sqrt(Math.max(0,sumL0_2/N-meanL0*meanL0));
  let eDiag=0,eAxis=0;
  for(let y=2;y<W-2;y++)for(let x=2;x<W-2;x++){const k=y*W+x;
    const dPP=D[k+W+1]-D[k-W-1], dPM=D[k-W+1]-D[k+W-1], dH=D[k+1]-D[k-1], dV=D[k+W]-D[k-W];
    eDiag+=dPP*dPP+dPM*dPM; eAxis+=dH*dH+dV*dV;}
  // R7 spec-correction: the diagonal difference spans 2√2, the axis 2, so the raw
  // eDiag/eAxis carries a √2-span energy bias (~2x) — ANY smooth field reads ~2.
  // Normalize eDiag by that factor (÷2) so isotropic smooth fbm reads ~0.9-1.0.
  // The anchor-normalized ratio (grid ÷ isotropic-fbm anchor ≈ 1.09, consult ≥1.20)
  // is computed in metric-norm.mjs; AC9 (human) is the real arbiter.
  return {coverage:100*cover/N, meanShiftPct:100*(meanL-meanL0)/meanL0, rmsRatio:rms/Math.max(1e-6,rms0),
    aniso:(eDiag/2)/Math.max(1e-9,eAxis), maxAbsDelta:maxAbsD};
}
function b64(s){return Buffer.from(s,'base64');}

(async()=>{
  const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist']});
  const page=await browser.newPage(); const perr=[]; page.on('pageerror',e=>perr.push(String(e)));
  await page.setContent(PAGE,{waitUntil:'load'});
  if(!await page.evaluate(()=>window.__glok)){console.log('BLOCKED: no WebGL2');await browser.close();process.exit(4);}
  const ini=await page.evaluate(([v,f])=>window.__init(v,f),[VERT_FULL,FRAG_FULL]);
  console.log('production shader compile+link:',ini);
  if(ini!=='OK'){console.log('BLOCKED: production shader failed:',ini);await browser.close();process.exit(5);}
  const R=async(u,t,d)=>b64(await page.evaluate(([u,t,d])=>window.__render(u,t,d),[u,t,d]));

  // Primary sweep @ depth=0.5, t=1.7 (match harness)
  const base=await R(0,T,0.5);
  console.log('\n=== INDEPENDENT (verbatim production FRAG, my metrics) @depth0.5 t1.7 ===');
  console.log('u    | cov%   | meanΔ% | rmsRatio | aniso | maxΔ');
  const rows={};
  for(const u of [0,0.6,0.8,1.0]){const m=metrics(base,await R(u,T,0.5)); rows[u]=m;
    console.log(`${u.toFixed(2)} | ${m.coverage.toFixed(2).padStart(6)} | ${m.meanShiftPct.toFixed(2).padStart(6)} | ${m.rmsRatio.toFixed(2).padStart(7)} | ${m.aniso.toFixed(2).padStart(5)} | ${m.maxAbsDelta.toFixed(4)}`);}

  // AC5 byte-identical: u=0 vs a second u=0 render
  const base2=await R(0,T,0.5);
  console.log('AC5 u=0 byte-identical:', Buffer.compare(base,base2)===0);

  // AC7 done PROPERLY: agitation coverage(|d|>0.02) & aniso at u=0.6 across depths.
  // d is the agitation delta at each depth (base cancels), so this measures whether
  // depth changes agitation legibility (clipping at black floor is the real risk).
  console.log('\n=== AC7 proper: agitation legibility vs depth (u=0.6, t=1.7) ===');
  console.log('depth | cov%  | aniso | (harness meanShift-vs-0 is undefined at depth=1 → its Infinity is a metric bug)');
  for(const d of [0,0.3,0.5,0.8,1.0]){const b=await R(0,T,d),m=metrics(b,await R(0.6,T,d));
    console.log(`${d.toFixed(2).padStart(5)} | ${m.coverage.toFixed(2).padStart(5)} | ${m.aniso.toFixed(2)}`);}

  // AC8 freeze: frozen t=0 metrics
  const bf=await R(0,0,0.5);
  const mf06=metrics(bf,await R(0.6,0,0.5)), mf10=metrics(bf,await R(1.0,0,0.5));
  console.log('\n=== AC8 frozen (t=0) ===');
  console.log(`frozen cov@.6=${mf06.coverage.toFixed(1)}% rms@.6=${mf06.rmsRatio.toFixed(2)} aniso@1=${mf10.aniso.toFixed(2)}`);
  console.log('\npageerrors:', perr.length?perr.join(' | '):'none');
  await browser.close();
})();
