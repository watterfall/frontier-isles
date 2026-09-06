import type { ExplorationCatalog, QuestionCollision } from '@frontier-isles/data/xfrontier-exploration';

/** Editorial lenses, not a claim that their members share a mechanism.
 * Question IDs and every drawn source edge are checked against the MCP catalog. */
export const COLLISION_THEMES = [
  { id: 'emergence', title: ['秩序如何出现', 'How order emerges'], domains: ['物理 · 生命 · 地球', 'Physics · Life · Earth'], invitation: ['从一团细胞到一颗行星，局部变化何时成为整体的转变？', 'From cells to planets, when does local change become a transition of the whole?'],
    ids: ['GQ-why-is-more-different-and-how', 'GQ-how-does-a-single-fertilized-egg', 'GQ-how-many-irreversible-tipping-points-hide', 'GQ-turbulence-the-oldest-unsolved-problem-of', 'GQ-consciousness-hard-problem', 'GQ-what-is-the-mechanism-of-high', 'GQ-does-the-economy-obey-discoverable-laws'] },
  { id: 'minds', title: ['智能、记忆与体验', 'Minds, memory & experience'], domains: ['神经科学 · AI · 哲学', 'Neuroscience · AI · Philosophy'], invitation: ['学会预测、形成记忆、拥有体验，是同一件事吗？', 'Are learning to predict, forming memories and having experiences the same thing?'],
    ids: ['GQ-consciousness-hard-problem', 'GQ-is-there-a-theory-that-explains', 'GQ-intelligence-emergence', 'GQ-human-machine-coevolution', 'GQ-where-did-language-come-from-what', 'GQ-can-we-measure-whether-consciousness-or', 'GQ-memory', 'GQ-why-do-we-sleep-what-do'] },
  { id: 'information', title: ['信息与物质', 'Information & matter'], domains: ['信息论 · 物理 · 认知', 'Information · Physics · Cognition'], invitation: ['一个比特、一段记忆、一片时空，究竟有什么可以相互解释？', 'What can a bit, a memory and a region of spacetime explain about one another?'],
    ids: ['GQ-it-from-bit', 'GQ-is-information-physical-and-why-must', 'GQ-when-a-black-hole-evaporates-is', 'GQ-quantum-gravity', 'GQ-arrow-of-time', 'GQ-memory', 'GQ-effectiveness-of-math', 'GQ-consciousness-hard-problem'] },
  { id: 'prediction', title: ['预测的边界', 'The limits of prediction'], domains: ['计算 · 地球 · 经济', 'Computation · Earth · Economics'], invitation: ['算不出来、测不准确、原理上不可知，如何区分？', 'Too hard to compute, too hard to measure, or unknowable in principle?'],
    ids: ['GQ-does-the-economy-obey-discoverable-laws', 'GQ-can-earthquakes-be-predicted-at-all', 'GQ-turbulence-the-oldest-unsolved-problem-of', 'GQ-limits-of-computation', 'GQ-how-does-a-protein-fold-from', 'GQ-limits-of-knowable', 'GQ-final-theory', 'GQ-do-the-undecidability-results-of-goedel'] },
  { id: 'collectives', title: ['合作、演化与崩溃', 'Cooperation & collapse'], domains: ['演化 · 生态 · 社会', 'Evolution · Ecology · Society'], invitation: ['个体怎样组成整体，又为什么会散开？', 'How do individuals become a whole, and why does it fall apart?'],
    ids: ['GQ-cooperation', 'GQ-can-large-scale-social-systems-be', 'GQ-why-does-evolution-keep-crossing-major', 'GQ-collapse', 'GQ-mortality', 'GQ-given-that-sex-is-costly-and', 'GQ-what-sustains-biodiversity-why-can-hundreds', 'GQ-what-triggers-earth-s-mass-extinctions'] },
  { id: 'origins', title: ['起源与可能世界', 'Origins & possible worlds'], domains: ['宇宙 · 生命 · 数学', 'Cosmos · Life · Mathematics'], invitation: ['“第一次出现”可以被解释、重演，甚至被设计吗？', 'Can a first emergence be explained, repeated, or even designed?'],
    ids: ['GQ-life-origin', 'GQ-universe-origin', 'GQ-what-is-life', 'GQ-can-we-design-and-write-a', 'GQ-can-matter-be-made-fully-programmable', 'GQ-where-did-the-genetic-code-come', 'GQ-effectiveness-of-math', 'GQ-dark-matter'] },
] as const;

