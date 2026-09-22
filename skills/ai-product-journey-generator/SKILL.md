---
name: ai-product-journey-generator
description: |
  承接《用户画像与典型旅程》，把其中**每一条 journey（画像 × 场景）**分别细化为一份
  **完整 To-be 旅程图**：阶段 → 行为步骤（用户行为 / 触点 / 想法 / 用户输入 / AI 交互 / 可见数据 / 设计意图）。
  因为不同 journey 的阶段与步骤各不相同，**一条 journey 出一份旅程**，不合并成一条主流程。
  输出 YAML + 交互式 HTML。

  Triggers when user mentions:
  - "生成 To-be 旅程"
  - "To-be User Journey"
  - "AI 产品旅程设计"
  - "to-be journey"
  - "逐条旅程细化"
author: KK
---

# AI Product Journey Generator (To-be 旅程设计 · 逐 journey 细化)

把《用户画像与典型旅程》里的**每一条 journey**，细化为一份**完整 To-be 旅程图**——
回答「这条路上，**每一步具体怎么发生、AI 在哪一步做什么**」。

> **与 `persona-journey-designer` 的分工（关键，别做重）**
> - `persona-journey-designer`：**一份**文档，全部画像 × 场景的**简要**旅程（5–7 步：阶段 → 动作 → 触点 → 期望），用于原型输入。
> - **本 Skill**：**逐 journey 细化**——每条 journey 单独出一份**完整旅程图**（阶段 → 行为步骤，含用户输入 / AI 交互 / 可见数据 / 设计意图）。
> - **为什么逐条出**：不同 journey 的**阶段与步骤不一样**，合并成一条主流程会让原型断裂、角色被吞。
> - 输入**必须是**《用户画像与典型旅程》的产出；**不要**再从 AI 画布另起一条主流程。

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉设计）
> **① 双重输出**：每条 journey 同时输出两个部分：
> 1. **结构化 YAML**：`<画像>-<场景>-To-be旅程.yaml`（契约见 `references/schema.yaml`）。
> 2. **交互式 HTML**：`<画像>-<场景>-To-be旅程.html`。
>
> **② 输出路径与命名**：
> - 目录：`<公司/业务名>/<场景名>/to-be-journeys/`。
> - 文件名：`<画像>-<场景名>-To-be旅程.yaml / .html`（如 `一线销售-走访采集情报-To-be旅程.html`）。
> - 总览：`<公司/业务名>/<场景名>/<公司名>-<场景名>-To-be旅程总览.html`（串联本场景全部 journey）。
> - **禁止**把真实产物写进本 Skill 的 `examples/`（examples/ 仅放脱敏演示样例）。
>
> **③ 视觉设计**：默认按本 skill `references/` 的视觉规范；浅色底、内容区撑满；泳道图横向可滚动。

---

## 一、输入契约

| 输入 | 来源 | 用途 |
|---|---|---|
| **用户画像与典型旅程**（主输入） | `persona-journey-designer` | 逐 journey 的画像 / 场景 / Job Story / 起点→终点 / 产品介入点 / 简要旅程（作为骨架） |
| AI 画布（可选） | `ai-canvas-generator` | 补 userPains / aiInput / businessGains |
| 任务处理规则挖掘清单（可选） | `business-rule-miner` | 决策因子 / 阈值 → AI 交互与可见数据 |
| Agent 本体设计（可选） | `agent-ontology-designer` | 状态迁移 / 行动边界 → HITL 与状态徽章 |

> **逐 journey 出产**：主输入里有 N 条 journey，就出 **N 份** To-be 旅程；**不得**合并成一条主流程。
> 缺失时降级：无规则 / 本体时，AI 交互与可见数据标注「待回填」，并写入总览的待确认项。

---

## 二、输出结构（每条 journey 一份）

| 段 | 内容 |
|---|---|
| **meta** | 来源 / 场景名 / 画像 |
| **journey** | Job Story / 起点→终点 / 产品介入点（承接 persona journey，保证端到端） |
| **1 用户画像** | 单一画像细化：背景 / 目标 / 痛点 / 数据特征（使用频率、典型数据、常见失误） |
| **2 旅程场景** | 本 journey 的场景与端到端边界 |
| **3 To-be 旅程泳道图** | 阶段 → 行为步骤：用户行为 / 触点 / 想法 / 用户输入 / AI 交互与推荐指令 / 可见数据 / 设计意图 |
| **4 原型衔接要点** | 页面清单 / 数据实体 / 推荐指令库 / 演示路径 |

字段规范见 `references/schema.yaml`；生成约束见 `references/to_be_prompts.md`。

---

## 三、工作流 SOP

### Step 1 · 读《用户画像与典型旅程》
- 取出**全部 journey**（画像 × 场景），逐条记录：Job Story、起点 → 终点、产品介入点、简要旅程（阶段 → 动作 → 触点 → 期望）。

### Step 2 · 逐 journey 细化
对**每一条 journey**：
- 把简要旅程的 5–7 步展开为「**阶段 → 行为步骤**」（阶段数、步数随该 journey 而定，不套用其他 journey）；
- 每步补全：用户输入（类型/名称/格式/示例/内容）、AI 交互与推荐指令、可见数据、设计意图；
- 决策因子 / 阈值取自规则清单（脱敏）；HITL 拦截与状态迁移取自本体。

