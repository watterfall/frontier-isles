import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the method-and-verification family — the
 * ways of finding out, rather than the things found.
 *
 * This is the family the learning layer needs most directly. Every entry here
 * is a technique a researcher chooses, so its canonical substrates are research
 * practices in different fields rather than natural phenomena, and its
 * `mistakenFor` names a mistake people actually make while doing the work
 * rather than a misreading of a textbook claim.
 *
 * Its relations are a different kind too. In the earlier families a relation
 * usually said one structure produces or generalises another; here it more often
 * says which method substitutes for which, and at what price. A natural
 * experiment and a deliberate perturbation are filed as `competes-with` for
 * exactly that reason: they do the same job — manufacture a contrast — and
 * differ in whether you control the assignment or have to argue it was clean.
 *
 * Three relations reach into the inference family and are worth stating
 * precisely. Aggregating independent judgements works because Fisher
 * information is additive over independent observations, which is also why
 * correlated assessors buy nothing. That same additivity is why aggregation
 * moves the whole ROC frontier where a threshold change only slides along it.
 * And a negative control is one alternative mechanism made concrete, which
 * makes it a special case of the panel rather than a separate trick.
 *
 * All eight are wave-4, wave-5 or wave-8 structures with declared quantities
 * already, so this batch is depth only. Same terms as before: textbook
 * knowledge, no island referenced, no mapping or coverage touched.
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

