# 专业完整核算模型（v2）—— 专家修订版

本文件是 v2 的**权威说明**：它解释了相对 v1（原版复刻）修正了哪些参数量级、补齐了哪些真实成本维度、以及为什么这么改。运行方式为 `--mode pro`（默认）。

## 0. v1 vs v2 一句话概览

| | v1（`--mode legacy`） | v2（`--mode pro`，默认） |
| --- | --- | --- |
| 定位 | 逐行复刻原版，供对照/公示口径 | 面向真实项目立项的完整核算 |
| token 成本 | 单一单价 `publicApiCost=10`、单次 `tokenPerUse=0.1M` | 拆分 `输入/输出` 单价与消耗量 |
| 人力成本 | `internalDevCost=40万`（量级错误）、50/50 硬编码 | 人月口径 4.5万，用户可配自有/外包比例 |
| 成本维度 | 仅 MVP/研发/IT/微调/推理 | 新增 数据治理 / 业务集成 / 持续迭代 / 基础设施 / 合规安全 |
| 收益 | 直接 ×理想价值 | × `benefitScalingFactor` 成就系数 |
| 财务指标 | ROI、回收期 | 另加 **NPV**（可选） |
| 已知缺陷 | Mon#6 误用 usersM5、私有化恒 0 | 已修正 Mon#6 用 usersM6 |

> 规则：v1 结论保持不变（用于"与原版一致"），v2 用于专业建议。两者**不要混用**，报告中须注明所用模式。

## 1. 参数量级修正（本次 review 的核心）

### 1.1 Token 费用（原最大问题）
原版 `tokenPerUse=0.1`（10 万 tokens/次）+ `publicApiCost=10` 元/百万 → 单次 ≈ **1 元**。对"长文档问答/大报告生成"勉强成立，但对绝大多数企业场景过高，会**严重高估推理成本**（进而不利于 ROI）。

v2 拆分并给出主流区间（**具体以贵司合同/API 定价为准**）：

| 参数 | v1 | v2 默认 | 依据（主流 API 价格区间，元/百万） |
| --- | --- | --- | --- |
| `inputTokenCost` | 10（统一） | **5** | DeepSeek/Qwen/GLM 等 1~5；GPT/Claude 系 18~20+。取国产主流企业价 |
| `outputTokenCost` | 10（统一） | **15** | 输出普遍比输入贵 2~4 倍；保守取 15 |
| `inputTokensPerUse` | —（0.1 总） | **0.03**（≈3万） | 一次带上下文的请求输入 |
| `outputTokensPerUse` | —（0.1 总） | **0.005**（≈5千） | 一次生成回答的输出 |

效果：单次 = 0.03×5 + 0.005×15 = **0.225 元/次**（原 1 元）。这更贴近现代推理真实成本，也更能反映推理成本下降这一事实。
> 若贵司用高价模型或深度推理链，可上调；若要用"统一单价"快速估算，把两次设置成相同即可。

### 1.2 人力成本（原量级错误）
原版 `internalDevCost=400000`、`externalDevCost=200000` —— 若按"人月"理解，等于**年薪 480 万/人的自有研发成本**，明显不合理（会把产品化研发成本放大 ~9 倍）。原版用 `团队 × 0.5 × 内部 + 团队 × 0.5 × 外部`，默认值下即 `6 × 180万 = 1080万/月`，Y1 研发成本被推到几千万。

v2 修正为**人月口径**（元/人/月），并允许显式的自有/外包比例：

| 参数 | v1 | v2 默认 | 依据 |
| --- | --- | --- | --- |
| `internalDevCost` | 400000 | **45000** | 中国大陆一二线城市高级工程师综合成本(工资+社保+管理福利)≈ 3.5~5.5 万/人/月 |
| `externalDevCost` | 200000 | **25000** | 外包/驻场合同价 ≈ 2.5~3.5 万/人/月 |
| `internalStaffRatio` | 硬编码 0.5 | **0.7** | 团队以自有为主 |
| `externalStaffRatio` | 硬编码 0.5 | **0.3** | 部分外包补充 |

v2 人月混合单价 = `0.7×45000 + 0.3×25000 = 39000 元/人/月`。Y1 一个 6 人研发团队月度 = 6×39000 = **23.4 万/月**（原 1080 万），这才是合理的量级。

### 1.3 IT 运维 / 基础设施
- 保留 `y1/y2/y3MonthlyMaintenanceCost`（2万/2万/1万）——合理。
- 新增 `infraComputeCost=20000/月`：AI 项目除 token 外的**持续算力底座**（GPU 租赁/自建集群、向量库、监控、对象存储等）。v1 完全没有这部分，会系统性低估。

### 1.4 MVP 成本
原 `mvpMonthlyCost=500000/月`×3=150万，对 5~8 人 + 算力 + 外部服务的成熟团队偏乐观上限。v2 默认 **300000/月**（更贴近多数企业），保留可调。

## 2. 补齐的真实项目成本维度（v2 新增）

这些是实际落地 AI 项目必然存在、而原模型完全缺失的投入。均分为**一次性**（立项/上线前，计入 Mon#1-3）与**持续**（每月，随 36 个月展开并折现）两类。

### 2.1 数据治理（`data*`）
AI 效果依赖数据质量，往往是最被低估的前置投入。

