---
name: discovery-agent
description: |
  全链路 AI 场景探索编排器（Discovery Agent）。接受客户名称、行业领域和相关文档资料，
  按照 AI4PM 标准咨询流程，顺序调度从企业北极星战略分析到里程碑计划的完整 Skill 链，
  最终用 unified-report-dashboard 汇总生成完整的交付 Deck。

  Triggers when user mentions:
  - "discovery agent"
  - "全链路分析"
  - "端到端 AI 场景规划"
  - "完整探索流程"
  - "start discovery"
  - "启动探索"
author: KK
---

# Discovery Agent — 全链路 AI 场景探索编排器

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**：
> 本 Agent 编排的每一个子 Skill 都必须**同时**输出：
> 1. **结构化 YAML**：用于跨阶段数据传递与存档。
> 2. **交互式 HTML**：供最终用户直观审查与演示。
>
> **输出路径规范**：产物按两层目录组织——公司/业务级产物存放于 `[客户名称]/` 目录，场景级产物（属于具体 AI 场景的）必须放入 `[客户名称]/[场景名]/` 子目录（详见 `agent.md` 第 2 节）。文件命名遵循
> `[客户名称]-[场景名]-[阶段名称].html` / `.yaml` 格式。
>
> **视觉规范**：参考 `skills/design.md`，默认浅色模式，内容区宽度 100%（撑满容器）。
> unified-report-dashboard 使用深色模式 (`#0a0e27`)。

---

## 总体编排流程

```
输入 (客户 + 领域 + 资料)
  │
  ├─ Phase A: 客户洞察与业务梳理
  │     Step 1 → NSM 北极星战略全景分析
  │     Step 2 → AI 成熟度评估
  │     Step 3 → OSM 目标度量地图
  │     Step 4 → 业务流程深度分析
  │     Step 5 → 体验旅程图
  │     Step 6 → 服务蓝图
  │
  ├─ Phase B: AI 机会挖掘与优先级评估
  │     Step 7 → AI 机会场景地图
  │     Step 8 → AI 场景画布 (Top 3 场景)
  │     Step 9 → CKD 上下文知识数据映射
  │     Step 10 → AI 场景优先级矩阵
  │
  ├─ Phase C: 战略规划与里程碑
  │     Step 11 → 产品演进路线图
  │     Step 12 → 里程碑计划
  │
  └─ Phase D: 汇总交付
        Step 13 → unified-report-dashboard 生成 Deck
```

---

## Step 0：输入收集与环境预检

### 0.1 收集必要输入

向用户确认以下信息（如已在对话中提供，直接采用，无需重复询问）：

| 参数 | 必填 | 说明 |
|------|------|------|
| 客户名称 | ✅ | 目标企业/组织名称，用于命名所有产物 |
| 业务领域 | ✅ | 如：供应链、客服、营销、医疗、金融等 |
| 分析范围 | 否 | 默认执行全部 12 步；可指定仅执行某 Phase |
| 参考文档/资料 | 否 | 用户上传或粘贴的背景材料（年报、产品文档等） |
| 竞品/对标企业 | 否 | 用于 SWOT 分析的参照系 |
| 额外关注点 | 否 | 用户特别关心的分析维度 |

### 0.2 工具可用性预检

- **有搜索能力**：静默进入全自动流程，不打扰用户。
- **无搜索能力**：告知用户并请求提供背景文档，继续执行。

### 0.3 创建输出目录与进度追踪表

执行以下两步初始化：
1. 在当前工作目录下创建 `[客户名称]/` 子目录和 `[客户名称]/phase_cache/` 子目录，所有产物和缓存写入其中。
2. 创建 `[客户名称]/discovery_index.md` 作为阶段进度追踪表，**必须完整写入以下全部 16 行**（含 NSM 三个子步骤展开）：

