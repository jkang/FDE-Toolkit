---
name: requirement
description: 调用 requirement-analyst Subagent 拆解需求（故事地图 / MVP 迭代计划）
---

调用 `requirement-analyst` Subagent 完成需求拆解：

1. 若用户对话中未提供需求描述或具体产物范围，先向用户确认（故事地图 / MVP 迭代计划，可多项）。
2. 委派 `requirement-analyst` Subagent 按确认的范围执行，存在上下游依赖时按 故事地图 → MVP 计划 顺序衔接。
3. 将 Subagent 返回的交付摘要与产物文件清单呈现给用户。
