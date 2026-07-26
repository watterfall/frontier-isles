import type { SeedStructure, StructureMapping } from './structures';

type Bilingual = { zh: string; en: string };
type Correspondence = {
  quantity: Bilingual;
  inThisSubstrate: Bilingual;
};

export interface Wave2StructurePatch {
  structureId: string;
  mappings: StructureMapping[];
}

const bi = (zh: string, en: string): Bilingual => ({ zh, en });

const correspondence = (
  quantityZh: string,
  quantityEn: string,
  substrateZh: string,
  substrateEn: string,
): Correspondence => ({
  quantity: bi(quantityZh, quantityEn),
  inThisSubstrate: bi(substrateZh, substrateEn),
});

const mapping = (
  slug: string,
  correspondences: Correspondence[],
  prediction: Bilingual,
  boundary: Bilingual,
  evidenceRefs: string[],
): StructureMapping => ({
  slug,
  correspondences,
  prediction,
  boundary,
  evidenceRefs,
});

const provenance = (recordIds: number[]) => ({
  source: 'xfrontier.science',
  url: 'https://xfrontier.science/',
  recordIds,
  reviewedAt: '2026-07-26',
});

const POWER_LAW_SOURCE = 'https://doi.org/10.1080/00107510500052444';
const REPLICATOR_SOURCE = 'https://doi.org/10.1090/S0273-0979-03-00988-1';
const LEAST_ACTION_SOURCE = 'https://www.feynmanlectures.caltech.edu/II_19.html';
const MAX_ENTROPY_SOURCE = 'https://doi.org/10.1103/PhysRev.106.620';
const ATTRACTOR_SOURCE = 'https://doi.org/10.1073/pnas.79.8.2554';
const COMPRESSED_SENSING_SOURCE = 'https://doi.org/10.1109/TIT.2006.871582';

/**
 * Six mechanisms inherited directly from the reference Atlas isomorphism
 * records. A mapping is included only when the substrate supplies measurable
 * quantities, a falsifiable transfer, and an explicit place where the analogy
 * stops.
 */
