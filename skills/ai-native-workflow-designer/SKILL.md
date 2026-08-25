---
name: ai-native-workflow-designer
description: |
  根据业务类型和价值流，设计完全 AI-Native 的颠覆性工作流，最大化 AI 自动化比例，输出包含人机协同节点的高颜值 HTML 可视化报告。

  Triggers when user mentions:
  - "生成 AI-Native 工作流"
  - "设计 AI 原生工作流"
  - "设计重构工作流"
  - "generate AI-native workflow"
  - "AI-driven process design"
author: KK
---

# AI-Native Workflow Designer (AI 原生工作流设计器)

此技能用于在明确业务类型和核心价值流后，不拘泥于现有流程的修补，而是从零设计一个“AI-Native”的颠覆性工作流。它致力于最大化利用 AI 的多模态、生成、推理和分析能力，让人类仅在需要极致创造力、复杂战略决策或最终风险兜底的环节介入。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**: 
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。HTML 内部已集成“复制 YAML”功能，确保数据可溯源。
> 
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范，详见 `agent.md` 第 2 节；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[业务类型].html` (例如：`张雪机车海外销售-AI原生工作流.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按照 `skills/design.md` 进行样式输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动。


## 核心架构

本技能采用 **LLM -> YAML -> Python -> HTML** 的解耦架构：
1. **LLM**: 负责理解业务背景，打破传统流程束缚，设计全新的 AI 原生节点，并严格遵循 YAML Schema。
2. **Compiler**: 位于 `scripts/build_workflow.py`，负责解析 YAML 并结合 `templates/workflow_layout.html` 生成高颜值的流程图。

## 分析与设计框架

设计出的工作流应包含明确的 **阶段 (Phases)**，并在每个阶段下包含多个 **节点 (Nodes/Steps)**。对于每个节点，核心定义包含：
- **执行主体 (Actor)**: `AI` (完全自动化) / `Human` (人类主导) / `Hybrid` (人机协同/AI辅助)。
- **核心动作 (Action)**: 该节点完成的具体任务。
- **AI 能力 (AI Capability)**: 使用的 AI 技术（如：多轮对话、RAG 知识检索、多模态生成、预测性分析）。
- **人工触点 (Human Touchpoint)**: 当存在 Human 或 Hybrid 节点时，人类为什么必须参与（如：审批、注入灵魂、情绪安抚）。
- **自动化程度 (Automation Level)**: `high`, `medium`, `low`。

## 工作流 SOP

### Step 2 · 行业专家可行性评审 (Expert Reality Check)
在生成最终 YAML 前，模拟或引入一个“行业领域专家”角色对初步设计的流程进行评审：
- **技术落地性**: AI 能力（如 RAG、Agent 编排）是否能在当前技术栈下稳定实现？
- **监管与合规**: 是否符合行业监管要求（如医疗隐私、金融合规、安全生产等）？
- **防范“AI 幻想”**: 避免设计出脱离物理世界逻辑或过度超前的功能。
- **保持创新**: 评审的目的是确保“可落地”，而不是退回到旧有流程。

### Step 3 · 生成结构化 YAML
- 读取 `references/workflow_prompts.md`（角色设定、思考路径、字段规范）。
- 严格按照 `references/schema.yaml` 的契约格式输出数据，每个节点必须包含 `expert_review` 字段。
- 将生成的 YAML 保存至 `examples/<业务标识>.yaml`。

### Step 4 · 编译 HTML 可视化报告
使用内置的 Python 编译器将 YAML 转化为交互式前端网页：
```bash
python3 scripts/build_workflow.py examples/<业务标识>.yaml examples/<业务标识>.html
```

### Step 5 · 交付审查
提供 HTML 文件路径给用户。该页面将渲染出具备强烈科技感的流程图，并特别标注出“专家可行性评估”建议，确保方案的可落地性。

## 目录结构

```text
ai-native-workflow-designer/
├── SKILL.md                         # 本指令说明
├── references/
│   ├── workflow_prompts.md          # 核心 LLM Prompt 及设计思维指导
│   └── schema.yaml                  # 标准 YAML 数据契约
├── scripts/
│   └── build_workflow.py            # 核心编译引擎，融合 YAML 与 Jinja2
├── templates/
│   └── workflow_layout.html         # Jinja2 前端模板
└── examples/                        # 示例输出文件夹
```
