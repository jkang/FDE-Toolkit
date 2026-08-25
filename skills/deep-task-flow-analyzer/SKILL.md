---
name: deep-task-flow-analyzer
description: |
  承接 AI 场景定义（AI Canvas / To-be 旅程 / 服务蓝图），以 SKP 阶段1「任务流程挖掘」专家视角，
  把业务按「L3 业务阶段 → L4 活动分组 → L5 可执行动作」三层纵切，登记每个 L5 的
  执行主体 / 输入输出 / 规则依据 / 异常·HITL，并聚焦一个高价值 L4（P0）下钻为
  L5 深度任务序列，最终输出「端到端深度任务流程地图」HTML + 结构化 YAML。

  Triggers when user mentions:
  - "任务流程拆解"
  - "端到端深度任务流程地图"
  - "任务流程挖掘清单"
  - "从 L4 拆到 L5"
  - "L3 L4 L5 分层拆解"
  - "深度任务下钻"
  - "task flow breakdown"
  - "深度任务序列"
  - "任务粒度拆解"
author: KK
---

# Deep Task Flow Analyzer（任务流程拆解图生成器）

承接 `ai-canvas-generator` / `ai-product-journey-generator` / `blueprint-map-generator` 的场景定义，
以 **SKP 阶段1 · 任务流程挖掘** 专家视角：把业务按 **L3 业务阶段 → L4 活动分组 → L5 可执行动作**
三层纵切，登记每个 L5 的 **执行主体 / 输入输出 / 规则依据 / 异常·HITL**，
并**选一个承载最密集专家判断的高价值 L4（P0）下钻**为 L5 深度任务序列，输出「端到端深度任务流程地图」。

