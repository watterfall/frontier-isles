import type { SeedStructure, StructureQuantity } from './structures';

/**
 * Wave 5 — 20 more structures from the same topic set, on the same terms as
 * wave 4: zero mappings, `proposed`, no edge claimed anywhere.
 *
 * Selection. The 100 topics were scored against the 1,848-record xfrontier
 * corpus (xf-6eb361265784); 17 duplicated an existing structure, 17 became
 * wave 4, and these are the best-supported 20 of the 66 that remain. The score
 * stays one-directional — high is evidence for, low is not evidence against —
 * so the 46 left over are deferred, not rejected.
 *
 * Two entries sit close to a structure that already exists and say so in their
 * own statement rather than pretending to be new territory:
 *
 *   self-organised-criticality vs ISO-20 分支过程与临界性 — branching says what
 *   happens AT criticality; SOC says why a system arrives there without anyone
 *   tuning it. Different question, same neighbourhood.
 *
 *   spontaneous-modularity vs ISO-22 图拉普拉斯与代数连通度 — the Laplacian
 *   spectrum measures how separable a graph is; spontaneous modularity asks why
 *   the separation appears at all under evolution or design pressure.
 *
 * If a curator judges either pair to be one structure rather than two, the
 * merge direction is to keep the ISO-backed one — it carries upstream
 * provenance that a locally authored structure cannot.
 */

type Bilingual = { zh: string; en: string };

const bi = (zh: string, en: string): Bilingual => ({ zh, en });

const q = (
  nameZh: string,
  nameEn: string,
  roleZh: string,
  roleEn: string,
): StructureQuantity => ({ name: bi(nameZh, nameEn), role: bi(roleZh, roleEn) });

const WAVE_5_PROVENANCE = (recordIds: number[]) => ({
  source: 'xfrontier.science',
  url: 'https://xfrontier.science/',
  recordIds,
  reviewedAt: '2026-08-22',
});

// ─────────────────────────────────────────────────────────────────────────────
// 规律类
// ─────────────────────────────────────────────────────────────────────────────

