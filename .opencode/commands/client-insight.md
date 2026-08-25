---
name: client-insight
description: 调用 client-insight-advisor Subagent 执行客户洞察（AI 成熟度 / OSM / 流程分析 / 旅程图 / 服务蓝图）
---

调用 `client-insight-advisor` Subagent 完成客户洞察与业务梳理：

1. 若用户对话中未提供企业名称/业务类型及具体分析项，先向用户确认范围（AI 成熟度 / OSM / 流程深度分析 / 旅程图 / 服务蓝图，可多项）。
2. 委派 `client-insight-advisor` Subagent 按确认的范围执行，存在上下游依赖时按 流程分析 → 旅程图 → 服务蓝图 顺序衔接。
3. 将 Subagent 返回的交付摘要与产物文件清单呈现给用户。
