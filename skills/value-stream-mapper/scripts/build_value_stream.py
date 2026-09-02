"""
build_value_stream.py ── value-stream-mapper Compiler
将「L1 价值流图 YAML」编译为「对齐 03-业务价值流图.jpg 风格的 HTML」。

Usage:
    python3 scripts/build_value_stream.py <input.yaml> <output.html>

设计要点（三段式）：
- 价值流(条带) → 价值段(横向列) → 业务环节(列内竖排卡)。
- 一个业务（如电商订舱）通常只有 1 条横向主价值流；价值段 = 横向列，
  每个价值段内有若干业务环节（竖排卡）。
- 据 meta.originalIdea 判定聚焦范围：以「业务环节卡」为粒度，
  连续聚焦卡自动编号「聚焦范围 ①/②/…」，★ 徽章标在聚焦卡上。
- 自动统计 价值流条数 / 价值段个数 / 业务环节数 / 聚焦环节数（供顶部 chips）。
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
    """按「连续聚焦的业务环节卡」为每个聚焦卡生成 focusLabel，并收集各列聚焦分组。

    规则：
    - 编号为**全局递增**（对应参考图 ①② 分组贯穿全链）；
    - 按「价值流 → 价值段(列) → 业务环节(卡)」的顺序遍历所有卡；
    - 相邻的聚焦卡共享同一个范围编号；中间**断档**（出现非聚焦卡）则范围编号递增。
    - 若卡已在 YAML 里显式给出 focusLabel，则使用显式值；否则自动编号。
    返回 focus_groups：{column_id: [focusLabel, ...]}（供列头展示，可选）。
    """
    group_counter = 0
    focus_groups = {}
    prev_was_focus = False
    for stream in streams:
        for seg in ensure_list(stream.get("segments")):
            col_id = str(seg.get("id", ""))
            col_focus_labels = []
            col_has_any = False
            for link in ensure_list(seg.get("links")):
                is_focus = bool(link.get("focus"))
                if is_focus:
                    if not prev_was_focus:
                        group_counter += 1   # 进入新的一段连续聚焦范围
                    if link.get("focusLabel"):
                        label = ensure_str(link["focusLabel"])
                    else:
                        label = f"聚焦范围 {circled(group_counter)}"
                    link["focusLabel"] = label
                    if label not in col_focus_labels:
                        col_focus_labels.append(label)
                    prev_was_focus = True
                    col_has_any = True
                else:
                    prev_was_focus = False
            # 仅当列内存在聚焦卡时记录（列头可展示该列命中哪些聚焦范围）
            if col_has_any:
                focus_groups[col_id] = col_focus_labels
    return focus_groups


def compute_stats(streams):
    vs = len(streams)
    segs = 0
    links = 0
    focus_links = 0
    for s in streams:
        for seg in ensure_list(s.get("segments")):
            segs += 1
            for link in ensure_list(seg.get("links")):
                links += 1
                if link.get("focus"):
                    focus_links += 1
    return {"valueStreams": vs, "valueSegments": segs,
            "businessLinks": links, "focusLinks": focus_links}


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

    # ---- 价值流(条带) → 价值段(列) → 业务环节(卡) 排序 ---- #
    streams = ensure_list(data.get("valueStreams"))
    for s in streams:
        segs = ensure_list(s.get("segments"))
        for seg in segs:
            links = ensure_list(seg.get("links"))
            links.sort(key=lambda x: int(x.get("order", 0)))
            seg["links"] = links
        segs.sort(key=lambda x: int(x.get("order", 0)))
        s["segments"] = segs
    streams.sort(key=lambda x: int(x.get("order", 0)))

    # ---- 聚焦范围编号（业务环节卡粒度，连续编号） & 各列聚焦分组 ---- #
    focus_groups = assign_focus_labels(streams)
    for s in streams:
        for seg in ensure_list(s.get("segments")):
            col_id = str(seg.get("id", ""))
            seg["focusGroups"] = focus_groups.get(col_id, [])

    stats = compute_stats(streams)

    # ---- 渲染 ---- #
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    template = env.get_template("value_stream_layout.html")

    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    html = template.render(
        meta=meta,
        legend=legend,
        valueStreams=streams,
        stats=stats,
        generated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        raw_yaml=raw_yaml_content,
    )

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ 价值流图 generated → {output_html}")
    print(f"   价值流 {stats['valueStreams']} 条 · 价值段 {stats['valueSegments']} 个 · "
          f"业务环节 {stats['businessLinks']} 个 · 聚焦环节 {stats['focusLinks']} 个")


if __name__ == "__main__":
    main()
