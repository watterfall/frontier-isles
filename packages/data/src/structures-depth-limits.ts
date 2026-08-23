import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the computational-and-physical-limits family.
 *
 * These eight share a property no earlier family had: all eight carry zero
 * mappings. They were the most abstract entries of the 限界 wave, too general to
 * attach to any one island without the attachment looking arbitrary — which is
 * exactly the case the depth field was added for. A structure can be deep with
 * no island at all, and these are the proof.
 *
 * All eight already declare quantities, so these patches carry depth only.
 *
 * The family's spine is that limits come in two kinds that meet in one place.
 * Some are logical — undecidability, complexity lower bounds, communication
 * complexity — and hold for any machine in any universe. Some are physical —
 * the dissipation floor, Landauer's cost — and hold for any implementation in
 * this one. Landauer is where they meet: erasing a bit is a logical operation
 * whose price is thermodynamic, and the price is kT·ln2 because the entropy of
 * forgetting is the Shannon entropy of what was forgotten. Two entropies, one
 * quantity, different units.
 *
 * The most useful pattern here is verification asymmetry appearing at two
 * severities. Undecidability gives the infinite version — halting is confirmable
 * by running and non-halting is never confirmable at all — and complexity gives
 * the polynomial version, which is P versus NP. Only the harsher one is proved.
 * Everything built on the milder one, cryptography included, rests on a
 * conjecture that nobody can prove because unconditional lower bounds are
 * precisely what nobody can prove.
 *
 * Two edges leave computing for physics and geometry and are worth the batch on
 * their own. Data movement dominating is a surface-to-volume crossover: compute
 * scales with area while off-chip bandwidth scales with the perimeter, so past
 * a size the interface rather than the interior is what limits. And Amdahl's
 * law is Liebig's law of the minimum in the time domain — the serial fraction is
 * the shortest stave, and adding processors adds to staves that were never
 * limiting.
 */

type Bilingual = { zh: string; en: string };
const bi = (zh: string, en: string): Bilingual => ({ zh, en });

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

