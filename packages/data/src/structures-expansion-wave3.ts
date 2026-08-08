import type { Bilingual } from './frontiers';
import type { StructureCorrespondence, StructureMapping } from './structures';

/**
 * Wave 3 · structure mappings for the islands added when the atlas went
 * 176 → 371.
 *
 * These are PATCHES, not new structures: all 36 isomorphisms in the corpus are
 * already claimed, so wave 3 adds substrate to skeletons that exist rather than
 * naming new ones.
 *
 * Every mapping here survived the repo's rejection rule — a mapping exists only
 * when the island's substrate really contains the counterpart; same cluster, or
 * "it reads similar", is never enough. 34 of the
 * 419 cluster-generated candidates were kept.
 */
export interface Wave3StructurePatch {
  structureId: string;
  mappings: StructureMapping[];
}

const bi = (zh: string, en: string): Bilingual => ({ zh, en });

const correspondence = (
  quantityZh: string,
  quantityEn: string,
  substrateZh: string,
  substrateEn: string,
): StructureCorrespondence => ({
  quantity: bi(quantityZh, quantityEn),
  inThisSubstrate: bi(substrateZh, substrateEn),
});

const mapping = (
  slug: string,
  correspondences: StructureCorrespondence[],
  prediction: Bilingual,
  boundary: Bilingual,
  evidenceRefs: string[],
): StructureMapping => ({ slug, correspondences, prediction, boundary, evidenceRefs });

