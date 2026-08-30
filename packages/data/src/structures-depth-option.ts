import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the option-and-reachability family.
 *
 * All eight answer one question: when is it worth paying a definite cost now
 * to buy an indefinite later — either a future option, or a capability that
 * was simply out of reach?
 *
 * Four of them buy insurance against a future that has not arrived. A seed
 * bank pays a standing holding cost for variants that return nothing now. The
 * explore-exploit split is that purchase made continuously, because one finite
 * resource cannot both try new things and live off what works. Inoculation
 * buys a small failure at a moment when failing is cheap. Rotation gives up
 * the best agent available today to postpone the day it stops working.
 *
 * The other four buy reachability — they make possible something that was not.
 * Shifting a check upstream catches an error at the moment it is made. Waste
 * as feedstock redefines an output as an input, on the ground that waste is a
 * property of the current set of uses rather than of the material. The
 * intermediate rung is a cheap thing that is not the goal, built because two
 * mature tiers are separated by a gap in reachability. Ex-vivo reconstitution
 * lifts a subsystem out of its host and rebuilds it under control, betting
 * that its function did not depend on something the host supplied and nobody
 * ever wrote down.
 *
 * THE OPPOSITION WORTH FILING. `shift-left` and `controlled-inoculation` both
 * claim to reduce later damage, and they prescribe opposite treatment of the
 * failure itself: one moves the check as early as it will go so the failure
 * never happens, the other buys a failure on purpose. What separates them is
 * whether the failure mode can be specified in advance. Shifting left needs
 * something to check against, so it reaches only the modes that can already be
 * named; inoculation exists for the modes that cannot be specified, which is
 * why more checking never substitutes for it. A system that runs only the
 * first is hard against every failure it has already met and brittle against
 * its first unfamiliar one — and it reads as well engineered right up to that
 * point, because everything it does check, it checks early.
 *
 * A SECOND AND WEAKER ONE. Holding unused variants IS exploration whose payoff
 * is deferred indefinitely, so `dormant-seed-bank` is what the explore-exploit
 * split looks like when environmental change is rare and large rather than
 * frequent and small. That reframing earns its place mainly by saying when a
 * bank is the wrong instrument: where change is frequent and small, the same
 * budget buys more as continuous trial than as held inventory.
 *
 * All eight already declare quantities, so every patch here carries depth
 * only. Same terms as the earlier families: textbook material, no island
 * referenced, no mapping or coverage touched.
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

