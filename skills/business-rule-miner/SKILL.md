---
name: business-rule-miner
description: |
  承接任务流程拆解产出（使用点/深度任务）＋ SRP 已识别规则类型＋线下调研素材，
  以 SKP 阶段2「任务处理规则挖掘」专家视角，把「每个任务依据什么处理」深挖为
  五类可消费的业务知识结构（决策模型 / 模版范例 / 术语字典 / 关键信息提取要点 / 关联关系），
  每条规则/样本均绑定到使用点、来源可追溯，并做 P1↔P2 双向可追踪交叉核对，
  输出《任务处理规则挖掘清单》HTML + 结构化 YAML。

  Triggers when user mentions:
  - "业务规则挖掘"
  - "任务处理规则"
  - "五类规则"
  - "决策模型类"
  - "模版范例类"
  - "术语字典"
  - "关键信息提取要点"
  - "关联关系类"
  - "规则深挖"
  - "rules mining"
  - "规则绑定"
author: KK
---

# Business Rule Miner（业务规则深度挖掘器）

承接 `deep-task-flow-analyzer`（P1）产出的**使用点/深度任务** ＋ SRP 已识别**规则类型** ＋ 线下调研素材，
以 **SKP 阶段2 · 任务处理规则挖掘** 专家视角：把「**每个任务依据什么处理**」深挖为
**五类可消费的业务知识结构**，每条规则/样本**绑定到使用点**、来源可追溯，并做 **P1↔P2 双向可追踪** 交叉核对。

