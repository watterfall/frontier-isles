import type { FrontierEntry } from './frontiers';

/**
 * Wave 2 · Earth sensing → ecological intervention → living-system response.
 *
 * These records retain the source Atlas scores, cluster assignments, and
 * evidence URLs. Their questions deliberately turn broad promises into
 * observable comparisons, transfer tests, and failure boundaries.
 */
export const EARTH_LIFE_EXPANSION: FrontierEntry[] = [
  {
    id: 141,
    atlasN: 1420,
    slug: 'cold-atom-gravity-gradiometry',
    title: { zh: '冷原子量子重力梯度仪', en: 'Cold-Atom Quantum Gravity Gradiometry' },
    qfocus: {
      zh: '双云原子干涉能否在真实工地与野外抑制振动漂移，以可用速度可靠定位地下空洞和质量变化？',
      en: 'Can dual-cloud atom interferometry reject vibration and drift in real field conditions well enough to locate subsurface voids and mass change at a useful survey rate?',
    },
    domain: '物质',
    cluster: { code: 'C15', zh: '应用量子科学', en: 'Applied quantum science' },
    scores: [4, 4, 5, 1, 3, 2, 4, 2, 4],
    citation: {
      url: 'https://www.nature.com/articles/s41586-021-04315-3',
      title: 'Quantum sensing for gravity cartography',
      venue: 'Nature',
      year: 2022,
    },
    brief: {
      zh: '两组自由落体冷原子的差分物质波相位直接读取重力梯度，已从实验室走到户外地下测绘，但通量与环境鲁棒性仍决定实际价值。',
      en: 'Differential matter-wave phase from two free-falling cold-atom clouds reads gravity gradients directly and has moved into outdoor subsurface mapping, though throughput and environmental robustness still determine practical value.',
    },
    literature: [
      {
        title: 'Quantum gravity gradiometry for future mass change science',
        venue: 'EPJ Quantum Technology',
        year: 2025,
        url: 'https://link.springer.com/article/10.1140/epjqt/s40507-025-00338-1',
      },
    ],
    depth: {
      overview: {
        zh: '冷原子重力梯度仪让两团原子同时自由落体，以物质波干涉比较相隔一定高度的重力加速度，从而消除大量共模振动并读取地下密度差。2022 年的户外实验证明它能在真实地面条件下发现地下结构，但这只是从“能测”到“可常规测绘”的第一步。',
        en: 'Cold-atom gravity gradiometers let two atom clouds fall simultaneously and compare their matter-wave phases at separated heights, cancelling much common vibration while reading subsurface density contrast. A 2022 outdoor demonstration showed that buried structures can be detected under real ground conditions, but this is only the first step from “measurable” to routine surveying.',
      },
      whyMatters: {
        zh: '无需钻探的重力成像可服务地下管线、地质灾害、水储量与冰盖质量变化；若量子仪器的现场优势只存在于精心控制的慢测量中，它就难以替代成熟的经典重力仪。',
        en: 'Non-invasive gravity imaging could serve buried infrastructure, geohazards, water storage, and ice-sheet mass change; if the field advantage exists only in carefully controlled slow measurements, however, quantum instruments will not displace mature classical gravimeters.',
      },
      ifAnswered: {
        zh: '若灵敏度、通量与移动校准能同时成立，同一技术可从手推车式地下测绘扩展到长周期地球质量变化与未来卫星梯度观测。',
        en: 'If sensitivity, throughput, and mobile calibration can coexist, the same technology could scale from cart-based subsurface mapping to long-duration Earth mass-change monitoring and future satellite gradiometry.',
      },
      approaches: [
        {
          zh: '用上下双原子云差分干涉与同步经典传感器分离重力梯度、平台振动和倾斜。',
          en: 'Combine vertically separated dual-cloud interferometry with synchronized classical sensors to separate gravity gradients, platform vibration, and tilt.',
        },
        {
          zh: '在目标位置对分析者保盲的隧道、管线和空洞试验场，与经典重力仪做同时间、同路径基准。',
          en: 'Benchmark against classical gravimeters on the same route and schedule at blinded test sites containing tunnels, pipes, and voids.',
        },
        {
          zh: '通过重复路线与已知质量搬移实验量化日间漂移，并把误差模型外推到水储量和卫星任务。',
          en: 'Quantify diurnal drift through repeated routes and known mass-transfer experiments, then propagate the error model to water-storage and satellite missions.',
        },
      ],
      barrier: {
        zh: '原子制备死时间、激光相位噪声、倾斜与地面振动会共同降低现场通量；更高单次灵敏度并不自动转化为更快、更便宜的地图。',
        en: 'Atom-preparation dead time, laser phase noise, tilt, and ground vibration jointly reduce field throughput; higher single-shot sensitivity does not automatically yield a faster or cheaper map.',
      },
      subQuestions: [
        {
          zh: '在保盲试验中，仪器能以多大误差恢复未知空洞的深度、尺寸与位置？',
          en: 'In a blinded trial, with what error can the instrument recover an unknown void’s depth, size, and position?',
        },
        {
          zh: '按单位面积、单位时间和同一检出概率计算，它何时超过最佳经典重力仪？',
          en: 'At matched detection probability per area and survey time, when does it outperform the best classical gravimeter?',
        },
        {
          zh: '连续数月观测时，校准后的漂移是否低于目标水量或冰量变化产生的梯度信号？',
          en: 'Over months of operation, does calibrated drift remain below the gradient signal from the target water or ice mass change?',
        },
      ],
    },
    stage: 2,
    members: 4,
    activity: 51,
    chart: { x: 438, y: 344, scale: 0.88 },
  },
  {
    id: 142,
    atlasN: 1472,
    slug: 'volcano-muography-time-lapse',
    title: { zh: '火山缪子成像与时序监测', en: 'Volcano Muography and Time-Lapse Monitoring' },
    qfocus: {
      zh: '宇宙线缪子透射能否从静态密度图升级为对岩浆迁移有独立增益、误报可审计的准实时预警？',
      en: 'Can cosmic-ray muon transmission progress from static density maps to near-real-time warning that adds independent information about magma migration with auditable false alarms?',
    },
    domain: '物质',
    cluster: { code: 'C29', zh: '地球·海洋·深时科学', en: 'Earth · ocean · deep-time science' },
    scores: [3, 5, 5, 2, 3, 2, 4, 3, 4],
    citation: {
      url: 'https://doi.org/10.1029/2023JB028514',
      title: 'Branched Conduit Structure Beneath the Active Craters of Sakurajima Volcano Inferred From Muography',
      venue: 'JGR: Solid Earth',
      year: 2024,
    },
    brief: {
      zh: '把大气宇宙线产生的高穿透缪子当作天然 X 光，反演火山通道、火山口塞和穹丘的密度，并尝试用时序变化追踪岩浆。',
      en: 'Use penetrating atmospheric muons as natural X-rays to invert the density of volcanic conduits, plugs, and domes, then track time-varying density as a proxy for magma movement.',
    },
    literature: [
      {
        title: 'Muography for structural characterization of volcanoes: a case study at Mount Unzen, Japan',
        venue: 'Geophysical Journal International',
        year: 2025,
        url: 'https://doi.org/10.1093/gji/ggaf482',
      },
      {
        title: 'Updates on MURAVES Project at Mt. Vesuvius',
        venue: 'arXiv',
        year: 2025,
        url: 'https://arxiv.org/abs/2505.14090',
      },
    ],
    depth: {
      overview: {
        zh: '缪子成像测量不同方向上穿透火山体后的宇宙线缪子通量，以衰减反演路径积分密度。新一代模块化探测器开始解析分叉通道并做时间序列，但低通量意味着高时间分辨率与高空间分辨率不能同时免费获得。',
        en: 'Muography measures cosmic-ray muon flux after passage through a volcano and inverts attenuation into line-integrated density. New modular detectors are resolving branched conduits and beginning time-series observations, but low flux means high temporal and spatial resolution cannot both be obtained for free.',
      },
      whyMatters: {
        zh: '密度变化可能补足地震、形变和气体观测看不到的岩浆位置，但单一视角的反演不唯一；如果没有独立验证，漂亮的断层图不能自动成为预警。',
        en: 'Density change may reveal magma locations missed by seismic, deformation, and gas observations, but single-view inversion is non-unique; without independent validation, an attractive tomogram does not automatically become a warning system.',
      },
      ifAnswered: {
        zh: '若时序缪子信号在多座火山上都能提前且独立解释活动变化，它可成为多物理火山监测网中的密度通道。',
        en: 'If time-lapse muon signals independently explain activity changes in advance across multiple volcanoes, muography could become the density channel in multiphysics volcano-monitoring networks.',
      },
      approaches: [
        {
          zh: '从多个方位部署同步探测器，以减少路径积分反演的几何歧义。',
          en: 'Deploy synchronized detectors at multiple azimuths to reduce geometric ambiguity in line-integral inversion.',
        },
        {
          zh: '联合反演缪子、重力、地震与形变数据，并在留出的喷发阶段检验预测增益。',
          en: 'Jointly invert muon, gravity, seismic, and deformation data, testing predictive gain on held-out eruptive episodes.',
        },
        {
          zh: '用稳定岩体、天气与探测器效率校正建立时序空模型，预注册变化报警阈值。',
          en: 'Build a time-series null model from stable rock, weather, and detector-efficiency corrections, and preregister change-alert thresholds.',
        },
      ],
      barrier: {
        zh: '缪子计数率低、可用视角受地形限制，且大气与探测器效率变化会伪装成密度变化；实时预警需要比静态成像严格得多的校准。',
        en: 'Muon counts are low, usable viewing angles are terrain-limited, and atmospheric or detector-efficiency changes can mimic density change; real-time warning demands much stricter calibration than static imaging.',
      },
      subQuestions: [
        {
          zh: '在不读取地震和形变数据的盲测中，缪子时序能提前识别哪些已知岩浆迁移事件？',
          en: 'In a blind analysis without seismic or deformation data, which known magma-migration events can the muon time series identify in advance?',
        },
        {
          zh: '加入缪子数据后，联合模型对留出事件的定位误差和预警提前量改善多少？',
          en: 'How much does adding muography improve location error and warning lead time on held-out events in a joint model?',
        },
        {
          zh: '稳定期连续一年运行时，预注册阈值会产生多少次由天气或效率漂移导致的误报？',
          en: 'During one stable year, how many false alerts does a preregistered threshold produce from weather or efficiency drift?',
        },
      ],
    },
    stage: 2,
    members: 4,
    activity: 47,
    chart: { x: 542, y: 318, scale: 0.86 },
  },
  {
    id: 143,
    atlasN: 1418,
    slug: 'convergent-cross-mapping-causal-transfer',
    title: { zh: '收敛交叉映射的非线性因果迁移', en: 'Nonlinear Causal Transfer with Convergent Cross Mapping' },
    qfocus: {
      zh: '收敛交叉映射何时真的识别生态与气候反馈，何时只是共同驱动、同步或非平稳性制造的流形假因果？',
      en: 'When does convergent cross mapping identify real ecological or climate feedback, and when does common forcing, synchrony, or nonstationarity manufacture manifold-based false causality?',
    },
    domain: '数理',
    cluster: { code: 'C41', zh: '跨域方法移植', en: 'Cross-Domain Method Transplant' },
    scores: [4, 4, 4, 4, 3, 5, 3, 4, 4],
    citation: {
      url: 'https://doi.org/10.1088/1741-2552/ada0e7',
      title: 'Non-parametric full cross mapping (NFCM): a highly-stable measure for causal brain network and a pilot application',
      venue: 'Journal of Neural Engineering',
      year: 2025,
    },
    brief: {
      zh: '用 Takens 嵌入从时间序列重建吸引子流形，再以跨流形预测随样本量收敛来寻找非线性耦合；关键前沿是明确它的假阳性边界。',
      en: 'Reconstruct attractor manifolds from time series via Takens embedding, then seek nonlinear coupling through cross-manifold prediction that converges with sample size; the frontier is to delimit its false-positive regime.',
    },
    literature: [
      {
        title: 'Causal Feedback Discovery using Convergence Cross Mapping on Sea Ice Data',
        venue: 'arXiv',
        year: 2025,
        url: 'https://arxiv.org/abs/2505.09001',
      },
      {
        title: 'Causalized Convergent Cross Mapping and Its Implementation in Causality Analysis',
        venue: 'Entropy',
        year: 2024,
        url: 'https://www.mdpi.com/1099-4300/26/7/539',
      },
    ],
    depth: {
      overview: {
        zh: '收敛交叉映射（CCM）基于状态空间重建：若变量 X 因果影响 Y，Y 的吸引子流形应包含可恢复 X 的信息，而且恢复能力应随样本库增长而收敛。它适合弱、双向和非线性耦合，却不是免假设的因果机器。',
        en: 'Convergent cross mapping (CCM) is based on state-space reconstruction: if X causally influences Y, Y’s attractor manifold should contain recoverable information about X, with recovery improving as the library grows. It is suited to weak, bidirectional, nonlinear coupling, but it is not an assumption-free causal machine.',
      },
      whyMatters: {
        zh: '生态、海冰、神经和生理反馈常违反线性 Granger 模型；一个经压力测试的共同工具可让这些领域交换方法，同时避免把数学相似误写成同一机制。',
        en: 'Ecological, sea-ice, neural, and physiological feedback often violates linear Granger models; a stress-tested common tool could let these fields exchange methods without rewriting mathematical similarity as identical mechanism.',
      },
      ifAnswered: {
        zh: '若能形成带诊断图、负对照与失效标签的统一协议，CCM 可成为非线性系统的可审计因果探针，而非只给出方向箭头。',
        en: 'With a unified protocol of diagnostics, negative controls, and failure labels, CCM could become an auditable causal probe for nonlinear systems rather than merely producing directional arrows.',
      },
      approaches: [
        {
          zh: '在已知方程、共同驱动和同步强度可控的模拟系统上绘制假阳性相图。',
          en: 'Map false-positive regimes on simulated systems with known equations and controlled common forcing and synchrony.',
        },
        {
          zh: '把收敛曲线、时间错位检验和季节替代数据作为必报诊断，而非只报告相关系数。',
          en: 'Require convergence curves, time-lag tests, and seasonal surrogate data as diagnostics rather than reporting only a score.',
        },
        {
          zh: '在海冰、生态与神经数据上预注册候选边，并用独立干预或外部事件验证。',
          en: 'Preregister candidate edges in sea-ice, ecological, and neural data, then validate them with independent interventions or external events.',
        },
      ],
      barrier: {
        zh: '共同季节驱动、强同步、短序列与体制切换都可能产生貌似收敛的交叉预测；Takens 条件在真实观测中通常无法直接验证。',
        en: 'Common seasonal forcing, strong synchrony, short records, and regime shifts can all produce apparently convergent cross-prediction, while Takens conditions are rarely directly verifiable in observations.',
      },
      subQuestions: [
        {
          zh: '在含共同驱动但无直接边的基准系统上，哪组诊断能把假阳性率稳定压到预注册阈值以下？',
          en: 'On benchmark systems with common forcing but no direct edge, which diagnostics keep false positives below a preregistered threshold?',
        },
        {
          zh: '推断方向是否在改变采样频率、嵌入维数和时间窗后保持不变？',
          en: 'Does inferred direction remain stable after changing sampling rate, embedding dimension, and time window?',
        },
        {
          zh: '在一处海冰区发现的反馈边，能否在留出的年份和另一片海域中预测独立观测？',
          en: 'Can a feedback edge discovered in one sea-ice region predict independent observations in held-out years and another region?',
        },
      ],
    },
    stage: 1,
    members: 4,
    activity: 44,
    chart: { x: 252, y: 576, scale: 0.84 },
  },
  {
    id: 144,
    atlasN: 1475,
    slug: 'enhanced-rock-weathering-mrv',
    title: { zh: '增强岩石风化的碳移除 MRV', en: 'Carbon-Removal MRV for Enhanced Rock Weathering' },
    qfocus: {
      zh: '在异质农田中，能否闭合阳离子、碱度与下游损失的质量平衡，区分真实 CO₂ 移除与土壤背景波动？',
      en: 'In heterogeneous cropland, can cation, alkalinity, and downstream-loss mass balances distinguish real CO2 removal from soil background variability?',
    },
    domain: '交叉',
    cluster: { code: 'C13', zh: '气候·地球生物工程', en: 'Climate · planetary bioengineering' },
    scores: [3, 4, 4, 3, 3, 3, 4, 3, 2],
    citation: {
      url: 'https://pubs.acs.org/doi/10.1021/acs.est.5c09820',
      title: 'Three Years of Field Trials Indicate a Sustained Enhanced Rock Weathering Signal with Limited CO2 Removal',
      venue: 'Environmental Science & Technology',
      year: 2025,
    },
    brief: {
      zh: '把玄武岩等硅酸盐撒入农田容易，难的是在数年尺度上把有限风化信号从土壤异质性中分离，并给出可核查的净移除量。',
      en: 'Spreading silicates such as basalt on cropland is easy; the hard part is separating a limited multi-year weathering signal from soil heterogeneity and reporting verifiable net removal.',
    },
    literature: [
      {
        title: 'Reviews and syntheses: Carbon vs. cation based MRV of Enhanced Rock Weathering and the issue of soil organic carbon',
        venue: 'Biogeosciences',
        year: 2026,
        url: 'https://bg.copernicus.org/articles/23/53/2026/',
      },
      {
        title: 'Evidence for carbon dioxide removal via enhanced rock weathering with steel slag, though not basalt, in a midwestern U.S. field trial',
        venue: 'Frontiers in Climate',
        year: 2025,
        url: 'https://www.frontiersin.org/journals/climate/articles/10.3389/fclim.2025.1657058/full',
      },
    ],
    depth: {
      overview: {
        zh: '增强岩石风化（ERW）以粉碎硅酸盐在土壤中反应，理论上把大气 CO₂ 转成溶解无机碳并最终输往水体。最新田间试验既观察到持续风化信号，也显示净移除可能有限，因此前沿已从“反应会不会发生”转向多示踪剂 MRV。',
        en: 'Enhanced rock weathering (ERW) reacts crushed silicates in soil, in principle converting atmospheric CO2 into dissolved inorganic carbon that eventually reaches water. Recent field trials observe sustained weathering signals but potentially limited net removal, moving the frontier from “does reaction occur?” to multi-tracer MRV.',
      },
      whyMatters: {
        zh: 'ERW 可利用既有农业物流并可能改善土壤，但碳市场若把阳离子变化直接当作移除量，会混入植物吸收、肥料、侵蚀和土壤有机碳变化。',
        en: 'ERW can use existing farm logistics and may benefit soil, but carbon markets that equate cation change with removal risk conflating plant uptake, fertilizer, erosion, and soil-organic-carbon change.',
      },
      ifAnswered: {
        zh: '若独立方法能在田块尺度给出相容的净移除和置信区间，ERW 才能从示范走向可比较、可核验的气候干预。',
        en: 'Only if independent methods yield compatible field-scale net removal and confidence intervals can ERW move from demonstration to a comparable, verifiable climate intervention.',
      },
      approaches: [
        {
          zh: '联合测量固相阳离子亏损、孔隙水碱度、同位素与排水通量，闭合田块质量平衡。',
          en: 'Combine solid-phase cation depletion, porewater alkalinity, isotopes, and drainage flux to close a field mass balance.',
        },
        {
          zh: '设置多层基线和未施加对照，使用分层取样估计土壤异质性而不是假定均匀。',
          en: 'Use multi-depth baselines and untreated controls with stratified sampling to estimate rather than assume soil homogeneity.',
        },
        {
          zh: '将风化机理模型冻结后预测留出季节与下游采样点，再由独立团队复核。',
          en: 'Freeze a process model before predicting held-out seasons and downstream sites, then have an independent team audit it.',
        },
      ],
      barrier: {
        zh: '风化信号相对土壤天然变异很小，阳离子与碳通量又会被植物、肥料和有机碳耦合改变，单一代理量无法唯一归因。',
        en: 'The weathering signal is small relative to natural soil variation, while plants, fertilizer, and organic carbon jointly alter cation and carbon fluxes, making any single proxy non-identifying.',
      },
      subQuestions: [
        {
          zh: '三种独立 MRV 路线对同一田块净移除量的 95% 区间是否重叠？',
          en: 'Do three independent MRV routes yield overlapping 95% intervals for net removal on the same field?',
        },
        {
          zh: '在留出田块上，模型能否同时预测阳离子亏损、排水碱度和下游碳通量？',
          en: 'On held-out fields, can the model jointly predict cation depletion, drainage alkalinity, and downstream carbon flux?',
        },
        {
          zh: '计入粉碎运输、微量金属释放和土壤有机碳变化后，净气候效益是否仍为正？',
          en: 'After grinding, transport, trace-metal release, and soil-organic-carbon change are included, does net climate benefit remain positive?',
        },
      ],
    },
    stage: 1,
    members: 4,
    activity: 46,
    chart: { x: 718, y: 458, scale: 0.86 },
  },
  {
    id: 145,
    atlasN: 1478,
    slug: 'ocean-alkalinity-enhancement-in-situ-mrv',
    title: { zh: '海洋碱度增强与原位 MRV', en: 'Ocean Alkalinity Enhancement and In-Situ MRV' },
    qfocus: {
      zh: '在开放海洋的混合与生态背景噪声中，示踪剂和传感器能否独立核实新增碱度真正带来的持久 CO₂ 移除？',
      en: 'Amid open-ocean mixing and ecological background noise, can tracers and sensors independently verify the durable CO2 removal caused by added alkalinity?',
    },
    domain: '交叉',
    cluster: { code: 'C13', zh: '气候·地球生物工程', en: 'Climate · planetary bioengineering' },
    scores: [3, 5, 4, 2, 3, 2, 3, 2, 2],
    citation: {
      url: 'https://www.whoi.edu/press-room/news-release/oae-prelim/',
      title: 'Preliminary results from the first EPA-permitted ocean alkalinity enhancement (OAE) field trial (LOC-NESS)',
      venue: 'Woods Hole Oceanographic Institution',
      year: 2025,
    },
    brief: {
      zh: '向海水增加碱度以促进吸收 CO₂，并以示踪释放和传感器阵列追踪真实固碳；当前证据仍以早期获批试验和 MRV 方法开发为主。',
      en: 'Add alkalinity to seawater to promote CO2 uptake, then trace actual removal with controlled releases and sensor arrays; current evidence remains centered on early permitted trials and MRV-method development.',
    },
    literature: [
      {
        title: 'A tracer study for the development of in-water monitoring, reporting, and verification (MRV) of ship-based ocean alkalinity enhancement',
        venue: 'Biogeosciences (Copernicus)',
        year: 2025,
        url: 'https://bg.copernicus.org/articles/22/5511/2025/',
      },
    ],
    depth: {
      overview: {
        zh: '海洋碱度增强（OAE）通过投加碱性物质改变碳酸盐体系，使海水能从空气吸收更多 CO₂。真正的实验难题是追踪被洋流稀释的处理水团，并把测得的总碱度、溶解无机碳和气海交换转换为可审计的持久移除量。',
        en: 'Ocean alkalinity enhancement (OAE) changes carbonate chemistry by adding alkaline material so seawater can absorb more atmospheric CO2. The experimental challenge is to follow a treated water mass as currents dilute it and translate total alkalinity, dissolved inorganic carbon, and air-sea exchange into auditable durable removal.',
      },
      whyMatters: {
        zh: '海洋容量巨大，但开放水体没有清晰边界；如果 MRV 只能依赖模型而不能被示踪与独立观测约束，规模化信用将建立在不可核实的反事实上。',
        en: 'The ocean has immense capacity but no clear project boundary; if MRV depends on models unconstrained by tracers and independent observation, scaled credits will rest on an unverifiable counterfactual.',
      },
      ifAnswered: {
        zh: '若原位观测能给出守恒、可复核且包含生态副作用的碳账本，OAE 才可能从许可示范进入负责任的规模试验。',
        en: 'If in-situ observation yields a conserved, reproducible carbon ledger that includes ecological side effects, OAE could progress from permitted demonstrations to responsible scale trials.',
      },
      approaches: [
        {
          zh: '共同释放惰性示踪剂与碱度，分离物理稀释和碳酸盐化学变化。',
          en: 'Co-release an inert tracer with alkalinity to separate physical dilution from carbonate-chemistry change.',
        },
        {
          zh: '用船载、浮标和自主平台同步测量总碱度、DIC、pH、pCO₂ 与生物响应。',
          en: 'Synchronize ship, buoy, and autonomous-platform measurements of alkalinity, DIC, pH, pCO2, and biological response.',
        },
        {
          zh: '由不参与投加的团队使用预注册模型和盲化样本独立重建净移除。',
          en: 'Have a team uninvolved in dosing independently reconstruct net removal using a preregistered model and blinded samples.',
        },
      ],
      barrier: {
        zh: '快速混合、气海交换滞后与天然碱度变化会让处理信号消失在背景中；局地化学响应也不能自动证明长期大气移除。',
        en: 'Rapid mixing, delayed air-sea exchange, and natural alkalinity variability can bury the treatment signal; a local chemical response does not automatically prove long-term atmospheric removal.',
      },
      subQuestions: [
        {
          zh: '以惰性示踪剂校正稀释后，观测碳增量与预注册碳酸盐模型相差多少？',
          en: 'After inert-tracer dilution correction, how far does observed carbon uptake differ from the preregistered carbonate model?',
        },
        {
          zh: '两个独立团队仅用封存数据能否把同一试验的净移除估计到相容区间？',
          en: 'Can two independent teams using escrowed data estimate compatible net removal for the same trial?',
        },
        {
          zh: '处理水团中的浮游生物、生物矿化和微量金属响应是否超出预设生态非劣界值？',
          en: 'Do plankton, biomineralization, or trace-metal responses in the treated plume cross preregistered ecological non-inferiority bounds?',
        },
      ],
    },
    stage: 1,
    members: 3,
    activity: 39,
    chart: { x: 792, y: 430, scale: 0.82 },
  },
  {
    id: 146,
    atlasN: 1385,
    slug: 'population-edna-human-genetic-bycatch',
    title: { zh: 'eDNA 群体基因组学与人类遗传副渔获', en: 'Population-Genomic eDNA and Human Genetic Bycatch' },
    qfocus: {
      zh: '环境样本能否可靠解析濒危种群遗传变化，同时用技术与治理护栏阻止可识别的人类基因组副渔获？',
      en: 'Can environmental samples reliably resolve endangered-population genomic change while technical and governance guardrails prevent identifiable human genomic bycatch?',
    },
    domain: '交叉',
    cluster: { code: 'C05', zh: '环境组学·行星感知', en: 'Environmental omics · planetary sensing' },
    scores: [4, 4, 4, 2, 4, 2, 3, 3, 4],
    citation: {
      url: 'https://www.nature.com/articles/s41559-023-02056-2',
      title: 'Inadvertent human genomic bycatch and intentional capture raise beneficial applications and ethical concerns with environmental DNA',
      venue: 'Nature Ecology & Evolution',
      year: 2023,
    },
    brief: {
      zh: '鸟枪法环境 DNA 已能触及种内变异与全生物群落，却也会捕获附近人群的可识别遗传片段，把生态监测直接推入隐私与同意边界。',
      en: 'Shotgun environmental DNA is reaching intraspecific variation and whole-biome assessment while also capturing identifiable genetic fragments from nearby people, placing ecological monitoring directly inside privacy and consent boundaries.',
    },
    literature: [
      {
        title: 'Shotgun sequencing of airborne eDNA achieves rapid assessment of whole biomes, population genetics and genomic variation',
        venue: 'Nature Ecology & Evolution',
        year: 2025,
        url: 'https://www.nature.com/articles/s41559-025-02711-w',
      },
    ],
    depth: {
      overview: {
        zh: '环境 DNA 正从物种检出迈向低拷贝核 DNA 和鸟枪测序，以水、沙和空气样本恢复种群变异。相同灵敏度会无意捕获人的线粒体与核基因组，因此“更深测序”同时提高保护能力和监控风险。',
        en: 'Environmental DNA is moving from species detection toward low-copy nuclear DNA and shotgun sequencing that recover population variation from water, sand, and air. The same sensitivity inadvertently captures human mitochondrial and nuclear genomes, so deeper sequencing simultaneously increases conservation power and surveillance risk.',
      },
      whyMatters: {
        zh: '非侵入式种群遗传监测可减少捕捉濒危动物，却可能在公共空间收集未经同意的人类遗传信息；技术性能与伦理安全不能分开验收。',
        en: 'Non-invasive population genetics can reduce capture of endangered animals, yet may collect human genetic information without consent in public space; technical performance and ethical safety cannot be accepted separately.',
      },
      ifAnswered: {
        zh: '若低拷贝变异可重复且人类信号能在采集、分析和发布各层受控，eDNA 可成为种群级保护工具而不演变为环境基因监控。',
        en: 'If low-copy variants are reproducible and human signal is controlled at collection, analysis, and release layers, eDNA could become a population-level conservation tool without becoming environmental genetic surveillance.',
      },
      approaches: [
        {
          zh: '用已知个体和混合比例的盲样评估低频等位基因检出、污染与批次偏差。',
          en: 'Use blinded mixtures of known individuals and proportions to evaluate rare-allele detection, contamination, and batch bias.',
        },
        {
          zh: '比较采前伦理分区、湿实验人类序列阻断与计算过滤的隐私—生态信息权衡。',
          en: 'Compare pre-collection ethical zoning, wet-lab human-sequence blocking, and computational filtering for privacy-versus-ecological-information trade-offs.',
        },
        {
          zh: '以社区共同治理的数据访问层发布种群统计，而不公开可重识别原始读段。',
          en: 'Release population summaries through community-governed access layers without publishing re-identifiable raw reads.',
        },
      ],
      barrier: {
        zh: '低丰度核 DNA 易受降解、混合和污染影响，而彻底删除人类读段可能同时误删保守的非人序列；不存在零代价过滤。',
        en: 'Low-abundance nuclear DNA is vulnerable to degradation, mixture, and contamination, while removing all human reads can also erase conserved nonhuman sequence; there is no zero-cost filter.',
      },
      subQuestions: [
        {
          zh: '在未知混合比例的盲样中，种群等位基因频率的误差能否低于保护决策阈值？',
          en: 'In blinded mixtures with unknown proportions, can population allele-frequency error stay below a conservation decision threshold?',
        },
        {
          zh: '哪种阻断方案能把可重识别人类读段降低 99% 而保留至少 95% 的目标物种信息？',
          en: 'Which blocking scheme reduces re-identifiable human reads by 99% while retaining at least 95% of target-species information?',
        },
        {
          zh: '不同社区是否会对同一采样地点给出不同可接受边界，治理协议能否在采样前执行？',
          en: 'Do communities set different acceptable boundaries for the same sampling site, and can the governance protocol be enforced before collection?',
        },
      ],
    },
    stage: 1,
    members: 4,
    activity: 42,
    chart: { x: 858, y: 494, scale: 0.84 },
  },
  {
    id: 147,
    atlasN: 1493,
    slug: 'biological-foundation-model-mechanistic-interpretability',
    title: {
      zh: '生物基础模型的机制可解释性',
      en: 'Mechanistic Interpretability of Biological Foundation Models',
    },
    qfocus: {
      zh: '稀疏自编码器从蛋白质或基因组模型中拆出的特征，能否前瞻预测未标注的结合位点与功能机制，而不只是重述训练数据相关性？',
      en: 'Can features extracted from protein or genomic models by sparse autoencoders prospectively predict unannotated binding sites and functional mechanisms rather than merely restating training-data correlations?',
    },
    domain: '生命',
    cluster: {
      code: 'C42',
      zh: 'AI对齐·可解释·评测科学',
      en: 'AI alignment · interpretability · evaluation science',
    },
    scores: [4, 4, 5, 4, 3, 4, 4, 5, 3],
    citation: {
      url: 'https://www.nature.com/articles/s41592-025-02836-7',
      title: 'InterPLM: discovering interpretable features in protein language models via sparse autoencoders',
      venue: 'Nature Methods',
      year: 2025,
    },
    brief: {
      zh: '把为大语言模型开发的稀疏自编码器与字典学习移植到蛋白质和基因组基础模型，从叠加表示中拆出对应结合位点、结构基序与功能域的特征。',
      en: 'Transfer sparse autoencoders and dictionary learning from language-model interpretability to protein and genomic foundation models, decomposing superposed representations into features associated with binding sites, structural motifs, and functional domains.',
    },
    literature: [
      {
        title: 'Sparse autoencoders uncover biologically interpretable features in protein language model representations',
        venue: 'PNAS',
        year: 2025,
        url: 'https://www.pnas.org/doi/10.1073/pnas.2506316122',
      },
    ],
    depth: {
      overview: {
        zh: '蛋白质和基因组基础模型把大量生物规律压进高维叠加表示，却很难说明某次预测依赖什么机制。稀疏自编码器用过完备字典把这些激活拆成较少同时出现的特征；InterPLM 等工作已把部分特征对齐到已知结构和功能注释，下一步是检验它们能否发现模型训练后仍未知的生物学。',
        en: 'Protein and genomic foundation models compress extensive biological regularities into high-dimensional superposed representations, but rarely reveal which mechanism supports a prediction. Sparse autoencoders use an overcomplete dictionary to decompose those activations into features that fire sparsely; systems such as InterPLM already align some features with known structural and functional annotations, and the next test is whether they can uncover biology still unknown after model training.',
      },
      whyMatters: {
        zh: '若可解释特征能提出并通过新的湿实验检验，模型就不只是预测器，而会成为寻找结合位点、功能域和突变机制的“计算显微镜”。反之，漂亮的特征可视化可能只是字典宽度、正则化和训练语料共同制造的后验故事。',
        en: 'If interpretable features can propose hypotheses that survive new wet-lab tests, the model becomes more than a predictor: it becomes a computational microscope for binding sites, domains, and mutational mechanisms. Otherwise, appealing feature visualizations may be post-hoc stories produced jointly by dictionary width, regularization, and the training corpus.',
      },
      ifAnswered: {
        zh: '若特征跨模型、随机种子和蛋白家族保持稳定，并能前瞻预测干预结果，机制可解释性可直接生成可证伪的生物学假说并缩小实验搜索空间。',
        en: 'If features remain stable across models, random seeds, and protein families and prospectively predict intervention outcomes, mechanistic interpretability could directly generate falsifiable biological hypotheses and narrow experimental search.',
      },
      approaches: [
        {
          zh: '在多个 ESM-2 层级和模型规模上训练稀疏自编码器，跨随机种子、字典宽度与正则强度测量特征稳定性。',
          en: 'Train sparse autoencoders across ESM-2 layers and model scales, measuring feature stability across random seeds, dictionary widths, and regularization strengths.',
        },
        {
          zh: '以严格留出的同源家族和注释时间切片检验特征—结构—功能对应，阻断序列记忆与数据库泄漏。',
          en: 'Test feature-to-structure-to-function correspondences on strictly held-out homologous families and annotation-time splits to block sequence memorization and database leakage.',
        },
        {
          zh: '用特征激活、抑制和定点突变提出冻结预测，再以结合、结构或功能测定做盲化湿实验验证。',
          en: 'Use feature activation, suppression, and targeted mutations to make frozen predictions, then validate them in blinded binding, structural, or functional assays.',
        },
      ],
      barrier: {
        zh: '稀疏字典并不唯一，同一激活可被多个同样稀疏的基重构；已知注释相关性也可能来自训练集记忆。没有跨模型稳定性、因果干预和前瞻湿实验，不能把一个可命名特征当作生物机制。',
        en: 'Sparse dictionaries are not unique, and the same activation may admit several equally sparse reconstructions; correlation with known annotations may also come from training-set memory. Without cross-model stability, causal intervention, and prospective wet-lab tests, a nameable feature is not yet a biological mechanism.',
      },
      subQuestions: [
        {
          zh: '同一结合位点或结构基序的特征能否在不同模型规模、训练种子和稀疏度下以可匹配方向重复出现？',
          en: 'Does a feature for the same binding site or structural motif recur in a matchable direction across model scales, training seeds, and sparsity levels?',
        },
        {
          zh: '激活或消融一个特征后，对留出蛋白质突变效应的预测是否按预注册方向和效应量改变？',
          en: 'After activating or ablating a feature, does the predicted mutation effect on held-out proteins change in the preregistered direction and magnitude?',
        },
        {
          zh: '一个未对应现有数据库注释的稳定特征，能否产生并通过盲化实验验证新的功能机制假说？',
          en: 'Can a stable feature with no existing database annotation generate a new functional-mechanism hypothesis that survives blinded experimental validation?',
        },
      ],
    },
    stage: 2,
    members: 5,
    activity: 56,
    chart: { x: 612, y: 210, scale: 0.9 },
  },
  {
    id: 148,
    atlasN: 1387,
    slug: 'field-deployable-whole-cell-biosensors',
    title: { zh: '可现场部署的工程活细胞生物传感器', en: 'Field-Deployable Engineered Whole-Cell Biosensors' },
    qfocus: {
      zh: '工程细菌能否在复杂环境样本中长期、特异且可封存地报告污染物，而不是只在缓冲液里产生漂亮信号？',
      en: 'Can engineered bacteria report pollutants specifically, durably, and with containment in complex environmental samples rather than only producing clean signals in buffer?',
    },
    domain: '生命',
    cluster: { code: 'C10', zh: '分布式生物传感·诊断', en: 'Distributed biosensing · diagnostics' },
    scores: [3, 4, 5, 5, 4, 4, 3, 4, 3],
    citation: {
      url: 'https://doi.org/10.1038/s41467-025-62256-1',
      title: 'Multichannel bioelectronic sensing using engineered Escherichia coli',
      venue: 'Nature Communications',
      year: 2025,
    },
    brief: {
      zh: '把污染物响应基因回路接到电输出、光纤或纸基读出，让细菌成为可编程环境探针；多通道器件已有进展，现场基质与生物安全仍是门槛。',
      en: 'Couple pollutant-responsive gene circuits to electrical, fiber, or paper readout so bacteria become programmable environmental probes; multichannel devices are emerging, while field matrices and biosafety remain the gate.',
    },
    literature: [
      {
        title: 'Development of a user-friendly IdgS-Sfp based whole-cell biosensor for high-performance Hg(II) detection in environmental samples',
        venue: 'Microchemical Journal',
        year: 2025,
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S0026265X25034496',
      },
    ],
    depth: {
      overview: {
        zh: '全细胞传感器把天然调控蛋白或工程受体接到显色、发光或电输出，使活细胞完成分子识别与信号放大。新的多通道生物电子系统可同时读取多个细菌回路，但现场水土中的毒性、混合污染和温度会改变细胞本身。',
        en: 'Whole-cell sensors connect natural regulators or engineered receptors to color, light, or electrical outputs, letting living cells perform molecular recognition and amplification. New multichannel bioelectronic systems can read several bacterial circuits at once, but toxicity, mixed contamination, and temperature in real water or soil alter the cells themselves.',
      },
      whyMatters: {
        zh: '低成本活体探针可把分子检测下沉到社区和偏远现场，并报告生物可利用浓度；其可复制性和释放风险必须与检测性能同等可见。',
        en: 'Low-cost living probes could move molecular detection into communities and remote sites while reporting bioavailable concentration; reproducibility and release risk must be as visible as detection performance.',
      },
      ifAnswered: {
        zh: '若多路校准、遗传稳定和物理封存可共同维持，开源回路与标准读出可组成分布式环境诊断网络。',
        en: 'If multiplex calibration, genetic stability, and physical containment hold together, open circuits and standard readouts could form a distributed environmental diagnostic network.',
      },
      approaches: [
        {
          zh: '在真实河水、土壤浸提液与工业废水中，以标准化学法盲测灵敏度、特异性和恢复时间。',
          en: 'Blind-test sensitivity, specificity, and recovery time in real river water, soil extracts, and industrial wastewater against standard analytical chemistry.',
        },
        {
          zh: '用正交回路和内置活性对照分离“没有污染物”与“细胞已经失活”。',
          en: 'Use orthogonal circuits and an internal viability control to separate “no pollutant” from “the cells are dead.”',
        },
        {
          zh: '比较凝胶、膜与无细胞终止设计的泄漏、水平转移和数周信号稳定性。',
          en: 'Compare gel, membrane, and terminal cell-free designs for leakage, horizontal transfer, and multi-week signal stability.',
        },
      ],
      barrier: {
        zh: '环境基质会同时抑制细胞和干扰读出，工程回路也会突变或发生水平转移；提高活性通常与提高封存安全相冲突。',
        en: 'Environmental matrices can suppress cells and interfere with readout, while engineered circuits mutate or transfer horizontally; increasing activity often conflicts with increasing containment.',
      },
      subQuestions: [
        {
          zh: '在 100 个保盲现场样本上，传感器相对 ICP-MS 或标准分析的假阴性率是多少？',
          en: 'Across 100 blinded field samples, what is the sensor’s false-negative rate relative to ICP-MS or standard analysis?',
        },
        {
          zh: '连续四周温度循环后，多路回路的校准斜率和串扰变化多少？',
          en: 'After four weeks of temperature cycling, how much do multiplex calibration slopes and cross-talk change?',
        },
        {
          zh: '封存装置在模拟破损后是否仍把活细胞外逸和可转移 DNA 压到预设限值以下？',
          en: 'After simulated damage, does containment keep live-cell escape and transferable DNA below preset limits?',
        },
      ],
    },
    stage: 1,
    members: 4,
    activity: 48,
    chart: { x: 680, y: 260, scale: 0.86 },
  },
  {
    id: 149,
    atlasN: 1388,
    slug: 'environmental-rna-ecosystem-activity',
    title: { zh: '环境 RNA 生态活性监测', en: 'Environmental RNA Monitoring of Ecosystem Activity' },
    qfocus: {
      zh: 'eRNA 能否跨物种和水体稳定区分“仍然在场”与“正在应激或繁殖”，而不被快速降解和采样偏差支配？',
      en: 'Can eRNA consistently distinguish “still present” from “currently stressed or reproducing” across species and waters without being dominated by rapid decay and sampling bias?',
    },
    domain: '生命',
    cluster: { code: 'C05', zh: '环境组学·行星感知', en: 'Environmental omics · planetary sensing' },
    scores: [3, 4, 4, 3, 3, 3, 3, 4, 4],
    citation: {
      url: 'https://doi.org/10.1016/j.ecolind.2025.114328',
      title: 'Environmental RNA as a transformative tool for aquatic ecosystem health assessment: progress and challenges',
      venue: 'Ecological Indicators',
      year: 2025,
    },
    brief: {
      zh: '利用比 eDNA 更短命的环境转录本读取活体活动与应激状态，把生态普查从“谁在这里”推进到“它们过得怎样”。',
      en: 'Use shorter-lived environmental transcripts than eDNA to read current activity and stress, moving ecological census from “who is here” to “how are they doing.”',
    },
    literature: [
      {
        title: 'Environmental RNA-Based Metatranscriptomics as a Novel Biomonitoring Tool: A Case Study of Glyphosate-Based Herbicide Effects on Freshwater Eukaryotic Communities',
        venue: 'Molecular Ecology',
        year: 2025,
        url: 'https://doi.org/10.1111/mec.70164',
      },
    ],
    depth: {
      overview: {
        zh: '环境 RNA 包含水体中释放的短寿命转录本，理论上比持久 eDNA 更接近当前活体和表达状态。宏转录组研究已开始读出除草剂等压力下的群落响应，但 RNA 的快速降解既是时间分辨率来源，也是最大测量偏差。',
        en: 'Environmental RNA consists of short-lived transcripts released into water and is therefore, in principle, closer to current living activity than persistent eDNA. Metatranscriptomic studies are beginning to read community responses to stressors such as herbicides, but rapid RNA decay is both the source of temporal resolution and the largest measurement bias.',
      },
      whyMatters: {
        zh: '生态管理需要在物种消失之前看到应激、免疫和繁殖变化；若 eRNA 主要反映采样到保存之间的温度和时间，它就只是脆弱的实验室指标。',
        en: 'Ecosystem management needs to see stress, immunity, and reproduction before species disappear; if eRNA mainly reflects temperature and delay between sampling and preservation, it is merely a fragile laboratory indicator.',
      },
      ifAnswered: {
        zh: '若 eRNA/eDNA 双读能跨地点校准，水体可成为实时生态健康仪，同时报告群落组成和生理状态。',
        en: 'If paired eRNA/eDNA readout can be calibrated across sites, water itself could become a real-time ecosystem-health instrument reporting both community composition and physiological state.',
      },
      approaches: [
        {
          zh: '在已知应激开始和结束时间的中尺度生态箱中同时采集 eRNA、eDNA 与组织转录组。',
          en: 'Co-sample eRNA, eDNA, and tissue transcriptomes in mesocosms with known stress onset and recovery times.',
        },
        {
          zh: '用外源 RNA 标准和从现场到冷冻的时间温度记录估计每个样本的降解率。',
          en: 'Use exogenous RNA standards and time-temperature logs from field to freezing to estimate sample-specific decay.',
        },
        {
          zh: '建立跨物种应激转录标记库，并在留出物种和自然水体上测试迁移。',
          en: 'Build a cross-species stress-transcript library and test transfer to held-out species and natural waters.',
        },
      ],
      barrier: {
        zh: 'RNA 降解、不同物种释放率和不完整参考转录组会共同扭曲丰度；一个高表达转录本不一定代表种群尺度健康变化。',
        en: 'RNA decay, species-specific shedding, and incomplete reference transcriptomes jointly distort abundance, while a highly expressed transcript need not represent population-scale health change.',
      },
      subQuestions: [
        {
          zh: '在应激解除后，eRNA 指标是否比 eDNA 更快回到基线，并与组织表达同步？',
          en: 'After stress removal, does the eRNA indicator return to baseline faster than eDNA and in synchrony with tissue expression?',
        },
        {
          zh: '用一个物种集合训练的应激标记，在留出物种上能达到多高的预注册灵敏度和特异性？',
          en: 'What preregistered sensitivity and specificity do stress markers trained on one species set achieve on held-out species?',
        },
        {
          zh: '不同保存延迟下经外源标准校正的结果，是否仍能给出相同生态状态分类？',
          en: 'After exogenous-standard correction, do samples with different preservation delays yield the same ecosystem-state classification?',
        },
      ],
    },
    stage: 1,
    members: 3,
    activity: 43,
    chart: { x: 744, y: 304, scale: 0.83 },
  },
  {
    id: 150,
    atlasN: 1492,
    slug: 'brain-foundation-models-neural-digital-twins',
    title: {
      zh: '大脑的基础模型与神经数字孪生',
      en: 'Foundation Models of the Brain and Neural Digital Twins',
    },
    qfocus: {
      zh: '共享神经基础核能否在完全留出的动物、脑区与刺激类型上预测单细胞响应并提出可验证干预，而不是吸收装置和个体捷径？',
      en: 'Can a shared neural foundation core predict single-cell responses and propose testable interventions for fully held-out animals, brain regions, and stimulus types rather than absorb apparatus and individual shortcuts?',
    },
    domain: '生命',
    cluster: {
      code: 'C11',
      zh: '神经技术·计算认知',
      en: 'Neurotechnology · computational cognition',
    },
    scores: [3, 4, 5, 2, 2, 2, 5, 2, 2],
    citation: {
      url: 'https://www.nature.com/articles/s41586-025-08829-y',
      title: 'Foundation model of neural activity predicts response to new stimulus types',
      venue: 'Nature',
      year: 2025,
    },
    brief: {
      zh: '以多只小鼠视觉皮层约十三万五千个神经元对自然视频的响应训练可泛化基础核，为新刺激和新个体生成神经活动预测，并尝试反推细胞类型与连接。',
      en: 'Train a generalizable foundation core on natural-video responses from roughly 135,000 mouse visual-cortex neurons, predicting neural activity for new stimuli and individuals while probing cell type and connectivity.',
    },
    literature: [
      {
        title: "AI models of the brain could serve as 'digital twins' in research",
        venue: 'Stanford Medicine News',
        year: 2025,
        url: 'https://med.stanford.edu/news/all-news/2025/04/digital-twin.html',
      },
    ],
    depth: {
      overview: {
        zh: '神经基础模型把多只动物、多次成像中的共享视觉计算压进一个基础核，再为每个神经元学习轻量读出。2025 年的工作显示，这种模型能预测新刺激类型下的活动，并从功能响应中提取与细胞类别和潜在连接有关的信息；“数字孪生”主张仍需靠真正的新动物和干预来检验。',
        en: 'Neural foundation models place visual computations shared across animals and imaging sessions into one core, then learn lightweight readouts for individual neurons. A 2025 study showed prediction of activity for new stimulus types and extracted information related to cell class and possible connectivity from functional responses; the stronger “digital twin” claim still requires genuinely new animals and interventions.',
      },
      whyMatters: {
        zh: '若模型能先在计算机里筛选刺激和干预，再把少量高信息实验带回真脑，系统神经科学可减少重复动物实验并更快比较机制。若它只复现观测相关性，孪生的逼真度会掩盖错误的因果解释。',
        en: 'If models can screen stimuli and interventions in silico before returning a small set of high-information experiments to the real brain, systems neuroscience could reduce repeated animal experiments and compare mechanisms faster. If they only reproduce observational correlations, twin fidelity may hide an incorrect causal account.',
      },
      ifAnswered: {
        zh: '若跨动物和跨实验室迁移、反事实预测与真实扰动都达线，研究流程可变为“先在孪生上做高通量实验，再在真脑中盲化验证”。',
        en: 'If transfer across animals and laboratories, counterfactual prediction, and real perturbation all clear prespecified thresholds, research could move toward high-throughput experiments on the twin followed by blinded validation in the living brain.',
      },
      approaches: [
        {
          zh: '在多动物、多会话记录上训练共享基础核与个体读出，并整只留出动物、刺激族和成像批次。',
          en: 'Train a shared core and individual readouts on multi-animal, multisession recordings while holding out entire animals, stimulus families, and imaging batches.',
        },
        {
          zh: '在不同实验室、记录设备和脑区上冻结模型做外部验证，并与每只动物单独拟合的基线比较。',
          en: 'Freeze the model for external validation across laboratories, recording systems, and brain regions, comparing it with per-animal fitted baselines.',
        },
        {
          zh: '让孪生预注册光遗传、药理或新刺激的单细胞反事实响应，再在真脑中盲化检验方向、效应量和校准。',
          en: 'Have the twin preregister single-cell counterfactual responses to optogenetic, pharmacological, or novel-stimulus interventions, then test direction, effect size, and calibration blindly in vivo.',
        },
      ],
      barrier: {
        zh: '不同神经回路可产生相似观测响应，个体发育、状态和实验设备又持续改变分布；从相关预测反推细胞类型、连接或干预效果并不具备自动可识别性。',
        en: 'Different circuits can produce similar observed responses, while development, internal state, and apparatus continually shift the distribution. Cell type, connectivity, and intervention effects are not automatically identifiable from predictive correlation.',
      },
      subQuestions: [
        {
          zh: '在整只留出小鼠和全新刺激类型上，共享基础核是否显著优于每只动物单独训练的模型，并保持校准？',
          en: 'On fully held-out mice and genuinely new stimulus types, does the shared foundation core significantly outperform per-animal models while remaining calibrated?',
        },
        {
          zh: '模型预注册的光遗传扰动响应，能否在真脑中保持正确方向并落入预设效应量区间？',
          en: 'Do preregistered responses to optogenetic perturbation retain the correct direction and fall within the prespecified effect-size interval in vivo?',
        },
        {
          zh: '由功能活动反推的细胞类型和连接，在配对组织学或连接组真值上达到什么精度与置信度校准？',
          en: 'Against paired histology or connectomic ground truth, what accuracy and confidence calibration do inferred cell types and connections achieve?',
        },
      ],
    },
    stage: 1,
    members: 5,
    activity: 52,
    chart: { x: 808, y: 350, scale: 0.88 },
  },
  {
    id: 151,
    atlasN: 1446,
    slug: 'ruminant-enteric-methane-mitigation',
    title: { zh: '反刍动物肠道甲烷减排', en: 'Enteric Methane Mitigation in Ruminants' },
    qfocus: {
      zh: '饲料添加剂、红藻与低甲烷育种能否在多年和放牧条件下持续减排，同时不损害动物健康、生产和全生命周期气候效益？',
      en: 'Can feed additives, red seaweed, and low-methane breeding sustain reductions over years and under grazing without harming animal health, productivity, or life-cycle climate benefit?',
    },
    domain: '生命',
    cluster: { code: 'C24', zh: '未来食品·农业科学', en: 'Future food · agricultural science' },
    scores: [3, 4, 3, 2, 2, 3, 5, 3, 2],
    citation: {
      url: 'https://www.frontiersin.org/journals/animal-science/articles/10.3389/fanim.2025.1689264/full',
      title: 'Understanding heterogeneity in methane emissions from confinement-fed dairy and beef cattle supplemented with Bovaer: a meta-analysis',
      venue: 'Frontiers in Animal Science',
      year: 2025,
    },
    brief: {
      zh: '直接抑制瘤胃产甲烷古菌可显著降低反刍排放，但个体差异、长期效应、放牧递送与全生命周期安全决定它能否成为真实气候工具。',
      en: 'Directly suppressing rumen methanogens can materially reduce enteric emissions, but animal heterogeneity, persistence, grazing delivery, and life-cycle safety determine whether it becomes a real climate tool.',
    },
    literature: [
      {
        title: 'Effect of SeaFeed, a canola oil infused with Asparagopsis armata, on methane emissions, performance, and carcass characteristics of Angus feedlot cattle',
        venue: 'Journal of Animal Science (PMC)',
        year: 2024,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11347879/',
      },
      {
        title: 'Long-term effects of 3-nitrooxypropanol on methane emission and milk production characteristics in Holstein-Friesian dairy cows',
        venue: 'Journal of Dairy Science',
        year: 2024,
        url: 'https://www.sciencedirect.com/science/article/pii/S0022030224005009',
      },
    ],
    depth: {
      overview: {
        zh: '3-硝基氧丙醇、含溴仿红藻、疫苗和遗传选择分别从酶、底物、免疫与宿主层面干预瘤胃产甲烷古菌。圈养试验和荟萃分析显示减排可行，但响应差异很大，且日常投喂逻辑难以直接迁移到放牧系统。',
        en: '3-nitrooxypropanol, bromoform-containing red seaweed, vaccines, and genetic selection intervene in rumen methanogens through enzyme, substrate, immune, and host routes. Confinement trials and meta-analysis show reductions are feasible, but responses vary widely and daily dosing does not transfer directly to grazing systems.',
      },
      whyMatters: {
        zh: '反刍甲烷是重要且短寿命的增温源，快速下降具有近期气候价值；若添加剂生产、动物性能或微生物适应抵消收益，尾气数字会高估净效应。',
        en: 'Ruminant methane is a major short-lived warming source, so rapid reduction has near-term climate value; if additive production, animal performance, or microbial adaptation offsets gains, breath measurements overstate net benefit.',
      },
      ifAnswered: {
        zh: '若能找到跨日粮、品种和放牧条件稳定的组合策略，甲烷减排可从短期饲喂试验进入可遗传、可规模化畜牧管理。',
        en: 'If robust combinations work across diets, breeds, and grazing conditions, methane mitigation could move from short feeding trials into heritable, scalable livestock management.',
      },
      approaches: [
        {
          zh: '开展跨品种、跨日粮的多年随机试验，连续测量甲烷、采食、产奶/增重和健康。',
          en: 'Run multi-year randomized trials across breeds and diets with continuous methane, intake, milk or growth, and health measurements.',
        },
        {
          zh: '以宏基因组和代谢组追踪产甲烷菌群是否适应、替代或把氢流向其他产物。',
          en: 'Track whether methanogens adapt, are replaced, or redirect hydrogen through metagenomics and metabolomics.',
        },
        {
          zh: '在放牧场景比较缓释递送、疫苗和低甲烷遗传选择的全生命周期净效应。',
          en: 'Compare slow-release delivery, vaccination, and low-methane genetic selection under grazing using full life-cycle net effects.',
        },
      ],
      barrier: {
        zh: '效果受日粮和个体强烈调节，长期微生物适应、放牧递送、溴仿安全与添加剂供应链仍可能限制规模化。',
        en: 'Diet and individual animals strongly modify effects, while long-term microbial adaptation, grazing delivery, bromoform safety, and additive supply chains may limit scale.',
      },
      subQuestions: [
        {
          zh: '连续两年使用后，减排幅度是否保持且动物生产、繁殖和健康不低于预设非劣界值？',
          en: 'After two continuous years, is reduction maintained while production, reproduction, and health remain within preregistered non-inferiority bounds?',
        },
        {
          zh: '停止添加剂后甲烷反弹的时间常数是多少，是否出现更高排放或菌群替代？',
          en: 'What is the rebound time constant after withdrawal, and is there overshoot or methanogen replacement?',
        },
        {
          zh: '计入生产运输、产量变化和副产物风险后，每吨 CO₂e 的净成本与净减排是多少？',
          en: 'After production, transport, productivity change, and by-product risks, what are net cost and net abatement per tonne CO2e?',
        },
      ],
    },
    stage: 2,
    members: 5,
    activity: 58,
    chart: { x: 664, y: 406, scale: 0.9 },
  },
  {
    id: 152,
    atlasN: 1494,
    slug: 'bioelectric-morphogenesis-basal-cognition',
    title: { zh: '生物电形态发生与基础认知', en: 'Bioelectric Morphogenesis and Basal Cognition' },
    qfocus: {
      zh: '细胞群的电位与缝隙连接是否真的编码可改写的“解剖目标态”，并能在不改基因的情况下可预测地修复形态？',
      en: 'Do voltage states and gap junctions in cell collectives encode a rewritable “anatomical setpoint” that can predictably repair form without changing genes?',
    },
    domain: '生命',
    cluster: { code: 'C32', zh: '意识的本质与硬核理论', en: 'Nature of consciousness and hard-problem theory' },
    scores: [5, 5, 4, 3, 5, 4, 3, 4, 4],
    citation: {
      url: 'https://pubmed.ncbi.nlm.nih.gov/37059328/',
      title: 'Morphoceuticals: Perspectives for discovery of drugs targeting anatomical control mechanisms in regenerative medicine, cancer and aging',
      venue: 'Drug Discovery Today',
      year: 2023,
    },
    brief: {
      zh: '把离子通道与缝隙连接形成的组织电网络视为形态控制层，尝试以“形态药物”重写再生目标；现有证据仍以机制和纲领性综述为主。',
      en: 'Treat tissue-scale networks of ion channels and gap junctions as a layer of morphological control and use “morphoceuticals” to rewrite regenerative targets; current evidence remains largely mechanistic and programmatic.',
    },
    literature: [
      {
        title: 'The Multiscale Wisdom of the Body: Collective Intelligence as a Tractable Interface for Next-Generation Biomedicine',
        venue: 'BioEssays',
        year: 2024,
        url: 'https://onlinelibrary.wiley.com/doi/10.1002/bies.202400196',
      },
    ],
    depth: {
      overview: {
        zh: '发育中的细胞不仅交换基因与化学信号，也通过离子通道和缝隙连接形成组织尺度电位图。生物电形态发生假说认为这些网络参与存储和纠正目标形态，并将“目标、记忆、误差最小化”等控制论概念带入再生生物学。',
        en: 'Developing cells exchange not only genes and chemicals but also tissue-scale voltage patterns through ion channels and gap junctions. Bioelectric morphogenesis proposes that these networks help store and correct target anatomy, bringing control-theoretic ideas such as goals, memory, and error minimization into regeneration biology.',
      },
      whyMatters: {
        zh: '若形态控制层可被药理操纵，再生和肿瘤治疗可能不必逐个编辑基因；但把目标导向行为称为“认知”容易超越直接证据，且错误形态目标可能带来严重风险。',
        en: 'If a morphological control layer is pharmacologically tractable, regeneration and cancer treatment may not require gene-by-gene editing; but calling goal-directed behavior “cognition” can outrun direct evidence, and wrong anatomical targets could carry severe risk.',
      },
      ifAnswered: {
        zh: '若电位模式能跨个体预测形态并被可逆干预重写，“形态药物”可成为连接发育机制与再生治疗的新层级。',
        en: 'If voltage patterns predict form across individuals and reversible intervention rewrites them, morphoceuticals could become a new layer connecting developmental mechanism to regenerative therapy.',
      },
      approaches: [
        {
          zh: '以高时空分辨电压成像记录损伤前后图谱，并预注册其对再生结局的预测。',
          en: 'Record high-resolution voltage maps before and after injury and preregister their predictions of regenerative outcomes.',
        },
        {
          zh: '用多种离子通道和缝隙连接干预产生相同目标电位，检验形态效应是否随电位而非药物身份。',
          en: 'Use multiple ion-channel and gap-junction interventions to produce the same target voltage and test whether form follows voltage rather than drug identity.',
        },
        {
          zh: '在类器官与动物中做可逆开关和长期随访，同时监测异常增殖、功能和形态。',
          en: 'Use reversible switches and long-term follow-up in organoids and animals, monitoring abnormal growth, function, and anatomy together.',
        },
      ],
      barrier: {
        zh: '电位既可能是形态控制信号，也可能只是细胞状态的伴随读数；通道药物多靶点且组织尺度因果链尚未被唯一识别。',
        en: 'Voltage may be a morphological control signal or merely a correlate of cell state; channel drugs are pleiotropic, and the tissue-scale causal chain is not uniquely identified.',
      },
      subQuestions: [
        {
          zh: '在不查看最终形态的条件下，早期电位图能否预测个体再生结果并跨批次校准？',
          en: 'Without seeing final anatomy, can early voltage maps predict individual regenerative outcomes with calibration across batches?',
        },
        {
          zh: '两种作用机制不同但产生相同电位图的干预，是否导致相同形态修复？',
          en: 'Do two mechanistically distinct interventions that create the same voltage map produce the same anatomical repair?',
        },
        {
          zh: '停止干预后目标形态是否稳定，且异常增殖率不高于对照的预设非劣界值？',
          en: 'After intervention stops, does the target anatomy remain stable without abnormal proliferation exceeding a preregistered non-inferiority bound?',
        },
      ],
    },
    stage: 1,
    members: 4,
    activity: 49,
    chart: { x: 728, y: 520, scale: 0.87 },
  },
];
