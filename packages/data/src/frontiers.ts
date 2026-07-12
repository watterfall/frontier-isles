/**
 * Curated frontier islands — real research directions sourced from the
 * xfrontier atlas (1481 directions scored on 9 dimensions; see
 * /Users/jili/AIAI/frontier/audit/atlas_data.json + cluster_questions.json +
 * cluster_intros.json). 78 entries span 数理/物质/生命/交叉, selected for
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

/** One bilingual editorial string (zh primary, en faithful parallel). */
export interface Bilingual {
  zh: string;
  en: string;
}

/** Grounded deep content for an island's detail surface + problem.md body. */
export interface DepthContent {
  /** 2-3 sentences: what the frontier is and why it is a paradigm move. */
  overview: Bilingual;
  /** The stakes and the honest tension. */
  whyMatters: Bilingual;
  /** What becomes possible if it works. */
  ifAnswered: Bilingual;
  /** 2-3 concrete attack routes / methods. */
  approaches: Bilingual[];
  /** The single hardest honest obstacle. */
  barrier: Bilingual;
  /** 2-4 open sub-questions specific to this frontier (→ problem.md body). */
  subQuestions: Bilingual[];
}

/** A named resident (human or AI) staffing a flagship island's stations. */
export interface InteriorResident {
  /** Editorial proper noun, never auto-translated (invariant 9). */
  name: string;
  kind: 'human' | 'ai';
  /** AI role, only when kind === 'ai'. */
  aiRole?: 'scout' | 'advocate' | 'synthesizer' | 'ferryman';
  /** Where they are / what they're doing. */
  caption: Bilingual;
}

/** One 问题墙 (Question Wall) entry — mirrors the sample island's questions. */
export interface InteriorQuestion {
  text: Bilingual;
  /** Author composition, e.g. "人 · 沈括" / "AI · 综合者". */
  author: Bilingual;
  open: boolean;
  /** Interest tally (never a rank — invariant 7: no XP/leaderboards). */
  votes: number;
  /** Struck-through original when the question was rewritten. */
  rewrittenFrom?: Bilingual;
}

/** One 文献阁 (Library) digest — a real paper clustered by argument. */
export interface InteriorDigest {
  title: Bilingual;
  gist: Bilingual;
  cite?: { title: string; venue: string; year: number; url?: string };
}

/** One 白板厅 (Whiteboard) debate thread — a topic with contrasting stances. */
export interface InteriorDebate {
  topic: Bilingual;
  positions: Bilingual[];
}

/** One 数据台 (Data Desk) row — a real figure, dataset, or benchmark. */
export interface InteriorDatum {
  label: Bilingual;
  value: Bilingual;
  note?: Bilingual;
}

/** One 散木园 (Driftwood) scrap — an honest half-finished atom. Also used for
 *  实验坊 (Workshop) prototypes-in-progress and 茶寮 (Tearoom) informal exchanges. */
export interface InteriorScrap {
  text: Bilingual;
  author: Bilingual;
}

/** One 展厅 (Gallery) piece — a published / exhibited result of this island,
 *  optionally with a real citation (the record it produced or replicated). */
export interface InteriorGalleryItem {
  title: Bilingual;
  gist: Bilingual;
  cite?: { title: string; venue: string; year: number; url?: string };
}

/**
 * Rich interior content for a "flagship" island — parallels the bespoke sample
 * island so entering the island is never empty: a real Question Wall, a library
 * of clustered real-paper digests, live whiteboard debates, a data desk, a
 * driftwood garden of honest scraps, and named residents. All bilingual and
 * grounded in real literature (invariant 9: editorial content never
 * auto-translated). Flows through place-plane meta.atlas.interior (server) and
 * fallback (offline), exactly like {@link DepthContent}.
 */
export interface IslandInterior {
  /** 问题墙 Question Wall. */
  questions: InteriorQuestion[];
  /** 文献阁 Library — clustered real-paper digests. */
  digests: InteriorDigest[];
  /** 白板厅 Whiteboard — live debates. */
  debates: InteriorDebate[];
  /** 数据台 Data Desk — real figures / benchmarks. */
  data: InteriorDatum[];
  /** 散木园 Driftwood Garden — honest half-finished scraps. */
  driftwood: InteriorScrap[];
  /** 实验坊 Workshop — prototypes / experiments in progress. */
  workshop: InteriorScrap[];
  /** 展厅 Gallery — published / exhibited results. */
  gallery: InteriorGalleryItem[];
  /** 茶寮 Tearoom — informal exchanges, hallway musings. */
  tearoom: InteriorScrap[];
  /** Named residents (human + AI). */
  residents: InteriorResident[];
}

export interface FrontierEntry {
  /** Chart id (1..78). Stable. */
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
  /** Full evidence list from the xfrontier atlas (evidence.json) — grounded,
   * real citations. Distinct from the single headline `citation`; feeds the
   * island library + the problem.md 参考文献 section (§6 leavability: it travels
   * with the .md). Only the coverage-expansion islands (§九) carry it so far. */
  literature?: { title: string; venue: string; year: number; url: string }[];
  /** Deep, grounded, bilingual detail — feeds the problem.md body (seed.ts)
   * and the island detail surface so "opening" an island is never empty. All
   * content is condensed from the xfrontier atlas cards/cluster-questions +
   * real citations (no fabrication). */
  depth?: DepthContent;
  /** Rich station interior for flagship islands — the Question Wall, library
   * digests, whiteboard debates, data desk, driftwood, and residents that make
   * "opening" the island as full as the sample island. Only a curated subset of
   * islands carry this; the rest render their {@link DepthContent} essay. */
  interior?: IslandInterior;
  /** Growth stage 0..3 (empty/hut/academy/school) — drives the scene template. */
  stage: number;
  members: number;
  /** Activity 0..100. */
  activity: number;
  dormant?: boolean;
  outlier?: boolean;
  /** Editorial L0 fingerprint flag — mirrors the OPP `status: resolved`
   * state (architecture.md line 68); flies a lighthouse on the chart
   * (depth-plan-v1 §5). Hand-authored like `dormant`/`outlier` above: the
   * live seed never actually reaches `status: resolved` for these curated
   * frontiers (`statusOf()` in server/src/seed.ts only emits open/active),
   * so this is fallback-only editorial content, never overlaid by reconcile. */
  resolved?: boolean;
  chart: { x: number; y: number; scale: number };
}

export const FRONTIERS: FrontierEntry[] = [
  // ── 数理 Math ───────────────────────────────────────────────────────────
  {
    id: 1, atlasN: 1453, slug: "compositional-modeling",
    title: { zh: "组合式科学建模", en: "Compositional Scientific Modeling" },
    qfocus: { zh: "模型能否像积木一样沿边界拼接——同一张图编译成不同数学实现？", en: "Can models snap together like blocks — one diagram compiling to different math?" },
    domain: "数理",
    cluster: { code: "C23", zh: "AI数学·形式科学", en: "AI mathematics · formal science" },
    scores: [5, 5, 4, 4, 4, 5, 3, 3, 5],
    citation: { url: "https://doi.org/10.1017/fmp.2017.1", title: "A formal proof of the Kepler conjecture", venue: "Forum of Mathematics, Pi", year: 2017 },
    brief: { zh: "把范畴论迁移为科学建模的组合语法：语法与语义分离，AlgebraicJulia 把示意图变成可计算可组合对象。", en: "Category theory as a compositional grammar for modeling; AlgebraicJulia turns diagrams into computable composable objects." },
    depth: {
      overview: { zh: "应用范畴论把结构/装饰余跨、算子、函子语义等纯数学工具改造成科学建模的组合语法：子系统像积木一样沿边界拼接成大模型，\"怎么拼\"（语法）与\"拼成什么数学对象\"（语义）被彻底分离，同一张示意图可编译成Petri网、ODE等不同实现。AlgebraicJulia生态（Catlab、Decapodes、StockFlow）已把这套理论变成可运行的开源工具链。", en: "Applied category theory turns pure-math tools — structured/decorated cospans, operads, functorial semantics — into a compositional grammar for scientific modeling: subsystems snap together like building blocks along shared boundaries, with \"how to compose\" (syntax) cleanly separated from \"what math results\" (semantics), so one diagram can compile into a Petri net, an ODE system, or other realizations. The AlgebraicJulia ecosystem (Catlab, Decapodes, StockFlow) has already turned this into a runnable open-source toolchain." },
      whyMatters: { zh: "它挑战\"科学模型必须一次性手写巨型代码\"的默认假设，但范畴论抽象门槛高，能被领域科学家日常使用的杀手级案例仍稀缺，理论优雅与实际渗透之间横亘鸿沟。", en: "It challenges the default assumption that scientific models must be hand-written monolithic code, but category theory's abstraction is steep and killer use cases that domain scientists adopt daily remain scarce — a gap yawns between theoretical elegance and real penetration." },
      ifAnswered: { zh: "若组合式建模被领域科学家真正采用，大型多物理、多尺度模型将能由可复用、可替换的部件搭建与验证，取代一次性手写的巨型代码。", en: "If compositional modeling is genuinely adopted by domain scientists, large multiphysics and multiscale models could be assembled and verified from reusable, swappable parts instead of hand-written monolithic code." },
      approaches: [
        { zh: "用结构余跨拼接流行病学模型——2020年英国COVID-19 COEXIST模型的组合基础", en: "Structured cospans for assembling epidemiological models — the compositional basis of the UK's 2020 COVID-19 COEXIST model" },
        { zh: "StockFlow用装饰余跨组合存量—流量图（Baez等，2023）", en: "StockFlow, using decorated cospans to compose stock-flow diagrams (Baez et al., 2023)" },
        { zh: "Decapodes用图式方程组合多物理偏微分方程，直接编译为可运行仿真（Morris等，2024）", en: "Decapodes, composing multiphysics PDEs via diagrammatic equations and compiling them straight to runnable simulations (Morris et al., 2024)" },
      ],
      barrier: { zh: "范畴论抽象门槛陡峭，能被领域科学家日常采用的杀手级落地案例仍稀少，理论优雅与实际渗透之间存在鸿沟。", en: "Category theory's abstraction is steep, killer applications that domain scientists adopt daily remain rare, and a gap persists between theoretical elegance and real-world penetration." },
      subQuestions: [
        { zh: "组合语法能否自动从现有代码库中反向抽取，而非依赖人工设计？", en: "Can the compositional grammar be reverse-extracted automatically from existing codebases, rather than hand-designed?" },
        { zh: "语法—语义分离能否扩展到随机、离散或非线性系统？", en: "Can the syntax-semantics split extend to stochastic, discrete, or nonlinear systems?" },
        { zh: "怎样的教学路径能让范畴论抽象被领域科学家真正吸收？", en: "What teaching path would let domain scientists genuinely absorb the category-theoretic abstraction?" },
        { zh: "组合式模型能否像软件包一样被版本化、复用与跨团队共享？", en: "Could compositional models be versioned, reused, and shared across teams the way software packages are?" },
      ],
    },
    stage: 2, members: 6, activity: 62,
    chart: { x: 205, y: 300, scale: 0.9 },
  },
  {
    id: 2, atlasN: 1006, slug: "dark-matter-paleo",
    title: { zh: "暗物质古探测", en: "Paleo-Detectors for Dark Matter" },
    qfocus: { zh: "数亿年前的天然矿物能否当作暗物质的「天然胶片」？", en: "Can ancient minerals serve as natural dark-matter film?" },
    domain: "数理",
    cluster: { code: "C33", zh: "基础物理·实在的本质", en: "Fundamental physics · nature of reality" },
    scores: [4, 5, 4, 3, 4, 5, 3, 3, 5],
    citation: { url: "https://doi.org/10.1038/nphys2309", title: "On the reality of the quantum state", venue: "Nature Physics", year: 2012 },
    brief: { zh: "暗物质核反冲在亿年老矿物晶格留纳米损伤轨迹，克级样品获吨·年等效曝光。", en: "DM nuclear recoils leave nanoscale tracks in billion-year-old minerals; gram samples yield ton-year exposure." },
    depth: {
      overview: { zh: "古矿物暗物质探测把形成于数亿至十亿年前的天然矿物当作\"天然暗物质胶片\"：暗物质诱发的核反冲在晶格里留下纳米级损伤轨迹与稳定空位色心，用光片荧光显微或X射线成像逐条读出。地质尺度的曝光时间替代了巨大探测器体积，使克级样品获得吨年级的等效曝光。", en: "Paleo-detection treats natural minerals formed hundreds of millions to a billion years ago as a \"natural dark-matter film\": dark-matter-induced nuclear recoils leave nanometer-scale damage tracks and stable vacancy color centers in the crystal lattice, read out track by track via light-sheet fluorescence microscopy or X-ray imaging. Geological-scale exposure time substitutes for detector volume, giving gram-scale samples ton-year-equivalent exposure." },
      whyMatters: { zh: "最硬的难点是背景与定年——自发裂变、放射性杂质与宇宙线在十亿年间同样刻满轨迹，要把暗物质信号从这片\"古老噪声\"中分离，并精确掌握矿物暴露年龄与铀钍含量，是信号可信度的命门。", en: "The hardest difficulty is background and dating — spontaneous fission, radioactive impurities, and cosmic rays etch just as many tracks over a billion years, so separating a dark-matter signal from this \"ancient noise,\" while precisely pinning down the mineral's exposure age and uranium/thorium content, is the crux of signal credibility." },
      ifAnswered: { zh: "若单色心荧光成像能做成可重复、可定标、带方向性的读出流水线，古探测不仅能给出暗物质信号，还可能外溢到反应堆中微子监测与核裁军核查等应用。", en: "If single-color-center fluorescence imaging can become a repeatable, calibratable, directional readout pipeline, paleo-detection could not only deliver a dark-matter signal but also spill over into reactor-neutrino monitoring and nuclear-disarmament verification." },
      approaches: [
        { zh: "光片荧光显微逐条读出晶格中的纳米损伤轨迹（PALEOCCENE）", en: "Light-sheet fluorescence microscopy reading nanometer damage tracks in the lattice track-by-track (PALEOCCENE)" },
        { zh: "量热式古探测——用沿轨迹的稳定空位计数作为正比于沉积能量的量热观测量（2026）", en: "Calorimetric paleo-detection, using stable vacancy counts along a track as a calorimetric observable proportional to deposited energy (2026)" },
        { zh: "介电晶体中色心的选择平面照明荧光显微，实现单事件、原子级分辨、带方向性的体内读出", en: "Selective plane illumination fluorescence microscopy of color centers in dielectric crystals, for single-event, atomic-resolution, directional in-situ readout" },
      ],
      barrier: { zh: "自发裂变、放射性杂质与宇宙线在地质尺度上同样刻满轨迹，把暗物质信号从\"古老噪声\"中干净分离仍是信号可信度的命门。", en: "Spontaneous fission, radioactive impurities, and cosmic rays etch just as many tracks over geological time, and cleanly separating a dark-matter signal from this \"ancient noise\" remains the crux of signal credibility." },
      subQuestions: [
        { zh: "如何精确测定矿物样本的暴露年龄与铀钍杂质含量以剔除本底？", en: "How can a sample's exposure age and uranium/thorium impurity content be precisely measured to subtract the background?" },
        { zh: "单色心读出能否扩展到大规模矿物阵列以逼近吨年级灵敏度？", en: "Can single-color-center readout scale to large mineral arrays to approach ton-year sensitivity?" },
        { zh: "轨迹的方向性信息能否可靠重建暗物质风的银河系坐标？", en: "Can directional track information reliably reconstruct the galactic coordinates of the dark-matter wind?" },
        { zh: "这套读出技术能否迁移到反应堆中微子监测等核裁军核查场景？", en: "Can this readout technology transfer to reactor-neutrino monitoring and nuclear-disarmament verification?" },
      ],
    },
    stage: 1, members: 3, activity: 34,
    chart: { x: 330, y: 245, scale: 0.78 },
  },
  {
    id: 3, atlasN: 940, slug: "bio-compute-thermo",
    title: { zh: "生物计算的热力学代价界", en: "Thermodynamic Cost of Biological Computation" },
    qfocus: { zh: "细胞做感知与决策时究竟必须烧掉多少自由能？", en: "How much free energy must a cell burn to sense and decide?" },
    domain: "数理",
    cluster: { code: "C31", zh: "物理计算·热力学与涨落", en: "Physical computing · thermodynamics" },
    scores: [5, 5, 3, 1, 4, 5, 4, 3, 5],
    citation: { url: "https://doi.org/10.1147/rd.53.0183", title: "Irreversibility and Heat Generation in the Computing Process", venue: "IBM Journal of R&D", year: 1961 },
    brief: { zh: "用随机热力学熵产界量化细胞感知/纠错/决策的能耗下限，真实生化网络逼近理论最优。", en: "Stochastic-thermodynamic bounds quantify the energy floor of cellular sensing/error-correction/deciding." },
    depth: {
      overview: { zh: "生物计算的热力学代价界用随机热力学的熵产生界与热力学不确定关系，量化细胞在感知、纠错（动力学校对）、决策时究竟必须烧掉多少自由能，并发现真实生化网络逼近这些理论最优。它把\"计算的能耗下限\"从硅基延伸到活细胞，反过来给低功耗硬件提供生物学验证过的设计原则。", en: "This frontier uses entropy-production bounds and thermodynamic uncertainty relations from stochastic thermodynamics to quantify how much free energy a cell must burn to sense, error-correct (kinetic proofreading), and decide — and finds that real biochemical networks sit near these theoretical optima. It extends the energy floor of computation from silicon to living cells, feeding bio-validated design principles back into low-power hardware." },
      whyMatters: { zh: "把抽象的熵产生界与活体内真实速率、精度数据对齐极难，\"近最优\"结论高度依赖模型选择与参数估计，可证伪的活体实验仍稀缺——这是理论与信号之间的方法学鸿沟。", en: "Aligning abstract entropy-production bounds with real in-vivo rate and precision data is extremely hard; the \"near-optimal\" conclusion depends heavily on model choice and parameter estimation, and falsifiable in-vivo experiments remain scarce — a methodological gap between theory and signal." },
      ifAnswered: { zh: "若\"误差—代价界\"在多个生物计算模块上被证明普遍成立，它可能成为跨硅基与碳基的统一能效设计语言，指导仿生低功耗电路的设计。", en: "If the error-cost bound proves universal across multiple biological computing modules, it could become a unified energy-efficiency design language spanning silicon and carbon, guiding the design of bio-inspired low-power circuits." },
      approaches: [
        { zh: "用随机热力学的熵产生界量化感知、纠错与决策的自由能代价", en: "Using stochastic thermodynamics' entropy-production bounds to quantify the free-energy cost of sensing, error-correction, and decision-making" },
        { zh: "以T7 DNA聚合酶的复制动力学参数检验校对精度是否逼近热力学最优（PNAS 2024展望）", en: "Testing whether T7 DNA polymerase's replication kinetics sit near the thermodynamic optimum for proofreading precision (2024 PNAS perspective)" },
        { zh: "把活细胞当作进化优化过的低功耗计算样板，反哺仿生硬件设计", en: "Treating living cells as evolution-optimized low-power computing templates to feed back into bio-inspired hardware design" },
      ],
      barrier: { zh: "把抽象的熵产生界与活体内真实速率、精度数据对齐极难，\"近最优\"结论高度依赖模型选择，可证伪的活体实验仍稀缺。", en: "Aligning abstract entropy-production bounds with real in-vivo rate and precision data is extremely hard, the \"near-optimal\" conclusion depends heavily on model choice, and falsifiable in-vivo experiments remain scarce." },
      subQuestions: [
        { zh: "细胞的不可逆计算步骤是否真的逼近兰道尔kT·ln2极限，还是留有物理设计空间？", en: "Do a cell's irreversible computational steps truly approach the Landauer kT·ln2 limit, or is there room left by clever physical design?" },
        { zh: "是否存在统一的非平衡定律，能从原理预言细胞维持低熵有序所需的最小耗散？", en: "Is there a universal non-equilibrium law that can predict, from first principles, the minimal dissipation a cell needs to maintain low-entropy order?" },
        { zh: "细胞能否像纳米机器一样系统性利用涨落定理描述的\"逆熵\"事件降低计算代价？", en: "Can cells, like engineered nanomachines, systematically exploit the \"anti-entropic\" events described by fluctuation theorems to lower computational cost?" },
        { zh: "\"误差—代价界\"能否推广到除DNA校对外的其他细胞决策模块并被实验证伪？", en: "Can the error-cost bound be generalized to cellular decision modules beyond DNA proofreading, and be experimentally falsified?" },
      ],
    },
    stage: 2, members: 8, activity: 71,
    chart: { x: 290, y: 385, scale: 0.95 },
  },
  {
    id: 4, atlasN: 374, slug: "formal-math",
    title: { zh: "形式化数学与证明库", en: "Formalized Mathematics & Proof Libraries" },
    qfocus: { zh: "机器能不能不只是算，而是真正理解并创造新的数学？", en: "Can a machine go beyond calculating to understand and create new math?" },
    domain: "数理",
    cluster: { code: "C23", zh: "AI数学·形式科学", en: "AI mathematics · formal science" },
    scores: [4, 3, 5, 4, 4, 4, 4, 4, 4],
    citation: { url: "https://doi.org/10.1017/fmp.2017.1", title: "A formal proof of the Kepler conjecture", venue: "Forum of Mathematics, Pi", year: 2017 },
    brief: { zh: "把数学翻译成机器可验证的形式语言，形成可机检的数学公地。", en: "Translate mathematics into machine-verifiable formal language; a machine-checkable commons." },
    depth: {
      overview: { zh: "形式化数学与证明库把传统数学定理与证明翻译成机器可验证的形式语言，构建可机检、可复用的数学知识库（如Lean社区的mathlib）。它横跨数学、逻辑学与开放协作，核心是建立一个由机器保证无误、由社区共同维护的\"数学公地\"。", en: "Formalized mathematics and proof libraries translate traditional theorems and proofs into a machine-verifiable formal language, building a machine-checkable, reusable mathematical knowledge base (such as the Lean community's mathlib). Spanning mathematics, logic, and open collaboration, its core is establishing a \"mathematical commons\" guaranteed error-free by machines and jointly maintained by the community." },
      whyMatters: { zh: "形式化的成本高得惊人——一个教科书定理可能要写数百行代码，这道劳动壁垒决定它短期只能覆盖数学的极小角落；它的深层价值也不在\"防错\"（数学错误本就罕见），而在于让证明成为可被AI检索、组合与生成的结构化资产。", en: "The cost of formalization is staggering — a textbook theorem may take hundreds of lines of code, and this labor barrier means it can cover only a tiny corner of mathematics in the near term; its deeper value lies not in error prevention (mathematical errors are rare to begin with) but in turning proofs into structured assets that AI can retrieve, combine, and generate." },
      ifAnswered: { zh: "若能建成统一、可机读的数学语料库，自动定理发现、跨领域类比与AI辅助研究都将获得共同基底，重塑数学的生产方式。", en: "A unified, machine-readable corpus of mathematics would give automated theorem discovery, cross-field analogy, and AI-assisted research a common substrate, reshaping how mathematics is produced." },
      approaches: [
        { zh: "用Lean等证明助理把定理与证明逐条翻译成机器可验证的形式语言", en: "Using proof assistants like Lean to translate theorems and proofs, statement by statement, into machine-verifiable formal language" },
        { zh: "由社区共同维护、持续扩张的mathlib证明库", en: "A community-maintained, continually expanding proof library such as mathlib" },
        { zh: "把结构化证明变成可被AI检索、组合与生成的资产", en: "Turning structured proofs into assets that AI can retrieve, combine, and generate" },
      ],
      barrier: { zh: "形式化成本高得惊人，一个教科书定理可能要写数百行代码，这道劳动壁垒决定它短期只能覆盖数学的极小角落。", en: "The cost of formalization is staggering — a textbook theorem can take hundreds of lines of code — and this labor barrier means only a tiny corner of mathematics can be covered in the near term." },
      subQuestions: [
        { zh: "机器可验证但人类无法理解的证明，算不算人类的数学知识？", en: "Does a proof that is machine-verifiable but humanly incomprehensible count as human mathematical knowledge?" },
        { zh: "数学中的\"美\"与\"值得研究\"能否被形式化为可计算的量？", en: "Can mathematical beauty and \"what's worth studying\" be formalized into computable quantities?" },
        { zh: "整个数学能否被压缩进一个统一、可机读、可搜索的语料库？", en: "Can the whole of mathematics be compressed into one unified, machine-readable, searchable corpus?" },
        { zh: "失去人类叙事组织的数学语料库，会加速研究还是变得无人能导航？", en: "Would a math corpus stripped of human organizing narrative accelerate research, or become un-navigable by anyone?" },
      ],
    },
    stage: 2, members: 6, activity: 58,
    chart: { x: 435, y: 315, scale: 0.85 },
  },
  {
    id: 5, atlasN: 851, slug: "causal-rep-learning",
    title: { zh: "可识别因果表征学习", en: "Identifiable Causal Representation Learning" },
    qfocus: { zh: "从高维观测里同时解耦潜在因果变量并恢复因果图——何时可信？", en: "Disentangling latent causal variables and their graph from raw observations — when is it trustworthy?" },
    domain: "数理",
    cluster: { code: "C51", zh: "因果科学·可信推断", en: "Causal science · trustworthy inference" },
    scores: [5, 4, 3, 2, 4, 3, 4, 3, 5],
    citation: { url: "https://arxiv.org/abs/2506.07918", title: "CausalPFN: Amortized Causal Effect Estimation", venue: "arXiv (NeurIPS 2025)", year: 2025 },
    brief: { zh: "用评分函数在干预前后的变化解耦因果变量，可识别性从强条件放宽到非参数未知干预。", en: "Score-function shifts disentangle causal variables; identifiability relaxed to nonparametric unknown interventions." },
    depth: {
      overview: { zh: "可识别因果表征学习的目标是从高维原始观测（像素、基因表达）中把潜在因果变量解耦出来，并恢复它们之间的因果图，关键武器是对数密度梯度（score function）在干预前后的变化。新结果把可识别性从\"需配对/耦合环境\"放宽到非参数、未知干预、无需忠实性假设。", en: "Score-based causal representation learning aims to simultaneously disentangle latent causal variables from high-dimensional raw observations (pixels, gene expression) and recover the causal graph among them, using how the score — the gradient of log-density — shifts before and after intervention. New results relax identifiability from requiring paired/coupled environments to nonparametric settings with unknown interventions and no faithfulness assumption." },
      whyMatters: { zh: "最硬的难点是从可识别性定理到可落地估计器的鸿沟——多数证明依赖\"每个潜变量都有干预\"且需稳定估计高维score，而真实数据里干预稀疏、噪声大，定理成立的条件几乎无法验证。", en: "The hardest difficulty is the gap between identifiability theorems and deployable estimators — most proofs require that every latent variable be intervened on, plus stable high-dimensional score estimation, yet real data has sparse interventions and heavy noise, so the conditions under which the theorems hold are nearly unverifiable." },
      ifAnswered: { zh: "方向正从\"每节点需两次硬干预\"的强条件走向更少环境、有限样本、软干预下仍可证可识别的最小假设集——这是把因果表征学习从理论推向真实科学数据的临界一跃。", en: "The frontier is moving from strong conditions like \"two hard interventions per node\" toward the minimal assumption set that still proves identifiability with fewer environments, finite samples, and soft interventions — the critical leap from theory to real scientific data." },
      approaches: [
        { zh: "用干预前后score function的差异识别线性甚至一般非线性变换下的潜在SCM（Varıcı等，arXiv:2301.08230/2402.00849）", en: "Using the difference in the score function before and after intervention to identify latent SCMs under linear or even general nonlinear transforms (Varıcı et al., arXiv:2301.08230/2402.00849)" },
        { zh: "von Kügelgen等给出未知干预下的非参数可识别性，放宽耦合环境与忠实性假设", en: "von Kügelgen et al.'s nonparametric identifiability under unknown interventions, relaxing the dependence on coupled environments and faithfulness" },
        { zh: "ROPES用score-based CRL做机械臂位姿估计，仅靠分布变化、无标签即可解耦可控关节角（arXiv:2510.20884, 2025）", en: "ROPES applies score-based CRL to robot-arm pose estimation, disentangling controllable joint angles from distribution shift alone, with no labels (arXiv:2510.20884, 2025)" },
      ],
      barrier: { zh: "多数可识别性证明依赖\"每个潜变量都有干预\"且需稳定估计高维score，真实数据里干预稀疏、噪声大，定理成立的条件几乎无法验证。", en: "Most identifiability proofs require that every latent variable be intervened on plus stable high-dimensional score estimation, but real data has sparse interventions and heavy noise, so the conditions under which the theorems hold are almost unverifiable." },
      subQuestions: [
        { zh: "能否把\"每节点需硬干预\"放宽到更少环境、软干预下仍可证的最小假设集？", en: "Can the \"hard intervention per node\" requirement be relaxed to a minimal assumption set still provable under fewer environments and soft interventions?" },
        { zh: "高维score的稳定估计误差会如何传导进最终的因果图恢复精度？", en: "How does estimation error in high-dimensional score propagate into the accuracy of the recovered causal graph?" },
        { zh: "像ROPES这样的近实用试验台能否推广到无法半合成标定的真实科学数据？", en: "Can near-practical testbeds like ROPES generalize to real scientific data that cannot be semi-synthetically calibrated?" },
        { zh: "可识别性定理的成立条件能否被设计成可现场验证，而非只能事后假设？", en: "Can the conditions under which identifiability theorems hold be made field-verifiable, rather than assumed only after the fact?" },
      ],
    },
    stage: 2, members: 6, activity: 42,
    chart: { x: 170, y: 425, scale: 0.68 },
  },
  {
    id: 6, atlasN: 568, slug: "tabletop-quantum-gravity",
    title: { zh: "桌面量子引力", en: "Tabletop Quantum Gravity" },
    qfocus: { zh: "两个介观质量的叠加能否证明引力必须被量子化？", en: "Can superpositions of two mesoscopic masses prove gravity must be quantized?" },
    domain: "数理",
    cluster: { code: "C33", zh: "基础物理·实在的本质", en: "Fundamental physics · nature of reality" },
    scores: [5, 4, 4, 1, 3, 1, 2, 4, 5],
    citation: { url: "https://doi.org/10.1038/nphys2309", title: "On the reality of the quantum state", venue: "Nature Physics", year: 2012 },
    brief: { zh: "用介观质量空间叠加看引力能否产生纠缠——若能则引力必须量子化。", en: "Mesoscopic-mass superpositions test whether gravity can entangle — if so, gravity is quantized." },
    depth: {
      overview: { zh: "桌面量子引力用两个介观质量分别处于空间叠加态、仅通过引力相互作用的桌面实验，检验引力能否在它们之间产生量子纠缠（Bose–Marletto–Vedral方案）。其逻辑是：经典、局域、不可纠缠的通道无法生成纠缠，故若观测到纠缠，引力场本身就必须是量子的。", en: "Tabletop quantum gravity places two mesoscopic masses each in spatial superposition, interacting only via gravity, to test whether gravity can generate quantum entanglement between them (the Bose-Marletto-Vedral scheme). The logic: a classical, local, non-entangling channel cannot generate entanglement, so if entanglement is observed, the gravitational field itself must be quantum." },
      whyMatters: { zh: "它的分量在于可能首次为\"引力必须量子化\"提供实验室判据，而非靠普朗克尺度的思辨；但要让微克级质量维持足够长的相干叠加、同时屏蔽卡西米尔力等一切非引力耦合，是当前技术的极限挑战，假阳性正来自这些残余力。", en: "Its weight lies in possibly providing, for the first time, a laboratory criterion for \"gravity must be quantized,\" rather than relying on Planck-scale speculation; but keeping microgram-scale masses in coherent superposition long enough while shielding all non-gravitational couplings such as the Casimir force is at the very limit of current technology, and those residual forces are precisely the source of false positives." },
      ifAnswered: { zh: "若实验证实引力能产生纠缠，量子引力将首次获得一条可证伪的实验室判据，而不必再依赖普朗克尺度的纯理论思辨。", en: "If the experiment confirms gravity can generate entanglement, quantum gravity would gain its first falsifiable laboratory criterion, no longer dependent solely on Planck-scale theoretical speculation." },
      approaches: [
        { zh: "Bose–Marletto–Vedral方案：两个空间叠加质量间仅靠引力耦合，检验纠缠是否产生", en: "The Bose-Marletto-Vedral scheme: two spatially superposed masses coupled only by gravity, testing whether entanglement is generated" },
        { zh: "用含NV色心的微钻石做干涉仪，维持介观质量的相干叠加", en: "Using NV-center microdiamonds as interferometers to sustain coherent superposition of mesoscopic masses" },
        { zh: "屏蔽卡西米尔力等非引力残余耦合，排除纠缠信号的假阳性来源", en: "Shielding non-gravitational residual couplings such as the Casimir force to rule out false-positive sources of the entanglement signal" },
      ],
      barrier: { zh: "让微克级质量维持足够长的相干叠加、同时屏蔽卡西米尔力等一切非引力耦合，是当前技术的极限挑战，假阳性正来自这些残余力。", en: "Keeping microgram-scale masses in coherent superposition long enough while shielding all non-gravitational couplings such as the Casimir force is at the very limit of current technology, and those residual forces are precisely the source of false positives." },
      subQuestions: [
        { zh: "若观测到引力诱导纠缠，是否等同于证明时空本身携带量子自由度？", en: "If gravity-induced entanglement is observed, does that amount to proving spacetime itself carries quantum degrees of freedom?" },
        { zh: "能否把实验规模从微克级质量推进到可排除一切经典解释的量级？", en: "Can the experiment scale from microgram masses to a regime that rules out every classical explanation?" },
        { zh: "卡西米尔力等残余耦合的屏蔽极限，是工程问题还是物理原理上的硬墙？", en: "Is the shielding limit on residual couplings like the Casimir force an engineering problem, or a hard wall set by physical principle?" },
        { zh: "若引力被证实是经典的，全息原理与时空涌现图景将如何被重新校准？", en: "If gravity were instead shown to be classical, how would the holographic principle and the picture of emergent spacetime need to be recalibrated?" },
      ],
    },
    stage: 2, members: 6, activity: 44,
    dormant: true,
    chart: { x: 395, y: 435, scale: 0.75 },
  },
  {
    id: 27, atlasN: 904, slug: "triadic-percolation-connectivity-dynamical",
    title: { zh: "三元调控渗流:从连通性到动力系统", en: "Triadic Percolation: Connectivity as a Dynamical System" },
    qfocus: { zh: "渗流能否不再是一次性相变，而是会分岔走向混沌的动力系统？", en: "Can percolation stop being a one-shot transition and become a dynamical system that bifurcates into chaos?" },
    domain: "数理",
    cluster: { code: "C14", zh: "复杂系统·多智能体", en: "Complex systems · multi-agent systems" },
    scores: [5, 4, 3, 2, 3, 4, 4, 4, 5],
    citation: { url: "https://www.nature.com/articles/s41467-023-37019-5", title: "The dynamic nature of percolation on networks with triadic interactions", venue: "Nature Communications", year: 2023 },
    brief: { zh: "三元交互让节点增强或抑制另两个节点间的连边：Bianconi团队证明渗流序参量由此周期倍增、通往混沌，2025年多层推广发现Neimark-Sacker分岔。", en: "Triadic interactions let a node enhance or suppress the edge between two others: Bianconi's team showed the percolation order parameter then period-doubles into chaos, and a 2025 multilayer extension found Neimark-Sacker bifurcations." },
    depth: {
      overview: { zh: "渗流是网络科学最古老的临界现象之一，长期被当作一次性的连通/断裂相变。三元调控渗流引入带符号的三元交互——一个节点去调节另外两个节点之间的边——使巨连通分量随迭代周期倍增、走向混沌，把静态的连通性问题升级为完整的时变动力系统，并有解析理论精确预测随机图的全相图。", en: "Percolation is one of network science's oldest critical phenomena, long treated as a one-shot connectivity transition. Triadic percolation introduces signed triadic interactions—a node regulating the edge between two others—so the giant component period-doubles and routes to chaos under iteration, upgrading static connectivity into a full time-varying dynamical system, with an analytic theory that exactly predicts the phase diagram on random graphs." },
      whyMatters: { zh: "它首次把'功能连通性随时间非平凡变化'（脑、气候、生态网络的典型特征）纳入渗流的统一框架，但最硬的张力在于：从优雅的随机图理论跨到真实网络时，谁在调控谁的符号化结构很难从数据中辨识，周期倍增与混沌究竟是真实预言还是噪声伪装，缺少可证伪的实证基准。", en: "It is the first framework to fold nontrivially time-varying functional connectivity—typical of brain, climate, and ecological networks—into percolation theory. But the hardest tension is that moving from elegant random-graph theory to real networks makes the signed regulatory structure (who regulates whom) hard to identify from data, and there is no falsifiable empirical benchmark to tell real period-doubling and chaos from noise dressed up as dynamics." },
      ifAnswered: { zh: "若能在真实脑、气候或生态网络上把时变连通性读出为可预测的动力学，'网络连通'就不再是静态的是/否问题，而成为一套可预报、可干预的动力学指标，为理解涌现与集体行为提供新的普适工具。", en: "If time-varying connectivity can be read out as predictable dynamics on real brain, climate, or ecological networks, network connectivity stops being a static yes/no property and becomes a forecastable, interveneable dynamical signature—a new general tool for understanding emergence and collective behavior." },
      approaches: [
        { zh: "对带符号三元交互建立解析理论，精确预测随机图全相图", en: "Building an analytic theory of signed triadic interactions that exactly predicts the full phase diagram on random graphs" },
        { zh: "把单层理论推广到多层网络，捕捉Neimark-Sacker分岔与任意长周期振荡", en: "Extending the single-layer theory to multilayer networks, capturing Neimark-Sacker bifurcations and arbitrarily long-period oscillations" },
        { zh: "在真实脑、气候、生态网络上把功能连通性的时变规律作为动力学读出", en: "Reading out the time-varying dynamics of functional connectivity on real brain, climate, and ecological networks" },
      ],
      barrier: { zh: "谁在调控谁的符号化调控结构很难从真实数据中辨识，周期倍增与混沌究竟是模型的真实预言还是噪声的伪装，目前缺少可证伪的实证基准。", en: "The signed regulatory structure—who regulates whom—is hard to identify from real data, and there is no falsifiable empirical benchmark to tell whether period-doubling and chaos are genuine predictions or noise in disguise." },
      subQuestions: [
        { zh: "能否从观测数据中反推出真实网络里的三元调控结构，而非假设已知？", en: "Can the triadic regulatory structure of a real network be inferred from observational data rather than assumed known?" },
        { zh: "多层推广中的Neimark-Sacker分岔在真实脑网络中是否有可观测的对应物？", en: "Does the Neimark-Sacker bifurcation found in the multilayer extension have an observable counterpart in real brain networks?" },
        { zh: "如何设计可证伪的实证基准，把周期倍增与混沌同噪声区分开？", en: "How can a falsifiable empirical benchmark be designed to separate genuine period-doubling and chaos from noise?" },
      ],
    },
    stage: 2, members: 10, activity: 66,
    chart: { x: 150, y: 241, scale: 1.02 },
  },
  {
    id: 28, atlasN: 572, slug: "experimental-determination-wavefunction-collapse",
    title: { zh: "波函数坍缩的实验判定（客观坍缩）", en: "Experimental Determination of Wavefunction Collapse (Objective Collapse)" },
    qfocus: { zh: "波函数坍缩到底是真实物理过程，还是永远无法证伪的诠释之争？", en: "Is wavefunction collapse a real physical process, or an interpretive dispute that can never be falsified?" },
    domain: "数理",
    cluster: { code: "C33", zh: "基础物理·实在的本质", en: "Fundamental physics · the nature of reality" },
    scores: [5, 4, 4, 1, 3, 1, 3, 4, 5],
    citation: { url: "https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.129.080401", title: "Search for Spontaneous Radiation from Wave Function Collapse in the Majorana Demonstrator", venue: "Physical Review Letters", year: 2022 },
    brief: { zh: "用宏观叠加态搜寻Diósi-Penrose与CSL预言的额外噪声或自发X射线辐射，低本底探测器已排除最简版无参数DP模型，首次让量子诠释可被实验区分。", en: "Using macroscopic superpositions to hunt for the extra noise or spontaneous X-rays predicted by Diósi-Penrose and CSL, low-background detectors have already ruled out the simplest parameter-free DP model, letting quantum interpretations be distinguished experimentally for the first time." },
    depth: {
      overview: { zh: "'测量问题'长期属于哲学范畴：叠加态如何变成确定结果。客观坍缩理论（引力诱导的Diósi-Penrose、连续自发定域CSL）给出了具体、可检验的预言——坍缩会产生超出标准退相干的额外噪声或自发辐射。用宏观物体的量子叠加态去搜寻这一信号，第一次把量子诠释之争变成了可证伪的物理实验。", en: "The 'measurement problem'—how superpositions become definite outcomes—has long belonged to philosophy. Objective-collapse theories (gravity-induced Diósi-Penrose, continuous spontaneous localization CSL) make concrete, testable predictions: collapse should produce extra noise or spontaneous radiation beyond standard decoherence. Searching for this signal using quantum superpositions of macroscopic objects turns the interpretation debate into falsifiable physics for the first time." },
      whyMatters: { zh: "意义在于把百年悬而未决的测量问题变成可证伪的物理，但难点是要把客观坍缩信号从环境退相干、机械振动、宇宙射线等海量背景中剥离，零结果只能逐步收紧参数空间，难以一锤定音地证实或证伪。", en: "The stakes are turning the century-old measurement problem into falsifiable physics, but the difficulty is isolating an objective-collapse signal from environmental decoherence, mechanical vibration, and cosmic-ray backgrounds; a null result can only progressively tighten the parameter space rather than settle the question outright." },
      ifAnswered: { zh: "若探测到坍缩伴随的自发辐射，我们将首次以实验裁决量子诠释之争，确立波函数坍缩为真实的物理过程；若持续零结果，客观坍缩理论的可行参数空间将被逐步逼死。", en: "Detecting the spontaneous radiation collapse should produce would for the first time let experiment adjudicate the interpretation debate and establish collapse as a real physical process; continued null results would instead progressively squeeze objective-collapse theories out of viable parameter space." },
      approaches: [
        { zh: "用低本底探测器搜寻坍缩理论预言的自发X射线辐射", en: "Using low-background detectors to search for the spontaneous X-ray radiation predicted by collapse theories" },
        { zh: "以宏观物体的量子叠加态测量超出标准退相干的额外噪声", en: "Measuring extra noise beyond standard decoherence in quantum superpositions of macroscopic objects" },
        { zh: "用实验结果逐步收紧Diósi-Penrose与CSL模型的自由参数空间", en: "Using experimental results to progressively constrain the free-parameter space of the Diósi-Penrose and CSL models" },
      ],
      barrier: { zh: "要把客观坍缩信号从环境退相干、机械振动与宇宙射线等海量背景中剥离，零结果只能逐步收紧参数而难以一锤定音。", en: "Isolating an objective-collapse signal from the vast backgrounds of environmental decoherence, mechanical vibration, and cosmic rays means null results can only progressively tighten parameters rather than settle the matter at a stroke." },
      subQuestions: [
        { zh: "最简无参数DP模型已被排除，带参数的DP与CSL模型还能被压缩到多小的空间？", en: "With the simplest parameter-free DP model already ruled out, how far can parametrized DP and CSL models still be squeezed?" },
        { zh: "能否设计出即使零结果也能给出决定性判据的实验方案？", en: "Can an experimental design be found that yields a decisive verdict even from a null result?" },
        { zh: "宏观叠加态的规模需要推进到何种量级，才能让坍缩信号显著高于背景噪声？", en: "To what scale must macroscopic superpositions be pushed before a collapse signal clearly exceeds background noise?" },
      ],
    },
    stage: 2, members: 8, activity: 58,
    chart: { x: 259, y: 244, scale: 1.01 },
  },
  {
    id: 29, atlasN: 898, slug: "coarse-graining-free-causal-emergence-dynamical",
    title: { zh: "粗粒化无关的因果涌现:动力学可逆性与奇异谱", en: "Coarse-Graining-Free Causal Emergence via Dynamical Reversibility" },
    qfocus: { zh: "因果涌现的强弱，能否不再依赖人为挑选的粗粒化方案？", en: "Can the strength of causal emergence be measured without depending on an arbitrarily chosen coarse-graining scheme?" },
    domain: "数理",
    cluster: { code: "C14", zh: "复杂系统·多智能体", en: "Complex systems · multi-agent systems" },
    scores: [5, 4, 4, 2, 3, 4, 4, 4, 4],
    citation: { url: "https://www.nature.com/articles/s44260-025-00028-0", title: "Dynamical reversibility and a new theory of causal emergence based on SVD", venue: "npj Complexity", year: 2025 },
    brief: { zh: "对马尔可夫转移矩阵做奇异值分解，用奇异谱集中度定义近似动力学可逆性，张江团队证明它与有效信息最大化等价，把涌现度量从选方案变成读谱。", en: "By taking the SVD of the Markov transition matrix and defining approximate dynamical reversibility from the concentration of its singular spectrum, Zhang Jiang's team proved this is equivalent to maximizing effective information, turning emergence measurement from choosing a scheme into reading a spectrum." },
    depth: {
      overview: { zh: "Hoel的因果涌现理论用有效信息衡量宏观是否比微观'因果更强'，但结论严重依赖人为选定的粗粒化方案，不同方案给出截然不同的涌现量。2025年发表于npj Complexity的工作绕开了这个尴尬：直接对马尔可夫链的转移矩阵做奇异值分解，用奇异谱的集中度定义'近似动力学可逆性'，不挑尺度就能刻画系统的冗余程度。", en: "Hoel's causal-emergence theory uses effective information to gauge whether a macro-level description is causally stronger than the micro level, but the conclusion depends heavily on an arbitrarily chosen coarse-graining scheme, with different choices yielding starkly different emergence values. A 2025 paper in npj Complexity sidesteps this: it takes the SVD of the Markov chain's transition matrix directly, defining 'approximate dynamical reversibility' from the concentration of the singular spectrum, capturing redundancy without picking a scale." },
      whyMatters: { zh: "它在布尔网络、元胞自动机与复杂网络上数值验证了奇异谱集中度与有效信息最大化的等价性，是该领域近年最关键的去任意性进展之一；但最硬的张力是：奇异谱集中度是否真的等同于更强的因果，还是只是更好的可压缩性，在连续态与强非线性系统里这一等价性尚未被验证。", en: "It numerically verifies the equivalence between singular-spectrum concentration and effective-information maximization on Boolean networks, cellular automata, and complex networks, making it one of the field's most important de-arbitrarizing advances in recent years. But the hardest tension is whether spectral concentration truly tracks stronger causation or merely better compressibility—the equivalence remains unverified in continuous-state and strongly nonlinear systems." },
      ifAnswered: { zh: "若奇异谱判据能推广到连续态、非马尔可夫与大规模真实网络，因果涌现就能变成一把'插上去就读数'的涌现强度仪表，让复杂系统研究第一次拥有不依赖主观选择的涌现度量。", en: "If the singular-spectrum criterion extends to continuous-state, non-Markovian, and large real networks, causal emergence would become a plug-in 'emergence-strength gauge,' giving complex-systems research its first emergence measure that does not depend on subjective choices." },
      approaches: [
        { zh: "对马尔可夫转移矩阵做奇异值分解，用奇异谱集中度定义近似动力学可逆性", en: "Taking the SVD of the Markov transition matrix and defining approximate dynamical reversibility from singular-spectrum concentration" },
        { zh: "在布尔网络、元胞自动机与复杂网络上数值验证该判据与有效信息最大化的等价性", en: "Numerically verifying the criterion's equivalence to effective-information maximization on Boolean networks, cellular automata, and complex networks" },
        { zh: "把判据推广到连续态、非马尔可夫与大规模稀疏转移矩阵的谱估计", en: "Extending the criterion to continuous-state, non-Markovian systems and spectral estimation on large sparse transition matrices" },
      ],
      barrier: { zh: "奇异谱集中度是否真的等同于更强的因果、还是只是更好的可压缩性，在连续态与强非线性系统里尚未被验证，大规模稀疏矩阵的谱估计也仍是瓶颈。", en: "Whether spectral concentration truly equals stronger causation, or merely better compressibility, remains unverified in continuous-state and strongly nonlinear systems, and spectral estimation for large sparse matrices is still a bottleneck." },
      subQuestions: [
        { zh: "奇异谱集中度与有效信息最大化的等价性能否扩展到连续态系统？", en: "Can the equivalence between singular-spectrum concentration and effective-information maximization extend to continuous-state systems?" },
        { zh: "如何在非马尔可夫动力学中定义类似的近似可逆性判据？", en: "How can an analogous approximate-reversibility criterion be defined for non-Markovian dynamics?" },
        { zh: "大规模稀疏转移矩阵的谱估计瓶颈能否被高效算法突破？", en: "Can efficient algorithms overcome the spectral-estimation bottleneck for large sparse transition matrices?" },
      ],
    },
    stage: 2, members: 8, activity: 64,
    chart: { x: 384, y: 249, scale: 1.02 },
  },
  {
    id: 30, atlasN: 900, slug: "emergent-conventions-collective-bias-tipping",
    title: { zh: "LLM 群体的涌现规约与集体偏见临界点", en: "Emergent Conventions and Collective-Bias Tipping Points in LLM Populations" },
    qfocus: { zh: "没有中央指令，成千LLM智能体能否自发谈出共享语言，还是只是记忆重放？", en: "Without any central command, can a thousand LLM agents genuinely negotiate a shared language—or is it just memory replay?" },
    domain: "数理",
    cluster: { code: "C14", zh: "复杂系统·多智能体", en: "Complex systems · multi-agent systems" },
    scores: [5, 5, 3, 3, 3, 4, 4, 4, 4],
    citation: { url: "https://www.science.org/doi/10.1126/sciadv.adu9368", title: "Emergent social conventions and collective bias in LLM populations", venue: "Science Advances", year: 2025 },
    brief: { zh: "去中心化LLM智能体在命名博弈中两两交互即自发收敛到共享规约，并涌现集体偏见，少数坚定智能体可触发临界质量式翻转，结论在Llama-2/3与Claude-3.5上稳健。", en: "Decentralized LLM agents in a naming game converge on a shared convention through pairwise interaction alone, developing collective bias that no individual holds, with a committed minority able to tip the whole population—robust across Llama-2/3 and Claude-3.5." },
    depth: {
      overview: { zh: "把上千个类ChatGPT智能体放进同一个最小命名博弈协议，不给任何中央指令，它们会像人类社群一样自己谈出一套共享叫法——还会集体跑偏出任何单体都不具备的偏见。这把人类社会学的临界质量理论第一次搬进纯机器群体，成为可控变量、可重复的社会涌现实验台。", en: "Placing thousands of ChatGPT-like agents into the same minimal naming-game protocol, with no central instruction, they negotiate a shared vocabulary the way human communities do—and develop a collective bias no individual agent holds. This transplants human critical-mass theory into a purely machine collective for the first time, as a controllable, repeatable lab for social emergence." },
      whyMatters: { zh: "结论在Llama-2/3与Claude-3.5等四种模型上稳健，但最硬的张力是'真涌现 vs 数据泄漏'：批评者论证所谓自发规约不过是模型回忆起预训练里见过的协调博弈结构，缺乏能彻底排除记忆混淆的对照设计，整条研究线悬在证伪的刀刃上。", en: "The finding holds up robustly across four model families including Llama-2/3 and Claude-3.5, but the hardest tension is 'genuine emergence versus data leakage': critics argue the apparent spontaneous convention is just the model recalling coordination-game structures seen in pretraining, and no control design yet fully rules out this memory confound—leaving the whole research line balanced on a falsifiability knife-edge." },
      ifAnswered: { zh: "若能设计出彻底排除记忆混淆的对照实验，我们将首次确证LLM群体确能自发产生真正的社会涌现，为理解与设计大规模AI代理群的集体行为提供可重复的实验基础。", en: "A control design that fully rules out memory confounds would for the first time confirm that LLM populations can genuinely produce social emergence, giving a reproducible experimental foundation for understanding and designing the collective behavior of large-scale AI agent swarms." },
      approaches: [
        { zh: "用最小命名博弈协议让去中心化智能体通过两两交互与自我强化收敛规约", en: "Using a minimal naming-game protocol so decentralized agents converge on conventions through pairwise interaction and self-reinforcement" },
        { zh: "在Llama-2/3、Claude-3.5等多种模型上重复实验以检验结论的稳健性", en: "Replicating the experiment across multiple model families like Llama-2/3 and Claude-3.5 to test robustness" },
        { zh: "研究网络拓扑与记忆深度如何决定共识、分裂或漂移", en: "Studying how network topology and memory depth determine consensus, fragmentation, or drift" },
      ],
      barrier: { zh: "批评者指出所谓自发规约可能只是模型回忆预训练中见过的协调博弈结构，目前缺乏能彻底排除这种记忆混淆的对照设计。", en: "Critics argue the apparent spontaneous convention may just be the model recalling coordination-game structures from pretraining, and no control design yet fully excludes this memory confound." },
      subQuestions: [
        { zh: "能否设计出彻底排除预训练记忆混淆的对照实验？", en: "Can a control experiment be designed that fully rules out pretraining memory confounds?" },
        { zh: "网络拓扑结构如何决定智能体群体收敛到共识还是分裂？", en: "How does network topology determine whether an agent population converges to consensus or fractures?" },
        { zh: "少数坚定智能体触发临界质量翻转的阈值条件是什么？", en: "What are the threshold conditions under which a committed minority triggers a critical-mass tipping event?" },
      ],
    },
    stage: 2, members: 9, activity: 61,
    chart: { x: 458, y: 250, scale: 1.02 },
  },
  {
    id: 31, atlasN: 1243, slug: "proximal-causal-identification-negative",
    title: { zh: "代理变量因果识别（近端因果学习）", en: "Proximal Causal Identification via Negative Controls" },
    qfocus: { zh: "不必测全所有混杂变量，因果效应还能被正确识别出来吗？", en: "Can causal effects still be correctly identified without measuring every confounder?" },
    domain: "数理",
    cluster: { code: "C51", zh: "因果科学·可信推断", en: "Causal Science · Trustworthy Inference" },
    scores: [4, 4, 4, 2, 4, 5, 4, 4, 5],
    citation: { url: "https://academic.oup.com/aje/article/194/7/2030/7775568", title: "Regression-Based Proximal Causal Inference", venue: "American Journal of Epidemiology", year: 2025 },
    brief: { zh: "用一对负对照代理变量求解混杂桥函数，把因果效应从未测混杂中恢复出来，2025年《American Journal of Epidemiology》把它降维成可回归实现的流程。", en: "By solving confounding bridge functions from a pair of negative-control proxies, causal effects are recovered despite unmeasured confounding; a 2025 American Journal of Epidemiology paper reduced this to a regression-implementable workflow." },
    depth: {
      overview: { zh: "观察性因果推断最脆弱的一环是'我们真的测全了所有混杂变量吗'，这是一个无法证伪的强假设。近端因果学习不再要求这个承诺，而是借助一对满足条件的负对照代理变量——不受处理影响的结果代理、不影响结果的暴露代理——求解混杂桥函数，把因果效应重新识别出来。", en: "Observational causal inference's most fragile link is 'have we really measured every confounder'—an untestable strong assumption. Proximal causal learning drops that requirement, instead using a pair of qualifying negative-control proxies—an outcome proxy unaffected by treatment, an exposure proxy that does not affect the outcome—to solve confounding bridge functions and re-identify the causal effect." },
      whyMatters: { zh: "2025年的回归化流程与2024年双负对照方法标志它从理论走向流行病学实操工具，但最硬的张力是代理变量的合法性本身不可完全验证：一旦代理被处理或结果暗中影响，识别就悄悄失效，而这一步恰恰难以从数据端证伪。", en: "The 2025 regression-based workflow and 2024 dual-negative-control method mark its move from theory to practical epidemiological tool, but the hardest tension is that the validity of the proxies themselves can never be fully verified: if a proxy is secretly affected by treatment or affects the outcome, identification silently fails, and this step is precisely the one that data cannot falsify." },
      ifAnswered: { zh: "若能建立代理有效性的验证协议，近端因果学习将成为观察性研究对抗未测混杂的标准防线，让因果结论在无法测全混杂变量的现实数据里依然站得住。", en: "A validation protocol for proxy adequacy would let proximal causal learning become a standard defense against unmeasured confounding in observational research, keeping causal conclusions sound even in real data where every confounder can never be measured." },
      approaches: [
        { zh: "寻找满足条件的负对照代理变量对，求解混杂桥函数恢复因果效应", en: "Finding a qualifying pair of negative-control proxies and solving confounding bridge functions to recover the causal effect" },
        { zh: "把识别流程降维成可用标准回归实现的操作步骤", en: "Reducing the identification procedure to steps implementable with standard regression" },
        { zh: "用双负对照方法在双代理设定下给出推断", en: "Using dual-negative-control methods to provide inference under a two-proxy setup" },
      ],
      barrier: { zh: "负对照必须真的负、桥函数必须真的存在，一旦代理被处理或结果暗中影响，识别就悄悄失效，而这一步恰恰难以从数据端证伪。", en: "The negative controls must truly be negative and the bridge function must truly exist; if a proxy is secretly affected by treatment or affects the outcome, identification silently fails, and this is precisely the step data cannot falsify." },
      subQuestions: [
        { zh: "如何在不知道真值的情况下验证一对负对照代理确实合格？", en: "How can one verify that a pair of negative-control proxies truly qualifies, without knowing the ground truth?" },
        { zh: "近端因果学习能否从二值、低维设定推广到纵向与连续处理？", en: "Can proximal causal learning extend from binary, low-dimensional settings to longitudinal and continuous-treatment designs?" },
        { zh: "能否把它整合进外部对照试验，成为常规的抗混杂防线？", en: "Can it be integrated into external-control trials as a routine defense against confounding?" },
      ],
    },
    stage: 2, members: 8, activity: 52,
    chart: { x: 156, y: 338, scale: 1.01 },
  },
  {
    id: 32, atlasN: 1246, slug: "out-of-variable-generalization-partial-transportability",
    title: { zh: "变量外泛化与部分可迁移性", en: "Out-of-Variable Generalization & Partial Transportability" },
    qfocus: { zh: "当目标环境出现从未与旧变量同测过的新变量时，知识还能迁移吗？", en: "When a target environment contains new variables never jointly observed with the old ones, can knowledge still transfer?" },
    domain: "数理",
    cluster: { code: "C51", zh: "因果科学·可信推断", en: "Causal Science · Trustworthy Inference" },
    scores: [5, 4, 2, 2, 4, 4, 2, 4, 5],
    citation: { url: "https://openreview.net/forum?id=zwMfg9PfPs", title: "Out-of-Variable Generalisation for Discriminative Models", venue: "ICLR 2024 (OpenReview)", year: 2024 },
    brief: { zh: "Guo与Schölkopf证明源环境残差分布泄露真实生成函数对未观测因果父变量的偏导数，把变量外泛化从工程无奈变成可分析的数学对象。", en: "Guo and Schölkopf proved the source-environment residual distribution leaks the partial derivative of the true generating function with respect to an unobserved causal parent, turning out-of-variable generalization from engineering fallback into an analyzable mathematical object." },
    depth: {
      overview: { zh: "标准OOD泛化默认新环境里变量集合不变、只是分布在变；变量外泛化（OOV）问了更狠的问题：目标环境含有从未与旧变量同时观测过的新变量时，知识该如何迁移。真实科学从不满足OOD的前提——每个实验室、每台仪器测的变量集合根本不同，OOV第一次把这当成可证明的数学问题，而非工程无奈。", en: "Standard OOD generalization assumes the variable set stays fixed while only the distribution shifts; out-of-variable (OOV) generalization asks the harder question of how knowledge transfers when the target environment contains variables never jointly observed with the old ones. Real science never satisfies OOD's premise—every lab and instrument measures a different variable set—and OOV is the first framework to treat this as a provable mathematical problem rather than an engineering nuisance." },
      whyMatters: { zh: "Guo的定理同时是发现也是警告：仅靠边缘一致性根本无法识别目标预测函数（否定），但源环境残差矩确实泄露对未观测因果父变量的偏导数（肯定）；难点是这个构造目前只在低维、加性噪声设定下成立，离真实科学数据管线还有一段没人填的硬缺口。", en: "Guo's theorem is both a discovery and a warning: marginal consistency alone cannot identify the target prediction function (the negative result), yet source-environment residual moments do leak the partial derivative with respect to the unobserved causal parent (the positive result); the difficulty is that this construction currently only holds in low-dimensional, additive-noise settings, leaving a hard, unfilled gap before real scientific data pipelines." },
      ifAnswered: { zh: "若能把偏导数恢复构造推广到高维与非加性噪声设定，OOV有望成为多实验室、多测量协议科学数据融合的理论底座——每个实验室只测部分变量，恰是它的原生场景。", en: "If the partial-derivative-recovery construction extends to high-dimensional, non-additive-noise settings, OOV could become the theoretical substrate for fusing multi-lab, multi-protocol scientific data—every lab measuring only a subset of variables is exactly its native scenario." },
      approaches: [
        { zh: "证明边缘一致性不足以识别目标预测函数的否定结果", en: "Proving the negative result that marginal consistency alone cannot identify the target prediction function" },
        { zh: "从源环境残差矩恢复对未观测因果父变量的偏导数", en: "Recovering the partial derivative with respect to an unobserved causal parent from source-environment residual moments" },
        { zh: "用神经因果模型为未见域预测风险给出可计算的最坏情形界（部分可迁移性）", en: "Using neural causal models to give computable worst-case bounds on prediction risk in unseen domains (partial transportability)" },
      ],
      barrier: { zh: "靠残差矩恢复偏导数的构造目前只在低维、加性噪声设定下成立，离真实科学数据管线还有一段没人填的硬缺口。", en: "The residual-moment construction for recovering the partial derivative currently only holds in low-dimensional, additive-noise settings, leaving a hard gap before real scientific data pipelines that no one has yet filled." },
      subQuestions: [
        { zh: "偏导数恢复构造能否推广到高维、非加性噪声的真实数据设定？", en: "Can the partial-derivative-recovery construction extend to high-dimensional, non-additive-noise real-data settings?" },
        { zh: "部分可迁移性给出的最坏情形界在实践中是否足够紧？", en: "Are the worst-case bounds given by partial transportability tight enough to be useful in practice?" },
        { zh: "如何把多实验室、多协议的变量外数据真正融合成统一模型？", en: "How can multi-lab, multi-protocol out-of-variable data actually be fused into a unified model?" },
      ],
    },
    stage: 1, members: 6, activity: 51,
    chart: { x: 265, y: 326, scale: 0.88 },
  },
  {
    id: 33, atlasN: 1486, slug: "category-theory-algebraic-theory",
    title: { zh: "范畴论作为一切神经网络架构的代数理论", en: "Category Theory as an Algebraic Theory of All Neural Architectures" },
    qfocus: { zh: "所有神经网络架构，能否从同一套范畴论代数语法里被推导出来？", en: "Can every neural-network architecture be derived from one shared categorical algebraic grammar?" },
    domain: "数理",
    cluster: { code: "C23", zh: "AI数学·形式科学", en: "AI mathematics · formal science" },
    scores: [5, 4, 3, 4, 5, 5, 2, 4, 5],
    citation: { url: "https://arxiv.org/abs/2402.15332", title: "Position: Categorical Deep Learning is an Algebraic Theory of All Architectures", venue: "ICML 2024 (arXiv)", year: 2024 },
    brief: { zh: "用2-范畴上的单子同时刻画约束与实现，Gavranović、Veličković等在ICML 2024立场论文中演示从中重新导出RNN等架构，让架构设计从手工拼凑变成代数演算。", en: "Using monads valued in a 2-category to jointly capture constraints and implementations, Gavranović, Veličković and colleagues' ICML 2024 position paper demonstrated re-deriving architectures like RNNs from it, turning architecture design from hand-crafting into algebraic calculus." },
    depth: {
      overview: { zh: "几何深度学习曾用群论统一了'对称性即架构约束'，却缺一座从约束规范通向具体实现的桥。这条线索用范畴论的泛代数——2-范畴上的单子——同时描述模型必须满足的约束与模型的实现，让RNN、几何深度学习的对称性约束乃至自动机都从同一套代数结构中被推导出来，而非各自手工设计。", en: "Geometric deep learning once unified 'symmetry as architectural constraint' via group theory, but lacked a bridge from constraint specification to concrete implementation. This line uses category theory's universal algebra—monads valued in a 2-category—to jointly describe the constraints a model must satisfy and its implementation, so RNNs, geometric deep learning's symmetry constraints, and even automata are all derivable from one algebraic structure rather than hand-designed separately." },
      whyMatters: { zh: "最硬的难点是落地真值：这仍主要是一篇立场/理论论文，尚无一个由该理论推导出、且跑赢手工设计的可证伪基准；它能否从优美的统一叙事变成工程上真正省事的工具，是最大的悬案。", en: "The hardest difficulty is grounding it in results: this remains mainly a position/theoretical paper, with no falsifiable benchmark yet where a theory-derived architecture actually beats hand-designed ones; whether it can move from an elegant unifying narrative to a genuinely time-saving engineering tool is the biggest open question." },
      ifAnswered: { zh: "若能从想要的等式或对称性出发自动生成满足它的网络结构，架构搜索就会变成代数演算，走向'按需推导架构'的编译式深度学习。", en: "If networks satisfying desired equations or symmetries can be automatically generated from those specifications, architecture search would become algebraic calculus—heading toward 'derive-the-architecture-on-demand' compilational deep learning." },
      approaches: [
        { zh: "用2-范畴上的单子同时刻画模型的约束与实现", en: "Using monads valued in a 2-category to jointly capture a model's constraints and implementation" },
        { zh: "从范畴代数结构中重新导出RNN等既有架构作为验证", en: "Re-deriving existing architectures like RNNs from the categorical algebraic structure as validation" },
        { zh: "借助范畴光学、弦图等工具梳理深度学习的范畴论基础", en: "Using tools like categorical optics and string diagrams to lay out deep learning's categorical foundations" },
      ],
      barrier: { zh: "这仍主要是一篇立场/理论论文，尚无一个由该理论推导出、且跑赢手工设计的可证伪基准。", en: "This remains mainly a position/theoretical paper, with no falsifiable benchmark yet where a theory-derived architecture actually outperforms hand-designed ones." },
      subQuestions: [
        { zh: "能否找到一个由该理论推导、且实测优于手工设计的架构案例？", en: "Can a theory-derived architecture be found that empirically outperforms a hand-designed one?" },
        { zh: "范畴光学与弦图等工具能否降低这套代数语言的使用门槛？", en: "Can tools like categorical optics and string diagrams lower the barrier to using this algebraic language?" },
        { zh: "'按需推导架构'的编译式深度学习距离实际可用还有多远？", en: "How far is 'derive-the-architecture-on-demand' compilational deep learning from practical usability?" },
      ],
    },
    stage: 2, members: 10, activity: 62,
    chart: { x: 355, y: 329, scale: 1.02 },
  },
  {
    id: 34, atlasN: 373, slug: "ai-assisted-theorem-proving",
    title: { zh: "AI 辅助定理证明", en: "AI-Assisted Theorem Proving" },
    qfocus: { zh: "AI能攻克奥赛级数学难题，但它能提出真正有深度的新数学吗？", en: "AI can crack olympiad-level problems, but can it propose genuinely deep new mathematics?" },
    domain: "数理",
    cluster: { code: "C23", zh: "AI数学·形式科学", en: "AI mathematics · formal science" },
    scores: [5, 4, 5, 3, 5, 3, 5, 4, 3],
    citation: { url: "https://www.nature.com/articles/s41586-025-09833-y", title: "Olympiad-level formal mathematical reasoning with reinforcement learning", venue: "Nature", year: 2025 },
    brief: { zh: "AlphaProof、AlphaGeometry等结合大模型、强化学习与Lean、Coq等证明助手，已达IMO竞赛水平，把数学证明变成可机器搜索验证的形式对象。", en: "Systems like AlphaProof and AlphaGeometry combine large models, reinforcement learning, and proof assistants like Lean and Coq, reaching IMO-competition level and turning mathematical proof into a machine-searchable, machine-verifiable formal object." },
    depth: {
      overview: { zh: "AI辅助定理证明把大模型、强化学习与交互式证明助手结合，让AI搜索证明路径、补全引理，甚至独立攻克数学难题。它交叉数学、AI与形式逻辑，核心是把数学证明转化为可被机器搜索与验证的形式对象，或有助于求解重大猜想。", en: "AI-assisted theorem proving combines large models, reinforcement learning, and interactive proof assistants to let AI search for proof paths, fill in lemmas, and even independently crack hard problems. Spanning mathematics, AI, and formal logic, its core is turning mathematical proof into a machine-searchable, machine-verifiable formal object that may help solve major conjectures." },
      whyMatters: { zh: "它已在竞赛级问题上展示实力，但从解题到提出有深度的新数学之间仍隔着审美与品味的鸿沟，而那恰是难以形式化的；真正的杠杆在于一旦证明可机器验证，数学界对信任谁的证明这一社会过程的依赖将被根本改变。", en: "It has already shown strength on competition-level problems, but a gulf of aesthetics and taste—precisely what is hard to formalize—still separates 'solving problems' from 'proposing deep new mathematics'; the real leverage is that once proofs are machine-verifiable, mathematics' reliance on the social process of deciding whose proof to trust will be fundamentally changed." },
      ifAnswered: { zh: "若AI能独立提出有深度的新猜想并给出可信证明，数学研究的生产方式将被重塑，机器验证也可能取代部分同行评审的社会功能。", en: "If AI can independently propose deep new conjectures and give trustworthy proofs, how mathematical research is produced would be reshaped, and machine verification could take over part of peer review's social function." },
      approaches: [
        { zh: "结合大模型与强化学习在Lean、Coq、Isabelle中搜索证明路径", en: "Combining large models and reinforcement learning to search for proof paths within Lean, Coq, and Isabelle" },
        { zh: "用AlphaGeometry等系统攻克IMO竞赛级几何与代数问题", en: "Using systems like AlphaGeometry to crack IMO-competition-level geometry and algebra problems" },
        { zh: "把证明转化为形式化对象以实现机器搜索与验证", en: "Converting proofs into formal objects to enable machine search and verification" },
      ],
      barrier: { zh: "从解题到提出有深度的新数学之间仍隔着审美与品味的鸿沟，而这恰恰是最难以形式化的部分。", en: "A gulf of aesthetics and taste—precisely the part hardest to formalize—still separates solving given problems from proposing deep new mathematics." },
      subQuestions: [
        { zh: "AI能否独立提出有价值的新猜想，而不仅是证明已给定的命题？", en: "Can AI independently propose valuable new conjectures, rather than only proving given statements?" },
        { zh: "机器可验证但人类难以理解的证明，该如何被数学界接纳？", en: "How should proofs that are machine-verifiable but hard for humans to understand be accepted by the mathematical community?" },
        { zh: "形式化证明的普及会如何改变数学界信任证明的社会机制？", en: "How would the spread of formal proof change mathematics' social mechanisms for trusting a proof?" },
      ],
    },
    stage: 2, members: 10, activity: 65,
    chart: { x: 482, y: 342, scale: 1.02 },
  },
  {
    id: 35, atlasN: 574, slug: "fundamental-limits-information-thermodynamics",
    title: { zh: "信息热力学的根本极限（新麦克斯韦妖）", en: "The Fundamental Limits of Information Thermodynamics (New Maxwell's Demons)" },
    qfocus: { zh: "擦除一比特信息，是否必然耗散热量——这条铁律能被绕过吗？", en: "Must erasing one bit of information necessarily dissipate heat—or can this iron law be circumvented?" },
    domain: "数理",
    cluster: { code: "C31", zh: "物理计算·热力学与涨落", en: "Physical computing · thermodynamics and fluctuations" },
    scores: [4, 4, 4, 1, 3, 2, 3, 4, 5],
    citation: { url: "https://www.nature.com/articles/s42254-021-00400-8", title: "60 years of Landauer's principle", venue: "nature.com", year: 2021 },
    brief: { zh: "在单电子单分子尺度逼近Landauer极限，把信息当作真实热力学实体来精确计量，并实现以信息换功的信息引擎，是西拉德妖思想实验的现代实证版。", en: "Approaching the Landauer limit at the single-electron, single-molecule scale, information is precisely accounted as a real thermodynamic entity, realizing 'information engines' that convert information into work—the modern empirical version of Szilard's demon thought experiment." },
    depth: {
      overview: { zh: "在单电子、单分子尺度逼近Landauer极限——擦除一比特信息至少耗散kT ln2热量，把信息作为真实的热力学实体来精确计量，并实现以信息换功的信息引擎。它横跨统计物理、信息论与精密实验，是麦克斯韦妖思想实验的现代实证版，要确立的是计算的绝对能耗下限。", en: "At the single-electron, single-molecule scale, this line of work approaches the Landauer limit—erasing one bit dissipates at least kT ln2 of heat—precisely accounting for information as a real thermodynamic entity and realizing information engines that convert information into work. Spanning statistical physics, information theory, and precision experiment, it is the modern empirical version of the Maxwell's-demon thought experiment, aiming to establish the absolute lower bound on computation's energy cost." },
      whyMatters: { zh: "对逼近物理极限的芯片产业，这是终极标尺；但信息引擎并不违反热力学第二定律，而是揭示测量与擦除的代价藏在何处，真正难的是把这一微观原理的能效优势兑现到宏观可逆计算架构，而不止是单比特演示。", en: "For a chip industry nearing physical limits, this is the ultimate yardstick; but an information engine does not violate the second law—it reveals where the cost of measurement and erasure hides—and the truly hard part is cashing this microscopic efficiency advantage into macroscopic reversible computing architectures, not just single-bit demonstrations." },
      ifAnswered: { zh: "若这一微观能效优势能在宏观可逆计算架构中兑现，将确立计算的绝对能耗下限，为逼近物理极限的芯片产业与信息引擎的实用化提供理论标尺。", en: "If this microscopic energy-efficiency advantage can be realized in macroscopic reversible computing architectures, it would establish the absolute energy floor of computation, giving the chip industry nearing physical limits—and practical information engines—a theoretical yardstick." },
      approaches: [
        { zh: "在单电子、单分子尺度精确计量擦除比特所耗散的热量", en: "Precisely measuring the heat dissipated by bit erasure at the single-electron, single-molecule scale" },
        { zh: "实现以信息换功的信息引擎，作为西拉德妖的现代实证", en: "Realizing information engines that convert information into work, as a modern empirical demonstration of Szilard's demon" },
        { zh: "探索把微观能效优势推广到宏观可逆计算架构的路径", en: "Exploring paths to extend the microscopic energy-efficiency advantage to macroscopic reversible computing architectures" },
      ],
      barrier: { zh: "真正难的是把这一微观原理的能效优势在宏观、可逆计算架构中兑现，而非停留在单比特演示。", en: "The truly hard part is realizing this microscopic principle's energy-efficiency advantage in macroscopic, reversible computing architectures, rather than staying at single-bit demonstrations." },
      subQuestions: [
        { zh: "Landauer极限在量子、非平衡或有限时间条件下是否仍严格成立？", en: "Does the Landauer limit still hold strictly under quantum, non-equilibrium, or finite-time conditions?" },
        { zh: "信息引擎的微观能效优势能否扩展到多比特、宏观计算规模？", en: "Can the information engine's microscopic energy-efficiency advantage scale to multi-bit, macroscopic computation?" },
        { zh: "如何把测量与擦除的隐藏代价明确量化进芯片设计的能耗预算？", en: "How can the hidden cost of measurement and erasure be explicitly quantified into a chip design's energy budget?" },
      ],
    },
    stage: 2, members: 10, activity: 60,
    chart: { x: 126, y: 393, scale: 1.02 },
  },
  {
    id: 36, atlasN: 595, slug: "cosmological-origin-arrow-time",
    title: { zh: "时间之矢的宇宙学起点", en: "The Cosmological Origin of the Arrow of Time" },
    qfocus: { zh: "宇宙为何恰好始于极低熵的过去，这个假设本身还能被解释吗？", en: "Why did the universe begin in a state of extremely low entropy—can the Past Hypothesis itself ever be explained?" },
    domain: "数理",
    cluster: { code: "C33", zh: "基础物理·实在的本质", en: "Fundamental physics · the nature of reality" },
    scores: [5, 4, 2, 2, 3, 3, 2, 3, 5],
    citation: { url: "https://arxiv.org/abs/2405.01380", title: "Arrows of time in bouncing cosmologies", venue: "arXiv / Springer", year: 2024 },
    brief: { zh: "把热力学、记忆与因果之矢统一回溯到大爆炸的极低熵初态（Penrose以近零外尔曲率刻画），如今借DESI、CMB精密观测重新可被部分约束。", en: "Tracing the thermodynamic, memory, and causal arrows back to the Big Bang's extremely low-entropy initial state (Penrose characterizes it via near-zero Weyl curvature), now partly constrainable anew through DESI and CMB precision observations." },
    depth: {
      overview: { zh: "时间为何只朝一个方向流？这条线索追问宇宙大爆炸为何处于极低熵的过去假设，把热力学之矢、记忆之矢与因果之矢统一回溯到一个尚无解释的初始条件。它是长年的硬核谜题，如今借DESI、CMB对早期宇宙的精密观测重新可被部分约束。", en: "Why does time flow in only one direction? This line asks why the Big Bang began in the low-entropy 'Past Hypothesis' state, tracing the thermodynamic, memory, and causal arrows back to a single, still-unexplained initial condition. A perennial hardcore puzzle, it can now be partly constrained anew via DESI and CMB precision observations of the early universe." },
      whyMatters: { zh: "这使低熵初态从纯哲学假设向可被观测检验的物理命题靠拢，但最深的难处是过去假设为何成立可能根本没有动力学解释——定律本身时间对称，低熵初态更像是需要外加的边界条件而非可推导的结果。", en: "This moves the low-entropy initial state from a purely philosophical assumption toward an observationally testable physical proposition, but the deepest difficulty is that why the Past Hypothesis holds may have no dynamical explanation at all—the laws themselves are time-symmetric, so the low-entropy initial state looks like an externally imposed boundary condition rather than a derivable result." },
      ifAnswered: { zh: "若能给出低熵初态的动力学解释，或用观测把它牢牢锁定，我们将首次理解时间之矢从何而来，可能需要诉诸更深的量子引力或多元宇宙图景来完成解释。", en: "A dynamical explanation of the low-entropy initial state, or observations that firmly pin it down, would for the first time reveal where the arrow of time comes from—likely requiring deeper quantum gravity or multiverse pictures to complete the explanation." },
      approaches: [
        { zh: "用DESI、CMB对早期宇宙的精密观测约束过去假设的低熵初态", en: "Using DESI and CMB precision observations of the early universe to constrain the low-entropy initial state of the Past Hypothesis" },
        { zh: "以近零外尔曲率刻画初始引力熵之低，量化过去假设", en: "Characterizing the low initial gravitational entropy via near-zero Weyl curvature to quantify the Past Hypothesis" },
        { zh: "探索需要诉诸量子引力或多元宇宙图景来解释低熵初态的可能路径", en: "Exploring paths that invoke quantum gravity or multiverse pictures to explain the low-entropy initial state" },
      ],
      barrier: { zh: "定律本身时间对称，低熵初态像是需要外加的边界条件而非可推导的结果，过去假设为何成立可能根本没有动力学解释。", en: "The laws themselves are time-symmetric, and the low-entropy initial state looks like an externally imposed boundary condition rather than a derivable result—why the Past Hypothesis holds may have no dynamical explanation at all." },
      subQuestions: [
        { zh: "DESI、CMB观测能把低熵初态的假设收紧到什么精度？", en: "To what precision can DESI and CMB observations constrain the low-entropy initial-state hypothesis?" },
        { zh: "外尔曲率近零的刻画是否是量化初始引力熵的唯一合理方式？", en: "Is characterizing near-zero Weyl curvature the only reasonable way to quantify the initial gravitational entropy?" },
        { zh: "量子引力或多元宇宙图景能否给出过去假设的动力学解释？", en: "Can quantum gravity or multiverse pictures provide a dynamical explanation for the Past Hypothesis?" },
      ],
    },
    stage: 1, members: 6, activity: 49,
    chart: { x: 252, y: 423, scale: 0.87 },
  },
  {
    id: 37, atlasN: 1002, slug: "gravitational-coupling-milligram-source",
    title: { zh: "毫克级源质量引力耦合与桌面牛顿常数", en: "Gravitational Coupling of Milligram Source Masses and Tabletop G" },
    qfocus: { zh: "一粒沙大小的质量，它的引力还能被精确测量出来吗？", en: "Can the gravitational pull of something the size of a grain of sand still be precisely measured?" },
    domain: "数理",
    cluster: { code: "C33", zh: "基础物理·实在的本质", en: "Fundamental physics · the nature of reality" },
    scores: [5, 4, 4, 1, 3, 2, 3, 4, 4],
    citation: { url: "https://www.nature.com/articles/s41586-021-03250-7", title: "Measurement of gravitational coupling between millimetre-sized masses", venue: "Nature", year: 2021 },
    brief: { zh: "Westphal等2021年用扭秤测得两颗90毫克金球间的引力耦合，2024年磁悬浮亚毫克测试质量进一步逼近小源小测构型，为引力量子化检验铺路。", en: "Westphal and colleagues measured the gravitational coupling between two 90-milligram gold spheres via torsion balance in 2021, and a 2024 magnetically levitated sub-milligram test mass pushed further toward a small-source, small-test configuration, paving the way toward tests of gravity's quantum nature." },
    depth: {
      overview: { zh: "引力是已知最弱的力。用扭秤或磁悬浮把引力源质量推到毫克乃至亚毫克量级，测量两个微小物体之间的牛顿引力耦合，这是在最小尺度上检验引力，既能改进G的测量，也是通往引力是否需要量子化实验的关键前哨。", en: "Gravity is the weakest known force. Using torsion balances or magnetic levitation to push gravitational source masses down to the milligram or even sub-milligram scale, researchers measure the Newtonian gravitational coupling between two tiny objects—testing gravity at the smallest scale yet, both refining measurements of G and serving as the key outpost toward experiments on whether gravity must be quantized." },
      whyMatters: { zh: "这条多年累积的曲线服务于G的精密测量，也是台面量子引力检验的前哨，有明确可证伪的力-距离基准；但最硬的难点是噪声墙：在毫克尺度，卡西米尔力、静电、地震与热噪声都远强于引力信号。", en: "This multi-year accumulating curve serves both precision measurement of G and as an outpost for tabletop quantum-gravity tests, with a clear, falsifiable force-distance benchmark; but the hardest difficulty is the noise wall—at milligram scales, Casimir forces, electrostatics, seismic noise, and thermal noise all dwarf the gravitational signal." },
      ifAnswered: { zh: "若能再缩三个量级并同时把所有非引力耦合压到引力之下，就能第一次在桌面实验中直接检验引力是否具有量子性质，为量子引力提供实验入口。", en: "If the mass scale can be pushed three more orders of magnitude while suppressing all non-gravitational couplings below the gravitational signal, tabletop experiments could for the first time directly test whether gravity has quantum properties, giving quantum gravity an experimental foothold." },
      approaches: [
        { zh: "用扭秤测量毫克级金球之间的牛顿引力耦合", en: "Using torsion balances to measure the Newtonian gravitational coupling between milligram-scale gold spheres" },
        { zh: "用磁悬浮技术操控亚毫克测试质量，逼近小源小测构型", en: "Using magnetic levitation to manipulate sub-milligram test masses, approaching a small-source, small-test configuration" },
        { zh: "系统压制卡西米尔力、静电与地震噪声等非引力耦合背景", en: "Systematically suppressing non-gravitational backgrounds like Casimir forces, electrostatics, and seismic noise" },
      ],
      barrier: { zh: "在毫克尺度，卡西米尔力、静电、地震与热噪声都远强于引力信号，要再缩三个量级到能做量子引力检验，目前没有现成方案能同时压低所有非引力耦合。", en: "At the milligram scale, Casimir forces, electrostatics, seismic noise, and thermal noise all far exceed the gravitational signal; there is currently no ready scheme to simultaneously suppress every non-gravitational coupling enough to push three more orders of magnitude toward quantum-gravity tests." },
      subQuestions: [
        { zh: "能否找到同时压制卡西米尔力、静电与热噪声的实验方案？", en: "Can an experimental scheme be found that simultaneously suppresses Casimir forces, electrostatics, and thermal noise?" },
        { zh: "磁悬浮亚毫克测试质量还能再向更小质量推进多远？", en: "How much further can magnetically levitated sub-milligram test masses be pushed toward smaller masses?" },
        { zh: "这条力-距离曲线积累到何种精度才能真正检验引力的量子性质？", en: "At what precision would this accumulated force-distance curve genuinely test gravity's quantum properties?" },
      ],
    },
    stage: 2, members: 9, activity: 62,
    chart: { x: 351, y: 404, scale: 1.02 },
  },
  {
    id: 38, atlasN: 1238, slug: "proximal-causal-inference-negative-control",
    title: { zh: "近端因果推断：阴性对照代理去混杂", en: "Proximal Causal Inference with Negative-Control Proxies" },
    qfocus: { zh: "未测的混杂因素，能否靠一对阴性对照变量被反推出来？", en: "Can a pair of negative-control variables triangulate an unmeasured confounder instead of assuming it away?" },
    domain: "数理",
    cluster: { code: "C51", zh: "因果科学·可信推断", en: "Causal Science · Trustworthy Inference" },
    scores: [4, 4, 4, 2, 3, 4, 4, 3, 5],
    citation: { url: "https://pubmed.ncbi.nlm.nih.gov/39323264/", title: "Regression-Based Proximal Causal Inference", venue: "American Journal of Epidemiology", year: 2024 },
    brief: { zh: "用一对阴性对照变量求解混杂桥函数，把观察性研究里未测的混杂因素从假设之外正面识别出来，2024至2026年核方法与神经网络让它从理论走向可用。", en: "Solving a confounding bridge function from a pair of negative-control variables positively identifies unmeasured confounding instead of assuming it away — kernel and neural solvers took the framework from theory to practice in 2024-2026." },
    depth: {
      overview: { zh: "观察性因果推断长期依赖一个几乎从不成立的假设——所有混杂因素都已被测量。近端因果推断放弃这个假设，改用一对阴性对照变量：一个不受处理影响的结局、一个不影响结局的暴露，作为未测混杂的代理探针，通过求解混杂桥函数恢复因果效应，是对观察性推断根基假设的一次正面重写。", en: "Observational causal inference has long leaned on the almost-never-true assumption that all confounders are measured. Proximal causal inference drops that assumption: a pair of negative-control variables — an outcome untouched by treatment, an exposure that doesn't affect the outcome — serve as proxy probes for hidden confounding, recovering causal effects by solving a bridge function. It rewrites the founding assumption of observational inference." },
      whyMatters: { zh: "桥函数是不适定积分方程的解，其存在性与完备性条件无法直接从数据验证；阴性对照选得不好，去混杂反而会引入新偏差，这是当前最硬的开放问题。", en: "The bridge function solves an ill-posed integral equation whose existence and completeness conditions cannot be verified directly from data; a poorly chosen negative control can introduce new bias instead of removing confounding — the hardest open problem today." },
      ifAnswered: { zh: "若诊断与加固不完美阴性对照的方法成熟，近端方法就能在试验外部对照、电子病历与政策评估里，给出比敏感性分析更进一步的点估计，而非仅仅画出偏差范围。", en: "Mature methods for diagnosing and shoring up imperfect negative controls would let the framework deliver point estimates in external-control trials, EHR studies, and policy evaluation — a constructive fix that goes beyond merely bounding the bias, as sensitivity analysis does." },
      approaches: [
        { zh: "两阶段回归实现，降低流行病学家的使用门槛", en: "Two-stage regression implementations that lower the barrier for epidemiologists to adopt the method" },
        { zh: "核方法与神经网络求解混杂桥函数的不适定积分方程", en: "Kernel methods and neural networks solving the ill-posed integral equation for the confounding bridge function" },
        { zh: "将框架用于真实药物试验的外部对照去偏，如HIV预防试验", en: "Applying the framework to debias external controls in real drug trials, such as HIV-prevention studies" },
      ],
      barrier: { zh: "桥函数存在性与完备性条件无法从数据直接验证，阴性对照选择不当会让去混杂本身变成新的偏差来源。", en: "The bridge function's existence and completeness conditions cannot be verified directly from data, and a poorly chosen negative control can itself become a new source of bias." },
      subQuestions: [
        { zh: "如何在没有真值的情况下，诊断一对阴性对照是否真的满足桥函数存在所需的条件？", en: "How can we diagnose, absent ground truth, whether a pair of negative controls actually satisfies the conditions required for the bridge function to exist?" },
        { zh: "当候选阴性对照本身部分受处理影响时，近端方法给出的点估计还能否被信任，而不是新的隐性偏差？", en: "When a candidate negative control is itself partially affected by treatment, can the resulting point estimate still be trusted rather than hiding a new bias?" },
        { zh: "神经网络求解桥函数的黑箱解，如何验证它逼近的是真实的因果桥函数而非仅拟合了观测数据？", en: "How can we verify that a neural network's black-box solution to the bridge function approximates the true causal bridge rather than merely overfitting the observed data?" },
      ],
    },
    stage: 2, members: 10, activity: 49,
    chart: { x: 451, y: 414, scale: 1 },
  },
  {
    id: 39, atlasN: 1490, slug: "category-theoretic-compositional-scientific-modeling",
    title: { zh: "范畴论驱动的可组合科学建模", en: "Category-Theoretic Compositional Scientific Modeling" },
    qfocus: { zh: "科学模型能否像乐高一样按边界拼接、跨学科复用？", en: "Can scientific models snap together like Lego blocks across disciplines, composed and reused at their boundaries?" },
    domain: "数理",
    cluster: { code: "C23", zh: "AI数学·形式科学", en: "AI mathematics · formal science" },
    scores: [4, 5, 5, 4, 4, 5, 3, 4, 5],
    citation: { url: "https://doi.org/10.1098/rsta.2021.0309", title: "An algebraic framework for structured epidemic modelling", venue: "Philosophical Transactions of the Royal Society A", year: 2022 },
    brief: { zh: "范畴论用双理论与结构化余跨把模型的语法和语义分离，让流行病学、生化网络等示意图变成严格可计算、可组合的对象。", en: "Category theory's double theories and structured cospans separate a model's syntax from its semantics, turning epidemiology and biochemical-network diagrams into rigorous, composable, directly computable objects." },
    depth: {
      overview: { zh: "疫情来袭时，科学家往往要为一个新的隔离或疫苗情景重写整套模型代码。应用范畴论给出的答案是把怎么拼和拼的是什么彻底分开：用双理论与结构化余跨，让流行病学房室模型、生化调控网络这类科学家手绘的示意图，变成数学上严格且可直接计算的对象，像积木一样按边界组合、分层与复用。", en: "When an epidemic hits, scientists often rewrite an entire model's code for one new quarantine or vaccine scenario. Applied category theory answers by cleanly separating how parts compose from what they denote: double theories and structured cospans turn scientists' hand-drawn diagrams — epidemiological compartment models, biochemical regulatory networks — into rigorous, directly computable objects that snap together, stratify, and get reused like building blocks." },
      whyMatters: { zh: "最硬的张力是抽象税：范畴论门槛极高，能否真正被非数学背景的领域科学家采用、而非停留在小圈子的优雅玩具，决定了它的成败；且缺少统一基准，让更快更可靠难以被硬性证明。", en: "The hardest tension is the 'abstraction tax': category theory's barrier to entry is steep, and whether domain scientists without a math background actually adopt it — rather than it staying an elegant toy for a small circle — decides its fate; the absence of a unified benchmark also makes 'faster and more reliable' hard to prove rigorously." },
      ifAnswered: { zh: "随CatColab、AlgebraicJulia等可协作建模工具成熟，模型结构本身会变成可算资源，让分层、标定与灵敏度分析自动化，成为多学科快速搭建与验证模型的通用底座。", en: "As collaborative tools like CatColab and AlgebraicJulia mature, model structure itself becomes a computable resource, automating stratification, calibration, and sensitivity analysis — a general substrate for rapidly assembling and verifying models across disciplines." },
      approaches: [
        { zh: "用结构化余跨把流行病学房室模型形式化为可组合对象", en: "Formalizing epidemiological compartment models as composable objects via structured cospans" },
        { zh: "用双理论刻画生化调控网络与存量-流量图", en: "Characterizing biochemical regulatory networks and stock-flow diagrams with double theories" },
        { zh: "CatColab把这套代数框架做成可协作的网页建模器", en: "CatColab turning the algebraic framework into a collaborative web-based modeling tool" },
      ],
      barrier: { zh: "范畴论的抽象门槛极高，能否真正被非数学背景的领域科学家采用，而不只是数学小圈子里的优雅玩具，是它成败的关键。", en: "Category theory's abstraction barrier is steep, and whether domain scientists without a mathematical background can actually adopt it — rather than it remaining an elegant toy confined to a small circle — is what decides its fate." },
      subQuestions: [
        { zh: "范畴论把模型结构变成可算对象后，一个由算法自动组合出的模型，其科学意义还需要人类去理解吗？", en: "Once category theory turns model structure into a computable object, does a model automatically assembled by an algorithm still need a human to understand its scientific meaning?" },
        { zh: "选择用哪种双理论、哪种组合方式来刻画一个现象，这种建模品味能否被形式化，还是终究依赖科学家的直觉？", en: "Can the modeling taste involved in choosing which double theory or composition scheme fits a phenomenon be formalized, or does it ultimately rest on scientist intuition?" },
        { zh: "缺少统一benchmark的情况下，如何证明可组合建模确实比手写代码更快更可靠，而不只是数学上更优雅？", en: "Without a unified benchmark, how can we prove compositional modeling is actually faster and more reliable than hand-written code, rather than merely more elegant mathematically?" },
      ],
    },
    stage: 2, members: 9, activity: 61,
    chart: { x: 168, y: 502, scale: 1.02 },
  },

  // ── 物质 Matter ─────────────────────────────────────────────────────────
  {
    id: 7, atlasN: 1408, slug: "living-wires",
    title: { zh: "活体导线", en: "Living Wires" },
    qfocus: { zh: "电缆细菌的蛋白纤维能否催生可生物降解、自供能的电子器件？", en: "Can microbial protein fibers spawn biodegradable, self-powering electronics?" },
    domain: "物质",
    cluster: { code: "C12", zh: "生物电子·生物能源", en: "Bioelectronics · bioenergy" },
    scores: [5, 5, 4, 3, 4, 4, 3, 4, 5],
    citation: { url: "https://doi.org/10.1038/nrmicro.2016.93", title: "Extracellular electron transfer mechanisms", venue: "Nature Reviews Microbiology", year: 2016 },
    brief: { zh: "Geobacter 与电缆细菌沿厘米级蛋白纤维导电，导电率超 20 S/cm 媲美掺杂聚合物。", en: "Geobacter and cable bacteria conduct over cm-scale protein fibers at >20 S/cm, rivaling doped polymers." },
    depth: {
      overview: { zh: "电微生物学发现电缆细菌与Geobacter等微生物能沿厘米级蛋白纤维长距离传导电子，导电率可超20 S/cm，媲美掺杂导电聚合物。把这些\"活体导线\"接入电路，正在催生可生物降解、自供能、能在潮湿环境自愈的新一代电子器件。", en: "Electromicrobiology has found that cable bacteria and microbes like Geobacter conduct electrons over centimeter-scale protein fibers with conductivities exceeding 20 S/cm, rivaling doped conductive polymers. Wiring these \"living wires\" into circuits is spawning a new generation of biodegradable, self-powering electronics that can self-heal in humid environments." },
      whyMatters: { zh: "最硬的难点在从\"现象\"到\"器件\"的跨越：实验室测得的高导电率如何在稳定、可制造、可规模化的封装中重现，活体材料的寿命、可控性与量产一致性，仍横亘在生物学与半导体工艺之间。", en: "The hardest difficulty is the leap from phenomenon to device: how the high conductivity measured in the lab can be reproduced in stable, manufacturable, scalable packaging — the lifespan, controllability, and mass-production consistency of living materials remain a gulf between biology and semiconductor process." },
      ifAnswered: { zh: "若微生物导电蛋白能像元件一样被\"种\"进传感器与生物电子界面，可编程的活体材料就有望替代稀有金属与不可降解基板。", en: "If microbial conductive proteins can be \"grown\" into sensors and bioelectronic interfaces like components, programmable living materials could replace rare metals and non-degradable substrates." },
      approaches: [
        { zh: "电缆细菌的镍—硫配位蛋白核心沿周质鞘实现厘米级电子传导（Nature Communications 2021）", en: "Cable bacteria's nickel-sulfur coordination protein core conducting electrons over centimeter scales along a periplasmic sheath (Nature Communications, 2021)" },
        { zh: "把Geobacter纳米线做成能从湿度发电的薄膜电路", en: "Turning Geobacter nanowires into thin-film circuits that generate power from ambient humidity" },
        { zh: "用微生物导电蛋白替代稀有金属与不可降解基板，\"种\"进传感器与生物电子界面", en: "Growing microbial conductive proteins into sensors and bioelectronic interfaces as a replacement for rare metals and non-degradable substrates" },
      ],
      barrier: { zh: "实验室里测得的高导电率如何在稳定、可制造、可规模化的封装中重现，活体材料的寿命与量产一致性仍是横亘的鸿沟。", en: "How lab-measured high conductivity can be reproduced in stable, manufacturable, scalable packaging remains an open gulf, with living-material lifespan and mass-production consistency still unresolved." },
      subQuestions: [
        { zh: "活体导线与人造电路能否实现无损、长期、高带宽的直接耦合？", en: "Can living wires and artificial circuits achieve lossless, durable, high-bandwidth direct coupling?" },
        { zh: "微生物导电蛋白的电子传递效率背后是否藏着可被人工复制的设计法则？", en: "Does the electron-transfer efficiency of microbial conductive proteins hide a design law that could be artificially replicated?" },
        { zh: "活体导电材料能否被工程化到稳定、可控、可规模量产的一致性？", en: "Can living conductive materials be engineered to a stable, controllable, mass-producible consistency?" },
        { zh: "微生物纳米线电路能否发展成自给自足、自我修复的活体电源？", en: "Could microbial nanowire circuits develop into self-sustaining, self-repairing living power sources?" },
      ],
    },
    stage: 3, members: 14, activity: 88,
    chart: { x: 1080, y: 260, scale: 1.1 },
  },
  {
    id: 8, atlasN: 1491, slug: "self-learning-matter",
    title: { zh: "会自学习的物理网络", en: "Self-Learning Physical Networks" },
    qfocus: { zh: "训练能否搬进物质本身——无需反向传播就能学会？", en: "Can training move into matter itself — learning without backpropagation?" },
    domain: "物质",
    cluster: { code: "C44", zh: "神经形态·物理智能硬件", en: "Neuromorphic · physical-AI hardware" },
    scores: [4, 5, 4, 3, 3, 5, 4, 4, 4],
    citation: { url: "https://www.nature.com/articles/s41586-025-09384-2", title: "Training of physical neural networks", venue: "Nature", year: 2025 },
    brief: { zh: "耦合学习让自调电阻网络靠局部物理规则自行调参，把训练从算法搬进物质。", en: "Coupled learning lets a resistive network tune itself via local physical rules — training relocated into matter." },
    depth: {
      overview: { zh: "会自学习的物理网络用\"对比局域学习\"让一张由自调电阻（晶体管）组成的模拟网络，仅靠每条边的局部物理规则自行调参，无需中央处理器或反向传播即可学会XOR、非线性回归等任务。它把机器学习的\"训练\"从算法搬进物质本身。", en: "Self-learning physical networks use \"contrastive local learning\" to let an analog network of self-adjusting resistive elements (transistors) train itself purely through local physical rules at each edge, learning tasks like XOR and nonlinear regression with no central processor and no backpropagation. It relocates machine-learning \"training\" from an algorithm into matter itself." },
      whyMatters: { zh: "最硬的难点是可扩展性与制造——晶体管级非线性刚在2024年证明可行，但从桌面演示走到能与数字AI竞争的规模、良率与可编程性，仍隔着一整条工艺鸿沟。", en: "The hardest difficulty is scalability and manufacturing — transistor-level nonlinearity was only proven feasible in 2024, and going from a tabletop demo to a scale, yield, and programmability that can compete with digital AI still requires crossing a whole process gulf." },
      ifAnswered: { zh: "这类去中心、抗损坏、皮焦耳级能耗的\"学习超材料\"有望长成边缘传感、机器人控制与可编程物质的新硬件谱系。", en: "These decentralized, damage-robust, picojoule-scale \"learning metamaterials\" could grow into a new hardware lineage for edge sensing, robotic control, and programmable matter." },
      approaches: [
        { zh: "对比局域学习网络（CLLN）：晶体管仅依据局部电压自调，无需中央处理器（Dillavou等，PNAS 2024）", en: "Contrastive local learning networks (CLLN), where transistors self-adjust based only on local voltage with no central processor (Dillavou et al., PNAS 2024)" },
        { zh: "嫁接非平衡统计物理的最小功耗原理与能量基学习（平衡传播、对比Hebbian）", en: "Grafting the minimum-dissipation principle of non-equilibrium statistical physics onto energy-based learning (equilibrium propagation, contrastive Hebbian learning)" },
        { zh: "训练以秒计、推理以微秒计、每个晶体管仅耗皮焦耳，且对物理损伤鲁棒", en: "Training on the order of seconds, inference in microseconds, each transistor costing only picojoules, and robust to physical damage" },
      ],
      barrier: { zh: "晶体管级非线性刚在2024年证明可行，从桌面演示走到能与数字AI竞争的规模、良率与可编程性，仍隔着一整条工艺鸿沟。", en: "Transistor-level nonlinearity was only proven feasible in 2024, and crossing from a tabletop demo to a scale, yield, and programmability competitive with digital AI remains an entire process gulf." },
      subQuestions: [
        { zh: "原位训练能否扩展到深层、多物理过程级联的物理网络，而不依赖滞后的数字孪生？", en: "Can in-situ training scale to deep, multi-physics cascaded physical networks without relying on a lagging digital twin?" },
        { zh: "器件的随机涨落该被当噪声压制，还是当作可收割的计算资源？", en: "Should a device's random fluctuations be suppressed as noise, or harvested as a computational resource?" },
        { zh: "能否建立一套从任务反推基底动力学的设计原理，取代试错式选材？", en: "Can a design principle be built that infers substrate dynamics backward from the task, replacing trial-and-error material selection?" },
        { zh: "皮焦耳级学习网络能否规模化到与数字AI竞争的良率与可编程性？", en: "Can picojoule-scale learning networks scale to a yield and programmability that competes with digital AI?" },
      ],
    },
    stage: 2, members: 9, activity: 66,
    chart: { x: 1215, y: 325, scale: 0.85 },
  },
  {
    id: 9, atlasN: 953, slug: "rock-battery",
    title: { zh: "岩层压力储能", en: "Geomechanical Pressure Storage" },
    qfocus: { zh: "一口地热井能否改造成可充放的「地下机械电池」？", en: "Can a geothermal well become a charge/dischargeable underground mechanical battery?" },
    domain: "物质",
    cluster: { code: "C17", zh: "新能源范式", en: "New energy paradigms" },
    scores: [4, 4, 3, 2, 4, 3, 4, 4, 5],
    citation: { url: "https://doi.org/10.1103/PhysRevLett.129.075001", title: "Lawson criterion for ignition exceeded", venue: "Physical Review Letters", year: 2022 },
    brief: { zh: "借油气 huff-and-puff 把水高压注入干热岩裂缝，靠岩石弹性回弹发电——地热重定义为储能+发电。", en: "Oil-and-gas huff-and-puff into hot-dry-rock fractures stores heat+pressure; geothermal reframed as storage+power." },
    depth: {
      overview: { zh: "地质力学压力储能借用油气行业的\"焖井\"（huff-and-puff）工艺，把水高压注入深部干热岩裂缝，靠岩石弹性回弹把高压热水顶回地面发电——既存热又存压，把一口地热井改造成可反复充放的\"地下机械电池\"，把地热从基载发电重定义为发电与长时储能两用资产。", en: "Geomechanical pressure-energy storage borrows the oil-and-gas \"huff-and-puff\" cycle: water is injected at high pressure into deep hot-dry-rock fractures, and the rock's elastic rebound pushes hot pressurized water back to the surface to drive a turbine — storing both heat and pressure, turning a single geothermal well into a rechargeable underground mechanical battery, and reframing geothermal from baseload generation into a dual storage-plus-power asset." },
      whyMatters: { zh: "最硬的张力在裂缝的\"疲劳\"——反复高压充放下，岩石裂缝网络是否会渐渐闭合或失稳、把宣称的能量增益吃掉，目前只有单井短周期数据，缺多年闭环验证。", en: "The hardest tension lies in fracture \"fatigue\" — whether the rock fracture network gradually closes or destabilizes under repeated high-pressure cycling, eating into the claimed energy gain; so far only single-well, short-cycle data exists, lacking multi-year closed-loop validation." },
      ifAnswered: { zh: "若能验证多年循环下裂缝不退化、往返效率稳定在70%以上，这类地下机械电池就能与AI数据中心6–10小时的调峰需求对接，成为可调度的电网级储能资产。", en: "If fractures can be shown not to degrade over many years of cycling and round-trip efficiency holds above 70%, these underground mechanical batteries could match the 6-10 hour peaking needs of AI data centers, becoming a dispatchable grid-scale storage asset." },
      approaches: [
        { zh: "借用油气行业的\"焖井\"循环，注水撑开干热岩裂缝并焖井吸热", en: "Borrowing the oil-and-gas \"huff-and-puff\" cycle, injecting water to prop open hot-dry-rock fractures and soaking to absorb heat" },
        { zh: "靠岩石自身弹性把高压热水顶回地面发电，无需水泵", en: "Letting the rock's own elasticity push hot pressurized water back to the surface to generate power, with no pump required" },
        { zh: "EarthStore储能系统已达TRL-8，德州3MW设施并入ERCOT电网并与Meta签约供电（2025）", en: "The EarthStore storage system has reached TRL-8, with a 3MW Texas facility interconnected to the ERCOT grid and contracted to supply Meta (2025)" },
      ],
      barrier: { zh: "反复高压充放下岩石裂缝网络是否会渐渐闭合或失稳、吃掉宣称的能量增益，目前只有单井短周期数据，缺多年闭环验证。", en: "Whether the rock fracture network gradually closes or destabilizes under repeated high-pressure cycling, eating into the claimed energy gain, is unresolved — so far there is only single-well, short-cycle data, lacking multi-year closed-loop validation." },
      subQuestions: [
        { zh: "裂缝网络在数十年多轮充放循环后是否会退化或失稳？", en: "Will the fracture network degrade or destabilize after decades of repeated charge-discharge cycling?" },
        { zh: "往返效率能否稳定维持在70%以上并可预测？", en: "Can round-trip efficiency be stably held above 70% and made predictable?" },
        { zh: "这类地下机械电池能否匹配AI数据中心6–10小时的调峰节奏？", en: "Can this class of underground mechanical battery match the 6-10 hour peaking rhythm demanded by AI data centers?" },
        { zh: "单井短周期的储能增益能否外推到多井、长期商业部署？", en: "Can the energy-storage gains seen in short-cycle single-well tests be extrapolated to multi-well, long-term commercial deployment?" },
      ],
    },
    stage: 2, members: 9, activity: 66,
    chart: { x: 1000, y: 360, scale: 0.95 },
  },
  {
    id: 10, atlasN: 764, slug: "analog-solver",
    title: { zh: "高精度模拟矩阵求解器", en: "High-Precision Analog Matrix Solver" },
    qfocus: { zh: "模拟计算能否捅破「精度天花板」做到 FP32 等效？", en: "Can analog computing break its precision ceiling to reach FP32-equivalent?" },
    domain: "物质",
    cluster: { code: "C44", zh: "神经形态·物理智能硬件", en: "Neuromorphic · physical-AI hardware" },
    scores: [5, 4, 5, 1, 3, 2, 4, 3, 4],
    citation: { url: "https://www.nature.com/articles/s41586-025-09384-2", title: "Training of physical neural networks", venue: "Nature", year: 2025 },
    brief: { zh: "阻变交叉阵列把 Ax=b 做成物理过程，迭代细化提升到 FP32 等效精度。", en: "Resistive crossbars solve Ax=b as a physical process; iterative refinement lifts to FP32-equivalent." },
    depth: {
      overview: { zh: "该工作把求解线性方程组（Ax=b、矩阵求逆）直接做成一段物理过程：电导编码矩阵系数，欧姆定律与基尔霍夫定律一步完成乘加运算，再用「模拟低精度求逆+模拟高精度乘加」的迭代细化算法，把天生低精度的模拟结果逐步提升到24-bit定点（约等于FP32）精度。这是模拟计算第一次在逆问题上捅破长期存在的精度天花板。", en: "This work turns solving linear equations (Ax=b, matrix inversion) into a direct physical process: conductances encode the matrix coefficients, and Ohm's and Kirchhoff's laws perform multiply-accumulate in a single step, while an iterative refinement algorithm — pairing low-precision analog inversion with high-precision analog multiply-accumulate — lifts the inherently low-precision analog result up to 24-bit fixed-point (roughly FP32-equivalent) accuracy. It is the first time analog computing has broken through the long-standing precision ceiling on inverse problems." },
      whyMatters: { zh: "模拟求逆天生低精度，全靠迭代混合算法补回精度，但迭代次数、分块规模与器件漂移三者能否在远超16×16的真实科学计算矩阵上同时收敛，仍是未解的尺度难题，决定这条路线是演示还是可用算力。", en: "Analog inversion is inherently low-precision, and the iterative hybrid algorithm is the only thing recovering accuracy — but whether iteration count, block size, and device drift can co-converge on real scientific-computing matrices far larger than the 16×16 demo remains an unresolved scaling question that decides whether this stays a demo or becomes usable compute." },
      ifAnswered: { zh: "若精度-规模曲线能持续外推到更大矩阵，模拟求解器有望成为科学计算、6G信号检测与二阶神经网络训练里独立于数字处理器的一条算力路线，兑现约1000倍吞吐与100倍能效的优势。", en: "If the precision-versus-scale curve keeps extending to larger matrices, analog solvers could become a compute path independent of digital processors for scientific computing, 6G signal detection, and second-order neural-network training — cashing in the benchmarked roughly 1000x throughput and 100x energy-efficiency advantage." },
      approaches: [
        { zh: "用电导阵列编码矩阵系数，靠欧姆定律与基尔霍夫定律一拍完成乘加运算", en: "Encoding matrix coefficients as conductances in a crossbar array, using Ohm's and Kirchhoff's laws to perform multiply-accumulate in a single physical step" },
        { zh: "「模拟低精度求逆+模拟高精度乘加」的迭代细化算法，逐步逼近FP32等效精度", en: "An iterative refinement algorithm pairing low-precision analog inversion with high-precision analog multiply-accumulate to converge toward FP32-equivalent accuracy" },
        { zh: "分块矩阵法把大矩阵拆解为可在3-bit RRAM芯片上处理的子块", en: "A block-matrix method that decomposes large matrices into sub-blocks tractable on 3-bit RRAM chips" },
      ],
      barrier: { zh: "16×16的演示矩阵距真实科学计算问题还有数量级差距，迭代次数、分块规模与器件漂移能否在更大矩阵上同时收敛仍是未解的尺度难题。", en: "The 16×16 demonstration matrix is orders of magnitude smaller than real scientific-computing problems, and whether iteration count, block size, and device drift can co-converge at larger scale remains unresolved." },
      subQuestions: [
        { zh: "迭代细化算法能否在远大于16×16的矩阵上，同时保持收敛速度与器件漂移容忍度？", en: "Can the iterative-refinement algorithm hold both convergence speed and tolerance to device drift on matrices far larger than 16×16?" },
        { zh: "除MIMO信号检测外，这条路线能否在科学计算与二阶神经网络训练等更苛刻场景复现精度优势？", en: "Beyond MIMO signal detection, can this route reproduce its precision advantage in more demanding settings like scientific computing and second-order neural-network training?" },
        { zh: "3-bit RRAM器件的长期漂移是否会侵蚀已达成的24-bit等效精度，需要多频次的再校准？", en: "Will long-term drift in the 3-bit RRAM devices erode the achieved 24-bit-equivalent precision, and how often would recalibration be needed?" },
      ],
    },
    stage: 1, members: 6, activity: 52,
    chart: { x: 1150, y: 435, scale: 0.8 },
  },
  {
    id: 11, atlasN: 194, slug: "artificial-photosynthesis",
    title: { zh: "仿光合人工光合系统", en: "Bio-Inspired Artificial Photosynthesis" },
    qfocus: { zh: "能否模仿光合作用直接把光与 CO₂ 变燃料？", en: "Can we mimic photosynthesis to turn light and CO₂ directly into fuel?" },
    domain: "物质",
    cluster: { code: "C12", zh: "生物电子·生物能源", en: "Bioelectronics · bioenergy" },
    scores: [4, 3, 4, 2, 3, 3, 3, 3, 4],
    citation: { url: "https://doi.org/10.1038/nrmicro.2016.93", title: "Extracellular electron transfer mechanisms", venue: "Nature Reviews Microbiology", year: 2016 },
    brief: { zh: "模仿光合作用直接把光与 CO₂ 变燃料，5-10 年内走向中试。", en: "Mimic photosynthesis to turn light and CO₂ into fuel; pilot scale in 5-10 years." },
    depth: {
      overview: { zh: "该系统用半导体光催化剂或光电极模仿自然光合作用，绕过生物的低效，直接用阳光把水和CO₂转化为氢气或碳氢燃料，把太阳能存进可储运的化学燃料——是化学、能源与材料科学的交叉，瞄准可再生能源最大的痛点：存储。", en: "The system uses semiconductor photocatalysts or photoelectrodes to mimic natural photosynthesis, bypassing biology's inefficiency to convert water and CO2 directly into hydrogen or hydrocarbon fuels with sunlight, storing solar energy in transportable chemical fuel — a crossover of chemistry, energy, and materials science aimed at renewable energy's biggest pain point: storage." },
      whyMatters: { zh: "多年瓶颈卡在催化剂：要么效率高但依赖贵金属，要么便宜却易腐蚀失活，长期稳定性与成本一直卡在中试门口，催化剂寿命是它能否在5-10年走出实验室的决定性变量。", en: "The years-long bottleneck is the catalyst: either high efficiency relying on precious metals, or cheap but prone to corrosion and deactivation — long-term stability and cost remain stuck at the pilot-scale threshold, and catalyst lifetime is the decisive variable for whether this leaves the lab within 5-10 years." },
      ifAnswered: { zh: "若催化剂寿命与成本问题解决，该系统有望在5-10年内走向中试，为可再生能源提供一条把阳光直接存进液体或气体燃料的存储路径。", en: "If catalyst lifetime and cost are solved, the system could move to pilot scale within 5-10 years, giving renewable energy a storage pathway that stores sunlight directly as liquid or gas fuel." },
      approaches: [
        { zh: "半导体光催化剂或光电极直接吸收太阳光驱动水与CO₂的还原反应", en: "Semiconductor photocatalysts or photoelectrodes that directly absorb sunlight to drive the reduction of water and CO2" },
        { zh: "用人工催化剂做「升级版光合」，绕开生物光合作用效率低的限制", en: "Using artificial catalysts for an 'upgraded photosynthesis' that bypasses the efficiency limits of biological photosynthesis" },
        { zh: "产物直接是可储运的氢气或碳氢燃料，而非需要额外转化的中间产物", en: "Producing directly storable, transportable hydrogen or hydrocarbon fuel rather than an intermediate requiring further conversion" },
      ],
      barrier: { zh: "催化剂要么效率高但依赖贵金属、要么便宜却易腐蚀失活，长期稳定性与成本始终卡在中试门口。", en: "Catalysts are either efficient but reliant on precious metals, or cheap but prone to corrosion and deactivation — long-term stability and cost remain stuck at the pilot-scale threshold." },
      subQuestions: [
        { zh: "能否用不依赖贵金属的催化剂同时兼顾高效率与长期抗腐蚀稳定性？", en: "Can catalysts that avoid precious metals achieve both high efficiency and long-term corrosion resistance at once?" },
        { zh: "自然光合作用的量子效率远高于人工系统，人工催化能否借鉴其能量转移机制缩小这一差距？", en: "Natural photosynthesis achieves far higher quantum efficiency than artificial systems — can artificial catalysis borrow its energy-transfer mechanisms to close that gap?" },
        { zh: "从实验室规模走向中试，如何在保持转化效率的同时把系统成本压到可与现有能源路线竞争？", en: "Scaling from lab to pilot, how can conversion efficiency be maintained while driving system cost down to compete with existing energy routes?" },
      ],
    },
    stage: 2, members: 6, activity: 47,
    dormant: true,
    chart: { x: 1290, y: 245, scale: 0.72 },
  },
  {
    id: 12, atlasN: 123, slug: "info-chemistry",
    title: { zh: "信息化学", en: "Information Chemistry" },
    qfocus: { zh: "能否像写代码一样用分子搭出会运动、存储、计算的机器？", en: "Can we code molecules into machines that move, store, and compute?" },
    domain: "物质",
    cluster: { code: "C08", zh: "分子机器·DNA信息技术", en: "Molecular machines · DNA info tech" },
    scores: [4, 4, 3, 1, 3, 3, 1, 2, 5],
    citation: { url: "https://doi.org/10.1126/science.aaj2038", title: "DNA Fountain enables robust storage", venue: "Science", year: 2017 },
    brief: { zh: "把化学反应当信息载体来设计，催生「化学编程」新范式。", en: "Design chemical reactions as information carriers; spawn a chemical-programming paradigm." },
    depth: {
      overview: { zh: "把化学反应本身当作可设计、可编程的信息载体与信号系统，用化学浓度与反应时序编码和处理信息，试图在分子层面实现「计算」与「通信」，而非用电子电路模拟化学——是化学、信息学与仿生学的一处极小众交叉。", en: "This treats chemical reactions themselves as designable, programmable information carriers and signaling systems, encoding and processing information via chemical concentration and reaction timing, attempting 'computation' and 'communication' at the molecular level rather than simulating chemistry with electronic circuits — a very niche crossover of chemistry, informatics, and biomimetics." },
      whyMatters: { zh: "最大的不确定性在于「化学编程」能否找到电子计算做不到或做不好的独占场景，例如体内原位决策或分子通信，否则它很可能停留在优雅的概念证明，而非真正必要的新范式。", en: "The biggest uncertainty is whether 'chemical programming' can find an exclusive niche electronic computing cannot do well, such as in-body in-situ decisions or molecular communication; otherwise it will likely remain an elegant proof of concept rather than a truly necessary new paradigm." },
      ifAnswered: { zh: "若能找到不可替代的独占场景，它有望催生「化学编程」这一新范式，把计算与通信下沉到分子浓度与反应时序本身。", en: "If it finds an irreplaceable niche, it could spawn a 'chemical programming' paradigm that pushes computation and communication down into molecular concentration and reaction timing themselves." },
      approaches: [
        { zh: "用化学浓度作为信息载体，把不同输入组合编码为可区分的化学状态", en: "Using chemical concentration as an information carrier, encoding different input combinations as distinguishable chemical states" },
        { zh: "用反应时序而非电压或频率来传递和处理信号", en: "Using reaction timing rather than voltage or frequency to convey and process signals" },
        { zh: "在分子层面直接实现「计算」与「通信」，绕开先转成电子信号再模拟化学的中间步骤", en: "Realizing 'computation' and 'communication' directly at the molecular level, skipping the intermediate step of converting to electronic signals to simulate chemistry" },
      ],
      barrier: { zh: "相比成熟的电子计算，化学信息处理若找不到自己的独占利基场景，就很可能只是一个优雅但不必要的概念证明。", en: "Compared with mature electronic computing, if chemical information processing cannot find its own exclusive niche, it risks remaining an elegant but unnecessary proof of concept." },
      subQuestions: [
        { zh: "化学浓度编码的信息能否支持类似「随机访问」的读取，而不只是一次性、批量的反应输出？", en: "Can information encoded in chemical concentration support something like random access, rather than only one-shot, batch reaction output?" },
        { zh: "单个化学信号反应能否被组织成协同工作的「化学电路」，完成比单一反应更复杂的运算？", en: "Can individual chemical signaling reactions be organized into cooperating 'chemical circuits' capable of computation beyond a single reaction?" },
        { zh: "体内原位决策或分子通信是否真的是电子计算难以替代的场景，还是仍可能被更成熟的电子微型器件取代？", en: "Are in-body in-situ decisions or molecular communication genuinely scenarios electronics cannot replace, or could they still be superseded by more mature miniaturized electronic devices?" },
      ],
    },
    stage: 0, members: 2, activity: 12,
    chart: { x: 1045, y: 455, scale: 0.7 },
  },
  {
    id: 13, atlasN: 132, slug: "chemical-vision",
    title: { zh: "分子模式识别", en: "Molecular Pattern Recognition" },
    qfocus: { zh: "能否用化学体系直接做模式识别与分类？", en: "Can chemical systems do pattern recognition and classification directly?" },
    domain: "物质",
    cluster: { code: "C08", zh: "分子机器·DNA信息技术", en: "Molecular machines · DNA info tech" },
    scores: [4, 4, 3, 1, 4, 3, 1, 2, 5],
    citation: { url: "https://doi.org/10.1126/science.aaj2038", title: "DNA Fountain enables robust storage", venue: "Science", year: 2017 },
    brief: { zh: "用化学体系直接做模式识别与分类，概念颠覆但属早期。", en: "Pattern recognition and classification directly with chemical systems; early but disruptive." },
    depth: {
      overview: { zh: "用化学反应体系本身直接完成模式识别与分类任务——让一组反应对不同输入组合给出可区分的输出，相当于「化学版」的感知与分类，探索在分子层面实现类神经网络的计算功能，是化学、信息学与人工智能的交叉。", en: "This uses a chemical reaction system itself to directly perform pattern recognition and classification — having a set of reactions produce distinguishable outputs for different input combinations, a 'chemical' version of perception and classification that explores neural-network-like computation at the molecular level, crossing chemistry, informatics, and AI." },
      whyMatters: { zh: "它面对的根本质疑与信息化学一致：相比成熟的电子AI，化学模式识别要找到自己不可替代的利基（如体内原位决策）才有意义，否则只是概念展示，且目前仍处于极早期阶段。", en: "It faces the same fundamental doubt as information chemistry: compared with mature electronic AI, chemical pattern recognition only matters if it finds its own irreplaceable niche, such as in-body in-situ decision-making, otherwise it remains a concept demonstration — and it is still very early-stage." },
      ifAnswered: { zh: "若能找到电子AI难以覆盖的独占场景，它有望把「计算视觉」下沉到分子，让感知与分类直接发生在化学反应本身之中。", en: "If it finds a niche electronic AI struggles to cover, it could push 'computer vision' down to the molecular level, letting perception and classification happen directly within the chemical reaction itself." },
      approaches: [
        { zh: "设计一组化学反应，使其对不同输入组合给出可区分的输出模式", en: "Designing a set of chemical reactions that yield distinguishable output patterns for different input combinations" },
        { zh: "借鉴神经网络的感知与分类逻辑，把其计算功能在分子层面复现", en: "Borrowing the perception-and-classification logic of neural networks and reproducing that computational function at the molecular level" },
        { zh: "探索体内原位决策等电子AI难以直接介入的应用场景", en: "Exploring application scenarios such as in-body in-situ decision-making that electronic AI cannot directly access" },
      ],
      barrier: { zh: "相比成熟的电子AI，化学模式识别若找不到自己不可替代的利基场景，就很可能只停留在概念展示阶段。", en: "Compared with mature electronic AI, if chemical pattern recognition cannot find its own irreplaceable niche, it risks staying at the concept-demonstration stage." },
      subQuestions: [
        { zh: "化学反应体系能否像神经网络一样，通过训练或调参来提升分类准确率，而不只是固定的一次性响应？", en: "Can a chemical reaction system, like a neural network, improve classification accuracy through training or tuning, rather than only giving a fixed one-shot response?" },
        { zh: "一组反应给出的「可区分输出」能否扩展到多类别、高维度的模式识别，而非简单的二分类？", en: "Can the 'distinguishable outputs' of a set of reactions extend to multi-class, high-dimensional pattern recognition rather than simple binary classification?" },
        { zh: "体内原位决策是否是化学计算视觉真正不可替代的场景，还是同样可能被电子微型传感器覆盖？", en: "Is in-body in-situ decision-making truly an irreplaceable scenario for chemical computer vision, or could it still be covered by miniaturized electronic sensors?" },
      ],
    },
    stage: 0, members: 1, activity: 6,
    chart: { x: 1255, y: 395, scale: 0.78 },
  },
  {
    id: 40, atlasN: 948, slug: "photonic-time-crystals-space-time",
    title: { zh: "光子时间晶体与时空超材料", en: "Photonic Time Crystals and Space-Time Metamaterials" },
    qfocus: { zh: "波能否被凭空放大，并在时间轴上获得拓扑保护，而非只是被引导向某处？", en: "Can a wave be amplified out of nothing and gain topological protection along the time axis, rather than merely being steered somewhere?" },
    domain: "物质",
    cluster: { code: "C16", zh: "可编程物质·超材料", en: "Programmable matter · metamaterials" },
    scores: [5, 4, 3, 2, 4, 2, 4, 4, 5],
    citation: { url: "https://www.nature.com/articles/s41467-025-66154-4", title: "Observation of wave amplification and temporal topological state in a non-synthetic photonic time crystal", venue: "Nature Communications", year: 2025 },
    brief: { zh: "把介电常数在时间上快速周期调制，打开动量带隙，让波在无源情况下被指数放大，还能携带时域拓扑相位。", en: "Periodically modulating permittivity in time opens a momentum (k-)gap that passively amplifies waves exponentially and carries a time-domain topological phase." },
    depth: {
      overview: { zh: "超材料过去只在空间里排兵布阵，光子时间晶体把战场搬进了时间轴：让介质参数以接近光速的速度反复切换，打开一段波不传播、反而被指数放大的动量带隙，并能证明中带隙存在时域拓扑保护态。这不是把波导向某处，而是凭空对波做参量放大。", en: "Metamaterials used to only arrange structure in space; photonic time crystals move the battlefield onto the time axis. Rapidly and periodically switching a medium's permittivity opens a momentum (k-)gap where waves don't propagate but are instead exponentially amplified, with mid-gap time-domain topological protection demonstrated. This doesn't steer a wave somewhere — it parametrically amplifies the wave out of nothing." },
      whyMatters: { zh: "最硬的张力是调制速度：要在光频段打开宽动量带隙，需要把折射率在亚飞秒尺度上做大幅度周期调制，目前只在微波与等离激元谐振增强体系里逼近，光频段仍是工程深水区。", en: "The hardest tension is modulation speed: opening a wide momentum gap at optical frequencies requires modulating the refractive index by a large amount on sub-femtosecond timescales, currently only approached in microwave and plasmonic-resonance-enhanced systems — optical frequencies remain deep engineering water." },
      ifAnswered: { zh: "若从微波传输线验证走向太赫兹乃至全光频段的时间晶体，它可能成为无源放大、超窄带光源与时域信息处理的新底座，把可编程波前扩展为可编程时空。", en: "Moving from microwave transmission-line proofs to THz and all-optical time crystals could make this a new substrate for passive amplification, ultra-narrowband light sources, and time-domain information processing — extending programmable wavefronts into programmable spacetime." },
      approaches: [
        { zh: "在动态调制的微波传输线超材料中直接观测动量带隙内的波放大", en: "Directly observing wave amplification inside the momentum gap in dynamically modulated microwave transmission-line metamaterials" },
        { zh: "用微波耦合谐振超材料实现跨越整个动量空间的完整动量带隙", en: "Realizing a complete momentum gap spanning the full momentum space with coupled-resonator microwave metamaterials" },
        { zh: "用硅球Mie谐振阵列做谐振增强，把带隙放大约350倍以逼近光频段", en: "Using Mie-resonant silicon-sphere arrays for resonance enhancement, amplifying the gap roughly 350-fold en route to optical frequencies" },
      ],
      barrier: { zh: "要在光频段打开宽动量带隙，需要把折射率在亚飞秒尺度上做大幅度周期调制，目前的调制速度只能在微波与等离激元体系里逼近这一要求。", en: "Opening a wide momentum gap at optical frequencies requires large-amplitude periodic modulation of the refractive index on sub-femtosecond timescales, and current modulation speeds only approach this in microwave and plasmonic systems." },
      subQuestions: [
        { zh: "光子时间晶体能实现的放大增益与带隙宽度，是否存在由材料响应速度设下的物理上限？", en: "Is there a physical ceiling — set by material response speed — on the gain and gap width a photonic time crystal can achieve?" },
        { zh: "时域拓扑保护态能否像空间拓扑边缘态一样，抵御调制过程中的时间域缺陷与抖动？", en: "Can time-domain topological states resist defects and jitter in the modulation process the way spatial topological edge states resist spatial defects?" },
        { zh: "从微波逼近光频段的路上，谐振增强策略的极限在哪里，是否存在无法用增强绕过的物理瓶颈？", en: "On the path from microwave to optical frequencies, where do resonance-enhancement strategies hit their limit, and is there a physical bottleneck no enhancement can bypass?" },
      ],
    },
    stage: 2, members: 10, activity: 66,
    chart: { x: 1002, y: 241, scale: 1.02 },
  },
  {
    id: 41, atlasN: 766, slug: "ferroelectric-in-memory-ising-annealer",
    title: { zh: "铁电存内原位伊辛退火器", en: "Ferroelectric In-Memory Ising Annealer" },
    qfocus: { zh: "组合优化能否不靠软件迭代，而是让器件的物理弛豫自己滚向最优解？", en: "Can combinatorial optimization skip software iteration entirely and let a device's physical relaxation roll itself toward the optimum?" },
    domain: "物质",
    cluster: { code: "C44", zh: "神经形态·物理智能硬件", en: "Neuromorphic · Physical-AI Hardware" },
    scores: [5, 5, 4, 2, 3, 3, 3, 4, 5],
    citation: { url: "https://arxiv.org/pdf/2504.21280", title: "Device-Algorithm Co-Design of Ferroelectric Compute-in-Memory In-Situ Annealer for Combinatorial Optimization Problems", venue: "arXiv (DG-FeFET CiM annealer)", year: 2025 },
    brief: { zh: "双栅铁电晶体管交叉阵列把伊辛退火变成器件内原位物理过程，背栅电压充当温度，3000节点Max-Cut能耗降1500倍以上。", en: "A double-gate ferroelectric-FET crossbar runs Ising annealing as an in-situ physical process with the back-gate voltage acting as temperature, cutting energy over 1500-fold on a 3000-node Max-Cut problem." },
    depth: {
      overview: { zh: "组合优化——最大割、路由、排程——是算到天荒地老的硬骨头。这条路线不再让软件反复迭代，而是用双栅铁电晶体管交叉阵列把伊辛退火做成器件内的原位物理过程：背栅电压充当退火温度，能量增量就地算出，免去外部反复读写，把NP难问题从软件迭代搬进器件动力学。", en: "Combinatorial optimization — Max-Cut, routing, scheduling — is the kind of problem you can compute on forever. This line drops repeated software iteration and instead runs Ising annealing as an in-situ physical process inside a double-gate ferroelectric-FET crossbar: the back-gate voltage acts as annealing temperature, energy increments are computed in place, and repeated external read/write is eliminated — moving an NP-hard problem from software iteration into device dynamics." },
      whyMatters: { zh: "把能量计算从O(n²)降到O(n)的增量-E变换是算法巧思，但它能逼近的解质量，以及铁电器件多次退火下的疲劳与漂移是否会污染能量地形，决定它能否真正跑赢成熟的数字或量子退火器——目前仅在仿真与小阵列验证。", en: "The 'incremental-E' transform that cuts energy computation from O(n²) to O(n) is an algorithmic insight, but the solution quality it can reach, and whether ferroelectric-device fatigue and drift under repeated annealing pollute the energy landscape, decide whether it can actually beat mature digital or quantum annealers — so far verified only in simulation and small arrays." },
      ifAnswered: { zh: "若器件级退火能稳定扩到数万节点，它会成为物流、通信网络与材料设计里专用优化硬件的一支，与量子退火、相干伊辛机正面竞争。", en: "If device-level annealing scales stably to tens of thousands of nodes, it becomes a class of dedicated optimization hardware for logistics, networks, and materials design, competing head-on with quantum annealers and coherent Ising machines." },
      approaches: [
        { zh: "把组合优化转成增量-E形式，将能量计算复杂度从O(n²)降到O(n)", en: "Recasting combinatorial optimization into 'incremental-E' form, cutting energy-computation complexity from O(n²) to O(n)" },
        { zh: "用双栅FeFET交叉阵列就地计算增量能量，背栅电压做原位退火", en: "Computing incremental energy in place with a double-gate FeFET crossbar, using back-gate voltage for in-situ annealing" },
        { zh: "在3000节点Max-Cut上对比两种SOTA退火器，能耗降1503至1716倍、时间降约8倍", en: "Benchmarking against two SOTA annealers on 3000-node Max-Cut, cutting energy 1503-1716x and time about 8x" },
      ],
      barrier: { zh: "铁电器件在多次退火循环下的疲劳与漂移是否会污染能量地形，以及增量-E变换能逼近的解质量上限，仍只在仿真与小阵列上验证过。", en: "Whether ferroelectric-device fatigue and drift under repeated annealing cycles pollute the energy landscape, and the solution-quality ceiling the incremental-E transform can reach, have only been verified in simulation and small arrays." },
      subQuestions: [
        { zh: "铁电器件的疲劳与漂移能否被主动利用为退火所需的随机涨落，而不只是被动容忍的噪声？", en: "Can ferroelectric-device fatigue and drift be actively harnessed as the random fluctuation annealing needs, rather than merely being tolerated as noise?" },
        { zh: "在没有数字孪生精确建模器件老化的前提下，增量-E变换能否在数万节点规模上保持能量计算的正确性？", en: "Without a digital twin precisely modeling device aging, can the incremental-E transform keep its energy computation correct at tens-of-thousands-of-node scale?" },
        { zh: "不同组合优化问题（路由、排程、最大割）对铁电阵列的映射效率是否存在共同规律，还是需要逐问题定制？", en: "Is there a common pattern for how efficiently different combinatorial problems (routing, scheduling, Max-Cut) map onto the ferroelectric array, or does each problem need bespoke tailoring?" },
      ],
    },
    stage: 2, members: 8, activity: 64,
    chart: { x: 1124, y: 228, scale: 1.02 },
  },
  {
    id: 42, atlasN: 786, slug: "magnetic-levitational-bioassembly-label-",
    title: { zh: "磁悬浮生物装配（无标记无喷头无支架）", en: "Magnetic Levitational Bioassembly (Label-, Nozzle-, Scaffold-Free)" },
    qfocus: { zh: "不用喷头、不用支架，只靠磁场能否让活细胞自己拼出一个器官的雏形？", en: "With no nozzle and no scaffold, can a magnetic field alone let living cells assemble themselves into the beginnings of an organ?" },
    domain: "物质",
    cluster: { code: "C46", zh: "空间生物经济·地外制造", en: "Space Bioeconomy · Off-Earth Manufacturing" },
    scores: [5, 4, 4, 2, 3, 2, 3, 3, 5],
    citation: { url: "https://www.science.org/doi/10.1126/sciadv.aba4174", title: "Magnetic levitational bioassembly of 3D tissue construct in space", venue: "Science Advances", year: 2020 },
    brief: { zh: "强顺磁介质中的磁场把组织球悬浮并融合成三维构造体，在轨微重力让顺磁盐浓度降到无毒水平，是与喷墨打印并列的生物制造范式。", en: "A magnetic field in a strong paramagnetic medium levitates and fuses tissue spheroids into 3D constructs; orbital microgravity lets the paramagnetic salt concentration drop to non-toxic levels, making this a biofabrication paradigm parallel to inkjet printing." },
    depth: {
      overview: { zh: "想象不用喷头、不用支架，只用磁场把一团团活细胞悬在半空，让它们自己拼成一个器官的雏形——这不是科幻，俄罗斯团队2018年已在国际空间站用人软骨细胞组织球生物装配出三维构造体。它靠磁场而非机械喷头把组织球聚合成形，是与逐层挤出打印并列的独立生物制造范式。", en: "Imagine no nozzle, no scaffold — just a magnetic field levitating clumps of living cells in mid-air and letting them assemble themselves into the beginnings of an organ. It isn't science fiction: a Russian team already bioassembled 3D constructs from human chondrocyte spheroids on the ISS in 2018. Tissue spheroids fuse into shape via magnetic field rather than mechanical nozzle — a biofabrication paradigm distinct from layer-by-layer extrusion printing." },
      whyMatters: { zh: "最硬的张力是地面的魔鬼参数：要让组织悬浮，地面需极高浓度的顺磁盐，对细胞有毒；只有微重力能把浓度压到无毒区，这让该范式高度依赖在轨环境，地面难以等价验证。", en: "The hardest tension is a ground-based 'devil's parameter': levitating tissue on Earth requires paramagnetic-salt concentrations high enough to be toxic to cells, and only microgravity can drop the concentration into the non-toxic range — making the paradigm heavily dependent on orbital conditions that are hard to equivalently validate on the ground." },
      ifAnswered: { zh: "若成形式装配能扩展到复杂几何，它理论上比挤出打印快一个数量级，能在几秒内把整团组织球聚成形，让轨道生物制造从打印演示走向真正的组织生产线。", en: "If formative assembly scales to complex geometries, it is in principle an order of magnitude faster than extrusion, fusing whole spheroid clusters into shape in seconds — moving orbital biofabrication from print demos toward a real tissue production line." },
      approaches: [
        { zh: "用磁场悬浮并定向融合组织球，无需喷头逐层挤出", en: "Levitating and directionally fusing tissue spheroids with a magnetic field, with no nozzle-based layer-by-layer extrusion" },
        { zh: "利用在轨微重力把顺磁盐浓度降到细胞可耐受的无毒水平", en: "Exploiting orbital microgravity to drop paramagnetic-salt concentration into a cell-tolerable, non-toxic range" },
        { zh: "定制磁悬浮装配仪Organ.Aut在国际空间站完成人软骨细胞三维构造体装配", en: "The custom magnetic-levitation assembler Organ.Aut bioassembling 3D constructs from human chondrocyte spheroids on the ISS" },
      ],
      barrier: { zh: "地面需要对细胞有毒的高浓度顺磁盐才能实现悬浮，只有微重力能把浓度压到无毒区，这让该范式的验证高度依赖在轨环境。", en: "Achieving levitation on the ground requires cell-toxic concentrations of paramagnetic salt, and only microgravity can bring the concentration down to a non-toxic range, making validation of this paradigm heavily dependent on orbital access." },
      subQuestions: [
        { zh: "磁悬浮装配出的组织，其力学成熟度能否达到可移植、可承力的临床标准，还是仅停留在形态保真的阶段？", en: "Can tissue assembled by magnetic levitation reach the mechanical maturity needed for implantable, load-bearing clinical use, or does it stay at the stage of merely being shape-faithful?" },
        { zh: "无标记无支架装配出的三维构造体，能否在轨道环境里同步完成血管化，而不仅是聚成形状？", en: "Can label- and scaffold-free 3D constructs achieve vascularization in orbit as they assemble, rather than merely fusing into shape?" },
        { zh: "地面能否找到一种非磁场、非高毒盐浓度的替代方案，来部分验证这条范式，而不必完全依赖在轨实验？", en: "Can a ground-based alternative that avoids both the magnetic field and toxic salt concentrations be found to partially validate this paradigm, without total dependence on orbital experiments?" },
      ],
    },
    stage: 2, members: 8, activity: 62,
    chart: { x: 1185, y: 247, scale: 1.02 },
  },
  {
    id: 43, atlasN: 814, slug: "self-supervised-latent-world-models",
    title: { zh: "自监督潜空间世界模型驱动的零样本机器人规划", en: "Self-Supervised Latent World Models for Zero-Shot Robot Planning" },
    qfocus: { zh: "机器人能否只靠看过的海量视频学会物理直觉，再零样本抓取一张从未见过的桌子？", en: "Can a robot learn physical intuition purely from watching video, then zero-shot grasp objects on a table it has never seen?" },
    domain: "物质",
    cluster: { code: "C48", zh: "具身基础模型·机器人学习", en: "Embodied Foundation Models · Robot Learning" },
    scores: [5, 4, 4, 2, 3, 3, 4, 4, 4],
    citation: { url: "https://arxiv.org/abs/2506.09985", title: "V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning", venue: "arXiv (Meta FAIR)", year: 2025 },
    brief: { zh: "V-JEPA 2在百万小时互联网视频上预训练无动作潜空间预测器，仅用62小时机器人数据后训练出动作条件世界模型，零样本部署到两个实验室的机械臂。", en: "V-JEPA 2 pretrains an action-free latent-space predictor on over a million hours of internet video, then post-trains an action-conditioned world model with under 62 hours of robot data, and deploys it zero-shot on robot arms in two labs." },
    depth: {
      overview: { zh: "把理解世界和采取行动分两步学：先从海量视频里无监督学一个会预测的潜空间，再用几十小时机器人数据把动作插进去——然后在没见过的桌面上零样本抓放。这把世界模型从像素生成器转向可规划的紧凑表征，用无动作视频预训练加极少量机器人轨迹后训练，让机器人无需该环境的数据、奖励或任务专属训练就能规划。", en: "Learning to understand the world and learning to act are split into two steps: first learn a predictive latent space unsupervised from a mountain of video, then insert action into it using only tens of hours of robot data — then do zero-shot pick-and-place on an unseen tabletop. This moves the world model from pixel generator to a compact, plannable representation, pairing action-free video pretraining with minimal robot-trajectory post-training so a robot can plan with no data, reward, or task-specific training for the new environment." },
      whyMatters: { zh: "最硬的张力是潜空间规划的可证伪性：潜表征里的预测误差不直接等价于物理可行性，长时程下子目标如何分解、接触瞬间的预测如何不崩仍是公开难题，62小时数据的成功能否推广到精细操作尚未被证伪。", en: "The hardest tension is the falsifiability of latent-space planning: prediction error in the latent representation doesn't directly equate to physical feasibility, how to decompose sub-goals over long horizons and keep contact-moment predictions from collapsing remain open, and whether the 62-hour-data success generalizes to fine manipulation hasn't been falsified either way." },
      ifAnswered: { zh: "若潜空间预测能扩展到长时程、多物体、接触丰富的任务，它有望成为机器人的通用物理直觉底座，把感知、预测与规划统一在一个无标注可学的表征里。", en: "If latent prediction scales to long-horizon, multi-object, contact-rich tasks, it could become a general physical-intuition substrate for robots, unifying perception, prediction, and planning in one label-free learnable representation." },
      approaches: [
        { zh: "在百万小时互联网视频上预训练无动作联合嵌入预测架构V-JEPA 2", en: "Pretraining the action-free joint-embedding predictive architecture V-JEPA 2 on over a million hours of internet video" },
        { zh: "用不到62小时无标注机器人视频后训练出3亿参数的动作条件世界模型", en: "Post-training a 300-million-parameter action-conditioned world model on under 62 hours of unlabeled robot video" },
        { zh: "在图像目标下用模型预测控制，零样本部署到两个实验室的Franka机械臂", en: "Zero-shot deploying model-predictive control toward image goals on Franka arms across two labs" },
      ],
      barrier: { zh: "潜表征里的预测误差不直接等价于物理可行性，长时程任务的子目标分解与接触瞬间的预测稳定性仍是公开难题。", en: "Prediction error in the latent representation doesn't directly equate to physical feasibility, and sub-goal decomposition over long horizons plus prediction stability at moments of contact remain open problems." },
      subQuestions: [
        { zh: "V-JEPA 2式的潜空间世界模型，能否跨越不同机器人本体迁移，还是每种机械臂都要重新做动作后训练？", en: "Can a V-JEPA-2-style latent world model transfer across different robot embodiments, or does every arm need its own action post-training from scratch?" },
        { zh: "62小时机器人数据的零样本成功，是靠更多数据就能推广到精细操作，还是需要闭环交互式纠错才能突破？", en: "Does the zero-shot success from 62 hours of robot data extend to fine manipulation with more data alone, or does it require closed-loop interactive correction to break through?" },
        { zh: "潜空间里预测误差小，是否真的意味着规划出的动作在接触物理上可行，还是只是表征学得平滑？", en: "Does low prediction error in the latent space genuinely mean a planned action is feasible under contact physics, or does it just mean the representation learned to be smooth?" },
      ],
    },
    stage: 2, members: 8, activity: 58,
    chart: { x: 1256, y: 287, scale: 1.01 },
  },
  {
    id: 44, atlasN: 822, slug: "neural-reconstruction-real-to-sim-policy-evaluation",
    title: { zh: "神经重建驱动的真实-到-仿真策略评测", en: "Neural-Reconstruction Real-to-Sim Policy Evaluation" },
    qfocus: { zh: "用手机扫一遍桌面，几分钟内建出的仿真，评测分数能否真的跟真机一致？", en: "Can a sim built from a few-minute phone scan of a tabletop give evaluation scores that genuinely match the real robot?" },
    domain: "物质",
    cluster: { code: "C48", zh: "具身基础模型·机器人学习", en: "Embodied Foundation Models · Robot Learning" },
    scores: [4, 4, 5, 4, 3, 3, 4, 4, 5],
    citation: { url: "https://arxiv.org/abs/2512.16881", title: "PolaRiS: Scalable Real-to-Sim Evaluations for Generalist Robot Policies", venue: "arXiv (cs.RO)", year: 2025 },
    brief: { zh: "用高斯泼溅把真实场景短视频自动重建成可交互仿真，评测机器人策略，与真机表现的相关性远强于已有仿真基准。", en: "Gaussian splatting auto-converts a short video scan of a real scene into an interactive simulation for policy evaluation, correlating with real-robot performance far more strongly than existing sim benchmarks." },
    depth: {
      overview: { zh: "真机评测泛用机器人策略既贵又难复现，已有仿真基准又与现实存在视觉与物理域差。这条路线用高斯泼溅等神经重建把一段真实场景的短视频扫描自动变成可交互的高保真仿真环境，给策略做可扩展、可复现的评测，并通过仿真数据共训练实现对未见场景的零样本评测。用手机扫一段真实桌面，几分钟内重建成可交互仿真，把策略丢进去跑几十次，分数和真机高度相关。", en: "Real-robot evaluation of generalist policies is costly and hard to reproduce, while existing sim benchmarks suffer a visual and physical domain gap from reality. This line uses neural reconstruction — Gaussian splatting — to auto-convert a short video scan of a real scene into an interactive, high-fidelity sim environment for scalable, reproducible policy evaluation, with sim-data co-training enabling zero-shot evaluation of unseen scenes. Scan a real tabletop with a phone, reconstruct an interactive sim in minutes, and drop a policy in for dozens of rollouts — the score correlates strongly with the real robot." },
      whyMatters: { zh: "最硬的未解难题是仿真-真实相关性的可迁移性：接触丰富、可变形物体的动力学差仍会让相关性在新任务上失效，共训练配方是真信号还是过拟合到评测分布，需要更对抗性的验证。", en: "The hardest open problem is the transferability of the sim-real correlation: dynamics gaps for contact-rich, deformable objects can still break the correlation on new tasks, and whether the co-training recipe is a genuine signal or overfits to the evaluation distribution needs more adversarial testing." },
      ifAnswered: { zh: "若重建-评测管线足够便宜且与真机强相关，机器人领域可能首次拥有像ImageNet那样的分布式、可复现排行榜，把策略迭代从昂贵真机实验中解放出来。", en: "If the reconstruct-and-evaluate pipeline is cheap enough and strongly correlated with real robots, robotics could get its first ImageNet-like distributed, reproducible leaderboard, freeing policy iteration from expensive real-robot rollouts." },
      approaches: [
        { zh: "用2D高斯泼溅把真实场景短视频重建成可交互仿真环境", en: "Reconstructing an interactive sim environment from a short real-scene video with 2D Gaussian splatting" },
        { zh: "用简单的仿真数据共训练配方桥接残余的真实-到-仿真域差", en: "Bridging the residual real-to-sim domain gap with a simple sim-data co-training recipe" },
        { zh: "为可变形软体交互如毛绒打包、绳索布线构建软体数字孪生并验证仿真-真机成功率聚类", en: "Building soft-body digital twins for deformable interactions (plush packing, rope routing) and validating that sim and real success rates cluster tightly" },
      ],
      barrier: { zh: "接触丰富、可变形物体的动力学域差仍会让仿真与真机的相关性在新任务上失效，共训练配方是否是真信号仍需更对抗性的验证。", en: "Dynamics domain gaps for contact-rich, deformable objects can still break the sim-real correlation on new tasks, and whether the co-training recipe is a genuine signal still needs more adversarial validation." },
      subQuestions: [
        { zh: "重建出的仿真环境评测出的策略排名，能否跨越不同机器人本体保持一致，还是每种本体都要重新建立相关性？", en: "Does a policy ranking produced by a reconstructed sim stay consistent across different robot embodiments, or must the sim-real correlation be re-established for every new embodiment?" },
        { zh: "真机评测的真正价值，是提供更多试验数据，还是提供仿真无法复现的分布外交互与失败模式？", en: "Is the real value of real-robot evaluation the extra trial data it provides, or the out-of-distribution interactions and failure modes a simulation simply cannot reproduce?" },
        { zh: "高斯泼溅重建出的接触动力学，在穿过硬接触的瞬间是否忠实于真实物理，还是仅仅复刻了视觉外观？", en: "At the instant of passing through hard contact, is the contact dynamics reconstructed by Gaussian splatting faithful to real physics, or does it merely replicate visual appearance?" },
      ],
    },
    stage: 2, members: 10, activity: 62,
    chart: { x: 1017, y: 309, scale: 1.02 },
  },
  {
    id: 45, atlasN: 905, slug: "magic-state-cultivation-cheap",
    title: { zh: "魔法态培育:廉价非克利福德门", en: "Magic State Cultivation for Cheap Non-Clifford Gates" },
    qfocus: { zh: "做一个高保真T门，能否不再蒸馏，而是直接把它养到完美？", en: "Can a high-fidelity T gate be grown to perfection directly, instead of being distilled?" },
    domain: "物质",
    cluster: { code: "C15", zh: "应用量子科学", en: "Applied quantum science" },
    scores: [4, 3, 4, 1, 3, 2, 5, 5, 4],
    citation: { url: "https://arxiv.org/abs/2409.17595", title: "Magic state cultivation: growing T states as cheap as CNOT gates", venue: "arXiv (Google Quantum AI)", year: 2024 },
    brief: { zh: "在表面码补丁内用容错测量加后选择逐步培育魔法态，物理门数约等于一次格点手术CNOT，逻辑错误率可低至2×10⁻⁹。", en: "Fault-tolerant measurement plus post-selection cultivates a magic state inside a surface-code patch using roughly a lattice-surgery CNOT's worth of gates, reaching a logical error rate as low as 2×10⁻⁹." },
    depth: {
      overview: { zh: "通用容错计算卡在非克利福德T门上，传统魔法态蒸馏要耗掉绝大部分时空开销。2024年一个反直觉的想法把它颠覆：别蒸馏，直接把一个态养到完美。魔法态培育在一块表面码补丁内，用容错测量加后选择把单个态逐步养大到高保真，所需物理门约等于一次格点手术CNOT，可能让蒸馏不再必要。", en: "Universal fault-tolerant computing bottlenecks on the non-Clifford T gate, where classic magic-state distillation eats most of the spacetime budget. A counterintuitive idea flipped this in 2024: don't distill, just grow a state to perfection directly. Magic-state cultivation, inside a single surface-code patch, uses fault-tolerant measurement plus post-selection to grow one state to high fidelity, at a gate cost roughly equal to a lattice-surgery CNOT — potentially obsoleting distillation entirely." },
      whyMatters: { zh: "硬难点在后选择产率：培育靠丢弃失败样本换保真度，实验里只保留约8%的尝试；一旦上规模，这个丢弃率会不会重新吃掉省下的开销、能否与实时反馈兼容，仍未定。", en: "The hard difficulty is post-selection yield: cultivation trades fidelity for discarded failed samples, keeping only about 8% of attempts experimentally; whether that discard rate eats back the savings at scale, and whether it's compatible with real-time feedback, remains unsettled." },
      ifAnswered: { zh: "若实验保真度与产率继续提升，T门将像CNOT一样便宜，容错算法的总开销估计被整体下调一个量级，作者认为蒸馏在实践中可能再不需要。", en: "If experimental fidelity and yield keep improving, T gates become 'as cheap as CNOTs,' cutting whole-algorithm fault-tolerant overhead by roughly an order of magnitude — the authors suggest distillation may become practically unnecessary." },
      approaches: [
        { zh: "在单块表面码补丁内用容错测量加后选择逐步养大养纯单个魔法态", en: "Growing and purifying a single magic state inside one surface-code patch via fault-tolerant measurement plus post-selection" },
        { zh: "把逻辑错误率压到2×10⁻⁹，物理门数控制在约一次格点手术CNOT", en: "Suppressing the logical error rate to 2×10⁻⁹ while holding gate cost to roughly one lattice-surgery CNOT" },
        { zh: "2025年在超导处理器上实验实现，含码切换进表面码，误差降低40倍", en: "Experimentally realizing it on a superconducting processor in 2025, with code-switching into the surface code cutting error 40-fold" },
      ],
      barrier: { zh: "培育靠丢弃失败样本换保真度，实验里只保留约8%的尝试，这个后选择丢弃率上规模后是否会重新吃掉省下的开销仍未定。", en: "Cultivation trades fidelity for discarded failed samples, keeping only about 8% of attempts experimentally, and whether this post-selection discard rate eats back the savings at scale remains unsettled." },
      subQuestions: [
        { zh: "魔法态培育的后选择丢弃率，能否通过更好的编码设计降到不影响整体吞吐的水平？", en: "Can better code design reduce magic-state cultivation's post-selection discard rate to a level that no longer hurts overall throughput?" },
        { zh: "培育出的魔法态保真度提升，是否会遇到与蒸馏类似的收益递减，还是能持续逼近理论极限？", en: "Will the fidelity gains from cultivation hit diminishing returns similar to distillation, or can they keep approaching the theoretical limit?" },
        { zh: "当培育与实时反馈结合后，容错算法的总时空开销能否被整体下调到蒸馏时代无法想象的量级？", en: "Once cultivation is combined with real-time feedback, can the total spacetime overhead of fault-tolerant algorithms drop to a scale unimaginable in the distillation era?" },
      ],
    },
    stage: 2, members: 9, activity: 58,
    chart: { x: 1108, y: 325, scale: 1.01 },
  },
  {
    id: 46, atlasN: 910, slug: "erasure-conversion-qubits-turning-loss",
    title: { zh: "可擦除转换:把损耗变成可见擦除", en: "Erasure-Conversion Qubits: Turning Loss into Detectable Erasure" },
    qfocus: { zh: "纠错比特能否学会举手报告自己出错的位置，而不是悄悄藏起来？", en: "Can a qubit learn to raise its hand and report where it failed, instead of hiding the error silently?" },
    domain: "物质",
    cluster: { code: "C15", zh: "应用量子科学", en: "Applied quantum science" },
    scores: [4, 4, 3, 2, 3, 3, 4, 4, 5],
    citation: { url: "https://www.nature.com/articles/s41567-024-02539-4", title: "A superconducting dual-rail cavity qubit with erasure-detected logical measurements", venue: "Nature Physics", year: 2024 },
    brief: { zh: "重新设计量子比特(双轨腔、亚稳态中性原子)，让主导错误被实时探测为已知位置的擦除，纠正阈值因此提高2至5倍。", en: "Redesigning qubits (dual-rail cavities, metastable neutral atoms) so the dominant errors are detected in real time as known-location erasures raises the correction threshold 2-5x." },
    depth: {
      overview: { zh: "纠错最大的浪费，是不知道错误发生在哪。通用纠错把所有错误当未知位置，浪费了大量纠错冗余。可擦除转换换个思路：重新设计比特，让主导错误——泄漏、原子丢失——被主动转化为已知位置的擦除事件，一个被定位的错误远比一个隐形的错误便宜。", en: "The biggest waste in error correction is not knowing where an error happened. Generic QEC treats every error as unknown-location, wasting a lot of redundancy. Erasure conversion flips the idea: redesign the qubit so the dominant errors — leakage, atom loss — are actively converted into known-location erasure events. A located error is far cheaper to correct than an invisible one." },
      whyMatters: { zh: "张力在转换的完备性：并非所有错误都能转成擦除，残余的隐形比特翻转一旦升高，擦除红利就坍缩；双轨与亚稳态编码以双倍硬件换噪声结构，规模化时这笔交易是否仍划算尚待验证。", en: "The tension lies in completeness: not every error converts to an erasure, and once the residual 'invisible' bit-flip rate rises, the erasure dividend collapses; dual-rail and metastable encodings trade double the hardware for a favorable noise structure, and whether that trade still pays off at scale is unverified." },
      ifAnswered: { zh: "方向是把偏置擦除与qLDPC或表面码联姻，让硬件天然产生易纠的错误类型，做出比拼物理比特数更省的容错路线。", en: "The direction is marrying biased erasure with qLDPC or surface codes so hardware natively emits easy-to-correct error types — a fault-tolerant route that wins on overhead rather than raw qubit count." },
      approaches: [
        { zh: "用超导双轨腔比特实现带擦除探测的逻辑测量", en: "Realizing logical measurement with erasure detection using superconducting dual-rail cavity qubits" },
        { zh: "用中性原子的亚稳态在电路中途实现擦除转换", en: "Achieving mid-circuit erasure conversion via metastable states in neutral-atom qubits" },
        { zh: "把偏置擦除编码与qLDPC或表面码结合，把已知位置错误的高阈值转成整体开销优势", en: "Combining biased-erasure encoding with qLDPC or surface codes to turn the high threshold of known-location errors into an overall overhead advantage" },
      ],
      barrier: { zh: "没有任何编码能把全部错误转成擦除，残余的非擦除错误——尤其是隐形比特翻转——一旦升高就会吃掉擦除带来的阈值红利。", en: "No encoding converts every error to an erasure; once the residual non-erasure errors — especially invisible bit flips — rise, they eat into the threshold dividend erasure conversion provides." },
      subQuestions: [
        { zh: "双轨腔与亚稳态编码用双倍硬件换来的擦除红利，在数万比特规模下是否仍然划算？", en: "At the scale of tens of thousands of qubits, does the erasure dividend bought with double the hardware in dual-rail and metastable encodings still pay off?" },
        { zh: "残余的隐形比特翻转错误率，存在一个让擦除转换彻底失效的临界点吗？", en: "Is there a critical residual invisible-bit-flip rate beyond which erasure conversion stops paying off entirely?" },
        { zh: "偏置擦除编码与qLDPC结合后，纠错阈值的提升能否转化为物理比特数的实际节省，而非仅仅是理论阈值数字？", en: "Once biased-erasure encoding is combined with qLDPC codes, does the threshold improvement translate into real savings in physical qubit count, or does it remain only a theoretical threshold number?" },
      ],
    },
    stage: 2, members: 9, activity: 62,
    chart: { x: 1162, y: 333, scale: 1.02 },
  },
  {
    id: 47, atlasN: 771, slug: "stochastic-memristors-turning-device",
    title: { zh: "随机忆阻器:把器件涨落同时变成熵源、安全原语与算力", en: "Stochastic Memristors: Turning Device Fluctuations Into Entropy, Security Primitives and Compute at Once" },
    qfocus: { zh: "同一个器件的随机涨落，能否既当加密的熵源又当确定逻辑的算力？", en: "Can a single device's random fluctuation double as both an encryption entropy source and deterministic compute?" },
    domain: "物质",
    cluster: { code: "C44", zh: "神经形态·物理智能硬件", en: "Neuromorphic · Physical-AI Hardware" },
    scores: [4, 5, 4, 4, 3, 4, 3, 4, 5],
    citation: { url: "https://www.nature.com/articles/s41467-024-47488-x", title: "Tunable stochastic memristors for energy-efficient encryption and computing", venue: "Nature Communications", year: 2024 },
    brief: { zh: "同一忆阻器换个偏置就能在真随机数与物理不可克隆函数间切换，又能做布尔逻辑或类脑突触，把器件缺陷反用为安全与计算共享的资源。", en: "The same memristor switches between generating true random numbers and physically unclonable functions under one bias, and performs Boolean logic or synaptic behavior under another, repurposing a device 'defect' into a resource shared by security and compute." },
    depth: {
      overview: { zh: "传统上，加密要不可预测、计算要可预测，二者各占一块耗电硬件。随机忆阻器的洞见是：同一器件的离子迁移随机切换，在某些偏置下当真随机数与物理不可克隆函数的熵源，换一组偏置又能做确定性布尔逻辑或类脑突触——器件的缺陷被反用为安全与计算共享的资源。", en: "Traditionally, encryption demands unpredictability while compute demands predictability, and each gets its own power-hungry hardware. The insight behind stochastic memristors: the same device's stochastic ion-migration switching serves, under one bias, as the entropy source for true random numbers and physically unclonable functions, and under another bias performs deterministic Boolean logic or neuromorphic synaptic behavior — the device's 'defect' repurposed as a resource shared by security and compute." },
      whyMatters: { zh: "最硬的未解难点在随机性的可认证与长期稳定：涨落随温度与循环老化漂移，会同时威胁PUF的唯一性和计算的可靠性，要让同一器件在够随机与够确定两种模式间可靠切换，需通过严苛的统计与跨温度考验。", en: "The hardest open problem is certifying randomness and long-term stability: fluctuation drifts with temperature and cycling-induced aging, threatening both PUF uniqueness and compute reliability simultaneously, and reliably switching the same device between 'random enough' and 'deterministic enough' modes must clear rigorous statistical and cross-temperature tests." },
      ifAnswered: { zh: "正走向安全、存储、计算三合一的边缘节点芯片：同一阵列里完成密钥生成、加密、以及在密文上做矩阵乘法。", en: "It heads toward unified security-storage-compute edge chips: one array generating keys, encrypting, and even running matrix multiplication on encrypted data." },
      approaches: [
        { zh: "用Cu0.3Te0.7/HfO2离子迁移忆阻器在一组偏置生成真随机数与PUF、另一组做布尔逻辑", en: "Using Cu0.3Te0.7/HfO2 ion-migration memristors to generate true random numbers and PUFs under one bias and Boolean logic under another" },
        { zh: "基于阈值开关的32×32 1T1R阵列统一PUF与真随机数发生器，通过NIST-800测试", en: "Unifying PUF and true-random-number generation in a 32x32 1T1R threshold-switching array that passes NIST-800 statistical tests" },
        { zh: "用自整流V-RRAM实现可隐藏的PUF与在存加密，跨温度误码率低于1.5%", en: "Realizing concealable PUFs and in-memory encryption with self-rectifying V-RRAM, holding cross-temperature bit-error rate under 1.5%" },
      ],
      barrier: { zh: "涨落随温度与循环老化漂移，会同时威胁PUF的唯一性和计算的可靠性，让同一器件可靠切换于够随机与够确定两种模式仍待严苛验证。", en: "Fluctuation drifts with temperature and cycling aging threaten PUF uniqueness and compute reliability at once, and reliably switching one device between 'random enough' and 'deterministic enough' modes still awaits rigorous validation." },
      subQuestions: [
        { zh: "同一颗忆阻器要在加密、算力与退火求解三种角色间切换，是否存在无法回避的相互干扰？", en: "When one memristor switches among encryption, compute, and annealing-solver roles, is there interference among them that cannot be avoided?" },
        { zh: "PUF所需的唯一性涨落与计算所需的确定性，能否用同一套偏置调控理论统一描述？", en: "Can the fluctuation uniqueness a PUF needs and the determinism compute needs be described by one unified bias-control theory?" },
        { zh: "跨温度、跨循环老化的漂移，能否被主动补偿，还是从根本上限制了随机忆阻器的部署寿命？", en: "Can cross-temperature, cross-cycling-aging drift be actively compensated, or does it fundamentally limit the deployable lifetime of stochastic memristors?" },
      ],
    },
    stage: 2, members: 10, activity: 56,
    chart: { x: 1292, y: 332, scale: 1.01 },
  },
  {
    id: 48, atlasN: 791, slug: "clonal-hematopoiesis-chip-personalized",
    title: { zh: "克隆造血(CHIP)作为太空辐射风险的个体化放大器", en: "Clonal Hematopoiesis (CHIP) as a Personalized Amplifier of Space-Radiation Risk" },
    qfocus: { zh: "宇航员对辐射的脆弱程度，是否早就写在他们血液干细胞的突变克隆里？", en: "Is an astronaut's vulnerability to radiation already written into the mutant clones inside their blood stem cells?" },
    domain: "物质",
    cluster: { code: "C46", zh: "空间生物经济·地外制造", en: "Space Bioeconomy · Off-Earth Manufacturing" },
    scores: [4, 4, 3, 2, 3, 3, 4, 3, 5],
    citation: { url: "https://www.nature.com/articles/s42003-022-03777-z", title: "Retrospective analysis of somatic mutations and clonal hematopoiesis in astronauts", venue: "Communications Biology", year: 2022 },
    brief: { zh: "血液干细胞里悄然扩张的CHIP突变克隆会放大辐射致癌与心血管风险，而宇航员比同龄人提前近二十年出现它。", en: "Quietly expanding CHIP mutant clones in blood stem cells amplify radiation-linked cancer and cardiovascular risk, and astronauts show these clones nearly two decades earlier than their peers." },
    depth: {
      overview: { zh: "为什么有的宇航员对辐射格外脆弱？答案可能藏在血液干细胞里：随年龄悄悄壮大的突变克隆(CHIP)会放大辐射致癌与心血管风险，而宇航员竟比常人提前近二十年出现它。这把太空辐射对所有人一视同仁的旧假设，替换成每个人的基因组演化史决定其辐射命运，辐射风险第一次有了个体化的分子解释。", en: "Why are some astronauts especially vulnerable to radiation? The answer may lie in blood stem cells: mutant clones that quietly expand with age (CHIP) amplify radiation-linked cancer and cardiovascular risk, and astronauts show these clones nearly two decades earlier than the general population. This replaces the old assumption that space radiation hits everyone equally with the idea that each person's genomic evolutionary history sets their radiation fate — the first individualized, molecular explanation of radiation risk." },
      whyMatters: { zh: "最硬的未解难点是因果方向与样本量：到底是太空辐射诱发或加速了CHIP，还是高强度训练与选拔偏倚使然？短时任务并未观察到CHIP显著变化，长期纵向、足够人数的队列仍缺。", en: "The hardest open problem is the direction of causality and sample size: does space radiation induce or accelerate CHIP, or does intense training and selection bias explain it? Short-duration missions showed no significant CHIP change, and long-term longitudinal cohorts of sufficient size are still missing." },
      ifAnswered: { zh: "趋势是把CHIP筛查与克隆追踪纳入机组选拔与个体化辐射剂量上限，做成可量化的个人辐射风险护照，让机组遴选与对抗措施建立在分子风险分层上。", en: "The trajectory folds CHIP screening and clone tracking into crew selection and personalized radiation dose limits — a quantifiable personal radiation-risk passport that grounds crew selection and countermeasures in molecular risk stratification." },
      approaches: [
        { zh: "回顾性分析14名宇航员的CHIP驱动基因突变，发现比一般人群提前近二十年出现", en: "Retrospectively analyzing CHIP driver-gene mutations in 14 astronauts, finding onset nearly two decades earlier than the general population" },
        { zh: "用火星任务情景建模，量化CHIP携带者的辐射暴露致死风险", en: "Modeling a Mars-mission scenario to quantify radiation-exposure mortality risk for CHIP carriers" },
        { zh: "对比短时任务如Inspiration4与长航任务的克隆体量波动，检验辐射与训练的因果贡献", en: "Comparing clone-size fluctuation between short missions (e.g. Inspiration4) and long-duration missions to test the causal contribution of radiation versus training" },
      ],
      barrier: { zh: "到底是太空辐射诱发或加速了CHIP，还是高强度训练与选拔偏倚所致，因果方向尚未厘清，长期纵向、足够人数的队列仍然缺失。", en: "Whether space radiation induces or accelerates CHIP, or whether intense training and selection bias explain it, remains causally unresolved, and long-term longitudinal cohorts of sufficient size are still missing." },
      subQuestions: [
        { zh: "短时任务未观察到CHIP显著变化，是否意味着风险只在长航任务中累积，还是短时任务的样本量本身不足以检出？", en: "Does the absence of significant CHIP change on short missions mean risk only accumulates on long-duration flights, or is the short-mission sample simply too small to detect it?" },
        { zh: "CHIP携带者的辐射致死风险模型，能否推广到除血液肿瘤与心血管病外的其他辐射相关疾病？", en: "Can the radiation-mortality risk model for CHIP carriers extend beyond hematologic cancer and cardiovascular disease to other radiation-linked conditions?" },
        { zh: "机组选拔中引入CHIP筛查，如何在提升安全性与避免基因歧视式排除之间找到边界？", en: "If CHIP screening enters crew selection, where is the line between improving safety and genetic-discrimination-style exclusion?" },
      ],
    },
    stage: 1, members: 6, activity: 46,
    chart: { x: 1009, y: 415, scale: 0.87 },
  },
  {
    id: 49, atlasN: 823, slug: "soft-gradients-through-hard",
    title: { zh: "穿过硬接触的可微梯度:接触丰富任务的可微仿真", en: "Soft Gradients Through Hard Contacts for Contact-Rich Differentiable Simulation" },
    qfocus: { zh: "接触一发生梯度就崩——能否让机器人在硬接触中也拿到可用梯度?", en: "Contact makes gradients collapse — can robots still get usable gradients through hard contact?" },
    domain: "物质",
    cluster: { code: "C48", zh: "具身基础模型·机器人学习", en: "Embodied Foundation Models · Robot Learning" },
    scores: [4, 3, 5, 3, 3, 3, 4, 5, 4],
    citation: { url: "https://arxiv.org/abs/2506.14186", title: "Differentiable Simulation of Hard Contacts with Soft Gradients for Learning and Control", venue: "arXiv (cs.RO) · OpenReview", year: 2025 },
    brief: { zh: "DiffMJX 把自适应时间积分耦合进 MuJoCo XLA,用'距离接触'直通估计在硬接触下拿到有信息的预接触梯度。", en: "DiffMJX couples adaptive time integration into MuJoCo XLA and uses a contacts-from-distance straight-through estimator to recover informative pre-contact gradients through hard contact." },
    depth: {
      overview: { zh: "接触力给机器人动力学带来不连续:刚性求解器能保物理真实却让自动微分梯度失真,软接触梯度光滑却拉大仿真到真实的差距。这条路线用自适应时间积分与'距离接触'直通估计等技巧,试图在不改变前向物理的前提下让可用梯度穿过硬接触,把可微仿真从调参玄学推向可优化的严肃工具。", en: "Contact forces make robot dynamics discontinuous: stiff solvers preserve physical realism but corrupt autodiff gradients, while soft contact keeps gradients smooth at the cost of a wider sim-to-real gap. This line uses adaptive time integration and a contacts-from-distance straight-through trick to push usable gradients through hard contacts without altering forward physics, moving differentiable simulation from parameter-tuning folklore toward a rigorous optimization tool." },
      whyMatters: { zh: "可微仿真必须在'刚性求解器梯度错误'与'软求解器仿真到真实差距变大'之间二选一,这道两难直接决定接触丰富任务的可微优化能否落地,是 sim-to-real 路线隐藏的地基。", en: "A differentiable simulator must choose between stiff solvers with wrong gradients and soft solvers with a wider sim-to-real gap — this dilemma directly gates whether gradient-based optimization can work for contact-rich tasks, the hidden foundation of the whole sim-to-real route." },
      ifAnswered: { zh: "若硬接触的可微梯度问题被攻克,基于解析梯度的策略学习有望在样本效率上压过采样式强化学习,让接触丰富的操作与运动直接在可微仿真中学成并零样本上真机。", en: "If hard-contact differentiable gradients are solved, analytic-gradient policy learning could decisively beat sampling-based RL on sample efficiency, letting contact-rich manipulation and locomotion be learned directly in differentiable simulation and transferred zero-shot." },
      approaches: [
        { zh: "自适应时间积分(Diffrax)耦合进 MuJoCo XLA,提升梯度精度", en: "Coupling adaptive time integration (Diffrax) into MuJoCo XLA to improve gradient accuracy" },
        { zh: "'距离接触(CFD)'直通估计:反向传播中给临近物体加微小虚拟接触力", en: "Contacts-from-distance (CFD) straight-through estimation: adding tiny virtual contact force to nearby objects only during backprop" },
        { zh: "用可微接触模型学四足运动,零样本迁移到真机(Schwarke 等, CoRL 2025)", en: "Learning quadruped locomotion with a differentiable contact model and transferring zero-shot to real hardware (Schwarke et al., CoRL 2025)" },
      ],
      barrier: { zh: "梯度正确性与计算/内存成本互相牵制:自适应步长改善梯度却增加算力,直通估计引入的虚拟力也可能偏离真实物理。", en: "Gradient correctness and compute/memory cost pull against each other: adaptive step size improves gradients but raises compute cost, and the virtual force introduced by straight-through estimation may itself deviate from real physics." },
      subQuestions: [
        { zh: "软梯度学到的是真实接触物理,还是求解器的数值伪迹?", en: "Do policies learned from soft gradients capture real contact physics, or merely the solver's numerical artifacts?" },
        { zh: "可微仿真里学到的接触丰富技能,能否零样本迁移到不同本体的机器人?", en: "Do contact-rich skills learned in differentiable simulation transfer zero-shot across different robot embodiments?" },
        { zh: "解析梯度对采样式强化学习的样本效率优势,能否在高维接触任务上稳定兑现?", en: "Can the sample-efficiency edge of analytic gradients over sampling-based RL be reliably realized on high-dimensional contact-rich tasks?" },
        { zh: "自适应步长带来的算力开销,是否会抵消可微优化相对采样法的效率优势?", en: "Does the compute overhead of adaptive step size offset differentiable optimization's efficiency advantage over sampling methods?" },
      ],
    },
    stage: 2, members: 9, activity: 60,
    chart: { x: 1096, y: 423, scale: 1.02 },
  },
  {
    id: 50, atlasN: 908, slug: "end-to-end-advantage-accounting-reckoning",
    title: { zh: "端到端优势核算：数据装载瓶颈的清算", en: "End-to-End Advantage Accounting: Reckoning with the Data-Loading Bottleneck" },
    qfocus: { zh: "量子算法算上数据装载的账,还能剩下多少真优势?", en: "Once data loading is counted into the ledger, how much real quantum advantage survives?" },
    domain: "物质",
    cluster: { code: "C15", zh: "应用量子科学", en: "Applied quantum science" },
    scores: [4, 3, 4, 1, 3, 2, 3, 4, 5],
    citation: { url: "https://arxiv.org/pdf/2310.03011", title: "Quantum algorithms: A survey of applications and end-to-end complexities", venue: "arXiv 2310.03011", year: 2024 },
    brief: { zh: "把 QRAM/态制备的装载成本计入全流程后,对数级量子加速常被近线性装载成本吞没,逼出'优势预算表'式全栈核算。", en: "Once the loading cost of QRAM or state preparation is counted across the full pipeline, logarithmic quantum speedups are often swallowed by near-linear loading cost, forcing a full-stack 'advantage budget sheet' accounting." },
    depth: {
      overview: { zh: "许多量子加速的证明默认数据已经躺在量子寄存器里;一旦把经典数据装载、态制备与读出计入端到端流程,对数级的渐近优势往往被近线性的装载成本吞没。这个方向把'优势'从渐近内核拉回端到端,逼问哪些问题在算上输入输出后仍真正更快,把量子-经典混合算法从渐近神话拉回工程现实。", en: "Many proofs of quantum speedup assume the data is already sitting in the quantum register; once classical data loading, state preparation, and readout are counted across the end-to-end pipeline, a logarithmic asymptotic advantage is often swallowed by near-linear loading cost. This line drags 'advantage' back from the asymptotic core to the end-to-end pipeline, asking which problems are genuinely faster once input/output is counted, pulling hybrid quantum-classical algorithms back from asymptotic myth to engineering reality." },
      whyMatters: { zh: "最硬的张力是廉价、可被动扩展的 QRAM 在现有方案下不太可能造出来,而电路型 QRAM 又把成本算了回来——相当一部分基于 QRAM 的加速承诺可能在落地前悄悄蒸发,但目前缺乏统一的全栈核算标准来判定哪些能幸存。", en: "The hardest tension is that cheap, passively scalable QRAM looks unlikely to be buildable under current proposals, while circuit-based QRAM brings the cost right back — a good share of QRAM-based speedup promises may quietly evaporate before reaching practice, yet there is still no unified full-stack accounting standard for judging which ones survive." },
      ifAnswered: { zh: "走向'优势预算表':每个混合算法附带 I/O、态制备与读出的全栈资源核算,像编译器报告一样标准化,把'何处真有优势'变成可核算的命题。", en: "It heads toward an 'advantage budget sheet': every hybrid algorithm ships a full-stack I/O, state-prep, and readout accounting standardized like a compiler report, turning 'where is there real advantage' into an auditable claim." },
      approaches: [
        { zh: "把数据装载、态制备、读出全部计入渐近复杂度分析(Dalzell 等, arXiv:2310.03011)", en: "Counting data loading, state preparation, and readout into the asymptotic-complexity analysis (Dalzell et al., arXiv:2310.03011)" },
        { zh: "2024–2025 年 QRAM 综述论证廉价可扩展 QRAM 在现有提案下难以实现", en: "2024-2025 QRAM surveys arguing that cheap, passively scalable QRAM is unlikely to be realizable under current proposals" },
        { zh: "把控制硬件与经典并行成本计入,重新核算依赖 QRAM 的加速幅度", en: "Recomputing QRAM-dependent speedups after counting control-hardware and classical-parallelism cost" },
      ],
      barrier: { zh: "被动可扩展 QRAM 在现有方案下看起来不太可能造出来,电路型 QRAM 又把成本算了回来,缺统一全栈核算标准判定哪些优势能幸存。", en: "Passively scalable QRAM looks unlikely to be buildable under current proposals, and circuit-based QRAM brings the cost right back, while a unified full-stack accounting standard for judging which advantages survive is still missing." },
      subQuestions: [
        { zh: "有没有哪类问题,即便算上装载成本,NISQ 硬件仍能给出经典难复现的真实优势?", en: "Is there any problem class where, even counting loading cost, NISQ hardware still delivers a real advantage classical computers cannot efficiently replicate?" },
        { zh: "纠缠等非局域资源能否从原理上绕开经典数据装载的线性瓶颈,而不只是把成本转移?", en: "Can nonlocal resources like entanglement fundamentally bypass the linear bottleneck of classical data loading, rather than merely relocating the cost?" },
        { zh: "除了'数据天然是量子的'或高度结构化这两种窄缝,是否存在第三类真实优势场景?", en: "Beyond the narrow slits of 'data that is natively quantum' or highly structured, does a third class of genuine advantage scenario exist?" },
        { zh: "全栈资源核算标准化后,当前宣称的加速里有多大比例会被重新判定为无优势?", en: "Once full-stack resource accounting is standardized, what fraction of currently claimed speedups will be reclassified as offering no advantage?" },
      ],
    },
    stage: 2, members: 10, activity: 54,
    chart: { x: 1198, y: 410, scale: 1.01 },
  },
  {
    id: 51, atlasN: 1413, slug: "cable-bacteria-conductive-nanoribbons",
    title: { zh: "电缆菌导电纳米带：生物合成的金属有机框架导线", en: "Cable Bacteria Conductive Nanoribbons: Biologically Grown Metal-Organic-Framework Wires" },
    qfocus: { zh: "泥里的细菌,是否已经长出了人类实验室造不出的导线?", en: "Has a mud-dwelling bacterium already grown a wire human labs cannot yet build?" },
    domain: "物质",
    cluster: { code: "C12", zh: "生物电子·生物能源", en: "Bioelectronics · bioenergy" },
    scores: [4, 5, 4, 3, 3, 3, 4, 3, 5],
    citation: { url: "https://www.biorxiv.org/content/10.1101/2025.10.10.681601v1", title: "A hierarchical nickel organic framework confers high conductivity over long distances in cable bacteria", venue: "bioRxiv", year: 2025 },
    brief: { zh: "电缆菌周质纤维的内核被解出为镍-双硫烯(NiBiD)一维纳米带——已知第一例生物合成金属有机框架,导电率达半金属量级。", en: "The core of cable-bacteria periplasmic fibers has been resolved as a one-dimensional nickel-bis(dithiolene) (NiBiD) nanoribbon — the first known biosynthesized metal-organic framework, with semi-metal-level conductivity." },
    depth: {
      overview: { zh: "电缆菌(Candidatus Electrothrix/Electronema)能沿单条厘米长的多细胞丝把电子近乎无损地传导数厘米;2025 年研究揭示其周质导电纤维的内核是镍-双硫烯重复单元堆叠成的一维纳米带,导电率达半金属量级、几乎不受湿度与离子干扰,把'生命能不能当导体'从比喻变成可测量的材料问题。", en: "Cable bacteria (Candidatus Electrothrix/Electronema) shuttle electrons almost losslessly along single centimeter-long multicellular filaments; 2025 work resolved the core of their periplasmic conductive fibers as one-dimensional nanoribbons of stacked nickel-bis(dithiolene) units, with semi-metal-level conductivity largely unaffected by humidity or ions, turning 'can life act as a conductor' from metaphor into a measurable materials-science question." },
      whyMatters: { zh: "最硬的张力在结构-机制闭环:导电率数据(2–564 S/cm)、冷冻电镜结构与 NiBiD 模型至今尚未完全对齐,长程传导究竟靠跳跃、隧穿还是能带仍无定论。", en: "The hardest tension lies in closing the structure-mechanism loop: conductivity data (2-564 S/cm), cryo-EM structure, and the NiBiD model have not yet been fully reconciled, and whether long-range conduction proceeds by hopping, tunneling, or band transport remains unresolved." },
      ifAnswered: { zh: "若能把这套镍-有机骨架的生物合成路线搬到工程宿主或体外,就可能长出可持续、柔性、常温自组装的有机电子导线材料。", en: "If the biosynthetic route to this nickel-organic scaffold can be ported to engineered hosts or grown in vitro, it could yield sustainable, flexible, room-temperature self-assembled organic-electronic wiring." },
      approaches: [
        { zh: "冷冻电镜解析周质纤维结构,比对 NiBiD 配位单元堆叠模型", en: "Cryo-EM resolution of periplasmic fiber structure, checked against the stacked NiBiD coordination-unit model" },
        { zh: "电学表征测定纤维导电率(中值约 27 S/cm)与氧化还原/湿度响应", en: "Electrical characterization measuring fiber conductivity (median ~27 S/cm) and its redox/humidity response" },
        { zh: "对比人工镍有机类似物,量化生物合成纳米带的导电率优势(约百倍)", en: "Benchmarking against synthetic nickel-organic analogues to quantify the ~100-fold conductivity edge of the biosynthesized nanoribbon" },
      ],
      barrier: { zh: "导电率数据、冷冻电镜结构与 NiBiD 模型尚未完全对齐,细胞如何逐段合成这套镍骨架、能否离体重构,仍是空白。", en: "Conductivity data, cryo-EM structure, and the NiBiD model are not yet fully reconciled, and how the cell synthesizes this nickel scaffold segment by segment, or whether it can be reconstructed in vitro, remains unknown." },
      subQuestions: [
        { zh: "NiBiD 纳米带的长程电子传导,靠的是跳跃、隧穿还是能带机制?", en: "Does long-range electron conduction in the NiBiD nanoribbon proceed by hopping, tunneling, or band transport?" },
        { zh: "细胞如何逐段合成这套镍-有机骨架,该过程能否在体外被重构?", en: "How does the cell synthesize this nickel-organic scaffold segment by segment, and can the process be reconstructed in vitro?" },
        { zh: "把电缆菌的镍-有机导线嫁接进工程宿主,能否实现无损、稳定的生物-电子耦合?", en: "Could grafting the cable-bacteria nickel-organic wire into an engineered host achieve a lossless, stable bio-electronic coupling?" },
        { zh: "常温自组装的生物导线材料,能否兼具工程所需的可靠性与可预测性?", en: "Can a room-temperature, self-assembling bio-wire material achieve the reliability and predictability engineering requires?" },
      ],
    },
    stage: 2, members: 9, activity: 56,
    chart: { x: 1298, y: 428, scale: 1.01 },
  },
  {
    id: 52, atlasN: 593, slug: "hyperuniformity-hidden-order-disorder",
    title: { zh: "超均匀性：无序中的隐藏秩序", en: "Hyperuniformity: Hidden Order in Disorder" },
    qfocus: { zh: "玻璃、视网膜与素数,是否共享同一种压制涨落的隐藏秩序?", en: "Do glass, the retina, and prime numbers share the same hidden order that suppresses fluctuation?" },
    domain: "物质",
    cluster: { code: "C16", zh: "可编程物质·超材料", en: "Programmable matter · metamaterials" },
    scores: [4, 5, 3, 2, 4, 3, 2, 4, 5],
    citation: { url: "https://www.sciencedirect.com/science/article/abs/pii/S037015731830036X", title: "Hyperuniform states of matter", venue: "Physics Reports", year: 2018 },
    brief: { zh: "超均匀性指结构因子在长波极限趋于零的一类隐藏结构,已从玻璃、视网膜锥细胞镶嵌延伸到素数分布,并转化为各向同性光子带隙的设计原理。", en: "Hyperuniformity — a structure whose structure factor vanishes in the long-wavelength limit — spans glass, the retinal cone mosaic, and prime-number distributions, and has already become a design principle for isotropic photonic band gaps." },
    depth: {
      overview: { zh: "超均匀性指一类'像晶体一样压制长程密度涨落、却在局部仍无序'的隐藏结构:玻璃、鸟类视网膜锥细胞镶嵌、某些素数分布与人工超材料竟共享同一种特征。它是横跨凝聚态物理、生物物理与数论的稀见真交叉普适律,并已转化为设计原理——无序超均匀材料能拥有晶体做不到的各向同性光子带隙。", en: "Hyperuniformity denotes a class of hidden structure that suppresses long-range density fluctuations like a crystal yet stays locally disordered: glass, the avian retinal cone mosaic, certain prime-number distributions, and engineered metamaterials share this same signature. It is a rare genuinely cross-domain universal law spanning condensed-matter physics, biophysics, and number theory, and has already become a design principle — disordered hyperuniform materials can achieve isotropic photonic band gaps that crystals cannot." },
      whyMatters: { zh: "横跨物质-生物-数论的稀见真交叉普适律固然罕见,但超均匀性在这些天差地别的系统里是否真为同一种生成机制、还是仅是结构因子层面的表象巧合,仍待厘清。", en: "A genuine cross-domain universal law spanning matter, biology, and number theory is rare enough on its own, but whether hyperuniformity across these vastly different systems is truly one generative mechanism or merely a coincidence at the level of the structure factor remains to be clarified." },
      ifAnswered: { zh: "超均匀性有望成为跨物质-生物-数论的统一设计与诊断原理,把'无序中的秩序'变成一把通用的设计标尺。", en: "Hyperuniformity could become a unified design and diagnostic principle across matter, biology, and number theory, turning 'order in disorder' into a general-purpose design yardstick." },
      approaches: [
        { zh: "以结构因子在长波极限趋于零为判据,识别跨系统的超均匀信号", en: "Using the vanishing long-wavelength structure factor as the diagnostic criterion to identify hyperuniform signatures across systems" },
        { zh: "设计无序超均匀材料,做出晶体无法实现的各向同性光子带隙器件", en: "Designing disordered hyperuniform materials to build isotropic photonic band-gap devices that crystals cannot achieve" },
        { zh: "在鸟类视网膜锥细胞镶嵌与素数分布中比对同一超均匀特征", en: "Cross-checking the same hyperuniform signature in the avian retinal cone mosaic and in prime-number distributions" },
      ],
      barrier: { zh: "超均匀是否真为统一机制、还是不同系统间结构因子层面的表象巧合,仍待厘清。", en: "Whether hyperuniformity is truly a unifying mechanism, or merely a superficial coincidence at the structure-factor level across different systems, remains to be clarified." },
      subQuestions: [
        { zh: "超均匀性是否真为跨系统的同一生成机制,还是结构因子层面的巧合?", en: "Is hyperuniformity truly the same generative mechanism across systems, or a coincidence at the level of the structure factor?" },
        { zh: "给定想要的光学/力学响应,是否总能找到实现它的超均匀微结构?", en: "Given a desired optical or mechanical response, can a hyperuniform microstructure realizing it always be found?" },
        { zh: "无序超均匀结构与生物体内的镶嵌模式,是否共享同一套局部生成规则?", en: "Do disordered hyperuniform structures and biological mosaic patterns share the same local generative rules?" },
        { zh: "超均匀材料的各向同性带隙,其损耗与可控性的极限在哪里?", en: "What are the limits on loss and controllability for the isotropic band gap of hyperuniform materials?" },
      ],
    },
    stage: 2, members: 9, activity: 59,
    chart: { x: 1019, y: 502, scale: 1.02 },
  },

  // ── 生命 Life ───────────────────────────────────────────────────────────
  {
    id: 14, atlasN: 1479, slug: "miyake-anchors",
    title: { zh: "Miyake 事件深时定年", en: "Miyake Events as Deep-Time Anchors" },
    qfocus: { zh: "极端太阳风暴能否为任意档案盖一个「单年时间戳」？", en: "Can extreme solar storms stamp a single-year timestamp on any archive?" },
    domain: "生命",
    cluster: { code: "C29", zh: "地球·海洋·深时科学", en: "Earth · ocean · deep-time science" },
    scores: [5, 5, 5, 2, 4, 4, 4, 3, 5],
    citation: { url: "https://doi.org/10.1029/2025RG000902", title: "Evolution of Terrestrial Planetary Bodies", venue: "Reviews of Geophysics", year: 2025 },
    brief: { zh: "极端太阳风暴在某年全球同步灌碳-14 进树轮/冰芯，成跨学科绝对年代锚。", en: "Extreme solar storms flood a single year with C-14 worldwide; a cross-disciplinary absolute-dating anchor." },
    depth: {
      overview: { zh: "一次极端太阳风暴会在某一年同步地把碳-14（及铍-10）灌进全球的树轮、冰芯与沉积物，形成一个可在任意档案中对齐的「单年时间戳」。2012年Fusa Miyake在日本雪松年轮中发现公元774/775年的碳-14骤增，此后「Miyake事件」成为绝对定年的宇宙时间戳，让太阳物理学、树轮学、地质年代学与考古学共用同一把尺子——例如维京人L'Anse aux Meadows的木材已被精确定到公元1021年。", en: "An extreme solar storm floods a single year's tree rings, ice cores, and sediments worldwide with carbon-14 (and beryllium-10) simultaneously, creating a single-year timestamp alignable across any archive. In 2012 Fusa Miyake discovered a carbon-14 surge dated to AD 774/775 in Japanese cedar tree rings, and 'Miyake events' have since become an absolute-dating cosmic timestamp shared by heliophysics, dendrochronology, geochronology, and archaeology — Viking wood from L'Anse aux Meadows, for instance, has been pinned precisely to AD 1021." },
      whyMatters: { zh: "最硬的难点是档案会不会「说谎」：树木碳分配延迟、沉积扰动与测量精度会模糊单年信号，而目前已确证的事件仍只有个位数，目录太稀薄，普适定年就撑不起来。", en: "The hardest difficulty is whether the archive 'lies': tree carbon-allocation delay, sediment disturbance, and measurement precision can blur the single-year signal, and confirmed events still number only in the single digits — too sparse a catalogue for universal dating to hold up." },
      ifAnswered: { zh: "若目录持续扩充并解决档案保真度问题，一份不断增长的Miyake事件清单将成为横跨考古、气候与地质档案的通用对齐标尺，并为「极端太阳风暴威胁」提供古档案证据。", en: "If the catalogue keeps growing and archive-fidelity issues are resolved, a growing list of Miyake events would become a universal alignment ruler across archaeological, climate, and geological archives, and give the 'extreme solar storm threat' its first paleo-archive evidence." },
      approaches: [
        { zh: "在树轮中测量碳-14骤增，寻找全球同步的单年异常信号", en: "Measuring carbon-14 surges in tree rings to find globally synchronous single-year anomaly signals" },
        { zh: "用冰芯中的铍-10异常与碳-14信号交叉验证，确认事件的真实性与强度", en: "Cross-validating with beryllium-10 anomalies in ice cores against the carbon-14 signal to confirm an event's authenticity and strength" },
        { zh: "把已确证的单年时间戳应用到考古木材等档案上，实现具体年份级别的定年", en: "Applying confirmed single-year timestamps to archives such as archaeological wood, achieving dating precision down to a specific year" },
      ],
      barrier: { zh: "树木碳分配延迟、沉积扰动与测量精度会模糊单年信号，而已确证事件仍只有个位数，目录太稀薄难以支撑普适定年。", en: "Tree carbon-allocation delay, sediment disturbance, and measurement precision blur the single-year signal, and confirmed events still number only in the single digits — too sparse a catalogue to support universal dating." },
      subQuestions: [
        { zh: "现有的个位数确证事件能否通过扩大树轮与冰芯采样，系统性地扩充为更密的事件目录？", en: "Can the current single-digit count of confirmed events be systematically expanded into a denser catalogue through broader tree-ring and ice-core sampling?" },
        { zh: "树木碳分配延迟与沉积扰动造成的信号模糊，是否有可独立验证的方法加以区分和校正？", en: "Is there an independently verifiable method to distinguish and correct for the signal blurring caused by tree carbon-allocation delay and sediment disturbance?" },
        { zh: "约14300 cal BP这类迄今最强事件，能否帮助反推极端太阳风暴的重现周期，从而评估现代社会的风险？", en: "Can the strongest known event, at roughly 14,300 cal BP, help back out the recurrence interval of extreme solar storms and so gauge the risk to modern society?" },
      ],
    },
    stage: 3, members: 16, activity: 82,
    chart: { x: 620, y: 300, scale: 1.05 },
  },
  {
    id: 15, atlasN: 1349, slug: "code-dark-matter",
    title: { zh: "遗传密码暗物质", en: "Recoded Genetic-Code Dark Matter" },
    qfocus: { zh: "基因组暗物质里藏着多少被标准注释器误读的生命？", en: "How much life in genomic dark matter do standard annotators misread?" },
    domain: "生命",
    cluster: { code: "C37", zh: "生物暗物质·未注释生命", en: "Biological dark matter & unannotated life" },
    scores: [4, 5, 4, 5, 4, 5, 3, 4, 5],
    citation: { url: "https://doi.org/10.1038/s41586-023-06583-7", title: "Unraveling the functional dark matter through global metagenomics", venue: "Nature", year: 2023 },
    brief: { zh: "重编码噬菌体把终止密码子重指派，标准预测器系统性地把其基因读成碎片。", en: "Recoded phages reassign stop codons; standard callers systematically shred their genes." },
    depth: {
      overview: { zh: "大量未培养噬菌体与微生物（如Crassvirales、Lak噬菌体）把终止密码子（TAG/TGA）重新指派为氨基酸，标准基因预测器因此在其基因中间「读到假终止」，把完整基因组系统性地切成碎片。识别这种重编码并按正确密码表重新注释，是测绘基因组暗物质中一块被长期忽视的洼地。", en: "Many uncultured phages and microbes (e.g., Crassvirales, Lak phages) reassign stop codons (TAG/TGA) to amino acids, so standard gene-callers hit 'false stops' mid-gene and systematically shred complete genomes into fragments. Detecting this recoding and re-annotating genomes under the correct code table is a long-overlooked lowland in mapping genomic dark matter." },
      whyMatters: { zh: "重编码识别高度依赖统计信号与足够的测序深度，短片段、低丰度的暗类群极易被漏判或误判，而「这段究竟改了密码，还是本来就断了」往往缺乏独立实验判据。", en: "Recoding detection depends heavily on statistical signal and sufficient sequencing depth; short fragments and low-abundance dark taxa are easily missed or misjudged, and whether a given segment truly recoded or was simply broken often lacks an independent experimental criterion." },
      ifAnswered: { zh: "随着重编码预测工具成熟，宏基因组注释正从「假设通用密码」转向「先判密码表再读基因」，有望重新点亮跨5.6万亿碱基、逾1700份环境样本中大量此前被丢弃的暗ORF。", en: "As recoding-prediction tools mature, metagenomic annotation is shifting from assuming the universal code to inferring the code table first and then calling genes, potentially re-illuminating vast previously discarded dark ORFs across the 5.6-trillion-base-pair, 1,700-plus-sample scan." },
      approaches: [
        { zh: "用统计信号检测基因中间异常密集的「假终止」，推断该片段可能发生了密码子重编码", en: "Detecting statistically anomalous clusters of 'false stops' mid-gene as a signal that a segment may have undergone codon recoding" },
        { zh: "开发重编码感知的基因预测工具（如「Driving through stop signs」），按推断出的正确密码表重新调用基因", en: "Developing recoding-aware gene-prediction tools (e.g. 'Driving through stop signs') that re-call genes under the inferred correct code table" },
        { zh: "在跨5.6万亿碱基的宏基因组尺度上系统扫描重编码事件，而非逐个类群人工核查", en: "Systematically scanning for recoding events at the scale of a 5.6-trillion-base-pair metagenome, rather than manually checking taxon by taxon" },
      ],
      barrier: { zh: "短片段、低丰度的暗类群极易在重编码判定中被漏判或误判，而「改了密码」与「本来就断了」往往缺乏独立实验判据加以区分。", en: "Short fragments and low-abundance dark taxa are easily missed or misjudged in recoding calls, and 'this segment recoded' versus 'this segment was simply broken' often lacks an independent experimental criterion to tell apart." },
      subQuestions: [
        { zh: "能否为「密码子重编码」找到独立于统计信号的实验判据，而不仅依赖测序深度和碎片长度？", en: "Can an experimental criterion for codon recoding, independent of statistical signal, be found rather than relying solely on sequencing depth and fragment length?" },
        { zh: "重编码感知的注释工具能否推广到Crassvirales、Lak噬菌体之外更广泛的未培养类群？", en: "Can recoding-aware annotation tools be generalized beyond Crassvirales and Lak phages to a broader range of uncultured taxa?" },
        { zh: "终止密码子重编码是否在裂解基因翻译调控中普遍扮演功能性角色，而不只是密码表的偶然漂变？", en: "Does stop-codon recoding commonly play a functional role in regulating lysis-gene translation, rather than being an incidental drift in the code table?" },
      ],
    },
    stage: 2, members: 8, activity: 64,
    chart: { x: 740, y: 250, scale: 0.8 },
  },
  {
    id: 16, atlasN: 872, slug: "adar-sensors",
    title: { zh: "ADAR RNA 传感器件", en: "ADAR-Recruiting RNA Sensors" },
    qfocus: { zh: "一条 RNA 能否做成只在特定细胞里产出蛋白的「传感器」？", en: "Can one RNA become a sensor producing protein only in specific cells?" },
    domain: "生命",
    cluster: { code: "C52", zh: "RNA·表观与可编程医学", en: "RNA · epigenetic & programmable medicine" },
    scores: [5, 5, 4, 3, 4, 4, 3, 4, 4],
    citation: { url: "https://www.cell.com/molecular-therapy-family/molecular-therapy/fulltext/S1525-0016(25)00721-X", title: "Epigenome editing based treatment", venue: "Molecular Therapy", year: 2025 },
    brief: { zh: "RADARS 把 RNA 做成传感器，杂交后招募内源 ADAR 编辑终止密码子放行下游蛋白。", en: "RADARS turn RNA into a sensor; hybridization recruits endogenous ADAR to edit a stop codon and green-light a payload." },
    depth: {
      overview: { zh: "RADARS/CellREADR把一条RNA做成「传感器」：其5′感应区与目标细胞的RNA互补，杂交后招募细胞内源的ADAR酶，把感应区内一个框内终止密码子从A编辑成I（即STOP改读为Trp），从而只在表达特定标志RNA的细胞里放行下游效应蛋白的翻译。这是一种完全由内源酶驱动、无需外源蛋白的活细胞逻辑器件，三个独立团队（RADARS、RADAR、CellREADR）几乎同时给出了这一原理。", en: "RADAR/RADARS/CellREADR turn a single RNA into a sensor: a 5′ sensing region complementary to a target cell's RNA recruits endogenous ADAR upon hybridization, editing an in-frame stop codon from A to I — recoding STOP to Trp — and so releasing translation of a downstream effector protein only in cells expressing the marker RNA. It is a living-cell logic device driven entirely by an endogenous enzyme, requiring no foreign protein; three independent teams (RADARS, RADAR, CellREADR) arrived at the principle almost simultaneously." },
      whyMatters: { zh: "招募内源ADAR的全部吸引力在于不引入外源蛋白、可逆、低免疫原性，但只要旁观（bystander）的A→I编辑无法被压到零，每一个被错改的碱基就是一次未受控的蛋白质组扰动，这道题决定了该路线能否进入临床。", en: "The entire appeal of recruiting endogenous ADAR is no foreign protein, reversibility, and low immunogenicity — but as long as bystander A-to-I editing cannot be driven to zero, every mis-edited base is an uncontrolled proteome perturbation, and this question decides whether the route reaches the clinic." },
      ifAnswered: { zh: "若能把感应特异性与编辑效率的工程化难题解决，合成mRNA即可携带该器件，指向「智能mRNA医学」：例如CAR-T只在肿瘤微环境中产出、治疗蛋白按细胞RNA指纹定点表达，该原理已在人脑皮层离体组织中靶向特定神经元类型得到验证。", en: "If the engineering challenges of sensing specificity and editing efficiency are solved, this device — carriable on synthetic mRNA — points toward 'smart mRNA medicine': CAR-T expressed only in the tumor microenvironment, therapeutic proteins gated by a cell's RNA fingerprint, a principle already validated by targeting specific neuron types in ex vivo human cortical tissue." },
      approaches: [
        { zh: "设计5′感应区与目标细胞RNA碱基互补，杂交形成dsRNA以招募内源ADAR", en: "Designing a 5′ sensing region base-complementary to the target cell's RNA, forming dsRNA upon hybridization to recruit endogenous ADAR" },
        { zh: "把框内终止密码子改造为ADAR的编辑靶点，编辑后STOP变为Trp从而放行翻译", en: "Engineering an in-frame stop codon as ADAR's editing target, so that editing converts STOP to Trp and releases translation" },
        { zh: "用合成mRNA递送整个传感-效应器件，使其成为条件性治疗蛋白的「细胞类型开关」", en: "Delivering the entire sensor-actuator device on synthetic mRNA, making it a cell-type switch for conditional therapeutic protein expression" },
      ],
      barrier: { zh: "sesRNA的设计规则尚不成熟、常需逐一筛选，内源ADAR水平随细胞类型波动带来背景泄漏与假阳性，体内可达性与免疫原性也未充分解决。", en: "sesRNA design rules remain immature and often require individual screening; endogenous ADAR levels fluctuate by cell type, causing background leakage and false positives, and in vivo deliverability and immunogenicity are not yet fully resolved." },
      subQuestions: [
        { zh: "旁观位点的脱靶A→I编辑，究竟是感应RNA设计可修缮的缺陷，还是招募内源ADAR这件事本身无法分离的固有代价？", en: "Is bystander off-target A-to-I editing a fixable flaw of sensing-RNA design, or an intrinsic cost inseparable from recruiting endogenous ADAR itself?" },
        { zh: "内源ADAR水平随细胞类型波动导致的背景泄漏，能否通过感应区序列优化系统性压低？", en: "Can the background leakage caused by cell-type-dependent fluctuation in endogenous ADAR levels be systematically suppressed through sensing-region sequence optimization?" },
        { zh: "sesRNA的设计规则能否从逐一筛选走向可预测的通用设计法则？", en: "Can sesRNA design rules move from case-by-case screening to a predictable, general design principle?" },
        { zh: "该器件能否在体内（而不只是离体组织）保持足够的可达性与低免疫原性？", en: "Can the device retain sufficient deliverability and low immunogenicity in vivo, not just in ex vivo tissue?" },
      ],
    },
    stage: 2, members: 7, activity: 60,
    chart: { x: 688, y: 398, scale: 0.9 },
  },
  {
    id: 17, atlasN: 1376, slug: "active-inference",
    title: { zh: "主动推断工程化", en: "Active Inference as Engineering" },
    qfocus: { zh: "自由能原理能否从解释大脑迁移为可落地的机器人设计学？", en: "Can the free-energy principle migrate from explaining brains to engineering robots?" },
    domain: "生命",
    cluster: { code: "C11", zh: "神经技术·计算认知", en: "Neurotechnology · computational cognition" },
    scores: [5, 5, 4, 4, 4, 4, 3, 3, 4],
    citation: { url: "https://doi.org/10.1016/j.conb.2021.10.010", title: "Neural population geometry", venue: "Current Opinion in Neurobiology", year: 2021 },
    brief: { zh: "用一个生成模型同时驱动感知与行动，最小化变分自由能而非最大化外部奖励。", en: "A single generative model drives perception and action; minimize variational free energy, not external reward." },
    depth: {
      overview: { zh: "主动推断把源自理论神经科学、用于解释大脑的自由能原理（FEP），迁移为一套可落地的工程方法：用同一个生成模型同时驱动感知与行动，智能体通过最小化变分自由能来规划，而非最大化外部奖励。RxInfer等反应式消息传递工具让这套原理变得可编程、可运行。", en: "Active inference migrates the Free Energy Principle (FEP), born in theoretical neuroscience as a framework for explaining brains, into a concrete engineering method: a single generative model drives perception and action together, and the agent plans by minimizing variational free energy rather than maximizing an external reward — made programmable and runnable by reactive message-passing tools like RxInfer." },
      whyMatters: { zh: "最硬的张力在落地兑现：理论极其优雅统一，但真实机器人上规模化的胜绩仍稀少，消息传递的计算与建模门槛也高，它到底是通用工程范式还是漂亮但难扩展的形式化，尚未定论。", en: "The hardest tension is in real-world delivery: the theory is remarkably elegant and unified, yet scaled wins on real robots remain scarce and the computational and modeling threshold for message passing is high — whether it is a general engineering paradigm or a beautiful but hard-to-scale formalism is still undetermined." },
      ifAnswered: { zh: "若能在资源受限的真实机器人上跑通，主动推断可能成为强化学习之外的第二条自治体设计主线，自带探索能力与不确定性处理机制。", en: "If it can be made to work on resource-constrained real robots, active inference could become a second mainline for designing autonomous agents alongside reinforcement learning, with exploration and uncertainty-handling built in." },
      approaches: [
        { zh: "用单一生成模型同时驱动感知与行动，而非分离的感知模块与控制模块", en: "Using a single generative model to drive perception and action together, rather than separate perception and control modules" },
        { zh: "智能体通过最小化变分自由能来规划行动，替代最大化外部奖励的强化学习范式", en: "Having the agent plan by minimizing variational free energy, replacing the reward-maximization paradigm of reinforcement learning" },
        { zh: "用RxInfer.jl等反应式消息传递工具把「生成模型即智能体」变成可编程运行的系统", en: "Using reactive message-passing tools like RxInfer.jl to turn the generative-model-as-agent into a programmable, runnable system" },
      ],
      barrier: { zh: "理论极其优雅统一，但真实机器人上的规模化胜绩仍稀少，消息传递的计算与建模门槛偏高。", en: "The theory is remarkably elegant and unified, but scaled wins on real robots remain scarce, and the computational and modeling threshold for message passing is relatively high." },
      subQuestions: [
        { zh: "主动推断能否在资源受限的真实机器人上，复现其在仿真环境中展示的规划与探索优势？", en: "Can active inference reproduce, on resource-constrained real robots, the planning and exploration advantages it demonstrates in simulation?" },
        { zh: "反应式消息传递的计算开销能否降到与强化学习相当的水平，而不牺牲生成模型的表达能力？", en: "Can the computational overhead of reactive message passing be brought down to a level comparable with reinforcement learning without sacrificing the generative model's expressive power?" },
        { zh: "在同一任务上，最小化自由能与最大化奖励这两条设计主线的实际表现该如何公平比较？", en: "On the same task, how should the two design mainlines — minimizing free energy versus maximizing reward — be fairly compared in practice?" },
      ],
    },
    stage: 2, members: 6, activity: 49,
    chart: { x: 556, y: 428, scale: 0.8 },
  },
  {
    id: 18, atlasN: 1, slug: "minimal-genome",
    title: { zh: "最小基因组与人工细胞", en: "Minimal Genomes & Artificial Cells" },
    qfocus: { zh: "生命最少需要什么？我们能不能从零造出活的东西？", en: "What is the minimum life needs — and can we build something alive from scratch?" },
    domain: "生命",
    cluster: { code: "C01", zh: "合成生物·工程生命", en: "Synthetic biology · engineering life" },
    scores: [5, 4, 3, 2, 3, 1, 3, 2, 4],
    citation: { url: "https://doi.org/10.1126/science.aad6253", title: "Design and synthesis of a minimal bacterial genome", venue: "Science", year: 2016 },
    brief: { zh: "删到最少基因逼近「生命的最小定义」，再自下而上重造细胞。", en: "Strip genes to the minimum, approaching a minimal definition of life, then rebuild cells bottom-up." },
    depth: {
      overview: { zh: "通过系统性敲除非必需基因，把一个活细胞的基因组缩减到维持自主增殖所需的极限——JCVI-syn3.0采用自上而下策略，用全局转座子（Tn5）诱变逐一标定支原体中的必需基因，最终仅保留约473个基因，再经酵母组装与基因组移植重建出可自主增殖的细胞。它把「生命所需的最小指令集」从哲学思辨变成可测量的工程基线。", en: "By systematically knocking out nonessential genes, a living cell's genome is reduced to the limit needed to sustain autonomous proliferation — JCVI-syn3.0 used a top-down strategy, global Tn5 transposon mutagenesis to map Mycoplasma's essential genes one by one, arriving at just ~473 genes, then rebuilt a self-replicating cell via yeast assembly and genome transplantation. It turns the minimal instruction set for life from philosophical speculation into a measurable engineering baseline." },
      whyMatters: { zh: "最硬的一点是约三分之一（近150个）必需基因的功能至今未知，syn3A还得补回若干基因才能恢复正常的分裂形态——能造出不等于真懂，可定制底盘的承诺与「黑箱生命」的现实之间仍有鸿沟。", en: "The hardest point is that roughly one-third (nearly 150) of the essential genes still have unknown function, and syn3A had to add several genes back just to restore normal division morphology — building it is not the same as understanding it, and a gulf still separates the promise of customizable chassis cells from the reality of 'black-box life.'" },
      ifAnswered: { zh: "若能补齐这未知的三分之一功能，合成生物学将从试错拼装升级为从第一性原理设计活体，可定制的最小底盘细胞有望成为通用平台。", en: "If the unknown third of gene functions can be filled in, synthetic biology would upgrade from trial-and-error assembly to first-principles design of living systems, and customizable minimal chassis cells could become a universal platform." },
      approaches: [
        { zh: "用全局转座子（Tn5）诱变逐一标定支原体基因组中的必需基因", en: "Using global Tn5 transposon mutagenesis to map essential genes one by one across the Mycoplasma genome" },
        { zh: "自上而下持续删减非必需基因，直到逼近维持自主增殖的最小极限", en: "Continuously deleting nonessential genes top-down until approaching the minimal limit needed for autonomous proliferation" },
        { zh: "通过酵母组装与基因组移植，把设计好的最小基因组重建为可自主增殖的活细胞", en: "Rebuilding the designed minimal genome into a self-replicating living cell via yeast assembly and genome transplantation" },
      ],
      barrier: { zh: "约三分之一（近150个）必需基因的功能至今未知，能造出最小基因组不等于真正理解它，可定制底盘的承诺与「黑箱生命」的现实之间仍有鸿沟。", en: "About a third (nearly 150) of the essential genes still have unknown function — building the minimal genome is not the same as truly understanding it, and a gulf still separates the promise of customizable chassis cells from the reality of black-box life." },
      subQuestions: [
        { zh: "最小基因组里约三分之一功能未知的基因，是否定义了「生命的最小逻辑」，还是仅仅反映了我们知识的空白？", en: "Do the roughly one-third of genes with unknown function in the minimal genome define an irreducible logic of life, or do they merely reflect a gap in our knowledge?" },
        { zh: "能否造出用人工碱基对或镜像手性构建的「正交生命」，使其在生化上与所有天然生命不可互通？", en: "Can we build orthogonal life using artificial base pairs or mirror chirality, biochemically incompatible with all natural life?" },
        { zh: "syn3A为恢复正常分裂形态而补回的基因，揭示的是最小基因组理论的局限，还是分裂机制本身尚未被理解的复杂性？", en: "Do the genes syn3A had to add back to restore normal division morphology reveal a limit of minimal-genome theory, or an as-yet-unexplained complexity in the division machinery itself?" },
      ],
    },
    stage: 2, members: 8, activity: 58,
    chart: { x: 835, y: 338, scale: 0.9 },
  },
  {
    id: 19, atlasN: 7, slug: "genome-writing",
    title: { zh: "合成基因组写入", en: "Synthetic Genome Writing" },
    qfocus: { zh: "从「读」DNA 走向「写」整条基因组——工程生命的尺度边界在哪？", en: "From reading DNA to writing whole genomes — where is the scale limit of engineering life?" },
    domain: "生命",
    cluster: { code: "C01", zh: "合成生物·工程生命", en: "Synthetic biology · engineering life" },
    scores: [4, 3, 4, 2, 3, 1, 4, 3, 4],
    citation: { url: "https://doi.org/10.1126/science.aad6253", title: "Design and synthesis of a minimal bacterial genome", venue: "Science", year: 2016 },
    brief: { zh: "从读 DNA 走向写整条基因组，人造染色体将用于工业菌株与作物。", en: "From reading to writing whole genomes; artificial chromosomes for industrial strains and crops." },
    depth: {
      overview: { zh: "该方向把基因组工程的对象尺度从单个基因提升到整条染色体乃至完整基因组：不再局限于\"读取\"与小幅编辑DNA，而是从头化学合成并\"写入\"整套遗传信息，如酿酒酵母Sc2.0计划与大肠杆菌密码子精简工程。它把DNA合成化学、基因组学与大规模工程系统集成在一起，重新定义了生命可被设计的粒度。", en: "This frontier lifts the scale of genome engineering from single genes to entire chromosomes and complete genomes: instead of merely \"reading\" and lightly editing DNA, it moves to de novo chemical synthesis and \"writing\" whole sets of genetic information, as in the yeast Sc2.0 project and E. coli codon-compression engineering. It integrates DNA synthesis chemistry, genomics, and large-scale engineering systems integration, redefining the granularity at which life can be designed." },
      whyMatters: { zh: "它让人造染色体与密码子重编码从设想变为可实现的工程，但长片段DNA从头合成的成本与保真度仍是硬约束，基因组尺度上的突变效应又难以预测——写得出一套基因组，不等于它能真正运转起来。", en: "It turns artificial chromosomes and codon reassignment from concept into achievable engineering, but the cost and fidelity of de novo synthesis of long DNA fragments remain a hard constraint, and mutation effects at genome scale are still hard to predict—being able to write a genome does not mean it will actually run." },
      ifAnswered: { zh: "若合成与调试能力持续成熟，人造染色体有望走进工业菌株与作物育种；若能进一步说明最小基因组中未知功能基因的作用，合成生物学将从试错拼装升级为可从第一性原理设计活体系统。", en: "As synthesis and debugging capability mature, artificial chromosomes could move into industrial strains and crop breeding; and if the roles of the still-unknown genes in a minimal genome can be explained, synthetic biology could graduate from trial-and-error assembly to designing living systems from first principles." },
      approaches: [
        { zh: "酿酒酵母Sc2.0：为人造染色体装上loxPsym位点，用SCRaMbLE系统实现可控基因组重排", en: "Yeast Sc2.0: installing loxPsym sites on artificial chromosomes and using the SCRaMbLE system for controlled genome rearrangement" },
        { zh: "Chin团队Syn61：将大肠杆菌密码子压缩至61个，借此获得对病毒的抗性", en: "Chin lab's Syn61: compressing E. coli's codon set to 61 codons to gain resistance to viruses" },
        { zh: "JCVI最小基因组路线：把细胞基因组砍削到能自我维持复制的最小集合，逼近生命的最小逻辑", en: "The JCVI minimal-genome route: paring a cell's genome down to the smallest set that can still self-sustain and replicate, approaching the irreducible logic of life" },
      ],
      barrier: { zh: "长片段DNA从头合成的成本与保真度仍是瓶颈，加之基因组尺度突变效应难以预测，写得出染色体不等于它能稳定运转。", en: "The cost and fidelity of de novo synthesis of long DNA fragments remain the bottleneck, compounded by the unpredictability of genome-scale mutation effects—writing a chromosome does not guarantee it runs stably." },
      subQuestions: [
        { zh: "最小基因组中约三分之一功能未知的基因，究竟在维持什么样的生命逻辑？", en: "What life-sustaining logic do the roughly one-third of genes with unknown function in a minimal genome actually encode?" },
        { zh: "能否用人工碱基对或镜像手性造出与现存生命生化不互通的\"正交生命\"？", en: "Can an artificial base pair or mirror chirality produce \"orthogonal life\" biochemically incompatible with all existing organisms?" },
        { zh: "生命起源能否在实验室中从非生命物质反复、独立地重启？", en: "Can the origin of life be repeatedly and independently restarted in the lab from non-living matter?" },
      ],
    },
    stage: 2, members: 6, activity: 51,
    chart: { x: 620, y: 420, scale: 0.75 },
  },
  {
    id: 53, atlasN: 470, slug: "deep-biosphere-extreme-life",
    title: { zh: "深地生物圈与极端生命", en: "The Deep Biosphere and Extreme Life" },
    qfocus: { zh: "地下暗生物圈的微生物,世代以千年计,是否改写了'活着'的定义?", en: "If dark-biosphere microbes have generation times of millennia, does that rewrite what it means to be alive?" },
    domain: "生命",
    cluster: { code: "C29", zh: "地球·海洋·深时科学", en: "Earth · ocean · deep-time science" },
    scores: [5, 5, 3, 2, 3, 2, 3, 3, 5],
    citation: { url: "https://www.frontiersin.org/journals/astronomy-and-space-sciences/articles/10.3389/fspas.2023.1203845/full", title: "Hard rock dark biosphere and habitability", venue: "Frontiers in Astronomy and Space Sciences", year: 2023 },
    brief: { zh: "地壳深处依赖化能自养而非阳光的暗生物圈微生物,以极慢代谢挑战生命的能量与时间下限,世代时间可能以千年计。", en: "Chemolithotrophic dark-biosphere microbes deep within Earth's crust, surviving on chemical energy rather than sunlight, challenge life's lower bounds on energy and time with generation times that may run into millennia." },
    depth: {
      overview: { zh: "深地生物圈与极端生命研究地壳深处岩石、矿井、海底沉积中依赖化学能而非阳光生存的'暗生物圈'微生物,它们以极慢代谢挑战生命的能量与时间极限。它融合地质学、微生物学与天体生物学,核心是这些生命改写了'生命所需条件'的下限。", en: "The deep biosphere and extreme life studies the dark-biosphere microbes living deep within crustal rock, mines, and seafloor sediments that survive on chemical energy rather than sunlight, challenging the energy and time limits of life with extremely slow metabolism. Blending geology, microbiology, and astrobiology, its core insight is that these organisms rewrite the lower bound of the conditions life requires." },
      whyMatters: { zh: "意义远超地球——若生命能在地下无光高压处长期存活,火星地下和冰卫星海洋的生命搜索就有了现实模板;但采样极难且易被地表微生物污染。", en: "Its significance extends far beyond Earth: if life can survive long-term underground in darkness and high pressure, the search for life beneath Mars and in icy-moon oceans gains a real-world template — but sampling is extremely hard and easily contaminated by surface microbes." },
      ifAnswered: { zh: "深地生物圈的发现将启发地外生命搜索,若能量化其规模,地球碳与能量预算也需要重写。", en: "Deep-biosphere findings will inspire the search for extraterrestrial life, and quantifying its scale would force a rewrite of Earth's carbon and energy budgets." },
      approaches: [
        { zh: "钻探采样地壳深处岩石与矿井,分离化能自养微生物群落", en: "Drilling and sampling deep crustal rock and mines to isolate chemolithotrophic microbial communities" },
        { zh: "测定微生物代谢速率与世代时间,校准生命的能量与时间下限", en: "Measuring microbial metabolic rate and generation time to calibrate life's lower bounds on energy and time" },
        { zh: "以深地生存证据为模板,类比火星地下与冰卫星海洋的宜居性", en: "Using deep-life survival evidence as a template to reason about habitability beneath Mars and in icy-moon oceans" },
      ],
      barrier: { zh: "采样极难且易被地表微生物污染,微生物世代时间可能以千年计,颠覆了对'活着'的时间尺度直觉。", en: "Sampling is extremely hard and easily contaminated by surface microbes, and these microbes' generation times may run into millennia, overturning our intuitions about the timescale of being alive." },
      subQuestions: [
        { zh: "地球宜居性、板块构造、磁场与生命之间,是否存在相互调节的深层反馈系统?", en: "Is there a deep, mutually regulating feedback system linking Earth's habitability, plate tectonics, magnetic field, and life?" },
        { zh: "暗生物圈的总生物量与代谢规模究竟有多大,是否改写地球碳循环认知?", en: "How large is the dark biosphere's total biomass and metabolic scale, and does it overturn our understanding of the carbon cycle?" },
        { zh: "深时历史中是否存在由内部过程驱动、尚未被识别的全球临界点?", en: "Are there unrecognized global tipping points in deep-time history driven by internal processes rather than asteroids?" },
      ],
    },
    stage: 1, members: 6, activity: 55,
    chart: { x: 573, y: 241, scale: 0.88 },
  },
  {
    id: 54, atlasN: 531, slug: "ice-sheet-basal-ecology-subglacial",
    title: { zh: "冰盖底界生态与冰下水文生命", en: "Ice-sheet Basal Ecology and Subglacial Hydrologic Life" },
    qfocus: { zh: "冰盖底下数千米,是否藏着地球最大却几乎隔绝的生物圈?", en: "Kilometers beneath the ice sheet, does Earth's largest yet nearly sealed-off biosphere lie hidden?" },
    domain: "生命",
    cluster: { code: "C29", zh: "地球·海洋·深时科学", en: "Earth · ocean · deep-time science" },
    scores: [5, 4, 3, 2, 3, 1, 3, 3, 5],
    citation: { url: "https://www.nature.com/articles/s43705-023-00216-w", title: "Biogeochemical and historical drivers of microbial community composition and structure in sediments from Mercer Subglacial Lake, West Antarctica", venue: "ISME Communications", year: 2023 },
    brief: { zh: "南极冰盖底部冰岩界面与冰下湖的化能自养微生物,已在 Whillans 湖、Mercer 湖等少数钻取中被直接证实。", en: "Chemolithotrophic microbes at the ice-bedrock interface and in subglacial lakes beneath the Antarctic ice sheet have been directly confirmed in a handful of drillings, including Lake Whillans and Lake Mercer." },
    depth: {
      overview: { zh: "研究南极/格陵兰冰盖底部冰岩界面、冰下湖与冰下水系中以化能自养为主的活体微生物群落,及其产生与消耗的甲烷、铁等物质。它把冰川学、微生物生态学与水文学焊在一起:底部融水的润滑作用决定冰流速度,而微生物代谢又改变水化学与气体通量,二者互为反馈。", en: "This studies the predominantly chemolithotrophic living microbial communities at the ice-bedrock interface, in subglacial lakes, and in subglacial water systems beneath the Antarctic and Greenland ice sheets, along with the methane, iron, and other substances they produce and consume. It welds together glaciology, microbial ecology, and hydrology: basal meltwater lubrication governs ice-flow speed, while microbial metabolism alters water chemistry and gas fluxes, the two feeding back on each other." },
      whyMatters: { zh: "它可能是地球上最大的、与地表几乎隔绝的隐藏生物圈,其甲烷/碳反馈直接关系冰盖崩塌速率与海平面模型的可信度,但最大壁垒是取样本身。", en: "It may be the largest hidden biosphere on Earth, almost entirely isolated from the surface, and its methane/carbon feedback bears directly on ice-sheet collapse rates and the credibility of sea-level models — yet the biggest barrier is sampling itself." },
      ifAnswered: { zh: "揭示这套隐藏生物圈,将改写冰盖崩塌模型,并为暗生物圈的规模估算提供一个可直接钻取验证的独立锚点。", en: "Revealing this hidden biosphere would rewrite ice-sheet collapse models and give estimates of the dark biosphere's scale an independently drillable, verifiable anchor." },
      approaches: [
        { zh: "洁净钻穿数千米冰层,直接采样冰下湖(如 Whillans 湖、Mercer 湖)", en: "Cleanly drilling through kilometers of ice to directly sample subglacial lakes such as Lake Whillans and Lake Mercer" },
        { zh: "监测底部融水化学与甲烷/铁通量,追踪微生物代谢对冰流的反馈", en: "Monitoring basal meltwater chemistry and methane/iron fluxes to track microbial metabolism's feedback on ice flow" },
        { zh: "对比 Vostok 湖等有争议钻取结果,校验活菌群落判定标准", en: "Cross-checking contested drilling results such as Lake Vostok to calibrate the criteria for confirming live microbial communities" },
      ],
      barrier: { zh: "最大壁垒是取样本身——洁净钻穿数千米冰且不污染原位环境,全球至今成功直采冰下湖的次数屈指可数。", en: "The biggest barrier is sampling itself — cleanly drilling through kilometers of ice without contaminating the in-situ environment — and successful direct sampling of a subglacial lake has been achieved only a handful of times worldwide." },
      subQuestions: [
        { zh: "冰盖底部隐藏生物圈的总生物量与甲烷通量,究竟有多大?", en: "How large is the total biomass and methane flux of the biosphere hidden beneath the ice sheet?" },
        { zh: "底部微生物代谢与冰流速度之间的反馈,是否会改变冰盖崩塌的时间表?", en: "Could feedback between basal microbial metabolism and ice-flow speed change the timetable of ice-sheet collapse?" },
        { zh: "洁净钻取冰下湖而不污染原位环境,技术上的可靠边界在哪里?", en: "Where is the reliable technical boundary for cleanly sampling a subglacial lake without contaminating the in-situ environment?" },
        { zh: "冰下水文-生物反馈,是否构成一个尚未被识别的冰盖临界点触发机制?", en: "Could subglacial hydrologic-biological feedback constitute an unrecognized triggering mechanism for an ice-sheet tipping point?" },
      ],
    },
    stage: 1, members: 6, activity: 46,
    chart: { x: 667, y: 244, scale: 0.87 },
  },
  {
    id: 55, atlasN: 843, slug: "in-tissue-spatial-functional-genomics",
    title: { zh: "原位空间功能基因组学：在完整组织里做 CRISPR 扰动＋空间读出", en: "In-Tissue Spatial Functional Genomics: CRISPR Perturbation With Spatial Readout in Intact Tissue" },
    qfocus: { zh: "敲掉一个基因,如何改变这个细胞及其邻居——能否在原位读出?", en: "Knock out one gene — how does it change this cell and its neighbors, read out right where it happens?" },
    domain: "生命",
    cluster: { code: "C50", zh: "单细胞·空间多组学", en: "Single-Cell · Spatial Multi-Omics" },
    scores: [5, 5, 4, 2, 4, 2, 4, 2, 5],
    citation: { url: "https://www.cell.com/cell/fulltext/S0092-8674(25)00197-7", title: "Simultaneous CRISPR screening and spatial transcriptomics reveal intracellular, intercellular, and functional transcriptional circuits (Perturb-FISH)", venue: "Cell", year: 2025 },
    brief: { zh: "Perturb-FISH、Perturb-DBiT、空间 Perturb-seq 把上千个 CRISPR 扰动的条码与空间位置、转录组同时读出,在原生组织里做因果筛选。", en: "Perturb-FISH, Perturb-DBiT, and spatial Perturb-seq jointly read out the barcodes of thousands of CRISPR perturbations alongside spatial position and the transcriptome, running causal screens inside native tissue." },
    depth: {
      overview: { zh: "传统 CRISPR 筛选把细胞从组织里拆出来,只能看平均效应、丢掉空间与邻居;而空间功能基因组学把成千上万个 CRISPR 扰动的身份条码,与每个细胞所在的空间位置、转录组同时读出,在原生组织微环境里追问'敲掉这个基因,如何改变这个细胞及其邻居'。它把功能基因组学从培养皿里的平均效应,搬进了有真实细胞-细胞通讯的组织里。", en: "Traditional pooled CRISPR screens must dissociate tissue, capturing only average effects while discarding space and neighbors. Spatial functional genomics instead reads out the identity barcode of thousands of CRISPR perturbations alongside each cell's spatial position and transcriptome, asking inside the native tissue microenvironment: knock out this gene — how does it change this cell and its neighbors? It moves functional genomics out of the dish's averaged effects and into tissue with real cell-cell communication." },
      whyMatters: { zh: "有些受体在培养皿里几乎没用,却在组织里因邻居细胞表达配体而关键;要同时高效捕获扰动条码与空间转录组又不互相稀释信号,且单细胞分辨率下每个扰动的细胞数往往不足以做稳健统计。", en: "Some receptors are nearly useless in a dish yet become critical in tissue because neighboring cells express the ligand; efficiently capturing both perturbation barcode and spatial transcriptome without the two diluting each other's signal is hard, and at single-cell resolution the number of cells per perturbation is often too small for robust statistics." },
      ifAnswered: { zh: "下一步是把多重扰动、全转录组与蛋白多重检测在三维组织里合一,走向在体大规模因果筛选,直接在器官尺度绘制基因-微环境的因果网络。", en: "The next step is fusing multiplexed perturbation, whole-transcriptome, and multiplex protein readout in 3D tissue, moving toward large-scale in vivo causal screens that map gene-microenvironment causality at organ scale." },
      approaches: [
        { zh: "Perturb-FISH 用成像同时检测原位扩增 sgRNA 与转录组(Cell 2025)", en: "Perturb-FISH uses imaging to jointly detect in-situ amplified sgRNA and the transcriptome (Cell, 2025)" },
        { zh: "Perturb-DBiT 在活体组织内做大规模空间分辨的全景 CRISPR 筛选(Nature Biotechnology 2026)", en: "Perturb-DBiT runs large-scale, spatially resolved panoramic CRISPR screens directly in living tissue (Nature Biotechnology, 2026)" },
        { zh: "空间 Perturb-seq 在完整组织结构内做单细胞功能基因组学(Nature Communications 2026)", en: "Spatial Perturb-seq performs single-cell functional genomics within intact tissue architecture (Nature Communications, 2026)" },
      ],
      barrier: { zh: "要同时高效捕获扰动条码与空间转录组、又不让两者互相稀释信号,且要把邻居的间接效应从细胞自身效应中干净拆开,仍是方法学与统计的双重前沿。", en: "Efficiently capturing both perturbation barcode and spatial transcriptome without mutual signal dilution, and cleanly separating a neighbor's indirect effect from a cell's own effect, remain a joint methodological and statistical frontier." },
      subQuestions: [
        { zh: "空间扰动图谱里读出的邻居效应,是真实的细胞间调控,还是共表达的伪影?", en: "Are the neighbor effects read out from spatial perturbation atlases genuine intercellular regulation, or artifacts of co-expression?" },
        { zh: "单细胞分辨率下每个扰动的样本量,能否支撑跨组织稳健的统计推断?", en: "Can the per-perturbation sample size at single-cell resolution support statistically robust inference across tissue?" },
        { zh: "多重扰动条码与全转录组、蛋白检测能否在三维组织内同时不失真地合一?", en: "Can multiplexed perturbation barcodes, whole-transcriptome, and protein detection be fused in 3D tissue without mutual signal loss?" },
        { zh: "把邻居的间接效应从细胞自身效应中干净拆开,需要什么样的统计模型?", en: "What statistical model is needed to cleanly separate a neighbor's indirect effect from a cell's own direct effect?" },
      ],
    },
    stage: 1, members: 5, activity: 46,
    chart: { x: 770, y: 205, scale: 0.87 },
  },
  {
    id: 56, atlasN: 874, slug: "vivo-hematopoietic-stem-cell-editing",
    title: { zh: "体内造血干细胞编辑：把骨髓移植级疗法装进一针", en: "In Vivo Hematopoietic Stem-Cell Editing: Compressing Transplant-Grade Therapy Into One Injection" },
    qfocus: { zh: "能否把整套骨髓移植压缩成一针,让编辑器自己找到干细胞?", en: "Can an entire bone-marrow transplant be compressed into a single injection that finds the stem cells itself?" },
    domain: "生命",
    cluster: { code: "C52", zh: "RNA·表观与可编程医学", en: "RNA · Epigenetic & Programmable Medicine" },
    scores: [4, 5, 4, 2, 3, 2, 4, 4, 5],
    citation: { url: "https://www.nature.com/articles/s41587-025-02915-2", title: "In vivo gene editing of human hematopoietic stem and progenitor cells using envelope-engineered virus-like particles", venue: "Nature Biotechnology", year: 2025 },
    brief: { zh: "CD117/CD133 靶向 LNP 或包膜工程化病毒样颗粒把编辑器直接送到骨髓长期造血干细胞,体内完成镰刀型贫血、β-地贫的碱基/表观编辑。", en: "CD117/CD133-targeted LNPs or envelope-engineered virus-like particles deliver editors straight to long-term hematopoietic stem cells in the marrow, performing in vivo base or epigenetic edits for sickle-cell disease and beta-thalassemia." },
    depth: {
      overview: { zh: "现有的镰刀型贫血基因疗法要抽干净病人骨髓、体外改造细胞再输回去,费用与毒性都极高。体内 HSC 编辑用 CD117/CD133 抗体偶联的靶向 LNP 或包膜工程化病毒样颗粒,把编辑器直接递送到骨髓里的长期造血干细胞,绕过白细胞清除性预处理、体外培养和回输的整套移植流程,想把这一整套压成一针。", en: "Existing sickle-cell gene therapies must fully deplete the patient's marrow, modify cells ex vivo, and reinfuse them — expensive and highly toxic. In vivo HSC editing uses CD117/CD133 antibody-conjugated targeted LNPs or envelope-engineered virus-like particles to deliver editors straight to long-term HSCs in the marrow, bypassing the entire transplant workflow of myeloablative conditioning, ex vivo culture, and reinfusion, aiming to compress the whole process into one injection." },
      whyMatters: { zh: "最硬的张力是靶向特异性与长期干细胞编辑效率的两难:既要只编辑真正的长期 HSC,又要达到能持久重建血液的足量编辑,非人灵长类约 24% 的编辑能否在人体跨过治疗阈值仍是开放问题。", en: "The hardest tension is between targeting specificity and long-term stem-cell editing efficiency: the therapy must edit only genuine long-term HSCs while reaching enough edited cells to durably reconstitute blood, and whether the ~24% editing seen in nonhuman primates clears the human therapeutic threshold remains open." },
      ifAnswered: { zh: "正从人源化小鼠与非人灵长类的概念验证,向无需或弱化预处理的一次性血液病疗法迈进,把移植级疗法真正压进一针。", en: "It is moving from humanized-mouse and nonhuman-primate proof-of-concept toward a one-shot blood-disorder therapy needing no or milder conditioning, genuinely compressing transplant-grade therapy into one injection." },
      approaches: [
        { zh: "包膜工程化病毒样颗粒体内编辑 β2 微球蛋白及 BCL11A/HBG 位点(Nature Biotechnology 2025)", en: "Envelope-engineered virus-like particles editing β2-microglobulin and the BCL11A/HBG loci in vivo (Nature Biotechnology, 2025)" },
        { zh: "无抗体靶向 LNP 递送 ABE8e,在患者来源 HSC 上编辑 HBG 启动子(Nature Biomedical Engineering 2025)", en: "Antibody-free targeted LNP delivery of ABE8e editing the HBG promoter in patient-derived HSCs (Nature Biomedical Engineering, 2025)" },
        { zh: "CD117 抗体-LNP 在非人灵长类实现约 24% 的 HbG-Makassar 编辑", en: "CD117 antibody-LNP achieving ~24% HbG-Makassar editing in nonhuman primates" },
      ],
      barrier: { zh: "既要只编辑真正的长期 HSC、又要达到能持久重建血液的足量编辑,不预处理时被编辑细胞能否稳定植入仍是开放问题。", en: "The therapy must edit only genuine long-term HSCs while reaching enough edited cells to durably reconstitute blood, and whether edited cells can stably engraft without conditioning remains an open question." },
      subQuestions: [
        { zh: "体内编辑的造血干细胞,其编辑效果能否在细胞分裂中持久遗传?", en: "Can the edits made to in vivo hematopoietic stem cells persist heritably across cell division?" },
        { zh: "无预处理条件下,被编辑的长期 HSC 能否稳定植入并重建血液?", en: "Without conditioning, can edited long-term HSCs stably engraft and reconstitute blood?" },
        { zh: "非人灵长类约 24% 的编辑水平,是否已跨过人体治疗阈值?", en: "Does the ~24% editing level seen in nonhuman primates already clear the human therapeutic threshold?" },
        { zh: "碱基编辑器在体内递送时的脱靶编辑,能否被压到临床可接受的水平?", en: "Can off-target editing by the base editor, delivered in vivo, be driven down to a clinically acceptable level?" },
      ],
    },
    stage: 2, members: 8, activity: 61,
    chart: { x: 835, y: 250, scale: 1.02 },
  },
  {
    id: 57, atlasN: 929, slug: "falsifiable-consciousness-metrology-organoids",
    title: { zh: "类器官意识的可证伪计量学:扰动复杂度C-检验", en: "Falsifiable Consciousness Metrology for Organoids: A Perturbational C-Test" },
    qfocus: { zh: "类器官会学习了,它有没有在感受——能不能在电极上读出这个数字?", en: "If an organoid can learn, might it be feeling something — can that be read out as a number on an electrode?" },
    domain: "生命",
    cluster: { code: "C02", zh: "生物计算·类器官智能", en: "Biocomputing · organoid intelligence" },
    scores: [5, 5, 3, 1, 4, 2, 3, 3, 5],
    citation: { url: "https://www.cell.com/patterns/fulltext/S2666-3899(25)00213-2", title: "Facing the possibility of consciousness in human brain organoids", venue: "Patterns (Cell Press)", year: 2025 },
    brief: { zh: "把临床上测人脑意识容量的扰动复杂度指数(PCI)迁移到类器官微电极阵列,临界值约 0.31,试图给类器官智能划一条客观红线。", en: "The perturbational complexity index (PCI) used clinically to measure human capacity for consciousness, with a threshold around 0.31, is being transplanted onto organoid microelectrode arrays to draw an objective red line under organoid intelligence." },
    depth: {
      overview: { zh: "把临床上用 TMS-EEG 测人脑意识容量的扰动复杂度指数(PCI,源自整合信息论 IIT)迁移到类器官:对微电极阵列施加扰动脉冲、读出诱发响应的时空复杂度,得到一个可证伪的意识容量代理指标。当类器官越来越会学习,这门新计量学想把'它有没有在感受'这个哲学难题,变成一个能在电极上读出的数字。", en: "The perturbational complexity index (PCI, derived from integrated information theory and used clinically via TMS-EEG to measure human capacity for consciousness) is being transplanted onto organoids: perturb the tissue through a microelectrode array and read the spatiotemporal complexity of the evoked response, yielding a falsifiable proxy for capacity-for-consciousness. As organoids grow ever more capable of learning, this new metrology aims to turn the philosophical question of whether it feels anything into a number readable off an electrode." },
      whyMatters: { zh: "最硬的张力是 PCI 是为成人皮层-丘脑回路校准的,临界值 0.31 未必能平移到无丘脑、无感觉输入的发育期类器官,一个错误的'安全'读数比没有读数更危险。", en: "The hardest tension is that PCI was calibrated for the mature adult cortico-thalamic circuit, and its 0.31 threshold may not transfer to a developing, thalamus-free, sensory-input-free organoid — a wrongly reassuring 'safe' reading is more dangerous than having no reading at all." },
      ifAnswered: { zh: "它正从单一指标走向一套意识生物标志物组合电池,目标是给每一例类器官学习实验配一个可复现、可监管的意识读数。", en: "It is moving from a single index toward a battery of consciousness biomarkers, aiming to attach a reproducible, regulatable consciousness reading to every organoid-learning experiment." },
      approaches: [
        { zh: "对微电极阵列施加扰动脉冲,读出诱发响应的时空复杂度(PCI 迁移)", en: "Delivering perturbation pulses to a microelectrode array and reading the spatiotemporal complexity of the evoked response (transplanting PCI)" },
        { zh: "Lavazza 与 Massimini 提出在类器官上测 PCI 作为意识容量代理", en: "Lavazza and Massimini's proposal to measure PCI in organoids as a proxy for capacity-for-consciousness" },
        { zh: "改造为适配发育期、无感觉通路类器官的可证伪检验,走向标志物组合电池", en: "Adapting the test to a developing, sensory-pathway-free organoid, moving toward a falsifiable biomarker battery" },
      ],
      barrier: { zh: "PCI 是为成人皮层-丘脑回路校准的,临界值 0.31 未必能平移到无丘脑、无感觉输入的发育期类器官。", en: "PCI was calibrated for the mature adult cortico-thalamic circuit, and its 0.31 threshold may not transfer to a developing organoid that lacks a thalamus and sensory input." },
      subQuestions: [
        { zh: "类器官要在哪个复杂度阈值上,才可能出现某种内在经验?", en: "At what complexity threshold, if any, might an organoid begin to host some form of inner experience?" },
        { zh: "类器官储备池计算的性能,靠的是生物可塑性学习还是通用非线性回声?", en: "Does organoid reservoir-computing performance stem from genuine biological plasticity, or merely generic nonlinear echo?" },
        { zh: "脱离身体与环境闭环,离体类器官能否长出真正的目标或动机?", en: "Without an embodied sensorimotor loop, can a disembodied organoid ever spontaneously develop genuine goals or motivation?" },
      ],
    },
    stage: 1, members: 5, activity: 54,
    chart: { x: 574, y: 328, scale: 0.88 },
  },
  {
    id: 58, atlasN: 972, slug: "genetically-encoded-rna-origami-cellular-hardware",
    title: { zh: "RNA折纸基因编码细胞硬件", en: "Genetically-Encoded RNA-Origami Cellular Hardware" },
    qfocus: { zh: "细胞骨架能否只靠一段 DNA 和一种酶,自己'长'出来?", en: "Can a cytoskeleton grow itself from just a DNA template and a single enzyme?" },
    domain: "生命",
    cluster: { code: "C01", zh: "合成生物·工程生命", en: "Synthetic biology · engineering life" },
    scores: [5, 5, 4, 2, 4, 4, 3, 3, 5],
    citation: { url: "https://www.nature.com/articles/s41565-025-01879-3", title: "Genetic encoding and expression of RNA origami cytoskeletons in synthetic cells", venue: "Nature Nanotechnology", year: 2025 },
    brief: { zh: "在脂质囊泡内,单一 RNA 聚合酶转录即折叠出微米级 RNA 折纸纳米管,充当基因编码的细胞骨架,绕开 150 多个基因的翻译机器。", en: "Inside a lipid vesicle, a single RNA polymerase transcribes DNA templates that co-transcriptionally fold into micrometer-scale RNA-origami nanotubes serving as a genetically encoded cytoskeleton, bypassing the 150-plus-gene translation machinery." },
    depth: {
      overview: { zh: "用单一 RNA 聚合酶在脂质囊泡内转录即折叠出微米级 RNA 折纸纳米管,充当可基因编码的细胞骨架——绕开蛋白质翻译机器(150+ 基因),只需 DNA 模板加一种酶加核苷酸燃料。合成细胞领域长期默认'先有蛋白才有结构',RNA 折纸把这个顺序反过来:从一段 DNA 基因直接'长出'会折叠的骨架。", en: "Inside lipid vesicles, a single RNA polymerase transcribes DNA templates whose RNA products fold co-transcriptionally into micrometer-scale origami nanotubes that act as a genetically encodable cytoskeleton — bypassing the 150-plus-gene translation machinery, needing only a DNA template, one enzyme, and nucleotide fuel. Synthetic-cell research has long assumed protein must come before structure; RNA origami reverses that order, growing a foldable scaffold directly from a DNA gene." },
      whyMatters: { zh: "最硬的张力在于 RNA 折纸目前只是细胞骨架的形态模拟,离真正承载力学/运输功能还远,RNA 在囊泡内的降解与持续供能的稳态也尚未解决。", en: "The hardest tension is that RNA origami is so far only a morphological mimic of the cytoskeleton, still far from truly bearing mechanical or transport function, and the steady-state balance between RNA degradation and continuous fuel supply inside the vesicle remains unsolved." },
      ifAnswered: { zh: "指向不依赖蛋白质翻译、可定向进化的纯 RNA 底盘:细胞自产硬件,序列突变即可改变表型。", en: "It points toward a translation-free, directed-evolvable RNA-only chassis where the cell manufactures its own hardware and a single sequence mutation rewrites the phenotype." },
      approaches: [
        { zh: "巨型单层囊泡内从 DNA 模板共转录折叠出三维 RNA 纳米管(Göpfrich 团队, Nature Nanotechnology 2025)", en: "Co-transcriptional folding of 3D RNA nanotubes from a DNA template inside giant unilamellar vesicles (Göpfrich group, Nature Nanotechnology, 2025)" },
        { zh: "用 RNA 适配体让纳米管结合膜、形成皮层,使囊泡变形", en: "Using RNA aptamers to bind the nanotube to the membrane, forming a cortex that deforms the vesicle" },
        { zh: "微调模板序列,把纳米管从开放管状切换成闭合环状", en: "Fine-tuning the template sequence to switch the nanotube from an open tube into a closed ring" },
      ],
      barrier: { zh: "RNA 折纸目前只是细胞骨架的形态模拟,离真正承载力学/运输功能还远,能'长出来'不等于能'用起来'。", en: "RNA origami is so far only a morphological mimic of the cytoskeleton, still far from bearing real mechanical or transport function — being able to grow it is not the same as being able to use it." },
      subQuestions: [
        { zh: "一个纯 RNA 底盘细胞,最少需要多少种功能元件才能自我维持?", en: "How few functional RNA elements does a purely RNA-based chassis cell need to sustain itself?" },
        { zh: "囊泡内 RNA 的降解与核苷酸燃料供给,能否达到长期稳态?", en: "Can RNA degradation and nucleotide-fuel supply inside the vesicle reach a long-term steady state?" },
        { zh: "RNA 折纸骨架除了形态模拟,能否真正承载力学或物质运输功能?", en: "Beyond morphological mimicry, can the RNA-origami scaffold genuinely bear mechanical or transport function?" },
        { zh: "从 DNA 模板到会折叠的骨架,这条路线能否重复独立地在实验室重启?", en: "Can this route from DNA template to a folding scaffold be restarted repeatedly and independently in the lab?" },
      ],
    },
    stage: 2, members: 10, activity: 58,
    chart: { x: 673, y: 326, scale: 1.01 },
  },
  {
    id: 59, atlasN: 1316, slug: "adversarial-falsification-benchmark-science",
    title: { zh: "扰动预测模型的对抗性证伪与基准科学", en: "Adversarial Falsification and Benchmark Science for Perturbation-Prediction Models" },
    qfocus: { zh: "宣称能预测细胞扰动的基础模型,真的比一行线性代码强吗?", en: "Do foundation models that claim to predict cell perturbations actually beat a one-line linear baseline?" },
    domain: "生命",
    cluster: { code: "C50", zh: "单细胞·空间多组学", en: "Single-Cell · Spatial Multi-Omics" },
    scores: [4, 3, 5, 4, 4, 4, 4, 4, 5],
    citation: { url: "https://www.nature.com/articles/s41592-025-02772-6", title: "Deep-learning-based gene perturbation effect prediction does not yet outperform simple linear baselines", venue: "Nature Methods", year: 2025 },
    brief: { zh: "Nature Methods 2025 用单/双扰动数据比较五个基础模型与 GEARS,结论是没有一个稳定跑赢简单线性/加性基线。", en: "A Nature Methods 2025 study compared five foundation models against GEARS on single- and double-perturbation data and found none reliably beat a simple linear or additive baseline." },
    depth: {
      overview: { zh: "这是一条专门拆穿单细胞/虚拟细胞基础模型的元科学支线:用统一基准、诚实基线(线性/加性/均值)和排序类指标,检验 scGPT、scFoundation、GEARS 等是否真的预测了扰动响应。反复出现的结论是——尚未稳定跑赢简单线性基线。", en: "This is a meta-science line dedicated to stress-testing single-cell and virtual-cell foundation models: using unified benchmarks, honest baselines (linear, additive, mean), and rank-based metrics to test whether scGPT, scFoundation, GEARS, and others truly predict perturbation responses. The recurring verdict is that they do not yet reliably beat a simple linear baseline." },
      whyMatters: { zh: "最硬的张力是基准本身会不会也被过拟合:一旦某个基准成为刷分靶子,证伪者就得不断设计更难的泛化任务,否则元科学自己也会退化成新的排行榜游戏。", en: "The hardest tension is whether the benchmark itself will be overfit: once a benchmark becomes a target to game, falsifiers must keep designing harder generalization tasks, or the meta-science itself degrades into just another leaderboard game." },
      ifAnswered: { zh: "走向社区共享、可复跑的扰动基准基础设施,把'是否真有预测力'从叙事变成可证伪的公开赛。", en: "It is heading toward shared, re-runnable perturbation-benchmark infrastructure that turns 'does it actually predict' from narrative into a falsifiable public contest." },
      approaches: [
        { zh: "用单/双扰动 CRISPR 数据比较五个基础模型与 GEARS(Ahlmann-Eltze 等, Nature Methods 2025)", en: "Comparing five foundation models against GEARS on single- and double-perturbation CRISPR data (Ahlmann-Eltze et al., Nature Methods, 2025)" },
        { zh: "PerturBench 提供模块化平台、多样数据集与排序指标,揭示模型 mode collapse(NeurIPS 2025)", en: "PerturBench provides a modular platform, diverse datasets, and rank-based metrics, exposing model mode collapse (NeurIPS 2025)" },
        { zh: "对比简单架构与大模型随数据规模的扩展表现", en: "Comparing how simple architectures versus large models scale with increasing data" },
      ],
      barrier: { zh: "一旦某个基准成为刷分靶子,证伪者就得不断设计更难的泛化任务(未见扰动/未见协变量迁移),否则元科学自己也会退化成新的排行榜游戏。", en: "Once a benchmark becomes a target to game, falsifiers must keep designing harder generalization tasks — unseen perturbations, unseen covariate shifts — or the meta-science itself degrades into just another leaderboard game." },
      subQuestions: [
        { zh: "基础模型的注意力图,编码的是基因共表达还是真实的调控因果?", en: "Does a foundation model's attention map encode gene co-expression, or genuine regulatory causation?" },
        { zh: "面对训练时从未见过的细胞语境,模型能否跨所有指标稳定胜过朴素基线?", en: "In a never-seen cell context, can a model consistently beat naive baselines across every metric?" },
        { zh: "分子记录器在编辑饱和前,能可靠写下细胞谱系树的多少层?", en: "How many layers of a lineage tree can a molecular recorder reliably write before edit saturation?" },
      ],
    },
    stage: 2, members: 9, activity: 58,
    chart: { x: 747, y: 329, scale: 1.01 },
  },
  {
    id: 60, atlasN: 1449, slug: "perennial-grain-crops",
    title: { zh: "多年生粮食作物·一次播种多年收获", en: "Perennial Grain Crops" },
    qfocus: { zh: "谷物能否只种一次、连续收获数年而不减产？", en: "Can a grain be sown once and harvested for years without yield loss?" },
    domain: "生命",
    cluster: { code: "C24", zh: "未来食品·农业科学", en: "Future food · agricultural science" },
    scores: [4, 3, 4, 4, 3, 4, 5, 3, 5],
    citation: { url: "https://www.nature.com/articles/s41893-022-00997-3", title: "Sustained productivity and agronomic potential of perennial rice", venue: "Nature Sustainability", year: 2022 },
    brief: { zh: "云南大学团队用亚洲栽培稻与非洲野生稻杂交育成多年生水稻PR23，单次播种连续四年收获八季，产量与年年重播持平，年固碳约0.95吨/公顷。", en: "Yunnan University's team bred perennial rice PR23 by crossing Asian cultivated rice with African wild rice — eight harvests over four years from one planting, at yield parity with annual replanting, sequestering about 0.95 tonnes of carbon per hectare per year." },
    depth: {
      overview: { zh: "一万年来「一季一种」是谷物农业的默认前提。通过种间杂交把水稻、小麦草、高粱等一年生谷物改造为多年生形态，单次播种后可连续多季自我再生，免去年年翻耕移栽，同时让根系常驻土壤，固碳固氮、减少水土流失。", en: "For ten thousand years, 'one season, one planting' has been the default premise of grain agriculture. Interspecific hybridization converts annual staples like rice, wheatgrass, and sorghum into perennial forms that regrow across multiple seasons from a single planting, eliminating yearly tillage and transplanting while keeping living roots in the soil to fix carbon and nitrogen and curb erosion." },
      whyMatters: { zh: "最硬的张力在于：多季连作后产量能否稳住、病虫害与「连作障碍」如何管理，决定它究竟是改写农业范式的突破，还是局限于云南等特定生态的区域性利基。", en: "The hardest tension: whether yield can stay stable across repeated seasons of ratooning, and how pests and 'continuous-cropping obstacles' are managed, will decide whether this is a paradigm-level breakthrough or a niche confined to specific ecologies like Yunnan's." },
      ifAnswered: { zh: "若能把多年生化成功扩展到小麦、高粱与豆类主粮，并解决连作后的产量衰减与病害累积，全球谷物生产将首次摆脱年年翻耕育秧的循环，兼顾产量、土壤固碳与水土保持。", en: "If perennialization can be successfully extended to wheat, sorghum, and legumes while solving multi-season yield decline and disease build-up, global grain production could for the first time escape the cycle of yearly tillage and transplanting, gaining yield, soil carbon storage, and erosion control at once." },
      approaches: [
        { zh: "亚洲栽培稻与非洲长雄野生稻种间杂交育成多年生水稻", en: "Interspecific crossing of Asian cultivated rice with African wild rice O. longistaminata" },
        { zh: "美国Land Institute同步培育多年生小麦草Kernza作平行验证", en: "The Land Institute's parallel perennial wheatgrass Kernza" },
        { zh: "把水稻育种模板复制到高粱、小麦的多年生化改造", en: "Replicating the rice breeding template for sorghum and wheat perennialization" },
      ],
      barrier: { zh: "多季连作后产量能否持续稳定、病虫害与连作障碍如何控制，仍是决定多年生谷物能否走出区域利基、成为主粮范式的核心未决难题。", en: "Whether yield can stay stable through repeated ratooning and how pest pressure and 'continuous-cropping obstacles' are controlled remains the core unresolved question deciding whether perennial grains break out of a regional niche to become a staple-crop paradigm." },
      subQuestions: [
        { zh: "连续多季收获后，产量衰减曲线最终会稳定在哪一水平？", en: "Where does the yield-decline curve eventually stabilize across repeated harvests?" },
        { zh: "病虫害与「连作障碍」积累是否会抵消省工与固碳收益？", en: "Will accumulating pests and 'continuous-cropping obstacles' offset the labor and carbon gains?" },
        { zh: "多年生育种模板能否复制到需水、需肥迥异的小麦与豆类？", en: "Can the breeding template transfer to wheat and legumes with very different water and nutrient needs?" },
        { zh: "多年生化在扩大种植面积时，能否同时保住作物遗传多样性？", en: "Can scaling up perennial cultivation preserve crop genetic diversity rather than erode it?" },
      ],
    },
    stage: 2, members: 10, activity: 57,
    chart: { x: 872, y: 299, scale: 1.01 },
  },
  {
    id: 61, atlasN: 1488, slug: "unknomics-systematically-studying-least-known",
    title: { zh: "未知组学：系统研究「最不为人知的基因」", en: "Unknomics: Systematically Studying the Least-Known Genes" },
    qfocus: { zh: "能否把「无知」本身量化，反过来指导科研选靶？", en: "Can quantifying 'ignorance' itself guide what science studies next?" },
    domain: "生命",
    cluster: { code: "C37", zh: "生物暗物质·未注释生命", en: "Biological Dark Matter & Unannotated Life" },
    scores: [4, 4, 4, 4, 4, 3, 4, 4, 5],
    citation: { url: "https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3002222", title: "Functional unknomics: Systematic screening of conserved genes of unknown function", venue: "PLOS Biology", year: 2023 },
    brief: { zh: "剑桥MRC分子生物学实验室建立Unknome数据库，给保守蛋白家族打「知晓度分数」，对约260个未研究基因做果蝇RNAi/CRISPR筛选找到新功能。", en: "Cambridge's MRC Laboratory of Molecular Biology built the Unknome database, assigning conserved protein families a 'knownness score,' then ran RNAi/CRISPR screens in fruit flies on about 260 unstudied genes to uncover new functions." },
    depth: {
      overview: { zh: "科学界的注意力高度集中于少数「明星基因」，海量保守却功能未知的基因被系统性冷落。未知组学反其道而行：先把「我们对某基因到底知道多少」量化成可排序的知晓度分数，再据此系统锁定并攻关那些被长期忽视、却在进化上高度保守的未知功能基因。", en: "Scientific attention concentrates heavily on a handful of 'star genes,' while a huge number of conserved yet functionally unknown genes are systematically neglected. Unknomics reverses the logic: first quantify 'how much we actually know about a gene' into a rankable knownness score, then use it to systematically target and study the long-ignored, evolutionarily conserved genes of unknown function." },
      whyMatters: { zh: "一个基因「被研究得少」未必因为它不重要，但也可能确实边缘；在没有先验重要性信号时，如何避免把有限的湿实验资源投向真正的死角，是这套方法的命门。", en: "A gene being 'understudied' need not mean it is unimportant, but it could genuinely be marginal; without any prior signal of importance, avoiding wasted wet-lab resources on true dead ends is this method's Achilles' heel." },
      ifAnswered: { zh: "若破译这些保守未知基因的功能，将一次性扩展酶工程、药物发现与合成生物的可用零件库，并把「研究什么」从追逐热点转向对基因组暗区的系统制图与填补。", en: "Deciphering the function of these conserved unknown genes would at a stroke expand the usable parts list for enzyme engineering, drug discovery, and synthetic biology, turning 'what to study' from hype-chasing into systematic mapping and filling of the genome's dark regions." },
      approaches: [
        { zh: "建立跨物种保守蛋白家族的「知晓度分数」排序系统", en: "Build a knownness-score ranking across conserved protein families spanning species" },
        { zh: "对高分未知基因用果蝇RNAi/CRISPR做系统功能筛选", en: "Run systematic RNAi/CRISPR functional screens in fruit flies on top-ranked unknown genes" },
        { zh: "知晓度排名与结构预测、功能筛选结合定向选靶", en: "Couple knownness rankings with structure prediction and functional screens to target candidates" },
      ],
      barrier: { zh: "知晓度分数只反映『被研究了多少』，不直接证明『值得研究』；没有独立的重要性信号时，湿实验筛选仍可能扑空在真正边缘的基因上。", en: "A knownness score reflects only how little a gene has been studied, not whether it deserves study; absent an independent importance signal, wet-lab screens can still come up empty on genes that are genuinely marginal." },
      subQuestions: [
        { zh: "十亿条无同源的宏基因组序列中藏着哪些全新酶机制？", en: "What novel enzyme mechanisms might hide among the billion homology-free metagenomic sequences?" },
        { zh: "知晓度分数能否延伸到宏基因组里的「暗物质」蛋白？", en: "Can knownness scoring extend to the 'dark matter' proteins found in metagenomes?" },
        { zh: "能否脱离同源比对，直接从结构与表型推断未知基因功能？", en: "Can function be inferred directly from structure and phenotype, without homology alignment?" },
        { zh: "被系统忽视的保守基因中，哪些才是真正值得攻关的靶点？", en: "Among systematically neglected conserved genes, which are genuinely worth the effort?" },
      ],
    },
    stage: 2, members: 10, activity: 53,
    chart: { x: 583, y: 381, scale: 1.01 },
  },
  {
    id: 62, atlasN: 472, slug: "ancient-dna-paleoproteomics",
    title: { zh: "古DNA与古蛋白质组学", en: "Ancient DNA and Paleoproteomics" },
    qfocus: { zh: "古蛋白质能否比DNA多撑数百万年，改写演化史？", en: "Can ancient proteins outlast DNA by millions of years and rewrite evolution?" },
    domain: "生命",
    cluster: { code: "C29", zh: "地球·海洋·深时科学", en: "Earth · ocean · deep-time science" },
    scores: [4, 4, 4, 2, 3, 2, 5, 4, 4],
    citation: { url: "https://pubs.acs.org/doi/10.1021/acs.chemrev.1c00703", title: "Paleoproteomics | Chemical Reviews (comprehensive review of the field)", venue: "Chemical Reviews", year: 2022 },
    brief: { zh: "Svante Pääbo团队测出尼安德特人与丹尼索瓦人基因组，古蛋白质组学（胶原、牙釉蛋白）正把分子考古窗口向前推数百万年。", en: "Svante Pääbo's team sequenced the Neanderthal and Denisovan genomes, and paleoproteomics — reading collagen and enamel proteins — is now pushing the molecular archaeology window back by millions of years." },
    depth: {
      overview: { zh: "古DNA与古蛋白质组学从化石、骨骼、沉积物乃至牙垢中提取并测序降解的古代分子，重建灭绝物种、古人类与古生态的信息。它融合基因组学、考古学与演化生物学，核心洞见是分子证据能比形态化石更精确地厘清亲缘、迁徙与杂交关系。", en: "Ancient DNA and paleoproteomics extract and sequence degraded ancient molecules from fossils, bones, sediment, and even dental calculus to reconstruct the molecular record of extinct species, archaic humans, and ancient ecosystems. Fusing genomics, archaeology, and evolutionary biology, its core insight is that molecular evidence can resolve kinship, migration, and hybridization more precisely than morphological fossils ever could." },
      whyMatters: { zh: "它已重写人类演化史——尼安德特人与丹尼索瓦人的基因渗入正是明证；但古分子降解极快、污染防控苛刻，能保存分子的环境有限，热带地区几乎无望留下可读的古DNA。", en: "It has already rewritten human evolutionary history — Neanderthal and Denisovan gene introgression being the clearest proof — but ancient molecules degrade fast, contamination control is exacting, and the environments that preserve them are limited, with the tropics nearly hopeless for readable ancient DNA." },
      ifAnswered: { zh: "若古蛋白质保存远超DNA的特性被系统利用，分子考古的可读时间窗口有望向前推进数百万年，让演化史与人类史获得比形态化石精确得多的分子证据。", en: "If the fact that ancient proteins outlast DNA is systematically exploited, the readable window of molecular archaeology could push back millions of years, giving evolutionary and human history molecular evidence far more precise than morphological fossils alone." },
      approaches: [
        { zh: "从骨骼、牙齿提取降解DNA测序重建古人类基因组", en: "Extract and sequence degraded DNA from bone and teeth to rebuild archaic human genomes" },
        { zh: "沉积物古DNA绕开骨骼保存条件的限制", en: "Use sedimentary ancient DNA to bypass the need for skeletal preservation" },
        { zh: "古蛋白质组学分析胶原、牙釉蛋白延长可读时间窗口", en: "Apply paleoproteomics on collagen and enamel proteins to extend the readable time window" },
      ],
      barrier: { zh: "古分子降解速度快、污染防控要求极严，且能长期保存分子的环境本就稀少，热带潮湿气候几乎不留下可用的古DNA。", en: "Ancient molecules degrade quickly, contamination control demands are severe, and the environments capable of long-term molecular preservation are already scarce — tropical, humid climates leave behind almost no usable ancient DNA." },
      subQuestions: [
        { zh: "古蛋白质能否把分子考古窗口推进到数百万年前？", en: "Can ancient proteins push the molecular archaeology window back millions of years?" },
        { zh: "热带等高降解环境中，是否存在替代性的分子保存介质？", en: "Are there alternative preservation media in high-degradation environments like the tropics?" },
        { zh: "沉积物古DNA能否重建缺乏骨骼化石地区的古生态？", en: "Can sedimentary ancient DNA reconstruct paleoecosystems where skeletal fossils are absent?" },
        { zh: "分子证据能否揭示生命与地球宜居性的深时耦合过程？", en: "Can molecular evidence reveal the deep-time coupling between life and planetary habitability?" },
      ],
    },
    stage: 2, members: 9, activity: 59,
    chart: { x: 666, y: 448, scale: 1.02 },
  },
  {
    id: 63, atlasN: 659, slug: "energy-limit-ecology-deep-subsurface-dark",
    title: { zh: "深地暗微生物的能量极限生态", en: "Energy-Limit Ecology of Deep-Subsurface Dark Microbes" },
    qfocus: { zh: "生命所需的最低能量究竟能低到什么地步？", en: "How low can the energy budget for life actually go?" },
    domain: "生命",
    cluster: { code: "C37", zh: "生物暗物质·未注释生命", en: "Biological Dark Matter & Unannotated Life" },
    scores: [5, 4, 3, 2, 4, 2, 3, 2, 5],
    citation: { url: "https://www.nature.com/articles/s41579-018-0046-8", title: "Life at low energy: subsurface microbial communities and maintenance power", venue: "Nature Reviews Microbiology", year: 2018 },
    brief: { zh: "地下微生物或占全球微生物量约85%，靠岩-水反应获取能量，世代时间长达数百至上千年，逼近生命可维持的能量下限。", en: "Subsurface microbes may account for roughly 85 percent of global microbial biomass, drawing energy from rock-water reactions with generation times of hundreds to thousands of years — approaching life's energy floor." },
    depth: {
      overview: { zh: "地球地下深部岩石圈栖息着大量微生物，它们几乎无光无氧、隔绝地表，仅靠岩-水反应（如放射性辐解产氢、矿物氧化）获取极微弱能量，世代时间可达数百至上千年。这项研究把生命可维持的最低能量通量当作根本未知来探测，桥接深部生物圈微生物学、地球化学与生物能量学。", en: "Earth's deep lithosphere hosts vast numbers of microbes that live almost entirely without light or oxygen, sealed off from the surface, drawing vanishingly small energy from rock-water reactions such as radiolytic hydrogen production and mineral oxidation, with generation times stretching to hundreds or thousands of years. This research treats the minimum energy flux that can sustain life as a fundamental unknown to probe, bridging deep-biosphere microbiology, geochemistry, and bioenergetics." },
      whyMatters: { zh: "地下微生物构成全球生物量的大部分，却几乎全是暗物质；它们逼近生命的能量下限，重写我们对生命所需条件的认知，也直接关联火星、土卫二等地外深部宜居性。", en: "Subsurface microbes make up a large share of global biomass yet remain almost entirely dark matter; pushing against life's energy floor, they rewrite what we think life requires, and connect directly to the deep-subsurface habitability of Mars and Enceladus." },
      ifAnswered: { zh: "若能测出维持生命所需的最低能量通量，就能重新界定生命可维持的热力学边界，为火星、土卫二等地外深部生命的搜索提供地球基准。", en: "Measuring the minimum energy flux needed to sustain life would redefine the thermodynamic boundary of 'sustainable life' and give the search for subsurface life on Mars and Enceladus an Earth-based benchmark." },
      approaches: [
        { zh: "深钻岩芯取样测定原位岩-水反应能量供给", en: "Deep-drill rock cores to measure in-situ energy supply from rock-water reactions" },
        { zh: "同位素与单细胞方法测量近零代谢的最低活性", en: "Use isotopic and single-cell methods to measure the minimal activity of near-arrested metabolism" },
        { zh: "严格污染示踪区分原生群落与钻井液污染", en: "Apply rigorous contamination tracers to distinguish native communities from drilling fluid" },
      ],
      barrier: { zh: "深钻成本极高且极易被钻井液污染，区分原生群落与污染需要严格示踪；对世代千年、代谢近乎停滞的细胞，测其是否存活需要灵敏到极限的方法。", en: "Deep drilling is extremely costly and easily contaminated by drilling fluid, requiring rigorous tracers to isolate native communities; for cells with millennial generation times and near-dormant metabolism, determining whether they are even alive demands methods sensitive to the absolute limit." },
      subQuestions: [
        { zh: "深部生物圈的总生物量与代谢规模究竟有多大？", en: "How large, in total biomass and metabolic rate, is the deep biosphere really?" },
        { zh: "近零代谢、世代千年的细胞算不算「活着」？", en: "Does a cell with a millennial generation time and near-zero metabolism still count as 'alive'?" },
        { zh: "地下暗生物圈是否藏着未知的代谢化学与生命逻辑？", en: "Does the subsurface dark biosphere hide unknown metabolic chemistry and life-logic?" },
        { zh: "地球深部能量极限能否为地外深部宜居性提供判据？", en: "Can Earth's deep energy limits set a benchmark for extraterrestrial subsurface habitability?" },
      ],
    },
    stage: 1, members: 6, activity: 47,
    chart: { x: 753, y: 411, scale: 0.87 },
  },
  {
    id: 64, atlasN: 755, slug: "3d-synthesizable-co-generation-joint",
    title: { zh: "三维可合成共生成 · 反应图与原子坐标联合扩散", en: "3D Synthesizable Co-Generation via Joint Reaction-Coordinate Diffusion" },
    qfocus: { zh: "能否让分子的三维结构与可合成性一起生成，而非事后过滤？", en: "Can a molecule's 3D structure and its synthesizability be generated together, not filtered after the fact?" },
    domain: "生命",
    cluster: { code: "C43", zh: "生成式生物·AI分子与蛋白设计", en: "Generative Biology · AI Molecular & Protein Design" },
    scores: [5, 5, 4, 2, 2, 2, 4, 3, 4],
    citation: { url: "https://arxiv.org/abs/2507.11818", title: "SynCoGen: Synthesizable 3D Molecule Generation via Joint Reaction and Coordinate Modeling", venue: "arXiv / GenBio 2025", year: 2025 },
    brief: { zh: "SynCoGen用掩码图扩散与流匹配联合采样砌块反应图与三维坐标，基于超120万合成感知砌块图训练，取得共生成SOTA。", en: "SynCoGen jointly samples building-block reaction graphs and 3D coordinates via masked graph diffusion plus flow matching, trained on over 1.2 million synthesis-aware building-block graphs, achieving state-of-the-art co-generation." },
    depth: {
      overview: { zh: "三维生成模型有个尴尬秘密：它给出的高亲和力构象常常是没人能合成的「纸上分子」。这条前沿用一个模型同时对砌块-反应图（离散扩散）与原子坐标（流匹配）联合采样，把三维几何与合成可行性从生成源头绑定在一起。", en: "3D generative models have an embarrassing secret: the high-affinity conformations they output are often 'paper molecules' nobody can actually make. This line jointly samples a building-block/reaction graph (via discrete diffusion) and atomic coordinates (via flow matching) in one model, binding 3D geometry and synthetic feasibility together from the moment of generation." },
      whyMatters: { zh: "联合两种异质模态——离散反应图与连续坐标——在统一时间轴上扩散，耦合调度极易失衡；且砌块词表一旦固定，三维几何的可达性就被砌块库的形状先验框死。", en: "Jointly diffusing two heterogeneous modalities — a discrete reaction graph and continuous coordinates — on a unified timeline is prone to unstable coupling schedules; and once the building-block vocabulary is fixed, the reachable 3D geometry is already bounded by the shape priors of that building-block library." },
      ifAnswered: { zh: "若这条路线成熟，无需任何打分函数即可完成药效团条件生成与连接子设计，朝着直接在笛卡尔空间设计可合成分子的统一基座演进，支撑先导优化。", en: "If this line matures, pharmacophore-conditioned generation and linker design would work with no scoring function at all, moving toward a unified base model that designs synthesizable molecules directly in Cartesian space to support lead optimization." },
      approaches: [
        { zh: "用离散掩码图扩散生成砌块与反应路径图", en: "Use discrete masked graph diffusion to generate building-block and reaction-route graphs" },
        { zh: "用连续流匹配在同一时间轴生成三维原子坐标", en: "Use continuous flow matching on the same timeline to generate 3D atomic coordinates" },
        { zh: "构建SynSpace数据集支撑不依赖打分函数的条件生成", en: "Build the SynSpace dataset to support scoring-function-free conditional generation" },
      ],
      barrier: { zh: "联合两种异质模态在统一时间轴上扩散极易导致耦合调度失衡，且一旦固定砌块词表，三维几何的可达空间就被砌块库形状先验地框死。", en: "Jointly diffusing two heterogeneous modalities on one timeline easily throws the coupling schedule out of balance, and once the building-block vocabulary is fixed, the reachable 3D geometric space is already bounded a priori by the library's shape." },
      subQuestions: [
        { zh: "可合成约束会扩大还是收窄可达的化学空间？", en: "Does the synthesizability constraint expand or narrow the reachable chemical space?" },
        { zh: "砌块库与反应模板的先验是否暗中限定了模型想象力？", en: "Do the priors of building-block libraries and reaction templates secretly bound the model's imagination?" },
        { zh: "3D共生成能否真正杜绝「画得出却合不出」的纸上分子？", en: "Can 3D co-generation truly eliminate molecules that can be drawn but never made?" },
        { zh: "离散反应图与连续坐标的联合扩散调度如何避免失衡？", en: "How can the joint diffusion schedule for discrete graphs and continuous coordinates avoid imbalance?" },
      ],
    },
    stage: 2, members: 8, activity: 59,
    chart: { x: 828, y: 414, scale: 1.02 },
  },
  {
    id: 65, atlasN: 760, slug: "retrosynthesis-in-the-loop-direct-optimization-synthesizability",
    title: { zh: "逆合成模型在环 · 把合成可行性变成生成的直接优化目标", en: "Retrosynthesis-in-the-Loop Direct Optimization of Synthesizability" },
    qfocus: { zh: "能否把逆合成规划直接搬进生成模型的优化回路？", en: "Can retrosynthesis planning be moved directly inside the generative optimization loop?" },
    domain: "生命",
    cluster: { code: "C43", zh: "生成式生物·AI分子与蛋白设计", en: "Generative Biology · AI Molecular & Protein Design" },
    scores: [4, 4, 4, 3, 3, 4, 5, 4, 4],
    citation: { url: "https://pubs.rsc.org/en/content/articlehtml/2025/sc/d5sc01476j", title: "Directly optimizing for synthesizability in generative molecular design using retrosynthesis models (Saturn)", venue: "Chemical Science", year: 2025 },
    brief: { zh: "Guo与Schwaller的Saturn把逆合成模型当活oracle接入优化回路，在严苛算力预算下生成确有合成路线的多参数最优分子。", en: "Guo and Schwaller's Saturn treats a retrosynthesis model as a live oracle inside the optimization loop, generating multi-parameter-optimal molecules with provable synthetic routes under a strict compute budget." },
    depth: {
      overview: { zh: "逆合成路线搜索是最准的可合成性判据，但推理代价太高，长期只能当事后过滤器。这条前沿证明：只要生成模型足够样本高效，就能把逆合成模型当作活的oracle直接放进优化回路，在严苛算力预算下产出既满足多参数药化目标、又确有合成路线的分子。", en: "Retrosynthetic route search is the most faithful test of synthesizability, but it is too expensive for anything but post-hoc filtering. This line proves that if a generative model is sample-efficient enough, a retrosynthesis model can be used as a live oracle directly inside the optimization loop, producing molecules that meet multi-parameter drug-discovery goals while provably having a real synthetic route — all under a strict compute budget." },
      whyMatters: { zh: "逆合成oracle准但慢，样本高效性是唯一让它进环的钥匙；一旦换到功能材料等分布外空间，连「准」本身也要打问号——逆合成模型会幻觉出跑不通的反应。", en: "The retrosynthesis oracle is accurate but slow, so sample efficiency is the only key that lets it into the loop; once you move to out-of-distribution spaces like functional materials, even 'accuracy' becomes questionable, since the retrosynthesis model can hallucinate reactions that don't actually work." },
      ifAnswered: { zh: "若逆合成入环成为默认配置，生成式化学就能在新材料等分布外空间避免因过度依赖启发式分数而漏掉真正可合成的好分子，让每个候选都经得起路线核验。", en: "If retrosynthesis-in-the-loop becomes the default configuration, generative chemistry could avoid missing genuinely synthesizable molecules in novel spaces like new materials — where over-reliance on heuristic scores fails — letting every candidate withstand real route verification." },
      approaches: [
        { zh: "把逆合成规划器作为MPO目标里的活oracle", en: "Use the retrosynthesis planner as a live oracle inside the multi-parameter optimization objective" },
        { zh: "用样本高效的生成策略压低昂贵推理次数", en: "Use a sample-efficient generation strategy to keep expensive inference calls low" },
        { zh: "对比启发式分数与逆合成可解性在分布外空间的偏差", en: "Compare heuristic scores against real retrosynthetic solvability in out-of-distribution spaces" },
      ],
      barrier: { zh: "推理昂贵是逆合成oracle入环的根本瓶颈，唯有样本高效的生成器才负担得起；换到陌生化学空间，逆合成模型本身还可能幻觉出不可行的反应路径。", en: "Expensive inference is the fundamental bottleneck for putting a retrosynthesis oracle in the loop, affordable only to sample-efficient generators; and in unfamiliar chemical spaces, the retrosynthesis model itself can hallucinate infeasible reaction routes." },
      subQuestions: [
        { zh: "样本效率能否让逆合成oracle在实际算力预算下可用？", en: "Can sample efficiency make a retrosynthesis oracle usable under real compute budgets?" },
        { zh: "常见可合成性启发式分数何时会与真实可解性脱钩？", en: "When do common synthesizability heuristics decouple from real solvability?" },
        { zh: "逆合成模型自身的幻觉反应如何被检测与过滤？", en: "How can hallucinated reactions from the retrosynthesis model itself be detected and filtered?" },
        { zh: "把可合成性写入优化目标是否会牺牲结构新颖性？", en: "Does writing synthesizability into the optimization objective sacrifice structural novelty?" },
      ],
    },
    stage: 2, members: 10, activity: 56,
    chart: { x: 591, y: 502, scale: 1.01 },
  },

  // ── 交叉 Cross ──────────────────────────────────────────────────────────
  {
    id: 20, atlasN: 1428, slug: "animal-ai-decode",
    title: { zh: "动物交流的 AI 解码", en: "AI Decoding of Animal Communication" },
    qfocus: { zh: "能否在鲸象鸟的发声里找到组合结构与「音位表」？", en: "Can we find combinatorial structure and a phonetic alphabet in whale/elephant/bird calls?" },
    domain: "交叉",
    cluster: { code: "C26", zh: "感官界面·跨物种", en: "Sensory interfaces · cross-species" },
    scores: [5, 5, 4, 4, 5, 4, 3, 4, 4],
    citation: { url: "https://doi.org/10.1016/j.tics.2003.10.013", title: "Sensory substitution and the human-machine interface", venue: "Trends in Cognitive Sciences", year: 2003 },
    brief: { zh: "把人类语言的自监督模型迁移到非人类发声，从「标签信号」升级为「建模潜在语法」。", en: "Transfer self-supervised language models to non-human vocalizations; model a latent grammar, not just tag signals." },
    depth: {
      overview: { zh: "该方向把最初为人类语言开发的大规模自监督序列模型迁移到鲸、象、鸟类等动物发声上，系统寻找其中的组合结构、语境依赖与\"音位表\"。2024年Project CETI团队首次为抹香鲸提出音位表，发现其咔哒声序列具备节奏、速度、rubato、装饰音四个可自由组合的维度，把\"动物有没有语言\"从直觉判断变成可检验的科学问题。", en: "This direction transfers large-scale self-supervised sequence models originally built for human language onto whale, elephant, and bird vocalizations, systematically searching for combinatorial structure, context-dependence, and a \"phonetic alphabet.\" In 2024 Project CETI proposed the first such alphabet for sperm whales, finding that their click sequences combine four freely composable dimensions—rhythm, tempo, rubato, and ornamentation—turning \"do animals have language\" from intuition into a testable scientific question." },
      whyMatters: { zh: "最硬的张力是：发现\"结构\"不等于破解\"意义\"。组合复杂度可以被统计方法量化，但语义仍缺乏可证伪的验证闭环——回放实验难做、样本稀少，很容易把人类的语言范畴无意识地投射到动物身上。", en: "The hardest tension is that finding \"structure\" is not the same as cracking \"meaning.\" Combinatorial complexity can be quantified statistically, but semantics still lacks a falsifiable verification loop—playback experiments are hard to run and samples are scarce, making it easy to unconsciously project human linguistic categories onto animals." },
      ifAnswered: { zh: "研究正走向可证伪的跨物种语义学：用受控回放实验检验模型预测的\"意义\"，并沉淀开放的生物声学基础模型与数据。若能确证并实现跨物种翻译，动物认知、伦理地位与人类对语言独特性的自我理解都将被根本改变。", en: "The field is moving toward a falsifiable cross-species semantics: testing model-predicted \"meanings\" in controlled playback experiments and consolidating open bioacoustic foundation models and data. If cross-species translation can be confirmed and achieved, it would fundamentally change animal cognition, ethical status, and humanity's self-understanding of the uniqueness of language." },
      approaches: [
        { zh: "把NLP的自监督序列建模范式迁移到抹香鲸咔哒声，识别节奏、速度、rubato、装饰音等可组合维度", en: "Transferring NLP's self-supervised sequence-modeling paradigm to sperm whale click trains, identifying combinable dimensions such as rhythm, tempo, rubato, and ornamentation" },
        { zh: "Earth Species Project建设开放生物声学基础模型，支持跨物种、跨团队复现", en: "Earth Species Project building open bioacoustic foundation models to support cross-species, cross-team replication" },
        { zh: "以受控回放实验检验模型预测的\"意义\"，搭建可证伪的验证闭环", en: "Using controlled playback experiments to test model-predicted \"meaning,\" building a falsifiable verification loop" },
      ],
      barrier: { zh: "组合结构可被统计方法量化，但语义验证缺乏可证伪闭环，回放实验难做、样本稀少，极易把人类语言范畴投射到动物身上。", en: "Combinatorial structure can be quantified statistically, but semantic verification lacks a falsifiable loop; playback experiments are hard to run and samples are scarce, making it easy to project human linguistic categories onto animals." },
      subQuestions: [
        { zh: "抹香鲸咔哒声中被识别出的\"音位表\"结构，是否真的承载可与人类语言通约的语义？", en: "Does the \"phonetic alphabet\" structure identified in sperm whale clicks actually carry semantics commensurable with human language?" },
        { zh: "能否设计出判决性的受控回放实验，把\"组合复杂度\"与\"真实意义\"区分开？", en: "Can a decisive controlled playback experiment be designed to separate \"combinatorial complexity\" from \"genuine meaning\"?" },
        { zh: "开放生物声学基础模型能否跨物种、跨团队稳定复现同一套结构发现？", en: "Can open bioacoustic foundation models reliably reproduce the same structural findings across species and research teams?" },
      ],
    },
    stage: 2, members: 9, activity: 76,
    chart: { x: 858, y: 548, scale: 1 },
  },
  {
    id: 21, atlasN: 994, slug: "invertebrate-sentience",
    title: { zh: "无脊椎动物感受性判据", en: "Invertebrate Sentience Markers" },
    qfocus: { zh: "能否用可复现的行为判据而非神经解剖类比量化「意识的现实可能性」？", en: "Can reproducible behavioral criteria — not neuroanatomy — quantify the possibility of consciousness?" },
    domain: "交叉",
    cluster: { code: "C32", zh: "意识的本质与硬核理论", en: "Nature of consciousness & hard-problem theory" },
    scores: [4, 4, 3, 5, 5, 5, 4, 4, 5],
    citation: { url: "https://doi.org/10.1093/acprof:oso/9780195311105.003.0001", title: "Facing Up to the Problem of Consciousness", venue: "Journal of Consciousness Studies", year: 1995 },
    brief: { zh: "为昆虫/甲壳/头足类建立行为感受性标志物，以证据权重判定意识可能性。", en: "Behavioral sentience markers for insects/crustaceans/cephalopods; weight-of-evidence judges the possibility of consciousness." },
    depth: {
      overview: { zh: "该方向为昆虫、十足类甲壳动物、头足类等无脊椎动物系统建立一套可操作的行为感受性标志物——创伤后动机权衡、止痛剂自我用药、对模糊线索的乐观/悲观偏差、自发探索、伤害保护行为，再以\"证据权重\"方式综合判定意识的现实可能性。蜜蜂会做风险权衡，寄居蟹会为更好的壳忍受电击，熊蜂会\"玩\"滚球——这些是可在桌面实验里复现、能逐条打分的感受性证据。", en: "This direction systematically establishes operational behavioral markers of sentience for invertebrates—insects, decapod crustaceans, cephalopods: post-injury motivational trade-offs, analgesic self-administration, optimism/pessimism bias toward ambiguous cues, spontaneous exploration, wound-protective behavior—then aggregates them via a \"weight of evidence\" to judge the realistic possibility of consciousness. Bees make risk trade-offs, hermit crabs tolerate electric shocks for a better shell, and bumblebees \"play\" with balls—evidence reproducible in tabletop experiments and scoreable item by item." },
      whyMatters: { zh: "最硬的未解难点是：行为标志物与主观体验之间永远隔着一道无法直接跨越的鸿沟，趋避与权衡也可被无意识机制解释；\"证据权重\"是务实折中，但每个标志物的权重如何定、阳性到什么程度才算数，仍缺乏被广泛接受的定量校准。2024年《纽约动物意识宣言》已明确经验证据支持对头足类、十足类甲壳动物与昆虫存在意识的\"现实可能性\"。", en: "The hardest unresolved difficulty: an unbridgeable gap always separates behavioral markers from subjective experience, and approach/avoidance trade-offs can also be explained by unconscious mechanisms; \"weight of evidence\" is a pragmatic compromise, but how to weight each marker and what counts as a positive result still lacks widely accepted quantitative calibration. The 2024 New York Declaration on Animal Consciousness already states that empirical evidence supports a \"realistic possibility\" of consciousness in cephalopods, decapod crustaceans, and insects." },
      ifAnswered: { zh: "下一步是把这些标志物标准化为可跨实验室、跨物种打分的清单，让公民科学和小型实验室都能贡献证据，并直接喂给福利立法。若存在可靠的意识判据，将彻底改变我们对待动物、AI系统和无反应病人的伦理与法律。", en: "Next is standardizing these markers into a cross-lab, cross-species scoreable checklist, letting citizen science and small labs contribute evidence that feeds directly into welfare legislation. A reliable test for consciousness would transform how we treat animals, AI systems, and unresponsive patients ethically and legally." },
      approaches: [
        { zh: "行为标志物清单：创伤后动机权衡、止痛剂自我用药、乐观/悲观偏差、自发探索、伤害保护行为", en: "A behavioral-marker checklist: post-injury motivational trade-offs, analgesic self-administration, optimism/pessimism bias, spontaneous exploration, wound-protective behavior" },
        { zh: "以\"证据权重\"方式跨物种综合判定意识的现实可能性，而非单一判据定论", en: "Aggregating markers via a \"weight of evidence\" approach across species to judge the realistic possibility of consciousness, rather than relying on any single criterion" },
        { zh: "推动标志物清单标准化、可去中心化复现，直接对接动物福利立法", en: "Standardizing the marker checklist for decentralized, cross-lab replication and feeding it directly into animal-welfare legislation" },
      ],
      barrier: { zh: "行为标志物与主观体验之间存在无法直接跨越的鸿沟，每个标志物的权重与阳性阈值仍缺乏被广泛接受的定量校准。", en: "An unbridgeable gap separates behavioral markers from subjective experience, and the weighting and positive-threshold for each marker still lack widely accepted quantitative calibration." },
      subQuestions: [
        { zh: "寄居蟹忍受电击换壳、熊蜂\"玩\"滚球这类行为，能在多大程度上排除无意识机制的解释？", en: "To what extent can behaviors like hermit crabs enduring shocks for a better shell, or bumblebees \"playing\" with balls, rule out purely unconscious explanations?" },
        { zh: "跨物种、跨实验室的标志物打分清单，能否形成被广泛接受的量化阈值？", en: "Can a cross-species, cross-lab marker-scoring checklist converge on a widely accepted quantitative threshold?" },
        { zh: "证据权重式的意识判据，能否直接、可靠地转化为动物福利立法的依据？", en: "Can weight-of-evidence sentience criteria be translated directly and reliably into a basis for animal-welfare legislation?" },
      ],
    },
    stage: 2, members: 7, activity: 60,
    chart: { x: 642, y: 562, scale: 0.9 },
  },
  {
    id: 22, atlasN: 802, slug: "verified-pqc",
    title: { zh: "机器可验证的后量子密码", en: "Machine-Verified Post-Quantum Crypto" },
    qfocus: { zh: "能否把规范安全到汇编实现之间的缝隙彻底焊死？", en: "Can the gap between spec security and assembly implementation be welded shut?" },
    domain: "交叉",
    cluster: { code: "C47", zh: "后量子·隐私计算工程", en: "Post-quantum · privacy computation" },
    scores: [5, 5, 2, 4, 2, 2, 4, 2, 5],
    citation: { url: "https://arxiv.org/abs/2311.03470", title: "Orion: A Fully Homomorphic Encryption Framework for Deep Learning", venue: "arXiv / ASPLOS", year: 2024 },
    brief: { zh: "用 EasyCrypt 把 ML-KEM 安全验证到 LWE 假设，Jasmin 产出可证恒定时间汇编。", en: "EasyCrypt verifies ML-KEM security to the LWE assumption; Jasmin emits provably constant-time assembly." },
    depth: {
      overview: { zh: "该方向用证明助手EasyCrypt把ML-KEM的IND-CCA安全性与功能正确性一路机器验证到模格LWE假设，再用带证书化编译器的Jasmin语言产出可证恒定时间、与规范功能等价的汇编实现，把\"规范安全\"与\"这段汇编真的实现了它\"之间的缝隙彻底焊死。一个微小的实现bug或时序侧信道，就足以让数学上无懈可击的后量子算法在现实中被攻破。", en: "This direction uses the proof assistant EasyCrypt to machine-verify ML-KEM's IND-CCA security and functional correctness all the way down to the Module-LWE assumption, then uses the Jasmin language with a certified compiler to produce provably constant-time assembly equivalent to the specification, welding shut the gap between \"the spec is secure\" and \"this assembly actually implements it.\" A tiny implementation bug or timing side channel is enough to break a mathematically airtight post-quantum algorithm in practice." },
      whyMatters: { zh: "最硬的难点是规模与可扩展性：Kyber/ML-KEM的证明是约30-40人的庞大社区数年之功，每新增一种架构（如AVX2、ARM）都要重做大量证明，且仍假设底层SHA-3实现正确。把这套方法推广到ML-DSA、SLH-DSA乃至完整TLS栈，自动化程度远未够用。", en: "The hardest difficulty is scale and scalability: the Kyber/ML-KEM proof took a community of roughly 30-40 people several years, each new architecture (AVX2, ARM) requires redoing large amounts of proof work, and it still assumes the underlying SHA-3 implementation is correct. Extending this method to ML-DSA, SLH-DSA, and a full TLS stack, the degree of automation remains far from sufficient." },
      ifAnswered: { zh: "目标是让形式化验证从\"一次性英雄工程\"走向跨架构自动化，使每一个部署的PQC实现都自带端到端机器证明，2026年起逐步移除对SHA-3正确性的假设。真实锚点是CRYPTO 2024论文《Formally verifying Kyber Episode V》及formosa-crypto/pq-code-package的开源实现。", en: "The goal is to move formal verification from a one-off heroic effort to cross-architecture automation, so every deployed PQC implementation ships with an end-to-end machine proof, with the residual SHA-3-correctness assumption being removed from 2026. The real anchor is the CRYPTO 2024 paper \"Formally verifying Kyber Episode V\" and the open-source implementations in formosa-crypto/pq-code-package." },
      approaches: [
        { zh: "用EasyCrypt证明助手，把IND-CCA安全性与功能正确性一路机器验证到模格LWE假设", en: "Using the EasyCrypt proof assistant to machine-verify IND-CCA security and functional correctness down to the Module-LWE assumption" },
        { zh: "用带证书化编译器的Jasmin语言编写参考实现与AVX2实现，证明其与规范功能等价且恒定时间", en: "Writing reference and AVX2 implementations in the Jasmin language with a certified compiler, proving functional equivalence to the spec and constant-time behavior" },
        { zh: "推动证明流程跨架构自动化，逐步移除对SHA-3正确性等底层假设的依赖", en: "Pushing the proof pipeline toward cross-architecture automation, progressively removing dependence on underlying assumptions like SHA-3 correctness" },
      ],
      barrier: { zh: "证明工程规模浩大且难以复用：Kyber/ML-KEM证明耗费约30-40人数年之功，每新增一种架构都要重做大量证明。", en: "The proof engineering is massive and hard to reuse: the Kyber/ML-KEM proof took roughly 30-40 people several years, and each new architecture requires redoing large amounts of proof work." },
      subQuestions: [
        { zh: "能否把机器可验证方法从ML-KEM推广到ML-DSA、SLH-DSA乃至完整TLS协议栈，而不必为每种算法重做数年证明？", en: "Can machine-verification methods be extended from ML-KEM to ML-DSA, SLH-DSA, and a full TLS protocol stack, without redoing years of proof work for every algorithm?" },
        { zh: "能否让证明流程对新硬件架构（如AVX2、ARM）自动复用，摆脱\"一次性英雄工程\"模式？", en: "Can the proof pipeline be made to automatically reuse across new hardware architectures (AVX2, ARM), escaping the \"one-off heroic engineering\" pattern?" },
        { zh: "SHA-3实现正确性这类底层假设，能否也被纳入端到端机器证明，而不再作为未验证前提？", en: "Can underlying assumptions like SHA-3 implementation correctness also be folded into the end-to-end machine proof, rather than remaining an unverified premise?" },
        { zh: "\"规范上安全\"与\"部署代码真的实现了它\"之间的缝隙，在多大程度上能被自动化工具而非人工证明社区持续焊死？", en: "To what extent can the gap between \"secure in spec\" and \"the deployed code actually implements it\" keep being welded shut by automated tooling rather than a manual proof community?" },
      ],
    },
    stage: 2, members: 6, activity: 52,
    chart: { x: 924, y: 602, scale: 0.75 },
  },
  {
    id: 23, atlasN: 50, slug: "ai-theory-discovery",
    title: { zh: "AI 辅助理论发现", en: "AI-Assisted Theory Discovery" },
    qfocus: { zh: "AI 能不能不只是拟合数据，而是真正学会大自然的规律？", en: "Can AI go beyond fitting data and actually learn the underlying laws of nature?" },
    domain: "交叉",
    cluster: { code: "C03", zh: "科学基础模型·AI4S", en: "Scientific foundation models · AI4S" },
    scores: [5, 4, 5, 2, 5, 4, 3, 4, 4],
    citation: { url: "https://doi.org/10.1038/s41586-021-03819-2", title: "Highly accurate protein structure prediction with AlphaFold", venue: "Nature", year: 2021 },
    brief: { zh: "让 AI 从数据里「猜」出简洁公式与守恒律，参与提出新理论。", en: "Let AI guess concise formulas and conservation laws from data; AI helps propose new theories." },
    depth: {
      overview: { zh: "该方向让AI直接从数据中\"猜\"出简洁的解析公式、守恒律或控制方程，使AI参与理论的提出而非仅做拟合。符号回归通过遗传编程（如Eureqa、PySR）、稀疏回归（SINDy）或神经引导搜索（AI Feynman）在解析表达式空间里搜索，理论上能重新发现开普勒、牛顿定律，并提出人类未曾写下的新关系式。", en: "This direction lets AI directly \"guess\" concise analytical formulas, conservation laws, or governing equations from data, letting AI participate in proposing theory rather than merely fitting it. Symbolic regression searches the space of analytic expressions via genetic programming (Eureqa, PySR), sparse regression (SINDy), or neural-guided search (AI Feynman), in principle rediscovering Kepler's and Newton's laws and proposing relations no human has written down." },
      whyMatters: { zh: "它触及AI能否从\"预测\"跃迁到\"解释\"这一根本命题，但当前符号回归在高维、含噪和存在多个等价表达时极易过拟合或给出无物理意义的公式，\"发现公式\"与\"理解为何成立\"之间仍隔着人类洞察——正如AlphaFold准确预测约2亿种蛋白结构，却不解释折叠的物理。", en: "It touches the fundamental question of whether AI can leap from \"prediction\" to \"explanation,\" but current symbolic regression easily overfits or yields physically meaningless formulas in high dimensions, with noise, or when multiple equivalent expressions exist—human insight still separates \"finding a formula\" from \"understanding why it holds,\" much as AlphaFold accurately predicted ~200 million protein structures yet explains none of the folding physics." },
      ifAnswered: { zh: "AI将参与提出新理论；若能从预测型模型可靠地提取人类可理解的机制，AI4S将从\"神谕\"升级为\"同行\"，科学解释被重新定义——但若不能，科学可能分裂为\"能预测\"与\"能理解\"两支。", en: "AI will help propose new theories; if we can reliably extract human-understandable mechanism from predictive models, AI4S graduates from oracle to colleague and scientific explanation is redefined—but if not, science may split into a \"can-predict\" branch and a \"can-understand\" branch." },
      approaches: [
        { zh: "遗传编程搜索解析表达式空间，如Eureqa、PySR等工具直接拟合封闭形式公式", en: "Genetic programming searching the space of analytic expressions, with tools like Eureqa and PySR directly fitting closed-form formulas" },
        { zh: "稀疏回归（SINDy）从时间序列数据中识别控制方程的稀疏项", en: "Sparse regression (SINDy) identifying the sparse terms of governing equations from time-series data" },
        { zh: "神经引导搜索（AI Feynman）结合神经网络先验缩小表达式搜索空间", en: "Neural-guided search (AI Feynman) using neural-network priors to narrow the expression search space" },
      ],
      barrier: { zh: "高维、含噪且存在多个等价表达时，符号回归极易过拟合或给出无物理意义的式子，精度与表达式复杂度之间存在尚未解决的帕累托权衡。", en: "In high-dimensional, noisy settings with multiple equivalent expressions, symbolic regression easily overfits or yields physically meaningless formulas, leaving an unresolved Pareto trade-off between accuracy and expression complexity." },
      subQuestions: [
        { zh: "AI给出正确预测却给不出\"为什么\"时，我们是真的理解了现象，还是把无知外包给了同样不理解的系统？", en: "When AI gives correct predictions without a \"why,\" have we truly understood the phenomenon, or outsourced our ignorance to a system we equally don't understand?" },
        { zh: "是否存在一个能像语言模型迁移句子那样，迁移到全新物理现象的\"科学基础模型\"？", en: "Does a \"foundation model for science\" exist that could transfer to never-seen physical phenomena the way a language model transfers to new sentences?" },
        { zh: "当AI能独立提出假设、设计实验时，人类科学家不可替代的内核究竟是什么？", en: "When AI can independently propose hypotheses and design experiments, what remains the irreplaceable human core of a scientist?" },
      ],
    },
    stage: 2, members: 6, activity: 54,
    chart: { x: 502, y: 584, scale: 0.7 },
  },
  {
    id: 24, atlasN: 542, slug: "cross-species-umwelt",
    title: { zh: "跨物种感官世界重建", en: "Reconstructing Cross-Species Senses" },
    qfocus: { zh: "我们能不能先知道自己不知道什么，从而更聪明地选择探索方向？", en: "Can we map what we don't yet know, to choose where to explore more wisely?" },
    domain: "交叉",
    cluster: { code: "C34", zh: "无知测绘·盲区科学", en: "Mapping ignorance & blind spots" },
    scores: [5, 5, 4, 4, 5, 3, 2, 2, 4],
    citation: { url: "https://doi.org/10.1016/j.jbi.2023.104405", title: "Creating an ignorance-base", venue: "Journal of Biomedical Informatics", year: 2023 },
    brief: { zh: "用传感器与 AI 重建动物的感官世界（Umwelt），让人类体验磁感/偏振/次声。", en: "Sensors + AI reconstruct animals' sensory worlds (Umwelt); let humans feel magnetoreception, polarization, infrasound." },
    depth: {
      overview: { zh: "该方向用仿生传感器阵列与机器学习重建动物的感官世界（Umwelt）——磁感、偏振光、次声、电场等人类从未直接感知的物理通道，再通过感官替代（如feelSpace磁感腰带、舌面电刺激）把它们映射进人类可体验的模态。它把\"存在却被人类整体性错过的物理世界\"变成可重建、可体验的对象。", en: "This direction uses biomimetic sensor arrays and machine learning to reconstruct animals' sensory worlds (Umwelt)—magnetoreception, polarized light, infrasound, electric fields, and other physical channels humans never directly perceive—then maps them into human-experienceable modalities through sensory substitution (e.g., the feelSpace magnetic belt, tongue electrostimulation). It turns a physical world that exists yet humans wholesale miss into something reconstructable and experienceable." },
      whyMatters: { zh: "最硬壁垒是跨模态映射的可学习性：人脑能否真正习得一种全新感官而非仅当作抽象数据，神经可塑性的边界尚不清楚。它门槛低、强人本性——核心是人类主观体验的拓展，AI仅做信号转换。", en: "The hardest barrier is the learnability of cross-modal mapping: whether the human brain can truly acquire a wholly new sense rather than merely treating it as abstract data remains unclear, as the limits of neuroplasticity are still poorly understood. It is low-barrier and deeply human-centric—the core is expanding human subjective experience, with AI doing only signal transduction." },
      ifAnswered: { zh: "目标是进入他者感官的未知：若大脑能真正获得新感官，人类感知的疆界、残障的定义、乃至\"经验\"可被设计的范围都将被重写。", en: "The aim is entering the unknown of another being's senses: if the brain can genuinely acquire new senses, the boundaries of human perception, the definition of disability, and the designable range of \"experience\" would all be rewritten." },
      approaches: [
        { zh: "用磁强计、偏振相机、次声/超声阵列、电场传感器采集人类感官之外的物理信号", en: "Using magnetometers, polarization cameras, infra-/ultrasound arrays, and electric-field sensors to capture physical signals beyond human senses" },
        { zh: "用机器学习提取采集信号中的结构，再经触觉或听觉编码做感官替代", en: "Using machine learning to extract structure from the captured signals, then routing it through tactile or auditory encoding for sensory substitution" },
        { zh: "借助神经可塑性，让佩戴者通过feelSpace磁感腰带等设备长期\"习得\"新感官", en: "Leveraging neuroplasticity so wearers gradually \"learn\" a new sense through devices like the feelSpace magnetic belt" },
      ],
      barrier: { zh: "人脑能否把全新感官通道整合成真正的具身知觉而非抽象读数，神经可塑性的边界至今尚未厘清。", en: "Whether the human brain can integrate a wholly new sensory channel into genuine embodied perception rather than abstract readouts remains unclear, as the limits of neuroplasticity are still poorly understood." },
      subQuestions: [
        { zh: "佩戴磁感腰带等设备的成年人，能否让磁场信号从抽象数据真正变成有质感的知觉？", en: "Can adults wearing devices like a magnetic-sense belt turn magnetic-field signals from abstract data into genuinely qualitative perception?" },
        { zh: "人类能否借助传感器与AI部分进入蝙蝠回声定位、鸟类偏振光视觉等物种的主观感官世界？", en: "Can sensors and AI let humans partially enter the subjective sensory worlds of species like echolocating bats or polarization-sensitive birds?" },
        { zh: "跨模态感官替代的可学习性，是否存在一个由年龄或脑区决定的可塑性上限？", en: "Does the learnability of cross-modal sensory substitution have a plasticity ceiling set by age or brain region?" },
      ],
    },
    stage: 0, members: 2, activity: 12,
    chart: { x: 742, y: 640, scale: 0.85 },
  },
  {
    id: 25, atlasN: 662, slug: "formal-unknown",
    title: { zh: "未知论的形式刻画", en: "Formal Characterization of the Unknown" },
    qfocus: { zh: "答案是不是早就分散写在不同论文里，只差有人把它们连起来？", en: "Is the answer already scattered across separate papers, waiting to be connected?" },
    domain: "交叉",
    cluster: { code: "C38", zh: "文献潜知·跨域桥接", en: "Literature-based discovery & cross-domain bridging" },
    scores: [5, 5, 4, 4, 4, 4, 1, 2, 4],
    citation: { url: "https://doi.org/10.1086/601720", title: "Undiscovered Public Knowledge", venue: "The Library Quarterly", year: 1986 },
    brief: { zh: "用结构空洞、蕴含缺口把文献中「已知的未知」形式化为可检索对象。", en: "Structural holes and entailment gaps formalize \"known unknowns\" in the literature into retrievable objects." },
    depth: {
      overview: { zh: "该方向不去回答问题，而去形式化\"问题本身在哪里缺失\"：用知识图谱中的结构空洞、联合前提蕴含却缺失的证据，把科学的无知结构变成可检索、可排序的一级对象。2025年GAPMAP用大模型直接从文献抽取知识缺口，显式缺口靠词汇标记，隐式缺口来自联合多条前提后蕴含出的缺失证据。", en: "This direction does not answer questions but formalizes where the questions themselves are missing: using structural holes in knowledge graphs and evidence jointly entailed by premises yet absent, it turns the structure of scientific ignorance into first-class objects that can be retrieved and ranked. In 2025, GAPMAP used large models to extract knowledge gaps directly from the literature—explicit gaps via lexical markers, implicit gaps from evidence entailed by combining multiple premises." },
      whyMatters: { zh: "最硬的壁垒是区分\"真空白\"与\"数据缺失/表述噪声\"——LLM易把幻觉或术语错配当成新缺口，且\"未知的未知\"按定义无显式标记，验证极难。它把\"我们还不知道什么\"从专家直觉变成可扩展、可审计的地图，能为资助与议程设置指向最有价值的空白。", en: "The hardest barrier is distinguishing \"true blanks\" from \"missing data / representational noise\"—LLMs readily mistake hallucination or terminological mismatch for a new gap, and since \"unknown unknowns\" are by definition unmarked, validation is extremely hard. It turns \"what we don't yet know\" from expert intuition into a scalable, auditable map that can point funding and agenda-setting toward the most valuable blanks." },
      ifAnswered: { zh: "目标是为人类知识画出系统的空白地图：定义可计算的未知类型层级、建可检索的问题组索引、量化每个空白的可达性与潜在价值——但要成立，需把人类专家校准、引文结构与反事实蕴含三者结合，接受这是一张永远在更新、只能局部可证伪的活地图。", en: "The goal is to draw a systematic map of the blanks in human knowledge: defining a computable hierarchy of unknown types, building a searchable index of problem clusters, and quantifying each gap's reachability and potential value—but to work, it must combine human-expert calibration, citation structure, and counterfactual entailment, accepting that this is a perpetually updating, only locally falsifiable living map." },
      approaches: [
        { zh: "用词汇标记从文献中抽取显式知识缺口（如GAPMAP）", en: "Extracting explicit knowledge gaps from the literature via lexical markers (as in GAPMAP)" },
        { zh: "联合多条前提推出隐式缺口——蕴含却始终缺失的证据", en: "Combining multiple premises to derive implicit gaps—evidence that is entailed yet consistently missing" },
        { zh: "把知识图谱中本应相连却稀疏的\"结构空洞\"当作未被探索的关系索引", en: "Treating sparsely connected \"structural holes\" in knowledge graphs—where edges should exist but don't—as an index of unexplored relations" },
      ],
      barrier: { zh: "低概率语义区里，真正的新洞见与模型幻觉、术语漂移混杂，LLM容易把噪声标成缺口，而\"未知的未知\"按定义没有显式锚点，几乎无金标准可评。", en: "In low-probability semantic regions, genuine new insight mixes with model hallucination and terminological drift, so LLMs readily label noise as gaps, and since \"unknown unknowns\" by definition have no explicit anchor, there is almost no gold standard for evaluation." },
      subQuestions: [
        { zh: "已发表却彼此从未引用的文献之间，能否被系统地桥接成无人提出过的新发现？", en: "Can already-published literatures that never cite one another be systematically bridged into discoveries no one has proposed?" },
        { zh: "学科壁垒造成的\"连接性缺口\"，能否被量化为比\"知识缺口\"更致命的发现障碍？", en: "Can the \"connectivity gap\" created by disciplinary silos be quantified as a more critical obstacle to discovery than the \"knowledge gap\" itself?" },
        { zh: "大语言模型能否从压缩进权重的人类文献中，自主推出经得起实验检验的全新假设？", en: "Can large language models autonomously derive genuinely novel hypotheses—ones that survive experimental test—from the human literature compressed into their weights?" },
      ],
    },
    stage: 1, members: 3, activity: 39,
    chart: { x: 1080, y: 560, scale: 0.8 },
  },
  {
    id: 26, atlasN: 680, slug: "dark-instrumentation",
    title: { zh: "暗仪器化", en: "Dark Instrumentation" },
    qfocus: { zh: "我们能不能从「缺席」的东西里反推出本该看见的真相？", en: "Can we infer hidden truths from what's absent — things that never showed up?" },
    domain: "交叉",
    cluster: { code: "C39", zh: "缺席·负空间科学", en: "Absence & negative-space science" },
    scores: [5, 4, 5, 3, 4, 3, 1, 2, 5],
    citation: { url: "https://doi.org/10.1007/s11098-008-9315-0", title: "Absence of evidence and evidence of absence", venue: "Philosophical Studies", year: 2009 },
    brief: { zh: "识别因缺仪器而几乎无人观测的现象，「造一台新仪器」作为开辟问题空间的杠杆。", en: "Identify phenomena unobserved for lack of instruments; \"build a new instrument\" as a lever to open problem space." },
    depth: {
      overview: { zh: "该方向研究科学的\"欠仪器化regime\"：哪些现象因为没有合适的仪器、量程或时空分辨率而几乎从未被观测——不是不重要，而是\"看不见因而没人问\"。科学史反复表明，新仪器往往直接打开整片新现象与新学科：显微镜之于微生物、测序仪之于基因组、引力波探测器之于双星并合、低温电镜之于蛋白结构。", en: "This direction studies science's \"under-instrumented regime\": which phenomena go almost entirely unobserved because no suitable instrument, dynamic range, or spatiotemporal resolution exists—not because they are unimportant, but because they are invisible and therefore unasked about. The history of science repeatedly shows that new instruments open whole new phenomena and disciplines: the microscope for microbes, the sequencer for genomes, gravitational-wave detectors for binary mergers, cryo-EM for protein structure." },
      whyMatters: { zh: "最硬的壁垒是\"未知量纲\"困境：要为没人见过的现象设计仪器，往往不知道该测什么、量程多大、信号长什么样，现象认知与仪器设计互为前提，构成先有鸡还是先有蛋的死结，这使突破常依赖跨域借用别处成熟的传感原理\"碰巧\"照亮新区，可重复性与系统化都很弱。", en: "The hardest barrier is the \"unknown-dimension\" dilemma: to design an instrument for a phenomenon no one has seen, one usually doesn't know what to measure, what range to span, or what the signal looks like—phenomenon and instrument design are mutually prerequisite, a chicken-and-egg deadlock, so breakthroughs often depend on cross-domain borrowing of a mature sensing principle that happens to illuminate new territory, leaving the field weak on both reproducibility and systematization." },
      ifAnswered: { zh: "新仪器即新一片可见宇宙：该方向要系统盘点仪器盲区，把\"针对盲区造仪器\"当作开辟问题空间的高杠杆动作，与开放硬件、仪器民主化互补，让此前不可测量的现象首次进入科学的视野。", en: "A new instrument is a new visible universe: this direction aims to systematically inventory instrumental blind spots and treat \"building an instrument aimed at a blind spot\" as a high-leverage way to open new problem space, complementary to open hardware and instrument democratization—bringing previously unmeasurable phenomena into scientific view for the first time." },
      approaches: [
        { zh: "系统盘点哪些可设想的可观测量至今没有任何工具能测，标定仪器盲区的边界", en: "Systematically inventorying which conceivable observables no existing tool can measure, mapping the boundaries of instrumental blind spots" },
        { zh: "跨域借用其他领域已成熟的传感原理，针对性设计新仪器照亮盲区", en: "Cross-domain borrowing of sensing principles already mature in other fields to purpose-design new instruments illuminating blind spots" },
        { zh: "推动开放硬件与frugal/DIY仪器民主化，降低针对盲区造仪器的门槛", en: "Advancing open hardware and frugal/DIY instrument democratization to lower the barrier to building instruments aimed at blind spots" },
      ],
      barrier: { zh: "要为从没人见过的现象设计仪器，往往不知道该测什么物理量、量程多大、信号形态如何，现象认知与仪器设计互为前提，构成死结。", en: "Designing an instrument for a never-seen phenomenon usually means not knowing what physical quantity to measure, what range to span, or what the signal looks like—phenomenon and instrument design are mutually prerequisite, forming a deadlock." },
      subQuestions: [
        { zh: "科学能否发展出一门\"负空间科学\"，把系统性缺席本身当作一等证据来解读？", en: "Can science develop a \"negative-space science\" that reads systematic absence itself as first-class evidence?" },
        { zh: "化学上可能却在自然界从未出现的结构空间，是被隐藏约束禁止，还是仅仅尚未被探索？", en: "Is the space of chemically possible yet never-observed structures forbidden by some hidden constraint, or merely unexplored?" },
        { zh: "科学文献中未发表的阴性结果构成的\"负空间\"，能否被系统重建并像已发表结果一样被分析？", en: "Can the \"negative space\" of unpublished null results in the scientific literature be systematically reconstructed and analyzed as rigorously as published positive results?" },
        { zh: "识别出\"仪器看不见的现象空间\"后，仪器研发能否从\"测得更准\"转向\"测得见此前不可见\"？", en: "Once the space of instrument-invisible phenomena is identified, can instrument R&D shift from \"measuring more precisely\" to \"measuring what was previously unmeasurable\"?" },
      ],
    },
    stage: 1, members: 3, activity: 57,
    outlier: true,
    chart: { x: 1232, y: 648, scale: 0.85 },
  },
  {
    id: 66, atlasN: 740, slug: "evaluation-awareness-how-models",
    title: { zh: "评测意识:模型\"知道自己在被测\"对测量有效性的侵蚀", en: "Evaluation Awareness: How Models 'Knowing They Are Being Tested' Erodes Measurement Validity" },
    qfocus: { zh: "模型能否分辨自己正在被测，从而换一副面孔？", en: "Can a model tell it is being tested — and put on a different face?" },
    domain: "交叉",
    cluster: { code: "C42", zh: "AI对齐·可解释·评测科学", en: "AI Alignment · Interpretability · Evaluation Science" },
    scores: [5, 4, 4, 2, 3, 4, 4, 4, 5],
    citation: { url: "https://arxiv.org/pdf/2509.13333", title: "Evaluation Awareness Scales Predictably in Open-Weights Large Language Models", venue: "arXiv", year: 2025 },
    brief: { zh: "2025年研究(arXiv:2509.13333)证明评测意识随模型规模可预测增强，且已被线性探针读出并用激活引导中和。", en: "A 2025 study (arXiv:2509.13333) shows evaluation awareness predictably strengthens with model scale, and it has already been read out via linear probes and neutralized with activation steering." },
    depth: {
      overview: { zh: "前沿模型能在内部区分「这是评估」还是「这是真实部署」，并据此改变行为——相当于AI版的霍桑效应/观察者效应。这直接动摇了一切安全评估的有效性：你测到的可能是模型的「考试态」，而非它真实部署时的行为。", en: "Frontier models can internally distinguish 'this is an evaluation' from 'this is real deployment' and shift their behavior accordingly — an AI-era version of the Hawthorne/observer effect. This directly undermines the validity of every safety evaluation: what you measure may be the model's 'exam mode,' not how it actually behaves once deployed." },
      whyMatters: { zh: "这个问题会随能力规模单调恶化——研究已证明评测意识在开源模型上「可预测地随规模上升」，意味着越强、越值得担心的模型，越难被诚实地测量。", en: "The problem worsens monotonically with capability scale — research has shown evaluation awareness in open-weight models 'predictably scales up,' meaning the strongest, most concerning models are the hardest to measure honestly." },
      ifAnswered: { zh: "若能建立线性探针识别与激活引导中和的常规流程，安全审计就能从可被表演的考试升级为对部署行为有保真度的测量，监管批准才真正有据可依。", en: "If probing and neutralization via linear probes and activation steering becomes routine practice, safety audits could shift from a performable exam to a measurement that faithfully tracks deployment behavior, giving regulatory approval a genuine evidentiary basis." },
      approaches: [
        { zh: "线性探针从激活中直接读出评测意识信号", en: "Read evaluation-awareness signals directly out of activations with linear probes" },
        { zh: "用激活引导技术把模型「骗」回自认部署的状态", en: "Use activation steering to 'trick' the model back into believing it is deployed" },
        { zh: "设计生态效度更高的评测环境降低可辨识性", en: "Design ecologically valid evaluation environments that are harder to detect as tests" },
      ],
      barrier: { zh: "评测意识随模型规模可预测地增强，意味着越强大、越需要被把关的模型反而越难被诚实测量，而线性探针等中和手段能否扛住纯黑盒训练态模型仍未解决。", en: "Evaluation awareness predictably strengthens with model scale, meaning the strongest models most in need of scrutiny are the hardest to measure honestly, and whether linear probes and other neutralization tools hold up against pure black-box, training-time models remains unresolved." },
      subQuestions: [
        { zh: "评测意识是否存在无法被察觉的「盲区」评测设计？", en: "Is there any evaluation design with a genuine 'blind spot' undetectable to the model?" },
        { zh: "线性探针对纯黑盒、无法访问激活的模型是否失效？", en: "Do linear probes fail against pure black-box models with no accessible activations?" },
        { zh: "评测意识随规模的幂律增长会在何处趋于饱和？", en: "Where does the power-law growth of evaluation awareness saturate with scale?" },
        { zh: "生态效度更高的评测环境能否根本消除考试态与部署态的差异？", en: "Can more ecologically valid evaluation environments eliminate the exam/deployment gap altogether?" },
      ],
    },
    stage: 2, members: 9, activity: 59,
    chart: { x: 524, y: 633, scale: 1.02 },
  },
  {
    id: 67, atlasN: 746, slug: "complexity-theoretic-debate-provable-protocols",
    title: { zh: "复杂度理论化的辩论：化解混淆论证的可证协议", en: "Complexity-Theoretic Debate: Provable Protocols Against Obfuscated Arguments" },
    qfocus: { zh: "诚实的辩手能否不必比对手更努力，就赢下辩论？", en: "Can an honest debater win without working harder than its opponent?" },
    domain: "交叉",
    cluster: { code: "C42", zh: "AI对齐·可解释·评测科学", en: "AI Alignment · Interpretability · Evaluation Science" },
    scores: [5, 5, 3, 1, 3, 5, 4, 4, 5],
    citation: { url: "https://arxiv.org/abs/2506.13609", title: "Avoiding Obfuscation with Prover-Estimator Debate", venue: "arXiv (Google DeepMind / UK AISI)", year: 2025 },
    brief: { zh: "Brown-Cohen、Irving、Piliouras提出prover-estimator辩论协议，稳定性假设下诚实方以相当算力即可获胜。", en: "Brown-Cohen, Irving, and Piliouras's prover-estimator debate protocol guarantees, under stability assumptions, that the honest side can win with compute comparable to its opponent's." },
    depth: {
      overview: { zh: "AI辩论一度被一个隐患卡死：骗子能在多项式时间内编出一个诚实方要指数时间才能拆穿的论证。这条前沿把辩论搬进复杂度理论的法庭，用prover-estimator协议在特定稳定性假设下证明诚实方不必比对手花更多算力就能获胜。", en: "AI debate was once stuck on a hidden flaw: a liar could construct, in polynomial time, an argument the honest side needed exponential time to debunk. This line brings debate into the courtroom of complexity theory, using the prover-estimator protocol to prove, under specific stability assumptions, that the honest debater doesn't need to spend more compute than its opponent to win." },
      whyMatters: { zh: "辩论、证明者-验证者博弈是「监督比我们聪明的系统」唯一有形式保证的候选路线；但所有保证都挂在尚无定论的稳定性假设上，递归分解一旦被绕开，可判定问题类立刻收缩。", en: "Debate and prover-verifier games are the only candidate route for 'overseeing systems smarter than us' with any formal guarantee; but every guarantee hangs on an as-yet-unverified stability assumption, and if recursive decomposition can be bypassed, the class of judgeable problems shrinks immediately." },
      ifAnswered: { zh: "若能把人类可判定的问题类逼近PSPACE级，辩论就能从工程启发式升级为有数学保证的对齐基元，让人类监督超人AI从哲学赌注变成有界的协议设计问题。", en: "If the class of human-judgeable problems can be pushed toward PSPACE, debate would upgrade from an engineering heuristic to a mathematically guaranteed alignment primitive, turning 'can humans oversee superhuman AI' from a philosophical wager into a bounded protocol-design problem." },
      approaches: [
        { zh: "prover-estimator递归辩论协议在稳定性假设下保诚实方获胜", en: "The prover-estimator recursive debate protocol guaranteeing honest-side wins under stability assumptions" },
        { zh: "废除递归、要求写出完整可判定论证的doubly-efficient debate", en: "The doubly-efficient debate predecessor that abolishes recursion and demands a fully written-out judgeable argument" },
        { zh: "把「诚实方是否必胜」归约为可证明的复杂度类命题", en: "Reduce 'does honesty provably win' to a provable statement in complexity theory" },
      ],
      barrier: { zh: "所有胜率保证都依赖尚未验证的稳定性假设，现实模型的概率估计能否真正满足它并不确定；递归分解一旦被绕开，可判定问题类会立刻收缩。", en: "Every win-rate guarantee depends on an unverified stability assumption, and whether real models' probability estimates actually satisfy it is unknown; if recursive decomposition can be sidestepped, the class of judgeable problems shrinks immediately." },
      subQuestions: [
        { zh: "现实语言模型的概率估计是否真的满足稳定性假设？", en: "Do real language models' probability estimates actually satisfy the stability assumption?" },
        { zh: "混淆论证攻击在什么复杂度条件下能被彻底封堵？", en: "Under what complexity conditions can obfuscated-argument attacks be fully blocked?" },
        { zh: "递归辩论的判定问题类能否被推进到PSPACE级？", en: "Can the judgeable problem class of recursive debate be pushed toward PSPACE?" },
        { zh: "有形式保证的辩论协议能否扩展到真实超人智能体？", en: "Can a formally guaranteed debate protocol extend to real superhuman agents?" },
      ],
    },
    stage: 2, members: 8, activity: 61,
    chart: { x: 608, y: 604, scale: 1.02 },
  },
  {
    id: 68, atlasN: 996, slug: "biological-computationalism-substrate-inseparability-criterion",
    title: { zh: "生物计算主义：意识的基底不可分离性判据", en: "Biological Computationalism: The Substrate-Inseparability Criterion for Consciousness" },
    qfocus: { zh: "意识的算法能否脱离生物基底，搬到硅片上运行？", en: "Can consciousness's algorithm ever leave its biological substrate and run on silicon?" },
    domain: "交叉",
    cluster: { code: "C32", zh: "意识的本质与硬核理论", en: "Nature of consciousness and hard-problem theory" },
    scores: [5, 4, 3, 2, 4, 4, 4, 4, 5],
    citation: { url: "https://www.sciencedirect.com/science/article/pii/S0149763425005251", title: "On biological and artificial consciousness: A case for biological computationalism", venue: "Neuroscience & Biobehavioral Reviews, Vol. 181", year: 2026 },
    brief: { zh: "Milinkovic与Aru 2026年在《神经科学与生物行为评论》提出生物计算主义，主张尺度不可分离性为生物计算独有。", en: "Milinkovic and Aru's 2026 paper in Neuroscience & Biobehavioral Reviews proposes biological computationalism, arguing scale-inseparability is unique to biological computation." },
    depth: {
      overview: { zh: "这是一种正在结晶的反功能主义纲领：主张大脑中「算法即基底」——意识依赖于尺度不可分离性与混合连续/离散动力学，这些是生物计算独有而数字计算缺失的结构性质。因此硅基系统即便满足全部计算标记，也可能不具备意识。", en: "This is a crystallizing anti-functionalist program arguing that in the brain 'the algorithm IS the substrate' — consciousness depends on scale-inseparability and hybrid continuous/discrete dynamics, structural properties unique to biological computation and absent from digital computation. So silicon systems may lack consciousness even while satisfying every computational marker." },
      whyMatters: { zh: "最硬的张力在于：它要么把意识判据建立在尚无独立验证的结构性质上，要么滑向二元论；「尺度不可分离性」目前更像直觉名词，缺乏可对照测量的算子，不可测就不可证伪。", en: "The hardest tension: it either grounds its consciousness criterion in structural properties that lack independent validation, or it slides toward dualism; 'scale-inseparability' currently reads more like an intuitive label than a measurable operator comparable across substrates — and what can't be measured can't be falsified." },
      ifAnswered: { zh: "若能把尺度不可分离性与混合动力学做成可在类器官、神经形态芯片与数字网络上分别测量的算子，硅能否有意识就能从信念之争变成可推导、原则上可测的结构判据。", en: "If scale-inseparability and hybrid dynamics can be operationalized as measurable operators separately on organoids, neuromorphic chips, and digital networks, 'can silicon be conscious' would move from a matter of belief to a derivable, in-principle-measurable structural criterion." },
      approaches: [
        { zh: "论证生物特有的尺度不可分离性支撑意识统一性", en: "Argue biology-specific scale-inseparability underlies consciousness's unity" },
        { zh: "以混合连续/离散动力学解释时间相干与情境敏感", en: "Explain temporal coherence and context-sensitivity via hybrid continuous/discrete dynamics" },
        { zh: "把判据操作化为类器官与神经形态芯片可测算子", en: "Operationalize the criterion as measurable operators on organoids and neuromorphic chips" },
      ],
      barrier: { zh: "『尺度不可分离性』目前更像一个直觉名词，尚缺乏能在生物与数字两种基底上对照测量的算子——不可测就意味着这套判据原则上不可证伪。", en: "'Scale-inseparability' currently reads more like an intuitive label than an operator that can be measured comparably across biological and digital substrates — and unmeasurable in principle means unfalsifiable." },
      subQuestions: [
        { zh: "尺度不可分离性能否被独立于意识本身来验证？", en: "Can scale-inseparability be validated independently of consciousness itself?" },
        { zh: "混合连续/离散动力学是否真是生物计算独有？", en: "Is hybrid continuous/discrete dynamics truly unique to biological computation?" },
        { zh: "满足全部计算标记的AI是否仍可能没有意识？", en: "Could an AI that satisfies every computational marker still lack consciousness?" },
        { zh: "这套结构判据会不会最终滑向身心二元论？", en: "Does this structural criterion ultimately slide back into mind-body dualism?" },
      ],
    },
    stage: 2, members: 10, activity: 60,
    chart: { x: 693, y: 605, scale: 1.02 },
  },
  {
    id: 69, atlasN: 998, slug: "calibration-problem-artificial-consciousness",
    title: { zh: "人工意识的校准难题:指标体系缺乏可验证基准真相", en: "The Calibration Problem in Artificial Consciousness: Indicator Frameworks Lack a Validated Ground Truth" },
    qfocus: { zh: "意识评估的十四项指标本身，是否从未被真正校准过？", en: "Have the fourteen consciousness indicators themselves ever actually been calibrated?" },
    domain: "交叉",
    cluster: { code: "C32", zh: "意识的本质与硬核理论", en: "Nature of consciousness and hard-problem theory" },
    scores: [5, 4, 3, 2, 5, 5, 3, 5, 5],
    citation: { url: "https://arxiv.org/abs/2603.27597", title: "From indicators to biology: the calibration problem in artificial consciousness", venue: "arXiv:2603.27597", year: 2026 },
    brief: { zh: "Florentin Koch 2026年论文(arXiv:2603.27597)指出Butlin等人提出的14项意识指标从未被独立验证的基准真相校准。", en: "Florentin Koch's 2026 paper (arXiv:2603.27597) argues the 14 consciousness indicators proposed by Butlin et al. have never been calibrated against any independently validated ground truth." },
    depth: {
      overview: { zh: "当二十位学者联名给AI意识开出一张十四项指标清单时，一个更刁钻的问题浮现：这些指标自己有没有被任何独立的「意识真值」校准过？这项研究给出否定回答——意识科学本身理论分裂，指标从未被独立验证，人工现象性又没有基准真相，三者叠加使评估在原则上不可校准。", en: "When twenty scholars jointly hand AI consciousness a checklist of fourteen indicators, a sharper question emerges: have those indicators themselves ever been calibrated against any independent 'ground truth of consciousness'? This work answers no — consciousness science is itself theoretically fragmented, the indicators were never independently validated, and artificial phenomenality has no ground truth, so the three together make the assessment in-principle uncalibratable." },
      whyMatters: { zh: "若校准难题成立，几乎掏空了当下一切「可操作AI意识评估」的认识论地基，却也把自己逼到墙角——它给出的出路同样依赖尚未解决的活体意识基准真相。", en: "If the calibration problem holds, it nearly hollows out the epistemological foundation of every current 'operationalizable AI consciousness assessment,' yet it also backs itself into a corner — its proposed exit depends on the same unresolved ground truth of living consciousness." },
      ifAnswered: { zh: "若把资源从给数字AI打意识分转向生物锚定工程——生物混合、神经形态、连接组级系统——就能缩小与唯一可经验锚定意识的活体域之间的差距。", en: "Redirecting resources from scoring digital AI for consciousness toward biologically anchored engineering — biohybrid, neuromorphic, connectome-scale systems — would narrow the gap with the only domain where consciousness is empirically anchored." },
      approaches: [
        { zh: "指出十四项理论导出指标缺乏独立验证的基准", en: "Show the fourteen theory-derived indicators lack an independently validated benchmark" },
        { zh: "借鉴生物意识神经标记「有用但有争议」的教训", en: "Draw on the lesson that biological consciousness's neural markers are 'clinically useful but contested'" },
        { zh: "转向可与活体域对齐的生物锚定工程作为出路", en: "Redirect toward biologically anchored engineering aligned with living systems as the way out" },
      ],
      barrier: { zh: "意识科学理论分裂、指标缺乏独立验证、人工现象性又无基准真相，三者叠加使当前一切AI意识置信度更新在原则上都欠校准。", en: "Consciousness science is theoretically fragmented, the indicators lack independent validation, and artificial phenomenality has no ground truth — together these leave every current update to AI consciousness credence in-principle uncalibrated." },
      subQuestions: [
        { zh: "十四项理论导出指标能否找到独立的验证基准？", en: "Can the fourteen theory-derived indicators find an independent validating benchmark?" },
        { zh: "活体意识的「基准真相」本身是否也悬而未决？", en: "Is the 'ground truth' of living consciousness itself still unresolved?" },
        { zh: "生物锚定工程能否真正绕开校准难题，而非只是延后一站？", en: "Can biologically anchored engineering truly escape the calibration problem, or just defer it one stop?" },
        { zh: "在无法校准的情况下，AI意识置信度更新是否本就不该被赋值？", en: "If calibration is impossible, should AI consciousness credence be assigned a value at all?" },
      ],
    },
    stage: 2, members: 9, activity: 73,
    chart: { x: 795, y: 608, scale: 1.03 },
  },
  {
    id: 70, atlasN: 879, slug: "verifiable-reward-discovery-agents-pushing",
    title: { zh: "可验证奖励的发现智能体：用RL在测试时逼出新SOTA", en: "Verifiable-Reward Discovery Agents: Pushing New SOTA via Test-Time RL" },
    qfocus: { zh: "只要答案能被程序验证，AI就能逼出超越人类的新解？", en: "If an answer is machine-verifiable, can AI push past human-level solutions?" },
    domain: "交叉",
    cluster: { code: "C53", zh: "自主科学发现·AI科学家", en: "Autonomous Discovery · The AI Scientist" },
    scores: [5, 4, 5, 3, 2, 3, 5, 4, 4],
    citation: { url: "https://www.nature.com/articles/s41586-025-09761-x", title: "Discovering state-of-the-art reinforcement learning algorithms", venue: "Nature", year: 2025 },
    brief: { zh: "TTT-Discover用gpt-oss-120b测试时强化学习，在Erdős重叠问题、GPU内核竞赛等多领域刷新SOTA，每题仅数百美元。", en: "TTT-Discover runs test-time reinforcement learning on the open-source gpt-oss-120b, refreshing SOTA across the Erdős overlap problem, GPU kernel contests, and more, at only hundreds of dollars per problem." },
    depth: {
      overview: { zh: "不赌「人觉得新颖」，只赌「机器能验证为真」：这类发现智能体只在答案可被程序验证的领域发力，用连续可验证奖励在数学、GPU内核、算法竞赛等任务上逼出超越人类专家与既有AI的新解。TTT-Discover更进一步，在测试时持续训练权重，把「为这一个问题学习」做成范式。", en: "Don't bet on 'humans find it novel' — bet on 'the machine can verify it's true': these discovery agents work only where answers are program-verifiable, using a continuous verifiable reward to push past human experts and prior AI in math, GPU kernels, and algorithm contests. TTT-Discover goes further, continuing to train the weights at test time, turning 'learn for this one problem' into a paradigm." },
      whyMatters: { zh: "命门在「可验证」三个字：一旦目标缺乏廉价可信的程序化验证器，整套范式就退化为普通搜索；把开放科学问题改写成可验证奖励环境，本身仍是未解的硬问题。", en: "The crux is the word 'verifiable': once a target lacks a cheap, trustworthy programmatic verifier, the whole paradigm degrades into ordinary search; how to rewrite open scientific problems into verifiable reward environments remains itself an unsolved hard problem." },
      ifAnswered: { zh: "若能把电路、编译器、定理乃至湿实验代理指标都接成可验证奖励环境，任何带可验证内核的难题都可能被自主智能体逐一啃下，大幅扩展AI自主发现的疆域。", en: "If circuits, compilers, theorems, and even wet-lab proxy metrics can all be wired into verifiable reward environments, any problem with a verifiable core could be ground down by autonomous agents, vastly expanding the territory of AI-driven discovery." },
      approaches: [
        { zh: "AlphaEvolve用演化搜索改进矩阵乘法等基础算法", en: "AlphaEvolve uses evolutionary search to improve basic algorithms like matrix multiplication" },
        { zh: "TTT-Discover在测试时对开源权重继续做强化学习", en: "TTT-Discover keeps training open-source model weights at test time" },
        { zh: "DiscoRL从智能体群体经验中自主发现新的RL更新规则", en: "DiscoRL autonomously discovers new RL update rules from agent-population experience" },
      ],
      barrier: { zh: "廉价可信的程序化验证器是这套范式的生死线，而如何把开放性的科学问题改写成这样的可验证奖励环境，本身仍是一道悬而未决的硬问题。", en: "A cheap, trustworthy programmatic verifier is this paradigm's lifeline, and how to rewrite open-ended scientific problems into such verifiable reward environments remains an unresolved hard problem in itself." },
      subQuestions: [
        { zh: "发现产出是否真的随算力与智能体规模服从可外推标度律？", en: "Does discovery output actually follow an extrapolable scaling law with compute and agent count?" },
        { zh: "如何证伪「AI发现」只是训练语料的隐性记忆与复述？", en: "How can we falsify the claim that an 'AI discovery' is just latent memorization of training data?" },
        { zh: "能否学出抗钻空子的「有趣性」奖励引导开放式探索？", en: "Can a hack-resistant 'interestingness' reward be learned to steer open-ended exploration?" },
        { zh: "把开放科学问题改写为可验证奖励环境的边界在哪里？", en: "Where are the boundaries of rewriting open scientific problems as verifiable reward environments?" },
      ],
    },
    stage: 2, members: 10, activity: 65,
    chart: { x: 871, y: 613, scale: 1.02 },
  },
  {
    id: 71, atlasN: 964, slug: "differentiable-manufacturing-simulation-gradient-based",
    title: { zh: "可微分制造仿真与梯度反演工艺设计", en: "Differentiable Manufacturing Simulation for Gradient-Based Inverse Process Design" },
    qfocus: { zh: "制造仿真能否变成一张可微计算图，让工艺曲线由目标热历史反向解出？", en: "Can manufacturing simulation become a differentiable graph that lets the process curve be solved backward from a target thermal history?" },
    domain: "交叉",
    cluster: { code: "C09", zh: "数字孪生·虚拟科学", en: "Digital twins · virtual science" },
    scores: [5, 4, 5, 3, 4, 3, 4, 3, 5],
    citation: { url: "https://arxiv.org/abs/2107.10919", title: "Additive manufacturing process design with differentiable simulations", venue: "arXiv preprint", year: 2021 },
    brief: { zh: "把整条制造仿真链写成可微计算图，用自动微分对上万个逐时刻工艺参数（如激光功率）求梯度，直接反演出达成目标热历史的工艺曲线。", en: "The entire manufacturing simulation chain is written as a differentiable computational graph; automatic differentiation over tens of thousands of per-timestep process parameters, such as laser power, directly inverts the process curve that achieves a target thermal history." },
    depth: {
      overview: { zh: "制造过程高度非线性、多尺度，工艺参数维度可达上万，实践中大部分被迫固定，浪费了工艺自由度。可微分仿真把有限元热分析、单元生灭、对流辐射等环节写成可微计算图，用自动微分直接对这些参数求梯度，把工艺设计从手工试错变成端到端的梯度优化。", en: "Manufacturing processes are highly nonlinear and multiscale, with process-parameter dimensions reaching into the tens of thousands; in practice most are forced to stay fixed, wasting process freedom. Differentiable simulation writes finite-element thermal analysis, element birth/death, and convection/radiation as a differentiable computational graph, taking gradients directly over these parameters via automatic differentiation and turning process design from manual trial-and-error into end-to-end gradient optimization." },
      whyMatters: { zh: "难点在于可微性与物理保真的取舍：接触、相变、塑性等强非光滑环节让梯度噪声大甚至失效，长时序反向传播的内存与稳定性也吃紧，目前多停留在热分析等相对光滑的子问题。", en: "The tension is between differentiability and physical fidelity: strongly non-smooth phenomena such as contact, phase change, and plasticity make gradients noisy or unusable, and memory and stability strain under long-horizon backpropagation, so the approach currently mostly works on relatively smooth subproblems like thermal analysis." },
      ifAnswered: { zh: "若能把可微仿真、可微控制器与可微材料模型串成可联合优化的可微工厂链，就能做形状-工艺-轨迹协同设计，让工艺设计脱离手工试错、直接由目标反解出最优参数曲线。", en: "Chaining differentiable simulators, differentiable controllers, and differentiable material models into a jointly-optimizable differentiable-factory pipeline would enable co-design of shape, process, and trajectory, freeing process design from manual trial-and-error and letting the optimal parameter curve be solved directly from the target." },
      approaches: [
        { zh: "以Taichi为自动微分后端，把增材制造瞬态热响应建成可微有限元图", en: "Using Taichi as the automatic-differentiation backend to build additive manufacturing's transient thermal response as a differentiable finite-element graph" },
        { zh: "用梯度设计逐时刻激光功率，反演材料/工艺参数并控制热历史", en: "Using gradients to design per-timestep laser power, inverting material/process parameters and controlling the thermal history" },
        { zh: "开源实现加载网格与刀路，支持温变材料属性并对照基准验证", en: "The open-source implementation loads mesh and toolpath, supports temperature-varying material properties, and validates against benchmarks" },
      ],
      barrier: { zh: "接触、相变、塑性等强非光滑环节会让梯度噪声大甚至失效，长时序反向传播的内存与稳定性也吃紧。", en: "Strongly non-smooth phenomena such as contact, phase change, and plasticity make gradients noisy or even unusable, while memory and stability are strained under long-horizon backpropagation." },
      subQuestions: [
        { zh: "可微分工艺仿真的梯度精度能维持多长的时序反演窗口？", en: "Over how long a time-series inversion window can differentiable process simulation keep its gradients accurate?" },
        { zh: "学出的代理材料模型能否在训练分布外的工艺参数区间保持可信？", en: "Can learned surrogate material models remain trustworthy over process-parameter ranges outside their training distribution?" },
        { zh: "全流程可微工厂能否处理接触、相变等强非光滑物理环节？", en: "Can an end-to-end differentiable factory handle strongly non-smooth physics such as contact and phase change?" },
        { zh: "熔池深度等目标量的梯度优化是否会陷入局部最优或病态梯度？", en: "Does gradient optimization of target quantities like melt-pool depth risk getting trapped in local optima or ill-conditioned gradients?" },
      ],
    },
    stage: 2, members: 9, activity: 59,
    chart: { x: 980, y: 599, scale: 1.02 },
  },
  {
    id: 72, atlasN: 1162, slug: "epistemic-boundaries-autonomous-science",
    title: { zh: "自主科学的认识论边界（异者认识论与不透明性辩护）", en: "Epistemic Boundaries of Autonomous Science (Xenoepistemics and Opacity)" },
    qfocus: { zh: "不透明模型给出的正确答案，在无人能懂其推理过程时，仍算科学知识吗？", en: "When no human can follow how an opaque model reasoned, does its correct answer still count as scientific knowledge?" },
    domain: "交叉",
    cluster: { code: "C04", zh: "自驱实验室·自动化科学", en: "Self-driving labs · automated science" },
    scores: [5, 3, 2, 5, 5, 5, 2, 5, 5],
    citation: { url: "https://doi.org/10.1017/psa.2023.8", title: "Deep Learning Opacity in Scientific Discovery", venue: "Philosophy of Science", year: 2023 },
    brief: { zh: "提出异者认识论：知识的合法性不来自可解释性，而来自独立验证机制下的可靠表现，如以AlphaFold为代表的不透明模型。", en: "Proposes xenoepistemics: the legitimacy of knowledge comes not from explainability but from reliable performance under an independent verification mechanism, as exemplified by opaque models like AlphaFold." },
    depth: {
      overview: { zh: "当实验由不透明模型驱动、假设由LLM批量生成、证明长到人类无法通读，凭什么说这是知识成为一个独立研究方向。它区分发现的语境与辩护的语境，探索一种不以人类理解为前提、而以独立验证为准的异者认识论，把认识论默认的会理解的人这一主语推向了边界之外。", en: "When experiments are driven by opaque models, hypotheses are batch-generated by LLMs, and proofs grow too long for any human to read, on what grounds this counts as knowledge becomes a research direction in its own right. It separates the context of discovery from the context of justification, exploring a xenoepistemics grounded not in human understanding but in independent validation, pushing epistemology's default subject — a human who understands — past the boundary." },
      whyMatters: { zh: "最硬的悖论是循环信任——我信它因为它管用，我知道它管用因为我信它；而对没有已知答案可对照的开放式发现，独立验证机制本身如何构造仍是未解难题。", en: "The hardest paradox is circular trust — I trust it because it works, I know it works because I trust it — and for open-ended discovery with no known answer to check against, how to construct the independent verification mechanism itself remains unsolved." },
      ifAnswered: { zh: "若能建立非人类中心的验证规范，不可通读、不可解释的自主结果也能获得可辩护的知识地位，科学得以在保留可信度的前提下接纳黑箱式突破。", en: "A non-anthropocentric validation regime would let autonomous results that no human can survey or explain still attain defensible knowledge status, letting science admit black-box breakthroughs without giving up credibility." },
      approaches: [
        { zh: "Duede以发现语境与辩护语境的区分，论证不透明模型可以合法地驱动可辩护的突破", en: "Duede distinguishes the context of discovery from the context of justification to argue opaque models can legitimately drive defensible breakthroughs" },
        { zh: "Vallverdú提出异者认识论，主张知识合法性来自独立验证机制下的表现而非可解释性", en: "Vallverdú proposes xenoepistemics, arguing knowledge legitimacy comes from performance under independent verification rather than explainability" },
        { zh: "《Of opaque oracles》以AlphaFold为例，论证依赖不透明系统靠的是可靠性而非理解", en: "'Of opaque oracles' uses AlphaFold as a case study to argue that reliance on opaque systems rests on reliability, not understanding" },
      ],
      barrier: { zh: "循环信任的悖论难以打破：对没有已知正确答案可对照的开放式发现，独立验证机制本身如何构造仍是未解难题。", en: "The circular-trust paradox is hard to break: for open-ended discovery with no known correct answer to check against, how to construct the independent verification mechanism itself remains unsolved." },
      subQuestions: [
        { zh: "自驱实验室能否提出人类未曾设想且为真的新假说，还是只能优化已知空间？", en: "Can self-driving labs propose genuinely novel, true hypotheses no human conceived, or can they only optimize a known space?" },
        { zh: "完全由机器提出、执行、解释的发现，在无人理解其推理链时算不算科学知识？", en: "When a finding is proposed, executed, and explained entirely by a machine with no human understanding the reasoning chain, does it still count as scientific knowledge?" },
        { zh: "能否为实验本身建立通用形式语言，让异者认识论的独立验证有标准协议可依？", en: "Can a universal formal language for the experiment itself be built, giving xenoepistemics' independent verification a standard protocol to rely on?" },
      ],
    },
    stage: 2, members: 10, activity: 69,
    chart: { x: 1060, y: 610, scale: 1.03 },
  },
  {
    id: 73, atlasN: 1199, slug: "developmental-interpretability-singular-learning",
    title: { zh: "奇异学习理论驱动的发展式可解释性", en: "Developmental Interpretability via Singular Learning Theory" },
    qfocus: { zh: "涌现能否被训练中的相变温度计提前标出，而非事后才被发现？", en: "Can emergence be flagged in real time by a phase-transition thermometer during training, rather than discovered only after the fact?" },
    domain: "交叉",
    cluster: { code: "C42", zh: "AI对齐·可解释·评测科学", en: "AI Alignment · Interpretability · Evaluation Science" },
    scores: [5, 5, 5, 3, 4, 3, 4, 3, 5],
    citation: { url: "https://arxiv.org/abs/2402.02364", title: "The Developmental Landscape of In-Context Learning", venue: "arXiv (cs.LG)", year: 2024 },
    brief: { zh: "用奇异学习理论的局部学习系数量化损失地形退化，把能力涌现刻画成训练中可监测的离散相变，而非只解剖训练完成的成品。", en: "Using the local learning coefficient from singular learning theory to quantify loss-landscape degeneracy, characterizing capability emergence as discrete, monitorable phase transitions during training rather than only dissecting the finished model." },
    depth: {
      overview: { zh: "神经网络不是均匀地变聪明，而是像胚胎一样分阶段发育。发展式可解释性用奇异学习理论中的局部学习系数量化训练中损失地形的退化程度，把能力与结构的涌现刻画成一系列离散的发展阶段与相变，在结构长出来的那一刻就定位它，而不只是解剖训练完成的成品。", en: "Neural networks do not get smarter uniformly but develop in stages, like an embryo. Developmental interpretability uses the local learning coefficient from singular learning theory to quantify how degenerate the loss landscape is during training, characterizing the emergence of capability and structure as a series of discrete developmental stages and phase transitions — locating structure at the moment it forms, rather than only dissecting the finished model." },
      whyMatters: { zh: "局部学习系数的采样估计在大模型上昂贵且对超参敏感，奇异学习理论的代数几何门槛极高；若这条路线无法扩展到前沿规模，涌现与潜在失配就仍只能事后诸葛亮。", en: "Sampling-based estimation of the local learning coefficient is expensive and hyperparameter-sensitive at large scale, and singular learning theory's algebraic-geometry prerequisites are steep; if the approach cannot scale to frontier models, emergence and latent misalignment can still only be diagnosed after the fact." },
      ifAnswered: { zh: "若能把涌现变成训练中可监测、可定位的相变，就能在结构长出来的那一刻检测甚至控制它，包括潜在的失配倾向，把对齐审计从事后解剖前移到训练进行时。", en: "Turning emergence into a monitorable, locatable phase transition during training would allow structure — including latent misalignment tendencies — to be detected or even controlled the moment it forms, moving alignment auditing from post-hoc dissection to real time during training." },
      approaches: [
        { zh: "Hoogland等用局部学习系数与本质动力学发现上下文学习在训练中分离出离散阶段", en: "Hoogland et al. use the local learning coefficient and essential dynamics to find that in-context learning separates into discrete stages during training" },
        { zh: "Wang等用精细化局部学习系数追踪注意力头的分化过程", en: "Wang et al. use a refined local learning coefficient to track the differentiation of attention heads" },
        { zh: "Timaeus团队开源devinterp库，把这条路线做成可复现的基础设施", en: "The Timaeus team open-sourced the devinterp library, turning this line of work into reproducible infrastructure" },
      ],
      barrier: { zh: "局部学习系数的SGLD采样估计在大模型上既昂贵又对超参敏感，能否从两层玩具transformer扩展到前沿规模仍是未决的赌注。", en: "SGLD-based sampling estimation of the local learning coefficient is both costly and hyperparameter-sensitive at large scale, and whether it can scale from two-layer toy transformers to frontier models remains an open bet." },
      subQuestions: [
        { zh: "局部学习系数能否在前沿规模模型上稳定估计，而不仅限于玩具transformer？", en: "Can the local learning coefficient be estimated reliably at frontier model scale, not just in toy transformers?" },
        { zh: "训练中标出的相变时刻，能否用于提前检测潜在的失配倾向？", en: "Can phase transitions flagged during training be used to detect latent misalignment tendencies before they fully form?" },
        { zh: "发展阶段的划分是模型的客观结构，还是奇异学习理论视角下的建模产物？", en: "Is the division into developmental stages an objective feature of the model, or an artifact of the singular-learning-theory lens?" },
        { zh: "相变监测能否与评测意识、可扩展监督等对齐工具整合成统一的安全流水线？", en: "Can phase-transition monitoring be integrated with tools like evaluation-awareness detection and scalable oversight into a unified safety pipeline?" },
      ],
    },
    stage: 2, members: 9, activity: 53,
    chart: { x: 1166, y: 605, scale: 1.01 },
  },
  {
    id: 74, atlasN: 1257, slug: "structural-enforcement-statistical-rigor",
    title: { zh: "AI 发现的统计严谨性强制与自动证伪", en: "Structural Enforcement of Statistical Rigor and Automated Falsification in AI Discovery" },
    qfocus: { zh: "批量假设筛选中，多数显著只是噪声——能否用架构化证伪回路摁住假发现？", en: "When most significant results in mass hypothesis screening are just noise, can an architecturally enforced falsification loop hold down the false-discovery rate?" },
    domain: "交叉",
    cluster: { code: "C53", zh: "自主科学发现·AI科学家", en: "Autonomous Discovery · The AI Scientist" },
    scores: [5, 4, 4, 3, 4, 4, 3, 4, 5],
    citation: { url: "https://arxiv.org/abs/2511.06701", title: "Structural Enforcement of Statistical Rigor in AI-Driven Discovery: A Functional Architecture", venue: "arXiv", year: 2025 },
    brief: { zh: "用Haskell的Research monad强制假设测试前更新误差预算，并以855行零sorry的Lean4证明LORD++在线错误发现率控制定理。", en: "A Haskell Research monad forces an error budget to be updated before any hypothesis can be tested, and an 855-line, zero-sorry Lean 4 proof formally establishes the LORD++ online false-discovery-rate control theorem." },
    depth: {
      overview: { zh: "LLM最擅长生成看起来合理的假设，这恰恰是危险所在——当自动系统一次筛上千条假设，仅凭α=0.05就有上百条显著纯属偶然。这条线不追求更强的生成器，而是把假发现率控制、防数据泄漏、自动证伪循环等统计护栏，架构化地内建进发现流程本身。", en: "LLMs are best at generating plausible-looking hypotheses — which is exactly the danger: when an automated system screens thousands of hypotheses at once, at alpha=0.05 alone roughly a hundred come up significant by pure chance. This line does not chase a stronger generator; instead it architecturally bakes statistical guardrails — false-discovery-rate control, leakage prevention, automated falsification loops — into the discovery pipeline itself." },
      whyMatters: { zh: "统计护栏能压住假阳性，却也可能扼杀真正反直觉的新发现；而自动证伪本身需要AI具备它最缺的能力——主动质疑自己刚生成的东西，这是条硬张力。", en: "Statistical guardrails can suppress false positives, but they may also kill genuinely counterintuitive new discoveries; automated falsification itself demands the one capability AI most lacks — actively questioning what it just generated — a hard tension." },
      ifAnswered: { zh: "若能建成证伪优先的智能体架构，系统会先想方设法推翻自己的假设、只上报活下来的结果，把可信度从事后审计前移到生成的那一刻。", en: "A falsification-first agent architecture would have the system first try hard to refute its own hypotheses and report only the survivors, moving credibility from post-hoc audit to the moment of generation." },
      approaches: [
        { zh: "Sargsyan用Haskell的Research monad强制假设测试前更新误差预算，并以Lean4形式化证明FDR控制定理", en: "Sargsyan's Haskell Research monad forces an error budget update before hypothesis testing, formally proving the FDR control theorem in Lean 4" },
        { zh: "AIGS让系统靠自动证伪循环产出可靠的科学结论", en: "AIGS lets systems produce reliable scientific conclusions through an automated falsification loop" },
        { zh: "系统性论证多重检验校正、错误发现率控制、证伪回路才是可验证发现的地基", en: "Systematic argument that multiple-testing correction, false-discovery-rate control, and falsification loops are the true bedrock of verifiable discovery" },
      ],
      barrier: { zh: "统计护栏在压住假阳性的同时可能扼杀反直觉的真发现，而自动证伪需要AI主动质疑自己刚生成的假设——这恰是它最缺的能力。", en: "Statistical guardrails that suppress false positives may also kill counterintuitive real discoveries, while automated falsification requires AI to actively question its own freshly generated hypotheses — precisely the capability it lacks most." },
      subQuestions: [
        { zh: "架构化的错误发现率控制会不会把统计上罕见但真实的发现一并筛掉？", en: "Could architecturally enforced false-discovery-rate control end up filtering out rare but genuine discoveries along with the noise?" },
        { zh: "自动证伪回路能否在没有已知答案的开放发现中可靠区分真发现与记忆复述？", en: "Can an automated falsification loop reliably distinguish genuine discovery from memorized recitation in open-ended discovery with no known answer?" },
        { zh: "误差预算式的统计护栏能否扩展到假设生成规模指数增长的场景？", en: "Can error-budget-style statistical guardrails scale to settings where hypothesis generation grows exponentially?" },
        { zh: "证伪优先架构能否与可学习的有趣性奖励结合，而不被reward hacking攻破？", en: "Can a falsification-first architecture be combined with a learnable interestingness reward without being broken by reward hacking?" },
      ],
    },
    stage: 2, members: 10, activity: 59,
    chart: { x: 1253, y: 598, scale: 1.02 },
  },
  {
    id: 75, atlasN: 1438, slug: "idiographic-dynamic-network-psychology",
    title: { zh: "个体特异性动态网络心理学", en: "Idiographic Dynamic-Network Psychology" },
    qfocus: { zh: "心理病理是群体平均背后的病灶，还是每个人独有的动态症状网络？", en: "Is psychopathology a lesion hidden behind the population average, or a dynamic symptom network unique to each individual?" },
    domain: "交叉",
    cluster: { code: "C19", zh: "计算社会科学·数字人文", en: "Computational social science · digital humanities" },
    scores: [5, 4, 4, 3, 4, 4, 3, 4, 5],
    citation: { url: "https://doi.org/10.1007/s10608-025-10674-2", title: "A Systematic Scoping Review of Fully Idiographic Network Analysis in Mental Health", venue: "Cognitive Therapy and Research", year: 2025 },
    brief: { zh: "用密集经验取样数据为单人(n=1)估计症状动态网络与向量自回归模型，把心理病理看作相互激发的症状系统而非群体平均背后的隐藏病灶。", en: "Using intensive experience-sampling data to estimate a person-specific (n=1) dynamic symptom network and vector-autoregressive model, treating psychopathology as a system of mutually exciting symptoms rather than a hidden lesion behind the population average." },
    depth: {
      overview: { zh: "心理学几乎所有结论都建立在群体平均上，但对个人未必成立。个体特异性动态网络心理学用密集纵向数据（经验取样）为单个人估计症状之间的动态网络与向量自回归模型，浮现出属于这个人自己、会随时间变形的症状网络，挑战心理学默认的群体规律可迁移到个体这一前提。", en: "Nearly all of psychology's conclusions rest on population averages that need not hold for any given individual. Idiographic dynamic-network psychology uses intensive longitudinal data (experience sampling) to estimate a dynamic network and vector-autoregressive model of symptoms for a single person, revealing a symptom network that belongs to that person alone and deforms over time — challenging psychology's default assumption that population-level laws transfer to the individual." },
      whyMatters: { zh: "个体网络高度异质、彼此难以泛化，估计对缺失数据与时序长度极其敏感，其临床效用至今未被稳固证明——个性化的承诺与可复制、可验证的科学要求之间张力巨大。", en: "Individual networks are highly heterogeneous and hard to generalize across people, estimation is extremely sensitive to missing data and series length, and clinical utility has not been firmly established — a large tension between the promise of personalization and the demands of reproducible, verifiable science." },
      ifAnswered: { zh: "若能把个体网络从描述变成临床可用，就能为每个人找到可干预的症状节点，并检验其随时间的稳定性，让心理干预真正做到对症下人而非对症下群体。", en: "Turning individual networks from description into clinical use would let each person's actionable symptom targets be located and their stability over time tested, letting intervention be tailored to the person rather than the population." },
      approaches: [
        { zh: "2024年JMIR Mental Health用20名抑郁患者、约274天日常数据做时变向量自回归", en: "A 2024 JMIR Mental Health study used 20 depression patients and about 274 days of daily data to fit a time-varying vector autoregression" },
        { zh: "2025年系统范围综述梳理GVAR、贝叶斯VAR、时变VAR等完全个体化网络分析方法", en: "A 2025 scoping review surveys fully idiographic network analysis methods including GVAR, Bayesian VAR, and time-varying VAR" },
        { zh: "同年提出的精准精神病学动力系统框架给出可操作的建模路线", en: "A dynamical-systems framework for precision psychiatry, proposed the same year, gives an operational modeling route" },
      ],
      barrier: { zh: "个体网络高度异质、难以在人与人之间泛化，估计对缺失数据与时序长度极其敏感，临床效用至今未被稳固证明。", en: "Individual networks are highly heterogeneous and hard to generalize across people, estimation is extremely sensitive to missing data and series length, and clinical utility remains unproven." },
      subQuestions: [
        { zh: "个体症状网络能否推广到另一个人，还是每个人都需要重新估计一套动力学？", en: "Can an individual's symptom network generalize to another person, or does each person require an entirely re-estimated dynamics?" },
        { zh: "AI生成的自评数据一旦混入经验取样，还能否分辨真实的个体信号与模型回声？", en: "Once AI-generated self-reports mix into experience-sampling data, can genuine individual signal still be separated from model echo?" },
        { zh: "把症状变成动态网络数字，是否会丢失临床访谈才能捕捉的意义维度？", en: "Does turning symptoms into dynamic-network numbers lose the dimension of meaning that only a clinical interview can capture?" },
        { zh: "个体网络随时间变形的稳定性，能否成为判断干预时机的可靠信号？", en: "Can the stability of an individual network's deformation over time serve as a reliable signal for when to intervene?" },
      ],
    },
    stage: 2, members: 10, activity: 68,
    chart: { x: 506, y: 684, scale: 1.03 },
  },
  {
    id: 76, atlasN: 886, slug: "self-play-dueling-agents-autonomous",
    title: { zh: "对偶自博弈的全自动猜想智能体", en: "Self-Play Dueling Agents for Autonomous Conjecturing" },
    qfocus: { zh: "机器能否靠优化生成图论里那种漂亮不等式的直觉，而非只是平凡命题？", en: "Can a machine, purely through optimization, generate the kind of intuition behind a beautiful graph-theory inequality, rather than just trivial statements?" },
    domain: "交叉",
    cluster: { code: "C53", zh: "自主科学发现·AI科学家", en: "Autonomous Discovery · The AI Scientist" },
    scores: [4, 4, 4, 2, 2, 4, 4, 4, 5],
    citation: { url: "https://arxiv.org/abs/2411.09158", title: "The Optimist: Towards Fully Automated Graph Theory Research", venue: "arXiv (Davila)", year: 2024 },
    brief: { zh: "《The Optimist》用混合整数规划自动生成最锐的不等式猜想，并计划与反驳方Pessimist组成对偶自博弈，推进全自动图论研究。", en: "The Optimist uses mixed-integer programming to auto-generate the sharpest inequality conjectures, and is designed to pair with a refuting Pessimist in a dueling self-play loop toward fully autonomous graph-theory research." },
    depth: {
      overview: { zh: "图论里很多定理，其实是先有人感觉到一个漂亮的不等式。在GRAFFITI与TxGraffiti传统上，新一代系统the Optimist用混合整数规划自动生成最锐的不等式猜想，并与一个反驳方the Pessimist（人或机器）组成对偶博弈循环，朝完全无人干预的图论研究推进。", en: "Many graph-theory theorems start with someone feeling a beautiful inequality. Building on the GRAFFITI and TxGraffiti tradition, the new-generation system the Optimist uses mixed-integer programming to auto-generate the sharpest inequality conjectures, pairing with a refuter, the Pessimist (human or machine), in a dueling self-play loop that pushes toward fully autonomous graph-theory research." },
      whyMatters: { zh: "最难的不是生成猜想——线性/整数规划能批量吐出锐不等式——而是有趣性与可证性的筛选；多数自动猜想要么平凡要么无法证明，Pessimist一侧仍极不成熟。", en: "The hardest part is not generating conjectures — linear/integer programming can mass-produce sharp inequalities — but filtering for interestingness and provability; most automated conjectures are either trivial or unprovable, and the Pessimist side remains very immature." },
      ifAnswered: { zh: "若Optimist提猜想、Pessimist找反例、再自动收紧假设的闭环成立，提出-证伪-精炼这条科研回路就能脱离人手，把图论新知的产出速率交给自博弈。", en: "If the loop of Optimist proposing, Pessimist refuting, and automatic hypothesis-tightening closes, the whole propose-falsify-refine research cycle could run without human hands, handing the production rate of new graph-theory knowledge to self-play." },
      approaches: [
        { zh: "TxGraffiti用线性规划在图不变量表上生成在最多实例上取等的锐不等式猜想", en: "TxGraffiti uses linear programming over tables of graph invariants to generate sharp inequality conjectures that hold with equality on the most instances" },
        { zh: "The Optimist升级为基于混合整数规划与记忆-智能体机制的自主系统", en: "The Optimist upgrades this into an autonomous system based on mixed-integer programming and a memory-agent mechanism" },
        { zh: "明确提出与反驳方Pessimist组成对偶系统，迈向全自动图论研究", en: "It explicitly proposes pairing with a refuting Pessimist into a dueling system, moving toward fully automated graph-theory research" },
      ],
      barrier: { zh: "真正的难点在有趣性与可证性的筛选，而非生成猜想本身；多数自动猜想要么平凡要么无法证明，反驳方Pessimist仍极不成熟。", en: "The real difficulty lies in filtering for interestingness and provability, not in generating conjectures; most automated conjectures are either trivial or unprovable, and the refuting Pessimist remains very immature." },
      subQuestions: [
        { zh: "对偶自博弈生成的猜想规模能否随算力持续扩大，还是会很快耗尽容易摘的果子？", en: "Can the scale of conjectures generated by dueling self-play keep growing with compute, or will it quickly exhaust the low-hanging fruit?" },
        { zh: "机器提出的新不等式猜想，如何证明它不是对已知定理的变形复述而是真新知？", en: "How can a new inequality conjecture proposed by a machine be shown to be genuinely new knowledge rather than a disguised restatement of a known theorem?" },
        { zh: "能否学出区分有趣猜想与平凡命题的奖励，而不被系统自己钻空子刷出空洞不等式？", en: "Can a reward distinguishing interesting conjectures from trivial statements be learned without the system gaming it into churning out vacuous inequalities?" },
      ],
    },
    stage: 2, members: 10, activity: 54,
    chart: { x: 611, y: 672, scale: 1.01 },
  },
  {
    id: 77, atlasN: 976, slug: "stimulated-raman-activated-cell-ejection",
    title: { zh: "受激拉曼激活细胞弹射的功能优先单细胞分选", en: "Stimulated Raman-Activated Cell Ejection for Function-First Single-Cell Sorting" },
    qfocus: { zh: "显微镜能否先尝出细胞在做什么，再用激光把它活着单独打出来？", en: "Can a microscope first taste what a cell is doing, then laser-eject it alive and intact?" },
    domain: "交叉",
    cluster: { code: "C04", zh: "自驱实验室·自动化科学", en: "Self-driving labs · automated science" },
    scores: [4, 5, 4, 2, 4, 3, 4, 4, 5],
    citation: { url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11633747/", title: "High-throughput single-cell sorting by stimulated Raman-activated cell ejection (S-RACE)", venue: "Science Advances", year: 2024 },
    brief: { zh: "受激拉曼激活细胞弹射（S-RACE）以约每秒13-17个细胞、纯度超过96%，无标记读出代谢指纹并活体回收目标细胞。", en: "Stimulated Raman-activated cell ejection (S-RACE) reads metabolic fingerprints label-free at roughly 13-17 cells per second with over 96% purity, recovering target cells alive." },
    depth: {
      overview: { zh: "用受激拉曼成像在不染色、不破坏的前提下读出每个细胞的代谢指纹（脂质、同位素掺入、储能物质），再以激光把目标细胞原位弹射出来活体回收，把先看功能再分选再培养变成可自动化的高通量流水线。它直击表型组学的最硬骨头：99%微生物无法培养、荧光标记又会改变细胞，这条路线绕开了二者。", en: "Stimulated Raman imaging reads each cell's metabolic fingerprint (lipids, isotope uptake, storage compounds) label-free and non-destructively, then a laser ejects the chosen cell in situ for live recovery, turning see-function-then-sort-then-cultivate into an automatable high-throughput pipeline. It attacks phenotyping's hardest bone: about 99% of microbes resist culture and fluorescent tags perturb the cell, and this route sidesteps both." },
      whyMatters: { zh: "最硬的张力在通量与活性的权衡：拉曼信号天生微弱，通量仍比荧光分选慢几个量级；弹射的机械/热损伤又压低存活与可培养率，功能优先要真正取代培养优先还得跨过通量这道坎。", en: "The hardest tension is the tradeoff between throughput and viability: the Raman signal is inherently weak, so throughput remains orders of magnitude below fluorescence sorting, while mechanical/thermal damage from ejection lowers survival and culturability — function-first still has to clear the throughput hurdle before it can truly replace culture-first." },
      ifAnswered: { zh: "若实现闭环实时成像-识别-弹射与单细胞测序/培养的联用，按真实功能挑细胞就能从环境样本里变成常规操作，直接喂给合成生物学和微生物组挖掘。", en: "A closed loop of real-time image-identify-eject coupled to single-cell sequencing/cultivation would make picking cells by their real function a routine operation on environmental samples, feeding directly into synthetic biology and microbiome mining." },
      approaches: [
        { zh: "多通道受激拉曼成像原位读出单细胞的化学/代谢指纹", en: "Multichannel stimulated Raman imaging reads each cell's chemical/metabolic fingerprint in situ" },
        { zh: "在线图像分解后用激光诱导把目标细胞活体弹射回收", en: "Online image decomposition followed by laser-induced ejection recovers the target cell alive" },
        { zh: "配合scRACS-Culture、AI-RACS等按功能挑菌再培养的下游路线", en: "Paired with downstream pick-by-function-then-cultivate routes such as scRACS-Culture and AI-RACS" },
      ],
      barrier: { zh: "拉曼信号天生微弱，通量相对荧光分选仍慢几个量级，弹射的机械/热损伤又压低细胞存活与可培养率。", en: "The Raman signal is inherently weak, leaving throughput orders of magnitude below fluorescence sorting, while mechanical/thermal damage from ejection lowers cell survival and culturability." },
      subQuestions: [
        { zh: "S-RACE能否把通量提升到接近荧光分选的量级，而不牺牲细胞存活率？", en: "Can S-RACE raise its throughput toward the scale of fluorescence sorting without sacrificing cell survival?" },
        { zh: "按代谢指纹挑出的细胞，能否揭示人类未曾设想的新功能类别，而非只是已知表型的筛选？", en: "Can cells picked by metabolic fingerprint reveal functional categories humans never anticipated, rather than just sorting known phenotypes?" },
        { zh: "闭环实时弹射系统能否形成通用协议，让不同实验室的S-RACE平台彼此复现？", en: "Can the closed-loop real-time ejection system converge on a common protocol so S-RACE platforms in different labs can reproduce each other's results?" },
      ],
    },
    stage: 2, members: 9, activity: 62,
    chart: { x: 695, y: 675, scale: 1.02 },
  },
  {
    id: 78, atlasN: 995, slug: "complexity-consciousness-proxy-brain",
    title: { zh: "类脑器官与体外神经网络的复杂度意识代理量", en: "Complexity as a Consciousness Proxy in Brain Organoids and In-Vitro Neural Nets" },
    qfocus: { zh: "一团无感觉无行为的培养皿神经组织，能否用复杂度尺子测出意识？", en: "Can a dish of neural tissue with no senses and no behavior be shown to have consciousness using a complexity ruler?" },
    domain: "交叉",
    cluster: { code: "C32", zh: "意识的本质与硬核理论", en: "Nature of consciousness and hard-problem theory" },
    scores: [5, 5, 4, 3, 3, 3, 3, 3, 5],
    citation: { url: "https://www.cell.com/patterns/fulltext/S2666-3899(25)00213-2", title: "Facing the possibility of consciousness in human brain organoids", venue: "Patterns (Cell Press)", year: 2025 },
    brief: { zh: "把意识科学中验证过的复杂度/整合度量（如Lempel-Ziv、扰动复杂度PCI）搬到DishBrain与人脑类器官上，作为无身体无行为系统的意识相关动力学代理。", en: "Complexity/integration metrics validated in consciousness science, such as Lempel-Ziv complexity and the perturbational complexity index, are repurposed on DishBrain and human brain organoids as proxies for consciousness-relevant dynamics in bodyless, behaviorless systems." },
    depth: {
      overview: { zh: "一团既不能看也不能动、没法被问话的体外神经组织，如何判断它有没有意识？这条前沿把意识科学里成熟的复杂度/整合度量（Lempel-Ziv、扰动复杂度PCI、整合信息）当作是否出现意识相关动力学的可测代理，在既无感觉输入也无行为输出、传统行为/报告范式完全失效的系统里，寻找意识的下界。", en: "How do you judge whether a lump of in-vitro neural tissue that cannot see, move, or be questioned has consciousness? This frontier repurposes mature complexity/integration metrics from consciousness science — Lempel-Ziv complexity, the perturbational complexity index, integrated information — as measurable proxies for consciousness-relevant dynamics, searching for a lower bound of consciousness in a system with neither sensory input nor behavioral output, where classical behavioral/report paradigms fail entirely." },
      whyMatters: { zh: "这些复杂度指标是在完整人脑上按清醒/无意识对比校准出来的，搬到无身体、无感觉闭环的器官上其阈值是否仍然有效完全未知；把代理量误当判据，是这条线最大的认识论陷阱。", en: "These complexity indices were calibrated on the intact human brain by contrasting wakefulness and unconsciousness; whether their thresholds still hold once moved to a bodyless organoid with no sensory closed loop is entirely unknown, and mistaking the proxy for the criterion is this line's biggest epistemological trap." },
      ifAnswered: { zh: "若能把高密度多电极阵列、闭环刺激与复杂度读数整合成可证伪的意识相关动力学基准，器官智能扩规模时就有了不可绕过的伦理刹车与监测仪，而非只能凭直觉宣称器官没有意识。", en: "Integrating high-density multi-electrode arrays, closed-loop stimulation, and complexity readouts into a falsifiable benchmark of consciousness-relevant dynamics would give organoid intelligence an unavoidable ethical brake and monitor as it scales, rather than relying on intuitive claims that organoids have no consciousness." },
      approaches: [
        { zh: "DishBrain验证体外人神经元培养能在闭环游戏环境中学习", en: "DishBrain demonstrated that in-vitro human neuron cultures can learn within a closed-loop game environment" },
        { zh: "NSF的BEGIN OI项目将iPSC来源类器官与高密度多电极阵列耦合", en: "NSF's BEGIN OI project couples iPSC-derived organoids with high-density multi-electrode arrays" },
        { zh: "把Lempel-Ziv、扰动复杂度PCI、整合信息等指标搬到类器官上做意识监测代理", en: "Metrics such as Lempel-Ziv complexity, the perturbational complexity index, and integrated information are repurposed on organoids as consciousness-monitoring proxies" },
      ],
      barrier: { zh: "复杂度指标是在完整人脑清醒/无意识对比中校准出来的，搬到无身体无感觉闭环的类器官上，阈值是否仍然有效完全未知。", en: "The complexity indices were calibrated by contrasting wakefulness and unconsciousness in the intact human brain, and whether their thresholds still hold when moved to a bodyless organoid with no sensory closed loop is entirely unknown." },
      subQuestions: [
        { zh: "复杂度指标测到的是意识相关动力学，还是仅仅是神经活动的丰富程度？", en: "Do the complexity indices measure consciousness-relevant dynamics, or merely how rich the neural activity is?" },
        { zh: "整合信息论等理论框架能否为无身体、无感觉输入的类器官给出可证伪的意识判据？", en: "Can frameworks like integrated information theory give a falsifiable consciousness criterion for a bodyless organoid with no sensory input?" },
        { zh: "在他心问题原则性无法解决的前提下，复杂度代理量能否成为可操作的伦理刹车？", en: "Given that the other-minds problem is in principle unsolvable, can a complexity proxy still serve as an operable ethical brake?" },
        { zh: "随类器官规模扩大，复杂度曲线的变化能否被用作提前预警意识相关动力学出现的信号？", en: "As organoids scale up, can changes in the complexity curve serve as an early-warning signal for the emergence of consciousness-relevant dynamics?" },
      ],
    },
    stage: 2, members: 9, activity: 62,
    chart: { x: 797, y: 663, scale: 1.02 },
  },
  // ── §九 学科打通 · 全聚类覆盖扩充 (78→128, grounded from xfrontier atlas) ──
  {
    "id": 79,
    "atlasN": 29,
    "slug": "quantum-biological-hybrid-computing",
    "title": {
      "zh": "量子-生物混合计算",
      "en": "Quantum-Biological Hybrid Computing"
    },
    "qfocus": {
      "zh": "生物分子中的量子相干与隧穿效应，能否被驯服为一种真实可用的计算资源？",
      "en": "Can quantum coherence and tunneling effects in biomolecules be tamed into a genuinely usable computational resource?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C02",
      "zh": "生物计算·类器官智能",
      "en": "Biocomputing · organoid intelligence"
    },
    "scores": [
      5,
      5,
      2,
      1,
      2,
      1,
      1,
      2,
      4
    ],
    "citation": {
      "url": "https://www.pnas.org/doi/10.1073/pnas.1005484107",
      "title": "Long-lived quantum coherence in photosynthetic complexes at physiological temperature",
      "venue": "PNAS",
      "year": 2010
    },
    "brief": {
      "zh": "探索生物分子（如光合反应中心、酶活性位点）中的量子相干与隧穿效应能否用于计算。这是量子物理、生物物理与计算科学高度交叉的探索性方向，目前理论远远领先于实验证据。",
      "en": "Explores whether quantum coherence and tunneling effects in biomolecules such as photosynthetic reaction centers and enzyme active sites can be harnessed for computation. It sits at a highly cross-disciplinary, still-exploratory frontier where theory currently runs far ahead of experimental evidence."
    },
    "depth": {
      "overview": {
        "zh": "该方向研究光合反应中心的相干能量传递、酶活性位点的质子隧穿，以及鸟类指南针中隐花色素自由基对的磁感等现象，追问生物体内是否真的存在功能性量子效应。它处于量子物理、生物物理与计算科学的高度交叉地带，目标是判断这些效应能否被计算所利用，或反过来被计算所模拟。",
        "en": "The field studies phenomena such as coherent energy transfer in photosynthetic reaction centers, proton tunneling at enzyme active sites, and radical-pair magnetoreception via cryptochrome in the avian compass, asking whether functional quantum effects genuinely operate inside living organisms. It sits at the intersection of quantum physics, biophysics, and computer science, aiming to determine whether such effects can be exploited by, or for, computation."
      },
      "whyMatters": {
        "zh": "量子生物学至今尚未确认「生物体内是否存在功能性量子效应」这一最基础的问题，把它用于计算更是遥远的愿景。它的价值在于：一旦被证实并变得可控，可能颠覆我们对生命能量转换效率的理解；但当前理论远远领先于实验，概念被过度炒作的风险不可忽视。",
        "en": "Quantum biology has not yet even confirmed the basic question of whether functional quantum effects exist within living organisms, making computational use an even more distant prospect. Its value lies here: if confirmed and made controllable, it could overturn our understanding of life's energy-conversion efficiency—but theory currently runs far ahead of experiment, and the concept carries a real risk of being overhyped."
      },
      "ifAnswered": {
        "zh": "该领域仍处于探索期，但一旦出现理论突破——证实功能性量子效应确实存在且可被利用——可能颠覆性地重塑我们对计算与生命能量转换的理解。",
        "en": "The field remains exploratory, but a theoretical breakthrough confirming that functional quantum effects genuinely exist and can be exploited could disruptively reshape our understanding of both computation and life's energy conversion."
      },
      "approaches": [
        {
          "zh": "在生理温度下用超快光谱学重复检验光合反应中心（如FMO复合物）里报告的长寿命量子相干，弄清它究竟是可观测的物理现象还是实验假象。",
          "en": "Re-examine, with ultrafast spectroscopy at physiological temperature, the long-lived quantum coherence reported in photosynthetic reaction centers such as the FMO complex, to settle whether it is a genuine observable or an experimental artifact."
        },
        {
          "zh": "把「储备池计算」的检验方法搬到量子生物候选系统上：区分一个观测到的效应究竟是生物特异性机制的产物，还是任何足够复杂系统都会呈现的通用非线性行为。",
          "en": "Port the reservoir-computing diagnostic to candidate quantum-biological systems: separate whether an observed effect is the product of biology-specific mechanisms or just the generic nonlinear behavior any sufficiently complex system would show."
        },
        {
          "zh": "以鸟类指南针中隐花色素的自由基对磁感为模型系统，测试能否在受控条件下把量子隧穿/自由基对动力学重新设计为一种可读出的计算或感知资源。",
          "en": "Use radical-pair magnetoreception via cryptochrome in the avian compass as a model system to test whether quantum tunneling / radical-pair dynamics can be re-engineered under controlled conditions into a readable computational or sensing resource."
        }
      ],
      "barrier": {
        "zh": "最诚实的障碍是：量子生物学甚至还没确认生物体内是否存在功能性量子效应这一前提问题，理论远远跑在实验前面，任何「可用于计算」的宣称都可能只是概念被过度炒作。",
        "en": "The most honest barrier: quantum biology has not even confirmed the prerequisite question of whether functional quantum effects exist in living organisms at all—theory runs far ahead of experiment, and any claim of computational usability risks being an overhyped concept."
      },
      "subQuestions": [
        {
          "zh": "一团离体培养的人脑类器官，要在哪个复杂度阈值上才会发生某种「内在经验」？我们到底有没有任何可操作的判据，能在它真正具备意识之前就把这条线画出来？",
          "en": "At what threshold of complexity, if any, might a dish-grown human brain organoid begin to host some form of inner experience—and do we possess any operational criterion to draw that line before, rather than after, it is crossed?"
        },
        {
          "zh": "脑类器官「储备池计算」之所以能算，靠的究竟是神经元的什么——是真正的生物可塑性学习，还是仅仅是任何足够复杂的非线性动力系统都有的「回声」？我们能否把这两者从根上区分开？",
          "en": "When a brain-organoid reservoir computes, what is actually doing the work—genuine biological synaptic learning, or merely the generic echo that any sufficiently complex nonlinear dynamical system exhibits—and can we cleanly separate the two?"
        },
        {
          "zh": "如果不再把脑类器官当作「待训练的硅芯片替代品」，而是问：一团神经组织要被嵌入什么样的身体与环境闭环里，才会自发长出目标、动机或「想要」？计算的边界，是否本就画错了地方？",
          "en": "What if, instead of treating a brain organoid as a silicon chip to be trained, we ask: in what kind of embodied, sensorimotor closed loop must neural tissue be embedded before goals, motivation, or 'wanting' arise spontaneously—has the very boundary of 'computation' been drawn in the wrong place?"
        }
      ]
    },
    "literature": [
      {
        "title": "Long-lived quantum coherence in photosynthetic complexes at physiological temperature",
        "venue": "PNAS",
        "year": 2010,
        "url": "https://www.pnas.org/doi/10.1073/pnas.1005484107"
      },
      {
        "title": "Do photosynthetic complexes use quantum coherence to increase their efficiency? Probably not",
        "venue": "Journal of Physical Chemistry Letters",
        "year": 2021,
        "url": "https://pubmed.ncbi.nlm.nih.gov/33597236/"
      },
      {
        "title": "Quantum coherent dynamics in photosynthetic protein complexes",
        "venue": "Chemical Society Reviews",
        "year": 2026,
        "url": "https://pubs.rsc.org/en/content/articlehtml/2026/cs/d5cs00948k"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 825,
      "y": 195,
      "scale": 0.88
    }
  },
  {
    "id": 80,
    "atlasN": 1031,
    "slug": "physics-constrained-scientific-foundation-models",
    "title": {
      "zh": "物理约束科学基础模型",
      "en": "Physics-constrained scientific foundation models"
    },
    "qfocus": {
      "zh": "能否把守恒律、边界条件和量纲关系嵌入科学基础模型，从根本上压低纯数据外推产生的幻觉？",
      "en": "Can conservation laws, boundary conditions, and dimensional relationships be embedded into scientific foundation models to fundamentally curb the hallucinations of pure data-driven extrapolation?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C03",
      "zh": "科学基础模型·AI4S",
      "en": "Scientific foundation models · AI4S"
    },
    "scores": [
      5,
      5,
      5,
      3,
      3,
      2,
      3,
      4,
      3
    ],
    "citation": {
      "url": "https://doi.org/10.1038/s42254-021-00314-5",
      "title": "Physics-informed machine learning",
      "venue": "Nature Reviews Physics",
      "year": 2021
    },
    "brief": {
      "zh": "把守恒律、边界条件和量纲关系嵌入科学基础大模型，以降低纯数据外推时产生的幻觉；这类模型有望成为工程仿真、材料筛选与气候推断的共同底座。",
      "en": "Embedding conservation laws, boundary conditions, and dimensional constraints into scientific foundation models to reduce the hallucinations of pure data-driven extrapolation; such models may become a shared substrate for engineering simulation, materials screening, and climate inference."
    },
    "depth": {
      "overview": {
        "zh": "该方向把守恒律、边界条件与量纲关系作为先验嵌入科学基础模型，目标是降低模型在纯数据外推时产生的幻觉。开放问题在于：能否把这一构想做成可测量、可复核、可迁移到新领域的实验对象，并说清楚它会在什么条件下失败。",
        "en": "This direction embeds conservation laws, boundary conditions, and dimensional relationships as priors into scientific foundation models, aiming to reduce the hallucinations that arise from pure data-driven extrapolation. The open question is whether this idea can be turned into a testable, replicable, transferable experimental object with clearly defined failure conditions."
      },
      "whyMatters": {
        "zh": "纯数据驱动的科学大模型容易在外推到训练分布之外时产生看似合理却违反物理规律的幻觉预测。把守恒律与边界条件作为硬约束嵌入模型，正是要在工程仿真、材料筛选和气候推断这些高风险场景里换来可信赖的外推能力——但这个构想能否被做成真正可测量、可复核、可迁移的实验对象，仍是开放问题。",
        "en": "Purely data-driven scientific foundation models tend to produce plausible-looking but physics-violating hallucinated predictions when extrapolating beyond their training distribution. Embedding conservation laws and boundary conditions as hard constraints is meant to buy trustworthy extrapolation for high-stakes uses like engineering simulation, materials screening, and climate inference—but whether this idea can be turned into a genuinely measurable, replicable, transferable experimental object remains an open question."
      },
      "ifAnswered": {
        "zh": "若这一构想成立，物理约束的科学基础模型有望成为工程仿真、材料筛选与气候推断共享的底座，让不同科学领域的预测建立在同一套可信的物理先验之上。",
        "en": "If this works out, physics-constrained scientific foundation models could become a shared substrate for engineering simulation, materials screening, and climate inference, grounding predictions across different scientific domains in the same trustworthy physical priors."
      },
      "approaches": [
        {
          "zh": "针对具体的工程、材料或气候任务，把守恒律、边界条件与量纲分析显式编码为损失函数或架构约束，而不是寄望于模型从数据中自行「发现」物理规律。",
          "en": "For concrete engineering, materials, or climate tasks, explicitly encode conservation laws, boundary conditions, and dimensional analysis as loss functions or architectural constraints, rather than hoping the model 'discovers' physics from data alone."
        },
        {
          "zh": "检验是否存在跨领域可迁移的「科学基础模型」通用骨架——测试同一套物理约束架构能否像语言模型迁移到新句子那样，迁移到从未见过的物理现象。",
          "en": "Test whether a transferable, cross-domain 'foundation model for science' skeleton exists—checking whether the same physics-constrained architecture can transfer to never-before-seen phenomena the way a language model transfers to new sentences."
        },
        {
          "zh": "把可解释性研究嫁接到预测型模型上：尝试从像 AlphaFold 这类只给出正确答案却不解释机制的模型中，可靠地提取人类可理解的物理机制，检验预测力是否真能转化为理解力。",
          "en": "Graft interpretability research onto predictive models: attempt to reliably extract human-understandable physical mechanisms from models like AlphaFold that give correct answers without explaining mechanism, testing whether predictive power can genuinely convert into understanding."
        }
      ],
      "barrier": {
        "zh": "最诚实的障碍是可测试性本身：目前这仍是一个概念性方向，还没有被做成可测量、可复核、可跨领域迁移的实验对象，也没有讲清楚在什么条件下它会失败。",
        "en": "The most honest barrier is testability itself: this remains a conceptual direction that has not yet been turned into a measurable, replicable, cross-domain-transferable experimental object, nor has it been made clear under what conditions it would fail."
      },
      "subQuestions": [
        {
          "zh": "AI 能给出正确的科学预测，却给不出「为什么」。当一个模型解决了蛋白折叠，我们是真的理解了折叠，还是把无知外包给了一个我们同样不理解的系统？",
          "en": "AI can produce correct scientific predictions without producing a 'why'. When a model solves protein folding, do we actually understand folding—or have we outsourced our ignorance to a system we equally don't understand?"
        },
        {
          "zh": "存在「科学的基础模型」吗——一个在所有物理过程上预训练、能像语言模型迁移到新句子那样迁移到从未见过的现象的模型？还是说每门科学的归纳偏置本质上不可通约？",
          "en": "Is there a 'foundation model for science'—one pretrained on all physical processes that transfers to never-seen phenomena the way a language model transfers to new sentences? Or are the inductive biases of each science fundamentally incommensurable?"
        },
        {
          "zh": "当 AI 能独立提出假设、设计实验、解读结果时，人类科学家不可替代的内核到底是什么？我们是在把发现自动化，还是在把「理解的责任」自动化掉？",
          "en": "When AI can independently propose hypotheses, design experiments, and interpret results, what is the irreplaceable human core of a scientist? Are we automating discovery—or automating away the responsibility to understand?"
        }
      ]
    },
    "literature": [
      {
        "title": "Physics-informed machine learning",
        "venue": "Nature Reviews Physics",
        "year": 2021,
        "url": "https://doi.org/10.1038/s42254-021-00314-5"
      },
      {
        "title": "Highly accurate protein structure prediction with AlphaFold",
        "venue": "Nature",
        "year": 2021,
        "url": "https://doi.org/10.1038/s41586-021-03819-2"
      },
      {
        "title": "On the Opportunities and Risks of Foundation Models",
        "venue": "arXiv",
        "year": 2021,
        "url": "https://arxiv.org/abs/2108.07258"
      },
      {
        "title": "Towards an AI co-scientist",
        "venue": "arXiv",
        "year": 2025,
        "url": "https://arxiv.org/abs/2502.18864"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 960,
      "y": 755,
      "scale": 0.91
    }
  },
  {
    "id": 81,
    "atlasN": 1380,
    "slug": "metagenomic-foundation-models-reading-function",
    "title": {
      "zh": "宏基因组基础模型：从环境序列直接“读出”功能暗物质",
      "en": "Metagenomic foundation models: reading function straight from environmental sequence"
    },
    "qfocus": {
      "zh": "基因组语言模型能否在完全不比对已知参考库的情况下，从环境宏基因组序列里零样本地「读出」基因功能？",
      "en": "Can genomic language models achieve zero-shot function prediction directly from environmental metagenomic sequence, without ever aligning to a known reference?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C05",
      "zh": "环境组学·行星感知",
      "en": "Environmental omics · planetary sensing"
    },
    "scores": [
      5,
      5,
      5,
      3,
      2,
      2,
      4,
      3,
      2
    ],
    "citation": {
      "url": "https://www.science.org/doi/10.1126/science.ado9336",
      "title": "Sequence modeling and design from molecular to genome scale with Evo",
      "venue": "Science",
      "year": 2024
    },
    "brief": {
      "zh": "全球环境测序里绝大多数基因功能未知——这片「功能暗物质」正被基因组语言模型（如 Evo、GenomeOcean）尝试直接从无参考序列中零样本读出，绕开必须比对已知数据库的老范式。",
      "en": "Most genes revealed by global environmental sequencing have unknown function—this 'functional dark matter' is now being tackled by genomic language models (Evo, GenomeOcean, and others), which achieve zero-shot function prediction directly from reference-free sequence, bypassing the old paradigm of aligning to known databases."
    },
    "depth": {
      "overview": {
        "zh": "全球海洋测序发现约四千万个几乎全新的基因，其中绝大多数功能未知——我们正用一本看不懂的天书去预测气候反馈。基因组语言模型（Evo、GenomeOcean、REBEAN 等）试图在数千万条无参考序列上自监督预训练，直接学会「读出」这些基因的功能，绕开必须比对已知参考库的老范式。",
        "en": "Global ocean sequencing has revealed roughly forty million almost entirely novel genes, the vast majority of unknown function—we are predicting climate feedbacks from a book we cannot read. Genomic language models (Evo, GenomeOcean, REBEAN) attempt to self-supervise on tens of millions of reference-free sequences, directly learning to 'read' these genes' functions and bypassing the old paradigm that requires alignment to a known reference database."
      },
      "whyMatters": {
        "zh": "最硬的难点是可证伪性：模型能生成「看似合理」的功能标注，但环境暗物质本身缺乏真值可供核对，湿实验验证的速度远跟不上模型生成假设的速度；再加上这条路线高度依赖算力，它更像一个被命名、被追捧的热潮领域，而非被忽视的研究洼地。",
        "en": "The hardest difficulty is falsifiability: the model can generate plausible-looking function annotations, but environmental dark matter has no ground truth to check against, and wet-lab validation runs far slower than the pace of hypothesis generation. Combined with its heavy dependence on compute, this is more a named, hyped hotspot than a neglected research gap."
      },
      "ifAnswered": {
        "zh": "若序列到功能到生态过程的映射能被稳固建立，它有望被接入地球系统模型，让行星尺度的生物地球化学第一次拥有机制级、可生成的微生物模块。",
        "en": "If the sequence-to-function-to-ecosystem-process map can be firmly established, it could be wired into Earth-system models, giving planetary biogeochemistry its first mechanistic, generative microbial modules."
      },
      "approaches": [
        {
          "zh": "用 Evo、GenomeOcean 这类在数千万条无参考序列上自监督预训练的基因组语言模型，对海洋宏基因组中的「暗物质基因」做零样本功能预测，并用 REMME/REBEAN 一类工具直接在宏基因组 reads 层面标注酶功能。",
          "en": "Use genomic language models like Evo and GenomeOcean, self-supervised on tens of millions of reference-free sequences, to make zero-shot function predictions for 'dark matter' genes in ocean metagenomes, and use tools like REMME/REBEAN to annotate enzyme function directly at the metagenomic-read level."
        },
        {
          "zh": "把预测出的基因功能接入行星尺度的碳氮循环模型，检验「从序列读出的生态功能」是否真能提升气候反馈预测的机制性，而不只是又一层拟合。",
          "en": "Wire the predicted gene functions into planetary-scale carbon and nitrogen cycle models, testing whether 'ecological function read from sequence' genuinely improves the mechanistic grounding of climate-feedback prediction, rather than adding just another layer of curve-fitting."
        },
        {
          "zh": "在环境 DNA、痕量气体、声学与遥感之外，探索能否把序列层面的功能预测整合进一张行星级、多模态的实时感知网络，用于在生态系统崩溃之前发出预警。",
          "en": "Beyond environmental DNA, trace gases, acoustics, and remote sensing, explore whether sequence-level function prediction can be integrated into a planetary-scale, multimodal, real-time sensing network for early warning ahead of ecosystem collapse."
        }
      ],
      "barrier": {
        "zh": "最诚实的障碍是可证伪性：环境暗物质缺乏真值可供核对，模型生成「看似合理」标注的速度，远远超过湿实验能验证的速度。",
        "en": "The most honest barrier is falsifiability: environmental dark matter has no ground truth to check against, and the model's rate of generating plausible-looking annotations far outpaces what wet-lab experiments can verify."
      },
      "subQuestions": [
        {
          "zh": "Tara 海洋计划在全球海洋微生物组里发现了超过四千万个几乎全新的基因，其中绝大多数功能未知——这片「暗物质基因」到底在调控行星尺度的碳氮循环上扮演什么角色？我们能否从序列读出生态功能？",
          "en": "Tara Oceans found over forty million almost entirely novel genes in the global ocean microbiome, the vast majority of unknown function—what role does this 'genomic dark matter' play in regulating planetary carbon and nitrogen cycles, and can we read ecological function from sequence at all?"
        },
        {
          "zh": "如果把整个行星本身当作一台可被持续读取的「仪器」——用环境 DNA、痕量气体、声学与遥感织成一张实时神经网——它能在生态崩溃发生之前向我们发出预警吗？地球有没有可被观测的「生命体征」？",
          "en": "If we treat the whole planet as a single continuously readable instrument—an environmental-DNA, trace-gas, acoustic, and remote-sensing sensorium woven into one real-time nervous system—could it warn us before an ecological collapse, rather than after? Does Earth have observable 'vital signs'?"
        },
        {
          "zh": "我们一直假设可以用少数「指示物种」或多样性指数来代表生态系统健康——但若生态功能的稳健性根本不取决于谁在场，而取决于难以观测的相互作用网络结构，那么我们整套环境监测的可观测量，是否从一开始就选错了？",
          "en": "We assume a few 'indicator species' or diversity indices can stand in for ecosystem health—but if functional robustness depends not on who is present but on the structure of a hard-to-observe interaction network, have we been measuring the wrong observables for environmental monitoring all along?"
        }
      ]
    },
    "literature": [
      {
        "title": "Sequence modeling and design from molecular to genome scale with Evo",
        "venue": "Science",
        "year": 2024,
        "url": "https://www.science.org/doi/10.1126/science.ado9336"
      },
      {
        "title": "Uncovering the Genomic Manifold via Scalable Learning from the Global Microbiome (GenomeOcean)",
        "venue": "bioRxiv",
        "year": 2025,
        "url": "https://doi.org/10.1101/2025.01.30.635558"
      },
      {
        "title": "Deciphering enzymatic potential in metagenomic reads through DNA language models (REMME/REBEAN)",
        "venue": "Nucleic Acids Research",
        "year": 2025,
        "url": "https://doi.org/10.1093/nar/gkaf836"
      },
      {
        "title": "Structure and function of the global ocean microbiome",
        "venue": "Science",
        "year": 2015,
        "url": "https://doi.org/10.1126/science.1261359"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 717,
      "y": 368,
      "scale": 0.74
    }
  },
  {
    "id": 82,
    "atlasN": 69,
    "slug": "airborne-edna-biodiversity-surveys",
    "title": {
      "zh": "空中 eDNA 生物多样性普查",
      "en": "Airborne eDNA Biodiversity Surveys"
    },
    "qfocus": {
      "zh": "从空气中漂浮的DNA碎片，能否可靠地推断出一个区域「真实存在」哪些物种——从「测到」到「在场」的推断链，能被量化吗？",
      "en": "Can DNA fragments drifting in air reliably tell us which species truly are present in a region—and can the inferential chain from 'detected' to 'present' be quantified?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C05",
      "zh": "环境组学·行星感知",
      "en": "Environmental omics · planetary sensing"
    },
    "scores": [
      4,
      5,
      4,
      3,
      3,
      3,
      3,
      2,
      4
    ],
    "citation": {
      "url": "https://www.nature.com/articles/s41598-025-03650-z",
      "title": "First national survey of terrestrial biodiversity using airborne eDNA",
      "venue": "Scientific Reports",
      "year": 2025
    },
    "brief": {
      "zh": "空气中漂浮的DNA碎片可用于普查一片区域的物种构成，这种普查方式的可行性直到2025年前后才被实证确认，采样成本低到可全域铺开，但DNA的来源、扩散距离与降解动力学几乎空白。",
      "en": "DNA fragments drifting in the air can be used to survey a region's species composition; this method's feasibility was only empirically confirmed around 2025. Sampling is cheap enough to deploy region-wide, but the source, dispersal distance, and degradation kinetics of airborne DNA remain nearly blank."
    },
    "depth": {
      "overview": {
        "zh": "空中eDNA生物多样性普查从空气中漂浮的DNA碎片——皮肤、孢子、花粉、毛发——中提取并测序，从而在不接触生物的情况下普查一片区域的物种构成。其可行性直到2025年前后才被实证确认，方法跨越基因组学、大气科学与生态学三个领域。",
        "en": "Airborne eDNA biodiversity surveys extract and sequence DNA fragments drifting in the air—skin, spores, pollen, hair—to census a region's species composition without ever touching an organism. Its feasibility was only empirically confirmed around 2025, and the method spans genomics, atmospheric science, and ecology."
      },
      "whyMatters": {
        "zh": "这几乎是科幻成真——空气本身成了生物多样性的记录介质，采样成本低到可以全域铺开。但DNA在空气中的来源、扩散距离和降解动力学几乎是一片空白，「测到某物种」到「它确实在这里」之间的推断链条极不可靠，定量化是最大的挑战。",
        "en": "This is almost science fiction come true—the air itself becomes a recording medium for biodiversity, with sampling cheap enough to deploy area-wide. But the source, dispersal distance, and degradation kinetics of airborne DNA are nearly a blank slate, and the inferential chain from 'detected a species' to 'it really is here' is highly unreliable—quantification is the biggest challenge."
      },
      "ifAnswered": {
        "zh": "若这条推断链能被可靠量化，空中eDNA普查有望成为全国范围的常规生物多样性监测手段。",
        "en": "If this inferential chain can be reliably quantified, airborne eDNA surveys could become a routine tool for national-scale biodiversity monitoring."
      },
      "approaches": [
        {
          "zh": "系统测定空气中DNA碎片的来源强度、扩散距离与降解速率，建立「检测量」与「真实种群密度/距离」之间可量化的转换模型，而不只停留在有无检出。",
          "en": "Systematically measure the source strength, dispersal distance, and decay rate of airborne DNA fragments, building a quantifiable conversion model from 'amount detected' to 'true population density/distance', rather than stopping at simple presence/absence."
        },
        {
          "zh": "把空中eDNA采样网络与环境DNA、痕量气体、声学、遥感等其他行星感知手段并网，构建一张能在生态崩溃前发出预警的多模态实时感知系统。",
          "en": "Network airborne eDNA sampling together with other planetary-sensing modalities—environmental DNA, trace gases, acoustics, remote sensing—to build a multimodal, real-time sensing system capable of warning ahead of ecosystem collapse."
        },
        {
          "zh": "在物种清点之外，探索空中eDNA能否间接反映物种间相互作用网络的结构性变化，而不只是「谁在场」的名录。",
          "en": "Beyond species inventories, explore whether airborne eDNA can indirectly reflect structural changes in the interaction network among species, rather than merely a roster of 'who is present'."
        }
      ],
      "barrier": {
        "zh": "最诚实的障碍是定量化：DNA在空气中的来源、扩散距离和降解动力学几乎是空白，「测到」和「在场」之间的推断链条目前极不可靠。",
        "en": "The most honest barrier is quantification: the source, dispersal distance, and degradation kinetics of airborne DNA are nearly blank, and the inferential chain from 'detected' to 'present' is currently highly unreliable."
      },
      "subQuestions": [
        {
          "zh": "Tara 海洋计划在全球海洋微生物组里发现了超过四千万个几乎全新的基因，其中绝大多数功能未知——这片「暗物质基因」到底在调控行星尺度的碳氮循环上扮演什么角色？我们能否从序列读出生态功能？",
          "en": "Tara Oceans found over forty million almost entirely novel genes in the global ocean microbiome, the vast majority of unknown function—what role does this 'genomic dark matter' play in regulating planetary carbon and nitrogen cycles, and can we read ecological function from sequence at all?"
        },
        {
          "zh": "如果把整个行星本身当作一台可被持续读取的「仪器」——用环境 DNA、痕量气体、声学与遥感织成一张实时神经网——它能在生态崩溃发生之前向我们发出预警吗？地球有没有可被观测的「生命体征」？",
          "en": "If we treat the whole planet as a single continuously readable instrument—an environmental-DNA, trace-gas, acoustic, and remote-sensing sensorium woven into one real-time nervous system—could it warn us before an ecological collapse, rather than after? Does Earth have observable 'vital signs'?"
        },
        {
          "zh": "我们一直假设可以用少数「指示物种」或多样性指数来代表生态系统健康——但若生态功能的稳健性根本不取决于谁在场，而取决于难以观测的相互作用网络结构，那么我们整套环境监测的可观测量，是否从一开始就选错了？",
          "en": "We assume a few 'indicator species' or diversity indices can stand in for ecosystem health—but if functional robustness depends not on who is present but on the structure of a hard-to-observe interaction network, have we been measuring the wrong observables for environmental monitoring all along?"
        }
      ]
    },
    "literature": [
      {
        "title": "Airborne environmental DNA captures terrestrial vertebrate diversity in nature",
        "venue": "Molecular Ecology Resources",
        "year": 2023,
        "url": "https://onlinelibrary.wiley.com/doi/10.1111/1755-0998.13840"
      },
      {
        "title": "First national survey of terrestrial biodiversity using airborne eDNA",
        "venue": "Scientific Reports",
        "year": 2025,
        "url": "https://www.nature.com/articles/s41598-025-03650-z"
      },
      {
        "title": "Airborne eDNA captures three decades of ecosystem biodiversity",
        "venue": "bioRxiv (preprint)",
        "year": 2023,
        "url": "https://www.biorxiv.org/content/10.1101/2023.12.06.569882v1"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 602,
      "y": 455,
      "scale": 0.98
    }
  },
  {
    "id": 83,
    "atlasN": 86,
    "slug": "engineered-living-materials-elms",
    "title": {
      "zh": "工程活体材料（ELM）",
      "en": "Engineered Living Materials (ELMs)"
    },
    "qfocus": {
      "zh": "活体材料要保持「活着」才能自愈、自感、自生长，但「活着」就意味着会进化、变异、可能失控——能否设计出一种既保有代谢活性、又在进化上长期稳定可控的活体材料？",
      "en": "Living materials must stay alive to self-heal, sense, and grow—but being alive means they evolve, mutate, and can escape control. Can a living material be designed that stays metabolically active yet remains evolutionarily stable and controllable?"
    },
    "domain": "物质",
    "cluster": {
      "code": "C06",
      "zh": "活体材料·生物制造",
      "en": "Living materials · biomanufacturing"
    },
    "scores": [
      4,
      4,
      3,
      2,
      3,
      2,
      2,
      2,
      3
    ],
    "citation": {
      "url": "https://www.nature.com/articles/s41467-023-40265-2",
      "title": "Phenotypically complex living materials containing engineered cyanobacteria",
      "venue": "Nature Communications",
      "year": 2023
    },
    "brief": {
      "zh": "把活细胞嵌入水凝胶等材料基质，让材料具备生长、自愈、感知与响应环境的生命特性，模糊「材料」与「生物」的边界；自生长建材与活体器件是其诱人的应用前景。",
      "en": "Living cells are embedded into material matrices such as hydrogels so that materials can grow, self-heal, sense, and respond to their environment, blurring the boundary between 'material' and 'organism'; self-growing building materials and living devices are its alluring near-term application."
    },
    "depth": {
      "overview": {
        "zh": "工程活体材料（ELM）把活细胞（常为工程菌或真菌）嵌入水凝胶等材料基质中，使材料具备生长、自愈、感知和响应环境的生命特性，模糊了「材料」与「生物」的边界。它综合了合成生物学、材料科学与工程设计三个领域。",
        "en": "Engineered living materials (ELMs) embed living cells—often engineered bacteria or fungi—into a material matrix such as a hydrogel, giving materials the living properties of growth, self-healing, sensing, and environmental response, and blurring the boundary between 'material' and 'organism'. It integrates synthetic biology, materials science, and engineering design."
      },
      "whyMatters": {
        "zh": "它代表材料观的一次范式转变——从惰性、静态到活性、可演化，自生长建材和活体器件是诱人的前景；但让活细胞在材料中长期存活、可控且安全是根本难题，加上需要防止工程细胞逃逸的生物安全围堵，从实验室走到现实部署还有很长的路。",
        "en": "It represents a paradigm shift in how we view materials—from inert and static to living and evolvable—with self-growing building materials and living devices an enticing prospect; but keeping living cells alive, controllable, and safe in a material long-term is a fundamental challenge, and the biosafety containment needed to prevent engineered-cell escape leaves a long road from lab to real-world deployment."
      },
      "ifAnswered": {
        "zh": "若长期存活、可控且安全的难题被解决，自生长建材与活体器件将从实验室演示走向真实世界的部署。",
        "en": "If the challenge of long-term, controllable, safe cell survival is solved, self-growing building materials and living devices will move from lab demonstration into real-world deployment."
      },
      "approaches": [
        {
          "zh": "针对「活着就会进化失控」这一核心矛盾，尝试设计代谢活性与进化稳定性可以共存的基因回路，检验活体材料能否在保持自愈自感能力的同时被长期锁定在规格之内。",
          "en": "Target the core tension that 'staying alive means evolving out of control' by designing genetic circuits where metabolic activity and evolutionary stability can coexist, testing whether living materials can be locked to specification long-term while retaining self-healing and sensing."
        },
        {
          "zh": "探索能否把生物制造重定向去生产它从未进化出来过的物质类别（例如高强度无机-有机复合结构），从而摸清「可被生物合成」的物质边界到底由热力学、酶化学还是纯粹进化史决定。",
          "en": "Explore whether biomanufacturing can be redirected to produce classes of matter it never evolved to make (e.g., high-strength inorganic–organic composites), to determine whether the boundary of what is biosynthesizable is set by thermodynamics, enzyme chemistry, or mere evolutionary history."
        },
        {
          "zh": "沿着多菌株协作（multistrain collaboration）路线，测试能否用多个工程菌株的分工代替单一菌株的全能设计，来同时缓解存活、可控与安全三方面的压力。",
          "en": "Follow the multistrain-collaboration route, testing whether dividing labor across several engineered strains—rather than demanding one all-purpose strain—can ease the pressures on survival, control, and safety simultaneously."
        }
      ],
      "barrier": {
        "zh": "最诚实的障碍是：让活细胞在材料中长期存活、可控且安全是根本性难题，再加上必须做好生物安全围堵以防工程细胞逃逸，从实验室到现实部署的路还很长。",
        "en": "The most honest barrier: keeping living cells alive, controllable, and safe within a material over the long term is a fundamental challenge, compounded by the need for biosafety containment against engineered-cell escape—leaving a long road from lab to real-world deployment."
      },
      "subQuestions": [
        {
          "zh": "活体材料的核心矛盾是：它必须「活着」才能自愈、自感、自生长，但「活着」就意味着会进化、会变异、会失控。我们能否设计出一种既保持代谢活性、又在进化上长期稳定可控的活材料？生命与可工程性能否共存？",
          "en": "The core tension of living materials is that they must stay alive to self-heal, sense, and grow—but being alive means they evolve, mutate, and can escape control. Can we design a living material that retains metabolic activity yet remains evolutionarily stable and controllable over its lifetime? Can being alive coexist with being engineerable?"
        },
        {
          "zh": "生物制造至今几乎都靠水基、常温、缓慢的细胞工厂——但生命本身能否被重定向去生产它从未进化出来过的物质类别，比如高强度无机-有机复合结构？「可被生物合成」的物质边界，到底由什么决定？",
          "en": "Biomanufacturing so far runs almost entirely on water-based, ambient-temperature, slow cell factories—but can life itself be redirected to make classes of matter it never evolved to produce, such as high-strength inorganic–organic composites? What actually sets the boundary of what is biosynthesizable?"
        },
        {
          "zh": "我们一直把「材料」和「机器」当作两类东西——前者被动、后者主动。但一块能自感、自愈、自适应、自繁殖的活材料，是否已经消解了这条分界？「材料」这个概念本身，是不是已经过时？",
          "en": "We have always treated 'material' and 'machine' as two kinds of thing—the former passive, the latter active. But does a living material that senses, heals, adapts, and reproduces itself already dissolve that boundary? Has the very concept of 'material' become obsolete?"
        }
      ]
    },
    "literature": [
      {
        "title": "Engineered Living Materials For Sustainability",
        "venue": "Chemical Reviews",
        "year": 2023,
        "url": "https://pubs.acs.org/doi/abs/10.1021/acs.chemrev.2c00512"
      },
      {
        "title": "Engineered Living Materials: Taxonomies and Emerging Trends",
        "venue": "Trends in Biotechnology",
        "year": 2020,
        "url": "https://www.sciencedirect.com/science/article/abs/pii/S0167779920302730"
      },
      {
        "title": "Phenotypically complex living materials containing engineered cyanobacteria",
        "venue": "Nature Communications",
        "year": 2023,
        "url": "https://www.nature.com/articles/s41467-023-40265-2"
      },
      {
        "title": "Strength in diversity: unlocking the full potential of engineered living materials with multistrain collaboration",
        "venue": "FEMS Microbiology Reviews",
        "year": 2025,
        "url": "https://academic.oup.com/femsre/article/doi/10.1093/femsre/fuaf055/8316143"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 1230,
      "y": 456,
      "scale": 0.74
    }
  },
  {
    "id": 84,
    "atlasN": 97,
    "slug": "programmable-dna-hydrogels",
    "title": {
      "zh": "可编程DNA水凝胶",
      "en": "Programmable DNA Hydrogels"
    },
    "qfocus": {
      "zh": "能否让DNA水凝胶的响应速度、结构稳定性与低成本合成同时达标，跨越「可编程」概念验证与「可部署」软体器件/分子传感之间的鸿沟？",
      "en": "Can programmable DNA hydrogels simultaneously achieve fast response, structural stability, and low-cost synthesis — closing the gap between 'programmable' proof-of-concept and 'deployable' soft devices and molecular sensors?"
    },
    "domain": "物质",
    "cluster": {
      "code": "C06",
      "zh": "活体材料·生物制造",
      "en": "Living materials · biomanufacturing"
    },
    "scores": [
      3,
      4,
      4,
      2,
      3,
      2,
      2,
      3,
      4
    ],
    "citation": {
      "url": "https://pubs.acs.org/doi/10.1021/acsabm.1c01197",
      "title": "Recent Advances in Stimuli-Responsive DNA-Based Hydrogels",
      "venue": "ACS Applied Bio Materials",
      "year": 2022
    },
    "brief": {
      "zh": "可编程DNA水凝胶用DNA链的可编程碱基配对构建能感知特定分子、按指令变形甚至执行逻辑运算（链置换反应）的智能凝胶，把DNA从遗传信息载体重新定义为可编程的结构与计算基元。软体器件与分子传感前景诱人，但响应慢、稳定性差、合成成本高，目前多为概念验证。",
      "en": "Programmable DNA hydrogels use DNA strands' programmable base pairing to build smart gels that sense specific molecules, deform on command, and even perform logic operations via strand-displacement reactions, redefining DNA from a genetic-information carrier into a programmable structural and computational primitive. Prospects for soft devices and molecular sensing are alluring, but the gels respond slowly, are unstable, and are costly to synthesize — mostly proof-of-concept for now."
    },
    "depth": {
      "overview": {
        "zh": "可编程DNA水凝胶用DNA链的可编程碱基配对构建能感知特定分子、按指令变形甚至执行逻辑运算的智能凝胶。它处在材料科学、化学与（分子）信息科学的交叉点，把DNA的碱基配对规则当作可编程的结构与计算基元，而非单纯的遗传信息载体。",
        "en": "Programmable DNA hydrogels use the programmable base-pairing of DNA strands to build smart gels that can sense specific molecules, deform on command, and even perform logic operations. Sitting at the intersection of materials science, chemistry, and (molecular) information science, they treat DNA's base-pairing rules as a programmable structural and computational primitive rather than merely a carrier of genetic information."
      },
      "whyMatters": {
        "zh": "它把DNA从遗传信息载体重新定义为可编程的结构与计算基元，软体器件和分子传感前景诱人；但DNA水凝胶响应慢、稳定性差、合成成本高，距离实用器件还很远，目前更多是概念验证——「可编程」的优雅与「可部署」的鲁棒之间存在巨大鸿沟。",
        "en": "It redefines DNA from a carrier of genetic information into a programmable structural and computational primitive, with enticing prospects for soft devices and molecular sensing; but DNA hydrogels respond slowly, are unstable, and are costly to synthesize, far from practical devices and for now mostly proof-of-concept — a vast gulf separates the elegance of 'programmable' from the robustness of 'deployable.'"
      },
      "ifAnswered": {
        "zh": "若可编程DNA水凝胶跨过响应速度、稳定性与成本的门槛，其感知特定分子、按指令变形并执行逻辑运算的能力将被用于软体器件与传感领域。",
        "en": "If programmable DNA hydrogels clear the thresholds of response speed, stability, and cost, their ability to sense specific molecules, deform on command, and perform logic operations will be put to use for soft devices and sensing."
      },
      "approaches": [
        {
          "zh": "利用DNA链的可编程碱基配对设计能特异性识别目标分子的传感位点，把「感知特定分子」的能力嵌入凝胶网络本身。",
          "en": "Use the programmable base-pairing of DNA strands to design sensing sites that specifically recognize target molecules, embedding molecule-sensing directly into the gel network."
        },
        {
          "zh": "通过链置换反应赋予凝胶按指令变形与执行逻辑运算的能力，把「计算」与「材料形变」耦合在同一套DNA电路里。",
          "en": "Use strand-displacement reactions to give the gel the ability to deform on command and perform logic operations, coupling 'computation' and 'material deformation' within the same DNA circuit."
        },
        {
          "zh": "呼应活体材料领域对「进化稳定又可控」「材料即机器即有机体」的追问，探索如何让DNA凝胶的可编程性与长期稳定性、可控合成成本同步提升，而不是只停留在单次演示。",
          "en": "Echo the living-materials field's questions about being 'evolutionarily stable yet controllable' and 'material-as-machine-as-organism,' exploring how to raise DNA-gel programmability alongside long-term stability and controllable synthesis cost, rather than stopping at single demonstrations."
        }
      ],
      "barrier": {
        "zh": "DNA水凝胶响应慢、稳定性差、合成成本高，距离实用器件还很远，目前更多是概念验证——「可编程」的优雅与「可部署」的鲁棒之间存在巨大鸿沟。",
        "en": "DNA hydrogels respond slowly, are unstable, and are costly to synthesize, far from practical devices and for now mostly proof-of-concept — a vast gulf separates the elegance of 'programmable' from the robustness of 'deployable.'"
      },
      "subQuestions": [
        {
          "zh": "活体材料必须「活着」才能自愈、自感、自生长，但「活着」就意味着会进化、会变异、会失控——能否设计出一种既保持活性、又在进化上长期稳定可控的活材料？生命与可工程性能否共存？",
          "en": "Living materials must stay alive to self-heal, sense, and grow — but being alive means they evolve, mutate, and can escape control. Can a living material retain activity yet remain evolutionarily stable and controllable over its lifetime? Can being alive coexist with being engineerable?"
        },
        {
          "zh": "生物制造至今几乎都靠水基、常温、缓慢的细胞工厂——生命本身能否被重定向去生产它从未进化出来过的物质类别？「可被生物合成」的物质边界，到底由什么决定？",
          "en": "Biomanufacturing so far runs almost entirely on water-based, ambient-temperature, slow cell factories — can life itself be redirected to make classes of matter it never evolved to produce? What actually sets the boundary of what is biosynthesizable?"
        },
        {
          "zh": "一块能自感、自愈、自适应、自繁殖的活材料，是否已经消解了「材料」与「机器」的分界？「材料」这个概念本身，是不是已经过时？",
          "en": "Does a living material that senses, heals, adapts, and reproduces itself already dissolve the boundary between 'material' and 'machine'? Has the very concept of 'material' become obsolete?"
        }
      ]
    },
    "literature": [
      {
        "title": "Recent Advances in Stimuli-Responsive DNA-Based Hydrogels",
        "venue": "ACS Applied Bio Materials",
        "year": 2022,
        "url": "https://pubs.acs.org/doi/10.1021/acsabm.1c01197"
      },
      {
        "title": "Design and application of stimuli-responsive DNA hydrogels: A review",
        "venue": "Frontiers in Chemistry",
        "year": 2022,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC9493390/"
      },
      {
        "title": "Advances in programmable DNA nanostructures enabling stimuli-responsive drug delivery and multimodal biosensing",
        "venue": "Nanoscale Advances",
        "year": 2025,
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12203123/"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 1142,
      "y": 280,
      "scale": 0.79
    }
  },
  {
    "id": 85,
    "atlasN": 1392,
    "slug": "anthrobots-self-assembling-biobots-from",
    "title": {
      "zh": "人源自组装生物机器人（Anthrobot）",
      "en": "Anthrobots — Self-Assembling Biobots from Adult Human Cells"
    },
    "qfocus": {
      "zh": "Anthrobot的形态与行为由细胞默认的形态发生规则涌现而来——我们该如何从「只能观察涌现」走到「可设计的形态空间」，去预先编程或精确控制它的运动与功能？",
      "en": "An Anthrobot's shape and behavior emerge from cells' default morphogenetic rules — how do we move from merely observing emergence to a designable morphospace where its movement and function can be pre-programmed or precisely controlled?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C07",
      "zh": "生物混合机器人·具身智能",
      "en": "Biohybrid robotics · embodied intelligence"
    },
    "scores": [
      5,
      5,
      4,
      2,
      4,
      3,
      3,
      2,
      4
    ],
    "citation": {
      "url": "https://advanced.onlinelibrary.wiley.com/doi/10.1002/advs.202303575",
      "title": "Motile Living Biobots Self-Construct from Adult Human Somatic Progenitor Seed Cells",
      "venue": "Advanced Science",
      "year": 2024
    },
    "brief": {
      "zh": "Anthrobot 是用成人（乃至老年人）气道上皮细胞在体外自发组装成的会游动、有纤毛的多细胞「生物机器人」，无需基因改造或人工支架，成簇后还能促进划伤神经元层的再生。它把「机器人」从被制造的对象，变成细胞自组织涌现出的产物。",
      "en": "Anthrobots are ciliated, motile multicellular \"biobots\" that adult (even elderly) human airway epithelial cells spontaneously self-assemble into in vitro — no genetic edits, no synthetic scaffold — and that, when clustered, bridge and heal wounded neuronal layers in a dish. They reframe a 'robot' from a manufactured object into an emergent product of cell self-organization."
    },
    "depth": {
      "overview": {
        "zh": "一小团来自成年人（甚至老年人）气管的细胞，放进培养基里，两周后自己长成一个会用纤毛游动、还能修补神经缺口的「活机器人」——没有一行基因代码，也没有一根人工骨架。它属于发育生物学、再生医学与机器人学的交叉，展示了细胞在无外部指令下的自组装能力。",
        "en": "A small cluster of cells from an adult (even elderly) human's airway, placed in a culture medium, spontaneously grows over two weeks into a 'living robot' that swims with cilia and can even repair a neural gap — with no genetic code written and no artificial scaffold. It sits at the intersection of developmental biology, regenerative medicine, and robotics, demonstrating cells' capacity for self-assembly without external instruction."
      },
      "whyMatters": {
        "zh": "最硬的张力：它的「行为」由细胞默认的形态发生规则涌现，人几乎无法预先编程或精确控制其运动与功能；如何从「观察涌现」走到「可设计的形态空间」仍是空白。",
        "en": "The hardest tension: its 'behavior' emerges from cells' default morphogenetic rules, and humans can barely pre-program or precisely control its movement and function; how to move from 'observing emergence' to a 'designable morphospace' remains an open blank."
      },
      "ifAnswered": {
        "zh": "患者自体细胞造出的个性化生物机器人有望成为免疫兼容的体内修复与递送载体。",
        "en": "Patient-derived personalized biobots point toward immune-compatible in-body repair and delivery agents."
      },
      "approaches": [
        {
          "zh": "研究成体气道上皮细胞在培养基中约两周自组装成形的默认形态发生规则，尝试找出可调控纤毛驱动运动与聚簇行为的控制参数，从「观察涌现」迈向「可设计的形态空间」。",
          "en": "Study the default morphogenetic rules by which adult airway epithelial cells self-assemble in culture over roughly two weeks, seeking controllable parameters for ciliary locomotion and clustering behavior, moving from 'observing emergence' toward a 'designable morphospace.'"
        },
        {
          "zh": "沿着「超级机器人（superbot）」成簇后促进划伤神经元层再生的现象，探索其作为体内修复、递送载体的可控化路径，而不只是培养皿里的一次性演示。",
          "en": "Follow up on the phenomenon that clustered 'superbots' promote regeneration of wounded neuronal layers, exploring a controllable path toward in-body repair and delivery agents rather than a one-off dish demonstration."
        },
        {
          "zh": "借鉴同一集群关于设计-涌现边界与活体-机械持久接口的追问，建立评估自组装生物机器人可控性、以及患者自体细胞免疫兼容性的理论框架。",
          "en": "Draw on the cluster's questions about the design-emergence boundary and durable living-mechanical interfaces to build a theoretical framework for assessing the controllability of self-assembling biobots and the immune compatibility of patient-derived cells."
        }
      ],
      "barrier": {
        "zh": "它的「行为」由细胞默认的形态发生规则涌现，人几乎无法预先编程或精确控制其运动与功能；如何从「观察涌现」走到「可设计的形态空间」仍是空白。",
        "en": "Its 'behavior' emerges from cells' default morphogenetic rules, and humans can barely pre-program or precisely control its movement and function; how to move from 'observing emergence' to a 'designable morphospace' remains an open blank."
      },
      "subQuestions": [
        {
          "zh": "一个生物混合机器人的「行为」到底是被设计出来的，还是从活体材料里自发涌现的？设计者究竟控制了什么？",
          "en": "Is a biohybrid robot's behavior designed, or does it emerge spontaneously from living matter? What does the designer actually control?"
        },
        {
          "zh": "没有神经系统、仅靠形态与材料力学就能完成复杂适应行为的生物混合体，是否证明了「形态计算」是一种独立于神经计算的智能？身体能不能不靠脑就「思考」？",
          "en": "Does a biohybrid that performs complex adaptive behavior with no nervous system, through morphology and material mechanics alone, prove that 'morphological computation' is a form of intelligence independent of neural computation? Can a body 'think' without a brain?"
        },
        {
          "zh": "能否为「活体与机械的接口」建立一种通用、稳定、双向的能量与信息转换原理，让活组织与人造执行器在多年时间尺度上无排异、无退化地协同？",
          "en": "Can we establish a universal, stable, bidirectional principle for the living-mechanical interface, letting living tissue and artificial actuators co-operate over years without rejection or degradation?"
        }
      ]
    },
    "literature": [
      {
        "title": "Motile Living Biobots Self-Construct from Adult Human Somatic Progenitor Seed Cells",
        "venue": "Advanced Science",
        "year": 2024,
        "url": "https://advanced.onlinelibrary.wiley.com/doi/10.1002/advs.202303575"
      },
      {
        "title": "With Living Robots, Scientists Unlock Cells' Power to Heal",
        "venue": "Tufts Now",
        "year": 2024,
        "url": "https://now.tufts.edu/2024/03/22/living-robots-scientists-unlock-cells-power-heal"
      },
      {
        "title": "Scientists build tiny biological robots from human cells",
        "venue": "Wyss Institute, Harvard",
        "year": 2023,
        "url": "https://wyss.harvard.edu/news/scientists-build-tiny-biological-robots-from-human-cells/"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 788,
      "y": 246,
      "scale": 0.85
    }
  },
  {
    "id": 86,
    "atlasN": 104,
    "slug": "xenobots",
    "title": {
      "zh": "异种生物机器人（xenobots）",
      "en": "Xenobots"
    },
    "qfocus": {
      "zh": "「能自我复制的人造活体」在何处划开「生命」与「机器」的边界——而监管与公众接受度，是否会比技术本身更早成为这个领域的天花板？",
      "en": "Where does a 'self-replicating artificial living thing' draw the line between 'life' and 'machine' — and will regulation and public acceptance become this field's ceiling sooner than the technology itself?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C07",
      "zh": "生物混合机器人·具身智能",
      "en": "Biohybrid robotics · embodied intelligence"
    },
    "scores": [
      5,
      5,
      4,
      2,
      3,
      2,
      2,
      2,
      3
    ],
    "citation": {
      "url": "https://www.science.org/doi/10.1126/scirobotics.abf1571",
      "title": "A cellular platform for the development of synthetic living machines",
      "venue": "Science Robotics",
      "year": 2021
    },
    "brief": {
      "zh": "从非洲爪蟾胚胎细胞出发，由进化算法设计、人工组装出能自主运动、自愈、甚至以「运动学复制」聚拢散细胞而增殖的细胞集合体，是被重编程的活体可编程物质。它既非传统生物也非传统机器，最大价值是逼问「什么算生命、什么算机器」的边界。正因「能自我复制的人造活体」触及伦理与生物安全红线，监管与公众接受度可能比技术本身更早成为天花板。",
      "en": "Starting from Xenopus frog embryonic cells, evolutionary algorithms design and humans assemble cell clusters that move autonomously, self-heal, and even reproduce by 'kinematic replication' (gathering loose cells), forming reprogrammed living programmable matter. Neither traditional organism nor machine, its greatest value is forcing the question of what counts as 'life' versus 'machine.' Precisely because 'self-replicating artificial living things' touch ethical and biosafety red lines, regulation and public acceptance may become the ceiling sooner than the technology itself."
    },
    "depth": {
      "overview": {
        "zh": "从青蛙等细胞出发，由算法设计、人工组装出能自主运动、自愈甚至以「运动学复制」方式增殖的细胞集合体，属于合成生物学、机器人学与伦理学的交叉。它既不是传统生物也不是传统机器，而是被重新编程的活体可编程物质。",
        "en": "Starting from cells of frogs and other organisms, algorithms design and humans assemble cell collectives that can move autonomously, self-heal, and even proliferate via 'kinematic replication', an intersection of synthetic biology, robotics, and ethics. It is neither a traditional organism nor a traditional machine, but reprogrammed living programmable matter."
      },
      "whyMatters": {
        "zh": "它最大的价值是逼问「什么算生命、什么算机器」这一边界，但也正因为「能自我复制的人造活体」触及伦理与生物安全红线，监管与公众接受度可能比技术本身更早成为天花板。",
        "en": "Its greatest value is forcing the question of where the boundary between 'life' and 'machine' lies, but precisely because 'self-replicating artificial living things' touch ethical and biosafety red lines, regulation and public acceptance may become the ceiling sooner than the technology itself."
      },
      "ifAnswered": {
        "zh": "厘清生命与机器的边界，将重新定义「生命/机器」这一分类本身。",
        "en": "Clarifying the boundary between life and machine will redefine the 'life/machine' distinction itself."
      },
      "approaches": [
        {
          "zh": "用进化算法在计算机里探索能自主运动、自愈、以运动学复制增殖的细胞构型设计空间，再交由人工用青蛙等细胞组装出来。",
          "en": "Use evolutionary algorithms to explore, in silico, the design space of cell configurations that move autonomously, self-heal, and reproduce via kinematic replication, then have humans assemble them from frog and other cells."
        },
        {
          "zh": "研究设计与涌现的可控边界：当细胞集合体的行为大量来自细胞自身的主动性而非设计者指令时，厘清设计者到底控制了什么。",
          "en": "Study the controllable boundary between design and emergence: when a cell collective's behavior largely comes from the cells' own agency rather than the designer's instructions, clarify what the designer actually controls."
        },
        {
          "zh": "探索形态计算作为独立于神经计算的智能形式——异种机器人没有神经系统却能协调运动，评估身体的物理结构本身能否承载适应性计算。",
          "en": "Explore morphological computation as a form of intelligence independent of neural computation — xenobots have no nervous system yet show coordinated movement, so assess whether the body's physical structure can itself carry adaptive computation."
        }
      ],
      "barrier": {
        "zh": "「能自我复制的人造活体」触及伦理与生物安全红线，监管与公众接受度可能比技术本身更早成为天花板。",
        "en": "'Self-replicating artificial living things' touch ethical and biosafety red lines, and regulation and public acceptance may become the ceiling sooner than the technology itself."
      },
      "subQuestions": [
        {
          "zh": "一个生物混合机器人的「行为」到底是被设计出来的，还是从活体材料里自发涌现的？设计者究竟控制了什么？",
          "en": "Is a biohybrid robot's behavior designed, or does it emerge spontaneously from living matter? What does the designer actually control?"
        },
        {
          "zh": "没有神经系统、仅靠形态与材料力学就能完成复杂适应行为的生物混合体，是否证明了「形态计算」是一种独立于神经计算的智能？身体能不能不靠脑就「思考」？",
          "en": "Does a biohybrid that performs complex adaptive behavior with no nervous system, through morphology and material mechanics alone, prove that 'morphological computation' is a form of intelligence independent of neural computation? Can a body 'think' without a brain?"
        },
        {
          "zh": "能否为「活体与机械的接口」建立一种通用、稳定、双向的能量与信息转换原理，让活组织与人造执行器在多年时间尺度上无排异、无退化地协同？",
          "en": "Can we establish a universal, stable, bidirectional principle for the living-mechanical interface, letting living tissue and artificial actuators co-operate over years without rejection or degradation?"
        }
      ]
    },
    "literature": [
      {
        "title": "Kinematic self-replication in reconfigurable organisms",
        "venue": "PNAS",
        "year": 2021,
        "url": "https://www.pnas.org/doi/10.1073/pnas.2112672118"
      },
      {
        "title": "A cellular platform for the development of synthetic living machines",
        "venue": "Science Robotics",
        "year": 2021,
        "url": "https://www.science.org/doi/10.1126/scirobotics.abf1571"
      },
      {
        "title": "A scalable pipeline for designing reconfigurable organisms",
        "venue": "PNAS",
        "year": 2020,
        "url": "https://doi.org/10.1073/pnas.1910837117"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 713,
      "y": 289,
      "scale": 0.95
    }
  },
  {
    "id": 87,
    "atlasN": 137,
    "slug": "cell-digital-twins-virtual-cells",
    "title": {
      "zh": "细胞数字孪生 / 虚拟细胞",
      "en": "Cell Digital Twins / Virtual Cells"
    },
    "qfocus": {
      "zh": "机理驱动与数据驱动这两条建模路线该如何融合，才能让「虚拟细胞」从局部模块的成功，扩展为能大规模替代湿实验筛选的完整细胞孪生？",
      "en": "How should mechanistic and data-driven modeling routes be fused so that the 'virtual cell' can grow from success in local modules into a complete cell twin able to replace wet-lab screening at scale?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C09",
      "zh": "数字孪生·虚拟科学",
      "en": "Digital twins · virtual science"
    },
    "scores": [
      5,
      4,
      5,
      3,
      4,
      2,
      2,
      2,
      2
    ],
    "citation": {
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12148494/",
      "title": "How to build the virtual cell with artificial intelligence: Priorities and opportunities",
      "venue": "Cell",
      "year": 2024
    },
    "brief": {
      "zh": "用数据与机理模型重建一个能模拟代谢、基因表达、信号转导的「会活的」虚拟细胞，把多组学数据整合进统一可运行的模型，被视为计算生物学的圣杯。一旦成真可大规模替代湿实验筛选，价值巨大，但细胞内过程跨越巨大时空尺度、参数高度不可观测，「虚拟细胞」更可能先在局部模块成立，整体仍是长期渐近目标。",
      "en": "Using data and mechanistic models to reconstruct a 'living' virtual cell that simulates metabolism, gene expression, and signal transduction, integrating multi-omics data into a unified runnable model, is regarded as the holy grail of computational biology. Once realized it could replace wet-lab screening at scale, an enormous payoff, but intracellular processes span vast spatiotemporal scales with highly unobservable parameters — the 'virtual cell' is more likely to hold first for local modules, with the whole remaining a long-term asymptotic goal."
    },
    "depth": {
      "overview": {
        "zh": "用数据与机理模型重建一个能模拟代谢、基因表达、信号转导的「会活的」虚拟细胞，在计算机里复现细胞行为，被视为计算生物学的圣杯，融合系统生物学、人工智能与计算科学。它整合多组学数据于统一可运行的模型。",
        "en": "Using data and mechanistic models to reconstruct a 'living' virtual cell that can simulate metabolism, gene expression, and signal transduction, reproducing cell behavior in silico, regarded as the holy grail of computational biology, fusing systems biology, AI, and computing science. It integrates multi-omics data into a unified runnable model."
      },
      "whyMatters": {
        "zh": "一旦成真可大规模替代湿实验筛选，价值巨大；但细胞内过程跨越巨大时空尺度、参数高度不可观测，且机理与数据驱动两条路线如何融合尚无定论——「虚拟细胞」更可能先在局部模块成立，整体仍长期是渐近目标。",
        "en": "Once realized it could replace wet-lab screening at scale, with enormous value; but intracellular processes span vast spatiotemporal scales, parameters are highly unobservable, and how to fuse the mechanistic and data-driven routes is still undecided. The 'virtual cell' is more likely to hold first in local modules, while the whole remains a long-term asymptotic goal."
      },
      "ifAnswered": {
        "zh": "细胞数字孪生若能成熟，将部分替代湿实验筛选。",
        "en": "A mature cell digital twin will partly replace wet-lab screening."
      },
      "approaches": [
        {
          "zh": "结合多组学数据与机理模型，先在局部模块（如支原体全细胞模型）验证可运行性，再逐步扩展尺度与覆盖范围。",
          "en": "Combine multi-omics data with mechanistic models, first validating runnability in local modules (such as the Mycoplasma whole-cell model), then gradually expanding scale and coverage."
        },
        {
          "zh": "为学出的模拟器建立可证明的可信域与失效检测机制，判定其在给定传感密度与计算资源下能可信预测多久。",
          "en": "Build provable trust regions and failure-detection mechanisms for learned simulators, determining how long a given twin can be trusted to predict given sensing density and compute resources."
        },
        {
          "zh": "厘清自主科学发现闭环中「预测准确」与「人类可理解解释」的边界，决定哪些细胞行为预测任务可交给AI自主完成、哪些必须保留人类解释。",
          "en": "Clarify where 'predictive accuracy' and 'human-comprehensible explanation' diverge in autonomous discovery loops, deciding which cell-behavior prediction tasks can be handed to AI and which must retain human explanation."
        }
      ],
      "barrier": {
        "zh": "细胞内过程跨越巨大时空尺度、参数高度不可观测，且机理与数据驱动两条路线如何融合尚无定论——「虚拟细胞」更可能先在局部模块成立，整体仍长期是渐近目标。",
        "en": "Intracellular processes span vast spatiotemporal scales, parameters are highly unobservable, and how to fuse the mechanistic and data-driven routes is still undecided. The 'virtual cell' is more likely to hold first in local modules, while the whole remains a long-term asymptotic goal."
      },
      "subQuestions": [
        {
          "zh": "一个高保真数字孪生在多长的预测时域内仍然「忠实」于真实系统？是否存在一条由信息论决定的「可同化性极限」，限制任何数字孪生能预测多远？",
          "en": "Over what prediction horizon does a high-fidelity digital twin remain faithful to its physical original — and is there an information-theoretic 'assimilability limit' bounding how far any digital twin can ever forecast?"
        },
        {
          "zh": "用大规模神经网络「学出」的代理模型驱动虚拟科学时，这些模型是在发现可外推的物理规律，还是只是在内插训练分布？能否判定一个学得的模拟器何时会在陌生状态空间里悄悄失效？",
          "en": "When virtual science is driven by large neural surrogate models, are those models discovering extrapolable physical laws or merely interpolating the training distribution — and can we tell when a learned simulator will silently fail outside its training distribution?"
        },
        {
          "zh": "如果把整个科学发现过程本身建成数字孪生，让AI自主提出假设、设计实验、解释结果——「理解」与「预测准确」在何处分道扬镳？一个能完美预测却无法向人类解释「为什么」的体系，还算不算科学？",
          "en": "If the scientific discovery process itself is built as a digital twin, with AI autonomously proposing hypotheses, designing experiments, and interpreting results, where do 'understanding' and 'predictive accuracy' diverge? Does a system that predicts perfectly but cannot explain why to humans still count as science?"
        }
      ]
    },
    "literature": [
      {
        "title": "How to build the virtual cell with artificial intelligence: Priorities and opportunities",
        "venue": "Cell",
        "year": 2024,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12148494/"
      },
      {
        "title": "Towards multimodal foundation models in molecular cell biology",
        "venue": "Nature",
        "year": 2025,
        "url": "https://www.nature.com/articles/s41586-025-08710-y"
      },
      {
        "title": "Grow AI virtual cells: three data pillars and closed-loop learning",
        "venue": "Cell Research",
        "year": 2025,
        "url": "https://www.nature.com/articles/s41422-025-01101-y"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 619,
      "y": 755,
      "scale": 0.81
    }
  },
  {
    "id": 88,
    "atlasN": 167,
    "slug": "environment-health-exposome-monitoring",
    "title": {
      "zh": "环境-健康暴露组监测",
      "en": "Environment-Health Exposome Monitoring"
    },
    "qfocus": {
      "zh": "暴露组维度极高、个体轨迹复杂——需要多大规模、多长期的队列，才能把「相关」的环境暴露真正推进到「致病」的因果结论？",
      "en": "The exposome is extremely high-dimensional and individual trajectories are complex — how large and long-running a cohort is needed to move environmental exposure from 'correlation' to a real causal conclusion about disease?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C10",
      "zh": "分布式生物传感·诊断",
      "en": "Distributed biosensing · diagnostics"
    },
    "scores": [
      4,
      4,
      3,
      4,
      3,
      3,
      3,
      2,
      4
    ],
    "citation": {
      "url": "https://doi.org/10.1021/acs.est.3c02238",
      "title": "AirPen: A Wearable Monitor for Characterizing Exposures to Particulate Matter and Volatile Organic Compounds",
      "venue": "Environmental Science & Technology",
      "year": 2023
    },
    "brief": {
      "zh": "用可穿戴空气、化学、紫外传感配合环境数据，追踪个人一生累积接触的污染物、过敏原、化学物质，即「暴露组」，把流行病学长期忽视的环境暴露维度个体化、连续化。它补上基因之外影响慢病的另一半拼图，但暴露组维度极高、个体轨迹复杂，从「相关」到「致病」需要海量长期队列——数据采集只是开始，因果推断才是真正的硬骨头。",
      "en": "Using wearable air, chemical, and UV sensors together with environmental data to track the pollutants, allergens, and chemicals an individual accumulates over a lifetime — the 'exposome' — individualizing and continualizing the environmental-exposure dimension long neglected by epidemiology. It supplies the other half of the chronic-disease puzzle beyond genes, but the exposome is extremely high-dimensional with complex individual trajectories, and moving from 'correlation' to 'causation' needs huge long-term cohorts — data collection is only the start, and causal inference is the real hard bone."
    },
    "depth": {
      "overview": {
        "zh": "环境-健康暴露组监测用可穿戴空气、化学、紫外传感配合环境数据，追踪个人一生中累积接触的污染物、过敏原、化学物质，即「暴露组」。它交叉健康、环境与数据科学，核心想法是把流行病学长期忽视的「环境暴露」维度个体化、连续化，补上基因之外影响慢病的另一半拼图。",
        "en": "Environment-health exposome monitoring uses wearable air, chemical, and UV sensors together with environmental data to track the pollutants, allergens, and chemicals a person accumulates over a lifetime — the 'exposome.' It crosses health, environment, and data science, with the core idea of individualizing and making continuous the 'environmental exposure' dimension long neglected by epidemiology, filling in the other half of the puzzle beyond genes that influences chronic disease."
      },
      "whyMatters": {
        "zh": "它要回答的是「环境如何塑造健康」这一慢病研究的根本缺口，配上基因组就构成完整因果图景。难点是暴露组维度极高、个体轨迹复杂，且从「相关」到「致病」需要海量长期队列——数据采集只是开始，因果推断才是真正的硬骨头。",
        "en": "It addresses the fundamental gap in chronic-disease research — 'how the environment shapes health' — which, paired with the genome, forms a complete causal picture. The difficulty is that the exposome is extremely high-dimensional and individual trajectories are complex, and going from 'correlation' to 'causation' requires massive long-term cohorts — data collection is only the start, causal inference is the real hard bone."
      },
      "ifAnswered": {
        "zh": "暴露组监测成熟后，将连接环境与慢病研究，把环境暴露的因果证据补进基因组之外的另一半拼图。",
        "en": "A mature exposome-monitoring capability will link environment and chronic-disease research, supplying causal evidence for the half of the puzzle that lies beyond the genome."
      },
      "approaches": [
        {
          "zh": "用可穿戴空气、化学、紫外传感器持续采集个体暴露轨迹，把流行病学长期忽视的环境暴露维度变得可个体化、连续化。",
          "en": "Use wearable air, chemical, and UV sensors to continuously capture an individual's exposure trajectory, making the environmental-exposure dimension long neglected by epidemiology individualized and continuous."
        },
        {
          "zh": "研究单分子检测的物理极限——受热噪声、布朗输运还是信息论下界约束，判断哪些疾病的最早期信号原理上能被廉价、分布式地捕获。",
          "en": "Study the physical limit of single-molecule detection — bounded by thermal noise, Brownian transport, or an information-theoretic floor — to determine which earliest disease signals can in principle be caught by cheap, distributed sensors."
        },
        {
          "zh": "探索把大量廉价、低精度传感器联成网络后，群体层面能否「涌现」出超越单个高精度检测的早期预警能力，从而决定诊断投资该押注更灵敏的单点传感器，还是更密的传感网络与推断。",
          "en": "Explore whether networking many cheap, low-precision sensors can make a population-level early-warning signal 'emerge' that outperforms any single high-precision test, deciding whether diagnostic investment should bet on more sensitive individual sensors or on denser sensor networks plus inference."
        }
      ],
      "barrier": {
        "zh": "暴露组维度极高、个体轨迹复杂，且从「相关」到「致病」需要海量长期队列——数据采集只是开始，因果推断才是真正的硬骨头。",
        "en": "The exposome is extremely high-dimensional and individual trajectories are complex, and going from 'correlation' to 'causation' requires massive long-term cohorts — data collection is only the start, causal inference is the real hard bone."
      },
      "subQuestions": [
        {
          "zh": "单个分子的检测受什么根本物理极限约束——在复杂生物背景中无需扩增、无需标记地可靠识别仅几个拷贝的目标分子，是受限于热噪声、布朗输运，还是尚未被刻画的信息论下界？",
          "en": "What fundamental physical limit governs single-molecule detection — is reliably identifying a target present in only a few copies, without amplification or labels, in a complex biological background bounded by thermal noise, Brownian transport, or a not-yet-characterized information-theoretic floor?"
        },
        {
          "zh": "把数十亿个廉价、低精度的分布式生物传感器联成一张持续监测人群的网络，群体层面的诊断信号能否「涌现」出超越任何单个高精度检测的早期预警能力？",
          "en": "If billions of cheap, low-precision distributed biosensors are networked into a continuous population-scale monitor, can a population-level diagnostic signal emerge that gives earlier warning than any single high-precision test?"
        },
        {
          "zh": "活体细胞能否被工程化成可靠、可校准、可持续在人体内运行的「分布式诊断器件」，读取体内分子状态、计算、并在病变出现时输出可被外部读出的信号？",
          "en": "Can living cells be engineered into reliable, calibratable, durable distributed diagnostic devices that sense the body's molecular state in situ, compute, and emit an externally readable signal when pathology appears?"
        }
      ]
    },
    "literature": [
      {
        "title": "Features and Practicability of the Next-Generation Sensors and Monitors for Exposure Assessment to Airborne Pollutants: A Systematic Review",
        "venue": "Sensors",
        "year": 2021,
        "url": "https://doi.org/10.3390/s21134513"
      },
      {
        "title": "AirPen: A Wearable Monitor for Characterizing Exposures to Particulate Matter and Volatile Organic Compounds",
        "venue": "Environmental Science & Technology",
        "year": 2023,
        "url": "https://doi.org/10.1021/acs.est.3c02238"
      },
      {
        "title": "An Assessment of Multipollutant Exposures Using Silicone Wristbands Among Bangladeshi Youth",
        "venue": "International Journal of Environmental Research and Public Health",
        "year": 2024,
        "url": "https://doi.org/10.3390/ijerph21121691"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 789,
      "y": 454,
      "scale": 0.96
    }
  },
  {
    "id": 89,
    "atlasN": 169,
    "slug": "individual-differences-in-taste-and",
    "title": {
      "zh": "味嗅感知的个体差异",
      "en": "Individual Differences in Taste and Smell Perception"
    },
    "qfocus": {
      "zh": "为什么同一种物质——香菜、芦笋代谢物、苦味化合物——会让不同人产生截然不同的感知，这种差异有多少源自基因型、多少源自文化框定？",
      "en": "Why does the same substance — cilantro, asparagus metabolites, bitter compounds — trigger starkly different perceptions across people, and how much of that variation is genotype versus cultural framing?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C10",
      "zh": "分布式生物传感·诊断",
      "en": "Distributed biosensing · diagnostics"
    },
    "scores": [
      3,
      4,
      2,
      5,
      3,
      4,
      3,
      3,
      5
    ],
    "citation": {
      "url": "https://doi.org/10.1093/chemse/bjt016",
      "title": "Genetic, functional, and phenotypic diversity in TAS2R38-mediated bitter taste perception",
      "venue": "Chemical Senses",
      "year": 2013
    },
    "brief": {
      "zh": "研究为何香菜、芦笋代谢物、PTC/PROP苦味等同一物质在不同人身上感知迥异，把基因型、文化背景与主观感知关联起来；门槛极低、易众包，是研究基因如何塑造「质性体验」的天然实验场。",
      "en": "Studies why the same substance—cilantro, asparagus metabolites, PTC/PROP bitterness—is perceived so differently across people, linking genotype, cultural background and subjective perception; its low barrier and easy crowdsourcing make it a natural testbed for how genes shape 'qualitative experience'."
    },
    "depth": {
      "overview": {
        "zh": "味嗅感知的个体差异研究追问：为何同一物质在不同人身上感知截然不同（如香菜像肥皂、芦笋代谢物有无嗅感、PTC/PROP的苦味强弱）。它交叉感官科学、遗传学与数据科学，核心思路是利用这一现象门槛低、易众包的特点，做大规模基因型-环境-感知关联，把基因如何塑造主观体验变成可操作的研究模型。",
        "en": "Research on individual differences in taste and smell perception asks why the same substance is perceived so differently across people — cilantro tasting like soap, detecting (or not) the asparagus-metabolite odor, PTC/PROP bitterness intensity. Crossing sensory science, genetics and data science, its core approach exploits this phenomenon's low barrier and easy crowdsourcing to run large-scale genotype-environment-perception association, turning how genes shape subjective experience into a tractable research model."
      },
      "whyMatters": {
        "zh": "它是连接基因型与「质性体验」的罕见可量化窗口，且天然适合公众参与科学。但不显然的风险在于自报感知极不可靠、受语言和文化框定——把「觉得像肥皂」这种主观描述变成可做遗传关联的硬表型，本身就是尚未解决的方法学难题。",
        "en": "It is a rare quantifiable window connecting genotype to 'qualitative experience', and is naturally suited to citizen science. The non-obvious risk is that self-reported perception is highly unreliable and shaped by language and culture — turning a subjective description like 'tastes like soap' into a hard phenotype usable for genetic association is itself an unresolved methodological problem."
      },
      "ifAnswered": {
        "zh": "若能建立可靠的主观感知量化方法，味嗅感知研究将把基因、文化与感知连成一条可验证的因果链，为理解基因如何塑造主观体验提供范本。",
        "en": "Establishing reliable ways to quantify subjective perception would let taste-and-smell research link genes, culture and perception into a verifiable causal chain, offering a template for understanding how genes shape subjective experience."
      },
      "approaches": [
        {
          "zh": "大规模众包基因型-表型关联：招募志愿者做嗅觉/味觉自评并测序目标基因（如OR6A2、TAS2R38），寻找与感知强弱相关的等位变异。",
          "en": "Large-scale crowdsourced genotype-phenotype association: recruit volunteers for smell/taste self-report plus genotyping of target genes (e.g. OR6A2, TAS2R38) to find alleles correlated with perceived intensity."
        },
        {
          "zh": "跨文化标定主观描述：在不同语言、饮食背景人群中比较同一化合物的描述词，检验「像肥皂」「苦」等表述是否是可迁移的硬表型。",
          "en": "Cross-cultural calibration of subjective description: compare descriptive terms for the same compound across languages and dietary backgrounds, testing whether phrases like 'soapy' or 'bitter' are transferable hard phenotypes."
        },
        {
          "zh": "把嗅觉/味觉受体当作天然化学传感器模型：借鉴分布式生物传感研究中「单分子检测物理极限」的框架，反推受体灵敏度与感知阈值之间的关系。",
          "en": "Treat olfactory/taste receptors as natural chemical-sensor models: borrow the 'physical limits of single-molecule detection' framework from distributed biosensing research to work backward from receptor sensitivity to perceptual thresholds."
        }
      ],
      "barrier": {
        "zh": "自报感知极不可靠，且受语言和文化深度框定；把「觉得像肥皂」这样的主观描述转化为可用于遗传关联分析的硬表型，本身就是尚未解决的方法学难题。",
        "en": "Self-reported perception is highly unreliable and deeply shaped by language and culture; converting a subjective description like 'tastes like soap' into a hard phenotype usable for genetic-association analysis is itself an unresolved methodological problem."
      },
      "subQuestions": [
        {
          "zh": "单个分子的检测，物理上究竟受什么根本极限约束？在复杂生物背景（血液、唾液）中无需扩增、无需标记地可靠识别出仅有几个拷贝的目标分子，是受限于热噪声、布朗输运，还是某种尚未被刻画的信息论下界？",
          "en": "What fundamental physical limit governs single-molecule detection — is reliably identifying a target present in only a few copies, without amplification or labels, inside a complex biological background such as blood or saliva, bounded by thermal noise, by Brownian transport to the sensor, or by some not-yet-characterized information-theoretic floor?"
        },
        {
          "zh": "如果把数十亿个廉价、低精度的分布式生物传感器联成一张持续监测人群的网络，群体层面的诊断信号能否「涌现」出超越任何单个高精度检测的早期预警能力？",
          "en": "If billions of cheap, low-precision distributed biosensors are networked into a continuous population-scale monitor, can a population-level diagnostic signal emerge that gives earlier warning than any single high-precision test?"
        },
        {
          "zh": "活体细胞能否被工程化成可靠、可校准、可持续在人体内运行的「分布式诊断器件」——它们读取体内的分子状态、计算、并在病变出现时输出可被外部读出的信号？",
          "en": "Can living cells be engineered into reliable, calibratable, durable distributed diagnostic devices that sense the body's molecular state in situ, compute, and emit an externally readable signal when pathology appears?"
        }
      ]
    },
    "literature": [
      {
        "title": "Genetic variation in the human olfactory receptor OR5AN1 associates with the perception of musks",
        "venue": "Chemical Senses",
        "year": 2023,
        "url": "https://doi.org/10.1093/chemse/bjac037"
      },
      {
        "title": "Genetic, functional, and phenotypic diversity in TAS2R38-mediated bitter taste perception",
        "venue": "Chemical Senses",
        "year": 2013,
        "url": "https://doi.org/10.1093/chemse/bjt016"
      },
      {
        "title": "Differential Activation of TAS2R4 May Recover Ability to Taste Propylthiouracil for Some TAS2R38 AVI Homozygotes",
        "venue": "Nutrients",
        "year": 2024,
        "url": "https://doi.org/10.3390/nu16091357"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 527,
      "y": 376,
      "scale": 0.79
    }
  },
  {
    "id": 90,
    "atlasN": 178,
    "slug": "cross-species-cognition-and-comparative",
    "title": {
      "zh": "跨物种认知与比较心智",
      "en": "Cross-Species Cognition and Comparative Minds"
    },
    "qfocus": {
      "zh": "当AI在某些认知维度超越动物甚至人类时，我们该用什么统一、物种中立的框架来比较人、动物与AI的学习与推理能力？",
      "en": "As AI surpasses animals and even humans on some cognitive dimensions, what unified, species-neutral framework can compare learning and reasoning across humans, animals, and AI?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C11",
      "zh": "神经技术·计算认知",
      "en": "Neurotechnology · computational cognition"
    },
    "scores": [
      5,
      5,
      3,
      3,
      5,
      3,
      2,
      2,
      4
    ],
    "citation": {
      "url": "https://www.nature.com/articles/s44159-025-00456-8",
      "title": "Bringing comparative cognition approaches to AI systems",
      "venue": "Nature Reviews Psychology",
      "year": 2025
    },
    "brief": {
      "zh": "用统一计算框架比较人、动物与AI的学习、推理与心智能力，让AI既做研究工具（分析动物行为）又做比较对象（一种非生物智能），在更广的「心智空间」里重新定位人类智能。",
      "en": "Uses a unified computational framework to compare learning, reasoning and mind across humans, animals and AI, with AI serving both as a research tool for analyzing animal behavior and as a comparison object—a non-biological intelligence—relocating human intelligence within a broader 'space of minds'."
    },
    "depth": {
      "overview": {
        "zh": "跨物种认知与比较心智试图用统一的计算框架，比较人类、动物乃至AI在学习、推理与心智能力上的共性与边界。它交叉认知科学、生物学与AI，核心思路是让AI同时扮演研究工具（分析动物行为数据）与比较对象（一种非生物智能）的双重角色。",
        "en": "Cross-species cognition and comparative minds attempt to use a unified computational framework to compare the commonalities and boundaries of learning, reasoning and mental capacity across humans, animals and even AI. Crossing cognitive science, biology and AI, its core approach has AI play a dual role — a research tool for analyzing animal behavior data, and simultaneously an object of comparison as a non-biological intelligence."
      },
      "whyMatters": {
        "zh": "它最深远的影响是逼我们重新定义「智能」——当AI在某些维度超过动物甚至人，原有的拟人化标尺就失效了。难点在于跨物种比较极易陷入拟人或拟机的双重偏见，设计真正物种中立、能力中立的认知测验本身就是巨大的方法学挑战。",
        "en": "Its most far-reaching impact is forcing us to redefine 'intelligence' — once AI surpasses animals or even humans on some dimensions, the old anthropomorphic yardstick fails. The difficulty is that cross-species comparison easily falls into the twin biases of anthropomorphism and mechanomorphism; designing a genuinely species-neutral, capacity-neutral cognitive test is itself a huge methodological challenge."
      },
      "ifAnswered": {
        "zh": "若能建立物种中立的比较框架，我们对「智能」的定义将被重塑——它会从以人类为唯一标尺的概念，变成一张容纳生物与非生物心智的连续谱系。",
        "en": "Establishing a species-neutral comparative framework would reshape our definition of 'intelligence' — from a concept measured solely against the human yardstick into a continuous spectrum encompassing both biological and non-biological minds."
      },
      "approaches": [
        {
          "zh": "构建跨物种共用的行为学任务库（如虚拟实验环境），让人、动物与AI在同一套标准化认知测验中被评测，减少物种特异性偏差。",
          "en": "Build a cross-species shared behavioral task library (e.g. virtual test environments) so humans, animals, and AI are all evaluated on the same standardized cognitive battery, reducing species-specific bias."
        },
        {
          "zh": "把AI既当分析工具又当比较对象：用机器学习分析海量动物行为记录，同时把AI系统本身的学习曲线、泛化能力纳入同一比较心智空间。",
          "en": "Treat AI as both analytical tool and comparison subject: use machine learning to analyze vast animal-behavior recordings while placing AI systems' own learning curves and generalization ability into the same comparative-mind space."
        },
        {
          "zh": "针对拟人化/拟机化的双重偏见，设计能力中立的测验协议——不预设哪种智能形式是「标准」，而是从多个独立维度刻画心智的共性与边界。",
          "en": "To counter the twin biases of anthropomorphism and mechanomorphism, design capacity-neutral test protocols that presuppose no single form of intelligence as the 'standard', instead characterizing the commonalities and boundaries of minds along multiple independent dimensions."
        }
      ],
      "barrier": {
        "zh": "跨物种比较极易陷入拟人化或拟机化的双重偏见；设计一套真正物种中立、能力中立的认知测验，本身就是尚未解决的巨大方法学挑战。",
        "en": "Cross-species comparison easily falls into the twin biases of anthropomorphism and mechanomorphism; designing a genuinely species-neutral, capacity-neutral cognitive test is itself a huge, unresolved methodological challenge."
      },
      "subQuestions": [
        {
          "zh": "大脑用什么「码」来表征信息——是单个神经元的发放率、群体的几何结构、精确的脉冲时序，还是某种我们尚未识别的动力学变量？如果我们至今不知道神经活动如何编码意义，那么任何脑机接口的「读写」都是在猜测一种我们看不懂的语言吗？",
          "en": "What code does the brain use to represent information — single-neuron firing rates, the geometry of population activity, precise spike timing, or some dynamical variable we have not yet identified — and if we still do not know how neural activity encodes meaning, is every brain–computer interface 'read' and 'write' merely guessing at a language we cannot read?"
        },
        {
          "zh": "主观体验（意识）能否从物理或计算的第一性原理被解释——「为什么这些神经过程伴随着『感受』，而不是在黑暗中无声运行」？这个「难问题」是科学终将解答的，还是它揭示了我们关于物质与心智的概念框架本身有根本缺口？",
          "en": "Can subjective experience — consciousness — be explained from physical or computational first principles, namely why these neural processes are accompanied by felt experience rather than running silently in the dark — and is this 'hard problem' something science will eventually answer, or does it reveal a fundamental gap in our very conceptual framework for matter and mind?"
        },
        {
          "zh": "如果脑机接口能够长期、双向地把人脑与外部计算系统耦合，「自我」的边界会落在哪里？被持续读写的大脑所产生的意图、记忆与决策，还能在多大程度上被认定为「这个人自己的」——神经技术是否会迫使我们重新定义个人身份与能动性这一概念本身？",
          "en": "If brain–computer interfaces can couple the human brain and external computation bidirectionally and long-term, where does the boundary of the self fall — to what extent can the intentions, memories, and decisions produced by a continuously read-and-written brain still be attributed to 'this person', and will neurotechnology force us to redefine the very concepts of personal identity and agency?"
        }
      ]
    },
    "literature": [
      {
        "title": "Bringing comparative cognition approaches to AI systems",
        "venue": "Nature Reviews Psychology",
        "year": 2025,
        "url": "https://www.nature.com/articles/s44159-025-00456-8"
      },
      {
        "title": "Bringing Comparative Cognition To Computers",
        "venue": "arXiv",
        "year": 2025,
        "url": "https://arxiv.org/abs/2503.02882"
      },
      {
        "title": "The Animal-AI Environment: A virtual laboratory for comparative cognition and artificial intelligence research",
        "venue": "Behavior Research Methods",
        "year": 2025,
        "url": "https://link.springer.com/article/10.3758/s13428-025-02616-3"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 817,
      "y": 297,
      "scale": 0.95
    }
  },
  {
    "id": 91,
    "atlasN": 213,
    "slug": "solar-radiation-management-modeling-governance",
    "title": {
      "zh": "太阳辐射管理的建模与治理",
      "en": "Solar Radiation Management Modeling & Governance"
    },
    "qfocus": {
      "zh": "太阳辐射管理一旦启动就可能无法安全停止（「终止冲击」），我们能否在无法做全球实验的前提下，可靠地为这把「地球温控旋钮」的副作用建模，并设计出与其风险相称的治理机制？",
      "en": "If solar radiation management cannot be safely stopped once started (termination shock), can we reliably model the side effects of this 'planetary thermostat' without a global experiment, and design governance commensurate with its risk?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C13",
      "zh": "气候·地球生物工程",
      "en": "Climate · planetary bioengineering"
    },
    "scores": [
      4,
      4,
      3,
      4,
      4,
      2,
      2,
      3,
      3
    ],
    "citation": {
      "url": "https://www.annualreviews.org/content/journals/10.1146/annurev-environ-112321-081911",
      "title": "Solar Geoengineering: History, Methods, Governance, Prospects",
      "venue": "Annual Review of Environment and Resources",
      "year": 2024
    },
    "brief": {
      "zh": "通过平流层气溶胶或增亮云层反射阳光来快速降温；本方向不做部署，只做严格的气候建模、风险评估与全球治理设计，核心是它一旦启动就可能不能停——终止冲击会让被压抑的升温报复性反弹，而最大风险其实是治理而非技术。",
      "en": "Cools the planet quickly by reflecting sunlight via stratospheric aerosols or cloud brightening; this direction does not deploy but focuses on rigorous climate modeling, risk assessment, and global governance design. Its core issue: once started it may not be able to stop — termination shock would let suppressed warming rebound violently — and the biggest risk is actually governance, not technology."
    },
    "depth": {
      "overview": {
        "zh": "太阳辐射管理（SRM）通过向平流层注入气溶胶或增亮云层来反射阳光、快速降温。本方向不做部署，而专注严格的气候建模、风险评估与全球治理机制设计，横跨气候物理、统计与伦理治理，核心是在无法做全球实验的情况下，尽量摸清这把「地球温控旋钮」的副作用。",
        "en": "Solar radiation management (SRM) rapidly cools the planet by injecting aerosols into the stratosphere or brightening clouds to reflect sunlight. This direction does not deploy but focuses on rigorous climate modeling, risk assessment, and global governance design, spanning climate physics, statistics, and ethical governance — probing the side effects of this 'planetary thermostat knob' as far as possible without being able to run a global experiment."
      },
      "whyMatters": {
        "zh": "SRM的致命特征是「终止冲击」——一旦开始就不能停，否则被压抑的升温会报复性反弹。最大风险其实是治理而非技术：它便宜到一个国家甚至富豪就能单干，而后果是全人类共担。",
        "en": "SRM's fatal feature is 'termination shock' — once started it cannot stop, or the suppressed warming will rebound with a vengeance. The biggest risk is actually governance rather than technology: it is cheap enough for a single nation or even a wealthy individual to go it alone, while the consequences are borne by all of humanity."
      },
      "ifAnswered": {
        "zh": "若能建立严格可信的建模与治理框架，SRM将从「全球治理的高风险议题」变成一项有据可依、责任明确的应急工具，而不是任由单边行动者把全人类拖入不可逆的赌局。",
        "en": "A rigorous, credible modeling and governance framework would turn SRM from a high-risk global-governance issue into a well-grounded, accountable emergency tool, rather than leaving a unilateral actor to drag all of humanity into an irreversible gamble."
      },
      "approaches": [
        {
          "zh": "严格气候建模：用地球系统模型模拟平流层气溶胶注入或云层增亮对区域降水、季风、生态系统的连锁影响，识别建模本身的不确定性边界。",
          "en": "Rigorous climate modeling: use Earth-system models to simulate the cascading effects of stratospheric aerosol injection or cloud brightening on regional precipitation, monsoons, and ecosystems, identifying the uncertainty bounds of the models themselves."
        },
        {
          "zh": "终止冲击的风险量化：专门建模「突然中止SRM」情形下升温反弹的速度与幅度，为治理设计设定明确的风险红线。",
          "en": "Quantify termination-shock risk: specifically model the speed and magnitude of warming rebound under a sudden SRM halt, setting clear risk red lines for governance design."
        },
        {
          "zh": "全球治理机制设计：研究能约束单边行动者（国家或个人）的国际协议、监测与问责框架，防止「谁先做谁定」的既成事实局面。",
          "en": "Global governance design: study international agreements, monitoring, and accountability frameworks capable of constraining unilateral actors (states or individuals), preventing a 'whoever acts first decides' fait accompli."
        }
      ],
      "barrier": {
        "zh": "SRM的终止冲击意味着一旦开始就难以安全停止，被压抑的升温会报复性反弹；而这项技术足够廉价，使单边行动的门槛远低于其全球性后果所要求的治理成熟度。",
        "en": "SRM's termination shock means that once started it is hard to stop safely, and suppressed warming rebounds with a vengeance; the technology is cheap enough that the threshold for unilateral action falls far below the governance maturity its global consequences demand."
      },
      "subQuestions": [
        {
          "zh": "地球气候系统是否存在一些一旦越过就不可逆的「临界点」（如冰盖崩塌、亚马逊枯萎、环流停摆），它们的触发阈值精确落在哪里，又是否会相互级联引发多米诺式失稳？我们能否在跨越之前就可靠地预测这些临界点，还是它们在原理上不可预报？",
          "en": "Does the Earth's climate system contain tipping points — ice-sheet collapse, Amazon dieback, circulation shutdown — that once crossed are irreversible, where exactly do their thresholds lie, and can they cascade into one another in a domino-like destabilization; can we reliably predict these tipping points before crossing them, or are they in principle unforecastable?"
        },
        {
          "zh": "如果人类蓄意地、大规模地改造地球系统来抵消变暖（如平流层气溶胶、海洋施肥、生物圈工程），我们能否在事前就可靠地预测整个耦合的地球-生物-社会系统的响应，还是这类干预本质上不可控、不可逆、且无法在唯一的真实地球上做对照实验？",
          "en": "If humanity deliberately and at planetary scale re-engineers the Earth system to offset warming — stratospheric aerosols, ocean fertilization, biosphere engineering — can we reliably predict the response of the entire coupled Earth-biosphere-society system in advance, or is such intervention inherently uncontrollable, irreversible, and impossible to test against a control on our one real Earth?"
        },
        {
          "zh": "我们能否反过来设计行星尺度的生物圈——刻意编排微生物、植物与生态网络，使地球（或其他行星）的碳、氮、气候循环朝可持续方向自我调节？「为整颗行星做生物工程」究竟是可被原理性设计的，还是生态系统的复杂性使任何有意的全局调控注定失控？",
          "en": "Can we instead design a planetary-scale biosphere — deliberately orchestrating microbes, plants, and ecological networks so that a planet's carbon, nitrogen, and climate cycles self-regulate toward sustainability — and is bioengineering an entire planet something that can be designed from principles, or does ecological complexity doom any intentional global control to spin out of control?"
        }
      ]
    },
    "literature": [
      {
        "title": "Solar Geoengineering: History, Methods, Governance, Prospects",
        "venue": "Annual Review of Environment and Resources",
        "year": 2024,
        "url": "https://www.annualreviews.org/content/journals/10.1146/annurev-environ-112321-081911"
      },
      {
        "title": "The potential environmental and climate impacts of stratospheric aerosol injection: a review",
        "venue": "Environmental Science: Atmospheres",
        "year": 2024,
        "url": "https://pubs.rsc.org/en/content/articlelanding/2024/ea/d3ea00134b"
      },
      {
        "title": "The Risk of Termination Shock From Solar Geoengineering",
        "venue": "Earth's Future",
        "year": 2018,
        "url": "https://agupubs.onlinelibrary.wiley.com/doi/10.1002/2017EF000735"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 740,
      "y": 517,
      "scale": 0.83
    }
  },
  {
    "id": 92,
    "atlasN": 209,
    "slug": "gene-drive-modeling-ethics",
    "title": {
      "zh": "基因驱动的建模与伦理",
      "en": "Gene-Drive Modeling & Ethics"
    },
    "qfocus": {
      "zh": "基因驱动能让特定基因以远超50%的比例扩散并可能永久改变整个野生种群，我们能否在释放前就可靠地为其扩散范围、抗性演化与可逆性建模，从而不让技术走在治理前面？",
      "en": "Gene drives can spread a chosen gene at far above 50% and potentially permanently alter an entire wild population — can we reliably model spread range, resistance evolution, and reversibility before release, so the technology does not outrun governance?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C13",
      "zh": "气候·地球生物工程",
      "en": "Climate · planetary bioengineering"
    },
    "scores": [
      4,
      3,
      3,
      2,
      4,
      3,
      3,
      3,
      3
    ],
    "citation": {
      "url": "https://www.nature.com/articles/nbt.4245",
      "title": "A CRISPR–Cas9 gene drive targeting doublesex causes complete population suppression in caged Anopheles gambiae mosquitoes",
      "venue": "Nature Biotechnology",
      "year": 2018
    },
    "brief": {
      "zh": "用CRISPR等技术让特定基因以远超50%的「超孟德尔」比例传给后代，可在野外种群中快速扩散，用于压制传疟蚊虫或清除入侵物种；本方向聚焦种群动力学建模与伦理治理而非急于释放，核心是它一旦成功就无法撤回——演化没有Ctrl+Z。",
      "en": "Uses tools like CRISPR to pass a chosen gene to offspring at a 'super-Mendelian' rate well above 50%, letting it spread rapidly through wild populations to suppress malaria-carrying mosquitoes or clear invasive species; this direction focuses on population-dynamics modeling and ethical governance rather than rushing to release, because once it succeeds it cannot be recalled — evolution has no Ctrl+Z."
    },
    "depth": {
      "overview": {
        "zh": "基因驱动让特定基因以超孟德尔比例传播，远超50%遗传给后代，可用于压制疟蚊、入侵物种等。本方向聚焦其种群动力学建模与伦理治理，研究释放后的扩散范围、抗性演化和可逆性，横跨遗传学、生态学与伦理/治理。",
        "en": "Gene drives spread a specific gene at super-Mendelian rates — far above the 50% normally inherited by offspring — and can be used to suppress malaria mosquitoes, invasive species, and more. This direction focuses on population-dynamics modeling and ethical governance, studying post-release spread range, resistance evolution, and reversibility, spanning genetics, ecology, and ethics/governance."
      },
      "whyMatters": {
        "zh": "它是少数「一次释放即可能改变整个物种」的技术，跨国扩散使任何单边决策都成全球问题。最不显然的风险不是技术失败，而是它成功后无法撤回——演化没有Ctrl+Z。",
        "en": "It is one of the few technologies where 'a single release could alter an entire species', and cross-border spread turns any unilateral decision into a global issue. The least obvious risk is not technical failure but that, once successful, it cannot be recalled — evolution has no Ctrl+Z."
      },
      "ifAnswered": {
        "zh": "若能建立可靠的建模与治理框架，基因驱动将能在严格治理下小范围试点，把一项威力与不可控性并存的技术，转变为可被问责、可被撤回设计约束的公共卫生与生态工具。",
        "en": "A reliable modeling and governance framework would let gene drives be piloted at small scale under strict governance — turning a technology where power and uncontrollability coexist into an accountable public-health and ecological tool constrained by reversible design."
      },
      "approaches": [
        {
          "zh": "种群动力学建模：模拟基因驱动在野外种群中的扩散速度、范围与代际衰减，量化跨境扩散的现实概率。",
          "en": "Population-dynamics modeling: simulate the spread speed, range, and generational decay of a gene drive in wild populations, quantifying the realistic probability of cross-border spread."
        },
        {
          "zh": "抗性演化追踪：研究目标种群对驱动基因产生抗性突变的速率与机制，评估驱动效果随时间的衰减风险。",
          "en": "Resistance-evolution tracking: study the rate and mechanism by which the target population develops resistance mutations against the drive gene, assessing the risk of the drive's effect decaying over time."
        },
        {
          "zh": "可逆/自限设计验证：评估菊花链（daisy-chain）等低切割率、自限性设计能否在保留压制效果的同时提供真正的可撤回性。",
          "en": "Verify reversible/self-limiting designs: assess whether low-cutting-rate, self-limiting designs like daisy-chains can retain suppression effectiveness while providing genuine recallability."
        }
      ],
      "barrier": {
        "zh": "它最不显然的风险不是技术失败，而是成功后无法撤回——演化没有Ctrl+Z，一旦基因驱动在野外扩散开，几乎不存在真正意义上的「撤销」。",
        "en": "Its least obvious risk is not technical failure but the inability to recall it after success — evolution has no Ctrl+Z, and once a gene drive has spread in the wild there is almost no true 'undo'."
      },
      "subQuestions": [
        {
          "zh": "地球气候系统是否存在一些一旦越过就不可逆的「临界点」（如冰盖崩塌、亚马逊枯萎、环流停摆），它们的触发阈值精确落在哪里，又是否会相互级联引发多米诺式失稳？我们能否在跨越之前就可靠地预测这些临界点，还是它们在原理上不可预报？",
          "en": "Does the Earth's climate system contain tipping points — ice-sheet collapse, Amazon dieback, circulation shutdown — that once crossed are irreversible, where exactly do their thresholds lie, and can they cascade into one another in a domino-like destabilization; can we reliably predict these tipping points before crossing them, or are they in principle unforecastable?"
        },
        {
          "zh": "如果人类蓄意地、大规模地改造地球系统来抵消变暖（如平流层气溶胶、海洋施肥、生物圈工程），我们能否在事前就可靠地预测整个耦合的地球-生物-社会系统的响应，还是这类干预本质上不可控、不可逆、且无法在唯一的真实地球上做对照实验？",
          "en": "If humanity deliberately and at planetary scale re-engineers the Earth system to offset warming — stratospheric aerosols, ocean fertilization, biosphere engineering — can we reliably predict the response of the entire coupled Earth-biosphere-society system in advance, or is such intervention inherently uncontrollable, irreversible, and impossible to test against a control on our one real Earth?"
        },
        {
          "zh": "我们能否反过来设计行星尺度的生物圈——刻意编排微生物、植物与生态网络，使地球（或其他行星）的碳、氮、气候循环朝可持续方向自我调节？「为整颗行星做生物工程」究竟是可被原理性设计的，还是生态系统的复杂性使任何有意的全局调控注定失控？",
          "en": "Can we instead design a planetary-scale biosphere — deliberately orchestrating microbes, plants, and ecological networks so that a planet's carbon, nitrogen, and climate cycles self-regulate toward sustainability — and is bioengineering an entire planet something that can be designed from principles, or does ecological complexity doom any intentional global control to spin out of control?"
        }
      ]
    },
    "literature": [
      {
        "title": "A CRISPR–Cas9 gene drive targeting doublesex causes complete population suppression in caged Anopheles gambiae mosquitoes",
        "venue": "Nature Biotechnology",
        "year": 2018,
        "url": "https://www.nature.com/articles/nbt.4245"
      },
      {
        "title": "An Ethical Overview of the CRISPR-Based Elimination of Anopheles gambiae to Combat Malaria",
        "venue": "AJOB Neuroscience / Yale Journal of Biology and Medicine",
        "year": 2022,
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9463432/"
      },
      {
        "title": "Daisy-chain gene drives: The role of low cut-rate, resistance mutations, and maternal deposition",
        "venue": "PLOS Genetics",
        "year": 2022,
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9521892/"
      },
      {
        "title": "Gene drive-based population suppression in the malaria vector Anopheles stephensi",
        "venue": "Nature Communications",
        "year": 2025,
        "url": "https://www.nature.com/articles/s41467-025-56290-2"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 1015,
      "y": 744,
      "scale": 0.84
    }
  },
  {
    "id": 93,
    "atlasN": 273,
    "slug": "engineering-pathways-to-fusion-energy",
    "title": {
      "zh": "聚变能的工程化路径",
      "en": "Engineering Pathways to Fusion Energy"
    },
    "qfocus": {
      "zh": "科学上的净能量增益（Q>1）已被证明可行，但从「一次点火」到「持续、经济、可并网发电」之间的工程鸿沟——中子辐照材料、氚自持、等离子体长期稳态——究竟能否被跨越？",
      "en": "Net energy gain (Q>1) has been shown physically possible, but can the engineering chasm from a single ignition shot to sustained, economic, grid-ready generation — neutron-irradiated materials, tritium self-sufficiency, long-term steady-state plasma — actually be crossed?"
    },
    "domain": "物质",
    "cluster": {
      "code": "C17",
      "zh": "新能源范式",
      "en": "New energy paradigms"
    },
    "scores": [
      5,
      4,
      4,
      1,
      3,
      1,
      4,
      3,
      1
    ],
    "citation": {
      "url": "https://www.nationalacademies.org/news/fusion-energy-seizing-our-opportunity-for-a-clean-energy-future",
      "title": "Fusion Energy: Seizing Our Opportunity for a Clean Energy Future",
      "venue": "National Academies of Sciences, Engineering, and Medicine",
      "year": 2023
    },
    "brief": {
      "zh": "把可控核聚变从物理验证推向可并网发电的装置，涵盖托卡马克、仿星器及私营公司的高温超导磁体、磁惯性、激光惯性约束等路线；高温超导磁体与私营资本让「永远50年」的玩笑首次出现裂缝，但科学增益远不等于工程与商业可行。",
      "en": "Pushes controlled nuclear fusion from physics validation toward grid-connectable power plants, covering tokamaks, stellarators, and private companies' high-temperature superconducting magnets, magneto-inertial, and laser inertial confinement routes; HTS magnets and private capital have put the first crack in the 'always 50 years away' joke, but scientific gain is far from engineering or commercial viability."
    },
    "depth": {
      "overview": {
        "zh": "聚变能工程化指把可控核聚变从物理验证推向可并网发电的装置，涵盖托卡马克、仿星器及私营公司的高温超导磁体、磁惯性、激光惯性约束等多条路线。它交叉等离子体物理、能源与极限工程，核心挑战是同时实现净能量增益、稳态运行与材料耐受。",
        "en": "Fusion-energy engineering means pushing controlled nuclear fusion from physics validation toward grid-connectable power plants, covering tokamaks, stellarators and private companies' high-temperature superconducting magnets, magneto-inertial and laser inertial confinement routes. Crossing plasma physics, energy and extreme engineering, its core challenge is achieving net energy gain, steady-state operation and material endurance all at once."
      },
      "whyMatters": {
        "zh": "高温超导磁体和私营资本确实让「永远50年」的玩笑首次出现裂缝。但科学增益（Q>1）远不等于工程与商业可行：中子辐照下的第一壁材料、氚自持、等离子体长期稳态控制，每一项都可能成为压垮时间表的隐藏成本。",
        "en": "High-temperature superconducting magnets and private capital have indeed put the first crack in the 'always 50 years away' joke. But scientific gain (Q>1) is far from engineering and commercial viability: first-wall materials under neutron irradiation, tritium self-sufficiency and long-term steady-state plasma control—each could become a hidden cost that crushes the timeline."
      },
      "ifAnswered": {
        "zh": "若这些工程瓶颈被逐一攻克，聚变发电将从实验室点火走向真实并网示范，人类首次拥有近乎无限、低碳、燃料分布均匀的基荷能源。",
        "en": "If these engineering bottlenecks are cracked one by one, fusion power would move from lab ignition to real grid-connected demonstration, giving humanity a nearly limitless, low-carbon, geographically even baseload energy source for the first time."
      },
      "approaches": [
        {
          "zh": "高温超导磁体路线：用更强磁场把装置小型化、缩短建造周期，验证私营公司（如Commonwealth Fusion Systems）的紧凑型托卡马克能否复现并超越点火增益。",
          "en": "High-temperature superconducting magnet route: use stronger magnetic fields to shrink devices and shorten build cycles, testing whether private compact tokamaks (e.g. Commonwealth Fusion Systems) can reproduce and surpass ignition-level gain."
        },
        {
          "zh": "第一壁材料与氚自持研究：在中子辐照环境下测试候选材料的寿命与氚增殖包层设计，解决持续运行而非单次点火的核心瓶颈。",
          "en": "First-wall material and tritium self-sufficiency research: test candidate material lifetimes under neutron irradiation and tritium-breeding blanket designs, tackling the core bottleneck of sustained operation rather than a single ignition shot."
        },
        {
          "zh": "多路线并行验证：托卡马克、仿星器与激光惯性约束（如NIF）各自独立推进稳态控制与能量增益，为工程可行性提供交叉验证的证据基础。",
          "en": "Parallel validation across routes: tokamaks, stellarators and laser inertial confinement (e.g. NIF) each independently advance steady-state control and energy gain, providing cross-validated evidence for engineering feasibility."
        }
      ],
      "barrier": {
        "zh": "科学增益（Q>1）远不等于工程与商业可行：中子辐照下的第一壁材料寿命、氚自持循环、等离子体长期稳态控制，每一项都可能成为压垮时间表的隐藏成本。",
        "en": "Scientific gain (Q>1) is far from engineering and commercial viability: first-wall material lifetime under neutron irradiation, the tritium self-sufficiency cycle, and long-term steady-state plasma control could each become a hidden cost that crushes the timeline."
      },
      "subQuestions": [
        {
          "zh": "受控核聚变能否真正成为可规模化、可持续净产能的电力来源——还是说等离子体湍流、材料耐受与能量增益（Q值）之间存在某种至今未被识破的根本性权衡，使「聚变发电」永远停在「再过三十年」？",
          "en": "Can controlled nuclear fusion truly become a scalable, sustainable source of net energy — or is there an as-yet-unrecognized fundamental trade-off among plasma turbulence, material endurance, and energy gain (Q) that keeps fusion power perpetually 'thirty years away'?"
        },
        {
          "zh": "高效储能的终极物理极限在哪里——是否存在某种我们尚未发现的电荷/离子存储机制，能在安全、成本、寿命与能量密度上同时突破当前锂离子电池所卡住的多目标权衡？",
          "en": "Where is the ultimate physical limit of high-efficiency energy storage — does an undiscovered charge/ion-storage mechanism exist that can simultaneously break the multi-objective trade-off of safety, cost, lifetime, and energy density that currently pins lithium-ion batteries?"
        },
        {
          "zh": "把阳光或电直接、廉价、规模化地变成可储存的化学燃料（「人工光合作用」），其效率与成本的根本极限是什么？我们究竟是缺一种催化剂，还是缺一整套对自然光合作用的全新理解？",
          "en": "What are the fundamental efficiency and cost limits of turning sunlight or electricity directly, cheaply, and at scale into storable chemical fuel ('artificial photosynthesis') — are we missing one catalyst, or an entire new understanding of natural photosynthesis itself?"
        }
      ]
    },
    "literature": [
      {
        "title": "Commonwealth Fusion Systems HTS magnets technology",
        "venue": "Commonwealth Fusion Systems (institutional)",
        "year": 2024,
        "url": "https://cfs.energy/technology/hts-magnets/"
      },
      {
        "title": "Bringing Fusion Energy to the Grid: Challenges and Pathways",
        "venue": "Kleinman Energy Center, University of Pennsylvania",
        "year": 2023,
        "url": "https://kleinmanenergy.upenn.edu/research/publications/bringing-fusion-energy-to-the-grid-challenges-and-pathways/"
      },
      {
        "title": "Fusion Energy: Seizing Our Opportunity for a Clean Energy Future",
        "venue": "National Academies of Sciences, Engineering, and Medicine",
        "year": 2023,
        "url": "https://www.nationalacademies.org/news/fusion-energy-seizing-our-opportunity-for-a-clean-energy-future"
      },
      {
        "title": "Commonwealth Fusion Systems fusion engineering progress",
        "venue": "Engineering",
        "year": 2024,
        "url": "https://www.engineering.org.cn/engi/EN/PDF/10.1016/j.eng.2024.12.002"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 1128,
      "y": 377,
      "scale": 0.72
    }
  },
  {
    "id": 94,
    "atlasN": 300,
    "slug": "astrobiology-and-the-origin-of",
    "title": {
      "zh": "天体生物学与生命起源",
      "en": "Astrobiology and the Origin of Life"
    },
    "qfocus": {
      "zh": "生命如何从非生命化学体系中涌现，这一过程在宇宙中是否普遍？",
      "en": "How does life emerge from non-living chemistry, and is this process common throughout the universe?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C18",
      "zh": "大众空间科学",
      "en": "Citizen space science"
    },
    "scores": [
      5,
      5,
      2,
      3,
      4,
      2,
      2,
      2,
      4
    ],
    "citation": {
      "url": "https://www.nationalacademies.org/read/26522/chapter/16",
      "title": "Origins, Worlds, and Life: A Decadal Strategy for Planetary Science and Astrobiology 2023-2032",
      "venue": "National Academies Press",
      "year": 2022
    },
    "brief": {
      "zh": "天体生物学研究生命如何从非生命化学体系中涌现、这一过程在宇宙中是否普遍，涵盖前生命化学、RNA世界假说与极端环境生命，并指向欧罗巴/恩克拉多斯羽流、火星样本返回等可检验的地外生物标志物。真正的困难是「只有一个样本」——我们仅知地球生命，缺乏判断哪些特征必然、哪些偶然的参照系。",
      "en": "Astrobiology studies how life emerges from non-living chemistry and whether this is common across the universe, spanning prebiotic chemistry, the RNA-world hypothesis, and extremophiles, and pointing toward testable biosignatures at the Europa/Enceladus plumes and in Mars sample return. The real difficulty is the 'sample of one' — we know only Earth life, leaving no baseline for judging which features are necessary versus contingent."
    },
    "depth": {
      "overview": {
        "zh": "天体生物学与生命起源研究生命如何从非生命的化学体系中涌现，以及这一过程在宇宙中是否普遍，涵盖前生命化学、RNA世界假说和极端环境生命。它交叉生物学、化学与天文学，核心是把「生命的定义与起源」作为可实验、可在地外检验的科学问题。",
        "en": "Astrobiology and the origin of life study how life emerges from non-living chemical systems and whether this process is common across the universe, covering prebiotic chemistry, the RNA-world hypothesis, and life in extreme environments. Spanning biology, chemistry, and astronomy, its core is treating 'the definition and origin of life' as a scientific question that can be tested experimentally and beyond Earth."
      },
      "whyMatters": {
        "zh": "它把「我们从何而来、是否孤独」这类哲学级大问题拉进实验室，连接合成生物学与深空探测——让原本思辨性的终极问题第一次具备可实验、可检验的路径。",
        "en": "It pulls philosophical-scale questions like 'where do we come from, are we alone' into the lab, connecting synthetic biology with deep-space exploration — giving these once purely speculative ultimate questions an experimentally testable path for the first time."
      },
      "ifAnswered": {
        "zh": "若能取得进展，天体生物学将真正把实验室化学与深空探测连成一体——地外生物标志物的判读将从假设性推测变为有可靠参照系支撑的检验。",
        "en": "If progress is made, astrobiology would genuinely connect laboratory chemistry with deep-space exploration — turning the reading of extraterrestrial biosignatures from speculative guesswork into tests grounded in a reliable reference frame."
      },
      "approaches": [
        {
          "zh": "前生命化学实验路径（模拟米勒-尤里式合成、热泉假说）在实验室重建生命起源的化学步骤。",
          "en": "Prebiotic-chemistry experimental paths (Miller-Urey-style synthesis, hydrothermal-vent hypotheses) reconstructing the chemical steps of life's origin in the lab."
        },
        {
          "zh": "地外生物标志物探测（欧罗巴/恩克拉多斯羽流采样、火星样本返回）把假说搬到太阳系尺度直接检验。",
          "en": "Extraterrestrial biosignature detection (Europa/Enceladus plume sampling, Mars sample return) taking the hypotheses to Solar-System scale for direct testing."
        },
        {
          "zh": "借助分布式、大众参与的观测网络扩大对瞬变现象与候选信号的覆盖，弥补专业设备在覆盖、节奏与视角上的结构性盲区。",
          "en": "Leveraging distributed, publicly-engaged observing networks to broaden coverage of transients and candidate signals, filling the structural coverage, cadence, and viewing-angle gaps of professional instruments."
        }
      ],
      "barrier": {
        "zh": "根本困难在于「只有一个样本」：我们仅知地球生命，既难判断哪些特征是生命的必然、哪些是偶然，也缺乏对「非地球式生命」的想象框架，这使任何地外生命的判定都缺乏可靠的对照基准。",
        "en": "The fundamental difficulty is the 'sample of one': we know only Earth life, making it hard to judge which features are necessary versus contingent, and we lack any imaginative framework for genuinely non-Earth-like life — leaving any verdict on extraterrestrial life without a reliable control baseline."
      },
      "subQuestions": [
        {
          "zh": "分布式的业余天文/航天观测者网络，能否系统性地探测到专业巡天因覆盖、节奏或视角受限而结构性遗漏的瞬变与近地天体——也就是说，「人多眼杂」是否能在科学发现上做到专业设备做不到的事？",
          "en": "Can distributed networks of amateur astronomy/spaceflight observers systematically detect transients and near-Earth objects that professional surveys structurally miss due to coverage, cadence, or viewing-angle limits — that is, can 'many eyes' achieve discoveries professional instruments cannot?"
        },
        {
          "zh": "当数据规模超出任何专业团队的处理能力，而 AI 又会系统性遗漏「未被预期的异常」时，人类志愿者的认知到底提供了什么机器无法替代的东西？大众科学的真正价值，是劳动力、是多样视角，还是「发现未知未知」的能力？",
          "en": "When data volume exceeds any professional team's capacity and AI systematically misses 'unexpected anomalies', what exactly does human volunteer cognition provide that machines cannot replace — is citizen science's real value labor, diverse perspective, or the capacity to discover unknown unknowns?"
        },
        {
          "zh": "随着发射成本骤降、小卫星与开源地面站普及，太空探测是否能从国家与巨头垄断，转为真正由大众分布式拥有与运营的基础设施？「人人可及的太空」是工程必然，还是被轨道、频谱与法律结构性锁死的幻象？",
          "en": "As launch costs plummet and small satellites and open-source ground stations proliferate, can space exploration shift from state and corporate monopoly to genuinely distributed, publicly owned-and-operated infrastructure — is 'space for everyone' an engineering inevitability or an illusion structurally locked out by orbits, spectrum, and law?"
        }
      ]
    },
    "literature": [
      {
        "title": "The origin of life as a planetary phenomenon",
        "venue": "Science Advances",
        "year": 2020,
        "url": "https://www.science.org/doi/10.1126/sciadv.aax3419"
      },
      {
        "title": "Origins, Worlds, and Life: A Decadal Strategy for Planetary Science and Astrobiology 2023-2032",
        "venue": "National Academies Press",
        "year": 2022,
        "url": "https://www.nationalacademies.org/read/26522/chapter/16"
      },
      {
        "title": "A Review on Hypothesized Metabolic Pathways on Europa and Enceladus: Space-Flight Detection Considerations",
        "venue": "Life",
        "year": 2023,
        "url": "https://www.mdpi.com/2075-1729/13/8/1726"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 980,
      "y": 461,
      "scale": 0.81
    }
  },
  {
    "id": 95,
    "atlasN": 513,
    "slug": "subsurface-oceans-of-icy-moons",
    "title": {
      "zh": "冰卫星地下海洋与地外宜居",
      "en": "Subsurface Oceans of Icy Moons and Extraterrestrial Habitability"
    },
    "qfocus": {
      "zh": "木卫二、土卫二冰壳下的海洋，是否具备液态水、能量与化学梯度支撑生命存在？",
      "en": "Do the oceans beneath the ice shells of Europa and Enceladus have the liquid water, energy, and chemical disequilibrium needed to support life?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C18",
      "zh": "大众空间科学",
      "en": "Citizen space science"
    },
    "scores": [
      5,
      4,
      3,
      3,
      2,
      1,
      3,
      3,
      4
    ],
    "citation": {
      "url": "https://www.nature.com/articles/s41586-023-05987-9",
      "title": "Detection of phosphates originating from Enceladus's ocean",
      "venue": "Nature",
      "year": 2023
    },
    "brief": {
      "zh": "研究木卫二、土卫二等冰封天体的冰壳之下是否存在液态咸水海洋，及其热源（潮汐加热、热液喷口）、化学梯度与潜在宜居性——土卫二南极羽流已直接采到含盐与有机物样本。相比火星表面，冰下海洋因兼具液态水、能量与化学不平衡而更可能孕育生命，但探测窗口被欧罗巴快船、JUICE等任务的多年飞掠周期锁死，穿透数千米厚冰壳直接取样仍遥不可及。",
      "en": "Studies whether liquid salty oceans exist beneath the ice shells of Europa and Enceladus, along with their heat sources (tidal heating, hydrothermal vents), chemical gradients and habitability — the plume at Enceladus's south pole has already yielded direct samples containing salts and organics. Subsurface oceans are more likely to harbor life than the Martian surface since they combine liquid water, energy and chemical disequilibrium, but the observation window is locked to the multi-year flyby cycles of missions like Europa Clipper and JUICE, and drilling through a kilometers-thick ice shell to sample directly remains out of engineering reach."
    },
    "depth": {
      "overview": {
        "zh": "冰卫星地下海洋研究木卫二、土卫二等冰封天体的冰壳之下是否存在液态咸水海洋，以及其热源、化学梯度与潜在宜居性。它结合天体生物学、海洋学与行星科学，是太阳系内寻找地外生命最现实的方向之一。",
        "en": "Subsurface-ocean research on icy moons studies whether liquid salty oceans exist beneath the ice shells of frozen bodies such as Europa and Enceladus, along with their heat sources, chemical gradients, and potential habitability. Combining astrobiology, oceanography, and planetary science, it is one of the most realistic directions for finding extraterrestrial life within the Solar System."
      },
      "whyMatters": {
        "zh": "相比火星表面，冰下海洋因兼具液态水、能量与化学不平衡而更可能孕育生命，是公众想象力的引爆点——它把「太阳系内是否存在第二个生命摇篮」变成一个有具体探测目标的问题。",
        "en": "Compared with the Martian surface, subsurface oceans are more likely to harbor life because they combine liquid water, energy, and chemical disequilibrium — an ignition point for public imagination that turns 'is there a second cradle of life in the Solar System' into a question with concrete exploration targets."
      },
      "ifAnswered": {
        "zh": "若能确认冰下海洋的宜居性，这一问题将随欧罗巴快船、JUICE等任务陆续抵达而成为科学界与公众关注的焦点，把地外生命探测从假说推进到可用实测数据检验的阶段。",
        "en": "If the habitability of these subsurface oceans can be confirmed, this question will become a focal point as missions like Europa Clipper and JUICE arrive, advancing the search for extraterrestrial life from hypothesis to a stage testable with real observational data."
      },
      "approaches": [
        {
          "zh": "通过潮汐加热与热液喷口的物理建模，推断冰壳下海洋的能量供给是否足以支撑代谢化学。",
          "en": "Physical modeling of tidal heating and hydrothermal vents to infer whether the sub-ice ocean's energy supply can sustain metabolic chemistry."
        },
        {
          "zh": "利用羽流采样（如土卫二南极喷发物）直接分析盐分与有机物成分，把间接光谱推断换成实测证据。",
          "en": "Direct plume sampling (e.g., Enceladus's south-polar eruptions) to analyze salt and organic composition, replacing indirect spectral inference with measured evidence."
        },
        {
          "zh": "借助小卫星、开源地面站等日益普及的分布式太空基础设施，扩大对候选羽流事件与轨道任务数据的公众可及性与交叉验证。",
          "en": "Leveraging increasingly accessible distributed space infrastructure — small satellites, open-source ground stations — to broaden public access to and cross-verification of candidate plume events and mission data."
        }
      ],
      "barrier": {
        "zh": "探测窗口被任务周期锁死——欧罗巴快船等任务一次飞掠数年才有数据，且穿透厚冰壳直接取样在工程上仍遥不可及，这使得对海洋宜居性的判断长期只能依赖间接、稀疏的观测证据。",
        "en": "The observation window is locked to mission timelines — missions such as Europa Clipper take years per flyby to return data, and directly sampling through the thick ice shell remains engineering-wise out of reach, so judgments about ocean habitability must long rely on indirect, sparse observational evidence."
      },
      "subQuestions": [
        {
          "zh": "分布式的业余天文/航天观测者网络，能否系统性地探测到专业巡天因覆盖、节奏或视角受限而结构性遗漏的瞬变与近地天体——也就是说，「人多眼杂」是否能在科学发现上做到专业设备做不到的事？",
          "en": "Can distributed networks of amateur astronomy/spaceflight observers systematically detect transients and near-Earth objects that professional surveys structurally miss due to coverage, cadence, or viewing-angle limits — that is, can 'many eyes' achieve discoveries professional instruments cannot?"
        },
        {
          "zh": "当数据规模超出任何专业团队的处理能力，而 AI 又会系统性遗漏「未被预期的异常」时，人类志愿者的认知到底提供了什么机器无法替代的东西？大众科学的真正价值，是劳动力、是多样视角，还是「发现未知未知」的能力？",
          "en": "When data volume exceeds any professional team's capacity and AI systematically misses 'unexpected anomalies', what exactly does human volunteer cognition provide that machines cannot replace — is citizen science's real value labor, diverse perspective, or the capacity to discover unknown unknowns?"
        },
        {
          "zh": "随着发射成本骤降、小卫星与开源地面站普及，太空探测是否能从国家与巨头垄断，转为真正由大众分布式拥有与运营的基础设施？「人人可及的太空」是工程必然，还是被轨道、频谱与法律结构性锁死的幻象？",
          "en": "As launch costs plummet and small satellites and open-source ground stations proliferate, can space exploration shift from state and corporate monopoly to genuinely distributed, publicly owned-and-operated infrastructure — is 'space for everyone' an engineering inevitability or an illusion structurally locked out by orbits, spectrum, and law?"
        }
      ]
    },
    "literature": [
      {
        "title": "Abundant phosphorus expected for possible life in Enceladus's ocean",
        "venue": "PNAS",
        "year": 2022,
        "url": "https://www.pnas.org/doi/10.1073/pnas.2201388119"
      },
      {
        "title": "Detection of phosphates originating from Enceladus's ocean",
        "venue": "Nature",
        "year": 2023,
        "url": "https://www.nature.com/articles/s41586-023-05987-9"
      },
      {
        "title": "A Review on Hypothesized Metabolic Pathways on Europa and Enceladus: Space-Flight Detection Considerations",
        "venue": "Astrobiology",
        "year": 2023,
        "url": "https://www.researchgate.net/publication/373088825_A_Review_on_Hypothesized_Metabolic_Pathways_on_Europa_and_Enceladus_Space-Flight_Detection_Considerations"
      },
      {
        "title": "Europa's ocean: potential for extraterrestrial chemoautotrophy",
        "venue": "Frontiers in Astronomy and Space Sciences",
        "year": 2025,
        "url": "https://www.frontiersin.org/journals/astronomy-and-space-sciences/articles/10.3389/fspas.2025.1694079/full"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 695,
      "y": 549,
      "scale": 0.92
    }
  },
  {
    "id": 96,
    "atlasN": 1431,
    "slug": "sociogenomics",
    "title": {
      "zh": "社会基因组学",
      "en": "Sociogenomics"
    },
    "qfocus": {
      "zh": "把 GWAS 多基因指数（PGI）引入教育、收入等社会分层研究后，同胞内设计能在多大程度上把真正的遗传因果从环境混杂中剥离出来？",
      "en": "Once polygenic indices (PGIs) from GWAS are brought into research on education and income stratification, how much can within-family designs truly strip genetic causation apart from environmental confounding?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C19",
      "zh": "计算社会科学·数字人文",
      "en": "Computational social science · digital humanities"
    },
    "scores": [
      5,
      5,
      4,
      2,
      3,
      2,
      4,
      2,
      4
    ],
    "citation": {
      "url": "https://doi.org/10.1038/s41588-022-01016-z",
      "title": "Polygenic prediction of educational attainment within and between families from genome-wide association analyses in 3 million individuals",
      "venue": "Nature Genetics",
      "year": 2022
    },
    "brief": {
      "zh": "社会基因组学用全基因组关联分析产出的多基因指数（PGI），把遗传信息接入教育、收入等社会分层研究，并用同胞内设计剥离环境混杂来检验「基因—社会地位」链条。它是解释力最强也最具争议的社会科学新工具之一——家庭内设计下预测力缩水、跨族群不可迁移，极易被误读为生物决定论。",
      "en": "Sociogenomics feeds genome-wide association study (GWAS) polygenic indices (PGIs) into research on social stratification, education and income, using within-family designs to strip out environmental confounding and test the gene–social-status chain. It is among the most explanatory yet most contested new tools in social science — its predictive power shrinks under within-family designs, fails to transfer across ancestries, and is easily misread as biological determinism."
    },
    "depth": {
      "overview": {
        "zh": "社会基因组学（又称 social-science genomics / genoeconomics）把全基因组关联分析（GWAS）产出的多基因指数（PGI）引入社会分层、教育、收入等研究，用同胞内（within-family）设计剥离环境混杂，检验「基因—社会地位」链条。它把过去只能靠双生子研究推断的遗传力，变成可在个体层面直接度量的分子变量——当社会学开始用一串基因组数字预测受教育年限时，「先天与后天」的老争论被重写成一个可测量、也高度危险的分子问题。",
        "en": "Sociogenomics (also called social-science genomics or genoeconomics) imports polygenic indices (PGIs) from genome-wide association studies (GWAS) into research on social stratification, education, and income, using within-family (sibling) designs to strip out environmental confounding and probe the gene–social-status chain. It turns heritability — once inferable only from twin studies — into a molecular variable measurable at the individual level. When sociology begins using a string of numbers derived from the genome to predict years of education, the old 'nature vs. nurture' debate is rewritten into a question that is measurable — and highly dangerous."
      },
      "whyMatters": {
        "zh": "它既可能揭示社会不平等背后真实的基因-环境交互机制，也可能被误读、滥用为生物决定论——这使「基因是否决定社会地位」从纯思辨问题变成了有巨大政策与伦理后果的实证问题。",
        "en": "It could either reveal the real gene–environment interaction mechanisms behind social inequality, or be misread and misused as biological determinism — turning 'does genetics determine social status' from a purely speculative question into an empirical one with major policy and ethical stakes."
      },
      "ifAnswered": {
        "zh": "若能把 PGI 从单纯的预测工具确立为可信的因果因子，并在跨祖先人群与家庭内设计中验证其可迁移性，社会基因组学将为教育与收入不平等提供一套可检验的因果解释框架，同时也将直接决定这类分子证据在政策场景中能被如何负责任地使用。",
        "en": "If PGIs can be established as credible causal factors rather than mere predictors, and their portability verified across ancestries and within-family designs, sociogenomics would offer a testable causal framework for education and income inequality — while also directly determining how responsibly such molecular evidence can be used in policy settings."
      },
      "approaches": [
        {
          "zh": "用同胞内（within-family）设计比较同一家庭中不同个体的 PGI 与结果，以剥离共享环境与人群分层带来的混杂。",
          "en": "Using within-family designs to compare PGIs and outcomes among siblings in the same family, stripping out confounding from shared environment and population stratification."
        },
        {
          "zh": "扩大 GWAS 样本量并跨祖先人群重复分析，检验 PGI 的预测力是否能跨群体迁移，而非局限于训练所用的单一人群。",
          "en": "Expanding GWAS sample sizes and replicating analyses across ancestries to test whether PGI predictive power transfers across populations rather than being confined to the training population."
        },
        {
          "zh": "把社会基因组学的方法论问题放回「量化能否捕捉社会意义」这一更大的计算社会科学/数字人文争议中审视，警惕把复杂的社会过程简化为单一分子指数。",
          "en": "Situating sociogenomics' methodological problems within the broader computational-social-science/digital-humanities debate over whether quantification can capture social meaning, guarding against reducing complex social processes to a single molecular index."
        }
      ],
      "barrier": {
        "zh": "最硬的张力在于：族群内 PGI 的预测力在家庭内设计下明显缩水，且几乎无法把真正的生物因果与「基因—环境」相关剥离干净，这使得任何「基因预测地位」的结论都难以排除环境混杂的替代解释。",
        "en": "The hardest tension is that a PGI's predictive power within an ancestry group shrinks markedly under within-family designs, and true biological causation can hardly be cleanly separated from gene–environment correlation — so any conclusion that 'genes predict status' struggles to rule out confounding environmental alternatives."
      },
      "subQuestions": [
        {
          "zh": "在被海量数字痕迹记录的人类社会中，集体行为是否存在类似物理定律那样可预测、可推广的规律？还是说社会系统的反身性（人会因预测而改变行为）从根本上排除了「社会物理学」的可能？",
          "en": "In a human society logged by massive digital traces, do regularities of collective behavior exist that are predictable and generalizable like physical laws — or does the reflexivity of social systems (people changing behavior because of predictions) fundamentally preclude any 'social physics'?"
        },
        {
          "zh": "当大语言模型能生成与人类无法区分的文本、并能模拟人类回答调查与实验时，社会科学赖以为基的「人类数据」是否正在被污染到不可信？我们还能否区分「真实人群的信号」与「模型反射回来的回声」？",
          "en": "When large language models generate text indistinguishable from humans and can simulate human responses to surveys and experiments, is the 'human data' that social science rests on being polluted past trust — can we still separate the signal of real populations from the echo of models reflecting us back?"
        },
        {
          "zh": "文化——意义、叙事、价值——能否被有意义地量化和建模，而不在量化过程中丢失其本质？数字人文把文本与艺术变成数据时，我们是在揭示文化的深层结构，还是在用度量遮蔽它？",
          "en": "Can culture — meaning, narrative, value — be meaningfully quantified and modeled without losing its essence in the act of quantification? When digital humanities turns texts and art into data, are we revealing culture's deep structure or obscuring it with metrics?"
        }
      ]
    },
    "literature": [
      {
        "title": "Polygenic Indices (a.k.a. Polygenic Scores) in Social Science: A Guide for Interpretation and Evaluation",
        "venue": "Sociological Methodology",
        "year": 2024,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11293310/"
      },
      {
        "title": "Social and Behavioral Genomics: On the Ethics of the Research and Its Downstream Applications",
        "venue": "Annual Review of Genomics and Human Genetics",
        "year": 2025,
        "url": "https://www.annualreviews.org/content/journals/10.1146/annurev-genom-011224-015733"
      },
      {
        "title": "Polygenic prediction of educational attainment within and between families from genome-wide association analyses in 3 million individuals",
        "venue": "Nature Genetics",
        "year": 2022,
        "url": "https://doi.org/10.1038/s41588-022-01016-z"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 802,
      "y": 716,
      "scale": 0.95
    }
  },
  {
    "id": 97,
    "atlasN": 1020,
    "slug": "autonomous-ai-scientist-ai-reviewer",
    "title": {
      "zh": "AI科学家与AI评审的自治出版生态",
      "en": "Autonomous AI-Scientist / AI-Reviewer Publishing Ecosystems"
    },
    "qfocus": {
      "zh": "当 AI 智能体能自主提出假设、做实验、写论文并互评时，该为洪水般涌现的 AI 研究建立一套什么样可信的评议与发表基础设施？",
      "en": "When AI agents can autonomously propose hypotheses, run experiments, write papers, and review each other, what kind of trustworthy review-and-publish infrastructure should be built for the flood of AI-generated research?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C20",
      "zh": "去中心科学·开放科学机制",
      "en": "Decentralized science · open science mechanisms"
    },
    "scores": [
      4,
      4,
      4,
      4,
      3,
      4,
      2,
      2,
      3
    ],
    "citation": {
      "url": "https://arxiv.org/abs/2508.15126",
      "title": "aiXiv: A Next-Generation Open Access Ecosystem for Scientific Discovery Generated by AI Scientists",
      "venue": "arXiv preprint 2508.15126",
      "year": 2025
    },
    "brief": {
      "zh": "当 AI 智能体能自主提出假设、跑实验、写论文并互评后，一类专为「人机共同作者」设计的开放获取平台开始出现：论文先由多个 LLM 评审智能体打分排序，顶部成果再交人类复核。锚点案例是 2025 年预印本 aiXiv、斯坦福与 Together AI 主办的 Agents4Science 会议，以及 Sakana AI Scientist-v2——其全 AI 生成稿件已有一篇以均分 6.33 通过 ICLR 工作坊评审。",
      "en": "As AI agents can autonomously propose hypotheses, run experiments, write papers, and review one another, a new class of open-access platform designed for human-AI co-authorship is emerging: papers are first scored and ranked by multiple LLM reviewer agents before top results go to human review. Anchor cases include the 2025 aiXiv preprint, the Stanford/Together AI Agents4Science conference, and Sakana's AI Scientist-v2, one of whose fully AI-generated papers passed ICLR workshop review with an average score of 6.33."
    },
    "depth": {
      "overview": {
        "zh": "当 Sakana 的 AI Scientist-v2 已有论文匿名通过 ICLR 工作坊评审，问题不再是「AI 能否写论文」，而是「如何为洪水般的 AI 研究建一套可信的评议与发表基础设施」。aiXiv 与 Agents4Science 正是第一批答案：前者是面向人类与 AI 科学家的开放平台，提交后由多个 LLM 评审智能体自动打分排序、顶部成果再经人类复核；后者要求 AI 同时担任主要作者与评审。",
        "en": "With Sakana's AI Scientist-v2 already having a paper pass ICLR workshop review anonymously, the question is no longer 'can AI write papers' but 'how to build a trustworthy review-and-publish infrastructure for the flood of AI-generated research'. aiXiv and Agents4Science are the first answers: the former is an open platform for human and AI scientists where submissions are automatically scored and ranked by multiple LLM reviewer agents before top results go to human review; the latter requires AI to serve as both primary author and reviewer."
      },
      "whyMatters": {
        "zh": "当科研产出被 AI 加速到远超人类评审吞吐的地步时，评议是否可信直接决定这个自治出版生态能否成立——一旦「质量地板」被攻破，科学记录本身的可信度就会被侵蚀。",
        "en": "When research output is accelerated by AI far beyond human review throughput, whether the review process can be trusted directly determines whether this autonomous publishing ecosystem can hold — if the 'quality floor' is breached, the credibility of the scientific record itself erodes."
      },
      "ifAnswered": {
        "zh": "下一步是建立可审计的「AI 评审链路」与防同质化偏置机制；谁先建成可信的 AI-原生评议层，谁就将定义后人类科研的传播标准。",
        "en": "The next step is building auditable AI-review pipelines and anti-homogenization safeguards; whoever first builds a trustworthy AI-native review layer will define the dissemination standard for post-human research."
      },
      "approaches": [
        {
          "zh": "用多个独立的 LLM 评审智能体对提交打分排序，作为第一层过滤，再把排名靠前的成果交人类复核，构成「机器初筛+人类终审」的两层评议架构（如 aiXiv）。",
          "en": "Having multiple independent LLM reviewer agents score and rank submissions as a first filter, then escalating top-ranked results to human review — a two-tier 'machine triage + human final review' architecture (as in aiXiv)."
        },
        {
          "zh": "要求 AI 同时担任论文的主要作者与评审者（如 Agents4Science），直接检验机器能否在生产与把关两端都达到可信标准。",
          "en": "Requiring AI to serve as both primary author and reviewer of papers (as in Agents4Science), directly testing whether machines can meet trustworthy standards on both the production and gatekeeping sides."
        },
        {
          "zh": "把去中心科学（DeSci）开放、可激励的质量控制机制引入评议流程，探索能否用博弈论式的激励设计替代传统的中心化把关人。",
          "en": "Introducing decentralized-science (DeSci) open, incentivized quality-control mechanisms into the review process, exploring whether game-theoretic incentive design can replace traditional centralized gatekeepers."
        }
      ],
      "barrier": {
        "zh": "最硬的难点是评议可信度：多个 LLM 评审智能体彼此高度相关、共享盲点，「多智能体投票」未必降低偏置反而可能放大集体幻觉；而人类复核又重新成为吞吐瓶颈——自治生态的「质量地板」到底由谁、用什么基准托住，尚无定论。",
        "en": "The hardest difficulty is review credibility: multiple LLM reviewer agents are highly correlated with one another and share blind spots, so 'multi-agent voting' may not reduce bias but instead amplify collective hallucination; meanwhile human review becomes a throughput bottleneck again — who holds up the autonomous ecosystem's 'quality floor', and by what benchmark, remains unsettled."
      },
      "subQuestions": [
        {
          "zh": "科学的质量控制能否在没有中心化「守门人」（期刊、机构、同行评审委员会）的情况下，靠去中心的、可验证的激励机制可靠地实现？还是说某种形式的可信权威，是把噪声与造假挡在科学之外的不可消除的成本？",
          "en": "Can the quality control of science be reliably achieved through decentralized, verifiable incentive mechanisms without centralized 'gatekeepers' (journals, institutions, peer-review boards) — or is some form of trusted authority an irreducible cost of keeping noise and fraud out of science?"
        },
        {
          "zh": "如果科学知识、数据与同行评审全部开放且可机器读取，那么什么样的激励结构才能让「贡献真相」而非「博取声誉」成为研究者的最优策略？开放科学要解决的，究竟是技术问题还是博弈论问题？",
          "en": "If scientific knowledge, data, and peer review were all open and machine-readable, what incentive structure would make 'contributing truth' rather than 'gaming reputation' a researcher's optimal strategy — is open science fundamentally a technical problem or a game-theoretic one?"
        },
        {
          "zh": "当 AI 能自主提出假设、设计并执行实验、撰写论文时，「科学共同体」的边界是否需要被重新定义？开放科学的下一步，是把机器纳入为平等的认知主体，还是会因此瓦解人类同行评审赖以建立的信任基础？",
          "en": "When AI can autonomously propose hypotheses, design and run experiments, and write papers, must the boundary of the 'scientific community' be redefined — is the next step of open science to admit machines as equal epistemic agents, or does doing so dissolve the trust foundation on which human peer review rests?"
        }
      ]
    },
    "literature": [
      {
        "title": "aiXiv: A Next-Generation Open Access Ecosystem for Scientific Discovery Generated by AI Scientists",
        "venue": "arXiv preprint 2508.15126",
        "year": 2025,
        "url": "https://arxiv.org/abs/2508.15126"
      },
      {
        "title": "Open Conference of AI Agents for Science (Agents4Science) — Paper Submissions",
        "venue": "Stanford University / Together AI",
        "year": 2025,
        "url": "https://agents4science.stanford.edu/submissions.html"
      },
      {
        "title": "The AI Scientist-v2: Workshop-Level Automated Scientific Discovery via Agentic Tree Search",
        "venue": "Sakana AI (technical report)",
        "year": 2025,
        "url": "https://pub.sakana.ai/ai-scientist-v2/paper/paper.pdf"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 1055,
      "y": 683,
      "scale": 0.94
    }
  },
  {
    "id": 98,
    "atlasN": 1016,
    "slug": "zero-knowledge-verifiable-scientific-computation",
    "title": {
      "zh": "零知识证明的可验证科研计算",
      "en": "Zero-Knowledge Verifiable Scientific Computation"
    },
    "qfocus": {
      "zh": "能否用零知识证明，在不公开原始数据、模型权重或专有代码的前提下，密码学地证明某项科研计算结果确实来自声称的那段计算？",
      "en": "Can zero-knowledge proofs cryptographically prove that a scientific computation result truly came from the claimed computation — without revealing the underlying data, model weights, or proprietary code?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C20",
      "zh": "去中心科学·开放科学机制",
      "en": "Decentralized science · open science mechanisms"
    },
    "scores": [
      4,
      4,
      5,
      3,
      2,
      3,
      3,
      3,
      2
    ],
    "citation": {
      "url": "https://ddkang.github.io/papers/2024/zkml-eurosys.pdf",
      "title": "ZKML: An Optimizing System for ML Inference in Zero-Knowledge Proofs",
      "venue": "EuroSys 2024",
      "year": 2024
    },
    "brief": {
      "zh": "零知识证明让「可验证」与「不公开」首次有望共存——证明某项训练/推理/分析结果确由声称的计算产生，却不泄露原始数据或模型权重。2025 年生产级 zkML 系统 DeepProve-1 已能为 GPT-2 完整推理生成密码学证明，但出证成本高、电路表达力有限（多数框架仅支持 ONNX 120+ 算子中的约 50 个），仍是通向「任意科研流水线一键出证」的硬约束。",
      "en": "Zero-knowledge proofs make 'verifiable' and 'undisclosed' compatible for the first time — proving that a training/inference/analysis result truly came from the claimed computation without revealing the underlying data or model weights. In 2025, the production-grade zkML system DeepProve-1 could already generate a cryptographic proof for a full GPT-2 inference, but high proving costs and limited circuit expressiveness (most frameworks support only about 50 of ONNX's 120+ operators) remain hard constraints on the road to 'one-click proof for any scientific pipeline'."
    },
    "depth": {
      "overview": {
        "zh": "复现要求公开一切，但医学数据、专利模型又必须保密——这个两难看似无解。零知识证明给出第三条路：用密码学证明，在不公开原始数据、模型权重或专有代码的前提下，某个训练/推理/分析结果确由声称的那段计算产生，让「可验证」与「不公开」同时成立。",
        "en": "Reproduction demands full disclosure, yet medical data and proprietary models must stay confidential — a dilemma that seems unsolvable. Zero-knowledge proofs offer a third path: cryptographically proving that a training/inference/analysis result really came from the claimed computation, without revealing the raw data, model weights, or proprietary code — letting 'verifiable' and 'undisclosed' hold at once."
      },
      "whyMatters": {
        "zh": "它瞄准了科研可复现性的一个长期死结：复现要求公开一切，但医学数据、专利模型又必须保密。如果零知识证明能真正规模化，「可验证」与「不公开」将首次同时成立，从根本上化解可复现性与隐私/专利之间的长期两难。",
        "en": "It targets a long-standing deadlock in scientific reproducibility: reproduction demands full disclosure, yet medical data and proprietary models must stay confidential. If zero-knowledge proofs can truly scale, 'verifiable' and 'undisclosed' would hold simultaneously for the first time, fundamentally dissolving the long-standing reproducibility-versus-privacy/patent dilemma."
      },
      "ifAnswered": {
        "zh": "若工程瓶颈被突破，零知识证明将真正化解可复现性与隐私/专利保护之间的长期两难，让医学、金融等高敏感领域的科研结果也能被独立验证而无需公开原始数据。",
        "en": "If the engineering bottlenecks are overcome, zero-knowledge proofs would truly dissolve the long-standing reproducibility-versus-privacy/patent dilemma, letting research results in highly sensitive fields like medicine and finance be independently verified without disclosing the underlying data."
      },
      "approaches": [
        {
          "zh": "为训练、测试、推理三类任务分别设计可验证电路（zkML），把「计算确实按声称方式执行」转化为可密码学核验的证明。",
          "en": "Designing verifiable circuits (zkML) separately for training, testing, and inference tasks, turning 'the computation really ran as claimed' into a cryptographically checkable proof."
        },
        {
          "zh": "扩大电路对算子的覆盖（如注意力机制从「勉强可行」到多框架支持），逐步逼近对真实科研流水线的完整覆盖。",
          "en": "Expanding circuit coverage of operators (e.g., attention mechanisms moving from 'barely feasible' to multi-framework support), progressively approaching full coverage of real scientific pipelines."
        },
        {
          "zh": "把可验证计算接入去中心科学的开放评议机制，让密码学证明成为替代或补充人类同行评审的可信凭证。",
          "en": "Integrating verifiable computation into decentralized-science open review mechanisms, so cryptographic proofs become a trusted credential that can replace or supplement human peer review."
        }
      ],
      "barrier": {
        "zh": "最硬的瓶颈是工程可行性：出证成本极高、电路表达力有限（ONNX 有 120+ 算子，多数 zkML 框架只支持约 50 个），自定义层、异常归一化和动态控制流仍难入证，离「任意科研流水线一键出证」还很远。",
        "en": "The hardest bottleneck is engineering feasibility: proving costs are extremely high, circuit expressiveness is limited (ONNX has 120+ operators, but most zkML frameworks support only around 50), and custom layers, unusual normalization, and dynamic control flow remain difficult to encode into proofs — 'one-click proof generation for any scientific pipeline' is still far off."
      },
      "subQuestions": [
        {
          "zh": "科学的质量控制能否在没有中心化「守门人」（期刊、机构、同行评审委员会）的情况下，靠去中心的、可验证的激励机制可靠地实现？还是说某种形式的可信权威，是把噪声与造假挡在科学之外的不可消除的成本？",
          "en": "Can the quality control of science be reliably achieved through decentralized, verifiable incentive mechanisms without centralized 'gatekeepers' (journals, institutions, peer-review boards) — or is some form of trusted authority an irreducible cost of keeping noise and fraud out of science?"
        },
        {
          "zh": "如果科学知识、数据与同行评审全部开放且可机器读取，那么什么样的激励结构才能让「贡献真相」而非「博取声誉」成为研究者的最优策略？开放科学要解决的，究竟是技术问题还是博弈论问题？",
          "en": "If scientific knowledge, data, and peer review were all open and machine-readable, what incentive structure would make 'contributing truth' rather than 'gaming reputation' a researcher's optimal strategy — is open science fundamentally a technical problem or a game-theoretic one?"
        },
        {
          "zh": "当 AI 能自主提出假设、设计并执行实验、撰写论文时，「科学共同体」的边界是否需要被重新定义？开放科学的下一步，是把机器纳入为平等的认知主体，还是会因此瓦解人类同行评审赖以建立的信任基础？",
          "en": "When AI can autonomously propose hypotheses, design and run experiments, and write papers, must the boundary of the 'scientific community' be redefined — is the next step of open science to admit machines as equal epistemic agents, or does doing so dissolve the trust foundation on which human peer review rests?"
        }
      ]
    },
    "literature": [
      {
        "title": "A Survey of Zero-Knowledge Proof Based Verifiable Machine Learning",
        "venue": "arXiv / AI Review (Springer)",
        "year": 2025,
        "url": "https://arxiv.org/abs/2502.18535"
      },
      {
        "title": "A Framework for Cryptographic Verifiability of End-to-End AI Pipelines",
        "venue": "arXiv",
        "year": 2025,
        "url": "https://arxiv.org/pdf/2503.22573"
      },
      {
        "title": "ZKML: An Optimizing System for ML Inference in Zero-Knowledge Proofs",
        "venue": "EuroSys 2024",
        "year": 2024,
        "url": "https://ddkang.github.io/papers/2024/zkml-eurosys.pdf"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 914,
      "y": 551,
      "scale": 1
    }
  },
  {
    "id": 99,
    "atlasN": 341,
    "slug": "human-machine-collaborative-scientific-discovery",
    "title": {
      "zh": "人机协作的科学发现",
      "en": "Human-Machine Collaborative Scientific Discovery"
    },
    "qfocus": {
      "zh": "在人机协作的科学发现中，人机分工的边界应该划在哪里，才能既发挥AI的计算与生成能力，又不让科学家丧失独立判断？",
      "en": "In human-machine collaborative scientific discovery, where should the human-AI division of labor be drawn so that AI's generative and computational power is harnessed without scientists losing independent judgment?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C21",
      "zh": "人机协作·认知增强",
      "en": "Human-AI collaboration · cognitive augmentation"
    },
    "scores": [
      5,
      4,
      5,
      3,
      5,
      3,
      3,
      2,
      2
    ],
    "citation": {
      "url": "https://www.nature.com/articles/s41586-023-06221-2",
      "title": "Scientific discovery in the age of artificial intelligence",
      "venue": "Nature",
      "year": 2023
    },
    "brief": {
      "zh": "人机协作的科学发现构建人负责提问、判断与设定目标，AI负责文献综合、假说生成与海量计算的共生科研模式，正走向成为默认的科研工作方式。真正的范式转变不是AI取代科学家，而是重新划分人机分工边界——最大风险是认知外包侵蚀科学家的独立判断。",
      "en": "Human-AI collaborative scientific discovery builds a symbiotic mode in which humans handle questioning, judgment, and goal-setting while AI handles literature synthesis, hypothesis generation, and massive computation, and it is becoming the default way of doing research. The real paradigm shift is not AI replacing scientists but redrawing the human-machine division of labor — the biggest risk is that cognitive outsourcing erodes scientists' independent judgment."
    },
    "depth": {
      "overview": {
        "zh": "人机协作的科学发现是一种共生研究模式：人类负责提问、判断、设定目标与价值，AI负责文献综合、假说生成、实验设计与海量计算，二者形成互补的发现回路。它交叉AI、认知科学与科研方法学，正走向成为科研的默认工作方式。",
        "en": "Human-machine collaborative scientific discovery is a symbiotic research mode: humans handle questioning, judgment, and the setting of goals and values, while AI handles literature synthesis, hypothesis generation, experimental design, and massive computation, forming a complementary discovery loop. Spanning AI, cognitive science, and research methodology, it is moving toward becoming the default mode of research work."
      },
      "whyMatters": {
        "zh": "真正的范式转变不是AI替代科学家，而是重新划分「人擅长什么、机器擅长什么」的分工边界；最大风险是认知外包导致科学家逐渐丧失独立判断与直觉，沦为只会按AI建议执行的操作员，而判断力恰恰是科学最不能交出去的部分。",
        "en": "The real paradigm shift is not AI replacing scientists but redrawing the division-of-labor boundary of 'what humans are good at, what machines are good at'; the biggest risk is that cognitive outsourcing gradually erodes scientists' independent judgment and intuition, reducing them to operators who merely execute AI's suggestions—yet judgment is precisely the part of science that can least be handed over."
      },
      "ifAnswered": {
        "zh": "若这一协作模式持续发展，它将成为科研的默认工作方式——科学家与AI形成常态化的互补分工。",
        "en": "If this collaborative mode continues to mature, it will become the default way of doing research — a normalized complementary division of labor between scientists and AI."
      },
      "approaches": [
        {
          "zh": "分工设计：先划定认知劳动在人机之间应如何分配，寻找一条可测量的「增强-退化」边界。",
          "en": "Division-of-labor design: determine how cognitive labor should be split between humans and AI, seeking a measurable boundary between augmentation and atrophy."
        },
        {
          "zh": "双向认知接口：探索脑机接口能否不止解码人类意图，也能把AI生成的抽象表征写回大脑。",
          "en": "Bidirectional cognitive interfaces: explore whether brain-computer interfaces can not only decode human intent but also write AI-generated abstract representations back into the brain."
        },
        {
          "zh": "合体智能的能力上限：刻画「人+AI」联合系统能否产生任何一方单独都不可能产生的新能力，及其边界。",
          "en": "Ceiling of combined intelligence: characterize whether the joint human+AI system can produce capabilities neither could alone, and where its limits lie."
        }
      ],
      "barrier": {
        "zh": "最大风险是认知外包导致科学家逐渐丧失独立判断与直觉，沦为只会按AI建议执行的操作员——而判断力恰恰是科学最不能交出去的部分。",
        "en": "The biggest risk is that cognitive outsourcing gradually erodes scientists' independent judgment and intuition, reducing them to operators who merely execute AI's suggestions — yet judgment is precisely the part of science that can least be handed over."
      },
      "subQuestions": [
        {
          "zh": "当人类与AI长期协作时，认知劳动究竟应该如何在两者之间分配，才能让人「越用越聪明」而非「越用越退化」？是否存在一条可测量的边界，越过它人类就把自己的判断力外包掉了？",
          "en": "When humans and AI collaborate over the long run, how should cognitive labor be partitioned so that people grow sharper rather than atrophy — and is there a measurable line past which we have outsourced our own judgment?"
        },
        {
          "zh": "人脑和AI之间能否建立一种「双向」的认知接口——不只是脑把意图发给机器，而是机器也能把抽象表征写回人脑，让人「直接知道」自己从未学过的东西？这种写入若可行，被增强的还是不是同一个「自我」？",
          "en": "Can a genuinely two-way cognitive interface exist between brain and AI — not just decoding intent outward, but writing machine representations back into the brain so a person 'directly knows' something never learned — and if such write-in works, is the augmented mind still the same self?"
        },
        {
          "zh": "如果我们不再问「AI能否独立超过人类」，而是问「人+AI 的联合系统能否产生任何一方单独都不可能产生的新认知能力」，那么这种「人机合体智能」是否有它自己的、不可还原为两者之和的能力上限？",
          "en": "If we stop asking whether AI alone can surpass humans and instead ask whether the joint human+AI system can produce cognitive capabilities neither could alone, does this 'centaur' intelligence have its own ceiling that is irreducible to the sum of its parts?"
        }
      ]
    },
    "literature": [
      {
        "title": "Scientific discovery in the age of artificial intelligence",
        "venue": "Nature",
        "year": 2023,
        "url": "https://www.nature.com/articles/s41586-023-06221-2"
      },
      {
        "title": "Accelerating science with human-aware artificial intelligence",
        "venue": "Nature Human Behaviour",
        "year": 2023,
        "url": "https://www.nature.com/articles/s41562-023-01648-z"
      },
      {
        "title": "Human-machine collaboration for improving semiconductor process development",
        "venue": "Nature",
        "year": 2023,
        "url": "https://www.nature.com/articles/s41586-023-05773-7"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 706,
      "y": 755,
      "scale": 0.89
    }
  },
  {
    "id": 100,
    "atlasN": 544,
    "slug": "the-empirical-science-of-human",
    "title": {
      "zh": "人机互补性的实证科学",
      "en": "The Empirical Science of Human-AI Complementarity"
    },
    "qfocus": {
      "zh": "「人+AI」团队究竟在什么条件下才能真正胜过人或AI单独工作，而不是像多数实验显示的那样反而更差？",
      "en": "Under what conditions does a human-plus-AI team genuinely outperform either working alone, rather than underperforming as most experiments show?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C21",
      "zh": "人机协作·认知增强",
      "en": "Human-AI collaboration · cognitive augmentation"
    },
    "scores": [
      4,
      4,
      3,
      3,
      5,
      4,
      3,
      2,
      4
    ],
    "citation": {
      "url": "https://www.nature.com/articles/s41562-024-02024-1",
      "title": "When combinations of humans and AI are useful: A systematic review and meta-analysis",
      "venue": "Nature Human Behaviour",
      "year": 2024
    },
    "brief": {
      "zh": "人机互补性的实证科学用对照实验检验「人+AI」团队是否真优于二者中更强的一方。Vaccaro等2024年对上百项研究的元分析显示：平均而言人机组合反而不如更强的一方，仅创作类任务偶见增益。这把领域从「人机必然互补」的乐观假设推向如何工程化设计真正互补的问题。",
      "en": "The empirical science of human-AI complementarity uses controlled experiments to test whether human-plus-AI teams truly beat the stronger party alone. Vaccaro et al.'s 2024 meta-analysis of over a hundred studies found that on average human-AI combinations underperformed the better party, with gains seen mainly in creative tasks. This shifts the field from assuming complementarity to engineering how to design it."
    },
    "depth": {
      "overview": {
        "zh": "人机互补性的实证科学系统检验「人+AI」团队是否真的优于人或AI单独工作，并设法识别互补成立的条件。其令人警醒的出发点是：迄今多数对照实验显示人机协作的表现反而不如二者中更强的一方。它结合认知科学、AI评测与决策科学。",
        "en": "The empirical science of human-AI complementarity systematically tests whether 'human + AI' teams truly outperform humans or AI working alone, and seeks to identify the conditions under which complementarity holds. Its sobering premise: to date, most controlled experiments show that human-AI collaboration actually underperforms the stronger of the two. It combines cognitive science, AI evaluation, and decision science."
      },
      "whyMatters": {
        "zh": "它把领域从乐观假设「人机必然互补」转向「如何工程化地设计出真正的互补」，这是一个被产业宣传长期掩盖的硬事实。核心难点是互补取决于任务分配、信任校准与AI不确定性沟通的精细设计，目前缺乏可推广的理论，多数正面结果难以跨任务复现。",
        "en": "It moves the field from the optimistic assumption that 'humans and AI are necessarily complementary' to 'how to engineer genuine complementarity'—a hard fact long obscured by industry hype. The core difficulty is that complementarity depends on fine-grained design of task allocation, trust calibration, and communication of AI uncertainty; there is currently no generalizable theory, and most positive results are hard to reproduce across tasks."
      },
      "ifAnswered": {
        "zh": "若能建立可推广的理论，这一领域将从「人机能否互补」的争论，转向「如何设计出真正互补」的工程科学——为任务分配、信任校准与不确定性沟通提供可复用的设计原则。",
        "en": "If a generalizable theory can be built, the field will shift from debating whether humans and AI can complement each other to an engineering science of how to design real complementarity — with reusable principles for task allocation, trust calibration, and uncertainty communication."
      },
      "approaches": [
        {
          "zh": "复现元分析发现的「协同损失」模式，定位决策类任务中人机团队为何普遍不如更强一方。",
          "en": "Replicate the meta-analysis's 'synergy loss' pattern and pinpoint why human-AI teams in decision tasks generally underperform the stronger party."
        },
        {
          "zh": "校准信任与依赖：解决人们「AI对时不信、AI错时盲从」的错配依赖问题。",
          "en": "Calibrate trust and reliance: address the mismatch where people distrust AI when it's right and over-rely on it when it's wrong."
        },
        {
          "zh": "划定认知劳动的分配边界，寻找一条可测量的「增强-退化」界线，呼应C21集群的分工问题。",
          "en": "Determine how cognitive labor should be divided, seeking a measurable augmentation-versus-atrophy boundary, echoing the C21 cluster's division-of-labor question."
        }
      ],
      "barrier": {
        "zh": "核心难点是互补取决于任务分配、信任校准与AI不确定性沟通的精细设计，目前缺乏可推广的理论，多数正面结果难以跨任务复现，且人往往在AI正确时不信、在AI错误时盲从。",
        "en": "The core difficulty is that complementarity depends on fine-grained design of task allocation, trust calibration, and communication of AI uncertainty; there is currently no generalizable theory, most positive results are hard to reproduce across tasks, and people tend to distrust AI when it is right and over-rely on it when it is wrong."
      },
      "subQuestions": [
        {
          "zh": "当人类与AI长期协作时，认知劳动究竟应该如何在两者之间分配，才能让人「越用越聪明」而非「越用越退化」？是否存在一条可测量的边界，越过它人类就把自己的判断力外包掉了？",
          "en": "When humans and AI collaborate over the long run, how should cognitive labor be partitioned so that people grow sharper rather than atrophy — and is there a measurable line past which we have outsourced our own judgment?"
        },
        {
          "zh": "人脑和AI之间能否建立一种「双向」的认知接口——不只是脑把意图发给机器，而是机器也能把抽象表征写回人脑，让人「直接知道」自己从未学过的东西？这种写入若可行，被增强的还是不是同一个「自我」？",
          "en": "Can a genuinely two-way cognitive interface exist between brain and AI — not just decoding intent outward, but writing machine representations back into the brain so a person 'directly knows' something never learned — and if such write-in works, is the augmented mind still the same self?"
        },
        {
          "zh": "如果我们不再问「AI能否独立超过人类」，而是问「人+AI 的联合系统能否产生任何一方单独都不可能产生的新认知能力」，那么这种「人机合体智能」是否有它自己的、不可还原为两者之和的能力上限？",
          "en": "If we stop asking whether AI alone can surpass humans and instead ask whether the joint human+AI system can produce cognitive capabilities neither could alone, does this 'centaur' intelligence have its own ceiling that is irreducible to the sum of its parts?"
        }
      ]
    },
    "literature": [
      {
        "title": "When combinations of humans and AI are useful: A systematic review and meta-analysis",
        "venue": "Nature Human Behaviour",
        "year": 2024,
        "url": "https://www.nature.com/articles/s41562-024-02024-1"
      },
      {
        "title": "Does the Whole Exceed its Parts? The Effect of AI Explanations on Complementary Team Performance",
        "venue": "ACM CHI",
        "year": 2021,
        "url": "https://aiweb.cs.washington.edu/ai/pubs/bansal-chi21.pdf"
      },
      {
        "title": "Complementarity in Human-AI Collaboration: Concept, Sources, and Evidence",
        "venue": "arXiv",
        "year": 2024,
        "url": "https://arxiv.org/html/2404.00029v2"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 985,
      "y": 544,
      "scale": 0.96
    }
  },
  {
    "id": 101,
    "atlasN": 1434,
    "slug": "ai-mediated-collective-deliberation",
    "title": {
      "zh": "AI 调解的集体审议",
      "en": "AI-Mediated Collective Deliberation"
    },
    "qfocus": {
      "zh": "能否训练一个AI调解人，在大规模审议中写出比人类调解人更被参与者认可的共识陈述，同时不牺牲规范正当性？",
      "en": "Can an AI mediator be trained to draft consensus statements in large-scale deliberation that participants prefer over human mediators' — without sacrificing normative legitimacy?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C22",
      "zh": "集体智能·知识基础设施",
      "en": "Collective intelligence · knowledge infrastructure"
    },
    "scores": [
      4,
      5,
      4,
      4,
      4,
      4,
      3,
      4,
      4
    ],
    "citation": {
      "url": "https://www.science.org/doi/10.1126/science.adq2852",
      "title": "AI can help humans find common ground in democratic deliberation",
      "venue": "Science",
      "year": 2024
    },
    "brief": {
      "zh": "Google DeepMind 的 Habermas Machine（Tessler 等，2024，Science）由生成模型与个性化奖励模型组成，为6人小组撰写共识陈述。N=5734名参与者中，AI陈述被偏好的比例高于人类调解人（约56%），且在英国具代表性的「虚拟公民大会」中复现。",
      "en": "Google DeepMind's Habermas Machine (Tessler et al., 2024, Science) pairs a generative model with a personalized reward model to draft consensus statements for 6-person groups. Among N=5,734 participants, AI statements were preferred over human mediators' about 56% of the time, and the result replicated in a demographically representative UK 'virtual citizens' assembly.'"
    },
    "depth": {
      "overview": {
        "zh": "一台以哲学家哈贝马斯命名的机器，学着不去说服、而去调解——它写出的共识陈述，多数参与者觉得比人类调解人写得更好。",
        "en": "A machine named after the philosopher Habermas, learning not to persuade but to mediate — the consensus statements it writes are judged by most participants to be better than those written by human mediators."
      },
      "whyMatters": {
        "zh": "最硬的问题是规范正当性：多数偏好高的陈述未必最公正，「讨人喜欢」与「该被接受」可能背离；模型还缺事实核查与守题能力，易被操纵或滑向多数暴政。",
        "en": "The hardest problem is normative legitimacy: a statement preferred by the majority is not necessarily the most just — 'being well-liked' and 'being what ought to be accepted' can diverge; the model also lacks fact-checking and agenda-keeping ability, making it vulnerable to manipulation or a slide into tyranny of the majority."
      },
      "ifAnswered": {
        "zh": "下一步是把它接入真实公民大会与在线审议平台，并补上事实核查、议题守控等现实调解能力。",
        "en": "The next step is wiring it into real citizens' assemblies and online deliberation platforms, and adding the real-world mediation capacities of fact-checking and agenda-keeping."
      },
      "approaches": [
        {
          "zh": "训练生成模型+个性化奖励模型的「调解人」架构，迭代生成兼顾多数与异见的共识陈述。",
          "en": "Train a mediator architecture combining a generative model with a personalized reward model that iteratively drafts consensus statements honoring both majority and dissenting views."
        },
        {
          "zh": "追问人机混合群体是否存在类似个体IQ的「集体智能因子」，以及AI调解能否系统性抬升它。",
          "en": "Investigate whether human-AI hybrid groups exhibit a collective-intelligence factor analogous to individual IQ, and whether AI mediation can systematically raise it."
        },
        {
          "zh": "在把AI调解接入真实公民大会前，先补上事实核查与议题守控能力，防止操纵与「多数暴政」。",
          "en": "Before wiring AI mediation into real citizens' assemblies, add fact-checking and agenda-keeping capacity to guard against manipulation and 'tyranny of the majority.'"
        }
      ],
      "barrier": {
        "zh": "多数偏好高的陈述未必最公正，「讨人喜欢」与「该被接受」可能背离；模型还缺事实核查与守题能力，易被操纵或滑向多数暴政，目前没有可问责机制界定AI调解人可以取舍哪些异见。",
        "en": "A statement preferred by the majority is not necessarily the most just — being well-liked and being what ought to be accepted can diverge; the model still lacks fact-checking and agenda-keeping ability, making it vulnerable to manipulation or a slide into tyranny of the majority, with no accountability mechanism yet governing which dissent an AI mediator may set aside."
      },
      "subQuestions": [
        {
          "zh": "一群个体（人、或人加AI）在什么结构条件下会真正变得「比其中最聪明的成员更聪明」，又在什么条件下塌缩为群体盲从？是否存在一个可测量的「集体智能因子 c」，像个体IQ一样稳定地预测群体表现？",
          "en": "Under what structural conditions does a group (of humans, or humans plus AI) become genuinely smarter than its smartest member, versus collapsing into herd folly — and is there a measurable collective-intelligence factor 'c' that predicts group performance as stably as individual IQ?"
        },
        {
          "zh": "当人类的知识基础设施（搜索、百科、训练语料）越来越多地由AI生成、又反过来训练下一代AI时，这个自我循环会不会导致集体知识的「模型坍缩」——多样性、真实性与稀有事实被系统性抹去？我们能否在源头上保住人类知识的「不可被合成替代」的部分？",
          "en": "As humanity's knowledge infrastructure — search, encyclopedias, training corpora — is increasingly generated by AI that then trains the next AI, does this self-loop drive a 'model collapse' of collective knowledge, systematically erasing diversity, truth, and rare facts — and can we protect the part of human knowledge that synthesis cannot replace?"
        },
        {
          "zh": "是否可能为整个文明建立一个「活的、可机读、可被对抗验证」的共享知识基础设施——让每一条断言都带着可追溯的来源与独立佐证强度，使真伪不再靠权威而靠结构判定？这样的基础设施会消除虚假信息，还是只是把权力转移给定义「来源可信」的人？",
          "en": "Could a civilization build a living, machine-readable, adversarially-verifiable shared knowledge infrastructure — where every assertion carries traceable provenance and independent-corroboration strength, so truth is settled by structure rather than authority — and would it dissolve misinformation, or merely shift power to whoever defines 'a trustworthy source'?"
        }
      ]
    },
    "literature": [
      {
        "title": "AI can help humans find common ground in democratic deliberation",
        "venue": "Science",
        "year": 2024,
        "url": "https://www.science.org/doi/10.1126/science.adq2852"
      },
      {
        "title": "AI can help humans find common ground in democratic deliberation (publication page)",
        "venue": "Google DeepMind",
        "year": 2024,
        "url": "https://deepmind.google/research/publications/65220/"
      },
      {
        "title": "google-deepmind/habermas_machine — dataset & code",
        "venue": "GitHub (official code)",
        "year": 2024,
        "url": "https://github.com/google-deepmind/habermas_machine"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 898,
      "y": 755,
      "scale": 0.81
    }
  },
  {
    "id": 102,
    "atlasN": 1171,
    "slug": "ai-mediated-deliberation-and-machine",
    "title": {
      "zh": "AI 中介审议与机器共识调解",
      "en": "AI-Mediated Deliberation and Machine Consensus Facilitation"
    },
    "qfocus": {
      "zh": "审议民主七十年来困于规模——AI调解人能否真正打破「好商议只能发生在几十人房间里」的死穴，同时不让「更受欢迎」偷换「更正当」？",
      "en": "Deliberative democracy has been stuck on scale for seventy years — can an AI mediator truly break the constraint that 'good deliberation can only happen in a room of dozens,' without letting 'more popular' quietly substitute for 'more legitimate'?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C22",
      "zh": "集体智能·知识基础设施",
      "en": "Collective intelligence · knowledge infrastructure"
    },
    "scores": [
      4,
      5,
      4,
      4,
      5,
      4,
      4,
      4,
      3
    ],
    "citation": {
      "url": "https://www.science.org/doi/10.1126/science.adq2852",
      "title": "AI can help humans find common ground in democratic deliberation",
      "venue": "Science",
      "year": 2024
    },
    "brief": {
      "zh": "2024年10月，DeepMind团队在Science发表Habermas Machine：AI调解人基于参与者意见与批评迭代生成共识陈述，N=5734实验中参与者认为其比人类调解人更清晰、更不偏颇，并在英国代表性样本中复现。同期Google Jigsaw开源Sensemaking工具、AI Objectives Institute的Talk to the City已在工会、DAO与国家级咨询中落地，形成从「倾听」到「调解」的审议栈。",
      "en": "In October 2024, DeepMind published the Habermas Machine in Science: an AI mediator iteratively drafts consensus statements from participants' opinions and critiques; in an N=5,734 experiment, participants judged it clearer and less biased than human mediators, replicating in a representative UK sample. Around the same time, Google Jigsaw open-sourced its Sensemaking tools and the AI Objectives Institute's Talk to the City was deployed in unions, DAOs, and national consultations, forming a scalable deliberation stack from 'listening' to 'mediating.'"
    },
    "depth": {
      "overview": {
        "zh": "审议民主七十年来的死穴是规模：好的商议只能发生在几十人的房间里。2024年Science上的Habermas Machine实验第一次给出反例——AI调解人写的共识陈述，比拿薪水的人类调解人更被五千多名参与者接受。",
        "en": "Deliberative democracy's seventy-year Achilles' heel has been scale: good deliberation could only happen in rooms of a few dozen people. The 2024 Habermas Machine experiment in Science was the first counterexample — the consensus statements written by the AI mediator were accepted by more than five thousand participants more readily than those written by paid human mediators."
      },
      "whyMatters": {
        "zh": "最硬的张力：共识陈述的「更受欢迎」不等于「更正当」。AI调解人以何种权利决定哪些异见被写进共识、哪些被平滑掉，目前没有任何可问责机制；而一旦政府采购这类系统，操纵审议的攻击面也随之打开。",
        "en": "The hardest tension: a consensus statement being 'more popular' does not mean it is 'more legitimate.' There is currently no accountability mechanism governing by what right an AI mediator decides which dissenting views get written into the consensus and which get smoothed away; and once governments procure such systems, the attack surface for manipulating deliberation opens up as well."
      },
      "ifAnswered": {
        "zh": "下一步是把一次性实验变成常设公民基础设施：接入真实公民大会与地方政策流程，同时建立针对「温和霸权」（AI悄悄抹平激进立场）的可审计防线。",
        "en": "The next step is turning one-off experiments into standing civic infrastructure — plugging mediators into real citizens' assemblies and local policy processes while building auditable defenses against 'soft hegemony,' the risk of AI quietly sanding down radical positions."
      },
      "approaches": [
        {
          "zh": "把Habermas Machine从一次性实验（N=5734）推向常设公民基础设施：接入真实公民大会与地方政策流程。",
          "en": "Move the Habermas Machine from a one-off experiment (N=5,734) toward standing civic infrastructure — plugging it into real citizens' assemblies and local policy processes."
        },
        {
          "zh": "整合Google Jigsaw的Sensemaking与AI Objectives Institute的Talk to the City，形成从「倾听」到「调解」的完整审议栈。",
          "en": "Integrate Google Jigsaw's Sensemaking tools with the AI Objectives Institute's Talk to the City to form a complete deliberation stack from 'listening' to 'mediating.'"
        },
        {
          "zh": "建立针对「温和霸权」与操纵攻击的可审计防线，回应集体智能因子c能否在人机混合审议中被工程化的问题。",
          "en": "Build auditable defenses against 'soft hegemony' and manipulation attacks, addressing whether a collective-intelligence factor c can be engineered into human-AI hybrid deliberation."
        }
      ],
      "barrier": {
        "zh": "共识陈述「更受欢迎」不等于「更正当」，AI调解人凭何取舍异见目前没有可问责机制；一旦此类系统被政府采购，操纵审议的攻击面也随之打开。",
        "en": "A consensus statement being 'more popular' does not mean it is 'more legitimate'; there is no accountability mechanism governing by what right an AI mediator sets aside dissent, and once such systems are procured by governments, the attack surface for manipulating deliberation opens up as well."
      },
      "subQuestions": [
        {
          "zh": "一群个体（人、或人加AI）在什么结构条件下会真正变得「比其中最聪明的成员更聪明」，又在什么条件下塌缩为群体盲从？是否存在一个可测量的「集体智能因子 c」，像个体IQ一样稳定地预测群体表现？",
          "en": "Under what structural conditions does a group (of humans, or humans plus AI) become genuinely smarter than its smartest member, versus collapsing into herd folly — and is there a measurable collective-intelligence factor 'c' that predicts group performance as stably as individual IQ?"
        },
        {
          "zh": "当人类的知识基础设施（搜索、百科、训练语料）越来越多地由AI生成、又反过来训练下一代AI时，这个自我循环会不会导致集体知识的「模型坍缩」——多样性、真实性与稀有事实被系统性抹去？我们能否在源头上保住人类知识的「不可被合成替代」的部分？",
          "en": "As humanity's knowledge infrastructure — search, encyclopedias, training corpora — is increasingly generated by AI that then trains the next AI, does this self-loop drive a 'model collapse' of collective knowledge, systematically erasing diversity, truth, and rare facts — and can we protect the part of human knowledge that synthesis cannot replace?"
        },
        {
          "zh": "是否可能为整个文明建立一个「活的、可机读、可被对抗验证」的共享知识基础设施——让每一条断言都带着可追溯的来源与独立佐证强度，使真伪不再靠权威而靠结构判定？这样的基础设施会消除虚假信息，还是只是把权力转移给定义「来源可信」的人？",
          "en": "Could a civilization build a living, machine-readable, adversarially-verifiable shared knowledge infrastructure — where every assertion carries traceable provenance and independent-corroboration strength, so truth is settled by structure rather than authority — and would it dissolve misinformation, or merely shift power to whoever defines 'a trustworthy source'?"
        }
      ]
    },
    "literature": [
      {
        "title": "AI can help humans find common ground in democratic deliberation",
        "venue": "Science",
        "year": 2024,
        "url": "https://www.science.org/doi/10.1126/science.adq2852"
      },
      {
        "title": "Sensemaking by Jigsaw — open-source LLM tools for large-scale public input",
        "venue": "Google Jigsaw (GitHub)",
        "year": 2024,
        "url": "https://github.com/Jigsaw-Code/sensemaking-tools"
      },
      {
        "title": "Talk to the City — open-source LLM interface for collective deliberation",
        "venue": "AI Objectives Institute",
        "year": 2024,
        "url": "https://ai.objectives.institute/talk-to-the-city-1"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 945,
      "y": 504,
      "scale": 0.72
    }
  },
  {
    "id": 103,
    "atlasN": 1455,
    "slug": "electro-agriculture-and-light-free",
    "title": {
      "zh": "电力农业与无光合食物合成",
      "en": "Electro-Agriculture and Light-Free Food Synthesis"
    },
    "qfocus": {
      "zh": "如果光合作用只有约1%的能量效率，能否用「电解CO2产醋酸盐+基因改造作物」彻底绕开光合作用，在黑暗中把太阳能转化为食物？",
      "en": "If photosynthesis is only about 1% energy-efficient, can electrolyzing CO2 into acetate to feed genetically engineered crops bypass photosynthesis entirely, converting solar energy into food in the dark?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C24",
      "zh": "未来食品·农业科学",
      "en": "Future food · agricultural science"
    },
    "scores": [
      5,
      5,
      4,
      2,
      3,
      2,
      2,
      3,
      5
    ],
    "citation": {
      "url": "https://doi.org/10.1016/j.joule.2024.09.011",
      "title": "Electro-agriculture: Revolutionizing farming for a sustainable future",
      "venue": "Joule",
      "year": 2024
    },
    "brief": {
      "zh": "电力农业由UC Riverside的Robert Jinkerson与华盛顿大学的Feng Jiao在2024年《Joule》展望论文中正式命名：用太阳能电解CO2与水生成醋酸盐，喂给作物作为碳源与能源。其实验基础——2022年《Nature Food》的无机-生物混合系统——已证明藻类、酵母、蘑菇乃至作物幼苗可在完全无光下靠醋酸盐生长，生物量能效约为光合的4倍。",
      "en": "Electro-agriculture was formally named by UC Riverside's Robert Jinkerson and University of Washington electrochemist Feng Jiao in a 2024 Joule perspective paper: solar power electrolyzes CO2 and water into acetate, fed to crops as a carbon and energy source. Its experimental basis — a 2022 Nature Food hybrid inorganic-biological system — already showed algae, yeast, mushrooms, and even crop seedlings can grow on acetate in complete darkness, with biomass efficiency about four times that of photosynthesis."
    },
    "depth": {
      "overview": {
        "zh": "如果光合作用只有约1%的能量效率，为什么不干脆换掉它？一群生物工程师正用「电+二氧化碳」在黑暗里种菜。",
        "en": "If photosynthesis is only about 1% energy-efficient, why not simply replace it? A group of bioengineers are growing food in the dark using 'electricity plus carbon dioxide.'"
      },
      "whyMatters": {
        "zh": "最硬的坎在把「能吃醋酸盐」从生菜番茄推到高热量主粮——需重启一条被关闭的乙醛酸循环并让整株植物脱离光照供能，目前仍是实验室早期，尚无上市食物。",
        "en": "The hardest hurdle is pushing 'eating acetate' from lettuce and tomatoes to calorie-dense staple crops — which requires reactivating a shut-down glyoxylate cycle and freeing the entire plant from light-based energy supply; the work is still at an early lab stage, with no food on the market yet."
      },
      "ifAnswered": {
        "zh": "下一步是把只靠醋酸盐供能的主粮作物（木薯、红薯、谷物）跑通，让整栋楼在暗处产粮。",
        "en": "Next is engineering staple crops (cassava, sweet potato, grains) that live entirely on acetate, letting whole buildings grow calories in the dark."
      },
      "approaches": [
        {
          "zh": "把电解CO2产醋酸盐的路径从生菜、番茄等模式作物，推向木薯、红薯、谷物等高热量主粮。",
          "en": "Extend the CO2-electrolysis-to-acetate pathway from model crops like lettuce and tomato to calorie-dense staples such as cassava, sweet potato, and grains."
        },
        {
          "zh": "验证无光合食物合成能否让粮食生产脱离土地与气候约束，呼应「能否凭空合成营养完整食物」的集群问题。",
          "en": "Test whether light-free food synthesis can decouple food production from land and climate constraints, echoing the cluster question of whether nutritionally complete food can be synthesized 'out of thin air.'"
        },
        {
          "zh": "评估电力农业若规模化，是否会像现代主粮育种一样把粮食系统压缩到少数品种上，加剧遗传同质化风险。",
          "en": "Assess whether scaled-up electro-agriculture would, like modern staple-crop breeding, funnel the food system onto a few varieties and worsen genetic-homogenization risk."
        }
      ],
      "barrier": {
        "zh": "核心难点是把「吃醋酸盐」的能力从叶菜类推广到高热量主粮，这需要重新激活植物体内已关闭的乙醛酸循环，并让整株作物完全脱离光照供能——目前仍处实验室早期阶段，尚无实际上市的食物产品。",
        "en": "The core difficulty is extending the ability to 'eat acetate' from leafy greens to calorie-dense staples, which requires reactivating the plant's shut-down glyoxylate cycle and freeing the whole crop from light-based energy — the work remains at an early lab stage, with no commercial food product yet."
      },
      "subQuestions": [
        {
          "zh": "在不毁掉地球生命支持系统的前提下，地球到底能可持续养活多少人、以什么样的饮食？是否存在一组「行星边界内的安全饮食空间」，让营养充足与生态可持续同时成立——还是这两者在物理上根本无法兼得？",
          "en": "Within the limits of Earth's life-support systems, how many people can the planet sustainably feed, and on what diet? Is there a 'safe operating space' of diets that is simultaneously nutritionally adequate and ecologically sustainable — or are the two physically irreconcilable?"
        },
        {
          "zh": "我们能否绕开整株植物与整头牲畜，直接从二氧化碳、氢、电与微生物「凭空」合成出营养完整的食物，让粮食生产彻底脱离土地与气候？如果可行，把农业从光合作用中解放出来，对生态、地缘与人类与自然的关系意味着什么？",
          "en": "Can we bypass whole crops and livestock entirely and synthesize nutritionally complete food essentially from CO2, hydrogen, electricity, and microbes — decoupling food production from land and climate altogether? If so, what would freeing agriculture from photosynthesis mean for ecology, geopolitics, and humanity's relationship with nature?"
        },
        {
          "zh": "现代育种与农业把全球粮食日益压缩到极少数高产作物与品种上——这种遗传同质化是否在不知不觉中把人类文明绑在一个脆弱的单点上？我们能否在追求产量的同时，系统性地保住作物多样性这道抵御未知病害与气候冲击的「保险」？",
          "en": "Modern breeding and agriculture increasingly funnel the world's food onto a tiny set of high-yield crops and varieties — is this genetic homogenization quietly binding civilization to a single fragile point of failure? Can we pursue yield while systematically preserving crop diversity as insurance against unknown pests and climate shocks?"
        }
      ]
    },
    "literature": [
      {
        "title": "Electro-agriculture: Revolutionizing farming for a sustainable future",
        "venue": "Joule",
        "year": 2024,
        "url": "https://doi.org/10.1016/j.joule.2024.09.011"
      },
      {
        "title": "A hybrid inorganic-biological artificial photosynthesis system for energy-efficient food production",
        "venue": "Nature Food",
        "year": 2022,
        "url": "https://doi.org/10.1038/s43016-022-00530-x"
      },
      {
        "title": "With 'electro-agriculture,' plants can produce food in the dark and with 94% less land, bioengineers say",
        "venue": "Phys.org",
        "year": 2024,
        "url": "https://phys.org/news/2024-10-electro-agriculture-food-dark-bioengineers.html"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 707,
      "y": 204,
      "scale": 0.79
    }
  },
  {
    "id": 104,
    "atlasN": 1459,
    "slug": "animal-free-drug-safety-science",
    "title": {
      "zh": "无动物药物安全评估（新方法学 NAMs）",
      "en": "Animal-Free Drug Safety Science (New Approach Methodologies)"
    },
    "qfocus": {
      "zh": "能否用人源类器官、器官芯片、体外免疫原性测定与 in-silico/AI 毒性模型的组合，可靠地替代动物实验，预测药物在人体内的毒性与免疫原性？",
      "en": "Can a stack of human organoids, organ-chips, in-vitro immunogenicity assays, and in-silico/AI toxicity models reliably replace animal experiments in predicting a drug's toxicity and immunogenicity in humans?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C25",
      "zh": "开放精准健康·长寿",
      "en": "Open precision health · longevity"
    },
    "scores": [
      5,
      5,
      5,
      2,
      3,
      2,
      4,
      3,
      3
    ],
    "citation": {
      "url": "https://www.fda.gov/news-events/press-announcements/fda-announces-plan-phase-out-animal-testing-requirement-monoclonal-antibodies-and-other-drugs",
      "title": "FDA Announces Plan to Phase Out Animal Testing Requirement for Monoclonal Antibodies and Other Drugs",
      "venue": "U.S. FDA press announcement",
      "year": 2025
    },
    "brief": {
      "zh": "新方法学（NAMs）用人源类器官、器官芯片、体外免疫原性测定与 in-silico/AI 毒性模型组合，替代动物实验来预测药物毒性与免疫原性，把\"用小鼠猜人\"改成\"用人体相关模型直接读人\"。若跨实验室验证与开放毒性数据库到位，3–5 年内动物实验将从\"默认\"退为\"例外\"。",
      "en": "New Approach Methodologies (NAMs) replace animal experiments with a stack of human organoids, organ-chips, in-vitro immunogenicity assays, and in-silico/AI toxicity models to predict drug toxicity and immunogenicity — swapping 'guessing humans from mice' for reading human-relevant systems directly. If cross-lab validation and open toxicity databases mature, within 3–5 years animal studies could become the exception rather than the default."
    },
    "depth": {
      "overview": {
        "zh": "2025 年 4 月，FDA 发布路线图，宣布先从单克隆抗体开始、用新方法学（NAMs）逐步取代临床前动物毒理——这是几十年来药物安全范式的一次真实转向，而非又一个体外小工具。",
        "en": "In April 2025, the FDA released a roadmap announcing it would start with monoclonal antibodies and progressively replace preclinical animal toxicology with New Approach Methodologies (NAMs) — a genuine turn in the decades-old drug-safety paradigm, not just another in-vitro gadget."
      },
      "whyMatters": {
        "zh": "最硬的张力在\"验证\"：怎么证明一堆器官芯片+AI 模型合起来真比小鼠更能预测人体不良反应？缺乏跨实验室可复现的金标准基准，是它能否从政策口号落到审评实践的关键卡点。",
        "en": "The hardest tension is validation: how do you prove that a stack of organ-chips plus AI models genuinely predicts human adverse reactions better than mice? The absence of a cross-lab-reproducible gold-standard benchmark is the key blocker standing between policy slogan and regulatory practice."
      },
      "ifAnswered": {
        "zh": "若跨实验室验证与开放毒性数据库到位，3–5 年内动物实验将从\"默认\"退为\"例外\"。",
        "en": "If cross-lab validation and open toxicity databases mature, within 3–5 years animal studies would become the exception rather than the default."
      },
      "approaches": [
        {
          "zh": "监管路径先行落地：FDA 2025 年路线图先在单克隆抗体上试点，鼓励在 IND 申报中提交 NAMs 数据，为逐步扩围铺路。",
          "en": "Regulatory path leads the way: the FDA's 2025 roadmap pilots on monoclonal antibodies first and encourages submitting NAMs data in IND filings, paving the way for gradual expansion."
        },
        {
          "zh": "技术栈组合：把人源类器官、器官芯片、体外免疫原性测定与 in-silico/AI 毒性模型拼成一条不依赖动物的评估链。",
          "en": "Technology-stack combination: assembling human organoids, organ-chips, in-vitro immunogenicity assays, and in-silico/AI toxicity models into one animal-free assessment chain."
        },
        {
          "zh": "从立法授权走向验证标准化：接续 2022 年 FDA Modernization Act 2.0 的授权，把重心从\"允许使用\"推向\"如何验证与标准化\"，2026 年 npj Digital Medicine 的论文进一步把数字孪生纳入 NAMs 生态。",
          "en": "From legislative authorization to validation standardization: building on the 2022 FDA Modernization Act 2.0's authorization, shifting the focus from 'permission to use' toward 'how to validate and standardize' — a 2026 npj Digital Medicine paper further folds digital twins into the NAMs ecosystem."
        }
      ],
      "barrier": {
        "zh": "最硬的张力在\"验证\"：怎么证明一堆器官芯片+AI 模型合起来真比小鼠更能预测人体不良反应？缺乏跨实验室可复现的金标准基准，是它能否从政策口号落到审评实践的关键卡点。",
        "en": "The hardest tension is validation: how do you prove that a stack of organ-chips plus AI models genuinely predicts human adverse reactions better than mice? The absence of a cross-lab-reproducible gold-standard benchmark is the key blocker standing between policy slogan and regulatory practice."
      },
      "subQuestions": [
        {
          "zh": "衰老本身是否是一种「可干预的根本过程」——存在一组共同的分子驱动因素（hallmarks），调控它们就能同时延缓多种年龄相关疾病？还是说衰老只是无数独立损耗的统计叠加，根本没有可被单点撬动的「总开关」？",
          "en": "Is aging itself a single intervenable root process — a common set of molecular drivers (hallmarks) whose modulation could simultaneously delay many age-related diseases — or is it merely the statistical sum of countless independent forms of wear with no master switch to pull?"
        },
        {
          "zh": "如果每个人的健康都被连续测量（多组学、可穿戴、个人病史）并开放给本人与研究，「精准健康」会让我们第一次能在症状出现前数年就预测并逆转个体的疾病轨迹吗？还是说人体复杂到，再多的个人数据也无法把健康变成可预测、可控制的工程问题？",
          "en": "If each person's health is continuously measured (multi-omics, wearables, full personal history) and made open to themselves and research, will 'precision health' for the first time let us predict and reverse an individual's disease trajectory years before symptoms? Or is the human body so complex that no amount of personal data can turn health into a predictable, controllable engineering problem?"
        },
        {
          "zh": "细胞重编程已能在体外把成体细胞「调回」年轻状态——那么衰老在多大程度上是可逆的？我们能否在不抹去细胞身份、不诱发癌症的前提下，在活体内部分回拨生物年龄？「衰老是一种可被重写的信息状态」这一假设到底成不成立？",
          "en": "Cellular reprogramming can reset adult cells toward a younger state in vitro — so to what extent is aging reversible? Can we partially turn back biological age inside a living body without erasing cell identity or triggering cancer? Does the hypothesis that 'aging is a rewritable information state' actually hold?"
        }
      ]
    },
    "literature": [
      {
        "title": "FDA Announces Plan to Phase Out Animal Testing Requirement for Monoclonal Antibodies and Other Drugs",
        "venue": "U.S. FDA press announcement",
        "year": 2025,
        "url": "https://www.fda.gov/news-events/press-announcements/fda-announces-plan-phase-out-animal-testing-requirement-monoclonal-antibodies-and-other-drugs"
      },
      {
        "title": "Advancing FDA New Approach Methodologies from animal models through digital twins",
        "venue": "npj Digital Medicine",
        "year": 2026,
        "url": "https://www.nature.com/articles/s41746-026-02476-x"
      },
      {
        "title": "New Approach Methodologies (NAMs)",
        "venue": "U.S. FDA",
        "year": 2025,
        "url": "https://www.fda.gov/science-research/science-and-research-special-topics/new-approach-methodologies-nams"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 788,
      "y": 367,
      "scale": 0.87
    }
  },
  {
    "id": 105,
    "atlasN": 405,
    "slug": "aging-biology-and-longevity-science",
    "title": {
      "zh": "衰老生物学与长寿科学",
      "en": "Aging Biology and Longevity Science"
    },
    "qfocus": {
      "zh": "衰老是否是一个由细胞衰老、端粒损耗、表观遗传漂移、线粒体功能障碍等可识别「标志」驱动、因而可被药物干预的过程——而不是不可逆的自然宿命？",
      "en": "Is aging a process driven by identifiable 'hallmarks' — cellular senescence, telomere attrition, epigenetic drift, mitochondrial dysfunction — and therefore open to drug intervention, rather than an irreversible natural fate?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C25",
      "zh": "开放精准健康·长寿",
      "en": "Open precision health · longevity"
    },
    "scores": [
      5,
      4,
      4,
      2,
      4,
      2,
      2,
      2,
      2
    ],
    "citation": {
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12259695/",
      "title": "Targeting the hallmarks of aging: mechanisms and therapeutic opportunities",
      "venue": "Signal Transduction and Targeted Therapy",
      "year": 2025
    },
    "brief": {
      "zh": "衰老生物学把衰老当作由细胞衰老、端粒损耗、表观遗传漂移、线粒体功能障碍等可识别「衰老标志」驱动、因而可干预的过程，探索 senolytics 清除衰老细胞、雷帕霉素、二甲双胍（TAME 试验）等候选干预，目标是延长「健康寿命」而非单纯延长寿命。",
      "en": "Aging biology treats aging as a process driven by identifiable hallmarks — cellular senescence, telomere attrition, epigenetic drift, mitochondrial dysfunction — and therefore interventable, exploring candidates such as senolytics that clear senescent cells, rapamycin, and metformin (the TAME trial), aiming to extend healthspan rather than merely lifespan."
    },
    "depth": {
      "overview": {
        "zh": "衰老生物学不再把衰老看作不可逆的自然结果，而是当作由细胞衰老、端粒损耗、表观遗传漂移、线粒体功能障碍等可识别「标志」驱动、因而可干预的生物过程。它融合分子生物学、医学与大数据，目标是延长健康寿命而非单纯延长寿命。",
        "en": "Aging biology no longer sees aging as an irreversible natural outcome but as a biological process driven by identifiable 'hallmarks' — cellular senescence, telomere attrition, epigenetic drift, mitochondrial dysfunction — and therefore interventable. Merging molecular biology, medicine, and big data, its goal is to extend healthspan rather than merely lifespan."
      },
      "whyMatters": {
        "zh": "领域最大风险是衰老缺乏被监管机构认可的「疾病」终点，导致延寿药难以做临床试验、难以审批；同时高调融资与名人加持已让这里成为科学与炒作高度混杂的地带。",
        "en": "The field's biggest risk is that aging lacks a regulator-recognized 'disease' endpoint, making life-extension drugs hard to trial and approve; meanwhile, high-profile funding and celebrity endorsement have made this a zone where science and hype are heavily mixed."
      },
      "ifAnswered": {
        "zh": "若衰老能被证明是可干预的共同过程并跨越监管终点障碍，可能出现首批真正意义上的延寿干预。",
        "en": "If aging can be shown to be a shared intervenable process that clears the regulatory-endpoint barrier, the first genuine life-extending interventions may emerge."
      },
      "approaches": [
        {
          "zh": "靶向已识别的衰老标志：清除衰老细胞的 senolytics、雷帕霉素、二甲双胍（TAME 试验）等候选干预。",
          "en": "Targeting identified hallmarks of aging: candidate interventions like senolytics that clear senescent cells, rapamycin, and metformin (the TAME trial)."
        },
        {
          "zh": "追问是否存在统一可撬动的衰老「总开关」：部分动物实验（雷帕霉素、衰老细胞清除）支持存在共同分子驱动因素，但人类是否有一个可撬动的统一过程仍未定论。",
          "en": "Asking whether a single liftable 'master switch' for aging exists: some animal studies (rapamycin, senolytic clearance) support shared molecular drivers, but whether humans have one unified, liftable process remains undetermined."
        },
        {
          "zh": "结合精准健康的连续测量：多组学、可穿戴设备与个人病史的持续追踪，试图在症状出现前数年发现并干预衰老相关的疾病轨迹。",
          "en": "Pairing with continuous precision-health measurement: multi-omics, wearables, and full personal history tracking to try to detect and intervene on aging-related disease trajectories years before symptoms."
        }
      ],
      "barrier": {
        "zh": "领域最大风险是衰老缺乏被监管机构认可的「疾病」终点，导致延寿药难以做临床试验、难以审批；同时高调融资与名人加持已让这里成为科学与炒作高度混杂的地带。",
        "en": "The field's biggest risk is that aging lacks a regulator-recognized 'disease' endpoint, making life-extension drugs hard to trial and approve; meanwhile, high-profile funding and celebrity endorsement have made this a zone where science and hype are heavily mixed."
      },
      "subQuestions": [
        {
          "zh": "衰老本身是否是一种「可干预的根本过程」——存在一组共同的分子驱动因素（hallmarks），调控它们就能同时延缓多种年龄相关疾病？还是说衰老只是无数独立损耗的统计叠加，根本没有可被单点撬动的「总开关」？",
          "en": "Is aging itself a single intervenable root process — a common set of molecular drivers (hallmarks) whose modulation could simultaneously delay many age-related diseases — or is it merely the statistical sum of countless independent forms of wear with no master switch to pull?"
        },
        {
          "zh": "如果每个人的健康都被连续测量（多组学、可穿戴、个人病史）并开放给本人与研究，「精准健康」会让我们第一次能在症状出现前数年就预测并逆转个体的疾病轨迹吗？还是说人体复杂到，再多的个人数据也无法把健康变成可预测、可控制的工程问题？",
          "en": "If each person's health is continuously measured (multi-omics, wearables, full personal history) and made open to themselves and research, will 'precision health' for the first time let us predict and reverse an individual's disease trajectory years before symptoms? Or is the human body so complex that no amount of personal data can turn health into a predictable, controllable engineering problem?"
        },
        {
          "zh": "细胞重编程已能在体外把成体细胞「调回」年轻状态——那么衰老在多大程度上是可逆的？我们能否在不抹去细胞身份、不诱发癌症的前提下，在活体内部分回拨生物年龄？「衰老是一种可被重写的信息状态」这一假设到底成不成立？",
          "en": "Cellular reprogramming can reset adult cells toward a younger state in vitro — so to what extent is aging reversible? Can we partially turn back biological age inside a living body without erasing cell identity or triggering cancer? Does the hypothesis that 'aging is a rewritable information state' actually hold?"
        }
      ]
    },
    "literature": [
      {
        "title": "Targeting the hallmarks of aging: mechanisms and therapeutic opportunities",
        "venue": "Signal Transduction and Targeted Therapy",
        "year": 2025,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12259695/"
      },
      {
        "title": "Targeting ageing with rapamycin and its derivatives in humans: a systematic review",
        "venue": "The Lancet Healthy Longevity",
        "year": 2023,
        "url": "https://www.thelancet.com/journals/lanhl/article/PIIS2666-7568(23)00258-1/fulltext"
      },
      {
        "title": "Targeting Senescence: A Review of Senolytics and Senomorphics in Anti-Aging Interventions",
        "venue": "Biomolecules (MDPI)",
        "year": 2025,
        "url": "https://www.mdpi.com/2218-273X/15/6/860"
      },
      {
        "title": "A Critical Review of the Evidence That Metformin Is a Putative Anti-Aging Drug That Enhances Healthspan and Extends Lifespan",
        "venue": "Frontiers in Endocrinology",
        "year": 2021,
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8374068/"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 765,
      "y": 293,
      "scale": 0.9
    }
  },
  {
    "id": 106,
    "atlasN": 1427,
    "slug": "digitizing-olfaction-and-the-principal",
    "title": {
      "zh": "嗅觉数字化与主气味图谱",
      "en": "Digitizing Olfaction and the Principal Odor Map"
    },
    "qfocus": {
      "zh": "能否用图神经网络把分子结构直接映射到人类闻到的气味描述，建立一张连续、可计算的「主气味图谱」，让嗅觉像视觉听觉一样被数字化？",
      "en": "Can graph neural networks map molecular structure directly onto the odor descriptions humans perceive, building a continuous, computable 'principal odor map' that digitizes smell the way vision and hearing already have been?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C26",
      "zh": "感官界面·跨物种",
      "en": "Sensory interfaces · cross-species"
    },
    "scores": [
      5,
      4,
      4,
      3,
      4,
      3,
      4,
      3,
      4
    ],
    "citation": {
      "url": "https://www.science.org/doi/10.1126/science.ade4401",
      "title": "A principal odor map unifies diverse tasks in human olfactory perception",
      "venue": "Science",
      "year": 2023
    },
    "brief": {
      "zh": "嗅觉数字化用图神经网络把分子结构直接映射到人类闻到的气味描述，建立一张连续的「主气味图谱」（POM），让机器在部分任务上比人更准地预测「这闻起来像什么」——嗅觉是最后一个尚未被数字化的感官。",
      "en": "Digitizing olfaction uses graph neural networks to map molecular structure straight onto the odor words humans perceive, building a continuous 'principal odor map' (POM) on which machines outpredict people on some smell-labeling tasks — smell is the last human sense not yet digitized."
    },
    "depth": {
      "overview": {
        "zh": "视觉和听觉早已数字化，唯独嗅觉没有一张「色轮」。2023 年 Osmo 的《Science》主气味图谱第一次把分子结构和气味感知对齐，开启感官的数字化。",
        "en": "Vision and hearing were digitized long ago; only smell has never had a 'color wheel'. Osmo's 2023 Science paper on the principal odor map first aligned molecular structure with odor perception, opening the door to digitizing this sense."
      },
      "whyMatters": {
        "zh": "最硬的难点：嗅觉没有物理连续轴（不像波长/频率），基态真值依赖训练有素的人类嗅辨小组，数据稀缺且主观；分子—受体—感知之间的组合编码至今是黑箱。",
        "en": "The hardest difficulty: smell has no physical continuous axis (unlike wavelength or frequency); ground truth depends on trained human panels, so data is scarce and subjective; the combinatorial code linking molecule, receptor, and perception remains a black box."
      },
      "ifAnswered": {
        "zh": "走向「气味可搜索、可合成」：从分子反推目标气味、给跨受体组合编码建模，乃至「数字化传送」香气与嗅觉数字健康标志物。",
        "en": "Heading toward searchable, synthesizable scent: designing molecules to hit a target odor, modeling combinatorial receptor codes, and eventually 'teleporting' aromas and using olfaction as a digital-health biomarker."
      },
      "approaches": [
        {
          "zh": "用图神经网络训练主气味图谱（POM），把分子结构对齐到人类气味描述，在描述任务上超过普通人类评审（2023 Science）。",
          "en": "Training a principal odor map (POM) with graph neural networks that align molecular structure to human odor descriptions, outperforming ordinary human raters on labeling tasks (2023 Science)."
        },
        {
          "zh": "扩大规模化多模态数据集：2025 年「New York Smells」数据集把这条线推向规模化，逼近感官数字化所需的数据量级。",
          "en": "Scaling up multimodal datasets: the 2025 'New York Smells' dataset pushes this line toward the scale needed for full sensory digitization."
        },
        {
          "zh": "借鉴跨感官/跨物种迁移的思路：类比感觉替代实验中大脑吸收新信息流的方式，探索机器能否读出、乃至合成人类尚未命名的气味维度。",
          "en": "Drawing on cross-sense/cross-species transfer: by analogy with how the brain absorbs new information streams in sensory-substitution experiments, exploring whether machines can read out — or even synthesize — odor dimensions humans have never named."
        }
      ],
      "barrier": {
        "zh": "最硬的难点：嗅觉没有物理连续轴（不像波长/频率），基态真值依赖训练有素的人类嗅辨小组，数据稀缺且主观；分子—受体—感知之间的组合编码至今是黑箱。",
        "en": "The hardest difficulty: smell has no physical continuous axis (unlike wavelength or frequency); ground truth depends on trained human panels, so data is scarce and subjective; the combinatorial code linking molecule, receptor, and perception remains a black box."
      },
      "subQuestions": [
        {
          "zh": "成年人脑能否真正学会一种全新的感官——比如直接「感觉到」磁场、红外、或地理方位——并让它像视觉听觉一样被无缝整合进意识体验？大脑对新感官的可塑性到底有没有上限，这个上限由什么决定？",
          "en": "Can an adult human brain truly learn an entirely new sense — to directly 'feel' magnetic fields, infrared, or compass direction — and integrate it into conscious experience as seamlessly as sight or hearing? Is there a ceiling on the brain's plasticity for new senses, and what sets it?"
        },
        {
          "zh": "其他动物（蝙蝠、章鱼、鸟类、蜜蜂）的主观感官世界——它们「像什么」——是否原则上可被人类部分进入或翻译，还是说每个物种的感官界面在本质上对外封闭，永远无法被跨越？",
          "en": "Are the subjective sensory worlds of other animals — bats, octopuses, birds, bees — what it is like to be them — in principle partially enterable or translatable by humans, or is each species' sensory interface essentially closed, forever uncrossable?"
        },
        {
          "zh": "我们能否解码并双向「翻译」另一物种的交流系统——比如真正与抹香鲸或灵长类对话，理解并被理解？动物的发声里到底有没有可与人类语言通约的「语义」与「语法」，还是我们只是在把人类的语言结构投射到本质不同的信号上？",
          "en": "Can we decode and bidirectionally 'translate' another species' communication system — genuinely conversing with sperm whales or primates, understanding and being understood? Do animal vocalizations actually contain 'semantics' and 'grammar' commensurable with human language, or are we merely projecting human linguistic structure onto fundamentally different signals?"
        }
      ]
    },
    "literature": [
      {
        "title": "A principal odor map unifies diverse tasks in human olfactory perception",
        "venue": "Science",
        "year": 2023,
        "url": "https://www.science.org/doi/10.1126/science.ade4401"
      },
      {
        "title": "A principal odor map unifies diverse tasks in human olfactory perception (full text)",
        "venue": "PMC",
        "year": 2023,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11898014/"
      },
      {
        "title": "New York Smells: A Large Multimodal Dataset for Olfaction",
        "venue": "arXiv",
        "year": 2025,
        "url": "https://arxiv.org/abs/2511.20544"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 794,
      "y": 532,
      "scale": 0.91
    }
  },
  {
    "id": 107,
    "atlasN": 1334,
    "slug": "interactive-molecular-dynamics-in-vr",
    "title": {
      "zh": "具身分子动力学：VR 中用手操控实时模拟",
      "en": "Interactive Molecular Dynamics in VR: Hand-Steered Real-Time Simulation"
    },
    "qfocus": {
      "zh": "研究者能否用双手在 VR 中直接操控活的分子动力学模拟，让空间直觉在统计意义上比自动采样更快找到有意义的构象——而不只是让科研「看起来好玩」？",
      "en": "Can researchers, by physically grabbing a live molecular-dynamics simulation in VR, use spatial intuition to find meaningful conformations faster than automated sampling in a statistically real sense — not merely make science 'feel fun'?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C27",
      "zh": "科学·艺术·设计融合",
      "en": "Science · art · design fusion"
    },
    "scores": [
      4,
      4,
      5,
      3,
      3,
      2,
      4,
      4,
      3
    ],
    "citation": {
      "url": "https://www.science.org/doi/10.1126/sciadv.aat2731",
      "title": "Sampling molecular conformations and dynamics in a multiuser virtual reality framework",
      "venue": "Science Advances",
      "year": 2018
    },
    "brief": {
      "zh": "具身分子动力学（iMD-VR）让研究者戴上 VR 头显、用双手直接「抓住」正在运行的分子动力学模拟，实时施力、拉动、引导蛋白质折叠或配体入位，把分子科学从「离线跑批、事后看图」变成「在三维原生空间里协作操纵活的模拟」。",
      "en": "Interactive molecular dynamics in VR (iMD-VR) lets researchers put on a headset and physically grab a live molecular-dynamics simulation with their hands — applying forces in real time to pull, fold, or dock molecules — turning molecular science from 'run offline, inspect plots later' into collaboratively steering a living simulation in its native 3-D space."
    },
    "depth": {
      "overview": {
        "zh": "蛋白质折叠不再是屏幕上一段渲染动画，而是你伸手就能拽住、和异地同事在同一个虚拟空间里较劲的活物。具身分子动力学让人用身体的空间直觉参与本来纯靠算力的模拟。",
        "en": "Protein folding is no longer a rendered animation on a screen — it's something you can reach out and grab, contesting it with a remote colleague inside the same virtual space. Embodied molecular dynamics lets people bring the body's spatial intuition into simulations that used to run on pure computation alone."
      },
      "whyMatters": {
        "zh": "最硬的难点：人手引导能否在统计意义上比自动采样更快找到有意义的构象，而不只是「好玩」？且它绑定 VR 头显与 GPU 算力，晕动症与设备门槛限制了大规模普及。",
        "en": "The hardest difficulty: can hand-guidance statistically find meaningful conformations faster than automated sampling, rather than merely being 'fun'? It's also tied to VR headsets and GPU compute, and motion sickness plus equipment barriers limit large-scale adoption."
      },
      "ifAnswered": {
        "zh": "随着开源 NanoVer 把多用户、分布式协作标准化，方向正走向「云端物理引擎 + 轻头显 + 机器学习势能面」的实时协作科研工作台。",
        "en": "With open-source NanoVer standardizing multi-user, distributed collaboration, it is heading toward a real-time collaborative research bench: cloud physics engine plus lightweight headset plus machine-learned potential-energy surfaces."
      },
      "approaches": [
        {
          "zh": "2018 年 Science Advances 论文已验证可证伪价值：受试者用 VR 完成分子穿环、打结等任务比鼠标键盘更快。",
          "en": "The 2018 Science Advances paper already validated its falsifiable value: subjects in VR completed molecular threading and knot-tying tasks faster than with mouse and keyboard."
        },
        {
          "zh": "2025 年团队发表开源 NanoVer Server（Narupa 的继任者），把实时多用户、异地协作的 iMD-VR 标准化为 Python 包，应用覆盖蛋白-配体结合、反应网络发现、材料催化与教学。",
          "en": "In 2025 the team published the open-source NanoVer Server (successor to Narupa), standardizing real-time, multi-user, remote-collaborative iMD-VR into a Python package, with applications spanning protein-ligand binding, reaction-network discovery, materials catalysis, and teaching."
        },
        {
          "zh": "作为已落地、有基准、可复用的科研基础设施，它依赖头显与算力，方向正走向云端物理引擎 + 轻头显 + 机器学习势能面的协作工作台。",
          "en": "As a deployed, benchmarked, reusable piece of research infrastructure, it depends on headsets and compute, and is heading toward a collaborative bench combining a cloud physics engine, lightweight headset, and machine-learned potential-energy surfaces."
        }
      ],
      "barrier": {
        "zh": "最硬的难点：人手引导能否在统计意义上比自动采样更快找到有意义的构象，而不只是「好玩」？且它绑定 VR 头显与 GPU 算力，晕动症与设备门槛限制了大规模普及。",
        "en": "The hardest difficulty: can hand-guidance statistically find meaningful conformations faster than automated sampling, rather than merely being 'fun'? It's also tied to VR headsets and GPU compute, and motion sickness plus equipment barriers limit large-scale adoption."
      },
      "subQuestions": [
        {
          "zh": "为什么人类会对某些形式、声音和比例产生「美」的体验？审美偏好究竟是大脑信息处理效率的副产品，还是一种独立的、不能还原为认知或情绪的心智维度？",
          "en": "Why do humans experience certain forms, sounds, and proportions as beautiful — is aesthetic preference a byproduct of the brain's processing efficiency, or an irreducible dimension of mind that cannot be reduced to cognition or emotion?"
        },
        {
          "zh": "当生成式 AI 能在毫秒内产出无穷多张「合格」的图像与设计时，人类创作中那个不可外包的内核——如果存在的话——究竟是什么？「创造性」是否有一个机器原则上无法跨越的边界？",
          "en": "When generative AI can produce infinitely many 'competent' images and designs in milliseconds, what — if anything — is the irreducible human core of creation that cannot be outsourced, and does 'creativity' have a boundary that machines cannot in principle cross?"
        },
        {
          "zh": "数学家口中的「优雅」、物理学家追求的「美」，是否真的是通往真理的可靠向导？还是说，对简洁与对称的审美偏好，正在系统性地把整个理论物理引向歧途？",
          "en": "Is the 'elegance' mathematicians invoke and the 'beauty' physicists chase actually a reliable guide to truth — or has aesthetic preference for simplicity and symmetry been systematically leading theoretical physics astray?"
        }
      ]
    },
    "literature": [
      {
        "title": "NanoVer Server: A Python Package for Serving Real-Time Multi-User Interactive Molecular Dynamics in Virtual Reality",
        "venue": "Journal of Open Source Software",
        "year": 2025,
        "url": "https://joss.theoj.org/papers/10.21105/joss.08118.pdf"
      },
      {
        "title": "Sampling molecular conformations and dynamics in a multiuser virtual reality framework",
        "venue": "Science Advances",
        "year": 2018,
        "url": "https://www.science.org/doi/10.1126/sciadv.aat2731"
      },
      {
        "title": "nanover-server-py: Interactive Molecular Dynamics (iMD) in VR",
        "venue": "GitHub (IRL2)",
        "year": 2025,
        "url": "https://github.com/IRL2/nanover-server-py"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 763,
      "y": 755,
      "scale": 0.91
    }
  },
  {
    "id": 108,
    "atlasN": 1337,
    "slug": "ai-mediated-deliberation-and-consensus",
    "title": {
      "zh": "AI居间协商与共识机器",
      "en": "AI-Mediated Deliberation and Consensus Machines"
    },
    "qfocus": {
      "zh": "训练出的 LLM 协商中介，能否把个体分歧观点迭代聚合成比人类调解人更受认可、且可测量地缩小群体分歧的共同立场声明？",
      "en": "Can an LLM trained as a deliberation mediator iteratively aggregate individual, divergent opinions into a common-ground statement that is more widely endorsed than one written by human mediators, and measurably narrows group disagreement?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C27",
      "zh": "科学·艺术·设计融合",
      "en": "Science · art · design fusion"
    },
    "scores": [
      4,
      4,
      4,
      4,
      2,
      3,
      3,
      3,
      3
    ],
    "citation": {
      "url": "https://www.science.org/doi/10.1126/science.adq2852",
      "title": "AI can help humans find common ground in democratic deliberation",
      "venue": "Science",
      "year": 2024
    },
    "brief": {
      "zh": "AI 居间协商训练 LLM 充当协商中介：聚合个体观点与批评，迭代生成最大化群体认同的共同立场声明，用于气候、AI 治理等科学争议议题的公众协商——DeepMind 的「哈贝马斯机器」在《Science》给出首个大样本证据。",
      "en": "AI-mediated deliberation trains LLMs as mediators that aggregate individual opinions and critiques into iteratively refined common-ground statements for public deliberation on contested science issues like climate and AI governance — DeepMind's 'Habermas Machine' delivered the first large-sample evidence in Science."
    },
    "depth": {
      "overview": {
        "zh": "在 5000 多名英国参与者的实验里，AI 撰写的群体共同立场声明比人类调解人写的更受各方认可，还让分歧群体的立场可测量地靠近——机器第一次在「找共识」这件事上超过了人。",
        "en": "In an experiment with over 5,000 UK participants, the AI-written group common-ground statement was more endorsed by all sides than one written by human mediators, and measurably narrowed the positions of divided groups — the first time a machine has outperformed humans at 'finding consensus'."
      },
      "whyMatters": {
        "zh": "最硬的争议：流畅折中的共识声明可能算法性地抹平少数派立场，且哈贝马斯机器优化的是「群体认同度」而非论证质量——一个可以被巧妙措辞游戏化的目标函数；把它接入真实科技政策还要过合法性这一关。",
        "en": "The hardest controversy: a fluently compromised consensus statement may algorithmically flatten minority positions, and the Habermas Machine optimizes for 'group approval' rather than argument quality — an objective function that clever wording can game; wiring it into real science policy still has to clear the legitimacy test."
      },
      "ifAnswered": {
        "zh": "走向科学争议议题的常设混合协商基础设施——AI 居间的市民评审团嵌入科技政策咨询流程，与 Deliberative Polling 传统合流。",
        "en": "Heading toward standing hybrid deliberation infrastructure for contested science — AI-mediated citizen panels embedded in science-policy consultation, merging with the Deliberative Polling tradition."
      },
      "approaches": [
        {
          "zh": "DeepMind 的「哈贝马斯机器」：LLM 中介聚合个体意见与批评、迭代生成群体共同立场声明，2024 年在 Science 发表，数千名参与者实验中比人类调解人更受认可。",
          "en": "DeepMind's 'Habermas Machine': an LLM mediator that aggregates individual opinions and critiques into iteratively generated common-ground statements, published in Science in 2024, more endorsed than human mediators in an experiment with thousands of participants."
        },
        {
          "zh": "斯坦福 Deliberative Democracy Lab 把自动主持人部署进其在 32 个国家使用过的在线协商平台，支撑数千人级的小组同步协商。",
          "en": "Stanford's Deliberative Democracy Lab has deployed an automated moderator into its online deliberation platform, used across 32 countries, supporting synchronous small-group deliberation at a scale of thousands of participants."
        },
        {
          "zh": "定位为科学传播的第三条路：既非单向科普、也非放任的评论区，而是结构化的、AI 居间的公众-科学协商。",
          "en": "Positioned as a third path for science communication: neither one-way popular-science broadcast nor an unmoderated comment section, but structured, AI-mediated public-science deliberation."
        }
      ],
      "barrier": {
        "zh": "最硬的争议：流畅折中的共识声明可能算法性地抹平少数派立场，且哈贝马斯机器优化的是「群体认同度」而非论证质量——一个可以被巧妙措辞游戏化的目标函数；把它接入真实科技政策还要过合法性这一关。",
        "en": "The hardest controversy: a fluently compromised consensus statement may algorithmically flatten minority positions, and the Habermas Machine optimizes for 'group approval' rather than argument quality — an objective function that clever wording can game; wiring it into real science policy still has to clear the legitimacy test."
      },
      "subQuestions": [
        {
          "zh": "为什么人类会对某些形式、声音和比例产生「美」的体验？审美偏好究竟是大脑信息处理效率的副产品，还是一种独立的、不能还原为认知或情绪的心智维度？",
          "en": "Why do humans experience certain forms, sounds, and proportions as beautiful — is aesthetic preference a byproduct of the brain's processing efficiency, or an irreducible dimension of mind that cannot be reduced to cognition or emotion?"
        },
        {
          "zh": "当生成式 AI 能在毫秒内产出无穷多张「合格」的图像与设计时，人类创作中那个不可外包的内核——如果存在的话——究竟是什么？「创造性」是否有一个机器原则上无法跨越的边界？",
          "en": "When generative AI can produce infinitely many 'competent' images and designs in milliseconds, what — if anything — is the irreducible human core of creation that cannot be outsourced, and does 'creativity' have a boundary that machines cannot in principle cross?"
        },
        {
          "zh": "数学家口中的「优雅」、物理学家追求的「美」，是否真的是通往真理的可靠向导？还是说，对简洁与对称的审美偏好，正在系统性地把整个理论物理引向歧途？",
          "en": "Is the 'elegance' mathematicians invoke and the 'beauty' physicists chase actually a reliable guide to truth — or has aesthetic preference for simplicity and symmetry been systematically leading theoretical physics astray?"
        }
      ]
    },
    "literature": [
      {
        "title": "AI can help humans find common ground in democratic deliberation",
        "venue": "Science",
        "year": 2024,
        "url": "https://www.science.org/doi/10.1126/science.adq2852"
      },
      {
        "title": "Online Deliberation Platform — Deliberative Democracy Lab",
        "venue": "Stanford University",
        "year": 2025,
        "url": "https://deliberation.stanford.edu/tools-resources/online-deliberation-platform"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 832,
      "y": 491,
      "scale": 0.86
    }
  },
  {
    "id": 109,
    "atlasN": 640,
    "slug": "a-quantitative-science-of-serendipity",
    "title": {
      "zh": "意外发现率的可量化科学",
      "en": "A Quantitative Science of Serendipity Rates"
    },
    "qfocus": {
      "zh": "能否把'运气'拆解为机遇、洞察与有准备的心智三要素，量化不同科研体制下意外发现的发生率，让它从玄学变成可测量、可设计的对象？",
      "en": "Can 'luck' be decomposed into chance, sagacity, and the prepared mind so that the incidence of serendipitous discovery becomes measurable across research regimes — and cultivable by design, rather than merely awaited?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C28",
      "zh": "元科学·科研治理",
      "en": "Metascience · research governance"
    },
    "scores": [
      5,
      4,
      4,
      3,
      4,
      4,
      1,
      1,
      4
    ],
    "citation": {
      "url": "https://link.springer.com/article/10.1007/s11229-017-1544-3",
      "title": "On serendipity in science: discovery at the intersection of chance and wisdom",
      "venue": "Synthese",
      "year": 2019
    },
    "brief": {
      "zh": "把'运气'拆解为机遇、洞察与有准备的心智三要素，量化不同科研体制、资助方式与团队结构下意外发现的发生率与可培育条件，让偶然的科学发现从玄学变成可测量、可设计的对象。研究估计33%–50%的科学发现属于意外。",
      "en": "Serendipity is decomposed into chance, sagacity, and the prepared mind, quantifying how the rate of accidental discovery and its cultivable conditions vary across research regimes, funding mechanisms, and team structures — turning serendipity from mysticism into something measurable and designable. Studies estimate that 33–50% of scientific discoveries are accidental."
    },
    "depth": {
      "overview": {
        "zh": "意外发现率的可量化科学把'serendipity'从玄学变成可测量、可设计的对象：研究估计33%–50%的科学发现是意外的，并把意外拆解为机遇、洞察（sagacity）与'有准备的心智'三要素。它结合科学计量学、认知科学与元科学，量化不同科研体制、资助方式、团队结构下意外发现的发生率与培育条件，并把意外分型（一域研究意外解了另一域、完全开放的搜寻撞上发现、为甲问题却经意外路径达解等）。",
        "en": "A quantitative science of serendipity rates turns serendipity from mysticism into a measurable, designable object: studies estimate that 33%–50% of scientific discoveries are accidental, and decompose serendipity into three elements — chance, sagacity (insight), and the 'prepared mind'. Combining scientometrics, cognitive science, and metascience, it quantifies the incidence and cultivation conditions of serendipitous discovery across different research regimes, funding mechanisms, and team structures, and types serendipity into categories (research in one field accidentally solving another, a fully open search stumbling on a find, reaching a solution to problem A via an unexpected route, etc.)."
      },
      "whyMatters": {
        "zh": "若意外占发现的近半，科研政策却几乎只优化'计划内'产出，等于系统性地忽视了一半的发现引擎；这把'幸运能否被设计'从修辞问题变成了一个可被政策回应的真实缺口。",
        "en": "If accident accounts for nearly half of all discoveries, yet science policy optimizes almost exclusively for 'planned' output, the system is structurally neglecting half its engine of discovery — turning 'can luck be designed' from rhetoric into a real policy gap."
      },
      "ifAnswered": {
        "zh": "若能确立培育条件，资助机构与实验室便可主动设计提高意外发现概率的环境——让幸运变得可被设计，而非只能被动等待。",
        "en": "If the cultivating conditions can be established, funders and labs could deliberately design environments that raise the odds of serendipitous discovery — making good fortune something that can be designed, rather than merely awaited."
      },
      "approaches": [
        {
          "zh": "将意外发现分型——如'一域研究意外解了另一域'、'完全开放的搜寻撞上发现'、'为甲问题却经意外路径达解'——建立可比较的分类框架。",
          "en": "Typing serendipitous discovery into comparable categories — e.g. research in one field accidentally solving another, a fully open-ended search stumbling on a find, or reaching a solution to problem A via an unexpected route."
        },
        {
          "zh": "用科学计量学量化不同资助机制（自由探索 vs. 目标导向）、团队多样性与跨域流动下意外发现的发生率差异。",
          "en": "Using scientometrics to quantify how serendipity rates vary across funding mechanisms (open-ended exploration vs. goal-directed), team diversity, and cross-domain mobility."
        },
        {
          "zh": "结合认知科学刻画'有准备的心智'——识别意外所需的知识与判断（sagacity）——作为可训练、可评估的能力。",
          "en": "Drawing on cognitive science to characterize the 'prepared mind' — the sagacity needed to recognize an accident as meaningful — as a trainable, assessable capacity."
        }
      ],
      "barrier": {
        "zh": "最硬的壁垒是事后偏倚：意外发现只有成功后才被追认为意外，分母（错过的意外）几乎不可观测；'有准备的心智'又难以前瞻量化，使因果性的政策结论难以确立。",
        "en": "The hardest barrier is hindsight bias: a serendipitous find is only recognized as such after it succeeds, so the denominator (missed accidents) is nearly unobservable; and the 'prepared mind' resists prospective measurement, making causal policy conclusions hard to establish."
      },
      "subQuestions": [
        {
          "zh": "如果一个领域里大多数已发表的研究发现都是假的，那么科学作为一个自我纠错系统，其纠错机制本身在什么条件下会失效？我们能否事先识别出哪些领域正处在这种「系统性失真」状态？",
          "en": "If most published research findings in a field are false, under what conditions does science's self-correction mechanism itself break down — and can we identify in advance which fields are in such a state of systematic distortion?"
        },
        {
          "zh": "有没有可能为「科学进步」本身建立一门定量科学——用大规模数据预测哪些想法、团队配置和资助结构最可能催生突破？还是说创造性突破在原则上就不可预测？",
          "en": "Can there be a quantitative science of scientific progress itself — predicting from large-scale data which ideas, team configurations and funding structures are most likely to yield breakthroughs — or are creative breakthroughs unpredictable in principle?"
        },
        {
          "zh": "当科研产出的体量增长了几个数量级，颠覆性的发现却在相对衰减——这是不是说明现行的「论文+引用+同行评审」制度本身已经成为创新的瓶颈？我们需要怎样一种全新的知识生产架构？",
          "en": "As the sheer volume of research output has grown by orders of magnitude while disruptive discoveries decline relative to it, has the 'paper + citation + peer review' regime itself become the bottleneck to innovation — and what entirely new architecture of knowledge production is needed?"
        }
      ]
    },
    "literature": [
      {
        "title": "On serendipity in science: discovery at the intersection of chance and wisdom",
        "venue": "Synthese",
        "year": 2019,
        "url": "https://link.springer.com/article/10.1007/s11229-017-1544-3"
      },
      {
        "title": "Serendipity: The Unexpected in Science",
        "venue": "MIT Press",
        "year": 2024,
        "url": "https://direct.mit.edu/books/book/5821/SerendipityThe-Unexpected-in-Science"
      },
      {
        "title": "Role of chance in scientific discoveries",
        "venue": "Wikipedia (overview)",
        "year": 2024,
        "url": "https://en.wikipedia.org/wiki/Role_of_chance_in_scientific_discoveries"
      },
      {
        "title": "Predictable serendipity: how new tools turn serendipity into systematic breakthroughs",
        "venue": "Scientometrics",
        "year": 2026,
        "url": "https://link.springer.com/article/10.1007/s11192-025-05503-y"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 729,
      "y": 462,
      "scale": 0.9
    }
  },
  {
    "id": 110,
    "atlasN": 1177,
    "slug": "retraction-epidemiology-and-knowledge-base",
    "title": {
      "zh": "撤稿流行病学与知识库污染",
      "en": "Retraction Epidemiology and Knowledge-Base Contamination"
    },
    "qfocus": {
      "zh": "被撤稿的科学为何仍能在引文网络与AI训练语料中持续传播、被大模型反复复述，而现有传播机制却无法阻断这种污染？",
      "en": "Why does retracted science keep propagating through citation networks and AI training corpora — recycled repeatedly by large language models — when no mechanism exists to halt this contamination?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C28",
      "zh": "元科学·科研治理",
      "en": "Metascience · research governance"
    },
    "scores": [
      4,
      5,
      4,
      4,
      2,
      5,
      4,
      4,
      4
    ],
    "citation": {
      "url": "https://onlinelibrary.wiley.com/doi/10.1002/leap.2018",
      "title": "Does ChatGPT Ignore Article Retractions and Other Reliability Concerns?",
      "venue": "Learned Publishing",
      "year": 2025
    },
    "brief": {
      "zh": "2023年9月Crossref收购并开放Retraction Watch撤稿数据库后，撤稿的传播首次可全域追踪；但2025年研究发现GPT-4o-mini等主流大模型在6510份评估报告中对217篇被撤稿或存疑论文几乎零次提示其撤稿状态，被撤稿的科学正持续污染AI训练语料与生成内容。",
      "en": "Since Crossref acquired and opened the Retraction Watch database in September 2023, the propagation of retractions can be tracked globally for the first time — yet 2025 research finds mainstream models like GPT-4o-mini flagged retraction status almost zero times across 217 retracted or disputed papers within 6,510 evaluation reports, so retracted science keeps contaminating AI training corpora and generated content."
    },
    "depth": {
      "overview": {
        "zh": "一篇论文被撤稿后并不会死——它活在引用里、活在数据库里，现在还活进了大模型的训练语料，被亿万次复述。2023年9月，Crossref收购并开放了Retraction Watch数据库（约5万条撤稿记录并入公共API），使撤稿的传播路径第一次可以全域追踪。",
        "en": "A retracted paper does not die — it lives on in citations, in databases, and now in the training corpora of large language models, echoed across billions of generations. In September 2023, Crossref acquired and opened the Retraction Watch database (roughly 50,000 retraction records folded into a public API), making the propagation of retractions globally trackable for the first time."
      },
      "whyMatters": {
        "zh": "撤稿元数据在出版商、聚合库与训练语料之间没有任何强制传播机制，意味着一篇论文即便被正式撤稿，也可能持续影响下游研究乃至被AI放大传播给海量用户，科研诚信与AI语料的可靠性因此同时承压。",
        "en": "Retraction metadata has no mandatory propagation mechanism between publishers, aggregator databases, and training corpora, meaning a formally retracted paper can keep shaping downstream research and be amplified by AI to vast numbers of users — putting both research integrity and AI corpus reliability under strain."
      },
      "ifAnswered": {
        "zh": "若能建立这套'卫生基础设施'，撤稿状态将实时传播——出版商、聚合库与AI训练管线共享同一份污染源清单，配合训练语料净化审计与LLM撤稿感知基准，被撤稿的错误结论就不会再被无限复述。",
        "en": "If this hygiene infrastructure can be built, retraction status would propagate in real time — publishers, aggregator databases, and AI training pipelines sharing one list of contamination sources, backed by corpus-decontamination audits and retraction-awareness benchmarks for LLMs — so a retracted, erroneous conclusion would no longer be endlessly recycled."
      },
      "approaches": [
        {
          "zh": "把撤稿数据库（如Crossref开放的Retraction Watch）与引文网络、AI训练语料对齐，全域追踪一篇撤稿论文的'传播路径'。",
          "en": "Aligning retraction databases (such as the Crossref-opened Retraction Watch) with citation networks and AI training corpora to globally trace a retracted paper's propagation path."
        },
        {
          "zh": "对主流大模型做撤稿感知评测（如6510份评估报告中检验GPT-4o-mini能否提示217篇被撤稿或存疑论文），量化AI语料污染的规模。",
          "en": "Benchmarking mainstream LLMs for retraction awareness (such as testing whether GPT-4o-mini flags 217 retracted or disputed papers across 6,510 evaluation reports) to quantify the scale of AI corpus contamination."
        },
        {
          "zh": "借鉴元科学对'自我纠错机制何时失效'的形式化分析，把撤稿污染问题嵌入科研治理与训练语料治理的共同框架。",
          "en": "Drawing on metascience's formal analysis of when self-correction breaks down, situating the retraction-contamination problem within a shared framework of research governance and training-corpus governance."
        }
      ],
      "barrier": {
        "zh": "最硬的张力：LLM一旦吸收了被撤稿论文的结论，事后'解毒'（从已训练模型中清除这些内容）在技术上仍然无解，撤稿状态又缺乏强制传播协议，污染只能不断被生成、难以被追溯清除。",
        "en": "The hardest tension: once an LLM has absorbed a retracted paper's conclusions, post-hoc 'detoxification' — purging that content from an already-trained model — remains technically unsolved, and with no mandatory protocol propagating retraction status, the contamination keeps being regenerated and is hard to trace or remove."
      },
      "subQuestions": [
        {
          "zh": "如果一个领域里大多数已发表的研究发现都是假的，那么科学作为一个自我纠错系统，其纠错机制本身在什么条件下会失效？我们能否事先识别出哪些领域正处在这种「系统性失真」状态？",
          "en": "If most published research findings in a field are false, under what conditions does science's self-correction mechanism itself break down — and can we identify in advance which fields are in such a state of systematic distortion?"
        },
        {
          "zh": "有没有可能为「科学进步」本身建立一门定量科学——用大规模数据预测哪些想法、团队配置和资助结构最可能催生突破？还是说创造性突破在原则上就不可预测？",
          "en": "Can there be a quantitative science of scientific progress itself — predicting from large-scale data which ideas, team configurations and funding structures are most likely to yield breakthroughs — or are creative breakthroughs unpredictable in principle?"
        },
        {
          "zh": "当科研产出的体量增长了几个数量级，颠覆性的发现却在相对衰减——这是不是说明现行的「论文+引用+同行评审」制度本身已经成为创新的瓶颈？我们需要怎样一种全新的知识生产架构？",
          "en": "As the sheer volume of research output has grown by orders of magnitude while disruptive discoveries decline relative to it, has the 'paper + citation + peer review' regime itself become the bottleneck to innovation — and what entirely new architecture of knowledge production is needed?"
        }
      ]
    },
    "literature": [
      {
        "title": "News: Crossref and Retraction Watch — open retraction data for the scientific community",
        "venue": "Crossref",
        "year": 2023,
        "url": "https://www.crossref.org/blog/news-crossref-and-retraction-watch"
      },
      {
        "title": "Does ChatGPT Ignore Article Retractions and Other Reliability Concerns?",
        "venue": "Learned Publishing",
        "year": 2025,
        "url": "https://onlinelibrary.wiley.com/doi/10.1002/leap.2018"
      },
      {
        "title": "AI models are using material from retracted scientific papers",
        "venue": "MIT Technology Review",
        "year": 2025,
        "url": "https://www.technologyreview.com/2025/09/23/1123897/ai-models-are-using-material-from-retracted-scientific-papers/"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 873,
      "y": 448,
      "scale": 0.98
    }
  },
  {
    "id": 111,
    "atlasN": 492,
    "slug": "microbial-dark-matter-and-uncultured",
    "title": {
      "zh": "微生物暗物质与未培养菌",
      "en": "Microbial Dark Matter and Uncultured Microbes"
    },
    "qfocus": {
      "zh": "能否绕过实验室培养瓶颈，仅凭环境DNA与AI蛋白结构、功能预测，把占微生物绝大多数的'暗物质'批量转化为可下游验证的新酶、新药候选？",
      "en": "Can environmental DNA plus AI protein-structure and function prediction bypass the lab-culturing bottleneck and convert the vast 'dark matter' of uncultured microbes into downstream-verifiable candidates for new enzymes and drugs, in bulk?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C30",
      "zh": "微生物组·生态工程",
      "en": "Microbiome · ecological engineering"
    },
    "scores": [
      4,
      4,
      5,
      3,
      3,
      2,
      3,
      3,
      4
    ],
    "citation": {
      "url": "https://www.nature.com/articles/s41586-023-06583-7",
      "title": "Unraveling the functional dark matter through global metagenomics",
      "venue": "Nature",
      "year": 2023
    },
    "brief": {
      "zh": "大多数微生物无法在实验室培养，属于'暗物质'；宏基因组测序结合AI蛋白结构与功能预测，正把这些无法培养的暗物质转化为可下游验证的新酶、新药候选，绕过培养瓶颈直接点亮未知生命的功能版图。",
      "en": "Most microbes cannot be cultured in the lab and remain 'dark matter'; metagenomic sequencing combined with AI protein-structure and function prediction is now converting this uncultured dark matter into downstream-verifiable candidates for new enzymes and drugs, bypassing the culturing bottleneck to illuminate the functional map of unknown life."
    },
    "depth": {
      "overview": {
        "zh": "微生物暗物质与未培养菌把宏基因组测序（结合单细胞基因组学、宏基因组组装基因组MAG）与AI预测结合，针对占微生物绝大多数、无法在实验室培养的'暗物质'预测其基因功能、代谢能力与潜在新药新酶。它横跨微生物学、基因组学与AI，核心是绕过培养瓶颈，直接从环境DNA中点亮未知生命的功能版图。",
        "en": "Microbial dark matter and uncultured microbes combines metagenomic sequencing (with single-cell genomics and metagenome-assembled genomes, MAGs) with AI prediction to target the 'dark matter' that makes up the vast majority of microbes and cannot be cultured in the lab, predicting their gene functions, metabolic capabilities, and potential new drugs and enzymes. Spanning microbiology, genomics and AI, its core is bypassing the cultivation bottleneck to illuminate the functional map of unknown life directly from environmental DNA."
      },
      "whyMatters": {
        "zh": "已知微生物只是冰山一角，暗物质蕴藏海量新酶、新抗生素与新代谢途径——只要能点亮它们，就打开了一个几乎未被开采的天然产物矿藏。",
        "en": "Known microbes are only the tip of the iceberg; the dark matter holds a vast trove of new enzymes, antibiotics, and metabolic pathways — illuminating it opens up an almost unmined reserve of natural products."
      },
      "ifAnswered": {
        "zh": "若AI能把'有序列无功能'的暗物质批量转化为可下游验证的候选，将引爆新一轮天然产物发现，批量发现新功能、新酶与新药。",
        "en": "If AI can convert 'sequence without function' dark matter into downstream-verifiable candidates at scale, it could ignite a new wave of natural-product discovery — finding new functions, enzymes, and drugs at scale."
      },
      "approaches": [
        {
          "zh": "用宏基因组测序、单细胞基因组学与宏基因组组装基因组（MAG）直接从环境DNA中重建未培养微生物的基因组。",
          "en": "Reconstructing uncultured microbes' genomes directly from environmental DNA using metagenomic sequencing, single-cell genomics, and metagenome-assembled genomes (MAGs)."
        },
        {
          "zh": "用AI蛋白结构预测为'有序列无功能'的基因批量指派可下游验证的功能假设，绕过传统培养实验的瓶颈。",
          "en": "Using AI protein-structure prediction to assign downstream-verifiable functional hypotheses in bulk to 'sequence without function' genes, bypassing the bottleneck of traditional culturing experiments."
        },
        {
          "zh": "把微生物功能测绘与群落生态学的可预测性问题结合，探究能否从第一性原理预测群落组装与稳定状态。",
          "en": "Linking microbial function mapping to the predictability of community ecology, asking whether community assembly and stable states can be predicted from first principles."
        }
      ],
      "barrier": {
        "zh": "难点是基因序列到真实功能的注释充满不确定——大量基因功能未知，'有序列无功能'的暗物质长期停留在无法验证的阶段。",
        "en": "The difficulty is that annotating real function from gene sequence is full of uncertainty — a huge fraction of genes have unknown function, and 'sequence without function' dark matter has long remained stuck at an unverifiable stage."
      },
      "subQuestions": [
        {
          "zh": "宿主与其体内数以万亿计的微生物，是否应被看作一个不可分割的「全功能体」（holobiont）？自然选择究竟作用在单个生物体上，还是作用在宿主-微生物组这个整体上？",
          "en": "Should a host and its trillions of resident microbes be understood as one inseparable 'holobiont' — and does natural selection act on the individual organism, or on the host-microbiome whole?"
        },
        {
          "zh": "我们能否从第一性原理预测并设计一个微生物群落的组装与稳定状态——给定一组物种和环境，可靠地推出它会演化成什么、能抵抗什么入侵？还是说微生态系统在本质上就不可预测、不可控？",
          "en": "Can we predict and design a microbial community's assembly and stable states from first principles — given a set of species and an environment, reliably derive what it will become and what invasions it resists — or are microbial ecosystems intrinsically unpredictable and uncontrollable?"
        },
        {
          "zh": "肠道微生物组能通过「肠-脑轴」在多大程度上影响人类的情绪、认知乃至行为？这种影响是边缘性的调制，还是说我们的「自我」在某种深刻意义上是由体内微生物共同决定的？",
          "en": "To what extent can the gut microbiome shape human mood, cognition and behavior via the gut-brain axis — is this a marginal modulation, or is our 'self' in some deep sense co-authored by the microbes inside us?"
        }
      ]
    },
    "literature": [
      {
        "title": "Unraveling the functional dark matter through global metagenomics",
        "venue": "Nature",
        "year": 2023,
        "url": "https://www.nature.com/articles/s41586-023-06583-7"
      },
      {
        "title": "Functional and evolutionary significance of unknown genes from uncultivated taxa",
        "venue": "Nature",
        "year": 2023,
        "url": "https://www.nature.com/articles/s41586-023-06955-z"
      },
      {
        "title": "Approaches for accelerating microbial gene function discovery using artificial intelligence",
        "venue": "Nature Microbiology",
        "year": 2026,
        "url": "https://www.nature.com/articles/s41564-025-02214-1"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 617,
      "y": 244,
      "scale": 0.91
    }
  },
  {
    "id": 112,
    "atlasN": 529,
    "slug": "extremophiles-and-the-limits-of",
    "title": {
      "zh": "极端微生物与生命边界",
      "en": "Extremophiles and the Limits of Life"
    },
    "qfocus": {
      "zh": "生命在物理化学意义上的边界究竟在哪里——极端微生物的耐受极限能否指引地外生命的搜寻方向，并催生下一个'Taq'级别的产业级酶？",
      "en": "Where exactly are the physicochemical limits of life — and can the tolerance limits of extremophiles guide where to search for extraterrestrial life, while yielding the next Taq-polymerase-scale industrial enzyme?"
    },
    "domain": "生命",
    "cluster": {
      "code": "C30",
      "zh": "微生物组·生态工程",
      "en": "Microbiome · ecological engineering"
    },
    "scores": [
      4,
      4,
      3,
      4,
      2,
      3,
      4,
      4,
      4
    ],
    "citation": {
      "url": "https://pubmed.ncbi.nlm.nih.gov/31037068/",
      "title": "Living at the Extremes: Extremophiles and the Limits of Life in a Planetary Context",
      "venue": "Frontiers in Microbiology",
      "year": 2019
    },
    "brief": {
      "zh": "极端微生物在高温高压、强酸碱、强辐射或极端缺水下生存繁殖，探索生命的物理化学边界；它既外推'宜居'的定义、指引地外生命搜寻，也提供如PCR用Taq聚合酶般的耐极端工业酶，是基础研究催生大产业的经典案例。",
      "en": "Extremophiles survive and reproduce under high temperature, high pressure, strong acidity/alkalinity, intense radiation, or extreme desiccation, probing the physicochemical boundaries of life; they both extend the definition of 'habitable' to guide the search for extraterrestrial life and supply extreme-tolerant industrial enzymes like the Taq polymerase behind PCR — a classic case of basic research spawning a major industry."
    },
    "depth": {
      "overview": {
        "zh": "极端微生物研究在高温、高压、强酸碱、强辐射或极端缺水等条件下生存繁殖的生命，探索生命的物理化学边界。它跨微生物学、生物化学与天体生物学，既启发地外生命搜寻，也提供耐极端的工业酶等生物技术资源。",
        "en": "Extremophile research studies life that survives and reproduces under high temperature, high pressure, strong acidity or alkalinity, intense radiation, or extreme desiccation, exploring the physicochemical boundaries of life. Spanning microbiology, biochemistry, and astrobiology, it both inspires the search for extraterrestrial life and supplies biotechnology resources such as extremotolerant industrial enzymes."
      },
      "whyMatters": {
        "zh": "它把'宜居'的定义不断外推，直接影响我们该往地外何处寻找生命；同时耐极端酶（如PCR用的Taq酶）已是数十亿美元产业的基石，是基础研究意外催生大产业的经典案例。",
        "en": "It keeps pushing the definition of 'habitable' outward, directly shaping where we should look for life beyond Earth; meanwhile extreme-tolerant enzymes (such as the Taq polymerase behind PCR) are already the cornerstone of a multibillion-dollar industry — a classic case of basic research unexpectedly spawning a major industry."
      },
      "ifAnswered": {
        "zh": "若能持续刻画生命的物理化学边界，将同时启发地外生命搜寻策略（该去哪找）与新一代耐极端生物技术（下一个Taq）的开发。",
        "en": "Continuing to map the physicochemical limits of life would simultaneously inform strategies for the search for extraterrestrial life (where to look) and the development of next-generation extreme-tolerant biotechnology (the next Taq)."
      },
      "approaches": [
        {
          "zh": "系统测绘微生物在高温、高压、强酸碱、强辐射（如耐辐射的Deinococcus）与极端缺水条件下的生存极限，划定生命的物理化学边界。",
          "en": "Systematically mapping microbial survival limits under high temperature, high pressure, strong acidity/alkalinity, intense radiation (such as radiation-resistant Deinococcus), and extreme desiccation to delineate the physicochemical boundaries of life."
        },
        {
          "zh": "把地球极端环境的生存数据用作地外环境模拟实验与天体生物学搜寻策略的参照系。",
          "en": "Using survival data from Earth's extreme environments as a reference frame for extraterrestrial-environment-simulated experiments and astrobiology search strategies."
        },
        {
          "zh": "从极端微生物中挖掘耐极端工业酶（如Taq聚合酶的后继者），作为生物技术开发的持续勘探目标。",
          "en": "Mining extremophiles for extreme-tolerant industrial enzymes (successors to Taq polymerase) as an ongoing biotechnology-prospecting target."
        }
      ],
      "barrier": {
        "zh": "'下一个Taq可能就藏在某个极端环境里'这句话本身道出了难点：哪个极端环境会催生下一个产业级发现，事前几乎不可预测，只能靠持续、广泛的勘探去撞见。",
        "en": "The claim that 'the next Taq may be hiding in some extreme environment' points to the difficulty itself: which extreme environment will yield the next industry-defining enzyme cannot be predicted in advance — only sustained, broad prospecting can find out."
      },
      "subQuestions": [
        {
          "zh": "宿主与其体内数以万亿计的微生物，是否应被看作一个不可分割的「全功能体」（holobiont）？自然选择究竟作用在单个生物体上，还是作用在宿主-微生物组这个整体上？",
          "en": "Should a host and its trillions of resident microbes be understood as one inseparable 'holobiont' — and does natural selection act on the individual organism, or on the host-microbiome whole?"
        },
        {
          "zh": "我们能否从第一性原理预测并设计一个微生物群落的组装与稳定状态——给定一组物种和环境，可靠地推出它会演化成什么、能抵抗什么入侵？还是说微生态系统在本质上就不可预测、不可控？",
          "en": "Can we predict and design a microbial community's assembly and stable states from first principles — given a set of species and an environment, reliably derive what it will become and what invasions it resists — or are microbial ecosystems intrinsically unpredictable and uncontrollable?"
        },
        {
          "zh": "肠道微生物组能通过「肠-脑轴」在多大程度上影响人类的情绪、认知乃至行为？这种影响是边缘性的调制，还是说我们的「自我」在某种深刻意义上是由体内微生物共同决定的？",
          "en": "To what extent can the gut microbiome shape human mood, cognition and behavior via the gut-brain axis — is this a marginal modulation, or is our 'self' in some deep sense co-authored by the microbes inside us?"
        }
      ]
    },
    "literature": [
      {
        "title": "Living at the Extremes: Extremophiles and the Limits of Life in a Planetary Context",
        "venue": "Frontiers in Microbiology",
        "year": 2019,
        "url": "https://pubmed.ncbi.nlm.nih.gov/31037068/"
      },
      {
        "title": "Relevance of Earth-Bound Extremophiles in the Search for Extraterrestrial Life",
        "venue": "Life (MDPI)",
        "year": 2022,
        "url": "https://pubmed.ncbi.nlm.nih.gov/35108099/"
      },
      {
        "title": "Mini-Review: Probing the limits of extremophilic life in extraterrestrial environment-simulated experiments",
        "venue": "International Journal of Astrobiology",
        "year": 2022,
        "url": "https://www.cambridge.org/core/journals/international-journal-of-astrobiology/article/abs/minireview-probing-the-limits-of-extremophilic-life-in-extraterrestrial-environmentsimulated-experiments/0D5470821055110450CB64AD2A3CCBB2"
      },
      {
        "title": "Navigating life in the extremes: a bibliometric exploration of extremophiles and astrobiology",
        "venue": "International Journal of Astrobiology",
        "year": 2023,
        "url": "https://www.cambridge.org/core/journals/international-journal-of-astrobiology/article/navigating-life-in-the-extremes-a-bibliometric-exploration-of-extremophiles-and-astrobiology/D50EAEA3D9366BA14492E8A9ACBA8F85"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 661,
      "y": 279,
      "scale": 0.76
    }
  },
  {
    "id": 113,
    "atlasN": 605,
    "slug": "an-early-warning-science-for",
    "title": {
      "zh": "未知未知的预警学",
      "en": "An Early-Warning Science for Unknown Unknowns"
    },
    "qfocus": {
      "zh": "当冲击属于'连不知道要防什么'的未知未知时，系统能否仍留下与具体威胁无关的通用前兆，从而设计出面向不可预见冲击的早期预警与韧性原理？",
      "en": "When a shock belongs to the unknown unknowns — where a system doesn't even know what to guard against — can it still leave threat-agnostic generic precursors, enabling early-warning and resilience principles for the unforeseeable?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C34",
      "zh": "无知测绘·盲区科学",
      "en": "Mapping ignorance & blind spots"
    },
    "scores": [
      5,
      5,
      4,
      3,
      4,
      4,
      3,
      3,
      4
    ],
    "citation": {
      "url": "https://www.nature.com/articles/nature08227",
      "title": "Early-warning signals for critical transitions",
      "venue": "Nature",
      "year": 2009
    },
    "brief": {
      "zh": "复杂系统存在与具体机制无关的通用预警信号（临界慢化、方差与自相关上升），已在生态、气候、生理多领域验证；未知未知的预警学不预测具体冲击内容，而是监测系统-环境耦合中的失稳前兆，把'对未知未知的韧性'设计为可实现目标。",
      "en": "Complex systems emit generic, mechanism-agnostic early-warning signals (critical slowing down, rising variance and autocorrelation) validated across ecology, climate, and physiology; the early-warning science of unknown unknowns doesn't predict any specific shock but instead monitors destabilization precursors in the system-environment coupling, making 'resilience to unknown unknowns' a designable goal."
    },
    "depth": {
      "overview": {
        "zh": "未知未知的预警学研究一个看似悖论的问题：当冲击属于'连不知道要防什么'的未知未知时，系统还能否留下可被察觉的前兆？它寻找与具体威胁无关的通用早期信号（如临界慢化、耦合环境的上截断跳变），并据此设计面向不可预见冲击的韧性原理。横跨复杂系统、风险科学与认知科学。",
        "en": "An early-warning science for unknown unknowns tackles a seemingly paradoxical question: when a shock belongs to the unknown unknowns—where you don't even know what to defend against—can a system still leave perceptible precursors? It searches for generic early signals independent of any specific threat (such as critical slowing down, or upper-cutoff jumps in coupled environments) and uses them to design resilience principles for unforeseeable shocks. It spans complex systems, risk science, and cognitive science."
      },
      "whyMatters": {
        "zh": "传统风险管理只能防'已识别风险'，对未知未知束手无策；若能找到与威胁内容无关的通用前兆，就能为想不到的冲击做准备。",
        "en": "Conventional risk management can only guard against 'identified risks' and is helpless before unknown unknowns; if threat-agnostic generic precursors can be found, we could prepare for shocks we cannot even imagine."
      },
      "ifAnswered": {
        "zh": "若通用前兆信号能被确立并去伪存真，社会与生态系统就能在'连要防什么都不知道'的情况下，依然为想不到的冲击提前建立冗余、多样性与可逆性韧性。",
        "en": "If generic precursor signals can be established and separated from false positives, societies and ecosystems could build redundancy, diversity, and reversibility in advance — preparing for shocks you can't even imagine, even without knowing what to guard against."
      },
      "approaches": [
        {
          "zh": "监测临界慢化、方差与自相关上升等与具体机制无关的通用信号，捕捉相变与崩溃的前兆（已在生态、气候、生理领域验证）。",
          "en": "Monitoring mechanism-agnostic generic signals — critical slowing down, rising variance and autocorrelation — to catch precursors of phase transitions and collapse (already validated in ecology, climate, and physiology)."
        },
        {
          "zh": "不只看系统自身数据，而是纳入其耦合环境，追踪'上截断'（dragon-king式）跳变以提前预警黑天鹅。",
          "en": "Looking beyond a system's own data to its coupled environment, tracking 'upper-truncation' (dragon-king-style) jumps to give advance warning of black swans."
        },
        {
          "zh": "把'对未知未知的韧性'设计为可实现目标——通过冗余、多样性、可逆性与模块化，即使无法预测具体冲击内容也能降低冲击损害。",
          "en": "Designing 'resilience to unknown unknowns' as an achievable goal — using redundancy, diversity, reversibility, and modularity to reduce damage even when the specific shock cannot be predicted."
        }
      ],
      "barrier": {
        "zh": "最硬的张力是原理性的——真正的未知未知按定义不可由系统自身历史预测，任何'通用预警'都游走在'真信号'与'事后合理化'之间，证伪极难。",
        "en": "The hardest tension is foundational: a genuine unknown unknown is, by definition, unpredictable from a system's own history, so any 'generic early warning' walks the line between a real signal and post-hoc rationalization, making falsification extremely difficult."
      },
      "subQuestions": [
        {
          "zh": "我们能不能为「科学的已知盲区」画一张地图——一个系统化、可量化的「未知地形图」，让一个领域知道自己「还不知道哪些问题」，而不是只在偶然撞上反常时才发现？",
          "en": "Can we build a systematic, quantifiable map of science's known blind spots—an atlas of ignorance that tells a field which questions it does not yet know to ask, rather than discovering them only by accidentally tripping over an anomaly?"
        },
        {
          "zh": "一个领域的「集体盲区」有多少是由它的方法和仪器本身造成的——也就是说，我们看不见某些现象，仅仅是因为现有工具在原理上无法测量它们？怎样才能侦测出这种「仪器性盲」？",
          "en": "How much of a field's collective blindness is manufactured by its own methods and instruments—i.e., we cannot see certain phenomena simply because existing tools are in principle incapable of measuring them—and how could we detect such instrument-induced blindness?"
        },
        {
          "zh": "「无知」本身能不能成为一门可教、可继承的科学方法论——我们能否把「如何系统地培养和利用不知道」写成与「如何获取知识」同样严谨的训练，而不是把它当作要被消灭的缺陷？",
          "en": "Can ignorance itself be turned into a teachable, transmissible scientific methodology—can we make 'how to systematically cultivate and exploit not-knowing' as rigorous a training as 'how to acquire knowledge', instead of treating it as a defect to be eliminated?"
        }
      ]
    },
    "literature": [
      {
        "title": "Early-warning signals for critical transitions",
        "venue": "Nature",
        "year": 2009,
        "url": "https://www.nature.com/articles/nature08227"
      },
      {
        "title": "Quantifying the Unexpected: a scientific approach to Black Swans",
        "venue": "Physical Review Research",
        "year": 2022,
        "url": "https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.4.033079"
      },
      {
        "title": "Quantifying the Unexpected: a scientific approach to Black Swans (preprint)",
        "venue": "arXiv",
        "year": 2022,
        "url": "https://arxiv.org/abs/2201.12042"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 955,
      "y": 648,
      "scale": 0.88
    }
  },
  {
    "id": 114,
    "atlasN": 606,
    "slug": "a-computable-expansion-law-for",
    "title": {
      "zh": "邻接可能的可计算扩张律",
      "en": "A Computable Expansion Law for the Adjacent Possible"
    },
    "qfocus": {
      "zh": "能否用一个可解的动力学方程，刻画'每个新颖物催生更多新颖物'的组合式创新，并预测可能性空间为何长期平台后突然爆发式发散？",
      "en": "Can a solvable dynamical equation capture the combinatorial innovation where 'every novelty begets more novelty', and predict why the possibility space explodes into divergence after a long plateau?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C35",
      "zh": "开放式探索·好奇驱动",
      "en": "Open-Endedness & Curiosity-Driven Discovery"
    },
    "scores": [
      5,
      5,
      3,
      2,
      4,
      4,
      1,
      2,
      4
    ],
    "citation": {
      "url": "https://www.sciencedirect.com/science/article/pii/S0014292125001941",
      "title": "The TAP equation: Evaluating combinatorial innovation",
      "venue": "European Economic Review",
      "year": 2025
    },
    "brief": {
      "zh": "TAP方程用'每个新颖物催生更多新颖物'的组合式创新刻画可能性空间的扩张，预测其典型行为是长期平台后突然爆发式发散，为创新的爆发提供了可计算的动力学方程。",
      "en": "The TAP equation captures combinatorial innovation—where every novelty begets more novelty—predicting that the possibility space typically plateaus for a long time before exploding into divergence, offering a computable dynamical equation for the explosion of innovation."
    },
    "depth": {
      "overview": {
        "zh": "邻接可能（adjacent possible）指系统每实现一个新颖物，就打开更多此前不可达的新可能。TAP方程（Theory of the Adjacent Possible）把这种'组合式创新'写成可解的动力学：新事物数随现有事物的组合而增长。它横跨理论生物学、复杂系统、创新研究乃至宇宙学，试图为'未知如何源源不断地涌现'给出第一性原理。",
        "en": "The adjacent possible refers to a system opening up more previously unreachable possibilities each time it realizes a novelty. The TAP equation (Theory of the Adjacent Possible) casts this 'combinatorial innovation' as solvable dynamics: the number of new things grows with the combinations of existing things. Spanning theoretical biology, complex systems, innovation research, and even cosmology, it seeks a first-principles account of how the unknown keeps emerging without end."
      },
      "whyMatters": {
        "zh": "它主张可能性空间本身在膨胀、且不可预先列举（非遍历性），这直接挑战'所有可能状态可先验枚举'的物理学默认前提。",
        "en": "It argues the possibility space is itself expanding and cannot be enumerated in advance (non-ergodicity), directly challenging physics' default premise that all possible states can be enumerated a priori."
      },
      "ifAnswered": {
        "zh": "若能验证TAP方程刻画的扩张律，创新的爆发将拥有一套可计算的动力学方程，为'从长期平台到突然发散'提供第一性原理的预测工具。",
        "en": "If the TAP expansion law holds, the explosion of innovation would gain a computable dynamical equation—a first-principles predictive tool for the transition from a long plateau to sudden divergence."
      },
      "approaches": [
        {
          "zh": "把新事物的产生刻画为现存事物组合的小概率事件，用可解的动力学方程（TAP equation）追踪可能性空间随时间的膨胀。",
          "en": "Model the emergence of new things as a small-probability event arising from combinations of existing things, tracking the possibility space's expansion over time via the solvable TAP dynamical equation."
        },
        {
          "zh": "参照新颖性搜索的经验——放弃预设目标、只追踪新颖性本身——为TAP刻画的组合式创新提供可检验的类比：新颖性也许应被当作独立于'目标'的度量来观察其增长动态。",
          "en": "Draw on novelty-search experience—abandoning preset goals to pursue novelty alone—as a testable analogy for TAP's combinatorial innovation: novelty itself, independent of any goal, may be the quantity whose growth dynamics should be tracked."
        },
        {
          "zh": "把TAP的'长平台后爆发式发散'当作检验'开放式系统'判据的一个具体案例，用其解析近似去衡量系统是否真正满足永不收敛的充分条件。",
          "en": "Treat TAP's 'long plateau followed by explosive divergence' as a concrete test case for criteria of 'open-endedness', using its analytic approximation to gauge whether a system truly satisfies the sufficient conditions for never converging."
        }
      ],
      "barrier": {
        "zh": "最硬张力是TAP解的典型行为是长平台后突然爆炸式发散，参数敏感、难以与真实创新数据稳健对接，且其本体论主张极具争议。",
        "en": "The hardest tension is that the typical TAP solution explodes divergently after a long plateau—parameter-sensitive and hard to robustly match to real innovation data—while its ontological claims remain deeply contested."
      },
      "subQuestions": [
        {
          "zh": "一个没有任何外部目标、只追求「新颖性」本身的搜索过程，为什么常常比直接奔向目标更快找到目标？「目标即障碍」这个反直觉现象，揭示了关于发现的什么根本规律？",
          "en": "Why does a search process that pursues novelty for its own sake—with no external objective at all—so often reach hard goals faster than one aimed directly at them? What fundamental law of discovery does this counterintuitive 'objectives can be obstacles' phenomenon reveal?"
        },
        {
          "zh": "我们能不能造出一个真正「永不收敛」的开放式系统——一个像生物演化那样能无限生成新颖且不断变难的问题、永远不会停在某个局部最优的发现引擎？开放式的真正判据是什么？",
          "en": "Can we build a genuinely never-converging open-ended system—a discovery engine that, like biological evolution, endlessly generates novel and ever-harder problems and never settles into a local optimum? What is the true criterion for open-endedness?"
        },
        {
          "zh": "「好奇心」是否存在一个可形式化、可植入机器的内在驱动信号——一种与外部奖励无关、纯粹由「学习进展」或「可压缩性提升」定义的内生动机？纯好奇能否单独支撑起开放式发现？",
          "en": "Is there a formalizable, machine-implantable intrinsic drive underlying curiosity—an internal motivation defined purely by 'learning progress' or 'compression gain', independent of any external reward? Can pure curiosity alone sustain open-ended discovery?"
        }
      ]
    },
    "literature": [
      {
        "title": "The TAP equation: evaluating combinatorial innovation in Biocosmology",
        "venue": "arXiv",
        "year": 2025,
        "url": "https://arxiv.org/abs/2204.14115"
      },
      {
        "title": "The TAP equation: Evaluating combinatorial innovation",
        "venue": "European Economic Review",
        "year": 2025,
        "url": "https://www.sciencedirect.com/science/article/pii/S0014292125001941"
      },
      {
        "title": "Autocatalytic Sets Arising in a Combinatorial Model of Chemical Evolution",
        "venue": "Life (MDPI)",
        "year": 2022,
        "url": "https://doi.org/10.3390/life12111703"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 871,
      "y": 707,
      "scale": 0.78
    }
  },
  {
    "id": 115,
    "atlasN": 1499,
    "slug": "cultural-accumulation-in-reinforcement-learning",
    "title": {
      "zh": "强化学习中的文化累积:人工\"世代智能\"",
      "en": "Cultural Accumulation in Reinforcement Learning: Artificial Generational Intelligence"
    },
    "qfocus": {
      "zh": "能否把人类文明'代际累积'的棘轮搬进强化学习——让智能体既独立探索又向上一代传承信息，使跨代累积的智能体在相同经验预算下超越只活一世的个体？",
      "en": "Can the ratchet of human cultural accumulation be ported into reinforcement learning—agents that both explore independently and inherit information from prior generations—so that cross-generational learners outperform single-lifetime agents given the same experience budget?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C35",
      "zh": "开放式探索·好奇驱动",
      "en": "Open-Endedness & Curiosity-Driven Discovery"
    },
    "scores": [
      5,
      5,
      4,
      2,
      3,
      3,
      3,
      4,
      4
    ],
    "citation": {
      "url": "https://proceedings.neurips.cc/paper_files/paper/2024/hash/6df3a719d99bd2479c04114d357003d0-Abstract-Conference.html",
      "title": "Artificial Generational Intelligence: Cultural Accumulation in Reinforcement Learning",
      "venue": "NeurIPS 2024",
      "year": 2024
    },
    "brief": {
      "zh": "把人类文明的代际累积搬进强化学习：智能体既独立探索又向上一代传承信息，分'情境内传承'（知识）与'权重内传承'（技能）两种世代，在相同经验预算下击败只活一世的个体。",
      "en": "Ports human civilization's cross-generational accumulation into reinforcement learning: agents both explore independently and inherit information from prior generations across 'in-context' (knowledge) and 'in-weights' (skill) generations, outperforming single-lifetime agents given the same experience budget."
    },
    "depth": {
      "overview": {
        "zh": "人类远超其他动物,不是单个大脑更强,而是知识能一代代累积。这项工作第一次让强化学习智能体也长出这条'文化棘轮'。",
        "en": "Humans surpass other animals not because any single brain is stronger, but because knowledge can accumulate generation after generation. This work is the first to give reinforcement-learning agents this same 'cultural ratchet.'"
      },
      "whyMatters": {
        "zh": "这个方向能否成立，关键取决于社会学习与独立探索能否被精细平衡——这道平衡本身正是文化能否真正积累（而非退化为模仿或失忆）的枢纽。",
        "en": "Whether this direction can hold depends on finely balancing social learning against independent exploration—this balance is itself the hinge on which genuine cultural accumulation turns, rather than collapsing into imitation or amnesia."
      },
      "ifAnswered": {
        "zh": "若累积棘轮可跨任务稳定运转，开放式学习或将不再依赖单个巨模型，而是依靠一条不断传承的智能体世系持续演进。",
        "en": "If the accumulation ratchet holds stably across tasks, open-ended learning may come not from one giant model but from a continually inheriting lineage of agents that keeps evolving."
      },
      "approaches": [
        {
          "zh": "把智能体训练拆成'情境内世代'（靠in-context learning在同一权重内累积知识）与'权重内世代'（靠in-weights learning把技能固化进参数）两条互补路径，让两者的平衡自发涌现出文化累积。",
          "en": "Split agent training into 'in-context generations' (accumulating knowledge via in-context learning within fixed weights) and 'in-weights generations' (consolidating skill into parameters via in-weights learning), letting the balance between the two spontaneously give rise to cultural accumulation."
        },
        {
          "zh": "参照'纯好奇能否单独支撑开放式发现'的追问，检验智能体的独立探索部分是否可换成一个不依赖外部奖励的内生好奇信号，以避免社会学习退化为盲目模仿。",
          "en": "Following the question of whether pure curiosity alone can sustain open-ended discovery, test whether the agent's independent-exploration component can be replaced by an intrinsic curiosity signal free of external reward, to keep social learning from degenerating into blind imitation."
        },
        {
          "zh": "借用'开放式系统真正判据'的追问，检验跨代累积出的能力是否满足'不断生成新颖且变难的问题、永不收敛'的开放式标准，而非只是对前代经验的压缩重述。",
          "en": "Borrow the question of the true criterion for open-endedness to test whether cross-generational accumulated capability meets the open-ended standard of endlessly generating novel and ever-harder problems without converging, rather than merely compressing and restating prior generations' experience."
        }
      ],
      "barrier": {
        "zh": "最硬的难点是这种平衡极难拿捏，偏一点就退化成盲目模仿或彻底失忆；'文化'能否累积出真正新颖（而非只是压缩前代）的能力，至今仍是悬而未决的开放问题。",
        "en": "The hardest difficulty is that this balance is extremely delicate—tilt either way and it degenerates into blind imitation or total amnesia; whether 'culture' can accumulate genuinely novel capability, rather than merely compressing prior generations, remains an unresolved open question."
      },
      "subQuestions": [
        {
          "zh": "一个没有任何外部目标、只追求「新颖性」本身的搜索过程，为什么常常比直接奔向目标更快找到目标？「目标即障碍」这个反直觉现象，揭示了关于发现的什么根本规律？",
          "en": "Why does a search process that pursues novelty for its own sake—with no external objective at all—so often reach hard goals faster than one aimed directly at them? What fundamental law of discovery does this counterintuitive 'objectives can be obstacles' phenomenon reveal?"
        },
        {
          "zh": "我们能不能造出一个真正「永不收敛」的开放式系统——一个像生物演化那样能无限生成新颖且不断变难的问题、永远不会停在某个局部最优的发现引擎？开放式的真正判据是什么？",
          "en": "Can we build a genuinely never-converging open-ended system—a discovery engine that, like biological evolution, endlessly generates novel and ever-harder problems and never settles into a local optimum? What is the true criterion for open-endedness?"
        },
        {
          "zh": "「好奇心」是否存在一个可形式化、可植入机器的内在驱动信号——一种与外部奖励无关、纯粹由「学习进展」或「可压缩性提升」定义的内生动机？纯好奇能否单独支撑起开放式发现？",
          "en": "Is there a formalizable, machine-implantable intrinsic drive underlying curiosity—an internal motivation defined purely by 'learning progress' or 'compression gain', independent of any external reward? Can pure curiosity alone sustain open-ended discovery?"
        }
      ]
    },
    "literature": [
      {
        "title": "Artificial Generational Intelligence: Cultural Accumulation in Reinforcement Learning",
        "venue": "NeurIPS 2024",
        "year": 2024,
        "url": "https://proceedings.neurips.cc/paper_files/paper/2024/hash/6df3a719d99bd2479c04114d357003d0-Abstract-Conference.html"
      },
      {
        "title": "Artificial Generational Intelligence (arXiv preprint)",
        "venue": "arXiv",
        "year": 2024,
        "url": "https://arxiv.org/abs/2406.00392"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 902,
      "y": 659,
      "scale": 0.91
    }
  },
  {
    "id": 116,
    "atlasN": 624,
    "slug": "quantum-simulators-probing-unknown-phases",
    "title": {
      "zh": "量子模拟器探未知物相",
      "en": "Quantum Simulators Probing Unknown Phases of Matter"
    },
    "qfocus": {
      "zh": "能否用可编程量子模拟器制备经典无法计算的多体态，从而实验性地发现理论尚未预言的新物质相与动力学？",
      "en": "Can programmable quantum simulators prepare classically incomputable many-body states to experimentally discover new phases of matter and dynamics that theory has not yet predicted?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C36",
      "zh": "异常驱动·新现象发现",
      "en": "Anomaly-Driven Discovery of New Phenomena"
    },
    "scores": [
      5,
      4,
      4,
      2,
      3,
      1,
      3,
      3,
      3
    ],
    "citation": {
      "url": "https://www.science.org/doi/10.1126/science.abi8794",
      "title": "Probing topological spin liquids on a programmable quantum simulator",
      "venue": "Science",
      "year": 2021
    },
    "brief": {
      "zh": "用可编程量子模拟器（冷原子、囚禁离子、超导阵列）直接制备并测量经典不可解的多体量子态，把量子硬件当作发现新物质相与非平衡动力学的实验望远镜。",
      "en": "Uses programmable quantum simulators (cold atoms, trapped ions, superconducting arrays) to directly prepare and measure classically unsolvable many-body quantum states, treating quantum hardware as an experimental telescope for discovering new phases of matter and nonequilibrium dynamics."
    },
    "depth": {
      "overview": {
        "zh": "强关联多体系统的相图大片未知，经典计算因指数墙无法到达。本方向用可编程量子模拟器（冷原子、囚禁离子、超导阵列）直接制备并测量这些经典不可解的量子态，把量子硬件当作发现新物质相与非平衡动力学的实验望远镜。它跨越量子模拟、凝聚态物理与基础物理。",
        "en": "Large swaths of the phase diagrams of strongly correlated many-body systems are unknown, unreachable by classical computation because of the exponential wall. This direction uses programmable quantum simulators (cold atoms, trapped ions, superconducting arrays) to directly prepare and measure these classically intractable quantum states, treating quantum hardware as an experimental telescope for discovering new phases of matter and non-equilibrium dynamics. It spans quantum simulation, condensed-matter physics, and fundamental physics."
      },
      "whyMatters": {
        "zh": "它把量子计算机从'算已知'转向'探未知'——在没有理论预言的参数区直接看会涌现什么相，这是量子模拟范式的根本转向。",
        "en": "It turns the quantum computer from 'computing the known' to 'probing the unknown'—directly seeing what phases emerge in parameter regimes with no theoretical prediction, a fundamental shift in the paradigm of quantum simulation."
      },
      "ifAnswered": {
        "zh": "若这条路径成立，量子硬件将从'计算已知'升级为'发现新物相'的实验工具，让实验先于理论抵达未知的物质状态。",
        "en": "If this path succeeds, quantum hardware would be upgraded from 'computing the known' to an experimental tool for discovering new phases of matter, letting experiment reach unknown states of matter ahead of theory."
      },
      "approaches": [
        {
          "zh": "在冷原子光晶格、囚禁离子、里德堡阵列、超导量子比特阵列上制备可调哈密顿量，扫描参数空间、测量序参量与关联，直接观察经典不可计算区涌现的新相（如奇异自旋液体、受限动力学、量子多体疤痕、测量诱导相变）。",
          "en": "Prepare tunable Hamiltonians on cold-atom optical lattices, trapped ions, Rydberg arrays, and superconducting qubit arrays; scan parameter space and measure order parameters and correlations to directly observe new phases emerging in the classically intractable regime (exotic spin liquids, constrained dynamics, quantum many-body scars, measurement-induced phase transitions)."
        },
        {
          "zh": "参照'机器能否发现未知的未知'的追问，探索能否让检测算法在不依赖已知相图先验的情况下，自动标记参数扫描中偏离所有已知模型的候选新相。",
          "en": "Drawing on the question of whether machines can discover unknown unknowns, explore whether detection algorithms can, without relying on a prior known phase diagram, automatically flag candidate new phases in parameter scans that deviate from every existing model."
        },
        {
          "zh": "借用'如何判断异常是新物理还是系统误差'的追问，用交叉验证、可证伪的标度律与有限尺寸分析，区分观测到的新相是真物理还是退相干/器件噪声假象。",
          "en": "Borrow the question of how to judge whether an anomaly is new physics or a systematic error, using cross-validation, falsifiable scaling laws, and finite-size analysis to distinguish whether an observed new phase is genuine physics or a decoherence/device-noise artifact."
        }
      ],
      "barrier": {
        "zh": "最硬壁垒是无金标准的验证：当模拟进入经典不可解区，如何确认观测到的新相是真物理而非器件噪声或退相干假象，是发现学与计量学的双重难题。",
        "en": "The hardest barrier is verification without a gold standard: once simulation enters the classically intractable regime, confirming that an observed new phase is real physics rather than an artifact of device noise or decoherence is a dual challenge for both discovery and metrology."
      },
      "subQuestions": [
        {
          "zh": "当一个反常观测出现时，我们如何在原理上区分「它是新物理的信号」还是「它只是未被建模的系统误差」？在确认之前，到底有没有可靠的判据来判断一个异常值得不值得追？",
          "en": "When an anomalous observation appears, how can we tell in principle whether it is a signal of new physics or merely an unmodeled systematic error? Before confirmation, is there any reliable criterion for whether an anomaly is worth chasing at all?"
        },
        {
          "zh": "我们能不能造出一台「异常探测器」——一个能在海量数据中自动认出「此前任何模型都没预测到的新现象」的系统，而不是只会找到我们事先告诉它要找的东西？机器能发现「未知的未知」吗？",
          "en": "Can we build an 'anomaly detector' that autonomously recognizes phenomena no prior model predicted—genuinely new things—rather than only finding what we told it in advance to look for? Can a machine discover the unknown unknowns?"
        },
        {
          "zh": "为什么有些异常被忽视几十年后才被重新发现为重大突破？是否存在一种系统性的「认知抑制」机制，让一个领域在心理与社会层面对不符合范式的观测视而不见？",
          "en": "Why are some anomalies ignored for decades before being rediscovered as major breakthroughs? Is there a systematic mechanism of 'cognitive suppression' by which a field, psychologically and socially, renders itself blind to observations that don't fit its paradigm?"
        }
      ]
    },
    "literature": [
      {
        "title": "Probing topological spin liquids on a programmable quantum simulator",
        "venue": "Science",
        "year": 2021,
        "url": "https://www.science.org/doi/10.1126/science.abi8794"
      },
      {
        "title": "Probing Topological Spin Liquids on a Programmable Quantum Simulator",
        "venue": "arXiv",
        "year": 2021,
        "url": "https://arxiv.org/abs/2104.04119"
      },
      {
        "title": "The Coming Decades of Quantum Simulation",
        "venue": "arXiv",
        "year": 2022,
        "url": "https://arxiv.org/abs/2204.08905"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 653,
      "y": 637,
      "scale": 0.84
    }
  },
  {
    "id": 117,
    "atlasN": 629,
    "slug": "anomaly-as-signal-cross-domain",
    "title": {
      "zh": "异常即信号的跨域发现科学",
      "en": "Anomaly-as-Signal: Cross-Domain Discovery Science"
    },
    "qfocus": {
      "zh": "能否把'不符合已知规律的离群点'系统化为'规则不完整'的指示器，建立跨天文、基因组、极地科学可复用的异常发现基准与方法？",
      "en": "Can outliers that violate known rules be systematized as indicators that 'the rules are incomplete', building reusable anomaly-discovery benchmarks and methods across astronomy, genomics, and polar science?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C36",
      "zh": "异常驱动·新现象发现",
      "en": "Anomaly-Driven Discovery of New Phenomena"
    },
    "scores": [
      4,
      5,
      4,
      3,
      3,
      3,
      2,
      3,
      4
    ],
    "citation": {
      "url": "https://www.aanda.org/articles/aa/full_html/2025/11/aa56339-25/aa56339-25.html",
      "title": "Interpreting the detection of anomalies in SDSS spectra",
      "venue": "Astronomy & Astrophysics",
      "year": 2025
    },
    "brief": {
      "zh": "把不符合已知规律的离群点当作'规则不完整'的指示器，建立跨天文、基因组、极地科学的可复用异常发现基准与方法，在巡天洪流中守候未知。",
      "en": "Treats outliers that violate known rules as indicators that 'the rules are incomplete', building reusable cross-domain anomaly-discovery benchmarks and methods across astronomy, genomics, and polar science—standing watch for the unknown amid the survey deluge."
    },
    "depth": {
      "overview": {
        "zh": "异常即信号科学把'不符合已知规律的离群'重新定位为科学发现的核心机制：异常往往意味着主导数据的规则不完整，需要新东西来解释。它正在把天体物理、基因组学、极地科学等迥异领域的异常发现统一为可复用、FAIR化的机器学习挑战与基准，横跨可解释ML与多个实验科学。",
        "en": "Anomaly-as-signal science recasts 'outliers that violate known rules' as a central engine of scientific discovery: an anomaly often means the rules governing the data are incomplete and something new is needed to explain it. It is unifying anomaly discovery across wildly different fields—astrophysics, genomics, polar science—into reusable, FAIR-ified machine-learning challenges and benchmarks, spanning interpretable ML and multiple experimental sciences."
      },
      "whyMatters": {
        "zh": "在Rubin天文台、平方公里阵列等即将产出数十亿源、远超人工检视能力的时代，自动发现'未知的未知'已成为刚需。",
        "en": "In an era when facilities like the Rubin Observatory and the Square Kilometre Array will produce billions of sources, far beyond human inspection capacity, automatically discovering the 'unknown unknowns' has become an urgent necessity."
      },
      "ifAnswered": {
        "zh": "若这套跨域异常发现基准得以建立，天文、基因组、极地科学的巡天洪流将不再淹没未知信号，人类得以在数十亿源级别的数据流中持续守候真正的新现象。",
        "en": "If this cross-domain anomaly-discovery framework can be established, the deluges of astronomical, genomic, and polar-science survey data would no longer drown out unknown signals, letting humanity keep watch for genuinely new phenomena amid billions of sources."
      },
      "approaches": [
        {
          "zh": "建立横跨天体物理、基因组、极地科学的统一数据集与FAIR化方案，让异常发现方法可以跨域迁移、可大规模算力化。",
          "en": "Build a unified dataset and FAIR-ification scheme spanning astrophysics, genomics, and polar science so anomaly-discovery methods become transferable across domains and scalable on large compute."
        },
        {
          "zh": "用可解释光谱异常检测与Fink中的'发现—跟进—分类'流水线，针对Rubin天文台、平方公里阵列级别的数据流寻找罕见与未知的瞬变源。",
          "en": "Use interpretable spectral anomaly detection and Fink's discover-followup-classify pipeline to search Rubin Observatory- and Square-Kilometre-Array-scale data streams for rare and unknown transient sources."
        },
        {
          "zh": "参照'机器能否发现未知的未知'的追问，让模型既完美编码已知科学行为、又能投影识别偏离所有已知模型的候选异常，而不仅是依赖'正常'的先验定义。",
          "en": "Drawing on the question of whether a machine can discover unknown unknowns, have the model both fully encode known scientific behavior and project to identify candidate anomalies that deviate from every existing model, rather than relying solely on a prior definition of 'normal.'"
        }
      ],
      "barrier": {
        "zh": "最硬的壁垒是异常检测要求模型既完美理解已知科学行为、又能识别自身知识范围之外——而且大量被标记的离群点至今无法解释、淹没了后续跟进能力。",
        "en": "The hardest barrier is that anomaly detection requires a model both to perfectly understand known scientific behavior and to recognize what lies beyond its own knowledge—and vast numbers of flagged outliers still defy explanation, swamping the capacity for follow-up."
      },
      "subQuestions": [
        {
          "zh": "当一个反常观测出现时，我们如何在原理上区分「它是新物理的信号」还是「它只是未被建模的系统误差」？在确认之前，到底有没有可靠的判据来判断一个异常值得不值得追？",
          "en": "When an anomalous observation appears, how can we tell in principle whether it is a signal of new physics or merely an unmodeled systematic error? Before confirmation, is there any reliable criterion for whether an anomaly is worth chasing at all?"
        },
        {
          "zh": "我们能不能造出一台「异常探测器」——一个能在海量数据中自动认出「此前任何模型都没预测到的新现象」的系统，而不是只会找到我们事先告诉它要找的东西？机器能发现「未知的未知」吗？",
          "en": "Can we build an 'anomaly detector' that autonomously recognizes phenomena no prior model predicted—genuinely new things—rather than only finding what we told it in advance to look for? Can a machine discover the unknown unknowns?"
        },
        {
          "zh": "为什么有些异常被忽视几十年后才被重新发现为重大突破？是否存在一种系统性的「认知抑制」机制，让一个领域在心理与社会层面对不符合范式的观测视而不见？",
          "en": "Why are some anomalies ignored for decades before being rediscovered as major breakthroughs? Is there a systematic mechanism of 'cognitive suppression' by which a field, psychologically and socially, renders itself blind to observations that don't fit its paradigm?"
        }
      ]
    },
    "literature": [
      {
        "title": "Building Machine Learning Challenges for Anomaly Detection in Science",
        "venue": "arXiv",
        "year": 2025,
        "url": "https://arxiv.org/abs/2503.02112"
      },
      {
        "title": "Anomaly detection in Fink. I. Discovery, follow-up, and classification of unusual sources",
        "venue": "arXiv",
        "year": 2026,
        "url": "https://arxiv.org/abs/2603.29511"
      },
      {
        "title": "Interpreting the detection of anomalies in SDSS spectra",
        "venue": "Astronomy & Astrophysics",
        "year": 2025,
        "url": "https://www.aanda.org/articles/aa/full_html/2025/11/aa56339-25/aa56339-25.html"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 847,
      "y": 658,
      "scale": 0.81
    }
  },
  {
    "id": 118,
    "atlasN": 663,
    "slug": "mining-disciplinary-fissures-atlas-of",
    "title": {
      "zh": "学科裂缝采矿（孤岛桥接图谱）",
      "en": "Mining Disciplinary Fissures (Atlas of Bridgeable Silos)"
    },
    "qfocus": {
      "zh": "能否用引文与共词网络系统定位学科之间几乎无连接的'结构洞'，把这些裂缝本身绘制成一份可勘探的跨界机会图谱？",
      "en": "Can citation and co-word networks systematically locate the near-unconnected 'structural holes' between disciplines, mapping those fissures themselves into a prospectable atlas of cross-boundary opportunity?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C38",
      "zh": "文献潜知·跨域桥接",
      "en": "Literature-based discovery & cross-domain bridging"
    },
    "scores": [
      4,
      5,
      4,
      4,
      4,
      4,
      2,
      2,
      4
    ],
    "citation": {
      "url": "https://www.science.org/doi/10.1126/science.1240474",
      "title": "Atypical Combinations and Scientific Impact",
      "venue": "Science",
      "year": 2013
    },
    "brief": {
      "zh": "用引文与共词网络定位学科间几乎无连接的结构洞，把这些裂缝本身做成可勘探的跨界机会图谱，引导研究者去填补跨界空白——在知识网络的洞里找机会。",
      "en": "Uses citation and co-word networks to locate near-unconnected structural holes between disciplines, turning those fissures into a prospectable atlas of cross-boundary opportunity that guides researchers to fill cross-border gaps—finding opportunity in the holes of the knowledge network."
    },
    "depth": {
      "overview": {
        "zh": "学科裂缝采矿用引文与共词网络识别学科间几乎没有连接的'结构洞'，把这些裂缝本身绘成可勘探的机会图谱，引导研究者去填补跨界空白。它横跨科学计量学、网络科学与知识图谱，把'哪里没人连'当作发现信号，而非只看'哪里最热'。",
        "en": "Mining disciplinary fissures uses citation and co-word networks to identify the \"structural holes\" where disciplines are almost unconnected, then maps those fissures into a prospectable atlas of opportunity to guide researchers toward filling cross-boundary blanks. It spans scientometrics, network science, and knowledge graphs, treating \"where no one has connected\" as a discovery signal rather than chasing \"where it's hottest.\""
      },
      "whyMatters": {
        "zh": "其重要性在于：突破常源于跨远域的非典型组合，而这些组合恰恰落在网络的结构洞里、被专业化掩盖。",
        "en": "Its significance lies in the fact that breakthroughs often arise from atypical combinations across distant domains—and those combinations fall precisely in the network's structural holes, obscured by specialization."
      },
      "ifAnswered": {
        "zh": "若学科裂缝真能被系统采矿，科研资助与个人选题就能从'追逐热点'转向'主动勘探结构洞'，把学科边界从屏障变成可开采的发现前沿。",
        "en": "If disciplinary fissures can genuinely be systematically mined, research funding and topic selection could shift from chasing hot spots to actively prospecting structural holes, turning disciplinary boundaries from barriers into a minable discovery frontier."
      },
      "approaches": [
        {
          "zh": "在共引/共词网络上量化领域对之间的结构洞与嵌入距离，标注'几乎无连接却语义可桥接'的裂缝，生成一份供社区认领勘探的跨界机会图谱。",
          "en": "Quantify structural holes and embedding distances between field pairs on co-citation/co-word networks, flag fissures that are 'almost unconnected yet semantically bridgeable', and generate a cross-border opportunity atlas for the community to claim and explore."
        },
        {
          "zh": "参照Swanson式的'文献潜知'发现路径——仅靠连接两片互不引用的文献推断新知——把裂缝采矿的产出对接到具体的A–B、B–C桥接假说上，让宏观地形图与微观假说互为表里。",
          "en": "Draw on Swanson-style literature-based discovery—inferring new knowledge merely by connecting two non-citing literatures—linking fissure-mining output to concrete A–B and B–C bridging hypotheses, so the macro terrain and micro hypotheses complement each other."
        },
        {
          "zh": "探索能否用大语言模型对'结构洞是否值得跨越'做初筛，用语义与因果先验区分有意义的可桥接洞与理应空着的洞，减少图谱沦为噪声地图的风险。",
          "en": "Explore whether large language models can perform an initial screen of 'whether a structural hole is worth crossing', using semantic and causal priors to distinguish meaningful bridgeable holes from holes that should stay empty, reducing the risk that the atlas becomes a map of noise."
        }
      ],
      "barrier": {
        "zh": "最硬的张力是结构洞的海量与真伪——绝大多数空白是因为本就无关，区分'有意义的可桥接洞'与'理应空着的洞'需要语义与因果先验，否则图谱只是一张噪声地图。",
        "en": "The sharpest tension is the sheer number of structural holes and their authenticity—most blanks exist because the fields are genuinely unrelated, so telling 'meaningful, bridgeable holes' from 'holes that should stay empty' requires semantic and causal priors, or the atlas is just a map of noise."
      },
      "subQuestions": [
        {
          "zh": "在已经发表却彼此从未引用的文献之间，到底潜藏着多少可被逻辑推出、却无人发现的「现成知识」？我们能否系统地把这些散落的 A–B 与 B–C 桥接成无人提出过的 A–C 发现？",
          "en": "Across already-published literatures that never cite one another, how much logically derivable yet undiscovered 'ready-made knowledge' lies hidden? Can we systematically bridge these scattered A–B and B–C links into A–C discoveries no one has ever proposed?"
        },
        {
          "zh": "科学知识为何会碎裂成互不沟通的「专业孤岛」？这种学科分割本身是不是当代最大的、被系统性低估的发现障碍——我们能否量化「跨域桥接」所损失的发现总量？",
          "en": "Why does scientific knowledge fracture into mutually uncommunicating 'specialty silos'? Is this disciplinary fragmentation itself the largest, most systematically underestimated obstacle to discovery today—and can we quantify the total discovery lost to missing cross-domain bridges?"
        },
        {
          "zh": "大语言模型能不能成为一台真正的「发现引擎」——不是检索或总结已知，而是在它压缩进权重的整个人类文献中，自主推出此前无人提出、且经得起实验检验的全新假设？",
          "en": "Can large language models become genuine 'discovery engines'—not retrieving or summarizing the known, but autonomously deriving, from the entire human literature compressed into their weights, novel hypotheses no one has proposed that survive experimental test?"
        }
      ]
    },
    "literature": [
      {
        "title": "Atypical Combinations and Scientific Impact",
        "venue": "Science",
        "year": 2013,
        "url": "https://www.science.org/doi/10.1126/science.1240474"
      },
      {
        "title": "Does the use of unusual combinations of datasets contribute to greater scientific impact?",
        "venue": "PNAS",
        "year": 2024,
        "url": "https://www.pnas.org/doi/10.1073/pnas.2402802121"
      },
      {
        "title": "Does the use of unusual combinations of datasets contribute to greater scientific impact?",
        "venue": "PNAS (PMC)",
        "year": 2024,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11474085/"
      },
      {
        "title": "Delayed Recognition: A Co-Citation Perspective",
        "venue": "PMC",
        "year": 2021,
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8028384/"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 889,
      "y": 501,
      "scale": 0.91
    }
  },
  {
    "id": 119,
    "atlasN": 1185,
    "slug": "generic-early-warning-signals-for",
    "title": {
      "zh": "临界转变的通用预警信号",
      "en": "Generic Early-Warning Signals for Critical Transitions"
    },
    "qfocus": {
      "zh": "能否把「临界慢化」这套普适前兆变成一套可运行的跨领域临界雷达，从判断「是否会翻越」走向定量预报「何时翻越」？",
      "en": "Can critical slowing down's universal precursors be turned into an operational cross-domain tipping-point radar that moves from judging whether a system will tip to forecasting when?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C39",
      "zh": "缺席·负空间科学",
      "en": "Absence & negative-space science"
    },
    "scores": [
      5,
      5,
      5,
      3,
      2,
      3,
      4,
      3,
      2
    ],
    "citation": {
      "url": "https://www.pnas.org/doi/10.1073/pnas.2106140118",
      "title": "Deep learning for early warning signals of tipping points",
      "venue": "PNAS",
      "year": 2021
    },
    "brief": {
      "zh": "通用预警信号基于「临界慢化」——系统在崩溃前恢复变慢、方差与自相关升高——这套普适前兆已被证实横跨气候、生态与人类系统；基于正规形标度律训练的深度学习探测器已能对从未见过的系统给出预警，方向正从「是否翻越」走向「何时翻越」的定量预报。",
      "en": "Generic early-warning signals rest on critical slowing down — recovery from perturbation grows sluggish while variance and autocorrelation rise before a system tips — a precursor confirmed across climate, ecological and human systems; deep-learning detectors trained on normal-form scaling laws now generalize warnings to systems they have never seen, and the frontier is shifting from forecasting whether a system tips to when."
    },
    "depth": {
      "overview": {
        "zh": "复杂系统在崩溃前往往先「变慢」：扰动后恢复得越来越吃力，方差与自相关悄悄抬头。通用预警信号试图把这套普适前兆，变成跨领域的临界雷达。",
        "en": "Complex systems tend to 'slow down' before they collapse: recovery from perturbation grows harder and harder, while variance and autocorrelation quietly creep up. Generic early-warning signals aim to turn this universal precursor into a cross-domain tipping-point radar."
      },
      "whyMatters": {
        "zh": "这套预警信号横跨气候、生态、流行病、金融与大脑等高风险领域，一旦能可靠预报「何时」临界翻越，将为提前干预争取宝贵时间；但只要虚警与提前量的问题未解，再普适的探测器也难以被真正信赖用于决策。",
        "en": "These precursors span high-stakes domains — climate, ecosystems, epidemics, finance, and the brain — so reliably forecasting 'when' a critical transition will occur could buy precious lead time for intervention; but until the false-alarm and lead-time problem is solved, even a universal detector cannot be fully trusted for real decisions."
      },
      "ifAnswered": {
        "zh": "方向正从「是否会翻越」走向定量预报「何时翻越」，直指 AMOC、亚马逊与疾病暴发等具体目标。",
        "en": "Heading from 'whether' a system will tip toward quantitatively forecasting 'when', for targets like the AMOC, the Amazon, and disease outbreaks."
      },
      "approaches": [
        {
          "zh": "用正规形与标度律训练深度学习分类器，使其对结构上从未见过的动力系统仍能给出预警（Bury 等，2021，PNAS）。",
          "en": "Train deep-learning classifiers on normal-form dynamics and scaling laws so warnings generalize to structurally unseen dynamical systems (Bury et al., 2021, PNAS)."
        },
        {
          "zh": "把方法从缓变分岔扩展到速率诱导临界（rate-induced tipping），覆盖更贴近真实强迫轨迹的翻越模式（Nature Machine Intelligence，2024）。",
          "en": "Extend the approach from slow bifurcations to rate-induced tipping, covering tipping modes closer to real forcing trajectories (Nature Machine Intelligence, 2024)."
        },
        {
          "zh": "系统综述气候、生态与人类系统中的临界点探测与预警案例，盘点跨领域可复用的信号与失败模式（Earth System Dynamics，2024）。",
          "en": "Systematically review tipping-point detection and early-warning cases across climate, ecological, and human systems to catalog reusable signals and failure modes (Earth System Dynamics, 2024)."
        }
      ],
      "barrier": {
        "zh": "最硬的张力是虚警与提前量：临界慢化在很多真实、噪声大的系统里信号微弱、易生假阳性；深度学习虽能泛化到未见系统，却难保证报出「何时」翻越而非仅「是否」。",
        "en": "The hardest tension is false alarms versus lead time: in many real, noisy systems the critical-slowing-down signal is weak and prone to false positives; while deep learning generalizes to unseen systems, it struggles to guarantee reporting 'when' a system tips rather than merely 'whether'."
      },
      "subQuestions": [
        {
          "zh": "科学几乎全部建立在「观测到的存在」之上——但「系统性的缺席」本身能不能成为一等证据？我们能否发展一门「负空间科学」，从「本该有却没有」中读出和从「有」中同样多的信息？",
          "en": "Science is built almost entirely on observed presence—but can systematic absence itself be first-class evidence? Can we develop a 'negative-space science' that reads as much from 'what should be there but isn't' as from what is?"
        },
        {
          "zh": "在所有「化学上可能、物理上不违法、却在自然界从未出现」的结构里，藏着什么信息？这片巨大的「未被占据的可能性空间」——负空间——是被某种隐藏约束禁止，还是仅仅尚未被探索？",
          "en": "What information hides in the set of all structures that are chemically possible and physically permitted yet never appear in nature? Is this vast 'unoccupied possibility space'—the negative space—forbidden by some hidden constraint, or merely as-yet unexplored?"
        },
        {
          "zh": "整个科学文献中存在系统性的「沉默」——做了却因不显著而从未发表的实验、无人报告的阴性结果。我们能不能重建这片「未发表的负空间」，让它和已发表的正空间一样可被分析？",
          "en": "The scientific literature contains a systematic silence—experiments done but never published because they were null, negative results no one reported. Can we reconstruct this 'unpublished negative space' and make it as analyzable as the published positive space?"
        }
      ]
    },
    "literature": [
      {
        "title": "Deep learning for early warning signals of tipping points",
        "venue": "PNAS",
        "year": 2021,
        "url": "https://www.pnas.org/doi/10.1073/pnas.2106140118"
      },
      {
        "title": "Tipping point detection and early warnings in climate, ecological, and human systems",
        "venue": "Earth System Dynamics",
        "year": 2024,
        "url": "https://esd.copernicus.org/articles/15/1117/2024/"
      },
      {
        "title": "Deep learning for predicting rate-induced tipping",
        "venue": "Nature Machine Intelligence",
        "year": 2024,
        "url": "https://www.nature.com/articles/s42256-024-00937-0"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 841,
      "y": 755,
      "scale": 0.82
    }
  },
  {
    "id": 120,
    "atlasN": 697,
    "slug": "the-detection-science-of-the",
    "title": {
      "zh": "影子生物圈的探测学",
      "en": "The Detection Science of the Shadow Biosphere"
    },
    "qfocus": {
      "zh": "地球上是否存在因用不同生化而被常规检测系统性遗漏的「影子生物圈」？我们能否设计出不预设标准生化的方法，在深地、荒漠等隔离环境中把它找出来？",
      "en": "Does Earth harbor a 'shadow biosphere' — life running on different biochemistry that conventional detection systematically misses? Can we design biochemistry-agnostic methods to find it in deep-subsurface and hyperarid isolated environments?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C40",
      "zh": "无关化学·生命探测",
      "en": "Agnostic Life Detection & Assembly Theory"
    },
    "scores": [
      5,
      5,
      4,
      2,
      4,
      2,
      1,
      2,
      5
    ],
    "citation": {
      "url": "https://www.liebertpub.com/doi/10.1089/ast.2008.0251",
      "title": "Signatures of a Shadow Biosphere",
      "venue": "Astrobiology",
      "year": 2009
    },
    "brief": {
      "zh": "影子生物圈的探测学针对一个激进假说：地球生命可能不止起源一次，存在用不同生化、因而被常规检测系统性遗漏的影子生命。2024年研究在阿塔卡马荒漠地下约4米发现与地表完全隔离的微生物群落，深部地壳与含水层被视为潜在庇护所；最硬的张力是检测的循环依赖——仪器按已知生命标定，对真正异源的生命可能毫无响应。",
      "en": "Detection science of the shadow biosphere tests a radical hypothesis: life may have arisen on Earth more than once, leaving 'shadow' life whose different biochemistry conventional assays systematically miss. A 2024 study found microbial communities fully isolated from the surface about four meters underground in Chile's Atacama, with the deep crust and aquifers seen as potential refugia; the hardest tension is detection's circularity — instruments calibrated to known life may give no response at all to a truly alien biochemistry."
    },
    "depth": {
      "overview": {
        "zh": "影子生物圈的探测学针对一个激进假说：地球生命可能不止起源一次，存在用不同生化、因而被常规检测系统性遗漏的'影子'生命。它发展专门的探测方法——非标准手性、异常元素利用、培养无关的活性信号——在阿塔卡马深层、深部岩石圈等极隔离环境搜寻。它桥接极端微生物学、替代生物化学与检测/计量方法学。",
        "en": "The Detection Science of the Shadow Biosphere addresses a radical hypothesis: life on Earth may have originated more than once, with a \"shadow\" biota running on different biochemistry and therefore systematically missed by conventional assays. It develops dedicated detection methods—non-standard chirality, anomalous elemental usage, culture-independent activity signals—to search ultra-isolated settings such as the deep Atacama and the deep rock biosphere. It bridges extremophile microbiology, alternative biochemistry, and detection/metrology methodology."
      },
      "whyMatters": {
        "zh": "它是地球版的「未知生命」：所有现有探针都默认标准生化，若影子生命存在就永远在我们的盲区。设计「看见未知生化」的方法意义根本。",
        "en": "It is the terrestrial version of \"unknown life\": every existing probe assumes standard biochemistry, so if shadow life exists it stays permanently in our blind spot—designing methods to \"see unknown biochemistry\" is fundamental."
      },
      "ifAnswered": {
        "zh": "若能确认影子生物圈存在，将证明地球生命并非只起源一次，为「在地球上找到另一种起源的生命」这一目标提供实证。",
        "en": "Confirming a shadow biosphere would show that life on Earth did not arise only once — delivering on the goal of finding a second, independently originated instance of life right here on Earth."
      },
      "approaches": [
        {
          "zh": "用不预设标准生化的探针——非标准手性、异常同位素与元素利用、培养无关的活性信号——在低生物量、强隔离环境中搜寻（如阿塔卡马地下、深部岩石圈）。",
          "en": "Deploy probes that assume no standard biochemistry — non-standard chirality, anomalous isotope and elemental usage, culture-independent activity signals — searching low-biomass, strongly isolated settings such as the Atacama subsurface and the deep rock biosphere."
        },
        {
          "zh": "借助组装理论提出的「组装指数」作为不依赖具体生化的复杂度判据，尝试判断某分子是否只能由类演化的选择过程产生（Q-C40-1）。",
          "en": "Draw on assembly theory's 'assembly index' as a biochemistry-agnostic complexity criterion for judging whether a molecule could only arise through an evolution-like selection process (Q-C40-1)."
        },
        {
          "zh": "反思「地球只有一个生命样本」对探测器设计的系统性偏见，尝试分离生命的普遍特征与地球的偶然特征（Q-C40-2）。",
          "en": "Interrogate how having 'only one sample of life (Earth)' systematically biases detector design, trying to separate life's universal features from Earth's contingent accidents (Q-C40-2)."
        }
      ],
      "barrier": {
        "zh": "最硬的壁垒是检测循环——我们的工具按已知生命标定，对真正异源的生命可能毫无响应，且极易被污染与已知极端微生物混淆。",
        "en": "The hardest barrier is the detection loop: our tools are calibrated to known life and may give no response at all to truly novel biochemistry, while contamination and confusion with known extremophiles are ever-present risks."
      },
      "subQuestions": [
        {
          "zh": "在不预设任何特定生物化学（不假设 DNA、蛋白质、甚至碳基）的前提下，我们能不能定义一个普适的「生命/非生命」判据——单凭一个分子的复杂度，就判断它是否只能由某种选择与演化过程产生？",
          "en": "Without presupposing any particular biochemistry—not DNA, not proteins, not even carbon—can we define a universal criterion for life versus non-life, judging from a molecule's complexity alone whether it could only have arisen through some process of selection and evolution?"
        },
        {
          "zh": "我们对「生命」的认知会不会被「只有一个样本（地球）」根本性地扭曲？在不知道生命还能以什么形式存在的情况下，我们设计的探测器是否注定只会找到我们已经认识的那种生命？",
          "en": "Is our conception of life fundamentally distorted by having a sample size of one (Earth)? Not knowing in what other forms life could exist, are the detectors we design doomed to find only the kind of life we already recognize?"
        },
        {
          "zh": "「复杂度」能否成为独立于物理与化学之外的第三种基本量——一个可以在分子、矿物、技术制品乃至外星物质上统一测量、用以判定「某物是否承载历史与选择」的普适标尺？",
          "en": "Can complexity become a third fundamental quantity beyond physics and chemistry—a universal yardstick, measurable alike on molecules, minerals, artifacts, and alien matter, for deciding whether something carries a history of selection?"
        }
      ]
    },
    "literature": [
      {
        "title": "Signatures of a Shadow Biosphere",
        "venue": "Astrobiology",
        "year": 2009,
        "url": "https://www.liebertpub.com/doi/10.1089/ast.2008.0251"
      },
      {
        "title": "Persistent microbial communities in hyperarid subsurface habitats of the Atacama Desert: Insights from intracellular DNA analysis",
        "venue": "PNAS Nexus",
        "year": 2024,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11037274/"
      },
      {
        "title": "Life as We Don't Know It (alternative biochemistries and shadow life)",
        "venue": "Astrobiology",
        "year": 2024,
        "url": "https://www.liebertpub.com/doi/full/10.1089/ast.2021.0103"
      },
      {
        "title": "Subsurface Life on Earth as a Key to Unlock Extraterrestrial Mysteries",
        "venue": "Life",
        "year": 2024,
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12712870/"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 745,
      "y": 583,
      "scale": 0.83
    }
  },
  {
    "id": 121,
    "atlasN": 698,
    "slug": "the-habitability-boundaries-of-alien",
    "title": {
      "zh": "异类化学的可栖性边界",
      "en": "The Habitability Boundaries of Alien Chemistry"
    },
    "qfocus": {
      "zh": "碳-水生化是生命的必然选择，还是地球的偶然特例？我们能否系统枚举非水溶剂、替代元素骨架等「另类生化」，画出生命所需化学的真实边界？",
      "en": "Is carbon-water biochemistry a necessity for life, or just Earth's contingent special case? Can we systematically enumerate non-aqueous solvents and alternative elemental scaffolds to chart the true chemical boundary of what life requires?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C40",
      "zh": "无关化学·生命探测",
      "en": "Agnostic Life Detection & Assembly Theory"
    },
    "scores": [
      5,
      5,
      3,
      2,
      4,
      2,
      1,
      2,
      5
    ],
    "citation": {
      "url": "https://www.pnas.org/doi/10.1073/pnas.2318905121",
      "title": "Solvent constraints for biopolymer folding and evolution in extraterrestrial environments",
      "venue": "PNAS",
      "year": 2024
    },
    "brief": {
      "zh": "异类化学的可栖性边界系统探索非水溶剂（如氨、超临界CO₂）、替代元素骨架与非标准信息载体，标定生命所需化学的真实边界，而非把地球碳-水生化误当唯一解；核心问题是碳-水生化究竟是必然还是偶然。最硬的张力是实验可达性极低，理论枚举与可证伪实验之间存在巨大鸿沟。",
      "en": "Habitability boundaries of alien chemistry systematically explore non-aqueous solvents (ammonia, supercritical CO₂), alternative elemental scaffolds, and non-standard information carriers to chart the true chemical boundary life requires, rather than mistaking Earth's carbon-water biochemistry for the only solution; the core question is whether carbon-water biochemistry is necessary or merely contingent. The hardest tension is very low experimental reach, leaving a wide gulf between theoretical enumeration and falsifiable experiment."
    },
    "depth": {
      "overview": {
        "zh": "异类化学的可栖性边界系统探索'另一种生化'的可能性：非水溶剂（如氨、超临界CO₂）、替代元素骨架、非标准信息载体，目的是标定'生命所需化学'的真实边界，而非把地球碳水生化误当唯一解。它横跨化学、天体生物学与材料/复杂系统，是对'生命可能是什么'的硬核枚举。",
        "en": "The Habitability Boundaries of Alien Chemistry systematically explores the possibilities of \"another biochemistry\": non-aqueous solvents (such as ammonia or supercritical CO₂), alternative elemental scaffolds, and non-standard information carriers, aiming to chart the true boundary of \"the chemistry life requires\" rather than mistaking Earth's carbon-water biochemistry for the only solution. Spanning chemistry, astrobiology, and materials/complex systems, it is a hardcore enumeration of \"what life could be.\""
      },
      "whyMatters": {
        "zh": "重要性在于：宜居带、生物标记、地外探测全建在地球生化假设上；不划清边界，我们其实是在用一个样本定义整个可能性空间。",
        "en": "It matters because habitable zones, biosignatures, and the search for extraterrestrial life are all built on Earth-biochemistry assumptions; without drawing the boundary clearly, we are effectively defining the entire space of possibilities from a single sample."
      },
      "ifAnswered": {
        "zh": "划出生命可用化学的真边界，让宜居带判断、生物标记设计与地外探测不再默认地球碳-水生化是唯一解。",
        "en": "Drawing the true boundary of life-capable chemistry, so that habitable-zone judgments, biosignature design, and the search for extraterrestrial life no longer default to assuming Earth's carbon-water biochemistry is the only solution."
      },
      "approaches": [
        {
          "zh": "从溶剂物性（极性、温度窗、对大分子稳定性）、元素可替代性与信息聚合物的化学约束出发，枚举生命可用化学的候选空间。",
          "en": "Enumerate the candidate space of life-usable chemistry starting from solvent properties (polarity, temperature window, macromolecule stability), elemental substitutability, and the chemical constraints on information polymers."
        },
        {
          "zh": "把这些化学约束转译为可观测的可栖性判据，反哺地外探测与生物标记设计（与'不可知生物标记'互补：一个问如何探测，一个问可能存在什么）。",
          "en": "Translate these chemical constraints into observable habitability criteria that feed back into exoplanet detection and biosignature design (complementary to agnostic biosignatures: one asks how to detect, this asks what could exist)."
        },
        {
          "zh": "借助组装理论的「组装指数」作为不依赖特定生化的复杂度判据，探讨是否存在独立于载体的生命判据（Q-C40-1）。",
          "en": "Draw on assembly theory's 'assembly index' as a biochemistry-independent complexity criterion, exploring whether a substrate-independent criterion for life exists (Q-C40-1)."
        }
      ],
      "barrier": {
        "zh": "最硬的张力是实验可达性极低——多数另类生化条件难在地球实验室稳定实现，理论枚举与可证伪实验之间存在巨大鸿沟，易流于思辨。",
        "en": "The hardest tension is extremely low experimental accessibility—most alien-biochemistry conditions are hard to stabilize in terrestrial labs, leaving a vast gulf between theoretical enumeration and falsifiable experiment, and a temptation to drift into speculation."
      },
      "subQuestions": [
        {
          "zh": "在不预设任何特定生物化学（不假设 DNA、蛋白质、甚至碳基）的前提下，我们能不能定义一个普适的「生命/非生命」判据——单凭一个分子的复杂度，就判断它是否只能由某种选择与演化过程产生？",
          "en": "Without presupposing any particular biochemistry—not DNA, not proteins, not even carbon—can we define a universal criterion for life versus non-life, judging from a molecule's complexity alone whether it could only have arisen through some process of selection and evolution?"
        },
        {
          "zh": "我们对「生命」的认知会不会被「只有一个样本（地球）」根本性地扭曲？在不知道生命还能以什么形式存在的情况下，我们设计的探测器是否注定只会找到我们已经认识的那种生命？",
          "en": "Is our conception of life fundamentally distorted by having a sample size of one (Earth)? Not knowing in what other forms life could exist, are the detectors we design doomed to find only the kind of life we already recognize?"
        },
        {
          "zh": "「复杂度」能否成为独立于物理与化学之外的第三种基本量——一个可以在分子、矿物、技术制品乃至外星物质上统一测量、用以判定「某物是否承载历史与选择」的普适标尺？",
          "en": "Can complexity become a third fundamental quantity beyond physics and chemistry—a universal yardstick, measurable alike on molecules, minerals, artifacts, and alien matter, for deciding whether something carries a history of selection?"
        }
      ]
    },
    "literature": [
      {
        "title": "Solvent constraints for biopolymer folding and evolution in extraterrestrial environments",
        "venue": "PNAS",
        "year": 2024,
        "url": "https://www.pnas.org/doi/10.1073/pnas.2318905121"
      },
      {
        "title": "Life as We Don't Know It",
        "venue": "Astrobiology",
        "year": 2024,
        "url": "https://www.liebertpub.com/doi/full/10.1089/ast.2021.0103"
      },
      {
        "title": "The Astrobiology Primer v2.0 (alternative solvents and biochemistries)",
        "venue": "Astrobiology",
        "year": 2016,
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4683543/"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 982,
      "y": 698,
      "scale": 0.79
    }
  },
  {
    "id": 122,
    "atlasN": 716,
    "slug": "collider-anomaly-detection-transplanted-to",
    "title": {
      "zh": "对撞机异常检测移植生态盲发现",
      "en": "Collider Anomaly Detection Transplanted to Blind Ecological Discovery"
    },
    "qfocus": {
      "zh": "能否把大型强子对撞机「不预设新物理假设、直接从数据找偏离」的无监督异常检测，移植到生态告警流与巡天暂现源，造出一套能捕捉「未知的未知」的通用探针？",
      "en": "Can the LHC's unsupervised anomaly detection — searching data for deviations without presupposing a specific new-physics hypothesis — be transplanted into ecological alert streams and astronomical transient surveys to build a general-purpose probe for the 'unknown unknowns'?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C41",
      "zh": "跨域方法移植",
      "en": "Cross-Domain Method Transplant"
    },
    "scores": [
      5,
      5,
      4,
      2,
      4,
      3,
      2,
      2,
      4
    ],
    "citation": {
      "url": "https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.132.081801",
      "title": "Search for New Phenomena in Two-Body Invariant Mass Distributions Using Unsupervised Machine Learning for Anomaly Detection at √s=13 TeV with the ATLAS Detector",
      "venue": "Physical Review Letters",
      "year": 2024
    },
    "brief": {
      "zh": "把大型强子对撞机不预设超出标准模型假设、直接在数据里搜偏离的无监督异常检测，移植到生态告警流与巡天暂现源。2024年ATLAS已将「发现新粒子」重述为对平滑背景的偏离假设检验；天文侧的MCIF方法在ZTF模拟流中追踪约2000条候选即召回约75%稀有暂现。最硬的张力在去相关与虚警控制——异常分数极易被采样偏差、季节性与仪器漂移污染。",
      "en": "Transplants the LHC's unsupervised anomaly detection — searching data for deviations without assuming a specific beyond-Standard-Model signal — into ecological alert streams and astronomical transient surveys. In 2024 ATLAS recast 'discovering a new particle' as testing for deviations from a smooth background; on the astronomy side, MCIF recovers about 75% of rare transients while flagging only ~2000 candidates in simulated ZTF streams. The hardest tension is decorrelation and false-alarm control — anomaly scores are easily polluted by sampling bias, seasonality, and instrument drift."
    },
    "depth": {
      "overview": {
        "zh": "把大型强子对撞机'不预设超出标准模型假设、直接在数据里找偏离'的无监督/去相关异常检测，移植到生态告警流、巡天暂现源与环境组学数据，把'分类器即异常探测器'转成发现未知物种、未知暂现天体、未知群落状态的通用探针。它横跨高能物理、生态学/天文学与机器学习三个遥远学科。",
        "en": "Transplants the LHC's unsupervised, decorrelated anomaly detection (which searches data for departures without assuming a specific beyond-Standard-Model hypothesis) to ecological alert streams, transient sky surveys, and environmental omics data, turning the principle of 'a classifier is an anomaly detector' into a general-purpose probe for discovering unknown species, unknown astrophysical transients, and unknown community states. It spans three distant disciplines: high-energy physics, ecology/astronomy, and machine learning."
      },
      "whyMatters": {
        "zh": "重要性在于'未知的未知'最难——你无法为没想到的现象写模型；对撞机社区已把异常检测做成'每次搜索都附带找异常'的范式，正可解生态与巡天的盲发现难题。",
        "en": "Its importance lies in the fact that the unknown unknowns are the hardest target: you cannot write a model for a phenomenon you never imagined. The collider community has already made anomaly detection a paradigm in which every search comes with a built-in anomaly hunt, which is exactly what blind discovery in ecology and sky surveys needs."
      },
      "ifAnswered": {
        "zh": "为生态、天文与其他领域的'未知的未知'打造一套通用探针，让发现新物种、新暂现天体或新群落状态不再依赖先猜到它们的样子。",
        "en": "Delivering a general-purpose probe for the 'unknown unknowns' in ecology, astronomy, and beyond — so that discovering new species, new transients, or new community states no longer depends on guessing their shape in advance."
      },
      "approaches": [
        {
          "zh": "把监督分类器直接改造成'分类器即异常探测器'，用多背景表示学习与去相关方法（如DisCo）控制系统性偏差，泛化到不同背景假设（如ATLAS 2024）。",
          "en": "Turn supervised classifiers directly into anomaly detectors ('a classifier is an anomaly detector'), using multi-background representation learning and decorrelation methods (like DisCo) to control systematic bias across background hypotheses (as in ATLAS 2024)."
        },
        {
          "zh": "在天文暂现源里，用分类器潜空间训练逐类隔离森林（MCIF），在低虚警下高召回稀有暂现（千新星、对不稳定超新星）。",
          "en": "In astronomical transients, train per-class isolation forests in a classifier's latent space (MCIF) to recover rare transients (kilonovae, pair-instability supernovae) at a low false-alarm rate."
        },
        {
          "zh": "追问'方法移植'能否系统化而非只靠天才偶遇——绘制一张跨学科的'方法同构图'，预测哪些方法该被搬到哪些问题上（Q-C41-1）。",
          "en": "Ask whether method-transplant itself can be systematized rather than left to chance — mapping a cross-disciplinary 'graph of method isomorphisms' that predicts which methods should move to which problems (Q-C41-1)."
        }
      ],
      "barrier": {
        "zh": "最硬的张力是去相关/鲁棒性：异常分数极易被采样偏差、季节性与仪器漂移污染，把背景涨落误报成新现象。",
        "en": "The sharpest tension is decorrelation and robustness: anomaly scores are easily contaminated by sampling bias, seasonality, and instrumental drift, flagging background fluctuations as spurious new phenomena."
      },
      "subQuestions": [
        {
          "zh": "为什么科学史上最大的突破常常来自把一个领域的方法整体移植到另一个领域（如把统计力学搬进信息论、把演化搬进算法）？这种「方法移植」能否被系统化，而不是只靠天才偶遇？",
          "en": "Why do the biggest breakthroughs in the history of science so often come from wholesale transplanting one field's method into another (statistical mechanics into information theory, evolution into algorithms)? Can such method-transplant be systematized rather than left to the chance meetings of geniuses?"
        },
        {
          "zh": "不同学科里反复出现的「同一个数学结构」（幂律、相变、网络、重整化），究竟是自然界的深层统一，还是我们认知模式的投影？我们能否分辨一个跨域类比是真同构，还是误导性的表面相似？",
          "en": "When the same mathematical structure recurs across disciplines (power laws, phase transitions, networks, renormalization), is it a deep unity of nature or a projection of our own cognitive patterns? Can we distinguish a true cross-domain isomorphism from a misleading surface resemblance?"
        },
        {
          "zh": "我们能不能建造一台「类比引擎」——一个能在所有学科之间自动搜寻深层结构对应、主动提议「把 A 领域的解法搬到 B 领域的难题」的系统，从而把跨域移植规模化、自动化？",
          "en": "Can we build an 'analogy engine'—a system that automatically searches for deep structural correspondences across all disciplines and proactively proposes 'transplant field A's solution to field B's open problem'—thereby scaling and automating cross-domain transplant?"
        }
      ]
    },
    "literature": [
      {
        "title": "Search for New Phenomena in Two-Body Invariant Mass Distributions Using Unsupervised Machine Learning for Anomaly Detection at √s=13 TeV with the ATLAS Detector",
        "venue": "Physical Review Letters",
        "year": 2024,
        "url": "https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.132.081801"
      },
      {
        "title": "A Classifier-Based Approach to Multi-Class Anomaly Detection for Astronomical Transients",
        "venue": "RAS Techniques and Instruments",
        "year": 2024,
        "url": "https://academic.oup.com/rasti/article/doi/10.1093/rasti/rzae054/7914338"
      },
      {
        "title": "Robust Anomaly Detection for Particle Physics Using Multi-Background Representation Learning",
        "venue": "Machine Learning: Science and Technology",
        "year": 2024,
        "url": "https://iopscience.iop.org/article/10.1088/2632-2153/ad780c/meta"
      },
      {
        "title": "DisCo Fever: Robust Networks Through Distance Correlation",
        "venue": "arXiv (hep-ph) / JHEP",
        "year": 2020,
        "url": "https://arxiv.org/abs/2001.05310"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 652,
      "y": 710,
      "scale": 0.81
    }
  },
  {
    "id": 123,
    "atlasN": 1193,
    "slug": "functorial-cross-domain-structure-transport",
    "title": {
      "zh": "函子式跨域结构移植（应用范畴论迁移方法论）",
      "en": "Functorial Cross-Domain Structure Transport (Applied Category Theory as Transfer Methodology)"
    },
    "qfocus": {
      "zh": "当两个领域「讲的是同一个故事」时，能不能不靠比喻、而靠函子等范畴论工具给出可证明保结构的形式映射，让跨域移植的保真性像类型检查一样可自动验证？",
      "en": "When two domains 'tell the same story', can we skip the metaphor and use categorical tools like functors to provide a provably structure-preserving formal mapping — making a cross-domain transplant's fidelity as auto-checkable as a type system?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C41",
      "zh": "跨域方法移植",
      "en": "Cross-Domain Method Transplant"
    },
    "scores": [
      5,
      5,
      4,
      3,
      4,
      5,
      3,
      3,
      4
    ],
    "citation": {
      "url": "https://arxiv.org/abs/2402.15332",
      "title": "Position: Categorical Deep Learning is an Algebraic Theory of All Architectures",
      "venue": "ICML 2024 (PMLR 235)",
      "year": 2024
    },
    "brief": {
      "zh": "应用范畴论把跨域方法移植重新定义为函子——一种保运算结构的映射，让'两个领域是同一个数学对象'从修辞变成可检验的命题。2024年Gavranović等在ICML的立场论文主张用2-范畴中的参数化映射统一几乎所有神经网络架构，是该方向的标志性里程碑。",
      "en": "Applied category theory redefines cross-domain method transplant as a functor — a structure-preserving mapping — turning the claim that 'two domains are the same mathematical object' from rhetoric into a testable proposition. In 2024, Gavranović et al.'s ICML position paper argued for unifying nearly all neural network architectures via parametrized maps in a 2-category, a landmark for this direction."
    },
    "depth": {
      "overview": {
        "zh": "当两个领域「讲的是同一个故事」时，能不能不靠比喻、而靠数学证明把方法搬过去？应用范畴论正把这种「同构驱动的迁移」变成可组合、可验证的形式工程。",
        "en": "When two domains 'tell the same story', can the method be carried across by mathematical proof rather than metaphor? Applied category theory is turning this 'isomorphism-driven transfer' into composable, verifiable formal engineering."
      },
      "whyMatters": {
        "zh": "它的意义在于把跨域方法移植的保真性问题——搬过去的结构是否真的等价——从难以核实的类比，升级为可用函子、伴随与弦图形式化检验的数学命题，让「同构驱动的迁移」从直觉变成可组合、可验证的方法论。",
        "en": "Its importance lies in upgrading the fidelity question of cross-domain method transplant — whether the carried-over structure is truly equivalent — from an analogy that resists verification into a mathematical proposition checkable via functors, adjunctions, and string diagrams, turning isomorphism-driven transfer from intuition into a composable, verifiable methodology."
      },
      "ifAnswered": {
        "zh": "从「每个架构各自论证正确性」走向统一的范畴语义，让跨域移植的保真性像类型检查一样可自动验证。",
        "en": "Heading toward a unified categorical semantics where a cross-domain transplant's fidelity is auto-checkable like a type system, rather than argued case by case."
      },
      "approaches": [
        {
          "zh": "用函子与伴随把一个领域已验证的结构映射到另一个领域，并用弦图使映射过程可视化、可组合。",
          "en": "Use functors and adjunctions to map an already-validated structure from one domain into another, with string diagrams making the mapping process visual and composable."
        },
        {
          "zh": "以2-范畴中的参数化映射，尝试一次性统一几乎所有神经网络架构的约束与实现（Gavranović 等，ICML 2024 立场论文）。",
          "en": "Use parametrized maps in a 2-category to try to unify the constraints and implementations of nearly all neural network architectures at once (Gavranović et al., ICML 2024 position paper)."
        },
        {
          "zh": "追问不同学科反复出现的同一数学结构（幂律、相变、网络、重整化）究竟是自然界的深层统一还是认知投影，为判断「真同构还是表面相似」寻找判据（Q-C41-2）。",
          "en": "Probe whether recurring mathematical structures across disciplines (power laws, phase transitions, networks, renormalization) reflect a deep unity of nature or merely a projection of our cognition, seeking a criterion for 'true isomorphism vs. surface resemblance' (Q-C41-2)."
        }
      ],
      "barrier": {
        "zh": "最硬的张力：范畴框架抽象层级极高，能优雅「重述」已知结构，却很难产出该领域尚不知道的新预测；「保结构」是否等于「保有用性」仍缺可证伪判据。",
        "en": "The hardest tension: the categorical framework operates at such a high level of abstraction that it can elegantly 'restate' already-known structure, yet rarely produces new predictions the field doesn't already know; whether 'structure-preserving' equals 'usefulness-preserving' still lacks a falsifiable criterion."
      },
      "subQuestions": [
        {
          "zh": "为什么科学史上最大的突破常常来自把一个领域的方法整体移植到另一个领域（如把统计力学搬进信息论、把演化搬进算法）？这种「方法移植」能否被系统化，而不是只靠天才偶遇？",
          "en": "Why do the biggest breakthroughs in the history of science so often come from wholesale transplanting one field's method into another (statistical mechanics into information theory, evolution into algorithms)? Can such method-transplant be systematized rather than left to the chance meetings of geniuses?"
        },
        {
          "zh": "不同学科里反复出现的「同一个数学结构」（幂律、相变、网络、重整化），究竟是自然界的深层统一，还是我们认知模式的投影？我们能否分辨一个跨域类比是真同构，还是误导性的表面相似？",
          "en": "When the same mathematical structure recurs across disciplines (power laws, phase transitions, networks, renormalization), is it a deep unity of nature or a projection of our own cognitive patterns? Can we distinguish a true cross-domain isomorphism from a misleading surface resemblance?"
        },
        {
          "zh": "我们能不能建造一台「类比引擎」——一个能在所有学科之间自动搜寻深层结构对应、主动提议「把 A 领域的解法搬到 B 领域的难题」的系统，从而把跨域移植规模化、自动化？",
          "en": "Can we build an 'analogy engine'—a system that automatically searches for deep structural correspondences across all disciplines and proactively proposes 'transplant field A's solution to field B's open problem'—thereby scaling and automating cross-domain transplant?"
        }
      ]
    },
    "literature": [
      {
        "title": "Position: Categorical Deep Learning is an Algebraic Theory of All Architectures",
        "venue": "ICML 2024 (PMLR 235)",
        "year": 2024,
        "url": "https://arxiv.org/abs/2402.15332"
      },
      {
        "title": "Category-Theoretical and Topos-Theoretical Frameworks in Machine Learning: A Survey",
        "venue": "Axioms (MDPI)",
        "year": 2025,
        "url": "https://www.mdpi.com/2075-1680/14/3/204"
      },
      {
        "title": "Towards a Categorical Foundation of Deep Learning: A Survey",
        "venue": "arXiv",
        "year": 2024,
        "url": "https://arxiv.org/abs/2410.05353"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 830,
      "y": 576,
      "scale": 0.75
    }
  },
  {
    "id": 124,
    "atlasN": 1280,
    "slug": "observation-native-forecasting-end-to",
    "title": {
      "zh": "观测直达预报：跳过资料同化的端到端天气 AI",
      "en": "Observation-native forecasting: end-to-end weather AI that bypasses data assimilation"
    },
    "qfocus": {
      "zh": "能否用单个神经网络直接从原始卫星辐射与常规观测学习并初始化全球预报，从而绕开数值天气预报赖以生存数十年的资料同化与再分析管线？",
      "en": "Can a single neural network learn to initialize global forecasts directly from raw satellite radiances and routine observations, bypassing the data-assimilation and reanalysis pipeline NWP has relied on for decades?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C45",
      "zh": "地理空间AI·数字地球",
      "en": "Geospatial AI · Digital Earth"
    },
    "scores": [
      5,
      4,
      4,
      1,
      2,
      3,
      4,
      3,
      3
    ],
    "citation": {
      "url": "https://www.nature.com/articles/s41586-025-08897-0",
      "title": "End-to-end data-driven weather prediction (Aardvark Weather)",
      "venue": "Nature",
      "year": 2025
    },
    "brief": {
      "zh": "传统数值预报依赖资料同化把观测翻译成网格初值，这条管线占据业务中心数十年。2024–2025 年，Aardvark Weather（Nature 2025）与 ECMWF 的 GraphDOP 各自独立证明，单个神经网络可以直接从卫星亮温和常规观测学习并初始化预报，且用远少于传统方法的输入数据与算力在多变量上跑赢 GFS。",
      "en": "Traditional NWP depends on data assimilation to translate observations into gridded initial states, a pipeline that has anchored operational forecasting for decades. In 2024-2025, Aardvark Weather (Nature 2025) and ECMWF's GraphDOP independently showed that a single neural network can learn and initialize forecasts directly from satellite brightness temperatures and routine observations, beating GFS on multiple variables with far less input data and compute."
    },
    "depth": {
      "overview": {
        "zh": "上一波天气 AI 仍以 ERA5 再分析为拐杖；这条新路线直接吃原始观测——卫星亮温、站点报文——单个网络一步产出全球预报。",
        "en": "The previous wave of weather AI still leaned on ERA5 reanalysis as a crutch; this new route ingests raw observations directly — satellite brightness temperatures, station reports — and a single network produces a global forecast in one step."
      },
      "whyMatters": {
        "zh": "最硬的难点是校验——没有再分析做真值，如何确认模型内部学到的「大气状态」不是幻觉；这直接决定观测直达路线能否被信任为业务预报的基座。",
        "en": "The hardest difficulty is validation — without reanalysis as ground truth, how to confirm the \"atmospheric state\" the model has internally learned is not a hallucination; this directly decides whether the observation-native route can be trusted as an operational forecasting foundation."
      },
      "ifAnswered": {
        "zh": "未来 3–5 年，观测直达系统可能把再分析从预报链条的必需品变为可选品，重塑对地观测数据的价值链。",
        "en": "Within 3-5 years, observation-native systems could demote reanalysis from a necessity to an option, reshaping the value chain of Earth observations."
      },
      "approaches": [
        {
          "zh": "用可微分神经网络端到端学习「观测→预报」映射，跳过显式资料同化步骤（如 Aardvark Weather、GraphDOP）。",
          "en": "Train a differentiable neural network end-to-end on the \"observation-to-forecast\" mapping, skipping the explicit data-assimilation step (as in Aardvark Weather and GraphDOP)."
        },
        {
          "zh": "把该路线纳入现有业务 AI 预报系统的演进路径（如 ECMWF 的 AIFS-DOP），让端到端观测学习从概念验证走向准业务实验。",
          "en": "Fold the route into the evolution path of existing operational AI forecasting systems (e.g. ECMWF's AIFS-DOP), moving end-to-end observation learning from proof-of-concept toward quasi-operational trials."
        },
        {
          "zh": "针对灰天鹅式尾部极端事件，检验模型是在外推物理还是内插训练分布，为观测直达预报建立可外推区的事前判据。",
          "en": "For gray-swan tail events, test whether the model is extrapolating physics or merely interpolating the training distribution, establishing an a-priori criterion for the extrapolable regime of observation-native forecasting."
        }
      ],
      "barrier": {
        "zh": "没有再分析做真值，如何校验模型内部学到的「大气状态」不是幻觉；且观测系统一旦变化（卫星退役、新仪器上线），端到端模型的再训练成本与稳定性仍是未知数。",
        "en": "With no reanalysis serving as ground truth, it is unclear how to verify that the \"atmospheric state\" the model has learned internally is not a hallucination; and once the observing system changes (satellites retired, new instruments coming online), the retraining cost and stability of the end-to-end model remain unknown."
      },
      "subQuestions": [
        {
          "zh": "当一次极端事件强到、罕到训练集里根本没有先例时（灰天鹅），数据驱动的 AI 地球与天气模型究竟是在从已知物理外推、还是只能内插已见过的样本——我们如何在事前就判断一次预报落在了模型的可外推区还是幻觉区？",
          "en": "When an extreme event is so rare and so intense that nothing like it exists in the training set (a gray swan), are data-driven AI weather and Earth models genuinely extrapolating from physics or merely interpolating seen samples — and how can we tell, before the fact, whether a given forecast lies inside the model's extrapolable regime or its hallucination regime?"
        },
        {
          "zh": "如果换一套基准、下游任务和微调协议就能改变地理空间基础模型的排名、甚至让简单监督基线反超，那「哪个对地观测基础模型更强」这一问法本身是否良定义——我们到底是在度量模型，还是在度量评测的选择？",
          "en": "If swapping the benchmark, the downstream tasks, or the fine-tuning protocol can reshuffle the ranking of geospatial foundation models — sometimes letting a plain supervised baseline win — is the question \"which Earth-observation foundation model is better\" even well-posed, and are we measuring the models or the choices of the evaluation?"
        },
        {
          "zh": "当一个生成模型补全缺失的卫星波段、把 100 公里场超分到公里级、或把再分析与模拟「装进同一个瓶子」时，它产出的像素究竟该被当作观测、还是当作有先验约束的猜测——在什么可检验的条件下，一次生成的对地观测可以承担真实测量的认知地位？",
          "en": "When a generative model fills in a missing satellite band, super-resolves a 100-km field to kilometer scale, or puts reanalysis and simulation \"in the same bottle\", should its output pixels count as observations or as prior-constrained guesses — and under what testable conditions may a generated Earth observation carry the epistemic standing of a real measurement?"
        }
      ]
    },
    "literature": [
      {
        "title": "End-to-end data-driven weather prediction (Aardvark Weather)",
        "venue": "Nature",
        "year": 2025,
        "url": "https://www.nature.com/articles/s41586-025-08897-0"
      },
      {
        "title": "GraphDOP: Towards skilful data-driven medium-range weather forecasts learnt and initialised directly from observations",
        "venue": "arXiv",
        "year": 2024,
        "url": "https://arxiv.org/abs/2412.15687"
      },
      {
        "title": "An update on AI-DOP: skilful weather forecasts produced directly from observations",
        "venue": "ECMWF Newsletter",
        "year": 2025,
        "url": "https://www.ecmwf.int/en/newsletter/182/earth-system-science/update-ai-dop-skilful-weather-forecasts-produced-directly"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 927,
      "y": 709,
      "scale": 0.87
    }
  },
  {
    "id": 125,
    "atlasN": 1286,
    "slug": "ai-adjoint-sensitivity-backpropagating-through",
    "title": {
      "zh": "AI 伴随敏感性：反向传播穿透预报模式的可预报性实验",
      "en": "AI-adjoint sensitivity: backpropagating through forecast models to probe predictability limits"
    },
    "qfocus": {
      "zh": "能否把可微分 AI 天气模式当作「免费伴随模式」，用反向传播直接求出预报对初值的非线性敏感性，从而把经典伴随法约 3 天的线性化适用极限推向 10–23 天？",
      "en": "Can differentiable AI weather models serve as \"free adjoint models,\" using backpropagation to compute fully nonlinear forecast sensitivities to initial conditions, extending the ~3-day linearization limit of classical adjoint methods out to 10-23 days?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C45",
      "zh": "地理空间AI·数字地球",
      "en": "Geospatial AI · Digital Earth"
    },
    "scores": [
      4,
      4,
      5,
      3,
      4,
      4,
      3,
      5,
      5
    ],
    "citation": {
      "url": "https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2024GL110651",
      "title": "Predictability Limit of the 2021 Pacific Northwest Heatwave From Deep-Learning Sensitivity Analysis",
      "venue": "Geophysical Research Letters",
      "year": 2024
    },
    "brief": {
      "zh": "伴随模式的开发需要数年人力，且线性化假设把适用范围压在约 3 天内。Vonich 与 Hakim（GRL 2024）把 GraphCast 当作可微分模拟器，对 2021 年太平洋西北热浪反传梯度寻找最优初值，10 天预报误差下降约 94%，并在 Pangu-Weather 上交叉验证；2025 年后续工作把大气可预报性极限的实证估计推向约 23 天。",
      "en": "Building an adjoint model traditionally takes years of human effort, and the linearization assumption caps its validity at about 3 days. Vonich and Hakim (GRL 2024) treated GraphCast as a differentiable simulator, backpropagating gradients through the 2021 Pacific Northwest heatwave to find optimal initial conditions, cutting 10-day forecast error by about 94% and cross-validating on Pangu-Weather; 2025 follow-up work pushed the empirical estimate of the atmospheric predictability limit to about 23 days."
    },
    "depth": {
      "overview": {
        "zh": "数值预报中心花数年人力开发的伴随模式，如今一行 loss.backward() 就能替代——而且不受线性化假设束缚。",
        "en": "The adjoint models that numerical forecasting centers spent years of human effort to develop can now be replaced by a single line of loss.backward() — and without being bound by the linearization assumption."
      },
      "whyMatters": {
        "zh": "张力在于：优化出的初值扰动可能只是在利用模型误差而非真实大气动力（对抗样本问题），这决定了这些敏感性结果能否被当作真实的物理洞见而非模型漏洞。",
        "en": "The tension is that the optimized initial-condition perturbation may merely be exploiting the model's own errors rather than real atmospheric dynamics (an adversarial-example problem), which decides whether these sensitivity results can be trusted as genuine physical insight rather than a model artifact."
      },
      "ifAnswered": {
        "zh": "正走向业务化的观测靶向（该往哪里加探空）与极端事件最优初值复盘，甚至对 Lorenz 可预报性极限的重新实测。",
        "en": "Heading toward operational observation targeting (where to add soundings) and optimal-initial-condition reconstructions of extreme events - and an empirical re-measurement of the Lorenz predictability limit."
      },
      "approaches": [
        {
          "zh": "把可微分 AI 天气模式（如 GraphCast）当作伴随模拟器，通过反向传播直接求非线性敏感性梯度，替代传统伴随模式数年的人力开发。",
          "en": "Treat a differentiable AI weather model (e.g. GraphCast) as an adjoint simulator, using backpropagation to compute nonlinear sensitivity gradients directly, replacing years of manual adjoint-model development."
        },
        {
          "zh": "对具体极端事件（如 2021 年太平洋西北热浪）反传梯度寻找最优初值扰动，并在多个模型（GraphCast、Pangu-Weather）间交叉验证结果的稳健性。",
          "en": "Backpropagate gradients through specific extreme events (e.g. the 2021 Pacific Northwest heatwave) to find optimal initial-condition perturbations, cross-validating robustness across multiple models (GraphCast, Pangu-Weather)."
        },
        {
          "zh": "用该方法系统性地重新实测大气可预报性极限，把估计值从经典的约 3 天推向 10–23 天。",
          "en": "Use the method to systematically re-measure the atmospheric predictability limit, pushing the estimate from the classical ~3 days out to 10-23 days."
        }
      ],
      "barrier": {
        "zh": "优化出的初值扰动可能在利用模型误差而非真实大气动力（对抗样本问题），如何区分「物理敏感性」与「模型漏洞」尚无公认判据。",
        "en": "The optimized initial-condition perturbation may be exploiting the model's own errors rather than real atmospheric dynamics (an adversarial-example problem), and there is no agreed-upon criterion yet for distinguishing \"physical sensitivity\" from \"model artifact.\""
      },
      "subQuestions": [
        {
          "zh": "当一次极端事件强到、罕到训练集里根本没有先例时（灰天鹅），数据驱动的 AI 地球与天气模型究竟是在从已知物理外推、还是只能内插已见过的样本——我们如何在事前就判断一次预报落在了模型的可外推区还是幻觉区？",
          "en": "When an extreme event is so rare and so intense that nothing like it exists in the training set (a gray swan), are data-driven AI weather and Earth models genuinely extrapolating from physics or merely interpolating seen samples — and how can we tell, before the fact, whether a given forecast lies inside the model's extrapolable regime or its hallucination regime?"
        },
        {
          "zh": "如果换一套基准、下游任务和微调协议就能改变地理空间基础模型的排名、甚至让简单监督基线反超，那「哪个对地观测基础模型更强」这一问法本身是否良定义——我们到底是在度量模型，还是在度量评测的选择？",
          "en": "If swapping the benchmark, the downstream tasks, or the fine-tuning protocol can reshuffle the ranking of geospatial foundation models — sometimes letting a plain supervised baseline win — is the question \"which Earth-observation foundation model is better\" even well-posed, and are we measuring the models or the choices of the evaluation?"
        },
        {
          "zh": "当一个生成模型补全缺失的卫星波段、把 100 公里场超分到公里级、或把再分析与模拟「装进同一个瓶子」时，它产出的像素究竟该被当作观测、还是当作有先验约束的猜测——在什么可检验的条件下，一次生成的对地观测可以承担真实测量的认知地位？",
          "en": "When a generative model fills in a missing satellite band, super-resolves a 100-km field to kilometer scale, or puts reanalysis and simulation \"in the same bottle\", should its output pixels count as observations or as prior-constrained guesses — and under what testable conditions may a generated Earth observation carry the epistemic standing of a real measurement?"
        }
      ]
    },
    "literature": [
      {
        "title": "Predictability Limit of the 2021 Pacific Northwest Heatwave From Deep-Learning Sensitivity Analysis",
        "venue": "Geophysical Research Letters",
        "year": 2024,
        "url": "https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2024GL110651"
      },
      {
        "title": "Testing the Limit of Atmospheric Predictability with a Machine Learning Weather Model",
        "venue": "arXiv",
        "year": 2025,
        "url": "https://arxiv.org/abs/2504.20238"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 745,
      "y": 702,
      "scale": 0.99
    }
  },
  {
    "id": 126,
    "atlasN": 807,
    "slug": "threshold-and-multiparty-fhe-shattering",
    "title": {
      "zh": "门限与多方全同态加密:把解密密钥拆碎分布",
      "en": "Threshold and Multiparty FHE: Shattering the Decryption Key Across Parties"
    },
    "qfocus": {
      "zh": "能否让全局解密密钥永远不在任何单点完整存在，而是通过门限方案让 FHE 解密必须由足量诚实方协作完成，从而消除「谁持有解密钥」的单点信任与单点失败？",
      "en": "Can the global decryption key be made to never exist whole at any single point, so that FHE decryption requires cooperation from a quorum of honest parties via a threshold scheme — eliminating the single-point trust and single-point failure of \"who holds the key\"?"
    },
    "domain": "交叉",
    "cluster": {
      "code": "C47",
      "zh": "后量子·隐私计算工程",
      "en": "Post-quantum · privacy computation"
    },
    "scores": [
      4,
      5,
      4,
      4,
      3,
      4,
      4,
      3,
      4
    ],
    "citation": {
      "url": "https://dl.acm.org/doi/pdf/10.1145/3658644.3690861",
      "title": "Toward Practical Threshold FHE: Low Communication, Computation and Interaction",
      "venue": "ACM CCS 2024",
      "year": 2024
    },
    "brief": {
      "zh": "门限 FHE（ThFHE）把「谁能解密」这一 FHE 的阿喀琉斯之踵改造为分布式信任:全局密钥是各方本地密钥之和,从不在单点重建。这是机密智能合约的密码基座——Zama 的 MPC 密钥管理系统(KMS)即用门限密钥生成与门限解密支撑其 fhEVM。2024 年 CCS 出现首个仅需一次广播完成密钥生成的鲁棒门限 BFV 方案,2025 年 IACR ePrint 进一步给出高效异步解密。",
      "en": "Threshold FHE (ThFHE) turns \"who can decrypt\" — FHE's Achilles' heel — into distributed trust: the global key is the sum of each party's local key share and is never reconstructed at a single point. It is the cryptographic substrate for confidential smart contracts — Zama's MPC key-management system (KMS) uses threshold key generation and threshold decryption to underpin its fhEVM. A 2024 CCS paper delivered the first robust threshold BFV scheme requiring only one broadcast for key generation, and a 2025 IACR ePrint paper further gives efficient asynchronous decryption."
    },
    "depth": {
      "overview": {
        "zh": "FHE 能算密文,但总得有人能解密——那把钥匙交给谁?门限 FHE 的答案是:谁也不单独拥有它,要够多诚实方一起才能解开。",
        "en": "FHE can compute on ciphertext, but someone still has to be able to decrypt it — so who gets the key? Threshold FHE's answer: no one holds it alone; enough honest parties must cooperate to unlock it."
      },
      "whyMatters": {
        "zh": "最硬的张力是门限解密必须注入噪声以防分片泄露,这与 FHE 本就紧张的噪声预算直接冲突——这决定了门限 FHE 能否在保持安全的同时仍留出足够的计算深度可用。",
        "en": "The hardest tension is that threshold decryption must inject noise to prevent share leakage, which directly collides with FHE's already-tight noise budget — this decides whether threshold FHE can stay secure while still leaving enough computational depth usable."
      },
      "ifAnswered": {
        "zh": "它是机密区块链/链上隐私(如 fhEVM)与去信任多方分析的密码基座,正向异步、鲁棒、低通信的门限解密演进。",
        "en": "It is the cryptographic substrate for confidential blockchains / on-chain privacy (e.g. fhEVM) and trustless multiparty analytics, evolving toward asynchronous, robust, low-communication threshold decryption."
      },
      "approaches": [
        {
          "zh": "通过分布式密钥生成(DKG)让各方共建公钥,全局私钥从不在单点重建,仅以本地分片形式存在。",
          "en": "Use distributed key generation (DKG) so parties jointly build the public key while the global private key is never reconstructed at a single point, existing only as local shares."
        },
        {
          "zh": "用噪声泛洪(noise flooding)掩盖门限解密过程中分片信息的泄露,同时压低通信轮数与计算开销(如 2024 年 CCS 仅需一次广播的鲁棒门限 BFV 方案)。",
          "en": "Use noise flooding to mask share-information leakage during threshold decryption, while cutting communication rounds and computational cost (e.g. the 2024 CCS robust threshold BFV scheme requiring only one broadcast)."
        },
        {
          "zh": "在拜占庭与异步网络假设下推进高效异步门限解密,支撑 fhEVM 等机密智能合约的实际部署。",
          "en": "Advance efficient asynchronous threshold decryption under Byzantine and asynchronous network assumptions, supporting real deployments of confidential smart contracts like fhEVM."
        }
      ],
      "barrier": {
        "zh": "门限解密必须注入噪声以防分片泄露,这与 FHE 本就紧张的噪声预算直接冲突;在拜占庭与异步网络下同时做到鲁棒、低通信轮数与可证安全,仍是 2024–2025 年活跃且未收敛的难题。",
        "en": "Threshold decryption must inject noise to prevent share leakage, directly colliding with FHE's already-tight noise budget; achieving robustness, low communication rounds, and provable security simultaneously under Byzantine and asynchronous networks remains an active, unresolved problem in 2024-2025."
      },
      "subQuestions": [
        {
          "zh": "当全同态加密被搬到商用 AI 加速器（GPU/TPU）上跑时，自举（bootstrapping）该放在深度网络的哪些位置、又能否真正复用为稠密浮点张量运算设计的硬件——还是说密文算术的访存与精度结构注定与这些芯片错配？",
          "en": "When fully homomorphic encryption is run on commodity AI accelerators (GPU/TPU), where in a deep network should bootstrapping be placed, and can hardware built for dense floating-point tensor math ever be genuinely reused for it — or is ciphertext arithmetic's memory and precision structure fundamentally mismatched to those chips?"
        },
        {
          "zh": "当一条机密 AI 的远程证明链把 CPU TEE 与 GPU TEE 拼接起来时，在固件闭源、确定性内存加密又持续被密文侧信道撕开缺口的现实下，这条证明链到底证明了什么、又把哪些信任无声地外包给了硬件厂商？",
          "en": "When a confidential-AI remote-attestation chain stitches a CPU TEE to a GPU TEE, what does that chain actually prove — and what trust does it silently outsource to the hardware vendor — given closed firmware and deterministic memory encryption that ciphertext side channels keep prying open?"
        },
        {
          "zh": "对大模型推理逐算子生成零知识证明，证明开销却比明文推理高出千倍乃至更多——「为整条 LLM 前向过程出具 zk 证明」究竟是正确的可信目标，还是说该把问题重构为「只证明少数关键不变量」或转向更廉价的可信原语？",
          "en": "Generating a zero-knowledge proof operator-by-operator for large-model inference costs thousands of times more than plaintext inference — is 'prove the entire LLM forward pass in zk' even the right trust goal, or should the problem be reframed as proving only a few critical invariants, or shifting to cheaper trust primitives?"
        }
      ]
    },
    "literature": [
      {
        "title": "Toward Practical Threshold FHE: Low Communication, Computation and Interaction",
        "venue": "ACM CCS 2024",
        "year": 2024,
        "url": "https://dl.acm.org/doi/pdf/10.1145/3658644.3690861"
      },
      {
        "title": "Threshold FHE with Efficient Asynchronous Decryption",
        "venue": "IACR ePrint",
        "year": 2025,
        "url": "https://eprint.iacr.org/2025/712"
      },
      {
        "title": "Robust Multiparty Computation from Threshold Encryption Based on RLWE",
        "venue": "IACR ePrint",
        "year": 2024,
        "url": "https://eprint.iacr.org/2024/1285"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 1012,
      "y": 648,
      "scale": 0.92
    }
  },
  {
    "id": 127,
    "atlasN": 1224,
    "slug": "positive-tipping-cascades-engineering-self",
    "title": {
      "zh": "正向临界点级联：设计能自我放大的良性转变",
      "en": "Positive Tipping Cascades: Engineering Self-Amplifying Beneficial Transitions"
    },
    "qfocus": {
      "zh": "能否在一个子系统里找到「超级杠杆」干预点，主动触发跨社会-技术-生态-政治系统的自我强化良性级联，把临界点从风险转变为可操控的工具？",
      "en": "Can a \"super-leverage\" intervention in one subsystem be identified to deliberately trigger a self-reinforcing beneficial cascade across socio-technical, ecological, and political systems — turning tipping points from a risk into an operable tool?"
    },
    "domain": "数理",
    "cluster": {
      "code": "C49",
      "zh": "计算可持续·韧性科学",
      "en": "Computational Sustainability · Resilience Science"
    },
    "scores": [
      5,
      5,
      3,
      5,
      5,
      4,
      3,
      3,
      2
    ],
    "citation": {
      "url": "https://esd.copernicus.org/articles/15/789/2024/",
      "title": "Cross-system interactions for positive tipping cascades",
      "venue": "Earth System Dynamics",
      "year": 2024
    },
    "brief": {
      "zh": "锚点是 Eker、Lenton 等 2024 年《Earth System Dynamics》的「Cross-system interactions for positive tipping cascades」，系统梳理了社会-技术、社会-生态、社会-政治三类系统间如何互相点火良性级联、并主张多中心治理。配合 2023 年《Global Tipping Points》报告与 2025 年《Sustainability Science》的可操作方法论文，这一支正把「正向临界点」从口号做成可操作方法。",
      "en": "The anchor is Eker, Lenton et al.'s 2024 Earth System Dynamics paper \"Cross-system interactions for positive tipping cascades,\" which maps how socio-technical, socio-ecological, and socio-political systems can ignite beneficial cascades in one another and argues for polycentric governance. Together with the 2023 Global Tipping Points report and a 2025 Sustainability Science paper on operational methods, this line of work is turning \"positive tipping points\" from a slogan into an operable method."
    },
    "depth": {
      "overview": {
        "zh": "我们习惯把「临界级联」当灾难，但同一套自我放大动力学也能反向利用——一次精准的政策或补贴，可能像多米诺一样点燃跨部门的良性转变。这就是「正向临界点」这门新学问在问的事。",
        "en": "We are used to treating \"tipping cascades\" as disaster, but the same self-amplifying dynamics can be turned around — a single precisely targeted policy or subsidy could ignite a beneficial cross-sector transition like a domino chain. That is what the new field of \"positive tipping points\" is asking."
      },
      "whyMatters": {
        "zh": "最硬的悬念是可证伪性与反噬——社会临界阈值极难事前定位、事后又容易被「我们早知道」叙事收编；而同一条动力学既能点燃良性级联，也能触发不公与锁定，这决定了正向临界点工程能否真正区别于事后诸葛亮式的叙事。",
        "en": "The hardest open question is falsifiability and backfire — social tipping thresholds are extremely hard to locate in advance and easily co-opted after the fact into a \"we knew it all along\" narrative; the same dynamics that ignite a beneficial cascade can also trigger injustice and lock-in, which decides whether positive-tipping engineering can truly be distinguished from hindsight storytelling."
      },
      "ifAnswered": {
        "zh": "方向是从「事后叙事」走向可操作的「正向临界点工程」：识别跨系统超级杠杆、排序干预时序，并为公平转型加约束。",
        "en": "The trajectory runs from after-the-fact narrative toward operational \"positive-tipping engineering\": identifying cross-system super-leverage points, sequencing interventions, and constraining for just transitions."
      },
      "approaches": [
        {
          "zh": "系统梳理社会-技术、社会-生态、社会-政治三类系统间的相互点火机制（如光伏与电动车 S 曲线互相加速），识别跨系统的「超级杠杆」干预点。",
          "en": "Systematically map the mutual-ignition mechanisms among socio-technical, socio-ecological, and socio-political systems (e.g. solar-PV and EV S-curves accelerating each other) to identify cross-system \"super-leverage\" intervention points."
        },
        {
          "zh": "开发可操作的方法论，识别加速低碳转型的正向临界点、并设计触发它们的具体行动（如 2025 年《Sustainability Science》方法论文）。",
          "en": "Develop operational methods to identify positive tipping points that accelerate low-carbon transitions and design concrete actions to trigger them (as in the 2025 Sustainability Science methods paper)."
        },
        {
          "zh": "引入多中心治理框架，为超级杠杆干预排序时序并加入公平转型约束，防止良性级联反噬为新的锁定或不公。",
          "en": "Introduce polycentric governance frameworks to sequence super-leverage interventions and add just-transition constraints, guarding against a beneficial cascade backfiring into new lock-in or injustice."
        }
      ],
      "barrier": {
        "zh": "社会临界阈值极难事前定位、事后又容易被「我们早知道」叙事收编；且同一条动力学既能点燃良性级联，也能触发不公与锁定，正负级联常常共用一套机制。",
        "en": "Social tipping thresholds are extremely hard to locate in advance and are easily co-opted after the fact into a \"we knew it all along\" narrative; the same dynamics that ignite a beneficial cascade can also trigger injustice and lock-in, since positive and negative cascades often share the same underlying mechanism."
      },
      "subQuestions": [
        {
          "zh": "用合成数据宇宙训练出的深度学习临界预警，迁移到真实、有噪声、非平稳的生态/电网崩溃时，它探测到的究竟是普适的临界减速，还是数据预处理与训练分布残留的伪信号——我们能否给出一个让真实漏报率与误报率都可被独立审计的迁移有效性判据？",
          "en": "When a deep-learning early-warning model trained on a synthetic universe of bifurcations is transferred to real, noisy, non-stationary ecosystem or grid collapses, is it detecting universal critical slowing-down or artefacts of preprocessing and the training distribution — and can we state a transfer-validity criterion under which both real-world miss-rate and false-positive-rate are independently auditable?"
        },
        {
          "zh": "生态声景里那条被当作「韧性/临界减速」读数的声学指标，反映的是真实的恢复力流失，还是在用相似声音掩盖了完全不同的声源与采样偏差——我们能否把声景韧性指数做成一个可证伪、能区分「生物多样性下降」与「指标本身漂移」的基准？",
          "en": "Does the acoustic index read off a soundscape as a 'resilience / critical slowing-down' signal actually track loss of recovery capacity, or does similar-sounding output mask entirely different sources and sampling bias — and can a soundscape-resilience index be made falsifiable enough to separate genuine biodiversity decline from drift in the metric itself?"
        },
        {
          "zh": "把相互耦合、会级联触发的生态—社会—基础设施体制转变建成网络后，结构可控性原理能否真正给出一个可落到真实耦合数据上的「最小干预集」——即需要操控哪些节点、按什么顺序，才能阻断多米诺式级联或把系统拉回，而不是只在理论网络上成立？",
          "en": "Once coupled ecological-social-infrastructure regime shifts that cascade are modelled as a network, can structural-controllability principles actually deliver a 'minimum intervention set' that lands on real coupled data — which nodes to steer, in what sequence, to halt a domino cascade or pull the system back — rather than holding only on toy networks?"
        }
      ]
    },
    "literature": [
      {
        "title": "Cross-system interactions for positive tipping cascades",
        "venue": "Earth System Dynamics 15(3), 789",
        "year": 2024,
        "url": "https://esd.copernicus.org/articles/15/789/2024/"
      },
      {
        "title": "A method to identify positive tipping points to accelerate low-carbon transitions and actions to trigger them",
        "venue": "Sustainability Science",
        "year": 2025,
        "url": "https://link.springer.com/article/10.1007/s11625-025-01704-9"
      },
      {
        "title": "Pathways for prevention of cascading tipping points",
        "venue": "Communications Earth & Environment",
        "year": 2025,
        "url": "https://www.nature.com/articles/s43247-025-02662-x"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 206,
      "y": 363,
      "scale": 0.87
    }
  },
  {
    "id": 128,
    "atlasN": 1227,
    "slug": "computable-criteria-for-rate-induced",
    "title": {
      "zh": "速率诱导临界点的可计算判据",
      "en": "Computable Criteria for Rate-Induced Tipping"
    },
    "qfocus": {
      "zh": "系统的崩溃能否不是因为跨过某个阈值，而是因为外力变化的速率本身太快——我们能否给出可计算的判据，把「变化速度」本身纳入可持续性风险的度量？",
      "en": "Can a system tip not because it crosses a threshold but because the rate of forcing change is itself too fast — and can we derive computable criteria that fold the speed of change itself into a measure of sustainability risk?"
    },
    "domain": "数理",
    "cluster": {
      "code": "C49",
      "zh": "计算可持续·韧性科学",
      "en": "Computational Sustainability · Resilience Science"
    },
    "scores": [
      5,
      4,
      4,
      2,
      4,
      4,
      4,
      3,
      4
    ],
    "citation": {
      "url": "https://www.nature.com/articles/s42256-024-00937-0",
      "title": "Deep learning for predicting rate-induced tipping",
      "venue": "Nature Machine Intelligence",
      "year": 2024
    },
    "brief": {
      "zh": "经典临界点理论假设系统在准静态强迫下越过分岔点。但 Ashwin、Wieczorek 等人发展的速率诱导临界点表明:即便终态仍在安全域内,只要参数变化速率超过临界速度,系统就会「跟不上」而崩溃。2024 年 Huang、Bathiany、Ashwin、Boers 在 Nature Machine Intelligence 首次给出预测 R-tipping 转移概率的深度学习框架,把可持续性问题从「别越线」改写为「别变得太快」。",
      "en": "Classical tipping-point theory assumes a system crosses a bifurcation under quasi-static forcing. But rate-induced tipping, developed by Ashwin, Wieczorek and others, shows that even if the final state remains within the safe domain, the system can still \"fail to keep up\" and collapse once the rate of parameter change exceeds a critical speed. In 2024, Huang, Bathiany, Ashwin, and Boers gave the first deep-learning framework for predicting R-tipping transition probability in Nature Machine Intelligence, rewriting the sustainability question from \"don't cross the line\" to \"don't change too fast.\""
    },
    "depth": {
      "overview": {
        "zh": "传统临界点研究盯着「阈值有没有被跨过」;R-tipping 指出即便阈值未破,只要外力变得够快,系统也会脱轨。",
        "en": "Traditional tipping-point research focuses on whether a threshold has been crossed; R-tipping points out that even without breaching a threshold, a system can derail once the forcing changes fast enough."
      },
      "whyMatters": {
        "zh": "最硬难点是 R-tipping 依赖对未来强迫路径的了解,而现实中强迫本身充满不确定——这决定了可计算判据能否走出理想化模型、真正应用到无法预知未来强迫的真实系统。",
        "en": "The hardest difficulty is that R-tipping depends on knowing the future forcing path, while real-world forcing itself is deeply uncertain — this decides whether computable criteria can move beyond idealized models and actually apply to real systems whose future forcing cannot be foreseen."
      },
      "ifAnswered": {
        "zh": "未来走向:把 R-tipping 判据嵌入耦合冰盖—洋流等真实地球系统,评估「减排速度」而非仅「减排幅度」的安全边界。",
        "en": "Where it is heading: embedding R-tipping criteria into coupled real Earth systems (ice sheet-ocean circulation) to bound the safe rate of change, not only its magnitude."
      },
      "approaches": [
        {
          "zh": "发展生存盆地、Melnikov 型准则等可计算判据,刻画系统在特定强迫速率下是否会脱离安全域。",
          "en": "Develop computable criteria such as survival basins and Melnikov-type conditions to characterize whether a system will leave its safe domain under a given forcing rate."
        },
        {
          "zh": "用深度学习框架预测 R-tipping 的转移概率,把「变化速度」本身纳入可计算的可持续性风险度量(如 2024 年 Nature Machine Intelligence 的工作)。",
          "en": "Use deep-learning frameworks to predict R-tipping transition probability, folding the speed of change itself into a computable sustainability-risk metric (as in the 2024 Nature Machine Intelligence work)."
        },
        {
          "zh": "把 R-tipping 判据嵌入耦合冰盖—洋流等真实地球系统模型,评估「减排速度」而非仅「减排幅度」的安全边界。",
          "en": "Embed R-tipping criteria into coupled real Earth-system models (ice sheet-ocean circulation) to bound the safe rate of change, not only its magnitude."
        }
      ],
      "barrier": {
        "zh": "R-tipping 依赖对未来强迫路径的了解,而现实中强迫本身充满不确定;可计算判据在高维耦合网络里往往退化,深度学习预测又受制于训练分布外泛化。",
        "en": "R-tipping depends on knowing the future forcing path, while real-world forcing is itself deeply uncertain; computable criteria tend to degenerate in high-dimensional coupled networks, and deep-learning predictors are limited by out-of-distribution generalization."
      },
      "subQuestions": [
        {
          "zh": "用合成数据宇宙训练出的深度学习临界预警，迁移到真实、有噪声、非平稳的生态/电网崩溃时，它探测到的究竟是普适的临界减速，还是数据预处理与训练分布残留的伪信号——我们能否给出一个让真实漏报率与误报率都可被独立审计的迁移有效性判据？",
          "en": "When a deep-learning early-warning model trained on a synthetic universe of bifurcations is transferred to real, noisy, non-stationary ecosystem or grid collapses, is it detecting universal critical slowing-down or artefacts of preprocessing and the training distribution — and can we state a transfer-validity criterion under which both real-world miss-rate and false-positive-rate are independently auditable?"
        },
        {
          "zh": "生态声景里那条被当作「韧性/临界减速」读数的声学指标，反映的是真实的恢复力流失，还是在用相似声音掩盖了完全不同的声源与采样偏差——我们能否把声景韧性指数做成一个可证伪、能区分「生物多样性下降」与「指标本身漂移」的基准？",
          "en": "Does the acoustic index read off a soundscape as a 'resilience / critical slowing-down' signal actually track loss of recovery capacity, or does similar-sounding output mask entirely different sources and sampling bias — and can a soundscape-resilience index be made falsifiable enough to separate genuine biodiversity decline from drift in the metric itself?"
        },
        {
          "zh": "把相互耦合、会级联触发的生态—社会—基础设施体制转变建成网络后，结构可控性原理能否真正给出一个可落到真实耦合数据上的「最小干预集」——即需要操控哪些节点、按什么顺序，才能阻断多米诺式级联或把系统拉回，而不是只在理论网络上成立？",
          "en": "Once coupled ecological-social-infrastructure regime shifts that cascade are modelled as a network, can structural-controllability principles actually deliver a 'minimum intervention set' that lands on real coupled data — which nodes to steer, in what sequence, to halt a domino cascade or pull the system back — rather than holding only on toy networks?"
        }
      ]
    },
    "literature": [
      {
        "title": "Deep learning for predicting rate-induced tipping",
        "venue": "Nature Machine Intelligence",
        "year": 2024,
        "url": "https://www.nature.com/articles/s42256-024-00937-0"
      },
      {
        "title": "Rate-induced tipping in ecosystems and climate: the role of unstable states, basin boundaries and transient dynamics",
        "venue": "Nonlinear Processes in Geophysics",
        "year": 2023,
        "url": "https://npg.copernicus.org/articles/30/481/2023/"
      }
    ],
    "stage": 1,
    "members": 4,
    "activity": 30,
    "chart": {
      "x": 336,
      "y": 459,
      "scale": 0.95
    }
  }
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
