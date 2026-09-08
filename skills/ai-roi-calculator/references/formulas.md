# 计算模型规范（复刻自 calculate-roi.ts）

本文件是公式的**唯一权威来源**。手动计算时严格照此执行；`scripts/calculate-roi.mjs` 是其等价实现（已验证与 TS 原版逐字段一致）。

## 1. 评估期与时间段划分

评估期固定 **36 个月**，划分为 **8 个时间段**（数组 index 0..7）：

| index | 时间段 | 月数 | 阶段含义 |
| --- | --- | --- | --- |
| 0 | Mon#1-Mon#3 | 3 | MVP 开发期 |
| 1 | Mon#4 | 1 | MVP/产品上线首月 |
| 2 | Mon#5 | 1 | 产品初期 |
| 3 | Mon#6 | 1 | 产品初期 |
| 4 | Mon#7-Mon#9 | 3 | 产品成长期 |
| 5 | Mon#10-Mon#12 | 3 | 产品成长期 |
| 6 | Mon#13-Mon#24 | 12 | 第二年（Y2） |
| 7 | Mon#25-Mon#36 | 12 | 第三年（Y3） |

## 2. 成本项（均按时间段填充为 8 元数组）

**MVP 阶段成本 —— 仅在 `mvpVerificationInput === 1` 时写入 index 0：**
```
mvpBasicModelCost[0]   = baseModelCost × mvpDurationInMonths
mvpDevCost[0]          = mvpMonthlyCost × mvpDurationInMonths
mvpFineTuningCost[0]   = fineTuningCost × mvpModel
```

**产品化研发（人力）成本：**
```
Y1 人月混合单价  y1DevCostMonthly = y1TeamSize×0.5×internalDevCost + y1TeamSize×0.5×externalDevCost
productDevCost[1] = productDevCost[2] = productDevCost[3] = y1DevCostMonthly          # M4/M5/M6 各 1 个月
productDevCost[4] = productDevCost[5] = y1DevCostMonthly × 3                          # M7-9、M10-12
productDevCost[6] = (y2TeamSize×0.5×internalDevCost×12 + y2TeamSize×0.5×externalDevCost×12) × discountRate   # Y2
productDevCost[7] = (y3TeamSize×0.5×internalDevCost×12 + y3TeamSize×0.5×externalDevCost×12) × discountRate²  # Y3
```
> 注：Y2/Y3 的人力研发按**全年**投入（×12 个月）。Y1 研发成本并不用全年，仅覆盖 M4-M12。

**产品化 IT 运维成本：**
```
productMaintenanceCost[1..3] = y1MonthlyMaintenanceCost            # 每月
productMaintenanceCost[4..5] = y1MonthlyMaintenanceCost × 3         # 每段 3 个月
productMaintenanceCost[6]    = y2MonthlyMaintenanceCost × 12 × discountRate
productMaintenanceCost[7]    = y3MonthlyMaintenanceCost × 12 × discountRate²
```

**产品化阶段模型微调 —— 固定落在 M7-M9 段（index 4）：**
```
if productModel > 0:  productFineTuningCost[4] = fineTuningCost × productModel
```

**推理模型成本（云端）—— 每段 = 该段用户数 × 月频次 × 每用 Token(百万) × 单价 × 段内月数：**
```
cloud[1] = usersM4   × freq × tok × publicApiCost
cloud[2] = usersM5   × freq × tok × publicApiCost
cloud[3] = usersM6   × freq × tok × publicApiCost
cloud[4] = usersM7M12 × freq × tok × 3 × publicApiCost
cloud[5] = usersM7M12 × freq × tok × 3 × publicApiCost
cloud[6] = usersM13  × freq × tok × 12 × publicApiCost × discountRate
cloud[7] = usersM13  × freq × tok × 12 × publicApiCost × discountRate²
```
私有化成本 `inferenceModelCostPrivate[]` **恒为 0**（原版未实现按 privateDeployment 计算）。

## 3. 收益项 —— 效率提升收益（按时间段）

单次使用价值 = `timeSaved × hourlyRate + businessValue`（省时折钱 + 直接业务收益）
```
gain[1] = usersM4    × freq × 单次价值
gain[2] = usersM5    × freq × 单次价值
gain[3] = usersM5    × freq × 单次价值     ← ⚠ 原版此处用 usersM5（非 usersM6），保留
gain[4] = usersM7M12 × freq × 单次价值 × 3
gain[5] = usersM7M12 × freq × 单次价值 × 3
gain[6] = usersM13   × freq × 12 × 单次价值 × discountRate
gain[7] = usersM13   × freq × 12 × 单次价值 × discountRate²
```

## 4. 汇总口径

```
costByTimeFrame[i]   = mvpBasicModel[i]+mvpDev[i]+mvpFineTuning[i]+productDev[i]+productMaintenance[i]+productFineTuning[i]+private[i]+cloud[i]
benefitByTimeFrame   = monthlyEfficiencyGain（同一数组）

y1TotalCost = [0] 的 MVP 三项 + productDev[1..5] + productMaintenance[1..5] + productFineTuning[4] + cloud[1..5]
y2TotalCost = productDev[6] + productMaintenance[6] + cloud[6]
y3TotalCost = productDev[7] + productMaintenance[7] + cloud[7]
totalCost   = y1+y2+y3

y1TotalBenefit = gain[1..5] 之和
y2TotalBenefit = gain[6]
y3TotalBenefit = gain[7]
totalBenefit   = 三者之和

y1NetBenefit  = y1TotalBenefit − y1TotalCost
totalNetBenefit = totalBenefit − totalCost
```

## 5. 关键指标

```
ROI(%) = totalCost > 0 ? (totalNetBenefit / totalCost) × 100 : 0
```

**回收期（月度展开 + 线性插值）：**
1. 把每段的 `costByTimeFrame[i]` 与 `benefitByTimeFrame[i]` 除以该段月数，展开为 36 个「月成本 / 月收益」。
2. 逐月累加 `净现金流 = 月收益 − 月成本`，得 36 个 `cumulativeNetCashFlow`。
3. 找第一个 ≥ 0 的月份 `i`（1-based 显示）：
   - 若前一个月为负 → `payback = i + |prevCF| / (currCF − prevCF)`（线性插值得到小数月）；
   - 否则 `payback = i`。
4. 36 个月内未回本 → `payback = 36`。

## 6. 原版行为陷阱（必须保留，勿自作主张修正）

1. Mon#6 收益用 `usersM5`（见 §3 标注）。
2. 推理成本只用云端单价；私有化数组全 0。
3. 产品化微调一次性落在 M7-M9 段（index 4），而非 Y2/Y3。
4. 折现率作为「年度乘子」（1.05/年），Y2 ×1、Y3 ×2，不做月度折现；NPV 在原版中被注释掉，不计算。
5. `usersByMonth`、`totalUsers`、`evaluationPeriod` 在计算中**未参与公式**（仅 UI 展示/占位），可忽略。

## 7. 输出字段（ROIResult，供报告映射）

成本数组：`mvpBasicModelCost / mvpDevCost / mvpFineTuningCost / productDevCost / productMaintenanceCost / productFineTuningCost / inferenceModelCostPrivate / inferenceModelCostCloud`（各 8 元）
汇总：`y1TotalCost / y2TotalCost / y3TotalCost / totalCost / y1TotalBenefit / y2TotalBenefit / y3TotalBenefit / totalBenefit / y1NetBenefit / totalNetBenefit / roi / paybackPeriod`
时间序列：`timeFrames / costByTimeFrame / benefitByTimeFrame / cumulativeNetCashFlow`
