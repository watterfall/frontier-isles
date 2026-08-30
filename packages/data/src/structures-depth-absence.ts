import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureQuantity, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the observation-and-absence family — what
 * can be inferred from what was never seen, cannot all be seen, or changes
 * when it is seen.
 *
 * The eight share a predicament rather than a mechanism. Selection bias and
 * open-set recognition are about the units and classes that never reached the
 * observer; extreme-value theory and anomaly-as-signal are about the one point
 * that did reach it and sits apart from the rest; Bayesian surprise and optimal
 * stopping are about what to look at next and when to stop looking; back-action
 * and field observability are about what the looking itself does and what an
 * arrangement of sensors can and cannot resolve. Grouping them is a claim that
 * these are one question asked of different missing pieces, and the relations
 * are where that claim gets tested.
 *
 * Four relations are identities and are filed as such. Expected Bayesian
 * surprise is the mutual information between hypothesis and outcome,
 * I(M;D) = H(M) − E[H(M|D)]: Lindley's 1956 design criterion is Shannon's
 * channel quantity with the hypothesis as the source. The epistemic term of
 * expected free energy is that same expected KL, so curiosity is what active
 * inference reduces to when nothing is at stake but knowledge. The
 * observability Gramian of a linear-Gaussian system is the Fisher information
 * about its initial state, so a sensor arrangement's resolving power is a
 * Cramér–Rao bound. And the Fréchet domain of attraction is exactly the
 * power-law tail, with ξ = 1/α.
 *
 * One outlier has three rival readings here, and the file says so three times:
 * a draw from the tail of the distribution you already have (extreme-value
 * theory), the edge of a selection that let it through because it was large
 * (the winner's curse), or a residual of a rule that is incomplete (anomaly as
 * signal). Telling those apart on a single point is the open problem, which is
 * what `competes-with` exists for.
 *
 * The one worth arguing over is optimal stopping against preregistration,
 * filed as rivals. They answer "when do I stop collecting" differently — let
 * the data decide N under a rule fixed in advance, or fix N in advance — and
 * the objection is that a preregistered sequential rule does both at once. The
 * relation survives because what they contest is narrower than it looks:
 * whether N may depend on the data at all. Back-action against conjugate
 * uncertainty is the other near-miss: two readings of one textbook inequality,
 * separable only since Ozawa wrote the measurement–disturbance relation its
 * own inequality in 2003. It is filed as `competes-with` because which of the
 * two a given experiment tests still has to be settled per experiment.
 *
 * Seven of the eight predate wave 4 and carried no quantities, so they get
 * them here on the same terms as the critical family; measurement back-action
 * already has three and receives depth only. Textbook knowledge throughout,
 * no island referenced, no mapping or coverage touched.
 */

type Bilingual = { zh: string; en: string };
const bi = (zh: string, en: string): Bilingual => ({ zh, en });

const q = (nz: string, ne: string, rz: string, re: string): StructureQuantity =>
  ({ name: bi(nz, ne), role: bi(rz, re) });

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

