---
name: opportunity-definition
description: |
  承接「业务问题定义（8 要素）」的根因，用 5 个结构化要素对一个 AI 机会点做结构化定义：
  ①机会点一句话描述 ②业务角色及场景 ③问题痛点 ④方案假设 ⑤价值收益，
  并追加「价值收益拆解」表（对齐对应问题定义的 8 要素：覆盖范围 / 发生频度 / 单次收益 / 累计影响）。
  同时输出结构化 YAML + 交互式 HTML（内嵌「复制 YAML」）。

  Triggers when user mentions:
  - "机会点定义"
  - "机会点结构化定义"
  - "opportunity definition"
  - "把 AI 机会定义一下"
author: KK
---

# Opportunity Definition (AI 机会点定义 · 5 要素)

此技能用于在「AI 机会场景地图」里筛出**聚焦的核心机会点**之后，承接上游 `problem-definition`
的问题①根因，用 **5 个结构化要素**把一个机会点定义成「结构化、可评审、可立项」的 AI 机会点，
并附**价值收益拆解**对齐问题定义的 8 要素（⑥ 影响范围 / ⑤ 发生频度 / ⑦ 单次影响 / ⑧ 累计影响），
供后续 `ai-canvas-generator` / `agent-product-proposal-generator` 展开。

> 定位与上下游：
> - **上游输入**：`ai-opportunity-map-generator`（AI 机会场景地图）、`problem-definition`（问题①根因）。
> - **本 Skill**：把一个机会点按 5 要素定义 + 价值收益拆解。
> - **下游衔接**：`ai-canvas-generator`（AI 场景画布）、`ai-scenario-matrix-generator`（优先级评估）、
>   `agent-product-proposal-generator`（Agent 产品方案）。

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉设计）
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**：用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**：用于最终用户的直观审查与演示。HTML 已集成「复制原始 YAML」。
>
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 属于**具体 AI 场景**的产物，**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录。
> - **文件名**: `[公司/业务名]-[场景名]-机会点定义.html`；YAML 同理
>   （例如：`OOCL大客户销售-询价报价与成本测算-机会点定义.html`）。
> - **禁止**将产物输出到 Skill 的 `examples/` 目录（examples/ 仅存放演示样例）。
>
> **视觉设计规范 (Visual Design Standard)**:
> - 默认按本 skill `references/schema.yaml` + `templates/opportunity_definition_layout.html` 输出。
> - 浅色底 (Light Mode)；内容区撑满容器；每个机会点一张卡：头部（机会点名 + 类型徽章 + 承接问题）+ 5 要素 + 价值收益拆解表。

---

## 核心架构

采用 **LLM -> YAML -> Python -> HTML** 的解耦架构：
1. **LLM**: 解析输入（机会点 + 上游问题根因），按 `references/opportunity_definition_prompts.md`
   推导出 5 要素 + 价值收益拆解 YAML。
2. **Compiler**: `scripts/build_opportunity_definition.py` 解析 YAML，结合
   `templates/opportunity_definition_layout.html` 生成机会点定义报告；自动做类型徽章、根因类型与防呆清洗。

---

## 5 要素 + 价值拆解结构（核心）

| # | 要素 | 定义 | 判定口径 |
|---|------|------|---------|
| ① | **机会点一句话描述** | 为谁构建什么 + 解决什么 + 达成什么 | 主语即目标角色，含"把…从…升级为…" |
| ② | **业务角色及场景** | 目标角色 + 典型触发场景 | 角色清单 + 一个"何时/何地"场景 |
| ③ | **问题痛点** | 承接上游问题的具体痛点 | 可对上问题定义③/根因④ |
| ④ | **方案假设** | 用什么能力/编排 + 保留哪道人工闸门/护栏 | 明确 AI/Agent + 确定性服务 + HITL 边界 |
| ⑤ | **价值收益** | 直接业务收益 | 有方向、可量化承诺 |

**价值收益拆解表**（对齐问题定义的 8 要素，四行）：

| 拆解维度 | 对应问题定义要素 | 量化口径 |
|---------|----------------|---------|
| 覆盖范围 | ⑥ 影响范围 | 哪些渠道 / 受益角色 / 系统链路 |
| 发生频度 | ⑤ 发生频度 | 频次 × 请求量 × 场景占比 |
| 单次收益 | ⑦ 每次发生对业务的影响 | 单次时长 / 成本 / 出错下降 |
| 累计影响 | ⑧ 累计对业务影响 | 对 KPI 与战略后果的收敛 |

---

## 工作流 SOP

### Step 1 · 解析输入（机会点 + 上游问题根因）
- **优先**：读取上游 `ai-opportunity-map-generator` 机会场景 YAML 与 `problem-definition` 的问题①/根因。
- **兜底**：用户以自然语言描述"哪个机会点 + 承接哪个问题"时，自行推演根因类型与能力匹配。

### Step 2 · 推导机会点定义 YAML（LLM 产物）
- 严格遵循 `references/opportunity_definition_prompts.md` 的 5 要素铁律与字段约束。
- **产物保存到 `<公司/业务名>/<场景名>/`**，命名 `[公司/业务名]-[场景名]-机会点定义.yaml`。

### Step 3 · 编译输出 HTML
```bash
python3 scripts/build_opportunity_definition.py examples/<标识>.yaml examples/<标识>.html
```

### Step 4 · 最终交付
告知用户浏览器直接打开该 HTML 即可查阅：每张机会点卡 = 头部（名称/类型/承接问题/根因类型/能力匹配）→
①~⑤ 要素 → 价值收益拆解表。顶部可「📋 复制 YAML」。

---

## 目录结构

```
opportunity-definition/
├── SKILL.md                                  # 本指南
├── references/
│   ├── opportunity_definition_prompts.md     # 5 要素 + 价值拆解 LLM Prompt 铁律
│   └── schema.yaml                           # 标准 YAML 数据契约（含 X电商订舱 代表行）
├── templates/
│   └── opportunity_definition_layout.html    # Jinja2 机会点定义引擎
├── scripts/
│   └── build_opportunity_definition.py       # YAML → HTML 编译引擎（防呆清洗）
└── examples/                                 # 示例产物 (.yaml & .html)
    └── X电商订舱-在线订舱-一键订舱-机会点定义.yaml / .html
```

---

## Agent 归属与上下游关系

| 关系 | Skill / 输入 | 说明 |
|------|--------------|------|
| **上游输入** | `ai-opportunity-map-generator` / `problem-definition` | 机会地图 + 问题①根因 |
| **下游衔接** | `ai-canvas-generator` / `ai-scenario-matrix-generator` | 机会点 → AI 画布 / 优先级评估 |
| **编排** | `opportunity-advisor` / `discovery-agent` | 理需求阶段"机会点定义"产出步骤 |

---

## QA 清单

- [ ] YAML 能被 `yaml.safe_load` 解析（含防呆过滤）
- [ ] 5 要素齐全（①~⑤），顺序正确
- [ ] ① 能独立看懂"为谁·做什么·达成什么"
- [ ] ④ 方案假设明确「确定性服务 + LLM + 人工闸门护栏」边界
- [ ] 价值收益拆解 4 行：覆盖范围/发生频度/单次收益/累计影响，且对齐问题定义要素
- [ ] HTML 机会点卡头部徽章（类型/根因/能力）、①~⑤、价值拆解表渲染正常
- [ ] HTML「复制 YAML」交互正常，复制的 YAML 可再次解析
- [ ] 浅色底、响应式 1280px+ 正常显示
