import type { FrontierEntry } from './frontiers';

/**
 * Twelve islands chosen structure-first, and a test of whether that ordering
 * works.
 *
 * Every island added so far arrived the other way round: pick a strong record,
 * make it an island, then look for a structure it embodies. The cost of that
 * ordering is on file — a human reader rejected 378 of 419 candidate pairings,
 * and "the typical rejection [was] not a weak relationship but an ABSENT
 * QUANTITY". After the wave-3 doubling, 222 of 371 islands still connected to
 * nothing.
 *
 * These twelve were selected the opposite way. Each began as a wave-4 or wave-5
 * structure with no landing site, and the corpus was searched for the records
 * that actually supply that structure's quantity;
 * `WAVE_4_ISLAND_CANDIDATES` records the pairing that motivated each one.
 *
 * WHAT IS DELIBERATELY NOT DONE HERE. No mapping is authored, and no proposal
 * is written for any of them. The reason is circularity: an island authored by
 * the same hand that then cites its text as evidence for a structure proves
 * only that the hand was consistent. So the content below is written from the
 * corpus record and nothing else — its gist, its card, its literature — and
 * whether the structure connection survives is left to the same matchers that
 * run over every other island. If they do not find these, the structure-first
 * ordering did not work and should be said to have failed.
 *
 * Two editorial rules, both recorded so they can be checked rather than
 * trusted. Domain is not assigned by taste: each island takes the domain that
 * the majority of its own cluster's existing islands already carry, and two of
 * those clusters straddle domains (C31 物质×4/数理×3, C47 交叉×2/数理×1/物质×1),
 * which is noted rather than smoothed. Positions were computed, not placed by
 * eye: each sits near its cluster's centroid at the first free angle keeping it
 * at least 34px from every existing island, against a median nearest-neighbour
 * distance of 44.8px across the 176.
 *
 * `subQuestions` here are authored from each record's own stated tension. They
 * are NOT drawn from the 306-question cluster pool: 123 of the existing 564
 * sub-questions are, and among the 29 islands whose questions read least like
 * their own subject, 77% came from that pool. Reproducing that here would add
 * the defect to new content while it is still cheap to avoid.
 */

const bi = (zh: string, en: string) => ({ zh, en });

