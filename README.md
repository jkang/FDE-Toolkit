# FDE-Toolkit · FDE 四步法技能工具链与案例集

> 面向 FDE 课程学员：**课前环境准备**请按本说明操作。FDE-Toolkit 是「可迁移、无绝对路径」的工具包，专门为 FDE 四步法（理需求 → 挖知识 → 建本体 → 生智能）设计。

---

## 1. 这是什么

一套 **AI 场景分析与交付工具链（skills）+ 案例集**，帮你把每一步的交付物「一键生成」：

- **技能工具链（30+ 个 skills）**：覆盖四步法全流程——业务流程分析、体验旅程图、服务蓝图、AI 机会地图、优先级矩阵、AI 场景画布、北星指标（理需求）；CKD 映射、To-be 流程泳道、Agentic 工作流设计（挖知识）；Agent 本体设计（建本体）；MVP 原型生成、MVP 成效指标、MVP 测试数据集、UX 优化、里程碑计划（生智能）。
- **Agent / Command 编排层**：`/client-insight`、`/nsm`、`/opportunity`、`/roadmap`、`/agent-arch`、`/mvp-eval`、`/mvp-prototype` 等命令，把多个技能串联成标准工作流。
- **案例集**：`X电商订舱/`（航运电商订舱，含智能订舱 Agent 全套交付物）、`铁路订票服务/`，作为演练的示例与数据底稿。

## 2. 环境准备（详细安装配置指南）

本课程用 **opencode**（AI 编程/分析 Agent）来运行 skills 工具链，推荐大家使用；也可以用 **Qoder**（国际版，见 2.5，API 已配好，装好即用）。请按以下步骤完成环境准备，**务必在你自己的电脑上装好并配置完成，课前我们会有环境自检**。

### 2.1 安装 opencode 桌面端

> 大部分学员使用 **Windows**，下面以 Windows 为主说明；macOS / Linux 学员操作类似。

1. 打开 opencode 官方下载页：**https://opencode.ai/download**
2. 按你的操作系统下载对应版本：
   - **Windows**：下载 `opencode-*-x64-setup.exe`（64 位安装包）
   - **macOS**：下载 `.dmg` 安装包
   - **Linux**：下载 `.AppImage` 或 `.deb`
3. 双击安装包，按提示完成安装（一路「下一步」即可）。
4. 安装完成后，启动 **OpenCode** 桌面应用，确认能正常打开主界面。

> 备选安装方式（熟悉命令行的学员）：
> ```bash
> # Windows（任选其一）
> choco install opencode     # 或
> scoop install opencode     # 或
> npm install -g opencode-ai
> # macOS
> brew install anomalyco/tap/opencode
> ```
> 桌面端与命令行共用同一套配置，用哪种安装都不影响后续步骤。

### 2.2 配置组织私有化部署的 API

本课程使用**组织内部私有化部署的大模型 API**（OpenAI 兼容网关），学员用自己的 API Key 接入，不需要注册任何外部服务。

#### 第 1 步 · 获取你的 API Key

向组织 IT / 课程管理员申请你的个人 API Key（形如 `sk-...`），同时拿到：

| 信息 | 示例 | 说明 |
| --- | --- | --- |
| 网关地址（baseURL） | `https://llm-gateway.组织域名.com/v1` | 私有化部署的入口 |
| API Key | `sk-xxxx...` | 你的个人密钥，**不要泄露** |
| 模型 ID | 如 `qwen3-coder`、`deepseek-v4` 等 | 组织已部署的模型名 |

#### 第 2 步 · 打开 opencode 配置文件

- **Windows**：`C:\Users\<你的用户名>\.config\opencode\opencode.json`
- **macOS / Linux**：`~/.config/opencode/opencode.json`

> 如果该文件不存在，手动创建即可；`.config` 目录是隐藏目录，Windows 下可在资源管理器地址栏直接输入路径回车，macOS 下用 `Cmd+Shift+.` 显示隐藏文件或直接用终端创建。

#### 第 3 步 · 粘贴配置

