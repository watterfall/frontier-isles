import type { SeedStructure, StructureQuantity } from './structures';

/**
 * Wave 4 — 17 structures drawn from the `100 个跨学科主题` topic set, and the
 * proposals they justify. Nothing here is a mapping.
 *
 * Why the topic set was usable at all. Its four columns are already this
 * repository's schema: 主题 → `title`, 一句话 → `statement`, 何时失效 →
 * `failsWhen`, 在哪里出现 → the substrates a mapping would have to find. The
 * column that is normally hardest to author — the condition under which the
 * regularity stops holding — arrives written.
 *
 * How these 17 were chosen. All 100 topics were scored against the 1,848-record
 * xfrontier corpus (dataset xf-6eb361265784). 17 duplicated an existing
 * structure (信道容量 = ISO-08, 重整化 = ISO-04, 发表偏倚 = ISO-36, …) and were
 * dropped; 7 partially overlapped one and were deferred; these 17 are the
 * best-supported of the remainder.
 *
 * WHAT THE SCORE DOES NOT MEAN. It is one-directional. A high score is evidence
 * the corpus carries the topic. A low score is NOT evidence it does not: 变分
 * 极值原理 ranked 95th of 100 and is already here as ISO-09 最小作用量 with five
 * mappings across three domains — the corpus simply words it differently. Both
 * the local scorer and the server's `nearest` are TF-IDF, so neither does
 * conceptual matching. Nothing was rejected for scoring low.
 *
 * Every structure below carries ZERO mappings, and that is the point rather
 * than an omission (see `structures.ts`: a structure with no rebuilt island is
 * a pure frontier, the map's honest dashed field). A mapping needs
 * correspondences, a falsifiable prediction and a substrate-specific boundary
 * — the curator's insight, which no amount of retrieval supplies.
 */

type Bilingual = { zh: string; en: string };

const bi = (zh: string, en: string): Bilingual => ({ zh, en });

const q = (
  nameZh: string,
  nameEn: string,
  roleZh: string,
  roleEn: string,
): StructureQuantity => ({ name: bi(nameZh, nameEn), role: bi(roleZh, roleEn) });

/**
 * Corpus handles re-checked against the live xfrontier MCP on 2026-08-22
 * (dataset xf-6eb361265784). These are the records that exhibit the structure,
 * NOT a claim that any of them is an island.
 */
const WAVE_4_PROVENANCE = (recordIds: number[]) => ({
  source: 'xfrontier.science',
  url: 'https://xfrontier.science/',
  recordIds,
  reviewedAt: '2026-08-22',
});

// ─────────────────────────────────────────────────────────────────────────────
// 一、规律类 — 世界做的事。一个岛 embodies 它，或 breaks 它。
// ─────────────────────────────────────────────────────────────────────────────