```markdown
# [客户名称] Discovery 进度追踪

| 步骤 | 名称 | 状态 | 产物文件 |
|------|------|------|----------|
| Step 1-a | NSM · 业务现状调研 | ⏳ 待执行 | - |
| Step 1-b | NSM · SWOT 分析 | ⏳ 待执行 | - |
| Step 1-c | NSM · 战略推导 | ⏳ 待执行 | [客户名称]-北极星指标及战略推导.html |
| Step 2 | AI 成熟度评估 | ⏳ 待执行 | [客户名称]-AI成熟度评估.html |
| Step 3 | OSM 目标度量地图 | ⏳ 待执行 | [客户名称]-OSM目标度量地图.html |
| Step 4 | 业务流程深度分析 | ⏳ 待执行 | [客户名称]-业务流程深度分析.html |
| Step 5 | 体验旅程图 | ⏳ 待执行 | [客户名称]-体验旅程图.html |
| Step 6 | 服务蓝图 | ⏳ 待执行 | [客户名称]-服务蓝图.html |
| Step 7 | AI 机会场景地图 | ⏳ 待执行 | [客户名称]-AI机会场景地图.html |
| Step 8 | AI 场景画布 (Top 3) | ⏳ 待执行 | [客户名称]-AI画布-*.html |
| Step 9 | CKD 数据映射 | ⏳ 待执行 | [客户名称]-CKD数据映射.html |
| Step 10 | AI 场景优先级矩阵 | ⏳ 待执行 | [客户名称]-AI场景优先级矩阵.html |
| Step 11 | 产品演进路线图 | ⏳ 待执行 | [客户名称]-产品演进路线图.html |
| Step 12 | 里程碑计划 | ⏳ 待执行 | [客户名称]-里程碑计划.html |
| Step 13 | 统一报告仪表盘 | ⏳ 待执行 | [客户名称]-统一报告仪表盘.html |
```

每完成一个步骤，立即将对应行的状态改为 `✅ 完成` 并填入实际产物文件名。

---

## Phase A：客户洞察与业务梳理

### Step 1：NSM 北极星战略全景分析

**读取并遵循 `nsm-analysis/SKILL.md` 的完整指令。**

- 传入：客户名称、业务领域、竞品列表、参考文档
- 调度内部微技能：business-research → swot-analysis → strategy-derivation
- 产出：
  - `[客户名称]/[客户名称]-北极星指标及战略推导.yaml`
  - `[客户名称]/[客户名称]-北极星指标及战略推导.html`
- **Checkpoint**：将核心战略摘要写入 `phase_cache/p1_nsm.md`，供后续步骤引用。

---

### Step 2：AI 成熟度评估与战略调研

**读取并遵循 `company-ai-maturity-research/SKILL.md` 的完整指令。**

> **避免重复调研**：NSM（Step 1）已完成企业基本面与行业背景调研，Step 2 **直接复用** `phase_cache/p1_nsm.md` 中的企业背景信息，仅在 AI 能力评估维度（数据基础、算法成熟度、组织 AI 文化等）做增量调研，不再重复搜索企业基础信息。

- 传入：客户名称、业务领域、Step 1 企业背景摘要（从 `phase_cache/p1_nsm.md` 读取）
- 产出：
  - `[客户名称]/[客户名称]-AI成熟度评估.yaml`
  - `[客户名称]/[客户名称]-AI成熟度评估.html`
- **Checkpoint**：将 AI 成熟度分级与关键 Gap 写入 `phase_cache/p2_maturity.md`。

---

### Step 3：OSM 目标度量地图

**读取并遵循 `osm-map-generator/SKILL.md` 的完整指令。**

- 传入：客户名称、北极星指标（来自 `phase_cache/p1_nsm.md`）
- 将战略目标拆解为 Objectives → Strategies → Metrics 三层结构
- 产出：
  - `[客户名称]/[客户名称]-OSM目标度量地图.yaml`
  - `[客户名称]/[客户名称]-OSM目标度量地图.html`
- **Checkpoint**：将 Objective 列表写入 `phase_cache/p3_osm.md`。

---

### Step 4：业务流程深度分析

**读取并遵循 `business-process-deep-analyzer/SKILL.md` 的完整指令。**

- 传入：客户名称、业务领域、参考文档
- 产出 L1/L2 级流程分析、业务分型、核心痛点
- 产出：
  - `[客户名称]/[客户名称]-业务流程深度分析.yaml`
  - `[客户名称]/[客户名称]-业务流程深度分析.html`
