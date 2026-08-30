import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureQuantity, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the scale-and-rate family.
 *
 * All eight answer one question: what happens as size or speed changes, and
 * where does the change stop being a slope and become a step?
 *
 * That split is the family's own structure. Three describe a continuous
 * response — a power law whose exponent is the entire content, two terms
 * growing at different powers so the leading one flips at some size, and the
 * waste that rises with how fast a process is driven. Three describe a
 * discontinuous one — a floor below which the function does not weaken but
 * stops, an output set by the scarcest input alone so that adding any other
 * returns exactly nothing, and a ceiling past which relations are dropped
 * whole rather than served slower. The remaining two say when the first six
 * may be applied at all: where a system sits on the robustness-efficiency
 * curve reveals which disturbances it was built for, and coarse-graining is an
 * approximation only while the fast and slow scales stay apart.
 *
 * THE OPPOSITION WORTH FILING. `scaling` says microscopic detail does not
 * matter, because systems sharing nothing at the small scale share an
 * exponent. `scale-separation-failure` says the discarded detail is exactly
 * what a coarse description loses once the scales entangle. Both hold, under
 * different conditions, and the condition is stated in the relation between
 * them: one clean power law admits both readings, and what tells them apart is
 * the ratio of fast to slow timescales together with whether the exponent
 * drifts once the range is pushed past the window it was fitted in. That ratio
 * is rarely reported, which is why the two get cited side by side without
 * anyone noticing they make incompatible claims about the same curve. A second
 * opposition runs between `scaling` and `minimum-viable-size`: deviations at
 * the small end can be curvature, or they can be the curve ending; goodness of
 * fit does not separate them, and running a power law through that end is a
 * standard way to be wrong.
 *
 * WHY `scaling` GETS QUANTITIES HERE. Seven of the eight already declare their
 * own variables, so their patches carry depth only. `scaling` declares none,
 * and it also carries zero mappings — deliberately, as the top of
 * structures.ts records. It is the honest empty case: the structure with
 * nothing attached and no pretence otherwise. Giving it four abstract
 * quantities is textbook authoring and attaches nothing. The prefactor is
 * among them because it is the one place each substrate's specifics survive,
 * and the one field discarded whenever two exponents are compared.
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

