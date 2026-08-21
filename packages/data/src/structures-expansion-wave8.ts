import type { SeedStructure, StructureQuantity } from './structures';

/**
 * Wave 8 — the last 9 topics, from the 「方法」 band. With this the 100-topic
 * set is fully worked through: 17 duplicated an existing structure and were
 * dropped, and the other 83 are now in the catalogue across waves 4 to 8.
 *
 * Same terms throughout: zero mappings, `proposed`, no edge claimed.
 *
 * Two entries sit beside something already here:
 *
 *   self-nonself-discrimination vs ISO-35 开放集识别 — open-set recognition is
 *   about rejecting a class never seen in training; this is about a system
 *   telling its own components from foreign ones, where the two error types
 *   carry asymmetric costs and the reference set itself keeps changing.
 *
 *   rebuild-from-description vs 模型—现实闭环 — the closed loop corrects a model
 *   against observation; this rebuilds the artefact from its description to
 *   test whether the DESCRIPTION was complete, which is a claim about the
 *   record rather than about the model.
 */

type Bilingual = { zh: string; en: string };

const bi = (zh: string, en: string): Bilingual => ({ zh, en });

const q = (
  nameZh: string,
  nameEn: string,
  roleZh: string,
  roleEn: string,
): StructureQuantity => ({ name: bi(nameZh, nameEn), role: bi(roleZh, roleEn) });

const P = (recordIds: number[]) => ({
  source: 'xfrontier.science',
  url: 'https://xfrontier.science/',
  recordIds,
  reviewedAt: '2026-08-22',
});

