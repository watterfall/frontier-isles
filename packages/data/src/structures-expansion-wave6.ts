import type { SeedStructure, StructureQuantity } from './structures';

/**
 * Wave 6 — the 「界限」 band of the topic set: 12 structures that each say what
 * cannot be done, and under what condition the impossibility lifts.
 *
 * Same terms as waves 4 and 5: zero mappings, `proposed`, no edge claimed.
 *
 * A limit is a particular kind of structure and the `failsWhen` field carries
 * more weight here than anywhere else in the catalogue. Every entry below is
 * routinely quoted as though it forbade something absolutely, and every one of
 * them has a stated escape: the bound holds over a class of inputs, or a
 * regime, or a set of requirements, and naming that class IS the structure.
 * A mapping that attaches one of these to an island without checking the class
 * has not transferred the limit, it has borrowed its authority.
 */

type Bilingual = { zh: string; en: string };

const bi = (zh: string, en: string): Bilingual => ({ zh, en });

const q = (
  nameZh: string,
  nameEn: string,
  roleZh: string,
  roleEn: string,
): StructureQuantity => ({ name: bi(nameZh, nameEn), role: bi(roleZh, roleEn) });

const WAVE_6_PROVENANCE = (recordIds: number[]) => ({
  source: 'xfrontier.science',
  url: 'https://xfrontier.science/',
  recordIds,
  reviewedAt: '2026-08-22',
});

