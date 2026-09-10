// =========================================================
// 销售POD收入确认工作台 · API 编排路由（由 mvp_spec 生成）
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


// GET /api/dashboard  →  compose
router.get("/api/dashboard", wrap(async (body, query) => {

  const [nodes] = await Promise.all([

    businessMock.getDashboard(body),

  ]);
  return { nodes: nodes };

}));

// POST /api/collection/sync  →  ai:syncCollection
router.post("/api/collection/sync", wrap(async (body, query) => {

  return await aiService.syncCollection(body);

}));

// GET /api/deliveries  →  business:getDeliveries
router.get("/api/deliveries", wrap(async (body, query) => {

  return await businessMock.getDeliveries(body);

}));

// GET /api/reconciliations  →  business:getReconciliations
router.get("/api/reconciliations", wrap(async (body, query) => {

  return await businessMock.getReconciliations(body);

}));

// POST /api/reconciliation/analyze  →  ai:analyzeReconciliation
router.post("/api/reconciliation/analyze", wrap(async (body, query) => {

  return await aiService.analyzeReconciliation(body);

}));

// POST /api/pod/check  →  ai:checkPodConditions
router.post("/api/pod/check", wrap(async (body, query) => {

  return await aiService.checkPodConditions(body);

}));

// POST /api/pod/confirm  →  ai:confirmPod
router.post("/api/pod/confirm", wrap(async (body, query) => {

  return await aiService.confirmPod(body);

}));

// POST /api/posting/execute  →  ai:executePosting
router.post("/api/posting/execute", wrap(async (body, query) => {

  return await aiService.executePosting(body);

}));


export default router;