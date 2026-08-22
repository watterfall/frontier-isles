import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureQuantity, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the collective-behaviour family — local
 * rules producing something nobody wrote down.
 *
 * Chosen third for two reasons. It is the band a single agent-based kernel
 * would make executable, so writing its teaching content first means that
 * kernel arrives with substrates and boundaries already authored rather than
 * needing them invented afterwards. And its relations reach furthest outside
 * itself: of seventeen, most point at structures in other families, including
 * three more identities.
 *
 * The Hopfield energy IS the Ising Hamiltonian with the couplings learned by
 * Hebb rather than fixed by a lattice. The replicator equation IS natural
 * gradient ascent on mean fitness under the Fisher-Rao metric, which is the
 * geometric reading of Fisher's fundamental theorem — so an equation from
 * population genetics and a metric from statistical inference are one object.
 * Phase separation IS the Ising model with a conserved order parameter. And the
 * tragedy of the commons IS a Nash equilibrium that happens to be Pareto
 * inferior, which is why it is not a failure of rationality.
 *
 * One relation is worth reading for its direction. Replicator dynamics is filed
 * as a special case OF niche construction, not the reverse: the replicator
 * equation assumes fitness is fixed, and niche construction is what happens
 * when the population rewrites the fitness it is being selected on. The simpler
 * structure is the one with a feedback loop cut.
 *
 * Same terms as the first two batches: textbook knowledge, no island referenced,
 * no mapping or coverage touched. Three of the eight predate wave 4 and get
 * their declared quantities here, which settles nothing about their existing
 * mappings' renderings.
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

