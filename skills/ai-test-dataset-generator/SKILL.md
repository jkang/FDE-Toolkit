---
name: ai-test-dataset-generator
description: |
  根据 AI 功能的详述与输入输出示例，自动生成符合“三层三类结构”的 MVP 测试数据集。

  Triggers when user mentions:
  - "生成测试数据集"
  - "创建 AI 测试数据集"
  - "generate AI test dataset"
  - "create test cases for AI"
author: KK
---

# AI Test Dataset Generator

该技能通过分析 AI 功能的核心逻辑、输入数据特征与预期产出，自动化构建高质量的验证数据集，帮助团队在 MVP 阶段实现量化评估。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**: 
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。HTML 内部已集成“复制 YAML”功能，确保数据可溯源。
> 
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范，详见 `agent.md` 第 2 节；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名必须反映内容，格式为 `[公司/业务名]-[业务类型].html` (例如：`张雪机车海外销售-AI测试数据集.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按照 `skills/design.md` 进行样式输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动。


## 交互流程 (Workflow)

1. **专家引导与澄清**：
   - 首先向用户确认测试集的总数量（MVP 验证通常建议 20-50 条，以便具备统计意义）。
   - 询问 AI 功能的核心 Workflow 以及目前已有的输入/输出数据样本（甚至是 Bad Cases）。
2. **场景拆解与建模**：
   - 基于“三层结构”对业务场景进行拆解。
   - 识别潜在的“困难样例”（如歧义输入、长文本、矛盾逻辑）与“边界样例”（如恶意攻击、超长输入、知识盲区）。
3. **结构化生成**：
   - 严格按照 YAML 规范生成数据集，确保 `expected_intermediate` 具有可验证性。
4. **编译与交付**：
   - 自动生成 HTML 报告并提供查看说明。

## 核心原则 (Design Principles)

- **真实性 (Authenticity)**：测试用例必须贴近真实业务逻辑，而非空洞的 Lorem Ipsum。
- **差异化 (Diversity)**：确保同一个场景类型下的用例具有不同的侧重点，避免同质化。
- **可证伪 (Falsifiability)**：期望输出与中间产物必须定义明确，以便评估脚本能够自动判断对错。

## YAML 规范

### 全局字段
- `title`: 报告标题
- `product_name`: AI 功能/产品名称
- `summary`:
  - `total_cases`: 总用例数
  - `distribution`: 分布比例（golden, hard, edge）

### 测试用例 (test_cases)
- `id`: 用例编号（如 C-001）
- `scenario`: 场景描述
- `type`: 样例类型（Golden Path / Hard Case / Edge Case）
- `input`: 输入数据（支持 Markdown/Code 格式）
- `expected_intermediate`: 期望中间产物（检索片段、中间字段等）
- `expected_output`: 期望最终输出
- `notes`: 备注/归因说明

## 开发者参考

- **逻辑来源**: 参考 `AIInceptionWorkshop` 的 `7-mvp-validation.md`。
- **验证标准**: 高质量测试数据集 = 三层结构（覆盖场景）+ 三类标签（支持归因）。
- **依赖**: Python 3, Jinja2, PyYAML.
