// =========================================================
// 退改签智能助手 · 角色与场景（由 mvp_spec.personas/scenarios 生成）
// =========================================================

export const personas = [

  {
    id: 'biz_wang',
    name: '王敏',
    role: '商务旅客',
    department: '企业差旅',
    goals: ["\u884c\u7a0b\u53d8\u52a8\u65f6\u5feb\u901f\u6539\u7b7e", "\u6e05\u695a\u77e5\u9053\u9000\u6539\u8981\u82b1\u591a\u5c11"],
  },

  {
    id: 'return_li',
    name: '李婷',
    role: '节假日返乡旅客',
    department: '个人出行',
    goals: ["\u9ad8\u5cf0\u671f\u4e5f\u80fd\u6539\u5230\u5408\u9002\u8f66\u6b21", "\u5173\u8054\u670d\u52a1\u4e0d\u9057\u6f0f"],
  },

  {
    id: 'csr_zhang',
    name: '张伟',
    role: '一线客服',
    department: '客服中心',
    goals: ["\u53ea\u5904\u7406\u590d\u6742\u5f02\u5e38", "\u5f02\u5e38\u5355\u5e26\u5b8c\u6574\u4e0a\u4e0b\u6587"],
  },

];

export const scenarios = [

  {
    id: 's1',
    name: '列车晚点改签',
    personaId: 'biz_wang',
    trigger: '列车 G1234 晚点 95 分钟，Push 卡片唤醒',
    goal: '秒级锁定最优改签方案并完成处置',
  },

  {
    id: 's2',
    name: '计划性退票',
    personaId: 'return_li',
    trigger: '行程取消，主动发起退票',
    goal: '看清退票损失，判断退还是改更划算',
  },

  {
    id: 's3',
    name: '复杂异常转人工',
    personaId: 'csr_zhang',
    trigger: '特殊票种计费存疑，规则盲区',
    goal: '带上下文一次性解决复杂争议',
  },

];