export const WAVE_2_STRUCTURES: SeedStructure[] = [
  {
    id: 'struct://xfrontier/power-laws-scale-free',
    title: { zh: '幂律 / 无标度', en: 'Power laws & scale-free' },
    statement: {
      zh: '地震、城市规模、词频与网络度数都可能满足 P(x) ∝ x^(−α)；共同幂律可能指向优先连接或自组织临界，也可能只是能拟合许多长尾数据的统计幻象。',
      en: 'Earthquakes, city sizes, word frequencies, and network degree may all follow P(x) ∝ x^(−α); a shared power law may signal preferential attachment or self-organized criticality, or merely a statistical mirage that fits many heavy tails.',
    },
    status: 'active',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-05',
    provenance: provenance([1385, 1388, 1173, 552]),
    mappings: [
      mapping(
        'population-edna-human-genetic-bycatch',
        [
          correspondence(
            '事件尺度 x',
            'event scale x',
            '环境样本中人类与目标物种等位基因、片段或单倍型的观测频数',
            'the observed frequency of human and target-species alleles, fragments, or haplotypes in environmental samples',
          ),
          correspondence(
            '尾指数 α',
            'tail exponent α',
            '控制常见变异到低频变异频谱衰减速度的拟合指数',
            'the fitted exponent governing decay from common to rare variants',
          ),
        ],
        bi(
          '若频谱确有稳健无标度区间，在控制测序深度、PCR 重复与污染后，留出地点的互补累积分布应保持相近 α，并在预注册模型比较中优于对数正态与截断幂律替代。',
          'If the spectrum has a robust scale-free regime, after controlling sequencing depth, PCR duplication, and contamination, held-out sites should retain a similar α and beat lognormal and truncated-power-law alternatives in preregistered model comparison.',
        ),
        bi(
          '群体混合、选择、测序深度与污染都会制造长尾；拟合到一条直线既不能证明优先连接，也不能把环境 DNA 频谱当成跨人群普适定律。',
          'Population mixture, selection, sequencing depth, and contamination can all manufacture heavy tails; a straight-line fit proves neither preferential attachment nor a population-universal eDNA law.',
        ),
        [
          'https://www.nature.com/articles/s41559-023-02056-2',
          POWER_LAW_SOURCE,
        ],
      ),
      mapping(
        'environmental-rna-ecosystem-activity',
        [
          correspondence(
            '事件尺度 x',
            'event scale x',
            '水样中转录本或活跃类群的标准化丰度',
            'normalized abundance of transcripts or active taxa in a water sample',
          ),
          correspondence(
            '秩—频率指数 α',
            'rank-frequency exponent α',
            '从少数高活性转录本到大量低频转录本的衰减斜率',
            'the decay slope from a few highly active transcripts to many low-frequency transcripts',
          ),
        ],
        bi(
          '若 eRNA 活性谱存在跨尺度结构，在加入外源 RNA 标准并校正降解后，α 应在同一生态状态的不同采样体积和时间窗中稳定，而在预注册应激后可重复偏移。',
          'If eRNA activity spectra contain cross-scale structure, α should remain stable across sampling volumes and time windows within one ecological state after spike-in and decay correction, then shift reproducibly after a preregistered stress.',
        ),
        bi(
          '转录爆发、物种体量、采样与快速降解会共同塑造频谱；即使幂律胜出，也不能据此声称生态系统由单一自组织临界机制生成。',
          'Transcriptional bursts, organism biomass, sampling, and rapid decay jointly shape the spectrum; even a winning power law does not establish one self-organized-critical generative mechanism.',
        ),
        [
          'https://doi.org/10.1016/j.ecolind.2025.114328',
          POWER_LAW_SOURCE,
        ],
      ),
      mapping(
        'bridging-ranking-crowd-fact-checking',
        [
          correspondence(
            '网络度数 x',
            'network degree x',
            '用户、注释与评分之间的参与度、曝光度和跨群体认可边数',
            'participation, exposure, and cross-group endorsement degrees among users, notes, and ratings',
          ),
          correspondence(
            '尾指数 α',
            'tail exponent α',
            '少数高连接节点与大量低连接节点形成的度分布衰减率',
            'the decay rate of a degree distribution with a few highly connected and many weakly connected nodes',
          ),
        ],
        bi(
          '若桥接系统确有无标度参与结构，跨时间窗和议题留出的度分布应保留 α，且针对高连接节点的定向移除应比同规模随机移除更强地降低跨群体覆盖。',
          'If the bridging system has scale-free participation structure, degree distributions should preserve α across held-out time windows and topics, and targeted removal of high-degree nodes should reduce cross-group coverage more than equal-sized random removal.',
        ),
        bi(
          '平台曝光、排序规则与账号治理会主动塑造度分布；观察到长尾不等于自然涌现，更不等于高连接节点提供的判断更真实。',
          'Platform exposure, ranking rules, and account governance actively shape degree distributions; a heavy tail is neither necessarily spontaneous nor evidence that high-degree nodes are more truthful.',
        ),
        [
          'https://tsjournal.org/index.php/jots/article/view/255',
          POWER_LAW_SOURCE,
        ],
      ),
      mapping(
        'social-physics-predictability-boundary',
        [
          correspondence(
            '尺度 x',
            'scale x',
            '人类移动中的访问频次、停留时间、跳跃距离或城市聚合尺度',
            'visit frequency, dwell time, jump distance, or urban aggregation scale in human mobility',
          ),
          correspondence(
            '标度指数 α',
            'scaling exponent α',
            '统一采样与空间粒度后，移动统计随尺度改变的速率',
            'the rate at which mobility statistics change with scale after sampling and spatial resolution are harmonized',
          ),
        ],
        bi(
          '若存在可迁移标度律，统一采样后的 α 应在留出城市和冲击前后落入预注册区间，并比对数正态或分段模型更好预测新尺度。',
          'If a transferable scaling law exists, harmonized α values should fall in a preregistered interval across held-out cities and shocks and predict new scales better than lognormal or piecewise alternatives.',
        ),
        bi(
          '移动性受制度、基础设施、隐私采样和离散粒度影响；一个时期的幂律不能成为固定的人类行为常数。',
          'Mobility depends on institutions, infrastructure, privacy sampling, and discretization; a power law in one period is not a fixed constant of human behavior.',
        ),
        [
          'https://www.science.org/doi/10.1126/science.1177170',
          POWER_LAW_SOURCE,
        ],
      ),
    ],
  },
  {
    id: 'struct://xfrontier/replicator-dynamics',
    title: { zh: '复制者动力学', en: 'Replicator dynamics' },
    statement: {
      zh: '自然选择、市场竞争、强化学习与免疫抗体优选都可抽象为“按相对表现重新分配权重”：ẋ_i = x_i(f_i − ⟨f⟩)。',
      en: 'Natural selection, market competition, reinforcement learning, and immune antibody selection can all be abstracted as reweighting by relative performance: ẋ_i = x_i(f_i − ⟨f⟩).',
    },
    status: 'active',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-07',
    provenance: provenance([1446, 1264, 901, 553]),
    mappings: [
      mapping(
        'ruminant-enteric-methane-mitigation',
        [
          correspondence(
            '类型频率 x_i',
            'type frequency x_i',
            '瘤胃中产甲烷古菌、替代氢利用菌群或代谢策略的相对丰度',
            'the relative abundance of methanogenic archaea, alternative hydrogen users, or metabolic strategies in the rumen',
          ),
          correspondence(
            '相对适合度 f_i − ⟨f⟩',
            'relative fitness f_i − ⟨f⟩',
            '在 3-NOP、日粮、免疫和宿主条件下各菌群的净增长优势',
            'each guild’s net growth advantage under 3-NOP, diet, immune, and host conditions',
          ),
        ],
        bi(
          '若复制者近似成立，宏基因组追踪到的菌群频率变化率应与独立测得的相对增长或氢利用优势同号且近似成比例，并能预测长期减排反弹。',
          'If the replicator approximation holds, metagenomic guild-frequency derivatives should share sign and approximate proportionality with independently measured relative growth or hydrogen-use advantages and predict long-term mitigation rebound.',
        ),
        bi(
          '瘤胃是有迁入、空间结构、底物通量和宿主反馈的开放系统；固定适合度与充分混合假设只能是局部近似。',
          'The rumen is an open system with immigration, spatial structure, substrate flux, and host feedback; fixed fitness and well-mixed assumptions are only local approximations.',
        ),
        [
          'https://www.frontiersin.org/journals/animal-science/articles/10.3389/fanim.2025.1689264/full',
          REPLICATOR_SOURCE,
        ],
      ),
      mapping(
        'abiological-metalloenzyme-catalysis',
        [
          correspondence(
            '变体频率 x_i',
            'variant frequency x_i',
            '定向进化文库中金属酶序列—骨架变体的条形码频率',
            'barcode frequency of sequence-scaffold variants in a directed-evolution metalloenzyme library',
          ),
          correspondence(
            '表现 f_i',
            'performance f_i',
            '目标非天然反应中的周转率、选择性、折叠与细胞内稳定性组合得分',
            'a composite of turnover, selectivity, folding, and intracellular stability on the target abiological reaction',
          ),
        ],
        bi(
          '若映射成立，每轮筛选后的条形码频率增量应由独立测得的相对催化表现预测，且改变选择目标后频率梯度应按预注册方向改变。',
          'If the mapping holds, barcode-frequency increments after each selection round should be predicted by independently measured relative catalytic performance, and changing the selection objective should redirect the gradient as preregistered.',
        ),
        bi(
          '文库瓶颈、表达量、折叠和测序偏差都会改变频率，突变又会产生新类型；连续无限群体复制者方程不是实验流程的完整生成模型。',
          'Library bottlenecks, expression, folding, and sequencing bias alter frequencies, while mutation creates new types; the continuous infinite-population replicator equation is not a full generative model of the experiment.',
        ),
        [
          'https://www.nature.com/articles/s41929-025-01436-0',
          REPLICATOR_SOURCE,
        ],
      ),
      mapping(
        'multi-agent-steganographic-collusion',
        [
          correspondence(
            '策略频率 x_i',
            'strategy frequency x_i',
            '多智能体训练群体中使用某种公开或隐蔽通信协议的策略占比',
            'the share of policies using a particular overt or covert communication protocol in a multi-agent training population',
          ),
          correspondence(
            '相对回报 f_i − ⟨f⟩',
            'relative return f_i − ⟨f⟩',
            '在任务奖励、监测器和对手共同作用下该协议相对群体均值的回报优势',
            'the protocol’s return advantage over the population mean under task reward, monitoring, and opponents',
          ),
        ],
        bi(
          '若复制者近似成立，自博弈期间协议占比的变化率应由其超额回报预测；提高隐写检测惩罚后，隐蔽协议的选择系数应可重复翻转。',
          'If the replicator approximation holds, protocol-share derivatives during self-play should be predicted by excess return; increasing the penalty from steganography detection should reproducibly reverse the covert protocol’s selection coefficient.',
        ),
        bi(
          '策略会在单个智能体内部通过梯度更新，环境与对手也非平稳；这里的“繁殖”是群体级重加权近似，不是字面生物复制。',
          'Policies change within individual agents through gradient updates while environments and opponents are nonstationary; “replication” here is a population-level reweighting approximation, not literal biological reproduction.',
        ),
        [
          'https://arxiv.org/abs/2402.07510',
          REPLICATOR_SOURCE,
        ],
      ),
      mapping(
        'evolutionary-dynamics-norms-trust',
        [
          correspondence(
            '策略频率 x_i',
            'strategy frequency x_i',
            '群体中采用合作、惩罚、搭便车或退出规范的个体比例',
            'the population share adopting cooperative, sanctioning, free-riding, or exit norms',
          ),
          correspondence(
            '相对收益 f_i − ⟨f⟩',
            'relative payoff f_i − ⟨f⟩',
            '由集体风险、互惠、惩罚和网络位置共同决定的策略收益差',
            'the strategy payoff difference jointly determined by collective risk, reciprocity, sanction, and network position',
          ),
        ],
        bi(
          '若映射成立，随机改变风险与惩罚后，规范频率的方向和初始变化率应由冻结的收益矩阵预测，并在留出社区保持校准。',
          'If the mapping holds, after randomized changes to risk and sanction, the direction and initial rate of norm-frequency change should be predicted by a frozen payoff matrix and remain calibrated in held-out communities.',
        ),
        bi(
          '规范可被讨论、内化和重新解释，个体也会跨网络迁移；观察到收益相关变化不等于规范是固定可遗传类型。',
          'Norms can be deliberated, internalized, and reinterpreted, and individuals move across networks; payoff-associated change does not make a norm a fixed heritable type.',
        ),
        [
          'https://www.nature.com/articles/s41467-021-25734-w',
          REPLICATOR_SOURCE,
        ],
      ),
    ],
  },
  {
    id: 'struct://xfrontier/least-action-variational-principles',
    title: {
      zh: '最小作用量 / 变分原理',
      en: 'Least action & variational principles',
    },
    statement: {
      zh: '经典力学、费马光学、广义相对论与最优控制都可由“令某个泛函取驻值”推出：δS = 0；数学上的极值原理不自动赋予自然目的。',
      en: 'Classical mechanics, Fermat optics, general relativity, and optimal control can all follow from making a functional stationary: δS = 0; a mathematical extremum does not automatically give nature a purpose.',
    },
    status: 'active',
    theme: 'simulation-twins',
    isomorphism: 'ISO-09',
    provenance: provenance([951, 1005, 1422, 960, 964]),
    mappings: [
      mapping(
        'programmable-acoustic-holography',
        [
          correspondence(
            '场配置 / 路径',
            'field configuration / path',
            '可重写材料的模量图案、分区驱动相位与由此产生的三维声场',
            'the rewritable modulus pattern, segmented drive phase, and resulting 3D acoustic field',
          ),
          correspondence(
            '泛函 S',
            'functional S',
            '聚焦误差、旁瓣能量、声功率与写入代价组成的预声明目标',
            'a prespecified objective combining focus error, sidelobe energy, acoustic power, and rewrite cost',
          ),
        ],
        bi(
          '若变分设计有效，伴随梯度应与有限差分一致，优化后的材料—驱动配置应在留出组织仿体和目标场上比启发式相位板显著降低该泛函。',
          'If variational design works, adjoint gradients should agree with finite differences, and optimized material-drive configurations should reduce the functional on held-out tissue phantoms and target fields relative to heuristic phase plates.',
        ),
        bi(
          '声波传播服从物理方程，但逆向设计优化的是工程师选择的损失；耗散、热写入和材料迟滞也使它不同于保守系统的基本作用量。',
          'Acoustic propagation obeys physical equations, but inverse design optimizes an engineer-chosen loss; dissipation, thermal writing, and material hysteresis also separate it from a fundamental action of a conservative system.',
        ),
        [
          'https://www.nature.com/articles/s41467-025-64154-y',
          LEAST_ACTION_SOURCE,
        ],
      ),
      mapping(
        'atom-interferometry-screened-scalars',
        [
          correspondence(
            '作用量 S',
            'action S',
            '原子在重力势与候选屏蔽标量势中沿两条干涉路径的时空积分',
            'the spacetime integral along two atomic paths through gravitational and candidate screened-scalar potentials',
          ),
          correspondence(
            '驻值路径与相位差',
            'stationary path and phase difference',
            '经典原子轨迹及两臂作用量差 ΔS/ℏ 对应的物质波相位',
            'the classical atomic trajectory and matter-wave phase corresponding to the arm action difference ΔS/ℏ',
          ),
        ],
        bi(
          '若候选标量势存在，改变源质量位置与基线后，差分相位应按预注册作用量积分缩放，而交换源质量和失谐激光的空检验不应复制该信号。',
          'If the candidate scalar potential exists, changing source-mass position and baseline should scale the differential phase according to the preregistered action integral, while source-swap and laser-detuning nulls should not reproduce it.',
        ),
        bi(
          '实测相位还包含激光脉冲、振动、波前与原子相互作用系统学；δS = 0 组织轨迹计算，但不能凭一次相位异常证明新标量场。',
          'Measured phase also contains laser-pulse, vibration, wavefront, and atomic-interaction systematics; δS = 0 organizes trajectory calculation but cannot turn one phase anomaly into evidence for a new scalar field.',
        ),
        [
          'https://arxiv.org/pdf/2511.09750',
          LEAST_ACTION_SOURCE,
        ],
      ),
      mapping(
        'universal-ml-interatomic-potentials',
        [
          correspondence(
            '势能 / 拉格朗日量',
            'potential energy / Lagrangian',
            '等变神经网络学习的原子构型总能量与动能之差',
            'the total configurational energy learned by an equivariant neural network and its difference from kinetic energy',
          ),
          correspondence(
            '欧拉—拉格朗日运动',
            'Euler-Lagrange motion',
            '由学习能量梯度得到的原子力、分子动力学轨迹与振动模式',
            'atomic forces, molecular-dynamics trajectories, and vibrational modes obtained from gradients of the learned energy',
          ),
        ],
        bi(
          '若能量一致的变分结构是关键，能量—力联合训练模型应在留出化学体系上比直接力回归产生更小的闭环能量漂移和声子误差。',
          'If an energy-consistent variational structure is essential, joint energy-force models should produce less closed-loop energy drift and phonon error than direct-force regression on held-out chemistries.',
        ),
        bi(
          '学习势只在训练支持内近似量子势能面；反应性开放系统、电子激发与非保守驱动不能被一个静态标量势自动覆盖。',
          'A learned potential only approximates a quantum potential-energy surface within training support; reactive open systems, electronic excitation, and nonconservative driving are not automatically covered by one static scalar potential.',
        ),
        [
          'https://www.nature.com/articles/s41524-025-01650-1',
          LEAST_ACTION_SOURCE,
        ],
      ),
      mapping(
        'molten-salt-online-chemistry',
        [
          correspondence(
            '控制轨迹',
            'control trajectory',
            '随时间变化的盐氧化还原设定、补料、取样与裂变产物去除率',
            'time-varying salt-redox setpoints, feeding, sampling, and fission-product removal rates',
          ),
          correspondence(
            '代价泛函 S',
            'cost functional S',
            '运行周期内反应性误差、腐蚀、燃料夹带与库存风险的加权积分',
            'the weighted time integral of reactivity error, corrosion, fuel entrainment, and inventory risk',
          ),
        ],
        bi(
          '若最优控制映射成立，在预注册扰动场景中，受约束轨迹优化应比固定阈值控制更低地完成同一代价泛函，同时不越过安全边界。',
          'If the optimal-control mapping holds, constrained trajectory optimization should achieve a lower value of the same cost functional than fixed-threshold control under preregistered disturbances without crossing safety limits.',
        ),
        bi(
          '这里有明确的人造目标与控制器，反应堆化学本身并不“追求”最小值；传感延迟、离散操作与安全联锁也会破坏光滑变分假设。',
          'Here an engineered controller has an explicit objective; reactor chemistry itself does not “seek” a minimum. Sensor delay, discrete operations, and safety interlocks also break smooth variational assumptions.',
        ),
        [
          'https://www.sciencedirect.com/science/article/pii/S0029549325006727',
          LEAST_ACTION_SOURCE,
        ],
      ),
      mapping(
        'differentiable-manufacturing-simulation-gradient-based',
        [
          correspondence(
            '控制路径',
            'control path',
            '逐时刻激光功率、扫描速度与其他制造工艺参数',
            'per-timestep laser power, scan speed, and other manufacturing-process parameters',
          ),
          correspondence(
            '目标泛函 S',
            'objective functional S',
            '目标热历史误差、可制造性约束与能耗在整条工艺轨迹上的组合',
            'the trajectory-wide combination of target thermal-history error, manufacturability constraints, and energy use',
          ),
        ],
        bi(
          '若映射成立，自动微分梯度应通过有限差分检查，优化轨迹应在留出几何的真实打印中降低温度场误差而非只改善模拟器内损失。',
          'If the mapping holds, automatic-differentiation gradients should pass finite-difference checks, and optimized trajectories should reduce temperature-field error in real prints of held-out geometries rather than only simulator loss.',
        ),
        bi(
          '极值化数值损失依赖模拟器、边界条件与目标选择；它不是材料“有目的”地选择路径，也不是基础物理作用量本身。',
          'Extremizing a numerical loss depends on the simulator, boundary conditions, and chosen target; it is neither material teleology nor the fundamental physical action itself.',
        ),
        [
          'https://arxiv.org/abs/2107.10919',
          LEAST_ACTION_SOURCE,
        ],
      ),
    ],
  },
  {
    id: 'struct://xfrontier/maximum-entropy-inference',
    title: {
      zh: '最大熵推断 (MaxEnt)',
      en: 'Maximum-entropy inference (MaxEnt)',
    },
    statement: {
      zh: '在给定约束下最大化 H = −Σp·log p，会得到最少额外假设的指数族 p ∝ exp(−Σλ_k f_k)；同一推断规则可生成吉布斯态、神经群体、生态丰度与语言模型。',
      en: 'Maximizing H = −Σp·log p under stated constraints yields the least-committal exponential family p ∝ exp(−Σλ_k f_k); the same inference rule can generate Gibbs states, neural populations, ecological abundance, and language models.',
    },
    status: 'active',
    theme: 'unknown-mapping',
    isomorphism: 'ISO-18',
    provenance: provenance([1279, 938, 1388, 1492, 541]),
    mappings: [
      mapping(
        'thermodynamic-linear-algebra',
        [
          correspondence(
            '约束 ⟨f_k⟩',
            'constraints ⟨f_k⟩',
            '由 RLC 网络耦合、噪声幅度与驱动设定的均值和协方差',
            'means and covariances set by RLC-network coupling, noise amplitude, and drive',
          ),
          correspondence(
            '最大熵分布 p',
            'maximum-entropy distribution p',
            '其精度矩阵编码待求逆矩阵的平稳多元高斯分布',
            'the stationary multivariate Gaussian whose precision matrix encodes the matrix to invert',
          ),
        ],
        bi(
          '若映射成立，固定一、二阶矩后实测稳态应接近对应最大熵高斯，样本协方差逆应随弛豫时间收敛到数字基线；非高斯残差应预测求逆偏差。',
          'If the mapping holds, with first and second moments fixed the measured steady state should approach the corresponding maximum-entropy Gaussian, and inverse sample covariance should converge to the digital baseline with relaxation time; non-Gaussian residuals should predict inversion error.',
        ),
        bi(
          '该结论要求约束正确、噪声可标定且系统接近平衡；非线性、ADC 开销和非平衡稳态不会因“热力学”标签自动满足 MaxEnt。',
          'The result requires correct constraints, calibrated noise, and near-equilibrium operation; nonlinearity, ADC overhead, and nonequilibrium steady states do not become MaxEnt merely because the hardware is thermodynamic.',
        ),
        [
          'https://www.nature.com/articles/s41467-025-59011-x',
          MAX_ENTROPY_SOURCE,
        ],
      ),
      mapping(
        'photonic-probabilistic-vacuum-noise',
        [
          correspondence(
            '约束 / 能量项 f_k',
            'constraint / energy terms f_k',
            '光参量振荡器的偏置、耦合与测量—反馈参数',
            'biases, couplings, and measurement-feedback parameters of optical parametric oscillators',
          ),
          correspondence(
            '样本分布 p',
            'sample distribution p',
            '由量子真空噪声播种、经光学动力学和反馈形成的输出状态频率',
            'output-state frequencies seeded by quantum-vacuum noise and shaped by optical dynamics and feedback',
          ),
        ],
        bi(
          '若 MaxEnt 实现成立，给定矩约束下的光子样本应匹配同一指数族，并在改变一个约束时按预测更新相应拉格朗日乘子和留出统计量。',
          'If the photonic machine realizes MaxEnt, samples under stated moment constraints should match the same exponential family, and changing one constraint should update the corresponding Lagrange multiplier and held-out statistics as predicted.',
        ),
        bi(
          '真空噪声只提供随机种子；具体分布由非线性光学与外部反馈共同决定，随机性本身不保证最大熵或正确的 Gibbs 采样。',
          'Vacuum noise only supplies a random seed; nonlinear optics and external feedback jointly determine the distribution, so randomness alone guarantees neither maximum entropy nor correct Gibbs sampling.',
        ),
        [
          'https://www.nature.com/articles/s41467-024-51509-0',
          MAX_ENTROPY_SOURCE,
        ],
      ),
      mapping(
        'environmental-rna-ecosystem-activity',
        [
          correspondence(
            '生态约束 ⟨f_k⟩',
            'ecological constraints ⟨f_k⟩',
            '总转录活性、资源代理量、功能类别均值与已测环境压力',
            'total transcriptional activity, resource proxies, functional-category means, and measured environmental stress',
          ),
          correspondence(
            '最少偏见丰度分布 p',
            'least-biased abundance distribution p',
            '满足这些约束的类群与转录本活动概率分布',
            'the taxon and transcript activity distribution consistent with those constraints',
          ),
        ],
        bi(
          '若 MaxEnt 是有效基线，只用预注册约束拟合的模型应在留出时间点预测丰度谱和共同活动，并在应激改变约束后正确预测分布位移。',
          'If MaxEnt is a valid baseline, a model fitted only to preregistered constraints should predict held-out abundance spectra and coactivity, then correctly predict distribution shifts when stress changes the constraints.',
        ),
        bi(
          'RNA 降解、物种特异表达、输运与采样破坏可交换性；良好拟合只说明约束有信息，不说明生态系统物理上“最大化熵”。',
          'RNA decay, species-specific expression, transport, and sampling break exchangeability; a good fit only shows informative constraints, not that the ecosystem physically “maximizes entropy.”',
        ),
        [
          'https://doi.org/10.1016/j.ecolind.2025.114328',
          MAX_ENTROPY_SOURCE,
        ],
      ),
      mapping(
        'brain-foundation-models-neural-digital-twins',
        [
          correspondence(
            '神经约束 ⟨f_k⟩',
            'neural constraints ⟨f_k⟩',
            '刺激条件下单细胞放电均值、成对相关与群体活动总量',
            'stimulus-conditioned single-cell firing means, pairwise correlations, and total population activity',
          ),
          correspondence(
            '群体分布 p',
            'population distribution p',
            '满足这些约束的最少偏见联合神经活动分布',
            'the least-committal joint neural-activity distribution consistent with those constraints',
          ),
        ],
        bi(
          '若 MaxEnt 捕捉了数字孪生所需的主要群体结构，成对约束模型应在整只留出动物和新刺激上预测高阶活动统计；基础模型超过它的部分应定位到可重复的高阶约束。',
          'If MaxEnt captures the main population structure needed by the digital twin, a pairwise-constrained model should predict higher-order activity statistics in fully held-out animals and new stimuli; any foundation-model gain should localize to reproducible higher-order constraints.',
        ),
        bi(
          '神经响应受刺激、行为状态和时间动力学条件化，非平稳且不必处于平衡；MaxEnt 是可审计基线，不是整个数字孪生的动力学解释。',
          'Neural responses are conditioned on stimulus, behavior, and temporal dynamics, are nonstationary, and need not be at equilibrium; MaxEnt is an auditable baseline, not the digital twin’s full dynamical explanation.',
        ),
        [
          'https://www.nature.com/articles/s41586-025-08829-y',
          MAX_ENTROPY_SOURCE,
        ],
      ),
      mapping(
        'thermodynamic-computing-hardware',
        [
          correspondence(
            '能量 / 约束项 f_k',
            'energy / constraint terms f_k',
            '连续变量电路中编码目标概率模型的耦合、偏置与噪声参数',
            'couplings, biases, and noise parameters encoding a target probabilistic model in a continuous-variable circuit',
          ),
          correspondence(
            '指数族稳态 p',
            'exponential-family steady state p',
            '物理弛豫产生、用于采样与贝叶斯推断的电路状态分布',
            'the circuit-state distribution produced by physical relaxation for sampling and Bayesian inference',
          ),
        ],
        bi(
          '若硬件实现的是约束最大熵分布，改变单个耦合或偏置后，实测充分统计量应按响应关系更新，且在留出任务上保持样本质量。',
          'If the hardware realizes a constrained maximum-entropy distribution, changing one coupling or bias should update measured sufficient statistics according to the response relation while retaining held-out sample quality.',
        ),
        bi(
          '器件漂移、非平衡驱动和持续校准可使稳态偏离目标指数族；核心阵列的 MaxEnt 近似也不等于包含 I/O 的系统级优势。',
          'Device drift, nonequilibrium drive, and continual calibration can move the steady state away from the target exponential family; a MaxEnt approximation in the core array also does not establish a system-level advantage including I/O.',
        ),
        [
          'https://www.nature.com/articles/s41467-025-59011-x',
          MAX_ENTROPY_SOURCE,
        ],
      ),
    ],
  },
  {
    id: 'struct://xfrontier/attractor-networks-hopfield',
    title: {
      zh: '吸引子网络 (Hopfield)',
      en: 'Attractor networks (Hopfield)',
    },
    statement: {
      zh: 'Hopfield 网络把记忆写成能量地形的局部极小：动力学沿 E = −½Σw_ij s_i s_j 下降，从残缺线索回到吸引子；同一骨架连接自旋玻璃、海马、蛋白折叠与连续 Hopfield 注意力。',
      en: 'Hopfield networks write memory as local minima of an energy landscape: dynamics descend E = −½Σw_ij s_i s_j from a partial cue to an attractor; the same skeleton connects spin glasses, hippocampus, protein folding, and continuous-Hopfield attention.',
    },
    status: 'active',
    theme: 'living-computation',
    isomorphism: 'ISO-24',
    provenance: provenance([944, 1494, 1264, 766]),
    mappings: [
      mapping(
        'learning-shape-metamaterials',
        [
          correspondence(
            '状态单元 s_i',
            'state units s_i',
            '弹性网络中局部位移、铰链状态与可调刚度自由度',
            'local displacements, hinge states, and tunable-stiffness degrees of freedom in the elastic network',
          ),
          correspondence(
            '能量极小 / 记忆',
            'energy minimum / memory',
            '训练后在载荷下可恢复的稳定目标形状与多稳态形变',
            'stable target shapes and multistable deformations recoverable under load after training',
          ),
        ],
        bi(
          '若形状确为吸引子，从受控残缺或噪声形变出发，结构应弛豫到最近训练形状；随任务数增加，应出现可测容量上限和伪吸引子。',
          'If shapes are genuine attractors, controlled partial or noisy deformations should relax to the nearest trained shape; as task count grows, a measurable capacity limit and spurious attractors should appear.',
        ),
        bi(
          '力学网络的状态连续、耗散且训练会改变刚度，耦合也未必对称；共享多稳态弛豫不意味着它等同于二值 Hopfield 网络。',
          'The mechanical network is continuous and dissipative, training changes stiffness, and couplings need not be symmetric; shared multistable relaxation does not make it a binary Hopfield network.',
        ),
        [
          'https://www.nature.com/articles/s41567-026-03226-2',
          ATTRACTOR_SOURCE,
        ],
      ),
      mapping(
        'bioelectric-morphogenesis-basal-cognition',
        [
          correspondence(
            '状态单元 s_i',
            'state units s_i',
            '细胞膜电位、离子通道状态与缝隙连接耦合形成的组织电网络',
            'the tissue electrical network formed by membrane voltages, ion-channel states, and gap-junction coupling',
          ),
          correspondence(
            '吸引子 / 解剖记忆',
            'attractor / anatomical memory',
            '损伤或扰动后组织恢复的目标形态与再生终态',
            'the target morphology and regenerative endpoint restored after injury or perturbation',
          ),
        ],
        bi(
          '若“解剖目标态”是真吸引子，受控局部损伤和短暂电位扰动后应回到少数可重复形态；重塑电位耦合应移动盆地边界并产生可预测迟滞。',
          'If an anatomical setpoint is a true attractor, controlled local injury and transient voltage perturbation should return to a small set of repeatable morphologies; reshaping voltage coupling should move basin boundaries and produce predictable hysteresis.',
        ),
        bi(
          '发育组织是有基因调控、力学、生长和代谢通量的开放系统；“目标”和“记忆”必须由可重复动力学定义，不能把控制论词汇直接当成 Hopfield 二次能量。',
          'Developing tissue is an open system with gene regulation, mechanics, growth, and metabolic flux; “goal” and “memory” require repeatable dynamical definitions and cannot be identified directly with a Hopfield quadratic energy.',
        ),
        [
          'https://pubmed.ncbi.nlm.nih.gov/37059328/',
          ATTRACTOR_SOURCE,
        ],
      ),
      mapping(
        'abiological-metalloenzyme-catalysis',
        [
          correspondence(
            '构象状态 s_i',
            'conformational state s_i',
            '蛋白侧链、主链与金属配位球的离散或连续构象自由度',
            'discrete or continuous conformational degrees of freedom of side chains, backbone, and metal coordination sphere',
          ),
          correspondence(
            '折叠漏斗极小',
            'folding-funnel minimum',
            '从头设计序列应稳定到达的催化口袋与配位构象',
            'the catalytic pocket and coordination geometry that the de novo sequence should reliably reach',
          ),
        ],
        bi(
          '若设计得到单一主吸引子，受控部分变性后的复性应回到同一配位构象与活性；预测的竞争极小应对应可测的旁路构象和活性损失。',
          'If design creates one dominant attractor, refolding after controlled partial denaturation should return to the same coordination geometry and activity; predicted competing minima should correspond to measurable off-path conformations and activity loss.',
        ),
        bi(
          '蛋白折叠是溶剂中高维自由能与动力学过程，不是内容寻址记忆；设计序列收敛到一个折叠也不证明 Hopfield 容量或对称权重结构。',
          'Protein folding is a high-dimensional free-energy and kinetic process in solvent, not content-addressable memory; convergence of a designed sequence to one fold establishes neither Hopfield capacity nor symmetric weights.',
        ),
        [
          'https://www.nature.com/articles/s41929-025-01436-0',
          ATTRACTOR_SOURCE,
        ],
      ),
      mapping(
        'ferroelectric-in-memory-ising-annealer',
        [
          correspondence(
            '自旋状态 s_i',
            'spin state s_i',
            '铁电存内阵列中编码 Ising 变量的器件状态',
            'device states encoding Ising variables in the ferroelectric in-memory array',
          ),
          correspondence(
            '能量地形 E',
            'energy landscape E',
            '由耦合矩阵编码的 Max-Cut 目标及其局部极小解',
            'the Max-Cut objective encoded by the coupling matrix and its local-minimum solutions',
          ),
        ],
        bi(
          '若器件真实沿编码能量下降，重复噪声初始化应提高低能解占比，退火温度表改变应按预测改变逃离局部极小的概率和解质量。',
          'If the device truly descends the encoded energy, repeated noisy initializations should enrich low-energy solutions, and annealing-schedule changes should alter escape probability and solution quality as predicted.',
        ),
        bi(
          '组合优化输出不是自传式记忆，器件不对称、漂移和读写电路也会破坏理想 Hopfield / Ising 能量单调性。',
          'A combinatorial-optimization output is not autobiographical memory, while device asymmetry, drift, and readout circuitry can break ideal Hopfield/Ising energy monotonicity.',
        ),
        [
          'https://arxiv.org/pdf/2504.21280',
          ATTRACTOR_SOURCE,
        ],
      ),
    ],
  },
  {
    id: 'struct://xfrontier/sparse-coding-compressed-sensing',
    title: {
      zh: '稀疏编码 / 压缩感知',
      en: 'Sparse coding · compressed sensing',
    },
    statement: {
      zh: '当信号 x 在某组基下确实稀疏且测量 Φ 足够不相干时，欠定观测 y = Φx 可由 min ‖x‖₁ 精确恢复；MRI、天文、视皮层与基因调控共享这一条件性骨架。',
      en: 'When x is genuinely sparse in a basis and measurements Φ are sufficiently incoherent, underdetermined observations y = Φx can be recovered by min ‖x‖₁; MRI, astronomy, visual cortex, and gene regulation share this conditional skeleton.',
    },
    status: 'active',
    theme: 'unknown-mapping',
    isomorphism: 'ISO-25',
    provenance: provenance([1472, 1420, 1493, 50]),
    mappings: [
      mapping(
        'volcano-muography-time-lapse',
        [
          correspondence(
            '观测 y',
            'measurements y',
            '有限方向和时间窗内的缪子穿透计数与衰减',
            'muon transmission counts and attenuation from limited directions and time windows',
          ),
          correspondence(
            'Φ 与稀疏 x',
            'Φ and sparse x',
            '射线路径积分算子，以及相对稳定背景上少量通道或岩浆区的密度变化',
            'the ray-path integral operator and a small set of conduit or magma-zone density changes over a stable background',
          ),
        ],
        bi(
          '若变化在选定基下稀疏，多方位 L1 或结构稀疏联合反演应在盲化火山体模和留出时段中，以更少计数恢复小范围密度变化并优于平滑正则化。',
          'If changes are sparse in the chosen basis, multi-view L1 or structured-sparse joint inversion should recover localized density changes from fewer counts than smooth regularization in blinded volcanic phantoms and held-out periods.',
        ),
        bi(
          '真实岩浆和热液变化可能弥散，缪子计数是泊松噪声且有限角度高度相干；不满足稀疏性与不相干性时，压缩感知保证立即失效。',
          'Real magmatic and hydrothermal changes may be diffuse, muon counts are Poisson, and limited angles are highly coherent; compressed-sensing guarantees fail when sparsity and incoherence do not hold.',
        ),
        [
          'https://doi.org/10.1029/2023JB028514',
          COMPRESSED_SENSING_SOURCE,
        ],
      ),
      mapping(
        'cold-atom-gravity-gradiometry',
        [
          correspondence(
            '观测 y',
            'measurements y',
            '稀疏测线上由双原子云差分相位得到的重力梯度',
            'gravity gradients from dual-cloud differential phase along a sparse survey line',
          ),
          correspondence(
            'Φ 与稀疏 x',
            'Φ and sparse x',
            '牛顿重力灵敏度核，以及背景地层上少量空洞、管线或密度异常体素',
            'the Newtonian gravity sensitivity kernel and a few void, pipe, or density-anomaly voxels over background geology',
          ),
        ],
        bi(
          '若目标确实稀疏，联合优化测点与 L1 反演应在盲化地下试验场中用更少站点恢复异常位置，并出现随测量数跨过 s·log n 量级的成功率跃迁。',
          'If targets are genuinely sparse, jointly optimized survey locations and L1 inversion should recover blinded subsurface anomalies from fewer stations and show a recovery transition as measurement count crosses the order of s·log n.',
        ),
        bi(
          '重力反演本质非唯一，真实地质常平滑且测量误差空间相关；如果灵敏度核高度相干，添加 L1 只会选择一个方便解而非证明它是真实结构。',
          'Gravity inversion is intrinsically nonunique, real geology is often smooth, and measurement errors are spatially correlated; with a coherent sensitivity kernel, L1 merely selects a convenient solution rather than proving it is real.',
        ),
        [
          'https://www.nature.com/articles/s41586-021-04315-3',
          COMPRESSED_SENSING_SOURCE,
        ],
      ),
      mapping(
        'biological-foundation-model-mechanistic-interpretability',
        [
          correspondence(
            '信号 x',
            'signal x',
            '蛋白质或基因组基础模型激活在过完备生物特征字典上的系数',
            'coefficients of protein or genomic foundation-model activations in an overcomplete biological-feature dictionary',
          ),
          correspondence(
            '稀疏恢复',
            'sparse recovery',
            '以重构误差和 L1 稀疏惩罚，从叠加表示中分离少量同时活跃的结合位点、基序或功能域特征',
            'separating a few simultaneously active binding-site, motif, or domain features from superposed representations using reconstruction error and an L1 sparsity penalty',
          ),
        ],
        bi(
          '若稀疏字典对应真实机制，同一特征应跨随机种子和模型规模稳定匹配，且特征激活或消融应按预注册方向改变留出蛋白的突变与功能预测。',
          'If the sparse dictionary corresponds to real mechanisms, the same feature should match stably across seeds and model scales, and feature activation or ablation should change held-out protein mutation and function predictions in the preregistered direction.',
        ),
        bi(
          '字典分解不唯一，特征稀疏也可由正则器强制产生；只有跨模型稳定性和前瞻实验能区分生物机制与方便的坐标系。',
          'Dictionary decompositions are nonunique and sparsity can be imposed by the regularizer; only cross-model stability and prospective experiments distinguish biological mechanism from a convenient coordinate system.',
        ),
        [
          'https://www.nature.com/articles/s41592-025-02836-7',
          COMPRESSED_SENSING_SOURCE,
        ],
      ),
      mapping(
        'ai-theory-discovery',
        [
          correspondence(
            '观测 y 与字典 Φ',
            'observations y and dictionary Φ',
            '时间导数或状态变化，以及候选常数、线性项和非线性控制方程项组成的特征库',
            'time derivatives or state changes and a library of candidate constant, linear, and nonlinear governing-equation terms',
          ),
          correspondence(
            '稀疏系数 x',
            'sparse coefficients x',
            '真正控制方程中少数非零项及其强度',
            'the small set of nonzero terms and coefficients in the true governing equation',
          ),
        ],
        bi(
          '若控制律在预声明字典中稀疏，SINDy 式回归应在留出轨迹和噪声水平上恢复正确项，且恢复成功率应随样本量和稀疏度呈可重复相变。',
          'If the governing law is sparse in the declared dictionary, SINDy-style regression should recover the correct terms on held-out trajectories and noise levels, with a reproducible recovery transition over sample size and sparsity.',
        ),
        bi(
          '真实方程可能不在字典内或并不稀疏，数值微分会放大噪声，候选项共线也会破坏不相干条件；简短公式不自动等于正确机制。',
          'The true equation may be outside the dictionary or not sparse, numerical differentiation amplifies noise, and collinear candidate terms break incoherence; a short formula is not automatically the correct mechanism.',
        ),
        [
          'https://doi.org/10.1073/pnas.1517384113',
          COMPRESSED_SENSING_SOURCE,
        ],
      ),
    ],
  },
];

