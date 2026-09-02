---
name: business-process-deep-analyzer
description: |
  针对「一个价值段 / 业务环节」，下钻为「L3/L4 现状泳道图」——列=L3 子环节 × 行=角色泳道 × 格=L4 任务/决策，
  并在每个业务环节下方标注现状痛点（高耗时 / 高认知负荷 / 高频错误 / 来回往复 / 系统瓶颈），
  泳道图下附「任务明细表」（编号 / 所属业务流程 / 任务·决策 / 角色 / 输入→输出 / 业务规则及固化度 / 痛点）。
  同时输出结构化 YAML + 交互式 HTML（内嵌「复制 YAML」，可导出 PDF）。

  Triggers when user mentions:
  - "现状泳道图"
  - "L3 L4 泳道图"
  - "现状流程图"
  - "任务流程挖掘"
  - "业务流程痛点"
  - "泳道图"
  - "swimlane"
  - "as-is flow"
author: KK
---

# Business Process Deep Analyzer (价值段 L3/L4 现状泳道图)

此技能用于在上游 `value-stream-mapper` 圈出**聚焦价值段**之后，把**某一个价值段 / 业务环节**
下钻成「**L3/L4 现状泳道图**」，并**逐一标注每个环节的现状痛点**（高耗时 / 高认知负荷 / 高频错误 /
来回往复 / 系统瓶颈），底部附一张**任务明细表**，为后续 To-be 改造与 AI 机会点提供**现状基线**。

> 定位（与上下游的关系）：
> - 上游 `value-stream-mapper`：L1 价值链 → 价值段 → 聚焦范围（本 skill 的输入对象）。
> - 本 Skill：**单个聚焦价值段** → L3/L4 现状泳道图 + 每环节痛点 + 任务明细表。
> - 下游 `to-be-process-designer` / `deep-task-flow-analyzer`：以本泳道的 L4 任务为骨架，重排为 AI 场景 To-be 流程 / L5 深度任务。

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉设计）
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**：用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**：用于最终用户的直观审查与演示。HTML 已集成「复制原始 YAML」与「导出 PDF / 打印」。
>
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 业务级目录；若产物强耦合某场景，可放 `<公司/业务名>/<场景名>/`。
>   本产物通常面向**单个价值段**，建议放 `<公司/业务名>/` 根目录或对应价值段子目录。
> - **文件名**: `[公司/业务名]-[价值段/环节]-现状流程图.html`（如 `X电商订舱-在线订舱-现状流程图.html`）；YAML 同理。
> - **禁止**将产物输出到 Skill 的 `examples/` 目录（examples/ 仅存放演示样例）。
>
> **视觉设计规范 (Visual Design Standard)**:
> - 样式对齐 `10-分仓补货_现状泳道图.html`：泳道网格（列=L3 子环节，行=角色，格=L4 任务卡）。
> - **新增**：每张 L4 任务卡下方标注该环节痛点（5 类彩色圆点+标签），无痛点则不标注。
> - **新增**：泳道图下方渲染「任务明细表」（编号 / 所属业务流程 / 任务·决策 / 角色 / 输入→输出 / 业务规则及固化度 / 痛点）。
> - 浅色底 (Light Mode)，统一精简页眉（左标题 + 右「导出 PDF / 复制 YAML」），内容区撑满容器，泳道图超出 `overflow-x:auto` 可横滚。

---

## 核心架构

采用 **LLM -> YAML -> Python -> HTML** 的解耦架构：
1. **LLM**: 解析输入（目标价值段 + 现状说明），按 `references/process_prompts.md`
   推导出「列=L3 子环节 × 行=角色泳道 × 格=L4 任务」且带痛点的 YAML。
2. **Compiler**: `scripts/build_process.py` 解析 YAML，结合 `templates/process_layout.html`
   生成泳道图 + 每环节痛点 + 任务明细表；自动完成**泳道网格定位**、**痛点统计**、**防呆清洗**。

## 核心数据结构

| 模块 | 内容 | 视觉特性 |
|------|------|---------|
| **meta** | title / sectionNo / business / domain / **valueSegment** / currentStateNote / upstream / kpi | 页眉 + 价值段 chip + 现状总述 callout |
| **painTypes** | 5 类痛点：highTime / cognitive / freqError / backForth / bottleneck | 图例 + 卡下圆点 + 表格痛点列 |
| **legend** | 流程走向 / 规则固化度 / 痛点说明 | 图例栏 |
| **stages** | 列 = L3 子环节（STG1..），含 desc | 泳道列头（带序号） |
| **lanes** | 行 = 角色泳道（L1..），含 desc | 泳道行头（竖排） |
| **steps** | 格 = L4 任务/决策，定位 stageId×laneId，含 pains / businessRule / ruleSolidity / inputs / outputs | 泳道卡 + 任务明细表行 |

L4 任务（step）核心字段：

