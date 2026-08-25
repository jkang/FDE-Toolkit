---
name: ai-opportunity-map-generator
description: |
  根据业务流程描述，自动挖掘 AI 机会点并生成高颜值的“AI 机会场景地图” HTML。

  Triggers when user mentions:
  - "生成 AI 机会地图"
  - "generate AI opportunity map"
  - "AI 机会场景地图"
  - "挖掘 AI 机会"
author: KK
---

# AI 机会场景地图生成器 (AI Opportunity Map Generator)

此技能用于将用户提供的业务流程描述转化为高度结构化的“AI机会场景地图”。该地图以泳道图（Swimlane）形式展现流程中的阶段、活动、痛点以及针对性的 AI 机会场景。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**: 
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。HTML 内部已集成“复制 YAML”功能，确保数据可溯源。
> 
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范，详见 `agent.md` 第 2 节；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名 must be descriptive, format: `[公司/业务名]-[业务类型].html` (例如：`张雪机车海外销售-AI机会场景地图.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按照 `skills/design.md` 进行样式输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动。


## 核心架构

本技能采用 **LLM -> YAML -> Python -> HTML** 的解耦架构：
1. **LLM**: 负责业务逻辑分析，将非结构化描述转化为标准 YAML 数据。
2. **Compiler**: 位于 `scripts/compiler.py`，负责解析 YAML 并结合 `templates/` 下的 Jinja2 模板生成高颜值 HTML。

## 工作流

1. **业务流程建模**：审阅用户提供的业务或工作流描述，识别阶段（Stage）、活动（Activity）、执行角色（Role）及接触点（Touchpoint）。
2. **深度痛点挖掘**：
   - **重复性任务**：识别枯燥、机械、低附加值的数据搬运或重复操作。
   - **高认知负荷任务**：识别复杂、易错、依赖专家经验的决策与分析环节。
3. **AI 场景推演**：针对痛点设计 AI 方案，并归类为以下四种类型：
   - `repetitive`: 重复性替代
   - `cognitive`: 高认知辅助
   - `longtail`: 长尾场景
   - `innovation`: 业务流程创新
4. **生成 YAML 结构**：按照 [prompt_zh.md](references/prompt_zh.md) 中的 schema 要求输出 YAML 代码块。
5. **本地编译渲染**：
   - 提示用户（或由 AI 自动执行）：`python scripts/compiler.py input.yaml output.html`

## 参考指南

关于 YAML Schema 的定义、内容深度要求及 UI 规范，请参阅：
- [prompt_zh.md](references/prompt_zh.md)

## 目录结构

- `scripts/compiler.py`: Python 编译器。
- `templates/map_layout.html`: Jinja2 样式模板。
- `examples/`: 包含 `example.yaml` 参考示例。
- `references/`: 包含详细的 Prompt 指南。

## 核心输出准则

1. **结构化优先**：输出必须是符合 Schema 的标准 YAML。
2. **场景描述严谨**：必须使用「受众角色」在「XXX业务节点」下提供[具体AI能力]能力，以「具体收益」的严谨句式。
3. **视觉对齐**：通过编译器生成的 HTML 必须具备专业 SaaS 级视觉质感，支持横向滚动、固定表头及交互式分类过滤。
