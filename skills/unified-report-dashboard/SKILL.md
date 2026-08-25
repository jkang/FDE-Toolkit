---
name: unified-report-dashboard
description: |
  生成统一报告仪表盘，将多个分析步骤（NSM 分析、业务流程、服务蓝图、AI 机会地图、AI 画布、里程碑计划等）的 HTML 输出整合为一个带侧边栏导航的深色模式仪表盘。

  Triggers when user mentions:
  - "统一报告仪表盘"
  - "生成仪表盘"
  - "unified report dashboard"
  - "整合报告"
  - "汇总所有报告"
author: KK
---

# Unified Report Dashboard Generator

统一报告仪表盘生成器 - 将多个分析步骤的 HTML 输出整合为一个完整的导航仪表盘。

> [!IMPORTANT]
> **输出路径与命名规范 (Output Path & Naming Convention)**:
> - **目录**: 输出到 `<公司/业务名>/` 公司/业务级目录；若产物属于**具体 AI 场景**（如某场景的测试数据集 / 故事地图 / Agent 本体等），**必须**放入 `<公司/业务名>/<场景名>/` 场景子目录（两层规范，详见 `agent.md` 第 2 节；场景级文件名需含场景名，如 `[公司]-[场景]-[业务类型].html`）。
> - **文件名**: 仪表盘 HTML 文件名必须格式为 `[公司/业务名]-统一报告仪表盘.html` (例如：`张雪机车海外销售-统一报告仪表盘.html`)。
> 
> **视觉设计规范 (Visual Design Standard)**:
> - **样式风格**: 默认按照 `skills/design.md` 进行样式输出。
> - **底色模式**: **保持深色底 (Dark Mode)**，背景颜色使用 `#0a0e27`。
> - **页面布局**: 仪表盘作为容器页面，应提供侧边栏导航和主内容区域。


## 核心功能

将企业 AI 战略分析的多个阶段输出（如 NSM 分析、业务流程分析、服务蓝图、AI 机会地图、AI 画布、里程碑计划等）整合为一个统一的 HTML 仪表盘，提供：

- 侧边栏导航菜单
- 封面页统计概览
- 卡片式目录入口
- iframe 内嵌报告查看
- 统一的暗色主题设计

## 使用流程

### Step 1: 准备 YAML 配置

创建 YAML 文件定义仪表盘结构：

```yaml
design: "design.md"  # 可选，导入包含 CSS 样式的 markdown 文件来自定义主题
title: "报告标题"
subtitle: "副标题描述"
logo:
  icon: "ZX"
  text: "企业名称"
  subtitle: "分析主题"
stats:
  - number: "9"
    label: "分析维度"
  - number: "32"
    label: "AI场景"
cards:
  - id: "report1"
    number: "01"
    title: "北极星指标与战略"
    desc: "海外月度活跃骑手数(MAR)"
    icon: "🎯"
    badge: ""
    file: "report1.html"

navigation:
  - section: "战略分析"
    items:
      - id: "report1"
        title: "北极星指标与战略"
        icon: "🎯"
        badge: ""
        file: "report1.html"
```

### Step 2: 编译生成仪表盘

```bash
python3 scripts/build_dashboard.py input.yaml output.html [design.md]
```

### Step 3: 部署

将所有 HTML 报告文件与生成的仪表盘文件放在同一目录下，用浏览器打开即可。

## 目录结构

```
unified-report-dashboard/
├── SKILL.md                          # 本指南
├── references/
│   └── schema.yaml                   # YAML 输入规范
├── scripts/
│   └── build_dashboard.py            # 仪表盘编译器
├── templates/
│   └── dashboard_layout.html         # Jinja2 模板
└── examples/                         # 示例输出
```

## 输入规范

参见 `references/schema.yaml` 了解完整的 YAML 数据结构定义。

## 输出特性

- 响应式侧边栏导航
- 封面页统计卡片
- 暗色主题（#0a0e27 背景）
- iframe 安全沙箱加载报告
- 打印支持
