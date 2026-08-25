"""
build_milestone.py  ──  Milestone Plan Generator
Usage: python3 scripts/build_milestone.py <input.yaml> <output.html>

Architecture:
  1. Robust YAML parsing (stripping code blocks)
  2. Data normalization (type guards, list enforcement)
  3. Collision detection algorithm (frontend absolute positioning logic shifted to backend)
  4. Dynamic styling assignment (team colors, milestone tags)
  5. Jinja2 template rendering
"""

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

# ── Layout & Style Constants ──
TASK_HEIGHT = 36
TASK_GAP = 6
MIN_LANE_HEIGHT = 80 # px

# Colors equivalent to React lib/milestone-styles.ts
TEAM_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f97316', '#06b6d4', '#475569']
MILESTONE_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
ICONS_MAP = {
    "Database": "M5 4h14c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM5 8h14M5 12h14M5 16h14",
    "Smartphone": "M5 2h14c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zM12 18h.01",
    "Brain": "M12 3a4 4 0 0 1 4 4c0 1.05-.4 2.01-1.07 2.72A3.99 3.99 0 0 1 18 13.5c0 1.83-1.23 3.37-2.92 3.84v.05A2.6 2.6 0 0 1 12.5 20h-1a2.6 2.6 0 0 1-2.58-2.61v-.05A3.98 3.98 0 0 1 6 13.5c0-.85.27-1.64.73-2.28A4 4 0 0 1 8 5h.07C8.75 3.84 10.28 3 12 3z",
    "Globe": "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    "Shield": "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    "Users": "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    "Server": "M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm0 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4zm4-2h.01M6 20h.01",
    "Cloud": "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",
    "Code": "M16 18l6-6-6-6M8 6l-6 6 6 6",
    "Blocks": "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
}


# ══════════════════════════════════════════════════════════════════════════════
# 1. YAML PARSING & DEFENSIVE PROGRAMMING
# ══════════════════════════════════════════════════════════════════════════════
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
    # Fallback wrapper
    if default_type == str: return [str(val)]
    return []

def safe_string(val) -> str:
    return str(val or "").strip()


# ══════════════════════════════════════════════════════════════════════════════
# 2. COLLISION DETECTION & COORDINATE MAPPING (Frontend Logic in Backend)
# ══════════════════════════════════════════════════════════════════════════════
def calculate_task_layout(teams: list, quarters: list):
    for team_idx, team in enumerate(teams):
        team['_color'] = TEAM_COLORS[team_idx % len(TEAM_COLORS)]
        icon_name = safe_string(team.get('icon', 'Code'))
        team['_icon_path'] = ICONS_MAP.get(icon_name, ICONS_MAP["Code"])
        
        tasks = ensure_list(team.get('tasks'), dict)
        
        # Sort tasks by start quarter index map to ensure natural visual flow
        def get_q_idx(q):
            try: return quarters.index(q)
            except ValueError: return 0
            
        tasks.sort(key=lambda t: get_q_idx(t.get('startQuarter')))
        
        rows = []
        for task in tasks:
            # Defensive mapping: support both 'name' and 'title'
            if 'title' not in task and 'name' in task:
                task['title'] = task['name']
            
            start_q = safe_string(task.get('startQuarter'))
            end_q = safe_string(task.get('endQuarter'))
            
            # Map robustly to quarter indices
            s_idx = get_q_idx(start_q) if start_q else 0
            e_idx = get_q_idx(end_q) if end_q else s_idx
            if e_idx < s_idx: e_idx = s_idx # correct invalid ordering
            
            # Calculate CSS % coordinates with small padding gap
            col_pct = 100.0 / len(quarters) if quarters else 100.0
            task['_left'] = f"calc({s_idx * col_pct}% + 2px)"
            task['_width'] = f"calc({(e_idx - s_idx + 1) * col_pct}% - 4px)"
            
            # Tooltip anchor: if task midpoint is in right half, flip tooltip
            midpoint = (s_idx + e_idx) / 2.0
            task['_is_right_half'] = midpoint >= (len(quarters) / 2.0)
            
            # Find non-overlapping row
            placed = False
            for i, row in enumerate(rows):
                has_overlap = False
                for t in row:
                    ts = t['_s_idx']
                    te = t['_e_idx']
                    # overlap condition: boundaries intersect
                    if not (e_idx < ts or s_idx > te):
                        has_overlap = True
                        break
                if not has_overlap:
                    rows[i].append(task)
                    task['_row_index'] = i
                    task['_s_idx'] = s_idx
                    task['_e_idx'] = e_idx
                    placed = True
                    break
                    
            if not placed:
                task['_row_index'] = len(rows)
                task['_s_idx'] = s_idx
                task['_e_idx'] = e_idx
                rows.append([task])

        rows_count = max(1, len(rows))
        # Total lane height = all rows + gaps - bottom gap
        total_content_height = rows_count * (TASK_HEIGHT + TASK_GAP) - TASK_GAP
        # Ensure lane is at least 80px visual balance
        team['_lane_height'] = max(total_content_height, MIN_LANE_HEIGHT)

    return teams


# ══════════════════════════════════════════════════════════════════════════════
# 3. MAIN COMPILER
# ══════════════════════════════════════════════════════════════════════════════
def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_milestone.py <input.yaml> <output.html>")
        sys.exit(1)

    input_yaml, output_html = sys.argv[1], sys.argv[2]
    os.makedirs(os.path.dirname(os.path.abspath(output_html)), exist_ok=True)

    try:
        data = load_yaml_robust(input_yaml)
    except yaml.YAMLError as e:
        print(f"❌ YAML parse error: {e}")
        sys.exit(1)

    title = safe_string(data.get("title", '路线图规划'))
    subtitle = safe_string(data.get("subtitle", 'Milestone Plan'))
    quarters = ensure_list(data.get("quarters"), str)
    
    # Process Milestones
    milestones = ensure_list(data.get("milestones"), dict)
    for m_idx, m in enumerate(milestones):
        m['_color'] = MILESTONE_COLORS[m_idx % len(MILESTONE_COLORS)]
        # Calc left position
        end_q = m.get('endQuarter')
        try: q_idx = quarters.index(end_q)
        except ValueError: q_idx = 0
        col_pct = 100.0 / len(quarters) if quarters else 100.0
        # Position at the end of the matching quarter
        m['_left'] = f"{(q_idx + 1) * col_pct}%"
        # Type enforcement for sub goals
        m['goals'] = ensure_list(m.get('goals'), dict)

    # Process Teams (Collision Check)
    raw_teams = ensure_list(data.get("teams"), dict)
    teams = calculate_task_layout(raw_teams, quarters)

    # Read raw yaml for embedding
    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    # Context Data
    ctx = {
        "title": title,
        "subtitle": subtitle,
        "quarters": quarters,
        "milestones": milestones,
        "teams": teams,
        "generated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "task_height": TASK_HEIGHT,
        "task_gap": TASK_GAP,
        "raw_yaml": raw_yaml_content
    }

    # Render Jinja2
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=False)
    template = env.get_template("milestone_layout.html")

    html = template.render(**ctx)

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅  Milestone Plan generated → {output_html}")
    print(f"    Quarters: {len(quarters)}")
    print(f"    Teams: {len(teams)}")
    print(f"    Total Tasks: {sum(len(t.get('tasks', [])) for t in teams)}")


if __name__ == "__main__":
    main()
