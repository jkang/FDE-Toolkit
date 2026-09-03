---
name: discovery
description: 全链路 AI 场景探索编排（Discovery Agent）。接受客户名称 + 业务领域 + 资料，按 AI4PM 标准流程从 NSM 北极星分析到里程碑计划顺序执行 13 步，最后用 unified-report-dashboard 汇总为交付 Deck。
---

调用 `discovery-agent` 宏编排，完成端到端 AI 场景探索：

1. 读取 `skills/discovery-agent/SKILL.md`，严格遵循其编排流程（Step 0 输入收集 → 环境预检 → Phase A/B/C/D）。
2. 向用户确认必要输入：客户名称、业务领域（如有背景资料/竞品一并收集）；确认可执行范围（默认全链路 13 步，可指定仅某 Phase）。
3. 按 SKILL.md 顺序调度各子 Skill，产物写入 `[客户名称]/`（两层目录：公司级 + 场景级），中间结果写入 `[客户名称]/phase_cache/` 防上下文丢失。
4. **单一职责**：本命令只做「全链路编排」；若用户只想做其中单步（如仅 NSM / 仅机会地图），请转用对应单点命令 `/nsm` `/client-insight` `/opportunity` `/roadmap`。
5. 完成后向用户返回交付摘要（产物文件清单 + 统一报告仪表盘路径）。
