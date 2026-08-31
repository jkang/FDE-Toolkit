---
name: mvp-prototype
description: 调用 mvp-prototype Subagent 完成「上游聚合 → Agent 产品方案 → To-be 旅程 → MVP 原型 → UX 定制优化」全链路（产品方案 / 旅程设计 / MVP 原型 / 启动验证 / UX 优化）
---

调用 `mvp-prototype` Subagent 完成场景级方案设计与 MVP 原型落地：

1. 若用户对话中未提供上游产物（理需求/场景定义/挖知识/本体的既有产出）或具体范围，先向用户确认（生成 Agent 产品方案 / To-be 旅程设计 / MVP 原型生成 / 全链路）。
2. 委派 `mvp-prototype` Subagent 按确认的范围执行，核心链路：
   - **前置设计**：若已有上游理需求/场景定义/挖知识/本体产出 → Agent 产品方案（agent-product-proposal-generator）；
   - **完整链路**：上游聚合 → Agent 产品方案 → AI Canvas / To-be 旅程设计（ai-product-journey-generator）→ mvp_spec → MVP 原型（prototype-generator）→ 启动验证 → UX 定制优化（ux-optimizer，默认自动）；
   - **单步执行**：仅 Agent 产品方案（需已有上游产出），或仅 To-be 旅程，或仅 MVP 原型（需已有旅程输入），或仅 UX 优化（需已有 MVP 原型）。
3. 将 Subagent 返回的交付摘要（产物文件清单、启动方式、验证结果、UX 定制设计系统）呈现给用户。
