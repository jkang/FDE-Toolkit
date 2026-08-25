// =========================================================
// X 智能订舱 Agent · API 编排路由（由 mvp_spec 生成）
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


// POST /api/agent/chat  →  ai:chatQuote
router.post("/api/agent/chat", wrap(async (body, query) => {

  return await aiService.chatQuote(body);

}));

// POST /api/agent/recommend  →  ai:recommendSpace
router.post("/api/agent/recommend", wrap(async (body, query) => {

  return await aiService.recommendSpace(body);

}));

// POST /api/booking/submit  →  ai:submitBooking
router.post("/api/booking/submit", wrap(async (body, query) => {

  return await aiService.submitBooking(body);

}));

// POST /api/document/parse  →  ai:parseDocuments
router.post("/api/document/parse", wrap(async (body, query) => {

  return await aiService.parseDocuments(body);

}));

// POST /api/agent/predict-delay  →  ai:predictDelay
router.post("/api/agent/predict-delay", wrap(async (body, query) => {

  return await aiService.predictDelay(body);

}));

// POST /api/payment/pay  →  ai:payOrder
router.post("/api/payment/pay", wrap(async (body, query) => {

  return await aiService.payOrder(body);

}));

// GET /api/orders  →  business:getBookingList
router.get("/api/orders", wrap(async (body, query) => {

  return await businessMock.getBookingList(body);

}));

// GET /api/shipments/tracking  →  business:getTracking
router.get("/api/shipments/tracking", wrap(async (body, query) => {

  return await businessMock.getTracking(body);

}));


export default router;