export const WAVE_8_STRUCTURES: SeedStructure[] = [
  {
    id: 'struct://xfrontier/perturb-and-read',
    title: bi('扰动-响应建因果', 'Perturb and read'),
    statement: bi(
      '在系统运行中对指定单元施加一次即时扰动，并同步读取响应——因果被主动制造出来，而不是从被动观测里推断。',
      'Apply one immediate perturbation to a named unit while the system runs, and read the response as it happens — causation is manufactured rather than inferred from passive observation.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'method',
    quantities: [
      q('被扰动的单元', 'the perturbed unit', '因果箭头的起点，必须能被单独指定', 'the tail of the causal arrow, which must be nameable on its own'),
      q('扰动幅度与时长', 'size and duration of the perturbation', '决定读到的是响应还是损伤', 'what decides whether the reading is a response or damage'),
      q('响应延迟', 'response latency', '把直接效应与间接效应分开的量', 'what separates direct from indirect effects'),
    ],
    failsWhen: bi(
      '扰动本身改变了系统时失效：读到的响应属于被扰动之后的那个系统，而不是你想研究的那个——幅度越大，这个偏差越难忽略。',
      'It fails when the perturbation changes the system: the response belongs to the system after the poke rather than the one under study, and the larger the poke the harder that is to ignore.',
    ),
    provenance: P([1039, 1771, 894, 1047, 929]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/costly-signal',
    title: bi('昂贵信号', 'Costly signals'),
    statement: bi(
      '让信号本身带上足以劝退造假者的代价，可信度就不必依赖善意或核查——代价结构替代了信任。',
      'Load the signal with a cost high enough to deter a faker and credibility no longer rests on goodwill or verification — the cost structure stands in for trust.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'method',
    quantities: [
      q('发信代价', 'cost to send', '诚实者与造假者各自要付的；差额才是信号', 'what an honest and a faking sender each pay, with the gap being the signal'),
      q('代价差', 'the differential', '造假者的代价必须高于诚实者，否则不成立', 'faking must cost more than honesty or the whole thing collapses'),
      q('信号价值', 'value of being believed', '决定多高的代价还值得付', 'what decides how much cost is still worth paying'),
    ],
    failsWhen: bi(
      '造假成本下降时信号贬值：代价差一旦被技术或规模抹平，同一个信号继续被发送、继续被相信，但已经不再携带信息。',
      'The signal devalues as faking gets cheap: once technology or scale erases the differential, the same signal keeps being sent and believed while carrying no information.',
    ),
    provenance: P([1018, 362, 237, 149, 1556]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/commitment-device',
    title: bi('承诺与战略不可逆', 'Commitment and strategic irreversibility'),
    statement: bi(
      '先锁死自己的选项、再让对方看见：主动失去退路本身构成可信度——这是唯一一种通过削弱自己来增强议价的手段。',
      'Lock your own options first, then let the other side see it: deliberately losing the way back is itself the credibility — the one manoeuvre that strengthens a position by weakening it.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'method',
    quantities: [
      q('被锁死的选项', 'the options given up', '承诺的实质内容', 'the substance of the commitment'),
      q('不可逆度', 'how irreversible it is', '决定承诺可不可信', 'what decides whether the commitment is believed'),
      q('可见性', 'visibility to the other side', '对方看不见的承诺不产生任何作用', 'a commitment the other side cannot see does nothing at all'),
    ],
    failsWhen: bi(
      '锁定可被撤销、可被伪造、或对手根本不知情时无效——三种失效方式各自独立，而第三种最常见也最少被检查。',
      'It fails if the lock can be undone, can be faked, or is simply unknown to the opponent — three independent failures, the third being the commonest and the least often checked.',
    ),
    provenance: P([1217, 918, 467, 912, 868]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/dormant-seed-bank',
    title: bi('休眠种子库', 'The dormant seed bank'),
    statement: bi(
      '维持一批当前不用、也不产生收益的变体，等环境改变时把它们重新激活——用确定的持有成本，换一个不确定的未来选择权。',
      'Keep a stock of variants that are neither used nor productive now, to reactivate when the environment changes — a certain holding cost bought against an uncertain future option.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'method',
    quantities: [
      q('库存多样度', 'variety held', '未来可选项的数量', 'how many futures remain available'),
      q('持有成本', 'cost of holding', '每单位时间为维持休眠付的钱', 'what keeping them asleep costs per unit time'),
      q('唤醒可行性', 'whether they can still be revived', '最容易被忽略、也最容易悄悄归零的量', 'the quantity most easily overlooked and most easily gone to zero unnoticed'),
    ],
    failsWhen: bi(
      '休眠成本随时间上升时库被淘空：维持费用增长而收益始终为零，于是最先被砍的总是这一项——而它的价值恰恰只在被砍之后才显现。',
      'The bank empties when holding costs rise: the bill grows while the return stays zero, so this is always the first line cut — and its value only shows after it has been.',
    ),
    provenance: P([694, 1865, 1134, 602, 1533]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/controlled-inoculation',
    title: bi('演习与接种', 'Drill and inoculation'),
    statement: bi(
      '主动施加一次受控的小剂量扰动，让系统在无关紧要的时候先失败一次，从而提升它在真正扰动下的存活能力。',
      'Apply one controlled small dose on purpose so the system fails once when it does not matter, and survives better when it does.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'method',
    quantities: [
      q('剂量', 'the dose', '必须足以引发响应、又不足以造成实质损伤', 'enough to provoke a response, not enough to do real damage'),
      q('恢复窗口', 'recovery window', '两次施加之间系统重建的时间', 'the time the system needs to rebuild between doses'),
      q('习得的响应', 'the response acquired', '这次演练留下的、下次可用的东西', 'what this rehearsal leaves behind for next time'),
    ],
    failsWhen: bi(
      '剂量过大时反而造成实质损伤——而剂量的安全上界通常只能事后知道，所以这条方法的风险不在原理上，在标定上。',
      'Too large a dose does real damage, and the safe ceiling is usually only known afterwards, so the risk of this method is not in its principle but in its calibration.',
    ),
    provenance: P([1670, 417, 182, 231, 524]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/devolving-control',
    title: bi('控制权下移', 'Devolving control'),
    statement: bi(
      '把对资源的控制从聚合中心交回产生者手中——治理与算力都下沉，代价是中心原本承担的全局协调功能一并消失。',
      'Hand control of a resource back from the aggregating centre to whoever produces it — governance and compute both move down, at the cost of whatever global coordination the centre was doing.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'method',
    quantities: [
      q('控制权所在', 'where control sits', '被移动的那个东西', 'the thing being moved'),
      q('中心原本提供的协调', 'the coordination the centre provided', '下移后必须重新安排、否则丢失', 'what must be re-arranged after devolution or is simply lost'),
      q('产生者的能力门槛', 'what producers must be able to do', '决定下移是赋权还是弃置', 'what decides whether devolution empowers or abandons'),
    ],
    failsWhen: bi(
      '需要全局协调的功能会随控制权一起消失：把决定权还回去很容易，把中心原本默默做的对账、调度与仲裁一起还回去则不是。',
      'Functions that need a global view leave with the centre: handing back the decision is easy, handing back the reconciliation, scheduling and arbitration it quietly did is not.',
    ),
    provenance: P([1592, 1092, 1618, 1823, 460]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/shift-left',
    title: bi('前置化', 'Shifting it upstream'),
    statement: bi(
      '把原本在下游批量处理的环节前移成上游的实时闭环——错误在制造出来的那一刻就被发现，返工成本随之塌缩。',
      'Move a step that used to be batched downstream into a real-time loop upstream — an error is caught at the moment it is made, and the cost of rework collapses.',
    ),
    status: 'proposed',
    theme: 'simulation-twins',
    kind: 'method',
    quantities: [
      q('发现延迟', 'detection latency', '从错误产生到被发现的时间；被压缩的就是它', 'from making an error to noticing it, and the quantity being compressed'),
      q('返工成本随延迟的增长率', 'how rework cost grows with delay', '决定前置值不值', 'what decides whether shifting upstream pays'),
      q('该环节需要的下游信息', 'downstream information the step needs', '决定它能不能前置', 'what decides whether it can move at all'),
    ],
    failsWhen: bi(
      '该环节必须依赖下游信息时不可前置：硬把它移上去只会得到一个用猜测代替信息的早期检查，比不做更坏。',
      'A step that genuinely needs downstream information cannot move: forcing it up yields an early check running on guesses instead of information, which is worse than not checking.',
    ),
    provenance: P([151, 60, 149, 961, 449]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/self-nonself-discrimination',
    title: bi('自我/非我判别', 'Telling self from non-self'),
    statement: bi(
      '一个系统必须持续区分自身成分与外来物，而两类错误的代价不对称：放过入侵者与攻击自己，从来不是同一个量级的失误。',
      'A system must keep telling its own components from foreign ones, and the two errors cost differently: letting an intruder through and attacking yourself are never mistakes of the same size.',
    ),
    status: 'proposed',
    theme: 'causal-inference',
    kind: 'method',
    quantities: [
      q('自我参照集', 'the reference set of self', '判别所依据的那份清单', 'the list the discrimination is made against'),
      q('两类错误的代价比', 'the cost ratio of the two errors', '决定阈值该偏向哪边', 'what decides which way the threshold should lean'),
      q('参照集的更新速率', 'how fast the reference set updates', '自身在变时，这是判别能否跟上的关键', 'when self itself changes, this decides whether discrimination keeps up'),
    ],
    failsWhen: bi(
      '自身成分本身在变化时判别标准失效——系统会开始攻击自己，而这类失效不表现为「漏了一个入侵者」，表现为过度警觉。',
      'The criterion fails once self is itself changing: the system starts attacking its own, and this failure does not look like a missed intruder — it looks like vigilance.',
    ),
    provenance: P([417, 735, 641, 1684, 1709]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/rebuild-from-description',
    title: bi('从描述重建', 'Rebuilding from the description'),
    statement: bi(
      '只按写下来的描述重造一次原产物，用重建的成败去检验描述本身是否完备——被测的是记录，不是被记录的东西。',
      'Rebuild the artefact from nothing but the written description, and let success or failure test whether the description was complete — what is under test is the record, not what it records.',
    ),
    status: 'proposed',
    theme: 'knowledge-commons',
    kind: 'method',
    quantities: [
      q('描述', 'the description', '被检验的对象', 'the object under test'),
      q('重建者的先验知识', 'what the rebuilder already knows', '必须被控制，否则测的是重建者而不是描述', 'which must be controlled or the test measures the rebuilder instead of the description'),
      q('重建产物与原物的差', 'the gap between rebuild and original', '差额就是描述漏掉的量', 'the shortfall being exactly what the description left out'),
    ],
    failsWhen: bi(
      '存在必需的隐性知识时永远重建不出：此时失败不证明描述写得差，只证明这件事有一部分无法被写下来——而区分这两者需要换一个重建者再试一次。',
      'Where indispensable tacit knowledge exists the rebuild never succeeds, and the failure then shows not that the description is poor but that part of the thing cannot be written down — telling the two apart takes a second attempt by a different rebuilder.',
    ),
    provenance: P([734, 270, 560, 1015, 1847]),
    mappings: [],
  },
];
