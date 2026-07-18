import type {
  ModelFamily,
  ModelFamilyId,
  ModelLaunchContext,
  ModelSubstrate,
  ModelSubstrateId,
} from './types';

const source = (title: string, url: string) => ({ title, url });

const synchronizationSources = {
  fireflies: source('Buck & Buck · Biology of Synchronous Flashing of Fireflies', 'https://doi.org/10.1038/211562a0'),
  applause: source('Néda et al. · Physics of the rhythmic applause', 'https://doi.org/10.1103/PhysRevE.61.6987'),
  grid: source('Ódor et al. · Synchronization dynamics on power grids', 'https://doi.org/10.1103/PhysRevE.106.034311'),
  overview: source('APS Physics · Taking the Pulse', 'https://physics.aps.org/articles/v7/10'),
};

const fieldSources = {
  analogs: source('Feynman Lectures II-12 · Electrostatic Analogs', 'https://www.feynmanlectures.caltech.edu/II_12.html'),
  diffusion: source('Feynman Lectures II-3 · Heat conduction; the diffusion equation', 'https://www.feynmanlectures.caltech.edu/II_03.html'),
};

const substrates: Record<ModelSubstrateId, ModelSubstrate> = {
  fireflies: {
    id: 'fireflies', familyId: 'synchronization',
    title: { zh: '萤火虫闪光', en: 'Firefly flashes' },
    question: { zh: '为什么一群萤火虫会渐渐一起闪？', en: 'Why can a group of fireflies begin flashing together?' },
    entity: { zh: '每只萤火虫的一次闪光周期', en: 'one flash cycle for each firefly' },
    interaction: { zh: '看见别的闪光后，把下一次闪光往群体节奏靠一点', en: 'after seeing other flashes, shift the next flash a little toward the group rhythm' },
    observable: { zh: '同一时刻一起闪的程度', en: 'how closely flashes occur at the same time' },
    boundary: { zh: '真实萤火虫以短脉冲感知邻居，还受空间、遮挡、性别和行为状态影响；全连接连续耦合只是最小近似。', en: 'Real fireflies sense brief pulses and are affected by space, occlusion, sex, and behavioural state; continuous all-to-all coupling is only a minimal approximation.' },
    source: synchronizationSources.fireflies,
  },
  'heart-cells': {
    id: 'heart-cells', familyId: 'synchronization',
    title: { zh: '心脏起搏细胞', en: 'Cardiac pacemaker cells' },
    question: { zh: '节奏略有差异的细胞怎样形成共同心跳？', en: 'How can cells with slightly different rhythms form one heartbeat?' },
    entity: { zh: '每个细胞的兴奋—恢复周期', en: 'the excitation–recovery cycle of each cell' },
    interaction: { zh: '通过细胞间电耦合调整下一次兴奋的时刻', en: 'adjust the timing of the next excitation through electrical coupling between cells' },
    observable: { zh: '细胞群兴奋相位的一致程度', en: 'coherence of excitation phase across the cell population' },
    boundary: { zh: '心肌细胞有膜电位、幅度、阈值和不应期；只保留相位会丢失传导阻滞、波传播和许多病理机制。', en: 'Cardiac cells have membrane voltage, amplitude, thresholds, and refractory periods; a phase-only model omits conduction block, wave propagation, and many disease mechanisms.' },
    source: synchronizationSources.overview,
  },
  applause: {
    id: 'applause', familyId: 'synchronization',
    title: { zh: '观众鼓掌', en: 'Audience applause' },
    question: { zh: '原本杂乱的掌声为什么会突然变齐，又会散开？', en: 'Why can scattered applause suddenly align, then fall apart again?' },
    entity: { zh: '每位观众的一次拍手周期', en: 'one clapping cycle for each audience member' },
    interaction: { zh: '听见周围掌声后调整自己的拍手时刻', en: 'adjust clap timing after hearing the surrounding audience' },
    observable: { zh: '全场掌声落在同一节拍的程度', en: 'how strongly the audience lands on one beat' },
    boundary: { zh: '观众会主动改变速度和音量，也会厌倦或跟随局部人群；固定自然频率的振子没有这些策略。', en: 'People deliberately change tempo and loudness, tire, and follow local groups; oscillators with fixed natural frequencies do not have these strategies.' },
    source: synchronizationSources.applause,
  },
  'power-grid': {
    id: 'power-grid', familyId: 'synchronization',
    title: { zh: '交流电网锁频', en: 'AC grid frequency lock' },
    question: { zh: '分散的发电机怎样维持固定的相对相位？', en: 'How do distributed generators maintain fixed relative phases?' },
    entity: { zh: '每台旋转设备或逆变器的电相位', en: 'the electrical phase of each rotating machine or inverter' },
    interaction: { zh: '输电连接让相位差产生功率交换并拉回共同频率', en: 'transmission links turn phase differences into power exchange that pulls units toward a shared frequency' },
    observable: { zh: '全网相位和频率锁定程度', en: 'the degree of phase and frequency locking across the grid' },
    boundary: { zh: '真实电网有拓扑、惯性、阻尼、功率流约束和保护动作；一阶全连接模型不能判断实际电网是否安全。', en: 'Real grids have topology, inertia, damping, power-flow limits, and protection actions; a first-order all-to-all model cannot establish grid safety.' },
    source: synchronizationSources.grid,
  },
  heat: {
    id: 'heat', familyId: 'shared-field',
    title: { zh: '热传导', en: 'Heat conduction' },
    question: { zh: '一块材料上的冷热差怎样随时间摊开？', en: 'How does a temperature difference spread through a material over time?' },
    entity: { zh: '材料网格上每一点的温度', en: 'temperature at each point of a material grid' },
    interaction: { zh: '每一点按它与相邻点的温差交换热量', en: 'each point exchanges heat according to its difference from neighbours' },
    observable: { zh: '每一点与相邻温度之间的局部不平衡', en: 'local imbalance between each point and its neighbouring temperatures' },
    boundary: { zh: '这里假设材料均匀、各向同性且没有相变或对流；真实导热系数还可能随位置和温度变化。', en: 'This assumes a uniform isotropic material without phase change or convection; real conductivity can vary with position and temperature.' },
    source: fieldSources.diffusion,
  },
  diffusion: {
    id: 'diffusion', familyId: 'shared-field',
    title: { zh: '物质扩散', en: 'Material diffusion' },
    question: { zh: '集中在一点的物质为什么会逐渐铺开？', en: 'Why does material concentrated in one place gradually spread out?' },
    entity: { zh: '网格上每一点的浓度', en: 'concentration at each point of a grid' },
    interaction: { zh: '每一点与相邻点交换物质，局部浓度差被抹平', en: 'each point exchanges material with neighbours, smoothing local concentration differences' },
    observable: { zh: '浓度极差和总量是否守恒', en: 'concentration range and whether total amount is conserved' },
    boundary: { zh: '这里没有流体携带、化学反应、主动运输或空间障碍；那些过程会改变扩散方程。', en: 'This omits advection, chemical reactions, active transport, and spatial barriers, all of which alter the diffusion equation.' },
    source: fieldSources.diffusion,
  },
  electrostatic: {
    id: 'electrostatic', familyId: 'shared-field',
    title: { zh: '静电势', en: 'Electrostatic potential' },
    question: { zh: '给定带电边界后，空间里的电势怎样确定？', en: 'Given charged boundaries, how is electric potential determined in space?' },
    entity: { zh: '空间网格上每一点的电势', en: 'electric potential at each point of a spatial grid' },
    interaction: { zh: '无源位置反复取邻域平均，直到满足边界条件', en: 'source-free points repeatedly take the neighbour average until the boundary conditions are satisfied' },
    observable: { zh: '拉普拉斯残差是否趋近于零', en: 'whether the Laplacian residual approaches zero' },
    boundary: { zh: '迭代步骤是数值求解过程，不是电势随真实时间扩散；电荷源和介电材料也被大幅简化。', en: 'The iterations are a numerical solver, not physical time evolution of potential; charge sources and dielectric materials are also heavily simplified.' },
    source: fieldSources.analogs,
  },
  'steady-flow': {
    id: 'steady-flow', familyId: 'shared-field',
    title: { zh: '理想稳态流', en: 'Ideal steady flow' },
    question: { zh: '给定入口和出口后，理想流动的势场怎样分布？', en: 'Given an inlet and outlet, how is an ideal steady-flow potential distributed?' },
    entity: { zh: '空间网格上每一点的速度势', en: 'velocity potential at each point of a spatial grid' },
    interaction: { zh: '内部点反复与相邻势值协调，直到局部净流入为零', en: 'interior points repeatedly reconcile with neighbouring potentials until local net inflow is zero' },
    observable: { zh: '稳态残差与入口—出口梯度', en: 'steady-state residual and inlet-to-outlet gradient' },
    boundary: { zh: '这个势流近似忽略黏性、涡旋、湍流、可压缩性和真实壁面层；它不等同于一般流体流动。', en: 'This potential-flow approximation omits viscosity, vortices, turbulence, compressibility, and real boundary layers; it is not general fluid flow.' },
    source: fieldSources.analogs,
  },
};

