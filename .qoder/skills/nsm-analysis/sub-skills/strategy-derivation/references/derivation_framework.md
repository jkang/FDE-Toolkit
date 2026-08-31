# 战略推导框架 (Strategy Derivation Framework)

## 北极星指标参考

不同业务模式的典型北极星指标：

| 业务模式 | 典型北极星指标 | 选取理由 |
|----------|----------------|----------|
| 电商/交易平台 | GMV、订单量、购买用户数 | 直接反映交易规模 |
| SaaS/订阅 | MRR/ARR、活跃订阅用户数 | 反映持续收入能力 |
| 内容/社交 | DAU、用户使用时长 | 反映用户粘性和平台价值 |
| 硬件/IoT | 激活设备数、设备使用频次 | 反映产品价值 |

## KPI 分解方法 (金字塔结构)

从北极星指标分解出 3-4 个维度的关键目标指标：

1. **增长 (Growth)**: 规模扩张与市场渗透
2. **效率 (Efficiency)**: 资源产出比与转化
3. **质量 (Quality)**: 用户留存与满意度
4. **健康 (Health)**: 盈利能力与财务稳健

## 核心策略制定

在本阶段，策略应保持在**业务要点**级别，每个策略应解决 SWOT 中的核心挑战。

---

## 报告 YAML 契约 (Data Contract)

LLM 必须生成符合以下结构的 YAML 数据，以便编译器渲染 HTML。

```yaml
title: "项目标题"
planning_cycle: "2025-2026"
nsm:
  name: "指标名称"
  target: "目标值"
  unit: "单位"
  definition: "计算公式或口径定义"
kpi_pyramid:
  - name: "增长维度"
    type: "增长指标"
    metrics:
      - name: "指标1"
        target: "值"
        desc: "简短描述"
  - name: "效率维度"
    type: "效率指标"
    metrics:
      - name: "指标1"
        target: "值"
        desc: "简短描述"
strategies:
  - name: "策略名称"
    priority: 0
    swot_ref: "S1 x O2"
    description: "核心逻辑描述（200字以内）"
    actions:
      - "动作1"
      - "动作2"
    kpi_ref: "关联指标名称"
```

## 下一步：OSM 深度拆解建议

完成本阶段高层战略推导后，针对每个 **P0/P1 级核心策略**，应调用 `OSM-map-generator` 进行如下深度拆解：

- **Objective (目标)**: 将策略转化为可实现的具体目标。
- **Strategy (策略)**: 细化策略执行路径。
- **Measurement (度量)**: 定义过程指标与结果指标，并映射到具体的**业务场景 (Scenarios)**。

---
> 关联编译引擎: `nsm-analysis/sub-skills/strategy-derivation/scripts/build_strategy.py`
