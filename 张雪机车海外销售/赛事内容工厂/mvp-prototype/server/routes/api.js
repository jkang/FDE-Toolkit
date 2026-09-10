// =========================================================
// ZXMOTO 赛事内容工厂 Agent · API 编排路由（由 mvp_spec 生成）
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


// POST /api/content/parse-footage  →  ai:parseFootage
router.post("/api/content/parse-footage", wrap(async (body, query) => {

  return await aiService.parseFootage(body);

}));

// POST /api/content/highlights  →  ai:scoreHighlights
router.post("/api/content/highlights", wrap(async (body, query) => {

  return await aiService.scoreHighlights(body);

}));

// POST /api/content/script  →  ai:generateScript
router.post("/api/content/script", wrap(async (body, query) => {

  return await aiService.generateScript(body);

}));

// POST /api/content/adapt  →  ai:adaptPlatforms
router.post("/api/content/adapt", wrap(async (body, query) => {

  return await aiService.adaptPlatforms(body);

}));

// POST /api/content/review  →  ai:reviewCompliance
router.post("/api/content/review", wrap(async (body, query) => {

  return await aiService.reviewCompliance(body);

}));

// POST /api/content/attribute  →  ai:attributePerformance
router.post("/api/content/attribute", wrap(async (body, query) => {

  return await aiService.attributePerformance(body);

}));

// POST /api/content/publish  →  business:publishContent
router.post("/api/content/publish", wrap(async (body, query) => {

  return await businessMock.publishContent(body);

}));

// GET /api/content/publishes  →  business:getPublishRecords
router.get("/api/content/publishes", wrap(async (body, query) => {

  return await businessMock.getPublishRecords(body);

}));


export default router;