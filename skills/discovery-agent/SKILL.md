---
name: discovery-agent
description: |
  全链路 AI 场景探索编排器（Discovery Agent）。接受客户名称、行业领域和相关文档资料，
  按 FDE 四步法（理需求 → 挖知识 → 建本体 → 生智能）顺序调度完整 Skill 链，
  最终用 unified-report-dashboard 汇总生成完整的交付 Deck。

  Triggers when user mentions:
  - "discovery agent"
  - "全链路分析"
  - "端到端 AI 场景规划"
  - "完整探索流程"
  - "start discovery"
  - "启动探索"
author: KK
---

# Discovery Agent — FDE 四步法全链路 AI 场景探索编排器

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**：
> 本 Agent 编排的每一个子 Skill 都必须**同时**输出：
> 1. **结构化 YAML**：用于跨阶段数据传递与存档。
> 2. **交互式 HTML**：供最终用户直观审查与演示。
> （唯一例外：`agent-product-proposal-generator` 输出**单一 Markdown**，见其 SKILL.md 例外声明。）
>
> **输出路径规范**：产物按两层目录组织——公司/业务级产物存放于 `[客户名称]/` 目录，场景级产物（属于具体 AI 场景的）必须放入 `[客户名称]/[场景名]/` 子目录（两层规范）。文件命名遵循 `[客户名称]-[场景名]-[阶段名称].html` / `.yaml` 格式，具体以各 Skill 的命名规范为准。
>
> **视觉规范**：默认浅色模式，内容区宽度 100%（撑满容器）。
> unified-report-dashboard 使用深色模式 (`#0a0e27`)。

> [!IMPORTANT]
> **方法论对齐（本编排器的唯一依据）**：本流程严格照搬 FDE 线下课四步法
> `理需求 → 挖知识 → 建本体 → 生智能`，以及理需求内部
> `懂业务(桌研) → 找痛点(场景发现) → 定方案(场景定义)` 的三段式。
> 每一阶段结束**必须**停下请用户/业务方确认，并提示对 Agent 产物做**交叉校验**
> （关键结论务必以业务访谈、一手数据、第三方报告校验后再作为依据——Agent 产物不可 100% 信任）。

---

## 总体编排流程

```
输入 (客户 + 领域 + 资料)
  │
  ├─ Phase 1 · 理需求（懂业务 → 找痛点 → 定方案）
  │     Step 1  业务桌研（手工：主体 → 商业模式 → 要素链；无专用 skill）
  │     Step 2  价值流 L1 全景（value-stream-mapper：价值流 → 价值段 → 聚焦范围 ★）
  │     Step 3  现状流程建模 L3/L4（business-process-deep-analyzer：现状泳道图 + 痛点）
  │     Step 4  瓶颈痛点根因（problem-definition：痛点 → 5-Why → 8 要素业务问题）
  │     Step 5  服务蓝图（blueprint-map-generator：前台/后台/支撑）【可选，与流程互补】
  │     Step 6  AI 机会点（opportunity-definition：5 要素机会点）
  │     Step 7  AI 场景画布 Top3（ai-canvas-generator：10 维画布，场景名写入 cache）
  │     Step 8  优先级矩阵（ai-scenario-matrix-generator：5×5）
  │
  ├─ Phase 2 · 挖知识（P1 任务流程 → P2 处理规则）
  │     Step 9  任务流程挖掘 P1（deep-task-flow-analyzer：L3→L5 + 使用点）
  │     Step 10 To-be 流程泳道（to-be-process-designer：列=L3 × 行=角色泳道）×【可选，与 P1 互补】
  │     Step 11 处理规则挖掘 P2（business-rule-miner：五类规则 + P1↔P2 双向可追踪）
  │     Step 12 CKD 知识/数据映射（context-knowledge-data-analyzer：上下文/知识/数据矩阵）
  │
  ├─ Phase 3 · 建本体（业务语义 → 可执行运行时契约）
  │     Step 13 Agent 本体（agent-ontology-designer：对象/关系 → 行动边界 → 状态迁移）
  │     Step 14 Agentic 工作流（agentic-workflow-designer：AI 能力序列图 + Agent 编排）
  │
  ├─ Phase 4 · 生智能（产品方案 → To-be 旅程 → MVP 原型 → UX → 评测）
  │     Step 15 Agent 产品方案（agent-product-proposal-generator：8 段式施工蓝图，单一 .md）
  │     Step 16 To-be 旅程（ai-product-journey-generator：角色细化 + AI 交互细节）
  │     Step 17 MVP 原型（prototype-generator：mvp-spec + 前后端 MVP + 启动验证）
  │     Step 18 UX 优化（ux-optimizer：企业品牌 × 业务主题 → 定制设计系统 + 覆盖层注入）
  │     Step 19 MVP 评测（ai-test-dataset-generator + mvp-metrics-generator：三层三类 + Go/No-Go）
  │
  └─ Phase D · 汇总交付
        Step 20 unified-report-dashboard 生成 Deck
```