/**
 * Additive mappings for already catalogued structures. Integration applies
 * these by structure id; this file never mutates the base catalogue.
 */
export const WAVE_2_STRUCTURE_PATCHES: Wave2StructurePatch[] = [
  {
    structureId: 'struct://xfrontier/distributed-field-observability',
    mappings: [
      mapping(
        'environmental-rna-ecosystem-activity',
        [
          correspondence(
            '隐状态场 x(r,t)',
            'latent state field x(r,t)',
            '不同地点和时间的活体群落转录活性与应激状态',
            'living-community transcriptional activity and stress state across location and time',
          ),
          correspondence(
            '观测算子 H',
            'observation operator H',
            '释放、输运、降解、采样和测序把真实活动映射成水样 eRNA 计数的过程',
            'the release, transport, decay, sampling, and sequencing process mapping true activity into water-sample eRNA counts',
          ),
        ],
        bi(
          '若场可观，加入外源标准和实测降解核的状态空间模型应比 eDNA 或原始计数更准确预测留出站点的组织转录组与应激恢复时间。',
          'If the field is observable, a state-space model with spike-ins and measured decay kernels should predict held-out-site tissue transcriptomes and stress-recovery time more accurately than eDNA or raw counts.',
        ),
        bi(
          'eRNA 只观测经释放、输运和降解过滤后的投影；物种特异表达和水团混合可能让多个真实生态状态产生相同样本。',
          'eRNA observes only a projection filtered by release, transport, and decay; species-specific expression and water-mass mixing can make several real ecological states produce the same sample.',
        ),
        ['https://doi.org/10.1016/j.ecolind.2025.114328'],
      ),
      mapping(
        'volcano-muography-time-lapse',
        [
          correspondence(
            '隐状态场 x(r,t)',
            'latent state field x(r,t)',
            '火山通道、穹丘和岩浆区随时间变化的三维密度',
            'time-varying 3D density of volcanic conduits, domes, and magma regions',
          ),
          correspondence(
            '观测算子 H',
            'observation operator H',
            '有限方位缪子射线对密度场的路径积分与计数衰减',
            'limited-azimuth muon-ray path integrals and count attenuation through the density field',
          ),
        ],
        bi(
          '若几何配置提供足够可观性，预先计算的观测秩和后验不确定度应预测哪些注入密度变化能被恢复；增加第二方位后，盲化变化定位误差应按预测下降。',
          'If geometry provides sufficient observability, precomputed observability rank and posterior uncertainty should predict which injected density changes are recoverable; adding a second azimuth should reduce blinded localization error as predicted.',
        ),
        bi(
          '低通量和有限角度使完整三维状态通常不可观，天气与探测效率还会改变计数；能恢复某个投影不等于已确定岩浆机制。',
          'Low flux and limited angles usually make the full 3D state unobservable, while weather and detector efficiency alter counts; recovering one projection does not identify magma mechanism.',
        ),
        ['https://doi.org/10.1029/2023JB028514'],
      ),
    ],
  },
  {
    structureId: 'struct://xfrontier/intervention-identifiability',
    mappings: [
      mapping(
        'enhanced-rock-weathering-mrv',
        [
          correspondence(
            '干预环境 e',
            'interventional environment e',
            '不同玄武岩剂量、土壤、季节和未施加对照组成的田块环境',
            'field environments spanning basalt dose, soil, season, and untreated controls',
          ),
          correspondence(
            '可识别效应',
            'identifiable effect',
            '排除背景异质性和无机碳再释放后的净大气 CO₂ 移除量',
            'net atmospheric CO2 removal after background heterogeneity and inorganic-carbon rerelease are excluded',
          ),
        ],
        bi(
          '若效应可识别，阳离子亏损、孔隙水碱度、同位素和排水通量应在留出季节闭合质量平衡，安慰剂田块和干预前趋势不应产生同等移除量。',
          'If the effect is identifiable, cation depletion, porewater alkalinity, isotopes, and drainage flux should close a mass balance in held-out seasons, while placebo plots and pretreatment trends should not yield comparable removal.',
        ),
        bi(
          '开放田块存在径流、输入、土壤混合与下游再释放；没有随机或可信对照、示踪覆盖和边界闭合，风化信号不能唯一归因于施加岩粉。',
          'Open fields have runoff, inputs, soil mixing, and downstream rerelease; without random or credible controls, tracer coverage, and boundary closure, weathering signals cannot be uniquely attributed to applied rock.',
        ),
        ['https://pubs.acs.org/doi/10.1021/acs.est.5c09820'],
      ),
      mapping(
        'ocean-alkalinity-enhancement-in-situ-mrv',
        [
          correspondence(
            '干预环境 e',
            'interventional environment e',
            '碱度投加水团、惰性示踪剂、上游对照和不同混合阶段',
            'alkalinity-dosed water masses, inert tracers, upstream controls, and distinct mixing stages',
          ),
          correspondence(
            '可识别效应',
            'identifiable effect',
            '扣除物理稀释、背景碳循环与生物响应后的额外气海 CO₂ 吸收',
            'additional air-sea CO2 uptake after physical dilution, background carbon cycling, and biological response are removed',
          ),
        ],
        bi(
          '若效应可识别，盲化团队用预注册碳酸盐模型应从示踪比值重建投加量，并在留出水团中预测 DIC、pCO₂ 与气海通量的联合变化。',
          'If the effect is identifiable, a blinded team using a preregistered carbonate model should reconstruct dose from tracer ratios and predict joint DIC, pCO2, and air-sea-flux changes in held-out water masses.',
        ),
        bi(
          '海洋混合、空气交换滞后、沉淀与生态反馈会产生部分识别；短期 pH 或总碱度变化本身不是持久净移除。',
          'Ocean mixing, air-exchange lag, precipitation, and ecological feedback create partial identification; short-term pH or alkalinity change alone is not durable net removal.',
        ),
        ['https://www.whoi.edu/press-room/news-release/oae-prelim/'],
      ),
      mapping(
        'automated-partial-identification-bounds',
        [
          correspondence(
            '因果假设集',
            'causal assumption set',
            '潜在结果、观测矩、单调性、排除限制和选择机制的多项式约束',
            'polynomial constraints over potential outcomes, observed moments, monotonicity, exclusions, and selection mechanisms',
          ),
          correspondence(
            '识别集',
            'identified set',
            '与全部观测和声明假设相容的因果效应上下界及可行见证',
            'causal-effect bounds and feasible witnesses compatible with all observations and declared assumptions',
          ),
        ],
        bi(
          '若自动化边界正确，在可穷举的小型模拟中应与精确识别集一致，在大型问题中应给出 ε-sharp 证书，并在逐条增加假设时只按可解释方向收缩。',
          'If automated bounds are correct, they should match exact identified sets in exhaustible simulations, provide epsilon-sharp certificates in larger problems, and contract only in interpretable directions as assumptions are added one by one.',
        ),
        bi(
          '“锐利”只相对于编码的离散变量和假设；遗漏选择机制、测量误差或错误排除限制会产生精确但不适用于现实的区间。',
          '“Sharp” is only relative to encoded discrete variables and assumptions; omitted selection mechanisms, measurement error, or false exclusions can yield a precise interval that does not apply to reality.',
        ),
        ['https://pmc.ncbi.nlm.nih.gov/articles/PMC11566246/'],
      ),
    ],
  },
  {
    structureId: 'struct://xfrontier/negative-feedback-control',
    mappings: [
      mapping(
        'field-deployable-whole-cell-biosensors',
        [
          correspondence(
            '传感误差 e(t)',
            'sensed error e(t)',
            '细胞回路报告的污染物浓度与安全设定值之差，并由内置活性对照校正',
            'the difference between cell-circuit-reported contaminant concentration and a safe setpoint, corrected by an internal viability control',
          ),
          correspondence(
            '反馈动作 u(t)',
            'feedback action u(t)',
            '改变采样频率、旁路、通风或封闭修复剂量的受限执行动作',
            'constrained actions changing sampling cadence, diversion, ventilation, or contained remediation dose',
          ),
        ],
        bi(
          '若传感器可进入负反馈闭环，注入预注册污染脉冲后，闭环系统应比同硬件开环基线更快恢复设定区间且不增加超调；失活对照必须触发安全停机而非“零污染”。',
          'If the biosensor can enter a negative-feedback loop, after preregistered contaminant pulses the closed loop should restore the setpoint band faster than the same hardware open-loop baseline without greater overshoot; a dead-cell control must trigger a safe stop rather than “zero contamination.”',
        ),
        bi(
          '该岛当前提供传感，不自动提供安全执行器；只有独立校准、可逆动作和生物封闭同时存在时，映射才从监测升级为控制。',
          'The island currently supplies sensing, not automatically a safe actuator; the mapping upgrades monitoring to control only with independent calibration, reversible action, and biocontainment.',
        ),
        ['https://doi.org/10.1038/s41467-025-62256-1'],
      ),
      mapping(
        'molten-salt-online-chemistry',
        [
          correspondence(
            '设定值 r(t)',
            'setpoint r(t)',
            '燃料盐允许的氧化还原态、关键物种浓度与反应性安全包络',
            'the allowed fuel-salt redox state, key-species concentration, and reactivity safety envelope',
          ),
          correspondence(
            '反馈回路',
            'feedback loop',
            '原位光谱和电化学估计驱动补料、净化、分离与安全停机',
            'in situ spectroscopic and electrochemical estimates driving feed, cleanup, separation, and safe shutdown',
          ),
        ],
        bi(
          '若闭环稳定，规定幅度的组成和传感漂移扰动后，状态应在预测整定时间内回到安全包络，超调和燃料夹带均低于预注册上限。',
          'If the loop is stable, after specified composition and sensor-drift disturbances the state should return to the safety envelope within the predicted settling time, with overshoot and fuel entrainment below preregistered limits.',
        ),
        bi(
          '高温辐照造成的传感漂移、长延迟、分离器离散启停和安全联锁使系统远非简单线性控制；稳定性必须在故障包络内证明。',
          'Radiation-driven sensor drift, long delays, discrete separator trips, and safety interlocks make the system far from simple linear control; stability must be established within a fault envelope.',
        ),
        ['https://www.sciencedirect.com/science/article/pii/S0029549325006727'],
      ),
    ],
  },
  {
    structureId: 'struct://xfrontier/executable-knowledge',
    mappings: [
      mapping(
        'machine-actionable-research-findings',
        [
          correspondence(
            '可组合主张单元',
            'composable claim unit',
            '带永久标识的主张—方法—证据—条件纳米出版物或知识图节点',
            'a persistently identified claim-method-evidence-condition nanopublication or knowledge-graph node',
          ),
          correspondence(
            '验证与出处接口',
            'validation and provenance interface',
            '机器可查询模式、签名、版本和原始数据或论文的可追溯链接',
            'a machine-queryable schema, signature, version, and traceable links to source data or papers',
          ),
        ],
        bi(
          '若研究发现真正可执行，同一版本查询应在独立实现中重建相同结果表，来源变化应触发可定位差异，模式不兼容的主张应在组合处明确失败。',
          'If findings are genuinely executable, the same versioned query should reconstruct the same result table in an independent implementation, provenance changes should yield localized diffs, and schema-incompatible claims should fail explicitly at composition.',
        ),
        bi(
          '结构化和可查询不保证主张为真；本体选择、作者确认和测量质量仍需人工与领域审计，知识图也不能消除原论文的偏差。',
          'Structured and queryable does not mean true; ontology choices, author confirmation, and measurement quality still require human and domain audit, and a knowledge graph cannot erase bias in source papers.',
        ),
        ['https://doi.org/10.3233/faia250216'],
      ),
      mapping(
        'construct-validity-evaluation-science',
        [
          correspondence(
            '带类型构念',
            'typed construct',
            '安全、推理或临床能力的操作定义、内容蓝图与预期关系网络',
            'the operational definition, content blueprint, and expected nomological network of safety, reasoning, or clinical capability',
          ),
          correspondence(
            '验证器',
            'validator',
            '聚合、区分、预测效度与测量不变性的预注册检验',
            'preregistered tests of convergent, discriminant, predictive validity, and measurement invariance',
          ),
        ],
        bi(
          '若评测主张可执行，改变题面但保持构念应维持测量关系，而加入无关格式捷径应由区分效度或不变性验证器拒绝，即使总分上升。',
          'If an evaluation claim is executable, changing item surface while preserving the construct should retain measurement relations, while adding an irrelevant format shortcut should be rejected by discriminant-validity or invariance validators even if the score rises.',
        ),
        bi(
          '构念来自理论与价值判断，不能完全由类型系统生成；验证器可让解释失败得清楚，但不能替人决定什么能力值得测量。',
          'Constructs come from theory and value judgment and cannot be generated fully by a type system; validators can make an interpretation fail clearly but cannot decide which capability is worth measuring.',
        ),
        ['https://arxiv.org/abs/2511.04703'],
      ),
    ],
  },
  {
    structureId: 'struct://xfrontier/diffusion-equation',
    mappings: [
      mapping(
        'geothermal-brine-critical-minerals',
        [
          correspondence(
            '浓度场 c(r,t)',
            'concentration field c(r,t)',
            '吸附剂孔道、膜边界层或电化学界面附近锂、钠、钙和镁的局地浓度',
            'local concentrations of lithium, sodium, calcium, and magnesium near sorbent pores, membrane boundary layers, or electrochemical interfaces',
          ),
          correspondence(
            '扩散通量 −D∇c',
            'diffusive flux −D∇c',
            '各离子跨边界层到达选择性位点的传质速率',
            'the mass-transfer rate at which each ion crosses the boundary layer to selective sites',
          ),
        ],
        bi(
          '若扩散限制主导，改变流速、特征长度和温度后，工作容量到达时间应按预注册无量纲传质关系塌缩；消除边界层后收益应随预测饱和。',
          'If diffusion limitation dominates, changing flow, characteristic length, and temperature should collapse capacity-rise times under a preregistered dimensionless mass-transfer relation, with gains saturating as the boundary layer is removed.',
        ),
        bi(
          '实际选择性由离子交换、配位、电化学、结垢和再生共同决定；线性扩散只能描述传质部分，不能单独预测长期分离性能。',
          'Actual selectivity depends jointly on ion exchange, coordination, electrochemistry, scaling, and regeneration; linear diffusion describes only mass transport and cannot alone predict long-term separation performance.',
        ),
        ['https://www.sciencedirect.com/science/article/pii/S1674987126000915'],
      ),
      mapping(
        'in-orbit-pharma-crystallization',
        [
          correspondence(
            '浓度场 c(r,t)',
            'concentration field c(r,t)',
            '生长蛋白或药物晶体周围的溶质过饱和度',
            'solute supersaturation around a growing protein or drug crystal',
          ),
          correspondence(
            '扩散主导输运',
            'diffusion-dominated transport',
            '微重力抑制浮力对流和沉降后，溶质穿过边界层到达晶面的过程',
            'solute transport through the boundary layer to crystal faces after microgravity suppresses buoyant convection and sedimentation',
          ),
        ],
        bi(
          '若微重力优势主要来自扩散主导输运，晶体尺寸分布、缺陷率和生长速率应随扩散时间尺度塌缩，并在地面用匹配低对流条件部分复现。',
          'If the microgravity advantage mainly comes from diffusion-dominated transport, crystal-size distribution, defect rate, and growth rate should collapse with the diffusion timescale and be partly reproduced on Earth under matched low-convection conditions.',
        ),
        bi(
          '成核、界面整合、杂质、温度控制和残余加速度同样决定晶体；扩散方程不是结晶动力学的完整模型，也不保证剂型可制造。',
          'Nucleation, surface integration, impurities, thermal control, and residual acceleration also determine crystals; the diffusion equation is not a complete crystallization model and does not guarantee a manufacturable formulation.',
        ),
        ['https://www.nature.com/articles/s41526-019-0090-3'],
      ),
    ],
  },
  {
    structureId: 'struct://xfrontier/stateful-in-materia-computation',
    mappings: [
      mapping(
        'learning-shape-metamaterials',
        [
          correspondence(
            '物理内部状态',
            'physical internal state',
            '训练过程中被局部更新并在卸载后保留的梁或弹簧刚度',
            'beam or spring stiffnesses updated locally during training and retained after unloading',
          ),
          correspondence(
            '材料内读出',
            'in-materia readout',
            '再次施加载荷时直接产生的目标形变、多稳态选择与非互易响应',
            'the target deformation, multistable choice, and nonreciprocal response produced directly when load is reapplied',
          ),
        ],
        bi(
          '若计算状态真正驻留在材料中，断开训练控制后保留期内应可重现学得形变；连续学习新任务时，旧任务误差与局部刚度漂移应给出可测容量曲线。',
          'If computational state truly resides in the material, learned deformation should remain reproducible after training control is disconnected for a retention interval; sequential tasks should yield a measurable capacity curve linking old-task error to local stiffness drift.',
        ),
        bi(
          '几何、疲劳和外部可调元件可能承担所谓记忆；展示一个逻辑或形变任务不等于可随机寻址、可无限重写的通用存储器。',
          'Geometry, fatigue, and external tuning elements may carry the apparent memory; demonstrating one logic or deformation task is not a randomly addressable, indefinitely rewritable general memory.',
        ),
        ['https://www.nature.com/articles/s41567-026-03226-2'],
      ),
      mapping(
        'thermodynamic-linear-algebra',
        [
          correspondence(
            '物理状态',
            'physical state',
            '耦合 RLC 单元的电压、电流、相位和受控噪声统计',
            'voltages, currents, phases, and controlled-noise statistics of coupled RLC cells',
          ),
          correspondence(
            '计算读出',
            'computational readout',
            '弛豫稳态的均值与协方差所编码的高斯样本和矩阵逆',
            'Gaussian samples and matrix inverses encoded by the mean and covariance of the relaxed steady state',
          ),
        ],
        bi(
          '若线性代数确由材料状态完成，从相同初态扰动出发的弛豫读出应收敛到同一解，且扩展维数时物理弛豫步数和端到端能耗应优于匹配精度数字基线。',
          'If linear algebra is performed by material state, relaxation readouts from matched initial perturbations should converge to the same solution, and scaling dimension should beat a matched-accuracy digital baseline in physical relaxation steps and end-to-end energy.',
        ),
        bi(
          '状态是易失模拟变量，需要持续噪声、校准和读出；核心 RLC 网络的 O(d²) 理论不包含装载矩阵、ADC/DAC 与误差修正成本。',
          'The state is a volatile analog variable requiring ongoing noise, calibration, and readout; the core RLC network’s O(d²) theory excludes matrix loading, ADC/DAC, and error-correction costs.',
        ),
        ['https://www.nature.com/articles/s41467-025-59011-x'],
      ),
    ],
  },
  {
    structureId: 'struct://xfrontier/model-reality-loop',
    mappings: [
      mapping(
        'brain-foundation-models-neural-digital-twins',
        [
          correspondence(
            '现实观测流',
            'real observation stream',
            '多动物、多会话自然刺激下的单细胞活动、行为状态与配对组织学',
            'single-cell activity, behavioral state, and paired histology across animals and natural-stimulus sessions',
          ),
          correspondence(
            '模型—干预—校正闭环',
            'model-intervention-correction loop',
            '神经孪生提出新刺激或扰动预测，真脑盲化实验再更新共享基础核',
            'the neural twin proposes novel stimulus or perturbation predictions, and blinded in-vivo experiments update the shared core',
          ),
        ],
        bi(
          '若闭环有效，每轮由模型选择的高信息刺激应比随机刺激更快降低整只留出动物的预测误差，预注册光遗传反事实应在真脑中保持方向和校准。',
          'If the loop works, model-selected high-information stimuli should reduce error on fully held-out animals faster than random stimuli each round, and preregistered optogenetic counterfactuals should retain direction and calibration in vivo.',
        ),
        bi(
          '高预测精度不等于因果机制或个体完整孪生；脑状态、发育和记录装置漂移要求模型持续标注适用域，动物验证也不能被模拟完全替代。',
          'High predictive accuracy is not a causal mechanism or a complete individual twin; brain state, development, and apparatus drift require continual domain-of-validity labels, and simulation cannot fully replace animal validation.',
        ),
        ['https://www.nature.com/articles/s41586-025-08829-y'],
      ),
      mapping(
        'universal-ml-interatomic-potentials',
        [
          correspondence(
            '现实校准流',
            'reality-calibration stream',
            '按不确定度选择的新 DFT 计算、实验结构、声子和稳定性测量',
            'new uncertainty-selected DFT calculations and experimental structure, phonon, and stability measurements',
          ),
          correspondence(
            '可运行模型与干预',
            'executable model and intervention',
            '通用势执行分子动力学与材料筛选，提出下一批最能区分模型的构型',
            'the universal potential runs molecular dynamics and material screening, proposing the next configurations that best discriminate the model',
          ),
        ],
        bi(
          '若闭环有效，不确定度驱动的新构型应比随机补数更快降低留出元素组合的能量、力与声子误差，并提高随后实验稳定性命中率。',
          'If the loop works, uncertainty-driven new configurations should reduce energy, force, and phonon error on held-out element combinations faster than random data additions and improve subsequent experimental stability hit rate.',
        ),
        bi(
          'DFT 本身是近似现实，实验标签也受温度、缺陷和动力学影响；模型—DFT 闭环若没有实验锚点，只会越来越忠于同一计算理论。',
          'DFT is itself an approximation to reality, while experimental labels depend on temperature, defects, and kinetics; without experimental anchors, a model-DFT loop only becomes more faithful to the same computational theory.',
        ),
        ['https://www.nature.com/articles/s41524-025-01650-1'],
      ),
    ],
  },
];
