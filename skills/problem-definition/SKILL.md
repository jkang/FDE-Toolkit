---
name: problem-definition
description: |
  承接「痛点挖掘 / 根因分析」结果，用 8 个结构化要素把一个业务痛点定义成
  「可取证、可量化、可归因」的业务问题：①一句话问题描述 ②业务角色和场景 ③遇到的问题
  ④问题根因 ⑤发生频度 ⑥影响范围 ⑦每次发生对业务的影响 ⑧累计对业务影响。
  同时输出结构化 YAML + 交互式 HTML（内嵌「复制 YAML」）。

  Triggers when user mentions:
  - "问题定义"
  - "8 要素问题定义"
  - "业务问题定义"
  - "problem definition"
  - "定义业务问题"
  - "把痛点转成业务问题"
author: KK
---

# Problem Definition (业务问题定义 · 8 要素)

此技能用于在完成「现状泳道图 + 痛点挖掘 + 根因分析」之后，把**一个聚焦痛点的根因**
用 **8 个结构化要素**定义成一个“可取证、可量化、可归因”的**业务问题（Problem Statement）**，
作为后续 AI 机会点挖掘与 To-be 设计（`ai-opportunity-map-generator` / `ai-canvas-generator` /
`deep-task-flow-analyzer`）的**问题定义层输入**。

> 定位与上下游：
> - **上游输入**：`business-process-deep-analyzer`（现状泳道图+痛点）、根因分析（5-Why）产出。
> - **本 Skill**：把一个痛点问题按 8 要素结构化定义（一人一句、有证据、有量化）。
> - **下游衔接**：`ai-opportunity-map-generator` / `ai-canvas-generator`（基于该问题挖机会/出画布）、
>   `business-rule-miner` / `deep-task-flow-analyzer`（问题定义 → 规则/任务）。

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉设计）
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**：用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**：用于最终用户的直观审查与演示。HTML 已集成「复制原始 YAML」。
>
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 业务级目录；若强耦合某场景，可放 `<公司/业务名>/<场景名>/`。
> - **文件名**: `[公司/业务名]-[价值段/环节]-问题定义.html`；YAML 同理
>   （例如：`OOCL大客户销售-询价报价与成本测算-问题定义.html`）。
> - **禁止**将产物输出到 Skill 的 `examples/` 目录（examples/ 仅存放演示样例）。
>
> **视觉设计规范 (Visual Design Standard)**:
> - 默认按本 skill `references/schema.yaml` + `templates/problem_definition_layout.html` 输出。
> - 浅色底 (Light Mode)；内容区撑满容器；8 个要素以编号卡片纵向排布，逐条可读。
> - 顶部为「标题 + 核心问题一句话 callout + 元信息 chips」；末尾附「痛点→根因→问题」小结区。

---

## 核心架构

采用 **LLM -> YAML -> Python -> HTML** 的解耦架构：
1. **LLM**: 解析输入（根因分析/痛点详情），按 `references/problem_definition_prompts.md`
   推导出 8 要素 YAML。
2. **Compiler**: `scripts/build_problem_definition.py` 解析 YAML，结合
   `templates/problem_definition_layout.html` 生成问题定义报告；自动缩略、格式化与防呆清洗。

---

## 8 要素结构（核心）

| # | 要素 | 定义 | 判定口径 |
|---|------|------|---------|
| ① | **一句话问题描述** | 用一句话把问题+核心缺陷+后果说清 | 主谓语明确、含“导致…恶化/根因” |
| ② | **业务角色和场景** | 参与者 + 何时/何地发生 | 角色清单 + 一个典型场景 |
| ③ | **遇到的问题** | 具体现象（可观察） | 每条现象可对应上游泳道卡 |
| ④ | **问题根因** | 为什么发生（承接 5-Why） | 归因到系统/规则/数据/治理，非个人 |
| ⑤ | **发生频度** | 多久发生/多大批量 | 有量级：频次×请求量×占比 |
| ⑥ | **影响范围** | 覆盖哪些角色/渠道/系统 | 角色链路 + 渠道 + 系统边界 |
| ⑦ | **每次发生对业务的影响** | 单次代价 | 有单位：时长/成本/概率 |
| ⑧ | **累计对业务影响** | N 次叠加后的全局代价 | 关联 KPI 承压与战略后果 |

---

## 工作流 SOP

### Step 1 · 解析输入（痛点 / 根因 / 现状泳道）
- **优先**：读取上游 `business-process-deep-analyzer` 现状泳道图 YAML、痛点明细表与 5-Why 根因分析。
- **兜底**：用户以自然语言描述“哪个环节 + 痛点 + 根因”时，自行拆为 8 要素。

### Step 2 · 推导问题定义 YAML（LLM 产物）
- 严格遵循 `references/problem_definition_prompts.md` 的 8 要素铁律与字段约束。
- **产物保存到 `<公司/业务名>/` 目录**，命名 `[公司/业务名]-[价值段/环节]-问题定义.yaml`。

### Step 3 · 编译输出 HTML
```bash
python3 scripts/build_problem_definition.py examples/<标识>.yaml examples/<标识>.html
```

### Step 4 · 最终交付
告知用户浏览器直接打开该 HTML 即可查阅：标题 → 一句话问题 callout → 元信息 chips →
①~⑧ 各要素卡 → 「痛点→根因→问题」小结区。顶部可「📋 复制 YAML」。

---

## 目录结构

```
problem-definition/
├── SKILL.md                              # 本指南
├── references/
│   ├── problem_definition_prompts.md     # 8 要素 LLM Prompt 铁律
│   └── schema.yaml                       # 标准 YAML 数据契约（含 X电商订舱·在线订舱 代表行）
├── templates/
│   └── problem_definition_layout.html    # Jinja2 问题定义引擎
├── scripts/
│   └── build_problem_definition.py       # YAML → HTML 编译引擎（防呆清洗）
└── examples/                             # 示例产物 (.yaml & .html)
    └── X电商订舱-在线订舱-问题定义.yaml / .html
```

---

## Agent 归属与上下游关系

| 关系 | Skill / 输入 | 说明 |
|------|--------------|------|
| **上游输入** | `business-process-deep-analyzer` | 现状泳道图 + 每环节痛点 |
| **上游输入** | 根因分析（5-Why） | 承接根因到 ④ 要素 |
| **下游衔接** | `ai-opportunity-map-generator` / `ai-canvas-generator` | 基于该问题挖 AI 机会 / 出画布 |
| **组合调用** | `client-insight-advisor` / `discovery-agent` | 理需求阶段“痛点→问题定义”产出步骤 |

---

## QA 清单

- [ ] YAML 能被 `yaml.safe_load` 解析（含防呆过滤）
- [ ] 8 个要素齐全（①~⑧），顺序正确
- [ ] ① 一句话描述能独立看懂「对象+缺陷+后果」
- [ ] ③ 遇到的问题每条可对回上游泳道卡
- [ ] ④ 根因归因到系统/规则/数据/治理，非归因个人态度
- [ ] ⑤⑦ 有量级（频次×请求量，时长/成本），非形容词
- [ ] ⑧ 关联到环节级 KPI 与战略后果
- [ ] HTML 顶部 callout、chips、①②..⑧ 卡片渲染正常
- [ ] HTML「复制 YAML」交互正常，复制的 YAML 可再次解析
- [ ] 浅色底、响应式 1280px+ 正常显示