---

## Step 0：输入收集与环境预检

### 0.1 收集必要输入

向用户确认以下信息（如已在对话中提供，直接采用，无需重复询问）：

| 参数 | 必填 | 说明 |
|------|------|------|
| 客户名称 | ✅ | 目标企业/组织名称，用于命名所有产物（即各 Skill 的 `[公司/业务名]`） |
| 业务领域 | ✅ | 如：供应链、客服、营销、医疗、金融等 |
| 分析范围 | 否 | 默认执行全部 20 步；可指定仅执行某 Phase 或某 Step |
| 参考文档/资料 | 否 | 用户上传或粘贴的背景材料（年报、产品文档、业务访谈纪要等） |
| 竞品/对标企业 | 否 | 用于 SWOT / 机会挖掘的参照系 |
| 额外关注点 | 否 | 用户特别关心的分析维度 |

### 0.2 工具可用性预检

- **有搜索能力**：静默进入全自动流程，不打扰用户。
- **无搜索能力**：告知用户并请求提供背景文档，继续执行。

### 0.3 创建输出目录与进度追踪表

执行以下两步初始化：
1. 在当前工作目录下创建 `[客户名称]/` 子目录和 `[客户名称]/phase_cache/` 子目录，所有产物和缓存写入其中。
2. 创建 `[客户名称]/discovery_index.md` 作为阶段进度追踪表，**必须完整写入以下全部 20 行**：

```markdown
# [客户名称] Discovery 进度追踪

| 步骤 | 名称 | 状态 | 产物文件 |
|------|------|------|----------|
| Step 1 | 业务桌研（主体/商业模式/要素链） | ⏳ 待执行 | [客户名称]-桌研纪要.md |
| Step 2 | 价值流 L1 全景 | ⏳ 待执行 | [客户名称]-价值流图.html |
| Step 3 | 现状流程建模 L3/L4 | ⏳ 待执行 | [客户名称]-[价值段]-现状流程图.html |
| Step 4 | 瓶颈痛点根因（8 要素） | ⏳ 待执行 | [客户名称]-[价值段]-问题定义.html |
| Step 5 | 服务蓝图（可选） | ⏳ 待执行 | [客户名称]-服务蓝图.html |
| Step 6 | AI 机会点（5 要素） | ⏳ 待执行 | [客户名称]-[场景]-机会点定义.html |
| Step 7 | AI 场景画布（Top3） | ⏳ 待执行 | [客户名称]-AI画布-*.html |
| Step 8 | AI 场景优先级矩阵 | ⏳ 待执行 | [客户名称]-AI场景优先级矩阵.html |
| Step 9 | 任务流程挖掘 P1（L3→L5） | ⏳ 待执行 | [客户名称]-[场景]-任务流程拆解.html |
| Step 10 | To-be 流程泳道（可选） | ⏳ 待执行 | [客户名称]-[场景]-To-be流程.html |
| Step 11 | 处理规则挖掘 P2（五类） | ⏳ 待执行 | [客户名称]-[场景]-业务规则挖掘.html |
| Step 12 | CKD 数据映射 | ⏳ 待执行 | [客户名称]-[场景]-CKD矩阵分析.html |
| Step 13 | Agent 本体设计 | ⏳ 待执行 | [客户名称]-[场景]-本体设计.html |
| Step 14 | Agentic 工作流 | ⏳ 待执行 | [客户名称]-[场景]-Agentic工作流.html |
| Step 15 | Agent 产品方案 | ⏳ 待执行 | [客户名称]-[场景]-Agent产品方案.md |
| Step 16 | To-be 旅程 | ⏳ 待执行 | [客户名称]-[场景]-To-be旅程.html |
| Step 17 | MVP 原型 | ⏳ 待执行 | [客户名称]-[场景]-mvp-spec.yaml + mvp-prototype/ |
| Step 18 | UX 优化 | ⏳ 待执行 | [客户名称]-[场景]-UX设计报告.html |
| Step 19 | MVP 评测（测试数据集 + Go/No-Go） | ⏳ 待执行 | [客户名称]-[场景]-AI测试数据集.html / -MVP指标设计.html |
| Step 20 | 统一报告仪表盘 | ⏳ 待执行 | [客户名称]-统一报告仪表盘.html |
```