const ALIASES: Record<string, [string, string]> = {
  'GQ-why-is-more-different-and-how': ['多为何不同', 'More is different'],
  'GQ-how-does-a-single-fertilized-egg': ['从细胞到身体', 'Cells into bodies'],
  'GQ-how-many-irreversible-tipping-points-hide': ['地球的临界点', 'Earth’s tipping points'],
  'GQ-turbulence-the-oldest-unsolved-problem-of': ['湍流之谜', 'Turbulence'],
  'GQ-consciousness-hard-problem': ['意识从何而来', 'Conscious experience'],
  'GQ-what-is-the-mechanism-of-high': ['高温超导', 'Superconductivity'],
  'GQ-does-the-economy-obey-discoverable-laws': ['经济可被预测吗', 'Economic prediction'],
  'GQ-is-there-a-theory-that-explains': ['机器如何泛化', 'Machine generalization'],
  'GQ-intelligence-emergence': ['智能的涌现', 'Intelligence emerging'],
  'GQ-human-machine-coevolution': ['人机共同演化', 'Human–AI coevolution'],
  'GQ-where-did-language-come-from-what': ['语言的起源', 'Origins of language'],
  'GQ-can-we-measure-whether-consciousness-or': ['如何测量体验', 'Measuring experience'],
  'GQ-memory': ['记忆如何存在', 'How memory persists'],
  'GQ-why-do-we-sleep-what-do': ['为什么要睡眠', 'Why we sleep'],
  'GQ-it-from-bit': ['万物源于比特？', 'It from bit?'],
  'GQ-is-information-physical-and-why-must': ['信息的物理代价', 'The cost of information'],
  'GQ-when-a-black-hole-evaporates-is': ['黑洞与信息', 'Black holes & information'],
  'GQ-quantum-gravity': ['量子引力', 'Quantum gravity'],
  'GQ-arrow-of-time': ['时间之箭', 'The arrow of time'],
  'GQ-effectiveness-of-math': ['数学为何有效', 'Why mathematics works'],
  'GQ-can-earthquakes-be-predicted-at-all': ['地震的可预测性', 'Predicting earthquakes'],
  'GQ-limits-of-computation': ['计算的极限', 'Limits of computation'],
  'GQ-how-does-a-protein-fold-from': ['蛋白质折叠', 'Protein folding'],
  'GQ-limits-of-knowable': ['可知的边界', 'Limits of knowing'],
  'GQ-final-theory': ['万物之理', 'A final theory'],
  'GQ-do-the-undecidability-results-of-goedel': ['物理可判定吗', 'Decidability in physics'],
  'GQ-cooperation': ['合作如何出现', 'How cooperation arises'],
  'GQ-can-large-scale-social-systems-be': ['社会如何被引导', 'Steering societies'],
  'GQ-why-does-evolution-keep-crossing-major': ['演化的重大转变', 'Evolutionary transitions'],
  'GQ-collapse': ['文明为何崩溃', 'Why civilizations collapse'],
  'GQ-mortality': ['衰老与死亡', 'Aging & death'],
  'GQ-given-that-sex-is-costly-and': ['为何有性繁殖', 'Why sexual reproduction'],
  'GQ-what-sustains-biodiversity-why-can-hundreds': ['多样性如何维持', 'Sustaining diversity'],
  'GQ-what-triggers-earth-s-mass-extinctions': ['大灭绝', 'Mass extinctions'],
  'GQ-life-origin': ['生命的起源', 'Origins of life'],
  'GQ-universe-origin': ['宇宙的起源', 'Origins of the universe'],
  'GQ-what-is-life': ['什么是生命', 'What is life'],
  'GQ-can-we-design-and-write-a': ['能否编写生命', 'Writing life'],
  'GQ-can-matter-be-made-fully-programmable': ['可编程物质', 'Programmable matter'],
  'GQ-where-did-the-genetic-code-come': ['遗传密码的起源', 'Origins of genetic code'],
  'GQ-dark-matter': ['暗物质是什么', 'What is dark matter'],
};
export function questionLabel(catalog: ExplorationCatalog, id: string, lang: 'zh' | 'en') {
  const q = catalog.questions.find((q) => q.id === id);
  return ALIASES[id]?.[lang === 'zh' ? 0 : 1] ?? (lang === 'zh' ? q?.q : q?.q_en) ?? id;
}
export function thematicCollisions(catalog: ExplorationCatalog, ids: readonly string[]): QuestionCollision[] {
  return catalog.collisions.filter((pair) => ids.includes(pair.a) && ids.includes(pair.b));
}

