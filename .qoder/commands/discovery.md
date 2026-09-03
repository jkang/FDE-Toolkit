---
name: discovery
description: 全链路 AI 场景探索编排（Discovery Agent）。接受客户名称 + 业务领域 + 资料，按 FDE 四步法（理需求 → 挖知识 → 建本体 → 生智能）顺序执行 20 步，最后用 unified-report-dashboard 汇总为交付 Deck。
---

调用 `discovery-agent` 宏编排，完成 FDE 四步法端到端 AI 场景探索：

1. 读取 `skills/discovery-agent/SKILL.md`，严格遵循其编排流程（Step 0 输入收集 → 环境预检 → Phase 1-4 + 汇总）。
2. 向用户确认必要输入：客户名称、业务领域（如有背景资料/竞品一并收集）；确认可执行范围（默认全链路 20 步，可指定仅某 Phase）。
3. 按 SKILL.md 顺序调度各子 Skill，产物写入 `[客户名称]/`（两层目录：公司级 + 场景级），中间结果写入 `[客户名称]/phase_cache/` 防上下文丢失。
4. **阶段门禁**：每个 Phase 结束必须先列出产物，请用户/业务方确认并提示交叉校验，确认后再进入下一阶段——不可全自动跑完。
5. **单一职责**：本命令只做「全链路编排」；若用户只想做其中单步（如仅 NSM / 仅机会地图），请转用对应单点命令 `/nsm` `/client-insight` `/opportunity` `/agent-arch` `/mvp-prototype` `/mvp-eval` `/requirement` `/roadmap`。
6. 完成后向用户返回交付摘要（产物文件清单 + 统一报告仪表盘路径）。
