import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureQuantity, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the network family.
 *
 * One question runs through all eight: what does the shape of the connections
 * do to what passes through them?
 *
 * Four of them answer before anything flows at all, because the answer is
 * already fixed by the topology. The second-smallest eigenvalue of the graph
 * Laplacian settles whether a network can be cut and whether it can
 * synchronise, and those turn out to be one number rather than two. A small
 * world shows that a handful of long edges collapses distance while local
 * clustering barely moves, so near and far stop being a trade. An hourglass
 * narrows its middle layer onto one shared convention. A propagation bound
 * decides which pairs of events could have been connected at all, before any
 * mechanism has been proposed for connecting them.
 *
 * The other four are about what the channel does to what travels along it.
 * Delay plus per-tier self-protection multiplies a small fluctuation into a
 * large one. Traffic degrades the shared thing being travelled on. One side
 * cannot see what the other is or does. And a boundary that sorts thereby
 * composes both sides of itself.
 *
 * TWO OPPOSITIONS ARE FILED EXPLICITLY, because each is a place where two
 * members prescribe opposite things for the same complaint.
 *
 * The first is the small world against the hourglass. Both account for a large
 * system whose parts are all effectively close to each other. One says the
 * closeness comes from scattered shortcuts; the other says every path runs
 * through a single narrow common layer. What separates them is where
 * betweenness sits — spread over many edges, or piled onto one layer — and the
 * prescriptions do not merely differ, they undo each other: add bypasses that
 * skip the middle, or unify the middle so that nothing needs to skip it.
 *
 * The second is the selective gate against information asymmetry. They are the
 * same asymmetric membrane approached from opposite intents: a gate sorts by an
 * announced rule, and an asymmetry hides as a side effect of who happens to
 * know what. Both leave a population on one side that is not a fair sample of
 * what arrived, and the remedies do not transfer — a bad rule is fixed by
 * rewriting the rule, while adverse selection cannot be fixed by any rule,
 * because a rule cannot condition on what is hidden from it.
 *
 * The propagation limit is the odd member and is written as one. The other
 * seven are arrangements somebody designed or that emerged from what the parts
 * were doing; this one is a bound that holds whether or not anything was built,
 * and its entire content is a partition of pairs into could-have-interacted and
 * could-not. It belongs here because that partition is a claim about
 * connectivity: it says which edges the world permits before any of them are
 * drawn.
 *
 * Seven of the eight already declare quantities, so those patches carry depth
 * only. The graph Laplacian had none and gets three here — algebraic
 * connectivity, the Fiedler vector, and the eigenratio. Declaring a structure's
 * own abstract variables is textbook authoring and settles nothing about which
 * rendering inside its four existing mappings corresponds to which of them.
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

