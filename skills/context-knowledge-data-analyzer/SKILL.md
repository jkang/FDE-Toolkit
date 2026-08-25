---
name: context-knowledge-data-analyzer
description: |
  根据 AI Workflow 描述，自动识别并梳理每一步骤所需的“上下文、知识与数据 (CKD)”映射。

  Triggers when user mentions:
  - "生成 CKD 表格"
  - "梳理上下文知识数据"
  - "identify context knowledge data"
  - "generate AI workflow data mapping"
author: KK
---

# Context/Knowledge/Data (CKD) Analyzer

该技能通过对 AI Workflow 的深度分析，帮助产品经理和架构师明确 AI 在执行每一步任务时“需要知道什么”、“引用什么”以及“访问什么”。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**: 
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。
> 
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[场景名]-[业务类型].html` (例如：`张雪机车海外销售-售后理赔-CKD矩阵分析.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按本 skill `references/` 内示例的视觉规范输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动。

## 核心特性

- **结构化映射**：将非结构化的 Workflow 步骤转化为标准化的 10 维 CKD 矩阵。
- **深度属性分析**：涵盖存储方式、预估数据量、AI 初始化潜力、更新频度及检索方式。
- **高颜值 HTML 报表**：基于 Glassmorphism 风格，支持响应式布局与动态权重计算。
- **工程化导向**：直接为 RAG（检索增强生成）和提示词工程提供清晰的资产清单。

## 快速使用

### 1. 提供 Workflow 描述
提供一段关于 AI Agent 或 Workflow 的执行步骤描述（包含目标、节点逻辑等）。

### 2. 生成 YAML
LLM 会根据描述生成符合规范的 YAML 数据，包含完整的 CKD 映射。

### 3. 编译 HTML
使用 Python 脚本将 YAML 渲染为最终的 HTML 报表：
```bash
python3 scripts/build_ckd.py input.yaml output.html
```

## YAML 规范

### 全局字段
- `title`: 报告标题
- `product`: 产品名称
- `description`: 场景简述

### 步骤字段 (steps)
每个步骤包含一个 `ckd_items` 列表。每个 CKD 项包含：
- `step_name`: 流程步骤名称
- `context_name`: 上下文/知识/数据名称
- `description`: 详细描述
- `type`: 类型（如 Prompt Template, 向量库, API 等）
- `storage`: 存储方式
- `volume`: 预估数据量
- `ai_init`: 是否支持 AI 辅助初始化 (True/False)
- `frequency`: 更新频度
- `retrieval`: 检索方式
- `status`: 当前支持情况

## 开发者参考

- **逻辑来源**: 参考 `AIInceptionWorkshop` 的 `3-workflow-design.md`。
- **视觉风格**: Premium Dashboard & Data Matrix.
- **依赖**: Python 3, Jinja2, PyYAML.
