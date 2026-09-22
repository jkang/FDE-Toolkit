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
>   - `mvp_spec.yaml` 产物命名 `[公司/业务名]-[场景名]-mvp-spec.yaml`（例如：`ZX机车海外销售-售后理赔-mvp-spec.yaml`），**必须**与 MVP 应用同放于 `<案例>/<场景>/` 目录；
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
| ⑤ 主题配色 | 用户提供品牌色 → **映射到最接近的 antd/arco 标准色阶档位**（blue/geekblue/… 的 -6/-7）；否则按业务域映射 antd 标准色阶（见 `references/mvp_prompts.md`）。**语义色/中性色/尺度一律用组件库标准值，禁止自造未成体系 hex**（防「山寨感」） |
| ⑥ 输出目录 | `<客户案例目录>/<场景目录>/mvp-prototype/`（脚手架 `--case` / `--scenario` 指定） |
| ⑦ 启动验证 | 安装依赖 → 启动 → curl API 实测 + 浏览器打开前端验证 UI 与 AI 交互 |
| ⑧ 业务数据 & 过程仿真 | `--sim sim_spec.yaml`，生成场景数据源 + 可视化组件（segChart/routeMap/nestedGroup/documentBlock/stateMachine/processTimeline）。**SimVisuals 可视化组件当前仅 React 模板提供**（`templates/frontend_vue/` 下无 SimVisuals 源模板），选择 Vue 时 sim 的交互可视化不可自动注入（Vue 侧亦缺 `scenarioData` 源模板），须手工补 `scenarioData.js` 与页面 |
| ⑨ 静态部署兼容（Vercel） | 生成物自带 `vercel.json` + `src/api/client.js` 前端 Mock 兜底：纯静态托管（无 Node 后端）时 `POST /api` 会命中 `index.html` 返回 405，拦截器在生产构建下自动回退到与 `server/services/*` 同源的本地 Mock，页面照常演示（见 Step 6） |

---

## 工作流 SOP

### Step 0 · 需求澄清（必问）
1. **前端框架**：React 还是 Vue？
2. **配色**：是否有指定主色/强调色/Logo？（有则**映射到 antd/arco 标准色阶**后再用；无则按业务域映射 antd 标准色阶。语义/中性色一律用组件库标准值，禁止自造 hex）
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
> 脚手架会依据 `sim_spec.scenes` 生成 `src/data/scenarioData.js`（场景数据源）+ `src/components/SimVisuals.jsx`
> （可复用可视化组件库：segChart/routeMap/nestedGroup/documentBlock/stateMachine/processTimeline；此两文件当前仅在 React 端自动生成，见下方框架限制）。
>
> **框架限制**：SimVisuals 可视化组件当前仅 React 模板提供（`templates/frontend_vue/` 下无 SimVisuals 源模板）。选择 Vue 时 sim 的交互可视化降级为仅注入 `scenarioData.js`；且当前 `frontend_vue/` 尚无 `scenarioData.js.j2` 源模板，选 Vue + `--sim` 时脚手架会因缺模板报错，需手工补 `scenarioData.js` 与页面（`--sim` 当前仅在 React 端可端到端编译）。

### Step 1 · 解析输入
- **优先**：读取该场景已生成的 AI Canvas YAML + To-be Journey YAML（位于 `<客户案例目录>/<场景目录>/` 场景目录下；`examples/` 内的仅为演示样例，客户产物一律不在 `examples/` 读写）。
- **兜底**：用户仅提供自然语言场景描述时，先按 AI Canvas 十维结构推演画布，再进入 Step 2。

### Step 2 · 推演 mvp_spec.yaml（LLM 产物）
- 严格遵循 `references/mvp_prompts.md` 铁律（承接规则、**Mock 数据丰富度与业务贴合铁律**、元素类型白名单、主题推导表、防呆结构）。
- **产物保存位置**：输出到 `<客户案例目录>/<场景目录>/` 场景子目录，命名为 `[公司/业务名]-[场景名]-mvp-spec.yaml`（不是 Skill 的 `examples/`；`examples/` 仅存放演示样例）。

