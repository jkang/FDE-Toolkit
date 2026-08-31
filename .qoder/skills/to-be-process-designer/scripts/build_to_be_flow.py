"""
build_to_be_flow.py ── to-be-process-designer Compiler
将「AI 场景 To-be 流程 YAML」编译为「泳道式 HTML 流程图」。

Usage:
    python3 scripts/build_to_be_flow.py <input.yaml> <output.html>

设计要点：
- 以「Phase(业务阶段,列) × Lane(角色泳道,行)」为骨架，交叉格内落 L5 深度任务卡片。
- 视觉配色遵循 Inspire 品牌标量与统一精简页眉。
- 遵循全局开发约定：Jinja 内联样式隐患通过「类 + 安全拼接」规避。
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
# Actor / 价值锚定样式（遵循 Inspire 品牌标量）
# --------------------------------------------------------------------------- #
def get_actor_styles(actor: str):
    """执行主体 → (icon, label, 主色, 文字色, 背景类)。"""
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
            "label": "混合",
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


# 价值锚定 → 配色（尽量与上游 KPI 语义对齐，未识别则回退中性）
VALUE_ANCHOR_COLORS = {
    "分货效率":     {"fg": "#00524C", "bg": "rgba(0,82,76,0.10)", "border": "#7FB6B0"},  # Myrtle Deep Green
    "分仓有货率":   {"fg": "#10213E", "bg": "rgba(16,33,62,0.08)", "border": "#B7C2D5"}, # Starry Blues
    "库存周转":     {"fg": "#625D9C", "bg": "rgba(98,93,156,0.10)", "border": "#C3C0E4"},# Amethyst
    "库存周转率":   {"fg": "#625D9C", "bg": "rgba(98,93,156,0.10)", "border": "#C3C0E4"},
    "新鲜度":       {"fg": "#B45309", "bg": "rgba(245,158,11,0.10)", "border": "#FCD34D"},# Warning
    "物流时效":     {"fg": "#1B6EA8", "bg": "rgba(93,178,226,0.10)", "border": "#9BD0EC"},# Creative Blue
    "分货效率提升": {"fg": "#00524C", "bg": "rgba(0,82,76,0.10)", "border": "#7FB6B0"},
    "提高分货效率": {"fg": "#00524C", "bg": "rgba(0,82,76,0.10)", "border": "#7FB6B0"},
    "提高分仓有货率": {"fg": "#10213E", "bg": "rgba(16,33,62,0.08)", "border": "#B7C2D5"},
    "提高库存周转率": {"fg": "#625D9C", "bg": "rgba(98,93,156,0.10)", "border": "#C3C0E4"},
    "提高新鲜度":   {"fg": "#B45309", "bg": "rgba(245,158,11,0.10)", "border": "#FCD34D"},
    "降低跨仓履约": {"fg": "#1B6EA8", "bg": "rgba(93,178,226,0.10)", "border": "#9BD0EC"},
}


def get_anchor_style(anchor: str):
    c = VALUE_ANCHOR_COLORS.get((anchor or "").strip())
    if c:
        return c
    return {"fg": "#64748B", "bg": "rgba(100,116,139,0.10)", "border": "#CBD5E1"}


# HITL 焦点 → 徽标配色
HITL_FOCUS_STYLES = {
    "low":    {"label": "低", "fg": "#64748B", "bg": "rgba(100,116,139,0.10)", "border": "#CBD5E1"},
    "medium": {"label": "中", "fg": "#B45309", "bg": "rgba(245,158,11,0.10)", "border": "#FCD34D"},
    "high":   {"label": "高", "fg": "#B91C1C", "bg": "rgba(239,68,68,0.10)", "border": "#FCA5A5"},
    "gate":   {"label": "必停", "fg": "#B91C1C", "bg": "rgba(239,68,68,0.10)", "border": "#FCA5A5"},
}


def get_hitl_focus(level: str):
    return HITL_FOCUS_STYLES.get((level or "").lower().strip(), HITL_FOCUS_STYLES["low"])


# --------------------------------------------------------------------------- #
# 主流程
# --------------------------------------------------------------------------- #
def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_to_be_flow.py <input.yaml> <output.html>")
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
    legend = data.get("legend") or {}

    # ---- phases (列) ---- #
    phases = ensure_list(data.get("phases"))
    phases = sorted(phases, key=lambda p: int(p.get("order", 0)))
    phase_ids = [p.get("id") for p in phases]

    # ---- lanes (行) ---- #
    lanes = ensure_list(data.get("lanes"))
    lanes = sorted(lanes, key=lambda l: int(l.get("order", 0)))
    lane_ids = [l.get("id") for l in lanes]

    # ---- tasks ---- #
    tasks = ensure_list(data.get("tasks"))

    # ---- 构建泳道网格: grid[lane_idx][phase_idx] -> list[task card] ---- #
    grid = []
    for _ in lanes:
        grid.append([[] for _ in phases])

    total_tasks = 0
    actor_counts = {"agent": 0, "human": 0, "hybrid": 0}

    for task in tasks:
        lane_id = task.get("laneId")
        phase_id = task.get("phaseId")
        if lane_id not in lane_ids or phase_id not in phase_ids:
            # 定位失败的深度任务归属到首行首列，避免丢失
            li = 0
            pi = 0
        else:
            li = lane_ids.index(lane_id)
            pi = phase_ids.index(phase_id)

        actor = ensure_str(task.get("actor"))
        ast = get_actor_styles(actor)
        key = actor.lower()
        if key in actor_counts:
            actor_counts[key] += 1

        # 价值锚定胶囊
        anchors = []
        for a in ensure_list(task.get("valueAnchors")):
            st = get_anchor_style(a)
            anchors.append({"text": ensure_str(a), **st})

        # HITL 焦点徽标
        hf = get_hitl_focus(ensure_str(task.get("hitlFocus")))

        card = {
            "id": ensure_str(task.get("id")),
            "name": ensure_str(task.get("name")),
            "actor": ast,
            "inputs": ensure_list(task.get("inputs")),
            "outputs": ensure_list(task.get("outputs")),
            "ruleType": ensure_str(task.get("ruleType")),
            "anchors": anchors,
            "hitlFocus": hf,
            "exception": ensure_str(task.get("exception")),
            "description": ensure_str(task.get("description")),
        }
        grid[li][pi].append(card)
        total_tasks += 1

    # ---- 每列任务统计 (供页眉) ---- #
    phase_stats = []
    for pi, ph in enumerate(phases):
        n = 0
        for li in range(len(lanes)):
            n += len(grid[li][pi])
        phase_stats.append({"id": ph.get("id"), "name": ph.get("name"), "count": n})

    # ---- legend 处理 ---- #
    execution = []
    for e in ensure_list(legend.get("execution")):
        ast = get_actor_styles(e.get("type"))
        execution.append({"type": e.get("type"), "label": e.get("label"), "icon": ast["icon"], **ast})

    hitl_legend = []
    for h in ensure_list(legend.get("hitlFocus")):
        st = get_hitl_focus(h.get("level"))
        hitl_legend.append({"level": h.get("level"), "label": h.get("label"), "desc": h.get("desc"), **st})

    # ---- 渲染 ---- #
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    template = env.get_template("to_be_flow_layout.html")

    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    html = template.render(
        lang="zh-CN",
        title=ensure_str(meta.get("title", "AI 场景 To-be 流程")),
        subtitle=ensure_str(meta.get("businessStage", "")),
        version=ensure_str(meta.get("version", "")),
        date=ensure_str(meta.get("date", "")),
        scenario_name=ensure_str(meta.get("scenarioName", "")),
        methodology=ensure_str(meta.get("methodology", "")),
        inputs=ensure_list(meta.get("inputs")),
        source_ref=ensure_str(meta.get("sourceRef", "")),
        kpi=ensure_list(meta.get("kpi")),
        legend_execution=execution,
        legend_hitl=hitl_legend,
        flow_conventions=ensure_list(legend.get("flowConventions")),
        value_anchors=ensure_list(legend.get("valueAnchors")),
        phases=phases,
        lanes=lanes,
        grid=grid,
        lane_count=len(lanes),
        phase_count=len(phases),
        phase_stats=phase_stats,
        flow_notes=ensure_list(data.get("flowNotes")),
        return_nodes=ensure_list(data.get("returnNodes")),
        generated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        stats={"total": total_tasks, **actor_counts},
        raw_yaml=raw_yaml_content,
    )

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ To-be Flow Diagram generated → {output_html}")
    print(f"   Total Tasks: {total_tasks} (Agent: {actor_counts['agent']}, Human: {actor_counts['human']}, Hybrid: {actor_counts['hybrid']})")
    print(f"   Phases: {len(phases)} × Lanes: {len(lanes)}")


if __name__ == "__main__":
    main()
