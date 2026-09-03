"""
build_problem_definition.py ── problem-definition Compiler
将「8 要素业务问题定义 YAML」编译为「问题定义报告」HTML。

Usage:
    python3 scripts/build_problem_definition.py <input.yaml> <output.html>

设计要点：
- 以「①一句话问题描述 + ②角色场景 + ③问题 + ④根因 + ⑤频度 + ⑥影响范围 + ⑦单次影响 + ⑧累计影响」为骨架。
- 顶部 meta 显示标题/元信息 chips；一条 oneLiner callout；底部 summary 小结区。
- 内嵌「复制 YAML」：把原始 YAML 注入隐藏 textarea（先渲染占位，再字符串替换，避免 Jinja 转义破坏）。
- 遵循全局开发约定：autoescape 开启，风格安全拼接。
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
    meta.setdefault("title", "业务问题定义")
    meta.setdefault("oneLiner", "")
    meta.setdefault("date", datetime.date.today().isoformat())

    elements = data.get("elements") or []
    elements = sorted(elements, key=lambda x: int(x.get("order", 0)))

    summary = data.get("summary") or {}
    n_elems = len(elements)
    assert n_elems >= 8, f"8 要素应为 8 个，当前 {n_elems} 个"
    return {"meta": meta, "elements": elements, "summary": summary}


def render(data: dict, raw_yaml: str) -> str:
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    template = env.get_template("problem_definition_layout.html")
    # 用 HTML 实体化的原始 YAML 再反向替换回来，避免 Jinja 转义破坏 YAML 内容
    placeholder_escaped = html.escape(PLACEHOLDER)
    out = template.render(**data)
    out = out.replace(placeholder_escaped, html.escape(raw_yaml))
    out = out.replace(PLACEHOLDER, html.escape(raw_yaml))
    return out


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: python3 build_problem_definition.py <input.yaml> <output.html>")
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

    n = len(data["elements"])
    print(f"✅ 问题定义 generated → {out_path}")
    print(f"   8 要素: {n} · 聚焦环节: {data['meta'].get('segment','—')}")


if __name__ == "__main__":
    main()
