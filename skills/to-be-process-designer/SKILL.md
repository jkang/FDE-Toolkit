---
name: to-be-process-designer
description: |
  用于呈现 AI 场景的 To-be 流程（泳道式）。输入「现状流程 + 问题痛点 + AI 机会点画布定义」，
  以流程挖掘专家视角将其重排为「列=业务阶段(L3) × 行=角色泳道」的深度任务(L5)序列图，
  并输出结构化 YAML + 交互式 HTML 泳道流程图（含执行主体 / HITL 焦点 / 价值锚定 / 异常链路）。

  Triggers when user mentions:
  - "生成 To-be 流程"
  - "To-be 流程泳道图"
  - "AI 场景 To-be 流程"
  - "任务流程挖掘清单"
  - "深度任务序列"
  - "AI 场景流程呈现"
  - "to-be flow"
  - "现状流程改造"
  - "将流程改编为泳道图"
author: KK
---

# To-be Process Designer (AI 场景 To-be 流程泳道图)

此技能用于在**现状流程 + 问题痛点 + AI 机会点画布定义**明确之后，将现状的
**人工 Excel 推式 / 串行流程**重排为**由 Agent 主驱动、人工只在关键确认点介入**的
AI 场景 To-be 流程，并以 **L5 深度任务**粒度落地（单一动词、明确 I/O、可观测），
最终以「泳道式流程图」直观呈现。

> 与 `ai-product-journey-generator`（To-be 旅程）的区别：
> - 视角为 **流程/任务挖掘（SKP 阶段1）**，而非用户旅程；
> - 以 **业务环节(L3) → 主要活动(L4) → 深度任务(L5)** 三层拆解；
> - 核心登记字段为 **执行主体 + HITL 焦点 + 规则依据类型 + 价值锚定 + 异常处理链路**，
>   供阶段2 规则反向绑定与子 Agent 扩展位设计。
> - 产物为**泳道式流程全景图**（列=阶段 × 行=角色），而非用户角色旅程带。

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉设计）
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。HTML 已集成「复制原始 YAML」功能，确保数据可溯源。
>
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/<场景名>/` 场景子目录（两层规范，详见 `agent.md` 第 2 节；
>   因为本产物属于**具体 AI 场景**的 To-be 流程，**必须**放场景子目录）。
> - **文件名**: 场景级文件名需含场景名，格式为 `[公司/业务名]-[场景名]-To-be流程.html`
>   (例如：`张雪机车海外销售-售后理赔-To-be流程.html`)；YAML 文件同理，如 `[公司/业务名]-[场景名]-To-be流程.yaml`。
> - **禁止**将场景级产物输出到 `<公司/业务名>/` 根目录或 Skill 的 `examples/` 目录（examples/ 仅存放演示样例）。
>
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按照 `skills/design.md` 进行样式输出（Inspire 品牌标量 + 统一精简页眉）。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），
>   泳道图超出屏幕时容器内 `overflow-x: auto` 可左右滚动。

---

## 核心架构

采用 **LLM -> YAML -> Python -> HTML** 的解耦架构：
1. **LLM**: 解析输入（现状流程 / 痛点 / AI 机会点画布），按参考 `references/to_be_flow_prompts.md`
   推导出「列=阶段 × 行=泳道 × 格=深度任务」的 YAML。
2. **Compiler**: `scripts/build_to_be_flow.py` 解析 YAML，结合 `templates/to_be_flow_layout.html`
   生成泳道式流程图。

## 核心数据结构（泳道式）

| 模块 | 内容 | 视觉特性 |
|------|------|---------|
| **meta** | 标题 / 版本 / 场景 / 业务阶段 / 方法论 / 输入依据 / KPI | 页眉 + 输入依据 |
| **legend** | 执行主体 / HITL 焦点 / 流程流向 / 价值锚定图例 | 顶部图例栏 |
| **phases** | 列 = L3 业务环节（P1..Pn） | 顶部列头 |
| **lanes** | 行 = 角色泳道（执行主体/部门） | 左侧泳道头 |
| **tasks** | 格 = L5 深度任务（定位 phase×lane 交叉格） | 泳道交叉格任务卡 |
| **flowNotes / returnNodes** | 流程说明 / 需求返回节点 | 底部注释面板 |

每个深度任务（task）的核心字段：

| 字段 | 含义 | 取值/示例 |
|------|------|-----------|
| `actor` | 执行主体 | `agent` / `human` / `hybrid` |
| `inputs` | 输入数据 | ["现货库存","在途库存"...] |
| `outputs` | 输出产物 | ["全国供需视图"] |
| `ruleType` | 规则依据类型 | 关键信息提取要点 / 术语字典类 / 决策模型类 / 模版范例类 / 关联关系类 |
| `valueAnchors` | 价值锚定（命中 meta.kpi） | ["分货效率","分仓有货率"] |
| `hitlFocus` | HITL 焦点 | `low` / `medium` / `high` / `gate` |
| `exception` | 异常处理链路 | "库存不足/时效超期 → 拉人" |
| `description` | 一句话说明 | "Agent 拉取全量库存，形成全国供需视图" |

---

## 工作流 SOP

### Step 1 · 解析输入（现状流程 / 痛点 / AI 机会点画布）
- **优先**：读取用户提供的现状流程(L3/L4)、问题痛点、AI 机会点画布定义（如 AI Canvas YAML）。
- **兜底**：用户以自然语言描述时，按「现状流程 → 痛点 → AI 机会点」三要素先自行推演。
- 提炼 `meta.kpi`（价值锚定）与 `meta.inputs`（上游 SRP 产物清单）。

### Step 2 · 推导 To-be 流程 YAML（LLM 产物）
- 严格遵循 `references/to_be_flow_prompts.md` 的角色设定、划列/划行/落任务铁律与字段约束。
- **产物保存到 `<公司/业务名>/<场景名>/` 场景子目录**，
  命名 `[公司/业务名]-[场景名]-To-be流程.yaml`（`examples/` 仅存放演示样例）。

### Step 3 · 编译输出 HTML
```bash
python3 scripts/build_to_be_flow.py examples/<标识>.yaml examples/<标识>.html
```

### Step 4 · 最终交付
告知用户浏览器直接打开该 HTML 即可查阅：图例栏、P1..Pn 列头、角色泳道、深度任务卡
（执行主体徽标 / HITL 焦点 / 价值锚定胶囊 / 输入输出 / 规则依据 / 异常链路）与底部注释。

---

## 目录结构

```
to-be-process-designer/
├── SKILL.md                        # 本指南
├── references/
│   ├── to_be_flow_prompts.md       # 核心 LLM Prompt 铁律、流程挖掘专家角色设定
│   └── schema.yaml                 # 标准 YAML 数据契约
├── templates/
│   └── to_be_flow_layout.html      # Jinja2 泳道式 HTML/CSS 引擎（含统一页眉 & 图例栏）
├── scripts/
│   └── build_to_be_flow.py         # YAML → HTML 编译引擎（含泳道网格构建 & 防呆清洗）
└── examples/                       # 示例产物 (.yaml & .html)
    └── yili_to_be_flow.yaml / .html
