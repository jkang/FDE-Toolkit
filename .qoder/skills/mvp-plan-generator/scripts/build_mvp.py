import sys
import yaml
import os
import json
from jinja2 import Environment, FileSystemLoader

def check_circular_deps(cards_map):
    # Simple DFS to check for circular dependencies
    visited = set()
    path = set()

    def visit(card_id):
        if card_id in path: return True
        if card_id in visited: return False
        
        visited.add(card_id)
        path.add(card_id)
        
        deps = cards_map.get(card_id, {}).get('dependencies', [])
        for dep in deps:
            if visit(dep): return True
            
        path.remove(card_id)
        return False

    for cid in cards_map:
        if visit(cid): return True
    return False

def build_mvp(input_yaml, output_html):
    # Load YAML data
    try:
        with open(input_yaml, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
    except Exception as e:
        print(f"Error loading YAML: {e}")
        return

    # Global cards map for dependency validation
    all_cards_map = {}
    
    # Pre-process iterations
    iterations = data.get('iterations', [])
    for iteration in iterations:
        cards = iteration.get('cards', [])
        for card in cards:
            all_cards_map[card.get('id')] = card

    # Check for circular deps
    if check_circular_deps(all_cards_map):
        print("Warning: Circular dependencies detected in the plan!")

    # Post-processing stats and counts
    total_cards_count = 0
    for iteration in iterations:
        cards = iteration.get('cards', [])
        total_cards_count += len(cards)
        
        # Recalculate counts to ensure accuracy
        u_count = sum(1 for c in cards if c.get('type') == 'userStory')
        s_count = sum(1 for c in cards if c.get('type') == 'supportingRequirement')
        
        iteration['userStoryCount'] = u_count
        iteration['supportingCount'] = s_count

    # Ensure stats exist
    if 'stats' not in data:
        data['stats'] = {}
    
    data['stats']['totalCards'] = total_cards_count
    data['stats']['totalIterations'] = len(iterations)
    data['stats']['teamCapacity'] = data.get('config', {}).get('teamCapacity', 5)

    # Setup Jinja2
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_dir = os.path.join(os.path.dirname(script_dir), 'templates')
    
    # Read raw yaml for embedding
    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    try:
        env = Environment(loader=FileSystemLoader(template_dir))
        template = env.get_template('mvp_layout.html')
        html_content = template.render(data=data, raw_yaml=raw_yaml_content)
    except Exception as e:
        print(f"Error rendering template: {e}")
        return

    # Save to file
    with open(output_html, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"Successfully optimized and generated MVP Plan: {output_html}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 build_mvp.py <input.yaml> <output.html>")
    else:
        build_mvp(sys.argv[1], sys.argv[2])
