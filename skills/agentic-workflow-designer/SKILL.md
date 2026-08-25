---
name: agentic-workflow-designer
description: |
  承接 To-be 旅程（ai-product-journey-generator 输出），以 Agentic 架构专家视角
  识别旅程中的各 AI 能力，并为每个能力设计「从输入到输出的完整 AI 处理活动序列图」——
  图内显式表达达成场景目标 KPI 所必需的 Agent 架构设计（Agent 分解 / 编排模式 /
  推理循环 / 工具·模型·知识依赖 / 护栏 / 人机协同 / 失败兜底），
  序列图用 PlantUML 创作并以 SVG 高亮渲染进 HTML。

  Triggers when user mentions:
  - "Agentic 工作流"
  - "Agent 编排设计"
  - "AI 能力序列图"
  - "活动序列图"
  - "agentic workflow"
  - "设计 AI Agent 流程"
  - "Agentic 架构"
author: KK
---

# Agentic Workflow Designer（Agentic 工作流设计器）

承接 `ai-product-journey-generator` 的 To-be 旅程输出，以 **Agentic 架构专家** 视角：
**识别旅程中的 AI 能力 → 每个能力构建一张 PlantUML 活动序列图（输入 → 输出完整 AI 处理流程）→
把达成场景目标 KPI 所必需的 Agent 架构设计显式画进图里**（含关键活动高亮）。

> 与相邻 Skill 的边界：
> - `ai-native-workflow-designer`：设计**整个业务流程**的自动化形态（流程级）；本 Skill 深入**单个 AI 能力内部**的执行编排（Agent 任务级）。
> - `agent-ontology-designer`：**静态语义**（对象关系/行动边界/状态迁移）；本 Skill 是**动态行为**（消息流/编排模式/KPI 链路）。
> - `context-knowledge-data-analyzer`：**数据资产清单**视角；本 Skill 是**执行行为**视角。

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉设计）
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示（PlantUML SVG 渲染）。
>
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 场景级产物**必须**输出到 `<公司/业务名>/<场景名>/` 场景子目录（两层规范）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[场景名]-Agentic工作流.html` (例如：`张雪机车海外销售-售后理赔-Agentic工作流.html`)。YAML 文件同理，如 `[公司/业务名]-[场景名]-Agentic工作流.yaml`。
> - **禁止**将场景级产物输出到 `<公司/业务名>/` 根目录或 Skill 的 `examples/` 目录（examples/ 仅存放演示样例）。
>
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按本 skill `references/` 内示例的视觉规范输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动

---

## 核心方法：能力识别（拆分 / 合并规则）

| 规则 | 判定 |
|------|------|
| **拆分** | **不同目的 + 不同输入输出** = 不同的 AI 能力 = 独立序列图（目的不同 / 输入不同 / 输出不同，任一即拆） |
| **合并** | 一段**完整输入 → 输出**流程内部的中间环节，即使中间有 **HITL 人工确认**，**仍为同一张图**（HITL 是门禁，不是拆分点） |
| **数量** | 典型 **2~3 个能力，不得超过 3 个** |
| **对齐** | 每个能力必须对齐到旅程的 `stages / actions`（`journeyRef`） |

---

## 核心数据结构

| 模块 | 内容 | 视觉特性 |
|------|------|---------|
| **meta** | 模式/来源/场景名/总体架构 | 头部 + 架构徽章 |
| **scenarioKpis** | 场景目标 KPI（基线→目标，支撑能力） | KPI 卡 |
| **designPrinciples** | 全局 Agentic 设计原则 | chips |
| **capabilities[].trigger / goal** | 触发输入 / 目标输出 + KPI 影响 | 能力头卡 |
| **capabilities[].agenticDesign** | Agent 分解/编排模式/why/kpiLink | 架构摘要卡 |
| **capabilities[].puml** | **PlantUML 活动序列图**（输入→输出） | 高亮 SVG 图 |
| **capabilities[].highlightLegend** | 高亮段 → KPI 原因 | 图例条 |
| **capabilities[].guardrails / failure** | 护栏 / 失败处理 | 表 |

---

## 工作流 SOP

### Step 1 · 解析输入
- **优先**：读取 To-be 旅程 YAML（如 `ai-product-journey-generator/examples/dreame_to_be_1_procurement.yaml`），
  提取 `stages→actions` 的 `aiInteraction`、`userInputs`、`visibleData`、`designNotes`、`scenarios.goal`。
- **兜底**：用户以自然语言描述（或提供 AI Canvas YAML）时，先自行推演旅程语义，再进入 Step 2。

### Step 2 · 识别 AI 能力
按「拆分/合并规则」将旅程切段，产出能力清单（2~3 个），每个能力定义：
目的 / 输入 / 输出 / 对齐的旅程 stage·action。

### Step 3 · 逐能力推演 YAML + PlantUML
- 严格遵循 `references/agentic_prompts.md` 铁律（Agentic 架构专家角色 + 能力识别规则 +
  **PlantUML 高亮铁律**：参与者四色 / 关键活动高亮 / 分支带色 / 护栏 note / 行为徽标 / autonumber+activate）。
- 枚举值取自 `references/pattern_library.md`（编排模式 / 能力类型 / 行为徽标 / 色板）。
- **产物保存到 `<公司/业务名>/<场景名>/` 场景子目录**，命名 `[公司/业务名]-[场景名]-Agentic工作流.yaml`。

### Step 4 · 编译输出 HTML
```bash
python3 scripts/build_agentic.py examples/<标识>.agentic.yaml examples/<标识>.agentic.html
```

### Step 5 · 最终交付
告知用户浏览器直接打开该 HTML：顶部 KPI 卡与架构徽章 → 能力 Tab → 每 Tab 内
PlantUML 高亮序列图（可缩放/复制源码/下载 PNG）→ 护栏与失败处理 → 底部 KPI 支撑矩阵。

---

## 目录结构

```
agentic-workflow-designer/
├── SKILL.md                        # 本指南
├── references/
│   ├── agentic_prompts.md          # 核心 LLM Prompt 铁律（专家角色 + 拆分规则 + 高亮铁律）
│   ├── pattern_library.md          # Agentic 词汇表（编排模式/行为徽标/能力类型/KPI/PUML 四色）
│   └── schema.yaml                 # 标准 YAML 数据契约示例（采购订单场景）
├── templates/
│   └── agentic_layout.html         # Jinja2 HTML/CSS 模板（Tab + PlantUML SVG 渲染容器）
├── scripts/
│   └── build_agentic.py            # YAML → HTML 编译引擎（防呆清洗 + PUML 提取校验）
└── examples/                       # 示例产物 (.yaml & .html)
```

---

## 与上下游 Skill 的关系

| 关系 | Skill | 说明 |
|------|-------|------|
| 上游输入 | `ai-product-journey-generator` | 读取 To-be 旅程 YAML 作为能力识别依据 |
| 上游可选 | `ai-canvas-generator` | 兜底输入；`userGains`/`aiInput` 辅助 KPI 与输入定义 |
| 下游衔接 | `prototype-generator` | 能力序列图可直接转译为首版 Mock AI 服务接口与编排骨架 |
| 下游衔接 | `drawio-arch-generator` | 能力与 Agent 清单可输入系统架构图 |
| 平行互补 | `agent-ontology-designer` | 静态本体 + 本 Skill 动态时序 = Agent 完整设计 |
| 平行互补 | `context-knowledge-data-analyzer` | CKD 资源清单 + 本 Skill 执行行为 |