每完成一个步骤，立即将对应行的状态改为 `✅ 完成` 并填入实际产物文件名。

### 0.4 阶段门禁（HITL + 交叉校验）——本编排器的强制规则

每个 Phase 结束后**不得自动进入下一 Phase**，必须：
1. **列出该阶段全部产物**，向用户/业务方展示并请求确认（可暂停、可反馈修订）。
2. **提示交叉校验**：Agent / skill 信息搜集能力有限，关键结论务必以业务访谈、一手数据、第三方报告交叉校验后再作为下一步依据（不可 100% 信任）。
3. 用户确认后，再将本阶段核心结论写入 `phase_cache/` 供下一阶段读取。

---

## Phase 1：理需求（懂业务 → 找痛点 → 定方案）

> 本阶段方法主线照搬 FDE 线下课「理需求三段式」：**懂业务（桌研）→ 找痛点（场景发现）→ 定方案（场景定义）**。
> 阶段结束 → 交付摘要 + 请用户确认（见 0.4 门禁）。

### Step 1：业务桌研（手工，无专用 skill）

**方法要点**：桌研第一件事不是查资料，而是回答三个递进问题——① 识别主体（谁在提需求、归哪个一级业务部门）；② 识别商业模式（电商类还是大货类、靠什么赚钱）；③ 梳理商业模式要素链（供应端到客户端生意怎么转）。目标是 **60%-ready**（带着假设见业务方），不做全。

- 输入：原始需求 / idea、公开资料
- 产出（写入 `phase_cache/p1_desk.md`）：
  - 业务主体与画像（部门定位 × 负责业务 × 服务客户 × 核心指标）
  - 商业模式简析 + 商业模式要素链
  - 调研焦点对齐（含核心 KPI 与干系人：Sponsor / 项目负责人真实诉求）

### Step 2：价值流 L1 全景

**读取并遵循 `value-stream-mapper/SKILL.md` 的完整指令。**

- 传入：客户名称、业务领域、Step 1 桌研产物
- 产出：`[客户名称]/[客户名称]-价值流图.yaml / .html`（价值流 → 价值段(列) → 业务环节(列内卡)，并据原始 idea 标注聚焦范围 ★）
- **Checkpoint**：将 L1 价值流划分与聚焦范围写入 `phase_cache/p2_value.md`（供 Step 3 下钻）。

### Step 3：现状流程建模 L3/L4

**读取并遵循 `business-process-deep-analyzer/SKILL.md` 的完整指令。**

- 传入：客户名称、聚焦价值段（从 `phase_cache/p2_value.md` 读取）
- 产出：`[客户名称]/[客户名称]-[价值段]-现状流程图.yaml / .html`（列=L3 子环节 × 行=角色泳道 × 格=L4 任务；逐环节标注痛点：高耗时 / 高认知负荷 / 高频错误 / 来回往复 / 系统瓶颈，并附任务明细表）
- **Checkpoint**：将 L1 流程节点、L3/L4 结构与核心痛点写入 `phase_cache/p3_process.md`。

### Step 4：瓶颈痛点根因（问题定义 8 要素）

**读取并遵循 `problem-definition/SKILL.md` 的完整指令。**

- 传入：需求现状泳道图（`phase_cache/p3_process.md`）、调研纪要
- 流程：识别表面痛点 → 5-Why 挖根因 → 聚类归纳（同根因 → 一个问题）→ 用 8 要素定义
- 产出：`[客户名称]/[客户名称]-[价值段/环节]-问题定义.yaml / .html`
- **Checkpoint**：将业务问题清单（含根因簇）写入 `phase_cache/p4_problem.md`（供 Step 6 机会点）。

### Step 5：服务蓝图（可选，与流程分析互补）

**读取并遵循 `blueprint-map-generator/SKILL.md` 的完整指令。**