export const WAVE_6_STRUCTURES: SeedStructure[] = [
  {
    id: 'struct://xfrontier/dissipation-floor',
    title: bi('耗散下界', 'The dissipation floor'),
    statement: bi(
      '任何不可逆过程都要向环境交出一份熵，代价的下界由过程的不可逆程度本身决定，与实现它的机械、生化还是经济机构无关。',
      'Every irreversible process hands entropy to its environment, and the floor on that cost is set by how irreversible the process is — not by whether it is realised in machinery, biochemistry or an economy.',
    ),
    status: 'proposed',
    theme: 'living-computation',
    kind: 'regularity',
    quantities: [
      q('熵产生率', 'entropy production rate', '不可逆性的直接度量', 'the direct measure of irreversibility'),
      q('可逆功', 'reversible work', '无限慢完成同一变化所需的功；差额就是耗散', 'the work the same change would take infinitely slowly, the difference being the dissipation'),
      q('不可逆度', 'degree of irreversibility', '决定下界高低的那个量', 'what sets how high the floor sits'),
    ],
    failsWhen: bi(
      '准静态可逆极限下下界趋近于零，所以这条结构约束的是「以有限速率完成」的过程；把它读成「任何变化都要付费」是把极限点排除在外。',
      'In the quasi-static reversible limit the floor goes to zero, so the structure constrains processes completed at a finite rate; reading it as "all change costs" writes the limiting case out of its own statement.',
    ),
    provenance: WAVE_6_PROVENANCE([1710, 1093, 319, 145, 656]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/impossibility-theorem',
    title: bi('不可能性定理', 'Impossibility theorems'),
    statement: bi(
      '若干条单独看都合理的要求，被证明无法同时满足——冲突不在实现里，在要求集合本身，所以再聪明的设计也绕不过去。',
      'A handful of requirements, each reasonable on its own, are proved to be jointly unsatisfiable — the conflict lives in the set of requirements rather than in any implementation, so no amount of cleverness routes around it.',
    ),
    status: 'proposed',
    theme: 'unknown-mapping',
    kind: 'regularity',
    quantities: [
      q('要求集合', 'the requirement set', '定理的真正对象；换一个集合就是另一条定理', 'what the theorem is actually about; a different set is a different theorem'),
      q('冲突的最小子集', 'the minimal conflicting subset', '哪几条互不相容——这决定了该放弃什么', 'which of them cannot coexist, and therefore what has to be given up'),
      q('放宽后的可行域', 'what becomes feasible once relaxed', '每放宽一条要求换回来的空间', 'the space bought back by relaxing each requirement'),
    ],
    failsWhen: bi(
      '放宽任一条要求即可行，所以引用这类定理时真正有信息量的是「你打算放弃哪一条」，而不是「所以做不到」。',
      'Relaxing any one requirement restores feasibility, so the informative part of citing such a theorem is which requirement you intend to drop — never the bare conclusion that it cannot be done.',
    ),
    provenance: WAVE_6_PROVENANCE([677, 1172, 1218, 562, 368]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/no-free-lunch',
    title: bi('无免费午餐', 'No free lunch'),
    statement: bi(
      '在所有可能问题上平均，任何算法的表现都一样——一个方法之所以好用，全部来自它对问题结构的假设，而不是来自它本身。',
      'Averaged over all possible problems every algorithm performs alike — whatever makes a method good comes entirely from the assumptions it makes about problem structure, never from the method itself.',
    ),
    status: 'proposed',
    theme: 'unknown-mapping',
    kind: 'regularity',
    quantities: [
      q('问题分布', 'the problem distribution', '「所有可能问题」这个前提；它几乎从不是现实中的分布', 'the "all possible problems" premise, which is almost never the distribution actually faced'),
      q('归纳偏置', 'inductive bias', '方法对结构的假设；它是全部性能的来源', 'the method\'s assumption about structure, and the whole source of its performance'),
      q('偏置与问题的匹配度', 'match between bias and problem', '真正该被报告、却最少被报告的量', 'the quantity that should be reported and almost never is'),
    ],
    failsWhen: bi(
      '已知问题结构的先验时不成立——而现实中总有先验，所以这条定理几乎从不用来否定某个方法，它用来逼问「你的偏置是什么」。',
      'It does not hold once a prior over problem structure is known, and in practice there always is one, so the theorem is almost never a refutation of a method — it is a demand that the method state its bias.',
    ),
    provenance: WAVE_6_PROVENANCE([879, 625, 230, 243, 880]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/causal-propagation-limit',
    title: bi('因果传播上限', 'The limit on how fast influence travels'),
    statement: bi(
      '影响的传播有速度上限，因此在时空中相隔足够远的两个事件之间不可能有直接因果——上限把「可能相关」的集合切成了可判定的两半。',
      'Influence travels no faster than a bound, so two events far enough apart cannot be directly causally linked — the bound cuts the set of possible relations into two decidable halves.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'regularity',
    quantities: [
      q('传播速度上限', 'the propagation bound', '光速、消息延迟、接触率——同一个角色的不同实现', 'light speed, message latency, contact rate — the same role in different realisations'),
      q('时空间隔', 'the separation', '两个事件之间的距离与时间差', 'the distance and the time between two events'),
      q('可及集', 'the reachable set', '在给定时间内可能被影响到的范围', 'what could have been affected within the time available'),
    ],
    failsWhen: bi(
      '存在共同过去时相关不需因果：两个事件可以在上限之外仍高度相关，因为它们都被更早的第三件事影响过。',
      'A shared past removes the need for causation: two events outside each other\'s reach can still correlate strongly because something earlier touched both.',
    ),
    provenance: WAVE_6_PROVENANCE([1588, 315, 930, 1481, 1243]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/scale-separation-failure',
    title: bi('尺度分离的失效', 'When scales refuse to separate'),
    statement: bi(
      '把一个系统约化成有效描述，前提是快慢尺度分得开；一旦它们纠缠在一起，粗粒化就不再是近似，而是把主导机制丢掉。',
      'Reducing a system to an effective description assumes fast and slow scales come apart; once they entangle, coarse-graining stops being an approximation and starts discarding the mechanism that dominates.',
    ),
    status: 'proposed',
    theme: 'simulation-twins',
    kind: 'regularity',
    quantities: [
      q('尺度比', 'the scale ratio', '快慢过程的时标之比；它趋近 1 时约化失效', 'the ratio of fast to slow timescales, with reduction failing as it approaches one'),
      q('有效描述的自由度', 'degrees of freedom retained', '粗粒化后剩下的变量', 'what survives the coarse-graining'),
      q('被丢弃项的反馈强度', 'feedback from what was dropped', '判断约化是否成立的关键量', 'the quantity that decides whether the reduction holds'),
    ],
    failsWhen: bi(
      '尺度分离良好时可以安全粗粒化——所以这条结构说的是它自己的适用边界：它只在分离失效处才有内容，在别处引用它是空话。',
      'Where the scales do separate, coarse-graining is safe — so the structure is a statement about its own boundary, with content only where separation fails and none anywhere else.',
    ),
    provenance: WAVE_6_PROVENANCE([996, 565, 899, 136, 904]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/minimum-viable-size',
    title: bi('最小可行规模', 'Minimum viable size'),
    statement: bi(
      '低于某个规模，功能不是按比例减弱而是整体不成立——因为功能依赖若干必须同时在场的部件，缺一个就全盘失效。',
      'Below a certain size the function does not weaken proportionally, it stops: the function depends on parts that must all be present at once, and missing one takes the whole thing down.',
    ),
    status: 'proposed',
    theme: 'living-computation',
    kind: 'regularity',
    quantities: [
      q('必需部件集', 'the set of required parts', '不可再分的那一组；它决定下限在哪', 'the irreducible group, which is what sets the floor'),
      q('规模', 'size', '被拿来与下限比较的量', 'the quantity compared against the floor'),
      q('功能存活率', 'whether the function survives', '在下限附近它是阶跃的，不是连续的', 'which near the floor is a step rather than a slope'),
    ],
    failsWhen: bi(
      '可外包缺失功能时下限被打破：一个低于最小规模的单位，只要能从外部买到缺的那一件，就照样运转——所以观察到的下限总是"在这个环境里"的下限。',
      'Outsourcing breaks the floor: a unit below minimum size runs fine if it can buy the missing part from outside, so any observed floor is a floor relative to its environment.',
    ),
    provenance: WAVE_6_PROVENANCE([1, 1147, 1693, 1661, 44]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/explore-exploit-tension',
    title: bi('探索-利用的不可兼得', 'The explore-exploit tension'),
    statement: bi(
      '同一份有限资源不能同时用来试新和吃老本，因此任何持续运转的系统都必须显式或隐式地做这个分配——不做选择本身也是一种选择。',
      'One finite resource cannot both try new things and exploit what works, so any system that keeps running must make the split explicitly or implicitly — and not choosing is itself a choice.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'regularity',
    quantities: [
      q('探索份额', 'the exploration share', '被分配给试新的那部分资源', 'the share of resource spent on the untried'),
      q('回报不确定性', 'uncertainty about payoff', '决定探索值不值的量', 'what decides whether exploration pays'),
      q('时间视野', 'the horizon', '视野越短，最优探索份额越低', 'the shorter it is, the lower the optimal exploration share'),
    ],
    failsWhen: bi(
      '回报非平稳时最优策略的结构改变：环境本身在变，"已知最好"会过期，于是不探索的代价不再是机会成本而是持续失效。',
      'Non-stationary payoffs change the structure of the optimum: when the environment itself moves, the best known option expires, and not exploring stops being an opportunity cost and becomes ongoing failure.',
    ),
    provenance: WAVE_6_PROVENANCE([620, 1685, 1502, 1767, 151]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/two-error-tradeoff',
    title: bi('两类错误的结构性对立', 'The structural opposition of the two errors'),
    statement: bi(
      '调一个阈值只能在漏报与误报之间移动，不能同时降低两者；要整体前进必须换来新的独立信息，而不是换一个判定规则。',
      'Moving a threshold trades misses against false alarms and lowers neither; getting both down at once requires new independent information, not a new decision rule.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'regularity',
    quantities: [
      q('判定阈值', 'the threshold', '沿曲线移动的那个旋钮', 'the knob that moves along the curve'),
      q('两类错误率', 'the two error rates', '被绑在一起的那对量', 'the pair bound together'),
      q('可分性', 'separability', '曲线本身的位置；只有它改变才是真进步', 'where the curve itself sits, and the only thing whose improvement is real progress'),
    ],
    failsWhen: bi(
      '有额外独立信息时整条前沿可以外推——所以"我们降低了误报"这句话，必须同时说漏报怎么样了，否则它可能只是把阈值挪了一格。',
      'Extra independent information shifts the whole frontier, which is why "we reduced false alarms" means nothing without saying what happened to misses: it may only be the threshold moving one notch.',
    ),
    provenance: WAVE_6_PROVENANCE([1696, 722, 1073, 57, 665]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/commensuration-cost',
    title: bi('通约性的代价', 'What it costs to make things comparable'),
    statement: bi(
      '跨系统比较必须先建立共同单位，而选择哪个单位、由谁选，本身就在分配可见性与权力——通约不是中立的技术前置步骤。',
      'Comparing across systems requires a shared unit first, and choosing which unit, and who chooses, already allocates visibility and power — commensuration is not a neutral technical preliminary.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'regularity',
    quantities: [
      q('共同单位', 'the shared unit', '被建立起来的那把尺', 'the ruler being erected'),
      q('被压平的维度', 'the dimensions flattened', '为了可比而丢掉的差异；代价在这里', 'the differences discarded to make things comparable, where the cost lives'),
      q('单位的制定者', 'who sets the unit', '决定谁的差异被保留、谁的被压平', 'who decides whose differences survive and whose are flattened'),
    ],
    failsWhen: bi(
      '只需序关系而非基数比较时可以回避：能排序就够用的场景不必建单位，硬建反而引入了不必要的压平。',
      'It can be avoided where an ordering suffices and no cardinal comparison is needed: forcing a unit there only imports a flattening nobody required.',
    ),
    provenance: WAVE_6_PROVENANCE([1512, 1172, 1767, 1044, 1783]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/data-movement-dominates',
    title: bi('数据搬运主导', 'Moving the bit costs more than using it'),
    statement: bi(
      '移动一个单位的信息或物料，代价往往远高于对它做一次操作；于是系统的形态被搬运而不是被处理决定。',
      'Moving one unit of information or material usually costs far more than doing one operation on it, so the shape of a system is decided by transport rather than by processing.',
    ),
    status: 'proposed',
    theme: 'living-computation',
    kind: 'regularity',
    quantities: [
      q('单次搬运代价', 'cost to move once', '把一个单位挪一段距离的代价', 'what it takes to move one unit one hop'),
      q('单次操作代价', 'cost to operate once', '对同一个单位做一次处理的代价', 'what it takes to act on that unit once'),
      q('计算强度', 'operational intensity', '每搬运一次做多少次操作；这个比值决定谁主导', 'operations per move, the ratio that decides which side dominates'),
    ],
    failsWhen: bi(
      '计算强度极高的负载下反转：每搬一次就算上千次时，瓶颈回到处理端，按搬运优化反而是浪费。',
      'It inverts at high operational intensity: when one move feeds a thousand operations the bottleneck returns to processing, and optimising for transport wastes effort.',
    ),
    provenance: WAVE_6_PROVENANCE([99, 321, 77, 57, 591]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/surface-volume-crossover',
    title: bi('表面-体积转折', 'The surface-to-volume crossover'),
    statement: bi(
      '面积随长度平方增长、体积随立方增长，所以随着规模变大，表面项相对衰减，主导机制会在某个尺寸上翻转。',
      'Area grows as length squared and volume as the cube, so as size increases the surface term fades relative to the bulk and the dominant mechanism flips at some size.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('面积项', 'the surface term', '与交换、散热、接触有关的那一半', 'the half to do with exchange, cooling and contact'),
      q('体积项', 'the volume term', '与产热、储存、内容有关的那一半', 'the half to do with generation, storage and contents'),
      q('转折尺寸', 'the crossover size', '两项相等的那个尺度', 'the scale at which the two are equal'),
    ],
    failsWhen: bi(
      '形状随规模改变时简单标度失效：褶皱、分支、多孔结构都是为了推迟这个转折，而它们一旦出现，平方立方律就不再直接适用。',
      'Simple scaling fails when shape changes with size: folds, branching and porosity all exist to postpone the crossover, and once present the square-cube law no longer applies directly.',
    ),
    provenance: WAVE_6_PROVENANCE([272, 1657, 268, 91, 443]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/limiting-factor',
    title: bi('瓶颈与最短板', 'The limiting factor'),
    statement: bi(
      '产出由最稀缺的那一个因子决定，补充其余因子不产生任何改善——所以找到瓶颈之前，投入与产出之间没有关系。',
      'Output is set by whichever factor is scarcest, and adding any of the others changes nothing — so until the bottleneck is found there is no relationship between input and output at all.',
    ),
    status: 'proposed',
    theme: 'collective-dynamics',
    kind: 'regularity',
    quantities: [
      q('各因子的供给', 'supply of each factor', '被比较的那一组量', 'the set being compared'),
      q('最稀缺因子', 'the scarcest one', '唯一决定产出的那个', 'the only one that sets output'),
      q('瓶颈的移动', 'where the bottleneck moves next', '补上当前瓶颈后，下一个约束在哪', 'which constraint binds once the current one is relieved'),
    ],
    failsWhen: bi(
      '因子之间可替代时最小律失效，模型转为加和或乘积形式——所以套用之前必须先确认这些因子真的不可互相顶替。',
      'Substitutability breaks the law of the minimum and the model becomes additive or multiplicative instead, so applying it requires first establishing that the factors genuinely cannot stand in for one another.',
    ),
    provenance: WAVE_6_PROVENANCE([583, 1717, 9, 1394, 1842]),
    mappings: [],
  },
];
