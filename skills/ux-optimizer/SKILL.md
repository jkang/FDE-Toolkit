---
name: ux-optimizer
description: |
  面向 MVP-prototype 产品级 UI 的 UX 优化器 —— 根据「企业品牌基因 × 业务主题气质」，
  为该客户/场景量身定制一套独立的产品设计系统（Design Language），
  并将定制 token + 组件规范以无侵入覆盖层方式注入 mvp-prototype 工程，
  让原型从"能用"升级为"专业、可信、企业级"。

  Triggers when user mentions:
  - "优化 UI"
  - "UX 优化"
  - "原型设计系统"
  - "定制产品设计"
  - "让原型更专业"
  - "UX-optimizer"
  - "优化原型视觉"
  - "根据企业品牌设计"
  - "业务主题设计"
author: KK
---

# UX-Optimizer (MVP 原型 UX 优化器)

承接 `prototype-generator` 产出的可运行 MVP-prototype，以**资深产品设计师 + 设计系统架构师**视角，
为**该客户 + 该场景**量身定制一套**产品级 UI 设计系统**，并注入到原型工程中。

```
mvp_spec.yaml + mvp-prototype/ (已运行)
        +
企业品牌画像 × 业务主题气质
        │
        ▼
【推导】定制设计语言 8 维 (Design Language)
        │
        ▼
【产出】ux-audit.yaml + UX设计报告.html   (双重输出)
        │
        ▼
【注入】apply_ux_enhance.py → mvp-prototype (tokens.js + theme.override.css)
        │
        ▼
【验证】重启 → 浏览器逐页比对还原度 + 截图
```

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉定位）
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: `ux-audit.yaml`（设计决策、设计语言 8 维、组件规范、差异清单），用于存档与工程注入。
> 2. **交互式 HTML**: `[公司]-[场景]-UX设计报告.html`（企业品牌气质卡、定制设计系统总览、before/after 组件对照、六维专业雷达图、交付清单）。
>
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 属于**具体 AI 场景**的产物（UX 优化报告），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范）。
> - **文件命名**: `[公司/业务名]-[场景名]-UX设计报告.html`（例如：`张雪机车海外销售-售后理赔-UX设计报告.html`）；YAML 同理 `[公司/业务名]-[场景名]-ux-audit.yaml`。
> - **注入目标**: 定制设计系统覆盖层注入到 `<公司/业务名>/<场景名>/mvp-prototype/`（tokens.js / theme.override.css），不改原型业务逻辑。
>
> **视觉设计标准 (Visual Design Standard)**:
> - **特别声明**：本 Skill 服务于**产品级 MVP-prototype**，其视觉遵循**为该客户/场景定制的产品设计系统**，**与 `design.md`（discovery 报告类规范）完全解耦**。
> - 定制设计系统由 `references/brand_business_matrix.md`（企业品牌 × 业务主题）推导。
> - 若同场景同时存在 discovery 报告产物（如 To-be 旅程、服务蓝图），二者样式**可不同**：报告走 design.md，MVP 走定制系统。

---

## 核心能力

| 需求 | 实现 |
|------|------|
| ① 企业品牌 × 业务主题 → 定制设计语言 | `references/brand_business_matrix.md`（8 维推导，预置 4 套产品 UI 模式） |
| ② Figma 专业体验设计技巧 | `references/figma_expertise.md`（布局/层级/色彩/状态/微交互/可访问 6 维） |
| ③ 11 类组件专业化 | `references/component_specs.md`（每类视觉+交互+六态） |
| ④ WCAG 对比度护栏 | `references/contrast_guard.md`（标准语义色对 + `scripts/contrast_check.py` 校验） |
| ⑤ 设计 token 数据契约 | `references/design_token_schema.yaml`（色彩/字体/间距/圆角/阴影/状态/布局/响应式） |
| ⑥ 无侵入注入工程 | `scripts/apply_ux_enhance.py`（覆盖层 tokens.js / theme.override.css + 对比度护栏 CSS） |
| ⑦ 双重输出 | ux-audit.yaml + UX设计报告.html |

---

## 工作流 SOP

### Step 0 · 输入解析
- **优先读取**：`mvp_spec.yaml` + `mvp-prototype/` 工程目录（确认已存在或先由 prototype-generator 生成）。
- **企业品牌资料**（三层兜底）：
  1. 若已有 discovery 产物（`business-research` / `company-ai-maturity-research`），从中**提取**企业品牌信息（Logo/主色/调性）。
  2. 否则向用户要 **1 句**品牌主色/调性描述（如"我们是深蓝科技感、面向制造业"）。
  3. 都不具备 → 按 `businessDomain` 推断。
- **业务主题**：取 Canvas/To-be Journey 的 `businessDomain` 与 `scenario`（如售后理赔/海外销售/订舱）。

### Step 1 · 企业品牌画像（4 问定人格）
按 `brand_business_matrix.md` 第二章节，确定：品牌主色/调性、用户群体、场景严肃度、品牌成熟度。