### Step 3 · 输出 YAML
- 每条 journey 一份：`<公司>/<场景>/to-be-journeys/<画像>-<场景>-To-be旅程.yaml`。

### Step 4 · 编译 HTML
```bash
python3 scripts/build_to_be.py \
  "<公司>/<场景>/to-be-journeys/<画像>-<场景>-To-be旅程.yaml" \
  "<公司>/<场景>/to-be-journeys/<画像>-<场景>-To-be旅程.html"
```

### Step 5 · 生成总览
```bash
python3 scripts/build_journey_index.py \
  "<公司>/<场景>/to-be-journeys/" \
  "<公司>/<场景>/<公司>-<场景>-To-be旅程总览.html"
```

### Step 6 · 交付
- 打开总览页，逐 journey 查看完整旅程图；向主 Agent 返回产物清单与待确认项。

---

## 四、目录结构

```
ai-product-journey-generator/
├── SKILL.md
├── references/
│   ├── schema.yaml            # 单旅程数据契约（meta / journey / persona / scenario / stages）
│   └── to_be_prompts.md       # 生成约束铁律 + 逐 journey 字段规范
├── templates/
│   ├── to_be_layout.html      # 单旅程渲染（画像 / 场景 / 泳道图 / 原型衔接）
│   └── journey_index.html     # 总览页（串联全部 journey）
├── scripts/
│   ├── build_to_be.py         # 单旅程 YAML → HTML
│   └── build_journey_index.py # to-be-journeys/ → 总览 HTML
└── examples/
    └── 脱敏演示样例（.yaml / .html）
```

---

## 五、上下游关系

| 关系 | Skill | 说明 |
|------|-------|------|
| **上游输入（主）** | `persona-journey-designer` | 画像 × 场景 × 简要旅程 → 本 Skill 逐条细化 |
| 上游补充 | `ai-canvas-generator` / `business-rule-miner` / `agent-ontology-designer` | 痛点、决策因子、状态与 HITL |
| **下游衔接** | `prototype-generator` | 每条 journey 的页面清单 / 输入 / 可见数据 / 推荐指令 → 原型页面与交互 |
| 下游衔接 | `agentic-product-proposal-generator` | 旅程细化结果可回填方案的功能与 Agent 行为 |
| 平行区分 | `journey-map-generator` | 后者是 As-Is 体验旅程（含情感/痛点），本 Skill 是 To-be 完整旅程 |

---

## 六、QA 清单

- [ ] **逐 journey 出产**：journey 数 = 输出文件数，未合并成一条主流程
- [ ] 每条 journey 的 meta / journey / 画像 / 场景 / 泳道图 / 原型衔接齐全
- [ ] journey 的起点 → 终点与《用户画像与典型旅程》一致（端到端）
- [ ] 每个行为步骤含：用户行为 / 触点 / 想法 / 用户输入 / AI 交互 / 可见数据 / 设计意图
- [ ] 决策因子 / 阈值取自规则清单（脱敏）；HITL 与状态取自本体
- [ ] 阶段数与步数随该 journey 而定，未套用其他 journey
- [ ] YAML 可被 `build_to_be.py` 解析；HTML 渲染正常（泳道图横向可滚动）
- [ ] 总览页串联全部 journey，链接可达
- [ ] 浅色底、响应式 1280px+ 正常；无侧边装饰条
- [ ] 产物未写入本 Skill 的 `examples/`

---

## 七、输出呈现铁律（通用 · 强制）

> 产出是给**客户 / 业务方**看的最终报告，不是过程记录。以下六条**违反即返工**。

1. **语言**：一律用**严谨、克制的中文业务咨询语言**——有一说一；**有观点必给依据**（数据 / 规则 / 来源 / 口径）。禁止 AI 味大词与空话堆砌（「赋能、闭环、抓手、深度融合、全方位、数智化」等无实指表述）。
2. **禁止多余英文备注**：中文标题 / 小节后**不得**追加英文装饰（如「业务模式全景 BUSINESS MODEL LANDSCAPE」）。系统名 / 字段名 / 标准缩写（SAP、IF005、DOS、SKU、SLA）可保留；不造装饰性英文。
3. **只输出结论与依据**：**禁止**把过程讨论写进正文——与用户的对话 / 反馈、修订说明、`【不依据原始 idea】` 这类过程标注、跨行业类比的过程推理、「待确认 / 此处待补 / 讨论点」等制作层信息，一律不进正文。
4. **口径与边界**：不确定的推断标 `[推断]` 并给依据；不臆造数据；假设与阈值标注「领域专家假设值 · 待访谈回填」。
5. **交付前自检**：逐段问「读者能否据此做决策 / 这是否属于我们内部讨论」——不能决策或属内部讨论的内容，删除或移出正文。
6. **精炼优先**：**只保留必要段落**——删除一切辅助描述、方法论 / 流程 / 制作层说明、示例性长文与重复表述；模板用**最小占位符**，不得用示例内容充数。
