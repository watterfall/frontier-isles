/**
 * Curated frontier islands — real research directions sourced from the
 * xfrontier atlas (1481 directions scored on 9 dimensions; see
 * /Users/jili/AIAI/frontier/audit/atlas_data.json + cluster_questions.json +
 * cluster_intros.json). 26 entries span 数理/物质/生命/交叉, selected for
 * paradigm-shift (s[0]) ∧ undervalued (s[8]) ∧ cluster diversity.
 *
 * Single source of truth consumed by apps/server/src/seed.ts (live data) and
 * apps/web/src/api/fallback.ts (offline render). Per the two-plane principle:
 * the OPP `frontier` field stays lean (heat=s[0]/5, substrate=s[6]/5); the full
 * s[9] + cluster + citation live here and flow into place-plane meta json.
 *
 * Bilingual: every field has zh/en parallels; this is editorial content, never
 * auto-translated (architecture invariant 9). Citations are real DOIs/URLs —
 * provenance must be visible on the island (§6 leavability, "trust is visible").
 */

export type Domain = '数理' | '物质' | '生命' | '交叉';

export interface FrontierEntry {
  /** Chart id (1..26). Stable. */
  id: number;
  /** xfrontier atlas record id (provenance back-reference). */
  atlasN: number;
  /** URL-safe slug; also the OPP problem-object slug. */
  slug: string;
  title: { zh: string; en: string };
  qfocus: { zh: string; en: string };
  domain: Domain;
  cluster: { code: string; zh: string; en: string };
  /** 9 scores in rubric order: [范式,交叉,工具,群体,人本,低门,基底,可达,洼地]. */
  scores: number[];
  citation: { url: string; title: string; venue: string; year: number };
  brief: { zh: string; en: string };
  /** Growth stage 0..3 (empty/hut/academy/school) — drives the scene template. */
  stage: number;
  members: number;
  /** Activity 0..100. */
  activity: number;
  dormant?: boolean;
  outlier?: boolean;
  chart: { x: number; y: number; scale: number };
}

