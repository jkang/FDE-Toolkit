# AI for Product Managers (AI4PM) Skills Index

欢迎使用 **AI4PM 技能库**。本库专为产品经理设计，提供从客户战略洞察到高保真原型生成的全链路 AI 辅助工具。
---

## AI场景探索与规划

> 🤖 **[Discovery Agent（全链路编排器）](discovery-agent/SKILL.md)**：宏 Agent。接受客户名称 + 业务领域，自动按顺序调度下方各 Skill，最终生成统一报告仪表盘。适合完整项目启动场景。
> 🗂️ **[统一报告仪表盘 (Unified Report Dashboard)](unified-report-dashboard/SKILL.md)**：将多个分析步骤（NSM、业务流程、服务蓝图、AI 机会地图、AI 画布、里程碑计划等）的 HTML 输出整合为一个带侧边栏导航的报告仪表盘，供汇报与交付使用（Discovery Agent 的最终输出端）。

### 1. 客户洞察与业务梳理
在介入具体业务前，深入了解客户的 AI 战略地位与就绪度。梳理现状（As-Is），识别业务中的断点与痛点。

- **[企业北极星战略全景分析 (NSM Analysis)](nsm-analysis/SKILL.md)**: 宏技能 (Macro Skill)。端到端编排企业深度调研、SWOT 分析并推导北极星指标与核心战略。
  - *包含微技能*: [业务现状调研 (Business Research)](nsm-analysis/sub-skills/business-research/SKILL.md) | [SWOT 分析 (SWOT Analysis)](nsm-analysis/sub-skills/swot-analysis/SKILL.md) | [战略与指标推导 (Strategy Derivation)](nsm-analysis/sub-skills/strategy-derivation/SKILL.md)
- **[AI 成熟度评估与战略调研 (Company AI Maturity Research)](company-ai-maturity-research/SKILL.md)**: 对企业进行 AI 成熟度评估，识别AI就绪度
- **[OSM 目标度量地图 (OSM Map Generator)](osm-map-generator/SKILL.md)**: 将战略目标（Objectives）分解为具体策略（Strategy）与度量指标（Metrics）。
- **[价值流图 (Value Stream Mapper)](value-stream-mapper/SKILL.md)**: 把业务端到端经营主线梳理为 L1 价值链全景（价值流 → 价值段(列) → 业务环节(列内卡)），并据原始 idea 在业务环节级标聚焦范围（★ 高亮 + 优先级），是后续 L2/L3 流程拆解的全貌底稿。
- **[业务流程深度分析 (Business Process Deep Analyzer)](business-process-deep-analyzer/SKILL.md)**: 把单个价值段/业务环节下钻为 L3/L4 现状泳道图（列=L3 子环节 × 行=角色泳道 × 格=L4 任务），逐环节标注痛点（高耗时 / 高认知负荷 / 高频错误 / 来回往复 / 系统瓶颈），并附任务明细表（角色 / 输入→输出 / 业务规则及固化度 / 痛点）。
- **[体验旅程图 (Journey Map Generator)](journey-map-generator/SKILL.md)**: 生成包含角色情感波动、交互点及痛点分析的体验旅程图。
- **[服务蓝图 (Blueprint Map Generator)](blueprint-map-generator/SKILL.md)**: 绘制包含前台接触点、后台流程与支撑系统的服务蓝图。

### 2. AI 机会挖掘与优先级评估 (AI Opportunity & Prioritization)
基于流程痛点，识别 AI 的切入点，并评估各场景的实施优先级。

