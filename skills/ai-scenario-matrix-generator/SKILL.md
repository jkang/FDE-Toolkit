---
name: ai-scenario-matrix-generator
description: |
  自动分析 AI 场景并生成包含打分标准与维度详情的 5x5 优先级矩阵 HTML 报告。

  Triggers when user mentions:
  - "生成 AI 场景矩阵"
  - "generate AI scenario matrix"
  - "AI 优先级矩阵"
  - "AI scenario matrix"
author: KK
---

# AI Scenario Matrix Generator

用于将自然语言描述的 AI 场景自动转化为结构化的评估数据，并生成高精细度的 AI 场景优先级矩阵看板。

> [!IMPORTANT]
> **双重输出规范 (Dual Output Standard)**: 
> 当你使用此 Skill 时，必须**同时**输出两个部分：
> 1. **结构化 YAML**: 用于下一步的自动化处理和数据存档。
> 2. **交互式 HTML**: 用于最终用户的直观审查与演示。HTML 内部已集成“复制 YAML”功能，确保数据可溯源。
> 
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: HTML 文件名 must be descriptive, format: `[公司/业务名]-[业务类型].html` (例如：`张雪机车海外销售-AI场景优先级矩阵.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按本 skill `references/` 内示例的视觉规范输出。
> - **底色模式**: 默认使用 **浅色底 (Light Mode)**。
> - **页面布局**: HTML 内容区撑满容器宽度（width: 100%），Header 采用统一精简样式（左侧标题+副标题、右侧操作按钮），内容超出屏幕时容器内可上下左右滚动。


## 使用流程

1. **分析并提取数据**：
   根据用户提供的 AI 场景描述，按照以下 7 个维度进行 1-5 分的自动评估：
   - **收益维度 (Benefit)**：
     - `userCount`: 用户覆盖评分 (1:极少, 5:极大)
     - `usageFrequency`: 使用频率评分 (1:极少, 5:持续)
     - `businessValue`: 商业价值评分 (1:最小, 5:关键)
   - **成本维度 (Cost)**：
     - `dataComplexity`: 数据复杂性 (1:简单, 5:复杂)
     - `aiDesignComplexity`: AI 设计复杂性 (1:简单, 5:新型/极难)
     - `integrationComplexity`: 集成复杂性 (1:独立, 5:跨企业)
     - `knowledgeComplexity`: 知识领域复杂性 (1:通用, 5:极精深)

2. **输出 YAML 格式**：
   将分析结果输出为以下格式的 YAML：

   ```yaml
   title: "项目 AI 场景矩阵报告"
   useCases:
     - id: "1"
       name: "场景名称"
       userCount: 4
       usageFrequency: 5
       businessValue: 4
       dataComplexity: 2
       aiDesignComplexity: 2
       integrationComplexity: 1
       knowledgeComplexity: 3
   ```

3. **编译 HTML**：
   将 YAML 保存为 `examples/<标识>.yaml` 后，运行编译脚本生成静态 HTML：

   ```bash
   python3 scripts/compile.py examples/<标识>.yaml examples/<标识>.html
   ```

   > 若省略输出参数，默认输出为 `<输入文件同名>.html`。
   生成的报告包含：
   - **可折叠的打分标准面板**：详细定义了每个维度的 1-5 分评估准则。
   - **维度详情评分**：在场景清单中直观展示 7 个维度的具体得分，确保评估过程透明可追溯。
   - **5x5 优先级矩阵**：基于收益与成本均值自动定位场景象限。

## 评估逻辑参考

- **优先级分数 (Priority Score)**: `(BenefitAvg) / (CostAvg)`
- **Grid 位置**: X 轴 = `Round(CostAvg)`, Y 轴 = `Round(BenefitAvg)`
- **颜色象限**:
  - 高收益/低成本: Quick Wins (绿色)
  - 高收益/高成本: Big Bets (橙色)
  - 低收益/低成本: Fill-ins (灰色)
  - 低收益/高成本: Avoid (红色)
