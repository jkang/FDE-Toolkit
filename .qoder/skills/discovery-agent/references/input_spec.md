# Discovery Agent — 参数输入规范

## 调用参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `client_name` | string | ✅ | 客户/企业名称，用于命名所有产物目录与文件 | `"瑞云科技"` |
| `domain` | string | ✅ | 业务领域（中文），影响 Prompt 上下文 | `"医疗供应链"` |
| `scope` | enum | 否 | 执行范围：`full`（默认）\| `phase_a` \| `phase_b` \| `phase_c` \| `dashboard_only` | `"full"` |
| `documents` | list | 否 | 用户提供的参考文档路径或粘贴内容列表 | `["annual_report.pdf", "...]` |
| `competitors` | list | 否 | 竞品企业列表（用于 SWOT） | `["竞品A", "竞品B"]` |
| `focus_areas` | list | 否 | 重点关注维度 | `["成本优化", "客户体验"]` |
| `top_n_canvas` | int | 否 | 生成 AI Canvas 的场景数量，默认 3 | `3` |

## 调用示例（自然语言）

```
请帮我针对"瑞云科技"的医疗供应链业务，启动完整的 Discovery Agent 分析流程。
客户背景：[粘贴文档内容]
竞品：[海虹医疗、药链云]
重点关注：AI 在智能补货和药品追溯的机会
```

## 最简调用

```
discovery agent: 客户=某零售集团, 领域=门店运营
```

Agent 会在 Step 0 自动引导补全其余参数。

## Phase Cache 文件规范

所有中间产物的摘要缓存统一写入：

```
[客户名称]/
├── phase_cache/
│   ├── p1_nsm.md          # 北极星指标、核心战略
│   ├── p2_maturity.md     # AI 成熟度分级
│   ├── p3_osm.md          # OSM 结构化列表
│   ├── p4_process.md      # L1/L2 流程 + 痛点
│   ├── p7_opportunities.md # AI 场景列表
│   └── p11_roadmap.md     # 路线图阶段
└── discovery_index.md     # 进度追踪表
```

## 数据传递关系图

```
p1_nsm.md ──────┬──→ p3_osm.md
                │
                └──→ p11_roadmap.md

p4_process.md ──┬──→ p7_opportunities.md ──→ Step 8 (Canvas)
                │                        ──→ Step 10 (Matrix)
                └──→ Step 5 (Journey Map)
                └──→ Step 6 (Blueprint)

p7_opportunities.md + p11_roadmap.md ──→ Step 12 (Milestone)
```