/** Stable topographic fingerprint, purely cartographic; elevation is not merit. */
export function questionCoast(id: string, scale = 1): string {
  let seed = 0; for (const char of id) seed = (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0;
  const phase = seed % 628 / 100;
  const points = Array.from({ length: 64 }, (_, i) => {
    const angle = i / 64 * Math.PI * 2;
    const radius = 51 + 7 * Math.sin(angle * 3 + phase) + 4 * Math.cos(angle * 5 - phase);
    return [Math.cos(angle) * radius * scale, Math.sin(angle) * radius * 0.60 * scale];
  });
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${x!.toFixed(1)},${y!.toFixed(1)}`).join(' ') + 'Z';
}

/** Local reading prompts. These critique the analogy; they are not MCP facts. */
export const COLLISION_TENSIONS = [
  { ids: ['GQ-how-many-irreversible-tipping-points-hide', 'GQ-why-is-more-different-and-how'],
    distinction: ['磁体的序参量与气候的状态变量如何对应？平衡相变的假设，在开放、受迫的气候系统里还成立吗？', 'How would a magnetic order parameter map to a climate state variable? Do equilibrium assumptions survive in an open, driven climate system?'],
    observation: ['同一个预警指标，能否区分真正的稳定性丧失与外部噪声变强？先比较这两个解释。', 'Can one warning signal distinguish a loss of stability from stronger external noise? Compare those explanations first.'] },
  { ids: ['GQ-turbulence-the-oldest-unsolved-problem-of', 'GQ-consciousness-hard-problem'],
    distinction: ['相似的频谱或自相似性，只是统计对应。神经活动的复杂性与主观体验的存在，不能直接画等号。', 'Similar spectra or self-similarity are statistical correspondences. Complex neural activity is not equivalent to subjective experience.'],
    observation: ['先比较有无体验报告时的动力学指标；即便可区分，也还需要排除唤醒程度等竞争解释。', 'Compare dynamical measures with and without experience reports, then test competing explanations such as arousal.'] },
  { ids: ['GQ-how-does-a-protein-fold-from', 'GQ-limits-of-computation'],
    distinction: ['计算复杂度讨论的问题族与最坏情形，不等于每条天然序列的折叠难度。快速折叠本身不意味着绕过复杂度下界。', 'Worst-case complexity of a problem family is not the difficulty of each natural sequence. Fast folding does not itself evade a complexity bound.'],
    observation: ['天然序列与打乱后的序列，在同一环境中是否呈现不同的能量地形和动力学？', 'Do natural and shuffled sequences exhibit different energy landscapes and dynamics in the same environment?'] },
  { ids: ['GQ-does-the-economy-obey-discoverable-laws', 'GQ-turbulence-the-oldest-unsolved-problem-of'],
    distinction: ['两边出现重尾或级联，不足以推出同一种机制。流体中的守恒关系，在会学习、会干预的市场中对应什么？', 'Heavy tails or cascades do not establish one mechanism. What corresponds to fluid conservation laws in markets with learning and intervention?'],
    observation: ['改变局部耦合后，级联传播是否按同一规则变化？保留“外部共同冲击”作为竞争解释。', 'Does changing local coupling alter cascade propagation in the same way? Keep a common external shock as a rival explanation.'] },
  { ids: ['GQ-consciousness-hard-problem', 'GQ-is-there-a-theory-that-explains'],
    distinction: ['泛化可以通过跨任务表现测量；体验不能由这个分数替代。“信息整合”还需要在两边分别定义。', 'Generalization can be measured across tasks; that score cannot stand in for experience. Information integration must be defined separately in each setting.'],
    observation: ['能否保持计算预算不变，只改变反馈连接？先观察泛化的变化，再讨论它能否触及体验问题。', 'Can feedback connections change while compute stays fixed? Observe generalization first, then ask whether it bears on experience.'] },
  { ids: ['GQ-dark-matter', 'GQ-what-is-life'],
    distinction: ['通过效应辨认对象是一种方法联系。引力的逆问题与生命的操作性定义，需要不同的排他性检验。', 'Identification through effects is a methodological connection. Gravitational inverse problems and operational definitions of life need different exclusion tests.'],
    observation: ['写出一个“产生相同效应、但不是目标对象”的对照；什么观测能把它们分开？', 'Find a control that produces the same effect without the proposed object. What observation separates them?'] },
  { ids: ['GQ-cooperation', 'GQ-can-large-scale-social-systems-be'],
    distinction: ['细胞与人具有不同的自主性、目标和可干预条件。演化中合作的解释，不能直接变成人类制度的规范。', 'Cells and people differ in autonomy, goals and possible interventions. An evolutionary explanation cannot directly prescribe human institutions.'],
    observation: ['同一协作规则在允许退出、目标不一致时是否仍然稳定？', 'Does the cooperation rule remain stable when participants can leave and have conflicting goals?'] },
] as const;
export function collisionTension(pair: QuestionCollision) {
  return COLLISION_TENSIONS.find((item) => item.ids.includes(pair.a as never) && item.ids.includes(pair.b as never));
}
