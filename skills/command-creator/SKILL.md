---
name: command-creator
description: |
  自动生成跨平台一致的命令（/command）定义：双端生成 .opencode/commands/<name>.md 与
  .qoder/commands/<name>.md（正文一致，frontmatter 差异仅在于 opencode 端可选 agent 路由，
  qoder 端仅 name/description）。命令命名小写连字符、不与既有 9 个命令重名，
  正文交代目标（串哪些 Skill/Agent、读哪些上游产物、写哪些产物路径）与边界。

  Triggers when user mentions:
  - "创建命令"
  - "新增 command"
  - "生成 /命令"
  - "command creator"
author: KK
---

# Command Creator（/命令 生成器 · FDE 规范版）

本 Skill 用于在本工具包内**生成一个 `/命令`（命令 → Agent → Skill 的快捷入口）**，
并保证 `.opencode/` 与 `.qoder/` 两端同步维护。

> 官方 opencode command 文档（作兜底）：https://opencode.ai/docs/commands/

## 一、前置：先查重名与边界

- 命令命名**小写连字符**；先核对是否与既有命令重复/重叠边界。
- 本库已有命令（先查再建）：
  `nsm`、`client-insight`、`opportunity`、`agent-arch`、`mvp-prototype`、
  `mvp-eval`、`requirement`、`roadmap`、`discovery`。
- 命令正文要**交代目标**：串哪些 Skill / @Agent、读取哪些上游产物、产出写哪些路径，
  以及边界（不属于本命令范围的需求转给哪个流程）。

## 二、生成双端文件（正文一致）

```
.opencode/commands/<name>.md
.qoder/commands/<name>.md
```

- **正文完全一致**；仅 frontmatter 按平台差异书写：

```yaml
# .opencode/commands/<name>.md —— opencode 端（可选 agent 路由）
---
name: <command-name>          # 小写连字符，命令即 /<command-name>
description: <该命令做什么，含触发场景>
agent: <subagent-name>        # 可选：路由到 Subagent 执行
---
```

```yaml
# .qoder/commands/<name>.md —— qoder 端（仅 name/description）
---
name: <command-name>          # 与 opencode 端同名
description: <与 opencode 端 description 完全一致>
---
```

- 两端均**不默认带** `temperature` / `subtask` 字段；仅当 opencode 端确有需要时
  （如强制 subagent 隔离上下文）才在 opencode 端加 `subtask: true`，qoder 端永远只有
  `name`/`description`。

## 三、命令正文模板（在 frontmatter 后书写）

```
调用 `<Agent 名>` Subagent 完成<目标>：

1. 若对话中未提供<上游产物/范围>，先向用户确认（<可选项>）。
2. 委派 `<Agent 名>` 按确认范围执行，核心链路：
   - <Step A>：读取 <上游产物路径> → 调 <skill-a> 产出 <产物路径>;
   - <Step B>：以 <上步产物> 为输入 → 调 <skill-b> 产出 <产物路径>;
   - ...
3. 将 Subagent 返回的交付摘要（产物文件清单、验证结果）呈现给用户。

边界：本命令只负责<范围>；<不属于本命令>的需求请使用其他流程。
```

## 四、语法速查（够用即可）

- `$ARGUMENTS`：命令后的全部参数；`$1`、`$2` …：位置参数。
- `!\`cmd\``：把 shell 命令输出注入 prompt。
- `@path/to/file`：把文件内容注入 prompt。
- `agent: <subagent>`（仅 opencode 端）：将命令路由给指定 Subagent。
- 未知语法查官方：https://opencode.ai/docs/commands/

## 五、交付前自查

1. 命令名小写连字符、与既有 9 个命令不重名。
2. 双端正文一致：`diff .opencode/commands/<name>.md .qoder/commands/<name>.md`
   应只差 frontmatter。
3. 若命令路由到新 Subagent，先经 `agent-creator` 生成双端 Agent；若新增/更名 Skill，
   同步更新相关 Agent/Command 与 `skills/index.md` 引用，全库 grep 无旧名残留。