export const WAVE_3_STRUCTURE_PATCHES: Wave3StructurePatch[] = [
  {
    structureId: "struct://xfrontier/adjoint-functors",
    mappings: [
    mapping(
      "automated-repair-evolving-formal-proof",
      [
        correspondence(
          "一对方向相反的翻译 F ⊣ G",
          "a pair of opposite translations, F ⊣ G",
          "岛上要求显式写出的「新旧定义之间的类型等价」：旧定义→新定义与新定义→旧定义两个方向被写成可执行的搬运，PUMPKIN Pi 沿这条等价自动迁移函数与全部证明。",
          "The 'type equivalence between old and new definitions' the island insists on writing out explicitly: both directions, old→new and new→old, become executable transport, and PUMPKIN Pi migrates functions and all their proofs along it.",
        ),
        correspondence(
          "「翻过去再翻回来」留下什么——被保持的部分与被丢掉的部分",
          "what a round trip leaves behind — what is preserved versus what is discarded",
          "自动修复的成败判据：只依赖等价所保持的结构的证明能被回放通过，依赖被丢掉的表示细节的证明则断掉；岛上那句「修复只保证证明重新通过，不保证新定义还在说同一件事」正是这条缝。",
          "The pass/fail criterion of automated repair: a proof that leans only on structure the equivalence preserves replays through, while a proof that leans on discarded representation detail breaks — exactly the seam the island names when it says repair guarantees the proofs pass again, not that the new definition still says the same thing.",
        ),
      ],
      bi(
        "若这成立，一次定义变更后自动修复的成功率，应由「该证明是否触及等价未保持的表示细节」预测，而不是由证明长度或它在依赖图上的深度预测：把断掉的证明按这两类分箱，前一类应几乎全部自动通过，后一类应几乎全部需要人工，而不是随证明长度平滑下降。若成功率主要随长度衰减、与是否触及被丢掉的结构无关，这条对应就被推翻。",
        "If it holds, the automated-repair success rate after a definition change should be predicted by whether a proof touches representation detail the equivalence fails to preserve, not by proof length or depth in the dependency graph: bin the broken proofs by those two categories and the first should pass almost entirely automatically while the second should almost entirely need a human — rather than success decaying smoothly with proof size. A success rate that tracks length and ignores whether the discarded structure is touched would refute the correspondence.",
      ),
      bi(
        "PUMPKIN Pi 搬运的是类型等价——伴随中单位与余单位都是同构的退化情形，来回一趟什么也不丢。真正的伴随 F ⊣ G 允许有损翻译，来回一趟给出的是最优近似而非原物；而这个基底没有这个退路：岛自己说破坏性规范变更「没有等价可依」，此时工具不是给出一个次优迁移，而是直接失败。把伴随读成「即使规范被破坏也能自动给出最佳近似迁移」，就越过了边界。",
        "What PUMPKIN Pi transports along is a type equivalence — the degenerate case of an adjunction where unit and counit are both isomorphisms, so the round trip discards nothing. A genuine adjunction F ⊣ G tolerates lossy translation and returns a best approximation rather than the original; this substrate has no such fallback. The island says outright that a breaking specification change offers no equivalence to transport along, and there the tool does not produce a second-best migration — it simply fails. Reading the adjunction as 'even a breaking change yields an automatic best-approximation migration' crosses the line.",
      ),
      ["https://doi.org/10.1145/3591221", "https://doi.org/10.1145/3453483.3454033"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/bayesian-surprise",
    mappings: [
    mapping(
      "active-mechanism-discovery-via-disagreement-driven",
      [
        correspondence(
          "r_intrinsic = 贝叶斯惊奇（后验相对先验的 D_KL），被当作「下一个实验」的奖励",
          "r_intrinsic — Bayesian surprise, the D_KL of posterior against prior, used as the reward for choosing the next experiment",
          "岛自述的采集准则本身：AutoDiscovery 式回路把贝叶斯惊奇直接写成奖励，交给蒙特卡洛树搜索在假说空间里定位下一步该做的实验",
          "the island's own stated acquisition rule: an AutoDiscovery-style loop writes Bayesian surprise in as the reward and hands it to Monte-Carlo tree search to locate the next experiment in hypothesis space",
        ),
        correspondence(
          "p(θ)——那个被一次观测更新的信念分布",
          "p(θ) — the belief distribution one observation updates",
          "同时被持有的竞争机理假说集（稀疏解耦 RNN 这类可解释模型族的成员），成员间的预测方差就是这个分布的可观测宽度",
          "the set of competing mechanistic hypotheses held at once — members of an interpretable family such as sparse disentangled RNNs — whose cross-member prediction variance is the observable width of that distribution",
        ),
      ],
      bi(
        "若这成立，在 ActiveSciBench 这类闭环基准上，分歧驱动策略恢复出真定律所需的样本数应显著低于随机实验与常规主动学习；而把真机制从候选集中抽走之后，这个样本优势应当消失——奖励仍然很高，指向的却只是几个错答案之间的分歧。",
        "If it holds, on closed-loop benchmarks such as ActiveSciBench the disagreement-driven policy should need significantly fewer samples to recover the true law than random experimentation or conventional active learning; and once the true mechanism is removed from the candidate set that advantage should vanish, because the reward stays high while pointing only at disagreement among wrong answers.",
      ),
      bi(
        "断点是岛自己点出的两处。一，成员间预测方差不是 D_KL：除非各假说按后验概率加权，「最分歧」的实验未必是信息增益最大的那个。二，D_KL 只在候选集的支撑上有定义；真机制若不在集合里，惊奇度照样能被拉满，但它此时衡量的是模型自己动了多少，而不是对世界的无知减少了多少。",
        "The break sits at the two points the island names itself. First, cross-member prediction variance is not D_KL: unless hypotheses are weighted by posterior probability, the most-disagreed experiment need not be the highest-information one. Second, D_KL is defined only over the support of the candidate set — with the true mechanism outside it, surprise can still be driven to a maximum, but it then measures how far the model moved, not how much ignorance about the world was removed.",
      ),
      ["https://arxiv.org/abs/2606.12386", "https://arxiv.org/abs/2605.24043"],
    ),
    mapping(
      "comparative-curiosity-information-seeking-across",
      [
        correspondence(
          "r_intrinsic：信息增益作为可与外在奖励换算的内在奖励",
          "r_intrinsic — information gain as an intrinsic reward exchangeable against extrinsic reward",
          "猕猴为查看未选选项的反事实结果而自愿放弃的那部分真实奖励；这份代价随结果熵变化，等于把信息标了价",
          "the slice of real reward macaques give up to view the counterfactual outcome of the option they did not take — a price that tracks outcome entropy, i.e. information with a price tag on it",
        ),
        correspondence(
          "贝叶斯惊奇是注意力最强的吸引子（Itti–Baldi 的那一半）",
          "Bayesian surprise as the strongest attractor of attention (the Itti–Baldi half)",
          "以注视时长测出的注意分配：猕猴优先注意中等惊奇的刺激，惊奇度与注意之间画得出一条倒 U 曲线",
          "attention allocation measured by looking time: macaques preferentially attend intermediately surprising stimuli, giving a plottable inverted-U between surprise and attention",
        ),
      ],
      bi(
        "若这成立，被放弃的奖励量应随结果熵单调上升，并在结果已经确定（熵为零）时降到零；同一批个体倒 U 峰位的位置应与它们的熵敏感度相关，而不是与它们对新奇本身的偏好相关。",
        "If it holds, the reward forgone should rise monotonically with outcome entropy and fall to zero when the outcome is already certain (entropy zero); and where an individual's inverted-U peaks should correlate with its entropy sensitivity, not with its taste for novelty as such.",
      ),
      bi(
        "倒 U 本身就是断点：纯 D_KL 奖励在惊奇度上是单调的，最惊奇的刺激就该最吸引注意，而这些动物偏好中等惊奇——要保住结构就必须换成「学习进度／可压缩性」那一版，纯贝叶斯惊奇在这里已经被数据顶掉一半。再叠上岛自述的混淆：放弃的奖励也可能买的是新奇本身、风险偏好或条件化强化，它没有被证明就是 D_KL。",
        "The inverted-U is itself the breaking point: a pure D_KL reward is monotonic in surprise, so the most surprising stimulus should attract the most attention, yet these animals prefer intermediate surprise — keeping the structure requires the learning-progress/compressibility variant instead, so pure Bayesian surprise is already half-refuted by the data. On top sits the island's own confound: the forgone reward may be buying novelty as such, risk preference, or conditioned reinforcement, and has not been shown to be D_KL.",
      ),
      ["https://doi.org/10.1371/journal.pone.0285946", "https://doi.org/10.1098/rsbl.2022.0144"],
    ),
    mapping(
      "self-driving-labs-actively-mapping-hypothesis",
      [
        correspondence(
          "E[D_KL]——期望信息增益，作为「下一个实验做什么」的判据",
          "E[D_KL] — expected information gain as the criterion for which experiment to run next",
          "岛上明写的采集函数：以期望信息增益与模型不确定性替换「最高产率」作目标，选出最能压缩假说空间无知的下一次合成",
          "the acquisition function the island states outright: expected information gain and model uncertainty replace maximum yield as the objective, picking the synthesis that most compresses ignorance over hypothesis space",
        ),
        correspondence(
          "p(θ|s_t) → p(θ|s_{t+1})：一次观测前后被更新的后验",
          "p(θ|s_t) → p(θ|s_{t+1}) — the posterior before and after one observation",
          "代理模型对假说空间的那张地图：每次合成的自动表征结果回灌模型、地图随之更新，构成测不准—去测—更新的循环",
          "the surrogate model's map of hypothesis space: automated characterization from each synthesis is fed back and the map updates, closing the measure-uncertainty, probe, update cycle",
        ),
      ],
      bi(
        "若这成立，同一预算下把采集函数从最高产率换成期望信息增益，两条曲线应当交叉：保留测试集上的模型预测误差下降得更快，而单个最优产率样品的出现反而更晚。若信息增益版本在这两项上都不劣于产率版本，说明省下的是别的东西，这个读法就该被推翻。",
        "If it holds, swapping the acquisition function from maximum yield to expected information gain at equal budget should make two curves cross: model prediction error on a held-out set falls faster while the single best-yield sample appears later. If the information-gain version is no worse on both, what was saved is something else and this reading should be discarded.",
      ),
      bi(
        "两处断点。一，公式里的 D_KL 假定后验是校准的，而这里的信息增益是拿代理模型自己的不确定性估计算出来的——岛自己指出，这个估计一旦有系统偏差，机器就会把预算全投向它看不见的地方，奖励于是变成自证。二，D_KL 的逐步叠加要求 s_t 是最新的：Science 那套异步跨地点闭环必须在前一批结果回来之前就下单，采集函数用的是过期后验，序列可加性在这里本就不成立。",
        "Two breaking points. First, the D_KL in the formula assumes a calibrated posterior, whereas the information gain here is computed from the surrogate's own uncertainty estimate — the island itself notes that once that estimate is systematically biased the machine pours its budget into exactly what it cannot see, and the reward becomes self-confirming. Second, the step-by-step accumulation of D_KL requires s_t to be current: the delocalized asynchronous loop from the Science work must commit experiments before earlier results return, so the acquisition function runs on a stale posterior and sequential additivity does not hold.",
      ),
      ["https://www.science.org/doi/10.1126/science.adk9227", "https://www.nature.com/articles/s44160-022-00231-0"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/covariate-shift-transfer",
    mappings: [
    mapping(
      "synthetic-control-methods-transplanted-ecological-interventions",
      [
        correspondence(
          "对源域样本的重加权（密度比权重）",
          "the reweighting of source samples (the density-ratio weights)",
          "供体单元的权重：用干预前多年遥感与调查时序拟合出的那组加权，把一批未处理单元重加权成受处理单元的替身——协变量漂移里「重加权补偿」这一步在这里被真的算了出来。",
          "The donor weights: the weighting fitted on multi-year pre-intervention remote-sensing and survey series, which reweights a pool of untreated units into a stand-in for the treated one — covariate shift's 'reweight to compensate' actually computed rather than invoked.",
        ),
        correspondence(
          "重加权成立所需的支撑条件（源域支撑必须覆盖目标域）",
          "the support condition that makes reweighting well-defined (source support must cover the target)",
          "「检查处理单元是否落在供体凸包内」这一步：落在凸包之外就没有支撑，权重不再是一个有限的密度比，而变成外推。",
          "The step 'check that the treated unit lies inside the donor convex hull': outside the hull there is no support, and the weights stop being a finite density ratio and become extrapolation.",
        ),
      ],
      bi(
        "若这成立，估计的可信度应随凸包违背程度单调恶化，而不是随机波动：把处理单元推到供体凸包之外（例如剔除拟合权重最大的那几个供体）后，空间与时间安慰剂应系统性地给出与真实效应同量级的「效应」。若安慰剂在凸包内外表现一致，那失效原因就不是支撑不足，而是供体与处理单元本来就不共享同一条件关系。",
        "If it holds, credibility should degrade monotonically with hull violation rather than fluctuate randomly: push the treated unit outside the donor hull — by dropping the few donors carrying the largest fitted weights, say — and spatial and temporal placebos should systematically return 'effects' of the same magnitude as the real one. Placebos behaving identically inside and outside the hull would indict a conditional the donors never shared, not missing support.",
      ),
      bi(
        "协变量漂移之所以可以靠重加权补救，前提是两域共用同一个 P(y|x)，且源域样本还能再采。这里两条都断：保护区常常正因溢出效应才设立，处理会漏进供体池，供体便不再是「未处理条件」下的抽样——这是干扰破坏了条件关系，不是边缘分布移动，重加权在定义上就补不回来；而供体池是地球上固定且有限的真实地点，凸包不够大时你无法像机器学习那样再去采一批源域数据把支撑补齐。此外遥感植被代理与地面生物多样性是两个不同的 y，权重在其中一个上拟合得好，不保证另一个的条件关系同样不变。",
        "Covariate shift is repairable by reweighting only because the two domains share one P(y|x) and because more source samples can be drawn. Both fail here. Protected areas are often established precisely for their spillovers, so the treatment leaks into the donor pool and donors are no longer draws from the untreated conditional — that is interference breaking the conditional, not a marginal moving, and reweighting cannot compensate by construction. And the donor pool is a fixed, finite set of real places on Earth: when the hull is too small you cannot go and collect more source data the way machine learning can. Finally, remotely sensed vegetation and ground biodiversity are two different y's, so weights that fit one give no guarantee that the conditional is equally invariant for the other.",
      ),
      ["https://doi.org/10.1016/j.cub.2024.07.031", "https://doi.org/10.1111/cobi.14150"],
    ),
    mapping(
      "item-response-theory-transplanted-ai",
      [
        correspondence(
          "被假定不变的条件关系 P(y|x)",
          "the conditional P(y|x) assumed to stay fixed",
          "由题目难度与区分度参数定义的作答函数：给定潜在能力 θ，答对某题的概率。岛的基底自己把这一条写成「参数不变性」，并列为能力估计成立的三条前提之一。",
          "The item-response function defined by an item's difficulty and discrimination parameters — the probability of answering that item correctly given latent ability θ. The island's own text calls this 'parameter invariance' and lists it as one of the three premises the ability estimate rests on.",
        ),
        correspondence(
          "判定「变的到底是 P(x) 还是 P(y|x)」的检验",
          "the test that decides whether it was P(x) or P(y|x) that moved",
          "差异项目功能分析（DIF）：它要分开的正是「某类模型确实更弱」（能力分布移动、条件不变）与「该题对某类模型不公」（同一 θ 下作答概率变了，即条件本身变了）。",
          "Differential item functioning: it exists precisely to separate 'this model family really is weaker' (the ability distribution moved, the conditional held) from 'this item is unfair to that family' (the response probability changed at the same θ — the conditional itself moved).",
        ),
      ],
      bi(
        "若这成立，题目参数应在模型群体换代时保持稳定，只让 θ 的分布移动：用 2023 年那批模型拟合出的难度与区分度，去预测 2025 年新模型群的逐题作答率，误差应落在标准误之内。若出现系统性偏移，且偏移量与提示模板或评分器的更换同向，那就是条件本身漂了（概念漂移）——此时重加权与自适应选题都救不回能力排序，而不是新模型「确实更强」。",
        "If it holds, item parameters should stay put across model generations while only the θ distribution moves: difficulty and discrimination fitted on a 2023 model population should predict per-item pass rates for a 2025 population inside their standard errors. A systematic offset that tracks a change of prompt template or grader indicts the conditional itself — concept drift — and then neither reweighting nor adaptive item selection restores the ability ranking, and the new models are not simply 'stronger'.",
      ),
      bi(
        "心理测量的不变性成立于一个前提：考生既不能改写题目，也不能事先读到题库。AI 评测里训练污染把题目搬进了考生内部，同一道题对见过它的模型已不是同一道题——这不是 P(x) 移动，而是 x 与 y 的联合被污染，重加权在定义上无从补偿。θ 的单维性在这里也比在人身上更可疑：同一模型的能力随提示模板变化，意味着「考生」不是一个点而是一个分布。而自适应选题省下的成本恰好是尾部风险题，也就是先扔掉最可能暴露额外维度的那些题。",
        "Psychometric invariance holds under the premise that examinees can neither rewrite the items nor read the bank beforehand. In AI evaluation, training contamination moves the items inside the examinee: an item a model has already seen is no longer the same item, which is not P(x) moving but the joint of x and y being contaminated, and reweighting cannot compensate by definition. Unidimensionality of θ is shakier here than in people, too — one model's measured ability shifts with the prompt template, so the 'examinee' is a distribution rather than a point. And the cost that adaptive selection saves is precisely the tail-risk items, that is, the items most likely to expose the extra dimensions.",
      ),
      ["https://doi.org/10.1038/s41746-026-02671-w", "https://doi.org/10.1007/s10994-025-06873-3"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/error-correcting-redundancy",
    mappings: [
    mapping(
      "transversal-gate-algorithmic-fault-tolerance-logical-qubit",
      [
        correspondence(
          "最小距离 d 与可纠错误数 t（d ≥ 2t+1）",
          "minimum distance d and the correctable-error count t (d >= 2t+1)",
          "岛上明写的码参数本身：距离 3 的 [[7,1,3]] 与 [[15,1,3]]（每块纠一个物理错误）、距离 4 的高码率 [[16,6,4]]；四轮表征里「2.14× 低于阈值」就是这条不等式在中性原子噪声模型下取到的值。",
          "the code parameters the island itself names: the distance-3 [[7,1,3]] and [[15,1,3]] (one physical error corrected per block) and the distance-4 high-rate [[16,6,4]]; the '2.14x below threshold' figure from its four-round characterization is that same inequality evaluated under a neutral-atom noise model.",
        ),
        correspondence(
          "码率 k/n，即为可靠性付出的冗余开销",
          "code rate k/n — the redundancy paid out to buy reliability",
          "至多 448 个中性原子里每个逻辑比特要占掉多少个物理原子，以及岛上直接点名的取舍：在 [[7,1,3]] 与高码率 [[16,6,4]] 之间「用码率换可达线路深度」。",
          "how many of the up-to-448 neutral atoms each logical qubit consumes, and the trade the island states outright — code rate against reachable circuit depth, [[7,1,3]] versus the high-rate [[16,6,4]].",
        ),
      ],
      bi(
        "若可靠性真是被最小距离买来的、与算法结构无关，那么在同一原子阵列、同一物理错误率下，把同一段线路从距离 3 的码换到距离 4 的码，每轮逻辑错误率的下降幅度应只由 d 决定而与码族无关；并且一旦物理错误率越过阈值，这个排序必须整体反转——距离更大的码反而更差。任一条不成立，说明真正在起作用的是解码器而不是距离。",
        "If reliability really is bought by minimum distance and is indifferent to algorithm structure, then on the same atom array at the same physical error rate, moving one circuit from a distance-3 code to a distance-4 code should drop the per-round logical error rate by an amount fixed by d alone, independent of code family; and once the physical error rate crosses threshold the ordering must invert wholesale, the larger-distance code becoming the worse one. If either fails, what is doing the work is the decoder, not the distance.",
      ),
      bi(
        "断点是岛自己点名的两处。其一，横向门让错误在多个逻辑比特之间相关，而 d ≥ 2t+1 数的是固定码长内独立同分布的符号错误——当纠错粒度从「每个逻辑门后一轮」放大到「整段算法」、解码复杂度随线路深度增长时，最小距离已不能单独给出可纠错误数的保证。其二，原子丢失是离开码空间的泄漏，不是码位上的翻转，必须先由单独的丢失探测把它转成位置已知的擦除，才谈得上进这条不等式。忽略这两点，最小距离就从可算的预算退化成口号。",
        "The breaking points are the two the island names itself. First, transversal gates correlate errors across logical qubits, whereas d >= 2t+1 counts i.i.d. symbol errors inside a fixed block length — once correction is coarsened from one round per logical gate to the scale of the whole algorithm and decoding complexity grows with circuit depth, distance alone no longer bounds the correctable errors. Second, atom loss is leakage out of the code space, not a flip on a code position; a separate loss detector must first convert it into an erasure of known location before it enters the inequality at all. Ignore either and minimum distance stops being a computable budget and becomes a slogan.",
      ),
      ["https://www.nature.com/articles/s41586-025-09848-5", "https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.133.240602"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/extreme-value-theory",
    mappings: [
    mapping(
      "climate-attribution-extreme-event-science",
      [
        correspondence(
          "n 个独立样本的极大值 maxᵢ Xᵢ",
          "the maximum over n independent samples, maxᵢ Xᵢ",
          "大样本模式集合中每个成员在给定气候下模拟出的该类事件强度极值：真实历史只提供一次事件（岛上明说样本量本质是一），n 由集合成员补上。",
          "The event-intensity maximum simulated by each member of the large model ensemble under a given climate: history supplies exactly one event — the island says outright that the sample size is one — and n is supplied by the ensemble members.",
        ),
        correspondence(
          "极值律的尾分位（重现期 = 超越概率的倒数）",
          "a tail quantile of the limit law — a return period is the reciprocal of an exceedance probability",
          "岛上的核心操作是比较同一事件在「有／无人为变暖」两个反事实世界里的重现期，归因结论就是这两个尾分位之比。",
          "The island's core operation is comparing the same event's return period between the two counterfactual worlds, with and without anthropogenic warming; the attribution verdict is the ratio of those two tail quantiles.",
        ),
      ],
      bi(
        "若这成立，归因比值应对阈值的选择不敏感：只要阈值取得足够高、已进入极值律的渐近区，再抬高一档阈值，拟合出的归因比值应稳定在同一置信区间内。若归因比值随阈值单调漂移而不收敛，说明拟合的还不是尾部的普适律，而是分布中段的模式差异。",
        "If it holds, the attribution ratio should be insensitive to the choice of threshold: once the threshold is high enough to sit in the asymptotic regime of the limit law, raising it one notch further should leave the fitted ratio inside the same confidence interval. A ratio that drifts monotonically with threshold instead of converging shows the fit is not touching the universal tail at all, only model differences in the bulk of the distribution.",
      ),
      bi(
        "极值定理要求样本独立同分布且存在 n→∞ 的渐近极限，气候归因两头都不满足：集合成员共用模式结构与物理参数化，彼此并不独立；而「人为变暖」的含义恰恰是母分布本身在移动，不存在定常的母分布可取极限。更硬的一条是岛自己点出的——事件定义、区域与阈值每换一次，就等于换了一次取极大的区块，重现期随之移动，而这个自由度完全在极值理论管辖之外，正是置信区间宽到可被诉讼双方各取所需的原因。",
        "The extreme-value theorem needs i.i.d. samples and an n→∞ asymptotic limit, and climate attribution satisfies neither: ensemble members share model structure and physical parameterisations, so they are not independent, and 'anthropogenic warming' means precisely that the parent distribution is itself moving, so no stationary parent exists to take a limit of. The harder point is the one the island itself raises — every change of event definition, region, or threshold redefines the block over which the maximum is taken, moving the return period. That degree of freedom lies entirely outside the theorem's reach, and it is exactly why the intervals stay wide enough for both litigants to quote.",
      ),
      ["https://www.annualreviews.org/content/journals/10.1146/annurev-environ-112621-083538", "https://link.springer.com/article/10.1007/s10584-021-03071-7"],
    ),
    mapping(
      "multistable-programming-origami-kirigami-structures",
      [
        correspondence(
          "最弱环节：n 个单元中的极小值 minᵢ Xᵢ（三型中的 Weibull 支）",
          "the weakest link: the minimum over n units, minᵢ Xᵢ — the Weibull branch of the three families",
          "一块折纸／剪纸结构由 n 条折痕与切口组成，每条折痕自己的疲劳寿命被制造公差拉成一个分布；岛上问的「同一构型能被切换多少次仍复现」，由最先失效的那条折痕决定，而不是由平均折痕决定。",
          "One origami or kirigami structure is made of n creases and cuts, each crease carrying its own fatigue life spread into a distribution by manufacturing tolerance; the island's question — how many switching cycles a configuration still reproduces — is settled by the first crease to fail, not by the average crease.",
        ),
        correspondence(
          "归一化常数 aₙ, bₙ 对样本量 n 的依赖",
          "the dependence of the normalising constants aₙ, bₙ on sample size n",
          "岛上与折痕疲劳、制造公差并列点名的「尺度效应」：同一折法放大、折痕数变多，可复现的循环数就往下掉——这正是极小值分布随 n 左移。",
          "The 'scale effect' the island names alongside crease fatigue and manufacturing tolerance: scale one pattern up, add creases, and the reproducible cycle count falls — the minimum's distribution shifting left as n grows.",
        ),
      ],
      bi(
        "若这成立，把同一折法按单元数放大，循环寿命的中位数应随 n 呈幂律下降（log 寿命对 log n 近似成直线），而不是与 n 无关；且不同批次的寿命数据在 Weibull 坐标下应落在同一斜率上（同一形状参数），批次间的制造差异只应平移尺度参数。若不同批次给出明显不同的斜率，这条对应就不成立。",
        "If it holds, scaling one pattern up in unit count should drive the median cycle life down as a power law — log life roughly linear in log n — rather than leaving it independent of n; and lifetime data from different production batches should fall on one slope in Weibull coordinates, that is, share a shape parameter, with batch-to-batch manufacturing differences only translating the scale parameter. Clearly different slopes across batches would break the correspondence.",
      ),
      bi(
        "折痕不是独立抽样：同一折法内的折痕通过刚性板与顶点条件运动学耦合，一条折痕软化会把载荷重新分配给邻居，而不是各自独立地耗尽寿命；耦合一强，最弱环节律就失效。更根本的一点是，岛上关心的失效是「状态还能否复现」——刚度与泊松比的连续漂移，而不是一次断裂事件；连续退化没有明确的极小值可取，三型极值律在那里根本没有定义域。",
        "Creases are not independent draws: within one pattern they are kinematically coupled through rigid panels and vertex conditions, so a softening crease redistributes load to its neighbours rather than exhausting its life on its own — and once that coupling is strong the weakest-link law fails. More fundamentally, the failure the island cares about is whether a state still reproduces, a continuous drift in stiffness and Poisson's ratio, not a single rupture event. Continuous degradation offers no well-defined minimum to take, and the three-family law has no domain there at all.",
      ),
      ["https://doi.org/10.1038/s41467-023-42323-1", "https://doi.org/10.1016/j.jmps.2023.105237"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/fisher-precision-limit",
    mappings: [
    mapping(
      "transcranial-acoustoelectric-brain-imaging-tabi",
      [
        correspondence(
          "费雪信息 I(θ) 里的灵敏度导数 ∂μ/∂θ 与噪声方差 σ²（高斯情形 I = (∂μ/∂θ)²/σ²）",
          "the sensitivity derivative ∂μ/∂θ and the noise variance σ² inside Fisher information (Gaussian case I = (∂μ/∂θ)²/σ²)",
          "声电耦合系数（再乘上跨颅骨衰减）就是「焦点处每单位神经电流能在头皮换来多少声电信号」的那个导数；σ² 是与超声脉冲锁相的窄带提取之后仍留在电极上的 EEG 背景",
          "the acoustoelectric coupling coefficient, times transcranial attenuation, IS the derivative 'how much scalp acousto-electric signal one unit of focal neural current buys'; σ² is the EEG background still sitting on the electrodes after phase-locked narrowband extraction",
        ),
        correspondence(
          "克拉默-拉奥下界 Var(θ̂) ≥ σ²/(N·K²)",
          "the Cramér–Rao bound Var(θ̂) ≥ σ²/(N·K²)",
          "在含颅骨头模里用已知电流源标定出的那条灵敏度与定位误差的绝对刻度——岛自己说信噪比是硬瓶颈，即这条地板由物理给定，不是工艺问题",
          "the absolute sensitivity-and-localization-error scale calibrated with known current sources in the skull-bearing phantom — the island itself calls signal-to-noise the hard bottleneck, i.e. this floor is set by physics, not by craft",
        ),
      ],
      bi(
        "若这成立，头模里已知电流源的幅度与定位误差应只随平均时间的平方根下降，并与耦合系数成反比：耦合系数减半（更厚颅骨或更低声压）需要约四倍平均时间才守得住同一误差。若误差在某个与耦合系数无关的水平上早早停住，这条映射就错了。",
        "If it holds, the amplitude and localization error on a known phantom current source should fall only as the square root of averaging time and scale inversely with the coupling coefficient: halving that coefficient (thicker skull, lower pressure) should cost about four times the averaging to hold the same error. If the error instead plateaus early at a level independent of the coupling coefficient, the mapping is wrong.",
      ),
      bi(
        "克拉默-拉奥界只在前向模型正确时封顶方差。颅骨像差移动并畸变超声焦点本身，测到的已不是原来那一点的电流——那是定位偏差，不是噪声，再长的平均、再窄的锁相都消不掉。清醒活体的背景也不是平稳高斯噪声，此时根本不存在单一的 I(θ) 可以取倒数。",
        "The Cramér–Rao bound caps variance only when the forward model is correct. Skull aberration displaces and distorts the ultrasound focus itself, so what is measured is no longer the current at the intended point — a localization bias, not noise, and neither longer averaging nor tighter phase-locking removes it. In an awake living subject the background is also not stationary Gaussian, so there is no single I(θ) to invert.",
      ),
      ["https://ieeexplore.ieee.org/document/10803963/", "https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2022.807376/full"],
    ),
    mapping(
      "one-week-automated-genome-wide-optical-pooled",
      [
        correspondence(
          "单次测量的费雪信息 I₁(θ) 与样本量 n，合成 Var(θ̂) ≥ 1/(n·I₁)",
          "the per-measurement Fisher information I₁(θ) and the sample size n, combining into Var(θ̂) ≥ 1/(n·I₁)",
          "n 是每基因约 224 个细胞；I₁ 是一个细胞的 Cell Painting 图像连同其原位条形码读出，对该基因敲除效应携带的信息——条形码检出率直接乘在 I₁ 上",
          "n is the roughly 224 cells per gene; I₁ is what one cell's Cell Painting image plus its in-situ barcode readout carries about that knockout's effect — barcode detection rate multiplies straight into I₁",
        ),
        correspondence(
          "θ̂ 的方差下界（能测多准由数据生成过程封顶）",
          "the variance floor on θ̂ (how well it can be measured, capped by the data-generating process)",
          "岛自己列为必须核对的那件事：每基因 224 个细胞所对应的统计功效",
          "the item the island itself lists as needing an audit: the statistical power implied by 224 cells per gene",
        ),
      ],
      bi(
        "若这成立，重复运行中 320 个基因簇的稳定性应按「每基因细胞数 × 条形码检出率」这一有效样本量排序：有效样本量最低的基因最先掉出所在簇；把机器人节拍再压快、而不提高条形码检出率，簇稳定性不应改善。",
        "If it holds, the stability of the 320 gene clusters across repeat runs should order by effective sample size — cells per gene times barcode detection rate: the genes with the lowest effective n drop out of their cluster first, and pushing the robotic cadence faster without raising barcode detection should not improve cluster stability.",
      ),
      bi(
        "这条界只封顶「无偏、独立样本、单个标量参数」。这里 224 个细胞共享孔位、成像视场与批次，并不独立，有效 n 小于 224；而下游真正要判的是一条高维形态谱能否聚成真簇，不是一个 θ，没有单一的 1/I 封得住它。更要命的是条形码错配换掉的是标签本身——那是偏差，污染的是被估的量，不只是它的散布。",
        "The bound caps only an unbiased estimate of a single scalar parameter from independent samples. Here the 224 cells per gene share a well, an imaging field and a batch, so they are not independent and the effective n is below 224; and what is judged downstream is whether a high-dimensional morphological profile forms a real cluster, not one θ, which no single 1/I can cap. Worse, a misassigned barcode swaps the label itself — a bias that corrupts the estimand, not merely its spread.",
      ),
      ["https://pubmed.ncbi.nlm.nih.gov/35022620/", "https://www.biorxiv.org/content/10.64898/2026.04.15.718742v1.full"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/gauge-equivariance",
    mappings: [
    mapping(
      "momentum-bandgap-topology-k-gap-amplification-photonic",
      [
        correspondence(
          "局域相位自由度 ⇒ 被逼出的规范联络 Aμ",
          "the local phase freedom ⇒ the gauge connection Aμ it forces into existence",
          "每个波矢处的 Floquet–Bloch 本征态相位都可以独立重定；要求可观测量不依赖这个任意选择，就逼出一条贝里联络——岛上用来定义时域拓扑态的 Zak 相位，正是这条联络沿带的和乐。",
          "The phase of the Floquet–Bloch eigenstate may be redefined independently at every wavevector; demanding that observables not depend on that arbitrary choice forces a Berry connection — and the Zak phase this island uses to define its temporal topological state is precisely that connection's holonomy across the band.",
        ),
        correspondence(
          "只有规范不变量可观测：能测的是和乐，不是联络本身",
          "only the gauge invariant is observable: the holonomy can be measured, the connection itself cannot",
          "Zak 相位把两块时间晶体判为拓扑相异，而岛上真正要测的量，是分隔它们的时间界面上时间反射与时间折射之间的相位差。",
          "The Zak phase is what marks two time crystals as topologically distinct, and the quantity the island actually proposes to measure is the phase difference between time reflection and time refraction at the temporal interface separating them.",
        ),
      ],
      bi(
        "若这成立，时间界面上反射—折射的相位差应只由两侧 Zak 相位之差决定，而与调制波形形状、调制深度以及 k 隙内的放大倍率无关：只要调制的改变不经过带隙闭合，这个相位差就不该动；一旦看到它随调制深度连续漂移，这条对应就被证伪。",
        "If it holds, the reflection–refraction phase difference at a temporal interface should be fixed by the difference of Zak phases on the two sides alone — independent of modulation waveform, modulation depth, and the amplification factor inside the k-gap. So long as a change in modulation does not close the gap, that phase difference must not move; watching it drift continuously with modulation depth would falsify the correspondence.",
      ),
      bi(
        "这里的规范自由度只是能带上的相位约定，不是时空中的动力学场：贝里联络不传播、不携带能量、没有荷与它耦合，也不会像 Aμ 那样生出一种新的相互作用。它还活在动量空间而非时空，而 k 隙内的指数放大来自调制泵入的能量，与规范原理无关。把这条对应读成「光子时间晶体里存在一个规范场」，就越过了边界。",
        "The gauge freedom here is only a phase convention over the band structure, not a dynamical field in spacetime: the Berry connection does not propagate, carries no energy, has no charge coupled to it, and generates no new interaction the way Aμ does. It also lives over momentum space rather than spacetime, and the exponential amplification inside the k-gap draws its energy from the modulation, which the gauge principle has nothing to do with. Reading this as 'a photonic time crystal contains a gauge field' crosses the line.",
      ),
      ["https://www.nature.com/articles/s41467-025-66154-4", "https://www.nature.com/articles/s41467-025-56021-7"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/graph-laplacian-spectrum",
    mappings: [
    mapping(
      "connectomics-whole-brain-atlases",
      [
        correspondence(
          "邻接矩阵 A 与度矩阵 D",
          "the adjacency matrix A and the degree matrix D",
          "电镜逐条重建出的突触连接线路图本身就是 A，每个神经元的突触计数就是 D 的对角元；这座岛的产出物不是「像一张图」，它交付的就是这个矩阵",
          "the wiring diagram reconstructed synapse by synapse from electron microscopy is A itself, and each neuron's synapse count is a diagonal entry of D; this island's deliverable is not 'something graph-like' — it is that matrix",
        ),
        correspondence(
          "Fiedler 向量给出的谱划分",
          "the spectral partition carried by the Fiedler vector",
          "岛上明写的那条路径——「对果蝇全脑连接组做网络统计，找出跨物种可比的模体与层级结构」——所要找的层级划分",
          "the hierarchical partition sought by the island's own stated approach: computing network statistics over the fly whole-brain connectome to extract motifs and hierarchy comparable across species",
        ),
      ],
      bi(
        "若这成立，从果蝇全脑连接组的 L=D−A 谱做低维嵌入所得的划分，应当与钙成像/电生理对齐时读出的功能分区显著重合；而且校对错误若只是随机的单点误连，λ₂ 与前若干特征向量应对少量随机加边保持稳健——也就是说，在同一份数据的两个校对版本上重算谱划分应给出几乎相同的分区。",
        "If it holds, the partition obtained from a low-dimensional embedding of L = D − A on the fly whole-brain connectome should overlap significantly with the functional divisions read out when the diagram is aligned to calcium imaging and electrophysiology; and if proofreading errors are merely random single-point mis-edges, λ₂ and the leading eigenvectors should be robust to a small number of random added edges — recomputing the spectral partition on two proofreading versions of the same dataset should give nearly the same partition.",
      ),
      bi(
        "L=D−A 要求边是无向、非负加权的。连接组的边有方向，且这座岛自己点名的壁垒是「静态解剖快照不含突触强度与可塑性」——权重与兴奋/抑制符号都缺失。把未加权、未定符号的 A 直接取谱，λ₂ 度量的是解剖图能否被切开，不是这套回路能否同步；一旦把抑制性突触算成正边，Fiedler 切线会落在与功能无关的位置。另外人脑量级下自动重建的单点错误会沿路径累积成错误环路，这类误差不是随机加边，谱的稳健性论证在那里失效。",
        "L = D − A presumes undirected, non-negatively weighted edges. Connectome edges are directed, and the island names its own barrier: a static anatomical snapshot carries no synaptic weights or plasticity — both magnitude and excitatory/inhibitory sign are missing. Take the spectrum of an unweighted, unsigned A and λ₂ measures whether the anatomical drawing can be cut, not whether the circuit can synchronise; count an inhibitory synapse as a positive edge and the Fiedler cut lands somewhere functionally meaningless. Further, at human scale single-point reconstruction errors accumulate along paths into spurious circuits — that is not random edge addition, and the robustness argument for the spectrum fails there.",
      ),
      ["https://www.nature.com/articles/s41586-024-07558-y", "https://www.nature.com/articles/s41586-024-07968-y"],
    ),
    mapping(
      "topology-state-coevolution-adaptive-networks",
      [
        correspondence(
          "第二小特征值 λ₂（代数连通度），λ₂=0 当且仅当图断成两块",
          "the second-smallest eigenvalue λ₂ (algebraic connectivity), which is zero exactly when the graph falls into two pieces",
          "意见—连边共演化模型里被定位的那个「碎片化」非平衡相变点：网络裂成互不相连的意见团，正是 λ₂ 过零",
          "the nonequilibrium fragmentation transition this island sets out to locate in the opinion–edge coevolution model: the network splitting into mutually disconnected opinion components is exactly λ₂ crossing zero",
        ),
        correspondence(
          "邻接矩阵 A（谱所依赖的那张图）",
          "the adjacency matrix A — the graph the spectrum is taken of",
          "被节点状态重写的连边集合；这座岛的范式动作正是「结构不再是背景，而是与状态互为因果的动力变量」，控制参数是重连率与状态更新率之比",
          "the edge set rewritten by node states; the island's paradigm move is precisely that structure stops being a backdrop and becomes a dynamical variable mutually causal with state, with the rewiring-to-state-update rate ratio as control parameter",
        ),
      ],
      bi(
        "若这成立，沿重连率/状态更新率之比扫描相图时，λ₂ 应在碎片化相变点之前就单调走低并连续趋零，从而先于序参量给出预警；而易感者重连使流行阈值移动的那条曲线，应当能被同一批图的谱量（λ₂ 与 A 的最大特征值）单调解释，而不需要额外引入重连率本身作为自变量。",
        "If it holds, sweeping the phase diagram along the rewiring-to-state-update ratio should show λ₂ falling monotonically and continuously to zero ahead of the fragmentation transition, giving an early warning before the order parameter moves; and the curve along which susceptible rewiring shifts the epidemic threshold should be explainable monotonically by spectral quantities of the same graphs (λ₂ and the leading eigenvalue of A) without reintroducing the rewiring rate itself as a separate regressor.",
      ),
      bi(
        "谱只告诉你「最脆弱的切割线在哪」，前提是删边是与状态无关的。这里重连由同质性驱动——断掉的正是意见不同的那些边，所以实际裂口由状态相似度选出，未必落在裂变前那张图的 Fiedler 切线上。更硬的一条：这座岛的壁垒是隐藏同质性与共同外部驱动能生成同样的「状态改边、边改状态」轨迹；谱量对这两种机制完全同形，λ₂ 的时间序列因此不能用来判别机制，只能用来定位相变。",
        "The spectrum tells you where the weakest cut lies only if edge deletion is independent of state. Here rewiring is homophily-driven — the edges that break are exactly the ones joining unlike opinions — so the actual fissure is chosen by state similarity and need not coincide with the Fiedler cut of the pre-fragmentation graph. Harder still: this island's stated barrier is that hidden homophily and a shared external driver generate the same states-change-edges-change-states trajectory, and spectral quantities are identical under both, so the λ₂ time series can locate the transition but can never discriminate the mechanism.",
      ),
      ["https://doi.org/10.1103/PhysRevLett.96.208701", "https://doi.org/10.1103/PhysRevE.74.056108"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/information-geometry",
    mappings: [
    mapping(
      "geographic-sampling-debt-biodiversity-science",
      [
        correspondence(
          "费雪信息 I(θ)——数据把某个方向钉死的力度，样本量线性地放大它",
          "Fisher information I(θ) — how hard the data pins a direction, scaled linearly by the number of observations",
          "每个网格与类群上的实际采集努力：岛上用道路距离、经费和数字化历史当协变量去建模的那个 effort 分量。努力为零的格子上，物种分布参数没有任何一条记录去约束",
          "the actual collecting effort per cell and per taxon — the effort component the island models from road distance, funding and digitization history as covariates; in a zero-effort cell not a single record constrains the distribution parameters",
        ),
        correspondence(
          "软方向：参数大幅变动而预测几乎不变",
          "sloppy directions — parameters swing far while predictions barely change",
          "地理与类群双重缺失的链接：鸟–植物网络里从没人采过的那些区域，潜变量模型可以给出差别极大的预测，而不与任何一条已有记录冲突",
          "the jointly geographic and taxonomic missing links — the never-sampled parts of the bird–plant networks, where the latent interaction model can output wildly different predictions without contradicting one existing record",
        ),
      ],
      bi(
        "若这成立，把同样数量的新记录投到低努力格子里，对参数估计的移动应显著大于投到已被反复采集的热点里；并且不同偏差校正模型之间的分歧应当集中出现在低努力格子，而不是在地图上均匀铺开。",
        "If it holds, the same number of new records placed in a low-effort cell should move the parameter estimates substantially more than in a repeatedly sampled hotspot, and disagreement between rival bias-correction models should cluster in low-effort cells rather than spread evenly across the map.",
      ),
      bi(
        "费雪几何里的平坦方向只是「信息少」，它各向同性、原则上加数据就能撑硬；采集债不是这样：努力本身与道路、可达性、气候这些同时驱动生态信号的协变量相关，缺口被系统性地摆在特定环境条件上。所以「沿软方向补采样」在这里不只是提高精度，还会移动被估计的量本身——这正是岛上说的「只能在同一个有偏档案里交叉验证」。另外，一个从未被采集、甚至从未被描述的物种，不是流形上的一个平坦方向，而是坐标少了一维，这类无知在费雪度规里根本不出现。",
        "A flat direction in Fisher geometry means only low information: isotropic, and in principle stiffened by more data. Sampling debt is not like that — effort correlates with roads, accessibility and climate, the very covariates that also drive the ecological signal, so the gap sits systematically on particular environmental conditions. Sampling along the 'sloppy direction' therefore does not merely sharpen precision, it can move the estimand itself, which is what the island means by correction models being cross-validatable only inside the same biased archive. And a species never collected, or never described, is not a flat direction on the manifold but a missing coordinate — ignorance of that kind never shows up in the Fisher metric.",
      ),
      ["https://doi.org/10.1093/biosci/biac116", "https://doi.org/10.1080/01621459.2023.2208390"],
    ),
    mapping(
      "auditing-missingness-mechanisms-scientific-data",
      [
        correspondence(
          "度规几乎为零的方向：参数可以大幅移动而似然与预测几乎不变",
          "the near-zero-metric direction: a parameter moves far while likelihood and predictions barely change",
          "MNAR 的敏感性参数。岛上说缺失机制「原则上无法从观测数据识别、拟合好不能证明 MAR 或 MNAR」，这句话的几何内容正是观测数据似然沿这个方向是平的",
          "the MNAR sensitivity parameter. The island states the mechanism is unidentifiable from observed data and that a good fit proves neither MAR nor MNAR — geometrically, exactly the statement that the observed-data likelihood is flat along that direction",
        ),
        correspondence(
          "沿流形移动的距离 ds",
          "arc length ds travelled along the manifold",
          "tipping-point 与最坏情形分析报告的那个量：要偏离假定机制多远，结论才翻转——它把「盲区有多大」从一个插补点估计变成一个可报告的区间",
          "what a tipping-point or worst-case analysis reports: how far one must depart from the assumed mechanism before the conclusion flips — turning 'how big is the blind spot' from a single imputed point estimate into a reportable interval",
        ),
      ],
      bi(
        "若这成立，两个在观测数据上拟合优度相同的插补模型，其结论差异应当完全由沿这条平坦方向的位移解释；于是 tipping-point 距离应可由估计量在该方向上的载荷预测——载荷接近正交的估计量，即使缺失率很高也应稳健，而载荷大的估计量在很低的缺失率下就可能被翻转。",
        "If it holds, two imputation models fitting the observed data equally well should differ in conclusion only through displacement along that flat direction; the tipping-point distance should then be predictable from how much of the estimand loads onto it — an estimand nearly orthogonal to it should stay robust even at a high missingness rate, while a heavily loaded one can flip at a very low rate.",
      ),
      bi(
        "费雪意义上的软方向是「几乎为零」，原则上再多同类数据总能把它撑硬；缺失机制的不可识别是「精确为零」，同一种观测数据无论积累多少都不会给它带来曲率，只有换一种数据（对失访者的追踪、验证子样本、外部登记）才改变几何。所以把 MNAR 敏感性读成「再多采一点就好」恰恰是相反的处方，而这里的 sensitivity interval 也不是后验收缩的结果，而是一整组假设的像——它随假设集合放大或缩小，不随样本量缩小。",
        "A Fisher-sloppy direction is only nearly zero: in principle more of the same data eventually stiffens it. Non-identifiability of a missingness mechanism is exactly zero — no amount of the same observed data ever gives it curvature, and only a different kind of data (follow-up of non-responders, a validation subsample, an external registry) changes the geometry. Reading MNAR sensitivity as 'just collect a bit more' is therefore the opposite of the right prescription, and the sensitivity interval here is the image of a whole set of assumptions, not the product of posterior contraction: it widens or narrows with the assumption set, not with sample size.",
      ),
      ["https://doi.org/10.1080/00273171.2022.2158776", "https://doi.org/10.1093/ije/dyad008"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/nash-equilibrium",
    mappings: [
    mapping(
      "open-data-fair-infrastructure",
      [
        correspondence(
          "u_i——单个参与者自己的收益",
          "u_i — an individual player's own payoff",
          "数据生产者的私人账本：元数据规范、持久标识符与互操作标准的成本全落在他自己身上，而 FAIR 的复用收益落在下游别人身上",
          "the data producer's private ledger: the cost of metadata specifications, persistent identifiers and interoperability standards falls entirely on them, while FAIR's reuse benefit lands on downstream others",
        ),
        correspondence(
          "s*：无人可单方面改善的那个组合",
          "s* — the profile no one can improve on by moving alone",
          "岛自述的稳定状态「标准与元数据长期欠投入」——它被明说成激励错配的后果而非技术上做不到，也就是没有哪个生产者单方面多投入元数据会让自己变好",
          "the island's own stated steady state, chronic underinvestment in standards and metadata — explicitly attributed to incentive misalignment rather than technical infeasibility, i.e. no single producer is made better off by unilaterally investing more",
        ),
      ],
      bi(
        "若这成立，欠投入的深浅应随外部性大小变化而不随技术难度变化：在收益可被内部化的场景（资助方把数据复用与引用直接计入考核，或复用产生可归属的引用）元数据完备度应显著更高；反过来只把工具做得更省事、归因规则不动，投入应基本不变。若一次纯工具性的易用化改造就把完备度拉起来，这个读法被推翻。",
        "If it holds, the depth of underinvestment should track the size of the externality rather than technical difficulty: where the benefit can be internalized — funders counting reuse and citation directly in assessment, or reuse generating attributable citations — metadata completeness should be markedly higher, while making tooling easier without touching attribution rules should barely move it. If a purely ergonomic tooling upgrade alone lifts completeness, the reading is refuted.",
      ),
      bi(
        "断点在于生产者并不真的在算收益：岛只给出成本与收益的落点，没有给出策略集，大量欠投入其实是不知道、没技能、或没人要求，而不是被算出来的最优反应。更硬的一处是资助方与期刊的强制要求本身是一层外部执行者——一旦它存在，这就是机制设计而不是同时行动的博弈，纳什均衡里没有「设计者」这个位置；而且复用是创造价值不是分一个定额，u_i 并不是定义在固定策略组合上的固定收益。",
        "It breaks because the producers are not actually computing payoffs: the island supplies where cost and benefit land but no strategy set, and much underinvestment is unawareness, missing skills, or nobody asking rather than a calculated best response. Harder still, funder and journal mandates are an external enforcement layer — once present this is mechanism design, not a simultaneous-move game, and a Nash equilibrium has no slot for a designer; and reuse creates value rather than dividing a fixed pot, so u_i is not a fixed payoff over a fixed strategy profile.",
      ),
      ["https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9363602/", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9562067/"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/negative-feedback-control",
    mappings: [
    mapping(
      "measuring-physiological-resilience-through-challenge-recovery",
      [
        correspondence(
          "设定点 r 与被压制的偏差 (y − r)",
          "the setpoint r and the deviation (y − r) being suppressed",
          "静息/空腹态就是那 132 个参数各自的设定点；标准混合餐把它们推离静息态所产生的「幅度」，就是 (y − r) 这个偏差本身——PhenFlex 测的是这条偏差曲线，不是设定点的值。",
          "The resting/fasting state is the setpoint of each of the 132 parameters, and the excursion that one standardized mixed meal pushes them into is (y − r) itself — PhenFlex measures that deviation curve, not the value of the setpoint.",
        ),
        correspondence(
          "回路增益 K：偏差被压回去的快慢",
          "loop gain K — how fast the deviation is pushed back",
          "「多快回落」这项恢复速度。健康组与 2 型糖尿病组空腹只差 18 项、餐后差 58 项，正因为增益只在回路被扰动时才显形——一次静态抽血读不出 K。",
          "The recovery speed, 'how fast the return'. Healthy and type-2 diabetic men differ on 18 parameters while fasting but on 58 after the challenge, precisely because a gain only reveals itself when the loop is disturbed — a static blood draw cannot read K.",
        ),
      ],
      bi(
        "若这成立，同一个人身上「幅度」与「恢复时间」就不应互相独立：对同一个被调控量，幅度越大者回落也应越慢（两者同由增益下降驱动），而餐后新增的那 40 项组间差异应集中落在幅度与恢复同时变差的系统上，而不是均匀散布在 132 个参数里。若测出大量「幅度大但回落照常快」的参数，那它的异常来自容量或饱和，而不是回路增益。",
        "If it holds, amplitude and recovery time should not be independent within one person: for the same regulated variable a larger excursion should also return more slowly, both driven by a fall in gain — and the 40 extra between-group differences that appear only after the challenge should concentrate in systems where amplitude and recovery degrade together rather than scatter evenly across the 132 parameters. Many parameters showing a large excursion but a normal-speed return would locate the abnormality in capacity or saturation, not in loop gain.",
      ),
      bi(
        "控制论的 K 是对单一被调控量、单一回路定义的。一份混合餐同时扰动 132 个经共享底物（葡萄糖、胰岛素）互锁的回路，某条曲线回落慢，可能是别的回路把它的设定点挪走了，而不是它自己的增益掉了。更硬的一条：生理回路会饱和，而岛的基底自己写明刺激种类、剂量、基线状态与采样频率任改一项曲线就不可比——这等于说没有与剂量无关的 K 可提取，测到的是「这顿饭下的增益」，不是这个人的增益。把它塌缩成一个跨压力源通用的「韧性分数」，正是越过这条边界的那一步。",
        "Control theory defines K for one regulated variable in one loop. A single mixed meal perturbs 132 parameters whose loops interlock through shared substrates such as glucose and insulin, so a slow-returning curve may be another loop moving this one's setpoint rather than this loop losing gain. Harder still, physiological loops saturate — and the island itself states that changing stressor, dose, baseline state, or sampling frequency makes the curves incomparable, which is to say there is no dose-independent K to extract: what is measured is the gain under this meal, not the person's gain. Collapsing it into one cross-stressor 'resilience score' is exactly the step past this boundary.",
      ),
      ["https://doi.org/10.1093/gerona/glaf056", "https://doi.org/10.1038/s41598-024-82627-w"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/network-cascade",
    mappings: [
    mapping(
      "closed-loop-geothermal-supercritical-co-working",
      [
        correspondence(
          "占据概率 p（可导通通道所占比例）",
          "the occupation probability p — the fraction of channels still conducting",
          "CO₂ 与卤水反应析出碳酸盐矿物之后，储层里仍然开放的裂缝与孔喉所占比例；这座岛把「锁死封存」与「堵死流道」并列成两种难以区分的结局，二者的区别就是这个比例落在阈值哪一侧",
          "the fraction of fractures and pore throats left open after carbonate minerals precipitate from the CO₂–brine reaction; the island itself sets 'locks the storage in' beside 'clogs the flow paths' as two outcomes hard to tell apart, and the difference between them is which side of the threshold that fraction sits on",
        ),
        correspondence(
          "巨连通分量（贯穿整个系统的连通团）",
          "the giant component — the cluster that spans the system",
          "从注入井贯通到采出井、承载 CO₂ 循环取热的那条连通流道网络；它一旦不再贯通，换热面积与功率密度就同时归零",
          "the connected flow-path network running from injection to production well that carries the circulating CO₂ and its heat; the moment it stops spanning, heat-exchange area and power density go to zero together",
        ),
      ],
      bi(
        "若这成立，岩心实验里注入率（或渗透率）不应随析出的碳酸盐体积线性下降，而应在某个临界析出量附近骤降，并在阈值附近呈幂律；换言之，同一岩心多轮 CO₂—卤水循环下，前几轮几乎测不出渗透率损失，随后在很窄的一段析出量内塌掉。若观察到的是平滑的线性衰减，这个映射即被证伪。",
        "If it holds, injectivity (or permeability) in core experiments should not fall linearly with the volume of carbonate precipitated but collapse near a critical precipitated volume, following a power law close to that threshold — that is, over repeated CO₂–brine cycles on one core, the first several cycles should show almost no permeability loss, followed by collapse within a narrow band of precipitation. Observing smooth linear decay falsifies the mapping.",
      ),
      bi(
        "经典渗流要求通道被独立随机地移除。这里析出是反应—输运耦合的：矿物优先长在流速与过饱和度最高的通道上，封堵因此高度相关且自组织，临界指数与随机键渗流不必相同，p_c 也不再是纯几何量。更硬的一条边界是这座岛的另一条路线——真正的闭环回路「不与地层流体交换」，工质走的是工程管道，那里根本没有随机网络，也就没有阈值可言；渗流只对 CO₂-EGS 与 CO₂ 羽流这两条与储层接触的路线成立。",
        "Classical percolation requires channels to be removed independently and at random. Precipitation here is reaction–transport coupled: minerals grow preferentially where flow velocity and supersaturation are highest, so the clogging is strongly correlated and self-organised, the critical exponents need not match random bond percolation, and p_c stops being a purely geometric quantity. The harder boundary is the island's other route — a genuinely closed loop exchanges no formation fluid, the working fluid stays inside engineered pipe, there is no random network there and hence no threshold at all; percolation applies only to the two reservoir-contacting routes, CO₂-EGS and CO₂-plume geothermal.",
      ),
      ["https://www.powermag.com/eavors-first-of-its-kind-closed-loop-geothermal-project-produces-grid-power-in-germany/", "https://www.mdpi.com/1996-1073/17/21/5415"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/open-set-recognition",
    mappings: [
    mapping(
      "crowdsourced-anomalies-letting-public-catch",
      [
        correspondence(
          "开放空间风险 R_open——把未知当成已知的代价",
          "open-space risk R_open — the cost of calling an unknown a known",
          "先用已知天体目录与仪器伪影模板过滤候选的那一步：一个从未被编目过的天体只要碰巧落进某条目录条目或某张模板的匹配范围，就会和绝大多数假阳性一起被清掉",
          "the pre-filter against known-object catalogues and instrument-artifact templates: an uncatalogued object that happens to fall inside a catalogue entry's or a template's match window is swept away together with the bulk of false positives",
        ),
        correspondence(
          "λ——为拒识区宽度所付的单位代价",
          "λ — the price paid per unit of width of the reject region",
          "志愿者注意力：拒识区在这里就是被排到人眼前的那条候选队列，而基质自己说这是「无法按需生产的稀缺资源」，且排歪了没有第二次机会",
          "volunteer attention: the reject region here is literally the queue of candidates put in front of human eyes, which the substrate itself calls a scarce resource that cannot be produced on demand, with a skewed ranking getting no second chance",
        ),
      ],
      bi(
        "若这成立，收紧已知天体目录的匹配阈值（等于收窄拒识区）后，真正未编目天体的发现数应比仪器伪影数下降得更快；而个性化主动学习若真是在校准拒识边界、而不只是在给已知类排序，同样的志愿者工时应换来更高的每小时新奇命中数。",
        "If it holds, tightening the known-object catalogue's match threshold — that is, narrowing the reject region — should cut genuinely uncatalogued discoveries faster than it cuts instrument artifacts; and if personalized active learning is really calibrating the reject boundary rather than merely ranking known classes, the same volunteer hours should buy a higher novelty hit-rate per hour.",
      ),
      bi(
        "开放集识别假设未知落在已知类边界之外，而这里的表征就是一张图像加一双人眼：只在光谱、时序或偏振维度上「怪」的东西，拒识区开得再宽也进不来。更要紧的是，这条基质的拒识区绝大部分装的是仪器伪影这个已知讨厌类，不是形式化设定里假定的新类——所以 R_open 在这里被伪影主导，不能当成新奇度的代理来读。",
        "Open-set recognition assumes the unknown falls outside known-class boundaries in the chosen representation, and the representation here is one image plus a pair of human eyes: anything anomalous only in the spectral, temporal or polarization dimension never enters the reject region however wide it is opened. More importantly, most of this reject region holds instrument artifacts — a known nuisance class, not the novel class the formalism presumes — so R_open here is artifact-dominated and cannot be read as a proxy for novelty.",
      ),
      ["https://theoryandpractice.citizenscienceassociation.org/articles/10.5334/cstp.740", "https://arxiv.org/abs/2010.11202"],
    ),
    mapping(
      "rare-cell-state-discovery-single-cell-omics",
      [
        correspondence(
          "封闭集分类器把未知强行塞进最近的已知标签",
          "a closed-set classifier cramming the unknown into its nearest known label",
          "聚类本身：稀有状态的那几十个细胞被聚类分辨率吞进大簇、当作噪声；RaceID 与 scCAD 先拆开大簇、再在簇内找离群点，做的正是在已知类内部挖出一个拒识区",
          "clustering itself: the few dozen cells of a rare state are swallowed into a large cluster by clustering resolution and written off as noise, which is why RaceID and scCAD first decompose the large cluster and hunt outliers inside it — carving a reject region within a known class",
        ),
        correspondence(
          "λ·R_open——放宽拒识区必须付的那部分代价",
          "λ·R_open — what widening the reject region necessarily costs",
          "基质明说「稀有与伪影共用同一种数据特征：低丰度、离群、细胞支持薄」，所以离群阈值每松一格，收进来的双胞体与环境 RNA 也同步增加",
          "the substrate states outright that rarity and artifact share one data signature — low abundance, outlying, thin cell support — so every notch the outlier threshold is loosened admits proportionally more doublets and ambient RNA",
        ),
      ],
      bi(
        "若这成立，把离群阈值当作校准过的拒识阈值来扫描，被拒识细胞里经 smFISH 与免疫荧光原位确认为真实亚群的比例，应随阈值单调变化并出现一个可复现的拐点；且该拐点位置在独立供体与新鲜样本之间，应比任何固定的聚类分辨率更稳定。",
        "If it holds, sweeping the outlier threshold as a calibrated reject threshold should make the fraction of rejected cells confirmed in situ by single-molecule FISH and immunofluorescence vary monotonically and show a reproducible knee — and that knee should sit more stably across independent donors and fresh samples than any fixed clustering resolution does.",
      ),
      bi(
        "开放集里的「未知类」由特征空间中的分布外性定义，而这里区分真稀有态与伪影靠的是原位证据：基质明确说算法基准多跑在已标注或人工掺入的数据上，替代不了新鲜样本与 in situ 确认。也就是说拒识只生成候选，判定权在显微镜那一端；而一个在所用表征下与大簇重合的真稀有态（例如只在蛋白层面不同），任何阈值都拒不出来。",
        "In open-set recognition the unknown class is defined by out-of-distribution geometry in feature space, whereas telling a real rare state from an artifact here rests on in-situ evidence: the substrate says explicitly that algorithm benchmarks run mostly on annotated or artificially spiked data and cannot substitute for fresh samples and in-situ confirmation. The reject rule therefore only produces candidates and adjudication sits at the microscope — and a genuinely rare state that coincides with the large cluster under the chosen representation, differing only at the protein level say, is rejected out by no threshold at all.",
      ),
      ["https://doi.org/10.1038/s41467-024-51891-9", "https://doi.org/10.1038/nature14966"],
    ),
    mapping(
      "injected-signal-benchmarks-scientific-anomaly-detection",
      [
        correspondence(
          "R_empirical——只能在已知类上被估计的那一项",
          "R_empirical — the term that can only be estimated on known classes",
          "注入信号测出的召回率与选择函数：PTF 往真实图像里插入约七百万个人造点源，把回收效率拟合成星等、宿主背景与观测条件的函数",
          "the recall and selection function measured from injections: the Palomar Transient Factory inserted about seven million artificial point sources into real images and fitted recovery efficiency against magnitude, host background and observing conditions",
        ),
        correspondence(
          "λ·R_open——开放空间风险，经验风险估不出的那一项",
          "λ·R_open — open-space risk, the term no empirical risk can estimate",
          "基质自己的判词：注入只能覆盖研究者写得出来的信号族；一旦仿真器、波形或点扩散函数比现实干净，召回率就被系统性高估，而同一次注入无法诊断自己的偏差",
          "the substrate's own verdict: injection only measures signal families a researcher can write down, and once the simulator, waveform or point-spread function is cleaner than reality, recall is systematically overestimated — with the same injection unable to diagnose its own bias",
        ),
      ],
      bi(
        "若这成立，把某一个波形族有意留出（不注入、不训练），检测器在该留出族上的召回应显著低于同注入信噪比下的族内召回，且落差随留出族与注入族在所用表征上的距离单调增大；若落差始终不出现，说明该检测器学到的并不是一条闭合的已知类边界。",
        "If it holds, deliberately holding one waveform family out of the injection and training set should make the detector's recall on that family fall markedly below its within-family recall at matched injected signal-to-noise, with the gap growing monotonically in representation distance between held-out and injected families. A gap that never appears would mean the detector is not learning a closed known-class boundary at all.",
      ),
      bi(
        "开放集识别里 R_open 至少还是同一个目标函数中可被正则化作用的一项；在这条基质里它连样本都拿不到——盲盒里藏的信号仍然是人写下来的，硬件注入也只是把已知波形物理地推进探测链。所以这里能被工程化的始终只有 R_empirical，「对没见过的现象的灵敏度」是被外推的、不是被测量的；把注入召回当作开放集性能的替代，正是基质点名的那种系统性高估。",
        "In open-set recognition R_open is at least a term in the same objective that regularization can act on; in this substrate it has no samples at all — the signal hidden inside a black box is still one a person wrote down, and hardware injection only pushes a known waveform physically through the detection chain. Only R_empirical is ever engineerable here, so sensitivity to phenomena never seen before is extrapolated rather than measured, and treating injection recall as a stand-in for open-set performance is exactly the systematic overestimate the substrate names.",
      ),
      ["https://doi.org/10.1103/PhysRevD.95.062002", "https://doi.org/10.1088/1361-6633/ac36b9"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/optimal-stopping",
    mappings: [
    mapping(
      "calibrated-autonomy-human-handoff-self-driving",
      [
        correspondence(
          "只观察、不落子的前缀（秘书问题里被主动放弃的前 n/e 个）",
          "the observe-only prefix (the first n/e, deliberately passed over in the secretary problem)",
          "共形预测的校准集：先在 AFMBench 这类真机任务组上跑一段，这一段只用来测步骤级偏离率与置信度–错误率校准曲线，不触发任何交接",
          "the conformal-prediction calibration set: a stretch of runs on a real-instrument task suite such as AFMBench used only to measure step-wise instruction-deviation rates and the confidence-versus-error curve, never to trigger a handoff",
        ),
        correspondence(
          "阈值一旦被越过就立刻停止并落子",
          "the threshold — stop and commit the instant it is crossed",
          "learning-to-defer 的拒答阈值：机器只跑自己担得起的步骤，估计错误率一越过这条线就当场把方向盘交给专家，且这一步在真仪器上不可撤销",
          "the learning-to-defer rejector's threshold: the machine runs the steps it can answer for and hands the wheel to an expert the moment its estimated error crosses the line — a step that, on a real instrument, cannot be taken back",
        ),
      ],
      bi(
        "若「先用一段前缀纯学习、再按阈值即时行动」这个结构成立，交接质量对校准段长度应呈单峰依赖：把校准段压到远短于任务组长度的某个比例以下，交接表现应可测地变差；而把它拉得过长，被白白让掉的可自动步骤又会拖垮总体。换句话说存在一个非零最优前缀比例，且它随任务组长度缩放，而不是一个调出来的常数。若在 AFMBench 上交接表现只随校准样本单调改善，这个映射即被证伪。",
        "If the prefix-then-threshold structure holds, handoff quality should depend on calibration-set length in a single-peaked way: shrink the calibration stretch below some fraction of the suite's length and deferral performance should degrade measurably, while stretching it too long wastes steps the machine could have run itself. That is, a nonzero optimal prefix fraction exists and scales with suite length rather than being a tuned constant. If handoff performance on AFMBench instead improves monotonically with calibration samples, the mapping is falsified.",
      ),
      bi(
        "秘书问题最优的前提有三条：序列长度 n 已知、只落一次子且不可回头、只做序数比较——它压根不需要一个价值模型。自驱实验室的交接是长度未知的流上反复发生的决策，而且阈值完全建立在模型对自己出错概率的自估上；岛上的障碍恰恰说这个自估在提示词微调下就不稳。校准一漂，1/e 式的保证没有立足点，而秘书界限本来是与分布无关的——这正是两者不能划等号的地方。",
        "The secretary rule is optimal under three premises: the sequence length n is known, exactly one irrevocable pick is made with no recall, and comparison is purely ordinal — it needs no model of value at all. A self-driving lab's handoff is a decision that recurs on a stream of unknown length, and its threshold rests entirely on the model's own estimate of how likely it is to err, which the island's barrier says is unstable under small prompt changes. Once calibration drifts, a 1/e-style guarantee has nothing to stand on, whereas the secretary bound is distribution-free by construction — that is exactly where the two stop being the same thing.",
      ),
      ["https://doi.org/10.1038/s41467-025-64105-7", "https://openreview.net/pdf?id=SZQJ8K2DUe"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/recursive-bayesian-filter",
    mappings: [
    mapping(
      "mechanistic-digital-twins-tumor-therapy",
      [
        correspondence(
          "状态的充分统计量（不必保留全部历史）",
          "the sufficient statistic of the state — history need not be kept",
          "这一位病人的增殖、迁移、组织力学系数这组参数：它取代了历次影像本身，成为孪生向前推演所需的全部记忆",
          "this patient's fitted proliferation, migration and tissue-mechanics coefficients, which stand in for the imaging series itself as all the memory the twin carries forward",
        ),
        correspondence(
          "新息 zₖ − Hx̂ₖ⁻ 与增益 Kₖ",
          "the innovation zₖ − Hx̂ₖ⁻ and the gain Kₖ",
          "下一次纵向 MRI 与模型预测肿瘤分布之间的差，以及重标定时把这个差记到「参数该改」还是「影像有噪声」头上的力度",
          "the gap between the next longitudinal MRI and the model's predicted tumour distribution, and how strongly recalibration charges that gap to the parameters rather than to imaging noise",
        ),
      ],
      bi(
        "若这成立，用前 k 次 MRI 标定的孪生对第 k+1 次扫描的预测残差应随 k 增大而下降，并逐渐失去自相关；若残差始终同号或随时间系统性偏大偏小，问题就出在方程写错（模型失配），而不是影像噪声，加扫描也救不回来。",
        "If it holds, a twin calibrated on the first k scans should predict scan k+1 with residuals that shrink as k grows and lose their autocorrelation; residuals that keep one sign or drift systematically indict the equations as misspecified rather than the imaging as noisy, and more scans will not rescue them.",
      ),
      bi(
        "滤波的最优性只对「被观测到的那条轨迹」成立。这座岛真正要交付的是反事实——换一个方案会怎样——而同一位病人身上只会真的执行一种方案（岛的 barrier 自己点明了这点）。残差再白，也只说明模型跟得上已经发生的那次治疗，不说明它对没发生的那一支是对的。另外 MRI 以周为间隔到来，远慢于被估计的增殖动力学，卡尔曼式「持续维持最新估计」在这里退化成寥寥几次稀疏修正。",
        "Filter optimality holds only along the trajectory actually observed. What this island must deliver is a counterfactual — what the other regimen would have done — yet only one regimen is ever administered in a given patient, as its own barrier states. However white the residuals, they show only that the model tracks the therapy that happened, not that it is right about the arm that did not. And MRI arrives weeks apart, far slower than the proliferation dynamics being estimated, so the continuously-current estimate degenerates into a handful of sparse corrections.",
      ),
      ["https://doi.org/10.1038/s41746-025-01579-1", "https://doi.org/10.1158/0008-5472.CAN-25-0088"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/replicator-dynamics",
    mappings: [
    mapping(
      "genetic-firewalls-non-standard-amino-acid-obligate-commensalism",
      [
        correspondence(
          "类型频率 x_i",
          "type frequency x_i",
          "逃逸变体在群体中的占比——岛上引的 10⁻⁹ 逃逸率，以及土壤、肠道内容物等真实基质长时程逃逸筛选里被数出来的那个比例",
          "the share of escape variants in the population — the 10⁻⁹ escape rate the island quotes, and the very proportion counted in its long-horizon escape screens in real matrices such as soil and gut content",
        ),
        correspondence(
          "相对适合度 f_i − ⟨f⟩",
          "relative fitness f_i − ⟨f⟩",
          "岛上明写的「生长与产率代价」：遏制越紧，重编码底盘离野生型代谢越远、代价越大；一个挣脱非天然氨基酸依赖的逃逸者正好把这份代价反过来变成自己的净增长优势。两菌「生产者–利用者」义务共生又让这份优势随对方丰度而变，即适合度是频率依赖的",
          "the island's own 'growth-and-yield cost': the tighter the containment, the further the recoded chassis sits from wild-type metabolism and the heavier that cost — and an escaper that sheds the non-standard-amino-acid dependence converts exactly that cost into its own net growth advantage; the two-strain producer–utilizer commensalism further makes the advantage depend on the partner's abundance, i.e. fitness is frequency-dependent",
        ),
      ],
      bi(
        "若复制者近似成立，安全性就不该由一次测得的 10⁻⁹ 逃逸率封顶：在同一基质里把接种量与培养时长各拉大一个量级，逃逸者占比应按 exp((f_逃逸−⟨f⟩)t) 上升，而不是随取样量线性缩放。若土壤或肠道长时程筛选中该占比随时间基本不动，这个映射即被证伪。",
        "If the replicator approximation holds, safety is not capped by a once-measured 10⁻⁹ escape rate: raise inoculum and incubation time by an order of magnitude each in the same matrix and the escaper share should climb as exp((f_escape − ⟨f⟩)t) rather than scale linearly with sampling depth. If that share stays essentially flat over time in the long-horizon soil or gut screens, the mapping is falsified.",
      ),
      bi(
        "复制者方程是确定性的，且假定每个类型都已以非零频率在场；而遏制真正要管的是稀有突变体的「到来」——10⁻⁹ 量级的突变供给是随机事件，方程里根本没有对应项。更硬的断点是横向基因转移：岛上明写重编码同时阻断病毒感染与 HGT，这说明该底盘的基因本就会跨谱系搬家，而复制者方程的全部记账建立在垂直传代上。",
        "The replicator equation is deterministic and assumes every type is already present at nonzero frequency, whereas containment turns on the *arrival* of a rare mutant — a stochastic mutational supply at the 10⁻⁹ scale for which the equation has no term at all. The harder breaking point is horizontal gene transfer: the island states that recoding blocks viral infection and HGT at once, which means genes in this chassis do move between lineages, while the replicator's entire bookkeeping rests on vertical descent.",
      ),
      ["https://www.nature.com/articles/s41564-025-01999-5", "https://www.nature.com/articles/s41586-023-05824-z"],
    ),
    mapping(
      "living-molecular-diagnostics-in-body-dna",
      [
        correspondence(
          "类型频率 x_i",
          "type frequency x_i",
          "转化子里两类克隆的相对占比：捕获到突变型 KRAS 的一类与捕获到野生型的一类，读出就是菌落计数之比",
          "the relative share of two clone types among the transformants — those that captured mutant KRAS versus those that captured wild type — read out as a ratio of colony counts",
        ),
        correspondence(
          "相对适合度 f_i − ⟨f⟩",
          "relative fitness f_i − ⟨f⟩",
          "CRISPR 依 PAM 施加的净增长差：野生型被切（负增长），缺相应 PAM 的突变型存活并长成抗性菌落。岛上说的「PAM 依赖判别灵敏度」量的就是这个差有多大",
          "the net growth differential CRISPR imposes through PAM dependence: wild type is cut (negative growth) while the mutant, lacking the relevant PAM, survives and grows into a resistant colony — the island's 'PAM-dependent discrimination sensitivity' is precisely the size of that differential",
        ),
      ],
      bi(
        "若复制者成立，信噪比就不是岛上默认的「HGT 捕获效率 × 判别灵敏度」这一个固定乘积：突变/野生菌落比的对数应随选择性生长时长线性上升，斜率由切割效率决定，直到未切净的野生型背景把它压平。把出板前的生长时间加倍而该比值不变，这个映射即被证伪。",
        "If the replicator reading holds, signal-to-noise is not the fixed product of horizontal-gene-transfer capture efficiency times discrimination sensitivity that the island's barrier assumes: the log of the mutant-to-wild-type colony ratio should rise linearly with selective outgrowth time at a slope set by cutting efficiency, flattening only when the uncut wild-type background sets the floor. Double the outgrowth time before plating and, if the ratio does not move, the mapping is falsified.",
      ),
      bi(
        "复制者方程描述的是持续作用的增长率之差；若 CRISPR 切割在转化后一次性完成，频率变化就只是一次不可迭代的存活过滤，指数放大压根不发生。另外真实肠道背景不是封闭良好混合群体——外来菌持续流入、本底菌群参与竞争，Σx_i = 1 的归一化记账在这里站不住。",
        "The replicator equation describes a continuously acting difference in growth rates; if the CRISPR cut happens once, right after transformation, the frequency change is a single non-iterated survival filter and the exponential amplification never occurs. And a real gut background is not a closed well-mixed population — immigration continues and the resident microbiome competes, so the Σx_i = 1 normalisation the equation keeps its books in does not hold.",
      ),
      ["https://www.science.org/doi/10.1126/science.adf3974", "https://pmc.ncbi.nlm.nih.gov/articles/PMC10852993/"],
    ),
    mapping(
      "multi-agent-credit-assignment-under-shared",
      [
        correspondence(
          "相对适合度 f_i − ⟨f⟩，即「个体表现减去平均」这一步减法",
          "relative fitness f_i − ⟨f⟩ — the act of subtracting the mean from individual performance",
          "岛上明写的差分奖励与 COMA 反事实基线：固定其他智能体的动作算出基线，再用个体奖励减掉它。这个减法在该底盘里就叫「反事实优势」",
          "the difference reward and COMA counterfactual baseline the island names outright: hold the other agents' actions fixed to compute a baseline, then subtract it from the individual reward — that subtraction is called the counterfactual advantage here",
        ),
        correspondence(
          "类型频率 x_i 及其按相对表现的乘性重分配",
          "type frequency x_i and its multiplicative reweighting by relative performance",
          "智能体策略分配给某个动作的概率：差分奖励作为优势值进入策略梯度，把该概率按优势成比例抬高或压低——Dr.Reinforce 更是直接对奖励函数求差得到梯度，绕开联合 Q 值估计",
          "the probability an agent's policy assigns to an action: the difference reward enters the policy gradient as the advantage and scales that probability up or down in proportion — Dr.Reinforce differences the reward function directly to obtain the gradient, bypassing joint Q-value estimation",
        ),
      ],
      bi(
        "若这成立，反事实优势恰为零的动作，其概率应当不漂移（复制者的不动点性质），而收敛速度应由优势估计的方差、而非其偏差决定。于是岛上说的「智能体数量上升时反事实计算与奖励模型误差同时放大」应表现为一个可测拐点：一旦估计方差超过优势本身的量级，动作频率的轨迹就与实测优势脱钩——在 StarCraft 或网格世界上逐级加大同质智能体数即可检验。",
        "If it holds, an action whose counterfactual advantage is exactly zero should show no drift in probability (the replicator's fixed-point property), and convergence speed should be set by the variance of the advantage estimate rather than its bias. The island's claim that counterfactual computation and reward-model error both amplify with agent count should then show a measurable knee: once estimator variance exceeds the magnitude of the advantage itself, the action-frequency trajectory decouples from the measured advantage — checkable by scaling homogeneous agent counts on StarCraft or gridworld.",
      ),
      bi(
        "复制者方程写的是单一群体面对一个给定的适应度地形；这里每个智能体各持一套策略，而某个动作的「适合度」又取决于其他智能体同时在变的策略——这是多群体非平稳博弈，单群体复制者的收敛性与 ESS 结论不能照搬。另一个断点在精度：方程里 f_i 是精确值，差分奖励却是带误差的估计量，而岛上的障碍正说这个误差随智能体数放大。",
        "The replicator equation is written for a single population facing a given fitness landscape; here each agent carries its own policy and the 'fitness' of an action depends on the other agents' policies changing at the same time — a multi-population, non-stationary game, so the single-population convergence and ESS results do not transfer. The second breaking point is precision: f_i is exact in the equation, whereas the difference reward is an estimate with error, and the island's own barrier says that error grows with agent count.",
      ),
      ["https://doi.org/10.1007/s00521-022-07960-5", "https://doi.org/10.1609/aaai.v32i1.11794"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/selection-bias-absence",
    mappings: [
    mapping(
      "detection-calibrated-evidence-ecological-absence",
      [
        correspondence(
          "选择方程（一个个体有没有机会进入样本）",
          "the selection equation — whether an individual gets a chance to enter the sample",
          "岛上明写的检出概率 p<1：物种在场却没被检出，就是「进入记录」这一步失败；eDNA 流程还把这一步拆成取水过滤、提取、首次 PCR 多层分别估计",
          "the detection probability p<1 the island states outright: a species present but missed is exactly a failure at the step of entering the record, and the eDNA workflow splits that step into filtering, extraction and first PCR, each estimated separately",
        ),
        correspondence(
          "对缺席的修正项（把观测分布拉回真实分布）",
          "the correction term for absence — pulling the observed distribution back onto the real one",
          "重复访问的检出/未检出历史联合估出的占域率 ψ 与朴素「未检出即缺席」计数之差；状态过程与观测过程被显式分开写",
          "the gap between occupancy ψ, estimated jointly from repeated-visit detection histories, and the naive count that reads non-detection as absence — the state process and the observation process are written down as separate layers",
        ),
      ],
      bi(
        "若这成立，随着每个样点的重复访问次数增加，朴素「未检出即缺席」的占域估计应单调上移并收敛到模型估计的 ψ；而 ψ 本身应基本不随访问次数漂移。若 ψ 也随访问次数系统性变化，说明检出过程被错误设定。",
        "If it holds, as repeat visits per site increase, the naive occupancy estimate that treats non-detection as absence should climb monotonically toward the model's ψ, while ψ itself should stay essentially flat in visit count. A ψ that also drifts with visit count would show the detection process is misspecified.",
      ),
      bi(
        "两处断裂：其一，占域校正要求重复观测在给定状态下相互独立，而岛自己的壁垒说同一次访问、同一份水样的多次 PCR 共享污染与引物错配——重复一旦相关，p 与 ψ 就不再可分辨；其二，选择偏差模型只会删样本，永远不会凭空生成样本，而 eDNA 的假阳性会把不在场的物种写进记录，这在 Heckman 型框架里根本没有对应项，必须另配阴性对照，不能靠同一个 λ 修正。",
        "It breaks in two places. First, occupancy correction assumes replicates are conditionally independent, while the island's own barrier says repeat PCRs from one visit and one water sample share contamination and primer mismatch — once replicates correlate, p and ψ stop being separately identifiable. Second, a selection model can only delete observations, never manufacture them, whereas eDNA false positives write an absent species into the record; that has no counterpart in a Heckman-type λ and must be handled by negative controls instead.",
      ),
      ["https://doi.org/10.1038/s41598-019-40233-1", "https://doi.org/10.1111/1755-0998.12486"],
    ),
    mapping(
      "exclusion-lineage-source-cohorts-analysis",
      [
        correspondence(
          "选择方程 Zγ（谁进入被分析的样本）",
          "the selection equation Zγ — who ends up in the analysed sample",
          "从源队列到分析样本的排除谱系本身：管线里每一次排除写一条记录，带样本 ID、阶段、规则版本与理由；分析分母就是这条选择方程的输出",
          "the exclusion lineage itself: one record emitted per exclusion inside the pipeline, carrying sample ID, stage, rule version and reason — the analysis denominator is precisely this selection equation's output",
        ),
        correspondence(
          "忽略 λ 的后果：选择偏差的大小",
          "the consequence of dropping λ — the size of the selection bias",
          "纳入者与排除者之间的协变量比较，以及换若干套排除规则重跑后结论是否翻转的敏感性分析",
          "the covariate comparison between included and excluded participants, plus the sensitivity analysis that reruns under several alternative exclusion rules to see whether the conclusion flips",
        ),
      ],
      bi(
        "若这成立，在同一份源队列上以若干套同样合理的排除规则重跑，效应量的离散度应随纳入者/排除者协变量差异的增大而增大；协变量分布几乎无差异的那些规则集，应给出彼此一致的结论。若两者不相关，说明结论的不稳定另有来源，不是排除造成的。",
        "If it holds, rerunning one source cohort under several equally defensible exclusion rules should spread the effect estimate wider as the included-versus-excluded covariate gap widens, while rule sets whose covariate distributions barely differ should agree with one another. No such relation would mean the instability comes from somewhere other than exclusion.",
      ),
      bi(
        "Heckman 型修正需要一个排除性约束——只影响「是否被排除」而不影响结局的变量；但这里最常见的排除理由（数据缺失、失访、不合格）通常与结局直接相关，因此谱系能兑现的是「让选择过程可审计」，不是「给出无偏系数」。再者岛自身的壁垒指出隐私禁止逐例公开、聚合计数又掩盖同一人多次排除与随结局变化的分母——选择方程只能以粗粒度近似发布，λ 无法从公开数据重建。",
        "A Heckman-style correction needs an exclusion restriction — a variable that moves whether someone is dropped but not the outcome. Here the commonest reasons for exclusion (missing data, loss to follow-up, ineligibility) bear directly on the outcome, so what the lineage can deliver is an auditable selection process, not an unbiased coefficient. And as the island's own barrier says, privacy blocks case-level disclosure while aggregate counts hide repeated exclusions and outcome-varying denominators — the selection equation can only be published coarsely, and λ cannot be reconstructed from what is released.",
      ),
      ["https://doi.org/10.1371/journal.pmed.1001885", "https://doi.org/10.1186/1745-6215-12-253"],
    ),
    mapping(
      "shadow-diversity-invisible-unknowns-life",
      [
        correspondence(
          "被截断的观测样本（E[y | 被观测] 里的条件）",
          "the truncated observed sample — the conditioning in E[y | observed]",
          "已描述的约两百万真核物种：谁被描述由分类偏好与采样不均决定，因此岛文自己说，以已知物种计的灭绝率本身就是一个被截断的样本",
          "the roughly two million described eukaryote species: which taxa got described is set by taxonomic preference and uneven sampling, which is why the island itself says an extinction rate reckoned from known species is already a truncated sample",
        ),
        correspondence(
          "对缺席的修正项（把不可见部分估成一个带区间的数）",
          "the correction for absence — turning the invisible part into a number with an interval",
          "按分类群与网格单元建的采样完整度曲线，以及 Chao 类估计量给出的未见物种数及其置信区间",
          "sampling-completeness curves built per taxon and grid cell, and the unseen-species counts with confidence intervals produced by Chao-type estimators",
        ),
      ],
      bi(
        "若这成立，拿岛自己列的回溯检验做：在那些后来才被拆解的隐存种复合体上，早期完整度外推给出的未见物种数区间应覆盖后来实际被描述的数目。若系统性低估（真值反复落在区间之上），说明完整度模型漏掉了某一类采样偏倚，而不是估计量方差不够大。",
        "If it holds, run the island's own back-test: on cryptic species complexes that were eventually resolved, the interval the earlier completeness extrapolation gave for unseen species should cover the number later described. Systematic under-estimation — truth landing above the interval again and again — would show the completeness model is missing a class of sampling bias rather than merely being too tight.",
      ),
      bi(
        "Chao 类估计量只对「在同一采样过程下有正概率被抽到、却恰好没被抽到」的物种有效。对采样概率为零的部分——从没人去过的生境、无法培养的微生物暗物质——它给不出任何修正，因为选择概率为零处的逆米尔斯比不存在；这正对应 Heckman 要求的共同支撑条件。加上岛自身指出昆虫与脊椎动物、热带与温带的采样偏倚相差数个量级，全球单一外推的误差可能大于所估计的量本身。",
        "Chao-type estimators only cover species that had a positive chance of being sampled by the same process and happened not to be. For the part whose sampling probability is zero — habitats nobody has visited, unculturable microbial dark matter — they return no correction at all, because the inverse Mills ratio does not exist where the selection probability is zero; this is exactly Heckman's common-support requirement. And since, as the island notes, sampling bias differs by orders of magnitude between insects and vertebrates, tropics and temperate zones, a single global extrapolation can carry error larger than the quantity being estimated.",
      ),
      ["https://www.cambridge.org/core/journals/cambridge-prisms-extinction/article/diversity-of-ignorance-and-the-ignorance-of-diversity-origins-and-implications-of-shadow-diversity-for-conservation-biology-and-extinction/77D08B360E77D80E363F0E48E9F4D8EE", "https://pmc.ncbi.nlm.nih.gov/articles/PMC11895729/"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/shannon-entropy",
    mappings: [
    mapping(
      "single-molecule-protein-sequencing",
      [
        correspondence(
          "信源熵 H = −Σ p·log p（每个符号必须被传出去的比特数）",
          "source entropy H = −Σ p·log p — the bits each symbol must carry across",
          "每个残基位点上二十种氨基酸再加修饰构成的字母表；岛上说的「受限残基字母表」正是主动把 H 调低，好塞进读出通道",
          "the alphabet of twenty residues plus modifications at each position; the field's 'restricted residue alphabets' are precisely H deliberately lowered to fit inside the readout channel",
        ),
        correspondence(
          "通道容量：可靠传输速率的上限",
          "channel capacity — the ceiling on reliable rate",
          "barrier 点名的那对失配——肽链穿孔速度对残基之间的信号差异，速度换可分辨性",
          "the mismatch its barrier names — translocation speed through the pore against the signal difference between residues, rate traded for distinguishability",
        ),
      ],
      bi(
        "若这成立，在同一读出平台上把字母表的熵降一档（例如只区分两类残基），错误率应大致按比例下降；同时放慢穿孔速度应以正比的通量代价换来准确率提升，两条曲线应交在同一条容量约束上。若放慢速度后准确率很快撞平台，限制的就不是信息容量，而是残基本身的信号简并。",
        "If it holds, cutting the alphabet's entropy by one step on the same readout platform — distinguishing only two residue classes, say — should drop the error rate roughly in proportion, while slowing translocation should buy accuracy at a proportional throughput cost, both curves meeting one and the same capacity constraint. If accuracy plateaus quickly as translocation slows, the binding limit is not information capacity but the signal degeneracy of the residues themselves.",
      ),
      bi(
        "香农的容量定理假设编码可以自由选择、信道无记忆、符号统计已知。测序这一侧三条都不成立：消息由生物给定，不能重新编码；孔内电流由同时占据孔道的一段残基共同决定，因而信道有记忆；修饰又让字母表事先不封闭。所以这里能借的是「速率与可靠性之间存在上限」这个约束本身，不是一个可算出来的容量数值。",
        "Shannon's capacity theorem assumes a freely chosen code, a memoryless channel, and known symbol statistics. A sequencer has none of the three: the message is handed over by biology and cannot be recoded; the pore current is set by a whole stretch of residues occupying the pore at once, so the channel has memory; and modifications leave the alphabet open-ended rather than fixed in advance. What is borrowed is the existence of a rate-versus-reliability ceiling, never a computable capacity number.",
      ),
      ["https://doi.org/10.1038/s41587-025-02587-y", "https://doi.org/10.1021/acs.nanolett.3c00086"],
    ),
    mapping(
      "molecular-recorders-inside-tissues",
      [
        correspondence(
          "存储容量：可区分消息数目的对数",
          "storage capacity — the log of the number of distinguishable messages",
          "barrier 直接写出的那个「容量」：可写位点数 × 每次编辑的符号熵，它与时间分辨率互相挤压",
          "the 'capacity' its barrier names outright — writable sites times the symbol entropy per edit, squeezed against time resolution",
        ),
        correspondence(
          "信源速率：单位时间产生的比特",
          "source rate — bits generated per unit time",
          "「把写入触发耦合到目标通路，使记录速率随信号强度变化」中的那个记录速率，即被记录信号自身的变化快慢",
          "the recording rate in 'couple the writing trigger to a target pathway so that recording rate varies with signal strength' — the pace of the signal being recorded",
        ),
      ],
      bi(
        "若这成立，可重建的历史深度应由 位点数 × log(符号字母表大小) 共同决定：在总位点数不变时把字母表从 2 种符号扩到 4 种，带来的深度增益应与把位点数翻倍等价。若扩字母表几乎不改善而加位点明显改善，瓶颈就是编辑化学与覆写，而不是信息容量。",
        "If it holds, recoverable history depth should be set by sites × log(alphabet size): at a fixed site count, moving from a two-symbol to a four-symbol alphabet should buy the same depth as doubling the number of sites. If widening the alphabet barely helps while adding sites clearly does, the bottleneck is editing chemistry and overwriting rather than information capacity.",
      ),
      bi(
        "信道模型假设噪声与消息无关、编码者可以自由设计码字。这里三处都破：写入由细胞自己的编辑机器执行，码字选不了；后写的编辑会抹掉先写的，是有记忆的擦除信道而非无记忆信道；最要命的是提高容量要更密集地编辑基因组，而 barrier 说这会扰动细胞本身——写入这个动作改变了被记录的那个信源。香农的定理里没有「测量改变信源」这一项，所以容量在这里不是一个能一路推上去的上界。",
        "A channel model assumes noise independent of the message and an encoder free to design its codewords. All three break here: writing is done by the cell's own editing machinery, so the code cannot be chosen; later edits erase earlier ones, making this an erasure channel with memory rather than a memoryless one; and worst, raising capacity means editing the genome more densely, which its barrier says perturbs the cell — the act of writing alters the source being recorded. No Shannon theorem carries a term for a measurement that changes its own source, so capacity here is not a bound one may simply push toward.",
      ),
      ["https://doi.org/10.1038/s41586-022-04922-8"],
    ),
    ],
  },
  {
    structureId: "struct://xfrontier/transitive-link-prediction",
    mappings: [
    mapping(
      "graph-neural-networks-characterizing-algebraic",
      [
        correspondence(
          "一步关系的传递闭包（A→B ∧ B→C ⇒ A→C）",
          "the transitive closure of a recorded one-step relation (A→B ∧ B→C ⇒ A→C)",
          "单次箭图突变就是那条一步边，突变等价类正是它的传递闭包；「两个箭图能否经一串突变互相转化」问的就是闭包里那条谁也没把链条写出来的边",
          "a single quiver mutation is that one-step edge and a mutation class is exactly its transitive closure; asking whether two quivers are connected by a chain of mutations is asking for the closure edge whose chain nobody has exhibited",
        ),
        correspondence(
          "缺边作为「值得查」的假说，而不是既成事实",
          "the missing edge as a worth-checking hypothesis rather than an established fact",
          "GNN 给出的同类判定，以及显著性归因整理出的候选不变量——基质规定它必须先过箭图族上的穷举反例搜索，通过之后才进入人工证明",
          "the network's same-class verdict and the candidate invariant read out by saliency attribution — which the substrate requires to survive exhaustive counterexample search on further quiver families before any manual proof begins",
        ),
      ],
      bi(
        "若这成立，按网络置信度排序的「判为同类但尚无已知突变链」的箭图对，其能被实际搜索出突变链的比例应显著高于随机配对；且这一优势应随所需链长增加而衰减——若在任意链长下优势都不变，说明网络学到的是样本生成方式而不是闭包结构。",
        "If it holds, quiver pairs ranked by network confidence as same-class-but-no-known-chain should yield an actual mutation chain under search at a markedly higher rate than randomly paired quivers, and that advantage should decay as the required chain length grows. An advantage flat in chain length would mean the network learned the sample-generation procedure rather than the closure structure.",
      ),
      bi(
        "与 Swanson 场景相反，这里的传递性是精确的：突变等价本就是等价关系，A→B、B→C 成立则 A→C 必成立，不存在中介被抑制那类反例。失效点因此换了位置——不在传递推理本身，而在于网络学到的只是统计可分性、不是充要条件，以及狂野的无限突变类里链长无界：一条边「缺」可能只因为搜索深度不够，而不是它不存在。把「缺边即假说」原样搬过来，会把这两种性质完全不同的缺失混为一谈。",
        "Unlike the Swanson setting, transitivity here is exact: mutation equivalence is an equivalence relation, so A→B and B→C force A→C, with no suppressed-mediator counterexamples. The breaking point therefore moves — not to the transitive inference itself but to the fact that the network learns statistical separability rather than a necessary and sufficient condition, and that chain length is unbounded in the wild infinite mutation classes, so an edge may be 'missing' only because the search was not deep enough. Carrying missing-edge-as-hypothesis over unchanged would conflate two quite different kinds of absence.",
      ),
      ["https://arxiv.org/abs/2411.07467", "https://openreview.net/forum?id=fIf2xt4GXZ"],
    ),
    mapping(
      "prospective-wet-lab-validation-literature-generated-hypotheses",
      [
        correspondence(
          "由已有记录推出的那条缺边 A→C",
          "the missing edge A→C derived from what is already on record",
          "文献生成的候选清单本身——包括鱼油—雷诺这条 1986 年被推出来的 A–C 路径，以及经排序后送进 PC3 筛选或体外实验的那批候选",
          "the literature-generated candidate list itself — the fish-oil–Raynaud A–C path derived in 1986 among them, and the ranked candidates sent into the PC3 screen or into in-vitro work",
        ),
        correspondence(
          "缺边的可检验性：预测的是「值得查」，不是「成立」",
          "the testability of the missing edge: what is predicted is worth-checking, not true",
          "证据等级的分层做法——预注册生成日期与文献截点、拿已完成的高通量筛选当留出集量富集倍数、并公布被放弃的候选与放弃理由",
          "the tiering of evidence — pre-registering the generation date and literature cutoff, using a completed high-throughput screen as a hold-out set to measure enrichment, and publishing the abandoned candidates together with the reasons",
        ),
      ],
      bi(
        "若这成立，在文献截点之前冻结的候选排序，其在 PC3 一类留出筛选上的命中富集倍数应显著大于 1，并随排名下移单调衰减；而把生成日期后移、让后见信息回流之后，富集倍数应虚高——这个虚高的差值本身可以被测出来。",
        "If it holds, a ranking frozen before its literature cutoff should show hit enrichment well above 1 on a hold-out screen such as PC3, decaying monotonically down the ranked list; and moving the generation date later, letting hindsight leak back, should inflate that enrichment — the size of the inflation being itself measurable.",
      ),
      bi(
        "传递闭包给的是候选，不给分母。基质点名的三种混淆——事后相合、留出验证、生成之后再择优做实验——都能产出一个漂亮的成功案例，而 1989 年那场鱼油试验本身并不是按文献发现流程前瞻注册的。所以这条骨架在这里只支撑「按缺边排序优于随机」这类相对陈述；缺了完整候选分母与阴性结果，任何绝对成功率都不可解读，更不能反过来当作传递推理本身成立的证据。",
        "The transitive closure supplies candidates, not a denominator. All three confusions the substrate names — retrospective concordance, hold-out validation, and picking winners after generation — can each produce one handsome success story, and the 1989 fish-oil trial was itself never prospectively registered under a literature-discovery workflow. The skeleton therefore supports only relative statements here, such as ranking-by-missing-edge beating random sampling; without the full candidate denominator and the negatives no absolute success rate is interpretable, and none may be turned around as evidence that the transitive inference holds.",
      ),
      ["https://doi.org/10.1038/s41586-026-10644-y", "https://doi.org/10.1038/psp.2014.37"],
    ),
    ],
  },
];