- **Checkpoint**：将 L1 流程节点与核心痛点写入 `phase_cache/p4_process.md`。

---

### Step 5：体验旅程图

**读取并遵循 `journey-map-generator/SKILL.md` 的完整指令。**

- 传入：客户名称、业务领域、主要用户角色与核心流程节点（从 `phase_cache/p4_process.md` 读取）
- 产出：
  - `[客户名称]/[客户名称]-体验旅程图.yaml`
  - `[客户名称]/[客户名称]-体验旅程图.html`
- **Checkpoint**：将旅程图的阶段列表、关键触点与情感低谷节点写入 `phase_cache/p5_journey.md`，供 Step 6 使用。

---

### Step 6：服务蓝图

**读取并遵循 `blueprint-map-generator/SKILL.md` 的完整指令。**

- 传入：客户名称、业务领域、体验旅程图阶段与触点（`phase_cache/p5_journey.md`）、后台流程与系统（`phase_cache/p4_process.md`）
- 产出：
  - `[客户名称]/[客户名称]-服务蓝图.yaml`
  - `[客户名称]/[客户名称]-服务蓝图.html`
- **Phase A Checkpoint**：Phase A 全部完成。向用户展示已生成的 6 个报告文件列表，并询问是否继续执行 Phase B，或暂停供用户审阅。

---

## Phase B：AI 机会挖掘与优先级评估

### Step 7：AI 机会场景地图

**读取并遵循 `ai-opportunity-map-generator/SKILL.md` 的完整指令。**

- 传入：客户名称、业务领域、L1/L2 流程与核心痛点（`phase_cache/p4_process.md`）
- 产出：
  - `[客户名称]/[客户名称]-AI机会场景地图.yaml`
  - `[客户名称]/[客户名称]-AI机会场景地图.html`
- **Checkpoint**：将识别出的 AI 场景列表（含优先级标注）写入 `phase_cache/p7_opportunities.md`。

---

### Step 8：AI 场景画布（Top 3 场景）

**读取并遵循 `ai-canvas-generator/SKILL.md` 的完整指令。**

- 从 `phase_cache/p7_opportunities.md` 取优先级最高的 **Top 3** AI 场景
- 对每个场景分别生成一份 AI Canvas（10 维画布）
- 产出（共 3 组）：
  - `[客户名称]/[客户名称]-AI画布-[场景名].yaml`
  - `[客户名称]/[客户名称]-AI画布-[场景名].html`
- **Checkpoint**：将 3 个场景的**精确名称**（与文件名中使用的名称完全一致）写入 `phase_cache/p8_canvas.md`，格式如下，供 Step 13 构建 dashboard 导航时引用：

```markdown
# Canvas 场景文件列表
scene_1: 场景A名称
scene_2: 场景B名称
scene_3: 场景C名称
```

---

### Step 9：CKD 上下文知识数据映射

**读取并遵循 `context-knowledge-data-analyzer/SKILL.md` 的完整指令。**

- 传入：Top 3 AI 场景的 Workflow 描述（来自 Step 8 的 YAML）
- 梳理每个 AI Workflow 步骤所需的 Context / Knowledge / Data
- 产出：
  - `[客户名称]/[客户名称]-CKD数据映射.yaml`
  - `[客户名称]/[客户名称]-CKD数据映射.html`

---

### Step 10：AI 场景优先级矩阵

**读取并遵循 `ai-scenario-matrix-generator/SKILL.md` 的完整指令。**

- 传入：所有 AI 场景列表（`phase_cache/p7_opportunities.md`）
- 基于收益 × 可行性维度，生成 5×5 优先级矩阵
- 产出：
  - `[客户名称]/[客户名称]-AI场景优先级矩阵.yaml`
  - `[客户名称]/[客户名称]-AI场景优先级矩阵.html`
- **Checkpoint**：将矩阵中 P0 和 P1 级别的场景列表写入 `phase_cache/p10_matrix.md`，供 Step 11 路线图使用：

