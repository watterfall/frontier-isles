import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the credibility family.
 *
 * The question all eight answer is one question: how does a claim become
 * believable to someone who was not there and cannot check it themselves.
 *
 * They split into two halves that are genuinely opposed, and the split is the
 * point. Five manufacture a witness — a traceability chain, a record of the
 * paths not taken, a written-down craft, a standard part, a proof that reveals
 * nothing. Three do without one: a costly signal is believed because lying
 * would cost more than telling the truth, a commitment is believed because the
 * option to defect has been destroyed, and injected randomness is believed
 * because the chooser gave up the discretion that would have needed defending.
 *
 * That opposition is filed explicitly. Verification asymmetry buys credibility
 * by producing something cheap to check; a costly signal buys the same
 * credibility by making the lie expensive to tell. They are rivals for one job,
 * and which is available decides which institution can be built — a field with
 * no portable witness gets costly signals and credentials, not audits.
 *
 * All eight already declare quantities, so these patches carry depth only, and
 * all eight carry zero mappings: like the limits family, they are structures
 * that are deep with no island.
 */

type Bilingual = { zh: string; en: string };
const bi = (zh: string, en: string): Bilingual => ({ zh, en });

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

export const CREDIBILITY_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/traceability-chain',
    depth: {
      origin: bi(
        '出自计量学：1875 年米制公约把一根实物米原器立为共同基准，此后每一把尺的可信度都来自它到那根棒子的连续链条。1960 年后基准改为可复现的物理常数，正是因为实物基准本身会漂移，而漂移使全部下游读数一起失效。',
        'From metrology: the 1875 Metre Convention made one physical bar the common reference, after which every ruler\'s credibility came from an unbroken chain back to it. The reference became a reproducible physical constant after 1960 precisely because a physical artefact drifts, and drift invalidates every downstream reading at once.',
      ),
      minimalForm: '读数 → 环节₁ → … → 环节ₙ → 共同基准；u² = Σuᵢ²',
      canonicalSubstrates: [
        sub('量值溯源', 'Metrological traceability', '计量学', 'Metrology', 0,
          '每一台仪器的校准都指向同一组基准，不同实验室的数才第一次可比',
          'every instrument\'s calibration pointing at one set of references, which is what first makes two laboratories\' numbers comparable',
          '基准换定义时链条并不自动重连：历史数据要么重新归算，要么标注为旧基准下的值——而不标注是最常见的失误。',
          'A redefined reference does not reconnect the chain by itself: historical data must be recomputed or labelled as being on the old reference, and going unlabelled is the usual failure.'),
        sub('供应链溯源', 'Supply-chain provenance', '供应链管理', 'Supply-chain management', 1,
          '每一次转手都留下记录，使终端产品可以回答"这批原料从哪来"',
          'each transfer leaving a record so the finished product can answer where its material came from',
          '链条只保证记录连续，不保证记录为真：混料、换标、伪造单据都在链条内部完成，而链条本身对内容不设防。',
          'The chain guarantees the records are continuous rather than true: blending, relabelling and forged paperwork all happen inside it, and the chain itself defends nothing about content.'),
        sub('文献引用链', 'Citation chains', '科学计量学', 'Scientometrics', 2,
          '一条结论回溯到原始证据的路径，中间每一次转述都可能引入偏移',
          'the path from a conclusion back to its original evidence, with each restatement able to shift it',
          '引用链的不确定度不相加而是变形：转述会丢限定条件，于是链条越长，结论越强而不是越模糊——与计量的情形相反。',
          'Uncertainty along a citation chain does not add but deform: restatement drops qualifiers, so a longer chain makes a conclusion stronger rather than fuzzier, which is the opposite of the metrological case.'),
      ],
      relations: [
        rel('commensuration-cost', 'generates',
          '链条上的每一个环节都是一处必须把两种意义对齐的地方，而代价正落在那里。所以"可比性"不是免费的属性而是买来的：溯源链是买它的方式，通约代价是价格。',
          'Every link is a place where two meanings must be made to line up, and that is where the cost lands. Comparability is therefore not a free property but a purchased one: the chain is how it is bought and commensuration cost is the price.'),
        rel('deep-time-accumulation', 'emerges-from',
          '不确定度沿链条累加，与误差沿世代累积是同一件事：单环节完全可忽略的偏差，在足够长的链条之后决定读数还有没有意义。而断点是回溯性的——它在很久以后才被发现，届时全部下游数据一起作废。',
          'Uncertainty adds along the links exactly as error accumulates over generations: a per-link deviation wholly negligible in isolation decides, after enough links, whether the reading means anything. And a break is retroactive — found long afterwards, invalidating all downstream data at once.'),
      ],
      mistakenFor: bi(
        '常被误当成"有记录就可信"。链条保证的是**连续**而不是**为真**：每一环都可能记录了一件假事，而链条对此不设防。它交付的是"出了问题能定位到哪一环"，不是"没有问题"——把它读成后者，正是那些单据齐全的造假案能长期不被发现的原因。',
        'Often mistaken for records making something trustworthy. A chain guarantees continuity rather than truth: any link may faithfully record a falsehood, and the chain defends nothing against that. What it delivers is that a problem can be located to a link, not that there is none — reading it as the latter is why frauds with complete paperwork stay undetected for years.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/zero-knowledge-verification',
    depth: {
      origin: bi(
        '1985 年由 Goldwasser、Micali 与 Rackoff 提出；他们要回答的是一个看起来自相矛盾的问题——能不能让对方确信一个断言为真，而对方在过程结束后关于这个断言的知识没有增加分毫。答案是能，而且证明本身就是构造。',
        'Given in 1985 by Goldwasser, Micali and Rackoff, answering what looks like a contradiction: can one convince someone a statement is true while leaving them knowing nothing more about it than before. The answer is yes, and the proof is the construction.',
      ),
      minimalForm: '完备性 ∧ 可靠性 ∧ 零知识（存在模拟器）',
      canonicalSubstrates: [
        sub('区块链的隐私交易', 'Private transactions on a ledger', '密码学', 'Cryptography', 0,
          '证明"这笔转账合法且余额充足"，而不公开金额与地址',
          'proving a transfer is valid and the balance sufficient without revealing amount or address',
          '可靠性依赖未被证明的困难性假设，且许多方案需要一次可信初始化——那一步一旦被污染，此后所有证明都可伪造而无人能发现。',
          'Soundness rests on unproven hardness assumptions and many schemes need a trusted setup, and once that step is compromised every later proof can be forged undetectably.'),
        sub('核裁军核查', 'Nuclear disarmament verification', '军备控制', 'Arms control', 0,
          '证明"这确实是一枚待拆解的弹头"，而不泄露它的设计',
          'proving an object really is a warhead scheduled for dismantlement without revealing its design',
          '这里的"断言"是物理属性而非计算：物理零知识方案依赖测量装置本身可信，而检验装置是否被做过手脚，本身又是一个需要核查的问题。',
          'The statement here is a physical property rather than a computation: a physical zero-knowledge scheme relies on the measuring apparatus being honest, and whether it has been tampered with is itself a question needing verification.'),
        sub('审计与合规证明', 'Compliance attestation', '会计学', 'Accounting', 1,
          '向监管方证明"我们满足这条比率要求"，而不交出全部账目',
          'proving to a regulator that a ratio requirement is met without handing over the books',
          '出证代价与证明体积决定它能不能进入日常流程：一份需要数小时生成的证明在按日申报里不可用，方法的边界是工程而不是理论。',
          'Proving cost and proof size decide whether it can enter routine practice: a proof taking hours to generate is unusable in daily filing, so the boundary here is engineering rather than theory.'),
      ],
      relations: [
        rel('computational-lower-bounds', 'emerges-from',
          '它之所以能说服人，全靠伪造一份证明被假定为昂贵——而那是一条猜想不是定理。所以"数学上保证"这句话在这里是有条件的：保证的是归约，不是那条下界本身。',
          'It convinces only because forging a proof is assumed expensive, and that is a conjecture rather than a theorem. Guaranteed by mathematics is therefore conditional here: what is guaranteed is the reduction, not the bound it reduces to.'),
        rel('information-asymmetry', 'explains',
          '它改变了信息不对称的代价结构：过去要让对方相信你持有某物，通常只能把它交出去，于是核查即意味着不对称消失。零知识让不对称在被验证之后依然存在——这才是它真正新的地方，而不是"更安全"。',
          'It changes what information asymmetry costs: convincing someone you hold something used to mean handing it over, so verification meant the asymmetry ended. Zero knowledge lets the asymmetry survive being verified, and that rather than being more secure is what is genuinely new about it.'),
      ],
      mistakenFor: bi(
        '常被误当成"能证明计算是对的"。它证明的是"我按声称的方式跑了这段计算"，从不证明这段计算本身正确。一个把错误逻辑忠实执行的程序，能产出一份完美的零知识证明——方法保证的是执行的忠实性，而不是被执行者的正确性。',
        'Often mistaken for proving a computation correct. It proves the computation was run as claimed and never that the computation itself is right. A program faithfully executing wrong logic yields a perfect zero-knowledge proof: what the method guarantees is fidelity of execution, not correctness of what was executed.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/counterfactual-trace',
    depth: {
      origin: bi(
        '这条做法在几个领域各自被独立发明，都是为了同一个缺口：档案里只剩下胜者。临床试验注册要求登记预设的分析方案，工程界的决策记录要求写下被否决的方案，而史学早就知道，只读留存下来的文书会系统性高估当时的共识。',
        'Invented independently in several fields for one gap: the archive keeps only winners. Trial registration demands the analysis plan be filed in advance, engineering decision records demand the rejected options be written down, and historians have long known that reading only surviving documents systematically overstates the consensus of the time.',
      ),
      minimalForm: '记录 {被考虑过的路径, 当时的取舍依据}，而不只是被选中的那条',
      canonicalSubstrates: [
        sub('架构决策记录', 'Architecture decision records', '软件工程', 'Software engineering', 1,
          '写下当时考虑过哪些方案、为什么否决，使后来者不必重走一遍',
          'writing down which options were considered and why they were rejected, so a later reader need not retrace them',
          '记录的是当时的理由而不是当时的全部约束：一年后读起来常常显得草率，因为使决策合理的那些临时条件没有被写下来。',
          'What gets recorded is the reasoning rather than the full set of constraints, so a year later it often reads as careless because the temporary conditions that made the decision sensible went unwritten.'),
        sub('预注册的分析方案', 'Pre-registered analysis plans', '临床研究', 'Clinical research', 0,
          '事前登记打算做的分析，使"换一种分析会怎样"从不可知变成可查',
          'filing the intended analyses in advance, which turns what another analysis would have shown from unknowable into checkable',
          '登记的是打算做的，不是可能做的：真正的分支空间远大于任何人写得下的清单，所以它压缩的是事后选择的余地而不是消除它。',
          'What is filed is what was intended rather than what was possible: the real branching space far exceeds any writable list, so it narrows the room for choosing afterwards rather than removing it.'),
        sub('政策评估的反事实', 'The counterfactual in policy evaluation', '公共政策', 'Public policy', 2,
          '把"不实施这项政策会怎样"做成一个可报告的分布，而不是一句修辞',
          'turning what would have happened without the policy into a reportable distribution rather than a rhetorical claim',
          '反事实是被构造出来的而非被观测到的，所以它的可信度上限就是构造它所用假设的可信度——而那份假设清单常常不与结论一同发表。',
          'A counterfactual is constructed rather than observed, so its credibility is capped by that of the assumptions used to build it, and that list is often not published alongside the conclusion.'),
      ],
      relations: [
        rel('selection-bias-absence', 'emerges-from',
          '它存在的全部理由，就是档案本身是一个有选择的样本：没被选中的路径不留痕，于是事后看去每一个决定都像是唯一合理的。而这条方法自己也逃不掉——留下的痕迹同样是记录者选着留的，所以它压低偏差而不消除偏差。',
          'Its entire reason for existing is that the archive is itself a selected sample: unchosen paths leave nothing, so in hindsight every decision looks like the only sensible one. And the method does not escape its own point — the trace is also selected by whoever kept it, so it lowers the bias rather than removing it.'),
        rel('alternative-mechanism-panel', 'generates',
          '一份被认真记下来的"考虑过并否决"清单，就是一个带时间戳的替代机制对照集——区别只在它是在做决定的当时写的，因而没有被结论反向塑造过。事后重构的候选清单几乎总是偏向已知的答案。',
          'A seriously kept list of considered-and-rejected options is an alternative-mechanism panel with a timestamp, differing only in having been written while the decision was being made and so not shaped backwards by the conclusion. A list reconstructed afterwards almost always leans towards the answer already known.'),
      ],
      mistakenFor: bi(
        '常被误当成"多写文档"。它记录的不是做了什么，而是**没做什么以及为什么**——这两类信息的用途完全不同：前者让人复现结果，后者让选择本身可以被研究。一份只记录已选路径的详尽文档，在这条结构的意义上是空的。',
        'Often mistaken for more documentation. What it records is not what was done but what was not done and why, and those serve entirely different purposes: the first lets someone reproduce a result, the second makes the choice itself researchable. An exhaustive document recording only the chosen path is, in this structure\'s terms, empty.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/tacit-craft-explicitation',
    depth: {
      origin: bi(
        '1958 年由 Michael Polanyi 命名了"我们知道的比我们说得出的多"这一现象；而把它当作可攻克的工程问题，来自 20 世纪后半叶的工艺标准化——每一次成功都把一段手艺变成参数，每一次失败都说明那段手艺不可分解。',
        'Michael Polanyi named the phenomenon in 1958 — we know more than we can tell — while treating it as an engineering problem to be attacked comes from the process standardisation of the later twentieth century, where each success turned a piece of craft into parameters and each failure showed that piece to be indecomposable.',
      ),
      minimalForm: '手艺步骤 → {显式参数} ；判据是残余方差是否下降',
      canonicalSubstrates: [
        sub('细胞培养的标准化', 'Standardising cell culture', '细胞生物学', 'Cell biology', 2,
          '把"看着不对就换液"这类判断拆成可测的指标，使不同实验室的结果第一次可比',
          'breaking judgements like changing the medium when it looks wrong into measurable indicators, which first makes two laboratories comparable',
          '残余方差不降就是拆解失败的信号，而这一步常被跳过：写下了参数、发表了流程，却从没验过按参数做出来的东西是否一样好。',
          'Residual variance not falling is the signal that the decomposition failed, and that check is routinely skipped: the parameters get written and the protocol published without anyone testing whether what they produce is as good.'),
        sub('手工工艺的机械化', 'Mechanising a handicraft', '制造工程', 'Manufacturing engineering', 0,
          '找出流程中方差最大、最依赖个人的那一段，先拆它',
          'finding the step with the largest variance and the heaviest dependence on one person, and taking that one apart first',
          '有些手艺的价值恰恰在不可复制：把它标准化会同时提高一致性并消灭产品的理由，这不是技术失败而是目标选错。',
          'Some crafts are valuable precisely because they cannot be copied, and standardising one raises consistency while destroying the product\'s reason to exist — not a technical failure but a mistaken objective.'),
        sub('专家系统与知识获取', 'Expert systems and knowledge acquisition', '人工智能', 'Artificial intelligence', 1,
          '把专家说不清的判断问成规则，而"问不出来"本身是这一代方法的主要瓶颈',
          'interviewing an expert\'s inarticulate judgement into rules, with the failure to get it out being that generation of methods\' main bottleneck',
          '现代做法绕开了这一步：从示范中学习不需要专家说清楚，代价是得到的能力同样说不清楚——瓶颈被移走而不是被解决。',
          'Modern practice routes around it: learning from demonstration needs no articulation, at the price that the resulting capability is equally inarticulate. The bottleneck was moved rather than solved.'),
      ],
      relations: [
        rel('rebuild-from-description', 'generates',
          '它是"照描述重建"能成立的前提：没有被写下来的那部分，正是重建失败的地方。而残余方差与重建失败率量的是同一件事——所以一次失败的重建不只是坏消息，它精确指出了哪一段手艺还在人的手上。',
          'It is the precondition for rebuilding from a description: what was never written down is exactly where the rebuild fails. Residual variance and rebuild failure measure the same thing, so a failed rebuild is not merely bad news — it names precisely which piece of the craft is still in someone\'s hands.'),
        rel('standardisation-lowers-the-bar', 'generates',
          '一段手艺一旦被参数化，就能被封装成现成件，而这才是门槛真正下降的时刻。所以"降门槛"不是把东西做便宜，是先把某人手上的能力变成可以买到的零件。',
          'Once a piece of craft is parameterised it can be packaged as an off-the-shelf part, and that is when the bar actually falls. Lowering a barrier is therefore not making something cheap but first turning a capability held in someone\'s hands into a component that can be bought.'),
      ],
      mistakenFor: bi(
        '常被误当成"写个流程文档"。判据不在文档存不存在，而在**残余方差降没降**：按文档做出来的东西如果差异照旧，那段手艺就没有被拆解，只是被描述了。而更少被检查的是另一半——方差降了但产物变差，说明拆解成功却拆错了地方。',
        'Often mistaken for writing a protocol. The test is not whether the document exists but whether residual variance fell: if what people produce from it still varies as much, the craft was described rather than decomposed. Less often checked is the other half — variance falls while the product gets worse, which means the decomposition worked on the wrong step.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/injected-randomness',
    depth: {
      origin: bi(
        '古雅典用抽签而非选举分配大部分公职，理由不是效率而是防止派系俘获。现代版本从 2013 年前后的科研资助实验重新开始：新西兰、瑞士与德国的机构在评审噪声区间内改用抽签，理由是评审对同一批申请的排序重测信度低到无法支撑精确名次。',
        'Classical Athens allotted most offices by lot rather than election, for resistance to capture rather than for efficiency. The modern version restarted around 2013 in research funding, where agencies in New Zealand, Switzerland and Germany moved to a lottery inside the noise band, on the ground that panels re-ranking the same applications agree too weakly to support an exact order.',
      ),
      minimalForm: '真实差异 < 评估噪声 ⇒ 排序无信息 ⇒ 抽签',
      canonicalSubstrates: [
        sub('部分抽签的科研资助', 'Partial lotteries in research funding', '科研政策', 'Research policy', 0,
          '把落在评审噪声区间内的申请交给抽签，而不假装那段名次是有信息的',
          'sending the applications inside the panel\'s noise band to a lottery instead of pretending that stretch of the ranking carries information',
          '前提是噪声区间可以被估计出来，而这需要重复评审同一批申请——多数机构从未做过这项测量，于是区间边界靠猜。',
          'It presumes the noise band can be estimated, which requires re-reviewing the same applications, and most agencies have never run that measurement, so the boundary is guessed.'),
        sub('抽签式陪审团与公民会议', 'Sortition in juries and citizens\' assemblies', '政治学', 'Political science', 1,
          '用随机抽取替代自我选择，得到一个不被最积极者主导的样本',
          'random selection replacing self-selection, giving a sample not dominated by whoever is most motivated',
          '随机抽取保证代表性而不保证胜任度：两者的权衡是真实的，且把它说成"更民主"回避了这一点。',
          'Random selection buys representativeness rather than competence, the trade is real, and calling it more democratic sidesteps it.'),
        sub('随机对照试验', 'Randomised assignment in trials', '统计学', 'Statistics', 2,
          '随机分配同时做两件事：排除未观测混杂，并顺带产生原本拿不到的对照',
          'random assignment doing two things at once: removing unobserved confounding, and yielding a comparison that was otherwise unavailable',
          '随机化保证的是分配无偏，不是样本能代表总体：一个在高度选择的人群里做的完美随机试验，内部有效而外部未必。',
          'Randomisation buys unbiased assignment rather than a representative sample: a flawless trial in a heavily selected population is internally valid and need not be externally so.'),
      ],
      relations: [
        rel('natural-experiment', 'competes-with',
          '两者都在制造一个干净的对照，代价的方向相反：抽签自己造出分配因而分配无可置疑，但放弃了本可以做出的择优；自然实验保留了择优却必须论证分配是干净的。选哪个取决于哪一种代价更付不起，不取决于哪个更严谨。',
          'Both manufacture a clean contrast and the costs run opposite ways: a lottery creates the assignment and so puts it beyond dispute while giving up the selection that could have been made, and a natural experiment keeps the selection but must argue the assignment was clean. Which to use turns on which cost is less affordable, not on which is more rigorous.'),
        rel('fisher-precision-limit', 'emerges-from',
          '"噪声区间内的名次没有信息"这句话有一个精确的底：估计量的方差有下界，而排序的分辨率不可能好过这个下界。所以抽签不是放弃判断，它是拒绝报告一个精度上不存在的名次。',
          'The claim that ranking inside the noise band carries no information has an exact floor under it: an estimator\'s variance is bounded below, and a ranking cannot resolve better than that bound. A lottery is therefore not abdication of judgement but a refusal to report an order that does not exist at the available precision.'),
      ],
      mistakenFor: bi(
        '常被误当成"放弃择优"。它放弃的只是噪声区间**之内**的排序，而区间之外的择优照做——所以它的实质是把"我们分得清"与"我们分不清"这两段明确分开，并停止对第二段假装精确。反过来，当真实差异确实大于噪声时使用它，就是纯粹的浪费。',
        'Often mistaken for giving up on merit. What it gives up is order inside the noise band, while selection outside it goes on as before, so what it really does is separate the stretch we can tell apart from the stretch we cannot and stop feigning precision over the second. Used where real differences genuinely exceed the noise, it is pure waste.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/standardisation-lowers-the-bar',
    depth: {
      origin: bi(
        '1801 年 Eli Whitney 向国会演示可互换零件时，卖点不是精度而是修理不再需要工匠。此后每一轮——集装箱、螺纹标准、集成电路、生物学的标准生物元件——真正改变的都不是效率，是谁能参与。',
        'When Eli Whitney demonstrated interchangeable parts to Congress in 1801, the pitch was not precision but that repair no longer needed a craftsman. Every round since — the shipping container, thread standards, integrated circuits, standard biological parts — has changed not efficiency but who can take part.',
      ),
      minimalForm: '单位成本 ↓ 到新参与者可及 ⇒ 参与者集合改变',
      canonicalSubstrates: [
        sub('集装箱', 'The shipping container', '物流', 'Logistics', 0,
          '装卸成本塌陷之后，远距离生产第一次比就近生产便宜',
          'handling cost collapsing, after which producing far away became cheaper than producing nearby for the first time',
          '成本降在港口，代价出现在别处：整个内陆运输、码头劳动与城市形态被重排，而这些都不在"每吨装卸费"这个数里。',
          'The cost fell at the dock and the price appeared elsewhere: inland transport, dock labour and urban form were all rearranged, and none of that sits inside the per-tonne handling figure.'),
        sub('标准生物元件', 'Standard biological parts', '合成生物学', 'Synthetic biology', 1,
          '把启动子、终止子做成目录里的现成件，使不做过分子生物学的人也能设计线路',
          'making promoters and terminators catalogue items so someone who has never done molecular biology can design a circuit',
          '这里复杂度确实搬到了接口：元件的行为随宿主与上下文改变，于是"组装"需要的知识比"制作元件"更专门——门槛换了位置而不是降低。',
          'Complexity really did move to the interface here: a part\'s behaviour changes with host and context, so assembling demands more specialised knowledge than making, and the barrier moved rather than fell.'),
        sub('开源工具链', 'Open toolchains', '软件工程', 'Software engineering', 2,
          '新增参与者是唯一能证明门槛真的降了的量，其余都是关于潜力的说法',
          'new participants being the only quantity that shows a barrier actually fell, everything else being a claim about potential',
          '免费不等于可及：依赖管理、配置与运行环境构成的隐性成本常常高于被免掉的那份，而它不出现在任何价格表里。',
          'Free is not accessible: the implicit cost of dependencies, configuration and runtime often exceeds the price that was removed, and it appears on no price list.'),
      ],
      relations: [
        rel('hourglass-waist', 'generates',
          '标准件加一个窄接口就是沙漏的腰：上下两侧因此可以各自繁荣而互不协调。这也说明这条结构的失效方式为什么是"复杂度搬到接口"——腰变粗，两侧就重新耦合，而繁荣正是靠解耦买来的。',
          'Standard parts plus one narrow interface is the waist of an hourglass, which is why both sides can then proliferate without coordinating. It also explains why this structure fails by complexity moving to the interface: a thickened waist recouples the two sides, and the proliferation was bought by their being decoupled.'),
        rel('commons-congestion', 'generates',
          '门槛降下去，参与者就多起来，而多出来的参与者共享同一份资源——评审带宽、频谱、命名空间、注意力。所以降门槛这件事自带一个后果：它把一个准入问题换成一个拥挤问题，而后者通常没有被同时设计。',
          'Lower the barrier and participants arrive, and the arrivals share one resource — review capacity, spectrum, a namespace, attention. Lowering a barrier therefore carries a consequence with it: it trades an admission problem for a congestion problem, and the second is usually not designed for at the same time.'),
      ],
      mistakenFor: bi(
        '常被误当成"降本增效"。它改变的不是效率而是参与者集合，而这两件事需要不同的证据：效率看单位成本，参与看新增了谁。只报成本下降而不报参与者变化，恰好漏掉了这条结构唯一的产出——也漏掉了复杂度是否只是搬到了接口上。',
        'Often mistaken for cutting cost and raising efficiency. What it changes is who takes part rather than how efficiently, and those need different evidence: efficiency is read off unit cost, participation off who is newly there. Reporting the cost fall without the participation change misses this structure\'s only output — and misses whether complexity merely moved to the interface.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/costly-signal',
    depth: {
      origin: bi(
        '1975 年由 Amotz Zahavi 以"累赘原理"提出，当时被普遍认为不成立；1990 年 Alan Grafen 给出模型证明它可以稳定，条件是发信代价必须与发信者的质量反相关——低质量者付同样的代价要更痛。这一条件常被引用者略去，而它才是整个结构。',
        'Put by Amotz Zahavi in 1975 as the handicap principle and widely thought not to work; Alan Grafen modelled it in 1990 and showed it can be stable, on the condition that the cost of signalling correlates inversely with the signaller\'s quality — the same cost must hurt a poor signaller more. That condition is routinely dropped by those who cite it, and it is the whole structure.',
      ),
      minimalForm: '代价(造假者) > 代价(诚实者) ⇒ 信号可信而不需核查',
      canonicalSubstrates: [
        sub('雄孔雀的尾', 'The peacock\'s tail', '行为生态学', 'Behavioural ecology', 1,
          '尾越大越难活，所以带着大尾还活着这件事本身就是信息',
          'a bigger tail being harder to survive, so still being alive while carrying one is itself the information',
          '经验证据比通常说法弱得多：许多被当作累赘的性状，其代价与质量的反相关从未被测过，而没有这一条它就只是装饰。',
          'The evidence is far weaker than usually stated: for many traits called handicaps the inverse correlation of cost with quality has never been measured, and without it the trait is only ornament.'),
        sub('学历作为筛选信号', 'Education as a screening signal', '经济学', 'Economics', 0,
          '文凭的价值有一部分不来自所学，而来自"能坚持读完"这件事对低能力者更贵',
          'part of a diploma\'s worth coming not from what was learned but from finishing being more expensive for a less able person',
          '这一读法与"教育提高生产力"在数据上难以分开，而政策含义完全相反——若纯属信号，扩招不增加产出只抬高门槛。',
          'This reading is hard to separate in data from education raising productivity, while the policy implications are opposite: if it is purely signalling, expanding enrolment adds no output and only raises the bar.'),
        sub('资本承诺与市场信号', 'Sinking capital as a market signal', '产业组织', 'Industrial organisation', 2,
          '把钱投进无法收回的专用资产，向对手证明"我不会退出"',
          'sinking money into assets that cannot be recovered, to prove to a rival that exit is not coming',
          '信号价值随代价差消失而消失：租赁、外包与云端把专用资产变成可退的开支，同一个动作因此不再携带信息。',
          'The signal\'s worth vanishes with the cost gap: leasing, outsourcing and the cloud turn dedicated assets into reversible spending, so the same move stops carrying information.'),
      ],
      relations: [
        rel('verification-asymmetry', 'competes-with',
          '两条结构在买同一样东西——让不在场的人相信——而路子相反：验证不对称造一个便宜可查的见证，昂贵信号让谎话贵到不值得说。所以一个领域有没有可携带的见证，决定了它长出的是审计制度还是资历与排场。两者也可以互相替代得很坏：见证缺席时，昂贵信号会自发出现，而它的代价是纯浪费。',
          'Both buy the same thing — belief from someone not present — by opposite routes: verification asymmetry produces a witness that is cheap to check, a costly signal makes the lie too expensive to tell. Whether a field has a portable witness therefore decides whether it grows audit or credentials and display. They also substitute for each other badly: where a witness is missing, costly signals appear on their own, and their cost is pure waste.'),
        rel('robustness-efficiency-tradeoff', 'emerges-from',
          '这个信号靠浪费工作：代价如果能被省掉，信号也就同时失效了。所以它是效率与可信度直接对立的那个纯例——任何"优化掉"发信代价的努力，都在拆掉自己要维持的东西。',
          'The signal works by waste: remove the cost and the signal goes with it. It is therefore the pure case of efficiency standing directly against credibility, where any effort to optimise the cost away dismantles the very thing it was meant to preserve.'),
      ],
      mistakenFor: bi(
        '常被误当成"贵就可信"。成立的条件是**代价差**而不是代价高：造假者付的必须多于诚实者。同样一笔支出，如果两者付得一样痛，它什么也没说明。绝大多数被称作昂贵信号的做法从未验过这个差额，于是"贵"被当成了结论而不是前提。',
        'Often mistaken for expensive meaning credible. What makes it work is the cost gap rather than the cost level: a faker must pay more than an honest signaller. The same outlay, if it hurts both equally, establishes nothing. Most practices called costly signals have never had that gap measured, so expense gets treated as the conclusion rather than the premise.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/commitment-device',
    depth: {
      origin: bi(
        '1960 年由 Thomas Schelling 系统化：他指出谈判中的力量常常来自失去选择而不是拥有选择，并给出那个著名的意象——把方向盘拆下来扔出窗外，对方就必须让路。条件是对方看见你扔了。',
        'Systematised by Thomas Schelling in 1960, who observed that bargaining power often comes from losing options rather than having them, and gave the famous image: tear out the steering wheel and throw it out of the window, and the other driver must swerve. The condition is that they see you throw it.',
      ),
      minimalForm: '主动删除自己的选项 + 对方可见 ⇒ 均衡移动',
      canonicalSubstrates: [
        sub('战略性承诺', 'Strategic commitment', '博弈论', 'Game theory', 1,
          '把退让这一手从自己的可选集里删掉，对方的最优反应随之改变',
          'deleting the option to concede from one\'s own choice set, which changes the other side\'s best response',
          '不可逆度是可以被对方检验的：现代冲突中大多数"承诺"其实可撤销，于是它们被正确地当作姿态而不是承诺。',
          'Irreversibility is something the other side can test, and most commitments in modern conflicts are in fact revocable, so they are correctly read as posture rather than commitment.'),
        sub('中央银行的规则约束', 'Rule-binding at a central bank', '宏观经济学', 'Macroeconomics', 0,
          '把相机抉择的余地交出去，换取通胀预期的稳定',
          'giving up discretion in exchange for stable inflation expectations',
          '约束越硬，遇到规则未曾设想的冲击时越危险——承诺买来的可信度，恰恰是靠放弃应对意外的能力换的。',
          'The harder the rule, the more dangerous a shock it never anticipated: the credibility a commitment buys is bought precisely by giving up the ability to respond to surprises.'),
        sub('自我约束的储蓄与戒断', 'Self-binding in saving and abstinence', '行为经济学', 'Behavioural economics', 2,
          '预先锁住自己的钱或时间，对付的是未来的自己而不是别人',
          'locking up one\'s own money or time in advance, against one\'s future self rather than against anyone else',
          '这里"对方可见"这一项塌缩了：需要被说服的是同一个人，所以只有真实的不可逆才管用，而心理上的承诺几乎总被绕过。',
          'The visibility term collapses here, since the party to be convinced is the same person, so only genuine irreversibility works and a merely psychological commitment is almost always routed around.'),
      ],
      relations: [
        rel('nash-equilibrium', 'explains',
          '它是唯一一种通过缩小自己的选择集来改善结果的手段，而这在均衡的语言里毫不矛盾：删掉一个选项改变的是对方的最优反应，于是整个博弈换了一个均衡。"选择越多越好"只在单人决策里成立，多人时不成立。',
          'It is the only move that improves an outcome by shrinking one\'s own choice set, which is not paradoxical in the language of equilibria: deleting an option changes the other side\'s best response, so the game settles somewhere else. More options are better holds for one-person decisions and not for games.'),
        rel('path-dependence', 'generates',
          '承诺是**故意制造的**不可逆。路径依赖通常是发生在你身上的事——一次早期选择被后来的投资锁死；这里同一个机制被反过来当工具用，而代价一模一样：锁死之后，环境变了你也转不了身。',
          'A commitment is irreversibility manufactured on purpose. Path dependence is usually something that happens to you, an early choice locked in by later investment; here the same mechanism is turned around and used as a tool, at exactly the same price — once locked, a changed environment finds you unable to turn.'),
      ],
      mistakenFor: bi(
        '常被误当成"表态"。三个失效方式各自独立：锁定可被撤销、锁定可被伪造、对方根本不知情。第三种最常见也最少被检查——一个真实且不可逆的承诺，如果对方没看见，在博弈上等于没有发生，而当事人往往以为自己已经付过代价了。',
        'Often mistaken for a declaration. Three failure modes are independent: the lock can be undone, the lock can be faked, and the other side may simply not know. The third is the commonest and the least checked — a genuine irreversible commitment the other side never saw is, in the game, as if it never happened, while the one who made it usually believes the price has been paid.',
      ),
    },
  },
];
