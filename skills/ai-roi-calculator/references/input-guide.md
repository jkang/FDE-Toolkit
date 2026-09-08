# 参数收集指南（ScenarioInput / EnterpriseParams）

> 阅读提示：本文件同时覆盖 **v1（原版）** 与 **v2（专业核算）**。默认用 v2。
> v1 字段默认值见 `formulas.md`；v2 字段默认值见本文件与 `pro-model.md`。

## 一、场景输入字段（ScenarioInput）

「AI 名称 / 用户群 / 核心问题 / 产品形态 / 方案 / idea」等描述性字段用于报告上下文，不参与公式。
**加粗编号为真正参与公式的数值字段**。

### 1.1 用户 / 收益（v1 与 v2 通用）

| # | 字段 | 含义（单位） | v1 默认 | v2 默认 | 取值建议口径 |
| --- | --- | --- | --- | --- | --- |
| 1 | `evaluationPeriod` | 评估期（月） | 36 | 36 | 固定 36，勿改 |
| 2 | `totalUsers` | 总目标用户（人） | 1000 | 1000 | 仅展示，不参与公式 |
| 3 | `usersM4` | M4 上线首月活跃用户（人） | 100 | 100 | 首批试点/种子用户 |
| 4 | `usersM5` | M5 月用户数（人） | 200 | 200 | 早期采用者爬坡 |
| 5 | `usersM6` | M6 月用户数（人） | 200 | 200 | v2 收益用此值；v1 收益误用 usersM5 |
| 6 | `usersM7M12` | M7-M12 稳定期月用户数（人） | 1000 | 1000 | 成长期稳定规模 |
| 7 | `usersM13` | Y2 起稳态月用户数（人） | 5000 | 5000 | **按"高活跃用户"口径，非目标用户** |
| 8 | `usageFrequency` | 每用户月使用频次（次/月） | 30 | 30 | 工具型 20~40；辅助型 5~15 |
| 9 | `timeSaved` | 每次节省工时（小时） | 0.6 | 0.6 | 单次任务节省时间下沿 |
| 10 | `businessValue` | 每次直接业务收益（元） | 0 | 0 | 无法量化取 0 |
| 11 | `benefitScalingFactor` | 收益成就系数（v2 新增） | — | 0.85 | 早期/高风险项目 0.6~0.7 |

### 1.2 token 消耗（v2 拆分；v1 用 `tokenPerUse`）
| # | 字段 | 含义（单位） | v1 | v2 默认 | 口径 |
| --- | --- | --- | --- | --- | --- |
| 12 | `inputTokensPerUse` | 每次输入 tokens（百万） | — | 0.03 | ≈3 万（含上下文） |
| 13 | `outputTokensPerUse` | 每次输出 tokens（百万） | — | 0.005 | ≈5 千（生成回答） |
| — | `tokenPerUse` | v1 统一单次消耗（百万） | 0.1 | — | 仅 v1/legacy |

### 1.3 能力构建 / 团队（v1、v2 共用）
| # | 字段 | 含义（单位） | v1 默认 | v2 默认 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 14 | `mvpVerificationInput` | 是否先做 MVP（1/0） | 1 | 1 | 是=1（产生 Mon1-3 MVP 成本） |
| 15 | `y1TeamSize` | Y1 产品化团队（人） | 6 | 6 | 需求→研发→测试折算 |
| 16 | `y2TeamSize` | Y2 团队（人） | 3 | 3 | 维护+迭代 |
| 17 | `y3TeamSize` | Y3 团队（人） | 1.5 | 1.5 | 可小数 |
| 18 | `mvpModel` | MVP 微调次数（次） | 3 | 3 | 训练轮次/数据版本 |
| 19 | `productModel` | 产品化微调次数（次） | 3 | 3 | 落在 M7-M9 段 |
| 20 | `iterTeamSize` | 持续迭代工程师（人，v2 新增） | — | 2 | 持续优化/调优人力 |