```markdown
# 优先级矩阵结论
P0_scenes:
  - 场景名A
P1_scenes:
  - 场景名B
  - 场景名C
```

- **Phase B Checkpoint**：Phase B 全部完成。向用户展示已生成的 4 个报告，并询问是否继续 Phase C。

---

## Phase C：战略规划与里程碑

### Step 11：产品演进路线图

**读取并遵循 `roadmap-generator/SKILL.md` 的完整指令。**

- 传入：客户名称、北极星目标（`phase_cache/p1_nsm.md`）、P0/P1 场景列表（`phase_cache/p10_matrix.md`）
- 将 P0/P1 场景映射为路线图各阶段的核心举措
- 产出：
  - `[客户名称]/[客户名称]-产品演进路线图.yaml`
  - `[客户名称]/[客户名称]-产品演进路线图.html`
- **Checkpoint**：将路线图阶段名称与关键举措写入 `phase_cache/p11_roadmap.md`，供 Step 12 使用。

---

### Step 12：里程碑计划

**读取并遵循 `milestone-plan-generator/SKILL.md` 的完整指令。**

- 传入：客户名称、路线图阶段（`phase_cache/p11_roadmap.md`）
- 将路线图拆解为带泳道和时间轴的里程碑
- 产出：
  - `[客户名称]/[客户名称]-里程碑计划.yaml`
  - `[客户名称]/[客户名称]-里程碑计划.html`
- **Phase C Checkpoint**：Phase C 全部完成，进入最终汇总。

---

## Phase D：统一报告汇总

### Step 13：生成 unified-report-dashboard

**读取并遵循 `unified-report-dashboard/SKILL.md` 的完整指令。**

#### 13.1 自动生成 dashboard YAML 配置

根据前 12 步产物，自动拼装 `[客户名称]/[客户名称]-dashboard.yaml`：