### Step 2 · 业务主题气质（定功能气质）
按 `brand_business_matrix.md` 第三章节，确定：业务域气质 + 具体场景气质（一阶修正）。

### Step 3 · 融合推导定制设计语言（8 维）
按 `brand_business_matrix.md` 第四、五章节：
1. 从**预置 4 套产品 UI 模式**（Modern SaaS 工作台 / 金融数据看板 / 医疗引导式 / 消费感大屏）选起点。
2. **叠加品牌增量**（换主色、调圆角/间距/密度/动效/布局微调），确保"这个企业的产品"。
3. 产出 8 维具体值（色彩/字体/间距/圆角阴影/组件/状态/布局/微交互）。

### Step 4 · 组件级专业化
按 `component_specs.md`，对 11 类元素（steps/uploadCard/aiResultCard/table/statRow/buttonRow/alert/timeline/chatPanel/formCard/tagRow）逐一给出升级规范。

### Step 5 · 状态 & 布局 & 微交互 & 响应式
- 六态（hover/focus/empty/loading/error/disabled）完备。
- 布局模式（side/top/hero/guide）按场景选型。
- 统一 `0.15s ease-out` 过渡、克制动效、断点 375/768/1024/1440、cursor-pointer。

### Step 6 · 双重输出
- **UX-audit.yaml**：按 `design_token_schema.yaml` 产出结构化设计决策。
- **UX设计报告.html**：按 `templates/ux_design_report.html.j2` 渲染（定制企业风格）。

### Step 7 · 注入 mvp-prototype（覆盖层）
```bash
python3 <repo>/skills/ux-optimizer/scripts/apply_ux_enhance.py \
  "<公司/业务名>/<场景>/<公司>-<场景>-ux-audit.yaml" \
  --target "<公司/业务名>/<场景>/mvp-prototype"
```
- 生成 `src/theme.design.js`（或指定）到原型 → `tokens.js` 与 `theme.override.css` 覆盖层。
- **保证无侵入**：不改原型业务逻辑/接口/组件内容，仅注入设计令牌与样式覆盖。

### Step 8 · 验证（必须）
```bash
cd "<公司/业务名>/<场景>/mvp-prototype"
npm run dev
```
1. 浏览器打开前端 → 逐页检查**定制设计系统还原度**。
2. 关键交互验证：上传 → AI 结果 → 表格 → 对话（loaded 状态/空态/错误态）。
3. 用 `webapp-testing` 或 Chrome DevTools 截图，与优化前做 **before/after 对照**。
4. 验证失败 → 修复后重验。

### Step 9 · 按「常见不专业 UX 问题清单」逐项审计（必须）
- 对照 `references/ux_checklist.md` 的 10 大类（对比度 / 可访问性 / 排版层级 / 布局 / 组件状态 / 表单 / 动效 / 文案 / 响应式 / 注入验证）**逐项勾选**。
- 任一不满足 → **定位并修复**后重新注入/重验；无法满足的项记录并降级处理，不得静默跳过（最低标准：对比度 ≥4.5:1、焦点可见、无低对比反模式、六态完备）。
- 审计结论写入交付摘要（哪些项已修复、哪些项豁免）。

---

## 与上下游 Skill 的关系

| 关系 | Skill | 说明 |
|------|-------|------|
| 上游输入 | `prototype-generator` | 生成的可运行 MVP-prototype + mvp_spec |
| 上游输入 | `ai-product-journey-generator` / `ai-canvas-generator` | 业务域/场景/角色信息 |
| 上游参考 | `company-ai-maturity-research` / `business-research` | 提取企业品牌信息 |
| 职责边界 | 本 Skill | 只做"产品级 UI 定制设计 + 无侵入注入"，不改业务逻辑；与 design.md 解耦 |
| 调用方 | `mvp-prototype`（Subagent） | MVP 原型设计顾问，调度「To-be 旅程 → MVP 原型 → UX 定制优化」 |

---

## 打包内容（本 Skill 目录）
```
ux-optimizer/
├── SKILL.md
├── references/
│   ├── brand_business_matrix.md   # 企业品牌×业务主题 → 定制设计语言矩阵
│   ├── figma_expertise.md         # Figma 专业技巧 6 维
│   ├── contrast_guard.md          # ★ WCAG 对比度护栏（标准语义色对）
│   ├── design_token_schema.yaml   # 设计 token 数据契约
│   ├── component_specs.md         # 11 类组件专业化 + 对比度护栏
│   └── ux_checklist.md            # Pre-Delivery 审查清单（含对比度验收）
├── scripts/
│   ├── apply_ux_enhance.py        # 注入覆盖层到 mvp-prototype（含护栏 CSS）
│   └── contrast_check.py          # ★ WCAG 对比度校验工具
├── templates/
│   ├── ux_design_report.html.j2   # UX 设计报告模板
│   └── enhance_patch/             # tokens.js.j2 / theme.override.css.j2
└── examples/
    └── sample_ux_audit.yaml
```
