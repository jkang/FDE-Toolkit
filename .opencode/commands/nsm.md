---
name: nsm
description: 调用 nsm-analyst Subagent 执行企业北极星战略全链路分析（业务调研 → SWOT → 战略推导）
---

调用 `nsm-analyst` Subagent 完成企业北极星战略全链路分析：

1. 若用户对话中未提供企业名称/业务类型，先向用户收集必要参数。
2. 委派 `nsm-analyst` Subagent 执行 NSM 全链路分析：业务现状调研 → SWOT 分析 → 战略与北极星指标推导（含内部跨阶段质量审查）。
3. 将 Subagent 返回的交付摘要与产物文件清单呈现给用户。
