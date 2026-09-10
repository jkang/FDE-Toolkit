// =========================================================
// 分仓智能补货助手 · Mock AI Service（独立 AI 能力模块）
// 说明：概念级 MVP · 数据为脱敏演示数据 · SKP 完成后需回填精化
//       当前为 Mock 实现（含模拟延迟），后续可抽离为独立 AI 微服务。
// =========================================================

const latency = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------
// 公共 Mock 数据（脱敏 · 业务量级参考 SRP 场景画布与客户采集表）
// ---------------------------------------------------------
export const MOCK = {
  baseWarehouses: [
    { code: 'TJ-BASE', name: '天津基地仓', region: '华北', totalAvailable: 62000, inTransit: 18000, pendingCheck: 5200, qualified: 59800 },
    { code: 'HS-BASE', name: '呼市基地仓', region: '华北', totalAvailable: 48000, inTransit: 9600, pendingCheck: 3100, qualified: 46200 },
    { code: 'DM-BASE', name: '杜蒙基地仓', region: '东北', totalAvailable: 35500, inTransit: 7200, pendingCheck: 2600, qualified: 34100 },
    { code: 'WH-BASE', name: '武汉基地仓', region: '华中', totalAvailable: 41000, inTransit: 12400, pendingCheck: 3800, qualified: 39500 },
  ],
  saleWarehouses: [
    { code: 'BJ-SHUNYI', name: '北京顺义仓', region: '华北', priority: 'P0' },
    { code: 'TJ-WUQING', name: '天津武清仓', region: '华北', priority: 'P1' },
    { code: 'GZ-BAIYUN', name: '广州白云仓', region: '华南', priority: 'P1' },
    { code: 'ZZ-HKG', name: '郑州航空港仓', region: '华中', priority: 'P2' },
    { code: 'CD-QBJ', name: '成都青白江仓', region: '西南', priority: 'P2' },
    { code: 'WH-XD', name: '武汉东西湖仓', region: '华中', priority: 'P1' },
    { code: 'HS-JQ', name: '呼市金桥仓', region: '华北', priority: 'P2' },
    { code: 'JN-YQ', name: '济南遥墙仓', region: '华东', priority: 'P2' },
    { code: 'LZ-LB', name: '柳州柳北仓', region: '华南', priority: 'P2' },
    { code: 'HF-XQ', name: '合肥新桥仓', region: '华东', priority: 'P1' },
    { code: 'ZZ-DAX', name: '郑州大学路仓', region: '华中', priority: 'P2' },
  ],
  gapRows: [
    { warehouse: '北京顺义仓', sku: '金领冠珍护 1段900g', salePlan14d: 980, available: 3900, inTransit: 1200, dos: 5, level: '红' },
    { warehouse: '北京顺义仓', sku: '金领冠珍护 3段900g', salePlan14d: 760, available: 3100, inTransit: 800, dos: 6, level: '红' },
    { warehouse: '天津武清仓', sku: '金领冠珍护 1段900g', salePlan14d: 760, available: 2100, inTransit: 0, dos: 8, level: '黄' },
    { warehouse: '广州白云仓', sku: '金领冠珍护 1段900g', salePlan14d: 1420, available: 1800, inTransit: 3000, dos: 11, level: '黄' },
    { warehouse: '广州白云仓', sku: '金领冠睿护 3段800g', salePlan14d: 880, available: 2600, inTransit: 0, dos: 12, level: '黄' },
    { warehouse: '合肥新桥仓', sku: '金领冠珍护 1段900g', salePlan14d: 640, available: 2300, inTransit: 1000, dos: 13, level: '黄' },
    { warehouse: '武汉东西湖仓', sku: '安儿宝 2段900g', salePlan14d: 700, available: 2600, inTransit: 900, dos: 10, level: '黄' },
    { warehouse: '郑州航空港仓', sku: '金领冠珍护 1段900g', salePlan14d: 860, available: 4800, inTransit: 0, dos: 16, level: '正常' },
    { warehouse: '成都青白江仓', sku: '金领冠睿护 3段800g', salePlan14d: 640, available: 5100, inTransit: 0, dos: 22, level: '正常' },
    { warehouse: '济南遥墙仓', sku: '金领冠睿护 3段800g', salePlan14d: 520, available: 6200, inTransit: 0, dos: 33, level: '正常' },
    { warehouse: '呼市金桥仓', sku: '金领冠珍护 2段900g', salePlan14d: 300, available: 3900, inTransit: 0, dos: 42, level: '正常' },
    { warehouse: '柳州柳北仓', sku: '安儿宝 2段900g', salePlan14d: 180, available: 4200, inTransit: 0, dos: 65, level: '蓝' },
    { warehouse: '济南遥墙仓', sku: '安儿宝 3段800g', salePlan14d: 160, available: 4100, inTransit: 0, dos: 72, level: '蓝' },
  ],
  planRowsA: [
    { warehouse: '北京顺义仓', sku: '金领冠珍护 1段900g', jhSuggested: 1200, allocated: 1344, afterDays: 12, priority: 'P0-紧急', targetFillRate: '100%（封顶）', reason: '促销放量，分配量较京慧建议上调 12%' },
    { warehouse: '天津武清仓', sku: '金领冠珍护 1段900g', jhSuggested: 800, allocated: 800, afterDays: 10, priority: 'P1-常规', targetFillRate: '95%', reason: '' },
    { warehouse: '广州白云仓', sku: '金领冠珍护 1段900g', jhSuggested: 1600, allocated: 1600, afterDays: 13, priority: 'P1-常规', targetFillRate: '88%', reason: '' },
    { warehouse: '郑州航空港仓', sku: '金领冠珍护 1段900g', jhSuggested: 900, allocated: 900, afterDays: 17, priority: 'P2-观察', targetFillRate: '90%', reason: '' },
    { warehouse: '合肥新桥仓', sku: '金领冠珍护 1段900g', jhSuggested: 700, allocated: 700, afterDays: 14, priority: 'P1-常规', targetFillRate: '86%', reason: '' },
    { warehouse: '武汉东西湖仓', sku: '安儿宝 2段900g', jhSuggested: 800, allocated: 800, afterDays: 11, priority: 'P1-常规', targetFillRate: '89%', reason: '' },
  ],
  planRowsB: [
    { warehouse: '北京顺义仓', sku: '金领冠珍护 1段900g', jhSuggested: 1200, allocated: 1500, afterDays: 14, priority: 'P0-紧急', targetFillRate: '100%（封顶）', reason: '促销放量，优先保障顺义' },
    { warehouse: '天津武清仓', sku: '金领冠珍护 1段900g', jhSuggested: 800, allocated: 750, afterDays: 9, priority: 'P1-常规', targetFillRate: '95%', reason: '武清周转快，压 50 罐' },
    { warehouse: '广州白云仓', sku: '金领冠珍护 1段900g', jhSuggested: 1600, allocated: 1500, afterDays: 12, priority: 'P1-常规', targetFillRate: '88%', reason: '' },
    { warehouse: '郑州航空港仓', sku: '金领冠珍护 1段900g', jhSuggested: 900, allocated: 850, afterDays: 16, priority: 'P2-观察', targetFillRate: '90%', reason: '' },
    { warehouse: '合肥新桥仓', sku: '金领冠珍护 1段900g', jhSuggested: 700, allocated: 650, afterDays: 13, priority: 'P1-常规', targetFillRate: '86%', reason: '' },
    { warehouse: '武汉东西湖仓', sku: '安儿宝 2段900g', jhSuggested: 800, allocated: 850, afterDays: 12, priority: 'P1-常规', targetFillRate: '89%', reason: '补充在途延误缺口' },
  ],
  alternativeRows: [
    { option: '方案A · 华东大仓直供', sourceWarehouse: '华东基地仓', distance: 812, transitDays: 2, availability: 12800, stockRate: '92%', warning: '无预警' },
    { option: '方案B · 华中大仓中转', sourceWarehouse: '武汉基地仓', distance: 1046, transitDays: 3, availability: 8600, stockRate: '85%', warning: '预计 2 日后有降雨，时效+0.5天' },
    { option: '方案C · 就近仓拼车', sourceWarehouse: '天津基地仓', distance: 356, transitDays: 1, availability: 4200, stockRate: '78%', warning: '无预警' },
  ],
  orders: [
    { code: 'TB-20260823-001', shipFrom: '天津基地仓', shipTo: '北京顺义仓', sku: '金领冠珍护 1段900g', qty: 1344, status: '已下发·待装车', eta: '2026-08-24' },
    { code: 'TB-20260823-002', shipFrom: '天津基地仓', shipTo: '天津武清仓', sku: '金领冠珍护 1段900g', qty: 800, status: '已下发·待装车', eta: '2026-08-23' },
    { code: 'TB-20260823-003', shipFrom: '武汉基地仓', shipTo: '广州白云仓', sku: '金领冠珍护 1段900g', qty: 1600, status: '已下发·待装车', eta: '2026-08-26' },
    { code: 'TB-20260823-004', shipFrom: '武汉基地仓', shipTo: '郑州航空港仓', sku: '金领冠珍护 1段900g', qty: 900, status: '已下发·待装车', eta: '2026-08-25' },
  ],
  trackRows: [
    { orderCode: 'TB-20260823-001', vehicle: '津A·8K32F', position: '京津高速·王庆坨出口', status: '运输中', progress: 62, eta: '2026-08-24 11:00' },
    { orderCode: 'TB-20260823-002', vehicle: '—', position: '天津基地仓·月台3', status: '待装车', progress: 12, eta: '2026-08-23 18:00' },
    { orderCode: 'TB-20260823-003', vehicle: '鄂A·2M15Q', position: '京港澳高速·孝感段', status: '运输中', progress: 45, eta: '2026-08-26 09:00' },
    { orderCode: 'TB-20260823-004', vehicle: '已入库', position: '郑州航空港仓·收货区', status: '已入库', progress: 100, eta: '2026-08-23 10:20', diff: '0.33%' },
  ],
};

