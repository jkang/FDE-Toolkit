---
name: roadmap
description: 调用 roadmap-planner Subagent 规划产品演进路线图与里程碑计划
---

调用 `roadmap-planner` Subagent 完成战略规划：

1. 若用户对话中未提供业务目标或规划范围，先向用户收集必要信息。
2. 委派 `roadmap-planner` Subagent 执行：先生成产品演进路线图，再基于路线图生成里程碑计划。
3. 将 Subagent 返回的交付摘要与产物文件清单呈现给用户。
