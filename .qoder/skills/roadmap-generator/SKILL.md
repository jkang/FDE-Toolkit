---
name: roadmap-generator
description: |
  根据业务需求，自动生成垂直阶段式（Phases）的高颜值 HTML 商业路线图。

  Triggers when user mentions:
  - "生成产品路线图"
  - "generate roadmap"
  - "产品演进路线图"
  - "business roadmap"
author: KK
---

# Roadmap Generator Skill

该框架用于将自然语言转换为高保真的 HTML 垂直阶段式路线图（Roadmap Canvas）组件。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**: 
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。
> 
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名 must 反映内容，格式为 `[公司/业务名]-[业务类型].html` (例如：`张雪机车海外销售-产品路线图.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按本 skill `references/` 内示例的视觉规范输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动。

## 适用场景
当用户要求“生成一个产品演进/业务发展路线图”、“做一个垂直阶段的展示视图”、“梳理核心里程碑目标或指标体系并用 Roadmap 形式产出”，或其提供的描述呈现出明显的按阶段（Phases）进行层层递进的目标、指标与举措时使用全套流水线。

## 工具链架构（4 阶段架构）
请**严格按照以下**固定顺位来推进，不要图快直接跳步：

**Step 1. 前端理解 & 数据规划 (YAML)**
首先，通读并完全领会 `references/roadmap_prompts.md` 的内容（必须用 `view_file` 仔细研读里面的《Prompt 铁律》），理解输出 YAML 格式时所有必须严格遵循的要求。不要输出代码，单纯地按照该要求提炼出数据结构，写入一份 `xxx.yaml`。
> Schema 请务必参考 `references/schema.yaml`

**Step 2. 数据编译与逻辑分离 (Python backend)**
读取上一步的 YAML 数据。由于 YAML 的数据层级嵌套非常深（`phases` -> `objectives`/`metrics` -> `initiatives` 等等），必须在后端建立充分的防御转换（容错拍平、降维匹配等）。运行内置的 `scripts/build_roadmap.py <input.yaml> <output.html>`，如果遇到 YAML 解析错误或数据缺失报错，请自我修正 YAML 数据，直到脚本正常运行。

**Step 3. 视觉降维与模板引擎 (Jinja2 HTML)**
如果在运行 Python 脚本时遇到 Jinja2 template NotFound 等问题，说明你需要修改或完善模板 `templates/roadmap_layout.html`。模板的视觉标准应当是对原 React 版本的精确拆解和降维重组（剔除了所有复杂的前端框架钩子，仅保留布局与样式）。

**Step 4. 本地回溯与确认**
确认 python 指令执行完成，页面生成无误后，展示对应的成果并退出。

## 目录结构
```bash
roadmap-generator/
  ├── SKILL.md                          (你正在阅读的文件)
  ├── references/
  │   ├── schema.yaml                   (严苛的 YAML 定义)
  │   └── roadmap_prompts.md            (下发给大模型的结构化抽取指令)
  ├── scripts/
  │   └── build_roadmap.py              (编译引擎，集成防错解耦逻辑)
  ├── templates/
  │   └── roadmap_layout.html           (视觉映射，基于 Jinja2 和 Tailwind 规范)
  └── examples/
      ├── sample_roadmap.yaml           (仅用于测试)
      └── output.html                   (测试输出)
```
