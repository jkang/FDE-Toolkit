// =========================================================
// 分仓智能补货助手 · API 客户端
// =========================================================
import axios from 'axios';

const http = axios.create({ baseURL: '/api', timeout: 30000 });

export const api = {
  // Agent 剧本引擎（4 条故事线）
  runAgent: (data) => http.post('/agent/run', data).then((r) => r.data),

  // 故事线1 · 缺口识别
  detectGaps: (data) => http.post('/agent/gaps', data || {}).then((r) => r.data),

  // 故事线2 · 方案生成 / 调整 / HITL 确认
  generatePlan: (data) => http.post('/agent/plan', data || {}).then((r) => r.data),
  adjustPlan: (data) => http.post('/agent/plan/adjust', data || {}).then((r) => r.data),
  confirmHitl: (data) => http.post('/agent/hitl/confirm', data || {}).then((r) => r.data),

  // 故事线3 · 异常诊断
  diagnoseException: (data) => http.post('/agent/exception', data || {}).then((r) => r.data),

  // 故事线4 · 补货单下发 / 撤销 / 跟踪 / 复盘
  issueOrder: (data) => http.post('/agent/order/issue', data || {}).then((r) => r.data),
  undoOrder: (data) => http.post('/agent/order/undo', data || {}).then((r) => r.data),
  trackExecution: (params) => http.get('/agent/track', { params: params || {} }).then((r) => r.data),
  generateReview: (data) => http.post('/agent/review', data || {}).then((r) => r.data),

  // 术语
  getGlossary: () => http.get('/glossary').then((r) => r.data),

  // 业务数据
  getInventory: (params) => http.get('/business/inventory', { params: params || {} }).then((r) => r.data),
  getSalesPlan: (params) => http.get('/business/sales-plan', { params: params || {} }).then((r) => r.data),
  getNetworkDistance: (params) => http.get('/business/network-distance', { params: params || {} }).then((r) => r.data),
  getTmsStatus: (params) => http.get('/business/tms-status', { params: params || {} }).then((r) => r.data),
  getWmsReceipt: (params) => http.get('/business/wms-receipt', { params: params || {} }).then((r) => r.data),
};