### 1.4 估算策略（用户没给数时）
- **用户数成长曲线**：`usersM13` 用**高活跃用户**（= 目标用户 × 实际渗透率，通常 10%~30%）。`usersM7M12≈usersM13×20%~40%`；M4/M5 为前两者零头。**切勿把"目标用户"直接当 `usersM13`。**
- **省时收益**：单次原耗时 × 可压缩比例（审查 2h → 省 60~80%，取保守下沿 1.2~1.6h）。
- **业务价值**：能从场景读出的量化收益放 `businessValue`；否则 0，避免高估。
- **频次**：工具型高频 20~40 次/月；辅助型 5~15 次/月。
- v2 场景下结合 `benefitScalingFactor`（0.6~0.85）对收益打折，吸收不确定性与渗透不足。

## 二、企业参数（EnterpriseParams）

### 2.1 v1 原版默认（legacy，仅对照）
来自 `defaultEnterpriseParams`：基础模型月成本 5000、微调 5 万/次、`publicApiCost=10`、运维 2万/2万/1万、MVP 周期 3、MVP 月投入 50 万、`internalDevCost=40万/人月`、`externalDevCost=20万/人月`、时薪 125、折现率 1.05。

### 2.2 v2 专业默认（推荐）— 见 `pro-model.md`
关键差异：token 拆分 `inputTokenCost=5 / outputTokenCost=15`、人月成本 4.5万/2.5万、团队比例 7:3、新增**数据治理 / 业务集成 / 持续迭代 / 基础设施 / 合规安全** 模块默认值、`benefitScalingFactor=0.85`、可选 `computeNpv`。

| 模块 | v2 字段 | 默认（元） |
| --- | --- | --- |
| 数据治理（一次性） | `dataCollectionCost` / `dataCleaningCost` / `dataAnnotationCost` | 50000 / 30000 / 80000 |
| 数据治理（持续/月） | `dataMonthlyGovernanceCost` | 10000 |
| 集成（一次性） | `integrationApiDevCost` / `integrationThirdPartyCost` | 120000 / 50000 |
| 集成（持续/月） | `integrationMonthlyOpsCost` | 5000 |
| 基础设施（持续/月） | `infraComputeCost` | 20000 |
| 迭代优化（持续） | `iterTeamSize`（人） / `evalQualityMonthlyCost`（元/月） | 2 / 20000 |
| 合规安全 | `complianceSetupCost`（一次） / `complianceMonthlyCost`（持续/月） | 60000 / 8000 |

覆盖原则：仅当用户提供企业真实口径（招投标价、人月单价表、算力账单、API 合同）时替换；替换后须在报告的假设清单注明「企业参数已自定义」。默认值即"保守中等配置"。

## 三、从「AI 场景定义」Markdown 自动映射

典型场景定义文档含以下章节（本项目 markdown-parser.ts 的口径）：

| Markdown 章节 | 映射字段 |
| --- | --- |
| `# 标题` | `aiName` |
| `**场景描述:** …` | `coreProblem` |
| `### 用户角色` | `userGroup`、`targetUsers` |
| `### 用户痛点` | `coreProblem`（覆盖场景描述，取痛点更精准） |
| `### 产品形态` | `productForm` |
| `### AI 输入` + `### AI 输出` + `### 处理流程` + `### 数据/知识` + `### 工具调用` | `solution`（拼接为方案要素） |
| `### 业务收益` | `solution` 追加；其中 `(\d+)%` → `businessValue` |
| `### 产品化要点` | `idea` |

## 四、向用户确认的最小问题集（一次问完，避免来回）

当输入缺口较多时，优先确认这 7 个最关键假设（其余用默认 + ⚠ 标注）：
1. 稳态**高活跃用户** `usersM13`（或目标用户总量 + 实际渗透率）？
2. 每用户每月使用频次 `usageFrequency`？
3. 单次节省工时 `timeSaved`？目标用户时薪（默认 125）？
4. 单次可量化的业务价值 `businessValue`（元）？
5. 单次 token 消耗量级（默认输入 3 万 / 输出 5 千，可按场景调）？
6. 要不要先做 3 个月 MVP 验证 `mvpVerificationInput`？MVP 与产品化各微调几次？
7. 三年研发团队规模（Y1/Y2/Y3）？是否需要补充数据治理 / 业务集成 / 持续迭代人力？

若用户明确表示"按默认帮我估"，则跳过确认，直接以 v2 默认值计算并在报告中列出假设清单。
