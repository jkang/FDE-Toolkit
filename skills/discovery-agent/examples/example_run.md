# Discovery Agent — 示例对话与调用

## 示例一：完整流程（某零售集团）

**用户输入：**
```
请帮我针对「华润万家」的门店运营业务启动 Discovery Agent，
重点看 AI 在库存预测和导购智能化方面的机会。
竞品参考：山姆、盒马、永辉
```

**Agent 执行记录（产物目录：`华润万家/`）：**

```
华润万家/
├── discovery_index.md
├── phase_cache/
│   ├── p1_nsm.md
│   ├── p2_maturity.md
│   ├── p3_osm.md
│   ├── p4_process.md
│   ├── p7_opportunities.md
│   └── p11_roadmap.md
├── 华润万家-北极星指标及战略推导.yaml
├── 华润万家-北极星指标及战略推导.html
├── 华润万家-AI成熟度评估.yaml
├── 华润万家-AI成熟度评估.html
├── 华润万家-OSM目标度量地图.yaml
├── 华润万家-OSM目标度量地图.html
├── 华润万家-业务流程深度分析.yaml
├── 华润万家-业务流程深度分析.html
├── 华润万家-体验旅程图.yaml
├── 华润万家-体验旅程图.html
├── 华润万家-服务蓝图.yaml
├── 华润万家-服务蓝图.html
├── 华润万家-AI机会场景地图.yaml
├── 华润万家-AI机会场景地图.html
├── 华润万家-AI画布-智能补货预测.yaml
├── 华润万家-AI画布-智能补货预测.html
├── 华润万家-AI画布-导购智能推荐.yaml
├── 华润万家-AI画布-导购智能推荐.html
├── 华润万家-AI画布-损耗预警系统.yaml
├── 华润万家-AI画布-损耗预警系统.html
├── 华润万家-CKD数据映射.yaml
├── 华润万家-CKD数据映射.html
├── 华润万家-AI场景优先级矩阵.yaml
├── 华润万家-AI场景优先级矩阵.html
├── 华润万家-产品演进路线图.yaml
├── 华润万家-产品演进路线图.html
├── 华润万家-里程碑计划.yaml
├── 华润万家-里程碑计划.html
├── 华润万家-dashboard.yaml
└── 华润万家-统一报告仪表盘.html    ← 最终交付物
```

---

## 示例二：仅执行 Phase A（医疗供应链）

**用户输入：**
```
针对「瑞云科技」的医疗供应链业务，先做 Phase A 的洞察分析就好。
附件：[公司年报.pdf]
```

**Agent 执行范围：** Step 1–6，生成 Phase A 全部 6 个模块产物，最后告知用户可继续 Phase B。

---

## 示例三：中断恢复

**用户输入（第二天继续）：**
```
继续瑞云科技的 Discovery 流程，之前 Phase A 已经做完了
```

**Agent 行为：**
1. 读取 `瑞云科技/discovery_index.md`，确认 Step 1-6 已完成
2. 从 Step 7（AI 机会场景地图）继续执行
3. 读取 `phase_cache/p4_process.md` 获取流程痛点数据
