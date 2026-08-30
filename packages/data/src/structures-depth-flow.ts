import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureQuantity, StructureRelation } from './structures';

/**
 * Depth for the eight structures of the field-and-flow family: potentials,
 * diffusion, transport, variational principles and feedback.
 *
 * Why these eight belong together. Each is a statement about how a quantity
 * laid out over space or time moves, and the relations between them are, more
 * than in any earlier family, exact rather than analogical. Laplace's equation
 * is the diffusion equation with the clock stopped AND the Euler–Lagrange
 * equation of the Dirichlet energy — one object reached from two members of
 * the family. The heat equation is the gradient flow of entropy in the
 * geometry optimal transport defines (Jordan, Kinderlehrer and Otto, 1998),
 * and optimal transport is itself a least-action principle for a fluid
 * (Benamou and Brenier, 2000). A delayed negative-feedback loop loses its
 * fixed point at gain × delay = π/2 and the period at onset is four times the
 * delay, so delay-induced oscillation is not a neighbour of feedback control
 * but the same loop past one number. Those are filed as identities because
 * they are identities, and the `why` of each states the equation or theorem
 * rather than the resemblance.
 *
 * Two pairs are filed as rivals. Reaction–diffusion and phase separation both
 * turn a uniform mixture into spots, and one picture cannot say which; the
 * test is whether the pattern coarsens. Anomalous and ordinary diffusion are
 * rival readings of one spreading curve, and the exponent that decides is
 * hard to pin on finite data — which is why ordinary diffusion is ALSO filed
 * as a special case of anomalous diffusion: as models one contains the other,
 * as readings of a measurement they compete, and both statements are true.
 *
 * THE ONE WORTH ARGUING OVER is optimal transport against information
 * geometry. Both put a metric on the same space of distributions and disagree
 * about which two are close, so it is filed as competes-with. But they are
 * not rival explanations of an observation so much as rival questions — one
 * counts how much mass is reweighted, the other how far it must move — and a
 * reader could fairly say the right kind is not in the list. It is filed
 * anyway, because anyone choosing a loss function faces exactly that choice
 * and the field has not settled it.
 *
 * Seven of the eight predate wave 4 and carried no declared quantities, so
 * they get them here; delay-induced oscillation already had its three and
 * this file does not touch them. Four of the eight carry thirteen mappings
 * between them, and nothing here adds or moves one.
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

export const FLOW_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/laplace-equation',
    quantities: [
      q('势 φ', 'potential φ', '处处等于邻域平均的那个标量场；它一旦定下，流就由它的梯度给出', 'the scalar field that everywhere equals its neighbourhood average; once fixed, the flow follows from its gradient'),
      q('边界条件', 'boundary data', '唯一决定内部解的全部输入——方程本身在区域内部不含任何信息', 'the only input that determines the interior: the equation carries no information of its own inside the region'),
      q('通量 −k∇φ', 'flux −k∇φ', '势的梯度乘以介质常数，是真正被传导、被推动或被吸引的那个东西', 'the potential\'s gradient times a medium constant: what is actually conducted, pushed or attracted'),
    ],
    depth: {
      origin: bi(
        '18 世纪由拉普拉斯在天体力学中为引力势写下（欧拉更早在无旋流体里得到过同一方程）；傅里叶的热理论与格林 1828 年的静电学各自再次遇到它，19 世纪的狄利克雷问题把它变成了数学分析的核心对象。',
        'Written down by Laplace in the eighteenth century for the gravitational potential in celestial mechanics, after Euler had met the same equation in irrotational fluid flow; Fourier\'s theory of heat and Green\'s 1828 electrostatics each met it again, and the nineteenth-century Dirichlet problem made it a central object of analysis.',
      ),
      minimalForm: '∇²φ = 0  ⟺  δ∫|∇φ|² = 0（狄利克雷原理）',
      canonicalSubstrates: [
        sub('无电荷区域的静电势', 'Electrostatic potential in a charge-free region', '电磁学', 'Electromagnetism', 0,
          '导体表面被固定在给定电压后，空隙中的电势场',
          'the potential in the gap once the conductor surfaces are held at fixed voltages',
          '这是方程的原生基底，但只在无电荷处成立；一有电荷密度它就变成泊松方程——把有源区域的场按拉普拉斯去解，会漏掉全部源项。',
          'This is the home substrate, and it holds only where there is no charge: any charge density turns it into Poisson\'s equation, so solving a sourced region as Laplace drops every source term.'),
        sub('平板中的稳态导热', 'Steady heat conduction in a plate', '传热学', 'Heat transfer', 2,
          '热流密度 −k∇T，板子稳定下来后它无散度',
          'the heat flux −k∇T, divergence-free once the plate has settled',
          '稳态不等于无流：温度不再变，热却一直在流。而稳态要等扩散时间 L²/D 之后才到——在此之前它是热方程，不是拉普拉斯。',
          'Steady does not mean still: the temperature stops changing while heat keeps flowing. And the steady state arrives only after the diffusion time L²/D; before that it is the heat equation, not Laplace.'),
        sub('承压含水层中的地下水', 'Groundwater in a confined aquifer', '水文地质学', 'Hydrogeology', 0,
          '水头 h——达西定律加不可压缩，给出 ∇²h = 0',
          'the hydraulic head h: Darcy\'s law plus incompressibility gives ∇²h = 0',
          '真实含水层的渗透率逐层变化且各向异性，方程实际是 ∇·(K∇h) = 0；把 K 提到算子外面等于假定地层均匀——这在钻孔尺度上几乎从不成立。',
          'Permeability in a real aquifer varies layer by layer and by direction, so the equation is really ∇·(K∇h) = 0; pulling K outside the operator assumes a homogeneous formation, which almost never holds at borehole scale.'),
        sub('翼型周围的势流', 'Potential flow round an aerofoil', '流体力学', 'Fluid dynamics', 2,
          '速度场 ∇φ 本身，无旋且无散',
          'the velocity ∇φ itself, irrotational and divergence-free',
          '纯势流给出零阻力（达朗贝尔佯谬）和零升力；升力要靠人为加入的环量（库塔条件）才出现，而那正是黏性在方程之外做的事——翼型的势流解是补了方程外的物理才有用的。',
          'Pure potential flow gives zero drag (d\'Alembert\'s paradox) and zero lift; lift appears only through circulation added by hand via the Kutta condition, which is what viscosity does outside the equation, so the aerofoil solution is useful only once physics has been supplied from outside it.'),
      ],
      relations: [
        rel('diffusion-equation', 'special-case-of',
          '令 ∂u/∂t = 0，扩散方程就只剩 ∇²u = 0：拉普拉斯是扩散跑到头之后的样子，任何暂态解在 L²/D 量级的时间之后都收敛到它。',
          'Set ∂u/∂t = 0 and nothing of the diffusion equation remains but ∇²u = 0: Laplace is what diffusion looks like after it has finished, and every transient solution converges to it after a time of order L²/D.'),
        rel('least-action-variational-principles', 'special-case-of',
          '拉普拉斯方程恰是狄利克雷能量 ∫|∇φ|² 的欧拉—拉格朗日方程：在边界值给定的函数里让这个泛函取驻值，得到的就是调和函数。黎曼称之为狄利克雷原理，魏尔斯特拉斯指出极小值未必存在，希尔伯特在 1900 年后补上了存在性。',
          'Laplace\'s equation is exactly the Euler–Lagrange equation of the Dirichlet energy ∫|∇φ|²: make that functional stationary among functions with given boundary values and the result is a harmonic function. Riemann called this Dirichlet\'s principle, Weierstrass showed the minimum need not exist, and Hilbert supplied the existence after 1900.'),
        rel('graph-laplacian-spectrum', 'generates',
          '把 ∇² 在网格上离散，得到的矩阵恰是 D − A；「每点等于邻域平均」变成「每个节点等于邻居的平均」，鼓面的最低振动模式变成费德勒向量——图拉普拉斯是这个算子在有限图上的样子，不是借名的类比。',
          'Discretise ∇² on a mesh and the matrix is exactly D − A; "each point equals its neighbourhood average" becomes "each node equals the mean of its neighbours", and a drum\'s lowest vibration mode becomes the Fiedler vector. The graph Laplacian is this operator on a finite graph, not an analogy that borrowed the name.'),
      ],
      mistakenFor: bi(
        '常被误当成「任何平衡的或平滑的场」。它的内容是均值性质：调和函数在区域内部没有极大或极小，每一点都是邻域的平均。判据是找内部极值——场若在内部某处有峰或谷，那里就有源，方程就是泊松而非拉普拉斯。',
        'Commonly mistaken for any equilibrium or smooth field. Its content is the mean-value property: a harmonic function has no interior maximum or minimum, every point being the average of its neighbourhood. The test is to look for an interior extremum — a peak or a trough inside the region means a source is there, and the equation is Poisson\'s rather than Laplace\'s.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/diffusion-equation',
    quantities: [
      q('扩散系数 D', 'diffusion coefficient D', '把时间换算成距离的唯一常数；介质的全部细节都压缩在这一个数里', 'the one constant converting time into distance, with every detail of the medium compressed into that single number'),
      q('密度场 u', 'the density u', '被铺开的那个量：温度、浓度、概率或价格', 'whatever is being spread: temperature, concentration, probability or price'),
      q('扩散长度 √(Dt)', 'the diffusion length √(Dt)', '铺开的距离随时间的平方根增长——这条结构的可观测签名', 'spread grows as the square root of time, the structure\'s observable signature'),
    ],
    depth: {
      origin: bi(
        '1822 年傅里叶为热传导写下并用级数解出；1855 年菲克把同一方程用于溶质；1905 年爱因斯坦（与 1906 年斯莫卢霍夫斯基）证明它是大量独立随机步的宏观极限并给出 D 与温度、黏度的关系，佩兰随后用它测出阿伏伽德罗常数。巴舍利耶早在 1900 年就把它用在了价格上。',
        'Written down and solved by series by Fourier in 1822 for heat; applied by Fick to solutes in 1855; shown by Einstein in 1905 (and Smoluchowski in 1906) to be the macroscopic limit of many independent random steps, with D tied to temperature and viscosity, after which Perrin used it to measure Avogadro\'s number. Bachelier had already applied it to prices in 1900.',
      ),
      minimalForm: '∂u/∂t = D∇²u ;  ⟨x²⟩ = 2dDt',
      canonicalSubstrates: [
        sub('一根杆中的热传导', 'Heat along a rod', '传热学', 'Heat transfer', 0,
          '热扩散率 κ/ρc——导热率除以体积热容',
          'the thermal diffusivity κ/ρc, conductivity over volumetric heat capacity',
          '傅里叶定律让热以无穷大速度传播：杆的远端在 t > 0 的任何时刻都已经「感到」了热源。宏观上无害，但在飞秒激光加热与极低温下必须换成有限速度的双曲方程。',
          'Fourier\'s law lets heat propagate infinitely fast: the far end of the rod has "felt" the source at any t > 0. Harmless macroscopically, it must give way to a finite-speed hyperbolic equation for femtosecond laser heating and at very low temperatures.'),
        sub('胶体粒子的布朗运动', 'Brownian motion of a colloidal particle', '统计物理', 'Statistical physics', 2,
          '单个粒子的均方位移 ⟨x²⟩ = 2Dt，其中 D = kT/6πηa（爱因斯坦—斯托克斯）',
          'one particle\'s mean-squared displacement ⟨x²⟩ = 2Dt, with D = kT/6πηa (Einstein–Stokes)',
          '在比碰撞时间更短的时间里粒子是弹道式的，位移正比于 t 而不是 √t；扩散是粗粒化之后的描述，√(Dt) 只在观测尺度远大于平均自由程时成立。',
          'Below the collision time the particle is ballistic and displacement grows as t, not √t; diffusion is the coarse-grained description, and √(Dt) holds only when the observation scale is far above the mean free path.'),
        sub('Black–Scholes 期权定价', 'Black–Scholes option pricing', '金融数学', 'Mathematical finance', 1,
          '变量替换后期权价格恰好满足热方程，「时间」倒着走——从到期日向今天扩散',
          'after a change of variables the option price satisfies the heat equation exactly, with time running backwards from expiry to today',
          '这里的 D 是波动率 σ²/2，且被假定为常数；真实市场的波动率随价格与时间变化并且自身随机，于是方程精确、参数却是其中最不可靠的那一个。',
          'Here D is the volatility σ²/2, assumed constant; real volatility varies with price and time and is itself random, so the equation is exact while its one parameter is the least reliable thing in it.'),
        sub('神经元的电缆方程', 'The neuronal cable equation', '神经科学', 'Neuroscience', 2,
          '空间常数 λ = √(r_m/r_i)——被动电位沿树突衰减到 1/e 的距离',
          'the space constant λ = √(r_m/r_i), the distance over which a passive potential decays to 1/e along a dendrite',
          '电缆方程是扩散加一个漏项 −V：电荷在铺开的同时也从膜上漏掉，所以信号不是变宽而是变小；一旦膜上有电压门控通道，它就变成反应扩散并产生动作电位。',
          'The cable equation is diffusion plus a leak term −V: charge leaks through the membrane as it spreads, so the signal shrinks rather than broadening. Once the membrane carries voltage-gated channels it becomes reaction–diffusion and produces the action potential.'),
      ],
      relations: [
        rel('anomalous-diffusion', 'special-case-of',
          '普通扩散是步长方差有限、平均等待时间有限时的随机游走极限——中心极限定理起作用，均方位移的指数恰为 1。两个有限性中任一个失效，指数就离开 1，方程就要换成分数阶的。',
          'Ordinary diffusion is the random-walk limit when step variance and mean waiting time are both finite: the central limit theorem applies and the mean-squared-displacement exponent is exactly 1. Lose either finiteness and the exponent leaves 1 and the equation becomes fractional.'),
        rel('optimal-transport', 'emerges-from',
          '热方程是熵在 Wasserstein-2 几何下的梯度流：Jordan、Kinderlehrer 与 Otto 在 1998 年证明，反复求解 ρₖ₊₁ = argmin{∫ρ log ρ + W₂²(ρ, ρₖ)/2τ}，在 τ → 0 时恰好收敛到热方程——扩散就是密度沿最优传输的度量、以最陡的方式降低自身的熵。',
          'The heat equation is the gradient flow of entropy in the Wasserstein-2 geometry: Jordan, Kinderlehrer and Otto showed in 1998 that iterating ρₖ₊₁ = argmin{∫ρ log ρ + W₂²(ρ, ρₖ)/2τ} converges exactly to the heat equation as τ → 0. Diffusion is a density descending its own entropy as steeply as the optimal-transport metric allows.'),
        rel('reaction-diffusion', 'generates',
          '给扩散加上局部反应项 f(u)，这个本来只会抹平梯度的算子就能变成制造图案的那一方：图灵的条件是两种物质以不同速率扩散，此时图案的波长由 √(D/k) 定下——扩散提供尺度，反应提供不稳定。',
          'Add a local reaction term f(u) and the operator that alone can only erase gradients becomes the pattern-maker: Turing\'s condition needs two species diffusing at different rates, and the pattern wavelength is then set by √(D/k), diffusion supplying the scale and the reaction the instability.'),
      ],
      mistakenFor: bi(
        '常被误当成「任何逐渐铺开的过程」。它的判据只有一条：铺开的距离是否随时间的平方根增长。随 t 线性增长的是平流或弹道输运，指数不是 1/2 的是反常扩散——不测这个指数就说「扩散」，只是借了一个词。',
        'Commonly mistaken for any process that gradually spreads. It has one test: whether the spread grows as the square root of time. Linear growth in t is advection or ballistic transport, and an exponent other than 1/2 is anomalous diffusion. Calling something diffusion without measuring that exponent borrows only the word.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/reaction-diffusion',
    quantities: [
      q('扩散系数比 d = D_抑制/D_激活', 'diffusivity ratio d = D_inhibitor/D_activator', '抑制者比激活者快多少；越过临界比值，均匀态才失稳', 'how much faster the inhibitor spreads than the activator; the uniform state loses stability only past a critical ratio'),
      q('局部反应动力学', 'the local kinetics', '激活者自我增强、抑制者由激活者产生并反过来压制它的那组速率', 'the rates by which the activator reinforces itself and the inhibitor, made by the activator, suppresses it'),
      q('图案波长 λ', 'pattern wavelength λ', '由反应速率与扩散系数定下的内禀尺度，不随区域大小变化', 'the intrinsic scale set by reaction rates and diffusivities, independent of the domain size'),
    ],
    depth: {
      origin: bi(
        '1952 年由图灵在《形态发生的化学基础》中提出，用来解释胚胎如何从均匀中产生形状；Gierer 与 Meinhardt 在 1972 年把它整理成「短程激活、长程抑制」的通用形式。实验上直到 1990 年才在一个化学反应里第一次看到。',
        'Proposed by Turing in 1952 in "The Chemical Basis of Morphogenesis" to explain how an embryo produces shape out of uniformity, and cast by Gierer and Meinhardt in 1972 into the general "short-range activation, long-range inhibition" form. It was first seen experimentally only in 1990, in a chemical reaction.',
      ),
      minimalForm: '∂u/∂t = f(u,v) + D_u∇²u,  ∂v/∂t = g(u,v) + D_v∇²v ;  失稳需 D_v/D_u > d_c > 1',
      canonicalSubstrates: [
        sub('CIMA 反应在凝胶中的斑图', 'Turing patterns in the CIMA reaction in a gel', '化学', 'Chemistry', 0,
          '淀粉把碘（激活者）结合住、拖慢它的有效扩散，是实验里让 d 越过临界值的手段',
          'starch binding iodide, the activator, and slowing its effective diffusion is how the experiment pushes d past its critical value',
          '这是 1990 年第一次在实验中看到的图灵斑图，距图灵的预言近四十年——原因正是「抑制者扩散得远快于激活者」在普通溶液里几乎做不到，必须靠凝胶与淀粉人为制造。这条结构的原生基底，反而是最难凑齐条件的。',
          'This was the first Turing pattern seen in an experiment, in 1990, nearly forty years after the prediction — precisely because an inhibitor diffusing far faster than the activator is almost impossible in ordinary solution and had to be manufactured with gel and starch. The structure\'s home substrate is the one where its conditions are hardest to meet.'),
        sub('鱼类体表的条纹', 'Stripes on fish skin', '发育生物学', 'Developmental biology', 2,
          '条纹间距——鱼长大时它不变，而是靠插入新条纹来填满变大的体表',
          'the stripe spacing, which stays fixed as the fish grows, new stripes being inserted to fill the enlarging skin',
          '斑马鱼的「激活者」与「抑制者」不是扩散的分子，而是色素细胞之间通过突起的直接接触；波长由细胞相互作用的距离定下。图灵的数学成立，但「扩散」一词在这里是有效描述而非物理机制。',
          'In zebrafish the activator and inhibitor are not diffusing molecules but pigment cells interacting through direct contact via projections, and the wavelength is set by the reach of those interactions. Turing\'s mathematics holds while "diffusion" here is an effective description rather than the physical mechanism.'),
        sub('半干旱地区的植被条带', 'Vegetation bands in semi-arid land', '生态学', 'Ecology', 1,
          '植被局部聚水而自我增强，同时把周围的水抽走——水在这里扮演「扩散更快的抑制者」',
          'vegetation concentrating water locally and reinforcing itself while drawing water away from its surroundings, water playing the fast-diffusing inhibitor',
          '坡地上水的运动是有方向的平流而不是各向同性扩散，条带因此沿等高线排列并缓慢向上坡迁移——图灵的对称假设被坡度打破，图案的取向来自方程之外。',
          'On a slope water moves by directed advection rather than isotropic diffusion, so the bands align with the contours and slowly migrate uphill: Turing\'s symmetry assumption is broken by the gradient, and the pattern\'s orientation comes from outside the equation.'),
      ],
      relations: [
        rel('diffusion-equation', 'emerges-from',
          '反应扩散是扩散方程加上局部动力学，而图灵的发现是：这个通常只会抹平差异的算子，在两种物质扩散速率相差足够大时反过来放大差异——对均匀扰动稳定的状态，被扩散本身推翻。',
          'Reaction–diffusion is the diffusion equation with local kinetics added, and Turing\'s discovery is that the operator which normally only erases differences amplifies them once two species spread at sufficiently different rates: a state stable to uniform perturbation is toppled by diffusion itself.'),
        rel('phase-separation', 'competes-with',
          '两者都能把均匀混合物变成斑点与条纹，一张图片分不出是哪一个。判据是时间：Cahn–Hilliard 的相分离会不断粗化，畴的尺寸按 t^(1/3) 增长直到只剩两块；图灵斑图有内禀波长，再久也停在那个尺度上。',
          'Both turn a uniform mixture into spots and stripes, and a single picture cannot tell them apart. The test is time: Cahn–Hilliard phase separation coarsens without end, domains growing as t^(1/3) until two remain, while a Turing pattern has an intrinsic wavelength and stays at that scale indefinitely.'),
        rel('graph-laplacian-spectrum', 'emerges-from',
          '在均匀态附近线性化，失稳是一个拉普拉斯本征模一个本征模地判定的：某个模式增长，当且仅当它的本征值落在色散关系的不稳定带里。杆上的波长、网络上的斑图布局，读的都是同一个算子的谱。',
          'Linearise about the uniform state and the instability is decided one Laplacian eigenmode at a time: a mode grows if and only if its eigenvalue falls in the unstable band of the dispersion relation. The wavelength on a rod and the pattern\'s layout on a network are both read off the spectrum of the same operator.'),
      ],
      mistakenFor: bi(
        '最常被误当成「任何周期性的生物图案都是图灵机制」。判据有两条：波长必须由反应与扩散的速率定下、不随区域尺寸变化，并且必须存在扩散更快的抑制者。靠读取梯度获得位置信息而形成的分节（法国旗模型）正相反——它的尺度随胚胎按比例伸缩。',
        'Most often mistaken for the claim that any periodic biological pattern is Turing\'s. Two tests: the wavelength must be set by reaction and diffusion rates and not scale with the domain, and there must be a faster-diffusing inhibitor. Segmentation by reading position off a gradient, the French-flag model, is the opposite case: its scale stretches in proportion with the embryo.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/anomalous-diffusion',
    quantities: [
      q('均方位移指数 α', 'the MSD exponent α', '⟨x²⟩ ∝ t^α：等于 1 是普通扩散，小于 1 是次扩散，大于 1 是超扩散——这一个数就是判决', '⟨x²⟩ ∝ t^α: 1 is ordinary diffusion, below 1 subdiffusion, above 1 superdiffusion, and that one number is the verdict'),
      q('步长尾指数 μ', 'step-length tail exponent μ', 'P(ℓ) ∝ ℓ^(−1−μ)；μ 小于 2 时步长方差无穷大，中心极限定理失效', 'P(ℓ) ∝ ℓ^(−1−μ): below μ = 2 the step variance is infinite and the central limit theorem fails'),
      q('等待时间分布', 'the waiting-time distribution', '两步之间停留多久；平均等待时间无穷大时走者会「变老」，越走越慢', 'how long the walker pauses between steps; with an infinite mean the walker ages, moving ever more slowly'),
    ],
    depth: {
      origin: bi(
        '1926 年理查森在大气湍流中记录下第一个 α ≠ 1 的扩散；1937 年莱维的稳定分布给出方差无穷时的极限定理；1965 年 Montroll 与 Weiss 的连续时间随机游走把重尾等待时间纳入框架，1975 年 Scher 与 Montroll 用它解释了非晶半导体的输运。「莱维飞行」一词出自曼德博 1982 年的书。',
        'Richardson recorded the first diffusion with α ≠ 1 in atmospheric turbulence in 1926; Lévy\'s stable distributions in 1937 supplied the limit theorem for infinite variance; the continuous-time random walk of Montroll and Weiss in 1965 brought heavy-tailed waiting times into the framework, and Scher and Montroll used it in 1975 to explain transport in amorphous semiconductors. The phrase "Lévy flight" is Mandelbrot\'s, from his 1982 book.',
      ),
      minimalForm: '⟨x²(t)⟩ ∝ t^α, α ≠ 1 ;  P(ℓ) ∝ ℓ^(−1−μ), 0 < μ < 2 ⇒ 莱维稳定律',
      canonicalSubstrates: [
        sub('湍流中粒子对的分离', 'Pair separation in turbulence', '大气科学', 'Atmospheric science', 0,
          '理查森 1926 年的观测：两粒烟的距离平方按 t³ 增长，α = 3',
          'Richardson\'s 1926 observation that the squared distance between two smoke particles grows as t³, α = 3',
          '这里的超扩散来自速度场在各尺度上的关联（柯尔莫哥洛夫级串），而不是独立的重尾步长；用莱维飞行去拟合它只是唯象描述，步长分布并不是物理原因。',
          'The superdiffusion here comes from velocity correlations across scales, the Kolmogorov cascade, not from independent heavy-tailed steps; a Lévy-flight fit is phenomenology, and the step distribution is not the physical cause.'),
        sub('非晶半导体中的电荷输运', 'Charge transport in amorphous semiconductors', '凝聚态物理', 'Condensed-matter physics', 2,
          '载流子被陷阱捕获后的释放时间是重尾的，平均无穷大——Scher 与 Montroll 1975 年用它解释光电流的反常衰减',
          'release times from traps are heavy-tailed with an infinite mean, which Scher and Montroll used in 1975 to explain the anomalous decay of photocurrent',
          '陷阱深度有物理上限，所以等待时间的重尾终究被截断：足够长的时间之后输运回到普通扩散。这里的反常是一段很长但有限的过渡区，不是渐近行为。',
          'Trap depths have a physical ceiling, so the heavy tail is eventually truncated: after long enough the transport returns to ordinary diffusion. The anomaly here is a long but finite crossover, not asymptotic behaviour.'),
        sub('细胞质中的单粒子追踪', 'Single-particle tracking in the cytoplasm', '细胞生物学', 'Cell biology', 0,
          '荧光标记的颗粒在拥挤的胞质里以 α ≈ 0.7 左右做次扩散',
          'fluorescently tagged particles subdiffusing at α around 0.7 in the crowded cytoplasm',
          '同一个 α 可以来自两种完全不同的机制——陷阱型的连续时间随机游走会破坏遍历性，黏弹性介质里的分数布朗运动不会。单条轨迹的时间平均均方位移能分开它们，系综平均不能。',
          'The same α can come from two entirely different mechanisms: a trapping continuous-time random walk breaks ergodicity while fractional Brownian motion in a viscoelastic medium does not. The time-averaged MSD of a single trajectory separates them; the ensemble average cannot.'),
        sub('动物觅食路径', 'Animal foraging paths', '行为生态学', 'Behavioural ecology', 1,
          '觅食步长分布的尾指数——「莱维觅食假说」称 μ ≈ 1 在食物稀疏时最优',
          'the tail exponent of foraging step lengths, the Lévy foraging hypothesis holding that μ near 1 is optimal when food is sparse',
          '最初的信天翁数据在 2007 年被发现是记录仪的伪迹，重新分析后不再是幂律；多段指数分布的复合常常拟合得同样好。这条基底上争议的不是机制而是数据本身。',
          'The original albatross data were found in 2007 to be a logger artefact, and on reanalysis were no longer power-law; a composite of exponential walks often fits as well. What is contested on this substrate is not the mechanism but the data.'),
      ],
      relations: [
        rel('diffusion-equation', 'competes-with',
          '同一条测得的铺开曲线，可以读成普通扩散加噪声，也可以读成反常扩散；判决者只有均方位移的指数，而它在有限数据上难以钉住——跨度不足两个数量级的 α 估计不可靠，且普通扩散在过渡区也会短暂偏离 1。',
          'One measured spreading curve can be read as ordinary diffusion plus noise or as anomalous diffusion; the only arbiter is the MSD exponent, and on finite data it is hard to pin down — an estimate of α over fewer than two decades is unreliable, and ordinary diffusion itself departs from 1 during a crossover.'),
        rel('power-laws-scale-free', 'emerges-from',
          '步长服从尾指数 μ < 2 的幂律时，单步方差无穷大，中心极限定理失效，和不再收敛到高斯而收敛到莱维稳定律——超扩散就是幂律步长被累加起来之后的样子。',
          'With step lengths following a power law of tail exponent μ < 2 the single-step variance is infinite, the central limit theorem fails and the sum converges not to a Gaussian but to a Lévy-stable law: superdiffusion is what a power-law step distribution does once it is summed.'),
        rel('scale-separation-failure', 'emerges-from',
          '扩散方程要求步长与等待时间都有可以粗粒化掉的特征尺度；反常扩散正是这两个尺度不存在时随机游走的样子——平均等待时间无穷大，就没有马尔可夫极限，走者记得自己的年龄。',
          'The diffusion equation needs a characteristic step and a characteristic waiting time to coarse-grain over; anomalous diffusion is what a random walk does when neither exists — with an infinite mean waiting time there is no Markov limit, and the walker remembers its age.'),
      ],
      mistakenFor: bi(
        '最常被误当成「非高斯就是反常」。一群各自普通扩散、但 D 各不相同的粒子，系综上会给出非高斯的位移分布，甚至在过渡区给出 α ≠ 1，而每一个粒子都完全正常。判据是单轨迹的时间平均均方位移：它的指数是否也偏离 1，以及不同轨迹之间是否散开。',
        'Most often mistaken for "non-Gaussian means anomalous". A population of particles each diffusing ordinarily but with different D gives a non-Gaussian displacement distribution in the ensemble, and even α ≠ 1 during a crossover, while every particle is perfectly normal. The test is the time-averaged MSD of single trajectories: whether its exponent also departs from 1, and whether it scatters between trajectories.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/optimal-transport',
    quantities: [
      q('地面代价 c(x,y)', 'the ground cost c(x,y)', '把一单位质量从 x 搬到 y 的代价；它决定几何，换一个代价就换一个距离', 'what moving one unit of mass from x to y costs; it fixes the geometry, and changing it changes the distance'),
      q('传输方案 π', 'the transport plan π', '哪些质量去了哪里；坎托罗维奇允许一处质量分拆到多处，问题因此成为线性规划', 'which mass goes where; Kantorovich\'s allowing one source to split among several targets is what makes the problem a linear programme'),
      q('传输距离 W_p', 'the transport distance W_p', '最小总代价本身：两个分布之间的一个度量，而它的测地线就是从一个变成另一个的路径', 'the least total cost itself: a metric between two distributions whose geodesic is the path from one to the other'),
    ],
    depth: {
      origin: bi(
        '1781 年蒙日为土方工程提出「挖填」问题；1942 年坎托罗维奇允许质量分拆，把它变成线性规划并给出对偶（1975 年因此获诺贝尔经济学奖）；1991 年 Brenier 证明二次代价下的最优映射是一个凸函数的梯度，此后它成为概率分布之间的几何。',
        'Posed by Monge in 1781 as the earthworks problem; turned by Kantorovich in 1942 into a linear programme with a dual by allowing mass to split (his 1975 Nobel in economics); shown by Brenier in 1991 to have, for quadratic cost, an optimal map that is the gradient of a convex function, after which it became the geometry of probability distributions.',
      ),
      minimalForm: 'W_p(μ,ν)^p = inf_{π∈Π(μ,ν)} ∫c(x,y) dπ ;  W₂² = min ∫∫ρ|v|² dx dt（Benamou–Brenier）',
      canonicalSubstrates: [
        sub('蒙日的挖填土方', 'Monge\'s earthworks', '土木工程', 'Civil engineering', 0,
          '一铲土从挖方点搬到填方点的距离（蒙日用的是距离本身而不是它的平方）',
          'the distance a shovel of earth travels from cut to fill, Monge\'s cost being the distance itself rather than its square',
          '蒙日不许拆分——每一铲土只能去一个地方——于是问题非线性且可能无解；线性代价还让最优方案不唯一。这条结构的原生问题恰恰是最难解的版本。',
          'Monge forbade splitting — each shovelful goes to exactly one place — so the problem is nonlinear and may have no solution, and a linear cost makes the optimum non-unique. The structure\'s original problem is precisely its hardest version.'),
        sub('坎托罗维奇的生产调配', 'Kantorovich\'s production allocation', '经济学', 'Economics', 1,
          '把各工厂的产出分配到各消费地的方案；对偶变量是每个地点的影子价格',
          'the plan assigning each factory\'s output to each consuming site, with the dual variables as shadow prices at each location',
          '这里的「质量」是可分的商品，拆分不是数学上的放松而是物理事实；但对偶价格只在最优方案上有意义，把它读成市场价格是把规划的内部量当成了观测量。',
          'Here the mass is a divisible commodity and splitting is a physical fact rather than a mathematical relaxation; but the dual prices mean something only at the optimum, and reading them as market prices takes a planner\'s internal quantity for an observation.'),
        sub('比较两张图像的直方图', 'Comparing two image histograms', '计算机视觉', 'Computer vision', 2,
          '推土机距离——把一个颜色直方图搬成另一个的最小代价，比逐格相减更接近人眼',
          'the earth mover\'s distance, the least cost of moving one colour histogram into another, which matches perception better than bin-by-bin subtraction',
          '精确解对 n 个格子是 O(n³)，实际算的几乎都是 Sinkhorn 熵正则化后的版本——那是一个被模糊过的、不满足三角不等式的量，与真正的 W_p 之差由正则化参数决定。',
          'The exact solution is O(n³) in the number of bins, so what is actually computed is nearly always the Sinkhorn entropic regularisation — a blurred quantity that does not satisfy the triangle inequality, and whose gap from the true W_p is set by the regularisation parameter.'),
        sub('宇宙早期结构的重建', 'Reconstructing the early universe', '宇宙学', 'Cosmology', 1,
          '把今天星系的位置搬回初始时刻的近均匀分布，二次代价最小的方案就是引力把它们送来的那条路',
          'moving today\'s galaxy positions back to the near-uniform initial distribution, the least-quadratic-cost plan being the path gravity took to bring them here',
          '这依赖 Zel\'dovich 近似下轨迹不相交；一旦壳层交叉形成多流区，最优传输映射就不再等于真实动力学——重建在星系团内部失效。',
          'This relies on trajectories not crossing under the Zel\'dovich approximation; once shell-crossing produces multi-stream regions the optimal map stops being the actual dynamics, and the reconstruction fails inside clusters.'),
      ],
      relations: [
        rel('least-action-variational-principles', 'special-case-of',
          'Benamou 与 Brenier 在 2000 年把 W₂ 改写成一个流体的最小作用量：在满足连续性方程的全部密度—速度对里，取动能 ∫∫ρ|v|² 最小的那个，其值恰是 W₂²。最优传输的测地线就是无压流体走最省力的路。',
          'Benamou and Brenier in 2000 rewrote W₂ as the least action of a fluid: over all density–velocity pairs obeying the continuity equation, the one with least kinetic energy ∫∫ρ|v|² has value exactly W₂². An optimal-transport geodesic is a pressureless fluid taking the path of least effort.'),
        rel('information-geometry', 'competes-with',
          '两者给同一个概率分布空间装上不同的度量，对「这两个分布近不近」给出相反的答案：Fisher–Rao 只数有多少质量被重新加权，Wasserstein 还数它必须搬多远——一个稍微平移的分布在前者看来很远，在后者看来很近。一个学习问题该用哪个几何并无定论，Wasserstein–Fisher–Rao 度量正是因为定不下来才被造出来。',
          'The two put different metrics on the same space of distributions and give opposite answers to whether two distributions are close: Fisher–Rao counts only how much mass is reweighted, Wasserstein also how far it must move, so a slightly shifted distribution is far in one and near in the other. Which geometry a learning problem should carry is unsettled, and the Wasserstein–Fisher–Rao metric was built precisely because it could not be settled.'),
        rel('diffusion-equation', 'generates',
          '用 W₂ 做步长惩罚、以熵为目标，一步一步做最小化——Jordan、Kinderlehrer 与 Otto 1998 年证明这个离散格式在步长趋零时给出的正是热方程。最优传输不只度量分布之间的距离，它的梯度流产生了扩散。',
          'Take W₂ as the step penalty and entropy as the objective and minimise step by step: Jordan, Kinderlehrer and Otto showed in 1998 that this discrete scheme yields exactly the heat equation as the step goes to zero. Optimal transport does not merely measure distance between distributions; its gradient flow produces diffusion.'),
      ],
      mistakenFor: bi(
        '常被误当成「又一个分布之间的散度」。判据是把两个支撑集不相交的分布中的一个平移一点：KL 散度不变（始终无穷大），Wasserstein 距离随平移量连续变化。前者对样本空间的几何一无所知，后者由地面代价把几何带了进来——这也是它能给出可用梯度的原因。',
        'Commonly mistaken for one more divergence between distributions. The test is to shift one of two distributions with disjoint supports slightly: the KL divergence does not move (it stays infinite) while the Wasserstein distance changes continuously with the shift. The former knows nothing of the sample space\'s geometry; the latter carries it in through the ground cost, which is also why it yields usable gradients.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/least-action-variational-principles',
    quantities: [
      q('作用量 S[q]', 'the action S[q]', '给每条可能路径打一个数的泛函；自然走的是让它取驻值的那条', 'the functional assigning one number to every possible path; nature takes the one that makes it stationary'),
      q('被变分的路径 q(t)', 'the varied path q(t)', '两端固定、中间任意的候选路径；变分是对整条路径做的，不是对某一时刻', 'a candidate path with both ends fixed and everything between free; the variation is of the whole path, not of any single instant'),
      q('拉格朗日量 L', 'the Lagrangian L', '作用量的被积函数；它一旦写下，运动方程就由欧拉—拉格朗日方程机械地导出', 'the integrand of the action; once written down, the equations of motion follow mechanically from Euler–Lagrange'),
      q('对称性与守恒量', 'symmetry and its conserved quantity', '诺特定理：作用量的每一个连续对称性对应一条守恒律', 'Noether\'s theorem: each continuous symmetry of the action yields one conservation law'),
    ],
    depth: {
      origin: bi(
        '1662 年费马为光提出最短时间原理；1744 年莫佩尔蒂与欧拉把它推广为力学的最小作用量，拉格朗日在 1760 年代给出变分法，哈密顿在 1834–35 年给出现在的形式；1918 年诺特证明对称性与守恒律的对应；1948 年费曼的路径积分解释了自然为什么「知道」驻值路径——所有路径都走了，只有它没有被相位抵消。',
        'Fermat proposed least time for light in 1662; Maupertuis and Euler extended it to least action in mechanics in 1744, Lagrange supplied the calculus of variations in the 1760s and Hamilton the present form in 1834–35; Noether proved the symmetry–conservation correspondence in 1918; and Feynman\'s 1948 path integral explained why nature "knows" the stationary path — every path is taken, and only that one is not cancelled by phase.',
      ),
      minimalForm: 'δS = 0,  S = ∫L(q, q̇, t) dt  ⇒  d/dt(∂L/∂q̇) = ∂L/∂q',
      canonicalSubstrates: [
        sub('费马的光程原理', 'Fermat\'s principle in optics', '几何光学', 'Geometrical optics', 0,
          '光程 ∫n ds——光线走的是让它取驻值的路径',
          'the optical path length ∫n ds, the ray taking the path that makes it stationary',
          '驻值不等于极小：经曲面镜反射的光程可以是极大值。而它只是波动光学的短波极限——所有路径都有贡献，驻值路径是相位相消之后唯一的幸存者。原理成立，「最小」这个词不成立。',
          'Stationary is not minimal: the optical path via a curved mirror can be a maximum. And it is only the short-wave limit of wave optics — every path contributes, and the stationary one is the sole survivor after the phases cancel. The principle holds; the word "least" does not.'),
        sub('哈密顿原理下的质点', 'A particle under Hamilton\'s principle', '经典力学', 'Classical mechanics', 2,
          'L = T − V，动能减势能；欧拉—拉格朗日方程给出牛顿第二定律',
          'L = T − V, kinetic minus potential energy, with Euler–Lagrange returning Newton\'s second law',
          '变分问题固定两端位置而不是初始位置与速度——它是边值问题，而力学实验做的是初值问题；两者在存在共轭点时不等价，同一对端点可以对应多条驻值路径。',
          'The variational problem fixes the positions at both ends rather than the initial position and velocity: it is a boundary-value problem while mechanics experiments run initial-value ones, and the two part company at conjugate points, where one pair of endpoints admits several stationary paths.'),
        sub('爱因斯坦—希尔伯特作用量', 'The Einstein–Hilbert action', '广义相对论', 'General relativity', 3,
          '作用量在坐标变换下不变，诺特给出的守恒量是协变的能动张量守恒 ∇_μT^μν = 0',
          'the action\'s invariance under coordinate changes, Noether\'s conserved quantity being the covariant conservation ∇_μT^μν = 0',
          '对有边界的时空，作用量必须加上 Gibbons–Hawking–York 边界项，否则变分原理根本给不出爱因斯坦方程；而诺特在这里给出的「能量」不是局域可定义的量——引力能没有局部密度。',
          'For a spacetime with boundary the action needs the Gibbons–Hawking–York term or the variational principle does not yield Einstein\'s equations at all; and the energy Noether delivers here is not locally definable — gravitational energy has no local density.'),
        sub('庞特里亚金最大值原理', 'Pontryagin\'s maximum principle', '控制理论', 'Control theory', 1,
          '被变分的是控制函数 u(t)，代价泛函取最小',
          'what is varied is the control function u(t), and the cost functional is minimised',
          '控制量受约束（推力有上限），最优解常常整段停在约束边界上，那里 δS = 0 根本不成立——所以它是「最大值原理」而非驻值条件，bang-bang 控制就是变分法在自己的假设之外仍然给出答案的例子。',
          'The control is constrained (thrust has a ceiling) and the optimum often sits on the constraint boundary for whole stretches, where δS = 0 simply does not hold — hence a "maximum principle" rather than a stationarity condition, and bang-bang control is the calculus of variations still answering outside its own assumptions.'),
      ],
      relations: [
        rel('negative-feedback-control', 'generates',
          '把二次代价的最优控制问题解出来，答案不是一条轨迹而是一条反馈律：u = −Kx，增益 K 由黎卡提方程给出——变分原理直接制造了负反馈，并且给出的是它的最优增益。',
          'Solve the optimal-control problem with a quadratic cost and the answer is not a trajectory but a feedback law: u = −Kx with the gain K given by the Riccati equation. The variational principle manufactures negative feedback directly, and hands over its optimal gain.'),
        rel('maximum-entropy-inference', 'generates',
          '最大熵是变分法作用在分布上而不是路径上：泛函是 −Σp log p，约束以拉格朗日乘子进入，驻值条件给出的就是指数族——乘子 λ_k 起的作用与受约束力学里的乘子完全相同。',
          'Maximum entropy is the calculus of variations run on a distribution instead of a path: the functional is −Σp log p, the constraints enter as Lagrange multipliers, and the stationarity condition is what yields the exponential family, the multipliers λ_k playing exactly the role they play in constrained mechanics.'),
        rel('gauge-equivariance', 'generates',
          '要求作用量在每一点各自独立的变换下不变，原来的作用量做不到；为恢复不变性必须补进一个新场，它就是规范场——韦尔与杨—米尔斯的做法，是让变分原理在局域对称性的要求下自己长出相互作用。',
          'Demand that the action be invariant under a transformation chosen independently at each point and the original action cannot comply; the new field that must be added to restore invariance is the gauge field. Weyl\'s and Yang–Mills\' procedure lets the variational principle grow an interaction of its own under a local-symmetry demand.'),
      ],
      mistakenFor: bi(
        '最常被读成目的论——「自然想要最小化什么」。判据是费曼的路径积分：所有路径都被走了，驻值路径只是相位相消后的幸存者；而且它常常不是极小而是鞍点。任何把「最小」读成「意图」的解释，都把一个关于相干性的事实读成了关于动机的事实。',
        'Most often read as teleology — nature "wanting" to minimise something. The test is Feynman\'s path integral: every path is taken, and the stationary one is merely the survivor of phase cancellation; it is moreover often a saddle rather than a minimum. Any reading of "least" as intention has turned a fact about coherence into a fact about motive.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/negative-feedback-control',
    quantities: [
      q('设定点 r', 'the setpoint r', '回路要守住的目标值；它来自回路之外', 'the target the loop holds; it comes from outside the loop'),
      q('误差 e = r − y', 'the error e = r − y', '回路唯一读取的量；控制只作用于偏差，从不作用于偏差的原因', 'the only quantity the loop reads; control acts on the deviation, never on its cause'),
      q('回路增益 K', 'the loop gain K', '每单位误差换来多大修正；越大守得越紧，也越接近振荡', 'how much correction per unit of error; larger holds tighter and sits closer to oscillation'),
      q('扰动 d', 'the disturbance d', '回路存在的理由：它把输出推开，回路把它推回', 'the loop\'s reason to exist: it pushes the output away and the loop pushes it back'),
    ],
    depth: {
      origin: bi(
        '1788 年瓦特的离心调速器是第一个被广泛使用的负反馈装置，麦克斯韦 1868 年的《论调速器》第一次分析它的稳定性；1927 年布莱克在贝尔实验室发明负反馈放大器，奈奎斯特 1932 年与波德 1940 年代给出稳定性判据；生理学上贝尔纳的「内环境」与坎农 1932 年的「稳态」，加上维纳 1948 年的控制论，把它变成跨领域的语言。',
        'Watt\'s centrifugal governor of 1788 was the first widely used negative-feedback device, and Maxwell\'s "On Governors" of 1868 the first analysis of its stability; Black invented the negative-feedback amplifier at Bell Labs in 1927, and Nyquist in 1932 and Bode in the 1940s supplied the stability criteria; Bernard\'s milieu intérieur and Cannon\'s homeostasis of 1932 in physiology, with Wiener\'s cybernetics of 1948, made it a language shared across fields.',
      ),
      minimalForm: 'u = −K·e,  e = r − y ;  y/r = KG/(1+KG),  灵敏度 S = 1/(1+KG)',
      canonicalSubstrates: [
        sub('恒温器', 'A thermostat', '控制工程', 'Control engineering', 1,
          '室温与设定温度之差，触发加热器的开与关',
          'the gap between room and set temperature, switching the heater on and off',
          '开关式控制没有连续的增益，它在设定点附近必然来回摆动（继电器振荡），死区宽度而不是 K 决定摆幅——线性回路的稳定性分析在这里要换成描述函数。',
          'On–off control has no continuous gain and necessarily hunts around the setpoint (relay oscillation), the width of the dead band rather than K setting the swing; linear stability analysis has to give way to describing functions here.'),
        sub('血糖调节', 'Blood-glucose regulation', '生理学', 'Physiology', 3,
          '一餐饭是扰动，胰岛素把血糖推回；胰高血糖素从另一侧推',
          'a meal is the disturbance and insulin pushes glucose back, with glucagon pushing from the other side',
          '设定点本身会被调节：长期高糖会让它上移，这是回路之外的慢变量在改写目标。而糖尿病里的「负反馈失灵」多数不是增益变小，而是执行器（胰岛素敏感性）失效——诊断要分清是回路坏了还是执行器坏了。',
          'The setpoint is itself regulated: chronic high glucose shifts it upward, a slow variable outside the loop rewriting the target. And most diabetes is not a smaller gain but a failed actuator (insulin sensitivity) — diagnosis has to tell a broken loop from a broken actuator.'),
        sub('布莱克的负反馈放大器', 'Black\'s negative-feedback amplifier', '电子学', 'Electronics', 2,
          '闭环增益 A/(1+Aβ) 在 Aβ ≫ 1 时趋于 1/β——放大器自身的增益变得无关紧要',
          'the closed-loop gain A/(1+Aβ) tending to 1/β once Aβ ≫ 1, so the amplifier\'s own gain stops mattering',
          '这是负反馈最纯粹的收益——用多余的增益换取对元件的不敏感——但奈奎斯特 1932 年证明代价是相位：回路里每一级的延迟都在把反馈推向正的一侧，高频下同一个回路会自激。',
          'This is negative feedback\'s purest payoff, trading surplus gain for insensitivity to the components, but Nyquist showed in 1932 that the price is phase: every stage of delay in the loop pushes the feedback towards positive, and at high frequency the same loop oscillates on its own.'),
        sub('行星辐射的普朗克反馈', 'The Planck feedback of a planet', '气候科学', 'Climate science', 0,
          '没有人设的设定点——「目标」是辐射收支平衡，地表越热向外辐射越多，这就是把温度拉回去的负反馈',
          'no setpoint set by anyone: the "target" is radiative balance, a warmer surface radiating more and that being the negative feedback that pulls temperature back',
          '气候里正反馈（水汽、冰反照率）与负反馈并存，净反馈参数是它们的和；回路没有控制器，只有物理。用「控制」的语言谈它，是在描述一个没人调 K 的回路——增益由物理常数给定，不能被设计。',
          'Climate holds positive feedbacks (water vapour, ice albedo) alongside negative ones, and the net feedback parameter is their sum; the loop has no controller, only physics. Control language here describes a loop in which nobody tunes K — the gain is fixed by physical constants and cannot be designed.'),
      ],
      relations: [
        rel('delay-induced-oscillation', 'generates',
          '一阶回路 ẋ = −K x(t−τ) 恰在 Kτ = π/2 处失稳：一对本征值穿过虚轴，稳态换成周期约为 4τ 的振荡（Hopf 分岔）。同一个回路，增益乘时滞越过一个数，就从守住设定点变成绕着它转。',
          'The first-order loop ẋ = −K x(t−τ) loses stability at exactly Kτ = π/2: a pair of eigenvalues crosses the imaginary axis and the steady state gives way to an oscillation of period about 4τ (a Hopf bifurcation). One loop, and once gain times delay crosses one number it stops holding the setpoint and circles it instead.'),
        rel('recursive-bayesian-filter', 'explains',
          '滤波器的修正步 x̂ += K(z − Hx̂) 是一个闭合在估计误差上、而不是闭合在对象上的负反馈回路：误差服从自己的线性动力学，滤波器收敛当且仅当这个回路稳定。分离定理进一步说，一个完整的控制器就是两个各自设计的回路——观测器与调节器。',
          'The filter\'s correction x̂ += K(z − Hx̂) is a negative-feedback loop closed on the estimation error rather than on the plant: the error obeys its own linear dynamics, and the filter converges exactly when that loop is stable. The separation theorem then says a full controller is two such loops designed independently, the observer and the regulator.'),
        rel('slow-variable-creep', 'generates',
          '一个正常工作的回路正是让慢变量看不见的东西：它靠花费控制量把输出钉在设定点上，而控制量——胰岛素分泌、水库水位、控制棒位置——就是那个没人读的慢变量，直到执行器饱和、回路一下子失效。',
          'A working loop is exactly what makes the slow variable invisible: it holds the output at the setpoint by spending control effort, and the effort — insulin output, reservoir level, control-rod position — is the slow variable nobody reads, until the actuator saturates and the loop fails all at once.'),
      ],
      mistakenFor: bi(
        '常被误当成「任何会回到原处的系统」——阻尼、回归均值、稳定平衡都会回去。负反馈的判据是对回路之外的东西不敏感：改变对象的增益或加一个新扰动，输出仍守在设定点，那才是反馈；一个阻尼良好的开环系统在对象变了之后会稳定地停在错的地方。',
        'Commonly mistaken for any system that returns to where it was — damping, regression to the mean and stable equilibrium all do that. The test for feedback is insensitivity to what lies outside the loop: change the plant\'s gain or add a new disturbance and the output still holds the setpoint. A well-damped open-loop system settles stably in the wrong place once the plant changes.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/delay-induced-oscillation',
    depth: {
      origin: bi(
        '1942 年米诺尔斯基在船舶稳定装置里遇到它；1948 年哈钦森把时滞写进逻辑斯谛方程解释种群振荡，1950 年海斯给出线性时滞方程的完整稳定判据；1965 年古德温给出基因调控的振荡模型，1977 年 Mackey 与 Glass 用它解释周期性血液病，「动力学疾病」一词由此而来。',
        'Minorsky met it in ship stabilisers in 1942; Hutchinson put a delay into the logistic equation in 1948 to explain population cycles, and Hayes gave the complete stability criterion for the linear delay equation in 1950; Goodwin\'s 1965 model brought it into gene regulation, and Mackey and Glass used it in 1977 to explain periodic blood diseases, which is where the phrase "dynamical disease" comes from.',
      ),
      minimalForm: 'ẋ = −K x(t−τ) 稳定 ⟺ Kτ < π/2 ;  临界处周期 = 4τ',
      canonicalSubstrates: [
        sub('Mackey–Glass 的血细胞生成', 'Mackey–Glass haematopoiesis', '生理学', 'Physiology', 0,
          '从骨髓接到信号到成熟血细胞进入循环的几天延迟',
          'the several-day lag from the marrow receiving its signal to mature cells entering the circulation',
          '时滞在这里不是一个数而是一个分布（细胞成熟时间有散布），分布越宽振荡越难起；而临床上周期性中性粒细胞减少症的周期约 21 天，比「四倍时滞」更长——反馈的非线性形状而非纯时滞决定周期。',
          'The delay here is a distribution rather than a number (maturation times are spread), and the wider the spread the harder oscillation is to start; and clinical cyclic neutropenia has a period of about 21 days, longer than "four times the delay" — the nonlinear shape of the feedback, not the bare delay, sets the period.'),
        sub('尼科尔森的丽蝇种群', 'Nicholson\'s blowflies', '种群生态学', 'Population ecology', 1,
          '成虫密度对下一代出生率的抑制强度——拥挤越狠，回路增益越大',
          'how strongly adult density suppresses the next generation\'s births: the harsher the crowding, the larger the loop gain',
          '时滞是发育期，由生物学固定，能调的只有食物供给即增益；尼科尔森 1954 年的实验是在恒定环境下做的，野外的季节强迫会把内生振荡与外来周期混在一起，周期不再能反推时滞。',
          'The delay is the developmental period, fixed by biology, and only the food supply, i.e. the gain, can be tuned; Nicholson\'s 1954 experiments ran in a constant environment, while seasonal forcing in the field mixes the endogenous oscillation with an external cycle, and the period no longer reads back to the delay.'),
        sub('Hes1 基因的转录振荡', 'Transcriptional oscillation of Hes1', '分子生物学', 'Molecular biology', 2,
          '约两小时的周期——蛋白抑制自身的转录，而转录、剪接、翻译与核输出加起来约需半小时',
          'a period of about two hours, the protein repressing its own transcription while transcription, splicing, translation and nuclear export together take about half an hour',
          '单细胞里振荡是持续的，群体平均却在几个周期内衰减——不是振荡停了，而是细胞之间失去了相位一致。用群体测量去检验时滞振荡，会把去同步误读成阻尼。',
          'In single cells the oscillation persists while the population average decays within a few cycles — not because the oscillation stops but because cells lose phase coherence. Testing delay oscillation on population measurements misreads desynchronisation as damping.'),
        sub('带长水管的淋浴', 'A shower with a long pipe', '控制工程', 'Control engineering', 0,
          '拧龙头到水温变化之间的传输延迟',
          'the transport delay between turning the tap and the temperature changing',
          '这里的控制器是人，而人会学习：几次过冲之后就会等一等再拧。固定增益的模型只描述第一分钟；之后回路的 K 被自适应地调小，振荡消失不是因为时滞变了，而是因为控制者变了。',
          'The controller here is a person, and a person learns: after a few overshoots they wait before turning again. A fixed-gain model describes only the first minute; after that the loop\'s K is adaptively reduced, and the oscillation disappears not because the delay changed but because the controller did.'),
      ],
      relations: [
        rel('negative-feedback-control', 'emerges-from',
          '它不是一种新的回路，而是同一个负反馈回路在增益乘时滞越过 π/2 之后的样子：Hopf 分岔处一对本征值穿过虚轴，守住设定点的能力被换成绕着它转的周期，而周期在临界处恰为时滞的四倍。',
          'It is not a new kind of loop but the same negative-feedback loop once gain times delay crosses π/2: at the Hopf bifurcation a pair of eigenvalues crosses the imaginary axis, the ability to hold the setpoint is exchanged for a period of circling it, and at onset that period is exactly four times the delay.'),
        rel('critical-slowing-down', 'generates',
          '把 Kτ 缓慢推向 π/2，扰动之后的衰减率趋于零，振铃越拖越长——Hopf 起振也产生临界慢化的前兆。但功率集中在振荡频率而不是零频，一阶自相关可能不升反降；分开折叠分岔与 Hopf 分岔，要看功率谱的峰而不只是方差。',
          'Push Kτ slowly towards π/2 and the decay rate after a perturbation goes to zero, the ringing lasting ever longer: a Hopf onset produces the precursor too. But the power concentrates at the oscillation frequency rather than at zero, and lag-1 autocorrelation may fall rather than rise; telling a fold from a Hopf needs the peak of the power spectrum, not variance alone.'),
        rel('bullwhip-amplification', 'generates',
          '供应链的每一层都是对自己库存做负反馈的回路，修正要等运输时滞之后才到；这一层的过冲，恰是上游那一层看到的「需求」。牛鞭是时滞振荡沿链条一层层复合的样子——一个回路的输出成了下一个回路的扰动。',
          'Each tier of a supply chain is a negative-feedback loop on its own inventory whose correction arrives only after the shipping delay, and this tier\'s overshoot is exactly what the tier upstream sees as "demand". The bullwhip is delay-induced oscillation compounded along a chain, one loop\'s output becoming the next loop\'s disturbance.'),
      ],
      mistakenFor: bi(
        '常被误当成「任何周期性行为都是时滞造成的」。判据是时滞与周期的关系：时滞振荡的周期约为时滞的四倍并随时滞变化，而由外部周期驱动或由二维极限环（如捕食者—猎物）产生的振荡，周期与任何延迟无关。把延迟从回路里拿掉、振荡随之消失，才是这条结构。',
        'Commonly mistaken for the claim that any periodic behaviour is caused by delay. The test is the relation between delay and period: a delay-induced oscillation has a period of about four times the delay that moves with it, while oscillation driven by an external cycle or produced by a two-dimensional limit cycle (predator–prey, say) has a period unrelated to any lag. Remove the delay from the loop and the oscillation goes with it — that is this structure.',
      ),
    },
  },
];
