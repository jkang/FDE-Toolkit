#!/usr/bin/env python3
"""
build_dashboard.py - Unified Report Dashboard Generator
Usage: python3 build_dashboard.py <input.yaml> <output.html>
"""

import re
import sys
import os
import base64
import mimetypes
import yaml
from jinja2 import Environment, FileSystemLoader

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SKILL_ROOT = os.path.dirname(SCRIPT_DIR)
TEMPLATE_DIR = os.path.join(SKILL_ROOT, "templates")

def load_yaml_robust(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    cleaned = re.sub(r"^\s*```(?:yaml|yml)?\s*\n", "", raw, flags=re.MULTILINE)
    cleaned = re.sub(r"\n\s*```\s*$", "", cleaned, flags=re.MULTILINE)
    return yaml.safe_load(cleaned.strip())

def ensure_list(val, default_type=dict) -> list:
    if not val:
        return []
    if isinstance(val, list):
        return val
    if isinstance(val, default_type):
        return [val]
    return []

def safe_string(val) -> str:
    return str(val or "").strip()

def extract_css_from_markdown(content: str) -> str:
    css_blocks = re.findall(r'```css\s*(.*?)\s*```', content, flags=re.DOTALL | re.IGNORECASE)
    if css_blocks:
        return "\n".join(css_blocks)
    style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', content, flags=re.DOTALL | re.IGNORECASE)
    if style_blocks:
        return "\n".join(style_blocks)
    if '```' not in content:
        return content
    return ""

def inline_local_image(src: str, base_dir: str) -> str:
    """把本地相对路径的图片内联为 data URI，使产物 HTML 自包含。
    - data: / http(s): 原样返回；
    - 本地路径存在 → base64 内联；不存在 → 原样返回（便于定位问题）。"""
    if not src or src.startswith(("data:", "http://", "https://")):
        return src
    p = os.path.join(base_dir, src)
    if not os.path.exists(p):
        return src
    mime = mimetypes.guess_type(p)[0] or "image/png"
    with open(p, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f"data:{mime};base64,{b64}"


def build_reports_mapping(cards: list, navigation: list) -> dict:
    reports = {}

    def add(rid, title, file):
        rid = safe_string(rid)
        if rid and rid not in reports:
            reports[rid] = {
                'title': safe_string(title),
                'file': safe_string(file) or None
            }

    def walk(items):
        # 递归支持子章节（item.children）
        for item in ensure_list(items, dict):
            add(item.get('id'), item.get('title'), item.get('file'))
            walk(item.get('children'))

    for card in cards:
        add(card.get('id'), card.get('title'), card.get('file'))
    for nav in navigation:
        # 兼容两种字段名：items（SKILL.md 规范）与 children（schema/历史示例）
        items_field = nav.get('items')
        if items_field is None:
            items_field = nav.get('children', [])
        walk(items_field)
    return reports

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_dashboard.py <input.yaml> <output.html> [design.md]")
        sys.exit(1)

    input_yaml, output_html = sys.argv[1], sys.argv[2]
    design_file = sys.argv[3] if len(sys.argv) >= 4 else None
    
    os.makedirs(os.path.dirname(os.path.abspath(output_html)), exist_ok=True)

    try:
        data = load_yaml_robust(input_yaml)
    except yaml.YAMLError as e:
        print(f"YAML parse error: {e}")
        sys.exit(1)

    cards = ensure_list(data.get("cards"), dict)
    navigation = ensure_list(data.get("navigation"), dict)
    stats = ensure_list(data.get("stats"), dict)
    logo = data.get("logo", {})
    footer = data.get("footer", {})
    exec_summary = data.get("executive_summary", [])
    if isinstance(exec_summary, str):
        exec_summary = [exec_summary]
    exec_summary = ensure_list(exec_summary)
    
    # Use design_file from yaml if not provided via CLI
    if not design_file and data.get("design"):
        design_file = data.get("design")
        
    custom_styles = ""
    if design_file and os.path.exists(design_file):
        with open(design_file, "r", encoding="utf-8") as f:
            custom_styles = extract_css_from_markdown(f.read())
            
    reports = build_reports_mapping(cards, navigation)

    ctx = {
        "title": safe_string(data.get("title", "统一报告仪表盘")),
        "subtitle": safe_string(data.get("subtitle", "")),
        "logo_icon": safe_string(logo.get("icon", "R")),
        "logo_text": safe_string(logo.get("text", "Report")),
        "logo_subtitle": safe_string(logo.get("subtitle", "")),
        "logo_badge": safe_string(logo.get("badge", "")),
        "logo_image": inline_local_image(safe_string(logo.get("image", "")),
                                              os.path.dirname(os.path.abspath(output_html))),
        "cover_title": bool(data.get("cover_title", False)),
        "stats": stats,
        "cards": cards,
        "navigation": navigation,
        "executive_summary": exec_summary,
        "footer_text": safe_string(footer.get("text", "")),
        "footer_subtext": safe_string(footer.get("subtext", "")),
        "reports": reports,
        "custom_styles": custom_styles,
    }

    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=False)
    template = env.get_template("dashboard_layout.html")
    html = template.render(**ctx)

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Dashboard generated: {output_html}")
    print(f"  Cards: {len(cards)}")
    print(f"  Nav sections: {len(navigation)}")
    print(f"  Reports: {len(reports)}")

if __name__ == "__main__":
    main()
