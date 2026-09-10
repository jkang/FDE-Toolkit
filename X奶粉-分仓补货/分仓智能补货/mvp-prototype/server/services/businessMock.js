// =========================================================
// Mock 业务系统服务 —— 相邻系统数据接口（京慧/TMS/WMS/仓网/库存）
// 说明：概念级 MVP · 数据为脱敏演示数据，不接真实后端
// =========================================================

const latency = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const businessMock = {
  // ---- 库存系统：基地仓现货/待检/合格/在途 ----
  async getWarehouseInventory(body = {}) {
    await latency(200);
    return {
      warehouses: [
        { code: 'TJ-BASE', name: '天津基地仓', region: '华北', totalAvailable: 62000, inTransit: 18000, pendingCheck: 5200, qualified: 59800, safetyLevel: '正常' },
        { code: 'HS-BASE', name: '呼市基地仓', region: '华北', totalAvailable: 48000, inTransit: 9600, pendingCheck: 3100, qualified: 46200, safetyLevel: '正常' },
        { code: 'DM-BASE', name: '杜蒙基地仓', region: '东北', totalAvailable: 35500, inTransit: 7200, pendingCheck: 2600, qualified: 34100, safetyLevel: '正常' },
        { code: 'WH-BASE', name: '武汉基地仓', region: '华中', totalAvailable: 41000, inTransit: 12400, pendingCheck: 3800, qualified: 39500, safetyLevel: '正常' },
      ],
    };
  },

  // ---- 奶粉分仓补调系统：销售计划/京慧建议量/备货率 ----
  async getSalesPlan(body = {}) {
    await latency(250);
    return {
      period: '本周销售计划',
      items: [
        { warehouse: '北京顺义仓', sku: '金领冠珍护 1段900g', weeklyPlan: 490, jhSuggested: 1200, stockRate: '80%', priority: 'P0' },
        { warehouse: '天津武清仓', sku: '金领冠珍护 1段900g', weeklyPlan: 380, jhSuggested: 800, stockRate: '95%', priority: 'P1' },
        { warehouse: '广州白云仓', sku: '金领冠珍护 1段900g', weeklyPlan: 710, jhSuggested: 1600, stockRate: '88%', priority: 'P1' },
        { warehouse: '郑州航空港仓', sku: '金领冠珍护 1段900g', weeklyPlan: 430, jhSuggested: 900, stockRate: '90%', priority: 'P2' },
        { warehouse: '合肥新桥仓', sku: '金领冠珍护 1段900g', weeklyPlan: 320, jhSuggested: 700, stockRate: '86%', priority: 'P1' },
        { warehouse: '武汉东西湖仓', sku: '安儿宝 2段900g', weeklyPlan: 350, jhSuggested: 800, stockRate: '89%', priority: 'P1' },
      ],
    };
  },

  // ---- 仓网主数据：距离/时效/安全水位 ----
  async getNetworkDistance(body = {}) {
    await latency(180);
    return {
      routes: [
        { from: '华北基地仓', to: '北京顺义仓', distance: 356, transitDays: 1, safetyLevel: '高' },
        { from: '华东基地仓', to: '北京顺义仓', distance: 812, transitDays: 2, safetyLevel: '中' },
        { from: '武汉基地仓', to: '北京顺义仓', distance: 1046, transitDays: 3, safetyLevel: '中' },
        { from: '天津基地仓', to: '北京顺义仓', distance: 356, transitDays: 1, safetyLevel: '高' },
      ],
    };
  },

  // ---- TMS：物流预警（模拟降级态） ----
  async getTmsStatus(body = {}) {
    await latency(150);
    return {
      degraded: true,
      message: 'TMS 物流预警接口未接通（评级 C/需开发），已按历史时效估算',
      vehicles: [
        { orderCode: 'TB-20260823-001', vehicle: '津A·8K32F', position: '京津高速·王庆坨出口', status: '运输中' },
        { orderCode: 'TB-20260823-003', vehicle: '鄂A·2M15Q', position: '京港澳高速·孝感段', status: '运输中' },
      ],
    };
  },

  // ---- WMS：入库验收 ----
  async getWmsReceipt(body = {}) {
    await latency(200);
    return {
      receipts: [
        { orderCode: 'TB-20260823-004', plannedQty: 900, actualQty: 897, diffRate: '0.33%', status: '差异正常·已入库' },
      ],
    };
  },
};