> 与相邻 Skill 的边界（务必先分辨）：
> - `deep-task-flow-analyzer`：**上游**，产出「使用点/深度任务序列」。
> - `context-knowledge-data-analyzer`：**数据资产清单**视角（上下文/知识/数据），非业务规则视角。
> - `agent-ontology-designer`：**静态建模**（对象关系/行动边界/状态迁移），是**下游**（本 Skill 是其原料）。
> - `agentic-workflow-designer`：**执行编排**（某能力内部怎么编排），是**下游**。
> - 本 Skill：**业务规则知识**视角（专家怎么判断/怎么生成/用什么口径）。

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉设计）
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。
>
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 场景级产物**必须**输出到 `<公司/业务名>/<场景名>/` 场景子目录（两层规范，详见 `agent.md` 第 2 节）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[场景名]-业务规则挖掘.html`
>   (例如：`X电商订舱-智能订舱Agent-业务规则挖掘.html`)；YAML 文件同理，如 `[公司/业务名]-[场景名]-业务规则挖掘.yaml`。
> - **禁止**将场景级产物输出到 `<公司/业务名>/` 根目录或 Skill 的 `examples/` 目录（examples/ 仅存放演示样例）。
>
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按照 `skills/design.md` 进行样式输出（Inspire 品牌标量 + 统一精简页眉）。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮）。

---

## 核心方法：五类任务处理规则（不是五种标签）

课件教学结论：**五类规则不是五种标签，而是五套不同的业务知识结构**。

| 类型 | 回答 | 固定结构 |
|------|------|---------|
| ⚖️ **决策模型类** | 怎么算、怎么判、走哪条路径 | ①决策因子 → ②逻辑分支 → ③分支动作 → ④冲突仲裁 → 例外/HITL |
| 📝 **模版范例类** | 照什么结构和范例生成 | 固定骨架 + 动态字段来源 + 生成/合规规则 + 典型/反面样本 |
| 📖 **术语字典类** | 词、缩写、业务口径 | 标准名/别名 + 定义 + 引用范围 + 维护方 |
| 🔍 **关键信息提取要点** | 专家看资料重点看什么 | 目标字段 + 典型位置/变体/易错 + 验收门槛 |
| 🔗 **关联关系类** | 对象之间怎么关联 | 关系网络 + 建立/特殊规则 + 使用点 |

**共通铁律**：内容可验证、来源可追溯、并明确绑定到使用点。

---

## 核心数据结构

| 模块 | 内容 | 视觉特性 |
|------|------|---------|
| **meta** | 标题/版本/场景/方法论/输入依据/KPI | 页眉 |
| **overview** | 五类计数 + 总规则数 | 深色统计条 |
| **legend** | 五类规则类型图例 + 共通原则 + 冲突/缺口 | 图例栏 |
| **categories.decision[]** | 决策四步结构 | 决策四步卡（仲裁高亮） |
| **categories.template[]** | 骨架 + 动态字段 + 生成/合规 + 样本 | 模板骨架表 + 典型/反面样本胶囊 |
| **categories.dictionary[]** | 词条口径 | 词条网格卡 |
| **categories.extraction[]** | 字段提取 + 验收门槛 | 字段提取表 |
| **categories.relation[]** | 对象关系 + 规则 | 关系网络 + 规则盒 |
| **reconciliation[]** | P1↔P2 双向可追踪 | 交叉核对表 |

---

## 工作流 SOP

### Step 1 · 解析输入
- **优先**：读取 `deep-task-flow-analyzer` 输出（使用点 + I/O + 规则依据类型占位）。
- **兜底**：SRP 场景定义（`dataKnowledge`/`workflow` 识别的规则类型）/ 自然语言描述。
- 提炼 `meta.kpi`，确定每条规则的使用点绑定。

### Step 2 · 逐类深挖 YAML（LLM 产物）
- 严格遵循 `references/rule_mining_prompts.md` 的角色设定、五类固定结构、绑定/可追溯铁律。
- **产物保存到 `<公司/业务名>/<场景名>/` 场景子目录**，
  命名 `[公司/业务名]-[场景名]-业务规则挖掘.yaml`（`examples/` 仅存放演示样例）。

### Step 3 · 编译输出 HTML
```bash
python3 scripts/build_rule_miner.py examples/<标识>.yaml examples/<标识>.html
```

### Step 4 · 最终交付
告知用户浏览器直接打开该 HTML：深色统计条 → 五类规则类型图例 →
⚖️ 决策模型（四步卡）→ 📝 模版范例（骨架+样本）→ 📖 术语字典（词条）→
🔍 提取要点（字段+验收门槛）→ 🔗 关联关系（关系网络）→ 🔗 P1↔P2 双向可追踪 → 共通原则/缺口。

---

## 目录结构

```
business-rule-miner/
├── SKILL.md                            # 本指南
├── references/
│   ├── rule_mining_prompts.md          # 核心 LLM Prompt 铁律（五类固定结构 + 绑定/可追溯）
│   └── schema.yaml                     # 标准 YAML 数据契约（智能订舱 Agent 场景）
├── templates/
│   └── rule_mining_layout.html         # Jinja2 HTML/CSS 模板（五类规则 + 双向可追踪）
├── scripts/
│   └── build_rule_miner.py             # YAML → HTML 编译引擎（防呆清洗 + 自动统计）
└── examples/                           # 示例产物 (.yaml & .html)
```

---

## 与上下游 Skill 的关系

| 关系 | Skill | 说明 |
|------|-------|------|
| 上游输入 | `deep-task-flow-analyzer` | 提供使用点/深度任务 + 输入输出，作为规则绑定锚点 |
| 上游输入 | `ai-canvas-generator` | 提供场景定义与已识别规则类型 |
| 同 Agent | `to-be-process-designer` / `deep-task-flow-analyzer` / `agent-ontology-designer` / `agentic-workflow-designer` / `context-knowledge-data-analyzer` | 共同构成 `agent-arch-designer` Agent；本 Skill 为 SKP P2 规则挖掘，承接 P1 的使用点 |
| 下游衔接 | `agent-ontology-designer` | 本产物的对象/关系/规则，作为本体建模原料 |
| 下游衔接 | `agentic-workflow-designer` | 本产物的决策/模板/规则，作为执行编排依据 |
| 下游衔接 | `ai-test-dataset-generator` / `mvp-metrics-generator` | 本产物的验收门槛/规则，转译为测试用例/成效指标 |
| 平行区别 | `context-knowledge-data-analyzer` | 数据资产清单；本 Skill 是业务规则知识，二者互补 |
