import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureQuantity, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the inference-and-limits family.
 *
 * Chosen second because several of its relations are not analogies but
 * identities, and a field for relations earns its place only if it can carry
 * those without blurring them into resemblance. The Fisher information IS the
 * metric on the model manifold — Čencov's theorem says it is the only invariant
 * one. Minimising variational free energy at fixed constraints IS maximising
 * entropy under them. The Gibbs distribution of the Ising model IS the
 * maximum-entropy distribution given an energy constraint, which is why that
 * model is not really an assumption about magnets.
 *
 * That last one reaches into the critical-transition family, and deliberately.
 * A relation network confined inside one family would only be restating the
 * family; the point of the field is that 最大熵 and 伊辛 sit in different
 * chapters of every textbook and are the same statement.
 *
 * Same terms as the first depth batch: authored from textbook knowledge, no
 * island referenced anywhere, and no mapping or coverage touched. Four of the
 * eight predate wave 4 and get their declared quantities here; that settles
 * nothing about which rendering inside their existing mappings corresponds to
 * which quantity, which stays in the `projectQuantityRoles` queue.
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

export const INFERENCE_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/maximum-entropy-inference',
    quantities: [
      q('约束 ⟨f_k⟩', 'constraints ⟨f_k⟩', '你确实知道的那几个统计量；它们是全部输入', 'the few statistics you actually know, which are the entire input'),
      q('拉格朗日乘子 λ_k', 'Lagrange multipliers λ_k', '每条约束的"价格"，在物理基底上就是温度、化学势一类的量', 'the price of each constraint, which in a physical substrate is a temperature or a chemical potential'),
      q('最大熵分布 p', 'the maximum-entropy distribution p', '在这些约束下加进去最少额外假设的那个分布', 'the distribution that adds the least beyond those constraints'),
    ],
    depth: {
      origin: bi(
        '1957 年由 E.T. Jaynes 提出，主张统计力学的吉布斯分布不是关于物质的物理假设，而是关于"只知道能量"这一认识状态的推断规则。',
        'Stated by E. T. Jaynes in 1957, arguing that the Gibbs distribution of statistical mechanics is not a physical assumption about matter but an inference rule about the state of knowing only the energy.',
      ),
      minimalForm: 'max H = −Σ p·log p  s.t. Σ p·f_k = ⟨f_k⟩  ⇒  p ∝ exp(−Σ λ_k f_k)',
      canonicalSubstrates: [
        sub('吉布斯分布', 'The Gibbs distribution', '统计力学', 'Statistical mechanics', 1,
          '温度就是能量约束对应的那个乘子，1/T',
          'temperature is the multiplier belonging to the energy constraint, 1/T',
          '这里的约束（能量）由物理定律给定且可独立测量；换到别的基底上，"该拿哪几个统计量当约束"本身就是最难、也最容易被绕过的一步。',
          'Here the constraint is fixed by physical law and independently measurable; in other substrates, choosing which statistics to constrain is the hardest step and the one most often skipped.'),
        sub('神经群体活动', 'Neural population activity', '神经科学', 'Neuroscience', 0,
          '单细胞放电率与成对相关，就是被约束住的那几个量',
          'single-cell firing rates and pairwise correlations are the constrained quantities',
          '拟合得好只说明这几个约束有信息量，不说明神经系统在物理上"最大化熵"——把推断规则读成机制是这条结构最常见的误用。',
          'A good fit shows only that those constraints are informative, not that the nervous system physically maximises entropy: reading the inference rule as a mechanism is this structure\'s commonest misuse.'),
        sub('生态丰度分布', 'Species abundance distributions', '生态学', 'Ecology', 2,
          '在总生物量与物种数约束下，最少偏见的丰度分布',
            'the least-committal abundance distribution given total biomass and species count',
          '生态系统不是平衡态，采样也非随机；这里的最大熵是一条可审计的基线，超出基线的部分才是生态学要解释的东西。',
          'Ecosystems are not at equilibrium and sampling is not random, so maximum entropy here is an auditable baseline and what exceeds it is what ecology has to explain.'),
        sub('语言模型的 softmax', 'The softmax of a language model', '机器学习', 'Machine learning', 1,
          'logits 就是乘子，softmax 就是给定这些乘子后的指数族分布',
          'the logits are the multipliers and the softmax is the exponential family they define',
          '这里的乘子是学出来的而非从约束解出来的，所以形式相同、来路不同：它不保证"加进去最少"，只保证拟合了训练分布。',
          'Here the multipliers are learned rather than solved from constraints, so the form matches while the provenance does not: it guarantees a fit to the training distribution, not minimal commitment.'),
      ],
      relations: [
        rel('variational-free-energy', 'special-case-of',
          '在给定约束下最小化 F = ⟨E⟩ − T·S，与在同样约束下最大化 S 是同一个变分问题——最大熵是自由能最小化把温度固定住之后的那个特例。',
          'Minimising F = ⟨E⟩ − T·S under constraints and maximising S under the same constraints are one variational problem: maximum entropy is free-energy minimisation with the temperature held fixed.'),
        rel('ising-mean-field', 'explains',
          '伊辛的吉布斯分布正是"只知道能量"时的最大熵分布，所以那个模型不是关于磁性的物理假设，而是一条推断规则——这也解释了它为什么能被搬到意见、神经、市场上而不显荒谬。',
          'The Ising Gibbs distribution is exactly the maximum-entropy distribution when energy is all that is known, so the model is an inference rule rather than a physical assumption about magnetism — which is why it transplants to opinion, neurons and markets without absurdity.'),
      ],
      mistakenFor: bi(
        '常被误当成"熵越大越好"或"系统倾向于无序"。它一句关于世界的话都没说：它说的是在你只知道这几件事的前提下，写下哪个分布才算没有多编。把它读成物理机制，就会去解释一个根本不存在的"熵最大化过程"。',
        'Often mistaken for entropy being desirable or systems tending to disorder. It says nothing about the world at all: it says which distribution counts as not making things up, given that these are the only things you know. Read as a physical mechanism, it sends people explaining an entropy-maximising process that does not exist.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/fisher-precision-limit',
    quantities: [
      q('费雪信息 I(θ)', 'Fisher information I(θ)', '数据对参数的敏感度：似然随参数变化得越快，能估得越准', 'how sharply the data respond to the parameter — the faster the likelihood moves, the better it can be estimated'),
      q('估计方差', 'variance of the estimate', '被封顶的那个量；下界是 1/I(θ)', 'the quantity being bounded, with a floor of 1/I(θ)'),
      q('无偏性', 'unbiasedness', '这条界成立的前提；放弃它就能换到更小的方差', 'the premise the bound rests on, and what can be traded away for smaller variance'),
    ],
    depth: {
      origin: bi(
        '1922 年由 R.A. Fisher 引入信息量，1945 年由 Cramér 与 Rao 各自给出下界；1990 年代量子计量学把同一个不等式推到海森堡极限。',
        'Fisher introduced the information in 1922 and Cramér and Rao gave the bound independently in 1945; quantum metrology carried the same inequality to the Heisenberg limit in the 1990s.',
      ),
      minimalForm: 'Var(θ̂) ≥ 1 / I(θ),  I(θ) = 𝔼[(∂ ln p/∂θ)²]',
      canonicalSubstrates: [
        sub('参数估计', 'Parameter estimation', '统计学', 'Statistics', 1,
          '样本量为 n 时方差下界按 1/n 缩小，这就是"多采样有多大用"的准确答案',
          'the floor shrinking as 1/n with sample size, which is the exact answer to how much more sampling buys',
          '模型设定错了，这条界仍然成立但没有意义——它给的是"在这个模型内"的极限，不是"离真相"的极限。',
          'Under a misspecified model the bound still holds and means nothing: it limits precision within the model, not distance from the truth.'),
        sub('量子计量', 'Quantum metrology', '量子物理', 'Quantum physics', 0,
          '量子费雪信息决定海森堡极限，纠缠能把标准量子极限的 1/√N 推进到 1/N',
          'the quantum Fisher information setting the Heisenberg limit, with entanglement pushing 1/√N to 1/N',
          '这个提升要求纠缠态在测量前不退相干；真实系统里退相干往往把优势吃回去，理论极限与可达极限差距很大。',
          'The gain requires the entangled state to survive to measurement, and in real systems decoherence usually eats it, leaving a wide gap between the theoretical and reachable limits.'),
        sub('心理物理阈限', 'Psychophysical thresholds', '心理物理学', 'Psychophysics', 1,
          '一个人能分辨的最小刺激差，被其感觉噪声的费雪信息封顶',
          'the smallest difference a person can tell apart, capped by the Fisher information of their sensory noise',
          '人的回答受注意、动机与作答策略影响，观察到的阈限是感觉极限加决策过程的合成，两者需要另设实验才能分开。',
          'A person\'s answers carry attention, motivation and response strategy, so an observed threshold combines the sensory limit with a decision process and separating them takes a further experiment.'),
        sub('遥感反演', 'Remote-sensing retrieval', '地球科学', 'Earth science', 0,
          '光谱通道的设置决定了对地表参数的费雪信息，也就决定了这颗卫星最多能反演多准',
          'the choice of spectral channels fixing the Fisher information about a surface parameter, and with it how precisely the satellite can ever retrieve it',
          '大气与地表参数在反演里高度耦合，单参数的费雪信息会严重高估实际精度，必须用整个信息矩阵而不是对角元。',
          'Atmospheric and surface parameters are strongly coupled in retrieval, so a single-parameter Fisher information badly overstates the achievable precision and the full matrix is required rather than its diagonal.'),
      ],
      relations: [
        rel('two-error-tradeoff', 'explains',
          '漏报与误报之间那条前沿的位置，由两个假设下的分布分得开不开决定，而费雪信息正是度量这份可分性的量——所以"换个判定规则"动不了前沿，"提高费雪信息"才动得了。',
          'Where the frontier between misses and false alarms sits is set by how separable the two hypotheses\' distributions are, and Fisher information is what measures that separability — which is why changing the decision rule cannot move the frontier and raising the information can.'),
        rel('conjugate-uncertainty', 'explains',
          '共轭量的乘积下界不是一条独立公理：在量子计量里它由量子费雪信息推出，两个共轭量各自的可估精度之积被同一个信息量封顶。',
          'The product bound on conjugate quantities is not an independent axiom: in quantum metrology it follows from the quantum Fisher information, with the estimable precision of each capped by one and the same information.'),
      ],
      mistakenFor: bi(
        '常被误当成"数据越多越准"的精确版。它真正说的是：在模型正确、估计无偏这两个前提下方差有下界。两个前提都可以被放弃——有偏估计常常方差更小，而模型错了这条界照样成立却毫无意义。',
        'Often mistaken for a precise version of more data being better. What it says is that variance has a floor given a correct model and an unbiased estimator. Both premises can be dropped: a biased estimator often has smaller variance, and under a wrong model the bound holds and means nothing.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/information-geometry',
    quantities: [
      q('模型流形', 'the model manifold', '把所有候选模型铺开成的那个空间，一点就是一组参数', 'the space of all candidate models laid out, where one point is one parameter set'),
      q('费雪-饶度规', 'the Fisher-Rao metric', '流形上的距离；Čencov 证明它是唯一在重参数化下不变的那一个', 'distance on that manifold, which Čencov proved is the only one invariant under reparameterisation'),
      q('软方向', 'the sloppy directions', '度规几乎为零的方向：参数大幅变动而预测几乎不变，无知就住在这里', 'directions where the metric nearly vanishes — parameters move a lot and predictions barely do, which is where ignorance lives'),
    ],
    depth: {
      origin: bi(
        '1945 年由 C.R. Rao 指出费雪信息可作黎曼度规；1972 年 Čencov 证明它是统计流形上唯一的不变度规；1980 年代由甘利俊一发展为完整的对偶几何。',
        'C. R. Rao noted in 1945 that the Fisher information serves as a Riemannian metric; Čencov proved in 1972 that it is the only invariant one on a statistical manifold; Shun-ichi Amari developed the full dual geometry in the 1980s.',
      ),
      minimalForm: 'ds² = Σ g_ij(θ) dθⁱdθʲ,  g_ij = I(θ)',
      canonicalSubstrates: [
        sub('系统生物学模型', 'Systems-biology models', '系统生物学', 'Systems biology', 2,
          '生化网络模型里绝大多数参数组合是软方向，几十个速率常数只有几个真正被数据钉住',
          'in a biochemical network most parameter combinations are sloppy, with only a few of dozens of rate constants actually pinned by the data',
          '软不等于不重要：一个软方向上的参数仍可能决定系统在别的实验条件下的行为，"软"只是相对于当前这批数据说的。',
          'Sloppy does not mean unimportant: a parameter along a sloppy direction may still decide behaviour under other experimental conditions, and sloppiness is only ever relative to the data at hand.'),
        sub('神经网络的损失景观', 'The loss landscape of a neural network', '机器学习', 'Machine learning', 1,
          '海森矩阵的谱几乎全部集中在少数方向上，其余方向平坦得近乎自由',
          'the Hessian spectrum concentrating in a few directions with the rest nearly flat',
          '损失景观的度规不是费雪-饶度规，除非损失就是负对数似然；用交叉熵以外的损失时，几何图景要重新推导而不是照搬。',
          'The landscape metric is not the Fisher-Rao metric unless the loss is a negative log-likelihood, so with any other loss the geometry has to be re-derived rather than carried over.'),
        sub('气候模式的参数标定', 'Tuning a climate model', '气候科学', 'Climate science', 2,
          '几十个次网格参数中，只有少数方向被观测约束住，其余方向上的自由就是不确定性本身',
          'of dozens of sub-grid parameters only a few directions are constrained by observation, and the freedom in the rest is the uncertainty itself',
          '气候模式的观测约束高度相关且随时间变化，流形本身在动——静态的费雪几何只能刻画某一批观测下的瞬时图景。',
          'Climate observations are strongly correlated and change over time so the manifold itself moves, and a static Fisher geometry captures only the snapshot under one batch of observations.'),
      ],
      relations: [
        rel('fisher-precision-limit', 'explains',
          '它说明费雪信息为什么是"那个"量而不是随便一个可用的量：Čencov 定理证明它是统计流形上唯一在重参数化下不变的度规，所以克拉默-拉奥界不是一个约定，是几何的必然。',
          'It explains why the Fisher information is the quantity rather than a convenient one: Čencov\'s theorem shows it is the only reparameterisation-invariant metric on a statistical manifold, so the Cramér-Rao bound is a geometric necessity rather than a convention.'),
        rel('variational-free-energy', 'explains',
          '自由能上的自然梯度用的正是费雪度规——沿最陡下降方向走之所以要先乘度规的逆，是因为参数空间本来就不是欧氏的。',
          'Natural gradient descent on free energy uses exactly this metric: the reason steepest descent must be premultiplied by the inverse metric is that parameter space was never Euclidean.'),
      ],
      mistakenFor: bi(
        '常被误当成"参数敏感性分析"。敏感性看的是单个参数，几何看的是方向：一个模型可以对每个参数都敏感，却在参数的某个组合方向上完全不敏感，而后者才是无知所在。',
        'Often mistaken for parameter sensitivity analysis. Sensitivity looks at single parameters and the geometry looks at directions: a model can be sensitive to every parameter individually and completely insensitive along a particular combination of them, and that combination is where the ignorance is.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/variational-free-energy',
    quantities: [
      q('自由能 F', 'free energy F', '预测与观测之差的一个上界；被持续压低的就是它', 'an upper bound on the gap between prediction and observation, and what is continuously pushed down'),
      q('候选分布 q', 'the candidate distribution q', '用来逼近真实后验的那个可控分布', 'the tractable distribution standing in for the true posterior'),
      q('能量—熵权衡', 'the energy-entropy trade', '压低 F 可以靠拟合得更紧，也可以靠保持不确定，两者互相拉扯', 'F falls either by fitting more tightly or by staying uncertain, and the two pull against each other'),
    ],
    depth: {
      origin: bi(
        '作为统计物理的变分原理由 Feynman 与 Bogoliubov 给出；1990 年代成为机器学习里变分推断的基础；2006 年起 Karl Friston 把它推为大脑功能的统一原理，也因此成为这条结构争议最大的一段。',
        'A variational principle in statistical physics from Feynman and Bogoliubov, the basis of variational inference in machine learning from the 1990s, and from 2006 pushed by Karl Friston as a unifying principle of brain function — which is also where the structure is most contested.',
      ),
      minimalForm: 'F = ⟨E⟩_q − T·S[q] ≥ −T·log Z',
      canonicalSubstrates: [
        sub('变分推断', 'Variational inference', '机器学习', 'Machine learning', 1,
          '用一个可算的 q 逼近算不动的后验，优化的目标就是这个上界',
          'a tractable q standing in for an intractable posterior, with the bound as the objective',
          '界的松紧完全取决于 q 的族选得好不好；界被压低不等于逼近变准，只等于这个族里最好的那个被找到了。',
          'How tight the bound is depends entirely on the family q is drawn from, so lowering it does not mean the approximation improved — only that the best member of that family was found.'),
        sub('热力学自由能', 'Thermodynamic free energy', '热力学', 'Thermodynamics', 0,
          '自由能差给出可从系统中提取功的上界',
          'a free-energy difference bounding the work extractable from a system',
          '这个基底里的 T 是真实温度、可独立测量；搬到推断上时 T 变成一个自由参数，"温度"这个词就不再指同一件事。',
          'Here T is a real, independently measurable temperature; carried into inference it becomes a free parameter, and the word stops naming the same thing.'),
        sub('主动推断', 'Active inference', '神经科学', 'Neuroscience', 2,
          '既可以改内部模型来贴近观测，也可以采取行动改变观测本身，两条路压低同一个量',
          'either revise the internal model to match observation or act to change the observation, both lowering one quantity',
          '这条把行动与推断合一的读法是本结构最强也最难证伪的一段：几乎任何行为都能被事后写成某种自由能下降，缺少能把它证伪的观测。',
          'Folding action into inference is the structure\'s boldest and least falsifiable stretch: almost any behaviour can be written after the fact as some free energy decreasing, and the observation that would refute it is missing.'),
      ],
      relations: [
        rel('landauer-erasure-cost', 'explains',
          '擦除一比特的下界是自由能差的一个特例：把两个可区分状态并成一个，可用自由能至少减少 kT·ln2——Landauer 界不是一条独立的物理定律，是这条变分原理在计算上的读法。',
          'The floor on erasing a bit is a special case of a free-energy difference: merging two distinguishable states costs at least kT·ln2 of available free energy, so Landauer\'s bound is not an independent law but this variational principle read on computation.'),
        rel('information-geometry', 'generates',
          '在自由能上做最陡下降，如果不先乘费雪度规的逆就会依赖参数化方式；正是这一点逼出了自然梯度，也就把变分推断和信息几何绑在了一起。',
          'Steepest descent on free energy depends on the parameterisation unless premultiplied by the inverse Fisher metric, and that requirement is what forces the natural gradient and ties variational inference to information geometry.'),
      ],
      mistakenFor: bi(
        '常被误当成"系统在最小化惊奇"这句口号。口号本身几乎不可证伪：任何稳态行为都能被写成某个自由能在下降。有内容的版本必须先说清 q 的族、T 的来路和这次最小化排除了什么行为。',
        'Often reduced to the slogan that systems minimise surprise, which is close to unfalsifiable: any steady behaviour can be written as some free energy decreasing. The contentful version has to state the family q is drawn from, where T comes from, and which behaviours this minimisation rules out.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/conjugate-uncertainty',
    depth: {
      origin: bi(
        '1927 年由海森堡在量子力学中提出，1930 年代由 Gabor 在信号分析里独立得到同一形式的时频不确定性；两者共用的是傅里叶对偶而不是量子性。',
        'Stated by Heisenberg for quantum mechanics in 1927 and obtained independently in the same form by Gabor for time-frequency analysis in the 1930s; what they share is Fourier duality rather than anything quantum.',
      ),
      minimalForm: 'Δx · Δp ≥ ħ/2 ;  Δt · Δf ≥ 1/4π',
      canonicalSubstrates: [
        sub('位置与动量', 'Position and momentum', '量子物理', 'Quantum physics', 0,
          '同一个量子态在位置表象与动量表象下的宽度之积有下界',
          'the widths of one quantum state in the position and momentum representations having a bounded product',
          '这条界说的是态的性质，不是测量扰动；把它讲成"测量打扰了粒子"是历史上流传最广的错误读法，二者需要各自的不等式。',
          'The bound is a property of the state rather than of measurement disturbance; telling it as the measurement jostling the particle is the most widely repeated misreading, and the two need separate inequalities.'),
        sub('时频分辨率', 'Time-frequency resolution', '信号处理', 'Signal processing', 1,
          '窗口取短则时间定位准而频率糊，取长则相反，乘积有硬下界',
          'a short window localises time and blurs frequency and a long one does the reverse, with a hard floor on the product',
          '这里没有任何量子成分：同一条界纯粹来自傅里叶变换的性质，所以它对经典信号一样成立。',
          'Nothing quantum enters here: the same bound follows purely from the Fourier transform, so it holds for classical signals just as well.'),
        sub('统计推断中的联合估计', 'Joint estimation in statistics', '统计学', 'Statistics', 2,
          '同时估计两个耦合参数时，两者的精度不能同时任意提高，代价可以在两者之间重新分配',
          'estimating two coupled parameters at once, where precision cannot be raised in both and the cost can be reallocated between them',
          '统计里的这条界来自费雪信息矩阵的非对角项，量子情形还多出算符不对易这一层——形式相同，来源并不完全相同。',
          'The statistical version comes from off-diagonal terms of the Fisher matrix while the quantum case adds non-commuting operators, so the form matches while the origin does not entirely.'),
      ],
      relations: [
        rel('impossibility-theorem', 'special-case-of',
          '"两个共轭量都测到任意准"是一组单独看都合理、却被证明无法同时满足的要求——它是不可能性定理在连续量上的一个实例，而"放宽哪一条"在这里就是把不确定性分配到哪一边。',
          'Wanting both conjugate quantities arbitrarily sharp is a set of individually reasonable requirements proved jointly unsatisfiable — an instance of an impossibility theorem on continuous quantities, where relaxing one means choosing which side carries the uncertainty.'),
        rel('maximum-entropy-inference', 'emerges-from',
          '熵不确定性关系把这条界重写成两个共轭表象下熵之和的下界，于是它成为最大熵推断的一个推论，而不是一条独立公理。',
          'The entropic uncertainty relations restate the bound as a floor on the sum of entropies in the two conjugate representations, making it a corollary of maximum-entropy inference rather than an independent axiom.'),
      ],
      mistakenFor: bi(
        '最常被误当成"观测者效应"——测量扰动了被测对象。那是另一条结构（观测反作用），需要另一条不等式。共轭不确定性讲的是态本身在两个表象下不能同时窄，即使根本不去测量也成立。',
        'Most often mistaken for the observer effect, where measurement disturbs the measured. That is a different structure with its own inequality. Conjugate uncertainty says the state itself cannot be narrow in both representations, and holds whether or not anyone measures.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/no-free-lunch',
    depth: {
      origin: bi(
        '1997 年由 Wolpert 与 Macready 为优化算法给出，随后被推广到监督学习与搜索；它的形式化前提是在"所有可能目标函数"上取均匀分布。',
        'Given by Wolpert and Macready for optimisation in 1997 and later extended to supervised learning and search; its formal premise is a uniform distribution over all possible objective functions.',
      ),
      minimalForm: 'Σ_f P(结果 | 算法 a₁, f) = Σ_f P(结果 | 算法 a₂, f)',
      canonicalSubstrates: [
        sub('优化算法比较', 'Comparing optimisers', '运筹学', 'Operations research', 1,
          '一个优化器之所以在某类问题上好，全部来自它对该类问题结构的假设',
          'whatever makes an optimiser good on a class of problems comes entirely from its assumptions about that class',
          '真实问题从来不服从"所有函数上的均匀分布"，所以这条定理几乎从不用来否定某个优化器，它用来逼问"你假设了什么结构"。',
          'Real problems never follow a uniform distribution over all functions, so the theorem is almost never a refutation of an optimiser and is instead a demand that it state its structural assumption.'),
        sub('监督学习的归纳偏置', 'Inductive bias in supervised learning', '机器学习', 'Machine learning', 1,
          '架构、正则化与数据增强都是偏置的载体，模型的泛化能力全部住在这里',
          'architecture, regularisation and augmentation are all carriers of bias, and generalisation lives entirely in them',
          '"更少偏置的模型更通用"是这条定理的反面：偏置越少，能学好的问题类越窄而不是越宽。',
          'The idea that a less biased model is more general inverts the theorem: less bias narrows rather than widens the class of problems it can learn.'),
        sub('演化的适应度地形', 'Fitness landscapes in evolution', '演化生物学', 'Evolutionary biology', 0,
          '自然选择也没有免费午餐：它之所以有效，是因为真实地形有相关结构而非任意崎岖',
          'selection has no free lunch either: it works because real landscapes are correlated rather than arbitrarily rugged',
          '生物地形随环境与生态位构建而变，"问题分布"本身在动——静态定理只能作为下限论证，不能预测演化走向。',
          'Biological landscapes shift with the environment and with niche construction so the problem distribution itself moves, and a static theorem argues a floor rather than predicting where evolution goes.'),
      ],
      relations: [
        rel('impossibility-theorem', 'special-case-of',
          '"存在一个在所有问题上都不差于其它算法的算法"是一条被证否的要求，所以无免费午餐就是搜索与学习领域里的一条不可能性定理。',
          'That an algorithm exists which is never worse than others on every problem is a requirement proved false, which makes no free lunch an impossibility theorem for search and learning.'),
        rel('maximum-entropy-inference', 'explains',
          '既然性能全部来自偏置，问题就变成"该加哪一个"；最大熵给出的正是"在已知约束下加进去最少"的那个答案，所以它是无免费午餐逼出来的那个位置上的默认选项。',
          'If performance comes entirely from the bias, the question becomes which one to add, and maximum entropy answers with the one that adds least given what is known — the default at exactly the position no free lunch clears.'),
      ],
      mistakenFor: bi(
        '常被误当成"所有方法都一样好，所以选哪个无所谓"。它的意思恰恰相反：因为方法本身不带优势，选择偏置就成了唯一重要的决定，而这个决定必须被说出来才能被检验。',
        'Often mistaken for all methods being equally good so the choice does not matter. It means the opposite: because no method carries an advantage of its own, choosing the bias becomes the only decision that matters, and it has to be stated before it can be checked.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/impossibility-theorem',
    depth: {
      origin: bi(
        '1951 年由阿罗在社会选择理论中给出第一条广为人知的形式；1985 年 FLP 定理给出分布式共识的版本；2016 年起公平性度量的不可能性结果把同一形状带进算法伦理。',
        'Arrow gave the first widely known form in social choice in 1951, the FLP theorem gave the distributed-consensus version in 1985, and impossibility results for fairness metrics carried the same shape into algorithmic ethics from 2016.',
      ),
      minimalForm: '要求集合 {A₁…Aₙ} 不可同时满足；去掉任一 Aᵢ 后可行',
      canonicalSubstrates: [
        sub('阿罗不可能性定理', 'Arrow\'s impossibility theorem', '社会选择理论', 'Social choice theory', 0,
          '无限制定义域、帕累托、无关方案独立性、非独裁——四条合理要求无法同时满足',
          'unrestricted domain, Pareto, independence of irrelevant alternatives and non-dictatorship cannot hold together',
          '它管的是把序关系合成序关系；允许基数信息（强度而非仅排序）之后限制就松了，所以这不是"民主不可能"，是"只用排序不可能"。',
          'It governs aggregating orderings into an ordering, and admitting cardinal information loosens it, so this is not the impossibility of democracy but of doing it with rankings alone.'),
        sub('FLP 与 CAP', 'FLP and CAP', '分布式系统', 'Distributed systems', 1,
          '异步网络中不能同时保证一致、可用与分区容错，工程上的选择就是放弃哪一条',
          'consistency, availability and partition tolerance cannot all be guaranteed on an asynchronous network, and engineering is the choice of which to drop',
          '这些定理的前提是完全异步与确定性；加上时钟假设或允许概率性协议之后，实际系统在绝大多数时间里表现得像三条都成立。',
          'These theorems assume full asynchrony and determinism, and once timing assumptions or randomised protocols are allowed, real systems behave most of the time as if all three held.'),
        sub('公平性度量', 'Fairness metrics', '算法伦理', 'Algorithmic ethics', 2,
          '校准、等错误率与统计均等在基础率不同时无法同时满足，必须明说放弃哪一条',
          'calibration, equalised odds and demographic parity cannot hold together when base rates differ, so one must be given up explicitly',
          '"放弃哪一条"在这里不是技术选择而是价值选择，把它写成默认参数就是把一个政治判断藏进配置里。',
          'Which one to give up is a choice of values rather than of technique, and hiding it in a default parameter buries a political judgement in configuration.'),
      ],
      relations: [
        rel('two-error-tradeoff', 'generates',
          '"既不漏报也不误报"就是这类定理的最小实例：两条单独合理的要求，在没有额外信息时被证明不可同时满足，而阈值就是那条"你放弃哪一边"的旋钮。',
          'Wanting neither misses nor false alarms is the minimal instance: two individually reasonable requirements proved jointly unsatisfiable without extra information, with the threshold as the knob for which side you give up.'),
        rel('aggregating-independent-judgements', 'explains',
          '阿罗式结果说明为什么把多个独立判断合成一个总判断必然要放弃某条要求——所以聚合方法的争论从来不是技术问题，是"放弃哪一条"的问题。',
          'Arrow-type results explain why aggregating several independent judgements into one necessarily gives up a requirement, which is why disputes over aggregation methods are never technical but always about which requirement goes.'),
      ],
      mistakenFor: bi(
        '常被误当成"所以做不到"。一条不可能性定理真正有信息量的部分是它的前提集合：几乎所有这类定理都在放宽任一条要求后变得可行，所以引用它的正确方式是说出你打算放弃哪一条。',
        'Often reduced to it therefore being impossible. The informative part of such a theorem is its premise set: nearly all of them become feasible once any single requirement is relaxed, so the right way to cite one is to say which requirement you intend to drop.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/two-error-tradeoff',
    depth: {
      origin: bi(
        '1928 年由 Neyman 与 Pearson 在假设检验中区分两类错误；二战期间雷达研究把它做成 ROC 曲线，此后被诊断医学、信号检测与风控各自继承。',
        'Neyman and Pearson separated the two errors in hypothesis testing in 1928, wartime radar work turned it into the ROC curve, and diagnostic medicine, signal detection and risk control each inherited it afterwards.',
      ),
      minimalForm: '沿 ROC 曲线移动阈值：TPR 与 FPR 同增同减；曲线位置由可分性决定',
      canonicalSubstrates: [
        sub('诊断检验', 'A diagnostic test', '临床医学', 'Clinical medicine', 0,
          '把阈值往下调多查出病人，也多把健康人判成病人',
          'lowering the cut-off finds more patients and also labels more healthy people as ill',
          '两类错误的代价在这里极不对称且随疾病而变，所以"最优阈值"不是统计问题——它需要一个关于代价的外部判断。',
          'The two errors cost very differently and the ratio changes with the disease, so the optimal cut-off is not a statistical question and needs an external judgement about cost.'),
        sub('安检', 'Security screening', '安全工程', 'Security engineering', 1,
          '漏检一件危险品与误报一次的比率，被阈值直接决定',
          'the ratio of missed threats to false alarms set directly by the threshold',
          '基础率极低时误报绝对数会淹没真报，即使误报率看起来很小——这里必须看阳性预测值而不是误报率。',
          'With a very low base rate the absolute number of false alarms swamps the true ones even at a small false-alarm rate, so what matters here is the positive predictive value rather than the rate.'),
        sub('免疫系统的自我判别', 'Self-recognition in the immune system', '免疫学', 'Immunology', 2,
          '放过病原与攻击自身之间的那条线，由胸腺选择的严格程度设定',
          'the line between letting a pathogen through and attacking the self, set by how strict thymic selection is',
          '这里的"可分性"本身在变：自身抗原随发育和微生物组改变，所以这条前沿不是固定曲线而是被持续重标定的。',
          'Separability here is itself moving, since self-antigens change with development and the microbiome, so this frontier is not a fixed curve but one continuously recalibrated.'),
        sub('同行评议', 'Peer review', '科学元研究', 'Metascience', 0,
          '收紧标准少放过坏论文，也多拒掉好论文',
          'a stricter bar lets fewer bad papers through and also rejects more good ones',
          '这里没有可独立获得的真值：一篇论文"本该被接受"只能靠后续引用或复现间接推断，所以两类错误率本身难以测量。',
          'There is no independently available ground truth: whether a paper should have been accepted can only be inferred later from citation or replication, so the two error rates are themselves hard to measure.'),
      ],
      relations: [
        rel('impossibility-theorem', 'special-case-of',
          '它是不可能性定理的最小可操作版本：两条要求单独都合理、无额外信息时不可同时满足，而阈值就是"放弃哪一条"的连续旋钮。',
          'It is the minimal operational version of an impossibility theorem: two individually reasonable requirements that cannot both hold without extra information, with the threshold as a continuous knob for which one gives.'),
        rel('fisher-precision-limit', 'emerges-from',
          '整条前沿的位置由两个假设下分布的可分性决定，而可分性正是费雪信息度量的东西——所以要真正前进，必须换来新的独立信息，而不是换一条判定规则。',
          'Where the whole frontier sits is set by how separable the two hypotheses are, and separability is what Fisher information measures — so real progress requires new independent information rather than a new decision rule.'),
      ],
      mistakenFor: bi(
        '常被误当成"提高准确率"。准确率是两类错误按基础率加权的和，在基础率极端时它可以很高而两类错误都很糟。真正该报的是两个错误率各自的值，以及曲线本身有没有移动。',
        'Often mistaken for improving accuracy. Accuracy is the two errors weighted by the base rate, and at an extreme base rate it can look excellent while both errors are bad. What should be reported is each error rate separately, and whether the curve itself moved.',
      ),
    },
  },
];
