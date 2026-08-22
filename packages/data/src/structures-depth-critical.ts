import type { CanonicalSubstrate, StructureDepth, StructureQuantity, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the critical-transition family, authored
 * without reference to a single frontier island.
 *
 * Why this file exists. A structure could only get deeper by acquiring
 * mappings, and a mapping needs an island that supplies its quantity plus a
 * curator to ratify the pairing. So 90 of 126 structures sat at one sentence,
 * a few quantities and a failure condition — a quarter of the content an
 * island carries (median 696 characters against 2,755) — with no route out
 * that did not run through the atlas.
 *
 * Two things were available the whole time and unused. The topic set's
 * 在哪里出现 column holds 407 canonical substrates — 萤火虫 · 心肌 · 电网 ·
 * 鼓掌 · 经济周期 for phase locking — which are textbook instances rather than
 * anybody's live research. And structures stand in real relations to each
 * other that no mapping can express: 0 of 126 carried any relation to another
 * before now.
 *
 * WHY THIS FAMILY FIRST. These eight are genuinely one family rather than a
 * convenient grouping, and the relations between them are load-bearing:
 * critical slowing down is what the others DO near their transition; a power
 * law has two rival generating mechanisms and telling them apart is the open
 * problem; the renormalization group explains why systems that share nothing
 * microscopically share an exponent. Writing the relations for a family where
 * they are real is the honest way to test whether the field earns its place.
 *
 * WHAT THE ADDED `quantities` DO AND DO NOT SETTLE. Six of the eight predate
 * wave 4 and carried no declared quantities, so they get them here. Declaring
 * a structure's own abstract variables is textbook authoring and touches no
 * island. It does NOT resolve which rendering inside those structures' existing
 * mappings corresponds to which quantity — that is the review queue in
 * `projectQuantityRoles`, and nothing here shortcuts it.
 */

type Bilingual = { zh: string; en: string };
const bi = (zh: string, en: string): Bilingual => ({ zh, en });

const q = (nz: string, ne: string, rz: string, re: string): StructureQuantity =>
  ({ name: bi(nz, ne), role: bi(rz, re) });

const sub = (
  nameZh: string, nameEn: string,
  fieldZh: string, fieldEn: string,
  quantity: number,
  inZh: string, inEn: string,
  bZh: string, bEn: string,
): CanonicalSubstrate => ({
  name: bi(nameZh, nameEn),
  field: bi(fieldZh, fieldEn),
  quantity,
  inThisSubstrate: bi(inZh, inEn),
  boundary: bi(bZh, bEn),
});

const rel = (to: string, kind: StructureRelation['kind'], zh: string, en: string): StructureRelation =>
  ({ to: `struct://xfrontier/${to}`, kind, why: bi(zh, en) });

export interface StructureDepthPatch {
  structureId: string;
  /** Present only where the structure had none. */
  quantities?: StructureQuantity[];
  depth: StructureDepth;
}

export const CRITICAL_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/synchronization',
    quantities: [
      q('耦合强度 K', 'coupling strength K', '把各单元往彼此相位上拉的力度；越过临界值锁相才发生', 'how hard each unit is pulled towards the others\' phase; locking happens only past a critical value'),
      q('固有频率分布宽度', 'spread of natural frequencies', '单元本来各走各的程度；它与 K 的比值决定成败', 'how far apart the units would run on their own, and its ratio to K decides the outcome'),
      q('序参量 r', 'order parameter r', '锁相程度，从 0（各行其是）连续升到 1（完全同步）', 'how locked the population is, rising continuously from 0 to 1'),
    ],
    depth: {
      origin: bi(
        '1975 年由蔵本由紀在统计物理中提出，用来解释化学振荡的集体行为；随后被神经科学、心脏电生理与电力工程各自重新发现。',
        'Stated by Yoshiki Kuramoto in statistical physics in 1975 to explain collective behaviour in chemical oscillation, then rediscovered independently in neuroscience, cardiac electrophysiology and power engineering.',
      ),
      minimalForm: 'θ̇ᵢ = ωᵢ + (K/N) Σⱼ sin(θⱼ − θᵢ)',
      canonicalSubstrates: [
        sub('萤火虫同步闪光', 'Fireflies flashing in unison', '生物学', 'Biology', 0,
          '每只萤火虫看到邻居闪光后微调自己的下一次闪光时刻',
          'each firefly nudges the timing of its next flash after seeing its neighbours',
          '萤火虫的耦合是脉冲式而非连续的正弦耦合，且只在视线范围内发生——连续相位模型给出的临界值在这里只是量级估计。',
          'Firefly coupling is pulsatile rather than the continuous sinusoid of the model, and reaches only as far as line of sight, so the model\'s critical value is an order-of-magnitude estimate here.'),
        sub('心肌起搏细胞', 'Cardiac pacemaker cells', '生理学', 'Physiology', 2,
          '窦房结中大量起搏细胞收敛到同一节律，序参量就是这份一致性',
          'many pacemaker cells in the sinoatrial node converging on one rhythm, the order parameter being that agreement',
          '心肌细胞由缝隙连接直接导电，耦合强度不是自由参数而是解剖结构给定的；病理状态下的失同步更常来自传导阻滞而非 K 变小。',
          'Cardiac cells are coupled by gap junctions, so K is fixed by anatomy rather than free, and pathological desynchronisation usually comes from conduction block rather than a smaller K.'),
        sub('交流电网锁频', 'AC grid frequency locking', '工程学', 'Engineering', 1,
          '各台发电机的固有转速差，被电网的电气耦合拉到同一个 50/60 Hz',
          'the spread in generators\' natural speeds, pulled to one 50 or 60 Hz by the grid\'s electrical coupling',
          '电网有主动控制器持续调节，所以观察到的同步是控制的结果加自发锁相的叠加，把它整体归给 Kuramoto 会高估自发部分。',
          'A grid has active controllers constantly correcting it, so observed synchrony is control plus spontaneous locking, and crediting all of it to Kuramoto overstates the spontaneous part.'),
        sub('观众鼓掌', 'Audience applause', '社会学', 'Sociology', 2,
          '掌声从杂乱转为整齐时的一致程度，以及它随后又散开',
          'how uniform the clapping becomes as it turns from noise to rhythm, and how it disperses again',
          '人会有意识地选择加入或退出节奏，还会因为觉得太整齐而故意打乱——这个模型里没有任何一项对应「不想同步」。',
          'People consciously choose to join or leave the rhythm, and some deliberately break it when it gets too uniform; nothing in the model corresponds to not wanting to synchronise.'),
      ],
      relations: [
        rel('critical-slowing-down', 'generates',
          '把 K 缓慢调向临界值，序参量的方差与自相关会在锁相发生之前升高——同步是能产生临界慢化前兆的一个具体机制。',
          'Turn K slowly towards its critical value and the order parameter\'s variance and autocorrelation rise before locking occurs: synchronization is one concrete mechanism that produces the precursor.'),
        rel('ising-mean-field', 'special-case-of',
          '两者都是「局部对齐 + 一个序参量」的最小模型；伊辛的自旋取离散两值，同步的相位取连续圆周值，平均场处理几乎一样。',
          'Both are the minimal "local alignment plus an order parameter" model; Ising\'s spins take two discrete values and phases take continuous ones on a circle, and the mean-field treatment is nearly identical.'),
      ],
      mistakenFor: bi(
        '最常被误当成「相关」：一群单元一起变化，未必是它们互相耦合，也可能是共同受同一个外部驱动。区分二者的判据是撤掉共同驱动后同步是否还在。',
        'Most often mistaken for correlation: units moving together need not be coupled to each other and may simply share an external drive. The discriminating test is whether the synchrony survives removal of that drive.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/ising-mean-field',
    quantities: [
      q('耦合 J', 'coupling J', '相邻单元互相对齐的强度', 'how strongly neighbours pull each other into alignment'),
      q('外场 h', 'external field h', '给整个系统的一个偏置方向', 'a bias direction applied to the whole system'),
      q('磁化 m', 'magnetisation m', '整体对齐的程度，也是这个模型的序参量', 'how aligned the whole is, and the model\'s order parameter'),
      q('温度 T', 'temperature T', '打乱对齐的噪声强度；J/T 越过临界比值时系统整体翻转', 'the noise that undoes alignment, with the system flipping once J/T crosses a critical ratio'),
    ],
    depth: {
      origin: bi(
        '1920 年由楞次提出、1924 年由伊辛在一维求解（并错误地推断没有相变）；二维解由昂萨格在 1944 年给出，此后成为相变理论的标准最小模型。',
        'Posed by Lenz in 1920 and solved in one dimension by Ising in 1924, who wrongly concluded there was no phase transition; Onsager\'s two-dimensional solution in 1944 made it the standard minimal model of phase change.',
      ),
      minimalForm: 'H = −J Σ⟨ij⟩ sᵢsⱼ − h Σᵢ sᵢ ;  m = tanh(β(Jzm + h))',
      canonicalSubstrates: [
        sub('铁磁体', 'A ferromagnet', '凝聚态物理', 'Condensed-matter physics', 2,
          '大量自旋在居里温度以下自发指向同一方向',
          'many spins pointing the same way spontaneously below the Curie temperature',
          '这是模型的原生基底，但真实材料有各向异性、畴壁与长程偶极相互作用，最近邻均匀耦合只是第一近似。',
          'This is the model\'s home substrate, but real materials have anisotropy, domain walls and long-range dipolar terms, so uniform nearest-neighbour coupling is only a first approximation.'),
        sub('意见极化', 'Opinion polarisation', '社会学', 'Sociology', 1,
          '媒体或政策构成的外场，把一个原本分散的群体整体推向一侧',
          'media or policy acting as the field that tips an otherwise mixed population to one side',
          '人不是自旋：同一个人可以同时持有不一致的立场，社交网络也不是规则格点，而「温度」在这里没有可独立测量的对应物。',
          'People are not spins: one person can hold inconsistent positions at once, a social network is not a lattice, and temperature here has no independently measurable counterpart.'),
        sub('神经元群体活动', 'Neuronal population activity', '神经科学', 'Neuroscience', 0,
          '突触权重充当耦合，决定群体是分散放电还是整体同步',
          'synaptic weights acting as the coupling that decides whether a population fires scattered or together',
          '神经耦合有正有负且高度不对称，伊辛的对称耦合假设被破坏；用它拟合到的 J 是有效参数，不是解剖上的突触强度。',
          'Neural coupling is both excitatory and inhibitory and strongly asymmetric, breaking Ising\'s symmetric assumption, so a fitted J is an effective parameter rather than an anatomical synaptic weight.'),
      ],
      relations: [
        rel('critical-slowing-down', 'generates',
          '把 J/T 推向临界比值，磁化的涨落会在整体翻转之前放大——这是临界慢化前兆最经典的产生机制。',
          'Push J/T towards the critical ratio and fluctuations in magnetisation grow before the flip: the most classical mechanism producing critical slowing down.'),
        rel('renormalization-group', 'explains',
          '伊辛模型在二维和三维给出的临界指数，与完全不同的物理系统相同——重整化群解释了为什么这不是巧合。',
          'The critical exponents Ising gives in two and three dimensions match systems with nothing physically in common, and the renormalization group explains why that is not a coincidence.'),
      ],
      mistakenFor: bi(
        '常被误当成任何「二选一 + 从众」的模型。伊辛的内容不在于二值和从众，而在于存在一个临界比值，越过它系统整体而非渐进地翻转；没有这个突变，用伊辛只是借了一个名字。',
        'Routinely mistaken for any model of a binary choice under conformity. Its content is not the binary or the conformity but the existence of a critical ratio past which the system flips as a whole rather than gradually; without that discontinuity, invoking Ising borrows only the name.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/branching-criticality',
    quantities: [
      q('繁殖数 R₀', 'branching ratio R₀', '每一代的平均后代数；这一个数决定消亡、爆发还是临界', 'mean offspring per generation, the single number deciding extinction, explosion or criticality'),
      q('后代数方差', 'offspring variance', '决定在同一个 R₀ 下结局有多不确定', 'how uncertain the outcome is at a given R₀'),
      q('雪崩尺寸分布', 'avalanche size distribution', 'R₀=1 时它是幂律，这是临界性的可观测签名', 'a power law exactly at R₀ = 1, the observable signature of criticality'),
    ],
    depth: {
      origin: bi(
        '1873 年由高尔顿与沃森为研究姓氏消亡而提出，后来成为流行病学基本再生数、核链式反应与神经雪崩共用的骨架。',
        'Posed by Galton and Watson in 1873 to study the extinction of surnames, and later the shared skeleton of the epidemiological basic reproduction number, the nuclear chain reaction and neuronal avalanches.',
      ),
      minimalForm: 'Zₙ₊₁ = Σᵢ ξᵢ ;  灭绝 ⟺ R₀ ≤ 1',
      canonicalSubstrates: [
        sub('传染病基本再生数', 'The basic reproduction number of an epidemic', '流行病学', 'Epidemiology', 0,
          '一个感染者平均传染的人数，R₀ 小于一疫情自行熄灭',
          'how many people one case infects on average, with an outbreak dying out below one',
          '真实传播高度异质：少数超级传播者贡献大部分二代病例，所以同一个 R₀ 下方差极大，均值本身不足以预测走向。',
          'Real transmission is highly heterogeneous — a few superspreaders produce most secondary cases — so variance at a given R₀ is enormous and the mean alone does not predict the course.'),
        sub('核链式反应', 'A nuclear chain reaction', '核物理', 'Nuclear physics', 0,
          '一次裂变平均引发的下一次裂变数，临界即等于一',
          'the number of further fissions one fission causes on average, with criticality at exactly one',
          '反应堆通过控制棒主动把这个数钉在一附近，所以它是被工程维持的临界，不是系统自发停在那里。',
          'A reactor holds that number at one with control rods, so this is criticality maintained by engineering rather than a system settling there on its own.'),
        sub('神经雪崩', 'Neuronal avalanches', '神经科学', 'Neuroscience', 2,
          '一次自发放电引发的连锁活动规模，在健康皮层上呈幂律分布',
          'the size of the cascade one spontaneous spike triggers, power-law distributed in healthy cortex',
          '观测到幂律的雪崩尺寸不等于系统在临界点：下采样与阈值选择都能从非临界系统里制造出幂律外观。',
          'Power-law avalanche sizes do not establish that the system sits at criticality: subsampling and threshold choice can manufacture the appearance from a non-critical system.'),
      ],
      relations: [
        rel('network-cascade', 'special-case-of',
          '分支过程是级联在「无回路、无空间结构」极限下的形式；一旦网络有环，同一个 R₀ 不再决定命运。',
          'Branching is cascade in the limit of no loops and no spatial structure; once the network has cycles the same R₀ no longer decides the fate.'),
        rel('power-laws-scale-free', 'generates',
          'R₀ 恰好等于一时雪崩尺寸呈幂律，这是幂律的一条有明确机制的来源。',
          'At exactly R₀ = 1 avalanche sizes follow a power law, one of the mechanistically explicit sources of such a law.'),
        rel('self-organised-criticality', 'emerges-from',
          '自组织临界的说法是：某些系统会把自己的 R₀ 自动调到一，而不需要有人像反应堆那样去控制它。',
          'Self-organised criticality is the claim that some systems tune their own R₀ to one, with nobody holding it there as a reactor does.'),
      ],
      mistakenFor: bi(
        '常被误当成「指数增长」。R₀ 大于一确实给出指数期望，但分支过程真正的内容是灭绝概率与方差：在 R₀ 略大于一时，最可能的单次结局仍然是消亡。',
        'Often mistaken for exponential growth. R₀ above one does give an exponential expectation, but the content of a branching process is the extinction probability and the variance: just above one, the single most likely outcome is still dying out.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/network-cascade',
    quantities: [
      q('占据概率 p', 'occupation probability p', '节点或边存在的比例，是被缓慢调节的控制参数', 'the fraction of nodes or edges present, the control parameter being turned slowly'),
      q('渗流阈值 p_c', 'percolation threshold p_c', '巨连通分量突然出现的那个比例', 'the fraction at which a giant connected component suddenly appears'),
      q('巨连通分量占比', 'giant-component fraction', '序参量：阈值以下几乎为零，以上连续增长', 'the order parameter: near zero below threshold, growing continuously above'),
      q('依赖结构', 'the dependency structure', '决定一处故障能沿哪些边传出去', 'what decides which edges a single failure can travel along'),
    ],
    depth: {
      origin: bi(
        '1957 年由布罗德本特与哈默斯利为研究多孔介质中的流体渗透提出，随后被网络科学、流行病学与基础设施可靠性各自采用。',
        'Introduced by Broadbent and Hammersley in 1957 for fluid seeping through porous media, then taken up separately by network science, epidemiology and infrastructure reliability.',
      ),
      minimalForm: '巨连通分量在 p > p_c 时以幂律 (p − p_c)^β 涌现',
      canonicalSubstrates: [
        sub('材料导电', 'Conduction in a composite', '材料科学', 'Materials science', 1,
          '导电颗粒的体积分数越过某个比例，整块材料从绝缘突然变为导电',
          'the volume fraction of conducting particles past which a block turns from insulator to conductor',
          '真实颗粒有空间关联与形状各向异性，阈值会显著偏离随机格点的理论值——观察到突变不等于随机渗流。',
          'Real particles are spatially correlated and anisotropic in shape, so the threshold departs markedly from the random-lattice value: an observed jump is not evidence of random percolation.'),
        sub('电网级联失效', 'Cascading failure in a power grid', '工程学', 'Engineering', 3,
          '一条线路过载后把负载转给邻居，依赖结构决定这次转移会不会连锁',
          'one overloaded line handing its load to neighbours, with the dependency structure deciding whether that spreads',
          '电网的重分配遵循基尔霍夫定律而非最近邻传递，负载可能跳到远处的线路上——把它当作近邻渗流会低估长程级联。',
          'Redistribution in a grid follows Kirchhoff\'s laws rather than nearest-neighbour passing, so load can jump to distant lines, and treating it as local percolation understates long-range cascades.'),
        sub('森林火蔓延', 'Fire spreading through a forest', '生态学', 'Ecology', 0,
          '可燃植被的覆盖比例，越过阈值后单点着火会烧穿整片',
          'the fraction of flammable cover past which one ignition burns the whole stand',
          '风与地形给蔓延加了方向，各向同性渗流的阈值在真实火场上只是下界。',
          'Wind and terrain give the spread a direction, so the isotropic percolation threshold is only a lower bound on a real fire.'),
        sub('微服务依赖故障', 'Failure across microservice dependencies', '软件工程', 'Software engineering', 3,
          '服务间的调用图决定一个下游故障能不能反噬整个系统',
          'the call graph that decides whether one downstream failure takes the whole system with it',
          '这里的依赖是有意设计的，可以加隔离舱与超时来人为切断——与自然渗流不同，阈值本身是可被工程改变的量。',
          'These dependencies are designed and can be cut deliberately with bulkheads and timeouts: unlike natural percolation, the threshold is itself an engineerable quantity.'),
      ],
      relations: [
        rel('branching-criticality', 'generates',
          '在稀疏无环的极限下，渗流的传播就退化成一个分支过程，p_c 对应 R₀ = 1。',
          'In the sparse, loop-free limit the spread degenerates into a branching process, with p_c corresponding to R₀ = 1.'),
        rel('critical-slowing-down', 'generates',
          '把 p 缓慢推向 p_c，巨连通分量大小的涨落在贯通之前就升高。',
          'Push p slowly towards p_c and fluctuations in the giant component grow before it spans.'),
      ],
      mistakenFor: bi(
        '常被误当成「传播得快」。渗流的内容不是速度而是阈值——低于 p_c 时无论等多久都传不开，高于则几乎必然贯通；把它读成速度问题会得出错误的干预方向。',
        'Commonly mistaken for fast spreading. Its content is not speed but a threshold: below p_c nothing spans however long you wait, above it almost everything does — and reading it as a speed problem points intervention the wrong way.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/self-organised-criticality',
    depth: {
      origin: bi(
        '1987 年由巴克、汤超与维森菲尔德用沙堆模型提出，回答的是「为什么自然界里的临界现象如此普遍，尽管临界点本该需要精细调参」。',
        'Proposed by Bak, Tang and Wiesenfeld in 1987 with the sandpile model, answering why critical phenomena are so common in nature when criticality ought to require fine tuning.',
      ),
      minimalForm: '慢驱动 + 快松弛 + 阈值释放 ⇒ 停在临界点',
      canonicalSubstrates: [
        sub('沙堆', 'The sandpile', '统计物理', 'Statistical physics', 0,
          '一粒一粒加沙是慢驱动，一次坍塌是快松弛，堆坡稳定在临界角',
          'grains added one at a time as the slow drive, an avalanche as the fast relaxation, the slope settling at the critical angle',
          '真实沙堆有惯性与颗粒形状，实验里常常得不到理论预言的幂律——原始模型是元胞自动机而非物理沙。',
          'Real sand has inertia and grain shape, and experiments often fail to show the predicted power law: the original model is a cellular automaton rather than physical sand.'),
        sub('地震', 'Earthquakes', '地球物理', 'Geophysics', 2,
          '构造应力缓慢累积、断层快速滑移，震级分布服从古登堡—里希特幂律',
          'tectonic stress accumulating slowly and faults slipping fast, with magnitudes following the Gutenberg–Richter power law',
          '断层有记忆与愈合过程，且大地震后应力场被重置——这比自组织临界的无记忆假设复杂，指数也随区域变化。',
          'Faults have memory and healing, and a large event resets the stress field, which is richer than the memoryless assumption, and the exponent varies by region.'),
        sub('森林火', 'Forest fires', '生态学', 'Ecology', 1,
          '植被缓慢生长、火快速烧掉，系统在两者之间停在一个平衡覆盖率上',
          'vegetation growing slowly and fire consuming it fast, the system settling at an equilibrium cover between the two',
          '人为灭火直接改变松弛速率，把系统推离自组织的那个点——被管理的森林不能用来检验这条结构。',
          'Fire suppression changes the relaxation rate directly and pushes the system off the self-organised point, so a managed forest cannot be used to test this structure.'),
        sub('神经雪崩', 'Neuronal avalanches', '神经科学', 'Neuroscience', 2,
          '突触活动缓慢累积、放电快速传播，雪崩规模呈幂律',
          'synaptic drive accumulating slowly and spikes propagating fast, with avalanche sizes power-law distributed',
          '大脑是否真的自组织到临界仍在争论：稳态可塑性可能是在主动把系统调到那里，那样它就是被调控的临界而非自组织的。',
          'Whether the brain truly self-organises to criticality is contested: homeostatic plasticity may be actively tuning it there, which would make it regulated rather than self-organised criticality.'),
      ],
      relations: [
        rel('power-laws-scale-free', 'generates',
          '自组织临界是幂律的两条主要机制解释之一，另一条是优先连接；同一条幂律不能同时算作两者的证据。',
          'Self-organised criticality is one of the two main mechanistic explanations for a power law, the other being preferential attachment, and one observed law cannot count as evidence for both.'),
        rel('branching-criticality', 'explains',
          '它给出的是「为什么 R₀ 会自己停在一」这个问题的一个答案：慢驱动与快松弛把系统推回临界。',
          'It answers why R₀ settles at one on its own: slow driving and fast relaxation push the system back to criticality.'),
        rel('renormalization-group', 'competes-with',
          '两者都解释「不同系统为何共享指数」，但一个诉诸系统自己走到临界点，另一个诉诸临界点附近的粗粒化不动点——在一个具体案例上判定是哪一个，是真正的开放问题。',
          'Both explain why unlike systems share exponents, one by the system arriving at criticality and the other by a coarse-graining fixed point near it, and deciding which applies in a given case is genuinely open.'),
      ],
      mistakenFor: bi(
        '最常被误当成「凡是幂律都说明自组织临界」。这是倒因为果：自组织临界能产生幂律，但幂律有多条来源，且多数经验幂律经不起严格统计检验。',
        'Most often mistaken for the claim that any power law indicates self-organised criticality. That inverts the implication: it can produce one, but power laws have several sources and most empirical ones do not survive rigorous statistical testing.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/critical-slowing-down',
    depth: {
      origin: bi(
        '作为临界现象的动力学后果，早在 20 世纪中叶的相变理论中就有；1980 年代起被生态学用作状态转变的早期预警，2009 年 Scheffer 等人的综述把它推广为跨领域指标。',
        'Known since mid-twentieth-century phase-transition theory as a dynamical consequence of criticality, taken up by ecology in the 1980s as an early warning of regime shift, and generalised into a cross-field indicator by Scheffer and colleagues in 2009.',
      ),
      minimalForm: '恢复速率 λ → 0 ⇒ 方差 ↑，一阶自相关 → 1',
      canonicalSubstrates: [
        sub('湖泊富营养化', 'Lake eutrophication', '生态学', 'Ecology', 1,
          '磷负荷逼近临界值时，藻类浓度在扰动后恢复得越来越慢，方差随之升高',
          'as phosphorus load nears its critical value, algal concentration recovers ever more slowly from perturbation and its variance rises',
          '湖泊有季节性强迫，方差的年内变化可能远大于临界前兆；不先去掉季节项，信号会被淹没。',
          'Lakes are seasonally forced and the within-year swing in variance can dwarf the precursor, so the signal is lost unless seasonality is removed first.'),
        sub('气候临界点', 'Climate tipping points', '气候科学', 'Climate science', 3,
          '大西洋经向翻转环流等系统与其分岔点的距离，靠古气候与遥感时序间接估计',
          'the distance of systems such as the Atlantic overturning circulation from their bifurcation, estimated indirectly from palaeoclimate and remote-sensing series',
          '古气候序列既短又有测年误差，且强迫本身在变——在这种数据上得到的自相关上升，可能来自强迫的变化而不是恢复速率的下降。',
          'Palaeoclimate series are short and imprecisely dated while the forcing itself is changing, so a rise in autocorrelation there can come from the changing forcing rather than a falling recovery rate.'),
        sub('抑郁复发', 'Relapse into depression', '临床心理学', 'Clinical psychology', 2,
          '情绪自评的日间自相关在复发前数周升高，恢复到基线所需的时间变长',
          'day-to-day autocorrelation in self-reported mood rising weeks before relapse, with return to baseline taking longer',
          '自评量表本身有测量误差与作答习惯，且个体基线差异极大——这里的前兆只能在个体内部纵向比较，不能跨人比较。',
          'Self-report carries measurement error and response habits and baselines differ hugely between people, so the precursor is only interpretable within an individual over time, never across individuals.'),
        sub('金融市场崩溃前夕', 'A market before a crash', '金融学', 'Finance', 1,
          '收益率波动的自相关与方差在崩盘前上升',
          'autocorrelation and variance of returns rising ahead of a crash',
          '市场参与者会读到并交易这些指标本身，于是前兆被反身性改变——这是唯一一个观测行为会主动改变被观测量的基底。',
          'Participants read and trade on these very indicators, so reflexivity alters the precursor: this is the one substrate where observing actively changes what is observed.'),
      ],
      relations: [
        rel('synchronization', 'emerges-from',
          '把耦合强度推向临界值，序参量在锁相之前就出现方差与自相关的上升——同步是产生这个前兆的机制之一。',
          'Push coupling towards its critical value and the order parameter shows rising variance and autocorrelation before locking: synchronization is one mechanism producing the precursor.'),
        rel('ising-mean-field', 'emerges-from',
          '同样地，把 J/T 推向临界比值，磁化的涨落在整体翻转之前放大。',
          'Likewise, pushing J/T towards its critical ratio amplifies fluctuations in magnetisation before the flip.'),
        rel('network-cascade', 'emerges-from',
          '把占据概率推向渗流阈值，巨连通分量的涨落在贯通之前升高。',
          'Pushing occupation probability towards the percolation threshold raises fluctuations in the giant component before it spans.'),
      ],
      mistakenFor: bi(
        '最常被误当成「波动变大就是要崩」。方差上升可以来自外部驱动变强、采样变密或数据缺失，而这三者都不意味着恢复速率在下降——真正的判据是自相关与恢复时间同向变化。',
        'Most often mistaken for volatility meaning collapse. Variance can rise because the external drive grew, the sampling got denser or data went missing, none of which means the recovery rate is falling; the real test is autocorrelation and recovery time moving together.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/power-laws-scale-free',
    quantities: [
      q('事件尺度 x', 'event size x', '被统计的那个量本身：震级、城市人口、词频、度数', 'the quantity being tallied: magnitude, city population, word frequency, degree'),
      q('尾指数 α', 'tail exponent α', '分布衰减的速度；它同时是普适类的指纹', 'how fast the tail decays, and simultaneously the fingerprint of a universality class'),
      q('标度区间', 'the scaling range', '幂律实际成立的尺度跨度；不足两个数量级时结论脆弱', 'the span of scales over which the law actually holds, with conclusions fragile below two decades'),
    ],
    depth: {
      origin: bi(
        '1896 年帕累托在财富分布中记录，1932 年齐普夫在词频中重新发现，1944 年古登堡与里希特在震级中给出——三次独立发现同一个形状，本身就是这条结构的第一个证据。',
        'Recorded by Pareto in wealth in 1896, rediscovered by Zipf in word frequencies in 1932 and by Gutenberg and Richter in earthquake magnitudes in 1944 — three independent discoveries of one shape, which is itself the structure\'s first piece of evidence.',
      ),
      minimalForm: 'P(x) ∝ x^(−α)',
      canonicalSubstrates: [
        sub('地震震级', 'Earthquake magnitudes', '地球物理', 'Geophysics', 1,
          '古登堡—里希特关系里的 b 值，即震级—频度曲线的斜率',
          'the b-value of the Gutenberg–Richter relation, the slope of the magnitude-frequency curve',
          '仪器在小震级上漏检、在极大震级上样本太少，所以真正可信的标度区间比原始数据窄得多。',
          'Instruments miss small events and the largest are too rare to sample, so the trustworthy scaling range is far narrower than the raw data suggests.'),
        sub('城市规模', 'City sizes', '城市科学', 'Urban science', 0,
          '一个国家内城市人口的排序—规模关系',
          'the rank-size relation of city populations within a country',
          '「城市」的边界由行政定义，换一种划界方式指数就会变——这里的量本身不是自然给定的。',
          'A city\'s boundary is an administrative choice and the exponent moves when the boundary does: the quantity itself is not naturally given.'),
        sub('词频', 'Word frequencies', '语言学', 'Linguistics', 1,
          '齐普夫定律里排名与频率的乘积近似为常数',
          'Zipf\'s law, where rank times frequency is roughly constant',
          '随机生成的字符串在加上词边界后也会产生齐普夫式分布，所以这条幂律本身并不证明语言有什么特别的生成机制。',
          'Randomly generated character strings produce a Zipf-like distribution once word boundaries are added, so the law alone establishes nothing special about how language is generated.'),
        sub('网络度分布', 'Network degree distributions', '网络科学', 'Network science', 1,
          '少数高连接节点与大量低连接节点形成的重尾',
          'the heavy tail of a few hubs and many low-degree nodes',
          '大多数被报告为无标度的真实网络，在严格统计检验下更符合对数正态或截断幂律。',
          'Most real networks reported as scale-free fit a log-normal or truncated power law better under rigorous testing.'),
      ],
      relations: [
        rel('self-organised-criticality', 'competes-with',
          '自组织临界与优先连接都能生成幂律，而一条观察到的幂律不能同时算作两者的证据——判定是哪一个才是真正的问题。',
          'Self-organised criticality and preferential attachment both generate power laws, and one observed law cannot be evidence for both: deciding which is the actual question.'),
        rel('renormalization-group', 'explains',
          '尾指数不是任意的：重整化群说明它由不动点决定，所以共享指数的系统属于同一个普适类。',
          'The exponent is not arbitrary: the renormalization group shows it is set by a fixed point, so systems sharing an exponent belong to one universality class.'),
        rel('branching-criticality', 'emerges-from',
          'R₀ 恰为一的分支过程会给出幂律的雪崩尺寸，这是幂律来源里机制最清楚的一条。',
          'A branching process at exactly R₀ = 1 gives power-law avalanche sizes, the mechanistically clearest of the sources.'),
      ],
      mistakenFor: bi(
        '常被误当成「重尾」。重尾只说明极端事件比正态多，而幂律另外主张不存在特征尺度——对数正态同样重尾却有特征尺度，两者在有限数据上极难区分，这个区分才是全部争议所在。',
        'Commonly mistaken for a heavy tail. A heavy tail only says extremes are more common than under a normal; a power law additionally claims there is no characteristic scale. A log-normal is heavy-tailed with a characteristic scale, the two are very hard to separate on finite data, and that separation is where the whole dispute lives.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/renormalization-group',
    quantities: [
      q('粗粒化步骤', 'the coarse-graining step', '把微观自由度成组合并、再重标度的那个操作', 'the operation that groups microscopic degrees of freedom and rescales'),
      q('耦合常数的流', 'the flow of couplings', '参数在反复粗粒化下如何移动', 'how the parameters move under repeated coarse-graining'),
      q('不动点', 'the fixed point', '流的终点；临界指数由它、而不是由微观细节决定', 'where the flow ends, and what sets the critical exponents rather than any microscopic detail'),
    ],
    depth: {
      origin: bi(
        '1971 年由威尔逊给出可计算的形式（1982 年诺贝尔物理学奖），把「为什么完全不同的物质在临界点表现相同」从观察变成推导。',
        'Given a computable form by Kenneth Wilson in 1971, recognised with the 1982 Nobel Prize, turning why unlike substances behave alike at criticality from an observation into a derivation.',
      ),
      minimalForm: 'dg/d ln μ = β(g)',
      canonicalSubstrates: [
        sub('液气临界点与铁磁临界点', 'The liquid-gas and ferromagnetic critical points', '统计物理', 'Statistical physics', 2,
          '两个物理上毫不相干的系统落在同一个不动点上，因而共享同一组临界指数',
          'two physically unrelated systems landing on one fixed point and therefore sharing exponents',
          '普适性只在临界点邻域成立；离开那个邻域，微观细节重新变得重要，指数不再可互换。',
          'Universality holds only in the neighbourhood of the critical point; away from it microscopic detail matters again and the exponents stop being interchangeable.'),
        sub('湍流的能量级串', 'The turbulent energy cascade', '流体力学', 'Fluid dynamics', 0,
          '能量在尺度间逐级传递，粗粒化的对象是尺度而不是格点',
          'energy passed down through scales, with the coarse-graining acting on scale rather than on a lattice',
          '湍流有间歇性，柯尔莫哥洛夫的标度律在高阶矩上系统性偏离——这里的不动点图像并不完整。',
          'Turbulence is intermittent and Kolmogorov scaling departs systematically at higher moments, so the fixed-point picture is incomplete here.'),
        sub('深度网络的特征逐层抽象', 'Layerwise abstraction in deep networks', '机器学习', 'Machine learning', 0,
          '每一层丢掉一部分细节、保留与任务相关的自由度，形式上类似粗粒化',
          'each layer discarding some detail and keeping the task-relevant degrees of freedom, formally like coarse-graining',
          '这条类比很吸引人但缺少重整化群的核心成分：没有明确的标度变换，也没有可算的流方程与不动点，目前更像隐喻而非同构。',
          'The analogy is attractive but missing the core ingredients: no explicit rescaling, no computable flow equation and no fixed point, which makes it closer to metaphor than isomorphism at present.'),
      ],
      relations: [
        rel('power-laws-scale-free', 'explains',
          '它说明尾指数为什么不是任意的：指数由不动点决定，所以共享指数意味着同属一个普适类。',
          'It explains why the tail exponent is not arbitrary: the exponent is set by the fixed point, so a shared exponent means a shared universality class.'),
        rel('ising-mean-field', 'explains',
          '伊辛在二维与三维的临界指数与许多毫不相干的系统相同，重整化群给出这为何不是巧合。',
          'Ising\'s exponents in two and three dimensions match many unrelated systems, and the renormalization group shows why that is not coincidence.'),
        rel('self-organised-criticality', 'competes-with',
          '两者都在回答「不同系统为何共享指数」；重整化群诉诸临界点附近的不动点，自组织临界诉诸系统自己走到临界点。',
          'Both answer why unlike systems share exponents, one by a fixed point near criticality and the other by the system arriving at criticality on its own.'),
      ],
      mistakenFor: bi(
        '常被误当成「多尺度分析」或「逐层抽象」。粗粒化只是它的一半；真正的内容是耦合常数在粗粒化下的流以及流的不动点。没有可算的流方程，用重整化群就只是借了一个词。',
        'Frequently mistaken for multiscale analysis or layerwise abstraction. Coarse-graining is only half of it; the content is the flow of the couplings under that coarse-graining and the fixed points of that flow. With no computable flow equation, invoking the renormalization group borrows only the word.',
      ),
    },
  },
];
