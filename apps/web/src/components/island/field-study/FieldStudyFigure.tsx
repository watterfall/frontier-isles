import type { ReactNode } from 'react';
import { benchmarkOverlap, composeReservoirs, divider, pattern, theoryValue, torusDistance, windowCounts, type StudyState } from './models';
import type { StudyKind } from './studies';

/** Geometric teaching diagrams. Every plotted point is calculated locally or
 * explicitly identified as symbolic; none is a traced research figure. */
export function FieldStudyFigure({kind,state,lang}:{kind:StudyKind;state:StudyState;lang:'zh'|'en'}) {
  const {choice:c,value:v}=state,zh=lang==='zh';
  const label=(x:number,y:number,text:string,props:Record<string,unknown>={})=><text x={x} y={y} textAnchor="middle" {...props}>{text}</text>;
  const line=(x1:number,y1:number,x2:number,y2:number,muted=false)=><path d={`M${x1} ${y1}L${x2} ${y2}`} className={muted?'fs-muted-line':undefined}/>;
  const node=(x:number,y:number,text:string,active=true)=><g className={active?'fs-node':'fs-node fs-inactive'}><circle cx={x} cy={y} r={24}/>{label(x,y+5,text)}</g>;
  const path=(points:number[][])=>points.map(([x,y],i)=>`${i?'L':'M'}${x!.toFixed(2)} ${y!.toFixed(2)}`).join(' ');
  let drawing:ReactNode;
  switch(kind){
    case 'proof':drawing=<>
      {label(260,32,zh?'人的问题：每个自然数都满足 n² = n 吗？':'Human question: does n² = n hold for every natural n?')}
      <rect x="66" y="59" width="388" height="46" className="fs-paper"/>
      {label(260,88,c===0?'∀ n ∈ ℕ, n² = n':'∃ n ∈ ℕ, n² = n')}
      {line(260,105,260,136)}{line(150,136,370,136)}{line(150,136,150,162)}{line(370,136,370,162)}
      {node(150,190,`${v}`,v*v===v)}{node(370,190,c===0?'2':'0')}
      {label(150,240,zh?'当前代入值':'Current substitution')}{label(370,240,c===0?(zh?'反例：4 ≠ 2':'Counterexample: 4 ≠ 2'):(zh?'见证：0 = 0':'Witness: 0 = 0'))}
    </>;break;
    case 'causal':drawing=<>
      <defs><marker id="fs-causal-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M2 1L8 5L2 9"/></marker></defs>
      {[0,1].map(i=>{const dx=i*260;return <g key={i}>
        {label(dx+130,27,i===0?'A · X → Y':'B · X ← U → Y')}
        <path d={`M${dx+115} 82L${dx+91} 123`} className={c===1?'fs-muted-line':undefined} markerEnd={c===1?undefined:'url(#fs-causal-arrow)'}/>{i===0?<path d={`M${dx+100} 145H${dx+157}`} markerEnd="url(#fs-causal-arrow)"/>:<path d={`M${dx+145} 82L${dx+169} 123`} markerEnd="url(#fs-causal-arrow)"/>}
        {node(dx+130,63,'U')}{node(dx+75,145,'X')}{node(dx+185,145,'Y')}
        {c===1&&label(dx+60,105,'×',{className:'fs-accent-text'})}
        {label(dx+130,210,i===0||c===0?`Y = ${v}`:'Y ∈ [0, 10]')}
        <path d={`M${dx+55} 235h150`} className="fs-muted-line"/>
        {i===1&&c===1?<path d={`M${dx+55} 235h150`} className="fs-range"/>:<circle cx={dx+55+15*v} cy="235" r="6" className="fs-dot"/>}
      </g>;})}
    </>;break;
    case 'compose':{const m=composeReservoirs(v,c),scale=Math.max(200,m.b);drawing=<>
      {label(110,34,'A')}{label(410,34,'B')}
      {[{x:55,n:m.a},{x:355,n:m.b}].map(({x,n})=><g key={x}>
        <rect x={x} y={200-n/scale*145} width="110" height={n/scale*145} className="fs-water"/>
        <path d={`M${x} 55V200h110V55`}/>{label(x+55,234,`${n} L`)}
      </g>)}
      <path d="M165 123h62m66 0h62m-12-6 12 6-12 6"/>
      <rect x="227" y="99" width="66" height="48" className="fs-paper"/>{label(260,129,c===2?'÷ 60':c===1?'× 60':'1:1')}
      {label(260,78,`${v} L / h`)}{label(260,183,c===1?(zh?'单位不匹配':'Unit mismatch'):(zh?'流出 = 流入':'Outflow = inflow'))}
    </>;break;}
    case 'theory':{
      const x=(n:number)=>48+n/3*430,y=(n:number)=>211-(n+1.5)/4.5*175;
      drawing=<>
        <rect x={x(0)} y="36" width={x(.5)-x(0)} height="175" className="fs-water"/>
        <path d="M48 30v181h438"/>{line(48,y(0),478,y(0),true)}
        {[0,1,2,3].map(n=><g key={n}>{label(x(n),232,`${n}`)}</g>)}
        {[-1,0,1,2,3].map(n=><g key={n}>{label(27,y(n)+5,`${n}`)}</g>)}
        <path d={path(Array.from({length:91},(_,i)=>[x(i/30),y(Math.sin(i/30))]))} className="fs-curve"/>
        <path d={path(Array.from({length:91},(_,i)=>[x(i/30),y(theoryValue(i/30,c===1))]))} className="fs-alternative"/>
        <path d={`M${x(v)} 36V211`} className="fs-muted-line"/>
        <circle cx={x(v)} cy={y(Math.sin(v))} r="5" className="fs-dot"/><circle cx={x(v)} cy={y(theoryValue(v,c===1))} r="5" className="fs-alt-dot"/>
        {label(129,20,zh?'实线 sin(x) · 虚线 候选':'Solid sin(x) · dashed candidate')}{label(433,254,'x')}
        {label(266,254,zh?'底色：已有观测 0–0.5':'Tint: observations 0–0.5')}
      </>;break;}
    case 'matter':{
      const m=divider(v,c===1);drawing=<>
        {label(115,26,zh?'分压电路':'Voltage divider')}
        <path d="M65 57h70v15l-10 7 20 14-20 14 20 14-10 7v20m0 0v12l-10 7 20 14-20 14 20 14-10 7v17H65M135 148h52"/>
        {label(56,53,'1')}{label(50,239,'0')}{label(182,104,`g=${m.g.toFixed(2)}`)}{label(183,198,'1')}
        <circle cx="135" cy="148" r="4" className="fs-dot"/>{label(211,155,'v')}
        {label(380,26,zh?'输出随更新步数变化':'Output over update steps')}
        <path d="M276 58v151h210"/>
        <path d="M276 90h208" className="fs-alternative"/>{label(387,78,'v* = 0.75')}
        <path d={path(m.history.map((n,i)=>[276+i/24*208,209-(n-.45)/.4*159]))} className="fs-curve"/>
        {label(282,232,'0')}{label(478,232,'24')}{label(380,256,zh?'步数':'Steps')}
      </>;break;}
    case 'cell':{const supplied=c===0,synthesis=v===0;drawing=<>
      {label(113,32,zh?'外部环境':'Environment')}{label(398,32,zh?'细胞内':'Inside the cell')}
      <path d="M247 48v196" className="fs-muted-line"/>
      {line(110,103,279,146,!supplied)}{line(400,103,318,146,!synthesis)}{line(300,168,300,209,!(supplied||synthesis))}
      {node(110,86,zh?'供给':'Feed',supplied)}{node(400,86,zh?'合成':'Make',synthesis)}
      {node(300,150,'P',supplied||synthesis)}{node(300,229,'G',supplied||synthesis)}
      {label(139,187,supplied?'P →':(zh?'供给撤去':'Supply absent'))}{label(413,186,synthesis?(zh?'合成保留':'Synthesis kept'):(zh?'合成删去':'Synthesis removed'))}
      {label(365,151,'OR')}
    </>;break;}
    case 'calls':{const tokens=[['ABC'],['D'],['ABC','D'],['D','ABC']][c]!;drawing=<>
      {label(260,29,zh?'符号化回放条件':'Symbolic playback condition')}
      {tokens.map((token,i)=>{const start=tokens.length===1?194:80+i*230;return <g key={i}><rect x={start} y="58" width="130" height="55" className={token==='D'?'fs-choice-block':'fs-paper'}/>{label(start+65,93,token)}{tokens.length>1&&i===0&&<path d="M228 85h62m-8-5 8 5-8 5"/>}</g>;})}
      <path d="M260 127v25m-5-7 5 7 5-7"/>
      {v===0?<>{label(260,188,zh?'仅凭序列，无法推出接收者行为':'Sequence alone does not establish receiver behavior')}{label(260,229,zh?'切换到论文行为观察':'Switch to the reported behavior')}</>:<>
        {[zh?'警戒扫描':'Scanning',zh?'接近':'Approach'].map((text,i)=><g key={i} className={c===i||c===2?'fs-node':'fs-node fs-inactive'}><rect x={55+i*255} y="168" width="155" height="48"/>{label(132+i*255,198,text)}</g>)}
        {label(260,248,c===3?(zh?'逆序：组合反应少见':'Reversed: combined response rare'):(zh?'定性观察，不编码反应强度':'Qualitative; no response magnitude encoded'))}
      </>}
    </>;break;}
    case 'erasure':drawing=<>
      {label(260,30,c===0?(zh?'收到的字：已知恰有 k 位翻转':'Received word: exactly k flips known'):(zh?'未擦除的位可靠，空格位置已知':'Remaining bits reliable; blank locations known'))}
      {Array.from({length:8},(_,i)=><g key={i}><rect x={35+i*57} y="66" width="48" height="58" className={c===1&&i>=8-v?'fs-erased':'fs-paper'}/>{label(59+i*57,102,c===1&&i>=8-v?'?':i===0&&c===0?`${v%2}`:'0')}{label(59+i*57,150,`${i+1}`)}</g>)}
      {label(260,201,c===0?'C(8, k)':'2^(k − 1)')}
      {label(260,240,zh?'偶校验只提供一条约束':'Even parity supplies one constraint')}
    </>;break;
    case 'order':{const points=pattern(c===1),m=windowCounts(points,v),max=Math.max(...m.counts,1);drawing=<>
      <rect x="23" y="38" width="198" height="198" className="fs-paper"/>
      {points.map((p,i)=><circle key={i} cx={23+p.x*1.98} cy={38+p.y*1.98} r="2.2" className={torusDistance(p,{x:45,y:45})<=v?'fs-alt-dot':'fs-dot'}/>)}
      <circle cx={23+45*1.98} cy={38+45*1.98} r={v*1.98} className="fs-window"/>
      {label(120,24,'196 '+(zh?'点':'points'))}{label(382,24,zh?'100 个窗口的计数 N':'Counts N in 100 windows')}
      <path d="M271 45v191h224"/>
      {m.counts.map((n,i)=><path key={i} d={`M${278+i*2.1} 235v${-n/max*160}`} className="fs-count"/>)}
      {label(259,74,`${max}`)}{label(383,258,zh?'固定取样位置':'Fixed sample positions')}
    </>;break;}
    case 'benchmark':{const m=benchmarkOverlap(c,v);drawing=<>
      {label(160,26,zh?'环境 X':'Context X')}{label(360,26,zh?'环境 Y':'Context Y')}
      {['A','B','C'].map((p,i)=><g key={p}>{label(27,78+i*60,p)}</g>)}
      {[...m.train,...m.test].map(s=>{const x=67+(s.context==='Y'?200:0)+(s.replicate-1)*92,y=48+['A','B','C'].indexOf(s.perturbation)*60;return <g key={s.id}><rect x={x} y={y} width="79" height="44" className={m.test.includes(s)?'fs-test-sample':'fs-paper'}/>{s.id===m.sample.id&&<rect x={x-4} y={y-4} width="87" height="52" className="fs-selected-sample"/>}{label(x+39,y+28,s.id)}</g>;})}
      {label(260,256,zh?'空底：训练 · 着色：测试 · 外框：当前样本':'Plain: train · tinted: test · outline: selected')}
    </>;break;}
  }
  return <svg className="fi-study-figure" viewBox="0 0 520 275" aria-hidden="true">{drawing}</svg>;
}
