# X销售收入确认 · 销售POD收入确认 方案设计进度追踪

> 由 `ai-solution-designer` 端到端执行（直接调用 skill，未委派 SubAgent）。
> 客户/业务：X销售收入确认 ｜ 场景：销售POD收入确认 ｜ 完成日期：2026-09-10

| 步骤 | 名称 | 状态 | 产物文件 |
|------|------|------|----------|
| 1 | 机会点定义（5 要素） | ✅ 完成 | `POD收入确认/X销售收入确认-POD收入确认-机会点定义.yaml / .html` |
| 2 | AI 场景画布（10 维） | ✅ 完成 | `POD收入确认/X销售收入确认-POD收入确认-AI画布.yaml / .html` |
| 3 | To-be 流程泳道 | ✅ 完成 | `POD收入确认/X销售收入确认-POD收入确认-To-be流程.yaml / .html` |
| 4 | CKD 上下文/知识/数据映射 | ✅ 完成 | `POD收入确认/X销售收入确认-POD收入确认-CKD矩阵分析.yaml / .html` |
| 5 | 任务流程拆解 P1（L3→L5 + 使用点） | ✅ 完成 | `POD收入确认/X销售收入确认-POD收入确认-任务流程拆解.yaml / .html` |
| 6 | 业务规则挖掘 P2（五类规则） | ✅ 完成 | `POD收入确认/X销售收入确认-POD收入确认-业务规则挖掘.yaml / .html` |
| 7 | Agent 本体设计（三层） | ✅ 完成 | `POD收入确认/X销售收入确认-POD收入确认-本体设计.yaml / .html` |
| 8 | Agent 产品方案（8 段式） | ✅ 完成 | `POD收入确认/X销售收入确认-POD收入确认-Agent产品方案.md / .html` |
| 9 | To-be 旅程设计 | ✅ 完成 | `POD收入确认/X销售收入确认-POD收入确认-To-be旅程.yaml / .html` |
| 10 | MVP 原型（mvp-spec + 前后端应用） | ✅ 完成（已启动验证） | `POD收入确认/X销售收入确认-POD收入确认-mvp-spec.yaml` + `POD收入确认/mvp-prototype/` |
| 11 | UX 定制优化（设计系统 + 无侵入注入） | ✅ 完成（已注入 + 构建验证） | `POD收入确认/X销售收入确认-POD收入确认-ux-audit.yaml` + `-UX设计报告.html` |
| 12 | Agent 落地技术架构 + 编排图（Autonomous Planner） | ✅ 完成 | `POD收入确认/X销售收入确认-POD收入确认-落地技术架构.yaml / .html` |
| 13 | MVP 成效指标（四维 + Rubric + Go/No-Go） | ✅ 完成 | `POD收入确认/X销售收入确认-POD收入确认-MVP指标设计.yaml / .html` |
| 14 | AI 测试数据集（三层三类） | ✅ 完成 | `POD收入确认/X销售收入确认-POD收入确认-AI测试数据集.yaml / .html` |
| 15 | 场景级统一报告仪表盘 | ✅ 完成（已打开） | `POD收入确认/X销售收入确认-POD收入确认-统一报告仪表盘.yaml / .html`（含 `-本场景总览.html`、`-MVP原型启动指引.html`） |

## 统一报告

- 报告：`POD收入确认/X销售收入确认-POD收入确认-统一报告仪表盘.html`（深色仪表盘，含本场景总览 + 14 项产出导航）
- 校验：`validate_dashboard.py` → **PASS**（含 1 条 WARN：未找到公司级 AI机会场景地图，属预期）
- 已通过 `open` 自动打开浏览器

## MVP 原型启动验证记录

- `npm install`（本地 cache）→ 成功
- `npm run dev` → API `:8080` + Vite `:5173` 均启动
- `curl http://localhost:8080/api/health` → `{"status":"ok",...}`
- AI 端点实测：`/api/collection/sync`、`/api/pod/check`、`/api/pod/confirm`、`/api/posting/execute`、`/api/dashboard` 均返回 Mock 结果
- 前端 5 页（dashboard/collect/reconcile/podmatch/posting）模块转译 200
- `npm run build` 生产构建成功
- **UX 注入**：`apply_ux_enhance.py` 生成 `src/ux-design.js` / `ux-design.css` 并注入入口，`npm run build` 复验通过
- 修复：脚手架生成的 CollectPage / ReconcilePage 存在重复 `const` 与结果数组绑定问题，已修正；PodmatchPage 补充 POD 确认结果卡

## 待确认事项（承接 Agent 产品方案第 8 段 / 落地技术架构 notes）

1. 对账差异容差口径与差异归因规则是否与业务专家一致
2. POD 确认五条件判定口径与「客户自提视同签收」的审计要求
3. 四类超期异常天数阈值与预警升级规则
4. 借贷项由系统创建/关联/仅记录状态，是否需要自动过账回写
5. SAP 接口能力与公共邮箱/文件夹读取权限范围
6. 视觉基底与相邻系统边界（阶段2 前置项）
7. 落地技术架构 MCP 边界：若确认「MCP=0，数据全部来自绑定本体」，需将外部系统归入本体/内部服务并标 N/A
