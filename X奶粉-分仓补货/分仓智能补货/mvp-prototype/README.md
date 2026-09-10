# 分仓智能补货助手 · 概念原型（MVP）

> 场景：X奶粉事业部 · 分仓智能补货（A2）
> 由 `prototype-generator` Skill 基于《13-分仓智能补货_Agent产品方案 v1.1（SKP 精化）》+ SKP《任务流程挖掘清单》(21 L5) + SKP《任务处理规则挖掘清单》(5 类规则) 生成。
> 前后端一体（Node.js + Express + React/antd），AI 与业务系统均为 **Mock 服务**（脱敏演示数据）。
>
> ⚠️ **概念级声明**：本原型数据为脱敏演示值；SKP v1.1 的 5 类规则（决策模型 6 条/模版范例/术语字典 6 口径/关键信息提取 5 字段/关联关系）已承接进剧本与页面口径，生产模式需接入京慧一盘货/奶粉分仓补调系统/TMS/WMS 真实数据并待客户 IT 校验。

## 快速开始

```bash
npm install        # 安装全部依赖（一次）
npm run dev        # 开发模式：API(:8080) + Vite 前端(:5173)
```

浏览器打开 **http://localhost:5173**

### 生产模式（单端口一体化）

```bash
npm run build      # 构建前端到 dist/
npm start          # 单端口 :8080 同时提供 API 与前端页面
```

## 系统架构

```
浏览器 ──► Vite(前端 :5173) ──/api 代理──► Express(API :8080)
                                                  │
                                                  ├── services/aiService.js      （Mock AI：剧本引擎 + 缺口识别/方案求解/HITL/异常诊断/下发撤销/复盘）
                                                  └── services/businessMock.js   （Mock 业务系统：库存/销售计划/仓网/TMS/WMS）
```

## 目录结构

```
X奶粉事业部-分仓补货/
├── X奶粉事业部-分仓智能补货-mvp-spec.yaml   # MVP 设计规格（脚手架编译源 · 存档）
├── mvp-prototype/
│   ├── server/
│   │   ├── index.js            # Express 入口（API + 生产托管前端）
│   │   ├── config.js           # 端口与全局配置
│   │   ├── routes/api.js       # 编排路由（16 条）
│   │   └── services/
│   │       ├── aiService.js    # Mock AI 服务（剧本引擎 + 11 个方法，模拟延迟）
│   │       └── businessMock.js # Mock 业务系统模块（5 个接口）
│   ├── src/                    # 前端源码（react+antd）
│   │   ├── pages/              # 6 个页面
│   │   ├── components/         # Agent 交互组件（状态徽章/工具卡/思考折叠/HITL/撤销/出处/术语）
│   │   ├── layouts/            # 工作台布局（侧边栏+顶栏）
│   │   ├── api/client.js       # API 客户端
│   │   └── theme.js            # 主题配色（Inspire 品牌色系）
│   ├── docs/                   # 页面截图（shot-*.png）
│   ├── vite.config.js
│   └── package.json
```

## 页面清单（对应 4 条演示故事线 · SKP 规则已承接）

| 路由 | 页面 | 故事线 | 核心能力（SKP 口径） |
|---|---|---|---|
| /workbench | 分货工作台 | 全部 | Agent 对话流 · 状态徽章 · 流式输出 · 工具卡 · HITL · 出处引用（主演示页） |
| /supply | 全仓网供需全景 | 故事线1 | 缺口告警红/黄/蓝：红＝可发量+在途<未来7天需求且 DOS<7 · 黄 7≤DOS<14 · 蓝 DOS>60 且无促销（促销抑制）· 钻取到仓×SKU |
| /allocation | 分货方案工作台 | 故事线2 | 目标备货率=订单进度+20%（封顶100%）· 方案 A/B 对比 · HITL 拦截 · 分配量可编辑+修改留痕 · 凑车±200件 · 就近优先选仓 |
| /exception | 异常诊断与备选方案 | 故事线3 | 冲突仲裁：可发量约束>时效优先 · 拆分多仓补足 · 3 套备选（距离/时效/可发量/生产备货率）· 错误态降级（物流预警未接通→历史运输时效估算） |
| /replenish | 补货单与执行跟踪 | 故事线4 | 补货单校验下发 · 10 秒撤销 Toast · 在途跟踪/延误预警 · 入库差异率≤0.5% 正常损耗（>0.5% 差异追责） |
| /review | 月度复盘报告 | 故事线4 延伸 | 指标总览→短板分析→调参建议→审批（复盘模版）· 阈值：时效≥90% / 缺货缓解≥85% / 周转同比降≤10% |

