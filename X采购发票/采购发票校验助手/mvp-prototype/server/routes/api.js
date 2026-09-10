// =========================================================
// X · 采购发票校验助手 · API 编排路由（由 mvp_spec 生成）
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


// POST /api/invoice/collect  →  ai:collectInvoices
router.post("/api/invoice/collect", wrap(async (body, query) => {

  return await aiService.collectInvoices(body);

}));

// POST /api/invoice/recognize  →  ai:recognizeInvoices
router.post("/api/invoice/recognize", wrap(async (body, query) => {

  return await aiService.recognizeInvoices(body);

}));

// POST /api/match/run  →  ai:runThreeWayMatch
router.post("/api/match/run", wrap(async (body, query) => {

  return await aiService.runThreeWayMatch(body);

}));

// POST /api/exception/judge  →  ai:judgeException
router.post("/api/exception/judge", wrap(async (body, query) => {

  return await aiService.judgeException(body);

}));

// POST /api/ledger/prebook  →  ai:batchPrebook
router.post("/api/ledger/prebook", wrap(async (body, query) => {

  return await aiService.batchPrebook(body);

}));

// POST /api/ledger/post  →  ai:batchPost
router.post("/api/ledger/post", wrap(async (body, query) => {

  return await aiService.batchPost(body);

}));

// POST /api/ledger/sync-leqi  →  ai:syncLeqi
router.post("/api/ledger/sync-leqi", wrap(async (body, query) => {

  return await aiService.syncLeqi(body);

}));

// POST /api/agent/chat  →  ai:chatAssistant
router.post("/api/agent/chat", wrap(async (body, query) => {

  return await aiService.chatAssistant(body);

}));

// GET /api/erp/purchase-orders  →  business:getPurchaseOrders
router.get("/api/erp/purchase-orders", wrap(async (body, query) => {

  return await businessMock.getPurchaseOrders(body);

}));

// GET /api/erp/goods-receipts  →  business:getGoodsReceipts
router.get("/api/erp/goods-receipts", wrap(async (body, query) => {

  return await businessMock.getGoodsReceipts(body);

}));

// GET /api/fs/delivery-notes  →  business:getDeliveryNotes
router.get("/api/fs/delivery-notes", wrap(async (body, query) => {

  return await businessMock.getDeliveryNotes(body);

}));

// GET /api/erp/validation  →  business:getErpValidation
router.get("/api/erp/validation", wrap(async (body, query) => {

  return await businessMock.getErpValidation(body);

}));

// GET /api/master/dictionary  →  business:getMasterData
router.get("/api/master/dictionary", wrap(async (body, query) => {

  return await businessMock.getMasterData(body);

}));


export default router;