| 参数 | 类型 | v2 默认(元) | 含义 |
| --- | --- | --- | --- |
| `dataCollectionCost` | 一次性 | 50000 | 多源数据采集/归集 |
| `dataCleaningCost` | 一次性 | 30000 | 清洗/去重/标准化 |
| `dataAnnotationCost` | 一次性 | 80000 | 标注/质检（训练与评测用） |
| `dataMonthlyGovernanceCost` | 持续/月 | 10000 | 数据质量监控、血缘、版本、脱敏运维 |

### 2.2 业务上下游集成（`integration*`）
AI 很少独立运行，需与 CRM/ERP/OA/审批流/知识库等打通。

| 参数 | 类型 | v2 默认(元) | 含义 |
| --- | --- | --- | --- |
| `integrationApiDevCost` | 一次性 | 120000 | 接口开发、联调、消息/事件适配 |
| `integrationThirdPartyCost` | 一次性 | 50000 | 第三方系统/中间件许可或服务费 |
| `integrationMonthlyOpsCost` | 持续/月 | 5000 | 接口稳定性监测与排障 |

### 2.3 持续迭代优化（`iter*` / 微调）
上线不是终点，模型/提示词/流程需要持续调优。v1 只有 `productModel` 微调次数，缺"优化人力 + 评测监控"。

| 参数 | 类型 | v2 默认 | 含义 |
| --- | --- | --- | --- |
| `iterTeamSize` | 持续人力(人) | 2 | 持续迭代/优化工程师（按人月成本计入） |
| `evalQualityMonthlyCost` | 持续/月 | 20000 | 评测集维护、回归、监控告警 |
| `productModel` | 次数 | 3 | 产品化期模型微调次数（仍一次性计入 M7-9 段） |

### 2.4 合规与安全（`compliance*`）
数据安全、隐私合规、审计、模型备案等（尤其金融/医疗/法律）。

| 参数 | 类型 | v2 默认(元) | 含义 |
| --- | --- | --- | --- |
| `complianceSetupCost` | 一次性 | 60000 | 安全/合规/审计体系建设 |
| `complianceMonthlyCost` | 持续/月 | 8000 | 持续合规巡检/审计 |

## 3. 收益侧修正

### 3.1 收益成就系数 `benefitScalingFactor`
v1 直接按理想假设算收益（`用户 × 频次 ×（省时×时薪 + 业务价值）`），极易虚高。真实世界存在：渗透率不足、并非全员高频、省时打折扣、价值难以兑现。
v2 默认 `benefitScalingFactor=0.85`，让收益打一个保守折扣；**若项目处于早期/高风险，建议调至 0.6~0.7**。

### 3.2 Mon#6 用户数修正
v1 的 Mon#6 收益误用 `usersM5`；v2 修复为 `usersM6`，保证收益与成本同口径。

### 3.3 商业模式分化（可选扩展）
模型已区分 **省时降本**（`timeSaved×hourlyRate`）与 **直接业务价值**（`businessValue`），可据此体现"降本/增收"两种价值。若只是替代人工 → 强调 `timeSaved`；若是新增收入 → 填 `businessValue`。

## 4. 财务指标

### 4.1 NPV（v2 新增，可用 `computeNpv:false` 关闭）
- 年折现率 `r = discountRate - 1`（默认 5%）。
- 月折现率 `r_month = (1+r)^(1/12) - 1`。
- 把 36 个月净现金流按 `cf_m/(1+r_month)^m` 折现累加。
- NPV>0 表示在考虑时间价值后仍盈利；用于与 ROI 交叉验证。

### 4.2 敏感性（建议速算）
对 `usersM*`（同比例）与"单次价值"做 ±20%，看 ROI/NPV 波动。敏感性越陡、风险越高。

## 5. 收益虚高的"预警提醒"（专家特别提示）

v2 的公式仍可能算出很高的 ROI（例：默认场景 v2 ROI≈2180%），**这不是模型 bug，而是用户数假设过于理想**：
- 默认 `usersM13=5000`, `usageFrequency=30`，即**5000 人每人每月用 30 次 = 15 万次/月**，每次省 0.6h × 时薪 125 = 75 元 → 单月理论 1125 万。
- 现实中：活跃渗透、频次、省时都会打折。

**务必用 `input-guide.md` 的"活跃口径"收敛 user 数**，并结合 `benefitScalingFactor`（0.6~0.85）。高 ROI 应反向检查：若非"人手一份、天天用"的场景，请把 `usersM13` 从"目标用户"降为"高活跃用户"。

## 6. 如何运行

```bash
# v2（默认）
node scripts/calculate-roi.mjs --input ./scenario-input.json --json
# v1 原版对照
node scripts/calculate-roi.mjs --input ./scenario-input.json --mode legacy --json
# 自定义企业参数
node scripts/calculate-roi.mjs --input ./scenario-input.json --params ./enterprise-params.json --json
```

## 7. v2 新增输入字段（相对 v1）

除 v1 全部字段外，新增（可整体用默认，按需覆盖）：
`inputTokensPerUse, outputTokensPerUse, benefitScalingFactor, iterTeamSize,
dataCollectionCost, dataCleaningCost, dataAnnotationCost, dataMonthlyGovernanceCost,
integrationApiDevCost, integrationThirdPartyCost, integrationMonthlyOpsCost,
complianceSetupCost, complianceMonthlyCost`
以及企业参数层：`inputTokenCost, outputTokenCost, infraComputeCost, evalQualityMonthlyCost, internalStaffRatio, externalStaffRatio, computeNpv`。

如仍希望用原版"统一 token 单价"口径：可在一次调用中把 `inputTokenCost=outputTokenCost`，且忽略拆分消耗。