- **[AI 机会场景地图 (AI Opportunity Map Generator)](ai-opportunity-map-generator/SKILL.md)**: 自动从业务流程中挖掘自动化与智能化机会，生成机会场景地图。
- **[AI 场景画布 (AI Canvas Generator)](ai-canvas-generator/SKILL.md)**: 为特定 AI 场景生成包含用户痛点、输入输出、模型方案的 10 维画布。
- **[Agent 本体设计器 (Agent Ontology Designer)](agent-ontology-designer/SKILL.md)**: 从 AI Canvas / To-Be Journey / 服务蓝图出发，生成 Agent 执行所需的三层本体模型（对象关系 → 行动边界 → 状态迁移），输出可视化 HTML 报告和 Agent Prompt 注入片段。
- **[CKD 数据映射分析 (Context/Knowledge/Data Analyzer)](context-knowledge-data-analyzer/SKILL.md)**: 梳理 AI Workflow 每一步所需的上下文、知识与数据资源清单。
- **[AI 场景优先级矩阵 (AI Scenario Matrix Generator)](ai-scenario-matrix-generator/SKILL.md)**: 基于收益与成本维度，将 AI 场景映射到 5x5 优先级矩阵中。

### 3. 战略规划与里程碑 (Strategic Planning & Roadmap)
勾勒未来的演进路线，明确核心里程碑。

- **[产品演进路线图 (Roadmap Generator)](roadmap-generator/SKILL.md)**: 生成垂直阶段式（Phases）的高颜值商业路线图。
- **[里程碑计划 (Milestone Plan Generator)](milestone-plan-generator/SKILL.md)**: 将长期规划转化为带泳道和时间轴的可视化里程碑。

---

## AI项目快速启动与落地 

### 1. 方案设计
在进入细节研发前，明确产品的功能布局、系统架构与高保真交互呈现。

- **[To-be 旅程设计 (AI Product Journey Generator)](ai-product-journey-generator/SKILL.md)**: 基于 AI 场景定义（AI Canvas），细化用户角色与典型使用场景，设计含 AI 交互细节（上传数据示例/推荐操作指令/可见数据）的 To-be User Journey，为原型生成提供输入。
- **[To-be 流程泳道图 (To-be Process Designer)](to-be-process-designer/SKILL.md)**: 输入现状流程 + 问题痛点 + AI 机会点画布，以流程挖掘（SKP 阶段1）视角重排为「列=业务阶段(L3) × 行=角色泳道」的深度任务(L5)序列，登记执行主体 / HITL 焦点 / 规则依据类型 / 价值锚定 / 异常链路，输出结构化 YAML + 泳道式 HTML 流程图。
- **[Agent 产品方案 (Agent Product Proposal Generator)](agent-product-proposal-generator/SKILL.md)**: 基于理需求、场景定义、挖知识、梳理本体的各项产出，聚合生成一份「Agent 产品方案」Markdown 设计文档（产品定位 → 形态架构 → 演示故事线 → 功能与 UI 组件 → Agent 行为 → 规则消费门禁），可直接交给原型作者照单施工。
- **[任务流程拆解图 (Deep Task Flow Analyzer)](deep-task-flow-analyzer/SKILL.md)**: 承接 AI 场景定义（AI Canvas / To-be 旅程 / 服务蓝图），以 SKP 阶段1「任务流程挖掘」视角把业务按「L3 业务阶段 → L4 活动分组 → L5 可执行动作」三层纵切，登记每个 L5 的执行主体 / 输入输出 / 规则依据 / 异常·HITL，并聚焦高价值 L4（P0）下钻为 L5 深度任务序列，输出「端到端深度任务流程地图」HTML + YAML。与 To-be 泳道图互补：泳道图答「谁在何时做」，本 Skill 答「一件事拆成几个原子动作、每步依据与异常」。
- **[业务规则挖掘器 (Business Rule Miner)](business-rule-miner/SKILL.md)**: 承接任务流程拆解产物（使用点）+ SRP 已识别规则类型 + 调研素材，以 SKP 阶段2「任务处理规则挖掘」视角，把每个任务依据什么处理深挖为五类可消费的业务知识结构（决策模型/模版范例/术语字典/关键信息提取要点/关联关系），每条规则/样本绑定使用点、来源可追溯，并做 P1↔P2 双向可追踪交叉核对，输出《任务处理规则挖掘清单》HTML + YAML。
- **[Agentic 工作流设计 (Agentic Workflow Designer)](agentic-workflow-designer/SKILL.md)**: 承接 To-be 旅程，识别其中的各 AI 能力（不同目的/输入输出即拆分，HITL 中间环节不拆），为每个能力生成 PlantUML 活动序列图；以 Agentic 架构专家视角显式设计达成场景 KPI 所需的 Agent 编排（Agent 分解/编排模式/推理循环/护栏/人机协同/失败兜底），关键活动高亮渲染进 HTML。
- **[MVP 原型生成器 (Prototype Generator)](prototype-generator/SKILL.md)**: 输入 AI Canvas + To-be Journey，编译输出可启动运行的前后端一体化 MVP 应用（React/Vue + Express + Mock AI/业务服务），含启动验证。
- **[UX 优化器 (UX-Optimizer)](ux-optimizer/SKILL.md)**: 面向 MVP-prototype 产品级 UI，按「企业品牌 × 业务主题」定制独立产品设计系统，以覆盖层无侵入注入 tokens + 组件规范，并产出 UX 设计报告（自含设计系统，不依赖全局 design.md）。
- **[PlantUML 流程图 (PlantUML Flow Generator)](plantuml-flow-generator/SKILL.md)**: 绘制专业的 PlantUML 时序图、活动图等技术流程图。

