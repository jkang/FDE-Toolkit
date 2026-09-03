# AI for Product Managers (AI4PM) Skills Index

欢迎使用 **AI4PM 技能库**。本库专为产品经理与 FDE 四步法设计，提供从客户战略洞察到高保真原型生成的全链路 AI 辅助工具。

本文件是本库的**总索引 + 使用路线图**：它既为**人**提供「怎么用、用什么命令」的快速上手路径，也为 **AI**（Subagent / Command）提供「每个环节该串哪个 Skill、产什么、喂给谁」的编排依据。

> 协作规范见仓库根目录 `AGENTS.md`；各 Skill 的详细 SOP 见其 `SKILL.md`。
> 所有产物遵循**双重输出**（结构化 YAML + 交互式 HTML）与**两层目录**（`[公司/业务名]/` 与 `[公司/业务名]/[场景名]/`）规范。

---

## 0. 快速上手：先用 /command（推荐给用户）

每个工作流已被封装成「**命令（/X）→ Subagent → Skill 组合**」。用户只需要在 opencode 里输入一条 `/命令`，即可自动串联一整条链路，无需手动逐个调用 Skill。

| 命令 | 编排的 Subagent | 串联的 Skills | 用途 |
| --- | --- | --- | --- |
| `/nsm` | nsm-analyst | `nsm-analysis`（business-research → swot-analysis → strategy-derivation） | 企业北极星战略全链路分析 |
| `/client-insight` | client-insight-advisor | `company-ai-maturity-research`、`osm-map-generator`、`business-process-deep-analyzer`、`journey-map-generator`、`blueprint-map-generator` | 客户洞察与现状业务梳理 |
| `/opportunity` | opportunity-advisor | `ai-opportunity-map-generator`、`ai-canvas-generator`、`context-knowledge-data-analyzer`、`ai-scenario-matrix-generator` | AI 机会挖掘与优先级评估 |
| `/agent-arch` | agent-arch-designer | `to-be-process-designer`、`deep-task-flow-analyzer`、`business-rule-miner`、`agent-ontology-designer`、`agentic-workflow-designer`、`context-knowledge-data-analyzer` | Agent 系统设计（SKP P1→P2 + 结构/行为/资源三视图） |
| `/mvp-prototype` | mvp-prototype | `agent-product-proposal-generator`、`ai-product-journey-generator`、`prototype-generator`、`ux-optimizer` | Agent 产品方案 → To-be 旅程 → MVP 原型 → UX 定制优化 |
| `/mvp-eval` | mvp-evaluator | `ai-test-dataset-generator`、`mvp-metrics-generator` | MVP 评测（测试数据集 / 成效指标 / Go-No-Go） |
| `/requirement` | requirement-analyst | `story-map-generator`、`mvp-plan-generator` | 需求拆解（故事地图 / MVP 迭代计划） |
| `/roadmap` | roadmap-planner | `roadmap-generator`、`milestone-plan-generator` | 战略规划（路线图 / 里程碑） |

> 说明：
> - 以上命令与 Agent 是多端维护的（`.opencode/`、`.qoder/`），内部使用请调用 `/命令` 或 `@Subagent`。
> - **Discovery Agent**（宏 Agent）不接受逐条命令，而是**一次性编排**整条 FDE 流程并汇总出交付 Deck，见下节。
> - 未被任何 command 包裹的**单体 Skill**（如 `value-stream-mapper`、`problem-definition`、`opportunity-definition`、`unified-report-dashboard`）也可按名称单独触发。

---

## 1. FDE 四步法主流程（给 AI 的编排依据）

FDE 四步法：**理需求 → 挖知识 → 建本体 → 生智能**。每一步由若干 Skill 协同，产物作为下一步输入。全链路可用 `discovery-agent` 一键编排，最后用 `unified-report-dashboard` 汇总。

> 🔁 **[Discovery Agent](discovery-agent/SKILL.md)**：宏编排器。输入客户名称 + 业务领域 + 资料，自动按顺序调度下面各 Skill，最终交由 **[统一报告仪表盘 (Unified Report Dashboard)](unified-report-dashboard/SKILL.md)** 汇总为可交付 Deck。适合完整项目启动。

### ① 理需求（Understand the Need）— 看懂现状，定义问题与场景
> 评估企业的 AI 战略地位与就绪度，梳理 As-Is，识别断点痛点，把问题/机会定义成可量化、可立项的输入。

