# HTML 单文件原型 · 生成补充铁律（技术栈 = html）

> 本文件是 `mvp_prompts.md`（通用设计规格铁律）的**技术栈补充**。当用户在 Step 0 选择「HTML 原型」时，
> **先完整遵守 `mvp_prompts.md` 的全部铁律**（承接规则、Mock 数据丰富度、元素白名单、配色铁律），
> 再叠加本文件的 HTML 落地约束。`mvp_spec.yaml` 的数据契约与字段含义**完全一致**，不新增结构。

---

## 一、必须先向用户确认技术栈

生成前**必问**用户选择哪条技术栈路径（Step 0），并据其组织提示词与编译方式：

| 选择 | 提示词 | 编译 | 产物 |
|------|--------|------|------|
| **HTML 原型** | `mvp_prompts.md` + 本文件 | `scripts/build_html_prototype.py` | `<案例>/<场景>/<公司>-<场景>-MVP原型.html`（单文件） |
| React | `mvp_prompts.md` | `scripts/scaffold_mvp.py` | `<案例>/<场景>/mvp-prototype/`（Vite+React+antd+Express） |
| Vue | `mvp_prompts.md` | `scripts/scaffold_mvp.py` | `<案例>/<场景>/mvp-prototype/`（Vite+Vue+arco+Express） |

**未选择不得擅自默认**：三条路径产物完全不同，须由用户拍板后再产出。

---

## 二、mvp_spec 的 HTML 差异（仅两处）

1. `meta.frontend: "html"`（必填）；`meta.designSystem` 填 `"html"`（占位，渲染器不消费）。
2. `meta.ports` 对单文件 HTML 无意义，可保留默认 `{ dev: 5173, api: 8080 }`，渲染器不消费。

**其余字段一律不变**：`personas` / `scenarios` / `dataModels` / `pages`（含 `sections` 全部元素类型）/
`aiMocks` / `businessMocks` / `apiRoutes` 的写法、元素白名单、Mock 数据铁律与 React/Vue 完全一致。

> 即：**同一场景在三条技术栈下共用同一份 `mvp_spec.yaml`**，只需改 `frontend` 字段即可切换编译目标。

---

## 三、单文件 HTML 结构铁律（渲染器已内置，提示词侧需保证数据可用）

1. **一个 `.html` 文件**：内联全部 CSS / JS / Mock 数据，**无外链、无构建、无后端**，双击即用、离线可演示。
2. **页面切换**：`pages[].route`（如 `/dashboard`）作为 hash 路由（`#/dashboard`），左侧导航切换 `section` 显隐，不刷新页面。
3. **AI / 业务交互**：`pages[].actions[].name` ↔ `apiRoutes[].name` ↔ `aiMocks[]/businessMocks[].name` **必须同名对齐**；
   点击动作按钮 → 命中对应 Mock → 模拟 `latency` 延迟 → 渲染结果。名称不对齐会导致按钮调用不到数据。
4. **结果渲染**：`aiResultCard.render` 为 `table` 时，`columns[].key` 必须与对应 Mock `response.items[]` 的字段一致；
   状态列用 `tag` 映射，取值必须命中（否则退化为 default 灰）。为 `kv` 时直接键值展示。
5. **列表型 Mock `response.items` ≥ 5 条**，字段与页面 `columns` 对齐（同 `mvp_prompts.md` 铁律）。
6. **不引入外部依赖**：不使用 CDN（ECharts / Tailwind / 组件库）。可视化需求当前以**表格 / 指标卡 / 时间线 / 标签**呈现；
   `sim_spec` 的 ECharts 类可视化（segChart/routeMap/stateMachine 等）为**后续增强**，HTML 基础版不渲染。

---

## 四、视觉规范（沿用 antd 标准，禁止自造 hex）

- 布局：左侧深色导航（`#001529`）+ 顶栏 + 内容区（`#f5f5f5`），与 React/Vue 工作台一致。
- 主色：取 `meta.theme.primary`（**必须为 antd 标准色阶 -6/-7 档**）；强调色取 `meta.theme.accent`。
- 语义色固定：success `#52c41a` / warning `#faad14` / error `#ff4d4f` / info `#1677ff`；中性色用 antd 标准（text `#1f1f1f` / border `#d9d9d9`）。
- 组件视觉：卡片白底圆角 + 细边框；表格头部浅灰；Tag 用 antd 语义/标准色；上传区虚线框。

---

## 五、交付前自检（HTML 路径）

- [ ] `meta.frontend == "html"`，且与用户所选技术栈一致。
- [ ] `pages[].actions[].name` 全部能在 `apiRoutes` / `aiMocks` / `businessMocks` 中找到同名目标。
- [ ] 每个 `aiResultCard.render == "table"` 的 `columns[].key` 均能在对应 Mock `response.items` 命中。
- [ ] Mock 数据满足 `mvp_prompts.md` 第二节铁律（字段 ≥8、条数 ≥8、列表 ≥5、含异常/边界）。
- [ ] 无占位符（`xxx` / `TODO` / `A公司`）与自造 hex。