// ---------------------------------------------------------
// 剧本引擎：4 条演示故事线的完整 Agent 运行剧本
// 前端按 steps 顺序播放（状态徽章 / 思考 / 工具卡 / 流式 / 内联组件 / HITL / 出处）
// ---------------------------------------------------------
function buildScript(story, userInput) {
  const S = {
    s1: {
      story: 's1',
      steps: [
        { type: 'status', status: 'thinking', label: '正在拉取全仓网数据…' },
        { type: 'thinking', title: '缺口识别思路', content: '按 SKP 缺口分级规则（决策因子：库存天数 DOS、未来14天需求、促销计划）：拉取 4 个基地仓可分配库存 + 在途，匹配未来 14 天销售计划，计算各仓×SKU 库存可销天数 DOS。判定口径——红色＝可发量+在途<未来7天需求 且 DOS<7（紧急补货）；黄色＝7≤DOS<14（常规补货）；蓝色＝DOS>60 且无促销（积压预警，有促销则抑制）。' },
        { type: 'tool', name: '读现货库存', system: '库存系统', target: '4 基地仓 · 可发量/待检/合格', status: 'done', latency: 210 },
        { type: 'tool', name: '读在途库存', system: '库存系统', target: '4 基地仓 · 在途总量/已下发未发货', status: 'done', latency: 180 },
        { type: 'tool', name: '读销售计划+促销', system: '奶粉分仓补调系统', target: '11 销售分仓 · 未来14天销售计划 + 促销计划', status: 'done', latency: 240 },
        { type: 'stream', text: '已扫描 4 基地仓 × 11 销售分仓 × 近 700 SKU 货源。识别出红色缺口 2 项（北京顺义仓·金领冠珍护 1段/3段，可发量+在途已低于未来 7 天需求且 DOS<7）、黄色缺口 5 项、蓝色积压 3 项——柳州/济南的安儿宝大日期库存偏高且无促销，建议纳入促销联动消化。' },
        { type: 'artifact', kind: 'supplyOverview', data: { base: MOCK.baseWarehouses, sale: MOCK.saleWarehouses, gaps: MOCK.gapRows } },
        {
          type: 'final', text: '全仓网供需全景已生成，详见右侧看板。',
          sources: [
            { name: '现货库存', system: '库存系统', trust: '高 · 准实时', desc: '字段：可发量（库存-已分配量）/ 待检 / 合格' },
            { name: '在途库存', system: '库存系统', trust: '高 · 准实时', desc: '字段：在途总量（易错：勿取已下发未发货）' },
            { name: '销售计划', system: '奶粉分仓补调系统', trust: '高 · 批量', desc: '字段：分仓×SKU×14天计划' },
            { name: '缺口分级规则', system: 'SKP 决策模型类', trust: '专家盲测一致率≥90%', desc: '红＝可发量+在途<未来7天需求 且 DOS<7 · 黄 7~14 · 蓝>60 且无促销' },
          ],
        },
      ],
    },
    s2: {
      story: 's2',
      steps: [
        { type: 'status', status: 'thinking', label: '正在读取京慧建议量并求解分配方案…' },
        { type: 'thinking', title: '多约束分配求解思路', content: '按 SKP 备货率分配规则：生产备货率=(现货+在途+本月已出库)/销售计划，订单完成率=(当月未发+本月累出)/销售计划，目标备货率=订单进度+20%（封顶 100%，中旬标准 50%）。叠加约束：① 分配量≤可发量（硬约束）；② 就近优先选仓（可发量覆盖且时效最快）；③ 凑车微调 ±200 件；④ 分配后库存天数≥安全水位。冲突仲裁：可发量约束 > 时效优先。' },
        { type: 'tool', name: '读京慧建议量', system: '京慧一盘货', target: '11 销售分仓 × 本周建议量', status: 'done', latency: 320 },
        { type: 'tool', name: '读可发量/订单完成率', system: '奶粉分仓补调系统', target: '基地仓可发量 · 分仓订单完成率', status: 'done', latency: 260 },
        { type: 'tool', name: '读促销计划+旬度进度', system: '促销管理系统', target: '本周 140+ 广促品 · 旬度标准进度（中旬50%）', status: 'done', latency: 190 },
        { type: 'stream', text: '多约束求解完成：目标备货率=订单进度+20%（封顶 100%）已应用到各仓。方案A 均衡版全仓分配后库存天数均在 10 天以上；方案B 优先版将北京顺义仓上调至 1500 罐（优先保障促销放量）。两版均满足可发量硬约束与安全水位。' },
        { type: 'artifact', kind: 'allocationPlan', data: { planA: MOCK.planRowsA, planB: MOCK.planRowsB, current: 'A' } },
        {
          type: 'hitl', key: 'alloc-confirm',
          banner: 'HITL 拦截：北京顺义仓分配量 1344 罐，较京慧建议量 1200 罐上调 12%（因促销放量），需人工确认后写入分配量。',
          detail: '决策因子：目标备货率已按「订单进度+20%」计算并封顶 100%；北京顺义仓本周促销放量且 DOS 已低于 7 天（红色缺口），按「促销放量优先保障」规则上调 12%。',
          options: ['确认并写入分配量', '改用方案B', '修改后重新校验'],
        },
        {
          type: 'final', text: '已按人工确认写入分配量并重新校验：北京顺义仓 1344 罐（+12% 已确认）、天津武清仓 800 罐（人工修改，凑车 ±200 件内）。全部约束校验通过（可发量不超 · 安全水位达标），可进入补货单下发。',
          sources: [
            { name: '京慧建议量', system: '京慧一盘货', trust: '高 · 建议基准', desc: '分配量以建议量为基准，偏离>10% 需 HITL 确认' },
            { name: '备货率分配规则', system: 'SKP 决策模型类', trust: '专家盲测一致率≥90%', desc: '目标备货率=订单进度+20% 封顶100%（中旬标准50%）' },
            { name: '分配量调整经验', system: 'SKP 决策模型类', trust: '高 · 已深挖', desc: '可发量约束>时效优先 · 就近选仓 · 凑车±200件' },
          ],
        },
      ],
    },
    s3: {
      story: 's3',
      steps: [
        { type: 'status', status: 'thinking', label: '正在诊断华北基地仓可发量缺口…' },
        { type: 'thinking', title: '异常诊断思路', content: '按 SKP 分配量调整经验冲突仲裁：可发量约束 > 时效优先。华北基地仓（天津/呼市）可发量不足覆盖缺口时，检索周边资源（华东大仓/武汉基地仓/就近拼车），按「拆分多仓补足」生成备选方案；物流预警数据缺失时降级为历史运输时效估算并升级人工复核。' },
        { type: 'tool', name: '读仓网距离', system: '仓网主数据', target: '周边基地仓 → 华北分仓 里程', status: 'done', latency: 200 },
        { type: 'tool', name: '读物流预警', system: 'TMS', target: '各线路 物流预警/天气/限行', status: 'error', error: 'TMS 物流预警接口未接通（评级 C · 需开发）' },
        { type: 'tool', name: '读各仓可发量', system: '库存系统', target: '周边基地仓 可发量/安全水位', status: 'done', latency: 150 },
        { type: 'stream', text: '华北基地仓可发量不足覆盖缺口（缺口约 45%），已按「可发量约束 > 时效优先」检索周边资源，拆分多仓补足并给出 3 套备选。⚠️ 注意：物流预警数据暂未接通，已按历史运输时效估算，建议人工复核后下发。' },
        { type: 'artifact', kind: 'alternativePlan', data: { rows: MOCK.alternativeRows, degraded: true } },
        {
          type: 'final', text: '推荐方案A（华东大仓直供）：可发量 12800 罐可覆盖、距离 812km、时效 2 天、生产备货率 92%。请人工复核物流预警列（当前为历史运输时效估算）后决定。',
          sources: [
            { name: '仓网距离', system: '仓网主数据', trust: '高 · 静态主数据', desc: '字段：线路里程 / 标准时效' },
            { name: '物流预警', system: 'TMS', trust: '低 · 未接通降级', desc: '已按历史运输时效估算，人工复核' },
            { name: '各仓可发量', system: '库存系统', trust: '高 · 准实时', desc: '可发量约束 > 时效优先 · 拆分多仓补足' },
          ],
        },
      ],
    },
    s4: {
      story: 's4',
      steps: [
        { type: 'status', status: 'thinking', label: '正在校验补货单并下发…' },
        { type: 'thinking', title: '补货单校验与下发思路', content: '按补货单校验规则逐单校验：① 收发仓合法性；② SKU 编码在册；③ 数量 ≤ 可发量且为正整数；④ 时效满足 ETA。校验通过后写入物流调度 + 财务核算，保留 10 秒撤销窗口。' },
        { type: 'tool', name: '补货单校验', system: '奶粉分仓补调系统', target: '4 张补货单 · 收发仓/SKU/数量/时效', status: 'done', detail: '4/4 全部通过' },
        { type: 'tool', name: '写物流调度', system: '物流调度系统', target: '4 张补货单下发', status: 'done', detail: '写入成功' },
        { type: 'tool', name: '写财务核算', system: '财务核算系统', target: '4 张补货单下发', status: 'done', detail: '写入成功' },
        { type: 'stream', text: '4 张补货单校验全部通过（收发仓/SKU/数量/时效），已下发物流调度与财务核算。已下发，10 秒内可撤销。' },
        { type: 'artifact', kind: 'replenishOrders', data: { orders: MOCK.orders, issuedAt: '2026-08-23 10:05', undoWindow: 10 } },
        {
          type: 'final', text: '补货单已下发，正在跟踪在途执行。',
          sources: [
            { name: '补货单校验规则', system: '知识资产', trust: '高 · 显性规则', desc: '收发仓/SKU/数量/时效 4 项校验' },
            { name: 'TMS 定位', system: 'TMS', trust: '中 · 准实时', desc: '车辆定位 / 运输状态 / 延误预警' },
            { name: 'WMS 入库验收', system: 'WMS', trust: '中 · 准实时', desc: '运单实收 / 差异率阈值 0.5%' },
          ],
        },
      ],
    },
  };
  return S[story] || S.s1;
}