- **[企业北极星战略全景分析 (NSM Analysis)](nsm-analysis/SKILL.md)**：宏技能。端到端业务调研 → SWOT → 战略与北极星指标推导（含 business-research / swot-analysis / strategy-derivation 三个微技能）。
- **[AI 成熟度评估与战略调研 (Company AI Maturity Research)](company-ai-maturity-research/SKILL.md)**：对企业 AI 就绪度与战略现状进行评估。
- **[OSM 目标度量地图 (OSM Map Generator)](osm-map-generator/SKILL.md)**：把战略目标拆为策略（Strategy）与度量（Metrics）。
- **[价值流图 (Value Stream Mapper)](value-stream-mapper/SKILL.md)**：梳理 L1 端到端价值链全景，并在业务环节级标注聚焦范围（★ + 优先级），是后续拆解的全貌底稿。
- **[业务流程深度分析 (Business Process Deep Analyzer)](business-process-deep-analyzer/SKILL.md)**：把单个价值段下钻为 L3/L4 现状泳道图，逐环节标痛点与任务明细表。
- **[业务问题定义 (Problem Definition)](problem-definition/SKILL.md)**：承接痛点 + 根因（5-Why），用 8 要素把一个痛点定义成可取证、可量化、可归因的业务问题。
- **[体验旅程图 (Journey Map Generator)](journey-map-generator/SKILL.md)**：生成含情感波动、交互点与痛点的体验旅程图。
- **[服务蓝图 (Blueprint Map Generator)](blueprint-map-generator/SKILL.md)**：绘制含前台接触点、后台流程与支撑系统的服务蓝图。
- **[AI 机会场景地图 (AI Opportunity Map Generator)](ai-opportunity-map-generator/SKILL.md)**：从流程痛点挖掘自动化 / 智能化机会，生成机会地图。
- **[机会点定义 (Opportunity Definition)](opportunity-definition/SKILL.md)**：承接问题定义 + 机会地图，用 5 要素 + 价值收益拆解，定义成可评审、可立项的机会点。
- **[AI 场景画布 (AI Canvas Generator)](ai-canvas-generator/SKILL.md)**：为特定 AI 场景生成 10 维画布（用户痛点 / 输入输出 / 模型方案等）。
- **[AI 场景优先级矩阵 (AI Scenario Matrix Generator)](ai-scenario-matrix-generator/SKILL.md)**：基于收益与成本把 AI 场景映射到 5x5 优先级矩阵。
- **[产品演进路线图 (Roadmap Generator)](roadmap-generator/SKILL.md)**：生成垂直阶段式商业路线图。
- **[里程碑计划 (Milestone Plan Generator)](milestone-plan-generator/SKILL.md)**：把长期规划转为带泳道与时间轴的可视化里程碑。

### ② 挖知识（Mine the Knowledge）— 拆解流程与规则
> 以「场景级」视角深挖：To-be 流程怎么走、一件事拆成哪些原子动作、每步依据什么规则处理。

- **[To-be 流程泳道图 (To-be Process Designer)](to-be-process-designer/SKILL.md)**：以现状流程 + 痛点 + AI 机会点画布为输入，重排为「列=L3 阶段 × 行=角色泳道」的深度任务序列，登记执行主体 / HITL / 规则依据 / 价值锚定 / 异常链路。
- **[任务流程拆解图 (Deep Task Flow Analyzer)](deep-task-flow-analyzer/SKILL.md)**：按「L3 阶段 → L4 活动 → L5 动作」三层纵切，聚焦高价值 L4（P0）下钻，**产出使用点**（供规则挖掘）。与 To-be 泳道图互补：泳道图答「谁在何时做」，本 Skill 答「一件事件拆成几个原子动作、每步依据与异常」。
- **[业务规则挖掘器 (Business Rule Miner)](business-rule-miner/SKILL.md)**：以使用点为输入，挖掘五类可消费知识（决策模型 / 模版范例 / 术语字典 / 关键信息提取 / 关联关系），并做 P1↔P2 双向可追踪。
- **[Agentic 工作流设计 (Agentic Workflow Designer)](agentic-workflow-designer/SKILL.md)**：识别 AI 能力（不同目的/输入输出即拆，HITL 中间环节不拆），为每个能力生成 PlantUML 活动序列图 + Agent 编排。
- **[CKD 数据映射分析 (Context/Knowledge/Data Analyzer)](context-knowledge-data-analyzer/SKILL.md)**：梳理每一步所需的上下文 / 知识 / 数据资产清单。

### ③ 建本体（Build the Ontology）— 沉淀业务语义
> 把业务知识固化为 Agent 可执行的静态语义结构。

- **[Agent 本体设计器 (Agent Ontology Designer)](agent-ontology-designer/SKILL.md)**：以 AI 场景定义 / 流程挖掘为输入，建模三层本体（对象关系 → 行动边界 → 状态迁移），输出可视化 HTML + 可注入 System Prompt 的语义结构。

### ④ 生智能（Generate the Intelligence）— 方案、原型、评测
> 把前面的业务深度翻译成可施工的产品方案、可运行的原型，以及「能否上线」的量化依据。

