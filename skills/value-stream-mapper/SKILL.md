---
name: value-stream-mapper
description: |
  梳理某个业务端到端的 L1 级价值流，输出「价值链与价值段总览」（对齐 03-业务价值流图.jpg 风格），
  并据「原始 idea 需求」在全链路上标注「聚焦范围」（★ 高亮价值段 + 优先级 + 痛点 + 业务环节）。
  同时输出结构化 YAML + 交互式 HTML（内嵌「复制 YAML」）。

  Triggers when user mentions:
  - "价值流梳理"
  - "价值链总览"
  - "L1 价值流"
  - "价值段"
  - "聚焦范围"
  - "端到端价值流"
  - "value stream map"
  - "价值链与价值段总览"
author: KK
---

# Value Stream Mapper (L1 价值链与价值段总览)

此技能用于在拿到客户的**业务描述 + 原始 idea 需求**之后，先把业务的**端到端经营主线**
梳理成 L1 **价值链全景**（价值流 → 价值段），再**据原始 idea 圈定聚焦范围**——
它是「理需求」阶段价值流梳理的**全貌底稿**，为后续 L2/L3 流程拆解与 AI 机会点挖掘提供骨架。

> 与 `business-process-deep-analyzer`（价值段现状泳道图）的关系：
> - 本 Skill 视角为**价值链/价值段总览（L1）**，专注「沿客户生命周期切分经营主线 + 标聚焦」；
> - **单客户生命周期的服务型业务通常只有 1 条横向主价值流**（如电商订舱），价值沿价值段横向串联；
>   切勿把一个价值段（如「增值服务与会员运营」）误拆成独立价值流。
> - `business-process-deep-analyzer` 对**单个聚焦价值段/业务环节**做 **L3/L4 现状泳道图**下钻，并标注每环节痛点；
> - 两者上下游互补：先用本 Skill 看清**全链与聚焦段**，再把聚焦段交给 `business-process-deep-analyzer`
>   下钻 L3/L4 泳道，用 `deep-task-flow-analyzer` / `to-be-process-designer` 做 L3→L5。

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉设计）
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**：用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**：用于最终用户的直观审查与演示。HTML 已集成「复制原始 YAML」功能，确保数据可溯源。
>
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录（若属具体 AI 场景，才放 `<公司/业务名>/<场景名>/`）。
>   本产物是**业务级价值链全貌**，默认放公司/业务根目录。
> - **文件名**: `[公司/业务名]-价值链与价值段总览.html`；YAML 同理 `[公司/业务名]-价值链与价值段总览.yaml`
>   （例如：`X电商订舱-价值链与价值段总览.html`）。
> - **禁止**将产物输出到 Skill 的 `examples/` 目录（examples/ 仅存放演示样例）。
>
> **视觉设计规范 (Visual Design Standard)**:
> - 默认按本 skill `references/schema.yaml` + `templates/value_stream_layout.html` 输出，
>   **对齐 `03-业务价值流图.jpg` 的价值段总览风格**：章节标题 + 核心洞察 callout + 元信息 chips +
>   **横向价值流条带**（条头①序号+名称+链路小字）+ **价值段从左到右串联卡**（→ 连接）+
>   聚焦卡蓝框高亮（★徽章/痛点/优先级/业务环节）
>   + 底部图例。
> - **底色模式**：浅色底 (Light Mode)；内容区撑满容器宽度（width:100%），价值流列超出时 `overflow-x:auto` 可横滚。

---

## 核心架构

采用 **LLM -> YAML -> Python -> HTML** 的解耦架构：
1. **LLM**: 解析输入（业务描述 + 原始 idea 需求），按 `references/value_stream_prompts.md`
   推导出「价值流(列) → 价值段(卡) → 业务环节(links)」的 YAML。
2. **Compiler**: `scripts/build_value_stream.py` 解析 YAML，结合 `templates/value_stream_layout.html`
   生成价值链总览图；自动完成**聚焦范围连续编号**、**统计**、**防呆清洗**。

## 核心数据结构

| 模块 | 内容 | 视觉特性 |
|------|------|---------|
| **meta** | title / sectionNo / business / domain / **originalIdea** / insight / sourceRef / kpi | 页眉 + 核心洞察 callout + 元信息 chips |
| **painTypes** | 痛点四色：highTime / seniority / freqError / bottleneck | 卡内痛点圆点 + 图例 |
| **legend** | 焦点范围说明 / P0 说明 / 可点开提示 | 底部图例栏 |
| **valueStreams** | 横向一条 = 一条端到端主线；含 chain 副标题 + focusGroups | 横向条带头 + 价值段 → 连接 |
| **segments** | 卡 = 一个价值段；focus / priority / painPoints / links / detail | 列内竖排卡 + ↓ 连接 |
| **links** | 聚焦段内原始 idea 触及的**业务环节**（L2 锚点） | 聚焦卡内蓝色小胶囊 |

价值段（segment）核心字段：

