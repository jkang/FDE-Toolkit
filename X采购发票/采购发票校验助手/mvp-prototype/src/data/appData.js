// =========================================================
// X · 采购发票校验助手 · 角色与场景（由 mvp_spec.personas/scenarios 生成）
// =========================================================

export const personas = [

  {
    id: 'ap_accountant_wang',
    name: '王敏',
    role: '应付会计',
    department: '财务部 · 应付组',
    goals: ["\u628a\u6bcf\u5929\u591a\u6e20\u9053\u8fdb\u6765\u7684\u91c7\u8d2d\u53d1\u7968\u5c3d\u5feb\u5b8c\u6210\u4e09\u5355\u5339\u914d\u5e76\u5b89\u5168\u5165\u8d26", "\u4e0d\u518d\u9010\u7968\u9010\u884c\u4eba\u5de5\u6bd4\u5bf9\uff0c\u53ea\u5904\u7406\u771f\u6b63\u62ff\u4e0d\u51c6\u7684\u5f02\u5e38", "\u628a\u8d44\u6df1\u7ecf\u9a8c\u6c89\u6dc0\u6210\u53ef\u590d\u6838\u7684\u6807\u51c6\u52a8\u4f5c\uff0c\u6362\u4eba\u4e0d\u65ad\u6863"],
  },

  {
    id: 'buyer_li',
    name: '李强',
    role: '采购业务员',
    department: '采购部 · 生产物料组',
    goals: ["\u5f02\u5e38\u53d1\u7968\u6309\u7c7b\u578b\u5feb\u901f\u5206\u6d41\uff0c\u4e00\u773c\u770b\u6e05\u5904\u7406\u5efa\u8bae\u4e0e\u6c9f\u901a\u5bf9\u8c61", "\u4e0e\u4f9b\u5e94\u5546\u6c9f\u901a\u6709\u636e\u53ef\u4f9d\uff0c\u51cf\u5c11\u591a\u8f6e\u90ae\u4ef6\u5f80\u8fd4"],
  },

  {
    id: 'fin_manager_chen',
    name: '陈静',
    role: '财务负责人',
    department: '财务部 · 核算与共享中心',
    goals: ["\u9884\u5236/\u8fc7\u8d26\u524d\u7f6e\u6761\u4ef6\u5168\u7eff\u624d\u653e\u884c\uff0c\u8fc7\u8d26\u7559\u75d5\u53ef\u8ffd\u6eaf", "\u53d1\u7968\u5230\u8fc7\u8d26\u5468\u671f\u7f29\u77ed\uff0c\u53f0\u8d26\u4e0e\u4e50\u4f01\u72b6\u6001\u4e00\u6b21\u5230\u4f4d"],
  },

];

export const scenarios = [

  {
    id: 's1',
    name: '月初批量校验',
    personaId: 'ap_accountant_wang',
    trigger: '月初发票集中到票，需对本月采购发票批量完成归集、识别与三单匹配',
    goal: '批量完成 46 张发票的归集、识别与三单匹配，自动放行匹配通过票、按类型分流异常票',
  },

  {
    id: 's2',
    name: '异常票返工',
    personaId: 'buyer_li',
    trigger: '三单匹配出现数量超差/抬头税号不符等异常，需采购业务员按 PO 权限复核并与供应商沟通',
    goal: '异常票按类型分流并给出处理建议与升级路径，沟通结果登记后自动挂起重跑三单匹配',
  },

  {
    id: 's3',
    name: '批量预制过账',
    personaId: 'fin_manager_chen',
    trigger: '匹配通过票批量预制后，财务负责人对待过账发票审核放行并更新乐企入账标识',
    goal: '预制/过账硬门禁全绿后批量放行，台账、乐企入账标识、归档索引一次更新到位',
  },

];