- **[Agent 产品方案 (Agent Product Proposal Generator)](agent-product-proposal-generator/SKILL.md)**：聚合理需求/场景/挖知识/本体产出，生成一份可施工的 Markdown 方案（产品定位 → 形态架构 → 演示故事线 → 功能与 UI → Agent 行为 → 规则消费门禁）。
- **[To-be 旅程设计 (AI Product Journey Generator)](ai-product-journey-generator/SKILL.md)**：细化用户角色与典型场景，设计含 AI 交互细节（上传数据示例 / 推荐操作指令 / 可见数据）的 To-be Journey。
- **[MVP 原型生成器 (Prototype Generator)](prototype-generator/SKILL.md)**：输入 AI Canvas + To-be Journey，编译可启动的前后端一体化 MVP（React/Vue + Express + Mock AI/业务服务），含启动验证。
- **[UX 优化器 (UX-Optimizer)](ux-optimizer/SKILL.md)**：按「企业品牌 × 业务主题」定制产品设计系统，以覆盖层注入 mvp-prototype，产出 UX 设计报告。
- **[用户故事地图 (Story Map Generator)](story-map-generator/SKILL.md)**：构建“阶段-活动-接触点-用户故事”四层需求骨架。
- **[MVP 迭代计划 (MVP Plan Generator)](mvp-plan-generator/SKILL.md)**：针对 Must-Have 需求自动规划 MVP 迭代计划与看板。
- **[MVP 测试数据集 (AI Test Dataset Generator)](ai-test-dataset-generator/SKILL.md)**：自动生成符合“三层三类”结构（覆盖场景 + 支持归因）的 MVP 测试数据集。
- **[MVP 成效指标体系 (MVP Metrics Generator)](mvp-metrics-generator/SKILL.md)**：设计 MVP 成效指标与上线门禁句（Go/No-Go）。
- **[PlantUML 流程图 (PlantUML Flow Generator)](plantuml-flow-generator/SKILL.md)**：绘制专业 PlantUML 时序图 / 活动图等技术流程图。

---

## 2. 使用建议（按场景选择入口）

- **完整项目启动（一次性全链路）**：用 `discovery-agent` 批量编排 → 汇总到 `unified-report-dashboard`。
- **企业战略诊断 / 北极星指标**：用 `/nsm`（业务调研 → SWOT → 战略推导）。
- **初次拜访 / 数字化评估**：用 `/client-insight`（AI 成熟度 + 流程深度分析）。
- **找 AI 机会并定优先级**：`/opportunity` → AI 机会地图 → 画布 → CKD → 优先级矩阵。
- **让 Agent 规则落地**：`/agent-arch` → To-be 流程/任务拆解（P1）→ 规则挖掘（P2）→ 本体/工作流/CKD 三视图。
- **把场景做成原型**：`/mvp-prototype` → Agent 产品方案 → To-be 旅程 → MVP 原型 → UX 优化。
- **判断能否上线**：`/mvp-eval` → 测试数据集 + 成效指标/门禁（Go/No-Go）。
- **需求梳理与迭代排期**：`/requirement` → 故事地图 → MVP 迭代计划；规划长期节奏用 `/roadmap`。

> **联动顺序提示**：若走完整链路，通常遵循 ① 理需求（问题/机会/画布）→ ② 挖知识（流程/规则/工作流/CKD）→ ③ 建本体（语义结构）→ ④ 生智能（方案/旅程/原型/评测）。上一步产物（YAML）作为下一步输入；MVP 评测应建立在 MVP 原型已落地之后。

---

## 3. 开发者工具与元技能（Meta-Skills）

用于扩展和维护本技能库的辅助工具。

- **[技能生成器 (Skill Creator)](skill-creator/SKILL.md)**：自动生成符合 FDE 规范的新技能模板。
- **[Agent 生成器 (Agent Creator)](agent-creator/SKILL.md)**：快速编排与生成新的 Subagent 定义。
- **[Command 生成器 (Command Creator)](command-creator/SKILL.md)**：自动生成跨平台一致的命令（/command）定义。
- **[插件生成器 (Plugin Creator)](plugin-creator/SKILL.md)**：为新技能生成平台适配插件。
- **[前端设计规范 (Frontend Design)](frontend-design/SKILL.md)**：供 AI 消费的 UI/UX 设计原则与模式库。
- **[快速开始 (Get Started)](get-started/SKILL.md)**：新手引导与环境检查技能。

> 新增/修改 Skill 时：在 `skills/<skill-name>/` 编写 `SKILL.md` + `references/` + `scripts/` + `templates/` + `examples/`，并同步登记到本文件；稳定后经用户确认再 `rsync` 到全局 `~/.config/opencode/skills/`（详见 `AGENTS.md`）。