export const METHOD_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/preregistration',
    depth: {
      origin: bi(
        '1990 年代由临床试验注册制度确立（后成为 ICMJE 的发表前提），2013 年起以"注册报告"的形式进入心理学；它的出现是对复现危机的直接回应，而不是一开始就有的规范。',
        'Established by clinical-trial registration in the 1990s and later made a condition of publication by the ICMJE, entering psychology as Registered Reports from 2013; it arrived as a direct response to the replication crisis rather than as an original norm.',
      ),
      minimalForm: '在看到数据之前冻结结局、样本、分析路径与停止规则',
      canonicalSubstrates: [
        sub('临床试验', 'Clinical trials', '临床医学', 'Clinical medicine', 0,
          '主要结局、样本量与统计分析计划在入组前写死并公开',
          'the primary outcome, sample size and statistical plan fixed and published before enrolment',
          '注册了不等于遵守了：结局切换在已注册的试验里仍然常见，所以真正起作用的是注册加上事后比对，而不是注册本身。',
          'Registration is not adherence: outcome switching remains common among registered trials, so what works is registration plus a later comparison rather than registration alone.'),
        sub('注册报告', 'Registered Reports', '心理学', 'Psychology', 1,
          '在收集数据之前就完成同行评议并获得原则性接受，冻结时点被推到最早',
          'peer review completed and in-principle acceptance granted before data collection, pushing the freeze as early as it can go',
          '它把发表决定与结果脱钩，因此也移除了做漂亮结果的动力——代价是探索性研究被挤出这条通道，而探索本不该被预注册。',
          'It decouples publication from the result and so removes the incentive for a pretty one, at the price of squeezing exploratory work out of the channel — and exploration should not be preregistered in the first place.'),
        sub('模型评测', 'Model evaluation', '机器学习', 'Machine learning', 2,
          '评测集与指标在训练前锁定，实际执行与计划的差异被单独报告',
          'the evaluation set and metric locked before training, with any deviation reported separately',
          '这里没有独立的注册机构，冻结通常由同一批人自我执行——所以它更依赖可验证的时间戳（提交哈希、封存的测试集）而非制度。',
          'There is no independent registry here and the freeze is usually self-administered by the same people, so it leans on verifiable timestamps — commit hashes, sealed test sets — rather than on an institution.'),
        sub('预报校准', 'Forecast calibration', '预测科学', 'Forecasting', 0,
          '预报在事件发生前公开，说 70% 就该在 70% 的场合兑现',
          'a forecast published before the event, with seventy per cent meaning it comes true seven times in ten',
          '校准与准确不是一回事：一个永远预报气候平均值的预报者可以完美校准而毫无信息量，所以校准必须与分辨度一起报。',
          'Calibration is not accuracy: a forecaster who always predicts the climatological mean can be perfectly calibrated and carry no information, so calibration has to be reported alongside resolution.'),
      ],
      relations: [
        rel('selection-bias-absence', 'explains',
          '发表偏倚的机制是"被看见"这件事不随机——阴性结果系统性地不进入文献。预注册在结果出来之前就把研究登记在案，于是缺席本身变得可数，这正是对缺席建模所需要的那一步。',
          'Publication bias works because being seen is not random: null results systematically fail to enter the literature. Preregistration puts the study on record before the result exists, which makes the absences countable — exactly the step modelling absence requires.'),
        rel('two-error-tradeoff', 'explains',
          '事后选择阈值等于沿 ROC 曲线滑动之后再报告那一点的错误率，这样报出来的两类错误率不是它声称的那个量。冻结阈值不改善检验能力，它只是让报出来的数字确实指它声称指的东西。',
          'Choosing the threshold afterwards means sliding along the ROC curve and then reporting the error rates at wherever you stopped, so the reported rates are not the quantity they claim to be. Freezing the threshold does not improve the test; it makes the numbers mean what they say.'),
      ],
      mistakenFor: bi(
        '常被误当成"提高研究质量"。它不提高任何单项研究的正确率——一个预注册的坏设计仍然是坏设计。它改变的是可审计性：让"这条结论里有多少来自事后选择"从不可知变成可查，而这是关于文献整体而非单篇的性质。',
        'Often mistaken for improving research quality. It makes no single study more likely to be right — a preregistered bad design is still a bad design. What it changes is auditability: how much of a conclusion came from choosing afterwards moves from unknowable to checkable, which is a property of the literature rather than of any one paper.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/negative-control',
    depth: {
      origin: bi(
        '作为实验室常规由来已久，2010 年由 Lipsitch 等人在流行病学中形式化为"阴性对照暴露/结局"，用来检出未测混杂；2018 年后近端因果推断把它从检出工具升级为识别工具。',
        'Long routine at the bench, formalised for epidemiology by Lipsitch and colleagues in 2010 as negative-control exposures and outcomes for detecting unmeasured confounding, and upgraded from detection to identification by proximal causal inference after 2018.',
      ),
      minimalForm: '已知无效应的探针仍显出效应 ⇒ 该效应量就是残余混杂',
      canonicalSubstrates: [
        sub('流行病学的阴性对照', 'Negative controls in epidemiology', '流行病学', 'Epidemiology', 0,
          '一个不可能被处理影响的结局，若仍与暴露相关，相关的那部分就是混杂',
          'an outcome the treatment cannot possibly affect, whose remaining association with the exposure is the confounding',
          '探针必须与真实暴露共享同一套混杂路径，否则它检不出的东西不代表不存在——选错探针会给出虚假的安心。',
          'The probe must share the same confounding paths as the real exposure, or what it fails to detect says nothing about what is there, and a badly chosen probe gives false reassurance.'),
        sub('疫苗效力评估', 'Vaccine effectiveness studies', '公共卫生', 'Public health', 1,
          '用与疫苗无关的结局（如外伤就诊）读出健康使用者偏倚的大小',
          'reading the size of healthy-user bias off an outcome unrelated to vaccination, such as injury visits',
          '这里的读数只能校正与该探针共享的那部分偏倚；疫苗特有的行为差异不会出现在外伤上，所以校正后的残余仍未知。',
          'The reading corrects only the share of bias the probe shares; behaviour specific to vaccination does not show up in injuries, so what remains after correction is still unknown.'),
        sub('模型评测的泄漏检测', 'Leakage detection in model evaluation', '机器学习', 'Machine learning', 2,
          '用训练截止之后才出现的题目当探针，模型在上面的高分就是泄漏的量',
          'using items created after the training cut-off as the probe, where a high score measures the leakage',
          '时间探针只能检出时间型泄漏；同分布的重复题目、公开的解答与被抓取的评测集都绕过它，所以单一探针给出的是下界。',
          'A temporal probe catches temporal leakage only; near-duplicate items, published solutions and scraped benchmarks all route around it, so a single probe reports a lower bound.'),
      ],
      relations: [
        rel('alternative-mechanism-panel', 'special-case-of',
          '一个阴性对照就是把一条替代机制做成了具体探针："这个效应可能来自混杂"这条替代解释，被写成一个可测的量。所以它不是一个独立技巧，是对照集里被具体化的那一条。',
          'A negative control is one alternative mechanism made concrete: the rival explanation that the effect came from confounding, written as a measurable quantity. It is not a separate trick but the one entry of the panel that has been made testable.'),
        rel('selection-bias-absence', 'explains',
          '它给"被观测这件事不随机"提供了一个可读的刻度：探针上不该出现的效应有多大，进入样本这件事就有多不随机——于是选择偏差从一个定性担忧变成一个数。',
          'It puts a readable scale on being observed not being random: however large the effect that should not be there, that is how non-random entry into the sample was — turning selection bias from a qualitative worry into a number.'),
      ],
      mistakenFor: bi(
        '常被误当成"对照组"。对照组是没有接受处理的那一群人，阴性对照是一个不该有反应的探针——前者用来估计效应，后者用来估计偏差。把两者混为一谈，会以为有了对照组就不需要阴性对照。',
        'Often mistaken for a control group. A control group is the people who did not get the treatment; a negative control is a probe that should not respond. The first estimates the effect and the second estimates the bias, and conflating them leads to thinking a control group makes a negative control unnecessary.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/within-subject-control',
    depth: {
      origin: bi(
        '作为单受试者交叉设计在行为科学中长期使用，1980 年代由 Guyatt 等人以 N-of-1 试验的名义带进临床；2011 年被 BMJ 列为证据等级最高的设计之一——对那一个病人而言。',
        'Long used in behavioural science as the single-subject crossover and brought into the clinic as the N-of-1 trial by Guyatt and colleagues in the 1980s; the BMJ later ranked it among the highest levels of evidence — for that one patient.',
      ),
      minimalForm: '同一单位反复施加/撤除干预，用个体内前后差替代个体间比较',
      canonicalSubstrates: [
        sub('N-of-1 临床试验', 'N-of-1 clinical trials', '临床医学', 'Clinical medicine', 0,
          '一位病人交替接受药物与安慰剂，比较的是他自己的两种状态',
          'one patient alternating between drug and placebo, compared against their own other state',
          '它只对稳定的慢性状况有效：病程本身在变化时，前后差里混着自然进程，而这一项无法靠增加周期数消掉。',
          'It works only for stable chronic conditions: when the disease itself is moving, the within-individual difference contains natural history, and more periods do not remove that term.'),
        sub('自我实验', 'Self-experimentation', '个人健康', 'Personal health', 1,
          '在两次尝试之间留出足够长的间隔，让上一次的影响先消掉',
          'leaving a long enough gap between attempts for the previous one to wear off',
          '自我实验几乎无法盲法，而期望效应恰好最强——所以这里的洗脱期解决不了主要偏差，主要偏差是知道自己在吃什么。',
          'Self-experiments can hardly be blinded and expectancy effects are strongest exactly here, so a washout does not address the main bias, which is knowing what you took.'),
        sub('单机基准测试', 'Single-machine benchmarking', '计算机工程', 'Computer engineering', 2,
          '同一台机器上交替运行两个版本、重复多轮，消掉机器之间的差异',
          'alternating two versions on one machine over repeated rounds, removing the differences between machines',
          '这里的"残留效应"是缓存与热节流：前一轮会改变后一轮的条件，所以交替顺序本身必须随机化而不只是重复。',
          'Carry-over here is cache state and thermal throttling: each round changes the conditions for the next, so the alternation order itself has to be randomised rather than merely repeated.'),
      ],
      relations: [
        rel('perturb-and-read', 'special-case-of',
          '自身对照就是把扰动—响应做在一个完整个体上并重复多次：施加与撤除是扰动，个体内前后差是响应，洗脱期是为了让每一次扰动重新从同一个基线开始。',
          'Within-subject control is perturb-and-read applied to a whole individual and repeated: applying and withdrawing is the perturbation, the within-individual difference is the response, and the washout exists so each perturbation starts from the same baseline.'),
        rel('aggregating-independent-judgements', 'generates',
          '把成千上万个 N-of-1 结果汇总，就是一次独立判断聚合——也因此继承了它唯一的前提：这些个体实验必须真的相互独立，而自选参与与自选报告恰好破坏这一点。',
          'Pooling thousands of N-of-1 results is an aggregation of independent judgements, and it therefore inherits that structure\'s single premise: the individual experiments must genuinely be independent, which self-selected participation and self-selected reporting are exactly what break.'),
      ],
      mistakenFor: bi(
        '常被误当成"样本量为一所以证据弱"。周期数才是这里的样本量，一个做了十个周期的 N-of-1 对这一个人的证据强于一个 n=1000 的试验——后者给的是群体平均，而在个体异质性大的问题上，群体平均对任何一个人都不成立。',
        'Often dismissed as weak evidence because n equals one. The sample size here is the number of periods, and a ten-period N-of-1 gives stronger evidence about that person than a trial of a thousand — which supplies a group average, and where heterogeneity is large a group average holds for nobody in particular.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/natural-experiment',
    depth: {
      origin: bi(
        '1854 年 John Snow 用两家供水公司在同一批住户中的随机分布研究霍乱，被视为最早的范例；2021 年 Card、Angrist 与 Imbens 因把这套方法做成可信推断的体系获诺贝尔经济学奖。',
        'John Snow\'s 1854 use of two water companies distributed across the same households is taken as the earliest instance; Card, Angrist and Imbens received the 2021 Nobel in economics for turning the approach into a system of credible inference.',
      ),
      minimalForm: '找到一个人为无法制造、又恰好单独变动某因素的条件',
      canonicalSubstrates: [
        sub('政策断点', 'Policy discontinuities', '经济学', 'Economics', 0,
          '一条按年龄或分数划定的资格线，把线两侧几乎相同的人分成两组',
          'an eligibility line drawn on age or score, splitting near-identical people either side of it',
          '断点只在局部有效：它估计的是线附近那一小群人的效应，外推到远离断点的人群没有依据。',
          'A discontinuity identifies locally: it estimates the effect for those near the line, and extrapolating to people far from it has no warrant.'),
        sub('双胞胎研究', 'Twin studies', '行为遗传学', 'Behavioural genetics', 2,
          '同卵双胞胎提供了一个基因几乎相同、环境可以不同的对照组',
          'identical twins supplying a control group with nearly the same genes and possibly different environments',
          '同卵双胞胎共享的不只是基因还有子宫与家庭，所以"环境不同"这个前提比它看起来弱得多。',
          'Identical twins share a womb and a household as well as genes, so the premise that their environments differ is much weaker than it looks.'),
        sub('微重力', 'Microgravity', '空间生物学', 'Space biology', 0,
          '在地面无法关掉重力，而轨道上恰好只有这一项被改变',
          'gravity cannot be switched off on the ground, and in orbit it is the one thing that changes',
          '轨道环境同时改变了辐射、昼夜节律与心理应激，所以"只有一项被改变"是近似而非事实，需要各自的对照。',
          'Orbit also changes radiation, circadian cues and psychological stress, so only one thing changing is an approximation rather than a fact and each needs its own control.'),
        sub('自然灾害', 'Natural disasters', '灾害社会学', 'Disaster sociology', 1,
          '一次地震把相邻社区分成受灾与未受灾，事前差异被认为可忽略',
          'an earthquake splitting neighbouring communities into hit and not hit, with prior differences assumed negligible',
          '灾害的落点常与建筑质量和地形相关，而这两者又与社会经济地位相关——"随机"在这里往往经不起检查。',
          'Where a disaster lands correlates with building quality and terrain, which correlate with socioeconomic status, so the randomness here often does not survive inspection.'),
      ],
      relations: [
        rel('perturb-and-read', 'competes-with',
          '两者做的是同一件事——制造一个对照——只是一个自己施加扰动、一个去找自然施加过的。前者控制得住分配却可能改变系统，后者不改变系统却必须论证分配是干净的：选哪个取决于哪种代价更付不起。',
          'Both do one job, manufacturing a contrast, with one applying the perturbation and the other finding one nature applied. The first controls the assignment and may change the system; the second leaves the system alone and must argue the assignment was clean. Which to use turns on which cost is less affordable.'),
        rel('selection-bias-absence', 'emerges-from',
          '自然实验的全部风险都在分配机制上：谁被这个条件触及不是随机的，观察到的差异里就混着选择。所以它与选择偏差是同一个问题的两面——一个是要利用的分配，一个是要排除的分配。',
          'The entire risk of a natural experiment sits in the assignment: if who the condition touched was not random, the observed difference contains selection. It is the same problem as selection bias seen from the other side — one assignment to exploit, one to rule out.'),
      ],
      mistakenFor: bi(
        '常被误当成"真实世界的随机试验"。它没有随机化，只有一个可以被论证接近随机的分配机制，而这个论证是全部工作所在。看到"自然实验"三个字而不问分配机制是什么，等于接受了一个未被检验的随机性假设。',
        'Often mistaken for a randomised trial in the wild. There is no randomisation, only an assignment mechanism that can be argued to approximate one, and that argument is the whole of the work. Accepting the phrase without asking what the mechanism was is accepting an untested assumption of randomness.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/perturb-and-read',
    depth: {
      origin: bi(
        '作为生理学的经典手法可上溯到十九世纪的损毁实验；2005 年光遗传学给了它毫秒级的时间分辨率，2014 年后 CRISPR 与 Perturb-seq 把它做成了可并行到全基因组的规模。',
        'A classical physiological move going back to nineteenth-century lesion studies; optogenetics gave it millisecond resolution in 2005, and CRISPR with Perturb-seq scaled it to whole genomes after 2014.',
      ),
      minimalForm: '对指定单元施加即时扰动并同步读取响应；因果被制造而非推断',
      canonicalSubstrates: [
        sub('光遗传学', 'Optogenetics', '神经科学', 'Neuroscience', 1,
          '用光在毫秒尺度上打开或关闭一群指定神经元，同时记录行为',
          'switching a named population of neurons on or off with light on a millisecond scale while recording behaviour',
          '毫秒级的人为激活不是这些神经元在自然状态下的放电模式——能引发某个行为不等于它在自然行为里承担那个角色。',
          'A millisecond artificial activation is not how those neurons fire naturally, and being able to evoke a behaviour is not evidence that they carry that role in the natural one.'),
        sub('CRISPR 扰动筛选', 'CRISPR perturbation screens', '功能基因组学', 'Functional genomics', 0,
          '逐个敲除基因并读出转录组，被扰动的单元就是那个基因',
          'knocking out genes one at a time and reading the transcriptome, with the gene as the perturbed unit',
          '敲除会触发补偿性通路，读到的响应是"缺了它并且补偿之后"的系统，与"它平时做什么"不是同一个问题。',
          'A knockout triggers compensation, so the response read is the system without it and after compensating, which is a different question from what it does ordinarily.'),
        sub('A/B 测试', 'A/B tests', '产品工程', 'Product engineering', 2,
          '把用户随机分流并立即读取行为差异，响应延迟通常以小时计',
          'splitting users at random and reading the behavioural difference immediately, with a latency usually measured in hours',
          '短期响应与长期效应常常反号：提高点击的改动可能降低留存，而实验窗口太短根本读不到后者。',
          'Short-run response and long-run effect often have opposite signs: a change that raises clicks can lower retention, and a short window cannot see the second at all.'),
        sub('生态操控实验', 'Ecological manipulation', '生态学', 'Ecology', 0,
          '移除或添加一个物种，观察群落其余部分如何重排',
          'removing or adding one species and watching the rest of the community rearrange',
          '围栏与围隔本身改变了系统（边缘效应、迁移被切断），所以操控的往往不只是被指定的那一项。',
          'Enclosures and exclosures change the system themselves through edge effects and blocked migration, so what gets manipulated is usually more than the named factor.'),
      ],
      relations: [
        rel('measurement-backaction', 'emerges-from',
          '这条方法的失效条件就是那条结构：扰动改变了系统，读到的响应属于被扰动之后的那个系统。幅度越大读数越清楚、偏差也越大，所以"加大扰动以提高信噪比"直接把方法推向它自己的失效边界。',
          'This method\'s failure condition is that structure: the perturbation changes the system and the response belongs to the system afterwards. A larger perturbation gives a cleaner reading and a larger bias, so raising the amplitude for signal-to-noise pushes the method straight at its own boundary.'),
        rel('causal-propagation-limit', 'emerges-from',
          '把直接效应与间接效应分开靠的是响应延迟，而延迟之所以有意义，是因为影响的传播有速度上限：早于传播时间到达的响应必定是直接的。没有这条上限，先后就不能读作直接与间接。',
          'Separating direct from indirect effects rests on response latency, and latency means something only because influence propagates at a bounded speed: a response arriving sooner than the propagation time has to be direct. Without that bound, earlier and later cannot be read as direct and indirect.'),
      ],
      mistakenFor: bi(
        '常被误当成"实验就等于因果"。施加扰动确实制造了因果，但制造出的是"在这个扰动下"的因果：敲除引发补偿、光刺激不是自然放电、围栏改变群落。方法给出的永远是被扰动之后那个系统里的因果关系，而它与原系统的差距需要另外估计。',
        'Often mistaken for experiments simply giving causation. Perturbing does manufacture causation, but the causation of a perturbed system: knockouts trigger compensation, optogenetic pulses are not natural firing, enclosures change the community. What the method returns is causal structure in the system after the poke, and the gap to the system before it needs estimating separately.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/alternative-mechanism-panel',
    depth: {
      origin: bi(
        '1890 年由 T.C. Chamberlin 以"多重工作假说"提出，主张研究者应同时持有若干竞争解释以免爱上其中一个；1964 年 Platt 的"强推断"把它做成可操作的判决性实验序列。',
        'Posed by T. C. Chamberlin in 1890 as the method of multiple working hypotheses, on the argument that a researcher holding several rival explanations at once will not fall in love with one; Platt\'s strong inference in 1964 turned it into an operational sequence of decisive experiments.',
      ),
      minimalForm: '列出能产生同样表观的其它机制，找到能区分它们的观测量',
      canonicalSubstrates: [
        sub('地外生命探测', 'Life detection beyond Earth', '天体生物学', 'Astrobiology', 0,
          '任何生物签名都必须先排除非生物化学能产生同样信号的路径',
          'any biosignature having first to rule out the abiotic chemistry that would give the same signal',
          '这里的替代机制集原则上无法穷举：我们只知道地球化学，而"未知的非生物过程"这一条永远留在名单外面。',
          'The panel cannot be exhaustive in principle: we know terrestrial chemistry, and unknown abiotic processes stay permanently off the list.'),
        sub('考古辨伪', 'Authentication in archaeology', '考古学', 'Archaeology', 1,
          '同位素、工艺痕迹与埋藏学各自给出能区分真品与仿制的观测量',
          'isotopes, tool marks and taphonomy each supplying an observable that separates genuine from forged',
          '仿造者会读同样的文献：每公布一个判据，下一代仿品就绕过它——这里的对照集必须持续更新而非一次建成。',
          'Forgers read the same literature: each published criterion is routed around by the next generation of fakes, so the panel has to be maintained rather than built once.'),
        sub('异常检测', 'Anomaly detection', '数据科学', 'Data science', 1,
          '一个离群点在被当作新现象之前，要先排除仪器故障、采样偏差与数据处理错误',
          'an outlier having to survive instrument fault, sampling bias and processing error before counting as a new phenomenon',
          '这三条平凡解释加起来的先验概率远高于新现象，所以对照集不完备时，最可能的答案几乎总是平凡的那个。',
          'Those three mundane explanations carry far more prior probability than a new phenomenon, so with an incomplete panel the likeliest answer is almost always the mundane one.'),
      ],
      relations: [
        rel('open-set-recognition', 'explains',
          '对照集无法穷举，正是因为真实世界会送来名单上根本没有的机制——所以这条方法的完备度问题就是开放集识别问题：给"以上皆非"留一个显式出口，比把它硬分到最近的已知机制更诚实。',
          'The panel cannot be exhaustive because the world supplies mechanisms that were never on the list, which makes its completeness problem the open-set recognition problem: leaving an explicit exit for none of the above is more honest than forcing the case onto the nearest known mechanism.'),
        rel('power-laws-scale-free', 'explains',
          '幂律是这条方法最清楚的用武之地：同一条重尾可以来自自组织临界、优先连接，或者只是一个对数正态。不把这三条并排检验就宣称观察到无标度，正是缺了对照集的那种结论。',
          'Power laws are where this method is most plainly needed: one heavy tail can come from self-organised criticality, from preferential attachment, or from a log-normal. Claiming scale-freeness without testing the three side by side is exactly the conclusion a missing panel produces.'),
      ],
      mistakenFor: bi(
        '常被误当成排除法的证明力："排除了其它可能，所以就是它"。这条方法只能提高置信，永远给不出"只可能是它"，因为它自己无法证明名单是完整的。把排除法读成证明，是在用一个方法的结论去掩盖它自己的已知缺口。',
        'Often mistaken for elimination proving the case — everything else is excluded, therefore this. The method raises confidence and can never deliver only this, because it cannot establish its own list is complete. Reading elimination as proof uses a method\'s conclusion to paper over the gap the method itself declares.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/rebuild-from-description',
    depth: {
      origin: bi(
        '作为实验复现的要求与科学出版同龄，但作为一种检验描述本身的方法，是 2010 年代后由计算复现（Docker、工作流、artifact evaluation）明确下来的：被测的不是结论，是记录。',
        'As a demand for replication it is as old as scientific publishing, but as a method for testing the description itself it was made explicit by computational reproducibility in the 2010s — containers, workflows, artifact evaluation — where what is under test is the record rather than the conclusion.',
      ),
      minimalForm: '只依描述重造产物；重建产物与原物之差 = 描述漏掉的量',
      canonicalSubstrates: [
        sub('论文复现', 'Reproducing a paper', '元科学', 'Metascience', 0,
          '只按方法部分重跑一遍，看能不能得到同样的数字',
          'rerunning from the methods section alone and seeing whether the same numbers come out',
          '复现失败有两个来源——描述不全，或结论本来就不成立——而这个测试本身分不开它们，需要作者配合才能定位。',
          'A failed reproduction has two sources, an incomplete description or a conclusion that was never right, and the test alone cannot separate them without the author\'s cooperation.'),
        sub('施工图', 'Construction drawings', '建筑工程', 'Civil engineering', 1,
          '另一个施工队只凭图纸能不能建出同一栋楼，检验的是图纸而非设计',
          'whether a different crew can build the same structure from the drawings alone, which tests the drawings rather than the design',
          '施工队自带的行业惯例是巨大的隐性先验：图纸不必写明的东西，正是这个行业默认所有人都知道的东西。',
          'A crew brings trade convention as an enormous implicit prior: what the drawings need not state is precisely what the trade assumes everyone knows.'),
        sub('菜谱', 'Recipes', '烹饪', 'Cooking', 2,
          '照着做出来与原作的差距，就是菜谱没写下来的那部分',
          'the gap between what you cook and the original being what the recipe left out',
          '这个基底的价值在于差距是可直接尝到的，而在大多数领域里"原物"根本无法并排比较——所以菜谱是这条方法少有的可闭环案例。',
          'The value of this substrate is that the gap can be tasted directly, whereas in most fields the original cannot be compared side by side at all, making recipes one of the few cases where this method closes its loop.'),
        sub('逆向工程', 'Reverse engineering', '软件工程', 'Software engineering', 1,
          '从文档与可观测行为重建实现，重建者的先验知识必须被显式控制',
          'rebuilding an implementation from documentation and observable behaviour, with the rebuilder\'s prior knowledge explicitly controlled',
          '"洁净室"设计就是为了控制这个先验：让写规格的人与写实现的人分开，否则测的是重建者而不是描述。',
          'Clean-room design exists to control that prior by separating whoever writes the specification from whoever writes the implementation, since otherwise the test measures the rebuilder rather than the description.'),
      ],
      relations: [
        rel('tacit-craft-explicitation', 'explains',
          '重建失败时剩下的那部分，按定义就是没能被写下来的手艺——所以这条方法是隐性技艺的探测器：它不告诉你手艺是什么，但能告诉你还剩多少，以及在流程的哪一步。',
          'Whatever remains when a rebuild fails is by definition the craft that could not be written down, which makes this method a detector for tacit knowledge: it does not say what the craft is but does say how much is left and at which step.'),
        rel('assembly-description-length', 'emerges-from',
          '"完备的描述"这个概念本身由最小描述长度给出刻度：一份描述若比重建所需的最短指令还短，它必然漏了东西——所以重建检验的其实是描述长度够不够，而不是写得好不好。',
          'What counts as a complete description is scaled by minimum description length: any description shorter than the shortest instruction set sufficient to rebuild must have left something out, so the rebuild tests whether the description is long enough rather than whether it is well written.'),
      ],
      mistakenFor: bi(
        '常被误当成"检验结论对不对"。它检验的是记录：重建成功说明描述够用，不说明结论正确；重建失败说明描述不全或结论不成立，而这个测试本身分不开这两者。把复现失败直接读作结论错误，是在用一个测记录的工具去下一个关于世界的判断。',
        'Often mistaken for testing whether a conclusion is right. It tests the record: a successful rebuild shows the description sufficed and not that the conclusion holds, and a failed one shows either an incomplete description or a conclusion that does not stand, which this test cannot separate. Reading a failed reproduction straight as a wrong conclusion uses a tool that measures records to deliver a verdict about the world.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/aggregating-independent-judgements',
    depth: {
      origin: bi(
        '1907 年由 Galton 在一次牲畜称重竞猜中记录：787 位参与者估计值的中位数与真值相差 0.8%；1980 年代后由预测市场与集成学习各自形式化，两者用的都是同一条独立性前提。',
        'Recorded by Galton in 1907 at a livestock weight-guessing contest, where the median of 787 entries fell within 0.8 per cent of the truth; formalised separately by prediction markets and by ensemble learning from the 1980s, both resting on the same premise of independence.',
      ),
      minimalForm: '独立评估者的一致收窄不确定性；分歧本身是信息',
      canonicalSubstrates: [
        sub('陪审团', 'Juries', '法学', 'Law', 0,
          '若每位陪审员判断独立且优于随机，多数决的正确率随人数上升',
          'if each juror judges independently and better than chance, majority accuracy rises with the number of them',
          '陪审团要评议，而评议正是破坏独立性的机制——孔多塞定理的前提被审议过程本身取消，这是这条结构最古老的内在矛盾。',
          'Juries deliberate, and deliberation is exactly what destroys independence: Condorcet\'s premise is cancelled by the procedure itself, which is this structure\'s oldest internal contradiction.'),
        sub('同行评议', 'Peer review', '科学出版', 'Scientific publishing', 2,
          '两位审稿人分歧很大这件事本身，比他们的平均分更有信息量',
          'two referees disagreeing sharply being more informative than their average score',
          '实际流程通常把分歧交给编辑裁决而不是记录下来，于是这一半信息在系统里被系统性地丢弃。',
          'The process usually hands disagreement to an editor to resolve rather than recording it, so that half of the information is systematically discarded.'),
        sub('集成学习', 'Ensemble learning', '机器学习', 'Machine learning', 0,
          '弱学习器的误差若不相关，集成的方差按成员数下降',
          'if the weak learners\' errors are uncorrelated, the ensemble variance falls with the number of members',
          '同一批数据训练出的模型误差高度相关，所以工程上要主动制造多样性（不同子样本、不同特征）——独立性在这里是被设计出来的，不是天然的。',
          'Models trained on one dataset have strongly correlated errors, so diversity has to be manufactured through subsampling and feature variation: independence here is engineered rather than given.'),
        sub('预测市场', 'Prediction markets', '实验经济学', 'Experimental economics', 1,
          '价格把分散的私有判断聚合成一个连续的数，且事后可用结果校准',
          'a price aggregating scattered private judgement into one continuous number, calibratable afterwards against the outcome',
          '参与者会互相观察价格并据此下注，于是价格本身成了共同信号——市场越活跃，独立性被侵蚀得越快。',
          'Participants watch the price and bet on it, so the price becomes a shared signal: the more active the market, the faster independence erodes.'),
      ],
      relations: [
        rel('fisher-precision-limit', 'emerges-from',
          '聚合之所以有效，是因为费雪信息对独立观测可加：n 个独立评估者的信息是单个的 n 倍，方差下界因而按 1/n 缩小。这也精确说明了相关评估者为什么什么都买不到——相关的那部分信息被重复计了。',
          'Aggregation works because Fisher information is additive over independent observations: n independent assessors carry n times the information and the variance floor falls as 1/n. That is also exactly why correlated assessors buy nothing — the shared part is counted twice.'),
        rel('two-error-tradeoff', 'explains',
          '换一个判定阈值只是沿 ROC 曲线滑动，而聚合独立判断带来的是新的独立信息，所以它移动的是整条曲线。这是"要整体前进必须换来新信息"这句话最常见的兑现方式。',
          'Changing a threshold only slides along the ROC curve while aggregating independent judgements brings new independent information, so it moves the curve itself. This is the commonest way the requirement of new information to make real progress actually gets met.'),
      ],
      mistakenFor: bi(
        '常被误当成"人多力量大"。人数只在独立的前提下起作用：一百个读同一批材料、受同一个先验影响的专家，其聚合区间的窄度是假的精度。判据不是有多少人，而是他们的误差相关到什么程度——而这一项几乎从不被报告。',
        'Often mistaken for strength in numbers. Numbers work only under independence: a hundred experts reading the same materials under the same prior produce an aggregate interval whose narrowness is false precision. The test is not how many but how correlated their errors are, and that is almost never reported.',
      ),
    },
  },
];
