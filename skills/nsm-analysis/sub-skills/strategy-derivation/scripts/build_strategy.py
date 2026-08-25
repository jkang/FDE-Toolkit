#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import yaml
import re
import datetime
from jinja2 import Environment, FileSystemLoader

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
SKILL_ROOT   = os.path.dirname(SCRIPT_DIR)
TEMPLATE_DIR = os.path.join(SKILL_ROOT, "templates")

def load_yaml_robust(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    # Handle LLM markdown blocks
    cleaned = re.sub(r"^\s*```(?:yaml|yml)?\s*\n", "", raw, flags=re.MULTILINE)
    cleaned = re.sub(r"\n\s*```\s*$", "", cleaned, flags=re.MULTILINE)
    return yaml.safe_load(cleaned.strip())

def ensure_list(val) -> list:
    if not val: return []
    if isinstance(val, list): return val
    return [val]

def ensure_str(val) -> str:
    return str(val) if val is not None else ""

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_strategy.py <input.yaml> <output.html>")
        sys.exit(1)

    input_yaml, output_html = sys.argv[1], sys.argv[2]
    os.makedirs(os.path.dirname(os.path.abspath(output_html)), exist_ok=True)

    try:
        data = load_yaml_robust(input_yaml)
    except Exception as e:
        print(f"❌ YAML parse error: {e}")
        sys.exit(1)

    if not data or not isinstance(data, dict):
        print("❌ Invalid YAML data.")
        sys.exit(1)

    # Pre-process data for template
    nsm = data.get("nsm", {})
    kpis = ensure_list(data.get("kpi_pyramid", []))
    strategies = ensure_list(data.get("strategies", []))

    # Set default color classes if missing
    for dimension in kpis:
        d_type = dimension.get("type", "").lower()
        if "增长" in d_type or "growth" in d_type:
            dimension["color_class"] = "bg-blue-500"
        elif "效率" in d_type or "efficiency" in d_type:
            dimension["color_class"] = "bg-brand-500"
        elif "质量" in d_type or "quality" in d_type:
            dimension["color_class"] = "bg-emerald-500"
        elif "健康" in d_type or "health" in d_type:
            dimension["color_class"] = "bg-amber-500"

    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=False)
    try:
        template = env.get_template("derivation_layout.html")
    except Exception as e:
        print(f"❌ Template error: {e}")
        sys.exit(1)

    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    html = template.render(
        lang="zh-CN",
        title=ensure_str(data.get("title", "战略与指标推导")),
        planning_cycle=ensure_str(data.get("planning_cycle", "2025-2026")),
        generated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        nsm=nsm,
        kpis=kpis,
        strategies=strategies,
        raw_yaml=raw_yaml_content,
    )

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ Strategy Report generated → {output_html}")

if __name__ == "__main__":
    main()
