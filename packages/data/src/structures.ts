/**
 * Seed structures for the 结构 ⇄ 现象 bipartite graph (执行纲要 §九). Each is one
 * cross-substrate regularity ("字母表" of 定位说明 §4.3), drawn from the xfrontier
 * atlas `isomorphisms.json` (ISO-xx provenance below). The `mappings` are the
 * human-authored 映射 (§六.1) a curator (shen-kuo) rebuilt onto specific frontier
 * islands — attached ONLY where an island genuinely embodies the structure (no
 * forced fit; that would be the exact fabrication the project forbids).
 *
 * 标度 (scaling) intentionally carries ZERO mappings: no island in the current
 * corpus genuinely embodies allometric scaling, so every island is a GAP. That is
 * not a hole to paper over — it is the point (执行纲要 §九): a structure with no
 * rebuilt islands is a pure frontier, the map's honest dashed field.
 */

export interface StructureCorrespondence {
  /** A quantity in the abstract structure. */
  quantity: { zh: string; en: string };
  /** What it corresponds to in this island's substrate (the human's insight). */
  inThisSubstrate: { zh: string; en: string };
}

export interface StructureMapping {
  /** Island slug this structure was rebuilt onto (must exist in FRONTIERS). */
  slug: string;
  correspondences: StructureCorrespondence[];
  /** "若这成立,我们就应观察到 X" — the falsifiable prediction (§七). */
  prediction?: { zh: string; en: string };
  /** The most important substrate-specific difference: where the analogy must
   * stop instead of quietly becoming an identity claim. */
  boundary?: { zh: string; en: string };
}

export type StructureTheme =
  | 'collective-dynamics'
  | 'causal-inference'
  | 'unknown-mapping'
  | 'knowledge-commons'
  | 'living-computation'
  | 'simulation-twins';

export interface StructureProvenance {
  source: string;
  url: string;
  recordIds: number[];
  reviewedAt: string;
}

export interface SeedStructure {
  /** `struct://<org>/<slug>`. */
  id: string;
  title: { zh: string; en: string };
  /** The regularity in one sentence (NOT a discipline label — §五). */
  statement: { zh: string; en: string };
  status: 'proposed' | 'active';
  /** Editorial programme for orientation, never a structure⇄island edge. */
  theme: StructureTheme;
  /** xfrontier isomorphisms.json provenance (trust is visible, §6). */
  isomorphism?: string;
  /** Current deployed xfrontier corpus handles, reviewed against the live bundle. */
  provenance: StructureProvenance;
  mappings: StructureMapping[];
}

const XFRONTIER = (recordIds: number[]): StructureProvenance => ({
  source: 'xfrontier.science',
  url: 'https://xfrontier.science/',
  recordIds,
  reviewedAt: '2026-07-18',
});

