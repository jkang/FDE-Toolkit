"""
build_process.py ── business-process-deep-analyzer Compiler
将「L3/L4 现状泳道图 YAML」编译为「泳道图 + 每环节痛点标注 + 任务明细表」HTML。

Usage:
    python3 scripts/build_process.py <input.yaml> <output.html>

设计要点：
- 以「列=L3 子环节(stage) × 行=角色泳道(lane) × 格=L4 任务/决策(step)」为骨架。
- 每个 step 通过 painTypes 标注现状痛点（高耗时/高认知负荷/高频错误/来回往复/系统瓶颈）。
- 泳道图下方渲染任务明细表（编号/所属业务流程/任务·决策/角色/输入→输出/业务规则及固化度/痛点）。
- 遵循全局开发约定：Jinja 内联样式隐患通过「类 + 安全拼接」规避；autoescape 开启。
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

# 痛点默认五色（若 YAML 未提供 painTypes 时的兜底）
DEFAULT_PAIN_TYPES = [
    {"id": "highTime",   "label": "高耗时",     "color": "#EF4444"},
    {"id": "cognitive",  "label": "高认知负荷", "color": "#F59E0B"},
    {"id": "freqError",  "label": "高频错误",   "color": "#3B82F6"},
    {"id": "backForth",  "label": "来回往复",   "color": "#625D9C"},
    {"id": "bottleneck", "label": "系统瓶颈",   "color": "#0E7490"},
]


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


def build_grid(stages, lanes, steps):
    """空 grid[lane_idx][stage_idx] = [step, ...]，再把每个 step 插入对应交叉格。

    定位失败（stageId/laneId 非法）的 step 归入首列首行，避免丢失。
    返回 (grid, table_rows)。grid 用 1-based order 对齐。
    """
    stage_order = [s.get("order") for s in stages]
    lane_order = [l.get("order") for l in lanes]
    stage_by_id = {s.get("id"): s for s in stages}
    lane_by_id = {l.get("id"): l for l in lanes}

    # grid[si][li]
    grid = [[[] for _ in range(len(stages))] for _ in range(len(lanes))]

    steps = sorted(steps, key=lambda x: int(x.get("order", 0)))
    table_rows = []
    pain_stats = {t["id"]: 0 for t in DEFAULT_PAIN_TYPES}
    pain_stats["total"] = 0

    for step in steps:
        sid, lid = step.get("stageId"), step.get("laneId")
        if sid in stage_by_id and lid in lane_by_id:
            si = stage_order.index(stage_by_id[sid]["order"])
            li = lane_order.index(lane_by_id[lid]["order"])
        else:
            si, li = 0, 0
            sid = stage_by_id.get(stages[0]["id"], {}).get("id")
            lid = lane_by_id.get(lanes[0]["id"], {}).get("id")

        norm = {
            "id": ensure_str(step.get("id", "")),
            "order": int(step.get("order", 0)),
            "name": ensure_str(step.get("name", "")),
            "description": ensure_str(step.get("description", "")),
            "duration": ensure_str(step.get("duration", "")),
            "source": ensure_str(step.get("source", "")),
            "businessRule": ensure_str(step.get("businessRule", "")),
            "ruleSolidity": ensure_str(step.get("ruleSolidity", "")),
            "inputs": ensure_list(step.get("inputs")),
            "outputs": ensure_list(step.get("outputs")),
            "pains": ensure_list(step.get("pains")),
            "stageName": stage_by_id.get(sid, {}).get("name", ""),
            "laneName": lane_by_id.get(lid, {}).get("name", ""),
        }
        grid[li][si].append(norm)
        table_rows.append(norm)

        for p in norm["pains"]:
            if p in pain_stats:
                pain_stats[p] += 1
            pain_stats["total"] += 1

    return grid, table_rows, pain_stats


# --------------------------------------------------------------------------- #
# 主流程
# --------------------------------------------------------------------------- #
def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_process.py <input.yaml> <output.html>")
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
    pain_types = ensure_list(data.get("painTypes")) or DEFAULT_PAIN_TYPES

    # ---- stages (列) 与 lanes (行) 排序 ---- #
    stages = ensure_list(data.get("stages"))
    stages.sort(key=lambda x: int(x.get("order", 0)))
    lanes = ensure_list(data.get("lanes"))
    lanes.sort(key=lambda x: int(x.get("order", 0)))

    # ---- steps (格) 建泳道网格 + 任务表行 ---- #
    steps = ensure_list(data.get("steps"))
    grid, table_rows, pain_stats = build_grid(stages, lanes, steps)

    environment_defaults = {
        "flowNote": "🔄 流程走向",
        "ruleNote": "⚠️ 业务规则及固化度",
        "painLabel": "该环节痛点",
    }
    merged_legend = {**environment_defaults, **legend}

    # ---- 渲染 ---- #
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    template = env.get_template("process_layout.html")

    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    html = template.render(
        meta=meta,
        legend=merged_legend,
        painTypes=pain_types,
        stages=stages,
        lanes=lanes,
        grid=grid,
        steps=table_rows,
        stage_count=len(stages),
        lane_count=len(lanes),
        pain_stats=pain_stats,
        generated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        raw_yaml=raw_yaml_content,
    )

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ 现状泳道图 generated → {output_html}")
    print(f"   L3 子环节: {len(stages)} · 角色泳道: {len(lanes)} · L4 任务: {len(table_rows)}")
    print(f"   痛点统计: 高耗时={pain_stats.get('highTime',0)} 高认知负荷={pain_stats.get('cognitive',0)} "
          f"高频错误={pain_stats.get('freqError',0)} 来回往复={pain_stats.get('backForth',0)} "
          f"系统瓶颈={pain_stats.get('bottleneck',0)} (总计={pain_stats.get('total',0)})")


if __name__ == "__main__":
    main()