用记事本 / VS Code 打开 `opencode.json`，填入以下内容（**把示例值替换成你拿到的真实值**）：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "internal": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "组织私有化 LLM",
      "options": {
        "baseURL": "https://llm-gateway.组织域名.com/v1",
        "apiKey": "sk-你的APIKey"
      },
      "models": {
        "模型ID": {
          "name": "模型显示名（可选）"
        }
      }
    }
  },
  "model": "internal/模型ID"
}
```

各字段说明：

| 字段 | 填什么 |
| --- | --- |
| `provider.internal` | 自定义 provider 名称，`internal` 可改成任意英文名 |
| `npm` | **保持 `@ai-sdk/openai-compatible` 不变**（适配 OpenAI 兼容网关） |
| `options.baseURL` | 第 1 步拿到的网关地址，**以 `/v1` 结尾** |
| `options.apiKey` | 第 1 步拿到的个人 API Key |
| `models` 下的键 | 第 1 步拿到的模型 ID |
| `model` | 设为 `internal/模型ID`，作为默认模型 |

#### 第 4 步 · 验证配置

1. 保存文件后**完全退出并重新打开** opencode 桌面端。
2. 在对话输入框发送任意消息（如「你好」），能收到正常回复即配置成功。
3. 若提示模型不存在或鉴权失败，检查：baseURL 是否以 `/v1` 结尾、模型 ID 是否和网关下发的一致、API Key 是否复制完整（无多余空格）。

> **安全提醒**：API Key 属于个人凭证，不要提交到任何 git 仓库、不要发到群里。配置文件在 `~/.config` 目录下，不会随本仓库提交。

### 2.3 安装 git

- **Windows**：下载安装 [Git for Windows](https://git-scm.com/download/win)，一路默认即可。
- **macOS**：安装 Xcode Command Line Tools（终端运行 `xcode-select --install`）。
- **Linux**：`sudo apt install git`（或对应包管理器）。

### 2.4 （可选）Node.js

需要启动可运行 MVP 原型时使用（Vite + Express）。

- 下载安装 [Node.js LTS](https://nodejs.org/)（v18+）。
- 验证：终端运行 `node -v` 能输出版本号。

> 环境受限也没关系：课上教练会用现成案例当示例，你先学方法，再逐步上手。

### 2.5 （可选）使用 Qoder（国际版）

如果你习惯用 **Qoder**，也可以直接用它运行本工具链（仓库已内置 `.qoder/` 的 commands / agents，克隆即可；skills 从全局 `~/.config/opencode/skills/` 同步）：

1. 安装 **Qoder 国际版**（从 [qoder.ai](https://qoder.ai) 下载，区别于 qoder.cn 中文版）。
2. Qoder 的模型 API 已由组织配置好，**无需额外设置**。
3. 用 Qoder 打开本仓库目录（`FDE-Toolkit/`），在对话里输入 `/agent-arch`、`/mvp-prototype` 等命令即可调用演练 Agent（与 opencode 的 `/command` 用法一致）。

> 主推 opencode 的原因：本工具链的 skills 以 opencode 目录（`.opencode/`）为基准同步，Qoder（`.qoder/`）为配套分发，两者体验一致；个别命令细节以课上实际演示为准。

## 3. 课前准备三步

```bash
# ① 克隆仓库
git clone <本仓库地址> FDE-Toolkit
cd FDE-Toolkit

# ② 用 opencode 桌面端打开本目录
#    在 opencode 中新建会话时选择「打开文件夹」，指向 FDE-Toolkit 目录
#    然后运行：/nsm  确认命令可用（或用 /agent-arch /mvp-prototype）

# ③ （可选）把技能库同步到全局，便于任意目录调用
#    Windows: 用 Git Bash 或 PowerShell 执行
rsync -a --delete skills/ ~/.config/opencode/skills/
```

## 4. 课前自检清单

- [ ] **opencode 桌面端已安装**（或用 Qoder 国际版），能正常打开主界面。
- [ ] **私有化 API 已配置**（opencode 需手动配置；Qoder 已配好），发消息能收到回复。
- [ ] **git 已安装**，能 `git clone` 本仓库。
- [ ] 能在这个工具里调用 skills 技能，跑通一次「生成报告」。
- [ ] （可选）Node.js 已安装，能启动 MVP 原型（`npm install && npm run dev`）并打开页面。
- [ ] 能访问到本仓库的案例集（`X电商订舱/`）。

## 5. 目录地图

```
FDE-Toolkit/
├── skills/                技能工具链（30+，演练用，勿开发副本）
│   └── index.md           技能总索引
├── .opencode/             演练 Agent / Command 定义（opencode，/command → 技能 串联）
├── .qoder/                演练 Agent / Command / Skill 定义（Qoder 国际版配套）
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