export const MODEL_FAMILIES: readonly ModelFamily[] = [
  {
    id: 'synchronization',
    title: { zh: '许多个体怎样形成同一个节奏', en: 'How many individuals form one rhythm' },
    shortTitle: { zh: '同步', en: 'Synchronization' },
    invitation: { zh: '先让每个个体按自己的节奏走，再决定它能多大程度听见别人。', en: 'Let every individual keep its own rhythm, then decide how strongly it can hear the others.' },
    sharedRule: { zh: '每个个体有自己的相位和速度；它会朝群体当前的平均节奏靠近。', en: 'Each individual has its own phase and speed, and moves toward the group’s current mean rhythm.' },
    entity: { zh: '许多会重复循环的个体', en: 'many individuals that repeat a cycle' },
    perception: { zh: '别的个体现在走到周期的哪里', en: 'where the others currently are in their cycles' },
    update: { zh: '按相位差和影响强度调整自己的下一步', en: 'adjust the next step using phase difference and coupling strength' },
    observable: { zh: '全体相位有多一致（R：0 杂乱，1 同步）', en: 'group phase coherence (R: 0 scattered, 1 synchronized)' },
    equation: 'dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ − θᵢ)',
    equationKey: { zh: 'θ 是个体现在的节奏位置；ω 是它自己的速度；K 是彼此影响多强。', en: 'θ is an individual’s current place in its cycle; ω is its own speed; K is how strongly individuals influence one another.' },
    structureIds: ['struct://xfrontier/synchronization'],
    sources: Object.values(synchronizationSources),
    substrates: [substrates.fireflies, substrates['heart-cells'], substrates.applause, substrates['power-grid']],
  },
  {
    id: 'shared-field',
    title: { zh: '局部差异怎样变成一个空间分布', en: 'How local differences become a spatial field' },
    shortTitle: { zh: '热、扩散与势场', en: 'Heat, diffusion & fields' },
    invitation: { zh: '给每个位置一个数，让它只读取相邻位置；改变边界，看同一局部算法怎样得到不同物理解释。', en: 'Give every location a number and let it read only its neighbours; change the boundaries to see how one local algorithm receives different physical interpretations.' },
    sharedRule: { zh: '每个内部位置反复向邻居平均值靠近；差别在于这个更新代表真实时间，还是求稳态答案的计算步骤。', en: 'Each interior point repeatedly approaches the neighbour average; what changes is whether the update represents physical time or a numerical step toward a steady solution.' },
    entity: { zh: '空间网格上每一点的一个数值', en: 'one value at every point of a spatial grid' },
    perception: { zh: '上、下、左、右四个相邻位置', en: 'the four neighbouring positions: up, down, left, right' },
    update: { zh: '按局部差异向邻域平均值靠近', en: 'move toward the neighbour average according to the local difference' },
    observable: { zh: '空间极差或局部方程残差', en: 'spatial range or local-equation residual' },
    equation: 'u(t + Δt) = u(t) + α · Δₕu(t)',
    equationKey: { zh: 'u 可以解释为温度、浓度、电势或速度势；α 是一次更新走多远，Δₕ 是四邻域差分。', en: 'u can mean temperature, concentration, electric potential, or velocity potential; α is the update size and Δₕ is the four-neighbour difference.' },
    structureIds: [],
    sources: Object.values(fieldSources),
    substrates: [substrates.heat, substrates.diffusion, substrates.electrostatic, substrates['steady-flow']],
  },
];

export const modelFamily = (id: ModelFamilyId): ModelFamily =>
  MODEL_FAMILIES.find((family) => family.id === id) ?? MODEL_FAMILIES[0]!;

export const modelSubstrate = (id: ModelSubstrateId): ModelSubstrate => substrates[id];

export function modelFamilyForStructure(structureId: string | null | undefined): ModelFamilyId | null {
  if (!structureId) return null;
  return MODEL_FAMILIES.find((family) => family.structureIds.includes(structureId))?.id ?? null;
}

export function normalizeModelLaunch(launch?: ModelLaunchContext | null): Required<Pick<ModelLaunchContext, 'familyId'>> & ModelLaunchContext {
  return {
    ...launch,
    familyId: launch?.familyId ?? modelFamilyForStructure(launch?.sourceStructureId) ?? 'synchronization',
  };
}
