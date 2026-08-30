import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureRelation } from './structures';

/**
 * Depth for the seven structures of the boundary-and-measure family.
 *
 * All seven answer one question: how does a choice that presents itself as
 * technical — where the boundary falls, which unit things are counted in,
 * which number gets watched, which layer holds control — decide the counting,
 * the attribution and the distribution of power that follow?
 *
 * THE FAMILY CONTAINS ITS OWN MAP. One member, `leverage-point`, is a ladder
 * of intervention sites — parameters, structure, goals, paradigm — with
 * resistance rising along the same axis as leverage. The other six sit on that
 * ladder. `metric-distortion` is the parameter rung: the number being
 * optimised, cheapest to change and first to be worked around.
 * `devolving-control` is the structure rung: which layer holds the resource.
 * `commensuration-cost` is the goal rung, because a goal has to be stated in
 * some unit, so changing the goal means re-fighting the unit. `boundary-work`
 * and `unit-of-individuality` are the paradigm rung: what counts as one thing,
 * and who counts as inside.
 *
 * That is a claim rather than a decoration, and it predicts something. The
 * parameter rung is easy to move and therefore easy to unmake — an indicator
 * changes on a memo and is defeated within a reporting cycle. The paradigm
 * rung resists because its criterion is guarded by the people paid out of what
 * the criterion allocates. Resistance at the top of the ladder is not abstract
 * inertia; it has names, salaries and committees, which is exactly what
 * `boundary-work` describes.
 *
 * THE OPPOSITION WORTH FILING. `boundary-work` and
 * `self-nonself-discrimination` are the same act — deciding what is inside —
 * held up by two incompatible means. One is maintained by argument, so the
 * excluded can contest it and the criterion can move. The other is maintained
 * by molecular recognition, which cannot be argued with, only failed at, and
 * its two failure modes cost differently by orders of magnitude. The
 * consequence is filed in the relation between them: a boundary maintained by
 * argument has no equivalent of autoimmunity, and a boundary maintained
 * mechanically has no equivalent of appeal. So when an institution says its
 * admission criterion is a recognition rule rather than a negotiated line,
 * there is a test — does it produce autoimmune failures, excluding its own at
 * a cost it would rather not pay, and can those it excludes get the criterion
 * re-examined at all.
 *
 * All seven already declare quantities, so these patches carry depth only. Two
 * carry no `minimalForm`: `boundary-work` and `devolving-control` are social
 * structures with no formal statement, and inventing one would be worse than
 * the gap.
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

export const BOUNDARY_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/unit-of-individuality',
    depth: {
      origin: bi(
        '生物学的问题；Godfrey-Smith 2009 把它提成正式议题，Krakauer 等 2020 给了信息论判据。使它无法回避的是 Maynard Smith 与 Szathmáry 1995 的观察：演化史上的每一次重大转变，都是若干原本的个体合成一个新个体——个体性因此是演化的产物，不是它的前提。',
        'A biological question, made formal by Godfrey-Smith (2009) and given an information-theoretic criterion by Krakauer and colleagues (2020). What made it unavoidable was Maynard Smith and Szathmary (1995): every major transition in evolution is one in which former individuals become one — so individuality is what evolution produces, not what it assumes.',
      ),
      minimalForm: 'Ω* = argmax_Ω [ I(内部ₜ ; 内部ₜ₊₁) − I(环境ₜ ; 内部ₜ₊₁) ]',
      canonicalSubstrates: [
        sub('地衣与共生功能体', 'Lichens and symbiotic holobionts', '生物学', 'Biology', 0,
          '候选边界是"整个共生体算一个"还是"真菌与藻类各算一个"，两者都自洽',
          'the candidate boundary is whether the whole symbiosis is one or the fungus and the alga are two, and both readings hold',
          '两条候选边界并存，是因为遗传边界与生理边界不重合：双方分开繁殖却共同代谢；别处这两条线通常落在一起。',
          'Both candidates survive because the genetic and the physiological boundary do not coincide: the partners reproduce separately and metabolise together, where elsewhere those lines coincide.'),
        sub('颤杨无性系与"最大的生物"', 'Aspen clones and the largest organism', '生态学', 'Ecology', 2,
          '算一株还是四万七千株，决定"最大的生物"这句话的真假，也决定保护单位与林龄统计',
          'one stem or forty-seven thousand decides whether the largest-organism claim is true, and what the conservation unit is',
          '这里边界可直接测（遗传同一性），难处不在判据缺失而在答案与直觉冲突：43 公顷算"一个"使按株计的林业统计全部失效。',
          'The boundary is directly measurable as genetic identity, so the difficulty is not a missing criterion but an answer that offends intuition: one individual spanning 43 hectares voids every per-stem forestry count.'),
        sub('法人', 'The legal person', '法学', 'Law', 0,
          '候选边界是"公司是否算一个能持有权利、承担责任的个体"',
          'the candidate boundary is whether a company counts as one entity able to hold rights and bear liability',
          '这里边界是宣告的而不是被发现的，所以没有"划错"，只有"划出的后果"：法人格一旦授予，责任就在个体与集体之间多出一个可停留处。',
          'The boundary is declared rather than discovered, so there is no drawing it wrongly, only consequences: once personality is granted, liability gains a place to stop between individual and collective.'),
        sub('延展心智与分布式认知', 'Extended mind and distributed cognition', '认知科学', 'Cognitive science', 1,
          '边界内外的信息流之比被直接当作判据：笔记本、同事与工具是否在认知系统之内',
          'the ratio of internal to crossing information flow is used directly as the criterion for whether a notebook or a colleague is inside the cognitive system',
          '这里判据不产出一条边界而是一族：秒级尺度上边界在颅骨，年级尺度上笔记与同事在内部。别处判据对时间尺度不敏感，这里它是隐藏参数。',
          'The criterion yields not one boundary but a family: at seconds it falls at the skull, at years notes and colleagues are inside. Elsewhere it ignores timescale; here timescale is its hidden parameter.'),
      ],
      relations: [
        rel('commensuration-cost', 'generates',
          '通约的尺只能量已经被个体化的东西，所以每次跨系统比较都继承了一个先于它、且不再显示的划界决定。',
          'A shared unit can only measure things already individuated, so every cross-system comparison inherits a prior boundary decision that is no longer on display.'),
        rel('replicator-dynamics', 'explains',
          '方程对"谁是复制者"沉默，而选择的方向随这条边界改变符号：同一群体按个体记与按群体记可得相反结论。多层次选择之争因此不是数据之争。',
          'The equation says nothing about what replicates, and the sign of selection flips with the boundary: one population read per individual and per group gives opposite answers. The levels-of-selection dispute is therefore not about data.'),
        rel('spontaneous-modularity', 'competes-with',
          '同一观察——系统清晰地分成模块——可读作模块真的涌现，或分划是观察者划界的产物。判别方法是换判据：真模块在信息流、代谢交换与繁殖命运下给出同一分划。',
          'One observation — clean modules — reads either as modules that really emerged or as an artefact of where the observer cut. The discriminator is a change of criterion: a real module gives the same partition under information flow, metabolic exchange and reproductive fate.'),
      ],
      mistakenFor: bi(
        '常被当成定义之争。检验方法是换一条候选边界，问后面某个被使用的数会不会变：计数、适合度与责任归属不变则问题确实是空的，会变则定义在做经验工作。也要与模糊性区分——麻烦不是一条界线画不清，而是几条各自清晰的界线互相矛盾，测得更准不会使它消失。',
        'Taken for a definitional quarrel. The test is to swap in the other candidate and ask whether any number later used moves: if counts, fitness and liability are unmoved the question is idle, and if they move the definition is doing empirical work. It is also not vagueness — the trouble is not one blurred line but several sharp lines that disagree, which no added precision dissolves.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/boundary-work',
    depth: {
      origin: bi(
        'Gieryn 1983 年发表于《美国社会学评论》。他换掉了问题：不问波普尔式的"判据到底是什么"，而问科学家用划界主张做了什么。19 世纪英国的材料给出刺眼的答案——同一批人对宗教称科学是经验的，对机械技艺称科学是理论的，判据随对手反转而结论不变。',
        'Gieryn, in the American Sociological Review in 1983. He changed the question: not the Popperian one of what the criterion is, but what scientists do with demarcation claims. His Victorian material answered pointedly — the same speakers called science empirical against religion and theoretical against the mechanical arts, the criterion reversing with the rival while the conclusion held.',
      ),
      canonicalSubstrates: [
        sub('科学与非科学的划界', 'Demarcating science from non-science', '科学社会学', 'Sociology of science', 0,
          '准入判据是"可证伪""同行评议""有理论"这一类规则，从一个曲目里按场合取用',
          'the criterion is a rule such as falsifiability, peer review or having a theory, drawn from a repertoire as the occasion needs',
          '这里判据本身是论辩资源而不是固定规则：内容随对手改变，所以"判据被违反"不可观察，可观察的是判据被更换。',
          'The criterion here is a resource for argument rather than a fixed rule: its content moves with the opponent, so a violated criterion is not observable and a substituted one is.'),
        sub('执业许可与准入门槛', 'Occupational licensing', '劳动经济学', 'Labour economics', 1,
          '被分配的稀缺资源是执业权，以及执业权带来的可测量租金',
          'the scarce resource is the right to practise and the measurable rent that comes with it',
          '这里稀缺资源由法律造出，边界与所分配之物同时诞生；自然形成的边界那里资源先在、边界后到，而这个次序决定取消边界是否一并取消资源。',
          'The scarce resource is created by statute, so boundary and allocation are born together, where at a naturally formed boundary the resource precedes the line — and that order decides whether removing the line removes the resource.'),
        sub('期刊的收稿范围', 'A journal scope statement', '科学计量学', 'Scientometrics', 2,
          '维护成本落在编辑与审稿人身上，以"不属于本刊范围"的日常判断形式支付',
          'maintenance cost falls on editors and referees, paid out as the routine judgement that a submission is out of scope',
          '这里维护成本被摊薄进无数次低可见度的拒稿，边界几乎不留可争论的记录：执行不像立法，像磨损，被排除者往往不知自己参与了一次划界。',
          'Cost is spread across countless low-visibility desk rejections, so the boundary leaves almost no contestable record: enforcement resembles wear rather than legislation, and the excluded rarely learn a line was drawn.'),
      ],
      relations: [
        rel('unit-of-individuality', 'special-case-of',
          '被个体化的对象是一个学科，判据由靠这条边界分配资源的人来选。特殊之处正在于此：一般情形下选判据只是立场，这里它同时是收入。',
          'The thing individuated is a discipline, and the criterion is chosen by those the boundary allocates to. That is what makes it special: choosing a criterion is generally taking a position, and here it is also taking an income.'),
        rel('leverage-point', 'explains',
          '阶梯最高一级为什么阻力最大，这里有机制：范式那一级的判据由靠它分配资源的人守着。所以阻力不是抽象惯性，它有名字、有薪水、有委员会——也因此可以被清点。',
          'It gives the mechanism for why the top rung resists most: the criterion at the paradigm level is guarded by those it pays. Resistance there is not abstract inertia but has names, salaries and committees — and can therefore be enumerated.'),
        rel('commons-congestion', 'emerges-from',
          '边界只在有稀缺资源可分配时才被维护，所以拥挤是划界的前提而非后果：不拥挤时同一条线会自己松掉。反过来，一条被严守的边界是拥挤存在的证据。',
          'A boundary is maintained only while there is a scarce resource to allocate, so congestion is the precondition rather than the consequence: with no crowding the same line slackens by itself. Read backwards, a guarded boundary is evidence of crowding.'),
        rel('precedent-accumulation', 'generates',
          '每次划界裁决都成为下一次的判据，边界内容因此漂离最初的理由：被维护的逐渐是先例而不是原则，"边界为什么在这里"只剩历史答案。',
          'Each ruling becomes the criterion for the next, so the content of the boundary drifts from its original rationale: what is maintained becomes precedent rather than principle, and why the line sits here acquires only a historical answer.'),
      ],
      mistakenFor: bi(
        '常被读成揭穿，即"判据都是借口"。主张更弱也更有用：判据按对手从曲目里选取，这与每条判据各自合理不冲突。检验方法是跟踪同一行动者穿过两场争论——判据翻转而结论（我们在内、他们在外）不变，就是边界工作。它不主张划界不可能，只主张划界是被做出来的。',
        'Read as debunking: the claim that criteria are pretexts. It is weaker — criteria are picked from a repertoire according to the opponent, compatible with each being reasonable. The test is to follow one actor across two disputes: if the criterion flips while the conclusion that we are inside and they are outside holds, that is boundary work. It does not say demarcation is impossible, only that it is made rather than read off.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/self-nonself-discrimination',
    depth: {
      origin: bi(
        'Burnet 与 Fenner 1949 年提出"自我/非我"，Medawar 的获得性耐受实验把它坐实（两人分享 1960 年诺奖）。此后免疫学自己把它复杂化：Janeway 1989 说识别的是病原体的保守模式而非"陌生"，Matzinger 1994 说触发反应的是损伤——胎儿一半基因外来却被容忍，毫不陌生的自身组织却被攻击。',
        'Burnet and Fenner introduced self/non-self in 1949, and Medawar\'s acquired-tolerance experiments won the two of them the 1960 Nobel. Immunology then complicated its own idea: Janeway (1989) held the system recognises conserved pathogen patterns rather than strangeness, and Matzinger (1994) that damage triggers the response — a fetus half foreign is tolerated while familiar self tissue is attacked.',
      ),
      minimalForm: '判为非我 ⟺ max 相似度(x, 参照集) < θ，θ 由代价比 c_误伤/c_漏检 定',
      canonicalSubstrates: [
        sub('胸腺阴性选择', 'Negative selection in the thymus', '免疫学', 'Immunology', 0,
          '参照集是胸腺中呈递过的自身肽库，与之强结合的 T 细胞在成熟前被删除',
          'the reference set is the library of self peptides presented in the thymus, and T cells binding it strongly are deleted before maturity',
          '参照集是"被呈递过的"而非"存在的"：免疫豁免部位（眼、睾丸、中枢神经）的蛋白从未进入胸腺，终身处在非我一侧——破绽在解剖学里。',
          'The reference set is what was presented, not what exists: proteins of immune-privileged sites — eye, testis, central nervous system — never reach the thymus and stay on the non-self side for life. The flaw is anatomical.'),
        sub('细菌的限制—修饰系统', 'Bacterial restriction-modification', '微生物学', 'Microbiology', 0,
          '参照集退化成一个甲基化标记：自身 DNA 带标记，不带标记的外来序列一律被切断',
          'the reference set collapses to a methylation mark: own DNA carries it, and unmarked incoming sequence is cut',
          '这里参照集只有一个比特宽，代价是可被完美伪造：噬菌体学会同一种甲基化就整体通过。多位点近似匹配没有这种单点失效，也换不来这里的速度。',
          'The reference set is one bit wide and can therefore be forged outright: a phage acquiring the same methylation passes entire. Matching many sites approximately has no such single point of failure, and no such speed.'),
        sub('妊娠中的免疫耐受', 'Immune tolerance in pregnancy', '生殖免疫学', 'Reproductive immunology', 1,
          '两类错误的代价比在此被主动重设：胎儿有一半外来基因，却必须被容忍到足月',
          'the cost ratio is deliberately reset: the fetus is half foreign and must be tolerated to term',
          '这里系统不是判别失败，而是在局部把阈值调开并主动维持：耐受是被调控的状态而非一次错误，代价比在此从固定参数变成受控变量。',
          'The system is not failing to discriminate but holding the threshold open locally and maintaining it: tolerance is a regulated state rather than a mistake, and the cost ratio becomes a controlled variable.'),
        sub('入侵检测的正常行为基线', 'The normal-behaviour baseline in intrusion detection', '计算机安全', 'Computer security', 2,
          '参照集的更新速率决定一切：系统正常演化后基线必须重训，否则合法的新行为被判为入侵',
          'the update rate decides everything: after the system legitimately evolves the baseline must be retrained or new lawful behaviour scores as intrusion',
          '这里的"自我"由运维人员定义、可随时重写，所以有生物免疫没有的东西——上诉通道；代价是这条通道本身成为攻击面，改基线比绕过基线更省事。',
          'Self here is defined by operators and rewritable at will, so this substrate has what biological immunity lacks — a route of appeal; the price is that the route is an attack surface: editing the baseline beats evading it.'),
      ],
      relations: [
        rel('boundary-work', 'competes-with',
          '同一观察——一条稳定的内外之分被维持着——可读作靠论证与利害维持，或靠识别规则维持。判别有两条：被排除者能否让判据重新受审，以及系统会不会攻击自己。',
          'One observation — a stable inside/outside distinction being maintained — reads either as held up by argument and interest or as held up by a recognition rule. Two discriminators separate them: whether the excluded can get the criterion re-examined, and whether the system attacks its own.'),
        rel('two-error-tradeoff', 'special-case-of',
          '特殊之处不只在代价不对称，还在不对称有时间结构：漏放入侵者当场显形，误伤自己要数年后以慢性病出现。阈值因此总被向前一类错误调，反馈只在那一侧及时。',
          'What makes it special is not only unequal costs but a time structure in the inequality: a missed intruder costs at once, attacking self costs years later as chronic disease. The threshold drifts towards the first error because feedback is prompt only on that side.'),
        rel('covariate-shift-transfer', 'special-case-of',
          '自身成分随年龄、妊娠与菌群改变，参照集却在发育早期定下。自身免疫因此与协变量漂移同构：判据没变坏，分布变了——失效不表现为准确率下降，表现为过度警觉。',
          'Self keeps changing with age, pregnancy and the microbiota while the reference set was fixed in development. Autoimmunity is therefore covariate shift: the criterion has not degraded, the distribution has moved — and the failure shows not as lost accuracy but as vigilance.'),
      ],
      mistakenFor: bi(
        '常被当成一份固定白名单。检验方法是撤掉维持机制：调节性 T 细胞或外周耐受一旦缺失就出现自身免疫，可见"自我"是被持续执行出来的状态，不是被存起来的清单。也要与"陌生即攻击"区分——陌生度既预测不了排斥（胎儿与肠道菌群被容忍），也预测不了耐受（自身组织被攻击）。',
        'Taken for a fixed whitelist, as though the system knew what belongs to it. The test is to remove the maintenance: lose regulatory T cells or peripheral tolerance and autoimmunity appears, so self is a continuously enforced state, not a stored list. Nor is it foreignness-triggers-attack — foreignness predicts neither rejection, since fetus and gut flora are tolerated, nor tolerance, since self tissue is attacked.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/commensuration-cost',
    depth: {
      origin: bi(
        'Espeland 与 Stevens 1998 年在《社会学年评》上把通约当作一种劳动来处理——有成本、有执行者、有政治，而不是事物本身的性质。他们指出通约之所以被珍视，正因为它有意销毁信息：压成一个数才使注意力成为可能。Porter 1995 补上另一半：量化在权威最弱的地方最强势。',
        'Espeland and Stevens, in the Annual Review of Sociology in 1998, treated commensuration as work — with a cost, performers and a politics — not a property of things. It is valued, they argued, because it destroys information deliberately: flattening to one number is what makes attention possible. Porter (1995) added the other half — quantification is most forceful where authority is weakest.',
      ),
      minimalForm: 'φ: X → ℝ；代价 = φ⁻¹(v) 内部被抹去的全部差异',
      canonicalSubstrates: [
        sub('伤残调整生命年', 'The disability-adjusted life year', '卫生经济学', 'Health economics', 1,
          '被压平的维度是"多活一年"与"活成什么样"之间的一切差别，靠一组失能权重折算',
          'the flattened dimensions are every difference between a year added and the state it is lived in, converted by a set of disability weights',
          '这里压平系数由调查与投票定出，有可查的出处与一场公开争论；多数基底的压平是隐式、无出处的，所以这里罕见地允许直接问"谁定的这个数"。',
          'The flattening coefficients were produced by survey and vote, with a citable provenance and a public argument; elsewhere the flattening is implicit and unattributed, so only here can the question of who set the number be asked directly.'),
        sub('二氧化碳当量', 'Carbon dioxide equivalent', '环境科学', 'Environmental science', 0,
          '共同单位是百年全球增温潜势下折算的二氧化碳吨数',
          'the shared unit is tonnes of carbon dioxide converted at the hundred-year global warming potential',
          '这把尺内建一个时间窗：甲烷在 20 年窗口下的当量接近 100 年窗口的三倍，"同一吨"的含义随一个几乎从不被写出的参数改变，而它决定减排次序。',
          'A time window is built into this ruler: methane at twenty years is worth nearly three times its hundred-year figure, so what one tonne means shifts with a parameter almost never written down, which also fixes what gets cut first.'),
        sub('期刊影响因子与科研评价', 'The impact factor in research assessment', '科学计量学', 'Scientometrics', 2,
          '单位的制定者是一家私营数据库，被评价者从未参与选择这把尺，也无法查验其分子分母',
          'the unit is set by a private database, and those assessed neither chose the ruler nor can audit its numerator and denominator',
          '这里制定者与被度量者完全分离，定义还可以在被度量者不知情时修改——它因此同时是通约代价与度量扭曲的实例，而在此二者无法分开讨论。',
          'Setter and measured are wholly separate, and the definition can change without the measured being told — which makes it an instance of commensuration cost and of metric distortion at once, inseparably here.'),
      ],
      relations: [
        rel('metric-distortion', 'generates',
          '缝隙不是度量的偶然缺陷，它就是通约那一步压平掉的维度。所以换指标只在新尺压平了不同维度时才有用；压平本身不可取消，可选的只有压掉哪些。',
          'The gap is not an incidental defect of measurement: it is the dimensions the commensuration step flattened. A better indicator helps only where the new ruler flattens different dimensions; the flattening cannot be removed, only redirected.'),
        rel('standardisation-lowers-the-bar', 'explains',
          '标准化能降门槛，靠的正是通约压平掉的差异——共同的尺让不必懂全部细节的人也能参与。所以"门槛降低"与"差异被丢弃"不是可分开权衡的两件事，是同一步的两面。',
          'Standardisation lowers the barrier by means of the differences commensuration flattens: a shared ruler lets people take part without knowing the particulars. A lowered bar and discarded difference are not two things to trade off but one step from two sides.'),
        rel('impossibility-theorem', 'emerges-from',
          '把不可比维度压成一个序，形式上正是阿罗与森处理的问题。定理说没有一种压法能同时满足全部合理条件；通约代价说压法照样得选，被放弃的那个条件就是代价的名字。',
          'Flattening incomparable dimensions into one ordering is formally the problem Arrow and Sen worked on. The impossibility result says no flattening meets every reasonable condition; commensuration cost says one is chosen regardless, so the abandoned condition is the name of the price.'),
      ],
      mistakenFor: bi(
        '常被当成"量化有害"，或当成测量误差。它不是误差：数可以完全准确而代价照付，因为代价落在这把尺再也分不开的那些东西之间。检验方法是问：这把尺现在把哪两样东西称作相等？没有人愿意单独为这条等式辩护，压平就在做一件没人签过字的事。',
        'Taken either for a complaint about quantification or for measurement error. It is not error: the number can be perfectly accurate and the cost still paid in full, because the cost lives among the things the ruler can no longer tell apart. The test is to ask which two things the unit now calls equal, and whether anyone would defend that equality on its own; if not, the flattening is doing work nobody signed for.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/metric-distortion',
    depth: {
      origin: bi(
        'Campbell 1979 从项目评估、Goodhart 1975 从货币政策各自独立说出同一条规律。Goodhart 的原话讲的不是人作弊：他说英格兰银行一旦把某个货币总量当作调控目标，那条统计规律本身就会失效——这是卢卡斯批判的近亲。"作弊"的读法后来才加上，覆盖更广也更松。',
        'Campbell (1979) from programme evaluation and Goodhart (1975) from monetary policy stated the same law independently. Goodhart was not describing cheating: his claim was that once the Bank of England adopted a monetary aggregate as a control target, the statistical regularity itself broke down — a close relative of the Lucas critique. The cheating reading came later, broader and looser.',
      ),
      minimalForm: 'm ≠ g ⇒ argmax m 落在 m − g 最大的那一侧',
      canonicalSubstrates: [
        sub('急诊四小时目标', 'The four-hour accident and emergency target', '卫生政策', 'Health policy', 0,
          '缝隙落在"四小时内被处置"与"及时得到照护"之间，救护车滞留把时钟停在门外',
          'the gap sits between being processed within four hours and being cared for in time, and holding patients in ambulances stops the clock outside the door',
          '这个基底罕见地留下可观测痕迹：四小时刻度前最后几分钟的出院尖峰使缝隙被利用可以被证明而不只是被怀疑；多数管理指标不带这样的时间戳。',
          'This substrate leaves an observable trace, which is rare: the discharge spike in the final minutes before the four-hour mark makes exploitation demonstrable rather than merely suspected, where most managerial indicators carry no timestamps.'),
        sub('按考试成绩问责教师', 'Holding teachers to test scores', '教育测量', 'Educational measurement', 2,
          '脱钩速度：应试训练使被问责测验上的分数上升，而同一能力在别处不动',
          'the rate of decoupling: coaching lifts scores on the accountable test while the same ability stays put elsewhere',
          '这里有天然对照——同一批学生在低风险测验上的成绩，脱钩因此可以被直接测出（Koretz 称之为分数膨胀）；多数管理指标没有第二把尺可对照。',
          'A natural control exists here — the same students on a low-stakes test — so decoupling can be measured directly, what Koretz calls score inflation; most managerial indicators have no second ruler.'),
        sub('点击率优化的推荐系统', 'Click-through optimisation in recommenders', '机器学习', 'Machine learning', 1,
          '优化压力由自动化的梯度施加，强度远大于任何人事考核所能施加的压力',
          'optimisation pressure is applied by an automated gradient, far harder than any personnel review can push',
          '这里被优化者是模型而不是人，钻空子不需要意图：缝隙被利用的速度只由优化步数决定。扭曲快若干数量级，"证明有人作弊"这一步整个消失。',
          'The optimiser here is a model rather than a person, so working the gap needs no intent: the rate is set by optimisation steps alone. Distortion runs orders of magnitude faster, and proving that somebody cheated disappears as a step.'),
      ],
      relations: [
        rel('leverage-point', 'emerges-from',
          '在参数那一级施力，而被作用者能看到自己被怎么量，杠杆结构就退化成扭曲。所以阻力最小的一级也是最容易被从内部消解的一级——低阻力买来的是可动性，不是持久性。',
          'Push at the parameter rung while the party pushed can see how it is measured, and leverage degrades into distortion. The rung that resists least is the one most easily undone from inside: low resistance buys movability, not durability.'),
        rel('information-asymmetry', 'emerges-from',
          '缝隙之所以能被利用，是因为被度量者比度量者更清楚它长什么样。缝隙人人都有，只有一方知道它具体在哪——脱钩速度因此由信息差决定，不由优化压力单独决定。',
          'The gap gets worked because the measured party sees its shape better than the measurer. Everyone has a gap and only one side knows where it runs, so the rate of decoupling is set by the asymmetry rather than by pressure alone.'),
        rel('red-queen', 'generates',
          '指标被绕开就打补丁，补丁又被绕开：度量方与被度量方进入相互适应，双方都在跑而相对位置不变。所以"换一个更好的指标"是这条跑道上的一步，不是出口。',
          'The indicator is worked around, patched, and worked around again: measurer and measured enter mutual adaptation, both running while their relative position holds. A better indicator is a step on that track, not a way off it.'),
      ],
      mistakenFor: bi(
        '常被压成"古德哈特定律"这句口号，读作"度量没有意义"。有用的内容是它指认了指标与目标之间的缝隙，并说优化会往缝隙里跑。由此有三条：缝隙为零则不扭曲，对策是收窄缝隙而非取消度量；缝隙存在不等于已被利用，要看到指标动而独立代理不动；它不是测量误差，无意图的优化器同样产生它。',
        'Flattened into Goodhart as a slogan meaning measurement is futile. The content is that it names a gap between indicator and goal and says the optimisation goes into the gap. Three things follow: with no gap there is no distortion, so the remedy narrows the gap rather than stops the measuring; a gap existing is not evidence it was worked, which needs the indicator moving while an independent proxy does not; and it is not measurement error, since an optimiser with no intent produces it.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/devolving-control',
    depth: {
      origin: bi(
        '几个互不相干的领域各自成形：1931 年的辅助性原则、Ostrom 1990 年的自治公地研究、2016 年的联邦学习。最值得一提的是 Saltzer 等 1984 年的端到端论证，它从纯技术前提得出下移：无论如何都要在端点实现的功能，放到中间也不会正确。互联网最初的控制权分布由它塑造。',
        'It took shape independently in several fields — subsidiarity (1931), Ostrom on self-governed commons (1990), federated learning (2016). The striking one is the end-to-end argument of Saltzer, Reed and Clark (1984), reaching devolution from a technical premise: a function that must be implemented at the endpoints anyway is not made correct in the middle. That argument, not a political one, shaped how control was first distributed on the internet.',
      ),
      canonicalSubstrates: [
        sub('联邦学习', 'Federated learning', '机器学习', 'Machine learning', 0,
          '被移动的是原始数据的位置：数据留在产生它的设备上，只有梯度或权重上行',
          'what moves is where the raw data sits: it stays on the device that produced it and only gradients or weights travel up',
          '这里下移的是数据而不是决定权：聚合方仍决定训练什么目标、何时停止。隐私下移而目标留在中心，而"目标在谁手里"恰是本结构真正要问的。',
          'What is devolved here is the data, not the decision: the aggregator still sets what is trained for and when to stop. Privacy moves down while the objective stays central — and who holds the objective is what this structure asks.'),
        sub('分布式能源与微电网', 'Distributed generation and microgrids', '电力系统', 'Power systems', 1,
          '中心原本提供的协调是频率调节、惯量与备用容量，全靠少数大型同步机组承担',
          'the coordination the centre provided is frequency regulation, inertia and reserve, carried by a few large synchronous machines',
          '这里中心提供的协调有物理形态，失去它的后果以毫秒计。下移必须先用电力电子把惯量重造出来，没有社会基底里"协调以后再补"的余地。',
          'Coordination here has a physical form and its loss registers in milliseconds, so devolution must first rebuild inertia in power electronics. There is none of the room social substrates leave for arranging it afterwards.'),
        sub('社区森林与灌溉自治', 'Community forests and irrigation self-governance', '制度经济学', 'Institutional economics', 2,
          '产生者的能力门槛在此被写成一份可核查的清单：边界清晰、规则本地化、分级制裁、可用的冲突解决通道',
          'what producers must be able to do is written here as a checkable list: clear boundaries, locally fitted rules, graduated sanctions and an accessible route for resolving conflict',
          '这份清单是从长期存活的案例反推出来的，描述的是"哪些自治撑住了"，不能读成"照做就撑得住"——幸存者偏差在清单上没有被处理。',
          'The list was read back off cases that lasted, so it says which self-governed systems survived and cannot be read as what makes one survive: survivorship bias is unhandled on it.'),
      ],
      relations: [
        rel('leverage-point', 'special-case-of',
          '介入位置被固定在结构那一级：动的是资源与决定权落在哪一层，而不是任何参数值。这也解释了它的典型代价——结构级介入会带走上一层默默提供的功能，参数级不会。',
          'The intervention site is fixed at the structural rung: what moves is which layer holds the resource, not any parameter value. That also explains its characteristic cost — a structural move takes away what the upper layer quietly provided; a parameter move does not.'),
        rel('network-externality-lockin', 'competes-with',
          '同一观察——人人说想下移而控制权留在中心——可读作中心在做没人接手的协调，或无人能先动因而锁定。判别方法是看一小群人退出后失去什么：失去本可自建的功能是协调，只失去与他人的连通是锁定。',
          'One observation — everyone wants devolution and control stays central — reads either as the centre doing coordination nobody has taken over, or as lock-in where no one can move first. The discriminator is what a seceding group loses: a function they could have rebuilt means coordination, reach to others alone means lock-in.'),
        rel('data-movement-dominates', 'emerges-from',
          '算力下沉最初的理由是成本而非治理：搬运比计算贵，把模型送到数据那边比反过来省。治理论证是后来附上的，这也说明数据小而模型大的场合，同一套下移主张会立刻失去经济基础。',
          'Compute moved down for cost before governance: moving data costs more than computing on it, so sending the model to the data beats the reverse. The governance argument was attached afterwards, which is why the same case loses its economics wherever the data is small and the model large.'),
      ],
      mistakenFor: bi(
        '常被当成"去中心化本身就好"，或当成"去掉一个中间商"。检验方法是点名中心原本做的那件事，并说出下移之后由谁来做；答不出来的方案下移的是责任而不是控制权。也要与授权区分：授权保留收回与推翻的权利，下移放弃了它——中心随时能把资源拿回去，就什么也没有下移。',
        'Taken either for decentralisation as a good in itself or for cutting out a middleman. The test is to name what the centre was doing and say who does it afterwards; a proposal that cannot answer has devolved the responsibility rather than the control. It is also not delegation: delegation keeps the right to overrule and devolution gives it up — if the centre can take the resource back, nothing was devolved.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/leverage-point',
    depth: {
      origin: bi(
        'Meadows 1999 年的一篇文章，承自 Forrester 的系统动力学。反直觉的部分在 Forrester 的原始观察里：人们凭直觉往往能找准该动哪里，然后把方向推反——问题不是找不到杠杆点，是找到了却用错符号。Meadows 自己把那份清单标为临时的并警告不要照单执行，而这句警告被引用得最少。',
        'A 1999 essay by Meadows, out of Forrester and system dynamics. The counterintuitive part is in the original Forrester observation: people intuitively locate the right place to push and then push it the wrong way — the problem is not finding the leverage point but getting the sign wrong. Meadows labelled the list provisional and warned against working through it, the least-quoted line in the piece.',
      ),
      minimalForm: '参数 ≺ 结构 ≺ 目标 ≺ 范式；杠杆与阻力沿同一序上升',
      canonicalSubstrates: [
        sub('渔业管理', 'Fisheries management', '资源管理', 'Resource management', 0,
          '介入位置从配额数值（参数），到产权与准入结构（结构），到"以最大可持续产量为目标"这句话本身（目标）',
          'the intervention runs from the quota number as a parameter, through property rights and access as structure, to the statement that maximum sustainable yield is the objective at all',
          '这个基底罕见地把最高一级写进法条，"范式"因此有可指认的文本位置、可以被修订；多数系统的范式只存在于习惯里，没有文本，而那使它更难改。',
          'This substrate unusually writes its top rung into statute, so the paradigm has a citable textual location and can be amended; in most systems it exists only in habit, with no text, which makes it harder to change.'),
        sub('绿色革命与农业系统', 'The green revolution in agriculture', '发展研究', 'Development studies', 1,
          '杠杆倍数的对比：提高单产（参数）与改变谁拥有土地（结构）之间，单位力气的响应相差极大',
          'the contrast in leverage: raising yield per hectare as a parameter against changing who owns the land as structure',
          '这里参数级干预的绝对效果大到把结构级问题推迟了几十年，所以本基底直接反驳一种常见读法：低杠杆不等于低效果，阶梯排的是每单位力气的响应。',
          'Parameter-level intervention here had an absolute effect large enough to defer the structural question for decades, refuting a common reading: low leverage is not low effect, since the ladder ranks response per unit of effort.'),
        sub('组织变革', 'Organisational change', '管理学', 'Management', 2,
          '阻力：改一个考核指标一周可以做完，改考核所服务的目的要动到谁被晋升',
          'resistance: an indicator can be changed in a week, and changing what the assessment is for reaches who gets promoted',
          '这里阻力有具体承担者，可以被谈判、收买或等其退休，因而可预算；生态或物理系统里阻力是结构性的，没有对手可谈，"提高杠杆"不是同一种工作。',
          'Resistance here has identifiable bearers who can be negotiated with, bought out or waited out, so it can be budgeted; in ecological or physical systems it is structural with no counterparty, and moving up the ladder is different work.'),
      ],
      relations: [
        rel('commensuration-cost', 'generates',
          '在目标那一级介入，意味着改变"什么算成功"，而成功必须用某个单位陈述。所以目标级的每一次介入都变成一场关于单位的争夺——而单位一旦立起来就有了自己的维护者。',
          'Intervening at the goal rung means changing what counts as success, and success has to be stated in some unit. Every goal-level intervention therefore turns into a fight over the unit — and a unit, once erected, acquires people who maintain it.'),
        rel('path-dependence', 'emerges-from',
          '阻力沿阶梯上升的原因不神秘：越高的一级，已经依赖它的东西越多，而那些依赖是历史一次次锁进去的。所以杠杆与阻力同向不是经验巧合，是报酬递增在结构上的投影。',
          'Why resistance rises with the rung is not mysterious: the higher the level, the more has come to depend on it, and those dependencies were locked in one at a time. Leverage and resistance running together is not an empirical coincidence but increasing returns projected onto structure.'),
        rel('slow-variable-creep', 'explains',
          '最高的两级通常不是被谁改的，是自己漂过去的：范式变化事后看是一次跃迁，事内是一个慢变量越过了没人盯着的阈值。这化解了表面矛盾——最高杠杆点阻力最大，而最高层确实一直在变。',
          'The top two rungs are usually not changed by anyone but drift: a paradigm shift looks like a jump afterwards and is a slow variable crossing an unwatched threshold at the time. That dissolves an apparent contradiction — the highest-leverage point resists most, and the highest level does keep changing.'),
      ],
      mistakenFor: bi(
        '常被读成一张按可取程度排序的待办清单，"要瞄准范式"。结构说的恰好相反：杠杆与阻力同向上升，这份阶梯是地形图不是路线。检验方法是问一项拟议干预"谁必须点头"——要点头的人越多，位置越高，成功率越低。也要与"高杠杆即高影响"区分：杠杆是每单位力气的响应，力气充足时低一级可压倒高一级。',
        'Read as a to-do list ranked by desirability. The structure says the opposite: leverage and resistance rise together, so the ladder is a map of the terrain rather than a route. The test for an intervention is who has to agree — the more who must, the higher the rung and the lower the odds. Nor does high leverage mean high impact: leverage is response per unit of effort, so plentiful effort at a lower rung can beat a higher one.',
      ),
    },
  },
];
