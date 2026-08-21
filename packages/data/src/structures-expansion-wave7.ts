import type { SeedStructure, StructureQuantity } from './structures';

/**
 * Wave 7 — the 「涌现」 band of the topic set: 25 structures in which nobody
 * designed the outcome and it appeared anyway.
 *
 * Same terms as waves 4 through 6: zero mappings, `proposed`, no edge claimed.
 *
 * Three entries sit beside a structure that already exists, and each says how
 * it differs rather than claiming fresh ground:
 *
 *   small-world vs ISO-22 图拉普拉斯 — the Laplacian spectrum measures how hard
 *   a graph is to cut; small-world is about short paths and high clustering
 *   coexisting, which is a statement about distance rather than about cutting.
 *
 *   template-copying-error vs ISO-15 纠错码 — codes are the remedy; this is the
 *   phenomenon and its threshold, and the interesting quantity is the error
 *   rate above which no amount of coding keeps the information alive.
 *
 *   delay-induced-oscillation vs ISO-14 负反馈控制 — negative feedback is the
 *   mechanism; this is what that mechanism does once the loop acquires lag, so
 *   one is the controller and the other is its failure mode.
 *
 * Where a curator judges any pair to be one structure, keep the ISO-backed one.
 */

type Bilingual = { zh: string; en: string };

const bi = (zh: string, en: string): Bilingual => ({ zh, en });

const q = (
  nameZh: string,
  nameEn: string,
  roleZh: string,
  roleEn: string,
): StructureQuantity => ({ name: bi(nameZh, nameEn), role: bi(roleZh, roleEn) });

const P = (recordIds: number[]) => ({
  source: 'xfrontier.science',
  url: 'https://xfrontier.science/',
  recordIds,
  reviewedAt: '2026-08-22',
});

