// =========================================================
// X · 采购发票校验助手 · 场景数据源（脱敏 Mock）
// 说明：数据取自 SKP 任务处理规则挖掘清单的真实决策因子 / 匹配规则 / 阈值（脱敏）。
//      差异容忍阈值与异常类型清单为「领域专家假设值 · 待访谈回填」，界面已显式标注。
// =========================================================

export const SCENARIO_META = {
  company: 'X（半导体制造 · 财务部/采购部）',
  scenario: '采购发票校验助手',
  priority: 'A1 · 🟢 速赢',
  valueStream: '采购到付款主价值流 · 价值段 3.4 发票校验与应付',
  batchLabel: '本批 2026-06 月结发票',
};

export const STAGES = [
  { key: 'P1', name: '发票多渠道采集归集', short: '发票归集', route: '/collection' },
  { key: 'P2', name: '用途确认与识别校验', short: '识别校验', route: '/recognition' },
  { key: 'P3', name: '三单匹配', short: '三单匹配', route: '/matching' },
  { key: 'P4', name: '异常凭证确认', short: '异常确认', route: '/exceptions' },
  { key: 'P5', name: '自动入账与归档', short: '入账归档', route: '/ledger' },
];

export const CHANNELS = [
  { key: 'leqi', label: '乐企同步', system: '乐企平台 · IF001', color: '#1E3A8A', count: 38, icon: '☁️' },
  { key: 'supplier', label: '供应商上传', system: '文件服务 · IF009', color: '#0E7490', count: 6, icon: '📤' },
  { key: 'manual', label: '采购补录', system: '采购补录登记', color: '#B45309', count: 2, icon: '📝' },
];

export const CHANNEL_LABEL = { '乐企同步': 'leqi', '供应商上传': 'supplier', '采购补录': 'manual' };

const SUPPLIERS = [
  'XX环保科技（脱敏）',
  '华东仪器（脱敏）',
  '苏州包材（脱敏）',
  '无锡电子（脱敏）',
  '常州泵业（脱敏）',
  '精密轴承供应商（脱敏）',
];

const MATERIALS = [
  '二级RO膜 东丽 TM720D 400',
  '反渗透膜壳 8040',
  '计量泵密封件 PTFE',
  '压力表 Y-100',
  '电磁阀 DN25',
  '精密轴承 NSK 6205',
  '管道法兰 DN80',
  '不锈钢球阀 Q41F',
];

// ---- 特殊样本（与上游规则挖掘清单一致）----
const SPECIALS = [
  { invoiceNo: '25312000000012345678', supplier: 'XX环保科技（脱敏）', channel: '乐企同步', amountExTax: 77700.00, taxAmount: 10101.00, total: 87801.00, invoiceDate: '2026-06-18', matchStatus: '匹配通过', confidence: 99, material: '二级RO膜 东丽 TM720D 400', poNo: '6300002695' },
  { invoiceNo: 'INV-2026-0618-002', supplier: '精密轴承供应商（脱敏）', channel: '供应商上传', amountExTax: 52500.00, taxAmount: 6825.00, total: 59325.00, invoiceDate: '2026-06-18', matchStatus: '数量超差', confidence: 97, material: '精密轴承 NSK 6205', poNo: '6300002695' },
  { invoiceNo: 'INV-2026-0618-003', supplier: 'XX环保科技（脱敏）', channel: '乐企同步', amountExTax: 77700.80, taxAmount: 10101.10, total: 87801.90, invoiceDate: '2026-06-18', matchStatus: '金额超尾差', confidence: 96, material: '二级RO膜 东丽 TM720D 400', poNo: '6300002695' },
  { invoiceNo: 'INV-2026-0618-004', supplier: '华东仪器（脱敏）', channel: '供应商上传', amountExTax: 36000.00, taxAmount: 4680.00, total: 40680.00, invoiceDate: '2026-06-18', matchStatus: '单价不符', confidence: 95, material: '压力表 Y-100', poNo: '6300002710' },
  { invoiceNo: '25312000000012345680', supplier: '苏州包材（脱敏）', channel: '采购补录', amountExTax: 5600.00, taxAmount: 728.00, total: 6328.00, invoiceDate: '2026-06-18', matchStatus: '抬头税号不符', confidence: 93, material: '管道法兰 DN80', poNo: '6300002695' },
  { invoiceNo: '25312000000012345681', supplier: '无锡电子（脱敏）', channel: '乐企同步', amountExTax: 24600.00, taxAmount: 3198.00, total: 27798.00, invoiceDate: '2026-06-18', matchStatus: '跨期发票', confidence: 97, material: '电磁阀 DN25', poNo: '6300002712' },
  { invoiceNo: '25312000000012345677', supplier: '常州泵业（脱敏）', channel: '乐企同步', amountExTax: 18600.00, taxAmount: 2418.00, total: 21018.00, invoiceDate: '2026-06-17', matchStatus: '匹配通过', confidence: 98, material: '不锈钢球阀 Q41F', poNo: '6300002707' },
  { invoiceNo: '25312000000012345001', supplier: 'XX环保科技（脱敏）', channel: '乐企同步', amountExTax: 3200.00, taxAmount: 416.00, total: 3616.00, invoiceDate: '2026-06-17', matchStatus: '与昨日批次重复', confidence: 99, material: '计量泵密封件 PTFE', poNo: '6300002699', dup: true },
];

