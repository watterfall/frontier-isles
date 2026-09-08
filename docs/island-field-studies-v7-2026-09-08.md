# 十岛考察：内容与交互融合

用户要求：选择 5–10 个内容充分的岛屿或合适扩展方向，基于约 10 个主题深入设计，强调探索与前沿领域的结合。

本地体验入口：[组合式科学建模岛](http://127.0.0.1:5173/#island=compositional-modeling)。点击岛屿侧栏的考察邀请（“进入实验坊 · 自由考察”），或由实验坊进入“自由考察”房间；展开“十岛考察”可直接换岛。

## 选题依据与设计约束

从现有 `INTERIORS` / `INTERIORS_2` 审计，选择以下十岛。每岛已有 7 条编辑问题、5 条文献摘要、3 组讨论、4 条实验坊材料；选择考虑可操作的研究难点、原始来源与主题差异，没有按访问量或科研价值排名。保留原问题对象、来源身份、账本与已有编辑材料。本次属于新编教学与考察层，不是 xFrontier 数据更新。

延续现有矿物色、纸面、界画建筑及 L1 岛屿 → 建筑 → L2 房间。每岛实验坊新增可自由进入的“自由考察”房间；文献阁新增“考察的来源与边界”。场景入口、建筑平面与阅读地址共享这些房间。岛上提供十岛索引，无完成顺序或奖励。考察页包含不同的图示/规则、可改变的条件、即时观察、模型边界、原始来源、开放追问及有边界的下一岛线索。不是十张重复的问答卡。

| 岛屿 slug | 考察动作与计算 | 与真实研究的界线 |
| --- | --- | --- |
| 形式化数学 `formal-math` | 改变量词、代入 n²=n，区分反例与见证 | 不运行 Lean；等式演算不是形式化证明 |
| 因果表征 `causal-rep-learning` | 观察 / do(X)，比较 X→Y 与 X←U→Y | 已知变量、无噪声反例，非潜变量恢复算法 |
| 组合式科学建模 `compositional-modeling` | 连接水库并修正 L/h 与 L/min，重算守恒 | 最小单位算例，非 Catlab 或真实水文仿真 |
| AI 理论发现 `ai-theory-discovery` | 扩大 x，比较线性/三阶近似与 sin(x) | 参考规律预先写定，没有训练或发现成绩 |
| 自学习物理网络 `self-learning-matter` | 固定电导 / 误差更新，观察分压输出 | 教学反馈规则，非论文的局部对比学习 |
| 最小基因组与细胞 `minimal-genome` | 切换环境供给与内部合成，追踪 OR 依赖 | 抽象布尔可达性，非基因/存活预测 |
| 动物交流解码 `animal-ai-decode` | ABC/D/自然组合/逆序，切换结构与行为层 | 定性论文观察；无鸟声、翻译或虚构概率 |
| 量子擦除转换 `erasure-conversion-qubits-turning-loss` | 比较未知位置翻转与已知位置擦除，枚举偶校验候选数 | 两种经典错误通道，非同一翻转仅增加位置标记，非量子态/阈值仿真 |
| 无序中的超均匀性 `hyperuniformity-hidden-order-disorder` | 改变点生成规则与观察半径，实际计算 100 个窗口计数 | 有限周期样本，不能证明无限尺度超均匀性 |
| 细胞扰动预测评测 `adversarial-falsification-benchmark-science` | 按细胞/扰动/环境划分，检查训练重合 | 只有成员关系，无表达量、模型或性能排名 |

## 来源核对（2026-09-08）

以下来源对应 `field-study/studies.ts` 的逐条 finding / boundary；没有复用来源图像。

- [Lean 4 官方证明文档](https://lean-lang.org/theorem_proving_in_lean4/Propositions-and-Proofs/)：命题、类型与证明项；网页读取。
- [Weakly supervised causal representation learning](https://arxiv.org/abs/2203.16437)：配对干预样本与假设限定的可识别性；摘要读取。
- [An Algebraic Framework for Structured Epidemic Modeling](https://arxiv.org/abs/2203.16345)：显式子模型结构与组合；摘要读取。水库算例为新编，不声称复制论文。
- [AI Feynman](https://arxiv.org/abs/1905.11481)：物理启发的符号表达式搜索；摘要读取。未将已知公式恢复泛化为发现未知规律。
- [Machine Learning Without a Processor](https://arxiv.org/abs/2311.00537)：非线性模拟电阻网络；摘要读取。不把本地教学反馈写成原论文算法。
- [Genetic requirements for cell division](https://cba.mit.edu/docs/papers/21.03.Cell.pdf)：论文作者机构 PDF，以及研究团队 [NIST 报告](https://www.nist.gov/news-events/news/2021/03/scientists-develop-cell-synthetic-genome-grows-and-divides-normally)核对；新增抽象依赖不指向具体基因、培养配方或操作协议。
- [Experimental evidence for compositional syntax in bird calls](https://www.nature.com/articles/ncomms10986)：原论文摘要与方法；限日本山雀回放条件，不泛化为动物通用语言。
- [Erasure conversion for fault-tolerant quantum computing](https://www.nature.com/articles/s41467-022-32094-6)：原论文摘要；阈值依赖特定模拟假设，页面不引用阈值作通用常数。
- [Hyperuniform States of Matter](https://arxiv.org/abs/1801.06924)：作者综述摘要；大尺度涨落判据，不以一次有限取样证明。
- [2025 perturbation comparison](https://www.nature.com/articles/s41592-025-02772-6)：原页面直开报错；通过出版方 PDF 搜索摘录与作者 [代码仓库](https://github.com/const-ae/linear_perturbation_prediction-Paper)核对设置与方向，没有声称读完全文。
- [TxPert](https://www.nature.com/articles/s41587-026-03113-4)：出版方页面读取，2026-05-01；新增并列的后续研究，保持“特定任务改进”与“需统一评测”的边界。不跨论文拼接成绩。

探索线索为编辑提出的问题迁移，逐条标出类比失效处，不产生科学关系边、账本记录或验证状态。考察只在浏览器计算；唯一外链为用户主动打开来源。

## 连续性与可访问性

条件与追问草稿按岛屿、版本保存在本地存储，恢复时检验选择范围、数值边界和文本长度。存储失败显式提示仅当前打开的考察保留。加入札记是显式追加：保留已有文字、拒绝溢出、避免相同条目重复；同时记录条件、计算观察、追问和来源。使用现有岛屿札记的回看/导出路径。考察跨房间跳转携带具体条件和追问到对应来源房间；上一处返回恢复操作和草稿。下一岛是编辑线索导航，个人草稿留在原岛。

使用原房间键盘导航和对话框焦点约束；控件采用原生 range 或具有 pressed 状态的按钮。计算观察可朗读，图示有相邻规则说明。手机横向图示限制在可聚焦的图面容器内，并提示横向查看；正文与控件不扩宽页面。手机也接通十岛索引和下一岛导航，切岛重置当前阅读上下文并更新岛屿 hash。英文模式使用已有图集译文显示标题和主问题。无装饰循环动画，不依赖 GPU 运行考察。

## 验证

- `pnpm verify` 成功：1,249 项工作区测试和 22 项根脚本测试通过，递归类型检查、数据投影/导入检查与生产构建通过（`/tmp/frontier-v7-verify.log`）。本轮新增 9 项模型与集成测试；最终修正后再次通过全部 435 项前端测试，以及前端类型检查和构建（`/tmp/frontier-v7-{web,type,build}-final.log`）。既有大分包警告仍存在。
- 主浏览器回归共 12 项通过：四项十岛考察流程与八项原岛屿探索流程（`/tmp/frontier-v7-e2e-final.log`）。覆盖十种条件切换及观察更新、精确来源房间与返回、草稿刷新恢复、追加札记与满额保护、存储不可用、手机英文十岛索引、跨岛导航和键盘图面滚动。随后单独运行新增的无 WebGL 建筑入口用例，1/1 通过；不把两次运行表述为一次 13 项完整运行。
- 20 张最终截图位于 `.impeccable/review/v7-{overview,index,proof,causal,compose,theory,matter,cell,calls,erasure,order,benchmark,evidence,question,sources,night,mobile-island,mobile-study,mobile-controls,tablet-en}.png`。逐张打开确认内容与命名相符；桌面 1440px、英文平板 1024px、手机 390px 均无页面横向溢出。夜间、手机及英文考察区域 Axe 无报告项，浏览器无页面错误（`/tmp/frontier-v7-capture-final.log`）。截图只作为 QA 证据，不是产品图片。
- 设计检测仅运行一次，三项均为 advisory：考察内容 h4 的 19px 标题与原页面两处 `#8A6A1E`。没有机械级问题，没有添加忽略项；由独立审查判定是否需调整或记录为局部角色（`/tmp/frontier-v7-detector.json`）。
- 独立设计初审提出一项修正：量子擦除算例的文字必须与翻转/擦除两种通道一致，不能表述为同一组翻转只增加位置信息。已统一修正中英文标题、问题、邀请、控件和观察，并补充边界。修正后 9/9 相关测试、一次生产构建通过；同一组 20 张截图复拍，三组区域 Axe 仍无报告项、页面宽度匹配、无页面错误（`/tmp/frontier-v7-review-{unit,build,capture}.log`）。另在中英文浏览器内断言 k=3 时两通道的候选数分别为 56 与 4，通过；补充 `v7-erasure-{flips,erasures,flips-en}.png` 三张有效截图（`/tmp/frontier-v7-erasure-review.log`）。同一审查者逐张打开全部 23 张复拍后，将唯一修正评分为 **resolved**、最终 **disposition: ship**；这是对该修正清单的判定，不是新的全产品审查。[独立审查记录](island-field-studies-v7-review.md)保留了初审与复核范围。

本轮为本地实现与验证：Vite 在 5173 端口，API 在 8787 端口并使用内存存储。既有磁盘数据库/目录身份不匹配未作为本轮修复项。上述结果不代表生产发布、数据库迁移、真人可用性研究、全产品可访问性认证或科学实验验证；没有执行提交、推送或部署。

可复用的界面规则统一记录于 [前端设计规范](../apps/web/DESIGN.md)：十岛共用房间入口、文献与札记流程，各主题通过自己的图示、条件和计算规则展开探索。
