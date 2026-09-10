# 销售POD收入确认工作台 · MVP 原型

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
pod-revenue-recognition/
├── server/
│   ├── index.js            # Express 入口（API + 生产托管前端）
│   ├── config.js           # 端口与全局配置
│   ├── routes/api.js       # 编排路由（8 条）
│   └── services/
│       ├── aiService.js    # Mock AI 服务模块（6 个接口，模拟延迟）
│       └── businessMock.js # Mock 业务系统模块（4 个接口）
├── src/                    # 前端源码（react+antd）
│   ├── pages/              # 5 个页面
│   ├── layouts/            # 工作台布局（侧边栏+顶栏）
│   ├── api/client.js       # API 客户端
│   └── theme.js            # 主题配色
├── vite.config.js
└── package.json
```

## 页面清单


- **/dashboard** · 首页驾驶舱 — 流程节点数量看板与超期异常，待办按角色过滤

- **/collect** · 数据采集中心 — 交货单同步、邮件识别与物流发运关联、签收/POD资料识别

- **/reconcile** · 对账单工作台 — 创建对账单、上传客户反馈、差异分析、借贷项处理

- **/podmatch** · POD 匹配与确认 — 五要素横向匹配、POD 条件校验与一键 POD 确认（对外确认收入的强制人工闸门）

- **/posting** · 发票过账 — 待过账清单、财务过账、凭证回写与打印归档


## 后端接口（Mock）


| GET | /api/dashboard | compose |

| POST | /api/collection/sync | ai:syncCollection |

| GET | /api/deliveries | business:getDeliveries |

| GET | /api/reconciliations | business:getReconciliations |

| POST | /api/reconciliation/analyze | ai:analyzeReconciliation |

| POST | /api/pod/check | ai:checkPodConditions |

| POST | /api/pod/confirm | ai:confirmPod |

| POST | /api/posting/execute | ai:executePosting |


_生成时间：2026-09-10 17:57:06_