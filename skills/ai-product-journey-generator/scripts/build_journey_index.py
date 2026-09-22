#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ai-product-journey-generator · 旅程总览页编译

扫描 `to-be-journeys/` 目录下的全部 `*-To-be旅程.yaml`，汇总为一张总览页，
逐条链接到对应的 `*-To-be旅程.html`。

用法:
    python3 build_journey_index.py <to-be-journeys目录> <输出.html>
"""
import os
import re
import sys
import glob
import datetime
import yaml
from jinja2 import Environment, FileSystemLoader

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "templates")


def load_yaml(path):
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read().strip()
    if raw.startswith("```"):
        m = re.search(r"^```\w*\n(.*?)\n```$", raw, re.DOTALL)
        raw = m.group(1) if m else raw
    return yaml.safe_load(raw) or {}


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    src_dir, out_path = sys.argv[1], sys.argv[2]
    if not os.path.isdir(src_dir):
        print(f"❌ 未找到目录: {src_dir}")
        sys.exit(1)

    yamls = sorted(glob.glob(os.path.join(src_dir, "*-To-be旅程.yaml")))
    items = []
    for y in yamls:
        data = load_yaml(y)
        meta = data.get("meta") or {}
        jr = data.get("journey") or {}
        stages = data.get("stages") or []
        items.append({
            "title": data.get("title", ""),
            "persona": meta.get("persona", ""),
            "scenario": meta.get("scenarioName", ""),
            "jobStory": jr.get("jobStory", ""),
            "start": jr.get("start", ""),
            "end": jr.get("end", ""),
            "stageCount": len(stages),
            "actionCount": sum(len(s.get("actions", []) or []) for s in stages if isinstance(s, dict)),
            "html": os.path.basename(y).replace(".yaml", ".html"),
        })

    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    html = env.get_template("journey_index.html").render(
        items=items,
        count=len(items),
        generated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    )
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✅ 总览页已生成：{out_path}（{len(items)} 条 journey）")


if __name__ == "__main__":
    main()
