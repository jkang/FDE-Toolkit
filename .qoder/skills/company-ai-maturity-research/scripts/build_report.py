"""
build_report.py ── AI Maturity Assessment Report Compiler
Usage: python3 scripts/build_report.py <input.yaml> <output.html>
"""

import re
import sys
import os
import datetime
import yaml
from jinja2 import Environment, FileSystemLoader

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
SKILL_ROOT   = os.path.dirname(SCRIPT_DIR)
TEMPLATE_DIR = os.path.join(SKILL_ROOT, "templates")

# ── Color palette ──────────────────────────────────────────────
COLORS = {
    "navy":       "#003A70",
    "mck_blue":   "#0077C8",
    "light_blue": "#E8F4FD",
    "gray":       "#5A6570",
    "light_gray": "#F0F2F5",
    "white":      "#FFFFFF",
    "ivory":      "#F5F7FA",
    "success":    "#10B981",
    "warning":    "#F59E0B",
    "danger":     "#EF4444",
    "info":       "#6366F1",
}

SCORE_LABELS = {1: "观望者", 2: "起步者", 3: "跟进者", 4: "先进者", 5: "领先者"}
SCORE_COLORS = {1: "#EF4444", 2: "#F59E0B", 3: "#FBBF24", 4: "#10B981", 5: "#0077C8"}

SEVERITY_ICONS = {"高": "⚠️", "中": "⚡", "低": "ℹ️"}


