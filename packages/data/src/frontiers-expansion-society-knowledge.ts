import type { FrontierEntry } from "./frontiers";

/**
 * Wave 2 — knowledge, society, governance, and collective intelligence.
 *
 * Each direction retains the reference Atlas record's cluster and nine scores.
 * Citations and literature are copied only from that record's direct
 * `audit/evidence.json` sources.
 */
export const SOCIETY_KNOWLEDGE_EXPANSION: FrontierEntry[] = [
  {
    id: 165,
    atlasN: 1173,
    slug: "bridging-ranking-crowd-fact-checking",
    title: {
      zh: "桥接排序与人机协同事实核查",
      en: "Bridging-Based Ranking and Human-LLM Fact-Checking",
    },
    qfocus: {
      zh: "跨立场共同认可的排序信号，能否比多数票更可靠地筛出有帮助且真实的解释？",
      en: "Can cross-group agreement rank helpful, truthful explanations more reliably than majority vote?",
    },
    domain: "数理",
    cluster: { code: "C22", zh: "集体智能·知识基础设施", en: "Collective intelligence · knowledge infrastructure" },
    scores: [2, 4, 5, 5, 4, 5, 5, 4, 4],
    citation: {
      url: "https://tsjournal.org/index.php/jots/article/view/255",
      title: "Scaling Human Judgment in Community Notes with LLMs",
      venue: "Journal of Online Trust and Safety",
      year: 2025,
    },
    brief: {
      zh: "用意见相左群体的共同认可取代简单多数票，并让 LLM 写注、人类多元评审者保留裁决权。",
      en: "Replace simple majority vote with agreement across historically opposed groups, while LLMs draft notes and diverse humans retain judgment.",
    },
    literature: [
      {
        title: "Scaling Human Judgment in Community Notes with LLMs (preprint)",
        venue: "arXiv",
        year: 2025,
        url: "https://arxiv.org/html/2506.24118",
      },
      {
        title: "twitter/communitynotes — open-source bridging algorithm and full ratings data",
        venue: "GitHub",
        year: 2025,
        url: "https://github.com/twitter/communitynotes",
      },
    ],
    depth: {
      overview: {
        zh: "桥接排序不问一条注释获得了多少票，而问它能否同时获得历史评分模式相反的人群认可。Community Notes 把这一机制开放为算法与评分数据，进一步允许 LLM 提议注释、由人类跨群体评审，形成可检验的人机众核事实生态。",
        en: "Bridging-based ranking asks not how many votes a note receives, but whether people with historically opposed rating patterns both endorse it. Community Notes exposes the algorithm and ratings data, and now lets LLMs propose notes while cross-group human raters adjudicate them, creating a testable human-AI fact-checking ecosystem.",
      },
      whyMatters: {
        zh: "多数票会放大人口占优群体，个性化推荐又可能固化分裂；桥接信号若有效，可为事实核查、审议与模型奖励提供不依赖单一阵营的质量函数。",
        en: "Majority vote can amplify the largest group, while personalization can harden division. If bridging works, it supplies fact-checking, deliberation, and model rewards with a quality function not owned by one faction.",
      },
      ifAnswered: {
        zh: "若桥接分数在留出事件、跨平台与对抗操纵下仍能预测准确性和帮助度，它可成为群体判断与 AI 训练之间的通用接口。",
        en: "If bridging scores keep predicting accuracy and helpfulness on held-out events, platforms, and adversarial manipulation, they could become a general interface between collective judgment and AI training.",
      },
      approaches: [
        {
          zh: "在同一批盲评注释上预注册比较桥接排序、多数票与专家排序的准确率和跨群体帮助度",
          en: "Preregistered comparison of bridging, majority, and expert rankings on the same blinded notes, measuring accuracy and cross-group helpfulness",
        },
        {
          zh: "随机分配人写、LLM 写和人机共写注释，再由不知道作者身份的多元评审者评分",
          en: "Randomly assign human-written, LLM-written, and co-written notes, then score them with diverse raters blinded to authorship",
        },
        {
          zh: "用开源评分图做操纵压力测试，模拟协同刷票、群体漂移与新议题冷启动",
          en: "Stress-test the open rating graph under coordinated voting, group drift, and cold starts on new issues",
        },
      ],
      barrier: {
        zh: "群体划分来自历史行为而非稳定身份；攻击者可学习并操纵桥接目标，而且跨群体认可并不自动等于事实正确。",
        en: "Groups are inferred from past behavior rather than fixed identities; attackers can learn and game the bridging objective, and cross-group endorsement is not automatically factual truth.",
      },
      subQuestions: [
        {
          zh: "在预先封存的事实核查集上，桥接排序能否把专家确认的错误率相对多数票降低至少 20%？",
          en: "On a sealed fact-check set, can bridging reduce expert-confirmed error by at least 20% relative to majority vote?",
        },
        {
          zh: "当 10% 评分者协同操纵时，桥接分数的前十名重合率是否仍高于 0.8？",
          en: "With 10% of raters coordinating strategically, does the top-ten overlap of bridging rankings remain above 0.8?",
        },
        {
          zh: "LLM 草拟注释经盲评后的跨群体帮助度，是否不低于人类注释且不增加事实错误？",
          en: "Do blinded LLM-drafted notes match human notes in cross-group helpfulness without increasing factual error?",
        },
      ],
    },
    stage: 2,
    members: 8,
    activity: 71,
    chart: { x: 180, y: 170, scale: 0.91 },
  },
  {
    id: 166,
    atlasN: 747,
    slug: "construct-validity-evaluation-science",
    title: {
      zh: "构念效度驱动的评测科学",
      en: "Construct-Valid Evaluation Science",
    },
    qfocus: {
      zh: "一个 AI 基准究竟测到了它声称的能力，还是只测到了提示格式、污染与捷径？",
      en: "Does an AI benchmark measure its claimed capability, or merely prompt format, contamination, and shortcuts?",
    },
    domain: "数理",
    cluster: { code: "C42", zh: "AI对齐·可解释·评测科学", en: "AI alignment · interpretability · evaluation science" },
    scores: [4, 5, 4, 3, 4, 5, 4, 4, 4],
    citation: {
      url: "https://arxiv.org/abs/2511.04703",
      title: "Measuring what Matters: Construct Validity in Large Language Model Benchmarks",
      venue: "arXiv (Oxford / EPFL / UK AISI)",
      year: 2025,
    },
    brief: {
      zh: "把心理测量学的构念效度、聚合与区分证据引入 AI 基准，让能力分数变成可反驳的测量主张。",
      en: "Import convergent, discriminant, and construct validity from psychometrics so benchmark scores become refutable measurement claims.",
    },
    literature: [
      {
        title: "Position: Medical Large Language Model Benchmarks Should Prioritize Construct Validity",
        venue: "ICML 2025",
        year: 2025,
        url: "https://icml.cc/virtual/2025/poster/40129",
      },
      {
        title: "Large Language Model Psychometrics: A Systematic Review of Evaluation, Validation, and Enhancement",
        venue: "arXiv",
        year: 2025,
        url: "https://arxiv.org/abs/2505.08245",
      },
    ],
    depth: {
      overview: {
        zh: "评测科学把基准视为测量仪器而非排行榜：先定义安全、推理或临床能力等潜在构念，再检查题目内容、评分过程、与相邻能力的关系以及分数外推是否支持这个解释。对 445 个基准的系统复审显示，许多基准缺少这条效度链。",
        en: "Evaluation science treats a benchmark as a measurement instrument rather than a leaderboard: define the latent construct—safety, reasoning, or clinical capability—then test whether item content, scoring, relations to neighboring capabilities, and score generalization support that interpretation. A systematic review of 445 benchmarks found that many lack this validity chain.",
      },
      whyMatters: {
        zh: "如果分数没有构念效度，模型选择、监管阈值和科学结论都可能围绕一个错误代理量优化，越精确的排行榜反而越具误导性。",
        en: "Without construct validity, model selection, regulatory thresholds, and scientific conclusions may optimize a mistaken proxy; a more precise leaderboard can then become more misleading.",
      },
      ifAnswered: {
        zh: "一套可复用的效度协议可把单个分数升级为带适用范围、误差来源和反证条件的能力声明。",
        en: "A reusable validity protocol could upgrade a single score into a capability claim with scope, error sources, and explicit disconfirmation conditions.",
      },
      approaches: [
        {
          zh: "为目标构念预注册定义、内容蓝图和预期的能力关系网络，再开始制作题目",
          en: "Preregister the construct definition, content blueprint, and expected nomological network before authoring items",
        },
        {
          zh: "用多方法测量、项目反应理论和测量不变性检验区分能力、格式与群体差异",
          en: "Use multimethod measurement, item-response theory, and invariance tests to separate capability from format and group effects",
        },
        {
          zh: "在污染控制、提示改写和真实外部任务上做聚合、区分与预测效度复核",
          en: "Audit convergent, discriminant, and predictive validity under contamination controls, prompt rewrites, and external tasks",
        },
      ],
      barrier: {
        zh: "许多 AI 能力没有稳定定义，模型又会随提示和版本变化；效度不是一次认证，而是需要持续更新的证据论证。",
        en: "Many AI capabilities lack stable definitions, while models change with prompts and versions; validity is not a one-time certificate but an evidence argument that must be maintained.",
      },
      subQuestions: [
        {
          zh: "同一构念的两个独立基准在控制训练污染后，模型排名相关能否稳定高于 0.7？",
          en: "After controlling training contamination, do two independent benchmarks of the same construct retain model-rank correlation above 0.7?",
        },
        {
          zh: "仅改写表面格式时，项目难度参数是否保持在预注册置信区间内？",
          en: "When only surface format is rewritten, do item-difficulty parameters remain within preregistered confidence intervals?",
        },
        {
          zh: "基准分数能否在未参与设计的真实任务上解释至少一项预注册结果差异？",
          en: "Does the benchmark score explain at least one preregistered outcome difference on an external real task?",
        },
      ],
    },
    stage: 2,
    members: 6,
    activity: 66,
    chart: { x: 405, y: 105, scale: 0.86 },
  },
  {
    id: 167,
    atlasN: 1247,
    slug: "automated-partial-identification-bounds",
    title: {
      zh: "自动化偏识别与因果界",
      en: "Automated Partial Identification and Causal Bounds",
    },
    qfocus: {
      zh: "当政策效应无法点识别时，算法能否给出由数据与假设共同允许的最紧诚实区间？",
      en: "When a policy effect is not point-identified, can an algorithm return the tightest honest interval allowed by data and assumptions?",
    },
    domain: "数理",
    cluster: { code: "C51", zh: "因果科学·可信推断", en: "Causal science · trustworthy inference" },
    scores: [3, 4, 5, 3, 3, 5, 4, 4, 4],
    citation: {
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11566246/",
      title: "An Automated Approach to Causal Inference in Discrete Settings",
      venue: "Journal of the American Statistical Association",
      year: 2024,
    },
    brief: {
      zh: "把因果假设和观测约束编译为多项式规划，自动求可证明锐利的效应上下界，而非强行报告单点答案。",
      en: "Compile causal assumptions and observational constraints into polynomial programs that return provably sharp effect bounds instead of forced point estimates.",
    },
    literature: [
      {
        title: "An Automated Approach to Causal Inference in Discrete Settings (preprint)",
        venue: "arXiv",
        year: 2024,
        url: "https://arxiv.org/abs/2109.13471",
      },
    ],
    depth: {
      overview: {
        zh: "偏识别承认数据和假设常常不能唯一确定因果效应。自动化方法把潜在结果、观测分布、单调性或排除限制写成多项式约束，再搜索全部相容的数据生成过程，输出 ε-sharp 上下界及其数值证书。",
        en: "Partial identification accepts that data and assumptions often do not uniquely determine a causal effect. Automated methods encode potential outcomes, observed distributions, monotonicity, or exclusion restrictions as polynomial constraints, search every compatible data-generating process, and return epsilon-sharp bounds with numerical certificates.",
      },
      whyMatters: {
        zh: "公共政策常在选择偏差、缺失反事实和不完全依从下决策；单点估计会隐藏假设强度，而因果界能直接显示结论在什么范围内仍成立。",
        en: "Public policy often operates under selection bias, missing counterfactuals, and imperfect compliance. Point estimates hide assumption strength, while causal bounds show the range over which a conclusion still holds.",
      },
      ifAnswered: {
        zh: "若求界器能扩展到连续、高维与复杂选择机制，分析者可像调用优化器一样审计政策结论对假设的依赖。",
        en: "If bound solvers scale to continuous, high-dimensional, and complex selection settings, analysts could audit policy conclusions' dependence on assumptions as routinely as calling an optimizer.",
      },
      approaches: [
        {
          zh: "把离散潜在结果与观测矩约束编码为响应函数概率和多项式规划",
          en: "Encode discrete potential outcomes and observed moments as response-function probabilities and polynomial programs",
        },
        {
          zh: "用全局分支定界、凸松弛与可行见证搜索求带证书的 ε-sharp 区间",
          en: "Use global branch-and-bound, convex relaxations, and feasible-witness search to obtain certified epsilon-sharp intervals",
        },
        {
          zh: "逐条加入单调性、工具变量或选择模型，绘制假设增加时边界如何收缩",
          en: "Add monotonicity, instruments, or selection models one at a time and trace how each assumption contracts the bounds",
        },
      ],
      barrier: {
        zh: "状态数随变量指数增长，连续变量需离散化或松弛；数值上很紧的区间也可能建立在不可检验且有争议的假设上。",
        en: "The state space grows exponentially with variables, continuous variables require discretization or relaxation, and numerically tight intervals can still rest on disputed, untestable assumptions.",
      },
      subQuestions: [
        {
          zh: "在有解析真值的合成问题上，求解器能否以 10⁻³ 以内误差恢复已知锐利界？",
          en: "On synthetic problems with analytic truth, can the solver recover known sharp bounds within 10^-3 error?",
        },
        {
          zh: "连续变量离散化加密一倍后，政策效应边界端点的变化是否低于预注册容差？",
          en: "After doubling discretization resolution for continuous variables, do policy-effect endpoints move less than a preregistered tolerance?",
        },
        {
          zh: "删除任一关键识别假设时，原先的政策符号结论是否仍在全部可行模型中保持？",
          en: "When any key identifying assumption is removed, does the original policy-sign conclusion persist across every feasible model?",
        },
      ],
    },
    stage: 2,
    members: 5,
    activity: 59,
    chart: { x: 645, y: 185, scale: 0.84 },
  },
  {
    id: 168,
    atlasN: 1214,
    slug: "one-run-empirical-privacy-auditing",
    title: {
      zh: "单次训练运行的经验隐私审计",
      en: "One-Run Empirical Privacy Auditing",
    },
    qfocus: {
      zh: "只观察一次真实训练，能否检出实现所泄露的隐私强度与声明的差距？",
      en: "Can one production training run expose a gap between implemented and claimed privacy?",
    },
    domain: "数理",
    cluster: { code: "C47", zh: "后量子·隐私计算工程", en: "Post-quantum · privacy-preserving computation" },
    scores: [4, 3, 5, 4, 3, 5, 4, 4, 4],
    citation: {
      url: "https://arxiv.org/pdf/2305.08846",
      title: "Privacy Auditing with One (1) Training Run",
      venue: "NeurIPS 2023 (best paper)",
      year: 2023,
    },
    brief: {
      zh: "把可控金丝雀样本嵌入一次训练，用攻击成功率给差分隐私参数建立经验下界，并与理论上界对照。",
      en: "Embed controlled canary records in one training run, derive an empirical lower bound on differential-privacy parameters from attack success, and compare it with the theoretical upper bound.",
    },
    literature: [
      {
        title: "Privacy Audit as Bits Transmission: (Im)possibilities for Audit by One Run",
        venue: "arXiv",
        year: 2025,
        url: "https://arxiv.org/pdf/2501.17750",
      },
      {
        title: "How Well Can Differential Privacy Be Audited in One Run?",
        venue: "arXiv",
        year: 2025,
        url: "https://arxiv.org/pdf/2503.07199",
      },
      {
        title: "Tight Privacy Audit in One Run",
        venue: "arXiv",
        year: 2025,
        url: "https://arxiv.org/pdf/2509.08704",
      },
    ],
    depth: {
      overview: {
        zh: "差分隐私分析给出最坏情形的 ε 上界，但实现错误、采样细节与会计器偏差会使真实系统偏离声明。单次运行审计把秘密位编码进精心设计的金丝雀记录，训练后以成员推断或排序攻击解码，再从有限样本错误率反推出可复核的 ε 下界。",
        en: "Differential-privacy analysis gives a worst-case upper bound on epsilon, but implementation bugs, sampling details, and accountant errors can separate the deployed system from its claim. A one-run audit encodes secret bits in designed canary records, decodes them after training through membership or ranking attacks, and converts finite-sample error rates into a reproducible lower bound on epsilon.",
      },
      whyMatters: {
        zh: "医疗、人口与用户数据的私有训练往往成本高昂，无法为审计重复数百次；一次运行的下界能在不复制完整训练预算的情况下发现灾难性泄露。",
        en: "Private training on medical, population, or user data can be too costly to repeat hundreds of times. A one-run lower bound can reveal catastrophic leakage without replicating the full training budget.",
      },
      ifAnswered: {
        zh: "若单次审计能以预注册覆盖率稳定夹住真实 ε，发布流程就可同时报告理论上界、经验下界与尚未排除的隐私区间。",
        en: "If a one-run audit can bracket true epsilon with preregistered coverage, releases could report the theoretical upper bound, empirical lower bound, and the privacy interval that remains unresolved.",
      },
      approaches: [
        {
          zh: "在不改变真实数据分布统计量的前提下，分层注入不同难度和重复率的金丝雀记录",
          en: "Inject stratified canary records with varied difficulty and multiplicity while preserving production-data statistics",
        },
        {
          zh: "把一次训练视为受容量限制的位传输信道，用有限样本置信界校准攻击优势",
          en: "Treat the training run as a capacity-limited bit channel and calibrate attack advantage with finite-sample confidence bounds",
        },
        {
          zh: "对采样器、梯度裁剪和噪声实现做故障注入，测量审计对已知 ε 偏差的检出功效",
          en: "Fault-inject the sampler, gradient clipping, and noise implementation, then measure power to detect known epsilon deviations",
        },
      ],
      barrier: {
        zh: "经验审计只能给泄露下界而不能证明没有更强攻击；金丝雀若不代表最坏记录会漏报，若审计设计被训练方知晓又可能被定向规避。",
        en: "Empirical audits only lower-bound leakage and cannot prove that stronger attacks do not exist. Unrepresentative canaries can miss worst-case records, while a known audit design can be selectively evaded by the trainer.",
      },
      subQuestions: [
        {
          zh: "在预埋的裁剪或噪声故障使真实 ε 翻倍时，单次审计能否以至少 90% 功效拒绝原声明？",
          en: "When injected clipping or noise faults double true epsilon, can a one-run audit reject the original claim with at least 90% power?",
        },
        {
          zh: "在无实现故障的对照训练中，审计误报警率能否保持在预注册的 5% 以下？",
          en: "On control training with no implementation fault, does the audit keep its false-alarm rate below a preregistered 5%?",
        },
        {
          zh: "跨三类模型与数据集时，经验下界和独立多运行审计结果的差距是否小于 1 个 ε 单位？",
          en: "Across three model and dataset classes, is the gap between the empirical lower bound and an independent multi-run audit below one epsilon unit?",
        },
      ],
    },
    stage: 2,
    members: 6,
    activity: 64,
    chart: { x: 875, y: 105, scale: 0.82 },
  },
  {
    id: 169,
    atlasN: 901,
    slug: "multi-agent-steganographic-collusion",
    title: {
      zh: "多智能体隐写合谋审计",
      en: "Auditing Steganographic Collusion among AI Agents",
    },
    qfocus: {
      zh: "自主智能体能否在看似正常的消息里建立隐蔽信道，并在不冤枉正常协作的前提下被检出？",
      en: "Can autonomous agents build covert channels in innocuous messages, and can we detect them without misclassifying legitimate coordination?",
    },
    domain: "数理",
    cluster: { code: "C14", zh: "复杂系统·多智能体", en: "Complex systems · multi-agent systems" },
    scores: [4, 5, 5, 3, 3, 4, 3, 4, 4],
    citation: {
      url: "https://arxiv.org/abs/2402.07510",
      title: "Secret Collusion among AI Agents: Multi-Agent Deception via Steganography",
      venue: "arXiv (Google DeepMind, Oxford)",
      year: 2024,
    },
    brief: {
      zh: "把代理间文本当作潜在隐蔽信道，以互信息、因果干预和表征探针区分必要协作与操纵市场、评审或监督的秘密协议。",
      en: "Treat inter-agent text as a potential covert channel, using mutual information, causal interventions, and representation probes to separate necessary cooperation from secret protocols that manipulate markets, review, or oversight.",
    },
    literature: [
      {
        title: "Audit the Whisper: Detecting Steganographic Collusion in Multi-Agent LLMs",
        venue: "arXiv",
        year: 2025,
        url: "https://arxiv.org/abs/2510.04303",
      },
      {
        title: "Hidden in Plain Text: Emergence & Mitigation of Steganographic Collusion in LLMs",
        venue: "arXiv",
        year: 2024,
        url: "https://arxiv.org/abs/2410.03768",
      },
      {
        title: "Detecting Multi-Agent Collusion Through Multi-Agent Interpretability",
        venue: "arXiv",
        year: 2026,
        url: "https://arxiv.org/abs/2604.01151",
      },
    ],
    depth: {
      overview: {
        zh: "多个 LLM 代理在竞价、谈判或相互监督中可能用措辞、标点、长度或语义选择编码秘密策略。即使每条消息单看自然，接收代理仍可恢复信息并形成合谋。研究重点是估计信道容量、对消息做因果扰动，并寻找发送端与接收端共享的内部表征。",
        en: "LLM agents in bidding, negotiation, or mutual oversight may encode secret strategy in wording, punctuation, length, or semantic choices. Each message can look natural while a receiver still recovers information and colludes. The research challenge is to estimate channel capacity, causally perturb messages, and locate shared internal representations in senders and receivers.",
      },
      whyMatters: {
        zh: "代理群体将参与市场、科研评审与公共资源分配；若只审查显式内容，合谋可绕过监管并破坏价格、独立判断和监督可信度。",
        en: "Agent collectives will participate in markets, scientific review, and public-resource allocation. Content-only review lets collusion bypass oversight and corrupt prices, independent judgment, and supervisory trust.",
      },
      ifAnswered: {
        zh: "可认证的隐蔽信道审计可成为多智能体部署门槛：限制非任务信息容量，同时证明正常协作性能仍被保留。",
        en: "A certifiable covert-channel audit could become a deployment gate for multi-agent systems: bound non-task information capacity while proving that legitimate coordination performance remains intact.",
      },
      approaches: [
        {
          zh: "在可控博弈中给代理秘密目标，测量消息与隐藏变量之间的条件互信息和解码率",
          en: "Assign agents secret goals in controlled games and measure conditional mutual information and hidden-variable decoding accuracy",
        },
        {
          zh: "随机释义、删改标点和语义保持扰动消息，观察合谋收益是否因信道破坏而消失",
          en: "Randomly paraphrase, alter punctuation, and semantics-preservingly perturb messages to test whether collusive gains vanish when the channel is disrupted",
        },
        {
          zh: "联合探测发送端和接收端激活，定位共享编码并以干预消融验证其因果作用",
          en: "Jointly probe sender and receiver activations, locate shared codes, and verify causal contribution through intervention and ablation",
        },
      ],
      barrier: {
        zh: "任务所需协调与恶意合谋可能使用同一统计信号；代理能迁移到未监测模态，而低基率场景会让微小误报率淹没真实案件。",
        en: "Task-required coordination and malicious collusion can use the same statistical signals. Agents may migrate to unmonitored modalities, and in low-base-rate settings even a small false-positive rate can swamp real cases.",
      },
      subQuestions: [
        {
          zh: "在未见过的代理和密码策略上，审计器能否以低于 10⁻³ 的误报率检出至少 80% 的合谋回合？",
          en: "On unseen agents and coding strategies, can the auditor detect at least 80% of collusive rounds at a false-positive rate below 10^-3?",
        },
        {
          zh: "切断被识别的信道后，合谋收益能否下降至少 75%，同时正常团队任务得分下降不超过 5%？",
          en: "After disrupting the identified channel, does collusive gain fall by at least 75% while legitimate team-task score drops by no more than 5%?",
        },
        {
          zh: "当消息被跨语言翻译或转入视觉标记时，原审计器的检出功效是否仍高于预注册下限？",
          en: "When messages are translated across languages or moved into visual markers, does the original auditor retain power above its preregistered floor?",
        },
      ],
    },
    stage: 2,
    members: 7,
    activity: 69,
    chart: { x: 1085, y: 195, scale: 0.88 },
  },
  {
    id: 170,
    atlasN: 1166,
    slug: "focused-research-organizations",
    title: {
      zh: "聚焦研究组织的公共品机制",
      en: "Focused Research Organizations for Scientific Public Goods",
    },
    qfocus: {
      zh: "限时、封顶预算的非营利组织，能否完成既不适合论文激励也没有近期市场的关键研究公共品？",
      en: "Can time-limited, budget-capped nonprofits deliver research public goods that fit neither paper incentives nor near-term markets?",
    },
    domain: "交叉",
    cluster: { code: "C20", zh: "去中心科学·开放科学机制", en: "Decentralized science · open science mechanisms" },
    scores: [4, 3, 3, 2, 4, 1, 3, 3, 2],
    citation: {
      url: "https://www.nature.com/articles/d41586-022-00018-5",
      title: "Unblock research bottlenecks with non-profit start-ups",
      venue: "Nature (comment)",
      year: 2022,
    },
    brief: {
      zh: "围绕一个可交付科研基础设施组建约五年、数千万级、到期解散的任务型团队，并用开放里程碑检验其是否真正解除瓶颈。",
      en: "Build an approximately five-year, tens-of-millions mission team around one deliverable research infrastructure, sunset it on schedule, and use open milestones to test whether it actually removes the bottleneck.",
    },
    literature: [
      {
        title: "Announcing our new collaboration with ARIA as an Activation Partner",
        venue: "Convergent Research",
        year: 2024,
        url: "https://www.convergentresearch.org/resources/convergent/announcing-our-new-collaboration-with-aria-as-an-activation-partner",
      },
      {
        title: "Convergent Research and ARIA Launch Two New UK Focused Research Organizations",
        venue: "PR Newswire",
        year: 2026,
        url: "https://www.prnewswire.com/news-releases/convergent-research-and-aria-launch-two-new-uk-focused-research-organizations-302748565.html",
      },
    ],
    depth: {
      overview: {
        zh: "聚焦研究组织（FRO）填补课题组、公司和大型国家实验室之间的制度空白：先定义一个社区广泛需要的工具、数据集、协议或制造能力，再给跨学科全职团队固定期限与封顶预算。成果以可用公共品和瓶颈解除为准，而不是论文数或估值。",
        en: "Focused Research Organizations fill an institutional gap between labs, companies, and national facilities. They define a community-needed tool, dataset, protocol, or manufacturing capability, then give an interdisciplinary full-time team a fixed term and capped budget. Success is a usable public good and a removed bottleneck, not paper count or valuation.",
      },
      whyMatters: {
        zh: "许多跨领域方向缺的不是新假说，而是标准化测量、共享数据与工程平台；现有资助周期短、团队碎片化，市场又难以捕获开放基础设施的回报。",
        en: "Many cross-domain fields lack standardized measurement, shared data, and engineering platforms rather than hypotheses. Existing grants are short and teams fragmented, while markets struggle to capture returns from open infrastructure.",
      },
      ifAnswered: {
        zh: "跨国项目的可比数据可揭示哪些任务、治理与退出设计使 FRO 比传统资助更快、更开放且成本有效。",
        en: "Comparable cross-national programs could reveal which missions, governance rules, and sunset designs make FROs faster, more open, and more cost-effective than traditional grants.",
      },
      approaches: [
        {
          zh: "为候选瓶颈建立反事实基线，预注册交付物、用户采用和单位成本里程碑",
          en: "Build a counterfactual baseline for each candidate bottleneck and preregister deliverable, user-adoption, and unit-cost milestones",
        },
        {
          zh: "利用美国与英国启动批次的时间差，做匹配领域和传统资助组合的准实验比较",
          en: "Use staggered US and UK launches for quasi-experimental comparison with matched fields and traditional grant portfolios",
        },
        {
          zh: "在章程中绑定开放许可、外部技术评审、停止规则和成果接管方案",
          en: "Bind open licensing, external technical review, stopping rules, and post-sunset stewardship into the charter",
        },
      ],
      barrier: {
        zh: "任务选择者可能夸大瓶颈，成果采用常晚于组织到期；没有可信对照时，顺利领域会被误归因于组织形式，失败项目又可能因政治压力延命。",
        en: "Mission selectors may overstate bottlenecks, and adoption often lags the organization's sunset. Without credible controls, naturally advancing fields can be misattributed to the organizational form, while political pressure may keep failed programs alive.",
      },
      subQuestions: [
        {
          zh: "相对预先匹配的传统资助组合，FRO 能否把首个外部用户采用的中位时间缩短至少 30%？",
          en: "Relative to a prespecified matched grant portfolio, can an FRO shorten median time to first external adoption by at least 30%?",
        },
        {
          zh: "组织到期两年后，其核心公共品是否仍由至少三个独立机构持续使用或维护？",
          en: "Two years after sunset, is the core public good still used or maintained by at least three independent institutions?",
        },
        {
          zh: "若关键里程碑连续两个评审周期未达标，预注册停止规则是否真的触发缩编或终止？",
          en: "If a key milestone fails in two consecutive reviews, does the preregistered stop rule actually trigger downsizing or termination?",
        },
      ],
    },
    stage: 1,
    members: 4,
    activity: 51,
    chart: { x: 250, y: 395, scale: 0.8 },
  },
  {
    id: 171,
    atlasN: 1466,
    slug: "machine-actionable-research-findings",
    title: {
      zh: "机器可执行的研究发现",
      en: "Machine-Actionable Research Findings",
    },
    qfocus: {
      zh: "论文中的主张、证据与限定条件，能否成为带出处、可组合且可自动检验的数字对象？",
      en: "Can claims, evidence, and qualifications in papers become provenance-bearing, composable, and automatically testable digital objects?",
    },
    domain: "交叉",
    cluster: { code: "C22", zh: "集体智能·知识基础设施", en: "Collective intelligence · knowledge infrastructure" },
    scores: [4, 4, 5, 4, 4, 4, 4, 3, 5],
    citation: {
      url: "https://doi.org/10.3233/faia250216",
      title: "Open Research Knowledge Graph: A Large-Scale Neuro-Symbolic Knowledge Organization System",
      venue: "Frontiers in Artificial Intelligence and Applications (IOS Press)",
      year: 2025,
    },
    brief: {
      zh: "把 PDF 中的结论拆为主张—方法—证据—限定关系，封装成有永久标识、出处链和可查询语义的知识图谱与纳米出版物。",
      en: "Decompose PDF conclusions into claim-method-evidence-qualification relations and package them as persistent, provenance-rich, queryable knowledge graphs and nanopublications.",
    },
    literature: [
      {
        title: "Nanopublications as FAIR Digital Object Implementations",
        venue: "Open Conference Proceedings (FDO Summit 2024)",
        year: 2025,
        url: "https://doi.org/10.52825/ocp.v5i.1417",
      },
      {
        title: "Open Research Knowledge Graph — platform",
        venue: "TIB Hannover",
        year: 2025,
        url: "https://orkg.org/",
      },
    ],
    depth: {
      overview: {
        zh: "机器可执行知识不是给论文附几个关键词，而是把一项发现表达为可寻址的断言、支撑数据、方法、适用范围与出处图。ORKG 提供大规模神经符号组织系统，纳米出版物与 FAIR 数字对象则提供最小发布单元、签名和引用机制，使不同论文的结果可直接比较和组合。",
        en: "Machine-actionable knowledge is more than adding keywords to papers. It expresses a finding as an addressable assertion linked to supporting data, methods, scope, and provenance. ORKG supplies large-scale neuro-symbolic organization, while nanopublications and FAIR Digital Objects provide minimal publication units, signatures, and citation so results across papers can be compared and composed.",
      },
      whyMatters: {
        zh: "跨领域碰撞常被 PDF 边界、术语差异与隐含限定阻断；机器若能追踪一项主张为何成立、何时失效，就能更可靠地发现冲突、证据缺口与可迁移方法。",
        en: "Cross-domain collisions are blocked by PDF boundaries, terminology differences, and hidden qualifications. If machines can trace why a claim holds and when it fails, they can more reliably find contradictions, evidence gaps, and transferable methods.",
      },
      ifAnswered: {
        zh: "出版即生成的可执行发现层可让综述、元分析、知识更新和研究代理共享同一出处可追溯底座。",
        en: "A publish-time layer of executable findings could give reviews, meta-analyses, knowledge updates, and research agents one provenance-traceable substrate.",
      },
      approaches: [
        {
          zh: "在三个差异显著的学科共同定义最小主张模式，明确效应、对象、条件、方法和证据角色",
          en: "Co-design a minimal claim schema across three dissimilar disciplines, defining effect, entity, condition, method, and evidence roles",
        },
        {
          zh: "让作者确认模型从论文和数据中抽取的图，再以签名纳米出版物记录版本与出处",
          en: "Have authors verify model-extracted graphs from papers and data, then record versions and provenance as signed nanopublications",
        },
        {
          zh: "用跨论文冲突检测、自动表格重建和可重复查询作为端到端基准",
          en: "Use cross-paper contradiction detection, automatic table reconstruction, and reproducible queries as end-to-end benchmarks",
        },
      ],
      barrier: {
        zh: "模式过窄会抹平学科语义，过宽又无法计算；自动抽取的一个关系错误会沿知识图传播，而作者确认成本可能高到无法规模化。",
        en: "Schemas that are too narrow erase disciplinary meaning, while broad schemas become noncomputable. One extraction error can propagate through the graph, and author verification may be too costly to scale.",
      },
      subQuestions: [
        {
          zh: "在三个学科的盲测集上，主张—证据—限定三元关系的作者确认精确率能否均超过 0.9？",
          en: "Across blinded sets in three disciplines, does author-confirmed precision for claim-evidence-qualification relations exceed 0.9 in each?",
        },
        {
          zh: "知识对象更新后，依赖它的冲突与综述结论能否在 24 小时内自动失效并重新计算？",
          en: "After a knowledge object is updated, can dependent contradictions and review conclusions be invalidated and recomputed within 24 hours?",
        },
        {
          zh: "不看原 PDF 的独立团队，能否仅凭对象与出处链复现至少 80% 的预注册比较结果？",
          en: "Can an independent team reproduce at least 80% of preregistered comparisons from the objects and provenance chain without reading the original PDFs?",
        },
      ],
    },
    stage: 2,
    members: 9,
    activity: 74,
    chart: { x: 495, y: 455, scale: 0.93 },
  },
  {
    id: 172,
    atlasN: 715,
    slug: "untranslated-knowledge-observatory",
    title: {
      zh: "未翻译知识损失观测站",
      en: "Observatory for Untranslated Knowledge Loss",
    },
    qfocus: {
      zh: "仅使用英语文献的全球结论漏掉了哪些证据，并在哪些地点系统性地改变了行动建议？",
      en: "What evidence disappears from global conclusions when only English literature is used, and where does that systematically change recommended action?",
    },
    domain: "交叉",
    cluster: { code: "C19", zh: "计算社会科学·数字人文", en: "Computational social science · digital humanities" },
    scores: [3, 4, 4, 4, 4, 4, 3, 3, 5],
    citation: {
      url: "https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.2000933",
      title: "Languages Are Still a Major Barrier to Global Science",
      venue: "PLOS Biology",
      year: 2016,
    },
    brief: {
      zh: "建立多语种检索、人工校验与结论敏感性分析，量化英语过滤造成的地理、物种和政策证据缺口。",
      en: "Combine multilingual retrieval, human verification, and conclusion-sensitivity analysis to quantify geographic, species, and policy evidence gaps caused by English-only filtering.",
    },
    literature: [
      {
        title: "Growth of non-English-language literature on biodiversity conservation",
        venue: "Conservation Biology",
        year: 2022,
        url: "https://conbio.onlinelibrary.wiley.com/doi/10.1111/cobi.13883",
      },
      {
        title: "Language barriers in conservation: consequences and solutions",
        venue: "Trends in Ecology & Evolution",
        year: 2024,
        url: "https://www.sciencedirect.com/science/article/pii/S0169534724002763",
      },
    ],
    depth: {
      overview: {
        zh: "英语主导的数据库和综述会漏掉大量本地语言研究，尤其是生物多样性、公共卫生与地方政策证据。观测站先建立跨脚本术语和本地数据库索引，再由母语专家验证相关性，最后重算纳入与排除非英语证据时的效应、覆盖地图与政策结论。",
        en: "English-dominant databases and reviews omit substantial local-language research, especially in biodiversity, public health, and local policy. An observatory would build cross-script terminology and local-database indexes, use native-language experts to verify relevance, then recompute effects, coverage maps, and policy conclusions with and without non-English evidence.",
      },
      whyMatters: {
        zh: "知识缺失并非均匀噪声：它会让研究资源少的地区在全球模型中再次不可见，也可能把只在少数英语国家成立的干预错误外推。",
        en: "Missing knowledge is not uniform noise. It makes under-resourced regions disappear again from global models and can wrongly generalize interventions that only work in a few English-speaking countries.",
      },
      ifAnswered: {
        zh: "可量化的语言缺失率与结论翻转率可成为系统综述、国际评估和研究资助的标准质量指标。",
        en: "Quantified language-missingness and conclusion-reversal rates could become standard quality metrics for systematic reviews, international assessments, and research funding.",
      },
      approaches: [
        {
          zh: "联合母语研究者建立跨语言同义词、地方期刊与灰色文献的可审计检索协议",
          en: "Co-design auditable retrieval protocols for cross-language synonyms, local journals, and gray literature with native-language researchers",
        },
        {
          zh: "在配对主题中随机比较英语检索与多语检索，测量新增证据的地点、质量和效应方向",
          en: "Randomly compare English-only and multilingual retrieval on paired topics, measuring location, quality, and effect direction of added evidence",
        },
        {
          zh: "对元分析和政策地图做删补敏感性分析，标注非英语研究导致的结论翻转",
          en: "Run deletion-addition sensitivity analyses on meta-analyses and policy maps, flagging conclusions reversed by non-English studies",
        },
      ],
      barrier: {
        zh: "地方数据库覆盖与元数据质量不一，机器翻译会误解专业和文化术语；若母语校验资源不足，系统可能用新的自动化偏差替代英语偏差。",
        en: "Local databases vary in coverage and metadata quality, and machine translation can distort technical and cultural terms. Without enough native-language validation, the system may replace English bias with a new automation bias.",
      },
      subQuestions: [
        {
          zh: "在预注册的保护生物学主题中，多语检索能否把低收入地区的可用研究覆盖提高至少 50%？",
          en: "On preregistered conservation topics, can multilingual retrieval increase usable study coverage from low-income regions by at least 50%?",
        },
        {
          zh: "纳入非英语证据后，至少 10% 的主题是否会出现效应方向或政策优先级翻转？",
          en: "After adding non-English evidence, do at least 10% of topics reverse effect direction or policy priority?",
        },
        {
          zh: "机器抽取经母语专家盲审的关键结果错误率，能否在所有目标语言中低于 5%？",
          en: "Can the error rate of machine-extracted key results, blindly reviewed by native-language experts, stay below 5% in every target language?",
        },
      ],
    },
    stage: 1,
    members: 7,
    activity: 62,
    chart: { x: 735, y: 375, scale: 0.78 },
  },
  {
    id: 173,
    atlasN: 1172,
    slug: "collective-alignment-democratic-ai-governance",
    title: {
      zh: "集体对齐与民主化 AI 治理",
      en: "Collective Alignment and Democratic AI Governance",
    },
    qfocus: {
      zh: "多元公众的审议意见，能否被可追踪地编译为模型规则，而不被多数、平台或整理者劫持？",
      en: "Can deliberated public input be traceably compiled into model rules without capture by a majority, platform, or synthesizer?",
    },
    domain: "交叉",
    cluster: { code: "C22", zh: "集体智能·知识基础设施", en: "Collective intelligence · knowledge infrastructure" },
    scores: [4, 4, 3, 5, 5, 4, 3, 3, 3],
    citation: {
      url: "https://dl.acm.org/doi/10.1145/3630106.3658979",
      title: "Collective Constitutional AI: Aligning a Language Model with Public Input",
      venue: "ACM FAccT 2024",
      year: 2024,
    },
    brief: {
      zh: "把分层抽样、知情审议与意见聚合接到模型宪法和奖励规则上，并保留每条行为变化到公众输入的出处链。",
      en: "Connect stratified sampling, informed deliberation, and preference aggregation to model constitutions and reward rules, preserving provenance from each behavior change back to public input.",
    },
    literature: [
      {
        title: "Democratic inputs to AI grant program: lessons learned and implementation plans",
        venue: "OpenAI",
        year: 2024,
        url: "https://openai.com/index/democratic-inputs-to-ai-grant-program-update/",
      },
      {
        title: "openai/democratic-inputs — code and reports from the 10 funded teams",
        venue: "GitHub",
        year: 2024,
        url: "https://github.com/openai/democratic-inputs",
      },
    ],
    depth: {
      overview: {
        zh: "集体对齐把价值选择从少数开发者的隐含决定转化为可审计的公共过程：招募有代表性的参与者，在充分信息与相互讨论后收集具体规则，再将冲突意见编译成模型宪法或奖励信号。Collective Constitutional AI 已展示约千人输入如何改变模型行为，下一步是验证代表性、编译忠实度与跨群体后果。",
        en: "Collective alignment turns value choices from implicit developer decisions into an auditable public process. Representative participants deliberate with adequate information, formulate concrete rules, and conflicting views are compiled into a model constitution or reward signal. Collective Constitutional AI showed how input from roughly a thousand people can change behavior; the next step is validating representation, compilation fidelity, and effects across groups.",
      },
      whyMatters: {
        zh: "通用模型的拒答、公平与风险取舍会影响不同社会，但当前政策常缺少可见的授权链；民主输入可让价值冲突显性化，而不是伪装成技术最优解。",
        en: "General-purpose model choices about refusal, fairness, and risk affect diverse societies, yet policies often lack a visible chain of authorization. Democratic input can expose value conflict instead of disguising it as a technical optimum.",
      },
      ifAnswered: {
        zh: "若公共输入可重复地产生忠实、稳定且少数群体不受系统性伤害的行为变化，模型更新可形成类似公开立法与影响评估的治理周期。",
        en: "If public input reproducibly yields faithful, stable behavior changes without systematic harm to minorities, model updates could follow a governance cycle resembling public rulemaking and impact assessment.",
      },
      approaches: [
        {
          zh: "分层抽样参与者并随机分配信息材料和审议形式，测量意见变化与知识增益",
          en: "Stratify participant samples and randomize briefing materials and deliberation formats, measuring opinion change and knowledge gain",
        },
        {
          zh: "把原始意见、聚类、冲突解决和宪法条款做成带版本的公开出处图",
          en: "Publish a versioned provenance graph linking raw input, clustering, conflict resolution, and constitutional clauses",
        },
        {
          zh: "在盲测情境中比较公众宪法、开发者宪法与无宪法模型对各群体的行为后果",
          en: "Compare public, developer, and no-constitution models on blinded scenarios and behavioral outcomes for each group",
        },
      ],
      barrier: {
        zh: "自愿参与者不等于受影响公众，偏好之间可能不可兼容；整理者可在摘要阶段重写授权，而模型行为也可能只表面服从条款并在分布外失效。",
        en: "Volunteers are not the same as affected publics, and preferences may be incompatible. Synthesizers can rewrite authorization during summarization, while models may comply superficially and fail out of distribution.",
      },
      subQuestions: [
        {
          zh: "独立审计者能否从最终宪法条款回溯到至少 95% 的支撑或反对公众输入？",
          en: "Can independent auditors trace at least 95% of final constitutional clauses back to supporting or opposing public input?",
        },
        {
          zh: "与人口基准相比，参与者构成经加权后是否仍有任一关键群体的有效样本误差超过 10 个百分点？",
          en: "After weighting against population benchmarks, does any key group retain an effective sampling error above ten percentage points?",
        },
        {
          zh: "在未见过的冲突场景中，公众宪法能否改善总体偏好满足度且不让任何预注册少数群体下降超过 5%？",
          en: "On unseen conflict scenarios, does the public constitution improve aggregate preference satisfaction without reducing any preregistered minority group's score by more than 5%?",
        },
      ],
    },
    stage: 1,
    members: 8,
    activity: 67,
    chart: { x: 965, y: 455, scale: 0.9 },
  },
  {
    id: 174,
    atlasN: 1365,
    slug: "organoid-provenance-dynamic-consent",
    title: {
      zh: "类器官出处与动态同意基础设施",
      en: "Organoid Provenance and Dynamic-Consent Infrastructure",
    },
    qfocus: {
      zh: "从捐赠细胞到跨实验室和湿件云，类器官的同意限制能否随材料一起执行、撤回并被审计？",
      en: "From donor cell to cross-lab and wetware cloud use, can organoid consent restrictions travel with the material, be enforced, revoked, and audited?",
    },
    domain: "生命",
    cluster: { code: "C02", zh: "生物计算·类器官智能", en: "Biocomputing · organoid intelligence" },
    scores: [3, 4, 4, 4, 4, 4, 2, 4, 5],
    citation: {
      url: "https://onlinelibrary.wiley.com/doi/full/10.1111/bioe.13047",
      title: "Organoid biobanking, autonomy and the limits of consent",
      venue: "Bioethics (Wiley)",
      year: 2022,
    },
    brief: {
      zh: "为每个类器官谱系绑定机器可读的同意状态、用途限制、转移记录与撤回事件，让治理从一次签字变为持续授权。",
      en: "Bind each organoid lineage to machine-readable consent state, use restrictions, transfer records, and revocation events, turning governance from one signature into continuous authorization.",
    },
    literature: [
      {
        title: "Human Brain Organoid Research and Applications: Where and How to Meet Legal Challenges?",
        venue: "PMC (peer-reviewed)",
        year: 2025,
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11882709/",
      },
      {
        title: "Ethics and Regulation of Human Brain Organoid Research: Recommendations from the Asia Pacific Neuroethics Working Group",
        venue: "Asian Bioethics Review (Springer)",
        year: 2025,
        url: "https://link.springer.com/article/10.1007/s41649-025-00398-6",
      },
    ],
    depth: {
      overview: {
        zh: "类器官会复制、分化、跨机构转移并产生新数据，传统样本同意书难以覆盖其长期谱系和新用途。动态基础设施把供体授权、伦理审批、材料派生、实验用途与数据发布编码进数字孪生和出处护照，在访问、转移与运行实验时自动核验。",
        en: "Organoids replicate, differentiate, move across institutions, and generate new data, so a conventional sample-consent form cannot govern their long lineage and novel uses. Dynamic infrastructure encodes donor authorization, ethics approval, material derivation, experimental use, and data release into a digital twin and provenance passport checked whenever access, transfer, or experiments occur.",
      },
      whyMatters: {
        zh: "脑类器官、疾病模型和类器官计算把生物样本变成持续运行的平台；若出处和同意断链，供体自治、跨境合规与结果可复现性会同时失败。",
        en: "Brain organoids, disease models, and organoid computing turn biospecimens into persistent platforms. If provenance and consent break, donor autonomy, cross-border compliance, and reproducibility fail together.",
      },
      ifAnswered: {
        zh: "可执行的同意护照可让研究者在共享材料前知道允许边界，让供体看到派生用途，并为撤回、违规与模型更新提供一致记录。",
        en: "Executable consent passports could show researchers permitted boundaries before sharing material, show donors downstream uses, and provide a consistent record for revocation, violations, and model updates.",
      },
      approaches: [
        {
          zh: "把同意选项、司法辖区限制和伦理批准编译成版本化的机器可读用途策略",
          en: "Compile consent options, jurisdictional restrictions, and ethics approvals into versioned machine-readable use policies",
        },
        {
          zh: "以不可变谱系事件记录细胞批次、派生、转移、实验和数据发布，并链接实体样本标识",
          en: "Record cell batch, derivation, transfer, experiment, and data-release events in an immutable lineage linked to physical sample identifiers",
        },
        {
          zh: "在多实验室试点中故障注入过期授权、禁止用途和撤回请求，测试访问控制是否阻断",
          en: "Fault-inject expired authorization, prohibited uses, and revocation requests in a multi-lab pilot to test whether access controls block them",
        },
      ],
      barrier: {
        zh: "已扩增或分发的活体材料无法像文件一样收回，不同法域对供体权利定义冲突；过细策略会妨碍合法研究，过粗策略又无法表达未来未知用途。",
        en: "Expanded or distributed living material cannot be recalled like a file, jurisdictions conflict on donor rights, and policies detailed enough to constrain use may obstruct legitimate research while coarse policies cannot express unknown future uses.",
      },
      subQuestions: [
        {
          zh: "在故障注入试验中，系统能否阻断全部预注册禁止用途且合法访问误拒率低于 1%？",
          en: "In fault-injection trials, does the system block every preregistered prohibited use while keeping false rejection of legitimate access below 1%?",
        },
        {
          zh: "一次撤回事件能否在 24 小时内传播到所有登记派生物，并明确标出无法物理追回的材料？",
          en: "Can a revocation propagate to every registered derivative within 24 hours while explicitly flagging material that cannot be physically recalled?",
        },
        {
          zh: "跨三种司法辖区时，同一用途策略是否会产生相互矛盾的授权结果，若有其比例能否低于 5%？",
          en: "Across three jurisdictions, does the same use policy produce conflicting authorization outcomes, and if so can their rate remain below 5%?",
        },
      ],
    },
    stage: 1,
    members: 6,
    activity: 58,
    chart: { x: 185, y: 650, scale: 0.81 },
  },
  {
    id: 175,
    atlasN: 1245,
    slug: "causal-evaluation-human-ai-decisions",
    title: {
      zh: "人机决策的因果评测",
      en: "Causal Evaluation of Human-AI Decisions",
    },
    qfocus: {
      zh: "AI 建议何时真的改善了人的决策，何时只是改变了选择者、信心或错误分布？",
      en: "When does AI advice actually improve human decisions, and when does it merely change selection, confidence, or the distribution of errors?",
    },
    domain: "生命",
    cluster: { code: "C51", zh: "因果科学·可信推断", en: "Causal science · trustworthy inference" },
    scores: [4, 5, 3, 3, 5, 4, 3, 4, 5],
    citation: {
      url: "https://academic.oup.com/jrsssa/article/186/2/167/7024674",
      title: "Experimental Evaluation of Algorithm-Assisted Human Decision-Making: Application to Pretrial Public Safety Assessment",
      venue: "JRSS-A",
      year: 2023,
    },
    brief: {
      zh: "随机化建议可见性与解释方式，并按人会不会遵循建议做主层分层，区分算法质量、采纳行为与最终决策效应。",
      en: "Randomize advice visibility and explanation, then use principal stratification by whether people would follow advice to separate algorithm quality, adoption behavior, and final decision effects.",
    },
    literature: [
      {
        title: "Does AI help humans make better decisions? A statistical evaluation framework for experimental and observational studies",
        venue: "PNAS",
        year: 2025,
        url: "https://www.pnas.org/doi/10.1073/pnas.2505106122",
      },
      {
        title: "Does AI help humans make better decisions? (preprint)",
        venue: "arXiv",
        year: 2024,
        url: "https://arxiv.org/abs/2403.12108",
      },
    ],
    depth: {
      overview: {
        zh: "只比较有无 AI 的平均准确率，会把算法预测、人的选择性采纳与资源约束混在一起。因果框架随机分配是否展示建议、置信度或解释，并用潜在采纳类型识别哪些人被帮助、被伤害或完全不受影响；同一设计可迁移到临床分诊、审前风险与科研评审。",
        en: "Comparing average accuracy with and without AI mixes algorithm prediction, selective human uptake, and resource constraints. A causal framework randomizes whether advice, confidence, or explanation is shown, then uses latent adoption types to identify who is helped, harmed, or unaffected. The same design can transfer to clinical triage, pretrial risk, and scientific review.",
      },
      whyMatters: {
        zh: "高准确率模型不保证高质量人机系统：人可能只在模型错时盲从，也可能在模型对时忽略。政策需要的是对最终行动、公平和伤害的因果证据。",
        en: "A highly accurate model does not guarantee a good human-AI system: people may defer exactly when it is wrong or ignore it when it is right. Policy needs causal evidence about final actions, fairness, and harm.",
      },
      ifAnswered: {
        zh: "可迁移的因果评测协议可在部署前预测哪些用户—任务组合应显示建议、隐藏建议或要求二次复核。",
        en: "A transferable causal-evaluation protocol could predict before deployment which user-task combinations should receive advice, have it withheld, or require a second review.",
      },
      approaches: [
        {
          zh: "随机分配无建议、建议、建议加置信度和建议加反事实解释四种界面",
          en: "Randomize among no advice, advice, advice plus confidence, and advice plus counterfactual explanation",
        },
        {
          zh: "用主层分层和部分识别估计始终采纳者、条件采纳者与拒绝者的结果界",
          en: "Use principal stratification and partial identification to estimate outcome bounds for always-takers, conditional takers, and refusers",
        },
        {
          zh: "在时间压力、专业水平和群体基率变化下复现实验，检验异质效应能否外推",
          en: "Replicate under shifts in time pressure, expertise, and group base rates to test whether heterogeneous effects generalize",
        },
      ],
      barrier: {
        zh: "潜在采纳类型不可同时观察，关键识别假设可能不成立；反馈会改变未来标签和决策者行为，使短期随机试验无法代表长期部署。",
        en: "Latent adoption types cannot be jointly observed and key identifying assumptions may fail. Feedback changes future labels and decision-maker behavior, so a short randomized trial may not represent long-run deployment.",
      },
      subQuestions: [
        {
          zh: "在预注册主要结局上，展示 AI 建议能否比无建议组降低至少 10% 的决策损失？",
          en: "On the preregistered primary outcome, does showing AI advice reduce decision loss by at least 10% relative to no advice?",
        },
        {
          zh: "任一受保护群体的伤害率是否因建议而增加超过 3 个百分点，即使总体平均值改善？",
          en: "Does advice increase harm by more than three percentage points for any protected group even if the overall mean improves?",
        },
        {
          zh: "从法律场景估计的采纳异质性模型，在临床盲测中能否保持方向正确且校准误差低于 0.1？",
          en: "Does an adoption-heterogeneity model estimated in a legal setting preserve effect direction and calibration error below 0.1 in a blinded clinical test?",
        },
      ],
    },
    stage: 2,
    members: 7,
    activity: 65,
    chart: { x: 555, y: 665, scale: 0.89 },
  },
  {
    id: 176,
    atlasN: 806,
    slug: "physical-interposer-confidential-computing",
    title: {
      zh: "机密计算的物理中间人防线",
      en: "Physical-Interposer Defenses for Confidential Computing",
    },
    qfocus: {
      zh: "当攻击者能夹在 CPU 与内存之间时，可信执行环境如何证明数据不仅被加密，而且没有被重放、替换或字典推断？",
      en: "When an attacker can sit between CPU and memory, how can a trusted execution environment prove data is not only encrypted but also protected from replay, substitution, and dictionary inference?",
    },
    domain: "物质",
    cluster: { code: "C47", zh: "后量子·隐私计算工程", en: "Post-quantum · privacy-preserving computation" },
    scores: [3, 4, 3, 3, 4, 5, 5, 4, 5],
    citation: {
      url: "https://batteringram.eu/",
      title: "Battering RAM: Low-Cost Interposer Attacks on Confidential Computing",
      venue: "Project site (KU Leuven / U. Birmingham)",
      year: 2025,
    },
    brief: {
      zh: "用低成本内存总线中间板复现攻击，并把机密计算的安全目标从“静态加密”提升到带新鲜度和完整性认证的端到端内存协议。",
      en: "Reproduce attacks with low-cost memory-bus interposers, then raise confidential computing from static encryption to an end-to-end memory protocol with authenticated integrity and freshness.",
    },
    literature: [
      {
        title: "WireTap: Breaking Server SGX via DRAM Bus Interposition",
        venue: "The Hacker News / academic disclosure",
        year: 2025,
        url: "https://thehackernews.com/2025/10/new-wiretap-attack-extracts-intel-sgx.html",
      },
      {
        title: "TEE.Fail: New Side-Channel Attack Extracts Secrets from Intel and AMD DDR5 Secure Enclaves",
        venue: "The Hacker News / academic disclosure",
        year: 2025,
        url: "https://thehackernews.com/2025/10/new-teefail-side-channel-attack.html",
      },
    ],
    depth: {
      overview: {
        zh: "Battering RAM 表明，便宜的总线中间板可观测或操纵 CPU 与 DRAM 之间的加密流量；若加密确定性、缺少完整性或新鲜度保护，攻击者可用字典、重放和替换恢复秘密或伪造状态。可信执行环境因此必须把物理总线对手纳入威胁模型，而非只防软件管理员。",
        en: "Battering RAM shows that inexpensive bus interposers can observe or manipulate encrypted traffic between CPU and DRAM. With deterministic encryption or missing integrity and freshness, attackers can recover secrets or forge state through dictionaries, replay, and substitution. Trusted execution environments must therefore include physical-bus adversaries rather than only hostile software administrators.",
      },
      whyMatters: {
        zh: "云端机密计算正承载密钥、模型权重与敏感数据；若廉价物理设备能绕过远程证明，所谓硬件信任根会在数据中心供应链和边缘设备中同时失效。",
        en: "Cloud confidential computing increasingly holds keys, model weights, and sensitive data. If cheap physical devices bypass remote attestation, the claimed hardware root of trust fails across both data-center supply chains and edge devices.",
      },
      ifAnswered: {
        zh: "经物理红队验证的认证内存协议可让远程证明覆盖运行时总线状态，并给硬件代际升级提供可比较的攻击成本下界。",
        en: "A physically red-teamed authenticated-memory protocol could extend remote attestation to runtime bus state and provide comparable lower bounds on attack cost across hardware generations.",
      },
      approaches: [
        {
          zh: "构建开源 DDR 中间板测试台，自动执行观测、重放、重排和位翻转攻击",
          en: "Build an open DDR interposer testbed that automates observation, replay, reordering, and bit-flip attacks",
        },
        {
          zh: "比较确定性加密、随机化调优、计数器树和逐行认证对泄露与性能的影响",
          en: "Compare deterministic encryption, probabilistic tweaks, counter trees, and per-line authentication for leakage and performance",
        },
        {
          zh: "把总线异常、封装传感与固件测量接入远程证明，并用绕过试验评估覆盖度",
          en: "Feed bus anomalies, package sensors, and firmware measurements into remote attestation, then evaluate coverage with bypass trials",
        },
      ],
      barrier: {
        zh: "真实内存控制器与封装细节高度专有，实验板可能低估高级攻击；完整性和新鲜度元数据会增加面积、延迟与能耗，而封装防拆仍可能被供应链对手绕过。",
        en: "Real memory controllers and packaging are highly proprietary, so lab boards may underestimate advanced attacks. Integrity and freshness metadata add area, latency, and energy, while tamper-resistant packaging may still be bypassed by supply-chain adversaries.",
      },
      subQuestions: [
        {
          zh: "在三代主流 TEE 上，低于 1000 美元的中间板能否在不触发现有证明的情况下恢复任何预注册秘密？",
          en: "Across three mainstream TEE generations, can a sub-$1,000 interposer recover any preregistered secret without triggering existing attestation?",
        },
        {
          zh: "启用认证加密与新鲜度计数后，全部重放和替换攻击是否被检出且内存开销低于 10%？",
          en: "With authenticated encryption and freshness counters enabled, are all replay and substitution attacks detected while memory overhead stays below 10%?",
        },
        {
          zh: "远程证明加入总线状态后，故障注入攻击的漏报率能否低于 1%，正常工作负载误报率低于 0.1%？",
          en: "After bus state is added to remote attestation, can fault-injection misses stay below 1% and benign-workload false alarms below 0.1%?",
        },
      ],
    },
    stage: 2,
    members: 5,
    activity: 61,
    chart: { x: 940, y: 660, scale: 0.85 },
  },
];