const fmt2 = (n) => Math.round(n * 100) / 100;

function genRows(channel, count, seed, statuses) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const idx = seed + i;
    const amountExTax = fmt2(3200 + ((idx * 977) % 68000) + (idx % 7) * 13.37);
    const taxAmount = fmt2(amountExTax * 0.13);
    arr.push({
      invoiceNo: channel === '乐企同步' ? `25312000000012${String(346000 + idx).padStart(6, '0')}` : `INV-2026-0618-${String(100 + idx).padStart(3, '0')}`,
      supplier: SUPPLIERS[idx % SUPPLIERS.length],
      channel,
      amountExTax,
      taxAmount,
      total: fmt2(amountExTax + taxAmount),
      invoiceDate: '2026-06-18',
      matchStatus: statuses[idx % statuses.length],
      confidence: 95 + (idx % 5),
      material: MATERIALS[idx % MATERIALS.length],
      poNo: `6300002${String(690 + (idx % 30)).padStart(3, '0')}`,
    });
  }
  return arr;
}

// 渠道目标：乐企 38 / 供应商上传 6 / 采购补录 2，共 46
const leqiSpecials = SPECIALS.filter((r) => r.channel === '乐企同步');
const supplierSpecials = SPECIALS.filter((r) => r.channel === '供应商上传');
const manualSpecials = SPECIALS.filter((r) => r.channel === '采购补录');

export const INVOICES = [
  ...SPECIALS,
  ...genRows('乐企同步', 38 - leqiSpecials.length, 11, ['匹配通过', '匹配通过', '匹配通过', '匹配通过']),
  ...genRows('供应商上传', 6 - supplierSpecials.length, 41, ['匹配通过', '匹配通过']),
  ...genRows('采购补录', 2 - manualSpecials.length, 47, ['匹配通过']),
];

export const channelCounts = () => CHANNELS.map((c) => ({
  ...c,
  items: INVOICES.filter((r) => r.channel === c.label),
}));

// ---- 识别复核（票面字段 vs 结构化字段，低置信标红）----
export const RECOGNITION = [
  {
    invoiceNo: '25312000000012345678',
    supplier: 'XX环保科技（脱敏）',
    channel: '乐企同步',
    shotHint: '数电发票 · 25312000000012345678',
    fields: [
      { key: 'invoiceNo', label: '发票号', value: '25312000000012345678', confidence: 99, location: '票面右上角' },
      { key: 'amountExTax', label: '金额（不含税）', value: '77,700.00', confidence: 98, location: '票面右下角总计（大小写并存，以大写为准）' },
      { key: 'taxAmount', label: '税额', value: '10,101.00', confidence: 98, location: '票面税额栏' },
      { key: 'taxNo', label: '供应商税号', value: '91310000MA1KXXXXXX（脱敏）', confidence: 97, location: '票面销售方栏' },
      { key: 'invoiceDate', label: '开票日期', value: '2026-06-18', confidence: 99, location: '票面日期栏' },
    ],
    verify: { authentic: true, titlePass: true, supplierCode: '100XXX（SAP）' },
  },
  {
    invoiceNo: 'INV-2026-0618-005',
    supplier: '苏州包材（脱敏）',
    channel: '供应商上传',
    shotHint: '数电发票（新版式）· 金额字段模糊',
    fields: [
      { key: 'invoiceNo', label: '发票号', value: '25312000000012345690', confidence: 96, location: '票面右上角' },
      { key: 'amountExTax', label: '金额（不含税）', value: '77,700.00（人工补录）', confidence: 82, low: true, location: '票面右下角总计 · 该字段模糊' },
      { key: 'taxAmount', label: '税额', value: '10,101.00', confidence: 95, location: '票面税额栏' },
      { key: 'taxNo', label: '供应商税号', value: '91320500MA1KXXXXXX（脱敏）', confidence: 96, location: '票面销售方栏' },
      { key: 'invoiceDate', label: '开票日期', value: '2026-06-18', confidence: 97, location: '票面日期栏' },
    ],
    verify: { authentic: true, titlePass: true, supplierCode: '100XXX（SAP）' },
  },
];

