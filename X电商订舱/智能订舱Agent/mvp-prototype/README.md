# X 智能订舱 Agent · MVP 原型

> 由 `prototype-generator` Skill 基于 AI Canvas + To-be Journey 自动生成。
> 前后端一体（Node.js + Express + antd），AI 与业务系统均为 Mock 服务。

## 快速开始

```bash
npm install        # 安装全部依赖（一次）
npm run dev        # 开发模式：API(:8081) + Vite 前端(:5173)
```

浏览器打开 **http://localhost:5173**

### 生产模式（单端口一体化）

```bash
npm run build      # 构建前端到 dist/
npm start          # 单端口 :8081 同时提供 API 与前端页面
```

## 系统架构

```
浏览器 ──► Vite(前端 :5173) ──/api 代理──► Express(API :8081)
                                                      │
                                                      ├── services/aiService.js      （Mock AI：识别/推荐/审批/对话）
                                                      └── services/businessMock.js   （Mock 业务系统：ERP/SRM）
```

## 目录结构

```
smart-booking-agent/
├── server/
│   ├── index.js            # Express 入口（API + 生产托管前端）
│   ├── config.js           # 端口与全局配置
│   ├── routes/api.js       # 编排路由（8 条）
│   └── services/
│       ├── aiService.js    # Mock AI 服务模块（6 个接口，模拟延迟）
│       └── businessMock.js # Mock 业务系统模块（2 个接口）
├── src/                    # 前端源码（react+antd）
│   ├── pages/              # 6 个页面
│   ├── layouts/            # 工作台布局（侧边栏+顶栏）
│   ├── api/client.js       # API 调用端
│   └── theme.js            # 主题配色
├── vite.config.js
└── package.json
```

## 页面清单


- **/dashboard** · 工作台总览 — 北极星贡献看板：电商订舱渗透率 25%[推断] → 40%（phase3 口径）

- **/chat-quote** · 对话询价 — 以自然语言发起询价，Agent 实时解读报价与费用构成

- **/recommend-confirm** · 舱位推荐与一键订舱 — AI 综合排序推荐 Top 3 舱位方案，对话内一键确认订舱

- **/document-si** · 单证预填与补件 — 上传 PI / 装箱单，AI 自动抽取字段预填 SI，缺件实时提示并给出示例

- **/tracking-alert** · 出运跟踪与预警 — 控制塔里程碑实时可见；AI 预测性延误预警与改配方案

- **/payment-aftercare** · 支付与售后复购 — 多币种在线支付；D&D 前置透明与会员权益推荐


## 后端接口（Mock）


| POST | /api/agent/chat | ai:chatQuote |

| POST | /api/agent/recommend | ai:recommendSpace |

| POST | /api/booking/submit | ai:submitBooking |

| POST | /api/document/parse | ai:parseDocuments |

| POST | /api/agent/predict-delay | ai:predictDelay |

| POST | /api/payment/pay | ai:payOrder |

| GET | /api/orders | business:getBookingList |

| GET | /api/shipments/tracking | business:getTracking |


_生成时间：2026-08-21 21:41:07_