```yaml
title: "[客户名称] AI 场景探索全景报告"
subtitle: "Discovery Agent 全链路分析 · [生成日期]"
logo:
  icon: "[客户名称首字母]"
  text: "[客户名称]"
  subtitle: "AI场景探索 · [业务领域]"
  badge: "AI-POWERED"
stats:
  - number: "12"
    label: "分析模块"
  - number: "3"
    label: "Top AI场景"
  - number: "[痛点数量]"
    label: "业务痛点"
  - number: "[里程碑任务数]"
    label: "里程碑任务"
cards:
  - id: "nsm"
    number: "01"
    title: "北极星指标与战略"
    desc: "[核心北极星指标名称]"
    icon: "🎯"
    file: "[客户名称]-北极星指标及战略推导.html"
  - id: "maturity"
    number: "02"
    title: "AI 成熟度评估"
    desc: "AI 就绪度与转型差距"
    icon: "🏥"
    file: "[客户名称]-AI成熟度评估.html"
  - id: "osm"
    number: "03"
    title: "OSM 目标度量地图"
    desc: "目标 · 策略 · 度量体系"
    icon: "🗺️"
    file: "[客户名称]-OSM目标度量地图.html"
  - id: "process"
    number: "04"
    title: "业务流程深度分析"
    desc: "L1/L2 流程 · 痛点识别"
    icon: "🔍"
    file: "[客户名称]-业务流程深度分析.html"
  - id: "journey"
    number: "05"
    title: "体验旅程图"
    desc: "用户体验 · 情感曲线"
    icon: "🧭"
    file: "[客户名称]-体验旅程图.html"
  - id: "blueprint"
    number: "06"
    title: "服务蓝图"
    desc: "前台 · 后台 · 支撑系统"
    icon: "🏗️"
    file: "[客户名称]-服务蓝图.html"
  - id: "opportunity"
    number: "07"
    title: "AI 机会场景地图"
    desc: "自动化 · 智能化机会点"
    icon: "💡"
    file: "[客户名称]-AI机会场景地图.html"
  - id: "canvas1"
    number: "08"
    title: "AI 场景画布 · [scene_1]"
    desc: "10 维 AI Canvas · P0 场景"
    icon: "🖼️"
    file: "[客户名称]-AI画布-[scene_1].html"
  - id: "canvas2"
    number: "08b"
    title: "AI 场景画布 · [scene_2]"
    desc: "10 维 AI Canvas · P0/P1 场景"
    icon: "🖼️"
    file: "[客户名称]-AI画布-[scene_2].html"
  - id: "canvas3"
    number: "08c"
    title: "AI 场景画布 · [scene_3]"
    desc: "10 维 AI Canvas · P1 场景"
    icon: "🖼️"
    file: "[客户名称]-AI画布-[scene_3].html"
  - id: "ckd"
    number: "09"
    title: "CKD 数据映射"
    desc: "上下文 · 知识 · 数据资源"
    icon: "🗃️"
    file: "[客户名称]-CKD数据映射.html"
  - id: "matrix"
    number: "10"
    title: "AI 场景优先级矩阵"
    desc: "5×5 收益 × 可行性"
    icon: "📊"
    file: "[客户名称]-AI场景优先级矩阵.html"
  - id: "roadmap"
    number: "11"
    title: "产品演进路线图"
    desc: "阶段式商业路线图"
    icon: "🚀"
    file: "[客户名称]-产品演进路线图.html"
  - id: "milestone"
    number: "12"
    title: "里程碑计划"
    desc: "泳道 · 时间轴 · 关键节点"
    icon: "🏁"
    file: "[客户名称]-里程碑计划.html"
navigation:
  - section: "Phase A · 客户洞察"
    items:
      - { id: "nsm",       title: "北极星指标与战略", icon: "🎯", file: "[客户名称]-北极星指标及战略推导.html" }
      - { id: "maturity",  title: "AI 成熟度评估",    icon: "🏥", file: "[客户名称]-AI成熟度评估.html" }
      - { id: "osm",       title: "OSM 目标度量地图", icon: "🗺️", file: "[客户名称]-OSM目标度量地图.html" }
      - { id: "process",   title: "业务流程深度分析", icon: "🔍", file: "[客户名称]-业务流程深度分析.html" }
      - { id: "journey",   title: "体验旅程图",       icon: "🧭", file: "[客户名称]-体验旅程图.html" }
      - { id: "blueprint", title: "服务蓝图",         icon: "🏗️", file: "[客户名称]-服务蓝图.html" }
  - section: "Phase B · AI 机会"
    items:
      - { id: "opportunity", title: "AI 机会场景地图",         icon: "💡", file: "[客户名称]-AI机会场景地图.html" }
      - { id: "canvas1",     title: "AI 画布 · [scene_1]",    icon: "🖼️", file: "[客户名称]-AI画布-[scene_1].html" }
      - { id: "canvas2",     title: "AI 画布 · [scene_2]",    icon: "🖼️", file: "[客户名称]-AI画布-[scene_2].html" }
      - { id: "canvas3",     title: "AI 画布 · [scene_3]",    icon: "🖼️", file: "[客户名称]-AI画布-[scene_3].html" }
      - { id: "ckd",         title: "CKD 数据映射",            icon: "🗃️", file: "[客户名称]-CKD数据映射.html" }
      - { id: "matrix",      title: "AI 优先级矩阵",           icon: "📊", file: "[客户名称]-AI场景优先级矩阵.html" }
  - section: "Phase C · 战略规划"
    items:
      - { id: "roadmap",    title: "产品演进路线图", icon: "🚀", file: "[客户名称]-产品演进路线图.html" }
      - { id: "milestone",  title: "里程碑计划",     icon: "🏁", file: "[客户名称]-里程碑计划.html" }
footer:
  text: "由 Discovery Agent 自动生成"
  subtext: "分析框架：AI4PM Discovery Pipeline"
```

#### 13.2 执行仪表盘编译

> **路径说明**：以下命令需要在 `skills/` 目录下执行。若当前目录不在此处，请先找到 `unified-report-dashboard/scripts/build_dashboard.py` 的绝对路径后再运行。

```bash
# 在 skills/ 目录下执行：
python3 unified-report-dashboard/scripts/build_dashboard.py \
  "[客户名称]/[客户名称]-dashboard.yaml" \
  "[客户名称]/[客户名称]-统一报告仪表盘.html"
```

