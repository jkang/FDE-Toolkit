---
name: mvp-plan-generator
description: |
  根据需求地图，自动规划 MVP 迭代计划并生成高颜值的看板式 HTML 报告。

  Triggers when user mentions:
  - "生成 MVP 计划"
  - "MVP 迭代规划"
  - "create an MVP plan"
  - "generate iteration roadmap"
author: KK
---

# MVP Plan Generator

该技能通过 `LLM -> YAML -> Python -> Jinja2` 的标准工作流，将用户故事地图中的核心需求转化为结构化的 MVP 迭代计划，并以高颜值的看板形式进行可视化展示。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**: 
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。
> 
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[业务类型].html` (例如：`张雪机车海外销售-MVP迭代计划.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按本 skill `references/` 内示例的视觉规范输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动。

## 核心特性

- **敏捷迭代逻辑**：自动根据卡片总数计算迭代周期（通常 5 卡片/迭代），并设定各迭代的阶段目标。
- **依赖可视化**：自动识别并展示需求间的技术/业务依赖关系，确保开发顺序科学合理。
- **看板式 UI**：采用现代玻璃拟态风格，清晰展示迭代（Iteration）与卡片（Story/Requirement）的关系。
- **高密度信息展示**：支持需求类型（用户故事/支撑需求）、阶段、活动、优先级及依赖标注。

## 快速使用

### 1. 提供需求描述
提供一份来自用户故事地图的 Must Have 需求列表。

### 2. 生成 YAML
LLM 会根据规划逻辑生成符合规范的 YAML 数据。

### 3. 编译 HTML
使用 Python 脚本将 YAML 渲染为最终的 HTML 报告：
```bash
python3 scripts/build_mvp.py input.yaml output.html
```

## YAML 规范

### 全局字段
- `title`: 计划标题
- `description`: 规划简述
- `config`: 包含 `teamCapacity`（团队容量）和 `totalIterations`（总迭代数）

### 迭代字段 (iterations)
- `name`: 迭代名称（如“迭代 1”）
- `goal`: 迭代核心目标
- `cards`: 包含在该迭代内的卡片列表

### 卡片字段 (cards)
- `type`: `userStory` 或 `supportingRequirement`
- `description`: 功能描述
- `stage`: 所属阶段
- `activity`: 所属活动
- `dependencies`: 依赖的卡片 ID 数组

## 开发者参考

- **逻辑来源**: 参考 `AIStoryMap` 的 `mvp-plan-prompts.ts`。
- **视觉风格**: 与 AIStoryMap 迭代看板完全一致。
- **依赖**: Python 3, Jinja2, PyYAML.
