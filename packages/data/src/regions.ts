/**
 * Curated region-name overlay — the PLACE-PLANE editorial layer for the T1
 * named-region tier (docs/atlas-world-plan.md §2 "中层区域模型", lane W3).
 *
 * ── What this is (and is NOT) ────────────────────────────────────────────────
 * The middle tier of the world map is a PURE PROJECTION: `core.projectArchipelagos`
 * reduces the island field into ~30–50 computed regions (spatial × domain ×
 * current density), and that reduce ALONE decides which islands belong to which
 * region. This table adds ZERO membership logic and ZERO geometry — it only
 * supplies a nicer NAME (+ short caption) for a region the projection already
 * computed, keyed by that region's dominant curated `cluster.code`.
 *
 * This is the same nature as island names / resident names (architecture §7
 * invariant 9: place/editorial names are an authored, translatable layer) and
 * honours invariants 14/15 of depth-plan-v2: the sea is a `reduce` over the
 * ledger, and this overlay introduces no "draw a boundary" verb — remove this
 * file and every region still exists, just under a derived name.
 *
 * ── The hybrid ───────────────────────────────────────────────────────────────
 * Where a computed region's members are dominated by a KNOWN frontier cluster
 * (one of the curated `cluster.code`s in `frontiers.ts`), we hand it an evocative
 * place-name + caption below. Where they are NOT (e.g. a mixed region, or the
 * synthetic scale corpus's `S`-prefixed codes), `projectArchipelagos` falls back
 * to deriving the name from the dominant member cluster label — so the map reads
 * with character at any N, curated where we know the territory, cleanly derived
 * where we don't. Coverage is deliberately partial (~13 of 20 curated codes) to
 * keep the two paths visibly distinct.
 *
 * The `zh`/`en` fields are BARE descriptors (no 群岛/Archipelago suffix): the
 * projection appends the place-word uniformly so curated and derived names read
 * in one register ("工程生命群岛" / "Engineered Life Archipelago").
 */

export interface CuratedRegionName {
  /** Bare zh descriptor — the projection appends 群岛. */
  zh: string;
  /** Bare en descriptor — the projection appends " Archipelago". */
  en: string;
  /** One-line evocative caption (体温/性格), rendered under the region billboard. */
  caption: { zh: string; en: string };
}

/**
 * Curated region names keyed by the dominant curated `cluster.code` of a
 * computed region (`frontiers.ts` C-codes). Passed to `projectArchipelagos` via
 * `opts.curatedNames`; the projection matches a region's most-frequent member
 * `cluster.code` against this map. No code here → derived naming path.
 */
export const REGION_NAMES: Record<string, CuratedRegionName> = {
  C01: {
    zh: '工程生命',
    en: 'Engineered Life',
    caption: { zh: '在这里，生命是可编程的材料', en: 'Where life is programmable material' },
  },
  C03: {
    zh: '科学基座',
    en: 'Foundations for Science',
    caption: { zh: '为发现本身铸造的模型', en: 'Models forged for discovery itself' },
  },
  C08: {
    zh: '分子机器',
    en: 'Molecular Machines',
    caption: { zh: '以分子为齿轮的信息工厂', en: 'Information factories geared in molecules' },
  },
  C11: {
    zh: '计算认知',
    en: 'Computational Cognition',
    caption: { zh: '在硅与神经之间读心', en: 'Reading minds between silicon and neuron' },
  },
  C12: {
    zh: '生物电流',
    en: 'Bioelectric Reach',
    caption: { zh: '生命与电路接壤的海岸', en: 'The coast where life meets the circuit' },
  },
  C23: {
    zh: '形式疆域',
    en: 'Formal Frontier',
    caption: { zh: '机器与证明共写的数学', en: 'Mathematics co-written by machine and proof' },
  },
  C32: {
    zh: '意识之谜',
    en: 'The Riddle of Mind',
    caption: { zh: '经验为何存在', en: 'Why experience exists at all' },
  },
  C33: {
    zh: '实在之基',
    en: 'The Floor of Reality',
    caption: { zh: '叩问物质与时空的底层', en: 'Probing the floor of matter and spacetime' },
  },
  C34: {
    zh: '无知测绘',
    en: 'Mapping Ignorance',
    caption: { zh: '为我们尚不知道的事物绘制海图', en: "Charting what we don't yet know" },
  },
  C37: {
    zh: '生物暗物质',
    en: 'Biological Dark Matter',
    caption: { zh: '基因组里尚未命名的大陆', en: 'The unnamed continents of the genome' },
  },
  C44: {
    zh: '神经形态',
    en: 'Neuromorphic Shores',
    caption: { zh: '让物质自己学会计算', en: 'Matter that learns to compute' },
  },
  C47: {
    zh: '后量子',
    en: 'Post-Quantum',
    caption: { zh: '为量子之后的世界加密', en: 'Securing the world after quantum' },
  },
  C51: {
    zh: '因果之海',
    en: 'Causal Sea',
    caption: { zh: '从相关驶向原因', en: 'Sailing from correlation to cause' },
  },
};

/** One grounded great-question for a named region (from the xfrontier atlas
 *  cluster_questions.json — real open questions, no fabrication). Keyed by the
 *  region's dominant curated cluster.code; surfaced on the T1 region detail so
 *  「岛屿方向里面的问题」 is visible at the middle tier (§九 Phase 1). */
