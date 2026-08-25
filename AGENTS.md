# AGENTS.md · 工作区协作规范

本文件是 **FDE-Toolkit**（AI4PM Skills 案例与工具库）中 Agent 协作的强制性约定。
本工具包是**可迁移**的：所有路径均为**本仓库内相对引用**，不含任何本机绝对路径。
任何 Agent 在本仓库内工作时必须阅读并遵守。

---

## 一、AI4PM Skills 开发工作流（最重要）

### 1. 唯一 Skill 库目录

**所有 Skill 的新增、修改、优化，只允许在本工具包的 `skills/` 目录内进行：**

```
<本工具包根>/skills/
```

- 这是本工具包内 AI4PM 技能库的**唯一源头（Source of Truth）**。
- 开发规范参考 `skills/agent.md`（双重输出 / 输出路径命名 / 视觉设计）与 `skills/design.md`。
- 新增 Skill 时在此目录创建 `skill-name/SKILL.md` + `references/` + `scripts/` + `templates/` + `examples/`，并同步登记到 `skills/index.md`。

### 2. 禁止在库外维护副本

**严禁**在本工具包之外的任何位置创建或修改 AI4PM Skills 的副本：

- 一律以本工具包内的 `skills/` 为准，不在 `~/.config/opencode/`、`.claude/`、`.agents/`、`.trae/`、`.config/` 下另建副本。
- 不把本工具包内容复制到 `case/客户目录` 或临时目录。

> 如需使用全局安装的稳定版，应从 `skills/` 单向同步，禁止反向把别处内容复制回 `skills/`。

### 3. 稳定后安装到全局

当 Skill 开发完成并通过验证后，才允许安装到全局位置：

```
全局安装位置：~/.config/opencode/skills/
```

安装命令（示例，单 Skill 粒度，均在工具包根目录执行）：

```bash
# 安装单个 Skill（稳定后）
rsync -a --delete \
  skills/<skill-name>/ \
  ~/.config/opencode/skills/<skill-name>/

# 或同步整个技能库
rsync -a --delete \
  skills/ \
  ~/.config/opencode/skills/
```

**同步方向永远是单向的：`skills/` → 全局。** 禁止反向从全局/别处往 `skills/` 复制。

### 4. 开发流程 Checklist

新增或修改 Skill 时按以下顺序执行：

1. **确认范围**：明确要新增/修改的 Skill 与需求。
2. **在 `skills/` 内实施**：编写 SKILL.md、references、scripts、templates、examples。
3. **登记索引**：更新 `skills/index.md`（技能描述、使用建议链路）。
4. **实测验证**：按 SKILL.md 的 SOP 跑通至少一次端到端验证（生成产物 + 启动/渲染检查）。
5. **汇报**：向用户报告改动清单与验证结果；由用户决定何时安装到全局。
6. **安装到全局（仅稳定后）**：使用上方 rsync 命令安装，并在交付摘要中说明已安装。

### 5. Agent 与 Command 双端维护

Agent（Subagent）与 Command 是「Skill 的组合编排层」，同样必须同步维护两端：

```
Agent 定义：.opencode/agents/<name>.md   +   .trae/agents/<name>.md
Command 定义：.opencode/commands/<name>.md  +  .trae/commands/<name>.md
```

规则：

- **两端必须同时创建/更新**，禁止只改一端。
- **两端正文必须一致**；仅 frontmatter 的 `tools` 声明允许按平台格式差异书写
  （opencode 用 YAML 布尔 `read: true, ...` + `temperature`，trae 用逗号字符串 `tools: Read, Glob, ...`）。
- **Agent 职责要精确**：一个 Agent 只组合粒度一致的 Skill。
  - 示例：`mvp-prototype` = `ai-product-journey-generator` + `prototype-generator`（均为「场景级」）；
  - 细粒度「用户故事级」技能（`story-narrative-generator` / `story-prototype-generator`）不得混入该 Agent。
- **触发词必须写明边界**，避免与其他 Agent 或技能流程混淆。
- 修改 Agent 涉及到的 Skill 名称/路径变更时，同步更新两端 Agent、两端 Command 及 `skills/` 内相关 SKILL.md 的引用。
- 完成后检查无旧名残留（如 `prototype-designer` → `mvp-prototype` 的重命名需全库 grep 确认）。

---

## 二、仓库结构与产物约定

- **案例/客户产物目录**：`X电商订舱/`（OOCL 电商订舱）、`铁路订票服务/` 等，为各客户的咨询交付物（报告、YAML、HTML、mvp-prototype 等），按客户+场景分目录存放。
- **MVP 原型输出位置**：`<客户案例目录>/<场景目录>/mvp-prototype/`。
- `skills/` 为技能库源码；`node_modules/`、`.git/` 等依赖与仓库元数据不入库。

## 三、通用协作约定

- 修改代码/产物后必须运行最小验证（编译、启动、curl、浏览器实测）。
- 本工具包**不依赖任何本机绝对路径**；新增引用一律使用工具包内相对路径。
- 涉及全局配置文件（`~/.config/opencode/`、`~/.claude/`、`~/.agents/`）的改动，需先征得用户同意。
- 不确定时先问，不要臆测目录归属或自行复制文件。
