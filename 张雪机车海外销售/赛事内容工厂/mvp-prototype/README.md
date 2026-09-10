# ZXMOTO 赛事内容工厂 Agent · MVP 原型

> 由 `prototype-generator` Skill 基于 AI Canvas + To-be Journey 自动生成。
> 前后端一体（Node.js + Express + antd），AI 与业务系统均为 Mock 服务。

## 快速开始

```bash
npm install        # 安装全部依赖（一次）
npm run dev        # 开发模式：API(:18080) + Vite 前端(:5273)
```

浏览器打开 **http://localhost:5273**

### 生产模式（单端口一体化）

```bash
npm run build      # 构建前端到 dist/
npm start          # 单端口 :18080 同时提供 API 与前端页面
```

## 系统架构

```
浏览器 ──► Vite(前端 :5273) ──/api 代理──► Express(API :18080)
                                                      │
                                                      ├── services/aiService.js      （Mock AI：识别/推荐/审批/对话）
                                                      └── services/businessMock.js   （Mock 业务系统：ERP/SRM）
```

## 目录结构

```
zxmoto-race-content-factory/
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
│   ├── api/client.js       # API 客户端
│   └── theme.js            # 主题配色
├── vite.config.js
└── package.json
```

## 页面清单


- **/dashboard** · 内容工厂总览 — 赛事内容工厂北极星贡献看板：内容产出时效 3 天 → 30 分钟，多语言成本 ↓90%

- **/ingest** · 素材接入与高光识别 — 上传 WSBK 原始素材，Agent 多模态理解并四因子打分产出高光候选

- **/script-clip** · 多语言脚本与剪辑 — 基于叙事要素生成 6 语言解说脚本并本地化改写，随后自动剪辑配音包装

- **/platform-adapt** · 平台适配与内容包 — 按 YouTube/TikTok/Instagram/Reels 硬规范适配时长/比例/编码并生成标签与 SEO 图文

- **/review-publish** · 品牌审核与发布 — 品牌调性/内容红线/事实三级校验（对外必停），放行后按热点窗口排期发布

- **/feedback** · 效果回流与策略优化 — 互动数据归因到高光类型/脚本风格/平台/时段，样本充分时更新高光偏好权重


## 后端接口（Mock）


| POST | /api/content/parse-footage | ai:parseFootage |

| POST | /api/content/highlights | ai:scoreHighlights |

| POST | /api/content/script | ai:generateScript |

| POST | /api/content/adapt | ai:adaptPlatforms |

| POST | /api/content/review | ai:reviewCompliance |

| POST | /api/content/attribute | ai:attributePerformance |

| POST | /api/content/publish | business:publishContent |

| GET | /api/content/publishes | business:getPublishRecords |


_生成时间：2026-09-10 19:57:36_