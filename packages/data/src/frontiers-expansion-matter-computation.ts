import type { FrontierEntry } from './frontiers';

/**
 * Wave 2 expansion: matter, energy, sensing, and physical computation.
 *
 * Atlas numbers, cluster labels, score vectors, and source URLs are inherited
 * from the reference xFrontier Atlas. The questions below narrow each direction
 * to a falsifiable research program rather than a broad theme.
 */
export const MATTER_COMPUTATION_EXPANSION: FrontierEntry[] = [
  {
    id: 153,
    atlasN: 951,
    slug: 'programmable-acoustic-holography',
    title: {
      zh: '可编程声学超表面与动态声全息',
      en: 'Programmable Acoustic Metasurfaces and Dynamic Acoustic Holography',
    },
    qfocus: {
      zh: '可重写材料图案与分区压电驱动能否在组织负载下实时合成稳定、可迁移的三维声场？',
      en: 'Can rewritable material patterns and partitioned piezoelectric drive synthesize stable, transferable 3D acoustic fields in real time under tissue loading?',
    },
    domain: '物质',
    cluster: {
      code: 'C16',
      zh: '可编程物质·超材料',
      en: 'Programmable matter · metamaterials',
    },
    scores: [4, 4, 3, 2, 4, 4, 4, 4, 4],
    citation: {
      url: 'https://www.nature.com/articles/s41467-025-64154-y',
      title: 'Reconfigurable dynamic acoustic holography with acoustically transparent and programmable metamaterial',
      venue: 'Nature Communications',
      year: 2025,
    },
    brief: {
      zh: '在半结晶聚合物中写入可擦除的模量图案，再由分区压电换能器驱动，可把静态声学元件变成高像素密度的动态全息界面。关键不只是形成焦点，而是让同一硬件持续重写声镊、超声治疗和体内成像所需的复杂声场。',
      en: 'Erasable modulus patterns written into a semicrystalline polymer and driven by a partitioned piezoelectric transducer turn a static acoustic element into a high-pixel-density dynamic holographic interface. The central challenge is not merely focusing sound, but repeatedly rewriting complex fields for acoustic manipulation, ultrasound therapy, and in-body imaging on the same hardware.',
    },
    literature: [
      {
        title: 'Reconfigurable and active time-reversal metasurface turns walls into sound routers',
        venue: 'Communications Physics',
        year: 2025,
        url: 'https://www.nature.com/articles/s42005-025-02351-3',
      },
      {
        title: 'Tunable, reconfigurable, and programmable acoustic metasurfaces: A review',
        venue: 'Frontiers in Materials',
        year: 2023,
        url: 'https://www.frontiersin.org/journals/materials/articles/10.3389/fmats.2023.1132585/full',
      },
    ],
    depth: {
      overview: {
        zh: '该方向把材料内部可重写的刚度分布当作“声学像素”，以空间相位延迟塑造传播中的声波。与固定加工的声透镜不同，材料状态和驱动分区都可更新，因此同一器件有望连续播放声场序列。',
        en: 'This direction treats rewritable stiffness distributions inside a material as acoustic pixels whose spatial phase delays sculpt propagating sound. Unlike a fixed fabricated lens, both material state and drive partition can be updated, allowing one device to play a sequence of acoustic fields.',
      },
      whyMatters: {
        zh: '若声场能以足够空间精度和刷新率重构，超声聚焦、无接触操控和介入成像可共享一套薄型硬件，并在目标移动或介质变化时闭环调整。',
        en: 'If acoustic fields can be reconstructed with sufficient spatial precision and refresh rate, ultrasound focusing, contactless manipulation, and interventional imaging could share one thin hardware layer and adapt in closed loop as targets or media change.',
      },
      ifAnswered: {
        zh: '成功将使“声学功能”从器件几何中解耦，形成可编程声场平台；失败也会划清可重写材料的热写入速度、衰减与空间分辨率边界。',
        en: 'Success would decouple acoustic function from device geometry and establish a programmable sound-field platform; failure would still map the speed, attenuation, and spatial-resolution limits of thermally rewritable media.',
      },
      approaches: [
        {
          zh: '构建材料状态—相位响应—三维声压场的可微前向模型，并用实测场反演校准。',
          en: 'Build a differentiable forward model from material state through phase response to the 3D pressure field, calibrated by measured-field inversion.',
        },
        {
          zh: '把高速热写入、压电分区寻址与超声相机反馈组成闭环，比较开环与闭环全息误差。',
          en: 'Close the loop among rapid thermal writing, segmented piezo addressing, and acoustic-camera feedback, then compare open- and closed-loop hologram error.',
        },
        {
          zh: '在水、组织仿体和移动散射体中复现同一组靶场，量化介质迁移与重校准成本。',
          en: 'Reproduce the same target fields in water, tissue phantoms, and moving scatterers to quantify medium transfer and recalibration cost.',
        },
      ],
      barrier: {
        zh: '材料写入的热扩散会模糊像素并限制刷新率，真实介质的衰减和多重散射又会破坏相位模型；器件还必须在反复重写后保持透明度与机械稳定。',
        en: 'Thermal diffusion during writing blurs pixels and limits refresh rate, while attenuation and multiple scattering in real media break phase models. The device must also retain transparency and mechanical stability through repeated rewrites.',
      },
      subQuestions: [
        {
          zh: '在一千次写入—擦除循环后，像素相位响应和目标场相似度是否仍保持在预设容差内？',
          en: 'After one thousand write–erase cycles, do pixel phase response and target-field similarity remain within a prespecified tolerance?',
        },
        {
          zh: '加入组织仿体后，闭环校准能否恢复开阔水域中可达到的焦斑尺寸与旁瓣水平？',
          en: 'With a tissue phantom inserted, can closed-loop calibration recover the focal-spot size and sidelobe level achievable in open water?',
        },
        {
          zh: '在相同孔径和声功率下，动态超表面能否显著快于机械扫描地切换三个独立三维焦点？',
          en: 'At matched aperture and acoustic power, can the dynamic metasurface switch among three independent 3D foci significantly faster than mechanical scanning?',
        },
      ],
    },
    stage: 2,
    members: 5,
    activity: 64,
    chart: { x: 160, y: 185, scale: 0.84 },
  },
  {
    id: 154,
    atlasN: 944,
    slug: 'learning-shape-metamaterials',
    title: {
      zh: '会学习改变形状的力学超材料',
      en: 'Mechanical Metamaterials That Learn to Change Shape',
    },
    qfocus: {
      zh: '只用局部刚度更新的弹性网络，能否从少量示例学习多步、非互易且可泛化的形变映射？',
      en: 'Can an elastic network using only local stiffness updates learn multistep, nonreciprocal, and generalizable deformation maps from a small set of examples?',
    },
    domain: '物质',
    cluster: {
      code: 'C31',
      zh: '物理计算·热力学与涨落',
      en: 'Physical computing · thermodynamics and fluctuations',
    },
    scores: [4, 4, 4, 2, 4, 3, 3, 3, 5],
    citation: {
      url: 'https://www.nature.com/articles/s41567-026-03226-2',
      title: 'Metamaterials that learn to change shape',
      venue: 'Nature Physics',
      year: 2026,
    },
    brief: {
      zh: '对比学习可把输入与目标边界条件的差异转化为局部刚度更新，让弹性网络在材料本体中“训练”出复杂形变。它把学习规则、记忆和执行器合并进同一力学结构，但泛化、疲劳和可逆训练仍需系统检验。',
      en: 'Contrastive learning can translate the difference between free and target boundary conditions into local stiffness updates, training complex deformations directly into an elastic network. It merges learning rule, memory, and actuator into one mechanical structure, while generalization, fatigue, and reversible training remain open tests.',
    },
    literature: [
      {
        title: 'Experimental demonstration of coupled learning in elastic networks',
        venue: 'Physical Review Applied',
        year: 2024,
        url: 'https://link.aps.org/doi/10.1103/PhysRevApplied.22.024053',
      },
    ],
    depth: {
      overview: {
        zh: '力学超材料通常由设计者预先计算几何；这里则让结构通过局部可调弹簧或梁，在成对的自由态与目标态之间更新参数。训练完成后，载荷输入可直接触发学得的输出形变，无需数字控制器在线求解。',
        en: 'Mechanical metamaterials are usually precomputed by a designer. Here, locally tunable springs or beams update their parameters between paired free and target states. Once trained, a load input directly elicits the learned output deformation without an online digital controller.',
      },
      whyMatters: {
        zh: '能在材料内部学习的结构适合软机器人、假肢和极端环境机构，因为感知—计算—动作不必经过脆弱的集中电子系统。',
        en: 'Structures that learn within their own material are attractive for soft robots, prostheses, and extreme-environment mechanisms because sensing, computation, and action need not pass through a fragile centralized electronic system.',
      },
      ifAnswered: {
        zh: '若局部训练可扩展到真实三维结构，制造出的部件可在部署后适应任务；若不可扩展，实验将揭示局部学习受非线性、迟滞和结构拓扑限制的边界。',
        en: 'If local training scales to real 3D structures, manufactured parts could adapt after deployment. If it does not, experiments will expose where nonlinearities, hysteresis, and topology limit local learning.',
      },
      approaches: [
        {
          zh: '在可调梁格架上实现对比学习，逐级增加任务数、形变幅度和加载顺序。',
          en: 'Implement contrastive learning on tunable beam lattices while progressively increasing task count, deformation amplitude, and loading sequence length.',
        },
        {
          zh: '用数字图像相关和局部应变传感记录训练轨迹，区分真正的参数学习与瞬态材料迟滞。',
          en: 'Record training trajectories with digital image correlation and local strain sensing to distinguish parameter learning from transient material hysteresis.',
        },
        {
          zh: '把已训练结构置于未见载荷、局部损伤和温度漂移下，测量零样本迁移与再训练速度。',
          en: 'Expose trained structures to unseen loads, local damage, and temperature drift, measuring zero-shot transfer and retraining speed.',
        },
      ],
      barrier: {
        zh: '演示规模仍小，局部可调元件可能依赖外部编程；三维制造误差、材料疲劳和多任务之间的灾难性干扰会随规模迅速累积。',
        en: 'Demonstrations remain small and locally tunable elements may still depend on external programming. Three-dimensional fabrication error, material fatigue, and catastrophic interference among tasks can accumulate rapidly with scale.',
      },
      subQuestions: [
        {
          zh: '学习一个新形变后，先前形变任务的误差会增加多少，是否存在可测的容量上限？',
          en: 'After learning a new deformation, how much does error rise on earlier tasks, and is there a measurable capacity limit?',
        },
        {
          zh: '局部更新规则能否在未参与训练的载荷幅值和方向上优于一次性拓扑优化基线？',
          en: 'Can the local update rule outperform a one-shot topology-optimized baseline on load magnitudes and directions absent from training?',
        },
        {
          zh: '经过规定次数的训练与执行循环后，性能衰减能否由刚度漂移而非不可逆损伤解释？',
          en: 'After a prescribed number of training and actuation cycles, can performance loss be explained by stiffness drift rather than irreversible damage?',
        },
      ],
    },
    stage: 2,
    members: 4,
    activity: 61,
    chart: { x: 310, y: 470, scale: 0.82 },
  },
  {
    id: 155,
    atlasN: 955,
    slug: 'geothermal-brine-critical-minerals',
    title: {
      zh: '地热卤水直接提锂与关键矿物联产',
      en: 'Direct Lithium Extraction and Critical-Mineral Coproduction from Geothermal Brine',
    },
    qfocus: {
      zh: '选择性吸附、离子交换或电化学分离能否在高温高盐真实卤水中连续提锂，同时不破坏地热回注？',
      en: 'Can selective sorption, ion exchange, or electrochemical separation continuously recover lithium from hot hypersaline field brines without compromising geothermal reinjection?',
    },
    domain: '物质',
    cluster: {
      code: 'C17',
      zh: '新能源范式',
      en: 'New energy paradigms',
    },
    scores: [3, 5, 4, 3, 4, 3, 4, 4, 4],
    citation: {
      url: 'https://www.sciencedirect.com/science/article/pii/S1674987126000915',
      title: 'Worldwide geothermal systems as potential sources for critical metals like lithium, rare earth elements and others',
      venue: 'Geoscience Frontiers (Elsevier)',
      year: 2026,
    },
    brief: {
      zh: '地热电站已把深部卤水带到地表，直接提锂可在同一流体回路中联产热、电和关键矿物。真正难点是钠、钙、镁远高于锂的竞争环境，以及硅垢、腐蚀、吸附剂再生和回注水化学之间的系统耦合。',
      en: 'Geothermal plants already bring deep brines to the surface, so direct lithium extraction could coproduce heat, power, and critical minerals within one fluid loop. The hard problem is the system coupling among sodium, calcium, and magnesium competition, silica scaling, corrosion, sorbent regeneration, and reinjection chemistry.',
    },
    literature: [
      {
        title: 'Lithium — Geothermal (HGEO program)',
        venue: 'U.S. Department of Energy',
        year: 2025,
        url: 'https://www.energy.gov/hgeo/geothermal/lithium',
      },
      {
        title: 'Solid Wastes from Geothermal Energy Production and Implications for Direct Lithium Extraction',
        venue: 'Energies (MDPI)',
        year: 2025,
        url: 'https://www.mdpi.com/1996-1073/18/6/1359',
      },
    ],
    depth: {
      overview: {
        zh: '该路线不蒸发大面积盐湖，而是在地热卤水通过地面设施的短停留时间内，用离子筛、膜或电化学界面选择锂，再把处理后的流体回注地下。它要求分离过程与热利用、材料耐久和储层许可共同设计。',
        en: 'Instead of evaporating large brine ponds, this route selects lithium with ion sieves, membranes, or electrochemical interfaces during the short residence time of geothermal brine at the surface, then reinjects the treated fluid. Separation must be codesigned with heat use, material durability, and reservoir permitting.',
      },
      whyMatters: {
        zh: '把关键矿物生产嵌入现有能源基础设施，可能缩短供应链并降低新增土地与水压力，还能让低品位地热资源获得第二条收入流。',
        en: 'Embedding critical-mineral production in existing energy infrastructure could shorten supply chains and reduce incremental land and water pressure, while giving lower-grade geothermal resources a second revenue stream.',
      },
      ifAnswered: {
        zh: '可行的连续流程会把地热项目从单一发电站变成多产品资源平台；不可行的结果则会明确哪些卤水化学和寿命阈值使直接提取失去优势。',
        en: 'A viable continuous process would turn a geothermal project from a single-output power plant into a multiproduct resource platform. A negative result would define the brine chemistries and lifetime thresholds at which direct extraction loses its advantage.',
      },
      approaches: [
        {
          zh: '建立覆盖不同地热田的开放卤水基准，报告温度、主离子、微量元素、悬浮物与时间波动。',
          en: 'Establish an open brine benchmark spanning geothermal fields, reporting temperature, major ions, trace elements, suspended solids, and temporal variation.',
        },
        {
          zh: '在旁路连续流装置中比较离子筛、膜和电化学路线，统一核算回收率、选择性、再生剂与压降。',
          en: 'Compare ion-sieve, membrane, and electrochemical routes in a sidestream continuous-flow rig with common accounting for recovery, selectivity, regenerants, and pressure drop.',
        },
        {
          zh: '把提取前后流体送入结垢—腐蚀—回注模拟，联立技术经济与生命周期模型。',
          en: 'Feed pre- and post-extraction fluids into scaling, corrosion, and reinjection simulations, coupled to techno-economic and life-cycle models.',
        },
      ],
      barrier: {
        zh: '实验室合成卤水会低估杂质与长期污染；吸附剂容量、再生化学和废物流可能抵消联产收益，改变卤水又可能引发回注堵塞或许可风险。',
        en: 'Synthetic laboratory brines understate impurities and long-term fouling. Sorbent capacity, regeneration chemistry, and waste streams can erase coproduction benefits, while altered brine may create reinjection blockage or permitting risk.',
      },
      subQuestions: [
        {
          zh: '在同一真实卤水连续运行一个规定周期后，锂选择性和工作容量是否仍高于预注册阈值？',
          en: 'After a prespecified continuous run on the same field brine, do lithium selectivity and working capacity remain above preregistered thresholds?',
        },
        {
          zh: '完整再生与浓缩步骤计入后，单位碳酸锂当量的能耗和试剂耗量是否仍优于对照流程？',
          en: 'After including full regeneration and concentration, do energy and reagent use per lithium-carbonate equivalent remain better than the control process?',
        },
        {
          zh: '提取后卤水在储层条件下的沉淀量、腐蚀率和注入指数是否与未处理卤水统计等效？',
          en: 'Under reservoir conditions, are precipitation, corrosion rate, and injectivity of post-extraction brine statistically equivalent to untreated brine?',
        },
      ],
    },
    stage: 2,
    members: 6,
    activity: 68,
    chart: { x: 670, y: 170, scale: 0.8 },
  },
  {
    id: 156,
    atlasN: 960,
    slug: 'molten-salt-online-chemistry',
    title: {
      zh: '熔盐堆在线燃料盐化学与连续后处理',
      en: 'Online Fuel-Salt Chemistry and Continuous Reprocessing for Molten Salt Reactors',
    },
    qfocus: {
      zh: '在线传感与选择性分离能否在不停车条件下约束燃料盐氧化还原态、裂变产物和锕系库存，并保持反应堆安全边界？',
      en: 'Can online sensing and selective separation constrain fuel-salt redox state, fission products, and actinide inventory without shutdown while preserving reactor safety margins?',
    },
    domain: '物质',
    cluster: {
      code: 'C17',
      zh: '新能源范式',
      en: 'New energy paradigms',
    },
    scores: [4, 3, 4, 1, 3, 1, 3, 3, 4],
    citation: {
      url: 'https://www.sciencedirect.com/science/article/pii/S0029549325006727',
      title: 'Advancing molten salt reactor technologies: Prioritizing standardisation needs and bridging gaps',
      venue: 'Nuclear Engineering and Design (Elsevier)',
      year: 2025,
    },
    brief: {
      zh: '液态燃料盐允许补料、取样和去除部分裂变产物，但也把核燃料管理变成高温、强辐照、腐蚀性熔体中的连续化学控制问题。方向的核心是把传感、盐净化、材料寿命、核材料衡算和瞬态安全放进同一个可验证系统。',
      en: 'Liquid fuel salt permits feeding, sampling, and removal of selected fission products, but turns fuel management into continuous chemical control inside a hot, irradiated, corrosive melt. The frontier is to place sensing, salt cleanup, material lifetime, nuclear-material accountancy, and transient safety in one verifiable system.',
    },
    literature: [
      {
        title: 'DOE Molten Salt Reactor Program — Overview (Paviet)',
        venue: 'GAIN / Idaho National Laboratory',
        year: 2025,
        url: 'https://gain.inl.gov/content/uploads/4/2025/05/1.-Overview-of-the-Molten-Salt-Reactor-Program_Paviet.pdf',
      },
    ],
    depth: {
      overview: {
        zh: '与固体燃料批次换料不同，液态燃料盐的组分会在运行中持续演化。在线光谱或电化学信号必须估计化学形态，分离单元则要去除目标核素而不带走过多燃料或扰动盐的氧化还原平衡。',
        en: 'Unlike batch refueling of solid fuel, liquid-fuel composition evolves continuously during operation. Online spectroscopic or electrochemical signals must estimate chemical speciation, while separation units remove target nuclides without excessive fuel loss or disruption of salt redox balance.',
      },
      whyMatters: {
        zh: '连续化学控制决定熔盐堆能否兑现高燃耗、较少停堆和灵活燃料循环，同时也是腐蚀、源项和防扩散论证的共同基础。',
        en: 'Continuous chemistry control determines whether molten-salt reactors can deliver high burnup, fewer shutdowns, and flexible fuel cycles. It is also the common basis for corrosion, source-term, and safeguards cases.',
      },
      ifAnswered: {
        zh: '闭环验证会把“在线后处理”从概念流程图变成可许可的控制功能；若关键物种无法可靠观测或分离，结果会迫使设计转向更保守的批处理边界。',
        en: 'Closed-loop validation would turn online reprocessing from a conceptual flowsheet into a licensable control function. If key species cannot be reliably observed or separated, the result would force designs toward more conservative batch boundaries.',
      },
      approaches: [
        {
          zh: '在非放射性替代盐和逐级放射性回路上交叉标定原位光谱、电化学与取样质谱。',
          en: 'Cross-calibrate in situ spectroscopy and electrochemistry against sampled mass spectrometry in nonradioactive surrogate salts and progressively radioactive loops.',
        },
        {
          zh: '连续运行稀土—锕系替代分离单元，统一记录分配系数、夹带、腐蚀和材料失效。',
          en: 'Continuously operate lanthanide–actinide surrogate separation units while jointly recording distribution coefficients, entrainment, corrosion, and material failure.',
        },
        {
          zh: '把化学状态估计器接入中子学—热工水力数字孪生，注入传感漂移和分离故障测试控制策略。',
          en: 'Connect the chemical-state estimator to a neutronics–thermal-hydraulics digital twin and inject sensor drift and separation failures to test control strategies.',
        },
      ],
      barrier: {
        zh: '高温辐照下缺少长期可靠传感器和结构材料，实验替代盐也未必复现真实裂变产物化学；核材料衡算、防扩散和许可要求会限制可接受的流程复杂度。',
        en: 'Long-lived sensors and structural materials are scarce under hot irradiation, and surrogate salts may not reproduce real fission-product chemistry. Material accountancy, nonproliferation, and licensing constrain acceptable process complexity.',
      },
      subQuestions: [
        {
          zh: '原位传感器在规定辐照与温度剂量后，对关键价态和浓度的估计偏差是否仍低于控制限？',
          en: 'After a specified irradiation and temperature dose, does in situ sensor bias for key valence states and concentrations remain below the control limit?',
        },
        {
          zh: '连续分离能否在目标裂变产物去除率与燃料夹带率之间达到预注册的联合指标？',
          en: 'Can continuous separation meet a preregistered joint target for fission-product removal and fuel entrainment?',
        },
        {
          zh: '在传感失真或分离停机瞬态中，闭环模型能否在越过安全边界前检测并进入安全状态？',
          en: 'During sensor distortion or separator-trip transients, can the closed-loop model detect the event and enter a safe state before a safety boundary is crossed?',
        },
      ],
    },
    stage: 1,
    members: 3,
    activity: 46,
    chart: { x: 805, y: 330, scale: 0.76 },
  },
  {
    id: 157,
    atlasN: 1264,
    slug: 'abiological-metalloenzyme-catalysis',
    title: {
      zh: '从头人工金属酶与非天然辅因子催化设计',
      en: 'De Novo Metalloenzyme and Abiological-Cofactor Catalysis Design',
    },
    qfocus: {
      zh: '能否从目标非天然反应出发，零样本设计兼具选择性、周转率与细胞内稳定性的金属配位蛋白？',
      en: 'Can a target new-to-nature reaction be translated into a zero-shot metal-coordinating protein with useful selectivity, turnover, and intracellular stability?',
    },
    domain: '物质',
    cluster: {
      code: 'C43',
      zh: '生成式生物·AI分子与蛋白设计',
      en: 'Generative Biology · AI Molecular & Protein Design',
    },
    scores: [4, 5, 4, 2, 4, 2, 4, 3, 4],
    citation: {
      url: 'https://www.nature.com/articles/s41929-025-01436-0',
      title: 'De novo design and evolution of an artificial metathase for cytoplasmic olefin metathesis',
      venue: 'Nature Catalysis',
      year: 2025,
    },
    brief: {
      zh: '把钌、铈或金—NHC 等非天然辅因子精确安放进从头蛋白骨架，可把有机金属反应库接到可编程、可进化的分子支架上。下一步不是再做单个“巧妙案例”，而是检验目标反应到活性位点、配位球和动态通道的设计闭环能否跨反应迁移。',
      en: 'Precisely placing abiological cofactors such as ruthenium, cerium, or gold–NHC inside de novo protein scaffolds connects organometallic reaction space to programmable, evolvable molecular structures. The next step is not another isolated clever example, but a transferable loop from target reaction to active site, coordination sphere, and dynamic access channel.',
    },
    literature: [
      {
        title: 'A De Novo Metalloenzyme for Cerium Photoredox Catalysis',
        venue: 'Journal of the American Chemical Society',
        year: 2024,
        url: 'https://pubs.acs.org/doi/10.1021/jacs.4c04618',
      },
      {
        title: 'Recent advances in de novo designed metallopeptides as tailored enzyme mimics',
        venue: 'Current Opinion in Chemical Biology',
        year: 2025,
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S1367593125000183',
      },
    ],
    depth: {
      overview: {
        zh: '人工金属酶把蛋白微环境的构象选择性与非生物金属中心的反应能力结合起来。生成设计需同时满足骨架可折叠、金属几何、过渡态稳定、底物通道和细胞兼容性，而定向进化可补偿模型遗漏的动力学细节。',
        en: 'Artificial metalloenzymes combine conformational selectivity from a protein microenvironment with reaction capabilities of nonbiological metal centers. Generative design must jointly satisfy foldability, metal geometry, transition-state stabilization, substrate access, and cellular compatibility, while directed evolution can recover kinetic details missed by models.',
      },
      whyMatters: {
        zh: '若反应可以按需映射到蛋白催化剂，精细化学、药物合成和活细胞制造将获得温和条件下的新反应路径，也会把材料催化与生物设计真正打通。',
        en: 'If reactions can be mapped on demand to protein catalysts, fine chemicals, drug synthesis, and living-cell manufacturing gain new routes under mild conditions, directly linking materials catalysis with biological design.',
      },
      ifAnswered: {
        zh: '可迁移的闭环会建立“反应规格即设计输入”的催化平台；若失败，则能分辨瓶颈究竟来自电子结构、蛋白动力学还是细胞环境，而不是把所有失败归为模型精度不足。',
        en: 'A transferable loop would establish a catalytic platform where reaction specification is the design input. Failure would separate bottlenecks in electronic structure, protein dynamics, and the cellular environment instead of attributing all misses to model accuracy.',
      },
      approaches: [
        {
          zh: '联合量化过渡态几何、金属配位约束与可折叠性，生成多个彼此独立的骨架家族。',
          en: 'Jointly model transition-state geometry, metal-coordination constraints, and foldability to generate multiple independent scaffold families.',
        },
        {
          zh: '用无细胞高通量筛选测量周转率、对映选择性、金属流失和副反应，再做最小轮次定向进化。',
          en: 'Use cell-free high-throughput screening to measure turnover, enantioselectivity, metal loss, and side reactions, followed by a minimal number of directed-evolution rounds.',
        },
        {
          zh: '在纯化体系与细胞内平行测试同一设计，配合结构和动力学测量定位环境依赖失效。',
          en: 'Test the same designs in purified and intracellular settings, using structural and kinetic measurements to localize environment-dependent failure.',
        },
      ],
      barrier: {
        zh: '金属中心的电子结构与蛋白长时标动力学难以在一个模型中准确耦合；细胞中的配体竞争、毒性和辅因子运输又可能让体外活性无法迁移。',
        en: 'The electronic structure of a metal center and long-timescale protein dynamics are difficult to couple accurately in one model. Intracellular ligand competition, toxicity, and cofactor transport can prevent in vitro activity from transferring into cells.',
      },
      subQuestions: [
        {
          zh: '在盲测的三类非天然反应上，零样本设计的命中率是否显著高于随机骨架和静态对接基线？',
          en: 'Across three blinded classes of new-to-nature reactions, is the zero-shot design hit rate significantly above random-scaffold and static-docking baselines?',
        },
        {
          zh: '在匹配金属负载量后，设计蛋白能否同时提高目标产物选择性并抑制游离辅因子的背景反应？',
          en: 'At matched metal loading, can designed proteins simultaneously raise target-product selectivity and suppress background reaction by free cofactor?',
        },
        {
          zh: '体外最优设计在细胞内失效时，金属占位、折叠状态与底物可达性测量能否预先解释差异？',
          en: 'When the best in vitro design fails in cells, can measurements of metal occupancy, folding state, and substrate access prospectively explain the gap?',
        },
      ],
    },
    stage: 2,
    members: 6,
    activity: 69,
    chart: { x: 560, y: 520, scale: 0.78 },
  },
  {
    id: 158,
    atlasN: 1271,
    slug: 'reversible-adiabatic-cmos',
    title: {
      zh: '可逆绝热CMOS：芯片级净能量回收计算',
      en: 'Reversible Adiabatic CMOS with Net On-Chip Energy Recovery',
    },
    qfocus: {
      zh: '计入谐振电源时钟、控制、面积与延迟后，可逆绝热 CMOS 完整数据通路能否实现可重复的净能耗优势？',
      en: 'After resonant power clocks, control, area, and latency are included, can a complete reversible adiabatic CMOS datapath deliver a reproducible net-energy advantage?',
    },
    domain: '物质',
    cluster: {
      code: 'C44',
      zh: '神经形态·物理智能硬件',
      en: 'Neuromorphic · Physical-AI Hardware',
    },
    scores: [4, 3, 4, 1, 3, 1, 3, 2, 4],
    citation: {
      url: 'https://www.eetimes.com/vaire-demos-energy-recovery-with-reversible-computing-test-chip/',
      title: 'Vaire Demos Energy Recovery With Reversible Computing Test Chip',
      venue: 'EE Times',
      year: 2025,
    },
    brief: {
      zh: '可逆逻辑通过“反计算”避免丢弃中间信息，绝热电路再用谐振电源时钟回收节点电荷。早期测试芯片已报告局部电路能量回收，但必须把时钟网络、I/O、面积和吞吐量全部计入，才能判断它是否优于成熟低功耗 CMOS。',
      en: 'Reversible logic avoids discarding intermediate information through uncomputation, while adiabatic circuits recycle node charge with resonant power clocks. Early test chips report energy recovery in local circuits, but clock distribution, I/O, area, and throughput must all be counted before comparison with mature low-power CMOS.',
    },
    literature: [
      {
        title: 'Reversible Computing Has Potential For 4000x More Energy Efficient Computation',
        venue: 'IEEE Spectrum',
        year: 2024,
        url: 'https://spectrum.ieee.org/reversible-computing',
      },
      {
        title: "A startup working on 'reversible computing' chip for AI says initial tests show a 50% energy savings",
        venue: 'Fortune',
        year: 2025,
        url: 'https://fortune.com/2025/05/20/uk-startup-vaire-reversible-computing-chip-gpu-alternative-energy-savings-ai/',
      },
      {
        title: 'Near-zero energy computing — Vaire (official)',
        venue: 'Vaire Computing',
        year: 2025,
        url: 'https://vaire.co/',
      },
    ],
    depth: {
      overview: {
        zh: '传统 CMOS 在不可逆覆盖比特时耗散信息对应的能量，而可逆逻辑保留足够状态以逆向清除临时量。绝热切换则缓慢搬运并回收电荷；两者结合的收益取决于谐振时钟品质、计算图可逆化开销和实际工作频率。',
        en: 'Conventional CMOS dissipates energy when irreversibly overwriting bits, while reversible logic preserves enough state to clear temporaries backward. Adiabatic switching moves and recovers charge gradually. Their combined benefit depends on resonant-clock quality, reversible-graph overhead, and practical operating frequency.',
      },
      whyMatters: {
        zh: 'AI 和科学计算的能耗越来越受数据通路与存储移动约束；若标准工艺可回收一部分切换能量，它提供的是电路物理层的新杠杆，而不仅是模型压缩。',
        en: 'AI and scientific-computing energy is increasingly constrained by datapaths and memory movement. If standard processes can recover a portion of switching energy, this offers a new circuit-physics lever rather than another layer of model compression.',
      },
      ifAnswered: {
        zh: '独立芯片级证据会决定该路线应进入架构协同设计，还是停留在特殊低频电路；负结果同样能给出频率、负载和可逆化开销的相变边界。',
        en: 'Independent chip-level evidence would determine whether the route should enter architectural codesign or remain confined to specialized low-frequency circuits. A negative result would still map transition boundaries in frequency, load, and reversibilization overhead.',
      },
      approaches: [
        {
          zh: '在同一工艺、位宽和任务下流片可逆绝热与常规 CMOS 数据通路，暴露所有电源与时钟测点。',
          en: 'Tape out reversible-adiabatic and conventional CMOS datapaths in the same process, width, and task, exposing all supply and clock measurement points.',
        },
        {
          zh: '跨频率、占空比、温度和数据活动率绘制端到端能耗—延迟—面积曲面。',
          en: 'Map the end-to-end energy–delay–area surface across frequency, duty cycle, temperature, and data activity.',
        },
        {
          zh: '把反计算调度器接入编译器，测量真实内核中的临时状态、存储访问和可逆化膨胀。',
          en: 'Integrate an uncomputation scheduler into a compiler and measure temporary state, memory access, and reversibilization expansion on real kernels.',
        },
      ],
      barrier: {
        zh: '公开证据仍以公司原型和局部模块为主；谐振时钟难以跨大芯片分布，反计算会增加状态和延迟，而高速运行又削弱绝热近似。',
        en: 'Public evidence is still dominated by company prototypes and local blocks. Resonant clocks are difficult to distribute across a large die, uncomputation adds state and latency, and high-speed operation erodes the adiabatic approximation.',
      },
      subQuestions: [
        {
          zh: '在外部仪表测得的全部芯片供能中，能量回收优势是否在多个独立样片和温度点上重复？',
          en: 'In externally measured total chip energy, does the recovery advantage repeat across multiple independent dies and temperatures?',
        },
        {
          zh: '达到相同吞吐量和数值结果时，可逆数据通路的能量—延迟乘积是否优于同工艺对照？',
          en: 'At matched throughput and numerical result, is the reversible datapath’s energy–delay product lower than the same-process control?',
        },
        {
          zh: '把时钟、I/O 和反计算存储开销逐项加入后，在哪个频率与负载区间净优势变为零？',
          en: 'After clock, I/O, and uncomputation-storage overheads are added item by item, at what frequency and load does the net advantage vanish?',
        },
      ],
    },
    stage: 1,
    members: 2,
    activity: 43,
    chart: { x: 390, y: 135, scale: 0.8 },
  },
  {
    id: 159,
    atlasN: 938,
    slug: 'photonic-probabilistic-vacuum-noise',
    title: {
      zh: '基于量子真空/热噪声的光子概率计算',
      en: 'Photonic Probabilistic Computing on Quantum-Vacuum and Thermal Noise',
    },
    qfocus: {
      zh: '量子真空涨落驱动的光子概率节点，能否在端到端采样质量、能耗和延迟上超过电子随机数加速器？',
      en: 'Can photonic probabilistic nodes driven by quantum-vacuum fluctuations outperform electronic random-number accelerators in end-to-end sampling quality, energy, and latency?',
    },
    domain: '数理',
    cluster: {
      code: 'C31',
      zh: '物理计算·热力学与涨落',
      en: 'Physical computing · thermodynamics and fluctuations',
    },
    scores: [4, 5, 3, 2, 3, 2, 3, 3, 4],
    citation: {
      url: 'https://www.nature.com/articles/s41467-024-51509-0',
      title: 'Photonic probabilistic machine learning using quantum vacuum noise',
      venue: 'Nature Communications',
      year: 2024,
    },
    brief: {
      zh: '光学参量振荡器可把真空涨落放大为概率神经元的随机种子，使采样不再由伪随机算法模拟。真正的比较必须纳入调制、探测、反馈和数据转换，而不能只计算光学核心的传播时间。',
      en: 'Optical parametric oscillators can amplify vacuum fluctuations into random seeds for probabilistic neurons, replacing algorithmically simulated pseudorandomness with a physical source. A meaningful comparison must include modulation, detection, feedback, and data conversion rather than counting only optical-core propagation.',
    },
    literature: [
      {
        title: 'Probabilistic photonic computing for AI',
        venue: 'Nature Computational Science',
        year: 2025,
        url: 'https://www.nature.com/articles/s43588-025-00800-1',
      },
    ],
    depth: {
      overview: {
        zh: '概率计算把不确定变量表示为可采样的物理状态，适合贝叶斯推断、组合优化和生成模型。光子器件能并行产生涨落并执行加权干涉，但目前常由外部电子测量—反馈闭环更新状态。',
        en: 'Probabilistic computing represents uncertain variables as physically sampleable states, fitting Bayesian inference, combinatorial optimization, and generative models. Photonic devices can generate fluctuations in parallel and perform weighted interference, but present systems often update states through an external electronic measurement–feedback loop.',
      },
      whyMatters: {
        zh: '若随机性、矩阵耦合和采样可在光域协同完成，概率模型有望避开数字硬件反复生成随机数和搬运状态的开销。',
        en: 'If randomness, matrix coupling, and sampling can be codesigned in the optical domain, probabilistic models may avoid repeated random-number generation and state movement in digital hardware.',
      },
      ifAnswered: {
        zh: '端到端优势会把量子噪声从实验资源变成计算原语；若优势被外围电子学吞噬，也会明确哪些模型规模、精度和采样温度才适合光子实现。',
        en: 'An end-to-end advantage would turn quantum noise from an experimental resource into a computing primitive. If electronics erase the gain, the result will still identify the model sizes, precisions, and sampling temperatures suited to photonic implementation.',
      },
      approaches: [
        {
          zh: '把真空噪声光子节点与校准电子随机源接入相同概率图，统一评估分布距离和有效样本量。',
          en: 'Connect vacuum-noise photonic nodes and a calibrated electronic random source to the same probabilistic graph, evaluating distribution distance and effective sample size under one protocol.',
        },
        {
          zh: '逐级把反馈、权重更新和互连集成到光电封装中，记录每层外围开销。',
          en: 'Progressively integrate feedback, weight updates, and interconnect into an optoelectronic package, recording peripheral overhead at each layer.',
        },
        {
          zh: '在贝叶斯分类、玻尔兹曼采样与组合优化上进行盲基准，匹配误差和置信度后比较能耗与延迟。',
          en: 'Run blinded benchmarks in Bayesian classification, Boltzmann sampling, and combinatorial optimization, comparing energy and latency at matched error and confidence.',
        },
      ],
      barrier: {
        zh: '真空噪声的统计纯度会受损耗、漂移与探测噪声影响；外部测量反馈、ADC/DAC 和激光维持功率可能主导总能耗，器件间差异也增加校准成本。',
        en: 'Loss, drift, and detector noise affect the statistical purity of vacuum noise. External measurement feedback, ADC/DAC, and laser sustaining power may dominate total energy, while device variation raises calibration cost.',
      },
      subQuestions: [
        {
          zh: '在预注册分布族上，光子样本能否同时通过独立性检验并达到电子基线的目标分布误差？',
          en: 'On preregistered distribution families, can photonic samples pass independence tests while matching the electronic baseline’s target-distribution error?',
        },
        {
          zh: '计入激光、探测、反馈和转换后，每个有效独立样本的能耗是否仍低于匹配精度的 GPU 或 FPGA？',
          en: 'Including laser, detection, feedback, and conversion, is energy per effectively independent sample below a precision-matched GPU or FPGA?',
        },
        {
          zh: '当节点数扩展一个数量级时，漂移校准时间是否低于有效计算时间的预设比例？',
          en: 'When node count grows by an order of magnitude, does drift-calibration time remain below a prespecified fraction of useful compute time?',
        },
      ],
    },
    stage: 2,
    members: 4,
    activity: 59,
    chart: { x: 520, y: 260, scale: 0.84 },
  },
  {
    id: 160,
    atlasN: 1005,
    slug: 'atom-interferometry-screened-scalars',
    title: {
      zh: '长基线原子干涉计实验室检验暗能量屏蔽标量场',
      en: 'Laboratory Tests of Dark-Energy Screened Scalars with Long-Baseline Atom Interferometry',
    },
    qfocus: {
      zh: '米级至十米级原子干涉计能否用可调源质量，在系统误差受控时排除新的变色龙场或对称子场参数区间？',
      en: 'Can meter- to ten-meter-scale atom interferometers use a configurable source mass to exclude new chameleon or symmetron parameter space with controlled systematics?',
    },
    domain: '数理',
    cluster: {
      code: 'C33',
      zh: '基础物理·实在的本质',
      en: 'Fundamental physics · the nature of reality',
    },
    scores: [5, 5, 4, 2, 4, 4, 3, 4, 4],
    citation: {
      url: 'https://arxiv.org/pdf/2511.09750',
      title: 'Searching for screened scalar forces with long-baseline atom interferometers',
      venue: 'arXiv (Phys. Rev. D)',
      year: 2025,
    },
    brief: {
      zh: '变色龙场和对称子场可在高密度环境中被屏蔽，却在真空中的原子上产生微弱第五力。长基线原子干涉仪结合可移动源质量，能在实验室尺度调制信号并检验一部分暗能量启发的标量场参数空间。',
      en: 'Chameleon and symmetron fields can be screened in dense environments while exerting a weak fifth force on atoms in vacuum. A long-baseline atom interferometer paired with a movable source mass can modulate the signal on laboratory scales and test scalar-field parameter space motivated by dark energy.',
    },
    literature: [
      {
        title: 'Experiment to Detect Dark Energy Forces Using Atom Interferometry',
        venue: 'Physical Review Letters',
        year: 2019,
        url: 'https://doi.org/10.1103/physrevlett.123.061102',
      },
    ],
    depth: {
      overview: {
        zh: '原子波包沿不同路径自由落体后重合，微小差分加速度会映射为相位差。屏蔽标量场的非线性边界条件依赖真空腔、源质量、原子位置和环境密度，因此实验几何本身就是理论预测的一部分。',
        en: 'Atomic wave packets separate along free-fall paths and recombine, mapping tiny differential accelerations into phase. Nonlinear boundary conditions for screened scalar fields depend on the vacuum chamber, source mass, atom position, and ambient density, making experimental geometry part of the theoretical prediction.',
      },
      whyMatters: {
        zh: '宇宙加速通常从天文观测反演，而受屏蔽第五力允许在受控实验室中直接检验部分暗能量机制，也可补充等效原理和短程引力测试。',
        en: 'Cosmic acceleration is usually inferred from astronomical observations. Screened fifth forces permit controlled laboratory tests of some dark-energy mechanisms and complement equivalence-principle and short-range-gravity experiments.',
      },
      ifAnswered: {
        zh: '新排除区间会约束屏蔽机制如何连接宇宙与实验室尺度；若出现可重复调制信号，则必须跨不同原子种类和几何验证它不是常规引力或仪器效应。',
        en: 'New exclusions would constrain how screening connects cosmic and laboratory scales. A repeatable modulated signal would require validation across atomic species and geometries to separate it from conventional gravity and instrumentation.',
      },
      approaches: [
        {
          zh: '对实际真空腔与源质量进行有限元标量场求解，公开从耦合参数到相位的响应函数。',
          en: 'Solve the scalar field by finite elements in the as-built vacuum chamber and source mass, publishing the response from coupling parameters to interferometer phase.',
        },
        {
          zh: '在源质量多位置、不同脉冲间隔和原子云高度下调制测量，联合拟合空间与时间模板。',
          en: 'Modulate measurements across source-mass positions, pulse separations, and atom-cloud heights, jointly fitting spatial and temporal templates.',
        },
        {
          zh: '用盲注入、重力梯度测绘、磁场与波前监测建立系统误差预算，并与第二原子种类交叉检验。',
          en: 'Build a systematic-error budget with blind injections, gravity-gradient mapping, magnetic and wavefront monitoring, and cross-check it with a second atomic species.',
        },
      ],
      barrier: {
        zh: '预测信号小于多种牛顿引力、振动、波前和磁场效应；屏蔽方程对精确几何敏感，长基线装置的波包分离又放大技术噪声与模型误差。',
        en: 'Predicted signals are smaller than several Newtonian-gravity, vibration, wavefront, and magnetic effects. Screening equations are sensitive to exact geometry, while long-baseline wave-packet separation amplifies technical noise and model error.',
      },
      subQuestions: [
        {
          zh: '源质量在预定位置间切换时，相位响应是否服从屏蔽模型的非牛顿空间模板，而非单一常数偏置？',
          en: 'When the source mass switches among prescribed positions, does phase follow the screened model’s non-Newtonian spatial template rather than a single constant offset?',
        },
        {
          zh: '改变真空腔有效密度或原子—源质量距离后，候选信号是否按同一耦合参数组缩放？',
          en: 'After changing effective chamber density or atom–source separation, does a candidate signal scale under one common set of coupling parameters?',
        },
        {
          zh: '在盲分析解封前，系统误差模型能否预测无源质量调制数据中的全部伪信号幅度？',
          en: 'Before unblinding, can the systematic model predict all spurious-signal amplitudes in data without source-mass modulation?',
        },
      ],
    },
    stage: 1,
    members: 3,
    activity: 52,
    chart: { x: 730, y: 455, scale: 0.79 },
  },
  {
    id: 161,
    atlasN: 1279,
    slug: 'thermodynamic-linear-algebra',
    title: {
      zh: '热力学线性代数：随机处理单元加速高维矩阵原语',
      en: 'Thermodynamic Linear Algebra on Stochastic Processing Units',
    },
    qfocus: {
      zh: '耦合随机电路的平衡分布能否在计入编码、读出和收敛后，以更低端到端成本求解高维高斯采样与矩阵原语？',
      en: 'Can equilibrium distributions of coupled stochastic circuits solve high-dimensional Gaussian sampling and matrix primitives at lower end-to-end cost after encoding, readout, and convergence are included?',
    },
    domain: '数理',
    cluster: {
      code: 'C44',
      zh: '神经形态·物理智能硬件',
      en: 'Neuromorphic · Physical-AI Hardware',
    },
    scores: [3, 4, 4, 3, 3, 3, 3, 4, 3],
    citation: {
      url: 'https://www.nature.com/articles/s41467-025-59011-x',
      title: 'Thermodynamic computing system for AI applications',
      venue: 'Nature Communications',
      year: 2025,
    },
    brief: {
      zh: '随机耦合的 RLC 或模拟节点会自然弛豫到一个稳态分布；若耦合矩阵被正确编码，稳态协方差可表示高斯采样、矩阵逆等线性代数结果。潜在复杂度优势只有在 ADC/DAC、编程、混合时间和样本相关性全部计入后才成立。',
      en: 'Stochastically coupled RLC or analog nodes naturally relax to a stationary distribution. If the coupling matrix is encoded correctly, stationary covariance can represent Gaussian samples, matrix inverses, and related linear-algebra results. Any complexity advantage survives only if ADC/DAC, programming, mixing time, and sample correlation are fully counted.',
    },
    literature: [
      {
        title: "Normal Computing Announces Tape-Out of World's First Thermodynamic Computing Chip",
        venue: 'PR Newswire (official)',
        year: 2025,
        url: 'https://www.prnewswire.com/news-releases/normal-computing-announces-tape-out-of-worlds-first-thermodynamic-computing-chip-302527154.html',
      },
      {
        title: 'Could Thermodynamic Computing Revolutionize AI and Scientific Research?',
        venue: 'IEEE Spectrum',
        year: 2025,
        url: 'https://spectrum.ieee.org/thermodynamic-computing-normal-computing',
      },
    ],
    depth: {
      overview: {
        zh: '该路线不压低噪声，而是把热涨落和耗散动力学当作求解器。系统的能量函数编码目标精度矩阵，反复读取稳态状态即可获得样本并估计逆矩阵相关量。',
        en: 'This route does not suppress noise; it treats thermal fluctuations and dissipative dynamics as a solver. The system energy function encodes a target precision matrix, and repeated stationary-state readout yields samples and inverse-matrix-related estimates.',
      },
      whyMatters: {
        zh: '高斯采样和线性代数支撑贝叶斯推断、科学模拟与生成模型，传统数字计算常受矩阵分解和内存移动限制。物理弛豫可能为可容忍近似的任务提供新计算尺度。',
        en: 'Gaussian sampling and linear algebra underpin Bayesian inference, scientific simulation, and generative models, where digital systems are often limited by matrix factorization and memory movement. Physical relaxation could create a new compute scale for approximation-tolerant tasks.',
      },
      ifAnswered: {
        zh: '公平基准若证实优势，可建立热力学协处理器的任务边界；若不成立，也能指出条件数、精度或 I/O 在何处消除物理并行性。',
        en: 'If fair benchmarks confirm an advantage, they will establish task boundaries for thermodynamic coprocessors. If not, they will show where conditioning, precision, or I/O eliminates physical parallelism.',
      },
      approaches: [
        {
          zh: '构建从目标矩阵到物理耦合、稳态样本和误差条的端到端校准管线。',
          en: 'Build an end-to-end calibration pipeline from target matrix through physical coupling to stationary samples and error bars.',
        },
        {
          zh: '在稠密、稀疏和不同条件数的矩阵族上，与 CPU、GPU 及数字随机处理器进行匹配误差基准。',
          en: 'Benchmark dense, sparse, and varying-condition-number matrix families against CPU, GPU, and digital stochastic processors at matched error.',
        },
        {
          zh: '把真实贝叶斯推断或科学逆问题映射到芯片，逐项测量编程、混合、采样和读出成本。',
          en: 'Map real Bayesian-inference or scientific inverse problems to the chip, measuring programming, mixing, sampling, and readout costs separately.',
        },
      ],
      barrier: {
        zh: '模拟失配、漂移和有限动态范围会扭曲目标分布；病态矩阵需要更长混合时间，样本自相关降低有效吞吐，外围转换可能压倒核心能耗。',
        en: 'Analog mismatch, drift, and finite dynamic range distort the target distribution. Ill-conditioned matrices require longer mixing, sample autocorrelation lowers effective throughput, and peripheral conversion may dominate core energy.',
      },
      subQuestions: [
        {
          zh: '对盲测矩阵，实测稳态协方差与目标协方差的误差能否由校准模型预先界定？',
          en: 'For blinded matrices, can the calibration model prospectively bound error between measured and target stationary covariance?',
        },
        {
          zh: '按有效独立样本而非原始读数计数时，吞吐优势是否随矩阵维度增加而保持？',
          en: 'When throughput is counted in effectively independent samples rather than raw reads, does the advantage persist as matrix dimension grows?',
        },
        {
          zh: '将全部转换和编程能耗计入后，在哪些条件数与精度区间端到端优势仍显著？',
          en: 'After all conversion and programming energy is included, in which conditioning and precision regimes does a significant end-to-end advantage remain?',
        },
      ],
    },
    stage: 2,
    members: 5,
    activity: 66,
    chart: { x: 235, y: 335, scale: 0.82 },
  },
  {
    id: 162,
    atlasN: 1422,
    slug: 'universal-ml-interatomic-potentials',
    title: {
      zh: '通用机器学习原子间势',
      en: 'Universal Machine-Learning Interatomic Potentials',
    },
    qfocus: {
      zh: '跨元素训练的等变原子势能否在未见化学体系、缺陷和反应路径上，以校准的不确定性保持接近 DFT 的可靠性？',
      en: 'Can element-spanning equivariant interatomic potentials retain near-DFT reliability with calibrated uncertainty on unseen chemistries, defects, and reaction pathways?',
    },
    domain: '交叉',
    cluster: {
      code: 'C03',
      zh: '科学基础模型·AI4S',
      en: 'Scientific foundation models · AI for science',
    },
    scores: [4, 4, 5, 4, 2, 3, 5, 4, 3],
    citation: {
      url: 'https://www.nature.com/articles/s41524-025-01650-1',
      title: 'Universal machine learning interatomic potentials are ready for phonons',
      venue: 'npj Computational Materials',
      year: 2025,
    },
    brief: {
      zh: '等变神经网络从数千万个 DFT 构型学习跨元素势能面，可把接近第一性原理的模拟扩展到更大体系和更长时间。真正的“通用”不应由随机留出集定义，而要在新化学计量、缺陷、相变和稀有高能路径上做域外审计。',
      en: 'Equivariant neural networks learn element-spanning potential-energy surfaces from tens of millions of DFT configurations, extending near-first-principles simulation to larger systems and longer times. True universality should not be defined by random holdouts, but audited on new stoichiometries, defects, phase transitions, and rare high-energy pathways.',
    },
    literature: [
      {
        title: 'Matbench Discovery — public leaderboard for ML crystal-stability models',
        venue: 'Materials Project',
        year: 2025,
        url: 'https://matbench-discovery.materialsproject.org/models',
      },
      {
        title: 'Open Materials 2024 (OMat24) Inorganic Materials Dataset and Models',
        venue: 'arXiv (Meta FAIR)',
        year: 2024,
        url: 'https://arxiv.org/abs/2410.12771',
      },
    ],
    depth: {
      overview: {
        zh: '原子势把元素类型与局部几何映射到能量和力，是分子动力学的核心近似。通用模型借助旋转等变结构和大规模异质数据学习共享表示，再通过零样本使用或少量领域数据微调。',
        en: 'An interatomic potential maps element identity and local geometry to energy and force, the central approximation in molecular dynamics. Universal models use rotational equivariance and large heterogeneous datasets to learn shared representations, then operate zero-shot or adapt with small domain datasets.',
      },
      whyMatters: {
        zh: '可靠通用势可把材料发现从静态结构筛选推进到声子、扩散、缺陷和有限温度稳定性，并缩短新体系重复训练专用势的周期。',
        en: 'Reliable universal potentials could advance materials discovery from static structure screening to phonons, diffusion, defects, and finite-temperature stability, while reducing repeated training of bespoke potentials for every new system.',
      },
      ifAnswered: {
        zh: '带可靠拒答机制的模型可成为跨实验室模拟基础设施；若通用性有明确边界，则可建立自动检测域外状态并触发 DFT 主动学习的混合流程。',
        en: 'A model with reliable abstention could become shared simulation infrastructure across laboratories. If universality has clear limits, a hybrid workflow can detect out-of-domain states and trigger DFT active learning automatically.',
      },
      approaches: [
        {
          zh: '按化学体系、原型和时间切分数据，建立防泄漏的零样本材料动力学基准。',
          en: 'Split data by chemistry, prototype, and time to build a leakage-resistant zero-shot materials-dynamics benchmark.',
        },
        {
          zh: '联合测试能量、力、应力、声子、缺陷形成能和相变路径，而不是只汇报平均力误差。',
          en: 'Jointly test energy, force, stress, phonons, defect formation, and phase-transition pathways rather than reporting only mean force error.',
        },
        {
          zh: '把不确定性校准与在线主动学习接入长时间分子动力学，记录触发 DFT 的频率与失败发现率。',
          en: 'Integrate uncertainty calibration and online active learning into long molecular-dynamics runs, recording DFT-trigger frequency and failure-discovery rate.',
        },
      ],
      barrier: {
        zh: '训练数据覆盖不均且可能互相泄漏，低平均误差会掩盖稀有但致命的高能事件；模型不确定性常在真正域外化学上过度自信，参考 DFT 本身也有体系偏差。',
        en: 'Training coverage is uneven and may leak across splits, while low mean error hides rare but catastrophic high-energy events. Model uncertainty is often overconfident on genuinely novel chemistry, and reference DFT carries systematic bias of its own.',
      },
      subQuestions: [
        {
          zh: '在按元素组合和晶体原型完全隔离的盲测集上，模型是否仍能达到预注册的能量、力和声子联合误差？',
          en: 'On a blinded set isolated by both element combination and crystal prototype, does the model meet preregistered joint energy, force, and phonon errors?',
        },
        {
          zh: '不确定性分数能否在分子动力学崩溃前识别至少规定比例的域外构型，同时控制误报？',
          en: 'Can uncertainty scores identify a prespecified fraction of out-of-domain configurations before molecular-dynamics failure while controlling false alarms?',
        },
        {
          zh: '采用主动学习补充相同数量 DFT 标签后，通用模型是否比从头专用势更快达到目标动力学精度？',
          en: 'With the same number of added DFT labels under active learning, does the universal model reach target dynamical accuracy faster than a bespoke potential trained from scratch?',
        },
      ],
    },
    stage: 2,
    members: 7,
    activity: 73,
    chart: { x: 445, y: 420, scale: 0.86 },
  },
  {
    id: 163,
    atlasN: 787,
    slug: 'in-orbit-pharma-crystallization',
    title: {
      zh: '在轨蛋白结晶与药物再制剂化',
      en: 'In-Orbit Protein Crystallization for Drug Reformulation',
    },
    qfocus: {
      zh: '微重力结晶能否对预先选定的生物药稳定地产生地面工艺无法获得、且足以改变给药方式的晶体性质？',
      en: 'Can microgravity crystallization reproducibly produce, for prospectively selected biologics, crystal properties unattainable on Earth and sufficient to change the route of administration?',
    },
    domain: '交叉',
    cluster: {
      code: 'C46',
      zh: '空间生物经济·地外制造',
      en: 'Space Bioeconomy · Off-Earth Manufacturing',
    },
    scores: [3, 4, 4, 2, 3, 2, 5, 4, 2],
    citation: {
      url: 'https://www.nature.com/articles/s41526-019-0090-3',
      title: 'Pembrolizumab microgravity crystallization experimentation',
      venue: 'npj Microgravity',
      year: 2019,
    },
    brief: {
      zh: '微重力抑制浮力对流和沉降，可能形成更均一的蛋白晶体，并为高浓度悬液或皮下注射制剂提供新的粒径与形貌窗口。商业价值不来自“太空晶体更漂亮”，而来自返回后能否改善稳定性、可制造性和患者给药。',
      en: 'Microgravity suppresses buoyancy-driven convection and sedimentation, potentially yielding more uniform protein crystals and a new size–morphology window for concentrated suspensions or subcutaneous formulations. Commercial value does not come from prettier space crystals, but from improved stability, manufacturability, and patient delivery after return.',
    },
    literature: [
      {
        title: 'Protein Crystallization in Microgravity: Commercialization and the Next Chapter',
        venue: 'Current Stem Cell Reports',
        year: 2025,
        url: 'https://link.springer.com/article/10.1007/s40778-025-00248-z',
      },
      {
        title: 'Private Varda Space capsule returns to Earth with space-grown antiviral drug aboard',
        venue: 'Space.com',
        year: 2024,
        url: 'https://www.space.com/varda-in-space-manufacturing-capsule-landing-success',
      },
    ],
    depth: {
      overview: {
        zh: '蛋白结晶受传质、成核和剪切历史支配；微重力改变这些过程，但效果高度依赖分子与装置。该方向应从配对地面控制、返回链条和最终制剂指标反向设计轨道实验。',
        en: 'Protein crystallization is governed by mass transfer, nucleation, and shear history. Microgravity changes these processes, but effects are molecule- and hardware-specific. Orbital experiments should therefore be designed backward from paired ground controls, return logistics, and final formulation metrics.',
      },
      whyMatters: {
        zh: '部分抗体或蛋白只能以低浓度静脉输注；若晶体悬液能在小体积中保持稳定活性，可能转为更便捷的皮下给药，也为地外制造提供可验证的高价值产品路径。',
        en: 'Some antibodies or proteins are limited to low-concentration intravenous infusion. If crystalline suspensions retain stable activity in small volumes, they may enable more convenient subcutaneous delivery while giving off-Earth manufacturing a testable high-value product pathway.',
      },
      ifAnswered: {
        zh: '前瞻性选择规则和可重复收益会把任务从个案展示变成药物开发平台；负结果则能识别哪些蛋白物性没有微重力增益，避免昂贵的盲目上行。',
        en: 'Prospective selection rules and reproducible benefit would turn one-off demonstrations into a drug-development platform. Negative results would identify protein properties without a microgravity benefit and prevent costly indiscriminate launches.',
      },
      approaches: [
        {
          zh: '用地面传质模型预注册最可能受益的分子与结晶窗口，并设置匹配温度、振动和批次的对照。',
          en: 'Use terrestrial mass-transfer models to preregister molecules and crystallization windows most likely to benefit, with controls matched for temperature, vibration, and batch.',
        },
        {
          zh: '采用轨道—地面双胞装置记录成核时间、粒径分布和形貌，返回后盲法分析。',
          en: 'Use orbital–ground twin hardware to record nucleation time, size distribution, and morphology, followed by blinded post-return analysis.',
        },
        {
          zh: '把晶体直接进入制剂开发，比较可注射浓度、黏度、复溶、活性、聚集与无菌制造。',
          en: 'Feed crystals directly into formulation development, comparing injectable concentration, viscosity, redissolution, activity, aggregation, and aseptic manufacturability.',
        },
      ],
      barrier: {
        zh: '微重力效应可能小于批次和硬件差异；下行质量、返回时间和再入载荷昂贵且会改变样品，少量成功分子也不足以证明平台可预测。',
        en: 'Microgravity effects may be smaller than batch and hardware variation. Downmass, return time, and reentry loads are costly and can alter samples, while a few successful molecules do not establish a predictable platform.',
      },
      subQuestions: [
        {
          zh: '在至少三个独立批次中，轨道晶体的粒径分布和缺陷率是否一致优于匹配地面对照？',
          en: 'Across at least three independent batches, are orbital crystal size distribution and defect rate consistently better than matched ground controls?',
        },
        {
          zh: '返回后的晶体能否在相同活性与聚集阈值下达到地面路线无法实现的可注射浓度？',
          en: 'After return, can the crystals reach an injectable concentration unattainable by the terrestrial route at matched activity and aggregation thresholds?',
        },
        {
          zh: '基于地面物性的前瞻模型能否在盲测分子中预测哪些会获得显著微重力收益？',
          en: 'Can a prospective model based on terrestrial properties predict which blinded molecules gain a significant microgravity benefit?',
        },
      ],
    },
    stage: 1,
    members: 3,
    activity: 48,
    chart: { x: 855, y: 190, scale: 0.72 },
  },
  {
    id: 164,
    atlasN: 1294,
    slug: 'living-fungal-radiation-shields',
    title: {
      zh: '辐射营养真菌与黑色素活体自修复辐射屏蔽',
      en: 'Radiosynthetic Fungi and Melanin Living Self-Repairing Radiation Shields',
    },
    qfocus: {
      zh: '黑色素真菌或其生物复合材料能否在深空辐射谱下，以可控生长实现低补给质量的长期屏蔽与自修复？',
      en: 'Can melanized fungi or their biocomposites provide long-duration shielding and self-repair with low resupply mass under a deep-space radiation spectrum and controlled growth?',
    },
    domain: '生命',
    cluster: {
      code: 'C46',
      zh: '空间生物经济·地外制造',
      en: 'Space Bioeconomy · Off-Earth Manufacturing',
    },
    scores: [4, 5, 4, 3, 3, 4, 4, 4, 4],
    citation: {
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12067201/',
      title: 'Radiation protection and structural stability of fungal melanin polylactic acid biocomposites in low Earth orbit',
      venue: 'PNAS',
      year: 2025,
    },
    brief: {
      zh: '富黑色素真菌能在辐射环境中生长，真菌黑色素—聚乳酸复合材料在轨暴露也显示出结构保护潜力。若材料可用少量种源和原位碳源生长、修补，它可能把被动屏蔽变成可再生系统；但低地球轨道证据不能直接外推到银河宇宙线和太阳粒子事件。',
      en: 'Melanized fungi can grow in radiation environments, and fungal-melanin–PLA composites exposed in orbit show structural-protection potential. If material can grow and repair from a small inoculum and in situ carbon, passive shielding could become renewable. Evidence from low Earth orbit, however, cannot be directly extrapolated to galactic cosmic rays or solar particle events.',
    },
    literature: [
      {
        title: 'Cultivation of the Dematiaceous Fungus Cladosporium sphaerospermum Aboard the International Space Station and Effects of Ionizing Radiation',
        venue: 'Frontiers in Microbiology',
        year: 2022,
        url: 'https://www.frontiersin.org/journals/microbiology/articles/10.3389/fmicb.2022.877625/full',
      },
      {
        title: 'A Self-Replicating Radiation-Shield for Human Deep-Space Exploration: Radiotrophic Fungi can Attenuate Ionizing Radiation aboard the International Space Station',
        venue: 'bioRxiv',
        year: 2020,
        url: 'https://www.biorxiv.org/content/10.1101/2020.07.16.205534v6.full',
      },
    ],
    depth: {
      overview: {
        zh: '黑色素可吸收并耗散部分电离辐射能量，真菌菌丝则提供可生长的结构网络。方案既包括受控培养的活体层，也包括把提取黑色素嵌入聚合物或月壤复合材料，以分离生长功能与工程稳定性。',
        en: 'Melanin can absorb and dissipate a portion of ionizing-radiation energy, while fungal hyphae provide a growable structural network. Concepts range from contained living layers to extracted melanin embedded in polymer or regolith composites, separating biological growth from engineering stability.',
      },
      whyMatters: {
        zh: '深空屏蔽受发射质量约束，而生物制造可用小种源扩增材料并修复微裂纹。该方向把合成生物、复合材料、空间医学和闭环生命支持连接到同一任务。',
        en: 'Deep-space shielding is constrained by launch mass, whereas biomanufacturing can amplify material from a small inoculum and repair microcracks. This direction connects synthetic biology, composites, space medicine, and closed-loop life support in one mission problem.',
      },
      ifAnswered: {
        zh: '若质量等效屏蔽和可控自修复得到验证，可形成居住舱局部增强层；若活体方案不安全，黑色素复合材料仍可能保留辐射耐久优势。',
        en: 'If mass-equivalent shielding and controlled self-repair are validated, the system could form local reinforcement layers for habitats. If living deployment is unsafe, melanin composites may still retain radiation-durability benefits.',
      },
      approaches: [
        {
          zh: '在质子、重离子、中子和混合辐射束下比较活体层、黑色素复材与等面密度聚乙烯。',
          en: 'Compare living layers, melanin composites, and equal-areal-density polyethylene under proton, heavy-ion, neutron, and mixed radiation beams.',
        },
        {
          zh: '建立封闭生物反应器—墙体试件，测量营养输入、气体交换、污染控制和损伤后再生。',
          en: 'Build a contained bioreactor–wall coupon and measure nutrient input, gas exchange, contamination control, and regrowth after damage.',
        },
        {
          zh: '把真菌黑色素与月壤模拟物和可回收聚合物复合，优化屏蔽、强度、阻燃和可打印性。',
          en: 'Composite fungal melanin with regolith simulant and recyclable polymers, optimizing shielding, strength, flammability, and printability.',
        },
      ],
      barrier: {
        zh: '屏蔽性能高度依赖辐射种类和面密度，生长层还带来水、营养、孢子、毒性与舱内生态风险；自修复速度可能远慢于任务所需，且不能牺牲阻燃和结构完整性。',
        en: 'Shielding depends strongly on radiation type and areal density. Living layers add water, nutrient, spore, toxicity, and cabin-ecology risks. Self-repair may be too slow for missions and cannot compromise flammability or structural integrity.',
      },
      subQuestions: [
        {
          zh: '在等面密度比较中，黑色素体系能否在模拟深空混合谱下显著降低剂量当量而非只降低单一射线通量？',
          en: 'At equal areal density under a simulated deep-space mixed spectrum, does the melanin system significantly reduce dose equivalent rather than only one radiation flux?',
        },
        {
          zh: '规定尺寸的穿孔或裂纹出现后，受控活体层能否在任务相关时间内恢复屏蔽与气密性能？',
          en: 'After a prescribed puncture or crack, can a contained living layer restore shielding and airtight performance within a mission-relevant time?',
        },
        {
          zh: '在长期封闭舱模拟中，孢子、挥发物和微生物群落是否始终低于预注册的健康与污染阈值？',
          en: 'In a long-duration closed-habitat simulation, do spores, volatiles, and microbial-community excursions remain below preregistered health and contamination thresholds?',
        },
      ],
    },
    stage: 2,
    members: 5,
    activity: 63,
    chart: { x: 125, y: 540, scale: 0.78 },
  },
];