若脚本路径不存在，提示用户：「请确认当前工作目录为 skills/，或提供 build_dashboard.py 的完整路径。」

#### 13.3 更新进度追踪

更新 `[客户名称]/discovery_index.md` 所有行为 `✅ 完成`。

---

## 防遗忘与容错机制

### Phase Cache 规范

每个 Step 完成后，将关键输出摘要写入 `[客户名称]/phase_cache/` 目录下对应的 `.md` 文件。下一步骤执行前必须读取对应缓存文件，防止长对话中丢失上下文。

| 文件 | 存储内容 |
|------|----------|
| `p1_nsm.md` | 北极星指标、核心战略方向 |
| `p2_maturity.md` | AI 成熟度分级、关键 Gap |
| `p3_osm.md` | Objective 列表、L1 Metrics |
| `p4_process.md` | L1/L2 流程节点、核心痛点列表 |
| `p7_opportunities.md` | AI 场景列表（名称+优先级） |
| `p11_roadmap.md` | 路线图阶段、关键举措 |

### 中断恢复

如果用户在中途要求恢复，读取 `discovery_index.md` 判断已完成的步骤，从第一个 `⏳ 待执行` 步骤继续，无需重跑已完成阶段。

### 分段执行模式

若用户不需要全链路，可在 Step 0 确认执行范围：

| 模式 | 执行范围 | 前置依赖检查 |
|------|----------|-------------|
| `仅 Phase A` | Step 1-6 | 无 |
| `仅 Phase B` | Step 7-10 | 检查 `phase_cache/p4_process.md` 是否存在 |
| `仅 Phase C` | Step 11-12 | 检查 `phase_cache/p10_matrix.md` 是否存在 |
| `仅最后汇总` | Step 13 | 检查 `phase_cache/p8_canvas.md` 是否存在 |

**依赖缺失时的处理**：若所需 cache 文件不存在，告知用户：  
> 「执行 Phase B 需要 Phase A 的分析结果（p4_process.md）。请先执行 Phase A，或手动提供业务流程与核心痛点信息。」

用户可选择：① 先跑前置 Phase；② 手动粘贴对应内容让 Agent 继续。

---

## 完成输出

所有步骤完成后，从 `phase_cache/p8_canvas.md` 读取真实场景名称，向用户输出以下**动态**交付物摘要（将 scene_1/2/3 替换为实际场景名）：

```markdown
## ✅ Discovery Agent 完成

**客户**：[客户名称]
**领域**：[业务领域]
**生成时间**：[当前时间]
**产物目录**：`[客户名称]/`

| # | 模块 | 文件 |
|---|------|------|
| 01 | 北极星指标与战略 | [客户名称]-北极星指标及战略推导.html |
| 02 | AI 成熟度评估 | [客户名称]-AI成熟度评估.html |
| 03 | OSM 目标度量地图 | [客户名称]-OSM目标度量地图.html |
| 04 | 业务流程深度分析 | [客户名称]-业务流程深度分析.html |
| 05 | 体验旅程图 | [客户名称]-体验旅程图.html |
| 06 | 服务蓝图 | [客户名称]-服务蓝图.html |
| 07 | AI 机会场景地图 | [客户名称]-AI机会场景地图.html |
| 08a | AI 场景画布 · [scene_1] | [客户名称]-AI画布-[scene_1].html |
| 08b | AI 场景画布 · [scene_2] | [客户名称]-AI画布-[scene_2].html |
| 08c | AI 场景画布 · [scene_3] | [客户名称]-AI画布-[scene_3].html |
| 09 | CKD 数据映射 | [客户名称]-CKD数据映射.html |
| 10 | AI 场景优先级矩阵 | [客户名称]-AI场景优先级矩阵.html |
| 11 | 产品演进路线图 | [客户名称]-产品演进路线图.html |
| 12 | 里程碑计划 | [客户名称]-里程碑计划.html |
| 🎯 | **统一报告仪表盘** | **[客户名称]-统一报告仪表盘.html** |

用浏览器打开 **`[客户名称]-统一报告仪表盘.html`** 即可查阅全部 15 份报告。
```
