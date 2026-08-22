import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureQuantity, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the information-and-coding family.
 *
 * The family where the cross-disciplinary claims are least metaphorical,
 * because information theory was built to be substrate-independent and then
 * turned out to describe things nobody had it in mind for. Two pairs here are
 * the same inequality read from opposite sides.
 *
 * Error-correcting codes and template copying error: codes say reliable
 * recovery is possible while the minimum distance exceeds the corruption, and
 * the error threshold says a lineage melts once mutation exceeds what
 * proofreading corrects. Eigen's error threshold is a channel-capacity
 * statement — the genome is a message crossing a noisy channel and mutation is
 * the noise — which is why the same bound governs a magnetic tape and a virus.
 *
 * Recursive Bayesian filtering and variational free energy: the Kalman filter
 * is not like variational inference, it IS exact variational inference for the
 * linear-Gaussian case, and its gain balances model against observation by
 * their precisions, which are Fisher informations.
 *
 * One `competes-with` is worth the field. Sparse coding and maximum entropy are
 * rival principles for the same underdetermined problem: infinitely many
 * signals fit the measurements, and one picks the least committal while the
 * other picks the sparsest. They frequently disagree, and which is right is a
 * claim about the world rather than about inference.
 *
 * Seven of the eight predate wave 4 and get their declared quantities here,
 * which settles nothing about their existing mappings' renderings. Same terms
 * otherwise: textbook knowledge, no island referenced, no mapping touched.
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