- 传入：客户名称、流程阶段与触点（`phase_cache/p3_process.md`）
- 产出：`[客户名称]/[客户名称]-服务蓝图.yaml / .html`（前台接触点 / 后台流程 / 支撑系统）
- 说明：若用户只需流程主线，本步可跳过，在交付摘要中说明。

### Step 6：AI 机会点（5 要素）

**读取并遵循 `opportunity-definition/SKILL.md` 的完整指令。**

- 传入：业务问题定义（`phase_cache/p4_problem.md`）+ AI 机会地图
- 产出：`[客户名称]/[客户名称]-[场景]-机会点定义.yaml / .html`（5 要素：一句话描述 / 业务角色场景 / 问题痛点 / 方案假设 / 价值收益 + 价值收益拆解）
- **Checkpoint**：将 AI 机会点列表（名称 + 优先级）写入 `phase_cache/p6_opportunity.md`。

### Step 7：AI 场景画布（Top 3 场景）

**读取并遵循 `ai-canvas-generator/SKILL.md` 的完整指令。**

- 传入：客户名称、业务领域、机会点列表（`phase_cache/p6_opportunity.md`）
- 取优先级最高的 **Top 3** AI 场景，各生成一份 10 维 AI Canvas
- 产出（共 3 组）：`[客户名称]/[客户名称]-[场景名]-AI画布.yaml / .html`（场景级，存入 `[客户名称]/[场景名]/`）
- **Checkpoint**：将 3 个场景的**精确名称**写入 `phase_cache/p7_canvas.md`，格式如下（供 Step 20 导航及后续阶段复用）：

```markdown
# Canvas 场景文件列表
scene_1: 场景A名称
scene_2: 场景B名称
scene_3: 场景C名称
```

### Step 8：AI 场景优先级矩阵

**读取并遵循 `ai-scenario-matrix-generator/SKILL.md` 的完整指令。**

- 传入：所有 AI 场景列表（`phase_cache/p6_opportunity.md`）
- 基于收益 × 可行性维度，生成 5×5 优先级矩阵（与 WSJF 排序精神一致）
- 产出：`[客户名称]/[客户名称]-AI场景优先级矩阵.yaml / .html`
- **Checkpoint**：将 P0 / P1 场景列表写入 `phase_cache/p8_matrix.md`。
- **Phase 1 结束**：展示已生成产物，请用户确认并交叉校验（见 0.4 门禁）。

---

## Phase 2：挖知识（P1 任务流程 → P2 处理规则）

> 本阶段承接「理需求」的定场景。方法主线照搬 FDE 线下课「挖知识」：**P1 任务流程挖掘（L3→L5）+ P2 处理规则挖掘（五类）**，只讲业务、不进入技术方案。

### Step 9：任务流程挖掘 P1

**读取并遵循 `deep-task-flow-analyzer/SKILL.md` 的完整指令。**

- 传入：AI 场景定义（AI Canvas / To-be 旅程，`phase_cache/p7_canvas.md`）+ 现状流程
- 加工：把定场景的 L3 业务阶段、L4 任务/步骤继续下钻为不可再分的 L5 深度任务；登记每个 L5 的执行主体 / 输入输出 / 规则依据 / 异常·HITL
- 产出：`[客户名称]/[场景名]/[客户名称]-[场景名]-任务流程拆解.yaml / .html`
- **Checkpoint**：将 L5 深度任务序列与**使用点**写入 `phase_cache/p9_taskflow.md`（供 Step 11 规则挖掘）。

### Step 10：To-be 流程泳道（可选，与 P1 互补）

**读取并遵循 `to-be-process-designer/SKILL.md` 的完整指令。**

- 传入：现状流程 + 问题痛点 + AI 机会点画布
- 产出：`[客户名称]/[场景名]/[客户名称]-[场景名]-To-be流程.yaml / .html`（列=L3 阶段 × 行=角色泳道；登记执行主体 / HITL / 规则依据 / 价值锚定 / 异常链路）
- 说明：泳道图（角色协同视角）与 Step 9 任务拆解图（任务粒度视角）互补；若后续深挖规则，**以 Step 9 的使用点为准**。

### Step 11：处理规则挖掘 P2

**读取并遵循 `business-rule-miner/SKILL.md` 的完整指令。**

