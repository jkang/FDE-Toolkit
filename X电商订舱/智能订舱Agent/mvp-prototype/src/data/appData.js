// =========================================================
// X 智能订舱 Agent · 角色与场景（由 mvp_spec.personas/scenarios 生成）
// =========================================================

export const personas = [

  {
    id: 'sme_shipper',
    name: '王静',
    role: 'SME 货主直客',
    department: '贸易公司 · 供应链部',
    goals: ["\u62ff\u5230\u900f\u660e\u53ef\u4fe1\u7684\u62a5\u4ef7\u4e0e\u8231\u4f4d\uff0c\u51cf\u5c11\u591a\u5e73\u53f0\u6bd4\u4ef7", "\u5168\u6d41\u7a0b\u81ea\u52a9\u5b8c\u6210\u8ba2\u8231\uff0c\u4e0d\u88ab\u5ba2\u670d\u4e0e\u8865\u4ef6\u6d41\u7a0b\u7275\u7740\u8d70", "\u65fa\u5b63\u8d27\u671f\u6709\u4fdd\u969c\uff0c\u7529\u67dc/\u5ef6\u8bef\u63d0\u524d\u77e5\u6653"],
  },

  {
    id: 'sme_operator',
    name: '陈浩',
    role: '订舱操作员',
    department: '货主企业 · 单证组',
    goals: ["\u51cf\u5c11\u8868\u5355\u91cd\u590d\u5f55\u5165\u4e0e\u5f80\u8fd4\u8865\u4ef6", "\u8ba2\u8231\u4e00\u6b21\u63d0\u4ea4\u901a\u8fc7\u7387\u63d0\u5347"],
  },

  {
    id: 'csr_lin',
    name: '林晓',
    role: '人工客服 CSR',
    department: 'X 电商客服中心',
    goals: ["\u590d\u6742\u95ee\u9898\u4e00\u6b21\u6027\u89e3\u51b3\u7387\u63d0\u5347\uff0c\u4e0d\u518d\u91cd\u590d\u6536\u96c6\u4e0a\u4e0b\u6587", "\u6807\u51c6\u8ba2\u8231\u4ea4\u7531 Agent \u5206\u6d41\uff0c\u4e13\u6ce8\u9ad8\u4ef7\u503c\u590d\u6742\u573a\u666f"],
  },

];

export const scenarios = [

  {
    id: 's1',
    name: '新客首单直达',
    personaId: 'sme_shipper',
    trigger: '新注册 SME 首次订舱，无历史交易数据（Smart Push 预填不可用）',
    goal: '首单从询价到获得 Booking Confirmation ≤2 小时（KPI 3），全程无人工介入',
  },

  {
    id: 's2',
    name: '旺季舱位变更',
    personaId: 'sme_shipper',
    trigger: '旺季原定航次被甩柜，Agent 提前 72h 主动预警并给出改配方案',
    goal: '5 分钟内获得改配方案与舱位保证承诺，延误赔付自动预判',
  },

  {
    id: 's3',
    name: '批量日常订舱',
    personaId: 'sme_operator',
    trigger: '每周一基于出货计划批量提交订舱与 SI',
    goal: '3 票 SI 批量预填 15 分钟内完成，异常项一次补全',
  },

];