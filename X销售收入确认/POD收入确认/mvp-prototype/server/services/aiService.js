// =========================================================
// Mock AI Service —— AI 能力独立 service 模块
// 说明：当前为 Mock 实现（含模拟延迟），返回贴近真实业务的数据。
//       后续可将本模块抽离为独立 AI 微服务（HTTP/gRPC 部署）。
// =========================================================

const latency = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const aiService = {

  // ---- syncCollection ----
  async syncCollection(body = {}) {
    await latency(900);
    return {"pods": [{"deliveryNo": "8000123456", "signPerson": "\u5218\u4f1f", "signResult": "\u6b63\u5e38\u7b7e\u6536", "signTime": "2026-08-29 14:20", "status": "\u6709\u6548"}, {"deliveryNo": "8000123457", "signPerson": "\u5f20\u5f3a", "signResult": "\u5f02\u5e38\u7b7e\u6536\uff08\u5916\u7bb1\u7834\u635f\uff09", "signTime": "2026-08-30 10:05", "status": "\u5f85\u590d\u6838"}], "relations": [{"carrier": "\u987a\u4e30\u7269\u6d41", "confidence": "98%", "deliveryNo": "8000123456", "shipmentNo": "SF-2026-0828-001", "status": "\u5df2\u5173\u8054"}, {"carrier": "\u5fb7\u90a6\u7269\u6d41", "confidence": "96%", "deliveryNo": "8000123457", "shipmentNo": "DB-2026-0829-014", "status": "\u5df2\u5173\u8054"}, {"carrier": "\u5b89\u80fd\u7269\u6d41", "confidence": "61%", "deliveryNo": "8000123458", "shipmentNo": "", "status": "\u5f85\u590d\u6838"}], "summary": "\u5df2\u8bc6\u522b 3 \u6761\u90ae\u4ef6\u5173\u8054\uff0c2 \u6761\u7b7e\u6536\u8d44\u6599\uff1b1 \u6761\u53d1\u8fd0\u5355\u53f7\u4f4e\u7f6e\u4fe1\u5ea6\u5f85\u590d\u6838"};
  },

  // ---- analyzeReconciliation ----
  async analyzeReconciliation(body = {}) {
    await latency(800);
    return {"diffs": [{"deliveryNo": "8000123456", "differenceAmount": 0, "differenceType": "\u4e00\u81f4", "status": "\u5bb9\u5dee\u5185", "suggestion": "\u65e0"}, {"deliveryNo": "8000123457", "differenceAmount": 1200, "differenceType": "\u6570\u91cf\u5dee\u5f02\uff08\u5c11 1 \u7bb1\uff09", "status": "\u8d85\u5bb9\u5dee\u5f85\u88c1\u51b3", "suggestion": "\u751f\u6210\u501f\u9879 \u00a51,200"}, {"deliveryNo": "8000123458", "differenceAmount": 300, "differenceType": "\u91d1\u989d\u5dee\u5f02\uff08\u8fd0\u8d39\u5206\u644a\uff09", "status": "\u5df2\u5904\u7406", "suggestion": "\u5bb9\u5dee\u5185\u4e0d\u8c03\u6574"}], "summary": "\u6bd4\u5bf9\u5b8c\u6210\uff1a1 \u6761\u4e00\u81f4\u30011 \u6761\u5bb9\u5dee\u5185\u5dee\u5f02\u30011 \u6761\u8d85\u5bb9\u5dee\u5f85\u88c1\u51b3"};
  },

  // ---- checkPodConditions ----
  async checkPodConditions(body = {}) {
    await latency(600);
    return {"conclusion": "\u4e94\u8981\u7d20\u5168\u90e8\u6ee1\u8db3\uff0c\u5141\u8bb8 POD \u786e\u8ba4", "conditions": [{"name": "\u4ea4\u8d27\u5355\u5df2\u540c\u6b65", "status": "\u6ee1\u8db3"}, {"name": "\u7269\u6d41\u53d1\u8fd0\u5173\u8054\u5df2\u5efa\u7acb", "status": "\u6ee1\u8db3"}, {"name": "\u7b7e\u6536/POD \u6709\u6548", "status": "\u6ee1\u8db3"}, {"name": "\u5bf9\u8d26\u5df2\u5b8c\u6210", "status": "\u6ee1\u8db3"}, {"name": "\u501f\u8d37\u9879\u5df2\u5b8c\u6210\u6216\u4e0d\u9002\u7528", "status": "\u6ee1\u8db3"}], "deliveryNo": "8000123456"};
  },

  // ---- confirmPod ----
  async confirmPod(body = {}) {
    await latency(700);
    return {"deliveryNo": "8000123456", "message": "\u5df2\u751f\u6210 POD \u65e5\u5fd7\u5e76\u81ea\u52a8\u89e6\u53d1 SAP \u9884\u5236\u53d1\u7968", "podLog": "PODLOG-2026-09-0001", "prebillNo": "PI-2026-09-0001", "status": "POD \u5df2\u786e\u8ba4"};
  },

  // ---- executePosting ----
  async executePosting(body = {}) {
    await latency(900);
    return {"fiscalPeriod": "2026-09", "message": "\u8fc7\u8d26\u6210\u529f\uff0c\u51ed\u8bc1\u5df2\u56de\u5199\uff1b\u6253\u5370\u5f52\u6863\u8d44\u6599\u6e05\u5355\u5df2\u751f\u6210", "prebillNo": "PI-2026-09-0001", "status": "\u5df2\u8fc7\u8d26", "voucherNo": "1000234568"};
  },

  // ---- chatAssistant ----
  async chatAssistant(body = {}) {
    await latency(500);
    return {"reply": "\u4ea4\u8d27\u5355 8000123457 \u56e0\u5bf9\u8d26\u5b58\u5728\u8d85\u5bb9\u5dee\u5dee\u5f02\uff08\u501f\u9879 \u00a51,200 \u5f85\u5904\u7406\uff09\uff0c\u6682\u4e0d\u6ee1\u8db3 POD \u786e\u8ba4\u6761\u4ef6\u3002\u5efa\u8bae\u5148\u5728\u5bf9\u8d26\u5355\u5de5\u4f5c\u53f0\u786e\u8ba4\u5dee\u5f02\u5e76\u5b8c\u6210\u501f\u8d37\u9879\u8fc7\u8d26\u3002"};
  },

};