export const OPTION_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/dormant-seed-bank',
    depth: {
      origin: bi(
        '由植物生态学在 1960 年代给出定量形式：Cohen 1966 证明随机环境下最优萌发比例等于好年份的概率，于是休眠不是谨慎而是一个算得出来的份额。斯瓦尔巴全球种子库 2008 年启用，首次提取发生在 2015 年，取用者是被战争赶出阿勒颇的 ICARDA。',
        'Given quantitative form by plant ecology in the 1960s: Cohen showed in 1966 that in a randomly varying environment the optimal germinating fraction equals the probability of a good year, which makes dormancy a computed share rather than caution. The Svalbard vault opened in 2008 and its first withdrawal came in 2015, by the crop institute that the war had driven out of Aleppo.',
      ),
      minimalForm: 'Cohen 1966：随机环境下最优萌发比例 G* = 好年份概率 p（几何平均适合度判据）',
      canonicalSubstrates: [
        sub('土壤种子库', 'The soil seed bank', '植物生态学', 'Plant ecology', 0,
          '土壤里同时存着若干年份、若干基因型的种子，仍然可选的未来就是这批种子的多样度',
          'the soil holds seeds from many years and many genotypes at once, and the futures still available are the variety in that store',
          '没有人挑选存什么：库的组成是过去的选择加上不均等腐烂的产物，硬种皮的物种被系统性高估，所以它是一份有偏的残留而不是一份样本。',
          'Nobody chooses what is kept: the composition is past selection plus unequal decay, over-representing hard-coated species, so it is a biased remainder rather than a sample.'),
        sub('作物种质资源库', 'Crop germplasm collections', '作物科学', 'Crop science', 1,
          '主要成本不是冷库而是周期性繁殖更新——每份材料的活力降到阈值就必须种出来一次',
          'the dominant cost is not the freezer but periodic regeneration: each accession must be grown out once its viability falls to a threshold',
          '成本以块状而非连续的方式到来，而更新本身在材料内部造成漂变——存了三十年再取出来的，已经不完全是当年存进去的那一份。',
          'The bill arrives in lumps rather than continuously, and regeneration itself causes drift inside the accession, so what comes out after thirty years is not quite what went in.'),
        sub('细菌持留菌', 'Bacterial persisters', '微生物学', 'Microbiology', 2,
          '一小部分细胞停止生长因而不被抗生素杀死，撤药后能否恢复生长就是唤醒可行性本身',
          'a small fraction of cells stop growing and so escape the antibiotic, and whether they resume once it is withdrawn is revivability itself',
          '这里没有持有者：休眠比例由演化调出来的切换率决定，成本以放弃的增长而非预算科目的形式付出，因此没有人能把这一项砍掉。',
          'There is no holder here: the dormant fraction is set by a switching rate evolution tuned, and the cost is paid as forgone growth rather than as a budget line, so there is nothing for anyone to cut.'),
      ],
      relations: [
        rel('explore-exploit-tension', 'special-case-of',
          '持有一批当前不用的变体本身就是探索，只是回报被推迟到环境翻转的那一刻；种子库因此是这条分配在"变化稀少而剧烈"那一端的样子。这也给出了它什么时候是错的工具：变化频繁而微小时，同一笔钱买连续试错比买库存值。',
          'Holding variants nobody uses is exploration whose payoff waits for the environment to turn, so a seed bank is what that split looks like at the rare-and-large end of change. That also says when it is the wrong instrument: where change is frequent and small, the same budget buys more as continuous trial than as inventory.'),
        rel('robustness-efficiency-tradeoff', 'emerges-from',
          '它是这条对立在"鲁棒性必须被存起来而不是跑在系统里"时的形态：成本每年出现在账上，收益只出现一次并且表现为一件没有发生的坏事。两边不可比，所以砍掉它的理由永远是现成的。',
          'It is what that tradeoff becomes when robustness has to be stored rather than run: the cost lands on the books every year and the benefit lands once, in the form of something that did not happen. The two are not commensurable, which is why the argument for cutting is always available.'),
      ],
      mistakenFor: bi(
        '常被当成备份。备份要求能还原到同一个状态，种子库不要求——它保存的是变体之间的差异，而不是当前状态的副本，所以判据是多样度与可唤醒性而非完整性。一个问题就能分开：如果库里的东西全都一样，还有没有价值？备份答有，种子库答没有。',
        'Routinely mistaken for a backup. A backup has to restore one state; a bank does not, because what it keeps is the difference between variants rather than a copy of the present, so it is judged on variety and revivability instead of completeness. One question separates them: if everything in the store were identical, would it still be worth keeping? A backup says yes and a bank says no.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/explore-exploit-tension',
    depth: {
      origin: bi(
        '1933 年 Thompson 为临床分配写下第一条抽样规则，被忽略了六十年；1952 年 Robbins 以双臂老虎机把它立为序贯设计问题——Whittle 说战时它难到有人提议把它空投给德国，好拖垮对方的数学家。真正的意外来自 1979 年的 Gittins：折现且各臂独立时，这个看起来不可分解的分配问题退化成逐臂算一个数取最大。',
        'Thompson wrote the first sampling rule in 1933 for allocating patients and was ignored for sixty years; Robbins made it the two-armed bandit in 1952, a problem Whittle said had been so intractable in wartime that someone proposed dropping it over Germany to sabotage their mathematicians. The surprise came from Gittins in 1979: with discounting and independent arms, an allocation that looks irreducibly coupled collapses into one index computed per arm.',
      ),
      minimalForm: 'Gittins 指数：折现 + 臂间独立 + 状态只在被拉时改变 ⇒ 逐臂算一个数取最大即最优；UCB 侧的 Θ(log T) 遗憾界说明探索成本不可能低于对数增长',
      canonicalSubstrates: [
        sub('多臂老虎机', 'The multi-armed bandit', '机器学习', 'Machine learning', 1,
          '指数完全由后验不确定性驱动：两臂均值相同时，更不确定的那一臂更值得拉',
          'the index is driven entirely by posterior uncertainty, so between two arms of equal mean the more uncertain one is worth pulling',
          '这里假设拉动不改变臂本身、臂与臂之间也不相关；一旦相关，信息会在臂之间流动，逐臂算一个数就不再最优——最优性对这条假设极其脆弱。',
          'It assumes pulling does not change the arm and that arms are unrelated; once they correlate, information flows between them and a per-arm index stops being optimal. The optimality is unusually fragile to that one assumption.'),
        sub('蜜蜂的侦察者比例', 'The scout fraction in a bee colony', '行为生态学', 'Behavioural ecology', 0,
          '蜂群中做侦察而非采已知蜜源的个体占比随蜜源丰度上下移动，这就是被实际分配出去的探索份额',
          'the share of foragers scouting rather than working known sources shifts with how rich those sources are, and that is the exploration share actually allocated',
          '份额不由任何个体设定，它从招募舞蹈的正反馈里涌现出来；因此这里没有可以直接拧的旋钮，只能改变招募增益去间接推动它。',
          'No individual sets the share; it emerges from the positive feedback of recruitment dancing. There is no dial to turn here, only the recruitment gain to change and let the share move.'),
        sub('自适应临床试验', 'Adaptive clinical trials', '临床医学', 'Clinical medicine', 2,
          '视野是入组期加随访期；视野越短最优探索份额越低，这正是响应适应性随机化被质疑的地方',
          'the horizon is enrolment plus follow-up, and a short one drives the optimal share down, which is where response-adaptive randomisation draws its criticism',
          '探索的代价由当下被分到较差一组的患者承担，收益归未来的患者；因此这里的最优份额不是一个纯统计量，伦理约束会把它钉在统计解之外。',
          'The cost of exploring is borne by the patients assigned to the worse arm now and the benefit accrues to future ones, so the optimum is not a purely statistical quantity: ethics pins it away from the statistical answer.'),
        sub('科研资助组合', 'A research funding portfolio', '科技政策', 'Research policy', 1,
          '投给未验证方向的比例本应由回报不确定性决定，而这恰恰是基础研究里最无法事前估计的量',
          'the share going to unproven directions should be set by uncertainty about payoff, which is precisely the quantity basic research cannot estimate in advance',
          '老虎机需要的核心输入在这里原则上不可得，机构只能用固定配额代替估计——于是这条策略无法用回报数据校准，只能用它产出的意外次数事后评价。',
          'The bandit\'s central input is unavailable in principle, so institutions substitute a fixed quota for an estimate. The policy cannot then be calibrated against payoff data, only judged afterwards by how often it produced something unforeseen.'),
      ],
      relations: [
        rel('resistance-rotation', 'generates',
          '当拉动会损耗臂本身时，这条对立生出的最优策略不再是收敛到最好那一台，而是在几台之间循环：抗性轮换就是衰减型老虎机的解，恢复速度直接给出周期长度。',
          'When pulling an arm degrades it, the policy this tension implies stops being convergence on the best arm and becomes rotation among several. Resistance rotation is the solution to a decaying bandit, and the recovery rate is what sets the period.'),
        rel('no-free-lunch', 'emerges-from',
          '它是"必须先假设世界"这条限制在信息与回报之间做选择时的样子：最优探索份额由回报的先验决定，而先验拿不到免费的。任何固定的探索时间表都在某一类环境上最优、在另一类上很差。',
          'It is what the requirement to assume something first looks like when the choice is between information and reward: the optimal share is fixed by the prior over payoffs, and the prior does not come free. Any fixed exploration schedule is optimal for one family of environments and poor for another.'),
        rel('controlled-inoculation', 'generates',
          '当探索的代价可以由自己设定时，这条对立生出的具体动作就是接种：剂量看起来是一笔自选的探索预算。但安全上界通常只有事后才知道，所以它属于"成本看似有界、实则未知"的那一类探索——把剂量当成可控支出，正是这条方法最常见的误用。',
          'Where the cost of exploring can be set by the explorer, the action this tension implies is an inoculation: the dose looks like a self-chosen exploration budget. The safe ceiling, though, is generally known only afterwards, so this is the class of exploration whose cost appears bounded and is not, and treating the dose as controlled spending is the commonest misuse of the method.'),
        rel('injected-randomness', 'generates',
          'ε-贪心把探索交给随机数，不是因为随机探索得好，而是因为随机化让收集到的数据仍可用于无偏的离策略估计。一旦逐臂的不确定性可测，随机探索就被严格支配，它剩下的价值全在可估计性上。',
          'Handing exploration to a random number is not done because random exploration is good, but because randomisation keeps the collected data usable for unbiased off-policy estimation. Once per-arm uncertainty can be measured, random exploration is strictly dominated and what remains of its value is estimability.'),
      ],
      mistakenFor: bi(
        '常被当成风险偏好。探索不是更爱冒险，而是为信息付费：一个风险中性甚至风险厌恶的主体，在均值未知时仍然应该探索。判别很干净——保持回报的方差不变，只减少对均值的无知，风险偏好者的行为不变，而最优探索份额下降。',
        'Routinely mistaken for appetite for risk. Exploring is not a taste for variance but paying for information: an agent that is risk-neutral or even risk-averse should still explore while the mean is unknown. The test is clean — hold the variance of the payoff fixed and reduce only the ignorance about its mean; a risk preference is unmoved, while the optimal exploration share falls.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/controlled-inoculation',
    depth: {
      origin: bi(
        '人痘接种在中国、印度与奥斯曼世界早已实行，1721 年经蒙塔古夫人传入英国，1796 年被 Jenner 的牛痘取代。这段历史本身就是这条方法的风险清单：人痘有效，却仍以百分之一二的致死率杀人、并能引燃疫情，此后两百年做的都是压低剂量自身的风险而保住响应。',
        'Variolation was practised in China, India and the Ottoman world long before Lady Mary Wortley Montagu brought it to Britain in 1721, and Jenner\'s cowpox displaced it in 1796. That history is the method\'s own risk register: it worked, and it still killed one or two in a hundred and could seed an outbreak, so the two centuries since went into lowering the risk of the dose while keeping the response.',
      ),
      canonicalSubstrates: [
        sub('减毒活疫苗', 'Live attenuated vaccines', '免疫学', 'Immunology', 0,
          '减毒株保留抗原而失去毒力，于是剂量的两个约束被拆到同一株病原体的两个性质上',
          'attenuation keeps the antigen and drops the virulence, splitting the two constraints on the dose across two properties of one organism',
          '只有这里"习得的响应"有可测的物质载体：记忆细胞与抗体滴度让下一次的收益可以事前读出来，其他基底得等真正的扰动到了才知道演练留下了什么。',
          'Only here does the acquired response have a measurable physical carrier: memory cells and antibody titres let the next payoff be read in advance, where other substrates must wait for the real disturbance to learn what the rehearsal left behind.'),
        sub('计划烧除', 'Prescribed burning', '火生态学', 'Fire ecology', 2,
          '留下的不是学会的东西而是被消耗掉的地表可燃物，收益直接写在燃料载荷上',
          'what it leaves is not something learned but fuel that is gone, and the payoff is written directly in the fuel load',
          '这里的响应随时间单调衰减、必须反复施加：可燃物会长回来，而免疫记忆不会自行消失。把"接种一次"的直觉搬过来，正是百年防火抑制之后大火的来源。',
          'The response here decays monotonically and has to be reapplied, because fuel grows back where immune memory does not fade on its own. Carrying over the intuition that one dose suffices is exactly what a century of fire suppression did.'),
        sub('混沌工程', 'Chaos engineering', '软件工程', 'Software engineering', 1,
          '恢复窗口不是系统自愈所需的时间，而是人发现、定位并改掉它所需要的时间',
          'the recovery window is not what the system needs to heal but what people need to notice, locate and fix it',
          '恢复由组织而非系统完成，所以两次施加的间隔下界是排期而不是生理；把演练挪到夜间会让同样的剂量落在响应能力最差的时刻，剂量没变而风险变了。',
          'Recovery is done by the organisation rather than the system, so the floor on the interval is a staffing schedule and not a physiology. Moving the drill to the night lands the same dose at the hour when the capacity to respond is lowest: the dose is unchanged and the risk is not.'),
      ],
      relations: [
        rel('shift-left', 'competes-with',
          '两者都声称降低后续损失，处方却相反：一个把检查尽量前移让失败不发生，一个花钱买一次失败。判别在于失败模式能不能事先写出来——前置化需要一个可比对的规约，只覆盖已经能被命名的模式；接种针对的正是写不出来的那些，所以再多检查也替代不了它。只做前一半的系统，对见过的失败很硬，对第一次遇到的失败很脆。',
          'Both claim to cut later damage while prescribing opposite treatment of the failure: one moves the check as far upstream as it will go so it never happens, the other pays for one on purpose. What separates them is whether the failure mode can be written down beforehand. Shifting left needs something to check against and so reaches only the modes already nameable; inoculation exists for the modes that cannot be specified, which is why no amount of checking replaces it. A system doing only the first is hard against failures it has met and brittle against its first unfamiliar one.'),
        rel('perturb-and-read', 'special-case-of',
          '两者都主动施加扰动，区别在于读什么：扰动-响应留下读数去推机制，接种把读数丢掉、留下系统被改变后的状态。它是同一个动作在"不想知道机制、只要那个改变"这一设定下的特例，这也解释了为什么它在机制完全未知时仍然奏效。',
          'Both apply a deliberate perturbation and differ in what is kept: one keeps the reading in order to infer a mechanism, the other discards it and keeps the changed state. It is the same act with the measurement dropped, which is also why it can work while the mechanism stays unknown.'),
        rel('tolerance-evolution', 'generates',
          '反复的亚致死剂量会选出耐受。对象是自己的系统时这就是要的结果，对象是一个会演化的对手时，同一过程就是抗性的来源——方法的收益与抗性问题是同一件事的两面，所以风险不能靠"再小一点"无限压低。',
          'Repeated sublethal doses select for tolerance. Where the target is your own system that is the intended result; where it is an opponent that evolves, the same process is where resistance comes from. The benefit and the resistance problem are one process read from two sides, which is why the risk cannot be driven down indefinitely by simply lowering the dose.'),
      ],
      mistakenFor: bi(
        '常被当成测试或演练的同义词。测试是拿一个已知的失败模式去问系统会不会挂，接种是让系统真的挂一次并保留由此产生的改变。看事后就能分开：测试通过后系统没有任何变化，它只是被读了一次；接种即使顺利，系统也必须被改动过——抗体、剧本、被烧掉的可燃物——没有留下改变的接种等于没做。',
        'Routinely taken as a synonym for testing or for a drill. A test takes a known failure mode and asks whether the system holds; an inoculation makes it actually fail once and keeps whatever change that produces. Look at the aftermath: a passed test leaves the system unchanged, because it was only read. An inoculation that went well still has to leave something behind — antibodies, a revised runbook, fuel that is gone — and one that leaves nothing did not happen.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/resistance-rotation',
    depth: {
      origin: bi(
        '在两条线上同时成形：结核病在 1950 年代初用链霉素单药治疗，几个月内失效，逼出联合用药；杀虫剂一侧，1984 年成立的抗性行动委员会把"按作用机制分组"变成一张编号表。意外的一半是后来的结论——理论与 ICU 试验反复发现轮换劣于混用，因为任一时刻轮换仍然只施加单一选择压力，只是这压力在移动。',
        'It took shape along two lines at once: streptomycin alone failed against tuberculosis within months in the early 1950s and forced combination therapy, while on the insecticide side the resistance action committee founded in 1984 turned grouping by mode of action into a numbered table. The unexpected half is the later verdict — theory and ICU trials repeatedly found cycling inferior to mixing, because at any one moment a rotation still applies a single selection pressure, merely a moving one.',
      ),
      minimalForm: '同时逃脱 k 个独立机制的概率 ≈ N·∏ᵢ μᵢ，随机制数指数下降——这条乘积就是组合优于轮换的算式',
      canonicalSubstrates: [
        sub('结核与 HIV 的联合疗法', 'Combination therapy for tuberculosis and HIV', '传染病学', 'Infectious disease', 0,
          '三种药必须靶向不同通路，交叉抗性会让名义上的三药实际上只是一药',
          'the three agents must hit different pathways, since cross-resistance turns a nominal three-drug regimen into one drug',
          '这个基底里根本不存在轮换选项：单药必然失败已被证据钉死，所以它只演示了结构的组合那一半，轮换那一半从未被允许试。',
          'There is no rotation option in this substrate at all: monotherapy failing is settled evidence, so it demonstrates only the combining half of the structure and the rotating half was never allowed a trial.'),
        sub('杀虫剂抗性管理', 'Insecticide resistance management', '农业昆虫学', 'Agricultural entomology', 2,
          '规则以世代为单位写成：一个世代之内只使用一个作用机制组',
          'the rule is written per generation — within one pest generation, only one mode-of-action group is used',
          '周期按害虫世代而非日历计，而世代长度随温度变化：同一张轮换表在不同气候带对应完全不同的选择压力，照抄表格等于没有轮换。',
          'The period counts pest generations rather than dates, and generation length moves with temperature, so one rotation table means quite different selection pressures in different climates and copying the table can amount to no rotation at all.'),
        sub('除草剂抗性', 'Herbicide resistance', '杂草科学', 'Weed science', 1,
          '撤压之后抗性个体是否衰退决定轮换有没有效，而某些靶点的抗性适合度代价接近于零',
          'whether resistant plants decline once the pressure lifts is what decides the method, and for some targets the fitness cost of resistance is close to zero',
          '土壤种子库把撤压后的衰退推迟了很多年：上一轮的抗性种子还躺在地里，所以这里的周期必须长于种子库的半衰期，而不是长于一个世代。',
          'The soil seed bank defers that decline by years, because the resistant seeds of the previous cycle are still lying in the field: the period here has to exceed the half-life of the bank rather than the length of a generation.'),
      ],
      relations: [
        rel('dormant-seed-bank', 'generates',
          '在有种子库的对手身上，每一轮撤压都把这一代的幸存者存进土里——轮换本身在替对手建库。于是"撤压等待衰退"失效的方式不是抗性没有代价，而是承担代价的个体根本没有在生长。',
          'Against an opponent with a seed bank, every cycle deposits this generation of survivors into storage: the rotation builds the bank on the other side. The premise then fails in a specific way — not because resistance is free, but because the individuals carrying it are not growing and so are not paying.'),
        rel('drift-fixation', 'competes-with',
          '同一个观察是"撤压之后抗性没有回落"，两种解释：抗性没有适合度代价，或者代价存在但种群经过瓶颈、漂变把它固定了。判别是 s 与 1/Ne 的比较——无药条件下测适合度差，再估有效种群大小，哪个大就是哪种机制。',
          'One observation, resistance that did not fall back after the pressure lifted, has two accounts: it carries no fitness cost, or it carries one but the population passed through a bottleneck and drift fixed it regardless. The discriminator is s against 1/Ne — measure the fitness difference without the agent, estimate the effective population size, and whichever is larger names the mechanism.'),
        rel('commons-congestion', 'emerges-from',
          '敏感性是共用资源：每一次使用都消耗别人也在支取的那点剩余效力。轮换因此是一条公共池管理规则，并按公共池的方式失败——轮换单元必须大于对手的扩散范围，否则邻居把抗性个体送回来，规则在自己的地块上成立、在真正的种群上不成立。',
          'Susceptibility is a shared resource: every use consumes the remaining efficacy everyone else is drawing on. Rotation is therefore a common-pool rule and fails in the common-pool way — the rotating unit must be larger than the opponent\'s dispersal range, or neighbours import resistant individuals and the rule holds on your own plot while failing on the population that matters.'),
      ],
      mistakenFor: bi(
        '常被当成组合的省钱版本。二者不是同一个旋钮的两档：轮换在任一时刻仍然只施加一种压力，只是压力在移动；组合要求同一个体同时逃脱多个机制，而这些概率是相乘的。一个问题就能分开——抗性必须同时出现，还是先后出现就够？先后要容易得多，这正是临床上轮换从未取代联合用药的原因。',
        'Routinely read as the cheaper setting on the same dial as combination. They are not two settings: a rotation still applies one pressure at a time, merely a moving one, while a combination requires one individual to escape several mechanisms at once, and those probabilities multiply. One question separates them — must the resistances appear together, or is one after another enough? One after another is far easier, which is why rotation never displaced combination therapy in the clinic.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/shift-left',
    depth: {
      origin: bi(
        '结构比名字早得多：丰田的自働化与停线规则，以及新乡重夫 1960 年代的源流检查——事后检查只能分拣，源头检查才能防止；名字来自 2001 年的软件测试。不那么显然的是量：Boehm 1981 的数据给出被反复引用的每阶段一个数量级，他 2001 年自己的数据在小项目上却只有约五比一——决定值不值的是一条测出来的斜率，不是定律。',
        'The structure long predates the name: Toyota\'s jidoka with its stop-the-line rule, and Shingo\'s source inspection in the 1960s, which held that checking after the fact can only sort while checking at the source prevents. The name comes from software testing in 2001. The unobvious part is quantitative: Boehm\'s 1981 data gave the much-quoted order of magnitude per phase, and his own 2001 data put it nearer five to one on small projects, so what decides is a measured slope and not a law.',
      ),
      minimalForm: '前置的收益 = 返工成本对发现延迟的梯度 × 被消除的延迟；梯度是量出来的，不是常数',
      canonicalSubstrates: [
        sub('源流检查与自働化', 'Source inspection and jidoka', '生产工程', 'Manufacturing engineering', 0,
          '作业者按下停线按钮，把发现延迟压到一个节拍以内',
          'the operator stops the line and detection latency collapses to a single takt',
          '这里前置的代价是显式可结算的：停线的机会成本按分钟算得出来，所以值不值在这个基底里是个会计问题；多数软件与设计场景没有这样一个可以对账的量。',
          'The price of moving upstream is explicit and settleable here: the opportunity cost of a stopped line is computable per minute, so whether it pays is an accounting question. Most software and design settings have no comparable figure to reconcile against.'),
        sub('类型系统与编辑器内检查', 'Type systems and in-editor checks', '软件工程', 'Software engineering', 1,
          '同一个错误在编辑期、构建期与生产环境上的返工成本相差几个数量级，这个梯度就是全部收益的来源',
          'the same defect costs orders of magnitude more to undo in production than in the editor, and that gradient is where the entire return comes from',
          '能被前置的只有可以被规约表达的错误：类型检查抓不到意图错误，所以天花板是原则性的而不只是成本上的——把它推到极致，剩下的错误恰好是最贵的那一类。',
          'Only defects a specification can express are movable: type checking does not catch a wrong intention, so the ceiling is one of principle rather than of cost. Push the technique to its limit and the defects left over are precisely the expensive kind.'),
        sub('早期成药性筛查', 'Early developability screening', '药物化学', 'Medicinal chemistry', 2,
          '溶解度与代谢稳定性在苗头化合物阶段就筛，用的是体外代理指标',
          'solubility and metabolic stability are screened at the hit stage, using in-vitro proxies',
          '真正的下游信息（人体药代）在此刻原则上不可得，所以这里前置换来的是用代理换延迟：代理与真值的相关度决定这是净收益，还是提前杀掉了本来会成的分子。',
          'The downstream information that matters, behaviour in a human body, is unavailable in principle at that point, so what the move buys is a proxy in place of a delay. The correlation between proxy and truth decides whether it is a net gain or an early kill of molecules that would have worked.'),
      ],
      relations: [
        rel('verification-asymmetry', 'emerges-from',
          '前置只在检查比生产便宜时才划算：收益是返工梯度与验证优势的乘积。在验证与做本身一样贵的环节，把检查移到信息最少的地方只是把工作量翻倍，梯度再陡也救不回来。',
          'Moving a check upstream pays only where checking costs less than producing: the return is the rework gradient times the verification advantage. Where verifying costs what doing costs, an upstream check merely doubles the work at the point where information is scarcest, and no gradient is steep enough to recover it.'),
        rel('negative-feedback-control', 'special-case-of',
          '它真正做的事是把一次批量检查换成一个闭环，被最小化的是回路延迟。所以判据不是检查发生在日程的哪一格，而是回路是否闭合：一个前移了但仍然每周出报告的检查是开环加长延迟，梯度一点没变。',
          'What it actually does is replace a batch check with a closed loop, and the quantity minimised is loop delay. The test is therefore not where the check sits in the calendar but whether the loop closes: a check that moved upstream and still issues a weekly report is an open loop with a long lag, and the gradient is untouched.'),
        rel('two-error-tradeoff', 'generates',
          '前移之后的检查用更少的信息做判断，于是落在同一条 ROC 的更差工作点上：假阳性必然上升，也就是提前否掉了本来会成立的东西。标准的错误是只用漏检率评价早期门禁，因为被它错杀的东西不会留下证据。',
          'A check that has moved upstream decides on less information and so sits at a worse point on the same ROC: false positives necessarily rise, meaning work that would have turned out fine is rejected early. The standard mistake is to judge an early gate by its miss rate alone, because what it wrongly killed leaves no evidence behind.'),
      ],
      mistakenFor: bi(
        '常被当成"早点做"。它不是把同一件事提前，而是把批量检查换成闭环反馈——关键不在时间点，而在错误产生与被发现之间有没有回路。检验：前移之后作者还要不要等一份报告？要等，就只是把批处理挪早了。第二种混淆是把它当成"多做检查"：移动一个检查和增加一个检查方向相反。',
        'Routinely heard as doing things sooner. Shifting left is not the same step performed earlier but a batch check converted into a closed loop, and what matters is not its position in the calendar but whether a loop exists between making the error and seeing it. The test: after the move, does the author still wait for a report? Then a batch was rescheduled and nothing else. The second confusion is with adding checks — moving one and adding one point in opposite directions.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/waste-as-feedstock',
    depth: {
      origin: bi(
        '丹麦卡伦堡的链条从 1961 年起一条一条长出来，每一条都是一份自负盈亏的双边合同，直到 1980 年代研究者才把这个图样认出来并命名为工业共生。最容易被跳过的正是这段来历：网络是被发现的而不是被规划的；此后自上而下建生态工业园的记录一直不好，因为共址、合同期与价差不是规划者能事先定下的东西。',
        'The links at Kalundborg in Denmark grew one at a time from 1961, each a bilateral contract that had to pay for itself, and only in the 1980s did researchers recognise the pattern and name it industrial symbiosis. The provenance is the part most often skipped: the network was discovered rather than planned, and top-down eco-industrial parks have a poor record since co-location, contract length and price spreads are not things a planner can fix in advance.',
      ),
      minimalForm: '把摩尔分数 x 的组分分出来的最小分离功 ≈ −RT ln x，随稀释对数发散——这是"废流太稀"的物理下界',
      canonicalSubstrates: [
        sub('卡伦堡的蒸汽与石膏', 'Steam and gypsum at Kalundborg', '工业生态学', 'Industrial ecology', 2,
          '电厂脱硫得到的石膏直接进石膏板厂，提纯几乎为零而下游价值是现成的',
          'gypsum from flue-gas desulphurisation goes straight into plasterboard, with almost no purification against a ready downstream value',
          '这里成立的真正条件是几公里内的地理邻近——省下的是运输而不是提纯；把同样的物质平衡拉开距离，账立刻不成立。',
          'What makes it work is proximity of a few kilometres: the saving is in transport rather than in purification, and the same mass balance stops closing as soon as the distance grows.'),
        sub('瘤胃与厌氧消化中的互养', 'Syntrophy in the rumen and in digesters', '微生物生态学', 'Microbial ecology', 1,
          '一个菌群的发酵产物是下一个菌群的底物，杂质谱决定谁能接手',
          'the fermentation products of one guild are the substrate of the next, and the impurity profile decides which guild can take them',
          '下游流程会随上游产物自己改变：群落调整组成去吃可得的废流，所以杂质谱在这里是选择条件而不是约束，这是设计出来的工业链没有的自由度。',
          'The downstream process here rewrites itself: the community shifts composition to eat whatever stream is available, so the impurity profile acts as a selection condition rather than a constraint — a degree of freedom no engineered chain has.'),
        sub('工业与数据中心余热', 'Industrial and data-centre waste heat', '能源工程', 'Energy engineering', 0,
          '三四十度的热在能量上很多、在可用功上几乎没有，这里的"浓度"就是温位',
          'heat at thirty or forty degrees is plentiful in energy and nearly empty of available work, and concentration here means temperature',
          '这一例反过来修正了本结构的说法：对热而言品质确实是物质自身的性质，不随用途集合改变，所以余热的可用性有一个不能靠找到新用户绕过的上界。',
          'This case corrects the structure it belongs to: for heat, quality really is a property of the material and does not move when the set of uses moves, so its usability has a ceiling that finding another customer cannot get around.'),
      ],
      relations: [
        rel('niche-construction', 'special-case-of',
          '把输出重定义为输入，正是生物改变环境并因此造出别人的生态位这件事被有意做一遍——最大的一次是产氧光合作用的废气成了有氧呼吸的原料。这里多出来的只有一个刻意的设计者和一份可以谈的合同。',
          'Redefining an output as an input is what an organism does when it alters its surroundings and so creates the niche another will occupy, the largest instance being the waste gas of oxygenic photosynthesis becoming the feedstock of aerobic respiration. What is added here is a deliberate designer and a contract that can be negotiated.'),
        rel('network-externality-lockin', 'generates',
          '每条双边链都把两端绑在一起：电厂换燃料会让石膏板厂断料。共生网络越密，改动任一节点的代价越高——这解释了一个不舒服的观察：最成熟的共生园区往往在脱碳上最难动。',
          'Each bilateral link ties two plants together: change the power station\'s fuel and the plasterboard works loses its supply. The denser the symbiosis, the higher the cost of changing any node, which accounts for an uncomfortable observation — the most mature symbiosis parks are often the hardest to decarbonise.'),
        rel('dormant-seed-bank', 'generates',
          '一旦承认废物是用途集合的性质，丢弃就成了不可逆地销毁一个选择权，"先存着"于是变成默认动作。存下来的东西在各方面都是一个种子库：持有成本确定，回报取决于将来是否出现一个用途，而可用性会在堆里悄悄归零——结块、风化、混进别的东西。',
          'Once waste is accepted as a property of the set of uses, discarding becomes the irreversible destruction of an option and holding becomes the default. What is then held is a seed bank in every respect: a certain cost of storage, a payoff contingent on some future use appearing, and usability that quietly goes to zero in the pile as it cakes and weathers.'),
        rel('traceability-chain', 'generates',
          '一旦废流被当成原料，接收方就需要知道它的来历：杂质谱是上游历史的函数，而上游从来没有为下游记录过任何东西。所以这条方法先生出的是一套来源证明要求，而它的成本经常大于提纯本身。',
          'Once a discarded stream becomes an input, the receiver needs its history, because the impurity profile is a function of an upstream process that was never documented for anyone downstream. The method generates a provenance requirement before it generates a product, and that requirement often costs more than the purification does.'),
      ],
      mistakenFor: bi(
        '常被当成循环经济的口号。判别是算账：把提纯的能耗与成本计进去，再问接收方在没有补贴、按市价的情况下会不会买。一条只有在把处置成本记成收益时才成立的链，转移的是账目而不是造出了原料。第二个混淆是以为一切都能被重用——分离功随稀释发散这一条说不能。',
        'Routinely repeated as a circular-economy slogan. The discrimination is arithmetic: count the energy and the cost of concentrating the stream, then ask whether the receiver would buy it at market price with no subsidy. A link that closes only once avoided disposal is booked as revenue has moved an entry rather than created a feedstock. The second confusion is the belief that anything can be reused: the work of separation diverges as the stream thins.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/intermediate-rung',
    depth: {
      origin: bi(
        '写得最完整的一版在发展心理学：维果茨基 1930 年代的最近发展区，1976 年由 Wood、Bruner 与 Ross 命名为"脚手架"。这个版本带着一条别处几乎无人保留的要求——脚手架按设计必须被撤掉，撤除时机本身属于方法。经济史一侧的版本（中间技术、低端分层）没有这条要求，于是中间物经常变成永久的一层。',
        'Its most fully worked-out statement is in developmental psychology: Vygotsky\'s zone of proximal development in the 1930s, named scaffolding by Wood, Bruner and Ross in 1976. That version carries a condition almost nobody keeps elsewhere — the scaffold is meant to come down, and when to take it down is part of the method. The economic-history version, intermediate technology and the low-end tier, imposes no such condition, and its intermediates routinely settle into a permanent tier.',
      ),
      canonicalSubstrates: [
        sub('教学脚手架', 'Instructional scaffolding', '发展心理学', 'Developmental psychology', 0,
          '最近发展区就是断层宽度的名字：独立能做的与在帮助下能做的之间那一段',
          'the zone of proximal development is the name of the gap — the span between what can be done alone and what can be done with help',
          '断层宽度因人而异且随时间移动，所以中间物必须可撤除，撤除时机本身是方法的一部分；其他基底几乎都不要求撤除。',
          'The gap differs between learners and moves as they change, so the intermediate has to be removable and the timing of its removal belongs to the method. Almost no other substrate requires removal at all.'),
        sub('中间技术', 'Intermediate technology', '发展经济学', 'Development economics', 1,
          '手扶拖拉机、微型水电这类设备的成本必须落在使用者的资本约束之内',
          'a two-wheel tractor or a micro-hydro set has to cost less than the capital the user can actually raise',
          '要匹配的是资本可得性而不是绝对价格：同一台机器在有信贷与无信贷的地方分别是中间物和上层，所以断层的位置由金融而非技术定义。',
          'What it must match is access to capital rather than a price: the same machine is the intermediate where credit exists and the upper tier where it does not, so the gap is located by finance and not by technology.'),
        sub('台式测序仪', 'Benchtop sequencers', '基因组技术', 'Genome technology', 2,
          '判据是能自己做这件事的实验室多了多少，而不是单位成本降了多少',
          'the test is how many laboratories can now do it themselves, not how far the cost per unit fell',
          '中间物的性能逐年逼近上层，断层是移动的：填空隙有窗口期，晚两年造出来的同一台机器可能已经没有空隙可填。',
          'The intermediate closes on the upper tier year by year, so the gap itself moves and filling it has a window: the same machine built two years later may find nothing left to fill.'),
      ],
      relations: [
        rel('standardisation-lowers-the-bar', 'competes-with',
          '同一个观察是"能做这件事的人变多了"。两种解释：接口被标准化因而不再需要专门知识，或者出现了便宜的中间物因而不再需要那笔钱。判别看新增的人在做什么——用同样的技能更便宜地做，还是不具备原来的技能也能做。在能力型断层上二者分道扬镳：标准化仍然有效，中间物无效。',
          'One observation, that more people can now do the thing, has two accounts: the interface was standardised so the specialist knowledge is no longer needed, or a cheap intermediate appeared so the money is no longer needed. Look at what the newcomers are doing — the same skill more cheaply, or the same result without the skill. On a gap of capability the two part company: standardisation still works and a cheaper rung does not.'),
        rel('limiting-factor', 'generates',
          '填上一个空隙不会让约束消失，只会把它移到第二紧的那一项：测序变便宜之后，瓶颈搬到了分析与参考数据上。所以一个中间物奏效的标志是下一个瓶颈立刻出现；如果什么都没有变紧，说明当初绑住的根本不是成本。',
          'Filling a gap does not remove the constraint, it moves it to whatever was second scarcest: once sequencing became cheap the bottleneck moved to analysis and reference data. The sign that a rung worked is that the next bottleneck appears at once, and if nothing else tightened then cost was not what was binding.'),
        rel('explore-exploit-tension', 'generates',
          '中间物把一次尝试的价格压低，于是最优探索份额上移：它改变的不只是谁能做这件事，还有这些人能承受做错多少次。可见的效果是失败次数增加，而这正是预期效果，却经常被读成浪费。',
          'A cheap rung lowers the price of one attempt and so raises the optimal exploration share: it changes not only who can act but how often they can afford to be wrong. The visible consequence is more failures, which is the intended consequence and is routinely read as waste.'),
      ],
      mistakenFor: bi(
        '常被当成廉价替代品。替代品服务的是原来那批用户，中间物服务的是原来做不了这件事的人，所以判据是新增可达者而不是替代率：如果销量全部来自上层用户降级，它没有填上任何空隙。另一种混淆是把它类比成演化里的中间形态——演化没有建造者，每一个中间态必须在当时就自己养活自己。',
        'Routinely mistaken for a cheap substitute. A substitute serves the users who were already there; a rung serves the people who could not do the thing at all, so it is judged by newly reachable users and not by share taken: if every unit sold is an existing user trading down, no gap was filled. The other confusion is with an evolutionary intermediate — evolution has no builder, and each intermediate state must pay for itself at the time.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/ex-vivo-reconstitution',
    depth: {
      origin: bi(
        '1897 年 Buchner 用无细胞的酵母汁发酵糖，顺带终结了活力论；1961 年 Nirenberg 与 Matthaei 在无细胞提取物里读出了第一个密码子——两次决定性推进都发生在被剥离出来的体系里。2001 年之后由纯化组分重建的翻译体系暴露了代价：组分加齐后体系确实工作，速率却只有体内的百分之几，而这个缺口正是没有人写下来的那部分。',
        'Buchner fermented sugar with cell-free yeast juice in 1897 and finished off vitalism in passing; in 1961 Nirenberg and Matthaei read the first codon in a cell-free extract. Both decisive steps happened in a system lifted out of its host. Translation rebuilt from purified components after 2001 exposed the price: with the components all added back the system works at a few per cent of the rate inside a cell, and that shortfall is the part nobody had written down.',
      ),
      canonicalSubstrates: [
        sub('无细胞翻译体系', 'Cell-free translation systems', '生物化学', 'Biochemistry', 1,
          '完备度可以逐个组分地枚举：需要的几十个蛋白与因子被一一加回并单独验证',
          'completeness can be enumerated component by component, with each of the several dozen proteins and factors added back and checked on its own',
          '这是少数隐性环境可以被穷举的基底，代价是缺口大到无法忽略：这里的"补全"衡量的是一份清单的完整性，而不是环境的完整性。',
          'This is one of the few substrates where the implicit environment can be enumerated, and the price is a shortfall too large to ignore: what is measured here is the completeness of a list rather than of an environment.'),
        sub('类器官', 'Organoids', '发育生物学', 'Developmental biology', 0,
          '边界划在干细胞及其龛的哪一部分，是第一个也是最难的决定',
          'which part of the stem cell and its niche to cut around is the first decision and the hardest',
          '被剥离的子系统会自己长出一部分环境，所以边界不是切割时定下的而是在重建过程中移动的——这让"边界划错了"这个诊断比别处更难做出。',
          'The lifted subsystem grows part of its own environment back, so the boundary is not settled at the cut but moves during the rebuild, which makes a misplaced boundary harder to diagnose here than anywhere else.'),
        sub('容器化的服务', 'A containerised service', '软件工程', 'Software engineering', 2,
          '保真度就是同一个服务离开生产环境之后行为还有多接近，差额就是那句"在我机器上是好的"',
          'fidelity is how closely the same service still behaves once it is off its production host, and the gap is the remark that it works on my machine',
          '这里的隐性环境原则上可以枚举，镜像把它变成一份清单，于是方法退化成工程问题而不是科学推断：缺口测的是疏忽，不是未知。',
          'Here the implicit environment is enumerable in principle and an image turns it into a manifest, so the method degenerates into an engineering problem rather than an inference: the shortfall measures oversight, not the unknown.'),
      ],
      relations: [
        rel('shift-left', 'generates',
          '把一个子系统在受控环境里重建出来，正是让下游检查有可能上移的那一步：体外体系是下游环境的上游替身，它的保真度决定这个检查能移多远。所以前置化能走多深，通常不是流程问题而是重建问题。',
          'Rebuilding a subsystem under control is the step that makes a downstream check movable at all: the reconstituted system is the upstream stand-in for the downstream environment, and its fidelity bounds how far the check can travel. How far a check can move upstream is usually a reconstitution problem rather than a process problem.'),
        rel('intermediate-rung', 'special-case-of',
          '重建体正好落在纯化组分与完整宿主之间的那一级：比整体便宜可控，比零件富含上下文。它因此是这个空隙的一种具体填法，也继承了那条方法的判据——要问的是哪些实验因此变得可做，而不是它像不像体内。',
          'A reconstituted system sits exactly on the tier between purified components and the intact host: cheaper and more controllable than the organism, richer in context than the parts. It is one concrete way of building that rung and inherits its test — which experiments became possible, rather than how closely it resembles the living case.'),
        rel('tacit-craft-explicitation', 'generates',
          '重建强迫把宿主提供过的东西写成一份可执行的清单，而功能保真度的缺口就是清单之外仍然隐性的那一部分。所以这条方法有两个产物：一个能工作的体系，和一份被显式化的配方，后者往往比前者活得久。',
          'Rebuilding forces whatever the host supplied into an executable list, and the shortfall in retained function measures what stays tacit outside that list. The method yields two products: a system that works and a recipe made explicit, and the second usually outlives the first.'),
      ],
      mistakenFor: bi(
        '常与"从描述重建"混为一谈，也常被当成"模型体系"。区别在于测什么：重建保留原件、问功能能不能离开宿主；从描述重建丢掉原件、问记录够不够。两者的失败长得一样——重建体表现不如原来——诊断却相反：原件还在手上，缺口测的是环境；不在，测的是记录。',
        'Routinely conflated with rebuilding from a description, and routinely called a model system. The measurement differs: reconstitution keeps the original and asks whether function survives leaving the host, while rebuilding from a description discards it and asks whether the record sufficed. Both failures look identical — the rebuild underperforms — and the diagnoses are opposite: with the original still in hand the shortfall measures the environment, and without it, the record.',
      ),
    },
  },
];