// ---- 三单匹配工作集（三层匹配 + 6 条匹配规则）----
export const RULE_KEYS = [
  { key: 'supplier', label: '供应商一致性' },
  { key: 'lineAmount', label: '行金额一致性' },
  { key: 'totalAmount', label: '总金额一致性' },
  { key: 'qty', label: '数量一致性' },
  { key: 'material', label: '物料一致性' },
  { key: 'poIntegrity', label: 'PO 完整性' },
];

const okRules = { supplier: true, lineAmount: true, totalAmount: true, qty: true, material: true, poIntegrity: true };

export const MATCH_ROWS = [
  { id: 'R1', invoiceNo: '25312000000012345678', material: '二级RO膜 东丽 TM720D 400', spec: 'TM720D-400', poNo: '6300002695', poLine: '10', deliveryNo: '20260618170457663.pdf', receiptNo: 'NJ-2026061801', poQty: 42, deliveryQty: 42, receiptQty: 42, invoiceQty: 42, diffQty: 0, amountExTax: 77700.00, poAmount: 77700.00, amountDiff: 0.00, diffRate: 0, layer1: true, layer2: true, layer3: true, rules: okRules, status: '通过' },
  { id: 'R2', invoiceNo: 'INV-2026-0618-002', material: '精密轴承 NSK 6205', spec: '6205-2RS', poNo: '6300002695', poLine: '20', deliveryNo: '20260618170457664.pdf', receiptNo: 'NJ-2026061802', poQty: 500, deliveryQty: 480, receiptQty: 480, invoiceQty: 500, diffQty: 20, amountExTax: 52500.00, poAmount: 50400.00, amountDiff: 2100.00, diffRate: 4.17, layer1: false, layer2: true, layer3: true, rules: { ...okRules, qty: false, lineAmount: false }, status: '数量超差' },
  { id: 'R3', invoiceNo: 'INV-2026-0618-003', material: '二级RO膜 东丽 TM720D 400', spec: 'TM720D-400', poNo: '6300002695', poLine: '10', deliveryNo: '20260618170457663.pdf', receiptNo: 'NJ-2026061801', poQty: 42, deliveryQty: 42, receiptQty: 42, invoiceQty: 42, diffQty: 0, amountExTax: 77700.80, poAmount: 77700.00, amountDiff: 0.80, diffRate: 0.0010, layer1: true, layer2: true, layer3: true, rules: { ...okRules, totalAmount: false }, status: '金额超尾差' },
  { id: 'R4', invoiceNo: 'INV-2026-0618-004', material: '压力表 Y-100', spec: 'Y-100-1.6MPa', poNo: '6300002710', poLine: '10', deliveryNo: '20260618170457670.pdf', receiptNo: 'NJ-2026061807', poQty: 30, deliveryQty: 30, receiptQty: 30, invoiceQty: 30, diffQty: 0, amountExTax: 36000.00, poAmount: 36000.00, amountDiff: 0.00, diffRate: 0, layer1: true, layer2: true, layer3: true, rules: { ...okRules, lineAmount: false }, status: '单价不符' },
  { id: 'R5', invoiceNo: '25312000000012345680', material: '管道法兰 DN80', spec: 'DN80-PN16', poNo: '6300002695', poLine: '30', deliveryNo: '20260618170457680.pdf', receiptNo: 'NJ-2026061809', poQty: 60, deliveryQty: 60, receiptQty: 60, invoiceQty: 60, diffQty: 0, amountExTax: 5600.00, poAmount: 5600.00, amountDiff: 0.00, diffRate: 0, layer1: true, layer2: true, layer3: true, rules: { ...okRules, supplier: false }, status: '抬头税号不符' },
  { id: 'R6', invoiceNo: '25312000000012345681', material: '电磁阀 DN25', spec: 'DN25-AC220', poNo: '6300002712', poLine: '10', deliveryNo: '20260618170457690.pdf', receiptNo: 'NJ-2026061811', poQty: 18, deliveryQty: 18, receiptQty: 18, invoiceQty: 18, diffQty: 0, amountExTax: 24600.00, poAmount: 24600.00, amountDiff: 0.00, diffRate: 0, layer1: true, layer2: true, layer3: true, rules: okRules, status: '跨期发票' },
  { id: 'R7', invoiceNo: '25312000000012345677', material: '不锈钢球阀 Q41F', spec: 'Q41F-16P-DN50', poNo: '6300002707', poLine: '10', deliveryNo: '20260618170457695.pdf', receiptNo: 'NJ-2026061812', poQty: 24, deliveryQty: 24, receiptQty: 24, invoiceQty: 24, diffQty: 0, amountExTax: 18600.00, poAmount: 18600.00, amountDiff: 0.00, diffRate: 0, layer1: true, layer2: true, layer3: true, rules: okRules, status: '通过' },
  { id: 'R8', invoiceNo: '25312000000012345679', material: '反渗透膜壳 8040', spec: '8040-300PSI', poNo: '6300002701', poLine: '10', deliveryNo: '20260618170457666.pdf', receiptNo: 'NJ-2026061803', poQty: 120, deliveryQty: 120, receiptQty: 120, invoiceQty: 120, diffQty: 0, amountExTax: 12800.00, poAmount: 12800.00, amountDiff: 0.00, diffRate: 0, layer1: true, layer2: true, layer3: true, rules: okRules, status: '通过' },
];

