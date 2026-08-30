import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the accumulation family.
 *
 * All eight answer one question: what does repetition or elapsed time do to a
 * quantity that is negligible on any single occasion, and why is the result
 * usually one-way?
 *
 * Three are about damage or drift that adds up unwatched — loads far below the
 * breaking strength summing to failure, an unwatched variable approaching a
 * threshold while every watched one reads normal, a rate ignorable on a human
 * timescale dominating everything given enough of it. Two are about what
 * elapsed time does to a record — the medium failing faster than the content
 * loses value, and later material resting on earlier so that spatial order
 * reads directly as temporal order. Two are about accumulation inside meaning —
 * a frequent combination compressed into an unsplittable unit, and a
 * contentful unit worn into a pure function marker. One is about accumulation
 * inside decisions: each decision constraining the next by explicit citation.
 *
 * THE OPPOSITION WORTH FILING. `archival-decay` says the passage of time
 * destroys the record; `superposition-ordering` says stacking IS the record.
 * Same elapsed time, opposite epistemic result — and one observation, a
 * missing stretch, that both explain. What separates them is whether the
 * medium's failure is independent of the ordering or is itself part of it:
 * random degradation leaves an absence with no geometry, while removal leaves
 * a surface, a sharp contact and structures truncated beneath it. That
 * relation is filed as `competes-with` and the discriminator is named in it.
 *
 * A SECOND OPPOSITION. `fatigue-accumulation` and `slow-variable-creep` both
 * present as "everything read normal until it did not", and after the fact
 * they are hard to tell apart. In one the accumulating quantity is internal
 * damage and the monitored load genuinely was fine every time; in the other it
 * is a state variable that was simply not on the dashboard. The discriminating
 * question — would finer instrumentation on the monitored quantities have
 * shown a trend? — answers no for fatigue and yes for creep. A third reading
 * of the same failure, one extreme load outside the record, is filed against
 * `extreme-value-theory`, where the discriminator is the fracture surface
 * rather than the monitoring record. A fourth pair, `lexicalisation` against
 * `grammaticalisation`, is the same shape again in a different substrate: one
 * observed fusion, two processes, and the class of the output as the test.
 *
 * All eight already declare quantities, so these patches carry depth only.
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

