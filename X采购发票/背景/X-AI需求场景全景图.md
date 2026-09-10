---
agentos_processor: ai-scenario-panorama
---

# X · AI需求场景全景图

> **版本：** v1.0 | **更新日期：** 2026-09-09
>
> **对应业务阶段：** 理需求 — SLP — 阶段3 AI需求场景规划
>
> **方法论依据：** SLP 阶段3方法
>
> **输入依据：** 01_企业画像_X.md、02_业务现状全景图_X.md

---

## 1 总览

基于阶段2对X两条财务价值流（采购到付款、订单到现金）的拆解，本期识别出 2 个应用级场景、2 个业务 Agent 级场景。采购发票校验与销售收入确认两个场景作业结构高度同构（多源采集 → OCR/结构化 → 规则匹配/对账 → 异常分流人工复核 → 预制过账 + 税局标识），是打磨可复用 AI Agent 产品底座、复制到同类制造企业的首选落点。

**两个业务Agent的落地路线：** 先做采购发票校验（规则清晰、数据就绪好、见效快），紧随销售收入确认（规则更复杂、数据需补建），两步共享采集、匹配/对账、复核、过账能力。

<div style="font-family:'PingFang SC','Microsoft YaHei',-apple-system,sans-serif; padding:22px 28px; background:#fff; border:1px solid rgba(107,126,239,0.16); border-radius:14px; box-shadow:0 1px 2px rgba(60,70,130,0.05), 0 4px 12px rgba(60,70,130,0.06);">
<div style="padding:14px 18px; background:linear-gradient(135deg, rgba(107,126,239,0.06), rgba(107,126,239,0.02)); border:1px solid rgba(107,126,239,0.12); border-radius:10px; margin-bottom:14px;">
<div style="font-size:12.5px; color:#3a4060; line-height:1.65;"><b style="color:#6b7eef;">核心洞察：</b>两个财务自动化场景共享同一套作业骨架，差异仅在数据源与业务规则，天然适合沉淀为可复制到同类制造企业的产品底座。</div>
<div style="margin-top:9px; display:flex; flex-wrap:wrap; gap:6px;">
<span style="background:rgba(107,126,239,0.10); color:#4a55b0; font-size:11px; padding:2px 8px; border-radius:10px;">应用 2 个</span>
<span style="background:rgba(107,126,239,0.10); color:#4a55b0; font-size:11px; padding:2px 8px; border-radius:10px;">业务 Agent 2 个</span>
<span style="background:rgba(107,126,239,0.07); color:#3a4060; font-size:11px; padding:2px 8px; border-radius:10px;">📊 决策类 1 个</span>
<span style="background:rgba(212,162,78,0.14); color:#8a6a2e; font-size:11px; padding:2px 8px; border-radius:10px;">✨ 创新类 0 个</span>
</div>
</div>
<div style="font-size:11px; color:#6c7390; font-weight:600; margin:10px 0 6px 2px;">▾ 应用（价值段层圈出的范围）→ 业务 Agent（端到端·面向角色·独立交付）</div>
<div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px;">
<div style="border:1px solid rgba(107,126,239,0.38); border-radius:10px; padding:0; background:#fff; box-shadow:0 0 0 1px rgba(107,126,239,0.06), 0 1px 2px rgba(60,70,130,0.05), 0 4px 12px rgba(60,70,130,0.06); display:flex; flex-direction:column; overflow:hidden;">
<div style="text-align:center; padding:10px 8px; background:linear-gradient(180deg, rgba(107,126,239,0.07), rgba(107,126,239,0.01)); border-bottom:1px solid rgba(107,126,239,0.10);">
<div style="font-size:13px; color:#1e2233; font-weight:600;">采购到付款财务自动化 <span style="color:#d4a24e;">★</span></div>
<div style="font-size:10px; color:#9aa0b8; margin-top:2px;">价值流③ 采购到付款 · 聚焦范围①：来料收货与检验 → 发票校验与应付 → 付款</div>
</div>
<div style="display:flex; flex-direction:column; gap:6px; padding:10px 8px;">
<div style="border:1.5px solid #6b7eef; background:rgba(107,126,239,0.08); border-radius:6px; padding:8px;">
<div style="display:flex; align-items:center; gap:4px; font-size:10px; color:#4a55b0; margin-bottom:4px;"><span style="background:#6b7eef; color:#fff; padding:1px 5px; border-radius:3px; font-weight:600;">A1</span><span style="margin-left:auto; background:rgba(16,185,129,0.14); color:#1f8f6b; padding:1px 5px; border-radius:3px; font-size:9px; font-weight:600;">🟢 速赢</span></div>
<div style="font-size:13px; color:#1e2233; font-weight:600;">采购发票校验助手</div>
<details style="margin-top:6px;"><summary style="cursor:pointer; font-size:10px; color:#6c7390;">▸ 详情</summary><div style="margin-top:6px; font-size:11px; line-height:1.6; color:#3a4060;"><div><b>来源：</b>价值段3.4 发票校验与应付 · 业务流程：发票采集识别 → 三单匹配 → 发票预制 → 过账</div><div><b>面向角色：</b>应付会计、采购业务员、财务负责人</div><div><b>痛点锚定：</b>三单匹配人工逐票比对（🔴高耗时 + 🟠高频错误）、异常识别依赖经验（🟡高经验）、发票多渠道采集分散（🔵系统孤岛）</div><div><b>业务价值：</b>释放应付会计三单匹配与校验工时、降低匹配错误率、缩短发票到过账周期（量级待客户量化数据确认）</div><div><b>关联系统：</b>SAP、乐企平台、电子税务局 / 金税、OCR、邮件、供应商发票校验平台</div><div><b>数据就绪度：</b>B 可整理 — PO/入库/发票已有电子化，乐企接口可用，但三单口径需对齐</div><div><b>技术可行性：</b>高 — OCR 与规则匹配技术成熟，主要工作量为 SAP 与乐企接口集成</div></div></details>
</div>
</div>
</div>
<div style="border:1px solid rgba(107,126,239,0.38); border-radius:10px; padding:0; background:#fff; box-shadow:0 0 0 1px rgba(107,126,239,0.06), 0 1px 2px rgba(60,70,130,0.05), 0 4px 12px rgba(60,70,130,0.06); display:flex; flex-direction:column; overflow:hidden;">
<div style="text-align:center; padding:10px 8px; background:linear-gradient(180deg, rgba(107,126,239,0.07), rgba(107,126,239,0.01)); border-bottom:1px solid rgba(107,126,239,0.10);">
<div style="font-size:13px; color:#1e2233; font-weight:600;">订单到现金财务自动化 <span style="color:#d4a24e;">★</span></div>
<div style="font-size:10px; color:#9aa0b8; margin-top:2px;">价值流① 商机到现金 · 聚焦范围②：订单与交付 → 收入确认与回款</div>
</div>
<div style="display:flex; flex-direction:column; gap:6px; padding:10px 8px;">
<div style="border:1.5px solid #6b7eef; background:rgba(107,126,239,0.08); border-radius:6px; padding:8px;">
<div style="display:flex; align-items:center; gap:4px; font-size:10px; color:#4a55b0; margin-bottom:4px;"><span style="background:#6b7eef; color:#fff; padding:1px 5px; border-radius:3px; font-weight:600;">A2</span><span style="font-size:11px;">📊</span><span style="margin-left:auto; background:rgba(245,158,11,0.16); color:#8a6a2e; padding:1px 5px; border-radius:3px; font-size:9px; font-weight:600;">🟡 深化</span></div>
<div style="font-size:13px; color:#1e2233; font-weight:600;">销售收入确认助手</div>
<details style="margin-top:6px;"><summary style="cursor:pointer; font-size:10px; color:#6c7390;">▸ 详情</summary><div style="margin-top:6px; font-size:11px; line-height:1.6; color:#3a4060;"><div><b>来源：</b>价值段1.4 收入确认与回款 · 业务流程：订单/交货同步 → 签收识别 → 对账差异 → 收入确认判断 → 发票预制 → 过账</div><div><b>面向角色：</b>应收会计、销售/商务、物流、财务负责人</div><div><b>痛点锚定：</b>对账与差异处理（🔴高耗时 + 🟠高频错误）、收入确认条件判断依赖经验（🟡高经验）、收入确认整体周期长</div><div><b>业务价值：</b>缩短收入确认周期、释放对账人力、降低对账差异（量级待客户量化数据确认）</div><div><b>关联系统：</b>SAP、物流系统、OCR、电子税务局 / 金税</div><div><b>数据就绪度：</b>C 需补建 — 物流签收资料采集与对账口径需补建</div><div><b>技术可行性：</b>中高 — OCR 与对账技术成熟，但收入确认规则（新收入准则）与签收采集较复杂</div></div></details>
</div>
</div>
</div>
</div>
<div style="margin-top:14px; padding:12px 18px; background:#eef2fc; border:1px solid rgba(107,126,239,0.08); border-radius:8px; display:flex; flex-wrap:wrap; gap:14px; font-size:11px; color:#6c7390; align-items:center;">
<span><b style="color:#3a4060;">结构：</b></span>
<span><span style="display:inline-block; width:10px; height:10px; background:linear-gradient(180deg, rgba(107,126,239,0.10), rgba(107,126,239,0.02)); border:1px solid rgba(107,126,239,0.38); border-radius:2px; vertical-align:middle;"></span> 应用</span>
<span><span style="display:inline-block; width:10px; height:10px; background:rgba(107,126,239,0.08); border:1.5px solid #6b7eef; border-radius:2px; vertical-align:middle;"></span> 业务 Agent</span>
<span style="border-left:1px solid rgba(107,126,239,0.12); padding-left:14px;"><b style="color:#3a4060;">标签：</b></span>
<span>📊 决策类</span>
<span>✨ 创新类</span>
<span style="border-left:1px solid rgba(107,126,239,0.12); padding-left:14px;"><b style="color:#3a4060;">落地：</b></span>
<span><span style="background:rgba(16,185,129,0.14); color:#1f8f6b; padding:1px 5px; border-radius:3px; font-size:9px; font-weight:600;">🟢</span> 速赢</span>
<span><span style="background:rgba(245,158,11,0.16); color:#8a6a2e; padding:1px 5px; border-radius:3px; font-size:9px; font-weight:600;">🟡</span> 深化</span>
<span><span style="background:rgba(59,130,246,0.12); color:#3b6fc7; padding:1px 5px; border-radius:3px; font-size:9px; font-weight:600;">🔵</span> 战略</span>
<span style="color:#9aa0b8;">▸ 可点开看详情</span>
</div>
</div>