export const SEED_STRUCTURES: SeedStructure[] = [
  {
    id: 'struct://xfrontier/synchronization',
    title: { zh: '耦合振子同步', en: 'Coupled-oscillator synchronization' },
    statement: {
      zh: '大量弱耦合的单元遵循局部规则,在耦合强度越过临界值后自发协同到一个集体状态。',
      en: 'Many weakly coupled units following local rules spontaneously lock into a collective state once coupling exceeds a critical strength.',
    },
    status: 'active',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-10',
    provenance: XFRONTIER([231, 1491]),
    mappings: [
      {
        slug: 'self-learning-matter',
        correspondences: [
          {
            quantity: { zh: '耦合强度 K', en: 'coupling strength K' },
            inThisSubstrate: {
              zh: '自调电阻网络中相邻节点通过局部学习规则相互调参的强度',
              en: 'the strength with which adjacent nodes in the self-adjusting resistor network retune one another via local learning rules',
            },
          },
          {
            quantity: { zh: '集体锁相(序参量)', en: 'collective phase-lock (order parameter)' },
            inThisSubstrate: {
              zh: '整个物理网络协同收敛到目标函数——训练从算法搬进物质本身',
              en: 'the whole physical network converging in concert onto the target function — training moved from algorithm into matter itself',
            },
          },
        ],
        prediction: {
          zh: '若这成立,耦合学习网络应在耦合强度越过某临界值时,从"各节点各自为战"突变为"全局协同收敛"。',
          en: 'If it holds, a coupled-learning network should switch abruptly from node-wise disorder to global coordinated convergence as coupling crosses a critical value.',
        },
        boundary: {
          zh: '振子相位是周期状态变量；电阻网络学习改变的是电导并优化任务目标。共享临界协同，不等于两者具有同一动力学。',
          en: 'Oscillator phase is a periodic state variable; the resistor network learns by changing conductance toward a task objective. A shared coordination threshold does not make the dynamics identical.',
        },
      },
    ],
  },
  {
    id: 'struct://xfrontier/network-cascade',
    title: { zh: '网络渗流与级联', en: 'Network percolation & cascade' },
    statement: {
      zh: '局部相互作用在网络上累积,在临界点突然贯通全局——巨连通分量、级联翻转、临界质量。',
      en: 'Local interactions accumulate on a network and suddenly span it at a critical point — a giant component, a cascade, a tipping mass.',
    },
    status: 'active',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-06',
    provenance: XFRONTIER([231, 904]),
    mappings: [
      {
        slug: 'triadic-percolation-connectivity-dynamical',
        correspondences: [
          {
            quantity: { zh: '渗流序参量(巨连通分量)', en: 'percolation order parameter (giant component)' },
            inThisSubstrate: {
              zh: '三元调控下网络的瞬时连通性',
              en: 'the instantaneous connectivity of the network under triadic regulation',
            },
          },
          {
            quantity: { zh: '控制参数(占据概率)', en: 'control parameter (occupation probability)' },
            inThisSubstrate: {
              zh: '三元交互强度——推动序参量周期倍增、通往混沌的旋钮',
              en: 'the triadic-interaction strength — the knob that period-doubles the order parameter toward chaos',
            },
          },
        ],
        prediction: {
          zh: '若这成立,扫描三元调控强度应看到连通性序参量的周期倍增级联,并出现 Neimark–Sacker 分岔通往混沌。',
          en: 'If it holds, sweeping the triadic-regulation strength should reveal a period-doubling cascade in the connectivity order parameter, with a Neimark–Sacker route to chaos.',
        },
        boundary: {
          zh: '这里的网络连边本身会被三元关系动态调控，不是经典渗流中静态图上的独立占据；临界行为必须在这个额外反馈下重新检验。',
          en: 'Here network edges are dynamically regulated by triadic relations, unlike independent occupation on a static graph in classical percolation; critical behaviour must be re-tested under that feedback.',
        },
      },
      {
        slug: 'emergent-conventions-collective-bias-tipping',
        correspondences: [
          {
            quantity: { zh: '临界质量(渗流阈值)', en: 'critical mass (percolation threshold)' },
            inThisSubstrate: {
              zh: '触发全群规约翻转所需的少数坚定智能体比例',
              en: 'the fraction of committed minority agents needed to flip the whole population’s convention',
            },
          },
          {
            quantity: { zh: '巨连通分量的涌现', en: 'emergence of the giant component' },
            inThisSubstrate: {
              zh: '共享规约在去中心 LLM 群体中的全局收敛',
              en: 'a shared convention converging globally across the decentralized LLM population',
            },
          },
        ],
        prediction: {
          zh: '若这成立,坚定少数的比例越过阈值时,群体规约应发生临界质量式的突然翻转,而非线性漂移。',
          en: 'If it holds, the population convention should flip abruptly at a critical-mass threshold in the committed-minority fraction, not drift linearly.',
        },
        boundary: {
          zh: '智能体会更新信念并作策略回应，网络占据单元不会；临界质量的相似性不能替代对微观更新规则的说明。',
          en: 'Agents update beliefs and respond strategically whereas occupied network sites do not; a similar critical mass cannot substitute for the microscopic update rule.',
        },
      },
      {
        slug: 'developmental-interpretability-singular-learning',
        correspondences: [
          {
            quantity: { zh: '临界点(相变)', en: 'critical point (phase transition)' },
            inThisSubstrate: {
              zh: '训练过程中损失景观的发展阶段跃迁',
              en: 'a developmental stage transition in the loss landscape during training',
            },
          },
          {
            quantity: { zh: '序参量', en: 'order parameter' },
            inThisSubstrate: {
              zh: '奇异学习理论刻画的模型内部结构(相)的突现',
              en: 'the abrupt emergence of internal model structure (a "phase") characterized by singular learning theory',
            },
          },
        ],
        prediction: {
          zh: '若这成立,训练曲线应在离散的发展阶段之间显示相变式的突变,而非平滑单调下降。',
          en: 'If it holds, the training curve should show phase-transition-like jumps between discrete developmental stages rather than smooth monotone descent.',
        },
        boundary: {
          zh: '训练跃迁发生在参数与损失景观中，不是字面上的网络贯通；观察到突变并不能单独证明它属于渗流普适类。',
          en: 'The transition occurs in parameter and loss landscapes, not literal network connectivity; observing a jump alone does not establish a percolation universality class.',
        },
      },
    ],
  },
  {
    id: 'struct://xfrontier/scaling',
    title: { zh: '异速生长标度律', en: 'Allometric scaling laws' },
    statement: {
      zh: '系统的性质随规模以幂律缩放,微观细节无关——共享同一组标度指数(普适类)。',
      en: 'A system’s properties scale as power laws with size, independent of microscopic detail — sharing one set of scaling exponents (a universality class).',
    },
    // proposed, and deliberately UNMAPPED: no island in the current corpus
    // genuinely embodies allometric scaling. Every island is therefore a gap —
    // this structure is a pure frontier (执行纲要 §九: 图的缺口 = 前沿).
    status: 'proposed',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-29',
    provenance: XFRONTIER([]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/intervention-identifiability',
    title: { zh: '干预可识别性', en: 'Interventional identifiability' },
    statement: {
      zh: '跨多个环境施加的干预改变观测分布；若覆盖与变化条件足够，稳定的分布差异可反推出潜在因果变量及其结构。',
      en: 'Interventions across environments shift observed distributions; with sufficient coverage and variation, stable distributional changes can identify latent causal variables and their structure.',
    },
    status: 'active',
    theme: 'causal-inference',
    provenance: XFRONTIER([851]),
    mappings: [
      {
        slug: 'causal-rep-learning',
        correspondences: [
          {
            quantity: { zh: '干预环境 e', en: 'interventional environment e' },
            inThisSubstrate: {
              zh: '高维观测在未知干预目标下形成的多组分布环境',
              en: 'the multiple high-dimensional data environments produced by interventions whose targets may be unknown',
            },
          },
          {
            quantity: { zh: '可识别潜变量 zᵢ', en: 'identifiable latent variable zᵢ' },
            inThisSubstrate: {
              zh: '由干预前后 score function 的稳定差异恢复出的潜在因果变量',
              en: 'a latent causal variable recovered from stable before/after shifts in the score function',
            },
          },
        ],
        prediction: {
          zh: '若映射成立，在满足干预覆盖的留出环境里，恢复出的变量应跨环境对齐同一因果因素，并比纯相关表征更准确预测未见干预。',
          en: 'If the mapping holds, under intervention coverage the recovered variables should align the same causal factors across held-out environments and predict unseen interventions better than correlation-only representations.',
        },
        boundary: {
          zh: '分布发生变化并不自动带来因果语义；只有在干预覆盖、独立性与模型条件成立时，潜变量才可能被识别。',
          en: 'A distribution shift does not automatically confer causal meaning; latent variables become identifiable only under intervention coverage, independence, and model assumptions.',
        },
      },
    ],
  },
  {
    id: 'struct://xfrontier/anomaly-as-signal',
    title: { zh: '异常即信号', en: 'Anomaly as signal' },
    statement: {
      zh: '离群点不是自动丢弃的噪声，而是“现有规则还不完整”的可检验残差；关键是先控制背景、采样与仪器伪差。',
      en: 'An outlier is not noise to discard automatically but a testable residual saying the current rule is incomplete—after background, sampling, and instrument artifacts are controlled.',
    },
    status: 'active',
    theme: 'unknown-mapping',
    provenance: XFRONTIER([629, 716]),
    mappings: [
      {
        slug: 'anomaly-as-signal-cross-domain',
        correspondences: [
          {
            quantity: { zh: '已知行为流形', en: 'known-behaviour manifold' },
            inThisSubstrate: {
              zh: '天文、基因组与极地数据中由现有模型解释的正常区域',
              en: 'the region of astronomical, genomic, and polar data explained by current models',
            },
          },
          {
            quantity: { zh: '受控残差 / 惊奇度', en: 'controlled residual / surprise' },
            inThisSubstrate: {
              zh: '校正采样和仪器伪差后仍偏离所有已知模型的候选',
              en: 'a candidate that still departs from every known model after sampling and instrument artifacts are corrected',
            },
          },
        ],
        prediction: {
          zh: '若映射成立，统一基准中高惊奇度候选在跨域复核后仍应显著富集真实稀有现象，而不是只富集仪器或采样伪差。',
          en: 'If the mapping holds, high-surprise candidates in a shared benchmark should remain enriched for genuine rare phenomena after cross-domain follow-up, not merely for instrument or sampling artifacts.',
        },
        boundary: {
          zh: '不同领域的惊奇度不能直接互换：仪器噪声、选择效应与复核成本各不相同，统一的只能是控制残差的原则。',
          en: 'Surprise scores are not directly interchangeable across fields: instrument noise, selection effects, and follow-up costs differ; only the principle of controlling residuals is shared.',
        },
      },
      {
        slug: 'collider-anomaly-detection-transplanted-to',
        correspondences: [
          {
            quantity: { zh: '平滑背景模型', en: 'smooth background model' },
            inThisSubstrate: {
              zh: '生态告警或巡天流中常见类别、季节性与仪器漂移组成的背景',
              en: 'the background of common classes, seasonality, and instrument drift in ecological alerts or sky-survey streams',
            },
          },
          {
            quantity: { zh: '去相关异常分数', en: 'decorrelated anomaly score' },
            inThisSubstrate: {
              zh: '从对撞机方法移植而来、在背景条件变化时仍可比较的偏离量',
              en: 'a collider-derived deviation measure that stays comparable as background conditions change',
            },
          },
        ],
        prediction: {
          zh: '若移植保真，检测器应在季节与仪器变化下维持预设虚警率，同时比领域基线召回更多已知稀有事件。',
          en: 'If the transplant preserves the structure, the detector should hold its target false-alert rate across seasonal and instrument shifts while recalling more known rare events than domain baselines.',
        },
        boundary: {
          zh: '对撞机背景通常更受控且高通量；生态或巡天流包含非平稳季节与选择效应，因此虚警率必须重新校准，不能原样搬运。',
          en: 'Collider backgrounds are usually more controlled and high-throughput; ecological or survey streams contain non-stationary seasons and selection effects, so false-alert rates must be recalibrated rather than copied.',
        },
      },
    ],
  },
  {
    id: 'struct://xfrontier/executable-knowledge',
    title: { zh: '可执行知识公地', en: 'Executable knowledge commons' },
    statement: {
      zh: '把主张拆成带类型、依赖与验证器的可组合对象，使知识不仅可读，还能被机器复核、重用并在接口不兼容时失败。',
      en: 'Claims become typed, dependency-aware, composable objects with validators, so knowledge is not only readable but machine-checkable, reusable, and able to fail at incompatible interfaces.',
    },
    status: 'active',
    theme: 'knowledge-commons',
    provenance: XFRONTIER([374, 1453]),
    mappings: [
      {
        slug: 'formal-math',
        correspondences: [
          {
            quantity: { zh: '可组合主张单元', en: 'composable claim unit' },
            inThisSubstrate: {
              zh: 'Lean 中带完整依赖的定理陈述与证明项',
              en: 'a Lean theorem statement and proof term with explicit dependencies',
            },
          },
          {
            quantity: { zh: '验证窄腰', en: 'validation narrow waist' },
            inThisSubstrate: {
              zh: '所有贡献最终必须通过的小型可信内核类型检查',
              en: 'the small trusted-kernel type check every contribution must pass',
            },
          },
        ],
        prediction: {
          zh: '若知识公地真正可执行，外部导入定理在补齐依赖后应由同一内核重检通过，而偷换命题或不兼容引理会在组合处明确失败。',
          en: 'If the commons is genuinely executable, an imported theorem should re-check under the same kernel once dependencies are supplied, while semantic substitution or incompatible lemmas fail explicitly at composition.',
        },
        boundary: {
          zh: '形式证明验证的是相对于公理的逻辑有效性，不验证经验模型是否贴近现实，也不验证测量质量。',
          en: 'Formal proof checks logical validity relative to axioms; it does not establish empirical adequacy or measurement quality.',
        },
      },
      {
        slug: 'compositional-modeling',
        correspondences: [
          {
            quantity: { zh: '带类型模型组件', en: 'typed model component' },
            inThisSubstrate: {
              zh: 'StockFlow、Decapodes 等图式中的可复用科学模型片段',
              en: 'a reusable scientific-model fragment in diagrammatic systems such as StockFlow or Decapodes',
            },
          },
          {
            quantity: { zh: '组合接口', en: 'composition interface' },
            inThisSubstrate: {
              zh: '余跨、边界对象与端口类型规定的可拼接边界',
              en: 'the composable boundary specified by cospans, boundary objects, and port types',
            },
          },
        ],
        prediction: {
          zh: '若映射成立，同一张结构图应能编译为至少两种数学语义，而边界不兼容的组件会在运行仿真前被类型或组合检查拒绝。',
          en: 'If the mapping holds, one structural diagram should compile into at least two mathematical semantics, while components with incompatible boundaries are rejected before simulation runs.',
        },
        boundary: {
          zh: '接口可组合只说明形状与依赖兼容，不说明组件假设正确，也不保证组合后的科学解释有效。',
          en: 'Composable interfaces establish shape and dependency compatibility, not the truth of component assumptions or the scientific validity of the assembled explanation.',
        },
      },
    ],
  },
  {
    id: 'struct://xfrontier/substrate-local-learning',
    title: { zh: '基底局部学习', en: 'Substrate-local learning' },
    statement: {
      zh: '全局任务被编码为自由态与受约束态的物理差异，每条局部连接只读身边信号就能更新，让训练发生在材料本身。',
      en: 'A global task is encoded as the physical difference between free and constrained states; each local connection updates from nearby signals so learning occurs in the material itself.',
    },
    status: 'active',
    theme: 'living-computation',
    provenance: XFRONTIER([1491]),
    mappings: [
      {
        slug: 'self-learning-matter',
        correspondences: [
          {
            quantity: { zh: '自由态—受约束态差', en: 'free–clamped state contrast' },
            inThisSubstrate: {
              zh: '自调电阻网络在无目标与施加目标输出时的局部电压响应差',
              en: 'the difference in local voltage response between unconstrained and target-clamped states of the adaptive resistor network',
            },
          },
          {
            quantity: { zh: '局部权重更新', en: 'local weight update' },
            inThisSubstrate: {
              zh: '每个晶体管仅根据自身端点电压改变导电参数',
              en: 'each transistor changing its conductance from voltages available at its own endpoints',
            },
          },
        ],
        prediction: {
          zh: '若映射成立，网络应在没有中央梯度的情况下通过反复物理弛豫学会任务，并在局部器件损伤后以同一局部规则重新收敛。',
          en: 'If the mapping holds, repeated physical relaxation should train the network without a central gradient, and the same local rule should let it reconverge after localized device damage.',
        },
        boundary: {
          zh: '物理松弛与算法优化都可使用局部规则，但器件噪声、耗散与材料限制会改变收敛条件，不能假定它们优化同一目标。',
          en: 'Physical relaxation and algorithmic optimization can both use local rules, but device noise, dissipation, and material limits change convergence conditions; they need not optimize the same objective.',
        },
      },
    ],
  },
  {
    id: 'struct://xfrontier/model-reality-loop',
    title: { zh: '模型—现实闭环', en: 'Model–reality loop' },
    statement: {
      zh: '可运行模型吸收现实观测、提出干预，再用干预结果校正自身；价值不在“像”，而在闭环内可检验地改进预测与行动。',
      en: 'An executable model assimilates observations, proposes interventions, and is corrected by their outcomes; its value lies not in resemblance but in testably improving prediction and action inside the loop.',
    },
    status: 'active',
    theme: 'simulation-twins',
    provenance: XFRONTIER([137, 964]),
    mappings: [
      {
        slug: 'cell-digital-twins-virtual-cells',
        correspondences: [
          {
            quantity: { zh: '现实观测流', en: 'real observation stream' },
            inThisSubstrate: {
              zh: '多组学、空间组学与扰动实验产生的细胞状态数据',
              en: 'cell-state data from multi-omics, spatial omics, and perturbation experiments',
            },
          },
          {
            quantity: { zh: '可运行孪生状态', en: 'executable twin state' },
            inThisSubstrate: {
              zh: '统一代谢、表达与信号过程、可被扰动的虚拟细胞状态',
              en: 'a perturbable virtual-cell state unifying metabolism, expression, and signalling processes',
            },
          },
        ],
        prediction: {
          zh: '若闭环成立，虚拟细胞在已声明可信域内应对留出扰动给出校准预测；离开该模块或时间尺度时，误差与不确定性必须同步上升而非继续自信。',
          en: 'If the loop holds, the virtual cell should give calibrated forecasts for held-out perturbations inside its declared validity domain, while error and uncertainty rise together outside that module or time scale.',
        },
        boundary: {
          zh: '模拟与观测相符仍可能来自不可识别的多套机制；闭环只有在湿实验扰动和独立测量锚定后才构成真实校正。',
          en: 'Simulation–observation agreement may still arise from non-identifiable mechanisms; the loop becomes a real correction only when anchored by wet-lab perturbations and independent measurements.',
        },
      },
      {
        slug: 'differentiable-manufacturing-simulation-gradient-based',
        correspondences: [
          {
            quantity: { zh: '目标现实轨迹', en: 'target real trajectory' },
            inThisSubstrate: {
              zh: '制造过程希望达到的温度场与熔池边界时间序列',
              en: 'the desired time series of temperature fields and melt-pool boundaries in manufacturing',
            },
          },
          {
            quantity: { zh: '可微干预控制', en: 'differentiable intervention control' },
            inThisSubstrate: {
              zh: '通过可微有限元孪生反演得到的逐时刻激光功率曲线',
              en: 'the time-resolved laser-power curve inferred through the differentiable finite-element twin',
            },
          },
        ],
        prediction: {
          zh: '若闭环成立，在已验证的平滑工况内，梯度反演曲线应比无梯度基线更接近目标热历史；接触或相变导致非光滑时优势应可测地衰减。',
          en: 'If the loop holds, within validated smooth regimes the gradient-inverted control should match the target thermal history better than gradient-free baselines, with a measurable loss of advantage at nonsmooth contact or phase transitions.',
        },
        boundary: {
          zh: '可微梯度只对模拟器内部目标可靠；若模型失真，优化会利用模拟漏洞，所得工艺未必能迁移到真实产线。',
          en: 'Differentiable gradients are reliable only for the simulator’s internal objective; with model error, optimization can exploit simulation loopholes and fail to transfer to the factory.',
        },
      },
    ],
  },
];
