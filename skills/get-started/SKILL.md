---
name: get-started
description: |
  新手引导与环境检查技能：让新 Agent / 新用户进入 FDE-Toolkit 时先完成环境预检
  （git status 干净、python3 与 node/npm 可用、skills/superpowers 布局正确）、
  阅读 AGENTS.md 与 skills/index.md，再输出「可用 /command 清单 + @Agent 清单 +
  如何开始一个 discovery」的入门引导。所有检查命令只读，不装依赖、不改全局配置。

  Triggers when user mentions:
  - "get started"
  - "新手引导"
  - "环境检查"
  - "FDE-Toolkit 入门"
  - "如何开始"
author: KK
---

# Get Started（新手引导与环境检查）

目的：让新 Agent / 新用户进入 **FDE-Toolkit**（AI4PM Skills 案例与工具库）时，
先完成**环境预检**并了解**怎么用**——然后再决定跑哪个 `/命令`。

> 全程**只读**：不安装依赖、不修改任何系统或全局配置。

## 一、先读两份必读文档

1. `AGENTS.md`（仓库根目录）—— 协作规范：唯一 Skill 源头在 `skills/`、双端维护
   （`.opencode/` + `.qoder/`）、稳定后才单向同步全局、不依赖本机绝对路径。
2. `skills/index.md` —— 总索引 + 使用路线图：各 `/命令` 编排哪些 Skill、FDE 四步法链路。

## 二、环境预检（全部只读命令）

在工具包根目录执行并核对：

```bash
git status --short        # 应为干净（或只有用户已知的未提交改动）
python3 --version         # python3 可用（skills 的 YAML→HTML 编译器依赖它）
node -v && npm -v         # node/npm 可用（MVP 原型工程依赖它们）
ls skills/superpowers     # 应存在；该目录是本地演练参考库，已在 .gitignore 排除，不入库
ls skills/                # 确认技能库布局（每个技能一个目录：SKILL.md + references/ 等）
```

如某项缺失/异常，向用户报告即可，**不要**擅自安装或改动。

## 三、输出入门引导

向用户/新 Agent 输出：

1. **可用 /command 清单**：`/discovery`、`/nsm`、`/client-insight`、`/opportunity`、
   `/agent-arch`、`/mvp-prototype`、`/mvp-eval`、`/requirement`、`/roadmap`
   （各自用途见 `skills/index.md` 第 0 节）。
2. **@Agent 清单**：`@nsm-analyst`、`@client-insight-advisor`、`@opportunity-advisor`、
   `@agent-arch-designer`、`@mvp-prototype`、`@mvp-evaluator`、`@requirement-analyst`、
   `@roadmap-planner`（以及宏编排 `discovery-agent`）。
3. **如何开始一个 discovery**：输入客户名称 + 业务领域 + 相关文档资料，运行
   `/discovery`（或直接委托 `discovery-agent`），一次跑完 FDE 四步法并汇总 Deck。
4. **单项技能按名触发**：未被 command 包裹的单体 Skill 与元技能也可直接按名调用
   （详见 `skills/index.md`）。