### 2. 需求拆解
将宏观规划向下拆解为可执行、可度量的需求卡片与迭代计划。

- **[用户故事地图 (Story Map Generator)](story-map-generator/SKILL.md)**: 构建“阶段-活动-接触点-用户故事”的四层需求骨架。
- **[MVP 迭代计划 (MVP Plan Generator)](mvp-plan-generator/SKILL.md)**: 针对 Must-Have 需求列表，自动规划 MVP 迭代计划与看板。

### 3. MVP 评测与验证
为 MVP 提供「能否上线」的可量化依据——测试数据集（怎么测）与成效指标/门禁（够不够好）。

- **[MVP 测试数据集 (AI Test Dataset Generator)](ai-test-dataset-generator/SKILL.md)**: 自动生成符合“三层三类”结构的 AI MVP 测试数据集。
- **[MVP 成效指标体系 (MVP Metrics Generator)](mvp-metrics-generator/SKILL.md)**: 设计 MVP 成效指标与上线门禁句（Go/No-Go）。

---

## 使用建议
- **全局业务诊断与规划**: 优先使用 `NSM Analysis` 进行端到端的企业调研、竞争态势分析及北极星指标推导。
- **初次拜访/数字化评估**: 优先使用 `AI Maturity Assessment` 和 `Business Process Deep Analyzer`。
- **方案与 Agent 规则设计**: 组合使用 `AI Opportunity Map` -> `AI Canvas` -> `Agent Ontology Designer` -> `AI Scenario Matrix`；进入设计落地时，若要呈现「AI 场景 To-be 流程全景」用 `To-be Process Designer`（流程/任务挖掘视角，供 Agent 本体与规则绑定），若要细化用户体验用 `To-be Journey`，随后衔接 `Agentic Workflow` -> `MVP Prototype` -> `UX-Optimizer`。
- **需求梳理**: 使用 `Story Map` 构建「阶段-活动-接触点-用户故事」四层需求骨架。
- **MVP 评测**: 组合使用 `MVP Metrics` + `AI Test Dataset`（委派 `mvp-evaluator` / `/mvp-eval`），为 MVP 提供 Go/No-Go 依据。

---

## 开发者工具与元技能 (Meta-Skills)

用于扩展和维护本技能库的辅助工具。

- **[技能生成器 (Skill Creator)](skill-creator/SKILL.md)**: 自动生成符合 FDE 规范的新技能模板。
- **[Agent 生成器 (Agent Creator)](agent-creator/SKILL.md)**: 快速编排与生成新的 Subagent 定义。
- **[Command 生成器 (Command Creator)](command-creator/SKILL.md)**: 自动生成跨平台一致的命令（/command）定义。
- **[插件生成器 (Plugin Creator)](plugin-creator/SKILL.md)**: 为新技能生成平台适配插件。
- **[前端设计规范 (Frontend Design)](frontend-design/SKILL.md)**: 供 AI 消费的 UI/UX 设计原则与模式库。
- **[快速开始 (Get Started)](get-started/SKILL.md)**: 新手引导与环境检查技能。