export const STRUCTURE_LED_EXPANSION: FrontierEntry[] = [
  {
    id: 177,
    atlasN: 1072,
    slug: 'universal-sample-prep-robotics',
    title: bi('通用样品制备机器人', 'Universal sample-prep robotics'),
    qfocus: bi(
      '自驱实验室的瓶颈已经从算法转到样品前处理——最脏乱、最依赖手艺的那几步，能不能被拆解成可测、可复核、可迁移的模块？',
      'The bottleneck in self-driving laboratories has moved from the algorithm to sample preparation — can the dirtiest, most craft-dependent steps be decomposed into modules that are measurable, checkable and transferable?',
    ),
    domain: '交叉',
    cluster: { code: 'C04', zh: '自驱实验室·自动化科学', en: 'Self-driving labs · automated science' },
    scores: [2, 2, 3, 2, 3, 2, 3, 2, 4],
    citation: {
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12923569/',
      title: 'The ADePT framework for assessing autonomous laboratory robotics',
      venue: 'Digital Discovery',
      year: 2026,
    },
    brief: bi(
      '把最脏乱、最依赖手艺的样品制备步骤模块化，让自动实验室真正接触现实样本。开放问题在于能否把概念做成可测、可复核、可迁移的实验对象，并明确失败条件。',
      'Modularise the messiest, most craft-dependent steps of sample preparation so that automated laboratories can touch real specimens. The open question is whether the concept can be turned into a measurable, checkable, transferable experimental object with stated failure conditions.',
    ),
    depth: {
      overview: bi(
        '自驱实验室在算法与合成回路上已经跑得很快，但真实样本要先被称量、溶解、过滤、稀释、转移——这几步至今高度依赖人手，也是整条自动化链上唯一没被标准化的环节。通用样品制备机器人要做的，是把这些「手上功夫」拆成带明确参数与验收条件的模块。',
        'Self-driving laboratories already run fast on algorithms and synthesis loops, but a real specimen must first be weighed, dissolved, filtered, diluted and transferred — steps that remain heavily manual and are the one part of the automated chain never standardised. Universal sample-prep robotics aims to decompose that handwork into modules with explicit parameters and acceptance conditions.',
      ),
      whyMatters: bi(
        '只要样品前处理还需要人，自驱实验室就只能在预先纯化的试剂上表演，碰不到现实世界送来的脏样本；瓶颈的位置决定了整个自动化科学能触及什么问题。',
        'While sample prep needs a person, a self-driving laboratory can only perform on pre-purified reagents and never meets the dirty specimens the world actually sends. Where the bottleneck sits decides which problems automated science can reach at all.',
      ),
      ifAnswered: bi(
        '若这些步骤真被拆解成可迁移模块，自动实验室的适用面会从合成化学扩到环境、临床与野外样本，而「谁能做这个实验」的门槛也随之改变。',
        'If those steps really decompose into transferable modules, automated laboratories extend from synthetic chemistry into environmental, clinical and field specimens, and the question of who can run an experiment changes with it.',
      ),
      approaches: [
        bi(
          '用 ADePT 一类评估框架给自动实验室机器人定出可比的能力刻度，而不是各家各报各的演示。',
          'Use assessment frameworks such as ADePT to give laboratory robotics a comparable capability scale instead of each group reporting its own demonstration.',
        ),
        bi(
          '把单步操作参数化到可复核：质量、体积、时间、温度与允差都写下来，让同一步骤能在另一台设备上被重跑。',
          'Parameterise each single operation until it can be checked: mass, volume, time, temperature and tolerance written down, so the same step can be re-run on another instrument.',
        ),
        bi(
          '把失败条件与残余方差一并报告——标准化是否成功，看的是解释不掉的差异有没有下降，而不是流程有没有跑通。',
          'Report failure conditions and residual variance alongside: whether standardisation worked is judged by whether unexplained variation fell, not by whether the workflow completed.',
        ),
      ],
      barrier: bi(
        '最难的部分恰恰是最说不清的部分：有经验的人靠手感判断「溶解够了没有」「滤饼是不是堵了」，这些判断既没有被写下来，也不清楚是否原则上可分解——强行拆解可能损失质量而非提高一致性。',
        'The hardest part is the least articulable: an experienced hand judges by feel whether something has dissolved enough or whether a filter cake has blocked, and those judgements are neither written down nor known to be decomposable in principle — forcing them apart may cost quality rather than buy consistency.',
      ),
      subQuestions: [
        bi(
          '有没有一个可测的量能区分「这一步的手艺已被拆解」与「这一步只是被换成了另一种手艺」？',
          'Is there a measurable quantity that separates a step whose craft has been decomposed from one where the craft has merely been relocated?',
        ),
        bi(
          '当同一份样品在两台设备上给出不同结果，差异该归给样品、设备、还是那段没有被写下来的操作？',
          'When one specimen gives different results on two instruments, does the difference belong to the specimen, the instrument, or the part of the procedure nobody wrote down?',
        ),
        bi(
          '样品制备的哪些步骤是原则上不可分解的，我们能否在投入自动化之前就把它们识别出来？',
          'Which sample-prep steps are undecomposable in principle, and can they be identified before automation is invested in them?',
        ),
      ],
    },
    stage: 1,
    members: 4,
    activity: 38,
    chart: { x: 832, y: 691, scale: 0.84 },
  },
  {
    id: 178,
    atlasN: 130,
    slug: 'bio-inspired-molecular-self-assembly',
    title: bi('仿生分子自组装', 'Bio-inspired molecular self-assembly'),
    qfocus: bi(
      '「自发组装」与「精确可控」能否兼得——还是说动力学陷阱与多态性注定让产物偏离设计？',
      'Can spontaneous assembly and precise control be had together, or do kinetic traps and polymorphism condemn the product to drift from the design?',
    ),
    domain: '物质',
    cluster: { code: 'C08', zh: '分子机器·DNA信息技术', en: 'Molecular machines · DNA information technology' },
    scores: [3, 3, 4, 2, 2, 3, 3, 3, 4],
    citation: {
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12720980/',
      title: 'Molecular-Level Design Principles and Strategies of Peptide Self-Assembly Nanomaterials',
      venue: 'International Journal of Nanomedicine',
      year: 2025,
    },
    brief: bi(
      '借鉴脂质、蛋白、肽的自组装原理，让人工分子在适当条件下自发聚集成有序、具特定功能的纳米结构，靠热力学与动力学而非外力构建，是自下而上纳米制造的核心路径。',
      'Borrowing from how lipids, proteins and peptides assemble themselves, let synthetic molecules aggregate under the right conditions into ordered, functional nanostructures built by thermodynamics and kinetics rather than by an external tool — the core route to bottom-up nanofabrication.',
    ),
    depth: {
      overview: bi(
        '仿生分子自组装研究如何只给出局部结合规则与一个要被降低的能量，就让有序结构自己出现。它处在化学、材料学与物理学的交叉上，绕开了自上而下加工的昂贵设备，代价是把控制权交给了体系本身。',
        'Bio-inspired self-assembly studies how order appears on its own once only local binding rules and an energy to be lowered are supplied. It sits across chemistry, materials science and physics, sidestepping the expensive equipment of top-down fabrication at the price of handing control to the system itself.',
      ),
      whyMatters: bi(
        '它是规避昂贵自上而下加工的诱人捷径，但「自发」也意味着难精确控制——如何兼得自发与可控，是这个领域长期的核心张力。',
        'It is a tempting shortcut around costly top-down processing, but spontaneous also means hard to control precisely, and holding both is the field\'s long-standing central tension.',
      ),
      ifAnswered: bi(
        '若自发与可控能同时成立，纳米制造将从「刻出来」转为「长出来」，而设计的对象也从结构本身变成产生结构的规则。',
        'If spontaneity and control can hold together, nanofabrication turns from carving to growing, and what gets designed shifts from the structure to the rules that produce it.',
      ),
      approaches: [
        bi(
          '从肽与蛋白的自组装原理反推设计规则，把序列与最终形貌之间的关系做成可预测的映射。',
          'Work back from how peptides and proteins assemble to design rules, turning the relation between sequence and final morphology into a predictable mapping.',
        ),
        bi(
          '刻画能量地形上的多个极小，把动力学陷阱当作可被测量与规避的对象，而不是失败的托词。',
          'Characterise the multiple minima on the energy landscape, treating kinetic traps as something to be measured and routed around rather than as an excuse for failure.',
        ),
        bi(
          '把组装产率与缺陷谱作为一等报告量，区分「原理上可达」与「实际会到达」。',
          'Report assembly yield and defect spectra as first-class quantities, separating what is reachable in principle from what is actually reached.',
        ),
      ],
      barrier: bi(
        '缺陷、多态性与动力学陷阱常使产物偏离设计，而这些偏离往往在合成完成之后才显现；能量地形上存在多个极小时，「设计对了」与「组装成了」不是同一件事。',
        'Defects, polymorphism and kinetic trapping routinely pull the product away from the design, and usually only show up after synthesis; where the landscape has several minima, designing correctly and assembling correctly are not the same event.',
      ),
      subQuestions: [
        bi(
          '给定一组局部结合规则，能否在合成之前判断它的能量地形有几个极小？',
          'Given a set of local binding rules, can the number of minima on its energy landscape be judged before synthesis?',
        ),
        bi(
          '组装产率与缺陷谱之间是否存在可预测的关系，还是每种体系都要重新标定？',
          'Is there a predictable relation between assembly yield and defect spectrum, or must every system be calibrated afresh?',
        ),
        bi(
          '「自发」到什么程度仍算自组装——需要多少外部条件调控才让这个词失去意义？',
          'How spontaneous must it remain to still count as self-assembly — how much external conditioning before the word stops meaning anything?',
        ),
      ],
    },
    stage: 1,
    members: 5,
    activity: 44,
    chart: { x: 1161, y: 391, scale: 0.78 },
  },
  {
    id: 179,
    atlasN: 12,
    slug: 'quorum-sensing-engineering',
    title: bi('群体感应工程', 'Quorum-sensing engineering'),
    qfocus: bi(
      '把「破坏细菌通讯」当作不直接杀菌的抗感染策略，能否在体内可靠成立——还是冗余的群体感应网络总能绕过单点干预？',
      'Can disrupting bacterial communication work as an anti-infective strategy that never kills directly, or does a redundant quorum-sensing network always route around a single-point intervention?',
    ),
    domain: '生命',
    cluster: { code: 'C01', zh: '合成生物·工程生命', en: 'Synthetic biology · engineered life' },
    scores: [2, 3, 3, 2, 2, 3, 2, 2, 4],
    citation: {
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11104945/',
      title: 'Quorum sensing for population-level control of bacteria and potential therapeutic applications',
      venue: 'Cell Chemical Biology',
      year: 2024,
    },
    brief: bi(
      '工程化改写细菌赖以协调群体的群体感应系统（如 LuxI/LuxR 与 AHL 信号），或用淬灭酶阻断通讯，从而调控生物膜形成、毒力表达与同步裂解。',
      'Rewrite the quorum-sensing systems bacteria use to coordinate — LuxI/LuxR and AHL signalling among them — or block the conversation with quenching enzymes, and thereby steer biofilm formation, virulence expression and synchronised lysis.',
    ),
    depth: {
      overview: bi(
        '细菌不判断群体有多大，只读取环境里同类信号的浓度；浓度越过阈值时集体行为整齐启动。群体感应工程改写这套信号与受体，把一个本来由群体自己掌握的开关交到工程师手里。',
        'Bacteria do not judge how large the group is; each reads the concentration of a shared signal, and collective behaviour switches on together once it crosses a threshold. Quorum-sensing engineering rewrites those signals and receptors, handing a switch the population held to an engineer.',
      ),
      whyMatters: bi(
        '不直接杀菌意味着理论上更低的耐药选择压——这是把抗感染从「杀死」重新设想为「让它们不再协同」的一条路。',
        'Not killing directly means, in theory, less selective pressure for resistance — a route that reimagines anti-infectives from killing to keeping them from coordinating.',
      ),
      ifAnswered: bi(
        '若体内可靠成立，生物膜相关感染与毒力表达将获得一类不依赖抗生素的调控手段，而菌群控制也会从「清除」转向「调频」。',
        'If it holds reliably in vivo, biofilm-associated infection and virulence gain a class of control that does not depend on antibiotics, and microbiome management shifts from clearing to tuning.',
      ),
      approaches: [
        bi(
          '改写 LuxI/LuxR 一类信号—受体对，让群体行为在设计的浓度上启动而不是在天然阈值上。',
          'Rewrite signal-receptor pairs such as LuxI/LuxR so that collective behaviour switches at a designed concentration rather than the natural threshold.',
        ),
        bi(
          '用内酯酶等淬灭酶降解环境中的信号分子，从外部把浓度压到阈值以下。',
          'Degrade the environmental signal with quenching enzymes such as lactonases, pushing the concentration below threshold from outside.',
        ),
        bi(
          '把同步裂解一类群体级回路做成可编程的输出，让工程菌在到达设定密度时集体执行一次动作。',
          'Build population-level circuits such as synchronised lysis into programmable outputs, so an engineered strain performs one action together on reaching a set density.',
        ),
      ],
      barrier: bi(
        '群体感应网络高度冗余且物种特异，单点干预常被旁路补偿；把体外演示做成体内可靠疗法的转化率历来偏低，而信号在真实环境中还会被稀释、降解或伪造。',
        'Quorum-sensing networks are highly redundant and species-specific, so single-point interventions are routinely compensated by a bypass; the conversion rate from in-vitro demonstration to reliable in-vivo therapy has been persistently low, and in a real environment the signal is also diluted, degraded or forged.',
      ),
      subQuestions: [
        bi(
          '在一个冗余的通讯网络里，要同时压住几条通路才算真正阻断，而这个数字能否事先算出来？',
          'In a redundant communication network, how many pathways must be suppressed at once to count as blocked, and can that number be computed in advance?',
        ),
        bi(
          '当信号可被其它物种伪造或搭便车时，「群体密度」与「信号浓度」之间的对应还剩多少？',
          'When the signal can be forged or free-ridden by other species, how much correspondence remains between population density and signal concentration?',
        ),
        bi(
          '不直接杀菌是否真的带来更低的耐药选择压，还是把选择压转移到了对信号系统的抗性上？',
          'Does not killing really lower selective pressure for resistance, or does it move the pressure onto resistance against the signalling system itself?',
        ),
      ],
    },
    stage: 1,
    members: 5,
    activity: 41,
    chart: { x: 673, y: 360, scale: 0.90 },
  },
  {
    id: 180,
    atlasN: 168,
    slug: 'crowd-n-of-1-self-experimentation',
    title: bi('群体自我量化与 N-of-1 实验', 'Crowd self-quantification and N-of-1 trials'),
    qfocus: bi(
      '把临床试验的严谨性下放到个人，再把成千上万个 N-of-1 结果汇成群体证据——聚合一堆有偏的自我实验，能否洗出可靠的人群级结论？',
      'Push the rigour of a clinical trial down to the individual, then aggregate thousands of N-of-1 results into population evidence — can pooling many biased self-experiments wash out into a reliable population conclusion?',
    ),
    domain: '生命',
    cluster: { code: 'C10', zh: '分布式生物传感·诊断', en: 'Distributed biosensing · diagnostics' },
    scores: [3, 2, 3, 5, 3, 4, 2, 2, 4],
    citation: {
      url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10565195/',
      title: 'The use of N-of-1 trials to generate real-world evidence for optimal treatment of individuals and populations',
      venue: 'British Journal of Clinical Pharmacology',
      year: 2023,
    },
    brief: bi(
      '让个体对自己做严谨的单受试者交叉实验（随机化、洗脱期、盲法），再把成千上万个 N-of-1 结果汇成群体证据，把临床试验的严谨性下放到个人。',
      'Have individuals run rigorous single-subject crossover trials on themselves — randomised, with washout and blinding — then aggregate thousands of those N-of-1 results into population evidence, pushing the rigour of a clinical trial down to one person.',
    ),
    depth: {
      overview: bi(
        '以单个个体作自己的对照，反复施加与撤除干预，用同一个体的前后差异替代群体间比较：个体差异被设计消掉，而不是被统计平均掉。再把大量这样的结果汇总，个人答案与人群知识第一次可以同时产生。',
        'Use one individual as their own control, applying and withdrawing the intervention repeatedly so a within-individual difference replaces a between-group comparison: individual variation is designed away rather than averaged away. Aggregate many such results, and a personal answer and population knowledge become available at once.',
      ),
      whyMatters: bi(
        '在个体异质性大、群体平均效应误导的场景——饮食、补剂、生活方式——它给出的是「对我有效吗」这个真正被问的问题的答案。',
        'Where individual heterogeneity is large and the group average misleads — diet, supplements, lifestyle — it answers the question actually being asked, which is whether this works for me.',
      ),
      ifAnswered: bi(
        '若聚合方法站得住，参与式临床研究会成为一条与传统试验并行的证据通道，而受试者与研究者的分界也随之松动。',
        'If the aggregation holds up, participatory clinical research becomes an evidence channel parallel to the conventional trial, and the line between subject and investigator loosens with it.',
      ),
      approaches: [
        bi(
          '把随机化、洗脱期与盲法做进个人可执行的协议，让单受试者交叉设计不依赖机构就能被正确执行。',
          'Build randomisation, washout and blinding into a protocol one person can run, so a single-subject crossover design is executed correctly without an institution.',
        ),
        bi(
          '用分层模型把大量 N-of-1 结果汇成人群估计，同时保留每个个体自己的效应量。',
          'Pool many N-of-1 results into a population estimate with hierarchical models while keeping each individual\'s own effect size intact.',
        ),
        bi(
          '预注册个人层面的分析计划，使自我实验里的事后自由度不可用。',
          'Preregister the analysis plan at the individual level so the post-hoc degrees of freedom in a self-experiment cannot be spent.',
        ),
      ],
      barrier: bi(
        '自我实验缺乏盲法和对照时极易被安慰剂与确认偏误污染，而残留效应会让「同一个体」不再是同一个对照；把一堆有偏的 N-of-1 汇起来，未必能洗出可靠的群体结论。',
        'Without blinding and control a self-experiment is readily contaminated by placebo and confirmation bias, and carry-over stops the same individual from being the same control; pooling many biased N-of-1 results need not wash out into a reliable population conclusion.',
      ),
      subQuestions: [
        bi(
          '洗脱期要多长才算够——有没有一个能从数据本身估出来、而不是先验假定的判据？',
          'How long must a washout be to suffice — is there a criterion estimable from the data itself rather than assumed in advance?',
        ),
        bi(
          '当参与者自选加入且自选报告，聚合估计里有多少是效应、多少是选择？',
          'When participants self-select into the study and self-select what to report, how much of the pooled estimate is effect and how much is selection?',
        ),
        bi(
          '一个体量足够大的 N-of-1 汇总，能否在同一问题上与一次随机对照试验相互校验？',
          'Can a sufficiently large N-of-1 aggregation be cross-checked against a randomised controlled trial on the same question?',
        ),
      ],
    },
    stage: 1,
    members: 6,
    activity: 47,
    chart: { x: 635, y: 334, scale: 0.90 },
  },
  {
    id: 181,
    atlasN: 238,
    slug: 'resilience-science-critical-transition',
    title: bi('韧性科学与临界预警', 'Resilience science and critical-transition early warning'),
    qfocus: bi(
      '临界慢化是少数有理论基础又可实测的预警信号，但它常在崩溃前夕才显现——留给应对的时间窗，够不够构成「预警」？',
      'Critical slowing down is one of the few early-warning signals with both a theoretical basis and a measurable form, yet it often appears only on the eve of collapse — is the window it leaves long enough to count as warning at all?',
    ),
    domain: '数理',
    cluster: { code: 'C14', zh: '复杂系统·多智能体', en: 'Complex systems · multi-agent' },
    scores: [4, 5, 4, 3, 4, 4, 3, 3, 4],
    citation: {
      url: 'https://esd.copernicus.org/articles/15/1117/2024/',
      title: 'Tipping point detection and early warnings in climate, ecological, and human systems',
      venue: 'Earth System Dynamics',
      year: 2024,
    },
    brief: bi(
      '韧性科学研究复杂系统在崩溃前的普适预警信号，如「临界慢化」——系统从扰动中恢复变慢、方差和自相关上升，预示逼近临界点。它寻找跨领域通用的崩溃前兆。',
      'Resilience science looks for universal precursors of collapse in complex systems, chief among them critical slowing down — recovery from perturbation gets slower while variance and autocorrelation rise, signalling an approaching tipping point. It searches for a warning that works across fields.',
    ),
    depth: {
      overview: bi(
        '逼近临界转变时，系统受扰后的恢复变慢，于是方差与一阶自相关在崩溃之前就升高。这个前兆与崩溃的具体机制无关，只与恢复速率趋零有关——这正是它能横跨生态、气候、生理与金融的原因。',
        'Approaching a critical transition, recovery from perturbation slows, so variance and lag-1 autocorrelation rise before the transition itself. The precursor depends on the recovery rate going to zero rather than on what the collapse is made of, which is exactly why it travels across ecology, climate, physiology and finance.',
      ),
      whyMatters: bi(
        '它是极少数既有理论推导、又能在真实时序上直接计算的崩溃前兆，把「韧性」从事后叙事变成可监测的量。',
        'It is one of very few precursors of collapse that is both theoretically derived and directly computable on real time series, turning resilience from an after-the-fact narrative into something monitorable.',
      ),
      ifAnswered: bi(
        '若预警时间窗能被可靠拉长，生态与金融的干预将第一次有机会发生在临界点之前，而不是在事后被追认。',
        'If the warning window can be reliably lengthened, intervention in ecology and finance gets its first chance to happen before the tipping point rather than be acknowledged after it.',
      ),
      approaches: [
        bi(
          '在气候、生态与人类系统的真实时序上系统评测预警信号的检出率与假警率，而不是只报成功案例。',
          'Systematically evaluate detection and false-alarm rates for early-warning signals on real climate, ecological and human time series, rather than reporting only the successes.',
        ),
        bi(
          '用多变量韧性指标替代单一自相关，检验它们是否比单指标更早、更稳地给出信号。',
          'Replace a single autocorrelation with multivariate resilience indicators and test whether they signal earlier and more stably than one index.',
        ),
        bi(
          '把预警从「是否会翻越」推进到「何时翻越」的定量预报，并说明所需的数据条件。',
          'Push the warning from whether a transition will occur to a quantitative forecast of when, and state the data conditions that requires.',
        ),
      ],
      barrier: bi(
        '实战短板很现实：预警信号常在崩溃前夕才显现，留给应对的时间窗太短；而且并非所有崩溃都有慢化前兆——速率诱导与噪声诱导的突变式崩溃毫无预警。',
        'The practical shortfall is concrete: the signal often appears only on the eve of collapse, leaving too little time to act, and not every collapse has a slowing precursor — rate-induced and noise-induced transitions arrive with none.',
      ),
      subQuestions: [
        bi(
          '在一段噪声很大的真实时序上，能否事先判断这套信号在这里适不适用，而不是事后才知道？',
          'On a genuinely noisy real series, can it be judged in advance whether these signals apply here, rather than only in hindsight?',
        ),
        bi(
          '预警时间窗由什么决定——是系统本身的时标，还是我们采样与去噪的方式？',
          'What sets the length of the warning window — the system\'s own timescale, or how we sample and denoise it?',
        ),
        bi(
          '一个没有慢化前兆的崩溃，能否被它「没有前兆」这一事实本身反过来识别？',
          'Can a collapse with no slowing precursor be identified by the very fact that it has none?',
        ),
      ],
    },
    stage: 1,
    members: 6,
    activity: 52,
    chart: { x: 484, y: 228, scale: 0.82 },
  },
  {
    id: 182,
    atlasN: 826,
    slug: 'realtime-critical-slowing-down-remote-sensing',
    title: bi('生态系统临界点的实时临界减速预警', 'Real-time critical-slowing-down warning for ecosystem tipping points'),
    qfocus: bi(
      '临界减速已能在卫星时序上逐像元算出来，但 Turing 失稳会给出相似信号、缺失值又系统性高估韧性——这套读数在真实带噪数据上还剩多少可证伪性？',
      'Critical slowing down can now be computed per pixel on satellite time series, yet Turing instability produces a similar signal and missing data systematically overstates resilience — how much falsifiability does the reading retain on real noisy data?',
    ),
    domain: '数理',
    cluster: { code: 'C49', zh: '计算可持续·韧性科学', en: 'Computational sustainability · resilience science' },
    scores: [3, 3, 3, 2, 3, 3, 2, 3, 3],
    citation: {
      url: 'https://www.nature.com/articles/s41558-025-02328-8',
      title: 'Ambiguity of early warning signals for climate tipping points',
      venue: 'Nature Climate Change',
      year: 2025,
    },
    brief: bi(
      '用临界减速（自相关与方差上升）等通用早期预警信号，在全球遥感时序上连续度量生态系统逼近临界转变的程度，把韧性从事后诊断变成可监测的前瞻量。',
      'Use generic early-warning signals — rising autocorrelation and variance — to measure continuously, on global remote-sensing series, how close an ecosystem is to a critical transition, turning resilience from an after-the-fact diagnosis into a forward-looking measurable.',
    ),
    depth: {
      overview: bi(
        '一片森林在崩成草原之前会先「反应变慢」——扰动后恢复得越来越吃力。把这种临界减速放到全球卫星时序上连续测量，韧性第一次成了能被远程看见的量：不再需要到现场，也不必等到转变发生。',
        'A forest slows down before it collapses into grassland — recovering from disturbance with more and more difficulty. Measured continuously on global satellite series, that slowing makes resilience remotely visible for the first time: no field visit, and no waiting for the transition.',
      ),
      whyMatters: bi(
        '它把行星尺度的韧性监测从理论推进到可运行的仪表，而这类仪表决定了我们能否在生物圈完整性崩塌之前得到一个可操作的窗口。',
        'It moves planetary-scale resilience monitoring from theory to a running instrument, and instruments of that kind decide whether an actionable window exists before biosphere integrity fails.',
      ),
      ifAnswered: bi(
        '若歧义性能被解决，临界减速会成为与行星边界仪表盘耦合的「临界点雷达」；若不能，它会成为一个持续报警却无法被证伪的指标。',
        'If the ambiguity can be resolved, critical slowing down becomes a tipping-point radar coupled to the planetary-boundaries dashboard; if not, it becomes an indicator that alarms continuously and can never be falsified.',
      ),
      approaches: [
        bi(
          '在植被光学厚度与 NDVI 一类长时序上逐像元计算自相关与方差，做成可跨生态系统比较的韧性图层。',
          'Compute autocorrelation and variance per pixel on long series such as vegetation optical depth and NDVI, producing a resilience layer comparable across ecosystems.',
        ),
        bi(
          '用空间自相关（Moran\'s I、Geary\'s c）替代单点时间自相关，检验空间指纹是否比时间指纹更稳健。',
          'Substitute spatial autocorrelation — Moran\'s I, Geary\'s c — for single-point temporal autocorrelation and test whether the spatial fingerprint is the more robust one.',
        ),
        bi(
          '正面处理歧义性：设计能把 Turing 失稳与真临界点区分开的判据，并报告缺失值与离群点对韧性估计的系统性影响。',
          'Face the ambiguity directly: design a criterion separating Turing instability from a true tipping point, and report how missing values and outliers systematically bias the resilience estimate.',
        ),
      ],
      barrier: bi(
        '最硬的难点是可证伪性危机：2025 年的对抗性工作指出预警信号本身存在歧义，Turing 失稳与真正的临界点会给出相似读数，而缺失值和离群点又系统性高估韧性——预警太早是狼来了，太晚则无意义，可操作窗口极窄。',
        'The hardest part is a falsifiability crisis: adversarial work in 2025 shows the signals are ambiguous, with Turing instability and a genuine tipping point reading alike, while missing values and outliers systematically overstate resilience — too early is crying wolf, too late is pointless, and the actionable window is narrow.',
      ),
      subQuestions: [
        bi(
          '有没有一个可在卫星数据上直接计算的量，能把 Turing 失稳与真临界点分开？',
          'Is there a quantity computable directly on satellite data that separates Turing instability from a real tipping point?',
        ),
        bi(
          '缺失值对韧性估计的偏差方向是否可预测，如果可以，能否在图层里被显式扣除？',
          'Is the direction of the bias that missing data introduces predictable, and if so can it be subtracted explicitly in the layer?',
        ),
        bi(
          '一个持续给出「接近临界」读数却从未被证伪的指标，还算不算一个科学指标？',
          'Is an indicator that continuously reads "close to critical" yet is never falsified still a scientific indicator?',
        ),
      ],
    },
    stage: 1,
    members: 4,
    activity: 40,
    chart: { x: 307, y: 415, scale: 0.85 },
  },
  {
    id: 183,
    atlasN: 383,
    slug: 'computational-complexity-limits-of-solvability',
    title: bi('计算复杂性与可解性边界', 'Computational complexity and the limits of solvability'),
    qfocus: bi(
      '理论极限界定的是最坏情况，而现实中的 NP 难问题常被启发式在实践上「解决」——这片灰色地带能否被刻画，而不只是被绕过？',
      'The theoretical limit bounds the worst case while real NP-hard problems are routinely "solved" in practice by heuristics — can that grey zone be characterised rather than merely walked around?',
    ),
    domain: '数理',
    cluster: { code: 'C23', zh: 'AI数学·形式科学', en: 'AI mathematics · formal science' },
    scores: [5, 4, 3, 2, 3, 5, 2, 4, 4],
    citation: {
      url: 'https://dl.acm.org/doi/book/10.1145/3241304',
      title: 'Hardness of Approximation Between P and NP',
      venue: 'ACM Books',
      year: 2019,
    },
    brief: bi(
      '研究哪些问题在本质上可被高效计算、哪些注定指数级困难（P/NP、近似难度、量子加速边界），用严格的下界理论划定「再快的硬件也救不了」的内在难度。',
      'Study which problems are efficiently computable in principle and which are condemned to exponential difficulty — P versus NP, hardness of approximation, the limits of quantum speed-up — using rigorous lower bounds to mark the difficulty no faster hardware can rescue.',
    ),
    depth: {
      overview: bi(
        '有些问题所需的资源存在不可跨越的下界，而这个下界是问题本身的性质，不是当前算法不够好——它对未来所有算法同时成立。复杂性理论的工作，就是把这条界证出来，并说清它管辖哪一类输入。',
        'Some problems have a floor on the resources they need, and the floor is a property of the problem rather than of today\'s algorithms — it holds against every future algorithm at once. The work of complexity theory is to prove that floor and to say which class of inputs it governs.',
      ),
      whyMatters: bi(
        '在 AI 时代它的新意义在于：为「哪些任务可被学习、可被压缩」设定信息论与复杂性的硬天花板，约束对通用智能的过度乐观。',
        'Its new significance in the age of AI is to put an information-theoretic and complexity-theoretic ceiling on which tasks can be learned or compressed at all, constraining the more optimistic claims about general intelligence.',
      ),
      ifAnswered: bi(
        '若灰色地带能被刻画，「这个问题难」将从一句结论变成一份说明书：难在哪类输入上、放宽哪一条要求可以绕开、代价是什么。',
        'If the grey zone can be characterised, "this problem is hard" turns from a verdict into a specification: hard on which inputs, escapable by relaxing which requirement, and at what price.',
      ),
      approaches: [
        bi(
          '在参数化复杂性框架下研究近似与难度的交界，把「允许近似之后还剩多难」做成可证的量。',
          'Study the boundary between approximation and hardness inside parameterised complexity, making "how hard it remains once approximation is allowed" a provable quantity.',
        ),
        bi(
          '刻画 P 与 NP 之间的近似难度层级，让「难」有分辨率而不只有二值。',
          'Characterise the hierarchy of approximation hardness between P and NP so that hard has resolution rather than only two values.',
        ),
        bi(
          '把复杂性下界接到学习与压缩上，为「可被学到」设定与硬件无关的上限。',
          'Connect complexity lower bounds to learning and compression, setting a hardware-independent ceiling on what can be learned.',
        ),
      ],
      barrier: bi(
        '它界定的是最坏情况，而现实中的 NP 难问题常被启发式和近似在实践上解决——理论极限与工程可行之间横着一片巨大的灰色地带，而这片地带至今没有与下界同样严格的刻画工具。',
        'What it bounds is the worst case, while real NP-hard problems are solved in practice by heuristics and approximation — a large grey zone lies between the theoretical limit and engineering feasibility, and that zone still lacks tools as rigorous as the bounds themselves.',
      ),
      subQuestions: [
        bi(
          '现实实例分布与最坏情况之间的差距，能否被做成一个可测量、可比较的量？',
          'Can the gap between the distribution of real instances and the worst case be made into a measurable, comparable quantity?',
        ),
        bi(
          '一个在实践上总能被启发式解决的 NP 难问题，它的「难」到底体现在哪里？',
          'For an NP-hard problem that heuristics always solve in practice, where exactly does its hardness show up?',
        ),
        bi(
          '复杂性下界能否给「哪些任务原则上不可被学习」一个可检验的判据，而不只是一个类比？',
          'Can complexity lower bounds give a testable criterion for which tasks are unlearnable in principle, rather than only an analogy?',
        ),
      ],
    },
    stage: 1,
    members: 5,
    activity: 45,
    chart: { x: 365, y: 362, scale: 0.84 },
  },
  {
    id: 184,
    atlasN: 1443,
    slug: 'randomised-research-funding-partial-lotteries',
    title: bi('科研资助的随机化：部分抽签与机制设计', 'Randomising research funding: partial lotteries and mechanism design'),
    qfocus: bi(
      '在资助线附近评审其实分不清第 20 名与第 40 名，却假装能——把这段噪声区改用抽签，是更公平，还是放弃了本来可得的择优？',
      'Near the funding line reviewers cannot actually separate the twentieth proposal from the fortieth, yet act as if they can — does drawing lots across that noise band buy fairness, or give up selection that was genuinely available?',
    ),
    domain: '交叉',
    cluster: { code: 'C28', zh: '元科学·科研治理', en: 'Metascience · research governance' },
    scores: [4, 4, 3, 2, 3, 4, 4, 3, 4],
    citation: {
      url: 'https://www.tandfonline.com/doi/full/10.1080/2330443X.2022.2086190',
      title: 'Rethinking the Funding Line at the Swiss National Science Foundation: Bayesian Ranking and Lottery',
      venue: 'Statistics and Public Policy',
      year: 2022,
    },
    brief: bi(
      '承认同行评审在资助线附近无力区分优劣，于是对达标提案改用受控随机抽签分配经费，并研究如何把贝叶斯排序与随机化最优组合。它把「谁该拿到钱」从评委判断问题变成机制设计问题。',
      'Accept that peer review cannot separate proposals near the funding line, allocate money among the qualifying ones by controlled lottery, and study how best to combine Bayesian ranking with randomisation. It turns who should be funded from a question of reviewer judgement into one of mechanism design.',
    ),
    depth: {
      overview: bi(
        '当候选之间的真实差异小于评估噪声时，排序里的名次不再携带信息。部分抽签主动在选择机制中加入随机，放弃对噪声区间内排序的假装精确——瑞士国家科学基金会自 2019 年起在评审平局时抽签，全球已有约十余家资助方采用某种形式。',
        'When the true differences between candidates are smaller than the assessment noise, position in the ranking stops carrying information. A partial lottery puts randomness into the selection mechanism on purpose, giving up the pretence of ranking inside the noise band — the Swiss National Science Foundation has drawn lots on ties since 2019, and roughly a dozen funders worldwide now use some form of it.',
      ),
      whyMatters: bi(
        '它直击一个很少被公开承认的事实：评审在资助线附近的分辨率低于它被赋予的权威，而这个落差每年在分配大量经费。',
        'It goes at a fact rarely admitted aloud: near the funding line, review has less resolution than the authority it is given, and that gap allocates a great deal of money every year.',
      ),
      ifAnswered: bi(
        '若抽签结果被公开评估并站得住，原则化部分抽签可能从边缘实验变成大额资助的标准可选项，而评审的角色会从排序退回到把关。',
        'If lottery outcomes are evaluated publicly and hold up, principled partial lotteries could move from fringe experiment to a standard option for large funding, and review would retreat from ranking back to gatekeeping.',
      ),
      approaches: [
        bi(
          '把贝叶斯排序与抽签结合，用后验不确定性划出噪声区间，只在区间内随机。',
          'Combine Bayesian ranking with the draw, using posterior uncertainty to delimit the noise band and randomising only inside it.',
        ),
        bi(
          '用真实评审数据（SNSF、NeurIPS、ICLR）设计并离线评估抽签机制，而不是在假想分布上论证。',
          'Design and evaluate lottery mechanisms offline on real review data — SNSF, NeurIPS, ICLR — rather than arguing over a hypothetical distribution.',
        ),
        bi(
          '把随机化顺带产生的对照利用起来：抽签在资助与未资助之间造出一个原本拿不到的因果比较。',
          'Exploit the comparison randomisation incidentally creates: the draw manufactures a causal contrast between funded and unfunded that was otherwise unavailable.',
        ),
      ],
      barrier: bi(
        '最硬的争议是政治合法性与验证：抽签要求资助方公开承认评审无法排序；而抽签是否真发现更多真知，需要多年、跨机构的对照才能证伪，短期几乎无法判定。',
        'The hardest disputes are legitimacy and verification: a lottery requires a funder to admit publicly that review cannot rank, and whether it actually surfaces more real knowledge takes years of cross-institutional comparison to falsify, which makes it nearly undecidable in the short run.',
      ),
      subQuestions: [
        bi(
          '噪声区间的边界该由谁、用什么证据划定——划宽一点和划窄一点分别把权力交给了谁？',
          'Who draws the edges of the noise band, on what evidence, and who gains power when it is drawn wider or narrower?',
        ),
        bi(
          '抽签造出的因果对照能回答什么问题，又不能回答什么问题？',
          'What can the causal contrast a lottery creates answer, and what can it not?',
        ),
        bi(
          '当评审信号在某些学科确实可靠时，一刀切的抽签是不是把真实可得的择优也一起放弃了？',
          'Where the review signal is genuinely reliable in some fields, does a uniform lottery give up selection that was actually available?',
        ),
      ],
    },
    stage: 1,
    members: 4,
    activity: 43,
    chart: { x: 837, y: 455, scale: 0.78 },
  },
  {
    id: 185,
    atlasN: 1021,
    slug: 'replication-prediction-markets',
    title: bi('可复现性预测市场与可信度定价', 'Replication prediction markets and credibility pricing'),
    qfocus: bi(
      '学术共同体其实「心里有数」哪些发现会塌——把这种私有直觉做成可下注、可结算的公开价格，在缺乏真金白银结算的场景里还能维持诚实吗？',
      'The research community privately knows which findings will fall over — can that intuition be made into a tradeable, settleable public price, and stay honest in a setting with no real money at stake?',
    ),
    domain: '交叉',
    cluster: { code: 'C20', zh: '去中心科学·开放科学机制', en: 'Decentralised science · open-science mechanisms' },
    scores: [3, 3, 4, 4, 3, 3, 2, 3, 4],
    citation: {
      url: 'https://doi.org/10.1098/rsos.250377',
      title: 'Using prediction markets and forecasting surveys to predict 28 replication outcomes of classic articles in social psychology and judgement and decision making',
      venue: 'Royal Society Open Science',
      year: 2025,
    },
    brief: bi(
      '用预测市场让研究者对「某结论能否被成功复现」下注，把分散在学术共同体里的私有判断聚合成一个连续的可信度价格。它不评判论文好坏，而直接给「这个发现会不会站得住」定价。',
      'Let researchers bet on whether a finding will replicate, aggregating private judgement scattered through the community into a continuous credibility price. It does not judge whether a paper is good; it prices whether the finding will hold.',
    ),
    depth: {
      overview: bi(
        '多个独立评估者的一致与分歧共同构成信号：一致收窄不确定性，分歧本身也是信息。预测市场把这个聚合做成价格，且事后可用真实复现结果校准——大规模项目显示它对直接复现结果的判准率约七成。',
        'The agreement and the disagreement among independent assessors are both signal: agreement narrows the uncertainty and the spread is information in its own right. A prediction market turns that aggregation into a price and, unusually, can be calibrated afterwards against real replication outcomes — large projects put its accuracy on direct replications at roughly seventy per cent.',
      ),
      whyMatters: bi(
        '它是同行评议之外的一层信号：不靠期刊品牌背书，而让可信度像资产一样被定价，并且可以被事后结算证明或证伪。',
        'It is a signal layer beside peer review: credibility priced like an asset rather than underwritten by a journal brand, and settled afterwards in a way that can prove or disprove it.',
      ),
      ifAnswered: bi(
        '若决策市场能在发表前给每个关键结论挂一个可复现概率，资助与媒体的放大机制就能前置过滤，「引用即可信」的旧反射会被定价信号取代。',
        'If a decision market can attach a replication probability to each key claim before publication, funding and media amplification gain a filter upstream, and the reflex that treats citation as credibility is replaced by a priced signal.',
      ),
      approaches: [
        bi(
          '用预测市场与预测调查并行预判同一批经典结论，比较两种聚合方式的判准率。',
          'Run prediction markets and forecasting surveys in parallel on the same set of classic findings and compare the accuracy of the two aggregations.',
        ),
        bi(
          '把机制前移为决策市场，在发表前对候选结论定价，而不是在复现启动后才交易。',
          'Move the mechanism upstream into a decision market that prices candidate findings before publication rather than trading after a replication is under way.',
        ),
        bi(
          '设计不依赖真金白银的诚实激励，并检验它是否真的避免了「圈内共识」的回声。',
          'Design honest incentives that do not require real money, and test whether they genuinely avoid an echo of insider consensus.',
        ),
      ],
      barrier: bi(
        '最硬的张力是规模与激励：复现实验昂贵、结算周期以年计，市场流动性极低；参与者多为小圈子专家，群体智慧可能退化为圈内共识的回声——而评估者一旦相互关联，聚合出来的窄区间就是假的精度。',
        'The hardest tension is scale against incentive: replications are expensive, settlement takes years, and liquidity is minimal; participants are largely a small circle of specialists, so wisdom of crowds can decay into an echo of insider consensus — and once assessors are correlated, the narrow aggregate interval is false precision.',
      ),
      subQuestions: [
        bi(
          '在一个小而相互认识的参与者池里，怎样度量「独立性」这个整套方法唯一的前提？',
          'In a small pool of participants who know each other, how is independence — the one premise the whole method rests on — measured?',
        ),
        bi(
          '结算周期以年计时，什么样的激励能让今天的下注是诚实的？',
          'With settlement years away, what incentive makes today\'s bet an honest one?',
        ),
        bi(
          '价格里的分歧幅度本身是不是一个比价格更有用的信号？',
          'Is the spread of disagreement inside the price a more useful signal than the price itself?',
        ),
      ],
    },
    stage: 1,
    members: 5,
    activity: 46,
    chart: { x: 773, y: 500, scale: 0.85 },
  },
  {
    id: 186,
    atlasN: 1121,
    slug: 'epistemic-traceability-ledgers',
    title: bi('认识论可追溯账本', 'Epistemic traceability ledgers'),
    qfocus: bi(
      '为数据、模型、假说、实验与结论建立可审计的来源链，能否把证据、推断与叙事真正分开——还是记录本身也会变成一种叙事？',
      'Build an auditable chain of provenance for data, models, hypotheses, experiments and conclusions — can that genuinely separate evidence from inference from narrative, or does the record become another narrative?',
    ),
    domain: '交叉',
    cluster: { code: 'C28', zh: '元科学·科研治理', en: 'Metascience · research governance' },
    scores: [3, 3, 4, 3, 4, 4, 2, 2, 4],
    citation: {
      url: 'https://www.taylorfrancis.com/chapters/oa-edit/10.4324/9781003536116-1/epistemic-governance-diverse-research-practices-knowledge-production-introduction-rebecca-lund-jill-blackmore-julie-rowlands',
      title: 'Epistemic governance of diverse research practices and knowledge production: an introduction',
      venue: 'Epistemic Injustice (Routledge)',
      year: 2024,
    },
    brief: bi(
      '为数据、模型、假说、实验和结论建立可审计的来源链，区分证据、推断和叙事。开放问题在于能否把概念做成可测、可复核、可迁移的对象，并明确失败条件。',
      'Build an auditable chain of provenance across data, models, hypotheses, experiments and conclusions, separating evidence from inference from narrative. The open question is whether the concept becomes a measurable, checkable, transferable object with stated failure conditions.',
    ),
    depth: {
      overview: bi(
        '一条从每个结论回溯到共同基准的连续链条，使不同时间、不同团队、不同方法的读数第一次可以被放在一起比较。链条的价值不在于记录多，而在于每一环都带着自己的不确定度，并且断点可以被发现。',
        'An unbroken chain from each conclusion back to a shared reference, so that readings from different times, teams and methods can be compared at all. Its value lies not in recording more but in each link carrying its own uncertainty, and in a break being findable.',
      ),
      whyMatters: bi(
        '科研可信度正越来越依赖过程级透明度而非结果本身——而没有来源链时，「证据」「推断」与「叙事」在一篇论文里读起来是同一种字体。',
        'Research credibility increasingly rests on process-level transparency rather than on the result — and with no provenance chain, evidence, inference and narrative are set in the same typeface on the page.',
      ),
      ifAnswered: bi(
        '若来源链能被普遍维护，一个结论的可信度将不再由发表它的期刊决定，而由它到基准的那条链条上每一环的状态决定。',
        'If provenance chains were commonly maintained, the credibility of a conclusion would stop being set by where it was published and start being set by the state of each link back to the reference.',
      ),
      approaches: [
        bi(
          '把数据、模型、假说与结论各自作为带标识的对象记录，使引用指向对象而非指向论文。',
          'Record data, models, hypotheses and conclusions as identified objects so that a citation points at an object rather than at a paper.',
        ),
        bi(
          '在链条的每一环上显式携带不确定度，让累积不确定度成为可沿链相加的量。',
          'Carry uncertainty explicitly at every link so that accumulated uncertainty becomes a quantity that adds along the chain.',
        ),
        bi(
          '为断链设计可检出的信号，因为断点通常在很久以后才被发现，损失是回溯性的。',
          'Design detectable signals for a broken link, because breaks are usually found long afterwards and the loss is retroactive.',
        ),
      ],
      barrier: bi(
        '维护来源链是持续成本而收益延后，所以它总是最先被省掉的那一项；更难的是叙事与推断的边界本身可争议——把一段推断标成证据，账本会忠实地把这个错误也一并传下去。',
        'Maintaining provenance is a recurring cost against a deferred benefit, so it is always the first thing dropped; harder still, the line between inference and narrative is itself contestable — label an inference as evidence and the ledger will faithfully propagate that error too.',
      ),
      subQuestions: [
        bi(
          '「证据」与「推断」的边界能否被写成一条可检验的标注规则，而不是留给记录者判断？',
          'Can the line between evidence and inference be written as a checkable annotation rule rather than left to whoever is recording?',
        ),
        bi(
          '一条链条断在何处，能否从下游读数本身被检出，而不必依赖上游主动报告？',
          'Can a break be detected from the downstream readings themselves, without relying on the upstream party to report it?',
        ),
        bi(
          '当维护成本落在个别研究者身上而收益归于整个共同体，这条链条靠什么维持？',
          'When the maintenance cost falls on individual researchers and the benefit accrues to the community, what keeps the chain alive?',
        ),
      ],
    },
    stage: 1,
    members: 3,
    activity: 34,
    chart: { x: 828, y: 528, scale: 0.81 },
  },
  {
    id: 187,
    atlasN: 1706,
    slug: 'finite-time-information-erasure-control',
    title: bi('有限时间信息擦除的最优控制', 'Optimal control of finite-time information erasure'),
    qfocus: bi(
      '固定操作时间下，协议形状、擦除错误、终态约束、欠阻尼加热与强耦合如何共同决定超出 Landauer 界的那部分额外耗散？',
      'At a fixed operation time, how do protocol shape, erasure error, final-state constraint, underdamped heating and strong coupling jointly set the excess dissipation above the Landauer bound?',
    ),
    domain: '物质',
    cluster: { code: 'C31', zh: '物理计算·热力学与涨落', en: 'Physical computing · thermodynamics and fluctuations' },
    scores: [4, 4, 5, 1, 3, 3, 3, 5, 4],
    citation: {
      url: 'https://doi.org/10.1103/PhysRevLett.125.100602',
      title: 'Finite-Time Landauer Principle',
      venue: 'Physical Review Letters',
      year: 2020,
    },
    brief: bi(
      '准静态的 Landauer 极限已被单粒子与单电子实验覆盖；这条方向只研究固定时限下超出该极限的协议成本，要求同时报告操作时间、擦除错误、初末分布与控制自由度。',
      'The quasi-static Landauer limit is already covered by single-particle and single-electron experiments; this direction studies only the cost of a protocol above that limit at a fixed time, and requires operation time, erasure error, initial and final distributions and control freedom all to be reported together.',
    ),
    depth: {
      overview: bi(
        '把一个比特擦掉至少要耗散 kT·ln2，但这条界是在无限慢的极限下取到的。真实器件有截止时间，于是问题变成：越快完成，超出下界的额外浪费有多大，而这份额外量由协议形状而非仅由时长决定。',
        'Erasing a bit dissipates at least kT·ln2, but that bound is attained only in the infinitely slow limit. Real devices have deadlines, so the question becomes how much is wasted above the floor when the operation is hurried — and that excess is set by the shape of the protocol, not by duration alone.',
      ),
      whyMatters: bi(
        '任何真实计算都在有限时间内完成，所以决定能耗的从来不是那条准静态下界本身，而是超出它的那一部分。',
        'Every real computation finishes in finite time, so what decides energy use is never the quasi-static floor itself but the part above it.',
      ),
      ifAnswered: bi(
        '若有限时间下的最优协议可以被算出并被制造，计算硬件的能耗讨论将从「离 Landauer 界还有几个数量级」转向「在给定时限下还剩多少可省」。',
        'If the finite-time optimum can be computed and built, the energy discussion for computing hardware moves from how many orders of magnitude remain to the Landauer bound, to how much is still savable at a given deadline.',
      ),
      approaches: [
        bi(
          '推导任意比特实现下的有限时间附加成本与最小耗散协议，把协议形状本身作为被优化的对象。',
          'Derive the finite-time excess cost and the minimum-dissipation protocol for an arbitrary bit realisation, treating protocol shape itself as the object being optimised.',
        ),
        bi(
          '用双稳态欠阻尼机械存储器实测快速擦除时的黏性耗散与瞬态加热，检验理论在真实器件上的适用范围。',
          'Measure viscous dissipation and transient heating during fast erasure in a bistable underdamped mechanical memory, testing where the theory applies on a real device.',
        ),
        bi(
          '把有限时间修正推进到强系统—浴耦合与非马尔可夫情形，说明弱耦合结论何时失效。',
          'Extend the finite-time correction to strong system-bath coupling and non-Markovian settings, stating when the weak-coupling result stops holding.',
        ),
      ],
      barrier: bi(
        '全控制或慢驱动下的最优界不等于可制造电路；欠阻尼实验、经典双阱与强耦合单费米模的结果也不可直接互换——每一类实现都要重新报告操作时间、擦除错误、功热全分布与热化时间，否则数字不可比。',
        'An optimum derived under full control or slow driving is not a manufacturable circuit, and results from underdamped experiments, classical double wells and a strongly coupled single Fermi mode are not interchangeable — each realisation must report operation time, erasure error, the full work and heat distributions and the thermalisation time, or the numbers cannot be compared.',
      ),
      subQuestions: [
        bi(
          '在给定时限与容错要求下，最优协议的形状是否有一个与实现无关的共同特征？',
          'At a given deadline and error tolerance, does the optimal protocol share a shape that is independent of the implementation?',
        ),
        bi(
          '强耦合与非马尔可夫修正在什么条件下会大到改变工程结论，而不只是修正一个系数？',
          'Under what conditions do strong-coupling and non-Markovian corrections grow large enough to change an engineering conclusion rather than adjust a coefficient?',
        ),
        bi(
          '擦除错误率与额外耗散之间的权衡曲线，能否被测成一条可跨器件比较的曲线？',
          'Can the trade-off between erasure error and excess dissipation be measured as a curve comparable across devices?',
        ),
      ],
    },
    stage: 1,
    members: 4,
    activity: 39,
    chart: { x: 397, y: 470, scale: 0.81 },
  },
  {
    id: 188,
    atlasN: 1218,
    slug: 'zero-knowledge-model-auditing',
    title: bi('零知识模型审计', 'Zero-knowledge model auditing'),
    qfocus: bi(
      '监管者要求审计、厂商拒绝开箱——密码学证明能不能同时满足两边，还是「可证明的属性」与「社会想要的属性」之间那道语义鸿沟根本跨不过去？',
      'Regulators demand an audit and vendors refuse to open the box — can a cryptographic proof satisfy both, or is the semantic gap between provable properties and the properties society wants simply uncrossable?',
    ),
    domain: '交叉',
    cluster: { code: 'C47', zh: '后量子·隐私计算工程', en: 'Post-quantum · privacy-computing engineering' },
    scores: [4, 5, 3, 3, 4, 3, 2, 4, 4],
    citation: {
      url: 'https://proceedings.mlr.press/v235/yadav24a.html',
      title: 'FairProof: Confidential and Certifiable Fairness for Neural Networks',
      venue: 'ICML 2024 (PMLR v235)',
      year: 2024,
    },
    brief: bi(
      '用零知识证明让模型方向监管者与用户证明「这个保密模型满足公平性、基准分数或安全属性」而不泄露权重，把 AI 审计从「信任机构」重构为「验证密码学证据」。',
      'Use zero-knowledge proofs so a vendor can prove to regulators and users that a confidential model satisfies a fairness, benchmark-score or safety property without disclosing its weights, recasting AI audit from trusting an institution to verifying cryptographic evidence.',
    ),
    depth: {
      overview: bi(
        '向对方证明「我确实执行了某件事」而不透露那件事的内容——可验证性与不公开首次不再互斥。这条路线把 zkML 的应用面从区块链转向 AI 治理：审计机构无需接触权重即可复核厂商声明。',
        'Prove that you did run a particular thing without revealing what it is — verifiability and non-disclosure stop being mutually exclusive. The route turns zkML away from blockchain and towards AI governance: an auditor can check a vendor\'s claim without ever touching the weights.',
      ),
      whyMatters: bi(
        '随着 AI 法案类监管落地，「审计即证明」可能成为闭源模型进入高风险场景的准入接口——而这决定了监管能不能在不要求开源的前提下真正生效。',
        'As AI-act style regulation lands, audit-as-proof could become the admission interface for closed models entering high-risk settings — deciding whether regulation can bite without demanding open weights.',
      ),
      ifAnswered: bi(
        '若成本与表达力问题被解决，合规将从提交文档变成提交证明，而「信任这家审计机构」会被「验证这段证明」取代。',
        'If cost and expressiveness are solved, compliance shifts from filing documents to filing proofs, and trusting an auditor is replaced by verifying one.',
      ),
      approaches: [
        bi(
          '为保密神经网络的个体公平性做零知识认证，权重与架构全程不外泄。',
          'Certify individual fairness for a confidential neural network in zero knowledge, with weights and architecture never leaving the vendor.',
        ),
        bi(
          '把基准评测跑成 zkSNARK 证明，采用「先预测后证明」策略，让固定私有权重的模型可对外证明其准确率与安全检查分数。',
          'Run benchmark evaluations as zkSNARK proofs under a predict-then-prove strategy, so a model with fixed private weights can prove its accuracy and safety-check scores externally.',
        ),
        bi(
          '扩大电路对算子的覆盖，逐步逼近真实推理流水线，而不是只覆盖能进电路的那一小部分。',
          'Widen circuit coverage of operators towards a real inference pipeline instead of only the fraction that fits into a circuit today.',
        ),
      ],
      barrier: bi(
        '硬张力在「可证明的属性」与「社会想要的属性」之间的语义鸿沟：个体公平与基准分数能进电路，而「不歧视」「不欺骗」这类法律概念如何形式化没有共识；此外 ONNX 有 120 多个算子而多数 zkML 框架只支持约 50 个，对百亿参数模型出证的成本目前仍不可行。',
        'The hard tension is a semantic gap between provable and wanted properties: individual fairness and a benchmark score fit into a circuit, while there is no consensus on formalising legal notions such as non-discrimination or non-deception; on top of that ONNX has over 120 operators and most zkML frameworks support around 50, and proving for a ten-billion-parameter model remains infeasible in cost.',
      ),
      subQuestions: [
        bi(
          '一个能进电路的公平性定义，与法律想要的那个「不歧视」，差距能否被明确写出来而不是被默认等同？',
          'Can the gap between a fairness definition that fits in a circuit and the non-discrimination the law wants be written down explicitly rather than quietly assumed away?',
        ),
        bi(
          '电路表达力的限制是会随工程进展消失的暂时约束，还是这条方法的真正边界？',
          'Is limited circuit expressiveness a temporary constraint that engineering will remove, or the real boundary of the method?',
        ),
        bi(
          '证明「模型按声称方式运行」之后，还剩哪些审计问题是密码学原则上答不了的？',
          'Once it is proved that the model ran as claimed, which audit questions remain that cryptography cannot answer in principle?',
        ),
      ],
    },
    stage: 1,
    members: 4,
    activity: 42,
    chart: { x: 915, y: 476, scale: 0.87 },
  },
];
