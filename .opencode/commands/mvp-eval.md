---
name: mvp-eval
description: 调用 mvp-evaluator Subagent 完成 MVP 评测（测试数据集 / 成效指标 / Go-No-Go 上线门禁）
---

调用 `mvp-evaluator` Subagent 完成 MVP 评测，为「能否上线」提供可量化依据：

1. 若用户对话中未提供 AI 功能详述或具体产物范围，先向用户确认（AI 测试数据集 / MVP 成效指标体系 / 上线门禁，可多项）。
2. 委派 `mvp-evaluator` Subagent 按确认的范围执行，存在上下游依赖时按 测试数据集 → 成效指标/门禁 顺序衔接。
3. 将 Subagent 返回的交付摘要与产物文件清单呈现给用户。
