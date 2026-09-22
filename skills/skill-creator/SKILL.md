---
name: skill-creator
description: |
  自动生成符合 AI4PM（FDE-Toolkit）开发规范的新技能模板：唯一源头在
  skills/<skill-name>/，脚手架含 SKILL.md + references/ + scripts/ + templates/ + examples/，
  并同步登记 skills/index.md。生成后按 SOP 实测验证，稳定后由用户决定单向同步到全局。

  Triggers when user mentions:
  - "创建技能"
  - "新增 skill"
  - "生成技能模板"
  - "skill creator"
  - "创建 AI4PM 技能"
author: KK
---

# Skill Creator（技能生成器 · AI4PM 规范版）

本 Skill 用于在本工具包内**新增一个符合 FDE 规范的自有 AI4PM 技能**。

> 本工具包的可迁移与唯一源头约束见 `AGENTS.md`（第一节）：所有 Skill 只允许在
> **`<工具包根>/skills/<skill-name>/`** 内开发；**严禁**在 `.opencode/skills/`、`.claude/`、
> `.agents/`、`~/.config/opencode/skills/` 等位置另建副本或反向复制。

## 一、前置判断（先用哪个 Creator）

| 用户想要的产物 | 用哪个元技能 |
|--------------|------------|
| 一个业务/SOP 技能（SKILL.md + references/scripts/templates/examples） | **本 Skill（skill-creator）** |
| 一个 Subagent（组合若干已存在 Skill 的编排层） | `agent-creator`（会生成 `.opencode/` + `.qoder/` 双端文件） |
| 一个 `/command`（命令 → Agent → Skill 的快捷入口） | `command-creator`（同上双端） |
| opencode 插件（npm 包 / 本地插件工程） | `plugin-creator` |

> 新增 Agent / Command / Skill 都会改变编排关系，需**全库 grep** 检查是否有旧名残留，
> 并把 `skills/index.md` 的使用建议链路同步更新。

## 二、创建目录与脚手架

在新技能开发完成并稳定前，**只在 `skills/<skill-name>/` 内操作**：

```bash
# 在工具包根目录执行
mkdir -p "skills/<skill-name>/references" \
         "skills/<skill-name>/scripts" \
         "skills/<skill-name>/templates" \
         "skills/<skill-name>/examples"
```

骨架文件职责：

| 文件/目录 | 是否必建 | 职责 |
|-----------|---------|------|
| `SKILL.md` | ✅ | 技能 SOP 指南：前文描述(description) + IMPORTANT 全局规范块 + 工作流 SOP + 目录结构 + 上下游关系 |
| `references/schema.yaml` | ✅（业务技能） | YAML 数据契约（唯一 Source of Truth），LLM 产物与 HTML 编译器之间唯一契约 |
| `references/` | ✅ | 视觉规范示例、LLM Prompt 铁律等补充文档 |
| `scripts/build_*.py` | ✅（需出 HTML） | YAML → HTML 编译引擎（产物化交付）；需能用 `python3` 直接运行 |
| `templates/*_layout.html` | ✅（需出 HTML） | Jinja2 HTML/CSS 模板 |
| `examples/` | ✅ | 演示样例（.yaml/.html）；**禁止**存放真实客户产物 |

## 三、SKILL.md 内容规范（按既有技能惯例）

1. **frontmatter**：
   - `name`：小写连字符、无冒号、与目录同名（如 `to-be-process-designer`）。
   - `description`：首段一句话能力概述；随后 `Triggers when user mentions:` 列出 2~4 个
     中文触发短语（参考既有技能风格）；末尾 `author: KK`。
2. **正文结构**：标题 → 一句话能力定位 → 「与相邻 Skill 的边界」块（写明会不会与其他技能
   触发/职责重叠）→ `> [!IMPORTANT]` 全局规范块（① 双重输出：结构化 YAML + 交互式 HTML；
   ② 输出路径与命名：公司/业务级 vs 场景级两层目录；③ 视觉设计：默认浅色、内容区撑满、
   按本 skill `references/` 内示例的视觉规范输出）→ 核心方法 → 核心数据结构 →
   工作流 SOP（含编译命令 `python3 scripts/build_xxx.py ...`）→ 目录结构 → 与上下游 Skill 的关系。
3. **触发词边界**：新技能的触发短语避免与既有技能撞车；确需重叠时写明「归并/转移」说明。
4. **引用**：SKILL.md 内引用的其他技能、文件路径必须真实存在（仓库内相对路径）；
   引用既有技能一律用小写连字符名（如 `prototype-generator`，不是 `prototype-designer`）。

## 四、双重输出与输出路径规范（新技能必须遵守）

- 业务技能默认**同时**输出 ① 结构化 YAML（供下游自动化/存档）② 交互式 HTML（供审查/演示）。
  - 例外必须显式声明（如 `agentic-product-proposal-generator` 输出单一 Markdown）。
- 输出路径遵循**两层目录**：公司/业务级产物在 `[客户名称]/`，场景级产物必须放到
  `[客户名称]/[场景名]/` 子目录；文件命名 `[客户名称]-[场景名]-[阶段名].yaml/.html`。
- **禁止**把场景级产物写进 `examples/`（examples/ 仅放演示样例）。

## 五、登记索引

- 在 `skills/index.md` 对应章节登记新技能：技能名链接 + 一句能力描述 + 使用建议链路。
- 若该技能属于某个 Agent 组合或某条 `/command` 链路，同步更新对应 Agent/Command 与
  触发词边界（涉及 `.opencode/` 与 `.qoder/` 双端时两端一起改）。

## 六、验证与交付（AGENTS.md 开发 Checklist）

1. 用示例输入跑通一次端到端：生成 YAML 产物 → `python3 scripts/build_xxx.py` 编译 HTML →
   用浏览器/静态检查确认渲染正常（无 JS 报错、无字段缺失）。
2. 全库自查：`grep` 确认新技能名与产物路径无旧名/拼写残留、无本机绝对路径泄漏。
3. 向用户汇报改动清单与验证结果；**安装到全局由用户决定**（稳定后由用户在工具包根目录执行
   `rsync -a --delete skills/<skill-name>/ ~/.config/opencode/skills/<skill-name>/`）。

## 七、防呆清单（提交前自查）

- [ ] 目录建在 `skills/<skill-name>/`，未在任何全局/其他端另建副本。
- [ ] frontmatter `name` 合规且与目录同名；`description` 含中文触发短语。
- [ ] SKILL.md 已写「与相邻 Skill 边界」与 `IMPORTANT` 三重规范块。
- [ ] `references/schema.yaml` 字段与 scripts/templates 实际消费的字段一致。
- [ ] 所有脚本 `python3` 可运行；模板占位符与文档一致。
- [ ] `skills/index.md` 已登记；相关 Agent/Command（双端）已同步；无旧名残留。
- [ ] 产物只落在 `[客户名称]/` 两层目录，`examples/` 仅演示样例。
