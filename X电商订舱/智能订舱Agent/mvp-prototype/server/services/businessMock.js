// =========================================================
// Mock Business Systems —— 外部业务系统 Mock 模块
// 说明：模拟与 ERP / SRM / HR 等业务系统的交互（返回真实感数据）。
//       后续可替换为真实业务系统 SDK/HTTP 客户端。
// =========================================================

const latency = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const businessMock = {

  // ---- getBookingList（system: oms）----
  async getBookingList(body = {}) {
    await latency(300);
    return {"items": [{"code": "BK-2026-0901-001", "etd": "2026-09-12", "rate": "USD 2,450", "route": "\u4e0a\u6d77\u2192\u6d1b\u6749\u77f6", "status": "\u5f85\u88c5\u67dc", "vessel": "X-PRIDE 101E"}, {"code": "BK-2026-0901-002", "etd": "2026-09-15", "rate": "USD 2,780", "route": "\u5b81\u6ce2\u2192\u6c49\u5821", "status": "\u5df2\u5f00\u8239", "vessel": "X-HARMONY 201E"}, {"code": "BK-2026-0901-003", "etd": "2026-09-18", "rate": "USD 2,950", "route": "\u4e0a\u6d77\u2192\u9e7f\u7279\u4e39", "status": "\u5f85\u8865\u4ef6", "vessel": "X-VOYAGER 305E"}]};
  },

  // ---- getTracking（system: controlTower）----
  async getTracking(body = {}) {
    await latency(300);
    return {"items": [{"milestone": "\u8ba2\u8231\u786e\u8ba4", "status": "\u5b8c\u6210", "time": "09-01"}, {"milestone": "\u63d0\u7bb1/\u88c5\u67dc", "status": "\u5b8c\u6210", "time": "09-06"}, {"milestone": "\u91cd\u7bb1\u8fdb\u573a", "status": "\u5b8c\u6210", "time": "09-08"}, {"milestone": "\u5f00\u8239\uff08ETD 09-12\uff09", "status": "\u5b8c\u6210", "time": "09-12"}, {"milestone": "\u4e2d\u8f6c\u6e2f \u00b7 \u91dc\u5c71", "status": "\u8fdb\u884c\u4e2d", "time": "09-18"}, {"milestone": "ETA \u6d1b\u6749\u77f6", "status": "\u5f85\u5230\u8fbe", "time": "10-02"}]};
  },

};