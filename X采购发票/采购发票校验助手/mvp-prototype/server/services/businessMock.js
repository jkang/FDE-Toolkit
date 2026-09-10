// =========================================================
// Mock Business Systems —— 外部业务系统 Mock 模块
// 说明：模拟与 ERP / SRM / HR 等业务系统的交互（返回真实感数据）。
//       后续可替换为真实业务系统 SDK/HTTP 客户端。
// =========================================================

const latency = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const businessMock = {

  // ---- getPurchaseOrders（system: erp）----
  async getPurchaseOrders(body = {}) {
    await latency(250);
    return {"items": [{"amount": 77700.0, "material": "\u4e8c\u7ea7RO\u819c \u4e1c\u4e3d TM720D 400", "poNo": "6300002695", "qty": 42, "status": "\u5df2\u5165\u5e93", "supplier": "XX\u73af\u4fdd\u79d1\u6280\uff08\u8131\u654f\uff09", "unitPrice": 1850.0}, {"amount": 12800.0, "material": "\u53cd\u6e17\u900f\u819c\u58f3 8040", "poNo": "6300002701", "qty": 120, "status": "\u5df2\u5165\u5e93", "supplier": "XX\u73af\u4fdd\u79d1\u6280\uff08\u8131\u654f\uff09", "unitPrice": 106.67}, {"amount": 36000.0, "material": "\u538b\u529b\u8868 Y-100", "poNo": "6300002710", "qty": 30, "status": "\u90e8\u5206\u5165\u5e93", "supplier": "\u534e\u4e1c\u4eea\u5668\uff08\u8131\u654f\uff09", "unitPrice": 1200.0}]};
  },

  // ---- getGoodsReceipts（system: erp）----
  async getGoodsReceipts(body = {}) {
    await latency(250);
    return {"items": [{"date": "2026-06-18", "material": "\u4e8c\u7ea7RO\u819c \u4e1c\u4e3d TM720D 400", "poNo": "6300002695", "qty": 42, "receiptNo": "NJ-2026061801", "warehouse": "\u539f\u6599\u5e93"}, {"date": "2026-06-18", "material": "\u7cbe\u5bc6\u8f74\u627f NSK 6205", "poNo": "6300002695", "qty": 480, "receiptNo": "NJ-2026061802", "warehouse": "\u5907\u4ef6\u5e93"}]};
  },

  // ---- getDeliveryNotes（system: fileserver）----
  async getDeliveryNotes(body = {}) {
    await latency(300);
    return {"items": [{"date": "2026-06-18", "fileName": "20260618170457663.pdf", "material": "\u4e8c\u7ea7RO\u819c \u4e1c\u4e3d TM720D 400", "qty": 42, "supplier": "XX\u73af\u4fdd\u79d1\u6280\uff08\u8131\u654f\uff09"}, {"date": "2026-06-18", "fileName": "20260618170457664.pdf", "material": "\u7cbe\u5bc6\u8f74\u627f NSK 6205", "qty": 480, "supplier": "\u7cbe\u5bc6\u8f74\u627f\u4f9b\u5e94\u5546\uff08\u8131\u654f\uff09"}]};
  },

  // ---- getErpValidation（system: erp）----
  async getErpValidation(body = {}) {
    await latency(300);
    return {"items": [{"amountExTax": 77700.0, "diff": 0.0, "invoiceNo": "25312000000012345678", "poAmount": 77700.0, "result": "\u901a\u8fc7"}, {"amountExTax": 77700.8, "diff": 0.8, "invoiceNo": "INV-2026-0618-003", "poAmount": 77700.0, "result": "\u5c3e\u5dee\u5bb9\u5fcd"}]};
  },

  // ---- getMasterData（system: sap）----
  async getMasterData(body = {}) {
    await latency(200);
    return {"entries": [{"context": "\u6821\u9a8c\u53d1\u7968\u771f\u4f2a\u4e0e\u8d2d\u65b9\u62ac\u5934", "def": "XX\u73af\u4fdd\u79d1\u6280\uff08\u8131\u654f\uff09", "term": "\u4f9b\u5e94\u5546\u6807\u51c6\u540d"}, {"context": "\u9884\u5236\u53d1\u7968\u51ed\u8bc1", "def": "100XXX\uff08SAP\uff09", "term": "\u4f9b\u5e94\u5546\u4ee3\u7801"}, {"context": "\u6821\u9a8c\u53d1\u7968\u771f\u4f2a\u4e0e\u8d2d\u65b9\u62ac\u5934", "def": "91310000MA1KXXXXXX\uff08\u8131\u654f\uff09", "term": "\u7edf\u4e00\u793e\u4f1a\u4fe1\u7528\u4ee3\u7801"}, {"context": "\u9884\u5236 / \u8fc7\u8d26", "def": "\u6750\u6599\u91c7\u8d2d / \u5e94\u4ed8\u8d26\u6b3e / \u5e94\u4ea4\u7a0e\u8d39-\u8fdb\u9879\u7a0e", "term": "SAP \u4f1a\u8ba1\u79d1\u76ee"}, {"context": "\u9884\u5236\u53d1\u7968\u51ed\u8bc1\uff08\u7f3a\u5931\u4f1a\u5bfc\u81f4\u9884\u5236\u5931\u8d25\uff09", "def": "CC-3021\uff08\u5236\u9020\u8d39\u7528\uff09", "term": "\u6210\u672c\u4e2d\u5fc3"}, {"context": "\u9884\u5236\u53d1\u7968\u51ed\u8bc1", "def": "30 \u5929\u51c0\u8d26\u671f", "term": "\u4ed8\u6b3e\u6761\u4ef6"}]};
  },

};