| 字段 | 含义 | 取值/示例 |
|------|------|-----------|
| `name` | 价值段名 | `在线订舱` |
| `focus` | 是否聚焦 | `true` / `false` |
| `focusLabel` | 聚焦范围标签 | `聚焦范围 ①`（可省略，编译器自动连续编号） |
| `priority` | 优先级 | `P0` / `P1` / 空串 |
| `painPoints` | 痛点类型 | `["highTime","bottleneck"]` |
| `links` | 业务环节 | `["3 步订舱表单提交","订舱请求受理与校验"]` |
| `detail.definition` | 一句话定义 | `货主以新版 3 步订舱表单提交请求` |
| `detail.goal` | 业务目标 | `分钟级自助订舱` |
| `detail.reason` | 聚焦/不聚焦理由 | `聚焦理由：…` 或 `不聚焦理由：…` |

---

## 工作流 SOP

### Step 1 · 解析输入（业务描述 + 原始 idea 需求）
- **优先**：读取用户提供的业务现状素材（如 `X电商订舱-业务流程深度分析.yaml`）、场景信息采集表、AI 画布等。
- **兜底**：用户以自然语言描述时，先自行推演「业务属于什么行业/领域 → 原始 idea 想改变什么」。
- 提炼 `meta.originalIdea`（决定聚焦范围）与 `meta.kpi`（价值锚定）。

### Step 2 · 推导价值链 YAML（LLM 产物）
- 严格遵循 `references/value_stream_prompts.md` 的三层结构铁律、聚焦判定铁律与字段约束。
- **产物保存到 `<公司/业务名>/` 根目录**，命名 `[公司/业务名]-价值链与价值段总览.yaml`
  （`examples/` 仅存放演示样例）。

### Step 3 · 编译输出 HTML
```bash
python3 scripts/build_value_stream.py examples/<标识>.yaml examples/<标识>.html
```

### Step 4 · 最终交付
告知用户浏览器直接打开该 HTML 即可查阅：章节标题 → 核心洞察 → 元信息 chips →
价值流列（①序号+链路小字）→ 价值段卡（▶ 展开 定义/目标/理由）→ 聚焦范围（★徽章/痛点/优先级/业务环节）→ 底部图例。
顶部可「全部展开/收起」与「📋 复制 YAML」。

---

## 目录结构

```
value-stream-mapper/
├── SKILL.md                        # 本指南
├── references/
│   ├── value_stream_prompts.md     # 核心 LLM Prompt 铁律、分层与聚焦判定
│   └── schema.yaml                 # 标准 YAML 数据契约（含 X电商订舱 代表行）
├── templates/
│   └── value_stream_layout.html    # Jinja2 价值链总览引擎（对齐 03-业务价值流图.jpg）
├── scripts/
│   └── build_value_stream.py       # YAML → HTML 编译引擎（含聚焦连续编号 & 防呆清洗）
└── examples/                       # 示例产物 (.yaml & .html)
    └── X电商订舱-价值链与价值段总览.yaml / .html
```

---

## Agent 归属与上下游关系

| 关系 | Skill / 输入 | 说明 |
|------|--------------|------|
| **上游输入** | 业务素材 / 原始 idea 需求 / `ai-canvas-generator` | 提供业务描述、idea 需求与价值锚定 |
| **下游衔接** | `business-process-deep-analyzer` | 对**聚焦价值段**下钻 L3/L4 现状泳道图 + 每环节痛点 |
| **下游衔接** | `deep-task-flow-analyzer` / `to-be-process-designer` | 对**聚焦段**做 L3→L5 流程与 To-be 泳道图 |
| **下游衔接** | `ai-opportunity-map-generator` / `ai-canvas-generator` | 在聚焦段基础上挖 AI 机会点并出画布 |
| **下游衔接** | `business-process-deep-analyzer` | 对聚焦价值段下钻 L3/L4 现状泳道图 |

本 Skill 可被 `agent-arch-designer`（Agent 架构设计顾问）等 Agent 作为 **Step ⓪ 价值链骨架**
组合调用，为后续「结构(本体) + 行为(工作流) + 资源(CKD)」提供业务全貌与聚焦边界。

## QA 清单

- [ ] YAML 能被 `yaml.safe_load` 解析（含防呆过滤）
- [ ] 至少 1 条价值流，每条至少 2 个价值段
- [ ] 聚焦段在**同一条价值流内尽量连续**（对应「连续 1~4 个价值段」推荐）
- [ ] 聚焦段 focusLabel 自动连续编号 ① ② ③…，跨断档/跨价值流递增
- [ ] `links` 仅出现在聚焦段；非聚焦段为空
- [ ] 每个价值段有 definition / goal / reason（聚焦写聚焦理由，不聚焦写不聚焦理由）
- [ ] 痛点 id 均能在 `painTypes` 中找到（有默认回退色）
- [ ] 顶部分区 chips 统计正确（值流/价值段/聚焦/痛点）
- [ ] HTML 展开/收起与「复制 YAML」交互正常，复制的 YAML 可被再次解析
- [ ] 浅色底、响应式 1280px+ 正常显示，窄屏列自动纵向堆叠
