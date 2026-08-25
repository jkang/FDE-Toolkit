---
name: plantuml-flow-generator
description: |
  根据业务流程描述生成专业的 PlantUML 时序图（Sequence Diagram）或活动图（Activity Diagram）。
  支持自动语法校正、别名管理、条件分支处理，并提供即时预览 HTML 生成。

  Triggers when user mentions:
  - "生成 PlantUML 流程图"
  - "画一个时序图"
  - "create a plantuml flowchart"
  - "generate sequence diagram"
author: KK
---

# PlantUML Flow Generator

基于 `AIFlow` 核心逻辑提取的 PlantUML 图表生成技能，专门用于将复杂的业务逻辑转化为标准、美观的时序图与流程图。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**: 
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 PlantUML (PUML)**: 原始代码文件，用于后续的精确编辑和版本控制。
> 2. **交互式预览 HTML**: 用于直观演示与下载。HTML 内部已集成“复制 PUML”功能，确保数据可溯源。
> 
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范，详见 `agent.md` 第 2 节；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[业务类型].html` (例如：`张雪机车海外销售-业务流程图.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按照 `skills/design.md` 进行样式输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动。


---

## 工作流 SOP

### Step 1 · 需求解析与代码生成
根据用户的业务流程描述，参考 `references/flowchart_prompts.md` 中的专家指令，生成符合 PlantUML 规范的代码。

### Step 2 · 语法修复与优化
将生成的原始代码通过 `scripts/fix_puml.py` 进行脱水处理，修复常见的语法错误（如 Note 换行、颜色空格等），确保 100% 可渲染。

### Step 3 · 生成预览 HTML
使用编译脚本将 PUML 代码转化为带有预览功能的独立 HTML：
```bash
python3 scripts/build_diagram.py examples/<name>.puml examples/<name>.html
```

### Step 4 · 交付
向用户展示生成的 PlantUML 源码与预览 HTML。

---

## 目录结构

```
plantuml-flow-generator/
├── SKILL.md                # 本指南
├── references/
│   ├── flowchart_prompts.md # 核心 LLM 提示词 (时序图专家)
│   ├── activity_prompts.md  # 活动图 (Flowchart) 专家提示词
│   ├── style_pack.puml      # 视觉样式包
│   └── procurement_sequence.puml  # 参考示例（采购订单时序图）
├── scripts/
│   ├── fix_puml.py          # PlantUML 语法修复引擎 (由 AIFlow 逻辑迁移)
│   └── build_diagram.py     # 生成预览 HTML 的编译脚本
├── examples/               # 存放生成的 .puml 和 .html
└── templates/
    └── preview_layout.html  # 预览页面模板
```

## 核心能力 (基于 AIFlow)

1. **别名自动分配**: 遵循 CamelCase 规则，避免非法字符。
2. **控制流着色**: 自动为 `alt`, `loop`, `opt` 块添加和谐的颜色标识。
3. **Note 健壮性**: 自动清理 Note 中的非法换行符，防止渲染崩溃。
4. **多模型适配**: 兼容 DeepSeek、Gemini 等主流模型生成的 PUML 风格。
