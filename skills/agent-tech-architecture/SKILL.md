---
name: agent-tech-architecture
description: |
  承接「场景定义 + 任务流程/规则 + 本体 + 产品方案 + mvp-spec」等上游产出，
  以 AI 技术架构专家视角输出一份「Agent 落地技术架构方案」：先盘点资产、再做路线二选一
  （Workflow vs Autonomous Planner）、最后落定落地面貌 / 选型 / 环境 / HITL 护栏 / 验收，
  并编译出一张可执行的「Agent 应用逻辑编排图」——1 编排 Agent + N 个 Skill（每个 Skill 内含
  纵向逻辑流程：并行 / 分支 / Loop / HITL / 终态）+ 共享本体与 MCP，每个节点标注模型类型、
  调用的 Skill / MCP、RAG / 知识库、确定性计算与 HITL 落点。

  Triggers when user mentions:
  - "落地技术架构"
  - "技术架构方案"
  - "Agent 编排图"
  - "Autonomous Planner"
  - "Agent 工作流 graph"
  - "skill 还是 subagent"
author: KK
---

# Agent 落地技术架构方案（Agent Tech Architecture Designer）

承接 FDE 上游全部产出，把「已具备设计」的 Agent 翻译成「**可落地的技术架构**」：
回答「系统由哪几块组成、谁依赖谁、用哪个模型、接不接外部系统、HITL 在哪拦、怎么跑起来并验收」，
并产出一张**一眼看懂的 Agent 应用逻辑编排图**。

> 与相邻 Skill 的边界：
> - `agent-ontology-designer`：**静态语义**（对象关系 / 行动边界 / 状态迁移）——本 Skill 消费它，不重复建模。
> - `agentic-workflow-designer`：**单个 AI 能力的动态时序**（PlantUML 活动序列图）——本 Skill 是**系统级组装视图**（Agent / Skill / 本体 / MCP / 运行时怎么拼成可运行系统）。
> - `agentic-product-proposal-generator`：**产品方案**（做什么、用户看到什么）——本 Skill 回答「怎么跑起来、边界怎么守」，不重复产品定位与 UI 设计。
> - `prototype-generator`：**MVP 原型**（可运行代码）——本 Skill 产出架构级设计物，是原型的上游依据。
> - 触发词「Agent 架构 / 三视图」归 `agent-arch-designer` 的既有六技能；本 Skill 专管「**落地技术架构 + 编排图**」，不与其抢触发。

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉设计）
> 1. **双重输出**：必须**同时**输出 ① 结构化 YAML（`<公司>-<场景>-落地技术架构.yaml`）② 交互式 HTML（同名 `.html`）。
> 2. **输出路径与命名**：场景级产物**必须**输出到 `<公司/业务名>/<场景名>/` 两层目录，命名 `[公司/业务名]-[场景名]-落地技术架构.yaml / .html`；**禁止**输出到公司根目录或 `examples/`。
> 3. **视觉设计**：默认**浅色模式**；按 `references/component_library.md` 的类型—配色对照；节点正文只写业务动作，类型由颜色 + 图例表达，补充信息用**小号灰字括号**（`(小模型)`、`(MCP · OMS)`、`(Loop ×2)`），避免塞长句。

---

## 核心方法：盘点 → 二选一 → 落地设计（三步 + 门禁）

| 步骤 | 做什么 | 产出 |
|---|---|---|
| **Step 1 · 盘点资产** | 盘点 Agent / Skill / MCP / KB / 本体对象集 / 数据源，逐项标 `✅ 可用 / ⚠️ 待确认 / 🔴 缺失` | 资产盘点表 + 缺口清单 |
| **Step 2 · 路线二选一** | 比较 **Workflow** 与 **Autonomous Planner** 的优缺点并给建议，**由用户拍板** | 路线结论 + 理由（未确认不得继续） |
| **Step 3 · 落地设计** | 落定五块：① 落地面貌 ② 技术选型决策 ③ 基础设施与环境 ④ HITL 与护栏落点 ⑤ 验收与迭代；并编译编排图 | 落地技术架构 YAML + HTML（含编排图） |