export interface RegionQuestion {
  q: { zh: string; en: string };
  whyMatters: { zh: string; en: string };
  ifAnswered: { zh: string; en: string };
}

export const REGION_QUESTIONS: Record<string, RegionQuestion[]> = {
  C01: [
    {
      q: { zh: "一个能自我维持、自我复制的活细胞，究竟最少需要多少基因？最小基因组里至今功能未知的那约三分之一，是否定义了「生命的最小逻辑」？", en: "What is the true minimal gene set for a self-sustaining, self-replicating cell—and do the roughly one-third of genes in it whose function we still don't understand define the irreducible logic of life itself?" },
      whyMatters: { zh: "JCVI-syn3.0 把基因组砍到 473 个基因后，仍有约 1/3 基因功能未知——「最小」不等于「已理解」。这道边界划在哪，决定了我们是在工程化生命，还是只是在复制一个我们不懂的黑箱。", en: "Even after JCVI-syn3.0 cut the genome to 473 genes, about a third have unknown function—“minimal” is not “understood”. Where this boundary sits decides whether we engineer life or merely copy a black box we don't comprehend." },
      ifAnswered: { zh: "若能完整解释最小基因组，合成生物从「试错拼装」升级为「从第一性原理设计活体」：可定制底盘细胞、可预测代谢、可证明的生物安全边界随之可能。", en: "A fully explained minimal genome would move synthetic biology from trial-and-error assembly to first-principles design of living systems—programmable chassis cells, predictable metabolism, and provable biosafety bounds become reachable." },
    },
    {
      q: { zh: "我们能不能造出一种「正交生命」——用人工碱基对或镜像手性，使它在生化上与所有现存生命不可互通，从而既无法被天然病毒感染、也无法在野外存活？", en: "Can we build “orthogonal life”—using an artificial base pair or mirror chirality—that is biochemically incompatible with all existing life, so it can neither be infected by natural viruses nor survive in the wild?" },
      whyMatters: { zh: "半合成生物已能稳定复制第三对人工碱基；镜像生物学则提出对映体生命。两条路都把「生物围栏」从行政管制变成物理化学不可能性——这是生物安全的范式转移，也可能是范式灾难。", en: "Semi-synthetic organisms already replicate a third, unnatural base pair; mirror biology proposes enantiomeric life. Both turn “biocontainment” from administrative rule into physico-chemical impossibility—a paradigm shift in biosafety, and possibly a paradigm hazard." },
      ifAnswered: { zh: "成功则获得本质安全的工程生命与抗污染的生物制造；但一旦镜像生物逃逸，现有免疫与生态防线可能完全失效。这道题答错的代价是不可逆的。", en: "Success yields intrinsically safe engineered life and contamination-proof biomanufacturing; but if mirror life escaped, existing immune and ecological defenses could be bypassed entirely. The cost of a wrong answer here is irreversible." },
    },
  ],
  C03: [
    {
      q: { zh: "AI 能给出正确的科学预测，却给不出「为什么」。当一个模型解决了蛋白折叠，我们是真的理解了折叠，还是把无知外包给了一个我们同样不理解的系统？", en: "AI can produce correct scientific predictions without producing a “why”. When a model solves protein folding, do we actually understand folding—or have we outsourced our ignorance to a system we equally don't understand?" },
      whyMatters: { zh: "AlphaFold 准确预测了约 2 亿种蛋白结构，却不解释折叠的物理。这迫使我们重问「科学理解」的定义：预测力是否等于理解力？这是 AI 时代最尖锐的认识论问题，横跨全部三大类目。", en: "AlphaFold accurately predicted ~200M protein structures yet explains none of the folding physics. This forces us to re-ask what “scientific understanding” means: is predictive power the same as understanding? It is the sharpest epistemological question of the AI era, cutting across all three categories." },
      ifAnswered: { zh: "若能从预测型模型可靠地提取人类可理解的机制，AI4S 从「神谕」升级为「同行」，科学解释被重新定义；若不能，科学可能分裂为「能预测」与「能理解」两支。", en: "If we can reliably extract human-understandable mechanism from predictive models, AI4S graduates from oracle to colleague and scientific explanation is redefined; if not, science may split into a “can-predict” branch and a “can-understand” branch." },
    },
    {
      q: { zh: "存在「科学的基础模型」吗——一个在所有物理过程上预训练、能像语言模型迁移到新句子那样迁移到从未见过的现象的模型？还是说每门科学的归纳偏置本质上不可通约？", en: "Is there a “foundation model for science”—one pretrained on all physical processes that transfers to never-seen phenomena the way a language model transfers to new sentences? Or are the inductive biases of each science fundamentally incommensurable?" },
      whyMatters: { zh: "语言模型的成功靠 token 的普适性。科学没有统一的 token——但费曼的「同样的方程有同样的解」暗示某些数学骨架确实跨域复用。这道题直接检验 AI 时代「学科墙能否倒塌」。", en: "Language models succeeded on the universality of the token. Science has no universal token—but Feynman's “same equations, same solutions” hints that some mathematical skeletons genuinely recur across domains. This directly tests whether disciplinary walls can fall in the AI era." },
      ifAnswered: { zh: "若存在，科学走向统一的计算基底，跨域迁移成为默认；若不存在，它会精确地告诉我们学科边界的不可还原性来自哪里——同样是深刻收获。", en: "If it exists, science moves toward a unified computational substrate and cross-domain transfer becomes the default; if it doesn't, it tells us precisely where the irreducibility of disciplinary boundaries comes from—an equally deep payoff." },
    },
  ],
  C08: [
    {
      q: { zh: "DNA 已被证明可以把一整本书、一个操作系统以每克数百 PB 的密度存进去——但要把 DNA 从「冷存档介质」变成「可随机访问、可计算、可重写的活信息系统」，缺的根本原理是什么？信息能否真正住进分子里并在其中被运算？", en: "DNA has been shown to store an entire book and an operating system at hundreds of petabytes per gram—but what fundamental principle is still missing to turn DNA from a cold archival medium into a randomly-accessible, computable, rewritable living information system? Can information truly live inside molecules and be operated upon there?" },
      whyMatters: { zh: "DNA Fountain 把存储密度推到每克 215 PB，证明分子级存储在物理上可行。但当前 DNA 存储仍是「写一次、整批读」的冷归档，缺乏随机访问、原地计算与重写的原理。这道缺口决定了 DNA 信息技术是利基归档，还是下一代计算基质。", en: "DNA Fountain pushed storage density to 215 PB per gram, proving molecular storage is physically feasible. But current DNA storage is write-once, batch-read cold archiving, lacking principles for random access, in-place computation, and rewriting. That gap decides whether DNA information technology is niche archiving or the next computing substrate." },
      ifAnswered: { zh: "若 DNA 获得随机访问与原地计算原理，信息技术将拥有一种密度高出硅基数个数量级、且能与生命系统直接耦合的计算-存储基质，重写数据中心与生物计算的边界。", en: "If DNA gains principles for random access and in-place computation, information technology acquires a compute-storage substrate orders of magnitude denser than silicon and directly couplable to living systems—rewriting the boundary between data centers and biocomputing." },
    },
    {
      q: { zh: "分子机器（如人工分子马达、DNA 行走器）已能在纳米尺度做受控运动——但它们能否被组织成像生命那样自主、协同、做有用功的「分子级机器集体」？把单个分子机器扩展为有组织系统，缺的根本原理是什么？", en: "Molecular machines—artificial molecular motors, DNA walkers—can already perform controlled motion at the nanoscale. But can they be organized into autonomous, cooperative, work-doing 'collectives' the way life is? What fundamental principle is missing to scale single molecular machines into organized systems?" },
      whyMatters: { zh: "DNA 信息技术早已证明可以用碱基编程让分子识别、行走、计算（Adleman 1994 起）。但单个分子机器与生命的差距，在于后者把亿万分子机器组织成协同做功的系统。如何从「单元」到「有组织的集体」，是分子机器走向实用功率与功能的根本瓶颈。", en: "DNA information technology has long shown molecules can be programmed by base sequence to recognize, walk, and compute (since Adleman 1994). The gap between a single molecular machine and life is that life organizes billions of them into systems that do coordinated work. Going from 'units' to 'organized collectives' is the fundamental bottleneck to useful power and function." },
      ifAnswered: { zh: "若掌握分子机器自组织协同做功的原理，纳米制造、靶向递药、分子级机器人将从单分子演示跃升为可输出宏观功的系统，开启一类全新的活性物质技术。", en: "Mastering how molecular machines self-organize into cooperative work-doing collectives would lift nanofabrication, targeted delivery, and molecular robotics from single-molecule demos to systems delivering macroscopic work, opening a new class of active-matter technology." },
    },
  ],
  C11: [
    {
      q: { zh: "大脑用什么「码」来表征信息——是单个神经元的发放率、群体的几何结构、精确的脉冲时序，还是某种我们尚未识别的动力学变量？如果我们至今不知道神经活动如何编码意义，那么任何脑机接口的「读写」都是在猜测一种我们看不懂的语言吗？", en: "What code does the brain use to represent information — single-neuron firing rates, the geometry of population activity, precise spike timing, or some dynamical variable we have not yet identified — and if we still do not know how neural activity encodes meaning, is every brain–computer interface 'read' and 'write' merely guessing at a language we cannot read?" },
      whyMatters: { zh: "神经科学积累了海量记录数据，却没有公认的「神经编码」理论：同一份脉冲序列在不同框架下意义完全不同。脑机接口、神经解码、计算认知全都默默假设了某种编码，但这个最根本的假设从未被确立。不解决它，神经技术就是在没有字典的情况下做翻译。", en: "Neuroscience has amassed enormous recording data yet has no agreed theory of the neural code: the same spike train means entirely different things under different frameworks. Brain–computer interfaces, neural decoding, and computational cognition all silently assume some code, yet this most fundamental assumption has never been established. Without solving it, neurotechnology is translation without a dictionary." },
      ifAnswered: { zh: "若破解神经编码，脑机接口将从统计相关的「黑箱解码」升级为基于机制的读写，瘫痪、失语、感官缺失的修复可被原理性地设计，计算认知也终于有了通用货币。", en: "Cracking the neural code would upgrade brain–computer interfaces from statistically correlated black-box decoding to mechanism-based read/write, letting paralysis, aphasia, and sensory loss be repaired by principled design and giving computational cognition a common currency at last." },
    },
    {
      q: { zh: "主观体验（意识）能否从物理或计算的第一性原理被解释——「为什么这些神经过程伴随着『感受』，而不是在黑暗中无声运行」？这个「难问题」是科学终将解答的，还是它揭示了我们关于物质与心智的概念框架本身有根本缺口？", en: "Can subjective experience — consciousness — be explained from physical or computational first principles, namely why these neural processes are accompanied by felt experience rather than running silently in the dark — and is this 'hard problem' something science will eventually answer, or does it reveal a fundamental gap in our very conceptual framework for matter and mind?" },
      whyMatters: { zh: "意识的「难问题」是神经技术与计算认知不可回避的地基：如果我们能造出读写大脑、模拟认知的系统，却无法判断它们是否、或何时产生体验，那么关于机器意识、动物福祉、脑损伤患者意识状态的所有伦理与科学判断都没有依据。这不是细节问题，而是缺一整套理论。", en: "The hard problem of consciousness is the unavoidable bedrock of neurotechnology and computational cognition: if we can build systems that read, write, and simulate cognition yet cannot tell whether or when they have experience, then every ethical and scientific judgment about machine consciousness, animal welfare, and the awareness of brain-injured patients has no foundation. This is not a detail but a missing theory." },
      ifAnswered: { zh: "若意识能被原理性解释，我们就能客观判定何种系统具有体验，从而为机器意识、临床意识评估、动物伦理提供科学依据，并可能彻底改写我们对自身存在的理解。", en: "A principled explanation of consciousness would let us objectively judge which systems have experience, grounding machine consciousness, clinical awareness assessment, and animal ethics in science — and could rewrite our understanding of our own existence." },
    },
  ],
  C12: [
    {
      q: { zh: "生命用「电子在蛋白质链上跳跃」的方式高效转移能量与信息——我们能否在原理上把活体生物与人造电子电路无损、长期、高带宽地直接耦合？阻碍「软湿的离子生物」与「硬干的电子器件」真正融合的，是工程难题，还是一道根本的物理-化学不兼容？", en: "Life moves energy and information by hopping electrons along protein chains with remarkable efficiency — can we, in principle, couple living organisms directly to artificial electronic circuits losslessly, durably, and at high bandwidth, and is what blocks true fusion of soft, wet, ionic biology with hard, dry electronics an engineering problem or a fundamental physico-chemical incompatibility?" },
      whyMatters: { zh: "生物用离子和电子传递信号，电子器件用电子。两者之间的「翻译」（生物-电子界面）始终低效、易降解、信号失真。生物电子学的整个前景——从脑机接口到生物计算到活体能源——都卡在这道界面上。我们尚不知道是否存在一种原理上稳定、高带宽的离子-电子转换，还是这本质上受限。", en: "Biology signals with ions and electrons; electronics use electrons. The translation between them — the bio-electronic interface — is persistently inefficient, degradation-prone, and signal-distorting. The entire promise of bioelectronics, from brain interfaces to biological computing to living energy, is stuck at this interface. We do not yet know whether a principled, stable, high-bandwidth ion-to-electron conversion exists or whether it is fundamentally limited." },
      ifAnswered: { zh: "若能实现原理上无损、稳定的生物-电子耦合，神经假体、活体传感器、生物混合计算与体内供能器件将一举突破，开启一类全新的「活体-电子混合系统」。", en: "A principled, lossless, stable bio-electronic coupling would unlock neural prosthetics, living sensors, biohybrid computing, and in-body power devices at once, opening an entirely new class of living-electronic hybrid systems." },
    },
    {
      q: { zh: "光合作用把光能转成化学能的量子效率近乎完美，而人造系统远不及——生命究竟用了什么我们尚未掌握的原理来在常温嘈杂环境里高效转移能量？是否存在一条可被人工复制的「生物能量转换的设计法则」，让人造光合或生物燃料电池逼近热力学极限？", en: "Photosynthesis converts light to chemical energy at near-perfect quantum efficiency while artificial systems fall far short — what principle, still beyond our grasp, does life use to transfer energy efficiently in a warm, noisy environment, and is there a replicable design law of biological energy conversion that would let artificial photosynthesis or biofuel cells approach the thermodynamic limit?" },
      whyMatters: { zh: "全球能源转型需要把太阳能/生物质高效转成可储存的燃料，而自然光合的效率和鲁棒性至今无法被人工系统复现。背后可能涉及我们尚未充分理解的能量与电荷转移原理（含可能的量子相干效应）。这不是把现有电池改良几个百分点，而是缺乏一套「如何像生命一样转换能量」的根本设计理论。", en: "The global energy transition needs efficient conversion of sunlight and biomass into storable fuel, yet the efficiency and robustness of natural photosynthesis remain unreproduced by artificial systems. The reason may involve energy- and charge-transfer principles we do not fully understand, possibly including quantum coherence. This is not improving existing cells by a few percent but a missing fundamental design theory of converting energy the way life does." },
      ifAnswered: { zh: "若揭示并复制生物能量转换的设计法则，人造光合、生物燃料电池与活体能源系统可逼近理论极限，为碳中和提供一条全新的、不依赖稀有材料的能量路线。", en: "Revealing and replicating the design law of biological energy conversion would let artificial photosynthesis, biofuel cells, and living energy systems approach their theoretical limits, offering a new carbon-neutral energy route that does not depend on rare materials." },
    },
  ],
  C23: [
    {
      q: { zh: "当AI能产出人类无法在合理时间内独立验证的超长形式化证明（甚至发现新定理）时，「数学真理」的认识论基础是否被改变？一个只有机器能检验、人类无法真正「理解」的证明，算不算人类的数学知识？", en: "When AI produces formal proofs so long that no human can independently verify them in reasonable time — and even discovers new theorems — does the epistemology of mathematical truth change? Does a proof only a machine can check, that no human truly 'understands', count as human mathematical knowledge?" },
      whyMatters: { zh: "AlphaProof等系统已能解出奥赛级问题并生成形式化证明，形式验证器（如Lean）可机检；但「机器可验证而人类不可理解」的证明已逼真，数学界对其知识地位尚无共识。", en: "Systems like AlphaProof now solve olympiad-level problems and emit formally checkable proofs (e.g., in Lean), yet 'machine-verifiable but humanly incomprehensible' proofs are now plausible, and mathematics has no consensus on their epistemic status." },
      ifAnswered: { zh: "若厘清机器证明的知识地位，数学研究、科学证明标准、乃至「理解」本身的定义都将被重新校准。", en: "Clarifying the status of machine proofs would recalibrate mathematical research, standards of scientific proof, and even the definition of 'understanding' itself." },
    },
    {
      q: { zh: "数学中「美」「优雅」「深刻」这些指引人类选择研究方向的直觉，能否被形式化为可计算的量，从而让AI不只是证明给定命题，而是自主判断「哪个猜想值得证」？如果不能，数学创造里是否存在某种本质上不可形式化的东西？", en: "Can mathematical intuitions of beauty, elegance, and depth — the felt sense that steers human mathematicians toward what to study — be formalized into computable quantities, letting AI not just prove given statements but autonomously judge which conjecture is worth proving? And if not, is there something in mathematical creativity that is essentially non-formalizable?" },
      whyMatters: { zh: "已有工作用机器学习引导数学家发现新猜想（如纽结理论中的关系），但「什么值得研究」仍由人类品味驱动；能否把这种品味形式化，触及数学创造力的本质。", en: "Machine learning has already guided mathematicians to new conjectures (e.g., relations in knot theory), yet 'what is worth studying' is still driven by human taste; whether that taste can be formalized touches the nature of mathematical creativity." },
      ifAnswered: { zh: "若数学品味可被形式化，AI可能独立开辟有价值的研究方向；若不可，则为「人类创造力不可还原」提供了第一个硬证据。", en: "If taste is formalizable, AI could autonomously open valuable research directions; if not, it would be the first hard evidence that human creativity is irreducible." },
    },
  ],
  C32: [
    {
      q: { zh: "为什么大脑中的物理信息处理会「伴随」主观体验——为什么会有「成为某物的感觉」存在，而不是一切都在黑暗中无意识地运转？这道「难问题」是科学终将解决的谜，还是科学方法在原则上就无法触及的？", en: "Why is physical information processing in the brain accompanied by subjective experience at all — why is there 'something it is like' to be, rather than everything running in the dark without any inner feel? Is the 'hard problem' a puzzle science will eventually solve, or one the scientific method cannot in principle reach?" },
      whyMatters: { zh: "Chalmers 1995 把意识区分为「易问题」（功能机制）与「难问题」（为何伴随体验），并论证后者无法被功能解释所穷尽；这道鸿沟至今未被弥合，定义了整个意识科学的边界。", en: "Chalmers (1995) split consciousness into the 'easy problems' (functional mechanisms) and the 'hard problem' (why experience accompanies them), arguing the latter cannot be exhausted by functional explanation; this gap remains unbridged and defines the boundary of consciousness science." },
      ifAnswered: { zh: "若难问题被解决，要么我们将拥有一门关于「体验为何存在」的物理学，要么将证明存在科学之外的实在层面——无论哪种，都将重写我们对宇宙和自身的根本认知。", en: "Solving the hard problem would either give us a physics of why experience exists, or prove there is a layer of reality outside science — either way rewriting our fundamental understanding of the cosmos and ourselves." },
    },
    {
      q: { zh: "意识是否对应于某种可测量的物理量（如整合信息 Φ）？两套对立的理论——整合信息论与全局工作空间论——能否被一个判决性实验区分开？还是说意识根本不存在唯一正确的「神经相关物」？", en: "Does consciousness correspond to a measurable physical quantity such as integrated information Φ — and can the two rival theories, Integrated Information Theory and Global Workspace Theory, be told apart by a decisive experiment, or is there no single correct 'neural correlate' of consciousness at all?" },
      whyMatters: { zh: "IIT 主张意识等同于系统的整合信息量并可定量，与全局工作空间论给出相互冲突的预测；目前已有对抗性合作实验在尝试判决，但意识是否真有一个可测量的物理本质仍未定论。", en: "IIT claims consciousness is identical to a system's integrated information and is quantifiable, conflicting with Global Workspace predictions; adversarial-collaboration experiments are now testing this, but whether consciousness has a measurable physical essence remains unsettled." },
      ifAnswered: { zh: "若意识有可测量的相关量，临床昏迷诊断、动物与 AI 的意识判定、乃至意识的「单位」都将首次有客观依据；若没有，则意识科学需要全新的方法论。", en: "If consciousness has a measurable correlate, coma diagnosis, sentience judgments for animals and AI, even a 'unit' of consciousness would gain objective grounding for the first time; if not, the science of mind needs a wholly new methodology." },
    },
  ],
  C33: [
    {
      q: { zh: "量子力学的波函数究竟描述的是物理实在本身，还是只描述我们对实在的知识？当测量发生、叠加态「坍缩」为确定结果时，到底发生了什么——还是说从来就没有坍缩，而是世界本身在分叉？", en: "Does the quantum wavefunction describe physical reality itself, or only our knowledge of reality — and what actually happens when a measurement 'collapses' a superposition into a definite outcome, or is there never any collapse and the world itself branches?" },
      whyMatters: { zh: "量子力学是人类最精确的理论，却在「测量问题」上百年未解：实在是客观的还是依赖观测、是唯一的还是分裂的，至今没有实验或共识能裁决。这是物理学心脏处的未知。", en: "Quantum mechanics is humanity's most precise theory yet has gone a century unresolved on the measurement problem: whether reality is observer-independent or not, single or branching, with no experiment or consensus to decide. This is the unknown at the heart of physics." },
      ifAnswered: { zh: "若测量问题被解决，我们将首次知道物理实在的真正本体论——它会决定量子引力、量子计算乃至「宇宙是否唯一」等问题的整个框架。", en: "Resolving the measurement problem would tell us, for the first time, the true ontology of physical reality — setting the entire framework for quantum gravity, quantum computing and even whether the universe is unique." },
    },
    {
      q: { zh: "时空与引力，是否并非自然的基本要素，而是从更深层的量子纠缠中「涌现」出来的？如果一块区域的最大信息量由它的边界面积（而非体积）决定，那么我们所体验的三维空间，会不会只是某种全息投影？", en: "Are spacetime and gravity not fundamental, but 'emergent' from deeper quantum entanglement — and if the maximum information in a region is set by its boundary area rather than its volume, could the three-dimensional space we experience be a kind of holographic projection?" },
      whyMatters: { zh: "Bekenstein 关于黑洞熵正比于视界面积的发现，引出了全息原理：体积内的物理也许完全编码在边界上。这暗示时空可能是涌现的，直指「实在的最底层是什么」这一终极问题。", en: "Bekenstein's finding that black-hole entropy scales with horizon area led to the holographic principle: physics in a volume may be fully encoded on its boundary, hinting that spacetime is emergent and pointing at the ultimate question of what reality's bedrock is." },
      ifAnswered: { zh: "若时空确为涌现，量子引力的统一将不再是把引力「量子化」，而是从信息与纠缠重建时空——这将是自相对论以来对实在最深的一次重写。", en: "If spacetime is genuinely emergent, unifying quantum gravity would no longer mean 'quantizing' gravity but reconstructing spacetime from information and entanglement — the deepest rewrite of reality since relativity." },
    },
  ],
  C34: [
    {
      q: { zh: "我们能不能为「科学的已知盲区」画一张地图——一个系统化、可量化的「未知地形图」，让一个领域知道自己「还不知道哪些问题」，而不是只在偶然撞上反常时才发现？", en: "Can we build a systematic, quantifiable map of science's known blind spots—an atlas of ignorance that tells a field which questions it does not yet know to ask, rather than discovering them only by accidentally tripping over an anomaly?" },
      whyMatters: { zh: "科学的进步至今主要靠「已知未知」驱动，而 Firestein 等人指出真正推动范式转移的是「不知道自己不知道」。我们没有公认的方法去系统盘点一个领域的盲区结构。", en: "Science still advances mostly by chasing 'known unknowns', yet Firestein and others argue paradigm shifts come from what a field does not know it does not know. We have no agreed method to systematically inventory the structure of a field's blind spots." },
      ifAnswered: { zh: "若能测绘无知本身，科研投入将从「优化已知问题」转向「主动开采盲区」，把意外发现从运气变成可规划的工程。", en: "If ignorance itself could be mapped, research investment would shift from optimizing known problems to deliberately mining blind spots, turning serendipity from luck into plannable engineering." },
    },
    {
      q: { zh: "一个领域的「集体盲区」有多少是由它的方法和仪器本身造成的——也就是说，我们看不见某些现象，仅仅是因为现有工具在原理上无法测量它们？怎样才能侦测出这种「仪器性盲」？", en: "How much of a field's collective blindness is manufactured by its own methods and instruments—i.e., we cannot see certain phenomena simply because existing tools are in principle incapable of measuring them—and how could we detect such instrument-induced blindness?" },
      whyMatters: { zh: "每一代仪器都定义了可观测的边界；边界之外的现象在数据里根本不留痕迹，于是不会进入任何「待解问题」清单。这种盲区不是知识缺口，而是测量能力的缺口。", en: "Each generation of instruments defines the edge of the observable; phenomena beyond it leave no trace in the data and so never enter any list of open problems. This blindness is not a knowledge gap but a measurement-capability gap." },
      ifAnswered: { zh: "若能系统识别「仪器看不见的现象空间」，仪器研发将由「测得更准」转向「测得见此前不可见」，主动开辟全新观测维度。", en: "Systematically identifying the space of instrument-invisible phenomena would reorient instrument R&D from 'measure more precisely' to 'measure the previously unmeasurable', deliberately opening entire new observational dimensions." },
    },
  ],
  C37: [
    {
      q: { zh: "全球宏基因组里超过十亿条蛋白序列与任何已知参考都无相似性——这片「生物暗物质」究竟编码了什么？其中是否藏着我们从未设想过的全新生命化学、全新酶机制，甚至全新的代谢逻辑？", en: "Over a billion protein sequences in global metagenomes share no similarity with any known reference—what does this 'biological dark matter' encode? Does it conceal entirely new life-chemistry, novel enzyme mechanisms, even metabolic logics we never imagined?" },
      whyMatters: { zh: "一项分析两万多份宏基因组的研究发现 11.7 亿条与所有参考库及 Pfam 都无同源的序列，聚成十万多个全新簇。生命的大部分分子词汇，我们至今读不懂。", en: "A study of over 26,000 metagenomes found 1.17 billion sequences with no homology to any reference or to Pfam, clustering into more than 100,000 novel families. Most of life's molecular vocabulary remains unreadable to us." },
      ifAnswered: { zh: "若破译生物暗物质的功能，将一次性扩展酶工程、药物发现与合成生物的可用零件库，可能重写我们对「生命能做什么」的认知边界。", en: "Deciphering the function of biological dark matter would expand the usable parts list for enzyme engineering, drug discovery, and synthetic biology at a stroke—potentially rewriting the boundary of what we think life can do." },
    },
    {
      q: { zh: "在我们的基因组和环境样本里，是否存在一整支「无法用现有方法培养、也无法用现有探针检测」的隐藏生命——一个因为方法盲区而对我们完全不可见的生物圈分支？", en: "Hidden in our genomes and environmental samples, is there an entire branch of life that current methods can neither culture nor detect with existing probes—a clade of the biosphere rendered completely invisible to us by methodological blind spots?" },
      whyMatters: { zh: "绝大多数微生物无法在实验室培养，PCR 引物也只能扩增我们已知的序列。若有生命用了足够偏离的分子或序列，它会同时逃过培养与测序——存在却无法被记录。", en: "The vast majority of microbes cannot be cultured, and PCR primers only amplify sequences we already know. If life used sufficiently divergent molecules or sequences, it would escape both culturing and sequencing—present yet impossible to record." },
      ifAnswered: { zh: "若发现并刻画方法盲区中的隐藏生命，将彻底改写生命之树的拓扑，并可能揭示与已知生命独立起源的代谢或遗传体系。", en: "Discovering and characterizing life hidden in methodological blind spots would rewrite the topology of the tree of life and might reveal metabolic or genetic systems of independent origin from all known life." },
    },
  ],
  C44: [
    {
      q: { zh: "当物理神经网络无法精确反向传播时，原位训练能否在不依赖一个永远滞后于真实硬件的数字孪生模型的前提下，扩展到深层、多物理过程级联的系统？", en: "When a physical neural network cannot run exact backpropagation, can in-situ training scale to deep, multi-physics cascaded systems without leaning on a digital twin that forever lags the real hardware?" },
      whyMatters: { zh: "物理网络（光学、模拟、材料基底）的能效优势只有在训练也发生在物理介质中时才成立；一旦回退到数字模型反传，硬件失配、漂移与器件涨落会让离线训练的权重在真实器件上失效。这道'训练在哪里发生'的问题，是整个物理智能硬件能否从实验室小样走向规模化的命门。", en: "The energy advantage of physical networks (optical, analog, material substrates) only holds if training itself happens in the physical medium; the moment you fall back to backpropagating through a digital model, hardware mismatch, drift, and device noise make offline-trained weights fail on the real device. This 'where does training happen' question is the chokepoint for whether physical-AI hardware scales beyond lab demos." },
      ifAnswered: { zh: "若答案是肯定的，深层物理网络就能边运行边自校准，把训练能耗与推理能耗一起压进物理介质，真正兑现数量级的能效红利。", en: "If yes, deep physical networks could self-calibrate while running, folding training energy as well as inference energy into the physical medium and finally cashing in the order-of-magnitude efficiency promise." },
    },
    {
      q: { zh: "器件的随机涨落究竟是要被压制的噪声，还是应被收割的资源——同一颗忆阻器能否在不互相拆台的前提下，同时充当确定性算力、熵源、安全原语与退火求解器？", en: "Is a device's random fluctuation noise to be suppressed or a resource to be harvested — can one and the same memristor serve as deterministic compute, an entropy source, a security primitive, and an annealing solver without these roles undermining each other?" },
      whyMatters: { zh: "模拟内存计算把涨落当成精度杀手，而硬件安全、真随机数生成与伊辛退火却把同样的涨落当成核心燃料。这是物理智能硬件最深的张力：噪声同时是 bug 和 feature，而我们还没有一套统一理论说明何时该把它锁死、何时该把它放出来用。", en: "Analog in-memory computing treats fluctuation as a precision killer, while hardware security, true-random-number generation, and Ising annealing treat the very same fluctuation as core fuel. This is the deepest tension in physical-AI hardware: noise is simultaneously a bug and a feature, and we lack a unified theory of when to lock it down versus when to unleash it." },
      ifAnswered: { zh: "若理清了，单一芯片就能在算力、加密、随机性与组合优化之间按需切换涨落的角色，让噪声从必须缴的税变成可调度的资产。", en: "If resolved, a single chip could re-task fluctuation on demand across compute, encryption, randomness, and combinatorial optimization, turning noise from a tax you must pay into a schedulable asset." },
    },
  ],
  C47: [
    {
      q: { zh: "当全同态加密被搬到商用 AI 加速器（GPU/TPU）上跑时，自举（bootstrapping）该放在深度网络的哪些位置、又能否真正复用为稠密浮点张量运算设计的硬件——还是说密文算术的访存与精度结构注定与这些芯片错配？", en: "When fully homomorphic encryption is run on commodity AI accelerators (GPU/TPU), where in a deep network should bootstrapping be placed, and can hardware built for dense floating-point tensor math ever be genuinely reused for it — or is ciphertext arithmetic's memory and precision structure fundamentally mismatched to those chips?" },
      whyMatters: { zh: "自举的最优插入位置会牵动其后所有层级的密文层数与噪声预算，是 FHE 推理工程里公认最棘手的决策；而能否复用现成 AI 加速器、而非另起炉灶造专用芯片，直接决定隐私推理是停留在演示还是能规模化落地。", en: "Optimal bootstrap placement cascades into the level budget and noise of every subsequent layer and is widely held to be the single hardest decision in FHE inference engineering; whether existing AI accelerators can be reused rather than replaced by bespoke silicon decides whether private inference stays a demo or scales." },
      ifAnswered: { zh: "若解决，隐私保护的深度网络推理就能搭上现有 AI 算力浪潮，把端到端开销从千倍级压到可商用区间。", en: "If answered, privacy-preserving deep-network inference could ride the existing AI-compute wave and shrink end-to-end overhead from the thousand-fold range into a commercially viable band." },
    },
    {
      q: { zh: "当一条机密 AI 的远程证明链把 CPU TEE 与 GPU TEE 拼接起来时，在固件闭源、确定性内存加密又持续被密文侧信道撕开缺口的现实下，这条证明链到底证明了什么、又把哪些信任无声地外包给了硬件厂商？", en: "When a confidential-AI remote-attestation chain stitches a CPU TEE to a GPU TEE, what does that chain actually prove — and what trust does it silently outsource to the hardware vendor — given closed firmware and deterministic memory encryption that ciphertext side channels keep prying open?" },
      whyMatters: { zh: "复合证明被宣传为机密计算的信任根，但 GPU TEE 的规格不公开、TCB 庞大，且 TEE.Fail 等 DDR5 密文攻击表明确定性加密的物理接口仍可被低成本撕开——若证明的语义说不清，整条机密 AI 的信任叙事就是装饰性的。", en: "Composite attestation is sold as the root of trust for confidential computing, yet GPU-TEE specs are undisclosed, the TCB is large, and DDR5 ciphertext attacks like TEE.Fail show deterministic encryption's physical interface can still be cracked cheaply — if the proof's semantics are unclear, the whole confidential-AI trust story is decorative." },
      ifAnswered: { zh: "若答清楚，监管者与用户才能把'已证明'与'仍需信任厂商'划出清晰边界，让机密 AI 的信任信号变得可审计而非营销话术。", en: "If clarified, regulators and users could draw a clean line between 'attested' and 'still trusting the vendor,' making confidential-AI trust signals auditable rather than marketing." },
    },
  ],
  C51: [
    {
      q: { zh: "当因果基础模型只在合成先验数据上训练、却要被摊销式地用到任意真实数据集上时，我们如何判定一个新数据集是否落在它「先验支撑」之内、从而知道它给出的处理效应估计何时可信、何时只是外推幻觉？", en: "When a causal foundation model is trained only on synthetic prior data yet amortized to arbitrary real datasets, how do we decide whether a new dataset falls inside its prior support — so we know when its treatment-effect estimates are trustworthy versus mere extrapolated hallucination?" },
      whyMatters: { zh: "整条「摊销式因果推断」路线（CausalPFN、Do-PFN、PFN 类网络）把可信度押在「真实世界长得像训练时的合成先验」这一未经检验的假设上；一旦真实数据偏离先验，模型仍会自信地输出一个因果数，却没有任何内建的失效信号。", en: "The entire amortized-causal-inference program (CausalPFN, Do-PFN, PFN-style nets) stakes its trustworthiness on the untested assumption that real data resembles the synthetic prior it was trained on; once real data drifts off-prior, the model still confidently emits a causal number with no built-in failure signal." },
      ifAnswered: { zh: "若能给出可计算的「先验支撑」检验，因果基础模型就能像有校准区间的仪器一样部署——在支撑内零样本回答、在支撑外明确拒答。", en: "A computable prior-support test would let causal foundation models be deployed like instruments with calibrated coverage — answering zero-shot inside support and explicitly abstaining outside it." },
    },
    {
      q: { zh: "如果允许任意非线性映射来做因果抽象，连随机网络都能被「对齐」到任意算法，那么因果抽象框架到底要施加哪些结构约束，才能让「神经网络实现了某个因果机制」这一断言不沦为空洞？", en: "If arbitrary non-linear maps are allowed in causal abstraction, even a random network can be 'aligned' to any algorithm — so what structural constraints must the causal-abstraction framework impose before the claim 'this network implements that causal mechanism' stops being vacuous?" },
      whyMatters: { zh: "因果抽象被当作机制可解释性的统一理论根基，但「非线性表征困境」表明：不加约束时对齐永远成立，于是任何可解释性结论都可被一个反例平凡化，整套可信度叙事就失去了地基。", en: "Causal abstraction is treated as the unifying theoretical foundation of mechanistic interpretability, yet the 'non-linear representation dilemma' shows that without constraints an alignment always exists — so any interpretability conclusion can be trivialized by a counterexample, knocking the legs out from under the whole trust narrative." },
      ifAnswered: { zh: "划清允许的表征类后，机制可解释性的「该网络真的算了这一步」就能成为可证伪的断言，而非自证的修辞。", en: "Pinning down the admissible class of representations would turn 'this network really computes that step' into a falsifiable claim rather than self-fulfilling rhetoric." },
    },
  ],
};
