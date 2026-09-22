---
name: agent-creator
description: |
  编排一个新的 Subagent（组合若干已有 Skill 的编排层）：前置校验各 Skill 均在
  skills/ 内且粒度一致（场景级 vs 用户故事级不混），边界与触发词不与既有 9 个 Agent 重叠；
  双端生成 .opencode/agents/<name>.md 与 .qoder/agents/<name>.md（正文一致，
  仅 frontmatter tools 格式按平台差异书写），交付前全库 grep 确认无旧名残留。

  Triggers when user mentions:
  - "创建 Agent"
  - "新增 Subagent"
  - "编排一个新 Agent"
  - "生成 Subagent 定义"
  - "agent creator"
author: KK
---

# Agent Creator（Subagent 编排器 · FDE 规范版）

本 Skill 用于在本工具包内**编排一个 Subagent**：把一个或多个「已存在且粒度一致的
Skill」组合成一个可被 `@Agent` 调用的编排层。它**不**教用户用 `opencode agent create`
命令行建通用 Agent，而是产出本库可用的 `.opencode/` + `.qoder/` 双端定义。

> 官方 opencode agent 文档（作兜底）：https://opencode.ai/docs/agents/

## 一、前置校验（先确认再动手）

1. **组合对象是 Skill，不是需求**：确认要组合的技能全部已落地在 `skills/<x>/SKILL.md`
   （唯一源头）；不存在则先走 `skill-creator` 创建，再来编排。
2. **粒度一致，不混级**：一个 Agent 只组合同一粒度的 Skill。
   - 场景级示例：`mvp-prototype` = `agentic-product-proposal-generator` +
     `ai-product-journey-generator` + `prototype-generator` + `ux-optimizer`。
   - 「用户故事级」技能（故事详述 / Story 原型等）属另一套更细粒度流程，**不得混入**场景级 Agent。
3. **与既有 9 个 Agent 不重叠**：`nsm-analyst`、`client-insight-advisor`、
   `opportunity-advisor`、`agent-arch-designer`、`mvp-prototype`、`mvp-evaluator`、
   `requirement-analyst`、`roadmap-planner`、`ai-solution-designer`。新 Agent 的职责与触发词必须与其明确划界，
   触发词写明边界（避免误触发）。

## 二、生成双端文件（正文一致）

在工具包根目录创建两个文件：

```
.opencode/agents/<name>.md
.qoder/agents/<name>.md
```

- **正文完全一致**（复制同一份）。
- **仅 frontmatter 的 tools 声明允许差异**：

```yaml
# .opencode/agents/<name>.md —— opencode 端
---
name: <agent-name>            # 小写连字符
description: <职责 + 触发词 + 边界（一行内说明不与谁重叠）>
tools:
  read: true
  glob: true
  grep: true
  write: true
  edit: true
  bash: true
temperature: 0.2
---
```

```yaml
# .qoder/agents/<name>.md —— qoder 端（无 temperature，tools 用逗号串）
---
name: <agent-name>            # 与 opencode 端同名
description: <与 opencode 端 description 完全一致>
tools: Read, Glob, Grep, Write, Edit, Bash
---
```

> 技能 frontmatter `name` 需合规（小写连字符、无冒号）；跨端保持一致。

## 三、正文模板要素（按既有 Agent 惯例）

Agent 正文依次包含：

1. **description**（frontmatter）：职责一句话 + `当用户要求 …（触发词：…）时调用` + 边界声明。
2. **能力图**：ASCII 管道图，展示上游输入 → 各 Skill 依序编排 → 最终产物的链路。
3. **边界声明**：`> **边界**` 块，说明本 Agent 只处理哪个粒度/范围，哪些需求属其他流程。
4. **执行前必读**：三条全局规范（双重输出、两层目录、视觉规范），并注明以 `skills/` 为唯一源头。
5. **核心负责技能清单**：逐条列 `skills/<x>/SKILL.md` + 职责一句话 + 输入/输出要点。
6. **工作流**：编号 SOP（确认范围 → 各 Step 调对应 Skill → 验证 → 交付）。
7. **输出规范（两层目录）**：公司/业务级 vs 场景级路径与命名；**禁止**把场景级产物
   输出到 `<公司/业务名>/` 根目录。
8. **行为边界**：明确不做什么（如不修改 `skills/` 以外的副本、不改全局配置、需用户确认全局同步）。

## 四、交付前自查

1. **全库 grep 无旧名残留**：新 Agent 名 / 被组合 Skill 名若有更名，`grep` 全库确认
   无旧名（覆盖 `.opencode/`、`.qoder/`、`skills/`、`skills/index.md`）。
2. **联动 /command**：若新 Agent 需要 `/命令` 快捷入口，同步走 `command-creator` 生成
   `.opencode/commands/<name>.md` 与 `.qoder/commands/<name>.md` 双端文件。
3. **登记索引**：在 `skills/index.md` 的 `/command` 表或使用建议链路中登记。
4. **正文双端一致性**：`diff .opencode/agents/<name>.md .qoder/agents/<name>.md`
   应只差 frontmatter tools 区。
