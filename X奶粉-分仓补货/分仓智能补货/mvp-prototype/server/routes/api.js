// =========================================================
// 分仓智能补货助手 · API 编排路由
// AI 能力 → aiService（Mock）；业务数据 → businessMock（Mock）
// =========================================================
import { Router } from 'express';
import { aiService } from '../services/aiService.js';
import { businessMock } from '../services/businessMock.js';

const router = Router();

// 统一错误包装
const wrap = (fn) => async (req, res) => {
  try {
    const data = await fn(req.body || {}, req.query || {}, req.params || {});
    res.json(data);
  } catch (e) {
    console.error('[api] 路由错误:', e);
    res.status(500).json({ error: e.message || 'Internal Error' });
  }
};

// ---- Agent 剧本引擎（4 条演示故事线） ----
router.post('/api/agent/run', wrap(async (body) => aiService.runAgent(body)));

// ---- 故事线1 · 缺口识别 ----
router.post('/api/agent/gaps', wrap(async (body) => aiService.detectGaps(body)));

// ---- 故事线2 · 方案生成 / HITL 确认 / 调整 ----
router.post('/api/agent/plan', wrap(async (body) => aiService.generatePlan(body)));
router.post('/api/agent/plan/adjust', wrap(async (body) => aiService.adjustPlan(body)));
router.post('/api/agent/hitl/confirm', wrap(async (body) => aiService.confirmHitl(body)));

// ---- 故事线3 · 异常诊断与备选 ----
router.post('/api/agent/exception', wrap(async (body) => aiService.diagnoseException(body)));

// ---- 故事线4 · 补货单下发 / 撤销 / 跟踪 / 复盘 ----
router.post('/api/agent/order/issue', wrap(async (body) => aiService.issueOrder(body)));
router.post('/api/agent/order/undo', wrap(async (body) => aiService.undoOrder(body)));
router.get('/api/agent/track', wrap(async (body, query) => aiService.trackExecution(query)));
router.post('/api/agent/review', wrap(async (body) => aiService.generateReview(body)));

// ---- 术语口径 ----
router.get('/api/glossary', wrap(async () => aiService.getGlossary()));

// ---- 业务数据接口 ----
router.get('/api/business/inventory', wrap(async () => businessMock.getWarehouseInventory()));
router.get('/api/business/sales-plan', wrap(async () => businessMock.getSalesPlan()));
router.get('/api/business/network-distance', wrap(async () => businessMock.getNetworkDistance()));
router.get('/api/business/tms-status', wrap(async () => businessMock.getTmsStatus()));
router.get('/api/business/wms-receipt', wrap(async () => businessMock.getWmsReceipt()));

export default router;