export const SCALE_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/scaling',
    quantities: [
      q('规模变量 M', 'the scale variable M',
        '被当作自变量的那个「大小」；它是体重、人口还是长度，决定了指数的含义',
        'the size taken as the independent variable — body mass, population or length, and which it is fixes what the exponent means'),
      q('标度指数 α', 'the scaling exponent α',
        '双对数图上的斜率；两个系统共享它就属于同一个普适类，这是这条结构的全部内容',
        'the slope on log-log axes; two systems sharing it belong to one universality class, and that is the whole content'),
      q('被标度的性质 Y', 'the scaled property Y',
        '随规模变化的那个可测量：代谢率、道路里程、能谱密度',
        'the measurable that changes with size: metabolic rate, road length, spectral density'),
      q('前因子 Y₀', 'the prefactor Y₀',
        '同一指数下各基底之间的差别全压在这里；它不参与普适类的判定，也因此常被当成不重要',
        'where every difference between substrates at one exponent lives; it plays no part in identifying the class, which is why it gets treated as unimportant'),
    ],
    depth: {
      origin: bi(
        '1932 年 Max Kleiber 在动物营养学里量出来：代谢率随体重的 3/4 次幂增长，而不是表面积论证预期的 2/3 次幂。这个指数在有机制解释之前先是一个实测上的麻烦，只靠数据辩护——直到 1997 年 West、Brown 与 Enquist 用分形输运网络给出推导，中间隔了六十五年。',
        'Measured by Max Kleiber in animal nutrition in 1932: metabolic rate goes as body mass to the three-quarters, not the two-thirds a surface-area argument predicts. The exponent was an empirical embarrassment before it was a theory, defended on data alone — a derivation from fractal transport networks arrived only in 1997, sixty-five years later.',
      ),
      minimalForm: 'Y = Y₀ · M^α ;  log Y = log Y₀ + α log M',
      canonicalSubstrates: [
        sub('代谢率与体重', 'Metabolic rate against body mass', '生物学', 'Biology', 1,
          '3/4 这个数本身就是内容：既不是 2/3（表面积论证给的），也不是 1（等比例给的）',
          'the number three-quarters is itself the content: neither the two-thirds of a surface argument nor the one of proportionality',
          '这个指数至今有争议，不同数据集给出 2/3 到 1 之间的值。更要紧的是，个体生长中的指数与跨物种拟合的指数不是同一个量，混用等于把物种之间的回归线读成关于长大的规律。',
          'The exponent is still contested, with datasets giving values between two-thirds and one. More consequentially, the exponent within one growing organism and the one fitted across species are different quantities, and conflating them reads a regression about species differences as a rule about growing up.'),
        sub('城市指标与人口', 'City indicators against population', '城市科学', 'Urban science', 0,
          '规模是城市人口：基础设施随它以约 0.85 次幂增长，社会经济产出以约 1.15 次幂增长',
          'size here is city population, with infrastructure growing as roughly the 0.85 power and socioeconomic output as the 1.15',
          '城市边界是行政定义的：改按都会区或通勤圈来划，同一座城市的人口能差近一倍，指数随之移动。所以这里的自变量是一个划界选择而不是物理量，不报边界定义的指数无法被复核。',
          'A city\'s boundary is an administrative decision: delineated as a metropolitan area or a commuting zone, the same city\'s population nearly doubles and the exponent moves with it. The independent variable is a choice of delineation rather than a physical quantity, and an exponent reported without it cannot be checked.'),
        sub('湍流的能谱', 'The energy spectrum of turbulence', '流体力学', 'Fluid dynamics', 2,
          '被标度的性质是能量在波数上的密度，Kolmogorov 给出 E(k) ∝ k^(−5/3)',
          'the scaled property is energy density across wavenumber, with Kolmogorov giving E(k) ∝ k^(−5/3)',
          '这条幂律自带一个显式的有限窗口：只在惯性区成立，宽度由雷诺数决定。生物学的标度律则被默认跨越全部体重范围——同一个函数形式，一个把适用区间写在脸上，一个把它留给读者。',
          'This power law comes with an explicit finite window: it holds in the inertial range, with the width set by the Reynolds number. Biological scaling is by default assumed to run across the whole mass range — one functional form, one version stating its range of validity and one leaving that to the reader.'),
        sub('跨物种剂量换算', 'Interspecies dose conversion', '药理学', 'Pharmacology', 3,
          '折算到人时指数被当成已知（通常取 0.75），物种之间的差别全被推进前因子里',
          'converting to a human dose takes the exponent as known, usually 0.75, and pushes every difference between species into the prefactor',
          '这里的指数不是被测量的对象而是被借用的假设，所以换算失败几乎总是出在前因子上：吸收、蛋白结合与清除的物种差异。而当靶点通路本身跨物种不同时，幂律形式整个不适用。',
          'The exponent here is borrowed rather than measured, so conversions fail almost always through the prefactor: species differences in absorption, protein binding and clearance. And where the target pathway itself differs between species, the power-law form does not apply at all.'),
      ],
      relations: [
        rel('renormalization-group', 'emerges-from',
          '标度律是重整化群流停在不动点上时剩下的样子：不动点处系统在尺度变换下不变，而具有这个性质的函数形式只有幂律。所以「微观细节无关」不是经验观察，是流把不相关方向压掉的结果——前因子恰好就是被压掉的那部分。',
          'A scaling law is what is left when a renormalization-group flow settles at a fixed point: there the system is unchanged under rescaling, and the only functional form with that property is a power law. Microscopic irrelevance is therefore not an observation but a consequence of the flow suppressing irrelevant directions — and the prefactor is precisely what gets suppressed.'),
        rel('scale-separation-failure', 'competes-with',
          '同一条干净的幂律有两种读法：微观细节确实无关，或者测量恰好落在快慢尺度分得开的窗口里，而窗口之外被丢掉的项会回来主导。分开二者的条件是明确的——快慢时标之比，以及把范围推出窗口后指数是否漂移——但这个比值在多数报告里没有被量过。',
          'One clean power law admits two readings: that microscopic detail really is irrelevant, or that the measurement sat inside a window where fast and slow scales come apart, with the discarded terms returning to dominate outside it. What separates them is explicit — the ratio of fast to slow timescales, and whether the exponent drifts once the range is pushed past the window — but that ratio goes unmeasured in most reports.'),
      ],
      mistakenFor: bi(
        '最常与幂律分布混淆，而两者的坐标轴不是一回事：标度律的每个点是一个对象（横轴是它的规模，纵轴是在它身上量到的性质），幂律分布的每个点是一个计数。判据就是问纵轴上是不是频次。第二重误用是把双对数图上的直线当成证据：跨度在三个数量级以内时，对数正态与截断指数几乎总能拟合得同样好。',
        'Most often confused with a power-law distribution, though the axes are not the same thing: each point of a scaling law is one object — its size against a property measured on it — while each point of a distribution is a count. The test is whether the vertical axis carries a frequency. The second misuse treats a straight line on log-log axes as evidence: across three decades or fewer, a lognormal or a truncated exponential usually fits just as well.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/surface-volume-crossover',
    depth: {
      origin: bi(
        '1638 年伽利略在《关于两门新科学的对话》里写下：把动物按比例放大，骨骼的承重截面按平方增长而重量按立方增长，所以巨人的骨头必须不成比例地粗。他是从材料与建造的问题走过来的——为什么大船和大梁会在自重下折断——所以它被写成一条禁止性的陈述而不是一条预测。',
        'Written down by Galileo in the 1638 Two New Sciences: scale an animal up and a bone\'s load-bearing cross-section grows as the square while its weight grows as the cube, so a giant\'s bones must be disproportionately thick. He came to it from materials and construction — why large ships and beams break under their own weight — which is why it reads as a prohibition rather than as a prediction.',
      ),
      minimalForm: 'A/V ∝ L⁻¹ ;  aL² = bL³ ⟹ L* = a/b',
      canonicalSubstrates: [
        sub('恒温动物的散热', 'Heat loss in a warm-blooded animal', '生理学', 'Physiology', 0,
          '产热随体积、散热随体表，所以体型越小，每克组织必须烧掉的能量越多',
          'heat production goes with volume and heat loss with skin, so the smaller the body the more each gram must burn',
          '真实动物把有效散热面积当成可调量：毛皮、耳廓、皮下血流分流与蜷缩都在改它，幅度以倍数计。所以这里的面积项不是由形状定死的几何量，几何比值只标出调节范围的一端。',
          'A real animal treats effective surface as adjustable — fur, ear flaps, shunting blood from the skin, curling up — and by factors rather than percentages. The surface term here is not fixed by shape; the geometric ratio marks only one end of the regulating range.'),
        sub('放热反应的反应器放大', 'Scaling up an exothermic reactor', '化学工程', 'Chemical engineering', 2,
          '产热随反应体积、移热随器壁面积，两者相等的体积就是「实验室安全、工业规模失控」的分界',
          'heat generated goes with the reacting volume and heat removed with the wall, and the volume where they balance separates safe in a flask from a runaway in a plant',
          '工程上的做法不是接受这个尺寸，而是把面积重新塞回去：内盘管、外循环、微通道。于是有效面积不再随 L² 走，转折尺寸成了设计变量而不是几何后果——放大之所以难，正因为它必须是刻意的非相似放大。',
          'The industry does not accept that size; it puts area back in — coils, external loops, microchannels — so effective area no longer follows L² and the crossover becomes a design variable rather than a geometric consequence. Scale-up is hard precisely because it has to be deliberately non-similar.'),
        sub('芯片算力与片外带宽', 'On-chip compute against off-chip bandwidth', '计算机体系结构', 'Computer architecture', 1,
          '晶体管数随芯片面积增长，而对外带宽随边长（引脚周长）增长，所以这里的「内部那一半」是面积',
          'transistor count grows with die area while off-chip bandwidth grows with the edge, the pin perimeter, so the interior half here is an area',
          '这里的两个指数是 2 与 1 而不是 3 与 2，因为芯片是二维的。这条结构的内容是两项指数不同因而必然相交，不是具体的平方与立方；当成「平方立方律」用，在二维、分形表面与分支网络上都会把交点算错位置。',
          'The exponents here are 2 and 1 rather than 3 and 2, because a die is two-dimensional. The content is that two terms carry different exponents and must cross, not the particular square and cube; used as the square-cube law it puts the crossing in the wrong place in two dimensions, on fractal surfaces and in branching networks.'),
      ],
      relations: [
        rel('scaling', 'special-case-of',
          '平方立方律是标度律里指数被几何定死的那一档：2 与 3 由维数给定而不是拟合出来，所以转折尺寸可以直接算。代价是它只在形状随规模保持相似时成立——一旦开始改形状，指数就退回到需要测量的状态。',
          'The square-cube law is scaling with the exponents nailed down by geometry: 2 and 3 come from dimension rather than from a fit, so the crossover size can be computed instead of measured. The price is that it holds only while shape stays similar under scaling — once the shape starts changing, the exponents revert to something you have to measure.'),
        rel('limiting-factor', 'generates',
          '转折点两侧限制产出的不是同一项，所以系统在变大的过程中会换瓶颈：小的时候受体积项限制，大了以后受面积项限制。这意味着小尺寸上的优化实验识别出的瓶颈，到大尺寸上可能已经不是瓶颈——放大失败往往不是程度问题，是因子找错了。',
          'Different terms bind on the two sides, so a system changes bottleneck as it grows: limited by the volume term when small and by the surface term when large. An optimisation run at small size can identify a factor that no longer binds at large size — scale-up failures are often not a matter of degree but of the wrong factor.'),
      ],
      mistakenFor: bi(
        '常被误当成「大的东西更有效率」这类一般说法。它只说：两个随规模以不同幂次增长的项必然在某处相等，而结论朝哪个方向完全取决于哪一项是你要的——散热是面积项时大动物占便宜，吸收养分也是面积项时大细胞就吃亏。第二重混淆是与最小可行规模：那条说低于某尺寸功能整体消失，这条说主导机制换了人而两侧都仍在工作。',
        'Often mistaken for a general claim that bigger is more efficient. It says only that two terms growing with different powers must be equal somewhere, and which way the conclusion points depends on which term you want: when the surface term is heat loss, being large helps; when it is nutrient uptake, being large hurts. The second confusion is with minimum viable size, which says the function disappears below a size, where this one says the dominant mechanism changes hands and both sides still work.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/minimum-viable-size',
    depth: {
      origin: bi(
        '可操作的版本来自 1980 年前后的保护生物学：Franklin 与 Soulé 的 50/500 经验法则，以及 Shaffer 1981 年的最小存活种群定义。值得注意的是这个定义从一开始就带两个参数——在多少年内、以多大概率不灭绝——因为生态学家很快发现「能不能活下去」没有无条件的答案，而后来引用这个数的人几乎总是把这两项丢掉。',
        'The operational version comes from conservation biology around 1980: the 50/500 rule of thumb from Franklin and Soulé, and Shaffer\'s 1981 definition of a minimum viable population. That definition carried two parameters from the start — over how many years, and with what probability of persistence — because ecologists found immediately that whether something survives has no unconditional answer, and almost everyone who has quoted a number since has dropped both.',
      ),
      minimalForm: 'f(n) = 0 for n < n* ,  f(n*) > 0  （阶跃，而非 f(n) → 0）',
      canonicalSubstrates: [
        sub('最小基因组', 'The minimal genome', '合成生物学', 'Synthetic biology', 0,
          '删到不能再删的那一组基因——JCVI-syn3.0 停在 473 个，其中约三分之一至今不知道在做什么',
          'the set that cannot be cut further — JCVI-syn3.0 stopped at 473 genes, about a third of which still have no known function',
          '这里的必需集是逐个敲除测出来的，而这种测法系统性地漏掉冗余对：两个基因各自可敲、同时敲致死。所以单基因筛选报出的下限偏低，而必需性其实是一组基因的集合性质。',
          'The required set here is measured one knockout at a time, and that method systematically misses redundant pairs: two genes each dispensable alone but lethal together. A single-gene screen therefore reports a floor that is too low, and essentiality turns out to be a property of the set.'),
        sub('最小存活种群', 'A minimum viable population', '保护生物学', 'Conservation biology', 2,
          '种群数量跨过某处之后，灭绝概率不是缓慢上升而是陡增',
          'past a certain count a population\'s probability of extinction does not rise gently, it takes off',
          '这里的阶跃是概率性的而不是确定的：近交衰退、Allee 效应与随机性别比互相加强，把下限抹成一个风险陡增的区间而不是一条线。所以一个 MVP 数字不附年限与概率就没有内容。',
          'The step here is probabilistic rather than sharp: inbreeding depression, Allee effects and stochastic sex ratios reinforce one another and smear the floor into a band of steeply rising risk. A minimum-viable-population number has no content without a horizon and a probability attached.'),
        sub('双边平台的冷启动', 'Cold start on a two-sided platform', '经济学', 'Economics', 1,
          '任一侧的用户数低于某个值，对另一侧就没有价值，于是两侧都不来',
          'below some count on either side there is nothing in it for the other side, so neither shows up',
          '这里的下限是内生的：由对手方的人数决定，所以同一市场里两个平台的下限不同，先到者还会把后来者的下限抬高。基因组或种群的下限由外部条件给定，平台的下限是竞争的产物——它可以被别人移动。',
          'The floor here is endogenous: set by how many are on the other side, so two platforms in one market have different floors and whoever arrives first raises the follower\'s. A genome\'s or a population\'s floor is given by outside conditions; a platform\'s is a product of competition and can be moved by someone else.'),
      ],
      relations: [
        rel('scaling', 'competes-with',
          '小尺度上的偏离有两种读法：标度律读作曲率或指数换了一档，最小可行规模读作曲线在这里结束、下限以下的样本不是同一类对象。拟合优度分不开二者，而把幂律硬穿过这个末端是标准的出错方式；分开它们要靠检验必需部件是否齐全，这是机制问题不是统计问题。',
          'Deviations at the small end admit two readings: a scaling law reads them as curvature or a change of exponent, while minimum viable size reads them as the curve ending, with anything below the floor not being the same kind of object. Goodness of fit does not separate the two, and running a power law through that end is a standard way to be wrong; what separates them is checking whether the required parts are still all present — mechanism, not statistics.'),
        rel('limiting-factor', 'special-case-of',
          '最小可行规模是最小律把各因子取成在场／缺席两值时的样子：供给连续时最稀缺的因子决定产出有多少，供给二值时它决定产出是否存在。这也解释了响应为什么是阶跃的——min 的某个自变量只能取 0 或 1 时，输出也只能取「没有」或「全部」。',
          'Minimum viable size is the law of the minimum with each factor reduced to present or absent: with continuous supply the scarcest factor sets how much output there is, and with binary supply it sets whether there is any. That is also why the response is a step — a minimum over an argument that can only be 0 or 1 can only return nothing or everything.'),
        rel('network-externality-lockin', 'generates',
          '当下限由对手方的规模决定时，跨过它本身是自我强化的：越过之后每多一个用户都在替对手方降低门槛，于是这个下限变成一道只需被跨过一次的门。这也解释了为什么这类市场里的补贴买的是那一次跨越，而不是买用户。',
          'When the floor is set by the size of the other side, crossing it is self-reinforcing: past the threshold every additional user lowers the barrier for the other side, and the minimum becomes a door that only has to be passed once. It is also why subsidies in such markets buy the crossing rather than buying users.'),
      ],
      mistakenFor: bi(
        '最常被误当成规模效应或收益递增：那些说的是小的时候效率低，这条说的是小到某处功能不存在。判据是问「再小一点会怎样」——回答「更慢、更贵、更差」的是效应，回答「就没有了」的才是下限。第二重误用是把某个具体数字（473 个基因、50 个个体）当成常数搬到别处；每个数字都是在一组给定的外部条件下测到的，而搬运的人通常连原来的条件都没写下来。',
        'Most often mistaken for economies of scale or increasing returns, which say that being small is inefficient; this says that below a point the function does not exist. The test is to ask what happens if it gets a little smaller: slower, dearer, worse describes an effect, and only nothing left describes a floor. The second misuse carries a specific number elsewhere as a constant, 473 genes or 50 individuals, when each was measured under outside conditions that whoever carries it has usually not written down.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/limiting-factor',
    depth: {
      origin: bi(
        '1828 年由 Carl Sprengel 在农学里写出，后因 Justus von Liebig 的推广而以「最小律」闻名（那只木桶是更晚的教学图示）。它一开始就是一条施肥的会计规则：该买哪一种肥料。这解释了它为什么取 min 的形式而不是加权和——只有 min 才给得出「在非限制因子上的支出回报为零」这个可以直接照做的结论。',
        'Written down by Carl Sprengel in agronomy in 1828 and made famous by Justus von Liebig\'s promotion of it as the law of the minimum (the barrel is a later teaching picture). It began as an accounting rule about fertiliser — which one to buy — and that is why it takes the form of a minimum rather than a weighted sum: only a minimum yields the directly actionable conclusion that anything spent on a non-limiting factor returns nothing.',
      ),
      minimalForm: 'Y = minᵢ (Sᵢ / rᵢ)',
      canonicalSubstrates: [
        sub('作物产量与养分', 'Crop yield and nutrients', '农学', 'Agronomy', 0,
          '氮、磷、钾、水各自的供给量被放在一起比较，最少的那一个定产量',
          'nitrogen, phosphorus, potassium and water compared side by side, with the smallest of them setting the yield',
          '一整块田的产量响应看起来是平滑的，因为它是许多小块各自取 min 之后的平均：每一处的限制因子不同，平均把折点抹掉了。所以在田块尺度上看不到拐点，只说明测量的粒度粗过了限制因子变化的粒度。',
          'A whole field\'s yield response looks smooth because it is the average of many patches, each with its own minimum and its own limiting factor, and averaging rubs the kink out. Seeing no kink at field scale shows only that the measurement is coarser than the variation in which factor binds.'),
        sub('代谢通路的限速步骤', 'The rate-limiting step in a metabolic pathway', '生物化学', 'Biochemistry', 1,
          '一条通路里被认为卡住全局的那一个酶',
          'the one enzyme taken to be holding up the whole pathway',
          '代谢控制分析（Kacser 与 Burns，1973）证明单一限速酶通常并不存在：控制系数分散在多个酶上，而且随底物浓度重新分配。所以在这个基底上最小律是极端情形而不是常态，「找到那个酶」这个提法多数时候就已经错了。',
          'Metabolic control analysis (Kacser and Burns, 1973) showed that a single rate-limiting enzyme usually does not exist: control is spread over several enzymes and redistributes as concentrations change. Here the law of the minimum is a limiting case rather than the normal one, and the framing of finding the enzyme is usually wrong before the search starts.'),
        sub('生产线的约束', 'The constraint on a production line', '运筹学', 'Operations research', 2,
          '补上当前工位之后，下一个约束会出现在哪一站',
          'which station becomes the constraint once the current one is relieved',
          '生产线的瓶颈随订单组合漂移，缓冲区还让它在短时间尺度上不唯一：同一条线上午和下午可以卡在不同工位。所以「找到瓶颈」在这里是一个会过期的结论，要重复测量而不是一次性诊断。',
          'A line\'s bottleneck drifts with the product mix, and buffers make it non-unique on short timescales: the same line can be held up at one station in the morning and another in the afternoon. Finding the bottleneck here yields a conclusion with an expiry date, to be re-measured rather than diagnosed once.'),
      ],
      relations: [
        rel('data-movement-dominates', 'explains',
          '数据搬运主导是最小律在当代计算里的具体形态：算力涨了几个数量级而带宽没有，于是最稀缺的因子换了人。它解释了为什么继续加算力的回报接近零——这不是「收益递减」，是在非限制因子上投入的标准结果，回报是零而不是变小，两者对该不该继续投给的是相反建议。',
          'Data movement dominating is the law of the minimum in its current computational form: arithmetic throughput grew by orders of magnitude and bandwidth did not, so the scarcest factor changed hands. It explains why adding arithmetic returns almost nothing — not diminishing returns but the standard result of spending on a non-limiting factor, where the return is zero rather than merely smaller, and the two imply opposite advice about carrying on.'),
        rel('leverage-point', 'explains',
          '瓶颈是杠杆点里唯一可以事先算出来的一类：非瓶颈上的投入回报为零，瓶颈上的回报等于全部。所以只要确认因子确实不可互相顶替，「找杠杆点」就从判断变成了测量；而在因子可替代的系统里，这个搜索找到的通常是最容易测的那个，不是最有效的那个。',
          'A bottleneck is the one kind of leverage point that can be computed in advance: spending anywhere else returns nothing and spending there returns everything. Once the factors are established to be non-substitutable, finding the leverage point stops being judgement and becomes measurement; where they are substitutable, the search usually lands on the most measurable factor rather than the most effective one.'),
      ],
      mistakenFor: bi(
        '常被当成「抓主要矛盾」这类一般建议，而它的内容恰恰在一个很强的前提上：因子之间不可互相顶替。前提成立时结论是量化的——在别处的投入回报为零；前提不成立时它退化成加权和，而加权和里每一项都值得投一点。分辨的办法不是看系统复不复杂，是做一次实验：只增加一个非最稀缺的因子，看产出是否纹丝不动。',
        'Often read as general advice to attack whatever matters most, when its content sits in a strong premise: the factors cannot substitute for one another. Where that holds the conclusion is quantitative, in that anything spent elsewhere returns nothing; where it does not, the model degenerates into a weighted sum in which every term deserves a little. The way to tell is not to judge how complex the system is but to run one experiment: add only a non-scarcest factor and see whether output moves at all.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/scale-separation-failure',
    depth: {
      origin: bi(
        '这个名字来自多尺度渐近方法，但内容第一次出现是 1895 年 Reynolds 对流体方程取平均的时候：平均之后方程里多出一项，它依赖于刚被平均掉的涨落，而无法用平均量写出来——这就是至今未解的闭合问题。这也解释了它为什么总以「多出一项」而不是「少了一项」的形式出现：粗粒化并不删掉快变量，而是把它们折叠成一个需要额外输入的新项。',
        'The name comes from multiple-scale asymptotics, but the content first appeared in 1895 when Reynolds averaged the equations of fluid motion: averaging leaves an extra term that depends on the fluctuations just averaged away and cannot be expressed in the mean — the closure problem, still open. It is also why the structure shows up as an extra term rather than a missing one: coarse-graining does not delete the fast variables, it folds them into a new term that needs an input of its own.',
      ),
      minimalForm: 'ε = τ_fast/τ_slow ;  ∂⟨u⟩/∂t = F(⟨u⟩) + R(u′) ,  R → 0 仅当 ε → 0',
      canonicalSubstrates: [
        sub('湍流的闭合问题', 'The closure problem in turbulence', '流体力学', 'Fluid dynamics', 2,
          '雷诺应力项——被平均掉的涨落对平均流的反作用，而它没有用平均量表达的写法',
          'the Reynolds stress: the back-reaction of the averaged-away fluctuations on the mean flow, with no expression in terms of the mean',
          '湍流的尺度是连续谱而不是快慢两档，所以这里根本没有可以取极限的小参数。失效不是「分离得不够好」而是没有分离可言；因此所有湍流模型都是拟合而不是某个展开的截断，换一个流动就要换一套系数。',
          'Turbulence has a continuous spectrum of scales rather than two bands, so there is no small parameter to take a limit in. The failure is not that separation is poor but that there is none, which is why every turbulence model is a fit rather than the truncation of an expansion, and why a different flow needs different coefficients.'),
        sub('粗粒化力场', 'A coarse-grained force field', '计算化学', 'Computational chemistry', 1,
          '把若干原子并成一个珠子之后保留下来的那些坐标',
          'the coordinates that survive after several atoms are merged into one bead',
          '这里的失效有一个特定形状：结构对而动力学错。自由度被移除时，它们提供的摩擦与涨落一起消失，时标被人为加快数倍到数十倍，于是同一个模型在热力学量上可信、在速率上不可信。',
          'The failure here has a specific shape: right structure, wrong dynamics. Removing degrees of freedom removes the friction and the fluctuations they supplied together, so timescales run several to tens of times fast, and one model is trustworthy for thermodynamic quantities and not for rates.'),
        sub('气候模式里的对流参数化', 'Convection parameterisation in a climate model', '气候科学', 'Climate science', 0,
          '对流的空间尺度与网格尺度之比，它在 1 到 10 公里的「灰区」上接近 1',
          'the ratio of the convective scale to the grid scale, which approaches one in the grey zone of roughly 1 to 10 kilometres',
          '这里的尺度比一半来自自然、一半来自离散化的选择：同一个物理过程随分辨率提高会从次网格变成可解析，而参数化方案是按前者写的。所以加密网格在这里不是逼近真解，而是把模型送进一个两种假设都不成立的区间。',
          'Half of the ratio here comes from nature and half from a discretisation choice: as resolution improves the same physical process moves from sub-grid to resolved, while the parameterisation was written for the former. Refining the grid therefore does not converge on the truth here — it walks the model into a band where neither assumption holds.'),
      ],
      relations: [
        rel('renormalization-group', 'emerges-from',
          '重整化群是把快模式一层层积掉的系统做法，而这条结构说的正是这个做法不收敛的情形：每一步粗粒化都生成新的、不能忽略的耦合，流找不到不动点。所以「约化成不成立」不是哲学问题，它有一个具体判据——粗粒化一次之后，有效理论是否以同样的形式封闭。',
          'The renormalization group is the systematic way of integrating out fast modes layer by layer, and this structure is the case where that procedure does not converge: each step generates new couplings that cannot be dropped, and the flow finds no fixed point. Whether a reduction holds is therefore not a philosophical question but one with an explicit test — after one coarse-graining step, does the effective theory close in the same form.'),
        rel('finite-time-dissipation', 'explains',
          '准静态极限就是一个完美的尺度分离：驱动远慢于弛豫，系统始终来得及跟上。额外耗散正是这个分离开始失效时要付的钱，所以「多快算快」从来不是绝对速度，而是驱动时标与系统最慢弛豫时标之比——同一份协议对一个系统是准静态的，对另一个就是急剧的。',
          'The quasi-static limit is perfect scale separation: the drive is far slower than the relaxation and the system always keeps up. Excess dissipation is what gets paid as that separation starts to fail, which is why how fast is too fast is never an absolute speed but a ratio of the driving timescale to the system\'s slowest relaxation — the same protocol is quasi-static for one system and abrupt for another.'),
      ],
      mistakenFor: bi(
        '最常被当成「任何模型都是近似」这句通用免责声明贴在讨论末尾，而在那个位置它没有任何内容。它的内容全压在可以量的东西上：快慢时标之比，以及被丢弃项对慢变量的反馈强度。第二重混淆是与分辨率不足：加密网格能修的是离散误差，判据是加密之后残余项是否收敛——收敛的是分辨率问题，不收敛的才轮到这条结构说话。',
        'Most often used as the general disclaimer that all models are approximate, appended at the end of a discussion, where it carries no content whatsoever. Its content rests entirely on measurable things: the ratio of fast to slow timescales, and how strongly the dropped terms feed back on the slow ones. The second confusion is with insufficient resolution: refining a grid fixes discretisation error, and the test is whether the residual converges under refinement — if it converges the problem was resolution, and only if it does not does this structure have anything to say.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/robustness-efficiency-tradeoff',
    depth: {
      origin: bi(
        '这条取舍在几个领域各自成形：可靠性工程从 1950 年代起把冗余当作设计变量（von Neumann 1956 年讲过如何用不可靠元件搭出可靠机器），生态学在多样性—稳定性的争论里反复碰到它，而 Carlson 与 Doyle 1999 年的 HOT 把它讲成一个可计算的命题：一个系统对已知扰动优化得越好，对没有列进清单的扰动就越脆弱。这解释了为什么扰动分布必须是显式的量——离开它，「鲁棒」没有指称对象。',
        'The tradeoff took shape separately in several fields: reliability engineering has treated redundancy as a design variable since the 1950s (von Neumann lectured in 1956 on building reliable machines from unreliable parts), ecology keeps meeting it in the diversity-stability debate, and Carlson and Doyle\'s highly optimized tolerance in 1999 turned it into a computable claim — the better a system is optimised against a listed set of disturbances, the more fragile it is to anything off that list. That is why the disturbance distribution has to be explicit: without one, robust has nothing to refer to.',
      ),
      minimalForm: 'r* = argmax_r { E_P[产出(r)] − c·r } ，解随扰动分布 P 移动',
      canonicalSubstrates: [
        sub('飞控的多余度', 'Redundancy in a flight control system', '可靠性工程', 'Reliability engineering', 0,
          '同一功能保留三套或四套通道，任意一套失效都不改变输出',
          'three or four channels for one function, any one of which can fail without changing the output',
          '这里的名义冗余度与有效冗余度可以差一个数量级，因为通道之间共用电源、共用软件、或共享同一个设计错误——共因失效把 n 套变回 1 套。所以真正被购买的量不是备份数而是备份之间的独立性，而独立性没法直接数出来。',
          'Nominal and effective redundancy can differ by an order of magnitude here, because channels share a power supply, share software, or share one design error — a common cause turns n channels back into one. What is actually bought is not the number of spares but their independence, and independence cannot be counted directly.'),
        sub('生态系统的功能冗余', 'Functional redundancy in an ecosystem', '生态学', 'Ecology', 1,
          '多个物种承担同一项功能，于是失去其中一个不改变功能的总量',
          'several species doing one job, so losing one of them does not change how much of the job gets done',
          '这里没有人在做这个取舍：冗余是选择的副产品，不是被购买的。所以「位置暴露了预期什么扰动」在这个基底上只能读作演化史上真的反复发生过的扰动，对新型扰动不构成任何保证——一段历史不是一个分布，只是它的一次采样。',
          'Nobody is making the tradeoff here: redundancy is a by-product of selection rather than a purchase. So the reading that a system\'s position reveals the disturbances it expects can only mean the ones that actually recurred in its history, and it guarantees nothing against novel ones — a history is not a distribution, only one sample from it.'),
        sub('库存与准时制生产', 'Inventory against just-in-time production', '运营管理', 'Operations management', 2,
          '被压低的是每单位产出所占用的库存与备用产能',
          'what gets driven down is the inventory and spare capacity tied up per unit of output',
          '这里的两边在会计上不对称：库存成本可见、按季度计量、落在做决定的人身上，而缺货的代价延迟出现且常常落在别人身上。所以观察到的位置反映的是哪一侧成本可见，不是对扰动的真实预期——这是这条结构最容易被反向读错的基底。',
          'The two sides are accounted for asymmetrically here: the cost of inventory is visible, measured quarterly and borne by whoever decides, while a stockout costs late and often lands on someone else. The observed position therefore reflects which costs are visible rather than what disturbance is genuinely expected — the substrate where this structure is most easily read backwards.'),
      ],
      relations: [
        rel('no-free-lunch', 'special-case-of',
          '不存在一种对所有扰动分布都最优的冗余配置，所以这条取舍是无免费午餐把变量取成「扰动」时的形式：「更鲁棒」在指定扰动集之前没有意义，正如「更好的学习算法」在指定问题分布之前没有意义。区别在于这里的分布原则上可以被估计，而估计得有多差恰恰就是脆弱性的来源。',
          'No redundancy setting is optimal against every disturbance distribution, so this tradeoff is the no-free-lunch statement with disturbance as the variable: more robust means nothing until the set of disturbances is named, exactly as a better learning algorithm means nothing until the problem distribution is. The difference is that this distribution can in principle be estimated, and how badly it is estimated is where the fragility comes from.'),
        rel('minimum-viable-size', 'generates',
          '沿着效率端一路精简，就是把每项功能的备份降到一份；走到那一步，系统正好贴在自己的最小可行规模上，此后任一部件失效不再是性能下降而是功能消失。所以这条连续的取舍曲线在它的一端交给一条阶跃，而阶跃到来之前没有预警。',
          'Trimming along the efficiency end means bringing every function down to a single copy, and at that point the system sits exactly on its own minimum viable size: any part failing is no longer degraded performance but a function that is gone. A continuous tradeoff curve hands over to a step at one of its ends, with nothing announcing the step beforehand.'),
      ],
      mistakenFor: bi(
        '常与「冗余总是好的」或它的镜像「冗余总是浪费」混淆，而两句话都跳过了唯一决定答案的输入：扰动分布。第二重混淆是把抗扰与恢复力当成一回事——前者是受扰动时不受影响，后者是受影响之后回得来；备份买前者，恢复力买的是切换、重建与演练。判据是问「它是没被打中，还是被打中之后站起来了」，这两种系统在同一份扰动记录上看起来是一样的。',
        'Routinely confused with the claim that redundancy is always good, or its mirror that redundancy is always waste, when both skip the one input that decides the answer: the disturbance distribution. The second confusion treats robustness and resilience as one thing — not being affected, against coming back after being affected; spares buy the first, while the second is bought with switchover, rebuilding and rehearsal. The test is whether the system was never hit or was hit and got up, because on a record of disturbances alone the two look identical.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/finite-time-dissipation',
    depth: {
      origin: bi(
        '有限时间热力学起于 1975 年 Curzon 与 Ahlborn 的一篇短文：他们算出以最大功率运行的热机效率是 1−√(T_冷/T_热)，低于卡诺效率。这门学科出现的理由是一个工程上的尴尬——卡诺效率作为设计目标毫无用处，因为达到它的机器功率为零——于是研究对象从「极限是多少」换成了「这条取舍曲线长什么样」。',
        'Finite-time thermodynamics starts from a short 1975 paper by Curzon and Ahlborn, who computed the efficiency of a heat engine at maximum power as 1 − √(T_c/T_h), below the Carnot value. The field exists because of an engineering embarrassment — Carnot efficiency is useless as a design target, since a machine that attains it delivers no power — so the object of study shifted from what the limit is to what the tradeoff curve looks like.',
      ),
      minimalForm: '⟨W⟩ − ΔF ≈ 𝓛²/τ  （𝓛 为热力学长度；τ → ∞ 时为零）',
      canonicalSubstrates: [
        sub('以最大功率运行的热机', 'A heat engine run at maximum power', '热力学', 'Thermodynamics', 0,
          '卡诺效率就是那个下界，而它只在无限慢、因而零功率的极限上被达到',
          'the Carnot efficiency is the floor, reached only in the infinitely slow and therefore powerless limit',
          '这里的额外代价主要来自与热源之间的有限速率换热，而不是内部状态跟不上驱动。所以推迟它的旋钮是换热面积与温差，不是放慢过程——同一条曲线在不同的耗散通道上有不同的旋钮。',
          'The excess here comes mostly from finite-rate heat exchange with the reservoirs rather than from internal states lagging the drive. The knob that postpones it is exchanger area and temperature difference, not going slower — the same curve has different knobs in different dissipation channels.'),
        sub('单分子拉伸实验', 'Pulling on a single molecule', '单分子生物物理', 'Single-molecule biophysics', 2,
          '一次拉伸中超出自由能差的那部分功，可以从力—位移曲线下的面积直接读出',
          'the work above the free-energy difference in one pull, read off the area under the force-extension curve',
          '在这个尺度上功是涨落量：单次实验的耗散可以接近零甚至为负，只有系综平均才服从与时长成反比的规律。所以这里的额外耗散是一个要重复几百次才报得出来的数，而重复次数常常由仪器漂移决定。',
          'At this scale work fluctuates: a single pull can dissipate almost nothing or even less than nothing, and only the ensemble average obeys the inverse-duration law. The excess here takes hundreds of repeats to state, and how many happen is usually decided by instrument drift.'),
        sub('芯片的开关能耗与时钟', 'Switching energy and clock rate on a chip', '计算机工程', 'Computer engineering', 1,
          '每次开关允许的充放电时间；绝热开关就是把这段时间拉长以换取更低的能耗',
          'the time allowed for each charge and discharge, which adiabatic switching lengthens in exchange for lower energy',
          '这里的热力学下界低到无关紧要：实际开关能耗几乎全部是电阻性的，比 kT·ln2 高出八九个数量级。起作用的是 RC 充电能否慢到近似可逆——一个电路时间常数问题，和擦除信息没有关系，尽管两者习惯上被放在同一段话里讲。',
          'The thermodynamic floor is irrelevantly low here: real switching energy is almost entirely resistive, eight or nine orders of magnitude above kT·ln2. What matters is whether the RC charging can be made slow enough to be nearly reversible — a circuit time-constant question with nothing to do with erasing information, though the two are habitually discussed in one breath.'),
      ],
      relations: [
        rel('landauer-erasure-cost', 'emerges-from',
          'kT·ln2 是 τ → ∞ 处的值；在有限时间里真实代价是它再加上一项与 1/τ 成正比的余项。这解释了单比特擦除实验的形状：胶体比特要在毫秒量级的慢协议下才逼近那个数，快一个数量级就明显高出——被测到的从来不是下界本身，而是下界加上一段可预测的超出量。',
          'kT·ln2 is the value at infinite duration; in finite time the real cost is that plus a term going as one over the duration. It explains the shape of single-bit erasure experiments: a colloidal bit approaches the number only under millisecond-scale slow protocols and sits visibly above it an order of magnitude faster. What is measured is never the bound itself but the bound plus a predictable excess.'),
        rel('scaling', 'special-case-of',
          '额外耗散随时长的 −1 次幂，本身就是一条标度律——但它是这个家族里少数指数被推导而不是被拟合的：线性响应加上一个几何量就给出 −1。这让它可以反过来当检验用：测到的指数不是 −1，不说明标度关系不成立，而说明系统已经被驱动出了线性响应的范围。',
          'Excess dissipation falling as the inverse first power of duration is itself a scaling law, but one of the few in this family whose exponent is derived rather than fitted: linear response plus a geometric coefficient gives −1. That makes it usable in reverse, as a check — an exponent other than −1 does not mean the scaling relation fails, it means the system has been driven outside linear response.'),
      ],
      mistakenFor: bi(
        '常被误当成摩擦或工艺不佳的同义词，好像把加工做好就能消掉。它不是工艺问题：即使每个部件都无损，只要过程在有限时间内完成，这份超出量依然存在，而且它的大小由走的路径决定——这正是「最优协议」能成为一个有内容的研究对象的原因。第二重混淆是把功率与效率的关系读反：低效率的机器未必慢，而运行在效率极限附近的机器必然接近零功率。',
        'Often taken as a synonym for friction or poor workmanship, as though better manufacturing would remove it. It is not a workmanship problem: even with lossless components the excess remains as long as the process finishes in finite time, and its size depends on the path taken — which is exactly why an optimal protocol is a real object of study. The second confusion reads the power-efficiency relation backwards: an inefficient machine need not be slow, while a machine running near the efficiency limit is necessarily near zero power.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/cognitive-bandwidth-ceiling',
    depth: {
      origin: bi(
        '1956 年 Miller 的《神奇的数字七》常被引成「工作记忆装得下七项」，而那篇文章的要点几乎相反：他指出以比特计的信道容量说法在这里不成立，因为人会把材料重新编码成更大的「块」，而跨度按块计几乎不变。所以这条上限从一开始就被写成一个计数而不是一个信息量。群体规模的版本另有来源——1992 年 Dunbar 对灵长类新皮层比与群体大小做回归，再把这条线外推到人。',
        'Miller\'s 1956 The Magical Number Seven is usually cited for working memory holding seven items, though its point was close to the opposite: a channel capacity measured in bits does not apply here, because people recode material into larger chunks and the span stays roughly fixed when counted in chunks. That is why the ceiling was written as a count rather than as an amount of information. The group-size version has a separate source — Dunbar\'s 1992 regression of neocortex ratio against group size across primates, extrapolated to humans.',
      ),
      canonicalSubstrates: [
        sub('工作记忆的跨度', 'The span of working memory', '认知心理学', 'Cognitive psychology', 0,
          '同时能保持并互相比较的项数，现代估计约四项而不是七项',
          'how many items can be held and compared at once, now put at about four rather than seven',
          '「块」的大小不是固定的：专家把同样的材料重编码成更少的块——棋手记的是局面而不是子。所以这里被约束的是结构的条数而不是信息量，而且这个数对训练敏感，它约束的是当前的编码方式，不是这个人的容量。',
          'A chunk is not a fixed size: an expert recodes the same material into fewer of them, and a chess player remembers positions rather than pieces. What is bound here is a count of structures rather than an amount of information, and because the count responds to training it constrains the current encoding rather than the person.'),
        sub('稳定社会关系的数量', 'How many stable social ties', '人类学', 'Anthropology', 1,
          '维持一条关系所需的时间投入——梳理毛发，或者它在人类中的替代物',
          'the time it takes to keep one tie alive: grooming, or whatever stands in for it among humans',
          '这里的数字是把跨物种回归外推到一个不在拟合样本里的物种得到的点估计，而直接调查测到的关系数分布很宽，从几十到几百。把它当成个体属性去做团队设计，是拿一条关于物种平均的回归线去约束个体。',
          'The number here is a point estimate from extrapolating a cross-species regression to a species outside the fitted sample, while surveys of actual tie counts return a wide distribution, from tens to hundreds. Treating it as a personal attribute for designing teams uses a regression line about species averages to constrain individuals.'),
        sub('缓存与工作集', 'A cache and its working set', '计算机体系结构', 'Computer architecture', 2,
          '容量之外还有一层可以退到的存储，而退下去之后吞吐是断崖而不是斜坡',
          'a further level of storage to fall back to, with throughput dropping off a cliff rather than a slope once it does',
          '缓存的上限是设计者写下的数字，可以直接测、直接改；认知上限只能被推断。把两者放在同一条约束下，断言的是行为形状相同——超限后成批丢失而不是普遍变慢——而不是机制相同，这一步在引用这个类比时经常被悄悄跨过去。',
          'A cache\'s limit is a number the designer wrote down: measurable and changeable. A cognitive limit can only be inferred. Putting the two under one constraint asserts that the behaviour has the same shape, wholesale loss past the limit rather than uniform slowing, and not that the mechanism is the same — a step that tends to get crossed quietly whenever the parallel is drawn.'),
      ],
      relations: [
        rel('scaling', 'emerges-from',
          '群体规模那一版的上限是一条标度律的读数：新皮层比对群体大小的跨物种回归，再外推到一个不在样本里的物种。那个著名的数字因此继承了这条拟合的全部弱点——外推本身，以及一个被引用时几乎总是丢掉的置信区间。工作记忆那一版是直接测的；把两者当成同一个结论的两处证据，等于让一次测量替一次外推背书。',
          'The group-size ceiling is a reading taken off a scaling law: a cross-species regression of neocortex ratio against group size, extrapolated to a species outside the sample. The famous number inherits every weakness of that fit — the extrapolation itself, and a confidence interval almost always dropped when it is quoted. The working-memory ceiling was measured directly, so treating the two as evidence for one conclusion lets a measurement vouch for an extrapolation.'),
        rel('limiting-factor', 'special-case-of',
          '这条上限是最小律里稀缺因子被固定成「同时维持关系的能力」的那一档。它与一般最小律的差别在响应形状：供给补不上时，产出不是停在原处，而是已经维持着的关系开始成批脱落——min 的输出在这里会往回走，所以「维持现状」不是一个可选项。',
          'The ceiling is the law of the minimum with the scarce factor fixed as the capacity to hold relations at once. It departs from the general case in the shape of the response: when that factor cannot be supplied, output does not merely stop rising — ties already held start dropping in batches, so the minimum runs backwards and holding steady is not among the outcomes.'),
        rel('spontaneous-modularity', 'generates',
          '超过上限的群体不会把每条关系都维持得差一点，而是分层：一部分关系被交给子群，人只维持到子群的接口。所以这条上限是模块化的一个来源而不只是一个限制——它也解释了组织的层级深度为什么随规模增长得那么规律。',
          'A group past the ceiling does not keep every tie slightly worse; it splits into levels, handing some ties to a sub-group and keeping only an interface to it. The ceiling is therefore a source of modularity rather than only a limit — and it accounts for how regularly the depth of an organisation\'s hierarchy grows with its size.'),
      ],
      mistakenFor: bi(
        '常被误当成「处理不过来就会变慢」，而这条结构的内容全在响应的形状上：超限之后不是普遍降速，是整条整条地丢——被丢掉的那些甚至不会被察觉，因为察觉本身也要占一个位置。第二重误用是把某个具体数字（七、四、一百五十）当成常数搬去做设计：每个数字都是在特定任务与特定编码下测到的，换一种编码就换一个数；可迁移的从来不是数字，而是「超限后成批丢失」这个形状。',
        'Often taken to mean that an overloaded processor slows down, when the content lies entirely in the shape of the response: past the limit things are dropped whole rather than served more slowly — and what gets dropped may not even be noticed, since noticing takes a slot of its own. The second misuse carries a specific number (seven, four, a hundred and fifty) elsewhere as a design constant, when each was measured under a particular task and encoding and changes with both. What transfers is never the number but the shape: wholesale loss past the limit.',
      ),
    },
  },
];