### 资产选择核心门禁（写死，不可绕过）
- **本体**：对象查询 / 关系遍历 / 规则校验 / 确定性动作
- **Skill**：稳定专项任务，有明确 I/O 与验收边界
- **MCP**：访问外部数据或执行外部系统动作
- **KB / RAG**：法规、SOP、历史案例等非结构化知识
- **Agent**：全局规划、调度、HITL、异常与降级

### 设计红线
未盘点资产不选型；未由用户二选一不进入详细设计；本体已覆盖的确定性能力不再交给 LLM 凭提示词推理；HITL 闸门必须在架构层有落点，不能只写在提示词里。

### Skill 还是 Sub-Agent？（每个能力都要判定一次）
默认判 **Skill**（步骤固定 / 共享上下文 / 无独立规划）。命中以下**任一**才升级为 **Sub-Agent**，并在 YAML 里置 `type: subagent`：
- 需要**自己的多步规划 / 工具选择循环**（非预定义分支）；
- 需要**独立上下文 / 记忆**；
- 需要**显著不同的模型 / 护栏 / 权限**（涉钱、涉合规、需沙箱隔离）；
- 需要**独立部署 / 独立评测 / 独立迭代**；
- **长时运行或异步**。

---

## 核心数据结构（YAML 契约）

字段以 `references/schema.yaml` 为准，编译脚本与模板只消费该契约。顶层结构：

| 区块 | 内容 |
|---|---|
| `meta` | 标题 / 场景 / 公司 / 路线（Workflow｜Autonomous Planner）/ 一句话架构 / 日期 |
| `agent` | 编排 Agent：名称 / 职责 / 主循环 / 记忆 |
| `routing[]` | 意图 → Skill 的调度映射 |
| `skills[]` | 每个 Skill：id / name / **type（skill｜subagent）** / trigger / pattern / whyNotSubagent / nodes[] / edges[] |
| `sharedBase` | `ontology`（读 R / 写 W 落点）+ `mcp`（调用点）+ `kb`（RAG / 知识库） |
| `exceptionPool` | 异常池说明 |
| `failureTable[]` | 失败 / 降级 / 兜底（触发 → 处理 → 类型） |
| `kpi[]` | KPI 锚定（指标 → 支撑链路） |
| `guardrails[]` | 护栏落点 |
| `notes[]` | 口径待确认等提示 |

**节点类型**（`nodes[].type`，决定形状与配色）：`op` 普通操作 · `det` 确定性/规则 · `small` 小模型/感知 · `llm` 大模型 · `rag` RAG/知识库 · `mcp` MCP/外部系统 · `onto` 本体 · `hitl` HITL 门禁 · `eval` Evaluator · `loop` Loop/重试 · `exception` 异常池 · `out` 终态输出。
**边**（`edges[]`）：`{ from, to, label, style: solid|dashed }`——实线=正常流转，虚线=回退 / Loop / 重试 / 升级。

---

## 工作流 SOP

### Step 1 · 解析输入
优先读取上游 YAML / Markdown（按可用性降级）：
- 必需：`产品方案`（.md）、`本体设计`（.yaml）、`业务规则挖掘`（.yaml）
- 强烈建议：`任务流程拆解`（.yaml）、`To-be流程`（.yaml）、`Agentic工作流`（.yaml）
- 建议：`CKD矩阵分析`（.yaml）、`mvp-spec`（.yaml）
- 可选：`AI测试数据集`、`成效指标`

缺流程 / 工作流时用产品方案的演示故事线推演；缺 mvp-spec 时只做架构不校准。最小集 = 产品方案 + 本体 + 规则。

### Step 2 · 生成 YAML
- 读取 `references/arch_prompts.md`（AI 技术架构专家角色 + 三步方法 + Skill/Sub-Agent 判定 + 门禁 + 输出铁律）。
- 按 `references/schema.yaml` 产出 YAML，保存到 `<公司/业务名>/<场景名>/`。