```

---

## Agent 归属

本 Skill 是 **`agent-arch-designer`（Agent 架构设计顾问）** Agent 的组合技能之一，
作为该 Agent 的 **Step ⓪ To-be 流程骨架**（L3→L4→L5 深度任务序列 + 执行主体/HITL/规则依据/价值锚定/异常链路），
为随后输出的「结构(本体) + 行为(Agentic 工作流) + 资源(CKD)」三视图提供流程骨架。
（Agent 定义见 `.opencode/agents/agent-arch-designer.md` 与 `.trae/agents/agent-arch-designer.md`。）

## 与上下游 Skill 的关系

| 关系 | Skill | 说明 |
|------|-------|------|
| 上游输入 | `ai-canvas-generator` / `ai-opportunity-map-generator` | 提供 AI 机会点画布定义与 AI 输入输出 |
| 上游输入 | `business-process-deep-analyzer` | 提供现状流程（L1/L2）与痛点拆解 |
| 同 Agent | `deep-task-flow-analyzer` / `business-rule-miner` / `agent-ontology-designer` / `agentic-workflow-designer` / `context-knowledge-data-analyzer` | 共同构成 `agent-arch-designer` Agent；本 Skill（泳道图）+ `deep-task-flow-analyzer`（任务拆解图）同属 SKP P1 流程骨架，`business-rule-miner` 为 P2 规则挖掘，其余输出「本体/时序/资源」三视图 |
| 下游衔接 | `agent-ontology-designer` / `agentic-workflow-designer` | 本产物的深度任务/规则依据/执行主体，作为 Agent 本体与编排设计的骨架 |
| 下游衔接 | `context-knowledge-data-analyzer`（CKD） | 深度任务的输入输出可作为 CKD 数据资产的锚点 |
| 平行补充 | `ai-product-journey-generator` | 本 Skill 是「流程/任务挖掘」视角；To-be 旅程是「用户旅程」视角，二者互补 |
