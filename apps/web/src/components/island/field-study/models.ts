import { bi, type Bi, type FieldStudy, type StudyKind } from './studies';
export interface StudyState { choice: number; value: number; thought: string }
export interface Point { x: number; y: number }
export const defaultStudyState = (study: FieldStudy): StudyState => ({ choice:0, value:study.initial, thought:'' });
export function restoreStudyState(study:FieldStudy, raw:unknown):StudyState {
  const defaults=defaultStudyState(study);
  if(!raw||typeof raw!=='object')return defaults;
  const record=raw as Partial<StudyState>;
  return {
    choice:typeof record.choice==='number'&&Number.isInteger(record.choice)&&record.choice>=0&&record.choice<study.choices.length?record.choice:0,
    value:typeof record.value==='number'&&Number.isFinite(record.value)?Math.max(study.min,Math.min(study.max,Math.round(record.value/study.step)*study.step)):study.initial,
    thought:typeof record.thought==='string'?record.thought.slice(0,500):'',
  };
}
export function divider(steps:number, learn:boolean) {
  let g=1;
  const history=[0.5];
  for(let i=0;i<steps;i++){if(learn)g+=0.8*(0.75-g/(g+1));history.push(g/(g+1));}
  return {g,output:g/(g+1),history};
}
export function pattern(jittered:boolean):Point[] {
  let seed=84631;
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  return Array.from({length:196},(_,i)=>jittered?{x:((i%14)+.15+.7*rand())*100/14,y:(Math.floor(i/14)+.15+.7*rand())*100/14}:{x:100*rand(),y:100*rand()});
}
export const torusDistance=(a:Point,b:Point)=>{const dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y);return Math.hypot(Math.min(dx,100-dx),Math.min(dy,100-dy));};
export function windowCounts(points:Point[],radius:number) {
  const counts=Array.from({length:100},(_,i)=>points.filter(p=>torusDistance(p,{x:5+(i%10)*10,y:5+Math.floor(i/10)*10})<=radius).length);
  const mean=counts.reduce((a,b)=>a+b,0)/counts.length;
  const variance=counts.reduce((a,b)=>a+(b-mean)**2,0)/counts.length;
  return {counts,mean,variance};
}
export interface BenchmarkSample { id:string; perturbation:string; context:string; replicate:number }
export function benchmarkSplit(choice:number) {
  const samples:BenchmarkSample[]=[];
  for(const perturbation of ['A','B','C'])for(const context of ['X','Y'])for(const replicate of [1,2])samples.push({id:`${perturbation}${context}${replicate}`,perturbation,context,replicate});
  const held=(s:BenchmarkSample)=>choice===0?s.replicate===2:choice===1?s.perturbation==='C':s.context==='Y';
  return {train:samples.filter(s=>!held(s)),test:samples.filter(held)};
}
export function benchmarkOverlap(choice:number,value:number) {
  const split=benchmarkSplit(choice),sample=split.test[value]!;
  return {...split,sample,perturbationSeen:split.train.some(s=>s.perturbation===sample.perturbation),contextSeen:split.train.some(s=>s.context===sample.context),pairSeen:split.train.some(s=>s.context===sample.context&&s.perturbation===sample.perturbation)};
}
export const candidateCount=(k:number,flagged:boolean)=>flagged?2**(k-1):Array.from({length:k},(_,i)=>(8-i)/(i+1)).reduce((a,b)=>a*b,1);
export const composeReservoirs=(q:number,mode:number)=>({a:100-q,b:100+(mode===1?60*q:q),imbalance:mode===1?59*q:0});
export const theoryValue=(x:number,cubic:boolean)=>cubic?x-x**3/6:x;
export interface StudyObservation { title:Bi; detail:Bi; metric:Bi }
export function observeStudy(kind:StudyKind,{choice:c,value:v}:StudyState):StudyObservation {
  switch(kind){
    case 'proof':return {
      title:c===0?bi('一个反例足以推翻“所有”','One counterexample refutes “every”'):bi('“存在”成立，原问题却被削弱','“Exists” holds, but the question has weakened'),
      detail:c===0?bi(v*v===v?'这个 n 成立，但不能推出所有 n 成立；把 n 移到 2 试试。':'这个 n 不满足等式，因而全称命题不成立。',v*v===v?'This n satisfies the equality, but that does not establish it for every n. Try n = 2.':'This n violates the equality, so the universal statement is false.'):bi(v*v===v?'当前 n 就是见证。这个证明目标已经不同于“对所有 n”。':'当前 n 不是见证，但 n = 0 或 1 足以使存在命题成立。',v*v===v?'The current n is a witness. This target already differs from “for every n”.':'The current n is not a witness, but n = 0 or 1 establishes the existential statement.'),
      metric:bi(`${v}² = ${v*v} ${v*v===v?'=':'≠'} ${v}`,`${v}² = ${v*v} ${v*v===v?'=':'≠'} ${v}`)};
    case 'causal':return {
      title:c===0?bi('观测无法区分这两个世界','Observations cannot distinguish these worlds'):bi('干预让预测分开','Intervention separates the predictions'),
      detail:c===0?bi('两个世界都给出 Y = X。增加同类观测不会打破此构造的等价性。','Both worlds give Y = X. More observations of this kind do not break the constructed equivalence.'):bi('A 的 Y 被 X 带到设定值；B 的 Y 仍跟随 U，范围为 0–10。即使均值重合，分布仍不同。','In A, Y follows the assigned X. In B, Y still follows U over 0–10. Even if means coincide, distributions differ.'),
      metric:c===0?bi(`两者 Y = ${v}`,`Both: Y = ${v}`):bi(`A: Y = ${v} · B: E[Y] = 5`,`A: Y = ${v} · B: E[Y] = 5`)};
    case 'compose':{const m=composeReservoirs(v,c);return {title:c===1?bi('接口凭空记入了水','The interface recorded water from nowhere'):bi('这次连接保留了总量','This connection preserves the total'),detail:c===1?bi('同一个数字被赋予不同的时间单位，左减与右增不再相抵。','One number is assigned different time units; the loss and gain no longer cancel.'):bi('左侧减少与右侧增加相同。单位检查通过后，仍要检查状态含义与动力学假设。','Loss and gain match. Units are consistent; state meanings and dynamic assumptions still need checking.'),metric:bi(`A + B = ${m.a+m.b} L · 偏差 ${m.imbalance} L`,`A + B = ${m.a+m.b} L · discrepancy ${m.imbalance} L`)};}
    case 'theory':{const error=Math.abs(theoryValue(v,c===1)-Math.sin(v));return {title:v<=.5?bi('仍在已知观测范围内','Still inside the observed range'):bi('已经越过观测边界','Beyond the observation boundary'),detail:bi('两种候选都能在小范围内靠近参考曲线。扩大 x 后，选择哪种近似会改变预测；小误差本身不证明规律。','Both candidates approach the reference over a small range. Expanding x makes the approximation choice matter; small error alone does not establish a law.'),metric:bi(`此处绝对误差 ${error.toFixed(4)}`,`Absolute error here: ${error.toFixed(4)}`)};}
    case 'matter':{const m=divider(v,c===1);return {title:c===0?bi('重新平衡没有改变规则','Re-equilibrating does not change the rule'):bi('更新规则让输出接近目标','The update rule moves output toward the target'),detail:c===0?bi('无论重复多少步，电导不变，输出仍为 0.5。','However many steps are repeated, conductance stays fixed and output remains 0.5.'):bi('变化来自额外写入的误差反馈。继续追问：真实器件怎样在局部获得这个信息？','Change comes from the added error feedback. How would real elements obtain this information locally?'),metric:bi(`输出 ${m.output.toFixed(3)} · 目标 0.750`,`Output ${m.output.toFixed(3)} · target 0.750`)};}
    case 'cell':{const available=c===0||v===0;return {title:available?bi('G 在这张依赖图中可达','G is reachable in this dependency graph'):bi('通往 G 的供给路径断开','The supply path to G is broken'),detail:c===0&&v===1?bi('外部供给遮住了内部功能的缺失。撤去供给，看看这份“最小”清单还能否成立。','External supply masks the missing internal function. Remove the supply to challenge this “minimal” inventory.'):bi('“可达”只意味着满足了我们写下的布尔条件，不代表细胞能够活下来。','“Reachable” means only that the authored Boolean conditions hold, not that a cell can survive.'),metric:bi(`P = ${available?'可获得':'不可获得'}`,`P = ${available?'available':'unavailable'}`)};}
    case 'calls':{
      const behavior=[bi('ABC：论文观察到警戒扫描','ABC: reported scanning'),bi('D：论文观察到接近','D: reported approach'),bi('ABC–D：扫描与接近的组合反应','ABC–D: combined scanning and approach'),bi('D–ABC：组合反应少见','D–ABC: combined response was rare')][c]!;
      return {title:v===0?bi('声音结构尚未给出行为意义','Sound structure alone gives no behavioral meaning'):behavior,detail:v===0?bi('序列可被统计和重排，但只看音节无法得出动物如何回应。切到行为证据层。','Sequences can be counted and reordered, but syllables alone do not tell us how receivers respond. Inspect the behavior layer.'):bi('这是论文特定回放实验的定性观察。下一步需要区分顺序、熟悉度与意义的解释。','This is a qualitative observation from the paper’s playback experiments. Order, familiarity and meaning still call for discriminating tests.'),metric:v===0?bi('符号序列 · 非录音','Symbolic sequence · not audio'):bi('定性文献证据 · 无模拟概率','Qualitative source evidence · no simulated probability')};}
    case 'erasure':return {title:c===1?bi('擦除通道：位置已知，缺失值待填','Erasure channel: known gaps, unknown values'):bi('翻转通道：数量已知，位置待定','Flip channel: known count, unknown locations'),detail:bi('候选数分别来自两种通道的经典偶校验枚举。只有一个候选时可唯一恢复；多个候选时还需冗余信息。','Candidate counts come from classical parity enumeration for each channel. One candidate permits unique recovery; multiple candidates require more redundancy.'),metric:bi(`${Math.round(candidateCount(v,c===1))} 个候选原始消息`,`${Math.round(candidateCount(v,c===1))} possible original messages`)};
    case 'order':{const m=windowCounts(pattern(c===1),v);return {title:bi('比较的是计数涨落，而不是整齐程度','Compare count fluctuations, not visual neatness'),detail:bi('每个窗口真实计数后才计算统计量。改变半径和分布，对照方差如何变；单个读数不能判定超均匀性。','Statistics are calculated from actual window counts. Compare radii and patterns; no single reading establishes hyperuniformity.'),metric:bi(`平均 ${m.mean.toFixed(2)} · 方差 ${m.variance.toFixed(2)}`,`Mean ${m.mean.toFixed(2)} · variance ${m.variance.toFixed(2)}`)};}
    case 'benchmark':{const m=benchmarkOverlap(c,v);return {title:c===0?bi('新细胞，却是见过的扰动与环境','New cells, familiar perturbations and contexts'):c===1?bi('真正留出了一种扰动','A perturbation is held out'):bi('留出环境，扰动仍然见过','Context is held out; perturbations remain familiar'),detail:bi(`测试 ${m.sample.id}：训练中${m.perturbationSeen?'见过':'未见'}扰动 ${m.sample.perturbation}，${m.contextSeen?'见过':'未见'}环境 ${m.sample.context}。不同划分回答不同泛化问题。`,`Test ${m.sample.id}: perturbation ${m.sample.perturbation} is ${m.perturbationSeen?'seen':'unseen'} in training; context ${m.sample.context} is ${m.contextSeen?'seen':'unseen'}. Each split asks a different generalization question.`),metric:bi(`训练 ${m.train.length} · 测试 ${m.test.length} · 配对${m.pairSeen?'已见':'未见'}`,`Train ${m.train.length} · test ${m.test.length} · pair ${m.pairSeen?'seen':'unseen'}`)};}
  }
}
