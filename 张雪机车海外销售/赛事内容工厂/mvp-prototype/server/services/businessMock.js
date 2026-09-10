// =========================================================
// Mock Business Systems —— 外部业务系统 Mock 模块
// 说明：模拟与 ERP / SRM / HR 等业务系统的交互（返回真实感数据）。
//       后续可替换为真实业务系统 SDK/HTTP 客户端。
// =========================================================

const latency = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const businessMock = {

  // ---- getPublishRecords（system: socialPlatform）----
  async getPublishRecords(body = {}) {
    await latency(300);
    return {"items": [{"code": "PUB-0901-01", "market": "\u5317\u7f8e", "platform": "YouTube", "publishTime": "2026-09-01 22:10", "status": "\u5df2\u53d1\u5e03"}, {"code": "PUB-0901-02", "market": "\u6b27\u6d32", "platform": "TikTok", "publishTime": "2026-09-01 21:40", "status": "\u5df2\u53d1\u5e03"}, {"code": "PUB-0901-03", "market": "\u62c9\u7f8e", "platform": "Instagram", "publishTime": "2026-09-02 08:00", "status": "\u6392\u961f\u4e2d"}]};
  },

  // ---- publishContent（system: socialPlatform）----
  async publishContent(body = {}) {
    await latency(900);
    return {"\u53d1\u5e03\u72b6\u6001": "\u5df2\u53d1\u5e03\uff086 \u8bed\u8a00 \u00d7 4 \u5e73\u53f0\u5206\u6ce2\u53d1\u5e03\uff09", "\u5931\u8d25\u515c\u5e95": "\u53d1\u5e03\u5931\u8d25\u91cd\u8bd5 2 \u6b21 \u2192 \u8f6c\u4eba\u5de5\uff1b\u70ed\u70b9\u8fc7\u671f \u2192 \u987a\u5ef6\u6216\u63d0\u793a\u8c03\u6574", "\u653e\u884c\u4f9d\u636e": "\u54c1\u724c\u8c03\u6027\u4e0e\u5185\u5bb9\u7ea2\u7ebf\u7ec8\u5ba1\u901a\u8fc7\uff08HITL gate\uff09", "\u70ed\u70b9\u7a97\u53e3": "\u8d5b\u540e 2h \u5185\u62a2\u9ec4\u91d1\u4f20\u64ad\u7a97\u53e3"};
  },

};