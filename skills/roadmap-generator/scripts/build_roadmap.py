import re
import sys
import os
import datetime
import yaml
from jinja2 import Environment, FileSystemLoader

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
SKILL_ROOT   = os.path.dirname(SCRIPT_DIR)
TEMPLATE_DIR = os.path.join(SKILL_ROOT, "templates")

# ── Theme Constants equivalent to Tailwind Classes ──
PHASE_COLORS = [
    # (Bg-Light, Badge-Bg, Badge-Text)
    ('#f0fdf4', '#dcfce7', '#166534'), # Green
    ('#fefce8', '#fef9c3', '#854d0e'), # Yellow
    ('#faf5ff', '#f3e8ff', '#6b21a8'), # Purple
    ('#f8fafc', '#f1f5f9', '#1e293b')  # Slate fallback
]

def get_category_color(category: str):
    """Map categories to specific visual brand colors (Blue, Orange, Green, Purple)"""
    cat = str(category or "").strip().lower()
    if any(k in cat for k in ["product", "产品"]):
         return "#dbeafe", "#1e40af" # blue
    elif any(k in cat for k in ["operation", "运营", "商业"]):
         return "#ffedd5", "#9a3412" # orange
    elif any(k in cat for k in ["market", "市场", "增长"]):
         return "#dcfce7", "#166534" # green
    elif any(k in cat for k in ["tech", "技术", "基建", "架构"]):
         return "#f3e8ff", "#6b21a8" # purple
    return "#f3f4f6", "#1f2937" # gray


def load_yaml_robust(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    cleaned = re.sub(r"^\s*```(?:yaml|yml)?\s*\n", "", raw, flags=re.MULTILINE)
    cleaned = re.sub(r"\n\s*```\s*$", "", cleaned, flags=re.MULTILINE)
    return yaml.safe_load(cleaned.strip())

def ensure_list(val, default_type=dict) -> list:
    if not val: return []
    if isinstance(val, list): return val
    if isinstance(val, default_type): return [val]
    if default_type == str: return [str(val)]
    return []

def safe_string(val) -> str:
    return str(val or "").strip()

def process_phases(raw_phases: list) -> list:
    phases = []
    for idx, p in enumerate(raw_phases):
        # Assign thematic colors to phases
        color_tuple = PHASE_COLORS[idx % 3]
        phase = {
            'name': safe_string(p.get('name', f"阶段 {idx+1}")),
            'description': safe_string(p.get('description', '')),
            'timeframe': safe_string(p.get('timeframe', '')),
            '_bg_color': color_tuple[0],
            '_tag_bg': color_tuple[1],
            '_tag_text': color_tuple[2],
            'objectives': [],
            'metrics': [],
            'initiatives': []
        }
        
        # Flatten structure defensively
        for obj in ensure_list(p.get('objectives'), dict):
             phase['objectives'].append({
                 'category': safe_string(obj.get('category')),
                 'description': safe_string(obj.get('description')),
                 'name': safe_string(obj.get('name'))
             })
             
        for met in ensure_list(p.get('metrics'), dict):
             phase['metrics'].append({
                 'name': safe_string(met.get('name')),
                 'target': safe_string(met.get('target', ''))
             })
             
        for init in ensure_list(p.get('initiatives'), dict):
             cat = safe_string(init.get('category'))
             bg_col, txt_col = get_category_color(cat)
             phase['initiatives'].append({
                 'name': safe_string(init.get('name')),
                 'description': safe_string(init.get('description')),
                 'category': cat,
                 '_cat_bg': bg_col,
                 '_cat_text': txt_col,
                 'action_items': ensure_list(init.get('items'), str)
             })

        phases.append(phase)
    return phases

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_roadmap.py <input.yaml> <output.html>")
        sys.exit(1)

    input_yaml, output_html = sys.argv[1], sys.argv[2]
    os.makedirs(os.path.dirname(os.path.abspath(output_html)), exist_ok=True)

    try:
        data = load_yaml_robust(input_yaml)
    except yaml.YAMLError as e:
        print(f"❌ YAML parse error: {e}")
        sys.exit(1)

    title = safe_string(data.get("title", '业务路线图'))
    description = safe_string(data.get("description", ''))
    
    config = data.get("configuration", {})
    if not isinstance(config, dict): config = {}
    timeframe = safe_string(config.get('timeframe', ''))
    lastUpdated = safe_string(config.get('lastUpdated', ''))

    phases = process_phases(ensure_list(data.get("phases"), dict))

    # Read raw yaml for embedding
    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    ctx = {
        "title": title,
        "description": description,
        "timeframe": timeframe,
        "lastUpdated": lastUpdated,
        "phases": phases,
        "generated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "raw_yaml": raw_yaml_content
    }

    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    template = env.get_template("roadmap_layout.html")

    html = template.render(**ctx)

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅  Roadmap Plan generated → {output_html}")
    print(f"    Phases: {len(phases)}")

if __name__ == "__main__":
    main()
