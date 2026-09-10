// =========================================================
// Mock AI Service —— AI 能力独立 service 模块
// 说明：当前为 Mock 实现（含模拟延迟），返回贴近真实业务的数据。
//       后续可将本模块抽离为独立 AI 微服务（HTTP/gRPC 部署）。
// =========================================================

const latency = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const aiService = {

  // ---- parseFootage ----
  async parseFootage(body = {}) {
    await latency(1200);
    return {"items": [{"brandVisibility": "\u9ad8", "clip": "\u51b2\u7ebf\u955c\u5934", "confidence": "98%", "eventType": "\u593a\u51a0"}, {"brandVisibility": "\u4e2d", "clip": "\u7b2c 14 \u5708\u8d85\u8f66", "confidence": "93%", "eventType": "\u8d85\u8f66"}, {"brandVisibility": "\u4f4e", "clip": "\u7b2c 6 \u5708\u538b\u5f2f", "confidence": "81%", "eventType": "\u6781\u9650\u52a8\u4f5c"}, {"brandVisibility": "\u4f4e", "clip": "\u7ef4\u4fee\u533a\u56de\u653e", "confidence": "64%\uff08\u5f85\u590d\u6838\uff09", "eventType": "\u6162\u955c\u56de\u653e"}], "summary": "\u5df2\u591a\u6a21\u6001\u7406\u89e3 WSBK \u8377\u5170\u7ad9\u7d20\u6750\uff0c\u8bc6\u522b\u955c\u5934 1,286 \u6bb5\u3001\u8d5b\u4e8b\u4e8b\u4ef6 57 \u4e2a\uff0c\u5173\u8054 ZXMOTO \u8f66\u624b 2 \u540d\u3001\u54c1\u724c\u9732\u51fa 23 \u5904"};
  },

  // ---- scoreHighlights ----
  async scoreHighlights(body = {}) {
    await latency(1100);
    return {"items": [{"brandVisibility": "\u9ad8", "code": "HL-01", "eventType": "\u593a\u51a0\u51b2\u7ebf", "score": 96, "status": "\u7f6e\u9876\u5c01\u9762\u7ea7"}, {"brandVisibility": "\u4e2d", "code": "HL-02", "eventType": "\u8d34\u8eab\u8d85\u8f66", "score": 91, "status": "\u5165\u9009"}, {"brandVisibility": "\u4f4e", "code": "HL-03", "eventType": "\u6781\u9650\u538b\u5f2f", "score": 84, "status": "\u8865\u52a0\u89d2\u6807"}], "summary": "\u6309\u7cbe\u5f69\u5ea6/\u53d9\u4e8b\u4ef7\u503c/\u54c1\u724c\u76f8\u5173\u5ea6/\u5386\u53f2\u4e92\u52a8\u504f\u597d\u56db\u56e0\u5b50\u6253\u5206\uff0c\u4ea7\u51fa\u9ad8\u5149\u5019\u9009 Top 3"};
  },

  // ---- generateScript ----
  async generateScript(body = {}) {
    await latency(1400);
    return {"reply": "\u5df2\u751f\u6210 6 \u8bed\u8a00\u89e3\u8bf4\u811a\u672c\uff08\u4e8b\u5b9e\u4e00\u81f4\u3001\u9010\u8bed\u8a00\u672c\u5730\u5316\uff09", "\u4e8b\u5b9e\u6821\u9a8c": "\u8f66\u624b/\u540d\u6b21/\u5708\u901f\u4e0e WSBK \u8d5b\u4e8b\u6570\u636e\u4e00\u81f4", "\u5fb7\u6587\u811a\u672c": "Hook: ZXMOTO siegt in der letzten Kurve! ... CTA: #ZXMOTO #WSBK", "\u610f\u6587\u811a\u672c": "Hook: ZXMOTO vince all\u0027ultima curva! ... CTA: #ZXMOTO #WSBK", "\u672c\u5730\u5316\u63d0\u793a": "\u67d0\u8bed\u8a00\u547d\u4e2d\u5b97\u6559\u7981\u5fcc\u8868\u8ff0\uff0c\u5df2\u81ea\u52a8\u6539\u5199\uff1b\u54c1\u724c\u540d\u4e0e\u8bdd\u9898\u6807\u7b7e\u9f50\u5168", "\u6cd5\u6587\u811a\u672c": "Accroche : ZXMOTO s\u0027impose dans le dernier virage ! ... CTA : #ZXMOTO #WSBK", "\u82f1\u6587\u811a\u672c": "Hook: ZXMOTO seals the win in the final corner! Build-up: lap 14 overtake... Payoff: P1. CTA: #ZXMOTO #WSBK", "\u8461\u6587\u811a\u672c": "Gancho: ZXMOTO vence na \u00faltima curva! ... CTA: #ZXMOTO #WSBK", "\u897f\u6587\u811a\u672c": "Gancho: \u00a1ZXMOTO gana en la \u00faltima curva! ... CTA: #ZXMOTO #WSBK"};
  },

  // ---- adaptPlatforms ----
  async adaptPlatforms(body = {}) {
    await latency(1000);
    return {"items": [{"duration": "58s", "platform": "YouTube", "ratio": "16:9", "status": "\u5df2\u9002\u914d"}, {"duration": "34s", "platform": "TikTok", "ratio": "9:16", "status": "\u5df2\u9002\u914d"}, {"duration": "30s", "platform": "Instagram Reels", "ratio": "9:16", "status": "\u5df2\u9002\u914d"}, {"duration": "30s", "platform": "Instagram Feed", "ratio": "1:1", "status": "\u62c6\u6761"}], "summary": "\u6309\u5404\u5e73\u53f0\u786c\u89c4\u8303\u9002\u914d\u5b8c\u6210\uff0c\u8d85\u9650\u81ea\u52a8\u88c1\u5207/\u62c6\u6761"};
  },

  // ---- reviewCompliance ----
  async reviewCompliance(body = {}) {
    await latency(900);
    return {"items": [{"item": "\u54c1\u724c\u8c03\u6027\u4e00\u81f4\u6027", "result": "\u4e00\u81f4", "status": "\u901a\u8fc7"}, {"item": "\u5185\u5bb9\u7ea2\u7ebf\u547d\u4e2d", "result": "0 \u9879\u547d\u4e2d", "status": "\u901a\u8fc7"}, {"item": "\u4e8b\u5b9e\u51c6\u786e\u6027", "result": "\u4e0e\u8d5b\u4e8b\u6570\u636e\u4e00\u81f4", "status": "\u901a\u8fc7"}, {"item": "\u67d0\u8bed\u8a00\u672c\u5730\u5316\u8868\u8ff0", "result": "\u5efa\u8bae\u4f18\u5316\uff08\u975e\u7ea2\u7ebf\uff09", "status": "\u5f85\u590d\u6838"}], "summary": "\u54c1\u724c\u8c03\u6027\u3001\u5185\u5bb9\u7ea2\u7ebf\u3001\u4e8b\u5b9e\u51c6\u786e\u6027\u4e09\u7ea7\u6821\u9a8c\u5b8c\u6210"};
  },

  // ---- attributePerformance ----
  async attributePerformance(body = {}) {
    await latency(1000);
    return {"items": [{"engagementRate": "9.8%", "highlightType": "\u593a\u51a0/\u53cd\u8d85", "sampleSize": "42 \u6761", "trend": "\u9ad8\u4e8e\u5747\u503c 35%"}, {"engagementRate": "7.4%", "highlightType": "\u8d34\u8eab\u8d85\u8f66", "sampleSize": "31 \u6761", "trend": "\u9ad8\u4e8e\u5747\u503c 12%"}, {"engagementRate": "5.1%", "highlightType": "\u6781\u9650\u52a8\u4f5c", "sampleSize": "28 \u6761", "trend": "\u63a5\u8fd1\u5747\u503c"}], "summary": "\u6837\u672c\u5145\u5206\uff0c\u5f52\u56e0\u7ed3\u8bba\u53ef\u8ffd\u6eaf\uff1b\u5df2\u66f4\u65b0\u9ad8\u5149\u504f\u597d\u6743\u91cd"};
  },

};