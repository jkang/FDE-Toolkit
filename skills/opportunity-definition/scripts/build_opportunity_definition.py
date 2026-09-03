"""
build_opportunity_definition.py ── opportunity-definition Compiler
将「5 要素 + 价值收益拆解 YAML」编译为「机会点定义报告」HTML。

Usage:
    python3 scripts/build_opportunity_definition.py <input.yaml> <output.html>

设计要点：
- 每个机会点一张卡：头部(名称+类型徽章+根因类型+能力匹配) + ①~⑤ 5 要素 + 价值收益拆解表。
- 内嵌「复制 YAML」：占位后字符串替换，避免 Jinja 转义破坏 YAML。
"""

import sys
import os
import re
import html
import datetime
import yaml
from jinja2 import Environment, FileSystemLoader

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SKILL_ROOT = os.path.dirname(SCRIPT_DIR)
TEMPLATE_DIR = os.path.join(SKILL_ROOT, "templates")
PLACEHOLDER = "RAW_YAML_PLACEHOLDER"


def load_yaml_robust(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    cleaned = re.sub(r"^\s*```(?:yaml|yml)?\s*\n", "", raw, flags=re.MULTILINE)
    cleaned = re.sub(r"\n\s*```\s*$", "", cleaned, flags=re.MULTILINE)
    return yaml.safe_load(cleaned.strip())


def normalize(data: dict) -> dict:
    meta = data.get("meta") or {}
    meta.setdefault("title", "机会点定义")
    meta.setdefault("date", datetime.date.today().isoformat())
    opps = data.get("opportunities") or []
    opps = sorted(opps, key=lambda x: int(x.get("order", 0)))
    assert len(opps) >= 1, "至少 1 个机会点"
    for o in opps:
        o.setdefault("type", "repetitive")
        o.setdefault("rootCauseType", "")
        o.setdefault("capabilityMatch", "")
        o.setdefault("valueBreakdown", [])
    return {"meta": meta, "opportunities": opps}


def render(data: dict, raw_yaml: str) -> str:
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    template = env.get_template("opportunity_definition_layout.html")
    placeholder_escaped = html.escape(PLACEHOLDER)
    out = template.render(**data)
    out = out.replace(placeholder_escaped, html.escape(raw_yaml))
    out = out.replace(PLACEHOLDER, html.escape(raw_yaml))
    return out


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: python3 build_opportunity_definition.py <input.yaml> <output.html>")
        sys.exit(2)
    in_path, out_path = sys.argv[1], sys.argv[2]
    with open(in_path, "r", encoding="utf-8") as f:
        raw_yaml = f.read()
    data = load_yaml_robust(in_path)
    data = normalize(data)
    out = render(data, raw_yaml)
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(out)
    n = len(data["opportunities"])
    print(f"✅ 机会点定义 generated → {out_path}")
    print(f"   机会点: {n} · 场景: {data['meta'].get('scenario','—')}")


if __name__ == "__main__":
    main()