- 传入：任务流程拆解的使用点（`phase_cache/p9_taskflow.md`）+ 已识别规则类型 + 调研素材
- 加工：把「每个任务依据什么处理」深挖为五类可消费知识（决策模型 / 模版范例 / 术语字典 / 关键信息提取要点 / 关联关系），每条规则/样本绑定使用点、来源可追溯，并做 P1↔P2 双向可追踪交叉核对
- 产出：`[客户名称]/[场景名]/[客户名称]-[场景名]-业务规则挖掘.yaml / .html`
- **Checkpoint**：将五类规则汇总写入 `phase_cache/p11_rule.md`。

### Step 12：CKD 知识/数据映射

**读取并遵循 `context-knowledge-data-analyzer/SKILL.md` 的完整指令。**

- 传入：AI Workflow 步骤（`phase_cache/p9_taskflow.md` / Step 11 规则）
- 产出：`[客户名称]/[场景名]/[客户名称]-[场景名]-CKD矩阵分析.yaml / .html`（10 维语义画像：上下文 / 知识 / 数据 / 历史场景语料结构特征）
- **Phase 2 结束**：展示产物，请用户确认并**交叉校验**（关键知识务必以线下走查、边界案例、冲突仲裁校验，见 0.4 门禁）。

---

## Phase 3：建本体（业务语义 → 可执行运行时契约）

> 本阶段照搬 FDE 线下课「建本体」：把「理需求/挖知识」的场景知识包翻译成 Agent 可运行的运行时契约（对象 / 关系 / 状态迁移 / 事件级联），并设计动态行为。

### Step 13：Agent 本体设计

**读取并遵循 `agent-ontology-designer/SKILL.md` 的完整指令。**

- 传入：AI 场景定义 / 知识包（`phase_cache/p11_rule.md`、`phase_cache/p9_taskflow.md`）
- 加工：三层本体建模（对象关系 → 行动边界 → 状态迁移），输出可视化 HTML + 可注入 System Prompt 的业务语义结构
- 产出：`[客户名称]/[场景名]/[客户名称]-[场景名]-本体设计.yaml / .html`
- **Checkpoint**：将业务对象 / 关系 / 状态迁移写入 `phase_cache/p13_ontology.md`。

### Step 14：Agentic 工作流设计

**读取并遵循 `agentic-workflow-designer/SKILL.md` 的完整指令。**

- 传入：To-be 旅程 / To-be 流程（`phase_cache/p7_canvas.md` 场景 + Step 16 旅程可为前置）
- 加工：识别各 AI 能力（不同目的/输入输出即拆分，HITL 中间环节不拆），每个能力生成一张 PlantUML 活动序列图（Agent 分解 / 编排模式 / 护栏 / 关键活动 KPI 高亮），SVG 渲染进 HTML
- 产出：`[客户名称]/[场景名]/[客户名称]-[场景名]-Agentic工作流.yaml / .html`
- **Phase 3 结束**：展示产物，请用户确认并交叉校验（见 0.4 门禁）。

---

## Phase 4：生智能（产品方案 → To-be 旅程 → MVP 原型 → UX → 评测）

> 本阶段照搬 FDE 线下课「生智能」：把「业务规则 + 本体 + 挖知识」的成果聚合翻译成可照单施工的**产品方案**，再落到**可运行的 MVP 原型**，并给出**能否上线**的量化依据。

### Step 15：Agent 产品方案

**读取并遵循 `agent-product-proposal-generator/SKILL.md` 的完整指令。**

- 传入：理需求 / 场景定义 / 挖知识 / 本体的既有产出（`phase_cache/p7_canvas.md`、`p9_taskflow.md`、`p13_ontology.md`）
- 产出：`[客户名称]/[场景名]/[客户名称]-[场景名]-Agent产品方案.md`（8 段式施工蓝图：产品定位 → 形态架构 → 演示故事线 → 功能与 UI 组件 → Agent 行为 → 规则消费门禁；**单一 Markdown，不走 HTML 双输出**）
- **可选**：同一场景需要结构化数据时另输出 `.schema.yaml`。

### Step 16：To-be 旅程设计

**读取并遵循 `ai-product-journey-generator/SKILL.md` 的完整指令。**