export const FRONTIERS: FrontierEntry[] = [
  // ── 数理 Math ──────────────────────────────────────────────────────────
  {
    id: 1, atlasN: 1453, slug: 'compositional-modeling',
    title: { zh: '组合式科学建模', en: 'Compositional Scientific Modeling' },
    qfocus: { zh: '模型能否像积木一样沿边界拼接——同一张图编译成不同数学实现？', en: 'Can models snap together like blocks — one diagram compiling to different math?' },
    domain: '数理',
    cluster: { code: 'C23', zh: 'AI数学·形式科学', en: 'AI mathematics · formal science' },
    scores: [5, 5, 4, 4, 4, 5, 3, 3, 5],
    citation: { url: 'https://doi.org/10.1017/fmp.2017.1', title: 'A formal proof of the Kepler conjecture', venue: 'Forum of Mathematics, Pi', year: 2017 },
    brief: { zh: '把范畴论迁移为科学建模的组合语法：语法与语义分离，AlgebraicJulia 把示意图变成可计算可组合对象。', en: 'Category theory as a compositional grammar for modeling; AlgebraicJulia turns diagrams into computable composable objects.' },
    stage: 2, members: 6, activity: 62, chart: { x: 205, y: 300, scale: 0.9 },
  },
  {
    id: 2, atlasN: 1006, slug: 'dark-matter-paleo',
    title: { zh: '暗物质古探测', en: 'Paleo-Detectors for Dark Matter' },
    qfocus: { zh: '数亿年前的天然矿物能否当作暗物质的「天然胶片」？', en: 'Can ancient minerals serve as natural dark-matter film?' },
    domain: '数理',
    cluster: { code: 'C33', zh: '基础物理·实在的本质', en: 'Fundamental physics · nature of reality' },
    scores: [4, 5, 4, 3, 4, 5, 3, 3, 5],
    citation: { url: 'https://doi.org/10.1038/nphys2309', title: 'On the reality of the quantum state', venue: 'Nature Physics', year: 2012 },
    brief: { zh: '暗物质核反冲在亿年老矿物晶格留纳米损伤轨迹，克级样品获吨·年等效曝光。', en: 'DM nuclear recoils leave nanoscale tracks in billion-year-old minerals; gram samples yield ton-year exposure.' },
    stage: 1, members: 3, activity: 34, chart: { x: 330, y: 245, scale: 0.78 },
  },
  {
    id: 3, atlasN: 940, slug: 'bio-compute-thermo',
    title: { zh: '生物计算的热力学代价界', en: 'Thermodynamic Cost of Biological Computation' },
    qfocus: { zh: '细胞做感知与决策时究竟必须烧掉多少自由能？', en: 'How much free energy must a cell burn to sense and decide?' },
    domain: '数理',
    cluster: { code: 'C31', zh: '物理计算·热力学与涨落', en: 'Physical computing · thermodynamics' },
    scores: [5, 5, 3, 1, 4, 5, 4, 3, 5],
    citation: { url: 'https://doi.org/10.1147/rd.53.0183', title: 'Irreversibility and Heat Generation in the Computing Process', venue: 'IBM Journal of R&D', year: 1961 },
    brief: { zh: '用随机热力学熵产界量化细胞感知/纠错/决策的能耗下限，真实生化网络逼近理论最优。', en: 'Stochastic-thermodynamic bounds quantify the energy floor of cellular sensing/error-correction/deciding.' },
    stage: 2, members: 8, activity: 71, chart: { x: 290, y: 385, scale: 0.95 },
  },
  {
    id: 4, atlasN: 374, slug: 'formal-math',
    title: { zh: '形式化数学与证明库', en: 'Formalized Mathematics & Proof Libraries' },
    qfocus: { zh: '机器能不能不只是算，而是真正理解并创造新的数学？', en: 'Can a machine go beyond calculating to understand and create new math?' },
    domain: '数理',
    cluster: { code: 'C23', zh: 'AI数学·形式科学', en: 'AI mathematics · formal science' },
    scores: [4, 3, 5, 4, 4, 4, 4, 4, 4],
    citation: { url: 'https://doi.org/10.1017/fmp.2017.1', title: 'A formal proof of the Kepler conjecture', venue: 'Forum of Mathematics, Pi', year: 2017 },
    brief: { zh: '把数学翻译成机器可验证的形式语言，形成可机检的数学公地。', en: 'Translate mathematics into machine-verifiable formal language; a machine-checkable commons.' },
    stage: 1, members: 4, activity: 45, chart: { x: 435, y: 315, scale: 0.85 },
  },
  {
    id: 5, atlasN: 851, slug: 'causal-rep-learning',
    title: { zh: '可识别因果表征学习', en: 'Identifiable Causal Representation Learning' },
    qfocus: { zh: '从高维观测里同时解耦潜在因果变量并恢复因果图——何时可信？', en: 'Disentangling latent causal variables and their graph from raw observations — when is it trustworthy?' },
    domain: '数理',
    cluster: { code: 'C51', zh: '因果科学·可信推断', en: 'Causal science · trustworthy inference' },
    scores: [5, 4, 3, 2, 4, 3, 4, 3, 5],
    citation: { url: 'https://arxiv.org/abs/2506.07918', title: 'CausalPFN: Amortized Causal Effect Estimation', venue: 'arXiv (NeurIPS 2025)', year: 2025 },
    brief: { zh: '用评分函数在干预前后的变化解耦因果变量，可识别性从强条件放宽到非参数未知干预。', en: 'Score-function shifts disentangle causal variables; identifiability relaxed to nonparametric unknown interventions.' },
    stage: 0, members: 1, activity: 8, chart: { x: 170, y: 425, scale: 0.68 },
  },
  {
    id: 6, atlasN: 568, slug: 'tabletop-quantum-gravity',
    title: { zh: '桌面量子引力', en: 'Tabletop Quantum Gravity' },
    qfocus: { zh: '两个介观质量的叠加能否证明引力必须被量子化？', en: 'Can superpositions of two mesoscopic masses prove gravity must be quantized?' },
    domain: '数理',
    cluster: { code: 'C33', zh: '基础物理·实在的本质', en: 'Fundamental physics · nature of reality' },
    scores: [5, 4, 4, 1, 3, 1, 2, 4, 5],
    citation: { url: 'https://doi.org/10.1038/nphys2309', title: 'On the reality of the quantum state', venue: 'Nature Physics', year: 2012 },
    brief: { zh: '用介观质量空间叠加看引力能否产生纠缠——若能则引力必须量子化。', en: 'Mesoscopic-mass superpositions test whether gravity can entangle — if so, gravity is quantized.' },
    stage: 1, members: 2, activity: 18, dormant: true, chart: { x: 395, y: 435, scale: 0.75 },
  },

  // ── 物质 Matter ────────────────────────────────────────────────────────
  {
    id: 7, atlasN: 1408, slug: 'living-wires',
    title: { zh: '活体导线', en: 'Living Wires' },
    qfocus: { zh: '电缆细菌的蛋白纤维能否催生可生物降解、自供能的电子器件？', en: 'Can microbial protein fibers spawn biodegradable, self-powering electronics?' },
    domain: '物质',
    cluster: { code: 'C12', zh: '生物电子·生物能源', en: 'Bioelectronics · bioenergy' },
    scores: [5, 5, 4, 3, 4, 4, 3, 4, 5],
    citation: { url: 'https://doi.org/10.1038/nrmicro.2016.93', title: 'Extracellular electron transfer mechanisms', venue: 'Nature Reviews Microbiology', year: 2016 },
    brief: { zh: 'Geobacter 与电缆细菌沿厘米级蛋白纤维导电，导电率超 20 S/cm 媲美掺杂聚合物。', en: 'Geobacter and cable bacteria conduct over cm-scale protein fibers at >20 S/cm, rivaling doped polymers.' },
    stage: 3, members: 14, activity: 88, chart: { x: 1080, y: 260, scale: 1.1 },
  },
  {
    id: 8, atlasN: 1491, slug: 'self-learning-matter',
    title: { zh: '会自学习的物理网络', en: 'Self-Learning Physical Networks' },
    qfocus: { zh: '训练能否搬进物质本身——无需反向传播就能学会？', en: 'Can training move into matter itself — learning without backpropagation?' },
    domain: '物质',
    cluster: { code: 'C44', zh: '神经形态·物理智能硬件', en: 'Neuromorphic · physical-AI hardware' },
    scores: [4, 5, 4, 3, 3, 5, 4, 4, 4],
    citation: { url: 'https://www.nature.com/articles/s41586-025-09384-2', title: 'Training of physical neural networks', venue: 'Nature', year: 2025 },
    brief: { zh: '耦合学习让自调电阻网络靠局部物理规则自行调参，把训练从算法搬进物质。', en: 'Coupled learning lets a resistive network tune itself via local physical rules — training relocated into matter.' },
    stage: 2, members: 9, activity: 66, chart: { x: 1215, y: 325, scale: 0.85 },
  },
  {
    id: 9, atlasN: 953, slug: 'rock-battery',
    title: { zh: '岩层压力储能', en: 'Geomechanical Pressure Storage' },
    qfocus: { zh: '一口地热井能否改造成可充放的「地下机械电池」？', en: 'Can a geothermal well become a charge/dischargeable underground mechanical battery?' },
    domain: '物质',
    cluster: { code: 'C17', zh: '新能源范式', en: 'New energy paradigms' },
    scores: [4, 4, 3, 2, 4, 3, 4, 4, 5],
    citation: { url: 'https://doi.org/10.1103/PhysRevLett.129.075001', title: 'Lawson criterion for ignition exceeded', venue: 'Physical Review Letters', year: 2022 },
    brief: { zh: '借油气 huff-and-puff 把水高压注入干热岩裂缝，靠岩石弹性回弹发电——地热重定义为储能+发电。', en: 'Oil-and-gas huff-and-puff into hot-dry-rock fractures stores heat+pressure; geothermal reframed as storage+power.' },
    stage: 2, members: 9, activity: 66, chart: { x: 1000, y: 360, scale: 0.95 },
  },
  {
    id: 10, atlasN: 764, slug: 'analog-solver',
    title: { zh: '高精度模拟矩阵求解器', en: 'High-Precision Analog Matrix Solver' },
    qfocus: { zh: '模拟计算能否捅破「精度天花板」做到 FP32 等效？', en: 'Can analog computing break its precision ceiling to reach FP32-equivalent?' },
    domain: '物质',
    cluster: { code: 'C44', zh: '神经形态·物理智能硬件', en: 'Neuromorphic · physical-AI hardware' },
    scores: [5, 4, 5, 1, 3, 2, 4, 3, 4],
    citation: { url: 'https://www.nature.com/articles/s41586-025-09384-2', title: 'Training of physical neural networks', venue: 'Nature', year: 2025 },
    brief: { zh: '阻变交叉阵列把 Ax=b 做成物理过程，迭代细化提升到 FP32 等效精度。', en: 'Resistive crossbars solve Ax=b as a physical process; iterative refinement lifts to FP32-equivalent.' },
    stage: 1, members: 6, activity: 52, chart: { x: 1150, y: 435, scale: 0.8 },
  },
  {
    id: 11, atlasN: 194, slug: 'artificial-photosynthesis',
    title: { zh: '仿光合人工光合系统', en: 'Bio-Inspired Artificial Photosynthesis' },
    qfocus: { zh: '能否模仿光合作用直接把光与 CO₂ 变燃料？', en: 'Can we mimic photosynthesis to turn light and CO₂ directly into fuel?' },
    domain: '物质',
    cluster: { code: 'C12', zh: '生物电子·生物能源', en: 'Bioelectronics · bioenergy' },
    scores: [4, 3, 4, 2, 3, 3, 3, 3, 4],
    citation: { url: 'https://doi.org/10.1038/nrmicro.2016.93', title: 'Extracellular electron transfer mechanisms', venue: 'Nature Reviews Microbiology', year: 2016 },
    brief: { zh: '模仿光合作用直接把光与 CO₂ 变燃料，5-10 年内走向中试。', en: 'Mimic photosynthesis to turn light and CO₂ into fuel; pilot scale in 5-10 years.' },
    stage: 1, members: 5, activity: 4, dormant: true, chart: { x: 1290, y: 245, scale: 0.72 },
  },
  {
    id: 12, atlasN: 123, slug: 'info-chemistry',
    title: { zh: '信息化学', en: 'Information Chemistry' },
    qfocus: { zh: '能否像写代码一样用分子搭出会运动、存储、计算的机器？', en: 'Can we code molecules into machines that move, store, and compute?' },
    domain: '物质',
    cluster: { code: 'C08', zh: '分子机器·DNA信息技术', en: 'Molecular machines · DNA info tech' },
    scores: [4, 4, 3, 1, 3, 3, 1, 2, 5],
    citation: { url: 'https://doi.org/10.1126/science.aaj2038', title: 'DNA Fountain enables robust storage', venue: 'Science', year: 2017 },
    brief: { zh: '把化学反应当信息载体来设计，催生「化学编程」新范式。', en: 'Design chemical reactions as information carriers; spawn a chemical-programming paradigm.' },
    stage: 0, members: 2, activity: 12, chart: { x: 1045, y: 455, scale: 0.7 },
  },
  {
    id: 13, atlasN: 132, slug: 'chemical-vision',
    title: { zh: '分子模式识别', en: 'Molecular Pattern Recognition' },
    qfocus: { zh: '能否用化学体系直接做模式识别与分类？', en: 'Can chemical systems do pattern recognition and classification directly?' },
    domain: '物质',
    cluster: { code: 'C08', zh: '分子机器·DNA信息技术', en: 'Molecular machines · DNA info tech' },
    scores: [4, 4, 3, 1, 4, 3, 1, 2, 5],
    citation: { url: 'https://doi.org/10.1126/science.aaj2038', title: 'DNA Fountain enables robust storage', venue: 'Science', year: 2017 },
    brief: { zh: '用化学体系直接做模式识别与分类，概念颠覆但属早期。', en: 'Pattern recognition and classification directly with chemical systems; early but disruptive.' },
    stage: 0, members: 1, activity: 6, chart: { x: 1255, y: 395, scale: 0.78 },
  },

  // ── 生命 Life ──────────────────────────────────────────────────────────
  {
    id: 14, atlasN: 1479, slug: 'miyake-anchors',
    title: { zh: 'Miyake 事件深时定年', en: 'Miyake Events as Deep-Time Anchors' },
    qfocus: { zh: '极端太阳风暴能否为任意档案盖一个「单年时间戳」？', en: 'Can extreme solar storms stamp a single-year timestamp on any archive?' },
    domain: '生命',
    cluster: { code: 'C29', zh: '地球·海洋·深时科学', en: 'Earth · ocean · deep-time science' },
    scores: [5, 5, 5, 2, 4, 4, 4, 3, 5],
    citation: { url: 'https://doi.org/10.1029/2025RG000902', title: 'Evolution of Terrestrial Planetary Bodies', venue: 'Reviews of Geophysics', year: 2025 },
    brief: { zh: '极端太阳风暴在某年全球同步灌碳-14 进树轮/冰芯，成跨学科绝对年代锚。', en: 'Extreme solar storms flood a single year with C-14 worldwide; a cross-disciplinary absolute-dating anchor.' },
    stage: 3, members: 16, activity: 82, chart: { x: 620, y: 300, scale: 1.05 },
  },
  {
    id: 15, atlasN: 1349, slug: 'code-dark-matter',
    title: { zh: '遗传密码暗物质', en: 'Recoded Genetic-Code Dark Matter' },
    qfocus: { zh: '基因组暗物质里藏着多少被标准注释器误读的生命？', en: 'How much life in genomic dark matter do standard annotators misread?' },
    domain: '生命',
    cluster: { code: 'C37', zh: '生物暗物质·未注释生命', en: 'Biological dark matter & unannotated life' },
    scores: [4, 5, 4, 5, 4, 5, 3, 4, 5],
    citation: { url: 'https://doi.org/10.1038/s41586-023-06583-7', title: 'Unraveling the functional dark matter through global metagenomics', venue: 'Nature', year: 2023 },
    brief: { zh: '重编码噬菌体把终止密码子重指派，标准预测器系统性地把其基因读成碎片。', en: 'Recoded phages reassign stop codons; standard callers systematically shred their genes.' },
    stage: 2, members: 8, activity: 64, chart: { x: 740, y: 250, scale: 0.8 },
  },
  {
    id: 16, atlasN: 872, slug: 'adar-sensors',
    title: { zh: 'ADAR RNA 传感器件', en: 'ADAR-Recruiting RNA Sensors' },
    qfocus: { zh: '一条 RNA 能否做成只在特定细胞里产出蛋白的「传感器」？', en: 'Can one RNA become a sensor producing protein only in specific cells?' },
    domain: '生命',
    cluster: { code: 'C52', zh: 'RNA·表观与可编程医学', en: 'RNA · epigenetic & programmable medicine' },
    scores: [5, 5, 4, 3, 4, 4, 3, 4, 4],
    citation: { url: 'https://www.cell.com/molecular-therapy-family/molecular-therapy/fulltext/S1525-0016(25)00721-X', title: 'Epigenome editing based treatment', venue: 'Molecular Therapy', year: 2025 },
    brief: { zh: 'RADARS 把 RNA 做成传感器，杂交后招募内源 ADAR 编辑终止密码子放行下游蛋白。', en: 'RADARS turn RNA into a sensor; hybridization recruits endogenous ADAR to edit a stop codon and green-light a payload.' },
    stage: 2, members: 7, activity: 60, chart: { x: 688, y: 398, scale: 0.9 },
  },
  {
    id: 17, atlasN: 1376, slug: 'active-inference',
    title: { zh: '主动推断工程化', en: 'Active Inference as Engineering' },
    qfocus: { zh: '自由能原理能否从解释大脑迁移为可落地的机器人设计学？', en: 'Can the free-energy principle migrate from explaining brains to engineering robots?' },
    domain: '生命',
    cluster: { code: 'C11', zh: '神经技术·计算认知', en: 'Neurotechnology · computational cognition' },
    scores: [5, 5, 4, 4, 4, 4, 3, 3, 4],
    citation: { url: 'https://doi.org/10.1016/j.conb.2021.10.010', title: 'Neural population geometry', venue: 'Current Opinion in Neurobiology', year: 2021 },
    brief: { zh: '用一个生成模型同时驱动感知与行动，最小化变分自由能而非最大化外部奖励。', en: 'A single generative model drives perception and action; minimize variational free energy, not external reward.' },
    stage: 1, members: 5, activity: 41, chart: { x: 556, y: 428, scale: 0.8 },
  },
  {
    id: 18, atlasN: 1, slug: 'minimal-genome',
    title: { zh: '最小基因组与人工细胞', en: 'Minimal Genomes & Artificial Cells' },
    qfocus: { zh: '生命最少需要什么？我们能不能从零造出活的东西？', en: 'What is the minimum life needs — and can we build something alive from scratch?' },
    domain: '生命',
    cluster: { code: 'C01', zh: '合成生物·工程生命', en: 'Synthetic biology · engineering life' },
    scores: [5, 4, 3, 2, 3, 1, 3, 2, 4],
    citation: { url: 'https://doi.org/10.1126/science.aad6253', title: 'Design and synthesis of a minimal bacterial genome', venue: 'Science', year: 2016 },
    brief: { zh: '删到最少基因逼近「生命的最小定义」，再自下而上重造细胞。', en: 'Strip genes to the minimum, approaching a minimal definition of life, then rebuild cells bottom-up.' },
    stage: 2, members: 8, activity: 58, chart: { x: 835, y: 338, scale: 0.9 },
  },
  {
    id: 19, atlasN: 7, slug: 'genome-writing',
    title: { zh: '合成基因组写入', en: 'Synthetic Genome Writing' },
    qfocus: { zh: '从「读」DNA 走向「写」整条基因组——工程生命的尺度边界在哪？', en: 'From reading DNA to writing whole genomes — where is the scale limit of engineering life?' },
    domain: '生命',
    cluster: { code: 'C01', zh: '合成生物·工程生命', en: 'Synthetic biology · engineering life' },
    scores: [4, 3, 4, 2, 3, 1, 4, 3, 4],
    citation: { url: 'https://doi.org/10.1126/science.aad6253', title: 'Design and synthesis of a minimal bacterial genome', venue: 'Science', year: 2016 },
    brief: { zh: '从读 DNA 走向写整条基因组，人造染色体将用于工业菌株与作物。', en: 'From reading to writing whole genomes; artificial chromosomes for industrial strains and crops.' },
    stage: 1, members: 4, activity: 36, chart: { x: 620, y: 420, scale: 0.75 },
  },

  // ── 交叉 Cross ─────────────────────────────────────────────────────────
  {
    id: 20, atlasN: 1428, slug: 'animal-ai-decode',
    title: { zh: '动物交流的 AI 解码', en: 'AI Decoding of Animal Communication' },
    qfocus: { zh: '能否在鲸象鸟的发声里找到组合结构与「音位表」？', en: 'Can we find combinatorial structure and a phonetic alphabet in whale/elephant/bird calls?' },
    domain: '交叉',
    cluster: { code: 'C26', zh: '感官界面·跨物种', en: 'Sensory interfaces · cross-species' },
    scores: [5, 5, 4, 4, 5, 4, 3, 4, 4],
    citation: { url: 'https://doi.org/10.1016/j.tics.2003.10.013', title: 'Sensory substitution and the human-machine interface', venue: 'Trends in Cognitive Sciences', year: 2003 },
    brief: { zh: '把人类语言的自监督模型迁移到非人类发声，从「标签信号」升级为「建模潜在语法」。', en: 'Transfer self-supervised language models to non-human vocalizations; model a latent grammar, not just tag signals.' },
    stage: 2, members: 9, activity: 76, chart: { x: 858, y: 548, scale: 1.0 },
  },
  {
    id: 21, atlasN: 994, slug: 'invertebrate-sentience',
    title: { zh: '无脊椎动物感受性判据', en: 'Invertebrate Sentience Markers' },
    qfocus: { zh: '能否用可复现的行为判据而非神经解剖类比量化「意识的现实可能性」？', en: 'Can reproducible behavioral criteria — not neuroanatomy — quantify the possibility of consciousness?' },
    domain: '交叉',
    cluster: { code: 'C32', zh: '意识的本质与硬核理论', en: 'Nature of consciousness & hard-problem theory' },
    scores: [4, 4, 3, 5, 5, 5, 4, 4, 5],
    citation: { url: 'https://doi.org/10.1093/acprof:oso/9780195311105.003.0001', title: 'Facing Up to the Problem of Consciousness', venue: 'Journal of Consciousness Studies', year: 1995 },
    brief: { zh: '为昆虫/甲壳/头足类建立行为感受性标志物，以证据权重判定意识可能性。', en: 'Behavioral sentience markers for insects/crustaceans/cephalopods; weight-of-evidence judges the possibility of consciousness.' },
    stage: 2, members: 7, activity: 60, chart: { x: 642, y: 562, scale: 0.9 },
  },
  {
    id: 22, atlasN: 802, slug: 'verified-pqc',
    title: { zh: '机器可验证的后量子密码', en: 'Machine-Verified Post-Quantum Crypto' },
    qfocus: { zh: '能否把规范安全到汇编实现之间的缝隙彻底焊死？', en: 'Can the gap between spec security and assembly implementation be welded shut?' },
    domain: '交叉',
    cluster: { code: 'C47', zh: '后量子·隐私计算工程', en: 'Post-quantum · privacy computation' },
    scores: [5, 5, 2, 4, 2, 2, 4, 2, 5],
    citation: { url: 'https://arxiv.org/abs/2311.03470', title: 'Orion: A Fully Homomorphic Encryption Framework for Deep Learning', venue: 'arXiv / ASPLOS', year: 2024 },
    brief: { zh: '用 EasyCrypt 把 ML-KEM 安全验证到 LWE 假设，Jasmin 产出可证恒定时间汇编。', en: 'EasyCrypt verifies ML-KEM security to the LWE assumption; Jasmin emits provably constant-time assembly.' },
    stage: 1, members: 4, activity: 44, chart: { x: 924, y: 602, scale: 0.75 },
  },
  {
    id: 23, atlasN: 50, slug: 'ai-theory-discovery',
    title: { zh: 'AI 辅助理论发现', en: 'AI-Assisted Theory Discovery' },
    qfocus: { zh: 'AI 能不能不只是拟合数据，而是真正学会大自然的规律？', en: 'Can AI go beyond fitting data and actually learn the underlying laws of nature?' },
    domain: '交叉',
    cluster: { code: 'C03', zh: '科学基础模型·AI4S', en: 'Scientific foundation models · AI4S' },
    scores: [5, 4, 5, 2, 5, 4, 3, 4, 4],
    citation: { url: 'https://doi.org/10.1038/s41586-021-03819-2', title: 'Highly accurate protein structure prediction with AlphaFold', venue: 'Nature', year: 2021 },
    brief: { zh: '让 AI 从数据里「猜」出简洁公式与守恒律，参与提出新理论。', en: 'Let AI guess concise formulas and conservation laws from data; AI helps propose new theories.' },
    stage: 1, members: 4, activity: 44, chart: { x: 502, y: 584, scale: 0.7 },
  },
  {
    id: 24, atlasN: 542, slug: 'cross-species-umwelt',
    title: { zh: '跨物种感官世界重建', en: 'Reconstructing Cross-Species Senses' },
    qfocus: { zh: '我们能不能先知道自己不知道什么，从而更聪明地选择探索方向？', en: 'Can we map what we don\'t yet know, to choose where to explore more wisely?' },
    domain: '交叉',
    cluster: { code: 'C34', zh: '无知测绘·盲区科学', en: 'Mapping ignorance & blind spots' },
    scores: [5, 5, 4, 4, 5, 3, 2, 2, 4],
    citation: { url: 'https://doi.org/10.1016/j.jbi.2023.104405', title: 'Creating an ignorance-base', venue: 'Journal of Biomedical Informatics', year: 2023 },
    brief: { zh: '用传感器与 AI 重建动物的感官世界（Umwelt），让人类体验磁感/偏振/次声。', en: 'Sensors + AI reconstruct animals\' sensory worlds (Umwelt); let humans feel magnetoreception, polarization, infrasound.' },
    stage: 0, members: 2, activity: 12, chart: { x: 742, y: 640, scale: 0.85 },
  },
  {
    id: 25, atlasN: 662, slug: 'formal-unknown',
    title: { zh: '未知论的形式刻画', en: 'Formal Characterization of the Unknown' },
    qfocus: { zh: '答案是不是早就分散写在不同论文里，只差有人把它们连起来？', en: 'Is the answer already scattered across separate papers, waiting to be connected?' },
    domain: '交叉',
    cluster: { code: 'C38', zh: '文献潜知·跨域桥接', en: 'Literature-based discovery & cross-domain bridging' },
    scores: [5, 5, 4, 4, 4, 4, 1, 2, 4],
    citation: { url: 'https://doi.org/10.1086/601720', title: 'Undiscovered Public Knowledge', venue: 'The Library Quarterly', year: 1986 },
    brief: { zh: '用结构空洞、蕴含缺口把文献中「已知的未知」形式化为可检索对象。', en: 'Structural holes and entailment gaps formalize "known unknowns" in the literature into retrievable objects.' },
    stage: 1, members: 3, activity: 39, chart: { x: 1080, y: 560, scale: 0.8 },
  },
  {
    id: 26, atlasN: 680, slug: 'dark-instrumentation',
    title: { zh: '暗仪器化', en: 'Dark Instrumentation' },
    qfocus: { zh: '我们能不能从「缺席」的东西里反推出本该看见的真相？', en: 'Can we infer hidden truths from what\'s absent — things that never showed up?' },
    domain: '交叉',
    cluster: { code: 'C39', zh: '缺席·负空间科学', en: 'Absence & negative-space science' },
    scores: [5, 4, 5, 3, 4, 3, 1, 2, 5],
    citation: { url: 'https://doi.org/10.1007/s11098-008-9315-0', title: 'Absence of evidence and evidence of absence', venue: 'Philosophical Studies', year: 2009 },
    brief: { zh: '识别因缺仪器而几乎无人观测的现象，「造一台新仪器」作为开辟问题空间的杠杆。', en: 'Identify phenomena unobserved for lack of instruments; "build a new instrument" as a lever to open problem space.' },
    stage: 1, members: 3, activity: 57, outlier: true, chart: { x: 1232, y: 648, scale: 0.85 },
  },
];

export const FRONTIERS_BY_SLUG: Record<string, FrontierEntry> = Object.fromEntries(
  FRONTIERS.map((f) => [f.slug, f]),
);

export function frontierBySlug(slug: string): FrontierEntry | undefined {
  return FRONTIERS_BY_SLUG[slug];
}

export function frontierByDomain(domain: Domain): FrontierEntry[] {
  return FRONTIERS.filter((f) => f.domain === domain);
}
