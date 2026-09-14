---
name: ai-roi-calculator
description: "复刻自 jkang/ai-roi-calculator 的企业 AI 场景 ROI 测算技能。当用户要求计算 AI 项目或场景的投资回报率(ROI)、净收益、回收期、成本收益分析，粘贴 AI 场景定义 Markdown 要求测算商业价值，或在 AI 立项评审前询问这个 AI 值不值得做、投多少、几年回本并期待量化财务结论时使用。按 36 个月分段口径输出分时间段成本收益明细表、ROI 与回收期判定、决策建议。触发词包括：ROI 计算、投资回报、回收期、成本收益、AI 项目测算、商业价值量化。"
author: KK
---

# AI ROI 计算器（复刻自 jkang/ai-roi-calculator）

对企业 AI 场景做 **3 年（36 个月）投资回报测算**：把场景的「用户规模 / 使用频次 / 效率收益 / 模型算力 / 研发运维投入」等假设，折算为分时间段的成本与收益，最终输出 **ROI、净收益、回收期、总成本** 四大指标，以及 8 个时间段的成本收益明细表与决策解读。

本 skill 是开源项目 [jkang/ai-roi-calculator](https://github.com/jkang/ai-roi-calculator)（`lib/calculate-roi.ts`）计算逻辑的**逐行忠实复刻**，公式、时间段划分、默认参数与边界行为与原版完全一致，并附零依赖可执行参考脚本供精确计算与回归验证。

**触发场景（Triggers）：** 用户要求计算 AI 项目/场景的 ROI、投资回报率、回收期、成本收益分析；粘贴「AI 场景定义」Markdown 要求测算商业价值；在 AI 项目立项/评审前做财务可行性测算；询问「这个 AI 场景值不值得做 / 投多少钱 / 几年回本」并期待量化结论时。
不要用于：纯 UX/PRD 讨论、不涉及金额假设的泛泛问答。

## 目录结构

| 文件 | 用途 |
| --- | --- |
| `references/formulas.md` | v1 计算模型规范（原版逐行复刻公式、时间段、行为陷阱） |
| `references/pro-model.md` | **v2 专业完整核算**（参数量级修正 + 数据治理/集成/迭代/基础设施/合规 + NPV） |
| `references/input-guide.md` | 输入字段清单、默认值、估算建议与缺省处理策略 |
| `scripts/calculate-roi.mjs` | 零依赖 Node 参考实现（`--mode pro` 默认 / `--mode legacy` 还原原版） |
| `test/expected-*.json` | 回归基线：`expected-default`/`expected-variant` 为 v1（与原版 TS 逐字段一致）；`expected-pro-default` 为 v2 修正口径基线 |

## 输出路径与命名规范（Output Path & Naming Convention）

- **目录**：产物按两层目录落位——若测算针对**具体 AI 场景**（对某场景画布/机会点做 ROI 测算），输出到 `<公司/业务名>/<场景名>/` 场景子目录；若仅属公司/业务级评估（无场景归属），放 `<公司/业务名>/` 根目录。
- **文件名**：HTML 报告与结构化数据命名须反映对象与内容，建议格式 `[公司/业务名]-[场景名]-AI-ROI测算.html`（场景级）或 `[公司/业务名]-AI-ROI测算.html`（公司级）；结构化数据以 JSON 落盘时同名 `.json`。
- **命令示例**（在 `<公司/业务名>/<场景名>/` 下执行，或传入仓库内相对路径）：
  ```bash
  node <skill目录>/scripts/calculate-roi.mjs --input ./scenario-input.json \
       --html "./[公司/业务名]-[场景名]-AI-ROI测算.html" --json
  ```
- **禁止使用本机绝对路径**：产物一律写入本仓库内的 `<公司/业务名>/`（或 `<公司/业务名>/<场景名>/`）相对目录；`<skill目录>` 在命令中表示本 skill 在仓库内的相对位置。

## 工作流程

### 第 0 步：判断输入形态
- 用户若给出一份「AI 场景定义」Markdown（含 `**场景描述:**`、`### 用户角色`、`用户痛点`、`产品形态`、`AI 输入/输出`、`处理流程`、`业务收益`、`产品化要点` 等章节）：先用其中的文本映射场景描述字段（参照 `references/input-guide.md` 的映射表），再进入数值假设收集。
- 用户若直接给数字/简要描述：整理成 ScenarioInput，缺口项按策略补齐。

### 第 1 步：收集 / 确认数值假设（ScenarioInput）
必须形成一份完整的数值字段集合（v1 约 17 项，v2 约 21 项），**并最终以清单形式呈现给用户**。优先级：
1. 用户明确给出的数字 → 直接采用。
2. 场景 Markdown 中能推断的（如业务收益中的百分比 → `businessValue`）→ 采用并注明推断依据。
3. 其余字段使用**估算默认值**（见 `references/input-guide.md` 每行默认值），但在输出报告里用「假设清单」明确列出，供用户复核。
   - v2 场景中，**token 消耗、人月成本、收益成就系数** 请特别确认，因它们决定成本与收益的量级。

> 规则：**绝不静默瞎猜后不声明**。估算值必须可被用户一眼看到并替换。若用户提供了 `mvpVerification` 为「是/否」，同步设置 `mvpVerificationInput = 1 / 0`。

### 第 2 步：确定企业参数（EnterpriseParams）

**默认走 v2 专业核算（`--mode pro`）**，使用 `references/pro-model.md` 中专家修订后的默认参数——
- token 费用已**拆分输入/输出单价与消耗量**（修正 v1 单次 1 元偏高的缺陷）；
- 人力成本已改为**合理人月口径**（自有人力 4.5 万/人/月、外包 2.5 万/人/月，修正 v1 40 万/人/月的量级错误）；
- 新增**数据治理 / 业务集成 / 持续迭代优化 / 基础设施 / 合规安全**等完整成本维度。

仅当用户明确提供企业级设置（API 合同价、人月单价、算力账单等）时覆盖；覆盖后须在假设清单注明「企业参数已自定义」。
若用户明确要求"按原版口径 / 与开源工具一致"，则改用 `--mode legacy` 走 v1（`references/formulas.md`）。

### 第 3 步：计算（二选一，推荐 A）

**A. 运行参考脚本（首选，保证精确）：**
```bash
# 默认：v2 专业完整核算（推荐）
node <skill目录>/scripts/calculate-roi.mjs --input ./scenario-input.json --json
# 自定义企业参数
node <skill目录>/scripts/calculate-roi.mjs --input ./scenario-input.json --params ./enterprise-params.json --json
# 输出完整 HTML 报告（单文件、可打印）
node <skill目录>/scripts/calculate-roi.mjs --input ./scenario-input.json --html ./roi-report.html
# 如需与原版完全一致（v1）
node <skill目录>/scripts/calculate-roi.mjs --input ./scenario-input.json --mode legacy --json
node <skill目录>/scripts/calculate-roi.mjs --input ./scenario-input.json --mode legacy --html ./roi-report.html
```
脚本输出与对应版本结果完全同构：8 段时间成本数组、`costByTimeFrame`、`benefitByTimeFrame`、年度汇总、`roi`、`paybackPeriod`、`cumulativeNetCashFlow`；v2 额外含成本构成数组（数据治理/集成/迭代/基础设施/合规）与 `npv`。
`--html [file]` 生成**完整 HTML 报告**（内联样式、离线可打印），含：关键指标卡片、年度汇总、8 段时间成本收益明细、成本构成条形（v2）、关键假设清单、结论与决策建议。不给文件名则输出到 stdout。

**B. 环境无 Node 时手动计算：**
strict 按 `references/pro-model.md`（v2）或 `references/formulas.md`（v1）的分段公式手算，保留逐步中间值。最终关键值保留 2 位小数。

无论 A/B，请在最终报告中说明所用模式（v1 原版 / v2 专业）与计算方式。

### 第 4 步：输出 ROI 分析报告（对齐 App UI 的完整 HTML）

**推荐：生成完整 HTML 报告**（`--html`），脚本内置**固化模板**（CSS 变量统一配色/留白/圆角/阴影，所有报告布局与样式完全一致），**全宽**（占满页面宽度），完全对齐 ai-roi-calculator App 的结果页 UI：

1. **顶部栏**：品牌 + 场景按钮 + 下载报告（sticky、毛玻璃）
2. **标题区**：场景名 + 模式徽标（v1 原版 / v2 专业）
3. **关键财务指标卡**：投资回报率(ROI) / 项目总成本(净收益) / 回收期 / 项目总成本(累计投入)（v2 另有 NPV）
4. **Tab 切换**：成本收益表 | ROI 分析图表
5. **成本收益估算表**：成本项 × 8 时间段矩阵（Mon#1-3…#25-36）+ 年度累计（第一/二/三年、累计总成本）+ 收益表（效益提升收益、年度累计、累计净收益(1年/3年)、ROI平衡点）
6. **ROI 分析图表**（内联 SVG，无外部依赖、全宽响应式）：成本与收益趋势（柱状）、累计净现金流与回收期（面积，含回收期红线）、成本分布（饼图+图例）、敏感性分析-ROI变化（折线，用户/效率 ±20%）
7. **数据解释与解读**：关键指标解读（ROI/回收期判定卡片）、图表解读（折叠 accordion）、决策建议
8. **关键假设清单**

**完整报告脚本已自动实现，无需手写**。模板固化点：`renderFullReport()`（结构 + `:root` CSS 变量 + 4 个 SVG 图表 `renderTrend/renderCash/renderPie/renderSens`）。任何场景/v1/v2 输出均走同一模板，保证布局一致。生成后，再把**关键结论**用 Markdown 在对话里简要给用户。

**对话给用户的 Markdown 摘要**：
```markdown
# {AI 名称} — ROI 分析摘要
> 模式：v2 专业核算 ｜ 完整报告见 `roi-report.html`

| 指标 | 数值 | 解读 |
| --- | --- | --- |
| ROI | **{roi.toFixed(0)}%** | {判定} |
| 项目总成本(净收益) | ¥{totalNetBenefit:,.0f} | — |
| 回收期 | {paybackPeriod.toFixed(1)} 个月 | {判定} |
| 项目总成本(累计投入) | ¥{totalCost:,.0f} | — |
```
再按假设清单给一句假设提示，并给出结论建议。

判定表（沿用原版 results 页面逻辑）：
- **ROI** ≥100% → 非常优秀；≥50% → 良好，值得投资；≥20% → 一般，可考虑；0~20% → 较低需谨慎；<0 → 负值不建议。
- **回收期** ≤12 个月 → 非常快；≤24 → 良好；≤36 → 一般；>36 → 较长需长期规划。

> **高 ROI 预警**：若算出 ROI 非常高（如>500%），先检查 `usersM*`（应按"高活跃用户"口径、而非"目标用户"）与 `benefitScalingFactor`（0.6~0.85）是否过乐观——见 `references/pro-model.md` §5。

### 第 5 步（可选）：敏感性速算
用户关注风险时，对 `usersM*`（同比例缩放）与「效率收益」（`timeSaved`/`businessValue`）做 ±20% 场景：直接在输入 JSON 上改数重跑脚本，输出 基准/用户∓20%/用户±20%/效率∓20%/效率±20% 的 ROI 对比表（原版图表亦按此 ±20% 口径）。

## 硬性规则
1. **模式不混用**：v1 与 v2 结果不可放在同一报告并排展示（口径不同）。上报时注明 `v1 原版` 或 `v2 专业核算`。
2. **v1 行为须照旧（不"修正"）**：
   - Mon#6 收益段（index 3）使用 `usersM5` 而非 `usersM6`；
   - `inferenceModelCostPrivate` 恒为 0；
   - 产品化微调落在 M7-M9（index 4）；
   - Y1 研发 = `团队 × 50% × internal + 团队 × 50% × external`；
   - 折现率按年度乘子（Y2×1、Y3×2），NPV 不计算；
   - ROI 仅当 `totalCost>0` 有定义；回收期 36 个月内未回本返回 36。
3. **v2 修正点（与 v1 对比时勿用 v1 话术）**：
   - Mon#6 收益用 `usersM6`；
   - token 拆分输入/输出单价与消耗量；
   - 人月成本改为合理值并支持自有/外包比例；
   - 新增数据治理/集成/迭代/基础设施/合规成本项；
   - 收益乘 `benefitScalingFactor`；可选计算 NPV。
4. 报告金额用 `¥` + 千分位；百分比保留 1~2 位。
5. 不把成本收益项凭空"合并/美化"——明细字段名与上文表一致。

## 相关文件
- `references/pro-model.md` —— **v2 专业核算权威来源**（参数修正、新增维度、NPV、收益虚高预警）。
- `references/formulas.md` —— v1 原版公式权威来源（仅 legacy 模式/对照用）。
- `references/input-guide.md` —— 字段表、默认值与场景 Markdown 映射（含 v2 新字段）。
- `scripts/calculate-roi.mjs` —— 可直接执行；`--mode pro|legacy`；`--json` 输出机器可读结果。
- `test/` —— 回归基线；修改 v1 后运行 `node scripts/calculate-roi.mjs --mode legacy --json` 应与 `test/expected-default.json` 逐字段一致；修改 v2 后运行 `--json` 应与 `test/expected-pro-default.json` 一致。

---

## 输出呈现铁律（通用 · 强制）

> 产出是给**客户 / 业务方**看的最终报告，不是过程记录。以下五条**违反即返工**。

1. **语言**：一律用**严谨、克制的中文业务咨询语言**——有一说一；**有观点必给依据**（数据 / 规则 / 来源 / 口径）。禁止 AI 味大词与空话堆砌（「赋能、闭环、抓手、深度融合、全方位、数智化」等无实指表述）。
2. **禁止多余英文备注**：中文标题 / 小节后**不得**追加英文装饰（如「业务模式全景 BUSINESS MODEL LANDSCAPE」）。系统名 / 字段名 / 标准缩写（SAP、IF005、DOS、SKU、SLA）可保留；不造装饰性英文。
3. **只输出结论与依据**：**禁止**把过程讨论写进正文——与用户的对话 / 反馈、修订说明、`【不依据原始 idea】` 这类过程标注、跨行业类比的过程推理（如「与快消品的渠道逻辑不同」）、「待确认 / 此处待补 / 讨论点」等制作层信息，一律不进正文。
4. **口径与边界**：不确定的推断标 `[推断]` 并给依据；不臆造数据；假设与阈值标注「领域专家假设值 · 待访谈回填」。
5. **交付前自检**：逐段问「读者能否据此做决策 / 这是否属于我们内部讨论」——不能决策或属内部讨论的内容，删除或移出正文。
