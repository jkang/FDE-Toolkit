---
name: ai-canvas-generator
description: |
  根据用户的自然语言 AI 场景描述，一次性生成完整的 AI Canvas（画布）HTML。

  Triggers when user mentions:
  - "生成 AI 画布"
  - "create AI Canvas"
  - "AI 画布生成器"
  - "AI Canvas"
author: KK
---

# AI Canvas Generator

脱胎于 `AICanvas` 沉浸式组件，基于与 `blueprint-map-generator` 同源的“三段隔离”架构构建的一个纯离线、便携式的画布生成技能。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**: 
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。HTML 内部已集成“复制 YAML”功能，确保数据可溯源。
> 
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范，详见 `agent.md` 第 2 节；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[场景名]-[业务类型].html` (例如：`张雪机车海外销售-售后理赔-AI画布.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按照 `skills/design.md` 进行样式输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动。


---

## 核心数据结构 (5列 Macaron 色系呈现)

AI Canvas 画布展现为 10 个业务模块分布于 5 列之中，具有特定的颜色主题标识：

| 列索引 | 包含维度 | 颜色标识 (Macaron Theme) |
|--------|----------|--------------------------|
| **1（用户与痛点）** | `userRoles` (用户角色), `userPains` (用户痛点) | Rose 粉红 |
| **2（输入与数据）** | `aiInput` (AI 输入), `dataKnowledge` (知识/数据) | Amber 琥珀 |
| **3（处理与模型）** | `workflow` (处理流程), `modelUsage` (模型使用) | Sky 天蓝 |
| **4（输出与工具）** | `aiOutput` (AI 输出), `tools` (工具与集成) | Violet 紫罗兰 |
| **5（产品与收益）** | `productType` (产品形态), `userGains` (提效收益) | Emerald 翡翠绿 |

---

## 工作流 SOP

### Step 1 · LLM 解析生成
阅读用户的“AI适用场景”口语化描述，推演出：适用用户、所解决的痛点、AI介入点、输入输出、所需的模型与上下文数据、最终能产生多少业务指标提升等。

### Step 2 · 组装产生 YAML
依据 `references/canvas_prompts.md` 中的系统级铁律（扁平化 List 结构为主），输出防呆契约级 YAML 数据体，**产物保存到 `<公司/业务名>/<场景名>/` 场景子目录**（命名 `[公司/业务名]-[场景名]-AI画布.yaml`；`examples/` 仅存放演示样例）。

### Step 3 · Python 脱水编译 HTML
```bash
python3 scripts/build_canvas.py examples/<scenario>.yaml examples/<scenario>.html
```

### Step 4 · 给用户交付
通知用户“画布已生成好！”，在浏览器中直接拉开看渲染妥当的静态画布卡片视图。

---

## 目录结构说明

```
ai-canvas-generator/
├── SKILL.md                        # 本指南
├── references/
│   ├── canvas_prompts.md           # 核心 LLM Prompt 与铁律约束
│   └── schema.yaml                 # 标准扁平化 YAML 输出范本
├── templates/
│   └── canvas_layout.html          # Jinja2 组装用：CSS 注入版独立页面
├── scripts/
│   └── build_canvas.py             # 读取 yaml 打成 Html 的编译引擎
└── examples/                       # Playground 成果展示与暂存地
```
