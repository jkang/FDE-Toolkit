#!/usr/bin/env node
/**
 * ai-roi-calculator — 参考实现（纯 JS 零依赖）
 *
 * 逐行复刻自 https://github.com/jkang/ai-roi-calculator 的 lib/calculate-roi.ts。
 * 保持与原版完全一致的公式、时间段划分、数组下标与"保留原样"的行为，
 * 以便把 Web 应用里的 ROI 计算原样搬到离线/Agent 环境。
 *
 * 用法：
 *   node calculate-roi.mjs                       # 用默认场景+默认企业参数计算并打印
 *   node calculate-roi.mjs --input in.json       # 从 JSON 读 ScenarioInput
 *   node calculate-roi.mjs --input in.json --params p.json --json
 *
 * 文件说明（与原版一致）：
 *   input   = ScenarioInput  场景假设
 *   params  = EnterpriseParams 企业参数（可选，缺省用默认值）
 */

import { readFileSync, writeFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

// ---------------------------------------------------------------------------
// 默认企业参数（EnterpriseParams）——与原版 defaultEnterpriseParams 一致
// ---------------------------------------------------------------------------
export const DEFAULT_ENTERPRISE_PARAMS = {
  baseModelCost: 5000, // 月均基础模型算力成本(元)
  fineTuningCost: 50000, // 每次微调成本投入(元)
  publicApiCost: 10.0, // 公有云 API 调用 Token 单价(元/百万)
  privateTokenCost: 2, // 私有化推理成本 Token 单价(元/百万)
  y1MonthlyMaintenanceCost: 20000, // Y1 月均代运维成本(元)
  y2MonthlyMaintenanceCost: 20000, // Y2 月均代运维成本(元)
  y3MonthlyMaintenanceCost: 10000, // Y3 月均代运维成本(元)
  mvpDurationInMonths: 3, // MVP 研发周期(月)
  mvpMonthlyCost: 500000, // MVP 月均研发投入(元)
  internalDevCost: 400000, // 研发自有人力月均投入(元)
  externalDevCost: 200000, // 研发外包人力月均投入(元)
  hourlyRate: 125, // 人员平均时薪(元/小时)
  discountRate: 1.05, // 折现率(每年，作为乘子；Y2 乘 1 次、Y3 乘 2 次)
}

// ---------------------------------------------------------------------------
// 默认场景输入（ScenarioInput）——与原版 defaultScenarioInput 一致
// ---------------------------------------------------------------------------
export const DEFAULT_SCENARIO_INPUT = {
  aiName: "智能文档小助手",
  userGroup: "帮助产品经理在需求定制前，补充完善可行性的边界探测，并提议处理逻辑，完善需求文档内容",
  coreProblem: "帮助产品经理在需求定制前，补充完善可行性的界探测，并提议处理逻辑，完善需求文档内容",
  productForm:
    "用户端 - 飞书机器人/微信体验应用；中台-知识库（功能和创新、设置检索）；后端 - 集体Workflow及插排-通用体验Agent",
  solution:
    "用户端 - 飞书机器人/微信体验应用；中台-知识库（功能和创新、设置检索）；后端 - 集体Workflow及插排-通用体验Agent",
  idea: "手动产品化，以重要为点点及相关联构建测试数据集，进行MVP验证",
  mvpVerification: "否",
  evaluationPeriod: 36,
  targetUsers: "[描述用户群体/范围]",
  totalUsers: 1000,
  usersM4: 100,
  usersM5: 200,
  usersM6: 200,
  usersM7M12: 1000,
  usersM13: 5000,
  usageFrequency: 30,
  timeSaved: 0.6,
  businessValue: 0,
  tokenPerUse: 0.1,
  mvpVerificationInput: 1,
  y1TeamSize: 6,
  y2TeamSize: 3,
  y3TeamSize: 1.5,
  mvpModel: 3,
  productModel: 3,
  privateDeployment: 0,
  cloudApi: 1,
}

// ===========================================================================
// v2 —— 专业完整核算（专家修正版）
// 在 v1 基础上：① 拆分 token 输入/输出单价与消耗量；② 修正人月成本量级与
// 自有/外包分工比例；③ 补齐数据治理 / 业务上下游集成 / 持续迭代优化 /
// 基础设施 / 合规安全 等真实项目成本项；④ 提供收益成就系数与可选 NPV。
// 需要理解：v2 是"修正口径"，它修复了 v1 的若干已知缺陷（见 references/pro-model.md）。
// ===========================================================================

// 企业参数（v2）——专家修订默认值
export const DEFAULT_ENTERPRISE_PARAMS_PRO = {
  // 算力 / token
  baseModelCost: 3000, // 月均基础模型算力成本(元/月)
  fineTuningCost: 30000, // 单次微调投入(元/次)
  inputTokenCost: 5, // 输入 token 单价(元/百万)
  outputTokenCost: 15, // 输出 token 单价(元/百万)
  infraComputeCost: 20000, // 持续基础算力/GPU/云资源(元/月，非token)

  // IT 运维
  y1MonthlyMaintenanceCost: 20000,
  y2MonthlyMaintenanceCost: 20000,
  y3MonthlyMaintenanceCost: 10000,

  // 研发与产品化（人月成本采用"人/月"口径）
  mvpDurationInMonths: 3,
  mvpMonthlyCost: 300000, // MVP 月均研发投入(元/月)
  internalDevCost: 45000, // 自有研发人力人月成本(元/人/月)
  externalDevCost: 25000, // 外包/驻场人力人月成本(元/人/月)
  internalStaffRatio: 0.7, // 现有团队中自有研发比例
  externalStaffRatio: 0.3, // 现有团队中外包比例
  // 迭代工程师（持续优化）
  iterTeamSize: 2, // 持续迭代/优化工程师人数
  evalQualityMonthlyCost: 20000, // 评测/回归/监控(元/月)

  // 数据治理
  dataCollectionCost: 50000, // 一次性：数据采集
  dataCleaningCost: 30000, // 一次性：数据清洗/标准化
  dataAnnotationCost: 80000, // 一次性：数据标注/质检
  dataMonthlyGovernanceCost: 10000, // 持续：数据质量治理(元/月)

  // 业务上下游集成
  integrationApiDevCost: 120000, // 一次性：集成/接口开发联调
  integrationThirdPartyCost: 50000, // 一次性：第三方系统/中间件许可
  integrationMonthlyOpsCost: 5000, // 持续：集成接口运维(元/月)

  // 合规 / 安全
  complianceSetupCost: 60000, // 一次性：合规/安全/审计建设
  complianceMonthlyCost: 8000, // 持续：合规审计(元/月)

  // 财务
  hourlyRate: 125, // 人员平均时薪(元/小时)
  discountRate: 1.05, // 折现率乘子(年)
  benefitScalingFactor: 0.85, // 收益成就系数(对理想价值的折减，应对不确定性)
  computeNpv: true, // 是否计算 NPV
}

// 场景输入（v2）默认值 —— 覆盖 v1 的 token 消耗与 team 假设为新口径
export const DEFAULT_SCENARIO_INPUT_PRO = {
  ...DEFAULT_SCENARIO_INPUT,
  // token 消耗拆分（v1 的 tokenPerUse=0.1M 过高，拆成输入/输出更贴近现实）
  tokenPerUse: undefined, // v1 兼容位（v2 不再用，保留字段名避免 keys 报错）
  inputTokensPerUse: 0.03, // 每次输入 tokens(百万) ≈ 3 万（含上下文）
  outputTokensPerUse: 0.005, // 每次输出 tokens(百万) ≈ 5 千（生成回答）
}

// 时间段月数常量
const TIME_FRAME_MONTHS = [3, 1, 1, 1, 3, 3, 12, 12]

// 统一处理"某段时间的持续成本"：月成本 × 段月数，Y2/Y3 分别折现
function spreadingMonthlyCost(monthly, index, discountRate, months) {
  if (index <= 5) return monthly * months // Y1 不折现
  if (index === 6) return monthly * months * discountRate // Y2 × 1 次
  return monthly * months * discountRate * discountRate // Y3 × 2 次
}

// v2 完整核算：在 v1 基础上扩展成本维度、拆分 token、修正人月成本与收益折减
export function calculateROIPro(inputRaw, paramsRaw) {
  const input = { ...inputRaw }
  const params = { ...DEFAULT_ENTERPRISE_PARAMS_PRO, ...(paramsRaw || {}) }

  // NaN 清理
  Object.keys(input).forEach((k) => {
    if (typeof input[k] === "number" && Number.isNaN(input[k])) input[k] = 0
  })

  const timeFrames = [
    "Mon#1-Mon#3",
    "Mon#4",
    "Mon#5",
    "Mon#6",
    "Mon#7-Mon#9",
    "Mon#10-Mon#12",
    "Mon#13-Mon#24",
    "Mon#25-Mon#36",
  ]

  // ---- 基础成本项（沿用 v1 口径的：MVP / 产品化研发 / IT 运维 / 产品化微调）----
  const mvpBasicModelCost = Array(8).fill(0)
  const mvpDevCost = Array(8).fill(0)
  const mvpFineTuningCost = Array(8).fill(0)
  const productDevCost = Array(8).fill(0)
  const productMaintenanceCost = Array(8).fill(0)
  const productFineTuningCost = Array(8).fill(0)
  const inferenceModelCostPrivate = Array(8).fill(0)
  const inferenceModelCostCloud = Array(8).fill(0)

  // ---- v2 新增成本项 ----
  const dataGovernanceOneTime = Array(8).fill(0) // 一次性数据治理
  const dataGovernanceOngoing = Array(8).fill(0) // 持续数据治理
  const integrationOneTime = Array(8).fill(0) // 一次性集成
  const integrationOngoing = Array(8).fill(0) // 持续集成运维
  const iterationCost = Array(8).fill(0) // 持续迭代优化(工程师+评测)
  const infraCost = Array(8).fill(0) // 基础设施算力
  const complianceCost = Array(8).fill(0) // 合规安全(一次性+持续)
  const oneTimeCost = Array(8).fill(0) // 一次性成本折合计

  const monthlyEfficiencyGain = Array(8).fill(0)

  // ---- MVP 成本（index 0 前 3 个月，同 v1）----
  if (input.mvpVerificationInput === 1) {
    mvpBasicModelCost[0] = params.baseModelCost * params.mvpDurationInMonths
    mvpDevCost[0] = params.mvpMonthlyCost * params.mvpDurationInMonths
    mvpFineTuningCost[0] = params.fineTuningCost * (input.mvpModel || 0)
  }

  // ---- 产品化研发（修正人月口径 + 分工比例）----
  // 人月混合单价 = 自有比例×自有单价 + 外包比例×外包单价
  const mixedMonthlyPerPerson =
    params.internalStaffRatio * params.internalDevCost + params.externalStaffRatio * params.externalDevCost
  const y1DevCostMonthly = (input.y1TeamSize || 0) * mixedMonthlyPerPerson
  productDevCost[1] = y1DevCostMonthly
  productMaintenanceCost[1] = params.y1MonthlyMaintenanceCost
  productDevCost[2] = y1DevCostMonthly
  productMaintenanceCost[2] = params.y1MonthlyMaintenanceCost
  productDevCost[3] = y1DevCostMonthly
  productMaintenanceCost[3] = params.y1MonthlyMaintenanceCost
  productDevCost[4] = y1DevCostMonthly * 3
  productMaintenanceCost[4] = params.y1MonthlyMaintenanceCost * 3
  productDevCost[5] = y1DevCostMonthly * 3
  productMaintenanceCost[5] = params.y1MonthlyMaintenanceCost * 3
  // Y2/Y3：全年人力(×12) + 折现
  productDevCost[6] = (input.y2TeamSize || 0) * mixedMonthlyPerPerson * 12 * params.discountRate
  productMaintenanceCost[6] = params.y2MonthlyMaintenanceCost * 12 * params.discountRate
  productDevCost[7] = (input.y3TeamSize || 0) * mixedMonthlyPerPerson * 12 * params.discountRate * params.discountRate
  productMaintenanceCost[7] = params.y3MonthlyMaintenanceCost * 12 * params.discountRate * params.discountRate

  // 产品化微调 —— v2 保留落在 M7-M9 段（index 4），企业常在上线后半年内做
  if ((input.productModel || 0) > 0) {
    productFineTuningCost[4] = params.fineTuningCost * input.productModel
  }

  // ---- 一次性成本（准备/上线前投入，计入 index 0，不折现）----
  const dataOneTimeTotal =
    params.dataCollectionCost + params.dataCleaningCost + params.dataAnnotationCost
  const integrationOneTimeTotal = params.integrationApiDevCost + params.integrationThirdPartyCost
  const complianceOneTimeTotal = params.complianceSetupCost
  oneTimeCost[0] = dataOneTimeTotal + integrationOneTimeTotal + complianceOneTimeTotal
  dataGovernanceOneTime[0] = dataOneTimeTotal
  integrationOneTime[0] = integrationOneTimeTotal
  complianceCost[0] = complianceOneTimeTotal

  // ---- 持续成本（每月，按段展开 + 折现）----
  const monthlyIteration = (input.iterTeamSize ?? params.iterTeamSize) * mixedMonthlyPerPerson + params.evalQualityMonthlyCost
  const monthlyDataGov = params.dataMonthlyGovernanceCost
  const monthlyIntegration = params.integrationMonthlyOpsCost
  const monthlyInfra = params.infraComputeCost
  const monthlyCompliance = params.complianceMonthlyCost

  for (let i = 0; i < 8; i++) {
    const m = TIME_FRAME_MONTHS[i]
    dataGovernanceOngoing[i] = spreadingMonthlyCost(monthlyDataGov, i, params.discountRate, m)
    integrationOngoing[i] = spreadingMonthlyCost(monthlyIntegration, i, params.discountRate, m)
    iterationCost[i] = spreadingMonthlyCost(monthlyIteration, i, params.discountRate, m)
    infraCost[i] = spreadingMonthlyCost(monthlyInfra, i, params.discountRate, m)
    complianceCost[i] += spreadingMonthlyCost(monthlyCompliance, i, params.discountRate, m)
  }

  // ---- 推理成本（拆分输入/输出单价）----
  const perUseTokenCost =
    (input.inputTokensPerUse ?? 0) * params.inputTokenCost +
    (input.outputTokensPerUse ?? 0) * params.outputTokenCost
  const freq = input.usageFrequency || 0
  const cloudMonthIdxMap = { 1: input.usersM4, 2: input.usersM5, 3: input.usersM6, 4: input.usersM7M12, 5: input.usersM7M12, 6: input.usersM13, 7: input.usersM13 }
  for (let i = 1; i <= 7; i++) {
    const users = cloudMonthIdxMap[i] || 0
    const m = TIME_FRAME_MONTHS[i]
    // 折现与成本其它项一致：index6/7 折现
    const disc = i >= 6 ? (i === 6 ? params.discountRate : params.discountRate ** 2) : 1
    inferenceModelCostCloud[i] = users * freq * perUseTokenCost * m * disc
  }

  // ---- 收益（效率提升 × 成就系数）----
  // 单次价值 = 省时×时薪 + 业务价值；v2 对 Mon#6 使用 usersM6（修正 v1 误用 usersM5）
  const unitValue = (input.timeSaved || 0) * params.hourlyRate + (input.businessValue || 0)
  const scaling = params.benefitScalingFactor
  const benefitUsers = [0, input.usersM4 || 0, input.usersM5 || 0, input.usersM6 || 0, input.usersM7M12 || 0, input.usersM7M12 || 0, input.usersM13 || 0, input.usersM13 || 0]
  for (let i = 1; i <= 7; i++) {
    const m = TIME_FRAME_MONTHS[i]
    const disc = i >= 6 ? (i === 6 ? params.discountRate : params.discountRate ** 2) : 1
    monthlyEfficiencyGain[i] = benefitUsers[i] * freq * unitValue * scaling * m * disc
  }

  // ---- 每时间段总成本 ----
  const costByTimeFrame = timeFrames.map(
    (_, i) =>
      mvpBasicModelCost[i] +
      mvpDevCost[i] +
      mvpFineTuningCost[i] +
      productDevCost[i] +
      productMaintenanceCost[i] +
      productFineTuningCost[i] +
      inferenceModelCostPrivate[i] +
      inferenceModelCostCloud[i] +
      dataGovernanceOneTime[i] +
      dataGovernanceOngoing[i] +
      integrationOneTime[i] +
      integrationOngoing[i] +
      iterationCost[i] +
      infraCost[i] +
      complianceCost[i],
  )

  // ---- 年度汇总 ----
  // Y1 = index 0..5 全量成本（含 v2 数据治理/集成/迭代/基础设施/合规的持续项），
  // 与 costByTimeFrame 保持一致，避免漏算 Y1 持续成本导致 ROI 被高估。
  const y1TotalCost = costByTimeFrame.slice(0, 6).reduce((sum, v) => sum + v, 0)
  const y2TotalCost = costByTimeFrame[6]
  const y3TotalCost = costByTimeFrame[7]
  const totalCost = y1TotalCost + y2TotalCost + y3TotalCost

  const benefitByTimeFrame = monthlyEfficiencyGain
  const y1TotalBenefit = benefitByTimeFrame[1] + benefitByTimeFrame[2] + benefitByTimeFrame[3] + benefitByTimeFrame[4] + benefitByTimeFrame[5]
  const y2TotalBenefit = benefitByTimeFrame[6]
  const y3TotalBenefit = benefitByTimeFrame[7]
  const totalBenefit = y1TotalBenefit + y2TotalBenefit + y3TotalBenefit

  const y1NetBenefit = y1TotalBenefit - y1TotalCost
  const totalNetBenefit = totalBenefit - totalCost
  const roi = totalCost > 0 ? (totalNetBenefit / totalCost) * 100 : 0

  const { cumulativeNetCashFlow, paybackPeriod } = calculatePaybackPeriod(timeFrames, costByTimeFrame, benefitByTimeFrame)

  // ---- 可选 NPV（月度折现）----
  let npv = null
  if (params.computeNpv) {
    const rAnnual = params.discountRate - 1
    const rMonthly = Math.pow(1 + rAnnual, 1 / 12) - 1
    // 展开月度净现金流
    const monthlyNet = []
    timeFrames.forEach((tf, i) => {
      const m = TIME_FRAME_MONTHS[i]
      const mc = costByTimeFrame[i] / m
      const mb = benefitByTimeFrame[i] / m
      for (let j = 0; j < m; j++) monthlyNet.push(mb - mc)
    })
    npv = monthlyNet.reduce((acc, cf, idx) => acc + cf / Math.pow(1 + rMonthly, idx + 1), 0)
  }

  return {
    mode: "pro",
    mvpBasicModelCost,
    mvpDevCost,
    mvpFineTuningCost,
    productDevCost,
    productMaintenanceCost,
    productFineTuningCost,
    inferenceModelCostPrivate,
    inferenceModelCostCloud,
    dataGovernanceOneTime,
    dataGovernanceOngoing,
    integrationOneTime,
    integrationOngoing,
    iterationCost,
    infraCost,
    complianceCost,
    oneTimeCost,
    y1TotalCost,
    y2TotalCost,
    y3TotalCost,
    totalCost,
    monthlyEfficiencyGain,
    y1TotalBenefit,
    y2TotalBenefit,
    y3TotalBenefit,
    totalBenefit,
    y1NetBenefit,
    totalNetBenefit,
    roi,
    paybackPeriod,
    npv,
    timeFrames,
    costByTimeFrame,
    benefitByTimeFrame,
    cumulativeNetCashFlow,
  }
}

// ---------------------------------------------------------------------------
// 主计算函数 —— 逻辑逐行对应 calculate-roi.ts 的 calculateROI()
// ---------------------------------------------------------------------------
export function calculateROI(inputRaw, paramsRaw) {
  // 输入校验/NaN 清理（对应原版 sanitize 段）
  const sanitizedInput = { ...inputRaw }
  Object.keys(sanitizedInput).forEach((key) => {
    const value = sanitizedInput[key]
    if (typeof value === "number" && Number.isNaN(value)) {
      sanitizedInput[key] = 0
    }
  })

  const params = { ...DEFAULT_ENTERPRISE_PARAMS, ...(paramsRaw || {}) }

  // 时间段定义（8 段，index 0..7）
  const timeFrames = [
    "Mon#1-Mon#3",
    "Mon#4",
    "Mon#5",
    "Mon#6",
    "Mon#7-Mon#9",
    "Mon#10-Mon#12",
    "Mon#13-Mon#24",
    "Mon#25-Mon#36",
  ]

  // 各类成本数组（按时间段）
  const mvpBasicModelCost = Array(timeFrames.length).fill(0)
  const mvpDevCost = Array(timeFrames.length).fill(0)
  const mvpFineTuningCost = Array(timeFrames.length).fill(0)
  const productDevCost = Array(timeFrames.length).fill(0)
  const productMaintenanceCost = Array(timeFrames.length).fill(0)
  const productFineTuningCost = Array(timeFrames.length).fill(0)
  const inferenceModelCostPrivate = Array(timeFrames.length).fill(0)
  const inferenceModelCostCloud = Array(timeFrames.length).fill(0)

  // 收益数组（按时间段）
  const monthlyEfficiencyGain = Array(timeFrames.length).fill(0)

  // ---- MVP 阶段成本（仅前 3 个月 = index 0）----
  // 仅在"需要 MVP 验证"(mvpVerificationInput===1) 时发生
  if (sanitizedInput.mvpVerificationInput === 1) {
    mvpBasicModelCost[0] = params.baseModelCost * params.mvpDurationInMonths
    mvpDevCost[0] = params.mvpMonthlyCost * params.mvpDurationInMonths
    mvpFineTuningCost[0] = params.fineTuningCost * sanitizedInput.mvpModel
    // Mon#4-Mon#6 的 MVP 成本保持为 0（数组默认值即为 0）
  }

  // ---- 产品化阶段成本 ----
  // Y1 "研发人月混合单价" = 一半自有 + 一半外包
  const y1DevCostMonthly =
    sanitizedInput.y1TeamSize * 0.5 * params.internalDevCost +
    sanitizedInput.y1TeamSize * 0.5 * params.externalDevCost

  // Mon#4 (i=1)
  productDevCost[1] = y1DevCostMonthly
  productMaintenanceCost[1] = params.y1MonthlyMaintenanceCost
  // Mon#5 (i=2)
  productDevCost[2] = y1DevCostMonthly
  productMaintenanceCost[2] = params.y1MonthlyMaintenanceCost
  // Mon#6 (i=3)
  productDevCost[3] = y1DevCostMonthly
  productMaintenanceCost[3] = params.y1MonthlyMaintenanceCost
  // Mon#7-Mon#9 (i=4)
  productDevCost[4] = y1DevCostMonthly * 3
  productMaintenanceCost[4] = params.y1MonthlyMaintenanceCost * 3
  // Mon#10-Mon#12 (i=5)
  productDevCost[5] = y1DevCostMonthly * 3
  productMaintenanceCost[5] = params.y1MonthlyMaintenanceCost * 3
  // Mon#13-Mon#24 (i=6) Y2：年度人力研发 × 折现率（1 次）
  productDevCost[6] =
    (sanitizedInput.y2TeamSize * 0.5 * params.internalDevCost * 12 +
      sanitizedInput.y2TeamSize * 0.5 * params.externalDevCost * 12) *
    params.discountRate
  productMaintenanceCost[6] = params.y2MonthlyMaintenanceCost * 12 * params.discountRate
  // Mon#25-Mon#36 (i=7) Y3：年度人力研发 × 折现率²
  productDevCost[7] =
    (sanitizedInput.y3TeamSize * 0.5 * params.internalDevCost * 12 +
      sanitizedInput.y3TeamSize * 0.5 * params.externalDevCost * 12) *
    params.discountRate *
    params.discountRate
  productMaintenanceCost[7] = params.y3MonthlyMaintenanceCost * 12 * params.discountRate * params.discountRate

  // 产品化阶段模型微调成本 —— 原版假设发生在 M7-M9 段（i=4）
  if (sanitizedInput.productModel > 0) {
    productFineTuningCost[4] = params.fineTuningCost * sanitizedInput.productModel
  }

  // ---- 推理模型成本（云端 API）----
  // 注：原版仅计算云端；inferenceModelCostPrivate 恒为 0
  // Mon#4 (i=1)
  inferenceModelCostCloud[1] =
    sanitizedInput.usersM4 * sanitizedInput.usageFrequency * sanitizedInput.tokenPerUse * params.publicApiCost
  // Mon#5 (i=2)
  inferenceModelCostCloud[2] =
    sanitizedInput.usersM5 * sanitizedInput.usageFrequency * sanitizedInput.tokenPerUse * params.publicApiCost
  // Mon#6 (i=3)
  inferenceModelCostCloud[3] =
    sanitizedInput.usersM6 * sanitizedInput.usageFrequency * sanitizedInput.tokenPerUse * params.publicApiCost
  // Mon#7-Mon#9 (i=4)
  inferenceModelCostCloud[4] =
    sanitizedInput.usersM7M12 * sanitizedInput.usageFrequency * sanitizedInput.tokenPerUse * 3 * params.publicApiCost
  // Mon#10-Mon#12 (i=5)
  inferenceModelCostCloud[5] =
    sanitizedInput.usersM7M12 * sanitizedInput.usageFrequency * sanitizedInput.tokenPerUse * 3 * params.publicApiCost
  // Mon#13-Mon#24 (i=6) Y2 × 12 × 折现率
  inferenceModelCostCloud[6] =
    sanitizedInput.usersM13 *
    sanitizedInput.usageFrequency *
    sanitizedInput.tokenPerUse *
    12 *
    params.publicApiCost *
    params.discountRate
  // Mon#25-Mon#36 (i=7) Y3 × 12 × 折现率²
  inferenceModelCostCloud[7] =
    sanitizedInput.usersM13 *
    sanitizedInput.usageFrequency *
    sanitizedInput.tokenPerUse *
    12 *
    params.publicApiCost *
    params.discountRate *
    params.discountRate

  // ---- 效率提升收益 ----
  // 收益 = 用户数 × 月使用频次 × (每次节省小时 × 时薪 + 单次业务收益)
  // Mon#4 (i=1)
  monthlyEfficiencyGain[1] =
    sanitizedInput.usersM4 *
    sanitizedInput.usageFrequency *
    (sanitizedInput.timeSaved * params.hourlyRate + sanitizedInput.businessValue)
  // Mon#5 (i=2)
  monthlyEfficiencyGain[2] =
    sanitizedInput.usersM5 *
    sanitizedInput.usageFrequency *
    (sanitizedInput.timeSaved * params.hourlyRate + sanitizedInput.businessValue)
  // Mon#6 (i=3) —— 注意原版这里用的是 usersM5（保留原样，不"修复"）
  monthlyEfficiencyGain[3] =
    sanitizedInput.usersM5 *
    sanitizedInput.usageFrequency *
    (sanitizedInput.timeSaved * params.hourlyRate + sanitizedInput.businessValue)
  // Mon#7-Mon#9 (i=4) × 3
  monthlyEfficiencyGain[4] =
    sanitizedInput.usersM7M12 *
    sanitizedInput.usageFrequency *
    (sanitizedInput.timeSaved * params.hourlyRate + sanitizedInput.businessValue) *
    3
  // Mon#10-Mon#12 (i=5) × 3
  monthlyEfficiencyGain[5] =
    sanitizedInput.usersM7M12 *
    sanitizedInput.usageFrequency *
    (sanitizedInput.timeSaved * params.hourlyRate + sanitizedInput.businessValue) *
    3
  // Mon#13-Mon#24 (i=6) Y2 × 12 × 折现率
  monthlyEfficiencyGain[6] =
    sanitizedInput.usersM13 *
    sanitizedInput.usageFrequency *
    12 *
    (sanitizedInput.timeSaved * params.hourlyRate + sanitizedInput.businessValue) *
    params.discountRate
  // Mon#25-Mon#36 (i=7) Y3 × 12 × 折现率²
  monthlyEfficiencyGain[7] =
    sanitizedInput.usersM13 *
    sanitizedInput.usageFrequency *
    12 *
    (sanitizedInput.timeSaved * params.hourlyRate + sanitizedInput.businessValue) *
    (params.discountRate * params.discountRate)

  // ---- 每时间段总成本 ----
  const costByTimeFrame = timeFrames.map(
    (_, i) =>
      mvpBasicModelCost[i] +
      mvpDevCost[i] +
      mvpFineTuningCost[i] +
      productDevCost[i] +
      productMaintenanceCost[i] +
      productFineTuningCost[i] +
      inferenceModelCostPrivate[i] +
      inferenceModelCostCloud[i],
  )

  // ---- 年度总成本（与原版逐项相加完全一致）----
  const y1TotalCost =
    mvpBasicModelCost[0] +
    mvpDevCost[0] +
    mvpFineTuningCost[0] +
    productDevCost[1] +
    productDevCost[2] +
    productDevCost[3] +
    productDevCost[4] +
    productDevCost[5] +
    productMaintenanceCost[1] +
    productMaintenanceCost[2] +
    productMaintenanceCost[3] +
    productMaintenanceCost[4] +
    productMaintenanceCost[5] +
    productFineTuningCost[4] +
    inferenceModelCostCloud[1] +
    inferenceModelCostCloud[2] +
    inferenceModelCostCloud[3] +
    inferenceModelCostCloud[4] +
    inferenceModelCostCloud[5]

  const y2TotalCost = productDevCost[6] + productMaintenanceCost[6] + inferenceModelCostCloud[6]
  const y3TotalCost = productDevCost[7] + productMaintenanceCost[7] + inferenceModelCostCloud[7]
  const totalCost = y1TotalCost + y2TotalCost + y3TotalCost

  // ---- 收益汇总 ----
  const benefitByTimeFrame = monthlyEfficiencyGain
  const y1TotalBenefit =
    benefitByTimeFrame[1] +
    benefitByTimeFrame[2] +
    benefitByTimeFrame[3] +
    benefitByTimeFrame[4] +
    benefitByTimeFrame[5]
  const y2TotalBenefit = benefitByTimeFrame[6]
  const y3TotalBenefit = benefitByTimeFrame[7]
  const totalBenefit = y1TotalBenefit + y2TotalBenefit + y3TotalBenefit

  // ---- 净收益 / ROI ----
  const y1NetBenefit = y1TotalBenefit - y1TotalCost
  const totalNetBenefit = totalBenefit - totalCost
  const roi = totalCost > 0 ? (totalNetBenefit / totalCost) * 100 : 0

  // ---- 累计净现金流 + 回收期 ----
  const { cumulativeNetCashFlow, paybackPeriod } = calculatePaybackPeriod(
    timeFrames,
    costByTimeFrame,
    benefitByTimeFrame,
  )

  return {
    mvpBasicModelCost,
    mvpDevCost,
    mvpFineTuningCost,
    productDevCost,
    productMaintenanceCost,
    productFineTuningCost,
    inferenceModelCostPrivate,
    inferenceModelCostCloud,
    y1TotalCost,
    y2TotalCost,
    y3TotalCost,
    totalCost,
    monthlyEfficiencyGain,
    y1TotalBenefit,
    y2TotalBenefit,
    y3TotalBenefit,
    totalBenefit,
    y1NetBenefit,
    totalNetBenefit,
    roi,
    paybackPeriod,
    timeFrames,
    costByTimeFrame,
    benefitByTimeFrame,
    cumulativeNetCashFlow,
  }
}

// 回收期计算（对应 calculate-roi.ts 的 calculatePaybackPeriod()）
export function calculatePaybackPeriod(timeFrames, costByTimeFrame, benefitByTimeFrame) {
  const cumulativeNetCashFlow = []
  let cumulativeSum = 0
  const monthlyData = []

  // 把每个时间段按"包含的月数"展开为月度数据（成本/收益在段内均摊）
  timeFrames.forEach((timeframe, index) => {
    let months = 1
    if (timeframe.includes("-")) {
      const parts = timeframe.split("-")
      const start = Number.parseInt(parts[0].replace("Mon#", ""))
      const end = Number.parseInt(parts[1].replace("Mon#", ""))
      months = end - start + 1
    }
    const monthlyCost = costByTimeFrame[index] / months
    const monthlyBenefit = benefitByTimeFrame[index] / months
    for (let i = 0; i < months; i++) {
      monthlyData.push({ cost: monthlyCost, benefit: monthlyBenefit })
    }
  })

  // 累计净现金流（36 个月逐月累加）
  monthlyData.forEach(({ cost, benefit }) => {
    cumulativeSum += benefit - cost
    cumulativeNetCashFlow.push(cumulativeSum)
  })

  // 回收期：第一个累计净现金流 ≥ 0 的月份；若上一月为负则线性插值
  let paybackPeriod = 36 // 默认最大值（36 个月内未回本）
  let foundBreakeven = false

  for (let i = 0; i < cumulativeNetCashFlow.length; i++) {
    if (cumulativeNetCashFlow[i] >= 0) {
      if (i > 0 && cumulativeNetCashFlow[i - 1] < 0) {
        const prevCF = cumulativeNetCashFlow[i - 1]
        const currCF = cumulativeNetCashFlow[i]
        const fraction = Math.abs(prevCF) / (currCF - prevCF)
        paybackPeriod = i + 1 + fraction
      } else {
        paybackPeriod = i + 1
      }
      foundBreakeven = true
      break
    }
  }
  if (!foundBreakeven) {
    paybackPeriod = 36
  }

  return { cumulativeNetCashFlow, paybackPeriod }
}

// ---------------------------------------------------------------------------
// HTML 报告渲染 —— 单文件、内联样式、可打印；延续原工具 ui 基调
// ---------------------------------------------------------------------------
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function fmtMoney(n) {
  return "¥" + Math.round(n || 0).toLocaleString("zh-CN")
}

function sumArr(arr) {
  return (arr || []).reduce((s, v) => s + (v || 0), 0)
}

function fmtPct(n, digits = 1) {
  return (n || 0).toFixed(digits) + "%"
}

function roiClass(roi) {
  if (roi >= 50) return "good"
  if (roi >= 0) return "mid"
  return "bad"
}

function roiText(roi) {
  if (roi >= 100) return "非常优秀，投资回报率超过 100%，项目极具价值"
  if (roi >= 50) return "良好，ROI 在 50% 以上，项目值得投资"
  if (roi >= 20) return "一般，ROI 在 20% 以上，项目可以考虑"
  if (roi >= 0) return "较低，ROI 为正但偏低，需谨慎评估"
  return "负值，投资难以收回，不建议按当前假设推进"
}

function paybackText(months) {
  if (months <= 12) return "非常快，一年内可回本，风险低"
  if (months <= 24) return "良好，两年内可回本，属合理范围"
  if (months <= 36) return "一般，三年内可回本"
  return "较长，超过 36 个月，需长期投入与耐心"
}


function buildAssumptions(input, params, isPro) {
  const rows = []
  if (input.aiName) rows.push(["AI 场景", esc(input.aiName)])
  rows.push(["稳态活跃用户 (M13)", String(input.usersM13 ?? 0) + " 人"])
  rows.push(["早期用户 M4/M5/M6", `${input.usersM4 ?? 0} / ${input.usersM5 ?? 0} / ${input.usersM6 ?? 0}`])
  rows.push(["成长期用户 M7-12", String(input.usersM7M12 ?? 0) + " 人"])
  rows.push(["月使用频次", String(input.usageFrequency ?? 0) + " 次/月"])
  rows.push(["单次节省工时", String(input.timeSaved ?? 0) + " 小时"])
  rows.push(["单次业务价值", "¥" + (input.businessValue ?? 0)])
  if (isPro) {
    rows.push(["输入/输出 Token", `${input.inputTokensPerUse ?? 0}M / ${input.outputTokensPerUse ?? 0}M`])
    rows.push(["收益成就系数", String(params.benefitScalingFactor ?? 0.85)])
  } else {
    rows.push(["单次 Token 消耗", String(input.tokenPerUse ?? 0) + " M"])
  }
  rows.push(["MVP 验证", input.mvpVerificationInput === 1 ? "是（3 个月）" : "否"])
  rows.push(["框架 Y1/Y2/Y3 团队", `${input.y1TeamSize ?? 0} / ${input.y2TeamSize ?? 0} / ${input.y3TeamSize ?? 0} 人`])
  if (isPro) rows.push(["持续迭代工程师", String(input.iterTeamSize ?? params.iterTeamSize) + " 人"])
  rows.push(["MVP / 产品化微调次数", `${input.mvpModel ?? 0} / ${input.productModel ?? 0}`])
  return rows
}
// =============================================================================
// 完整 HTML 报告渲染（对齐 App UI：成本收益估算表 + ROI 分析图表 + 数据解读）
// 单文件、内联样式 + 内联 SVG 图表（无外部依赖）、可打印。
// =============================================================================

// ---- 时间段列头（与 App cost-benefit-table.tsx 一致）----
const TF_HEADERS = ["Mon#1-3", "Mon#4", "Mon#5", "Mon#6", "Mon#7-9", "Mon#10-12", "Mon#13-24", "Mon#25-36"]
const TF_MONTHS = [3, 1, 1, 1, 3, 3, 12, 12]

// ---- 成本项定义（key 对应 ROIResult 数组字段）----
function costRows(result, isPro) {
  const rows = [
    { label: "MVP1基础模型算力成本", key: "mvpBasicModelCost" },
    { label: "MVP1研发成本", key: "mvpDevCost" },
    { label: "MVP1微调成本", key: "mvpFineTuningCost" },
    { label: "产品化研发成本", key: "productDevCost" },
    { label: "产品化运代IT运维成本", key: "productMaintenanceCost" },
    { label: "产品化模型微调成本", key: "productFineTuningCost" },
    { label: "按月信息推理模型成本(私有化)", key: "inferenceModelCostPrivate" },
    { label: "按月信息推理模型成本(云端API)", key: "inferenceModelCostCloud" },
  ]
  // v2 专业核算：补齐数据治理/业务集成/持续迭代/基础设施/合规安全 成本类目
  if (isPro) {
    rows.push(
      { label: "数据治理成本(采集/清洗/标注/持续)", key: "dataGovernanceOneTime", key2: "dataGovernanceOngoing" },
      { label: "业务集成成本(接口/三方/运维)", key: "integrationOneTime", key2: "integrationOngoing" },
      { label: "持续迭代优化成本(工程师+评测)", key: "iterationCost" },
      { label: "基础设施算力成本", key: "infraCost" },
      { label: "合规安全成本(建设+持续审计)", key: "complianceCost" },
    )
  }
  return rows
}

// ---- risk: 复用 mkNumber ----
function num(v) {
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
}

// ---- 从 ROIResult 取某成本数组（每项 8 元）----
function arr(result, key) {
  const a = result[key]
  return Array.isArray(a) ? a : Array(8).fill(0)
}

// ---- 构建月度数据（36 个月），用于图表 ----
function buildMonthly(result, isPro) {
  const mCost = []
  const mBenefit = []
  const cumulative = []
  let sum = 0
  for (let t = 0; t < 8; t++) {
    const months = TF_MONTHS[t]
    // 该时间段总成本（复用 costByTimeFrame），含一次性成本已在 index0；均摊到段内每月
    const segCost = num(result.costByTimeFrame[t]) / months
    const segBenefit = num(result.benefitByTimeFrame[t]) / months
    for (let m = 0; m < months; m++) {
      mCost.push(segCost)
      mBenefit.push(segBenefit)
      sum += segBenefit - segCost
      cumulative.push(sum)
    }
  }
  return { mCost, mBenefit, cumulative }
}

// ---- 成本分布（饼图）----
function buildCostBreakdown(result, isPro) {
  const items = [
    { name: "MVP研发", key: "mvpDevCost" },
    { name: "MVP基础模型", key: "mvpBasicModelCost" },
    { name: "MVP微调", key: "mvpFineTuningCost" },
    { name: "产品化研发", key: "productDevCost" },
    { name: "IT运维", key: "productMaintenanceCost" },
    { name: "产品化微调", key: "productFineTuningCost" },
    { name: "模型推理(私有)", key: "inferenceModelCostPrivate" },
    { name: "模型推理(云端)", key: "inferenceModelCostCloud" },
  ]
  if (isPro) {
    items.push(
      { name: "数据治理", key: "dataGovernanceOneTime", key2: "dataGovernanceOngoing" },
      { name: "业务集成", key: "integrationOneTime", key2: "integrationOngoing" },
      { name: "持续迭代优化", key: "iterationCost" },
      { name: "基础设施", key: "infraCost" },
      { name: "合规安全", key: "complianceCost" },
    )
  }
  const out = items
    .map((it) => ({
      name: it.name,
      value: num(sumArr(arr(result, it.key))) + (it.key2 ? num(sumArr(arr(result, it.key2))) : 0),
    }))
    .filter((x) => x.value > 0)
  return out
}

// ---- 敏感性分析（ROI 随 用户/效率 ±20% 变化）----
function buildSensitivity(roi) {
  const rows = [
    { label: "基准", v: roi },
    { label: "用户-20%", v: roi * 0.8 },
    { label: "用户+20%", v: roi * 1.2 },
    { label: "效率-20%", v: roi * 0.8 },
    { label: "效率+20%", v: roi * 1.2 },
    { label: "双-20%", v: roi * 0.64 },
    { label: "双+20%", v: roi * 1.44 },
  ]
  return rows
}

// 数字千分位 + ¥ 或 %，用于表格
function fnum(n) {
  return Math.round(num(n)).toLocaleString("zh-CN")
}
function fmoneyCell(n) {
  return num(n) === 0 ? "0" : fnum(n)
}

// ---- 渲染完整报告 ----
function renderFullReport({ result, input, params, mode }) {
  const isPro = mode === "pro"
  const roi = num(result.roi)
  const payback = num(result.paybackPeriod)
  const tfLabels = TF_HEADERS
  const dateStr = new Date().toLocaleDateString("zh-CN")

  // 关键指标卡
  const metrics = [
    { label: "投资回报率 (ROI)", value: roi.toFixed(0) + "%", sub: "投资回报率", cls: "roi-value" },
    { label: "项目净收益", value: fmtMoney(result.totalNetBenefit), sub: "3 年累计净收益", cls: result.totalNetBenefit >= 0 ? "benefit-value" : "cost-value" },
    { label: "回收期", value: payback.toFixed(1) + " 个月", sub: "项目回收期", cls: "payback-value" },
    { label: "项目总成本", value: fmtMoney(result.totalCost), sub: "3 年累计投入", cls: "cost-value" },
  ]
  const npvHtml =
    isPro && result.npv !== null && result.npv !== undefined
      ? `<div class="met" style="grid-column:span 1"><span class="met-l">NPV（3年，月度折现）</span><span class="met-v ${result.npv >= 0 ? "good-c" : "bad-c"}">${fmtMoney(result.npv)}</span><span class="met-s">&gt;0 考虑时间价值后仍盈利</span></div>`
      : ""

  // 成本表
  function costRow(label, key, key2) {
    const a = arr(result, key)
    const a2 = key2 ? arr(result, key2) : Array(8).fill(0)
    const combined = a.map((v, i) => num(v) + num(a2[i]))
    const total = num(sumArr(combined))
    return `<tr><td class="cx">${label}</td><td class="num s">${fnum(total)}</td>${combined.map((v) => `<td class="num">${fmoneyCell(v)}</td>`).join("")}</tr>`
  }
  const costTbody = costRows(result, isPro).map((r) => costRow(r.label, r.key, r.key2)).join("")
  const yearRow = (label, v) => `<tr class="yr"><td>${label}</td><td class="num s">${fnum(v)}</td>${"<td class='num'></td>".repeat(8)}</tr>`
  const costYearRows = [
    yearRow("第一年累计成本", result.y1TotalCost),
    yearRow("第二年累计成本", result.y2TotalCost),
    yearRow("第三年累计成本", result.y3TotalCost),
    yearRow("累计总成本", result.totalCost),
  ].join("")

  // 收益表
  const benefitCells = result.benefitByTimeFrame.map((v) => `<td class="num">${fmoneyCell(v)}</td>`).join("")
  const benefitHead = `<tr><td>效率提升收益</td><td class="num s">${fnum(result.totalBenefit)}</td>${benefitCells}</tr>`
  const benefitYearRow = (label, v) => `<tr class="yr"><td>${label}</td><td class="num s">${fnum(v)}</td>${"<td class='num'></td>".repeat(8)}</tr>`
  const benefitRows = [
    benefitYearRow("第一年效益提升收益", result.y1TotalBenefit),
    benefitYearRow("第二年效益提升收益", result.y2TotalBenefit),
    benefitYearRow("第三年效益提升收益", result.y3TotalBenefit),
    benefitYearRow("累计总收益", result.totalBenefit),
    benefitYearRow("累计净收益 (1年)", result.y1NetBenefit),
    benefitYearRow("累计净收益 (3年)", result.totalNetBenefit),
    `<tr class="yr"><td>ROI 平衡点</td><td>${payback.toFixed(1)} 个月</td>${"<td class='num'></td>".repeat(8)}</tr>`,
  ].join("")

  // 假设清单（排两列）
  const assumpRows = buildAssumptions(input, params, isPro).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
  const half = Math.ceil(assumpRows.length / 2)
  const assumpLeft = assumpRows.slice(0, half).join("")
  const assumpRight = assumpRows.slice(half).join("")

  // 图表数据（注入 script）
  const chartData = JSON.stringify({
    monthly: buildMonthly(result, isPro),
    breakdown: buildCostBreakdown(result, isPro),
    sensitivity: buildSensitivity(roi),
    payback,
    tfLabels,
  })

  // ---- 动态图表解读（基于本报告实际数据）----
  const monthly = buildMonthly(result, isPro)
  const breakdown = buildCostBreakdown(result, isPro)
  const sensitivity = buildSensitivity(roi)
  const fmtN = (n) => Math.round(num(n))
  const fmt$ = (n) => "¥" + Math.round(num(n)).toLocaleString("zh-CN")
  const fmtPct = (x) => (num(x) * 100).toFixed(1) + "%"
  const totalCostAll = num(result.totalCost)
  const totalBenefitAll = num(result.totalBenefit)

  // 1) 成本与收益趋势：找到收益首次超过成本的时间段 + 各阶段成本/收益累计对比
  let crossTime = null
  for (let t = 0; t < 8; t++) {
    if (num(result.costByTimeFrame[t]) > 0 && num(result.benefitByTimeFrame[t]) > num(result.costByTimeFrame[t])) {
      crossTime = tfLabels[t] || timeFrames[t]
      break
    }
  }
  const y1Net = num(result.y1NetBenefit)
  const trendAnalysis = crossTime
    ? `收益在 <b>${esc(crossTime)}</b> 阶段首次超过成本。3 年累计成本 <b>${fmt$(totalCostAll)}</b>、累计收益 <b>${fmt$(totalBenefitAll)}</b>，收益/成本比 ${(totalBenefitAll / (totalCostAll || 1)).toFixed(2)}×。${y1Net < 0 ? "首年净收益为负（人工+基建集中投入期），属典型长期项目曲线。" : "首年即实现净收益为正，收益爬坡顺利。"}`
    : "整个评估期内各时间段收益均未超过同期成本，提示项目前期投入持续高于回报，需审慎评估长期性。"

  // 2) 累计净现金流与回收期
  const cumLast = monthly.cumulative[monthly.cumulative.length - 1] || 0
  const cumMin = Math.min(...monthly.cumulative, 0)
  const paybackNow = num(result.paybackPeriod)
  const paybackAnalysis = `<p>累计净现金流从 <b>${fmt$(cumMin)}</b> 的低点起步，至评估期末累计 <b>${fmt$(cumLast)}</b>。<b>回收期 ${paybackNow.toFixed(1)} 个月</b>：${paybackNow <= 12 ? "一年内回本，现金流表现优秀。" : paybackNow <= 24 ? "两年内回本，属合理区间。" : paybackNow <= 36 ? "三年内回本，符合大多数企业预期。" : "评估期（36 个月）内仍未回本，需重点评估长期投入。"}${cumLast < 0 ? " 期末累计现金流转负，投资尚未全部回收。" : " 期末累计现金流为正，项目已产生净回报。"}</p>`

  // 3) 成本分布：找出占比最大 / 前三的成本项
  const bdTotal = breakdown.reduce((s, x) => s + x.value, 0) || 1
  const bdSorted = [...breakdown].sort((a, b) => b.value - a.value)
  const top1 = bdSorted[0]
  const top3 = bdSorted.slice(1, 3).map((x) => `${x.name}(${fmtPct(x.value / bdTotal)})`).join("、")
  const breakdownAnalysis = `成本合计 <b>${fmt$(bdTotal)}</b>，最大单项为 <b>${esc(top1 ? top1.name : "-")}（${fmtPct(top1 ? top1.value / bdTotal : 0)}）</b>。${top3 ? "其次为：" + esc(top3) + "。" : ""}${top1 && top1.value / bdTotal > 0.5 ? " 单一成本已超一半，是首要优化对象。" : " 整体分布较均衡，可逐项优化。"}`

  // 4) 敏感性分析：找最敏感（偏离基准最大）方向与极端区间
  const baseS = sensitivity.find((x) => x.label === "基准")?.v || roi
  const sensMax = Math.max(...sensitivity.map((x) => x.v))
  const sensMin = Math.min(...sensitivity.map((x) => x.v))
  const sensSpan = sensMax - sensMin
  const sensUp = sensitivity.find((x) => x.label === "双+20%")
  const sensDown = sensitivity.find((x) => x.label === "双-20%")
  const sensAnalysis = `基准 ROI <b>${baseS.toFixed(1)}%</b>；在用户数、效率 ±20% 组合下，ROI 波动于 <b>${sensMin.toFixed(1)}% ~ ${sensMax.toFixed(1)}%</b>（极差 ${sensSpan.toFixed(1)}pp）。${sensUp && sensDown ? `「双+20%」可达 <b>${sensUp.v.toFixed(1)}%</b>，「双-20%」降至 <b>${sensDown.v.toFixed(1)}%</b>` : ""}。${sensSpan > Math.abs(baseS) * 0.6 ? " 波动显著，说明 ROI 对用户规模与效率高度敏感，立项前务必夯实这两类假设。" : " 波动相对可控，项目稳健性较好。"}`

  const roiCls = roi >= 50 ? "good-c" : roi >= 0 ? "mid-c" : "bad-c"
  const adviceCls = roi >= 50 ? "adv-good" : roi >= 20 ? "adv-mid" : "adv-bad"

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(input.aiName || "AI 应用")} - ROI 分析结果</title>
<style>
  :root{
    --brand:#1350a8; --brand-2:#2f6bd8; --brand-soft:#e8f0fd;
    --accent:#f97316; --good:#0f9d6e; --bad:#dc2626; --warn:#b45309;
    --ink:#111827; --ink-2:#374151; --ink-3:#6b7280; --ink-4:#9ca3af;
    --line:#e6e8ee; --line-strong:#d7dae2; --bg:#f4f5f8; --card:#ffffff;
    --radius:16px; --radius-s:10px; --shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.06);
    --brand-grad:linear-gradient(135deg,#1350a8 0%,#2f6bd8 100%);
    --mono:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif;background:var(--bg);color:var(--ink);line-height:1.5;-webkit-font-smoothing:antialiased}
  a{color:inherit}
  button{font-family:inherit;cursor:pointer}

  /* 顶部栏 —— 全宽 */
  .topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 28px;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
  .brand{display:flex;align-items:center;gap:12px;font-weight:800;font-size:17px;letter-spacing:-.2px}
  .brand .logo{width:30px;height:30px;border-radius:9px;background:var(--brand-grad);color:#fff;display:grid;place-items:center;font-size:15px;font-weight:800}
  .brand small{color:var(--ink-3);font-weight:500;font-size:12px}
  .top-actions{display:flex;align-items:center;gap:10px}
  .btn{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line-strong);background:#fff;color:var(--ink-2);padding:9px 16px;border-radius:10px;font-size:14px;font-weight:600;transition:.18s}
  .btn:hover{border-color:var(--brand);color:var(--brand)}
  .btn.primary{background:#fff;color:var(--brand);border-color:var(--brand)}
  .btn.primary:hover{background:var(--brand);color:#fff}
  .btn.ghost{background:var(--brand);color:#fff;border-color:var(--brand)}
  .btn.ghost:hover{background:var(--brand-2)}

  /* 主内容 —— 全宽留边距 */
  .page{width:100%;padding:28px 28px 64px}
  .head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:24px;flex-wrap:wrap}
  .head h1{font-size:24px;font-weight:800;letter-spacing:-.4px}
  .head p{color:var(--ink-3);font-size:14px;margin-top:6px}
  .head .pill{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 16px;font-size:13px;font-weight:600;color:var(--ink-2);box-shadow:var(--shadow)}
  .head .pill .dot{width:8px;height:8px;border-radius:50%;background:var(--good);box-shadow:0 0 0 4px rgba(15,157,110,.15)}

  /* 关键指标 */
  .metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:20px}
  .met{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-s);padding:18px 20px;box-shadow:var(--shadow);transition:.2s}
  .met:hover{transform:translateY(-2px)}
  .met-l{font-size:13px;color:var(--ink-3);font-weight:600}
  .met-v{display:block;font-size:28px;font-weight:800;letter-spacing:-.5px;margin:8px 0 2px;font-variant-numeric:tabular-nums}
  .met-s{font-size:12px;color:var(--ink-4)}
  .roi-value{color:var(--brand)} .benefit-value{color:var(--good)} .payback-value{color:var(--good)} .cost-value{color:var(--bad)}

  /* Tab */
  .tabs{display:inline-flex;gap:6px;background:#eef0f4;padding:5px;border-radius:12px;margin:6px 0 20px}
  .tab{border:none;background:transparent;color:var(--ink-3);padding:9px 22px;border-radius:9px;font-size:14px;font-weight:600;transition:.16s}
  .tab.active{background:#fff;color:var(--brand);box-shadow:0 1px 3px rgba(16,24,40,.12)}
  .pane{display:none}.pane.active{display:block;animation:fadein .3s ease}
  @keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

  /* 卡片 */
  .card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);margin-bottom:20px}
  .card-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
  .card-h h2{font-size:18px;font-weight:800;letter-spacing:-.2px}
  .card-h .sub{color:var(--ink-3);font-size:13px}
  .sec-title{font-size:15px;font-weight:700;margin:22px 0 14px;color:var(--ink);display:flex;align-items:center;gap:8px}
  .sec-title::before{content:"";width:4px;height:16px;border-radius:3px;background:var(--brand-grad)}

  /* 表格 */
  .tbl-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:12px}
  table{width:100%;border-collapse:collapse;font-size:13.5px;min-width:900px}
  th,td{border-bottom:1px solid var(--line);padding:12px 14px;text-align:left}
  th{background:#fafbfc;color:var(--ink-3);font-weight:700;font-size:12.5px;letter-spacing:.2px;white-space:nowrap}
  td{color:var(--ink-2)}
  td.cx{font-weight:600;color:var(--ink);white-space:nowrap}
  td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
  td.s{font-weight:700;color:var(--ink)}
  tr.yr td{background:#eef2f9;font-weight:700;color:var(--ink)}
  tbody tr:hover td{background:#f8fafc}
  tr.yr:hover td{background:#e7edf7}
  .subblock{margin-top:24px}

  /* 图表 */
  .chart-box{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px;margin-top:8px}
  .pwrap{display:flex;align-items:center;gap:10px;justify-content:center}
  .plex{display:flex;flex-direction:column;gap:7px;font-size:12.5px;color:#374151;flex-shrink:0;align-self:center}
  .pl{display:flex;align-items:center;gap:7px;white-space:nowrap}
  .pl i{width:12px;height:12px;border-radius:3px;display:inline-block;flex-shrink:0}
  .pl span{color:#374151}
  .pl b{color:#9ca3af;font-weight:600;margin-left:2px}
  .chart-name{font-size:15px;font-weight:700;margin:22px 0 2px}
  .chart-name small{color:var(--ink-3);font-weight:500;font-size:12.5px}
  svg{display:block;width:100%;height:auto}
  .legend{display:flex;gap:20px;flex-wrap:wrap;font-size:12.5px;color:var(--ink-3);margin-top:10px}
  .legend span{display:inline-flex;align-items:center;gap:6px}
  .legend i{width:11px;height:11px;border-radius:3px;display:inline-block}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:6px}

  /* 解读 */
  .idx-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .idx{border:1px solid var(--line);border-radius:12px;padding:18px 20px}
  .idx h4{font-size:15px;font-weight:700;margin-bottom:8px;display:flex;align-items:baseline;gap:10px}
  .idx .big{font-size:24px;font-weight:800;color:var(--brand)}
  .idx p{margin:6px 0;color:var(--ink-2);font-size:14px}
  .idx .hint{color:var(--ink-4);font-size:12.5px}
  details{border:1px solid var(--line);border-radius:10px;margin-bottom:10px;background:#fff}
  summary{cursor:pointer;padding:14px 16px;font-weight:600;font-size:14px;list-style:none;position:relative}
  summary::after{content:"+";position:absolute;right:16px;color:var(--ink-3);font-weight:400}
  details[open] summary::after{content:"–"}
  .acc-body{padding:4px 16px 16px;color:var(--ink-2);font-size:13.5px}
  .acc-body ul{list-style:none;margin-top:8px}
  .acc-body li{padding:3px 0 3px 16px;position:relative}
  .acc-body li::before{content:"·";position:absolute;left:2px;color:var(--brand)}
  .advice{background:#f8fafc;border:1px solid var(--line);border-radius:12px;padding:18px 20px}
  .advice h4{font-size:15px;font-weight:700;margin-bottom:10px}
  .advice ul{list-style:none;margin-top:10px}
  .advice li{padding:5px 0 5px 20px;position:relative;color:var(--ink-2);font-size:13.5px}
  .advice li::before{content:"✓";position:absolute;left:0;color:var(--good)}
  .adv-good{color:var(--good);font-weight:600;margin-bottom:4px}
  .adv-mid{color:var(--warn);font-weight:600;margin-bottom:4px}
  .adv-bad{color:var(--bad);font-weight:600;margin-bottom:4px}

  /* 假设清单 */
  .assume-table td:first-child{color:var(--ink-3);width:38%}
  .assume-table td{color:var(--ink-2)}
  .assume-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;column-gap:40px}
  .assume-grid table{border:none;min-width:0}
  .assume-grid th,.assume-grid td{border:none;padding:7px 4px;border-bottom:1px dashed var(--line)}
  .assume-grid td:first-child{color:var(--ink-3);width:42%}
  .assume-grid td{color:var(--ink-2);font-size:13px}
  @media(max-width:760px){.assume-grid{grid-template-columns:1fr}}
  /* 图表解读两列 */
  .acc-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .acc-grid details{margin-bottom:0}
  @media(max-width:760px){.acc-grid{grid-template-columns:1fr}}

  .footer{text-align:center;color:var(--ink-4);font-size:12.5px;margin-top:36px;padding-top:20px;border-top:1px solid var(--line)}

  @media(max-width:900px){.metrics{grid-template-columns:repeat(2,1fr)}.grid-2{grid-template-columns:1fr}.idx-grid{grid-template-columns:1fr}}
  @media print{body{background:#fff}.topbar,.head .pill,.tabs{display:none}.card{box-shadow:none;border:none;padding:0}}
</style>
</head>
<body>
  <div class="topbar">
    <div class="brand"><span class="logo">AI</span> AI ROI 分析工具 <small>投资回报决策</small></div>
    <div class="top-actions">
      <button class="btn primary" onclick="window.print()">下载报告</button>
    </div>
  </div>

  <div class="page">
    <div class="head">
      <div>
        <h1>${esc(input.aiName || "AI 应用")} ROI 分析结果</h1>
        <p>基于 3 年评估期（36 个月）的投资回报分析</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <span class="pill"><span class="dot"></span>${isPro ? "v2 专业核算" : "v1 原版复刻"}</span>
      </div>
    </div>

    <div class="metrics">
      ${metrics.map((m) => `<div class="met"><span class="met-l">${m.label}</span><span class="met-v ${m.cls}">${m.value}</span><span class="met-s">${m.sub}</span></div>`).join("")}
      ${npvHtml}
    </div>

    <div class="tabs">
      <button class="tab active" data-tab="table" onclick="showTab(this,'table')">成本收益表</button>
      <button class="tab" data-tab="charts" onclick="showTab(this,'charts')">ROI 分析图表</button>
    </div>

    <!-- 成本收益表 -->
    <div class="pane active" id="pane-table">
      <div class="card">
        <div class="card-h"><h2>成本收益估算表</h2><span class="sub">基于 3 年评估期的投资回报分析 · 单位 ¥</span></div>
        <div class="sec-title">成本项</div>
        <div class="tbl-wrap"><table>
          <thead><tr><th>成本项</th><th class="num">本项成本合计</th>${tfLabels.map((t) => `<th class="num">${t}</th>`).join("")}</tr></thead>
          <tbody>${costTbody}${costYearRows}</tbody>
        </table></div>
        <div class="sec-title">收益项</div>
        <div class="tbl-wrap"><table>
          <thead><tr><th>收益项</th><th class="num">收益合计</th>${tfLabels.map((t) => `<th class="num">${t}</th>`).join("")}</tr></thead>
          <tbody>${benefitHead}${benefitRows}</tbody>
        </table></div>
      </div>
    </div>

    <!-- ROI 分析图表 -->
    <div class="pane" id="pane-charts">
      <div class="card">
        <div class="card-h"><h2>ROI 分析图表</h2><span class="sub">基于数据与收益估算</span></div>

        <div class="chart-name">成本与收益趋势<small> 按月（M1-M36）</small></div>
        <div class="chart-box" id="chart-trend"></div>
        <div class="legend"><span><i style="background:#f97316"></i>成本</span><span><i style="background:#10b981"></i>收益</span></div>

        <div class="chart-name">累计净现金流与回收期<small> 回收期 ${payback.toFixed(1)} 个月</small></div>
        <div class="chart-box" id="chart-cashflow"></div>

        <div class="grid-2">
          <div>
            <div class="chart-name">成本分布</div>
            <div class="chart-box" id="chart-pie"></div>
          </div>
          <div>
            <div class="chart-name">敏感性分析 - ROI 变化</div>
            <div class="chart-box" id="chart-sensitivity"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据解释与解读 -->
    <div class="card">
      <div class="card-h"><h2>数据解释与解读</h2><span class="sub">帮助您理解 ROI 分析结果和关键指标的含义</span></div>

      <div class="sec-title">关键指标解读</div>
      <div class="idx-grid">
        <div class="idx">
          <h4>投资回报率 (ROI) <span class="big">${roi.toFixed(0)}%</span></h4>
          <p>${roiText(roi)}</p>
          <div class="hint">ROI = (总收益 - 总成本) / 总成本 × 100%</div>
        </div>
        <div class="idx">
          <h4>回收期 <span class="big" style="color:var(--good)">${payback.toFixed(1)} 个月</span></h4>
          <p>${paybackText(payback)}</p>
          <div class="hint">回收期是累计净现金流首次转为正值的时间点</div>
        </div>
      </div>

      <div class="sec-title">图表解读</div>
      <div class="acc-grid">
      <details><summary>成本与收益趋势</summary><div class="acc-body"><p>展示项目在 36 个月评估期内每个时间段的成本与收益变化（<span style="color:#f97316;font-weight:600">橙柱</span>=成本，<span style="color:#10b981;font-weight:600">绿柱</span>=收益）。</p><div style="margin:8px 0;padding:10px 12px;background:#f8fafc;border-left:3px solid #2f6bd8;border-radius:6px;font-size:13px;color:#374151">${trendAnalysis}</div></div></details>
      <details><summary>累计净现金流与回收期</summary><div class="acc-body"><p>展示累计净现金流（<span style="color:#2f6bd8;font-weight:600">蓝色区域</span>）的变化趋势与投资回收期（红线处为回本点）。</p><div style="margin:8px 0;padding:10px 12px;background:#f8fafc;border-left:3px solid #2f6bd8;border-radius:6px;font-size:13px;color:#374151">${paybackAnalysis}</div></div></details>
      <details><summary>成本分布</summary><div class="acc-body"><p>展示项目总成本的构成比例（各颜色代表不同成本类型），帮助识别主要成本来源。</p><div style="margin:8px 0;padding:10px 12px;background:#f8fafc;border-left:3px solid #2f6bd8;border-radius:6px;font-size:13px;color:#374151">${breakdownAnalysis}</div></div></details>
      <details><summary>敏感性分析</summary><div class="acc-body"><p>展示关键参数（用户数、效率提升 ±20%）变化对 ROI 的影响，评估项目风险。</p><div style="margin:8px 0;padding:10px 12px;background:#f8fafc;border-left:3px solid #2f6bd8;border-radius:6px;font-size:13px;color:#374151">${sensAnalysis}</div></div></details>
      </div>

      <div class="sec-title">决策建议</div>
      <div class="advice">
        <h4>基于当前分析结果，我们提供以下决策建议：</h4>
        <div class="${adviceCls}">${roi >= 50 ? "✓ 该 AI 项目具有良好的投资价值，建议推进实施" : roi >= 20 ? "⚠ 该 AI 项目具有一定投资价值，但回报适中，建议谨慎评估" : "✗ 该 AI 项目投资回报率较低，建议重新评估或调整方案"}</div>
        <ul>
          ${result.y1NetBenefit < 0 && result.totalNetBenefit > 0 ? "<li>首年净收益为负，但长期收益为正，属典型的长期投资项目</li>" : ""}
          ${result.totalNetBenefit < 0 ? "<li>当前规模下 3 年无法回本，需重新审视用户规模或固定投入</li>" : ""}
          <li>建议关注成本分布中占比最大的部分，寻找优化空间</li>
          <li>参考敏感性分析，关注对 ROI 影响最大的因素，制定风险应对策略</li>
        </ul>
      </div>

      <div class="sec-title">关键假设清单（请复核）</div>
      <div class="assume-grid">
        <table><tbody>${assumpLeft}</tbody></table>
        <table><tbody>${assumpRight}</tbody></table>
      </div>
    </div>

    <div class="footer">此报告由 ai-roi-calculator skill 自动生成（${isPro ? "v2 专业核算" : "v1 原版复刻"}）· ${dateStr} · 单文件离线可打印</div>
  </div>

  <script>
  const DATA = ${chartData};
  const COLORS = ["#1350a8","#2f6bd8","#7c8fdd","#10b981","#f97316","#f59e0b","#ef4444","#8b5cf6","#14b8a6","#3b82f6","#e11d48","#64748b"];
  const fmt = n => Math.round(+n||0).toLocaleString('zh-CN');
  function showTab(el,name){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');document.querySelectorAll('.pane').forEach(p=>p.classList.remove('active'));document.getElementById('pane-'+name).classList.add('active');}

  // 柱状图：成本与收益趋势（按月 36）
  function renderTrend(){
    const w=1000,h=300,pl=64,pr=16,pt=16,pb=34;
    const mc=DATA.monthly.mCost, mb=DATA.monthly.mBenefit, n=mc.length;
    const maxV=Math.max.apply(null, mc.concat(mb).concat([1]))*1.08;
    const bw=(w-pl-pr)/n;
    const y=v=>h-pb-(v/maxV)*(h-pb-pt);
    let bars='';
    for(let i=0;i<n;i++){
      const x=pl+i*bw;
      const cy=y(mc[i]), by=y(mb[i]);
      bars+='<rect x="'+(x+bw*0.10)+'" y="'+cy+'" width="'+(bw*0.36)+'" height="'+Math.max(0,h-pb-cy)+'" rx="1.5" fill="#f97316"><title>M'+(i+1)+' 成本 '+fmt(mc[i])+'</title></rect>';
      bars+='<rect x="'+(x+bw*0.54)+'" y="'+by+'" width="'+(bw*0.36)+'" height="'+Math.max(0,h-pb-by)+'" rx="1.5" fill="#10b981"><title>M'+(i+1)+' 收益 '+fmt(mb[i])+'</title></rect>';
    }
    let xaxis=''; for(let i=0;i<n;i++){ if(i%2===0){ xaxis+='<text x="'+(pl+i*bw+bw/2)+'" y="'+(h-pb+16)+'" text-anchor="middle" font-size="10" fill="#9ca3af">M'+(i+1)+'</text>'; } }
    let grid=''; const steps=5;
    for(let s=0;s<=steps;s++){ const v=maxV/steps*s, yy=y(v); grid+='<line x1="'+pl+'" y1="'+yy+'" x2="'+(w-pr)+'" y2="'+yy+'" stroke="#eef0f4"/><text x="'+(pl-8)+'" y="'+(yy+3)+'" text-anchor="end" font-size="10" fill="#9ca3af">'+fmt(v)+'</text>'; }
    document.getElementById('chart-trend').innerHTML='<svg viewBox="0 0 '+w+' '+h+'">'+grid+xaxis+bars+'</svg>';
  }

  // 面积图：累计净现金流与回收期
  function renderCash(){
    const w=1000,h=300,pl=64,pr=16,pt=16,pb=34;
    const data=DATA.monthly.cumulative, n=data.length;
    const maxV=Math.max.apply(null,data.concat([0]))*1.12;
    const minV=Math.min.apply(null,data.concat([0]))*1.12;
    const y=v=>h-pb-((v-minV)/(maxV-minV||1))*(h-pb-pt);
    const step=(w-pl-pr)/n;
    const pts=data.map((v,i)=>((pl+i*step+step/2))+' ,'+y(v)).map(s=>s.replace(' ,',','));
    const poly='<polygon points="'+pts.join(' ')+','+(pl+w-pl)+','+(h-pb)+' '+pl+','+(h-pb)+'" fill="#2f6bd8" opacity="0.16"/>';
    const line='<polyline points="'+pts.join(' ')+'" fill="none" stroke="#2f6bd8" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    let grid=''; for(let s=0;s<=4;s++){ const v=minV+(maxV-minV)/4*s, yy=y(v); grid+='<line x1="'+pl+'" y1="'+yy+'" x2="'+(w-pr)+'" y2="'+yy+'" stroke="#eef0f4"/><text x="'+(pl-8)+'" y="'+(yy+3)+'" text-anchor="end" font-size="10" fill="#9ca3af">'+fmt(v)+'</text>'; }
    let xaxis=''; for(let i=0;i<n;i++){ if(i%4===0){ xaxis+='<text x="'+(pl+i*step+step/2)+'" y="'+(h-pb+16)+'" text-anchor="middle" font-size="10" fill="#9ca3af">M'+(i+1)+'</text>'; } }
    const zy=y(0), zero='<line x1="'+pl+'" y1="'+zy+'" x2="'+(w-pr)+'" y2="'+zy+'" stroke="#cbd5e1" stroke-dasharray="4 4"/>';
    const payIdx=Math.min(n-1,Math.max(0,DATA.payback));
    const pbX=pl+(payIdx-1)*step+step/2;
    const pline='<line x1="'+pbX+'" y1="'+pt+'" x2="'+pbX+'" y2="'+(h-pb)+'" stroke="#ef4444" stroke-dasharray="4 4"/><text x="'+pbX+'" y="'+(pt+14)+'" text-anchor="middle" font-size="10" fill="#ef4444" font-weight="600">回收期 '+DATA.payback.toFixed(1)+'个月</text>';
    document.getElementById('chart-cashflow').innerHTML='<svg viewBox="0 0 '+w+' '+h+'">'+grid+xaxis+zero+poly+line+pline+'</svg>';
  }

  // 饼图：成本分布
  // 饼图：成本分布（Recharts 风格：外部引线百分比标签 + 右侧竖排图例）
  function renderPie(){
    const data=DATA.breakdown, total=data.reduce((s,x)=>s+x.value,0)||1;
    const cx=190, cy=190, R=100, LR=14;  // cx 右移给左侧标签留空间
    const w=460, h=392;
    let segs='', start=-Math.PI/2;
    const labels=[];
    data.forEach((d,i)=>{
      const ang=(d.value/total)*Math.PI*2;
      const x1=cx+R*Math.cos(start), y1=cy+R*Math.sin(start);
      const x2=cx+R*Math.cos(start+ang), y2=cy+R*Math.sin(start+ang);
      const la=ang>Math.PI?1:0;
      const pct=(d.value/total*100).toFixed(0);
      const mid=start+ang/2;
      const lx1=cx+(R+2)*Math.cos(mid), ly1=cy+(R+2)*Math.sin(mid);
      const lx2=cx+(R+LR)*Math.cos(mid), ly2=cy+(R+LR)*Math.sin(mid);
      segs+='<path d="M'+cx+','+cy+' L'+x1+','+y1+' A'+R+','+R+' 0 '+la+' 1 '+x2+','+y2+' Z" fill="'+COLORS[i%COLORS.length]+'" stroke="#fff" stroke-width="1.6"><title>'+d.name+' '+fmt(d.value)+' ('+pct+'%)</title></path>';
      segs+='<line x1="'+lx1+'" y1="'+ly1+'" x2="'+lx2+'" y2="'+ly2+'" stroke="#6b7280" stroke-width="0.8" opacity="0.5"/>';
      // 标签在引线末端外侧，限制不越界
      const tx=lx2+Math.cos(mid)*6, ty=ly2+Math.sin(mid)*6;
      if(pct>=4){ labels.push('<text x="'+tx+'" y="'+ty+'" font-size="12.5" font-weight="600" fill="#374151" text-anchor="'+(mid>-Math.PI/2&&mid<Math.PI/2?'start':'end')+'">'+pct+'%</text>'); }
      start+=ang;
    });
    let leg=''; data.forEach((d,i)=>{ const pct=(d.value/total*100).toFixed(0); leg+='<div class="pl"><i style="background:'+COLORS[i%COLORS.length]+'"></i><span>'+d.name+'</span><b>'+pct+'%</b></div>'; });
    document.getElementById('chart-pie').innerHTML='<div class="pwrap"><svg viewBox="0 0 '+w+' '+h+'">'+segs+labels.join('')+'</svg><div class="plex">'+leg+'</div></div>';
  }

  // 折线图：敏感性（Recharts 风格：monotone 平滑曲线 + 网格 + 数据点）
  // Fritsch-Carlson monotone cubic interpolation（同 Recharts type="monotone"）
  function smoothPath(pts){
    if(pts.length<2) return '';
    const n=pts.length;
    const dx=[], dy=[], m=[];
    for(let i=0;i<n-1;i++){ dx.push(pts[i+1].x-pts[i].x); const d=pts[i+1].y-pts[i].y; dy.push(d); const s=d/(pts[i+1].x-pts[i].x); m.push(s); }
    if(n===2) return 'M'+pts[0].x+','+pts[0].y+' L'+pts[1].x+','+pts[1].y;
    const t=[];
    t[0]=m[0]; t[n-1]=m[n-2];
    for(let i=1;i<n-1;i++){ if(m[i-1]*m[i]<=0){ t[i]=0; } else { const w1=2*dx[i]+dx[i-1], w2=dx[i]+2*dx[i-1]; t[i]=(w1+w2)/(w1/m[i-1]+w2/m[i]); } }
    let d='M'+pts[0].x+','+pts[0].y;
    for(let i=0;i<n-1;i++){
      const h=dx[i];
      const c1x=pts[i].x+h/3, c1y=pts[i].y+t[i]*h/3;
      const c2x=pts[i+1].x-h/3, c2y=pts[i+1].y-t[i+1]*h/3;
      d+=' C'+c1x+','+c1y+' '+c2x+','+c2y+' '+pts[i+1].x+','+pts[i+1].y;
    }
    return d;
  }
  function renderSens(){
    const data=DATA.sensitivity, w=520,h=300,pl=56,pr=14,pt=16,pb=40;
    const maxV=Math.max.apply(null,data.map(d=>d.v).concat([0]))*1.18;
    const minV=Math.min.apply(null,data.map(d=>d.v).concat([0]))*1.18;
    const y=v=>h-pb-((v-minV)/(maxV-minV||1))*(h-pb-pt);
    const xof=i=>pl+i*((w-pl-pr)/(data.length-1));
    const pts=data.map((d,i)=>({x:xof(i),y:y(d.v)}));
    const path=smoothPath(pts);
    // 面积填充（淡）
    const area=path+' L'+pts[pts.length-1].x+','+(h-pb)+' L'+pts[0].x+','+(h-pb)+' Z';
    let grid=''; for(let s=0;s<=4;s++){ const v=minV+(maxV-minV)/4*s, yy=y(v); grid+='<line x1="'+pl+'" y1="'+yy+'" x2="'+(w-pr)+'" y2="'+yy+'" stroke="#e6e9f0" stroke-dasharray="3 4"/><text x="'+(pl-8)+'" y="'+(yy+3)+'" text-anchor="end" font-size="10" fill="#9ca3af">'+v.toFixed(0)+'</text>'; }
    let xaxis=''; data.forEach((d,i)=>{ xaxis+='<text x="'+xof(i)+'" y="'+(h-pb+14)+'" text-anchor="middle" font-size="10" fill="#6b7280">'+d.label+'</text>'; });
    // 数据点：白色填心 + 蓝边
    let dots=''; data.forEach((d,i)=>{ dots+='<circle cx="'+xof(i)+'" cy="'+y(d.v)+'" r="3.6" fill="#fff" stroke="#2f6bd8" stroke-width="2"><title>'+d.label+' '+d.v.toFixed(0)+'%</title></circle>'; });
    // 图例（底部居中的 ROI (%)）
    const legEl='<line x1="'+((w-pl-pr)/2+pl-14)+'" y1="'+(h-2)+'" x2="'+((w-pl-pr)/2+pl-2)+'" y2="'+(h-2)+'" stroke="#2f6bd8" stroke-width="2"/><text x="'+((w-pl-pr)/2+pl+6)+'" y="'+(h+3)+'" font-size="10" fill="#6b7280">ROI (%)</text>';
    document.getElementById('chart-sensitivity').innerHTML='<svg viewBox="0 0 '+w+' '+(h+16)+'"><defs></defs>'+grid+xaxis+'<path d="'+area+'" fill="#2f6bd8" opacity="0.04"/><path d="'+path+'" fill="none" stroke="#2f6bd8" stroke-width="2.4" stroke-linecap="round"/>'+dots+legEl+'</svg>';
  }

  try{ renderTrend(); renderCash(); renderPie(); renderSens(); }catch(e){ console.error(e); }
  </script>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { input: null, params: null, json: false, mode: "pro", html: null }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--input") args.input = argv[++i]
    else if (argv[i] === "--params") args.params = argv[++i]
    else if (argv[i] === "--json") args.json = true
    else if (argv[i] === "--mode") args.mode = argv[++i] // "pro" | "legacy"
    else if (argv[i] === "--html") {
      const next = argv[i + 1]
      args.html = next && !String(next).startsWith("--") ? argv[++i] : true
    }
  }
  return args
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isMain) {
  const args = parseArgs(process.argv)
  const isPro = args.mode !== "legacy"
  const input = args.input
    ? loadJson(args.input)
    : isPro
      ? DEFAULT_SCENARIO_INPUT_PRO
      : DEFAULT_SCENARIO_INPUT
  const params = args.params
    ? loadJson(args.params)
    : isPro
      ? DEFAULT_ENTERPRISE_PARAMS_PRO
      : DEFAULT_ENTERPRISE_PARAMS
  const result = isPro ? calculateROIPro(input, params) : calculateROI(input, params)

  if (args.html) {
    const html = renderFullReport({ result, input, params, mode: isPro ? "pro" : "legacy" })
    if (typeof args.html === "string") {
      writeFileSync(args.html, html)
      console.error(`HTML 报告已写入: ${args.html}`)
    } else {
      process.stdout.write(html + "\n")
    }
  } else if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n")
  } else {
    const fmt = (n) => Math.round(n).toLocaleString("zh-CN")
    console.log(`AI 场景: ${input.aiName || "(未命名)"}  |  模式: ${isPro ? "v2 专业核算" : "v1 原版复刻"}`)
    console.log(`ROI=${result.roi.toFixed(1)}%  回收期=${result.paybackPeriod.toFixed(1)}个月  总成本=¥${fmt(result.totalCost)}  总收益=¥${fmt(result.totalBenefit)}`)
    console.log("（--json 输出机器可读；--html [file] 输出完整报告）")
  }
}
