---
name: mvp-metrics-generator
description: |
  根据 AI 产品的功能与 Workflow，自动设计 MVP 成效指标体系与全方位监控方案。

  Triggers when user mentions:
  - "设计 MVP 指标"
  - "生成上线门禁"
  - "design MVP success metrics"
  - "create go/no-go criteria"
author: KK
---

# MVP Metrics Generator

该技能通过分析 AI 产品的核心价值与执行流程，帮助产品经理和架构师建立一套从“能用”到“可信”的量化验证体系。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**: 
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理 and 数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。
> 
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[业务类型].html` (例如：`张雪机车海外销售-MVP指标设计.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按本 skill `references/` 内示例的视觉规范输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动。

## 核心特性

- **四维指标体系**：从业务、模型、系统、体验四个维度定义 MVP 成功的准入标准。
- **上线门禁决策**：生成清晰、可量化的门禁句（Go/No-Go Statement），消除上线决策的模糊性。
- **全方位过程监控**：提供模型层、检索层、系统层及业务层的实时监控指标与告警阈值定义。
- **测试集结构规划**：基于主路径、困难样例与边界样例的比例，指导测试数据集的构建。

## 快速使用

### 1. 提供产品描述
提供产品名称、核心 Workflow 或主要功能描述。

### 2. 生成 YAML
LLM 会根据验证框架生成符合规范的 YAML 数据。

### 3. 编译 HTML
使用 Python 脚本将 YAML 渲染为最终的 HTML 报告：
```bash
python3 scripts/build_metrics.py input.yaml output.html
```

## YAML 规范

### 全局字段
- `title`: 报告标题
- `product_name`: 产品名称
- `go_no_go_statement`: 最终的上线门禁句

### 核心指标 (target_metrics)
包含业务、模型、系统、体验四个维度的指标列表：
- `name`: 指标名称
- `dimension`: 归属维度
- `logic`: 计算口径
- `threshold`: 目标阈值
- `source`: 数据来源

### 过程监控 (monitoring_plan)
包含模型、检索、系统、业务层级的实时指标：
- `name`: 指标名称
- `layer`: 所属层级
- `logic`: 计算方式
- `range`: 正常范围
- `alert`: 告警阈值
- `meaning`: 诊断意义

## 开发者参考

- **逻辑来源**: 参考 `AIInceptionWorkshop` 的 `7-mvp-validation.md`。
- **视觉风格**: Premium Quality Dashboard / Decision Report.
- **依赖**: Python 3, Jinja2, PyYAML.