export const LIMITS_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/undecidability',
    depth: {
      origin: bi(
        '1936 年由 Alan Turing 与 Alonzo Church 各自给出；Turing 的论证不需要任何关于计算机的经验知识，它只用了对角线法——假设存在这样的程序，就能构造出一个让它自相矛盾的输入。',
        'Given independently by Alan Turing and Alonzo Church in 1936. Turing\'s argument needs no empirical knowledge of computers at all: it runs by diagonalisation, assuming such a program exists and then constructing the input on which it contradicts itself.',
      ),
      minimalForm: '不存在 H(p, x) 对所有 (p, x) 判定 p 在 x 上是否停机',
      canonicalSubstrates: [
        sub('停机问题', 'The halting problem', '可计算性理论', 'Computability theory', 0,
          '"所有程序与所有输入"这个输入类，正是让判定器不可能存在的那一步',
          'the input class of all programs on all inputs being exactly what makes a decider impossible',
          '把输入限制到有界循环、原始递归或有限状态的程序类，停机就是可判定的——所以这条定理管的是全体，而实际写出来的程序几乎从不落在全体里。',
          'Restricted to bounded loops, primitive recursion or finite-state programs, halting is decidable — so the theorem governs the totality while almost no program anyone writes lives in the totality.'),
        sub('丢番图方程', 'Diophantine equations', '数论', 'Number theory', 1,
          '希尔伯特第十问题被证否，靠的是把停机问题归约进整系数方程的整数解存在性',
          'Hilbert\'s tenth problem answered in the negative by reducing halting into the existence of integer solutions',
          '限定到一个变元或二次型时同一问题可解——不可判定性来自方程族的表达力，而不是来自"整数很难"。',
          'The same question is solvable for one variable or for quadratic forms: the undecidability comes from the expressive power of the family rather than from integers being hard.'),
        sub('铺砖与准晶', 'Tiling and quasicrystals', '离散几何', 'Discrete geometry', 1,
          '一组砖块能否铺满平面，可以把图灵机的运行编码进铺法本身',
          'whether a set of tiles fills the plane, with a Turing machine\'s run encodable in the tiling itself',
          '一旦允许周期性假设，问题立即可判定——不可判定性与非周期铺法的存在是同一件事的两种说法。',
          'Assume periodicity and the question becomes decidable at once: the undecidability and the existence of aperiodic tilings are one fact stated two ways.'),
        sub('程序性质的静态判定', 'Deciding program properties statically', '软件工程', 'Software engineering', 2,
          'Rice 定理让任何非平凡的语义性质都不可判定，于是实用工具只能是部分正确的过程',
          'Rice\'s theorem making every non-trivial semantic property undecidable, so a usable tool can only be a partially correct procedure',
          '工程上的出路不是解决它而是选边站：要么放过一些真错误（漏报），要么把一些正确程序判为错（误报）；工具的性格全在这个选择里。',
          'The engineering way out is not to solve it but to pick a side — miss some real faults, or reject some correct programs — and a tool\'s character lies entirely in which side it picked.'),
      ],
      relations: [
        rel('verification-asymmetry', 'explains',
          '停机问题是半可判定的：程序真的停机时，把它跑一遍就确认了；不停机时，跑多久都不构成确认。所以验证不对称在这里达到极端形式——一侧在有限时间内可确认，另一侧永远不可，而这个落差不是资源问题。',
          'Halting is semi-decidable: when a program does halt, running it confirms that; when it does not, no amount of running confirms anything. Verification asymmetry reaches its extreme form here — one side is confirmable in finite time and the other never is — and the gap is not a matter of resources.'),
        rel('open-set-recognition', 'generates',
          'Rice 定理说任何非平凡的语义性质都不可判定，所以关于程序行为的分类器不可能完备：必然存在一个既不能判为"是"也不能判为"否"的区域。"以上皆非"这个出口在这里不是设计选择，是被定理强加的。',
          'Rice\'s theorem makes every non-trivial semantic property undecidable, so no classifier over program behaviour can be complete: a region that is neither yes nor no necessarily exists. The exit for none of the above is not a design choice here but something the theorem imposes.'),
      ],
      mistakenFor: bi(
        '常被误当成"这个问题解不了"。定理说的是不存在对全体输入都有效的程序，而工程上遇到的输入几乎从不是全体。把它当成放弃的理由，是在用一条关于无穷输入类的定理，为一个有限输入类上的失败开脱。',
        'Often mistaken for the problem being unsolvable. The theorem says no program works for the whole input class, and the inputs met in practice are almost never the whole class. Treating it as grounds for giving up uses a theorem about an infinite class to excuse failure on a finite one.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/computational-lower-bounds',
    depth: {
      origin: bi(
        '最早的干净下界是比较排序的 n·log n：不看任何具体算法，只数决策树的叶子必须至少有 n! 个，深度就至少是 log(n!)。这个论证的形状——数一数可区分的结果有多少——至今仍是大多数下界的骨架。',
        'The earliest clean bound is n·log n for comparison sorting, argued without reference to any algorithm: a decision tree needs at least n! leaves, so its depth is at least log(n!). The shape of that argument — count how many distinguishable outcomes there must be — is still the skeleton of most lower bounds.',
      ),
      minimalForm: '∀ 算法 A：cost(A) ≥ f(n)，与 A 无关',
      canonicalSubstrates: [
        sub('比较排序', 'Comparison sorting', '算法理论', 'Algorithm theory', 0,
          '信息论式的计数给出 n·log n，任何基于比较的算法都不能更快',
          'an information-theoretic count giving n·log n, below which no comparison-based algorithm goes',
          '换一个问题类下界就换一条：允许读取键的位（基数排序）时，同一个任务是线性的——下界约束的是比较这个手段，不是排序这件事。',
          'Change the class and the bound changes: allowed to read the bits of a key, radix sort does the same task in linear time. The bound constrains comparison as a means, not sorting as a task.'),
        sub('密码学的安全归约', 'Security reductions in cryptography', '密码学', 'Cryptography', 1,
          '一个方案的安全性被归约到某个问题的假定下界上，安全声明因此是有条件的',
          'a scheme\'s security reduced to an assumed bound on some problem, which makes the claim conditional',
          '这里的"下界"全部是猜想而非定理：因数分解没有被证明是难的，所以密码学的地基是一整套未经证明的假设，量子算法已经掀掉了其中一块。',
          'These bounds are conjectures rather than theorems — factoring has never been proved hard — so cryptography rests on a set of unproven assumptions, one of which quantum algorithms have already removed.'),
        sub('物理系统的模拟代价', 'The cost of simulating physical systems', '计算物理', 'Computational physics', 2,
          '多体波函数的维数随粒子数指数增长，这条代价属于问题而不属于程序',
          'the many-body wavefunction\'s dimension growing exponentially in particle count, a cost belonging to the problem rather than to any program',
          '张量网络与蒙特卡洛并没有推翻它，而是利用了真实态的低纠缠结构——出口在"松弛旋钮"这一栏，不在下界那一栏。',
          'Tensor networks and Monte Carlo do not overturn it; they exploit the low entanglement of physically realised states. The exit sits in the slack column rather than in the bound.'),
      ],
      relations: [
        rel('verification-asymmetry', 'explains',
          'P 与 NP 之差正是"找到"与"检查"之间的差价，而这条差价至今未被证明存在——原因恰恰是无条件下界没人能证。所以我们每天依赖的这份不对称是一条猜想，而不是一条定理。',
          'The gap between P and NP is exactly the difference between finding and checking, and it has never been proved to exist — precisely because unconditional lower bounds are what nobody can prove. The asymmetry relied on daily is a conjecture rather than a theorem.'),
        rel('parallel-speedup-ceiling', 'explains',
          '并行只能压缩宽度不能压缩深度：关键路径长度的下界对任意多的处理器同时成立。所以"加机器"这条路的尽头不是资源用完，而是撞上一条与资源数无关的界。',
          'Parallelism compresses width and not depth: a lower bound on critical-path length holds for any number of processors at once. The road of adding machines ends not when resources run out but against a bound that does not mention how many there are.'),
      ],
      mistakenFor: bi(
        '常被误当成"这条路走不通"。下界永远是对某个问题类、某种资源、某个精确性要求成立的，而近似、随机化与可利用的结构这三个旋钮任何一个一拧，你解的就已经不是那个问题了。绕开下界的不是更聪明的算法，是更诚实地承认自己实际要什么。',
        'Often mistaken for the road being closed. A bound always holds for some class, some resource and some exactness requirement, and turning any one of three knobs — approximation, randomisation, exploitable structure — means the problem being solved is no longer that one. What gets around a bound is not a cleverer algorithm but a more honest statement of what is actually wanted.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/verification-asymmetry',
    depth: {
      origin: bi(
        '1971 年由 Stephen Cook 形式化为 NP 的定义：可在多项式时间内验证的问题类。但这条差价被制度性利用远早于此——同行评议、专利审查与数学证明都建立在"检查比发现便宜"上，只是没人把它写成一个量。',
        'Formalised by Stephen Cook in 1971 as the definition of NP, the class verifiable in polynomial time. The gap had been exploited institutionally long before: peer review, patent examination and mathematical proof all rest on checking being cheaper than finding, without anyone writing it as a quantity.',
      ),
      minimalForm: 'cost(verify | witness) ≪ cost(generate)',
      canonicalSubstrates: [
        sub('数学证明', 'Mathematical proof', '数学', 'Mathematics', 2,
          '证明本身就是见证串：找它可能要几十年，逐行检查它是有限的机械工作',
          'the proof itself being the witness — decades to find, a finite mechanical job to check line by line',
          '现代证明长到人力检查不再可靠（四色定理、有限单群分类），于是不对称在实践中被证明长度吃掉，形式化验证是把它买回来的尝试。',
          'Modern proofs have grown past reliable human checking — four colour, the classification of finite simple groups — so the asymmetry is eaten by length in practice, and formalisation is the attempt to buy it back.'),
        sub('公钥密码', 'Public-key cryptography', '密码学', 'Cryptography', 0,
          '加密便宜、破解昂贵，整套体系就架在这个方向性的代价差上',
          'encryption cheap and breaking expensive, with the whole system built on that directional difference in cost',
          '这里的不对称依赖未被证明的复杂度假设，所以它不是定理保证的，而是"至今没人做到"——量子算法已经取消了其中一项。',
          'The asymmetry here rests on unproven complexity assumptions, so it is not guaranteed by a theorem but by nobody having managed it yet — and quantum algorithms have already cancelled one item.'),
        sub('蛋白质结构', 'Protein structure', '结构生物学', 'Structural biology', 1,
          '预测一个折叠很难，而拿到候选结构后用实验数据核对相对便宜',
          'predicting a fold being hard while checking a candidate against experimental data is comparatively cheap',
          '核对只能证伪不能确证：与密度图相符的结构不止一个，所以这里的"验证"给出的是不矛盾而不是正确。',
          'Checking falsifies rather than confirms: more than one structure fits a density map, so verification here yields consistency rather than correctness.'),
        sub('审计与合规', 'Audit and compliance', '会计学', 'Accounting', 2,
          '被审计方生产证据、审计方抽样核对，制度的整个经济性来自这份差价',
          'the audited party producing evidence and the auditor sampling it, with the whole economics of the institution coming from that difference',
          '当被审计方能伪造见证串时不对称反转——此时审计成本逼近重做一遍，而这正是大型财务舞弊长期不被发现的机制。',
          'The asymmetry inverts once the audited party can forge the witness: audit cost then approaches redoing the work, which is the mechanism by which large financial frauds stay undetected for years.'),
      ],
      relations: [
        rel('traceability-chain', 'generates',
          '当生成贵而检查便宜时，理性的制度设计就是要求生产者附上可检查的痕迹——这正是携带证明的代码、收据、审计日志与实验记录本存在的原因。溯源链不是额外的官僚成本，它是把不对称兑现出来的那个装置。',
          'When producing is expensive and checking is cheap, the rational institutional design asks the producer to emit a checkable trace — which is why proof-carrying code, receipts, audit logs and lab notebooks exist. A traceability chain is not added bureaucracy but the device that cashes the asymmetry in.'),
        rel('zero-knowledge-verification', 'generates',
          '它是这条不对称被推到极限的形态：见证串可以被设计成只泄露"我确实有它"而不泄露它本身。这说明验证需要的不是内容而是一个足够约束的承诺，而这一点在密码学之外同样成立。',
          'It is the asymmetry pushed to its limit: the witness can be designed to reveal that one exists without revealing what it is. That shows verification needs not the content but a sufficiently binding commitment to it, which holds well outside cryptography.'),
      ],
      mistakenFor: bi(
        '常被误当成"验证者比生成者聪明"。不对称完全挂在见证串上，不挂在人上：有可携带的见证时，外行也能检查专家的工作；没有时，同等水平的专家也只能重做一遍。评审失效的多数场合不是评审者不行，是这份工作根本没产出可检查的见证。',
        'Often mistaken for the verifier being smarter than the producer. The asymmetry hangs entirely on the witness rather than on people: with a portable witness a non-expert can check an expert\'s work, and without one an equal expert can only redo it. Most review failures are not reviewers falling short but work that produced no checkable witness at all.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/communication-complexity',
    depth: {
      origin: bi(
        '1979 年由 Andrew Yao 提出：Alice 与 Bob 各持一半输入，问他们至少要交换多少比特才能算出一个共同的函数。这个模型故意假设双方算力无限，于是唯一的代价就是通信——把"搬"与"算"彻底分开。',
        'Posed by Andrew Yao in 1979: Alice and Bob each hold half the input, and the question is how many bits they must exchange to compute a joint function. The model deliberately grants both unlimited computing power so that communication is the only cost, separating moving from computing completely.',
      ),
      minimalForm: 'CC(f) ≥ log rank(M_f)',
      canonicalSubstrates: [
        sub('分布式协议', 'Distributed protocols', '分布式系统', 'Distributed systems', 0,
          '达成共识所需的消息数有下界，而这条界与每个节点本地能算多快无关',
          'a lower bound on the messages needed to reach agreement, independent of how fast any node computes locally',
          '异步且允许故障时下界让位给不可能性（FLP）：此时问题不是要多少比特，而是确定性共识根本不存在。',
          'Asynchronous with failures, the bound gives way to an impossibility (FLP): the question is then not how many bits but that deterministic consensus does not exist at all.'),
        sub('芯片上的数据流', 'On-chip dataflow', '计算机体系结构', 'Computer architecture', 1,
          '把计算切给哪些单元，决定了必须跨越切口的比特数——换一种切分，下界就换一条',
          'how the computation is cut between units deciding how many bits must cross, so a different cut is a different bound',
          '这条界假设切分是固定的；可重构架构通过改变切分本身来规避它，代价转移到重构的时间与能量上。',
          'The bound assumes a fixed cut, and reconfigurable architectures evade it by changing the cut, with the cost moving into the time and energy of reconfiguring.'),
        sub('组织中的协调', 'Coordination inside an organisation', '组织理论', 'Organisation theory', 2,
          '信息分散在不同人手里时，达成一致所需的沟通量随分散程度增长，与个人能力无关',
          'agreement costing communication that grows with how dispersed the information is, regardless of individual ability',
          '这个类比只在信息确实不可复制时成立；把知识写下来即等于把双方的输入合并，此时通信下界不再适用而变成一次性的记录成本。',
          'The analogy holds only while the information genuinely cannot be copied: writing knowledge down merges the two inputs, and the communication bound gives way to a one-off cost of recording.'),
      ],
      relations: [
        rel('data-movement-dominates', 'explains',
          '通信复杂度给出必须跨越边界的比特数的无条件下界，而数据搬运主导说的是：在真实机器上，正是这个下界而不是算术量决定了时间与能量。理论的界与工程的观察在这里是同一个量的两面。',
          'Communication complexity gives an unconditional bound on the bits that must cross a boundary, and data-movement dominance says that on real machines it is that bound rather than the arithmetic which sets time and energy. The theoretical limit and the engineering observation are two sides of one quantity.'),
        rel('graph-laplacian-spectrum', 'emerges-from',
          '必须跨越的比特数由切口决定，而"哪里存在便宜的切口"是一个谱的问题：代数连通度低的地方就是天然的分割处。所以该把系统切在哪里，答案不在架构直觉里而在图谱里。',
          'How many bits must cross is set by the cut, and where cheap cuts exist is a spectral question: low algebraic connectivity marks the natural places to divide. Where to split a system therefore has its answer in the graph spectrum rather than in architectural intuition.'),
      ],
      mistakenFor: bi(
        '常被误当成"带宽不够"。下界说的是必须搬多少比特，与线有多粗无关：加粗管子缩短的是时间，搬运量一比特都不会少，而能量正比于搬运量。把它读成带宽问题，会一路走到加带宽而能耗不降的那个墙上。',
        'Often mistaken for insufficient bandwidth. The bound says how many bits must move, which has nothing to do with how fat the pipe is: a wider pipe shortens the time while the volume moved does not fall by one bit, and energy is proportional to volume. Reading it as a bandwidth problem leads straight to the wall where bandwidth grows and energy does not fall.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/parallel-speedup-ceiling',
    depth: {
      origin: bi(
        '1967 年由 Gene Amdahl 在一场反驳里提出：他并不是要给并行计算一个公式，而是要指出当时对多处理器的乐观估计忽略了串行段。这条论证以反例的身份出生，后来变成了整个领域的规划工具。',
        'Put by Gene Amdahl in a 1967 rebuttal. He was not offering parallel computing a formula but pointing out that the optimism of the day ignored the serial section. The argument was born as a counterexample and became the field\'s planning tool.',
      ),
      minimalForm: 'S ≤ 1 / (s + (1−s)/p) → 1/s，与 p 无关',
      canonicalSubstrates: [
        sub('多处理器计算', 'Multiprocessor computing', '高性能计算', 'High-performance computing', 0,
          '串行占比 s 单独定死上界 1/s，处理器数量再多也趋近它而不会越过',
          'the serial fraction s alone fixing a ceiling of 1/s that any number of processors approaches without crossing',
          '实测常比公式更差，因为协调开销随处理器数增长——超过某个数目后加速比会掉头下降，而公式本身预测不出这个拐点。',
          'Measurements often come in worse than the formula because coordination overhead grows with processor count, so past some number the speedup turns and falls — a turning point the formula itself does not predict.'),
        sub('人力投入与工期', 'Adding people to a late project', '项目管理', 'Project management', 2,
          '沟通开销随人数平方增长，于是加人不仅收益递减，过了某点还会延长工期',
          'communication overhead growing as the square of headcount, so adding people not only yields less but past a point extends the schedule',
          'Brooks 的说法针对的是已经延期的项目：在项目早期加人是有效的，把这条经验普遍化成"人多必乱"是把一个条件结论读成了无条件的。',
          'Brooks\'s claim was about projects already late; adding people early works. Generalising it into more people always meaning more chaos reads a conditional result as an unconditional one.'),
        sub('酶促反应的限速步', 'The rate-limiting step of a pathway', '生物化学', 'Biochemistry', 0,
          '整条通路的通量由最慢的一步决定，上调其余酶的表达量不改变产出',
          'the flux of a whole pathway set by its slowest step, with raising the expression of the other enzymes changing nothing',
          '代谢控制分析表明控制常常分散在多步之间而非集中于一步，所以"限速步"往往是一个方便的近似而不是事实。',
          'Metabolic control analysis shows control is often distributed across several steps rather than concentrated in one, so a rate-limiting step is frequently a convenient approximation rather than a fact.'),
      ],
      relations: [
        rel('limiting-factor', 'special-case-of',
          'Amdahl 定律就是最小律在时间维度上的样子：串行段是最短的那块板，而增加处理器是在给本来就不构成约束的板加高。两条结构给出同一个建议——先找出瓶颈，在此之前投入与产出之间没有关系。',
          'Amdahl\'s law is the law of the minimum in the time dimension: the serial section is the shortest stave and adding processors builds up staves that were never the constraint. Both give one piece of advice — find the bottleneck first, because until then input and output are unrelated.'),
        rel('data-movement-dominates', 'emerges-from',
          '实际拒绝并行的那一段，多数时候不是"必须按顺序算"，而是"必须先把数据搬到一起"。所以上界常常由内存带宽而不是算法结构定死——这解释了为什么重写算法结构往往没有改变加速比。',
          'The section that actually refuses to parallelise is usually not computation that must be sequential but data that must first be brought together, so the ceiling is set by memory bandwidth rather than by algorithm structure. That is why restructuring the algorithm so often leaves the speedup where it was.'),
      ],
      mistakenFor: bi(
        '常被误当成"并行没有前途"。固定问题规模时上界成立，而实践中人们通常是"机器多了就把问题做大"——在这个模式下可扩展性由 Gustafson 的形式描述，加速比可以随资源线性增长。两种情形结论相反，而它们的差别只在问题规模是不是跟着变。',
        'Often mistaken for parallelism having no future. The ceiling holds at fixed problem size, while in practice more machines usually means a bigger problem — a regime Gustafson\'s form describes, where speedup grows linearly with resources. The two regimes give opposite conclusions and differ only in whether the problem size moves too.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/data-movement-dominates',
    depth: {
      origin: bi(
        '在计算机体系结构里被称为"内存墙"：处理器速度每年提升远快于内存延迟改善，两条曲线在 1990 年代分岔，此后所有的架构设计都是在应对这个差距。同一现象在物流与生物里各自被独立发现过。',
        'Known in computer architecture as the memory wall: processor speed improved far faster each year than memory latency, the two curves diverged in the 1990s, and every architectural decision since has been a response to that gap. The same phenomenon was found independently in logistics and in biology.',
      ),
      minimalForm: '计算强度 = 操作数 / 搬运量；低于阈值时代价由搬运定',
      canonicalSubstrates: [
        sub('内存墙', 'The memory wall', '计算机体系结构', 'Computer architecture', 0,
          '从 DRAM 取一个数所耗的能量比对它做一次浮点乘法高两个数量级',
          'fetching a number from DRAM costing two orders of magnitude more energy than multiplying it',
          '缓存把这条差价藏起来而不是消除它：命中率高时系统看上去是计算受限的，而工作集一超出缓存，真实的代价结构立刻暴露。',
          'Caches hide the difference rather than remove it: at a high hit rate the system looks compute-bound, and the moment the working set exceeds the cache the real cost structure appears.'),
        sub('供应链与仓储', 'Supply chains and warehousing', '运筹学', 'Operations research', 2,
          '运输与仓储成本常常超过加工本身，于是工厂选址由物流而非工艺决定',
          'transport and storage often exceeding processing itself, so a plant\'s location is decided by logistics rather than by process',
          '高附加值、低重量的产品（芯片、药物）反转这个结构——此时搬运可忽略，选址由人才与监管决定。',
          'High-value low-weight goods such as chips and drugs invert the structure: movement becomes negligible and location is decided by talent and regulation.'),
        sub('细胞内的运输', 'Transport inside a cell', '细胞生物学', 'Cell biology', 1,
          '大分子的扩散慢到必须靠马达蛋白沿细胞骨架主动运输，而这份运输消耗大量 ATP',
          'macromolecules diffusing so slowly that motor proteins must haul them along the cytoskeleton, at a large cost in ATP',
          '小分子与小细胞里扩散足够快，主动运输是多余的——所以这条约束是随尺寸出现的，细菌基本不需要这套机器。',
          'In small molecules and small cells diffusion is fast enough and active transport is superfluous, so the constraint appears with size and bacteria largely do without the machinery.'),
      ],
      relations: [
        rel('surface-volume-crossover', 'emerges-from',
          '芯片的算力随面积增长，而与外界交换数据的能力随边缘的引脚数增长——一个是二维一个是一维。所以规模越大，限制越是落在界面而不是内部，这与生物体长大后受限于表面积是同一条几何。',
          'A chip\'s computing grows with its area while its ability to exchange data grows with the pins on its edge — one two-dimensional, the other one. The larger it gets, the more the limit sits at the interface rather than the interior, which is the same geometry that limits a growing organism by its surface.'),
        rel('finite-time-dissipation', 'emerges-from',
          '把电荷沿一条线快速推过去，代价的主体是电阻损耗，而这恰恰是"在有限时间内完成"要付的那份额外量。所以搬运昂贵不是工艺缺陷，它是把不可逆过程做快的热力学代价在电路上的样子。',
          'Pushing charge quickly down a wire costs mostly resistive loss, which is exactly the extra paid for finishing in finite time. Movement being expensive is therefore not a fabrication shortcoming but what the thermodynamic price of hurrying an irreversible process looks like in a circuit.'),
      ],
      mistakenFor: bi(
        '常被误当成一个可以靠工艺进步消化的暂时问题。差距的来源是几何而非工艺：距离是物理的，能量随距离增长，而缩小器件只缩短了片内的那一段，片外那一段由封装与板级尺寸决定。所以正确的应对是改变计算强度——让数据少走，而不是让走得更快。',
        'Often mistaken for a temporary problem that process improvements will absorb. The gap comes from geometry rather than fabrication: distance is physical, energy grows with it, and shrinking devices shortens only the on-chip leg while the off-chip leg is set by packaging and board dimensions. The right response is to change the arithmetic intensity — move data less rather than move it faster.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/landauer-erasure-cost',
    depth: {
      origin: bi(
        '1961 年由 Rolf Landauer 提出，用来解决麦克斯韦妖：妖不是靠测量赚到功的，它靠的是把测量结果记下来，而当它的记忆有限、必须擦除时，擦除的代价正好抵消了赚到的功。2012 年在单个胶体粒子上被直接测出。',
        'Given by Rolf Landauer in 1961 to settle Maxwell\'s demon: the demon does not gain work by measuring but by recording, and once its memory is finite and must be cleared, the cost of clearing exactly cancels the gain. Measured directly on a single colloidal particle in 2012.',
      ),
      minimalForm: 'E ≥ kT·ln2 每擦除一比特',
      canonicalSubstrates: [
        sub('麦克斯韦妖', 'Maxwell\'s demon', '统计物理', 'Statistical physics', 1,
          '妖的记忆被擦除时耗散的热，恰好等于它靠分拣分子赚到的功',
          'the heat dissipated when the demon\'s memory is cleared exactly matching the work it gained by sorting molecules',
          '记忆足够大时妖可以在有限时间内净赚功，只是把账推迟到擦除那一刻——这条界约束的是循环过程，不是单次操作。',
          'With a large enough memory the demon does net gain work over a finite run, merely deferring the bill to the moment of erasure: the bound governs cyclic processes rather than single operations.'),
        sub('CMOS 逻辑门', 'CMOS logic gates', '微电子学', 'Microelectronics', 0,
          '一个与门把两位输入合并成一位输出，这一步逻辑上不可逆因而有热力学底价',
          'an AND gate merging two input bits into one output, a logically irreversible step that therefore carries a thermodynamic floor price',
          '现代器件的实际耗散比这条界高约三到四个数量级，所以 Landauer 界在今天不是工程约束而是终点标记——它说的是"再优化也到此为止"。',
          'Real devices dissipate three to four orders of magnitude above the bound, so today it marks the terminus rather than constraining engineering: it says where optimisation ends.'),
        sub('生物计算与神经元', 'Biological computation and neurons', '生物物理', 'Biophysics', 2,
          '突触与离子通道的能耗被拿来与这条界比较，用以判断生物计算离物理极限有多远',
          'the energy of synapses and ion channels compared against the bound to judge how far biological computing sits from the physical limit',
          '神经元的耗能主体是维持离子梯度而非擦除信息，所以这个比较回答的是"效率如何"，而不是"是否受该界约束"。',
          'A neuron\'s energy goes mostly into maintaining ion gradients rather than erasing information, so the comparison answers how efficient it is rather than whether the bound binds it.'),
      ],
      relations: [
        rel('shannon-entropy', 'emerges-from',
          '这条界的数值是 kT·ln2，因为被遗忘的那个状态的热力学熵，就是它的香农熵——两个熵是同一个量的两种单位。这是逻辑与物理真正接合的那一点：擦除是一个逻辑操作，而它的价钱是热力学的。',
          'The bound is kT·ln2 because the thermodynamic entropy of the state being forgotten is its Shannon entropy: two entropies, one quantity in different units. This is the point where logic and physics genuinely meet — erasure is a logical operation and its price is thermodynamic.'),
        rel('dissipation-floor', 'special-case-of',
          '它是耗散下界作用在信息上的那个特例：不可逆度在这里由"一步操作合并了多少可区分状态"给出，于是一条关于热机的普遍结论，变成了一条关于逻辑门的具体数值。',
          'It is the dissipation floor applied to information: irreversibility is measured here by how many distinguishable states one operation merges, which turns a general result about heat engines into a specific number about a logic gate.'),
      ],
      mistakenFor: bi(
        '常被误当成"计算必然耗能"。可逆计算不擦除信息，因而原则上不受这条界约束；代价没有消失而是搬了家——转到时钟、面积、延迟以及为了不丢中间结果所需的存储上。这条界钉住的是遗忘的价钱，不是计算的价钱。',
        'Often mistaken for computation necessarily costing energy. Reversible computation erases nothing and so is not bound by it in principle; the cost does not vanish but moves, into clock rate, area, latency and the storage needed to keep intermediate results. The bound prices forgetting rather than computing.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/dissipation-floor',
    depth: {
      origin: bi(
        '出自 19 世纪的热力学第二定律，但作为一条可比较的下界要到 Clausius 引入熵之后才成形：可逆地完成一个变化所需的功是一个确定的数，而任何实际过程都比它多花，多出的部分就是耗散。',
        'It descends from the nineteenth-century second law but only became a comparable bound once Clausius introduced entropy: the work needed to make a change reversibly is a definite number, every real process spends more, and the excess is the dissipation.',
      ),
      minimalForm: 'W ≥ ΔF；耗散 = W − ΔF ≥ 0',
      canonicalSubstrates: [
        sub('热机效率', 'Heat-engine efficiency', '热力学', 'Thermodynamics', 1,
          '卡诺效率是可逆极限，任何实际发动机与它的差额就是熵产生',
          'Carnot efficiency as the reversible limit, with any real engine\'s shortfall being entropy production',
          '卡诺极限只对循环热机成立；燃料电池不经过热这一步，因而不受卡诺限制——把它当作"任何能量转换的上限"是一个常见的越界引用。',
          'The Carnot limit holds for cyclic heat engines: a fuel cell does not pass through heat and is not bound by it, and citing Carnot as a ceiling on any energy conversion is a common overreach.'),
        sub('生化合成', 'Biochemical synthesis', '生物能学', 'Bioenergetics', 2,
          '细胞合成一个分子实际消耗的自由能，高于该反应的理论最小值，差额维持了反应的方向性',
          'the free energy a cell actually spends exceeding the reaction\'s theoretical minimum, with the excess buying directionality',
          '这里的"浪费"是有功能的：接近可逆意味着正反两个方向速率相当，而生命需要的是单向推进，所以这份耗散是被选择保留的而不是待优化的。',
          'The waste here is functional: running near reversibility means the forward and backward rates are comparable, while life needs one direction, so this dissipation is selected for rather than waiting to be optimised away.'),
        sub('经济中的摩擦成本', 'Frictional costs in an economy', '经济学', 'Economics', 0,
          '每一次交易、搜寻与执行都产生一份不可回收的损耗，其下界由制度的不可逆程度决定',
          'every transaction, search and enforcement producing an unrecoverable loss whose floor is set by how irreversible the institution is',
          '这个类比缺一个像温度那样的普适标度：经济里没有 kT，所以"下界"在这里是比较性的而非绝对的，只能在同类制度之间比。',
          'The analogy lacks a universal scale like temperature — there is no kT in an economy — so the floor here is comparative rather than absolute and only compares institutions of one kind.'),
      ],
      relations: [
        rel('finite-time-dissipation', 'generates',
          '这条下界是准静态值，只有无限慢才能达到，所以任何真实过程付的是"下界加上一项随速度增长的额外量"。这条结构的实际内容几乎全在那个额外项里——单说下界，等于给出一个没人能到达的数。',
          'The floor is the quasi-static value, reachable only infinitely slowly, so any real process pays it plus a term that grows with speed. Nearly all of the structure\'s practical content lives in that extra term: quoting the floor alone gives a number nobody can reach.'),
        rel('robustness-efficiency-tradeoff', 'explains',
          '逼近这条下界要求过程缓慢且贴近平衡，而贴近平衡恰恰是系统对扰动没有余量的状态。所以热力学效率与抗扰能力的冲突有一个物理原因，不是组织上的取舍——这也解释了为什么被优化到极致的系统总是脆的。',
          'Approaching the floor requires running slowly and close to equilibrium, and close to equilibrium is exactly where a system has no margin against disturbance. The conflict between thermodynamic efficiency and tolerance therefore has a physical cause rather than being an organisational choice, which is also why maximally optimised systems are brittle.'),
      ],
      mistakenFor: bi(
        '常被误当成"任何变化都要付费"。准静态极限下这份代价趋近于零，所以这条结构约束的是以有限速率完成的过程，而不是变化本身。把极限点排除在外地引用它，会得出"节能有绝对下限"这个在无时限场景里根本不成立的结论。',
        'Often mistaken for change always costing something. In the quasi-static limit the cost goes to zero, so the structure constrains processes completed at a finite rate rather than change itself. Citing it with the limiting case excluded yields an absolute floor on energy saving that simply does not hold where there is no deadline.',
      ),
    },
  },
];
