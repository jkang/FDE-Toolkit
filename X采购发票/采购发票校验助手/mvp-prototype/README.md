# X · 采购发票校验助手 · MVP 原型

> 由 `prototype-generator` Skill 基于 AI Canvas + To-be Journey 自动生成。
> 前后端一体（Node.js + Express + antd），AI 与业务系统均为 Mock 服务。

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
                                                      ├── services/aiService.js      （Mock AI：识别/推荐/审批/对话）
                                                      └── services/businessMock.js   （Mock 业务系统：ERP/SRM）
```

## 目录结构

```
invoice-verification-agent/
├── server/
│   ├── index.js            # Express 入口（API + 生产托管前端）
│   ├── config.js           # 端口与全局配置
│   ├── routes/api.js       # 编排路由（13 条）
│   └── services/
│       ├── aiService.js    # Mock AI 服务模块（8 个接口，模拟延迟）
│       └── businessMock.js # Mock 业务系统模块（5 个接口）
├── src/                    # 前端源码（react+antd）
│   ├── pages/              # 6 个页面
│   ├── layouts/            # 工作台布局（侧边栏+顶栏）
│   ├── api/client.js       # API 客户端
│   └── theme.js            # 主题配色
├── vite.config.js
└── package.json
```

## 页面清单


- **/dashboard** · 校验工作台总览 — 五阶段全链路概览、量化指标与待办；AI 校验搭档对话入口

- **/collection** · 发票归集看板 — P1 发票多渠道采集归集：乐企 / 供应商上传 / 采购补录三渠道分栏，自动查重查漏

- **/recognition** · 用途确认与识别校验 — P2 票面识别与真伪/抬头校验；低置信字段标红转人工复核

- **/matching** · 三单匹配工作台 — P3 以发票行为主线做行级三单匹配与四数量对照，差异高亮、超容忍必拉人

- **/exceptions** · 异常凭证队列 — P4 异常按类型分组，每张带差异明细、处理建议、沟通对象与升级路径

- **/ledger** · 入账与归档台账 — P5 批量预制与过账：硬门禁前置条件检查列、凭证号、乐企状态与归档索引


## 后端接口（Mock）


| POST | /api/invoice/collect | ai:collectInvoices |

| POST | /api/invoice/recognize | ai:recognizeInvoices |

| POST | /api/match/run | ai:runThreeWayMatch |

| POST | /api/exception/judge | ai:judgeException |

| POST | /api/ledger/prebook | ai:batchPrebook |

| POST | /api/ledger/post | ai:batchPost |

| POST | /api/ledger/sync-leqi | ai:syncLeqi |

| POST | /api/agent/chat | ai:chatAssistant |

| GET | /api/erp/purchase-orders | business:getPurchaseOrders |

| GET | /api/erp/goods-receipts | business:getGoodsReceipts |

| GET | /api/fs/delivery-notes | business:getDeliveryNotes |

| GET | /api/erp/validation | business:getErpValidation |

| GET | /api/master/dictionary | business:getMasterData |


_生成时间：2026-09-10 13:23:07_