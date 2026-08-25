---
name: agent-arch
description: 调用 agent-arch-designer Subagent 完成 Agent 系统设计（SKP P1 任务流程挖掘[泳道图/拆解图] → P2 规则挖掘 → 「结构+行为+资源」三视图：本体 / Agentic 工作流序列图 / CKD 映射）
---

调用 `agent-arch-designer` Subagent 完成场景级 Agent 架构设计：

1. 若用户对话中未提供 AI Canvas / To-be 旅程 / 服务蓝图产物或具体范围，先向用户确认（流程骨架+规则挖掘+完整三视图 / 指定单项）。
2. 委派 `agent-arch-designer` Subagent 按确认的范围执行，核心链路：
   - **流程骨架 + 规则挖掘 + 完整三视图**：AI 场景定义 → ⓪ 任务流程挖掘（SKP P1：`to-be-process-designer` 泳道图[角色协同] 或 `deep-task-flow-analyzer` 任务拆解图[任务粒度，产出使用点]）→ ④ 业务规则挖掘（SKP P2：`business-rule-miner`，以使用点深挖五类规则 + P1↔P2 双向可追踪）→ ① Agent 本体设计（`agent-ontology-designer`，对象/行动边界/状态迁移）→ ② Agentic 工作流设计（`agentic-workflow-designer`，识别 AI 能力 + PlantUML 活动序列图）→ ③ CKD 映射（`context-knowledge-data-analyzer`，上下文/知识/数据矩阵）；
   - **单步执行**：仅任务流程拆解，或仅规则挖掘，或仅 To-be 流程，或仅 Agent 本体，或仅 Agentic 工作流，或仅 CKD 映射。
3. 将 Subagent 返回的交付摘要（产物文件清单、编译/渲染验证结果）呈现给用户。