| 字段 | 含义 | 取值/示例 |
|------|------|-----------|
| `name` | 任务/决策名 | `人工审核兜底` |
| `stageId` / `laneId` | 定位到哪列哪行 | `STG2` / `L2` |
| `pains` | 该环节现状痛点 | `["highTime","cognitive"]` |
| `duration` | 耗时 | `约 1-2 小时/单 [推断]` |
| `source` | 来源/系统 | `订舱管理系统 / CRM` |
| `businessRule` | 业务规则/口径 | `SLA 条款外/异常单人工审核` |
| `ruleSolidity` | 固化度 | `Excel / 人工` / `系统` / `AI` |
| `inputs` / `outputs` | 输入 → 输出 | `["异常/条款外订舱请求"]` |

---

## 工作流 SOP

### Step 1 · 解析输入（目标价值段 + 现状说明）
- **优先**：读取上游 `value-stream-mapper` 圈定的聚焦价值段（`meta.valueSegment`）与业务素材（如 `X电商订舱-业务流程深度分析.yaml`）。
- **兜底**：用户以自然语言描述「哪个价值段 + 现状怎么走 + 有哪些痛点」时，自行拆为 L3 子环节 / 角色泳道 / L4 任务。
- 提炼 `meta.currentStateNote`（现状总述）与 `meta.kpi`（该环节服务的指标）。

### Step 2 · 推导现状泳道图 YAML（LLM 产物）
- 严格遵循 `references/process_prompts.md` 的泳道结构铁律、痛点标注铁律与字段约束。
- **产物保存到 `<公司/业务名>/` 目录**，命名 `[公司/业务名]-[价值段/环节]-现状流程图.yaml`。

### Step 3 · 编译输出 HTML
```bash
python3 scripts/build_process.py examples/<标识>.yaml examples/<标识>.html
```

### Step 4 · 最终交付
告知用户浏览器直接打开该 HTML 即可查阅：页眉 → 价值段/上游/KPI 信息条 → 现状总述 → 痛点图例 →
L3×L4 泳道网格（每张任务卡下方标注该环节痛点）→ 任务明细表。顶部可「导出 PDF / 打印」与「📋 复制 YAML」。

---

## 目录结构

```
business-process-deep-analyzer/
├── SKILL.md                        # 本指南
├── references/
│   ├── process_prompts.md          # 核心 LLM Prompt 铁律（L3/L4 泳道 + 痛点五色 + 固化度）
│   └── schema.yaml                 # 标准 YAML 数据契约（含 X电商订舱·在线订舱 代表行）
├── templates/
│   └── process_layout.html         # Jinja2 泳道图引擎（泳道图 + 痛点标注 + 任务明细表）
├── scripts/
│   └── build_process.py            # YAML → HTML 编译引擎（泳道网格定位 & 防呆清洗）
└── examples/                       # 示例产物 (.yaml & .html)
    └── X电商订舱-在线订舱-现状流程图.yaml / .html
```

---

## Agent 归属与上下游关系

| 关系 | Skill / 输入 | 说明 |
|------|--------------|------|
| **上游输入** | `value-stream-mapper` | 圈定聚焦价值段 → 本 skill 下钻 L3/L4 |
| **同方法论** | `deep-task-flow-analyzer` | 本 Skill 给现状泳道；该 Skill 做 L3→L4→L5 深度任务拆解（互补） |
| **下游衔接** | `to-be-process-designer` | 以本泳道 L4 任务为骨架，重排为 AI 场景 To-be 流程（泳道式 L5 序列图） |
| **下游衔接** | `ai-opportunity-map-generator` / `ai-canvas-generator` | 基于本泳道痛点挖 AI 机会点并出画布 |
| **组合调用** | `client-insight-advisor` / `discovery-agent` | 作为理需求/探索流程中的「现状泳道 + 痛点」产出步骤 |

本 Skill 可被 `client-insight-advisor`（客户洞察顾问）等 Agent 作为 **现状(As-Is)泳道图 + 痛点基线**
组合调用，为后续 To-be 改造与 AI 机会点提供「现状哪里疼、疼在哪一环」。

## QA 清单

- [ ] YAML 能被 `yaml.safe_load` 解析（含防呆过滤）
- [ ] 至少 2 个 L3 子环节、至少 2 个角色泳道、至少 4 个 L4 任务
- [ ] 每个 step 的 `stageId`/`laneId` 都能在 `stages[]`/`lanes[]` 中命中
- [ ] 每个环节的痛点都落在 `painTypes` 5 类之内（有默认回退色）
- [ ] 卡下方仅对有痛点的环节显示痛点标注，无痛点不显示
- [ ] 任务明细表含 7 列：编号 / 所属业务流程 / 任务·决策 / 角色 / 输入→输出 / 业务规则及固化度 / 痛点
- [ ] 泳道图每个交叉格定位正确（任务出现在对应 stage×lane）
- [ ] 顶部痛点统计正确（5 类分项 + 总计）
- [ ] HTML 展开/「复制 YAML」交互正常，复制的 YAML 可再次解析
- [ ] 浅色底、响应式 1280px+ 正常显示，泳道图 & 表格超出可横滚
