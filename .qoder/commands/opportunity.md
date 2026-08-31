---
name: opportunity
description: 调用 opportunity-advisor Subagent 挖掘 AI 机会（机会地图 / AI Canvas / CKD / 优先级矩阵）
---

调用 `opportunity-advisor` Subagent 完成 AI 机会挖掘与优先级评估：

1. 若用户对话中未提供业务流程描述或具体分析项，先向用户收集业务流程/痛点信息并确认范围（机会地图 / AI Canvas / CKD / 优先级矩阵）。
2. 委派 `opportunity-advisor` Subagent 按确认的范围执行，多技能联动时按 机会地图 → 画布 → CKD → 矩阵 顺序衔接。
3. 将 Subagent 返回的交付摘要与产物文件清单呈现给用户。