export const FOUR_QTY_ROWS = MATCH_ROWS.map((r) => ({
  id: r.id,
  material: r.material,
  poQty: r.poQty,
  deliveryQty: r.deliveryQty,
  receiptQty: r.receiptQty,
  invoiceQty: r.invoiceQty,
  diffQty: r.diffQty,
  status: r.status,
}));

// ---- 异常凭证队列 ----
export const EXCEPTIONS = [
  {
    id: 'EX1', invoiceNo: 'INV-2026-0618-002', type: '数量超差', level: 'error', status: '待确认',
    detail: '精密轴承 NSK 6205：发票 500 件 > 入库 480 件，差异 20 件；四数量对照 PO 500 / 送货 480 / 入库 480 / 发票 500。',
    suggestion: '与供应商确认少送 20 件 → 走补单流程；补单到货后自动重跑三单匹配。',
    owner: '采购员李强', escalate: '2 个工作日未响应升级财务负责人（陈静）',
    basis: '差异容忍与异常判定经验（数量无容忍区间 · 领域专家假设值，待访谈回填）',
    hitl: true,
  },
  {
    id: 'EX2', invoiceNo: 'INV-2026-0618-003', type: '金额超尾差', level: 'warning', status: '已放行',
    detail: '发票不含税 ¥77,700.80 vs PO ¥77,700.00，尾差 ¥0.80，差异率 0.0010%（≤1 元且 ≤0.5%）→ 自动容忍放行。',
    suggestion: '容忍区间内自动放行，仅留痕备查；若超容忍则必拉人。',
    owner: '应付会计王敏', escalate: '超容忍升级财务负责人',
    basis: '金额比对规则（ERP 模拟校验接口承载） + 差异容忍与异常判定经验（假设值）',
    hitl: false,
  },
  {
    id: 'EX3', invoiceNo: '25312000000012345680', type: '抬头/税号不符', level: 'error', status: '换票中',
    detail: '购方抬头税号与主数据不一致；供应商标准名 苏州包材（脱敏）= 供应商代码 100XXX（SAP）。',
    suggestion: '生成换票说明备注，联系供应商换票；换票后重新识别校验。',
    owner: '采购员李强', escalate: '3 个工作日未换票升级财务负责人',
    basis: '供应商/税号/科目映射字典（术语字典类）',
    hitl: true,
  },
  {
    id: 'EX4', invoiceNo: 'INV-2026-0618-004', type: '单价不符', level: 'error', status: '待确认',
    detail: '压力表 Y-100：发票单价高于 PO 约定单价，行金额一致性不通过。',
    suggestion: '与采购确认单价差异，必要时走合同变更；确认前不得预制。',
    owner: '采购员李强', escalate: '2 个工作日未响应升级财务负责人',
    basis: '金额比对规则（ERP 模拟校验接口承载）；决策因子确定性：中（待访谈回填）',
    hitl: true,
  },
  {
    id: 'EX5', invoiceNo: '25312000000012345681', type: '跨期发票', level: 'warning', status: '待确认',
    detail: '开票日期 2026-06-18，早于本会计期间归属，属跨期发票。',
    suggestion: '确认归属期间，必要时冲红重开；归属确认后方可入账。',
    owner: '应付会计王敏', escalate: '跨期超 1 个期间升级财务负责人',
    basis: '异常类型清单（领域专家假设值，待访谈回填）',
    hitl: true,
  },
];

