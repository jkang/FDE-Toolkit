---
name: prototype-generator
description: |
  高级 MVP 原型生成器 —— 输入 AI Canvas + To-be Journey 设计，
  编译输出可启动运行的前后端一体化 MVP 应用（React/Vue + Express + Mock AI/业务服务）。

  Triggers when user mentions:
  - "生成 MVP 原型"
  - "生成高级原型"
  - "MVP 应用设计"
  - "前后端原型"
  - "generate MVP prototype"
  - "create interactive prototype"
  - "原型生成"
author: KK
---

# Prototype Generator (MVP 原型生成器)

承接 `ai-canvas-generator`（AI 场景定义）与 `ai-product-journey-generator`（To-be 旅程设计），
以 **AI 产品 MVP 架构师** 的视角，编译出一个**可一键启动、前后端一体、UI 专业**的 MVP 应用。

```
AI Canvas YAML + To-be Journey YAML（+ 用户偏好：前端框架/配色）
        │
        ▼
【LLM】推演 MVP 设计规格 mvp_spec.yaml
        │
        ▼
【Python 脚手架】scaffold_mvp.py 编译 → <案例>/<场景>/mvp-prototype/
        │
        ▼
【验证】npm install → npm run dev → curl + 浏览器实测
```

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉设计）
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: `mvp_spec.yaml`（MVP 设计规格），用于脚手架编译与数据存档。
> 2. **交互式 HTML / 工程**: 可启动运行的前后端一体化 MVP 应用（React/Vue + Express）。
>
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件命名**:
>   - `mvp_spec.yaml` 产物命名 `[公司/业务名]-[场景名]-mvp-spec.yaml`（例如：`张雪机车海外销售-售后理赔-mvp-spec.yaml`），**必须**与 MVP 应用同放于 `<案例>/<场景>/` 目录；
>   - Skill 的 `examples/` 目录仅存放演示样例，**禁止**将客户产物保存在其中。
> - **禁止**将场景级产物输出到 `<客户案例目录>/` 根目录。
>
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按本 skill `references/` 内示例的视觉规范输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动

---

## 核心能力

| 需求 | 实现 |
|------|------|
| ① 前端 React 或 Vue | Step 0 必问用户；React→Ant Design，Vue→Arco Design |
| ② AI 功能独立 service | `server/services/aiService.js` 独立模块（识别/推荐/审批/对话，含模拟延迟，可抽离微服务） |
| ③ 业务系统交互 mock | `server/services/businessMock.js` 独立模块（ERP/SRM/HR 数据接口） |
| ④ 专业设计系统 | AntD / Arco 工作台布局（侧边栏+顶栏+卡片/表格/表单/对话组件） |
| ⑤ 主题配色 | 用户提供配色→直接用；否则按业务域自动推导（供应链→蓝+橙；金融→深蓝+金…） |
| ⑥ 输出目录 | `<客户案例目录>/<场景目录>/mvp-prototype/`（脚手架 `--case` / `--scenario` 指定） |
| ⑦ 启动验证 | 安装依赖 → 启动 → curl API 实测 + 浏览器打开前端验证 UI 与 AI 交互 |
| ⑧ 业务数据 & 过程仿真 | `--sim sim_spec.yaml`，生成场景数据源 + 可视化组件（segChart/routeMap/nestedGroup/documentBlock/stateMachine/processTimeline） |

---

## 工作流 SOP

### Step 0 · 需求澄清（必问）
1. **前端框架**：React 还是 Vue？
2. **配色**：是否有指定主色/强调色/Logo？（无则按业务域自动推导）
3. **端口偏好**：默认 Vite `:5173` / API `:8080`，是否冲突？

### Step 0' · sim_spec（业务数据 & 过程仿真，推荐）
> 在 `mvp_spec` 之后**建议新增一轮 `sim_spec`**（`references/sim_spec_schema.yaml` + `references/sim_prompts.md`），
> 用于把「业务数据深度 + 过程状态 + 业务可视化」编译进原型。`mvp_spec` 只描述 UI 骨架，
> 真实业务丰富度（多批次询价/多段航程/TCO 分组明细/报价单全文/状态机/成本占比图）由 `sim_spec` 承载，
> 否则必须手工补 `scenarioData.js` 与页面。
>
> **sim_spec 结构**：`meta` + `scenes[]`（每个场景一数据块）：
> - `inquiry`（多批次→多段航程 legs）
> - `tcoReport`（分组→费用项：金额/计费基准/来源/口径/置信度）
> - `quote`（复合报价文档）
> - `processData[]`（AI 步骤中间态）
> - `stateMachine`（状态机+异常分支）
> - `visual[]`（可视化需求：`segChart`/`routeMap`/`nestedGroup`/`documentBlock`/`stateMachine`/`processTimeline`）
>
> **编译**（在 mvp_spec 命令上追加 `--sim`）：
> ```bash
> python3 scripts/scaffold_mvp.py <mvp_spec.yaml> --case <case> --scenario <scenario> --sim <sim_spec.yaml>
> ```
> 脚手机会依据 `sim_spec.scenes` 生成 `src/data/scenarioData.js`（场景数据源）+ `src/components/SimVisuals.jsx`
> （可复用可视化组件库：segChart/routeMap/nestedGroup/documentBlock/stateMachine/processTimeline）。

