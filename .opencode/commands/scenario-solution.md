---
name: scenario-solution
description: 调用 ai-solution-designer Subagent 完成单个 AI 场景的端到端解决方案设计（机会点定义 → AI画布 → To-be流程 → CKD → 任务流程拆解 P1 → 业务规则挖掘 P2 → Agent 本体 → 产品概念设计（客户确认）→ 用户画像与旅程 → To-be 旅程（逐 journey）→ 产品方案 → MVP 原型 → UX 优化 → 落地技术架构 → MVP 成效指标 → 测试数据集 → 场景级统一报告）
---

调用 `ai-solution-designer` Subagent 完成单个 AI 场景的端到端解决方案设计：

1. 若用户对话中未提供上游产物（问题定义 / AI 机会地图 / 现状流程 / 痛点）或目标场景，先向用户确认（客户名称、业务领域、目标场景、可执行范围）。
2. 委派 `ai-solution-designer` Subagent 按确认范围执行，核心链路：
   - **① 定方案**：`opportunity-definition`（机会点定义 5 要素）→ `ai-canvas-generator`（10 维 AI 画布）；
   - **② 挖知识**：`to-be-process-designer`（To-be 流程泳道）→ `context-knowledge-data-analyzer`（CKD 矩阵）→ `deep-task-flow-analyzer`（任务流程拆解 P1，产出使用点）→ `business-rule-miner`（业务规则挖掘 P2，五类规则）；
   - **③ 建本体**：`agent-ontology-designer`（对象关系 / 行动边界 / 状态迁移）；
   - **④ 生智能**：`agentic-product-concept-designer`（产品概念设计 · 客户确认：愿景 / 阶段分工 / 一期范围 / 试点 / 路线图）→ `persona-journey-designer`（用户画像与典型旅程）→ `ai-product-journey-generator`（To-be 旅程 · 逐 journey 细化）→ `agentic-product-proposal-generator`（产品方案）→ `prototype-generator`（mvp-spec + MVP 原型，先问技术栈 HTML / React / Vue，含验证）→ `ux-optimizer`（UX 定制设计系统 + 无侵入注入）→ `agent-tech-architecture`（落地技术架构 + 编排图）→ `mvp-metrics-generator`（成效指标 + Go/No-Go）→ `ai-test-dataset-generator`（测试数据集）；
   - **⑤ 汇总**：`unified-report-dashboard`（场景级统一报告，含本场景总览与 MVP 原型启动指引）；
   - **门禁**：定方案后、建本体后各停一次；**产品概念设计产出后请客户确认一期范围与试点，再进详细方案**；执行 `agent-tech-architecture` 前须请用户就**路线二选一（Workflow vs Autonomous Planner）**拍板。
3. 统一报告构建 + `validate_dashboard.py` 校验通过后，**自动打开报告让用户直接查看**（macOS `open "<报告路径>"`），并将交付摘要（产物文件清单、启动方式、验证结果、待确认问题）呈现给用户。

边界：本命令只负责「从机会点定义到场景级统一报告」的端到端主链；前置桌研 / 价值流 / 问题定义，以及单点需求（仅画布/矩阵、仅 Agent 架构三视图、仅旅程/原型/UX、仅落地技术架构、仅指标）请转用 `/client-insight` `/opportunity` `/agent-arch` `/mvp-prototype` `/mvp-eval` 等对应命令。
