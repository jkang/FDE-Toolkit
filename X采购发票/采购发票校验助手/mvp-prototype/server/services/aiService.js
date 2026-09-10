// =========================================================
// Mock AI Service —— AI 能力独立 service 模块
// 说明：当前为 Mock 实现（含模拟延迟），返回贴近真实业务的数据。
//       后续可将本模块抽离为独立 AI 微服务（HTTP/gRPC 部署）。
// =========================================================

const latency = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const aiService = {

  // ---- collectInvoices ----
  async collectInvoices(body = {}) {
    await latency(1100);
    return {"channels": [{"count": 38, "key": "leqi", "label": "\u4e50\u4f01\u540c\u6b65"}, {"count": 6, "key": "supplier", "label": "\u4f9b\u5e94\u5546\u4e0a\u4f20"}, {"count": 2, "key": "manual", "label": "\u91c7\u8d2d\u8865\u5f55"}], "duplicate": 1, "missing": 0, "summary": "\u6b63\u5728\u540c\u6b65\u4e50\u4f01\u53d1\u7968\u6c60\uff08IF001\uff09\u2026\u5df2\u62c9\u53d6 38 \u5f20\uff1b\u5f52\u96c6\u4f9b\u5e94\u5546\u4e0a\u4f20\u533a\u2026\u65b0\u589e 6 \u5f20\uff1b\u68c0\u6d4b\u5230\u91c7\u8d2d\u8865\u5f55 2 \u5f20\u7eb8\u8d28\u7968\u3002\u5171 46 \u5f20\uff0c\u65e0\u91cd\u590d\uff1b1 \u5f20\u53d1\u7968\u53f7\u4e0e\u6628\u65e5\u6279\u6b21\u91cd\u590d\uff0c\u5df2\u6807\u8bb0\u3002", "total": 46};
  },

  // ---- recognizeInvoices ----
  async recognizeInvoices(body = {}) {
    await latency(1300);
    return {"authentic": true, "lowConfidence": 1, "summary": "\u5df2\u8bc6\u522b 46 \u5f20\u7968\u9762\u5173\u952e\u5b57\u6bb5\uff1b45 \u5f20\u5b57\u6bb5\u7f6e\u4fe1\u5ea6 \u226595%\uff0c1 \u5f20\u91d1\u989d\u5b57\u6bb5\u7f6e\u4fe1\u5ea6 82%\uff08\u4f4e\u4e8e 95% \u9608\u503c\uff09\uff0c\u5df2\u8f6c\u8bc6\u522b\u590d\u6838\u3002\u771f\u4f2a\u6821\u9a8c\u901a\u8fc7\uff0c\u62ac\u5934\u6821\u9a8c 45 \u5f20\u901a\u8fc7\u30011 \u5f20\u4e0d\u7b26\u3002", "titleFail": 1, "titlePass": 45};
  },

  // ---- runThreeWayMatch ----
  async runThreeWayMatch(body = {}) {
    await latency(1500);
    return {"exception": 5, "hitl": "\u53d1\u7968 INV-2026-0618-002 \u884c 2 \u6570\u91cf\u8d85\u5dee\uff1a\u53d1\u7968 500 \u4ef6 \u003e \u5165\u5e93 480 \u4ef6\uff0c\u8d85\u5bb9\u5fcd\uff08\u6570\u91cf\u65e0\u5bb9\u5fcd\u533a\u95f4\u00b7\u9886\u57df\u4e13\u5bb6\u5047\u8bbe\u503c\uff09\uff0c\u6309\u89c4\u5219\u5fc5\u62c9\u4eba\u3002", "passed": 41, "summary": "41 \u5f20\u4e09\u5355\u5339\u914d\u901a\u8fc7\uff0c5 \u5f20\u6309\u5dee\u5f02\u7c7b\u578b\u81ea\u52a8\u5206\u6d41\uff1a\u6570\u91cf\u8d85\u5dee \u00d71\u3001\u91d1\u989d\u8d85\u5c3e\u5dee \u00d71\u3001\u62ac\u5934/\u7a0e\u53f7\u4e0d\u7b26 \u00d71\u3001\u5355\u4ef7\u4e0d\u7b26 \u00d71\u3001\u8de8\u671f\u53d1\u7968 \u00d71\u3002"};
  },

  // ---- judgeException ----
  async judgeException(body = {}) {
    await latency(900);
    return {"groups": 5, "summary": "5 \u5f20\u5f02\u5e38\u7968\u5df2\u6309\u7c7b\u578b\u5206\u7ec4\uff0c\u5747\u9644\u5dee\u5f02\u660e\u7ec6\u3001\u5904\u7406\u5efa\u8bae\u3001\u6c9f\u901a\u5bf9\u8c61\u4e0e\u5347\u7ea7\u8def\u5f84\u3002"};
  },

  // ---- batchPrebook ----
  async batchPrebook(body = {}) {
    await latency(1200);
    return {"failed": 2, "success": 39, "summary": "41 \u5f20\u5339\u914d\u901a\u8fc7\u7968\u9010\u7968\u68c0\u67e5\u9884\u5236\u786c\u95e8\u7981\uff1b39 \u5f20\u9884\u5236\u6210\u529f\u53d6\u5f97 ERP \u9884\u5236\u51ed\u8bc1\u53f7\uff0c2 \u5f20\u56e0\u6210\u672c\u4e2d\u5fc3\u7f3a\u5931\u5931\u8d25\u8fdb\u5165\u5f85\u8865\u961f\u5217\u3002"};
  },

  // ---- batchPost ----
  async batchPost(body = {}) {
    await latency(1200);
    return {"period": "2026-06", "posted": 39, "summary": "\u8fc7\u8d26\u786c\u95e8\u7981\u6821\u9a8c\u901a\u8fc7\uff08\u5df2\u9884\u5236 / ERP \u9884\u5236\u72b6\u6001\u6709\u6548 / \u5177\u5907\u8d22\u52a1\u8fc7\u8d26\u6743\u9650\uff09\uff0c39 \u5f20\u51ed\u8bc1\u53f7\u9010\u7968\u8fd4\u56de\uff0c\u4f1a\u8ba1\u671f\u95f4 2026-06\u3002"};
  },

  // ---- syncLeqi ----
  async syncLeqi(body = {}) {
    await latency(1000);
    return {"summary": "39 \u5f20\u51ed\u8bc1\u72b6\u6001\u5df2\u540c\u6b65\u4e50\u4f01\uff08IF002\uff09\uff0c\u53f0\u8d26\u5165\u8d26\u72b6\u6001\u66f4\u65b0\u4e3a\u300c\u5df2\u66f4\u65b0\u300d\uff0c\u5f52\u6863\u7d22\u5f15\u6309\u53d1\u7968\u7f16\u53f7\u751f\u6210\u3002", "updated": 39};
  },

  // ---- chatAssistant ----
  async chatAssistant(body = {}) {
    await latency(800);
    return {"reply": "\u672c\u6279 46 \u5f20\uff1a\u5df2\u5f52\u96c6 46\u3001\u8bc6\u522b 45 \u5f20\u901a\u8fc7\uff081 \u5f20\u5f85\u590d\u6838\uff09\u3001\u4e09\u5355\u5339\u914d 41 \u5f20\u901a\u8fc7\u30015 \u5f20\u5f02\u5e38\u5f85\u5904\u7406\u300139 \u5f20\u5df2\u9884\u5236\u5f85\u8fc7\u8d26\u3002\u5efa\u8bae\u5148\u5904\u7406\u6570\u91cf\u8d85\u5dee\u7968 INV-2026-0618-002\uff08\u91c7\u8d2d\u5458\u674e\u5f3a\u8ddf\u8fdb\uff09\u3002", "suggestions": ["\u67e5\u770b\u6570\u91cf\u8d85\u5dee\u7968\u8be6\u60c5", "\u751f\u6210\u5f02\u5e38\u5904\u7406\u5efa\u8bae", "\u6279\u91cf\u9884\u5236\u901a\u8fc7\u7968"]};
  },

};