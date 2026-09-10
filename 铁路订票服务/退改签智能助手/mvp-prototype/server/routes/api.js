// =========================================================
// 退改签智能助手 · API 编排路由（由 mvp_spec 生成）
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


// POST /api/scene/identify  →  ai:identifyScene
router.post("/api/scene/identify", wrap(async (body, query) => {

  return await aiService.identifyScene(body);

}));

// POST /api/fee/translate  →  ai:translateFee
router.post("/api/fee/translate", wrap(async (body, query) => {

  return await aiService.translateFee(body);

}));

// POST /api/plan/recommend  →  ai:recommendPlans
router.post("/api/plan/recommend", wrap(async (body, query) => {

  return await aiService.recommendPlans(body);

}));

// POST /api/change/dispose  →  ai:disposeChange
router.post("/api/change/dispose", wrap(async (body, query) => {

  return await aiService.disposeChange(body);

}));

// POST /api/notice/push  →  ai:pushNotice
router.post("/api/notice/push", wrap(async (body, query) => {

  return await aiService.pushNotice(body);

}));

// GET /api/order  →  business:getOrder
router.get("/api/order", wrap(async (body, query) => {

  return await businessMock.getOrder(body);

}));

// GET /api/run-status  →  business:getRunStatus
router.get("/api/run-status", wrap(async (body, query) => {

  return await businessMock.getRunStatus(body);

}));


export default router;