## SKP 5 类规则消费承接对照

| SKP 规则类型 | 承接位置 |
|---|---|
| 决策模型类（6 条：缺口分级/备货率分配/分配量调整/安全水位/入库差异/复盘调参） | 剧本引擎 thinking/stream/sources + HITL 拦截 + 各页面口径文案 |
| 模版范例类（分货方案/复盘报告模版） | /allocation 方案工作台（方案头/明细/效果预估/待确认项）+ /review 指标总览→短板分析→调参→审批 |
| 术语字典类（6 口径：可发量/待检/合格/在途/DOS/生产备货率/订单完成率） | 顶栏「术语口径」弹窗 + 页面 TermTooltip hover 卡 |
| 关键信息提取要点（5 字段） | /supply 钻取抽屉 + 出处引用悬浮卡（字段典型位置/易错点） |
| 关联关系类（基地仓-销售仓-产品-SKU-渠道） | /supply 供需全景看板（仓网拓扑）+ NetworkMap |

## 必备交互 10 项（产品承诺）落地情况

| # | 交互 | 落地位置 |
|---|---|---|
| 1 | 流式输出 | AgentChat · StreamText（打字机动画） |
| 2 | 工具调用可视化 | ToolCallCard（running → done/error） |
| 3 | 思考过程可折叠 | ThinkingBlock（点击展开） |
| 4 | 内联组件 | InlineArtifact（供需全景/方案/备选/补货单） |
| 5 | HITL 拦截 | HitlBanner + 分货方案工作台横幅（确认/改用B/修改后校验） |
| 6 | 撤销回滚 | UndoToast（10 秒倒计时）+ /api/agent/order/undo |
| 7 | 出处引用 | SourceCard 悬浮卡（数据/知识来源 + 置信度） |
| 8 | 状态徽章 | AgentStatusBadge（idle/thinking/tool_calling/streaming/awaiting_human/error） |
| 9 | 错误态 | 故事线3 TMS 未接通降级提示 + 兜底选项 |
| 10 | 空态 | AgentChat 首屏空态引导 |

## 后端接口（Mock）

### Agent 剧本引擎
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /api/agent/run | 按故事线返回完整 Agent 运行剧本（status/thinking/tool/stream/artifact/hitl/final） |
| GET | /api/glossary | 术语口径字典 |

### 故事线1 · 缺口识别
| POST | /api/agent/gaps | 全仓网供需全景 + 缺口告警清单 |

### 故事线2 · 方案生成 / HITL
| POST | /api/agent/plan | 多约束方案求解（A 均衡版 / B 优先版） |
| POST | /api/agent/plan/adjust | 人工确认/微调后重新校验约束 |
| POST | /api/agent/hitl/confirm | HITL 确认写入 |

### 故事线3 · 异常诊断
| POST | /api/agent/exception | 华北基地仓缺货诊断 + 3 套备选 + 降级态 |

### 故事线4 · 下发 / 撤销 / 跟踪 / 复盘
| POST | /api/agent/order/issue | 补货单校验并下发 |
| POST | /api/agent/order/undo | 撤销下发（回滚物流调度+财务） |
| GET | /api/agent/track | 执行跟踪（在途定位/延误/入库差异） |
| POST | /api/agent/review | 月度复盘报告 + 调参建议 |

### 业务系统（相邻系统 mock）
| GET | /api/business/inventory | 基地仓现货/待检/合格/在途 |
| GET | /api/business/sales-plan | 销售计划 / 京慧建议量 / 备货率 |
| GET | /api/business/network-distance | 仓网距离 / 时效 / 安全水位 |
| GET | /api/business/tms-status | TMS 物流预警（模拟降级态） |
| GET | /api/business/wms-receipt | WMS 入库验收差异 |

## 演示脚本建议

1. 打开 /workbench → 点击「故事线 1」→ 观察流式输出/工具卡/供需全景内联组件/出处引用。
2. 点击「故事线 2」→ 等待 HITL 横幅 → 点「确认并写入分配量」→ 观察约束重新校验。
3. 点击「故事线 3」→ 观察 TMS 错误态降级提示与 3 套备选。
4. 点击「故事线 4」→ 观察补货单下发与「10 秒内可撤销」提示。
5. 侧边栏逐个浏览 5 个功能页面。

_生成时间：2026-08-23 · 概念级 MVP · 脱敏演示数据_
