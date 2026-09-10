// =========================================================
// ZXMOTO 赛事内容工厂 Agent · 角色与场景（由 mvp_spec.personas/scenarios 生成）
// =========================================================

export const personas = [

  {
    id: 'brand_manager',
    name: '林岚',
    role: '品牌内容经理',
    department: '海外市场部 · 品牌组',
    goals: ["\u8d5b\u4e8b\u70ed\u70b9\u7b2c\u4e00\u65f6\u95f4\u51fa\u7247\uff0c\u53c8\u4e0d\u5931\u54c1\u724c\u8c03\u6027\u4e00\u81f4\u6027", "\u5bf9\u5916\u5185\u5bb9\u96f6\u7ea2\u7ebf\u98ce\u9669\uff0c\u5ba1\u6838\u4e0d\u88ab\u53cd\u590d\u8fd4\u5de5"],
  },

  {
    id: 'social_ops',
    name: '苏晴',
    role: '社媒运营专员',
    department: '海外市场部 · 内容运营组',
    goals: ["\u811a\u672c\u4e8b\u5b9e\u4e0e\u8c03\u6027\u62bd\u68c0\u4e00\u6b21\u901a\u8fc7\uff0c\u6392\u671f\u4e0d\u9519\u8fc7\u4f20\u64ad\u7a97\u53e3", "6 \u8bed\u8a00\u5185\u5bb9\u4e00\u6b21\u4ea7\u51fa\uff0c\u4e0d\u518d\u7b49\u5916\u5305\u672c\u5730\u5316"],
  },

  {
    id: 'race_ops',
    name: '陈拓',
    role: '赛事运营负责人',
    department: '赛事运营部',
    goals: ["\u539f\u59cb\u7d20\u6750\u4e00\u6b21\u4e0a\u4f20\u5373\u8fdb\u5165\u5de5\u5382\uff0c\u4e0d\u5fc5\u914d\u5408\u9010\u5e27\u526a\u8f91", "\u7d20\u6750\u6388\u6743\u6e05\u6670\uff0c\u907f\u514d\u53d1\u5e03\u540e\u88ab\u7248\u6743\u8ffd\u8d23"],
  },

];

export const scenarios = [

  {
    id: 's1',
    name: '分站赛后紧急出片',
    personaId: 'race_ops',
    trigger: 'WSBK 荷兰站比赛结束，赛事运营负责人上传原始素材，要求抢占热点传播窗口',
    goal: '单站素材在 30 分钟内产出高光短视频，不再等人工逐帧剪辑',
  },

  {
    id: 's2',
    name: '6 语言同步发布',
    personaId: 'social_ops',
    trigger: '高光脚本确认后，需一次产出 6 语言版本并适配 YouTube/TikTok/Instagram/Reels',
    goal: '6 语言 × 4 平台内容包一次产出并排期，多语言单位成本下降 90%',
  },

  {
    id: 's3',
    name: '效果回流与下轮策略',
    personaId: 'brand_manager',
    trigger: '内容发布后回收互动数据，需归因并优化下轮高光偏好与内容策略',
    goal: '把互动效果归因到高光类型/脚本风格/平台/时段，更新高光偏好权重',
  },

];