#### Step 2.1 · Mock 数据深化（必做，别跳过）
mvp_spec 里**本来就有 mock data 这一步**：`dataModels.mockData` + `aiMocks.response` + `businessMocks.response`（需要更深业务数据再补 `sim_spec`）。生成时按下述清单自查，**不达标就补**：

- [ ] **主数据先行**：先定一套业务主数据（客户 / 供应商 / 物料 / 组织 / 仓库 / 线路 / 单证…），命名、编码、行业属性贴合客户业务；后续所有 mock 只复用这套主数据。
- [ ] **核心对象字段 ≥ 8**：主键 / 名称 / 状态 / 金额或数量+单位 / 日期 / 责任人 / **关联键** / 备注，`title` 用客户业务术语。
- [ ] **mockData ≥ 8 条**（复杂场景 ≥ 12），覆盖 正常 / 进行中 / 异常 / 边界，至少 1~2 条异常或边界样本。
- [ ] **跨对象关联一致**：同一实体在 `dataModels` / `aiMocks` / `businessMocks` 中编码·名称·口径完全一致，可用一条主链（客户→订单→…→凭证）交叉核对。
- [ ] **列表型响应 ≥ 5 条**，字段与页面 `columns` 对齐，状态值命中 `tag` 映射。
- [ ] **表单（formCard）带真实默认值**（`value`），不要空占位。
- [ ] 无 `xxx` / `TODO` / `A公司` / 玩具数值。

> 数据单薄会直接拉低原型可信度。`references/mvp_spec_schema.yaml` 给出了「主数据 + 核心对象 + 列表响应 + 表单默认值」的完整范例。

### Step 3 · 脚手架编译
```bash
# 在项目根目录（含 客户案例目录 的层级）执行；输入取 Step 2 已写入客户场景目录的真实 mvp_spec 产物
python3 skills/prototype-generator/scripts/scaffold_mvp.py \
  "<客户案例目录>/<场景目录>/<公司/业务名>-<场景名>-mvp-spec.yaml" \
  --case "<客户案例目录>" --scenario "<场景目录>"
```
> 注：`skills/prototype-generator/examples/` 仅含演示样例（`X电商订舱-智能订舱Agent-mvp-spec.yaml`），可用于跑通脚手架流程，客户产物不可存于其中。
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
2. `curl` 实测本场景 `mvp_spec.yaml` 的 `apiRoutes` 中 AI 类端点（如 `target: "ai:<方法>"` 对应的 `method + path`，例如 `curl -X POST http://localhost:8080/api/<本场景AI端点>`）→ 返回 Mock AI 结果
3. 浏览器打开 `http://localhost:5173` → 逐页验证 `mvp_spec.pages` 中各页 UI 与 AI 交互（上传 → AI 处理 → 结果展示 → 相关业务动作）
4. 验证失败 → 定位修复后重新验证

### Step 5 · 交付
- 输出 `README.md`（含快速开始、架构图、接口清单）。
- 生产模式说明：`npm run build && npm start` 单端口 `:8080` 一体化运行。

### Step 6 · 静态部署兼容（Vercel / 纯静态托管，必做）
生成物默认是「Express 一体化」：`/api` 由 Node 提供。**部署到 Vercel 等纯静态托管（只托管 `dist/`、不运行 Node）时**，`POST /api/*` 会被 SPA 兜底重写命中静态 `index.html`，而 Vercel 对静态文件的非 GET 请求返回 **405 Method Not Allowed** → 页面报「调用失败」。这不是代码 bug，而是静态站点没有后端；`localhost` 因有 Express 而正常。

**脚手架已内置兜底（无需手工补）**：
- `templates/common/vercel.json.j2` → 生成 `vercel.json`（`buildCommand` / `outputDirectory: dist` / SPA rewrites）。
- `templates/frontend_react|vue/src/api/client.js.j2` → `src/api/client.js` 生成时：
  - 引入与后端**同源**的 `server/services/*`，按 `apiRoutes` 的 `client_path` 建 `MOCK` 映射（含 `compose` 组合路由）；
  - axios `response` 拦截器在**生产构建**（`import.meta.env.DEV === false`）下，请求失败即回退本地 Mock，页面照常演示（开发模式仍抛错，便于排查后端）；
  - 导出 `errMsg(e)`：页面 catch 一律用它拼接错误文案，**禁止**写 `String(e?.response?.data?.error || e)`（当 data 为对象时会显示 `[object Object]`）。