export const NETWORK_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/graph-laplacian-spectrum',
    quantities: [
      q('代数连通度 λ₂', 'algebraic connectivity λ₂',
        '谱里第二小的特征值。它为零当且仅当图不连通，而它的大小同时约束最稀疏割的代价和图上任何扩散的弛豫速度',
        'the second-smallest eigenvalue: zero exactly when the graph falls apart, and its size bounds both the cost of the sparsest cut and how fast anything diffusing on the graph settles'),
      q('Fiedler 向量', 'the Fiedler vector',
        'λ₂ 对应的特征向量。分量的符号指出该从哪里切，所以谱回答的不只是能不能切，还有切在哪',
        'the eigenvector belonging to λ₂, whose component signs say where the cut goes — so the spectrum answers where and not only whether'),
      q('特征比 λ_N/λ₂', 'the eigenratio λ_N/λ₂',
        '最大与第二小特征值之比。它决定一群相同的振子挂在这张图上时，是否存在任何耦合强度能让它们同步',
        'the largest eigenvalue over the second smallest, which decides whether identical oscillators on this graph synchronise at any coupling strength at all'),
    ],
    depth: {
      origin: bi(
        '矩阵本身出自 1847 年基尔霍夫的电路分析，他用它数一张网络有多少棵生成树；直到 1973 年 Fiedler 才去读它的谱，证明第二小特征值为零当且仅当图不连通，并把它命名为代数连通度。中间隔了 126 年，而真正出人意料的是那个特征向量——一个纯代数对象，居然指得出该从哪里下刀。',
        'The matrix itself comes from Kirchhoff\'s 1847 circuit analysis, where it counted a network\'s spanning trees; nobody read its spectrum until Fiedler in 1973 proved the second-smallest eigenvalue vanishes exactly when the graph falls apart, and named it algebraic connectivity. That is 126 years, and the real surprise is the eigenvector: a purely algebraic object that turns out to say where the knife should go.',
      ),
      minimalForm: 'L = D − A ;  0 = λ₁ ≤ λ₂ ≤ … ≤ λ_N ;  λ₂ > 0 ⟺ 连通',
      canonicalSubstrates: [
        sub('谱聚类与图分割', 'Spectral clustering', '计算机科学', 'Computer science', 1,
          'Fiedler 向量的分量符号把节点分成两半，这是最小比例割这个 NP 难问题的连续松弛',
          'the signs of the Fiedler vector split the nodes in two, as a continuous relaxation of the NP-hard minimum ratio cut',
          '松弛解不是割：从连续向量取符号这一步可以任意糟，而且图上根本没有两分结构时它照样返回一刀。λ₂ 的大小是判断这一刀有没有意义的唯一凭据，光看划分本身永远看不出来。',
          'The relaxation is not the cut: rounding a continuous vector to signs can be arbitrarily bad, and the method returns a split even where the graph has none. The size of λ₂ is the only evidence that a split means anything, and the partition alone never shows it.'),
        sub('马尔可夫链的混合时间', 'Mixing time of a Markov chain', '概率论', 'Probability', 0,
          '谱隙给出随机游走忘掉起点所需的时间；λ₂ 越小，链被卡在某一处的时间越长',
          'the spectral gap bounds how long a random walk needs to forget where it started, a small λ₂ meaning the chain sits somewhere for a long time',
          '这里用的是度归一化后的拉普拉斯，它的谱与 L = D − A 的谱在度分布不齐时并不一致。把未归一化的 λ₂ 直接当混合速率，在存在少数高度节点时会给出严重偏低的估计。',
          'What is used here is the degree-normalised Laplacian, whose spectrum parts company with that of L = D − A as soon as degrees are uneven. Reading the unnormalised λ₂ as a mixing rate badly understates it whenever a few high-degree nodes are present.'),
        sub('同步判据（主稳定函数）', 'The synchronisation criterion', '非线性动力学', 'Nonlinear dynamics', 2,
          '一群相同振子以扩散方式耦合时，能否锁相取决于 λ_N/λ₂ 是否落进振子自身决定的那个区间',
          'for identical oscillators coupled diffusively, locking depends on whether λ_N/λ₂ falls inside an interval fixed by the oscillator itself',
          '这个判据要求所有单元完全相同、且通过同一个函数耦合。单元一旦有差异，或者连接是有向的，拉普拉斯就不再对称、特征值转入复平面，一个实数比值不再决定成败。',
          'The criterion assumes every unit is identical and coupled through the same function. The moment units differ or links run one way, the Laplacian stops being symmetric, its eigenvalues move into the complex plane, and one real ratio decides nothing.'),
      ],
      relations: [
        rel('small-world', 'explains',
          '少量随机长程边把 λ₂ 抬高的幅度远超同样数量的近邻边，所以谱说明了为什么几条捷径能有那么大效果；它同时说明效果落在哪一侧——λ₂ 是全局量而聚类系数是纯本地量，一个跳起来另一个不动因此并不神秘。',
          'A handful of random long edges raises λ₂ far more than the same number of local ones, so the spectrum says why a few shortcuts do so much. It also says where the effect lands: λ₂ is a global quantity and the clustering coefficient a purely local one, which is why one can jump while the other holds still.'),
        rel('synchronization', 'explains',
          '同一个耦合强度 K 在一张图上能锁相、在另一张上不能，差别不在振子而在谱。所以同步是网络性质与单元性质的乘积，只报 K 不报图，等于只写了条件的一半。',
          'The same coupling strength K locks on one graph and not on another, and the difference lies in the spectrum rather than in the oscillators. Synchronisation is a property of the network times a property of the unit, so reporting K without reporting the graph states half the condition.'),
        rel('limiting-factor', 'special-case-of',
          '最短板的说法在图上有一个精确版本：Cheeger 不等式把最稀疏割夹在 λ₂ 的两个函数之间，于是最弱的那一处从一句判断变成一个数——而且是多项式时间可算的数，尽管割问题本身 NP 难。',
          'The shortest-plank idea has an exact version on a graph: Cheeger\'s inequality brackets the sparsest cut between two functions of λ₂, turning the weakest place from a judgement into a number — and one computable in polynomial time, although the cut problem itself is NP-hard.'),
      ],
      mistakenFor: bi(
        '最常被当成密度或平均度的同义词。它不是：往两个本已稠密的半边内部继续加边，λ₂ 几乎不动；跨过那道弱割加一条边，它立刻跳。第二种混淆是把它与邻接矩阵的谱互换——A 的最大特征值管传播阈值与中心性，L 的 λ₂ 管割与弛豫；正则图上两者只差一个常数，这就是混淆能长期存在的原因，而度分布一不齐它们就给出不同答案。',
        'Most often read as a synonym for density or mean degree. It is not: keep adding edges inside two already-dense halves and λ₂ barely moves, add one across the weak cut and it jumps. The second confusion swaps it for the adjacency spectrum — the leading eigenvalue of A governs epidemic thresholds and centrality, λ₂ of L governs cuts and relaxation. On a regular graph the two differ by a constant, which is why the confusion survives, and as soon as degrees are uneven they answer differently.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/small-world',
    depth: {
      origin: bi(
        '经验事实先到：1967 年 Milgram 的转信实验给出了六度这个数，却没有给出机制，而且只有约四分之一的链条完成，所以那个数描述的是完成了的那些链。机制到 1998 年才由 Watts 与 Strogatz 补上，他们举的三个例子——线虫的神经系统、美国西部电网、电影演员合作网——彼此毫无共同之处，而这正是它被当作一条结构而不是一项社会学发现的原因。',
        'The fact came first: Milgram\'s 1967 letter-forwarding experiment produced the number six with no mechanism, and only about a quarter of the chains completed, so the number describes the chains that finished. The mechanism arrived in 1998 with Watts and Strogatz, whose three examples — the nematode nervous system, the western US power grid and the film-actor graph — have nothing in common, which is what made this structural rather than sociological.',
      ),
      minimalForm: 'L(p) ~ log N 与 C(p) ≈ C(0) 在同一个 p 区间内同时成立',
      canonicalSubstrates: [
        sub('大脑的结构连接组', 'The structural connectome', '神经科学', 'Neuroscience', 1,
          '皮层区内部密集互联、区间只靠少量长程纤维束相接，居高不下的聚类系数量的就是前者',
          'dense wiring inside each cortical area with only a few long-range fibre bundles between areas, the stubbornly high clustering coefficient measuring the former',
          '长程连线在这里不免费——轴突占体积也耗能——网络停在布线代价与路径长度的折中处，而不是模型里可以随手调的重连概率；何况连接组由纤维追踪算出，阈值一高聚类系数就自己上去。',
          'Long links are not free here, since axons cost volume and energy: the network sits where wiring cost trades against path length rather than at a freely chosen rewiring probability. And the connectome comes from tractography, where a higher threshold raises the clustering coefficient by itself.'),
        sub('高压输电网', 'The transmission grid', '电力工程', 'Power engineering', 2,
          '区域电网之间那少数几条联络线，就是这里的长程边',
          'the handful of interconnectors between regional grids are the long-range links here',
          '这里短距离不是好处：同一批联络线既让功率调度得快，也让扰动传得远，2003 年北美大停电就是沿它们走的。小世界只说距离塌缩，不说塌缩的是有用的东西还是危险的东西。',
          'Here short distance is not a benefit: the same interconnectors that let power be dispatched fast let a disturbance travel far, and the 2003 North American blackout ran along them. The structure says distance collapses and says nothing about what it is that travels.'),
        sub('合作者网络', 'Co-authorship networks', '科学计量学', 'Scientometrics', 0,
          '埃尔德什数就是这个量的一个实例：几乎每一位活跃作者都在很少几步之内',
          'the Erdős number is one instance of it, with nearly every active author a few steps away',
          '这里的一条边是一次事件，不是一条常开的通道。把几十年的合作累积成一张图再量距离，会把从未同时存在过的路径也算进去，于是它量到的是曾经可及，而不是此刻可传。',
          'An edge here is an event rather than a channel that stays open. Piling decades of collaboration into one graph and measuring distance counts paths that never coexisted, so what it measures is what was once reachable rather than what could be transmitted now.'),
      ],
      relations: [
        rel('hourglass-waist', 'competes-with',
          '同一个观察——大系统里任意两部分都很近——小世界归因于散布的少量捷径，沙漏归因于所有路径都过同一层，两者都产出短平均距离。区分靠介数落在哪里：摊在很多条边上，还是压在中间那一层。而处方相反：加旁路绕开中间，与把中间统一起来，各自都会毁掉对方要的东西。',
          'One observation — any two parts of a large system are close — is explained by the small world as scattered shortcuts and by the hourglass as every path passing through one layer, and both yield a short average distance. What separates them is where betweenness sits, spread over many edges or piled on the middle layer; and the prescriptions are opposed, since bypassing the middle and unifying the middle each destroy what the other wants.'),
        rel('network-cascade', 'generates',
          '把平均距离压下去的那几条边，同时把故障的可及范围拉了过来——消息到得快和故障到得快是同一批边的同一个性质。所以小世界不是级联发生的背景，它就是级联能全局化的机制。',
          'The same few edges that collapse the average distance bring the reach of a failure closer: news arriving fast and trouble arriving fast are one property of one set of edges. A small world is not the background a cascade happens against but the mechanism by which it goes global.'),
      ],
      mistakenFor: bi(
        '最常与无标度网络混为一谈，仿佛短路径必然来自枢纽。不必：Watts–Strogatz 的重连几乎不动度分布，照样让距离塌缩；按度从高到低摘节点即可分辨——枢纽网络的短路径会崩掉，小世界扛得住。第二个混淆是把短路径读成够得着：Kleinberg 1999 年证明，一张图可以处处只有几步之遥，却没有任何只用本地信息的算法找得到那条路。',
        'Most often merged with scale-free networks, as though short paths needed hubs. They do not: Watts–Strogatz rewiring barely touches the degree distribution and still collapses distance, and removing nodes in order of degree tells the two apart — a hub network loses its short paths, a small world does not. The second confusion reads short paths as reachable: Kleinberg showed in 1999 that a graph can be a few steps across everywhere while no algorithm using only local information can find the route.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/hourglass-waist',
    depth: {
      origin: bi(
        '同一个形状在三处各自被命名，成因毫无关系：协议栈把它当设计原则（一切在 IP 之上、IP 在一切之上），代谢的窄腰是十几种核心中间物承接几乎全部分解与合成，发育的窄腰是胚胎中期最像、两端最不像——后者 1828 年就被 von Baer 看到，一个半世纪后才被叫作沙漏。设计、演化、发育各自到达同一形状，这是它算一条结构而不算一个工程学派的原因。',
        'The shape was named three times over from unrelated causes: the protocol stack takes it as a design principle (everything over IP, IP over everything), metabolism has a dozen intermediates carrying almost all breakdown and biosynthesis, and development has embryos most alike in the middle and least alike at either end — seen by von Baer in 1828, called an hourglass only 150 years later. Design, evolution and development each arrive at one shape, which is why this counts as a structure rather than an engineering school.',
      ),
      minimalForm: 'N 侧 × M 侧的 N·M 组两两对接 → 对同一约定的 N + M 组对接',
      canonicalSubstrates: [
        sub('协议栈的 IP 层', 'The IP layer of the protocol stack', '计算机网络', 'Computer networking', 0,
          '上面跑什么应用、下面走什么链路都可以自由更换，因为两侧各自只需要对准同一层',
          'applications above and link technologies below can each be swapped freely, because each side only has to meet the same one layer',
          '这道窄腰并非不可替换，替换的代价落在两侧已经建成的一切上：IPv6 从 1998 年开始部署至今未完成，而技术早就就绪。所以窄腰的稳固描述的是外部性，不是技术上的优越。',
          'The waist is replaceable in principle, and the cost of replacing it lands on everything already built on either side: IPv6 has been shipping since 1998 and is still not finished, though the technology was ready long ago. The stability of a waist describes an externality rather than technical superiority.'),
        sub('代谢的核心中间物', 'Core metabolic intermediates', '生物化学', 'Biochemistry', 1,
          '上千种底物先被降解成十几种中间物，再由它们合成上千种产物；两端的多样度就是这一层收窄换来的',
          'thousands of substrates are broken down to a dozen intermediates and thousands of products built back up from them, and the variety at both ends is what the narrowing buys',
          '这里没有所有权可言——没有谁能对乙酰辅酶 A 收租——所以代谢窄腰只长出鲁棒性问题：核心一被抑制，全部下游同时瘫痪，这正是许多抗生素与除草剂的作用点。扼制点问题在这个基底里结构性地不会出现。',
          'Ownership has no counterpart here — nobody can charge rent on acetyl-CoA — so the metabolic waist grows only the robustness problem: inhibit the core and everything downstream fails at once, which is exactly where many antibiotics and herbicides act. The chokepoint problem structurally cannot arise in this substrate.'),
        sub('支付清算与平台结算层', 'Payment rails and platform settlement', '产业组织', 'Industrial organisation', 2,
          '谁持有这一层，决定它是让两侧各自自由的公共设施，还是一个能同时对两侧定价的位置',
          'who holds the layer decides whether it is shared infrastructure that frees both sides or a position from which both sides can be priced',
          '这里的收窄不是自发的而是竞争出来的，而且可以反着走：持有者随时能改规则，把两侧的多样度从窄腰买来的变成窄腰允许的。前两个基底的窄腰改不动，这一个一纸合同就能改。',
          'The narrowing here is won rather than spontaneous, and it can be run backwards: whoever holds the layer can change the terms, so variety on both sides stops being something the waist bought and becomes something the waist permits. The other two waists cannot be edited; this one changes with a contract.'),
      ],
      relations: [
        rel('commons-congestion', 'generates',
          '一旦所有人都必须经过同一层，这层就成了共享资源：容量、故障与拥挤由全体承担，而占用由个体决定。收窄正是把分散的负载变成一份公地的那个动作，所以沙漏总是把两侧的自由和中间的公地问题一起带来。',
          'Once everyone has to pass through one layer, that layer is a shared resource: its capacity, its failures and its congestion are borne collectively while the taking is decided individually. The narrowing is the act that turns scattered load into a commons, so an hourglass always delivers freedom at the ends and a commons problem in the middle together.'),
        rel('commensuration-cost', 'emerges-from',
          '两两对接要付 N·M 份翻译代价，对同一约定对接只付 N + M 份，所以窄腰是通约代价在参与方足够多时的必然出口。这也说明了它为什么总落在中间：最贵的那一层，正是每一侧本来都必须去理解另一侧的那一层。',
          'Pairwise interoperation pays N·M translations where a common convention pays N + M, so the waist is where commensuration cost goes once there are enough parties. It also says why the narrowing lands in the middle: the most expensive layer is the one at which each side would otherwise have to understand the other.'),
        rel('network-externality-lockin', 'generates',
          '窄腰的价值随两侧采用者的数量增长，于是它自己制造出自己的不可替换性——更好的协议出现时，没有人能单方面切过去。窄腰稳固不是因为它更好，是因为它先到，而先到之后两侧都被绑住了。',
          'A waist grows more valuable as adoption on both sides grows, so it manufactures its own irreplaceability: when a better protocol appears, nobody can move to it alone. A waist is stable because it arrived first and then tied both sides down, not because it is better.'),
      ],
      mistakenFor: bi(
        '常被当成分层架构的同义词。分层只说系统有层次，沙漏的主张更强：恰好有一层是窄的，而别处的宽正是那一层的窄换来的——数每层的可选项即可分辨，分层系统各层数量相当，沙漏在某一层有尖锐的最小值。第二种误读把窄腰当成最优设计：那个约定通常不是同代里最好的，只是先到并从此无法被单方面替换，起作用的是唯一性而不是质量。',
        'Routinely treated as a synonym for layered architecture. Layering says only that a system has levels; the hourglass claim is stronger — exactly one level is narrow and the breadth elsewhere is what that narrowness buys, so counting alternatives per level separates them: comparable counts throughout, or a sharp minimum at one. The second misreading takes the waist for the best design available, when the convention there is usually not the best of its generation but the first to arrive and thereafter unswitchable.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/causal-propagation-limit',
    depth: {
      origin: bi(
        '1905 年爱因斯坦把这个上限立为公设，1908 年闵可夫斯基把它画成光锥。此后它被三次重新发现，且都不带相对论：Lieb 与 Robinson（1972）在格点量子系统里得到涌现的有效光锥，模型里根本没有光速；Lamport（1978）只用消息延迟就建出同样的偏序；接触追踪拿接触率当上限，画的还是那个锥。所以光锥不是关于光的事实，是关于只要存在任何有限上限的事实。',
        'Einstein made the bound a postulate in 1905 and Minkowski drew it as a cone in 1908. What is worth noticing is that it was rediscovered three times with no relativity in sight: Lieb and Robinson (1972) found an emergent effective cone in lattice quantum systems where no light speed appears in the model, Lamport (1978) built the same partial order out of message latency alone, and contact tracing draws the cone using a contact rate. The light cone is not a fact about light but about there being any finite bound at all.',
      ),
      minimalForm: 'Δd > v_max · Δt ⟹ 两事件之间不可能有直接因果',
      canonicalSubstrates: [
        sub('狭义相对论的光锥', 'The light cone of special relativity', '物理学', 'Physics', 1,
          '类空间隔的两个事件互不落在对方的过去锥或未来锥里，因此不可能互为原因',
          'two events at spacelike separation lie in neither the past nor the future cone of the other, so neither can have caused the other',
          '这里的上限是一条公设而不是可测参数，而且精确无例外。别的基底里的上限都是典型值或统计上界、偶尔会被越过，于是锥外在别处只意味着很可能无关，在这里才意味着不可能有关。',
          'The bound here is a postulate rather than a measured parameter, and it holds without exception. In every other substrate it is a typical value or a statistical ceiling that is occasionally exceeded, so outside the cone means very probably unrelated elsewhere and impossible only here.'),
        sub('分布式系统的 happens-before', 'Happens-before in a distributed system', '计算机科学', 'Computer science', 2,
          '某一时刻之前一条消息可能到达的节点集合，决定了哪些节点的状态可能已经被改过',
          'the set of nodes a message could have reached by a given moment, which decides whose state may already have been changed',
          '这里的上限是工程量而不是物理量：超时值由人设定，而且会被违反——一条已判定丢失的消息迟到，会让两个本以为互不可及的事件事实上相关。所以系统必须为锥被穿透准备一套逻辑。',
          'The bound here is an engineering choice rather than a physical constant: a timeout is set by people and does get violated, and a message written off as lost can arrive late and relate two events that had been treated as out of reach. Systems therefore need logic for a cone that leaks.'),
        sub('传染病的接触追踪', 'Contact tracing in an outbreak', '流行病学', 'Epidemiology', 0,
          '单位时间的有效接触数与潜伏期一起，给出一个病例到此刻可能已经传出多远',
          'contacts per unit time together with the incubation period give how far one case could have spread by now',
          '这里的上限是一个分布而不是一个数：少数长距离流动把可及集撕开，于是锥不是空间里的连通区域而是网络上的一组跳数。按地理距离画圈会系统性漏掉远处已经发生的病例。',
          'The bound here is a distribution rather than a number: a few long-distance movements tear the reachable set open, so the cone is not a connected region of space but a count of hops on a network. Drawing circles by geographic distance systematically misses cases that already happened far away.'),
      ],
      relations: [
        rel('small-world', 'competes-with',
          '面对相距很远的两处几乎同时变化，小世界的解释是网络里有一条没被看到的捷径，上限的解释是它们不可能直接相连、必然有共同的更早原因。两者拟合同一份相关数据，分辨的唯一办法是把那条边找出来——而找不到从来不等于不存在。',
          'Faced with two distant places changing at nearly the same time, the small world explains it by an edge nobody has seen and the bound explains it by saying no direct link is possible and something earlier touched both. Both fit the same correlations, and the only way to separate them is to find the edge, where failing to find one has never meant there is none.'),
        rel('natural-experiment', 'generates',
          '上限白送一条排除性约束：落在可及集之外的单位不可能被这次干预碰到，于是空间或时间上的一道边界不经随机化就成了对照组。断点设计与刚好在锥外的比较，靠的都是这一条。',
          'The bound hands over an exclusion restriction for free: a unit outside the reachable set cannot have been touched by this intervention, so a boundary in space or in time supplies a control group with no randomisation at all. Discontinuity designs and just-outside-the-reach comparisons stand on exactly this.'),
        rel('intervention-identifiability', 'explains',
          '它说明了为什么有些因果问题不做实验也能识别：上限在看到任何数据之前就剪掉一大片候选因果图，而这些排除来自物理或工程约束，不是来自对数据的假设——这是识别能依靠的最硬的前提。',
          'It says why some causal questions are identifiable without an experiment: the bound prunes much of the candidate graph before any data arrives, and those exclusions come from a physical or engineering constraint rather than an assumption about the data, which makes them the hardest premises identification can rest on.'),
      ],
      mistakenFor: bi(
        '最常见的误用是把它反过来读。上限只排除，不接纳：落在可及集之外，直接因果被排除；落在里面，则和之前一样什么都没被证明——看到来得及传到就下因果结论，是把必要条件当成了充分条件。第二种混淆来自量子纠缠：超出光锥的两次测量确实相关，看起来像违反。判据很干净——一方能不能靠自己的选择改变另一方看到的分布。',
        'The commonest misuse runs it backwards. The bound excludes and never admits: two events out of each other\'s reach cannot be directly linked, and two inside it are as unexplained as before, so concluding causation because influence had time to arrive treats a necessary condition as sufficient. The second confusion is entanglement, where measurements outside each other\'s cone do correlate and look like a violation. The test is clean: can one side change what the other sees by its own choice?',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/bullwhip-amplification',
    depth: {
      origin: bi(
        '名字是 1997 年 Lee 等人从宝洁的尿布订单里取的：零售端近乎平直，工厂端剧烈摆动。机制早在 1961 年就被 Forrester 演示过，而 MIT 自 1960 年起的啤酒分销游戏每年复现一次：参与者只看得到相邻一级的订单，即使被告知终端需求恒定仍可靠地造出摆动。所以放大不是失误，它照样发生在知情者身上——每一级各自正确的补货策略是相乘的。',
        'The name was taken in 1997 by Lee, Padmanabhan and Whang from Procter & Gamble\'s diaper orders, where retail sales were nearly flat while factory orders swung hard. The mechanism had been demonstrated by Forrester in 1961, and MIT\'s Beer Distribution Game has reproduced it yearly since 1960: players seeing only the tier next to them generate the swings even after being told end demand is constant. The amplification is not a mistake — it happens to people who know about it, because each tier\'s locally correct policy multiplies with the others.',
      ),
      minimalForm: 'Var(Oₙ)/Var(D) = ∏ᵢ₌₁ⁿ gᵢ，gᵢ > 1 且随该级延迟增大',
      canonicalSubstrates: [
        sub('供应链订单', 'Orders along a supply chain', '运营管理', 'Operations management', 2,
          '零售、分销、制造、原料，每多一级，放大就再乘一次',
          'retail, distribution, manufacture, raw material — one more tier means one more factor',
          '真实链条不是一条线而是一张网：一家供应商同时服务多条链，各链的波动在汇合处可能互相抵消。按单链数级数会高估放大，真正决定倍数的是有多少级在同时对同一个终端需求做外推。',
          'A real chain is a network rather than a line: one supplier serves several chains at once and their fluctuations can partly cancel where they meet. Counting tiers along one line overstates the amplification, and what sets the factor is how many tiers extrapolate from the same end demand at once.'),
        sub('货币政策的传导', 'Monetary policy transmission', '宏观经济学', 'Macroeconomics', 1,
          '政策的效果要几个季度后才在数据里显现，决策者始终在看滞后的读数',
          'a policy move shows up in the data several quarters later, so the decision is always taken on a lagged reading',
          '这里的下游会预期上游要做什么并提前调整，于是延迟被预期抵消掉一部分——链上每一级都在给其他级建模。牛鞭模型里各级只外推、不预期，所以它给出的放大在有前瞻性主体的链条上是上界而不是估计。',
          'Downstream here anticipates what upstream will do and adjusts in advance, so expectation cancels part of the delay: every tier is modelling the others. In the bullwhip skeleton tiers extrapolate and never anticipate, so its amplification is an upper bound rather than an estimate wherever the agents look ahead.'),
        sub('分布式服务的重试风暴', 'Retry storms in a distributed service', '分布式系统', 'Distributed systems', 0,
          '每一层超时后重试，重试量逐层相乘，一次轻微变慢变成压垮下游的负载',
          'each layer retries after a timeout and the retries multiply layer by layer, turning a slight slowdown into enough load to bury the layer below',
          '这里被放大的是负载而不是订单，而且它闭合成正反馈：放大的重试进一步拖慢下游，使延迟本身变大。牛鞭把延迟当外生常数，所以预测不了这里的不回落——原始触发消失后，系统仍卡在高负载。',
          'What is amplified here is load rather than orders, and it closes into positive feedback: the retries slow the layer below further, so the delay itself grows. The skeleton treats delay as an exogenous constant and cannot predict what follows — the system stays stuck at high load after the original trigger is gone.'),
      ],
      relations: [
        rel('information-asymmetry', 'emerges-from',
          '上游看到的是订单而不是需求，而订单里混着下游自己的补货策略——被隐藏的是行动，不是类型。牛鞭就是这份隐藏沿链条逐级累乘的结果，这也说明了为什么共享终端需求能一次治好它。',
          'Upstream sees orders rather than demand, and an order carries the downstream tier\'s own replenishment policy inside it: what is hidden is an action, not a type. The bullwhip is that concealment multiplied tier by tier, which is also why sharing end demand cures it in one move.'),
        rel('delay-induced-oscillation', 'special-case-of',
          '牛鞭是时滞振荡把延迟具体化为信息上行所需的时间、把增益具体化为每一级的安全库存之后的样子。区别在于它不是一个回路在振铃，而是若干级的增益相乘，所以签名是方差比随级数几何增长。',
          'The bullwhip is delay-induced oscillation with the delay realised as the time information takes to travel upstream and the gain as each tier\'s safety stock. What sets it apart is that this is not one loop ringing but several gains in series, so the signature is a variance ratio growing geometrically with tier count.'),
        rel('negative-feedback-control', 'emerges-from',
          '每一级都在跑一个从它自己的位置看完全正确的负反馈：库存低了就多订。问题在于整条回路的总增益是各级增益的乘积，而没有任何一级看得见这个乘积。',
          'Every tier runs a negative feedback loop that is entirely correct from where it stands: order more when stock is low. The trouble is that the loop gain of the whole is the product of the tiers\' gains, and no tier can see that product.'),
      ],
      mistakenFor: bi(
        '常被误当成终端需求本身波动大，也就是把摆动记到市场账上。诊断很直接：把每一级订单的方差与终端需求的方差相比，若比值沿链条向上单调增长，摆动是链条制造的而不是收到的。第二个混淆是与一般的时滞振荡混同——单个回路去掉一级只减少一项，牛鞭去掉一级是除以一个倍数。',
        'Routinely blamed on end demand being volatile, which books the swings to the market. The diagnostic is direct: compare the variance of orders at each tier against the variance of end demand, and if the ratio grows monotonically upstream the swing was manufactured by the chain rather than received. The second confusion is with delay-induced oscillation generally — removing a tier from a ringing loop subtracts a term, while removing one here divides by a factor.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/commons-congestion',
    depth: {
      origin: bi(
        'Hardin 在 1968 年给了它名字，用的是英格兰公地放牧的例子——而历史上的英格兰公地恰恰有延续数百年的份额规则，所以那个例子不是他所描述之事的史实。更早也更准确的陈述是 1833 年的 Lloyd，渔业版本的数学由 Gordon（1954）与 Scott（1955）在那个词组出现之前给出。Ostrom 1990 年的田野工作把话说完整：悲剧只属于无治理的那一种。',
        'Hardin named it in 1968 using English common pasture as the illustration — and the historical English commons ran stinting rules for centuries, so the example is not a historical case of what he described. The earlier and more accurate statement is Lloyd\'s in 1833, and the mathematics of the fishery version was given by Gordon in 1954 and Scott in 1955, before the phrase existed. Ostrom\'s fieldwork in 1990 completed the account: the tragedy belongs only to the ungoverned kind.',
      ),
      minimalForm: '多取一单位，收益归己而损耗由 n 人分担 ⟹ 均衡取用量 > 社会最优',
      canonicalSubstrates: [
        sub('渔业', 'A fishery', '资源经济学', 'Resource economics', 1,
          '种群的自然增长率给出可持续捕捞量，超过它资源就开始被消耗而不是被利用',
          'the population\'s natural growth rate sets the sustainable catch, and past it the stock is being spent rather than used',
          '再生速率不是常数：它随存量非线性变化，存量跌破某个水平后再生率自己崩掉，于是这条结构中间多出一个不可返回点。纽芬兰鳕鱼 1992 年禁渔，三十多年后仍未恢复。',
          'The regeneration rate is not a constant: it varies nonlinearly with the stock and collapses on its own once the stock falls below a level, which puts a point of no return in the middle of the structure. The Newfoundland cod fishery closed in 1992 and has not recovered three decades later.'),
        sub('抗生素的有效性', 'The effectiveness of antibiotics', '公共卫生', 'Public health', 0,
          '每一次开药的好处归这一位病人和这一位医生，耐药性的代价由所有未来的病人分担',
          'the benefit of each prescription goes to this patient and this doctor while the cost of resistance is carried by every future patient',
          '这份公地是有效性这样一种无形物，既看不见也难以计量，而它的使用者跨越世代、永远坐不到同一张桌子上。Ostrom 的本地治理条件在这里结构性地无法满足，剩下的只有指南与管制这类外部规则。',
          'The commons here is effectiveness, an intangible that is neither visible nor easy to meter, and its users are spread across generations who can never sit at one table. Ostrom\'s conditions for local governance structurally cannot be met, which leaves only external rules such as guidelines and regulation.'),
        sub('无线频谱', 'Radio spectrum', '通信工程', 'Telecommunications engineering', 2,
          '可排除性在这里是工程选择：许可、拍卖、载波侦听都能造出排除，于是治理是否可能由技术而不是由社会结构决定',
          'excludability here is an engineering choice — licences, auctions and carrier sensing all manufacture it — so whether governance is possible is settled by technology rather than by social structure',
          '频谱不会被用坏：拥挤是瞬时的，停止使用立刻恢复，没有任何存量被消耗。这里只剩拥挤而没有退化，Hardin 那个不可逆的部分完全不适用，而只针对拥挤的调度与定价放到渔业上救不了场。',
          'Spectrum does not wear out: congestion is instantaneous, it clears the moment use stops, and no stock is consumed. What is left is congestion without degradation, so the irreversible half of the account does not apply — and the congestion-side remedies, scheduling and pricing, would save no fishery.'),
      ],
      relations: [
        rel('selective-gate', 'generates',
          '资源一旦在负荷下退化，几乎总会有人装上一道准入规则：配额、许可、排队、拥挤定价。所以拥挤是门被造出来的原因；而门一旦存在，它决定的就不只是通过多少，还有通过的是谁。',
          'Once a resource degrades under load, somebody installs an admission rule: a quota, a licence, a queue, a congestion charge. Congestion is why gates get built, and once one exists it decides not only how much crosses but who does — governing a commons rewrites the composition of its users, not only their number.'),
        rel('nash-equilibrium', 'special-case-of',
          '拥挤的公地是把收益函数固定成收益归己、损耗共担，把策略固定成取多少，再挂上一个被所有人共同消耗的状态变量之后的均衡。所以它不是新的博弈，而是 n 人囚徒困境加一个存量——正是那个存量让单次分析不够用。',
          'A congested commons is the equilibrium with the payoff fixed to private benefit against shared cost, the strategy fixed to how much to take, and a state variable attached that everyone consumes in common. It is the n-player prisoner\'s dilemma with a stock, and the stock is what makes a one-shot analysis insufficient.'),
        rel('slow-variable-creep', 'generates',
          '悲剧通常不是一次崩塌，而是存量的缓慢下滑：把损耗摊给 n 个人，就是把它稀释进一个没有任何单次决策推得动、因而也没有任何单次决策需要负责的变量。所以它的典型观测形态是基线在悄悄移动，而不是一起可归因的事故。',
          'The tragedy is usually not a collapse but a slow slide of the stock: dividing the cost across n users dilutes it into a variable that no single decision moves detectably and that no single decision therefore has to answer for. Its characteristic form is a baseline quietly shifting rather than an attributable accident.'),
      ],
      mistakenFor: bi(
        '最常与公共品的搭便车问题混为一谈。分辨点是竞用性：公共品是非竞用的，我用不减少你能用的——灯塔、一条已证明的定理——它的病是没人愿意出钱把它做出来；公地是竞用而难以排除的，它的病是每个人都愿意多用一点。处方方向相反：公共品需要有人出钱把量做上去，公地需要有人把量压下来。判据只有一句——多一个人用，剩下的会不会变少。',
        'Most often merged with the free-rider problem of public goods. The distinguishing feature is rivalry: a public good is non-rival, my use taking nothing from yours — a lighthouse, a theorem already proved — and its disease is that nobody will pay to bring it into existence. A commons is rival and hard to exclude from, and its disease is that everyone takes a little more. The prescriptions point opposite ways, so the test is one question: does one more user leave less for the rest?',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/information-asymmetry',
    depth: {
      origin: bi(
        'Akerlof 的《柠檬市场》1970 年发表前被三家期刊退稿，其中两家的理由是：如果论证成立，它就适用于每一个市场——而那正是论文要说的。Spence（1973）补上信号一侧，Stiglitz 补上甄别一侧。值得留意的是隐藏行动那半边另有更老的来路：道德风险原是十九世纪保险核保的行话，指投保人的品行，比它成为形式模型早了一百年，两半至今带着彼此不匹配的词汇。',
        'Akerlof\'s Market for Lemons was rejected by three journals before it appeared in 1970, two of them on the ground that if the argument held it would apply to every market — which was the paper\'s point. Spence supplied the signalling half in 1973 and Stiglitz the screening half. Worth noticing is that the hidden-action half has a separate and older lineage: moral hazard was a nineteenth-century underwriting term for a policyholder\'s character, a century before it became a model, and the two halves still carry mismatched vocabulary.',
      ),
      minimalForm: '签约前隐藏类型 → 逆向选择；签约后隐藏行动 → 道德风险',
      canonicalSubstrates: [
        sub('保险', 'Insurance', '保险精算', 'Insurance and actuarial science', 2,
          '承保之后投保人有多谨慎无法观察，于是免赔额与共保用让投保人自己留下一部分损失来替代监控',
          'how carefully a policyholder behaves once covered cannot be observed, so deductibles and coinsurance substitute for monitoring by leaving part of the loss with them',
          '保险是两副面孔同时在场且最难分开的地方：投保人既隐藏了风险类型，也隐藏了投保后的行为，而两者在理赔数据里长得一样——都是高赔付。要分开只能依靠保单条款的外生变化。',
          'Insurance is where both faces are present at once and hardest to separate: the policyholder hides a risk type and also hides post-contract behaviour, and in claims data the two look the same — high payouts either way. Separating them takes exogenous variation in policy terms.'),
        sub('学历作为劳动市场信号', 'Credentials as a labour-market signal', '劳动经济学', 'Labour economics', 1,
          '文凭之所以能当信号，靠的是它对能力较低的人更贵，而不是靠它教了什么',
          'a credential works as a signal because it costs more for a weaker candidate, not because of what it teaches',
          '信号与人力资本在这里观测上完全缠住：同一份工资溢价既可读成学到了东西，也可读成证明了类型，而两种读法对教育政策的含义正好相反。要分开只能找那种改变文凭获取难度却不改变教学内容的外生变化。',
          'Signalling and human capital are observationally entangled here: the same wage premium reads either as something learned or as a type proved, and the two readings imply opposite education policy. Separating them needs variation that changes how hard the credential is to get without changing what is taught.'),
        sub('择偶与亲代投入', 'Mate choice and parental investment', '行为生态学', 'Behavioural ecology', 0,
          '配偶的遗传质量是看不见的类型，配偶此后在育雏上投入多少是看不见的行动，同一对关系里两副面孔都在',
          'a mate\'s genetic quality is an unobservable type and how much that mate later invests in the young is an unobservable action, so both faces sit inside one relationship',
          '这里没有合约，也就没有签约那一刻，签约前后这条划分因此失去锚点。两副面孔只能按被隐藏的是禀赋还是努力来分，不能按时间——可见骨架里真正做事的是被隐藏之物的种类，签约只是它最方便的界标。',
          'There is no contract here and so no moment of signing, which leaves the before-and-after division without an anchor. The two faces can be told apart only by whether what is hidden is an endowment or an effort, never by timing — so what does the work is the kind of thing hidden, the signature being merely its most convenient landmark.'),
      ],
      relations: [
        rel('selective-gate', 'competes-with',
          '两者解释同一个观察：某道边界的一侧，人群构成不是到达者的公平样本。门的解释是一条声明过的规则在分选，不对称的解释是好的那一方自己退了出去。判据是构成差跟着哪些变量走——跟着规则看得见的走，是可观测量上的选择；跟着规则看不见的走，是逆向选择。规则错了可以改规则，逆向选择改不了。',
          'Both account for one observation: on one side of a boundary the population is not a fair sample of what arrived. The gate explains it by an announced rule doing the sorting, the asymmetry by the good counterparties having withdrawn. What separates them is what the composition difference tracks — the variables the rule can see, or exactly the ones it cannot. And a wrong rule can be rewritten where adverse selection cannot, because no rule can condition on what is hidden from it.'),
        rel('costly-signal', 'generates',
          '隐藏类型是昂贵信号存在的理由：类型看得见的地方，没有人需要为证明自己烧掉一笔纯损失。所以信号是不对称的产物而不是补丁，而且那笔代价必须真的被付掉才有效。',
          'A hidden type is why a costly signal exists at all: where the type is visible nobody needs to burn resources proving it. The signal is a product of the asymmetry rather than a patch on it, and the cost has to be genuinely paid to work.'),
      ],
      mistakenFor: bi(
        '常被当成一方掌握的信息比另一方少这件普通事。不够：结构要求被隐藏的信息与对方的收益直接相关，而且不知情的一方知道自己不知情。市场之所以垮，正是因为买方按平均质量正确地压价，而这一压把好的卖方挤了出去；买方若只是判断错了，得到的是普通亏损。判据是一句——现在的报价里是否已经含有对平均质量的折扣。',
        'Routinely taken for the ordinary fact that one side knows less than the other. That is not enough: the structure requires the hidden information to bear on the other side\'s payoff, and requires the uninformed side to know it is uninformed. A market unravels because buyers correctly discount to average quality and the discount pushes good sellers out; where buyers are merely mistaken the result is an ordinary loss. The test is one question: does the price on offer already carry a discount for average quality?',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/selective-gate',
    depth: {
      origin: bi(
        '这条结构说得最锋利的地方是膜生物物理：1998 年 MacKinnon 解出钾通道的结构，滤器是一圈羰基氧，排布恰好复现 K⁺ 脱去水合壳后的配位环境，于是通道让 K⁺ 通过的速率比更小的 Na⁺ 高约一万倍——被排除的是更小的那一个。规则不是按尺寸筛，而是与一个特定配位相匹配，所以把门设想成筛子，从第一步就走错了。',
        'The structure is stated most sharply in membrane biophysics: MacKinnon solved the potassium channel in 1998, revealing a filter of carbonyl oxygens arranged to reproduce the coordination a K⁺ ion loses when it sheds its water shell, so the channel passes K⁺ some ten thousand times more readily than the smaller Na⁺ — the ion excluded is the smaller one. The rule is not a sieve by size but a match to one particular coordination, which is why picturing a gate as a sieve goes wrong at the first step.',
      ),
      minimalForm: '选择性 = P_A / P_B（对两类到达者的通透之比）',
      canonicalSubstrates: [
        sub('钾通道的选择性滤器', 'The selectivity filter of a potassium channel', '生物物理学', 'Biophysics', 0,
          '滤器的几何取代离子的水合壳，这就是这道门的全部规则',
          'the geometry of the filter stands in for the ion\'s water shell, and that is the entire rule of this gate',
          '规则写死在分子结构里，运行中改不了；而通量高到接近扩散极限，所以这里不存在选择性与速度之间的权衡——绝大多数宏观的门做不到这一点。',
          'The rule is fixed in the molecular structure and cannot be edited while running, and the flux runs close to the diffusion limit, so there is no trade here between selectivity and speed — which almost no macroscopic gate manages.'),
        sub('同行评审', 'Peer review', '科学社会学', 'Sociology of science', 2,
          '发表出来的文献构成是长期分选的累积，也是外界唯一能用来反推评审规则的材料',
          'the composition of the published literature is the accumulation of long sorting, and the only material from which the rule can be read back',
          '规则由人执行且对被评者可见，于是被评者会照着规则塑形自己——分子通道不会被到达者迎合，社会性的门会。结果是构成差随时间越来越像规则，而这既可能是规则在起作用，也可能只是投稿方学会了配合。',
          'The rule is applied by people and is visible to those it judges, so they shape themselves to it: an ion channel is never courted by what arrives at it and a social gate always is. The composition difference therefore comes to resemble the rule more and more, which may mean the rule works or may mean applicants learned to comply.'),
        sub('血脑屏障', 'The blood-brain barrier', '药理学', 'Pharmacology', 1,
          '一种药物能不能进入中枢，落在净通量上；绝大多数小分子过不去',
          'whether a drug reaches the central nervous system comes down to net flux, and most small molecules do not',
          '这道门不是一条规则而是几套机制叠加：紧密连接被动地拦，外排泵主动把已经进去的送回来。于是通过是净通量而不是一次判定，用两侧浓度差反推规则会把主动外排读成被动排斥。',
          'This is not one rule but several mechanisms stacked: tight junctions exclude passively while efflux pumps actively return what has already entered. Crossing is therefore a net flux rather than a single verdict, and inferring the rule from the concentrations on either side reads active efflux as passive exclusion.'),
      ],
      relations: [
        rel('hourglass-waist', 'explains',
          '窄腰能让两侧各自繁荣，不只因为它窄，更因为它是一条规则：这个协议表达得了的都过得去，表达不了的一律过不去。所以窄腰一直在塑形两侧——IP 表达不了服务质量，需要确定延迟的设计就被挤到别处去实现。',
          'A waist lets both sides flourish not merely because it is narrow but because it is a rule: what the protocol can express crosses and what it cannot does not. The waist is therefore shaping both sides the whole time — IP cannot express quality of service, so designs needing bounded latency were pushed elsewhere to get it.'),
        rel('selection-bias-absence', 'generates',
          '一道会分选的门，正是让缺席变得可读的那个机制：没出现在这一侧的东西不是随机缺的，它是被规则挑掉的，于是缺席本身携带着关于规则的信息。反过来，任何一份非随机缺失的数据背后都站着一道门。',
          'A gate that sorts is the mechanism that makes an absence readable: what is missing from this side is not missing at random but was removed by the rule, so the absence carries information about the rule. Conversely there is a gate behind every non-random pattern of missing data.'),
        rel('two-error-tradeoff', 'generates',
          '任何在不完全信息下运行的门都必须在错放进来和错挡在外之间选一个位置，而这个位置写在选择规则里：它是规则的一个参数，不是执行中的失误。所以要求一道门把两类错误一起降下来，等于要求提高它所依据的那个量的分辨力。',
          'Any gate operating on incomplete information must sit somewhere between wrongly admitting and wrongly rejecting, and where it sits is written into the selection rule: a parameter of the rule, not a lapse in applying it. Asking a gate to bring both errors down at once is asking for better resolution in the quantity it judges on.'),
      ],
      mistakenFor: bi(
        '常被当成筛子，即一个按尺寸的被动阈值。筛子的规则是一个数，输出是输入的截断；门的规则可以非单调——钾通道优先放更大的 K⁺ 过去，评审偏好意外而不是正确——而且可以耗能主动运行。判据：有没有某个通过了的东西，在另一侧比某个被挡下的还要罕见。还要当心构成差是规则与到达分布的乘积，中立的门面对偏斜的到达者照样给出很大的构成差。',
        'Routinely taken for a sieve, a passive threshold on size. A sieve\'s rule is one number and its output is a truncation of its input; a gate\'s rule can be non-monotonic — the potassium channel prefers the larger ion, review prefers the surprising over the correct — and can be actively powered. The test: is anything that got through rarer on the far side than something turned away? And the composition difference is the rule times the arrival distribution, so a neutral gate facing skewed arrivals still shows a large difference.',
      ),
    },
  },
];