---

## 2 业务 Agent 清单

| 编号 | 名称 | 所属应用 | 标签 | 价值流/价值段 | 来源（任务编号） | 面向角色 | 痛点锚定 | 业务价值 | 关联系统 | 数据就绪度 | 技术可行性 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A1 | 采购发票校验助手 | 采购到付款财务自动化 | — | 价值流③ 采购到付款 · 聚焦范围①：来料收货与检验 → 发票校验与应付 → 付款 | 价值段3.4 发票校验与应付 · 业务流程：发票采集识别 → 三单匹配 → 发票预制 → 过账 | 应付会计、采购业务员、财务负责人 | 三单匹配人工逐票比对（🔴高耗时 + 🟠高频错误）、异常识别依赖经验（🟡高经验）、发票多渠道采集分散（🔵系统孤岛） | 释放应付会计三单匹配与校验工时、降低匹配错误率、缩短发票到过账周期（量级待客户量化数据确认） | SAP、乐企平台、电子税务局 / 金税、OCR、邮件、供应商发票校验平台 | B 可整理 | 高 — OCR 与规则匹配技术成熟，主要工作量为 SAP 与乐企接口集成 |
| A2 | 销售收入确认助手 | 订单到现金财务自动化 | 📊 | 价值流① 商机到现金 · 聚焦范围②：订单与交付 → 收入确认与回款 | 价值段1.4 收入确认与回款 · 业务流程：订单/交货同步 → 签收识别 → 对账差异 → 收入确认判断 → 发票预制 → 过账 | 应收会计、销售/商务、物流、财务负责人 | 对账与差异处理（🔴高耗时 + 🟠高频错误）、收入确认条件判断依赖经验（🟡高经验）、收入确认整体周期长 | 缩短收入确认周期、释放对账人力、降低对账差异（量级待客户量化数据确认） | SAP、物流系统、OCR、电子税务局 / 金税 | C 需补建 | 中高 — OCR 与对账技术成熟，但收入确认规则（新收入准则）与签收采集较复杂 |

