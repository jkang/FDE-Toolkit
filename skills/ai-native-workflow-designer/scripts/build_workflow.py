"""
build_workflow.py ── AI-Native Workflow Designer Compiler
Usage: python3 scripts/build_workflow.py <input.yaml> <output.html>
"""

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
    cleaned = re.sub(r"^\s*```(?:yaml|yml)?\s*\n", "", raw, flags=re.MULTILINE)
    cleaned = re.sub(r"\n\s*```\s*$", "", cleaned, flags=re.MULTILINE)
    return yaml.safe_load(cleaned.strip())

def ensure_list(val) -> list:
    if not val:
        return []
    if isinstance(val, list):
        return val
    return [val]

def ensure_str(val) -> str:
    if val is None:
        return ""
    return str(val)

def get_actor_styles(actor: str):
    a = actor.lower().strip()
    if a == 'ai':
        return {"icon": "🤖", "color_class": "bg-indigo-500/10 border-indigo-500", "text_class": "text-indigo-400"}
    elif a == 'human':
        return {"icon": "👤", "color_class": "bg-emerald-500/10 border-emerald-500", "text_class": "text-emerald-400"}
    elif a == 'hybrid':
        return {"icon": "🤝", "color_class": "bg-fuchsia-500/10 border-fuchsia-500", "text_class": "text-fuchsia-400"}
    return {"icon": "⚙️", "color_class": "bg-slate-500/10 border-slate-500", "text_class": "text-slate-400"}

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_workflow.py <input.yaml> <output.html>")
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

    # Pre-process data
    phases = ensure_list(data.get("phases"))
    processed_phases = []
    
    total_nodes = 0
    ai_nodes = 0
    human_nodes = 0
    hybrid_nodes = 0

    for phase in phases:
        nodes = ensure_list(phase.get("nodes"))
        processed_nodes = []
        for node in nodes:
            actor = ensure_str(node.get("actor", ""))
            styles = get_actor_styles(actor)
            
            node_data = {
                "name": ensure_str(node.get("name")),
                "actor": actor.upper(),
                "icon": styles["icon"],
                "color_class": styles["color_class"],
                "text_class": styles["text_class"],
                "action_description": ensure_str(node.get("action_description")),
                "ai_capability": ensure_str(node.get("ai_capability")),
                "automation_level": ensure_str(node.get("automation_level")).upper(),
                "inputs": ensure_list(node.get("inputs")),
                "outputs": ensure_list(node.get("outputs")),
                "human_touchpoint": ensure_str(node.get("human_touchpoint")),
                "expert_review": ensure_str(node.get("expert_review")),
            }
            processed_nodes.append(node_data)
            
            total_nodes += 1
            if actor.lower() == 'ai': ai_nodes += 1
            elif actor.lower() == 'human': human_nodes += 1
            elif actor.lower() == 'hybrid': hybrid_nodes += 1

        processed_phases.append({
            "name": ensure_str(phase.get("name")),
            "description": ensure_str(phase.get("description")),
            "nodes": processed_nodes
        })

    # Render template
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    try:
        template = env.get_template("workflow_layout.html")
    except Exception as e:
        print(f"❌ Template error: {e}")
        sys.exit(1)

    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    html = template.render(
        lang="zh-CN",
        title=ensure_str(data.get("title", "AI-Native 工作流设计")),
        business_type=ensure_str(data.get("business_type")),
        description=ensure_str(data.get("description")),
        generated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        phases=processed_phases,
        stats={
            "total": total_nodes,
            "ai": ai_nodes,
            "human": human_nodes,
            "hybrid": hybrid_nodes
        },
        raw_yaml=raw_yaml_content,
    )

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ AI-Native Workflow generated → {output_html}")
    print(f"   Total Nodes: {total_nodes} (AI: {ai_nodes}, Human: {human_nodes}, Hybrid: {hybrid_nodes})")

if __name__ == "__main__":
    main()
