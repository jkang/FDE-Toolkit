// =========================================================
// Mock Business Systems —— 外部业务系统 Mock 模块
// 说明：模拟与 ERP / SRM / HR 等业务系统的交互（返回真实感数据）。
//       后续可替换为真实业务系统 SDK/HTTP 客户端。
// =========================================================

const latency = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const businessMock = {

  // ---- getOrder（system: ticketing）----
  async getOrder(body = {}) {
    await latency(200);
    return {"items": [{"departTime": "2026-09-12 09:00", "fare": 553, "orderNo": "E123456789", "seatClass": "\u4e8c\u7b49\u5ea7", "status": "\u6709\u6548", "trainNo": "G1234"}, {"departTime": "2026-09-13 14:30", "fare": 880, "orderNo": "E123456790", "seatClass": "\u4e00\u7b49\u5ea7", "status": "\u6709\u6548", "trainNo": "G2345"}]};
  },

  // ---- getRunStatus（system: monitoring）----
  async getRunStatus(body = {}) {
    await latency(200);
    return {"items": [{"delayMinutes": 95, "eventType": "delay", "trainNo": "G1234"}]};
  },

  // ---- getRelatedServices（system: order-hub）----
  async getRelatedServices(body = {}) {
    await latency(200);
    return {"items": [{"disposeStatus": "\u5df2\u66f4\u65b0", "serviceNo": "CT-8801", "serviceType": "\u9910\u98df"}, {"disposeStatus": "\u5df2\u6ce8\u9500", "serviceNo": "RD-3302", "serviceType": "\u7ea6\u8f66"}, {"disposeStatus": "\u5df2\u66f4\u65b0", "serviceNo": "IT-1105", "serviceType": "\u884c\u7a0b\u5355"}]};
  },

};