export const WAVE_7_STRUCTURES: SeedStructure[] = [
  {
    id: 'struct://xfrontier/niche-construction',
    title: bi('生态位构建', 'Niche construction'),
    statement: bi(
      '行动者改造环境的行为，反过来改变作用在自己身上的选择压——因果是双向的，所以「环境」不能再被当作外生给定。',
      'What an agent does to its environment changes the selection acting back on it — causation runs both ways, so the environment can no longer be treated as given from outside.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('改造强度', 'modification rate', '行动者改变环境的速度', 'how fast the agent changes its surroundings'),
      q('反馈回路时长', 'feedback loop time', '改造后的环境重新作用回来所需的时间', 'how long before the changed environment acts back'),
      q('遗留效应', 'ecological inheritance', '被传给后来者的那部分环境改造', 'the part of the modification handed on to whoever comes next'),
    ],
    failsWhen: bi(
      '环境改变速度远慢于个体寿命时反馈断开：改造仍在发生，但作用不回到改造者身上，于是它是遗产而不是选择压。',
      'The loop breaks when the environment changes far more slowly than an individual lives: the modification still happens but never returns to its author, making it a bequest rather than a selection pressure.',
    ),
    provenance: P([343, 1648, 493, 1702, 1120]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/deep-time-accumulation',
    title: bi('深时累积', 'Deep-time accumulation'),
    statement: bi(
      '一个在人类时标上可以忽略的速率，在足够长的时标上会主导一切——量级的差别只需要时间就能翻转，不需要机制改变。',
      'A rate negligible on a human timescale dominates everything on a long enough one: the ordering of magnitudes flips with time alone, no change of mechanism required.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('速率', 'the rate', '在短期观察里被判为可忽略的那个量', 'the quantity dismissed as negligible in short observation'),
      q('时标', 'the timescale', '把速率乘成主导项的那个乘数', 'the multiplier that turns the rate into the dominant term'),
      q('是否有截断', 'whether anything truncates it', '决定累积是否真的能一直进行', 'what decides whether accumulation actually continues'),
    ],
    failsWhen: bi(
      '存在快速反馈截断累积时不成立：一个把偏离拉回来的机制会让长期积累停在某个水平，此时外推短期速率会严重高估。',
      'It fails where a fast feedback truncates the accumulation: a mechanism pulling deviation back caps the long-run total, and extrapolating the short-run rate badly overshoots.',
    ),
    provenance: P([471, 484, 479, 478, 715]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/bullwhip-amplification',
    title: bi('牛鞭效应', 'The bullwhip'),
    statement: bi(
      '信息沿链条向上游传递时带着延迟，每一级为自保而放大自己的反应，于是末端的小波动在源头变成大摆动。',
      'Information travelling upstream carries delay, and each tier amplifies its own reaction to protect itself, so a small ripple at the far end becomes a large swing at the source.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('每级放大倍数', 'per-tier amplification', '一级把波动放大多少', 'how much one tier magnifies a fluctuation'),
      q('信息延迟', 'information delay', '上游看到下游变化所需的时间', 'how long before upstream sees a downstream change'),
      q('链条级数', 'number of tiers', '放大是逐级相乘的，所以级数是指数底', 'amplification multiplies per tier, so this is the exponent'),
    ],
    failsWhen: bi(
      '链上共享实时信息时放大消失：让每一级直接看到终端需求，逐级猜测就不再发生，波动不再被乘。',
      'Amplification disappears once real-time information is shared: when every tier sees end demand directly there is no tier-by-tier guessing left to multiply.',
    ),
    provenance: P([1030, 92, 124, 396, 392]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/propagule-pressure',
    title: bi('繁殖体压力', 'Propagule pressure'),
    statement: bi(
      '一次入侵能否成功，主要取决于引入的数量与频次，而不是引入者本身有多优越——反复的小尝试胜过一次精心的大尝试。',
      'Whether an introduction takes hold depends mainly on how many arrive and how often, not on how superior the arrival is — repeated small attempts beat one well-prepared large one.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('单次引入数量', 'size per introduction', '一次带来多少', 'how many arrive at once'),
      q('引入频次', 'frequency', '尝试多少次；它常常比数量更重要', 'how many attempts, which often matters more than the size'),
      q('随机灭绝概率', 'chance of stochastic loss', '小种群即使有优势也会消失的概率', 'the odds a small population disappears despite an advantage'),
    ],
    failsWhen: bi(
      '目标环境已饱和时数量不起作用：位置被占满之后，再多的到达也只是被挡在外面，此时优越性才重新成为决定项。',
      'Numbers stop working in a saturated environment: once the slots are filled, more arrivals are simply turned away, and superiority becomes the deciding term again.',
    ),
    provenance: P([84, 1102, 1095, 493, 209]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/archival-decay',
    title: bi('归档腐烂', 'Archival decay'),
    statement: bi(
      '承载信息的介质与格式，其失效速度快于内容的价值衰减速度——于是「存下来了」与「还读得出」之间会打开一道越来越大的缝。',
      'The medium and the format holding information fail faster than the content loses value, so a widening gap opens between having stored it and still being able to read it.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'regularity',
    quantities: [
      q('介质寿命', 'medium lifetime', '物理载体还能读多久', 'how long the physical carrier stays readable'),
      q('格式寿命', 'format lifetime', '解码它的软件还存在多久；通常比介质更短', 'how long software that decodes it survives, usually shorter than the medium'),
      q('内容价值衰减率', 'value decay of the content', '与前两者赛跑的那个量', 'the quantity the other two race against'),
    ],
    failsWhen: bi(
      '有主动迁移机制时可对抗——但迁移本身是持续成本，所以真正的问题从来不是"能不能存住"，而是"谁在持续付这笔钱"。',
      'Active migration counters it, but migration is a recurring cost, so the real question is never whether it can be kept but who keeps paying to keep it.',
    ),
    provenance: P([1821, 1626, 1555, 1731, 1638]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/commons-congestion',
    title: bi('公地拥挤', 'Congestion of the commons'),
    statement: bi(
      '一份共享资源在无治理时被过度使用而退化，因为每个使用者独享收益、共担损耗——个体理性叠加成集体失败。',
      'A shared resource degrades under use when nobody governs it, because each user takes the benefit and shares the cost — individual rationality summing to collective failure.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('个体收益 / 共担成本', 'private benefit against shared cost', '整条结构的动力来源', 'the source of the whole dynamic'),
      q('再生速率', 'regeneration rate', '资源自我恢复的速度', 'how fast the resource restores itself'),
      q('使用者数量与可排除性', 'users, and whether they can be excluded', '决定治理是否可能', 'what decides whether governance is even possible'),
    ],
    failsWhen: bi(
      '有明确边界与本地治理规则、或存在惩罚机制时可持续——所以"公地必然悲剧"是误读，被证明的是"无治理的公地"。',
      'It stays sustainable with clear boundaries, local rules or a sanction mechanism, so "the commons must end in tragedy" misreads it: what was shown holds for an ungoverned commons.',
    ),
    provenance: P([348, 1705, 526, 226, 1591]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/small-world',
    title: bi('小世界', 'Small worlds'),
    statement: bi(
      '在高度聚簇的网络里加入少量长程连接，平均距离就塌缩到对数量级，而本地聚簇几乎不受影响——远和近可以同时成立。',
      'Add a few long-range links to a heavily clustered network and the average distance collapses to logarithmic while local clustering barely moves — far and near hold at once.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('平均路径长度', 'average path length', '被长程边压下去的那个量', 'the quantity the long links collapse'),
      q('聚类系数', 'clustering coefficient', '几乎不受影响的那个量；两者同时成立才是小世界', 'the quantity that barely moves, and both together are what makes it a small world'),
      q('长程边比例', 'fraction of long-range links', '极小的比例就足够', 'a tiny fraction is enough'),
    ],
    failsWhen: bi(
      '强地理或成本约束下长程边不可得：如果远距离连接本身昂贵到建不起来，网络就停在规则格点上，距离按维度而非对数增长。',
      'Long links are unavailable under strong geographic or cost constraints: if distance itself is expensive the network stays on a lattice and distance grows with dimension rather than logarithmically.',
    ),
    provenance: P([358, 829, 183, 522, 1089]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/superposition-ordering',
    title: bi('叠覆与地层顺序', 'Superposition and stratigraphic order'),
    statement: bi(
      '后来的压在先前的上面，于是空间上的层序直接读作时间上的先后——历史不必被记录，它被堆叠本身保存下来。',
      'What came later lies on what came earlier, so a spatial ordering reads directly as a temporal one — history need not be recorded because stacking preserves it.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'regularity',
    quantities: [
      q('层序', 'the sequence of layers', '被直接读作时间的那个空间关系', 'the spatial relation read straight off as time'),
      q('沉积速率', 'deposition rate', '把厚度换算成时长的系数', 'what converts thickness into duration'),
      q('扰动痕迹', 'signs of disturbance', '判断顺序是否仍可信的依据', 'the evidence for whether the order can still be trusted'),
    ],
    failsWhen: bi(
      '有扰动、倒转或重写时顺序失真：一次翻转或一次原地改写就足以让整段层序读出错误的时间，而且往往不留明显痕迹。',
      'Disturbance, inversion or rewriting distorts the order: one overturn or one in-place edit is enough to make a whole sequence read the wrong history, often without an obvious trace.',
    ),
    provenance: P([313, 1035, 479, 484, 1479]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/template-copying-error',
    title: bi('模板复制误差', 'Template copying error'),
    statement: bi(
      '一切复制都有误差，而信息能维持多久由误差率与校对成本的平衡决定；越过某个误差阈值，信息不是慢慢退化而是整体熔毁。',
      'All copying errs, and how long information survives is set by the balance between error rate and the cost of proofreading; past a threshold it does not degrade gradually — it melts.',
    ),
    status: 'proposed',
    theme: 'living-computation',
    kind: 'regularity',
    quantities: [
      q('每次复制的误差率', 'error rate per copy', '被校对成本压低的那个量', 'the quantity proofreading buys down'),
      q('信息长度', 'length of the information', '越长越难维持；阈值与长度成反比', 'the longer it is the harder to hold, with the threshold falling as length rises'),
      q('校对成本', 'cost of proofreading', '压低误差率要付的代价', 'what lowering the error rate costs'),
    ],
    failsWhen: bi(
      '误差率越过阈值时信息整体熔毁，而不是按比例劣化；反过来若校对免费，误差可被任意压低，这条权衡就不存在。',
      'Above the threshold the information melts rather than degrading proportionally; and if proofreading were free the error rate could go arbitrarily low and the tradeoff would not exist at all.',
    ),
    provenance: P([1623, 1095, 1846, 1150, 251]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/boundary-work',
    title: bi('边界工作', 'Boundary work'),
    statement: bi(
      '划定谁算圈内人的那个动作，本身就在塑造这个领域是什么——边界不是对既有事实的描述，它是持续被维护的建制。',
      'The act of deciding who counts as inside is itself what shapes the field — the boundary does not describe a pre-existing fact, it is an institution kept up by continuous maintenance.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'regularity',
    quantities: [
      q('准入判据', 'the admission criterion', '被用来划线的那条规则', 'the rule used to draw the line'),
      q('被分配的稀缺资源', 'the scarce resource at stake', '边界之所以值得维护的原因', 'why the boundary is worth maintaining at all'),
      q('维护成本', 'maintenance cost', '不断重划与执行所要付的代价', 'what it takes to keep redrawing and enforcing it'),
    ],
    failsWhen: bi(
      '无稀缺资源可分配时边界不被维护——它会松弛、模糊、最终消失，所以一条被严格守卫的边界总在指向某种被分配的东西。',
      'With no scarce resource to allocate the boundary is not maintained: it slackens, blurs and goes, so a fiercely guarded boundary always points at something being allocated.',
    ),
    provenance: P([1153, 664, 719, 51, 379]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/tolerance-evolution',
    title: bi('耐受演化', 'Evolution of tolerance'),
    statement: bi(
      '反复的亚致死暴露筛选出抗性：每次压力都杀掉最敏感的一批，留下的比上一轮更耐受，于是压力本身在制造它的对手。',
      'Repeated sub-lethal exposure selects for resistance: each round kills the most sensitive and leaves survivors more tolerant than before, so the pressure manufactures its own opposition.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('暴露剂量', 'exposure dose', '必须是亚致死的；这是整条结构的前提', 'which must be sub-lethal, and is the premise of the whole structure'),
      q('存活者的耐受分布', 'tolerance among survivors', '每一轮被右移的那个分布', 'the distribution shifted right each round'),
      q('轮次', 'number of rounds', '把小位移累成大位移的那个乘数', 'the multiplier turning small shifts into a large one'),
    ],
    failsWhen: bi(
      '暴露足够致命且无残存者时不发生：没有存活者就没有被选择的对象，所以「彻底」与「反复」是两条完全不同的策略。',
      'It does not happen when exposure is lethal enough to leave no survivors: with nothing surviving there is nothing to select, which makes thorough and repeated two entirely different strategies.',
    ),
    provenance: P([1705, 6, 1526, 114, 301]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/delay-induced-oscillation',
    title: bi('时滞诱导振荡', 'Delay-induced oscillation'),
    statement: bi(
      '一个本来稳定的负反馈回路，一旦修正信号带上足够的延迟，修正就会过冲，稳态被换成持续振荡——延迟本身就是不稳定的来源。',
      'A negative feedback loop that would be stable overshoots once its correction is delayed enough, and the steady state is replaced by sustained oscillation — the lag itself is the source of instability.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('回路时滞', 'loop delay', '从偏离发生到修正到达的时间', 'from deviation to the arrival of its correction'),
      q('回路增益', 'loop gain', '修正的力度；与时滞相乘决定是否振荡', 'the strength of the correction, which multiplied by the delay decides oscillation'),
      q('振荡周期', 'oscillation period', '通常约为时滞的四倍，是可用来反推时滞的观测量', 'usually about four times the delay, and an observable from which the delay can be inferred'),
    ],
    failsWhen: bi(
      '时滞远小于回路自身的时间常数时不出现：此时修正在系统跑远之前就到了，负反馈照常起稳定作用。',
      'It does not appear when the delay is far below the loop\'s own time constant: the correction arrives before the system has moved far, and the negative feedback stabilises as intended.',
    ),
    provenance: P([539, 92, 396, 1521, 124]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/network-externality-lockin',
    title: bi('网络外部性与锁定', 'Network externality and lock-in'),
    statement: bi(
      '一件东西的价值随使用者数量上升，于是领先者被自己的用户群锁定在位——胜出的未必更好，只是先到了临界规模。',
      'Something worth more the more people use it locks its leader in place through its own user base — the winner is not necessarily better, only earlier past critical mass.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('使用者数量', 'installed base', '价值的自变量', 'what the value is a function of'),
      q('转换成本', 'switching cost', '把用户钉在原地的量', 'what pins users where they are'),
      q('可多归属性', 'whether users can belong to several at once', '决定锁定是硬还是软', 'what decides whether the lock-in is hard or soft'),
    ],
    failsWhen: bi(
      '转换成本低、或用户可以同时归属多个时锁定很弱——所以观察到一家独大，先要确认用户是不能走还是不想走。',
      'Lock-in is weak where switching is cheap or users can belong to several at once, so an observed monopoly first needs the question of whether users cannot leave or merely will not.',
    ),
    provenance: P([1784, 1513, 1719, 809, 1728]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/drift-fixation',
    title: bi('漂变固定', 'Fixation by drift'),
    statement: bi(
      '在小群体里，谁被保留下来主要由随机取样决定而不是由优势决定——所以在小样本上观察到的「胜出」，往往什么都不说明。',
      'In a small population what survives is decided mainly by random sampling rather than by advantage — so a winner observed in a small sample often means nothing at all.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('有效群体大小', 'effective population size', '决定随机性有多重的那个量', 'what decides how heavily randomness weighs'),
      q('选择系数', 'selection coefficient', '优势有多大；与群体大小的乘积决定谁主导', 'how large the advantage is, with its product against population size deciding which force wins'),
      q('固定概率', 'probability of fixation', '一个变体最终占满群体的概率', 'the odds a variant ends up occupying the whole population'),
    ],
    failsWhen: bi(
      '群体足够大时选择压主导，漂变退居次要——所以这条结构真正的用处不是"随机很重要"，而是给出何时不能把胜出当作证据。',
      'In a large enough population selection dominates and drift recedes, so the structure\'s real use is not that randomness matters but that it says when a win cannot be taken as evidence.',
    ),
    provenance: P([419, 1018, 360, 1124, 55]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/path-dependence',
    title: bi('路径依赖与报酬递增', 'Path dependence and increasing returns'),
    statement: bi(
      '一个早期的微小优势被正反馈反复放大，最终变成不可逆的领先——终局由过程中的偶然而非终点的优劣决定。',
      'A small early advantage is amplified again and again by positive feedback into an irreversible lead — the outcome is decided by accidents along the way rather than by merit at the end.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('初始扰动', 'the initial perturbation', '被放大的那点微小差异', 'the small difference that gets amplified'),
      q('反馈增益', 'feedback gain', '每一轮放大多少', 'how much each round magnifies it'),
      q('锁定时点', 'when it locks', '过了这个点，改变代价超过收益', 'past which changing costs more than it returns'),
    ],
    failsWhen: bi(
      '存在低成本转换器时锁定不成立：只要能廉价地在两个方案之间来回，正反馈就积累不出不可逆性。',
      'Lock-in does not hold where a cheap converter exists: if moving between options stays cheap, positive feedback never accumulates into irreversibility.',
    ),
    provenance: P([232, 75, 143, 321, 1014]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/cohort-inertia',
    title: bi('世代惯性', 'Cohort inertia'),
    statement: bi(
      '输入条件改变之后，系统仍按旧结构运行数十年，因为存量由一批批寿命很长的单位构成——政策在今天生效，结果在一代人之后。',
      'After the inputs change the system keeps running on its old structure for decades, because the stock is made of long-lived cohorts — a policy takes effect today and the result arrives a generation later.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('单位寿命', 'unit lifetime', '一批存量被替换掉所需的时间', 'how long it takes for a cohort to be replaced'),
      q('存量结构', 'the age structure of the stock', '决定惯性有多长的分布', 'the distribution that sets how long the inertia lasts'),
      q('替换速率', 'replacement rate', '新条件渗入存量的速度', 'how fast the new condition seeps into the stock'),
    ],
    failsWhen: bi(
      '单位寿命远短于观察窗时惯性消失：存量周转得比你观察的时间还快，改变输入就几乎立刻改变输出。',
      'The inertia disappears when unit lifetime is far shorter than the observation window: the stock turns over faster than you watch, and changing the input changes the output almost at once.',
    ),
    provenance: P([247, 1516, 140, 455, 633]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/hourglass-waist',
    title: bi('沙漏窄腰的形成', 'The hourglass waist'),
    statement: bi(
      '一个分层系统的中间层会自发收窄成单一的公共协议，于是上下两侧各自繁荣、互不牵制——多样性被挤到窄腰的两端。',
      'The middle of a layered system narrows on its own into a single shared protocol, letting both sides above and below diversify without constraining each other — variety is pushed to the ends of the waist.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'regularity',
    quantities: [
      q('窄腰层', 'the waist layer', '收敛成单一约定的那一层', 'the layer that converges on one convention'),
      q('上下两侧的多样度', 'variety above and below', '窄腰换来的东西', 'what the narrowing buys'),
      q('窄腰的所有权', 'who owns the waist', '决定它是公共品还是扼制点', 'what decides whether it is a commons or a chokepoint'),
    ],
    failsWhen: bi(
      '窄腰本身被私有化时结构反转：同一个位置从让两侧自由的公共协议，变成能对两侧同时收租的扼制点。',
      'The structure inverts once the waist is privatised: the same position turns from a shared protocol that frees both sides into a chokepoint that can charge both.',
    ),
    provenance: P([425, 54, 426, 1209, 1379]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/lexicalisation',
    title: bi('词汇化', 'Lexicalisation'),
    statement: bi(
      '高频共现的组合被压缩成一个不可再分的单元，调用变便宜，但内部结构随之不可见——效率是用可检查性换来的。',
      'A combination that recurs often is compressed into one indivisible unit: calling it gets cheap and its internals stop being visible — efficiency bought with inspectability.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'regularity',
    quantities: [
      q('共现频率', 'co-occurrence frequency', '触发压缩的那个量', 'the quantity that triggers compression'),
      q('调用成本', 'cost to invoke', '压缩后下降的那个量', 'what falls once compressed'),
      q('内部可见性', 'internal visibility', '压缩后被牺牲掉的那个量', 'what is given up in exchange'),
    ],
    failsWhen: bi(
      '组合频率不足时压缩不发生；而压缩一旦发生，内部结构就不再被检查，于是错误可以在单元内部长期存活。',
      'Below a frequency threshold no compression occurs; and once it does, the internals stop being checked, so an error can live inside the unit indefinitely.',
    ),
    provenance: P([1453, 986, 1767, 1001, 885]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/grammaticalisation',
    title: bi('语法化', 'Grammaticalisation'),
    statement: bi(
      '有实义的单元被反复使用后逐步磨损为纯功能标记，而且这个过程是单向的——磨掉的意义不会自己长回来。',
      'A unit with its own meaning wears down through repeated use into a purely functional marker, and the process runs one way — worn-off meaning does not grow back.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'regularity',
    quantities: [
      q('使用频率', 'frequency of use', '驱动磨损的那个量', 'what drives the wear'),
      q('剩余实义', 'meaning remaining', '被逐步磨掉的那个量', 'the quantity being worn away'),
      q('单向性', 'the one-wayness', '这条结构与一般"演变"的区别所在', 'what separates this from change in general'),
    ],
    failsWhen: bi(
      '存在强规范约束时过程可被冻结：一个被明文固定、有人执行的用法可以停在半路，于是磨损停下但不逆转。',
      'A strong prescriptive constraint freezes it: a usage fixed in writing and enforced can stop halfway, so the wear halts without reversing.',
    ),
    provenance: P([312, 1655, 1735, 949, 261]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/information-asymmetry',
    title: bi('信息不对称的两副面孔', 'The two faces of information asymmetry'),
    statement: bi(
      '交易前隐藏类型会把优质方逼出市场（逆向选择），交易后隐藏行动会让行为变形（道德风险）——同一份不对称，在签约前后长成两种不同的病。',
      'Hidden type before the deal drives good counterparties out (adverse selection); hidden action after it deforms behaviour (moral hazard) — one asymmetry growing into two different diseases either side of the signature.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('被隐藏的是类型还是行动', 'whether type or action is hidden', '决定它长成哪一副面孔', 'which of the two faces it becomes'),
      q('信号成本', 'cost of signalling', '优质方证明自己要付的代价', 'what a good counterparty pays to prove it'),
      q('可监控度', 'monitorability', '签约后行为能被看到多少', 'how much of the post-deal behaviour can be seen'),
    ],
    failsWhen: bi(
      '存在可信的质量信号或行为可被监控时消解——但这两个解法各治一副面孔，用错了那一个不起作用。',
      'A credible quality signal or observable behaviour dissolves it, but each remedy treats one face only, and applying the wrong one does nothing.',
    ),
    provenance: P([288, 316, 735, 1684, 270]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/slow-variable-creep',
    title: bi('缓慢变量的暗中逼近', 'The slow variable creeping up'),
    statement: bi(
      '快变量看起来一切正常，而一个没人盯着的慢变量正在逼近阈值——系统在崩溃前的表现，恰恰是「一切正常」。',
      'The fast variables all look fine while a slow one nobody watches approaches its threshold — what a system looks like before it breaks is precisely normal.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('慢变量', 'the slow variable', '逼近阈值却不在仪表盘上的那个量', 'the quantity approaching a threshold and absent from the dashboard'),
      q('快变量', 'the fast variables', '被监控、且确实正常的那些', 'the ones being watched, and genuinely fine'),
      q('阈值距离', 'distance to the threshold', '唯一有预警价值的量', 'the only quantity with warning value'),
    ],
    failsWhen: bi(
      '慢变量可观测且被纳入监控时可预警——所以这条结构的实际含义是关于仪表盘的：危险不在于变量慢，而在于没人测它。',
      'It is forecastable once the slow variable is observable and watched, so the structure is really about instrumentation: the danger is not that the variable is slow but that nobody measures it.',
    ),
    provenance: P([1455, 306, 734, 730, 310]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/precedent-accumulation',
    title: bi('先例累积', 'Accumulating precedent'),
    statement: bi(
      '每一次决定都约束后续决定，而且约束被显式引用——于是决策空间随时间单调收窄，历史通过引用链获得强制力。',
      'Each decision constrains the next and the constraint is cited explicitly, so the decision space narrows monotonically over time and history acquires force through a chain of citations.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'regularity',
    quantities: [
      q('引用链', 'the citation chain', '把过去的决定接到现在的那条路径', 'the path connecting a past decision to the present one'),
      q('剩余决策空间', 'the remaining decision space', '被单调压缩的那个量', 'the quantity compressed monotonically'),
      q('推翻成本', 'cost of overturning', '决定这条结构是否可逆', 'what decides whether the structure is reversible'),
    ],
    failsWhen: bi(
      '允许推翻先例的机制存在时可解——但推翻机制本身也会成为先例，所以真正的问题是它被使用得多频繁。',
      'A mechanism for overturning precedent resolves it, but that mechanism becomes precedent too, so the real question is how often it is used.',
    ),
    provenance: P([1631, 584, 683, 1036, 1759]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/frozen-accident',
    title: bi('冻结的偶然', 'The frozen accident'),
    statement: bi(
      '一个早期的随机选择被后续的一切依赖住，此后既不可更改也不是最优；而失去功能的部分只要不碍事，也会被一并保留。',
      'An early arbitrary choice becomes load-bearing for everything after it, and is thereafter neither changeable nor optimal; parts that lost their function are kept too, as long as they are not in the way.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('依赖它的部件数', 'how much depends on it', '决定切换成本的那个量', 'what sets the cost of switching'),
      q('切换成本 vs 改进收益', 'switching cost against the gain', '这个比值决定它是否被冻结', 'the ratio deciding whether it stays frozen'),
      q('删除压力', 'pressure to delete', '决定失去功能的残留是否被清除', 'what decides whether a defunct remnant gets cleared'),
    ],
    failsWhen: bi(
      '切换成本低于收益时可解锁；存在删除压力时残留会被清除——所以看到一个无用又难改的东西，说明这两个条件都不满足。',
      'It unfreezes where switching costs less than it gains, and remnants clear where something presses to delete them — so a useless yet immovable feature says neither condition holds.',
    ),
    provenance: P([10, 1513, 326, 1495, 577]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/fatigue-accumulation',
    title: bi('疲劳累积损伤', 'Fatigue'),
    statement: bi(
      '远低于破坏强度的反复载荷会累积成失效——单次都安全，总和不安全，因此按最大载荷做的安全判断从一开始就问错了问题。',
      'Repeated loads well below the breaking strength accumulate into failure — each is safe, the sum is not, so a safety judgement made on peak load asked the wrong question from the start.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('单次载荷', 'load per cycle', '每次都在安全线以下的那个量', 'the quantity that stays under the line every time'),
      q('循环次数', 'number of cycles', '把安全变成不安全的那个乘数', 'the multiplier turning safe into unsafe'),
      q('修复速率', 'repair rate', '与累积赛跑的量；它决定损伤是否真的在累积', 'what races the accumulation and decides whether damage actually builds'),
    ],
    failsWhen: bi(
      '存在完全修复机制时损伤不累积：能在下一次载荷到来前修好的系统不会疲劳，所以骨骼与金属在这条结构上不是同一种东西。',
      'Damage does not accumulate where repair is complete: a system that heals before the next load never fatigues, which is why bone and metal are not the same case under this structure.',
    ),
    provenance: P([115, 1411, 1663, 264, 1264]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/red-queen',
    title: bi('红皇后', 'The Red Queen'),
    statement: bi(
      '当对手也在改进时，持续投入只能维持原有的相对位置——绝对能力在提升，相对位置纹丝不动，停止投入则立刻后退。',
      'When the opponent improves too, continuous investment only holds the same relative position — absolute capability rises, relative standing does not move, and stopping means falling back at once.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('自身改进速率', 'own rate of improvement', '被投入买来的那个量', 'what the investment buys'),
      q('对手改进速率', 'the opponent\'s rate', '把前者抵消掉的那个量', 'what cancels it'),
      q('相对位置', 'relative position', '真正被争夺、而且几乎不动的那个量', 'what is actually contested, and barely moves'),
    ],
    failsWhen: bi(
      '对手退出、或一方取得绝对优势时停止；在拟态一类的场景里还有第二个出口——当辨别成本超过被骗的成本，接收者干脆不再辨别。',
      'It stops when the opponent exits or one side gains an absolute edge; in mimicry-like settings there is a second exit — once discrimination costs more than being fooled, the receiver stops discriminating.',
    ),
    provenance: P([566, 1677, 1022, 659, 1440]),
    mappings: [],
  },
];