const REGULARITIES: SeedStructure[] = [
  {
    id: 'struct://xfrontier/critical-slowing-down',
    title: bi('临界慢化前兆', 'Critical slowing down as a precursor'),
    statement: bi(
      '一个系统逼近临界转变时，受扰后的恢复会变慢，于是方差与一阶自相关在崩溃之前就升高——前兆与崩溃的具体机制无关，只与「恢复速率趋零」有关。',
      'As a system approaches a critical transition its recovery from perturbation slows, so variance and lag-1 autocorrelation rise before the transition itself — the precursor depends on the recovery rate going to zero, not on what the collapse is made of.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('恢复速率', 'recovery rate', '扰动衰减回稳态的速度；它趋零是整个前兆的来源', 'how fast a perturbation decays back to the steady state; its approach to zero is the whole source of the precursor'),
      q('方差', 'variance', '恢复变慢后状态在噪声下的游走幅度', 'how far the state wanders under noise once recovery has slowed'),
      q('一阶自相关', 'lag-1 autocorrelation', '相邻时刻的记忆强度，随恢复变慢而升高', 'the memory between successive samples, which rises as recovery slows'),
      q('到分岔点的距离', 'distance to the bifurcation', '被前兆间接估计、却几乎不能直接观测的那个量', 'the quantity the precursor indirectly estimates and almost never observes directly'),
    ],
    failsWhen: bi(
      '速率诱导与噪声诱导的转变没有此前兆：终态仍在安全域内、系统只是「跟不上」强迫的变化速度，恢复速率并不趋零。',
      'Rate-induced and noise-induced transitions carry no such precursor: the end state is still inside the safe basin and the system merely fails to keep up with the speed of the forcing, so the recovery rate never approaches zero.',
    ),
    provenance: WAVE_4_PROVENANCE([1185, 238, 826, 827, 832, 828, 1226, 1194, 1229]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/self-assembly',
    title: bi('自组装', 'Self-assembly'),
    statement: bi(
      '只给出局部结合规则与一个要被降低的能量，有序结构就会在没有蓝图、没有装配者的情况下自己出现——秩序来自局部约束的相容，而不是来自全局指令。',
      'Give only local binding rules and an energy to be lowered, and ordered structure appears with no blueprint and no assembler — the order comes from local constraints being mutually satisfiable, not from a global instruction.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('局部结合规则', 'local binding rule', '决定哪两个单元可以相接、以什么取向相接', 'what may bind to what, and in which orientation'),
      q('能量地形', 'energy landscape', '被最小化的目标；它的极小数目决定终态是否唯一', 'the objective being minimised; how many minima it has decides whether the end state is unique'),
      q('组装产率', 'assembly yield', '实际到达目标结构的比例，区别于原理上可达', 'the fraction that actually reaches the target structure, as against what is reachable in principle'),
    ],
    failsWhen: bi(
      '能量地形存在多个极小时，系统会被动力学困在错误的那个里；此时「原理上可自组装」与「实际会组装成」不再是同一件事。',
      'When the landscape has several minima the system is kinetically trapped in the wrong one, and "self-assembles in principle" stops being the same statement as "will assemble".',
    ),
    provenance: WAVE_4_PROVENANCE([130, 658, 1011, 116, 96]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/landauer-erasure-cost',
    title: bi('信息擦除的能量代价', 'The energy cost of erasing information'),
    statement: bi(
      '把一个比特擦掉——把两个可区分的状态合并成一个——在任何物理实现里都至少要向环境耗散 kT·ln2；代价挂在「逻辑不可逆」上，不挂在具体器件上。',
      'Erasing one bit — merging two distinguishable states into one — dissipates at least kT·ln2 to the environment in any physical implementation; the cost attaches to logical irreversibility, not to any particular device.',
    ),
    status: 'proposed',
    theme: 'living-computation',
    kind: 'regularity',
    quantities: [
      q('每次擦除的最小耗散', 'minimum dissipation per erasure', 'kT·ln2，随温度而不是随工艺变化', 'kT·ln2, which scales with temperature rather than with process node'),
      q('逻辑不可逆度', 'logical irreversibility', '一步操作合并了多少可区分状态', 'how many distinguishable states one operation merges'),
      q('过程时长', 'process duration', '越快完成擦除，超出该下界的额外耗散越大', 'the faster the erasure, the larger the excess dissipation above the bound'),
    ],
    failsWhen: bi(
      '可逆计算不擦除，因而不受此界——反计算把中间信息还原而非丢弃时，下界让位给时钟、面积与延迟这些别的代价。',
      'Reversible computation does not erase and so is not bound by it — once uncomputation restores intermediate information rather than discarding it, the limit gives way to other costs: clocking, area and latency.',
    ),
    provenance: WAVE_4_PROVENANCE([1094, 1706, 1271, 1547, 136, 574, 940]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/quorum-sensing',
    title: bi('群体感应', 'Quorum sensing'),
    statement: bi(
      '个体不判断群体有多大，只读取环境里同类信号的浓度；浓度越过阈值时集体行为整齐启动——决策被外包给了一个共享的标量。',
      'No individual judges how large the group is; each reads only the concentration of a shared signal in its environment, and collective behaviour switches on together once that concentration crosses a threshold — the decision is outsourced to one shared scalar.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('信号浓度', 'signal concentration', '被所有个体共享读取的那个标量', 'the one scalar every individual reads'),
      q('触发阈值', 'switching threshold', '集体行为整齐启动的浓度', 'the concentration at which the collective behaviour switches on'),
      q('个体产信率', 'per-individual emission rate', '把「有多少个」翻译成「浓度多高」的换算', 'what converts "how many are here" into "how strong the signal is"'),
    ],
    failsWhen: bi(
      '信号可被伪造，或在空间里衰减不均：此时浓度不再是群体规模的可靠代理，少数个体也能在局部制造出「已达法定人数」的假象。',
      'When the signal can be forged, or decays unevenly across space, concentration stops being a reliable proxy for group size and a few individuals can manufacture a local illusion of quorum.',
    ),
    provenance: WAVE_4_PROVENANCE([12, 552, 719, 236, 1676]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/verification-asymmetry',
    title: bi('验证不对称', 'Verification asymmetry'),
    statement: bi(
      '检查一个候选答案往往比找到它便宜若干数量级；一整套制度——密码学、同行评议、竞赛——都建立在这条差价上，而不是建立在验证者比生成者聪明上。',
      'Checking a candidate answer is often orders of magnitude cheaper than finding it, and whole institutions — cryptography, peer review, competition — are built on that price gap rather than on the checker being smarter than the producer.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'regularity',
    quantities: [
      q('生成代价', 'cost to produce', '找到一个候选答案所需的资源', 'the resources needed to find a candidate answer'),
      q('验证代价', 'cost to check', '在拿到候选答案后确认它所需的资源', 'the resources needed to confirm one once handed over'),
      q('见证串', 'witness', '把验证变便宜的那个附加物；它存在与否决定不对称是否成立', 'the extra object that makes checking cheap; whether one exists decides whether the asymmetry holds at all'),
    ],
    failsWhen: bi(
      '当验证必须复现整个生成过程时不对称消失——没有可携带的见证串，检查就退化成重做一遍。',
      'The asymmetry disappears when checking requires reproducing the whole production: with no portable witness, checking degenerates into doing the work again.',
    ),
    provenance: WAVE_4_PROVENANCE([462, 456, 327, 1154, 465]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/computational-lower-bounds',
    title: bi('计算复杂度下界', 'Computational lower bounds'),
    statement: bi(
      '有些问题所需的资源存在不可跨越的下界，且这个下界是问题本身的性质，不是当前算法不够好——它对未来所有算法同时成立。',
      'Some problems have a floor on the resources they require, and the floor is a property of the problem rather than of today\'s algorithms — it holds against every future algorithm at once.',
    ),
    status: 'proposed',
    theme: 'unknown-mapping',
    kind: 'regularity',
    quantities: [
      q('资源下界', 'resource floor', '任何算法都不能低于的时间/空间/查询次数', 'the time, space or query count no algorithm can go under'),
      q('问题类', 'problem class', '下界所辖的输入集合；换一个类下界就换一条', 'the input set the bound ranges over; change the class and you change the bound'),
      q('松弛旋钮', 'relaxation knob', '近似比、成功概率或可利用的结构——绕开下界的唯一出口', 'approximation ratio, success probability or exploitable structure — the only exits from the bound'),
    ],
    failsWhen: bi(
      '允许近似、允许出错概率，或输入带有可被利用的结构时，下界并未被推翻，而是不再适用于你实际在解的那个问题。',
      'Once approximation, a failure probability, or exploitable input structure is allowed, the bound is not refuted — it simply stops applying to the problem actually being solved.',
    ),
    provenance: WAVE_4_PROVENANCE([383, 1196, 594, 676, 1247]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/communication-complexity',
    title: bi('通信复杂度', 'Communication complexity'),
    statement: bi(
      '当输入分散在多方手里，完成协调所需的最小通信量有下界，而且这个下界常常与各方本地算力无关——瓶颈在于要搬多少比特，不在于要算多少步。',
      'When the input is split across parties, the coordination has a floor on how many bits must move, and that floor is often independent of local compute — the bottleneck is transport, not steps.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('最小通信量', 'minimum bits exchanged', '完成任务必须跨越各方边界的比特数', 'the bits that must cross the boundary between parties'),
      q('输入切分方式', 'input partition', '同一任务换一种切分，下界可以完全改变', 'the same task under a different split can have a completely different bound'),
      q('轮数', 'rounds', '允许来回几次；单向与交互的下界不是一回事', 'how many back-and-forths are allowed; one-way and interactive bounds are different bounds'),
    ],
    failsWhen: bi(
      '允许近似或随机化时下界会改变（有时指数级地降低），所以「精确确定性」的下界不能直接拿去否定一个随机近似方案。',
      'Allowing approximation or randomisation changes the bound, sometimes exponentially, so an exact deterministic lower bound cannot be used to rule out a randomised approximate scheme.',
    ),
    provenance: WAVE_4_PROVENANCE([1598, 1505, 1108, 368, 702]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/undecidability',
    title: bi('不可判定性', 'Undecidability'),
    statement: bi(
      '存在一些问题，不是「还没找到算法」，而是不存在能对所有输入都给出答案的程序；这是关于问题的定理，不是关于我们的努力。',
      'For some problems it is not that no algorithm has been found yet: no program can answer for every input. It is a theorem about the problem, not about our effort.',
    ),
    status: 'proposed',
    theme: 'unknown-mapping',
    kind: 'regularity',
    quantities: [
      q('输入类', 'input class', '判定要覆盖的全体；缩小它常常就恢复了可判定性', 'the totality the decision must cover; shrinking it often restores decidability'),
      q('归约', 'reduction', '把已知不可判定的问题嵌进新问题的那条构造', 'the construction that embeds a known undecidable problem into a new one'),
      q('部分正确的过程', 'partial procedure', '可以对部分输入给出答案、对其余不停机的那种妥协', 'the compromise that answers on some inputs and never halts on the rest'),
    ],
    failsWhen: bi(
      '把输入限制到一个受限类之后，同一个问题可以是可判定的——所以「这个问题不可判定」在工程语境里几乎总要问一句「在哪个输入类上」。',
      'Restricted to a limited class of inputs, the same problem can be decidable — so in an engineering context "this is undecidable" nearly always needs the follow-up "over which inputs".',
    ),
    provenance: WAVE_4_PROVENANCE([915, 1190, 377, 1156, 913]),
    mappings: [],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 二、方法类 — 研究者做的事。一个岛 practices 它。
//
// 这一类是本轮新增的第二种结构。它们与规律类共用目录，但边的含义不同：
// 一个岛「体现」一条规律，与一个岛「用到」一种手法，不是同一种断言，
// 混在一个 embodies 里会让结构透镜声称它支撑不了的东西。
// ─────────────────────────────────────────────────────────────────────────────

const METHODS: SeedStructure[] = [
  {
    id: 'struct://xfrontier/tacit-craft-explicitation',
    title: bi('隐性技艺显式化', 'Making tacit craft explicit'),
    statement: bi(
      '把一个流程里最依赖手艺、最说不清楚的步骤拆解、参数化、标准化，使它可以被别人或机器重复执行——赌注是那步手艺其实是可分解的。',
      'Take the step in a process that depends most on craft and is least articulable, decompose it, parameterise it and standardise it so someone or something else can repeat it — the bet being that the craft was decomposable at all.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'method',
    quantities: [
      q('待拆解的步骤', 'the step being decomposed', '流程中方差最大、最依赖个人的那一段', 'the segment with the highest variance and the heaviest dependence on the individual'),
      q('显式参数', 'explicit parameters', '拆解后被写下来的控制量', 'the control variables that get written down once it is taken apart'),
      q('残余方差', 'residual variance', '标准化之后仍然解释不掉的差异——它是拆解是否成功的判据', 'the variation standardisation still cannot explain — the test of whether the decomposition worked'),
    ],
    failsWhen: bi(
      '技艺确实不可分解时，强行拆解会损失质量而非提高一致性：残余方差不降，产物却已经变差。',
      'When the craft genuinely is not decomposable, forcing it apart costs quality instead of buying consistency: the residual variance does not fall and the product is already worse.',
    ),
    provenance: WAVE_4_PROVENANCE([1072, 1514, 681, 895, 63]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/within-subject-control',
    title: bi('自身对照', 'Within-subject control'),
    statement: bi(
      '以单个个体作自己的对照，反复施加与撤除干预，用同一个体的前后差异替代群体间比较——个体差异被设计消掉，而不是被统计平均掉。',
      'Use one individual as its own control, applying and withdrawing the intervention repeatedly, so a within-individual difference replaces a between-group comparison — individual variation is designed away rather than averaged away.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'method',
    quantities: [
      q('个体内前后差', 'within-individual contrast', '同一个体在有/无干预下的差异', 'the difference in the same individual with and without the intervention'),
      q('洗脱期', 'washout period', '两次施加之间必须留出的间隔', 'the gap that must be left between applications'),
      q('周期数', 'number of periods', '重复次数；它决定这一个个体的结论有多强', 'how many repeats, which is what makes a conclusion about this one individual strong or weak'),
    ],
    failsWhen: bi(
      '存在残留效应时前后不可比——干预留下了不可洗脱的痕迹，「同一个体」就不再是同一个对照。',
      'Carry-over breaks comparability: if the intervention leaves a trace that does not wash out, "the same individual" is no longer the same control.',
    ),
    provenance: WAVE_4_PROVENANCE([168, 415, 1244]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/aggregating-independent-judgements',
    title: bi('独立判断聚合', 'Aggregating independent judgements'),
    statement: bi(
      '多个独立评估者的一致与分歧共同构成信号：一致收窄不确定性，分歧本身也是信息，而不是需要被抹平的噪声。',
      'The agreement and the disagreement among independent assessors are both signal: agreement narrows the uncertainty, and the spread is information in its own right rather than noise to be smoothed out.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'method',
    quantities: [
      q('评估者独立性', 'assessor independence', '整套方法唯一的前提，也是最容易被悄悄破坏的那个', 'the one premise the method rests on, and the one most easily broken without anyone noticing'),
      q('一致度', 'agreement', '收窄不确定性的那部分', 'the part that narrows the uncertainty'),
      q('分歧分布', 'spread of disagreement', '被平均掉就会丢失的那部分信息', 'the information that is lost the moment it is averaged away'),
    ],
    failsWhen: bi(
      '评估者相互关联时独立性假设垮掉：他们读同一批材料、受同一个先验影响，聚合出来的窄区间是假的精度。',
      'Correlated assessors break the premise: when they read the same materials under the same prior, the narrow aggregate interval is false precision.',
    ),
    provenance: WAVE_4_PROVENANCE([1021, 360, 1018, 462, 456]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/negative-control',
    title: bi('负对照', 'Negative controls'),
    statement: bi(
      '引入一个已知不该产生效应的探针；它若仍显出效应，显出的就是残余混杂的量——用一个应当为零的读数去测量偏差本身。',
      'Introduce a probe that is known to have no effect; whatever effect it still shows is the residual confounding — a reading that ought to be zero, used to measure the bias itself.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'method',
    quantities: [
      q('负对照探针', 'the negative-control probe', '被断言无效应的那个变量', 'the variable asserted to have no effect'),
      q('残余效应读数', 'residual reading', '探针上仍然显出的效应，即偏差的估计', 'the effect the probe still shows, which estimates the bias'),
      q('混杂结构共享性', 'shared confounding structure', '探针与真实暴露必须共享的那套混杂路径', 'the confounding paths the probe must share with the real exposure'),
    ],
    failsWhen: bi(
      '负对照必须与真实暴露共享混杂结构，且必须真的负——一旦它被处理或结果暗中影响，去混杂本身就变成了新的偏差来源，而这一步很难从数据端证伪。',
      'The control must share the confounding structure with the real exposure and must genuinely be null: once it is itself touched by the treatment or the outcome, the de-confounding becomes a new source of bias, and that failure is hard to falsify from the data alone.',
    ),
    provenance: WAVE_4_PROVENANCE([1238, 1243, 1075, 228, 79]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/zero-knowledge-verification',
    title: bi('零知识式验证', 'Zero-knowledge verification'),
    statement: bi(
      '向对方证明「我确实知道/确实执行了某件事」，而不透露那件事的内容——可验证性与不公开首次不再互斥。',
      'Prove to someone that you do know, or did run, a particular thing without disclosing what it is — verifiability and non-disclosure stop being mutually exclusive.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'method',
    quantities: [
      q('被证明的断言', 'the statement proved', '一个关于持有或执行的事实', 'a fact about possession or about execution'),
      q('证明体积与出证代价', 'proof size and proving cost', '决定这套方法在实践中能不能用的那两个数', 'the two numbers that decide whether the method is usable in practice'),
      q('电路表达力', 'circuit expressiveness', '能被写进证明的运算集合；它是真正的边界', 'the set of operations that can be expressed inside the proof — the real boundary'),
    ],
    failsWhen: bi(
      '当需要验证的是内容的语义而非「持有/执行」这一事实时不适用：证明「我按声称的方式跑了这段计算」，从不证明这段计算本身是对的。',
      'It does not apply when what needs checking is the semantics of the content rather than the fact of possession or execution: proving "I ran this computation as claimed" never proves the computation was the right one.',
    ),
    provenance: WAVE_4_PROVENANCE([1016, 1218, 918, 808, 1207]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/traceability-chain',
    title: bi('溯源链', 'Traceability chain'),
    statement: bi(
      '建立一条从每次测量回溯到共同基准的连续链条，使不同时间、不同仪器、不同团队的读数第一次可以被放在一起比较。',
      'Build an unbroken chain from every measurement back to a shared reference, so that readings from different times, instruments and teams can be compared at all.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'method',
    quantities: [
      q('共同基准', 'the shared reference', '链条的终点；一切可比性都从它借来', 'the end of the chain, from which all comparability is borrowed'),
      q('链条环节', 'links in the chain', '每一次传递，各自带自己的不确定度', 'each transfer, carrying its own uncertainty'),
      q('累积不确定度', 'accumulated uncertainty', '沿链相加的那个量', 'the quantity that adds up along the chain'),
    ],
    failsWhen: bi(
      '链条断裂或基准本身漂移时，全部下游读数一起不可比，而且断点常常在很久以后才被发现——损失是回溯性的。',
      'If a link breaks or the reference itself drifts, everything downstream becomes incomparable at once, and the break is usually found long afterwards, so the loss is retroactive.',
    ),
    provenance: WAVE_4_PROVENANCE([1121, 1468, 1174, 747, 678]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/injected-randomness',
    title: bi('注入受控随机性', 'Injecting controlled randomness'),
    statement: bi(
      '在选择机制里主动加入随机，放弃对噪声区间内排序的假装精确——当候选之间的真实差异小于评估噪声时，抽签比排名更诚实。',
      'Put randomness into the selection mechanism on purpose, giving up the pretence of ranking inside the noise band — when the true differences between candidates are smaller than the assessment noise, a lottery is more honest than a rank.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'method',
    quantities: [
      q('噪声区间', 'the noise band', '评估误差覆盖的那段排名；区间内的名次没有信息', 'the stretch of the ranking covered by assessment error, inside which position carries no information'),
      q('随机化比例', 'randomised fraction', '交给抽签的那部分', 'the share handed to the lottery'),
      q('可估计的因果对比', 'the causal contrast it buys', '随机化顺带产生的、原本拿不到的对照', 'the comparison randomisation incidentally creates and that was otherwise unavailable'),
    ],
    failsWhen: bi(
      '当排序信号确实可靠、候选间差异明显大于评估噪声时，注入随机纯属浪费——它牺牲的是真实可得的择优。',
      'When the ranking signal is genuinely reliable and the differences exceed the assessment noise, injected randomness is pure waste: it gives up selection that was actually available.',
    ),
    provenance: WAVE_4_PROVENANCE([1443, 1167, 459, 1175]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/preregistration',
    title: bi('预注册', 'Preregistration'),
    statement: bi(
      '在看到数据之前冻结分析计划，使事后的选择自由度不可用——它不提高单项研究的正确率，它让「这条结论有多少来自选择」变得可被审计。',
      'Freeze the analysis plan before seeing the data, so the degrees of freedom cannot be spent afterwards — it does not make any single study more likely to be right; it makes "how much of this conclusion came from choosing" auditable.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'method',
    quantities: [
      q('被冻结的自由度', 'the frozen degrees of freedom', '结局、样本、分析路径、停止规则', 'outcome, sample, analysis path, stopping rule'),
      q('冻结时点', 'the moment of freezing', '必须早于看到数据；晚一步整件事就失效', 'it must precede sight of the data; a step later and the whole thing is void'),
      q('偏离记录', 'the deviation record', '实际执行与计划之差——真正被读的那一部分', 'the gap between what was planned and what was run, which is the part actually worth reading'),
    ],
    failsWhen: bi(
      '事后注册无效，探索性研究也不适用：把一项本就该自由搜索的研究套上预注册，只会让它伪装成确认性研究。',
      'Registering afterwards is worthless, and exploratory work is out of scope: forcing a study that ought to search freely into a preregistration only disguises it as confirmatory.',
    ),
    provenance: WAVE_4_PROVENANCE([1629, 467, 1764, 1807, 320]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/counterfactual-trace',
    title: bi('反事实留痕', 'Recording the road not taken'),
    statement: bi(
      '主动记录那些被考虑过却没有被选中的路径，使「没发生的事」也留下可分析的痕迹——否则档案里只剩下胜者，而选择本身不可研究。',
      'Deliberately record the paths that were considered and not taken, so that what did not happen still leaves an analysable trace — otherwise the archive holds only the winners and the act of choosing cannot be studied.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'method',
    quantities: [
      q('候选路径集', 'the candidate set', '当时真正被考虑过的选项，而非事后重构的', 'the options genuinely on the table at the time, not reconstructed afterwards'),
      q('选择依据', 'the recorded reason', '当时写下的取舍理由', 'the justification as written then'),
      q('未选路径的结论分布', 'the distribution over unchosen paths', '把「换一条路会怎样」变成可报告的量', 'what turns "what if we had chosen otherwise" into something reportable'),
    ],
    failsWhen: bi(
      '分支空间过大时无法穷尽记录——此时留下的痕迹本身就是一个有选择的样本，反事实分析会继承记录者的偏好。',
      'When the branch space is large the record cannot be exhaustive, so the trace is itself a selected sample and the counterfactual analysis inherits the recorder\'s preferences.',
    ),
    provenance: WAVE_4_PROVENANCE([1807, 1851, 682, 681, 537]),
    mappings: [],
  },
];

export const WAVE_4_STRUCTURES: SeedStructure[] = [...REGULARITIES, ...METHODS];

// ─────────────────────────────────────────────────────────────────────────────
// 三、提案 — 候选的 结构⇄岛 边，尚未经人确认。
// ─────────────────────────────────────────────────────────────────────────────

/**
 * What an edge to a structure asserts.
 *
 * `embodies`  — 这个岛的现象就是该规律的一个实例。
 * `breaks`    — 这个岛正是该规律的成立条件失效的那一类；它对结构同样有信息量，
 *               而且往往比又一个正例更有信息量。
 * `practices` — 这个岛的研究依赖这一手法，或直接以这一手法本身为研究对象。
 *               只对 `kind: 'method'` 的结构有意义。
 */
export type StructureRelation = 'embodies' | 'breaks' | 'practices';

/**
 * A proposal is a pair of POINTERS plus one authored sentence.
 *
 * Nothing here copies text. `quantity` indexes the structure's own
 * `quantities`; `evidence` indexes the island's own authored depth; both
 * resolve at read time, so a proposal cannot drift from what either side
 * actually says. The single authored field is `check`, and a `check` states
 * what a reviewer must confirm — it never asserts that the pairing holds.
 *
 * These are NOT coverage. An island carrying only a proposal is still an island
 * that connects to nothing, and should still be counted as one.
 */
export interface Wave4StructureProposal {
  /** Island slug. Must exist in FRONTIERS. */
  slug: string;
  structureId: string;
  relation: StructureRelation;
  /** Index into the structure's own `quantities`. */
  quantity: number;
  /** Index into the island's own authored depth. */
  evidence: {
    field: 'qfocus' | 'brief' | 'overview' | 'approaches' | 'barrier' | 'whyMatters';
    index?: number;
  };
  /** The one authored field: what a reviewer has to confirm. */
  check: Bilingual;
}

/**
 * Ten proposals across five of the seventeen structures. The other twelve get
 * none, and that is the honest result rather than an unfinished one: their
 * corpus support is real but sits in records that are not islands (see
 * `WAVE_4_ISLAND_CANDIDATES`). Three candidates the scorer ranked highly were
 * read and dropped — `construct-validity-evaluation-science` against 溯源链
 * (construct validity is not a traceability chain), and `formal-math` and
 * `ai-assisted-theorem-proving` against 不可判定性 (undecidability is background
 * to both islands, not a quantity either one works with).
 */
export const WAVE_4_PROPOSALS: Wave4StructureProposal[] = [
  {
    slug: 'generic-early-warning-signals-for',
    structureId: 'struct://xfrontier/critical-slowing-down',
    relation: 'embodies',
    quantity: 1,
    evidence: { field: 'brief' },
    check: bi(
      '复核这一条要确认的是：岛文里「恢复变慢、方差与自相关升高」指的是否就是本结构的同一组量，而不是另一套同名统计量。岛自身已给出判据——它的 barrier 说在噪声大的真实系统里信号微弱、易生假阳性，这正是该结构预测的失效方式，而非与它无关的困难。',
      'What a reviewer must confirm: whether the island\'s "recovery slows, variance and autocorrelation rise" is this structure\'s own set of quantities rather than a same-named statistic. The island supplies the test itself — its barrier says the signal is weak and prone to false positives in noisy real systems, which is the failure this structure predicts rather than an unrelated difficulty.',
    ),
  },
  {
    slug: 'an-early-warning-science-for',
    structureId: 'struct://xfrontier/critical-slowing-down',
    relation: 'embodies',
    quantity: 0,
    evidence: { field: 'approaches', index: 0 },
    check: bi(
      '复核这一条要确认的是：这个岛把通用前兆用在「未知未知」上，它需要的是恢复速率趋零这一机制，还是只需要「有某种与机制无关的信号」这一更弱的主张。两者差别很大——后者不蕴含临界慢化。',
      'What a reviewer must confirm: this island applies generic precursors to unknown unknowns, so does it need the recovery rate going to zero, or only the weaker claim that some mechanism-independent signal exists? The difference matters — the weaker claim does not entail critical slowing down.',
    ),
  },
  {
    slug: 'computable-criteria-for-rate-induced',
    structureId: 'struct://xfrontier/critical-slowing-down',
    relation: 'breaks',
    quantity: 0,
    evidence: { field: 'brief' },
    check: bi(
      '这是一条反例提案，不是正例。要确认的是：速率诱导临界确实是本结构 failsWhen 所指的那一类——岛文说「即便终态仍在安全域内，只要参数变化速率超过临界速度，系统就会跟不上而崩溃」，若属实则恢复速率并未趋零，前兆按结构自身的说法就不该出现。',
      'This is a counter-case, not an instance. What a reviewer must confirm: that rate-induced tipping is the class this structure\'s failsWhen names — the island states that the end point can stay inside the safe basin and the system still collapses purely because the forcing changed too fast, in which case the recovery rate never approaches zero and, by the structure\'s own account, no precursor should appear.',
    ),
  },
  {
    slug: 'fundamental-limits-information-thermodynamics',
    structureId: 'struct://xfrontier/landauer-erasure-cost',
    relation: 'embodies',
    quantity: 0,
    evidence: { field: 'qfocus' },
    check: bi(
      '复核这一条要确认的是：岛的核心问句「擦除一比特信息，是否必然耗散热量」问的就是本结构的那个下界，且它在单电子/单分子尺度实测的是同一个量，而不是一个同样以 kT 计的其它耗散项。',
      'What a reviewer must confirm: that the island\'s central question — must erasing one bit dissipate heat — is asking about this structure\'s bound, and that what it measures at the single-electron and single-molecule scale is that same quantity rather than another dissipation term that also scales with kT.',
    ),
  },
  {
    slug: 'reversible-adiabatic-cmos',
    structureId: 'struct://xfrontier/landauer-erasure-cost',
    relation: 'breaks',
    quantity: 1,
    evidence: { field: 'brief' },
    check: bi(
      '这是一条反例提案。要确认的是：岛文所说「可逆逻辑通过反计算避免丢弃中间信息」是否确实使该岛落在本结构 failsWhen 之内——若不擦除，下界就不适用，而岛真正的成本转到了谐振时钟、面积与延迟上，这也正是它 barrier 所列的东西。',
      'This is a counter-case. What a reviewer must confirm: whether the island\'s "reversible logic avoids discarding intermediate information through uncomputation" really places it inside this structure\'s failsWhen — if nothing is erased the bound does not apply, and the island\'s real cost moves to resonant clocking, area and latency, which is exactly what its barrier lists.',
    ),
  },
  {
    slug: 'bio-compute-thermo',
    structureId: 'struct://xfrontier/landauer-erasure-cost',
    relation: 'embodies',
    quantity: 0,
    evidence: { field: 'brief' },
    check: bi(
      '这一条不确定，需要一次真正的判断：岛用的是随机热力学的熵产生界来限制细胞感知与纠错的能耗，而 Landauer 界限制的是擦除。两者同属信息热力学，但不是同一个下界。若审阅者认定该岛的量是熵产生界而非擦除界，这条提案应当被否掉，而不是改写成勉强成立。',
      'This one is uncertain and needs a real judgement. The island bounds the energy of cellular sensing and proofreading with a stochastic-thermodynamic entropy-production bound, whereas Landauer bounds erasure. Both live in information thermodynamics but they are not the same floor. If the reviewer finds the island\'s quantity is the entropy-production bound rather than the erasure bound, this proposal should be rejected rather than reworded into a fit.',
    ),
  },
  {
    slug: 'proximal-causal-inference-negative-control',
    structureId: 'struct://xfrontier/negative-control',
    relation: 'practices',
    quantity: 2,
    evidence: { field: 'barrier' },
    check: bi(
      '复核这一条要确认的是：该岛的阴性对照代理是否就是本结构说的那个「已知应为零的探针」。岛自身的 barrier 给出了判据——它说阴性对照选择不当会让去混杂本身变成新的偏差来源，这与本结构 failsWhen 所写的是同一个失效。',
      'What a reviewer must confirm: whether the island\'s negative-control proxies are this structure\'s "probe known to read zero". The island supplies the test — its barrier says a badly chosen negative control turns the de-confounding into a new source of bias, which is the same failure this structure\'s failsWhen states.',
    ),
  },
  {
    slug: 'proximal-causal-identification-negative',
    structureId: 'struct://xfrontier/negative-control',
    relation: 'practices',
    quantity: 0,
    evidence: { field: 'barrier' },
    check: bi(
      '复核这一条要确认的是：岛文「负对照必须真的负、一旦代理被处理或结果暗中影响识别就悄悄失效」与本结构的 failsWhen 是否为同一条件。注意这个岛在既有提案队列里已被挂在「干预可识别性」名下——两条提案若都成立，理由必须各自独立，不能靠共用「识别」二字。',
      'What a reviewer must confirm: whether the island\'s "the control must genuinely be null, and identification fails silently once the proxy is touched by treatment or outcome" is the same condition as this structure\'s failsWhen. Note this island already sits in the proposal queue under 干预可识别性 — if both proposals stand, each needs its own reason and neither may lean on the shared word 识别.',
    ),
  },
  {
    slug: 'zero-knowledge-verifiable-scientific-computation',
    structureId: 'struct://xfrontier/zero-knowledge-verification',
    relation: 'practices',
    quantity: 2,
    evidence: { field: 'barrier' },
    check: bi(
      '复核这一条要确认的是：岛 barrier 里的「电路表达力有限，ONNX 120+ 算子只支持约 50 个」是否就是本结构所说的那条真正边界，而不只是一个会随工程进展消失的暂时限制。这个判断决定该岛提供的是结构的实例还是它的反例。',
      'What a reviewer must confirm: whether the island\'s barrier — limited circuit expressiveness, roughly 50 of 120-plus ONNX operators supported — is this structure\'s real boundary rather than a temporary engineering limit that will disappear. That judgement decides whether the island is an instance of the structure or a counter-case to it.',
    ),
  },
  {
    slug: 'counterfactual-history-causal-cliometrics',
    structureId: 'struct://xfrontier/counterfactual-trace',
    relation: 'practices',
    quantity: 2,
    evidence: { field: 'approaches', index: 2 },
    check: bi(
      '这一条是部分匹配，需要判断而不是核对：岛的 approaches[2]「预注册供体池、时间窗和替代结局，报告所有合理分析的结论分布」确实是在为未被选中的分析路径留痕，但本结构说的是给未被选中的**历史**路径留痕。审阅者要判断的是：把「分析选择」当作这一结构的一个基底，是真的迁移，还是只是共用了「反事实」一词。',
      'This is a partial match and needs judgement rather than checking. The island\'s approaches[2] — preregister the donor pool, the window and alternative outcomes, then report the distribution across all defensible analyses — really does leave a trace of the analysis paths not taken, but this structure is about the historical paths not taken. What the reviewer must decide is whether treating analytic choice as a substrate of this structure is a real transfer or only a shared use of the word counterfactual.',
    ),
  },
];

/**
 * Records the corpus supports strongly for a wave-4 structure and that are NOT
 * islands — in `FRONTIERS` here, and also absent from the 371-island wave-3 set.
 *
 * This list is the other half of the expansion, and it points the opposite way
 * from how islands have been added so far. The recorded cost of adding islands
 * first and looking for structures afterwards is on file: a human reader
 * rejected 378 of 419 candidate pairings, and "the typical rejection [was] not
 * a weak relationship but an ABSENT QUANTITY". Starting from a structure and
 * asking which records supply its quantity inverts that: an island created this
 * way arrives already connected, instead of joining the set that connects to
 * nothing.
 *
 * These are candidates, not a queue. Each still needs the island authoring any
 * island needs — qfocus, brief, depth, cited literature — and the pairing still
 * needs the same ratification as any proposal above.
 */
export const WAVE_4_ISLAND_CANDIDATES: ReadonlyArray<{
  recordId: number;
  structureId: string;
  note: Bilingual;
}> = [
  {
    recordId: 1072,
    structureId: 'struct://xfrontier/tacit-craft-explicitation',
    note: bi(
      '通用样品制备机器人 — 全轮 100 个主题里最强的单条主题⇄记录匹配。样品制备正是「最依赖手艺、最说不清楚」的那一步。',
      'General-purpose sample-preparation robotics — the strongest single topic-to-record match in the whole run. Sample prep is precisely the step that depends most on craft and is least articulable.',
    ),
  },
  {
    recordId: 130,
    structureId: 'struct://xfrontier/self-assembly',
    note: bi('仿生分子自组装 — 自组装在 main 与 wave 3 都没有一个真正的落点。', 'Biomimetic molecular self-assembly — self-assembly has no genuine landing site in either main or wave 3.'),
  },
  {
    recordId: 12,
    structureId: 'struct://xfrontier/quorum-sensing',
    note: bi('群体感应工程 — 该结构的命名基底本身还不是岛。', 'Quorum-sensing engineering — the substrate the structure is named after is not yet an island.'),
  },
  {
    recordId: 168,
    structureId: 'struct://xfrontier/within-subject-control',
    note: bi('群体自我量化与 N-of-1 实验 — N-of-1 是自身对照的教科书基底。', 'Population self-quantification and N-of-1 trials — N-of-1 is the textbook substrate for within-subject control.'),
  },
  {
    recordId: 238,
    structureId: 'struct://xfrontier/critical-slowing-down',
    note: bi('韧性科学与临界预警 — 临界慢化在 main 上只有两个落点，其余七条强相关记录都不是岛。', 'Resilience science and critical-transition early warning — critical slowing down has only two landing sites in main; the other seven strongly related records are not islands.'),
  },
  {
    recordId: 826,
    structureId: 'struct://xfrontier/critical-slowing-down',
    note: bi('生态系统临界点的实时临界减速预警 — 遥感时序上的连续度量，与 XF-1185 的理论侧互补。', 'Real-time critical-slowing-down early warning for ecosystem tipping points — continuous measurement on remote-sensing time series, complementary to the theoretical side of XF-1185.'),
  },
  {
    recordId: 383,
    structureId: 'struct://xfrontier/computational-lower-bounds',
    note: bi('计算复杂性与可解性边界 — 该结构在 main 上没有任何站得住的候选。', 'Computational complexity and the boundary of tractability — the structure has no defensible candidate in main at all.'),
  },
  {
    recordId: 1443,
    structureId: 'struct://xfrontier/injected-randomness',
    note: bi('科研资助的随机化：部分抽签与资助机制设计 — 主题「在哪里出现」列点名的基底，语料里确有其记录。', 'Randomisation in research funding: partial lotteries and mechanism design — a substrate the topic\'s own column names, and the corpus does hold the record.'),
  },
  {
    recordId: 1021,
    structureId: 'struct://xfrontier/aggregating-independent-judgements',
    note: bi('可复现性预测市场·可信度定价 — 独立判断聚合在 main 上五条候选一条都不成立。', 'Replication prediction markets and credibility pricing — none of the five candidates for judgement aggregation in main hold up.'),
  },
  {
    recordId: 1121,
    structureId: 'struct://xfrontier/traceability-chain',
    note: bi('认识论可追溯账本 — 溯源链结构最直接的落点，且与本仓库自身的账本设计同形。', 'An epistemic traceability ledger — the most direct landing site for the traceability chain, and isomorphic to this repository\'s own ledger design.'),
  },
  {
    recordId: 1706,
    structureId: 'struct://xfrontier/landauer-erasure-cost',
    note: bi('有限时间信息擦除的最优控制 — 直接对应结构的第三个量「过程时长」。', 'Optimal control of finite-time information erasure — maps directly onto the structure\'s third quantity, process duration.'),
  },
  {
    recordId: 1218,
    structureId: 'struct://xfrontier/zero-knowledge-verification',
    note: bi('零知识模型审计：不开箱的合规与评测证明 — 与已是岛的 XF-1016 是同一结构的不同基底。', 'Zero-knowledge model audit: compliance and evaluation proofs without opening the box — a different substrate of the same structure as XF-1016, which is already an island.'),
  },
];