// ---- 入账与归档台账（匹配通过 41 张，其中 2 张预制失败）----
const PASSED = INVOICES.filter((r) => r.matchStatus === '匹配通过');
const FAIL_IDX = new Set([3, 17]); // 2 张因成本中心缺失预制失败

export const buildLedger = () => PASSED.map((r, i) => {
  const fail = FAIL_IDX.has(i);
  return {
    id: `L${i + 1}`,
    invoiceNo: r.invoiceNo,
    supplier: r.supplier,
    amountExTax: r.amountExTax,
    gateCheck: fail ? '成本中心缺失' : '全绿',
    gateOk: !fail,
    prebookStatus: fail ? '预制失败' : '待预制',
    voucherNo: '—',
    postStatus: '待过账',
    leqiStatus: '待更新',
    archiveIndex: '—',
    failReason: fail ? '成本中心（CC-3021）缺失，无法生成预制凭证' : '',
    advice: fail ? '补齐成本中心后重试，或转人工线下处理' : '',
  };
});

export const LEDGER = buildLedger();

export const PREBOOK_GATES = [
  '发票已识别',
  '发票行已存在匹配关系',
  '关键差异已保存说明',
  '供应商/PO/入库信息完整',
  '金额/数量/物料校验通过',
  '用户具备预制权限',
];

// ---- 术语字典（供应商/税号/科目映射）----
export const DICTIONARY = [
  { term: '供应商标准名', def: 'XX环保科技（脱敏）', context: '校验发票真伪与购方抬头' },
  { term: '供应商代码', def: '100XXX（SAP）', context: '预制发票凭证' },
  { term: '统一社会信用代码', def: '91310000MA1KXXXXXX（脱敏）', context: '校验发票真伪与购方抬头' },
  { term: 'SAP 会计科目', def: '材料采购 / 应付账款 / 应交税费-进项税', context: '预制 / 过账' },
  { term: '成本中心', def: 'CC-3021（制造费用）· 缺失会导致预制失败', context: '预制发票凭证' },
  { term: '付款条件', def: '30 天净账期', context: '预制发票凭证' },
];

// ---- 待办通知中心 ----
export const TODO_ITEMS = [
  { id: 'td1', type: '识别复核待办', count: 1, desc: 'INV-2026-0618-005 金额字段置信度 82% < 95%', route: '/recognition', level: 'warning' },
  { id: 'td2', type: '异常待办', count: 4, desc: '数量超差 / 抬头税号不符 / 单价不符 / 跨期发票', route: '/exceptions', level: 'error' },
  { id: 'td3', type: '预制失败待补', count: 2, desc: '2 张因成本中心缺失预制失败', route: '/ledger', level: 'warning' },
  { id: 'td4', type: '过账待审', count: 39, desc: '39 张预制发票待财务负责人过账审核', route: '/ledger', level: 'processing' },
];

export const formatMoney = (n) => Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