- 传入：AI Canvas YAML（`phase_cache/p7_canvas.md`）
- 产出：`[客户名称]/[场景名]/[客户名称]-[场景名]-To-be旅程.yaml / .html`（角色细化 + 典型使用场景 + AI 交互细节：上传数据示例 / 推荐操作指令 / 可见数据 / HITL 停等确认点；与本体/规则对齐）
- **Checkpoint**：将旅程场景与人机分工写入 `phase_cache/p16_journey.md`（供 Step 17）。

### Step 17：MVP 原型

**读取并遵循 `prototype-generator/SKILL.md` 的完整指令。**

- 传入：AI Canvas + To-be 旅程（`phase_cache/p7_canvas.md`、`phase_cache/p16_journey.md`）
- 产出：
  - `[客户名称]/[场景名]/[客户名称]-[场景名]-mvp-spec.yaml`（MVP 设计规格）
  - `[客户名称]/[场景名]/mvp-prototype/`（React/Vue + Express 前后端一体化 MVP，含 Mock AI / Mock 业务服务）
- **启动验证（必须）**：`npm install && npm run dev` + `curl` 健康检查 + 浏览器逐页验证（见 prototype-generator SKILL.md 验证步骤）。

### Step 18：UX 优化

**读取并遵循 `ux-optimizer/SKILL.md` 的完整指令。**

- 传入：mvp-spec + mvp-prototype/（已运行）+ 企业品牌资料 + 业务域/场景
- 加工：按「企业品牌 × 业务主题」推导该客户/场景专属产品设计系统（自含设计系统），以覆盖层无侵入注入 mvp-prototype（UX tokens + 组件样式）
- 产出：`[客户名称]/[场景名]/[客户名称]-[场景名]-ux-audit.yaml` + `[客户名称]-[场景名]-UX设计报告.html`
- **验证**：重启/构建验证 + 浏览器逐页检查定制还原度 + before/after 截图。

### Step 19：MVP 评测（测试数据集 + Go/No-Go）

**读取并遵循 `ai-test-dataset-generator/SKILL.md` 与 `mvp-metrics-generator/SKILL.md` 的完整指令。**

- 传入：AI 功能详述 + 输入输出示例（mvp-spec / 产品方案）
- 产出：
  - `[客户名称]/[场景名]/[客户名称]-[场景名]-AI测试数据集.yaml / .html`（三层三类：覆盖场景 + 支持归因）
  - `[客户名称]/[场景名]/[客户名称]-[场景名]-MVP指标设计.yaml / .html`（搭桥指标 + 打分准则二元化 + 上线门禁句 Go/No-Go）
- **Phase 4 结束**：展示产物，请用户确认并**交叉校验**（尤其 Rubric 二元化判据，见 0.4 门禁）。

---

## Phase D：统一报告汇总

### Step 20：生成 unified-report-dashboard

**读取并遵循 `unified-report-dashboard/SKILL.md` 的完整指令。**

根据前 19 步产物，自动拼装 `[客户名称]/[客户名称]-dashboard.yaml`，配置含 **20 个分析模块卡的 cards 与 navigation**（Phase 1-4 + 汇总），并执行 `build_dashboard.py` 编译到 `[客户名称]/[客户名称]-统一报告仪表盘.html`。

> **路径说明**：编译命令需在 `skills/` 目录下执行，或提供 `build_dashboard.py` 的完整路径。

更新 `[客户名称]/discovery_index.md` 全部行为 `✅ 完成`。

---

## 防遗忘与容错机制

### Phase Cache 规范

每个 Step 完成后，将关键输出摘要写入 `[客户名称]/phase_cache/` 目录下对应的 `.md` 文件。下一步骤执行前必须读取对应缓存文件，防止长对话中丢失上下文。

| 文件 | 存储内容 |
|------|----------|
| `p1_desk.md` | 业务主体画像、商业模式、调研焦点对齐（含核心 KPI / 干系人） |
| `p2_value.md` | L1 价值流划分、聚焦范围 ★ |
| `p3_process.md` | L3/L4 流程节点、核心痛点列表 |
| `p4_problem.md` | 业务问题定义（8 要素 + 根因簇） |
| `p6_opportunity.md` | AI 机会点列表（名称 + 优先级 + 价值收益） |
| `p7_canvas.md` | Top3 场景精确名称（`scene_1/2/3`，供导航与下游复用） |
| `p8_matrix.md` | P0 / P1 场景列表 |
| `p9_taskflow.md` | L5 深度任务序列 + 使用点 |
| `p11_rule.md` | 五类规则汇总（决策/模板/术语/提取/关联） |
| `p13_ontology.md` | 业务对象 / 关系 / 状态迁移 |
| `p16_journey.md` | To-be 旅程场景与人机分工 |

