# FDE-Toolkit · FDE 四步法技能工具链与案例集

> 面向训战营学员：**课前环境准备**请按本说明操作。FDE-Toolkit 是「可迁移、无绝对路径」的工具包，专门为 FDE 四步法（理需求 → 挖知识 → 建本体 → 生智能）设计。

---

## 1. 这是什么

一套 **AI 场景分析与交付工具链（skills）+ 案例集**，帮你把每一步的交付物「一键生成」：

- **技能工具链（30+ 个 skills）**：覆盖四步法全流程——业务流程分析、体验旅程图、服务蓝图、AI 机会地图、优先级矩阵、AI 场景画布、北星指标（理需求）；CKD 映射、To-be 流程泳道、Agentic 工作流设计（挖知识）；Agent 本体设计（建本体）；MVP 原型生成、MVP 成效指标、MVP 测试数据集、UX 优化、里程碑计划（生智能）。
- **Agent / Command 编排层**：`/client-insight`、`/nsm`、`/opportunity`、`/roadmap`、`/agent-arch`、`/mvp-eval`、`/mvp-prototype` 等命令，把多个技能串联成标准工作流。
- **案例集**：`X电商订舱/`（航运电商订舱，含智能订舱 Agent 全套交付物）、`铁路订票服务/`，作为演练的示例与数据底稿。

## 2. 环境要求

| 项 | 要求 | 说明 |
| --- | --- | --- |
| git | 任意可用版本 | 拉取本仓库 |
| opencode / CLI 环境 | 已安装 | 运行 skills 工具链（生成报告、YAML、HTML） |
| Node.js（可选） | v18+ | 启动可运行 MVP 原型（Vite + Express）时使用 |

> 环境受限也没关系：课上教练会用现成案例当示例，你先学方法，再逐步上手。

## 3. 课前准备三步

```bash
# ① 克隆仓库
git clone <本仓库地址> FDE-Toolkit
cd FDE-Toolkit

# ② 用 opencode 打开本目录，并确认能调用命令
#    在 opencode 中运行：/get-started

# ③ （可选）把技能库同步到全局，便于任意目录调用
rsync -a --delete skills/ ~/.config/opencode/skills/
```

## 4. 进营前自检清单

- [ ] 能在这个终端里调用 skills 技能，跑通一次「生成报告」。
- [ ] （可选）能启动 MVP 原型（`npm install && npm run dev` 或对应启动脚本）并打开页面。
- [ ] 能访问到本仓库的案例集（`X电商订舱/`）。

## 5. 目录地图

```
FDE-Toolkit/
├── skills/                技能工具链（30+，演练用，勿开发副本）
│   └── index.md           技能总索引
├── .opencode/             演练 Agent / Command 定义（/command → 技能 串联）
├── X电商订舱/             案例：航运电商订舱（四步法真实样例）
├── 铁路订票服务/           案例：铁路订票服务
└── AGENTS.md              工具包协作规范（可迁移、无绝对路径）
```

## 6. 演练用法

- 演练步骤按「调用 Agent（/command → 技能）」串联，例如：`/agent-arch` → To-be 流程 / 任务流程挖掘清单。
- 产出物请放在自己小组的目录下，**不要**修改 `skills/` 与案例集内容。

## 7. 更新

```bash
git pull
```