export const ACCUMULATION_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/deep-time-accumulation',
    depth: {
      origin: bi(
        '出自地质学：赫顿 1788 年、莱伊尔 1830 年代用今天可测的速率加足够长的时间解释地貌，不再借助灾变。它被写成"速率×时标"而不是"变化很慢"，正是因为这条自我限制才使它可证伪——灾变什么都能解释。达尔文 1881 年的最后一本书测了蚯蚓每年翻动多少土，再乘以世纪数，把一片熟悉的草地读成累积的产物。',
        'From geology: Hutton in 1788 and Lyell in the 1830s explained landforms with rates measurable today plus enough time, dispensing with catastrophes. It is stated as a rate times a timescale rather than as things changing slowly because that self-restriction is what made it falsifiable — catastrophes explain anything. Darwin\'s last book, in 1881, measured how much soil earthworms turn over per year, multiplied by centuries, and read a familiar meadow as an accumulation.',
      ),
      minimalForm: 'total = ∫₀ᵀ r dt；r 近似恒定时 total ∝ T，唯一的问题是 T 之内有没有截断项',
      canonicalSubstrates: [
        sub('河谷下切', 'Canyon incision', '地貌学', 'Geomorphology', 0,
          '每年零点几毫米的下切速率，一次洪水之后根本量不出来',
          'an incision rate of a fraction of a millimetre a year, unmeasurable after any single flood',
          '速率不是外生常数：下切让坡度变缓，坡度又回过来压低速率，累积因此自限。用当前速率反推峡谷年龄会系统性偏老。',
          'The rate is not an exogenous constant: incision lowers the gradient and the gradient feeds back on the rate, so the accumulation limits itself, and inverting the present rate makes a canyon come out systematically too old.'),
        sub('分子钟', 'The molecular clock', '分子演化', 'Molecular evolution', 1,
          '把累积的中性替换数当作时间读数，用来反推分歧年代',
          'reading accumulated neutral substitutions as a clock and inverting it to date a divergence',
          '结构在这里被反着用：总量可测而时标是未知数，全部误差压在速率标定上；同一位点的重复替换又会截断计数，使远端分歧系统性偏浅。',
          'The structure runs backwards here: the total is observed and the timescale is the unknown, so all the error concentrates in calibrating the rate — and repeat substitutions at one site truncate the count, making deep divergences come out too shallow.'),
        sub('长期复利', 'Compound return over decades', '金融学', 'Finance', 2,
          '长期外推能不能成立，取决于有没有机制把超额回报竞争掉',
          'whether the long extrapolation holds turns on whether anything competes an excess return away',
          '截断在这里是内生且社会性的：持续高于增长率的回报会吸引资本、把自己抹平，所以外推的失败不是撞上物理上限，而是别人也在读同一条曲线。',
          'The truncation here is endogenous and social: a return persistently above the growth rate attracts capital and competes itself away, so the extrapolation fails not against a physical ceiling but because other people are reading the same curve.'),
      ],
      relations: [
        rel('drift-fixation', 'explains',
          '中性变异的固定不靠任何优势，只靠世代数无界：单代内可忽略的抽样偏差，在足够多代之后让某个结局几乎必然。把它读成深时累积，才知道结局是注定而不是走运。',
          'A neutral variant fixes without any advantage, on unbounded generations alone: a sampling deviation negligible within one generation makes some outcome near-certain after enough of them. Reading it as deep-time accumulation is what shows the ending was inevitable rather than lucky.'),
        rel('scale-separation-failure', 'explains',
          '把慢项当常数是合法近似，条件是它在所关心的窗口内积分很小。深时正是这个条件失效的区间，于是尺度分离的失效不是罕见情形，而是长期的一般情形。',
          'Treating a slow term as constant is a legitimate approximation only while its integral over the window of interest stays small. Deep time is exactly where that stops being true, so scale separation failing is the generic long-run case rather than an exotic one.'),
        rel('slow-variable-creep', 'generates',
          '一个每次读数都低于噪声的速率，正是排不进仪表盘的那种量——不是被忽略，而是在单次测量里根本不存在。深时累积因此是"无人监控的变量"的来源，不只是它的后果。',
          'A rate below the noise of every single reading is precisely the kind of quantity that never earns a place on a dashboard — not overlooked, but absent from any one measurement. Deep-time accumulation is therefore where an unwatched variable comes from, not merely what it costs.'),
      ],
      mistakenFor: bi(
        '常被误当成渐变论，当成"事情变化很慢"。它对速率快慢不作断言，只说在没有截断项时乘积无界——所以该问的是有没有反馈把偏离拉回来，而不是速率有多小。它也常与复利混为一谈：累积是线性的，时标翻倍总量翻倍；复利是指数的，翻倍会平方。判据很便宜——把时标翻倍，看总量怎么走。',
        'Often mistaken for gradualism, for the claim that things change slowly. It asserts nothing about the rate being small, only that the product is unbounded absent a truncating term, so the question is whether any feedback pulls deviation back, not how small the rate is. It also gets conflated with compounding: accumulation is linear and doubling the timescale doubles the total, while compounding squares it. The test is cheap — double the horizon and watch what the total does.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/fatigue-accumulation',
    depth: {
      origin: bi(
        '出自 1840 年代的铁路事故：车轴通过了全部静强度检验之后仍然断裂。沃勒自 1858 年起做旋转弯曲试验并画出 S–N 曲线，工程学被迫引入一个新的自变量——循环次数，而不是一条新的材料属性。"疲劳"这个名字来自一个错误理论（金属会累、会结晶化），它比正确机制早流行了近一个世纪。',
        'From railway accidents in the 1840s: axles broke after passing every static strength test. Wöhler\'s rotating-bending tests from 1858 produced the S–N curve and forced engineering to add a new independent variable — cycle count — rather than a new material property. The name comes from a wrong theory, metal getting tired and crystallising, that outlived the right one by nearly a century.',
      ),
      minimalForm: 'Σᵢ nᵢ/Nᵢ ≥ 1 时失效（Palmgren–Miner 线性累积）',
      canonicalSubstrates: [
        sub('金属疲劳', 'Metal fatigue', '材料科学', 'Materials science', 1,
          '同一应力幅下还能撑多少次循环，由 S–N 曲线给出',
          'how many cycles a given stress amplitude buys, read off the S–N curve',
          '钢一类材料存在疲劳极限：低于某个应力幅，循环次数再多也不失效；铝没有。于是"每次都安全、总和不安全"并不普遍成立，它取决于曲线有没有水平段。',
          'Steels have a fatigue limit — below some amplitude no number of cycles fails them — and aluminium does not. So safe every time, unsafe in sum is not universal: it depends on whether the curve has a horizontal branch.'),
        sub('骨的微损伤与重建', 'Bone microdamage and remodelling', '骨生物学', 'Bone biology', 2,
          '重建单元把受损处切除再填回，速率与微裂纹的产生赛跑',
          'remodelling units cutting out damaged tissue and refilling it, racing the rate at which microcracks appear',
          '修复不是把损伤简单减掉：切除与回填之间有一段强度更低的窗口，因此重建过快与过慢都提高骨折风险，而金属那边没有这种非单调性。',
          'Repair does not simply subtract damage: between resorption and refill there is a window of lower strength, so both fast and slow remodelling raise fracture risk — a non-monotonicity with no counterpart in the metal case.'),
        sub('机身增压循环', 'Airframe pressurisation cycles', '航空工程', 'Aeronautical engineering', 0,
          '每一次起降就是一次增压—泄压，单次载荷远在设计强度之下',
          'one pressurise-depressurise cycle per flight, each load far below the design strength',
          '寿命按循环数而非日历年计，同龄机队的剩余寿命能差数倍；而彗星号事故说明，决定寿命的是应力集中的位置，平均载荷幅在那里几乎不含信息。',
          'Life is counted in cycles rather than calendar years, so same-age fleets differ several-fold in what remains — and the Comet accidents showed that what sets the life is where stress concentrates, with the mean amplitude carrying almost no information.'),
      ],
      relations: [
        rel('deep-time-accumulation', 'special-case-of',
          '疲劳是同一个积分，把时间换成循环数，再减去一个明确的修复项。固定这两样，一个关于地质时间的论证就变成可数的、能写进检修手册的设计规则。',
          'Fatigue is the same integral with cycles substituted for elapsed time and an explicit repair term subtracted. Fixing those two turns an argument about geological time into a countable design rule that fits in an inspection manual.'),
        rel('slow-variable-creep', 'competes-with',
          '一个每次检查都正常、最后突然断掉的部件，两种读法：载荷确实一直合格而损伤攒在内部，或者真正逼近阈值的量根本不在监控清单上。判据是事后能否从记录里重建出一条单调趋势——疲劳重建不出来，蠕变能。',
          'A component that read normal at every check and then broke admits two readings: the load really was within limits every time and damage built up internally, or the quantity actually approaching a threshold was never on the monitored list. The discriminator is whether a monotone trend can be reconstructed from the record afterwards — for fatigue none can, for creep one can.'),
        rel('extreme-value-theory', 'competes-with',
          '同一次断裂的第三种读法：它遇到了记录之外的一次极端载荷。载荷史分不开这两者，因为疲劳的载荷史看起来完全正常；断口能分——疲劳留下贝纹与缓慢扩展区，过载只留下一次性的快速断裂面。',
          'A third reading of the same fracture: it met one extreme load outside the record. The load history cannot separate them, because a fatigue load history looks entirely normal; the fracture surface can — fatigue leaves beach marks and a slow-growth zone, overload a single fast-fracture face.'),
      ],
      mistakenFor: bi(
        '常被误当成磨损或老化——一种测得出来的逐步走弱。疲劳恰恰不是：把一根将断的试件拿去做静力试验，强度几乎不降，所以任何测"还剩多少强度"的检查都会回答正常。可检的是裂纹长度而不是强度，这正是无损检测存在的理由。它也常被读成"当时载荷其实超标了"，而这个误读会把调查引向操作记录，那份记录在这条结构下必然是干净的。',
        'Often mistaken for wear or ageing, a weakening that could be measured. Fatigue is precisely not that: load a nearly failed specimen statically and it shows almost full strength, so any inspection measuring remaining strength answers normal. What is inspectable is crack length rather than strength, which is why non-destructive testing exists. It is also read as the load having secretly exceeded limits, which sends the investigation into an operating record that this structure guarantees will be clean.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/slow-variable-creep',
    depth: {
      origin: bi(
        '出自 1970 年代的生态学：霍林 1973 年把"韧性"与"稳定"分开——一个在观测窗口里稳定的系统，可以同时正在失去回到原态的能力；1990 年代 Carpenter 与 Scheffer 在湖泊与渔业上把它做实。扎人的地方是预测成功本身就是陷阱：拟合快变量的模型直到崩溃前都报得很准，而报得准换来的信心与它能不能看见慢变量毫无关系。',
        'From ecology in the 1970s: Holling in 1973 separated resilience from stability — a system stable across the observation window can at the same time be losing its capacity to return — and Carpenter and Scheffer made that concrete for lakes and fisheries in the 1990s. The sharp part is that forecasting success is the trap: a model fitted to the fast variables predicts well right up to the collapse, and the confidence that earns says nothing about whether it can see the slow one.',
      ),
      minimalForm: 'ẋ = f(x, y) 快，ẏ = εg(x, y) 慢，ε ≪ 1；崩溃发生在 y 越过 f 的折点',
      canonicalSubstrates: [
        sub('湖泊底泥中的磷', 'Sediment phosphorus in a lake', '湖沼学', 'Limnology', 0,
          '几十年累积在底泥里的磷，水质指标全部正常时它仍在上升',
          'phosphorus accumulating in the sediment for decades while every water-quality reading stays normal',
          '底泥磷可测，只是取样代价高且不连续，所以"没人盯着"在这里是经济决定而非技术缺口；越过阈值之后，即使外源输入切到零，内源释放仍能把浊态维持几十年。',
          'Sediment phosphorus is measurable, just expensive and discontinuous to sample, so nobody watching it is an economic decision rather than a technical gap — and past the threshold, cutting external loading to zero still leaves internal release holding the turbid state.'),
        sub('养老金体系的抚养比', 'A pension system\'s dependency ratio', '人口学', 'Demography', 1,
          '每年的收支、缴费率与投资回报都落在正常区间之内',
          'the annual balance, the contribution rate and the investment return all sitting inside their normal ranges',
          '慢变量在这里几十年前就已确定且人人可见，所以失败不是"没人测"而是"测了没人能动"：预警充分、反应缺席，与仪表盘缺项是两种不同的病。',
          'Here the slow variable was fixed decades earlier and is in plain view, so the failure is not that nobody measures it but that measuring changes nothing: the warning is ample and the response absent, which is a different illness from a missing instrument.'),
        sub('环境中的耐药基因累积', 'Resistance genes accumulating in the environment', '流行病学', 'Epidemiology', 2,
          '离"经验用药失效"还有多远，是唯一有预警价值的量',
          'how far the population still is from empirical therapy failing, the only quantity with warning value',
          '阈值不是一个数而是随用药强度移动的一条线，于是"距离阈值"不是可直接测量的量而是模型输出——预警的不确定性主要来自阈值的位置，不来自变量本身的测量误差。',
          'The threshold is not a number but a line that moves with prescribing intensity, so distance to it is a model output rather than a measurement — and the uncertainty in the warning comes mostly from where the threshold sits, not from error in the variable itself.'),
      ],
      relations: [
        rel('critical-slowing-down', 'generates',
          '慢变量逼近折点时，快变量受扰后恢复得越来越慢——于是这条"什么都看不见"的结构，恰好生产出唯一一个可测的早期信号，而信号住在快变量的响应里，不在它们的水平里。',
          'As the slow variable approaches the fold, the fast ones take longer to recover from a disturbance — so the structure that says nothing is visible is exactly what produces the one measurable early warning, and the warning lives in the fast variables\' response rather than in their level.'),
        rel('cognitive-bandwidth-ceiling', 'emerges-from',
          '被监控的量永远是一个选集，因为盯住一个量要付固定成本，而选集通常照着上一次事故来定。慢变量爬升，是这条上限在"落选的那个量恰好带阈值"时的样子，不是一次疏忽。',
          'The monitored set is always a selection, because watching a quantity costs something fixed, and the selection is usually made from the last incident. A creeping slow variable is what that ceiling looks like when the quantity left out happens to be the one with a threshold — not an oversight.'),
      ],
      mistakenFor: bi(
        '常被误当成突发的外部冲击。判据是事后用任何代用指标重建那个慢变量：如果它呈现多年的单调逼近，事件就不是突发的——突发只发生在被观测的量上，不在系统里。它也常被读成"这个变量测不了"；绝大多数情况下它可测，只是没被排进例行监测，所以正确的补救是改监测清单，而不是改预测模型。',
        'Often mistaken for a sudden external shock. The test is to reconstruct the slow variable afterwards from any proxy: if it shows a monotone approach over years, the event was not sudden — the suddenness was in the observed quantities, not in the system. It is also read as the variable being unmeasurable; in most cases it is perfectly measurable and simply absent from routine monitoring, so the remedy is a different monitoring list rather than a better forecasting model.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/archival-decay',
    depth: {
      origin: bi(
        '出自图书馆与档案界：1970–80 年代的"脆化图书"危机让酸性纸书成批碎掉，保存工作从修复单件转向按批处理。Rothenberg 1995 年那句"数字信息能存到永远，或者五年，看哪个先到"说的是失效方式变了：纸缓慢而齐整地坏，可以分诊；数字介质逐件、无声地坏，保存于是从一次性处理变成必须比机构活得更久的持续义务。',
        'From libraries and archives: the brittle-books crisis of the 1970s and 80s, when acidic paper crumbled in bulk, moved conservation from single objects to batches. Rothenberg\'s line in 1995 — digital information lasts forever, or five years, whichever comes first — was about the mode of failure changing: paper fails slowly and uniformly and can be triaged, while digital media fail item by item and silently, so preservation becomes a standing obligation rather than a treatment.',
      ),
      canonicalSubstrates: [
        sub('磁带与光盘', 'Magnetic tape and optical discs', '档案学', 'Archival science', 0,
          '物理载体还能读多久，由粘合层、氧化层与存放条件决定',
          'how long the carrier stays readable, set by binder, oxide layer and storage conditions',
          '失效在这里是无声的：一盘带在读之前看不出坏没坏，于是按件数写的库存报告与真实可读量之间的差，只有抽检时才出现——从没被读回来过的档案是一句未经检验的断言。',
          'Failure here is silent: a tape gives no sign until it is played, so the gap between an inventory counted in items and what is actually readable appears only under sampling — an archive never read back is an untested claim.'),
        sub('专有格式与停产软件', 'Proprietary formats and discontinued software', '数字保存', 'Digital preservation', 1,
          '解码它的那套软件还存在多久，通常短于介质本身',
          'how long the software that decodes it survives, usually shorter than the medium itself',
          '格式寿命由别人的商业决定而不是物理过程决定，所以它不能靠更好的材料延长；仿真把依赖推到下一层软件上，是换了一个到期日，不是取消了到期日。',
          'Format lifetime is set by somebody else\'s commercial decision rather than by a physical process, so no better material extends it — and emulation moves the dependency down a layer, which changes the expiry date rather than removing it.'),
        sub('酸性纸', 'Acidic paper', '图书馆学', 'Library science', 2,
          '内容的价值几乎不随时间下降，而纸在一百年内脆化',
          'content whose value barely decays while the paper embrittles inside a century',
          '退化在这里均匀且可预测，因此可以按批而不是按件处理，大规模脱酸才成立；数字介质逐件随机失效，同一套策略搬过去就不成立——策略跟着失效的统计形态走。',
          'Degradation here is uniform and predictable, so it can be handled by batch rather than by item, which is what makes mass deacidification possible; digital media fail item by item at random and the same strategy does not carry over.'),
      ],
      relations: [
        rel('superposition-ordering', 'competes-with',
          '记录里少了一段，两种读法：介质坏掉把它吃了，还是那一段本来就没沉积、或被后来的一次剥蚀切掉——后者本身是被记录下来的事件。判据是缺失有没有几何：随机降解留下没有形状的空白，剥蚀留下界面、突变的接触和被截断的构造。',
          'A missing stretch of the record admits two readings: the medium failed and ate it, or nothing was laid down there — or a later removal cut it out, which is itself a recorded event. The discriminator is whether the absence has a geometry: random degradation leaves a shapeless blank, removal leaves a surface with a sharp contact and structures truncated beneath it.'),
        rel('slow-variable-creep', 'special-case-of',
          '归档腐烂是慢变量爬升，把那个没人盯的变量固定为"还解不解得开"。它比一般情形更糟的地方在于：这个变量只在有人需要内容时才被采样一次，而那一刻必然已经在阈值之后。',
          'Archival decay is a creeping slow variable with the unwatched quantity fixed as whether the thing can still be decoded. What makes it worse than the general case is that this variable is sampled only when somebody wants the content, and that moment is necessarily after the threshold.'),
        rel('rebuild-from-description', 'generates',
          '既然介质与格式都比内容先死，唯一寿命更长的形式就是一份足以把它重造出来的描述。这条结构因此把"保存实物"与"保存做法"分成两种策略，它们的到期日与成本结构都不同。',
          'Since medium and format both die before the content does, the only longer-lived form is a description sufficient to remake it. The structure therefore splits keeping the artefact from keeping the recipe into two strategies with different expiry dates and different cost structures.'),
      ],
      mistakenFor: bi(
        '常被误当成存储成本问题，用"备份过了"回答。备份复制的是同一种介质与同一种格式，等于把两个时钟一起复制一份，哪一个都没推迟。检验很直接：随机挑一件做一次完整还原并计时。它也常被读成内容自己过时了；这条结构断言的是两个时钟在赛跑，所以诊断永远是比较两者的速度，而不是感叹其中一个。',
        'Often mistaken for a storage-cost problem, answered with we have backups. A backup copies the same medium in the same format, so it duplicates both clocks and postpones neither. The test is direct: pick an item at random, restore it end to end, and time it. It is also read as the content simply going out of date; the structure asserts a race between two clocks, so the diagnosis is always a comparison of their speeds rather than a complaint about either.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/superposition-ordering',
    depth: {
      origin: bi(
        '斯泰诺 1669 年提出。他要解决的问题不是时间而是"固体中的固体"——一枚化石或一块晶体怎么会嵌在石头里；由此他必须判断两个相接的固体谁先硬化，时间顺序是这个判断的副产品。这也是它两百多年只给相对顺序的原因：把层序换成年数要等 1905 年以后的放射性测年，而那是完全独立的另一套方法。',
        'Stated by Steno in 1669. His problem was not time but a solid inside a solid — how a fossil or a crystal comes to be enclosed in rock — which forced him to decide which of two touching solids had already hardened when the other formed, and the temporal order is a by-product of that decision. It is also why the principle gave only relative order for two and a half centuries: converting a sequence into years waited for radiometric dating after 1905, an entirely separate method.',
      ),
      minimalForm: '深度序 → 时间序（无扰动时）；t(z) = ∫ dz / r(z)',
      canonicalSubstrates: [
        sub('地层与化石层序', 'Strata and fossil succession', '地层学', 'Stratigraphy', 0,
          '一段剖面里层与层的上下关系，直接读作先后',
          'the over-and-under relation of beds in a section, read straight off as before-and-after',
          '叠覆只给同一剖面内的相对顺序：两地之间的对比要靠化石带或标志层，那已经是另一条原理在工作；而把顺序换成年龄又需要第三套独立方法。',
          'Superposition gives relative order within one section only: correlating two localities takes fossil zones or marker beds, which is a different principle doing the work, and turning order into age takes a third, independent one.'),
        sub('城市堆积与考古层位', 'Occupation deposits and archaeological contexts', '考古学', 'Archaeology', 2,
          '墓穴、地基、盗洞把晚期材料带进早期堆积，扰动是常态',
          'graves, foundations and robber trenches carrying late material into early deposits, with disturbance the norm',
          '因为扰动是常态，考古学不以肉眼可见的层为单位而以界面为单位：先判断哪一次动作切了哪一次，再排顺序。可靠的不是层本身，是切割关系。',
          'Because disturbance is normal, archaeology works in interfaces rather than in visible layers: first decide which action cut which, then order them. What is reliable is the cutting relation, not the layer.'),
        sub('冰芯的年层', 'Annual layers in an ice core', '冰川学', 'Glaciology', 1,
          '每年的积雪厚度，就是把深度换算成年数的那个系数',
          'the annual snowfall thickness, the coefficient converting depth into years',
          '系数不是常数：深处的层被上覆压薄，冰还会侧向流动，于是同一厚度在不同深度代表的时长差一个量级——换算必须写成深度的函数，否则底部年代全错。',
          'The coefficient is not constant: deep layers are thinned by the ice above and the ice also flows sideways, so the same thickness stands for an order of magnitude more time at depth. The conversion has to be a function of depth or the bottom of the core is dated wrong.'),
      ],
      relations: [
        rel('deep-time-accumulation', 'emerges-from',
          '层序是深时累积在"累积物就地保存、并保持先后"时的样子。区别在用法：累积论把速率乘上时间求总量，读层序则是量到总量、反过来求时间，于是速率必须从别处拿。',
          'A stratigraphic sequence is what deep-time accumulation looks like when the accumulated material stays in place and keeps its order. The difference is in the use: accumulation multiplies a rate by a time to get a total, while reading a section measures the total and solves for time, so the rate has to come from somewhere else.'),
        rel('traceability-chain', 'generates',
          '这里的链条由沉积本身造出来，不需要保管人：每一层与它下面的每一层都有确定关系，而这个关系不依赖任何人记录过什么。所以一段剖面在全部田野记录丢失之后仍然可以立论。',
          'Here the chain is made by the deposition itself and needs no custodian: every layer stands in a fixed relation to every layer beneath it, and that relation depends on nobody having written anything down. A section therefore still supports an argument after every field notebook is lost.'),
      ],
      mistakenFor: bi(
        '常被误当成"记录是完整的"。它只约束顺序，对缺了什么一言不发；而实测沉积速率会随所测时段拉长而系统性下降（Sadler 效应），意思是时间大部分都在层与层之间的空隙里，不在层里。第二个误读是以为它给年龄——它给的是相对顺序，年龄要另一套方法，两者并排画在同一张柱状图上时最容易被混成一件事。',
        'Often mistaken for the record being complete. It constrains order only and says nothing about what is missing — and measured accumulation rates fall systematically as the interval measured gets longer (the Sadler effect), which means most of the time sits in the gaps between beds rather than in the beds. The second misreading is that it supplies ages: it supplies relative order, and the two are easiest to conflate when drawn side by side on one column.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/precedent-accumulation',
    depth: {
      origin: bi(
        '出自英国普通法，而先例在普通法的大部分历史里并不严格拘束。遵循先例硬化成规则，是在判例汇编变得可靠、系统之后：1865 年 Law Reports 建立，1898 年上议院宣布自己也受本院判决拘束，1966 年才发声明解除。约束力跟着档案走而不是相反——这条结构首先是关于记录技术的事实，其次才是关于权威的事实。',
        'From English common law, where precedent was not strictly binding for most of that law\'s history. Stare decisis hardened into a rule only once law reporting became reliable: the Law Reports were founded in 1865, the House of Lords declared itself bound by its own decisions in 1898, and released itself by a practice statement only in 1966. The binding force followed the archive rather than the other way round, which makes this first a fact about recording technology and second about authority.',
      ),
      canonicalSubstrates: [
        sub('判例法', 'Case law', '法学', 'Law', 0,
          '把过去的判决接到眼下这一件上的那条引用路径',
          'the path of citations connecting past judgments to the case in hand',
          '拘束力随法院层级而变：下级必须遵循，同级只有说服力，外域的只是参考。所以"引用链"实际上是一张带权重的图，链条这个形状只在单一审级内部成立。',
          'Binding force varies with the level of the court: a lower court must follow, a court of equal rank is only persuasive, another jurisdiction merely of interest. The citations are therefore a weighted graph, and the chain shape holds only inside a single tier.'),
        sub('已发布接口的兼容承诺', 'Published interfaces and compatibility promises', '软件工程', 'Software engineering', 1,
          '每一个被依赖的接口从此不能改，剩余的设计空间随版本单调收窄',
          'every interface something depends on becoming unchangeable, so the remaining design space narrows monotonically with each release',
          '约束来自下游的实际调用而不是引用行为，因此收窄程度可以直接测量——谁在用哪个接口是可查的，不必等到有人援引；这让推翻成本比判例那边容易估。',
          'The constraint comes from what downstream code actually calls rather than from an act of citation, so the narrowing is directly measurable: who uses which interface can be looked up instead of waited for, which makes the cost of overturning easier to estimate than in law.'),
        sub('行政机关的既有做法', 'Settled practice in a bureaucracy', '公共行政', 'Public administration', 2,
          '要改一条既有做法，得有人具名承担改变带来的后果',
          'changing a settled practice requiring somebody to put their name to the consequences',
          '这里没有正式的推翻程序，先例靠"从来没人反对过"维持。它比判例更难改，因为找不到一份可以被推翻的文件——要推翻的是一个没有作者的惯例。',
          'There is no formal overruling procedure here, and the precedent survives on nobody ever having objected. That makes it harder to change than case law, because there is no document to overturn: what has to be overturned is a practice with no author.'),
      ],
      relations: [
        rel('path-dependence', 'special-case-of',
          '它是把锁定机制显式化的那一种路径依赖：约束不是藏在成本里的报酬递增，而是一份必须被正面处理的书面参照——后来者要么遵循，要么在公开场合说明这一件为何不同。',
          'It is path dependence with the lock-in mechanism made explicit: the constraint is not an increasing return hidden inside costs but a written reference that has to be addressed head on — a later decider either follows it or says in public why this case is different.'),
        rel('superposition-ordering', 'emerges-from',
          '它是叠覆在"后来者必须引用先前者、而不只是压在上面"这个附加条件下的样子。这个要求买来一个不同的性质：原地改写在这里必须留痕（推翻要被写明），而地层里的原地改写常常不留痕。',
          'It is superposition under the added condition that later material must cite the earlier rather than merely rest on it. That requirement buys a different property: rewriting in place has to leave a mark here, since an overruling is stated as one, whereas in sediment an in-place rewrite often leaves none.'),
        rel('frozen-accident', 'generates',
          '一个当时出于偶然理由做出的决定，被引用之后就取得了拘束力；冻结它的不是改动成本，而是"偏离必须公开说理"这一要求。所以在这条路上，原始理由的品质与它能否冻结无关。',
          'A decision taken for contingent reasons acquires binding force once it is cited, and what freezes it is not the cost of change but the requirement that any departure be justified in public. On this route the quality of the original reasoning has nothing to do with whether it freezes.'),
        rel('lexicalisation', 'generates',
          '一条被反复引用的先例最终获得一个名字，此后被整体调用：后来的判决援引标签，不再回到当初的事实。这里的效率同样以可检查性为代价——学说漂移正是因为标签在走，而它命名的那份判决没有跟着走。',
          'A precedent cited often enough acquires a name and is thereafter invoked whole: later decisions cite the label instead of returning to the facts. The efficiency is bought with inspectability here too — doctrinal drift happens because the label travels while the holding it names does not.'),
      ],
      mistakenFor: bi(
        '常被误当成一般的锁定或路径依赖。判据是问约束靠什么起作用：报酬递增下过去靠成本拘束你，钱足够多就能买断；先例靠"必须公开说明为何不同"拘束你，钱在这里不起作用，而一个有耐心的当事人可以用一连串小案子把它蚕食掉。它也常被读成保守或惰性；先例只在推翻很少发生时才单调收窄，而推翻的频率是可以数出来的。',
        'Often mistaken for lock-in or path dependence in general. The test is how the constraint bites: under increasing returns the past binds through cost and a rich enough actor can buy out of it, whereas precedent binds through the requirement to justify a departure in public, where money does not help and a patient litigant can erode it through a series of small cases. It is also read as conservatism; the space narrows monotonically only while overruling stays rare, and the rate of overruling can be counted.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/lexicalisation',
    depth: {
      origin: bi(
        '这个词长期是历史语言学的残差类别——凡"不是语法化"的变化都归进来，定义因此含混。它拿到正面定义是在改按输出界定之后：看一个组合是否作为整体进入词库、被当作不可再分的项使用。民间词源提供了独立证据：把 hamburger 重新分析成 ham 加 burger，说明内部结构确实已不再被解析。',
        'The term was long a residue category in historical linguistics: whatever was not grammaticalisation ended up in it, so it carried no positive content. It got one when it was redefined by its output — whether a combination enters the inventory as a whole and is used as an unsplittable item. Folk etymology supplies the independent evidence: hamburger reanalysed as ham plus burger shows the internals really have stopped being parsed.',
      ),
      canonicalSubstrates: [
        sub('复合词的凝固', 'Univerbation', '历史语言学', 'Historical linguistics', 0,
          '高频共现的组合被读成一个词，如 cupboard、breakfast',
          'a frequently co-occurring combination read as a single word, as in cupboard or breakfast',
          '频率是必要条件而非充分条件：同样高频的组合有的凝固有的不凝固，能不能凝固往往取决于结果在音系上读不读得成一个词，而这一步与频率无关。',
          'Frequency is necessary and not sufficient: equally frequent combinations sometimes fuse and sometimes do not, and whether they can often turns on whether the result is pronounceable as one word, which has nothing to do with frequency.'),
        sub('术语与缩略语', 'Technical terms and acronyms', '术语学', 'Terminology', 2,
          '一个缩写被当作整体使用之后，很少有人再展开它去核对其中每个词是否仍然准确',
          'an acronym used as a whole, with nobody expanding it to check whether each of its words is still accurate',
          '这里的压缩是有人有意执行并写进术语表的，因此原则上可逆：展开式随时可查。不可见性来自没人去查，而不是来自信息已经不在——与自发凝固是两种不同的不可见。',
          'Compression here is deliberate and written into a glossary, so it is reversible in principle: the expansion can always be looked up. The invisibility comes from nobody looking rather than from the information being gone — a different invisibility from spontaneous fusion.'),
        sub('专家记忆中的组块', 'Chunks in expert memory', '认知心理学', 'Cognitive psychology', 1,
          '棋手把一整个局面记成一个单位，回忆代价降到与记一枚棋子相当',
          'a chess player storing a whole position as one unit, so recalling it costs about what recalling a single piece costs',
          '压缩发生在个体而不是群体，因此既不传递也不被继承：一个人的组块对别人不可用，而词汇化的产物是共享的。这也是为什么棋子一打乱，优势立刻消失。',
          'The compression happens in one person rather than in a population, so it is neither transmitted nor inherited: one player\'s chunks are unavailable to anyone else, whereas the product of lexicalisation is shared. It is also why a randomised board erases the advantage at once.'),
      ],
      relations: [
        rel('grammaticalisation', 'competes-with',
          '同一个观察——一串词融成一个单位——有两种读法。判据在输出的类：落进开放类、带自己的实义、还能拿来造新词的，是词汇化；落进封闭类、只剩功能的，是语法化。频率和融合程度都分不开这两者。',
          'One observation — a string of words fusing into a single unit — with two readings. The test is the class of the output: an item in an open class, carrying content of its own and still available for coining, is lexicalisation; one in a closed class, left with function alone, is grammaticalisation. Neither frequency nor degree of fusion separates them.'),
        rel('assembly-description-length', 'emerges-from',
          '把重复出现的子结构编码一次、此后只作引用，正是最小描述长度的处方。词汇化是这条原则在编码者是一个言语社群、码本是词库时的样子——没有人执行它，使用频率自己把它做完。',
          'Encoding a recurring substructure once and referring to it thereafter is what minimum description length prescribes. Lexicalisation is that principle running where the encoder is a speech community and the codebook is a lexicon — nobody enforces it, and frequency of use does the work.'),
        rel('spontaneous-modularity', 'generates',
          '一个词汇化的单元就是一个模块，而模块的边界恰好画在内部停止被检查的地方。于是模块可以在没有任何人设计边界的情况下出现——边界是使用频率留下的，不是划出来的。',
          'A lexicalised item is a module, and its boundary falls exactly where the internals stopped being inspected. Modules can therefore appear with nobody having drawn a boundary: it is left behind by frequency of use rather than designed.'),
      ],
      mistakenFor: bi(
        '常被误当成缩写或简称。判据是内部还有没有约束力：缩写任何人随时可以展开，展开式仍然管着它的意思；词汇化的单元不行——blackboard 不必是黑的，hot dog 里没有狗。第二个误读是把它当成纯粹的效率提升；被买走的是可检查性，因此一个错误可以留在单元内部很久而无人碰到——术语表里那些过时的展开式就是这样活下来的。',
        'Often mistaken for abbreviation. The test is whether the parts still constrain the whole: an abbreviation can be expanded by anyone at any time and the expansion still governs its meaning, while a lexicalised item cannot — a blackboard need not be black and a hot dog contains no dog. The second misreading is to treat it as pure efficiency gain; what is bought is inspectability, so an error can sit inside the unit untouched for years, which is how an out-of-date expansion survives in a glossary.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/grammaticalisation',
    depth: {
      origin: bi(
        'Meillet 1912 年造了这个词。他的要点不是"词会磨损"，而是语法的原料不是被创造出来的而是被征用的：新的语法机器来自普通词被磨掉实义，所以一种语言可以在没有任何新材料的情况下长出形态。单向性这条附加断言是它可证伪的地方——一个有充分文献支持的反向案例就足以推翻它，这也是为什么反例在这个领域受到不成比例的关注。',
        'Meillet coined the term in 1912. His point was not that words wear down but that the raw material of grammar is recruited rather than created: new grammatical machinery comes from ordinary words having their content worn off, so a language can grow morphology without acquiring anything new. The added claim of unidirectionality is what makes it falsifiable — one well-attested reversal would be enough to break it — which is why counterexamples get disproportionate attention in the field.',
      ),
      minimalForm: '实义词 > 语法词 > 附着形式 > 屈折词缀（Givón–Hopper–Traugott 单向斜坡）',
      canonicalSubstrates: [
        sub('英语 be going to', 'English be going to', '历史语言学', 'Historical linguistics', 1,
          '表"前往"的实义动词磨到只剩将来标记，语音上缩为 gonna',
          'a full verb of motion worn down to a future marker, phonologically reduced to gonna',
          '旧义并不消失：两种用法长期并存，所以磨损程度不能靠"词还在不在"来判断，只能看分布——同一个形式在哪些环境里已经不能再作实义读。',
          'The old meaning does not disappear: both uses coexist for centuries, so the extent of the wear cannot be judged by whether the word is still there, only by distribution — in which environments the form can no longer be read as full.'),
        sub('汉语的"了"', 'The Chinese aspect marker le', '汉语史', 'History of Chinese', 2,
          '动词"了"（完毕）磨为体标记之后，不再回到动词用法',
          'the verb liao, to finish, worn into an aspect marker and never returning to verbal use',
          '汉语缺少形态屈折，磨损表现为虚化与语序固定而不是词尾，于是单向性的证据只能靠文献分期；而书面语保守会让分期系统性偏晚，这个偏差是单侧的，加语料也消不掉。',
          'With no inflectional morphology, the wear shows up as bleaching and fixed word order rather than as endings, so the evidence for unidirectionality rests on dating texts — and a conservative written register dates the change late, a one-sided bias more corpus does not remove.'),
        sub('新生手语中的方向标记', 'Directional markers in a new sign language', '手语语言学', 'Sign language linguistics', 0,
          '一个具象手势在三四十年里被高频使用磨成指称与方向的标记',
          'an iconic gesture worn by high-frequency use into a marker of reference and direction within three or four decades',
          '全过程可以直接观察而不必重建，这是别的案例都没有的条件；代价是语言太年轻，观察到的方向性无法与这一个群体的偶然区分开。',
          'The whole process can be watched rather than reconstructed, which no other case allows; the price is that the language is young enough that the observed directionality cannot be told apart from an accident of this one community.'),
        sub('界面图标', 'Interface icons', '交互设计', 'Interaction design', 1,
          '软盘的图形失去所指之后，仍作为"保存"的纯功能标记留下来',
          'the floppy-disk shape losing its referent and surviving as a pure marker for save',
          '这里没有语音磨损可言，磨掉的只有所指；而且频率是通过设计者一次次沿用起作用，不是通过使用者的习惯，于是驱动量与语言案例中的并不是同一个东西。',
          'There is no phonological wear here, only the referent going; and frequency acts through designers copying a convention forward rather than through speakers\' habits, so the driving quantity is not the same one as in the linguistic cases.'),
      ],
      relations: [
        rel('drift-fixation', 'competes-with',
          '一个变体在人群中走向固定，两种读法：由使用频率驱动的定向磨损，还是完全没有压力的中性漂变。判据是方向在互不相关的人群里是否重复——语法化预言同样的来源反复产出同样的标记，漂变不预言任何方向。',
          'A variant going to fixation in a population admits two readings: directional wear driven by frequency of use, or neutral drift with no pressure at all. The test is whether the direction repeats across unrelated populations — grammaticalisation predicts the same lexical sources yielding the same markers again and again, while drift predicts no direction anywhere.'),
        rel('template-copying-error', 'emerges-from',
          '每一次传递都是一次带偏差的复制；语法化是这些偏差不再随机、而被使用频率系统性偏置时的样子。所以它与一般语言变化的区别不在有没有误差，而在误差有没有方向。',
          'Every transmission is a copy with deviations, and grammaticalisation is what those deviations look like once they stop being random and are systematically biased by frequency of use. What separates it from language change in general is therefore not the presence of error but whether the error has a direction.'),
        rel('deep-time-accumulation', 'emerges-from',
          '磨损的乘数是使用次数而不是年数，所以这里的时钟是词频：一个高频词几百年就磨完，一个同样古老的低频词原地不动。这解释了为什么"语言有多老"预测不了它有多少语法。',
          'The multiplier on the wear is token count rather than years, so the clock here is frequency: a high-frequency item is worn through in a few centuries while an equally old rare one does not move. That is why how old a language is predicts nothing about how much grammar it has.'),
      ],
      mistakenFor: bi(
        '常被误当成语言退化，或使用者变懒。判据是重复性：go 类动词变将来标记、身体部位词变方位词，在毫无接触的语系里一再发生，随机侵蚀不会这样。第二个误读是把它归为词义变化的一种；变的不只是意义，还有类属与分布——一个词离开开放类进入封闭类之后就不能再拿来造新词，这一步与意义变淡可以分开检验。',
        'Often mistaken for decay, or for speakers getting lazy. The test is repetition: verbs of going becoming futures and body-part words becoming adpositions happen again and again in families with no contact, which is not what random erosion produces. The second misreading files it as semantic change; what changes is not only meaning but class and distribution — once an item leaves an open class for a closed one it can no longer be coined with, and that step is testable separately from the meaning thinning out.',
      ),
    },
  },
];