export const INFORMATION_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/shannon-entropy',
    quantities: [
      q('熵 H', 'entropy H', '一个来源的不确定度，也是它能被压缩到的最短平均长度', 'a source\'s uncertainty, and equally the shortest average length it compresses to'),
      q('信道容量 C', 'channel capacity C', '一条噪声通道上可靠传输速率的硬上界', 'the hard ceiling on the rate at which a noisy channel carries information reliably'),
      q('互信息 I(X;Y)', 'mutual information I(X;Y)', '收到 Y 之后关于 X 的不确定度减少了多少', 'how much uncertainty about X the receipt of Y removes'),
    ],
    depth: {
      origin: bi(
        '1948 年由 Claude Shannon 在一篇论文里同时给出压缩极限与信道容量；他刻意把"意义"排除在外，而正是这一步让同一套结论适用于电话线、基因组与语言。',
        'Given by Claude Shannon in one 1948 paper, which set both the compression limit and the channel capacity; he deliberately excluded meaning, and that exclusion is what let the same results apply to telephone lines, genomes and language alike.',
      ),
      minimalForm: 'H = −Σ p·log p ;  C = max_p I(X;Y)',
      canonicalSubstrates: [
        sub('通信信道', 'A communication channel', '通信工程', 'Communications engineering', 1,
          '带宽与信噪比共同决定这条线上可靠传输的速率上限',
          'bandwidth and signal-to-noise together fixing the reliable rate on the line',
          '容量是渐近可达的：达到它需要任意长的码字与任意大的延迟，所以实际系统总在容量以下，差距由可接受的延迟决定。',
          'Capacity is asymptotically achievable, needing arbitrarily long codewords and arbitrary delay, so a real system always runs below it and the gap is set by how much latency is tolerable.'),
        sub('遗传密码', 'The genetic code', '分子生物学', 'Molecular biology', 2,
          '密码子与氨基酸之间的互信息，度量这套编码传递了多少特异性',
          'the mutual information between codon and amino acid, measuring how much specificity the encoding carries',
          '生物信息还要经过折叠与调控才产生功能，而这几步不是无损的——所以序列层面的信息量是功能的上界而非度量。',
          'Biological information passes through folding and regulation before it becomes function and those steps are lossy, so information at the sequence level bounds function rather than measuring it.'),
        sub('语言', 'Language', '语言学', 'Linguistics', 0,
          '自然语言的熵率远低于其字母表所允许，冗余正是它能在噪声中被听懂的原因',
          'the entropy rate of natural language falling far below what its alphabet allows, with the redundancy being why it survives noise',
          'Shannon 的估计基于英文字母序列，而语义与语境提供的预测力远超字符统计——单看符号层会低估语言的冗余来源。',
          'Shannon estimated from letter sequences while semantics and context predict far better than character statistics do, so looking only at symbols mislocates where language\'s redundancy comes from.'),
        sub('神经编码', 'Neural coding', '神经科学', 'Neuroscience', 2,
          '刺激与放电序列之间的互信息，给出这群神经元最多能传递多少感觉信息',
          'the mutual information between stimulus and spike train, bounding how much sensory information the population can carry',
          '互信息不区分"被传递"与"被使用"：下游能读出多少取决于解码器，而神经系统实际用的解码器通常未知。',
          'Mutual information does not separate carried from used: how much a downstream area extracts depends on its decoder, and the decoder the nervous system actually uses is usually unknown.'),
      ],
      relations: [
        rel('error-correcting-redundancy', 'explains',
          '噪声信道编码定理说的正是：只要速率低于容量，就存在能把错误率压到任意小的码。所以纠错码不是一个巧妙发明，是容量这条界给出的存在性结论的构造性一半。',
          'The noisy-channel coding theorem says exactly that below capacity a code exists driving the error rate arbitrarily low, which makes error-correcting codes not a clever invention but the constructive half of an existence result the capacity bound already gave.'),
        rel('assembly-description-length', 'explains',
          '熵就是一个来源可被压缩到的最短平均长度，所以"压得越短理解得越好"这句话有一个精确的底：压不过熵。最小描述长度以压缩作为模型选择判据，正是把这条界当成尺子在用。',
          'Entropy is the shortest average length a source compresses to, which puts a precise floor under the idea that compressing better means understanding better: you cannot beat the entropy. Minimum description length uses compression as a model-selection criterion by treating that bound as a ruler.'),
      ],
      mistakenFor: bi(
        '常被误当成"信息量等于重要性"。Shannon 刻意把意义排除在外：一串随机噪声的熵高于一部小说，因为熵度量的是不可预测性而不是价值。用它论证某条消息"信息量大所以重要"，是在用一个明确拒绝谈论意义的量去谈意义。',
        'Often mistaken for information meaning importance. Shannon excluded meaning on purpose: random noise has higher entropy than a novel, because entropy measures unpredictability rather than worth. Using it to argue a message matters because it carries much information uses a quantity that explicitly declines to discuss meaning to discuss meaning.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/error-correcting-redundancy',
    quantities: [
      q('码字最小距离 d', 'minimum distance d', '任意两个合法码字之间的差异下限；它单独决定能纠几个错', 'the smallest difference between any two valid codewords, which alone decides how many errors can be corrected'),
      q('冗余率', 'redundancy rate', '为纠错付出的额外符号占比，也就是速率的损失', 'the share of extra symbols spent on correction, which is the rate given up'),
      q('可纠错数 t', 'correctable errors t', '满足 d ≥ 2t+1 时能唯一还原的错误个数', 'how many errors still permit unique recovery, given d ≥ 2t+1'),
    ],
    depth: {
      origin: bi(
        '1950 年由 Richard Hamming 提出，动机很实际：他的程序在周末批处理里因一个位翻转而全部作废，而机器只会报错不会修。',
        'Introduced by Richard Hamming in 1950 for an entirely practical reason: his weekend batch jobs were being thrown away over a single flipped bit, and the machine could report the error without fixing it.',
      ),
      minimalForm: 'd ≥ 2t + 1 ⇒ 可唯一纠正 t 个错误',
      canonicalSubstrates: [
        sub('存储与传输', 'Storage and transmission', '计算机工程', 'Computer engineering', 0,
          '把信息摊到冗余位置上，只要错误数不超过 t 就能唯一还原',
          'spreading information over redundant positions so that up to t errors still recover uniquely',
          '这条界假设错误是独立随机的；突发错误（一整块损坏）会一次超过 t，所以实际系统要先交织再编码。',
          'The bound assumes independent random errors, while a burst — one whole region damaged — exceeds t at a stroke, which is why real systems interleave before coding.'),
        sub('DNA 的校对与修复', 'Proofreading and repair in DNA', '分子生物学', 'Molecular biology', 1,
          '双链互补本身就是一份冗余副本，修复酶据此还原被损坏的一条',
          'the complementary strand being a redundant copy from which repair enzymes restore the damaged one',
          '双链同时受损时冗余失效，而这正是电离辐射最危险的地方——冗余只防它被设计来防的那种错误。',
          'Redundancy fails when both strands are damaged at once, which is exactly what makes ionising radiation dangerous: redundancy protects only against the error it was built for.'),
        sub('自然语言的冗余', 'Redundancy in natural language', '语言学', 'Linguistics', 2,
          '英文约一半的字母是可预测的，所以在嘈杂环境里漏听几个音仍能还原',
          'about half the letters of English being predictable, so missing a few sounds in noise still recovers the message',
          '语言的冗余不是为纠错设计的，它是历史演化的副产品——所以它的分布很不均匀，功能词比内容词冗余得多。',
          'Language redundancy was not designed for correction and is a by-product of historical change, so it is distributed very unevenly, with function words carrying far more of it than content words.'),
      ],
      relations: [
        rel('template-copying-error', 'explains',
          '它解释了错误阈值为什么存在：只要每次复制的错误数不超过校对能纠的量，信息就能无限维持；一旦超过，纠错本身失效而信息整体熔毁——阈值不是渐变的边界，是 d ≥ 2t+1 失效的那一点。',
          'It explains why an error threshold exists at all: while errors per copy stay within what proofreading corrects, information persists indefinitely, and once they exceed it the correction itself fails and the information melts. The threshold is not a gradual edge but the point at which d ≥ 2t+1 stops holding.'),
        rel('robustness-efficiency-tradeoff', 'special-case-of',
          '冗余买抗扰、精简买速率，纠错码是这条取舍被算清楚的那个特例：给定信道，冗余率与可纠错数之间的兑换比不是偏好问题，而是有精确解的。',
          'Redundancy buys tolerance and leanness buys rate, and coding is the case where that trade has been computed: for a given channel the exchange between redundancy and correctable errors is not a matter of preference but has an exact answer.'),
      ],
      mistakenFor: bi(
        '常被误当成"多存几份备份"。重复三份是最差的一种码：同样的冗余率下，设计过的码能纠正多得多的错误。这条结构的内容在最小距离而不在份数——不看距离只数备份，是在用最贵的方式买最少的可靠性。',
        'Often mistaken for keeping more copies. Triplication is the worst possible code: at the same redundancy a designed code corrects far more errors. The content is in the minimum distance rather than the number of copies, and counting backups without looking at distance buys the least reliability at the highest price.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/template-copying-error',
    depth: {
      origin: bi(
        '1971 年由 Manfred Eigen 为分子演化给出"错误阈值"：一个复制子能维持的基因组长度与其每位错误率成反比，超过就熔毁。这条界后来被反过来用作对最早生命形态长度的约束。',
        'Manfred Eigen gave the error threshold for molecular evolution in 1971: the genome length a replicator can maintain varies inversely with its per-site error rate, and beyond it the information melts. The bound was later run backwards as a constraint on how long the earliest replicators could have been.',
      ),
      minimalForm: 'L · μ < 1 时信息可维持；超过则整体熔毁而非按比例劣化',
      canonicalSubstrates: [
        sub('基因组复制', 'Genome replication', '分子演化', 'Molecular evolution', 0,
          '每位错误率与基因组长度的乘积必须小于一，否则序列信息整体丢失',
          'the product of per-site error rate and genome length staying below one, or the sequence information is lost as a whole',
          '这条界假设适应度地形单峰且无中性网络；真实地形上有大片中性区域，实际可维持的长度比朴素阈值给的长。',
          'The bound assumes a single-peaked landscape with no neutral networks, while real landscapes have large neutral regions and the maintainable length exceeds the naive threshold.'),
        sub('RNA 病毒与致死突变', 'RNA viruses and lethal mutagenesis', '病毒学', 'Virology', 2,
          'RNA 病毒本就贴着阈值运行，药物只需把错误率再推高一点就能让种群熔毁',
          'RNA viruses running close to the threshold already, so a drug need only raise the error rate slightly to melt the population',
          '这一策略在体外清楚、在体内常失败：病毒种群巨大且异质，少数低突变率的变体足以逃逸。',
          'The strategy is clean in vitro and often fails in vivo: viral populations are vast and heterogeneous, and a minority of lower-mutation variants suffices to escape.'),
        sub('抄本传播', 'Manuscript transmission', '文献学', 'Textual criticism', 1,
          '每一代抄写引入的错误与校勘投入之间的平衡，决定文本能传多少代仍可辨',
          'the balance between errors introduced per copying generation and the effort spent collating, deciding how many generations a text stays legible',
          '抄写错误不是随机的：抄手会"修正"他认为的错误，于是错误有方向性，而这恰恰使谱系可以被重建。',
          'Scribal error is not random — a copyist corrects what he takes to be mistakes — so errors carry direction, and that is precisely what makes a stemma reconstructable.'),
        sub('模型蒸馏', 'Model distillation', '机器学习', 'Machine learning', 0,
          '用模型输出训练下一代模型，每一轮引入的偏差在多轮后累积',
          'training each generation on the previous one\'s output, with the bias introduced each round accumulating over several',
          '这里的"错误"是分布偏移而非位翻转，且没有校对机制可用——所以熔毁表现为多样性坍塌而不是随机化。',
          'The error here is distribution shift rather than a flipped bit and no proofreading exists, so the melt shows up as collapsing diversity rather than as randomisation.'),
      ],
      relations: [
        rel('shannon-entropy', 'emerges-from',
          '错误阈值本质上是一条信道容量陈述：基因组是穿过噪声信道的消息，突变是噪声，而能被可靠维持的长度就是这条信道的容量——同一条界因此同时管着磁带与病毒。',
          'The error threshold is a channel-capacity statement: the genome is a message crossing a noisy channel, mutation is the noise, and the length that can be reliably maintained is that channel\'s capacity — which is why one bound governs a magnetic tape and a virus alike.'),
        rel('deep-time-accumulation', 'generates',
          '未被校对的误差不衰减地累积，所以在单代上完全可忽略的错误率，在足够多代之后决定信息还剩不剩——复制误差是深时累积作用在信息上的形式。',
          'Uncorrected error accumulates without decaying, so a rate wholly negligible in one generation decides whether any information remains after enough of them: copying error is deep-time accumulation acting on information.'),
      ],
      mistakenFor: bi(
        '常被误当成"突变率越低越好"。零错误率意味着无变异因而无法适应，所以真实系统停在一个由环境变化速度决定的中间值上。这条结构给的是上界不是目标，而把它读成目标会得出"应该尽量提高保真度"这个在演化上错误的建议。',
        'Often mistaken for lower mutation being better. A zero error rate means no variation and so no adaptation, and real systems sit at an intermediate value set by how fast the environment changes. The structure gives a ceiling rather than a target, and reading it as a target yields the evolutionarily wrong advice that fidelity should be maximised.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/sparse-coding-compressed-sensing',
    quantities: [
      q('稀疏度 k', 'sparsity k', '信号在某组基下真正非零的分量个数', 'how many components of the signal are actually non-zero in some basis'),
      q('测量数 m', 'number of measurements m', '欠定方程的行数；m 远小于维数仍可恢复正是全部内容', 'the rows of the underdetermined system, and that m far below the dimension still recovers is the whole content'),
      q('不相干性', 'incoherence', '测量与稀疏基之间的不对齐程度，它决定恢复是否有保证', 'how misaligned the measurements are with the sparse basis, which decides whether recovery is guaranteed'),
    ],
    depth: {
      origin: bi(
        '2004 年由 Candès、Romberg、Tao 与 Donoho 给出：若信号确实稀疏且测量足够不相干，用 L1 最小化可以从远低于奈奎斯特的采样中精确恢复——这颠覆了"采样必须密到两倍带宽"这条工程常识。',
        'Given in 2004 by Candès, Romberg, Tao and Donoho: if a signal really is sparse and the measurements incoherent enough, L1 minimisation recovers it exactly from far below the Nyquist rate — overturning the engineering commonplace that sampling must reach twice the bandwidth.',
      ),
      minimalForm: 'min ‖x‖₁ s.t. y = Φx，在 RIP 条件下精确恢复',
      canonicalSubstrates: [
        sub('医学成像', 'Medical imaging', '医学影像', 'Medical imaging', 1,
          '磁共振采集的 k 空间点数被大幅削减，扫描时间随之缩短',
          'far fewer k-space samples collected in MRI, cutting scan time in proportion',
          '稀疏性是在某个变换域里成立的假设，选错变换就没有稀疏性——而"这幅图在小波域稀疏"这件事本身通常没有独立验证。',
          'Sparsity is an assumption in some transform domain and the wrong transform has none, while the claim that this image is sparse in wavelets is usually not independently verified.'),
        sub('稀疏字典与视觉皮层', 'Sparse dictionaries and visual cortex', '计算神经科学', 'Computational neuroscience', 0,
          '自然图像在少数基元上稀疏表示，而学出来的基元与 V1 感受野形状相似',
          'natural images represented sparsely over a few primitives, with the learned primitives resembling V1 receptive fields',
          '形状相似不等于机制相同：多种优化目标都能学出类 Gabor 的基元，所以这条相似性对"皮层在做稀疏编码"的支持比通常引用的弱。',
          'A resemblance of shape is not a sameness of mechanism: several objectives learn Gabor-like primitives, so the similarity supports the claim that cortex does sparse coding less strongly than it is usually cited to.'),
        sub('稀疏回归发现方程', 'Sparse regression for governing equations', '应用数学', 'Applied mathematics', 2,
          '从候选项库里选出真正非零的少数项，重建控制方程',
          'selecting the few genuinely non-zero terms from a candidate library to reconstruct a governing equation',
          '候选库不含真项时，方法会用一组错项拟合出漂亮的稀疏解——稀疏性保证的是简洁而不是正确。',
          'If the library omits the true term the method fits a tidy sparse solution out of wrong ones: sparsity guarantees parsimony rather than correctness.'),
      ],
      relations: [
        rel('maximum-entropy-inference', 'competes-with',
          '同一个欠定问题有无穷多个解，最大熵挑"加进去最少"的那个，稀疏编码挑"非零项最少"的那个——两者经常给出不同的答案，而哪个对是关于世界的断言（信号真的稀疏吗）而不是关于推断的偏好。',
          'One underdetermined problem has infinitely many solutions; maximum entropy picks the least committal and sparse coding picks the one with fewest non-zeros. They frequently disagree, and which is right is a claim about the world — whether the signal really is sparse — rather than a preference about inference.'),
        rel('error-correcting-redundancy', 'emerges-from',
          '压缩感知的恢复保证与纠错码的最小距离出自同一类条件：测量矩阵的不相干性扮演码字距离的角色，保证不同的稀疏信号不会被投影到同一处。',
          'The recovery guarantees of compressed sensing and the minimum distance of a code come from one family of conditions: incoherence of the measurement matrix plays the role of codeword separation, ensuring two different sparse signals do not project to the same place.'),
      ],
      mistakenFor: bi(
        '常被误当成"采样定理错了"。奈奎斯特界对带限信号仍然成立，压缩感知换的是前提：它要求信号在某组基下稀疏，而这是一个额外的、需要独立验证的假设。少了这一步，低于奈奎斯特的采样只是欠采样。',
        'Often mistaken for the sampling theorem being wrong. Nyquist still holds for band-limited signals, and compressed sensing changes the premise: it requires the signal to be sparse in some basis, which is an extra assumption needing independent support. Without that step, sampling below Nyquist is simply undersampling.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/recursive-bayesian-filter',
    quantities: [
      q('状态的充分统计量', 'sufficient statistics of the state', '把全部历史压缩成的那一小组数；记忆不必保留历史', 'the small set of numbers the whole history compresses to, so memory need not keep the history'),
      q('预测步', 'the prediction step', '按模型把状态推到下一时刻，不确定度随之增大', 'pushing the state forward by the model, with uncertainty growing as it goes'),
      q('增益', 'the gain', '相信模型还是相信观测，由两者的精度之比决定', 'whether to trust the model or the observation, set by the ratio of their precisions'),
    ],
    depth: {
      origin: bi(
        '1960 年由 Rudolf Kálmán 给出线性高斯情形的递推解；阿波罗导航是它第一次大规模实用，而那也是"用一台内存极小的机器维持一个最新估计"这个约束最尖锐的场合。',
        'Rudolf Kálmán gave the recursive solution for the linear-Gaussian case in 1960, and Apollo navigation was its first large-scale use — also the sharpest instance of the constraint it answers, keeping a current estimate on a machine with almost no memory.',
      ),
      minimalForm: 'x̂ₖ = x̂ₖ⁻ + Kₖ(zₖ − Hx̂ₖ⁻)',
      canonicalSubstrates: [
        sub('惯性导航', 'Inertial navigation', '航天工程', 'Aerospace engineering', 0,
          '陀螺与加速度计的积分漂移，被稀疏的外部定位不断拉回',
          'the drift of integrated gyroscopes and accelerometers repeatedly pulled back by sparse external fixes',
          '滤波器假设噪声高斯且模型正确；一个未建模的系统性偏差不会被增益纠正，反而会被当作真实状态吸收进去。',
          'The filter assumes Gaussian noise and a correct model, and an unmodelled systematic bias is not corrected by the gain but absorbed as if it were real state.'),
        sub('气象资料同化', 'Meteorological data assimilation', '气象学', 'Meteorology', 1,
          '预报模式把状态推到下一时刻，观测到达时按精度加权修正',
          'the forecast model pushing the state forward and observations correcting it on arrival, weighted by precision',
          '大气是强非线性的，所以实用的是集合卡尔曼与变分方法；线性高斯的最优性在这里只是近似，误差协方差本身要被估计。',
          'The atmosphere is strongly non-linear so ensemble and variational methods are what get used; linear-Gaussian optimality is an approximation here and the error covariance itself has to be estimated.'),
        sub('感知作为预测', 'Perception as prediction', '神经科学', 'Neuroscience', 2,
          '先验与感觉证据按各自可靠性加权，这与增益的形式一致',
          'prior and sensory evidence weighted by their reliabilities, which has the form of the gain',
          '行为上的加权与卡尔曼增益形式一致，并不说明神经系统在做卡尔曼滤波——许多不同的机制都能产出同样的加权行为。',
          'Behavioural weighting matching the form of the gain does not establish that the nervous system runs a Kalman filter: many different mechanisms produce the same weighting.'),
      ],
      relations: [
        rel('variational-free-energy', 'special-case-of',
          '卡尔曼滤波不是"像"变分推断：在线性高斯情形下它就是精确的变分推断，候选分布 q 取高斯族时上界取到等号。差别只在这个特例里近似不损失任何东西。',
          'The Kalman filter is not like variational inference: in the linear-Gaussian case it is exact variational inference, with the bound attained when q is taken in the Gaussian family. The only difference is that in this special case the approximation loses nothing.'),
        rel('fisher-precision-limit', 'emerges-from',
          '增益的取值就是模型精度与观测精度之比，而精度正是费雪信息——所以"该信谁"这个看起来需要判断的问题，在这里有一个由信息量给出的确定答案。',
          'The gain is the ratio of model precision to observation precision, and precision is Fisher information — so what looks like a judgement about whom to trust has a determinate answer set by how much information each carries.'),
      ],
      mistakenFor: bi(
        '常被误当成"平滑滤波"。它不是在磨平噪声，而是在维持一个后验分布：输出既有均值也有不确定度，而后者才是它与滑动平均的根本区别。只用均值不看协方差，等于把这条结构最有用的那一半丢掉。',
        'Often mistaken for a smoothing filter. It does not sand off noise; it maintains a posterior, so the output carries an uncertainty as well as a mean, and that second part is what distinguishes it from a moving average. Using the mean and ignoring the covariance discards the more useful half.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/covariate-shift-transfer',
    quantities: [
      q('输入分布之差 P(x)', 'the shift in P(x)', '源域与目标域在输入上的差异', 'how the input distribution differs between source and target'),
      q('条件关系 P(y|x)', 'the conditional P(y|x)', '被假设不变的那一项；它变了，重加权就救不回来', 'the term assumed invariant, and if it moves reweighting cannot recover it'),
      q('重要性权重', 'importance weights', '按目标域与源域密度之比修正训练样本', 'correcting training samples by the ratio of target to source density'),
    ],
    depth: {
      origin: bi(
        '2000 年由 Shimodaira 形式化协变量漂移与重要性加权；它把"迁移能不能成"这个模糊问题变成一个可写下来的条件：什么变了、什么没变。',
        'Formalised by Shimodaira in 2000 as covariate shift with importance weighting, turning the vague question of whether transfer will work into a writable condition: what changed and what did not.',
      ),
      minimalForm: 'P_S(y|x) = P_T(y|x) 且 P_S(x) ≠ P_T(x) ⇒ 可重加权',
      canonicalSubstrates: [
        sub('医学模型跨院部署', 'Deploying a clinical model across hospitals', '临床信息学', 'Clinical informatics', 0,
          '两家医院的病人构成不同，而"这些指标意味着什么"被假设相同',
          'two hospitals with different patient mixes, while what the measurements mean is assumed the same',
          '这个假设常常不成立：不同医院的检验流程与记录习惯会改变 P(y|x) 本身，此时重加权不仅无效还会放大偏差。',
          'That assumption frequently fails: differing laboratory procedures and recording habits change P(y|x) itself, and reweighting then not only fails but amplifies the bias.'),
        sub('仿真到真实', 'Simulation to reality', '机器人学', 'Robotics', 2,
          '在仿真里训练、在真机上部署，用域随机化把权重摊平',
          'training in simulation and deploying on hardware, with domain randomisation flattening the weights',
          '域随机化解决的是覆盖问题而非条件不变问题：仿真里不存在的物理（接触、磨损）不会因为随机化就出现。',
          'Domain randomisation addresses coverage rather than conditional invariance: physics absent from the simulator, such as contact and wear, does not appear because the inputs were randomised.'),
        sub('跨人群外推', 'Extrapolating across populations', '流行病学', 'Epidemiology', 1,
          '一项在某人群做出的效应估计能否搬到另一人群，取决于效应修饰因子是否分布不同',
          'whether an effect estimated in one population transports to another, depending on how effect modifiers are distributed',
          '这一步需要明确写出哪些变量是效应修饰因子，而这份清单本身来自领域知识而非数据——迁移的可信度上限就是这份清单的可信度。',
          'This requires naming which variables modify the effect, and that list comes from domain knowledge rather than from data, so the credibility of the transfer is capped by the credibility of the list.'),
      ],
      relations: [
        rel('no-free-lunch', 'emerges-from',
          '迁移之所以可能，全部来自"某样东西不变"这个假设；无免费午餐说的正是性能只能来自这类假设。所以"这个模型泛化能力强"这句话，只有在说出它假设了什么不变之后才有内容。',
          'Transfer is possible only because something is assumed invariant, and no free lunch says performance can come from nothing else. A claim that a model generalises well therefore has content only once it states what it assumes stays fixed.'),
        rel('selection-bias-absence', 'special-case-of',
          '协变量漂移就是选择偏差换个说法：训练集是部署分布的一个非随机样本。区别只在这里的选择机制通常已知（我们知道数据从哪来），所以可以重加权，而一般的选择偏差里它是未知的。',
          'Covariate shift is selection bias by another name: the training set is a non-random sample of the deployment distribution. The difference is only that the selection mechanism is usually known here — we know where the data came from — which is why reweighting is available at all.'),
      ],
      mistakenFor: bi(
        '常被误当成"数据不够多样"。多样性不解决条件关系变化：如果目标域里同样的输入对应不同的输出，再多的源域数据也搬不过去。判据是 P(y|x) 变没变，而这一项恰恰无法只从源域数据判断。',
        'Often mistaken for insufficiently diverse data. Diversity does not address a changed conditional: if the same input maps to a different output in the target domain, no amount of source data transfers. The test is whether P(y|x) moved, and that is precisely what source data alone cannot tell you.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/transitive-link-prediction',
    quantities: [
      q('已记录的边', 'the recorded edges', '文献或图谱里真的被写下来的关联', 'the associations actually written down in the literature or the graph'),
      q('传递闭包里的缺边', 'the missing edge in the transitive closure', 'A→B 与 B→C 都有而 A→C 没有的那一条', 'the A→C that is absent while A→B and B→C are present'),
      q('缺席的原因', 'why it is absent', '没人连过，还是连过并被否定——这两者在图上长得一样', 'nobody looked, or somebody looked and ruled it out, which look identical in the graph'),
    ],
    depth: {
      origin: bi(
        '1986 年由 Don Swanson 提出 ABC 模型：他从"雷诺氏病—血液黏度"与"血液黏度—鱼油"两组彼此不引用的文献里推出鱼油可能治疗雷诺氏病，随后被临床证实。',
        'Don Swanson posed the ABC model in 1986, deriving from two literatures that never cited each other — Raynaud\'s disease with blood viscosity, and blood viscosity with fish oil — that fish oil might treat Raynaud\'s, which was afterwards clinically confirmed.',
      ),
      minimalForm: 'A→B ∧ B→C ∧ ¬(A→C) ⇒ A→C 是一条可检验的假说',
      canonicalSubstrates: [
        sub('文献发现', 'Literature-based discovery', '生物医学信息学', 'Biomedical informatics', 1,
          '两个互不引用的文献群之间的中间概念，指出一条从未被写下的联系',
          'the intermediate concept between two literatures that never cite each other, pointing at a link nobody wrote down',
          '传递性在语义上不总成立："相关"不是传递关系，所以候选边数量巨大而真阳性极稀——这条方法的产出率历来很低。',
          'Transitivity does not hold semantically — being associated is not a transitive relation — so candidates are vast and true positives very rare, and the method\'s yield has always been low.'),
        sub('知识图谱补全', 'Knowledge-graph completion', '人工智能', 'Artificial intelligence', 0,
          '嵌入模型从已记录的边学出规则，为缺失的边打分',
          'an embedding model learning rules from recorded edges and scoring the missing ones',
          '训练与评测都在同一份不完整的图上，所以被评为"错"的预测可能只是还没被记录——这类评测系统性地惩罚正确的新发现。',
          'Training and evaluation both run on one incomplete graph, so a prediction scored wrong may merely be unrecorded, and such evaluation systematically penalises correct novelty.'),
        sub('药物重定位', 'Drug repurposing', '药理学', 'Pharmacology', 2,
          '已知药物—靶点与靶点—疾病两段，推出药物—疾病这条未被试过的连接',
          'known drug-target and target-disease legs implying an untried drug-disease link',
          '很多这样的连接没被写下来是因为试过而无效，只是阴性结果未发表——所以"缺席"在这里同时是机会与已知失败的混合。',
          'Many such links are unwritten because they were tried and failed with the null result unpublished, so absence here mixes opportunity with known failure.'),
      ],
      relations: [
        rel('selection-bias-absence', 'emerges-from',
          '这条方法的全部风险在于"缺席"的含义：一条边不在图上，可能是没人连过，也可能是连过并被否定而阴性结果没发表。两者在图上完全一样，所以不为缺席建模就无法区分机会与已知失败。',
          'The whole risk sits in what absence means: an edge may be missing because nobody looked or because somebody did and the null result went unpublished. The two are indistinguishable in the graph, so without modelling absence there is no telling an opportunity from a known failure.'),
        rel('graph-laplacian-spectrum', 'emerges-from',
          '哪些缺边值得预测，取决于图的宏观结构：跨越两个弱连接社区的缺边信息量最大，而社区在哪由拉普拉斯谱给出——所以"该往哪儿找"是一个谱的问题。',
          'Which missing edges are worth predicting depends on the graph\'s macroscopic structure, since an edge bridging two weakly connected communities carries the most information and where those communities sit is read off the Laplacian spectrum — so where to look is a spectral question.'),
      ],
      mistakenFor: bi(
        '常被误当成"从数据里发现新知识"。它发现的是记录里的结构性空白，而空白既可能是尚未被人连起来的机会，也可能是被连过并否定后没有留下痕迹的失败。这条方法产出的是假说，其价值完全取决于随后的检验，而不在于候选的数量。',
        'Often mistaken for discovering new knowledge from data. What it finds is a structural gap in the record, and a gap is either an opportunity nobody has joined up or a failure that was joined up, ruled out and left no trace. The output is a hypothesis whose worth rests entirely on the test that follows rather than on how many candidates were produced.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/assembly-description-length',
    quantities: [
      q('最短描述长度', 'the shortest description', '能够重建这个对象的最短指令集；它是复杂度的定义而非估计', 'the shortest instruction set that rebuilds the object, which defines complexity rather than estimating it'),
      q('装配步数', 'assembly steps', '从基本部件造出它所需的最少组装操作数', 'the fewest assembly operations that build it from basic parts'),
      q('丰度', 'abundance', '这个对象出现了多少次；高复杂度加高丰度才排除偶然', 'how many copies exist, since only high complexity together with high abundance rules out chance'),
    ],
    depth: {
      origin: bi(
        '1960 年代由 Solomonoff、Kolmogorov 与 Chaitin 各自给出算法复杂度；2017 年后 Cronin 与 Walker 以"装配指数"把同一想法做成可在质谱上实测的量，用于地外生命探测。',
        'Algorithmic complexity was given independently by Solomonoff, Kolmogorov and Chaitin in the 1960s; after 2017 Cronin and Walker turned the same idea into assembly index, a quantity measurable on a mass spectrometer and aimed at detecting life beyond Earth.',
      ),
      minimalForm: 'a(x) = 最短装配路径步数 ≈ K(x) = min{|p| : U(p) = x}',
      canonicalSubstrates: [
        sub('生命探测', 'Life detection', '天体生物学', 'Astrobiology', 2,
          '装配指数高且丰度高的分子，几乎不可能靠随机化学反复造出来',
          'a molecule both high in assembly index and abundant being nearly impossible to make repeatedly by random chemistry',
          '判据依赖"没有非生物路径能高效造出它"这个否定命题，而未知的非生物化学永远无法被穷举——这与替代机制对照集的完备度是同一个问题。',
          'The criterion rests on the negative claim that no abiotic route makes it efficiently, and unknown abiotic chemistry cannot be enumerated — the same completeness problem the alternative-mechanism panel has.'),
        sub('模型选择', 'Model selection', '统计学', 'Statistics', 0,
          '把模型与残差一起编码，总长度最短的模型胜出',
          'coding the model together with its residuals and taking whichever gives the shortest total',
          '最短描述长度不可计算，实用的都是它的可算替身（BIC、压缩率）——这些替身的行为与理论量并不总一致。',
          'Minimum description length is uncomputable and what gets used are computable stand-ins such as BIC or a compressor\'s output, which do not always behave like the theoretical quantity.'),
        sub('科学定律', 'Scientific laws', '科学哲学', 'Philosophy of science', 0,
          '一条定律的价值在于它把大量观测压缩成很短的陈述',
          'a law\'s worth lying in how much observation it compresses into how short a statement',
          '压缩率不区分"发现了规律"与"记住了这批数据"：只有在留出数据上仍然压得短，压缩才等于理解。',
          'Compression does not separate finding a regularity from memorising this dataset: only compression that still holds on held-out data amounts to understanding.'),
      ],
      relations: [
        rel('no-free-lunch', 'emerges-from',
          '"选最短的那个"本身就是一条归纳偏置，而无免费午餐说明性能全部来自偏置。所以最小描述长度不是中立的模型选择原则，它是一个具体的、可以错的关于世界的赌注：真实规律倾向于短。',
          'Preferring the shortest is itself an inductive bias, and no free lunch says all performance comes from the bias. Minimum description length is therefore not a neutral selection principle but a specific and falsifiable bet about the world: that real regularities tend to be short.'),
        rel('open-set-recognition', 'explains',
          '把已见数据压得很短，对未见的东西什么都没说——一个短描述可以完美覆盖训练集而对新类别完全失效。所以压缩率不是完备性的证据，"以上皆非"这个出口必须另外留。',
          'Compressing what has been seen says nothing about what has not: a short description can cover the training set perfectly and fail entirely on a new class. Compression is therefore not evidence of completeness, and the exit for none of the above has to be left open separately.'),
      ],
      mistakenFor: bi(
        '常被误当成"简单即正确"的严格版。它说的是在给定的描述语言下最短，而换一种语言最短的对象就换一个——所谓的不变性只到一个常数为止，而现实中的比较往往就落在那个常数的量级里。',
        'Often mistaken for a rigorous version of simpler being truer. It says shortest in a given description language, and changing the language changes which object is shortest — the invariance holds only up to a constant, and real comparisons frequently sit inside the size of that constant.',
      ),
    },
  },
];
