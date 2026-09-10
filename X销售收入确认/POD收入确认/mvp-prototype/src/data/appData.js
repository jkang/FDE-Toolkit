// =========================================================
// 销售POD收入确认工作台 · 角色与场景（由 mvp_spec.personas/scenarios 生成）
// =========================================================

export const personas = [

  {
    id: 'cs_wang',
    name: '王静',
    role: 'CS（销售支持）',
    department: '销售/客户服务',
    goals: ["\u5feb\u901f\u5b8c\u6210\u5bf9\u8d26\u5e76\u6e05\u7406\u5dee\u5f02", "\u5c3d\u5feb\u63a8\u8fdb POD \u786e\u8ba4\u5e76\u89e6\u53d1\u9884\u5236\u53d1\u7968"],
  },

  {
    id: 'logistics_li',
    name: '李强',
    role: '物流人员',
    department: '物流/仓储',
    goals: ["\u5feb\u901f\u5904\u7406\u7269\u6d41\u53d1\u8fd0\u5173\u8054\u5f02\u5e38", "\u4fdd\u8bc1\u7b7e\u6536\u51ed\u636e\u9f50\u5168\u4e14\u53ef\u8ffd\u6eaf"],
  },

  {
    id: 'finance_chen',
    name: '陈敏',
    role: '财务',
    department: '财务',
    goals: ["\u5feb\u901f\u5b8c\u6210\u53d1\u7968\u8fc7\u8d26\u5e76\u56de\u5199\u51ed\u8bc1", "\u8fc7\u8d26\u5931\u8d25\u53ef\u8ffd\u6eaf\u3001\u53ef\u4eba\u5de5\u786e\u8ba4\u540e\u91cd\u8bd5"],
  },

];

export const scenarios = [

  {
    id: 's1',
    name: '标准交货单的 POD 确认',
    personaId: 'cs_wang',
    trigger: '一批已完成对账、条件齐备的交货单待 POD 确认',
    goal: '5 分钟内完成多张交货单的 POD 匹配确认并自动触发预制发票',
  },

  {
    id: 's2',
    name: '物流关联异常与签收补件',
    personaId: 'logistics_li',
    trigger: '邮件识别发运单号缺失或冲突，交货单长期未关联或未签收',
    goal: '补邮件/补充说明修正关联并留痕，恢复审计链',
  },

  {
    id: 's3',
    name: '发票过账与归档',
    personaId: 'finance_chen',
    trigger: 'POD 已确认、预制发票已生成，进入财务待过账清单',
    goal: '完成过账、回写凭证并打印归档，闭环收入确认',
  },

];