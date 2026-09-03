"""
build_value_stream.py ── value-stream-mapper Compiler
将「L1 价值流图 YAML」编译为「对齐 03-业务价值流图.jpg 风格的 HTML」。

Usage:
    python3 scripts/build_value_stream.py <input.yaml> <output.html>

设计要点（三段式）：
- 价值流(条带) → 价值段(横向列) → 业务环节(列内竖排卡)。
- 一个业务（如电商订舱）通常只有 1 条横向主价值流；价值段 = 横向列，
  每个价值段内有若干业务环节（竖排卡）。
- 据 meta.originalIdea 判定聚焦范围：以「价值段」为边界，把同一段内**相邻(连续)的聚焦环节**
  整体包成一个**聚焦框**（蓝描边大框 + 顶部「★ 聚焦范围 ①」标签），
  聚焦框自动**全局递增编号**；优先级标在框内环节卡上。
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


def assign_focus_groups(streams):
    """把「同一价值段内相邻(连续)的聚焦环节」聚成一个聚焦框，并全局递增编号。

    规则（对齐 03-业务价值流图.jpg 的焦点范围盒）：
    - 聚焦框以「价值段」为边界：一个框只包住同一段内相邻(连续)的 `focus: true` 环节；
    - 聚焦环节不跨价值段合并，也不与上下段合并；
    - 编号全局递增：按「价值流 → 价值段 → 段内聚焦框顺序」生成 ① ② ③…；
    - 段内被非聚焦环节隔开的聚焦环节属于不同的聚焦框（各自递增）。

    副作用：
    - 为每个 segment 写入 `items`：有序渲染序列，每项为
        {'kind':'group','group':{label,links}} (聚焦框) 或 {'kind':'link','link':{...}} (普通卡)；
    - 为每个 segment 写入 `focusGroups`：该段聚焦框列表；
    - 为每个聚焦环节 link 写入 `focusLabel`（聚焦框标签）。
    """
    group_counter = 0
    for stream in streams:
        for seg in ensure_list(stream.get("segments")):
            links = ensure_list(seg.get("links"))
            items = []
            groups = []
            i, n = 0, len(links)
            while i < n:
                link = links[i]
                if link.get("focus"):
                    # 收集该段内相邻(连续)的聚焦环节，聚成一框
                    run = []
                    while i < n and links[i].get("focus"):
                        run.append(links[i])
                        i += 1
                    # 确定聚焦框标签：优先用环节已有的显式 focusLabel，否则自动编号
                    if ensure_str(run[0].get("focusLabel")):
                        label = ensure_str(run[0]["focusLabel"])
                    else:
                        group_counter += 1
                        label = f"聚焦范围 {circled(group_counter)}"
                    for lk in run:
                        lk["focusLabel"] = label
                    grp = {"label": label, "links": run}
                    groups.append(grp)
                    items.append({"kind": "group", "group": grp})
                else:
                    items.append({"kind": "link", "link": link})
                    i += 1
            seg["items"] = items
            seg["focusGroups"] = groups
    return


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
# 纯业务语言防呆检查（防 AI/系统方案词泄漏进业务地图）
# --------------------------------------------------------------------------- #
# 违反 references/value_stream_prompts.md §2 的解决方案词。命中即告警（不阻断编译）。
DENY_WORDS = [
    "智能", "智慧", "AI", "大模型", "LLM", "Agent", "智能体",
    "机器人", "数字员工", "算法", "自动",
]
# 拉丁字母产品/系统名特征（如 E-Spot、IQAX、PlumSmart），命中即提示
LATIN_BRAND = re.compile(r"(?<![A-Za-z])(?=[A-Za-z])[A-Za-z]{2,}[A-Z][a-z]+[A-Za-z]*|"
                         r"\b[A-Z][a-z]+[A-Z][a-zA-Z]*\b")


def _scan_text(label: str, text: str, hits: list):
    if not text:
        return
    for w in DENY_WORDS:
        if w in text:
            hits.append(f"   · {label}：含方案词「{w}」→ “{text[:60]}…”")
    for m in LATIN_BRAND.finditer(text):
        hits.append(f"   · {label}：疑似产品/系统名「{m.group()}」→ “{text[:60]}…”")


def lint_business_purity(data: dict) -> int:
    """扫描业务内容字段中的解决方案词汇，返回命中数（不阻断编译）。"""
    hits = []
    meta = data.get("meta") or {}
    # meta.originalIdea 是客户原话，仅作聚焦依据，豁免检查
    _scan_text("meta.insight", meta.get("insight"), hits)
    for kpi in ensure_list(meta.get("kpi")):
        _scan_text("meta.kpi", kpi, hits)
    for stream in ensure_list(data.get("valueStreams")):
        _scan_text("valueStreams[].name", stream.get("name"), hits)
        _scan_text("valueStreams[].chain", stream.get("chain"), hits)
        for seg in ensure_list(stream.get("segments")):
            _scan_text("segments[].name", seg.get("name"), hits)
            _scan_text("segments[].chain", seg.get("chain"), hits)
            for link in ensure_list(seg.get("links")):
                _scan_text("links[].name", link.get("name"), hits)
                detail = link.get("detail") or {}
                _scan_text("definition", detail.get("definition"), hits)
                _scan_text("goal", detail.get("goal"), hits)
                _scan_text("reason", detail.get("reason"), hits)
    if hits:
        print("⚠️ [纯业务语言检查] 以下内容含解决方案词 / 疑似系统名（价值流图是业务地图，"
              "应只写业务语言；见 references/value_stream_prompts.md §2）：")
        for h in hits:
            print(h)
        print("   ↑ 建议人工复核并改为业务语言后再交付（本告警不阻断编译）。")
    return len(hits)


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

    # ---- 聚焦范围分组与编号（同一价值段内相邻聚焦环节聚成一框）& 渲染序列 ---- #
    assign_focus_groups(streams)

    stats = compute_stats(streams)

    # ---- 纯业务语言防呆检查（告警不阻断） ---- #
    lint_business_purity(data)

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
