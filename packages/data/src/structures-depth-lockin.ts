import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the evolution-and-lock-in family — why
 * things stay the way they are once they got that way.
 *
 * Chosen fourth because it closes the relation graph. The first three batches
 * built a tree: relations pointed outward and nothing pointed back. This family
 * already had two inbound edges from the collective batch — niche construction
 * generates both path dependence and deep-time accumulation — and its own
 * relations point back into the collective and critical families, so the graph
 * now has cycles. That matters for a reader: a network you can only walk one
 * way is a taxonomy, and one you can walk around is a map.
 *
 * All eight are wave-7 structures and already carry declared quantities, so
 * this batch is depth only.
 *
 * The relation worth arguing over is `drift-fixation competes-with
 * replicator-dynamics`. They are not complementary readings: for any observed
 * fixation, either selection did it or sampling did, and the whole of
 * mid-century population genetics was the fight over which. Filing them as
 * rivals rather than as a tidy hierarchy is the honest record of that.
 *
 * Same terms throughout: textbook knowledge, no island referenced anywhere, no
 * mapping or coverage touched.
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

export const LOCKIN_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/path-dependence',
    depth: {
      origin: bi(
        '1985 年由 Paul David 用 QWERTY 键盘的历史提出，1989 年由 Brian Arthur 给出报酬递增的形式化；经济学界至今仍在争论 QWERTY 这个案例本身是否成立，而这场争论恰恰是这条结构最好的教学材料。',
        'Introduced by Paul David in 1985 through the history of the QWERTY keyboard and formalised as increasing returns by Brian Arthur in 1989; economists still dispute whether the QWERTY case itself holds, and that dispute is the best teaching material this structure has.',
      ),
      minimalForm: '早期扰动 ε 经正反馈放大 ⇒ 终态由 ε 而非终点优劣决定',
      canonicalSubstrates: [
        sub('技术标准', 'Technical standards', '技术经济学', 'Economics of technology', 1,
          '早期市场份额通过互补品与培训投入自我强化，领先者越走越难被替代',
          'an early share reinforcing itself through complements and training, making the leader ever harder to displace',
          '要证明锁定，必须证明存在一个更好的备选且它输在了偶然而非质量上——这一步在 QWERTY 上至今没有共识，多数被断言的锁定都缺这一步。',
          'Establishing lock-in requires showing a better alternative existed and lost on accident rather than on merit, a step still unsettled for QWERTY and missing from most asserted cases.'),
        sub('城市区位', 'City location', '城市经济学', 'Urban economics', 0,
          '一条河的渡口、一个偶然的驿站，被产业集聚放大成几百年的中心地位',
          'a river crossing or a chance staging post amplified by agglomeration into centuries of centrality',
          '地理条件本身可能就是那个"非偶然"的原因；把初始位置一律读成偶然，会漏掉真实的地理优势。',
          'Geography may be the non-accidental reason in the first place, and reading every initial position as chance misses genuine locational advantage.'),
        sub('学术范式', 'Academic paradigms', '科学社会学', 'Sociology of science', 2,
          '早期投入训练、仪器与期刊之后，转换一个范式的代价远超其学术收益',
          'once training, instruments and journals are invested, switching paradigm costs far more than it returns academically',
          '范式转换确实发生过，所以这里的锁定不是绝对的；有意思的问题是转换需要多大的外部冲击，而不是能不能转。',
          'Paradigms do shift, so lock-in here is not absolute, and the interesting question is how large a shock it takes rather than whether it can happen.'),
      ],
      relations: [
        rel('frozen-accident', 'generates',
          '路径依赖持续得够久，早期那个偶然就变成承载性的：足够多东西依赖它之后，它不再是"当初选错了"，而是"现在改不动了"——冻结的偶然是路径依赖跑到终点的样子。',
          'Run path dependence long enough and the early accident becomes load-bearing: once enough depends on it, the question stops being whether the choice was wrong and becomes that it can no longer move — a frozen accident is path dependence at its end state.'),
        rel('deep-time-accumulation', 'emerges-from',
          '正反馈让每一步的微小优势不衰减地累积，所以在人的时标上可忽略的差异，在制度或技术的时标上主导一切——路径依赖是深时累积作用在选择上的形式。',
          'Positive feedback lets each step\'s small advantage accumulate without decaying, so a difference negligible on a human timescale dominates on an institutional or technological one: path dependence is deep-time accumulation acting on choices.'),
      ],
      mistakenFor: bi(
        '常被误当成"先发优势"。先发优势只说早到有好处，路径依赖多说一句：终局与优劣无关，且改不回去。少了"存在更好的备选却输了"这一条，观察到的领先只是领先。',
        'Often mistaken for first-mover advantage. That only says arriving early helps; path dependence adds that the outcome is independent of merit and cannot be undone. Without showing a better alternative existed and lost, an observed lead is only a lead.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/frozen-accident',
    depth: {
      origin: bi(
        '1968 年由 Francis Crick 为遗传密码提出："这套对应关系没有化学上的必然性，它只是早期被固定下来，此后任何改动都是致命的。"这个说法后来被扩用到一切一旦承载就改不动的任意选择。',
        'Coined by Francis Crick for the genetic code in 1968 — the correspondence has no chemical necessity, it was fixed early and any later change is lethal — and since extended to any arbitrary choice that becomes unchangeable once things depend on it.',
      ),
      minimalForm: '早期任意选择 + 大量依赖 ⇒ 切换成本 > 改进收益，永久保留',
      canonicalSubstrates: [
        sub('遗传密码', 'The genetic code', '分子生物学', 'Molecular biology', 0,
          '几乎所有生物共用同一套密码子对应，因为改动一个对应会同时破坏所有蛋白',
          'nearly all life sharing one codon assignment because changing any one of them breaks every protein at once',
          '密码表并非完全任意：它对点突变的容错率高于随机分配，所以"冻结"与"被选择过"在这里同时成立，二者的比例仍在争论。',
          'The table is not wholly arbitrary — it tolerates point mutations better than a random assignment would — so frozen and selected both apply here and their relative share is still argued.'),
        sub('键盘布局', 'Keyboard layout', '技术史', 'History of technology', 1,
          '训练与肌肉记忆构成的切换成本，长期高于任何布局改进能带来的收益',
          'the switching cost of training and muscle memory staying above whatever a better layout would return',
          '这是被引用最多也最被质疑的案例：Dvorak 优势的实验证据本身很弱，所以它更适合用来教"如何检验一个锁定主张"而不是用作证据。',
          'The most cited and most disputed case: the experimental evidence for Dvorak\'s advantage is itself weak, which makes it better for teaching how to test a lock-in claim than for serving as one.'),
        sub('退化器官', 'Vestigial organs', '演化生物学', 'Evolutionary biology', 2,
          '失去功能却仍被保留，因为删除它的代价大于留着它的代价',
          'kept after losing its function because removing it costs more than leaving it',
          '"退化"常被高估：不少曾被判为无用的结构后来发现有次要功能，所以缺乏删除压力与真的没有功能不是一回事。',
          'Vestigiality is routinely overstated: structures once judged useless have turned out to have secondary functions, so an absence of deletion pressure is not the same as an absence of function.'),
        sub('法律条文', 'Statutory provisions', '法学', 'Law', 0,
          '一条早期条文被后续判例反复引用之后，修改它要同时处理所有依赖它的判决',
          'once an early provision has been cited by a line of cases, changing it means dealing with every decision that relied on it',
          '法律有明确的修改机制，所以这里的冻结是政治成本而非物理不可能——它随议程与多数而变，不像遗传密码那样稳定。',
          'Law has explicit amendment machinery, so the freezing here is political cost rather than impossibility, and it moves with agendas and majorities in a way the genetic code does not.'),
      ],
      relations: [
        rel('drift-fixation', 'emerges-from',
          '被冻住的那个选择往往一开始并不占优，只是在早期的小群体里被随机固定下来——漂变提供"任意"，依赖提供"冻结"，两者合起来才是这条结构。',
          'The frozen choice was usually not superior to begin with and merely fixed by sampling in a small early population: drift supplies the arbitrariness and dependency supplies the freezing, and only together do they make the structure.'),
        rel('network-externality-lockin', 'competes-with',
          '一个次优标准至今仍在，可以是因为改它的技术依赖太深（冻结的偶然），也可以是因为用户互相锁定而单个用户换不动（网络外部性）——两者给出的解法完全不同：前者要重写依赖，后者要协调迁移。',
          'A suboptimal standard may persist because the technical dependencies run too deep or because users lock each other in and none can move alone, and the two call for entirely different remedies: rewriting dependencies in one case, coordinating a migration in the other.'),
      ],
      mistakenFor: bi(
        '常被误当成"这东西没用还留着"。缺乏删除压力只是一半；另一半是它承载着别的东西。一个真正无用又无依赖的特征会被清除，所以看到一个又无用又难改的东西，恰恰说明有东西正依赖着它。',
        'Often mistaken for something useless that stuck around. Absence of deletion pressure is only half; the other half is that things depend on it. A feature genuinely useless with nothing depending on it does get cleared, so finding one both useless and immovable is evidence that something is relying on it.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/red-queen',
    depth: {
      origin: bi(
        '1973 年由 Leigh Van Valen 提出，用的是化石记录里的一个统计事实：一个类群的灭绝概率不随它已存在多久而下降——无论适应了多久，压力都没有减轻。名字取自《爱丽丝镜中奇遇》里"必须拼命跑才能留在原地"。',
        'Proposed by Leigh Van Valen in 1973 from a statistical fact in the fossil record: a taxon\'s extinction probability does not fall with how long it has already survived, so however long it has adapted the pressure has not eased. The name is from Through the Looking-Glass, where running hard only keeps you in place.',
      ),
      minimalForm: '双方持续改进 ⇒ 绝对能力 ↑，相对位置不变；停止投入即后退',
      canonicalSubstrates: [
        sub('宿主—寄生虫协同演化', 'Host-parasite coevolution', '演化生物学', 'Evolutionary biology', 1,
          '寄主的抗性与寄生者的毒力互相追赶，双方基因组都在快速变化而感染率大致不变',
          'host resistance and parasite virulence chasing each other, with both genomes changing fast while the infection rate stays roughly put',
          '这条结构预言的是相对位置不变，不是永不改变：真实系统里一方可能突破并造成大流行，红皇后描述的是常态而非全部。',
          'The structure predicts a stable relative position rather than no change at all: in real systems one side can break through and cause an epidemic, so it describes the usual case and not every case.'),
        sub('安全攻防', 'Security offence and defence', '信息安全', 'Information security', 0,
          '防御方的每一次加固都被攻击方的下一次技术抵消，双方投入都在涨',
          'each hardening by the defender cancelled by the attacker\'s next technique, with both sides\' spending rising',
          '攻防并不对称：攻击方只需找到一条路径，防御方要守住全部——所以这里的"跑在原地"对两边的成本完全不同。',
          'Attack and defence are asymmetric: the attacker needs one path and the defender must hold all of them, so running in place costs the two sides very differently.'),
        sub('广告军备竞赛', 'The advertising arms race', '市场营销', 'Marketing', 2,
          '同行业所有人都增加广告投入之后，各家的相对份额回到原点而总成本上升',
          'once every firm in an industry raises its advertising, relative shares return to where they were and total cost rises',
          '这里存在退出选项：一个行业可以通过协议或监管整体降低投入，而生物系统不能——所以社会基底上的红皇后是可解的。',
          'An exit exists here: an industry can lower spending collectively by agreement or regulation, which a biological system cannot, so the Red Queen in a social substrate is solvable.'),
        sub('生物拟态', 'Mimicry', '行为生态学', 'Behavioural ecology', 1,
          '伪装者不断改进相似度，接收者不断改进辨别力，循环升级',
          'mimics improving their resemblance and receivers improving discrimination, round after round',
          '这条循环有第二个出口：当辨别成本超过被骗成本，接收者干脆不再辨别，竞赛就停在一个"容忍被骗"的平衡上。',
          'This loop has a second exit: once discrimination costs more than being fooled, the receiver stops discriminating and the race settles at a tolerated level of deception.'),
      ],
      relations: [
        rel('replicator-dynamics', 'emerges-from',
          '红皇后是复制者动力学在双方同时运行时的样子：一方的适合度 f_i 由另一方的组成决定，于是平均适合度这条基准线自己在跑，谁都追不上它。',
          'The Red Queen is replicator dynamics with both sides running it at once: each population\'s fitness depends on the other\'s composition, so the mean-fitness benchmark moves on its own and nobody catches it.'),
        rel('resistance-rotation', 'explains',
          '它解释了为什么"追赶抗性"注定失败而"延缓抗性"才是可行目标：只要单一机制上的压力持续，对手就沿那条路径持续改进，所以策略必须换机制而不是加剂量。',
          'It explains why chasing resistance is bound to fail and delaying it is the achievable goal: sustained pressure along one mechanism keeps the opponent improving along that path, so the strategy has to change mechanism rather than raise the dose.'),
      ],
      mistakenFor: bi(
        '常被误当成"竞争激烈"。它说的不是激烈而是徒劳的形状：绝对能力在提升而相对位置不动。要检验它，必须同时测两件事——自身在变好，以及排名没变。只报前者是所有伪红皇后案例的共同特征。',
        'Often mistaken for competition being intense. What it describes is not intensity but the shape of futility: absolute capability rising while relative position does not move. Testing it requires measuring both — that you improved and that the ranking did not change — and reporting only the first is what every spurious Red Queen case has in common.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/tolerance-evolution',
    depth: {
      origin: bi(
        '1940 年代随青霉素的广泛使用被临床观察到，此后在杀虫剂、除草剂与化疗上一再重演；它是"压力本身在制造对手"这一现象最早被系统记录的形式。',
        'Observed clinically in the 1940s as penicillin came into wide use and repeated since in insecticides, herbicides and chemotherapy; it is the earliest systematically recorded form of pressure manufacturing its own opposition.',
      ),
      minimalForm: '亚致死暴露 × n 轮 ⇒ 存活者耐受分布右移',
      canonicalSubstrates: [
        sub('抗生素耐药', 'Antibiotic resistance', '微生物学', 'Microbiology', 0,
          '亚致死剂量杀掉最敏感的一批，留下的比上一轮更耐受',
          'a sub-lethal dose killing the most sensitive and leaving survivors more tolerant than before',
          '耐药还能通过水平基因转移横向获得，不必经过本群体的选择——所以观察到耐药上升不等于本地选择在起作用。',
          'Resistance can also arrive by horizontal gene transfer without passing through selection in this population, so rising resistance is not evidence that local selection did it.'),
        sub('杀虫剂抗性', 'Insecticide resistance', '农业昆虫学', 'Agricultural entomology', 2,
          '一季一季地施药，每一季都是一轮选择，抗性等位基因频率逐季上升',
          'each spraying season one round of selection, with the resistance allele rising season by season',
          '田间存在未施药的庇护所，抗性个体在那里没有优势——庇护所策略之所以有效，正是因为它打断了"每一轮都是选择"这个前提。',
          'Untreated refuges leave resistant individuals with no advantage, and the refuge strategy works precisely because it breaks the premise that every round is a round of selection.'),
        sub('垃圾邮件过滤', 'Spam filtering', '信息工程', 'Information engineering', 1,
          '被拦下的邮件形态消失，留下的是恰好绕过当前规则的那一批',
          'the shapes that get caught disappear, leaving those that happen to slip past the current rules',
          '这里的"变异"是发送方有意设计的而非随机的，所以适应速度远快于生物系统，且不受繁殖周期限制。',
          'Variation here is designed by the sender rather than random, so adaptation runs far faster than in a biological system and is not paced by a reproductive cycle.'),
        sub('对抗样本', 'Adversarial examples', '机器学习', 'Machine learning', 2,
          '每一次对抗训练都筛掉当前能骗过模型的样本，留下更难被防住的那类',
          'each round of adversarial training removes the attacks that currently work and leaves the harder ones',
          '模型不繁殖：这里被"选择"的是攻击方法而不是模型，方向是反的，所以耐受的是攻击者而不是被施压者。',
          'The model does not reproduce: what is selected here is the attack rather than the model, so the direction is reversed and it is the attacker that becomes tolerant.'),
      ],
      relations: [
        rel('replicator-dynamics', 'special-case-of',
          '耐受演化就是复制者方程被反复施加同一个选择压：每一轮把存活者的耐受分布右移一点，轮次是把小位移累成大位移的乘数。',
          'Tolerance evolution is the replicator equation with one selection pressure applied over and over, each round shifting the survivors\' tolerance a little and the number of rounds multiplying small shifts into a large one.'),
        rel('resistance-rotation', 'generates',
          '它制造出了轮换要解决的那个问题：单一机制上的持续压力必然选出抗性，所以策略必须按机制分组轮换——方法存在的理由就是这条结构的失效条件。',
          'It creates the problem rotation exists to solve: sustained pressure on one mechanism necessarily selects for resistance, so a strategy has to rotate by mechanism — the method exists because of this structure\'s failure condition.'),
      ],
      mistakenFor: bi(
        '常被误当成"用得越多耐药越强"这个剂量直觉。关键量是暴露的亚致死性而非总量：足够致命且不留存活者的暴露不产生耐受，而长期低剂量恰恰最有效地制造它——所以"减少用量"与"减少亚致死暴露"不是同一条建议。',
        'Often reduced to the dose intuition that more use means more resistance. The operative quantity is sub-lethality rather than volume: exposure lethal enough to leave no survivors produces no tolerance, while sustained low doses produce it most efficiently — so using less and exposing less sub-lethally are not the same advice.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/propagule-pressure',
    depth: {
      origin: bi(
        '1990 年代由入侵生态学确立，用来解释一个反直觉的统计事实：预测入侵成败最好的变量不是物种特性，而是被引入的数量与次数。',
        'Established by invasion ecology in the 1990s to account for a counter-intuitive statistical fact: the best predictor of whether an introduction succeeds is not the species\' traits but how many arrived and how often.',
      ),
      minimalForm: 'P(建立) 随引入次数与单次数量升高，主要通过压低随机灭绝概率',
      canonicalSubstrates: [
        sub('入侵物种', 'Invasive species', '入侵生态学', 'Invasion ecology', 1,
          '同一物种在被反复引入的港口建立，在只引入一次的地方失败',
          'one species establishing at ports where it arrived repeatedly and failing where it arrived once',
          '引入次数往往与贸易量相关，而贸易量又与栖息地扰动相关——所以这个变量的解释力有一部分可能来自它代理了别的东西。',
          'Arrival frequency correlates with trade volume which correlates with habitat disturbance, so part of this variable\'s explanatory power may come from what it proxies rather than from itself.'),
        sub('创业', 'Entrepreneurship', '创业研究', 'Entrepreneurship research', 1,
          '连续创业者的成功率高于一次性创业者，很大一部分来自尝试次数而非个体能力',
          'serial founders succeeding more than one-time founders, in large part from the number of attempts rather than individual ability',
          '这里的尝试不独立：每次失败会改变下一次的条件与资源，所以不能当作重复抽样处理。',
          'Attempts here are not independent, since each failure changes the conditions and resources for the next, so they cannot be treated as repeated draws.'),
        sub('标准推广', 'Standards adoption', '技术标准化', 'Standardisation', 0,
          '一次推广投放的实现数量决定它能否越过自我维持的门槛',
          'how many implementations one push puts out deciding whether it clears the threshold of self-sustaining use',
          '标准之间存在直接竞争而物种未必——已被占据的位置会主动排斥后来者，这比生态里的饱和更强。',
          'Standards compete directly in a way species need not: an occupied position actively repels newcomers, which is stronger than saturation in ecology.'),
      ],
      relations: [
        rel('branching-criticality', 'special-case-of',
          '一次引入能否建立就是一个分支过程：即使 R₀ 略大于一，单次引入最可能的结局仍是灭绝，而反复引入等于把这个过程重跑多次——所以数量与频次买到的是"至少一次不灭绝"。',
          'Whether one introduction establishes is a branching process: even with R₀ just above one, extinction remains the most likely single outcome, and repeating the introduction reruns the process — so numbers and frequency buy the chance that at least one run survives.'),
        rel('drift-fixation', 'explains',
          '它说明为什么小规模引入即使占优也常常失败：在小种群里随机取样压过优势，所以"这个变体更好"根本来不及体现出来。',
          'It explains why a small introduction often fails even when advantaged: in a small population sampling swamps the advantage, so being better never gets the chance to show.'),
      ],
      mistakenFor: bi(
        '常被误当成"多试几次总能成"。它成立的前提是每次尝试基本独立且环境未饱和；一旦位置被占满，再多的到达也只是被挡在外面，此时决定因素重新回到优劣。',
        'Often mistaken for enough attempts eventually working. It holds while attempts are roughly independent and the environment is unsaturated; once the positions are filled, more arrivals are simply turned away and merit becomes the deciding factor again.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/drift-fixation',
    depth: {
      origin: bi(
        '1931 年由 Sewall Wright 给出漂变的数学，1968 年由木村资生提出中性理论：分子层面的多数变异不是被选择固定的，而是被随机取样固定的。此后与选择主义的争论持续了三十年。',
        'Wright gave the mathematics of drift in 1931 and Kimura proposed the neutral theory in 1968 — that most molecular variation is fixed by sampling rather than by selection — beginning a dispute with selectionism that ran for thirty years.',
      ),
      minimalForm: 'N_e · s ≪ 1 时漂变主导；固定概率 ≈ 初始频率',
      canonicalSubstrates: [
        sub('分子演化', 'Molecular evolution', '群体遗传学', 'Population genetics', 0,
          '有效群体大小与选择系数的乘积决定谁说了算，乘积远小于一时优势不起作用',
          'the product of effective population size and selection coefficient deciding which force wins, with advantage irrelevant when it is far below one',
          '有效群体大小往往远小于实际个体数，且随历史瓶颈变化——它是这条结构里最难估准、也最决定结论的量。',
          'Effective population size is usually far below the head count and moves with historical bottlenecks, making it the hardest quantity to estimate and the one that most decides the conclusion.'),
        sub('小市场里的标准', 'Standards in a small market', '技术经济学', 'Economics of technology', 2,
          '早期用户很少时，哪个方案胜出主要看谁先被几个关键买家选中',
          'with few early users, which option wins turns mainly on who a handful of key buyers happened to pick',
          '这里的"随机"其实是少数人的判断，可被游说与营销影响——形式上像漂变，机制上不是无偏取样。',
          'The randomness here is a few people\'s judgement and can be lobbied and marketed, so it looks like drift in form while not being unbiased sampling in mechanism.'),
        sub('小社群的规范', 'Norms in a small community', '文化演化', 'Cultural evolution', 1,
          '几十人的社群里，一个说法能否变成惯例主要靠偶然而非它有多好用',
          'in a community of dozens, whether a usage becomes convention turns mostly on chance rather than on how well it works',
          '文化传播有偏向（威望偏向、从众偏向），不是无偏取样——这些偏向本身就是选择，所以纯漂变模型在这里通常是零假设而不是结论。',
          'Cultural transmission is biased by prestige and conformity rather than being unbiased sampling, and those biases are themselves selection, which makes pure drift a null hypothesis here rather than a conclusion.'),
      ],
      relations: [
        rel('replicator-dynamics', 'competes-with',
          '面对同一次固定，要么是选择做的，要么是取样做的——这不是互补的两种读法，是两个互斥的解释，而二十世纪中叶整个群体遗传学就是在打这一仗。判据是 N_e·s 而不是结局本身。',
          'For any one fixation either selection did it or sampling did — not two complementary readings but two exclusive explanations, and the fight over which was mid-century population genetics. The test is N_e·s rather than the outcome itself.'),
        rel('minimum-viable-size', 'explains',
          '它解释了最小可行规模为什么不只是"部件不够"：低于某个有效规模，随机性压过一切优势，于是一个原理上可行的单位在实践上仍然会随机消亡。',
          'It explains why a minimum viable size is not only about missing parts: below an effective size, randomness swamps every advantage, so a unit viable in principle still dies at random in practice.'),
      ],
      mistakenFor: bi(
        '常被误当成"随机很重要"这句空话。它的内容是一个可算的判据：有效群体大小乘以选择系数。乘积远大于一时选择主导、远小于一时漂变主导，所以"这是漂变造成的"是一个可被证伪的断言，而不是一个免责声明。',
        'Often reduced to randomness mattering, which says nothing. Its content is a computable test: effective population size times the selection coefficient. Far above one and selection dominates, far below and drift does — which makes attributing something to drift a falsifiable claim rather than a disclaimer.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/network-externality-lockin',
    depth: {
      origin: bi(
        '1985 年由 Katz 与 Shapiro 形式化为网络外部性，同年 Farrell 与 Saloner 给出"超额惯性"：即使所有人都想换，也可能因为无法协调而集体不换。',
        'Formalised as network externalities by Katz and Shapiro in 1985, with Farrell and Saloner giving excess inertia the same year: everyone may prefer to switch and collectively fail to, for want of coordination.',
      ),
      minimalForm: 'V(用户数) 递增 + 转换成本 ⇒ 领先者被自己的用户群锁定在位',
      canonicalSubstrates: [
        sub('通讯平台', 'Communication platforms', '平台经济学', 'Platform economics', 0,
          '一个人留在某个平台上的理由，几乎完全是别人也在那里',
          'the reason anyone stays on a platform being almost entirely that others are there',
          '互操作性会直接消解这条结构：一旦跨平台通讯可行，用户数就不再是留下的理由——所以这里的锁定是监管可改变的量。',
          'Interoperability dissolves the structure outright: once cross-platform messaging works, headcount stops being a reason to stay, which makes this lock-in a quantity regulation can change.'),
        sub('文件格式与标准', 'File formats and standards', '信息技术', 'Information technology', 1,
          '已有文档与工具链构成的转换成本，往往比格式本身的优劣重要得多',
          'the switching cost of existing documents and toolchains mattering far more than the format\'s own merits',
          '开放规范让第三方实现成为可能，从而把转换成本从"重做全部"降到"换一个读写器"——这条结构的强弱由规范是否开放决定。',
          'An open specification lets third parties implement, cutting the switching cost from redoing everything to swapping a reader, so how strong this lock-in is depends on whether the specification is open.'),
        sub('自然语言', 'Natural language', '语言学', 'Linguistics', 2,
          '学哪门语言的收益取决于有多少人说它，个人无法单方面改变',
          'what a language is worth to learn depending on how many speak it, which no individual can change alone',
          '人可以同时掌握多门语言（可多归属），所以语言的锁定比平台弱得多——多归属性是这条结构里最被忽视的量。',
          'People can hold several languages at once, so lock-in is far weaker here than for platforms: multi-homing is the most overlooked quantity in this structure.'),
      ],
      relations: [
        rel('path-dependence', 'generates',
          '网络外部性是产生路径依赖的一条具体机制：价值随用户数递增就是那个正反馈，而转换成本就是锁定时点之后改不回去的原因。',
          'Network externality is one concrete mechanism producing path dependence: value rising with headcount is the positive feedback and switching cost is why it cannot be undone past the lock-in point.'),
        rel('nash-equilibrium', 'emerges-from',
          '停在次优标准上是一个均衡而不是一次失误：在别人不动时，任何单个用户切换都会变差，所以"大家都想换却都不换"完全符合各自最优。',
          'Sitting on a worse standard is an equilibrium rather than a mistake: while others stand still any single user is worse off switching, so everyone preferring to move and nobody moving is exactly mutual best response.'),
      ],
      mistakenFor: bi(
        '常被误当成"规模优势"。规模优势说的是成本随产量下降，网络外部性说的是价值随用户数上升——前者可被更高效的对手打败，后者不行，因为对手要面对的不是你的成本而是你的用户群。',
        'Often mistaken for economies of scale. Scale is cost falling with output; network externality is value rising with users. A more efficient rival can beat the first and not the second, because what a rival faces there is not your cost but your user base.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/cohort-inertia',
    depth: {
      origin: bi(
        '源自人口学的"人口惯性"：即使生育率立刻降到更替水平，人口仍会因年龄结构继续增长数十年。这个观察后来被搬到一切由长寿命单位构成的存量上。',
        'From demographic momentum: even if fertility fell to replacement today, population keeps growing for decades because of the age structure. The observation later moved to any stock made of long-lived units.',
      ),
      minimalForm: '输入改变后，输出按单位寿命的时标滞后响应',
      canonicalSubstrates: [
        sub('人口结构', 'Population age structure', '人口学', 'Demography', 1,
          '育龄人口的规模由二十年前的出生数决定，今天的政策改不了它',
          'the size of the childbearing cohort fixed by births twenty years ago, which today\'s policy cannot alter',
          '迁移可以在短期内改变年龄结构，是这条结构在人口上唯一的快速通道——只看生育率会严重高估惯性。',
          'Migration can change the age structure quickly and is the one fast channel here, so looking only at fertility badly overstates the inertia.'),
        sub('资本存量', 'Capital stock', '宏观经济学', 'Macroeconomics', 0,
          '发电厂与厂房的寿命决定了一次技术转型最快能有多快',
          'the lifetime of power plants and factories setting the fastest a technological transition can go',
          '提前退役是可行的，只是要付账面损失——所以这里的惯性是经济成本而非物理约束，补贴可以直接改变它。',
          'Early retirement is possible at the cost of a write-off, so the inertia is economic rather than physical and a subsidy changes it directly.'),
        sub('森林更新', 'Forest turnover', '林学', 'Forestry', 2,
          '树木寿命决定林分组成对气候变化的响应要滞后多久',
          'tree lifespan setting how long a stand\'s composition lags a change in climate',
          '干扰事件（火、风倒、虫害）会一次性重置存量，所以这里的惯性会被打断而不是平滑衰减。',
          'Disturbance — fire, windthrow, insects — resets the stock at a stroke, so the inertia here is interrupted rather than smoothly decaying.'),
        sub('学术传统', 'Academic traditions', '科学社会学', 'Sociology of science', 0,
          '一个领域的方法论由在任者的训练决定，而在任者的职业生涯是三四十年',
          'a field\'s methodology set by the training of its incumbents, whose careers run three or four decades',
          '这里的"单位寿命"是职业生涯而非生命，且可以通过招聘与资助结构主动缩短——普朗克那句"科学在葬礼中前进"低估了这一点。',
          'The unit lifetime here is a career rather than a life and can be shortened deliberately through hiring and funding, which Planck\'s line about science advancing one funeral at a time understates.'),
      ],
      relations: [
        rel('delay-induced-oscillation', 'generates',
          '存量周转本身就是一段时滞：政策今天生效、结果一代人之后才到，而带着这么长的延迟去做反馈控制，稳态就会被换成振荡——猪周期与教育扩招都是这个形状。',
          'Stock turnover is itself a lag: a policy takes effect today and the result arrives a generation later, and running feedback control with a delay that long replaces a steady state with oscillation, which is the shape of both hog cycles and university expansion.'),
        rel('deep-time-accumulation', 'emerges-from',
          '在观察窗远长于单位寿命时惯性消失，远短于时惯性主导——所以这条结构是深时累积的另一面：同一个速率，换一个时标就换一个结论。',
          'Where the observation window far exceeds the unit lifetime the inertia vanishes and where it falls far short the inertia dominates, which makes this the other face of deep-time accumulation: one rate, and a different timescale gives a different conclusion.'),
      ],
      mistakenFor: bi(
        '常被误当成"变革需要时间"。它给出的是一个可算的时标——单位寿命与替换速率——所以"多久"是可以估的，而不是一句托词。把它当托词用，恰恰会跳过唯一能加速的那件事：提高替换速率。',
        'Often mistaken for change taking time. It supplies a computable timescale — the unit lifetime and the replacement rate — so how long is estimable rather than an excuse. Used as an excuse it skips the one thing that actually accelerates it, which is raising the replacement rate.',
      ),
    },
  },
];
