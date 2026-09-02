"""
build_value_stream.py ── value-stream-mapper Compiler
将「L1 价值链与价值段总览 YAML」编译为「对齐 03-业务价值流图.jpg 风格的 HTML」。

Usage:
    python3 scripts/build_value_stream.py <input.yaml> <output.html>

设计要点：
- 以「价值流(列) → 价值段(卡) → 业务环节(聚焦卡内 links)」为骨架，呈现端到端 L1 价值流全貌。
- 据 meta.originalIdea 判定聚焦范围：连续聚焦段自动编号「聚焦范围 ①/②/…」，
  并在列头展示该列命中哪几个聚焦范围。
- 自动统计 价值流条数 / 价值段个数 / 聚焦段数 / 痛点个数（供顶部 chips）。
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

# 带圈序号 ① ② ③ … ㉛
CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳" \
          "㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛"


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


def circled(n: int) -> str:
    """1 → ①, 2 → ②, …。超出带圈字符范围则回退为 (n)。"""
    if 1 <= n <= len(CIRCLED):
        return CIRCLED[n - 1]
    return f"({n})"


def assign_focus_labels(streams):
    """按「连续聚焦段」为每个聚焦段生成 focusLabel，并收集各列的聚焦范围分组。

    规则：
    - 编号为**全局递增**（对应参考图 ①② 分组贯穿全链）；
    - 同一价值流内**相邻**的聚焦段共享同一个范围编号；
    - 跨价值流或中间**断档**（出现非聚焦段）则范围编号递增。
    - 若段已在 YAML 里显式给出 focusLabel，则使用显式值；否则自动编号。
    返回 focus_groups：{stream_id: [focusLabel, ...]}（供列头展示）。
    """
    group_counter = 0
    focus_groups = {}
    for stream in streams:
        sid = str(stream.get("id", ""))
        stream_focus_labels = []
        prev_was_focus = False   # 每条价值流内独立判定连续性
        for seg in ensure_list(stream.get("segments")):
            is_focus = bool(seg.get("focus"))
            if is_focus:
                if not prev_was_focus:
                    group_counter += 1   # 进入新的一段连续聚焦范围
                if seg.get("focusLabel"):
                    label = ensure_str(seg["focusLabel"])
                else:
                    label = f"聚焦范围 {circled(group_counter)}"
                seg["focusLabel"] = label
                if label not in stream_focus_labels:
                    stream_focus_labels.append(label)
                prev_was_focus = True
            else:
                prev_was_focus = False
        focus_groups[sid] = stream_focus_labels
    return focus_groups


def compute_stats(streams):
    vs = len(streams)
    segs = 0
    focus = 0
    pain = 0
    for s in streams:
        for seg in ensure_list(s.get("segments")):
            segs += 1
            if seg.get("focus"):
                focus += 1
            pain += len(ensure_list(seg.get("painPoints")))
    return {"valueStreams": vs, "valueSegments": segs,
            "focusSegments": focus, "painPoints": pain}


# --------------------------------------------------------------------------- #
# 主流程
# --------------------------------------------------------------------------- #
def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_value_stream.py <input.yaml> <output.html>")
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
    pain_types = ensure_list(data.get("painTypes")) or [
        {"id": "highTime",    "label": "高耗时",   "color": "#F5A623"},
        {"id": "seniority",   "label": "高经验",   "color": "#F5C518"},
        {"id": "freqError",   "label": "高频错误", "color": "#E5484D"},
        {"id": "bottleneck",  "label": "系统瓶颈", "color": "#3B82F6"},
    ]

    # ---- 价值流（列）与价值段（卡）排序 ---- #
    streams = ensure_list(data.get("valueStreams"))
    for s in streams:
        segs = ensure_list(s.get("segments"))
        segs.sort(key=lambda x: int(x.get("order", 0)))
        s["segments"] = segs
    streams.sort(key=lambda x: int(x.get("order", 0)))

    # ---- 聚焦范围编号 & 各列聚焦分组 ---- #
    focus_groups = assign_focus_labels(streams)
    for s in streams:
        s["focusGroups"] = focus_groups.get(str(s.get("id", "")), [])

    stats = compute_stats(streams)

    # ---- 渲染 ---- #
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    template = env.get_template("value_stream_layout.html")

    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    html = template.render(
        meta=meta,
        painTypes=pain_types,
        legend=legend,
        valueStreams=streams,
        stats=stats,
        generated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        raw_yaml=raw_yaml_content,
    )

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ 价值链与价值段总览 generated → {output_html}")
    print(f"   价值流 {stats['valueStreams']} 条 · 价值段 {stats['valueSegments']} 个 · "
          f"聚焦 {stats['focusSegments']} 段 · 痛点 {stats['painPoints']} 个")


if __name__ == "__main__":
    main()
