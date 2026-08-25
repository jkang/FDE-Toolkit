// =========================================================
// Mock AI Service —— AI 能力独立 service 模块
// 说明：当前为 Mock 实现（含模拟延迟），返回贴近真实业务的数据。
//       后续可将本模块抽离为独立 AI 微服务（HTTP/gRPC 部署）。
// =========================================================

const latency = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const aiService = {

  // ---- chatQuote ----
  async chatQuote(body = {}) {
    await latency(900);
    return {"reply": "\u5df2\u8bc6\u522b\u8be2\u4ef7\u610f\u56fe\uff1a\u4e0a\u6d77\u2192\u6d1b\u6749\u77f6 40HQ\uff0c\u671f\u671b ETD 2026-10-08\uff0c\u4e3a\u60a8\u89e3\u8bfb E-Spot \u5373\u671f\u62a5\u4ef7", "\u4ea7\u54c1": "E-Spot \u5373\u671f\u62a5\u4ef7", "\u5168\u5305\u8fd0\u4ef7": "USD 2,450 / 40HQ", "\u5e02\u573a\u57fa\u51c6": "SCFI \u7f8e\u897f\u7ea6 USD 2,300~2,600 [\u63a8\u65ad]", "\u6709\u6548\u671f": "2026-09-30", "\u8231\u4f4d\u72b6\u6001": "\u53ef\u8ba2\uff08Space Protection \u8231\u4f4d\u4fdd\u8bc1\uff09", "\u8d39\u7528\u6784\u6210": "\u6d77\u8fd0\u8d39 + BAF\uff08\u4e0d\u542b\u76ee\u7684\u6e2f THC / D\u0026D\uff09"};
  },

  // ---- recommendSpace ----
  async recommendSpace(body = {}) {
    await latency(1100);
    return {"items": [{"etd": "2026-10-08", "option": "\u65b9\u6848 A", "product": "E-Spot \u5373\u671f", "rate": "USD 2,450/40HQ", "score": 92, "space": "\u8231\u4f4d\u4fdd\u8bc1", "transit": "12 \u5929"}, {"etd": "2026-10-10", "option": "\u65b9\u6848 B", "product": "Secured E-Quote \u9501\u4ef7", "rate": "USD 2,580/40HQ", "score": 88, "space": "\u8231\u4f4d\u4fdd\u8bc1", "transit": "14 \u5929"}, {"etd": "2026-10-12", "option": "\u65b9\u6848 C", "product": "E-Quote \u957f\u534f", "rate": "USD 2,380/40HQ", "score": 81, "space": "\u9700\u786e\u8ba4", "transit": "15 \u5929"}], "summary": "\u6309\u88c5\u8f7d\u7387 / ETA \u7f6e\u4fe1\u5ea6 / \u8231\u4f4d\u4fdd\u8bc1\u7efc\u5408\u6392\u5e8f\uff0c\u4e3a\u60a8\u63a8\u8350 Top 3 \u65b9\u6848"};
  },

  // ---- submitBooking ----
  async submitBooking(body = {}) {
    await latency(800);
    return {"\u72b6\u6001": "\u5df2\u786e\u8ba4\uff08Booking Confirmation \u5df2\u7b7e\u53d1\uff09", "\u786e\u8ba4\u8bf4\u660e": "\u6700\u5feb 1 \u5206\u949f\u7b7e\u53d1\uff08\u6807\u51c6 SME \u8ba2\u5355\u81ea\u52a8\u6821\u9a8c\u901a\u8fc7\uff09\uff1b\u5e73\u5747\u76ee\u6807 \u22642h\uff08KPI 3\uff09", "\u7bb1\u578b\u8d27\u91cf": "1 \u00d7 40HQ", "\u822a\u7ebf": "\u4e0a\u6d77\uff08SHA\uff09\u2192 \u6d1b\u6749\u77f6\uff08LAX\uff09", "\u8231\u4f4d\u4fdd\u8bc1": "Space Protection \u5df2\u751f\u6548\uff08\u5151\u73b0\u7387\u76ee\u6807 95%+\uff0cKPI 5\uff09", "\u8239\u540d\u822a\u6b21": "X-PRIDE 101E \u00b7 ETD 2026-10-08 [\u63a8\u65ad]", "\u8ba2\u8231\u53f7": "BK-2026-0901-001"};
  },

  // ---- parseDocuments ----
  async parseDocuments(body = {}) {
    await latency(1200);
    return {"items": [{"field": "\u54c1\u540d", "status": "\u901a\u8fc7", "value": "\u5bb6\u5c45\u6536\u7eb3\u7528\u54c1"}, {"field": "\u551b\u5934", "status": "\u901a\u8fc7", "value": "N/M"}, {"field": "\u4ef6\u6570", "status": "\u901a\u8fc7", "value": "480 CTNS"}, {"field": "\u6bdb\u91cd", "status": "\u5f85\u590d\u6838", "value": "12,480 KG"}, {"field": "\u4f53\u79ef", "status": "\u901a\u8fc7", "value": "42.6 CBM"}, {"field": "HS \u7f16\u7801", "status": "\u901a\u8fc7", "value": "9403.20"}, {"field": "VGM \u622a\u6b62\u65f6\u95f4", "status": "\u7f3a\u5931", "value": "\u2014\uff08\u7f3a\u5931\uff09"}, {"field": "\u6536\u8d27\u4eba\u7a0e\u53f7", "status": "\u7f3a\u5931", "value": "\u2014\uff08\u7f3a\u5931\uff09"}], "summary": "\u5df2\u8bc6\u522b PI-2026-0902.pdf + \u88c5\u7bb1\u5355-0902.xlsx\uff0cSI \u9884\u586b 8/10 \u5b57\u6bb5\u901a\u8fc7"};
  },

  // ---- predictDelay ----
  async predictDelay(body = {}) {
    await latency(1000);
    return {"items": [{"etd": "2026-09-15", "impact": "\u8d27\u671f +2 \u5929\uff0c\u8231\u4f4d\u4fdd\u8bc1\u5ef6\u7eed", "option": "\u6539\u914d\u65b9\u6848 1", "status": "\u63a8\u8350", "voyage": "X-PRIDE 103E"}, {"etd": "2026-09-18", "impact": "\u8d27\u671f +4 \u5929\uff0c\u53ef\u542f\u52a8 Delay in Transit \u8d54\u4ed8\u9884\u5224", "option": "\u6539\u914d\u65b9\u6848 2", "status": "\u53ef\u9009", "voyage": "X-ATLAS 105E"}], "summary": "AI \u9884\u6d4b ETA \u5ef6\u8bef\u6982\u7387 68% [\u63a8\u65ad]\uff0c\u9884\u8ba1\u5ef6\u8bef 2~3 \u5929\uff0c\u4e3a\u60a8\u751f\u6210\u6539\u914d\u65b9\u6848\u5982\u4e0b"};
  },

  // ---- payOrder ----
  async payOrder(body = {}) {
    await latency(700);
    return {"\u53d1\u7968\u53f7": "INV-2026-0903-001", "\u652f\u4ed8\u65b9\u5f0f": "\u672c\u5730\u652f\u4ed8\u901a\u9053", "\u652f\u4ed8\u72b6\u6001": "\u652f\u4ed8\u6210\u529f", "\u652f\u4ed8\u91d1\u989d": "USD 2,450\uff08\u2248 CNY 17,640\uff0c\u6c47\u7387 7.2\uff0c\u624b\u7eed\u8d39 1.2% [\u63a8\u65ad]\uff09", "\u7cfb\u7edf\u540c\u6b65": "OMS \u72b6\u6001\u5df2\u540c\u6b65\uff0c\u5355\u8bc1\u6d41\u7a0b\u81ea\u52a8\u7ee7\u7eed"};
  },

};