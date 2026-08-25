---
name: ai-product-journey-generator
description: |
  基于 AI 场景定义（AI Canvas），以 AI 产品设计专家视角细化用户角色、
  分析典型使用场景，并设计带 AI 交互细节的 To-be User Journey HTML，
  为下一步生成产品原型做准备。

  Triggers when user mentions:
  - "生成 To-be 旅程"
  - "To-be User Journey"
  - "AI 产品旅程设计"
  - "设计 AI 交互旅程"
  - "细化用户角色和场景"
  - "to-be journey"
  - "AI 旅程"
author: KK
---

# AI Product Journey Generator (To-be 旅程设计生成器)

承接 `ai-canvas-generator` 的 AI 场景定义输出，以 **AI 产品设计专家** 的视角，
将单一 AI 场景细化为「可交付给原型生成的」To-be 旅程设计稿：
**用户角色细化 → 典型使用场景 → 带 AI 交互细节的 To-be Journey → 原型衔接要点**。

> 与 `journey-map-generator` 的区别：
> - 输入为 **AI 场景定义（Canvas YAML）** 而非业务流程描述；
> - 纯 **To-be 设计态**，**不含体验评分**（无 experienceScore）；
> - 每步行动补充 AI 产品设计细节：**用户上传数据示例 / 对话推荐操作指令 / 可见数据信息**。

> [!IMPORTANT] 全局规范（双重输出 / 输出路径 / 视觉设计）
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。
>
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范，详见 `agent.md` 第 2 节；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[场景名]-To-be旅程.html` (例如：`张雪机车海外销售-售后理赔-To-be旅程.html`)。YAML 文件同理，如 `[公司/业务名]-[场景名]-To-be旅程.yaml`。
> - **禁止**将场景级产物输出到 `<公司/业务名>/` 根目录或 Skill 的 `examples/` 目录（examples/ 仅存放演示样例）。
>
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按照 `skills/design.md` 进行样式输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动

---

## 核心数据结构（4 大模块）

| 模块 | 内容 | 视觉特性 |
|------|------|---------|
| **meta** | 来源 AI 画布、场景名、产品形态 | 头部徽标 |
| **personas** | 细化的用户角色（具名示例用户、背景、目标、痛点、数据特征） | Persona 卡片区 |
| **scenarios** | 2~3 个典型使用场景（触发时机、业务数据上下文、目标） | Scenario 卡片区 |
| **stages → actions** | To-be 旅程泳道（行为/触点/想法/用户输入/AI交互/可见数据/设计意图） | 泳道图 |

每个 action 的 AI 设计细节字段：

| 字段 | 含义 | 示例 |
|------|------|------|
| `userInputs` | 本步用户需上传/输入的数据（文件、表单、示例） | 上传 `PR-2024-0812.xlsx` 采购申请单 |
| `aiInteraction` | AI 动作 + 对话中推荐的操作指令（快捷 chips） | "识别并校验物料信息" |
| `visibleData` | AI 处理后用户能看到的真实数据信息细节 | 识别结果：3 条物料（电机×500件…） |
| `designNotes` | 该步骤设计意图与预期改善（承接 Canvas.userGains） | 录入耗时 30 分钟 → 2 分钟 |

---

## 工作流 SOP

### Step 1 · 解析 AI 场景定义（输入）
- **优先**：读取用户指定/历史产出的 AI Canvas YAML（如 `ai-canvas-generator/examples/dreame_canvas_1_procurement.yaml`），
  提取 `title`、`userRoles`、`userPains`、`aiInput`、`dataKnowledge`、`workflow`、`aiOutput`、`productType`、`userGains`。
- **兜底**：用户以自然语言描述 AI 场景时，先按 AI Canvas 十维结构自行推演，再进入 Step 2。
- **可选增强**：若用户提供真实业务数据样例（Excel/文档/截图），必须作为 `userInputs` / `visibleData` / `businessData` 的真实性依据，不得虚构冲突的数据。

### Step 2 · 推演 YAML（LLM 产物）
- 严格遵循 `references/to_be_prompts.md` 的铁律与字段约束（AI 产品设计专家角色 + 数据真实性 + 无评分 + 防呆结构）。
- **产物保存到 `<公司/业务名>/<场景名>/` 场景子目录**，命名 `[公司/业务名]-[场景名]-To-be旅程.yaml`（`examples/` 仅存放演示样例）。

### Step 3 · 编译输出 HTML
```bash
python3 scripts/build_to_be.py examples/<标识>.to_be.yaml examples/<标识>.to_be.html
```

### Step 4 · 最终交付
告知用户浏览器直接打开该 HTML 即可查阅：Persona 卡片、典型场景卡片、To-be 旅程泳道图与原型衔接要点。

---

## 目录结构

```
ai-product-journey-generator/
├── SKILL.md                        # 本指南
├── references/
│   ├── to_be_prompts.md            # 核心 LLM Prompt 铁律、AI 产品设计专家角色设定
│   └── schema.yaml                 # 标准 YAML 数据契约示例
├── templates/
│   └── to_be_layout.html           # Jinja2 HTML/CSS 泳道 + 卡片排版引擎
├── scripts/
│   └── build_to_be.py              # YAML → HTML 编译引擎（含防呆清洗）
└── examples/                       # 示例产物 (.yaml & .html)
```

---

## 与上下游 Skill 的关系

| 关系 | Skill | 说明 |
|------|-------|------|
| 上游输入 | `ai-canvas-generator` | 读取 AI Canvas YAML 作为场景定义 |
| 下游衔接 | `prototype-generator` | 输出中的 personas / scenarios / userInputs / visibleData 直接作为原型 Mock 数据与交互路径输入 |
| 下游衔接 | `story-map-generator` | 旅程可继续拆解为用户故事地图 |
| 平行补充 | `context-knowledge-data-analyzer` | CKD 是后台数据资产视角，本 Skill 是前台用户体验视角 |
