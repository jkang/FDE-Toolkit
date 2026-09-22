"""
build_concept.py ── agentic-product-concept-designer Compiler
将「产品概念设计 YAML」编译为「产品概念设计 · 客户确认稿」HTML。

Usage:
    python3 scripts/build_concept.py <input.yaml> <output.html>

设计要点：
- 6 段骨架：① 产品愿景 → ② To-be 流程总览 → ③ AI 与人分工表 → ④ 第一期范围与试点
  → ⑤ 落地路线图 → ⑥ 客户确认事项；顶部 hero（产品名 + 定位 + chips）。
- 内嵌「复制 YAML」：把原始 YAML 注入隐藏 textarea（先渲染占位，再字符串替换，避免 Jinja 转义破坏）。
- 遵循全局开发约定：autoescape 开启，字段缺失时安全降级。
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

VALID_SCOPE = {"mvp", "partial", "next", "later"}
VALID_KIND = {"auto", "hybrid", "manual"}


def load_yaml_robust(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    cleaned = re.sub(r"^\s*```(?:yaml|yml)?\s*\n", "", raw, flags=re.MULTILINE)
    cleaned = re.sub(r"\n\s*```\s*$", "", cleaned, flags=re.MULTILINE)
    return yaml.safe_load(cleaned.strip())


def normalize(data: dict) -> dict:
    meta = data.get("meta") or {}
    meta.setdefault("product", "产品概念设计")
    meta.setdefault("title", "产品概念设计")
    meta.setdefault("version", "v1.0")
    meta.setdefault("date", datetime.date.today().isoformat())
    meta.setdefault("basis", "")

    hero = data.get("hero") or {}
    hero.setdefault("product", meta["product"])
    hero.setdefault("tagline", "")
    hero.setdefault("chips", [])

    vision = data.get("vision") or {}
    vision.setdefault("statement", "")
    vision.setdefault("lead", "")
    vision.setdefault("principles", [])

    stages = data.get("stages") or []
    for s in stages:
        s.setdefault("scope", "")
        if s["scope"] and s["scope"] not in VALID_SCOPE:
            s["scope"] = ""
        s.setdefault("scopeLabel", "")
        s.setdefault("full", "")
        s.setdefault("human", "")
        s.setdefault("nonAi", "")
        for f in (s.get("ai") or []):
            f.setdefault("kind", "auto")
            if f["kind"] not in VALID_KIND:
                f["kind"] = "auto"
            f.setdefault("mvp", False)

    division = data.get("division") or []
    for d in division:
        d.setdefault("full", "")
        d.setdefault("scope", "later")
        if d["scope"] not in {"now", "next", "later"}:
            d["scope"] = "later"

    phase1 = data.get("phase1") or {}
    phase1.setdefault("lead", "")
    phase1.setdefault("focus", [])
    for f in phase1["focus"]:
        f.setdefault("subtitle", "")
        f.setdefault("rows", [])
        f.setdefault("output", "")
    phase1.setdefault("pilot", None)

    roadmap = data.get("roadmap") or []
    for r in roadmap:
        r.setdefault("tag", "")
        r.setdefault("title", "")
        for row in (r.get("rows") or []):
            row.setdefault("hl", False)

    confirm = data.get("confirm") or []
    for c in confirm:
        c.setdefault("impact", "")
        c.setdefault("owner", "")

    assert stages, "stages 不能为空：至少一个 To-be 阶段"
    assert confirm, "confirm 不能为空：客户确认事项至少一条"
    return {
        "meta": meta, "hero": hero, "vision": vision, "stages": stages,
        "flowFoot": data.get("flowFoot") or [], "division": division,
        "phase1": phase1, "roadmap": roadmap, "confirm": confirm,
    }


def render(data: dict, raw_yaml: str) -> str:
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    template = env.get_template("concept_layout.html")
    out = template.render(**data)
    out = out.replace(html.escape(PLACEHOLDER), html.escape(raw_yaml))
    out = out.replace(PLACEHOLDER, html.escape(raw_yaml))
    return out


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: python3 build_concept.py <input.yaml> <output.html>")
        sys.exit(2)
    in_path, out_path = sys.argv[1], sys.argv[2]

    with open(in_path, "r", encoding="utf-8") as f:
        raw_yaml = f.read()

    data = normalize(load_yaml_robust(in_path))
    out = render(data, raw_yaml)

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(out)
    print(f"✅ 已生成：{out_path}")


if __name__ == "__main__":
    main()
