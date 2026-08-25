---
name: strategy-derivation
description: "Enterprise strategy formulation, North Star Metric selection, and KPI decomposition. Use when Claude needs to define business goals for: (1) Deriving a 1-2 year North Star Metric based on business models, (2) Breaking down growth/efficiency/quality/health KPIs, (3) Formulating actionable, prioritized business strategies based on SWOT. Triggers on requests like '制定业务策略', '推导业务目标', '设计 KPI', or '定义北极星指标'. Can be used independently or as Phase 3 of the nsm-analysis macro skill."
author: KK
---

# Strategy Derivation Skill

基于业务现状和 SWOT 分析，推导未来 1-2 年的业务目标、北极星指标、KPI 体系和业务策略。

## 输入

| 参数 | 必填 | 说明 |
|------|------|------|
| 企业名称 | 是 | 目标企业 |
| 业务类型/模式 | 是 | 具体业务方向 |
| 业务现状报告 | 推荐 | business-research 的输出 |
| SWOT 分析报告 | 推荐 | swot-analysis 的输出 |

若未提供前置报告，先向用户收集关键业务信息和竞争态势，再执行推导。

## 执行步骤

1. **确认信息基础** — 检查是否有现状报告和 SWOT，若无则快速补充
2. **选定北极星指标** — 基于业务模式选取一个最关键的衡量指标
3. **分解 KPI** — 从北极星分解 3-4 个关键目标指标（增长、效率、质量、健康等维度）
4. **制定核心策略** — 提出 3-5 条核心业务策略要点，与 SWOT 交叉策略对齐
5. **生成结构化 YAML** — 按照 `examples/strategy_example.yaml` 格式输出数据
6. **编译 HTML 报告** — 执行 `python3 scripts/build_strategy.py` 生成可视化报告
7. **引导下一步** — 建议用户使用 `OSM-map-generator` 对核心策略进行目标-策略-度量（OSM）的深度拆解

> [!TIP]
> **定位提示**: 在本阶段只需找出北极星指标、关键目标指标及核心业务策略要点，保持战略高度，不需要过于深入。更细化的拆解应在下一步的 OSM 分析中完成。

## 北极星指标选取

北极星指标需满足 4 个条件：
- **反映核心价值** — 直接衡量为客户创造的核心价值
- **驱动增长** — 该指标增长能带动营收和规模增长
- **可量化** — 有清晰的计算方式和数据来源
- **全局对齐** — 各部门的工作都能影响该指标

不同业务模式的典型北极星指标参考见 [derivation_framework.md](references/derivation_framework.md)。

## KPI 分解原则

从北极星指标分解出 3-5 个 KPI，覆盖 4 个类型：

| 类型 | 作用 | 示例 |
|------|------|------|
| 增长指标 | 驱动北极星增长 | 新客获取率、新市场渗透率 |
| 效率指标 | 衡量资源利用 | 转化率、人效、客单价 |
| 质量指标 | 衡量价值交付 | 留存率、NPS、复购率 |
| 健康指标 | 确保可持续 | 毛利率、CAC/LTV 比 |

## 核心策略要点

策略应聚焦于“做什么”和“为什么做”，每条策略描述应包含：
- **策略名称** — 简洁概括
- **策略内容** — 核心逻辑与关键动作（High-level）
- **优先级** — P0/P1/P2
- **SWOT 关联** — 来自哪条交叉策略

## 输出标准 (Dual Output Standard)

必须同时输出以下两部分：
1. **结构化 YAML**: 符合 `scripts/build_strategy.py` 要求的 YAML 数据块。
2. **可视化 HTML**: 运行脚本生成的交互式报告，包含 KPI 金字塔视觉展示。

### 编译指令
```bash
python3 scripts/build_strategy.py examples/your_strategy.yaml examples/your_strategy.html
```

## 出口质量自检

- [ ] **北极星合理**：指标与业务模式高度匹配，满足 4 个条件
- [ ] **KPI 可衡量**：每个 KPI 维度清晰，有明确的目标导向
- [ ] **策略高屋建瓴**：聚焦核心要点，非琐碎的执行细节
- [ ] **数据契约达成**：输出的 YAML 可被脚本无误解析
- [ ] **下一步指引**：明确建议使用 `OSM-map-generator` 进行后续深度分析

---
> 关联技能：[OSM Map Generator](../../osm-map-generator/SKILL.md)