### Step 3 · 编译 HTML
```bash
python3 scripts/build_tech_architecture.py <input.yaml> <output.html>
```
- 输出 HTML 与 YAML 同目录、同命名（`.html` 后缀）。

### Step 4 · 交付
通知用户在浏览器中打开 HTML：顶部图例 → 编排 Agent → 按意图调度的 N 个 Skill（每个 Skill 一张纵向逻辑流程图）→ 共享底座（本体 / MCP / KB）→ 异常池 → 失败兜底表 / KPI / 护栏。

---

## 目录结构

```
agent-tech-architecture/
├── SKILL.md                          # 本文件
├── references/
│   ├── arch_prompts.md               # 核心 LLM Prompt（专家角色 + 三步方法 + 判定 + 铁律）
│   ├── schema.yaml                   # YAML 数据契约示例（与 build 脚本/模板字段一致）
│   └── component_library.md          # 组件类型—配色—形状 对照表 + 模型/资产分类
├── templates/
│   └── tech_arch_layout.html         # Jinja2 模板（编排图 + 报告）
├── scripts/
│   └── build_tech_architecture.py    # YAML → HTML 编译引擎（每个 Skill 生成 mermaid 纵向流程图）
└── examples/
    └── X电商订舱-智能订舱Agent-落地技术架构.yaml / .html   # X 演示样例
```

---

## 与上下游 Skill 的关系

| 关系 | Skill | 说明 |
|---|---|---|
| 上游输入 | `agentic-product-proposal-generator` | 产品方案：定位 / 形态 / 故事线 → 落地面貌 |
| 上游输入 | `agent-ontology-designer` | 本体：对象 / 关系 / 状态迁移 → 确定性底座 + 行动边界 |
| 上游输入 | `business-rule-miner` | 五类规则 → 规则引擎 / 知识库 / 模板落点 |
| 上游输入 | `deep-task-flow-analyzer` / `to-be-process-designer` | 流程 / 任务序列 → 编排步骤与 HITL 断点 |
| 上游输入 | `agentic-workflow-designer` | 能力 / 编排模式 → Agent 分解与调度 |
| 上游输入 | `context-knowledge-data-analyzer` | CKD → 数据源 / KB / 上下文清单 |
| 上游输入 | `prototype-generator` | mvp-spec → 组件口径校准 |
| 下游衔接 | `prototype-generator` / `mvp-evaluator` | 架构 → MVP 原型与评测口径 |

---

## 输出呈现铁律（通用 · 强制）

> 产出是给**客户 / 业务方**看的最终报告，不是过程记录。以下六条**违反即返工**。

1. **语言**：一律用**严谨、克制的中文业务咨询语言**——有一说一；**有观点必给依据**（数据 / 规则 / 来源 / 口径）。禁止 AI 味大词与空话堆砌（「赋能、闭环、抓手、深度融合、全方位、数智化」等无实指表述）。
2. **禁止多余英文备注**：中文标题 / 小节后**不得**追加英文装饰（如「业务模式全景 BUSINESS MODEL LANDSCAPE」）。系统名 / 字段名 / 标准缩写（SAP、IF005、DOS、SKU、SLA）可保留；不造装饰性英文。
3. **只输出结论与依据**：**禁止**把过程讨论写进正文——与用户的对话 / 反馈、修订说明、`【不依据原始 idea】` 这类过程标注、跨行业类比的过程推理（如「与快消品的渠道逻辑不同」）、「待确认 / 此处待补 / 讨论点」等制作层信息，一律不进正文。
4. **口径与边界**：不确定的推断标 `[推断]` 并给依据；不臆造数据；假设与阈值标注「领域专家假设值 · 待访谈回填」。
5. **交付前自检**：逐段问「读者能否据此做决策 / 这是否属于我们内部讨论」——不能决策或属内部讨论的内容，删除或移出正文。
6. **精炼优先**：**只保留必要段落**——删除一切辅助描述、方法论 / 流程 / 制作层说明、示例性长文与重复表述；模板用**最小占位符**，不得用示例内容充数。
