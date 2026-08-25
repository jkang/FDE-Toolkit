"""
build_rule_miner.py ── business-rule-miner Compiler
将「业务规则挖掘 YAML」编译为「五类任务处理规则 HTML 报告」。

Usage:
    python3 scripts/build_rule_miner.py <input.yaml> <output.html>

设计要点：
- 数据契约见 references/schema.yaml：meta / overview / legend /
  categories{decision,template,dictionary,extraction,relation} / reconciliation。
- 视觉配色遵循 skills/design.md 的 Inspire 品牌标量（Starry Blues #10213E、
  Amethyst #625D9C、Creative Blue #5DB2E2、Myrtle Deep Green #00524C 等）+ 统一精简页眉。
- 遵循 agent.md §5.1：Jinja 内联样式隐患通过「类 + 安全拼接」规避。
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


# --------------------------------------------------------------------------- #
# 工具函数
# --------------------------------------------------------------------------- #
def load_yaml_robust(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
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


# --------------------------------------------------------------------------- #
# 主流程
# --------------------------------------------------------------------------- #
def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_rule_miner.py <input.yaml> <output.html>")
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
    overview = data.get("overview") or {}
    legend = data.get("legend") or {}
    categories = data.get("categories") or {}

    # 自动用数组长度覆盖 overview 统计，避免手工填写不一致
    decision = ensure_list(categories.get("decision"))
    template = ensure_list(categories.get("template"))
    dictionary = ensure_list(categories.get("dictionary"))
    extraction = ensure_list(categories.get("extraction"))
    relation = ensure_list(categories.get("relation"))
    reconciliation = ensure_list(data.get("reconciliation"))

    render_overview = dict(overview)
    render_overview["decisionCount"] = len(decision)
    render_overview["templateCount"] = len(template)
    render_overview["dictionaryCount"] = len(dictionary)
    render_overview["extractionCount"] = len(extraction)
    render_overview["relationCount"] = len(relation)
    render_overview["ruleCount"] = (
        len(decision) + len(template) + len(dictionary) + len(extraction) + len(relation)
    )

    legend_rule_types = ensure_list(legend.get("ruleTypes"))
    legend_binding_note = ensure_str(legend.get("bindingNote"))
    legend_conflict_note = ensure_str(legend.get("conflictNote"))

    # ---- 渲染 ---- #
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    template_obj = env.get_template("rule_mining_layout.html")

    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    html = template_obj.render(
        lang="zh-CN",
        title=ensure_str(meta.get("title", "业务规则挖掘清单")),
        subtitle=ensure_str(meta.get("subtitle", "来自 SKP 阶段2 · 任务处理规则挖掘")),
        version=ensure_str(meta.get("version", "")),
        date=ensure_str(meta.get("date", "")),
        scenario_name=ensure_str(meta.get("scenarioName", "")),
        business_stage=ensure_str(meta.get("businessStage", "")),
        methodology=ensure_str(meta.get("methodology", "")),
        inputs=ensure_list(meta.get("inputs")),
        source_ref=ensure_str(meta.get("sourceRef", "")),
        kpi=ensure_list(meta.get("kpi")),
        overview=render_overview,
        legend_rule_types=legend_rule_types,
        legend_binding_note=legend_binding_note,
        legend_conflict_note=legend_conflict_note,
        decision=decision,
        template=template,
        dictionary=dictionary,
        extraction=extraction,
        relation=relation,
        reconciliation=reconciliation,
        generated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        raw_yaml=raw_yaml_content,
    )

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ Business Rule Mining generated → {output_html}")
    print(f"   Rules: 决策 {len(decision)} / 模板 {len(template)} / 字典 {len(dictionary)} / 提取 {len(extraction)} / 关联 {len(relation)}")
    print(f"   Reconciliation: {len(reconciliation)} 条交叉核对")


if __name__ == "__main__":
    main()
