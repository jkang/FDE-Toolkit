// =========================================================
// Mock Business Systems —— 外部业务系统 Mock 模块
// 说明：模拟与 ERP / SRM / HR 等业务系统的交互（返回真实感数据）。
//       后续可替换为真实业务系统 SDK/HTTP 客户端。
// =========================================================

const latency = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const businessMock = {

  // ---- getDeliveries（system: sap）----
  async getDeliveries(body = {}) {
    await latency(200);
    return {"items": [{"amount": 128600, "customer": "\u6bd4\u4e9a\u8fea\u7535\u6c60", "deliveryDate": "2026-08-28", "deliveryNo": "8000123456", "owner": "\u738b\u9759", "podStatus": "\u5f85\u786e\u8ba4", "reconStatus": "\u5bf9\u8d26\u5b8c\u6210"}, {"amount": 86500, "customer": "\u798f\u8000\u73bb\u7483", "deliveryDate": "2026-08-29", "deliveryNo": "8000123457", "owner": "\u738b\u9759", "podStatus": "\u5f85\u786e\u8ba4", "reconStatus": "\u5bf9\u8d26\u5dee\u5f02"}, {"amount": 205000, "customer": "\u5b81\u5fb7\u65f6\u4ee3", "deliveryDate": "2026-08-30", "deliveryNo": "8000123458", "owner": "\u738b\u9759", "podStatus": "\u672a\u786e\u8ba4", "reconStatus": "\u672a\u521b\u5efa"}]};
  },

  // ---- getReconciliations（system: sap）----
  async getReconciliations(body = {}) {
    await latency(200);
    return {"items": [{"creditDebit": "\u4e0d\u9002\u7528", "customer": "\u6bd4\u4e9a\u8fea\u7535\u6c60", "difference": 0, "period": "2026-08", "statementNo": "RC-2026-08-001", "status": "\u5bf9\u8d26\u5b8c\u6210"}, {"creditDebit": "\u5f85\u751f\u6210", "customer": "\u798f\u8000\u73bb\u7483", "difference": 1200, "period": "2026-08", "statementNo": "RC-2026-08-002", "status": "\u5bf9\u8d26\u5dee\u5f02"}]};
  },

  // ---- getPreInvoices（system: sap）----
  async getPreInvoices(body = {}) {
    await latency(200);
    return {"items": [{"amount": 342000, "deliveryNo": "8000123459", "postingStatus": "\u672a\u8fc7\u8d26", "prebillNo": "PI-2026-08-001", "voucherNo": ""}, {"amount": 76000, "deliveryNo": "8000123461", "postingStatus": "\u8fc7\u8d26\u5931\u8d25", "prebillNo": "PI-2026-08-003", "voucherNo": ""}]};
  },

  // ---- getDashboard（system: internal）----
  async getDashboard(body = {}) {
    await latency(200);
    return {"nodes": [{"count": 3, "name": "\u5f85\u7269\u6d41\u5173\u8054"}, {"count": 5, "name": "\u5f85\u7b7e\u6536"}, {"count": 2, "name": "\u5f85\u521b\u5efa\u5bf9\u8d26\u5355"}, {"count": 18, "name": "\u5f85POD\u786e\u8ba4"}, {"count": 7, "name": "\u5f85\u8fc7\u8d26"}], "overdue": [{"count": 3, "name": "\u5df2\u53d1\u8d27\u672a\u53d6\u53d1\u8fd0\u5355"}, {"count": 5, "name": "\u5df2\u53d6\u5f97\u672a\u7b7e\u6536"}, {"count": 2, "name": "\u5df2\u53d1\u8d27\u672a\u521b\u5efa\u5bf9\u8d26\u5355"}, {"count": 4, "name": "\u5177\u5907\u6761\u4ef6\u672aPOD\u786e\u8ba4"}]};
  },

};