def load_yaml_robust(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    cleaned = re.sub(r"^\s*```(?:yaml|yml)?\s*\n", "", raw, flags=re.MULTILINE)
    cleaned = re.sub(r"\n\s*```\s*$", "", cleaned, flags=re.MULTILINE)
    return yaml.safe_load(cleaned.strip())


def ensure_str(val) -> str:
    if val is None:
        return ""
    return str(val)


def ensure_list(val) -> list:
    if not val:
        return []
    if isinstance(val, list):
        return val
    return [val]


def ensure_dict(val) -> dict:
    if not val or not isinstance(val, dict):
        return {}
    return val


def safe_get(d: dict, key: str, default=None):
    return d.get(key, default)


def format_score_bar(score: int) -> dict:
    """Generate CSS properties for a score bar."""
    score = max(1, min(5, int(score)))
    pct = score * 20
    return {
        "pct": pct,
        "color": SCORE_COLORS.get(score, "#5A6570"),
        "label": SCORE_LABELS.get(score, "未知"),
    }


def normalize_company(data: dict) -> dict:
    c = ensure_dict(data.get("company", {}))
    ind = ensure_dict(c.get("industry", {}))
    return {
        "name": ensure_str(c.get("name", "")),
        "name_en": ensure_str(c.get("name_en", "")),
        "headquarters": ensure_str(c.get("headquarters", "")),
        "founded": c.get("founded", ""),
        "employee_count": ensure_str(c.get("employee_count", "")),
        "revenue_range": ensure_str(c.get("revenue_range", "")),
        "funding_stage": ensure_str(c.get("funding_stage", "")),
        "website": ensure_str(c.get("website", "")),
        "industry": {"primary": ensure_str(ind.get("primary", "")), "secondary": ensure_list(ind.get("secondary", []))},
        "business_model": ensure_str(c.get("business_model", "")),
        "core_products": ensure_list(c.get("core_products", [])),
        "key_executives": [{"name": ensure_str(e.get("name", "")), "title": ensure_str(e.get("title", "")), "background": ensure_str(e.get("background", ""))} for e in ensure_list(c.get("key_executives", [])) if isinstance(e, dict)],
    }


def normalize_digital_maturity(data: dict) -> dict:
    dm = ensure_dict(data.get("digital_maturity", {}))
    dims = ensure_dict(dm.get("dimensions", {}))
    dim_keys = ["cloud_adoption", "system_integration", "data_infrastructure", "process_automation", "digital_talent_density"]
    dim_labels = {"cloud_adoption": "云化程度", "system_integration": "系统集成", "data_infrastructure": "数据基础", "process_automation": "流程自动化", "digital_talent_density": "人才密度"}
    
    dimensions = []
    for k in dim_keys:
        d = ensure_dict(dims.get(k, {}))
        sc = int(d.get("score", 1))
        bar = format_score_bar(sc)
        dimensions.append({"key": k, "label": dim_labels[k], "score": sc, "bar_pct": bar["pct"], "bar_color": bar["color"], "label_text": bar["label"], "description": ensure_str(d.get("description", "")), "evidence": ensure_str(d.get("evidence", ""))})
    
    overall_sc = int(dm.get("overall_score", 1))
    overall_bar = format_score_bar(overall_sc)
    
    return {
        "overall_score": overall_sc,
        "overall_bar_pct": overall_bar["pct"],
        "overall_bar_color": overall_bar["color"],
        "overall_label": overall_bar["label"],
        "dimensions": dimensions,
        "key_systems": [{"name": ensure_str(s.get("name", "")), "category": ensure_str(s.get("category", "")), "status": ensure_str(s.get("status", "")), "description": ensure_str(s.get("description", ""))} for s in ensure_list(dm.get("key_systems", [])) if isinstance(s, dict)],
        "tech_debt_notes": ensure_str(dm.get("tech_debt_notes", "")),
    }


def normalize_ai_current_state(data: dict) -> dict:
    acs = ensure_dict(data.get("ai_current_state", {}))
    team = ensure_dict(acs.get("ai_team", {}))
    
    use_cases = []
    for uc in ensure_list(acs.get("use_cases", [])):
        if isinstance(uc, dict):
            sc = int(uc.get("maturity", 1))
            use_cases.append({"name": ensure_str(uc.get("name", "")), "category": ensure_str(uc.get("category", "")), "status": ensure_str(uc.get("status", "")), "maturity": sc, "maturity_bar_pct": sc * 20, "maturity_bar_color": SCORE_COLORS.get(sc, "#5A6570"), "maturity_label": SCORE_LABELS.get(sc, ""), "description": ensure_str(uc.get("description", "")), "department": ensure_str(uc.get("department", ""))})
    
    ts = ensure_dict(acs.get("tech_stack", {}))
    
    return {
        "overall_maturity": int(acs.get("overall_maturity", 1)),
        "ai_team": {"exists": team.get("exists", False), "headcount": ensure_str(team.get("headcount", "")), "organization": ensure_str(team.get("organization", "")), "key_roles": ensure_list(team.get("key_roles", []))},
        "use_cases": use_cases,
        "tech_stack": {"model_platform": ensure_str(ts.get("model_platform", "")), "mlops_tools": ensure_str(ts.get("mlops_tools", "")), "llm_usage": ensure_str(ts.get("llm_usage", "")), "key_vendors": ensure_list(ts.get("key_vendors", []))},
        "recent_investments": ensure_str(acs.get("recent_investments", "")),
        "ai_talent_gap": ensure_str(acs.get("ai_talent_gap", "")),
    }


def normalize_ai_strategy(data: dict) -> dict:
    ast = ensure_dict(data.get("ai_strategy", {}))
    return {
        "vision_statement": ensure_str(ast.get("vision_statement", "")),
        "ambition_level": ensure_str(ast.get("ambition_level", "")),
        "stated_initiatives": ensure_list(ast.get("stated_initiatives", [])),
        "investment_priority_areas": ensure_list(ast.get("investment_priority_areas", [])),
        "organizational_intent": ensure_str(ast.get("organizational_intent", "")),
        "regulatory_stance": ensure_str(ast.get("regulatory_stance", "")),
        "executive_quotes": [{"quote": ensure_str(eq.get("quote", "")), "source": ensure_str(eq.get("source", "")), "date": ensure_str(eq.get("date", "")), "implication": ensure_str(eq.get("implication", ""))} for eq in ensure_list(ast.get("executive_quotes", [])) if isinstance(eq, dict)],
        "strategic_contradictions": ensure_str(ast.get("strategic_contradictions", "")),
    }


def normalize_industry_benchmark(data: dict) -> dict:
    ib = ensure_dict(data.get("industry_benchmark", {}))
    md = ensure_dict(ib.get("maturity_distribution", {}))
    
    return {
        "industry_name": ensure_str(ib.get("industry_name", "")),
        "ai_adoption_rate": ensure_str(ib.get("ai_adoption_rate", "")),
        "maturity_distribution": {"leaders_pct": md.get("leaders_pct", 0), "advanced_pct": md.get("advanced_pct", 0), "followers_pct": md.get("followers_pct", 0), "beginners_pct": md.get("beginners_pct", 0), "observers_pct": md.get("observers_pct", 0)},
        "industry_specific_opportunities": [{"opportunity": ensure_str(o.get("opportunity", "")), "potential_impact": ensure_str(o.get("potential_impact", "")), "description": ensure_str(o.get("description", ""))} for o in ensure_list(ib.get("industry_specific_opportunities", [])) if isinstance(o, dict)],
        "industry_challenges": [{"challenge": ensure_str(c.get("challenge", "")), "severity": ensure_str(c.get("severity", "")), "description": ensure_str(c.get("description", ""))} for c in ensure_list(ib.get("industry_challenges", [])) if isinstance(c, dict)],
        "benchmark_companies": [{"name": ensure_str(bc.get("name", "")), "ai_maturity_score": bc.get("ai_maturity_score", 1), "key_differentiator": ensure_str(bc.get("key_differentiator", "")), "relevance": ensure_str(bc.get("relevance", ""))} for bc in ensure_list(ib.get("benchmark_companies", [])) if isinstance(bc, dict)],
        "company_relative_position": ensure_dict(ib.get("company_relative_position", {})),
    }


def normalize_gap_opportunity(data: dict) -> dict:
    go = ensure_dict(data.get("gap_opportunity", {}))
    return {
        "gap_summary": ensure_str(go.get("gap_summary", "")),
        "quantitative_gaps": [{"dimension": ensure_str(g.get("dimension", "")), "current_level": ensure_str(g.get("current_level", "")), "industry_benchmark": ensure_str(g.get("industry_benchmark", "")), "gap_size": ensure_str(g.get("gap_size", "")), "description": ensure_str(g.get("description", ""))} for g in ensure_list(go.get("quantitative_gaps", [])) if isinstance(g, dict)],
        "quick_wins": [{"name": ensure_str(qw.get("name", "")), "category": ensure_str(qw.get("category", "")), "estimated_timeline": ensure_str(qw.get("estimated_timeline", "")), "estimated_impact": ensure_str(qw.get("estimated_impact", "")), "prerequisites": ensure_list(qw.get("prerequisites", [])), "description": ensure_str(qw.get("description", ""))} for qw in ensure_list(go.get("quick_wins", [])) if isinstance(qw, dict)],
        "strategic_bets": [{"name": ensure_str(sb.get("name", "")), "category": ensure_str(sb.get("category", "")), "estimated_timeline": ensure_str(sb.get("estimated_timeline", "")), "estimated_impact": ensure_str(sb.get("estimated_impact", "")), "risk_level": ensure_str(sb.get("risk_level", "")), "description": ensure_str(sb.get("description", ""))} for sb in ensure_list(go.get("strategic_bets", [])) if isinstance(sb, dict)],
        "risk_flags": [{"risk": ensure_str(r.get("risk", "")), "severity": ensure_str(r.get("severity", "")), "mitigation": ensure_str(r.get("mitigation", ""))} for r in ensure_list(go.get("risk_flags", [])) if isinstance(r, dict)],
    }


def normalize_conversation_strategy(data: dict) -> dict:
    cs = ensure_dict(data.get("conversation_strategy", {}))
    return {
        "meeting_objective": ensure_str(cs.get("meeting_objective", "")),
        "core_narrative": ensure_str(cs.get("core_narrative", "")),
        "key_topics": [{"topic": ensure_str(kt.get("topic", "")), "rationale": ensure_str(kt.get("rationale", "")), "angle": ensure_str(kt.get("angle", ""))} for kt in ensure_list(cs.get("key_topics", [])) if isinstance(kt, dict)],
        "probing_questions": [{"priority": pq.get("priority", 1), "question": ensure_str(pq.get("question", "")), "purpose": ensure_str(pq.get("purpose", "")), "expected_response_pattern": ensure_str(pq.get("expected_response_pattern", ""))} for pq in ensure_list(cs.get("probing_questions", [])) if isinstance(pq, dict)],
        "value_proposition_angles": [{"angle": ensure_str(va.get("angle", "")), "talking_points": ensure_list(va.get("talking_points", [])), "target_concern": ensure_str(va.get("target_concern", ""))} for va in ensure_list(cs.get("value_proposition_angles", [])) if isinstance(va, dict)],
        "objection_anticipation": [{"objection": ensure_str(oa.get("objection", "")), "likelihood": ensure_str(oa.get("likelihood", "")), "response_strategy": ensure_str(oa.get("response_strategy", ""))} for oa in ensure_list(cs.get("objection_anticipation", [])) if isinstance(oa, dict)],
    }


def build_radar_data(ai_score: int, digital_score: int, company_data: dict, benchmark_data: dict) -> list:
    """Build 6-axis radar chart data."""
    rel_pos = ensure_dict(benchmark_data.get("company_relative_position", {}))
    md = ensure_dict(benchmark_data.get("maturity_distribution", {}))
    return [
        {"axis": "AI应用", "score": ai_score, "max": 5},
        {"axis": "数字化", "score": digital_score, "max": 5},
        {"axis": "数据基础", "score": int(ensure_str(rel_pos.get("data_maturity", "2")) if rel_pos.get("data_maturity") else 2), "max": 5},
        {"axis": "人才组织", "score": int(ensure_str(rel_pos.get("talent_org", "2")) if rel_pos.get("talent_org") else 2), "max": 5},
        {"axis": "技术平台", "score": int(ensure_str(rel_pos.get("tech_platform", "2")) if rel_pos.get("tech_platform") else 2), "max": 5},
        {"axis": "战略治理", "score": int(ensure_str(rel_pos.get("strategy_governance", "2")) if rel_pos.get("strategy_governance") else 2), "max": 5},
    ]


IMPACT_CLASS = {"高": "impact-high", "中": "impact-mid", "低": "impact-low"}


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_report.py <input.yaml> <output.html>")
        sys.exit(1)

    input_yaml, output_html = sys.argv[1], sys.argv[2]
    os.makedirs(os.path.dirname(os.path.abspath(output_html)), exist_ok=True)

    try:
        raw_data = load_yaml_robust(input_yaml)
    except yaml.YAMLError as e:
        print(f"❌ YAML parse error: {e}")
        sys.exit(1)

    if not raw_data or not isinstance(raw_data, dict):
        print("❌ Invalid YAML data (not a dict).")
        sys.exit(1)

    company     = normalize_company(raw_data)
    digital     = normalize_digital_maturity(raw_data)
    ai_current  = normalize_ai_current_state(raw_data)
    ai_strategy = normalize_ai_strategy(raw_data)
    benchmark   = normalize_industry_benchmark(raw_data)
    gap_opp     = normalize_gap_opportunity(raw_data)
    conv_strat  = normalize_conversation_strategy(raw_data)

    radar_data  = build_radar_data(ai_current["overall_maturity"], digital["overall_score"], company, benchmark)

    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    template = env.get_template("report_layout.html")

    # Read raw yaml for embedding
    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    html = template.render(
        lang="zh-CN",
        title=f"AI 就绪度战略简报 — {company['name']}",
        generated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        colors=COLORS,
        SCORE_LABELS=SCORE_LABELS,
        SCORE_COLORS=SCORE_COLORS,
        impact_class=IMPACT_CLASS,
        severity_icons=SEVERITY_ICONS,
        company=company,
        digital=digital,
        ai_current=ai_current,
        ai_strategy=ai_strategy,
        benchmark=benchmark,
        gap_opp=gap_opp,
        conv_strat=conv_strat,
        radar_data=radar_data,
        raw_yaml=raw_yaml_content,
    )

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅  AI Maturity Assessment Report generated → {output_html}")
    print(f"    Company           : {company['name']}")
    print(f"    AI Maturity       : {ai_current['overall_maturity']}/5 ({SCORE_LABELS[ai_current['overall_maturity']]})")
    print(f"    Digital Maturity  : {digital['overall_score']}/5 ({digital['overall_label']})")
    print(f"    Use Cases         : {len(ai_current['use_cases'])}")
    print(f"    Benchmark Peers   : {len(benchmark['benchmark_companies'])}")
    print(f"    Probing Questions : {len(conv_strat['probing_questions'])}")


if __name__ == "__main__":
    main()
