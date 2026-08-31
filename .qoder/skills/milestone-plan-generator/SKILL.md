---
name: milestone-plan-generator
description: |
  将自然语言规划转换为带泳道和时间轴的高颜值 HTML 里程碑路线图。

  Triggers when user mentions:
  - "生成里程碑计划"
  - "generate milestone plan"
  - "里程碑路线图"
  - "milestone roadmap"
author: KK
---

# 🎯 Milestone Plan Generator

## 📌 技能介绍

此技能 (`milestone-plan-generator`) 专用于把长篇大论的“战略规划、季度任务、痛点分析”提取并转化为具备高维度沉浸感的 **HTML 格式里程碑甘特图路线图**。
这个 Pipeline 遵循 **LLM -> YAML -> Python -> Jinja2/HTML** 三层解耦架构，彻底实现业务逻辑层与底层视觉呈现的完美无死角隔离，确保即便面对庞杂、不规范的模型输出，最终也能输出稳健如一的原生应用级排版。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**: 
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。
> 
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[业务类型].html` (例如：`张雪机车海外销售-里程碑计划.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按本 skill `references/` 内示例的视觉规范输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动。

## ⚙️ 核心工作流 (Workflow)

当用户提出 "生成里程碑计划" 或类似请求时，必须**严格按照以下三步执行**：

1. **信息萃取并生成 YAML 描述**：
   - 必须通过 `view_file` 读取本技能目录下的 `references/milestone_prompts.md`，里面有强制的规则限定。
   - 按照 `references/schema.yaml` 规定的模板生成结构化数据。
   - 不要试图越过这一层直接画图（任何 LLM 手写的 Mermaid/SVG 在这里直接判负，必须走下面流程）。
   - 保存在工作区为临时文件，如 `milestone_data.yaml`。
   
2. **通过 Python 编译器降维生成 HTML**：
   - 运行本地转换脚本：`python scripts/build_milestone.py <input.yaml> <output.html>`
   - `build_milestone.py` 内置了重叠防撞算法、列宽自动计算与防御性数据清洗机制，能保证极高的产出直通率。
   
3. **交付结果**：
   - 告知用户 HTML 已生成妥当。
   - 请用户由于结果为 HTML 文件，可以通过浏览器本地打开体验其响应式和 CSS `:hover` 的惊艳交互细节。

---

## 📂 目录说明

*   `references/schema.yaml`: YAML 输入规范
*   `references/milestone_prompts.md`: 向 LLM 下达的核心 Prompt 与 7 条铁律
*   `scripts/build_milestone.py`: 视觉降维层核心编译器脚本
*   `templates/milestone_layout.html`: 排版核心
*   `examples/`: 生成样例存放目录