export const COLLECTIVE_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/replicator-dynamics',
    quantities: [
      q('类型频率 x_i', 'type frequency x_i', '各个类型在群体里占的比例，总和为一', 'what share of the population each type holds, summing to one'),
      q('相对表现 f_i − ⟨f⟩', 'relative performance f_i − ⟨f⟩', '高于平均就增长、低于就萎缩；决定方向的是差值而不是绝对值', 'above average grows and below shrinks, with the difference rather than the level setting the direction'),
      q('平均表现 ⟨f⟩', 'mean performance ⟨f⟩', '群体自己给出的基准线，它随组成变化而移动', 'the benchmark the population sets for itself, which moves as the composition does'),
    ],
    depth: {
      origin: bi(
        '1978 年由 Taylor 与 Jonker 为演化博弈论写下，但同一个方程在 1930 年代的群体遗传学（Fisher 基本定理）与 1950 年代的强化学习里已各自出现过。',
        'Written down by Taylor and Jonker for evolutionary game theory in 1978, though the same equation had already appeared separately in 1930s population genetics as Fisher\'s fundamental theorem and in 1950s reinforcement learning.',
      ),
      minimalForm: 'ẋ_i = x_i (f_i − ⟨f⟩)',
      canonicalSubstrates: [
        sub('自然选择', 'Natural selection', '演化生物学', 'Evolutionary biology', 0,
          '等位基因频率按相对适合度重新分配，这就是方程的原生读法',
          'allele frequencies redistributed by relative fitness, which is the equation\'s native reading',
          '真实群体有限、有突变、有漂变，而方程假设无限群体且不产生新类型；小群体里随机性可以完全压过适合度差异。',
          'Real populations are finite, mutate and drift, while the equation assumes an infinite population that generates no new types; in a small one randomness can swamp the fitness difference entirely.'),
        sub('市场份额', 'Market share', '经济学', 'Economics', 1,
          '回报高于行业平均的策略扩张，低于的收缩',
          'strategies returning above the industry average expand and those below contract',
          '企业会主动模仿而不只是被选择，模仿是横向传递而复制是纵向的——这一项在方程里没有对应物。',
          'Firms imitate deliberately rather than only being selected, and imitation is horizontal transfer where replication is vertical, with no term in the equation for it.'),
        sub('强化学习的策略更新', 'Policy update in reinforcement learning', '机器学习', 'Machine learning', 1,
          '回报高于基线的动作被加权，低于的被削弱——这正是策略梯度的形状',
          'actions returning above the baseline get up-weighted and those below down-weighted, which is the shape of a policy gradient',
          '这里的"群体"是一个智能体内部的策略分布，更新由梯度而非繁殖驱动；把它读成字面的群体演化会引入不存在的世代结构。',
          'The population here is a distribution inside one agent and the update comes from a gradient rather than reproduction, so reading it as literal population turnover imports a generational structure that is not there.'),
        sub('免疫抗体优选', 'Antibody affinity maturation', '免疫学', 'Immunology', 2,
          '生发中心里 B 细胞按与抗原的结合力被选择，平均结合力自己在往上移',
          'B cells in a germinal centre selected by binding affinity, with the mean affinity itself moving up',
          '这里存在定向的超突变而非中性变异，新类型的产生率本身受调控——方程的"无新类型"假设在这个基底上被明确违反。',
          'Targeted hypermutation rather than neutral variation means the rate at which new types appear is itself regulated, explicitly violating the equation\'s assumption that none are produced.'),
      ],
      relations: [
        rel('nash-equilibrium', 'explains',
          '复制者方程的每一个纳什均衡都是静止点，反之不成立——这条不对称正是内容所在：博弈论告诉你可能停在哪，动力学告诉你会不会真的到得了。',
          'Every Nash equilibrium is a rest point of the replicator equation and not conversely, and that asymmetry is the content: game theory says where it could stop and the dynamics say whether it can actually get there.'),
        rel('information-geometry', 'emerges-from',
          '复制者方程正是在费雪—饶度规下对平均适合度做自然梯度上升；Fisher 基本定理里那句"适合度增长率等于遗传方差"，几何上就是这一句话——一个群体遗传学方程与一个统计推断度规是同一个对象。',
          'The replicator equation is natural gradient ascent on mean fitness under the Fisher-Rao metric, and Fisher\'s fundamental theorem — that the rate of fitness increase equals the genetic variance — is that statement in geometric form: one equation from population genetics and one metric from statistical inference are the same object.'),
        rel('niche-construction', 'special-case-of',
          '复制者方程假设 f_i 固定；生态位构建说的正是 f_i 会被群体自己的历史改写，所以复制者是把那条反馈回路剪断之后的特例，而不是更基本的那个。',
          'The replicator equation assumes f_i is fixed while niche construction is precisely the case where the population rewrites the fitness acting on it, which makes the replicator the special case with that feedback cut rather than the more fundamental one.'),
      ],
      mistakenFor: bi(
        '常被误当成"适者生存"的数学版。它并不说明谁会赢：方程只描述在给定表现下频率怎么走，而表现本身从哪来、会不会因为频率改变而改变，都在方程之外——后一条恰恰是它最常被违反的假设。',
        'Often mistaken for a mathematical form of survival of the fittest. It says nothing about who wins: it describes how frequencies move given performance, while where performance comes from and whether it changes as frequencies do both sit outside the equation — and the second is the assumption most often violated.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/nash-equilibrium',
    quantities: [
      q('策略组合', 'the strategy profile', '每个参与者各选一个策略后形成的那一组', 'the set formed once every player has chosen'),
      q('单方面改善', 'unilateral improvement', '一个人在别人不动时能不能变好；不能，就是均衡', 'whether one player can do better while the others stand still — if not, it is an equilibrium'),
      q('均衡选择', 'equilibrium selection', '存在多个均衡时落到哪一个，这一步定义本身不回答', 'which of several equilibria is reached, a question the definition itself does not answer'),
    ],
    depth: {
      origin: bi(
        '1950 年由 John Nash 证明有限博弈中混合策略均衡必然存在；这个存在性证明用的是不动点定理，也因此这条结构从一开始就是关于不动点而不是关于人的。',
        'John Nash proved in 1950 that a mixed-strategy equilibrium always exists in a finite game, and the proof runs on a fixed-point theorem, which is why the structure has been about fixed points rather than about people from the start.',
      ),
      minimalForm: '∀i: uᵢ(sᵢ*, s₋ᵢ*) ≥ uᵢ(sᵢ, s₋ᵢ*)',
      canonicalSubstrates: [
        sub('囚徒困境', 'The prisoner\'s dilemma', '博弈论', 'Game theory', 1,
          '双方都背叛是唯一均衡，尽管双方合作对两人都更好',
          'mutual defection being the only equilibrium even though mutual cooperation is better for both',
          '这个结局不是非理性的产物，恰恰是理性的：把它当作"人不够聪明"来解决，会去改教育而不是改收益结构。',
          'The outcome is not a failure of rationality but its product, and treating it as people not being clever enough sends effort into education rather than into the payoff structure.'),
        sub('交通均衡', 'Traffic equilibrium', '交通工程', 'Transport engineering', 0,
          '每个司机选自认最快的路，结果是没人能靠单独换路变快的那个分配',
          'every driver taking what looks like the fastest route, arriving at an allocation where nobody gains by switching alone',
          '布雷斯悖论说明加一条路可能让所有人变慢——所以这里的均衡不保证效率，用它做规划目标会得到错的结论。',
          'Braess\'s paradox shows adding a road can slow everyone down, so equilibrium here does not imply efficiency and using it as a planning objective gives the wrong answer.'),
        sub('演化稳定策略', 'Evolutionarily stable strategies', '演化生物学', 'Evolutionary biology', 2,
          '一个不能被少量突变体入侵的策略组合，是纳什均衡的一个加强版',
          'a profile no small group of mutants can invade, which is a strengthened Nash equilibrium',
          '演化稳定不要求参与者会算，只要求选择能起作用——所以它比纳什均衡少了理性假设，多了动力学假设。',
          'Evolutionary stability requires no calculation by the players, only that selection operates, so it drops the rationality assumption and adds a dynamical one.'),
      ],
      relations: [
        rel('commons-congestion', 'explains',
          '公地悲剧不是理性的失败而是它的产物：每个人独享收益、共担损耗时，过度使用恰好是那个没人能单方面改善的组合，所以解法必须动收益结构而不是劝人克制。',
          'The tragedy of the commons is not a failure of rationality but its product: when each takes the benefit and shares the cost, overuse is exactly the profile nobody can improve on alone, so the remedy has to change the payoffs rather than urge restraint.'),
        rel('information-asymmetry', 'explains',
          '逆向选择的市场崩溃是一个均衡而不是一次故障：在优质方无法可信地证明自己时，"只出低价"对买方是最优的，于是优质方退出这件事没有人能单方面阻止。',
          'The market collapse of adverse selection is an equilibrium rather than a breakdown: when quality cannot be credibly proved, bidding only for the low end is optimal for the buyer, and no one can unilaterally stop the good side from leaving.'),
      ],
      mistakenFor: bi(
        '常被误当成"最优结果"。它只保证没有人能单方面变好，完全不保证整体好——囚徒困境与交通均衡都是纳什均衡且都劣于可达的其它组合。另一个常见误读是把存在性当作可达性：定义不说人怎么走到那里。',
        'Often mistaken for an optimal outcome. It guarantees only that no one can improve alone and says nothing about the whole — both the prisoner\'s dilemma and traffic equilibrium are Nash and both are worse than reachable alternatives. The other common misreading takes existence for reachability: the definition says nothing about how anyone gets there.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/attractor-networks-hopfield',
    quantities: [
      q('状态单元 s_i', 'state unit s_i', '取两值的单元，整个网络的状态就是它们的组合', 'a two-valued unit, with the whole network state being their combination'),
      q('耦合权重 w_ij', 'coupling weight w_ij', '单元之间的相互影响；记忆就存在这套权重里', 'how units influence each other, and where the memories live'),
      q('能量地形 E', 'the energy landscape E', '动力学沿它下降，局部极小就是被回忆出来的那个模式', 'what the dynamics descend, with each local minimum a pattern that gets recalled'),
      q('吸引域', 'the basin of attraction', '一个残缺线索还能回到正确记忆的范围，也是容量的实际含义', 'how corrupted a cue can be and still return to the right memory, which is what capacity really means'),
    ],
    depth: {
      origin: bi(
        '1982 年由 John Hopfield 提出，明确借用自旋玻璃的能量函数来说明联想记忆；2024 年他因此与 Hinton 共获诺贝尔物理学奖，而奖项落在物理而非生物，本身就说明这条结构属于哪里。',
        'Introduced by John Hopfield in 1982, borrowing the spin-glass energy function outright to account for associative memory; the 2024 Nobel he shared with Hinton was in physics rather than biology, which itself says where the structure belongs.',
      ),
      minimalForm: 'E = −½ Σ w_ij s_i s_j ;  动力学沿 E 下降至局部极小',
      canonicalSubstrates: [
        sub('自旋玻璃', 'Spin glasses', '凝聚态物理', 'Condensed-matter physics', 2,
          '无序耦合造出大量局部极小，系统从任意初态落进最近的一个',
          'disordered couplings creating many local minima, with the system falling into whichever is nearest',
          '自旋玻璃的耦合是随机给定的，Hopfield 的是按要存的模式学出来的——同一个能量函数，一个是自然给的地形，一个是被设计的地形。',
          'A spin glass has its couplings handed to it at random while Hopfield learns them from the patterns to be stored: one energy function, one landscape given by nature and one designed.'),
        sub('海马的模式补全', 'Pattern completion in the hippocampus', '神经科学', 'Neuroscience', 3,
          'CA3 的回返连接让一个残缺线索recall出完整记忆，吸引域就是"线索能残到什么程度"',
          'recurrent connections in CA3 completing a whole memory from a partial cue, with the basin measuring how partial it may be',
          '真实突触不对称且有延迟，能量函数严格来说不存在；用它解释海马是借了一个可证的数学结构去描述一个不满足其前提的系统。',
          'Real synapses are asymmetric and delayed so no energy function strictly exists, and using it for the hippocampus borrows a provable structure for a system that does not meet its premises.'),
        sub('蛋白折叠漏斗', 'The protein folding funnel', '结构生物学', 'Structural biology', 2,
          '构象空间上的能量地形，天然态就是那个全局极小，折叠就是下降过程',
          'an energy landscape over conformation space where the native state is the global minimum and folding is the descent',
          '蛋白必须找到全局极小而 Hopfield 只要落进任一局部极小；对折叠来说困在局部极小是病理（错误折叠），对记忆来说那正是功能。',
          'A protein must reach the global minimum while a Hopfield net need only reach any local one, so being trapped is pathology in folding — misfolding — and exactly the function in memory.'),
      ],
      relations: [
        rel('ising-mean-field', 'special-case-of',
          'Hopfield 的能量函数就是伊辛哈密顿量，差别只在 w_ij 是按赫布规则学出来的而不是由晶格固定的——所以"记忆"与"磁化"是同一套数学的两种读法。',
          'The Hopfield energy is the Ising Hamiltonian, differing only in that w_ij is learned by a Hebbian rule rather than fixed by a lattice, which makes memory and magnetisation two readings of one piece of mathematics.'),
        rel('error-correcting-redundancy', 'explains',
          '从残缺线索回到正确记忆就是一次纠错：吸引域的半径扮演码字最小距离的角色，而容量上限说明冗余买来的可靠性同样有硬边界。',
          'Recalling the right memory from a corrupted cue is error correction: the radius of the basin plays the role of a code\'s minimum distance, and the capacity limit says the reliability bought by redundancy has a hard edge here too.'),
      ],
      mistakenFor: bi(
        '常被误当成"神经网络的模型"。它是联想记忆的模型，而联想记忆只是神经系统做的事情之一；更要紧的是它把记忆刻画成静态地形上的极小，这一图景里没有时间、没有序列、也没有新记忆如何避免覆盖旧记忆。',
        'Often mistaken for a model of neural networks in general. It models associative memory, which is one of the things a nervous system does, and more importantly it casts memory as a minimum on a static landscape — a picture with no time, no sequence and no account of how a new memory avoids overwriting an old one.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/quorum-sensing',
    depth: {
      origin: bi(
        '1970 年由 Nealson 与 Hastings 在费氏弧菌的发光现象中发现，起初被称为"自诱导"；1994 年 Fuqua 等人改称群体感应，这个改名本身把一个生化机制重述成了一个决策问题。',
        'Found by Nealson and Hastings in the luminescence of Vibrio fischeri in 1970 and first called autoinduction; renamed quorum sensing by Fuqua and colleagues in 1994, a renaming that itself restated a biochemical mechanism as a problem of decision.',
      ),
      minimalForm: '个体读共享标量 c；c > c* 时集体行为整齐启动',
      canonicalSubstrates: [
        sub('细菌生物膜', 'Bacterial biofilms', '微生物学', 'Microbiology', 0,
          '自诱导物在环境中累积，浓度到阈值时整群同时表达毒力或成膜',
          'autoinducer accumulating in the environment until the concentration triggers the whole population into virulence or film formation',
          '同一分子的浓度既反映菌数也反映扩散受限的空间——在封闭小腔里少数细菌也能"达到法定人数"，这被称作扩散感应。',
          'The same concentration reflects both cell number and how confined the space is, so a few bacteria in a small closed cavity can reach quorum too, which is called diffusion sensing.'),
        sub('蝗虫聚群', 'Locust gregarisation', '昆虫学', 'Entomology', 1,
          '触碰频率越过阈值后，散居型在数小时内转为群居型，形态与行为一起改变',
          'past a threshold rate of contact, solitary locusts turn gregarious within hours, changing form and behaviour together',
          '这里的共享标量是机械触碰而非化学信号，且状态转变有滞后——降回阈值以下不会立刻转回去，这一点标准阈值模型不含。',
          'The shared scalar here is mechanical contact rather than a chemical, and the switch has hysteresis: dropping back below threshold does not immediately reverse it, which the plain threshold model omits.'),
        sub('挤兑', 'A bank run', '金融学', 'Finance', 2,
          '每个储户看到的取款人数就是共享标量，越过阈值后取款成为所有人的最优选择',
          'the number of people withdrawing being the shared scalar each depositor reads, past which withdrawing is optimal for everyone',
          '人会预判别人的预判，而细菌不会：这里的阈值是内生的、会因为预期本身移动，所以同一批基本面可以有多个自我实现的结局。',
          'People anticipate each other\'s anticipation and bacteria do not, so the threshold here is endogenous and moves with expectation, letting one set of fundamentals have several self-fulfilling outcomes.'),
        sub('社会运动的临界规模', 'Critical mass in a social movement', '社会学', 'Sociology', 1,
          '公开参与的人数越过某个比例后，观望者的最优选择从旁观变为加入',
          'once public participation passes a share, the optimal choice for a bystander flips from watching to joining',
          '参与是可见但可伪装的，且不同人的阈值差异极大——用单一阈值描述整个群体会抹掉正是决定成败的那个异质性。',
          'Participation is visible but can be faked and individual thresholds differ enormously, so a single population threshold erases exactly the heterogeneity that decides the outcome.'),
      ],
      relations: [
        rel('ising-mean-field', 'special-case-of',
          '所有个体读同一个标量，等于全连接的平均场耦合：共享浓度扮演外场，阈值扮演临界比值——群体感应是伊辛在"耦合通过一个公共介质"这个情形下的样子。',
          'Everyone reading one scalar is all-to-all mean-field coupling: the shared concentration plays the field and the threshold the critical ratio, which makes quorum sensing what Ising looks like when the coupling runs through a common medium.'),
        rel('network-cascade', 'generates',
          '阈值决定集体行动何时开始，接触网络决定它能传多远；同一次行动被两条结构各管一半，把阈值问题当成传播问题会去优化错的东西。',
          'The threshold decides when collective action starts and the contact network decides how far it travels, so one action is governed half by each, and treating a threshold problem as a spreading problem optimises the wrong thing.'),
      ],
      mistakenFor: bi(
        '常被误当成"细菌在交流"。个体并不发送也不接收信息，只是产生一个分子并对它的浓度作出反应；把它读成通讯会引出"欺骗信号"这类问题，而真正的问题是浓度什么时候还算群体规模的可靠代理。',
        'Often mistaken for bacteria communicating. No individual sends or receives anything; each produces a molecule and responds to its concentration. Reading it as communication raises questions about deceptive signalling when the real question is when concentration still proxies for population size.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/self-assembly',
    depth: {
      origin: bi(
        '1950 年代由 Fraenkel-Conrat 与 Williams 在烟草花叶病毒的体外重装中确立：把蛋白与 RNA 分开再混合，病毒自己重新组装成有感染性的整体。',
        'Established in the 1950s by Fraenkel-Conrat and Williams with tobacco mosaic virus: separate the protein from the RNA, remix, and the virus reassembles itself into an infectious whole.',
      ),
      minimalForm: '局部结合规则 + 能量下降 ⇒ 有序结构，无蓝图无装配者',
      canonicalSubstrates: [
        sub('分子晶体', 'Molecular crystals', '化学', 'Chemistry', 0,
          '分子间的方向性作用决定谁能与谁相接，长程有序由此出现',
          'directional interactions between molecules deciding what may join what, from which long-range order follows',
          '同一分子常有多种晶型（多晶型），哪一种长出来取决于动力学而非最低能量——制药业为此吃过大亏。',
          'One molecule often has several polymorphs and which grows is decided by kinetics rather than the lowest energy, at considerable cost to the pharmaceutical industry.'),
        sub('蛋白折叠', 'Protein folding', '结构生物学', 'Structural biology', 1,
          '氨基酸序列自己编码了能量地形，天然结构是它的极小',
          'the amino-acid sequence encoding its own landscape, with the native structure as its minimum',
          '许多蛋白在细胞里需要伴侣蛋白才折得对，所以"自"组装在体内并不完全自发；体外重折成功不等于体内如此。',
          'Many proteins need chaperones to fold correctly in the cell, so the self in self-assembly is not complete in vivo, and refolding in a tube does not establish that it happens the same way inside one.'),
        sub('群体建造', 'Collective construction', '行为生态学', 'Behavioural ecology', 0,
          '白蚁与蜜蜂各自只遵循局部刺激—反应规则，蚁丘与蜂巢没有设计者',
          'termites and bees each following local stimulus-response rules, with no designer behind the mound or the comb',
          '这里的"能量"是个类比：昆虫遵循的是行为规则而不是在降低某个物理量，把它写成能量最小化会引入一个不存在的目标函数。',
          'Energy here is an analogy: the insects follow behavioural rules rather than lowering a physical quantity, and writing it as energy minimisation imports an objective function that does not exist.'),
      ],
      relations: [
        rel('attractor-networks-hopfield', 'special-case-of',
          '两者共享"能量地形"这一个量：自组装是沿地形下降到某个局部极小，Hopfield 把同一个下降用来回忆记忆——被动力学困住与回忆错误在数学上是同一件事。',
          'Both turn on one quantity, the energy landscape: self-assembly is descent into some local minimum and Hopfield puts the same descent to work recalling a memory, so being kinetically trapped and recalling the wrong pattern are mathematically one event.'),
        rel('phase-separation', 'competes-with',
          '同一批观察——液滴、聚集体、有序畴——既能被读成自组装，也能被读成相分离；判定是哪一个要看界面是产物还是部件，而在无膜细胞器这类案例上这个判定至今没有定论。',
          'One set of observations — droplets, aggregates, ordered domains — reads either as self-assembly or as phase separation, and deciding which turns on whether the interface is a product or a component, a question still open for cases such as membraneless organelles.'),
      ],
      mistakenFor: bi(
        '常被误当成"自发就等于容易"。自发只是说不需要外部装配者，不说明快、也不说明可靠：多晶型、动力学陷阱与错误折叠都是自发过程的产物，产率往往才是真正的工程难点。',
        'Often mistaken for spontaneous meaning easy. Spontaneous only says no external assembler is needed, not that it is fast or reliable: polymorphs, kinetic traps and misfolding are all products of spontaneous processes, and yield is usually where the engineering difficulty actually sits.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/phase-separation',
    depth: {
      origin: bi(
        '1958 年由 Cahn 与 Hilliard 给出连续描述；2009 年 Brangwynne 等人在线虫生殖颗粒上发现细胞内的液—液相分离，把一个冶金学概念带进了细胞生物学。',
        'Given a continuum description by Cahn and Hilliard in 1958, and carried from metallurgy into cell biology when Brangwynne and colleagues found liquid-liquid phase separation in C. elegans germ granules in 2009.',
      ),
      minimalForm: '混合熵 vs 相互作用能；越过临界组成后分离降低总自由能',
      canonicalSubstrates: [
        sub('无膜细胞器', 'Membraneless organelles', '细胞生物学', 'Cell biology', 0,
          '蛋白与 RNA 的多价弱相互作用足以形成液滴，不需要任何膜',
          'multivalent weak interactions among proteins and RNA forming droplets with no membrane at all',
          '体外能相分离不等于体内靠相分离工作：细胞里浓度、拥挤度与主动过程都不同，近年不少体内结论正被重新检验。',
          'Separating in a tube does not establish that the cell works that way: concentration, crowding and active processes all differ inside, and a number of in-vivo claims are being re-examined.'),
        sub('油水分离', 'Oil and water', '物理化学', 'Physical chemistry', 2,
          '界面张力决定液滴的大小分布与合并速度',
          'interfacial tension setting droplet sizes and how fast they coalesce',
          '这是最干净的基底，也因此最容易被误当作模板：细胞内的凝聚体黏度高出几个数量级，弛豫时标完全不同。',
          'The cleanest substrate and therefore the most misleading template: intracellular condensates are orders of magnitude more viscous and relax on entirely different timescales.'),
        sub('居住隔离', 'Residential segregation', '社会学', 'Sociology', 1,
          '谢林模型里很温和的同类偏好就足以让混居的城市自发分开',
          'in the Schelling model a mild preference for like neighbours suffices to separate a mixed city',
          '谢林说明温和偏好足以产生隔离，但不说明观察到的隔离就来自温和偏好——制度性排斥能产生同样的图案，二者需要另外的证据分开。',
          'Schelling shows mild preference is sufficient for segregation and not that observed segregation came from mild preference; institutional exclusion produces the same pattern and separating them takes other evidence.'),
        sub('观点极化', 'Opinion polarisation', '政治学', 'Political science', 0,
          '同质化倾向越过某个强度后，原本连续的意见分布分成两团',
          'past a threshold in homophily, a continuous distribution of opinion splits into two clumps',
          '人的"相互作用强度"不可直接测量，只能从行为反推；这里的临界组成因此不是一个可独立标定的量，模型能拟合但难以证伪。',
          'Interaction strength between people cannot be measured directly and is inferred from behaviour, so the critical composition is not independently calibratable and the model fits without being easy to falsify.'),
      ],
      relations: [
        rel('ising-mean-field', 'special-case-of',
          '把伊辛的序参量改成守恒的（自旋总数不变、只能在空间上重新分布），得到的就是相分离——所以格气模型与相分离是同一套数学。',
          'Make the Ising order parameter conserved — the total is fixed and can only be rearranged in space — and what comes out is phase separation, which is why the lattice gas and phase separation are one piece of mathematics.'),
        rel('spontaneous-modularity', 'generates',
          '自发分成两相就是最简单的一次模块化：同类内部强耦合、跨界面弱耦合。它说明模块可以不靠任何选择压、只靠相互作用出现——这是模块化的零假设。',
          'Separating into two phases is the simplest possible modularisation: strong coupling within each and weak across the interface. It shows modules can appear from interaction alone with no selection pressure, which makes it the null hypothesis for modularity.'),
      ],
      mistakenFor: bi(
        '常被误当成"聚在一起"。相分离的内容不是聚集而是存在一个临界组成：低于它体系保持混合，高于它必然分开，且分开后两相各自的浓度由相图固定而不随总量变化——没有这条，观察到的团块可能只是聚集。',
        'Often mistaken for things clumping. Its content is not aggregation but a critical composition: below it the system stays mixed, above it separation is inevitable, and the concentration within each phase is then fixed by the phase diagram rather than by how much material there is — without that, an observed clump may be mere aggregation.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/niche-construction',
    depth: {
      origin: bi(
        '1988 年由 Odling-Smee 命名，2003 年与 Laland、Feldman 写成专著；它的主张是演化理论里"环境"这一项不能再被当作外生给定，这一点至今仍有争议。',
        'Named by Odling-Smee in 1988 and developed into a book with Laland and Feldman in 2003; its claim, still contested, is that the environment term in evolutionary theory can no longer be treated as given from outside.',
      ),
      minimalForm: '个体改造 E，E 改变作用于个体的选择压 ⇒ 因果双向',
      canonicalSubstrates: [
        sub('蚯蚓改造土壤', 'Earthworms reworking soil', '生态学', 'Ecology', 0,
          '蚯蚓改变土壤结构与化学，而这套被改变的土壤正是后代要面对的选择环境',
          'earthworms altering soil structure and chemistry, and that altered soil being the selective environment their descendants meet',
          '这里的遗留效应跨代持续，所以要把它与"个体一生内的可塑性"分开——同一个改造行为在两个时标上是两回事。',
          'The legacy persists across generations, so it has to be told apart from plasticity within one lifetime: the same act of modification is two different things on the two timescales.'),
        sub('技术基础设施', 'Technological infrastructure', '技术史', 'History of technology', 2,
          '一代人铺下的铁路与电网，成为下一代技术能不能成立的前提',
          'the rails and grids one generation lays becoming the precondition for whether the next generation\'s technology can exist at all',
          '基础设施的遗留效应远长于任何一个决策者的视野，所以这里的"选择压"没有对应的选择者——用演化语言描述会暗示一个不存在的适应过程。',
          'Infrastructure outlasts any decision-maker\'s horizon so there is no selector behind the selection pressure, and evolutionary language here implies an adaptive process that is not occurring.'),
        sub('市场创造', 'Market creation', '经济学', 'Economics', 1,
          '一家公司改变消费习惯之后，它面对的竞争环境也随之改变',
          'a firm changing consumption habits and thereby changing the competitive environment it faces',
          '这里的反馈回路可以短到几个月，与生态位构建原本设想的跨代时标差几个数量级——回路时长不同，结构的结论也不同。',
          'The loop here can close in months, orders of magnitude faster than the cross-generational timescale the structure was framed for, and a different loop time gives different conclusions.'),
        sub('制度形成', 'Institution formation', '政治经济学', 'Political economy', 2,
          '一套规则被建立后，后来者是在这套规则里而不是在真空里争夺',
          'once a set of rules exists, later players compete inside it rather than in a vacuum',
          '制度可以被有意设计与推翻，而生态位构建的原始形式不含意图；把二者混同会把政治行动读成自然过程。',
          'Institutions can be designed and overturned deliberately while the original form of niche construction has no intention in it, and conflating the two reads political action as a natural process.'),
      ],
      relations: [
        rel('path-dependence', 'generates',
          '被改造的环境会留在原地，于是后来的选择在一个已经被前面选择改写过的地形上进行——生态位构建是路径依赖在生态与技术上的具体机制。',
          'A modified environment stays modified, so later choices are made on terrain earlier choices already rewrote: niche construction is the concrete mechanism behind path dependence in ecology and technology.'),
        rel('deep-time-accumulation', 'generates',
          '单次改造小到可忽略，但遗留效应不衰减地累积，于是在足够长的时标上它主导一切——大氧化事件就是这条结构乘上时间的结果。',
          'One act of modification is negligible while the legacy accumulates without decaying, so on a long enough timescale it dominates: the Great Oxidation Event is this structure multiplied by time.'),
      ],
      mistakenFor: bi(
        '常被误当成"生物改变环境"这个平凡观察。改变环境本身不构成生态位构建，回路必须闭合：被改变的那部分环境要真的作用回改造者或其后代身上。回路不闭合时，改造只是遗产，不是选择压。',
        'Often mistaken for the unremarkable observation that organisms alter their surroundings. Alteration alone is not niche construction; the loop has to close, with the altered part of the environment acting back on the modifier or its descendants. Where it does not close, the modification is a bequest rather than a selection pressure.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/spontaneous-modularity',
    depth: {
      origin: bi(
        '1962 年由 Herbert Simon 在《The Architecture of Complexity》中以"近可分解系统"提出，用手表匠的寓言说明模块化的装配优势；2005 年后由 Kashtan 与 Alon 用"目标频繁变而子目标不变"给出可仿真的机制。',
        'Posed by Herbert Simon in 1962 as near-decomposability in The Architecture of Complexity, argued through the parable of the watchmakers; given a simulable mechanism after 2005 by Kashtan and Alon as goals that change often while sub-goals do not.',
      ),
      minimalForm: '模块内耦合 ≫ 模块间耦合，且分界线无人指定',
      canonicalSubstrates: [
        sub('细胞的代谢通路', 'Metabolic pathways in a cell', '系统生物学', 'Systems biology', 0,
          '通路内部反应密集耦合，通路之间只经少数共享代谢物相连',
          'reactions coupled densely inside a pathway and connected between pathways only through a few shared metabolites',
          '"通路"的边界有很大一部分是教科书画出来的而非代谢网络自带的——用不同的聚类方法会得到不同的模块，需要独立证据判定哪一种预测干预结果。',
          'A good deal of a pathway\'s boundary is drawn by textbooks rather than carried by the network, and different clustering gives different modules, so independent evidence is needed on which one predicts intervention.'),
        sub('软件架构', 'Software architecture', '软件工程', 'Software engineering', 2,
          '重连代价（改一处要牵动多少别处）是模块边界最实际的度量',
          'the cost of rewiring — how much else one change drags along — being the most practical measure of a module boundary',
          '这里的模块常常是被人为规定的而非自发涌现的，所以观察到模块化不构成这条结构的证据；要看的是在没有规定时它会不会出现。',
          'Modules here are usually mandated rather than emergent, so observing modularity is not evidence for this structure: what matters is whether it appears when nobody mandates it.'),
        sub('组织分工', 'Division of labour in an organisation', '组织学', 'Organisation studies', 1,
          '任务组合频繁变而单项任务不变时，组织自己会分成相对独立的单元',
          'when task combinations change often while individual tasks do not, an organisation splits itself into relatively independent units',
          '组织的边界还受制于权力与预算，而不只是耦合强度——同一份耦合结构在不同治理下会画出不同的组织图。',
          'Organisational boundaries answer to power and budget as well as to coupling, so one coupling structure yields different org charts under different governance.'),
      ],
      relations: [
        rel('graph-laplacian-spectrum', 'emerges-from',
          '模块化在数据上表现为图拉普拉斯第二小特征值变小，也就是这张图变得容易被切开；谱给出的是"有多可分"，这条结构问的是"为什么会变得可分"。',
          'Modularity shows up in the data as a falling second-smallest eigenvalue of the graph Laplacian — the graph becoming easy to cut. The spectrum says how separable it is and this structure asks why it became so.'),
        rel('hourglass-waist', 'generates',
          '模块之间必须经过的那少数几个接口，一旦收敛成单一公共协议，就是沙漏的窄腰——模块化是窄腰出现的前提，而窄腰是模块化走到极端的样子。',
          'The few interfaces modules must pass through, once they converge on one shared protocol, are the waist of an hourglass: modularity is the precondition for a waist and the waist is modularity taken to its limit.'),
      ],
      mistakenFor: bi(
        '常被误当成"可以画出模块图"。任何网络都能被聚类算法切出模块，画得出来不等于模块存在；判据是跨模块耦合真的弱到可以在干预时忽略——不能预测干预后果的模块边界只是一张好看的图。',
        'Often mistaken for being able to draw a module diagram. Any network can be cut into modules by a clustering algorithm, and drawing them does not make them exist; the test is whether the across-module coupling is genuinely weak enough to ignore under intervention, and a boundary that predicts nothing about intervention is only a nice picture.',
      ),
    },
  },
];