export const ABSENCE_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/selection-bias-absence',
    quantities: [
      q('被观测概率 P(观测 | x)', 'probability of being observed, P(seen | x)', '一个单元进入样本的机会；只要它随所研究的量 x 变化，样本分布就偏离真实分布', 'the chance a unit enters the sample; whenever it varies with the quantity x under study, the sample distribution departs from the real one'),
      q('缺席数', 'the count of the unseen', '没进入样本的单元有多少——它读不出来，只能估计，而结论无不无偏全押在这个估计上', 'how many units never entered the sample — a number that cannot be read off and must be estimated, with the conclusion\'s unbiasedness riding on that estimate'),
      q('选择机制', 'the selection mechanism', '决定谁被看见的那条规则；以结果为条件（幸存、入院、发表）时它造成的偏差最难察觉', 'the rule that decided who was seen; when it conditions on the outcome — survival, admission, publication — the bias it makes is the hardest to notice'),
    ],
    depth: {
      origin: bi(
        '1943 年 Wald 在统计研究组为飞机装甲问题写的备忘录是最早的完整表述：返航飞机上的弹孔说的是「哪里中弹还飞得回来」。1946 年 Berkson 指出医院样本会在两种独立疾病之间造出负相关；1979 年 Heckman 在计量经济学里把样本选择写成一个可估计的模型。',
        'Wald\'s 1943 memoranda for the Statistical Research Group on aircraft armour are the first full statement: bullet holes on returning planes show where a plane can be hit and still come back. Berkson showed in 1946 that hospital samples manufacture a negative correlation between two independent diseases, and Heckman wrote sample selection as an estimable model in econometrics in 1979.',
      ),
      minimalForm: 'P(x | 被观测) ∝ P(被观测 | x)·P(x) ；P(被观测 | x) 非常数 ⇒ 样本分布 ≠ P(x)',
      canonicalSubstrates: [
        sub('Wald 的弹孔', 'Wald\'s bullet holes', '运筹学', 'Operations research', 1,
          '没有返航的飞机——它们中弹的位置，正是返航飞机上弹孔最少的地方',
          'the planes that did not return, hit exactly where the returning ones show the fewest holes',
          'Wald 的推断要先假定命中在机身上大致均匀；没有这个先验，发动机上没有弹孔什么也说明不了。从缺席推断永远需要一个关于「本该看到什么」的模型。',
          'Wald\'s inference needs the prior that hits fall roughly uniformly over the airframe; without it, the absence of holes on the engines says nothing. Inference from absence always needs a model of what ought to have been seen.'),
        sub('发表偏倚', 'Publication bias', '元科学', 'Metascience', 0,
          '一项研究进入文献的机会，随 p 值是否过线而陡变',
          'a study\'s chance of entering the literature jumping at whether p crossed the line',
          '这里的选择以结果本身为条件，而且是门槛式的，所以观测到的分布在 p = 0.05 处留下一个可检的断口——漏斗图与 p 曲线读的就是它。多数选择问题没有这样一个自带签名的门槛。',
          'Selection here conditions on the result itself and is threshold-shaped, so the observed distribution carries a detectable break at p = 0.05, which is what funnel plots and p-curves read. Most selection problems offer no such self-announcing threshold.'),
        sub('Berkson 悖论', 'Berkson\'s paradox', '流行病学', 'Epidemiology', 2,
          '「至少患一种病才住院」这条入院规则，让两种本不相关的病在住院病人里呈负相关',
          'the admission rule "in hospital only with at least one disease" making two unrelated diseases negatively correlated among inpatients',
          '这里的偏差不是把均值推偏，而是凭空造出一个关联；纠正它要知道入院规则本身，只知道入院率没有用。',
          'The bias here does not shift a mean but fabricates an association, and correcting it requires knowing the admission rule itself; the admission rate alone is useless.'),
        sub('物种占据调查', 'Species occupancy surveys', '生态学', 'Ecology', 0,
          '一次调查没见到某物种，可能是它不在，也可能是它在而没被探测到；探测概率小于一',
          'a survey not seeing a species meaning either absent or present-but-undetected, with detection probability below one',
          '这是少有的可以按设计把缺席数出来的基底：同一地点重复到访，探测概率与占据概率就能分开估计。大多数选择问题里，缺席的单元没法再采一次。',
          'One of the few substrates where the unseen can be counted by design: revisiting the same site lets detection probability be estimated separately from occupancy. In most selection problems the missing units cannot be sampled again.'),
      ],
      relations: [
        rel('within-subject-control', 'explains',
          '组间比较会偏，是因为「谁进了哪一组」被某个与结果相关的东西选过；把每个单元同时放进两组，分组这件事就不再是一次选择——自身对照成立的原因就在这里。它对「谁进了这项研究」那一层选择无能为力，那一层照旧存在。',
          'A between-group comparison is biased exactly when who ended up in which group was selected on something tied to the outcome; putting every unit in both groups makes membership no longer a selection at all, which is why within-subject control works. It does nothing about who entered the study, a layer of selection that remains as it was.'),
        rel('open-set-recognition', 'generates',
          '开放集之所以存在，是因为采集是有选择的：训练集里缺的类别，正是采集过程从没看见的那些。拒识出口因此是对一条没人写下来的选择机制下的注，不是对世界本身多样性下的注。',
          'An open set exists because collection was selective: the classes missing from training are exactly the ones the collection process never saw. The reject option is therefore a hedge against a selection mechanism nobody wrote down, not against the variety of the world as such.'),
        rel('anomaly-as-signal', 'competes-with',
          '同一个离群点有两种读法：它是规则不完整留下的残差，或者它出现在样本里就是因为它大——罕见病例因罕见而被转诊，首次报告的效应量因显著才被发表（赢家诅咒）。分辨二者，看它在独立样本里缩不缩水。',
          'One outlier admits two readings: a residual of an incomplete rule, or a point that is in the sample because it was large — the rare case referred because it was rare, the first reported effect size published because it was significant (the winner\'s curse). Telling them apart is whether it shrinks in an independent sample.'),
      ],
      mistakenFor: bi(
        '最常被误当成混杂。混杂是暴露与结果有共同的原因，选择偏差是以它们的共同结果为条件（幸存、入院、发表）；前者可以靠测量那个共同原因来调整，后者无从调整，只能去建模没被看见的部分。判据是：停止以「进入样本」为条件之后，偏差是不是就消失了。还有一个更便宜的误认——当它是样本量问题：加数据只会让你更精确地收敛到错误答案。',
        'Most often mistaken for confounding. Confounding is exposure and outcome sharing a cause; selection bias is conditioning on their shared effect — survival, admission, publication. The first can be adjusted for by measuring the shared cause, the second cannot be adjusted for at all and can only be modelled as what went unseen. The test is whether the bias vanishes once you stop conditioning on entry into the sample. The cheaper misreading is taking it for a sample-size problem: more data only converge more precisely on the wrong answer.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/open-set-recognition',
    quantities: [
      q('已知类覆盖率', 'coverage of the known classes', '世界将送来的东西里，有多大份额在训练时见过；覆盖率越低，出口越省不得', 'what share of what the world will send was seen in training; the lower it is, the less the exit can be dispensed with'),
      q('拒识阈值', 'the reject threshold', '一个样本离所有已知类多远才被送进出口；它定下出口的宽度', 'how far a case must be from every known class before it goes to the exit; this sets the exit\'s width'),
      q('开放空间风险', 'open-space risk', '被标成已知类、却远离一切训练样本的那部分空间的份额——出口太窄时付的代价', 'the share of space labelled as a known class while lying far from any training sample — the price paid when the exit is too narrow'),
    ],
    depth: {
      origin: bi(
        '拒识选项由 Chow 于 1970 年在模式识别中给出：留一个「不判」的出口，并写出错误率与拒识率之间的权衡。「开放集识别」这个名字和开放空间风险的定义来自 Scheirer 等人 2013 年的计算机视觉工作，他们指出 Chow 的拒识管的是已知类之间的模糊，不是从未见过的类。',
        'The reject option is Chow\'s, in pattern recognition in 1970: keep an exit marked "no decision" and write down the tradeoff between error rate and reject rate. The name open-set recognition and the definition of open-space risk come from Scheirer and colleagues in computer vision in 2013, who pointed out that Chow\'s reject handles ambiguity between known classes rather than classes never seen.',
      ),
      minimalForm: 'min  R_ε(f) + λ·R_O(f) ；R_O = 被判为已知类的空间中远离一切训练样本的份额',
      canonicalSubstrates: [
        sub('Chow 的拒识选项', 'Chow\'s reject option', '模式识别', 'Pattern recognition', 1,
          '后验最大值低于阈值的手写字符不判读，交给人工',
          'a handwritten character whose largest posterior falls below the threshold left undecided and passed to a person',
          'Chow 的阈值拒的是已知类之间分不清的样本，不是没见过的类：一个新类别可以带着很高的置信度落进某个已知类。所以这个阈值本身抓不住开放集，它只是出口的一半。',
          'Chow\'s threshold rejects cases that are ambiguous between known classes, not classes never seen: a novel category can land inside a known class with high confidence. The threshold alone therefore does not catch the open set; it is half of the exit.'),
        sub('免疫系统的自我/非我判别', 'Self/non-self discrimination in the immune system', '免疫学', 'Immunology', 0,
          '胸腺筛选时见过的「自我」就是全部已知类；此外的一切都走出口——而出口接的是攻击',
          'the self seen during thymic selection being the entire set of known classes, everything else sent to the exit — and the exit wired to attack',
          '这里只有一个已知类，极性反过来：识别的是自我，拒识的是其余。出口不是弃权而是行动，两种错（放过入侵者、攻击自己）的代价相差悬殊，所以阈值由代价比而不是错误率设定。',
          'There is one known class here and the polarity is inverted: what is recognised is self and what is rejected is everything else. The exit is an action rather than an abstention, and the two errors — letting an intruder through, attacking oneself — cost so differently that the threshold is set by the cost ratio rather than by an error rate.'),
        sub('宏基因组读段分类', 'Classifying metagenomic reads', '微生物学', 'Microbiology', 2,
          '一条测序读段要么归到最近的参考基因组，要么标为「未分类」；后者常常占多数',
          'a sequencing read either assigned to the nearest reference genome or marked unclassified, the latter often the majority',
          '参考库本身偏向可培养的生物，所以开放空间不是均匀的：未知集中在特定谱系里，在采样充分的类群上调好的阈值，恰恰在那些谱系上是错的。',
          'The reference database is itself skewed towards culturable organisms, so the open space is not uniform: the unknowns cluster in particular lineages, and a threshold tuned on well-sampled groups is wrong for exactly those.'),
        sub('入侵检测', 'Intrusion detection', '信息安全', 'Information security', 1,
          '基于特征码的检测只认识已知攻击；基于异常的检测为「没见过的」留出口',
          'signature-based detection knowing only known attacks, anomaly-based detection keeping an exit for the unseen',
          '这里的未知类是对手有意造出来的，专门落在「已知良性」区域里面。开放空间不是被采样的，是被选择的，所以风险是对手的性质，不是分布的性质。',
          'The unknown classes here are crafted by an adversary to land inside the region marked known-benign. The open space is chosen rather than sampled, so the risk is a property of the opponent, not of a distribution.'),
      ],
      relations: [
        rel('two-error-tradeoff', 'emerges-from',
          '当「负类」是训练集之外的一切，两类错误里的虚警率就没有分布可以拿来算。拒识出口是这个权衡在一侧分布未知时变成的样子：第三种结局，再与两种错误做一次权衡——Chow 的错误—拒识曲线写的就是这条。',
          'When the negative class is everything outside training, the false-alarm rate of the two-error tradeoff has no distribution to be computed on. The reject option is what the tradeoff becomes when one side\'s distribution is unknown: a third outcome, traded once more against the two errors — which is what Chow\'s error–reject curve writes down.'),
        rel('self-nonself-discrimination', 'explains',
          '病原体的集合是开放的，所以唯一可用的参考集是封闭的那个——自我；其余全部送进出口。自我/非我判别因此是只有一个已知类、出口接在攻击上的开放集识别，它两种错误的代价不对称，正是出口宽度要付的那笔钱。',
          'The set of pathogens is open, so the only usable reference set is the closed one — self — and everything else goes to the exit. Self/non-self discrimination is therefore open-set recognition with a single known class and the exit wired to attack; the asymmetric cost of its two errors is the price the exit\'s width is paid in.'),
        rel('anomaly-as-signal', 'generates',
          '出口里堆着的就是候选异常：从每个已知类漏下来的样本，是现有类别吸收不了的残差。所以出口是让异常以「一堆」而不是「零星一点」的形式变得可见的那件仪器——在它们成为信号之前，还得先过伪差那一关。',
          'What piles up in the exit is the candidate anomalies: the cases that fell through every known class are the residual the current categories cannot absorb. The exit is thus the instrument that makes anomalies visible as a set rather than as stray points — and they still have to clear the artefact check before counting as signal.'),
      ],
      mistakenFor: bi(
        '最常被误当成「再加一个『其他』类」。用收集到的「其他」样本训练出的那个类仍然是封闭集——它只认识你恰好收到的那些其他，不认识没收到的。判据是把一个训练时完全没有的类别喂进去：封闭集分类器多半会带着高置信度把它判进某个已知类；只有会把它送进出口的，才是开放集识别。低置信度拒识（Chow）过不了这个测试。',
        'Most often mistaken for adding an "other" class. A class trained on the "other" samples you happened to collect is still a closed set: it knows the others you received, not the ones you did not. The test is to feed in a category entirely absent from training: a closed-set classifier will usually assign it to a known class with high confidence, and only a system that sends it to the exit is doing open-set recognition. Low-confidence rejection in Chow\'s sense fails this test.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/anomaly-as-signal',
    quantities: [
      q('残差', 'the residual', '观测值减去现有规则的预测；异常永远以这个差、而不是以原始值来度量', 'the observation minus what the current rule predicts; an anomaly is always measured as this gap, never as a raw value'),
      q('背景模型', 'the background model', '现有规则连同它自己的已知噪声；离群点只相对于它才有定义', 'the current rule together with its own known noise; an outlier is defined only relative to it'),
      q('伪差先验', 'the artefact prior', '在允许「新现象」之前，留给仪器、采样、处理这三种平凡解释的概率份额', 'the probability held for the three mundane explanations — instrument, sampling, processing — before novelty is allowed'),
    ],
    depth: {
      origin: bi(
        '作为一种做法，它以 1846 年勒维耶为范本：天王星轨道的残差不是观测误差，而是一颗未知行星，海王星在预言的位置被找到。1962 年库恩把「反常」定为范式更替的起点；2000 年代以后，数据科学把它形式化为一个给每个点打分的检测问题。',
        'As a practice its exemplar is Le Verrier in 1846: the residuals in Uranus\'s orbit were not observation error but an unknown planet, and Neptune was found where he said. Kuhn made anomaly the starting point of paradigm change in 1962, and from the 2000s data science formalised it as a detection problem that scores every point.',
      ),
      minimalForm: 'r = y − ŷ_背景 ；只有 P(r | 伪差) 也小到不可信时，r 才算信号',
      canonicalSubstrates: [
        sub('天王星残差与海王星', 'Uranus\'s residuals and Neptune', '天体力学', 'Celestial mechanics', 0,
          '天王星观测位置与牛顿力学算出的位置之差，被读成一颗未知行星的引力',
          'the gap between Uranus\'s observed and computed positions, read as the pull of an unknown planet',
          '同一套推理用到水星近日点上，预言了一颗不存在的「祝融星」：那个残差是真的，不完整的却是规则本身。一个残差说明规则不完整，却不说明是规则的哪一部分。',
          'The same reasoning applied to Mercury\'s perihelion predicted a planet, Vulcan, that does not exist: that residual was real, but what was incomplete was the rule itself. A residual says the rule is incomplete without saying which part of it.'),
        sub('宇宙微波背景的发现', 'The discovery of the cosmic microwave background', '宇宙学', 'Cosmology', 2,
          '彭齐亚斯与威尔逊花了近一年排除天线、地面和鸽粪，多出来的那几开尔文才算数',
          'Penzias and Wilson spending the better part of a year ruling out the antenna, the ground and pigeon droppings before the extra few kelvin could count',
          '这个残差成了信号，是因为隔壁恰好有一套理论在等它；没有 Dicke 组预言的那个背景温度，它会一直是「多余的噪声」。残差要被读进某个候选规则里才成为发现。',
          'This residual became a signal because a theory next door happened to be waiting for it; without the background temperature Dicke\'s group had predicted, it would have stayed excess noise. A residual becomes a discovery only when read into some candidate rule.'),
        sub('对撞机的鼓包搜寻', 'Bump hunting at a collider', '粒子物理', 'Particle physics', 1,
          '不变质量谱上某一处超出背景模型的事例数，局部显著性以标准差计',
          'an excess of events over the background model at one place on an invariant-mass spectrum, its local significance quoted in standard deviations',
          '扫过许多个质量窗口后，最大的那个残差是许多次抽样里的最大值——「别处效应」。2015 年 750 GeV 的双光子超出在更多数据下消失，就是这一条。最大残差是极值问题，不是单点问题。',
          'After scanning many mass windows, the largest residual is the maximum of many draws — the look-elsewhere effect. The 750 GeV diphoton excess of 2015 vanishing with more data is exactly this. The largest residual is an extreme-value question, not a single-point one.'),
        sub('南极臭氧洞', 'The Antarctic ozone hole', '大气科学', 'Atmospheric science', 2,
          '地面站 1985 年报告的低臭氧值，卫星数据里其实早有，只是被质量过滤标成了可疑读数',
          'the low ozone values reported from a ground station in 1985 having been in the satellite data all along, flagged as suspect by the quality filter',
          '伪差先验设得太高，自动过滤器就把发现吃掉了。这是「先控制伪差」这一步反过来对付这条结构的地方：排除平凡解释的门槛本身也是一个要校准的量。',
          'Set the artefact prior too high and the automatic filter eats the discovery. This is where the "control artefacts first" step turns against the structure: the bar for ruling out mundane explanations is itself a quantity that needs calibrating.'),
      ],
      relations: [
        rel('negative-control', 'emerges-from',
          '伪差先验是靠阴性对照卸掉的：一个在「不可能有信号」的地方——空白样、偏离源的指向、打乱标签的数据——同样出现的残差，是仪器而不是世界。残差成为信号，是在那个本该读零的探针真的读零之后。',
          'The artefact prior is discharged by a negative control: a residual that also appears where no signal can be — a blank, an off-source pointing, a label-shuffled dataset — is instrument, not world. A residual becomes a signal after the probe that ought to read zero actually reads zero.'),
        rel('alternative-mechanism-panel', 'special-case-of',
          '它就是把对照集固定下来的那个版本：能产生同一个离群点的替代机制被钉死为仪器、采样、处理三条，外加「规则不完整」。三条平凡解释的先验之和远大于新现象，所以对照集没走完时，最可能的答案几乎总是平凡的那个。',
          'It is the panel with its entries fixed: the alternative mechanisms that could produce the same outlier are pinned to instrument, sampling and processing, plus "the rule is incomplete". The three mundane entries carry far more prior than novelty, so until the panel is worked through the likeliest answer is almost always the mundane one.'),
        rel('extreme-value-theory', 'competes-with',
          '同一个离群点，一种读法是现有分布的尾巴恰好被抽到了，另一种是它来自另一个分布。别处效应就是承认许多残差里最大的那个本身服从极值分布——所以在宣布新现象之前，先要算出「就这个分布、这么多次，最大值该有多大」。',
          'The same outlier can be read as the tail of the distribution you already have being drawn, or as a draw from a different distribution. The look-elsewhere effect is the admission that the largest of many residuals is itself extreme-value distributed — so before announcing novelty one has to compute how large the maximum of this many draws from this distribution ought to be.'),
      ],
      mistakenFor: bi(
        '最常被误当成「离群点都不能删」。这条结构说的是离群点是一个可检验的残差，而多数残差过不了检验。判据有两个：它是否在独立的仪器或样本里再次出现；它是否在阴性对照里消失。两个都过了，才轮到「规则不完整」这个解释——而且那时也只知道规则漏了什么，不知道漏在哪。',
        'Most often mistaken for a rule that outliers must never be dropped. What the structure says is that an outlier is a testable residual, and most residuals fail the test. The tests are two: does it reappear in an independent instrument or sample, and does it vanish in the negative control. Only when both are passed does "the rule is incomplete" get its turn — and even then one knows that the rule missed something, not where.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/extreme-value-theory',
    quantities: [
      q('区组极大值 M_n', 'the block maximum M_n', 'n 个抽样里最大的那个；普适的是它的极限律，不是单个样本的分布', 'the largest of n draws; its limit law is what is universal, not the distribution of a single draw'),
      q('形状参数 ξ', 'the shape parameter ξ', '选定三族之一的那个数：ξ < 0 有上界（Weibull），ξ = 0 指数尾（Gumbel），ξ > 0 重尾（Fréchet）', 'the one number that picks the family: ξ < 0 bounded above (Weibull), ξ = 0 exponential tail (Gumbel), ξ > 0 heavy tail (Fréchet)'),
      q('重现期 T', 'the return period T', '超过某一水平的平均等待时间，即每区组超过概率的倒数——「百年一遇」用的单位', 'the mean waiting time for a level to be exceeded, the reciprocal of the per-block exceedance probability — the unit in which "the 100-year flood" is quoted'),
    ],
    depth: {
      origin: bi(
        '1928 年 Fisher 与 Tippett 在统计学中给出极大值只能落进三族分布的结果，1943 年 Gnedenko 给出严格证明；1939 年 Weibull 从材料强度的「最弱环节」独立得到第三族；1958 年 Gumbel 的《极值统计》把它交给了水文与工程。',
        'Fisher and Tippett showed in statistics in 1928 that maxima can only converge to one of three families, and Gnedenko proved it rigorously in 1943; Weibull reached the third family independently in 1939 from the weakest link in material strength; Gumbel\'s Statistics of Extremes in 1958 handed it to hydrology and engineering.',
      ),
      minimalForm: 'P((M_n − b_n)/a_n ≤ x) → G_ξ(x) = exp{−[1 + ξx]^(−1/ξ)}',
      canonicalSubstrates: [
        sub('百年一遇的洪水', 'The 100-year flood', '水文学', 'Hydrology', 2,
          '年最大流量拟合之后，被超过概率为百分之一的那个水位',
          'the level with a one-per-cent chance of being exceeded in a year, read off a fit to annual maximum discharge',
          '重现期假定平稳；气候在变时，「百年一遇」的水位是某个时期的性质而不是这条河的性质，参数必须允许随时间漂移。',
          'A return period assumes stationarity; under a changing climate the 100-year level is a property of a period rather than of the river, and the parameters have to be allowed to drift with time.'),
        sub('脆性材料的 Weibull 强度', 'Weibull strength of brittle materials', '材料科学', 'Materials science', 1,
          '一块陶瓷的强度是它所有微裂纹里最弱那条的强度；Weibull 模量与这里的形状参数一一对应',
          'the strength of a ceramic being that of the weakest of its microcracks, with the Weibull modulus standing in for the shape parameter here',
          '这是极小值而非极大值的定律，靠变号得到；而且它假设各环节独立——一条裂纹把载荷转给邻居（纤维束）时，独立性没了，律也跟着变。',
          'This is the law of minima rather than maxima, reached by a change of sign; and it assumes the links are independent — once a crack hands its load to neighbours, as in a fibre bundle, independence goes and the law changes with it.'),
        sub('巨灾再保险', 'Catastrophe reinsurance', '精算学', 'Actuarial science', 1,
          '单次巨灾损失的尾部落在 Fréchet 域，ξ 的估计明显大于零',
          'the tail of single-event catastrophe losses falling in the Fréchet domain, with ξ estimated well above zero',
          '当 ξ ≥ 1 时均值不存在，而保险定价用的正是期望损失；几十年数据估出来的尾部，置信区间常比估计值本身还宽。',
          'When ξ ≥ 1 the mean does not exist, and expected loss is precisely what pricing uses; a tail estimated from a few decades of data often has a confidence interval wider than the estimate itself.'),
        sub('海洋平台的设计波高', 'Design wave height for an offshore platform', '海洋工程', 'Ocean engineering', 0,
          '每年一个最大波高，三十年数据就是三十个点',
          'one maximum wave height per year, so thirty years of data are thirty points',
          '区组极大值扔掉了每年除一个以外的全部观测；「超阈值」方法保留更多数据，代价是要选阈值，而估计随阈值而变。数据量与主观选择在这里互换。',
          'Block maxima discard every observation but one per year; the peaks-over-threshold variant keeps more, at the price of choosing the threshold, and the estimate moves with that choice. Data and a subjective choice trade off here.'),
      ],
      relations: [
        rel('anomaly-as-signal', 'competes-with',
          '一个远超其余的点，可以是已知分布在这么多次抽样里本就该出一次的极大值，也可以来自另一个分布。极值理论给前一种读法一个可算的数：n 次抽样的最大值该有多大；只有当观测到的点超出这个数时，「规则不完整」才有资格上场。判定用哪种读法，是两条结构共同的开放问题。',
          'A point far beyond the rest can be the maximum the known distribution was always going to produce in this many draws, or a draw from a different distribution. Extreme-value theory gives the first reading a number — how large the maximum of n draws ought to be — and only when the observed point exceeds it does "the rule is incomplete" get to speak. Deciding which reading applies is the open problem the two structures share.'),
        rel('power-laws-scale-free', 'explains',
          'Fréchet 吸引域恰好就是幂律尾：生存函数正则变化、指数为 α 时，ξ = 1/α。所以幂律尾在操作上意味着什么——n 次抽样的最大值按 n^(1/α) 增长、一次事件能压过整个总和——是极值理论说出来的；Hill 估计的 α 就是 ξ 的估计。',
          'The Fréchet domain of attraction is exactly the power-law tail: a regularly varying survival function with exponent α has ξ = 1/α. So what a power-law tail means operationally — the maximum of n draws growing as n^(1/α), one event able to dominate the whole sum — is extreme-value theory\'s statement, and a Hill estimate of α is an estimate of ξ.'),
        rel('fatigue-accumulation', 'explains',
          '疲劳寿命的离散度与尺寸效应来自一个极小值：构件寿命是众多裂纹起始点各自寿命中最短的那个，而有下界的许多抽样的极小值服从第三族（Weibull）。所以疲劳数据的 Weibull 模量是一个极值形状参数，不是经验拟合常数；试件越大、起始点越多，极小值越小。',
          'The scatter of fatigue life and its size effect come from a minimum: a component\'s life is the shortest among the lives of its many crack-initiation sites, and the minimum of many bounded-below draws follows the third family (Weibull). The Weibull modulus of fatigue data is therefore an extreme-value shape parameter rather than an empirical fitting constant, and a larger specimen with more sites has a smaller minimum.'),
      ],
      mistakenFor: bi(
        '最常被误当成「关于重尾或黑天鹅的理论」。它管的是任何分布的极大值，包括轻尾：正态分布的极大值也收敛，到 Gumbel 族。它的内容是三族分裂与 ξ 的符号，不是尾巴重不重。做这行时更常犯的错是用三十年记录报一个千年水位，只报点估计不报区间——超出记录长度的重现水平是外推，其不确定性由 ξ 的误差主导，而 ξ 恰恰是从最少的那几个点里估出来的。',
        'Most often mistaken for a theory of heavy tails or black swans. It governs the maximum of any distribution, light tails included: the maximum of normal draws converges too, to the Gumbel family. Its content is the three-way split and the sign of ξ, not how heavy the tail is. The commoner mistake in practice is quoting a thousand-year level from thirty years of record as a point without an interval — a return level beyond the record length is an extrapolation whose uncertainty is dominated by the error in ξ, and ξ is estimated from precisely the fewest points.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/bayesian-surprise',
    quantities: [
      q('先验 P(M)', 'the prior P(M)', '看到这个数据之前对各个候选模型的信念', 'what was believed about the candidate models before the datum'),
      q('后验 P(M | D)', 'the posterior P(M | D)', '看到之后的信念；惊讶度量的是从前者到后者走了多远', 'what is believed after; surprise measures how far the move from the first to the second was'),
      q('惊讶度 KL(后验 ‖ 先验)', 'the surprise KL(posterior ‖ prior)', '信念被移动的距离，以比特计；它给「看哪里」排序', 'the distance belief was moved, in bits; what ranks where to look'),
      q('期望信息增益', 'expected information gain', '对一个还没做的实验，把惊讶度按它自己预测的各种结果加权平均；这一步把度量变成了设计判据', 'surprise averaged over the outcomes an experiment not yet run is predicted to give; the step that turns the measure into a design criterion'),
    ],
    depth: {
      origin: bi(
        '1956 年 Lindley 在统计学中把「一个实验能提供多少信息」定义为先验到后验的期望 KL 散度，作为实验设计的判据；2005 年 Itti 与 Baldi 在计算神经科学中把单次的那个 KL 命名为「贝叶斯惊讶」，并证明它比亮度或对比度更能预测人眼落在视频的哪里。',
        'Lindley defined how much information an experiment provides as the expected KL divergence from prior to posterior in statistics in 1956, as a criterion for experimental design; Itti and Baldi named the single-datum version Bayesian surprise in computational neuroscience in 2005 and showed it predicts where people look in video better than brightness or contrast.',
      ),
      minimalForm: 'S(D) = KL(P(M|D) ‖ P(M)) ；EIG(e) = 𝔼_{D∼e}[S(D)] = I(M; D)',
      canonicalSubstrates: [
        sub('视频中的注视点', 'Gaze on video', '计算神经科学', 'Computational neuroscience', 2,
          '每个位置上一个小模型的先验被新帧移动了多少，注视落在移动最大的地方',
          'how far each location\'s small model has its prior moved by the new frame, with gaze landing where the move is largest',
          '惊讶预测注视优于显著性，但在「相信」的是实验者搭的模型，不是观看者的；拟合的对象是一个替身先验，换一个先验的观看者会在别处惊讶。',
          'Surprise predicts gaze better than saliency, but the believing is done by the experimenter\'s model, not the viewer\'s; the fit is to a stand-in prior, and a viewer with a different prior is surprised elsewhere.'),
        sub('贝叶斯最优实验设计', 'Bayesian optimal experimental design', '统计学', 'Statistics', 3,
          '在候选实验中选期望信息增益最大的那个去做',
          'choosing, among candidate experiments, the one with the largest expected information gain to run',
          '期望是按模型自己的预测取的，先验错得厉害时，「最有信息」的实验会是那个最能确认错误模型的实验；而假设空间之外的实验，它根本打不了分。',
          'The expectation is taken over the model\'s own predictions, so a badly wrong prior makes the most informative experiment the one that best confirms the wrong model; and an experiment outside the hypothesis space it cannot score at all.'),
        sub('婴儿的注视时长', 'Infant looking time', '发展心理学', 'Developmental psychology', 1,
          '违反预期的事件（物体穿墙而过）让婴儿看得更久，注视时长被当作后验被移动的读数',
          'events that violate expectation — an object passing through a wall — held longer in an infant\'s gaze, with looking time read as the posterior being moved',
          '注视时长还受熟悉性偏好驱动，方向会随年龄与暴露量翻转（有时偏新、有时偏熟），所以看得久并不单调地对应惊讶度。',
          'Looking time is also driven by a familiarity preference whose direction flips with age and exposure — sometimes towards the novel, sometimes towards the familiar — so longer looking is not monotone in surprise.'),
        sub('主动学习', 'Active learning', '机器学习', 'Machine learning', 3,
          '每次向标注者要那个对模型参数期望信息增益最大的样本',
          'asking the labeller each time for the sample with the largest expected information gain about the parameters',
          '单步贪心忽略了标签成批到来、代价各异；它还会专挑离群点，因为离群点对一个之后并不重要的模型最有信息——追逐离群点是这个判据自带的毛病。',
          'One-step greed ignores that labels arrive in batches at differing costs; it also picks outliers, because an outlier is most informative about a model that then does not matter — outlier-chasing is a fault the criterion carries with it.'),
      ],
      relations: [
        rel('shannon-entropy', 'special-case-of',
          '一个实验的期望惊讶度恰好就是假设与结果之间的互信息：I(M;D) = H(M) − 𝔼[H(M|D)]，即熵的期望减少量。好奇心是香农的信道量，只是把假设当信源、把实验当信道。',
          'The expected surprise of an experiment is exactly the mutual information between hypothesis and outcome, I(M;D) = H(M) − E[H(M|D)], the expected reduction in entropy. Curiosity is Shannon\'s channel quantity with the hypothesis as the source and the experiment as the channel.'),
        rel('variational-free-energy', 'special-case-of',
          '主动推断里的期望自由能分成两项：认知价值与实用价值。去掉实用项，剩下的认知项就是对隐状态的期望信息增益，也就是期望惊讶度——所以最小化期望自由能的系统，在它认知的那一半里做的正是最大化这个量；好奇心是除了知识别无所求时自由能最小化的样子。',
          'Expected free energy in active inference splits into two terms, epistemic and pragmatic. Drop the pragmatic term and what remains is the expected information gain about hidden states, which is expected surprise — so a system minimising expected free energy is, in its epistemic half, maximising this quantity; curiosity is what free-energy minimisation looks like when nothing is at stake but knowledge.'),
        rel('explore-exploit-tension', 'explains',
          '它给探索那一侧一种货币：尝试新东西的价值就是它预期带回的信息，于是这个对立可以写成一个目标——期望回报加 λ 倍期望惊讶——而不是一个拍脑袋定下的探索份额。它也说明了为什么在非平稳环境里探索永远停不下来：先验一直在过期。',
          'It gives the exploring side a currency: the value of trying something new is the information it is expected to bring back, so the tension can be written as one objective — expected reward plus λ times expected surprise — instead of an exploration share set by rule of thumb. It also says why exploring never ends in a non-stationary world: the prior keeps going stale.'),
        rel('anomaly-as-signal', 'explains',
          '「异常」的定量含义就是它：一个残差的大小，用当前模型自己的不确定性做单位来量，就是它的惊讶度。但这个量不分伪差与新现象——仪器故障是最让人惊讶的事——所以惊讶度只能给残差排队，不能替它们过伪差那一关。',
          'It is what "anomalous" means quantitatively: the size of a residual, measured in units of the current model\'s own uncertainty, is its surprise. But the quantity does not separate artefact from novelty — an instrument fault is the most surprising thing of all — so surprise can rank residuals and cannot clear them of artefact for them.'),
      ],
      mistakenFor: bi(
        '最常被误当成香农的自信息 −log P(D)，即「这个数据有多不可能」。纯噪声的自信息很高，却移不动任何信念——一个模型学不到东西的数据，它的 KL 是零。判据是：先验到后验是否真的移动了；只是不可能，不算惊讶。',
        'Most often mistaken for Shannon\'s self-information, −log P(D), how improbable the datum was. Pure noise has high self-information yet moves no belief: a datum a model cannot learn from has a KL of zero. The test is whether the posterior actually moved from the prior; merely improbable is not surprising.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/optimal-stopping',
    quantities: [
      q('视野 n', 'the horizon n', '序列有多长，或者还能看多少个；n/e 里的那个 n', 'how long the sequence is, or how many more can be seen; the n in n/e'),
      q('单次观察成本 c', 'the cost per observation c', '再看一个要付的东西：时间、钱，或者一个正在过期的选项', 'what one more look costs: time, money, or an option that is expiring'),
      q('保留门槛', 'the reservation threshold', '停下来优于继续的那个值；秘书问题里是「超过历史最优」，Wald 检验里是两条似然比边界', 'the value at which stopping beats continuing; "beats every one seen" in the secretary problem, the two likelihood-ratio boundaries in Wald\'s test'),
    ],
    depth: {
      origin: bi(
        '1947 年 Wald 的《序贯分析》在统计学中给出第一个完整的停止规则（序贯概率比检验，源于战时的验收抽样）；一般理论由 Snell 于 1952 年给出；秘书问题在 1960 年前后流传开来，n/e 的解由 Lindley（1961）与 Dynkin（1963）各自给出。',
        'Wald\'s Sequential Analysis gave statistics its first complete stopping rule in 1947, the sequential probability ratio test that grew out of wartime acceptance sampling; Snell gave the general theory in 1952; the secretary problem circulated around 1960 and its n/e solution was given separately by Lindley in 1961 and Dynkin in 1963.',
      ),
      minimalForm: '跳过前 n/e 个，取第一个超过历史最优者 ⇒ P(选中最优) → 1/e ≈ 0.37',
      canonicalSubstrates: [
        sub('秘书问题', 'The secretary problem', '运筹学', 'Operations research', 0,
          '按顺序面试 n 位候选人，只知相对名次，不能回头：先看 n/e 个，再取第一个超过前面所有人的',
          'n candidates interviewed in order, with only relative ranks known and no going back: look at n/e, then take the first who beats everyone before',
          '它最大化的是「选中最好那一个」的概率，只用名次信息，而且不许回头。一旦知道分数的分布，或允许回头，最优规则整个变样，1/e 也随之消失。',
          'It maximises the probability of picking the single best, uses rank information only, and forbids recall. Once the distribution of scores is known, or recall is allowed, the optimal rule changes entirely and the 1/e goes with it.'),
        sub('Wald 的序贯概率比检验', 'Wald\'s sequential probability ratio test', '统计学', 'Statistics', 2,
          '每来一个观测就更新对数似然比，碰到上边界接受、碰到下边界拒绝，否则继续',
          'updating the log-likelihood ratio with each observation, accepting at the upper boundary, rejecting at the lower, and continuing otherwise',
          '它对两个简单假设最优；真值落在两个假设之间时，期望样本量可以比固定样本检验还大。省样本的承诺只对它设计时假定的那两个点成立。',
          'It is optimal for two simple hypotheses; when the truth lies between them the expected sample size can exceed that of a fixed-sample test. The promise of fewer samples holds only at the two points it was designed for.'),
        sub('求职者的保留工资', 'A job seeker\'s reservation wage', '劳动经济学', 'Labour economics', 1,
          '每多看一份工作要付搜寻成本，接受第一个高于保留工资的报价',
          'each further offer costing search, with the first offer above the reservation wage accepted',
          '保留工资假设报价是从一个已知分布里独立抽出的；求职者一边找一边学这个分布时，保留工资自己会漂，规则不再是一条固定门槛。',
          'The reservation wage assumes offers are independent draws from a known distribution; when the seeker learns the distribution while searching, the reservation wage itself drifts and the rule stops being a fixed threshold.'),
        sub('觅食者何时离开一片食源', 'When a forager leaves a patch', '行为生态学', 'Behavioural ecology', 1,
          '边际值定理：此处的摄入速率降到整个栖息地的平均速率时就走，成本是路上的时间',
          'the marginal value theorem: leave when the intake rate here falls to the habitat\'s average, the cost being travel time',
          '这是速率最大化而不是「选中最优」问题，食源确定性地耗竭，而且总有下一片——它停的是一个速率，秘书问题停的是一个名次；两者的答案不能互换。',
          'This is rate maximisation rather than a pick-the-best problem: the patch depletes deterministically and there is always another one. It stops on a rate where the secretary problem stops on a rank, and the two answers do not transfer.'),
      ],
      relations: [
        rel('preregistration', 'competes-with',
          '两者是「什么时候停止收集」的两个答案：一个让数据决定 N，但边界在开始前定好，错误率由边界保证；另一个把 N 本身定死，杜绝看一眼再决定。它们争的其实只有一件事——N 可不可以依赖数据——而它们共同禁止的是看到数据之后再选规则。预注册一个序贯规则可以两者兼得，所以这条竞争比看起来窄。',
          'Two answers to when to stop collecting: let the data decide N under boundaries fixed before the start, with the error rate guaranteed by the boundaries; or fix N itself, so that looking and then deciding is impossible. What they actually contest is one thing — whether N may depend on the data at all — and what they jointly forbid is choosing the rule after seeing the data. A preregistered sequential rule does both, which makes this rivalry narrower than it looks.'),
        rel('commitment-device', 'special-case-of',
          '在数据到来之前定下的停止规则，是对自己未来那个人的承诺装置：放弃的选项是「再看一个再决定」，让读者看见这份放弃，是报出来的错误率可信的原因。数据来了之后才定的规则不是承诺装置，也不是停止规则——是换了名字的随意停止。',
          'A stopping rule fixed before the data arrive is a commitment device against one\'s own future self: the option given up is to look once more and then decide, and the reader seeing that it was given up is why the reported error rate is believable. A rule settled as the data come in is neither a commitment device nor a stopping rule — it is optional stopping under another name.'),
        rel('bayesian-surprise', 'emerges-from',
          '贝叶斯序贯设计里，停止规则就是「只要期望惊讶度还高于再看一个的成本就继续」。所以一旦每个观测有了价格，最优停止就是惊讶度自己长出来的东西；秘书问题的 n/e 是它在只有名次可看时退化成的样子。',
          'In Bayesian sequential design the stopping rule is exactly "continue while expected surprise exceeds the cost of one more datum". So once each observation has a price, optimal stopping is what surprise grows into on its own; the secretary problem\'s n/e is what it degenerates to when only ranks can be seen.'),
        rel('explore-exploit-tension', 'special-case-of',
          '秘书问题是把利用压缩成一次不可撤销的选择之后的探索—利用对立：前 n/e 个只看不取，是纯探索；此后第一个超过者即取，是纯利用。1/e 就是当你只能利用一次时，那个分割变成的数。',
          'The secretary problem is the explore-exploit tension with exploitation compressed into one irrevocable pick: the first n/e are looked at and never taken, pure exploration; the first to beat them afterwards is taken, pure exploitation. The 1/e is what the split becomes when you can exploit exactly once.'),
      ],
      mistakenFor: bi(
        '做这件事时最常犯的错，是把「数据看起来已经够有说服力了」当成停止规则。那不是规则，是随意停止：每多看一眼都是一次新的检验机会，虚警率随之上涨。判据只有一个——这条规则能不能在第一个观测到来之前就写下来。另一个误认是把 37% 当作通用建议：它只在「只认名次、不许回头、只求最好」三个条件下成立，把目标换成期望值或允许回头，规则和 37% 都跟着变。',
        'The commonest mistake in doing it is taking "the data look convincing enough now" for a stopping rule. That is not a rule but optional stopping: every further look is another chance to test, and the false-alarm rate climbs with it. The one test is whether the rule could have been written down before the first observation arrived. The other misreading is taking 37% as general advice: it holds only under rank-only information, no recall and wanting the very best; change the objective to expected value or allow recall, and both the rule and the 37% change with it.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/measurement-backaction',
    depth: {
      origin: bi(
        '1927 年海森堡的显微镜论证把它说成「测量扰动被测量」，尽管以他命名的那条不等式后来被证明约束的是态的制备而非测量；2003 年 Ozawa 给测量—扰动关系写出了它自己的不等式。社会科学独立地撞上了它：1920 年代西电公司霍桑工厂的研究，在 1950 年代被命名为霍桑效应。',
        'Heisenberg\'s 1927 microscope argument stated it as measurement disturbing the measured, although the inequality bearing his name turned out to constrain the preparation of a state rather than its measurement; Ozawa gave the measurement–disturbance relation an inequality of its own in 2003. Social science ran into it independently: the 1920s studies at Western Electric\'s Hawthorne works, named the Hawthorne effect in the 1950s.',
      ),
      minimalForm: 'ε(A)·η(B) + ε(A)·σ(B) + σ(A)·η(B) ≥ ħ/2  （Ozawa；ε 为测量误差，η 为对共轭量的扰动）',
      canonicalSubstrates: [
        sub('Stern–Gerlach 装置', 'A Stern–Gerlach apparatus', '量子物理', 'Quantum physics', 0,
          '沿一个轴测自旋，把态投影到那个轴上；随后沿另一轴再测，发现态已经变了',
          'measuring spin along one axis projects the state onto it; a second measurement along another axis then finds the state changed',
          '投影测量的反作用是全部且不可减的；但弱测量在信息与扰动之间连续换算，所以「测了就塌缩」是强测量极限，不是规则。这个家基底反而最容易被读过头。',
          'For a projective measurement the back-action is total and irreducible; but weak measurement trades information against disturbance continuously, so "measured, therefore collapsed" is the strong-measurement limit rather than the rule. The home substrate is the one most easily over-read.'),
        sub('霍桑效应', 'The Hawthorne effect', '社会心理学', 'Social psychology', 2,
          '被反复观察本身改变了工人的产量，与照明怎么调无关',
          'being repeatedly observed changing the workers\' output regardless of how the lighting was changed',
          '这里的扰动经由「知道自己被观察」传递，所以能靠盲法与不引人注意的测量去掉——量子基底没有这条退路；而且对原始数据的重新分析发现，原效应远小于教科书里的版本。',
          'The disturbance here runs through knowing one is observed, so it can be removed by blinding and unobtrusive measurement — an escape the quantum substrate lacks; and re-analysis of the original data found the effect far smaller than the textbook version.'),
        sub('电压表的负载效应', 'Voltmeter loading', '电子工程', 'Electronic engineering', 0,
          '表要抽电流，抽了电流被测点的电压就降了；输入阻抗决定反作用大小',
          'the meter draws current, and drawing current lowers the voltage at the point measured; input impedance sets the back-action',
          '这是经典、确定且可完全修正的反作用：知道表的阻抗就能算出未接表时的电压。它是「把反作用估出来再扣掉」能做完整的那个案例，而量子扰动是随机的，扣不掉。',
          'Back-action here is classical, deterministic and fully correctable: knowing the meter\'s impedance gives the unloaded voltage exactly. It is the case where estimating and subtracting the back-action can be completed, whereas quantum disturbance is random and cannot be subtracted.'),
        sub('标记重捕中的行为反应', 'Behavioural response in mark–recapture', '生态学', 'Ecology', 2,
          '被捕过一次的动物变得「趋捕」或「避捕」，改变了它再次被捕的概率',
          'an animal once trapped becoming trap-happy or trap-shy, changing its probability of being caught again',
          '反作用改变的恰恰是「再次被观测的概率」，于是它同时是一个选择偏差——两条结构在这里缠在一起，在别处不会。',
          'The back-action changes precisely the probability of being observed again, so it is at the same time a selection bias — the two structures are entangled here in a way they are not elsewhere.'),
      ],
      relations: [
        rel('conjugate-uncertainty', 'competes-with',
          '同一句教科书话的两种读法。海森堡不等式约束的是一个态能在两个共轭表象里同时多窄——无论有没有人测都成立；反作用是动力学主张：测其中一个扰动另一个，有它自己的不等式（Ozawa，2003），在那里朴素的乘积 ε(x)·η(p) ≥ ħ/2 可以被违反。一个「不确定性」实验测的到底是哪一个，每次都得单独判定，这是把它们列为对手而不是一条结构的原因。',
          'Two readings of one textbook sentence. Heisenberg\'s inequality bounds how narrow a state can be in both conjugate representations at once, and holds whether or not anyone measures; back-action is the dynamical claim that measuring one disturbs the other, with an inequality of its own (Ozawa, 2003) in which the naive product ε(x)·η(p) ≥ ħ/2 can be violated. Which of the two a given "uncertainty" experiment tests has to be settled each time, which is why they are filed as rivals rather than as one structure.'),
        rel('perturb-and-read', 'explains',
          '扰动—响应就跑在反作用上：会扰动的测量是唯一能带回因果而非相关信息的测量，这条方法把扰动做成有意的、把响应当信号读。对被动观察者是偏差的那个量，对施加扰动的人就是信号——同一个量，换了立场。',
          'Perturb-and-read runs on back-action: a measurement that disturbs is the only kind that returns causal rather than correlational information, and the method makes the disturbance deliberate and reads the response as signal. The quantity that is bias for a passive observer is the signal for whoever perturbs — one quantity, seen from the other side.'),
        rel('metric-distortion', 'generates',
          '古德哈特定律是回路里多了一个优化者的反作用：公布指标是测量，被测者的应对是扰动，优化压力把测量频次拧到了连续。所以指标与目标脱钩的速度随奖励的力度上升——反作用强度在这里是被人为放大的。',
          'Goodhart\'s law is back-action with an optimiser in the loop: publishing the measure is the measurement, the measured party\'s response is the disturbance, and optimisation pressure turns the measurement frequency up to continuous. That is why measure and goal decouple faster the harder the metric is rewarded — the back-action strength here is deliberately amplified.'),
      ],
      mistakenFor: bi(
        '最常被误当成测量误差。误差是加在读数上的噪声，反作用改变的是被测的东西本身。判据是对同一个系统重复测量：噪声随重复被平均掉，反作用随重复累积——测量频次那一项，正是把两者分开的那个旋钮。把反作用当误差处理的人会多测几次求平均，然后得到一个更精确的、属于被测坏了的系统的值。',
        'Most often mistaken for measurement error. Error is noise added to the reading; back-action changes the thing measured. The test is to repeat the measurement on the same system: noise averages away with repetition and back-action accumulates with it — the measurement-frequency term is exactly the knob that separates the two. Whoever treats back-action as error measures a few more times and averages, and obtains a more precise value belonging to the system they have damaged.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/distributed-field-observability',
    quantities: [
      q('传递函数 G', 'the transfer function G', '某处一个单位事件在某个传感器上引起的场响应；反演之前必须先校准的那个东西', 'the field response at a sensor to a unit event at a point; what has to be calibrated before anything can be inverted'),
      q('传感孔径', 'the sensing aperture', '传感器的数量、间距与摆放；它决定哪些事件彼此分得开', 'the number, spacing and placement of sensors; what decides which events can be told apart'),
      q('背景噪声', 'the background noise', '没有事件时场自己的起伏；它设定探测下限，并与 G 一起决定关于事件的信息量', 'the field\'s own fluctuation with no event; it sets the detection floor and, with G, how much information about the event there is'),
      q('可观测性格拉姆矩阵 W_o', 'the observability Gramian W_o', '把 G、孔径与噪声合成一个矩阵，它的秩与条件数说出哪些事件参数根本能不能被恢复', 'G, aperture and noise folded into one matrix whose rank and conditioning say which event parameters can be recovered at all'),
    ],
    depth: {
      origin: bi(
        '「可观测性」由 Kalman 于 1960 年在控制理论中定义为可控性的对偶；从分布式的场里读出一个事件的做法更早：1910 年 Geiger 用台网各站的到时定出震源，1940–60 年代的阵列信号处理给了它「孔径」这套语言。',
        'Observability was defined by Kalman in control theory in 1960 as the dual of controllability; reading an event out of a distributed field is older, with Geiger locating earthquakes from arrival times across a network of stations in 1910, and array signal processing from the 1940s to the 1960s supplying the language of aperture.',
      ),
      minimalForm: 'y = G·s + n ；事件可反演 ⟺ W_o = Gᵀ R⁻¹ G 满秩（R 为噪声协方差）',
      canonicalSubstrates: [
        sub('地震定位', 'Locating an earthquake', '地震学', 'Seismology', 0,
          '各台站的到时之差，通过地壳速度模型换算成震源的位置与发震时刻',
          'differences in arrival time across stations converted through a crustal velocity model into the source\'s position and origin time',
          '传递函数（地球的速度结构）本身未知，要从同一批数据里估；震源深度与速度模型互相抵换，所以校准与反演在这里分不开。',
          'The transfer function — the Earth\'s velocity structure — is itself unknown and estimated from the same data; depth and velocity model trade off against each other, so calibration and inversion cannot be separated here.'),
        sub('闪电定位网', 'Lightning location networks', '气象学', 'Meteorology', 1,
          '各站收到的甚低频脉冲的到时与方向，交叉出一次放电的位置',
          'the arrival time and bearing of a very-low-frequency pulse at each station triangulating one discharge',
          '脉冲在地—电离层波导里传播，传递函数昼夜不同，所以校准必须随时间变；孔径固定并不意味着 G 固定。',
          'The pulse travels in the Earth–ionosphere waveguide, whose transfer function differs by day and night, so calibration has to vary with time: a fixed aperture does not mean a fixed G.'),
        sub('引力波探测器网络', 'A gravitational-wave detector network', '天体物理', 'Astrophysics', 1,
          '两台探测器的到时差把源定在天球上的一个环，第三台把环收成一小块——孔径就是探测器的台数',
          'the time delay between two detectors placing the source on a ring in the sky, a third collapsing the ring to a patch — the aperture is literally the number of detectors',
          '背景噪声非平稳、有毛刺，而且「事件」需要一个波形模板：模板库之外的源是看不见的。这条结构在这里交棒给开放集识别。',
          'The background is non-stationary and glitchy, and the "event" needs a waveform template: a source outside the template bank is invisible. This is where the structure hands off to open-set recognition.'),
        sub('脑电与脑磁的源定位', 'EEG and MEG source localisation', '神经影像', 'Neuroimaging', 3,
          '从头皮上的电位分布反推皮层里的电流源',
          'inferring the current sources in cortex from the potential distribution on the scalp',
          '即使数据完美，反问题也不唯一（Helmholtz，1853）：无穷多种源分布给出同一个头皮场，格拉姆矩阵是被物理而不是被孔径弄成秩亏的。正则化加的是一条假设，不是信息。',
          'Even with perfect data the inverse problem is non-unique (Helmholtz, 1853): infinitely many source configurations give the same scalp field, and the Gramian is rank-deficient by physics rather than by aperture. Regularisation adds an assumption, not information.'),
      ],
      relations: [
        rel('fisher-precision-limit', 'special-case-of',
          '线性—高斯系统的可观测性格拉姆矩阵就是关于其初态的费雪信息矩阵：W_o = Σₖ (CAᵏ)ᵀR⁻¹(CAᵏ) 正是 I(x₀)。于是一组传感器的分辨能力是一个 Cramér–Rao 下界，「不可观测」是费雪信息在某个方向上为零的说法。',
          'The observability Gramian of a linear-Gaussian system is the Fisher information matrix about its initial state: W_o = Σₖ (CAᵏ)ᵀR⁻¹(CAᵏ) is exactly I(x₀). A sensor arrangement\'s resolving power is therefore a Cramér–Rao bound, and "unobservable" is Fisher information being zero in some direction.'),
        rel('recursive-bayesian-filter', 'explains',
          '卡尔曼滤波能维持一个有界的状态估计，是因为系统可观测：有一个不可观测且自身不衰减的模态，误差协方差在那个方向上就会不受增益控制地增长。可观测性是可控性的对偶——(A, C) 可观测当且仅当 (Aᵀ, Cᵀ) 可控——这也是滤波与最优调节解的是同一个转置过来的 Riccati 方程的原因。',
          'The Kalman filter can hold a bounded state estimate because the system is observable: with a mode that is unobservable and does not decay on its own, the error covariance grows in that direction whatever the gain does. Observability is the dual of controllability — (A, C) is observable iff (Aᵀ, Cᵀ) is controllable — which is also why the filter and the optimal regulator solve the same Riccati equation transposed.'),
        rel('sparse-coding-compressed-sensing', 'emerges-from',
          '传感器比未知数少时，格拉姆矩阵秩亏，线性理论说事件不可观测。可观测性只在源于某个基下稀疏、且 G 与那个基不相干时回来：这时 min ‖s‖₁ 能把它恢复出来。所以孔径不足下的可观测性就是以 G 为感知矩阵的压缩感知，它靠的正是压缩感知总要多加的那条假设。',
          'With fewer sensors than unknowns the Gramian is rank-deficient and the linear theory says the event is unobservable. Observability comes back only if the source is sparse in some basis and G is incoherent with it, in which case min ‖s‖₁ recovers it. Sub-aperture observability is thus compressed sensing with G as the sensing matrix, resting on exactly the extra assumption compressed sensing always needs.'),
        rel('selection-bias-absence', 'generates',
          '孔径制造选择偏差：低于台网探测下限的事件从不进入目录，所以目录里的事件规模分布是真实分布乘以台网的探测概率。地震学的「完备震级」就是这个乘法开始起作用的地方的名字。',
          'An aperture manufactures a selection bias: an event below the network\'s detection floor never enters the catalogue, so a catalogue\'s distribution of event sizes is the true one multiplied by the network\'s detection probability. Seismology\'s "completeness magnitude" is the name for where that multiplication starts to bite.'),
      ],
      mistakenFor: bi(
        '最常被误当成探测。探测只说「发生了什么事」，可观测性说的是能不能从场里恢复出它的时间、位置或类别——两者之间隔着传递函数的校准。做这行时更常见的错是以为传感器越多越好：多一个传感器只有在它给格拉姆矩阵加了一个不是已有行线性组合的新方向时才增加可观测性，共线的传感器只能平均噪声。256 个电极治不了脑电反问题的非唯一性。',
        'Most often mistaken for detection. Detection says that something happened; observability says whether its time, place or class can be recovered from the field, and between the two lies the calibration of the transfer function. The commoner mistake in practice is assuming more sensors is better: another sensor adds observability only if it adds a direction to the Gramian that is not a linear combination of existing rows, and collinear sensors only average noise. Two hundred and fifty-six electrodes do not cure the non-uniqueness of the EEG inverse problem.',
      ),
    },
  },
];
