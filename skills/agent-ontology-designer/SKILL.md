---
name: agent-ontology-designer
description: |
  接收 AI 场景定义（AI Canvas）、To-Be Journey、服务蓝图或自然语言描述，
  生成 Agent 执行所需的三层本体模型（对象关系 → 行动边界 → 状态迁移），
  并输出可视化 HTML 报告和可直接注入 System Prompt 的业务语义结构。

  Triggers when user mentions:
  - "本体设计"
  - "agent 本体"
  - "ontology design"
  - "状态迁移建模"
  - "行动边界"
  - "agent 业务语义"
author: KK
---

# Agent 本体设计器（Agent Ontology Designer）

基于「对象关系 → 行动边界 → 状态迁移」三层方法论，为 Agent 构建可执行的业务语义结构。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**:
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的 Agent 注入和数据存档。
> 2. **交互式 HTML**: 用于 PM / 架构师 Review 和客户演示。
>
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范）。
> - **文件名**: 场景级产物命名 `[公司/业务名]-[场景名]-[业务类型].html`（如 `ZX机车海外销售-售后理赔-本体设计.html`）；公司级产物命名 `[公司/业务名]-本体设计.html`。
>
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 按本 skill `references/` 内示例的视觉规范输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动

---

## 三层建模方法论

| 层 | 核心问题 | 建模内容 |
|---|---------|---------|
| **Layer 1 · 对象关系** | 这是什么 | 实体（Entity）、属性（Attribute）、关系（Relationship）、概念边界 |
| **Layer 2 · 行动边界** | 现在能不能做 | 情境（Situation）、所需证据、合法动作、禁止动作、异常触发 |
| **Layer 3 · 状态迁移** | 做完以后去哪 | 执行流（Workstream）、状态（State）、迁移条件、护栏（Guardrail）、跨流依赖 |

---

## 工作流 SOP

### Step 1 · 解析输入
读取用户提供的一个或多个输入源：
- AI 场景定义（AI Canvas YAML）
- To-Be Journey 描述
- 服务蓝图（Blueprint YAML）
- 自然语言场景描述

识别：核心业务对象、典型决策情境（3-6 个）、主要执行流（1-4 条）

### Step 2 · 生成 YAML 本体
- 读取 `references/ontology_prompts.md`（角色设定 + 三层建模规范 + 输出铁律）
- 将生成的 YAML 保存至 `<公司/业务名>/<场景名>/`（场景级）或 `<公司/业务名>/`（公司级）
- YAML 命名遵循两层规范（如 `[公司]-[场景]-本体设计.yaml`）

### Step 3 · 编译 HTML 可视化
```bash
python3 scripts/build_ontology.py <input.yaml> <output.html>
```
- 输出 HTML 与 YAML 同目录、同命名（`.html` 后缀），符合双重输出规范。

### Step 4 · 交付
通知用户在浏览器中打开 HTML 文件，包含四 Tab 可视化：
- **Tab 1 · 对象关系**：实体卡片 + 关系图 + 概念边界警告
- **Tab 2 · 行动边界**：情境卡片（证据 / 合法 / 禁止 / 异常）
- **Tab 3 · 状态迁移**：执行流状态流转图 + 护栏 + 跨流依赖
- **Tab 4 · Agent Prompt**：可复制的 System Prompt 注入片段 + 原始 YAML

---

## 目录结构

```
agent-ontology-designer/
├── SKILL.md                          # 本文件
├── references/
│   ├── ontology_prompts.md           # 核心 LLM Prompt（三层建模指令）
│   └── schema.yaml                   # 完整 YAML Schema 示例（门店备货场景）
├── templates/
│   └── ontology_layout.html          # Jinja2 模板（四 Tab 可视化）
├── scripts/
│   └── build_ontology.py             # 编译引擎（YAML → HTML）
└── examples/                         # Skill 自带示例（非用户产物目录）
```

---

## build_ontology.py 核心能力

| 能力 | 实现方式 |
|-----|---------|
| 防呆 YAML 解析 | 正则剥除 ` ```yaml ``` ` 代码块标记 |
| 实体类型着色 | `core`=深蓝 / `reference`=紫色 / `event`=橙色 |
| 状态迁移可视化 | 内联 SVG 箭头 + CSS 状态节点 |
| 行动边界卡 | 四象限布局（证据/合法/禁止/异常） |
| Agent Prompt 片段 | 自动从 YAML 生成可注入的 Prompt 文本 |
| 模板引擎分离 | Jinja2 + `templates/ontology_layout.html` |

## QA 清单

- [ ] YAML 能被 `yaml.safe_load` 解析（含防呆过滤）
- [ ] 四个 Tab 均正常渲染
- [ ] 实体卡片按 type 正确着色
- [ ] 状态迁移箭头方向正确，异常分支有区分（normal/exception/recovery 三线型）
- [ ] Agent Prompt 片段完整可复制，且使用状态名/实体名而非原始 id
- [ ] 实体名 / 状态名含 `"` 或 `|` 时，关系图与状态图仍正常渲染（mermaid 转义生效）

---

## 输出呈现铁律（通用 · 强制）

> 产出是给**客户 / 业务方**看的最终报告，不是过程记录。以下六条**违反即返工**。

1. **语言**：一律用**严谨、克制的中文业务咨询语言**——有一说一；**有观点必给依据**（数据 / 规则 / 来源 / 口径）。禁止 AI 味大词与空话堆砌（「赋能、闭环、抓手、深度融合、全方位、数智化」等无实指表述）。
2. **禁止多余英文备注**：中文标题 / 小节后**不得**追加英文装饰（如「业务模式全景 BUSINESS MODEL LANDSCAPE」）。系统名 / 字段名 / 标准缩写（SAP、IF005、DOS、SKU、SLA）可保留；不造装饰性英文。
3. **只输出结论与依据**：**禁止**把过程讨论写进正文——与用户的对话 / 反馈、修订说明、`【不依据原始 idea】` 这类过程标注、跨行业类比的过程推理（如「与快消品的渠道逻辑不同」）、「待确认 / 此处待补 / 讨论点」等制作层信息，一律不进正文。
4. **口径与边界**：不确定的推断标 `[推断]` 并给依据；不臆造数据；假设与阈值标注「领域专家假设值 · 待访谈回填」。
5. **交付前自检**：逐段问「读者能否据此做决策 / 这是否属于我们内部讨论」——不能决策或属内部讨论的内容，删除或移出正文。
6. **精炼优先**：**只保留必要段落**——删除一切辅助描述、方法论 / 流程 / 制作层说明、示例性长文与重复表述；模板用**最小占位符**，不得用示例内容充数。