const REGULARITIES: SeedStructure[] = [
  {
    id: 'struct://xfrontier/self-organised-criticality',
    title: bi('自组织临界', 'Self-organised criticality'),
    statement: bi(
      '缓慢的驱动加上快速的松弛，会让系统自己停在临界点上而不需要任何人调参——临界性从一个需要精确设定的特例，变成一个吸引子。',
      'Slow driving plus fast relaxation parks a system on its own critical point with nobody tuning anything — criticality stops being a finely set special case and becomes an attractor.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('驱动速率', 'driving rate', '外界向系统加载的速度', 'the rate at which the outside loads the system'),
      q('松弛速率', 'relaxation rate', '系统卸载一次扰动的速度；它必须远快于驱动', 'the rate at which the system sheds a disturbance, which must be far faster than the driving'),
      q('雪崩尺寸分布', 'avalanche size distribution', '停在临界点的可观测后果，通常是幂律', 'the observable consequence of sitting at the critical point, usually a power law'),
    ],
    failsWhen: bi(
      '驱动与松弛的时标不分离时失效：加载快到系统来不及卸载，它就不再停在临界点，而是被推过去。',
      'It fails when the two timescales are not separated: load faster than the system can shed, and it no longer sits at the critical point — it is pushed through it.',
    ),
    provenance: WAVE_5_PROVENANCE([229, 556, 826, 238, 1224]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/phase-separation',
    title: bi('相分离', 'Phase separation'),
    statement: bi(
      '一个混合体系可以自发分成两相而不需要任何边界结构：分开的界面是相互作用的产物，不是先建好的墙。',
      'A mixed system can separate into two phases with no boundary structure at all: the interface is a product of the interactions, not a wall built in advance.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('相互作用强度', 'interaction strength', '同类相吸相对于混合熵的强度', 'how strongly like attracts like, measured against the entropy of mixing'),
      q('临界组成', 'critical composition', '分离开始发生的配比', 'the mixture ratio at which separation begins'),
      q('界面张力', 'interfacial tension', '分开之后维持界面的代价；它决定液滴的大小分布', 'the cost of holding the interface once separated, which sets the droplet size distribution'),
    ],
    failsWhen: bi(
      '相互作用低于临界强度时体系保持混合——观察到"分层"也可能来自外加的边界或输运，而不是自发相分离。',
      'Below the critical interaction strength the system stays mixed — and an observed "layering" can equally come from an imposed boundary or from transport rather than from spontaneous separation.',
    ),
    provenance: WAVE_5_PROVENANCE([1361, 580, 1477, 751, 1841]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/spontaneous-modularity',
    title: bi('模块的自发涌现', 'Spontaneous modularity'),
    statement: bi(
      '在演化或设计压力下，系统会自己分成内部强耦合、彼此弱耦合的模块——没有人画过这条分界线，但它出现了，而且往往可复现。',
      'Under evolutionary or design pressure a system splits itself into blocks that are strongly coupled inside and weakly coupled to each other — nobody drew the dividing line, yet it appears, and often reproducibly.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('模块内/间耦合比', 'within-to-between coupling ratio', '模块性本身；比值趋于 1 时模块不存在', 'modularity itself; as the ratio approaches one there are no modules'),
      q('目标变动率', 'rate of goal change', '常被认为是驱动模块化的压力——目标频繁变而共享子目标不变', 'the pressure usually credited with driving modularity: goals that change often while sub-goals do not'),
      q('重连代价', 'rewiring cost', '把一条跨模块连接建起来要付的代价', 'what it costs to create one connection across a module boundary'),
    ],
    failsWhen: bi(
      '跨模块耦合并不弱时，分解就只是一张好看的图：模块边界可以在数据上被划出来，却不预测任何干预后果。',
      'When the across-block coupling is not actually weak, the decomposition is only a nice picture: the boundaries can be drawn on the data yet predict nothing about what an intervention will do.',
    ),
    provenance: WAVE_5_PROVENANCE([1504, 1501, 204, 1397, 235]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/conjugate-uncertainty',
    title: bi('共轭量的不确定性关系', 'Uncertainty between conjugate quantities'),
    statement: bi(
      '某些成对的量无法同时被精确确定，而且这不是仪器不够好：把一个测准的动作本身就在把另一个弄糊，代价有下界。',
      'Certain pairs of quantities cannot both be pinned down, and not because the instrument is poor: the act of sharpening one is what blurs the other, and the cost has a floor.',
    ),
    status: 'proposed',
    theme: 'unknown-mapping',
    kind: 'regularity',
    quantities: [
      q('共轭对', 'the conjugate pair', '被关系绑在一起的那两个量', 'the two quantities the relation binds together'),
      q('乘积下界', 'the product floor', '两者不确定度之积不可低于的值', 'the value the product of the two uncertainties cannot go below'),
      q('分配方式', 'how the cost is allocated', '可以把不确定性从一个量挪到另一个，但挪不掉', 'uncertainty can be moved from one quantity to the other, but not removed'),
    ],
    failsWhen: bi(
      '弱测量或联合估计可以重新分配代价，因此"测不准"从来不等于"测不了"——它只说明总账不能为零，不说明某一项不能很小。',
      'Weak measurement and joint estimation can reallocate the cost, so "cannot both be certain" never means "cannot be measured": it bounds the total, not either term.',
    ),
    provenance: WAVE_5_PROVENANCE([151, 1678, 382, 1042, 589]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/finite-time-dissipation',
    title: bi('有限时间的额外耗散', 'The excess cost of finishing in finite time'),
    statement: bi(
      '把一个过程做得越快，超出理论下界的额外浪费越大，而且这份额外量通常与速度成正比——"最省"与"最快"是同一条曲线的两端。',
      'The faster a process is driven, the more it wastes above the theoretical floor, and the excess typically scales with the speed — cheapest and fastest sit at opposite ends of one curve.',
    ),
    status: 'proposed',
    theme: 'living-computation',
    kind: 'regularity',
    quantities: [
      q('准静态下界', 'the quasi-static floor', '无限慢完成时的代价', 'the cost of doing it infinitely slowly'),
      q('过程时长', 'process duration', '实际用了多久', 'how long it actually took'),
      q('额外耗散', 'excess dissipation', '超出下界的部分；它是时长的函数', 'the part above the floor, as a function of duration'),
    ],
    failsWhen: bi(
      '准静态极限下额外代价趋零，所以这条结构只在"有截止时间"的场景里有内容；没有时限的过程不受它约束。',
      'In the quasi-static limit the excess goes to zero, so the structure only has content where there is a deadline; a process with no time limit is not bound by it.',
    ),
    provenance: WAVE_5_PROVENANCE([1706, 1707, 572, 549, 1517]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/robustness-efficiency-tradeoff',
    title: bi('鲁棒与效率的对立', 'The robustness-efficiency tradeoff'),
    statement: bi(
      '冗余买来抗扰，精简买来效率，而同一份资源不能同时买两样——一个系统在这条线上的位置，暴露了它预期遇到什么样的扰动。',
      'Redundancy buys tolerance, leanness buys efficiency, and the same resource cannot buy both — where a system sits on that line reveals what disturbance it expects.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('冗余度', 'redundancy', '为同一功能保留的备份数量', 'how many spares are kept for one function'),
      q('扰动分布', 'the disturbance distribution', '决定这份冗余值不值；它常常是最不确定的输入', 'what decides whether the redundancy is worth it, and usually the least certain input'),
      q('单位功能成本', 'cost per unit of function', '被精简所压低的那个量', 'the quantity leanness drives down'),
    ],
    failsWhen: bi(
      '冗余不占成本时不构成权衡——信息可以近乎免费地复制，所以数字冗余常常不在这条曲线上，把它当作同一个取舍是误用。',
      'Where redundancy is free there is no tradeoff: information copies at almost no cost, so digital redundancy often does not sit on this curve, and treating it as the same choice is a misuse.',
    ),
    provenance: WAVE_5_PROVENANCE([285, 92, 396, 417, 1207]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/cognitive-bandwidth-ceiling',
    title: bi('认知带宽上限', 'The cognitive bandwidth ceiling'),
    statement: bi(
      '一个处理者能同时维持的关系数有硬上限，超过之后不是慢一点，而是关系开始成批丢失——群体规模、缓存容量与注意力受同一条约束。',
      'A processor can hold only so many relations at once, and past that point it does not merely slow down: relations start dropping in batches — group size, cache capacity and attention are under one constraint.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('可同时维持的关系数', 'relations held at once', '被上限直接约束的那个量', 'the quantity the ceiling binds directly'),
      q('维持一条关系的单位开销', 'cost of holding one relation', '决定上限落在哪里', 'what decides where the ceiling falls'),
      q('外部记忆容量', 'external memory', '把上限抬高的唯一途径，也是它可被绕过的证据', 'the only thing that raises the ceiling, and the evidence that it can be worked around'),
    ],
    failsWhen: bi(
      '有外部记忆辅助时上限抬升，所以在有名册、有文档、有缓存的场景里，观察到的规模上限反映的是工具而非认知。',
      'External memory raises the ceiling, so wherever there are rosters, documents or caches, an observed size limit reflects the tooling rather than the cognition.',
    ),
    provenance: WAVE_5_PROVENANCE([348, 526, 1327, 1270, 366]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/metric-distortion',
    title: bi('度量扭曲', 'Metric distortion under optimisation'),
    statement: bi(
      '一旦某个指标成为被优化的目标，被优化者就会去动指标与目标之间的那段缝隙，于是指标继续上升而目标不再跟随。',
      'The moment a measure becomes the target, whoever is measured works the gap between measure and goal, so the measure keeps rising while the goal stops following it.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'regularity',
    quantities: [
      q('指标与目标的缝隙', 'the gap between measure and goal', '整条结构的来源；缝隙为零时扭曲不发生', 'the source of the whole structure; with no gap there is no distortion'),
      q('优化压力', 'optimisation pressure', '施加在被度量者身上的力度', 'how hard the measured party is pushed'),
      q('脱钩速度', 'rate of decoupling', '指标与目标分道扬镳的快慢', 'how fast measure and goal come apart'),
    ],
    failsWhen: bi(
      '指标与目标完全同构时不发生，但这种情况罕见；更常见的失效是把它当成万能否定——有缝隙不等于缝隙已被利用，需要证据。',
      'It does not happen when measure and goal are isomorphic, which is rare; the more common misuse is as a universal dismissal — a gap existing is not evidence that it has been exploited.',
    ),
    provenance: WAVE_5_PROVENANCE([455, 1141, 1205, 1366, 617]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/parallel-speedup-ceiling',
    title: bi('并行加速上界', 'The ceiling on parallel speedup'),
    statement: bi(
      '加速比被不可并行的那一小部分卡死：不管投入多少并行资源，总时间都不会低于串行段本身——瓶颈是结构，不是资源。',
      'Speedup is capped by the fraction that cannot be parallelised: however much parallel resource is added, total time never falls below the serial part — the bottleneck is structural, not a resource shortage.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('串行占比', 'serial fraction', '不可并行的那部分；它单独决定上界', 'the part that cannot be parallelised, which alone sets the ceiling'),
      q('并行资源数', 'parallel resources', '被投入的份数；回报随其增加而递减', 'how many are thrown at it, with diminishing returns'),
      q('协调开销', 'coordination overhead', '常常被忽略的第三项；足够大时加速比会转为下降', 'the third term usually left out, which past a point turns speedup into slowdown'),
    ],
    failsWhen: bi(
      '问题规模随资源同步增长时约束改变——固定问题的上界不适用于"资源多了就把问题做大"的场景，这两种情形常被混为一谈。',
      'The constraint changes when the problem grows with the resources: a fixed-size ceiling does not apply where more capacity is spent on a bigger problem, and the two situations are routinely conflated.',
    ),
    provenance: WAVE_5_PROVENANCE([135, 1508, 817, 816, 1275]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/unit-of-individuality',
    title: bi('个体性的不确定', 'What counts as one individual'),
    statement: bi(
      '"什么算一个单位"没有客观给定的答案：边界要靠论证划出来，而划在哪里会改变随后所有的计数、归因与权利分配。',
      'There is no given answer to what counts as one: the boundary has to be argued for, and where it is drawn changes every count, attribution and entitlement that follows.',
    ),
    status: 'proposed',
    theme: 'unknown-mapping',
    kind: 'regularity',
    quantities: [
      q('候选边界', 'the candidate boundary', '被提议用来切分个体的那条线', 'the line proposed as the division between individuals'),
      q('边界内外的信息流之比', 'information flow inside versus across', '常被用作划界判据的量', 'the quantity most often used as the criterion for drawing it'),
      q('随边界变化的下游量', 'what changes downstream', '计数、适合度、责任、权利——划错的代价在这里显形', 'counts, fitness, responsibility, entitlement — where a wrong boundary shows its cost'),
    ],
    failsWhen: bi(
      '存在物理隔离的天然边界时问题不出现；真正的困难只在边界必须被论证的场合，而那时"用哪个判据"本身已经是一个立场。',
      'The problem disappears where a physical boundary already isolates the unit; the difficulty is confined to cases where the boundary must be argued, and there the choice of criterion is already a position.',
    ),
    provenance: WAVE_5_PROVENANCE([596, 216, 321, 232, 151]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/measurement-backaction',
    title: bi('观测反作用', 'Measurement back-action'),
    statement: bi(
      '测量本身改变被测的对象，所以"测到的值"总是测量之后的那个系统的值——差别有多大是个可估的量，而不是一句免责声明。',
      'Measuring changes what is measured, so the value obtained always belongs to the system after measurement — how big the difference is can be estimated, and is not a disclaimer.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'regularity',
    quantities: [
      q('反作用强度', 'back-action strength', '一次测量对被测量的扰动大小', 'how much one measurement disturbs what it measures'),
      q('信息获取量', 'information gained', '与反作用强度成对出现，通常不能只要一头', 'paired with back-action; you rarely get one without the other'),
      q('测量频次', 'measurement frequency', '把单次反作用放大成系统性偏移的那个乘子', 'the multiplier that turns a single disturbance into a systematic shift'),
    ],
    failsWhen: bi(
      '非侵入或弱测量可以把反作用压到可忽略，所以这条结构不是"任何观察都不可信"的许可证——它要求的是把反作用估出来。',
      'Non-invasive or weak measurement can push back-action to negligible, so the structure is not a licence to distrust all observation: it asks for the back-action to be estimated.',
    ),
    provenance: WAVE_5_PROVENANCE([685, 71, 1229, 1000, 679]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/selective-gate',
    title: bi('门控选择通透', 'The selective gate'),
    statement: bi(
      '一道只让部分东西通过的边界，其选择规则会反过来塑造两侧的组成——边界不是中立的容器壁，它是一台持续运行的分选机。',
      'A boundary that admits only some of what arrives shapes the composition on both sides through its own selection rule — the boundary is not a neutral wall but a sorter that never stops running.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('选择规则', 'the selection rule', '决定什么能过；它是这台分选机的全部内容', 'what decides admission, and the whole content of the sorter'),
      q('通量', 'flux', '单位时间通过的量', 'how much crosses per unit time'),
      q('两侧组成差', 'the composition difference', '分选累积的结果，也是规则可被反推的地方', 'the accumulated result of sorting, and where the rule can be inferred back'),
    ],
    failsWhen: bi(
      '边界可被绕行，或规则可被伪造时失效：此时两侧组成差反映的是绕行路径与伪装能力，而不是那条声称中的选择规则。',
      'It fails where the boundary can be bypassed or the rule forged: the composition difference then reflects the detour and the disguise rather than the stated selection rule.',
    ),
    provenance: WAVE_5_PROVENANCE([1857, 348, 1055, 526, 1573]),
    mappings: [],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 方法类
// ─────────────────────────────────────────────────────────────────────────────

const METHODS: SeedStructure[] = [
  {
    id: 'struct://xfrontier/ex-vivo-reconstitution',
    title: bi('体外剥离重构', 'Ex-vivo reconstitution'),
    statement: bi(
      '把一个功能子系统从原生宿主里剥离出来，在受控环境中重建它——赌的是这个子系统的功能不依赖宿主提供的、没有被写下来的环境。',
      'Lift a functional subsystem out of its native host and rebuild it under control — betting that its function does not depend on something the host provided and nobody wrote down.',
    ),
    status: 'proposed',
    theme: 'living-computation',
    kind: 'method',
    quantities: [
      q('被剥离的子系统', 'the lifted subsystem', '边界划在哪里，是整个方法的第一个决定', 'where the boundary is cut, which is the method\'s first decision'),
      q('重建环境的完备度', 'completeness of the rebuilt environment', '被显式补回来的宿主条件有多少', 'how much of what the host supplied has been put back explicitly'),
      q('功能保真度', 'retained function', '重建体相对原位的表现；差额就是隐性环境的量', 'how the rebuild performs against the original, the shortfall measuring the implicit environment'),
    ],
    failsWhen: bi(
      '子系统依赖宿主提供的隐性环境时失败，而这种失败最难诊断：它看起来像重建做得不够好，其实是边界划错了。',
      'It fails when the subsystem depends on an implicit contribution from the host, and that failure is the hardest to diagnose: it looks like a poor rebuild when it is a badly placed boundary.',
    ),
    provenance: WAVE_5_PROVENANCE([4, 418, 1459, 758, 1291]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/intermediate-rung',
    title: bi('中间载体填空隙', 'Building the missing rung'),
    statement: bi(
      '两个成熟层级之间常常隔着一道可达性断层；造一个廉价的中间物把它填上，往往比在两端各自加力更有效。',
      'Between two mature tiers there is often a reachability gap; building a cheap intermediate to fill it usually beats pushing harder at either end.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'method',
    quantities: [
      q('断层宽度', 'the size of the gap', '两个层级之间在成本或能力上的落差', 'the drop in cost or capability between the two tiers'),
      q('中间物成本', 'cost of the intermediate', '它必须显著低于上层，否则填不进去', 'which must sit well below the upper tier or it does not fit'),
      q('新增可达者数量', 'newly reachable users', '填上之后能做这件事的人多了多少——方法是否奏效的判据', 'how many more can now do the thing, which is the test of whether it worked'),
    ],
    failsWhen: bi(
      '断层来自能力而非成本时无效：便宜的中间物做不到上层能做的事，这时填进去的只是一个更便宜的下层。',
      'It does not work when the gap is one of capability rather than cost: a cheap intermediate cannot do what the upper tier does, and what gets built is only a cheaper lower tier.',
    ),
    provenance: WAVE_5_PROVENANCE([1116, 299, 418, 77, 1050]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/waste-as-feedstock',
    title: bi('废流即原料', 'Waste as feedstock'),
    statement: bi(
      '把一个流程的废弃输出重新定义为另一个流程的输入——"废物"从来不是物质的性质，而是当前用途集合的性质。',
      'Redefine one process\'s discarded output as another\'s input — "waste" is never a property of the material, only of the current set of uses.',
    ),
    status: 'proposed',
    theme: 'living-computation',
    kind: 'method',
    quantities: [
      q('废流浓度', 'concentration of the stream', '决定提纯要花多少；稀薄是最常见的杀手', 'what sets the cost of concentrating it, and thinness is the usual killer'),
      q('杂质谱', 'the impurity profile', '决定它能进哪些下游流程', 'what decides which downstream processes can accept it'),
      q('提纯成本 vs 下游价值', 'purification cost against downstream value', '这个比值决定方法成不成立', 'the ratio on which the whole method turns'),
    ],
    failsWhen: bi(
      '废流过稀或含毒时提纯成本超过收益——此时"循环"在账面上成立、在能量上不成立，需要把提纯的能耗一并计入才看得出来。',
      'When the stream is too dilute or too toxic the purification costs more than the product is worth: the loop closes on paper and not in energy, and only counting the purification shows it.',
    ),
    provenance: WAVE_5_PROVENANCE([289, 404, 284, 94, 246]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/resistance-rotation',
    title: bi('抗性轮换与组合', 'Rotating and combining by mechanism'),
    statement: bi(
      '按作用机制分组，轮换或组合使用，让对手无法沿单一路径积累抗性——目标是延缓抗性的出现，而不是在抗性出现后去追赶。',
      'Group by mechanism of action, then rotate or combine, so the opponent cannot accumulate resistance along a single path — the aim is to delay resistance rather than chase it once it appears.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'method',
    quantities: [
      q('机制分组', 'mechanism groups', '轮换必须跨越的边界；分组错了轮换等于没轮', 'the boundary the rotation must cross; get the grouping wrong and rotating changes nothing'),
      q('抗性代价', 'the cost of resistance', '抗性个体在无压力时的劣势；它是轮换奏效的前提', 'the disadvantage a resistant individual carries when the pressure is off, and the premise of the whole method'),
      q('轮换周期', 'rotation period', '必须短于抗性固定所需的时间', 'which must be shorter than the time resistance needs to fix'),
    ],
    failsWhen: bi(
      '抗性无代价时轮换无效：撤下压力后抗性个体不衰退，轮换就只是把同一批抗性个体轮着养大。',
      'Rotation is useless where resistance is free: if resistant individuals do not decline once the pressure lifts, rotating merely takes turns growing the same population.',
    ),
    provenance: WAVE_5_PROVENANCE([1663, 1705, 1054, 1526, 6]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/leverage-point',
    title: bi('杠杆点', 'Leverage points'),
    statement: bi(
      '同样的力气作用在系统的不同位置，效果相差几个数量级；由低到高大致是参数、结构、目标、范式，而阻力恰好沿同一方向上升。',
      'The same effort applied at different places in a system differs by orders of magnitude, roughly ascending through parameters, structure, goals and paradigm — and resistance rises along exactly the same axis.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'method',
    quantities: [
      q('介入位置', 'point of intervention', '参数/结构/目标/范式中的哪一层', 'which of parameters, structure, goals or paradigm'),
      q('杠杆倍数', 'leverage', '单位力气换来的系统响应', 'system response per unit of effort'),
      q('阻力', 'resistance', '与杠杆同向上升，所以可及性与杠杆成反比', 'which rises with leverage, making accessibility inversely proportional to it'),
    ],
    failsWhen: bi(
      '杠杆越高阻力越大，所以"找到最高杠杆点"从来不等于"应该从那里下手"——把这条结构当作行动建议是最常见的误用。',
      'Higher leverage means higher resistance, so identifying the highest leverage point never implies acting there — reading the structure as advice is its most common misuse.',
    ),
    provenance: WAVE_5_PROVENANCE([215, 500, 494, 227, 835]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/natural-experiment',
    title: bi('自然实验', 'Natural experiments'),
    statement: bi(
      '利用一个人为无法制造、又恰好把某个因素单独变动的条件，去获得实验才有的对照——代价是这个条件不由你设计，只能论证它够不够干净。',
      'Use a condition nobody could manufacture that happens to move one factor on its own, to get the contrast an experiment would give — at the price that you did not design it and can only argue it is clean enough.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'method',
    quantities: [
      q('被单独变动的因素', 'the factor moved alone', '这个条件的全部价值所在', 'the entire value of the condition'),
      q('同时被改变的其它量', 'what else moved with it', '混杂的来源；必须逐一论证', 'the source of confounding, and what must be argued through one by one'),
      q('可比对照组', 'the comparable group', '未被该条件触及、其余方面相似的那一批', 'those the condition did not touch and who are otherwise alike'),
    ],
    failsWhen: bi(
      '该条件同时改变了其它因素时混杂——而自然实验最危险的地方在于它看起来像随机化，实际的分配机制却从未被写下来。',
      'It is confounded when the condition moved other factors too, and the danger is that a natural experiment looks like randomisation while the actual assignment mechanism was never written down.',
    ),
    provenance: WAVE_5_PROVENANCE([293, 303, 152, 419, 1811]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/alternative-mechanism-panel',
    title: bi('替代机制对照集', 'The panel of alternative mechanisms'),
    statement: bi(
      '主动造出能产生同样表观的其它机制，用它们来排除误判——不是问"我的解释能不能解释数据"，而是问"还有几种能"。',
      'Deliberately construct other mechanisms that would produce the same appearance, and use them to rule out a false call — the question is not whether your explanation fits, but how many others do.',
    ),
    status: 'proposed',
    theme: 'unknown-mapping',
    kind: 'method',
    quantities: [
      q('替代机制集', 'the panel', '被明确列出的其它机制；没列出的等于没排除', 'the alternatives written down, since anything unlisted is unexcluded'),
      q('可区分观测量', 'the discriminating observable', '在各机制下取值不同的那个量', 'the quantity that differs across the mechanisms'),
      q('穷举完备度', 'completeness of the panel', '这条方法唯一无法自证的部分', 'the one thing the method cannot establish about itself'),
    ],
    failsWhen: bi(
      '无法穷举替代机制时对照不完备，所以这条方法只能提高置信，永远不能给出"只可能是它"——把排除法读成证明是它的标准误用。',
      'The panel cannot be exhaustive, so the method raises confidence and never delivers "it can only be this" — reading elimination as proof is its standard misuse.',
    ),
    provenance: WAVE_5_PROVENANCE([639, 1766, 705, 716, 1107]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/standardisation-lowers-the-bar',
    title: bi('标准化降门槛', 'Standardisation as an access ramp'),
    statement: bi(
      '用模块化与现成件把单位成本压到新参与者可及的水平，从而改变的不是效率，而是谁能参与——门槛本身是被设计出来的。',
      'Use modularity and off-the-shelf parts to push unit cost down to where newcomers can reach it: what changes is not efficiency but who can take part — the barrier was a design choice.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'method',
    quantities: [
      q('单位成本', 'unit cost', '被压低的那个量', 'the quantity being driven down'),
      q('接口复杂度', 'interface complexity', '零件变简单时复杂度的去处；这是方法的隐藏成本', 'where complexity goes when the parts get simpler, and the method\'s hidden cost'),
      q('新增参与者', 'newcomers admitted', '唯一能证明门槛真的降了的量', 'the only quantity that shows the barrier actually fell'),
    ],
    failsWhen: bi(
      '复杂度从零件转移到接口时不降反升：零件人人可得，把它们拼起来却需要更专门的知识，门槛只是换了个位置。',
      'It backfires when complexity moves from the parts to the interface: the parts are available to everyone while assembling them takes more specialised knowledge, and the barrier has merely relocated.',
    ),
    provenance: WAVE_5_PROVENANCE([290, 330, 56, 249, 1112]),
    mappings: [],
  },
];

export const WAVE_5_STRUCTURES: SeedStructure[] = [...REGULARITIES, ...METHODS];

/**
 * Structures a single agent-based kernel would make executable.
 *
 * This is a planning list, not a schema field and not a promise. The model
 * workbench currently has two hand-authored families — an all-to-all phase
 * kernel and a 12x12 scalar-field stencil — and between them they are bound to
 * exactly one structure in a catalogue of eighty. The question worth answering
 * before building a third is not "which structure deserves a kernel" but
 * "which kernel covers the most structures", and the answer is not close: a
 * population of units following local rules is the shared form of a whole band
 * of this catalogue.
 *
 * The entry that matters most is `critical-slowing-down`, and it needs no
 * kernel at all. It is what any of the others DO near their transition, so it
 * becomes executable the moment a run reports the variance and lag-1
 * autocorrelation of its own order parameter. The A2 mission runtime already
 * sweeps coupling candidates and measures coherence; what is missing is the
 * readout, not the model. One sweep would then show two structures at once —
 * which is the smallest honest demonstration that the catalogue connects
 * anything.
 */
export const AGENT_BASED_CANDIDATES: ReadonlyArray<{
  structureId: string;
  why: Bilingual;
}> = [
  {
    structureId: 'struct://xfrontier/replicator-dynamics',
    why: bi(
      '四个域、一行方程。按相对表现重新分配权重，是最简单的 ABM 更新规则，也是这一目录里覆盖最广的一个。',
      'Four domains, one line of algebra. Reweighting by relative performance is the simplest possible agent update, and the widest-reaching structure in this catalogue.',
    ),
  },
  {
    structureId: 'struct://xfrontier/quorum-sensing',
    why: bi('个体读共享标量、越阈值即行动——ABM 的教科书形态。', 'Individuals read a shared scalar and act past a threshold — the textbook agent form.'),
  },
  {
    structureId: 'struct://xfrontier/phase-separation',
    why: bi('同类相吸的局部规则；同一个内核既跑无膜凝聚体，也跑居住隔离。', 'A local like-attracts-like rule; the same kernel runs membraneless condensates and residential segregation.'),
  },
  {
    structureId: 'struct://xfrontier/self-assembly',
    why: bi('局部结合规则加能量下降，动力学困住与否直接可见。', 'Local binding rules plus a descending energy, with kinetic trapping visible directly.'),
  },
  {
    structureId: 'struct://xfrontier/self-organised-criticality',
    why: bi('慢驱动快松弛，沙堆模型本身就是 ABM。', 'Slow drive, fast relaxation — the sandpile is already an agent model.'),
  },
  {
    structureId: 'struct://xfrontier/network-cascade',
    why: bi('阈值传播在图上跑，级联与渗流是同一个内核的两个读数。', 'Threshold spreading on a graph, with cascade and percolation as two readouts of one kernel.'),
  },
  {
    structureId: 'struct://xfrontier/ising-mean-field',
    why: bi('局部对齐加外场，与同步是同一堂临界课的另一面。', 'Local alignment plus a field — the other face of the same criticality lesson as synchronization.'),
  },
  {
    structureId: 'struct://xfrontier/branching-criticality',
    why: bi('每个个体的后代数是局部规则，R₀=1 处涌现幂律雪崩。', 'Offspring count is the local rule, and power-law avalanches emerge at R₀ = 1.'),
  },
  {
    structureId: 'struct://xfrontier/nash-equilibrium',
    why: bi('各自最优响应的迭代就是 ABM；均衡是否可达本身是可观测的。', 'Iterated best response is an agent model, and whether the equilibrium is reachable becomes observable.'),
  },
  {
    structureId: 'struct://xfrontier/spontaneous-modularity',
    why: bi(
      '模块化只有在演化压力下跑起来才看得见——它是一个过程的产物，静态图谱只能事后描述它。',
      'Modularity is only visible once evolutionary pressure is actually run: it is the product of a process, and a static graph can only describe it after the fact.',
    ),
  },
];