> 与相邻 Skill 的边界（同属 SKP 阶段1，视角不同）：
> - `to-be-process-designer`：**横切·角色协同**（泳道图：列=L3 阶段 × 行=角色泳道），回答「谁在何时做什么」。
> - 本 Skill：**纵切·任务粒度**（L3 阶段卡 → L4 分组 → 动作级 + 焦点 L4 下钻），回答「一件事拆成几个原子动作，每个动作的输入/依据/异常是什么」。
> - `agentic-workflow-designer`：**单能力内部执行**（PlantUML 活动/时序图），回答「某个 AI 能力内部怎么执行」。

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉设计）
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。
>
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 场景级产物**必须**输出到 `<公司/业务名>/<场景名>/` 场景子目录（两层规范，详见 `agent.md` 第 2 节）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[场景名]-任务流程拆解.html`
>   (例如：`X电商订舱-智能订舱Agent-任务流程拆解.html`)；YAML 文件同理，如 `[公司/业务名]-[场景名]-任务流程拆解.yaml`。
> - **禁止**将场景级产物输出到 `<公司/业务名>/` 根目录或 Skill 的 `examples/` 目录（examples/ 仅存放演示样例）。
>
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按照 `skills/design.md` 进行样式输出（Inspire 品牌标量 + 统一精简页眉）。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），
>   阶段链/深度任务序列超出屏幕时容器内 `overflow-x: auto` 可左右滚动。

---

## 核心方法：纵切拆解（L3 → L4 → 动作级）

把「模糊的一个任务」纵切为「一组**可独立描述、可观察、可单独挂规则**的深度任务」。这里的分层是**描述业务粗细的工具**，不是绝对标准——拆到什么粒度，以「这一步能清楚交代输入/输出/依据、且能单独挂规则」为准，不硬套某条固定判据。拆得太粗会挂不细，拆得太碎会让走查成本爆炸。

| 层级 | 含义 | 说明 |
|------|------|------|
| **L3** | 业务阶段 | 场景从触发到闭环的若干阶段，阶段间用箭头串成闭环 |
| **L4** | 活动分组 | 阶段内「一个角色可承接的成组工作」；焦点 L4（P0）仅 1 个 |
| **动作级（L5）** | 可执行动作 | 目标是「单一动作、明确 I/O、结果可观察、可独立挂规则」；具体粒度由业务现场决定 |

每个深度任务登记执行主体 `actor`：`agent`（纯后台算法）/ `human`（判断/责任/承诺）/ `mixed`（AI 产出+人工确认）。

---

## 核心数据结构

| 模块 | 内容 | 视觉特性 |
|------|------|---------|
| **meta** | 标题/副标题/版本/场景/方法论/输入依据/KPI | 页眉 + KPI |
| **overview** | L3/L4/L5 数量 + 焦点 L3/L4 | 深色统计条 |
| **legend** | 执行主体 / P0 焦点 / 分层约定 | 图例栏 |
| **stages[]** | L3 阶段 → L4 分组 → L5 动作 + actor 角标 | 横向阶段卡链（P0 高亮） |
| **readingFlow** | 全景→高价值 L4→下钻 L5 阅读指引 | 阅读指引条 |
| **focusDrill** | before(L4 太粗) → 走查证据 → after | before/after 三栏 |
| **focusSequence** | 焦点 L4 下钻的 L5 序列 + 各 sub-question | L5 序列卡 |
| **taskTable** | 每 L5：输入/输出/规则依据/异常·HITL + actor | 结构化表 |
| **ioChain** | 各 L5 输入输出串成闭环 + 下游衔接 | 闭环链 |
| **learning** | 为什么这样拆 + 挖掘的关键 | 两栏要点卡 |

---

## 工作流 SOP

### Step 1 · 解析输入
- **优先**：读取 To-be 旅程 YAML（`stages→actions` 的 `aiInteraction`/`userInputs`/`visibleData`/`designNotes`/`scenarios.goal`）。
- **兜底**：AI Canvas YAML（`userPains`/`aiInput`/`aiOutput`/`userGains`/`workflow`）/ 服务蓝图 / 自然语言描述。
- 提炼 `meta.kpi`（价值锚定），选定 `overview.focusL4`（承载最密集专家判断的 P0 L4）。

### Step 2 · 纵切推导 YAML（LLM 产物）
- 严格遵循 `references/task_breakdown_prompts.md` 的角色设定、纵切铁律与字段约束。
- **产物保存到 `<公司/业务名>/<场景名>/` 场景子目录**，
  命名 `[公司/业务名]-[场景名]-任务流程拆解.yaml`（`examples/` 仅存放演示样例）。

### Step 3 · 编译输出 HTML
```bash
python3 scripts/build_task_breakdown.py examples/<标识>.yaml examples/<标识>.html
```

### Step 4 · 最终交付
告知用户浏览器直接打开该 HTML：深色统计条（5 L3 · 11 L4 · 21 L5）→ 图例栏 →
端到端阶段链（L3→L4→L5 + P0 高亮）→ 阅读指引 → 焦点 before/after 下钻 →
L5 深度任务序列 → 结构化表（输入/输出/规则依据/异常·HITL）→ 输入输出闭环 → 挖掘要点。

---

## 目录结构

```
deep-task-flow-analyzer/
├── SKILL.md                            # 本指南
├── references/
│   ├── task_breakdown_prompts.md       # 核心 LLM Prompt 铁律（角色设定 + 纵切铁律 + 字段约束）
│   └── schema.yaml                     # 标准 YAML 数据契约（智能订舱 Agent 场景）
├── templates/
│   └── task_breakdown_layout.html      # Jinja2 HTML/CSS 模板（阶段链 + 下钻 + 结构化表）
├── scripts/
│   └── build_task_breakdown.py         # YAML → HTML 编译引擎（防呆清洗 + actor 样式化）
└── examples/                           # 示例产物 (.yaml & .html)
```

---

## 与上下游 Skill 的关系

| 关系 | Skill | 说明 |
|------|-------|------|
| 上游输入 | `ai-canvas-generator` / `ai-product-journey-generator` | 提供场景定义 / To-be 旅程作为纵切依据 |
| 上游输入 | `blueprint-map-generator` / `business-process-deep-analyzer` | 提供现状流程（L1–L4）与痛点 |
| 平行互补 | `to-be-process-designer` | 泳道图给「角色协同全景」；本 Skill 给「任务粒度下钻」，二者互补 |
| 同 Agent | `to-be-process-designer` / `business-rule-miner` / `agent-ontology-designer` / `agentic-workflow-designer` / `context-knowledge-data-analyzer` | 共同构成 `agent-arch-designer` Agent；本 Skill 与 `to-be-process-designer` 同属 SKP P1 流程骨架，本 Skill 产出的使用点输入 `business-rule-miner`（P2） |
| 下游衔接 | `agent-ontology-designer` / `agentic-workflow-designer` | 本产物的 L5 / 规则依据 / 执行主体，作为本体与编排设计的骨架 |
| 下游衔接 | `context-knowledge-data-analyzer`（CKD） | 深度任务的输入输出可作为 CKD 数据资产锚点 |
| 下游衔接 | `ai-test-dataset-generator` / `mvp-metrics-generator` | L5 输入输出可转译为测试用例 / 成效指标 |
