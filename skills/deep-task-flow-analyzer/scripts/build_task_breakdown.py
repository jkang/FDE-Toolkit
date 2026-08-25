"""
build_task_breakdown.py ── deep-task-flow-analyzer Compiler
将「任务流程拆解 YAML」编译为「端到端深度任务流程地图 HTML」。

Usage:
    python3 scripts/build_task_breakdown.py <input.yaml> <output.html>

设计要点：
- 数据契约见 references/schema.yaml：meta / overview / legend / stages(L3→L4→L5) /
  readingFlow / focusDrill/before-evidence-after / focusSequence / taskTable / ioChain / learning。
- 视觉配色严格遵循 Inspire 品牌标量（Starry Blues #10213E、
  Creative Blue #5DB2E2、Amethyst #625D9C 等）+ 统一精简页眉。
- 遵循全局开发约定：Jinja 内联样式隐患通过「类 + 安全拼接」规避（style 整串拼接输出）。
"""

import sys
import os
import re
import datetime
import yaml
from jinja2 import Environment, FileSystemLoader

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
SKILL_ROOT   = os.path.dirname(SCRIPT_DIR)
TEMPLATE_DIR = os.path.join(SKILL_ROOT, "templates")


# --------------------------------------------------------------------------- #
# 工具函数
# --------------------------------------------------------------------------- #
def load_yaml_robust(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    # 剥掉 ```yaml ... ``` 代码围栏
    cleaned = re.sub(r"^\s*```(?:yaml|yml)?\s*\n", "", raw, flags=re.MULTILINE)
    cleaned = re.sub(r"\n\s*```\s*$", "", cleaned, flags=re.MULTILINE)
    return yaml.safe_load(cleaned.strip())


def ensure_list(val):
    if not val:
        return []
    if isinstance(val, list):
        return val
    return [val]


def ensure_str(val) -> str:
    if val is None:
        return ""
    return str(val)


# --------------------------------------------------------------------------- #
# 执行主体样式（遵循 Inspire 品牌标量）
# --------------------------------------------------------------------------- #
def get_actor_styles(actor: str):
    a = (actor or "").lower().strip()
    if a in ("agent", "ai", "auto"):
        return {
            "icon": "🤖",
            "label": "Agent",
            "marker": "#5DB2E2",      # Creative Blue
            "text": "#1B6EA8",
            "bg": "rgba(93,178,226,0.10)",
            "border": "#9BD0EC",
        }
    if a in ("human", "manual", "人工"):
        return {
            "icon": "👤",
            "label": "人工",
            "marker": "#F59E0B",      # Warning
            "text": "#B45309",
            "bg": "rgba(245,158,11,0.10)",
            "border": "#FCD34D",
        }
    if a in ("hybrid", "mix", "mixed", "混合"):
        return {
            "icon": "🤝",
            "label": "混合执行",
            "marker": "#625D9C",      # Amethyst
            "text": "#4C4680",
            "bg": "rgba(98,93,156,0.10)",
            "border": "#B6B2DE",
        }
    return {
        "icon": "⚙️",
        "label": "—",
        "marker": "#64748B",
        "text": "#64748B",
        "bg": "rgba(100,116,139,0.10)",
        "border": "#CBD5E1",
    }


# --------------------------------------------------------------------------- #
# 主流程
# --------------------------------------------------------------------------- #
def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_task_breakdown.py <input.yaml> <output.html>")
        sys.exit(1)

    input_yaml, output_html = sys.argv[1], sys.argv[2]
    os.makedirs(os.path.dirname(os.path.abspath(output_html)), exist_ok=True)

    try:
        data = load_yaml_robust(input_yaml)
    except yaml.YAMLError as e:
        print(f"❌ YAML parse error: {e}")
        sys.exit(1)

    if not data or not isinstance(data, dict):
        print("❌ Invalid YAML data (not a dict).")
        sys.exit(1)

    meta = data.get("meta") or {}
    overview = data.get("overview") or {}
    legend = data.get("legend") or {}
    focus_drill = data.get("focusDrill") or {}
    learning = data.get("learning") or {}

    # ---- 端到端 stage chain：stages[].groups[].tasks[].actor 样式化 ---- #
    stages = []
    total_l5 = 0
    total_groups = 0
    actor_counts = {"agent": 0, "human": 0, "mixed": 0}
    focus_count = 0

    for i, stage in enumerate(ensure_list(data.get("stages"))):
        st_id = ensure_str(stage.get("id"))
        # 序号缺省用 order 或索引
        num = ensure_str(stage.get("num")) or ensure_str(stage.get("order") or (i + 1))
        # 序号补零（01, 02, ...）
        if num.isdigit() and not stage.get("num"):
            num = f"{int(num):02d}"
        groups = []
        for grp in ensure_list(stage.get("groups")):
            total_groups += 1
            tasks = []
            for t in ensure_list(grp.get("tasks")):
                actor = ensure_str(t.get("actor"))
                ast = get_actor_styles(actor)
                key = actor.lower()
                if key in actor_counts:
                    actor_counts[key] += 1
                tasks.append({
                    "id": ensure_str(t.get("id")),
                    "name": ensure_str(t.get("name")),
                    "actor": ast,
                })
                total_l5 += 1
            is_p0 = bool(grp.get("isP0"))
            if is_p0:
                focus_count += 1
            groups.append({
                "id": ensure_str(grp.get("id")),
                "name": ensure_str(grp.get("name")),
                "isP0": is_p0,
                "tasks": tasks,
            })
        stages.append({
            "id": st_id,
            "num": num,
            "name": ensure_str(stage.get("name")),
            "l5Count": ensure_str(stage.get("l5Count") or len([g for g in groups for _ in g["tasks"]])),
            "isFocus": bool(stage.get("isFocus")),
            "groups": groups,
        })

    # ---- legend：执行主体样式化 + 焦点标签 ---- #
    legend_execution = []
    for e in ensure_list(legend.get("execution")):
        ast = get_actor_styles(e.get("type"))
        legend_execution.append({
            "type": e.get("type"),
            "label": e.get("label", ast["label"]),
            "icon": ast["icon"],
            **ast,
        })

    legend_focus = None
    if legend.get("focusType") or legend.get("focusLabel"):
        legend_focus = {
            "label": ensure_str(legend.get("focusLabel") or legend.get("focusType", "P0")),
        }

    legend_convention = ensure_list(legend.get("convention"))

    # ---- focusDrill：before / evidence / after ---- #
    if focus_drill.get("before"):
        before = focus_drill["before"]
        focus_drill = {
            "before": before,
            "approach": ensure_str(focus_drill.get("approach", "")),
            "evidence": ensure_list(focus_drill.get("evidence")),
            "after": ensure_str(focus_drill.get("after", "")),
        }
    else:
        focus_drill = {"before": {}, "approach": "", "evidence": [], "after": ""}

    # ---- focusSequence ---- #
    focus_sequence = []
    for i, seq in enumerate(ensure_list(data.get("focusSequence"))):
        focus_sequence.append({
            "id": ensure_str(seq.get("id") or f"L5-{i+1}"),
            "name": ensure_str(seq.get("name")),
            "question": ensure_str(seq.get("question")),
        })

    # ---- taskTable：actor 样式化 ---- #
    task_table = []
    for row in ensure_list(data.get("taskTable")):
        actor = ensure_str(row.get("actor"))
        ast = get_actor_styles(actor)
        task_table.append({
            "l5": ensure_str(row.get("l5")),
            "inputs": ensure_str(row.get("inputs")),
            "outputs": ensure_str(row.get("outputs")),
            "ruleType": ensure_str(row.get("ruleType")),
            "exception": ensure_str(row.get("exception")),
            "actor": ast,
        })

    # ---- 渲染 ---- #
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    template = env.get_template("task_breakdown_layout.html")

    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    # 用自动统计覆盖 overview 数量，避免 YAML 手工填写不一致
    render_overview = dict(overview)
    render_overview["l3Count"] = len(stages)
    render_overview["l4Count"] = total_groups
    render_overview["l5Count"] = total_l5

    html = template.render(
        lang="zh-CN",
        title=ensure_str(meta.get("title", "端到端深度任务流程地图")),
        subtitle=ensure_str(meta.get("subtitle", "来自《任务流程挖掘清单》主表")),
        version=ensure_str(meta.get("version", "")),
        date=ensure_str(meta.get("date", "")),
        scenario_name=ensure_str(meta.get("scenarioName", "")),
        business_stage=ensure_str(meta.get("businessStage", "")),
        methodology=ensure_str(meta.get("methodology", "")),
        inputs=ensure_list(meta.get("inputs")),
        source_ref=ensure_str(meta.get("sourceRef", "")),
        kpi=ensure_list(meta.get("kpi")),
        overview=render_overview,
        legend_execution=legend_execution,
        legend_focus=legend_focus,
        legend_convention=legend_convention,
        stages=stages,
        reading_flow=ensure_list(data.get("readingFlow")),
        focusDrill=focus_drill,
        focus_sequence=focus_sequence,
        task_table=task_table,
        io_chain=ensure_list(data.get("ioChain")),
        learning=learning,
        generated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        stats={"total": total_l5, **actor_counts},
        raw_yaml=raw_yaml_content,
    )

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ Task Flow Breakdown generated → {output_html}")
    print(f"   Total L5: {total_l5} (Agent: {actor_counts['agent']}, Human: {actor_counts['human']}, Mixed: {actor_counts['mixed']})")
    print(f"   Stages: {len(stages)}, P0 focus groups: {focus_count}")


if __name__ == "__main__":
    main()