// ---------------------------------------------------------
// Mock AI 服务（脚手架方法 + 剧本引擎 + 扩展方法）
// ---------------------------------------------------------
export const aiService = {
  // ---- 剧本引擎：按故事线返回完整 Agent 运行剧本 ----
  async runAgent(body = {}) {
    await latency(260);
    const story = body.story || 's1';
    const userInput = body.userInput || '';
    const script = buildScript(story, userInput);
    return { agent: '分货方案助理', persona: '物流计划岗', story, userInput, steps: script.steps };
  },

  // ---- 故事线1：缺口识别 ----
  async detectGaps(body = {}) {
    await latency(900);
    return {
      summary: '已扫描 4 基地仓 × 11 销售分仓 × 近 700 SKU 货源，识别红色缺口 2 项、黄色缺口 5 项、蓝色积压 3 项',
      createdAt: '2026-08-23 09:30',
      base: MOCK.baseWarehouses,
      sale: MOCK.saleWarehouses,
      gaps: MOCK.gapRows,
    };
  },

  // ---- 故事线2：方案生成 ----
  async generatePlan(body = {}) {
    await latency(1400);
    return {
      summary: '已按本周销售计划 + 京慧建议量多约束求解，生成 2 版方案（A 均衡版 / B 优先版）。北京顺义仓因促销放量较京慧建议上调 12%，等待人工确认。',
      planVersion: 'A',
      planA: MOCK.planRowsA,
      planB: MOCK.planRowsB,
      rows: MOCK.planRowsA,
    };
  },

  // ---- 故事线2：HITL 确认 / 方案调整 ----
  async adjustPlan(body = {}) {
    await latency(800);
    const rows = (body.rows || MOCK.planRowsA).map((r) => ({
      ...r,
      reason: r.warehouse === '北京顺义仓' ? '促销放量，上调 12%（人工确认）' : (r.reason || (r.reason === '' ? '' : r.reason)),
    }));
    return {
      summary: '已按人工确认更新分配量：北京顺义仓 1344 罐（上调 12% 已确认）、天津武清仓 800 罐（人工修改）。全部约束重新校验通过。',
      validated: true,
      violations: [],
      rows,
    };
  },

  async confirmHitl(body = {}) {
    await latency(500);
    return {
      accepted: true,
      summary: body.decision || '已确认，分配量已写入，约束重新校验通过',
    };
  },

  // ---- 故事线3：异常诊断 ----
  async diagnoseException(body = {}) {
    await latency(1100);
    return {
      summary: '华北基地仓可发量 3.2 万罐，不足覆盖缺口 5.8 万罐（缺口约 45%），已按「可发量约束 > 时效优先」检索周边资源并拆分多仓补足，给出 3 套备选。注意：TMS 物流预警数据暂未接通，已按历史运输时效估算，建议人工复核。',
      rows: MOCK.alternativeRows,
      degraded: true,
      degradedMessage: 'TMS 物流预警数据暂未接通（评级 C · 需开发），已按历史时效估算，建议人工复核后下发。',
    };
  },

  // ---- 故事线4：补货单下发 ----
  async issueOrder(body = {}) {
    await latency(700);
    return {
      summary: '4 张补货单已校验通过（收发仓/SKU/数量/时效 全部通过）并下发物流调度与财务核算。已下发，10 秒内可撤销。',
      issuedAt: '2026-08-23 10:05',
      undoWindow: 10,
      orders: MOCK.orders,
    };
  },

  // ---- 故事线4：撤销回滚 ----
  async undoOrder(body = {}) {
    await latency(300);
    return {
      rolledBack: true,
      summary: '已撤销补货单下发（批次 TB-20260823），物流调度与财务侧回滚完成，补货单回到「待下发」状态。',
      orders: MOCK.orders.map((o) => ({ ...o, status: '待下发·已回滚' })),
    };
  },

  // ---- 故事线4：执行跟踪 ----
  async trackExecution(body = {}) {
    await latency(400);
    return {
      refreshedAt: '2026-08-23 14:00',
      rows: MOCK.trackRows,
      alerts: [
        { level: 'warning', text: 'TB-20260823-003 京港澳高速孝感段拥堵，预计延误 2 小时（未超 24h 阈值，仅提示）' },
        { level: 'info', text: 'TB-20260823-004 已入库，实收 897/900 罐，差异率 0.33% 属正常损耗（阈值 0.5%）' },
      ],
    };
  },

  // ---- 故事线4：月度复盘（SKP 复盘调参经验：90%/85%/10% 阈值 + 短板分析） ----
  async generateReview(body = {}) {
    await latency(900);
    return {
      period: '2026-07-26 ~ 2026-08-22',
      kpi: [
        { key: 'timeliness', label: '时效达成率', value: 92, suffix: '%', trend: '+4.1%', target: '≥90%', status: '达标' },
        { key: 'stockout', label: '缺货缓解率', value: 88, suffix: '%', trend: '+6.3%', target: '≥85%', status: '达标' },
        { key: 'turnover', label: '库存周转天数', value: 31, suffix: '天', trend: '-3.2天', target: '同比降幅≤10%', status: '改善' },
        { key: 'freshness', label: '商品新鲜度', value: 94, suffix: '%', trend: '+2.0%', target: '临期占比<3%', status: '达标' },
      ],
      analysis: [
        { topic: '时效达成率 92%', level: 'green', text: '达标（≥90%）。京港澳孝感段 2 次拥堵延误均未超 24h 阈值，仅提示未拉人；建议保持当前物流线路配置。' },
        { topic: '缺货缓解率 88%', level: 'green', text: '达标（≥85%）。华北区已连续 3 个月高于阈值，可适度下调安全水位释放周转。' },
        { topic: '广州白云仓大日期占比 6.8%', level: 'amber', text: '短板：华南大日期库存偏高（阈值参考 3%），建议华南维持水位并加强促销联动消化，纳入下月跟踪。' },
      ],
      suggestions: [
        { region: '华北区域', current: '14 天', target: '12 天', reason: '过去 3 个月华北缺货缓解率持续高于 85%（SKP 复盘调参经验：缺货缓解率≥85% 达标），安全水位可下调 2 天释放周转空间', impact: '预计释放约 1.1 万罐周转库存' },
        { region: '华南区域', current: '16 天', target: '16 天', reason: '广州白云仓大日期占比偏高（6.8%），维持水位并加强促销联动消化（短板分析项）', impact: '关注大日期库存' },
      ],
      thresholds: 'SKP 复盘调参经验：时效达成率<90% 优化物流/上调水位 · 缺货缓解率<85% 优化预测/促销上浮 · 周转率同比降>10% 下调水位（指标矛盾时：时效达成率优先于周转优化）',
    };
  },

  // ---- 术语口径（SKP 术语字典类·分货业务口径词典 · 6 个口径） ----
  async getGlossary() {
    await latency(60);
    return [
      { term: '可发量', define: '库存 - 已分配量（现货库存）；下发量不得超出；变体：抵扣后库存' },
      { term: '待检', define: '现货库存 status=待检，已到货未完成质检放行，不可用于可发量（易错：与合格混用）' },
      { term: '合格', define: '现货库存 status=合格，已完成质检放行、可正常发货的库存' },
      { term: '在途', define: '已发未入库 / 已下发未发货；取值用「在途总量」而非「已下发未发货」（易错点）' },
      { term: '库存天数(DOS)', define: 'DOS =（库存量 + 在途 + 分配）/ 日均销售计划；<7 红、7-14 黄、>60 蓝（且无促销）' },
      { term: '生产备货率', define: '生产备货率 =（现货 + 在途 + 本月已出库）/ 销售计划' },
      { term: '订单完成率', define: '订单完成率 =（当月未发 + 本月累出）/ 销售计划；目标备货率 = 订单进度 + 20%（封顶 100%）' },
    ];
  },
};
