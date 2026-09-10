# 退改签智能助手 · MVP 原型

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
railway-refund-change/
├── server/
│   ├── index.js            # Express 入口（API + 生产托管前端）
│   ├── config.js           # 端口与全局配置
│   ├── routes/api.js       # 编排路由（7 条）
│   └── services/
│       ├── aiService.js    # Mock AI 服务模块（5 个接口，模拟延迟）
│       └── businessMock.js # Mock 业务系统模块（3 个接口）
├── src/                    # 前端源码（react+antd）
│   ├── pages/              # 5 个页面
│   ├── layouts/            # 工作台布局（侧边栏+顶栏）
│   ├── api/client.js       # API 客户端
│   └── theme.js            # 主题配色
├── vite.config.js
└── package.json
```

## 页面清单


- **/dashboard** · 处置工作台总览 — 退改签待办、运行变更与自助率概览

- **/translate** · 规则转译与费用对比 — 阶梯费率实时转译为大白话，输出退票损失 vs 改签成本对比

- **/recommend** · 改签方案推荐 — 并发检索直达/候补/换乘方案，结合偏好与成功率排序输出 Top 3（P0）

- **/dispose** · 一体化处置 — 发起主票退改并同步处置关联延伸服务（餐食/约车/行程单）

- **/confirm** · 确认与通知 — 输出处置确认清单、通知推送与行程更新；复杂异常建单转客服


## 后端接口（Mock）


| POST | /api/scene/identify | ai:identifyScene |

| POST | /api/fee/translate | ai:translateFee |

| POST | /api/plan/recommend | ai:recommendPlans |

| POST | /api/change/dispose | ai:disposeChange |

| POST | /api/notice/push | ai:pushNotice |

| GET | /api/order | business:getOrder |

| GET | /api/run-status | business:getRunStatus |


_生成时间：2026-09-10 18:56:44_