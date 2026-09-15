"""
build_process.py ── business-process-deep-analyzer Compiler
将「L3/L4 现状泳道图 YAML」编译为「泳道图 + 每环节痛点标注 + 任务明细表」HTML。

Usage:
    python3 scripts/build_process.py <input.yaml> <output.html>

设计要点：
- 以「列=L3 子环节(stage) × 行=角色泳道(lane) × 格=L4 任务/决策(step)」为骨架。
- 角色泳道按「泳道内最早发生的 L4 活动序号」自动重排：第一排 = 最先发生的活动，
  自上而下活动序号尽量递增，保证阅读顺序自然（见 order_lanes_by_earliest_step）。
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


def normalize_systems(val):
    """把 step.systems 归一为 [{name, upgrade}, ...]。

    支持两种写法：
      - 字符串列表：["金蝶云之家", "花红WMS"]
      - 对象列表：[{name: "金蝶云之家"}, {name: "花红WMS", upgrade: true}]
    空/缺失 → []（表示该活动无系统支撑）。
    """
    out = []
    for item in ensure_list(val):
        if isinstance(item, dict):
            name = ensure_str(item.get("name", ""))
            upgrade = bool(item.get("upgrade", False))
        else:
            name = ensure_str(item)
            upgrade = False
        if name:
            out.append({"name": name, "upgrade": upgrade})
    return out


def resolve_system_level(step: dict, systems: list) -> str:
    """系统支撑等级：supported（有系统支撑）/ partial（部分支撑）/ none（无系统支撑）。

    优先取显式 systemLevel；缺省时按 systems 是否为空推断（有→supported，无→none）。
    """
    level = ensure_str(step.get("systemLevel", "")).strip().lower()
    if level in ("supported", "partial", "none"):
        return level
    return "supported" if systems else "none"


def normalize_order(items):
    """把 items 的 order 归一为 1..N（按当前列表顺序）。

    保证模板/网格用 `order - 1` 做定位时稳定可靠（不依赖 YAML 里 order 是否连续）。
    """
    for i, it in enumerate(items, start=1):
        it["order"] = i
    return items


def order_lanes_by_earliest_step(lanes, steps):
    """按「泳道内最早发生的 L4 活动序号」升序重排角色泳道（本 Skill 的阅读顺序铁律）。

    目的：第一排泳道承载**最先发生**的活动，其余泳道按各自最早活动的先后依次向下，
    使自上而下阅读时活动序号尽可能递增，避免「先发生的活动被排在下面、序号来回跳」的别扭观感。
    - 有活动的泳道：按其最小 `step.order` 升序；
    - 无活动的泳道：排在最后（保持原始相对顺序）。
    重排后把 lane.order 归一为 1..N，供网格按 `order - 1` 定位。
    """
    earliest = {}
    for st in steps:
        lid = st.get("laneId")
        try:
            o = int(st.get("order", 0))
        except (TypeError, ValueError):
            o = 0
        if lid not in earliest or o < earliest[lid]:
            earliest[lid] = o

    def sort_key(pair):
        idx, lane = pair
        lid = lane.get("id")
        if lid in earliest:
            return (0, earliest[lid], idx)
        return (1, float("inf"), idx)

    ordered = [lane for _, lane in sorted(enumerate(lanes), key=sort_key)]
    return normalize_order(ordered)


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

        systems = normalize_systems(step.get("systems"))
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
            "systems": systems,
            "systemLevel": resolve_system_level(step, systems),
            "systemNote": ensure_str(step.get("systemNote", "")),
            "hasSystemInfo": ("systems" in step) or ("systemLevel" in step),
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
    stages = normalize_order(stages)

    lanes = ensure_list(data.get("lanes"))
    lanes.sort(key=lambda x: int(x.get("order", 0)))

    # ---- steps (格) 先就绪，供泳道排序使用 ---- #
    steps = ensure_list(data.get("steps"))

    # 角色泳道按「最早活动序号」自动重排：第一排 = 最先发生的活动，自上而下序号尽量递增
    lanes = order_lanes_by_earliest_step(lanes, steps)

    # ---- steps (格) 建泳道网格 + 任务表行 ---- #
    grid, table_rows, pain_stats = build_grid(stages, lanes, steps)

    # 系统支撑统计（用于图例与顶部基线）
    has_systems = any(s.get("systems") for s in table_rows)
    sys_supported = sum(1 for s in table_rows if s.get("systemLevel") == "supported")
    sys_partial = sum(1 for s in table_rows if s.get("systemLevel") == "partial")
    sys_none = sum(1 for s in table_rows if s.get("systemLevel") == "none")
    sys_stats = {
        "supported": sys_supported,
        "partial": sys_partial,
        "none": sys_none,
        "total": len(table_rows),
    }

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
        has_systems=has_systems,
        sys_stats=sys_stats,
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
    print(f"   系统支撑: 有系统={sys_stats['supported']} 部分支撑={sys_stats['partial']} "
          f"无系统={sys_stats['none']} (总计={sys_stats['total']})")


if __name__ == "__main__":
    main()
