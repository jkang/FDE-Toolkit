# Agentic 架构词汇表（Pattern Library）

本文件定义 `agentic-workflow-designer` 使用的统一术语，保证 LLM 输出与编译渲染一致。
所有 YAML 中的枚举值必须取自本表，禁止自造变体。

---

## 1. 编排模式（`agenticDesign.pattern`）

| 枚举值 | 中文 | 适用场景 | 典型 PUML 结构 |
|--------|------|---------|----------------|
| `pipeline` | 线性管道 | 前一步输出是后一步输入的确定性链条，无分支 | 自上而下顺序箭头 |
| `orchestrator-worker` | 编排-工作池 | 主任务可拆为多个并行子任务，需聚合结果 | `group` 并行子任务 + 编排者调度 |
| `hierarchical` | 多层编排 | 任务粒度差异大，主管 Agent 再拆子 Agent | 嵌套 `group` + 多层参与者 |
| `react-loop` | ReAct 循环 | 需要推理-行动-观察迭代收敛（如检索多轮） | `loop` 循环 + `note` 标注 Thought/Action/Observation |
| `reflection` | 反思修正 | 生成内容需自评修正（如摘要、单据、回复） | `loop` 自评 → `alt` 通过/重写 |
| `event-driven` | 事件驱动 | 异步消息、订阅通知、状态变更触发 | `->>` 异步箭头 + `note` 事件标记 |
| `human-in-the-loop` | 人机协同 | 高风险决策/写操作必须人工确认 | `alt` 审批门禁 + `actor` 参与者 |
| `guardrails-gated` | 护栏门禁 | 每步产出必须过校验才放行 | `note over` 护栏 + `alt` 校验分支 |

> 一个能力可组合多种模式（如 `orchestrator-worker` + `human-in-the-loop`），
> `pattern` 字段填主模式，组合模式在 `whyPattern` 中说明。

---

## 2. 步骤行为徽标（PUML `note` 前缀）

| 徽标 | 含义 | PUML 表达 |
|------|------|-----------|
| `plan` | 任务规划/拆解 | `note right of <Agent>` 说明拆解逻辑 |
| `act` | 调用工具/执行动作 | 消息箭头（实线 `->`） |
| `observe` | 接收结果/观察 | 返回箭头（虚线 `-->`） |
| `reflect` | 自评/修正 | `loop` 内的 `note` 标注反思 |
| `validate` | 校验/门禁 | `alt` 校验分支 + `note over` 护栏 |
| `escalate` | 升级人工 | `note over` 升级触发条件 |
| `approve` | 人工审批 | `actor` 参与者的 `alt` 分支 + `group` 高亮 |
| `fallback` | 兜底降级 | `opt` 降级路径 |
| `retry` | 重试 | `loop` 带次数上限 |
| `loop` | 循环边界 | `loop N次 #色` |

---

## 3. 能力类型（`type`）

| 枚举值 | 中文 | 说明 |
|--------|------|------|
| `perception` | 感知/理解 | 解析、识别、抽取、多模态理解 |
| `reasoning` | 推理/决策 | 规划、匹配、计算、推断 |
| `generation` | 生成 | 文本/单据/代码等生成 |
| `decision` | 决策/推荐 | 打分、排序、审批建议、风险识别 |
| `automation` | 自动化执行 | 下发、同步、通知、状态流转 |

---

## 4. KPI 维度（`scenarioKpis` / `kpiImpact`）

| 维度 | 说明 | 示例 |
|------|------|------|
| 时效 | 处理时长/周期 | "2 天 → 2 小时" |
| 准确率 | 正确率/漏错率 | "字段漏填率 -90%" |
| 自动化率 | 免人工占比 | "人工操作 -70%" |
| 成本 | 单次处理成本 | "单单成本 ¥12 → ¥3" |
| 合规/风险 | 风险识别与规避 | "异常拦截率 100%" |
| 体验 | 满意度/等待感 | "NPS +15" |

> `kpiImpact` 必须量化（基线 → 目标），禁止抽象描述。

---

## 5. PlantUML 参与者四色规范

| 参与者类型 | PlantUML 关键字 | 底色 | 语义 |
|-----------|----------------|------|------|
| 人类 | `actor` | `#E8F5E9` 绿 | 用户/审批人/领域专家 |
| Agent | `participant` | `#DBEAFE` 蓝 | 编排者/专业 Agent |
| 工具/模型 | `participant` | `#F3E8FF` 紫 | 解析器/评分器/LLM 调用 |
| 系统/数据 | `participant` | `#F1F5F9` 灰 | ERP/知识库/API 服务 |

> 工具/Agent 均为 `participant`，用底色区分；命名建议 `participant "中文名" as ALIAS #色`。

---

## 6. 高亮色板（关键活动）

| 用途 | 色值 | 语义 |
|------|------|------|
| 关键路径（时延/自动化率 KPI 段） | `#DBEAFE` 蓝 | 主流程核心段 |
| 审批门禁 / HITL | `#FEF3C7` 黄 | 人工放行点 |
| 异常/风险分支 | `#FEF9C3` 浅黄 | 风险处理 |
| 正常通过分支 | `#ECFDF5` 浅绿 | 顺行路径 |
| 重试/兜底 | `#FFEDD5` 橙 | 失败恢复 |

> 一个序列图中高亮段建议 1~2 处，过多会失去重点；每处高亮必须在
> 能力的 `highlightLegend` 中说明 `kpiReason`（为什么这段是 KPI 关键）。