### Step 1 · 解析输入
- **优先**：读取 AI Canvas YAML + To-be Journey YAML（同为 `examples/` 中已生成的场景）。
- **兜底**：用户仅提供自然语言场景描述时，先按 AI Canvas 十维结构推演画布，再进入 Step 2。

### Step 2 · 推演 mvp_spec.yaml（LLM 产物）
- 严格遵循 `references/mvp_prompts.md` 铁律（承接规则、元素类型白名单、主题推导表、防呆结构）。
- **产物保存位置**：输出到 `<客户案例目录>/<场景目录>/` 场景子目录，命名为 `[公司/业务名]-[场景名]-mvp-spec.yaml`（不是 Skill 的 `examples/`；`examples/` 仅存放演示样例）。

### Step 3 · 脚手架编译
```bash
# 在项目根目录（含 客户案例目录 的层级）执行：
python3 skills/prototype-generator/scripts/scaffold_mvp.py \
  skills/prototype-generator/examples/<标识>_mvp_spec.yaml \
  --case "<客户案例目录>" --scenario "<场景目录>"
```
- 产物位于 **`<客户案例目录>/<场景目录>/mvp-prototype/`**。
- 也可用 `--output <显式路径>` 覆盖；`--force` 覆盖已存在目录。

### Step 4 · 启动验证（必须执行）
```bash
cd "<客户案例目录>/<场景目录>/mvp-prototype"
npm install          # 一次性安装全部依赖
npm run dev          # 开发模式：API(:8080) + Vite 前端(:5173)
```
验证清单：
1. `curl http://localhost:8080/api/health` → `{"status":"ok",...}`
2. `curl -X POST http://localhost:8080/api/purchase/parse` → 返回 Mock AI 识别结果
3. 浏览器打开 `http://localhost:5173` → 逐页验证（工作台/上传/AI推荐/审批/下单）UI 与 AI 交互
4. 验证失败 → 定位修复后重新验证

### Step 5 · 交付
- 输出 `README.md`（含快速开始、架构图、接口清单）。
- 生产模式说明：`npm run build && npm start` 单端口 `:8080` 一体化运行。

---

## 页面元素模型（元素类型白名单）

| 元素 | AntD / Arco 组件 | 用途 |
|------|-----------------|------|
| `steps` | Steps / a-steps | To-be 旅程进度 |
| `uploadCard` | Upload.Dragger | 上传文件（承接 userInputs） |
| `aiResultCard` | Card + Table/描述 | AI 结果（承接 visibleData，支持 table/kv 两种渲染） |
| `table` | Table / a-table | 数据表格（状态列 Tag 着色） |
| `statRow` | Row + Statistic | 指标卡（承接 businessGains 量化指标） |
| `buttonRow` | Space + Button | 操作区（navigate / 触发 AI action） |
| `alert` | Alert / a-alert | 业务告警 |
| `timeline` | Timeline / a-timeline | 状态流转 |
| `chatPanel` | 模拟对话 + 推荐指令 chips | AI 对话（承接 aiInteraction.suggestions） |
| `formCard` | Form + Input/Select | 表单录入 |
| `tagRow` | Tag / a-tag | 标签 |

---

## 目录结构

```
prototype-generator/
├── SKILL.md                        # 本指南
├── references/
│   ├── mvp_prompts.md              # LLM 铁律（承接规则、元素白名单、主题推导表）
│   └── mvp_spec_schema.yaml        # mvp_spec 数据契约示例
├── templates/
│   ├── common/                     # 根 package.json / README / .gitignore
│   ├── server/                     # Express 一体化（index/config/routes/services）
│   ├── frontend_react/             # Vite+React+antd 基座
│   └── frontend_vue/               # Vite+Vue+arco 基座
├── scripts/
│   └── scaffold_mvp.py             # 脚手架编译引擎（--case/--scenario/--output/--force）
├── assets/_legacy/                 # 旧 Next.js 模板归档
└── examples/
    └── X电商订舱-智能订舱Agent-mvp-spec.yaml  # 演示：X 电商订舱智能订舱 Agent 场景（见 X电商订舱/）
```

---

## 与上下游 Skill 的关系

| 关系 | Skill | 说明 |
|------|-------|------|
| 上游输入 | `ai-canvas-generator` | AI 场景定义（Canvas YAML） |
| 上游输入 | `ai-product-journey-generator` | To-be 旅程设计（personas/scenarios/AI 交互细节） |
| 下游/协作 | `story-map-generator` | MVP 功能可进一步拆解为用户故事地图 |
| 调用方 | `mvp-prototype`（Subagent） | MVP 原型设计顾问，负责调度「To-be 旅程 → MVP 原型」全流程 |