**部署 Vercel 步骤**：项目根目录设为 `<案例>/<场景>/mvp-prototype/`，Framework 选 Vite（或直接采用 `vercel.json`），无需配置后端。
> 注意：Network 面板仍会看到一条 `POST /api → 405`（确实没有后端），已被前端静默兜底，不影响功能与数据。

**验证（必须）**：`npm run build` 后，用一个「非 GET 请求返回 405」的静态服务器托管 `dist/`，浏览器打开页面点主要操作按钮 → 应无错误提示、数据正常渲染；同时 `npm start` 下真实 API 亦正常。

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
│   ├── mvp_spec_schema.yaml        # mvp_spec 数据契约示例
│   ├── sim_spec_schema.yaml        # sim_spec（业务数据 & 过程仿真）数据契约示例
│   └── sim_prompts.md              # sim_spec 生成提示词与铁律
├── templates/
│   ├── common/                     # 根 package.json / README / .gitignore / vercel.json
│   ├── server/                     # Express 一体化（index/config/routes/services）
│   ├── frontend_react/             # Vite+React+antd 基座
│   │   ├── src/data/scenarioData.js.j2           # sim 场景数据源模板（react）
│   │   └── src/components/SimVisuals.jsx.j2      # sim 可视化组件（仅 react 提供）
│   └── frontend_vue/               # Vite+Vue+arco 基座（无 SimVisuals / scenarioData 源模板）
├── scripts/
│   └── scaffold_mvp.py             # 脚手架编译引擎（--case/--scenario/--output/--force/--sim）
├── assets/_legacy/                 # 旧 Next.js 模板归档
└── examples/
    └── X电商订舱-智能订舱Agent-mvp-spec.yaml  # 演示样例：X 电商订舱智能订舱 Agent 场景（见 X电商订舱/）
```

---

## 与上下游 Skill 的关系

| 关系 | Skill | 说明 |
|------|-------|------|
| 上游输入 | `ai-canvas-generator` | AI 场景定义（Canvas YAML） |
| 上游输入 | `ai-product-journey-generator` | To-be 旅程设计（personas/scenarios/AI 交互细节） |
| 下游/协作 | `story-map-generator` | MVP 功能可进一步拆解为用户故事地图 |
| 调用方 | `mvp-prototype`（Subagent） | MVP 原型设计顾问，负责调度「To-be 旅程 → MVP 原型」全流程 |

---

## 输出呈现铁律（通用 · 强制）

> 产出是给**客户 / 业务方**看的最终报告，不是过程记录。以下六条**违反即返工**。

1. **语言**：一律用**严谨、克制的中文业务咨询语言**——有一说一；**有观点必给依据**（数据 / 规则 / 来源 / 口径）。禁止 AI 味大词与空话堆砌（「赋能、闭环、抓手、深度融合、全方位、数智化」等无实指表述）。
2. **禁止多余英文备注**：中文标题 / 小节后**不得**追加英文装饰（如「业务模式全景 BUSINESS MODEL LANDSCAPE」）。系统名 / 字段名 / 标准缩写（SAP、IF005、DOS、SKU、SLA）可保留；不造装饰性英文。
3. **只输出结论与依据**：**禁止**把过程讨论写进正文——与用户的对话 / 反馈、修订说明、`【不依据原始 idea】` 这类过程标注、跨行业类比的过程推理（如「与快消品的渠道逻辑不同」）、「待确认 / 此处待补 / 讨论点」等制作层信息，一律不进正文。
4. **口径与边界**：不确定的推断标 `[推断]` 并给依据；不臆造数据；假设与阈值标注「领域专家假设值 · 待访谈回填」。
5. **交付前自检**：逐段问「读者能否据此做决策 / 这是否属于我们内部讨论」——不能决策或属内部讨论的内容，删除或移出正文。
6. **精炼优先**：**只保留必要段落**——删除一切辅助描述、方法论 / 流程 / 制作层说明、示例性长文与重复表述；模板用**最小占位符**，不得用示例内容充数。