### 中断恢复

如果用户在中途要求恢复，读取 `discovery_index.md` 判断已完成的步骤，从第一个 `⏳ 待执行` 步骤继续，无需重跑已完成阶段。

### 分段执行模式

若用户不需要全链路，可在 Step 0 确认执行范围：

| 模式 | 执行范围 | 前置依赖检查 |
|------|----------|-------------|
| `仅理需求` | Step 1-8 | 无 |
| `仅挖知识` | Step 9-12 | 检查 `phase_cache/p7_canvas.md` 是否存在 |
| `仅建本体` | Step 13-14 | 检查 `phase_cache/p9_taskflow.md` 是否存在 |
| `仅生智能` | Step 15-19 | 检查 `phase_cache/p7_canvas.md` 是否存在 |
| `仅最后汇总` | Step 20 | 检查 `phase_cache/p7_canvas.md` 是否存在 |

**依赖缺失时的处理**：若所需 cache 文件不存在，告知用户：
> 「执行本阶段需要上一阶段的分析结果（如 p7_canvas.md）。请先执行前置阶段，或手动提供对应内容。」

用户可选择：① 先跑前置阶段；② 手动粘贴对应内容让 Agent 继续。

---

## 完成输出

所有步骤完成后，从 `phase_cache/p7_canvas.md` 读取真实场景名称，向用户输出以下**动态**交付物摘要（将 scene_1/2/3 替换为实际场景名）：

```markdown
## ✅ Discovery Agent 完成（FDE 四步法全链路）

**客户**：[客户名称]
**领域**：[业务领域]
**生成时间**：[当前时间]
**产物目录**：`[客户名称]/`

### Phase 1 · 理需求
| # | 模块 | 文件 |
|---|------|------|
| 01 | 业务桌研（主体/商业模式/要素链） | [客户名称]-桌研纪要.md |
| 02 | 价值流 L1 全景 | [客户名称]-价值流图.html |
| 03 | 现状流程建模 L3/L4 | [客户名称]-[价值段]-现状流程图.html |
| 04 | 瓶颈痛点根因（8 要素） | [客户名称]-[价值段]-问题定义.html |
| 05 | 服务蓝图（可选） | [客户名称]-服务蓝图.html |
| 06 | AI 机会点（5 要素） | [客户名称]-[场景]-机会点定义.html |
| 07 | AI 场景画布 · [scene_1/2/3] | [客户名称]-AI画布-*.html |
| 08 | AI 场景优先级矩阵 | [客户名称]-AI场景优先级矩阵.html |

### Phase 2 · 挖知识
| 09 | 任务流程挖掘 P1 | [客户名称]-[场景]-任务流程拆解.html |
| 10 | To-be 流程泳道（可选） | [客户名称]-[场景]-To-be流程.html |
| 11 | 处理规则挖掘 P2 | [客户名称]-[场景]-业务规则挖掘.html |
| 12 | CKD 数据映射 | [客户名称]-[场景]-CKD矩阵分析.html |

### Phase 3 · 建本体
| 13 | Agent 本体设计 | [客户名称]-[场景]-本体设计.html |
| 14 | Agentic 工作流 | [客户名称]-[场景]-Agentic工作流.html |

### Phase 4 · 生智能
| 15 | Agent 产品方案 | [客户名称]-[场景]-Agent产品方案.md |
| 16 | To-be 旅程 | [客户名称]-[场景]-To-be旅程.html |
| 17 | MVP 原型 | mvp-spec.yaml + mvp-prototype/ |
| 18 | UX 优化 | [客户名称]-[场景]-UX设计报告.html |
| 19 | MVP 评测 | [客户名称]-[场景]-AI测试数据集.html / -MVP指标设计.html |

### 汇总
| 🎯 | 统一报告仪表盘 | [客户名称]-统一报告仪表盘.html |

用浏览器打开 **`[客户名称]-统一报告仪表盘.html`** 即可查阅全部交付物。
```

> ⚠️ **交叉校验提醒**：以上产物为 Agent / skill 自动生成，信息搜集能力有限，**关键结论务必以业务访谈、一手数据、第三方报告交叉校验后再作为决策依据**。
