import type { StructureDepthPatch } from './structures-depth-critical';
import type { CanonicalSubstrate, StructureQuantity, StructureRelation } from './structures';

/**
 * Depth for the seven structures of the executable family.
 *
 * All seven answer one question: when does a representation stop describing
 * something and start doing work, and what is the test that tells the
 * difference? Each carries an explicit "only counts if" clause, and that
 * clause is the family. A material with memory is drift until its state can be
 * written to a value and its operator reproduced. A claim is executable only
 * where some input can make it fail. A model earns its keep by improving
 * prediction inside a loop, not by resembling the thing. Interventions recover
 * latent structure only under coverage and variation conditions. A task is
 * encoded only when the free and clamped states differ physically. Two
 * translations are an adjunction only when going across and back lands on a
 * computable best approximation. And a symmetry demanded at every point does
 * not test a theory, it produces one.
 *
 * WHY EVERY PATCH HERE DECLARES QUANTITIES. These seven are the last of the
 * 126 that declare none. That is the family's own diagnosis rather than an
 * accident of curation: they are the most abstract members of the catalogue,
 * the ones where nobody could name the variables, which is the condition under
 * which a structure gets cited as a slogan. The naming was done in the same
 * pass as the substrates, because `CanonicalSubstrate.quantity` indexes the
 * list directly above it — a substrate you cannot point at a declared variable
 * through is one you have not understood. Two candidate quantities were
 * dropped that way, having no substrate that could hold them.
 *
 * WHAT THE ADDED `quantities` DO NOT SETTLE. All seven already carry island
 * mappings — intervention-identifiability five, three others four each,
 * adjoint-functors three, gauge-equivariance two, substrate-local-learning one
 * — every one authored before any quantity existed to correspond to. Nothing
 * here says which rendering answers to which quantity; that is the review
 * queue in `projectQuantityRoles`, and this file does not shorten it.
 *
 * THE OPPOSITION WORTH FILING. `adjoint-functors` and `gauge-equivariance`
 * make the same claim — a structure is defined by what its transformations
 * preserve and what they discard — and run it in opposite directions. The
 * adjunction derives a best approximation from a pair of translations that
 * already exist; the gauge demand forces a new object into existence to
 * satisfy a requirement. Derivation against construction. They are filed as
 * related rather than opposed because a technical statement sits under the
 * contrast: minimal coupling is a universal-property claim, the smallest
 * modification of the derivative that meets the demand, which is the shape of
 * a free construction.
 *
 * The family's one `competes-with` is the second opposition.
 * `model-reality-loop` and `intervention-identifiability` both improve a model
 * by intervening, and a stable improvement across conditions reads as evidence
 * under either. The discriminator is who chose the conditions: in a designed
 * loop the intervention belongs to the model's own policy, so the model gets
 * better at the regime it elected to visit; in the found case identifiability
 * rests on assumptions about a heterogeneity nobody made and nobody can check
 * from inside the data. Only one of the two can be audited by re-running under
 * a different policy.
 *
 * WHAT IS NOT FILED. `substrate-local-learning` and `gauge-equivariance` share
 * a shape — demand that a rule use only what is beside it, and something extra
 * must be materialised — but no mechanism, and a rhyme filed as a relation
 * reads as a claim. This family also has fewer internal edges than the
 * mechanistic ones: seven of twenty-one stay inside. Abstract members connect
 * outward to the structures they govern rather than sideways to each other,
 * and forcing the ratio would have meant inventing links.
 *
 * `executable-knowledge` is the only member without a `minimalForm`, and the
 * absence is informative: the field has type disciplines, dependency solvers
 * and validators, and no agreed formal statement of what makes a body of
 * claims executable.
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

export const EXECUTABLE_FAMILY_DEPTH: StructureDepthPatch[] = [
  {
    structureId: 'struct://xfrontier/executable-knowledge',
    quantities: [
      q('接口签名', 'interface signature',
        '声明一条主张消费什么、产出什么；只有签名对得上才能组合，不兼容也只在这里暴露',
        'what a claim consumes and produces; only matching signatures compose, and that is where incompatibility surfaces'),
      q('依赖闭包', 'dependency closure',
        '一条主张倚赖的全部前置；动其中一条，闭包内的一切都要重新复核',
        'every prior claim it rests on; change one and everything downstream must be re-checked'),
      q('验证器', 'validator',
        '给定输入判定这条主张是否仍成立的可执行谓词；有它与只有格式之别，就是可复核与仅可读之别',
        'the predicate deciding whether the claim still holds on given inputs; having one rather than a format is the difference between checkable and readable'),
      q('复核代价', 're-check cost',
        '把整个闭包重跑一遍的代价；它决定公地能长到多大还有人真的去验证',
        'the cost of re-running the whole closure, which sets how large the commons grows before people stop verifying'),
    ],
    depth: {
      origin: bi(
        '「机器可复核」最早落在自动推理里：de Bruijn 1967 年的 Automath 是为逐行检查一本教科书而造的，目标是记账不是发现。暴露要害的是 2000 年代的语义网——有格式、有词表，却没有一个会失败的验证器。',
        'Machine-checkability landed first in automated reasoning: de Bruijn\'s Automath (1967) was built to check a textbook line by line, bookkeeping rather than discovery. What exposed the load-bearing part was the semantic web of the 2000s — formats and vocabularies, and no validator that could fail.',
      ),
      canonicalSubstrates: [
        sub('形式化数学库', 'A formalised mathematics library', '数学', 'Mathematics', 1,
          '每条定理都带着它依赖的全部前置，编译器把整个闭包一次重新检查一遍',
          'each theorem carries the results it depends on, and the compiler re-checks the entire closure in one pass',
          '内核只检查逻辑形式，检查不了定义是不是想要的那一个：写错的定义与正确的定理拿到同样的绿灯。错误被从证明挪到陈述，没有被消灭。',
          'The kernel checks logical form, not whether a definition is the intended one, so a mis-stated definition earns the same green light as a correct theorem: error moves from the proof to the statement rather than going away.'),
        sub('软件包管理与语义化版本', 'Package management and semantic versioning', '软件工程', 'Software engineering', 0,
          '每个包声明自己的接口，版本约束不满足时构建当场失败',
          'each package declares its interface and the build fails when a constraint is unmet',
          '版本号是对兼容性的人为承诺，不是被检查的签名。标称兼容的小版本照样能弄坏调用方——签名在这里是自报的，没有东西核对它。',
          'A version number is a human promise about compatibility, not a checked signature. A release claiming compatibility can still break its callers: the signature is self-declared and nothing verifies it.'),
        sub('容器化的分析流水线', 'Containerised analysis pipelines', '生物信息学', 'Bioinformatics', 3,
          '整条分析能在另一台机器上重跑并得到同一批数字，代价是把环境全部钉死',
          'the analysis re-runs elsewhere and returns the same numbers, at the cost of pinning the entire environment',
          '重跑复核的是计算而不是主张：一条忠实可复现的流水线会同样忠实地复现一个错误的分析，验证器只覆盖「同样输入给出同样输出」。',
          'Re-running checks the computation, not the claim: a faithfully reproducible pipeline reproduces a wrong analysis just as faithfully, the validator covering only "same inputs, same outputs".'),
        sub('机读法规', 'Rules as code', '公共政策', 'Public policy', 2,
          '税则或建筑规范附带可执行的检查器，一份申报在不合规的那一条上直接失败',
          'a tax or building code ships with an executable checker, so a submission fails at the provision it violates',
          '法条有意留白，裁量没有类型。编码成可执行规则等于把一次判断换成一个阈值：失败点确实被造出来了，但落在写规则的人挑的地方。',
          'Legal text is deliberately open-textured and discretion has no type. Encoding it as a rule swaps a judgement for a threshold: a failure point is created, but where the rule-writer put it.'),
      ],
      relations: [
        rel('tacit-craft-explicitation', 'special-case-of',
          '这是显式化被推到「显式形式必须能失败」为止的特例，也因此继承了显式化的极限：拒绝被写下来的东西不只是缺席，而是变得看不见——验证器对它看不见的一切一律放行。',
          'Explicitation pushed to the point where the explicit form must be able to fail, inheriting explicitation\'s limit: whatever resisted being written down is not merely missing but invisible, because the validator passes everything it cannot see.'),
        rel('verification-asymmetry', 'emerges-from',
          '只有复核远比生产便宜时，把主张做成可执行对象才划算；公地靠这个不对称扩大，而一旦复核代价追上生产代价，验证器就没人跑了。',
          'Turning a claim into an executable object pays only where checking is far cheaper than producing; the commons grows on that asymmetry, and once re-check cost catches up nobody runs the validator.'),
        rel('traceability-chain', 'generates',
          '依赖闭包一旦真的被重跑，来源记录就不再是另立的一套台账，而是可复核性的副产品：能重跑就必然知道每个结果是从哪些前提长出来的。',
          'Once the dependency closure is actually re-run, provenance stops being a separate ledger kept by hand and becomes a by-product of checkability: whatever you can re-run, you necessarily know the antecedents of.'),
      ],
      mistakenFor: bi(
        '最常被当成结构化数据或一套 schema。schema 约束形状不约束主张：完全合规的记录可以说错事，并且会通过。判据是问它在什么输入下会拒绝——没有任何输入能让它报错，它就只是可读的。第二种误认是开放获取：PDF 再公开也不会在接口不兼容时失败。',
        'Routinely mistaken for structured data or a schema. A schema constrains shape, not claims: a conformant record can assert something false and will pass. The test is what input would make it refuse — if none can, it is readable rather than checkable. The second confusion is open access: a PDF, however public, cannot fail at an incompatible interface.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/model-reality-loop',
    quantities: [
      q('预测残差', 'prediction residual',
        '模型说会发生什么与实际发生什么之差；闭环唯一真正消费的信号，模型其余部分都经它被改动',
        'the gap between what the model predicted and what happened; the only signal the loop consumes, and the channel through which everything else is revised'),
      q('干预策略', 'intervention policy',
        '模型据以选下一个动作的规则；它同时决定模型接下来能看到现实的哪一部分',
        'the rule by which the model picks its next action, which also fixes which part of reality it will get to see'),
      q('同化增益', 'assimilation gain',
        '每轮观测被允许改变模型多少；过大在追噪声，过小闭环就退化成开环',
        'how much each observation may move the model; too large it chases noise, too small the loop degenerates into an open one'),
      q('闭环增益', 'closed-loop improvement',
        '与关掉更新环节的对照相比，预测与行动改善了多少；这是模型价值的度量，取代「像不像」',
        'how much prediction and action improve against a control with the update switched off; the measure of worth, standing in place of resemblance'),
    ],
    depth: {
      origin: bi(
        '骨架来自 1960 年代的自适应控制：控制器一边控制一边改自己的对象模型。「数字孪生」晚得多——2002 年出自产品生命周期管理，2010 年被 NASA 路线图推广时讲的是某一具体机身的疲劳，一开始就是关于一个个体而不是一类系统的主张，保真度被当成价值即源于此。',
        'Adaptive control in the 1960s: a controller that revises its own plant model while controlling. "Digital twin" is much later — product lifecycle management in 2002, popularised by a 2010 NASA roadmap about the fatigue of one specific airframe. It began as a claim about an individual rather than a class, which is where treating fidelity as value comes from.',
      ),
      minimalForm: 'x̂ₜ₊₁ = f(x̂ₜ, uₜ; θₜ) ;  θₜ₊₁ = θₜ + Kₜ (yₜ − h(x̂ₜ; θₜ)) ;  uₜ = π(x̂ₜ)',
      canonicalSubstrates: [
        sub('数值天气预报的资料同化', 'Data assimilation in numerical weather prediction', '气象学', 'Meteorology', 2,
          '每一轮把观测与上一轮预报之差按增益同化进初始场，增益由背景误差与观测误差之比定出',
          'each cycle folds the observation-minus-forecast difference into the initial field, weighted by the ratio of background to observation error',
          '这个闭环只更新状态，几乎不更新模型：动力核心是人隔几年改一次的。被校正的是初始条件而不是结构，混为一谈会高估闭环的自我修正能力。',
          'This loop updates the state and barely the model: the dynamical core is revised by people every few years. It corrects the initial condition, not the structure, and conflating the two overstates how much the loop corrects itself.'),
        sub('治疗药物监测与个体化给药', 'Therapeutic drug monitoring and model-informed dosing', '临床药理学', 'Clinical pharmacology', 1,
          '用群体药代模型预测浓度并据此改剂量，再用实测浓度回头修正这位病人的个体参数',
          'a population model predicts concentration, the dose changes accordingly, and the measured concentration corrects that patient\'s parameters',
          '剂量不能为了信息量去探索，采样永远落在治疗窗内。模型在窗外学不到东西，而临床最需要它的正是窗外——闭环在这里被伦理而不是被信息论截断。',
          'Dose is never varied for information, so every sample falls inside the therapeutic window. The model learns nothing outside it, which is where clinicians need it most: this loop is truncated by ethics, not information theory.'),
        sub('工厂的数字孪生', 'A factory digital twin', '制造工程', 'Manufacturing engineering', 3,
          '与不更新孪生体的对照相比，排产或维护决策省下了多少工时与停机',
          'how much scheduling or maintenance decisions improve against a control whose twin is not updated',
          '业内通行的验收标准是「与实物一致」，那是相似度不是闭环增益。高保真却从不进入决策的孪生体在这里得零分，在自己的行业标准下却会通过。',
          'The sector\'s acceptance criterion is agreement with the physical object, which is resemblance rather than improvement. A high-fidelity twin that never enters a decision scores zero here and passes its own industry\'s test.'),
        sub('基于模型的强化学习', 'Model-based reinforcement learning', '机器学习', 'Machine learning', 0,
          '世界模型的预测误差既是更新信号，也决定智能体下一步去哪里采样',
          'the world model\'s prediction error is both the update signal and what decides where the agent samples next',
          '智能体自己选采样点，模型只在自己走过的分布上准，闭环增益又在同一个策略下测。换个策略结论就不成立——这是「设计的闭环」特有的失效。',
          'The agent chooses its own sampling points, so the model is accurate only where it visited, and the improvement is measured under that same policy. Change the policy and it does not hold: the failure specific to a designed loop.'),
      ],
      relations: [
        rel('executable-knowledge', 'special-case-of',
          '这是可执行主张把验证器固定成「后来发生的事」的特例，因此比类型检查更严也更慢：验证器要等世界回话，而世界只在被干预过的那一小片上回话。',
          'An executable claim with the validator fixed to be what happened next, which makes it stricter and slower than type checking: the validator waits for the world to answer, and the world answers only on the patch that was intervened upon.'),
        rel('intervention-identifiability', 'competes-with',
          '同一个观测——干预之后预测稳定地变好——有两种读法：环境由模型自己的策略挑选，改善就可能只是它在自选区域变熟；环境是现成的异质性，改善才可能指向潜在结构。判别子是换一个策略重跑还成不成立。',
          'One observation — prediction improves stably after intervening — admits two readings: if the model\'s own policy chose the conditions, the improvement may only mean it grew familiar with the region it elected to visit; if the heterogeneity was found rather than made, it may point at latent structure. The discriminator is whether it survives a re-run under a different policy.'),
        rel('negative-feedback-control', 'emerges-from',
          '这是负反馈在被校正的量是模型参数而不是执行器输出时的样子。两者都由误差驱动，极易互认，但控制器收敛只说明误差被压住了，不说明模型变好了。',
          'What negative feedback looks like when the corrected quantity is the model\'s parameters rather than the actuator\'s output. Both are error-driven and constantly mistaken for each other, but a controller settling shows only that the error was suppressed, not that the model improved.'),
      ],
      mistakenFor: bi(
        '最常被误当成标定。标定是把参数拟合到已有数据上：一次性、离线、不含干预。这个骨架要求模型提出动作、结果再回来改模型，判据是撤掉更新环节后表现是否变差。第二种误认是把保真度当成价值：与实物高度一致却从不参与决策的孪生体，在这里得零分。',
        'Most often mistaken for calibration, which fits parameters to data already in hand: one-shot, offline, no intervention. This skeleton requires the model to propose an action whose outcome comes back and changes it, and the test is whether performance degrades when the update is removed. The second confusion treats fidelity as value: a twin that matches the object closely but never enters a decision scores zero here.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/intervention-identifiability',
    quantities: [
      q('环境数与覆盖', 'number of environments and their coverage',
        '有多少个被干预的条件，以及它们合起来触到变量空间的哪一块；覆盖不足时同一份数据兼容好几个因果结构',
        'how many intervened conditions there are and which part of the variable space they reach; short coverage leaves the same data compatible with several causal structures'),
      q('环境间变化幅度', 'variation across environments',
        '各环境之间分布被推开多远；推得太轻，真实的机制差异沉在噪声下面，看起来像不变',
        'how far apart the environments push the distribution; push too gently and a real difference in mechanism sits under the noise and reads as invariance'),
      q('不变集', 'the invariant set',
        '在所有环境下条件分布保持不变的那组变量；识别的目标是它，而不是任何一个效应值',
        'the variables whose conditional distribution is unchanged across every environment; this set, not any effect size, is what identification aims at'),
      q('等价类规模', 'size of the equivalence class',
        '数据无法区分的因果结构还剩几个；等于一才叫识别，大于一时报告一个效应值就是在报告一个选择',
        'how many causal structures the data still cannot separate; identification means one, and reporting an effect while more remain reports a choice'),
    ],
    depth: {
      origin: bi(
        '不变性这一支比图模型更早：Haavelmo 1943–44 年在计量经济学里就把「结构关系」定义成别的关系变动时它不动的那一条，比 Pearl 1990 年代的 do-演算早了半个世纪。2016 年 Peters、Bühlmann 与 Meinshausen 的不变因果预测把这个定义直接改成一个假设检验。',
        'The invariance line is older than the graphical one: Haavelmo, in econometrics in 1943–44, defined a structural relation as the one that stays put when the others change — half a century before Pearl\'s do-calculus. Invariant causal prediction (Peters, Bühlmann and Meinshausen, 2016) turned that definition into a hypothesis test.',
      ),
      minimalForm: 'S* = ⋂ { S : P^e(Y | X_S) 对所有环境 e 相同 }',
      canonicalSubstrates: [
        sub('孟德尔随机化', 'Mendelian randomisation', '流行病学', 'Epidemiology', 2,
          '基因型在受孕时被随机分配，充当跨环境的干预，暴露到结局之间保持不变的通路就是要找的东西',
          'genotype is assigned at conception and acts as an intervention across environments; the pathway from exposure to outcome that stays put is what is sought',
          '工具变量的三条假设里，排他性无法从数据内部检验。存在多效性时稳定的差异照样出现，只是来自另一条通路——不变集在这里是被假设进去的。',
          'Of the three instrumental-variable assumptions, exclusion cannot be tested from inside the data. With pleiotropy the stable difference appears anyway, down another pathway: the invariant set here is assumed in rather than detected.'),
        sub('政策冲击与双重差分', 'Policy shocks and difference-in-differences', '经济学', 'Economics', 0,
          '同一项政策在不同地区不同时间落地，每一次落地就是一个被干预的环境',
          'the same policy lands in different places at different times, and each landing is one intervened environment',
          '环境是被政治过程选中的，实施时机又通常与结果本身的走势相关。覆盖看着很宽，其实全落在同一类地区上，环境数远高于有效环境数。',
          'The environments were picked by a political process, and adoption timing usually correlates with the outcome\'s own trend. Coverage looks broad while every environment comes from the same kind of place, so the count overstates the effective one.'),
        sub('不变因果预测', 'Invariant causal prediction', '统计学', 'Statistics', 3,
          '在若干环境里搜索条件分布保持不变的变量子集，输出所有通过检验的子集的交集',
          'search across environments for variable subsets whose conditional is unchanged, and return the intersection of those that pass',
          '交集是保守的：环境不够多时它常常是空集，方法据实报告「什么也没识别出来」。这是它诚实的地方，也是边界——不可识别与不存在在这里长得一样。',
          'The intersection is conservative: with too few environments it is routinely empty and the method honestly reports that nothing was identified. That honesty is also the boundary, since unidentifiable and non-existent look alike here.'),
        sub('回路的光遗传学操纵', 'Optogenetic manipulation of a circuit', '神经科学', 'Neuroscience', 1,
          '在多个行为条件下激活或抑制同一条回路，看行为差异是否稳定出现',
          'the same circuit is driven or silenced under several behavioural conditions to see whether the difference appears stably',
          '刺激强度通常远超生理范围，分布被推到系统正常到不了的区域。稳定的差异是真的，但它识别的是一条只在强驱动下起作用的通路。',
          'Stimulation usually far exceeds the physiological range, pushing the distribution where the system never normally goes. The stable difference is real, but it identifies a pathway that operates only under strong drive.'),
      ],
      relations: [
        rel('perturb-and-read', 'explains',
          '扰动读出之所以能给出因果结论，靠的不是扰动本身，而是扰动与其余一切变动相互独立。这条骨架把那个前提写成可陈述的覆盖与变化条件，也因此说清了单次扰动为什么给不出结构。',
          'Perturbing and reading yields a causal conclusion not because of the perturbation but because it is independent of everything else that moves. This skeleton writes that premise out as statable coverage and variation conditions, which is also why a single perturbation cannot deliver structure.'),
        rel('covariate-shift-transfer', 'explains',
          '哪些预测子换个环境还站得住，与哪些是因果父集，问的是同一件事：条件分布跨环境不变的那一组，正好是能迁移的那一组。协变量漂移是这套识别要利用的东西，不是要克服的。',
          'Which predictors survive a change of environment and which are the causal parents are the same question: the set whose conditional is invariant across environments is exactly the set that transfers. Covariate shift is what this identification exploits, not what it overcomes.'),
        rel('natural-experiment', 'explains',
          '自然实验就是「环境是捡来的」那一支，而这条骨架说清捡来的变化必须满足什么：它要真的推动了你关心的机制，同时别的机制不跟着一起动——这一条恰恰无法从数据内部检验。',
          'A natural experiment is the found-environment case, and this skeleton states what the found variation must satisfy: it has to move the mechanism in question while the others stay put, which is precisely the condition the data cannot check on itself.'),
      ],
      mistakenFor: bi(
        '最常被误当成随机化。随机化只是让干预与其余一切独立的手段，不是骨架的内容：骨架要的是环境够多、够不同，真的推动了你关心的机制。随机化再干净，只有一个环境也识别不出结构。第二种误认是把跨环境稳定读成因果——共同的选择规则或测量方式同样造得出稳定差异。',
        'Most often mistaken for randomisation, which is not the content of this skeleton: what it asks is that the environments be numerous and different enough to move the mechanism in question, and however clean the randomisation, one environment identifies nothing. The second confusion reads cross-environment stability as causation — a shared selection rule or measurement procedure produces the same stable difference in every environment at once.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/substrate-local-learning',
    quantities: [
      q('自由态与受钳态之差', 'the free–clamped difference',
        '全局任务在物理上留下的唯一痕迹；局部更新读到的就是它，除此之外没有别的信号',
        'the only trace a global task leaves in the physics; it is what a local update reads, and there is nothing else to read'),
      q('局部性半径', 'locality radius',
        '一条连接更新时能读到多远的信号；半径超出物理邻域，更新就得靠外部布线，这套办法也就退回成常规训练',
        'how far a connection can see when it updates; once the radius exceeds the physical neighbourhood the update needs external wiring and the scheme reverts to ordinary training'),
      q('钳制强度 β', 'nudge strength β',
        '输出被推离自由态的幅度；趋零时两态之差趋于真梯度，信噪比同时崩塌，太大则差不再是导数',
        'how far the output is pushed off the free state; as it vanishes the difference approaches the true gradient while the signal-to-noise ratio collapses with it, and when large it is no longer a derivative'),
      q('平衡时间', 'settling time',
        '物理系统落到平衡所需的时间；每次更新要付两次，它决定这套办法能不能比数字训练更快',
        'how long the system takes to settle; every update pays it twice, and it decides whether the scheme can beat digital training at all'),
    ],
    depth: {
      origin: bi(
        '1985 年的玻尔兹曼机已经给出一条完全局部的更新规则——两个阶段之差，每一相都只用突触两端的统计量。挡住它的从来不是局部性，是采样代价。2017 年 Scellier 与 Bengio 的平衡传播把随机采样换成确定性弛豫，「跑两遍、取差」才变成物理系统真能做的事。',
        'By 1985 the Boltzmann machine already had a fully local rule — a difference between two phases, each using only statistics available at the two ends of a synapse. What blocked it was never locality but the cost of sampling. Equilibrium propagation (Scellier and Bengio, 2017) replaced sampling with deterministic relaxation, and only then could matter do it.',
      ),
      minimalForm: 'Δwᵢⱼ ∝ (1/β) [ ⟨sᵢsⱼ⟩_clamped(β) − ⟨sᵢsⱼ⟩_free ]',
      canonicalSubstrates: [
        sub('平衡传播与基于能量的网络', 'Equilibrium propagation in energy-based networks', '机器学习', 'Machine learning', 0,
          '先让网络落到自由平衡态，再把输出轻推向目标落到第二个平衡态，权重更新就是同一个局部量在两态下之差',
          'the network settles to a free equilibrium, the output is nudged for a second one, and each weight\'s update is the difference of the same local quantity between them',
          '两态之差只有在推力趋零的极限下才等于真梯度，而那个极限下信号与噪声同阶。真跑在器件上的一律是有限推力的近似——问题不在局部性，在极限。',
          'The difference equals the true gradient only as the nudge vanishes, and in that limit signal and noise are the same size. Everything running on hardware uses a finite nudge: the difficulty is not locality but the limit.'),
        sub('突触可塑性', 'Synaptic plasticity', '神经科学', 'Neuroscience', 1,
          '一个突触只能看到前后两个神经元的活动，外加少量弥散广播的调质信号',
          'a synapse sees the activity of the two neurons it joins, plus a little diffusely broadcast neuromodulator',
          '生物的局部性是硬约束但不纯粹：多巴胺一类调质是全局广播的第三个因子。皮层学习既不是纯局部的两因子规则，也没有逐突触的全局误差信号。',
          'Biological locality is a hard constraint but not a clean one: neuromodulators like dopamine are a globally broadcast third factor. Cortical learning is neither a purely local two-factor rule nor a per-synapse global error signal.'),
        sub('交叉阵列的原位训练', 'In-situ training of a crossbar array', '电子工程', 'Electronic engineering', 3,
          '让物理网络自己弛豫到平衡，再按每个交叉点上的局部电压差改写器件电导',
          'the network relaxes on its own, then each device\'s conductance is rewritten from the local voltage difference at its crosspoint',
          '器件写入有阈值、方向不对称、次数有限，更新因此是量化且不对称的跳变。收敛性分析假设的连续更新在这里不成立，而每次更新还要付两遍弛豫时间。',
          'Device writes are thresholded, asymmetric in direction and finite in number, so an update is a quantised and lopsided jump. The continuous update the convergence analysis assumes does not hold, and each one still pays the settling time twice.'),
        sub('自适应弹性网络', 'Adaptive elastic networks', '力学', 'Mechanics', 2,
          '用外力把网络的一部分钳在目标位形，每根杆按自身受力的变化调整劲度',
          'part of the network is held at a target configuration by force, and each bond adjusts its stiffness from the change in load it carries',
          '机械基底里的钳制要施加真实的力：太小被摩擦与滞后吃掉，太大把网络推出线性区。β 的可用窗口由材料定，而理论要求的正是把 β 推向零。',
          'Clamping here means applying a real force: too small and friction and hysteresis absorb it, too large and the network leaves its linear regime. The window for β is set by the material, while the theory asks for β to go to zero.'),
      ],
      relations: [
        rel('intervention-identifiability', 'special-case-of',
          '把输出钳住就是一次干预，局部更新读的正是自由态与受钳态之差；环境固定成两个、干预由学习者自己施加，覆盖条件因此自动满足——代价是除这两态之外什么也识别不出来。',
          'Clamping the output is an intervention, and the local update reads exactly the difference between the free and the intervened state. The environments are fixed at two and the learner imposes the intervention itself, so coverage holds by construction, at the price of identifying nothing beyond those two states.'),
        rel('attractor-networks-hopfield', 'emerges-from',
          '这是能量网络在「除了落到平衡态，还要把输出钳住再落一次」时做的事；吸引子网络负责把状态收到一个稳定点，学习整个建立在有两个这样的点可以相减上。',
          'What an energy network does when, besides settling, it is clamped at the output and settled again; the attractor network supplies a stable point to fall into, and the learning rests entirely on there being two such points to subtract.'),
        rel('least-action-variational-principles', 'special-case-of',
          '这是变分原理把被变分的量固定成一个物理连接参数的特例：两态都是同一个能量的驻点，权重的梯度等于驻点值对该参数的导数，学习规则因此是恒等式的一边而不是近似。',
          'A variational principle with the varied quantity fixed to be a physical connection parameter: both states are stationary points of one energy, and the gradient with respect to a weight equals the derivative of the stationary value with respect to that parameter, so the rule is one side of an identity rather than an approximation.'),
      ],
      mistakenFor: bi(
        '最常被误当成「把反向传播搬进硬件」。差别在信息从哪来：反向传播要把误差沿与前向对称的权重逐层送回，硬件实现要么复制一条反向通路要么共享权重，都是全局布线。这条骨架只让每条连接读身边已有的物理量。第二种误认是把任何 Hebb 型规则都算进来：没有第二个受约束态，规则学不到全局任务，只是在累积相关。',
        'Most often mistaken for backpropagation in hardware. The difference is where the information comes from: backpropagation sends error backwards through weights mirroring the forward ones, and any hardware version either duplicates a reverse path or shares the weights — both global wiring. Here each connection reads only what is already beside it. A second confusion counts any Hebbian rule: with no second constrained state a rule cannot encode a global task, only accumulate correlations.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/stateful-in-materia-computation',
    quantities: [
      q('状态变量', 'the state variable',
        '材料内部真正携带历史的那个物理量；它必须能被独立读出，否则「状态」只是事后拟合出来的说法',
        'the physical quantity inside the material that carries the history; it has to be readable on its own, or the state is only a story fitted afterwards'),
      q('保持时间与漂移率', 'retention and drift',
        '状态在没有输入时能活多久、往哪个方向漂；这条线划开计算与老化',
        'how long the state survives without input and which way it wanders; this is the line between computing and ageing'),
      q('可重编程性', 'reprogrammability',
        '能不能把状态写回一个指定值并重复得到它；这一条是迟滞与计算的分水岭，别的条件替代不了',
        'whether the state can be written back to a specified value and obtained again; the watershed between hysteresis and computation, for which nothing else substitutes'),
      q('读出的可分性', 'readout separability',
        '不同的输入历史在读出上分得开多少；留出任务能不能过直接取决于它',
        'how far apart different input histories are at the readout; whether a held-out task can be passed depends directly on it'),
    ],
    depth: {
      origin: bi(
        '器件一支从 Chua 1971 年从电路对称性推断出的第四种元件开始，2008 年 HP 把氧化钛薄膜认作忆阻器后才热起来。真正收紧这条骨架的是后来的反省：几乎任何有损耗的非线性介质都能被调得像在计算，于是留出任务与可重编程从演示时的修辞变成了准入条件。',
        'The device line starts with Chua\'s 1971 inference of a fourth circuit element from symmetry and became crowded only after HP identified titanium-dioxide films as memristive in 2008. What tightened the skeleton was a later reckoning: almost any lossy nonlinear medium can be tuned to look as though it computes, so held-out tasks and reprogrammability moved from rhetoric to conditions of entry.',
      ),
      minimalForm: 'sₜ₊₁ = U(sₜ, uₜ) ;  yₜ = R(sₜ, uₜ) ;  计算 ⟺ U 可复现 且 s 可被写入指定值',
      canonicalSubstrates: [
        sub('忆阻交叉阵列', 'Memristive crossbar arrays', '材料科学', 'Materials science', 2,
          '导电细丝的形成与断裂把电导设到一个可寻址的值，可以写、可以擦、可以再写',
          'forming and rupturing a conductive filament sets the conductance to an addressable value that can be written, erased and written again',
          '细丝的形成是随机成核：同一个写脉冲在同一个器件上给出的是一个电导分布。可重编程在统计意义上成立、在单次意义上不成立，算子精度被离散度封顶。',
          'Filament formation is stochastic nucleation, so the same write pulse on the same device yields a distribution of conductances. Reprogrammability holds statistically and not on a single write, which caps the operator\'s precision at the spread.'),
        sub('相变存储', 'Phase-change memory', '凝聚态物理', 'Condensed-matter physics', 1,
          '非晶与晶态的比例保存着输入历史，电阻随时间按对数规律漂移',
          'the ratio of amorphous to crystalline material holds the input history, and the resistance drifts logarithmically with time',
          '电阻漂移是内在的结构弛豫，不是能标定掉的偏置：多值存储的每一级都在往上爬。于是能存多久与能分几级不能同时要。',
          'The drift is intrinsic structural relaxation rather than a bias that can be calibrated away, and every level of a multi-level cell climbs: how long a state lasts cannot be bought together with how finely it is divided.'),
        sub('物理储备池计算', 'Physical reservoir computing', '非线性动力学', 'Nonlinear dynamics', 3,
          '基底把输入历史投影到一个高维瞬态，只有线性读出层被训练',
          'the substrate projects the input history into a high-dimensional transient and only a linear readout is trained',
          '储备池的算子完全不可编程——它是被造出来的，不是被设定的。可重编程的要求在这里只落在读出层，所以它检验的是可分性，对状态更新的可控性说不出话。',
          'The reservoir\'s operator is not programmable at all: it is fabricated rather than set. The reprogrammability requirement lands only on the readout, so what gets tested is separability and nothing is said about control over the state update.'),
        sub('基因回路的双稳态', 'Bistable gene circuits', '微生物学', 'Microbiology', 0,
          '一个双稳的调控回路把过去的诱导物暴露记成两种可以遗传给子代的表达态',
          'a bistable regulatory circuit records a past exposure as one of two expression states that daughter cells inherit',
          '状态随分裂被稀释也会自发翻转，保持时间是一个分布而不是常数。更麻烦的是状态与读出共用同一套分子：读一次就动了状态。',
          'The state is diluted by division and flips spontaneously, so retention is a distribution rather than a constant. Worse, state and readout share the same molecules: reading perturbs the state.'),
      ],
      relations: [
        rel('executable-knowledge', 'emerges-from',
          '这是可执行主张的那套要求落到一块材料上时的样子：状态更新、算子与读出合起来充当签名，留出任务充当验证器。缺任何一件，器件是可读的，不是可复核的。',
          'What the executable-claim discipline looks like when the object is matter: the state update, the operator and the readout together act as the signature, and a held-out task acts as the validator. Missing any of the three, the device is readable rather than checkable.'),
        rel('substrate-local-learning', 'generates',
          '要在材料里训练，材料先得有一个可写、可读、可复现的状态；没有可复现的状态更新，局部规则就没有能写进去的地方，在材料中学习也就无处落脚。',
          'Training inside a material presupposes a state that can be written, read and reproduced; without a reproducible state update a local rule has nowhere to write, and learning in the material has nothing to stand on.'),
        rel('path-dependence', 'special-case-of',
          '这是路径依赖加上「路径必须能读出、也必须能重设」之后的特例。加上这一条，历史就从一个已经发生的事实变成一个可用的变量；不加，材料只是记得，没有在算。',
          'Path dependence with the added requirement that the path be readable and re-settable. With it, history turns from something that already happened into a usable variable; without it the material merely remembers and is not computing.'),
      ],
      mistakenFor: bi(
        '最常被误当成「任何带记忆的材料」。迟滞近乎普遍：铁磁、土壤湿度、金属疲劳都依赖历史，却没有一个能被写进指定状态、再据此改变后续输入的变换。三条缺一不可——状态能设成给定值、算子设定后可复现、读出在没见过的任务上仍分得开。第二种误认是把拟合当成计算。',
        'Most often mistaken for any material with memory. Hysteresis is nearly universal — ferromagnets, soil moisture, metal fatigue all depend on history — yet none can be written to a specified state and then transform later inputs accordingly. Three conditions are required and none is optional: the state can be set to a given value, the operator is reproducible once set, and the readout still separates on a task the system has not seen. The second confusion is fitting mistaken for computing, which is what a held-out task exists to catch.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/adjoint-functors',
    quantities: [
      q('一对方向相反的翻译 F ⊣ G', 'a pair of opposite translations F ⊣ G',
        '结构由这一对翻译定义；离开具体的一对，谈「保持了什么、丢了什么」没有内容',
        'the structure is defined by this pair; away from a specific pair, saying what is preserved and what discarded has no content'),
      q('单位 η', 'the unit η',
        '从原对象到「翻过去再翻回来」的典范映射；最优近似落在哪里由它给出',
        'the canonical map from an object into its round trip, which says where the best approximation lands'),
      q('余单位 ε', 'the counit ε',
        '反方向上的典范映射；与 η 合起来把近似误差变成可计算的，也标出左右不对称在哪里',
        'the canonical map in the other direction; with η it makes the error computable, and it is where the asymmetry between the two sides shows'),
      q('hom 集双射', 'the hom-set bijection',
        'Hom(F a, b) ≅ Hom(a, G b) 且对两个变量都自然；这是伴随的定义式，也是判定一对翻译是否真构成伴随的唯一检验',
        'Hom(F a, b) ≅ Hom(a, G b), natural in both arguments; the definition, and the only test of whether a pair really is an adjunction'),
    ],
    depth: {
      origin: bi(
        '由 Daniel Kan 在 1958 年一篇讲单纯形与同伦的论文里作为工具引入，定义就是 hom 集的自然双射；「伴随无处不在」是后来 Mac Lane 才认出来的。改用单位与余单位陈述更晚，而正是这一步把它从一条巧合变成能施工的构造——η 与 ε 是具体映射，能拿三角恒等式去检验。',
        'Introduced by Daniel Kan in 1958 as a tool, in a paper on simplicial sets and homotopy; his definition was the natural bijection of hom-sets, and that adjoints are everywhere was recognised only afterwards, by Mac Lane. Stating an adjunction by its unit and counit came later, and that step turns it from a coincidence into something you can build with: η and ε are concrete maps you can check against the triangle identities.',
      ),
      minimalForm: 'Hom_D(F a, b) ≅ Hom_C(a, G b) 自然于 a, b ;  η : 1_C ⇒ G F ,  ε : F G ⇒ 1_D',
      canonicalSubstrates: [
        sub('自由构造与遗忘函子', 'Free constructions and forgetful functors', '代数', 'Algebra', 0,
          '「由一个集合生成的自由群」与「忘掉群结构只留集合」构成一对伴随，自由群是满足生成要求的最省对象',
          'the free group on a set and the functor forgetting the group structure form an adjoint pair, the free group being the most economical object meeting the demand',
          '自由这一侧几乎总在，另一侧却不对称：很多结构没有余自由对象，这一对不能互换。左伴随保余极限、右伴随保极限，连保持什么都是分开的。',
          'The free side almost always exists while the other does not: many structures have no cofree object, so the pair cannot be swapped. Left adjoints preserve colimits and right adjoints preserve limits — even what they preserve is split.'),
        sub('Galois 连接', 'Galois connections', '序理论', 'Order theory', 3,
          '两个偏序集之间一对映射满足 F(a) ≤ b ⟺ a ≤ G(b)，这就是 hom 集双射在两点之间至多一个态射时的样子',
          'a pair of maps between posets with F(a) ≤ b ⟺ a ≤ G(b) — the hom-set bijection where any two objects have at most one arrow between them',
          '序集里两点之间至多一个态射，自然性这条要求因此被免掉了。它好验证也好教，代价是让人以为伴随就这么简单——一般范畴里自然性正是最难满足的那条。',
          'With at most one arrow between two objects, naturality is waived. It is easy to verify and easy to teach, at the cost of suggesting adjunctions are that simple: in a general category naturality is the hardest condition to meet.'),
        sub('量词与代换', 'Quantifiers and substitution', '数理逻辑', 'Mathematical logic', 1,
          '存在量词是代换的左伴随、全称量词是右伴随；「先代换再判断」与「先判断再代换」之间的两个典范方向就是单位与余单位',
          'the existential quantifier is left adjoint to substitution and the universal is right adjoint; the two canonical directions between substituting first and judging first are the unit and the counit',
          '这个读法要求底层有足够好的纤维结构，一般的逻辑系统并不提供。伴随刻画的是量词的普遍性质，不替代它们的证明论规则——说清量词是什么，没说怎么推。',
          'The reading requires a well-behaved fibred structure underneath, which a general logical system does not supply. The adjunction characterises what the quantifiers are and does not replace their proof-theoretic rules: what they are, not how to reason with them.'),
        sub('数据库模式之间的迁移', 'Migration between database schemas', '计算机科学', 'Computer science', 2,
          '沿一个模式映射把数据拉回是一个方向，它的左右伴随分别把数据「尽量推过去」与「按约束推过去」；余单位说的正是推过去再拉回来与原数据差多少',
          'pulling data back along a schema map is one direction, and its left and right adjoints push data forward permissively and restrictively; the counit is how far the round trip lands from the original',
          '现实的模式映射常常不是函子：有部分函数、有空值、有不被满足的约束。一旦不是函子，这三元组根本没有定义，它对干净的模式成立，对脏模式无话可说。',
          'Real schema maps are frequently not functors — partial functions, nulls, constraints that do not hold — and where the map is not a functor the triple is undefined. It applies to clean schemas and says nothing about dirty ones.'),
      ],
      relations: [
        rel('optimal-transport', 'explains',
          'Kantorovich 对偶里那一对 c-变换正是序集上的伴随，c-凹函数恰好是「翻过去再翻回来」的不动点；对偶解为什么一定长成那种受限形式，答案在这里，而不在任何关于运输的直觉里。',
          'The pair of c-transforms in Kantorovich duality is an adjunction between ordered sets, and c-concave functions are precisely the fixed points of going across and back. Why the dual solution must take that restricted form is answered here rather than by any intuition about moving mass.'),
        rel('commensuration-cost', 'generates',
          '翻译的代价在这里不再是个说法，而是两个具体的映射：η 与 ε 就是那份代价本身，写得下来也量得出来。代价为零只在两侧构成等价的退化情形出现，那是通约不必付费的唯一条件。',
          'The cost of translation stops being a manner of speaking and becomes two concrete maps: η and ε are the cost, writable and measurable. It vanishes only in the degenerate case where the two sides are an equivalence, the one condition under which commensuration is free.'),
        rel('executable-knowledge', 'explains',
          '类型对得上只保证组合合法，不保证意义没在翻译中丢掉。两个形式化之间能否互相引用而无损，条件是伴随而不是签名匹配——这是可执行公地的组合规则默认了却从没陈述过的那一条。',
          'Matching types makes composition legal without guaranteeing that meaning survived the translation. Whether two formalisations can cite each other without loss is a question of adjointness rather than signature agreement, and that is the condition an executable commons assumes and never states.'),
      ],
      mistakenFor: bi(
        '最常被误当成「差不多是互逆」。伴随恰恰是互逆失败之后留下的东西：翻过去再翻回来一般回不到原处，η 与 ε 精确记下差多少，而且这个差有方向——左右伴随不能对调。第二种误认是把「两边都有翻译」当成伴随：任意一对反向函子都能互译，伴随要的是 hom 集双射对两个变量都自然。',
        'Most often mistaken for "roughly inverse". An adjunction is what survives when invertibility fails: going across and back does not return you to where you started, η and ε record how far off it lands, and the gap has a direction, since left and right adjoints are not interchangeable. The second confusion takes translations in both directions for adjointness: any opposite pair of functors translates, while an adjunction demands the hom-set bijection be natural in both arguments — the line between an analogy and a construction.',
      ),
    },
  },
  {
    structureId: 'struct://xfrontier/gauge-equivariance',
    quantities: [
      q('对称群 G', 'the symmetry group G',
        '被要求在每一点独立作用的变换群；它一旦选定，被逼出来的场有多少分量、彼此怎么作用就都定了',
        'the group required to act independently at every point; once chosen it fixes how many components the forced field has and how they interact'),
      q('联络 A', 'the connection A',
        '局域要求逼出来的新对象；有了它，「在不同点上比较」才有定义，而这正是原来的导数做不到的',
        'the new object the local demand forces into being; with it, comparing at different points is defined at all, which the plain derivative could not do'),
      q('协变导数 D = ∂ + A', 'the covariant derivative D = ∂ + A',
        '把普通导数改造成在局域变换下同变的形式；「逼出」这一步的具体形态就是它，也是理论里唯一被改动的地方',
        'the plain derivative rebuilt to transform covariantly under the local action; the concrete form the forcing takes, and the only place the theory is altered'),
      q('曲率 F', 'the curvature F',
        '沿闭合回路走一圈后剩下的差；联络本身可以被变换掉而它不能，所以是它判定这个场有没有物理内容',
        'what is left after going once around a closed loop; the connection can be transformed away and this cannot, so it decides whether the field has physical content'),
    ],
    depth: {
      origin: bi(
        'Weyl 1918 年提出的是尺度规范：长度标定可以逐点选取，被 Einstein 当场否掉——同样的钟沿不同路径走一圈会走出不同快慢。1929 年量子力学给出复相位后，他把同一套形式改读成相位的局域任意性，理论立刻成立。「规范」这个名字是那次失败留下的化石，今天的理论与长度标定毫无关系。',
        'Weyl\'s 1918 proposal was a scale gauge: length calibration choosable point by point, which Einstein killed on the spot by noting that identical clocks carried around different paths would end up running differently. In 1929, once quantum mechanics supplied a complex phase, he reread the same formalism as a local arbitrariness of phase and it worked immediately. The name is a fossil of the failure — nothing in the surviving theory has to do with calibrating a length.',
      ),
      minimalForm: 'D = ∂ + A ;  A → g A g⁻¹ + g d(g⁻¹) ;  F = dA + A ∧ A',
      canonicalSubstrates: [
        sub('电磁场', 'The electromagnetic field', '电动力学', 'Electrodynamics', 1,
          '矢势是要求波函数的相位可以在每一点独立选取时被逼出来的场，电磁场强就是它的曲率',
          'the vector potential is the field forced into being by letting the wavefunction\'s phase be chosen independently at each point, and the field strength is its curvature',
          '这里的规范群是可交换的 U(1)，曲率里的 A ∧ A 项为零，规范场不与自身相互作用。多数人的规范直觉在这里养成，搬到非交换情形会漏掉整套理论最核心的非线性。',
          'The group here is the commutative U(1), so the A ∧ A term vanishes and the field does not interact with itself. Most people\'s intuition about gauge was formed here, and carrying it to the non-commutative case loses the nonlinearity the theory turns on.'),
        sub('广义相对论', 'General relativity', '引力理论', 'Gravitation', 2,
          '要求物理定律在任意坐标变换下形式不变，普通导数就被换成带 Christoffel 联络的协变导数',
          'demanding that the laws keep their form under arbitrary coordinate change replaces the plain derivative with one carrying the Christoffel connection',
          '这里的联络由度规完全决定，不是独立的场，自由度因此比杨—米尔斯类少一大截。说「引力也是规范理论」之前得先讲清这个约束，否则借的只是词。',
          'The connection here is fully determined by the metric rather than being an independent field, leaving far fewer degrees of freedom than a Yang–Mills theory has. Saying gravity is a gauge theory requires stating that constraint first, or only the word has been borrowed.'),
        sub('能带中的 Berry 相位', 'Berry phase in electronic bands', '凝聚态物理', 'Condensed-matter physics', 3,
          '布洛赫波在动量空间每一点的相位可以随意选，Berry 联络就是这份任意性逼出来的，曲率的积分给出可观测的整数',
          'the phase of a Bloch state may be chosen freely at each point of momentum space; the Berry connection is what that freedom forces, and the integral of its curvature is an observable integer',
          '这里的规范场活在动量空间而不是实空间，也不是能被外界的源激发的动力学场。曲率有确凿的物理效应，联络本身却仍是纯粹的记号自由度，两者在这里分得最开。',
          'This gauge field lives in momentum space rather than real space and is not a dynamical field any source can excite. The curvature has firm physical consequences while the connection remains pure notational freedom, and nowhere are the two so cleanly separated.'),
        sub('等变神经网络', 'Equivariant neural networks', '机器学习', 'Machine learning', 0,
          '把网络限制成对旋转或平移群等变，卷积核允许的形式就被这个群完全定下来',
          'constraining a network to be equivariant to a rotation or translation group fixes the admissible form of its kernels entirely',
          '这里的等变是全局的对称约束，不是每一点独立的局域要求，所以它没有逼出任何新的场，只是把假设空间削小——与规范理论共用词汇，缺的正是生成新对象的那一步。',
          'Equivariance here is a global constraint rather than an independent demand at each point, so it forces no new field into existence and merely shrinks the hypothesis space: the vocabulary of gauge theory without the step that generates a new object.'),
      ],
      relations: [
        rel('adjoint-functors', 'special-case-of',
          '「提出一个要求，取满足它的最省结构」正是自由构造的形状：最小耦合是一个普遍性质的主张——协变导数是使要求成立的、对导数最小的改动。物理学家很少这样说，但这条把「被逼出来」从修辞变成可定义的东西。',
          'Posing a demand and taking the most economical structure that meets it is the shape of a free construction: minimal coupling is a universal-property claim, the covariant derivative being the smallest modification of the derivative that makes the demand hold. Physicists rarely put it this way, but it turns "forced into existence" from rhetoric into something definable.'),
        rel('least-action-variational-principles', 'emerges-from',
          '这是变分原理在对称参数从常数变成逐点函数时做的事：全局不变按 Noether 只给出一条守恒流，什么新东西都不产生；参数一旦局域化，那条守恒流就变成必须有东西与之耦合的源，而那个东西就是联络。',
          'What a variational principle does when the symmetry parameter stops being a constant and becomes a function of position: a global invariance yields a conserved current by Noether and produces nothing new, but once the parameter is localised that current becomes a source something must couple to, and the something is the connection.'),
        rel('information-geometry', 'explains',
          '统计流形上为什么光有度规不够、还得有联络：要求两个分布的比较与各点如何参数化无关，就是一次局域规范要求，α-联络正是它逼出来的，而不是为方便另选的一套约定。',
          'Why a statistical manifold needs a connection and not only a metric: demanding that a comparison of distributions be independent of how each point is parameterised is a local gauge demand, and the α-connections are what it forces rather than a convention chosen for convenience.'),
      ],
      mistakenFor: bi(
        '最常被误当成一道检验：拿写好的理论去查它在某个变换下变不变。方向反了——这里是先把不变性当成要求提出来，理论里缺什么就补什么，补出来的就是联络。第二种是把全局对称当成局域对称：全局不变按 Noether 只给出守恒流，不产生新场。第三种是把规范自由度当成物理自由度：联络能被变换掉，可观测的是曲率。',
        'Most often mistaken for a test — taking a finished theory and checking whether it survives a transformation. The direction is reversed: the invariance is posed as a demand, whatever the theory lacks is supplied, and what is supplied is the connection. A second confusion is global for local symmetry: a global invariance yields a conserved current by Noether and no new field, and only a parameter that varies from point to point turns that current into a source. A third treats gauge freedom as physical: the connection can be transformed away, and what is observable is the curvature.',
      ),
    },
  },
];
