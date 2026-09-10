// =========================================================
// Mock AI Service —— AI 能力独立 service 模块
// 说明：当前为 Mock 实现（含模拟延迟），返回贴近真实业务的数据。
//       后续可将本模块抽离为独立 AI 微服务（HTTP/gRPC 部署）。
// =========================================================

const latency = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const aiService = {

  // ---- identifyScene ----
  async identifyScene(body = {}) {
    await latency(600);
    return {"order": {"departTime": "2026-09-12 09:00", "fare": 553, "orderNo": "E123456789", "seatClass": "\u4e8c\u7b49\u5ea7", "trainNo": "G1234"}, "sceneType": "\u8fd0\u884c\u53d8\u66f4", "summary": "\u8bc6\u522b\u4e3a\u8fd0\u884c\u53d8\u66f4\u573a\u666f\uff1a\u5217\u8f66 G1234 \u665a\u70b9 95 \u5206\u949f\uff0c\u8ba2\u5355\u6709\u6548\u53ef\u9000\u6539"};
  },

  // ---- translateFee ----
  async translateFee(body = {}) {
    await latency(700);
    return {"basis": "\u5f53\u524d\u8ddd\u53d1\u8f66 30 \u5c0f\u65f6\uff0c\u843d\u5728\u300c24\u201348 \u5c0f\u65f6\u300d\u6863\u4f4d\uff1b\u6700\u4f4e\u6536\u8d39 2 \u5143", "changeCost": "\u00a50", "conclusion": "\u5f00\u8f66\u524d\u7ea6 30 \u5c0f\u65f6\u9000\u7968\uff0c\u6309 10% \u6863\u6536\u53d6\u9000\u7968\u8d39 \u00a555.3", "refundLoss": "\u00a555.3", "suggestion": "\u540c\u65e5\u6539\u7b7e\u6210\u672c \u00a50\uff0c\u901a\u5e38\u6bd4\u9000\u7968\u66f4\u5212\u7b97"};
  },

  // ---- recommendPlans ----
  async recommendPlans(body = {}) {
    await latency(900);
    return {"items": [{"departTime": "10:30", "matchScore": "95%", "planId": "\u65b9\u68481", "planType": "\u76f4\u8fbe", "priceDiff": 0, "riskLevel": "\u4f4e", "trainNo": "G1236"}, {"departTime": "11:10", "matchScore": "80%", "planId": "\u65b9\u68482", "planType": "\u6362\u4e58", "priceDiff": -26, "riskLevel": "\u4e2d", "trainNo": "G1240"}, {"departTime": "10:50", "matchScore": "70%", "planId": "\u65b9\u68483", "planType": "\u5019\u8865", "priceDiff": 0, "riskLevel": "\u4e2d", "trainNo": "G1238"}], "summary": "\u5e76\u53d1\u68c0\u7d22\u5230 3 \u4e2a\u5019\u9009\u65b9\u6848\uff081 \u76f4\u8fbe / 1 \u6362\u4e58 / 1 \u5019\u8865\uff09\uff0c\u6309\u504f\u597d\u4e0e\u5386\u53f2\u6210\u529f\u7387\u6392\u5e8f"};
  },

  // ---- disposeChange ----
  async disposeChange(body = {}) {
    await latency(1000);
    return {"consistencyCheck": "\u8de8\u4e1a\u52a1\u4e00\u81f4\u6027\u6821\u9a8c\u901a\u8fc7", "mainTicket": "\u6539\u7b7e\u6210\u529f\uff1aG1234 \u2192 G1236\uff0810:30\uff09\uff0c\u5e2d\u522b\u4e00\u81f4\uff0c\u7968\u4ef7\u5dee \u00a50", "relatedServices": "\u9910\u98df\u5df2\u66f4\u65b0\u3001\u7ea6\u8f66\u5df2\u6ce8\u9500\u3001\u884c\u7a0b\u5355\u5df2\u66f4\u65b0", "status": "\u5904\u7f6e\u5b8c\u6210"};
  },

  // ---- pushNotice ----
  async pushNotice(body = {}) {
    await latency(500);
    return {"exception": "\u65e0\uff08\u5f02\u5e38\u5c06\u81ea\u52a8\u5efa\u5355\u8f6c\u5ba2\u670d\uff09", "newItinerary": "G1236 10:30 \u4e8c\u7b49\u5ea7", "notice": "\u5df2\u63a8\u9001\u5904\u7f6e\u7ed3\u679c\u5e76\u66f4\u65b0\u884c\u7a0b", "pushStatus": "\u5df2\u9001\u8fbe"};
  },

};