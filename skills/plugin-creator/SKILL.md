---
name: plugin-creator
description: |
  opencode 插件知识速查（精简版）：本工具包以 SKILL.md 交付为主、不维护插件源码，
  本元技能仅保留「插件放哪、npm 插件怎么配、最简模板、加载顺序」的速查，
  并明确本库不默认使用插件、涉及全局配置改动需先征得用户同意。

  Triggers when user mentions:
  - "创建插件"
  - "opencode 插件"
  - "plugin 模板"
  - "plugin creator"
author: KK
---

# Plugin Creator（插件知识速查 · FDE 精简版）

> 说明：本工具包（FDE-Toolkit）的 AI4PM 能力以 `skills/<x>/SKILL.md` 交付为主，
> **不默认使用、也不维护插件源码**。本元技能只提供 opencode 插件机制的速查知识，
> 供确需在平台侧做钩子扩展时参考。

> 官方 opencode 插件文档（作兜底）：https://opencode.ai/docs/plugins/

## 一、插件放哪（位置速查）

- 项目级：`.opencode/plugins/*.js` 或 `.opencode/plugins/*.ts`
- 全局级：`~/.config/opencode/plugins/*.js` 或 `*.ts`
- npm 插件：在 `opencode.json` 的 `plugin: [...]` 里声明包名，由平台启动时安装加载：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-helicone-session", "opencode-wakatime"]
}
```

## 二、最简模板

```ts
export const MyPlugin = async ({ project, client, $, directory, worktree }) => {
  return {
    // Hook 实现写在这里
  };
};
```

## 三、加载顺序

全局配置 → 项目配置 → 全局插件 → 项目插件（后者覆盖前者）。

## 四、本工具包的使用约定

- 本库技能以 SKILL.md（SOP）+ `scripts/`（python3 可运行的 YAML→HTML 编译器）交付，
  不需要插件；确需平台级钩子时才考虑插件。
- 涉及全局配置文件（`~/.config/opencode/`、`~/.claude/`、`~/.agents/`）的任何改动，
  必须先征得用户同意（见 `AGENTS.md` 通用协作约定）。
