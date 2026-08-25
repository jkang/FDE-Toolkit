---
name: nsm-analysis
description: "End-to-end enterprise strategic orchestration outputting Business North Star Metrics and strategies. Use when Claude needs to perform comprehensive business diagnosis for: (1) Orchestrating the full business-research → swot-analysis → strategy-derivation pipeline, (2) Executing cross-phase quality review and scoring. Triggers ONLY on requests for complete, full-scale analysis like '推导业务北极星指标', '全盘业务分析', or '完整的战略推导'. (Note: Do NOT use this macro skill if the user only requests a single phase like isolated SWOT or isolated research; use the respective micro-skill instead)."
author: KK
---

# Business North Star Metrics Analysis — 宏 Skill

编排三个微 Skill，完成 AI 规划项目启动前的完整企业深度调研。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**: 
> 当你使用此 Skill 时，每个子阶段及最终汇总必须**同时**输出两个部分：
> 1. **结构化 YAML/JSON**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。HTML 内部已集成“复制数据”功能，确保数据可溯源。
> 
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范，详见 `agent.md` 第 2 节；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[业务类型].html` (例如：`张雪机车海外销售-北极星指标及战略推导.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按照 `skills/design.md` 进行样式输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动。


## 📁 内部架构 (Internal Architecture)

```text
nsm-analysis/
├── SKILL.md                 # 宏技能调度器 (当前文件)
├── sub-skills/
│   ├── business-research/   # 子技能 1：业务现状调研
│   ├── swot-analysis/       # 子技能 2：SWOT 分析
│   └── strategy-derivation/ # 子技能 3：战略与北极星指标推导
└── references/              # 全局参考材料
```

## 编排流程

```
输入收集 → business-research → swot-analysis → strategy-derivation → 质量审查 → 输出
                 (阶段 1)          (阶段 2)          (阶段 3)
```

## 预检与降级方案

在启动调研前，**必须先进行环境能力预检**：

1. **评估工具可用性**：判断你当前的运行环境是否能够正常调用互联网搜索和网页读取能力（如 `search_web` 工具）。
2. **正常执行分支**：如果你具备搜索工具，请默默开启信息收集流程，**不要询问用户**，直接向下执行。
3. **降级执行分支（无工具时）**：如果你明确知道自己**无法连接网络或无搜索能力**，请先向用户发送以下明确的请求话术：
   > "我当前的环境无法直接搜索互联网，无法自动完成深度调研。为了继续帮您做北极星指标和战略推导，请您提供以下材料（或其链接/文件）：
   > 1. 该企业近 1-2 年的年报/财报 PDF 或核心数据
   > 2. 官网相关介绍页面或产品文档
   > 3. 您掌握的竞品和市场背景信息"

   收到用户提供的材料后，继续基于材料往下走 1/2/3 步骤。并在最终报告明显处标注：*"（注：本报告基于用户提供的静态材料生成，未进行全网实时搜索）"*。

## Step 0：输入收集

向用户确认以下参数：

| 参数 | 必填 | 说明 |
|------|------|------|
| 企业名称 | 是 | 调研目标公司 |
| 业务类型/模式 | 是 | 要分析的具体业务方向 |
| 分析范围 | 否 | 全部（默认）/ 指定阶段 |
| 竞品列表 | 否 | SWOT 对标 |
| 额外关注点 | 否 | 用户特别关心的维度 |

**执行前强制检查**：检查是否已执行过上述的"工具可用性预检"，决定是走自动化流还是降级（人工投喂材料）流。
确认后，按用户指定的范围执行后续阶段。

## Step 1：执行 business-research

**读取并遵循本目录下的 `sub-skills/business-research/SKILL.md` 的指令**，执行业务现状调研：
- 传入企业名称、业务类型、行业关键词
- 获取**业务现状报告**

**阶段衔接与防遗忘 Checkpoint**：为防止在后续深度推理中遗忘上下文，**必须将获取到的「业务现状报告」全文写入当前工作区的一个临时文件（如 `phase1_business_research.md`）中保存**。阶段 2 执行前需直接读取该文件作为输入。

## Step 2：执行 swot-analysis

**读取并遵循本目录下的 `sub-skills/swot-analysis/SKILL.md` 的指令**，基于 Step 1 产出的报告进行 SWOT 分析：
- 传入企业名称、业务类型、阶段 1 的业务现状报告
- 获取 **SWOT 分析报告**（含交叉策略矩阵）

**阶段衔接与防遗忘 Checkpoint**：同样地，**必须将获取到的「SWOT 分析报告」全文写入临时文件（如 `phase2_swot_analysis.md`）中保存**。阶段 3 执行前需读取 Phase 1 和 Phase 2 的文件作为输入。

## Step 3：执行 strategy-derivation

**读取并遵循本目录下的 `sub-skills/strategy-derivation/SKILL.md` 的指令**，基于 Step 1 和 Step 2 产出的报告推导北极星指标与策略：
- 传入企业名称、业务类型、阶段 1-2 的报告
- **双重输出**：产出结构化 YAML 数据及可视化 HTML 报告（含 KPI 金字塔）。
- 获取**业务战略与指标报告**（Markdown + HTML 链接）。

## Step 4：跨阶段质量审查（内部过程，不向用户输出）

三个阶段全部完成后，在内部作为思维过程或隐藏分析执行跨阶段质量审查，详细框架见 [quality_review.md](references/quality_review.md)。**注意：此步骤为质量门禁，绝不能把审查项的勾选、各个维度的打分以及最终分数输出在呈现给用户的报告中。**

### 一致性检查

1. **事实基础一致**：阶段 2 引用的数据与阶段 1 吻合
2. **策略逻辑闭环**：阶段 3 的策略回应了阶段 2 交叉矩阵的建议
3. **指标可追溯**：北极星指标和 KPI 与业务现状中的关键发现对齐
4. **无自相矛盾**：三份报告中不存在相互矛盾的判断

### 质量评分

对最终输出按 5 个维度打分（1-5 分），总分 ≥ 18 分视为合格：

| 维度 | 评估标准 |
|------|----------|
| 信息密度 | 关键数据充分，非空泛描述 |
| 证据支撑 | 论点有来源标注，非凭感觉 |
| 逻辑连贯 | 三阶段之间逻辑链条通顺 |
| 可操作性 | 策略和指标可直接用于 AI 规划 |
| 业务相关性 | 紧扣指定业务类型，非泛泛分析 |

若评分 < 18 或发现一致性问题，回到对应阶段修正后重新审查。

## Step 5：输出汇总

在确保上述内部审查合格后，将三份报告整合为一个完整的 Business North Star Metrics Analysis 报告提交给用户，包含：

1. **调研摘要** — 一页纸总结核心发现
2. **阶段 1：业务现状报告**（完整）
3. **阶段 2：SWOT 分析报告**（完整）
4. **阶段 3：业务战略与指标报告**（Markdown + 可视化 HTML）
5. **对 AI 规划的建议** — 基于调研为后续 AI 规划提供方向性输入
6. **后续分析建议** — 建议使用 `OSM-map-generator` 对 P0/P1 策略进行深度拆解。

## 输出规范

- 所有内容使用 Markdown 格式
- 中文撰写，术语保留英文原文
- 区分"事实"和"推断"，推断处标注"[推断]"
- 不编造数据，找不到的信息标注"未找到公开数据"
- 每个数据点标注信息来源