---

## 3 落地路线图

### 3.1 WSJF 评分

| 编号 | 业务价值(CoD) | 实施复杂度(JD) | 数据就绪度 | 风险/机会 | WSJF | 落地阶段 |
|---|---|---|---|---|---|---|
| A1 | 90（财务人工密集 + 产品化复用价值高） | 40（SAP + 乐企 + OCR 集成，中等复杂度） | B 可整理 | 机会：可沉淀通用发票校验 Agent 骨架，复制到同类制造客户 | 90/40=**2.25** | 🟢 速赢 |
| A2 | 80（收入确认刚需 + 周期长对账难） | 60（收入确认规则 + 签收采集 + 对账，复杂度较高） | C 需补建 | 机会：收入确认是财务刚需；风险：新收入准则口径需明确 | 80/60=**1.33** | 🟡 深化 |

### 3.2 分阶段路线

**🟢 阶段1 · 速赢（先做）**：A1 采购发票校验助手

- 预期成果：采购发票校验自动化上线，单票校验耗时与匹配错误率显著下降
- 技术栈重叠：与销售收入确认共享采集、OCR、复核、过账能力

**🟡 阶段2 · 深化（紧随）**：A2 销售收入确认助手

- 预期成果：收入确认周期缩短、对账人力释放
- 数据补建：需补齐物流签收资料采集与对账口径

---

## 4 待确认问题清单

| # | 问题 | 用途与影响 |
|---|------|-----------|
| 1 | 采购发票月度量级、单票校验耗时、三单匹配错误率的基线数据 | 影响 A1 的 P0 痛点量化与 ROI 计算，进而影响验收指标 |
| 2 | 收入确认周期、对账频次与对账人力的基线数据 | 影响 A2 的价值量化与验收指标 |
| 3 | SAP 版本与已上线模块（FI/CO/MM/SD）、收入确认条件的具体规则口径（新收入准则） | 影响两个场景的技术可行性判断与 A2 的边界定义 |
