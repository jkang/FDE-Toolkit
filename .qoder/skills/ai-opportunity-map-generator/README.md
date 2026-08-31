# AI Opportunity Map Generator

这个 Skill 旨在帮助产品经理和业务分析师通过“业务全生命周期”的视角，挖掘 AI 落地场景，并生成一张高颜值的、横向滚动的可视化地图。

## 🌟 核心特色

- **结构化推演**：从阶段、活动、角色、接触点到重复性/高认知痛点，最后映射到 AI 场景。
- **四类 AI 场景定义**：
  - 🟡 **重复性替代 (Repetitive)**: 释放人力，处理机械任务。
  - 🔵 **高认知辅助 (Cognitive)**: 增强决策，辅助专家经验。
  - 🟣 **长尾场景 (Long-tail)**: 处理低频非标需求。
  - 🟢 **业务流程创新 (Innovation)**: 重构传统流程，实现模式突破。
- **SaaS 级视觉质感**：生成的 HTML 具备横向滚动、固定表头、交互式过滤功能，适合直接展示在 PPT 或 浏览器中。

## 📁 目录结构

```text
ai-opportunity-map-generator/
├── SKILL.md            # Skill 指令主文件
├── scripts/
│   └── compiler.py     # Python 编译器 (YAML -> HTML)
├── assets/
│   └── map_layout.html # Jinja2 HTML 模板 (已合并 assets 与 templates)
├── references/
│   └── prompt_zh.md    # 引导 LLM 生成 YAML 的 Prompt
├── examples/
│   ├── example.yaml    # 示例输入数据
│   └── example.html    # 示例输出结果
└── README.md           # 说明文档
```

## 🚀 快速开始

### 1. 安装依赖
确保你的 Python 环境中安装了以下库：
```bash
pip install PyYAML jinja2
```

### 2. 生成地图
在你的会话中让 AI 根据业务描述生成 YAML 块，保存为 `input.yaml`，然后运行：
```bash
python scripts/compiler.py input.yaml output.html
```

## 📝 输出规范

AI 场景的描述请遵循以下严谨句式：
> **「受众角色」**在**「XXX业务节点」**下提供**[具体AI能力]**能力，以**「具体收益」**。

例如：
> 「门店经理」在「监控客流」下提供[视觉自动计数]能力，以「释放人力数据录入」。
